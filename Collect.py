import json
import os
import pickle
from twisted.internet import reactor
from scrapy.crawler import CrawlerRunner
from scrapy.settings import Settings
from CherryPick.spiders.Pick import PickSpider
from CherryPick.spiders.Shake import ShakeSpider
        
def getCurrentConfigs():
    with open('CurrentConfig.txt','r') as f:
        conf = pickle.load(f)
    return conf
    
def finalise_file(file):
    with open(file,'ab+') as f:
        f.write('{}]')

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
        
def get_joblist(infile):
    joblist =[]
    with open(infile) as f:
       j=json.load(f)
       for job in j:
           if job['type']=='pick':
               domain = job['url'].split('/')[1]
               joblist.append([[job['url']],[domain]])
    return joblist

configs = getCurrentConfigs()
settings = Settings()
settings.set('ITEM_PIPELINES', {
    'Collect.CherryPipeline': 100
})

settings.set('LOG_ENABLED',False)
settings.set('FILE_NAME',configs.doifile)

joblist = get_joblist(configs.infile)
runner = CrawlerRunner(settings)
for job in joblist:
    runner.crawl(PickSpider,s_u=job[0],a_d=job[1])
d=runner.join()
d2 = d.addBoth(lambda _:reactor.stop())
d2.addCallback(lambda _:finalise_file(configs.doifile))
try:
    reactor.run()
except:
    print('hack')
