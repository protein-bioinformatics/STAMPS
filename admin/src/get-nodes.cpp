#include <mysql.h>
#include <stdio.h>
#include <cstring>
#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include <sstream>
#include <math.h>
#include "bio-classes.h"

using namespace std;




class node {
    public:
        string id;
        string name;
        string pathway_id;
        string type;
        string foreign_id;
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
            str += "\"t\":\"" + type + "\",";
            str += "\"r\":" + (foreign_id.length() ? foreign_id : "0") + ",";
            str += "\"x\":" + x + ",";
            str += "\"y\":" + y + ",";
            str += "\"c\":\"" + c_number + "\",";
            str += "\"s\":\"" + smiles + "\",";
            str += "\"f\":\"" + formula + "\",";
            str += "\"e\":\"" + exact_mass + "\",";
            str += "\"p\":[";
            for (uint i = 0; i < proteins.size(); ++i){
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




void print_out(string response, bool compress){
    replaceAll(response, "\n", "\\n");
    if (compress){
        cout << compress_string(response);        
    }
    else {
        cout << response;
    }
}


int main(int argc, char** argv) {
    bool compress = false;
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
    for (uint i = 0; i < get_entries.size(); ++i){
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
    proteins = new vector< protein* >();
    all_proteins = new map < int, protein* >();
    
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
    
    
    string sql_query_proteins = "select n.id nid, p.* from nodes n inner join nodeproteincorrelations np on n.id = np.node_id inner join proteins p on np.protein_id = p.id where n.pathway_id = ";
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
            last_protein->kegg = row[column_names_proteins[string("kegg_link")]];
            last_protein->validation = row[column_names_proteins[string("validation")]];
            last_protein->fasta = cleanFasta(row[column_names_proteins[string("fasta")]]);
            last_protein->mass = compute_mass(last_protein->fasta);
            last_protein->pI = predict_isoelectric_point(last_protein->fasta);
            all_proteins->insert(pair<int, protein* >(pid, last_protein));
            proteins->push_back(last_protein);
        }
        else {
            last_protein = all_proteins->at(pid);
        }
        node_dict[node_id]->proteins.push_back(last_protein);
    }
    
    
    
    string sql_query_rest = "(select n.id, p.name, n.pathway_id, n.type, n.foreign_id, n.x, n.y, '' c_number, '' smiles, '' formula, '' exact_mass from nodes n inner join pathways p on p.id = n.foreign_id where n.type = 'pathway' and n.pathway_id = ";
    sql_query_rest += pathway_id; 
    sql_query_rest += ") union ";
    sql_query_rest += "(select n.id, m.name, n.pathway_id, n.type, n.foreign_id, n.x, n.y, m.c_number, m.smiles, m.formula, m.exact_mass from nodes n inner join metabolites m on m.id = n.foreign_id where n.type = 'metabolite' and n.pathway_id = ";
    sql_query_rest += pathway_id;
    sql_query_rest += ") union ";
    sql_query_rest += "(select id, '', pathway_id, type, 0, x, y, 0, '', '', '' from nodes n where n.type = 'membrane' and n.pathway_id = ";
    sql_query_rest += pathway_id;
    sql_query_rest += ") union ";
    sql_query_rest += "(select n.id, l.label, n.pathway_id, n.type, n.foreign_id, n.x, n.y, 0, '', '', '' from nodes n inner join labels l on n.foreign_id = l.id where n.type = 'label' and n.pathway_id = ";
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
        last_node->foreign_id = row[column_names_rest[string("foreign_id")]]; 
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
    for (map<int, node*>::iterator node_it = node_dict.begin(); node_it != node_dict.end(); ++node_it){
        if (node_it != node_dict.begin()) response += ",";
        response += (node_it->second)->to_string();
    }
    response += "]";
    print_out(response, compress);
    
    
    delete proteins;
    delete all_proteins;
    
    mysql_free_result(res);
    mysql_close(conn);
    
    return 0;
}
