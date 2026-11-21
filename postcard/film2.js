// "কলকাতা থেকে চিঠি" v2 — geometric "digital postcard" style (flat Bauhaus shapes on grainy paper,
// construction lines, mono corner labels, colour-swatch dots), animated like a film.
// 1080×1920, 24 fps. draw(g, t) is pure.
export const W = 1080, H = 1920, FPS = 24, DURATION = 61.0;
export const START = { L1: 0.7, L2: 9.7, L3: 17.4, L4: 25.6, L5: 33.7, L6: 42.5, L7: 50.4 };
let DUR = {}, PARTS = {}, LINES = {};
export function setup(lines, dur) { for (const l of lines) LINES[l.id] = l.parts; DUR = dur.dur; PARTS = dur.parts; }

// ---------------------------------------------------------------- palette, fonts, easing
const C = {
  paper: '#ECE5D8', ink: '#1F1D1B', orange: '#E05A2B', mustard: '#E3A232', blue: '#2E5A78', teal: '#3C7D78',
  red: '#C23B2E', green: '#56794A', pink: '#E7B49B', cream: '#F7F2E8', marble: '#DCD4C4', shade: '#B9AE99',
  terra: '#B0502F', gray: '#8C877E', line: 'rgba(31,29,27,0.38)',
};
const F = { mono: (px, w = 500) => `${w} ${px}px Plex`, bn: (px, w = 600) => `${w} ${px}px Hind` };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const eo = u => 1 - Math.pow(1 - clamp(u), 3);
const eio = u => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
const back = (u, s = 1.6) => { u = clamp(u) - 1; return u * u * ((s + 1) * u + s) + 1; };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- scenes + timing
const SC = [
  { id: 'L1', a: 0, art: artIntro, title: 'কলকাতা থেকে চিঠি', tl: ['LETTERS FROM', 'KOLKATA', '/ 00'], br: ['VOL. 01', 'K_POST'], dots: [C.orange, C.mustard, C.blue, C.ink] },
  { id: 'L2', art: artBridge, title: 'হাওড়া ব্রিজ', tl: ['HOWRAH', 'BRIDGE', '/ 01'], br: ['EST. 1943', 'K_POST'], dots: [C.orange, C.mustard, C.blue, C.ink] },
  { id: 'L3', art: artTram, title: 'ট্রাম', tl: ['CITY', 'TRAMWAY', '/ 02'], br: ['EST. 1873', 'K_POST'], dots: [C.blue, C.red, C.mustard, C.ink] },
  { id: 'L4', art: artVictoria, title: 'ভিক্টোরিয়া মেমোরিয়াল', tl: ['VICTORIA', 'MEMORIAL', '/ 03'], br: ['EST. 1921', 'K_POST'], dots: [C.marble, C.orange, C.teal, C.ink] },
  { id: 'L5', art: artBooks, title: 'কলেজ স্ট্রিট', tl: ['COLLEGE', 'STREET', '/ 04'], br: ['BOI PARA', 'K_POST'], dots: [C.red, C.mustard, C.blue, C.green] },
  { id: 'L6', art: artChai, title: 'মাটির ভাঁড়ে চা', tl: ['CHAI AT', 'THE GHAT', '/ 05'], br: ['MATIR BHAAR', 'K_POST'], dots: [C.terra, C.orange, C.blue, C.ink] },
  { id: 'L7', art: artOutro, title: 'ইতি, তোমার কলকাতা', tl: ['WITH LOVE', 'KOLKATA', '/ 06'], br: ['WRITE BACK', 'K_POST'], dots: [C.orange, C.mustard, C.blue, C.red] },
];
SC.forEach((s, i) => { s.a = i ? START[s.id] - 0.5 : 0; });
SC.forEach((s, i) => { s.b = i + 1 < SC.length ? SC[i + 1].a : DURATION; });
const EXIT = 0.6;

