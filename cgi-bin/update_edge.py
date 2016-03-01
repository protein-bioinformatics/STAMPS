#!/home/dominik.kopczynski/anaconda3/bin/python3.5

from pymysql import connect, cursors
from cgi import FieldStorage
from defines import *

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
    
conn = connect(host = mysql_host, port = mysql_port, user = mysql_user, passwd = mysql_passwd, db = mysql_db)
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