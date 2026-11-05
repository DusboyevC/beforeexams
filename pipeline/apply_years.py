"""After years.py: add the year PDFs to site/assets/library.json and write their jump lists.  python apply_years.py [subject key]...
library.json gets "years": {topical id: [[year, path, questions, marks], ...]}, newest first. Jump lists go to site/assets/jump/<id>-<year>.json, page maps for cutting to site/assets/pages/<id>.json.
Copying the PDFs into the host folder is a separate step, done only when an upload is approved."""
import collections, json, os, re, sys
import pikepdf, pypdfium2

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, 'years')
LIB = os.path.join(ROOT, 'site', 'assets', 'library.json')
JUMP = os.path.join(ROOT, 'site', 'assets', 'jump')
sys.path.insert(0, HERE)
from apply_rebuilt import jump
import recompose as R
PAGES = os.path.join(ROOT, 'site', 'assets', 'pages')
QSRC = re.compile(rb'\(Q(\d+) QUESTION\) Tj ET\s*BT /F2 7 Tf [\d. ]+ rg [\d.]+ [\d.]+ Td \((.*?)\) Tj ET')
ANS = re.compile(rb'\(Q(\d+) MARK SCHEME\) Tj ET\s*BT /F1 9 Tf [\d. ]+ rg [\d.]+ [\d.]+ Td \((?:Answer: )?(.*?)\) Tj ET')
LABEL = re.compile(rb'BT /F1 7 Tf 1 1 1 rg 19(?:\.0+)? ([\d.]+) Td \((Q\d+ (?:QUESTION|MARK SCHEME)(?: \(cont\.\))?)\) Tj ET')
STRIP = re.compile(rb'BT /F1 7 Tf 1 1 1 rg 19 ([\d.]+) Td \(Q\d+ MARK SCHEME\) Tj ET')


def pagemeta(path):
    """What the browser needs to cut a year PDF: a letter per page (c cover, q question, m mark scheme,
    x multiple choice with the answer under each question), where those answer lines sit, the answers,
    and on written pages each question label (y, text) so a worksheet can renumber it."""
    kinds, strips, labels = [], {}, {}
    with pikepdf.open(path) as pdf:
        for i, pg in enumerate(pdf.pages):
            b = R.stream(pg)
            q, m = re.search(rb'\(Q\d+ QUESTION', b), re.search(rb'\(Q\d+ MARK SCHEME', b)
            kinds.append('x' if q and m and ANS.search(b) else 'm' if m else 'q' if q else 'c')
            if kinds[-1] == 'x':
                strips[i] = [round(float(v) - 3.6, 1) for v in STRIP.findall(b)]
            elif kinds[-1] in 'qm':
                labels[i] = [[round(float(y) - 3.6, 2), t.decode('latin-1')] for y, t in LABEL.findall(b)]
    srcs, answers = {}, {}
    with pikepdf.open(path) as pdf:
        for pg in pdf.pages:
            b = R.stream(pg)
            for m in QSRC.finditer(b):
                srcs.setdefault(int(m[1]), m[2].decode('latin-1'))
            for m in ANS.finditer(b):
                answers[int(m[1])] = m[2].decode('latin-1')
    answers = [[n, srcs.get(n, ''), a if len(a) == 1 else '-'] for n, a in sorted(answers.items())]
    return dict(p=''.join(kinds), s=strips, a=answers, k=marks(path, kinds, len(answers)), l=labels)


def marks(path, kinds, mcq):
    """Total marks: 1 per multiple choice question. A written question's pages are read together: its [Total: n]
    lines if it has them, otherwise its [n] part marks."""
    doc, texts = pypdfium2.PdfDocument(path), collections.defaultdict(str)
    with pikepdf.open(path) as pdf:
        for i, k in enumerate(kinds):
            m = re.search(rb'\(Q(\d+) QUESTION', R.stream(pdf.pages[i])) if k == 'q' else None
            if m:
                texts[int(m[1])] += (doc[i].get_textpage().get_text_range() or '') + '\n'
    doc.close()
    total = mcq
    for text in texts.values():
        tot = re.findall(r'\[\s*Total\s*:?\s*(\d+)\s*\]', text, re.I)
        total += sum(map(int, tot)) if tot else sum(int(v) for v in re.findall(r'\[(\d{1,2})\]', text))
    return total


def main(keys):
    lib = json.load(open(LIB, encoding='utf8'))
    years = lib.setdefault('years', {})
    os.makedirs(PAGES, exist_ok=True)
    for key in keys:
        found = json.load(open(os.path.join(OUT, key + '.json'), encoding='utf8'))
        for tid, by_year in found.items():
            rows, meta = [], {}
            for y, rel in sorted(by_year.items(), reverse=True):
                j = jump(os.path.join(OUT, rel.lstrip('/')))
                meta[y] = pagemeta(os.path.join(OUT, rel.lstrip('/')))
                json.dump(j, open(os.path.join(JUMP, f'{tid}-{y}.json'), 'w', encoding='utf8'), separators=(',', ':'))
                rows.append([int(y), rel, len(j), meta[y]['k']])
            years[tid] = rows
            json.dump(meta, open(os.path.join(PAGES, tid + '.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
        print(key, len(found), 'topicals with years', flush=True)
    json.dump(lib, open(LIB, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))


if __name__ == '__main__':
    main(sys.argv[1:])
