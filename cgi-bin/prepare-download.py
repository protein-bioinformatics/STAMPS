#!/usr/bin/python3

from pymysql import connect, cursors
import cgi, cgitb
import sqlite3
from random import random
import os
import hashlib



def split_string(text, separator, quote):
    inQuote, tokens, token = False, [], ""
    
    for c in text:
        if not inQuote:
            if c == separator:
                if len(token) > 0: tokens.append(token)
                token = ""
                
            else:
                if c == quote: inQuote = not inQuote
                token += c
                
        else:
            if c == quote: inQuote = not inQuote
            token += c
            
    if len(token) > 0: tokens.append(token)
    return tokens



def get_attributes(text):
    if text[0] != ">": return {}

    attributes = {}
    
    headers = text[1:].split(" ")[0]
    attributes["name"] = headers
    attributes["decription"] = " ".join(text[1:].split(" ")[1:])
    headers = headers.split("|")
    if len(headers) >= 1: attributes["db"] = headers[0]
    if len(headers) >= 2: attributes["accession"] = headers[1]
    if len(headers) >= 3: attributes["gene_name"] = headers[2]
    
    eq_pos = text.find("=")
    while eq_pos > -1:
        next_pos = text.find("=", eq_pos + 1)
        attrib = text[eq_pos - 2 : eq_pos]
        if next_pos > -1:
            value = text[eq_pos + 1 : next_pos - 3]
        else:
            value = text[eq_pos + 1 : ]
        attributes[attrib] = value
        eq_pos = next_pos
        
    return attributes


def format_protein_seq(seq):
    new_seq = ""
    cnt = 0
    while cnt < len(seq):
        add = min(10, len(seq) - cnt)
        if cnt % 50 == 0:
            new_seq += "\n        "
        new_seq += seq[cnt : cnt + add] + " "
        cnt += add
    return new_seq






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






spectra = []
species = form.getvalue('species')

proteins = proteins.replace("'", "")
proteins = proteins.replace(" ", "")
proteins = proteins.replace(":", ",")

proteins_to_spectra = {}
for token in split_string(proteins, ",", "|"):
    prot_id = int(token[:token.find("|")])
    specs = [int(sid) for sid in token[token.find("|") + 1 : -1].split(",")]
    proteins_to_spectra[prot_id] = specs
    spectra += specs
    
proteins = ",".join(str(pid) for pid in proteins_to_spectra)


rnd = hashlib.md5(str(int(random() * 1000000000)).encode('utf-8')).hexdigest()

# create folder
os.system("mkdir ../tmp/%s" % rnd)


# open mysql connection & create fasta file
conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
my_cur = conn.cursor()

fasta_file = "../tmp/%s/proteins.fasta" % rnd
sql_query = "SELECT id, accession, fasta FROM proteins WHERE id IN (%s);" % proteins

proteome = {}
proteome_headers = {}
my_cur.execute(sql_query)
with open(fasta_file, mode="wt") as fl:
    for row in my_cur:
        proteins_to_spectra[row[1]] = proteins_to_spectra[row[0]]
        del proteins_to_spectra[row[0]]
        
        prot_seq = row[2]
        fl.write(prot_seq + "\n")
        
        attributes = get_attributes(prot_seq[:prot_seq.find("\n")])
        proteome_headers[attributes["accession"]] = attributes
        
        prot_seq = "".join(prot_seq[prot_seq.find("\n"):].split("\n"))
        proteome[attributes["accession"]] = prot_seq


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
lite_cur.execute("INSERT INTO blib.`LibInfo` (libLSID,createTime,numSpecs,majorVersion,minorVersion) VALUES ('urn:lsid:proteome.gs.washington.edu:spectral_library:bibliospec:nr:spectra','Tue Jul 03 10:43:40 2018',4248,1,7);")
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

lite_cur.execute("INSERT INTO blib.SpectrumSourceFiles (fileName, cutoffScore) VALUES ('C:\\Users\\Stamp.MGF', 0);")
db.commit()

