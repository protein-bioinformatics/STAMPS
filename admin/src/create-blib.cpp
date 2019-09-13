#include "bio-classes.h"



double get_annotated_intensity(string peptide_mod, PSM* psm){
    if (psm->mz == 0 || psm -> mz == 0) return 0;
    
    double tolerance = 0.02;
    replaceAll(peptide_mod, "M[+16.0]", "m");
    replaceAll(peptide_mod, "C[+57.0]", "c");
    
    string rev_peptide = peptide_mod;
    reverse(rev_peptide.begin(), rev_peptide.end() );
    double total_intens = 0;
    double mass = 0;
    
    vector<double>* mz = psm->mz;
    vector<float>* intens = psm->intens;
    double mass_diff = 0;
    int length = mz->size();
    int charge = psm->charge;
    
    
    
    // find b-ions
    mass = 0;
    for (int i = 0; i < peptide_mod.length(); ++i){
        mass += acids[peptide_mod[i]];
        
        for (int crg = 1; crg <= charge; ++crg){
            if (mass >= 800 * (crg - 1)){
                int index = binary_search(mz->data(), length, (mass + (H - electron) * crg) / crg, mass_diff);
                if (mass_diff < tolerance){
                    total_intens += intens->at(index);
                }
            }
        }
    }
    
    // find y-ions
    mass = H2O;
    for (int i = 0; i < rev_peptide.length(); ++i){
        mass += acids[rev_peptide[i]];
        for (int crg = 1; crg <= charge; ++crg){
            if (mass >= 800 * (crg - 1)){
            int index = binary_search(mz->data(), length, (mass + (H - electron) * crg) / crg, mass_diff);
                if (mass_diff < tolerance){
                    total_intens += intens->at(index);
                }
            }
        }
    }
    
    return total_intens;
}



bool compare_modifications(pair<int, string>* m1, pair<int, string>* m2){
    return m2->first < m1->first;
}



