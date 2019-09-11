#!/usr/bin/python3
#-*- coding: utf-8 -*-



from pymysql import connect, cursors
from cgi import FieldStorage
from json import dumps
from random import random
from base64 import b64decode
import subprocess
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
            joined_chunks = " ".join("%s/%s.%i" % (data_dir, filename, row["chunk_num"]) for row in my_cur)
            os.system("cat %s > %s/%s" % (joined_chunks, data_dir, filename))
            os.system("rm -f %s" % joined_chunks)
        
            data_path = "%s/%s" % (data_dir, filename)
            cwd = "%s/admin/scripts" % conf["root_path"]
            prep_blib = "%s/prepare-blib.bin" % cwd
            
            #command = ["%s %s %s" % (prep_blib, data_path, file_id)]
            #subprocess.call([command], shell = True)
            
            command = [prep_blib, data_path, file_id]
            os.setsid() 
            os.umask(0) 
            p = subprocess.Popen(command, cwd = cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            
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
    
    


def delete_file():
    file_id = form.getvalue('file_id')
    try: int(file_id)
    except: return "#delete_file: delete file parameters not valid"
        
    try:
        
        sql_query = "SELECT * FROM files WHERE id = %s;"
        my_cur.execute(sql_query, file_id)
        if my_cur.rowcount:
            row = my_cur.fetchone()
            
            if row["type"] == "ident":
                os.system("rm -f %s/data.dat" % data_dir)
                
        else:
            return "#No such file in database registered"
        
        
        # delete dependant spectrum files
        sql_query = "SELECT f.id FROM chunks c INNER JOIN files f ON f.filename = c.filename WHERE c.file_id = %s AND c.type = 'depend';"
        my_cur.execute(sql_query, file_id)
        
        depend_ids = [row["id"] for row in my_cur]
        for depend_id in depend_ids:
            # delete chunks from file system
            sql_query = "SELECT * FROM chunks WHERE file_id = %s;"
            my_cur.execute(sql_query, depend_id)
            
            for row in my_cur:
                os.system("rm -f %s/%s.%s" % (data_dir, row['filename'], row["chunk_num"]))
                
            # delete chunks from datebase
            sql_query = "DELETE FROM chunks WHERE file_id = %s;"
            my_cur.execute(sql_query, depend_id)
            
            # delete files from file system
            sql_query = "select * from files WHERE id = %s;"
            my_cur.execute(sql_query, depend_ids)
            for row in my_cur:
                os.system("rm -f %s/%s" %(data_dir, row["filename"]))
            
            # delete files from database
            sql_query = "delete f from files f WHERE f.id = %s;"
            my_cur.execute(sql_query, file_id)
            
        conn.commit()
        
        # delete chunks from file system
        sql_query = "SELECT * from chunks c INNER JOIN files f ON file_id = f.id where f.id = %s;"
        my_cur.execute(sql_query, file_id)
        
        for row in my_cur:
            os.system("rm -f %s/%s.%s" % (data_dir, row['filename'], row["chunk_num"]))
           
        
        # delete chunks from datebase
        sql_query = "delete c from chunks c WHERE c.file_id = %s;"
        my_cur.execute(sql_query, file_id)
        conn.commit()
        
        # delete files from file system
        sql_query = "select * from files WHERE id = %s;"
        my_cur.execute(sql_query, file_id)
        for row in my_cur:
            os.system("rm -f %s/%s" %(data_dir, row["filename"]))
        
        
        # delete files from database
        sql_query = "delete f from files f WHERE f.id = %s;"
        my_cur.execute(sql_query, file_id)
        conn.commit()
        return 0
    
    except Exception as e:
        return "#" + str(e)





def load_dependencies():
    sql_query = "SELECT * FROM files WHERE type = 'ident';"
    my_cur.execute(sql_query)
    if my_cur.rowcount:
        row = my_cur.fetchone()
        file_id = row["id"]
        
        
        sql_query = "SELECT c2.file_id, c.filename, count(c2.id) as uploaded, f.chunk_num FROM chunks c LEFT JOIN files f on c.filename = f.filename LEFT JOIN chunks c2 ON f.id = c2.file_id WHERE c.file_id = %s AND c.type='depend' GROUP BY c2.file_id, c.filename, f.chunk_num ;"
        my_cur.execute(sql_query, file_id)
        data = [{key: row[key] for key in row} for row in my_cur]
        
        return dumps(data)
    
    else:
        return "{}"

"""

def new_job():
    client_hash = form.getvalue('client_hash')
    try: len(client_hash)
    except: return "#new_job: parameters not valid"

    job_hash = ''.join(alphabet[int(random() * 1615499) % len(alphabet)] for i in range(hash_len))
    conn, my_cur = open_db()
    
    insert_new = True
    sql_query = "select t.curr_time - j.timestamp diff_time from jobs j, (select now() curr_time) t where j.client_hash = %s order by timestamp desc;"
    my_cur.execute(sql_query, client_hash)
    if my_cur.rowcount and int(my_cur.fetchone()["diff_time"]) < 300:
        return "#Please wait at least 5 minutes before creating a new job"
    
    
    sql_query = "insert into jobs (user_id, hash_id, state, timestamp, client_hash) values (-1, %s, 'idle', now(), %s);"
    my_cur.execute(sql_query, (job_hash, client_hash))
    conn.commit()
    os.system("mkdir %s/%s" % (data_dir, job_hash))
    return job_hash






def job_existing():
    job_hash = form.getvalue('job_hash')
    try: len(job_hash)
    except: return "#job_existing: parameters not valid"
    
    if len(job_hash) != hash_len: return "#job_existing: job_hash not valid"
        
    conn, my_cur = open_db()
    sql_query = "select count(*) cnt from jobs j where hash_id = %s;"
    my_cur.execute(sql_query, job_hash)
    num = 0
    for row in my_cur:
        num = int(row['cnt'])
    return num



def get_file_list():
    job_hash = form.getvalue('job_hash')
    file_types = form.getvalue('file_types')
    try: len(job_hash), len(file_types)
    except: return "#get_file_list: parameters not valid"
    
    if len(job_hash) != hash_len: return "#get_file_list: job_hash not valid"
        
    conn, my_cur = open_db()
    file_types = file_types.split(":")
    type_list = ", ".join("%s" for f in file_types)
    response = []
    sql_query = "select tb.file_name, tb.id, tb.type, count(tb.id) = tb.chunks valid from (select f.file_name, f.id, f.type, f.chunks from files f inner join jobs j on f.job_id = j.id where j.hash_id = %s and f.type in (" + type_list + ")) tb left join chunks c on tb.id = c.file_id group by tb.file_name, tb.id, tb.type;"
    my_cur.execute(sql_query, (job_hash, *file_types))
    for row in my_cur:
        response.append(row)
    return dumps(response)







def get_state():
    job_hash = form.getvalue('job_hash')
    try: len(job_hash)
    except: return "#get_state: parameters not valid"

    if len(job_hash) != hash_len: return "#get_state: job_hash not valid"
    
    conn, my_cur = open_db()
    sql_query = "select * from jobs j where hash_id = %s;"
    my_cur.execute(sql_query, job_hash)
    row = my_cur.fetchone()
    state = row["state"]
    progress = row["replicate"]
    
    # TODO: for test purpuse, please delete
    if state == "processing":
        if int(progress) == 100:
            state = "idle"
            sql_query = "select * from parameters p inner join jobs j on p.job_id = j.id where p.parameter_name = 'experiment' and j.hash_id = %s;"
            my_cur.execute(sql_query, job_hash)
            experiment = my_cur.fetchone()["parameter_value"]
            
            result = "result_%s.txt" % experiment
            path = "%s/%s" % (data_dir, job_hash)
            os.system("echo result > %s/%s" % (path, result))
            
            sql_query = "select * from files f inner join jobs j on f.job_id = j.id where f.file_name = %s and f.path = %s and j.hash_id = %s;"
            my_cur.execute(sql_query, (result, path, job_hash))
            
            if not my_cur.rowcount:
                sql_query = "insert into files (job_id, type, chunks, file_name, path) values ((select id from jobs where hash_id = %s), 'result', 0, %s, %s);"
                my_cur.execute(sql_query, (job_hash, result, path))
                conn.commit()
            
            sql_query = "update jobs set state = 'idle' where hash_id = %s;"
            my_cur.execute(sql_query, job_hash)
            conn.commit()
            
        else:
            sql_query = "update jobs set replicate = replicate + 10 where hash_id = %s;"
            my_cur.execute(sql_query, job_hash)
            conn.commit()
    
    return dumps({"state": state, "progress": progress})


def get_parameters():
    job_hash = form.getvalue('job_hash')
    try: len(job_hash)
    except: return "#get_parameters: parameters not valid"

    if len(job_hash) != hash_len: return "#get_parameters: job_hash not valid"

    conn, my_cur = open_db()
    response = {}
    sql_query = "select p.* from parameters p inner join jobs j on p.job_id = j.id and j.hash_id = %s;"
    my_cur.execute(sql_query, job_hash)
    for row in my_cur:
        response[row["parameter_name"]] = row["parameter_value"]
    return dumps(response)



def set_parameter():
    job_hash = form.getvalue('job_hash')
    parameter_name = form.getvalue('parameter_name')
    parameter_value = form.getvalue('parameter_value')
    try: len(job_hash), len(parameter_name), len(parameter_value)
    except: return "#set_parameter: parameters not valid"

    if len(job_hash) != hash_len: return "#set_parameter: job_hash not valid"

    conn, my_cur = open_db()
    sql_query = "select p.* from parameters p inner join jobs j on p.job_id = j.id where p.parameter_name = %s and j.hash_id = %s;"
    my_cur.execute(sql_query, (parameter_name, job_hash))
    if my_cur.rowcount:
        sql_query = "update parameters p set p.parameter_value = %s where p.parameter_name = %s and p.job_id = (select id from jobs where hash_id = %s);"
        my_cur.execute(sql_query, (parameter_value, parameter_name, job_hash))
        conn.commit()
    else:
        sql_query = "insert into parameters (job_id, parameter_name, parameter_value) values ((select id from jobs where hash_id = %s), %s, %s);"
        my_cur.execute(sql_query, (job_hash, parameter_name, parameter_value))
        conn.commit()
    return 1


def start_analysis():
    job_hash = form.getvalue('job_hash')
    try: len(job_hash)
    except: return "#start_analysis: parameters not valid"

    if len(job_hash) != hash_len: return "#start_analysis: job_hash not valid"

    # add decoys to fasta
    os.system("")
    
    # create parameter file
    
    # create run on pladipus with autostart
    
    # update state
    conn, my_cur = open_db()
    sql_query = "update jobs set state = 'processing' where hash_id = %s;"
    my_cur.execute(sql_query, job_hash)
    conn.commit()
    
    '''
    # TODO: for test purpuse, please delete
    sql_query = "update jobs set replicate = 0 where hash_id = %s;"
    my_cur.execute(sql_query, job_hash)
    conn.commit()
    '''
    
    return 1


def stop_analysis():
    job_hash = form.getvalue('job_hash')
    try: len(job_hash)
    except: return "#stop_analysis: parameters not valid"

    if len(job_hash) != hash_len: return "#stop_analysis: job_hash not valid"

    conn, my_cur = open_db()
    sql_query = "update jobs set state = 'idle' where hash_id = %s;"
    my_cur.execute(sql_query, job_hash)
    conn.commit()
    return 1



def download_file():
    job_hash = form.getvalue('job_hash')
    file_id = form.getvalue('file_id')
    try: len(job_hash), int(file_id)
    except: return "#download_file: parameters not valid"
    
    if len(job_hash) != hash_len: return "#download_file: job_hash not valid"
        
    conn, my_cur = open_db()
    sql_query = "select f.path, f.file_name from files f inner join jobs j on f.job_id = j.id where f.id = %s and j.hash_id = %s;"
    my_cur.execute(sql_query, (file_id, job_hash))
    row = my_cur.fetchone()
    link = row['path'] + "/" + row['file_name']
    return link
 
 
 
 
 

commands = {"delete_file": delete_file,
            "download_file": download_file,
            "get_check_sum": get_check_sum,
            "get_file_list": get_file_list,
            "get_parameters": get_parameters,
            "get_state": get_state,
            "job_existing": job_existing,
            "new_job": new_job,
            "register_file": register_file,
            "send_file": send_file,
            "set_parameter": set_parameter,
            "start_analysis": start_analysis,
            "stop_analysis": stop_analysis
            }
""" 


commands = {"get_check_sum": get_check_sum,
            "register_file": register_file,
            "send_file": send_file,
            "check_ident": check_ident,
            "delete_file": delete_file,
            "load_dependencies": load_dependencies
            }

if command not in commands:
    print("#command not registered")
    exit()

print(commands[command](), end="")