import re, json, glob, os, sys, pdfplumber

SRC = '/mnt/user-data/outputs/cs'

HEAD = re.compile(r'(Mark Scheme|Syllabus|PUBLISHED|^Page\b|^Cambridge|^0478|May/June|October/November|February/March|UCLES|^\*|^,|DO NOT WRITE)')
FOOT = re.compile(r'(©|UCLES|Turn over|Page \d+ of|Cambridge University Press|Permission to reproduce|To avoid the issue|is part of|Every reasonable effort|copyright acknowledgements|www\.|\bpublished\b.*\bseries\b|^\*)', re.I)


def pages(path):
    res = []
    with pdfplumber.open(path) as pdf:
        plist = [(float(p.width), float(p.height), p.dedupe_chars(tolerance=1.6, extra_attrs=('size',)).extract_words(extra_attrs=['upright'], x_tolerance=1.5)) for p in pdf.pages]
    for W, H, raw in plist:
        ws = [(float(w['x0']), float(w['top']), float(w['x1']), float(w['bottom']), re.sub(r'[\x00-\x1f]', '', w['text'])) for w in raw if w['upright']]
        ws = [w for w in ws if not (w[0] > 0.86 * W and (w[3] - w[1]) > 2 * (w[2] - w[0]))]
        ws = [w for w in ws if not (w[0] > 0.9 * W) and not (w[2] < 0.04 * W)]
        words = [w for w in ws if w[4].strip() and not re.fullmatch(r'[\x00-\x1f,]*', w[4])]
        words.sort(key=lambda w: (w[1] + w[3]) / 2)
        rows = []
        for w in words:
            c = (w[1] + w[3]) / 2
            if rows and abs(rows[-1][0] - c) < 3.5:
                rows[-1][1].append(w)
            else:
                rows.append([c, [w]])
        lines = []
        for c, ws in rows:
            ws.sort()
            txt = ' '.join(w[4] for w in ws)
            lines.append(dict(x=ws[0][0], y0=min(w[1] for w in ws), y1=max(w[3] for w in ws), first=ws[0][4], text=txt))
        lines.sort(key=lambda l: (round(l['y0']), l['x']))
        res.append(dict(W=W, H=H, lines=lines))
    return res


def content(pg):
    H = pg['H']
    top, bot = 0, H
    for l in pg['lines']:
        # bare numbers only count as page numbers right at the edge: lower down they are graph axis labels
        if l['y0'] < 0.16 * H and (HEAD.search(l['text']) or (re.fullmatch(r'\d{1,2}', l['text']) and l['x'] > 0.3 * pg['W'] and l['y0'] < 0.07 * H)) and len(l['text']) < 140:
            top = max(top, l['y1'])
        if l['y0'] > 0.72 * H and (FOOT.search(l['text']) or (l['y0'] > 0.9 * H and l['text'].count('(cid:') >= 10) or (re.fullmatch(r'\d{1,2}', l['text']) and l['x'] > 0.3 * pg['W'] and l['y0'] > 0.93 * H)):
            bot = min(bot, l['y0'])
    body = [l for l in pg['lines'] if l['y0'] >= top - 0.5 and l['y1'] <= bot + 0.5]
    return top, bot, body


DATA_PAGE = re.compile(r'THE PERIODIC TABLE OF ELEMENTS|NOTES FOR USE IN QUALITATIVE ANALYSIS|QUALITATIVE ANALYSIS NOTES')


def trim_edges(a, b, H, cont, last):
    """Keep clear of the barcode strips printed at the page edges on 2025+ papers."""
    return (max(a, 0.068 * H) if cont else a), min(b, max(0.936 * H, last + 2))


def is_blank(body):
    t = ' '.join(l['text'] for l in body).strip().upper()
    if 'THE PERIODIC TABLE OF ELEMENTS' in t or 'NOTES FOR USE IN QUALITATIVE ANALYSIS' in t or 'QUALITATIVE ANALYSIS NOTES' in t: return True
    return (not t) or t in ('BLANK PAGE',) or (len(t) < 40 and 'BLANK PAGE' in t)


