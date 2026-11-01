"""Question / mark-scheme segmentation for Cambridge A-Level papers."""
import re, pdfplumber, json, sys, os

STOP_PAT = re.compile(r'(Permission to reproduce items|^\d?\s*Qualitative [Aa]nalysis [Nn]otes\s*$|^\d? ?Tests for (elements|gases|aqueous|ions)|^\d? ?Reactions of (aqueous )?(cations|anions)|Additional page|The Periodic Table of Elements|Important values, constants and standards|If you use the following lined page)', re.I)
NUM = re.compile(r'^(\d{1,2})$')
MSNUM = re.compile(r'^(\d{1,2})(\(.*)?$')


def page_words(pg, xmin=25):
    ws = pg.extract_words(extra_attrs=['fontname', 'size', 'upright'], keep_blank_chars=False, use_text_flow=False, x_tolerance=1.5)
    H, W = pg.height, pg.width
    out = []
    for w in ws:
        if not w['upright']:
            continue
        if w['x0'] < xmin or w['x1'] > W - 20:
            continue
        out.append(w)
    return out


def lines_of(ws, tol=2.5):
    ws = sorted(ws, key=lambda w: (round(w['top']), w['x0']))
    lines = []
    for w in ws:
        for L in lines:
            if abs(L[0]['top'] - w['top']) < tol:
                L.append(w); break
        else:
            lines.append([w])
    for L in lines:
        L.sort(key=lambda w: w['x0'])
    lines.sort(key=lambda L: L[0]['top'])
    return lines


def content_bounds(pg, ws):
    """top/bottom of real content, excluding header page number/codes and footer."""
    H = pg.height
    k = H / 842.0
    body = [w for w in ws if 45 * k < w['top'] < H - 55 * k]
    hdr_re = re.compile(r'^(\d{1,2}|\[Turn|over\]?|©|UCLES|\d{4}/\d\d/.*|Cambridge|University|Press|&|Assessment|20\d\d)$')
    # drop isolated header lines at very top
    if not body:
        return None
    top = min(w['top'] for w in body)
    bot = max(w['bottom'] for w in body)
    return top, bot


def is_blank(ws):
    t = ' '.join(w['text'] for w in ws)
    return ('BLANK PAGE' in t or 'BLANK  PAGE' in t) and len(ws) < 25


def text_of(ws):
    return ' '.join(' '.join(w['text'] for w in L) for L in lines_of(ws))


def segment_qp(path, maxq=60):
    pdf = pdfplumber.open(path)
    pages = []
    for i, pg in enumerate(pdf.pages):
        ws = page_words(pg)
        pages.append((pg, ws))
    starts = []  # (q, page, top)
    stops = []
    expected = 1
    q1font = None
    for i, (pg, ws) in enumerate(pages):
        if i == 0:
            continue
        lines = lines_of(ws)
        if is_blank(ws):
            continue
        for L in lines:
            first = L[0]
            ltxt = ' '.join(w['text'] for w in L)
            if STOP_PAT.search(ltxt):
                stops.append((i, first['top']))
                continue
            kx, ky = pg.width / 595.0, pg.height / 842.0
            if pg.width > pg.height:
                kx = ky = pg.height / 595.0 * 595.0 / 842.0 if False else pg.width / 842.0
            if first['top'] < 45 * ky or first['top'] > pg.height - 50 * ky:
                continue
            m = NUM.match(first['text'])
            if m and 35 * kx <= first['x0'] <= 64 * kx and int(m[1]) == expected and first['size'] >= 9 * ky:
                if q1font is not None:
                    if 'Bold' in q1font[0] and 'Bold' not in first.get('fontname', ''):
                        continue
                    if abs(first['x0'] - q1font[1]) > 5 * kx:
                        continue
                else:
                    q1font = (first.get('fontname', ''), first['x0'])
                top = first['top']
                for L2 in lines:
                    t2 = ' '.join(w['text'] for w in L2).strip()
                    if L2[0]['top'] < top and top - L2[0]['top'] < 320 and re.fullmatch(r'Qualitative\s*Analysis', t2, re.I):
                        top = L2[0]['top']
                starts.append((expected, i, top))
                expected += 1
    stop = None
    if starts:
        last = starts[-1]
        for st in stops:
            if (st[0], st[1]) > (last[1], last[2]):
                stop = st; break
    if stop is None:
        stop = (len(pages) - 1, None)
    qs = []
    for k, (q, pi, top) in enumerate(starts):
        if k + 1 < len(starts):
            npi, ntop = starts[k + 1][1], starts[k + 1][2]
        else:
            npi, ntop = stop
        parts = []
        txt = []
        for p in range(pi, npi + 1):
            pg, ws = pages[p]
            if is_blank(ws):
                continue
            cb = content_bounds(pg, ws)
            if cb is None:
                continue
            ctop, cbot = cb
            y0 = top - 7 if p == pi else ctop - 5
            if p == npi:
                if ntop is None:
                    y1 = cbot + 6
                else:
                    y1 = ntop - 7
            else:
                y1 = cbot + 6
            if p == npi and p != pi and ntop is not None and ntop - ctop < 12:
                continue
            seg_ws = [w for w in ws if w['top'] >= y0 and w['bottom'] <= y1 + 2 and 45 * pg.height / 842 < w['top'] < pg.height - 55 * pg.height / 842]
            if not seg_ws and p != pi:
                continue
            if seg_ws and p != pi:
                y1 = min(y1, max(w['bottom'] for w in seg_ws) + 8)
            if y1 - y0 < 8:
                continue
            parts.append([p, round(max(0, y0), 1), round(min(pg.height, y1), 1), round(pg.width, 1), round(pg.height, 1)])
            txt.append(text_of(seg_ws))
        qs.append({'q': q, 'parts': parts, 'text': ' '.join(txt)})
    pdf.close()
    return qs


