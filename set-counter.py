#!/home/dominik.kopczynski/anaconda3/bin/python3.5

from pymysql import connect, cursors
from cgi import FieldStorage
from defines import *


form = FieldStorage()
counter = form.getvalue('counter')


print("Content-Type: text/html")
print()

try:
    a = len(counter)
except:
    print(-1)
    exit()

if counter != "request" and counter != "download":
    print(-1)
    exit()

#conn.commit()




conn = connect(host = mysql_host, port = mysql_port, user = mysql_user, passwd = mysql_passwd, db = mysql_db)
my_cur = conn.cursor(cursors.DictCursor)
sql_query = "SELECT count(id) cnt FROM %s_counter WHERE MONTH(month_year) = MONTH(NOW()) AND YEAR(month_year) = YEAR(NOW());" % counter
my_cur.execute(sql_query)
cnt = 0
for row in my_cur:
    cnt = int(row['cnt'])
print("cnt: ", cnt, "<br>")
    
    
if not cnt:
    sql_query = "INSERT INTO %s_counter (month_year, number) VALUES(CAST(DATE_FORMAT(NOW() ,'%%Y-%%m-01') as DATE), 0)" % counter
    my_cur.execute(sql_query)
    conn.commit()
    
sql_query = "UPDATE %s_counter SET number = number + 1 WHERE MONTH(month_year) = MONTH(NOW()) AND YEAR(month_year) = YEAR(NOW());" % counter
my_cur.execute(sql_query)
conn.commit()



print(0)
