"""BeforeExams topical cover page (A4) in the style of the CS topicals."""
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import Color
import io

pdfmetrics.registerFont(TTFont('Choco', 'C:/Users/user/Downloads/BeforeExams-project/pipeline/fonts/Chococooky.ttf'))
W, H = 595.2756, 841.8898
GREEN = Color(74 / 255, 158 / 255, 124 / 255)
DGREEN = Color(46 / 255, 110 / 255, 84 / 255)
ORANGE = Color(233 / 255, 162 / 255, 59 / 255)
GREY = Color(118 / 255, 118 / 255, 118 / 255)
LGREY = Color(0.86, 0.86, 0.86)
RING = Color(0.92, 0.92, 0.92)
BLACK = Color(0.08, 0.08, 0.08)


def spaced(c, x, y, text, size, color, spacing=1.6, font='Choco', right=False):
    c.setFont(font, size)
    c.setFillColor(color)
    widths = [pdfmetrics.stringWidth(ch, font, size) for ch in text]
    total = sum(widths) + spacing * (len(text) - 1)
    if right:
        x = x - total
    for ch, w in zip(text, widths):
        c.drawString(x, y, ch)
        x += w + spacing


def wrap_title(title, maxw, size):
    words = title.split()
    lines, cur = [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if pdfmetrics.stringWidth(t, 'Choco', size) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def make_cover(title, subject_line, syllabus, papers, years, nq):
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(W, H))
    c.setFillColorRGB(1, 1, 1)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    # rings + green circle
    cx, cy = 555, H - 397
    c.setStrokeColor(RING); c.setLineWidth(1.6)
    c.circle(cx, cy, 207, stroke=1, fill=0)
    c.circle(cx, cy, 147, stroke=1, fill=0)
    c.setFillColor(GREEN)
    c.circle(cx, cy, 87, stroke=0, fill=1)
    # logo
    c.drawImage('C:/Users/user/Downloads/BeforeExams-project/pipeline/fonts/logo_icon.png', 48, H - 78, width=34, height=32, mask='auto')
    c.setFont('Choco', 21)
    c.setFillColor(BLACK)
    c.drawString(96, H - 70, 'Before')
    c.setFillColor(DGREEN)
    c.drawString(96 + pdfmetrics.stringWidth('Before', 'Choco', 21), H - 70, 'Exams')
    spaced(c, 550, H - 66, 'TOPICAL SERIES', 8.5, GREY, 1.6, right=True)
    # headline
    spaced(c, 44, H - 300, 'TOPICAL PAST PAPERS', 8.5, DGREEN, 1.9)
    size = 50
    while True:
        lines = wrap_title(title, 400, size)
        if (len(lines) <= 2 and all(pdfmetrics.stringWidth(l, 'Choco', size) <= 410 for l in lines)) or size <= 30:
            if len(lines) <= 3:
                break
        size -= 2
    y = H - 360
    c.setFillColor(BLACK)
    c.setFont('Choco', size)
    lh = size * 1.25
    for l in lines:
        c.drawString(44, y, l)
        y -= lh
    y += lh
    c.setFont('Choco', 19)
    c.setFillColor(Color(0.2, 0.2, 0.2))
    c.drawString(44, y - 48, subject_line)
    c.setStrokeColor(ORANGE); c.setLineWidth(3)
    c.line(45, y - 72, 96, y - 72)
    # divider and info grid
    c.setStrokeColor(LGREY); c.setLineWidth(0.8)
    c.line(45, H - 659, 550, H - 659)
    cols = [45, 219, 394]

    def field(x, ylab, label, value):
        spaced(c, x, H - ylab, label, 8.3, GREY, 1.5)
        c.setFont('Choco', 14)
        c.setFillColor(BLACK)
        c.drawString(x, H - ylab - 19, value)

    field(cols[0], 688, 'EXAM BOARD', 'Cambridge')
    field(cols[1], 688, 'SYLLABUS CODE', syllabus)
    field(cols[2], 688, 'PAPERS COVERED', papers)
    field(cols[0], 739, 'YEARS', years)
    field(cols[1], 739, 'QUESTIONS', str(nq))
    c.setFont('Choco', 9)
    c.setFillColor(GREY)
    c.drawString(45, H - 798, 'Practice with purpose. Track what you learn.')
    c.showPage()
    c.save()
    return buf.getvalue()


if __name__ == '__main__':
    open('C:/Users/user/Downloads/BeforeExams-project/pipeline/ex/cover_test.pdf', 'wb').write(make_cover('Forces, Density and Pressure', 'A-Level Physics', '9702', 'Paper 1', '[2015 – 2026]', 377))