// visibility of an element with entry delay d (s) inside scene sc at scene-time lt
function makeV(sc, lt, last) {
  const len = sc.b - sc.a;
  return (d, dur = 0.55) => {
    const inU = clamp((lt - d) / dur);
    if (last) return inU;
    const ex = clamp((lt - (len - EXIT) - Math.min(d, 3) * 0.06) / 0.34);
    return inU * (1 - eio(ex));
  };
}
// draw fn with a pop transform around a pivot
function pop(g, v, px, py, fn, mode = 's') {
  if (v <= 0.001) return;
  g.save(); g.translate(px, py);
  if (mode === 's') { const k = back(v, 1.5); g.scale(k, k); }
  else if (mode === 'y') g.scale(1, eo(v));
  else if (mode === 'x') g.scale(eo(v), 1);
  else if (mode === 'up') { g.translate(0, (1 - eo(v)) * 120); }
  else if (mode === 'drop') { g.translate(0, -(1 - back(v, 1.2)) * 900); }
  g.translate(-px, -py); fn(); g.restore();
}
// shapes
const circ = (g, x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
const half = (g, x, y, r, c, a0 = Math.PI, a1 = TAU) => { g.fillStyle = c; g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, a0, a1); g.closePath(); g.fill(); };
const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const poly = (g, pts, c) => { g.fillStyle = c; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fill(); };
const arch = (g, x, y, w, h, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); g.fill(); };
// construction lines (thin, drawn on)
function cLine(g, x1, y1, x2, y2, u) { if (u <= 0) return; g.strokeStyle = C.line; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x1, y1); g.lineTo(lerp(x1, x2, eo(u)), lerp(y1, y2, eo(u))); g.stroke(); }
function cArc(g, x, y, r, a0, a1, u) { if (u <= 0) return; g.strokeStyle = C.line; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, r, a0, lerp(a0, a1, eo(u))); g.stroke(); }
function cross(g, x, y, u, s = 16) { if (u <= 0) return; g.strokeStyle = C.ink; g.globalAlpha = clamp(u); g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x, y - s); g.lineTo(x, y + s); g.stroke(); g.globalAlpha = 1; }

// ---------------------------------------------------------------- textures
let GRAIN, SPECK, PAPER, LAYER;
function textures() {
  if (PAPER) return;
  const mk = (w, h) => { const c = new OffscreenCanvas(w, h); return [c, c.getContext('2d')]; };
  let c, x;
  [GRAIN, x] = mk(512, 512); { const im = x.createImageData(512, 512), R = rng(7); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (R() - 0.5) * 110; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); }
  [SPECK, x] = mk(512, 512); { const R = rng(11); for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(0,0,0,${0.25 + R() * 0.7})`; x.beginPath(); x.arc(R() * 512, R() * 512, 0.6 + R() * 1.8, 0, TAU); x.fill(); } }
  [PAPER, x] = mk(W, H); {
    x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
    const R = rng(3);
    for (let i = 0; i < 90; i++) { const gx = R() * W, gy = R() * H, r = 80 + R() * 260; const gr = x.createRadialGradient(gx, gy, 0, gx, gy, r); const a = (R() - 0.5) * 0.06; gr.addColorStop(0, a > 0 ? `rgba(255,252,245,${a})` : `rgba(150,130,100,${-a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(gx - r, gy - r, 2 * r, 2 * r); }
    x.globalAlpha = 0.07; x.strokeStyle = '#6B5B45';
    for (let i = 0; i < 500; i++) { const fx = R() * W, fy = R() * H, a = R() * TAU, L = 6 + R() * 20; x.lineWidth = 0.6 + R(); x.beginPath(); x.moveTo(fx, fy); x.lineTo(fx + Math.cos(a) * L, fy + Math.sin(a) * L); x.stroke(); }
    x.globalAlpha = 1;
  }
  [LAYER] = mk(W, H);
}

