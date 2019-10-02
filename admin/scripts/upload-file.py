#!/usr/bin/python3
from cgi import FieldStorage
import sqlite3
from base64 import b64decode
import xml.etree.ElementTree as ET
import os

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

form = FieldStorage(environ={'REQUEST_METHOD':'POST'})
node_id = form.getvalue('id') if 'id' in form else ""
content = form.getvalue('content') if 'content' in form else ""
extension = form.getvalue('extension') if 'extension' in form else ""



if type(node_id) is not str or len(content) == 0:
    print(-1)
    exit()
    


content = content + ('=' * (4 - (len(content) % 4)) if len(content) % 4 != 0 else "")
content = content.replace('-', '+').replace('_', '/')


conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor(cursors.DictCursor)

my_cur.execute("SELECT * FROM images WHERE node_id = ?;", (node_id,))
if my_cur.rowcount > 0:
    my_cur.execute("UPDATE images SET image = ? WHERE node_id = ?;", (content, node_id))
    my_cur.execute("UPDATE images SET image_type = ? WHERE node_id = ?;", (extension.lower(), node_id))
    my_cur.execute("UPDATE images SET factor = 10000 WHERE node_id = ?;", (node_id,))
    
else:
    my_cur.execute("INSERT INTO images (node_id, image, image_type, factor) VALUES (?, ?, ?, 10000);", (node_id, content, extension.lower()))
conn.commit()

print(0)
