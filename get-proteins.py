#!/home/dominik.kopczynski/anaconda3/bin/python3.5

from pymysql import connect, cursors
from cgi import FieldStorage
from json import dumps

print("Content-Type: text/html")
print()

response = []
conn = connect(host='localhost', port=3306, user='qsdb_user', passwd='qsdb_password', db='qsdb')
my_cur = conn.cursor(cursors.DictCursor)
sql_query = "SELECT * FROM proteins ORDER BY name;"
my_cur.execute(sql_query)

response = [row for row in my_cur]

print(dumps(response))

