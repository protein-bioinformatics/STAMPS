#!/usr/bin/python3
#-*- coding: utf-8 -*-

from cgi import FieldStorage
import json
from urllib.parse import urlencode
from urllib.request import urlopen
import xml.etree.ElementTree as ET
import re # regular expression module
import sqlite3



conf = {}
with open("../qsdb.conf", mode="rt") as fl:
    for line in fl:
        line = line.strip().strip(" ")
        if len(line) < 1 or line[0] == "#": continue
        token = line.split("=")
        if len(token) < 2: continue
        conf[token[0].strip(" ")] = token[1].strip(" ")
        
        
def dict_rows(cur): return [{k: v for k, v in zip(cur.description, row)} for row in cur]
def dict_row(cur): return {k[0]: v for k, v in zip(cur.description, cur.fetchone())}

        
        
database = "%s/data/database.sqlite" % conf["root_path"]
conn = sqlite3.connect(database)
my_cur = conn.cursor()

        
print("Content-Type: text/html")
print()

form = FieldStorage()
entity_type = form.getvalue('type') if "type" in form else ""
action = form.getvalue('action') if "type" in form else ""

if len(entity_type) == 0:
    print(-1)
    exit()


if entity_type == "protein":
    accession = form.getvalue('accession') if "accession" in form else ""

    if len(accession) == 0:
        print(-1)
        exit()

    kegg_id = ""
    species = ""
    fasta = ""
    name = ""
    definition = ""
    ec_number = ""
    chromosome = ""
    chr_start = 0
    chr_end = 0
    function_id = 0
    gene_id = -1
    unreviewed = True


    my_cur.execute("SELECT * FROM function_names;")
    ec_to_function_id = {row["ec_prefix"]: row["id"] for row in dict_rows(my_cur) if row["parent"] not in [0, 1]}


    # retrieve fasta
    try:
        xmlstring = urlopen("http://www.uniprot.org/uniprot/%s.xml" % accession, timeout = 2).read().decode("utf8")
        xmlstring = re.sub('\\sxmlns="[^"]+"', '', xmlstring, count=1)
        root = ET.fromstring(xmlstring)
        
        if "dataset" in root[0].attrib and root[0].attrib["dataset"] == "Swiss-Prot": unreviewed = False
        
        for child in root[0]:
            if child.tag == "gene":
                for name_child in child:
                    if name_child.tag == "name" and "type" in name_child.attrib and name_child.attrib["type"] == "primary": name = name_child.text
                    
            elif child.tag == "organism":
                for spec_child in child:
                    if spec_child.tag == "dbReference" and "type" in spec_child.attrib and spec_child.attrib["type"] == "NCBI Taxonomy" and "id" in spec_child.attrib: species = spec_child.attrib["id"]
                    
            elif child.tag == "dbReference":
                if "type" in child.attrib and child.attrib["type"] == "GeneID" and "id" in child.attrib: gene_id = child.attrib["id"]
                elif "type" in child.attrib and child.attrib["type"] == "KEGG" and "id" in child.attrib: kegg_id = child.attrib["id"]
                    
            elif child.tag == "protein":
                for def_child in child:
                    if def_child.tag == "recommendedName":
                                for def2_child in def_child:
                                    if def2_child.tag == "fullName": definition = def2_child.text
                                    elif def2_child.tag == "ecNumber": ec_number = def2_child.text
            
    except:
        pass



    # retrieve fasta
    try:
        fasta = urlopen("http://www.uniprot.org/uniprot/%s.fasta" % accession, timeout = 2).read().decode("utf8")
        if fasta[-1] == "\n": fasta = fasta[:-1]
    except:
        pass


    if ec_number != "":
        for ec in ec_to_function_id:
            if ec_number[:len(ec)] == ec:
                function_id = ec_to_function_id[ec]
                break


    # retrieve chromosome data
    if kegg_id != "":
        response = urlopen("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=gene&id=%s&retmode=xml" % gene_id, timeout = 2)
        html = "".join(chr(c) for c in response.read())
        root = ET.fromstring(html)
        
        try:
            for child in root[0]:
                if child.tag == "Entrezgene_source":
                    for c_child in child[0]:
                        if c_child.tag == "BioSource_subtype":
                            for cc_child in c_child[0]:
                                if cc_child.tag == "SubSource_name":
                                    chromosome = cc_child.text
                            
                elif child.tag == "Entrezgene_locus":
                    for c_child in child[0]:
                        if c_child.tag == "Gene-commentary_seqs":
                            for cc_child in c_child[0][0][0]:
                                if cc_child.tag == "Seq-interval_from":
                                    chr_start = int(cc_child.text)
                                    
                                elif cc_child.tag == "Seq-interval_to":
                                    chr_end = int(cc_child.text)
        except:
            pass


    
    if action == "update":
        
        sql_query = "UPDATE proteins SET name = '%s', definition = '%s', species = '%s', kegg_link = '%s', ec_number = '%s', fasta = '%s', unreviewed = %i, chromosome = '%s', chr_start = %i, chr_end = %i WHERE accession = '%s';" % (name, definition, species, kegg_id, ec_number, fasta, 1 if unreviewed else 0, chromosome, chr_start, chr_end, accession)
        my_cur.execute(sql_query)
        
        conn.commit()
        print(0)


    elif action == "insert":
        sql_query = "INSERT INTO proteins (name, accession, definition, species, kegg_link, ec_number, fasta, unreviewed, chromosome, chr_start, chr_end) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', %s, '%s', %s, %s);" % (name, accession, definition, species, kegg_id, ec_number, fasta, 1 if unreviewed else 0, chromosome, chr_start, chr_end)
        my_cur.execute(sql_query)
        
        conn.commit()
        print(0)

    else:
        print(json.dumps({"kegg_id": kegg_id,
            "unreviewed": unreviewed,
            "species": species,
            "fasta": fasta,
            "name": name,
            "definition": definition,
            "ec_number": ec_number,
            "chromosome": chromosome,
            "function_id": function_id,
            "chr_start": chr_start,
            "chr_end": chr_end
            }))
    
    
