import json, re, collections, sys
sys.path.insert(0, '/home/claude/igt')
from classify import KW, STRONG, TOPICS, topics_allowed, prerelease
d = json.load(open('/home/claude/igt/seg.json'))
def norm(t): return ' ' + re.sub(r'\s+', ' ', t.lower()).replace('’', "'") + ' '
out = []
for base, v in d.items():
    allowed = topics_allowed(base)
    for i, q in enumerate(v['qp']):
        ms = v['ms'][i]['text'] if i < len(v['ms']) else ''
        tq = norm(q['text']); tm = norm(ms)
        if prerelease(base, q['text']):
            out.append(dict(base=base, n=q['n'], topics=[0], head=q['text'][:140])); continue
        feat = {}
        for k in allowed:
            ds = sum(1 for w in STRONG[k] if w.replace('’', "'") in tq)
            dsm = sum(1 for w in STRONG[k] if w.replace('’', "'") in tm)
            dk = sum(1 for w in KW[k] if w in tq)
            sc = 4 * ds + dk + 1.5 * dsm
            feat[k] = (sc, ds, dk, dsm)
        best = max(feat, key=lambda k: feat[k][0])
        tops = [best]
        for k, (sc, ds, dk, dsm) in feat.items():
            if k == best: continue
            if (ds >= 2) or (ds >= 1 and dk >= 3) or (ds >= 1 and dsm >= 2):
                tops.append(k)
        out.append(dict(base=base, n=q['n'], topics=sorted(tops), primary=best, feat={k: feat[k] for k in tops}, head=re.sub(r'\s+', ' ', q['text'])[:150]))
json.dump(out, open('/home/claude/igt/tags.json', 'w'))
c = collections.Counter(t for o in out for t in o['topics'])
print('questions', len(out), 'multi-topic', sum(1 for o in out if len(o['topics']) > 1))
print(sorted(c.items()))
