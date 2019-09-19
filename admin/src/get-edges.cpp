#include <mysql.h>
#include <stdio.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include <string>
#include <sstream>
#include "bio-classes.h"

#include "mysql_connection.h"
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

#include <libsoup/soup.h>


using namespace std;


void print_out(string response, bool compress){
    if (compress){
        cout << compress_string(response);        
    }
    else {
        cout << response;
    }
}

class reagent {
    public:
        string id;
        string reaction_id;
        string node_id;
        string type;
        string anchor;
        string head;
        
        string to_string(){
            string data = "{\"i\":" + id;
            data += ",\"r\":" + reaction_id;
            data += ",\"n\":" + node_id;
            data += ",\"t\":\"" + type + "\"";
            data += ",\"h\":" + head;
            data += ",\"a\":\"" + anchor + "\"}";
            return data;
        }
};

class direct {
    public:
        string id;
        string node_id_start;
        string node_id_end;
        string anchor_start;
        string anchor_end;
        string head;
        
        string to_string(){
            string data = "{\"i\":" + id;
            data += ",\"ns\":" + node_id_start;
            data += ",\"ne\":" + node_id_end;
            data += ",\"as\":\"" + anchor_start + "\"";
            data += ",\"ae\":\"" + anchor_end + "\"";
            data += ",\"h\":" + head + "}";
            return data;
        }
};

class reaction {
    public:
        string id;
        string node_id;
        string anchor_in;
        string anchor_out;
        vector<reagent*> reagents;
        
        string to_string(){
            
            string data = "{\"i\":" + id;
            data += ",\"n\":" + node_id;
            data += ",\"in\":\"" + anchor_in + "\"";
            data += ",\"out\":\"" + anchor_out + "\"";
            data += ",\"r\":{";
            for (int i = 0; i < reagents.size(); ++i){
                if (i) data += ",";
                data += "\"" + reagents[i]->id + "\":" + reagents[i]->to_string();
            }
            
            data += "}}";
            return data;
        }
};



main() {
    bool compress = false;
    string response = "";
    
    
    if (compress){
        cout << "Content-Type: text/html" << endl;
        cout << "Content-Encoding: deflate" << endl << endl;
        
    }
    else {
        cout << "Content-Type: text/html" << endl << endl;
    }
    
    
    
    // load get values
    char* get_string_chr = getenv("QUERY_STRING");
    
    if (!get_string_chr){
        response += "-1";
        print_out(response, compress);
        return -1;
    }
    string get_string = get_string_chr;
    
    if (!get_string.length()){
        response += "-2";
        print_out(response, compress);
        return -2;
    }
    
    
    vector<string> get_entries = split(get_string, '&');
    map< string, string > form;
    for (uint i = 0; i < get_entries.size(); ++i){
        vector<string> get_value = split(get_entries.at(i), '=');
        string value = (get_value.size() > 1) ? get_value.at(1) : "";
        form.insert(pair< string, string >(get_value.at(0), value));
    }
    
    // load parameters from config file
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
    sql::Driver *driver;
    sql::Connection *con;
    sql::Statement *stmt;
    sql::ResultSet *res;
    driver = get_driver_instance();
    con = driver->connect(parameters["mysql_host"], parameters["mysql_user"], parameters["mysql_passwd"]);
    con->setSchema(parameters["mysql_db"]);
    
    
    string pathway_id = (form.find("pathway") != form.end()) ? form["pathway"] : "";
    string host = (form.find("host") != form.end()) ? form["host"] : "";
    
    if (!pathway_id.length() || !is_integer_number(pathway_id)){
        response += "-3";
        print_out(response, compress);
        return -3;
    }
    
    
    
    
    
    // if it is a remote request
    if (host.length() > 1){
        string get_vars = "";
        for (uint i = 0; i < get_entries.size(); ++i){
            vector<string> get_values = split(get_entries.at(i), '=');
            if (get_vars.length() > 0) get_vars += "&";
            if (get_values.size() && get_values.at(0) == "host"){
                get_vars += get_entries.at(i);
            }
        }
        string remote_request = host + "/scripts/get-edges.bin?" + get_vars;
        
        SoupSession *session = soup_session_sync_new();
        SoupMessage *msg = soup_message_new ("GET", remote_request.c_str());
        soup_session_send_message (session, msg);
        fwrite (msg->response_body->data, 1, msg->response_body->length, stdout);
        return 0;
    }
    
    
    
    
    
    
    
    string sql_query = "SELECT r.* FROM reactions r INNER JOIN nodes n ON r.node_id = n.id WHERE n.pathway_id = ";
    sql_query += pathway_id;
    sql_query += " ORDER BY r.id;";
    
    stmt = con->createStatement();
    res = stmt->executeQuery(sql_query);
        
    
    map<string, reaction* > all_reactions;
    while (res->next()) {
        reaction* r = new reaction();
        r->id = res->getString("id");
        r->node_id = res->getString("node_id");
        r->anchor_in = res->getString("anchor_in");
        r->anchor_out = res->getString("anchor_out");
        all_reactions.insert(pair< string, reaction* >(r->id, r));
    }
    
    
    
    
    sql_query = "SELECT r.id, rg.id rg_id, rg.reaction_id, rg.node_id rg_node_id, rg.type, rg.anchor, rg.head FROM reactions r INNER JOIN nodes n ON r.node_id = n.id INNER JOIN reagents rg on r.id = rg.reaction_id WHERE n.pathway_id = ";
    sql_query += pathway_id;
    sql_query += " ORDER BY r.id;";
    
    
    res = stmt->executeQuery(sql_query);
    while (res->next()) {
        reagent* r = new reagent();
        r->id = res->getString("rg_id");
        r->reaction_id = res->getString("reaction_id");
        r->node_id = res->getString("rg_node_id");
        r->type = res->getString("type");
        r->anchor = res->getString("anchor");
        r->head = res->getString("head");
        all_reactions[res->getString("id")]->reagents.push_back(r);
    }
    
    
    
    
    sql_query = "SELECT r.* FROM reactions_direct r INNER JOIN nodes n ON r.node_id_start = n.id INNER JOIN nodes nn ON r.node_id_end = nn.id WHERE n.pathway_id = ";
    sql_query += pathway_id;
    sql_query += " AND nn.pathway_id = ";
    sql_query += pathway_id;
    sql_query += " ORDER BY r.id;";
    
    stmt = con->createStatement();
    res = stmt->executeQuery(sql_query);
        
    
    map<string, direct* > all_directs;
    while (res->next()) {
        direct* r = new direct();
        r->id = res->getString("id");
        r->node_id_start = res->getString("node_id_start");
        r->node_id_end = res->getString("node_id_end");
        r->anchor_start = res->getString("anchor_start");
        r->anchor_end = res->getString("anchor_end");
        r->head = res->getString("head");
        all_directs.insert(pair< string, direct* >(r->id, r));
    }
    
    
    
    
    string data = "{\"reactions\":{";
    int i = 0; 
    for (auto entry : all_reactions){
        if (i++) data += ",";
        data += "\"" + entry.first + "\":" + entry.second->to_string();
    }
    data += "}, \"direct\":{";
    i = 0; 
    for (auto entry : all_directs){
        if (i++) data += ",";
        data += "\"" + entry.first + "\":" + entry.second->to_string();
    }
    data += "}}";
    
    
    response += data;    
    print_out(response, compress);
    
    delete res;
    delete stmt;
    delete con;
    
    return 0;
}
