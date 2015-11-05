#!/home/dominik.kopczynski/anaconda3/bin/python3.5

import pymysql
import cgi, cgitb
import sqlite3
import json

form = cgi.FieldStorage()
pathway = form.getvalue('pathway')
species = form.getvalue('species')

try:
    species = species.replace(":", "', '")
except:
    species = ""

print("Content-Type: text/html")
print()

response = []

conn = pymysql.connect(host='localhost', port=3306, user='qsdb_user', passwd='qsdb_password', db='qsdb')
my_cur = conn.cursor(pymysql.cursors.DictCursor)
sql_query = "(select n.id, p.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y from nodes n inner join pathways p on p.id = n.foreign_id where n.type = 'pathway' and n.pathway_id = %i)" % int(pathway)
sql_query += "union (select n.id, m.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y from nodes n inner join metabolites m on m.id = n.foreign_id where n.type = 'metabolite' and n.pathway_id = %i)" % int(pathway)
sql_query += "union (select id, '', pathway_id, type, pathway_ref, x, y from nodes n where type = 'protein' and pathway_id = %i);" % int(pathway)
my_cur.execute(sql_query)

my_cur_prot = conn.cursor(pymysql.cursors.DictCursor)
my_cur_pep = conn.cursor(pymysql.cursors.DictCursor)
for row in my_cur:
    response.append(dict(row))
    
    if (response[-1]["type"] == "protein"):
        response[-1]["proteins"] = []
        sql_protein = "SELECT p.id, p.name, p.definition, p.species, p.kegg_link, p.accession FROM proteins p INNER JOIN nodeproteincorrelations np ON p.id = np.protein_id WHERE np.node_id = %i and species in ('%s')" % (int(response[-1]["id"]), species)
        my_cur_prot.execute(sql_protein)
        for row_protein in my_cur_prot:
            response[-1]["proteins"].append(dict(row_protein))
            sql_peptide = "SELECT count(pep.id) cnt FROM proteins pr INNER JOIN peptides pep ON pr.id = pep.protein_id WHERE pr.id = %i" % row_protein["id"]
            my_cur_pep.execute(sql_peptide)
            for row_pep in my_cur_pep:
                response[-1]["proteins"][-1]["n_peptides"] = row_pep["cnt"]
print(json.dumps(response))