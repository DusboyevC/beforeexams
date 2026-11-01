import json, re, collections

TOPICS = {
    1: 'Data representation',
    2: 'Data transmission',
    3: 'Hardware',
    4: 'Software',
    5: 'The internet and its uses',
    6: 'Automated and emerging technologies',
    7: 'Algorithm design and problem-solving',
    8: 'Programming',
    9: 'Databases',
    10: 'Boolean logic',
}

KW = {
    1: ['binary', 'denary', 'hexadecimal', 'hex ', "two's complement", 'two’s complement', 'overflow', 'logical shift', 'left shift', 'right shift', 'ascii', 'unicode', 'character set',
        'sample rate', 'sampling rate', 'sample resolution', 'sampling resolution', 'colour depth', 'color depth', 'bit depth', 'image resolution', 'file size', 'compression', 'compress', 'lossy', 'lossless',
        'kibibyte', 'kib', 'mebibyte', 'mib', 'gibibyte', 'tebibyte', 'run length', 'rle', 'nibble', 'byte', 'megabyte', 'kilobyte', 'midi', 'mp3', 'mp4', 'jpeg', 'pixels', 'sound file', 'register'],
    2: ['packet', 'serial', 'parallel', 'simplex', 'duplex', 'usb', 'parity', 'checksum', 'echo check', 'arq', 'automatic repeat', 'check digit', 'encrypt', 'symmetric', 'asymmetric',
        'public key', 'private key', 'transmi', 'interference', 'skew', 'header', 'payload', 'trailer', 'universal serial bus', 'cipher', 'plaintext', 'plain text', 'error detection', 'errors during'],
    3: ['cpu', 'processor', 'von neumann', 'alu', 'arithmetic logic unit', 'control unit', 'mar', 'mdr', 'program counter', 'accumulator', 'current instruction register', 'fetch', 'decode', 'execute', 'cores', 'cache', 'clock speed',
        'embedded system', 'input device', 'output device', 'sensor', 'printer', 'scanner', 'barcode', 'qr code', 'touch screen', 'touchscreen', 'microphone', 'speaker', 'lcd', 'led', 'projector', '3d printer',
        'ram', 'rom', 'random access memory', 'read only memory', 'virtual memory', 'secondary storage', 'primary storage', 'magnetic', 'optical', 'solid state', 'solid-state', 'ssd', 'hdd', 'hard disk', 'cloud storage', 'cloud',
        'network interface card', 'nic', 'mac address', 'ip address', 'ipv4', 'ipv6', 'router', 'instruction set', 'monitor', 'keyboard', 'mouse', 'dvd', 'blu-ray', 'flash memory', 'storage device', 'storage', 'actuator', 'bus', 'dac', 'adc'],
    4: ['operating system', 'utility', 'application software', 'system software', 'interrupt', 'firmware', 'bootloader', 'high-level language', 'high level language', 'low-level', 'low level', 'assembly language',
        'assembler', 'compiler', 'interpreter', 'ide', 'integrated development environment', 'translator', 'machine code', 'defragment', 'disk defrag', 'device driver', 'buffer', 'software'],
    5: ['internet', 'world wide web', 'www', 'url', 'http', 'https', 'web browser', 'browser', 'dns', 'domain name', 'cookie', 'digital currency', 'blockchain', 'cyber', 'brute force', 'data interception', 'ddos', 'denial of service',
        'hacking', 'hacker', 'malware', 'virus', 'worm', 'trojan', 'spyware', 'adware', 'ransomware', 'pharming', 'phishing', 'social engineering', 'firewall', 'proxy server', 'proxy', 'ssl', 'tls', 'secure socket', 'biometric',
        'two-step', 'two-factor', 'anti-malware', 'anti-virus', 'antivirus', 'access level', 'password', 'digital certificate', 'html', 'css', 'web page', 'webpage', 'website', 'ethic', 'copyright', 'plagiarism', 'freeware',
        'shareware', 'free software', 'web server', 'ip address', 'online', 'security'],
    6: ['automated system', 'automated', 'robot', 'robotic', 'artificial intelligence', ' ai ', '(ai)', 'expert system', 'machine learning', 'inference engine', 'knowledge base', 'rule base', 'autonomous', 'drone',
        'microprocessor', 'actuator', 'self-driving', 'chatbot', 'greenhouse', 'control system', 'sensor'],
    7: ['flowchart', 'trace table', 'decomposition', 'structure diagram', 'validation', 'verification', 'range check', 'length check', 'type check', 'presence check', 'format check', 'check digit', 'test data',
        'normal data', 'abnormal data', 'extreme data', 'boundary data', 'erroneous', 'linear search', 'bubble sort', 'totalling', 'counting', 'program development life cycle', 'analysis', 'design', 'coding', 'testing',
        'error', 'algorithm', 'pseudocode', 'purpose of this algorithm', 'double entry', 'visual check', 'abstraction', 'sub-system', 'subsystem', 'maximum', 'minimum', 'average'],
    8: ['variable', 'constant', 'data type', 'integer', 'real', 'char', 'string', 'boolean', 'array', 'two-dimensional', '2d array', 'procedure', 'function', 'parameter', 'local', 'global', 'library routine',
        'mod', 'div', 'round', 'random', 'file', 'iteration', 'selection', 'case', 'nested', 'substring', 'upper', 'lower', 'length', 'maintainable', 'write a program', 'program code', 'loop', 'for … next', 'repeat',
        'while', 'identifier', 'declare', 'sequence', 'subroutine', 'program', 'comment'],
    9: ['database', 'table', 'record', 'field', 'primary key', 'sql', 'select', 'from', 'where', 'order by', 'query', 'query-by-example', 'show'],
    10: ['logic gate', 'logic circuit', 'truth table', 'and gate', 'or gate', 'not gate', 'nand', 'nor', 'xor', 'logic expression', 'boolean expression', 'logic statement', 'gate'],
}
STRONG = {  # phrases that pin a topic almost on their own
    1: ['binary', 'denary', 'hexadecimal', "two's complement", 'two’s complement', 'colour depth', 'sample rate', 'sampling rate', 'lossy', 'lossless', 'kibibyte', 'kib)', 'logical shift', 'ascii', 'unicode', 'run length'],
    2: ['error detection', 'error-detection', 'check digit', 'parity', 'checksum', 'echo check', 'automatic repeat', 'serial', 'simplex', 'duplex', 'packet', 'encryption', 'encrypt'],
    3: ['von neumann', 'fetch', 'embedded system', 'sensor', 'printer', 'barcode', 'qr code', 'touch screen', 'random access memory', 'read only memory', 'mac address', 'solid state', 'solid-state', 'secondary storage', 'virtual memory', 'cache', 'cores', 'clock speed', 'router', 'ip address', 'projector', 'scanner', 'storage device'],
    4: ['operating system', 'interrupt', 'compiler', 'interpreter', 'assembler', 'assembly language', 'high-level language', 'utility', 'integrated development environment', 'firmware'],
    5: ['phishing', 'pharming', 'malware', 'firewall', 'proxy server', 'cookie', 'digital currency', 'blockchain', 'brute force', 'denial of service', 'ddos', 'web browser', 'url', 'ssl', 'tls', 'html', 'spyware', 'hacking', 'ethic', 'copyright', 'biometric', 'social engineering', 'dns'],
    6: ['automated', 'robot', 'artificial intelligence', 'expert system', 'machine learning', 'automated system', 'inference engine', 'knowledge base', 'self-driving', 'autonomous', 'drone'],
    7: ['flowchart', 'trace table', 'test data', 'totalling', 'standard method', 'validation', 'verification', 'structure diagram', 'decomposition', 'program development life cycle', 'range check', 'linear search', 'bubble sort', 'normal data', 'extreme data', 'abnormal data', 'boundary data'],
    8: ['write a program', 'program code', 'procedure', 'function', 'array', 'two-dimensional', 'parameter', 'data type', 'library routine', 'string handling', 'file', 'nested'],
    9: ['database', 'primary key', 'sql', 'query', 'field', 'record'],
    10: ['logic gate', 'logic circuit', 'truth table', 'logic expression', 'boolean expression', 'logic statement', 'nand', 'xor'],
}


