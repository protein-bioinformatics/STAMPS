#include <mysql.h>
#include <stdio.h>
#include <cstring>
#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include <sstream>
#include <sqlite3.h> 
#include <math.h>
#include "sais.h"
#include "wavelet.h"
#include "bio-classes.h"

using namespace std;


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



class node {
    public:
        string id;
        string name;
        string pathway_id;
        string type;
        string pathway_ref;
        string x;
        string y;
        string c_number;
        string smiles;
        string formula;
        string exact_mass;
        vector<protein*> proteins;
        
        
        string to_string(){
            string str = "{";
            str += "\"i\":" + id + ",";
            str += "\"n\":\"" + name + "\",";
            //str += "\"pathway_id\":" + pathway_id + ",";
            str += "\"t\":\"" + type + "\",";
            str += "\"r\":" + (pathway_ref.length() ? pathway_ref : "0") + ",";
            str += "\"x\":" + x + ",";
            str += "\"y\":" + y + ",";
            str += "\"c\":\"" + c_number + "\",";
            str += "\"s\":\"" + smiles + "\",";
            str += "\"f\":\"" + formula + "\",";
            str += "\"e\":\"" + exact_mass + "\",";
            str += "\"p\":[";
            for (int i = 0; i < proteins.size(); ++i){
                if (i) str += ",";
                str += proteins.at(i)->to_string();
            }
            str += "]}";
            return str;
        }
};

map<string, peptide* >* all_peptides = 0;
vector< protein* >* proteins = 0;
map < int, protein* >* all_proteins = 0;
vector < spectrum* >* spectra = 0;
map< int, spectrum* >* all_spectra = 0;
wavelet* occ = 0;
ranking* index_rank = 0;
int* less_table = 0;
int len_text = 0;
int* SA = 0;


string prev_pep_seq = "";
peptide* prev_pep = 0;

static int sqlite_callback(void *data, int argc, char **argv, char **azColName){
    peptide* current_pep = 0;
    string P = argv[0];
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
            current_pep = new peptide(P, start_pos - proteins->at(prot_index)->proteome_start_pos);
            proteins->at(prot_index)->peptides.push_back(current_pep);
            all_peptides->insert(pair<string, peptide* >(P, current_pep));
            prev_pep_seq = P;
            prev_pep = current_pep;
        }
    }
    else {
        current_pep = prev_pep;
    }
    
    if (current_pep){
        spectrum *s1 = new spectrum(argv[1]);
        current_pep->spectra.push_back(s1);
        all_spectra->insert(pair<int, spectrum* >(s1->id, s1));
        spectra->push_back(s1);
    }
    return 0;
}



