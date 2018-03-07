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

form = cgi.FieldStorage()
action = form.getvalue('action')
action_type = form.getvalue('type')

if action not in ["get", "set"]:
    sys.stdout.buffer.write( zlib.compress( bytes("-1", "utf-8") ) )
    exit()

if action == "set":
    set_id = form.getvalue('id')
    set_value = form.getvalue('value')
    
    ## TODO: write set



elif action == "get":
    if action_type not in ["pathways", "proteins", "metabolites"]:
        sys.stdout.buffer.write( zlib.compress( bytes("-2", "utf-8") ) )
        exit()
    
    conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
    my_cur = conn.cursor()

    # add metabolite data
    my_cur.execute("SELECT * from %s;" % action_type)
    data = json.dumps({entry[0]: entry for entry in my_cur})
    sys.stdout.buffer.write( zlib.compress( bytes(data, "utf-8") ) )
    