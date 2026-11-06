"""Compare cleaned host PDFs with their originals (pipeline/years and pipeline/rebuilt).  python verify_clean.py [count]
For a random sample (or every file with count 0): nothing visible may get lighter, and the text outside the questions
must be gone. Prints one line per problem file and a summary."""
import glob, os, random, re, sys
import numpy as np, pypdfium2

HERE = os.path.dirname(os.path.abspath(__file__))
HOST = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'BeforeExams')


def original(path):
    rel = os.path.relpath(path, HOST)
    for base in (os.path.join(HERE, 'years'), os.path.join(HERE, 'rebuilt')):
        p = os.path.join(base, rel)
        if os.path.exists(p):
            return p
    return None


def label_rows(path):
    import pikepdf
    sys.path.insert(0, HERE)
    import recompose as R
    from apply_years import LABEL
    with pikepdf.open(path) as pdf:
        return [[float(y) - 3.6 for y, t in LABEL.findall(R.stream(pg))] for pg in pdf.pages]


def compare(pair):
    new, old = pair
    try:
        A, B = pypdfium2.PdfDocument(old), pypdfium2.PdfDocument(new)
        if len(A) != len(B):
            return new, 'page count %d -> %d' % (len(A), len(B))
        worst, chars_a, chars_b, ratio = 0, 0, 0, 0.0
        rows = label_rows(old)
        for i in range(len(A)):
            a = np.asarray(A[i].render(scale=1).to_pil().convert('L'), dtype=np.int16)
            b = np.asarray(B[i].render(scale=1).to_pil().convert('L'), dtype=np.int16)
            if a.shape != b.shape:
                return new, 'page %d size changed' % (i + 1)
            H = a.shape[0]
            for y in rows[i]:   # the label row itself is meant to change
                top, bot = max(0, int(H - y - 12) - 2), min(H, int(H - y) + 2)
                a[top:bot, 0:340] = 255; b[top:bot, 0:340] = 255
            worst = max(worst, int(((b - a) > 40).sum()))
            ink_a, ink_b = int((a < 128).sum()), int((b < 128).sum())
            if ink_a > 2000:   # thicker letters add ink, but a page should never turn into a blob
                ratio = max(ratio, ink_b / ink_a)
            chars_a += len(re.sub(r'\s', '', A[i].get_textpage().get_text_range()))
            chars_b += len(re.sub(r'\s', '', B[i].get_textpage().get_text_range()))
        return new, (worst, chars_a, chars_b, round(ratio, 2))
    except Exception as e:
        return new, 'error %s' % e


def main(count):
    files = glob.glob(os.path.join(HOST, '*', 'Topicals', '**', '*.pdf'), recursive=True)
    pairs = [(f, original(f)) for f in files]
    pairs = [p for p in pairs if p[1]]
    random.seed(11)
    if count:
        pairs = random.sample(pairs, min(count, len(pairs)))
    import multiprocessing
    bad = 0; ta = tb = 0; ratios = []
    with multiprocessing.Pool(4) as pool:
        for n, (f, r) in enumerate(pool.imap_unordered(compare, pairs), 1):
            if isinstance(r, str) or r[0] > 30 or r[3] > 1.8:
                bad += 1; print('PROBLEM', os.path.relpath(f, HOST), r, flush=True)
            else:
                ta += r[1]; tb += r[2]; ratios.append(r[3])
    ratios.sort()
    print(f'{len(pairs)} files compared, {bad} with problems; text {ta} -> {tb} characters;'
          f' ink ratio median {ratios[len(ratios) // 2] if ratios else 0}, highest {ratios[-1] if ratios else 0}')


if __name__ == '__main__':
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 200)
