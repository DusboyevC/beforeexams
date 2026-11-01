"""After rebuild.py: update site/assets/library.json and write the jump lists.  python apply_rebuilt.py
Jump lists go to site/assets/jump/<id>.json as [[question number, source label, page], ...].
Copying the PDFs into the host folder is a separate step, done only when an upload is approved."""
import collections, hashlib, json, os, re, shutil, sys
import pikepdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
HOST = os.path.join(os.path.dirname(ROOT), 'BeforeExams')
OUT = os.path.join(HERE, 'rebuilt')
LIB = os.path.join(ROOT, 'site', 'assets', 'library.json')
JUMP = os.path.join(ROOT, 'site', 'assets', 'jump')
sys.path.insert(0, HERE)
import recompose as R, trends

TAG = re.compile(rb'\((Q\d+)( QUESTION)?\) Tj')


def uid(s):
    return hashlib.md5(s.encode()).hexdigest()[:8]


def jump(path):
    rows = []
    with pikepdf.open(path) as pdf:
        for i, p in enumerate(pdf.pages):
            b = R.stream(p)
            for m in TAG.finditer(b):
                sub = R.SRC.search(b[m.end():m.end() + 200].decode('latin-1'))
                if sub:
                    rows.append([int(m[1][1:]), re.sub(r'\s+', ' ', sub[0]), i + 1])
    return rows


def main():
    keep = os.path.join(HERE, 'als', 'library_before_review.json')
    if not os.path.exists(keep):
        shutil.copy(LIB, keep)
    lib = json.load(open(keep, encoding='utf8'))
    by_path = {t[8]: t for t in lib['topicals']}
    os.makedirs(JUMP, exist_ok=True)
    out = []
    for key in dict.fromkeys(t[1] for t in lib['topicals']):
        old = [t for t in lib['topicals'] if t[1] == key]
        rep = json.load(open(os.path.join(OUT, key + '.json'), encoding='utf8'))
        kept = set(rep['kept'])
        rows = [t for t in old if t[8] in kept]
        for m in rep['made']:
            path = '/' + m['path'].replace(os.sep, '/')
            sib = next((t for t in old if trends.topic_of(t) == m['topic'] and trends.group_of(t) == m['group']), None)
            years = f"{m['years'][0]}–{m['years'][1]}" if m['years'][0] != m['years'][1] else str(m['years'][0])
            t = list(by_path.get(path) or [uid(path), sib[1], sib[2], sib[3], sib[4], '', 0, '', path])
            t[5] = f"{m['topic']} ({years})" if m['ranged'] else m['topic']
            t[6], t[7] = m['questions'], years
            rows.append(t)
        rows.sort(key=lambda t: (t[3], int(t[4]) if str(t[4]).isdigit() else 0, trends.topic_of(t), -int(re.sub(r'\D', '', str(t[7]))[-4:] or 0)))
        out += rows
        for t in rows:
            f = os.path.join(OUT, t[8].lstrip('/')) if t[8] not in kept else HOST + t[8].replace('/', os.sep)
            rows_j = jump(f)
            t[6] = t[6] or len(rows_j)
            json.dump(rows_j, open(os.path.join(JUMP, t[0] + '.json'), 'w', encoding='utf8'), separators=(',', ':'))
        print(key, len(old), '->', len(rows), flush=True)
    gone = sorted(set(by_path) - {t[8] for t in out})
    lib['topicals'] = out
    json.dump(lib, open(LIB, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    json.dump(gone, open(os.path.join(OUT, 'removed.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
    print('topicals', len(out), 'old paths to remove', len(gone), flush=True)


if __name__ == '__main__':
    main()
