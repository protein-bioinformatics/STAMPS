#!/usr/bin/python3

import json
from pymysql import connect, cursors

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


conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()

my_cur.execute('SELECT pg.id, pg.name, GROUP_CONCAT(pw.id), pg.sort_order FROM pathway_groups pg LEFT JOIN pathways pw ON pg.id = pw.pathway_group_id GROUP BY pg.id;')
print(json.dumps({row[0]: [(cell if cell != None else "") for cell in row] for row in my_cur}))
