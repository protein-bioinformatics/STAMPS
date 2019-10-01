#!/usr/bin/python3

import json
import sqlite3
import cgi, cgitb

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




database = "%s/data/database.sqlite" % conf["root_path"]
db = sqlite3.connect(database)
my_cur = db.cursor()



form = cgi.FieldStorage()
chromosome = form.getvalue('chromosome') if "chromosome" in form else ""
species = form.getvalue('species') if "species" in form else ""

if len(chromosome) == 0 or len(species) == 0:
    print(-1)
    exit()

if chromosome.find("'") > -1 or chromosome.find("\"") > -1:
    print(-2)
    exit()



my_cur.execute("SELECT id, name, definition, kegg_link, accession, ec_number, chr_start, chr_end from proteins where chromosome = '%s' and unreviewed = 0 and species = '%s' ORDER BY chr_start ASC;" % (chromosome, species))
data = [row for row in my_cur]
print(json.dumps(data))