/* Simple C program that connects to MySQL Database server*/
#include <mysql.h>
#include <stdio.h>
#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <sstream>

using namespace std;

vector<string> split(string str, char delimiter) {
  vector<string> internal;
  stringstream ss(str); // Turn the string into a stream.
  string tok;
  
  while(getline(ss, tok, delimiter)) {
    internal.push_back(tok);
  }
  
  return internal;
}

bool is_integer_number(const string& string){
  string::const_iterator it = string.begin();
  int minSize = 0;
  if(string.size()>0 && (string[0] == '-' || string[0] == '+')){
    it++;
    minSize++;
  }
  while (it != string.end() && isdigit(*it)) ++it;
  return string.size()>minSize && it == string.end();
}

main() {
    cout << "Content-Type: text/html" << endl << endl;
    
    vector<string> get_entries = split(getenv("QUERY_STRING"), ';');    
    string counter = "";
    for (int i = 0; i < get_entries.size(); ++i){
        vector<string> get_values = split(get_entries.at(i), '=');
        if (get_values.size() && get_values.at(0) == "counter"){
            counter = get_values.at(1);
        }
    }
    if (counter != "request" && counter != "download"){
        cout << -1 << endl;
        return -1;
    }
    
    MYSQL *conn = mysql_init(NULL);
    MYSQL_RES *res;
    MYSQL_RES *res_reagents;
    MYSQL_ROW row;
    MYSQL_FIELD *field;
    char *server = (char*)"localhost";
    char *user = (char*)"qsdb_user";
    char *password = (char*)"qsdb_password"; /* set me first */
    char *database = (char*)"qsdb";
    map< string, int > column_names;
    
    /* Connect to database */
    if (!mysql_real_connect(conn, server, user, password, database, 0, NULL, 0)) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    /* send SQL query */
    string sql_query = "SELECT count(id) cnt FROM ";
    sql_query += counter;
    sql_query += "_counter WHERE MONTH(month_year) = MONTH(NOW()) AND YEAR(month_year) = YEAR(NOW());";
    if (mysql_query(conn, sql_query.c_str())) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    res = mysql_use_result(conn);
        
    for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
        column_names.insert(pair<string,int>(field->name, i));
    }
    
    int index = 0;
    int cnt = 0;
    while ((row = mysql_fetch_row(res)) != NULL){
        cnt = atoi(row[column_names[string("cnt")]]);
    }
    
    if (!cnt){
        sql_query = "INSERT INTO ";
        sql_query += counter;
        sql_query += "_counter (month_year, number) VALUES(CAST(DATE_FORMAT(NOW() ,'%Y-%m-01') as DATE), 0)";
        
        if (mysql_query(conn, sql_query.c_str())) {
            cout << "1error: " << mysql_error(conn) << endl;
            return 1;
        }
    }
    
    sql_query = "UPDATE ";
    sql_query += counter;
    sql_query += "_counter SET number = number + 1 WHERE MONTH(month_year) = MONTH(NOW()) AND YEAR(month_year) = YEAR(NOW());";
    
    if (mysql_query(conn, sql_query.c_str())) {
        cout << "2error: " << mysql_error(conn) << endl;
        return 1;
    }
    
    mysql_free_result(res);
    mysql_close(conn);
    cout << 0 << endl;
}
