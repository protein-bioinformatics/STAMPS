#!/usr/bin/python3


import sys
from pymysql import connect, cursors


conf = {}
with open("../qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")


conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()
    
"""
pw_id = -1
try:
    sql_query = "SELECT id FROM pathways;"
    my_cur.execute(sql_query)
    pw_id = my_cur.fetchone()[0]

except:
    print("pathway id could not be retrieved")
    exit()
  
"""
  
revert_commands = []
  
try:
    print("testing reagents table")
    sql_query = "INSERT INTO reagents (reaction_id, node_id, type, anchor) VALUES (%s, %s, %s, %s);"
    my_cur.execute(sql_query, ("20", "5", "educt", "top"))
    conn.commit()
    sql_query = "SELECT max(id) max_id FROM reagents;"
    my_cur.execute(sql_query)
    max_id = my_cur.fetchone()[0] 
    revert_commands.append("DELETE FROM reagents WHERE id = %i;" % max_id)
    
    
    
    print("testing reactions_direct table")
    sql_query = "INSERT INTO reactions_direct (node_id_start, node_id_end, anchor_start, anchor_end, head) VALUES (%s, %s, %s, %s, %s);"
    my_cur.execute(sql_query, ("20", "5", "left", "right", "2"))
    conn.commit()
    sql_query = "SELECT max(id) max_id FROM reactions_direct;"
    my_cur.execute(sql_query)
    max_id = my_cur.fetchone()[0]  
    revert_commands.append("DELETE FROM reactions_direct WHERE id = %i;" % max_id)
    
    
    
    print("testing nodes table")    
    sql_query = "INSERT INTO nodes (pathway_id, type, foreign_id, x, y) VALUES (%s, %s, %s, %s, %s);"
    my_cur.execute(sql_query, ("20", "pathway", "22", "800", "-725"))
    conn.commit()
    sql_query = "SELECT max(id) max_id FROM nodes;"
    my_cur.execute(sql_query)
    max_id = my_cur.fetchone()[0] 
    revert_commands.append("DELETE FROM nodes WHERE id = %i;" % max_id)
    
except:
    print("An error has occured here!")


for command in revert_commands:
    my_cur.execute(command)
conn.commit()

