#!/usr/bin/python3


from urllib.request import urlopen
from cgi import FieldStorage

print("Content-Type: text/html")
print()


form = FieldStorage()
hostname = form.getvalue('host') if "host" in form else ""

conf = {}
with open("../admin/qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")



if hostname != "":
    try:
        print(urlopen("%s/scripts/ping.py" % hostname, timeout = 2).read().decode("utf8"))
        
    except Exception as e:
        print(e)
    
    exit()


print(1 if conf["public"] == "1" else 0)

