import sqlite3
import zlib
import struct
import json

def make_dict(cur):
    return {key[0]: value for key, value in zip(cur.description, cur.fetchall()[0])}

def index(req):
    spectrum_id = 1
    split_args = req.args.split("&")
    for arg in split_args:
        token = arg.split("=")
        if token[0] == "spectrum_id":
            spectrum_id = token[1]
            break
        
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
    
    return json.dumps(result)