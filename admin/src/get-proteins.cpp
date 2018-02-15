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
#include <time.h>
#include <sys/stat.h>
#include <sys/types.h>
#include "sais.h"
#include "wavelet.h"
#include "bio-classes.h"

using namespace std;


#ifdef _WIN32
    string folder_delim = "\\";
#elif defined __unix__
    string folder_delim = "/";
#elif defined __APPLE__
    string folder_delim = "/";
#endif


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

/*
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
        string tissue_numbers;
        
        spectrum(string _id) : str_id(_id) {id = atoi(str_id.c_str());}
        
        string to_string(bool complete = true){
            string mod_mod_sequence = mod_sequence;
            replaceAll(mod_sequence, "M[+16.0]", "m");
            replaceAll(mod_mod_sequence, "C[+57.0]", "c");
            float theo_mass = compute_mass(mod_mod_sequence);
            float observ_mass = atof(mass.c_str()) * atoi(charge.c_str()) - (atoi(charge.c_str()) - 2) * 1.007276;
            float ppm = (observ_mass - theo_mass) / theo_mass * 1000000.;
            char buffer[50];
            sprintf(buffer, "%0.5f", ppm);
            
            string str = "{";
            str += "\"i\":" + str_id;
            if (complete) str += ",\"s\":\"" + mod_sequence + "\"";
            str += ",\"c\":" + charge;
            str += ",\"m\":" + mass;
            str += ",\"p\":" + string(buffer);
            
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
        float mass;
        string accession;
        string ec_number;
        string fasta;
        float pI;
        vector<peptide*> peptides;
        
        protein(string _id) : str_id(_id) {id = atoi(str_id.c_str());}
        
        string to_string(bool complete = true){
            stringstream ss;
            ss << fasta.length();
            
            string str = "{";
            str += "\"i\":" + str_id;
            char buffer[20];
            sprintf(buffer, "%0.3f", mass);
            if (complete) str += ",\"n\":\"" + name + "\"";
            if (complete) str += ",\"d\":\"" + definition + "\"";
            str += ",\"m\":" + string(buffer);
            if (complete) str += ",\"a\":\"" + accession + "\"";
            if (complete) str += ",\"e\":\"" + ec_number + "\"";
            str += ",\"l\":" + ss.str();
            sprintf(buffer, "%0.3f", pI);
            str += ",\"pI\":" + string(buffer);
            str += ",\"p\":[";
            for (int i = 0; i < peptides.size(); ++i){
                if (i) str += ",";
                str += peptides.at(i)->to_string(complete);
            }
            str += "]}";
            return str;
        }
};
*/

map<string, peptide* > peptide_dict;
vector< protein* > proteins;
vector < spectrum* > spectra;
map< int, spectrum* > spectrum_dict;
map< string, string > parameters;

wavelet* occ = 0;
ranking* index_rank = 0;
int* less_table = 0;
int len_text = 0;
int* SA = 0;

string prev_pep_seq = "";
peptide* prev_pep = 0;
string statistics_json_suffix = ".json";

static int sqlite_callback(void *data, int argc, char **argv, char **azColName){
    peptide* current_pep = 0;
    string P = argv[6];
    
    
    if (P.compare(prev_pep_seq)){
        int L = 0, R = len_text - 1;
        int p_len = P.length();
        for (int i = 0; i < p_len; ++i){
            const char c = P[p_len - 1 - i];
            
            occ->get_rank(--L, R, c);
            --R;
            
            
            
            if (L > R) break;
            int lss = less_table[c];
            L += lss;
            R += lss;
            
        }
        
        
        if (L == R){
            int start_pos = SA[L];
            int prot_index = index_rank->get_rank_right(start_pos);
            current_pep = new peptide(P, start_pos - proteins[prot_index]->proteome_start_pos);
            proteins[index_rank->get_rank_right(SA[L])]->peptides.push_back(current_pep);
            peptide_dict.insert(pair<string, peptide* >(P, current_pep));
            prev_pep_seq = P;
            prev_pep = current_pep;
        }
    }
    else {
        current_pep = prev_pep;
    }
    
    if (current_pep){
        spectrum *s1 = new spectrum(argv[0]);
        s1->charge = argv[1];
        string mass = argv[2];
        s1->mod_sequence = argv[3];
        if (mass.find(".") != string::npos){
            mass = mass.substr(0, mass.find(".") + 5);
        }
        s1->mass = mass;
        s1->tissues = argv[4];
        s1->tissue_numbers = argv[5];
        current_pep->spectra.push_back(s1);
        spectrum_dict.insert(pair<int, spectrum* >(s1->id, s1));
        spectra.push_back(s1);
    }
    return 0;
}



