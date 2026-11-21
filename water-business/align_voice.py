# Align a continuous voice-over (no chapter pauses) to the script using a word-timed transcript.
#   python3 align_voice.py voice.wav words.json
# words.json: [{"w": word, "s": start, "e": end}, …] from faster-whisper (word_timestamps=True, language='bn').
# Cuts voice/S01.wav … S16.wav at the first word of each chapter and writes voice/dur.json with sentence offsets.
import json, os, re, sys, subprocess, difflib, numpy as np
H = os.path.dirname(os.path.abspath(__file__)); V = H + '/voice'; os.makedirs(V, exist_ok=True)
L = json.load(open(H + '/lines.json')); W = json.load(open(sys.argv[2])); SR = 48000
norm = lambda s: re.sub(r'[^ঀ-৿A-Za-z0-9]', '', s)
# script chars with (chapter, part) for the first char of every part
sc, starts = [], []
for ci, l in enumerate(L):
    for pi, p in enumerate(l['parts']):
        starts.append((ci, pi, len(sc)))
        sc += list(norm(p.replace('FSSAI', 'এফএসএসএআই').replace('NOC', 'এনওসি').replace('ISI', 'আইএসআই')))
# transcript chars with a time each (spread across the word)
tc, tt = [], []
for w in W:
    cs = norm(w['w'])
    for k, ch in enumerate(cs): tc.append(ch); tt.append(w['s'] + (w['e'] - w['s']) * k / max(1, len(cs)))
sm = difflib.SequenceMatcher(None, sc, tc, autojunk=False)
pairs = [(a + k, b + k) for a, b, n in sm.get_matching_blocks() for k in range(n)]
A = np.array([p[0] for p in pairs]); B = np.array([tt[p[1]] for p in pairs])
print(f'matched {len(pairs)}/{len(sc)} script chars')
tim = lambda i: float(np.interp(i, A, B))
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-af', 'highpass=f=70,loudnorm=I=-16:TP=-2', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).astype(float)
total = len(x) / SR
chap0 = [tim(s[2]) for s in starts if s[1] == 0]
dur = {'dur': {}, 'parts': {}}
for ci, l in enumerate(L):
    a = max(0, chap0[ci] - 0.12); b = (chap0[ci + 1] - 0.06) if ci + 1 < len(L) else total
    clip = x[int(a * SR):int(b * SR)]
    offs = [round(max(0, tim(s[2]) - a - 0.04), 3) for s in starts if s[0] == ci]; offs[0] = 0.0
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', f"{V}/{l['id']}.wav"], input=clip.astype('<f8').tobytes(), check=True)
    dur['dur'][l['id']] = round(len(clip) / SR, 3); dur['parts'][l['id']] = offs
    print(l['id'], round(a, 2), dur['dur'][l['id']], offs)
json.dump(dur, open(V + '/dur.json', 'w'), indent=1)
print('total', round(sum(dur['dur'].values()), 1))