// ---------------------------------------------------------------- art (full-frame coordinates; art area ≈ y 380..1380)
function artIntro(g, lt, V) {
  const cx = 540, cy = 860;
  cArc(g, cx, cy, 400, -Math.PI / 2, Math.PI * 1.5, V(0, 1.2));
  cLine(g, 80, cy + 210, 1000, cy + 210, V(0.15, 1));
  cLine(g, cx, 380, cx, 1330, V(0.25, 1));
  cross(g, 110, cy, V(0.3)); cross(g, 970, cy - 300, V(0.35));
  // sun behind
  pop(g, V(0.35), 760, 600, () => circ(g, 760, 600, 130, C.orange));
  // envelope
  const ew = 640, eh = 420, ex = cx - ew / 2, ey = cy - eh / 2 + 30;
  // letter rises out of the envelope during "অনেক দিন..."
  const rise = eo((lt - 2.2) / 1.4) * 260;
  const fl = 1 - 2 * eio((lt - 1.4) / 0.7);
  const flap = () => { if (V(0.6) > 0.01) { g.save(); g.translate(0, ey); g.scale(1, fl * V(0.6)); poly(g, [[ex, 0], [cx, eh * 0.55], [ex + ew, 0]], fl > 0 ? '#1F3F55' : C.mustard); g.restore(); } };
  if (fl < 0) flap();
  pop(g, V(0.6), cx, ey + eh, () => {
    rect(g, ex, ey, ew, eh, C.blue);
    g.save(); g.beginPath(); g.rect(ex - 20, 300, ew + 40, ey + eh * 0.55 - 300 + 260); g.clip();
    rect(g, ex + 50, ey + 40 - rise, ew - 100, eh - 60, C.cream);
    g.fillStyle = C.ink; for (let i = 0; i < 5; i++) rect(g, ex + 90, ey + 90 - rise + i * 46, (i === 4 ? 200 : ew - 180) * clamp((lt - 2.8 - i * 0.25) / 0.5), 8, C.ink);
    circ(g, ex + ew - 130, ey + 110 - rise, 34, C.orange);
    g.restore();
    poly(g, [[ex, ey + eh], [cx, ey + eh * 0.52], [ex + ew, ey + eh]], '#244A63');
    poly(g, [[ex, ey], [cx, ey + eh * 0.55], [ex + ew, ey]], '#3B6C8C');
  }, 'y');
  if (fl >= 0) flap();
  // the five postcards: five coloured blocks fanned out on "পাঁচটা পোস্টকার্ড"
  const p5 = START.L1 + PARTS.L1[2];
  const cols = [C.orange, C.blue, C.marble, C.red, C.terra];
  cols.forEach((c, i) => pop(g, V(p5 - SC[0].a + 0.9 + i * 0.16, 0.5), 220 + i * 160, 1290, () => {
    g.save(); g.translate(220 + i * 160, 1290); g.rotate((i - 2) * 0.08); rect(g, -60, -80, 120, 160, c); rect(g, -44, -64, 88, 70, C.cream); circ(g, 30, 50, 12, C.ink); g.restore();
  }, 'up'));
}

function artBridge(g, lt, V) {
  const deck = 900, t1 = 360, t2 = 720, top = 470;
  cArc(g, 540, 880, 420, Math.PI, TAU, V(0, 1.1));
  cLine(g, 70, deck, 1010, deck, V(0.1, 0.9)); cLine(g, t1, 380, t1, 1320, V(0.2, 0.9)); cLine(g, t2, 380, t2, 1320, V(0.25, 0.9));
  cross(g, 100, 640, V(0.3)); cross(g, 980, 1240, V(0.4));
  // sun
  pop(g, V(0.35), 780, 620, () => circ(g, 780, 620 + Math.sin(lt * 0.5) * 6, 150, C.orange));
  // river: stripes slide in
  for (let i = 0; i < 7; i++) {
    const y = 935 + i * 52, w = [920, 860, 900, 760, 840, 700, 780][i], x0 = 540 - w / 2 + (i % 2 ? 30 : -30);
    pop(g, V(0.5 + i * 0.07, 0.6), x0, y, () => {
      rect(g, x0, y, w, 30, i % 3 === 2 ? '#24485F' : C.blue);
      g.fillStyle = 'rgba(247,242,232,0.7)';
      for (let k = 0; k < 3; k++) { const dx = ((k * 290 + lt * (40 + i * 9)) % (w - 60)); g.fillRect(x0 + dx, y + 12, 44, 5); }
    }, 'x');
  }
  // sun glints on water
  for (let i = 0; i < 4; i++) pop(g, V(1.3 + i * 0.08), 780, 960 + i * 52, () => rect(g, 780 - (90 - i * 18), 960 + i * 52 + 8, (90 - i * 18) * 2, 12, C.orange), 'x');
  // towers rise
  for (const tx of [t1, t2]) pop(g, V(0.7 + (tx > 500) * 0.1, 0.6), tx, deck + 40, () => { rect(g, tx - 26, top, 52, deck - top + 40, C.ink); rect(g, tx - 46, deck + 20, 92, 34, C.ink); }, 'y');
  // cantilever + anchor arms (triangles) with paper lattice
  const arms = [[t1, 120, 0.95], [t1, 520, 1.05], [t2, 560, 1.05], [t2, 960, 0.95]];
  arms.forEach(([tx, ex, d]) => pop(g, V(d, 0.55), tx, deck, () => {
    const pts = [[tx, top + 10], [ex, deck - 40], [ex, deck], [tx, deck]]; poly(g, pts, C.ink);
    g.strokeStyle = C.paper; g.lineWidth = 3; g.beginPath();
    const n = 5; for (let k = 0; k < n; k++) { const x1 = lerp(tx, ex, k / n), x2 = lerp(tx, ex, (k + 1) / n); const y1 = lerp(top + 10, deck - 40, k / n) + 14, y2 = lerp(top + 10, deck - 40, (k + 1) / n) + 14; g.moveTo(x1, y1); g.lineTo(x2, deck - 10); g.moveTo(x2, y2); g.lineTo(x1, deck - 10); }
    g.stroke();
  }, 'y'));
  // deck bar
  pop(g, V(1.2, 0.6), 540, deck, () => rect(g, 60, deck - 8, 960, 22, C.mustard), 'x');
  // boat crossing, bobbing
  const bx = lerp(140, 880, ss(1.4, 8.6, lt)), by = 1150 + Math.sin(lt * 2.2) * 6;
  pop(g, V(1.5), bx, by, () => { g.save(); g.translate(bx, by); g.rotate(Math.sin(lt * 2.2) * 0.04); half(g, 0, 0, 70, C.orange, 0, Math.PI); poly(g, [[0, -10], [0, -120], [62, -10]], C.mustard); rect(g, -3, -120, 6, 112, C.ink); g.restore(); });
  // birds as small arcs
  for (let i = 0; i < 3; i++) pop(g, V(1.8 + i * 0.1), 0, 0, () => { const x = 200 + i * 60 + lt * 18, y = 520 + i * 26; g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.arc(x - 10, y, 10, Math.PI * 1.1, Math.PI * 1.9); g.arc(x + 10, y, 10, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); });
}