static int callback(void *count, int argc, char **argv, char **azColName) {
    int *c = (int*)count;
    *c = atoi(argv[0]);
    return 0;
}



string get_protein_data(string sql_query_proteins, string species, MYSQL *conn, bool statistics){
    MYSQL_RES *res;
    MYSQL_ROW row;
    MYSQL_FIELD *field;
    
    if (mysql_query(conn, sql_query_proteins.c_str())) {
        cout << "error: " << mysql_error(conn) << endl;
        exit (-1);
    }
    res = mysql_store_result(conn);
    
    map< string, int > column_names_proteins;
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
        //last_protein->mass = row[column_names_proteins[string("mass")]];
        last_protein->accession = row[column_names_proteins[string("accession")]];
        last_protein->ec_number = row[column_names_proteins[string("ec_number")]];
        last_protein->fasta = cleanFasta(row[column_names_proteins[string("fasta")]]);
        last_protein->pI = predict_isoelectric_point(last_protein->fasta);
        last_protein->mass = compute_mass(last_protein->fasta);
        last_protein->proteome_start_pos = len_text;
        len_text += last_protein->fasta.length() + 1;
        proteins[p_i++] = last_protein;
    }
    
    
    mysql_free_result(res);
    mysql_close(conn);
    
    if (!p_i) return "[]";
    
    
    // create FM index for fast pattern search    
    unsigned char* T = new unsigned char[len_text];
    unsigned char* bwt = new unsigned char[len_text];
    T[len_text - 1] = '$';
    
    int len_field = (len_text >> shift) + 1;
    ulong* index_bitfield = new ulong[len_field];
    for (int i = 0; i < len_field; ++i) index_bitfield[i] = 0;
    
    unsigned char* tt = T;
    int p = 0;
    for (int i = 0; i < proteins.size(); ++i){
        int l = proteins[i]->fasta.length();
        memcpy(tt + p, proteins[i]->fasta.data(), l);
        p += l;
        tt[p] = '/';
        index_bitfield[p >> shift] |= one << (p & mask);
        ++p;
    }
    
    index_rank = new ranking(index_bitfield, len_field);
    
 
    ulong abc[2] = {zero, zero};
    for (int i = 'A'; i <= 'Z'; ++i) abc[i >> shift] |= one << (i & mask);
    abc['/' >> shift] |= one << ('/' & mask);
    abc['$' >> shift] |= one << ('$' & mask);
    
    
    SA = new int[len_text];
    for (int i = 0; i < len_text; ++i) SA[i] = i;
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
        
    rc = sqlite3_open((char*)parameters["spectra_db_" + species].c_str(), &db);
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
    string sql_query_lite2 = "SELECT r.id i, r.precursorCharge c, r.precursorMZ m, r.peptideModSeq s, group_concat(t.tissue) ts, group_concat(t.number) n, r.peptideSeq p FROM RefSpectra r INNER JOIN Tissues t ON r.id = t.RefSpectraId GROUP BY i order by p;";
        
    // Execute SQL statement
    char tmp_data;
    rc = sqlite3_exec(db, sql_query_lite2.c_str(), sqlite_callback, (void*)&tmp_data, &zErrMsg);
    if( rc != SQLITE_OK ){
        cout << -3 << endl;
        sqlite3_free(zErrMsg);
        exit(-3);
    }
    
    delete occ;
    delete index_rank;
    delete SA;

    sqlite3_close(db);
    
    
    
    
    
    string response = "[";
    for (int i = 0; i < proteins.size(); ++i){
        if (i) response += ",";
        response += proteins[i]->to_string();
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
    
    return response;
}













