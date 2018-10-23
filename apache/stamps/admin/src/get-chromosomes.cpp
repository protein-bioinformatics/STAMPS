#include <stdio.h>
#include <stdlib.h>
#include <cstring>
#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include <sstream>
#include <math.h>
#include "bio-classes.h"

#include "mysql_connection.h"
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

using namespace std;




void print_out(string response, bool compress){
    if (compress){
        cout << compress_string(response);        
    }
    else {
        cout << response;
    }
}



class chromosome_band {
    public:
        string chromosome;
        string arm;
        string name;
        string start;
        string end;
        string positive;
        string color;
        string species;
        
        string to_string(){
            string data = "[";
            
            data += "\"" + arm + "\"";
            data += ",\"" + name + "\"";
            data += "," + start;
            data += "," + end;
            data += "," + positive;
            data += "," + color;
            data += ",\"" + species + "\"]";
            
            return data;
        }
};



int main(int argc, char** argv) {
    bool compress = true;
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
    
    
    
    
    string species = (form.find("species") != form.end()) ? form["species"] : "";
    if (!species.length()){
        response += "-3";
        print_out(response, compress);
        return -3;
    }
    
    

    stmt = con->createStatement();
    res = stmt->executeQuery("SELECT * FROM chromosome_bands WHERE species = '" + species + "' ORDER BY chromosome;");
    
    
    map<string, vector<chromosome_band*>* > chromosomes;
    
    while (res->next()) {
        string chromosome = res->getString("chromosome");
        if (chromosomes.find(chromosome) == chromosomes.end()) chromosomes.insert(pair< string, vector<chromosome_band*>* >(chromosome, new vector<chromosome_band*>()));
        
        chromosome_band* cb = new chromosome_band();
        cb->chromosome;
        cb->arm = res->getString("arm");
        cb->name = res->getString("name");
        cb->start = res->getString("start");
        cb->end = res->getString("end");
        cb->positive = res->getString("positive");
        cb->color = res->getString("color");
        cb->species = res->getString("species");
        chromosomes[chromosome]->push_back(cb);
    }
    
    string data = "{";
    for (auto entry : chromosomes){
        if (data.length() > 1) data += ",";
        data += "\"" + entry.first + "\":[";
        for (int i = 0; i < entry.second->size(); ++i){
            if (i) data += ",";
            data += entry.second->at(i)->to_string();
        }
        data += "]";
    }
    data += "}";
    
    
    response += data;
    print_out(response, compress);
    
    delete res;
    delete stmt;
    delete con;
    
    return 0;
}