function artTram(g, lt, V) {
  const road = 1110;
  cArc(g, 540, 840, 360, -Math.PI / 2, Math.PI * 1.5, V(0, 1.1));
  cLine(g, 70, road, 1010, road, V(0.1, 0.9)); cLine(g, 70, 560, 1010, 560, V(0.2, 0.9));
  cross(g, 110, 470, V(0.3)); cross(g, 970, 1250, V(0.35));
  // buildings
  const B = [[90, 640, 200, C.pink], [300, 560, 190, C.mustard], [500, 610, 230, C.terra], [740, 590, 250, C.pink]];
  B.forEach(([x, y, w, c], i) => pop(g, V(0.3 + i * 0.1, 0.6), x + w / 2, road, () => {
    rect(g, x, y, w, road - y, c);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) arch(g, x + 30 + k * (w / 2), y + 40 + r * 120, 52, 84, r === 0 && k === 1 ? C.ink : C.cream);
  }, 'y'));
  // overhead wire
  pop(g, V(0.7, 0.6), 540, 560, () => rect(g, 60, 556, 960, 5, C.ink), 'x');
  // road + rails
  pop(g, V(0.6, 0.6), 540, road, () => { rect(g, 60, road, 960, 200, C.ink); rect(g, 60, road + 62, 960, 6, C.paper); rect(g, 60, road + 120, 960, 6, C.paper); }, 'x');
  // tram drives in from the right and stops
  const mv = eio((lt - 0.8) / 3.6), x = lerp(1300, 250, mv), tw = 580, th = 300, y = road + 60 - th;
  const rot = (1300 - x) / 34;
  g.save(); g.translate(0, mv < 1 ? Math.sin(lt * 14) * 1.5 : 0);
  // pole
  g.strokeStyle = C.ink; g.lineWidth = 6; g.beginPath(); g.moveTo(x + tw * 0.62, y - 10); g.lineTo(x + tw * 0.36, 560); g.stroke();
  rect(g, x + 20, y - 26, tw - 40, 30, C.blue);
  rect(g, x, y, tw, th, C.cream);
  rect(g, x, y + th - 110, tw, 46, C.blue); rect(g, x, y + th - 64, tw, 26, C.red);
  for (let i = 0; i < 5; i++) rect(g, x + 26 + i * 110, y + 34, 84, 96, '#4F7A92');
  rect(g, x + tw - 8, y + 34, 8, th - 150, C.ink); circ(g, x + tw - 30, y + 18, 12, C.mustard);
  g.font = F.bn(30); g.fillStyle = C.cream; g.fillText('ধর্মতলা', x + 30, y + th - 76);
  for (const wx of [x + 110, x + tw - 110]) { circ(g, wx, y + th + 6, 34, C.ink); g.save(); g.translate(wx, y + th + 6); g.rotate(rot); half(g, 0, 0, 20, C.mustard, 0, Math.PI / 2); half(g, 0, 0, 20, C.mustard, Math.PI, Math.PI * 1.5); g.restore(); }
  // bell rings: concentric arcs once it has stopped
  const bt = lt - 4.0;
  if (bt > 0 && bt < 1.6 && V(0) > 0.5) for (let k = 0; k < 3; k++) { const a = clamp(1 - ((bt * 2.2 + k * 0.3) % 1.1)); g.strokeStyle = C.red; g.globalAlpha = a; g.lineWidth = 6; g.beginPath(); g.arc(x + tw + 40, y + 40, 30 + k * 26, -0.8, 0.8); g.stroke(); }
  g.globalAlpha = 1; g.restore();
}

