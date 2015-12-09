import json
import os
import pickle
from twisted.internet import reactor
import scrapy
from scrapy.crawler import CrawlerRunner
from scrapy.settings import Settings
from scrapy.utils.log import configure_logging
import SeekSpider
import CherryPipelines
    
def finalise_file(file):
    with open(file,'ab+') as f:
        f.write('{}]')

outfile = 'scrapeme.json'
settings = Settings()
settings.set('ITEM_PIPELINES', {
    'CherryPipelines.SeekPipeline': 100
})
settings.set('RETRY ENABLED',True)
settings.set('RETRY_TIMES',10)

#settings.set('LOG_ENABLED',True)
settings.set('FILE_NAME',outfile)
configure_logging({'LOG_FORMAT': '%(levelname)s: %(message)s'})

runner = CrawlerRunner(settings)
runner.crawl(
    SeekSpider.SeekSpider,
    s_u=['http://www.abdn.ac.uk/ncs/departments/chemistry/index.php'],
    a_d=['www.abdn.ac.uk']
    )
d=runner.join()
d2 = d.addBoth(lambda _:reactor.stop())
d2.addCallback(lambda _:finalise_file(outfile))
reactor.run()