def ms_mcq(path):
    pdf = pdfplumber.open(path)
    ans = {}
    for pg in pdf.pages:
        for L in lines_of(page_words(pg)):
            t = [w['text'] for w in L]
            for j in range(len(t) - 2):
                if re.fullmatch(r'\d{1,2}', t[j]) and t[j + 1].lower() == 'question' and t[j + 2].lower().startswith('discount'):
                    ans.setdefault(int(t[j]), 'Discounted')
            if len(t) >= 2 and re.fullmatch(r'\d{1,2}', t[0]) and re.fullmatch(r'[A-D]', t[1]):
                ans.setdefault(int(t[0]), t[1])
            # two-column old format: "1 C 21 B"
            if len(t) >= 4:
                for j in range(0, len(t) - 1):
                    if re.fullmatch(r'\d{1,2}', t[j]) and re.fullmatch(r'[A-D]', t[j + 1]):
                        ans.setdefault(int(t[j]), t[j + 1])
    pdf.close()
    return ans


_LC = {}
HDR_RE = re.compile(r'(Mark Scheme|PUBLISHED|Cambridge International|Cambridge University|UCLES|Page \d+ of \d+|^\d{4}/\d\d|(May/June|October/November|February/March|March) 20\d\d|^Page \d+|Syllabus|Paper$)', re.I)


def lines_cache(p, ws):
    key = (id(ws), p)
    if key not in _LC:
        hdr = set()
        for L in lines_of(ws):
            t = ' '.join(w['text'] for w in L)
            if L[0]['top'] < 80 and HDR_RE.search(t):
                for w in L:
                    hdr.add(id(w))
        _LC[key] = hdr
    return _LC[key]


def ms_header_word(w, hdr):
    return id(w) in hdr


def is_qhdr(L):
    t = ''.join(w['text'] for w in L[:2])
    return t.startswith('Question') and (len(L) >= 2 or L[0]['text'] == 'Question')


