#include "bio-classes.h"



static int sqlite_select_pathways(void *data, int argc, char **argv, char **azColName){
    map<string, string> row;
    string* response = ( string *)data;
    for (int i = 0; i < argc; ++i) row.insert({azColName[i], argv[i]});


    
    if (response[0].length() > 1) response[0] += ",";
    response[0] += "\"" + row["id"] + "\":";
    string pw_name = row["name"];
    string signaling_pw = row["signaling_pathway"];
    replaceAll(pw_name, "\n", "\\n");
    response[0] += "[\"" + pw_name + "\"," + signaling_pw + "]";
    
    
    return SQLITE_OK;
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
    
    
    
    
    // retrieve id and peptide sequence from spectral library
    sqlite3 *db;
    char *zErrMsg = 0;
    int rc, chr;
    string database = parameters["root_path"] + "/data/database.sqlite";
    rc = sqlite3_open((char*)database.c_str(), &db);
    if( rc ){
        cout << "{}" << endl;
        exit(-3);
    }
    
    
    
    
    
    /* send SQL query */
    string sql_query = (!print_all) ? "SELECT distinct p.* FROM pathways p inner join nodes n on p.id = n.pathway_id;" : "SELECT * FROM pathways;";
    
    
    
    string response[] = {"{"};
    rc = sqlite3_exec(db, sql_query.c_str(), sqlite_select_pathways, (void*)response, &zErrMsg);
    if( rc != SQLITE_OK ){
        cout << "{}" << endl;
        sqlite3_close(db); 
        exit(-4);
    }
    response[0] += "}";
    
    cout << response[0];
    
    sqlite3_close(db); 
    return 0;
}
