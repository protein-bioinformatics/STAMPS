#!/home/dominik.kopczynski/anaconda3/bin/python3.5

from pymysql import connect, cursors
from json import dumps
from defines import *

print("Content-Type: text/html")
print()

response = []
conn = connect(host = mysql_host, port = mysql_port, user = mysql_user, passwd = mysql_passwd, db = mysql_db)
my_cur = conn.cursor()
sql_query = "SELECT distinct p.* FROM pathways p inner join nodes n on p.id = n.pathway_id ORDER BY p.name;"
my_cur.execute(sql_query)

response = [row for row in my_cur]

print(dumps(response))

