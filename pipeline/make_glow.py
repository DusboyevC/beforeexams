"""Glow images, one per subject in dark and light.  python make_glow.py
Only soft gradients: each subject has its own flowing shape, with no lines or pictures. The left side stays plain for titles.
A live CSS blur would be redrawn while scrolling, so the blur is baked in here."""
import math, os, sys
import numpy as np
from PIL import Image, ImageColor, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'site', 'assets', 'glow')
W, H = 1600, 420
BG = {'dark': '#0f1412', 'light': '#ffffff'}
# deep, main, accent, highlight
COLOURS = {
    'site': ('#0f5c46', '#12a374', '#f57c00', '#ffd9a0'),
    'physics': ('#0d5a4a', '#1fb98a', '#27c4d8', '#c8fff0'),
    'chemistry': ('#1b3f8f', '#3f7bea', '#27c4d8', '#d5e6ff'),
    'biology': ('#2f6b1e', '#6fbf3f', '#d6c62a', '#eaffc4'),
    'maths': ('#8a4300', '#f08a1d', '#f4524d', '#ffe2a8'),
    'cs': ('#46309a', '#8a63ea', '#e05cc4', '#ecdfff'),
}
FADE = np.clip((np.linspace(0, 1, W) - 0.34) / 0.34, 0, 1)   # nothing on the left third


def tint(colour, amount):
    c = ImageColor.getrgb(colour)
    return tuple(round(v + (255 - v) * amount) for v in c)


def area(d, fn):
    """Fill from a curve down to the bottom edge."""
    d.polygon([(x, fn(x)) for x in range(-40, W + 80, 20)] + [(W + 40, H + 40), (-40, H + 40)], fill=255)


def band(d, fn, width):
    xs = range(-40, W + 80, 20)
    d.polygon([(x, fn(x) - width / 2) for x in xs] + [(x, fn(x) + width / 2) for x in reversed(xs)], fill=255)


def ball(d, x, y, r):
    d.ellipse((x - r, y - r, x + r, y + r), fill=255)


def physics(add):
    """Two swells that rise and cross."""
    add(lambda d: area(d, lambda x: 330 - 150 * (x / W) ** 2), 0, 70, .9)
    add(lambda d: band(d, lambda x: 260 + 95 * math.sin(x / 165), 120), 1, 46, .9)
    add(lambda d: band(d, lambda x: 170 - 80 * math.sin(x / 200 + .6), 80), 2, 44, .8)
    add(lambda d: band(d, lambda x: 250 + 90 * math.sin(x / 165), 26), 3, 26, .55)


def chemistry(add):
    """Round clouds that overlap."""
    add(lambda d: ball(d, 1250, 210, 330), 0, 80, .9)
    add(lambda d: ball(d, 1040, 330, 150), 1, 50, .9)
    add(lambda d: ball(d, 1370, 70, 190), 1, 56, .95)
    add(lambda d: ball(d, 1530, 340, 150), 2, 52, .9)
    add(lambda d: ball(d, 1290, 250, 110), 3, 80, .35)


def biology(add):
    """A leaf-like S curve, wide in the middle."""
    centre = lambda x: 215 + 120 * math.sin((x - 700) / 210)
    add(lambda d: area(d, lambda x: 150 + 90 * math.sin(x / 300)), 0, 74, .8)
    def leaf(d, width):
        xs = list(range(560, W + 80, 20))
        wide = lambda x: width * math.sin(math.pi * min(1, (x - 560) / 1100)) ** .8
        d.polygon([(x, centre(x) - wide(x)) for x in xs] + [(x, centre(x) + wide(x)) for x in reversed(xs)], fill=255)
    add(lambda d: leaf(d, 120), 1, 44, .95)
    add(lambda d: leaf(d, 50), 2, 36, .85)
    add(lambda d: leaf(d, 16), 3, 26, .6)


def maths(add):
    """One big arc climbing to the top right."""
    add(lambda d: area(d, lambda x: 420 - 420 * max(0, (x - 620) / 980) ** 1.7), 0, 60, .95)
    add(lambda d: area(d, lambda x: 470 - 400 * max(0, (x - 760) / 840) ** 2), 1, 44, .95)
    add(lambda d: area(d, lambda x: 530 - 360 * max(0, (x - 960) / 640) ** 2.4), 2, 40, .9)
    add(lambda d: area(d, lambda x: 570 - 300 * max(0, (x - 1160) / 440) ** 3), 3, 34, .7)


def cs(add):
    """Straight diagonal beams, softened."""
    def beam(d, x, width):
        d.polygon([(x, H + 60), (x + width, H + 60), (x + width + 300, -60), (x + 300, -60)], fill=255)
    add(lambda d: beam(d, 700, 800), 0, 70, .85)
    add(lambda d: beam(d, 880, 170), 1, 34, .95)
    add(lambda d: beam(d, 1150, 110), 2, 30, .85)
    add(lambda d: beam(d, 1340, 150), 1, 34, .9)
    add(lambda d: beam(d, 1010, 34), 3, 22, .55)


def site(add):
    """Layered hills."""
    for c, (base, tilt, seed, blur, alpha) in enumerate([(.30, .95, 0, 64, .9), (.42, .78, 1, 44, .95), (.56, .58, 2, 36, .9), (.70, .36, 3, 30, .75)]):
        def hill(d, base=base, tilt=tilt, seed=seed):
            area(d, lambda x: H * (1 - tilt * max(0, x / W - .32) / .68 * 1.25) + H * (base - .3) * .7 + 44 * math.sin(x / W * 9 + base * 9 + seed))
        add(hill, c, blur, alpha)


SHAPES = dict(site=site, physics=physics, chemistry=chemistry, biology=biology, maths=maths, cs=cs)
os.makedirs(OUT, exist_ok=True)
sheet = Image.new('RGB', (W // 2 * 2 + 10, (H // 2 + 10) * 6), '#333333')
for row, (name, colours) in enumerate(COLOURS.items()):
    for col, (theme, bg) in enumerate(BG.items()):
        im = Image.new('RGB', (W, H), bg)
        def add(draw, c, blur, alpha):
            mask = Image.new('L', (W, H), 0)
            draw(ImageDraw.Draw(mask))
            mask = mask.filter(ImageFilter.GaussianBlur(blur))
            m = np.asarray(mask, dtype=np.float32) * FADE[None, :] * alpha
            fill = ImageColor.getrgb(colours[c]) if theme == 'dark' else tint(colours[c], 0.72)
            im.paste(Image.new('RGB', (W, H), fill), (0, 0), Image.fromarray(m.astype('uint8')))
        SHAPES[name](add)
        a = np.asarray(im, dtype=np.float32)
        a += np.random.default_rng(1).normal(0, 1.6, a.shape[:2])[..., None]   # fine grain stops colour bands
        out = Image.fromarray(a.clip(0, 255).astype('uint8'))
        path = os.path.join(OUT, f'{name}-{theme}.webp')
        out.save(path, quality=84, method=6)
        sheet.paste(out.resize((W // 2, H // 2)), (col * (W // 2 + 10), row * (H // 2 + 10)))
        print(name, theme, os.path.getsize(path) // 1024, 'KB')
if len(sys.argv) > 1:
    sheet.save(sys.argv[1])
