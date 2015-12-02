import json
import os
from twisted.internet import reactor
from scrapy.crawler import CrawlerRunner
from scrapy.settings import Settings
from CherryPick.spiders.Pick import PickSpider
from CherryPick.spiders.Shake import ShakeSpider

def initialise_file(file):
    with open(file,'ab+') as f:
        f.write('[')
        
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
        print('pipeline_built')
        self.file = open(file_name, 'ab+')

    def process_item(self, item, spider):
        line = json.dumps(dict(item)) + ",\n"
        self.file.write(line)
        return item
    
    def close_spider(self,spider):
        self.file.close()

def runcrawl(joblist,settings,outfile):
    runner = CrawlerRunner(settings)
    for job in joblist:
        runner.crawl(PickSpider,s_u=job[0],a_d=job[1])
    d=runner.join()
    d2 = d.addBoth(lambda _:reactor.stop())
    reactor.run()
    return d2
        
def get_joblist(infile):
    joblist =[]
    with open(infile) as f:
       j=json.load(f)
       for job in j:
           if job['type']=='pick':
               domain = job['url'].split('/')[1]
               joblist.append([[job['url']],[domain]])
    return joblist
 
    
# instantiate settings and provide a custom configuration
infile = 'in.json'
outfile = 'out.json'
settings = Settings()
settings.set('ITEM_PIPELINES', {
    '__main__.CherryPipeline': 100
})

settings.set('LOG_ENABLED',False)
settings.set('FILE_NAME',outfile)

joblist = get_joblist(infile)
initialise_file(outfile)
d2 = runcrawl(joblist,settings,outfile)
d2.addCallback(lambda _:finalise_file(outfile))