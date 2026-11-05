"""Download Cambridge's official grade threshold tables for our subjects.  python gt_fetch.py
Reads the series listing pages on cambridgeinternational.org and saves each subject's PDF to gt/<code>_<series>.pdf."""
import os, re, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'gt')
SITE = 'https://www.cambridgeinternational.org'
LISTS = {'igcse': '/programmes-and-qualifications/cambridge-upper-secondary/cambridge-igcse/grade-threshold-tables/{}/',
         'al': '/programmes-and-qualifications/cambridge-advanced/cambridge-international-as-and-a-levels/grade-threshold-tables/{}/'}
CODES = {'igcse': ['0478', '0580', '0610', '0620', '0625'], 'al': ['9618', '9700', '9701', '9702', '9709']}
SERIES = ['june-2023', 'november-2023', 'june-2024', 'november-2024', 'june-2025', 'november-2025', 'june-2026']


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (BeforeExams grade calculator)'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def main():
    os.makedirs(OUT, exist_ok=True)
    for level, path in LISTS.items():
        for s in SERIES:
            try:
                page = get(SITE + path.format(s)).decode('utf8', 'replace')
            except Exception as e:
                print('NO LIST', level, s, e, flush=True)
                continue
            for code in CODES[level]:
                f = os.path.join(OUT, f'{code}_{s}.pdf')
                if os.path.exists(f):
                    continue
                m = re.search(r'(/Images/\d+-[a-z0-9-]*-' + code + r'-' + s + r'-grade-threshold-table\.pdf)', page)
                if not m:
                    print('NOT LISTED', code, s, flush=True)
                    continue
                open(f, 'wb').write(get(SITE + m[1]))
                print('saved', code, s, flush=True)
                time.sleep(0.5)


if __name__ == '__main__':
    main()
