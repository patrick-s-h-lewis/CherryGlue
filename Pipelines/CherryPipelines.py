import json
from scrapy.exceptions import DropItem

class CherryPipeline(object):
    @classmethod
    def from_crawler(cls,crawler):
        settings = crawler.settings
        file_name=settings.get('FILE_NAME')
        return cls(file_name)
        
    def __init__(self,file_name):
        self.file = open(file_name, 'ab+')
        self.dois_seen = set()

    def process_item(self, item, spider):
        if item['doi'] in self.dois_seen:
            raise DropItem("Duplicate doi found")
        else:
            self.dois_seen.add(item['doi'])
            line = json.dumps(dict(item)) + ",\n"
            self.file.write(line)
            return item
    
    def close_spider(self,spider):
        self.file.close()
        
class SeekPipeline(object):
    @classmethod
    def from_crawler(cls,crawler):
        settings = crawler.settings
        file_name=settings.get('FILE_NAME')
        scrapy_stats_file=settings.get('SCRAPY_FILE_NAME')
        return cls(file_name,scrapy_stats_file)
        
    def __init__(self,file_name,scrapy_stats_file):
        self.file = open(file_name, 'ab+')
        self.scrapy_stats_file = scrapy_stats_file
        self.urls_seen = set()

    def process_item(self, item, spider):
        if item['url'] in self.urls_seen:
            raise DropItem("Duplicate url found")
        else:
            self.urls_seen.add(item['url'])
            line = json.dumps(dict(item)) + ",\n"
            self.file.write(line)
            return item
    
    def close_spider(self,spider):
        with open(self.scrapy_stats_file,'w') as f:
            stats=spider.crawler.stats.get_stats()
            for k in stats:
                f.write(str(k)+' : ' + str(stats[k]))
        self.file.close()