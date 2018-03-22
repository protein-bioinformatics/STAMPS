#!/usr/bin/python3


import json
from pymysql import connect, cursors
import cgi, cgitb
import zlib
import gzip
import sys
import os
import binascii


conf = {}
with open("../qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")


conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()


del_entries = len(sys.argv) > 1 and sys.argv[1] == "del"


sql_query = "SELECT id FROM metabolites;"
my_cur.execute(sql_query)
metabolite_ids = set([entry[0] for entry in my_cur])

sql_query = "SELECT id FROM proteins;"
my_cur.execute(sql_query)
protein_ids = set([entry[0] for entry in my_cur])

sql_query = "SELECT id FROM pathways;"
my_cur.execute(sql_query)
pathway_ids = set([entry[0] for entry in my_cur])

sql_query = "SELECT id FROM labels;"
my_cur.execute(sql_query)
label_ids = set([entry[0] for entry in my_cur])

sql_query = "SELECT id FROM function_names;"
my_cur.execute(sql_query)
function_ids = set([entry[0] for entry in my_cur])

sql_query = "SELECT id FROM loci_names;"
my_cur.execute(sql_query)
locus_ids = set([entry[0] for entry in my_cur])




sql_query = "SELECT pathway_id FROM nodes;"
my_cur.execute(sql_query)
node_foreign_pathway_ids = set([entry[0] for entry in my_cur])
if len(node_foreign_pathway_ids - pathway_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM nodes WHERE pathway_id NOT IN (SELECT id FROM pathways);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: pathway_id in nodes ->", (node_foreign_pathway_ids - pathway_ids))


sql_query = "SELECT foreign_id FROM nodes WHERE type = 'pathway';"
my_cur.execute(sql_query)
node_foreign_pathway_ids = set([entry[0] for entry in my_cur])
if len(node_foreign_pathway_ids - pathway_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM nodes WHERE type = 'pathway' and foreign_id NOT IN (SELECT id FROM pathways);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: foreign_id (pathway) in nodes ->", (node_foreign_pathway_ids - pathway_ids))

sql_query = "SELECT foreign_id FROM nodes WHERE type = 'metabolites';"
my_cur.execute(sql_query)
node_foreign_metabolite_ids = set([entry[0] for entry in my_cur])
if len(node_foreign_metabolite_ids - metabolite_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM nodes WHERE type = 'metabolite' and foreign_id NOT IN (SELECT id FROM metabolites);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: foreign_id (metabolite) in nodes ->", (node_foreign_metabolite_ids - metabolite_ids))

sql_query = "SELECT foreign_id FROM nodes WHERE type = 'label';"
my_cur.execute(sql_query)
node_foreign_label_ids = set([entry[0] for entry in my_cur])
if len(node_foreign_label_ids - label_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM nodes WHERE type = 'label' and foreign_id NOT IN (SELECT id FROM labels);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: foreign_id (labels) in nodes ->", (node_foreign_label_ids - label_ids))


sql_query = "SELECT id FROM nodes;"
my_cur.execute(sql_query)
node_ids = set([entry[0] for entry in my_cur])



sql_query = "SELECT node_id FROM nodeproteincorrelations;"
my_cur.execute(sql_query)
nodeproteincorrelations_foreign_node_ids = set([entry[0] for entry in my_cur])
if len(nodeproteincorrelations_foreign_node_ids - node_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM nodeproteincorrelations WHERE node_id NOT IN (SELECT id FROM nodes);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: node_id in nodeproteincorrelations ->", (nodeproteincorrelations_foreign_node_ids - node_ids))


sql_query = "SELECT protein_id FROM nodeproteincorrelations;"
my_cur.execute(sql_query)
nodeproteincorrelations_foreign_protein_ids = set([entry[0] for entry in my_cur])
if len(nodeproteincorrelations_foreign_protein_ids - protein_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM nodeproteincorrelations WHERE protein_id NOT IN (SELECT id FROM proteins);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: protein_id in nodeproteincorrelations ->", (nodeproteincorrelations_foreign_protein_ids - protein_ids))




sql_query = "SELECT protein_id FROM protein_functions;"
my_cur.execute(sql_query)
protein_functions_foreign_protein_ids = set([entry[0] for entry in my_cur])
if len(protein_functions_foreign_protein_ids - protein_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM protein_functions WHERE protein_id NOT IN (SELECT id FROM proteins);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: protein_id in protein_functions ->", (protein_functions_foreign_protein_ids - protein_ids))

sql_query = "SELECT function_id FROM protein_functions;"
my_cur.execute(sql_query)
protein_functions_foreign_function_ids = set([entry[0] for entry in my_cur])
if len(protein_functions_foreign_function_ids - function_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM protein_functions WHERE function_id NOT IN (SELECT id FROM protein_functions);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: function_id in protein_functions ->", (protein_functions_foreign_function_ids - function_ids))




sql_query = "SELECT protein_id FROM protein_loci;"
my_cur.execute(sql_query)
protein_loci_foreign_protein_ids = set([entry[0] for entry in my_cur])
if len(protein_loci_foreign_protein_ids - protein_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM protein_loci WHERE protein_id NOT IN (SELECT id FROM proteins);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: protein_id in protein_loci ->", (protein_loci_foreign_protein_ids - protein_ids))

sql_query = "SELECT locus_id FROM protein_loci;"
my_cur.execute(sql_query)
protein_loci_foreign_locus_ids = set([entry[0] for entry in my_cur])
if len(protein_loci_foreign_locus_ids - locus_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM protein_loci WHERE locus_id NOT IN (SELECT id FROM protein_loci);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: locus_id in protein_loci ->", (protein_loci_foreign_locus_ids - locus_ids))




sql_query = "SELECT node_id FROM reactions;"
my_cur.execute(sql_query)
reaction_foreign_node_ids = set([entry[0] for entry in my_cur])
if len(reaction_foreign_node_ids - node_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM reactions WHERE node_id NOT IN (SELECT id FROM nodes);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: node_id in reactions ->", (reaction_foreign_node_ids - node_ids))

sql_query = "SELECT id FROM reactions;"
my_cur.execute(sql_query)
reaction_ids = set([entry[0] for entry in my_cur])



sql_query = "SELECT node_id FROM reagents;"
my_cur.execute(sql_query)
reagent_foreign_node_ids = set([entry[0] for entry in my_cur])
if len(reagent_foreign_node_ids - node_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM reagents WHERE node_id NOT IN (SELECT id FROM nodes);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: node_id in reagents ->", (reagent_foreign_node_ids - node_ids))

sql_query = "SELECT reaction_id FROM reagents;"
my_cur.execute(sql_query)
reagent_foreign_reaction_ids = set([entry[0] for entry in my_cur])
if len(reagent_foreign_reaction_ids - reaction_ids) > 0: 
    if del_entries:
        sql_query = "DELETE FROM reagents WHERE reaction_id NOT IN (SELECT id FROM reactions);"
        my_cur.execute(sql_query)
        conn.commit()
    else:
        print("inconsistency: reaction_id in reagents ->", (reagent_foreign_reaction_ids - reaction_ids))






