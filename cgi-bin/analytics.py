#!/usr/bin/python3

import cgi, cgitb
from urllib.request import urlopen

print("Content-Type: text/html")
print()


form = cgi.FieldStorage()
action = form.getvalue('action') if 'action' in form else ""
label = form.getvalue('label') if 'label' in form else ""

if len(action) == 0 or len(label) == 0:
    print(-1)
    exit()
   
try:
    response = urlopen("www.google-analytics.com/collect?v=1&tid=UA-115650880-1&uid=asuueffeqqss&t=event&ec=usage&ea=%s&el=%s" % (action, label), {}, 2)
except:
    print(-2)
    exit()

print(0)
