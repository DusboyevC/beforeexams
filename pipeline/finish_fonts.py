"""Find compact Type 1 fonts still not thickened (no /BEBold, not a +TT####o00 font) in the host topicals and thicken them.
python finish_fonts.py [--fix]"""
import glob, os, sys
import pikepdf
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import clean
from verify_clean import HOST


def scan(f):
    try:
        with pikepdf.open(f, allow_overwriting_input=True) as pdf:
            left = 0
            for pg in pdf.pages:
                pass
            seen = set()
            def walk(res, d):
                nonlocal left
                if res is None or d > 200: return
                for fo in (res.get('/Font') or {}).values():
                    fd = fo.get('/FontDescriptor'); ff = fd.get('/FontFile3') if fd is not None else None
                    if ff is not None and str(ff.get('/Subtype')) == '/Type1C' and '/BEBold' not in ff and ff.objgen not in seen and not clean.THIN.search(str(fo.get('/BaseFont', ''))):
                        seen.add(ff.objgen); left += 1
                for x in (res.get('/XObject') or {}).values():
                    if x.objgen in seen: continue
                    seen.add(x.objgen); walk(x.get('/Resources'), d + 1)
            for pg in pdf.pages:
                walk(pg.obj.get('/Resources'), 0)
            fixed = 0
            if left and '--fix' in sys.argv:
                fixed = clean.bolden_fonts(pdf, skip_thin=True)
                if fixed:
                    pdf.save(f, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
            return f, left, fixed
    except Exception as e:
        return f, -1, str(e)


if __name__ == '__main__':
    files = glob.glob(os.path.join(HOST, '*', 'Topicals', '**', '*.pdf'), recursive=True)
    import multiprocessing
    tl = tf = nfiles = 0
    out = open(os.path.join(HERE, 'changed_files.txt'), 'a', encoding='utf8')
    with multiprocessing.Pool(4) as pool:
        for f, left, fixed in pool.imap_unordered(scan, files, chunksize=8):
            if left == -1: print('ERROR', f, fixed); continue
            if left: nfiles += 1; tl += left
            if isinstance(fixed, int) and fixed:
                tf += fixed; out.write(os.path.abspath(f) + chr(10)); out.flush()
    print(f'{len(files)} files; {nfiles} files with {tl} fonts not thickened; fixed {tf}')
