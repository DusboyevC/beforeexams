import markdown, glob, os, re, json
SUB = {'9618': 'cs', '9702': 'physics', '9709': 'maths', '9701': 'chemistry', '9700': 'biology', '0478': 'ig-cs'}
OUT = '/home/claude/web/out/notes'
L = json.load(open('/home/claude/web/out/assets/library.json'))
notes = []
for code, key in SUB.items():
    os.makedirs(f'{OUT}/{key}', exist_ok=True)
    for f in sorted(glob.glob(f'/home/claude/notes/{code}/*.md')):
        txt = open(f).read()
        fm = re.match(r'^---\n(.*?)\n---\n', txt, re.S)
        meta = dict(l.split(': ', 1) for l in fm.group(1).split('\n')) if fm else {}
        body = txt[fm.end():] if fm else txt
        html = markdown.markdown(body, extensions=['tables', 'fenced_code', 'sane_lists'])
        slug = os.path.basename(f)[:-3]
        open(f'{OUT}/{key}/{slug}.html', 'w').write(html)
        notes.append([key, meta.get('chapter', ''), meta.get('title', slug), f'/notes/{key}/{slug}.html', meta.get('paper', '')])
def order(n):
    parts = re.findall(r'\d+', n[1]) or ['0']
    return (n[0], [int(p) for p in parts])
notes.sort(key=order)
L['notes'] = notes
json.dump(L, open('/home/claude/web/out/assets/library.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(notes), 'notes')
