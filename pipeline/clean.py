"""Clean the built topical and year PDFs in place.  python clean.py <folder or pdf>...
Each question is a whole Cambridge page drawn through a clip, so text from the questions around it was still in
the file: invisible, but found by search and copy. Every placement gets its own copy of the page with only the
text that shows inside its clip. Thin old fonts (TrueType converted to Type 1, which screens draw light grey)
are thickened to the weight of the newer papers. Files are rewritten only when something changed."""
import glob, math, os, re, sys, tempfile
import io
sys.setrecursionlimit(5000)
import pikepdf
import pathops
from fontTools.cffLib import CFFFontSet
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.misc.psCharStrings import T2WidthExtractor
from pikepdf import Name, Operator, Array, Dictionary

PLACE = re.compile(rb'q ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) re W n ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) cm\s+/(\w+) Do Q')
SHOW = {'Tj', 'TJ', "'", '"'}


def mul(a, b):   # PDF matrices as (a b c d e f), row-vector convention: p' = p x a x b
    return (a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3],
            a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3],
            a[4] * b[0] + a[5] * b[2] + b[4], a[4] * b[1] + a[5] * b[3] + b[5])


I = (1, 0, 0, 1, 0, 0)


def nchars(op, operands):
    if op == 'TJ':
        return sum(len(bytes(x)) for x in operands[0] if isinstance(x, pikepdf.String))
    s = operands[-1]
    return len(bytes(s)) if isinstance(s, pikepdf.String) else 1


THIN = re.compile(r'\+TT\d+o00$')   # TrueType fonts converted to Type 1 in older papers: screens draw them thin and grey
BOLDEN = 29   # thousandths of the letter size the thin old fonts are thickened by, half on each side of every stroke


def filtered(stream, place, lo, hi, pdf, depth=0, left=-1e9, right=1e9):
    """Content of one form, keeping only text that shows between page heights lo and hi.
    Forms drawn inside it are filtered the same way; returns the content and its new resources."""
    out, stack = [], []
    res = stream.get('/Resources'); xo = res.get('/XObject') if res is not None else None; subs = {}
    st = dict(ctm=I, fs=0.0, lead=0.0)
    tm = tlm = I
    drop_line = False

    def emit(o, *v):
        out.append((list(v), Operator(o)))


    for operands, op in pikepdf.parse_content_stream(stream):
        o = str(op)
        if o == 'q': stack.append(dict(st))
        elif o == 'Q': st = stack.pop() if stack else dict(st, ctm=I)
        elif o == 'cm': st['ctm'] = mul(tuple(float(v) for v in operands), st['ctm'])
        elif o == 'BT':
            tm = tlm = I; drop_line = False
        elif o == 'Tf': st['fs'] = float(operands[1])
        elif o == 'TL': st['lead'] = float(operands[0])
        elif o in ('Td', 'TD'):
            tx, ty = float(operands[0]), float(operands[1])
            if o == 'TD': st['lead'] = -ty
            tlm = mul((1, 0, 0, 1, tx, ty), tlm); tm = tlm; drop_line = False
        elif o == 'Tm':
            tlm = tm = tuple(float(v) for v in operands); drop_line = False
        elif o == 'T*':
            tlm = mul((1, 0, 0, 1, 0, -st['lead']), tlm); tm = tlm; drop_line = False
        if o in ("'", '"'):
            tlm = mul((1, 0, 0, 1, 0, -st['lead']), tlm); tm = tlm; drop_line = False
        if o in SHOW:
            fs = st['fs']
            m = mul(mul(tm, st['ctm']), place)
            n = max(1, nchars(o, operands))
            ys = [m[5] + s * n * 0.6 * fs * m[1] + t * fs * m[3] for s in (0, 1) for t in (-0.25, 0.9)]
            xs = [m[4] + s * n * 0.6 * fs * m[0] + t * fs * m[2] for s in (0, 1) for t in (-0.25, 0.9)]
            if drop_line or max(ys) <= lo or min(ys) >= hi or max(xs) <= left or min(xs) >= right:
                drop_line = True   # the rest of this line sits further along the same baseline
                if o == '"':   # keep its spacing settings, drop the text
                    emit('Tw', operands[0]); emit('Tc', operands[1])
                if o in ("'", '"'):   # and keep its move to the next line
                    emit('T*')
                continue
        if o == 'Do' and xo is not None and depth < 150:
            nm = str(operands[0]); f = xo.get(nm)
            if f is not None and str(f.get('/Subtype')) == '/Form':
                if nm not in subs:
                    fm = tuple(float(v) for v in f.get('/Matrix', [1, 0, 0, 1, 0, 0]))
                    subs[nm] = form_copy(f, mul(mul(fm, st['ctm']), place), lo, hi, pdf, depth + 1, left, right)
        out.append((operands, op))
    data = pikepdf.unparse_content_stream(out)
    if not subs:
        return data, None
    nres = Dictionary({k: res[k] for k in res.keys()})
    nxo = Dictionary({k: xo[k] for k in xo.keys()})
    for k, v in subs.items():
        nxo[k] = v
    nres['/XObject'] = nxo
    return data, nres


