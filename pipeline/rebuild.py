"""Rebuild topical PDFs into question, mark scheme order with the final topic lists.  python rebuild.py [subject key]...
Reads als/final/<key>.json ({group: {topic: [source label]}}). Writes changed files to rebuilt/ and rebuilt/<key>.json."""
import collections, hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
HOST = os.path.join(os.path.dirname(ROOT), 'BeforeExams')
OUT = os.path.join(HERE, 'rebuilt')
sys.path.insert(0, HERE)
import cover, recompose as R, trends

LIMIT = 25_000_000
SO = {'O/N': 0, 'M/J': 1, 'F/M': 2}
LINE = {'ig-physics': 'IGCSE Physics', 'ig-chemistry': 'IGCSE Chemistry', 'ig-biology': 'IGCSE Biology', 'ig-maths': 'IGCSE Mathematics', 'ig-cs': 'IGCSE Computer Science',
        'biology': 'A-Level Biology', 'chemistry': 'A-Level Chemistry', 'physics': 'A-Level Physics', 'maths': 'A-Level Mathematics', 'cs': 'A-Level Computer Science'}
SYL = {'cs': '9608 and 9618'}


def order(q):
    code, comp, var, ses, yy, n = R.SRC.search(q).groups()
    return (-int(yy), SO[ses], int(comp + var), int(n))


def year(q):
    return 2000 + int(R.SRC.search(q)[5])


def uid(s):
    return hashlib.md5(s.encode()).hexdigest()[:8]


def write(key, code, group, topic, qs, index, path):
    out = R.Out()
    ys = sorted({year(q) for q in qs})
    ytxt = f'[{ys[0]} – {ys[-1]}]' if len(ys) > 1 else f'[{ys[0]}]'
    out.add_pdf(cover.make_cover(topic, LINE[key], SYL.get(key, code), group, ytxt, len(qs)))
    for new, q in enumerate(qs, 1):
        fid, pdf, it = index[q]
        if it['mcq']:
            out.mcq_item(fid, new, it)
        else:
            out.flush()
            for p in it['pages']:
                out.copy_page(pdf, p, it['n'], new)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    out.save(path)
    return os.path.getsize(path)


def emit(key, code, group, topic, qs, index, base, ranged, made):
    """base is the repo path without .pdf. Over the Cloudflare limit, split at a year and write both halves."""
    ys = sorted({year(q) for q in qs})
    tag = f' ({ys[0]}-{ys[-1]})' if ranged else ''
    rel = base + tag + '.pdf'
    path = os.path.join(OUT, rel)
    size = write(key, code, group, topic, qs, index, path)
    if size >= LIMIT and len(ys) > 1:
        os.remove(path)
        seen, cut = 0, ys[0]
        for y in ys[:-1]:
            seen += sum(year(q) == y for q in qs); cut = y
            if seen >= len(qs) / 2: break
        emit(key, code, group, topic, [q for q in qs if year(q) > cut], index, base, True, made)
        emit(key, code, group, topic, [q for q in qs if year(q) <= cut], index, base, True, made)
        return
    made.append(dict(path=rel, group=group, topic=topic, questions=len(qs), years=[ys[0], ys[-1]], ranged=ranged, mb=round(size / 1e6, 1)))
    print(rel, len(qs), round(size / 1e6, 1), 'MB', flush=True)


def main(keys):
    lib = json.load(open(os.path.join(ROOT, 'site', 'assets', 'library.json'), encoding='utf8'))
    labels = json.load(open(os.path.join(HERE, 'als', 'labels.json'), encoding='utf8'))
    subj = collections.defaultdict(list)
    for t in lib['topicals']:
        subj[t[1]].append(t)
    for key in keys or subj:
        final = json.load(open(os.path.join(HERE, 'als', 'final', key + '.json'), encoding='utf8'))
        code = subj[key][0][2]
        made, kept = [], []
        groups = collections.defaultdict(lambda: collections.defaultdict(list))
        for t in subj[key]:
            groups[trends.group_of(t)][trends.topic_of(t)].append(t)
        for group, topics in groups.items():
            if group not in final:
                continue
            index, pdfs, cur = {}, [], collections.defaultdict(list)
            mcq = False
            for tp, recs in topics.items():
                for t in recs:
                    pdf, first, items = R.read_items(HOST + t[8].replace('/', os.sep))
                    pdfs.append(pdf)
                    fid = len(pdfs)
                    mcq = mcq or any(i['mcq'] for i in items.values())
                    for it in items.values():
                        q = re.sub(r'\s+', ' ', it['src'])
                        index.setdefault(q, (fid, pdf, it))
                        cur[tp].append(q)
            for tp, recs in topics.items():
                qs = sorted(set(final[group][tp]), key=order)
                if not mcq and qs == sorted(set(cur[tp]), key=order):
                    kept.extend(t[8] for t in recs)   # same questions, already question then mark scheme
                    continue
                base = re.sub(r' \(\d{4}(?:-\d{4})?\)\.pdf$|\.pdf$', '', recs[0][8].lstrip('/'))
                missing = [q for q in qs if q not in index]
                if missing:
                    print('NO SOURCE', group, tp, missing[:5], flush=True)
                    qs = [q for q in qs if q in index]
                emit(key, code, group, tp, qs, index, base, False, made)
            for p in pdfs:
                p.close()
        json.dump(dict(made=made, kept=kept), open(os.path.join(OUT, key + '.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
        print(key, 'rebuilt', len(made), 'kept', len(kept), flush=True)


if __name__ == '__main__':
    main(sys.argv[1:])
