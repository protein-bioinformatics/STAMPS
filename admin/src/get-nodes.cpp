#include "bio-classes.h"

class node {
    public:
        string id;
        string name;
        string short_name;
        string pathway_id;
        string type;
        string foreign_id;
        string x;
        string y;
        string c_number;
        string lm_id;
        string smiles;
        string formula;
        string exact_mass;
        string position;
        string highlight;
        string image;
        vector<protein*> proteins;
        
        node(){
            id = "";
            name = "";
            short_name = "";
            pathway_id = "";
            type = "";
            foreign_id = "";
            x = "";
            y = "";
            c_number = "";
            lm_id = "";
            smiles = "";
            formula = "";
            exact_mass = "";
            position = "";
            highlight = "";
            image = "";
        }
        
        string to_string(){
            string str = "{";
            str += "\"i\":" + id;
            if (name.length() > 0) str += ",\"n\":\"" + name + "\"";
            if (short_name.length() > 0) str += ",\"sn\":\"" + short_name + "\"";
            if (type.length() > 0) str += ",\"t\":\"" + type + "\"";
            str += ",\"r\":" + (foreign_id.length() ? foreign_id : "0");
            str += ",\"x\":" + x;
            str += ",\"y\":" + y;
            if (c_number.length() > 0) str += ",\"c\":\"" + c_number + "\"";
            if (lm_id.length() > 0) str += ",\"l\":\"" + lm_id + "\"";
            if (smiles.length() > 0) str += ",\"s\":\"" + smiles + "\"";
            if (formula.length() > 0) str += ",\"f\":\"" + formula + "\"";
            if (position.length() > 0) str += ",\"pos\":\"" + position + "\"";
            if (exact_mass.length() > 0) str += ",\"e\":\"" + exact_mass + "\"";
            if (image.length() > 0) str += ",\"img\":\"" + image + "\"";
            if (highlight.length() > 0 && highlight == "1") str += ",\"h\":1";
            if (proteins.size() > 0) {
                str += ",\"p\":[";
                for (uint i = 0; i < proteins.size(); ++i){
                    if (i) str += ",";
                    str += proteins.at(i)->to_string();
                }
                str += "]";
            }
            str += "}";
            return str;
        }
};

vector< protein* >* proteins = 0;
map < int, protein* >* all_proteins = 0;




