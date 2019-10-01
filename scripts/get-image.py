#!/usr/bin/python3

import sqlite3
import cgi, cgitb
import json

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


def make_dict(cur):
    return {key[0]: value for key, value in zip(cur.description, cur.fetchall()[0])}

form = cgi.FieldStorage()
try:
    node_id = int(form.getvalue('node_id'))
except Exception as e:
    print(-2)
    exit()
hostname = form.getvalue('host') if "host" in form else ""

if "root_path" not in conf:
    print(-1)
    exit()


if hostname != "":
    request = "&".join(["%s=%s" % (key, form.getvalue(key)) for key in form if key != "host"])
    print(urlopen("%s/scripts/get-image.py?%s" % (hostname, request), timeout = 2).read().decode("utf8"))
    
    exit()

database = "%s/data/database.sqlite" % conf["root_path"]
db = sqlite3.connect(database)
my_cur = db.cursor()
   
my_cur.execute('SELECT * FROM images WHERE node_id = %i;' % node_id)

if my_cur.rowcount == 0:
    print("{}")
    exit()
    
result = make_dict(my_cur)
    
print(json.dumps(result))