function artVictoria(g, lt, V) {
  const cx = 540, base = 1010;
  cArc(g, cx, base - 220, 330, Math.PI, TAU, V(0, 1.1)); cLine(g, cx, 380, cx, 1330, V(0.1, 0.9)); cLine(g, 80, base, 1000, base, V(0.2, 0.9));
  cross(g, 110, 560, V(0.3)); cross(g, 970, 1260, V(0.35));
  // sun lowering through the afternoon
  pop(g, V(0.3), 250, 560, () => circ(g, 250, lerp(520, 640, ss(0, 8, lt)), 110, C.orange));
  // trees
  for (const [tx, r, d] of [[130, 90, 0.5], [210, 70, 0.6], [950, 90, 0.55], [870, 70, 0.65]]) pop(g, V(d), tx, base, () => { half(g, tx, base, r, C.green); });
  // main base with arches
  pop(g, V(0.6, 0.6), cx, base, () => {
    rect(g, cx - 330, base - 170, 660, 170, C.marble); rect(g, cx, base - 170, 330, 170, C.shade);
    for (let i = 0; i < 8; i++) arch(g, cx - 300 + i * 78, base - 130, 46, 110, i < 4 ? C.teal : '#2E615D');
  }, 'y');
  // cupolas
  for (const ox of [-290, 290]) pop(g, V(0.9 + (ox > 0) * 0.08), cx + ox, base - 170, () => { rect(g, cx + ox - 34, base - 230, 68, 60, C.marble); half(g, cx + ox, base - 230, 40, ox < 0 ? C.marble : C.shade); rect(g, cx + ox - 3, base - 300, 6, 32, C.ink); });
  // drum + dome (split light/shade like the reference)
  pop(g, V(1.0, 0.6), cx, base - 170, () => { rect(g, cx - 140, base - 280, 280, 110, C.marble); rect(g, cx, base - 280, 140, 110, C.shade); for (let i = 0; i < 6; i++) rect(g, cx - 120 + i * 44, base - 262, 16, 74, C.ink); }, 'y');
  pop(g, V(1.2, 0.6), cx, base - 280, () => { half(g, cx, base - 280, 165, C.marble, Math.PI, Math.PI * 1.5); half(g, cx, base - 280, 165, C.shade, Math.PI * 1.5, TAU); });
  // spire + angel (turns slowly)
  pop(g, V(1.45), cx, base - 445, () => { rect(g, cx - 10, base - 500, 20, 58, C.ink); g.save(); g.translate(cx, base - 520); g.scale(Math.cos(lt * 0.9), 1); poly(g, [[0, -46], [14, 0], [-14, 0]], C.ink); poly(g, [[-2, -34], [-40, -50], [-6, -18]], C.ink); circ(g, 0, -54, 9, C.ink); g.restore(); });
  // lawn + reflecting pool
  pop(g, V(0.8, 0.6), cx, base, () => rect(g, 60, base, 960, 330, C.green), 'x');
  pop(g, V(1.0, 0.6), cx, base + 40, () => {
    rect(g, cx - 260, base + 40, 520, 270, C.teal);
    g.save(); g.beginPath(); g.rect(cx - 260, base + 40, 520, 270); g.clip(); g.globalAlpha = 0.35;
    rect(g, cx - 140, base + 40, 280, 70, C.cream); half(g, cx, base + 110 + Math.sin(lt * 1.6) * 3, 165, C.cream, 0, Math.PI); g.globalAlpha = 1;
    g.fillStyle = 'rgba(247,242,232,0.6)'; for (let k = 0; k < 5; k++) g.fillRect(cx - 240 + ((k * 130 + lt * 30) % 440), base + 80 + k * 46, 60, 5);
    g.restore();
  }, 'x');
}

