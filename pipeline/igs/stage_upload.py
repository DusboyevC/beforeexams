"""Put the IGCSE files into the papers-host folder, then check every library.json path exists.  python stage_upload.py [check]"""
import json, os, re, shutil, sys, zipfile
from add_to_library import SESSION, SUBJECTS

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
DL = os.path.dirname(ROOT)
HOST = os.path.join(DL, 'BeforeExams')


def stage():
    n = 0
    for code, (_, folder) in SUBJECTS.items():
        src = os.path.join(DL, 'igcse', code)
        for f in os.listdir(src):
            m = re.fullmatch(code + r'_([msw])(\d\d)_(qp|ms)_\d\d\.pdf', f)
            if not m: continue
            d = os.path.join(HOST, folder, str(2000 + int(m[2])), SESSION[m[1]])
            os.makedirs(d, exist_ok=True)
            if not os.path.exists(os.path.join(d, f)):
                shutil.copy2(os.path.join(src, f), d); n += 1
        top = os.path.join(HOST, folder, 'Topicals')
        if os.path.isdir(top): shutil.rmtree(top)
        shutil.copytree(os.path.join(HERE, 'topicals', code), top)
    print('papers copied', n)
    old = os.path.join(HOST, 'Computer Science 9618', 'Topicals')
    hold = os.path.join(DL, '_to_delete_BeforeExams', 'old-cs-9618-topicals')
    if os.path.isdir(old) and not os.path.exists(hold):
        shutil.move(old, hold)
    os.makedirs(old, exist_ok=True)
    for p in '1234':
        zipfile.ZipFile(os.path.join(DL, f'A Level CS 9618 Topicals - Paper {p}.zip')).extractall(old)
    zipfile.ZipFile(os.path.join(DL, 'IGCSE CS 0478 Topicals.zip')).extractall(os.path.join(HOST, 'IGCSE Computer Science 0478', 'Topicals'))


def check():
    L = json.load(open(os.path.join(ROOT, 'site', 'assets', 'library.json'), encoding='utf8'))
    want = [r[7] for r in L['papers']] + [r[8] for r in L['papers'] if r[8]] + [r[8] for r in L['topicals']]
    for r in L['papers']:
        for e in r[9] or []:
            want += [x for x in (e if isinstance(e, list) else [e]) if isinstance(x, str) and x.endswith('.pdf')]
    miss = [p for p in want if not os.path.exists(HOST + p.replace('/', os.sep))]
    by = {}
    for p in miss: by[p.split('/')[1]] = by.get(p.split('/')[1], 0) + 1
    print('library paths', len(want), 'missing', len(miss), by)
    print('sample', miss[:6])
    files = [os.path.join(a, f) for a, _, fs in os.walk(HOST) for f in fs if '.wrangler' not in a]
    big = [f for f in files if os.path.getsize(f) > 25 * 1024 * 1024]
    print('files', len(files), 'GB', round(sum(map(os.path.getsize, files)) / 2**30, 2), 'over 25 MiB', big[:5])


if __name__ == '__main__':
    if 'check' not in sys.argv: stage()
    check()
