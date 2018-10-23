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

#include "mysql_connection.h"
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

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
    
    
    
    
    // Create a connection and connect to database
    sql::ResultSet *res;
    sql::Driver *driver = get_driver_instance();
    sql::Connection *con = driver->connect(parameters["mysql_host"], parameters["mysql_user"], parameters["mysql_passwd"]);
    con->setSchema(parameters["mysql_db"]);
    sql::Statement *stmt = con->createStatement();
    
    
    /* send SQL query */
    string sql_query = (!print_all) ? "SELECT distinct p.* FROM pathways p inner join nodes n on p.id = n.pathway_id;" : "SELECT * FROM pathways;";
    res = stmt->executeQuery(sql_query);
    
    string data = "{";
    while (res->next()){
        if (data.length() > 1) data += ",";
        data += "\"" + res->getString("id") + "\":";
        string pw_name = res->getString("name");
        string signaling_pw = res->getString("signaling_pathway");
        replaceAll(pw_name, "\n", "\\n");
        data += "[\"" + pw_name + "\"," + signaling_pw + "]";
    }
    data += "}";
    
    cout << data;
    
    delete res;
    delete stmt;
    delete con;
}
