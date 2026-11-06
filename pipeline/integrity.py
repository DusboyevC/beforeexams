"""Structural check of every cleaned host topical PDF against its original.  python integrity.py
Each file must open, have the same number of pages, and keep every question label (text and height) on the same
pages, because the site's page maps, numbering, cutting and answer keys depend on them."""
import glob, os, re, sys
import pikepdf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import recompose as R
from apply_years import LABEL, ANS
from verify_clean import HOST, original


NEW = re.compile(rb'q 0\.18 0\.49 0\.36 rg 14 ([\d.]+) [\d.]+ 12 re f Q\nBT /F1 8 Tf 1 1 1 rg 19 [\d.]+ Td \(((?:[^()\\]|\\.)*)\) Tj ET(?:\nBT /F1 9 Tf [\d. ]+ rg [\d.]+ [\d.]+ Td \(((?:[^()\\]|\\.)*)\) Tj ET)?')
OLDANS = re.compile(rb'\(Q\d+ MARK SCHEME\) Tj ET\s*BT /F1 9 Tf [\d. ]+ rg [\d.]+ [\d.]+ Td \(((?:[^()\\]|\\.)*)\) Tj ET')


def expected(path):
    """From the original: per page, (rect y, label text, answer) for every label."""
    out = []
    with pikepdf.open(path) as pdf:
        for pg in pdf.pages:
            b = R.stream(pg); page = []
            answers = iter(OLDANS.findall(b))
            for y, t in LABEL.findall(b):
                t = t.decode('latin-1'); n = re.match(r'Q(\d+)', t)[1]; ms = 'MARK SCHEME' in t
                text = ('Mark scheme \xb7 Question ' if ms else 'Question ') + n + (' (continued)' if 'cont' in t else '')
                page.append((round(float(y) - 3.6, 2), text))
            out.append((page, [a.decode('latin-1') for a in OLDANS.findall(b)]))
    return out


def found(path):
    out = []
    with pikepdf.open(path) as pdf:
        for pg in pdf.pages:
            b = R.stream(pg)
            if b'/F1 7 Tf 1 1 1 rg' in b:
                raise ValueError('old label left')
            page = []; answers = []
            for y, t, ans in NEW.findall(b):
                t = t.replace(b'\\(', b'(').replace(b'\\)', b')').decode('cp1252')
                page.append((round(float(y), 2), t))
                if ans:
                    answers.append(ans.decode('cp1252'))
            out.append((page, answers))
    return out


def check(f):
    o = original(f)
    try:
        new = found(f)
        if o is None:
            return f, 'ok-no-original'
        old = expected(o)
        if len(new) != len(old):
            return f, 'pages %d -> %d' % (len(old), len(new))
        for i, (a, b) in enumerate(zip(old, new)):
            if a != b:
                return f, 'labels differ on page %d: %s vs %s' % (i + 1, a[0][:2] + a[1][:1], b[0][:2] + b[1][:1])
        return f, 'ok'
    except Exception as e:
        return f, 'error %s' % e


def main():
    files = glob.glob(os.path.join(HOST, '*', 'Topicals', '**', '*.pdf'), recursive=True)
    import multiprocessing, collections
    count = collections.Counter()
    with multiprocessing.Pool(4) as pool:
        for f, r in pool.imap_unordered(check, files, chunksize=8):
            count[r if r.startswith('ok') else 'problem'] += 1
            if not r.startswith('ok'):
                print('PROBLEM', os.path.relpath(f, HOST), r, flush=True)
    print(len(files), 'files:', dict(count))


if __name__ == '__main__':
    main()
