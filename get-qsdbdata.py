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
from math import ceil
import sqlite3
import time


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


lite_db = sqlite3.connect('/home/dominik.kopczynski/Data/blib/TestLibraryPS.blib')
#lite_db = sqlite3.connect('/media/home/mouse.blib')
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
    
sql_query_peptides = "select p.pid, pep.* from (" + " union ".join(sql_query_peptides) + ") p inner join peptides pep on p.pid = pep.protein_id;"
my_cur.execute(sql_query_peptides)


peptides = {}

for row in my_cur:
    for pr in proteins[int(row['pid'])]:
        pep_id = int(row['id'])
        pr['peptides'].append({'id': pep_id,
                               'peptide_seq': row['peptide_seq'],
                               'spectra': []
                              })
        if pep_id not in peptides: peptides[pep_id] = []
        peptides[pep_id].append(pr['peptides'][-1])
        
        
sql_query_spectra = []
for pep_id in peptides:
    sql_query_spectra.append("select " + str(pep_id) + " pep_id")


sql_query_spectra = "select pep.pep_id, ps.* from (" + " union ".join(sql_query_spectra) + ") pep inner join peptide_spectra ps on pep.pep_id = ps.peptide_id;"
my_cur.execute(sql_query_spectra)

sql_query_lite = []
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
            pep["spectra"][-1]['mass'] = row['precursorMZ']

sql_query = "(select n.id, p.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y, '' c_number, '' formula, '' exact_mass from nodes n inner join pathways p on p.id = n.foreign_id where n.type = 'pathway' and n.pathway_id = %s)"
sql_query += "union "
sql_query += "(select n.id, m.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y, m.c_number, m.formula, m.exact_mass from nodes n inner join metabolites m on m.id = n.foreign_id where n.type = 'metabolite' and n.pathway_id = %s)"
my_cur.execute(sql_query, (pathway, pathway))


for row in my_cur:
    response.append(row)




"""





for row in my_cur:
    response.append(row)
    r_last = response[-1]
    r_last["proteins"] = []
    r_last_prot = r_last["proteins"]
    sql_protein = "SELECT p.id, p.name, p.definition, p.mass, p.accession, p.ec_number FROM proteins p INNER JOIN nodeproteincorrelations np ON p.id = np.protein_id WHERE np.node_id = %s and species in (%s)"
    my_cur_prot.execute(sql_protein, (response[-1]["id"], species))
    for row_protein in my_cur_prot:
        r_last_prot.append(row_protein)
        r_last_prot[-1]["peptides"] = []
        r_last_pep = r_last_prot[-1]["peptides"]
        sql_peptide = "SELECT pep.id, pep.peptide_seq FROM proteins pr INNER JOIN peptides pep ON pr.id = pep.protein_id WHERE pr.id = %s"
        my_cur_pep.execute(sql_peptide, row_protein["id"])
        for row_pep in my_cur_pep:
            r_last_pep.append({})
            r_last_pep[-1]['peptide_seq'] = row_pep['peptide_seq']
            r_last_pep[-1]['spectra'] = []
            
            sql_charge = "SELECT charge FROM peptide_spectra ps INNER JOIN peptides p ON ps.peptide_id = p.id WHERE p.id = %s"
            my_cur_charge.execute(sql_charge, row_pep['id'])
            for row_spec in my_cur_charge:
                sql_mass_id = "SELECT id, precursorMZ FROM RefSpectra WHERE peptideSeq = :peptide_seq and peptideModSeq = :peptide_seq and precursorCharge = :charge"
                lite_cur.execute(sql_mass_id, {"peptide_seq": row_pep['peptide_seq'], "charge": row_spec['charge']})
                for row_mass_id in lite_cur:
                    r_last_pep[-1]['spectra'].append({})
                    r_last_pep[-1]['spectra'][-1]['id'] = row_mass_id['id']
                    r_last_pep[-1]['spectra'][-1]['charge'] = row_spec['charge']
                    r_last_pep[-1]['spectra'][-1]['mass'] = row_mass_id['precursorMZ']

"""
print(dumps(response))
