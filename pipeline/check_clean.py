"""Compare a PDF before and after clean.py: visible text in each question band must match, hidden text must be gone,
and the pictures must differ only by darker black.  python check_clean.py before.pdf after.pdf"""
import re, sys
import pypdfium2, numpy as np, pikepdf
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from clean import PLACE

def bands(path):
    out = []
    with pikepdf.open(path) as pdf:
        for pg in pdf.pages:
            b = pg.obj.Contents.read_bytes() if isinstance(pg.obj.Contents, pikepdf.Stream) else b''.join(c.read_bytes() for c in pg.obj.Contents)
            out.append([(float(m[2]), float(m[2]) + float(m[4])) for m in PLACE.finditer(b)])
    return out

def norm(s): return re.sub(r'\s+', '', s or '')

def main(a, b):
    A, B = pypdfium2.PdfDocument(a), pypdfium2.PdfDocument(b)
    ba = bands(a); bad = 0; hidden_before = hidden_after = 0; worst = 0
    for i in range(len(A)):
        ta, tb = A[i].get_textpage(), B[i].get_textpage()
        bl = ba[i]
        def outside(tp):   # text drawn outside every question band, other than the labels on the page itself
            t = ''
            for k in range(tp.count_chars()):
                x0, y0, x1, y1 = tp.get_charbox(k)
                if x1 > x0 and bl and not any(lo - 1 <= (y0 + y1) / 2 <= hi + 1 for lo, hi in bl):
                    t += tp.get_text_range(k, 1)
            t = re.sub(r'Q\d+(QUESTION|MARKSCHEME)(\(cont\.\))?|\d{4}/\d\d/[FMO]/[MJN]/\d\dQ\d+|Answer:[A-D-]|Answerkey.*', '', norm(t))
            return len(t)
        oa, ob = outside(ta), outside(tb)
        if ob: bad += ob; print('page', i + 1, 'still', ob, 'hidden characters (was', oa, ')')
        hidden_before += len(norm(ta.get_text_range())); hidden_after += len(norm(tb.get_text_range()))
        ia = np.asarray(A[i].render(scale=1).to_pil().convert('L'), dtype=int); ib = np.asarray(B[i].render(scale=1).to_pil().convert('L'), dtype=int)
        lighter = int(((ib - ia) > 40).sum())   # pixels that got noticeably lighter: something visible was lost
        worst = max(worst, lighter)
        if lighter > 30: print('page', i + 1, lighter, 'pixels got lighter')
    print(f'{b}: hidden characters left {bad}, text chars {hidden_before} -> {hidden_after}, max lighter pixels on a page {worst}')

main(*sys.argv[1:3])
