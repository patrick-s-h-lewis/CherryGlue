from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor
import CherryItems
import re

class SeekSpider(CrawlSpider):
  name = 'Seek'
  rules = (Rule(LinkExtractor(allow=()), callback='parse_obj', follow=True),)
  
  def __init__(self, *args, **kwargs):
        super(SeekSpider, self).__init__(*args, **kwargs)
        self.start_urls = kwargs['s_u']
        self.allowed_domains = kwargs['a_d']
        #self.rules = (Rule(LinkExtractor(allow=()), callback='parse_obj', follow=True),)

  def parse_obj(self,response):
    print(response.url)
    dois = find_dois(response.xpath('string(//body)').extract()[0])
    print(len(dois))
    if not(dois==[]):
        item = CherryItems.SeekItem()
        item['url'] = response.url
        item['type'] = 'pick'
        yield item
        
def find_dois(txt):
    #regex modified from http://stackoverflow.com/questions/27910/finding-a-doi-in-a-document-or-page
    #Alix Axel's regex, with modifications http://stackoverflow.com/users/89771/alix-axel     #found on stackoverflow
    doi_re = re.compile(r'\b(10[.][0-9]{3,}(?:[.][0-9]+)*/(?:(?!["&\'()])\S)+)')
    all_dois = doi_re.findall(txt)
    return all_dois