function artBooks(g, lt, V) {
  const vx = 540, vy = 640;
  cLine(g, vx, vy, 60, 1330, V(0, 0.9)); cLine(g, vx, vy, 1020, 1330, V(0.05, 0.9)); cArc(g, vx, 900, 300, Math.PI, TAU, V(0.1, 1));
  cross(g, 100, 470, V(0.3)); cross(g, 980, 520, V(0.35));
  // coffee house block + sign
  pop(g, V(0.3, 0.6), vx, 1000, () => {
    rect(g, vx - 190, 560, 380, 440, C.terra);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) arch(g, vx - 150 + k * 110, 700 + r * 140, 80, 110, r === 1 && k === 1 ? C.mustard : C.ink);
  }, 'y');
  pop(g, V(0.6), vx, 600, () => { rect(g, vx - 170, 570, 340, 84, C.ink); g.font = F.bn(48); g.fillStyle = C.cream; g.textAlign = 'center'; g.fillText('কফি হাউস', vx, 628); g.textAlign = 'left'; });
  // book towers drop in
  const cols = [C.red, C.mustard, C.blue, C.green, C.orange, C.ink, C.teal, C.pink];
  for (const side of [-1, 1]) {
    const R = rng(side > 0 ? 5 : 9); let y = 1310;
    for (let i = 0; i < 11; i++) {
      const h = 46 + R() * 26, w = 190 + R() * 70, x = (side < 0 ? 250 : 830) + (R() - 0.5) * 40;
      const c = cols[Math.floor(R() * cols.length)], yy = y - h;
      pop(g, V(0.5 + i * 0.17 + (side > 0) * 0.08, 0.5), x, yy, () => {
        rect(g, x - w / 2, yy, w, h, c); rect(g, x - w / 2 + 14, yy + h / 2 - 3, w * 0.4, 6, C.cream); rect(g, x + w / 2 - 34, yy + 8, 12, h - 16, 'rgba(247,242,232,0.55)');
      }, 'drop');
      y = yy - 4;
    }
  }
  // cup + steam (centre front)
  pop(g, V(1.6), vx, 1240, () => {
    rect(g, vx - 120, 1246, 240, 18, C.ink);
    g.fillStyle = C.cream; g.beginPath(); g.moveTo(vx - 80, 1120); g.lineTo(vx + 80, 1120); g.lineTo(vx + 80, 1180); g.arc(vx, 1180, 80, 0, Math.PI); g.closePath(); g.fill();
    rect(g, vx - 80, 1140, 160, 20, C.red);
    g.strokeStyle = C.cream; g.lineWidth = 16; g.beginPath(); g.arc(vx + 92, 1170, 30, -Math.PI / 2, Math.PI / 2); g.stroke();
  });
  for (let k = 0; k < 3; k++) { const ph = (lt * 0.6 + k / 3) % 1, a = Math.sin(ph * Math.PI) * V(1.9); if (a <= 0) continue; g.strokeStyle = C.gray; g.globalAlpha = a; g.lineWidth = 8; g.beginPath(); g.arc(vx + (k - 1) * 10, 1090 - ph * 140, 26, Math.PI * (k % 2 ? 0.2 : 1.2), Math.PI * (k % 2 ? 0.8 : 1.8)); g.stroke(); g.globalAlpha = 1; }
  // a loose page drifting
  pop(g, V(2.2), 0, 0, () => { g.save(); g.translate(300 + lt * 34, 480 + Math.sin(lt * 1.4) * 30); g.rotate(Math.sin(lt * 1.8) * 0.5); rect(g, -30, -22, 60, 44, C.cream); rect(g, -20, -10, 40, 4, C.ink); rect(g, -20, 2, 30, 4, C.ink); g.restore(); });
}

