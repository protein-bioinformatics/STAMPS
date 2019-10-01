#!/usr/bin/python3

import json
import sqlite3
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
hostname = form.getvalue('host') if "host" in form else ""





if hostname != "":
    try:
        request = "&".join(["%s=%s" % (key, form.getvalue(key)) for key in form if key != "host"])
        print(urlopen("%s/scripts/get-pathways-groups.py?%s" % (hostname, request), timeout = 2).read().decode("utf8"))
        
    except Exception as e:
        print(-1)
    
    exit()
    
    


# open database connection
database = "%s/data/database.sqlite" % conf["root_path"]
db = sqlite3.connect(database)
my_cur = db.cursor()



my_cur.execute('SELECT pg.id, pg.name, GROUP_CONCAT(pw.id), pg.sort_order FROM pathway_groups pg LEFT JOIN pathways pw ON pg.id = pw.pathway_group_id GROUP BY pg.id;')
print(json.dumps({row[0]: [(cell if cell != None else "") for cell in row] for row in my_cur}))
