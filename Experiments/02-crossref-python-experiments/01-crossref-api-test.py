#!/usr/bin/python3

from crossref.restful import Works

works = Works()

output = works.agency('10.1590/0102-311x00133115')

print(output)