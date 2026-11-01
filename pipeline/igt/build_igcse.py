import json, re, sys, os
sys.path.insert(0, '/home/claude')
import build
import importlib.util as _u; _s=_u.spec_from_file_location('igc','/home/claude/igt/classify.py'); _m=_u.module_from_spec(_s); _s.loader.exec_module(_m); TOPICS=_m.TOPICS
d = json.load(open('seg.json')); tags = json.load(open('final_tags.json'))
TOPICS = dict(TOPICS); TOPICS[0] = 'Pre-release material tasks (2015-2022)'
SO = {'w': 0, 's': 1, 'm': 2}
def key(item):
    p = build.parse_stem(item['stem'])
    return (-p['year'], SO[p['sess']], p['variant'], item['q'])
OUT = '/home/claude/igt/topicals'; os.makedirs(OUT, exist_ok=True)
only = [int(x) for x in sys.argv[1:]] or sorted(TOPICS)
for t in only:
    items = []
    for k, v in tags.items():
        if t not in v: continue
        base, n = k.split('#'); n = int(n)
        q = d[base]['qp'][n - 1]
        ms = d[base]['ms'][n - 1] if n - 1 < len(d[base]['ms']) else None
        parts = [[f[0] - 1, f[1], f[2], f[3], f[4]] for f in q['frags']]
        it = dict(stem=base, q=n, parts=parts)
        if ms and ms['frags']:
            it['ms_stem'] = base.replace('_qp_', '_ms_')
            it['ms_parts'] = [[f[0] - 1, f[1], f[2], f[3], f[4]] for f in ms['frags']]
        items.append(it)
    items.sort(key=key)
    papers = sorted({build.parse_stem(i['stem'])['paper'] for i in items})
    plabel = 'Paper ' + ' & '.join(papers)
    name = f'Topic {t} - {TOPICS[t]}.pdf' if t else 'Pre-release tasks (2015-2022).pdf'
    n, yt = build.build_chapter('0478', items, f'{OUT}/{name}', TOPICS[t], 'IGCSE Computer Science', '0478', plabel)
    print(name, n, yt, os.path.getsize(f'{OUT}/{name}') // 1_000_000, 'MB', flush=True)
