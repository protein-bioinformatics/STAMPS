#!/home/dominik.kopczynski/anaconda3/bin/python3.5

from pymysql import connect, cursors
from cgi import FieldStorage
from json import dumps
from defines import *

print("Content-Type: text/html")
print()

response = []
conn = connect(host = mysql_host, port = mysql_port, user = mysql_user, passwd = mysql_passwd, db = mysql_db)
my_cur = conn.cursor(cursors.DictCursor)
sql_query = "SELECT * FROM proteins ORDER BY name;"
my_cur.execute(sql_query)

response = [row for row in my_cur]

print(dumps(response))

