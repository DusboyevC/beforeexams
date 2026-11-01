"""Second opinion on every topical question.  python review.py [subject key]...
For each paper group, a text model learns from the current topic labels and scores each question using folds
that never saw it. Output als/review/<key>.json: questions that look filed wrongly, and second topics to add."""
import collections, json, os, re, sys
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupKFold

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.dirname(HERE))
import trends
SRC = trends.SRC
SESS = trends.SESS
MOVE_AT, ADD_AT, PART_AT, KEEP_BELOW = 0.70, 0.75, 0.85, 0.10
PART = re.compile(r'\s(?=\([a-h]\)\s)')


def clean(t):
    t = re.sub(r'\(cid:\d+\)', ' ', t)
    t = re.sub(r'[•.]{4,}', ' ', t)
    return re.sub(r'\s+', ' ', t).lower()


def twins(texts, lab):
    """The same question printed in two papers but filed differently. These are certain errors."""
    seen = collections.defaultdict(list)
    for k, t in texts.items():
        body = re.sub(r'[^a-z]', '', re.sub(r'^\s*\d+\s*', '', clean(t)))
        if len(body) > 80:
            seen[body].append(k)
    out = []
    for ks in seen.values():
        if len({frozenset(lab[k]) for k in ks}) > 1:
            out.append(dict(qs=ks, topics=collections.Counter(t for k in ks for t in lab[k]), text=clean(texts[ks[0]])[:300]))
    return out


def parts(t):
    out = [p for p in PART.split(clean(t)) if len(p) > 60]
    return out if len(out) > 1 else []


def score(texts, labels):
    """Out-of-fold probabilities for the whole question, and the best probability of any one sub-part."""
    keys = list(texts)
    vec = TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True, stop_words='english', token_pattern=r'[a-z][a-z\-]+')
    X = vec.fit_transform(clean(texts[k]) for k in keys)
    names = sorted({t for k in keys for t in labels[k]})
    pos = {t: i for i, t in enumerate(names)}
    Y = np.zeros((len(keys), len(names)), dtype=int)
    for i, k in enumerate(keys):
        for t in labels[k]:
            Y[i, pos[t]] = 1
    same = [re.sub(r'[^a-z]', '', re.sub(r'^\s*\d+\s*', '', clean(texts[k])))[:300] for k in keys]
    bits = [parts(texts[k]) for k in keys]
    P, Q = np.zeros(Y.shape), np.zeros(Y.shape)
    for tr, te in GroupKFold(5).split(X, groups=same):   # twins stay on one side, so a question never sees its own copy
        pieces = [(i, b) for i in te for b in bits[i]]
        Xp = vec.transform(b for _, b in pieces) if pieces else None
        own = np.array([i for i, _ in pieces], dtype=int)
        for c in range(len(names)):
            y = Y[tr, c]
            if y.sum() < 3:
                continue
            m = LogisticRegression(C=10, max_iter=300, class_weight='balanced').fit(X[tr], y)
            P[te, c] = m.predict_proba(X[te])[:, 1]
            if pieces:
                np.maximum.at(Q[:, c], own, m.predict_proba(Xp)[:, 1])
    return keys, names, P, Q


def main(which):
    lib = json.load(open(os.path.join(ROOT, 'site', 'assets', 'library.json'), encoding='utf8'))
    labels = json.load(open(os.path.join(HERE, 'labels.json'), encoding='utf8'))
    text = trends.texts()
    os.makedirs(os.path.join(HERE, 'review'), exist_ok=True)
    subj = collections.defaultdict(list)
    for t in lib['topicals']:
        subj[t[1]].append(t)
    for key in which or subj:
        groups = collections.defaultdict(lambda: collections.defaultdict(set))
        for t in subj[key]:
            parts_ = t[8].strip('/').split('/')
            for lab in labels.get('\\'.join(parts_), []):
                groups[trends.group_of(t)][re.sub(r'\s+', ' ', SRC.search(lab)[0])].add(trends.topic_of(t))
        texts, every = {}, {}
        for lab in groups.values():
            for k, v in lab.items():
                every[k] = v
                code, comp, var, ses, yy, n = SRC.search(k).groups()
                t = text.get((f'{code}_{SESS[ses]}{yy}_qp_{comp}{var}', n))
                if t and len(t) > 40:
                    texts[k] = t
        keys, names, P, Q = score(texts, every)
        row_of = {k: i for i, k in enumerate(keys)}
        rep = dict(subject=key, groups={})
        for gname, lab in sorted(groups.items()):
            allowed = sorted({t for v in lab.values() for t in v})
            cols = [names.index(t) for t in allowed if t in names]
            here = [k for k in lab if k in row_of]
            move, add = [], []
            agree = 0
            for k in here:
                i = row_of[k]
                p = {names[c]: P[i, c] for c in cols}
                q = {names[c]: Q[i, c] for c in cols}
                cur = sorted(lab[k])
                best = max(p, key=p.get)
                agree += best in cur
                extra = {t: round(float(p[t]), 2) for t in allowed if t not in cur and t in p and p[t] >= ADD_AT}
                extra.update({t: round(float(q[t]), 2) for t in allowed if t not in cur and t in q and q[t] >= PART_AT and t not in extra})
                weak = [t for t in cur if p.get(t, 0) < KEEP_BELOW and q.get(t, 0) < KEEP_BELOW]
                row = dict(q=k, now={t: round(float(p.get(t, 0)), 2) for t in cur}, text=clean(texts[k])[:400])
                if len(weak) == len(cur) and p[best] >= MOVE_AT and best not in cur:
                    move.append(dict(row, to=best, p=round(float(p[best]), 2)))
                elif extra:
                    add.append(dict(row, add=extra))
            dup = twins({k: texts[k] for k in here}, lab)
            rep['groups'][gname] = dict(questions=len(lab), text=len(here), agree=round(agree / max(1, len(here)), 3), move=move, add=add, twins=dup)
            print(key, gname, 'questions', len(lab), 'text', len(here), 'agree', round(agree / max(1, len(here)), 3), 'move', len(move), 'add', len(add), 'twins', len(dup), flush=True)
        json.dump(rep, open(os.path.join(HERE, 'review', key + '.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)

if __name__ == '__main__':
    main(sys.argv[1:])
