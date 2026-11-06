"""Replace the small grey question labels in the built topical and year PDFs with clear ones, in place.
python relabel.py <folder or pdf>...
"Q3 QUESTION  9702/22/O/N/15 Q1" (7 point) becomes a green "Question 3" (8 point) followed by
"Paper 22 · Oct/Nov 2015 · Q1" in dark text; mark scheme labels become "Mark scheme · Question 3", continued pages
say "(continued)", and multiple choice answers stay beside their label. Everything stays inside the old 12 point
label row, which is empty on every page apart from the label, so nothing of a question is touched. The site's page
maps keep working because the rows do not move. Files are marked /BELabels and skipped when run again."""
import glob, os, re, sys
import pikepdf
from reportlab.pdfbase.pdfmetrics import stringWidth

GROUP = re.compile(
    rb'q 0\.18 0\.49 0\.36 rg 14 ([\d.]+) [\d.]+ 12 re f Q\s*'
    rb'BT /F1 7 Tf 1 1 1 rg 19(?:\.0+)? [\d.]+ Td \(Q(\d+) (QUESTION|MARK SCHEME)( \\\(cont\\\.\\\)| \(cont\.\))?\) Tj ET'
    rb'(?:\s*BT /F([12]) (7|9) Tf [\d. ]+ rg [\d.]+ [\d.]+ Td \(((?:[^()\\]|\\.)*)\) Tj ET)?')
SESSION = {'F/M': 'Feb/March', 'M/J': 'May/June', 'O/N': 'Oct/Nov'}
SRC = re.compile(r'\d{4}/(\d\d)/([FMO]/[MJN])/(\d\d)\s+Q(\d+)')
DOT = '·'


def pdf_string(s):
    b = s.encode('cp1252')   # the label fonts use WinAnsi, where the middle dot is 0xB7
    return b.replace(b'\\', b'\\\\').replace(b'(', b'\\(').replace(b')', b'\\)')


def source_text(raw):
    m = SRC.search(raw)
    if not m:
        return raw.strip()
    return f'Paper {m[1]} {DOT} {SESSION[m[2]]} 20{m[3]} {DOT} Q{m[4]}'


def new_label(m):
    y = float(m[1]); n = int(m[2]); ms = m[3] == b'MARK SCHEME'; cont = bool(m[4])
    text = ('Mark scheme ' + DOT + ' Question ' if ms else 'Question ') + str(n) + (' (continued)' if cont else '')
    w = stringWidth(text, 'Helvetica-Bold', 8) + 10
    out = b'q 0.18 0.49 0.36 rg 14 %.2f %.2f 12 re f Q\nBT /F1 8 Tf 1 1 1 rg 19 %.2f Td (' % (y, w, y + 3.4) + pdf_string(text) + b') Tj ET'
    if m[7] is not None:
        extra = m[7].replace(b'\\(', b'(').replace(b'\\)', b')').replace(b'\\\\', b'\\').decode('cp1252')
        if m[5] == b'1' and m[6] == b'9':   # multiple choice answer: "Answer: B"
            out += b'\nBT /F1 9 Tf 0.1 0.1 0.1 rg %.2f %.2f Td (' % (14 + w + 7, y + 3) + pdf_string(extra) + b') Tj ET'
        else:
            out += b'\nBT /F2 8 Tf 0.2 0.2 0.2 rg %.2f %.2f Td (' % (14 + w + 7, y + 3.4) + pdf_string(source_text(extra)) + b') Tj ET'
    return out


def stream(pg):
    c = pg.obj.get('/Contents')
    parts = list(c) if isinstance(c, pikepdf.Array) else [c] if c is not None else []
    return b''.join(p.read_bytes() for p in parts)


def relabel(path):
    n = 0
    with pikepdf.open(path, allow_overwriting_input=True) as pdf:
        if '/BELabels' in pdf.Root:
            return 0
        for pg in pdf.pages:
            b = stream(pg)
            if b'/F1 7 Tf 1 1 1 rg' not in b:
                continue
            nb, k = GROUP.subn(new_label, b)
            if k:
                pg.obj.Contents = pdf.make_stream(nb)
                n += k
        pdf.Root['/BELabels'] = True
        pdf.save(path, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
    return n


def one(f):
    try:
        return f, relabel(f), None
    except Exception as e:
        return f, 0, str(e)


def main(args):
    files = []
    for a in args:
        files += [a] if a.lower().endswith('.pdf') else glob.glob(os.path.join(a, '**', '*.pdf'), recursive=True)
    import multiprocessing
    tot = 0
    with multiprocessing.Pool(min(4, os.cpu_count() or 1)) as pool:
        for i, (f, n, err) in enumerate(pool.imap_unordered(one, files, chunksize=8), 1):
            if err:
                print('ERROR', f, err, flush=True)
            tot += n
            if i % 500 == 0 or i == len(files):
                print(f'{i}/{len(files)} files, {tot} labels', flush=True)


if __name__ == '__main__':
    main(sys.argv[1:])
