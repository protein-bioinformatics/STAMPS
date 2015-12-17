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
sql_query = "(select n.id, p.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y, '' c_number, '' formula, '' exact_mass from nodes n inner join pathways p on p.id = n.foreign_id where n.type = 'pathway' and n.pathway_id = %s)"
sql_query += "union "
sql_query += "(select n.id, m.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y, m.c_number, m.formula, m.exact_mass from nodes n inner join metabolites m on m.id = n.foreign_id where n.type = 'metabolite' and n.pathway_id = %s)"
#sql_query += "union "
#sql_query += "(select id, '', pathway_id, type, pathway_ref, x, y, '' c_number, '' formula, '' exact_mass from nodes n where type = 'protein' and pathway_id = %s);"
my_cur.execute(sql_query, (pathway, pathway))

#lite_db = sqlite3.connect('/home/dominik.kopczynski/Data/blib/TestLibraryPS.blib')
lite_db = sqlite3.connect('/media/home/mouse.blib')
lite_db.row_factory = dict_factory
lite_cur = lite_db.cursor()


my_cur_prot = conn.cursor(cursors.DictCursor)
my_cur_pep = conn.cursor(cursors.DictCursor)
my_cur_charge = conn.cursor(cursors.DictCursor)





for row in my_cur:
    response.append(row)
    
    

sql_query = "select n.*, p.*, pep.*, ps.* from nodes n inner join nodeproteincorrelations np on n.id = np.node_id inner join proteins p on np.protein_id = p.id left join peptides pep on p.id = pep.protein_id left join peptide_spectra ps on pep.id = ps.peptide_id where p.species = %s and n.pathway_id = %s and n.type = 'protein';"
my_cur.execute(sql_query, (species, pathway))
#sql_query = "select id, '' name, pathway_id, type, pathway_ref, x, y, '' c_number, '' formula, '' exact_mass from nodes n where type = 'protein' and pathway_id = %s;"
#my_cur.execute(sql_query, pathway)

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

#pep.id p.id accession fasta name foreign_id y mass ec_number protein_id x pathway_id definition species ps.id pathway_ref peptide_id type peptide_seq charge id kegg_link 
node_id = -1
protein_id = -1
peptide_id = -1
for i, row in enumerate(my_cur):
    if row['id'] != node_id:
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
        node_id = row['id']
        protein_id = -1
        peptide_id = -1
        
    if row['p.id'] != protein_id:
        response[-1]['proteins'].append({'id': row['p.id'],
                                         'name': row['name'],
                                         'definition': row['definition'],
                                         'mass': row['mass'],
                                         'accession': row['accession'],
                                         'ec_number': row['ec_number'],
                                         'fasta': row['fasta'],
                                         'peptides': []
                                         })
        protein_id = row['p.id']
        peptide_id = -1
        if row['pep.id'] == "": continue
        
    if row['pep.id'] != peptide_id:
        response[-1]['proteins'][-1]["peptides"].append({'id': row['pep.id'],
                                                         'peptide_seq': row['peptide_seq'],
                                                         'spectra': []
                                                         })
        peptide_id = row['pep.id']
        if row['charge'] == "": continue
    
    sql_mass_id = "SELECT id, precursorMZ FROM RefSpectra WHERE peptideSeq = :peptide_seq and peptideModSeq = :peptide_seq and precursorCharge = :charge"
    lite_cur.execute(sql_mass_id, {"peptide_seq": row['peptide_seq'], "charge": row['charge']})
    for row_mass_id in lite_cur:
        response[-1]['proteins'][-1]["peptides"][-1]["spectra"].append({})
        response[-1]['proteins'][-1]["peptides"][-1]["spectra"][-1]['id'] = row_mass_id['id']
        response[-1]['proteins'][-1]["peptides"][-1]["spectra"][-1]['charge'] = row['charge']
        response[-1]['proteins'][-1]["peptides"][-1]["spectra"][-1]['mass'] = row_mass_id['precursorMZ']


sql_query = "select n.* from nodes n left join nodeproteincorrelations np on n.id = np.node_id left join proteins p on np.protein_id = p.id where n.pathway_id = %s and isnull(p.id) and n.type = 'protein';"
my_cur.execute(sql_query, pathway)

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


print(dumps(response))