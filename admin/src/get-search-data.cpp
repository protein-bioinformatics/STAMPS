#include <mysql.h>
#include <stdio.h>
#include "bio-classes.h"
#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include <sstream>
#include <math.h>

void print_out(string response, bool compress){
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
        response += "error: " + string(mysql_error(conn)) + "\n";
        print_out(response, compress);
        return 1;
    }
    vector< search_data > search_vector;
    
    // requesting metabolite data
    string sql_query_metabolites = "SELECT m.name, n.id, n.pathway_id from metabolites m inner join nodes n on m.id = n.foreign_id where n.type = 'metabolite';";
    if (mysql_query(conn, sql_query_metabolites.c_str())) {
        response += "error: " + string(mysql_error(conn)) + "\n";
        print_out(response, compress);
        return 1;
    }
    res = mysql_use_result(conn);
       
    while ((row = mysql_fetch_row(res)) != NULL){
        search_data sd;
        sd.pattern = row[0];
        sd.node_id = row[1];
        sd.pathway_id = row[2];
        search_vector.push_back(sd);
    }
    
    
    // requesting pathway data
    string sql_query_pathway = "SELECT pw.name, n.id, n.pathway_id from pathways pw inner join nodes n on pw.id = n.foreign_id where n.type = 'pathway';";
    if (mysql_query(conn, sql_query_pathway.c_str())) {
        response += "error: " + string(mysql_error(conn)) + "\n";
        print_out(response, compress);
        return 1;
    }
    res = mysql_use_result(conn);
    while ((row = mysql_fetch_row(res)) != NULL){
        search_data sd;
        sd.pattern = row[0];
        sd.node_id = row[1];
        sd.pathway_id = row[2];
        search_vector.push_back(sd);
    }
    
    
    // requesting protein data
    string sql_query_proteins = "SELECT p.name, p.definition, p.accession, n.id, n.pathway_id from proteins p inner join nodeproteincorrelations npc on p.id = npc.protein_id inner join nodes n on npc.node_id = n.id where n.type = 'protein';";
    if (mysql_query(conn, sql_query_proteins.c_str())) {
        response += "error: " + string(mysql_error(conn)) + "\n";
        print_out(response, compress);
        return 1;
    }
    res = mysql_use_result(conn);
       
    
    while ((row = mysql_fetch_row(res)) != NULL){
        search_data sd;
        sd.pattern = row[0];
        sd.node_id = row[3];
        sd.pathway_id = row[4];
        search_vector.push_back(sd);
        
        search_data sd2;
        sd2.pattern = row[1];
        sd2.node_id = row[3];
        sd2.pathway_id = row[4];
        search_vector.push_back(sd2);
        
        search_data sd3;
        sd3.pattern = row[2];
        sd3.node_id = row[3];
        sd3.pathway_id = row[4];
        search_vector.push_back(sd3);
    }
    
    
    
    
    response += "["; 
    for (auto &entry: search_vector){
        if (response.length() > 1) response += ",";
        response += "[\"" + entry.pattern + "\"," + entry.node_id + "," + entry.pathway_id + "]";
    }
    response += "]";
    
    //cout << response << endl;
    print_out(response, compress);
}