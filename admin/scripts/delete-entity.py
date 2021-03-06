#!/usr/bin/python3

import sqlite3
from cgi import FieldStorage
import os

conf = {}
with open("../qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")

form = FieldStorage()
entity_type = form.getvalue('type')
entity_id = form.getvalue('id')

print("Content-Type: text/html")
print()


def dict_rows(cur): return [{k: v for k, v in zip(cur.description, row)} for row in cur]
def dict_row(cur): return {k[0]: v for k, v in zip(cur.description, cur.fetchone())}

if type(entity_type) is not str or type(entity_id) is not str or entity_type not in ["node", "edge", "edge_direct", "protein", "metabolite", "pathway", "pathway_group", "species", "tissues", "loci_names"]:
    print(-1)
    exit()
   
try:
    a = int(entity_id)
except:
    print(-2)
    exit()
    
    
database = "%s/data/database.sqlite" % conf["root_path"]
conn = sqlite3.connect(database)
my_cur = conn.cursor()



if entity_type == "node":


    sql_query = "SELECT type FROM nodes WHERE id = ?;"
    
    print(entity_id)
    my_cur.execute(sql_query, (entity_id,))
    entity_type = dict_row(my_cur)["type"]
    
    if entity_type == "pathway":
        sql_query = "DELETE FROM reactions_direct WHERE node_id_start = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        sql_query = "DELETE FROM reactions_direct WHERE node_id_end = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        sql_query = "DELETE FROM nodes WHERE id = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        
        
    elif entity_type == "protein":
        sql_query = "DELETE FROM reagents WHERE reaction_id IN (SELECT id FROM reactions WHERE node_id = ?);"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        sql_query = "DELETE FROM reactions WHERE node_id = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        sql_query = "DELETE FROM nodeproteincorrelations WHERE node_id = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        sql_query = "DELETE FROM nodes WHERE id = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        sql_query = "DELETE FROM reactions_direct WHERE node_id_start = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        sql_query = "DELETE FROM reactions_direct WHERE node_id_end = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        
    elif entity_type == "metabolite":
        sql_query = "SELECT rc.id FROM reactions rc INNER JOIN reagents r ON rc.id = r.reaction_id INNER JOIN nodes n ON rc.node_id = n.id WHERE r.node_id = ? AND n.type = 'pathway';" # reactions for pathways
        my_cur.execute(sql_query, (entity_id,))
        del_reaction = ", ".join(str(row["id"]) for row in dict_rows(my_cur))
        
        if len(del_reaction) > 0:
            sql_query = "DELETE FROM reactions WHERE id IN (?);" % del_reaction # reactions for pathways
            my_cur.execute(sql_query)
            conn.commit()
        
        sql_query = "DELETE FROM reagents WHERE node_id = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        sql_query = "DELETE FROM nodes WHERE id = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        sql_query = "DELETE FROM reactions_direct WHERE node_id_start = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        sql_query = "DELETE FROM reactions_direct WHERE node_id_end = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        
    elif entity_type in ["label", "membrane", "image", "invisible"]:
        if entity_type == "label":
            sql_query = "DELETE FROM labels WHERE id IN (SELECT foreign_id from nodes WHERE id = ?);"
            my_cur.execute(sql_query, (entity_id,))
            conn.commit()
            
        elif entity_type == "image":
            sql_query = "DELETE FROM images WHERE node_id = ?;"
            my_cur.execute(sql_query, (entity_id,))
            conn.commit()
        
        sql_query = "DELETE FROM reactions_direct WHERE node_id_start = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        sql_query = "DELETE FROM reactions_direct WHERE node_id_end = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
        
        sql_query = "DELETE FROM nodes WHERE id = ?;"
        my_cur.execute(sql_query, (entity_id,))
        conn.commit()
    
    
elif entity_type == "edge":
    sql_query = "DELETE FROM reagents WHERE id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
        
elif entity_type == "edge_direct":
    sql_query = "DELETE FROM reactions_direct WHERE id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
        
elif entity_type == "species":
    sql_query = "DELETE FROM species WHERE id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
        
elif entity_type == "tissues":
    sql_query = "DELETE FROM tissues WHERE id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
        
elif entity_type == "loci_names":
    sql_query = "DELETE FROM loci_names WHERE id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    
    sql_query = "DELETE FROM protein_loci WHERE locus_id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
    
elif entity_type == "protein":
    sql_query = "DELETE FROM protein_functions WHERE protein_id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
    sql_query = "DELETE FROM protein_loci WHERE protein_id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
    sql_query = "DELETE FROM nodeproteincorrelations WHERE protein_id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
            
    sql_query = "DELETE FROM proteins WHERE id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()

    
    
