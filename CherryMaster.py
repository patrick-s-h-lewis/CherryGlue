import Consume
import Analyse
#import Collect

infile = 'in.json'
outfile = 'out.json'
errorfile = 'errorfile.json'
resultsfile = 'records.json'
reportfile = 'stats.json'
connection = 'mongodb://localhost:6666/'
#connection = 'mongodb://localhost:27017/' #local
database = 'Cherry'
collection = 'CherryMunch'

#Collect.main(infile,outfile)
    
print('Collection finished')
Consume.main(outfile,
    resultsfile,
    errorfile,
    connection,
    database,
    collection)

#Analyse.main(reportfile,resultsfile,errorfile)'''