elif entity_type == "metabolite":
    c_number = form.getvalue('c_number') if "c_number" in form else ""
    lm_id = form.getvalue('lm_id') if "lm_id" in form else ""
    name = ""
    formula = ""
    exact_mass = ""
    smiles = ""
    
    if len(c_number) > 0:
        try:
            response = urlopen('http://rest.kegg.jp/get/%s' % c_number, timeout = 2)
            lines = response.read().decode("utf8").split("\n")
            
            for line in lines:
                if line[:4] == "NAME":
                    name = line[4:].split(";")[0].strip(" ")
                    
                elif line[:7] == "FORMULA":
                    formula = line[7:].strip(" ")
                    
                elif line[:10] == "EXACT_MASS":
                    exact_mass = line[10:].strip(" ")
                    
                elif line.find("ChEBI: ") > -1:
                    pubnum = line.split(":")[1].strip(" ")
                    if pubnum.find(" ") > -1: pubnum = pubnum.split(" ")[0]
                    
                    response2 = urlopen("http://www.ebi.ac.uk/webservices/chebi/2.0/test/getCompleteEntity?chebiId=%s" % pubnum, timeout = 2)
                    xml = "".join(chr(c) for c in response2.read()).split("\n")[0]
                    
                    st = xml.find("<smiles>")
                    if st > 0:
                        st += 8
                        en = xml.find("</smiles>", st)
                        smiles = xml[st:en]

            print(json.dumps({"name": name,
                    "formula": formula,
                    "exact_mass": exact_mass,
                    "smiles": smiles
                    }))
            
        except:
            print(-1)
    
    elif len(lm_id) > 0:
        response = urlopen('https://www.lipidmaps.org/rest/compound/lm_id/%s/all/' % lm_id, timeout = 2)
        response = response.read().decode("utf8")
        in_data = json.loads(response)
        out_data = {}
        if "lm_id" in in_data: out_data["lm_id"] = in_data["lm_id"]
        if "name" in in_data: out_data["name"] = in_data["name"]
        if "synonyms" in in_data: out_data["short_name"] = in_data["synonyms"].split(";")[0]
        if "exactmass" in in_data: out_data["exact_mass"] = in_data["exactmass"]
        if "formula" in in_data: out_data["formula"] = in_data["formula"]
        if "kegg_id" in in_data: out_data["c_number"] = in_data["kegg_id"]
        if "smiles" in in_data: out_data["smiles"] = in_data["smiles"]
        print(json.dumps(out_data))
    else:
        print(-1)
    
    
    