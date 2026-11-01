import json, re, sys
T = {(o['base'], o['n']): o for o in json.load(open('tags.json'))}
d = json.load(open('seg.json'))
sel = sys.argv[1]
for base, v in d.items():
    if not re.search(sel, base): continue
    for q in v['qp']:
        o = T[(base, q['n'])]
        if o['topics'] == [0]: continue
        lines = [re.sub(r'\.{3,}|…+', '', l).strip() for l in q['text'].split('\n')]
        lines = [l for l in lines if len(l) > 3 and not re.fullmatch(r'[\[\]\d\s]+', l)]
        stem = lines[0][:110] if lines else ''
        parts = []
        for l in lines[1:]:
            if re.match(r'^\((?:[a-h]|i{1,3}|iv|v)\)', l):
                parts.append(re.sub(r'\[\d+\]', '', l)[:75])
        print(f"{base[5:]}#{q['n']} {o['topics']} | {stem} || " + ' / '.join(parts)[:420])
