"""Check every year PDF for the question labels the website redraws.
1. labels the page map misses (the old small label would stay visible)
2. anything else printed inside the area the website paints white before drawing the new label
python check_labels.py [subject folder]..."""
import glob, json, os, re, sys
import pikepdf, pypdfium2
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import recompose as R
from apply_years import LABEL

ANY = re.compile(rb'BT /F1 7 Tf 1 1 1 rg ([\d.]+) ([\d.]+) Td \((Q\d+ [^)]*)\) Tj ET')
SRC = re.compile(rb'BT /F2 7 Tf [\d. ]+ rg ([\d.]+) ([\d.]+) Td \(([^)]*)\) Tj ET')
BOX = (10, -2.5, 390, 14.5)   # x0, y offsets, x1 of the white box, from the label's y (as stored in the page map)


def check(path):
    missed, hits = [], []
    doc = pypdfium2.PdfDocument(path)
    with pikepdf.open(path) as pdf:
        for i, pg in enumerate(pdf.pages):
            b = R.stream(pg)
            allq = ANY.findall(b)
            if not allq:
                continue
            got = LABEL.findall(b)
            if len(got) != len(allq):
                missed.append((i, [a[2].decode('latin-1') for a in allq], len(got)))
            srcs = [s[2].decode('latin-1') for s in SRC.findall(b)]
            tp = doc[i].get_textpage()
            for y, t in got:
                y = float(y) - 3.6
                txt = tp.get_text_bounded(left=BOX[0], bottom=y + BOX[1], right=BOX[2], top=y + BOX[3]) or ''
                rest = txt.replace(t.decode('latin-1'), '')
                for s in srcs:
                    rest = rest.replace(s, '')
                rest = re.sub(r'\s+', '', rest)
                if rest:
                    hits.append((i, t.decode('latin-1'), round(y, 1), rest[:60]))
    doc.close()
    return missed, hits


def main(subjects):
    roots = subjects or sorted(os.listdir(os.path.join(HERE, 'years')))
    report = {}
    n = 0
    for sub in roots:
        files = glob.glob(os.path.join(HERE, 'years', sub, '**', '*.pdf'), recursive=True)
        for f in files:
            n += 1
            m, h = check(f)
            if m or h:
                report[os.path.relpath(f, os.path.join(HERE, 'years'))] = {'missed': m, 'covered': h}
        print(sub, len(files), 'files,', sum(1 for k in report if k.startswith(sub)), 'with problems', flush=True)
    json.dump(report, open(os.path.join(HERE, 'label_report.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
    print('checked', n, 'files;', len(report), 'with problems')


if __name__ == '__main__':
    main(sys.argv[1:])
