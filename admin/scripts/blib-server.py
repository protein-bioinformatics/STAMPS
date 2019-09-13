#!/usr/bin/python3
#-*- coding: utf-8 -*-



from pymysql import connect, cursors
from cgi import FieldStorage
from json import dumps
from base64 import b64decode
import subprocess
import sqlite3
import zlib
import struct
import os
alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678901234567890123456789012345678901234567890123456789"
hash_len = 32



form = FieldStorage(environ={'REQUEST_METHOD':'POST'})
command = form.getvalue('command')

print("Content-Type: text/html")
print()


conf = {}
with open("../qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")



data_dir = "%s/tmp/upload" % conf["root_path"]



conn, my_cur = 0, 0

try:
    conn = connect(host = conf["mysql_host"], port = int(conf["mysql_port"]), user = conf["mysql_user"], passwd = conf["mysql_passwd"], db = conf["mysql_db"])
    my_cur = conn.cursor(cursors.DictCursor)
except:
    print(-1)
    exit()




try: len(command)
except:
    print("#command parameter not found")
    exit()




def register_file():
    
    filename = form.getvalue('filename')
    file_type = form.getvalue('file_type')
    chunk_num = form.getvalue('chunk_num')
    species = form.getvalue('species') if "species" in form else ""
    tissue = form.getvalue('tissue') if "tissue" in form else ""
    
    try: len(filename), len(file_type), int(chunk_num)
    except: return "#register_file: register parameters not valid"

    if file_type not in ["spectra", "ident"]:
        return "#no valid file type"
    
    if file_type == "ident" and species == "":
        return "#register_file: register ident not valid"
    
    if file_type == "spectra" and tissue == "":
        return "#register_file: register spectra not valid"
        
    file_id = -1
    sql_query = "select id from files where filename = %s;"
    my_cur.execute(sql_query, (filename))
    if my_cur.rowcount:
        file_id = my_cur.fetchone()['id']
    
    else:
        sql_query = "insert into files (type, chunk_num, filename, species, tissue) values (%s, %s, %s, %s, %s);"
        my_cur.execute(sql_query, (file_type, chunk_num, filename, species, tissue))
        conn.commit()
        
        sql_query = "select max(id) max_id from files f;"
        my_cur.execute(sql_query)
        file_id = my_cur.fetchone()['max_id']
    return file_id










def get_check_sum():
    file_id = form.getvalue('file_id')
    chunk_num = form.getvalue('chunk_num')
    try: int(file_id), int(chunk_num)
    except: return "#get_check_sum: checksum parameters not valid"
    
    md5 = -1
    sql_query = "SELECT c.checksum FROM chunks c INNER JOIN files f ON c.file_id = f.id WHERE f.id = %s AND c.chunk_num = %s;"
    my_cur.execute(sql_query, (file_id, chunk_num))
    if my_cur.rowcount:
        md5 = my_cur.fetchone()['checksum']
    return md5