def topics_allowed(base):
    _, sess, _, num = base.split('_')
    yy = int(sess[1:])
    p = num[0]
    if yy >= 23:
        return [1, 2, 3, 4, 5, 6] if p == '1' else [7, 8, 9, 10]
    return [1, 2, 3, 4, 5, 6, 10] if p == '1' else [7, 8, 9]


def score(text, allowed):
    t = ' ' + re.sub(r'\s+', ' ', text.lower()) + ' '
    t = t.replace('’', "'")
    sc = {}
    for k in allowed:
        s = 0.0
        for w in KW[k]:
            n = t.count(w)
            if n:
                s += min(n, 4)
        for w in STRONG[k]:
            n = t.count(w.replace('’', "'"))
            if n:
                s += 4 * min(n, 3)
        sc[k] = s
    return sc


def prerelease(base, text):
    _, sess, _, num = base.split('_')
    if int(sess[1:]) >= 23 or num[0] != '2':
        return False
    t = text.lower()
    return 'pre-release' in t or 'task 1' in t or 'task 2' in t or 'task 3' in t or 'your work on the pre-release' in t


if __name__ == '__main__':
    d = json.load(open('/home/claude/igt/seg.json'))
    out = []
    for base, v in d.items():
        allowed = topics_allowed(base)
        for q in v['qp']:
            if prerelease(base, q['text']):
                out.append(dict(base=base, n=q['n'], topic=0, sc={}, head=q['text'][:160]))
                continue
            sc = score(q['text'], allowed)
            best = sorted(sc.items(), key=lambda x: -x[1])
            out.append(dict(base=base, n=q['n'], topic=best[0][0], sc=best[:3], head=re.sub(r'\s+', ' ', q['text'])[:160]))
    json.dump(out, open('/home/claude/igt/cls.json', 'w'))
    c = collections.Counter(o['topic'] for o in out)
    print(len(out), sorted(c.items()))
