"""Build topical chapter PDFs.

python3 build.py CODE COMPKEY CHAPTER OUTFILE   (single chapter)
Uses labels/CODE_final.json, seg/CODE/*.json, data/CODE/*.pdf
"""
import sys, os, json, re, io, importlib
import pikepdf
from pikepdf import Pdf, Name, Dictionary, Array, Stream

sys.path.insert(0, 'C:/Users/user/Downloads/BeforeExams-project/pipeline')
import cover

UNOFFICIAL = {'9702_s26_ms_21'}
A4P = (595.2756, 841.8898)
A4L = (841.8898, 595.2756)
SESS = {'m': ('F/M', 'Feb/March'), 's': ('M/J', 'May/June'), 'w': ('O/N', 'Oct/Nov')}
SESS_ORDER = {'w': 0, 's': 1, 'm': 2}  # newest first within a year


def parse_stem(stem):
    m = re.match(r'(\d{4})_([msw])(\d\d)_(qp|ms)_(\d)(\d)', stem)
    return dict(code=m[1], sess=m[2], yy=int(m[3]), year=2000 + int(m[3]), paper=m[5], variant=m[5] + m[6])


def src_label(stem, q):
    p = parse_stem(stem)
    return f"{p['code']}/{p['variant']}/{SESS[p['sess']][0]}/{p['yy']:02d}  Q{q}"


