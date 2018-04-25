# HEADER MAKEN

import csv
import json

# open file to read from and file to write to
csvfile = open('Movies.csv', 'r')
jsonfile = open('LOTR.json', 'w')

# read csv data into dict
read = csv.DictReader(csvfile)

# turn objects into string
output = json.dumps([row for row in read])

# write json output to jsonfile
jsonfile.write(output)

# close files
csvfile.close()
jsonfile.close()
