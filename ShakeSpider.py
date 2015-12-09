# -*- coding: utf-8 -*-
import scrapy
import CherryPick.items as items
import re
import requests
import json

class ShakeSpider(scrapy.Spider):
    name = "Shake"
    allowed_domains = ['opus.bath.ac.uk','api.crossref.org']
    start_urls = (
        'http://opus.bath.ac.uk/view/divisions/dept=5Fchem.html',
    )

    def parse(self, response):
        fails=0
        list_path = '//body/div[1]/div[2]/div[2]/div[1]/div[4]/div[@class="ep_view_citation_row"]'
        record_path = 'div[1]/a/@href'
        for rec in response.xpath(list_path):
            link = rec.xpath(record_path).extract()[0]
            yield scrapy.Request(link, callback = self.parse_page_2)

    
    def parse_page_2(self,response):
        include_tags = False
        if include_tags:
            target = response.xpath('//body').extract()[0]
        else:
            target = response.xpath('//body').xpath('string(.)').extract()[0] 
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
                yield item

    
    def parse_crossref(self,response):
        if not(response.body_as_unicode()==u'Resource not found.'):
            js2 = json.loads(response.body_as_unicode())
            item = items.DoiItem()
            item['doi']=response.meta['doi']
            item['cross_ref_doi']=True
            item['title']=js2['message']['title'][0]
            yield item
        
    
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