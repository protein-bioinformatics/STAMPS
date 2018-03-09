#!/usr/bin/python3


import json
from pymysql import connect, cursors
import cgi, cgitb
import zlib
import gzip
import sys
import os
import binascii

a = "Content-Type: text/html\nContent-Encoding: deflate\n\n"

sys.stdout.buffer.write( bytes(a, "utf-8"))

conf = {}
with open("../qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")

try:
    form = cgi.FieldStorage()
    action = form.getvalue('action')
except:
    sys.stdout.buffer.write( zlib.compress( bytes("-1", "utf-8") ) )
    exit()
    
    

conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()
    

if action not in ["get", "set"]:
    sys.stdout.buffer.write( zlib.compress( bytes("-2", "utf-8") ) )
    exit()

if action == "set":
    try:
        set_table = form.getvalue('table')
        set_id = form.getvalue('id')
        set_col = form.getvalue('column')
        set_value = form.getvalue('value')
        
        a = int(set_id)
    except:
        sys.stdout.buffer.write( zlib.compress( bytes("-3", "utf-8") ) )
        exit()
    
    set_table = set_table.replace("\"", "").replace("'", "")
    set_col = set_col.replace("\"", "").replace("'", "")
    set_value = set_value.replace("\"", "").replace("'", "")
    
    
    
    if set_table == "nodeproteincorrelations":
        try:
            sql_query = "DELETE FROM " + set_table + " WHERE node_id = %s;"
            my_cur.execute(sql_query, (set_id))
            conn.commit()
            
            for protein_id in set_value.split(":"):
                sql_query = "INSERT INTO " + set_table + "(node_id, protein_id) VALUES(%s, %s);"
                my_cur.execute(sql_query, (set_id, int(protein_id)))
                conn.commit()
            
        except:
            sys.stdout.buffer.write( zlib.compress( bytes("-6", "utf-8") ) )
            exit()
        
        
    else:
        try:
            sql_query = "UPDATE " + set_table + " SET " + set_col + " = %s WHERE id = %s;"
            my_cur.execute(sql_query, (set_value, set_id))
            conn.commit()
        except:
            sys.stdout.buffer.write( zlib.compress( bytes("-4", "utf-8") ) )
            exit()
    
    sys.stdout.buffer.write( zlib.compress( bytes("0", "utf-8") ) )


elif action == "get":
    try:
        action_type = form.getvalue('type')
    except:
        sys.stdout.buffer.write( zlib.compress( bytes("-4", "utf-8") ) )
        exit()
    
    if action_type not in ["pathways", "proteins", "metabolites"]:
        sys.stdout.buffer.write( zlib.compress( bytes("-5", "utf-8") ) )
        exit()
    

    # add metabolite data
    my_cur.execute("SELECT * from %s;" % action_type)
    data = json.dumps({entry[0]: entry for entry in my_cur})
    sys.stdout.buffer.write( zlib.compress( bytes(data, "utf-8") ) )
    