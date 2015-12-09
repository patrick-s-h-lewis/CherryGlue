import json
import os
import pickle
from twisted.internet import reactor
import scrapy
from scrapy.crawler import CrawlerRunner
from scrapy.settings import Settings
from scrapy.utils.log import configure_logging
import PickSpider
import CherryPipelines

def getCurrentConfigs():
    with open('CurrentConfig.txt','r') as f:
        conf = pickle.load(f)
    return conf
    
def finalise_file(file):
    with open(file,'ab+') as f:
        f.write('{}]')
        
def get_joblist(infile):
    joblist =[]
    with open(infile) as f:
       j=json.load(f)
       for job in j:
           if job['type']=='pick':
               domain = job['url'].split('/')[2]
               joblist.append(([job['url']],[domain]))
    return joblist

print('hello')
configs = getCurrentConfigs()
settings = Settings()
settings.set('ITEM_PIPELINES', {
    'CherryPipelines.CherryPipeline': 100
})
settings.set('RETRY ENABLED',True)
settings.set('RETRY_TIMES',10)

#settings.set('LOG_ENABLED',True)
settings.set('FILE_NAME',configs.doifile)
#configure_logging({'LOG_FORMAT': '%(levelname)s: %(message)s'})

joblist = get_joblist(configs.infile)
runner = CrawlerRunner(settings)
'''for job in joblist:
    runner.crawl(PickSpider.PickSpider,s_u=job[0],a_d=job[1])
d=runner.join()'''
d=runner.crawl(PickSpider.PickSpider,s_u=[i[0][0] for i in joblist],a_d=joblist[0][1])
d2 = d.addBoth(lambda _:reactor.stop())
d2.addCallback(lambda _:finalise_file(configs.doifile))
reactor.run()
