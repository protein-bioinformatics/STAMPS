#include "bio-classes.h"



#ifdef _WIN32
    string folder_delim = "\\";
#elif defined __unix__
    string folder_delim = "/";
#elif defined __APPLE__
    string folder_delim = "/";
#endif


vector< protein* > proteins;
map<string, peptide* > peptide_dict;
map< int, spectrum* > spectrum_dict;
map< string, string > parameters;

wavelet* occ = 0;
ranking* index_rank = 0;
int* less_table = 0;
int len_text = 0;
int* SA = 0;

string prev_pep_seq = "";
peptide* prev_pep = 0;
string statistics_json_suffix = ".json";


void print_out(string response, bool compress){
    replaceAll(response, "\n", "\\n");
    if (compress){
        cout << compress_string(response);
    }
    else {
        cout << response;
    }
}

static int sqlite_map_peptides(void *data, int argc, char **argv, char **azColName){
    peptide* current_pep = 0;
    string P = argv[1];
    
    
    if (P.compare(prev_pep_seq)){
        int L = 0, R = len_text - 1;
        
        for (string::reverse_iterator c = P.rbegin(); c != P.rend(); ++c){
            occ->get_rank(--L, R, *c);
            --R;
            if (L > R) break;
            int lss = less_table[*c];
            L += lss;
            R += lss;
        }
        
        if (L == R){
            int start_pos = SA[L];
            int prot_index = index_rank->get_rank_right(start_pos);
            current_pep = new peptide(P, start_pos - proteins[prot_index]->proteome_start_pos);
            proteins[index_rank->get_rank_right(SA[L])]->peptides.push_back(current_pep);
            peptide_dict.insert(pair<string, peptide* >(P, current_pep));
            prev_pep_seq = P;
            prev_pep = current_pep;
        }
    }
    else {
        current_pep = prev_pep;
    }
    
    if (current_pep){
        spectrum *s1 = new spectrum(argv[0]);
        current_pep->spectra.push_back(s1);
        spectrum_dict.insert(pair<int, spectrum* >(s1->id, s1));
    }
    return SQLITE_OK;
}








static int sqlite_statistics_pathways(void *data, int argc, char **argv, char **azColName){
    map<string, string> row;
    string* response = (string*)data;
    for (int i = 0; i < argc; ++i) row.insert({azColName[i], argv[i]});


    if (response[0].length() > 1) response[0] += ",";
    
    response[0] += "[" + string(row["pathway_id"]) + ",\"" + string(row["name"]) + "\",[" + string(row["prot_id"]) + "]," + string(row["signaling_pathway"]) + "]";
    
    return SQLITE_OK;
}






static int sqlite_select_proteins(void *data, int argc, char **argv, char **azColName){
    map<string, string> row;
    for (int i = 0; i < argc; ++i) row.insert({azColName[i], argv[i]});
    
    string pid = row["id"];
    protein* last_protein = new protein(pid);
    last_protein->name = row["name"];
    last_protein->definition = row["definition"];
    last_protein->accession = row["accession"];
    last_protein->ec_number = row["ec_number"];
    last_protein->kegg = row["kegg_link"];
    last_protein->unreviewed = row["unreviewed"];
    last_protein->fasta = cleanFasta(row["fasta"]);
    last_protein->pI = predict_isoelectric_point(last_protein->fasta);
    last_protein->mass = compute_mass(last_protein->fasta);
    last_protein->proteome_start_pos = len_text;
    proteins.push_back(last_protein);
    
    return SQLITE_OK;
}


