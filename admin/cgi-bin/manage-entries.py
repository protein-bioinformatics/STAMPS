#!/usr/bin/python3


import json
from pymysql import connect, cursors
import cgi, cgitb
import zlib
import gzip
import sys
import os
import binascii



sys.stdout.buffer.write( bytes("Content-Type: text/html\nContent-Encoding: deflate\n\n", "utf-8"))

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
except:
    sys.stdout.buffer.write( zlib.compress( bytes("-1", "utf-8") ) )
    exit()
    
    
action = form.getvalue('action') if "action" in form else ""
if len(action) == 0:
    sys.stdout.buffer.write( zlib.compress( bytes("-8", "utf-8") ) )
    exit()

conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()
    

if action not in ["get", "set", "insert"]:
    sys.stdout.buffer.write( zlib.compress( bytes("-2", "utf-8") ) )
    exit()

if action == "set":
    set_table = form.getvalue('table') if 'table' in form else ""
    set_id = form.getvalue('id') if 'id' in form else ""
    set_col = form.getvalue('column') if 'column' in form else ""
    set_value = form.getvalue('value') if 'value' in form else ""
        
    try:
        a = int(set_id)
    except:
        sys.stdout.buffer.write( zlib.compress( bytes("-3", "utf-8") ) )
        exit()
        
    if set_table == "" or set_id == "" or set_col == "":
        sys.stdout.buffer.write( zlib.compress( bytes("-9", "utf-8") ) )
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
        if set_table == "metabolites" and set_col == "smiles":
            filepath = os.path.dirname(os.path.abspath(__file__))
            command = "java -cp %s/cdk-2.0.jar:%s DrawChem '%s' '%s' '%s'" % (filepath, filepath, filepath, set_id, set_value)
            os.system(command)
            
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
    
    if action_type in ["pathways", "proteins", "metabolites"]:
        order_col = form.getvalue('column') if "column" in form else ""
        limit = form.getvalue('limit') if "limit" in form else ""
        filters = form.getvalue('filters') if "filters" in form else ""
        checked = form.getvalue('checked') if "checked" in form else ""
        
        sql_query = "SELECT * from %s" % action_type
        
        if checked != "":
            sql_query += " INNER JOIN nodeproteincorrelations ON id = protein_id WHERE node_id = %i" % int(checked)
        
        if len(filters) > 0:
            filters = filters.replace("\"", "").replace("'", "")
            tokens = filters.split(",")
                    
            for i, token in enumerate(tokens):
                sql_query += " WHERE" if i == 0 and not checked else " AND"
                tt = token.split(":")
                sql_query += " LOWER(%s) LIKE '%%%s%%'" % (tt[0], tt[1])
                
            
        if len(order_col) > 0:
            order_col = order_col.replace("\"", "").replace("'", "")
            tokens = order_col.split(":")
            sql_query += " ORDER BY %s" % tokens[0]
            if len(tokens) > 1: sql_query += " %s" % tokens[1]
            
            
        if  len(limit) > 0:
            limit = limit.replace("\"", "").replace("'", "")
            sql_query += " LIMIT %s" % limit.replace(":", ",")
            
        
        # add metabolite data
        try:
            my_cur.execute(sql_query)
            data = json.dumps({entry[0]: entry for entry in my_cur})
            sys.stdout.buffer.write( zlib.compress( bytes(data, "utf-8") ) )
        except:
            sys.stdout.buffer.write( zlib.compress( bytes("-7", "utf-8") ) )
            exit()
        
    elif action_type in ["proteins_num", "metabolites_num"]:
        # add metabolite data
        my_cur.execute("SELECT count(*) from %s;" % action_type.replace("_num", ""))
        data = json.dumps(my_cur.fetchone()[0])
        sys.stdout.buffer.write( zlib.compress( bytes(data, "utf-8") ) )
        
        
    elif action_type[-4:] == "_col":
        my_cur.execute("SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA` = %s AND `TABLE_NAME` = %s", (conf["mysql_db"], action_type[:-4]))
        data = json.dumps([entry[0] for entry in my_cur])
        sys.stdout.buffer.write( zlib.compress( bytes(data, "utf-8") ) )
        
    
    else:
        sys.stdout.buffer.write( zlib.compress( bytes("-5", "utf-8") ) )
        exit()
        
        
elif action == "insert":
    try:
        action_type = form.getvalue('type')
    except:
        sys.stdout.buffer.write( zlib.compress( bytes("-4", "utf-8") ) )
        exit()
    
    if action_type not in ["pathways", "proteins", "metabolites"]:
        sys.stdout.buffer.write( zlib.compress( bytes("-9", "utf-8") ) )
        exit()
        
    
    data = form.getvalue('data') if "data" in form else ""
    if data == "": 
        sys.stdout.buffer.write( zlib.compress( bytes("-10", "utf-8") ) )
        exit()
        
    data = data.split(",")
    smiles_data = ""
    for i, row in enumerate(data):
        row = row.split(":")
        row[0] = row[0].replace("\"", "").replace("'", "")
        if (len(row) >= 2):
            row[1] = (":".join(row[1:])).replace("\"", "").replace("'", "")
        else:
            row.append("")
        data[i] = row
        
        if action_type == "metabolites" and row[0] == "smiles" and len(row[1]) > 0:
            smiles_data = row[1]
        
    sql_query = "INSERT INTO %s (%s) VALUES ('%s');" % (action_type, ", ".join(row[0] for row in data), "','".join(row[1] for row in data))
    
    try:
        my_cur.execute(sql_query)
        conn.commit()
    except:
        sys.stdout.buffer.write( zlib.compress( bytes("-11", "utf-8") ) )
        exit()
        
        
    if action_type == "metabolites":
    
        sql_query = "SELECT max(id) max_id FROM metabolites;"
        my_cur.execute(sql_query)
        metabolite_id = my_cur.fetchone()[0]
        filepath = os.path.dirname(os.path.abspath(__file__))
        command = "java -cp %s/cdk-2.0.jar:%s DrawChem '%s' '%s' '%s'" % (filepath, filepath, filepath, metabolite_id, smiles_data)
        os.system(command)
        
    
    sys.stdout.buffer.write( zlib.compress( bytes("0", "utf-8") ) )
    
    

    
