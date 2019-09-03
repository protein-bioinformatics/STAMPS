#!/usr/bin/python3

import json
from pymysql import connect, cursors
from cgi import FieldStorage

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

form = FieldStorage()
    
if "species" not in form:
    print(-1)
    exit()

species = form.getvalue('species')

try:
    a = int(species)
except:
    print(-2)
    exit()

conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])

my_cur = conn.cursor()

my_cur.execute('SELECT fn.id, fn.name, fn.parent, count(pf.protein_id) cnt FROM function_names fn LEFT JOIN protein_functions pf ON fn.id = pf.function_id INNER JOIN proteins p ON pf.protein_id = p.id WHERE p.species = %s GROUP by fn.id, fn.name, fn.parent;' % species)
all_functions = [[row[0], row[1], row[2], row[3]] for row in my_cur]
print(json.dumps(all_functions))
