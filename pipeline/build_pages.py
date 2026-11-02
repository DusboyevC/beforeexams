"""Write real HTML pages that search engines and AI tools can read without running JavaScript.
python build_pages.py   creates site/about, site/subjects/*, site/revision-notes/*, sitemap.xml and robots.txt."""
import html, json, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')
URL = 'https://beforexams.netlify.app'
L = json.load(open(os.path.join(SITE, 'assets', 'library.json'), encoding='utf8'))
EXAMS = json.load(open(os.path.join(ROOT, 'pipeline', 'exams.json'), encoding='utf8'))
open(os.path.join(SITE, 'assets', 'exams.js'), 'w', encoding='utf8', newline='\n').write('window.BE_EXAMS=' + json.dumps(EXAMS, ensure_ascii=False, separators=(',', ':')) + ';\n')
AUTHORS = ['DusboyevC', 'Magnetars']
BRAND_SVG = '<svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="4" y="4" width="25" height="9" rx="3.2" fill="#F57C00"/><rect x="8" y="6.9" width="8" height="2.2" rx="1.1" fill="#1A1A18"/><rect x="7" y="15.5" width="29" height="9" rx="3.2" fill="#4FC79A"/><rect x="11" y="18.4" width="8" height="2.2" rx="1.1" fill="#fff" fill-opacity=".75"/><rect x="3" y="27" width="31" height="10" rx="3.2" fill="#0F5C46"/><rect x="7" y="30.4" width="9" height="2.2" rx="1.1" fill="#fff" fill-opacity=".75"/></svg>'
e = html.escape


def foot_col(title, links):
    return f'<nav class="foot-col" aria-label="{e(title)}"><h2>{e(title)}</h2>' + ''.join(f'<a href="{h}"{x}>{e(n)}</a>' for n, h, x in links) + '</nav>'


# one footer for the app and the static pages; the app reads it from assets/footer.js
FOOTER = ('<footer class="foot"><div class="wrap"><div class="foot-grid"><div class="foot-brand">'
          f'<a class="brand" href="/" aria-label="BeforeExams home">{BRAND_SVG}<span class="font-brand brand-word">Before<span>Exams</span></span></a>'
          '<p>Free revision for Cambridge IGCSE and AS &amp; A Level students.</p>'
          '<p class="foot-mail">Email: <a href="mailto:dusboyevc@gmail.com">dusboyevc@gmail.com</a></p></div>'
          + foot_col('Library', [(n, '/#/?mode=' + m, f' data-foot-mode="{m}"') for n, m in (('Topical questions', 'topicals'), ('Past papers', 'papers'), ('Revision notes', 'notes'), ('Exam guide', 'guide'), ('Topic trends', 'trends'))])
          + foot_col('IGCSE', [(n, f'/subjects/igcse-{s}/', '') for n, s in (('Physics', 'physics-0625'), ('Chemistry', 'chemistry-0620'), ('Biology', 'biology-0610'), ('Mathematics', 'mathematics-0580'), ('Computer Science', 'computer-science-0478'))])
          + foot_col('AS & A Level', [(n, f'/subjects/a-level-{s}/', '') for n, s in (('Physics', 'physics-9702'), ('Chemistry', 'chemistry-9701'), ('Biology', 'biology-9700'), ('Mathematics', 'mathematics-9709'), ('Computer Science', 'computer-science-9618'))])
          + foot_col('BeforeExams', [('About and authors', '/about/', ''), ('All revision notes', '/revision-notes/', ''), ('My account', '/#/account', ''), ('Mock tests', '/#/account', '')])
          + '</div><p class="foot-note">Past papers and mark schemes © Cambridge University Press &amp; Assessment. BeforeExams is an independent study site, not affiliated with Cambridge.</p>'
          '<div class="foot-bar"><span>© 2026 BeforeExams v2. Made by <b>DusboyevC</b> and <b>Magnetars</b>.</span><a href="/privacy/">Privacy Policy</a></div></div></footer>')
with open(os.path.join(SITE, 'assets', 'footer.js'), 'w', encoding='utf8', newline='\n') as f:
    f.write('window.BE_FOOTER=' + json.dumps(FOOTER, ensure_ascii=False) + ';\n')


def level_name(s):
    return 'IGCSE' if s.get('level') == 'ig' else 'AS & A Level'


def subject_title(s):
    return f"Cambridge {level_name(s)} {s['name']} {s['code']}"


def subject_path(s):
    slug = re.sub(r'[^a-z0-9]+', '-', f"{'igcse' if s.get('level') == 'ig' else 'a-level'} {s['name']} {s['code']}".lower()).strip('-')
    return f'/subjects/{slug}/'


