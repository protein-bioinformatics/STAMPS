#include <mysql.h>
#include <stdio.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include <string>
#include <sstream>
#include <sqlite3.h> 
#include <math.h>

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
        string id;
        string peptide_seq;
        vector<spectrum*> spectra;
        
        string to_string(){
            string str = "{";
            str += "\"id\": " + id + ", ";
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
            str += "\"fasta\": \"" + remove_newline(fasta) + "\", ";
            str += "\"peptides\": [";
            for (int i = 0; i < peptides.size(); ++i){
                if (i) str += ", ";
                str += peptides.at(i)->to_string();
            }
            str += "]}";
            return str;
        }
};


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
        string formula;
        string exact_mass;
        vector<protein*> proteins;
        
        
        string to_string(){
            string str = "{";
            str += "\"id\": " + id + ", ";
            str += "\"name\": \"" + name + "\", ";
            str += "\"pathway_id\": " + pathway_id + ", ";
            str += "\"type\": \"" + type + "\", ";
            str += "\"pathway_ref\": " + (pathway_ref.length() ? pathway_ref : "0") + ", ";
            str += "\"x\": " + x + ", ";
            str += "\"y\": " + y + ", ";
            str += "\"c_number\": \"" + c_number + "\", ";
            str += "\"formula\": \"" + formula + "\", ";
            str += "\"exact_mass\": \"" + exact_mass + "\", ";
            str += "\"proteins\": [";
            for (int i = 0; i < proteins.size(); ++i){
                if (i) str += ", ";
                str += proteins.at(i)->to_string();
            }
            str += "]}";
            return str;
        }
};


