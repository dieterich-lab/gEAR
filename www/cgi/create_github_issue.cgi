#!/usr/local/envs/dhart/bin/python

"""
Creates a Github issue from a submitted comment on the gEAR page.

"""

import cgi, json, os, requests, socket, sys
import configparser

from dotenv import load_dotenv
from requests.exceptions import HTTPError
from pathlib import Path
from uuid import uuid4

from werkzeug.utils import secure_filename

env_path = Path('..') / '.env'  # .env file is in "www" directory
load_dotenv(dotenv_path=env_path)

GITHUB_ACCESS_TOKEN=os.getenv("GITHUB_ACCESS_TOKEN")
GEAR_GIT_URL="https://api.github.com/repos/jorvis/gEAR/issues"
ASSIGNEES=["songeric1107"]

PRIVATE_COL_ID = "8150789"  # "Site Comments" project column to jorvis/gEAR
PUBLIC_COL_ID = "15595055"  # same column but for IGS/gEAR

SITE_COMMENTS_PROJ_URL="https://api.github.com/projects/columns/{}/cards".format(PRIVATE_COL_ID)

SCREENSHOT_DIR = "contact_screenshots"

graphqlurl = 'https://api.github.com/graphql'

def main():

    print('Content-Type: application/json\n\n')
    result = {'error': [], 'success': 0 }

    config = configparser.ConfigParser()
    config.read('../../gear.ini')

    REPO_OWNER =  config['contact_form']['repo_owner']
    PUBLIC_REPO_NAME =  config['contact_form']['public_repo']
    PRIVATE_REPO_NAME =  config['contact_form']['private_repo']
    PUBLIC_PRJ =  config['contact_form']['public_project']
    PRIVATE_PRJ =  config['contact_form']['private_project']
    SITE_DOMAIN_URL = config['contact_form']['domain_url']
    SCREENSHOT_URL = '{}/{}'.format(SITE_DOMAIN_URL,SCREENSHOT_DIR)
    ASSIGNEE = config['contact_form']['assignee']

    form = cgi.FieldStorage()
    firstname = form.getvalue('submitter_firstname')
    lastname = form.getvalue('submitter_lastname')
    email = form.getvalue('submitter_email')
    title = form.getvalue('comment_title')
    comment = form.getvalue('comment')
    tag = form.getvalue('comment_tag')
    screenshot = form.getvalue('screenshot', None)
    private = form.getvalue('private_check')

    if not tag:
        tag = ''

    # Get IP address of the server hosting this CGI script (to determine gEAR flavor)
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)

    # TODO: this should probably go in the config file.
    # Also this assumes all screenshots comes from production
    if "nemo" in hostname:
        SCREENSHOT_URL = "https://nemoanalytics.org/{}".format(SCREENSHOT_DIR)
    elif "gcid" in hostname:
        SCREENSHOT_URL = "https://gcid.umgear.org/{}".format(SCREENSHOT_DIR)

    # If screenshot was provided, get URL and eventually assign to body
    screenshot_url = "None"
    if screenshot and not screenshot == "null":
        ext = os.path.splitext(screenshot)[1]
        new_basename = str(uuid4()) + ext
        src = secure_filename(f"../{SCREENSHOT_DIR}/files/{screenshot}")
        dst = secure_filename(f"../{SCREENSHOT_DIR}/{new_basename}") # Synlink is up a directory
        os.symlink(src, dst)
        screenshot_url = "{}/{}".format(SCREENSHOT_URL, new_basename)

    # In an effort to not blow up the "tags" field in github, I will just indicate the tags in the body of the Github issue
    body = (f"**From:** {firstname} {lastname}\n\n"
           f"**Email:** {email}\n\n"
           f"**Server IP:** {ip_address}\n\n"
           f"**Msg:** {comment}\n\n"
           f"**Tags:** {tag.split(', ')}\n\n"
           f"**Screenshot:** {screenshot_url}"
           )

    # Headers data (i.e. authentication)
    headers = { "Authorization": "token {}".format(GITHUB_ACCESS_TOKEN) }

    # Issue metadata
    data = {
        "title":title,
        "body":body,
        "labels":["site_comment"],
        "assignee":ASSIGNEE
    }

    # If user clicked "private" checkbox, send to private git repo
    git_url = f'https://api.github.com/repos/{REPO_OWNER}/{PRIVATE_REPO_NAME}/issues'
    site_comments_id = PRIVATE_PRJ
    if private == "false":
        # "false" is javascript string "false"
        git_url = f'https://api.github.com/repos/{REPO_OWNER}/{PUBLIC_REPO_NAME}/issues'
        site_comments_id = PUBLIC_PRJ
        site_comments_url = SITE_COMMENTS_PROJ_URL.replace(PRIVATE_COL_ID, PUBLIC_COL_ID)

    # Code from https://realpython.com/python-requests/
    try:
        response = requests.post(git_url, data = json.dumps(data), headers = headers)
        # If the response was successful (200- and 300- level status codes), no Exception will be raised
        response.raise_for_status()
    except HTTPError as http_err:
        result["error"] = f'HTTP error occurred: {http_err}'
    except Exception as err:
        result["error"] = f'Other error occurred: {err}'
    else:
        result["success"] = 1
    print(json.dumps(result))

    # Submission failed :-(
    if result["success"] == 0:
        sys.exit(0)

    # Add to 'site comments' projects board
    # beta project now use the GraphQL API
    # so far I the issue has no status, we can sort this on the project board
    content_id = response.json()["node_id"]  # id of ticket just created (node id)
    query = f'mutation {{addProjectV2ItemById(input: {{projectId: \\"{site_comments_id}\\" contentId: \\"{content_id}\\"}}) {{item{{ id }}}}}}'
    try:
        response = requests.post(graphqlurl, data = '{"query": '+'\"' + query + '\"}', headers = headers)
        # If the response was successful (200- and 300- level status codes), no Exception will be raised
        response.raise_for_status()
    except HTTPError as http_err:
        print("HTTP error occurred{}.\n Count not assign id {} to 'Site Comments' project card".format(http_err, content_id), file=sys.stderr)
    except Exception as err:
        print("Other error occurred{}.\n Count not assign id {} to 'Site Comments' project card".format(err, content_id), file=sys.stderr)



if __name__ == '__main__':
    main()
