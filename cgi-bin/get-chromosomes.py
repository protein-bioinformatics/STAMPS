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
species = form.getvalue('species')

conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()

my_cur.execute("SELECT * FROM chromosome_bands WHERE species = '%s';" % species)
data = {}
for band in my_cur:
    if band[1] not in data: data[band[1]] = []
    data[band[1]].append(band[2:])
print(json.dumps(data))
