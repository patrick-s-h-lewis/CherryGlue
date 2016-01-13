#!/bin/bash     
option="CrossRef"
infile="scrape_sample.json"
if [ $1=$option ] 
then
	python -b initialise.py $infile
	python -b CherryCrossRefQuery.py
else
	python -b initialise.py $infile
	python -b CherryCollect.py
	#python -b CherryConsume.py
	#python -b Analyse.py
fi