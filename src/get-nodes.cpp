/* Simple C program that connects to MySQL Database server*/
#include <mysql.h>
#include <stdio.h>
#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <sstream>

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


class spectrum {
    public:
        string id;
        string charge;
        string mass;
        
        string to_string(){
            string str = "{";
            str += "\"id\": " + id + ", ";
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
        vector<spectrum> spectra;
        
        string to_string(){
            string str = "{";
            str += "\"id\": " + id + ", ";
            str += "\"peptide_seq\": \"" + peptide_seq + "\", ";
            str += "\"spectra\": [";
            for (int i = 0; i < spectra.size(); ++i){
                if (i) str += ", ";
                str += spectra.at(i).to_string();
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
        vector<peptide> peptides;
        
        string to_string(){
            string str = "{";
            str += "\"id\": " + id + ", ";
            str += "\"name\": \"" + name + "\", ";
            str += "\"definition\": \"" + definition + "\", ";
            str += "\"mass\": \"" + mass + "\", ";
            str += "\"accession\": \"" + accession + "\", ";
            str += "\"ec_number\": \"" + ec_number + "\", ";
            str += "\"fasta\": \"" + fasta + "\", ";
            str += "\"peptides\": [";
            for (int i = 0; i < peptides.size(); ++i){
                if (i) str += ", ";
                str += peptides.at(i).to_string();
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
        vector<protein> proteins;
        
        
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
                str += proteins.at(i).to_string();
            }
            str += "]}";
            return str;
        }
};


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
    
    
    MYSQL *conn = mysql_init(NULL);
    MYSQL_RES *res;
    MYSQL_RES *res_reagents;
    MYSQL_ROW row;
    MYSQL_FIELD *field;
    char *server = (char*)"localhost";
    char *user = (char*)"qsdb_user";
    char *password = (char*)"qsdb_password"; /* set me first */
    char *database = (char*)"qsdb";
    map< string, int > column_names_nodes;
    map< string, int > column_names_proteins;
    map< string, int > column_names_peptides;
    map< string, int > column_names_rest;
    vector<node> nodes;
    
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
        nodes.push_back(*last_node);
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
    
    
    map < string, vector<protein*> > all_proteins;
    string sql_query_peptides;
    int pi = 0;
    while ((row = mysql_fetch_row(res)) != NULL){
        int int_nid = atoi(row[column_names_proteins[string("nid")]]);
        while (atoi(nodes.at(pi).id.c_str()) < int_nid){
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
        nodes.at(pi).proteins.push_back(*last_protein);
        
        if (all_proteins.find(pid) == all_proteins.end()){
            all_proteins.insert(pair<string, vector<protein*> >(pid, vector<protein*>()));
        }
        all_proteins[pid].push_back(last_protein);
        if (sql_query_peptides.length()){
            sql_query_peptides += " union ";
        }
        sql_query_peptides += "select " + pid + " pid";
    }
    
    
    map<string, vector<peptide*> > all_peptides;
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
            cout << pid << endl;
            for (int i = 0; i < all_proteins[pid].size(); ++i){
                peptide* last_peptide = new peptide();
                all_proteins[pid][i]->peptides.push_back(*last_peptide);
                last_peptide->id = pep_id;
                last_peptide->peptide_seq = peptide_seq;
                
                
                if (all_peptides.find(pep_id) == all_peptides.end()){
                    all_peptides.insert(pair<string, vector<peptide*> >(pep_id, vector<peptide*>()));
                }
                all_peptides[pep_id].push_back(last_peptide);
            }
        }
        
        for (map < string, vector<peptide*> >::iterator it = all_peptides.begin(); it != all_peptides.end(); ++it){
            if (sql_query_spectra.length()) {
                sql_query_spectra += " union ";
            }
            sql_query_spectra += "select " + it->first + " pep_id";
        }
    }
    
    
    
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
        last_node->name = row[column_names_rest[string("name")]];
        last_node->type = row[column_names_rest[string("type")]];
        last_node->pathway_ref = row[column_names_rest[string("pathway_ref")]]; 
        last_node->x = row[column_names_rest[string("x")]];
        last_node->y = row[column_names_rest[string("y")]];
        last_node->c_number = row[column_names_rest[string("c_number")]];
        last_node->formula = row[column_names_rest[string("formula")]];
        last_node->exact_mass = row[column_names_rest[string("exact_mass")]];
        nodes.push_back(*last_node);
    }
    
    

    string response = "[";
    for (int i = 0; i < nodes.size(); ++i){
        if (i) response += ", ";
        response += nodes.at(i).to_string();
    }
    response += "]";
    cout << response;
    
    
    mysql_free_result(res);
    mysql_close(conn);
}
