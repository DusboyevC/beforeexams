"""Turn the review into final topic lists.  python decide.py [subject key]...
Twin questions end up in the same topics. Moves are applied unless rejected in decisions.json, where a hand-picked
topic also wins. Second topics are added from the review. Writes final/<key>.json and labels_final.json for trends."""
import collections, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.dirname(HERE))
sys.path.insert(0, HERE)
import trends
from review import clean, SESS, SRC


SOFT = {'biology', 'chemistry', 'physics', 'maths', 'cs'}   # A Level had one topic per question: keep it and add the second


def body(q, text):
    code, comp, var, ses, yy, n = SRC.search(q).groups()
    t = text.get((f'{code}_{SESS[ses]}{yy}_qp_{comp}{var}', n)) or ''
    b = re.sub(r'[^a-z]', '', re.sub(r'^\s*\d+\s*', '', clean(t)))
    return b if len(b) > 80 else q


def main(which):
    lib = json.load(open(os.path.join(ROOT, 'site', 'assets', 'library.json'), encoding='utf8'))
    labels = json.load(open(os.path.join(HERE, 'labels.json'), encoding='utf8'))
    dec = json.load(open(os.path.join(HERE, 'decisions.json'), encoding='utf8'))
    text = trends.texts()
    os.makedirs(os.path.join(HERE, 'final'), exist_ok=True)
    subj = collections.defaultdict(list)
    for t in lib['topicals']:
        subj[t[1]].append(t)
    for key in which or subj:
        rep = json.load(open(os.path.join(HERE, 'review', key + '.json'), encoding='utf8'))
        d = dec.get(key, {})
        reject, chosen = set(d.get('reject', [])), d.get('set', {})
        groups = collections.defaultdict(lambda: collections.defaultdict(set))
        for t in subj[key]:
            for lab in labels.get('\\'.join(t[8].strip('/').split('/')), []):
                groups[trends.group_of(t)][re.sub(r'\s+', ' ', SRC.search(lab)[0])].add(trends.topic_of(t))
        stats = collections.Counter()
        final = {}
        for gname, lab in groups.items():
            r = rep['groups'].get(gname, {})
            names = {t for v in lab.values() for t in v}
            fam = collections.defaultdict(list)
            for q in lab:
                fam[body(q, text)].append(q)
            for qs in fam.values():
                if len(qs) > 1 and len({frozenset(lab[q]) for q in qs}) > 1:
                    c = collections.Counter(t for q in qs for t in lab[q])
                    keep = {t for t, n in c.items() if n * 2 >= len(qs)} or set(c)
                    for q in qs:
                        lab[q] = set(keep)
                    stats['twins'] += 1
            twin = {q: qs for qs in fam.values() for q in qs}
            for m in r.get('move', []):
                if m['q'] in reject or m['q'] in chosen: continue
                for q in twin[m['q']]:
                    if q not in reject and q not in chosen:
                        lab[q] = lab[q] | {m['to']} if key in SOFT else {m['to']}
                stats['moved'] += 1
            for m in r.get('add', []):
                if m['q'] in reject: continue
                for q in twin[m['q']]:
                    if q not in chosen:
                        lab[q] |= set(m['add'])
                stats['added'] += 1
            for q, tp in chosen.items():
                if q in lab:
                    if tp not in names: raise SystemExit(f'unknown topic {tp!r} in {gname}')
                    lab[q] = {tp}
                    stats['hand'] += 1
            out = collections.defaultdict(list)
            for q, ts in lab.items():
                for t in ts:
                    out[t].append(q)
            for t in names:
                out.setdefault(t, [])
            final[gname] = out
        json.dump(final, open(os.path.join(HERE, 'final', key + '.json'), 'w', encoding='utf8'), ensure_ascii=False)
        print(key, dict(stats), 'multi-topic', sum(len(v) > 1 for g in groups.values() for v in g.values()), 'of', sum(len(g) for g in groups.values()), flush=True)


if __name__ == '__main__':
    main(sys.argv[1:])
