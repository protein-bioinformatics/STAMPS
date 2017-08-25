#!/usr/bin/python3

from pymysql import connect, cursors
import cgi, cgitb
import sqlite3
from random import random
import os
import hashlib

conf = {}
with open("../admin/qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")


form = cgi.FieldStorage()
proteins = form.getvalue('proteins')
spectra = form.getvalue('spectra')

proteins = proteins.replace("'", "")
proteins = proteins.replace(":", ",")
proteins = proteins.replace(" ", "")


spectra = spectra.replace("'", "")
spectra = spectra.replace(" ", "")
spectra = spectra.split(":")

print("Content-Type: text/html")
print()

rnd = hashlib.md5(str(int(random() * 1000000000)).encode('utf-8')).hexdigest()

# create folder
os.system("mkdir ../tmp/%s" % rnd)


# open mysql connection
conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()

# create blib file
blib_file = "../tmp/%s/spectra.blib" % rnd
db = sqlite3.connect(conf["sqlite_file"])
lite_cur = db.cursor()
lite_cur.execute("ATTACH DATABASE '%s' As blib;" % blib_file)
lite_cur.execute("CREATE TABLE blib.tmp (sid int)")
db.commit()

for sid in spectra:
    lite_cur.execute("INSERT INTO blib.tmp (sid) VALUES (%s);" % sid)
db.commit()


lite_cur.execute("CREATE TABLE blib.RefSpectra AS SELECT rs.* FROM RefSpectra rs INNER JOIN blib.tmp tt on rs.id = tt.sid;")
db.commit()

lite_cur.execute("CREATE TABLE blib.Modifications AS SELECT m.* FROM Modifications m INNER JOIN blib.RefSpectra ref ON m.RefSpectraID = ref.id;")
db.commit()

lite_cur.execute("CREATE TABLE blib.RefSpectraPeaks AS SELECT rsp.* FROM RefSpectraPeaks rsp INNER JOIN blib.RefSpectra brs ON rsp.RefSpectraID = brs.id;")
lite_cur.execute("CREATE TABLE blib.LibInfo AS SELECT * FROM LibInfo;")
lite_cur.execute("CREATE TABLE blib.SpectrumSourceFiles AS SELECT * FROM SpectrumSourceFiles;")
lite_cur.execute("CREATE TABLE blib.ScoreTypes AS SELECT * FROM ScoreTypes;")
lite_cur.execute("CREATE TABLE blib.RetentionTimes AS SELECT * FROM RetentionTimes rt INNER JOIN blib.RefSpectra ref ON rt.RefSpectraID = ref.id;")
db.commit()

lite_cur.execute("DROP TABLE blib.tmp;")
db.commit()


# create fasta file
fasta_file = "../tmp/%s/proteins.fasta" % rnd
sql_query = "SELECT fasta FROM proteins WHERE id IN (%s);" % proteins
my_cur.execute(sql_query)
with open(fasta_file, mode="wt") as fl:
    for row in my_cur:
        fl.write(row[0] + "\n")


# merge into zip file
zip_file = "../tmp/%s/assay.zip" % rnd
os.system("zip -j %s %s %s" % (zip_file, fasta_file, blib_file))

#send download link back
print("/qsdb/tmp/%s/assay.zip" % rnd)
