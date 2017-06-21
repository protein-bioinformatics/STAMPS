#!/usr/bin/python3

from pymysql import connect, cursors
import json

#import cgi, cgitb
#import sqlite3

conf = {}
with open("../admin/qsdb.conf", mode="rt") as fl:
    for line in fl:
        if line.strip().strip(" ")[0] == "#": continue
        token = line.strip().strip(" ").split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")



print("Content-Type: text/html")
print()


# open mysql connection
conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()


# create fasta file
sql_query = "SELECT ln.id, ln.name locus, count(pl.protein_id) cnt FROM loci_names ln INNER JOIN protein_loci pl ON ln.id = pl.locus_id GROUP BY ln.id, ln.name order by ln.name;"
my_cur.execute(sql_query)
loci = [[row[0], "%s (%s)" % (row[1], row[2])] for row in my_cur]
print(json.dumps(loci))
