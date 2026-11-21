"""Original score for "कितना कमाते हैं एक चायवाले?": a small West-Coast cool-jazz combo.
vibraphone (a chord per idea) / flute (motif) / pizzicato double bass (walking) / synthesized brushes / bongos / celesta colour.
112 BPM, 4/4. C major; up a whole step (D) for the busy corner; back to C for the truth and the ending.
Anchored to the film's voice timeline (film.js START/A). Run from the library root:
  .venv/bin/python "<project>/music/score.py"
Writes music/score.wav (stereo, 48 kHz).
"""
import sys, os, json
sys.path.insert(0, '.')
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from core.audio import sampler as S
from core.audio.sfx import SR, add

OUT = os.path.dirname(os.path.abspath(__file__))
S.seed(112); rng = np.random.default_rng(112)
B = 60 / 112; DUR = 63.0; N = int(DUR * SR)
mix = np.zeros((N, 2), np.float32)
def M(p): return S.midi(p) if isinstance(p, str) else p
def jit(ms=6): return float(rng.uniform(-ms, ms)) / 1000
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def grid(t): return round(t / B) * B          # snap a free time to the beat grid

# ---------------------------------------------------------------- instruments
def vib(t, chord, dur=2.4, vel=.5, hard=False, gain=.9, pan=-.2):
    for i, p in enumerate(chord):
        x = S.note('vibraphone_hard' if hard else 'vibraphone', M(p), dur, vel=vel)
        tt = np.arange(len(x)) / SR; x = x * (1 - .28 * (.5 + .5 * np.sin(2 * np.pi * 5.2 * tt + i)))
        add(mix, x.astype(np.float32), t + i * .012, gain, pan + (i - 1.5) * .07)
def gliss(t, notes, step=.045, vel0=.3, vel1=.6, gain=.7):
    for i, p in enumerate(notes):
        add(mix, S.note('vibraphone_hard', M(p), 1.0, vel=vel0 + (vel1 - vel0) * i / max(1, len(notes) - 1)), t + i * step, gain, -.3 + .6 * i / len(notes))
def flute(t, p, beats, vel=.5, gain=.55, pan=.25):
    add(mix, S.note('flute', M(p), max(.12, beats * B * .9), vel=vel, release=.09), t - .02, gain, pan)
def bass(t, p, beats=1, vel=.6, gain=1.0):
    add(mix, S.note('contrabass_pizz', M(p), beats * B * .95, vel=vel), t + jit(4), gain, .05)
def celesta(t, p, vel=.45, gain=.5):
    f = S.hz(M(p)); d = 1.4; tt = np.arange(int(d * SR)) / SR
    s = np.sin(2 * np.pi * f * tt) * np.exp(-tt / .5) + .35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / .16) + .1 * np.sin(2 * np.pi * 4.03 * f * tt) * np.exp(-tt / .05)
    add(mix, (s * vel * .5).astype(np.float32), t, gain, .4)
def brush_tap(t, v=.4):
    d = .14; x = rng.standard_normal(int(d * SR)); x = bp(x, 2500, 9000) * np.exp(-np.arange(len(x)) / SR / .035)
    add(mix, (x * v * .35).astype(np.float32), t + jit(5), 1.0, -.1)
def brush_swirl(t, d, v=.25):
    n = int(d * SR); x = bp(rng.standard_normal(n), 3000, 10000) * np.sin(np.pi * np.arange(n) / n) ** 1.5
    add(mix, (x * v * .12).astype(np.float32), t, 1.0, -.2)
def bongo(t, hi=True, v=.5):
    add(mix, S.note('world_perc', 'bongo_high' if hi else 'bongo_low_high_velocity', .4, vel=v), t + jit(5), .7, .3 if hi else -.3)
def snap(t, v=.5):
    add(mix, S.note('world_perc', 'hand_clap', .3, vel=v), t + jit(4), .35, .2)

WALK = {'C': ['C2', 'E2', 'G2', 'A2', 'C3', 'A2', 'G2', 'E2'], 'Am': ['A1', 'C2', 'E2', 'G2'], 'Dm': ['D2', 'F2', 'A2', 'C3'], 'G': ['G1', 'B1', 'D2', 'F2'],
        'D': ['D2', 'F#2', 'A2', 'B2', 'D3', 'B2', 'A2', 'F#2'], 'F': ['F1', 'A1', 'C2', 'E2']}
def walk(t0, t1, key='C', every=1, vel=.55):
    seq = WALK[key]; i = 0; t = grid(t0)
    while t < t1 - 1e-3:
        bass(t, seq[i % len(seq)], every, vel); i += 1; t += every * B
def brushes(t0, t1, v=.3, eighths=False):
    t = grid(t0); k = 0
    while t < t1 - 1e-3:
        if k % 2 == 0: brush_swirl(t, 2 * B, v)
        if k % 2 == 1: brush_tap(t, v * 1.3)
        if eighths: brush_tap(t + B * .6, v * .7)
        k += 1; t += B

ev = json.load(open(os.path.join(OUT, '..', 'events.json')))['ev']
hits = []
def H(t, label): hits.append({'t': round(t, 3), 'label': label})

