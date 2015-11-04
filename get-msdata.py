#!/home/dominik.kopczynski/anaconda3/bin/python3.5

import sqlite3
import zlib
import struct
import json
import cgi, cgitb

print("Content-Type: text/html")
print()

form = cgi.FieldStorage()
proteins = form.getvalue('proteins')

def make_dict(cur):
    return {key[0]: value for key, value in zip(cur.description, cur.fetchall()[0])}

spectrum_id = int(form.getvalue('spectrum_id'))
   
db = sqlite3.connect('/home/dominik.kopczynski/Data/blib/TestLibraryPS.blib')
cur = db.cursor()
cur.execute('SELECT * FROM RefSpectra r INNER JOIN RefSpectraPeaks p ON r.id = p.RefSpectraID WHERE r.id = %i;' % int(spectrum_id))
result = make_dict(cur)

try: result["peakMZ"] = zlib.decompress(result["peakMZ"])
except: pass
result["peakMZ"] = struct.unpack("%id" % (len(result["peakMZ"]) / 8), result["peakMZ"])

try: result["peakIntensity"] = zlib.decompress(result["peakIntensity"])
except: pass
result["peakIntensity"] = struct.unpack("%if" % (len(result["peakIntensity"]) / 4), result["peakIntensity"])

print(json.dumps(result))