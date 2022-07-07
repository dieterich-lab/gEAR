#!/usr/local/envs/dhart/bin/python

"""

Loads gene synonyms for a given organism based on a passed datafile which looks like this:

Aebp1   ACLP
Aebp2   AU023766|B230313N05Rik
Crisp1  AW324342|Aeg1|CRISP-1|SCP 1
Crisp3  Aeg2|CRISP-3|CRS3|SGP28
Afp     -

A dash is provided when there are no aliases and these rows are skipped.

This script attempts to be intelligent and cache existing entries so no duplicates are
loaded.  It should be re-run safe.

Currently does all releases of that organism's annotation

"""

import argparse
import mysql.connector
import configparser
import os
import re
import sys
import gzip

sys.path.append("{0}/../lib".format(os.path.dirname(sys.argv[0])))
import geardb


# this should match create_schema.sql column length for gene_symbol.label
GENE_SYM_LENGTH_LIMIT = 30

# commits every N inserts (approximately)
COMMIT_INTERVAL = 1000

def main():
    parser = argparse.ArgumentParser( description='Loads gene synonyms.')

    ## output file to be written
    parser.add_argument('-i', '--input_file', type=str, required=True, help='Path to an input file to be read' )
    parser.add_argument('-id', '--organism_id', type=str, required=True, help='Organism ID for which these genes are intended' )
    args = parser.parse_args()

    cnx = geardb.Connection()
    cursor = cnx.get_cursor()

    ingenes = load_user_genes(args.input_file)
    dbgenes = get_primary_data(args.organism_id, cursor)
    add_aliases(dbgenes, cursor, args.organism_id)
    
    add_synonym_sql = ("INSERT INTO gene_symbol (gene_id, label, is_primary) "
                       "VALUES (%s, %s, %s)")

    uncommitted = 0

    for gene_id in dbgenes:
        gene = dbgenes[gene_id]
        
        if gene['primary'] not in gene['aliases']:
            print("INSERTING primary gene symbol {0} for gene_id {1}".format(gene['primary'], gene_id))
            cursor.execute(add_synonym_sql, (gene_id, gene['primary'], 1))
            uncommitted += 1

        # if this gene is in the input file
        if gene['primary'] in ingenes:
            # iterate each gene synonym in the input file for this gene symbol
            for syn in ingenes[gene['primary']]:
                if syn not in gene['aliases']:
                    if len(syn) <= GENE_SYM_LENGTH_LIMIT:
                        print("\tAdding synonym {0} for gene {1}".format(syn, gene['primary']))
                        cursor.execute(add_synonym_sql, (gene_id, syn, 0))
                        uncommitted += 1
                        gene['aliases'].append(syn)
                    else:
                        print("\tWARNING: Skipping synonym {0} for gene {1} because it's too long".format(syn, gene['primary']))

        if uncommitted >= COMMIT_INTERVAL:
            cnx.commit()
            uncommitted = 0
                        
    cnx.commit()
    cursor.close()
    cnx.close()


def add_aliases(g, cursor, org_id):
    print("INFO: Caching gene aliases ... ", file=sys.stderr, end='')
    
    sql = """
    SELECT gs.gene_id, gs.label
      FROM gene_symbol gs
           JOIN gene g ON g.id=gs.gene_id
     WHERE g.organism_id = %s
    """

    cursor.execute(sql, (org_id,))
    
    for (gene_id, label) in cursor:
        g[gene_id]['aliases'].append(label)

    print("done.", file=sys.stderr)
    
    
def get_primary_data(org_id, cursor):
    print("INFO: Caching primary genes ... ", file=sys.stderr, end='')
    
    sql = """
    SELECT id, gene_symbol
      FROM gene
     WHERE organism_id = %s
    """

    cursor.execute(sql, (org_id,))

    genes = dict()

    for row in cursor:
        genes[row[0]] = { 'primary': row[1], 'aliases': [] }

    print("done.", file=sys.stderr)

    return genes
    
def load_user_genes(infile):
    # keyed on gene symbol, and each value is a list of aliases
    
    idx1 = 2
    idx2 = 4
    
    genes = dict()

    gfile = gzip.open(infile, 'rt')
    next(gfile)
    
    for line in gfile:
        line = line.rstrip()
        cols = line.split()

        primary = cols[idx1]
        
        if primary in genes:
            print("Error: duplicate primary gene symbols in input file: {0}".format(primary), file=sys.stderr)
            continue

        if cols[idx2] != '-' and cols[idx2] != '':
            if '|' in cols[idx2]:
                genes[primary] = cols[idx2].split('|')
            else:
                genes[primary] = [cols[idx2]]

    return genes

if __name__ == '__main__':
    main()







