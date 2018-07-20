#!/usr/bin/python3
from cgi import FieldStorage
from pymysql import connect, cursors
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
    


filepath = os.path.dirname(os.path.abspath(__file__))
filename = "%s/../../images/visual_images/I%s.%s" % (filepath, node_id, extension)
content = (content + '===')[: len(content) + (len(content) % 4)]
content = content.replace('-', '+').replace('_', '/')
content = b64decode(content)


write = True
if extension.lower() == "svg":
    root = ET.fromstring(content)
    if "width" not in root.attrib or "height" not in root.attrib:
        write = False
        if "viewBox" in root.attrib:
            viewBox = root.attrib["viewBox"]
            root.attrib["width"] = viewBox.split(" ")[2]
            root.attrib["height"] = viewBox.split(" ")[3]
        tree = ET.ElementTree(root)
        tree.write(filename, encoding="UTF-8")
        
        
if write:
    with open(filename, mode="wb") as fl:
        fl.write(content)
    

conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor(cursors.DictCursor)

my_cur.execute("UPDATE nodes SET position = '%s' where id = %s" % (extension, node_id))
conn.commit()

print(0)
