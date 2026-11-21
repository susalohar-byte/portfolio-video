# Align a continuous voice-over (no chapter pauses) to the script using a word-timed transcript.
#   python3 align_voice.py voice.wav words.json
# words.json: [{"w": word, "s": start, "e": end}, …] from faster-whisper (word_timestamps=True, language='bn').
# Whisper often writes Bengali speech in Devanagari, so both sides are reduced to a consonant skeleton first.
# Writes voice/S01.wav … S16.wav (a spoken chapter heading stays with its chapter) and voice/dur.json with
# chapter lengths, sentence offsets and per-word start times (used by the captions).
import json, os, sys, subprocess, difflib, numpy as np
H = os.path.dirname(os.path.abspath(__file__)); V = H + '/voice'; os.makedirs(V, exist_ok=True)
L = json.load(open(H + '/lines.json')); SR = 48000
import re
# keep only plausible words (Bengali/Devanagari, no runaway repeats)
W = [w for w in json.load(open(sys.argv[2])) if re.fullmatch(r'[\u0900-\u09FF]+[,.?।!]*', w['w'] or '') and len(set(w['w'])) > 1 and len(w['w']) < 18]

def to_bn(s): return ''.join(chr(ord(c) + 0x80) if 0x0900 <= ord(c) <= 0x097F else c for c in s)
CLS = {}
for grp, k in [('কখ', 'K'), ('গঘ', 'G'), ('চছ', 'C'), ('জঝযয়', 'J'), ('টঠতথৎ', 'T'), ('ডঢদধ', 'D'), ('নণঞ', 'N'), ('পফ', 'P'),
               ('বভ', 'B'), ('ম', 'M'), ('রড়ঢ়ল', 'R'), ('শষস', 'S'), ('হ', 'H'), ('ঙংঁ', 'N')]:
    for ch in grp: CLS[ch] = k
def norm(s):
    s = to_bn(s).replace('ড়', 'ড়').replace('ঢ়', 'ঢ়').replace('য়', 'য়')
    return ''.join(CLS[c] for c in s if c in CLS)

sc, starts, wstart, cend = [], [], [], []
tstart = []
for ci, l in enumerate(L):
    tstart.append(len(sc)); sc += list(norm(l['title']))   # the voice reads each chapter heading too
    for pi, p in enumerate(l['parts']):
        starts.append((ci, pi, len(sc)))
        for w in p.replace('FSSAI', 'এফএসএসএআই').replace('NOC', 'এনওসি').replace('ISI', 'আইএসআই').split(' '):
            wstart.append((ci, pi, len(sc))); sc += list(norm(w))
    cend.append(len(sc) - 1)
tc, tt = [], []
for w in W:
    cs = norm(w['w'])
    for k, ch in enumerate(cs): tc.append(ch); tt.append(w['s'] + (w['e'] - w['s']) * k / max(1, len(cs)))
sm = difflib.SequenceMatcher(None, sc, tc, autojunk=False)
pairs = [(a + k, b + k) for a, b, n in sm.get_matching_blocks() if n >= 4 for k in range(n)]  # short matches are often accidental
A = np.array([p[0] for p in pairs], float); B = np.array([tt[p[1]] for p in pairs])
print(f'matched {len(pairs)}/{len(sc)} script consonants')
tim = lambda i: float(np.interp(i, A, B))

x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-af', 'highpass=f=70,loudnorm=I=-16:TP=-2', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                                 capture_output=True, check=True).stdout, np.float32).astype(float)
total = len(x) / SR
hop = int(SR * 0.02); env = np.sqrt(np.convolve(x ** 2, np.ones(hop * 4) / (hop * 4), 'same')[::hop] + 1e-12)
def snap(tm, r=0.7):
    i0, i1 = max(0, int((tm - r) / 0.02)), min(len(env) - 1, int((tm + r) / 0.02))
    seg = env[i0:i1 + 1]
    if not len(seg): return tm
    j = int(np.argmin(seg + np.abs(np.arange(i0, i1 + 1) * 0.02 - tm) * 0.02 * env.max()))
    # the speech restarts just after the quietest point
    k = i0 + j
    while k < len(env) - 1 and env[k] < env.max() * 0.08: k += 1
    return k * 0.02
last = [tim(e) for e in cend]
pstart = {(c, p): snap(tim(i)) for c, p, i in starts}
dur = {'dur': {}, 'parts': {}, 'words': {}}
for ci, l in enumerate(L):
    bnd = lambda c: 0.0 if c == 0 else max(last[c - 1] + 0.05, snap(tim(tstart[c]), 0.4) - 0.12)
    a = bnd(ci); b = bnd(ci + 1) if ci + 1 < len(L) else total
    clip = x[int(a * SR):int(b * SR)]
    offs = [round(max(0, pstart[(s[0], s[1])] - a - 0.05), 3) for s in starts if s[0] == ci]
    words = [[round(max(0, tim(w[2]) - a - 0.03), 3) for w in wstart if w[0] == ci and w[1] == pi] for pi in range(len(l['parts']))]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', f"{V}/{l['id']}.wav"],
                   input=clip.astype('<f8').tobytes(), check=True)
    dur['dur'][l['id']] = round(len(clip) / SR, 3); dur['parts'][l['id']] = offs; dur['words'][l['id']] = words
    print(l['id'], round(a, 2), dur['dur'][l['id']], offs)
json.dump(dur, open(V + '/dur.json', 'w'), indent=1)
print('total', round(sum(dur['dur'].values()), 1))
