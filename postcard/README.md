# কলকাতা থেকে চিঠি — ডিজিটাল পোস্টকার্ড (টেস্ট)

**v2 (`kolkata-postcard-v2.mp4`, `film2.js`, `index2.html`)**: রেফারেন্স Instagram পোস্টের "Digital Postcard" স্টাইল — দানাদার ক্রিম কাগজ, ফ্ল্যাট জ্যামিতিক শেপ (বৃত্ত, অর্ধবৃত্ত, আয়তক্ষেত্র), সরু কনস্ট্রাকশন লাইন, কোণে মনো লেবেল, রঙের বিন্দু। প্রতিটা দৃশ্য অ্যানিমেটেড: লাইন আঁকা হয়, শেপগুলো জুড়ে দৃশ্য গড়ে ওঠে, ট্রাম চলে, নৌকা ভাসে, ধোঁয়া ওঠে। রেন্ডার: `node render.mjs --page index2.html --out out/video2.mp4`, তারপর `python3 mix.py`।

**v1** নিচে বর্ণিত (ডেস্কের উপর পোস্টকার্ড)।

৬১ সেকেন্ডের ভার্টিকাল ভিডিও (1080×1920, 9:16, 24 fps), বাংলা ভয়েসওভার সহ, ভিনটেজ "ডিজিটাল পোস্টকার্ড" স্টাইলে। পুরোটা কোড দিয়ে বানানো: canvas ইলাস্ট্রেশন, সিন্থেসাইজ করা মিউজিক আর সাউন্ড ইফেক্ট।

- ফাইনাল: `kolkata-postcard.mp4`
- গঠন: খোলা চিঠি → পাঁচটা পোস্টকার্ড (হাওড়া ব্রিজ, ট্রাম, ভিক্টোরিয়া মেমোরিয়াল, কলেজ স্ট্রিট, মাটির ভাঁড়ে চা) → শেষ চিঠি + কমেন্টে CTA
- প্রতিটা কার্ড ডেস্কে স্লাইড করে এসে আগের কার্ডের স্তূপের উপর পড়ে। ডাকটিকিট আর পোস্টমার্ক পড়ে, ভয়েসের সাথে তাল মিলিয়ে হাতের লেখা ফুটে ওঠে (এটাই সাবটাইটেলের কাজ করে)।

## আবার বানাতে

Node 20+, Playwright (Chromium), ffmpeg, Python 3 + numpy লাগবে।

```sh
python3 tts.py                     # voice/ (Google Translate bn TTS)
node render.mjs --still 5,20       # শুধু কয়েকটা ফ্রেম out/ এ
python3 mix.py                     # out/mix.wav (events.json আগে render.mjs দিয়ে তৈরি হতে হবে)
node render.mjs --out out/video.mp4
ffmpeg -i out/video.mp4 -i out/mix.wav -c:v copy -c:a aac -b:a 192k -shortest kolkata-postcard.mp4
```

`index.html` ব্রাউজারে খুললে লাইভ প্রিভিউ চলে (সাইলেন্ট)।

## কোথায় কী বদলাবেন

| কী | ফাইল |
|---|---|
| ভয়েসের লাইন / কার্ডের লেখা | `lines.json` (তারপর `voice/` মুছে `tts.py` আবার চালান) |
| লাইনের শুরুর সময়, কার্ডের শিরোনাম, রঙ | `film.js` (`START`, `CARDS`, `P`) |
| ইলাস্ট্রেশন | `film.js` → `artBridge`, `artTram`, `artVictoria`, `artBooks`, `artChai` |
| মিউজিক, সাউন্ড ইফেক্ট, লেভেল | `mix.py` |

ফন্ট: Galada, Tiro Bangla, Hind Siliguri (সব SIL OFL, `fonts/` এ)।
