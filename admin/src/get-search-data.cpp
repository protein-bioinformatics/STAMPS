#include "bio-classes.h"

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





static int sqlite_select_metabolites(void *data, int argc, char **argv, char **azColName){
    map<string, string> row;
    vector< search_data >* search_vector = (vector< search_data >*)data;
    for (int i = 0; i < argc; ++i) row.insert({azColName[i], argv[i]});

    search_data sd;
    sd.pattern = row["name"];
    sd.node_id = row["id"];
    sd.pathway_id = row["pathway_id"];
    search_vector->push_back(sd);
    
    return SQLITE_OK;
}





static int sqlite_select_pathways(void *data, int argc, char **argv, char **azColName){
    map<string, string> row;
    vector< search_data >* search_vector = (vector< search_data >*)data;
    for (int i = 0; i < argc; ++i) row.insert({azColName[i], argv[i]});

    search_data sd;
    sd.pattern = row["name"];
    sd.node_id = row["id"];
    sd.pathway_id = row["pathway_id"];
    search_vector->push_back(sd);
    
    return SQLITE_OK;
}





static int sqlite_select_proteins(void *data, int argc, char **argv, char **azColName){
    map<string, string> row;
    vector< search_data >* search_vector = (vector< search_data >*)data;
    for (int i = 0; i < argc; ++i) row.insert({azColName[i], argv[i]});

    search_data sd;
    sd.pattern = row["name"];
    sd.node_id = row["id"];
    sd.pathway_id = row["pathway_id"];
    search_vector->push_back(sd);
    
    search_data sd2;
    sd2.pattern = row["definition"];
    sd2.node_id = row["id"];
    sd2.pathway_id = row["pathway_id"];
    search_vector->push_back(sd2);
    
    search_data sd3;
    sd3.pattern = row["accession"];
    sd3.node_id = row["id"];
    sd3.pathway_id = row["pathway_id"];
    search_vector->push_back(sd3);
    
    return SQLITE_OK;
}







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
    
    
    
    string host = "";
    
    
    char* get_string_chr = getenv("QUERY_STRING");
    
    if (!get_string_chr){
        cout << -1;
        return -1;
    }
    
    string get_string = get_string_chr;
    
    if (!get_string.length()){
        response += "-1";
        print_out(response, compress);
        return -1;
    }
    vector<string> get_entries = split(get_string, '&');  
    for (uint i = 0; i < get_entries.size(); ++i){
        vector<string> get_values = split(get_entries.at(i), '=');
        if (get_values.size() > 1 && get_values.at(0) == "host"){
            host = get_values.at(1);
        }
    }
    
    
    // if it is a remote request
    if (host.length() > 0 && (host != "localhost" || host != "127.0.0.1")){
        
        string remote_request = host + "/scripts/get-nodes.bin?";
        string response = web_request(remote_request);
        cout << response << flush;
        return 0;
    }
    
    
    
    
    // retrieve id and peptide sequence from spectral library
    sqlite3 *db;
    char *zErrMsg = 0;
    int rc, chr;
    string database = parameters["root_path"] + "/data/database.sqlite";
    rc = sqlite3_open((char*)database.c_str(), &db);
    if( rc ){
        print_out("[]", compress);
        exit(-3);
    }
    
    
    
    vector< search_data > search_vector;
    
    // requesting metabolite data
    string sql_query_metabolites = "SELECT m.name, n.id, n.pathway_id from metabolites m inner join nodes n on m.id = n.foreign_id where n.type = 'metabolite';";
    rc = sqlite3_exec(db, sql_query_metabolites.c_str(), sqlite_select_metabolites, (void*)&search_vector, &zErrMsg);
    if( rc != SQLITE_OK ){
        cout << "[]" << endl;
        sqlite3_close(db); 
        exit(-4);
    }
    
    
    
    
    
    
    
    // requesting pathway data
    string sql_query_pathway = "SELECT pw.name, n.id, n.pathway_id from pathways pw inner join nodes n on pw.id = n.foreign_id where n.type = 'pathway';";
    rc = sqlite3_exec(db, sql_query_pathway.c_str(), sqlite_select_pathways, (void*)&search_vector, &zErrMsg);
    if( rc != SQLITE_OK ){
        cout << "[]" << endl;
        sqlite3_close(db); 
        exit(-4);
    }
    
    
    
    
    // requesting protein data
    string sql_query_proteins = "SELECT p.name, p.definition, p.accession, n.id, n.pathway_id from proteins p inner join nodeproteincorrelations npc on p.id = npc.protein_id inner join nodes n on npc.node_id = n.id where n.type = 'protein';";
    rc = sqlite3_exec(db, sql_query_proteins.c_str(), sqlite_select_proteins, (void*)&search_vector, &zErrMsg);
    if( rc != SQLITE_OK ){
        cout << "[]" << endl;
        sqlite3_close(db); 
        exit(-4);
    }
    
    
    
    
    response += "["; 
    for (auto &entry: search_vector){
        if (response.length() > 1) response += ",";
        response += "[\"" + entry.pattern + "\"," + entry.node_id + "," + entry.pathway_id + "]";
    }
    response += "]";
    
    print_out(response, compress);
    
    
    sqlite3_close(db); 
    return 0;
}