#include <mysql.h>
#include <stdio.h>
#include "bio-classes.h"
#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include <sstream>
#include <math.h>

#include "mysql_connection.h"
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

void print_out(string response, bool compress){
    replaceAll(response, "\n", "\\n");
    if (compress){
        cout << compress_string(response);        
    }
    else {
        cout << response;
    }
}

struct search_data {
    string pattern;
    string node_id;
    string pathway_id;
};


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
    
    
    // Create a connection and connect to database
    sql::ResultSet *res;
    sql::Driver *driver = get_driver_instance();
    sql::Connection *con = driver->connect(parameters["mysql_host"], parameters["mysql_user"], parameters["mysql_passwd"]);
    con->setSchema(parameters["mysql_db"]);
    sql::Statement *stmt = con->createStatement();
    
    
    vector< search_data > search_vector;
    
    // requesting metabolite data
    string sql_query_metabolites = "SELECT m.name, n.id, n.pathway_id from metabolites m inner join nodes n on m.id = n.foreign_id where n.type = 'metabolite';";
    res = stmt->executeQuery(sql_query_metabolites);
       
    while (res->next()){
        search_data sd;
        sd.pattern = res->getString("name");
        sd.node_id = res->getString("id");
        sd.pathway_id = res->getString("pathway_id");
        search_vector.push_back(sd);
    }
    
    
    // requesting pathway data
    string sql_query_pathway = "SELECT pw.name, n.id, n.pathway_id from pathways pw inner join nodes n on pw.id = n.foreign_id where n.type = 'pathway';";
    res = stmt->executeQuery(sql_query_pathway);
    
    while (res->next()){
        search_data sd;
        sd.pattern = res->getString("name");
        sd.node_id = res->getString("id");
        sd.pathway_id = res->getString("pathway_id");
        search_vector.push_back(sd);
    }
    
    
    // requesting protein data
    string sql_query_proteins = "SELECT p.name, p.definition, p.accession, n.id, n.pathway_id from proteins p inner join nodeproteincorrelations npc on p.id = npc.protein_id inner join nodes n on npc.node_id = n.id where n.type = 'protein';";
    res = stmt->executeQuery(sql_query_proteins);
       
    
    while (res->next()){
        search_data sd;
        sd.pattern = res->getString("name");
        sd.node_id = res->getString("id");
        sd.pathway_id = res->getString("pathway_id");
        search_vector.push_back(sd);
        
        search_data sd2;
        sd2.pattern = res->getString("definition");
        sd2.node_id = res->getString("id");
        sd2.pathway_id = res->getString("pathway_id");
        search_vector.push_back(sd2);
        
        search_data sd3;
        sd3.pattern = res->getString("accession");
        sd3.node_id = res->getString("id");
        sd3.pathway_id = res->getString("pathway_id");
        search_vector.push_back(sd3);
    }
    
    
    
    
    response += "["; 
    for (auto &entry: search_vector){
        if (response.length() > 1) response += ",";
        response += "[\"" + entry.pattern + "\"," + entry.node_id + "," + entry.pathway_id + "]";
    }
    response += "]";
    
    print_out(response, compress);
    
    
    delete res;
    delete stmt;
    delete con;
}