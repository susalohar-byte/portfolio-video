# Fit a voice-over with clear chapter pauses (ElevenLabs "[long pause]") to the script.
#   python3 align_pauses.py voice.wav
# Chapters = the 15 longest silences (≥ 1 s); inside a chapter the spoken heading comes first, then the sentences.
# Sentence starts: expected from text length, snapped to the nearest real pause. Word times: spread by length.
# Long silences are trimmed (the film adds its own gap between chapters).
import json, os, sys, subprocess, numpy as np
H = os.path.dirname(os.path.abspath(__file__)); V = H + '/voice'; os.makedirs(V, exist_ok=True)
L = json.load(open(H + '/lines.json')); SR = 48000
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-af', 'highpass=f=70,loudnorm=I=-16:TP=-2', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                                 capture_output=True, check=True).stdout, np.float32).astype(float)
hop = SR // 100
env = np.sqrt(np.convolve(x ** 2, np.ones(hop * 3) / (hop * 3), 'same')[::hop] + 1e-12)
quiet = env < env.max() * 0.025
def silences(min_s):
    out = []; i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if (j - i) / 100 >= min_s and i > 0 and j < len(quiet): out.append((i / 100, j / 100))
            i = j
        else: i += 1
    return out
long = sorted(sorted(silences(0.9), key=lambda s: s[1] - s[0], reverse=True)[:len(L) - 1])
assert len(long) == len(L) - 1, f'found {len(long)} chapter pauses'
starts = [0.0] + [b - 0.12 for a, b in long]; ends = [a + 0.3 for a, b in long] + [len(x) / SR]
short = silences(0.14)
dur = {'dur': {}, 'parts': {}, 'words': {}}
for ci, l in enumerate(L):
    a, b = starts[ci], ends[ci]
    clip = x[int(a * SR):int(b * SR)]; T = b - a
    pieces = [l['title']] + l['parts']; wts = [len(p) + 6 for p in pieces]; tot = sum(wts)
    gaps = [((s0 + s1) / 2 - a, s1 - a, s1 - s0) for s0, s1 in short if a + 0.2 < s0 and s1 < b - 0.2]
    offs = []; acc = 0; last = 0
    for k, p in enumerate(pieces[:-1]):
        acc += wts[k]; e = acc / tot * T
        cand = [g for g in gaps if g[1] > last + 0.4]
        if cand:
            g = min(cand, key=lambda g: abs(g[0] - e) - 1.2 * g[2]); offs.append(round(g[1] - 0.05, 3)); last = g[1]
        else: offs.append(round(e, 3)); last = e
    poffs = offs  # starts of parts (index 0 = first sentence after the heading)
    words = []
    for k, p in enumerate(l['parts']):
        s0 = poffs[k]; s1 = poffs[k + 1] - 0.25 if k + 1 < len(poffs) else T - 0.3
        ws = p.split(' '); wl = [len(w) + 2 for w in ws]; tw = sum(wl); c = 0; ts = []
        for wlen in wl: ts.append(round(s0 + (s1 - s0) * c / tw, 3)); c += wlen
        words.append(ts)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', f"{V}/{l['id']}.wav"], input=clip.astype('<f8').tobytes(), check=True)
    dur['dur'][l['id']] = round(T, 3); dur['parts'][l['id']] = poffs; dur['words'][l['id']] = words
    print(l['id'], round(a, 2), round(T, 2), poffs)
json.dump(dur, open(V + '/dur.json', 'w'), indent=1)
print('total', round(sum(dur['dur'].values()), 1))
