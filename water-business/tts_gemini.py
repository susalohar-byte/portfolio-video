# Gemini TTS voice for every scene.  GEMINI_API_KEY=... python3 tts_gemini.py [--voice Charon] [--only S03]
# One request per scene (whole paragraph = natural flow), then sentence offsets are found from the pauses.
import base64, json, os, sys, time, urllib.request, subprocess, numpy as np
H = os.path.dirname(os.path.abspath(__file__)); V = H + '/voice'; os.makedirs(V, exist_ok=True)
KEY = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
if not KEY: sys.exit('GEMINI_API_KEY is not set')
arg = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
VOICE = arg('--voice', 'Charon'); ONLY = arg('--only')
API = 'https://generativelanguage.googleapis.com/v1beta'
def req(url, body=None):
    r = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers={'x-goog-api-key': KEY, 'content-type': 'application/json'})
    return json.load(urllib.request.urlopen(r, timeout=180))
models = [m['name'] for m in req(API + '/models?pageSize=200').get('models', []) if 'tts' in m['name']]
MODEL = arg('--model') or next((m for p in ['gemini-3', 'gemini-2.5-pro', 'gemini-2.5-flash'] for m in sorted(models, reverse=True) if p in m), None)
if not MODEL: sys.exit(f'no TTS model available: {models}')
print('model', MODEL, 'voice', VOICE)
STYLE = ('Read this in Bengali (Bangla, West Bengal accent) as a warm, clear, friendly storyteller explaining a small business, '
         'at a steady natural pace, with a short pause between sentences:\n\n')
L = json.load(open(H + '/lines.json')); SR = 24000
dur = json.load(open(V + '/dur.json')) if os.path.exists(V + '/dur.json') else {'dur': {}, 'parts': {}}
for l in L:
    if ONLY and l['id'] != ONLY: continue
    text = ' '.join(l['parts'])
    for attempt in range(5):
        try:
            res = req(f'{API}/{MODEL}:generateContent', {'contents': [{'parts': [{'text': STYLE + text}]}],
                'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': VOICE}}}}})
            pcm = base64.b64decode(res['candidates'][0]['content']['parts'][0]['inlineData']['data']); break
        except Exception as e:
            print(l['id'], 'retry', attempt, e); time.sleep(20 * (attempt + 1))
    else: sys.exit('failed ' + l['id'])
    x = np.frombuffer(pcm, '<i2').astype(float) / 32768
    # trim, then find sentence boundaries: the (n-1) longest pauses, in time order
    env = np.convolve(np.abs(x), np.ones(240) / 240, 'same'); on = env > 0.01
    i0, i1 = np.argmax(on), len(on) - np.argmax(on[::-1]); x = x[max(0, i0 - 480):i1 + 2400]; on = on[max(0, i0 - 480):i1 + 2400]
    gaps = []; i = 0
    while i < len(on):
        if not on[i]:
            j = i
            while j < len(on) and not on[j]: j += 1
            if (j - i) > SR * 0.18 and i > 0 and j < len(on): gaps.append((j - i, i, j))
            i = j
        else: i += 1
    n = len(l['parts']); cut = sorted(sorted(gaps, reverse=True)[:n - 1], key=lambda g: g[1])
    offs = [0.0] + [round(g[2] / SR - 0.05, 3) for g in cut]
    if len(offs) < n:  # fall back: spread by character count
        tot = sum(len(p) for p in l['parts']); acc = 0; offs = []
        for p in l['parts']: offs.append(round(acc / tot * len(x) / SR, 3)); acc += len(p)
    wav = f"{V}/{l['id']}.wav"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-ar', '48000', wav], input=(x * 32767).astype('<i2').tobytes(), check=True)
    dur['dur'][l['id']] = round(len(x) / SR, 3); dur['parts'][l['id']] = offs
    json.dump(dur, open(V + '/dur.json', 'w'), indent=1, ensure_ascii=False)
    print(l['id'], dur['dur'][l['id']], offs); time.sleep(3)
print('total', round(sum(dur['dur'].values()), 1), 's')
