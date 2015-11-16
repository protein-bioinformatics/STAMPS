#!/home/dominik.kopczynski/anaconda3/bin/python3.5

from pymysql import connect, cursors
from cgi import FieldStorage

form = FieldStorage()
idx = form.getvalue('id')
x = form.getvalue('x')
y = form.getvalue('y')

print("Content-Type: text/html")
print()

if type(x) is not str or type(y) is not str or type(idx) is not str: 
    print(-1)
    exit()
    
try:
    a = int(x) + int(y) + int(idx)
except:
    print(-1)
    exit()
    
conn = connect(host='localhost', port=3306, user='qsdb_user', passwd='qsdb_password', db='qsdb')
my_cur = conn.cursor(cursors.DictCursor)
sql_query = "UPDATE nodes SET x = %s, y = %s WHERE id = %s"
my_cur.execute(sql_query, (x, y, idx))
conn.commit()
print(1)