class Builder:
    def __init__(self, code):
        self.code = code
        self.out = Pdf.new()
        self.srcs = {}
        self.forms = {}
        self.fonts = Dictionary(
            F1=Dictionary(Type=Name.Font, Subtype=Name.Type1, BaseFont=Name('/Helvetica-Bold'), Encoding=Name.WinAnsiEncoding),
            F2=Dictionary(Type=Name.Font, Subtype=Name.Type1, BaseFont=Name('/Helvetica'), Encoding=Name.WinAnsiEncoding))
        self.fonts = self.out.make_indirect(self.fonts)
        self.page = None
        self.ops = []
        self.xobjs = {}

    # ---------- sources ----------
    def src(self, stem):
        if stem not in self.srcs:
            self.srcs[stem] = Pdf.open(f'C:/Users/user/Downloads/BeforeExams-project/pipeline/data/{self.code}/{stem}.pdf')
        return self.srcs[stem]

    def form(self, stem, pno):
        key = (stem, pno)
        if key not in self.forms:
            sp = self.src(stem).pages[pno]
            fx = sp.as_form_xobject(handle_transformations=False)
            fx = self.out.copy_foreign(fx)
            mb = [float(v) for v in sp.mediabox]
            rot = int(sp.obj.get('/Rotate', 0)) % 360
            name = f'/Fx{len(self.forms)}'
            self.forms[key] = (name, fx, mb, rot)
        return self.forms[key]

    # ---------- pages ----------
    def new_page(self, size):
        self.flush()
        self.size = size
        self.ops = []
        self.xobjs = {}
        self.cursor = size[1] - 22

    def flush(self):
        if self.ops is not None and getattr(self, 'size', None) and (self.ops or self.xobjs):
            W, H = self.size
            content = '\n'.join(self.ops).encode('latin-1', 'replace')
            pg = Dictionary(Type=Name.Page, MediaBox=Array([0, 0, W, H]),
                            Resources=Dictionary(Font=self.fonts, XObject=Dictionary({k: v for k, v in self.xobjs.items()})),
                            Contents=self.out.make_stream(content))
            self.out.pages.append(pikepdf.Page(pg))
        self.ops = []
        self.xobjs = {}

    def tag(self, text, sub=''):
        W, H = self.size
        y = self.cursor - 12
        tw = len(text) * 4.3 + 10
        self.ops.append(f'q 0.18 0.49 0.36 rg 14 {y:.2f} {tw:.2f} 12 re f Q')
        self.ops.append(f'BT /F1 7 Tf 1 1 1 rg {19:.2f} {y + 3.6:.2f} Td ({text}) Tj ET')
        if sub:
            self.ops.append(f'BT /F2 7 Tf 0.45 0.45 0.45 rg {14 + tw + 6:.2f} {y + 3.6:.2f} Td ({sub}) Tj ET')
        self.cursor = y - 4

    def place(self, stem, part, min_gap=4):
        """part = [page, y0, y1, w, h] in display coords (top-down)."""
        pno, y0, y1, pw, ph = part
        name, fx, mb, rot = self.form(stem, pno)
        W, H = self.size
        s = min(1.0, W / pw)
        hseg = (y1 - y0) * s
        avail_full = H - 22 - 16 - 10
        if hseg > avail_full:
            s = s * avail_full / hseg
            hseg = avail_full
        if self.cursor - hseg < 12:
            return False
        T = self.cursor
        x_off = (W - pw * s) / 2
        # display coords: x_d in [0,pw], y_d(bottom-up) = ph - ytop
        tx = x_off
        ty = T - (ph - y0) * s
        if '_qp_' in stem and pw < ph:   # drop the printed "DO NOT WRITE IN THIS MARGIN" strips
            clip = f'{x_off + 0.045 * pw * s:.2f} {T - hseg:.2f} {0.91 * pw * s:.2f} {hseg:.2f} re W n'
        else:
            clip = f'{x_off:.2f} {T - hseg:.2f} {pw * s:.2f} {hseg:.2f} re W n'
        Wu, Hu = mb[2] - mb[0], mb[3] - mb[1]
        if rot == 90:
            R = f'0 -1 1 0 0 {Wu:.3f} cm'
        elif rot == 270:
            R = f'0 1 -1 0 {Hu:.3f} 0 cm'
        elif rot == 180:
            R = f'-1 0 0 -1 {Wu:.3f} {Hu:.3f} cm'
        else:
            R = ''
        org = f'1 0 0 1 {-mb[0]:.3f} {-mb[1]:.3f} cm' if (mb[0] or mb[1]) else ''
        self.ops.append(f'q {clip} {s:.5f} 0 0 {s:.5f} {tx:.3f} {ty:.3f} cm {R} {org} {name} Do Q')
        self.xobjs[name] = fx
        self.cursor = T - hseg - min_gap
        return True

    def add_segments(self, stem, parts, size, tagtext, sub):
        self.new_page(size)
        self.tag(tagtext, sub)
        for part in parts:
            if not self.place(stem, part):
                self.new_page(size)
                self.tag(tagtext + ' (cont.)', sub)
                self.place(stem, part)

    def add_cover(self, pdfbytes):
        cp = Pdf.open(io.BytesIO(pdfbytes))
        self.flush()
        self.out.pages.append(self.out.copy_foreign(cp.pages[0].obj) and cp.pages[0])

    def add_pdf_pages(self, pdfbytes):
        self.flush()
        cp = Pdf.open(io.BytesIO(pdfbytes))
        self._keep = getattr(self, '_keep', []) + [cp]
        for p in cp.pages:
            self.out.pages.append(p)

    def save(self, path):
        self.flush()
        self.out.save(path, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
        for s in self.srcs.values():
            s.close()


def answer_key_pdf(rows, title):
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    W, H = A4P
    c = canvas.Canvas(buf, pagesize=(W, H))
    per_col, cols = 45, 2
    i = 0
    page_rows = [rows[k:k + per_col * cols] for k in range(0, len(rows), per_col * cols)]
    for pr in page_rows:
        c.setFillColorRGB(0.18, 0.49, 0.36)
        c.rect(14, H - 34, 110, 12, stroke=0, fill=1)
        c.setFillColorRGB(1, 1, 1)
        c.setFont('Helvetica-Bold', 7)
        c.drawString(19, H - 30.4, 'ANSWER KEY')
        c.setFillColorRGB(0.1, 0.1, 0.1)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(40, H - 60, title)
        for j, (q, ans, src) in enumerate(pr):
            col, r = divmod(j, per_col)
            x = 40 + col * 270
            y = H - 85 - r * 16
            c.setFont('Helvetica-Bold', 9)
            c.drawString(x, y, f'Q{q}')
            c.setFont('Helvetica-Bold', 10)
            c.drawString(x + 40, y, ans)
            c.setFont('Helvetica', 8)
            c.setFillColorRGB(0.4, 0.4, 0.4)
            c.drawString(x + 70, y, src)
            c.setFillColorRGB(0.1, 0.1, 0.1)
        c.showPage()
    c.save()
    return buf.getvalue()


def build_chapter(code, items, outpath, title, subject_line, syllabus, papers_label, mcq=False):
    """items: list of dicts {stem, q, parts, ms_stem, ms_parts or answer} already ordered."""
    b = Builder(code)
    years = [parse_stem(it['stem'])['year'] for it in items]
    ytxt = f'[{min(years)} – {max(years)}]' if min(years) != max(years) else f'[{min(years)}]'
    b.add_pdf_pages(cover.make_cover(title, subject_line, syllabus, papers_label, ytxt, len(items)))
    if mcq:
        b.new_page(A4P)
        for n, it in enumerate(items, 1):
            seg_h = sum(p[2] - p[1] for p in it['parts'])
            if b.cursor - seg_h - 20 < 12:
                b.new_page(A4P)
            b.tag(f'Q{n}', src_label(it['stem'], it['q']))
            for part in it['parts']:
                if not b.place(it['stem'], part, min_gap=10):
                    b.new_page(A4P)
                    b.tag(f'Q{n} (cont.)', src_label(it['stem'], it['q']))
                    b.place(it['stem'], part, min_gap=10)
        b.flush()
        rows = [(n, it.get('answer') or '–', src_label(it['stem'], it['q'])) for n, it in enumerate(items, 1)]
        b.add_pdf_pages(answer_key_pdf(rows, f'{title} – answers'))
    else:
        for n, it in enumerate(items, 1):
            sub = src_label(it['stem'], it['q'])
            b.add_segments(it['stem'], it['parts'], A4P, f'Q{n} QUESTION', sub)
            if it.get('ms_parts'):
                msize = A4L if it['ms_parts'][0][3] > it['ms_parts'][0][4] else A4P
                msub = sub + ('   UNOFFICIAL BeforeExams worked mark scheme (Cambridge MS not published)' if (it['ms_stem'] in UNOFFICIAL or it['ms_stem'].endswith('_unofficial')) else '')
                b.add_segments(it['ms_stem'], it['ms_parts'], msize, f'Q{n} MARK SCHEME', msub)
            else:
                b.new_page(A4P)
                b.tag(f'Q{n} MARK SCHEME', sub)
                b.ops.append(f'BT /F2 10 Tf 0.3 0.3 0.3 rg 40 {b.cursor - 30:.1f} Td (No published mark scheme is available for this question.) Tj ET')
    b.save(outpath)
    return len(items), ytxt
