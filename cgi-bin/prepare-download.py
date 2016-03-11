#!/home/dominik.kopczynski/anaconda3/bin/python3.5

from pymysql import connect, cursors
import cgi, cgitb
import sqlite3
from random import random
import os
from defines import *


form = cgi.FieldStorage()
proteins = form.getvalue('proteins')
proteins = proteins.replace(":", ", ")


print("Content-Type: text/html")
print()

rnd = str(int(random() * 1000000000))

# create folder
os.system("mkdir ../tmp/%s" % rnd)

# create fasta file
fasta_file = "../tmp/%s/proteins.fasta" % rnd
conn = connect(host = mysql_host, port = mysql_port, user = mysql_user, passwd = mysql_passwd, db = mysql_db)
my_cur = conn.cursor()
sql_query = "SELECT fasta FROM proteins WHERE id IN (%s);" % proteins
my_cur.execute(sql_query)
with open(fasta_file, mode="wt") as fl:
    for row in my_cur:
        fl.write(row[0] + "\n")



# create blib file
blib_file = "../tmp/%s/spectra.blib" % rnd
db = sqlite3.connect(sqlite_file)
lite_cur = db.cursor()
lite_cur.execute("ATTACH DATABASE '%s' As blib;" % blib_file)

sql_query = "SELECT pe.peptide_seq FROM peptides pe INNER JOIN proteins pr ON pe.protein_id = pr.id WHERE pr.id IN (%s);" % proteins
my_cur.execute(sql_query)
peptides = "', '".join(row[0] for row in my_cur)



#lite_cur.execute("CREATE TABLE blib.relations (n_id INTEGER PRIMARY KEY ASC, o_id INTEGER);")
#lite_cur.execute("INSERT INTO blib.relations (o_id) SELECT id FROM RefSpectra WHERE peptideSeq IN ('%s');" % peptides)
#db.commit()

#lite_cur.execute("CREATE TABLE blib.RefSpectra (id INTEGER PRIMARY KEY ASC, peptideSeq VARCHAR(150), precursorMZ REAL, precursorCharge INTEGER, peptideModSeq VARCHAR(200), prevAA CHAR(1), nextAA CHAR(1), copies INTEGER, numPeaks INTEGER, ionMobilityValue REAL, ionMobilityType INTEGER, ionMobilityHighEnergyDriftTimeOffsetMsec REAL, retentionTime REAL, fileID INTEGER, SpecIDinFile VARCHAR(256), score REAL, scoreType TINYINT);")
#lite_cur.execute("INSERT INTO blib.RefSpectra (peptideSeq, precursorMZ, precursorCharge, peptideModSeq, prevAA, nextAA, copies, numPeaks, ionMobilityValue, ionMobilityType, ionMobilityHighEnergyDriftTimeOffsetMsec, retentionTime, fileID, SpecIDinFile, score, scoreType) SELECT peptideSeq, precursorMZ, precursorCharge, peptideModSeq, prevAA, nextAA, copies, numPeaks, ionMobilityValue, ionMobilityType, ionMobilityHighEnergyDriftTimeOffsetMsec, retentionTime, fileID, SpecIDinFile, score, scoreType FROM RefSpectra WHERE peptideSeq IN ('%s');" % peptides)
lite_cur.execute("CREATE TABLE blib.RefSpectra AS SELECT * FROM RefSpectra WHERE peptideSeq IN ('%s');" % peptides)
db.commit()

#lite_cur.execute("CREATE TABLE blib.Modifications (id INTEGER PRIMARY KEY ASC, RefSpectraID INTEGER, position INTEGER, mass REAL);")
#lite_cur.execute("INSERT INTO blib.Modifications (RefSpectraID, position, mass) SELECT m.RefSpectraID, m.position, m.mass FROM Modifications m INNER JOIN blib.relations rel ON m.RefSpectraID = rel.o_id;")
lite_cur.execute("CREATE TABLE blib.Modifications AS SELECT m.* FROM Modifications m INNER JOIN blib.RefSpectra ref ON m.RefSpectraID = ref.id;")
db.commit()

lite_cur.execute("CREATE TABLE blib.RefSpectraPeaks AS SELECT rsp.* FROM RefSpectraPeaks rsp INNER JOIN blib.RefSpectra brs ON rsp.RefSpectraID = brs.id;")
lite_cur.execute("CREATE TABLE blib.LibInfo AS SELECT * FROM LibInfo;")
lite_cur.execute("CREATE TABLE blib.SpectrumSourceFiles AS SELECT * FROM SpectrumSourceFiles;")
lite_cur.execute("CREATE TABLE blib.ScoreTypes AS SELECT * FROM ScoreTypes;")
lite_cur.execute("CREATE TABLE blib.RetentionTimes AS SELECT * FROM RetentionTimes rt INNER JOIN blib.RefSpectra ref ON rt.RefSpectraID = ref.id;")
db.commit()


#lite_cur.execute("UPDATE blib.Modifications SET RefSpectraID = (SELECT n_id FROM blib.relations WHERE o_id = blib.Modifications.RefSpectraID);")
#lite_cur.execute("UPDATE blib.RetentionTimes SET RefSpectraID = (SELECT n_id FROM blib.relations WHERE o_id = blib.RetentionTimes.RefSpectraID);")
#lite_cur.execute("DELETE FROM blib.RetentionTimes WHERE RedundantRefSpectraID NOT IN (SELECT o_id FROM blib.relations);")
# delete SpectrumSourceID from RetentionTimes


#lite_cur.execute("DROP TABLE blib.relations;")
db.commit()

# merge into zip file
zip_file = "../tmp/%s/assay.zip" % rnd
os.system("zip -j %s %s %s" % (zip_file, fasta_file, blib_file))


#send download link back
print("/qsdb/tmp/%s/assay.zip" % rnd)