static int sqlite_callback(void *data, int argc, char **argv, char **azColName){
    vector< map< string, string > > *spectra_data = (vector< map< string, string > >*)data;
    map< string, string > *dataset = new map< string, string >;
    for(int i = 0; i < argc; ++i){
        dataset->insert(pair< string, string>(azColName[i], argv[i] ? argv[i] : "NULL"));
    }
    spectra_data->push_back(*dataset);
    return 0;
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


main() {
    cout << "Content-Type: text/html" << endl << endl;
    
    string pathway_id = "";    
    string species = "";
    
    
    string get_string = getenv("QUERY_STRING");
    if (!get_string.length()){
        cout << -1;
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
        cout << -1 << endl;
        return -1;
    }
    
    /*
    pathway_id = 49;
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
    vector<node*> nodes;
    
    /* Connect to database */
    if (!mysql_real_connect(conn, server, user, password, database, 0, NULL, 0)) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    /* send SQL query */
    string sql_query_nodes = "select * from nodes where pathway_id = ";
    sql_query_nodes += pathway_id;
    sql_query_nodes += " and type = 'protein';";
    
    
    if (mysql_query(conn, sql_query_nodes.c_str())) {
        cout << "error: " << mysql_error(conn) << endl;
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
        nodes.push_back(last_node);
    }
    
    
    
    
    
    string sql_query_proteins = "select n.id nid, p.* from nodes n inner join nodeproteincorrelations np on n.id = np.node_id inner join proteins p on np.protein_id = p.id where n.pathway_id = ";
    sql_query_proteins += pathway_id;
    sql_query_proteins += " and n.type = 'protein' and p.species = '";
    sql_query_proteins += species;
    sql_query_proteins += "';";
    
    if (mysql_query(conn, sql_query_proteins.c_str())) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    res = mysql_use_result(conn);
    
    for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
        column_names_proteins.insert(pair<string,int>(field->name, i));
    }
    
    
    map < string, vector<protein*>* > all_proteins;
    string sql_query_peptides;
    int pi = 0;
    while ((row = mysql_fetch_row(res)) != NULL){
        int int_nid = atoi(row[column_names_proteins[string("nid")]]);
        while (atoi(nodes.at(pi)->id.c_str()) < int_nid){
            ++pi;
        }
        string pid = row[column_names_proteins[string("id")]];
        protein* last_protein = new protein();
        last_protein->id = pid;
        last_protein->name = row[column_names_proteins[string("name")]];
        last_protein->definition = row[column_names_proteins[string("definition")]];
        last_protein->mass = row[column_names_proteins[string("mass")]];
        last_protein->accession = row[column_names_proteins[string("accession")]];
        last_protein->ec_number = row[column_names_proteins[string("ec_number")]];
        last_protein->fasta = row[column_names_proteins[string("fasta")]];
        nodes.at(pi)->proteins.push_back(last_protein);
        
        if (all_proteins.find(pid) == all_proteins.end()){
            all_proteins.insert(pair<string, vector<protein*>* >(pid, new vector<protein*>()));
        }
        all_proteins[pid]->push_back(last_protein);
        if (sql_query_peptides.length()){
            sql_query_peptides += " union ";
        }
        sql_query_peptides += "select " + pid + " pid";
    }
    
    
    map<string, vector<peptide*>* > all_peptides;
    string sql_query_spectra;
    if (pi){
        sql_query_peptides = "select p.pid, pep.* from (" + sql_query_peptides + ") p inner join peptides pep on p.pid = pep.protein_id;";
        
        if (mysql_query(conn, sql_query_peptides.c_str())) {
            cout << "error: " << mysql_error(conn) << endl;
            return 1;
        }
        res = mysql_use_result(conn);
        
        for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
            column_names_peptides.insert(pair<string,int>(field->name, i));
        }
        while ((row = mysql_fetch_row(res)) != NULL){
            string pid = row[column_names_peptides[string("pid")]];
            string pep_id = row[column_names_peptides[string("id")]];
            string peptide_seq = row[column_names_peptides[string("peptide_seq")]];
            for (int i = 0; i < all_proteins[pid]->size(); ++i){
                peptide* last_peptide = new peptide();
                all_proteins[pid]->at(i)->peptides.push_back(last_peptide);
                last_peptide->id = pep_id;
                last_peptide->peptide_seq = peptide_seq;
                
                
                if (all_peptides.find(pep_id) == all_peptides.end()){
                    all_peptides.insert(pair<string, vector<peptide*>* >(pep_id, new vector<peptide*>()));
                }
                all_peptides[pep_id]->push_back(last_peptide);
            }
        }
        
        for (map < string, vector<peptide*>* >::iterator it = all_peptides.begin(); it != all_peptides.end(); ++it){
            if (sql_query_spectra.length()) {
                sql_query_spectra += " union ";
            }
            sql_query_spectra += "select " + it->first + " pep_id";
        }
    }
    
    
    vector< string > sql_query_lite;
    if (sql_query_spectra.length()){
        sql_query_spectra = "select pep.pep_id, ps.* from (" + sql_query_spectra + ") pep inner join peptide_spectra ps on pep.pep_id = ps.peptide_id;";
        
        if (mysql_query(conn, sql_query_spectra.c_str())) {
            cout << "error: " << mysql_error(conn) << endl;
            return 1;
        }
        res = mysql_use_result(conn);
        
        for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
            column_names_spectra.insert(pair<string,int>(field->name, i));
        }
        while ((row = mysql_fetch_row(res)) != NULL){
            string sql_part = "select ";
            sql_part += row[column_names_spectra[string("pep_id")]];
            sql_part += " pep_id, '";
            sql_part += all_peptides[row[column_names_spectra[string("pep_id")]]]->at(0)->peptide_seq;
            sql_part += "' seq, ";
            sql_part += row[column_names_spectra[string("charge")]];
            sql_part += " chrg";
            sql_query_lite.push_back(sql_part);
        }
    }
       
    double t = 500;
    double l = sql_query_lite.size();
        
    sqlite3 *db;
    char *zErrMsg = 0;
    int rc;

    /* Open database */
    rc = sqlite3_open((char*)parameters["sqlite_file"].c_str(), &db);
    if( rc ){
        cout << -2 << endl;
        exit(-2);
    }
    
    for (int i = 0; i < ceil(l / t); ++i){
        string sql_query_lite2 = "";
        for (int j = i * t; j < min((i + 1) * t, l); ++j){
            if (sql_query_lite2.length()){
                sql_query_lite2 += " union ";
            }
            sql_query_lite2 += sql_query_lite[j];
        }
        //sql_query_lite2 = "SELECT ps.pep_id, ps.chrg charge, rs.id sid, rs.precursorMZ FROM RefSpectra rs inner join (" + sql_query_lite2 + ") ps on rs.peptideSeq = ps.seq and rs.peptideModSeq = ps.seq and rs.precursorCharge = ps.chrg;";
        sql_query_lite2 = "SELECT ps.pep_id, ps.chrg charge, rs.id sid, rs.precursorMZ, rs.peptideModSeq FROM RefSpectra rs inner join (" + sql_query_lite2 + ") ps on rs.peptideSeq = ps.seq and rs.precursorCharge = ps.chrg;";
        

        vector< map< string, string > > spectra_data;
        
        /* Execute SQL statement */
        rc = sqlite3_exec(db, sql_query_lite2.c_str(), sqlite_callback, (void*)&spectra_data, &zErrMsg);
        if( rc != SQLITE_OK ){
            cout << -3 << endl;
            sqlite3_free(zErrMsg);
            exit(-3);
        }
        
        for(int i = 0; i < spectra_data.size(); ++i){
            vector< peptide* > *peps = all_peptides[spectra_data[i][string("pep_id")]];
            for (int j = 0; j < peps->size(); ++j){
                spectrum *s1 = new spectrum;
                s1->id = spectra_data[i][string("sid")];
                s1->charge = spectra_data[i][string("charge")];
                s1->mod_sequence = spectra_data[i][string("peptideModSeq")];
                char buffer [20];
                int n;
                string mass = spectra_data[i][string("precursorMZ")];
                if (mass.find(".") != string::npos){
                    mass = mass.substr(0, mass.find(".") + 5);
                }
                s1->mass = mass;
                
                peps->at(j)->spectra.push_back(s1);
            }
        }
    }
    
    sqlite3_close(db);
    
    
    
    string sql_query_rest = "(select n.id, p.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y, '' c_number, '' formula, '' exact_mass from nodes n inner join pathways p on p.id = n.foreign_id where n.type = 'pathway' and n.pathway_id = ";
    sql_query_rest += pathway_id; 
    sql_query_rest += ") union ";
    sql_query_rest += "(select n.id, m.name, n.pathway_id, n.type, n.pathway_ref, n.x, n.y, m.c_number, m.formula, m.exact_mass from nodes n inner join metabolites m on m.id = n.foreign_id where n.type = 'metabolite' and n.pathway_id = ";
    sql_query_rest += pathway_id;
    sql_query_rest += ");";
    
    if (mysql_query(conn, sql_query_rest.c_str())) {
        cout << "error: " << mysql_error(conn) << endl;
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
        last_node->formula = row[column_names_rest[string("formula")]];
        last_node->exact_mass = row[column_names_rest[string("exact_mass")]];
        nodes.push_back(last_node);
    }
    
    /*
    for (int i = 0; i < nodes.size(); ++i){
        for (int j = 0; j < nodes.at(i)->proteins.size(); ++j){
            for (int k = 0; k < nodes.at(i)->proteins.at(j)->peptides.size(); ++k){
                for (int l = 0; l < nodes.at(i)->proteins.at(j)->peptides.at(k)->spectra.size(); ++l){
                    cout << i << " " << j << " " << k << " " << nodes.at(i)->proteins.at(j)->peptides.at(k)->spectra.at(l)->charge << "<br>" << endl;
                }
            }
        }
    }
    */

    string response = "[";
    for (int i = 0; i < nodes.size(); ++i){
        if (i) response += ", ";
        response += nodes.at(i)->to_string();
    }
    response += "]";
    cout << response;
    
    
    mysql_free_result(res);
    mysql_close(conn);
}
