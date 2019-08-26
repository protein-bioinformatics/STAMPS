#include "XmlInspector.hpp"
#include <iostream>
#include <cstdlib>
#include <set>
#include <map>
#include <string>
#include <vector>
#include <sstream>
#include "bio-classes.h"
#include <bits/stdc++.h> 
#include <sqlite3.h> 

using namespace std;

class mzid_peptide {
    public:
        string sequence;
        string sequence_mod;
        bool passThreshold;
        vector<pair<int, string>*> modifications;
        
        mzid_peptide(){
            sequence = "";
            passThreshold = true;
        }
        
        mzid_peptide(string _sequence){
            sequence = _sequence;
            passThreshold = true;
        }
};

struct c_array{
    unsigned char* c;
    int len;
};



class PSM {
    public:
        string ref_file;
        string spectrum_id;
        string peptideEv;
        bool passThreshold;
        int charge;
        double precursor_mz;
        double score;
        double retention_time;
        int score_type;
        
        vector<double>* mz;
        c_array mz_c;
        vector<float>* intens;
        c_array intens_c;
        
        PSM(){
            ref_file = "";
            spectrum_id = "";
            peptideEv = "";
            passThreshold = false;
            mz = 0;
            charge = 0;
            retention_time = 0;
            precursor_mz = 0;
            intens = 0;
            score = 0;
            score_type = 0;
        }
};


class evidence {
    public:
        string pep_ref;
        string accession;
        
        vector<PSM*> all_PSMs;
        PSM* best_PSM;
        
        evidence(string _pep_ref, string _accession){
            pep_ref = _pep_ref;
            accession = _accession;
            best_PSM = 0;
        }
};






bool contains_tryptic_miscleavages(string pep){
    int i = 0;
    for (; i < pep.length() - 1; ++i){
        if (pep.at(i) == 'K' || pep.at(i) == 'R') return true;
    }
    i = pep.length() - 1;
    return pep.at(i) != 'K' && pep.at(i) != 'R';
}



