# -*- coding: utf-8 -*-
import scrapy
import Items.CherryItems
import re
import json
from datetime import datetime
import re
import pymongo
from pymongo import MongoClient
import sys
import os
from scrapy.spiders import CrawlSpider
from scrapy.http import Request
import traceback
from twisted.internet.error import TimeoutError


def dump_record(record,file):
    with open(file,'a') as f:
        json.dump(record,f,sort_keys=True,indent=4,ensure_ascii=True)
        fd.write(',')


class MunchSpider(CrawlSpider):
    name = "Munch"
    losses = 0
    progress = 0

    def __init__(self, *args, **kwargs):
        super(MunchSpider, self).__init__(*args, **kwargs)
        self.start_urls = kwargs['s_u']
        self.allowed_domains = kwargs['a_d']
        self.dbcoll = kwargs['dbcoll']
        self.errorfile = kwargs['errorfile']
        self.doi_sources = kwargs['d_s']
    
    def dump_record(self,record):
        with open(self.errorfile,'a') as f:
            json.dump(record,f,sort_keys=True,indent=4,ensure_ascii=True)
            f.write(',')
        
    def get_pub_paths(self,publisher):
    ###to do, build database with all of these
        cur = self.dbcoll.find({'pub_website':publisher})
        if cur.count()==0:
            raise Exception('no publisher website found') 
        return cur

    def choose_items(self,itemlist):
        if len(itemlist)==1:
            return itemlist[0]
        else:
            scores=[]
            for it in itemlist:
                score = 0
                for k,v in it.items():
                    if type(v)=='str':
                        v=v.strip()
                        if not(v==u''): score+=1
                    else:
                        if not(v==[]):
                            score+=1
                scores.append(score)
            return itemlist[scores.index(max(scores))]
    
    def start_requests(self):
        total = len(self.start_urls)
        for url in self.start_urls:
            doi = url.replace('http://dx.doi.org/','')
            yield Request(url, meta={'doi': doi,'source_url':self.doi_sources[doi]},
                callback=self.parse)
    
    def parse(self, response):
        print(self.progress)
        self.progress+=1
        pub=response.url.split('/')[2]
        try:
            paths_list = self.get_pub_paths(pub)
            die=False
        except:
            die=True 
            print('Missing Publisher Fail')
            rep = {'doi':response.meta['doi'],'error':'missing_pub','pub':pub}
            self.dump_record(rep)
            self.losses+=1
        if not die: 
            itemlist = []
            for paths in paths_list:
                try:
                    item=self.get_item(response,paths)
                    itemlist.append(item)
                except:
                    traceback.print_exc(file=sys.stdout)
                    pass
            try:
                item = self.choose_items(itemlist)
                yield item
            except:
                print('Collection Fail')
                rep = {'doi':response.meta['doi'],'error':'collection','pub':pub}
                self.dump_record(rep)
                self.losses+=1
    
    def get_item(self, response, paths):
        title= response.xpath(paths['x_title']).extract()[0]
        abstract = response.xpath(paths['x_abstract']).extract()[0]
        people = response.xpath(paths['x_people'])
        depts = response.xpath(paths['x_depts'])
        pex=[]
        dex=[]
        for person in people:
            p = person.xpath(paths['x_person']).extract()
            if not(p==[])and (len(p)==1):
                pex.append(p[0])
            else:
                pex.append(p)
        for dept in depts:
            d = dept.xpath(paths['x_dept']).extract()
            if not(d==[]):
                dex.append(d[0])
        exec paths['name_con']
        date = response.xpath(paths['x_date']).extract()[0]
        exec paths['date_con']
        dex = list(set(dex))
        pex = list(set(pex))
        item = Items.CherryItems.CompleteItem()
        item['doi'] = response.meta['doi']
        item['title'] = re.sub('\n','',title)
        item['abstract'] = re.sub('\n','',abstract)
        item['authors'] = pex
        item['affiliations'] = dex
        item['date'] = date.strftime('%d %B %Y')
        item['publisher'] = paths['publisher']
        item['source_url'] = response.meta['source_url']
        return item