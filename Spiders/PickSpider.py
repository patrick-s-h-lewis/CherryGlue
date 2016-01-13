# -*- coding: utf-8 -*-
import scrapy
from Items import CherryItems
import re
import json
import datetime

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
            yield scrapy.Request(
                api_stub+doi+'/agency',
                callback=self.parse_agency,
                meta={
                    'doi':doi,
                    'api_stub':api_stub,
                    'source_url':response.url
                    }
                )

    def parse_agency(self,response):
        if not(response.body_as_unicode()==u'Resource not found.'):
            doi = response.meta['doi']
            api_stub = response.meta['api_stub']
            js = json.loads(response.body_as_unicode())
            ag= js['message']['agency']['id']
            if (ag==u'crossref'):
                yield scrapy.Request(
                    api_stub+doi,callback=self.parse_crossref,
                    meta={'doi':doi,
                        'source_url':response.meta['source_url']
                        }
                    )
            else:
                item = CherryItems.CrossRefItem()
                item['doi']=doi
                item['crossref_doi']=False
                item['source_url']=response.meta['source_url']
                print('DOI scraped')
                yield item
        else:
            print('Lost record')   

    
    def parse_crossref(self,response):
        if not(response.body_as_unicode()==u'Resource not found.'):
            message = json.loads(response.body_as_unicode())
            item = get_crossref_item(message['message'])
            item['crossref_doi']=True
            item['source_url']=response.meta['source_url']
            print('Doi scraped')
            yield item
        else:
            print('Lost record')        
    
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
     
def get_author(auth):
    clean_given = ''
    family = ''
    kys = auth.keys()
    if 'given' in kys:
        given = auth['given']
        clean_given = ''.join([i[0] for i in given.strip().split(' ')])
    if 'family' in kys:
        family = auth['family']
    return (clean_given+' '+family).strip()

def get_aff(auth):
    affs = []
    for aff in auth['affiliation']:
        affs.append(aff['name'])
    return affs

def get_pub(pub_list):
    return pub_list

def get_journal(journal_list):
    if len(journal_list)>0:
        journal = journal_list[0]
    else:
        journal = None
    return journal
    

def get_date(mess):
    date_keys = ['published-online',
                 'deposited',
                 'indexed',
                 'published-print',
                 'created',
                 'issued'
                ]
    dates = []
    for dk in date_keys:
        if dk in mess.keys():
            if mess[dk] and mess[dk]['date-parts'][0][0]:
                dates.append(mess[dk]['date-parts'][0])
    pub_dates = []
    for ymd in dates:
        if len(ymd)==1:
            pub_dates.append(datetime.datetime(ymd[0],1,1))
        if len(ymd)==2:
            pub_dates.append(datetime.datetime(ymd[0],ymd[1],1))
        if len(ymd)==3:
            pub_dates.append(datetime.datetime(ymd[0],ymd[1],ymd[2]))
    pub_date = min(pub_dates)
    return pub_date

def get_crossref_item(mess):
    auths=[]
    affs = []
    if 'author' in mess.keys():
        for auth in mess['author']:
            auths.append(get_author(auth))
            aff = get_aff(auth)
            affs+=aff
        affs = list(set(affs))
    pub_date = get_date(mess)
    titles=[]
    for tit in mess['title']:
        titles.append(tit)
    e_doi = mess['DOI']
    e_authors = ', '.join(auths)
    e_date = pub_date.strftime('%d %B %Y')
    e_title = ". ".join(titles)
    e_pub = get_pub(mess['publisher'])
    e_journal = get_journal(mess['container-title'])
    e_abstract = 'PENDING'
    e_affs = '; '.join(affs)
    item = CherryItems.CrossRefItem()
    item['doi'] = e_doi
    item['title'] = e_title
    item['authors'] = e_authors
    item['affiliations'] = e_affs
    item['date'] = e_date
    item['publisher'] = e_pub
    item['journal'] = e_journal
    return item