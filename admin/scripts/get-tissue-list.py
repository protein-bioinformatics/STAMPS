#!/usr/bin/python3

import json

print("Content-Type: text/html")
print()


species = []
with open ("../../data/brenda_taxonomy.txt") as infile:
    for line in infile:
        line = line.strip()
        species.append([row.strip("'") for row in line.split(",")])
print(json.dumps(species))
