#Scraping  Configs
import datetime
from datetime import datetime 
import os

class CherryConfigs(object):
    infile_stub = 'in.json'
    doifile_stub = 'dois.json'
    errorfile_stub = 'errors.json'
    resultsfile_stub = 'complete.json'
    reportfile_stub = 'report.txt'
    connection = 'mongodb://localhost:6666/'
    #connection = 'mongodb://localhost:27017/' #local
    database = 'Cherry'
    pubs_collection = 'CherryMunch'
    records_collection = 'CherryComplete'
    doi_collection = 'CherryDoi'
    fileconvention = '%H-%M-%S %d-%m-%y'
    
    def __init__(self):
        now = datetime.now().strftime(self.fileconvention)
        self.subdir = now
        self.doifile = self.subdir+'/'+self.doifile_stub
        self.errorfile = self.subdir+'/'+self.errorfile_stub
        self.resultsfile = self.subdir+'/'+self.resultsfile_stub
        self.reportfile = self.subdir+'/'+self.reportfile_stub
    
