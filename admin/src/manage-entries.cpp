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



string urlDecode(string &SRC) {
    string ret;
    char ch;
    int i, ii;
    for (i=0; i<SRC.length(); i++) {
        if (int(SRC[i])==37) {
            sscanf(SRC.substr(i+1,2).c_str(), "%x", &ii);
            ch=static_cast<char>(ii);
            ret+=ch;
            i=i+2;
        } else {
            ret+=SRC[i];
        }
    }
    return (ret);
}



void print_out(string response, bool compress){
    if (compress){
        cout << compress_string(response);        
    }
    else {
        cout << response;
    }
}


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
        string value = (get_value.size() > 1) ? urlDecode(get_value.at(1)) : "";
        form.insert(pair< string, string >(get_value.at(0), value));
    }
    
    
    
    
    // load parameters from config file
    string line;
    map< string, string > parameters;
    ifstream myfile ("../qsdb.conf");
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
    
    
    
    string action = (form.find("action") != form.end()) ? form["action"] : "";
    if (!action.length()){
        response += "-4";
        print_out(response, compress);
        return -4;
    }
    
    if (action.compare("get") != 0 && action.compare("set") != 0 && action.compare("insert") != 0){
        response += "-5";
        print_out(response, compress);
        return -5;
    }
        
    if (!action.compare("set")){
        string set_table = (form.find("table") != form.end()) ? form["table"] : "";
        string set_id = (form.find("id") != form.end()) ? form["id"] : "";
        string set_col = (form.find("column") != form.end()) ? form["column"] : "";
        string set_value = (form.find("value") != form.end()) ? form["value"] : "";
        
        if (!is_integer_number(set_id) || !set_table.length() || !set_id.length() || !set_col.length()){
            response += "-6";
            print_out(response, compress);
            return -6;
        }
        
        replaceAll(set_table, "\"", "");
        replaceAll(set_table, "'", "");
        replaceAll(set_col, "\"", "");
        replaceAll(set_col, "'", "");
        replaceAll(set_value, "\"", "");
        replaceAll(set_value, "'", "");
        
        
        if (!set_table.compare("nodeproteincorrelations")){
            string sql_query = "DELETE FROM " + set_table + " WHERE node_id = " + set_id + ";";
            stmt->executeQuery(sql_query);
            
            for(string protein_id : split(set_value, ':')){
                sql_query = "INSERT INTO " + set_table + "(node_id, protein_id) VALUES(" + set_id + ", " + protein_id + ");";
                stmt->executeQuery(sql_query);
            }
        }
        
        else {
            if (!set_table.compare("metabolites") && !set_col.compare("smiles")){
                string filepath = parameters["root_path"] + "/admin/cgi-bin";
                string command = "java -cp " + filepath + "/cdk-2.0.jar:" + filepath + " DrawChem '" + filepath + "' '" + set_id + "' '" + set_value + "'";
                int result = system(command.c_str());
            } 
            
            string sql_query = "UPDATE " + set_table + " SET " + set_col + " = '" + set_value + "' WHERE id = " + set_id + ";";
            stmt->executeQuery(sql_query);
        
            response += "0";
            print_out(response, compress);
        }
    }
    
    
    
    else if (!action.compare("get")){
        
        string action_type = (form.find("type") != form.end()) ? form["type"] : "";
        if (!action_type.length()){
            response += "-9";
            print_out(response, compress);
            return -9;
        }
        
        if (!action_type.compare("pathways") || !action_type.compare("proteins") || !action_type.compare("metabolites")){
            string order_col = (form.find("column") != form.end()) ? form["column"] : "";
            string limit = (form.find("limit") != form.end()) ? form["limit"] : "";
            string filters = (form.find("filters") != form.end()) ? form["filters"] : "";
            string checked = (form.find("checked") != form.end()) ? form["checked"] : "";
            
            
            string sql_query = "SELECT * FROM " + action_type;
            
            if (checked.length()){
                replaceAll(checked, "\"", "");
                replaceAll(checked, "'", "");
                sql_query += " INNER JOIN nodeproteincorrelations ON id = protein_id WHERE node_id = " + checked;
            }
            
            if (filters.length()){
                replaceAll(filters, "\"", "");
                replaceAll(filters, "'", "");
                vector<string> tokens = split(filters, ',');
                        
                for (int i = 0; i < tokens.size(); ++i){
                    string token = tokens[i];
                    sql_query += (i == 0 && checked.length() == 0) ? " WHERE" : " AND";
                    vector<string> tt = split(token, ':');
                    sql_query += " LOWER(" + tt[0] + ") LIKE '%" + ((tt.size() > 1) ? tt[1] : "") + "%'";
                }
            }
                
            if (order_col.length()){
                replaceAll(order_col, "\"", "");
                replaceAll(order_col, "'", "");
                vector<string> tokens = split(order_col, ':');
                sql_query += " ORDER BY " + tokens[0];
                if (tokens.size() > 1) sql_query += " " + tokens[1];
            }
                
            if  (limit.length()){
                replaceAll(limit, "\"", "");
                replaceAll(limit, "'", "");
                replaceAll(limit, ":", ",");
                sql_query += " LIMIT " + limit;
            }
                
                
            
            res = stmt->executeQuery(sql_query);
            sql::ResultSetMetaData *res_meta;
            res_meta = res->getMetaData();
            int num_cols = res_meta->getColumnCount();
            
            string data = "{";
            while (res->next()){
                if (data.length() > 1) data += ",";
                data += "\"" + res->getString(1) + "\":[" + res->getString(1);
                for (int i = 2; i <= num_cols; ++i){
                    string content = res->getString(i);
                    replaceAll(content, "\n", "\\n");
                    data += ",\"" + content + "\"";
                }
                data += "]";
            }
            data += "}";
            response += data;
            print_out(response, compress);
        }
            
        else if (!action_type.compare("proteins_num") || !action_type.compare("metabolites_num") || !action_type.compare("pathways_num")){
            replaceAll(action_type, "_num", "");
            string sql_query = "SELECT count(*) from " + action_type + ";";
            res = stmt->executeQuery(sql_query);
            res->next();
            response += res->getString(1);
            print_out(response, compress);
        }
            
        else if (!action_type.compare("proteins_col") || !action_type.compare("metabolites_col") || !action_type.compare("pathways_col")){
            replaceAll(action_type, "_col", "");
            string sql_query = "SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA` = '" + parameters["mysql_db"] + "' AND `TABLE_NAME` = '" + action_type + "';";
            res = stmt->executeQuery(sql_query);
            string data = "[";
            while (res->next()){
                if (data.length() > 1) data += ",";
                data += "\"" + res->getString(1) + "\"";
            }
            data += "]";
            response += data;
            print_out(response, compress);
            
        }
    }
    
    else if (!action.compare("insert")){
        
        string action_type = (form.find("type") != form.end()) ? form["type"] : "";
        if (!action_type.length()){
            response += "-4";
            print_out(response, compress);
            return -4;
        }
        
        if (action_type.compare("pathways") != 0 && action_type.compare("proteins") != 0 && action_type.compare("metabolites") != 0){
            response += "-5";
            print_out(response, compress);
            return -5;
        }
      
      
        string data = (form.find("data") != form.end()) ? form["data"] : "";
        if (!data.length()){
            response += "-13";
            print_out(response, compress);
            return -13;
        }
      
      
        vector<string> data_token = split(data, ',');
        string smiles_data = "";
        vector< vector<string> > insert_data;
        
        for (int i = 0; i < data_token.size(); ++i){
            vector<string> row = split(data_token[i], ':');
            replaceAll(row[0], "\"", "");
            replaceAll(row[0], "'", "");
            
            if (row.size() >= 2){
                replaceAll(row[1], "\"", "");
                replaceAll(row[1], "'", "");
                for (int j = 2; j < row.size(); ++j){
                    replaceAll(row[j], "\"", "");
                    replaceAll(row[j], "'", "");
                    row[1] += ":" + row[j];
                }
            }
            else row.push_back("");
            insert_data.push_back(row);
            
            if (!action_type.compare("metabolites") && !row[0].compare("smiles") && row[1].length()) smiles_data = row[1];
        }
        
      
            
        string sql_query = "INSERT INTO " + action_type + " (";
        for (int i = 0; i < insert_data.size(); ++i){
            if (i) sql_query += ", ";
            sql_query += insert_data[i][0];
        }
        sql_query += ") VALUES ('";
        
        for (int i = 0; i < insert_data.size(); ++i){
            if (i) sql_query += "', '";
            sql_query += insert_data[i][1];
        }
        sql_query += "');";
        stmt->executeQuery(sql_query);
        
        if (!action_type.compare("metabolites")){
            sql_query = "SELECT max(id) max_id FROM metabolites;";
            res = stmt->executeQuery(sql_query);
            res->next();
            
            string metabolite_id = res->getString(1);
            
            
            string filepath = parameters["root_path"] + "/admin/cgi-bin";
            string command = "java -cp " + filepath + "/cdk-2.0.jar:" + filepath + " DrawChem '" + filepath + "' '" + metabolite_id + "' '" + smiles_data + "'";
            int result = system(command.c_str());
        }
            
        if (!action_type.compare("pathways")){
            string sql_query = "SELECT max(id) from " + action_type + ";";
            res = stmt->executeQuery(sql_query);
            res->next();
            response += res->getString(1);
        }
        else {
            response += "0";
        }
        print_out(response, compress);
    }
    
    
    
    delete res;
    delete stmt;
    delete con;
    return 0;
}