int main(int argc, char** argv)
{
    // load parameters from config file
    map< string, string > parameters;
    read_config_file("../qsdb.conf", parameters);
    
    ofstream progress(parameters["root_path"] + "/tmp/upload/progress.dat");
    
    
    try {
        
        // Create a connection and connect to database
        sql::ResultSet *res;
        sql::Driver *driver = get_driver_instance();
        sql::Connection *con = driver->connect(parameters["mysql_host"], parameters["mysql_user"], parameters["mysql_passwd"]);
        con->setSchema(parameters["mysql_db"]);
        sql::Statement *stmt = con->createStatement();
        
        
        // init all necessary tables
        map<string, mzid_peptide*> peptides;
        map<string, evidence*> peptideEvidences;
        map<int, PSM*> PSMs;
        map<string, int> mgf_files;
        map<string, int> spectra_to_tissues;
        vector<string> mgf_files_sorted;
        set<int> valid_psms_indexes;
        set<string> valid_proteins;
        
        
        // load spectra to tissue table
        string sql_query = "SELECT * FROM files WHERE type = 'spectra';";
        res = stmt->executeQuery(sql_query);
        while (res->next()){
            spectra_to_tissues.insert({res->getString("filename"), res->getInt("tissue")});
        }
        
        
        // load data from mzid scan
        inputstreamer ips(parameters["root_path"] + "/tmp/upload/data.dat");
        ips.read_set_string(valid_proteins);
        ips.read_map_string_mzid_peptide(peptides);
        ips.read_map_string_evidence(peptideEvidences);
        ips.read_map_int_PSM(PSMs);
        
        
        // searching for valid psms and collecting psms per peptide
        int file_id = 1;
        for (pair<int, PSM*> psm_pair : PSMs){
            PSM* psm = psm_pair.second;
            string pepEv = psm->peptideEv;
            
            auto pep_evidence = peptideEvidences.find(pepEv);
            if (pep_evidence != peptideEvidences.end()){
                evidence* ev = pep_evidence->second;
                if (valid_proteins.find(ev->accession) == valid_proteins.end()) continue;
                ev->all_PSMs.push_back(psm);
                
                string pep_ref = ev->pep_ref;
                if (peptides.find(pep_ref) != peptides.end()){
                    mzid_peptide *pep = peptides.at(pep_ref);
                    
                    valid_psms_indexes.insert(psm_pair.first);
                    
                    if (mgf_files.find(psm->ref_file) == mgf_files.end()){
                        psm->file_id = file_id;
                        mgf_files.insert({psm->ref_file, file_id++});
                        mgf_files_sorted.push_back(psm->ref_file);
                        
                        if (spectra_to_tissues.find(psm->ref_file) == spectra_to_tissues.end()){
                            cerr << "Error: '" << psm->ref_file << "' not found in database." << endl;
                            return -1;
                        }
                    }
                }
            }
        }
        
        
        
        
        for (pair<string, int> ref_file_pair : mgf_files){
            ifstream infile(parameters["root_path"] + "/tmp/upload/" + ref_file_pair.first);
            if (!infile.good()){
                cout << "file '" << ref_file_pair.first << "' not found" << endl;
                continue;
            }
            
            int line_index = -1;
            bool record = false;
            while (true){
                if (infile.eof()) break;
                string line;
                while (getline(infile, line)){
                    if (line.find("TITLE") != string::npos){
                        ++line_index;
                        
                        record = valid_psms_indexes.find(line_index) != valid_psms_indexes.end();
                        break;
                    }
                }
                if (infile.eof()) break;
                vector< double >* mz = new vector< double >();
                vector< float >* intens = new vector < float >();
                
                double amount = 0;
                while (getline(infile, line)){
                    if (line.find("END IONS") != string::npos) break;
                    
                    if (!record) continue;
                    
                    char c = line[0];
                    if (48 <= c && c < 58){
                        long space = line.find(" ");
                        double y_val = atof(line.substr(space + 1, line.length()).c_str());
                        amount += y_val;
                        mz->push_back(atof(line.substr(0, space).c_str()));
                        intens->push_back(y_val);
                    }
                }
                
                
                if (record){
                    PSM* psm = PSMs.find(line_index)->second;
                    psm->mz = mz;
                    psm->intens = intens;
                }
            }
            infile.close();
            
        }
        
        
        
        // select best spectrum per evidence
        int jj = 0;
        for (pair<string, evidence*> pepEv : peptideEvidences){
            evidence* ev = pepEv.second;
            
            
            if (ev->all_PSMs.size() == 0) continue;
            
                
            string pep_mod_seq = peptides.at(ev->pep_ref)->sequence_mod;
            ev->best_PSM = ev->all_PSMs.at(0);
            double best_intens = get_annotated_intensity(pep_mod_seq, ev->best_PSM);
            
            
            for (int i = 1; i < ev->all_PSMs.size(); ++i){
                double intens = get_annotated_intensity(pep_mod_seq, ev->all_PSMs.at(i));
                if (best_intens < intens){
                    best_intens = intens;
                    ev->best_PSM = ev->all_PSMs.at(i);
                }
            }
            
            
            // compress mz values
            z_stream defstream_mz;
            defstream_mz.zalloc = Z_NULL;
            defstream_mz.zfree = Z_NULL;
            defstream_mz.opaque = Z_NULL;
            
            int uncompressed_mz_size = ev->best_PSM->mz->size() * 8;
            unsigned char* compressed_mz = new unsigned char[uncompressed_mz_size * 2];
            
            
            defstream_mz.avail_in = (uInt)uncompressed_mz_size; // size of input
            defstream_mz.next_in = (unsigned char *)ev->best_PSM->mz->data(); // input char array
            defstream_mz.avail_out = (uInt)(uncompressed_mz_size * 2); // size of output
            defstream_mz.next_out = (unsigned char *)compressed_mz; // output char array
            

            deflateInit(&defstream_mz, Z_BEST_COMPRESSION);
            deflate(&defstream_mz, Z_FINISH);
            deflateEnd(&defstream_mz);
            int num_compressed_bytes = (int)((unsigned char*)defstream_mz.next_out - compressed_mz);
            
            if (num_compressed_bytes < uncompressed_mz_size){
                ev->best_PSM->mz_c.c = compressed_mz;
                ev->best_PSM->mz_c.len = num_compressed_bytes;
            }
            else {
                ev->best_PSM->mz_c.c = (unsigned char *)ev->best_PSM->mz->data();
                ev->best_PSM->mz_c.len = uncompressed_mz_size;
            }
            
            
            
            // compress intensity values
            z_stream defstream_intens;
            defstream_intens.zalloc = Z_NULL;
            defstream_intens.zfree = Z_NULL;
            defstream_intens.opaque = Z_NULL;
            
            int compressed_intens_size = ev->best_PSM->intens->size() * 4;
            unsigned char* compressed_intens = new unsigned char[compressed_intens_size * 2];
            
            defstream_intens.avail_in = (uInt)compressed_intens_size; // size of input
            defstream_intens.next_in = (unsigned char *)ev->best_PSM->intens->data(); // input char array
            defstream_intens.avail_out = (uInt)(compressed_intens_size * 2); // size of output
            defstream_intens.next_out = (unsigned char *)compressed_intens; // output char array

            deflateInit(&defstream_intens, Z_BEST_COMPRESSION);
            deflate(&defstream_intens, Z_FINISH);
            deflateEnd(&defstream_intens);
            num_compressed_bytes = (int)((unsigned char*)defstream_intens.next_out - compressed_intens);
            
            if (num_compressed_bytes < compressed_intens_size){
                ev->best_PSM->intens_c.c = compressed_intens;
                ev->best_PSM->intens_c.len = num_compressed_bytes;
            }
            else {
                ev->best_PSM->intens_c.c = (unsigned char *)ev->best_PSM->intens->data();
                ev->best_PSM->intens_c.len = compressed_intens_size;
            }
            
            
        }
        
        
        // create database
        
        sqlite3 *db;
        char *zErrMsg = 0;
        int rc;
        rc = sqlite3_open((parameters["root_path"] + "/tmp/upload/spectra.blib").c_str(), &db);
        if( rc ){
            cout << -3 << endl;
            return -3;
        }
        
        
        
        sqlite3_exec(db, "CREATE TABLE SpectrumSourceFiles(id INTEGER primary key autoincrement not null, fileName TEXT);", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "CREATE TABLE ScoreTypes (id INTEGER PRIMARY KEY, scoreType VARCHAR(128), probabilityType VARCHAR(128));", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "INSERT INTO `ScoreTypes` (id,scoreType,probabilityType) VALUES (0,'UNKNOWN','NOT_A_PROBABILITY_VALUE'), \
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
        (19,'GENERIC Q-VALUE','PROBABILITY_THAT_IDENTIFICATION_IS_INCORRECT');", NULL, NULL, &zErrMsg);
        
        sqlite3_exec(db, "CREATE TABLE Tissues(RefSpectraID INTEGER, tissue INTEGER, number INTEGER, PRIMARY KEY (RefSpectraID, tissue))", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "CREATE TABLE RetentionTimes(RefSpectraID INTEGER, RedundantRefSpectraID INTEGER, SpectrumSourceID INTEGER, driftTimeMsec REAL, collisionalCrossSectionSqA REAL, driftTimeHighEnergyOffsetMsec REAL, retentionTime REAL, bestSpectrum INTEGER, FOREIGN KEY(RefSpectraID) REFERENCES RefSpectra(id));", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "CREATE TABLE RefSpectraPeaks(RefSpectraID INTEGER, peakMZ BLOB, peakIntensity BLOB);", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "CREATE TABLE RefSpectraPeakAnnotations (id INTEGER primary key autoincrement not null, RefSpectraID INTEGER not null, peakIndex INTEGER not null, name VARCHAR(256), formula VARCHAR(256),inchiKey VARCHAR(256), otherKeys VARCHAR(256), charge INTEGER, adduct VARCHAR(256), comment VARCHAR(256), mzTheoretical REAL not null,mzObserved REAL not null);", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "CREATE TABLE RefSpectra(id INTEGER primary key autoincrement not null, peptideSeq VARCHAR(150), precursorMZ REAL, precursorCharge INTEGER, peptideModSeq VARCHAR(200), prevAA CHAR(1), nextAA CHAR(1), copies INTEGER, numPeaks INTEGER, driftTimeMsec REAL, collisionalCrossSectionSqA REAL, driftTimeHighEnergyOffsetMsec REAL, retentionTime REAL, fileID INTEGER, SpecIDinFile VARCHAR(256), score REAL, scoreType TINYINT, confidence INT);", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "CREATE TABLE Modifications (id INTEGER primary key autoincrement not null, RefSpectraID INTEGER, position INTEGER, mass REAL);", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "CREATE TABLE LibInfo(libLSID TEXT, createTime TEXT, numSpecs INTEGER, majorVersion INTEGER, minorVersion INTEGER);", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "INSERT INTO `LibInfo` (libLSID,createTime,numSpecs,majorVersion,minorVersion) VALUES ('urn:lsid:stamps.isas.de:spectral_library:stamps:nr:spectra','Tue Jul 03 10:43:40 2018',4248,1,7);", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "CREATE TABLE IonMobilityTypes (id INTEGER PRIMARY KEY, ionMobilityType VARCHAR(128) );", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "INSERT INTO `IonMobilityTypes` (id,ionMobilityType) VALUES (0,'none'), \
        (1,'driftTime(msec)'), \
        (2,'inverseK0(Vsec/cm^2)');", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "CREATE INDEX idxRefIdPeaks ON RefSpectraPeaks (RefSpectraID);", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "CREATE INDEX idxRefIdPeakAnnotations ON RefSpectraPeakAnnotations (RefSpectraID);", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "CREATE INDEX idxPeptideMod ON RefSpectra (peptideModSeq, precursorCharge);", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "CREATE INDEX idxPeptide ON RefSpectra (peptideSeq, precursorCharge);", NULL, NULL, &zErrMsg);
        

        
        
        
        sqlite3_mutex_enter(sqlite3_db_mutex(db));
        sqlite3_exec(db, "PRAGMA synchronous=OFF", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "PRAGMA count_changes=OFF", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "PRAGMA journal_mode=MEMORY", NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "PRAGMA temp_store=MEMORY", NULL, NULL, &zErrMsg);
        
        
        
        sqlite3_stmt *stmt_refSpectra;
        sqlite3_stmt *stmt_Modifications;
        sqlite3_stmt *stmt_RefSpectraPeaks;
        sqlite3_stmt *stmt_SpectrumSourceFiles;
        sqlite3_stmt *stmt_Tissues;
        
        
        
        sqlite3_exec(db, "BEGIN TRANSACTION", NULL, NULL, &zErrMsg);
        
        
        string sql_prepare = "INSERT INTO RefSpectra (peptideSeq, precursorMZ, precursorCharge, peptideModSeq, prevAA, nextAA, copies, numPeaks, driftTimeMsec, collisionalCrossSectionSqA, driftTimeHighEnergyOffsetMsec, retentionTime, fileID, SpecIDinFile, score, scoreType, confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
        sqlite3_prepare_v2(db, sql_prepare.c_str(), -1, &stmt_refSpectra, 0);
        
        sql_prepare = "INSERT INTO Modifications (RefSpectraID, position, mass) VALUES (?, ?, ?);";
        sqlite3_prepare_v2(db, sql_prepare.c_str(), -1, &stmt_Modifications, 0);
        
        sql_prepare = "INSERT INTO RefSpectraPeaks (RefSpectraID, peakMZ, peakIntensity) VALUES (?, ?, ?);";
        sqlite3_prepare_v2(db, sql_prepare.c_str(), -1, &stmt_RefSpectraPeaks, 0);
        
        sql_prepare = "INSERT INTO SpectrumSourceFiles (fileName) VALUES (?);";
        sqlite3_prepare_v2(db, sql_prepare.c_str(), -1, &stmt_SpectrumSourceFiles, 0);
        
        sql_prepare = "INSERT INTO Tissues (RefSpectraID, tissue, number) VALUES (?, ?, ?);";
        sqlite3_prepare_v2(db, sql_prepare.c_str(), -1, &stmt_Tissues, 0);
        
        
        int spectrum_index = 1;
        int tissue = 567;
        
        
        multimap<string, string> ordered_evidences;
        for (pair<string, evidence*> ev_pair : peptideEvidences) ordered_evidences.insert({peptides.at(ev_pair.second->pep_ref)->sequence, ev_pair.first});
        
        for (pair<string, string> ev_pair : ordered_evidences){
            evidence* ev = peptideEvidences.at(ev_pair.second);
            
            if (peptides.find(ev->pep_ref) == peptides.end()) continue;
            mzid_peptide* pep = peptides.at(ev->pep_ref);
            
            if (ev->best_PSM == 0) continue;
            PSM* psm = ev->best_PSM;
            
            
            sqlite3_bind_text(stmt_refSpectra, 1, pep->sequence.c_str(), pep->sequence.length(), SQLITE_STATIC);
            sqlite3_bind_double(stmt_refSpectra, 2, psm->precursor_mz);
            sqlite3_bind_int(stmt_refSpectra, 3, psm->charge);
            sqlite3_bind_text(stmt_refSpectra, 4, pep->sequence_mod.c_str(), pep->sequence_mod.length(), SQLITE_STATIC);
            sqlite3_bind_text(stmt_refSpectra, 5, "-", 1, SQLITE_STATIC);  // prevAA
            
            sqlite3_bind_text(stmt_refSpectra, 6, "-", 1, SQLITE_STATIC);
            sqlite3_bind_int(stmt_refSpectra, 7, 1);
            sqlite3_bind_int(stmt_refSpectra, 8, psm->mz->size());
            sqlite3_bind_double(stmt_refSpectra, 9, 0.);
            sqlite3_bind_double(stmt_refSpectra, 10, 0.);  // collisionalCrossSectionSqA
            
            sqlite3_bind_double(stmt_refSpectra, 11, 0.);
            sqlite3_bind_double(stmt_refSpectra, 12, psm->retention_time);
            sqlite3_bind_int(stmt_refSpectra, 13, psm->file_id);
            sqlite3_bind_text(stmt_refSpectra, 14, "", 0, SQLITE_STATIC);            
            sqlite3_bind_double(stmt_refSpectra, 15, psm->score);
            
            sqlite3_bind_int(stmt_refSpectra, 16, psm->score_type);
            sqlite3_bind_int(stmt_refSpectra, 17, 0);
            
            int retVal = sqlite3_step(stmt_refSpectra);
            if (retVal != SQLITE_DONE) cout << "Commit Failed! " << retVal << endl;
            sqlite3_reset(stmt_refSpectra);
            
            
            
            // inserting tissue information
            sqlite3_bind_int(stmt_Tissues, 1, spectrum_index);
            sqlite3_bind_int(stmt_Tissues, 2, tissue);
            sqlite3_bind_int(stmt_Tissues, 3, ev->all_PSMs.size());
            
            retVal = sqlite3_step(stmt_Tissues);
            if (retVal != SQLITE_DONE) cout << "Commit Failed! " << retVal << endl;
            sqlite3_reset(stmt_Tissues);
            
            
            
            
            // MZ and intens values
            rc = sqlite3_bind_int(stmt_RefSpectraPeaks, 1, spectrum_index);
            rc = sqlite3_bind_blob(stmt_RefSpectraPeaks, 2, psm->mz_c.c, psm->mz_c.len, SQLITE_TRANSIENT);
            rc = sqlite3_bind_blob(stmt_RefSpectraPeaks, 3, psm->intens_c.c, psm->intens_c.len, SQLITE_TRANSIENT);
            retVal = sqlite3_step(stmt_RefSpectraPeaks);
            if (retVal != SQLITE_DONE) cout << "Commit Failed! " << retVal << endl;
            sqlite3_reset(stmt_RefSpectraPeaks);
            
            // Modifications
            for (pair<int, string>* mod_pair : pep->modifications){
                
                sqlite3_bind_int(stmt_Modifications, 1, spectrum_index);
                sqlite3_bind_int(stmt_Modifications, 2, mod_pair->first);
                sqlite3_bind_double(stmt_Modifications, 3, atof(mod_pair->second.c_str()));
                
                retVal = sqlite3_step(stmt_Modifications);
                if (retVal != SQLITE_DONE) cout << "Commit Failed! " << retVal << endl;
                sqlite3_reset(stmt_Modifications);
            }
            
            
            
            
            ++spectrum_index;
        }
        
        // Insert all files
        for (string file_ref : mgf_files_sorted){
            sqlite3_bind_text(stmt_SpectrumSourceFiles, 1, file_ref.c_str(), file_ref.length(), SQLITE_STATIC);
                
            int retVal = sqlite3_step(stmt_SpectrumSourceFiles);
            if (retVal != SQLITE_DONE) cout << "Commit Failed! " << retVal << endl;
            sqlite3_reset(stmt_SpectrumSourceFiles);
        }
        
        ostringstream stringStream;
        stringStream << "UPDATE LibInfo SET numSpecs = " << (spectrum_index - 1) << ";";
        string copyOfStr = stringStream.str();
    
        sqlite3_exec(db, stringStream.str().c_str(), NULL, NULL, &zErrMsg);
        sqlite3_exec(db, "UPDATE LibInfo SET createTime = date('now');", NULL, NULL, &zErrMsg);
        
        sqlite3_exec(db, "COMMIT TRANSACTION", NULL, NULL, &zErrMsg);
        sqlite3_finalize(stmt_refSpectra);
        sqlite3_finalize(stmt_Modifications);
        sqlite3_finalize(stmt_RefSpectraPeaks);
        sqlite3_finalize(stmt_SpectrumSourceFiles);
        
        
        sqlite3_mutex_leave(sqlite3_db_mutex(db));
        sqlite3_close(db);
        progress << "1" << endl;
    }
    catch (...){
        ofstream progress(parameters["root_path"] + "/tmp/upload/progress.dat");
        progress << "-1" << endl;
    }
    
    return EXIT_SUCCESS;

}