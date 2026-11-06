"""Find the page in a random sample of cleaned files whose ink grew most, and render it beside the original.
python darkest.py <count> <out.png>"""
import glob, os, random, sys
import numpy as np, pypdfium2
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from verify_clean import HOST, original


def worst(pair):
    new, old = pair
    A, B = pypdfium2.PdfDocument(old), pypdfium2.PdfDocument(new); best = (0, 0)
    for i in range(len(A)):
        a = np.asarray(A[i].render(scale=1).to_pil().convert('L')); b = np.asarray(B[i].render(scale=1).to_pil().convert('L'))
        ia, ib = (a < 128).sum(), (b < 128).sum()
        if ia > 2000 and ib / ia > best[0]:
            best = (ib / ia, i)
    return new, old, best


if __name__ == '__main__':
    import multiprocessing
    files = glob.glob(os.path.join(HOST, '*', 'Topicals', '**', '*.pdf'), recursive=True)
    pairs = [(f, original(f)) for f in files]; pairs = [p for p in pairs if p[1]]
    random.seed(11); pairs = random.sample(pairs, int(sys.argv[1]))
    with multiprocessing.Pool(4) as pool:
        res = sorted(pool.map(worst, pairs), key=lambda r: -r[2][0])
    for new, old, (r, i) in res[:5]:
        print(round(r, 2), os.path.relpath(new, HOST), 'page', i + 1)
    new, old, (r, i) = res[0]
    X = pypdfium2.PdfDocument(old)[i].render(scale=1.5).to_pil(); Y = pypdfium2.PdfDocument(new)[i].render(scale=1.5).to_pil()
    h = min(X.height, 460)
    w = Image.new('RGB', (X.width * 2 + 10, h), 'red'); w.paste(X.crop((0, 0, X.width, h)), (0, 0)); w.paste(Y.crop((0, 0, X.width, h)), (X.width + 10, 0)); w.save(sys.argv[2])
