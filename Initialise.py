#Initialise Run
import CherryConfigs
from datetime import datetime 
import os
import pickle
import sys

configs = CherryConfigs.CherryConfigs()
if len(sys.argv)>1:
    configs.infile = sys.argv[1]
with open('CurrentConfig.txt','w') as f:
    pickle.dump(configs,f)
os.mkdir(configs.subdir)

with open(configs.resultsfile,'wb+') as f:
    f.write('[')

with open(configs.doifile,'wb+') as f:
    f.write('[')

with open(configs.errorfile,'wb+') as f:
    f.write('[')
    
with open(configs.reportfile,'wb+') as f:
    pass

print('initialised')