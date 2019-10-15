#!/usr/bin/python3

import sqlite3
import json
from cgi import FieldStorage
from urllib.request import urlopen


conf = {}
with open("../admin/qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")



print("Content-Type: text/html")
print()


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
    try:
        request = "&".join(["%s=%s" % (key, form.getvalue(key)) for key in form if key != "host"])
        print(urlopen("%s/scripts/get-loci.py?%s" % (hostname, request), timeout = 2).read().decode("utf8"))
        
    except Exception as e:
        print("[]")
    
    exit()
    
    
    

# open database connection
database = "%s/data/database.sqlite" % conf["root_path"]
db = sqlite3.connect(database)
my_cur = db.cursor()



# create fasta file
sql_query = "SELECT ln.id, ln.name locus, count(pl.protein_id) cnt FROM loci_names ln INNER JOIN protein_loci pl ON ln.id = pl.locus_id INNER JOIN proteins p ON pl.protein_id = p.id WHERE p.species = %s GROUP BY ln.id, ln.name order by ln.name;" % species
my_cur.execute(sql_query)
loci = [[row[0], "%s (%s)" % (row[1], row[2])] for row in my_cur]
print(json.dumps(loci))
