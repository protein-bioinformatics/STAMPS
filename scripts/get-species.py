#!/usr/bin/python3

import json
from pymysql import connect, cursors
import cgi, cgitb
from urllib.request import urlopen

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
single = "single" in form


species_data = {}
conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()
my_cur.execute('SELECT ncbi, name FROM species;')
species_data = {row[0]: row[1] for row in my_cur}

    
if not single:
    response = urlopen("%s/get-all-species.py" % conf["server"], timeout = 1)
    response = json.loads("".join(chr(c) for c in response.read()))
    
    for row in response:
        #print("%s %s %s<br>" % (row[0], conf["host"], row[0] != conf["host"]))
        if row[0] != conf["host"]:
            for species_row in row[2]:
                key = "%s|%s" % (row[0], species_row)
                value = "%s | (%s)" % (row[2][species_row], row[1])
                species_data[key] = value
    
print(json.dumps(species_data))