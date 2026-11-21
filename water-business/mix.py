# Story-driven mix: music changes with the mood of each act, real SFX for scene changes, pops, coins, stamps.
#   ./fetch_audio.sh && node render.mjs --still x && python3 mix.py  -> out/mix.wav (−14 LUFS)
import json, os, subprocess, numpy as np
H = os.path.dirname(os.path.abspath(__file__)); A = H + '/audio'; SR = 48000
META = json.load(open(H + '/out/meta.json')); DUR = META['DURATION']; N = int(SR * DUR)
VSTART = {v['id']: v['t'] for v in META['voice']}; VDIR = H + '/' + META['vdir']
EV = json.load(open(H + '/out/events.json'))
LEAD = 0.55
def load(path, norm=None):
    af = ['-af', f'loudnorm=I={norm}:TP=-2'] if norm else []
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path] + af + ['-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)
def add(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += g * x[:j - i]

# ---- music: one track per act, 2 s crossfades, each starts from its beginning
sc = lambda sid: VSTART[sid] - LEAD
ACTS = [  # (start time, track, gain)
    (0.0, 'm_discover.mp3', 1.0),          # cover + setup: curious, hopeful
    (sc('S08'), 'm_piano.mp3', 1.0),       # the scary first month
    (sc('S09'), 'm_dreaming.mp3', 0.9),    # the turn
    (sc('S10'), 'm_descent.mp3', 1.0),     # the problems nobody mentions, dark days
    (sc('S12'), 'm_ambition.mp3', 0.85),   # growth, the numbers, the lessons
]
mus = np.zeros(N); XF = 2.0
for k, (t0, f, gn) in enumerate(ACTS):
    t1 = ACTS[k + 1][0] if k + 1 < len(ACTS) else DUR
    x = load(f'{A}/{f}', norm=-20)
    need = int((t1 - t0 + XF) * SR)
    while len(x) < need: x = np.concatenate([x, x])   # loop if the act is longer than the track
    seg = x[:need].copy(); n = len(seg)
    fi = int(XF * SR) if k else int(0.3 * SR)
    seg[:fi] *= np.linspace(0, 1, fi)
    if k + 1 < len(ACTS): seg[-int(XF * SR):] *= np.linspace(1, 0, int(XF * SR))
    add(mus, seg * gn, max(0, t0 - (XF / 2 if k else 0)))
mus[-int(2.5 * SR):] *= np.linspace(1, 0, int(2.5 * SR))

# ---- voice
vo = np.zeros(N)
for sid, t in VSTART.items(): add(vo, load(f'{VDIR}/{sid}.wav'), t)
# duck music under the voice (smooth)
env = (np.abs(vo) > 0.01).astype(float)
k = int(SR * 0.35); env = np.convolve(env, np.ones(k) / k, 'same'); env = np.clip(env * 2.5, 0, 1)
a = np.exp(-1 / (SR * 0.25)); y = np.empty_like(env); s = 0.0
for i, v in enumerate(env): s = max(v, a * s + (1 - a) * v); y[i] = s
mus *= (1 - 0.72 * y)          # ~ −11 dB under speech

# ---- sfx
S = {n: load(f'{A}/{n}.mp3') for n in ['s_paper', 's_page', 's_woosh', 's_pop', 's_click', 's_coins', 's_coinwin', 's_stamp', 's_bell', 's_zap']}
lvl = lambda x, db: x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 10 ** (db / 20)
MAP = {  # event -> (sample, level dBFS rms, offset)
    'whoosh': ('s_paper', -30, -0.05), 'tick': ('s_pop', -36, 0.0), 'coin': ('s_coins', -30, 0.0),
    'stamp': ('s_stamp', -27, 0.0), 'bell': ('s_bell', -30, 0.0), 'thud': ('s_zap', -30, 0.0), 'motor': ('s_woosh', -36, 0.0),
}
sfx = np.zeros(N)
for e in EV:
    if e['k'] not in MAP: continue
    n, db, off = MAP[e['k']]; add(sfx, lvl(S[n], db), e['t'] + off)
# the cover -> first scene gets a soft whoosh; the big totals get a "win" chime
add(sfx, lvl(S['s_woosh'], -32), sc('S01') - 0.25)
mix = vo + mus * 0.55 + sfx
mix /= max(1e-9, np.abs(mix).max()) / 0.9
pcm = (np.stack([mix, mix], 1) * 32767).astype('<i2').tobytes()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), H + '/out/mix.wav'], input=pcm, check=True)
print('ok', round(DUR, 1), 's')
