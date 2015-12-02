import requests
import scrapy
from scrapy.http import TextResponse
from datetime import datetime
import re
import pymongo
from pymongo import MongoClient
import json
import signal
import warnings
import sys
import os
import AS

def get_paths(publisher,conn,doi):
    ###to do, build database with all of these
    cur = ca.find({'pub_website':publisher})
    if cur.count()==0:
        raise Exception('no publisher website for '+ doi) 
    return cur

def get_publisher(response):
    url = response.url
    publisher = url.split('/')[2]
    return publisher

def handler(signum,frame):
    raise Exception()

def choose_items(items):
    if len(items)==1:
        return items[0]
    else:
        scores=[]
        for it in items:
            score = 0
            for k,v in it.items():
                if type(v)=='str':
                    v=v.strip()
                    if not(v==u''): score+=1
                else:
                    if not(v==[]):
                        score+=1
            scores.append(score)
        return items[scores.index(max(scores))]
        
warnings.filterwarnings("ignore")

def connect(mongourl,db,coll):
    client = MongoClient(mongo_url)
    ca = client[db][coll]
    return ca
    
def dump_record(record,file):
    with open(file,'a') as f:
        json.dump(record,f,sort_keys=True,indent=4,ensure_ascii=True)
        fd.write(',')

def initialise_file(file):
    with open(file,'w') as f:
        f.write('[')
    
def finalise_file(file):
    with open(file, 'rb+') as f:
        f.seek(-1, os.SEEK_END)
        f.truncate()
        f.write(']')

def get_item(paths,response):
    title= response.xpath(paths['x_title']).extract()[0]
    abstract = response.xpath(paths['x_abstract']).extract()[0]
    people = response.xpath(paths['x_people'])
    depts = response.xpath(paths['x_depts'])
    pex=[]
    dex=[]
    for person in people:
        p = person.xpath(paths['x_person']).extract()
        if not(p==[])and (len(p)==1):
            pex.append(p[0])
        else:
            pex.append(p)
    for dept in depts:
        d = dept.xpath(paths['x_dept']).extract()
        if not(d==[]):
            dex.append(d[0])
    exec paths['name_con']
    date = response.xpath(paths['x_date']).extract()[0]
    exec paths['date_con']
    dex = list(set(dex))
    pex = list(set(pex))
    item = {
        'title':re.sub('\n','',title),
        'authors':pex,
        'depts':dex,
        'abstract':re.sub('\n','',abstract),
        'date': date.strftime('%d %B %Y'),
        'doi':doi,
        'publisher':paths['publisher']
    }
    return item

def munch(record,outfile,errorfile,db_coll):
    doi = record['doi']
    target = 'http://dx.doi.org/' + doi
    die = True
    loss=0
    signal.signal(signal.SIGALRM, handler)
    signal.alarm(10)
    try: 
        r = requests.get(target)
        response=TextResponse(r.url,body=r.text, encoding='utf-8')
        ###SENSE Who's publisher this is
        pub = get_publisher(response)
        ###LOAD CORRECT XPATHS:
        try:
            paths_list = get_paths(pub,db_coll,doi)
            die=False
        except:
            die=True 
        if die:
            print('Missing Publisher Fail')
            rep = {'doi':doi,'error':'missing_pub','pub':pub}
            dump_record(rep,errorfile)
    except:    
        print('Page Timeout Fail')
        rep = {'doi':doi,'error':'timeout'}
        dump_record(rep,errorfile)
    signal.alarm(0)
    if die:
        loss+=1
    else: 
        items = []
        for paths in paths_list:
            try:
                item=get_item(response,paths)
                items.append(item)
            except:
                pass
        try:
            item = choose_items(items)
            dump_record(item,outfile)
        except:
            print('Collection Fail')
            rep = {'doi':doi,'error':'collection','pub':pub}
            dump_record(rep,errorfile)
            loss+=1
    return loss

def cherryMunch(infile,outfile,errorfile,db_coll):
    ind=0
    losses=0
    initialise_file(outfile)
    initialise_file(errorfile)
    with open('cam1.json','r') as f:
        j = json.load(f)
        for record in j:
            print(ind)
            ind+=1
            losses+=munch(record,outfile,errorfile,db_coll)
    finalise_file(outfile)
    finalise_file(errorfile)
    print('proportion of records not collected: ' + str(dead))
    
mongo_url = 'mongodb://localhost:6666/' #remote
#mongo_url = 'mongodb://localhost:27017/' #local
db = 'Cherry'
coll = 'CherryMunch'
db_coll = connect(mongourl,db,coll)
infile = 'source.json'
outfile = 'output.json'
errorfile = 'errors.json'
cherryMunch(infile,outfile,errorfile,db_coll)
AS.analyseMunch(outfile,errorfile)
print('Run Complete')
