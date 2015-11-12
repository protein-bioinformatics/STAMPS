#!/home/dominik.kopczynski/anaconda3/bin/python3.5

"""
import socket

print("Content-Type: text/html")
print()

from cgi import FieldStorage
form = FieldStorage()
species = ""
try:
    species = str(form.getvalue('species'))
except:
    species = ""
response = []

data = form.getvalue('request') + ";"
data += form.getvalue('pathway') + ";"
data += species
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("localhost", 18000))
s.send(data.encode()) 
data = s.recv(65536).decode()
print(data)
s.close()


exit()
"""

from pymysql import connect, cursors
from cgi import FieldStorage
from json import dumps
import sqlite3
#import sys
#import os


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

'''
pathway = "1"
species = "mouse"
'''

form = FieldStorage()
pathway = form.getvalue('pathway')
species = form.getvalue('species')


try:
    species = species.replace(":", "', '")
except:
    species = ""

print("Content-Type: text/html")
print()


response = []
conn = connect(host='localhost', port=3306, user='qsdb_user', passwd='qsdb_password', db='qsdb')
my_cur = conn.cursor(cursors.DictCursor)
sql_query = "(select n.id, p.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y from nodes n inner join pathways p on p.id = n.foreign_id where n.type = 'pathway' and n.pathway_id = %s)"
sql_query += "union "
sql_query += "(select n.id, m.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y from nodes n inner join metabolites m on m.id = n.foreign_id where n.type = 'metabolite' and n.pathway_id = %s)"
sql_query += "union "
sql_query += "(select id, '', pathway_id, type, pathway_ref, x, y from nodes n where type = 'protein' and pathway_id = %s);"
my_cur.execute(sql_query, (pathway, pathway, pathway))

lite_db = sqlite3.connect('/home/dominik.kopczynski/Data/blib/TestLibraryPS.blib')
lite_db.row_factory = dict_factory
lite_cur = lite_db.cursor()


my_cur_prot = conn.cursor(cursors.DictCursor)
my_cur_pep = conn.cursor(cursors.DictCursor)                
for row in my_cur:
    response.append(row)
    r_last = response[-1]
    if (r_last["type"] == "protein"):
        r_last["proteins"] = []
        r_last_prot = r_last["proteins"]
        sql_protein = "SELECT p.id, p.name, p.definition, p.species, p.kegg_link, p.accession FROM proteins p INNER JOIN nodeproteincorrelations np ON p.id = np.protein_id WHERE np.node_id = %s and species in (%s)"
        my_cur_prot.execute(sql_protein, (response[-1]["id"], species))
        for row_protein in my_cur_prot:
            r_last_prot.append(row_protein)
            r_last_prot[-1]["peptides"] = []
            r_last_pep = r_last_prot[-1]["peptides"]
            sql_peptide = "SELECT peptide_seq FROM proteins pr INNER JOIN peptides pep ON pr.id = pep.protein_id WHERE pr.id = %s"
            my_cur_pep.execute(sql_peptide, row_protein["id"])
            for row_pep in my_cur_pep:
                r_last_pep.append({})
                r_last_pep[-1]['peptide_seq'] = row_pep['peptide_seq']
                r_last_pep[-1]['mass_id'] = []
                sql_mass_id = "SELECT id, precursorMZ FROM RefSpectra WHERE peptideSeq = :peptide_seq"
                lite_cur.execute(sql_mass_id, {"peptide_seq": row_pep['peptide_seq']})
                for row_mass_id in lite_cur:
                    r_last_pep[-1]['mass_id'].append(row_mass_id)

print(dumps(response))
