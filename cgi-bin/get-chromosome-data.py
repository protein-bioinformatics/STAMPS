#!/usr/bin/python3

import json
from pymysql import connect, cursors
import cgi, cgitb

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
chromosome = form.getvalue('chromosome')

if chromosome.find("'") > -1 or chromosome.find("\"") > -1:
    print(-1)
    exit()

conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()

my_cur.execute("SELECT id, name, definition, kegg_link, mass, accession, ec_number, chr_start, chr_end from proteins where chromosome = '%s' and unreviewed = false ORDER BY chr_start ASC;" % chromosome)
data = [row for row in my_cur]
print(json.dumps(data))