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
action = form.getvalue('action')
action_type = form.getvalue('type')

if action == "set":
    set_id = form.getvalue('id')
    set_value = form.getvalue('value')
    
    ## TODO: write set



elif action == "get":
    if action_type not in ["pathways", "proteins", "metabolites"]:
        print(-1)
        exit()
    
    conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
    my_cur = conn.cursor()

    # add metabolite data
    if action_type in ["pathways", "metabolites"]: my_cur.execute("SELECT id, name from %s;" % action_type)
    else: my_cur.execute("SELECT id, name, accession from %s;" % action_type)
    print(json.dumps([entry for entry in my_cur]))