lite_cur.execute("INSERT INTO blib.RetentionTimes SELECT tt.id, rt.RedundantRefSpectraID, rt.SpectrumSourceID, 0, rt.collisionalCrossSectionSqA, 0, 0, rt.retentionTime, rt.bestSpectrum FROM RetentionTimes rt INNER JOIN blib.tmp tt ON rt.RefSpectraID = tt.sid ORDER BY tt.id;")
db.commit()

lite_cur.execute("UPDATE blib.RefSpectra SET fileID = 1;");
lite_cur.execute("UPDATE blib.RetentionTimes SET SpectrumSourceID = 1;");
lite_cur.execute("UPDATE blib.LibInfo SET numSpecs = %i;" % len(spectra))
lite_cur.execute("UPDATE blib.LibInfo SET createTime = date('now');")
lite_cur.execute("DROP TABLE blib.tmp;")
db.commit()





view_file = "../tmp/%s/experiment.sky.view" % rnd
with open(view_file, mode = "wt") as out_view_file:
    out_view_file.write("<?xml version=\"1.0\" encoding=\"utf-16\"?> \n \
<!--DigitalRune Docking Windows configuration file.--> \n \
<!--!!! AUTOMATICALLY GENERATED CONTENT. DO NOT MODIFY !!!-->  \n \
<DockPanel FormatVersion=\"1.0\" DockLeftPortion=\"0.25\" DockRightPortion=\"0.74889012208657\" DockTopPortion=\"0.25\" DockBottomPortion=\"0.25\" ActiveDocumentPane=\"-1\" ActivePane=\"0\"> \n \
  <Contents Count=\"2\"> \n \
    <Content ID=\"0\" PersistString=\"pwiz.Skyline.Controls.SequenceTreeForm|0,1(0)|0,0|0\" AutoHidePortion=\"0.25\" IsHidden=\"False\" IsFloating=\"False\" /> \n \
    <Content ID=\"1\" PersistString=\"pwiz.Skyline.Controls.Graphs.GraphSpectrum\" AutoHidePortion=\"0.25\" IsHidden=\"False\" IsFloating=\"False\" /> \n \
  </Contents> \n \
  <Panes Count=\"2\"> \n \
    <Pane ID=\"0\" DockState=\"DockLeft\" ActiveContent=\"0\"> \n \
      <Contents Count=\"1\"> \n \
        <Content ID=\"0\" RefID=\"0\" /> \n \
      </Contents> \n \
    </Pane> \n \
    <Pane ID=\"1\" DockState=\"DockRight\" ActiveContent=\"1\"> \n \
      <Contents Count=\"1\"> \n \
        <Content ID=\"0\" RefID=\"1\" /> \n \
      </Contents> \n \
    </Pane> \n \
  </Panes> \n \
  <DockZones> \n \
    <DockZone ID=\"0\" DockState=\"Document\" ZOrderIndex=\"1\"> \n \
      <NestedPanes Count=\"0\" /> \n \
    </DockZone> \n \
    <DockZone ID=\"1\" DockState=\"DockLeft\" ZOrderIndex=\"3\"> \n \
      <NestedPanes Count=\"1\"> \n \
        <Pane ID=\"0\" RefID=\"0\" PrevPane=\"-1\" Alignment=\"Bottom\" Proportion=\"0.5\" /> \n \
      </NestedPanes> \n \
    </DockZone> \n \
    <DockZone ID=\"2\" DockState=\"DockRight\" ZOrderIndex=\"4\"> \n \
      <NestedPanes Count=\"1\"> \n \
        <Pane ID=\"0\" RefID=\"1\" PrevPane=\"-1\" Alignment=\"Bottom\" Proportion=\"0.5\" /> \n \
      </NestedPanes> \n \
    </DockZone> \n \
    <DockZone ID=\"3\" DockState=\"DockTop\" ZOrderIndex=\"5\"> \n \
      <NestedPanes Count=\"0\" /> \n \
    </DockZone> \n \
    <DockZone ID=\"4\" DockState=\"DockBottom\" ZOrderIndex=\"6\"> \n \
      <NestedPanes Count=\"0\" /> \n \
    </DockZone> \n \
  </DockZones> \n \
  <FloatingWindows Count=\"0\" /> \n \
</DockPanel>\n")








