#!/bin/bash     
infile=$1     
infile="scrape_these.json"
#python -b initialise.py $infile;
#python -b CherryCollect.py;
python -b CherryConsume.py;
python -b Analyse.py