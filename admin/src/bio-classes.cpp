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



string urlDecode(string &SRC) {
    string ret;
    char ch;
    int i, ii;
    for (i=0; i<SRC.length(); i++) {
        if (int(SRC[i])==37) {
            sscanf(SRC.substr(i+1,2).c_str(), "%x", &ii);
            ch=static_cast<char>(ii);
            ret+=ch;
            i=i+2;
        } else {
            ret+=SRC[i];
        }
    }
    return (ret);
}





string base64_encode(unsigned char const* bytes_to_encode, unsigned int in_len) {
  std::string ret;
  int i = 0;
  int j = 0;
  unsigned char char_array_3[3];
  unsigned char char_array_4[4];

  while (in_len--) {
    char_array_3[i++] = *(bytes_to_encode++);
    if (i == 3) {
      char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
      char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
      char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
      char_array_4[3] = char_array_3[2] & 0x3f;

      for(i = 0; (i <4) ; i++)
        ret += base64_chars[char_array_4[i]];
      i = 0;
    }
  }

  if (i)
  {
    for(j = i; j < 3; j++)
      char_array_3[j] = '\0';

    char_array_4[0] = ( char_array_3[0] & 0xfc) >> 2;
    char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
    char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);

    for (j = 0; (j < i + 1); j++)
      ret += base64_chars[char_array_4[j]];

    while((i++ < 3))
      ret += '=';

  }

  return ret;

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
    sprintf(ppm_str, "%0.2f", ppm);
    
    
    
    char mass_str[20];
    sprintf(mass_str, "%0.4f", atof(mass.c_str()));
        
    string str = "{";
    str += "\"i\":" + str_id + ",";
    str += "\"s\":\"" + mod_sequence + "\",";
    str += "\"c\":" + charge + ",";
    str += "\"q\":" + confidence + ",";
    str += "\"m\":\"" + string(mass_str) + "\"";
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
    pI = -1;
    proteome_start_pos = -1;
    unreviewed = "0";
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
    if (unreviewed != "0") str += ",\"u\":" + unreviewed;
    if (kegg.length() > 0) str += ",\"k\":\"" + kegg + "\"";
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
    
int binary_search(double* array, int length, double key, double& mass_diff) {
    int low = 0;
    int mid = 0;
    int high = length - 1;
    int best_index = low;
    while (low <= high) {
        mid = (low + high) >> 1;
        if (array[mid] < key)  low = mid + 1;
        else if (array[mid] > key) high = mid - 1;
        else {
            best_index = mid;
            break;
        }
        if (fabs(array[mid] - key) < fabs(array[best_index] - key)) best_index = mid;
    }
    if (mid > 0 && key < array[mid]) {
        mid -= 1;
    }
    mass_diff = fabs(array[best_index] - key);
    return best_index;
}

void read_config_file(string filename, map<string, string> &m){
    string line;
    ifstream myfile (filename);
    if (myfile.is_open()){
        while ( getline (myfile,line) ){
            strip(line);
            if (line[0] == '#') continue;
            vector< string > tokens = split(line, '=');
            if (tokens.size() < 2) continue;
            strip(tokens.at(0));
            strip(tokens.at(1));
            m.insert(pair< string, string >(tokens.at(0), tokens.at(1)));
        }
        myfile.close();
    }
}







outputstreamer::outputstreamer(string filename) : ofile(filename, ios::binary){
}


outputstreamer::~outputstreamer(){
    ofile.flush();
    ofile.close();
}


void outputstreamer::write_bool(bool b){
    //int DS = DS_BOOL;
    //ofile.write((char*) &DS, 1);
    ofile.write((char*) &b, 1);
}

void outputstreamer::write_int(int i){
    //int DS = DS_INT;
    //ofile.write((char*) &DS, 1);
    ofile.write((char*) &i, 4);
}

void outputstreamer::write_float(float f){
    //int DS = DS_FLOAT;
    //ofile.write((char*) &DS, 1);
    ofile.write((char*) &f, 4);
}

void outputstreamer::write_double(double d){
    //int DS = DS_DOUBLE;
    //ofile.write((char*) &DS, 1);
    ofile.write((char*) &d, 8);
}

void outputstreamer::write_char(char c){
    //int DS = DS_CHAR;
    //ofile.write((char*) &DS, 1);
    ofile.write((char*) &c, 1);
}

void outputstreamer::write_string(string s){
    //int DS = DS_STRING;
    //ofile.write((char*) &DS, 1);
    int len = s.length() + 1;
    ofile.write((char*) &len, 4);
    ofile.write((char*) s.data(), (s.length() + 1));
}


void outputstreamer::write_vector_pair_int_string(vector<pair<int, string>*> v){
    //int DS = DS_PAIR_INT_STRING;
    //ofile.write((char*) &DS, 1);
    int l = v.size();
    write_int(l);
    for (pair<int, string>* p : v){
        write_int(p->first);
        write_string(p->second);
    }
}

void outputstreamer::write_PSM(PSM* psm){
    write_string(psm->ref_file);
    write_string(psm->spectrum_id);
    write_string(psm->peptideEv);
    write_bool(psm->passThreshold);
    write_int(psm->charge);
    write_double(psm->precursor_mz);
    write_double(psm->score);
    write_double(psm->retention_time);
    write_int(psm->score_type);
}


void outputstreamer::write_vector_PSM(vector<PSM*> v){
    int l = v.size();
    write_int(l);
    for (PSM* psm : v){
        write_PSM(psm);
    }
}
        