skyline_file = "../tmp/%s/experiment.sky" % rnd
with open(skyline_file, mode = "wt") as out_skyline_file:
    out_skyline_file.write("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n \
<srm_settings format_version=\"3.73\" software_version=\"Skyline (64-bit) 4.1.0.18169\">\n \
  <settings_summary name=\"Default\">\n \
    <peptide_settings>\n \
      <enzyme name=\"Trypsin\" cut=\"KR\" no_cut=\"P\" sense=\"C\" />\n \
      <digest_settings max_missed_cleavages=\"0\" />\n \
      <peptide_prediction use_measured_rts=\"true\" measured_rt_window=\"2\" use_spectral_library_drift_times=\"false\" spectral_library_drift_times_peak_width_calc_type=\"resolving_power\" spectral_library_drift_times_resolving_power=\"0\" spectral_library_drift_times_width_at_dt_zero=\"0\" spectral_library_drift_times_width_at_dt_max=\"0\" />\n \
      <peptide_filter start=\"25\" min_length=\"8\" max_length=\"25\" auto_select=\"true\">\n \
        <peptide_exclusions />\n \
      </peptide_filter>\n \
      <peptide_libraries pick=\"library\">\n \
        <bibliospec_lite_library name=\"e\" file_name_hint=\"spectra.blib\" lsid=\"urn:lsid:proteome.gs.washington.edu:spectral_library:bibliospec:nr:spectra\" revision=\"1\" />\n \
      </peptide_libraries>\n \
      <peptide_modifications max_variable_mods=\"3\" max_neutral_losses=\"1\">\n \
        <static_modifications>\n \
          <static_modification name=\"Carbamidomethyl (C)\" aminoacid=\"C\" formula=\"H3C2NO\" unimod_id=\"4\" short_name=\"CAM\" />\n \
        </static_modifications>\n \
        <heavy_modifications />\n \
      </peptide_modifications>\n \
    </peptide_settings>\n \
    <transition_settings>\n \
      <transition_prediction precursor_mass_type=\"Monoisotopic\" fragment_mass_type=\"Monoisotopic\" optimize_by=\"None\" />\n \
      <transition_filter precursor_charges=\"2,3\" product_charges=\"1\" precursor_adducts=\"[M+H]\" product_adducts=\"[M+]\" fragment_types=\"y\" small_molecule_fragment_types=\"f\" fragment_range_first=\"m/z &gt; precursor\" fragment_range_last=\"3 ions\" precursor_mz_window=\"0\" auto_select=\"true\">\n \
        <measured_ion name=\"N-terminal to Proline\" cut=\"P\" sense=\"N\" min_length=\"3\" />\n \
      </transition_filter>\n \
      <transition_libraries ion_match_tolerance=\"0.02\" min_ion_count=\"0\" ion_count=\"3\" pick_from=\"all\" />\n \
      <transition_integration />\n \
      <transition_instrument min_mz=\"50\" max_mz=\"1500\" mz_match_tolerance=\"0.055\" />\n \
    </transition_settings>\n \
    <data_settings document_guid=\"111c1931-8827-4e11-9896-608225cb1e88\" />\n \
  </settings_summary>\n")
    
    for accession in proteome:
        attributes = proteome_headers[accession]
    
        out_skyline_file.write("<protein name=\"%s\" description=\"Cytochrome P450 2E1 OS=Mus musculus GN=Cyp2e1 PE=1 SV=1\" accession=\"Q05421\" gene=\"Cyp2e1\" species=\"Mus musculus\" preferred_name=\"CP2E1_MOUSE\" websearch_status=\"X\">" % attributes["name"])
                               
        """
    <protein name="sp|Q05421|CP2E1_MOUSE" description="Cytochrome P450 2E1 OS=Mus musculus GN=Cyp2e1 PE=1 SV=1" accession="Q05421" gene="Cyp2e1" species="Mus musculus" preferred_name="CP2E1_MOUSE" websearch_status="X">
    <sequence>
        MAVLGITVAL LVWIATLLLV SIWKQIYRSW NLPPGPFPIP FFGNIFQLDL
        KDIPKSLTKL AKRFGPVFTL HLGQRRIVVL HGYKAVKEVL LNHKNEFSGR
        GDIPVFQEYK NKGIIFNNGP TWKDVRRFSL SILRDWGMGK QGNEARIQRE
        AHFLVEELKK TKGQPFDPTF LIGCAPCNVI ADILFNKRFD YDDKKCLELM
        SLFNENFYLL STPWIQAYNY FSDYLQYLPG SHRKVMKNVS EIRQYTLGKA
        KEHLKSLDIN CPRDVTDCLL IEMEKEKHSQ EPMYTMENIS VTLADLFFAG
        TETTSTTLRY GLLILMKYPE IEEKLHEEID RVIGPSRAPA VRDRMNMPYM
        DAVVHEIQRF INLVPSNLPH EATRDTVFRG YVIPKGTVVI PTLDSLLFDN
        YEFPDPETFK PEHFLNENGK FKYSDYFKAF SAGKRVCVGE GLARMELFLL
        LSAILQHFNL KSLVDPKDID LSPVTIGFGS IPREFKLCVI PRS</sequence>
    <peptide sequence="FGPVFTLHLGQR" modified_sequence="FGPVFTLHLGQR" start="63" end="75" prev_aa="R" next_aa="R" calc_neutral_pep_mass="1370.745905" num_missed_cleavages="0">
      <precursor charge="3" calc_neutral_mass="1370.745905" precursor_mz="457.922578" collision_energy="0" modified_sequence="FGPVFTLHLGQR">
        <bibliospec_spectrum_info library_name="e" count_measured="1" />
        <transition fragment_type="y" fragment_ordinal="7" calc_neutral_mass="823.466435" product_charge="1" cleavage_aa="T" loss_neutral_mass="0">
          <precursor_mz>457.922578</precursor_mz>
          <product_mz>824.473711</product_mz>
          <collision_energy>0</collision_energy>
          <transition_lib_info rank="2" intensity="152683.844" />
        </transition>
        <transition fragment_type="y" fragment_ordinal="5" calc_neutral_mass="609.334693" product_charge="1" cleavage_aa="H" loss_neutral_mass="0">
          <precursor_mz>457.922578</precursor_mz>
          <product_mz>610.341969</product_mz>
          <collision_energy>0</collision_energy>
          <transition_lib_info rank="1" intensity="210379.766" />
        </transition>
        <transition fragment_type="y" fragment_ordinal="4" calc_neutral_mass="472.275781" product_charge="1" cleavage_aa="L" loss_neutral_mass="0">
          <precursor_mz>457.922578</precursor_mz>
          <product_mz>473.283057</product_mz>
          <collision_energy>0</collision_energy>
          <transition_lib_info rank="3" intensity="143584.281" />
        </transition>
      </precursor>
    </peptide>
  </protein>
        """
    
    out_skyline_file.write("</srm_settings>\n")



skyline_zip_file = "../tmp/%s/experiment.sky.zip" % rnd
os.system("zip -j %s %s %s %s > /dev/null" % (skyline_zip_file, view_file, blib_file, skyline_file))



# merge into zip file
zip_file = "../tmp/%s/assay.zip" % rnd
os.system("zip -j %s %s %s %s > /dev/null" % (zip_file, fasta_file, blib_file, skyline_zip_file))




#send download link back
print("/stamp/tmp/%s/assay.zip" % rnd)