function artChai(g, lt, V) {
  const hz = 900, sx = 620;
  cArc(g, sx, hz, 420, Math.PI, TAU, V(0, 1.1)); cLine(g, 70, hz, 1010, hz, V(0.1, 0.9)); cLine(g, sx, 380, sx, 1330, V(0.2, 0.9));
  cross(g, 100, 560, V(0.3)); cross(g, 980, 1280, V(0.35));
  // setting sun (clipped by the horizon), sinking
  pop(g, V(0.3, 0.7), sx, hz, () => { g.save(); g.beginPath(); g.rect(0, 0, W, hz); g.clip(); circ(g, sx, hz + 10 + ss(0, 8.5, lt) * 70, 230, C.orange); circ(g, sx, hz + 10 + ss(0, 8.5, lt) * 70, 140, '#EE7B3E'); g.restore(); }, 'y');
  // river stripes + reflections
  for (let i = 0; i < 6; i++) pop(g, V(0.5 + i * 0.07), 540, hz + 20 + i * 44, () => {
    rect(g, 60 + (i % 2) * 40, hz + 14 + i * 44, 900 - (i % 3) * 60, 26, i % 2 ? '#24485F' : C.blue);
    const rw = (200 - i * 26) * (1 + Math.sin(lt * 2 + i) * 0.08); rect(g, sx - rw / 2, hz + 20 + i * 44, rw, 12, C.orange);
  }, 'x');
  // boat silhouette
  const bx = lerp(180, 330, ss(0, 8.5, lt)), by = hz + 70 + Math.sin(lt * 2) * 4;
  pop(g, V(1.0), bx, by, () => { half(g, bx, by, 64, C.ink, 0, Math.PI); rect(g, bx - 3, by - 110, 6, 110, C.ink); poly(g, [[bx + 4, by - 104], [bx + 70, by - 20], [bx + 4, by - 20]], C.mustard); });
  // ghat steps
  for (let i = 0; i < 4; i++) pop(g, V(0.7 + i * 0.1), 540, 1330, () => rect(g, 60, 1180 + i * 40 - (3 - i) * 0, 960, 40, [C.mustard, '#D89A3A', C.terra, '#8E4227'][i]), 'x');
  // bhaar — tapered clay cup, split shading
  const cx = 540, top = 1040, bot = 1200;
  pop(g, V(1.3, 0.6), cx, bot, () => {
    poly(g, [[cx - 120, top], [cx, top], [cx, bot], [cx - 84, bot]], C.terra);
    poly(g, [[cx, top], [cx + 120, top], [cx + 84, bot], [cx, bot]], '#8E4227');
    g.fillStyle = '#7A3A22'; g.beginPath(); g.ellipse(cx, top, 120, 24, 0, 0, TAU); g.fill();
    g.fillStyle = '#C99A62'; g.beginPath(); g.ellipse(cx, top + 4, 100, 16, 0, 0, TAU); g.fill();
  }, 'up');
  // steam: stacked arcs rising
  for (let k = 0; k < 4; k++) { const ph = (lt * 0.5 + k / 4) % 1, a = Math.sin(ph * Math.PI) * V(1.8); if (a <= 0) continue; g.strokeStyle = C.cream; g.globalAlpha = a; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.arc(cx + (k % 2 ? 14 : -14), top - 40 - ph * 200, 30, Math.PI * (k % 2 ? 0.15 : 1.15), Math.PI * (k % 2 ? 0.85 : 1.85)); g.stroke(); g.globalAlpha = 1; }
  // birds
  for (let i = 0; i < 3; i++) pop(g, V(1.6 + i * 0.1), 0, 0, () => { const x = 760 + i * 50 - lt * 14, y = 520 + i * 22; g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.arc(x - 9, y, 9, Math.PI * 1.1, Math.PI * 1.9); g.arc(x + 9, y, 9, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); });
}

function artOutro(g, lt, V) {
  cArc(g, 540, 860, 420, -Math.PI / 2, Math.PI * 1.5, V(0, 1.2)); cLine(g, 540, 380, 540, 1330, V(0.1, 0.9));
  cross(g, 110, 520, V(0.3)); cross(g, 970, 1250, V(0.35));
  // the five scenes as square tiles, each a live miniature of its scene
  const pos = [[250, 560], [540, 560], [830, 560], [395, 860], [685, 860]];
  SC.slice(1, 6).forEach((s, i) => {
    const [x, y] = pos[i], sz = 250;
    pop(g, V(0.4 + i * 0.18, 0.6), x, y, () => {
      g.save(); g.translate(x, y); g.rotate((i - 2) * 0.03);
      rect(g, -sz / 2 - 10, -sz / 2 - 10, sz + 20, sz + 20, C.cream);
      g.beginPath(); g.rect(-sz / 2, -sz / 2, sz, sz); g.clip(); rect(g, -sz / 2, -sz / 2, sz, sz, C.paper);
      g.scale(sz / 980, sz / 980); g.translate(-540, -850);
      s.art(g, 20 + lt, () => 1);
      g.restore();
      g.font = F.mono(18); g.fillStyle = C.ink; g.fillText(`/ 0${i + 1}`, x - sz / 2, y + sz / 2 + 34);
    });
  });
  // big circle stamp: "লিখো"
  const cta = START.L7 + PARTS.L7[2] - SC[6].a;
  pop(g, V(cta + 0.2, 0.6), 540, 1190, () => {
    circ(g, 540, 1190, 120, C.orange);
    g.strokeStyle = C.cream; g.lineWidth = 3; g.beginPath(); g.arc(540, 1190, 102, 0, TAU); g.stroke();
    g.font = F.bn(52, 700); g.fillStyle = C.cream; g.textAlign = 'center'; g.fillText('লিখো', 540, 1192); g.font = F.mono(20); g.fillText('WRITE BACK', 540, 1232); g.textAlign = 'left';
  });
}

