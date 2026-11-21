// Render every frame in headless Chromium and pipe JPEGs to ffmpeg.  node render.mjs [--from s --to s --still t]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'http'; import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process';
const HERE = path.dirname(new URL(import.meta.url).pathname);
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(HERE, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); } }); }).listen(0);
const port = srv.address().port;
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 400, height: 700 } });
page.on('console', m => console.log('[page]', m.text())); page.on('pageerror', e => console.error('[pageerror]', e));
await page.goto(`http://localhost:${port}/${arg('--page') ?? 'index.html'}`); await page.waitForFunction('window.READY', null, { timeout: 30000 });
const META = await page.evaluate('window.META');
fs.mkdirSync(HERE + '/out', { recursive: true }); fs.writeFileSync(HERE + '/out/events.json', JSON.stringify(META.events, null, 1)); fs.writeFileSync(HERE + '/out/meta.json', JSON.stringify({ DURATION: META.DURATION, voice: META.voice, vdir: META.vdir }, null, 1)); console.log('duration', META.DURATION);
const grab = async t => Buffer.from((await page.evaluate(t => window.frame(t), t)).split(',')[1], 'base64');
if (arg('--still')) {
  for (const s of (arg('--still') === 'auto' ? META.voice.map(v => (v.t + 4).toFixed(1)) : arg('--still').split(','))) fs.writeFileSync(`${HERE}/out/still_${s}.jpg`, await grab(+s));
} else {
  const fps = META.FPS, t0 = +(arg('--from') ?? 0), t1 = +(arg('--to') ?? META.DURATION), out = arg('--out') ?? HERE + '/out/video.mp4';
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((t1 - t0) * fps);
  for (let i = 0; i < n; i++) { const b = await grab(t0 + i / fps); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 120 === 0) console.log(`frame ${i}/${n}`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close(); srv.close();
