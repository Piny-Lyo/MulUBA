import csv
import json

csvfile = open('../parallel-sets/processed-data/user-profile3-cluster-parallel-sets.csv', 'r')
jsonfile = open('../parallel-sets/processed-data/user-profile3-cluster-parallel-sets.json', 'w')

reader = csv.DictReader(csvfile)
out = json.dumps([row for row in reader])
jsonfile.write(out)
print('success')