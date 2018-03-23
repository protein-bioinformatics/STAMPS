#!/usr/bin/python3

from pymysql import connect, cursors
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

if type(entity_type) is not str or type(entity_id) is not str or entity_type not in ["node", "edge", "protein", "metabolite", "pathway"]:
    print(-1)
    exit()
   
try:
    a = int(entity_id)
except:
    print(-2)
    exit()
    
    
conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor(cursors.DictCursor)

if entity_type == "node":

    sql_query = "SELECT type FROM nodes WHERE id = %s;"
    my_cur.execute(sql_query, (entity_id))
    entity_type = [row for row in my_cur][0]["type"]    

    if entity_type in ["pathway", "protein"]:
        sql_query = "DELETE FROM reagents WHERE reaction_id IN (SELECT id FROM reactions WHERE node_id = %s);"
        my_cur.execute(sql_query, (entity_id))
        conn.commit()
        
        sql_query = "DELETE FROM reactions WHERE node_id = %s;"
        my_cur.execute(sql_query, (entity_id))
        conn.commit()
        
        if entity_type == "protein":
            sql_query = "DELETE FROM nodeproteincorrelations WHERE node_id = %s;"
            my_cur.execute(sql_query, (entity_id))
            conn.commit()
        
        sql_query = "DELETE FROM nodes WHERE id = %s;"
        my_cur.execute(sql_query, (entity_id))
        conn.commit()
        
        
    elif entity_type == "metabolite":
        sql_query = "SELECT rc.id FROM reactions rc INNER JOIN reagents r ON rc.id = r.reaction_id INNER JOIN nodes n ON rc.node_id = n.id WHERE r.node_id = %s AND n.type = 'pathway';" # reactions for pathways
        my_cur.execute(sql_query, (entity_id))
        del_reaction = ", ".join(str(row["id"]) for row in my_cur)
        
        if len(del_reaction) > 0:
            sql_query = "DELETE FROM reactions WHERE id IN (%s);" % del_reaction # reactions for pathways
            my_cur.execute(sql_query)
            conn.commit()
        
        sql_query = "DELETE FROM reagents WHERE node_id = %s;"
        my_cur.execute(sql_query, (entity_id))
        conn.commit()
        
        sql_query = "DELETE FROM nodes WHERE id = %s;"
        my_cur.execute(sql_query, (entity_id))
        conn.commit()
        
        
    elif entity_type in ["label", "membrane"]:
        sql_query = "DELETE FROM nodes WHERE id = %s;"
        my_cur.execute(sql_query, (entity_id))
        conn.commit()
    
    
elif entity_type == "edge":
    sql_query = "DELETE FROM reagents WHERE id = %s;"
    my_cur.execute(sql_query, (entity_id))
    conn.commit()
    
    
elif entity_type == "protein":
    sql_query = "DELETE FROM protein_functions WHERE protein_id = %s;"
    my_cur.execute(sql_query, (entity_id))
    conn.commit()
    
    sql_query = "DELETE FROM protein_loci WHERE protein_id = %s;"
    my_cur.execute(sql_query, (entity_id))
    conn.commit()
    
    sql_query = "DELETE FROM nodeproteincorrelations WHERE protein_id = %s;"
    my_cur.execute(sql_query, (entity_id))
    conn.commit()
            
    sql_query = "DELETE FROM proteins WHERE id = %s;"
    my_cur.execute(sql_query, (entity_id))
    conn.commit()
    
    
elif entity_type == "pathway":
        sql_query = "DELETE FROM reagents WHERE reaction_id IN (SELECT r.id FROM reactions r INNER JOIN nodes n on r.node_id = n.id WHERE n.type = 'pathway' AND foreign_id = %s);"
        my_cur.execute(sql_query, (entity_id))
        conn.commit()
        
        sql_query = "DELETE FROM reactions WHERE node_id IN (SELECT id FROM nodes WHERE type = 'pathway' AND foreign_id = %s);"
        my_cur.execute(sql_query, (entity_id))
        conn.commit()
        
        sql_query = "DELETE FROM nodes WHERE type = 'pathway' AND foreign_id = %s;"
        my_cur.execute(sql_query, (entity_id))
        conn.commit()
        
        sql_query = "DELETE FROM nodes WHERE pathway_id = %s;"
        my_cur.execute(sql_query, (entity_id))
        conn.commit()
        
        sql_query = "DELETE FROM pathways WHERE id = %s;"
        my_cur.execute(sql_query, (entity_id))
        conn.commit()
    
    
    
elif entity_type == "metabolite":
    
    
    sql_query = "SELECT rc.id FROM reactions rc INNER JOIN reagents r ON rc.id = r.reaction_id INNER JOIN nodes n ON rc.node_id = n.id INNER JOIN nodes nn ON r.node_id = nn.id INNER JOIN metabolites m ON nn.foreign_id = m.id WHERE m.id = %s AND n.type = 'pathway' AND nn.type = 'metabolite';" # reactions for pathways
    my_cur.execute(sql_query, (entity_id))
    del_reaction = ", ".join(str(row["id"]) for row in my_cur)
    
    if len(del_reaction) > 0:
        sql_query = "DELETE FROM reactions WHERE id IN (%s);" % del_reaction # reactions for pathways
        my_cur.execute(sql_query)
        conn.commit()
    
    sql_query = "SELECT n.id FROM nodes n INNER JOIN metabolites m ON n.foreign_id = m.id WHERE m.id = %s AND n.type = 'metabolite';"
    my_cur.execute(sql_query, (entity_id))
    del_nodes = ", ".join(str(row["id"]) for row in my_cur)
    
    if len(del_nodes) > 0:
        sql_query = "DELETE FROM reagents WHERE node_id IN (%s);" % del_nodes
        my_cur.execute(sql_query)
        conn.commit()
        
        sql_query = "DELETE FROM nodes WHERE id IN (%s);" % del_nodes
        my_cur.execute(sql_query)
        conn.commit()
    
    sql_query = "DELETE FROM metabolites WHERE id = %s;"
    my_cur.execute(sql_query, (entity_id))
    conn.commit()
    
    filepath = os.path.dirname(os.path.abspath(__file__))
    os.system("rm -f %s/../../images/metabolites/C%s.png" % (filepath, entity_id))
print(0)