string get_protein_data(string sql_query_proteins, string species, sqlite3 *db, bool statistics){
    
    char chr;
    char *zErrMsg = 0;
    int rc = sqlite3_exec(db, sql_query_proteins.c_str(), sqlite_select_proteins, (void*)&chr, &zErrMsg);
    if( rc != SQLITE_OK ){
        print_out("[]", compress);
        exit(-4);
    }
    
    
    len_text = 0;
    for (auto protein : proteins){
        len_text += protein->fasta.length() + 1;
    }
    len_text += 1; // plus sentinal
    
    if (!proteins.size()) return "{}";
    
    // create FM index for fast pattern search    
    unsigned char* T = new unsigned char[len_text];
    unsigned char* bwt = new unsigned char[len_text];
    T[len_text - 1] = '$';
    
    int len_field = (len_text >> shift) + 1;
    ulong* index_bitfield = new ulong[len_field];
    for (int i = 0; i < len_field; ++i) index_bitfield[i] = 0;
    
    unsigned char* tt = T;
    int p = 0;
    for (int i = 0; i < proteins.size(); ++i){
        int l = proteins[i]->fasta.length();
        memcpy(tt + p, proteins[i]->fasta.data(), l);
        p += l;
        tt[p] = '/';
        index_bitfield[p >> shift] |= one << (p & mask);
        ++p;
    }
    
    index_rank = new ranking(index_bitfield, len_field);
    
     
    SA = new int[len_text];
    for (int i = 0; i < len_text; ++i) SA[i] = i;
    sais(T, SA, len_text);
    
    for (int i = 0; i < len_text; ++i){
        if (SA[i] > 0) bwt[i] = T[SA[i] - 1];
        else bwt[i] = T[len_text - 1];
    }
    
    occ = new wavelet((char*)bwt, len_text, abc);
    less_table = occ->create_less_table();
    
    
    
    // retrieve id and peptide sequence from spectral library
    sqlite3 *db_spec;
    string spectral_lib = parameters["root_path"] + "/data/spectral_library_" + species + ".blib";
    rc = sqlite3_open((char*)spectral_lib.c_str(), &db_spec);
    if( rc ){
        print_out("-3", compress);
        exit(-3);
    }
    
    
    
    
    // retrieve all additional information from spectral library
    string sql_query_lite2 = "SELECT id i, peptideSeq p FROM RefSpectra WHERE scoreType <> -1 ORDER BY p;";
    char tmp_data;
    rc = sqlite3_exec(db_spec, sql_query_lite2.c_str(), sqlite_map_peptides, (void*)&tmp_data, &zErrMsg);
    if( rc != SQLITE_OK ){
        print_out("-4", compress);
        exit(-4);
    }
    
    
    
    sqlite3_stmt *stmt;
    sqlite3_exec(db_spec, "BEGIN TRANSACTION", NULL, NULL, &zErrMsg);
    
    string sql_prepare = "SELECT r.precursorCharge c, r.precursorMZ m, r.peptideModSeq s, group_concat(t.tissue) ts, group_concat(t.number) n, r.confidence q FROM (SELECT id, precursorCharge, precursorMZ, peptideModSeq, confidence FROM RefSpectra WHERE id = ?) r INNER JOIN Tissues t ON r.id = t.RefSpectraId GROUP BY r.id;";
    sqlite3_prepare_v2(db_spec, sql_prepare.c_str(), -1, &stmt, 0);
    
    
    
    for(const auto& sd_pair : spectrum_dict){
        spectrum* s = sd_pair.second;
        sqlite3_bind_int(stmt, 1, s->id);
        int rc = sqlite3_step(stmt);
        s->charge = (char*)sqlite3_column_text(stmt, 0);
        s->mass = (char*)sqlite3_column_text(stmt, 1);
        s->mod_sequence = (char*)sqlite3_column_text(stmt, 2);
        s->tissues = (char*)sqlite3_column_text(stmt, 3);
        s->tissue_numbers = (char*)sqlite3_column_text(stmt, 4);
        s->confidence = (char*)sqlite3_column_text(stmt, 5);
        sqlite3_clear_bindings(stmt);
        sqlite3_reset(stmt);
        
        
    }
    sqlite3_exec(db, "COMMIT TRANSACTION", NULL, NULL, &zErrMsg);
    sqlite3_finalize(stmt);
    
    
    sqlite3_close(db);
    delete occ;
    delete index_rank;
    delete SA;
    delete less_table;

    
    string response = "[";
    for (int i = 0; i < proteins.size(); ++i){
        if (i) response += ",";
        response += proteins[i]->to_string();
    }
    response += "]";
    
    replaceAll(response, "\n", "\\n");
    return response;
}










