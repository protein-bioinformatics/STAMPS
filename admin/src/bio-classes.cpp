#include "bio-classes.h"



vector<string> split(string str, char delimiter) {
  vector<string> internal;
  stringstream ss(str); // Turn the string into a stream.
  string tok;
  
  while(getline(ss, tok, delimiter)) {
    internal.push_back(tok);
  }
  
  return internal;
}

void replaceAll(std::string& str, const std::string& from, const std::string& to) {
    if(from.empty())
        return;
    size_t start_pos = 0;
    while((start_pos = str.find(from, start_pos)) != std::string::npos) {
        str.replace(start_pos, from.length(), to);
        start_pos += to.length(); // In case 'to' contains 'from', like replacing 'x' with 'yx'
    }
}


void strip(string &str){
    while (str.length() && (str[0] == ' ' || str[0] == 13 || str[0] == 10)){
        str = str.substr(1);
    }
    int l = str.length();
    while (l && (str[l - 1] == ' ' || str[l - 1] == 13 || str[l - 1] == 10)){
        str = str.substr(0, l - 1);
        --l;
    }
}

string cleanFasta(string str){
    int start_pos = str.find("\n");
    string modified = str.substr(start_pos + 1);
    replaceAll(modified, "\n", "");
    replaceAll(modified, {10}, "");
    replaceAll(modified, {13}, "");
    
    for (int i = 0; i < modified.length(); ++i){
        char c = modified[i];
        if (!(abc[c >> shift] & (one << (c & mask)))){
           modified = modified.substr(0, i) + modified.substr(i + 1, modified.length());
           --i;
        }
    }
    
    return modified;
}

bool is_integer_number(const string& string){
  string::const_iterator it = string.begin();
  int minSize = 0;
  if(string.size()>0 && (string[0] == '-' || string[0] == '+')){
    it++;
    minSize++;
  }
  while (it != string.end() && isdigit(*it)) ++it;
  return string.size()>minSize && it == string.end();
}