def note_path(n):
    return f"/revision-notes/{n[0]}/{n[3].split('/')[-1][:-5]}/"


def glow_for(path):
    if path.startswith('/privacy'):
        return 'none'
    for word, name in (('physics', 'physics'), ('chemistry', 'chemistry'), ('biology', 'biology'), ('math', 'maths'), ('computer-science', 'cs'), ('/cs/', 'cs'), ('ig-cs', 'cs')):
        if word in path:
            return name
    return 'site'


def page(path, title, description, body, data=None):
    canon = URL + path
    ld = f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>' if data else ''
    doc = f'''<!doctype html>
<html lang="en" class="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(description)}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(description)}">
<meta property="og:url" content="{canon}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="BeforeExams">
<link rel="canonical" href="{canon}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@500;600;700&display=swap">
<link rel="stylesheet" href="/assets/style.css">
<script>try{{if(localStorage.getItem("be-theme")==="light")document.documentElement.classList.remove("dark")}}catch(e){{}}</script>
{ld}
</head>
<body data-view="static" data-glow="{glow_for(path)}">
<header class="topbar"><div class="wrap topbar-inner">
<a href="/" class="brand" aria-label="BeforeExams home">{BRAND_SVG}<span class="font-brand brand-word">Before<span>Exams</span></span></a>
<nav class="topbar-actions" aria-label="Main"><a href="/#library" class="nav-link">Library</a><a href="/revision-notes/" class="nav-link">Notes</a><a href="/about/" class="nav-link">About</a></nav>
</div></header>
<main class="page"><div class="wrap static-page">{body}</div></main>
{FOOTER}
</body>
</html>
'''
    out = os.path.join(SITE, path.strip('/').replace('/', os.sep), 'index.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf8', newline='\n').write(doc)
    return canon


def counts(key):
    return sum(r[1] == key for r in L['papers']), sum(r[1] == key for r in L['topicals']), [n for n in L['notes'] if n[0] == key]


urls = []
for d in ('subjects', 'revision-notes', 'about', 'privacy'):
    shutil.rmtree(os.path.join(SITE, d), ignore_errors=True)

papers, topicals = len(L['papers']), len(L['topicals'])
subject_rows = ''.join(
    f'<tr><td><a href="{subject_path(s)}"><b>{e(level_name(s))} {e(s["name"])}</b></a></td><td class="font-code">{e(s["code"])}</td><td>{counts(s["key"])[1]}</td><td>{counts(s["key"])[0]}</td><td>{len(counts(s["key"])[2])}</td></tr>'
    for s in L['subjects'])
faq = [
    ('What is BeforeExams?', 'BeforeExams is a free revision platform for Cambridge IGCSE and AS & A Level students. It has past papers with mark schemes, topical questions sorted by syllabus topic, revision notes, timed mock tests and score tracking.'),
    ('Who made BeforeExams?', 'BeforeExams was made by DusboyevC and Magnetars.'),
    ('Which subjects are included?', 'Mathematics, Physics, Chemistry, Biology and Computer Science, at both IGCSE and AS & A Level.'),
    ('Which years are included?', 'Cambridge series from 2015 to 2026: Feb/March, May/June and Oct/Nov, wherever Cambridge published the paper.'),
    ('Is BeforeExams free?', 'Yes. Revision notes are open to everyone. Past papers and topical PDFs ask for the site password, and logged-in students are asked once every 15 days.'),
    ('Is BeforeExams affiliated with Cambridge?', 'No. BeforeExams is an independent study site. Past papers and mark schemes are © Cambridge University Press & Assessment.'),
]
about = f'''<p class="label-caps eyebrow">About</p>
<h1 class="hero">About BeforeExams</h1>
<p class="lede">BeforeExams is a free revision platform for Cambridge IGCSE and AS &amp; A Level students. It brings together {papers:,} past papers from 2015 to 2026, {topicals} topical question sets, {len(L['notes'])} revision notes, timed mock tests and score tracking.</p>
<div class="panel makers"><p class="label-caps eyebrow" style="margin:0">Made by</p><div class="makers-row"><div class="maker-person"><img class="maker-photo" src="/assets/dusboyevc.webp" alt="DusboyevC" width="112" height="112" loading="lazy"><h3 class="font-brand maker-name">DusboyevC</h3></div><div class="maker-person maker-lower"><img class="maker-photo" src="/assets/magnetars.webp" alt="Magnetars" width="92" height="92" loading="lazy"><h3 class="font-brand maker-name">Magnetars</h3></div></div><p class="makers-text">BeforeExams was made to make Cambridge revision faster: the right questions, grouped by topic, with the mark scheme one click away and your progress in one place.</p></div>
<h2 class="explain-title">What's inside</h2>
<div class="panel table-wrap"><table class="tbl"><thead><tr><th>Subject</th><th>Syllabus</th><th>Topicals</th><th>Past papers</th><th>Notes</th></tr></thead><tbody>{subject_rows}</tbody></table></div>
<h2 class="explain-title">Questions</h2><div class="faq">{''.join(f'<details class="panel" open><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in faq)}</div>
<h2 class="explain-title">Contact</h2><p class="contact-links"><span>Instagram: <a href="https://www.instagram.com/dusboyevc" rel="noopener">@dusboyevc</a></span><span>Telegram: <a href="https://t.me/dusboyevc" rel="noopener">@dusboyevc</a></span><span>Email: <a href="mailto:dusboyevc@gmail.com">dusboyevc@gmail.com</a></span></p>'''
urls.append(page('/about/', 'About BeforeExams: who made it and what is inside',
                 f'BeforeExams was made by DusboyevC and Magnetars. A free Cambridge IGCSE and A Level revision platform with {papers:,} past papers, topical questions, notes and mock tests.', about,
                 {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]}))

