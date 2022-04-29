#! /usr/local/envs/dhart/bin/python3

import os
import sys

python_venv = '/usr/local/envs/dhart'
activate_this = os.path.join(python_venv, 'bin', 'activate_this.py')
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))

abs_dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, abs_dir_path)

from api import app as application
