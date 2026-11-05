"""Turn the threshold PDFs in gt/ into site/assets/grades.json for the grade calculator.  python gt_build.py
Per subject and series: each component's max and grade marks, and each option (combination of components) with its
weighted max, grade marks and the weight of every component, taken from exams.json (the exam guide)."""
import glob, json, os, re
import pdfplumber

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), 'site', 'assets', 'grades.json')
KEY = {'0478': 'ig-cs', '0580': 'ig-maths', '0610': 'ig-biology', '0620': 'ig-chemistry', '0625': 'ig-physics',
       '9618': 'cs', '9700': 'biology', '9701': 'chemistry', '9702': 'physics', '9709': 'maths'}
SERIES = {'june': 'May/June', 'november': 'Oct/Nov'}
NUM = r'(\d+|[^\w\s,])'   # a mark, or the dash Cambridge prints when a grade is not available


def pct(v):
    m = re.match(r'([\d.]+)', str(v or ''))
    return float(m[1]) if m else None


def weights(guide, key, full):
    """{paper number: weight %} from the exam guide; A Level papers use the AS or A Level column."""
    out = {}
    for p in guide.get(key, {}).get('papers', []):
        w = pct(p.get('weight')) if 'weight' in p else pct(p.get('a') if full else p.get('as'))
        for n in re.findall(r'\d', str(p['n'])):
            if w:
                out[n] = w
    return out


def parse(path):
    """Reads both layouts: up to 2025 (option code first) and from 2026 (components first, no option code)."""
    text = '\n'.join(pg.extract_text() or '' for pg in pdfplumber.open(path).pages)
    head, rest = re.split(r'The overall thresholds|^Syllabus grade thresholds$', text, maxsplit=1, flags=re.M)
    cgr = re.search(r'^(?:mark|Component) ((?:[A-G]\*?(?: |$))+)$', head, re.M)[1].split()
    comps = {}
    for m in re.finditer(r'^Component (\d+) (\d+) (.+)$', head, re.M):
        marks = re.findall(NUM, m[3])
        comps[m[1]] = dict(max=int(m[2]), th={g: int(v) for g, v in zip(cgr, marks) if v.isdigit()})
    ogr = re.search(r'^(?:Option mark after|weighted) ((?:[A-G]\*?(?: |$))+)$', rest, re.M)[1].split()
    rows = [(m[1], m[2], m[3], m[4]) for m in re.finditer(r'^([A-Z][A-Z0-9]{1,3}) (\d+) ((?:\d+, )*\d+) (.+)$', rest, re.M)]
    rows += [('+'.join(m[1].split(', ')), m[2], m[1], m[3]) for m in re.finditer(r'^((?:\d+, )*\d+) (\d+) (.+)$', rest, re.M)]
    opts = []
    for oid, mx, cl, tail in rows:
        cs = cl.split(', ')
        marks = re.findall(NUM, tail)
        if len(marks) != len(ogr) or not all(c in comps for c in cs):
            continue   # carried-forward marks and other rows a student can't enter
        opts.append(dict(id=oid, max=int(mx), comps=cs, th={g: int(v) for g, v in zip(ogr, marks) if v.isdigit()}))
    return comps, opts


def main():
    guide = json.load(open(os.path.join(HERE, 'exams.json'), encoding='utf8'))
    data = {}
    for f in sorted(glob.glob(os.path.join(HERE, 'gt', '*.pdf'))):
        code, series = os.path.basename(f)[:-4].split('_')
        month, year = series.split('-')
        key = KEY[code]
        comps, opts = parse(f)
        full = max((o['max'] for o in opts), default=0)
        for o in opts:
            w = weights(guide, key, o['max'] == full or key.startswith('ig-'))
            ws = [w.get(c[0]) for c in o['comps']]
            if not all(ws):   # no weights for these papers: count them by their raw marks
                ws = [comps[c]['max'] for c in o['comps']]
            total = sum(ws)
            o['w'] = [round(o['max'] * x / total / comps[c]['max'], 5) for x, c in zip(ws, o['comps'])]   # weighted mark per raw mark
        data.setdefault(key, {'code': code, 'series': []})['series'].append(dict(id=f'{year}-{month[0]}', name=f'{SERIES[month]} {year}', comps=comps, options=opts))
        print(code, series, len(comps), 'components', len(opts), 'options', flush=True)
    for v in data.values():
        v['series'].sort(key=lambda s: s['id'], reverse=True)
    json.dump(data, open(OUT, 'w', encoding='utf8'), separators=(',', ':'))
    print('grades.json', round(os.path.getsize(OUT) / 1024), 'KB')


if __name__ == '__main__':
    main()
