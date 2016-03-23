/* Simple C program that connects to MySQL Database server*/
#include <mysql.h>
#include <stdio.h>
#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <sstream>
#include <fstream>

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

main() {
    cout << "Content-Type: text/html" << endl << endl;
    
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
    
    /* Connect to database */
    if (!mysql_real_connect(conn, server, user, password, database, 0, NULL, 0)) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    /* send SQL query */
    string sql_query = "SELECT distinct p.* FROM pathways p inner join nodes n on p.id = n.pathway_id ORDER BY p.name;";
    if (mysql_query(conn, sql_query.c_str())) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    res = mysql_use_result(conn);
        
    for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
        column_names.insert(pair<string,int>(field->name, i));
    }
    
    cout << "[";
    int index = 0;
    while ((row = mysql_fetch_row(res)) != NULL){
        if (index++) cout << ", ";
        cout << "[" << row[column_names[string("id")]] << ", ";
        cout << "\"" << row[column_names[string("name")]] << "\", ";
        cout << "\"" << row[column_names[string("validation")]] << "\"]";
    }
    cout << "]" << endl;
    
    mysql_free_result(res);
    mysql_close(conn);
}