# ---------------------------------------------------------------- the cue map
# Intro / hook (0–7.6): brushes + walking bass, flute pickup into the ₹15 stamp
walk(0.0, 7.6, 'C'); brushes(0.0, 7.6, .28)
for i, (p, b) in enumerate([('G5', .5), ('A5', .5), ('C6', 1)]): flute(1.80 - 1.0 + i * .5 * B * 2, p, b, .45)
vib(1.80, ['C4', 'E4', 'G4', 'B4'], 2.6, .6, hard=True); H(1.80, 'stamp15')
vib(4.82, ['A3', 'C4', 'E4', 'G4'], 1.6, .4); vib(5.34, ['D4', 'F4', 'A4', 'C5'], 1.8, .45)
gliss(7.6, ['C4', 'E4', 'G4', 'B4', 'D5', 'E5', 'G5'], .07); H(7.6, 'iris')
# Cup opened (8.5–21.3): half-time — bass on halves, one vibraphone chord per layer
walk(8.5, 21.3, 'C', every=2, vel=.5); brushes(8.5, 21.3, .2)
for t, ch in [(9.36, ['C4', 'E4', 'G4', 'B4']), (12.26, ['A3', 'C4', 'E4', 'G4']), (14.66, ['D4', 'F4', 'A4', 'C5']), (17.0, ['G3', 'B3', 'D4', 'F4'])]:
    vib(t, ch, 2.4, .5); H(t, 'layer')
vib(19.60, ['C4', 'E4', 'G4', 'A4', 'D5'], 2.8, .62, hard=True); H(19.60, 'total')
# Split (21.3–25.6): back to normal walk; a bright Fmaj7 on ₹8.40
walk(21.3, 25.4, 'F'); brushes(21.3, 25.4, .3)
vib(23.76, ['F4', 'A4', 'C5', 'E5'], 2.4, .6, hard=True); H(23.76, 'bacha')
gliss(25.35, ['E4', 'G4', 'C5', 'E5', 'G5'], .06)
# Multiply (25.9–31.8): double-time brushes, a celesta note per row, finger snaps; stamp on ₹50,000
walk(25.9, 31.8, 'C', every=.5, vel=.5); brushes(25.9, 31.8, .32, eighths=True)
rows = [e['t'] for e in ev if e['type'] == 'cup']
scale = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6']
for i, t in enumerate(rows[:20]): celesta(t, scale[min(9, i // 2)], .35 + .25 * i / 20); (snap(t, .35) if i % 2 else None)
vib(30.26, ['C4', 'E4', 'G4', 'B4', 'D5'], 2.0, .65, hard=True); H(30.26, '50k')
# Costs (31.8–38.45): bass alone + bongos, a low chord per bite; then FULL SILENCE 38.45–39.2
walk(32.2, 38.4, 'Am', vel=.5)
t = grid(32.2)
while t < 38.3: bongo(t, True, .35); bongo(t + B * .5, False, .3); t += B
for tt, ch in [(33.45, ['A2', 'E3', 'A3', 'C4']), (34.29, ['F2', 'C3', 'F3', 'A3']), (35.77, ['D3', 'A3', 'C4', 'F4'])]: vib(tt, ch, 1.6, .5); H(tt, 'bite')
vib(37.46, ['E3', 'G#3', 'D4', 'B3'], 1.0, .45)
# Result (39.2–43): first sound after silence — vibraphone glissando into a ringing Cmaj9
gliss(39.2, ['C4', 'E4', 'G4', 'B4', 'D5', 'E5', 'G5', 'B5'], .05, .4, .7, .8); H(39.2, 'silenceEnd')
vib(40.84, ['C4', 'E4', 'G4', 'B4', 'D5'], 3.4, .6); H(40.84, 'res25')
walk(41.0, 43.0, 'C', every=2, vel=.45)
# Busy corner (43.3–49.6): up a whole step to D, eighth brushes, flute riff
walk(43.3, 49.9, 'D'); brushes(43.3, 49.9, .35, eighths=True)
for i, p in enumerate(['A5', 'B5', 'D6', 'B5', 'A5', 'F#5', 'A5']): flute(44.3 + i * B, p, .9, .5)
vib(46.18, ['D4', 'F#4', 'A4', 'B4'], 2.0, .55, hard=True); H(46.18, 'd400')
vib(47.15, ['D4', 'F#4', 'A4', 'C#5', 'E5'], 2.6, .65, hard=True); H(47.15, 'd75k')
# Truth (49.8–54.2): back to C, sparse; low chord on "नहीं", bright on "गिनती"
walk(50.1, 54.2, 'Dm', every=2, vel=.45); brushes(50.1, 54.2, .18)
vib(51.84, ['D3', 'F3', 'A3', 'C4'], 1.6, .45); vib(52.88, ['C4', 'E4', 'G4', 'B4', 'E5'], 2.4, .6, hard=True); H(52.88, 'ginti')
# Ending (54.45–63): sparse flute over soft brushes, room for the still card; last chord on the iris-out
walk(54.45, 60.5, 'C', every=2, vel=.4); brushes(54.45, 60.5, .14)
for i, (p, b) in enumerate([('E5', 1), ('G5', 1), ('A5', 2), ('G5', 1), ('E5', 1), ('C5', 2)]): flute(55.0 + sum([1, 1, 2, 1, 1, 2][:i]) * B, p, b, .42)
vib(61.2, ['C4', 'E4', 'G4', 'B4', 'D5'], 4.0, .55); H(61.2, 'irisOut')

# hard silence before the result
a, b = int(38.45 * SR), int(39.2 * SR); mix[a:b] = 0
peak = np.abs(mix).max(); mix = mix / peak * .8 if peak > 0 else mix
sf.write(os.path.join(OUT, 'score.wav'), mix, SR)
json.dump(hits, open(os.path.join(OUT, 'hits.json'), 'w'), indent=1)
print('score', round(DUR, 2), 's, hits', len(hits))