def form_copy(form, place, lo, hi, pdf, depth=0, left=-1e9, right=1e9):
    data, nres = filtered(form, place, lo, hi, pdf, depth, left, right)
    d = pdf.make_stream(data)
    for k in ('/Type', '/Subtype', '/BBox', '/Matrix', '/Resources', '/Group'):
        if k in form:
            d[k] = form[k]
    if nres is not None:
        d['/Resources'] = nres
    return d


_FONTS = {}   # the same font program turns up in many files of one paper


def bolden_cff(data, amount):
    """The same CFF font with every glyph outline grown by amount font units; advance widths stay the same."""
    key = (hash(data), len(data), amount)
    if key not in _FONTS:
        _FONTS[key] = _bolden_cff(data, amount)
    return _FONTS[key]


def _bolden_cff(data, amount):
    fs = CFFFontSet(); fs.decompile(io.BytesIO(data), None)
    top = fs[fs.fontNames[0]]
    if 'charset' not in top.rawDict:
        top.rawDict['charset'] = 0   # left out means the standard ISOAdobe charset
    fm = top.rawDict.get('FontMatrix', [0.001])[0] or 0.001
    amount = amount * 0.001 / fm   # amount is in thousandths of the letter size; fonts use 1000 or 2048 units
    cs = top.CharStrings; priv = top.Private
    gsubrs = fs.GlobalSubrs; lsubrs = getattr(priv, 'Subrs', [])
    nominal, default = getattr(priv, 'nominalWidthX', 0), getattr(priv, 'defaultWidthX', 0)
    new = {}
    for name in list(cs.keys()):
        c = cs[name]
        ext = T2WidthExtractor(lsubrs, gsubrs, nominal, default); ext.execute(c)
        width = ext.width
        path = pathops.Path(); c.draw(path.getPen())
        if amount and path.area:
            grown = pathops.Path(path)
            grown.stroke(amount, pathops.LineCap.BUTT_CAP, pathops.LineJoin.ROUND_JOIN, 4)
            grown.convertConicsToQuads()
            path = pathops.op(path, grown, pathops.PathOp.UNION, fix_winding=True)
            path.convertConicsToQuads()
        pen = T2CharStringPen(width - nominal, None)
        path.draw(pen)
        new[name] = pen.getCharString(private=priv, globalSubrs=gsubrs)
    for name, c in new.items():
        cs[name] = c
    out = io.BytesIO(); fs.compile(out, type('NoTT', (), {'recalcBBoxes': False})())
    return out.getvalue()


