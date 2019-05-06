#!/usr/bin/python3

from crossref.restful import Works
import json

works = Works()

#output = works.doi('10.1590/0102-311x00133115') #Zika Virus
#output = works.doi('10.2105/AJPH.2016.303115') #Zika Virus's reference
#output = works.doi('10.4203/ccp.111.17') #Birkan Kolcu
output = works.doi('10.1103/physrevlett.98.010505')

print (json.dumps(output, sort_keys=True, indent=4))