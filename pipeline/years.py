"""Split each topical into one PDF per year, next to the range PDFs.  python years.py [subject key]...
Reads the live topicals from the host folder. Writes years/<repo path> and years/<key>.json ({topical id: {year: path}})."""
import collections, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, 'years')
sys.path.insert(0, HERE)
import pikepdf
import recompose as R, rebuild as B, trends

ANSWER = re.compile(rb'Td \(Answer: ([A-D])\) Tj')


def read(path):
    """The live topicals in question, mark scheme order. A multiple choice page holds several questions, each
    followed by its answer line, so those questions are taken as image blocks; other questions keep whole pages."""
    pdf = pikepdf.open(path)
    items = {}
    for i, p in enumerate(pdf.pages):
        b = R.stream(p)
        mcq = bool(ANSWER.search(b))
        cur, in_q = None, False
        for line in b.split(b'\n'):
            m = R.TAGTXT.search(line)
            if m and b'/F1 7 Tf' in line:
                n = int(m[1][1:])
                cur = items.setdefault(n, dict(n=n, src='', mcq=mcq, blocks=[], pages=[], answer=''))
                in_q = m[2] != b' MARK SCHEME'
                if not mcq and i not in cur['pages']:
                    cur['pages'].append(i)
                continue
            if cur is None:
                continue
            a = ANSWER.search(line)
            if a:
                cur['answer'] = a[1].decode()
                continue
            t = R.SUBTXT.search(line)
            if t and in_q and not cur['src']:
                sm = R.SRC.search(t[1].decode('latin-1'))
                cur['src'] = re.sub(r'\s+', ' ', sm[0]) if sm else ''
                continue
            m = R.PLACE.match(line)
            if m and mcq and in_q:
                xo = p.obj['/Resources']['/XObject'][m[10].decode()]
                cur['blocks'].append(dict(y=float(m[2]), x=float(m[1]), w=float(m[3]), h=float(m[4]), rest=(m[5], m[6], float(m[7]), float(m[8]), m[9]), xo=xo))
    return pdf, items


def main(keys):
    lib = json.load(open(os.path.join(ROOT, 'site', 'assets', 'library.json'), encoding='utf8'))
    for key in keys:
        found, made = {}, 0
        for t in (t for t in lib['topicals'] if t[1] == key):
            pdf, items = read(B.HOST + t[8].replace('/', os.sep))
            by_year = collections.defaultdict(list)
            index = {}
            for it in items.values():
                q = re.sub(r'\s+', ' ', it['src'])
                if not R.SRC.search(q):
                    continue
                index.setdefault(q, (1, pdf, it))
                by_year[B.year(q)].append(q)
            topic = re.sub(r'\s*\(\d{4}\D\d{4}\)$|\s*\(\d{4}\)$', '', t[5])
            base = re.sub(r' \(\d{4}(?:-\d{4})?\)\.pdf$|\.pdf$', '', t[8])
            folder, name = base.rsplit('/', 1)
            for y in sorted(by_year, reverse=True):
                rel = f'{folder}/Years/{name} - {y}.pdf'
                B.write(key, t[2], trends.group_of(t), topic, sorted(set(by_year[y]), key=B.order), index, os.path.join(OUT, rel.lstrip('/')))
                found.setdefault(t[0], {})[str(y)] = rel
                made += 1
            pdf.close()
            print(t[5], len(by_year), 'years', flush=True)
        json.dump(found, open(os.path.join(OUT, key + '.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
        print(key, 'year pdfs', made, flush=True)


if __name__ == '__main__':
    main(sys.argv[1:])