def segment(path, kind, maxq=None):
    pgs = pages(path)
    infos = []
    for i, pg in enumerate(pgs):
        top, bot, body = content(pg)
        infos.append((top, bot, body))
    # first page of material
    start = 1
    if kind == 'ms':
        start = 1
        for i, (_, _, body) in enumerate(infos):
            if any(re.match(r'^Qu', l['text']) and re.search(r'nsw|arks', l['text']) and len(l['text']) < 70 for l in body):
                start = i
                break
    # last usable page
    last = len(pgs) - 1
    for i in range(start + 1, len(pgs)):   # data sheets end the paper, whatever follows them
        if DATA_PAGE.search(' '.join(l['text'] for l in infos[i][2]).upper()):
            last = i - 1
            break
    while last > start and is_blank(infos[last][2]):
        last -= 1
    cand = []
    for i in range(start, last + 1):
        for l in infos[i][2]:
            cand.append((i, l))
    # the column is set by question 1 itself: other small numbers on the page are table rows and axis labels
    first = [l['x'] for _, l in cand if re.match(r'^1\*?(\(|$)', l['first']) and (len(l['text'].split()) > 1 or '(' in l['first']) and l['x'] < 0.25 * pgs[0]['W']]
    left = min(first, default=min((l['x'] for _, l in cand if re.match(r'^\d{1,2}(\(|$)', l['first'])), default=0))
    newms = kind == 'ms' and any(re.match(r'^Qu', l['text']) and re.search(r'nsw|arks', l['text']) and len(l['text']) < 70 for _, l in cand)
    tol = 45 if newms else (16 if kind == 'ms' else 6)
    starts, lens = [], []
    exp = 1
    for i, l in cand:
        m = re.match(r'^([1-9]\d?)[A-D*]?(\(.*)?$', l['first'])
        alone_top = kind == 'qp' and l['y0'] < 0.1 * pgs[i]['H'] and l['x'] < left + 60   # an indented number heading a page
        if not m or (l['x'] > left + tol and not alone_top):
            continue
        if kind == 'qp' and m.group(2) is None and len(l['text'].split()) < 2 and l['x'] > left + 2 and not alone_top:
            continue
        n = int(m.group(1))
        if kind == 'ms' and n == 1 and exp > 2 and all(k > 40 for k in lens):   # that list was the marking notes, the answers start here
            starts, lens, exp = [], [], 1
        if n == exp and (maxq is None or n <= maxq):
            starts.append((n, i, l['y0'])); lens.append(len(l['text']))
            exp += 1
    qs = []
    for k, (n, p, y) in enumerate(starts):
        if k + 1 < len(starts):
            ep, ey = starts[k + 1][1], starts[k + 1][2]
        else:
            ep, ey = last, None
        frags, text = [], []
        for pi in range(p, ep + 1):
            top, bot, body = infos[pi]
            y0 = y if pi == p else top
            y1 = ey if (pi == ep and ey is not None) else bot
            sel = [l for l in body if l['y0'] >= y0 - 1 and l['y1'] <= y1 + 1]
            if kind == 'ms':   # the next question's repeated table header
                sel = [l for l in sel if not re.match(r'^Question\b.*(Answer|Marks)', l['text'])]
            if pi == ep and ey is not None and pi != p and not sel:
                continue
            if not sel or is_blank(sel):
                continue
            a = min(l['y0'] for l in sel) - (3 if kind == 'qp' else 5)
            b = max(l['y1'] for l in sel) + 6
            if ey is not None and pi == ep:
                b = min(b, ey - 3)
            if kind == 'qp':   # keep untexted diagrams and graph grids between the text and the page edges
                if pi != p and top > 0:
                    a = top + 2
                if pi < ep and bot < pgs[pi]['H']:
                    b = bot - 2
                elif pi == ep and ey is not None:
                    b = ey - 3
                a, b = trim_edges(a, b, pgs[pi]['H'], pi != p, max(l['y1'] for l in sel))
            frags.append([pi + 1, round(a, 1), round(b, 1), pgs[pi]['W'], pgs[pi]['H']])
            text += [l['text'] for l in sel]
        qs.append(dict(n=n, frags=frags, text='\n'.join(text)))
    return qs


if __name__ == '__main__':
    out = {}
    files = sorted(glob.glob(SRC + '/*/0478_*_qp_*.pdf'))
    for f in files:
        base = os.path.basename(f)[:-4]
        msf = f.replace('_qp_', '_ms_')
        q = segment(f, 'qp')
        m = segment(msf, 'ms')
        out[base] = dict(qp=q, ms=m)
        flag = '' if len(q) == len(m) else '  <-- MISMATCH'
        print(base, len(q), len(m), flag)
    json.dump(out, open('C:/Users/user/Downloads/BeforeExams-project/pipeline/igt/seg.json', 'w'))