for s in L['subjects']:
    np_, nt, notes = counts(s['key'])
    t = subject_title(s)
    links = ''.join(f'<li><a href="{note_path(n)}">{e(n[2])}</a></li>' for n in notes)
    topics = ''.join(f'<li>{e(x["name"])}</li>' for x in s.get('topics', []))
    g = EXAMS.get(s['key'])
    alevel = g and 'as' in g['papers'][0]
    guide = '' if not g else ('<h2 class="explain-title">Exam structure</h2><ul class="static-list">' + ''.join(f'<li>{e(r)}</li>' for r in g['routes']) + '</ul><div class="panel table-wrap" style="margin-top:14px"><table class="tbl"><thead><tr><th>Paper</th><th>Time</th><th>Marks</th>'
        + ('<th>AS weight</th><th>A Level weight</th>' if alevel else '<th>Weight</th>') + '<th>Covers</th></tr></thead><tbody>'
        + ''.join(f'<tr><td><b>Paper {p["n"]}</b><small>{e(p["name"])}</small></td><td>{e(p["time"])}</td><td>{p["marks"]}</td>' + (f'<td>{e(p["as"]) or "–"}</td><td>{e(p["a"]) or "–"}</td>' if alevel else f'<td>{e(p["weight"])}</td>') + f'<td>{e(p["covers"])}</td></tr>' for p in g['papers'])
        + f'</tbody></table></div><p class="st-note">From the Cambridge syllabus for {e(g["syllabus"])}.</p>')
    body = f'''<p class="label-caps eyebrow">{e(level_name(s))}</p><h1 class="hero">{e(t)}</h1>
<p class="lede">{np_} past papers with mark schemes, {nt} topical question sets and {len(notes)} revision notes for {e(t)}, from 2015 to 2026.</p>
<p><a class="mini primary" href="/#/?subject={s['key']}">Open topical questions</a> <a class="mini" href="/#/?subject={s['key']}&amp;mode=papers">Open past papers</a></p>
{guide}
{f'<h2 class="explain-title">Revision notes</h2><ul class="static-list">{links}</ul>' if notes else ''}
{f'<h2 class="explain-title">Topics</h2><ul class="static-list">{topics}</ul>' if topics else ''}'''
    urls.append(page(subject_path(s), f'{t}: past papers, topicals and notes | BeforeExams',
                     f'{t} past papers with mark schemes, topical questions and revision notes from 2015 to 2026.', body,
                     {'@context': 'https://schema.org', '@type': 'Course', 'name': t, 'description': f'Revision resources for {t}.', 'provider': {'@type': 'Organization', 'name': 'BeforeExams', 'url': URL}}))

hub = ''
for s in L['subjects']:
    _, _, notes = counts(s['key'])
    if not notes:
        continue
    hub += f'<h2 class="explain-title"><a href="{subject_path(s)}">{e(level_name(s))} {e(s["name"])}</a></h2><ul class="static-list">' + ''.join(f'<li><a href="{note_path(n)}">{e(n[2])}</a></li>' for n in notes) + '</ul>'
urls.append(page('/revision-notes/', 'Cambridge IGCSE and A Level revision notes | BeforeExams',
                 f'{len(L["notes"])} free revision notes for Cambridge IGCSE and AS & A Level Mathematics, Physics, Chemistry, Biology and Computer Science.',
                 f'<p class="label-caps eyebrow">Free for everyone</p><h1 class="hero">Revision notes</h1>{hub}'))

