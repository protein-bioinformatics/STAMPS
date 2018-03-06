/* Simple C program that connects to MySQL Database server*/
#include <mysql.h>
#include <stdio.h>
#include <iostream>
#include <fstream>
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

main() {
    cout << "Content-Type: text/html" << endl << endl;
    
    
    vector<string> get_entries = split(getenv("QUERY_STRING"), ';');    
    string pathway_id = "";
    for (int i = 0; i < get_entries.size(); ++i){
        vector<string> get_values = split(get_entries.at(i), '=');
        if (get_values.size() && get_values.at(0) == "pathway"){
            pathway_id = get_values.at(1);
        }
    }
    if (pathway_id == "" || !is_integer_number(pathway_id)){
        cout << -1 << endl;
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
    MYSQL_RES *res_reagents;
    MYSQL_ROW row;
    MYSQL_FIELD *field;
    char *server = (char*)parameters["mysql_host"].c_str();
    char *user = (char*)parameters["mysql_user"].c_str();
    char *password = (char*)parameters["mysql_passwd"].c_str();
    char *database = (char*)parameters["mysql_db"].c_str();
    map< string, int > column_names;
    map< string, int > column_names_reagents;
    
    /* Connect to database */
    if (!mysql_real_connect(conn, server, user, password, database, 0, NULL, 0)) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    /* send SQL query */
    string sql_query = "SELECT r.*, rg.id rg_id, rg.reaction_id, rg.node_id rg_node_id, rg.type, rg.anchor FROM reactions r INNER JOIN nodes n ON r.node_id = n.id inner join reagents rg on r.id = rg.reaction_id WHERE n.pathway_id = ";
    sql_query += pathway_id;
    sql_query += ";";
    if (mysql_query(conn, sql_query.c_str())) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    res = mysql_use_result(conn);
        
    for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
        column_names.insert(pair<string,int>(field->name, i));
    }
    
    cout << "{";
    int last_id = -1;
    int index = 0;
    int index_r = 0;
    while ((row = mysql_fetch_row(res)) != NULL){
        
        int id = atoi(row[column_names[string("id")]]);
        if (last_id != id){
            index_r = 0;
            if (last_id != -1){
                cout << "]},";
            }
            cout << "\"" << row[column_names[string("id")]] << "\": {\"i\":" << row[column_names[string("id")]] << ",";
            cout << "\"n\":" << row[column_names[string("node_id")]] << ",";
            cout << "\"in\":\"" << row[column_names[string("anchor_in")]] << "\",";
            cout << "\"out\":\"" << row[column_names[string("anchor_out")]] << "\",";
            cout << "\"v\":" << row[column_names[string("reversible")]] << ",";
            cout << "\"r\":[";
            
            last_id = id;
        }
        
        if (index_r) cout << ", ";
        cout << "{\"i\":" << row[column_names[string("rg_id")]] << ",";
        cout << "\"r\":" << row[column_names[string("reaction_id")]] << ",";
        cout << "\"n\":" << row[column_names[string("rg_node_id")]] << ",";
        cout << "\"t\":\"" << row[column_names[string("type")]] << "\",";
        cout << "\"a\":\"" << row[column_names[string("anchor")]] << "\"}";
        
        ++index_r;
        ++index;
    }
    if (index_r) cout << "]";
    if (index) cout << "}";
    cout << "}" << endl;
    
    mysql_free_result(res);
    mysql_close(conn);
}
