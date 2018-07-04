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

print("Content-Type: text/html")
print()



form = cgi.FieldStorage()
proteins = form.getvalue('proteins')
spectra = form.getvalue('spectra')
species = form.getvalue('species')

proteins = proteins.replace("'", "")
proteins = proteins.replace(" ", "")
proteins = proteins.replace(":", ",")


spectra = spectra.replace("'", "")
spectra = spectra.replace(" ", "")
spectra = spectra.split(":")


species = species.replace("'", "")
species = species.replace(" ", "")
species = species.replace(":", ",")


rnd = hashlib.md5(str(int(random() * 1000000000)).encode('utf-8')).hexdigest()

# create folder
os.system("mkdir ../tmp/%s" % rnd)


# open mysql connection & create fasta file
conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()

fasta_file = "../tmp/%s/proteins.fasta" % rnd
sql_query = "SELECT fasta FROM proteins WHERE id IN (%s);" % proteins
my_cur.execute(sql_query)
with open(fasta_file, mode="wt") as fl:
    for row in my_cur:
        fl.write(row[0] + "\n")



# create blib file
blib_file = "../tmp/%s/spectra.blib" % rnd
db = sqlite3.connect(conf["spectra_db_%s" % species])
lite_cur = db.cursor()
lite_cur.execute("ATTACH DATABASE '%s' As blib;" % blib_file)
lite_cur.execute("CREATE TABLE blib.tmp (id INTEGER PRIMARY KEY, sid INTEGER);")
db.commit()











lite_cur.execute("CREATE TABLE blib.SpectrumSourceFiles (id INTEGER PRIMARY KEY autoincrement not null, fileName VARCHAR(512), cutoffScore REAL);")
lite_cur.execute("CREATE TABLE blib.ScoreTypes (id INTEGER PRIMARY KEY, scoreType VARCHAR(128), probabilityType VARCHAR(128));")
lite_cur.execute("INSERT INTO blib.`ScoreTypes` (id,scoreType,probabilityType) VALUES (0,'UNKNOWN','NOT_A_PROBABILITY_VALUE'), \
 (1,'PERCOLATOR QVALUE','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT'), \
 (2,'PEPTIDE PROPHET SOMETHING','PROBABILITY_THAT_IDENTIFICATION_IS_CORRECT'), \
 (3,'SPECTRUM MILL','NOT_A_PROBABILITY_VALUE'), \
 (4,'IDPICKER FDR','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT'), \
 (5,'MASCOT IONS SCORE','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT'), \
 (6,'TANDEM EXPECTATION VALUE','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT'), \
 (7,'PROTEIN PILOT CONFIDENCE','PROBABILITY_THAT_IDENTIFICATION_IS_CORRECT'), \
 (8,'SCAFFOLD SOMETHING','PROBABILITY_THAT_IDENTIFICATION_IS_CORRECT'), \
 (9,'WATERS MSE PEPTIDE SCORE','NOT_A_PROBABILITY_VALUE'), \
 (10,'OMSSA EXPECTATION SCORE','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT'), \
 (11,'PROTEIN PROSPECTOR EXPECTATION SCORE','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT'), \
 (12,'SEQUEST XCORR','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT'), \
 (13,'MAXQUANT SCORE','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT'), \
 (14,'MORPHEUS SCORE','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT'), \
 (15,'MSGF+ SCORE','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT'), \
 (16,'PEAKS CONFIDENCE SCORE','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT'), \
 (17,'BYONIC SCORE','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT'), \
 (18,'PEPTIDE SHAKER CONFIDENCE','PROBABILITY_THAT_IDENTIFICATION_IS_CORRECT'), \
 (19,'GENERIC Q-VALUE','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT');")
