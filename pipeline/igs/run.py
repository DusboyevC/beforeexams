"""IGCSE multi-topic topical pipeline.  python3 run.py CODE [seg|tag|build]...
Sources: C:/Users/user/Downloads/BeforeExams-project/pipeline/igs/src/CODE/*.pdf  (flat, Cambridge names like 0625_s19_qp_42.pdf)"""
import sys, os, re, json, glob, collections, importlib.util
from concurrent.futures import ProcessPoolExecutor
sys.path.insert(0, 'C:/Users/user/Downloads/BeforeExams-project/pipeline')
def load(name, path):
    s = importlib.util.spec_from_file_location(name, path); m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
SEGI = load('igseg', 'C:/Users/user/Downloads/BeforeExams-project/pipeline/igt/segment.py')
SEGI.HEAD = re.compile(r'(Mark Scheme|Syllabus|PUBLISHED|^Page\b|^Cambridge|^0\d{3}\b|May/June|October/November|February/March|UCLES|^\*|^,|DO NOT WRITE)')
import seg as SEGA, build
code = sys.argv[1]; steps = sys.argv[2:] or ['seg', 'tag', 'build']
M = load('s' + code, f'C:/Users/user/Downloads/BeforeExams-project/pipeline/igs/s{code}.py')
SRC = f'C:/Users/user/Downloads/BeforeExams-project/pipeline/igs/src/{code}'; W = f'C:/Users/user/Downloads/BeforeExams-project/pipeline/igs/w/{code}'; os.makedirs(W, exist_ok=True)
SUBJ = {'0625': 'IGCSE Physics', '0620': 'IGCSE Chemistry', '0610': 'IGCSE Biology', '0580': 'IGCSE Mathematics'}[code]
SCI = code != '0580'

def info(base):
    _, sess, _, num = base.split('_'); yy = int(sess[1:]); p = num[0]
    if not SCI:
        return dict(mcq=False, group='Core (Paper 1 & 3)' if p in '13' else 'Extended (Paper 2 & 4)')
    if yy <= 15:   # old structure: 1 MCQ, 2 core theory, 3 extended theory, 5 practical, 6 ATP
        p = {'1': '1', '2': '3', '3': '4'}.get(p, p)
    if p in '12': return dict(mcq=True, group='Multiple choice (Paper 1 & 2)')
    if p in '34': return dict(mcq=False, group='Theory (Paper 3 & 4)')
    return dict(mcq=False, group='Practical (Paper 5 & 6)')

def seg_one(f):
    base = os.path.basename(f)[:-4]; msf = f.replace('_qp_', '_ms_'); I = info(base)
    try:
        if I['mcq']:
            qs = SEGA.segment_qp(f)
            q = [dict(n=x['q'], frags=[[p + 1, a, b, w, h] for p, a, b, w, h in x['parts']], text=x['text']) for x in qs]
            ans = SEGA.ms_mcq(msf) if os.path.exists(msf) else {}
            flag = '' if len(q) == 40 and len(ans) >= 40 else '  <-- CHECK'
            return base, dict(qp=q, ans={str(k): v for k, v in ans.items()}), f'{base} mcq {len(q)} {len(ans)}{flag}'
        q = SEGI.segment(f, 'qp'); m = SEGI.segment(msf, 'ms') if os.path.exists(msf) else []
        note = ''
        if len(m) > len(q):   # numbered mark points can look like extra questions
            note = f'  (mark scheme capped from {len(m)})'; m = SEGI.segment(msf, 'ms', len(q))
        return base, dict(qp=q, ms=m), f"{base} {len(q)} {len(m)}{'' if len(q) == len(m) else '  <-- MISMATCH'}{note}"
    except Exception as e:
        return base, None, f'{base} ERROR {e}'

def do_seg():
    out = {}
    with ProcessPoolExecutor(3) as ex:
        for base, v, line in ex.map(seg_one, sorted(glob.glob(f'{SRC}/{code}_*_qp_*.pdf'))):
            print(line, flush=True)
            if v: out[base] = v
    json.dump(out, open(f'{W}/seg.json', 'w'))

