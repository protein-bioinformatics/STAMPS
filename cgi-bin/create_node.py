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
node_type = form.getvalue('type')
x = form.getvalue('x')
y = form.getvalue('y')
pathway = form.getvalue("pathway")

print("Content-Type: text/html")
print()

if type(x) is not str or type(y) is not str or type(pathway) is not str or node_type not in ["pathway", "protein", "metabolite", "label", "membrane"]:
    print(-1)
    exit()
   
    
try:
    a = int(x) + int(y) + int(pathway)
except:
    print(-2)
    exit()
    
x = round(int(x) / 25) * 25
y = round(int(y) / 25) * 25
conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor(cursors.DictCursor)



if node_type == "pathway":
    pathway_ref = form.getvalue('pathway_ref')
    try:
        a = int(pathway_ref)
    except:
        print(-3)
        exit()
    
    sql_query = "INSERT INTO nodes (pathway_id, type, foreign_id, pathway_ref, x, y) VALUES (%s, %s, %s, %s, %s, %s);"
    my_cur.execute(sql_query, (pathway, node_type, pathway_ref, pathway_ref, x, y))
    
    
elif node_type == "protein":
    sql_query = "INSERT INTO nodes (pathway_id, type, foreign_id, pathway_ref, x, y) VALUES (%s, %s, 0, 0, %s, %s);"
    my_cur.execute(sql_query, (pathway, node_type, x, y))
    
    
elif node_type == "metabolite":
    foreign_id = form.getvalue('foreign_id')
    try:
        a = int(foreign_id)
    except:
        print(-4)
        exit()
    sql_query = "INSERT INTO nodes (pathway_id, type, foreign_id, pathway_ref, x, y) VALUES (%s, %s, %s, 0, %s, %s);"
    my_cur.execute(sql_query, (pathway, node_type, foreign_id, x, y))
    
elif node_type == "label":
    my_cur.execute("INSERT INTO labels (label) VALUES ('undefined');");
    conn.commit()
    my_cur.execute("SELECT max(id) mid FROM labels;")
    max_label_id = [row for row in my_cur][0]["mid"]
    
    sql_query = "INSERT INTO nodes (pathway_id, type, foreign_id, pathway_ref, x, y) VALUES (%s, %s, %s, 0, %s, %s);"
    my_cur.execute(sql_query, (pathway, node_type, max_label_id, x, y))
    
elif node_type == "membrane":
    sql_query = "INSERT INTO nodes (pathway_id, type, foreign_id, pathway_ref, x, y) VALUES (%s, %s, 0, 0, %s, %s);"
    my_cur.execute(sql_query, (pathway, node_type, x, y))
    
conn.commit()
my_cur.execute("SELECT max(id) mid FROM nodes;")
print( [row for row in my_cur][0]["mid"] )
