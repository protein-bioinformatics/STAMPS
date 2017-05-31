#!/home/dominik.kopczynski/anaconda3/bin/python3.5

import json
from pymysql import connect, cursors

print("Content-Type: text/html")
print()


conf = {}
with open("../admin/qsdb.conf", mode="rt") as fl:
    for line in fl:
        if line.strip().strip(" ")[0] == "#": continue
        token = line.strip().strip(" ").split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")


conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()

my_cur.execute('SELECT * from chromosome_bands;')
data = {}
for band in my_cur:
    if band[1] not in data: data[band[1]] = []
    data[band[1]].append(band[2:])
print(json.dumps(data))