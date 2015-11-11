#!/home/dominik.kopczynski/anaconda3/bin/python3.5

from pymysql import connect, cursors
from cgi import FieldStorage
from json import dumps

form = FieldStorage()
pathway = form.getvalue('pathway')

print("Content-Type: text/html")
print()

if type(pathway) is not str: 
    print(-1)
    exit()
    
try:
    a = int(pathway)
except:
    print(-1)
    exit()

response = []
conn = connect(host='localhost', port=3306, user='qsdb_user', passwd='qsdb_password', db='qsdb')
my_cur = conn.cursor(cursors.DictCursor)
sql_query = "SELECT r.* FROM reactions r INNER JOIN nodes n ON r.node_id = n.id WHERE n.pathway_id = %s"
my_cur.execute(sql_query, pathway)

my_cur_reagent = conn.cursor(cursors.DictCursor)           

for row in my_cur:
    response.append(row)
    response[-1]["reagents"] = []
    sql_reagent = "SELECT * FROM reagents WHERE reaction_id = %s"
    my_cur_reagent.execute(sql_reagent, row["id"])
    for row_reagent in my_cur_reagent:
        response[-1]["reagents"].append(row_reagent)

print(dumps(response))
