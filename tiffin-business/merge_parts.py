# Join voice-over parts into one take (1 s gap), optionally speed it up, and merge their word-timed transcripts.
#   python3 merge_parts.py out.wav out_words.json TEMPO part1.wav words1.json part2.wav words2.json …
import json, subprocess, sys
out_wav, out_words, tempo = sys.argv[1], sys.argv[2], float(sys.argv[3])
pairs = list(zip(sys.argv[4::2], sys.argv[5::2]))
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
W, off, ins, flt = [], 0.0, [], ''
for i, (wav, wj) in enumerate(pairs):
    for w in json.load(open(wj)): W.append({'w': w['w'], 's': round((w['s'] + off) / tempo, 3), 'e': round((w['e'] + off) / tempo, 3)})
    ins += ['-i', wav]; flt += f'[{i}]aresample=48000,aformat=channel_layouts=mono,apad=pad_dur={1.0 if i < len(pairs) - 1 else 0}[a{i}];'
    off += dur(wav) + (1.0 if i < len(pairs) - 1 else 0)
flt += ''.join(f'[a{i}]' for i in range(len(pairs))) + f'concat=n={len(pairs)}:v=0:a=1,atempo={tempo}'
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', flt, out_wav], check=True)
json.dump(sorted(W, key=lambda w: w['s']), open(out_words, 'w'), ensure_ascii=False)
print('joined', round(off / tempo, 1), 's at tempo', tempo)
