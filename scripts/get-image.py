#!/usr/bin/python3

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

conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()
   
my_cur.execute('SELECT image FROM images WHERE node_id = %i;' % node_id)
result = [row for row in my_cur]
if len(result) == 0:
    print("{}")
    exit()
    
print(result[0][0])
