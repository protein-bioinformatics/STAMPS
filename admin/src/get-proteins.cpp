#include <mysql.h>
#include <stdio.h>
#include <cstring>
#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include <set>
#include <list>
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
        int id;
        const string str_id;
        string charge;
        string mass;
        string mod_sequence;
        string tissues;
        
        spectrum(string _id) : str_id(_id) {id = atoi(str_id.c_str());}
        
        string to_string(bool complete = true){
            string str = "{";
            str += "\"i\":" + str_id;
            if (complete) str += ",\"s\":\"" + mod_sequence + "\"";
            if (complete) str += ",\"c\":" + charge;
            if (complete) str += ",\"m\":\"" + mass + "\"";
            str += ",\"t\":[" + tissues + "]";
            str += "}";
            return str;
        }
};


class peptide {
    public:
        string peptide_seq;
        set<string> tissues;
        vector<spectrum*> spectra;
        
        peptide(string ps) : peptide_seq(ps) {}
        
        string to_string(bool complete = true){
            string str = "{";
            if (complete) str += "\"p\":\"" + peptide_seq + "\",";
            str += "\"s\":[";
            for (int i = 0; i < spectra.size(); ++i){
                if (i) str += ",";
                str += spectra.at(i)->to_string(complete);
            }
            /*
            str += "]";
            str += ",\"t\":[";
            set<string>::iterator it = tissues.begin();
            for (int i = 0; it != tissues.end(); ++it, ++i){
                if (i) str += ",";
                str += *it;
            }
            */
            str += "]}";
            return str;
        }
};

class protein {
    public:
        string id;
        const string str_id;
        string name;
        string definition;
        string mass;
        string accession;
        string ec_number;
        string fasta;
        vector<peptide*> peptides;
        
        protein(string _id) : str_id(_id) {id = atoi(str_id.c_str());}
        
        string to_string(bool complete = true){
            string str = "{";
            str += "\"i\":" + str_id;
            if (complete) str += ",\"n\":\"" + name + "\"";
            if (complete) str += ",\"d\":\"" + definition + "\"";
            if (complete) str += ",\"m\":\"" + mass + "\"";
            if (complete) str += ",\"a\":\"" + accession + "\"";
            if (complete) str += ",\"e\":\"" + ec_number + "\"";
            str += ",\"p\":[";
            for (int i = 0; i < peptides.size(); ++i){
                if (i) str += ",";
                str += peptides.at(i)->to_string(complete);
            }
            str += "]}";
            return str;
        }
};

map<string, peptide* > peptide_dict;
vector< protein* > proteins;
vector < spectrum* > spectra;
map< int, spectrum* > spectrum_dict;

wavelet* occ = 0;
int* less_table = 0;
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
    map<string, peptide* >::iterator it = peptide_dict.find(P);
    if (it == peptide_dict.end()){
        int L = 0, R = len_text - 1;
        int p_len = P.length();
        for (int i = 0; i < p_len; ++i){
            const char c = P[p_len - 1 - i];  
            
            L = occ->get_rank(L - 1, c);
            R = occ->get_rank(R, c) - 1;
            
            if (L > R) break;
            
            int lss = less_table[c];
            L += lss;
            R += lss;
            
        }
        if (L == R){
            current_pep = new peptide(P);
            proteins[binarySearch(indexes, index_size, SA[L])]->peptides.push_back(current_pep);
            peptide_dict.insert(pair<string, peptide* >(P, current_pep));
        }
    }
    else {
        current_pep = it->second;
    }
    if (current_pep){
        spectrum *s1 = new spectrum(argv[0]);
        current_pep->spectra.push_back(s1);
        spectrum_dict.insert(pair<int, spectrum* >(s1->id, s1));
        spectra.push_back(s1);
    }
    return 0;
}


static int sqlite_callback_spectra(void *data, int argc, char **argv, char **azColName){
    map<int, spectrum*>::iterator it = spectrum_dict.find(atoi(argv[0]));
    if (it != spectrum_dict.end()){
        spectrum* s1 = it->second;
        s1->charge = argv[1];
        string mass = argv[2];
        s1->mod_sequence = argv[3];
        if (mass.find(".") != string::npos){
            mass = mass.substr(0, mass.find(".") + 5);
        }
        s1->mass = mass;
    }
    return 0;
}

