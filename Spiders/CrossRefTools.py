from Items import CherryItems
import datetime

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
    try:
        e_date = pub_date.strftime('%d %B %Y')
    except:
        e_date = '01 January 1900'
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