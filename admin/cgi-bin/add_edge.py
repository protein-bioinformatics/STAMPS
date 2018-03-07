#!/usr/bin/python3

from pymysql import connect, cursors
from cgi import FieldStorage

conf = {}
with open("../qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")

form = FieldStorage()
start_id = form.getvalue('start_id')
end_id = form.getvalue('end_id')

print("Content-Type: text/html")
print()

if type(start_id) is not str or type(end_id) is not str:
    print(-1)
    exit()
   
    
try:
    a = int(start_id) + int(end_id)
except:
    print(-2)
    exit()
  
  
conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor(cursors.DictCursor)



my_cur.execute("SELECT type FROM nodes WHERE id = %s;", (start_id))
start_type = [row for row in my_cur][0]["type"]

my_cur.execute("SELECT type FROM nodes WHERE id = %s;", (end_id))
end_type = [row for row in my_cur][0]["type"]

reagent_id = -1
reaction_id = -1

if start_type == "protein" or end_type == "protein":
    prot_id, meta_id = start_id, end_id
    fooduct = "product"
    
    if end_type == "protein":
        prot_id, meta_id = meta_id, prot_id
        fooduct = "educt"
        
    
    my_cur.execute("SELECT id FROM reactions WHERE node_id = %s;", (prot_id))
    reaction = [row for row in my_cur][0]["id"]
    
    
    my_cur.execute("INSERT INTO reagents (reaction_id, node_id, type, anchor) VALUES (%s, %s, %s, 'left');", (reaction, meta_id, fooduct))
    conn.commit()
    
    my_cur.execute("SELECT max(id) mid FROM reagents;")
    reagent_id = [row for row in my_cur][0]["mid"]
    
else:
    pathway_id, meta_id = start_id, end_id
    if end_type == "pathway":
        pathway_id, meta_id = meta_id, pathway_id
        
        
    my_cur.execute("INSERT INTO reactions (node_id, anchor_in, anchor_out, reversible) VALUES (%s, 'left', 'right', 0);", (pathway_id))
    conn.commit()
    
    my_cur.execute("SELECT max(id) mid FROM reactions;")
    reaction_id = [row for row in my_cur][0]["mid"]
    
    
    my_cur.execute("INSERT INTO reagents (reaction_id, node_id, type, anchor) VALUES (%s, %s, 'educt', 'left');", (reaction_id, meta_id))
    conn.commit()
    
    my_cur.execute("SELECT max(id) mid FROM reagents;")
    reagent_id = [row for row in my_cur][0]["mid"]
    
print([0, reagent_id, reaction_id])
