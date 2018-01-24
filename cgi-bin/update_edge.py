#!/usr/bin/python

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
element = form.getvalue('element')

print("Content-Type: text/html")
print()

if type(idx) is not str or type(element) is not str: 
    print(-1)
    exit()
    
try: int(idx)
except: print(-1); exit()
    

conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor(cursors.DictCursor)

new_dir = {"bottom": "left", "left": "top", "top": "right", "right": "bottom"}
if element == "metabolite":
    sql_query = "select * from reagents where id = %s;"
    my_cur.execute(sql_query, idx)
    direction = my_cur.fetchone()["anchor"]

    sql_query = "UPDATE reagents SET anchor = %s WHERE id = %s;"
    my_cur.execute(sql_query, (new_dir[direction], idx))
    conn.commit()
    
elif element == "protein":
    sql_query = "select rc.*, rg.type from reagents rg inner join reactions rc on rg.reaction_id = rc.id where rg.id = %s;"
    my_cur.execute(sql_query, idx)
    row = my_cur.fetchone()
    e_type = row["type"]
    anc = "anchor_" + ("in" if e_type == "educt" else "out")
    direction = row[anc]
    rc_id = row["id"]

    sql_query = "UPDATE reactions SET " + anc + " = %s WHERE id = %s;"
    my_cur.execute(sql_query, (new_dir[direction], rc_id))
    conn.commit()
    
print(1)