static int sqlite_callback_spectra(void *data, int argc, char **argv, char **azColName){
    map<int, spectrum*>::iterator it = all_spectra->find(atoi(argv[0]));
    if (it != all_spectra->end()){
        spectrum* s1 = it->second;
        s1->charge = argv[1];
        string mass = argv[2];
        s1->mod_sequence = argv[3];
        if (mass.find(".") != string::npos){
            mass = mass.substr(0, mass.find(".") + 5);
        }
        s1->mass = mass;
        s1->tissues = argv[4];
        s1->tissue_numbers = argv[5];
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




void print_out(string response, bool compress){
    if (compress){
        cout << compress_string(response);        
    }
    else {
        cout << response;
    }
}


main(int argc, char** argv) {
    bool compress = true;
    string response = "";
    
    if (compress){
        cout << "Content-Type: text/html" << endl;
        cout << "Content-Encoding: deflate" << endl << endl;
        
    }
    else {
        cout << "Content-Type: text/html" << endl << endl;
    }
    
    string pathway_id = "";
    string species = "";
    
    
    char* get_string_chr = getenv("QUERY_STRING");
    
    if (!get_string_chr){
        cout << -1;
        return -1;
    }
    
    string get_string = get_string_chr;
    
    if (!get_string.length()){
        response += "-1";
        print_out(response, compress);
        return -1;
    }
    vector<string> get_entries = split(get_string, '&');  
    for (int i = 0; i < get_entries.size(); ++i){
        vector<string> get_values = split(get_entries.at(i), '=');
        if (get_values.size() && get_values.at(0) == "pathway"){
            pathway_id = get_values.at(1);
        }
        else if (get_values.size() && get_values.at(0) == "species"){
            species = get_values.at(1);
        }
    }
    if (pathway_id == "" || species == "" || !is_integer_number(pathway_id) || species.find("'") != string::npos){
        response += "-1";
        print_out(response, compress);
        return -1;
    }
    
    /*
    pathway_id = "15";
    species = "mouse";
    */
    
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
    map< string, int > column_names_nodes;
    map< string, int > column_names_proteins;
    map< string, int > column_names_peptides;
    map< string, int > column_names_spectra;
    map< string, int > column_names_rest;
    map< int, node*> node_dict;
    all_peptides = new map<string, peptide* >();
    proteins = new vector< protein* >();
    all_proteins = new map < int, protein* >();
    spectra = new vector < spectrum* >();
    all_spectra = new map< int, spectrum* >();
    
    /* Connect to database */
    if (!mysql_real_connect(conn, server, user, password, database, 0, NULL, 0)) {
        response += "error: " + string(mysql_error(conn)) + "\n";
        print_out(response, compress);
        return 1;
    }
    /* send SQL query */
    string sql_query_nodes = "select * from nodes where pathway_id = ";
    sql_query_nodes += pathway_id;
    sql_query_nodes += " and type = 'protein';";
    
    
    if (mysql_query(conn, sql_query_nodes.c_str())) {
        response += "error: " + string(mysql_error(conn)) + "\n";
        print_out(response, compress);
        return 1;
    }
    res = mysql_use_result(conn);
        
    for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
        column_names_nodes.insert(pair<string,int>(field->name, i));
    }
    
    while ((row = mysql_fetch_row(res)) != NULL){
        node* last_node = new node;
        last_node->id = row[column_names_nodes[string("id")]];
        last_node->pathway_id = row[column_names_nodes[string("pathway_id")]];
        last_node->type = row[column_names_nodes[string("type")]];
        last_node->x = row[column_names_nodes[string("x")]];
        last_node->y = row[column_names_nodes[string("y")]];
        node_dict.insert(pair<int, node*>(atoi(last_node->id.c_str()), last_node));
    }
    
    
    string sql_query_proteins = "select n.id nid, p.* from nodes n inner join nodeproteincorrelations np on n.id = np.node_id inner join proteins p on np.protein_id = p.id where p.unreviewed = false and n.pathway_id = ";
    sql_query_proteins += pathway_id;
    sql_query_proteins += " and n.type = 'protein' and p.species = '";
    sql_query_proteins += species;
    sql_query_proteins += "';";
    
    if (mysql_query(conn, sql_query_proteins.c_str())) {
        response += "error: " + string(mysql_error(conn)) + "\n";
        print_out(response, compress);
        return 1;
    }
    res = mysql_use_result(conn);
    
    for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
        column_names_proteins.insert(pair<string,int>(field->name, i));
    }
    
    
    int pi = 0;
    len_text = 1; // plus sentinal
    while ((row = mysql_fetch_row(res)) != NULL){
        int node_id = atoi(row[column_names_proteins[string("nid")]]);
        string str_pid = row[column_names_proteins[string("id")]];
        int pid = atoi(str_pid.c_str());
        protein* last_protein = 0;
        
        if (all_proteins->find(pid) == all_proteins->end()){
            last_protein = new protein(str_pid);
            last_protein->name = row[column_names_proteins[string("name")]];
            last_protein->definition = row[column_names_proteins[string("definition")]];
            last_protein->accession = row[column_names_proteins[string("accession")]];
            last_protein->ec_number = row[column_names_proteins[string("ec_number")]];
            last_protein->validation = row[column_names_proteins[string("validation")]];
            last_protein->fasta = cleanFasta(row[column_names_proteins[string("fasta")]]);
            last_protein->mass = compute_mass(last_protein->fasta);
            last_protein->pI = predict_isoelectric_point(last_protein->fasta);
            last_protein->proteome_start_pos = len_text;
            len_text += last_protein->fasta.length() + 1;
            all_proteins->insert(pair<int, protein* >(pid, last_protein));
            proteins->push_back(last_protein);
        }
        else {
            last_protein = all_proteins->at(pid);
        }
        node_dict[node_id]->proteins.push_back(last_protein);
    }
    
    //start_time();
    
    
    // create FM index for fast pattern search    
    unsigned char* T = new unsigned char[len_text];
    unsigned char* bwt = new unsigned char[len_text];
    SA = new int[len_text];
    for (int i = 0; i < len_text; ++i) SA[i] = i;
    T[len_text - 1] = '$';
    
    int len_field = (len_text >> shift) + 1;
    ulong* index_bitfield = new ulong[len_field];
    for (int i = 0; i < len_field; ++i) index_bitfield[i] = 0;
    
    unsigned char* tt = T;
    int p = 0;
    for (int i = 0; i < proteins->size(); ++i){
        int l = proteins->at(i)->fasta.length();
        memcpy(tt + p, proteins->at(i)->fasta.data(), l);
        p += l;
        tt[p] = '/';
        index_bitfield[p >> shift] |= one << (p & mask);
        ++p;
    }
    index_rank = new ranking(index_bitfield, len_field);
        
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
    
    
    
    /*
    sqlite3 *db;
    char *zErrMsg = 0;
    int rc;
    
    rc = sqlite3_open((char*)parameters["spectra_db_" + species].c_str(), &db);
    if( rc ){
        response += "-2\n";
        print_out(response, compress);
        return -2;
    }
    
        
    // Execute SQL statement
    string sql_query_lite2 = "SELECT r.peptideSeq p, r.id i FROM RefSpectra r order by p;";
    char tmp_data;
    rc = sqlite3_exec(db, sql_query_lite2.c_str(), sqlite_callback, (void*)&tmp_data, &zErrMsg);
    if( rc != SQLITE_OK ){
        response += "-3\n";
        print_out(response, compress);
        sqlite3_free(zErrMsg);
        return -3;
    }
    
    delete occ;
    delete index_rank;
    delete SA;
    
    
    sqlite3_stmt *stmt;
    string sql_prepare = "SELECT r.precursorCharge c, r.precursorMZ m, r.peptideModSeq s, group_concat(t.tissue) ts, group_concat(t.number) n FROM (SELECT id, precursorCharge, precursorMZ, peptideModSeq FROM RefSpectra WHERE id = ?) r INNER JOIN Tissues t ON r.id = t.RefSpectraId GROUP BY r.id;";
    sqlite3_prepare_v2(db, sql_prepare.c_str(), -1, &stmt, 0);
    
    
    
    vector<spectrum*>::iterator it = spectra->begin();
    char buffer[20];
    while (it != spectra->end()){
        spectrum* s = *it;
        sqlite3_bind_int(stmt, 1, s->id);
        int rc = sqlite3_step(stmt);
        // encode charge
        sprintf(buffer, "%i", sqlite3_column_int(stmt, 0));
        s->charge = buffer;
        // encode mass
        sprintf(buffer, "%0.5f", sqlite3_column_double(stmt, 1));
        s->mass = buffer;
        s->mod_sequence = (char*)sqlite3_column_text(stmt, 2);
        s->tissues = (char*)sqlite3_column_text(stmt, 3);
        s->tissue_numbers = (char*)sqlite3_column_text(stmt, 4);
        sqlite3_clear_bindings(stmt);
        sqlite3_reset(stmt);
        ++it;
    }
    sqlite3_close(db);
    */
    
    
    //stop_time();
    //cout << "time: " << get_time() << "us" << endl;
    
    
    
    
    
    string sql_query_rest = "(select n.id, p.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y, '' c_number, '' smiles, '' formula, '' exact_mass from nodes n inner join pathways p on p.id = n.foreign_id where n.type = 'pathway' and n.pathway_id = ";
    sql_query_rest += pathway_id; 
    sql_query_rest += ") union ";
    sql_query_rest += "(select n.id, m.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y, m.c_number, m.smiles, m.formula, m.exact_mass from nodes n inner join metabolites m on m.id = n.foreign_id where n.type = 'metabolite' and n.pathway_id = ";
    sql_query_rest += pathway_id;
    sql_query_rest += ") union ";
    sql_query_rest += "(select id, '', pathway_id, type, 0, x, y, 0, '', '', '' from nodes n where n.type = 'membrane' and n.pathway_id = ";
    sql_query_rest += pathway_id;
    sql_query_rest += ") union ";
    sql_query_rest += "(select n.id, l.label, n.pathway_id, n.type, 0, n.x, n.y, 0, '', '', '' from nodes n inner join labels l on n.foreign_id = l.id where n.type = 'label' and n.pathway_id = ";
    sql_query_rest += pathway_id;
    sql_query_rest += ");";
    
    if (mysql_query(conn, sql_query_rest.c_str())) {
        response += "error: " + string(mysql_error(conn)) + "\n";
        print_out(response, compress);
        return 1;
    }
    res = mysql_use_result(conn);
    
    for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
        column_names_rest.insert(pair<string,int>(field->name, i));
    }
    
    while ((row = mysql_fetch_row(res)) != NULL){
        node* last_node = new node();
        last_node->id = row[column_names_rest[string("id")]];
        last_node->pathway_id = row[column_names_rest[string("pathway_id")]];
        last_node->name = row[column_names_rest[string("name")]];
        last_node->type = row[column_names_rest[string("type")]];
        last_node->pathway_ref = row[column_names_rest[string("pathway_ref")]]; 
        last_node->x = row[column_names_rest[string("x")]];
        last_node->y = row[column_names_rest[string("y")]];
        last_node->c_number = row[column_names_rest[string("c_number")]];
        last_node->smiles = row[column_names_rest[string("smiles")]];
        last_node->formula = row[column_names_rest[string("formula")]];
        last_node->exact_mass = row[column_names_rest[string("exact_mass")]];
        node_dict.insert(pair<int, node*>(atoi(last_node->id.c_str()), last_node));
    }
    
    

    response += "[";
    map<int, node*>::iterator node_it = node_dict.begin();
    if (node_dict.size()){
        response += (node_it->second)->to_string();
        ++node_it;
    }
    for (; node_it != node_dict.end(); ++node_it){
        response += "," + (node_it->second)->to_string();
    }
    response += "]";
    print_out(response, compress);
    
    
    delete all_peptides;
    delete proteins;
    delete all_proteins;
    delete spectra;
    delete all_spectra;
    
    mysql_free_result(res);
    mysql_close(conn);
}