main(int argc, char** argv) {
    bool compress = true;
    bool caching = true;
    bool rewrite_cache = false;
    bool via_accessions = false;
    bool via_ids = false;
    bool via_loci = false;
    bool via_functions = false;
    bool via_pathway = false;
    
    string accessions = "";
    string host = "";
    string ids = "";
    string loci_ids = "";
    string function_ids = "";
    string pathway_id = "";
    bool statistics = false;
    bool statistics_pathways = false;
    
    
    char* get_string_chr = getenv("QUERY_STRING");
    
    
    if (!get_string_chr){
        print_out("-1", compress);
        return -1;
    }
    
    
    
    
    
    string get_string = string(get_string_chr);
    if (!get_string.length()){
        print_out("-2", compress);
        return -2;
    }
    
    
    
    string species = "";
    vector<string> get_entries = split(get_string, '&');  
    for (int i = 0; i < get_entries.size(); ++i){
        vector<string> get_values = split(get_entries.at(i), '=');
        if (get_values.size()){
            if (get_values.at(0) == "accessions"){
                accessions = get_values.at(1);
                via_accessions = true;
            }
            else if (get_values.at(0) == "ids"){
                ids = get_values.at(1);
                via_ids = true;
            }
            else if (get_values.at(0) == "loci"){
                loci_ids = get_values.at(1);
                via_loci = true;
            }
            else if (get_values.at(0) == "functions"){
                function_ids = get_values.at(1);
                via_functions = true;
            }
            else if (get_values.at(0) == "pathway"){
                pathway_id = get_values.at(1);
                via_pathway = true;
            }
            else if (get_values.at(0) == "statistics"){
                statistics = true;
            }
            else if (get_values.at(0) == "compress"){
                compress = (get_values.at(1) == "false") ? false : true;
            }
            else if (get_values.at(0) == "caching"){
                caching = (get_values.at(1) == "false") ? false : true;
            }
            else if (get_values.at(0) == "rewrite_cache"){
                rewrite_cache = get_values.at(1) == "true";
            }
            else if (get_values.at(0) == "statistics_pathways"){
                statistics_pathways = true;
            }
            else if (get_values.at(0) == "species"){
                species = get_values.at(1);
            }
            else if (get_values.size() && get_values.at(0) == "host"){
                if (get_values.size() > 1) host = get_values.at(1);
            }
        }
    }
    
    if (via_accessions + via_ids + via_loci + via_functions + statistics + statistics_pathways + via_pathway != 1){
        print_out("-5", compress);
        return -5;
    }
    
    
    
    
    
    if (compress){
        cout << "Content-Type: text/html" << endl;
        cout << "Content-Encoding: deflate" << endl << endl;
    }
    else {
        cout << "Content-Type: text/html" << endl << endl;
    }
    
    
    string sql_query_proteins = "";
    string line = "";
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
        string remote_request = host + "/scripts/get-proteins.bin?" + get_vars;
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
    
    
    
    
    
    
    if (statistics_pathways){
        
        string sql_query = "SELECT distinct pw.id pathway_id, pw.name, GROUP_CONCAT(npc.protein_id) prot_id, pw.signaling_pathway FROM pathways pw inner join nodes n on pw.id = n.pathway_id inner join nodeproteincorrelations npc on n.id = npc.node_id inner join proteins p on npc.protein_id = p.id group by pw.id order by pw.name;";
        
        
        
        string response[] = {"["};
        rc = sqlite3_exec(db, sql_query.c_str(), sqlite_statistics_pathways, (void*)response, &zErrMsg);
        if( rc != SQLITE_OK ){
            print_out("[]", compress);
            exit(-4);
        }
        response[0] += "]";
        replaceAll(response[0], "\n", "\\n");
        
        print_out(response[0], compress);
        sqlite3_close(db); 
        return 0;
    }
    
    
    if (!species.length()){
        print_out("-7", compress);
        sqlite3_close(db); 
        return -7;
    }
    
    if (parameters.find("root_path") == parameters.end()){
        print_out("-8", compress);
        sqlite3_close(db); 
        return -8;
    }
    
    if (via_accessions){
        if (accessions == "" || accessions.find("'") != string::npos){
            print_out("-9", compress);
            sqlite3_close(db); 
            return -9;
        }    
        replaceAll(accessions, string(":"), string("','"));
        
        sql_query_proteins = "select distinct * from proteins where accession in ('";
        sql_query_proteins += accessions;
        sql_query_proteins += "') and species = '" + species + "';";
    }
    
    else if (via_ids){
    
        if (ids == "" || ids.find("'") != string::npos){
            print_out("-10", compress);
            sqlite3_close(db); 
            return -10;
        }    
        replaceAll(ids, string(":"), string("','"));
        
        sql_query_proteins = "select distinct * from proteins where id in ('";
        sql_query_proteins += ids;
        sql_query_proteins += "');";
    }
    else if (via_loci) {
        if (loci_ids == "" || loci_ids.find("'") != string::npos){
            print_out("-11", compress);
            sqlite3_close(db); 
            return -11;
        }    
        replaceAll(loci_ids, string(":"), string("','"));
        
        sql_query_proteins = "select distinct p.* from proteins p inner join protein_loci pl on p.id = pl.protein_id where pl.locus_id in ('";
        sql_query_proteins += loci_ids;
        sql_query_proteins += "') and p.species = '" + species + "';";
    }
    else if (via_functions) {
        if (function_ids == "" || function_ids.find("'") != string::npos){
            print_out("-12", compress);
            sqlite3_close(db); 
            return -12;
        }    
        replaceAll(function_ids, string(":"), string("','"));
        
        sql_query_proteins = "select distinct p.* from proteins p inner join protein_functions pf on p.id = pf.protein_id where pf.function_id in ('";
        sql_query_proteins += function_ids;
        sql_query_proteins += "') and p.species = '" + species + "';";
    }
    else if (statistics) {
        sql_query_proteins = "select * from proteins where species = '" + species + "';";
    }
    else if (via_pathway){
        sql_query_proteins = "select distinct p.* from nodes n inner join nodeproteincorrelations np on n.id = np.node_id inner join proteins p on np.protein_id = p.id where n.pathway_id = ";
        sql_query_proteins += pathway_id;
        sql_query_proteins += " and n.type = 'protein' and p.species = '";
        sql_query_proteins += species;
        sql_query_proteins += "';";
    }
    
    
    
    string result = "";
    if (statistics){
        struct stat date_sqlite_db;
        struct stat date_sqlite_json;
        
        string spectral_lib = parameters["root_path"] + "/data/spectral_library_" + species + ".blib";
        string statistics_json_filename = parameters["root_path"] + "/data/spectral_library_" + species + ".blib" + statistics_json_suffix;
        
        
        // reading the protein data from a cached file only if cached file exists and sqlite_db last modification date is older than cached json file date
        if (caching && !rewrite_cache && !stat((char*)spectral_lib.c_str(), &date_sqlite_db) && !stat((char*)statistics_json_filename.c_str(), &date_sqlite_json) && date_sqlite_db.st_ctime < date_sqlite_json.st_ctime){
            
            
            ifstream t;
            int file_length = 0;
            t.open(statistics_json_filename.c_str(), ios::binary);
            t.seekg(0, ios::end);
            file_length = t.tellg();
            t.seekg(0, ios::beg);
            result = string(file_length, 'a');
            t.read((char*)result.data(), file_length);
            t.close();
            
            cout << result;
            sqlite3_close(db); 
            return 0;
        }
        // otherwise retrieve the protein data the normal way and store in 'data' folder
        else {
            
            remove(statistics_json_filename.c_str());
            
            result = get_protein_data(sql_query_proteins, species, db, statistics);
            if (caching){
                string output = result;
                if (compress) output = compress_string(output);
                ofstream json_file(statistics_json_filename.c_str(), ios::binary);
                json_file.write(output.c_str(), output.length());
            }
        }
    }
    else {
    
        result = get_protein_data(sql_query_proteins, species, db, statistics);
    }
    
    print_out(result, compress);
    
    
    sqlite3_close(db); 
    
    return 0;
}
