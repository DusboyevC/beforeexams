"""Add the IGCSE science and maths rows to site/assets/library.json.  python add_to_library.py CODE...
Paths follow the existing rows: /<folder>/<year>/<session>/<file> and /<folder>/Topicals/<group>/<file>."""
import hashlib, importlib.util, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB = os.path.join(ROOT, 'site', 'assets', 'library.json')
SRC = os.path.join(os.path.dirname(ROOT), 'igcse')
SESSION = {'m': 'Feb-March', 's': 'May-June', 'w': 'Oct-Nov'}
SUBJECTS = {'0625': ('ig-physics', 'IGCSE Physics 0625'), '0620': ('ig-chemistry', 'IGCSE Chemistry 0620'),
            '0610': ('ig-biology', 'IGCSE Biology 0610'), '0580': ('ig-maths', 'IGCSE Mathematics 0580')}
SCIENCE = [(1, 'Multiple Choice (Core)'), (2, 'Multiple Choice (Extended; Core Theory in 2015)'),
           (3, 'Theory (Core; Extended Theory in 2015)'), (4, 'Theory (Extended)'),
           (5, 'Practical Test'), (6, 'Alternative to Practical')]
MATHS = [(1, 'Core (Non-calculator from 2025)'), (2, 'Extended (Non-calculator from 2025)'),
         (3, 'Core (Calculator)'), (4, 'Extended (Calculator)')]
# topical rows use the first paper of each group as their component number
GROUPS = {'Multiple choice (Paper 1 & 2)': (1, 'Papers 1 & 2 (Multiple choice)'), 'Theory (Paper 3 & 4)': (3, 'Papers 3 & 4 (Theory)'),
          'Practical (Paper 5 & 6)': (5, 'Papers 5 & 6 (Practical)'), 'Core (Paper 1 & 3)': (1, 'Papers 1 & 3 (Core)'),
          'Extended (Paper 2 & 4)': (2, 'Papers 2 & 4 (Extended)')}


def uid(s): return hashlib.md5(s.encode()).hexdigest()[:8]


def paper_rows(code, key, folder):
    d = os.path.join(SRC, code); rows = []
    for f in sorted(os.listdir(d)):
        m = re.fullmatch(code + r'_([msw])(\d\d)_qp_(\d)(\d)\.pdf', f)
        if not m: continue
        year = 2000 + int(m[2]); base = f'/{folder}/{year}/{SESSION[m[1]]}/'
        ms = f.replace('_qp_', '_ms_')
        rows.append([uid(f), key, code, year, m[1], int(m[3]), int(m[4]), base + f, base + ms if os.path.exists(os.path.join(d, ms)) else None, []])
    return rows


def main():
    L = json.load(open(LIB, encoding='utf8'))
    for code in sys.argv[1:]:
        key, folder = SUBJECTS[code]
        W = os.path.join(ROOT, 'pipeline', 'igs', 'w', code)
        spec = importlib.util.spec_from_file_location('s', os.path.join(ROOT, 'pipeline', 'igs', f's{code}.py'))
        M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
        made = json.load(open(os.path.join(W, 'manifest.json'), encoding='utf8'))
        L['papers'] = [r for r in L['papers'] if r[1] != key] + paper_rows(code, key, folder)
        L['topicals'] = [r for r in L['topicals'] if r[1] != key]
        used = {}
        for x in made:
            comp, _ = GROUPS[x['group']]
            used.setdefault(str(x['topic']), set()).add(comp)
            years = f"{x['years'][0]}–{x['years'][1]}" if x['years'][0] != x['years'][1] else str(x['years'][0])
            name = f"{x['name']} ({years})" if x['ranged'] else x['name']
            path = f"/{folder}/Topicals/{x['file']}"
            L['topicals'].append([uid(path), key, code, comp, str(x['topic']), name, x['questions'], years, path])
        s = next(v for v in L['subjects'] if v['key'] == key)
        s.pop('comingSoon', None)
        s['components'] = [dict(number=n, title=t, stage='IGCSE') for n, t in (MATHS if code == '0580' else SCIENCE)]
        s['topics'] = [dict(code=str(t), name=M.TOPICS[t], components=sorted(used[str(t)])) for t in sorted(M.TOPICS) if str(t) in used]
        s['topicalGroups'] = {str(c): label for g, (c, label) in GROUPS.items() if any(x['group'] == g for x in made)}
        print(code, 'papers', sum(r[1] == key for r in L['papers']), 'topicals', sum(r[1] == key for r in L['topicals']))
    json.dump(L, open(LIB, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))


if __name__ == '__main__':
    main()
