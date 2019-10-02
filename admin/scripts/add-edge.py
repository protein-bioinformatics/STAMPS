#!/usr/bin/python3

import sqlite3
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
start_id = form.getvalue('start_id') if 'start_id' in form else ""
end_id = form.getvalue('end_id') if 'end_id' in form else ""
anchor_start = form.getvalue('anchor_start') if 'anchor_start' in form else ""
anchor_end = form.getvalue('anchor_end') if 'anchor_end' in form else ""

print("Content-Type: text/html")
print()



def dict_rows(cur): return [{k: v for k, v in zip(cur.description, row)} for row in cur]
def dict_row(cur): return {k[0]: v for k, v in zip(cur.description, cur.fetchone())}



if type(start_id) is not str or type(end_id) is not str or type(anchor_start) is not str or type(anchor_end) is not str:
    print([-1, -1, -1])
    exit()
   
    
try:
    a = int(start_id) + int(end_id)
except:
    print([-2, -1, -1])
    exit()
    
anchors = {'top', 'bottom', 'left', 'right'}
if anchor_start not in anchors or anchor_end not in anchors:
    print([-3, -1, -1])
    exit()
    
  
  
database = "%s/data/database.sqlite" % conf["root_path"]
conn = sqlite3.connect(database)
my_cur = conn.cursor()



my_cur.execute("SELECT type FROM nodes WHERE id = ?;", (start_id))
start_type = dict_rows(my_cur)[0]["type"]

my_cur.execute("SELECT type FROM nodes WHERE id = ?;", (end_id))
end_type = dict_rows(my_cur)[0]["type"]

result = -1

count_types = {"metabolite": 0, "label": 0,"membrane": 0,"protein": 0, "pathway": 0, "image": 0, "invisible": 0}
count_types[start_type] += 1
count_types[end_type] += 1

if count_types["protein"] == 1 and count_types["metabolite"] == 1:
    prot_id, meta_id = start_id, end_id
    prot_a, meta_a = anchor_start, anchor_end
    reac_a = "anchor_out"
    fooduct = "product"
    
    if end_type == "protein":
        prot_id, meta_id = meta_id, prot_id
        prot_a, meta_a = meta_a, prot_a
        reac_a = "anchor_in"
        fooduct = "educt"
        
    
    my_cur.execute("SELECT id FROM reactions WHERE node_id = ?;", (prot_id))
    reaction_id = dict_rows(my_cur)[0]["id"]
    
    my_cur.execute("INSERT INTO reagents (reaction_id, node_id, type, anchor, head) VALUES (?, ?, ?, ?, 0);", (reaction_id, meta_id, fooduct, meta_a))
    conn.commit()
    
    
    my_cur.execute("UPDATE reactions SET ? = '?' where id = ?" % (reac_a, prot_a, reaction_id))
    conn.commit()
    
    
    my_cur.execute("SELECT max(id) mid FROM reagents;")
    result = dict_rows(my_cur)[0]["mid"]
    
else:
        
        
    my_cur.execute("INSERT INTO reactions_direct (node_id_start, node_id_end, anchor_start, anchor_end, head) VALUES (?, ?, ?, ?, 0);", (start_id, end_id, anchor_start, anchor_end))
    conn.commit()
    
    my_cur.execute("SELECT max(id) mid FROM reactions_direct;")
    result = dict_rows(my_cur)[0]["mid"]
    
    
print(result)
