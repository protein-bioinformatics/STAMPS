#!/usr/bin/python3

import sqlite3
import zlib
import struct
import json
import cgi, cgitb

print("Content-Type: text/html")
print()


conf = {}
with open("../admin/qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")


def make_dict(cur):
    return {key[0]: value for key, value in zip(cur.description, cur.fetchall()[0])}


form = cgi.FieldStorage()
spectrum_id = int(form.getvalue('spectrum_id'))
species = form.getvalue('species')


if "root_path" not in conf:
    print(-1)
    exit()



spectral_lib =  "%s/data/spectral_library_%s.blib" % (conf["root_path"], species)
   
db = sqlite3.connect(spectral_lib)
cur = db.cursor()
cur.execute('SELECT * FROM RefSpectra r INNER JOIN RefSpectraPeaks p ON r.id = p.RefSpectraID WHERE r.id = %i;' % spectrum_id)
result = make_dict(cur)

try: result["peakMZ"] = zlib.decompress(result["peakMZ"])
except: pass
result["peakMZ"] = struct.unpack("%id" % (len(result["peakMZ"]) / 8), result["peakMZ"])

try: result["peakIntensity"] = zlib.decompress(result["peakIntensity"])
except: pass
result["peakIntensity"] = struct.unpack("%if" % (len(result["peakIntensity"]) / 4), result["peakIntensity"])

print(json.dumps(result))
