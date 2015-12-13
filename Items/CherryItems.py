# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html
import scrapy


class DoiItem(scrapy.Item):
    # define the fields for your item here like:
    doi = scrapy.Field()
    source_url = scrapy.Field()
    cross_ref_doi = scrapy.Field()
    title = scrapy.Field()
    
class CompleteItem(scrapy.Item):
    doi = scrapy.Field()
    title = scrapy.Field()
    abstract = scrapy.Field()
    authors = scrapy.Field()
    affiliations = scrapy.Field()
    date = scrapy.Field()
    publisher = scrapy.Field()
    source_url = scrapy.Field()
    
class SeekItem(scrapy.Item):
    url = scrapy.Field()
    type = scrapy.Field()