lite_cur.execute("CREATE TABLE blib.RetentionTimes (RefSpectraID INTEGER, RedundantRefSpectraID INTEGER, SpectrumSourceID INTEGER, ionMobility REAL,  collisionalCrossSectionSqA REAL, ionMobilityHighEnergyOffset REAL, ionMobilityType TINYINT, retentionTime REAL, bestSpectrum INTEGER, FOREIGN KEY(RefSpectraID)  REFERENCES RefSpectra(id) );")
lite_cur.execute("CREATE TABLE blib.RefSpectraPeaks(RefSpectraID INTEGER, peakMZ BLOB, peakIntensity BLOB);")
lite_cur.execute("CREATE TABLE blib.RefSpectraPeakAnnotations (id INTEGER primary key autoincrement not null, RefSpectraID INTEGER not null, peakIndex INTEGER not null, name VARCHAR(256), formula VARCHAR(256),inchiKey VARCHAR(256), otherKeys VARCHAR(256), charge INTEGER, adduct VARCHAR(256), comment VARCHAR(256), mzTheoretical REAL not null,mzObserved REAL not null);")
lite_cur.execute("CREATE TABLE blib.RefSpectra (id INTEGER primary key autoincrement not null, peptideSeq VARCHAR(150), precursorMZ REAL, precursorCharge INTEGER, peptideModSeq VARCHAR(200), prevAA CHAR(1), nextAA CHAR(1), copies INTEGER, numPeaks INTEGER, ionMobility REAL, collisionalCrossSectionSqA REAL, ionMobilityHighEnergyOffset REAL, ionMobilityType TINYINT, retentionTime REAL, moleculeName VARCHAR(128), chemicalFormula VARCHAR(128), precursorAdduct VARCHAR(128), inchiKey VARCHAR(128), otherKeys VARCHAR(128), fileID INTEGER, SpecIDinFile VARCHAR(256), score REAL, scoreType TINYINT );")
lite_cur.execute("CREATE TABLE blib.Modifications (id INTEGER primary key autoincrement not null, RefSpectraID INTEGER, position INTEGER, mass REAL);")
lite_cur.execute("CREATE TABLE blib.LibInfo(libLSID TEXT, createTime TEXT, numSpecs INTEGER, majorVersion INTEGER, minorVersion INTEGER);")
lite_cur.execute("INSERT INTO blib.`LibInfo` (libLSID,createTime,numSpecs,majorVersion,minorVersion) VALUES ('urn:lsid:stamp.isas.de:spectral_library:stamp:nr:spectra','Tue Jul 03 10:43:40 2018',4248,1,7);")
lite_cur.execute("CREATE TABLE blib.IonMobilityTypes (id INTEGER PRIMARY KEY, ionMobilityType VARCHAR(128) );")
lite_cur.execute("INSERT INTO blib.`IonMobilityTypes` (id,ionMobilityType) VALUES (0,'none'), \
 (1,'driftTime(msec)'), \
 (2,'inverseK0(Vsec/cm^2)');")
lite_cur.execute("CREATE INDEX blib.idxRefIdPeaks ON RefSpectraPeaks (RefSpectraID);")
lite_cur.execute("CREATE INDEX blib.idxRefIdPeakAnnotations ON RefSpectraPeakAnnotations (RefSpectraID);")
lite_cur.execute("CREATE INDEX blib.idxPeptideMod ON RefSpectra (peptideModSeq, precursorCharge);")
lite_cur.execute("CREATE INDEX blib.idxPeptide ON RefSpectra (peptideSeq, precursorCharge);")
lite_cur.execute("CREATE INDEX blib.idxMoleculeName ON RefSpectra (moleculeName, precursorAdduct);")
lite_cur.execute("CREATE INDEX blib.idxInChiKey ON RefSpectra (inchiKey, precursorAdduct);")
db.commit()





for sid in spectra:
    lite_cur.execute("INSERT INTO blib.tmp (sid) VALUES (%s);" % sid)
db.commit()

lite_cur.execute("INSERT INTO blib.RefSpectra SELECT tt.id, rs.peptideSeq, rs.precursorMZ, rs.precursorCharge, rs.peptideModSeq, rs.prevAA, rs.nextAA, rs.copies, rs.numPeaks, 0, rs.collisionalCrossSectionSqA, 0, 0, rs.retentionTime, '', '', '', '', '', rs.fileID, rs.SpecIDinFile, rs.score, rs.scoreType FROM RefSpectra rs INNER JOIN blib.tmp tt on rs.id = tt.sid ORDER BY tt.id;")
db.commit()

lite_cur.execute("INSERT INTO blib.Modifications(RefSpectraID, position, mass) SELECT tt.id, m.position, m.mass FROM Modifications m INNER JOIN blib.tmp tt ON m.RefSpectraID = tt.sid ORDER BY tt.id;")
db.commit()

lite_cur.execute("INSERT INTO blib.RefSpectraPeaks SELECT tt.id, rsp.peakMZ, rsp.peakIntensity FROM RefSpectraPeaks rsp INNER JOIN blib.tmp tt ON rsp.RefSpectraID = tt.sid ORDER BY tt.id;")
db.commit()

lite_cur.execute("INSERT INTO blib.SpectrumSourceFiles SELECT *, 0 FROM SpectrumSourceFiles;")
db.commit()

lite_cur.execute("INSERT INTO blib.RetentionTimes SELECT tt.id, rt.RedundantRefSpectraID, rt.SpectrumSourceID, 0, rt.collisionalCrossSectionSqA, 0, 0, rt.retentionTime, rt.bestSpectrum FROM RetentionTimes rt INNER JOIN blib.tmp tt ON rt.RefSpectraID = tt.sid ORDER BY tt.id;")
db.commit()

lite_cur.execute("UPDATE blib.LibInfo SET numSpecs = %i;" % len(spectra))
lite_cur.execute("UPDATE blib.LibInfo SET createTime = date('now');")
lite_cur.execute("DROP TABLE blib.tmp;")
db.commit()





# merge into zip file
zip_file = "../tmp/%s/assay.zip" % rnd
os.system("zip -j %s %s %s > /dev/null" % (zip_file, fasta_file, blib_file))

#send download link back
print("/stamp/tmp/%s/assay.zip" % rnd)
