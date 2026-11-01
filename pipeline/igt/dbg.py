import sys,re
from segment import *
f=sys.argv[1]; rng=sys.argv[2:] 
pg=pages(SRC+'/'+f)
for i,p in enumerate(pg):
    t,b,body=content(p)
    for l in body:
        if re.match(r'^\d{1,2}',l['first']) and l['x']<200: print(i,round(l['x']),round(l['y0']),repr(l['text'][:60]))
