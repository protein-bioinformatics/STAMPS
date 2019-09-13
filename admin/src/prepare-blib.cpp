#include "bio-classes.h"


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








bool compare_modifications(pair<int, string>* m1, pair<int, string>* m2){
    return m2->first < m1->first;
}



int main(int argc, char** argv)
{
    string ident_file = argv[1];
    string file_id = argv[2];
    
    // load parameters from config file
    map< string, string > parameters;
    read_config_file("../qsdb.conf", parameters);
    
    
    // Create a connection and connect to database
    sql::ResultSet *res;
    sql::Driver *driver = get_driver_instance();
    sql::Connection *con = driver->connect(parameters["mysql_host"], parameters["mysql_user"], parameters["mysql_passwd"]);
    con->setSchema(parameters["mysql_db"]);
    sql::Statement *stmt = con->createStatement();
    
    
    try {
    
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
    
            
            
    
        Xml::Inspector<Xml::Encoding::Utf8Writer> inspector(ident_file);

        map<string, mzid_peptide*> peptides;
        map<string, evidence*> peptideEvidences;
        map<int, PSM*> PSMs;
        set<string> valid_proteins;
        vector<string> input_spectra;
        
        
        vector<string> states;
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
                    
                    else if (inspector.GetName() == "InputSpectra"){
                        for (int i = 0; i < inspector.GetAttributesCount(); ++i){
                            Xml::Inspector<Xml::Encoding::Utf8Writer>::AttributeType AT = inspector.GetAttributeAt(i);
                            if (AT.Name == "spectraData_ref"){
                                input_spectra.push_back(AT.Value);
                            }
                        }
                    }
                    break;
                    
                    
                    
                    
                case Xml::Inspected::Text:
                    if (states.back() == "PeptideSequence"){
                        current_peptide->sequence = inspector.GetValue();
                    }
                    break;
                    
                    
                    
                    
                case Xml::Inspected::Comment:
                    break;
                    
                    
                default:
                    // Ignore the rest of elements.
                    break;
            }
        }
        if (inspector.GetErrorCode() != Xml::ErrorCode::None)
        {
            throw(-1);
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
        
        
        outputstreamer ops(parameters["root_path"] + "/tmp/upload/data.dat");
        ops.write_set_string(valid_proteins);
        ops.write_map_string_mzid_peptide(peptides);
        ops.write_map_string_evidence(peptideEvidences);
        ops.write_map_int_PSM(PSMs);
        
        if (input_spectra.size()){
            for (string sp : input_spectra){
                string sql_query = "INSERT INTO chunks (file_id, checksum, chunk_num, type, filename) values (" + file_id + ", '', 0, 'depend', '" + sp + "');";
                stmt->execute(sql_query);
            }
        }
        else {
            string sql_query = "INSERT INTO chunks (file_id, checksum, chunk_num, type, filename) values (" + file_id + ", '', -1, 'depend', '~');";
            stmt->execute(sql_query);
        }
    }
    catch (...){
        string sql_query = "INSERT INTO chunks (file_id, checksum, chunk_num, type, filename) values (" + file_id + ", '', -1, 'depend', '~');";
        stmt->execute(sql_query);
    }

    return EXIT_SUCCESS;

}