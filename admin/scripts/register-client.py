#!/usr/bin/python3

from urllib.request import urlopen
from urllib.parse import quote
import os

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
    
    auth_file = "%s/admin/auth.txt" % conf["root_path"]
    if os.path.isfile(auth_file):
        with open(auth_file) as read_auth_file:
            request += "&auth=%s" % quote(read_auth_file.read().strip().strip(" "))
        
    request = stamps_server + "/client-registration.py?" + request
    
    response = urlopen(request, timeout = 2).read().decode("utf8").strip().strip(" ")
    
    if public:
        if response[0] == "#":
            with open(auth_file, mode = "wt") as write_auth:
                write_auth.write(response)
                response = "0"
    else:
        if response == "0": os.remove(auth_file)
    
    print(response)
    
    
except Exception as e:
    print(-1)
