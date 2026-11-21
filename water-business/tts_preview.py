# Free preview voice (Google Translate bn) so timing can be built before the Gemini key exists. Same outputs as tts_gemini.py.
import json, subprocess, urllib.parse, urllib.request, os
H = os.path.dirname(os.path.abspath(__file__)); V = H + '/voice/preview'; os.makedirs(V, exist_ok=True)
L = json.load(open(H + '/lines.json')); out = {'dur': {}, 'parts': {}}
def chunks(p, n=190):
    if len(p) <= n: return [p]
    w = p.split(' '); a, cur = [], ''
    for x in w:
        if len(cur) + len(x) + 1 > n: a.append(cur); cur = x
        else: cur = (cur + ' ' + x).strip()
    return a + [cur]
for l in L:
    segs, offs, t = [], [], 0.0
    for i, p in enumerate(l['parts']):
        offs.append(round(t, 3))
        for j, c in enumerate(chunks(p)):
            f = f"{V}/{l['id']}_{i}_{j}.mp3"
            if not os.path.exists(f):
                q = urllib.parse.urlencode({'ie': 'UTF-8', 'tl': 'bn', 'client': 'gtx', 'q': c})
                open(f, 'wb').write(urllib.request.urlopen('https://translate.googleapis.com/translate_tts?' + q, timeout=30).read())
            w = f[:-4] + '.wav'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo=1.12,aresample=48000', '-ac', '1', w], check=True)
            d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', w]))
            segs.append((w, 0.32 if j == len(chunks(p)) - 1 else 0.08)); t += d + segs[-1][1]
    flt = ';'.join(f'[{k}]apad=pad_dur={g}[a{k}]' for k, (w, g) in enumerate(segs)) + ';' + ''.join(f'[a{k}]' for k in range(len(segs))) + f'concat=n={len(segs)}:v=0:a=1'
    cmd = ['ffmpeg', '-v', 'error', '-y'] + sum([['-i', w] for w, g in segs], []) + ['-filter_complex', flt, f"{V}/{l['id']}.wav"]
    subprocess.run(cmd, check=True)
    out['dur'][l['id']] = round(t - 0.32, 3); out['parts'][l['id']] = offs
    print(l['id'], out['dur'][l['id']])
json.dump(out, open(V + '/dur.json', 'w'), indent=1)
print('total', round(sum(out['dur'].values()), 1))