def segment_ms(path, nq=None):
    pdf = pdfplumber.open(path)
    pages = [(pg, page_words(pg, 12)) for pg in pdf.pages]
    # find answer region start: header line containing Question ... Answer ... Mark
    start_page = None
    for i, (pg, ws) in enumerate(pages):
        for L in lines_of(ws):
            if is_qhdr(L):
                near = [w['text'] for w in ws if abs(w['top'] - L[0]['top']) < 14]
                if any(x.startswith(('Answer', 'Indicative', 'Expected', 'Point', 'Marking')) for x in near) and any(x.startswith('Mark') for x in near):
                    start_page = i; break
        if start_page is not None:
            break
    newfmt = start_page is not None
    if start_page is None:
        start_page = 1 if len(pages) > 1 else 0
    oldleft = (not newfmt) and any(L[0]['x0'] < 32 and MSNUM.match(L[0]['text'])
                                       for pg, ws in pages[1:] for L in lines_of(ws) if 35 < L[0]['top'] < pg.height - 40)
    cands = []
    for i in range(start_page, len(pages)):
        pg, ws = pages[i]
        lines = lines_of(ws)
        qcol = None
        for L in lines:
            if is_qhdr(L):
                qcol = (L[0]['x0'] - 25, (L[1]['x1'] if L[0]['text'] == 'Q' else L[0]['x1']) + 6)
        for L in lines:
            f = L[0]
            if f['top'] < 35 or f['top'] > pg.height - 40:
                continue
            m = MSNUM.match(re.sub(r'^Q(?=\d)', '', f['text'].lstrip('.,·•')))
            if not m:
                continue
            n = int(m[1])
            if newfmt:
                if qcol and not (qcol[0] <= f['x0'] <= qcol[1]):
                    continue
                if not qcol and f['x0'] > 140:
                    continue
            else:
                if f['x0'] > (36 if oldleft else 75):
                    continue
            paren = bool(m[2]) or (len(L) > 1 and re.match(r'^\((a|b|i|ii)\)', L[1]['text']) is not None)
            hdr_top = None
            for L2 in lines:
                if is_qhdr(L2) and 0 < f['top'] - L2[0]['top'] < 40:
                    hdr_top = L2[0]['top']
            cands.append((n, i, f['top'], hdr_top, paren))
    starts = []
    pos = -1
    n = 1
    while True:
        if nq is not None and n > nq:
            break
        later = [(j, c) for j, c in enumerate(cands) if j > pos and c[0] == n]
        if not later:
            break
        # the next question's first candidate bounds the search
        nxt = [j for j, c in enumerate(cands) if j > pos and c[0] == n + 1 and c[4]]
        lim = nxt[0] if nxt else len(cands)
        par = [(j, c) for j, c in later if c[4] and j < lim]
        pick = par[0] if par else later[0]
        starts.append(pick[1][:4])
        pos = pick[0]
        n += 1
    qs = []
    for k, (q, pi, top, hdr) in enumerate(starts):
        if k + 1 < len(starts):
            npi, ntop, nhdr = starts[k + 1][1], starts[k + 1][2], starts[k + 1][3]
            nt = (nhdr if nhdr is not None else ntop)
        else:
            npi, nt = len(pages) - 1, None
        parts, txt = [], []
        for p in range(pi, npi + 1):
            pg, ws = pages[p]
            body = [w for w in ws if 35 < w['top'] < pg.height - 40 and not ms_header_word(w, lines_cache(p, ws))]
            if not body:
                continue
            ctop = min(w['top'] for w in body); cbot = max(w['bottom'] for w in body)
            if p == pi:
                y0 = (hdr if hdr is not None else top) - 6
            else:
                y0 = ctop - 6
            if p == npi and nt is not None:
                y1 = nt - 4
            else:
                y1 = cbot + 8
            if y1 - y0 < 10:
                continue
            seg = [w for w in body if w['top'] >= y0 and w['bottom'] <= y1 + 2]
            if not seg:
                continue
            parts.append([p, round(max(0, y0), 1), round(min(pg.height, y1), 1), round(pg.width, 1), round(pg.height, 1)])
            txt.append(text_of(seg))
        qs.append({'q': q, 'parts': parts, 'text': ' '.join(txt)})
    pdf.close()
    return qs


def header_code(path):
    """Return the paper code text from first content pages for pairing checks."""
    pdf = pdfplumber.open(path)
    t = ''
    for pg in pdf.pages[:3]:
        t += (pg.extract_text() or '') + '\n'
    pdf.close()
    return t


if __name__ == '__main__':
    f = sys.argv[1]
    if '_qp_' in f:
        r = segment_qp(f)
    else:
        r = segment_ms(f)
    for q in r:
        print(q['q'], q['parts'], q['text'][:100])


def decode_cid(t):
    """Some 2023+ PDFs use subset fonts whose glyph ids are ASCII-29."""
    if t.count('(cid:') < 15:
        return t
    def rep(m):
        n = int(m[1]) + 29
        return chr(n) if 32 <= n < 127 else ' '
    return re.sub(r'\(cid:(\d+)\)', rep, t)
