# कितना कमाते हैं एक चायवाले? (Chai Kamai)

A 63-second vertical (1080×1920, 24 fps) Hindi explainer in the **Mid-century Cartoon** style, made entirely in code with the [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar) library.

- Final film: `chai-kamai.mp4` · poster: `poster.jpg` · subtitles: `subtitles_hi.srt` (also burned in)
- Plan: `TREATMENT.md` · number sources: `FACTS.md` (illustrative estimate, not a real stall's accounts) · licences: `CREDITS`

## Rebuild

Needs Node 20+, ffmpeg 7+, Python 3.11+ and the Lemo-Opuscar library with its core and voice packages installed. Set `LIB` in `build.sh` to your library path, then:

```sh
sh build.sh
```

It exports events, renders the score and mix, writes subtitles, renders every frame and masters `chai-kamai.mp4` to −14 LUFS.

## Where to change things

| What | File |
|---|---|
| Voice lines (text + spoken form) | `lines.json` → regenerate voice with `core/tts/tts_zh.py --voice hi-IN-MadhurNeural` |
| Line start times, word anchors, scenes, captions | `film.js` (`START`, `A`, scene functions `S1`…`S10`) |
| The chaiwala and the chai glass | `engine/chaiwala.js` |
| Music | `music/score.py` |
| Sound effects, ambience, mix levels | `mix.py` |
