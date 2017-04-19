#!/home/dominik.kopczynski/anaconda3/bin/python3.5

from pymysql import connect, cursors
import cgi, cgitb
import sqlite3
from random import random
import os
from defines import *
import hashlib


#form = cgi.FieldStorage()
#spectra = form.getvalue('spectra')

spectra = "3165:4167:4168:4170:5815:5816:5818:9252:9253:9254:10309:10310:10960:14221:15210:15211:16078:16079:16436:18065:23142:27672:27822:27823:29026:29027:29609:31291:33175:3156:5810:5811:5812:5813:8194:8195:9741:9742:9834:11058:11289:11736:15198:16426:16435:18834:24605:26452:27820:27821:29606:32127:33025:34044:2310:3735:3864:3865:4273:6451:6452:7387:7400:7414:8226:8590:9961:10749:10753:11112:11650:11651:11915:12730:12731:14720:14721:14996:16249:16788:16789:16860:17010:17377:17378:17858:18298:18859:18996:18997:20181:20182:20564:20620:21367:21614:21615:21616:24179:25513:26378:26872:27650:27651:27749:28063:28238:28239:28240:28241:28242:28243:28244:28245:28480:28623:29228:29528:30355:30895:31342:27695:30218:30558:30695:30696:32310:36426:5450:8213:11498:12490:12491:14781:25104:25105:26633:2640:2641:2642:2867:3241:3905:4228:6657:6658:6940:7045:8282:8283:9703:10235:12844:13013:13843:13844:13845:13964:13965:14768:15677:16351:16753:16754:16755:21009:26292:26891:26892:27384:27633:27634:27635:29392:30083:36626:14602:3884:3885:3886:7555:8592:11724:11762:11763:12113:12114:12511:13780:15965:15966:20324:20887:21872:21873:21874:23493:23494:24910:25122:26697:26699:26700:26938:27725:28949:28950:30393:30394:32369:33004:33012:33842:33924:34120:34320:34413:34414:35181:35485:35486:36551:36582:36794:37629:37914:38002:38003:2978:3801:4391:5808:7255:7256:7556:10945:10946:11074:14000:17628:20057:20058:33445:3475:4582:4583:10947:17612:18418:21686:28367:32072"


spectra = spectra.replace("'", "")
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
sql_query = "SELECT DISTINCT pr.fasta FROM proteins pr INNER JOIN peptides pep ON pr.id = pep.protein_id INNER JOIN peptide_spectra ps ON pep.id = ps.peptide_id WHERE ps.id IN (%s);" % spectra
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

lite_cur.execute("DROP TABLE blib.tmp;")
db.commit()

# merge into zip file
zip_file = "../tmp/%s/assay.zip" % rnd
os.system("zip -j %s %s %s" % (zip_file, fasta_file, blib_file))

#send download link back
print("/qsdb/tmp/%s/assay.zip" % rnd)