void print_out(string response, bool compress){
    replaceAll(response, "\n", "\\n");
    //replaceAll(response, "\\C", "\\\\C");
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
    
    string pathway_id = "";
    string species = "";
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
        if (get_values.size() && get_values.at(0) == "pathway"){
            pathway_id = get_values.at(1);
        }
        else if (get_values.size() && get_values.at(0) == "species"){
            species = get_values.at(1);
        }
        else if (get_values.size() && get_values.at(0) == "compress"){
            compress = get_values.at(1) != "false";
        }
        else if (get_values.size() > 1 && get_values.at(0) == "host"){
            host = get_values.at(1);
        }
    }
    if (pathway_id == "" || species == "" || !is_integer_number(pathway_id) || species.find("'") != string::npos){
        response += "-2";
        print_out(response, compress);
        return -2;
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
        string remote_request = host + "/scripts/get-nodes.bin?" + get_vars;
        string response = web_request(remote_request);
        cout << response << flush;
        return 0;
    }
    
    
    
    
    
    
    
    // Create a connection and connect to database
    sql::ResultSet *res;
    sql::Driver *driver = get_driver_instance();
    sql::Connection *con = driver->connect(parameters["mysql_host"], parameters["mysql_user"], parameters["mysql_passwd"]);
    con->setSchema(parameters["mysql_db"]);
    sql::Statement *stmt = con->createStatement();
    
    
    map< int, node*> node_dict;
    proteins = new vector< protein* >();
    all_proteins = new map < int, protein* >();
    
    
    string sql_query_nodes = "select * from nodes where pathway_id = ";
    sql_query_nodes += pathway_id;
    sql_query_nodes += " and type = 'protein';";
    res = stmt->executeQuery(sql_query_nodes);
       
    while (res->next()){
        node* last_node = new node;
        last_node->id = res->getString("id");
        last_node->pathway_id = res->getString("pathway_id");
        last_node->type = res->getString("type");
        last_node->x = res->getString("x");
        last_node->y = res->getString("y");
        node_dict.insert(pair<int, node*>(atoi(last_node->id.c_str()), last_node));
    }
    
    
    string sql_query_proteins = "select n.id nid, p.id, p.name from nodes n inner join nodeproteincorrelations np on n.id = np.node_id inner join proteins p on np.protein_id = p.id where n.pathway_id = ";
    sql_query_proteins += pathway_id;
    sql_query_proteins += " and n.type = 'protein' and p.species = '";
    sql_query_proteins += species + "'";
    sql_query_proteins += ";";
    
    res = stmt->executeQuery(sql_query_proteins);
       
    while (res->next()){
        int node_id = res->getInt("nid");
        string str_pid = res->getString("id");
        int pid = atoi(str_pid.c_str());
        protein* last_protein = 0;
        
        if (all_proteins->find(pid) == all_proteins->end()){
            last_protein = new protein(str_pid);
            last_protein->name = res->getString("name");
            all_proteins->insert(pair<int, protein* >(pid, last_protein));
            proteins->push_back(last_protein);
        }
        else {
            last_protein = all_proteins->at(pid);
        }
        node_dict[node_id]->proteins.push_back(last_protein);
    }
    
    
    
    string sql_query_rest = "(select n.id, p.name, n.pathway_id, n.type, n.foreign_id, n.x, n.y, '' c_number, '' lm_id, '' smiles, '' formula, '' exact_mass, '' position, '' short_name, '' highlight, '' image from nodes n inner join pathways p on p.id = n.foreign_id where n.type = 'pathway' and n.pathway_id = ";
    sql_query_rest += pathway_id; 
    sql_query_rest += ") union ";
    sql_query_rest += "(select n.id, m.name, n.pathway_id, n.type, n.foreign_id, n.x, n.y, m.c_number, m.lm_id, m.smiles, m.formula, m.exact_mass, position, short_name, highlight, image from nodes n inner join metabolites m on m.id = n.foreign_id where n.type = 'metabolite' and n.pathway_id = ";
    sql_query_rest += pathway_id;
    sql_query_rest += ") union ";
    sql_query_rest += "(select id, '', pathway_id, type, 0, x, y, 0, '', '', '', '', '' position, '' short_name, highlight, '' image from nodes n where n.type = 'membrane' and n.pathway_id = ";
    sql_query_rest += pathway_id;
    sql_query_rest += ") union ";
    sql_query_rest += "(select n.id, l.label, n.pathway_id, n.type, n.foreign_id, n.x, n.y, 0, '', '', '', '', '' position, '' short_name, highlight, '' image from nodes n inner join labels l on n.foreign_id = l.id where n.type = 'label' and n.pathway_id = ";
    sql_query_rest += pathway_id;
    sql_query_rest += ") union ";
    sql_query_rest += "(select id, '', pathway_id, type, foreign_id, x, y, 0, '', '', '', '', position, '' short_name, '' highlight, '' image from nodes n where type = 'image' and n.pathway_id = ";
    sql_query_rest += pathway_id;
    sql_query_rest += ");";
    
    res = stmt->executeQuery(sql_query_rest);
       
    while (res->next()){
        node* last_node = new node();
        last_node->id = res->getString("id");
        last_node->pathway_id = res->getString("pathway_id");
        last_node->name = res->getString("name");
        last_node->short_name = res->getString("short_name");
        last_node->type = res->getString("type");
        last_node->foreign_id = res->getString("foreign_id");
        last_node->x = res->getString("x");
        last_node->y = res->getString("y");
        last_node->c_number = res->getString("c_number");
        last_node->lm_id = res->getString("lm_id");
        last_node->smiles = res->getString("smiles");
        replaceAll(last_node->smiles, "\\", "\\\\");
        last_node->formula = res->getString("formula");
        last_node->exact_mass = res->getString("exact_mass");
        last_node->position = res->getString("position");
        last_node->highlight = res->getString("highlight");
        last_node->image = res->getString("image");
        node_dict.insert(pair<int, node*>(atoi(last_node->id.c_str()), last_node));
    }
    
    
    sql_query_rest = "(select n.id, 'undefined' name, n.pathway_id, n.type, n.foreign_id, n.x, n.y, '' c_number, '' lm_id, '' smiles, '' formula, '' exact_mass, '' position from nodes n where n.type = 'pathway' and n.foreign_id = -1 and n.pathway_id = ";
    sql_query_rest += pathway_id; 
    sql_query_rest += ") union ";
    sql_query_rest += "(select n.id, 'undefined' name, n.pathway_id, n.type, n.foreign_id, n.x, n.y, '' c_number, '' lm_id, '' smiles, '' formula, '' exact_mass, position from nodes n where n.type = 'metabolite' and n.foreign_id = -1 and n.pathway_id = ";
    sql_query_rest += pathway_id;
    sql_query_rest += ") union ";
    sql_query_rest += "(select n.id, 'inv' name, n.pathway_id, n.type, n.foreign_id, n.x, n.y, '' c_number, '' lm_id, '' smiles, '' formula, '' exact_mass, position from nodes n where n.type = 'invisible' and n.pathway_id = ";
    sql_query_rest += pathway_id;
    sql_query_rest += ");";
    
    res = stmt->executeQuery(sql_query_rest);
    
    while (res->next()){
        node* last_node = new node();
        last_node->id = res->getString("id");
        last_node->pathway_id = res->getString("pathway_id");
        last_node->name = res->getString("name");
        last_node->type = res->getString("type");
        last_node->foreign_id = res->getString("foreign_id");
        last_node->x = res->getString("x");
        last_node->y = res->getString("y");
        last_node->c_number = res->getString("c_number");
        last_node->lm_id = res->getString("lm_id");
        last_node->smiles = res->getString("smiles");
        replaceAll(last_node->smiles, "\\", "\\\\");
        last_node->formula = res->getString("formula");
        last_node->exact_mass = res->getString("exact_mass");
        last_node->position = res->getString("position");
        node_dict.insert(pair<int, node*>(atoi(last_node->id.c_str()), last_node));
    }
    
    

    response += "[";
    map<int, node*>::iterator node_it = node_dict.begin();
    for (map<int, node*>::iterator node_it = node_dict.begin(); node_it != node_dict.end(); ++node_it){
        if (node_it != node_dict.begin()) response += ",";
        response += (node_it->second)->to_string();
    }
    response += "]";
    print_out(response, compress);
    
    
    delete proteins;
    delete all_proteins;
    
    
    delete res;
    delete stmt;
    delete con;
    
    return 0;
}
