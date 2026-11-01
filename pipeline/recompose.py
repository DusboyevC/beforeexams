"""Rebuild topical PDFs from the question crops already inside them, without touching the crops.
read_items() takes a topical apart. write() makes a new one in question, mark scheme, question, mark scheme order."""
import io, re
import pikepdf, pypdfium2
from pikepdf import Array, Dictionary, Name, Pdf

A4 = (595.2756, 841.8898)
GREEN = '0.18 0.49 0.36'
PLACE = re.compile(rb'^q (-?[\d.]+) (-?[\d.]+) (-?[\d.]+) (-?[\d.]+) re W n (-?[\d.]+) 0 0 (-?[\d.]+) (-?[\d.]+) (-?[\d.]+) cm (.*?)\s*(/\w+) Do Q$')
TAGTXT = re.compile(rb'\((Q\d+)( QUESTION| MARK SCHEME)?( \(cont\.\))?\) Tj')
SUBTXT = re.compile(rb'BT /F2 7 Tf .*? Td \((.*)\) Tj ET$')
KEY = re.compile(r'Q(\d+)\s+([A-D]|–|-)\s+\S+/\S+/\S+/\d+\s+Q\d+')
SRC = re.compile(r'(\d{4})/(\d)(\d)/([FMO]/[MJN])/(\d\d)\s+Q(\d+)')


def stream(p):
    c = p.obj.get('/Contents')
    if c is None:
        return b''
    return b'\n'.join(s.read_bytes() for s in c) if isinstance(c, pikepdf.Array) else c.read_bytes()


def read_items(path):
    """Returns (cover_page_count, {n: item}). item: src, mcq, answer, and blocks (MCQ) or pages (others)."""
    pdf = Pdf.open(path)
    doc = pypdfium2.PdfDocument(path)
    items, answers, first = {}, {}, None
    for i, p in enumerate(pdf.pages):
        b = stream(p)
        if b'ANSWER KEY' in b or (first is not None and not TAGTXT.search(b)):
            text = doc[i].get_textpage().get_text_range() or ''
            answers.update({int(m[1]): m[2] for m in KEY.finditer(text)})
            continue
        cur = None
        for line in b.split(b'\n'):
            m = TAGTXT.search(line)
            if m and b'/F1 7 Tf' in line:
                if first is None:
                    first = i
                n = int(m[1][1:])
                cur = items.setdefault(n, dict(n=n, src='', mcq=not m[2], blocks=[], pages=[], answer=''))
                if m[2] and i not in cur['pages']:
                    cur['pages'].append(i)
                continue
            if cur is None:
                continue
            s = SUBTXT.search(line)
            if s and not cur['src']:
                t = SRC.search(s[1].decode('latin-1'))
                cur['src'] = re.sub(r'\s+', ' ', t[0]) if t else ''
                continue
            m = PLACE.match(line)
            if m and cur['mcq']:
                xo = p.obj['/Resources']['/XObject'][m[10].decode()]
                cur['blocks'].append(dict(y=float(m[2]), x=float(m[1]), w=float(m[3]), h=float(m[4]), rest=(m[5], m[6], float(m[7]), float(m[8]), m[9]), xo=xo))
    for it in items.values():
        it['answer'] = answers.get(it['n'], '')
    doc.close()
    return pdf, first or 1, items