def norm(t): return ' ' + re.sub(r'\s+', ' ', re.sub(r'\(cid:\d+\)', ' ', t).lower()).replace('’', "'").replace('‑', '-') + ' '
_PAT = {}
def hits(words, t):
    n = 0
    for w in words:
        if w not in _PAT: _PAT[w] = re.compile(r'(?<![a-z])' + re.escape(w))
        if _PAT[w].search(t): n += 1
    return n
def score(k, tq, tm=' '):
    ds, dk, dsm = hits(M.STRONG[k], tq), hits(M.KW[k], tq), hits(M.STRONG[k], tm)
    return (4 * ds + dk + 1.5 * dsm, ds, dk, dsm)
SUBPART = re.compile(r'\s(?=\((?:[a-h]|i{1,3}|iv|v)\)\s)')
REMOVED = re.compile(r'has been removed from the question paper', re.I)

def refine(tags, texts, allow, weak, add_at=0.75, drop_at=0.15):
    """Second opinion: a model trained on the keyword tags, each question scored by folds that never saw it."""
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import KFold
    from sklearn.multiclass import OneVsRestClassifier
    from sklearn.preprocessing import MultiLabelBinarizer
    import numpy as np
    keys = list(tags)
    X = TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True, stop_words='english',
                        token_pattern=r'[a-z][a-z\-]+').fit_transform(texts[k] for k in keys)
    mb = MultiLabelBinarizer(); Y = mb.fit_transform(tags[k] for k in keys)
    P = np.zeros(Y.shape)
    sure = np.array([k not in weak for k in keys])   # weak questions have no strong keyword: never learn from their guesses
    for tr, te in KFold(5, shuffle=True, random_state=1).split(X):
        tr = tr[sure[tr]]
        m = OneVsRestClassifier(LogisticRegression(C=10, max_iter=300, class_weight='balanced')).fit(X[tr], Y[tr])
        P[te] = m.predict_proba(X[te])
    cols = {int(t): i for i, t in enumerate(mb.classes_)}
    out, added, dropped = {}, 0, 0
    for i, k in enumerate(keys):
        pr = {t: P[i, cols[t]] for t in allow[k] if t in cols}
        new = set(tags[k]) | {t for t, p in pr.items() if p >= add_at}
        keep = {t for t in new if pr.get(t, 0) >= drop_at}
        new = keep or {max(pr, key=pr.get)}
        top = max(pr, key=pr.get)
        if k in weak and pr[top] >= 0.5: new = {top} | {t for t, p in pr.items() if p >= add_at}
        added += len(new - set(tags[k])); dropped += len(set(tags[k]) - new)
        out[k] = sorted(new)
    print('refine added', added, 'dropped', dropped, flush=True)
    return out

def do_tag():
    d = json.load(open(f'{W}/seg.json')); ov = {}
    if os.path.exists(f'{W}/overrides.json'): ov = json.load(open(f'{W}/overrides.json'))
    tags, texts, allow, weak = {}, {}, {}, set()
    for base, v in d.items():
        allowed = M.topics_allowed(base)
        for i, q in enumerate(v['qp']):
            ms = v.get('ms', [])
            tm = norm(ms[i]['text']) if i < len(ms) else ' '
            tq = norm(q['text'])
            feat = {k: score(k, tq, tm) for k in allowed}
            best = max(feat, key=lambda k: feat[k][0])
            tops = {best}
            long = len(tq) > 900          # long structured questions span topics more often
            for k, (sc, ds, dk, dsm) in feat.items():
                if k != best and ((ds >= 2) or (ds >= 1 and dk >= 3) or (ds >= 1 and dsm >= 2) or (long and dk >= 5 and ds >= 1) or (ds >= 1 and sc >= 0.7 * feat[best][0])):
                    tops.add(k)
            # each part of a structured question can be on its own topic
            parts = SUBPART.split(tq)
            seen = collections.Counter()
            for part in parts if len(parts) > 1 else []:
                pf = {k: score(k, part) for k in allowed}
                pb = max(pf, key=lambda k: pf[k][0])
                if pf[pb][1] >= 1: tops.add(pb)
                seen.update(k for k in allowed if pf[k][1] >= 1)
            tops |= {k for k, c in seen.items() if c >= 2}   # named again across parts
            if REMOVED.search(q['text']): continue
            key = f"{base}#{q['n']}"
            tags[key] = sorted(tops); texts[key] = tq; allow[key] = allowed
            if feat[best][1] == 0: weak.add(key)
    tags = refine(tags, texts, allow, weak)
    for key in tags:
        for pat, val in ov.items():
            if re.fullmatch(pat, key): tags[key] = sorted(val) if isinstance(val, list) else sorted(set(tags[key]) | {val})
    json.dump(tags, open(f'{W}/tags.json', 'w'))
    c = collections.Counter(t for v in tags.values() for t in v)
    print(code, 'questions', len(tags), 'multi-topic', sum(len(v) > 1 for v in tags.values()))
    print({M.TOPICS[k][:22]: c[k] for k in sorted(c)})