static int sqlite_callback_tissues(void *data, int argc, char **argv, char **azColName){
    map<int, spectrum*>::iterator it = spectrum_dict.find(atoi(argv[0]));
    if (it != spectrum_dict.end()){
        spectrum* s1 = it->second;
        s1->tissues = argv[1];
    }
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
    replaceAll(modified, {10}, "");
    replaceAll(modified, {13}, "");
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

static int callback(void *count, int argc, char **argv, char **azColName) {
    int *c = (int*)count;
    *c = atoi(argv[0]);
    return 0;
}


main(int argc, char** argv) {
    bool compress = true;
    bool via_accessions = false;
    bool via_loci = false;
    bool via_functions = false;
    
    if (compress){
        cout << "Content-Type: text/html" << endl;
        cout << "Content-Encoding: deflate" << endl << endl;
    }
    else {
        cout << "Content-Type: text/html" << endl << endl;
    }
    
    string accessions = "";
    string loci_ids = "";
    string function_ids = "";
    bool statistics = false;
    
    
    char* get_string_chr = getenv("QUERY_STRING");
    
    // TODO: debugging
    //get_string_chr = (char*)"statistics";
    //get_string_chr = (char*)"loci=12";
    
    if (!get_string_chr){
        cout << -1;
        return -1;
    }
    
    string get_string = string(get_string_chr);
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
        else if (get_values.size() && get_values.at(0) == "functions"){
            function_ids = get_values.at(1);
            via_functions = true;
        }
        else if (get_values.size() && get_values.at(0) == "statistics"){
            statistics = true;
        }
    }
    
    if (via_accessions + via_loci + via_functions + statistics != 1){
        cout << -5;
        return -5;
    }
    
    
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
    else if (via_loci) {
        if (loci_ids == "" || loci_ids.find("'") != string::npos){
            cout << -1 << endl;
            return -1;
        }    
        replaceAll(loci_ids, string(":"), string("','"));
        
        sql_query_proteins = "select distinct p.* from proteins p inner join protein_loci pl on p.id = pl.protein_id where unreviewed = false and pl.locus_id in ('";
        sql_query_proteins += loci_ids;
        sql_query_proteins += "');";
    }
    else if (via_functions) {
        if (function_ids == "" || function_ids.find("'") != string::npos){
            cout << -1 << endl;
            return -1;
        }    
        replaceAll(function_ids, string(":"), string("','"));
        
        sql_query_proteins = "select distinct p.* from proteins p inner join protein_functions pf on p.id = pf.protein_id where unreviewed = false and pf.function_id in ('";
        sql_query_proteins += function_ids;
        sql_query_proteins += "');";
    }
    else if (statistics) {
        sql_query_proteins = "select * from proteins where unreviewed = false;";
    }
    
    
    
    
    if (mysql_query(conn, sql_query_proteins.c_str())) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    res = mysql_store_result(conn);
    
    for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
        column_names_proteins.insert(pair<string,int>(field->name, i));
    }
    
    proteins = vector< protein* >(mysql_num_rows(res), 0);
    
    len_text = 1; // plus sentinal
    int p_i = 0;
    while ((row = mysql_fetch_row(res)) != NULL){
        string pid = row[column_names_proteins[string("id")]];
        protein* last_protein = new protein(pid);
        last_protein->name = row[column_names_proteins[string("name")]];
        last_protein->definition = row[column_names_proteins[string("definition")]];
        last_protein->mass = row[column_names_proteins[string("mass")]];
        last_protein->accession = row[column_names_proteins[string("accession")]];
        last_protein->ec_number = row[column_names_proteins[string("ec_number")]];
        last_protein->fasta = cleanFasta(row[column_names_proteins[string("fasta")]]);
        len_text += last_protein->fasta.length() + 1;
        proteins[p_i++] = last_protein;
    }
    
    
    mysql_free_result(res);
    mysql_close(conn);
    
    
    // create FM index for fast pattern search    
    unsigned char* T = new unsigned char[len_text];
    unsigned char* bwt = new unsigned char[len_text];
    index_size = proteins.size() + 1;
    indexes = new int[index_size];
    indexes[0] = 0;
    SA = new int[len_text];
    for (int i = 0; i < len_text; ++i) SA[i] = i;
    T[len_text - 1] = '$';
    
    
    unsigned char* tt = T;
    for (int i = 0; i < proteins.size(); ++i){
        int l = proteins[i]->fasta.length();
        memcpy(tt, proteins[i]->fasta.data(), l);
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
    
    
    
    int num_spectra = 0;
    rc = sqlite3_exec(db, "select count(*) from RefSpectra;", callback, &num_spectra, &zErrMsg);
    if (rc != SQLITE_OK) {
        cout << -5 << endl;
        sqlite3_free(zErrMsg);
        exit(-5);
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
    double l = spectra.size();
    

    
    if (!statistics){
        vector<spectrum*>::iterator it = spectra.begin();
        while (it != spectra.end()){
            
            string sql_query_lite = (*it)->str_id;
            ++it;
            for (int i = 1; i < t && it != spectra.end(); ++i, ++it){
                sql_query_lite += ", " + (*it)->str_id;
            }
            
            string sql_query = "SELECT id i, precursorCharge c, precursorMZ m, peptideModSeq s FROM RefSpectra WHERE id IN (" + sql_query_lite + ");";
            vector< map< string, string > > spectra_data;
            rc = sqlite3_exec(db, sql_query.c_str(), sqlite_callback_spectra, (void*)&spectra_data, &zErrMsg);
            if( rc != SQLITE_OK ){
                cout << -4 << endl;
                sqlite3_free(zErrMsg);
                exit(-4);
            }
            
            // quering possible tissue origins
            sql_query = "SELECT RefSpectraId i, group_concat(tissue) t FROM Tissues WHERE i IN (" + sql_query_lite + ") group by i;";
            vector< map< string, string > > tissue_data;
            rc = sqlite3_exec(db, sql_query.c_str(), sqlite_callback_tissues, (void*)&tissue_data, &zErrMsg);
            if( rc != SQLITE_OK ){
                cout << -6 << endl;
                sqlite3_free(zErrMsg);
                exit(-6);
            }
        }
    }
    else {
        
        // quering possible tissue origins
        string sql_query = "SELECT RefSpectraId i, group_concat(tissue) t FROM Tissues group by i;";
        vector< map< string, string > > tissue_data;
        rc = sqlite3_exec(db, sql_query.c_str(), sqlite_callback_tissues, (void*)&tissue_data, &zErrMsg);
        if( rc != SQLITE_OK ){
            cout << -6 << endl;
            sqlite3_free(zErrMsg);
            exit(-6);
        }
    }
    
    sqlite3_close(db);
    
    string response = "[";
    for (int i = 0; i < proteins.size(); ++i){
        if (i) response += ",";
        response += proteins[i]->to_string(!statistics);
    }
    response += "]";
    
    /*
    len_text = response.length() + 1; // +1 because of sentinal
    
    T = (unsigned char*)response.c_str();
    bwt = new unsigned char[len_text];
    unsigned char* mtf = new unsigned char[len_text];
    SA = new int[len_text];
    for (int i = 0; i < len_text; ++i) SA[i] = i;
    T[len_text - 1] = '!';
    
    sais(T, SA, len_text);
    
    set<char> alphabet;
    list<char> alphabet_order;
    
    for (int i = 0; i < len_text; ++i){
        if (SA[i] > 0) bwt[i] = T[SA[i] - 1];
        else bwt[i] = T[len_text - 1];
        alphabet.insert(T[i]);
    }
    
    for(set<char>::iterator set_it = alphabet.begin(); set_it != alphabet.end(); ++set_it){
        alphabet_order.push_back(*set_it);
    }
    
    for (int i = 0; i < len_text; ++i){
        char c = bwt[i];
        int pos = 0;
        list<char>::iterator list_it = alphabet_order.begin();
        for(; c != *list_it; ++list_it, ++pos){}
        mtf[i] = pos;
        if ( list_it != alphabet_order.begin()) alphabet_order.splice( alphabet_order.begin(), alphabet_order, list_it, std::next( list_it ) );
    }
    */
    
    if (compress){
        cout << compress_string(response);
        
        //cout << response.length() << endl;
        //cout << (int)mtf[0] << endl;
        //cout << response << endl;
        //cout << compress_string(response).length();
    }
    else {
        cout << response;
    }
}
