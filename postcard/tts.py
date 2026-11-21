# Google Translate TTS (bn) per sentence -> trimmed, slightly faster, joined with short gaps.
import json, subprocess, urllib.parse, urllib.request, os, sys
H = os.path.dirname(os.path.abspath(__file__)); V = H + '/voice'
L = json.load(open(H + '/lines.json')); durs = {}; parts_t = {}
for l in L:
    segs = []
    for i, p in enumerate(l['parts']):
        f = f"{V}/{l['id']}_{i}.mp3"
        if not os.path.exists(f):
            q = urllib.parse.urlencode({'ie': 'UTF-8', 'tl': 'bn', 'client': 'gtx', 'q': p})
            open(f, 'wb').write(urllib.request.urlopen('https://translate.googleapis.com/translate_tts?' + q, timeout=20).read())
        w = f"{V}/{l['id']}_{i}.wav"
        # trim silence both ends, tempo 1.06, mono 48k
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-af',
            'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo=1.06,aresample=48000',
            '-ac', '1', w], check=True)
        segs.append(w)
    # join with 0.28 s gaps
    gap = f"{V}/gap.wav"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', '0.28', gap], check=True)
    seq = []; offs = []; t = 0
    for i, s in enumerate(segs):
        d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', s]))
        offs.append(round(t, 3)); t += d
        seq.append(s)
        if i < len(segs) - 1: seq.append(gap); t += 0.28
    lst = f"{V}/list.txt"; open(lst, 'w').write(''.join(f"file '{s}'\n" for s in seq))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c:a', 'pcm_s16le', f"{V}/{l['id']}.wav"], check=True)
    durs[l['id']] = round(t, 3); parts_t[l['id']] = offs
json.dump({'dur': durs, 'parts': parts_t}, open(V + '/dur.json', 'w'), indent=1)
print(durs, sum(durs.values()))
