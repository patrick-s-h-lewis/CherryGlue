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

def connect(mongo_url,db,coll):
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

def main(infile,outfile,errorfile,connection,database,collection):
    finished=False
    dbcoll=connect(connection,database,collection)
    
    settings = Settings()
    settings.set('ITEM_PIPELINES', {
        'Consume.CherryPipeline': 100
    })
    
    settings.set('LOG_ENABLED',False)
    settings.set('FILE_NAME',outfile)
    
    dois = get_dois(infile)
    initialise_file(outfile)
    initialise_file(errorfile)
    
    runner=CrawlerRunner(settings)
    #runner=CrawlerProcess(settings)
    dois = get_dois(infile)
    domains = get_domains(dbcoll)
    d=runner.crawl(MunchSpider,s_u=dois,
             a_d=domains,
             dbcoll=dbcoll,
             errorfile=errorfile)
    #runner.start()
    d2=d.addBoth(lambda _: reactor.stop())
    d2.addCallback(lambda _: finalise_file(outfile))
    d2.addCallback(lambda _: finalise_file(errorfile))
    reactor.run()
    return finished
