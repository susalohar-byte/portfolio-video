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

# ---- music: one motivational track (Driving Ambition) throughout, looped with crossfades, very low (≈3 %)
mus = np.zeros(N); XF = 3.0
x = load(f'{A}/m_ambition.mp3', norm=-16)
pos = 0.0
while pos < DUR:
    seg = x.copy(); fi = int(XF * SR)
    if pos > 0: seg[:fi] *= np.linspace(0, 1, fi)
    seg[-fi:] *= np.linspace(1, 0, fi)
    add(mus, seg, pos); pos += len(x) / SR - XF
mus[:int(0.5 * SR)] *= np.linspace(0, 1, int(0.5 * SR)); mus[-int(2.5 * SR):] *= np.linspace(1, 0, int(2.5 * SR))
sc = lambda sid: VSTART[sid] - LEAD
# ---- voice
vo = np.zeros(N)
for sid, t in VSTART.items(): add(vo, load(f'{VDIR}/{sid}.wav'), t)
MUSIC_GAIN = 0.03
cover = np.ones(N); cover[:int(sc('S01') * SR)] = 2.0
mus *= MUSIC_GAIN * cover

# ---- sfx
S = {n: load(f'{A}/{n}.mp3') for n in ['s_paper', 's_page', 's_woosh', 's_pop', 's_click', 's_coins', 's_coinwin', 's_stamp', 's_bell', 's_zap']}
lvl = lambda x, db: x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 10 ** (db / 20)
MAP = {'whoosh': ('s_page', -40, -0.05), 'bell': ('s_bell', -38, 0.0)}
sfx = np.zeros(N)
for e in EV:
    if e['k'] not in MAP or (e['k'] == 'whoosh' and e['t'] < sc('S01') + 0.5): continue
    n, db, off = MAP[e['k']]; add(sfx, lvl(S[n], db), e['t'] + off)
# the cover -> first scene gets a soft whoosh; the big totals get a "win" chime
for sid, k, d in [('S05', 8, 0.2), ('S13', 6, 0.15)]:   # the two big totals
    add(sfx, lvl(S['s_coinwin'], -38), VSTART[sid] + json.load(open(VDIR + '/dur.json'))['parts'][sid][k] + d)
mix = vo + mus + sfx
mix /= max(1e-9, np.abs(mix).max()) / 0.9
pcm = (np.stack([mix, mix], 1) * 32767).astype('<i2').tobytes()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), H + '/out/mix.wav'], input=pcm, check=True)
print('ok', round(DUR, 1), 's')
