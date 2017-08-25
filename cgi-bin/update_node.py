#!/usr/bin/python3

from pymysql import connect, cursors
from cgi import FieldStorage

conf = {}
with open("../admin/qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")

form = FieldStorage()
idx = form.getvalue('id')
x = form.getvalue('x')
y = form.getvalue('y')

print("Content-Type: text/html")
print()

if type(x) is not str or type(y) is not str or type(idx) is not str: 
    print(-1)
    exit()
    
try:
    a = int(x) + int(y) + int(idx)
except:
    print(-1)
    exit()
    
x = round(int(x) / 25) * 25
y = round(int(y) / 25) * 25
conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor(cursors.DictCursor)
sql_query = "UPDATE nodes SET x = %s, y = %s WHERE id = %s"
my_cur.execute(sql_query, (x, y, idx))
conn.commit()
print(1)
