#!/usr/bin/python3

from urllib.request import urlopen
from urllib.parse import quote

conf = {}
with open("../qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")


print("Content-Type: text/html")
print()


try:
    stamps_server = conf["server"]
    hostname = conf["host"]
    labname = conf["hostname"]
    public = conf["public"] == "1"


    request = "url=" + quote(hostname)
    request += "&host=" + quote(labname)
    request += "&action=%ssubscribe" % ("" if public else "un")
    request = stamps_server + "/client-registration.py?" + request
    
    print(urlopen(request, timeout = 2).read().decode("utf8"))
    
except Exception as e:
    print("-1")
