#!/home/dominik.kopczynski/anaconda3/bin/python3.5

from pymysql import connect, cursors
from cgi import FieldStorage
from json import dumps
from defines import *

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
conn = connect(host = mysql_host, port = mysql_port, user = mysql_user, passwd = mysql_passwd, db = mysql_db)
my_cur = conn.cursor(cursors.DictCursor)
sql_query = "SELECT r.* FROM reactions r INNER JOIN nodes n ON r.node_id = n.id WHERE n.pathway_id = %s;"
my_cur.execute(sql_query, pathway)
my_cur_reagent = conn.cursor(cursors.DictCursor)           


response_ref = {}
reactions = []
for i, row in enumerate(my_cur):
    response.append(row)
    response[-1]["reagents"] = []
    response_ref[row["id"]] = i
    reactions.append(row["id"])
reactions = ", ".join(str(r) for r in reactions)

sql_query = "SELECT * FROM reagents rg WHERE reaction_id in (%s);" % reactions
my_cur.execute(sql_query)
for row in my_cur:
    response[response_ref[row["reaction_id"]]]["reagents"].append(row)


print(dumps(response))