bool modifications_at_termini(mzid_peptide* p){
    for (pair<int, string>* mod : p->modifications){
        int pos = mod->first;
        if (pos == 0 || p->sequence.length() < pos) return true;
    }
    
    return false;
}






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
    
    map<string, int> PSM_score_types;
            PSM_score_types.insert({"MS:1001155", 12});
            PSM_score_types.insert({"MS:1001171", 5});
            PSM_score_types.insert({"MS:1001328", 10});
            PSM_score_types.insert({"MS:1001491", 1});
            PSM_score_types.insert({"MS:1001568", 8});
            PSM_score_types.insert({"MS:1001572", 3});
            PSM_score_types.insert({"MS:1001950", 16});
            PSM_score_types.insert({"MS:1002044", 11});
            PSM_score_types.insert({"MS:1002262", 17});
            PSM_score_types.insert({"MS:1002467", 18});
            PSM_score_types.insert({"MS:1002662", 14});
    
    
    
    
    Xml::Inspector<Xml::Encoding::Utf8Writer> inspector(argv[1]);

    
    map<string, mzid_peptide*> peptides;
    map<string, evidence*> peptideEvidences;
    map<int, PSM*> PSMs;
    map<string, int> mgf_files;
    vector<string> mgf_files_sorted;
    
    
    vector<string> states;
    set<string> valid_proteins;
    states.push_back("root");
    mzid_peptide *current_peptide;
    PSM *current_psm;
    while (inspector.Inspect())
    {
        switch (inspector.GetInspected())
        {
            case Xml::Inspected::StartTag:
                states.push_back(inspector.GetName());
                
                if (states.back() == "Peptide"){
                    current_peptide = new mzid_peptide();
                    
                    if (inspector.GetAttributesCount() > 0){
                        for (int i = 0; i < inspector.GetAttributesCount(); ++i){
                            Xml::Inspector<Xml::Encoding::Utf8Writer>::AttributeType AT = inspector.GetAttributeAt(i);
                            if (AT.Name == "id"){
                                
                                peptides.insert({ AT.Value, current_peptide });
                                
                            }
                        }
                    }
                }
                else if (states.back() == "Modification"){
                    if (inspector.GetAttributesCount() > 0){
                        int mod_pos = -1;
                        string mod_mass = "";
                        string mod_AA = "";
                        for (int i = 0; i < inspector.GetAttributesCount(); ++i){
                            Xml::Inspector<Xml::Encoding::Utf8Writer>::AttributeType AT = inspector.GetAttributeAt(i);
                            if (AT.Name == "location"){
                                mod_pos = atoi(AT.Value.c_str());
                            }
                            else if (AT.Name == "monoisotopicMassDelta"){
                                mod_mass = AT.Value;
                            }
                            else if (AT.Name == "residues"){
                                mod_AA = AT.Value;
                            }
                        }
                        if (mod_pos > -1 && mod_mass.length() > 0 && mod_AA.length() > 0){
                            
                            if (mod_AA == "M" && fabs(atof(mod_mass.c_str()) - 16.0f) < 0.1){
                                current_peptide->modifications.push_back(new pair<int, string>(mod_pos, mod_mass));
                            }
                            else if (mod_AA == "C" && fabs(atof(mod_mass.c_str()) - 57.0f) < 0.1){
                                current_peptide->modifications.push_back(new pair<int, string>(mod_pos, mod_mass));
                            }
                            else {
                                current_peptide->passThreshold = false;
                            }
                        }
                    }
                }
                
                else if (states.back() == "SpectrumIdentificationResult"){
                    current_psm = new PSM();
                    int spec_index = -1;
                    
                    if (inspector.GetAttributesCount() > 0){
                        for (int i = 0; i < inspector.GetAttributesCount(); ++i){
                            Xml::Inspector<Xml::Encoding::Utf8Writer>::AttributeType AT = inspector.GetAttributeAt(i);
                            if (AT.Name == "spectraData_ref") current_psm->ref_file = AT.Value;
                            else if (AT.Name == "spectrumID"){
                                current_psm->spectrum_id = AT.Value;
                                vector<string> tokens = split(AT.Value, '=');
                                if (tokens.size() >= 2 && tokens[0] == "index") {
                                    spec_index = atoi(tokens[1].c_str());
                                }
                            }
                        }
                    }
                    
                    if (spec_index > -1) PSMs.insert({spec_index, current_psm});
                }
                
                else if (states.back() == "SpectrumIdentificationItem"){
                    double calcMass = 1000.;
                    double expMass = 0.;
                    if (inspector.GetAttributesCount() > 0){
                        for (int i = 0; i < inspector.GetAttributesCount(); ++i){
                            Xml::Inspector<Xml::Encoding::Utf8Writer>::AttributeType AT = inspector.GetAttributeAt(i);
                            if (AT.Name == "calculatedMassToCharge") calcMass = atof(AT.Value.c_str());
                            else if (AT.Name == "experimentalMassToCharge") expMass = atof(AT.Value.c_str());
                            else if (AT.Name == "passThreshold") current_psm->passThreshold = AT.Value == "true";
                            else if (AT.Name == "chargeState") current_psm->charge = atoi(AT.Value.c_str());
                        }
                    }
                    double ppm_error = fabs(calcMass - expMass) / calcMass * 1000000.;
                    current_psm->precursor_mz = expMass;
                    
                    current_psm->passThreshold |= (ppm_error <= 5.);
                }
                
                else if (states.back() == "ProteinDetectionHypothesis"){
                    string accession = "";
                    bool insert = false;
                    
                    if (inspector.GetAttributesCount() > 0){
                        for (int i = 0; i < inspector.GetAttributesCount(); ++i){
                            Xml::Inspector<Xml::Encoding::Utf8Writer>::AttributeType AT = inspector.GetAttributeAt(i);
                            if (AT.Name == "dBSequence_ref") accession = AT.Value;
                            else if (AT.Name == "passThreshold") insert = AT.Value == "true";
                        }
                    }
                    
                    if (insert) valid_proteins.insert(accession);
                }
                break;
                
                
                
            case Xml::Inspected::EndTag:
                if (inspector.GetName() == "Peptide"){
                    string pep_seq = current_peptide->sequence;
                    
                    if (current_peptide->modifications.size() > 0){
                        sort(current_peptide->modifications.begin(), current_peptide->modifications.end(), compare_modifications);
                        
                        for (pair<int, string>* p : current_peptide->modifications){
                            int pos = p->first - 1;
                            double mass = atof((p->second).c_str());
                            if (pos < current_peptide->sequence.length()){
                                if (pep_seq[pos] == 'M' && fabs(mass - 16.0f) < 0.1){
                                    pep_seq = pep_seq.substr(0, pos) + "M[+16.0]" + pep_seq.substr(pos + 1);
                                }
                                
                                else if  (pep_seq[pos] == 'C' && fabs(mass - 57.0f) < 0.1){
                                    pep_seq = pep_seq.substr(0, pos) + "C[+57.0]" + pep_seq.substr(pos + 1);
                                }
                            }
                        }
                    }
                    current_peptide->sequence_mod = pep_seq;
                    
                }
                states.pop_back();
                break;
                
                
                
                
            case Xml::Inspected::EmptyElementTag:
                
                if (inspector.GetName() == "PeptideEvidence"){
                    string peptide_ref = "";
                    string peptideEv = "";
                    string accession = "";
                    bool insert = false;
                    
                    if (inspector.GetAttributesCount() > 0){
                        for (int i = 0; i < inspector.GetAttributesCount(); ++i){
                            Xml::Inspector<Xml::Encoding::Utf8Writer>::AttributeType AT = inspector.GetAttributeAt(i);
                            if (AT.Name == "peptide_ref") peptide_ref = AT.Value;
                            else if (AT.Name == "id") peptideEv = AT.Value;
                            else if (AT.Name == "isDecoy") insert = AT.Value == "false";
                            else if (AT.Name == "dBSequence_ref") accession = AT.Value;
                        }
                    }
                    
                    if (insert && peptide_ref.length() > 0 && peptideEv.length() > 0 && accession.length() > 0){
                        peptideEvidences.insert({peptideEv, new evidence(peptide_ref, accession)});
                    }
                }
                else if (inspector.GetName() == "PeptideEvidenceRef"){
                    
                    if (inspector.GetAttributesCount() > 0){
                        for (int i = 0; i < inspector.GetAttributesCount(); ++i){
                            Xml::Inspector<Xml::Encoding::Utf8Writer>::AttributeType AT = inspector.GetAttributeAt(i);
                            if (AT.Name == "peptideEvidence_ref"){
                                current_psm->peptideEv = AT.Value;
        
                                break;
                            }
                        }
                    }
                }
                else if (states.back() == "SpectrumIdentificationItem" && inspector.GetName() == "cvParam" && current_psm->score_type == 0){
                    bool cvRef = false;
                    string accession = "";
                    double value = 0;
                    for (int i = 0; i < inspector.GetAttributesCount(); ++i){
                            Xml::Inspector<Xml::Encoding::Utf8Writer>::AttributeType AT = inspector.GetAttributeAt(i);
                            if (AT.Name == "cvRef"){
                                cvRef = AT.Value == "PSI-MS";
                            }
                            else if (AT.Name == "accession"){
                                accession = AT.Value;
                            }
                            else if (AT.Name == "value"){
                                value = atof(AT.Value.c_str());
                            }
                        }
                    if (cvRef && PSM_score_types.find(accession) != PSM_score_types.end()){
                        current_psm->score_type = PSM_score_types.at(accession);
                        current_psm->score = value;
                    }
                }
                
                else if (states.back() == "SpectrumIdentificationResult" && inspector.GetName() == "cvParam"){
                    bool cvRef = false;
                    string accession = "";
                    double retention_time = 0;
                    for (int i = 0; i < inspector.GetAttributesCount(); ++i){
                            Xml::Inspector<Xml::Encoding::Utf8Writer>::AttributeType AT = inspector.GetAttributeAt(i);
                            if (AT.Name == "cvRef"){
                                cvRef = AT.Value == "PSI-MS";
                            }
                            else if (AT.Name == "accession"){
                                accession = AT.Value;
                            }
                            else if (AT.Name == "value"){
                                retention_time = atof(AT.Value.c_str());
                            }
                        }
                    if (cvRef && accession == "MS:1000894"){
                        current_psm->retention_time = retention_time;
                    }
                }
                break;
                
                
                
                
            case Xml::Inspected::Text:
                if (states.back() == "PeptideSequence"){
                    current_peptide->sequence = inspector.GetValue();
                }
                break;
                
                
                
                
            case Xml::Inspected::Comment:
                //cout << "Comment value: " << inspector.GetValue() << "\n";
                break;
                
                
            default:
                // Ignore the rest of elements.
                break;
        }
    }

    if (inspector.GetErrorCode() != Xml::ErrorCode::None)
    {
        cout << "Error: " << inspector.GetErrorMessage() <<
            " At row: " << inspector.GetRow() <<
            ", column: " << inspector.GetColumn() << ".\n";
        exit(-1);
    }
    
    
    // delete invalid peptides with miscleavages or unknown modifications
    vector<string> invalid_peptides;
    for (pair<string, mzid_peptide*> pep : peptides){
        if (contains_tryptic_miscleavages(pep.second->sequence) || modifications_at_termini(pep.second) || !pep.second->passThreshold){
            invalid_peptides.push_back(pep.first);
        }
    }
    for (string pep_ref : invalid_peptides){
        peptides.erase(pep_ref);
    }
    
    vector<string> invalid_peptideEv;
    for (pair<string, evidence*> ev_pair : peptideEvidences){
        evidence* ev = ev_pair.second;
        if (peptides.find(ev->pep_ref) == peptides.end()){
            invalid_peptideEv.push_back(ev_pair.first);
        }
    }
    for (string pepEv : invalid_peptideEv){
        peptideEvidences.erase(pepEv);
    }
    
    
    
    // searching for valid psms and collecting psms per peptide
    int file_id = 1;
    set<int> valid_psms_indexes;
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
                    mgf_files.insert({psm->ref_file, file_id++});
                    mgf_files_sorted.push_back(psm->ref_file);
                }
            }
        }
    }
    
    
    ////////////////////////////////////////////////////////////////////////
    // reading in mgf files
    ////////////////////////////////////////////////////////////////////////
    
    for (pair<string, int> ref_file_pair : mgf_files){
        ifstream infile(ref_file_pair.first);
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
    rc = sqlite3_open("test.sqlite", &db);
    if( rc ){
        cout << -3 << endl;
        exit(-3);
    }
    
    
    
    sqlite3_exec(db, "CREATE TABLE SpectrumSourceFiles (id INTEGER PRIMARY KEY autoincrement not null, fileName VARCHAR(512), cutoffScore REAL);", NULL, NULL, &zErrMsg);
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
    sqlite3_exec(db, "CREATE TABLE RetentionTimes (RefSpectraID INTEGER, RedundantRefSpectraID INTEGER, SpectrumSourceID INTEGER, ionMobility REAL,  collisionalCrossSectionSqA REAL, ionMobilityHighEnergyOffset REAL, ionMobilityType TINYINT, retentionTime REAL, bestSpectrum INTEGER, FOREIGN KEY(RefSpectraID)  REFERENCES RefSpectra(id) );", NULL, NULL, &zErrMsg);
    sqlite3_exec(db, "CREATE TABLE RefSpectraPeaks(RefSpectraID INTEGER, peakMZ BLOB, peakIntensity BLOB);", NULL, NULL, &zErrMsg);
    sqlite3_exec(db, "CREATE TABLE RefSpectraPeakAnnotations (id INTEGER primary key autoincrement not null, RefSpectraID INTEGER not null, peakIndex INTEGER not null, name VARCHAR(256), formula VARCHAR(256),inchiKey VARCHAR(256), otherKeys VARCHAR(256), charge INTEGER, adduct VARCHAR(256), comment VARCHAR(256), mzTheoretical REAL not null,mzObserved REAL not null);", NULL, NULL, &zErrMsg);
    sqlite3_exec(db, "CREATE TABLE RefSpectra (id INTEGER primary key autoincrement not null, peptideSeq VARCHAR(150), precursorMZ REAL, precursorCharge INTEGER, peptideModSeq VARCHAR(200), prevAA CHAR(1), nextAA CHAR(1), copies INTEGER, numPeaks INTEGER, ionMobility REAL, collisionalCrossSectionSqA REAL, ionMobilityHighEnergyOffset REAL, ionMobilityType TINYINT, retentionTime REAL, moleculeName VARCHAR(128), chemicalFormula VARCHAR(128), precursorAdduct VARCHAR(128), inchiKey VARCHAR(128), otherKeys VARCHAR(128), fileID INTEGER, SpecIDinFile VARCHAR(256), score REAL, scoreType TINYINT, confidence INTEGER);", NULL, NULL, &zErrMsg);
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
    sqlite3_exec(db, "CREATE INDEX idxMoleculeName ON RefSpectra (moleculeName, precursorAdduct);", NULL, NULL, &zErrMsg);
    sqlite3_exec(db, "CREATE INDEX idxInChiKey ON RefSpectra (inchiKey, precursorAdduct);", NULL, NULL, &zErrMsg);
    

    
    
    
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
    
    string sql_prepare = "INSERT INTO RefSpectra (peptideSeq, precursorMZ, precursorCharge, peptideModSeq, prevAA, nextAA, copies, numPeaks, ionMobility, collisionalCrossSectionSqA, ionMobilityHighEnergyOffset, ionMobilityType, retentionTime, moleculeName, chemicalFormula, precursorAdduct, inchiKey, otherKeys, fileID, SpecIDinFile, score, scoreType, confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    sqlite3_prepare_v2(db, sql_prepare.c_str(), -1, &stmt_refSpectra, 0);
    
    sql_prepare = "INSERT INTO Modifications (RefSpectraID, position, mass) VALUES (?, ?, ?);";
    sqlite3_prepare_v2(db, sql_prepare.c_str(), -1, &stmt_Modifications, 0);
    
    sql_prepare = "INSERT INTO RefSpectraPeaks (RefSpectraID, peakMZ, peakIntensity) VALUES (?, ?, ?);";
    sqlite3_prepare_v2(db, sql_prepare.c_str(), -1, &stmt_RefSpectraPeaks, 0);
    
    sql_prepare = "INSERT INTO SpectrumSourceFiles (fileName, cutoffScore) VALUES (?, ?);";
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
        sqlite3_bind_double(stmt_refSpectra, 12, 0.);
        sqlite3_bind_double(stmt_refSpectra, 13, psm->retention_time);
        sqlite3_bind_text(stmt_refSpectra, 14, "", 0, SQLITE_STATIC);
        sqlite3_bind_text(stmt_refSpectra, 15, "", 0, SQLITE_STATIC); // chemicalFormula
        sqlite3_bind_text(stmt_refSpectra, 16, "", 0, SQLITE_STATIC); 
        sqlite3_bind_text(stmt_refSpectra, 17, "", 0, SQLITE_STATIC); 
        sqlite3_bind_text(stmt_refSpectra, 18, "", 0, SQLITE_STATIC); 
        sqlite3_bind_int(stmt_refSpectra, 19, mgf_files.at(psm->ref_file));
        sqlite3_bind_text(stmt_refSpectra, 20, psm->spectrum_id.c_str(), psm->spectrum_id.length(), SQLITE_STATIC);
        sqlite3_bind_double(stmt_refSpectra, 21, psm->score);
        sqlite3_bind_int(stmt_refSpectra, 22, psm->score_type);
        sqlite3_bind_int(stmt_refSpectra, 23, 0);
        
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
        sqlite3_bind_double(stmt_SpectrumSourceFiles, 2, 1.);
            
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

    return EXIT_SUCCESS;

}