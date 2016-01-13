#GiantSpider
import scrapy
from Items import CherryItems
import re
import json
import datetime
import CrossRefTools

class CrossRefSpider(scrapy.Spider):
    name = "Giant"
    
    def __init__(self, *args, **kwargs):
        super(CrossRefSpider, self).__init__(*args, **kwargs)
        self.start_urls = kwargs['s_u']
        self.allowed_domains = ['api.crossref.org']
        self.stub = kwargs['s_u'][0][:-1]
        self.pagination=0
    
    def parse(self,response):
        if not(response.body_as_unicode()==u'Resource not found.'):
            message = json.loads(response.body_as_unicode())
            for mess in message['message']['items']:
                item = CrossRefTools.get_crossref_item(mess)
                item['crossref_doi']=True
                item['source_url']='CrossRef'
                print('Record scraped')
                yield item
            curs = message['message']['next-cursor']
            print(curs)
            next_url = self.stub+curs
            self.pagination+=1
            if self.pagination<100:
                yield scrapy.Request(next_url,callback=self.parse)
        else:
            print('Lost record')