int binarySearch(int* array, int length, int key) {
    int low = 0;
    int mid = 0;
    int high = length - 1;
    while (low <= high) {
        mid = (low + high) >> 1;
        if (array[mid] <= key) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    if (mid > 0 && key < array[mid]) {
        mid -= 1;
    }
    return mid;
}




string remove_newline(string str) {
    size_t start_pos = 0;
    while((start_pos = str.find("\n", start_pos)) != string::npos) {
        str.replace(start_pos, 1, "\\n");
        start_pos += 2; // In case 'to' contains 'from', like replacing 'x' with 'yx'
    }
    string cf = "1";
    cf[0] = 13;
    start_pos = 0;
    while((start_pos = str.find(cf, start_pos)) != string::npos) {
        str.replace(start_pos, 1, "");
    }
    return str;
}


float compute_mass(string protein_seq){
    float mass = 20.024018;
    for (int i = 0; i < protein_seq.length(); ++i) mass += acids[protein_seq[i]];        
    return mass;
}


string compress_string(const string& str, int compressionlevel){
    z_stream zs;                        // z_stream is zlib's control structure
    memset(&zs, 0, sizeof(zs));
 
    if (deflateInit(&zs, compressionlevel) != Z_OK)
        throw(runtime_error("deflateInit failed while compressing."));
 
    zs.next_in = (Bytef*)str.data();
    zs.avail_in = str.size();           // set the z_stream's input
 
    int ret;
    char outbuffer[32768];
    string outstring;
 
    // retrieve the compressed bytes blockwise
    do {
        zs.next_out = reinterpret_cast<Bytef*>(outbuffer);
        zs.avail_out = sizeof(outbuffer);
 
        ret = deflate(&zs, Z_FINISH);
 
        if (outstring.size() < zs.total_out) {
            // append the block to the output string
            outstring.append(outbuffer,
                             zs.total_out - outstring.size());
        }
    } while (ret == Z_OK);
 
    deflateEnd(&zs);
 
    if (ret != Z_STREAM_END) {          // an error occurred that was not EOF
        ostringstream oss;
        oss << "Exception during zlib compression: (" << ret << ") " << zs.msg;
        throw(runtime_error(oss.str()));
    }
 
    return outstring;
}


float predict_isoelectric_point(string protein_seq){
    float NQ = 0.0;
    float pH = 6.51;
    float pHprev = 0.0;         
    float pHnext = 14.0;        
    float e = 0.01;
    float counter[128];
    for (int i = 0; i < 128; ++i) counter[i] = 0;
    for (int i = 0; i < protein_seq.length(); ++i) ++counter[protein_seq[i]];
    
    while (true){
        char first = protein_seq[0];
        char last = protein_seq[protein_seq.length() - 1];
        float QN_1 = -1. / (1. + pow(10., ((coeff_set[first >> 6] >> (first & 63) & 1l) ? aa_coefficients[first][2] : aa_coefficients_middle[first][1]) - pH));
        float QP_2 = 1. / (1. + pow(10., pH - ((coeff_set[last >> 6] >> (last & 63) & 1l) ? aa_coefficients[last][0] : aa_coefficients_middle[last][0])));
    
        float QN_2 = -counter['D'] / (1 + pow(10, aa_coefficients['D'][1] - pH));
        float QN_3 = -counter['E'] / (1 + pow(10, aa_coefficients['E'][1] - pH));
        float QN_4 = -counter['C'] / (1 + pow(10, aa_coefficients['C'][1] - pH));
        float QN_5 = -counter['Y'] / (1 + pow(10, aa_coefficients['Y'][1] - pH));
        float QP_1 = counter['H'] / (1 + pow(10, pH - aa_coefficients['H'][1]));
        float QP_3 = counter['K'] / (1 + pow(10, pH - aa_coefficients['K'][1]));
        float QP_4 = counter['R'] / (1 + pow(10, pH - aa_coefficients['R'][1]));
    
        NQ = QN_1 + QN_2 + QN_3 + QN_4 + QN_5 + QP_1 + QP_2 + QP_3 + QP_4;
        
        if (NQ < 0.){
            float tmp = pH;
            pH = pH - ((pH - pHprev) / 2.0);
            pHnext = tmp;
        }
        else {
            float tmp = pH;
            pH = pH + ((pHnext - pH) / 2.0);
            pHprev = tmp;
        }
        if (fabs(pH-pHprev) < e){
            return pH;
        }
    }
}



spectrum::spectrum(string _id) : str_id(_id) {
    id = atoi(str_id.c_str());    
}
        
string spectrum::to_string(){
    string mod_mod_sequence = mod_sequence;
    replaceAll(mod_mod_sequence, "M[+16.0]", "m");
    replaceAll(mod_mod_sequence, "C[+57.0]", "c");
    float theo_mass = compute_mass(mod_mod_sequence);
    float chg = atof(charge.c_str());
    float observ_mass = atof(mass.c_str()) * chg - (chg - 2) * 1.007276 - chg * 0.00054857990946;
    float ppm = (observ_mass - theo_mass) / theo_mass * 1000000.;
    char ppm_str[50];
    sprintf(ppm_str, "%0.5f", ppm);
        
    string str = "{";
    str += "\"i\":" + str_id + ",";
    str += "\"s\":\"" + mod_sequence + "\",";
    str += "\"c\":" + charge + ",";
    str += "\"m\":\"" + mass + "\"";
    str += ",\"p\":" + string(ppm_str);
    
    vector<string> tissues_split = split(tissues, ',');
    vector<string> tissue_numbers_split = split(tissue_numbers, ',');
    if (tissues_split.size() == tissue_numbers_split.size()){
        str += ",\"t\":{";
        for (int i = 0; i < tissues_split.size(); ++i){
            if (i) str += ",";
            str += "\"" + tissues_split[i] + "\":" + tissue_numbers_split[i];
        }
        str += "}";
    }
    str += "}";
    return str;
}



peptide::peptide(string ps, int pos) : peptide_seq(ps), start_pos(pos) {}

string peptide::to_string(){
    char buffer[50];
    sprintf(buffer, "%i", start_pos);
    string str = "{";
    str += "\"p\":\"" + peptide_seq + "\",";
    str += "\"b\":" + string(buffer) + ",";
    str += "\"s\":[";
    for (int i = 0; i < spectra.size(); ++i){
        if (i) str += ",";
        str += spectra.at(i)->to_string();
    }
    str += "]}";
    return str;
}


        
protein::protein(string _id) : str_id(_id) {
    id = atoi(str_id.c_str());
    name = "";
    definition = "";
    mass = -1;
    accession = "";
    ec_number = "";
    kegg = "";
    fasta = "";
    float pI = -1;
    validation = "";
    proteome_start_pos = -1;
}

string protein::to_string(){
    char fasta_length[20];
    sprintf(fasta_length, "%i", (int)fasta.length());
    
    char mass_str[20];
    sprintf(mass_str, "%0.4f", mass);
    
    char pI_str[20];
    sprintf(pI_str, "%0.3f", pI);
    
    string str = "{";
    str += "\"i\":" + str_id;
    if (name.length() > 0) str += ",\"n\":\"" + name + "\"";
    if (definition.length() > 0) str += ",\"d\":\"" + definition + "\"";
    if (mass > 0) str += ",\"m\":\"" + string(mass_str) + "\"";
    if (fasta.length() > 0) str += ",\"l\":" + string(fasta_length);
    if (accession.length() > 0) str += ",\"a\":\"" + accession + "\"";
    if (ec_number.length() > 0) str += ",\"e\":\"" + ec_number + "\"";
    if (kegg.length() > 0) str += ",\"k\":\"" + kegg + "\"";
    if (validation.length() > 0) str += ",\"v\":" + validation;
    if (pI > 0) str += ",\"pI\":" + string(pI_str);
    if (peptides.size() > 0){
        str += ",\"p\":[";
        for (int i = 0; i < peptides.size(); ++i){
            if (i) str += ",";
            str += peptides.at(i)->to_string();
        }
        str += "]";
    }
    str += "}";
    return str;
}