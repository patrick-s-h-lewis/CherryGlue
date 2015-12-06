#!/bin/bash     
infile=$1     
infile="in.json"
python -b initialise.py $infile;
python -b Collect.py;
python -b Consume.py;
python -b Analyse.py