SO = {'w': 0, 's': 1, 'm': 2}
LIMIT = 25_000_000
def do_build(only=None):
    d = json.load(open(f'{W}/seg.json')); tags = json.load(open(f'{W}/tags.json'))
    OUT = f'C:/Users/user/Downloads/BeforeExams-project/pipeline/igs/topicals/{code}'
    groups = collections.defaultdict(lambda: collections.defaultdict(list))
    for key, ts in tags.items():
        base, n = key.split('#'); n = int(n); v = d[base]; I = info(base)
        q = v['qp'][n - 1]
        it = dict(stem=base, q=n, parts=[[f[0] - 1, f[1], f[2], f[3], f[4]] for f in q['frags']])
        if I['mcq']:
            it['answer'] = v['ans'].get(str(n))
        else:
            ms = v['ms'][n - 1] if n - 1 < len(v['ms']) else None
            if ms and ms['frags'] and len(v['ms']) == len(v['qp']):
                it['ms_stem'] = base.replace('_qp_', '_ms_'); it['ms_parts'] = [[f[0] - 1, f[1], f[2], f[3], f[4]] for f in ms['frags']]
        for t in ts: groups[I['group']][t].append(it)
    made = []
    def emit(g, t, items, mcq, ranged=False):
        ys = sorted({build.parse_stem(i['stem'])['year'] for i in items})
        tag = f' ({ys[0]}-{ys[-1]})' if ranged else ''
        name = f"{g}/Topic {t} - {M.TOPICS[t]}{tag}.pdf"
        n, yt = build.build_chapter(code, items, f'{OUT}/{name}', M.TOPICS[t], SUBJ, code, g, mcq=mcq)
        size = os.path.getsize(f'{OUT}/{name}')
        if size >= LIMIT and len(ys) > 1:   # Cloudflare's per-file limit: split into year ranges
            os.remove(f'{OUT}/{name}')
            half, seen, cut = len(items) / 2, 0, ys[0]
            for y in ys[:-1]:
                seen += sum(build.parse_stem(i['stem'])['year'] == y for i in items); cut = y
                if seen >= half: break
            old = [i for i in items if build.parse_stem(i['stem'])['year'] <= cut]
            emit(g, t, [i for i in items if build.parse_stem(i['stem'])['year'] > cut], mcq, True)
            emit(g, t, old, mcq, True)
            return
        made.append(dict(group=g, topic=t, name=M.TOPICS[t], file=name, questions=n, years=[ys[0], ys[-1]], ranged=ranged))
        print(name, n, yt, round(size / 1e6, 1), 'MB', flush=True)
    for g, bytopic in groups.items():
        os.makedirs(f'{OUT}/{g}', exist_ok=True)
        mcq = g.startswith('Multiple')
        for t, items in sorted(bytopic.items()):
            if only and t not in only: continue
            items.sort(key=lambda i: (-build.parse_stem(i['stem'])['year'], SO[build.parse_stem(i['stem'])['sess']], build.parse_stem(i['stem'])['variant'], i['q']))
            emit(g, t, items, mcq)
    json.dump(made, open(f'{W}/manifest.json', 'w'), indent=0)

if __name__ == '__main__':
    if 'seg' in steps: do_seg()
    if 'tag' in steps: do_tag()
    if 'build' in steps: do_build()
