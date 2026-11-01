"""Read clean question text from every A Level question paper, using the IGCSE segmenters.  python qtext.py CODE..."""
import glob, importlib.util, json, os, re, sys
from concurrent.futures import ProcessPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HOST = os.path.join(os.path.dirname(ROOT), 'BeforeExams')
sys.path.insert(0, os.path.join(ROOT, 'pipeline'))
FOLD = {'9700': 'Biology 9700', '9701': 'Chemistry 9701', '9702': 'Physics 9702', '9709': 'Mathematics 9709',
        '9618': 'Computer Science 9618', '9608': 'Computer Science 9618', '0478': 'IGCSE Computer Science 0478'}
spec = importlib.util.spec_from_file_location('igseg', os.path.join(ROOT, 'pipeline', 'igt', 'segment.py'))
SEGI = importlib.util.module_from_spec(spec)
spec.loader.exec_module(SEGI)
SEGI.HEAD = re.compile(r'(Mark Scheme|Syllabus|PUBLISHED|^Page\b|^Cambridge|^\d{4}/\d|May/June|October/November|February/March|UCLES|^\*|^,|DO NOT WRITE)')
import seg as SEGA


def one(f):
    base = os.path.basename(f)[:-4]
    code, _, _, num = base.split('_')
    try:
        if num[0] == '1' and code in ('9700', '9701', '9702'):
            q = {x['q']: x['text'] for x in SEGA.segment_qp(f)}
        else:
            q = {x['n']: x['text'] for x in SEGI.segment(f, 'qp')}
        return base, q
    except Exception as e:
        return base, {'error': str(e)[:120]}


if __name__ == '__main__':
    for code in sys.argv[1:]:
        files = sorted(glob.glob(os.path.join(HOST, FOLD[code], '20*', '*', f'{code}_*_qp_*.pdf')))
        print(code, 'papers', len(files), flush=True)
        out = {}
        with ProcessPoolExecutor(int(os.environ.get('QT_WORKERS') or max(2, (os.cpu_count() or 4) - 2))) as ex:
            for i, (b, q) in enumerate(ex.map(one, files, chunksize=4), 1):
                out[b] = q
                if i % 100 == 0:
                    print(code, i, flush=True)
        json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), f'{code}_text.json'), 'w', encoding='utf8'), ensure_ascii=False)
        bad = [b for b, q in out.items() if 'error' in q or len(q) < 3]
        print(code, 'done', sum(map(len, out.values())), 'questions, problem papers', len(bad), bad[:6], flush=True)
    print('ALLDONE', flush=True)
