# Use your own recorded voice-over.
#   python3 voice_import.py rec/                -> rec/S01.(wav|mp3|m4a) … rec/S16.*  (one file per chapter)
#   python3 voice_import.py my_full_take.m4a    -> one file; chapters split at the 15 longest pauses (keep ~2 s silence between chapters)
# Writes voice/S01.wav … voice/S16.wav and voice/dur.json (chapter length + sentence offsets) for film.js.
import json, os, sys, glob, subprocess, numpy as np
H = os.path.dirname(os.path.abspath(__file__)); V = H + '/voice'; os.makedirs(V, exist_ok=True)
L = json.load(open(H + '/lines.json')); SR = 48000
def load(f):  # mono float, loudness-levelled, gentle cleanup
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-af', 'highpass=f=80,afftdn=nf=-25,loudnorm=I=-16:TP=-2', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)
def gaps(x, min_s):
    env = np.convolve(np.abs(x), np.ones(480) / 480, 'same'); on = env > 0.012; out = []; i = 0
    while i < len(on):
        if not on[i]:
            j = i
            while j < len(on) and not on[j]: j += 1
            if (j - i) > SR * min_s and i > 0 and j < len(on): out.append((j - i, i, j))
            i = j
        else: i += 1
    return out, on
def trim(x):
    _, on = gaps(x, 9e9); i0 = int(np.argmax(on)); i1 = len(on) - int(np.argmax(on[::-1]))
    return x[max(0, i0 - 2400):i1 + 4800]
src = sys.argv[1]
if os.path.isdir(src):
    clips = {}
    for l in L:
        f = next(iter(sorted(glob.glob(f"{src}/{l['id']}.*"))), None)
        if not f: sys.exit(f"missing {l['id']} in {src}")
        clips[l['id']] = trim(load(f))
else:
    x = load(src); g, _ = gaps(x, 0.9)
    cut = sorted(sorted(g, reverse=True)[:len(L) - 1], key=lambda a: a[1])
    if len(cut) < len(L) - 1: sys.exit('could not find 15 chapter pauses — leave ~2 s silence between chapters, or send one file per chapter')
    bounds = [0] + [(c[1] + c[2]) // 2 for c in cut] + [len(x)]
    clips = {l['id']: trim(x[bounds[i]:bounds[i + 1]]) for i, l in enumerate(L)}
dur = {'dur': {}, 'parts': {}}
for l in L:
    x = clips[l['id']]; n = len(l['parts'])
    g, _ = gaps(x, 0.15)
    # sentence starts: expected from text length, snapped to the nearest real pause (longer pauses preferred)
    tot = sum(len(p) for p in l['parts']); acc = 0; offs = [0.0]; last = 0
    for p in l['parts'][:-1]:
        acc += len(p); e = acc / tot * len(x)
        cands = [c for c in g if c[1] > last]
        if cands:
            c = min(cands, key=lambda c: abs((c[1] + c[2]) / 2 - e) / SR - 0.9 * c[0] / SR)
            offs.append(round(c[2] / SR - 0.05, 3)); last = c[2]
        else: offs.append(round(e / SR, 3))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', f"{V}/{l['id']}.wav"], input=x.astype('<f8').tobytes(), check=True)
    dur['dur'][l['id']] = round(len(x) / SR, 3); dur['parts'][l['id']] = offs
    print(l['id'], dur['dur'][l['id']], offs)
json.dump(dur, open(V + '/dur.json', 'w'), indent=1)
print('total', round(sum(dur['dur'].values()), 1), 's  — now: node render.mjs --still x && python3 mix.py && node render.mjs --out out/video.mp4')
