"""Topic and question-type trends per subject, written to site/assets/trends/<key>.json.  python trends.py
Reads the question labels of every topical. Rerun after any change to which topic a question sits in."""
import collections, json, math, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'site', 'assets', 'trends')
SRC = re.compile(r'(\d{4})/(\d)(\d)/([FMO]/[MJN])/(\d\d)\s+Q(\d+)')
SESS = {'F/M': 'm', 'M/J': 's', 'O/N': 'w'}
WINDOW, MIN_N, Z = 3, 12, 2.2
SCI = {'Calculations': ['Calculate', 'Determine', 'Work out', 'Find'], 'Explain': ['Explain', 'Justify', 'Give a reason', 'Give reasons'],
       'Describe': ['Describe', 'Outline'], 'Recall': ['State', 'Name', 'Give', 'Identify', 'Define', 'List'],
       'Suggest or predict': ['Suggest', 'Predict', 'Deduce'], 'Compare': ['Compare', 'Contrast', 'Distinguish'],
       'Draw, plot or complete': ['Draw', 'Sketch', 'Plot', 'Complete'], 'Plan or evaluate': ['Plan', 'Design', 'Evaluate', 'Discuss', 'Assess']}
MATHS = {'Find a value': ['Find', 'Hence find', 'Calculate', 'Determine', 'Work out'], 'Show or prove': ['Show', 'Prove', 'Verify'], 'Solve': ['Solve', 'Hence solve'],
         'Differentiate or integrate': ['Differentiate', 'Integrate', 'Evaluate'], 'Sketch or draw': ['Sketch', 'Draw', 'Plot', 'Complete'],
         'Rearrange or simplify': ['Expand', 'Simplify', 'Factorise', 'Express', 'Write', 'Rearrange', 'Make'], 'Explain': ['Explain', 'State', 'Give', 'Describe', 'Interpret']}
CS = {'Write code or pseudocode': ['Write'], 'Explain': ['Explain', 'Justify'], 'Describe': ['Describe', 'Outline'], 'State or identify': ['State', 'Identify', 'Give', 'Name'],
      'Complete or draw': ['Complete', 'Draw'], 'Calculate or convert': ['Calculate', 'Convert', 'Show']}


def group_of(t):
    """The paper group of a library topical. 0478 keeps its files directly in Topicals, so it uses the paper number."""
    parts = t[8].strip('/').split('/')
    return parts[2] if len(parts) > 3 else f'Paper {t[3]}'


def topic_of(t):
    return re.sub(r'\s*\(\d{4}(?:[–-]\d{4})?\)$', '', t[5])


def word_re(sets):
    words = sorted({w for v in sets.values() for w in v}, key=len, reverse=True)
    return re.compile(r'\b(' + '|'.join(words) + r')\b'), {w: k for k, v in sets.items() for w in v}


def texts():
    t = {}
    for code in ('0610', '0620', '0625', '0580'):
        p = os.path.join(ROOT, 'pipeline', 'igs', 'w', code, 'seg.json')
        for base, v in json.load(open(p, encoding='utf8')).items():
            for q in v['qp']:
                t[base, str(q['n'])] = q['text']
    for f in os.listdir(os.path.join(ROOT, 'pipeline', 'als')):
        if f.endswith('_text.json'):
            for base, qs in json.load(open(os.path.join(ROOT, 'pipeline', 'als', f), encoding='utf8')).items():
                for n, x in qs.items():
                    t[base, str(n)] = x
    return t


def tagged(counts, totals, years):
    """Share of each year's total, and whether the last three years differ from the three before."""
    now, was = years[-WINDOW:], years[-2 * WINDOW:-WINDOW]
    idx = {y: i for i, y in enumerate(years)}
    a, b = sum(counts[idx[y]] for y in now), sum(counts[idx[y]] for y in was)
    na, nb = sum(totals[idx[y]] for y in now), sum(totals[idx[y]] for y in was)
    pa, pb = a / na if na else 0, b / nb if nb else 0
    tag = ''
    early = sum(counts[:idx[was[1]] + 1])
    if na and nb >= 30:
        if a >= 5 and early <= 0.1 * a: tag = 'new'   # barely asked before: a syllabus change, not a trend
        elif a == 0 and b >= 5: tag = 'gone'
        elif a + b >= MIN_N:
            p = (a + b) / (na + nb)
            z = (pa - pb) / math.sqrt(p * (1 - p) * (1 / na + 1 / nb)) if 0 < p < 1 else 0
            if abs(z) >= Z: tag = 'up' if z > 0 else 'down'
    return dict(now=round(100 * pa, 1), before=round(100 * pb, 1), change=round(100 * (pa - pb), 1), tag=tag)


