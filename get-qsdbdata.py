#!/home/dominik.kopczynski/anaconda3/bin/python3.5

from pymysql import connect, cursors
from cgi import FieldStorage
from json import dumps
from math import ceil
import sqlite3
import time
from defines import *


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
conn = connect(host = mysql_host, port = mysql_port, user = mysql_user, passwd = mysql_passwd, db = mysql_db)
my_cur = conn.cursor(cursors.DictCursor)

lite_db = sqlite3.connect(sqlite_file)
lite_db.row_factory = dict_factory
lite_cur = lite_db.cursor()

sql_query_nodes = "select * from nodes where pathway_id = %s and type = 'protein';"
my_cur.execute(sql_query_nodes, pathway)

for row in my_cur:
    response.append({'id': row['id'],
                    'name': '',
                    'pathway_id': row['pathway_id'],
                    'type': row['type'],
                    'pathway_ref': '0',
                    'x': row['x'],
                    'y': row['y'],
                    'c_number': '',
                    'formula': '',
                    'exact_mass': '',
                    'proteins': []
                    })

sql_query_proteins = "select n.id nid, p.* from nodes n inner join nodeproteincorrelations np on n.id = np.node_id inner join proteins p on np.protein_id = p.id where n.pathway_id = %s and n.type = 'protein' and p.species = %s;"
my_cur.execute(sql_query_proteins, (pathway, species))

i = 0
proteins = {}

sql_query_peptides = []

for row in my_cur:
    while response[i]['id'] < row['nid']: i += 1
    pid = int(row['id'])
    response[i]['proteins'].append({'id': pid,
                                    'name': row['name'],
                                    'definition': row['definition'],
                                    'mass': row['mass'],
                                    'accession': row['accession'],
                                    'ec_number': row['ec_number'],
                                    'fasta': row['fasta'],
                                    'peptides': []
                                    })
    if pid not in proteins: proteins[pid] = []
    proteins[pid].append(response[i]['proteins'][-1])
    sql_query_peptides.append("select " + str(pid) + " pid")
    
    
sql_query_spectra = []
peptides = {}

if  len(sql_query_peptides):
    sql_query_peptides = "select p.pid, pep.* from (" + " union ".join(sql_query_peptides) + ") p inner join peptides pep on p.pid = pep.protein_id;"
    my_cur.execute(sql_query_peptides)


    for row in my_cur:
        for pr in proteins[int(row['pid'])]:
            pep_id = int(row['id'])
            pr['peptides'].append({'id': pep_id,
                                'peptide_seq': row['peptide_seq'],
                                'spectra': []
                                })
            if pep_id not in peptides: peptides[pep_id] = []
            peptides[pep_id].append(pr['peptides'][-1])
            
            
    for pep_id in peptides:
        sql_query_spectra.append("select " + str(pep_id) + " pep_id")



sql_query_lite = []
if len(sql_query_spectra):
    sql_query_spectra = "select pep.pep_id, ps.* from (" + " union ".join(sql_query_spectra) + ") pep inner join peptide_spectra ps on pep.pep_id = ps.peptide_id;"
    my_cur.execute(sql_query_spectra)

    for row in my_cur:
        sql_query_lite.append("select %s pep_id, '%s' seq, %s chrg" % (row['pep_id'], peptides[int(row['pep_id'])][0]['peptide_seq'], row['charge']))

t, l = 500, len(sql_query_lite)
for i in range(ceil(l / t)):
    sql_query_lite2 = "SELECT ps.pep_id, ps.chrg charge, rs.id sid, rs.precursorMZ FROM RefSpectra rs inner join (" + " union ".join(sql_query_lite[i * t : min((i + 1) * t, l)]) + ") ps on rs.peptideSeq = ps.seq and rs.peptideModSeq = ps.seq and rs.precursorCharge = ps.chrg;"
    lite_cur.execute(sql_query_lite2)
    
    for row in lite_cur:
        for pep in peptides[int(row['pep_id'])]:
            pep["spectra"].append({})
            pep["spectra"][-1]['id'] = row['sid']
            pep["spectra"][-1]['charge'] = row['charge']
            pep["spectra"][-1]['mass'] = "%.4f" % row['precursorMZ']

sql_query = "(select n.id, p.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y, '' c_number, '' formula, '' exact_mass from nodes n inner join pathways p on p.id = n.foreign_id where n.type = 'pathway' and n.pathway_id = %s)"
sql_query += "union "
sql_query += "(select n.id, m.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y, m.c_number, m.formula, m.exact_mass from nodes n inner join metabolites m on m.id = n.foreign_id where n.type = 'metabolite' and n.pathway_id = %s)"
my_cur.execute(sql_query, (pathway, pathway))


for row in my_cur:
    response.append(row)

print(dumps(response))
