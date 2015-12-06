import json
import re
import datetime
import pickle

def getCurrentConfig():
    with open('CurrentConfig.txt','r') as f:
        conf = pickle.load(f)
    return conf

configs = getCurrentConfig()
with open(configs.resultsfile,'r') as sr:
    with open(configs.errorfile,'r') as fr:
        s = json.load(sr)
        f = json.load(fr)
        coll_no=0
        time_no=0
        miss_no=0
        coll_l=[]
        time_l=[]
        miss_l=[]
        pub_l =[]
        s.remove({})
        f.remove({})
        for rec in f:
            if rec['error']=='collection':
                coll_no+=1
                coll_l.append(rec)
            if rec['error']=='timeout':
                time_no+=1
                time_l.append(rec)
            if rec['error']=='missing_pub':
                miss_no+=1
                miss_l.append(rec)
        for rec in s:
            pub_l.append(rec['publisher'])
            
success_no=len(s)
fail_no=len(f)
parse_no = success_no+fail_no
conv_no = float(success_no)/float(parse_no)
coll_pub = [r['pub'] for r in coll_l]
miss_pub = [r['pub'] for r in miss_l]
with open(configs.reportfile,'ab+') as f:
    f.write('*'*70+'\n')
    f.write("Analysis of scraping run performed at "+datetime.datetime.now().strftime('%H:%m %d %B %Y')+'\n')
    f.write('*'*70+'\n'+'\n')
    f.write('Total records parsed:                             '+ str(parse_no)+'\n')
    f.write('Total records successfully collected:             ' + str(success_no)+'\n')
    f.write('Conversion rate:                                  '+'%.4f'%(conv_no*100)+'%'+'\n')
    f.write('\n'+'\n')
    f.write('-'*70+'\n')
    f.write('Losses Breakdown:'+'\n')
    f.write('-'*70+'\n'+'\n')
    f.write('Total No. of records not converted:               '+ str(fail_no)+'\n')
    f.write('No. lost due to errors in collection:             '+ str(coll_no)+'\n')
    f.write('No. lost due to request timeouts:                 '+ str(time_no)+'\n')
    f.write('No. lost due to missing publisher info:           '+str(miss_no)+'\n')
    f.write('\n'+'\n')
    f.write('-'*70+'\n')
    f.write('Collection Errors Breakdown:'+'\n')
    f.write('-'*70+'\n'+'\n')
    f.write('Most collection errors for publisher:           '+max(set(coll_pub), key=coll_pub.count)+'\n')
    f.write('\n'+'\n')
    f.write('Publisher                                   no. of errors')
    f.write('\n')
    for i in set(coll_pub):
        pad = len(i)
        f.write(i+' '*(50-pad)+str(coll_pub.count(i)) +'\n')
    f.write('\n'+'\n')
    f.write('-'*70+'\n')
    f.write('Missing publisher Errors Breakdown:'+'\n')
    f.write('-'*70+'\n'+'\n')
    f.write('Most frequent missing publisher:                '+max(set(miss_pub), key=miss_pub.count)+'\n')
    f.write('\n'+'\n')
    f.write('Publisher                                number of records')
    f.write('\n')
    for i in set(miss_pub):
        pad = len(i)
        f.write(i+' '*(50-pad)+str(miss_pub.count(i)) +'\n')
    f.write('-'*70+'\n')
    f.write('Scraped Publisher Breakdown:'+'\n')
    f.write('-'*70+'\n'+'\n')
    f.write('Most frequent publisher:                        '+max(set(pub_l), key=pub_l.count)+'\n')
    f.write('\n'+'\n')
    f.write('Publisher                                number of records')
    f.write('\n')
    for i in set(pub_l):
        pad = len(i)
        f.write(i+' '*(50-pad)+str(pub_l.count(i)) +'\n')
    f.write('\n'+'*'*70)
print('Scraping Run Analysed.')
