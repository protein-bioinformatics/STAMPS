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
#my_cur = conn.cursor(cursors.DictCursor)
my_cur = conn.cursor()

my_cur.execute('SELECT fn.id, fn.name, fn.parent, count(pf.protein_id) cnt FROM function_names fn LEFT JOIN protein_functions pf ON fn.id = pf.function_id GROUP by fn.id, fn.name, fn.parent;')
all_functions = [[row[0], row[1], row[2], row[3]] for row in my_cur]
print(json.dumps(all_functions))