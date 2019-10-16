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
    
   
   

if type(action) is not str or action not in ["count", "select", "update_enabled", "update_prm", "update_srm"]:
    print(-2)
    exit()

    
spectral_lib = "%s/data/spectral_library_%s.blib" % (conf["root_path"], str(species))
   
db = sqlite3.connect(spectral_lib)
cur = db.cursor()



if action == "count":
    cur.execute('SELECT count(*) cnt FROM RefSpectra;')
    print(cur.fetchone()[0])
   
   
   
elif action == "select":
    only_disabled = "onlyDisabled" in form and form.getvalue("onlyDisabled") == "true"
    
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
        
    sql_query = "SELECT id, peptideModSeq, precursorCharge, scoreType, confidence FROM RefSpectra %s ORDER BY id LIMIT %s;" % ("WHERE scoreType = -1" if only_disabled else "", limit)
    cur.execute(sql_query)
    print(json.dumps([row for row in cur]))
    
   
elif action == "update_enabled":
    e_id = form.getvalue('id').replace(",", "").replace("\"", "")
    value = form.getvalue('value').replace(",", "").replace("\"", "")
    try:
        a = int(e_id)
        a = int(value)
    except Exception as e:
        print(-5)
        exit()
        
    
    try:
        sql_query = "UPDATE RefSpectra SET scoreType = ? WHERE id = ?;"
        cur.execute(sql_query, (value, e_id))
        db.commit()
    except Exception as e:
        print(-6)
        exit()
    print(0)
    
    
    
   
elif action in ["update_prm", "update_srm"]:
    e_id = form.getvalue('id').replace(",", "").replace("\"", "")
    value = form.getvalue('value').replace(",", "").replace("\"", "")
    mask = 2
    try:
        e_id = int(e_id)
        value = int(value)
        if action == "update_srm":
            value <<= 1
            mask >>= 1
    except Exception as e:
        print(-5)
        exit()
        
    
    try:
        sql_query = "UPDATE RefSpectra SET confidence = ? | ((SELECT confidence from RefSpectra WHERE id = ?) & ?) WHERE id = ?;"
        cur.execute(sql_query, (value, e_id, mask, e_id))
        db.commit()
    except Exception as e:
        print(-6)
        exit()
    print(0)