class Out:
    def __init__(self):
        self.pdf = Pdf.new()
        self.fonts = self.pdf.make_indirect(Dictionary(
            F1=Dictionary(Type=Name.Font, Subtype=Name.Type1, BaseFont=Name('/Helvetica-Bold'), Encoding=Name.WinAnsiEncoding),
            F2=Dictionary(Type=Name.Font, Subtype=Name.Type1, BaseFont=Name('/Helvetica'), Encoding=Name.WinAnsiEncoding)))
        self.forms = {}
        self.ops, self.xobjs = [], {}
        self.cursor = A4[1] - 22

    def flush(self):
        if self.ops:
            pg = Dictionary(Type=Name.Page, MediaBox=Array([0, 0, A4[0], A4[1]]), Resources=Dictionary(Font=self.fonts, XObject=Dictionary(self.xobjs)), Contents=self.pdf.make_stream(b'\n'.join(self.ops)))
            self.pdf.pages.append(pikepdf.Page(pg))
        self.ops, self.xobjs = [], {}
        self.cursor = A4[1] - 22

    def tag(self, text, sub=b''):
        y = self.cursor - 12
        tw = len(text) * 4.3 + 10
        self.ops.append(f'q {GREEN} rg 14 {y:.2f} {tw:.2f} 12 re f Q'.encode())
        self.ops.append(f'BT /F1 7 Tf 1 1 1 rg 19 {y + 3.6:.2f} Td ({text}) Tj ET'.encode())
        if sub:
            self.ops.append(f'BT /F2 7 Tf 0.45 0.45 0.45 rg {14 + tw + 6:.2f} {y + 3.6:.2f} Td ('.encode() + sub + b') Tj ET')
        self.cursor = y - 4

    def form(self, src_id, xo):
        key = (src_id, xo.objgen)
        if key not in self.forms:
            self.forms[key] = (f'/X{len(self.forms)}', self.pdf.copy_foreign(xo))
        return self.forms[key]

    def block(self, src_id, b):
        name, fx = self.form(src_id, b['xo'])
        s, sy, tx, ty, r = b['rest']
        dy = self.cursor - (b['y'] + b['h'])
        self.ops.append(b'q %.2f %.2f %.2f %.2f re W n %s 0 0 %s %.3f %.3f cm %s %s Do Q' % (b['x'], b['y'] + dy, b['w'], b['h'], s, sy, tx, ty + dy, r, name.encode()))
        self.xobjs[name] = fx
        self.cursor -= b['h'] + 6

    def mcq_item(self, src_id, new_n, it):
        sub = it['src'].encode('latin-1')
        ans = it['answer'] if it['answer'] in ('A', 'B', 'C', 'D') else ''
        need = sum(b['h'] + 6 for b in it['blocks']) + 16 + 16 + 14
        if self.cursor - need < 12:
            self.flush()
        self.tag(f'Q{new_n} QUESTION', sub)
        for b in it['blocks']:
            if self.cursor - b['h'] < 40:
                self.flush()
                self.tag(f'Q{new_n} QUESTION (cont.)', sub)
            self.block(src_id, b)
        self.cursor -= 2
        self.tag(f'Q{new_n} MARK SCHEME')
        y = self.cursor + 4 + 3
        x = 14 + len(f'Q{new_n} MARK SCHEME') * 4.3 + 10 + 8
        note = f'Answer: {ans}' if ans else 'No published answer for this question.'
        self.ops.append(f'BT /F1 9 Tf 0.1 0.1 0.1 rg {x:.2f} {y:.2f} Td ({note}) Tj ET'.encode())
        self.cursor -= 12

    def copy_page(self, spdf, i, old_n, new_n):
        p = self.pdf.copy_foreign(spdf.pages[i].obj)
        b = stream(spdf.pages[i])
        if old_n != new_n:
            b = b.replace(b'(Q%d ' % old_n, b'(Q%d ' % new_n)
        p[Name.Contents] = self.pdf.make_stream(b)
        self.pdf.pages.append(pikepdf.Page(p))

    def copy_raw(self, spdf, i):
        self.pdf.pages.append(spdf.pages[i])

    def add_pdf(self, data):
        self._keep = getattr(self, '_keep', []) + [Pdf.open(io.BytesIO(data))]
        for p in self._keep[-1].pages:
            self.pdf.pages.append(p)

    def save(self, path):
        self.flush()
        self.pdf.save(path, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)


def convert_mcq(src, dst):
    """Same questions, same order: each answer now sits under its question."""
    pdf, first, items = read_items(src)
    out = Out()
    for i in range(first):
        out.copy_raw(pdf, i)
    for n in sorted(items):
        out.mcq_item(0, n, items[n])
    out.save(dst)
    pdf.close()
    return len(items), sum(1 for it in items.values() if it['answer'] not in ('A', 'B', 'C', 'D'))
