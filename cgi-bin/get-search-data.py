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

data = []


# add metabolite data
my_cur.execute("SELECT m.name, n.id, n.pathway_id from metabolites m inner join nodes n on m.id = n.foreign_id where n.type = 'metabolite';")
data += [entry for entry in my_cur]

# add pathway data
my_cur.execute("SELECT pw.name, n.id, n.pathway_id from pathways pw inner join nodes n on pw.id = n.foreign_id where n.type = 'pathway';")
data += [entry for entry in my_cur]


# add protein data
my_cur.execute("SELECT p.name, p.definition, p.accession, n.id, n.pathway_id from proteins p inner join nodeproteincorrelations npc on p.id = npc.protein_id inner join nodes n on npc.node_id = n.id where n.type = 'protein';")
for entry in my_cur:
    data += [[entry[0], entry[3], entry[4]]]
    data += [[entry[1], entry[3], entry[4]]]
    data += [[entry[2], entry[3], entry[4]]]


print(json.dumps(data).replace(", ", ","))
