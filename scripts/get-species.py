#!/usr/bin/python3

import json
import sqlite3
import cgi, cgitb
from urllib.request import urlopen
import os

print("Content-Type: text/html")
print()



conf = {}
with open("../admin/qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")



form = cgi.FieldStorage()
request_all = "request_all" in form

if "public" not in conf or conf["public"] != "1":
    print("{}")
    exit()
    
    
    
    
    
    
# open database connection
database = "%s/data/database.sqlite" % conf["root_path"]
db = sqlite3.connect(database)
my_cur = db.cursor()


species_data = {}
my_cur.execute('SELECT ncbi, name FROM species;')
species_data = {row[0]: row[1] for row in my_cur}

if request_all:
    try:
        response = urlopen("%s/get-all-species.py" % conf["server"], timeout = 1)
        response = json.loads("".join(chr(c) for c in response.read()))
        
        for row in response:
            #print("%s %s %s<br>" % (row[0], conf["host"], row[0] != conf["host"]))
            if row[0] != conf["host"]:
                for species_row in row[2]:
                    key = "%s|%s" % (row[0], species_row)
                    value = "%s | (%s)" % (row[2][species_row], row[1])
                    species_data[key] = value
    except Exception as e:
        pass
    
print(json.dumps(species_data))
