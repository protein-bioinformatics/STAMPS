#include "bio-classes.h"

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




static int sqlite_select_chromosomes(sqlite3_stmt* select_stmt, void *data){
    map<string, string> row;
    map<string, vector<chromosome_band*>* >* chromosomes = (map<string, vector<chromosome_band*>* >*)data;
    for(int col = 0; col < sqlite3_column_count(select_stmt); col++) {
        row.insert({string(sqlite3_column_name(select_stmt, col)), string((const char*)sqlite3_column_text(select_stmt, col))});
    }
    
    string chromosome = row["chromosome"];
    if (chromosomes->find(chromosome) == chromosomes->end()) chromosomes->insert({chromosome, new vector<chromosome_band*>()});
    
    chromosome_band* cb = new chromosome_band();
    cb->chromosome;
    cb->arm = row["arm"];
    cb->name = row["name"];
    cb->start = row["start"];
    cb->end = row["end"];
    cb->positive = row["positive"];
    cb->color = row["color"];
    cb->species = row["species"];
    chromosomes->at(chromosome)->push_back(cb);
    
    return SQLITE_OK;
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
    
    
    string host = "";
    vector<string> get_entries = split(get_string, '&');
    map< string, string > form;
    for (uint i = 0; i < get_entries.size(); ++i){
        vector<string> get_values = split(get_entries.at(i), '=');
        string value = (get_values.size() > 1) ? get_values.at(1) : "";
        form.insert(pair< string, string >(get_values.at(0), value));
        if (get_values.size() > 1 && get_values.at(0) == "host"){
            host = get_values.at(1);
        }
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
    
    
    
    
    // if it is a remote request
    if (host.length() > 0 && (host != "localhost" || host != "127.0.0.1")){
        
        string get_vars = "";
        for (uint i = 0; i < get_entries.size(); ++i){
            vector<string> get_values = split(get_entries.at(i), '=');
            if (get_values.size() && get_values.at(0) != "host"){
                if (get_vars.length() > 0) get_vars += "&";
                get_vars += get_entries.at(i);
            }
        }
        string remote_request = host + "/scripts/get-chromosomes.bin?" + get_vars;
        string response = web_request(remote_request);
        if (response.length() == 0){
            response = "{}";
        }
        print_out(response, compress);
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
    
    
    
    
    
    string species = (form.find("species") != form.end()) ? form["species"] : "";
    if (!species.length()){
        response += "-3";
        print_out(response, compress);
        return -3;
    }
    
    
    map<string, vector<chromosome_band*>* > chromosomes;
    sqlite3_stmt *select_stmt_chromosomes = NULL;
    string sql_chromosomes = "SELECT * FROM chromosome_bands WHERE species = ? ORDER BY chromosome;";
    
    rc = sqlite3_prepare_v2(db, sql_chromosomes.c_str(), -1, &select_stmt_chromosomes, NULL);
    if(SQLITE_OK != rc) {
        print_out("{}", compress);
        sqlite3_close(db);
        exit(-13);
    }
    
    sqlite3_bind_text(select_stmt_chromosomes, 1, species.c_str(), species.length(), SQLITE_STATIC);
    
    while(SQLITE_ROW == (rc = sqlite3_step(select_stmt_chromosomes))) {
        sqlite_select_chromosomes(select_stmt_chromosomes, (void*)&chromosomes);
    }
    if(SQLITE_DONE != rc) {
        print_out("{}", compress);
	sqlite3_finalize(select_stmt_chromosomes);
        exit(-4);
    }
    sqlite3_finalize(select_stmt_chromosomes);
    
    
    
    
    
    
    
    
    
    
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
    
    sqlite3_close(db); 
    
    return 0;
}