elif entity_type == "pathway":
    sql_query = "DELETE FROM reagents WHERE reaction_id IN (SELECT r.id FROM reactions r INNER JOIN nodes n on r.node_id = n.id WHERE n.type = 'protein' AND pathway_id = ?);"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
    sql_query = "DELETE FROM reactions WHERE node_id IN (SELECT id FROM nodes WHERE type = 'protein' AND pathway_id = ?);"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
    sql_query = "DELETE FROM reactions_direct WHERE node_id_start IN (SELECT id FROM nodes WHERE pathway_id = ?);"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
    sql_query = "DELETE FROM reactions_direct WHERE node_id_end IN (SELECT id FROM nodes WHERE pathway_id = ?);"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
    sql_query = "DELETE npc FROM nodeproteincorrelations npc INNER JOIN nodes n on npc.node_id = n.id WHERE n.pathway_id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
    sql_query = "DELETE FROM nodes WHERE type = 'pathway' AND foreign_id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
    sql_query = "DELETE FROM nodes WHERE pathway_id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
    sql_query = "DELETE FROM pathways WHERE id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
    
elif entity_type == "metabolite":
    
    sql_query = "SELECT n.id FROM nodes n INNER JOIN metabolites m ON n.foreign_id = m.id WHERE m.id = ? AND n.type = 'metabolite';"
    my_cur.execute(sql_query, (entity_id,))
    del_nodes = ", ".join(str(row["id"]) for row in dict_rows(my_cur))
    
    if len(del_nodes) > 0:
        sql_query = "DELETE FROM reagents WHERE node_id IN (%s);" % del_nodes
        my_cur.execute(sql_query)
        conn.commit()
        
        sql_query = "DELETE FROM reactions_direct WHERE node_id_start IN (%s) OR node_id_end IN (%s);" % (del_nodes, del_nodes)
        my_cur.execute(sql_query)
        conn.commit()
        
        sql_query = "DELETE FROM nodes WHERE id IN (%s);" % del_nodes
        my_cur.execute(sql_query)
        conn.commit()
    
    sql_query = "DELETE FROM metabolites WHERE id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
    
    
    
    
    
elif entity_type == "pathway_group":
    
    sql_query = "SELECT id FROM pathways WHERE pathway_group_id = ?;" # reactions for pathways
    my_cur.execute(sql_query, (entity_id,))
    ids_for_delete = [str(row["id"]) for row in dict_rows(my_cur)]
    for pw_id in ids_for_delete:
    
        sql_query = "DELETE FROM reagents WHERE reaction_id IN (SELECT r.id FROM reactions r INNER JOIN nodes n on r.node_id = n.id WHERE n.type = 'protein' AND pathway_id = ?);"
        my_cur.execute(sql_query, (pw_id,))
        conn.commit()
        
        sql_query = "DELETE FROM reactions WHERE node_id IN (SELECT id FROM nodes WHERE type = 'protein' AND pathway_id = ?);"
        my_cur.execute(sql_query, (pw_id,))
        conn.commit()
        
        sql_query = "DELETE FROM reactions_direct WHERE node_id_start IN (SELECT id FROM nodes WHERE pathway_id = ?);"
        my_cur.execute(sql_query, (pw_id,))
        conn.commit()
        
        sql_query = "DELETE FROM reactions_direct WHERE node_id_end IN (SELECT id FROM nodes WHERE pathway_id = ?);"
        my_cur.execute(sql_query, (pw_id,))
        conn.commit()
        
        sql_query = "DELETE FROM nodeproteincorrelations npc INNER JOIN nodes n on npc.node_id = n.id WHERE n.pathway_id = ?;"
        my_cur.execute(sql_query, (pw_id,))
        conn.commit()
        
        sql_query = "DELETE FROM nodes WHERE type = 'pathway' AND foreign_id = ?;"
        my_cur.execute(sql_query, (pw_id,))
        conn.commit()
        
        sql_query = "DELETE FROM nodes WHERE pathway_id = ?;"
        my_cur.execute(sql_query, (pw_id,))
        conn.commit()
        
        sql_query = "DELETE FROM pathways WHERE id = ?;"
        my_cur.execute(sql_query, (pw_id,))
        conn.commit()
        
        
        
    sql_query = "DELETE FROM pathway_groups WHERE id = ?;"
    my_cur.execute(sql_query, (entity_id,))
    conn.commit()
    
conn.commit()
print(0)