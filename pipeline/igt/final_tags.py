import json, re, collections, sys
sys.path.insert(0, '/home/claude/igt')
from classify import topics_allowed
T = json.load(open('tags.json'))
d = json.load(open('seg.json'))
ov = {}
for f in ('overrides1.json', 'overrides2.json', 'overrides3.json'):
    ov.update(json.load(open(f)))
def ovr(base, n):
    key = f"{base[5:]}#{n}"
    for k, v in ov.items():
        if re.fullmatch(k, key): return v
    return None
CODE = re.compile(r'(←|\bINPUT\b|\bOUTPUT\b|\bFOR\b.*\bTO\b|\bNEXT\b|\bREPEAT\b|\bUNTIL\b|\bWHILE\b|\bDECLARE\b|\bENDIF\b|\bTHEN\b|\bSTART\b|trace table|write an algorithm|program code|pseudocode|flowchart)')
out = {}
for o in T:
    base, n = o['base'], o['n']
    q = d[base]['qp'][n - 1]
    tops = set(o['topics'])
    p = base.split('_')[3][0]
    allowed = topics_allowed(base)
    t = q['text']
    if tops != {0}:
        if p == '1' and re.search(r'sensor', t, re.I) and re.search(r'microprocessor|actuator|automat', t, re.I):
            tops |= {3, 6} & set(allowed) | ({3} if 3 in allowed else set())
            if 6 not in allowed: tops.discard(6)
        if p == '2' and (tops & {7, 8}) and CODE.search(t):
            tops |= {7, 8}
        v = ovr(base, n)
        if v is not None:
            tops = set(v)
    out[f'{base}#{n}'] = sorted(tops)
json.dump(out, open('final_tags.json', 'w'))
c = collections.Counter(t for v in out.values() for t in v)
print('questions', len(out), 'multi', sum(1 for v in out.values() if len(v) > 1), sorted(c.items()))
