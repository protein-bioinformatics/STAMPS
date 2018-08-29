#!/usr/bin/python3


import sqlite3
from cgi import FieldStorage
import json

conf = {}
with open("../qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")

print("Content-Type: text/html")
print()

form, action, species = None, None, None
try:
    form = FieldStorage()
    action = form.getvalue('action')
    species = form.getvalue('species')
    
except:
    print(-1)
    exit()
   

if type(action) is not str or action not in ["count", "select", "update"]:
    print(-2)
    exit()

    
spectra_db = "spectra_db_" + species
if spectra_db not in conf:
    print(-1)
    exit()
   
db = sqlite3.connect(conf[spectra_db])
cur = db.cursor()



if action == "count":
    cur.execute('SELECT count(*) cnt FROM RefSpectra;')
    print(cur.fetchone()[0])
   
   
   
elif action == "select":
    limit = form.getvalue('limit')
    if type(limit) is not str:
        print(-3)
        exit()
    
    limits = limit.split(",")
    for l in limits:
        try:
            a = int(l)
        except:
            print(-4)
            exit()
        
    sql_query = "SELECT id, peptideModSeq, precursorCharge, scoreType FROM RefSpectra ORDER BY id LIMIT %s;" % limit
    cur.execute(sql_query)
    print(json.dumps([row for row in cur]))
    
   
elif action == "update":
    e_id = form.getvalue('id').replace(",", "").replace("\"", "")
    value = form.getvalue('value').replace(",", "").replace("\"", "")
    try:
        a = int(e_id)
        a = int(value)
    except:
        print(-5)
        exit()
        
    
    try:
        sql_query = "UPDATE RefSpectra SET scoreType = %s WHERE id = %s;" % (value, e_id)
        cur.execute(sql_query)
    except:
        print(-6)
        exit()
    db.commit()
    print(0)