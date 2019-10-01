#!/usr/bin/python3

import json
import sqlite3
from cgi import FieldStorage

print("Content-Type: text/html")
print()


conf = {}
with open("../admin/qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")

form = FieldStorage()
    
if "species" not in form:
    print(-1)
    exit()

species = form.getvalue('species')
hostname = form.getvalue('host') if "host" in form else ""

try:
    a = int(species)
except:
    print(-2)
    exit()
    
    
    
    
if hostname != "":
    request = "&".join(["%s=%s" % (key, form.getvalue(key)) for key in form if key != "host"])
    print(urlopen("%s/scripts/get-functions.py?%s" % (hostname, request), timeout = 2).read().decode("utf8"))
    
    exit()
    
    

database = "%s/data/database.sqlite" % conf["root_path"]
db = sqlite3.connect(database)
my_cur = db.cursor()


my_cur.execute("SELECT * FROM function_names")
functions = {row[0]: list(row) + [0, []] for row in my_cur}

my_cur.execute("SELECT function_id, count(function_id) cnt FROM `proteins` WHERE species = %s GROUP BY function_id HAVING function_id <> 0;" % species)
function_counts = {row[0]: row[1] for row in my_cur}


for function_id in function_counts:
    if function_id in functions: functions[function_id][4] = function_counts[function_id]


for key in sorted(functions.keys(), reverse = True):
    if functions[key][2] != 0:
        parent_key = functions[key][2]
        functions[parent_key][5].append(functions[key])
        del functions[key]
        
functions = functions[1]

def reverse_functions(row):
    row[5] = row[5][::-1]
    for child in row[5]:
        reverse_functions(child)
reverse_functions(functions)

print(json.dumps(functions))