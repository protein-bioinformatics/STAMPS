#!/usr/bin/python3

import json
from pymysql import connect, cursors
from cgi import FieldStorage
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

form = FieldStorage()
hostname = form.getvalue('host') if "host" in form else ""

if hostname != "":
    print(urlopen("%s/scripts/get-tissues.py" % hostname, timeout = 2).read().decode("utf8"))
    exit()



conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()

my_cur.execute('SELECT brenda, name, icon, color FROM tissues;')
print(json.dumps([row for row in my_cur]))
