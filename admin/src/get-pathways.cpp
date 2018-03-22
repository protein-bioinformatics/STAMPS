/* Simple C program that connects to MySQL Database server*/
#include <mysql.h>
#include <stdio.h>
#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <sstream>
#include <fstream>
#include "bio-classes.h"

using namespace std;



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
    
    
    
    // load get values
    char* get_string_chr = getenv("QUERY_STRING");
    bool print_all = false;
    
    if (get_string_chr){
        string get_string = get_string_chr;
    
    
        vector<string> get_entries = split(get_string, '&');
        map< string, string > form;
        for (uint i = 0; i < get_entries.size(); ++i){
            vector<string> get_value = split(get_entries.at(i), '=');
            string value = (get_value.size() > 1) ? get_value.at(1) : "";
            form.insert(pair< string, string >(get_value.at(0), value));
        }
        if (form.find("all") != form.end()) print_all = true;
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
    string sql_query = (!print_all) ? "SELECT distinct p.* FROM pathways p inner join nodes n on p.id = n.pathway_id;" : "SELECT * FROM pathways;";
    if (mysql_query(conn, sql_query.c_str())) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    res = mysql_use_result(conn);
        
    for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
        column_names.insert(pair<string,int>(field->name, i));
    }
    
    cout << "{";
    int index = 0;
    while ((row = mysql_fetch_row(res)) != NULL){
        if (index++) cout << ",";
        cout << "\"" << row[column_names[string("id")]] << "\":";
        string pw_name = row[column_names[string("name")]];
        replaceAll(pw_name, "\n", "\\n");
        cout << "\"" << pw_name << "\"";
    }
    cout << "}" << endl;
    
    mysql_free_result(res);
    mysql_close(conn);
}
