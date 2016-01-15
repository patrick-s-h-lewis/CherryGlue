import json
import os
import pickle
from twisted.internet import reactor
import scrapy
from scrapy.crawler import CrawlerRunner
from scrapy.settings import Settings
from scrapy.utils.log import configure_logging
import Spiders.CrossRefSpider
import Pipelines.CherryPipelines

def getCurrentConfigs():
    with open('CurrentConfig.txt','r') as f:
        conf = pickle.load(f)
    return conf
    
def finalise_file(file):
    with open(file,'rb+') as f:
        f.seek(-2, os.SEEK_END)
        f.truncate()
        f.write(']')
        
def get_url(query):
    stub1 = 'http://api.crossref.org/works?filter=type:journal-article&rows=1000'
    stub2 = 'cursor=*'
    return '&'.join([stub1,'query='+query,stub2])

configs = getCurrentConfigs()
settings = Settings()
settings.set('ITEM_PIPELINES', {
    'Pipelines.CherryPipelines.CherryPipeline': 100
})
settings.set('RETRY ENABLED',True)
settings.set('RETRY_TIMES',10)

#settings.set('LOG_ENABLED',True)
settings.set('FILE_NAME',configs.doifile)
configure_logging({'LOG_FORMAT': '%(levelname)s: %(message)s'})

joblist = get_url('chemistry')
runner = CrawlerRunner(settings)
'''for job in joblist:
    runner.crawl(PickSpider.PickSpider,s_u=job[0],a_d=job[1])
d=runner.join()'''
d=runner.crawl(Spiders.CrossRefSpider.CrossRefSpider,s_u=[joblist])
d2 = d.addBoth(lambda _:reactor.stop())
d2.addCallback(lambda _:finalise_file(configs.doifile))
reactor.run()