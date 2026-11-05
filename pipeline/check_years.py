"""Checks every year PDF against its topical: only that year's questions, none repeated, none missing.  python check_years.py"""
import collections, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import years as Y, rebuild as B


def main():
    lib = json.load(open(os.path.join(os.path.dirname(HERE), 'site', 'assets', 'library.json'), encoding='utf8'))
    bad, files = [], 0
    for t in lib['topicals']:
        pdf, items = Y.read(B.HOST + t[8].replace('/', os.sep))
        want = collections.defaultdict(set)
        for it in items.values():
            if it['src']:
                want[B.year(it['src'])].add(it['src'])
        pdf.close()
        for y, rel, count, marks in lib['years'].get(t[0], []):
            files += 1
            ypdf, got = Y.read(os.path.join(Y.OUT, rel.lstrip('/')))
            srcs = [it['src'] for it in got.values()]
            ypdf.close()
            if set(srcs) != want[y] or len(srcs) != len(set(srcs)) or count != len(srcs):
                bad.append((t[5], y, len(srcs), len(want[y]), count))
    print('year files checked', files, 'problems', len(bad))
    for b in bad[:20]:
        print('  ', b)


if __name__ == '__main__':
    main()