def rows(by, totals, years):
    out = []
    for name, c in by.items():
        counts = [c.get(y, 0) for y in years]
        out.append(dict(name=name, counts=counts, **tagged(counts, totals, years)))
    return sorted(out, key=lambda r: -r['now'])


def main():
    lib = json.load(open(os.path.join(ROOT, 'site', 'assets', 'library.json'), encoding='utf8'))
    labels = json.load(open(os.path.join(ROOT, 'pipeline', 'als', 'labels.json'), encoding='utf8'))
    text = texts()
    os.makedirs(OUT, exist_ok=True)
    subj = collections.defaultdict(list)
    for t in lib['topicals']:
        subj[t[1]].append(t)
    for key, tops in subj.items():
        cls = MATHS if 'maths' in key else CS if key.endswith('cs') else SCI
        rx, bucket = word_re(cls)
        groups = collections.defaultdict(lambda: {'qs': {}, 'topic': collections.defaultdict(set)})
        fin = os.path.join(ROOT, 'pipeline', 'als', 'final', key + '.json')
        final = json.load(open(fin, encoding='utf8')) if os.path.exists(fin) else None
        if final:   # the reviewed topic lists, once they exist
            for group, topics in final.items():
                for name, qs in topics.items():
                    for lab in qs:
                        code, comp, var, ses, yy, n = SRC.search(lab).groups()
                        for g in (group, 'All papers'):
                            groups[g]['qs'][code, comp, var, ses, yy, n] = 2000 + int(yy)
                            groups[g]['topic'][name].add((code, comp, var, ses, yy, n))
        for t in tops if not final else []:
            parts = t[8].strip('/').split('/')
            group, name = group_of(t), topic_of(t)
            for lab in labels.get('\\'.join(parts), []):
                m = SRC.search(lab)
                code, comp, var, ses, yy, n = m.groups()
                q = (code, comp, var, ses, yy, n)
                for g in (group, 'All papers'):
                    groups[g]['qs'][q] = 2000 + int(yy)
                    groups[g]['topic'][name].add(q)
        years = sorted({y for g in groups.values() for y in g['qs'].values()})
        res = []
        for gname in ['All papers'] + sorted(g for g in groups if g != 'All papers'):
            g = groups[gname]
            per = collections.Counter(g['qs'].values())
            totals = [per.get(y, 0) for y in years]
            by = {n: collections.Counter(g['qs'][q] for q in qs) for n, qs in g['topic'].items()}
            hits = collections.defaultdict(collections.Counter)
            hit_total = collections.Counter()
            for (code, comp, var, ses, yy, n), y in g['qs'].items():
                body = text.get((f'{code}_{SESS[ses]}{yy}_qp_{comp}{var}', n))
                if not body: continue
                for w in rx.findall(body):
                    hits[bucket[w]][y] += 1; hit_total[y] += 1
            htot = [hit_total.get(y, 0) for y in years]
            mcq = gname.startswith('Multiple') or (gname == 'Paper 1' and key in ('biology', 'chemistry', 'physics'))
            res.append(dict(name=gname, totals=totals, topics=rows(by, totals, years), types=[] if mcq or sum(htot) < 200 else rows(hits, htot, years), hits=htot))
        json.dump(dict(years=years, groups=res), open(os.path.join(OUT, key + '.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
        g = res[0]
        print(key, years[0], years[-1], 'questions', sum(g['totals']), 'up', [r['name'][:24] for r in g['topics'] if r['tag'] == 'up'][:5], 'down', [r['name'][:24] for r in g['topics'] if r['tag'] == 'down'][:5], 'types', len(g['types']), flush=True)


if __name__ == '__main__':
    main()
