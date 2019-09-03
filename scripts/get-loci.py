#!/usr/bin/python3

from pymysql import connect, cursors
import json
from cgi import FieldStorage


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

try:
    a = int(species)
except:
    print(-2)
    exit()



# open mysql connection
conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()

# create fasta file
sql_query = "SELECT ln.id, ln.name locus, count(pl.protein_id) cnt FROM loci_names ln INNER JOIN protein_loci pl ON ln.id = pl.locus_id INNER JOIN proteins p ON pl.protein_id = p.id WHERE p.species = %s GROUP BY ln.id, ln.name order by ln.name;" % species
my_cur.execute(sql_query)
loci = [[row[0], "%s (%s)" % (row[1], row[2])] for row in my_cur]
print(json.dumps(loci))
