# রাহুলের জলের ব্যবসা — packaged drinking water business story

~৫ মিনিটের ভার্টিকাল ভিডিও (1080×1920, 24 fps), বাংলা ভয়েসওভার, "digital postcard" জ্যামিতিক স্টাইলে (দানাদার কাগজ, ফ্ল্যাট শেপ, কনস্ট্রাকশন লাইন, মনো লেবেল)। ১৬টা অধ্যায়: শুরু → সমস্যা → খোঁজখবর → লাইসেন্স → বিনিয়োগ → টাকার জোগাড় → প্ল্যান্ট → প্রথম মাস → ভরসা → জার ও বাকি → লোডশেডিং → বেড়ে ওঠা → মাসের হিসেব → গরম/শীত → এক বছর পরে → CTA।

সংখ্যা ও উৎস: `FACTS.md` (অনুমানভিত্তিক উদাহরণ)।

## Build

Music + SFX: `./fetch_audio.sh` (Mixkit, free licence; not committed). One motivational track (Driving Ambition) at ~3 % under the voice; soft page-turn on scene changes, coin chime on the two totals.

```sh
GEMINI_API_KEY=... python3 tts_gemini.py          # voice/S01..S16.wav + voice/dur.json (Gemini TTS, voice "Charon")
node render.mjs --still x                          # writes out/meta.json + out/events.json
python3 mix.py                                     # out/mix.wav (score + sfx + voice, −14 LUFS)
node render.mjs --out out/video.mp4                # all frames
ffmpeg -i out/video.mp4 -i out/mix.wav -c:v libx264 -b:v 4000k -c:a aac -b:a 192k -shortest jal-byabsa.mp4
```
Preview without Gemini: `python3 tts_preview.py`, then add `--page "index.html?voice=preview"` to the render commands.

| কী বদলাবেন | ফাইল |
|---|---|
| স্ক্রিপ্ট, অধ্যায়ের নাম | `lines.json` |
| দৃশ্য, চরিত্র, রঙ | `film.js` (`ART.S01`…`ART.S16`, `person()`, `C`) |
| ভয়েস / মডেল | `tts_gemini.py --voice Kore --model ...` |
| মিউজিক, সাউন্ড | `mix.py` |
