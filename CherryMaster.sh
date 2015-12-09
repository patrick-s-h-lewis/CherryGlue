#!/bin/bash     
infile=$1     
infile="camin.json"
python -b initialise.py $infile;
python -b CherryCollect.py;
python -b CherryConsume.py;
python -b Analyse.py