def bolden_fonts(pdf):
    """Thicken every thin old font in the file once. Returns how many fonts were changed."""
    done, n = set(), 0

    def fonts():
        seen = set()
        def walk(res, depth):
            if res is None or depth > 200:
                return
            for f in (res.get('/Font') or {}).values():
                yield f
            for x in (res.get('/XObject') or {}).values():
                if x.objgen in seen:
                    continue
                seen.add(x.objgen)
                yield from walk(x.get('/Resources'), depth + 1)
        for pg in pdf.pages:
            yield from walk(pg.obj.get('/Resources'), 0)

    for obj in fonts():
        if not THIN.search(str(obj.get('/BaseFont', ''))):
            continue
        fd = obj.get('/FontDescriptor'); ff = fd.get('/FontFile3') if fd is not None else None
        if ff is None or ff.objgen in done or str(ff.get('/Subtype')) != '/Type1C':
            continue
        done.add(ff.objgen)
        try:
            ff.write(bolden_cff(ff.read_bytes(), BOLDEN))
            n += 1
        except Exception as e:
            print('font left as it was:', obj.get('/BaseFont'), e, flush=True)
    return n


DONE = re.compile(rb'/C\d+x* Do')   # names this script gives the cleaned copies


def clean(path):
    changed, failed = 0, 0
    with pikepdf.open(path, allow_overwriting_input=True) as pdf:
        if '/BEClean' in pdf.Root or any(DONE.search(R_stream(pg)) for pg in pdf.pages[:3]):
            return 0, 0   # cleaned before: thickening the fonts twice would make them too bold
        for pg in pdf.pages:
            c = pg.obj.get('/Contents')
            parts = list(c) if isinstance(c, Array) else [c] if c is not None else []
            b = b''.join(p.read_bytes() for p in parts)
            xo = pg.Resources.get('/XObject') if '/Resources' in pg.obj else None
            if xo is None or not PLACE.search(b):
                continue
            new, count = [], [0]

            def sub(m):
                x0, y0, w, h = (float(v) for v in m.groups()[:4])
                place = tuple(float(v) for v in m.groups()[4:10])
                name = '/' + m[11].decode()
                form = xo.get(name)
                if form is None or str(form.get('/Subtype')) != '/Form':
                    return m[0]
                fm = tuple(float(v) for v in form.get('/Matrix', [1, 0, 0, 1, 0, 0]))
                try:
                    d = form_copy(form, mul(fm, place), y0, y0 + h, pdf, 0, x0, x0 + w)
                except Exception:
                    count.append('fail')
                    return m[0]
                count[0] += 1
                nm = '/C%d' % (len(xo.keys()) + count[0])
                while nm in xo:
                    nm += 'x'
                xo[nm] = d
                return m[0].replace(b'/' + m[11] + b' Do', nm.encode() + b' Do')

            nb = PLACE.sub(sub, b)
            failed += count.count('fail')
            if nb != b:
                pg.obj.Contents = pdf.make_stream(nb)
                changed += count[0]
        if changed:
            bolden_fonts(pdf)
            pdf.remove_unreferenced_resources()
            pdf.Root['/BEClean'] = True
            pdf.save(path, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
    return changed, failed


def R_stream(pg):
    c = pg.obj.get('/Contents')
    parts = list(c) if isinstance(c, Array) else [c] if c is not None else []
    return b''.join(p.read_bytes() for p in parts)


def one(f):
    try:
        return f, clean(f), None
    except Exception as e:
        return f, (0, 0), str(e)


def main(args):
    files = []
    for a in args:
        files += [a] if a.lower().endswith('.pdf') else glob.glob(os.path.join(a, '**', '*.pdf'), recursive=True)
    tot = fails = 0
    import multiprocessing
    with multiprocessing.Pool(min(4, os.cpu_count() or 1)) as pool:
        results = pool.imap_unordered(one, files, chunksize=4)
        for i, (f, (c, fl), err) in enumerate(results, 1):
            if err:
                print('ERROR', f, err, flush=True)
            tot += c; fails += fl
            if fl:
                print('kept as it was (could not read):', fl, f, flush=True)
            if i % 100 == 0 or i == len(files):
                print(f'{i}/{len(files)} files, {tot} questions cleaned, {fails} left as they were', flush=True)


if __name__ == '__main__':
    main(sys.argv[1:])
