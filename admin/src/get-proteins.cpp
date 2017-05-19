#include <mysql.h>
#include <stdio.h>
#include <cstring>
#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include <string>
#include <sstream>
#include <sqlite3.h> 
#include <math.h>
#include <zlib.h>
#include "sais.h"
#include "wavelet.h"

using namespace std;

vector<string> split(string str, char delimiter) {
  vector<string> internal;
  stringstream ss(str); // Turn the string into a stream.
  string tok;
  
  while(getline(ss, tok, delimiter)) {
    internal.push_back(tok);
  }
  
  return internal;
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

string compress_string(const string& str, int compressionlevel = Z_BEST_COMPRESSION){
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


class spectrum {
    public:
        string id;
        string charge;
        string mass;
        string mod_sequence;
        
        spectrum(string _id) : id(_id) {}
        
        string to_string(){
            string str = "{";
            str += "\"id\": " + id + ", ";
            str += "\"mod_sequence\": \"" + mod_sequence + "\", ";
            str += "\"charge\": " + charge + ", ";
            str += "\"mass\": \"" + mass + "\"";
            str += "}";
            return str;
        }
};


class peptide {
    public:
        string peptide_seq;
        vector<spectrum*> spectra;
        
        peptide(string ps) : peptide_seq(ps) {}
        
        string to_string(){
            string str = "{";
            //str += "\"id\": " + id + ", ";
            str += "\"peptide_seq\": \"" + peptide_seq + "\", ";
            str += "\"spectra\": [";
            for (int i = 0; i < spectra.size(); ++i){
                if (i) str += ", ";
                str += spectra.at(i)->to_string();
            }
            str += "]}";
            return str;
        }
};

class protein {
    public:
        string id;
        string name;
        string definition;
        string mass;
        string accession;
        string ec_number;
        string fasta;
        vector<peptide*> peptides;
        
        string to_string(){
            string str = "{";
            str += "\"id\": " + id + ", ";
            str += "\"name\": \"" + name + "\", ";
            str += "\"definition\": \"" + definition + "\", ";
            str += "\"mass\": \"" + mass + "\", ";
            str += "\"accession\": \"" + accession + "\", ";
            str += "\"ec_number\": \"" + ec_number + "\", ";
            //str += "\"fasta\": \"" + remove_newline(fasta) + "\", ";
            str += "\"peptides\": [";
            for (int i = 0; i < peptides.size(); ++i){
                if (i) str += ", ";
                str += peptides.at(i)->to_string();
            }
            str += "]}";
            return str;
        }
};

map<string, peptide* >* all_peptides = 0;
vector< protein* >* proteins = 0;
map<string, protein* >* all_proteins = 0;
vector < spectrum* >* spectra = 0;
map< string, spectrum* >* all_spectra = 0;
wavelet* occ = 0;
ulong* less_table = 0;
string text_p = "p";
string text_id = "i";
int len_text = 0;
int index_size = 0;
int* indexes = 0;
int* SA = 0;

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

static int sqlite_callback(void *data, int argc, char **argv, char **azColName){
    peptide* current_pep = 0;
    string P = argv[1];
    if (all_peptides->find(P) == all_peptides->end()){
        int L = 1, R = len_text - 1;
        int p_len = P.length();
        for (int i = 0; i < p_len; ++i){
            const char c = P[p_len - 1 - i];            
            ulong lss = less_table[c];
            L = occ->get_rank(L - 1, c);
            R = occ->get_rank(R, c) - 1;
            
            if (L > R) break;
            
            L += lss;
            R += lss;
        }
        if (L <= R){
            current_pep = new peptide(P);
            proteins->at(binarySearch(indexes, index_size, SA[L]))->peptides.push_back(current_pep);
            all_peptides->insert(pair<string, peptide* >(P, current_pep));
        }
    }
    else {
        current_pep = all_peptides->at(P);
    }
    if (current_pep){
        spectrum *s1 = new spectrum(argv[0]);
        current_pep->spectra.push_back(s1);
        all_spectra->insert(pair<string, spectrum* >(s1->id, s1));
        spectra->push_back(s1);
    }
    return 0;
}

static int sqlite_callback2(void *data, int argc, char **argv, char **azColName){
    vector< map< string, string > > *spectra_d = (vector< map< string, string > >*)data;
    map< string, string > *dataset = new map< string, string >;
    for(int i = 0; i < argc; ++i){
        dataset->insert(pair< string, string>(azColName[i], argv[i] ? argv[i] : "NULL"));
    }
    spectra_d->push_back(*dataset);
    return 0;
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

string cleanFasta(string str){
    int start_pos = str.find("\n");
    string modified = str.substr(start_pos + 1);
    replaceAll(modified, "\n", "");
    return modified;
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


main(int argc, char** argv) {
    bool compress = true;
    bool via_accessions = false;
    bool via_loci = false;
    
    if (compress){
        cout << "Content-Type: text/html" << endl;
        cout << "Content-Encoding: deflate" << endl << endl;
    }
    else {
        cout << "Content-Type: text/html" << endl << endl;
    }
    
    string accessions = "";
    string loci_ids = "";
    
    
    string get_string = getenv("QUERY_STRING");
    if (!get_string.length()){
        cout << -1;
        return -1;
    }
    vector<string> get_entries = split(get_string, '&');  
    for (int i = 0; i < get_entries.size(); ++i){
        vector<string> get_values = split(get_entries.at(i), '=');
        if (get_values.size() && get_values.at(0) == "accessions"){
            accessions = get_values.at(1);
            via_accessions = true;
        }
        else if (get_values.size() && get_values.at(0) == "loci"){
            loci_ids = get_values.at(1);
            via_loci = true;
        }
    }
    
    if (via_accessions == via_loci){
        cout << -5;
        return -5;
    }
    
    
    all_peptides = new map<string, peptide* >();
    proteins = new vector< protein* >();
    spectra = new vector < spectrum* >();
    all_spectra = new map< string, spectrum* >();
    all_proteins = new map < string, protein* >();
    string sql_query_proteins = "";
    
    
    
    string line;
    map< string, string > parameters;
    ifstream myfile ("../admin/qsdb.conf");
    if (myfile.is_open()){
        while ( getline (myfile,line) ){
            strip(line);
            if (line[0] == '#') continue;
            vector< string > tokens = split(line, '=');
            if (tokens.size() < 2) continue;
            strip(tokens.at(0));
            strip(tokens.at(1));
            parameters.insert(pair< string, string >(tokens.at(0), tokens.at(1)));
        }
        myfile.close();
    }
    
    
    MYSQL *conn = mysql_init(NULL);
    MYSQL_RES *res;
    MYSQL_RES *res_reagents;
    MYSQL_ROW row;
    MYSQL_FIELD *field;
    char *server = (char*)parameters["mysql_host"].c_str();
    char *user = (char*)parameters["mysql_user"].c_str();
    char *password = (char*)parameters["mysql_passwd"].c_str();
    char *database = (char*)parameters["mysql_db"].c_str();
    map< string, int > column_names_proteins;
    map< string, int > column_names_peptides;
    map< string, int > column_names_spectra;
    map< string, int > column_names_rest;
    
    /* Connect to database */
    if (!mysql_real_connect(conn, server, user, password, database, 0, NULL, 0)) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    
    if (via_accessions){
    
        //accessions = "B2RQC6:Q9CZW5:Q9DCC8:Q9CPQ3:Q9DCC8:Q9QYA2";
        if (accessions == "" || accessions.find("'") != string::npos){
            cout << -1 << endl;
            return -1;
        }    
        replaceAll(accessions, string(":"), string("','"));
        
        sql_query_proteins = "select distinct * from proteins where unreviewed = false and accession in ('";
        sql_query_proteins += accessions;
        sql_query_proteins += "');";
    }
    else {
        if (loci_ids == "" || loci_ids.find("'") != string::npos){
            cout << -1 << endl;
            return -1;
        }    
        replaceAll(loci_ids, string(":"), string("','"));
        
        sql_query_proteins = "select distinct p.* from proteins p inner join protein_loci pl on p.id = pl.protein_id where unreviewed = false and pl.locus_id in ('";
        sql_query_proteins += loci_ids;
        sql_query_proteins += "');";
    }
    
    
    if (mysql_query(conn, sql_query_proteins.c_str())) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    res = mysql_use_result(conn);
    
    for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
        column_names_proteins.insert(pair<string,int>(field->name, i));
    }
    
    
    len_text = 1; // plus sentinal
    while ((row = mysql_fetch_row(res)) != NULL){
        string pid = row[column_names_proteins[string("id")]];
        protein* last_protein = new protein();
        if (all_proteins->find(pid) == all_proteins->end()){
            last_protein = new protein();
            last_protein->id = pid;
            last_protein->name = row[column_names_proteins[string("name")]];
            last_protein->definition = row[column_names_proteins[string("definition")]];
            last_protein->mass = row[column_names_proteins[string("mass")]];
            last_protein->accession = row[column_names_proteins[string("accession")]];
            last_protein->ec_number = row[column_names_proteins[string("ec_number")]];
            last_protein->fasta = cleanFasta(row[column_names_proteins[string("fasta")]]);
            len_text += last_protein->fasta.length() + 1;
            all_proteins->insert(pair<string, protein* >(pid, last_protein));
            proteins->push_back(last_protein);
        }
        else {
            last_protein = all_proteins->at(pid);
        }
    }
    
    mysql_free_result(res);
    mysql_close(conn);
    
    // create FM index for fast pattern search    
    unsigned char* T = new unsigned char[len_text];
    unsigned char* bwt = new unsigned char[len_text];
    index_size = proteins->size() + 1;
    indexes = new int[index_size];
    indexes[0] = 0;
    SA = new int[len_text];
    for (int i = 0; i < len_text; ++i) SA[i] = i;
    T[len_text - 1] = '$';
    
    unsigned char* tt = T;
    for (int i = 0; i < proteins->size(); ++i){
        int l = proteins->at(i)->fasta.length();
        memcpy(tt, proteins->at(i)->fasta.data(), l);
        tt[l] = '/';
        tt += l + 1;
        indexes[i + 1] = indexes[i] + l + 1;
    }
        
    ulong abc[2] = {0, 0};
    for (int i = 'A'; i <= 'Z'; ++i) abc[i >> 6] |= 1ull << (i & 63);
    abc['/' >> 6] |= 1ull << ('/' & 63);
    abc['$' >> 6] |= 1ull << ('$' & 63);
    
    sais(T, SA, len_text);
    
    for (int i = 0; i < len_text; ++i){
        if (SA[i] > 0) bwt[i] = T[SA[i] - 1];
        else bwt[i] = T[len_text - 1];
    }
    
    occ = new wavelet((char*)bwt, len_text, abc);
    less_table = occ->create_less_table();
    
    
    sqlite3 *db;
    char *zErrMsg = 0;
    int rc;
    
    rc = sqlite3_open((char*)parameters["sqlite_file"].c_str(), &db);
    if( rc ){
        cout << -2 << endl;
        exit(-2);
    }
    //, precursorCharge c, precursorMZ m, peptideModSeq s
    string sql_query_lite2 = "SELECT id i, peptideSeq p FROM RefSpectra;";
        
    // Execute SQL statement
    char tmp_data;
    rc = sqlite3_exec(db, sql_query_lite2.c_str(), sqlite_callback, (void*)&tmp_data, &zErrMsg);
    if( rc != SQLITE_OK ){
        cout << -3 << endl;
        sqlite3_free(zErrMsg);
        exit(-3);
    }
    
    
    delete occ;
    delete indexes;
    delete SA;
    
    double t = 500;
    double l = spectra->size();

    string text_pc = "c";
    string text_mz = "m";
    string text_mod = "s";
    for (int i = 0; i < ceil(l / t); ++i){
        string sql_query_lite = "";
        for (int j = i * t; j < min((i + 1) * t, l); ++j){
            if (sql_query_lite.length()){
                sql_query_lite += ", ";
            }
            sql_query_lite += spectra->at(j)->id;
        }
        
        sql_query_lite = "SELECT id i, precursorCharge c, precursorMZ m, peptideModSeq s FROM RefSpectra WHERE id IN (" + sql_query_lite + ");";
        vector< map< string, string > > spectra_data;
        rc = sqlite3_exec(db, sql_query_lite.c_str(), sqlite_callback2, (void*)&spectra_data, &zErrMsg);
        if( rc != SQLITE_OK ){
            cout << -4 << endl;
            sqlite3_free(zErrMsg);
            exit(-4);
        }
        
        for(int i = 0; i < spectra_data.size(); ++i){
            map< string, string > spd = spectra_data[i];
            spectrum* s1 = all_spectra->at(spd[text_id]);
            s1->charge = spd[text_pc];
            s1->mod_sequence = spd[text_mod];
            char buffer[20];
            int n;
            string mass = spd[text_mz];
            if (mass.find(".") != string::npos){
                mass = mass.substr(0, mass.find(".") + 5);
            }
            s1->mass = mass;
        }
    }
    
    sqlite3_close(db);
    
    string response = "[";
    for (int i = 0; i < proteins->size(); ++i){
        if (i) response += ", ";
        response += proteins->at(i)->to_string();
    }
    response += "]";
    if (compress){
        cout << compress_string(response);        
    }
    else {
        cout << response;
    }
    
    
    delete all_peptides;
    delete proteins;
    delete spectra;
    delete all_proteins;
    delete all_spectra;
    
}
