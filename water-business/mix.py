# Score + SFX + voice mix, all synthesised here (no samples).  python3 mix.py  -> out/mix.wav
import json, os, re, subprocess, numpy as np
H = os.path.dirname(os.path.abspath(__file__)); SR = 48000
META = json.load(open(H + '/out/meta.json')); DUR = META['DURATION']; N = int(SR * DUR)
START = {v['id']: v['t'] for v in META['voice']}; VDIR = H + '/' + META['vdir']
ev = json.load(open(H + '/out/events.json'))
R = np.random.default_rng(5)
t_ = lambda d: np.arange(int(SR * d)) / SR
def add(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x));
    if i < len(buf): buf[i:j] += g * x[:j - i]
def lp(x, a):  # one-pole low-pass
    y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s += a * (v - s); y[i] = s
    return y
def ks(f, d, bright=0.5):  # Karplus-Strong pluck
    n = int(SR / f); buf = R.uniform(-1, 1, n); out = np.empty(int(SR * d)); 
    for i in range(len(out)):
        out[i] = buf[i % n]; buf[i % n] = 0.5 * (buf[i % n] + buf[(i + 1) % n]) * (0.994 + 0.005 * bright)
    return out * np.exp(-t_(d) * 1.2)
def bellnote(f, d=1.6, a=0.5):
    tt = t_(d); return a * (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 6)) * np.exp(-tt * 3.2) * (1 - np.exp(-tt * 400))
def pad(fs, d):
    tt = t_(d); x = sum(np.sin(2 * np.pi * f * tt + np.sin(2 * np.pi * 0.2 * tt) * 0.3) + 0.3 * np.sin(2 * np.pi * f * 2.001 * tt) for f in fs)
    env = np.minimum(1, tt / 0.8) * np.minimum(1, (d - tt) / 0.8); return x * env / len(fs)

# ---- score: 80 bpm, gentle plucked guitar + music-box melody + warm pad, D major pentatonic
bpm = 80; beat = 60 / bpm; bar = 4 * beat
mus = np.zeros(N)
nf = lambda m: 440 * 2 ** ((m - 69) / 12)
prog = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]  # D  Bm  G  A
melody = [74, 76, 78, 81, 78, 76, 74, None, 71, 74, 76, 74, 71, 69, None, None,
          67, 69, 71, 74, 71, 69, 67, None, 69, 71, 73, 76, 73, 71, 69, None]
nb = int(DUR / bar) + 1
for b in range(nb):
    t0 = b * bar; ch = prog[b % 4]
    if t0 > DUR - 1: break
    add(mus, pad([nf(m) for m in ch[1:]], bar + 0.6) * 0.10, t0)
    for k, m in enumerate([ch[0], ch[1], ch[2], ch[3], ch[2], ch[1], ch[2], ch[3]]):  # 8th-note arpeggio
        add(mus, ks(nf(m), 1.8) * 0.12, t0 + k * beat / 2)
    if 1 <= b < nb - 1 and (b // 4) % 2 == 0:  # melody on alternate 4-bar phrases
        for k in range(8):
            m = melody[(b * 8 + k) % len(melody)]
            if m is not None and k % 2 == 0: add(mus, bellnote(nf(m), 1.4, 0.13), t0 + k * beat / 2)
# end: final D chord bell
add(mus, sum(bellnote(nf(m), 3.0, 0.12) for m in [62, 66, 69, 74]), DUR - 3.4)
mus *= np.minimum(1, np.arange(N) / (SR * 1.2)) * np.clip((DUR - np.arange(N) / SR) / 1.2, 0, 1)

# ---- voice
vo = np.zeros(N)
for k, s in START.items():
    x = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{VDIR}/{k}.wav', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    add(vo, np.frombuffer(x, np.float32).astype(float), s)
# voice: gentle EQ warmth (slight low-pass) + level
vo = 0.6 * vo + 0.4 * lp(vo, 0.35)
# duck music under voice
env = np.convolve((np.abs(vo) > 0.01).astype(float), np.ones(int(SR * 0.25)) / (SR * 0.25), 'same')
env = np.clip(env * 3, 0, 1); env = lp(env, 0.0005)
mus *= (1 - 0.55 * env)

# ---- sfx
sfx = np.zeros(N)
def coin_s():
    d = 0.5; tt = t_(d); return (np.sin(2 * np.pi * 2093 * tt) * np.exp(-tt * 9) + 0.7 * np.sin(2 * np.pi * 2637 * tt) * np.exp(-np.maximum(tt - 0.07, 0) * 9) * (tt > 0.07)) * 0.3
def motor():
    d = 1.6; tt = t_(d); return lp(R.normal(0, 1, len(tt)), 0.05) * (0.5 + 0.5 * np.sin(2 * np.pi * 28 * tt)) * np.minimum(1, tt / 0.3) * np.exp(-tt * 1.2) * 0.8
def whoosh():
    d = 0.6; n = R.normal(0, 1, int(SR * d)); tt = t_(d); e = np.sin(np.pi * tt / d) ** 2
    return lp(n, 0.06) * e * 0.9 + lp(n, 0.2) * e * 0.15
def thump():
    d = 0.35; tt = t_(d); body = np.sin(2 * np.pi * (90 - 50 * tt) * tt) * np.exp(-tt * 22)
    clk = R.normal(0, 1, len(tt)) * np.exp(-tt * 120) * 0.5; return body * 0.9 + lp(clk, 0.4)
def postmark_s():
    d = 0.35; tt = t_(d); return thump()[:len(tt)] * 0.6 + lp(R.normal(0, 1, len(tt)), 0.15) * np.exp(-tt * 18) * 0.5
def bell():
    d = 1.4; tt = t_(d); return (np.sin(2 * np.pi * 1850 * tt) + 0.6 * np.sin(2 * np.pi * 2630 * tt) + 0.3 * np.sin(2 * np.pi * 4100 * tt)) * np.exp(-tt * 4) * 0.25
def tick():
    d = 0.08; tt = t_(d); return lp(R.normal(0, 1, len(tt)), 0.5) * np.exp(-tt * 90) * 0.4
F = {'coin': (coin_s, 0.5), 'motor': (motor, 0.5), 'thud': (lambda: thump(), 0.7), 'whoosh': (whoosh, 0.3), 'stamp': (thump, 0.55), 'postmark': (postmark_s, 0.45), 'bell': (bell, 0.5), 'tick': (tick, 0.5)}
for e in ev:
    f, gn = F[e['k']]; add(sfx, f(), e['t'], gn)
# room tone
room = lp(R.normal(0, 1, N), 0.02) * 0.02

mix = vo * 1.0 + mus * 0.55 + sfx * 0.7 + room
mix /= max(1e-9, np.abs(mix).max()) / 0.9
os.makedirs(H + '/out', exist_ok=True)
pcm = (np.stack([mix, mix], 1) * 32767).astype('<i2').tobytes()
p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-',
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), H + '/out/mix.wav'], input=pcm)
print('ok')