main(int argc, char** argv) {
    bool compress = true;
    bool caching = true;
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
    bool statistics_pathways = false;
    
    
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
    
    
    
    string species = "";
    vector<string> get_entries = split(get_string, '&');  
    for (int i = 0; i < get_entries.size(); ++i){
        vector<string> get_values = split(get_entries.at(i), '=');
        if (get_values.size()){
            if (get_values.at(0) == "accessions"){
                accessions = get_values.at(1);
                via_accessions = true;
            }
            else if (get_values.at(0) == "loci"){
                loci_ids = get_values.at(1);
                via_loci = true;
            }
            else if (get_values.at(0) == "functions"){
                function_ids = get_values.at(1);
                via_functions = true;
            }
            else if (get_values.at(0) == "statistics"){
                statistics = true;
            }
            else if (get_values.at(0) == "statistics_pathways"){
                statistics_pathways = true;
            }
            else if (get_values.at(0) == "species"){
                species = get_values.at(1);
            }
        }
    }
    
    if (via_accessions + via_loci + via_functions + statistics + statistics_pathways != 1){
        cout << -5;
        return -5;
    }
    
    
    
    string sql_query_proteins = "";
    string line;
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
    MYSQL_ROW row;
    MYSQL_FIELD *field;
    char *server = (char*)parameters["mysql_host"].c_str();
    char *user = (char*)parameters["mysql_user"].c_str();
    char *password = (char*)parameters["mysql_passwd"].c_str();
    char *database = (char*)parameters["mysql_db"].c_str();
    
    /* Connect to database */
    if (!mysql_real_connect(conn, server, user, password, database, 0, NULL, 0)) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    
    if (statistics_pathways){
        string sql_query = "SELECT distinct pw.id pathway_id, pw.name, npc.protein_id FROM pathways pw inner join nodes n on pw.id = n.pathway_id inner join nodeproteincorrelations npc on n.id = npc.node_id inner join proteins p on npc.protein_id = p.id where p.unreviewed = 0 order by pw.name;";
        if (mysql_query(conn, sql_query.c_str())) {
            cout << "error: " << mysql_error(conn) << endl;
            return 1;
        }
        res = mysql_use_result(conn);
        
        int index_pw = 0;
        int index_p = 0;
        string last_id = "";
        string response = "[";
        while ((row = mysql_fetch_row(res)) != NULL){
            if (last_id.compare(row[0])){
                last_id = row[0];
                index_p = 0;
                
                if (index_pw++) response += "]],";
                response += "[" + last_id + ",\"" + string(row[1]) + "\",[";
            }
            
            
            if (index_p++) response += ",";
            response += string(row[2]);
        }
        if (index_pw) response += "]]";
        response += "]";
        
        cout << (compress ? compress_string(response) : response);
        exit(0);
    }
    
    
    if (!species.length()){
        cout << -7;
        return -7;
    }
    
    if (parameters.find("spectra_db_" + species) == parameters.end()){
        cout << -8;
        return -8;
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
        sql_query_proteins += "') and species = '" + species + "';";
    }
    else if (via_loci) {
        if (loci_ids == "" || loci_ids.find("'") != string::npos){
            cout << -1 << endl;
            return -1;
        }    
        replaceAll(loci_ids, string(":"), string("','"));
        
        sql_query_proteins = "select distinct p.* from proteins p inner join protein_loci pl on p.id = pl.protein_id where unreviewed = false and pl.locus_id in ('";
        sql_query_proteins += loci_ids;
        sql_query_proteins += "') and species = '" + species + "';";
    }
    else if (via_functions) {
        if (function_ids == "" || function_ids.find("'") != string::npos){
            cout << -1 << endl;
            return -1;
        }    
        replaceAll(function_ids, string(":"), string("','"));
        
        sql_query_proteins = "select distinct p.* from proteins p inner join protein_functions pf on p.id = pf.protein_id where unreviewed = false and pf.function_id in ('";
        sql_query_proteins += function_ids;
        sql_query_proteins += "') and species = '" + species + "';";
    }
    else if (statistics) {
        sql_query_proteins = "select * from proteins where unreviewed = false and species = '" + species + "';";
    }
    
    
    string result = "";
    if (statistics){
        struct stat date_sqlite_db;
        struct stat date_sqlite_json;
        
        vector<string> sqlite_path = split((parameters["spectra_db_" + species]), folder_delim[0]);
        string statistics_json_filename = ".." + folder_delim + "data" + folder_delim + sqlite_path.back() + statistics_json_suffix;
        
        
        // reading the protein data from a cached file only if cached file exists and sqlite_db last modification date is older than cached json file date
        if (caching && !stat((char*)parameters["spectra_db_" + species].c_str(), &date_sqlite_db) && !stat((char*)statistics_json_filename.c_str(), &date_sqlite_json) && date_sqlite_db.st_ctime < date_sqlite_json.st_ctime){
            ifstream t;
            int file_length = 0;
            t.open(statistics_json_filename.c_str(), ios::binary);
            t.seekg(0, ios::end);
            file_length = t.tellg();
            t.seekg(0, ios::beg);
            result = string(file_length, 'a');
            t.read((char*)result.data(), file_length);
            t.close();
            
            cout << result << endl;
            return 0;
        }
        // otherwise retrieve the protein data the normal way and store in 'data' folder
        else {
            result = get_protein_data(sql_query_proteins, species, conn, statistics);
            if (compress) result = compress_string(result);
            ofstream json_file(statistics_json_filename.c_str(), ios::binary);
            json_file.write(result.c_str(), result.length());
        }
    }
    else {
        result = get_protein_data(sql_query_proteins, species, conn, statistics);
        if (compress) result = compress_string(result);
    }
    
    cout << result << endl;
    return 0;
}