def send_file():
    file_id = form.getvalue('file_id')
    chunk_num = form.getvalue('chunk_num')
    chunk_type = form.getvalue('type')
    checksum = form.getvalue('checksum')
    content = form.getvalue('content')
    
    try: int(file_id), len(chunk_num), len(chunk_type), len(checksum), len(content)
    except: return "#send_file: send parameters not valid"
    
    
    
    sql_query = "SELECT * FROM files WHERE id = %s;"
    my_cur.execute(sql_query, (file_id))
    if my_cur.rowcount:
        row = my_cur.fetchone()
        chunk_max = int(row["chunk_num"])
        filename = row["filename"]
        chunk_name = "%s.%s" % (filename, chunk_num)
        with open("%s/%s" % (data_dir, chunk_name), mode="wb") as fl:
            content = (content + '===')[: len(content) + (len(content) % 4)]
            content = content.replace('-', '+').replace('_', '/')
            fl.write(b64decode(content))
            
        sql_query = "select id from chunks where chunk_num = %s and file_id = %s;"
        my_cur.execute(sql_query, (chunk_num, file_id))
        if my_cur.rowcount:
            sql_query = "update chunks set checksum = %s where chunk_num = %s and file_id = %s;"
            my_cur.execute(sql_query, (checksum, chunk_num, file_id))
            conn.commit()
        
        else:
            sql_query = "insert into chunks (file_id, checksum, chunk_num, type, filename) values (%s, %s, %s, %s, '');"
            my_cur.execute(sql_query, (file_id, checksum, chunk_num, chunk_type))
            conn.commit()
        
        sql_query = "select * from chunks where file_id = %s ORDER BY chunk_num;"
        my_cur.execute(sql_query, file_id)
        if my_cur.rowcount == chunk_max:
            cwd = "%s/admin/scripts" % conf["root_path"]
            
            with open("%s/run-prepare-blib.sh" % data_dir, mode = "wt") as script_file:
            
                joined_chunks = " ".join("'%s/%s.%i'" % (data_dir, filename, row["chunk_num"]) for row in my_cur)
                script_file.write("cat %s > '%s/%s'\n" % (joined_chunks, data_dir, filename))
                script_file.write("rm -f %s\n" % joined_chunks)
            
                data_path = "'%s/%s'" % (data_dir, filename)
                prep_blib = "%s/prepare-blib.bin" % cwd
                
                script_file.write("%s %s %s &\n" % (prep_blib, data_path, file_id))
                #script_file.write("echo 0 > %s/progress.dat \n" % data_dir)
                
            
            os.system("/bin/chmod 777 %s/run-prepare-blib.sh" % data_dir)
            pid = subprocess.Popen(["%s/run-prepare-blib.sh &" % data_dir], cwd = cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
            
        return 0
        
    return "#send_file: corresponding file not found"
    



def check_ident():
    sql_query = "SELECT * FROM files WHERE type = 'ident';"
    my_cur.execute(sql_query)
    if my_cur.rowcount:
        row = my_cur.fetchone()
        file_id = row["id"]
        data = {key: row[key] for key in row}
        
        
        sql_query = "SELECT * FROM chunks WHERE file_id = %s AND type='chunk';"
        my_cur.execute(sql_query, file_id)
        data["uploaded"] = my_cur.rowcount
        
        return dumps(data)
    
    else:
        return "{}"
    
 
 
def check_blib_progress():
    
    fname = "%s/progress.dat" % data_dir
    if not os.path.isfile(fname):
        return 0
    
    else:
        with open(fname, mode = "rt") as content_file:
            content = content_file.read().strip().strip(" ")
            if len(content) == 0:
                return 0
            
            return content
        
        


def start_convertion():
    os.system("rm -f '%s/progress.dat'" % data_dir)
    os.system("rm -f '%s/tmp.blib'" % data_dir)
    
    
    cwd = "%s/admin/scripts" % conf["root_path"]
    command = "%s/create-blib.bin &" % cwd
    pid = subprocess.Popen([command], cwd = cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
    return 0





def delete_file():
    file_id = form.getvalue('file_id')
    try: int(file_id)
    except: return "#delete_file: delete file parameters not valid"
        
    try:
        
        sql_query = "SELECT * FROM files WHERE id = %s;"
        my_cur.execute(sql_query, file_id)
        if my_cur.rowcount:
            row = my_cur.fetchone()
            
            
            # no matter which file will be deleted, tmp.blib must be deleted, too
            os.system("rm -f '%s/tmp.blib'" % data_dir)
            os.system("rm -f '%s/progress.dat'" % data_dir)
            
            
            # delete dependant spectrum files
            if row["type"] == "ident":
                os.system("rm -f '%s/data.dat'" % data_dir)
                
                
                sql_query = "SELECT f.id, f.filename FROM chunks c INNER JOIN files f ON f.filename = c.filename WHERE c.file_id = %s AND c.type = 'depend';"
                my_cur.execute(sql_query, file_id)
                
                depends = [row for row in my_cur]
                
                
                for depend in depends:
                    # delete chunks from file system
                    sql_query = "SELECT * FROM chunks WHERE file_id = %s;"
                    my_cur.execute(sql_query, depend["id"])
                    
            
                    for row in my_cur:
                        command = "rm -f '%s/%s.%s'" % (data_dir, depend['filename'], row["chunk_num"])
                        os.system(command)
                        
                    # delete chunks from datebase
                    sql_query = "DELETE FROM chunks WHERE file_id = %s;"
                    my_cur.execute(sql_query, depend["id"])
                    
                    # delete files from file system
                    sql_query = "select * from files WHERE id = %s;"
                    my_cur.execute(sql_query, depend["id"])
                    for row in my_cur:
                        os.system("rm -f '%s/%s'" %(data_dir, row["filename"]))
                    
                    # delete files from database
                    sql_query = "delete f from files f WHERE f.id = %s;"
                    my_cur.execute(sql_query, depend["id"])
                    
                conn.commit()              
              
              
            filename = row["filename"]  
              
              
            # delete chunks from file system
            sql_query = "SELECT * FROM chunks WHERE file_id = %s;"
            my_cur.execute(sql_query, file_id)
            
        
            for row in my_cur:
                command = "rm -f '%s/%s.%s'" % (data_dir, filename, row["chunk_num"])
                os.system(command)
            
            
            # delete chunks from datebase
            sql_query = "DELETE FROM chunks WHERE file_id = %s;"
            my_cur.execute(sql_query, file_id)
            conn.commit()
            
            # delete files from file system
            sql_query = "SELECT * FROM files WHERE id = %s;"
            my_cur.execute(sql_query, file_id)
            for row in my_cur:
                os.system("rm -f '%s/%s'" %(data_dir, row["filename"]))
            
            
            # delete files from database
            sql_query = "DELETE FROM files WHERE id = %s;"
            my_cur.execute(sql_query, file_id)
            conn.commit()
            return 0
              
                
        else:
            return "#No such file in database registered"
        
        

        
    
    except Exception as e:
        return "#" + str(e)





def load_dependencies():
    sql_query = "SELECT * FROM files WHERE type = 'ident';"
    my_cur.execute(sql_query)
    if my_cur.rowcount:
        row = my_cur.fetchone()
        file_id = row["id"]
        
        
        sql_query = "SELECT c2.file_id, c.filename, count(c2.id) as uploaded, f.chunk_num, f.tissue FROM chunks c LEFT JOIN files f on c.filename = f.filename LEFT JOIN chunks c2 ON f.id = c2.file_id WHERE c.file_id = %s AND c.type='depend' GROUP BY c2.file_id, c.filename, f.chunk_num, f.tissue;"
        my_cur.execute(sql_query, file_id)
        data = [{key: row[key] for key in row} for row in my_cur]
        
        return dumps(data)
    
    else:
        return "{}"




def select_spectra():
    db = sqlite3.connect("%s/tmp.blib" % data_dir)
    cur = db.cursor()
    
    limit = form.getvalue('limit')
    if type(limit) is not str:
        return "#-3"
    
    limits = limit.split(",")
    for l in limits:
        try:
            a = int(l)
        except:
            return "#-4"
        
    sql_query = "SELECT id, peptideModSeq, precursorCharge, scoreType FROM RefSpectra ORDER BY id LIMIT %s;" % limit
    cur.execute(sql_query)
    return dumps([row for row in cur])




def get_num_spectra():
    db = sqlite3.connect("%s/tmp.blib" % data_dir)
    cur = db.cursor()
    
    sql_query = "SELECT count(*) cnt FROM RefSpectra;"
    cur.execute(sql_query)
    return cur.fetchone()[0]




def get_spectrum():
    spectrum_id = int(form.getvalue('spectrum_id'))
    
    def make_dict(cur): return {key[0]: value for key, value in zip(cur.description, cur.fetchall()[0])}
    
    db = sqlite3.connect("%s/tmp.blib" % data_dir)
    cur = db.cursor()
    cur.execute('SELECT * FROM RefSpectra r INNER JOIN RefSpectraPeaks p ON r.id = p.RefSpectraID WHERE r.id = %i;' % spectrum_id)
    result = make_dict(cur)

    try: result["peakMZ"] = zlib.decompress(result["peakMZ"])
    except: pass
    result["peakMZ"] = struct.unpack("%id" % (len(result["peakMZ"]) / 8), result["peakMZ"])

    try: result["peakIntensity"] = zlib.decompress(result["peakIntensity"])
    except: pass
    result["peakIntensity"] = struct.unpack("%if" % (len(result["peakIntensity"]) / 4), result["peakIntensity"])

    return dumps(result)




def set_unset_spectrum():
    
    db = sqlite3.connect("%s/tmp.blib" % data_dir)
    cur = db.cursor()
    
    spectrum_id = int(form.getvalue('spectrum_id'))
    value = int(form.getvalue('value'))
    
    sql_query = "UPDATE RefSpectra SET scoreType = %s WHERE id = %s;" % (value, spectrum_id)
    cur.execute(sql_query)
    db.commit()
    return 0


commands = {"get_check_sum": get_check_sum,
            "register_file": register_file,
            "send_file": send_file,
            "check_ident": check_ident,
            "delete_file": delete_file,
            "load_dependencies": load_dependencies,
            "start_convertion": start_convertion,
            "check_blib_progress": check_blib_progress,
            "select_spectra": select_spectra,
            "get_spectrum": get_spectrum,
            "get_num_spectra": get_num_spectra,
            "set_unset_spectrum": set_unset_spectrum
            }

if command not in commands:
    print("#command not registered")
    exit()

print(commands[command](), end="")