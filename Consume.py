import json
import os
import pickle
from twisted.internet import reactor
from scrapy.crawler import CrawlerRunner
from scrapy.crawler import CrawlerProcess
from scrapy.settings import Settings
from CherryPick.spiders.Munch import MunchSpider
import pymongo
from pymongo import MongoClient
        
def getCurrentConfigs():
    with open('CurrentConfig.txt','r') as f:
        conf = pickle.load(f)
    return conf

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

configs=getCurrentConfigs()

dbcoll=connect(configs.connection,
    configs.database,
    configs.pubs_collection
    )

settings = Settings()
settings.set('ITEM_PIPELINES', {
    'Consume.CherryPipeline': 100
})

settings.set('LOG_ENABLED',False)
settings.set('FILE_NAME',configs.resultsfile)

dois = get_dois(configs.doifile)

runner=CrawlerRunner(settings)
dois = get_dois(configs.doifile)
domains = get_domains(dbcoll)
d=runner.crawl(MunchSpider,s_u=dois,
         a_d=domains,
         dbcoll=dbcoll,
         errorfile=configs.errorfile)
d2=d.addBoth(lambda _: reactor.stop())
d2.addCallback(lambda _: finalise_file(configs.resultsfile))
d2.addCallback(lambda _: finalise_file(configs.errorfile))
try:
    reactor.run()
except:
    print('hack')