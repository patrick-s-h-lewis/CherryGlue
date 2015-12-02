import json
import os
from twisted.internet import reactor
from scrapy.crawler import CrawlerRunner
from scrapy.crawler import CrawlerProcess
from scrapy.settings import Settings
from CherryPick.spiders.Munch import MunchSpider
import pymongo
from pymongo import MongoClient

def initialise_file(file):
    with open(file,'ab+') as f:
        f.write('[')
        
def finalise_file(file):
    with open(file,'ab+') as f:
        f.write('{}]')

def connect(mongourl,db,coll):
    client = MongoClient(mongo_url)
    ca = client[db][coll]
    return ca

class CherryPipeline(object):
    @classmethod
    def from_crawler(cls,crawler):
        settings = crawler.settings
        file_name=settings.get('FILE_NAME')
        return cls(file_name)
        
    def __init__(self,file_name):
        print('pipeline_built')
        self.file = open(file_name, 'ab+')

    def process_item(self, item, spider):
        line = json.dumps(dict(item)) + ",\n"
        self.file.write(line)
        return item
    
    def close_spider(self,spider):
        self.file.close()

def get_dois(infile):
    stub = 'http://dx.doi.org/'
    dois=[]
    with open(infile) as f:
        j = json.load(f)
        j.remove({})
        for rec in j:
            doi = stub+rec['doi'] 
            dois.append(doi)
    return dois
    
def get_domains(dbcoll):
    domains = []
    for rec in dbcoll.find():
        domains.append(rec['pub_website'])
    return domains
    
'''def runcrawl(dois,settings,outfile,errorfile,dbcoll):
    runner = CrawlerRunner(settings)
    dois = get_dois(infile)
    domains = get_domains(dbcoll)
    d=runner.crawl(MunchSpider,
         s_u=dois,
         a_d=domains,
         dbcoll=dbcoll,
         errorfile=errorfile)
    d2 = d.addBoth(lambda _:reactor.stop())
    reactor.run()
    return d2 '''
    
# instantiate settings and provide a custom configuration
infile = 'out.json'
outfile = 'complete.json'
errorfile='errors.json'
mongo_url = 'mongodb://localhost:6666/' #remote
#mongo_url = 'mongodb://localhost:27017/' #local
db = 'Cherry'
coll = 'CherryMunch'
dbcoll= connect(mongo_url,db,coll)

settings = Settings()
settings.set('ITEM_PIPELINES', {
    '__main__.CherryPipeline': 100
})

settings.set('LOG_ENABLED',False)
settings.set('FILE_NAME',outfile)

dois = get_dois(infile)
initialise_file(outfile)
'''d2 = runcrawl(dois,settings,outfile,errorfile,dbcoll)
d2.addCallback(lambda _:finalise_file(outfile))'''
process=CrawlerProcess(settings)
dois = get_dois(infile)
domains = get_domains(dbcoll)
process.crawl(MunchSpider,s_u=dois,
         a_d=domains,
         dbcoll=dbcoll,
         errorfile=errorfile)
process.start()