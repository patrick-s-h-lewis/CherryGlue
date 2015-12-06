# -*- coding: utf-8 -*-
import scrapy
import CherryPick.items as items
import re
import json

class PickSpider(scrapy.Spider):
    name = "Pick"
    
    def __init__(self, *args, **kwargs):
        super(PickSpider, self).__init__(*args, **kwargs)
        self.start_urls = kwargs['s_u']
        self.allowed_domains = kwargs['a_d']+['api.crossref.org']

    def parse(self, response):
        fails=0
        target_space = '//body'
        include_tags = True
        if include_tags:
            target = response.xpath(target_space).extract()[0]
        else:
            target = response.xpath(target_space).xpath('string(.)').extract()[0] 
        all_dois = find_dois(target)
        api_stub = 'http://api.crossref.org/works/'
        for doi in all_dois:
            yield scrapy.Request(api_stub+doi+'/agency',callback=self.parse_agency,meta={'doi':doi,'api_stub':api_stub})

    def parse_agency(self,response):
        if not(response.body_as_unicode()==u'Resource not found.'):
            doi = response.meta['doi']
            api_stub = response.meta['api_stub']
            js = json.loads(response.body_as_unicode())
            ag= js['message']['agency']['id']
            if (ag==u'crossref'):
                yield scrapy.Request(api_stub+doi,callback=self.parse_crossref, meta={'doi':doi})
            else:
                item = items.DoiItem()
                item['doi']=doi
                item['cross_ref_doi']=False
                print('DOI scraped')
                yield item
        else:
            print('Lost record')   

    
    def parse_crossref(self,response):
        if not(response.body_as_unicode()==u'Resource not found.'):
            js2 = json.loads(response.body_as_unicode())
            item = items.DoiItem()
            item['doi']=response.meta['doi']
            item['cross_ref_doi']=True
            item['title']=js2['message']['title'][0]
            print('Doi scraped')
            yield item
        else:
            print('lost record')        
    
def find_dois(txt):
    #regex modified from http://stackoverflow.com/questions/27910/finding-a-doi-in-a-document-or-page
    #Alix Axel's regex, with modifications http://stackoverflow.com/users/89771/alix-axel     #found on stackoverflow
    doi_re = re.compile(r'\b(10[.][0-9]{3,}(?:[.][0-9]+)*/(?:(?!["&\'()])\S)+)')
    all_dois = doi_re.findall(txt)
    cleans =  [clean_doi(d) for d in all_dois]
    return list(set(cleans)) #uniqify
    

    
def clean_doi(d):
     if d[-1] in '.,':
         d=d[:-1]
     ###strip trailing html tags
     clean = re.sub(r'<[^>]+>$','',d)
     return clean 