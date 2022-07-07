#!/usr/local/envs/dhart/bin/python

"""
Load a subset of information from the GO ontology into the gEAR database
using standard obo file format.

"""

import argparse
import mysql.connector
import configparser
import os, sys
import re

sys.path.append("{0}/../lib".format(os.path.dirname(sys.argv[0])))
import geardb

def main():
    parser = argparse.ArgumentParser( description='')

    ## output file to be written
    parser.add_argument('-i', '--input_file', type=str, required=True, help='Path to an input file to be read' )
    args = parser.parse_args()

    cnx = geardb.Connection()
    cursor = cnx.get_cursor()

    current = dict()

    for line in open(args.input_file):
        line = line.rstrip()

        if line.startswith('[Term]'):
            if 'go_id' in current:
                print("Adding {0} - {1}".format(current['go_id'], current['name']))
                add_ontology_term(cursor, current)
                current = {'go_id':None, 'name':None, 'namespace':None, 'def':None}

            current = dict()

        else:
            m = re.search('^(.+?): (.+)', line)

            if m:
                if m.group(1) == 'id':
                    current['go_id'] = m.group(2)
                elif m.group(1) == 'name':
                    current['name'] = m.group(2)
                elif m.group(1) == 'namespace':
                    current['namespace'] = m.group(2)
                elif m.group(1) == 'def':
                    current['def'] = m.group(2)

    # Don't forget the last one
    if 'id' in current:
        add_ontology_term(cursor, current)

    cnx.commit()
    cursor.close()
    cnx.close()


def add_ontology_term( curs, atts ):
    add_term_sql = ("INSERT INTO go (go_id, name, namespace, def) "
                    "VALUES (%s, %s, %s, %s)")

    curs.execute(add_term_sql, (atts['go_id'], atts['name'], atts['namespace'], atts['def']))

if __name__ == '__main__':
    main()







