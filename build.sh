#!/bin/sh
# One command: events → score → mix → subtitles → picture → master.  sh build.sh
set -e
LIB=/Users/susantalohar/lemo-opuscar
HERE=$(cd "$(dirname "$0")" && pwd)
export LIB
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920
.venv/bin/python core/audio/sampler.py --need "$HERE/music/score.py"
.venv/bin/python "$HERE/music/score.py"
.venv/bin/python "$HERE/mix.py"
node -e "const fs=require('fs');const P=process.argv[1];const L=JSON.parse(fs.readFileSync(P+'/lines.json'));const D=JSON.parse(fs.readFileSync(P+'/voice/dur.json'));const S=Object.fromEntries([...fs.readFileSync(P+'/film.js','utf8').split('export const START')[1].split('};')[0].matchAll(/(L\d\d): ([\d.]+)/g)].map(m=>[m[1],+m[2]]));fs.writeFileSync(P+'/out/cues.json',JSON.stringify(L.map(l=>({t0:S[l.id],t1:Math.max(S[l.id]+1.8,S[l.id]+D[l.id]+0.6),text:l.text}))))" "$HERE"
.venv/bin/python core/render/srt.py "$HERE/out/cues.json" "$HERE/subtitles_hi.srt"
rm -f "$HERE/out/video.mp4"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"
rm -f "$HERE/chai-kamai.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/chai-kamai.mp4" 24 0
