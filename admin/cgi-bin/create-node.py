#!/usr/bin/python3

from pymysql import connect, cursors
from cgi import FieldStorage
import json

conf = {}
with open("../qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")

print("Content-Type: text/html")
print()

form, node_type, x, y, pathway = None, None, None, None, None
try:
    form = FieldStorage()
    node_type = form.getvalue('type')
    x = form.getvalue('x')
    y = form.getvalue('y')
    pathway = form.getvalue("pathway")
    
except:
    print(-1)
    exit()   


if type(x) is not str or type(y) is not str or type(pathway) is not str or node_type not in ["pathway", "protein", "metabolite", "label", "membrane", "image"]:
    print(-2)
    exit()
   
    
try:
    a = int(x) + int(y) + int(pathway)
except:
    print(-3)
    exit()
    
x = round(int(x) / 25) * 25
y = round(int(y) / 25) * 25
conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor(cursors.DictCursor)

reaction_id = -1

if node_type == "pathway":
    foreign_id = form.getvalue('foreign_id')
    try:
        a = int(foreign_id)
    except:
        print(-3)
        exit()
    
    sql_query = "INSERT INTO nodes (pathway_id, type, foreign_id, x, y) VALUES (%s, %s, %s, %s, %s);"
    my_cur.execute(sql_query, (pathway, node_type, foreign_id, x, y))
    conn.commit()
    
    
elif node_type == "protein":
    sql_query = "INSERT INTO nodes (pathway_id, type, foreign_id, x, y) VALUES (%s, %s, 0, %s, %s);"
    my_cur.execute(sql_query, (pathway, node_type, x, y))
    conn.commit()
    
    my_cur.execute("SELECT max(id) mid FROM nodes;")
    max_node_id = [row for row in my_cur][0]["mid"]
    
    
    sql_query = "INSERT INTO reactions (node_id, anchor_in, anchor_out) VALUES (%s, 'left', 'right');"
    my_cur.execute(sql_query, (max_node_id))
    
    my_cur.execute("SELECT max(id) mid FROM reactions;")
    reaction_id = [row for row in my_cur][0]["mid"]
    conn.commit()
    
    
elif node_type == "metabolite":
    foreign_id = form.getvalue('foreign_id')
    try:
        a = int(foreign_id)
    except:
        print(-4)
        exit()
    sql_query = "INSERT INTO nodes (pathway_id, type, foreign_id, x, y) VALUES (%s, %s, %s, %s, %s);"
    my_cur.execute(sql_query, (pathway, node_type, foreign_id, x, y))
    conn.commit()
    
    
elif node_type == "label":
    my_cur.execute("INSERT INTO labels (label) VALUES ('undefined');");
    conn.commit()
    my_cur.execute("SELECT max(id) mid FROM labels;")
    max_label_id = [row for row in my_cur][0]["mid"]
    reaction_id = max_label_id;
    
    sql_query = "INSERT INTO nodes (pathway_id, type, foreign_id, x, y) VALUES (%s, %s, %s, %s, %s);"
    my_cur.execute(sql_query, (pathway, node_type, max_label_id, x, y))
    conn.commit()
    
    
elif node_type == "membrane":
    sql_query = "INSERT INTO nodes (pathway_id, type, foreign_id, x, y) VALUES (%s, %s, 0, %s, %s);"
    my_cur.execute(sql_query, (pathway, node_type, x, y))
    conn.commit()
    
elif node_type == "image":
    sql_query = "INSERT INTO nodes (pathway_id, type, foreign_id, x, y) VALUES (%s, %s, 0, %s, %s);"
    my_cur.execute(sql_query, (pathway, node_type, x, y))
    conn.commit()
    
    
my_cur.execute("SELECT max(id) mid FROM nodes;")
print( json.dumps( [[row for row in my_cur][0]["mid"], reaction_id] ) )