for s in L['subjects']:
    _, _, notes = counts(s['key'])
    for i, n in enumerate(notes):
        src = os.path.join(SITE, n[3].lstrip('/').replace('/', os.sep))
        content = open(src, encoding='utf8').read()
        words = re.sub(r'<[^>]+>', ' ', content)
        words = re.sub(r'\s+', ' ', html.unescape(words)).strip()
        words = re.sub(rf'^{re.escape(n[1])}\s+{re.escape(n[2])}\s*', '', words)
        title = f"{n[2]}: {level_name(s)} {s['name']} {s['code']} revision notes"
        prev = f'<a class="mini" href="{note_path(notes[i - 1])}">← {e(notes[i - 1][2])}</a>' if i else '<span></span>'
        nxt = f'<a class="mini" href="{note_path(notes[i + 1])}">{e(notes[i + 1][2])} →</a>' if i + 1 < len(notes) else '<span></span>'
        body = f'<p class="label-caps eyebrow"><a href="{subject_path(s)}">{e(level_name(s))} {e(s["name"])} {e(s["code"])}</a></p><article class="notes">{content}</article><nav class="notes-nav">{prev}{nxt}</nav>'
        urls.append(page(note_path(n), f'{title} | BeforeExams', (words[:150].rsplit(' ', 1)[0] + '…') if len(words) > 150 else words, body,
                         {'@context': 'https://schema.org', '@type': 'LearningResource', 'name': n[2], 'educationalLevel': level_name(s), 'about': s['name'], 'author': [{'@type': 'Person', 'name': a} for a in AUTHORS], 'url': URL + note_path(n)}))

privacy = '''<p class="label-caps eyebrow">Privacy</p>
<h1 class="hero">Privacy policy</h1>
<p class="lede">BeforeExams is a free study site. This page says what we keep, why, and how to remove it. Last updated 1 November 2026.</p>
<h2 class="explain-title">What you can do without an account</h2>
<p class="lede">You can browse the library and read revision notes without giving us anything. We count visits as daily totals only: no names, emails or IP addresses go into those totals.</p>
<h2 class="explain-title">What we keep if you make an account</h2>
<ul class="static-list"><li>Your email address and a protected form of your password, if you set one.</li><li>The level, subjects, exam dates and target you choose to add.</li><li>The scores and mock results you log.</li></ul>
<p class="lede">We use these only to run your account and show your own progress. Other students can&rsquo;t see them. We don&rsquo;t sell your data or show adverts.</p>
<h2 class="explain-title">Mistake reports</h2>
<p class="lede">If you report a mistake, we keep what you wrote and which paper it was about. The report isn&rsquo;t linked to your account, so please don&rsquo;t put personal details in it.</p>
<h2 class="explain-title">Saved on your device</h2>
<p class="lede">The site saves a few settings in your browser, such as your theme, your last subject, your login and a running mock test. You can clear them in your browser settings. We don&rsquo;t use advertising or tracking cookies.</p>
<h2 class="explain-title">Services we use</h2>
<ul class="static-list"><li>Supabase stores accounts and scores.</li><li>Netlify hosts the website.</li><li>Cloudflare hosts the past paper files.</li><li>Google Fonts supplies the fonts, so your browser connects to Google when a page loads.</li></ul>
<p class="lede">These services handle data only so the site can work, and they may process it outside your country.</p>
<h2 class="explain-title">Deleting your data</h2>
<p class="lede">Email us from your account&rsquo;s address and we&rsquo;ll delete your account and scores. If you are under the age where your country requires a parent&rsquo;s permission, please ask a parent or guardian before making an account.</p>
<h2 class="explain-title">Contact</h2>
<p class="lede">Email: <a href="mailto:dusboyevc@gmail.com">dusboyevc@gmail.com</a></p>'''
urls.append(page('/privacy/', 'Privacy policy | BeforeExams', 'What BeforeExams keeps, why, and how to delete your account and data.', privacy))

with open(os.path.join(SITE, 'sitemap.xml'), 'w', encoding='utf8', newline='\n') as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    for u in [URL + '/'] + urls:
        f.write(f'  <url><loc>{e(u)}</loc></url>\n')
    f.write('</urlset>\n')
with open(os.path.join(SITE, 'robots.txt'), 'w', encoding='utf8', newline='\n') as f:
    f.write(f'User-agent: *\nAllow: /\nDisallow: /notes/\nSitemap: {URL}/sitemap.xml\n')
print(len(urls), 'pages')
