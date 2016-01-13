import json
import os
import pickle
from twisted.internet import reactor
from scrapy.crawler import CrawlerRunner
from scrapy.settings import Settings
import Spiders.MunchSpider
import pymongo
from pymongo import MongoClient
import Pipelines.CherryPipelines
from scrapy.utils.log import configure_logging


def getCurrentConfigs():
    with open('CurrentConfig.txt','r') as f:
        conf = pickle.load(f)
    return conf

def finalise_file(file):
    with open(file,'rb+') as f:
        f.seek(-2, os.SEEK_END)
        f.truncate()
        f.write(']')

def connect(mongo_url,db,coll):
    client = MongoClient(mongo_url)
    ca = client[db][coll]
    return ca

def get_dois(infile):
    stub = 'http://dx.doi.org/'
    doi_links=[]
    doi_sources = {}
    with open(infile) as f:
        j = json.load(f)
        for rec in j:
            doi_link = stub+rec['doi'] 
            doi_links.append(doi_link)
            doi_sources[rec['doi']]=rec['source_url']
    return (doi_links,doi_sources)
    
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
    'Pipelines.CherryPipelines.CherryPipeline': 100
})

settings.set('FILE_NAME',configs.resultsfile)

configure_logging({'LOG_FORMAT': '%(levelname)s: %(message)s'})

runner=CrawlerRunner(settings)
(doi_links,doi_sources) = get_dois(configs.doifile)
domains = get_domains(dbcoll)
d=runner.crawl(Spiders.MunchSpider.MunchSpider,
         s_u=doi_links,
         d_s = doi_sources,
         a_d=domains,
         dbcoll=dbcoll,
         errorfile=configs.errorfile
         )
d2=d.addBoth(lambda _: reactor.stop())
d2.addCallback(lambda _: finalise_file(configs.resultsfile))
d2.addCallback(lambda _: finalise_file(configs.errorfile))
try:
    reactor.run()
except:
    print('hack')