// ---------------------------------------------------------------- frame furniture (labels, dots, captions)
function labels(g, sc, lt, V) {
  const a = V(0.1, 0.5);
  g.globalAlpha = a; g.fillStyle = C.ink; g.font = F.mono(24);
  sc.tl.forEach((s, i) => g.fillText(s, 70, 110 + i * 34));
  rect(g, 70, 222, 40 * a, 2, C.ink);
  g.textAlign = 'right'; sc.br.forEach((s, i) => g.fillText(s, 1010, 1790 + i * 34)); rect(g, 1010 - 40 * a, 1850, 40 * a, 2, C.ink); g.textAlign = 'left';
  g.fillText('22.57° N', 70, 1790); g.fillText('88.36° E', 70, 1824); rect(g, 70, 1850, 40 * a, 2, C.ink);
  g.globalAlpha = 1;
  sc.dots.forEach((c, i) => pop(g, V(0.3 + i * 0.08, 0.4), 1000, 100 + i * 44, () => circ(g, 1000, 100 + i * 44, 13, c)));
}
function wrap(g, txt, maxW) { const out = []; let cur = ''; for (const w of txt.split(' ')) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; }
function captions(g, sc, t, V) {
  // title
  const tv = V(0.4, 0.6);
  if (tv > 0) { g.save(); g.globalAlpha = clamp(tv * 2); g.font = F.bn(sc.title.length > 14 ? 62 : 72, 700); g.fillStyle = C.ink; g.fillText(sc.title, 70, 1488 + (1 - eo(tv)) * 30); g.restore(); }
  // current sentence
  const id = sc.id, offs = PARTS[id]; if (!offs) return;
  let k = -1; offs.forEach((o, i) => { if (t >= START[id] + o - 0.15) k = i; });
  if (k < 0) return;
  const t0 = START[id] + offs[k] - 0.15, ap = eo((t - t0) / 0.35);
  const vis = Math.min(ap, V(0, 0.01));
  g.save(); g.globalAlpha = vis; g.font = F.bn(42, 500); g.fillStyle = '#3A3631';
  wrap(g, LINES[id][k], 940).slice(0, 2).forEach((l, i) => g.fillText(l, 70, 1572 + i * 58 + (1 - ap) * 14));
  g.restore();
}

// ---------------------------------------------------------------- frame
export function draw(g, t) {
  textures();
  g.drawImage(PAPER, 0, 0);
  const L = LAYER.getContext('2d'); L.clearRect(0, 0, W, H);
  // draw current scene, plus the next one starting while this exits
  let si = 0; SC.forEach((s, i) => { if (t >= s.a) si = i; });
  const sc = SC[si], lt = t - sc.a, last = si === SC.length - 1, V = makeV(sc, lt, last);
  // slow camera push on the art
  L.save(); const z = 1 + 0.035 * ss(0, sc.b - sc.a, lt); L.translate(540, 860); L.scale(z, z); L.translate(-540, -860);
  sc.art(L, lt, V); L.restore();
  // riso print texture: knock speckles out of the ink layer
  L.save(); L.globalCompositeOperation = 'destination-out'; L.globalAlpha = 0.55; const sp = L.createPattern(SPECK, 'repeat'); sp.setTransform(new DOMMatrix().translate((si * 97) % 512, (si * 61) % 512)); L.fillStyle = sp; L.fillRect(0, 0, W, H); L.restore();
  g.drawImage(LAYER, 0, 0);
  labels(g, sc, lt, V); captions(g, sc, t, V);
  // paper grain over everything (moving slightly = film feel)
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.11;
  const gp = g.createPattern(GRAIN, 'repeat'); gp.setTransform(new DOMMatrix().translate(-Math.floor((t * 24 * 37) % 512), -Math.floor((t * 24 * 53) % 512))); g.fillStyle = gp; g.fillRect(0, 0, W, H); g.restore();
  // fade in/out
  const fade = Math.max(1 - ss(0, 0.45, t), ss(DURATION - 0.8, DURATION, t));
  if (fade > 0) { g.fillStyle = `rgba(236,229,216,${fade})`; g.fillRect(0, 0, W, H); }
}

// sound events for the mixer
export function events() {
  const ev = [];
  SC.forEach((s, i) => { ev.push({ t: s.a + 0.05, k: 'whoosh' }); [0.35, 0.6, 0.7, 0.95, 1.2].forEach(d => ev.push({ t: s.a + d + 0.12, k: 'tick' })); });
  ev.push({ t: SC[2].a + 4.0, k: 'bell' }, { t: SC[2].a + 4.45, k: 'bell' });
  ev.push({ t: SC[0].a + 1.4, k: 'stamp' });
  const p5 = START.L1 + PARTS.L1[2] + 0.9; for (let i = 0; i < 5; i++) ev.push({ t: p5 + i * 0.16 + 0.15, k: 'tick' });
  for (let i = 0; i < 11; i++) { ev.push({ t: SC[4].a + 0.5 + i * 0.17 + 0.45, k: 'tick' }); }
  ev.push({ t: START.L7 + PARTS.L7[2] + 0.35, k: 'stamp' });
  return ev.sort((a, b) => a.t - b.t);
}
