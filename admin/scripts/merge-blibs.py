#!/usr/bin/python3
#-*- coding: utf-8 -*-

import sys
import os

    
conf = {}
with open("../qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")



data_dir = "%s/tmp/upload" % conf["root_path"]
    
    
try:    
    

    if len(sys.argv) < 3:
        print("usage:", sys.argv[0], "input_blib_1 input_blib_2 output_blib\n")
        raise Exception()
        
    if sys.argv[1] == sys.argv[2]:
        print("input_blib_1 and input_blib_2 must be different files\n")
        raise Exception()
        
    
        
        
    acids = {}
    acids['A'] =  71.037110
    acids['R'] = 156.101110
    acids['N'] = 114.042930
    acids['D'] = 115.026940
    acids['C'] = 103.009190
    acids['c'] = 160.030654
    acids['E'] = 129.042590
    acids['Q'] = 128.058580
    acids['G'] =  57.021460
    acids['H'] = 137.058910
    acids['I'] = 113.084060
    acids['L'] = 113.084060
    acids['K'] = 128.094960
    acids['M'] = 131.040490
    acids['m'] = 147.035404
    acids['n'] = 163.030318
    acids['F'] = 147.068410
    acids['P'] =  97.052760
    acids['S'] =  87.032030
    acids['T'] = 101.047680
    acids['W'] = 186.079310
    acids['Y'] = 163.063330
    acids['V'] =  99.068410

    H =       1.007276
    C12 =    12.000000
    O =      15.994914
    H3O =    19.016742
    O2 =     31.989829
    acetyl = 43.016742
    electron = 0.00054857990946
    tolerance = 5


    def binary_search(array, key):
        low, mid, high = 0, 0, len(array) - 1
        while low <= high:
            mid = (low + high) >> 1
            if array[mid] == key: break
            elif array[mid] < key: low = mid + 1
            else: high = mid - 1
        
        mn_index = mid
        mn = abs(array[mid] - key)
        if mid >= 1 and abs(array[mid - 1] - key) < mn:
            mn = abs(array[mid - 1] - key)
            mn_index = mid - 1
            
        if mid + 1 < len(array) and abs(array[mid + 1] - key) < mn:
            mn = abs(array[mid + 1] - key)
            mn_index = mid + 1
        
        return mn_index, mn / key * 1000000
        
        
        


    def compare_spectra(cur_data, row_id1, row_id2, peptide_mod, charge):
        cur_data.execute('SELECT * FROM RefSpectraPeaks where RefSpectraID = ?;', row_id1)
        row_data1 = cur_data.fetchone()
        mz1, intens1 = row_data1[1], row_data1[2]
        try: mz1 = zlib.decompress(mz1)
        except: pass
        mz1 = struct.unpack("%id" % (len(mz1) / 8), mz1)
        try: intens1 = zlib.decompress(intens1)
        except: pass
        intens1 = struct.unpack("%if" % (len(intens1) / 4), intens1)
        
        
        cur_data.execute('SELECT * FROM second.RefSpectraPeaks where RefSpectraID = ?;', row_id2)
        row_data2 = cur_data.fetchone()
        mz2, intens2 = row_data2[1], row_data2[2]
        try: mz2 = zlib.decompress(mz2)
        except: pass
        mz2 = struct.unpack("%id" % (len(mz2) / 8), mz2)
        try: intens2 = zlib.decompress(intens2)
        except: pass
        intens2 = struct.unpack("%if" % (len(intens2) / 4), intens2)
    
        
        peptide_mod = peptide_mod.replace("M[+16.0]", "m")
        peptide_mod = peptide_mod.replace("C[+57.0]", "c")
        
        
        mass = H
        score1 = 0
        
        error = "-"
        try:
            for i in range(len(peptide_mod)):
                mass += acids[peptide_mod[i]]
                for crg in range(1, charge + 1):
                    if mass >= 800 * (crg - 1):
                        diff_mass = binary_search(mz1, (mass + (H - electron) * crg) / crg)
                        if diff_mass[1] < tolerance:
                            score1 += intens1[diff_mass[0]]
                            
                            
            
            # annotate y-ions
            mass = H3O
            rev_peptide = peptide_mod[::-1]
            for i in range(len(peptide_mod)):
                mass += acids[rev_peptide[i]]
                for crg in range(1, charge + 1):
                    if mass >= 800 * (crg - 1):
                        diff_mass = binary_search(mz1, (mass + (H - electron) * crg) / crg)
                        if diff_mass[1] < tolerance:
                            score1 += intens1[diff_mass[0]]
        except: error = "f" 
            
            
        try:
            mass = H
            score2 = 0
            for i in range(len(peptide_mod)):
                mass += acids[peptide_mod[i]]
                for crg in range(1, charge + 1):
                    if mass >= 800 * (crg - 1):
                        diff_mass = binary_search(mz2, (mass + (H - electron) * crg) / crg)
                        if diff_mass[1] < tolerance:
                            score2 += intens2[diff_mass[0]]
            
            # annotate y-ions
            mass = H3O
            rev_peptide = peptide_mod[::-1]
            for i in range(len(peptide_mod)):
                mass += acids[rev_peptide[i]]
                for crg in range(1, charge + 1):
                    if mass >= 800 * (crg - 1):
                        diff_mass = binary_search(mz2, (mass + (H - electron) * crg) / crg)
                        if diff_mass[1] < tolerance:
                            score2 += intens2[diff_mass[0]]
        
        except: error = "s"
        return score1 < score2 if error == "-" else (True if error == "f" else False)

        
    
    
    import sqlite3
    import zlib
    import struct
    import json
    import cgi, cgitb
    from math import ceil
    


    old_spectral_file = sys.argv[1]
    new_spectral_file = sys.argv[2]
    tmp_file = "%s/tmp.blib" % data_dir
    merged_file = "%s/merged.blib" % data_dir

    
    os.system("rm -f '%s'" % tmp_file)
    os.system("rm -f '%s'" % merged_file)
    
    
    # open input_blib_1
    db = sqlite3.connect(old_spectral_file)
    cur_in1 = db.cursor()
    cur_in2 = db.cursor()
    cur_out = db.cursor()
    cur_data = db.cursor()
    cur_in1.execute("ATTACH DATABASE '%s' As second;" % new_spectral_file)

    #check for new schemes
    try:
        cur_out.execute("select count(driftTimeMsec) from RefSpectra;")
    except:
        print("Error: %s has old or unrecognizable scheme. Exit\n" % old_spectral_file)
        raise Exception()
    try:
        cur_out.execute("select count(driftTimeMsec) from second.RefSpectra;")
    except:
        print("Error: %s has old or unrecognizable scheme. Exit\n" % new_spectral_file)
        raise Exception()



    cur_out.execute("ATTACH DATABASE '%s' As tmp;" % tmp_file)
    cur_out.execute("ATTACH DATABASE '%s' As merged;" % merged_file)



    cur_out.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='Tissues';")
    first_contains_tissues = True if cur_out.fetchone()[0] == 1 else False

    cur_out.execute("SELECT count(*) FROM second.sqlite_master WHERE type='table' AND name='Tissues';")
    second_contains_tissues = True if cur_out.fetchone()[0] == 1 else False

    # create all tables
    print("adding all schemas\n")
    cur_out.execute("CREATE TABLE merged.LibInfo as select * from LibInfo;")


    cur_out.execute("CREATE TABLE merged.RefSpectra(id INTEGER primary key autoincrement not null, peptideSeq VARCHAR(150), precursorMZ REAL, precursorCharge INTEGER, peptideModSeq VARCHAR(200), prevAA CHAR(1), nextAA CHAR(1), copies INTEGER, numPeaks INTEGER, driftTimeMsec REAL, collisionalCrossSectionSqA REAL, driftTimeHighEnergyOffsetMsec REAL, retentionTime REAL, fileID INTEGER, SpecIDinFile VARCHAR(256), score REAL, scoreType TINYINT, confidence INT);")
    cur_out.execute("CREATE INDEX merged.idxPeptide on RefSpectra (peptideSeq, precursorCharge);")
    cur_out.execute("CREATE INDEX merged.idxPeptideMod on RefSpectra (peptideModSeq, precursorCharge);")

    cur_out.execute("CREATE TABLE tmp.RefSpectra(id INTEGER primary key autoincrement not null, peptideSeq VARCHAR(150), precursorMZ REAL, precursorCharge INTEGER, peptideModSeq VARCHAR(200), prevAA CHAR(1), nextAA CHAR(1), copies INTEGER, numPeaks INTEGER, driftTimeMsec REAL, collisionalCrossSectionSqA REAL, driftTimeHighEnergyOffsetMsec REAL, retentionTime REAL, fileID INTEGER, SpecIDinFile VARCHAR(256), score REAL, scoreType TINYINT, confidence INT);")
    cur_out.execute("CREATE INDEX tmp.idxPeptide on RefSpectra (peptideSeq, precursorCharge);")
    cur_out.execute("CREATE INDEX tmp.idxPeptideMod on RefSpectra (peptideModSeq, precursorCharge);")
    cur_out.execute("CREATE TABLE tmp.Tissues(RefSpectraID INTEGER, tissue INTEGER, number INTEGER, origin INTEGER);")

    cur_out.execute("CREATE TABLE merged.Modifications(id INTEGER primary key autoincrement not null,RefSpectraID INTEGER, position INTEGER, mass REAL);")


    cur_out.execute("CREATE TABLE merged.RefSpectraPeaks(RefSpectraID INTEGER, peakMZ BLOB, peakIntensity BLOB);")
    cur_out.execute("CREATE INDEX merged.idxRefIdPeaks ON RefSpectraPeaks (RefSpectraID);")
    cur_out.execute("CREATE TABLE merged.SpectrumSourceFiles(id INTEGER PRIMARY KEY autoincrement not null,fileName VARCHAR(512) );")
    cur_out.execute("CREATE TABLE merged.ScoreTypes AS select * from ScoreTypes;")
    cur_out.execute("CREATE TABLE merged.RefSpectraPeakAnnotations (id INTEGER primary key autoincrement not null, RefSpectraID INTEGER not null, peakIndex INTEGER not null, name VARCHAR(256), formula VARCHAR(256),inchiKey VARCHAR(256), otherKeys VARCHAR(256), charge INTEGER, adduct VARCHAR(256), comment VARCHAR(256), mzTheoretical REAL not null,mzObserved REAL not null);")
    cur_out.execute("CREATE TABLE merged.Tissues(RefSpectraID INTEGER, tissue INTEGER, number INTEGER, PRIMARY KEY (RefSpectraID, tissue));")
    cur_out.execute("CREATE INDEX merged.idxRefIdPeakAnnotations ON RefSpectraPeakAnnotations (RefSpectraID);");
    cur_out.execute("CREATE TABLE merged.RetentionTimes(RefSpectraID INTEGER, RedundantRefSpectraID INTEGER, SpectrumSourceID INTEGER, driftTimeMsec REAL, collisionalCrossSectionSqA REAL, driftTimeHighEnergyOffsetMsec REAL, retentionTime REAL, bestSpectrum INTEGER, FOREIGN KEY(RefSpectraID) REFERENCES RefSpectra(id));")

    cur_out.execute("CREATE TABLE tmp.sorting(id INTEGER primary key autoincrement not null, refID INTEGER, originalRefID INTEGER, mergeID INTEGER, origin INTEGER);")
    cur_out.execute("CREATE TABLE tmp.merging(first INTEGER, second, primary key (first, second));")
    db.commit()



    print("adding all data from first file\n")
    cur_out.execute("insert into tmp.RefSpectra select * from RefSpectra;")
    db.commit()



    len_spectra = cur_in1.execute("SELECT count(*) from RefSpectra;").fetchone()[0]
    len_files1 = cur_in1.execute("SELECT count(*) from SpectrumSourceFiles;").fetchone()[0]


    print("adding all data from second file\n")
    cur_out.execute("select count(*) cnt from second.RefSpectra;")
    second_count = cur_out.fetchone()[0]

    cur_out.execute("insert into tmp.RefSpectra (id, peptideSeq, precursorMZ, precursorCharge, peptideModSeq, prevAA, nextAA, copies, numPeaks, driftTimeMsec, collisionalCrossSectionSqA, driftTimeHighEnergyOffsetMsec, retentionTime, fileID, SpecIDinFile, score, scoreType, confidence) select id + %i, peptideSeq, precursorMZ, precursorCharge, peptideModSeq, prevAA, nextAA, copies, numPeaks, driftTimeMsec, collisionalCrossSectionSqA, driftTimeHighEnergyOffsetMsec, retentionTime, fileID + %i, SpecIDinFile, score, scoreType, confidence from second.RefSpectra;" % (len_spectra, len_files1))

    cur_out.execute("insert into merged.SpectrumSourceFiles (id, fileName) select id + %i, fileName from second.SpectrumSourceFiles;" % len_files1)
    db.commit()


    print("finding inner join of data\n")
    print("library 1 contains %i spectra\n" % len_spectra)
    print("library 2 contains %i spectra\n" % second_count)

    cur_out.execute("insert into merging (first, second) select min(id) first_id, max(id) second_id from tmp.RefSpectra group by peptideModSeq, precursorCharge having count(precursorCharge) > 1;")

    cur_out.execute("select min(id) first_id, max(id) second_id, peptideModSeq, precursorCharge from tmp.RefSpectra group by peptideModSeq, precursorCharge having count(precursorCharge) > 1;")

    delete_spectra_ids = []
    score2_taken = 0
    join = 0
    for line in cur_out:
        score2_higher = compare_spectra(cur_data, line[0], line[1] - len_spectra, line[2], line[3])
        score2_taken += score2_higher
        delete_spectra_ids.append(line[0] if score2_higher else line[1])
        join += 1


    print("inner join contains %i spectra\n" % join)
    print("taken %i in join of first lib\n" % (join - score2_taken))
    print("taken %i in join of second lib\n" % score2_taken)
    print("deleting weaker spectra\n")

    st = 0
    en = 0

    denominator = 500
    while en < len(delete_spectra_ids):
        en = en + denominator if en + denominator < len(delete_spectra_ids) else len(delete_spectra_ids)
        specs = ", ".join(str(num) for num in delete_spectra_ids[st : en])
        cur_out.execute("delete from tmp.RefSpectra where id in (%s);" % specs)
        st = en
    db.commit()


    print("rearranging data\n") 
    cur_out.execute("insert into tmp.sorting (refID, originalRefID, origin) select rs.id, rs.id, 1 from tmp.RefSpectra rs order by rs.peptideSeq, rs.precursorCharge;")
    db.commit()

    cur_out.execute("update tmp.sorting set originalRefID = originalRefID - %i, origin = 2 where refId > %i;" % (len_spectra, len_spectra))
    cur_out.execute("update tmp.sorting set mergeID = (select tmp.merging.first from tmp.merging where tmp.merging.second = tmp.sorting.refID) where origin = 2;")
    cur_out.execute("update tmp.sorting set mergeID = (select tmp.merging.second from tmp.merging where tmp.merging.first = tmp.sorting.refID) where origin = 1;")
    cur_out.execute("update tmp.sorting set mergeID = mergeID - %i where origin = 1 and mergeID is not null;" % len_spectra)
    db.commit()

    cur_out.execute("insert into merged.RefSpectra (peptideSeq, precursorMZ, precursorCharge, peptideModSeq, prevAA, nextAA, copies, numPeaks, driftTimeMsec, collisionalCrossSectionSqA, driftTimeHighEnergyOffsetMsec, retentionTime, fileID, SpecIDinFile, score, scoreType, confidence) select rs.peptideSeq, rs.precursorMZ, rs.precursorCharge, rs.peptideModSeq, rs.prevAA, rs.nextAA, rs.copies, rs.numPeaks, rs.driftTimeMsec, rs.collisionalCrossSectionSqA, rs.driftTimeHighEnergyOffsetMsec, rs.retentionTime, rs.fileID, rs.SpecIDinFile, rs.score, rs.scoreType, rs.confidence FROM tmp.sorting s INNER JOIN tmp.RefSpectra rs ON s.refID = rs.id ORDER BY s.id;")


    cur_out.execute("insert into merged.Modifications (RefSpectraID, position, mass) select ttt.* FROM (select s.id, m.position, m.mass FROM tmp.sorting s INNER JOIN Modifications m ON s.originalRefID = m.RefSpectraID WHERE s.origin = 1 union select s.id, m.position, m.mass FROM tmp.sorting s INNER JOIN second.Modifications m ON s.originalRefID = m.RefSpectraID WHERE s.origin = 2) ttt order by ttt.id;")


    cur_out.execute("insert into merged.RefSpectraPeaks (RefSpectraID, peakMZ, peakIntensity) select ttt.* FROM (select s.id, m.peakMZ, m.peakIntensity FROM tmp.sorting s INNER JOIN RefSpectraPeaks m ON s.originalRefID = m.RefSpectraID WHERE s.origin = 1 union select s.id, m.peakMZ, m.peakIntensity FROM tmp.sorting s INNER JOIN second.RefSpectraPeaks m ON s.originalRefID = m.RefSpectraID WHERE s.origin = 2) ttt order by ttt.id;")
    db.commit()


    cur_out.execute("insert into merged.RetentionTimes (RefSpectraID, RedundantRefSpectraID, SpectrumSourceID, driftTimeMsec, collisionalCrossSectionSqA, driftTimeHighEnergyOffsetMsec, retentionTime, bestSpectrum) SELECT ttt.* FROM (select s.id, m.RedundantRefSpectraID, m.SpectrumSourceID, m.driftTimeMsec, m.collisionalCrossSectionSqA, m.driftTimeHighEnergyOffsetMsec, m.retentionTime, m.bestSpectrum from tmp.sorting s INNER JOIN RetentionTimes m ON s.originalRefID = m.RefSpectraID WHERE s.origin = 1 union select s.id, m.RedundantRefSpectraID, m.SpectrumSourceID, m.driftTimeMsec, m.collisionalCrossSectionSqA, m.driftTimeHighEnergyOffsetMsec, m.retentionTime, m.bestSpectrum from tmp.sorting s INNER JOIN second.RetentionTimes m ON s.originalRefID = m.RefSpectraID WHERE s.origin = 2) ttt ORDER BY ttt.id;")


    if first_contains_tissues and not second_contains_tissues:
        cur_out.execute("insert into merged.Tissues (RefSpectraID, tissue, number) select distinct ttt.* FROM (select s.id, m.tissue, m.number FROM tmp.sorting s INNER JOIN Tissues m ON s.originalRefID = m.RefSpectraID WHERE s.origin = 1) ttt order by ttt.id;")
        
    elif not first_contains_tissues and second_contains_tissues:
        cur_out.execute("insert into merged.Tissues (RefSpectraID, tissue, number) select distinct ttt.* FROM (select s.id, m.tissue, m.number FROM tmp.sorting s INNER JOIN second.Tissues m ON s.originalRefID = m.RefSpectraID WHERE s.origin = 2) ttt order by ttt.id;")
        
    elif first_contains_tissues and second_contains_tissues:
        cur_out.execute("insert into tmp.Tissues (RefSpectraID, tissue, number, origin) \
                    select s.id, t.tissue, t.number, 1 FROM tmp.sorting s INNER JOIN Tissues t ON s.originalRefID = t.RefSpectraID WHERE s.origin = 1 union \
                    select s.id, t.tissue, t.number, 1 FROM tmp.sorting s INNER JOIN Tissues t ON s.mergeID = t.RefSpectraID WHERE s.origin = 2 union \
                    select s.id, t.tissue, t.number, 2 FROM tmp.sorting s INNER JOIN second.Tissues t ON s.originalRefID = t.RefSpectraID WHERE s.origin = 2 union \
                    select s.id, t.tissue, t.number, 2 FROM tmp.sorting s INNER JOIN second.Tissues t ON s.mergeID = t.RefSpectraID WHERE s.origin = 1;")
        
        cur_out.execute("insert into merged.Tissues (RefSpectraID, tissue, number) \
                select RefSpectraID, tissue, sum(number) FROM tmp.Tissues GROUP BY RefSpectraID, tissue ORDER BY RefSpectraID;")

    cur_out.execute("update merged.LibInfo set numspecs = (select count(*) from merged.RefSpectra);")
    db.commit()



    cur_in1.close()
    cur_in2.close()
    cur_data.close()
    cur_out.close()
    db.close()

    os.remove(tmp_file)
    os.system("cp %s %s" % (merged_file, old_spectral_file))
    
    
    with open("%s/inserting.dat" % data_dir, mode = "wt") as inserting:
        inserting.write("1\n")
    
except Exception as error:
    with open("%s/inserting.dat" % data_dir, mode = "wt") as inserting:
        inserting.write("-1\n")