void outputstreamer::write_vector_string(vector<string> v){
    int l = v.size();
    write_int(l);
    for (string s : v){
        write_string(s);
    }
}
        
        

void outputstreamer::write_set_int(set<int> s){
    int l = s.size();
    write_int(l);
    for (int i : s){
        write_int(i);
    }
}
        
        

void outputstreamer::write_set_string(set<string> s){
    int l = s.size();
    write_int(l);
    for (string st : s){
        write_string(st);
    }
}

void outputstreamer::write_evidence(evidence* e){
    write_string(e->pep_ref);
    write_string(e->accession);
    
    write_vector_PSM(e->all_PSMs);
}

void outputstreamer::write_map_string_evidence(map<string, evidence*> m){
    int l = m.size();
    write_int(l);
    for (auto const& x : m){
        write_string(x.first);
        write_evidence(x.second);
    }
}

void outputstreamer::write_map_int_PSM(map<int, PSM*> m){
    int l = m.size();
    write_int(l);
    for (auto const& x : m){
        write_int(x.first);
        write_PSM(x.second);
    }
}

void outputstreamer::write_mzid_peptide(mzid_peptide* p){
    write_string(p->sequence);
    write_string(p->sequence_mod);
    write_bool(p->passThreshold);
    write_vector_pair_int_string(p->modifications);
}

void outputstreamer::write_map_string_mzid_peptide(map<string, mzid_peptide*> m){
    int l = m.size();
    write_int(l);
    for (auto const& x : m){
        write_string(x.first);
        write_mzid_peptide(x.second);
    }
}


void outputstreamer::write_map_string_int(map<string, int> m){
    int l = m.size();
    write_int(l);
    for (auto const& x : m){
        write_string(x.first);
        write_int(x.second);
    }
}








inputstreamer::inputstreamer(string filename) : ifile(filename, ios::binary){
    
}

inputstreamer::~inputstreamer(){
    ifile.close();
}


bool inputstreamer::read_bool(){
    char b;
    ifile.read (&b, 1);
    return b != 0;
}

int inputstreamer::read_int(){
    int i;
    ifile.read ((char*)(&i), 4);
    return i;
}

float inputstreamer::read_float(){
    float f;
    ifile.read ((char*)(&f), 4);
    return f;
    
}

double inputstreamer::read_double(){
    double d;
    ifile.read ((char*)(&d), 8);
    return d;
    
}

char inputstreamer::read_char(){
    char c;
    ifile.read (&c, 1);
    return c;
    
}


string inputstreamer::read_string(){
    int l;
    ifile.read ((char*)(&l), 4);
    
    char buffer[l];
    ifile.read ((char*)buffer, l);
    
    return string(buffer);
}




PSM* inputstreamer::read_PSM(){
    PSM* psm = new PSM();
    psm->ref_file = read_string();
    psm->spectrum_id = read_string();
    psm->peptideEv = read_string();
    psm->passThreshold = read_bool();
    psm->charge = read_int();
    psm->precursor_mz = read_double();
    psm->score = read_double();
    psm->retention_time = read_double();
    psm->score_type = read_int();
    return psm;
}

evidence* inputstreamer::read_evidence(){
    evidence* e = new evidence();
    e->pep_ref = read_string();
    e->accession = read_string();
    
    read_vector_PSM(e->all_PSMs);
    
    return e;
}




mzid_peptide* inputstreamer::read_mzid_peptide(){
    mzid_peptide* p = new mzid_peptide();
    p->sequence = read_string();
    p->sequence_mod = read_string();
    p->passThreshold = read_bool();
    read_vector_pair_int_string(p->modifications);
    
    return p;
}


void inputstreamer::read_vector_pair_int_string(vector<pair<int, string>*> &m){
    int l = read_int();
    for (int i = 0; i < l; ++i){
        int ii = read_int();
        string s = read_string();
        m.push_back(new pair<int, string>{ii, s});
    }
}


void inputstreamer::read_vector_PSM(vector<PSM*> &PSMs){
    int l = read_int();
    for (int i = 0; i < l; ++i){
        PSMs.push_back(read_PSM());
    }
    
}


void inputstreamer::read_vector_string(vector<string> &v){
    int l = read_int();
    for (int i = 0; i < l; ++i){
        v.push_back(read_string());
    }
    
}


void inputstreamer::read_set_int(set<int> &s){
    int l = read_int();
    for (int i = 0; i < l; ++i){
        s.insert(read_int());
    }
    
}


void inputstreamer::read_set_string(set<string> &s){
    int l = read_int();
    for (int i = 0; i < l; ++i){
        s.insert(read_string());
    }
    
}

void inputstreamer::read_map_string_evidence(map<string, evidence*> &m){
    int l = read_int();
    for (int i = 0; i < l; ++i){
        string s = read_string();
        evidence* e = read_evidence();
        m.insert({s, e});
    }
    
}

void inputstreamer::read_map_string_mzid_peptide(map<string, mzid_peptide*> &m){
    int l = read_int();
    for (int i = 0; i < l; ++i){
        string s = read_string();
        mzid_peptide* p = read_mzid_peptide();
        m.insert({s, p});
    }
    
}

void inputstreamer::read_map_string_int(map<string, int> &m){
    int l = read_int();
    for (int i = 0; i < l; ++i){
        string s = read_string();
        int ii = read_int();
        m.insert({s, ii});
    }
    
}

void inputstreamer::read_map_int_PSM(map<int, PSM*> &m){
    int l = read_int();
    for (int i = 0; i < l; ++i){
        int ii = read_int();
        PSM* psm = read_PSM();
        m.insert({ii, psm});
    }
    
}



    