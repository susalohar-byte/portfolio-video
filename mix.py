"""Mix: voice (compressed, on top) + score (ducked ~8 dB under speech) + foley from events.json + ambience beds.
Run from the library root: .venv/bin/python "<project>/mix.py"  → <project>/out/mix.wav
"""
import sys, os, json, re
sys.path.insert(0, '.')
import numpy as np, soundfile as sf, soxr
from core.audio import sfx as X
from core.audio.sfx import SR, add, compress, limit, lp, hp, bp, noise, t_, env_exp, norm

P = os.path.dirname(os.path.abspath(__file__))
DUR = 63.0; N = int(DUR * SR)
film = open(os.path.join(P, 'film.js'), encoding='utf-8').read()
START = {k: float(v) for k, v in re.findall(r"(L\d\d): ([\d.]+)", film.split('export const START')[1].split('};')[0])}
EV = json.load(open(os.path.join(P, 'events.json')))['ev']
SIL = (38.45, 39.2)
rng = np.random.default_rng(7)

def load(path):
    x, sr = sf.read(path, dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    return soxr.resample(x, sr, SR) if sr != SR else x

# ---- voice
voice = np.zeros((N, 2), np.float32)
for lid, t in START.items():
    v = load(os.path.join(P, 'voice', lid + '.wav')); add(voice, v, t, 1.0, 0.0)
vm = compress(voice[:, 0].astype(np.float64), thr=.18, ratio=3.2); voice = np.stack([vm, vm], 1).astype(np.float32)
voice *= .5 / (np.sqrt(np.mean(voice[np.abs(voice[:, 0]) > .01] ** 2)) + 1e-9) * .35

# ---- score, ducked under speech
mus, sr = sf.read(os.path.join(P, 'music', 'score.wav'), dtype='float32')
mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
env = np.abs(voice[:, 0]); k = int(.12 * SR); env = np.convolve(env, np.ones(k) / k, 'same')
duck = 1 - (1 - 10 ** (-8 / 20)) * np.clip(env / (env.max() * .15 + 1e-9), 0, 1)
mus = mus * duck[:, None]
vr = np.sqrt(np.mean(voice[np.abs(voice[:, 0]) > .01] ** 2)); mr = np.sqrt(np.mean(mus ** 2)) + 1e-9
mus *= (vr * 10 ** (-10 / 20)) / mr                      # voice ≈ 10 dB above the music

# ---- foley by material
def stamp(): return norm(X.thump(1, 90) + np.pad(X.click(.6, .6), (0, len(X.thump(1, 90)) - len(X.click(.6, .6)))))
def pour():
    d = .9; x = bp(noise(d), 300, 1600) * (.6 + .4 * np.sin(2 * np.pi * 9 * t_(d))) * np.sin(np.pi * t_(d) / d)
    return norm(x) * .8
def rustle(d=.5): return norm(hp(noise(d), 2500) * (rng.random(int(d * SR)) > .7) * np.sin(np.pi * t_(d) / d)) * .6
def sprinkle():
    out = np.zeros(int(.7 * SR))
    for i in range(22): s = int(rng.uniform(0, .6) * SR); c = X.step(.3); out[s:s + len(c)] += c[:len(out) - s] * rng.uniform(.2, .5)
    return norm(out) * .6
def gas():
    c = X.click(.5, 1); d = .8; h = bp(noise(d), 400, 2000) * np.minimum(1, t_(d) / .1) * np.exp(-t_(d) / .6) * .5
    return norm(np.concatenate([c, h]))
def coins(n=6):
    out = np.zeros(int(1.0 * SR))
    for i in range(n): s = int(i * .07 * SR); f = rng.uniform(2600, 3600); d = .35; x = np.sin(2 * np.pi * f * t_(d)) * env_exp(d, .07) + .5 * np.sin(2 * np.pi * f * 1.48 * t_(d)) * env_exp(d, .04); out[s:s + len(x)] += x * rng.uniform(.4, .8)
    return norm(out) * .7
def clink(): return coins(1) * .8
def slide(): d = .5; return norm(bp(noise(d), 800, 3000) * np.sin(np.pi * t_(d) / d)) * .35
def cup(): return norm(np.sin(2 * np.pi * 2400 * t_(.2)) * env_exp(.2, .03) + .4 * np.sin(2 * np.pi * 3900 * t_(.2)) * env_exp(.2, .02)) * .35
def knock(): return norm(X.clack(.5, 1)) * .9
def cloth(): return X.whoosh(.3, .5)
def switch(): c = X.click(1.2, 1); d = .7; h = np.sin(2 * np.pi * 100 * t_(d)) * .15 * np.minimum(1, t_(d) / .05) * np.exp(-t_(d) / .4); return np.concatenate([c, h])
def pen(): d = .5; return norm(hp(noise(d), 3000) * (np.abs(np.sin(2 * np.pi * 14 * t_(d))) ** 2) * np.sin(np.pi * t_(d) / d)) * .4
def iris(): d = .55; return norm(bp(noise(d), 1500, 6000) * np.sin(np.pi * t_(d) / d) ** 2) * .55
def swish(): return X.whoosh(.32, .55)
def cross(): return pen() * 1.4
def counter():
    out = np.zeros(int(1.2 * SR))
    for i in range(14): s = int(i * .075 * SR); c = X.click(1.4, .5); out[s:s + len(c)] += c
    return out * .5
def sparkle(): d = 1.2; return norm(sum(np.sin(2 * np.pi * f * t_(d)) * env_exp(d, .25) for f in (2093, 2637, 3136, 4186))) * .35

SOUND = {'stamp': (stamp, .8), 'pat': (lambda: X.thump(.5, 140), .45), 'pop': (lambda: X.pop(.6), .45), 'clink': (clink, .5), 'iris': (iris, .5), 'swish': (swish, .45),
         'pour': (pour, .55), 'tag': (lambda: X.pop(.5), .4), 'rustle': (rustle, .55), 'sprinkle': (sprinkle, .5), 'gas': (gas, .55), 'pen': (pen, .5),
         'slide': (slide, .5), 'coins': (coins, .55), 'cup': (cup, .5), 'whoosh': (lambda: X.whoosh(.6, .6), .5), 'knock': (knock, .7), 'cloth': (cloth, .55),
         'switch': (switch, .6), 'ding': (lambda: X.ding(.7), .55), 'drop': (lambda: coins(3), .5), 'crowd': (None, 0), 'cross': (cross, .6), 'counter': (counter, .5),
         'sparkle': (sparkle, .5), 'silenceEnd': (None, 0)}
fol = np.zeros((N, 2), np.float32)
for e in EV:
    fn, g = SOUND.get(e['type'], (None, 0))
    if fn: add(fol, np.asarray(fn(), np.float32), e['t'], g, float(rng.uniform(-.25, .25)))

# ---- ambience beds: warm room tone everywhere; kettle hiss at the stall; crowd murmur at the busy corner
amb = np.zeros((N, 2), np.float32)
room = lp(X.brown(DUR), 500) * .03; amb += np.stack([room, room], 1)
def bed(t0, t1, x, g):
    a = int(t0 * SR); n = min(len(x), int(t1 * SR) - a); b = a + n; x = x[:n]; f =np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (.4 * SR)); amb[a:b] += (np.stack([x, x * .9], 1) * f[:, None] * g).astype(np.float32)
bed(0, 8.5, bp(noise(8.5), 2500, 7000), .012); bed(54.45, 61.2, bp(noise(6.75), 2500, 7000), .010)
murmur = lp(bp(noise(6.3), 200, 900) * (1 + .5 * np.sin(2 * np.pi * 1.3 * t_(6.3))), 1200)
bed(43.3, 49.6, norm(murmur), .05)

out = voice + mus + fol * .55 + amb
a, b = int(SIL[0] * SR), int(SIL[1] * SR); out[a:b] = voice[a:b]          # the silence: everything off (no speech there either)
out = np.stack([limit(out[:, 0], .95), limit(out[:, 1], .95)], 1)
os.makedirs(os.path.join(P, 'out'), exist_ok=True)
sf.write(os.path.join(P, 'out', 'mix.wav'), out, SR)
print('mix', round(len(out) / SR, 2), 's; voice rms', round(float(vr), 4))
