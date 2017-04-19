#!/home/dominik.kopczynski/anaconda3/bin/python3.5

from pymysql import connect, cursors
import cgi, cgitb
import sqlite3
from random import random
import os
from defines import *
import hashlib


form = cgi.FieldStorage()
spectra = form.getvalue('spectra')
spectra = spectra.replace(":", ", ")


print("Content-Type: text/html")
print()

rnd = hashlib.md5(str(int(random() * 1000000000)).encode('utf-8')).hexdigest()

# create folder
os.system("mkdir ../tmp/%s" % rnd)

# create fasta file
fasta_file = "../tmp/%s/proteins.fasta" % rnd
conn = connect(host = mysql_host, port = mysql_port, user = mysql_user, passwd = mysql_passwd, db = mysql_db)
my_cur = conn.cursor()
sql_query = "SELECT fasta FROM proteins WHERE accession IN ('%s');" % proteins
my_cur.execute(sql_query)
with open(fasta_file, mode="wt") as fl:
    for row in my_cur:
        fl.write(row[0] + "\n")



# create blib file
blib_file = "../tmp/%s/spectra.blib" % rnd
db = sqlite3.connect(sqlite_file)
lite_cur = db.cursor()
lite_cur.execute("ATTACH DATABASE '%s' As blib;" % blib_file)
lite_cur.execute("CREATE TABLE blib.tmp (pep text, charge int)")
db.commit()

sql_query = "SELECT pe.peptide_seq, ps.charge FROM peptides pe INNER JOIN peptide_spectra ps ON pe.id = ps.peptide_id WHERE ps.id IN (%s);" % spectra
my_cur.execute(sql_query)
for row in my_cur:
    lite_cur.execute("INSERT INTO blib.tmp (pep, charge) VALUES (?, ?);", (row[0], row[1]))
db.commit()


lite_cur.execute("CREATE TABLE blib.RefSpectra AS SELECT rs.* FROM RefSpectra rs INNER JOIN blib.tmp tt on rs.peptideSeq = tt.pep WHERE rs.precursorCharge = tt.charge;")
db.commit()

lite_cur.execute("CREATE TABLE blib.Modifications AS SELECT m.* FROM Modifications m INNER JOIN blib.RefSpectra ref ON m.RefSpectraID = ref.id;")
db.commit()

lite_cur.execute("CREATE TABLE blib.RefSpectraPeaks AS SELECT rsp.* FROM RefSpectraPeaks rsp INNER JOIN blib.RefSpectra brs ON rsp.RefSpectraID = brs.id;")
lite_cur.execute("CREATE TABLE blib.LibInfo AS SELECT * FROM LibInfo;")
lite_cur.execute("CREATE TABLE blib.SpectrumSourceFiles AS SELECT * FROM SpectrumSourceFiles;")
lite_cur.execute("CREATE TABLE blib.ScoreTypes AS SELECT * FROM ScoreTypes;")
lite_cur.execute("CREATE TABLE blib.RetentionTimes AS SELECT * FROM RetentionTimes rt INNER JOIN blib.RefSpectra ref ON rt.RefSpectraID = ref.id;")
db.commit()

# merge into zip file
zip_file = "../tmp/%s/assay.zip" % rnd
os.system("zip -j %s %s %s" % (zip_file, fasta_file, blib_file))

#send download link back
print("/qsdb/tmp/%s/assay.zip" % rnd)
