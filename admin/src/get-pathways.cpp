/* Simple C program that connects to MySQL Database server*/
#include <mysql.h>
#include <stdio.h>
#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <sstream>

using namespace std;


main() {
    cout << "Content-Type: text/html" << endl << endl;
    
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
    string sql_query = "SELECT distinct p.* FROM pathways p inner join nodes n on p.id = n.pathway_id ORDER BY p.name;";
    if (mysql_query(conn, sql_query.c_str())) {
        cout << "error: " << mysql_error(conn) << endl;
        return 1;
    }
    res = mysql_use_result(conn);
        
    for(unsigned int i = 0; (field = mysql_fetch_field(res)); i++) {
        column_names.insert(pair<string,int>(field->name, i));
    }
    
    cout << "[";
    int index = 0;
    while ((row = mysql_fetch_row(res)) != NULL){
        if (index++) cout << ", ";
        cout << "[" << row[column_names[string("id")]] << ", ";
        cout << "\"" << row[column_names[string("name")]] << "\"]";
    }
    cout << "]" << endl;
    
    mysql_free_result(res);
    mysql_close(conn);
}
