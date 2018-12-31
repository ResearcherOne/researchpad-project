#!/usr/bin/python3

paper_title = "The Emotional Voices Database: Towards Controlling the Emotion Dimension in Voice Generation Systems"

from crossref.restful import Works

works = Works()
w1 = works.query(author="birkan kolcu").sample(5)

for item in w1:
	print(item['title'])
