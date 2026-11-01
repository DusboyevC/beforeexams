"""Re-split only the papers flagged in the log: patch_seg.py CODE"""
import sys, re, json
code = sys.argv[1]; sys.argv = ['run.py', code, 'none']
sys.path.insert(0, '.')
import run
log = open(f'igs/seg_{code}.log', encoding='utf8').read()
bases = re.findall(r'^(\S+) .*(?:MISMATCH|CHECK|ERROR|capped)', log, re.M)
f = f'{run.W}/seg.json'; d = json.load(open(f, encoding='utf8'))
for b in bases:
    base, v, line = run.seg_one(f'{run.SRC}/{b}.pdf'); print(line, flush=True)
    if v: d[base] = v
json.dump(d, open(f, 'w', encoding='utf8'))
