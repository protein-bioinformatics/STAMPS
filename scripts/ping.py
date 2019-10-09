#!/usr/bin/python3


from urllib.request import urlopen
from cgi import FieldStorage

print("Content-Type: text/html")
print()


form = FieldStorage()
hostname = form.getvalue('host') if "host" in form else ""


if hostname != "":
    try:
        print(urlopen("%s/scripts/ping.py" % hostname, timeout = 2).read().decode("utf8"))
        
    except Exception as e:
        print(e)
    
    exit(0)


print(1)

