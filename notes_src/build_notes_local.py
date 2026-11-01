"""build_notes.py with this PC's paths. Run from notes_src with the venv python."""
import markdown, glob, os, re, json

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(os.path.dirname(HERE), 'site')
OUT = os.path.join(SITE, 'notes')
LIB = os.path.join(SITE, 'assets', 'library.json')
SUB = {'9618': 'cs', '9702': 'physics', '9709': 'maths', '9701': 'chemistry', '9700': 'biology', '0478': 'ig-cs',
       '0625': 'ig-physics', '0620': 'ig-chemistry', '0610': 'ig-biology', '0580': 'ig-maths'}
L = json.load(open(LIB, encoding='utf8'))
notes = []
for code, key in SUB.items():
    os.makedirs(os.path.join(OUT, key), exist_ok=True)
    for f in sorted(glob.glob(os.path.join(HERE, code, '*.md'))):
        txt = open(f, encoding='utf8', newline='').read().replace('\r\n', '\n')
        fm = re.match(r'^---\n(.*?)\n---\n', txt, re.S)
        meta = dict(l.split(': ', 1) for l in fm.group(1).split('\n')) if fm else {}
        body = txt[fm.end():] if fm else txt
        body = re.sub(r'(?m)^((?![-|]|\d+\. ).+)\n(?=(- |\d+\. |\|))', r'\1\n\n', body)
        html = markdown.markdown(body, extensions=['tables', 'fenced_code', 'sane_lists'])
        slug = os.path.basename(f)[:-3]
        open(os.path.join(OUT, key, slug + '.html'), 'w', encoding='utf8', newline='\n').write(html)
        notes.append([key, meta.get('chapter', ''), meta.get('title', slug), f'/notes/{key}/{slug}.html', meta.get('paper', '')])


def order(n):
    parts = re.findall(r'\d+', n[1]) or ['0']
    return (n[0], [int(p) for p in parts])


notes.sort(key=order)
L['notes'] = notes
json.dump(L, open(LIB, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print(len(notes), 'notes')
by = {}
for n in notes:
    by[n[0]] = by.get(n[0], 0) + 1
print(by)
