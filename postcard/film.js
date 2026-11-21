// "কলকাতা থেকে চিঠি" — vintage digital postcard film, 1080×1920, 24 fps.
// draw(g, t) is pure: the same t always gives the same frame.
export const W = 1080, H = 1920, FPS = 24, DURATION = 61.0;

// voice line starts (s); durations + sentence offsets come from voice/dur.json
export const START = { L1: 0.7, L2: 9.7, L3: 17.4, L4: 25.6, L5: 33.7, L6: 42.5, L7: 50.4 };
let DUR = {}, PARTS = {}, LINES = {};
export function setup(lines, dur) {
  for (const l of lines) LINES[l.id] = l.parts;
  DUR = dur.dur; PARTS = dur.parts;
}

// ------------------------------------------------------------------ palette + fonts
const P = {
  desk: '#C9B79A', deskD: '#A8936F', paper: '#F5ECDC', paperD: '#E8DAC0', ink: '#2A2733', inkS: '#4A4452',
  teal: '#2E6E73', tealD: '#1F4E52', terra: '#C4553B', terraD: '#953C2A', mustard: '#E2A634', pink: '#F0C3AE',
  sky: '#F6D9B8', cream: '#FBF4E6', blue: '#3E5C8A', green: '#6E8B4E', postmark: 'rgba(48,52,92,0.78)',
};
const F = {
  title: px => `${px}px Galada`, hand: px => `${px}px Tiro`, sans: (px, w = 600) => `${w} ${px}px Hind`,
};
const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// ------------------------------------------------------------------ easing / helpers
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const eo = u => 1 - Math.pow(1 - clamp(u), 3);
const back = (u, s = 1.7) => { u = clamp(u) - 1; return u * u * ((s + 1) * u + s) + 1; };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

// ------------------------------------------------------------------ textures (built once)
let GRAIN = null, DESK = null;
function textures() {
  if (GRAIN) return;
  GRAIN = new OffscreenCanvas(512, 512);
  const c = GRAIN.getContext('2d'), im = c.createImageData(512, 512), R = rng(7);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (R() - 0.5) * 90; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  c.putImageData(im, 0, 0);
  DESK = new OffscreenCanvas(W, H);
  const d = DESK.getContext('2d'), R2 = rng(3);
  const gr = d.createRadialGradient(W / 2, H * 0.45, 200, W / 2, H / 2, H * 0.75);
  gr.addColorStop(0, '#D8C7A8'); gr.addColorStop(1, '#9E8664');
  d.fillStyle = gr; d.fillRect(0, 0, W, H);
  // wood-ish fibres
  d.globalAlpha = 0.07; d.strokeStyle = '#5A4630';
  for (let i = 0; i < 140; i++) {
    const y = R2() * H; d.lineWidth = 1 + R2() * 3; d.beginPath(); d.moveTo(-20, y);
    for (let x = 0; x <= W + 40; x += 60) d.lineTo(x, y + Math.sin(x * 0.004 + i) * 10 + (R2() - 0.5) * 3);
    d.stroke();
  }
  d.globalAlpha = 1;
}
function grain(g, t, a = 0.09, rect = [0, 0, W, H]) {
  g.save(); g.globalAlpha = a; g.globalCompositeOperation = 'overlay';
  const ox = Math.floor((t * 24 * 37) % 512), oy = Math.floor((t * 24 * 53) % 512);
  const pat = g.createPattern(GRAIN, 'repeat'); pat.setTransform(new DOMMatrix().translate(-ox, -oy));
  g.fillStyle = pat; g.fillRect(...rect); g.restore();
}

// ------------------------------------------------------------------ illustration bits
function skyGrad(g, x, y, w, h, top, bot) { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(x, y, w, h); }
function sun(g, x, y, r, col, rays = 0, t = 0) {
  if (rays) { g.save(); g.translate(x, y); g.rotate(t * 0.05); g.fillStyle = col; g.globalAlpha = 0.25;
    for (let i = 0; i < rays; i++) { g.rotate(Math.PI * 2 / rays); g.beginPath(); g.moveTo(0, 0); g.lineTo(r * 2.6, -r * 0.18); g.lineTo(r * 2.6, r * 0.18); g.fill(); }
    g.restore(); }
  g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
}
function water(g, x, y, w, h, c1, c2, t, seed = 1) {
  skyGrad(g, x, y, w, h, c1, c2);
  const R = rng(seed); g.strokeStyle = 'rgba(255,245,225,0.55)'; g.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const yy = y + 12 + R() * (h - 20), xx = x + ((R() * w + t * (10 + R() * 14)) % w), L = 20 + R() * 60;
    g.lineWidth = 2 + R() * 2; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + L, yy); g.stroke();
  }
}
function cloud(g, x, y, s, col = 'rgba(255,248,236,0.9)') {
  g.fillStyle = col; g.beginPath();
  g.arc(x, y, 26 * s, Math.PI, 0); g.arc(x + 36 * s, y - 14 * s, 32 * s, Math.PI, 0); g.arc(x + 76 * s, y, 24 * s, Math.PI, 0);
  g.closePath(); g.fill();
}
function bird(g, x, y, s, t) { const f = Math.sin(t * 8) * 4 * s; g.strokeStyle = P.ink; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x - 12 * s, y - f); g.quadraticCurveTo(x - 5 * s, y - 6 * s, x, y); g.quadraticCurveTo(x + 5 * s, y - 6 * s, x + 12 * s, y - f); g.stroke(); }
function lattice(g, pts, n, col, lw = 2) {
  // pts: [topL, topR, botR, botL] quad; draws X bracing in n bays
  g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
  const P2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  for (let i = 0; i < n; i++) {
    const a = P2(pts[0], pts[1], i / n), b = P2(pts[0], pts[1], (i + 1) / n), c = P2(pts[3], pts[2], i / n), d = P2(pts[3], pts[2], (i + 1) / n);
    g.moveTo(...a); g.lineTo(...d); g.moveTo(...b); g.lineTo(...c); g.moveTo(...b); g.lineTo(...d);
  }
  g.stroke();
}
function boat(g, x, y, s, col = P.terraD) {
  g.fillStyle = col; g.beginPath(); g.moveTo(x - 50 * s, y); g.quadraticCurveTo(x, y + 22 * s, x + 50 * s, y); g.lineTo(x + 36 * s, y + 6 * s); g.lineTo(x - 36 * s, y + 6 * s); g.closePath(); g.fill();
  g.fillStyle = P.mustard; g.beginPath(); g.moveTo(x - 20 * s, y - 2 * s); g.quadraticCurveTo(x, y - 26 * s, x + 22 * s, y - 2 * s); g.fill();
}

// 1 — Howrah Bridge
function artBridge(g, w, h, t) {
  skyGrad(g, 0, 0, w, h * 0.66, '#F3B99A', '#FBE3C4');
  sun(g, w * 0.7, h * 0.36, 70, '#F6E2B8', 18, t);
  cloud(g, 80 + t * 6, 150, 1.1); cloud(g, 560 - t * 4, 90, 0.8);
  // far city
  g.fillStyle = 'rgba(150,110,110,0.35)';
  for (let i = 0; i < 18; i++) { const bx = i * 50, bh = 30 + ((i * 37) % 60); g.fillRect(bx, h * 0.66 - bh, 44, bh); }
  water(g, 0, h * 0.66, w, h * 0.34, P.teal, P.tealD, t, 4);
  // bridge
  const deck = h * 0.62, tx1 = w * 0.3, tx2 = w * 0.7, top = h * 0.2, col = '#2F3A44';
  g.fillStyle = col;
  g.fillRect(-10, deck, w + 20, 16);
  for (const tx of [tx1, tx2]) {
    g.fillRect(tx - 14, top, 28, deck - top + 60); // tower
    g.fillRect(tx - 34, deck + 10, 68, 50);         // pier
  }
  // cantilever arms: anchor arms to edges, cantilever arms to middle
  const arm = (x0, x1, dir) => {
    const quad = [[x0, top + 10], [x1, deck - 70 + (dir ? 0 : 0)], [x1, deck], [x0, deck]];
    g.strokeStyle = col; g.lineWidth = 9; g.beginPath(); g.moveTo(x0, top + 6); g.lineTo(x1, deck - 70); g.stroke();
    lattice(g, [[x0, top + 10], [x1, deck - 70], [x1, deck], [x0, deck]], 7, col, 3.2);
  };
  arm(tx1, -10, 0); arm(tx2, w + 10, 0);
  arm(tx1, w * 0.43, 1); arm(tx2, w * 0.57, 1);
  // suspended span
  g.strokeStyle = col; g.lineWidth = 8; g.beginPath(); g.moveTo(w * 0.43, deck - 70); g.quadraticCurveTo(w / 2, deck - 92, w * 0.57, deck - 70); g.stroke();
  lattice(g, [[w * 0.43, deck - 70], [w * 0.57, deck - 70], [w * 0.57, deck], [w * 0.43, deck]], 3, col, 3);
  // reflection shimmer
  g.globalAlpha = 0.18; g.fillStyle = col; g.fillRect(tx1 - 12, deck + 62, 24, 90 + Math.sin(t * 3) * 6); g.fillRect(tx2 - 12, deck + 62, 24, 90 + Math.cos(t * 3) * 6); g.globalAlpha = 1;
  boat(g, (w * 0.15 + t * 22) % (w + 120) - 60, h * 0.83, 1.2); boat(g, w * 0.82 - t * 12, h * 0.92, 0.9, P.terra);
  bird(g, 200 + t * 18, 250, 1, t); bird(g, 240 + t * 18, 275, 0.8, t + 1);
}

// 2 — Tram
function artTram(g, w, h, t) {
  skyGrad(g, 0, 0, w, h, '#BFD8D2', '#F6E7CC');
  // colonial facades
  const fac = [[0, 230, '#E7B98C'], [220, 170, '#D78E70'], [400, 260, '#EDD3A2'], [610, 200, '#C9A98A'], [800, 240, '#E7B98C']];
  for (const [x, top, c] of fac) {
    g.fillStyle = c; g.fillRect(x, top, 210, h * 0.68 - top);
    g.fillStyle = 'rgba(60,40,30,0.18)'; g.fillRect(x, top, 210, 14);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) {
      const wx = x + 28 + k * 60, wy = top + 40 + r * 85; if (wy > h * 0.6) continue;
      g.fillStyle = P.tealD; g.beginPath(); g.moveTo(wx, wy + 52); g.lineTo(wx, wy + 18); g.arc(wx + 16, wy + 18, 16, Math.PI, 0); g.lineTo(wx + 32, wy + 52); g.fill();
      g.fillStyle = 'rgba(255,240,220,0.5)'; g.fillRect(wx - 4, wy + 52, 40, 6);
    }
  }
  // road + rails
  g.fillStyle = '#8D8272'; g.fillRect(0, h * 0.68, w, h * 0.32);
  g.strokeStyle = '#D8CDB8'; g.lineWidth = 5;
  for (const y of [h * 0.86, h * 0.9]) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  // overhead wire
  g.strokeStyle = P.ink; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, h * 0.27); g.lineTo(w, h * 0.29); g.stroke();
  // tram crossing
  const x = lerp(w * 0.62, w * 0.12, ss(0, 7.5, t)) , y = h * 0.86, tw = 470, th = 230;
  g.strokeStyle = P.ink; g.lineWidth = 4; g.beginPath(); g.moveTo(x + tw * 0.55, y - th - 18); g.lineTo(x + tw * 0.35, h * 0.28); g.stroke();
  rr(g, x, y - th - 20, tw, 24, 10); g.fillStyle = P.blue; g.fill();
  rr(g, x, y - th, tw, th, 18); g.fillStyle = P.cream; g.fill();
  g.fillStyle = P.blue; g.fillRect(x, y - 70, tw, 34);
  g.fillStyle = P.terra; g.fillRect(x, y - 36, tw, 20);
  for (let i = 0; i < 6; i++) { rr(g, x + 22 + i * 74, y - th + 26, 56, 76, 8); g.fillStyle = '#7FA6A8'; g.fill(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 28 + i * 74, y - th + 32, 12, 64); }
  g.font = F.sans(26); g.fillStyle = P.cream; g.textAlign = 'center'; g.fillText('ধর্মতলা', x + tw / 2, y - 44); g.textAlign = 'left';
  g.fillStyle = P.ink; for (const wx of [x + 80, x + tw - 80]) { g.beginPath(); g.arc(wx, y - 6, 20, 0, Math.PI * 2); g.fill(); }
  // bell rings (little marks)
  const ring = (Math.max(0, Math.sin((t - 2.2) * 9)) * (t > 2.2 && t < 3.6 ? 1 : 0));
  if (ring) { g.strokeStyle = P.terraD; g.lineWidth = 4; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x + tw + 10, y - th + 30, 20 + k * 14, -0.7, 0.7); g.globalAlpha = ring * (1 - k * 0.3); g.stroke(); } g.globalAlpha = 1; }
  bird(g, 700 - t * 15, 120, 1, t);
}

// 3 — Victoria Memorial
function artVictoria(g, w, h, t) {
  skyGrad(g, 0, 0, w, h * 0.7, '#E9A27A', '#F8DDB6');
  sun(g, w * 0.18, h * 0.22, 56, '#FBE7C2', 16, t);
  cloud(g, 600 + t * 5, 140, 1);
  const cx = w / 2, base = h * 0.58, mar = '#F7F1E6', sh = '#D9CDBB';
  // trees
  g.fillStyle = P.green; for (const tx of [40, 140, 900, 800]) { g.beginPath(); g.arc(tx, base - 30, 70, 0, Math.PI * 2); g.fill(); }
  // main block
  g.fillStyle = mar; g.fillRect(cx - 330, base - 160, 660, 160);
  g.fillStyle = sh; g.fillRect(cx - 330, base - 20, 660, 20);
  for (let i = 0; i < 9; i++) { const ax = cx - 300 + i * 70; g.fillStyle = '#C8B9A2'; g.beginPath(); g.moveTo(ax, base - 30); g.lineTo(ax, base - 100); g.arc(ax + 22, base - 100, 22, Math.PI, 0); g.lineTo(ax + 44, base - 30); g.fill(); }
  // drum + dome
  g.fillStyle = mar; g.fillRect(cx - 120, base - 250, 240, 92);
  g.fillStyle = sh; for (let i = 0; i < 6; i++) g.fillRect(cx - 104 + i * 40, base - 238, 14, 70);
  g.fillStyle = mar; g.beginPath(); g.ellipse(cx, base - 250, 135, 150, 0, Math.PI, 0); g.fill();
  g.fillStyle = 'rgba(200,180,160,0.55)'; g.beginPath(); g.ellipse(cx + 40, base - 250, 95, 150, 0, Math.PI * 1.5, 0); g.lineTo(cx + 40, base - 250); g.fill();
  g.fillStyle = mar; g.fillRect(cx - 18, base - 430, 36, 36);
  // angel (simple figure, gently turning)
  g.save(); g.translate(cx, base - 438); g.scale(Math.cos(t * 0.6) * 0.3 + 0.9, 1); g.fillStyle = '#4A4452';
  g.beginPath(); g.moveTo(0, -60); g.lineTo(10, 0); g.lineTo(-10, 0); g.fill(); g.beginPath(); g.arc(0, -66, 9, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(-4, -46); g.lineTo(-36, -64); g.lineTo(-6, -34); g.fill(); g.restore();
  // corner cupolas
  for (const ox of [-290, 290]) { g.fillStyle = mar; g.fillRect(cx + ox - 30, base - 210, 60, 52); g.beginPath(); g.ellipse(cx + ox, base - 210, 38, 44, 0, Math.PI, 0); g.fill(); g.fillRect(cx + ox - 4, base - 268, 8, 18); }
  // lawn + pool reflection
  g.fillStyle = '#8FA35E'; g.fillRect(0, base, w, h - base);
  water(g, cx - 260, base + 60, 520, h - base - 60, '#9CC3C4', '#6FA3A6', t * 0.4, 9);
  g.save(); g.beginPath(); g.rect(cx - 260, base + 60, 520, h - base - 60); g.clip(); g.globalAlpha = 0.28; g.fillStyle = mar;
  g.beginPath(); g.ellipse(cx, base + 60 + 230 + Math.sin(t * 2) * 3, 135, 150, 0, 0, Math.PI); g.fill(); g.fillRect(cx - 120, base + 60, 240, 230); g.restore();
  g.fillStyle = '#5D7A3E'; for (let i = 0; i < 12; i++) { const px = 40 + i * 90; g.beginPath(); g.arc(px, h - 10, 34, Math.PI, 0); g.fill(); }
}

// 4 — College Street
function artBooks(g, w, h, t) {
  skyGrad(g, 0, 0, w, h, '#C7DCD8', '#F4E3C4');
  // back building + coffee house sign
  g.fillStyle = '#D8B48E'; g.fillRect(w * 0.28, 140, w * 0.44, h * 0.6);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { g.fillStyle = P.tealD; rr(g, w * 0.32 + k * 120, 270 + r * 100, 70, 74, 30); g.fill(); }
  rr(g, w * 0.3, 170, w * 0.4, 74, 10); g.fillStyle = P.terraD; g.fill();
  g.font = F.title(54); g.fillStyle = P.cream; g.textAlign = 'center'; g.fillText('কফি হাউস', w / 2, 226); g.textAlign = 'left';
  // steam cup in window
  g.fillStyle = P.cream; rr(g, w / 2 - 28, h * 0.6 - 64, 56, 50, 8); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 4;
  for (let k = 0; k < 3; k++) { g.beginPath(); const sx = w / 2 - 14 + k * 14; g.moveTo(sx, h * 0.6 - 70); for (let j = 1; j < 8; j++) g.lineTo(sx + Math.sin(j + t * 3 + k) * 6, h * 0.6 - 70 - j * 10); g.stroke(); }
  // street
  g.fillStyle = '#C2B49C'; g.beginPath(); g.moveTo(w * 0.42, h * 0.6); g.lineTo(w * 0.58, h * 0.6); g.lineTo(w * 0.86, h); g.lineTo(w * 0.14, h); g.fill();
  // book stalls both sides in perspective
  const cols = [P.terra, P.teal, P.mustard, P.blue, '#7A5C8E', P.green, P.terraD, '#D27D5C'];
  const R = rng(21);
  for (const side of [-1, 1]) {
    for (let row = 0; row < 6; row++) {
      const u = row / 6, sc = lerp(0.55, 1.9, u), baseY = lerp(h * 0.62, h * 0.98, u);
      const x0 = side < 0 ? lerp(w * 0.32, -40, u) : lerp(w * 0.68, w + 40, u);
      let x = x0; const n = 7;
      for (let b = 0; b < n; b++) {
        const bw = (16 + R() * 14) * sc, bh = (60 + R() * 50) * sc;
        const lift = Math.max(0, Math.sin(t * 2.4 - row * 0.7 - b * 0.4)) * 0; // keep still
        g.fillStyle = cols[Math.floor(R() * cols.length)];
        const bx = side < 0 ? x - bw : x;
        g.fillRect(bx, baseY - bh - lift, bw, bh);
        g.fillStyle = 'rgba(255,245,220,0.55)'; g.fillRect(bx + bw * 0.2, baseY - bh * 0.7, bw * 0.6, 3 * sc);
        x += side < 0 ? -bw - 2 : bw + 2;
      }
      g.fillStyle = 'rgba(60,40,30,0.35)'; g.fillRect(side < 0 ? x : x0, baseY, Math.abs(x - x0), 6 * sc);
    }
  }
  // a flying page
  g.save(); g.translate(w * 0.3 + t * 40, h * 0.35 - Math.sin(t * 1.5) * 40); g.rotate(Math.sin(t * 2) * 0.6);
  g.fillStyle = P.cream; g.fillRect(-26, -18, 52, 36); g.strokeStyle = P.inkS; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-18, -8 + k * 9); g.lineTo(18, -8 + k * 9); g.stroke(); } g.restore();
}

// 5 — bhaar chai at the ghat
function artChai(g, w, h, t) {
  skyGrad(g, 0, 0, w, h * 0.55, '#E78B63', '#F7C98F');
  sun(g, w * 0.62, h * 0.47, 90, '#FCE2A6', 20, t);
  // far bank + bridge silhouette (tiny)
  g.fillStyle = 'rgba(120,70,70,0.45)'; g.fillRect(0, h * 0.52, w, 18);
  water(g, 0, h * 0.55, w, h * 0.2, '#D98A64', '#9E5E4F', t, 12);
  g.fillStyle = 'rgba(252,226,166,0.6)'; for (let i = 0; i < 6; i++) g.fillRect(w * 0.62 - 60 + Math.sin(t * 2 + i) * 10, h * 0.58 + i * 22, 120 - i * 14, 6);
  boat(g, w * 0.25 + Math.sin(t * 0.4) * 30, h * 0.64, 1.1, '#5B3A3A');
  // ghat steps
  for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#B9A386' : '#CDB898'; g.fillRect(0, h * 0.75 + i * (h * 0.25 / 6), w, h * 0.25 / 6 + 1); }
  // bhaar (clay cup), foreground
  const cx = w * 0.5, cy = h * 0.82, top = 150, bot = 104, ch = 170;
  g.fillStyle = 'rgba(60,40,30,0.25)'; g.beginPath(); g.ellipse(cx + 20, cy + ch / 2 + 10, 110, 22, 0, 0, Math.PI * 2); g.fill();
  const cg = g.createLinearGradient(cx - top, 0, cx + top, 0); cg.addColorStop(0, '#9C4A2C'); cg.addColorStop(0.45, '#C9693F'); cg.addColorStop(1, '#8A3E25');
  g.fillStyle = cg; g.beginPath(); g.moveTo(cx - top / 2 * 1.4, cy - ch / 2); g.lineTo(cx + top / 2 * 1.4, cy - ch / 2); g.lineTo(cx + bot / 2 * 1.4, cy + ch / 2); g.lineTo(cx - bot / 2 * 1.4, cy + ch / 2); g.fill();
  g.fillStyle = '#B45A35'; g.beginPath(); g.ellipse(cx, cy - ch / 2, top * 0.7, 26, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#A8693E'; g.beginPath(); g.ellipse(cx, cy - ch / 2 + 4, top * 0.62, 20, 0, 0, Math.PI * 2); g.fill();
  // steam
  g.strokeStyle = 'rgba(255,250,240,0.8)'; g.lineWidth = 7; g.lineCap = 'round';
  for (let k = 0; k < 3; k++) { g.beginPath(); const sx = cx - 40 + k * 40; g.moveTo(sx, cy - ch / 2 - 20);
    for (let j = 1; j < 12; j++) g.lineTo(sx + Math.sin(j * 0.7 + t * 2.2 + k * 2) * 14, cy - ch / 2 - 20 - j * 16); g.stroke(); }
  bird(g, 300 + t * 14, 160, 1.2, t); bird(g, 350 + t * 14, 190, 0.9, t + 0.5); bird(g, 380 + t * 14, 150, 0.7, t + 1);
}

const CARDS = [
  { id: 'L2', title: 'হাওড়া ব্রিজ', no: 1, art: artBridge, stamp: P.terra },
  { id: 'L3', title: 'ট্রাম', no: 2, art: artTram, stamp: P.blue },
  { id: 'L4', title: 'ভিক্টোরিয়া মেমোরিয়াল', no: 3, art: artVictoria, stamp: P.teal },
  { id: 'L5', title: 'কলেজ স্ট্রিট', no: 4, art: artBooks, stamp: '#7A5C8E' },
  { id: 'L6', title: 'মাটির ভাঁড়ে চা', no: 5, art: artChai, stamp: P.terraD },
];

// ------------------------------------------------------------------ postcard furniture
const CW = 920, CH = 1400; // card size
function cardBase(g, shadowA = 1) {
  g.save(); g.shadowColor = `rgba(40,25,10,${0.35 * shadowA})`; g.shadowBlur = 40; g.shadowOffsetY = 18;
  rr(g, -CW / 2, -CH / 2, CW, CH, 14); g.fillStyle = P.paper; g.fill(); g.restore();
  // aged edge
  const eg = g.createRadialGradient(0, 0, CH * 0.35, 0, 0, CH * 0.75);
  eg.addColorStop(0, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(150,110,60,0.22)');
  rr(g, -CW / 2, -CH / 2, CW, CH, 14); g.fillStyle = eg; g.fill();
}
function stamp(g, x, y, col, artFn, t, u, rot = 0.06) {
  if (u <= 0) return;
  const k = u < 1 ? lerp(1.9, 1, back(u, 1.2)) : 1, a = clamp(u * 3);
  const w = 170, h = 206;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.globalAlpha = a;
  g.shadowColor = 'rgba(40,25,10,0.3)'; g.shadowBlur = 8 / k; g.shadowOffsetY = 4;
  // perforated edge
  g.fillStyle = '#FFFDF7'; g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = P.paper; g.globalCompositeOperation = 'destination-out';
  const r = 7; for (let i = 0; i <= 12; i++) { const px = -w / 2 + i * w / 12; for (const py of [-h / 2, h / 2]) { g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); } }
  for (let i = 0; i <= 14; i++) { const py = -h / 2 + i * h / 14; for (const px of [-w / 2, w / 2]) { g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); } }
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = col; g.fillRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28);
  if (artFn) { g.save(); g.beginPath(); g.rect(-w / 2 + 20, -h / 2 + 20, w - 40, h - 78); g.clip(); g.translate(-w / 2 + 20, -h / 2 + 20); g.scale((w - 40) / 840, (w - 40) / 840); artFn(g, 840, 1000, t); g.restore(); }
  g.fillStyle = P.cream; g.font = F.sans(24, 600); g.textAlign = 'left'; g.fillText('ডাক', -w / 2 + 24, h / 2 - 26);
  g.textAlign = 'right'; g.font = F.title(40); g.fillText('৫', w / 2 - 24, h / 2 - 22); g.textAlign = 'left';
  g.restore();
}
function postmark(g, x, y, u, date, place = 'কলকাতা', seed = 1) {
  if (u <= 0) return;
  const k = lerp(1.25, 1, eo(u * 2)), a = clamp(u * 4) * 0.92;
  g.save(); g.translate(x, y); g.rotate(-0.22 + seed * 0.07); g.scale(k, k); g.globalAlpha = a;
  g.strokeStyle = P.postmark; g.fillStyle = P.postmark; g.lineWidth = 5;
  g.beginPath(); g.arc(0, 0, 92, 0, Math.PI * 2); g.stroke(); g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, 80, 0, Math.PI * 2); g.stroke();
  g.font = F.sans(28, 600); g.textAlign = 'center';
  g.fillText(place, 0, -28); g.font = F.sans(25, 600); g.fillText(date, 0, 14); g.font = F.sans(22, 500); g.fillText('৭০০ ০০১', 0, 50);
  // wavy cancel lines
  g.lineWidth = 5; for (let i = 0; i < 5; i++) { g.beginPath(); const yy = -48 + i * 24; g.moveTo(100, yy); for (let xx = 100; xx <= 420; xx += 10) g.lineTo(xx, yy + Math.sin(xx * 0.05) * 8); g.stroke(); }
  // ink grain knockout
  g.globalCompositeOperation = 'destination-out'; const R = rng(seed * 99);
  for (let i = 0; i < 220; i++) { g.globalAlpha = 0.5; g.beginPath(); g.arc(-100 + R() * 520, -100 + R() * 200, 1 + R() * 3, 0, Math.PI * 2); g.fill(); }
  g.restore();
}
// handwritten-style sentence reveal: text is laid out in lines and wiped on left→right with a pen speed set by u (0..1)
function writeOn(g, txt, x, y, maxW, lh, font, col, u) {
  if (u <= 0) return 0;
  g.font = font; const words = txt.split(' '), lines = []; let cur = '';
  for (const wd of words) { const tr = cur ? cur + ' ' + wd : wd; if (g.measureText(tr).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = tr; }
  if (cur) lines.push(cur);
  const widths = lines.map(l => g.measureText(l).width), total = widths.reduce((a, b) => a + b, 0);
  let left = total * clamp(u);
  g.fillStyle = col; g.textAlign = 'left';
  lines.forEach((l, i) => {
    const vis = clamp(left, 0, widths[i]); left -= widths[i];
    if (vis <= 0) return;
    g.save(); g.beginPath(); g.rect(x - 10, y + i * lh - lh, vis + 12, lh * 1.35); g.clip(); g.fillText(l, x, y + i * lh); g.restore();
  });
  return lines.length;
}
// timing of sentence i of a line (absolute s)
function partWin(id, i) {
  const st = START[id], offs = PARTS[id], d = DUR[id];
  const a = st + offs[i], b = st + (i + 1 < offs.length ? offs[i + 1] - 0.28 : d);
  return [a, b];
}
function partU(id, i, t) { const [a, b] = partWin(id, i); return clamp((t - a + 0.1) / (b - a)); }

// ------------------------------------------------------------------ the cards
function frontCard(g, c, t, lt) {
  cardBase(g);
  // illustration window
  const ax = -CW / 2 + 34, ay = -CH / 2 + 34, aw = CW - 68, ah = 860;
  g.save(); rr(g, ax, ay, aw, ah, 6); g.clip(); g.translate(ax, ay);
  const z = 1.06 - 0.06 * ss(0, 8, lt); g.translate(aw / 2, ah / 2); g.scale(z, z); g.translate(-aw / 2, -ah / 2);
  c.art(g, aw, ah, lt); g.restore();
  // thin inner frame
  g.strokeStyle = 'rgba(42,39,51,0.65)'; g.lineWidth = 3; rr(g, ax, ay, aw, ah, 6); g.stroke();
  // 'greetings' ribbon on art
  const ru = eo((lt - 0.3) / 0.7);
  if (ru > 0) { g.save(); g.translate(ax + 34, ay + 40); g.globalAlpha = ru; g.translate(-30 * (1 - ru), 0);
    rr(g, 0, 0, 380, 64, 8); g.fillStyle = 'rgba(42,39,51,0.82)'; g.fill();
    g.font = F.sans(30, 600); g.fillStyle = P.cream; g.fillText('কলকাতা থেকে শুভেচ্ছা', 22, 44); g.restore(); }
  // card number tag
  g.font = F.sans(28, 600); g.fillStyle = P.inkS; g.textAlign = 'right'; g.fillText(`কার্ড ${bn(c.no)}/৫`, CW / 2 - 40, ay + ah + 54); g.textAlign = 'left';
  // title
  const tu = partU(c.id, 0, t);
  g.save(); g.globalAlpha = clamp(tu * 3); g.font = F.title(92); g.fillStyle = P.terraD;
  let tt = c.title; g.font = F.title(c.title.length > 14 ? 74 : 92);
  g.fillText(tt, -CW / 2 + 48, ay + ah + 118 + (1 - eo(tu * 2)) * 16); g.restore();
  // ruled lines
  g.strokeStyle = 'rgba(80,100,140,0.22)'; g.lineWidth = 2;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-CW / 2 + 48, ay + ah + 204 + i * 64); g.lineTo(CW / 2 - 48, ay + ah + 204 + i * 64); g.stroke(); }
  // the sentence, written on
  writeOn(g, LINES[c.id][1], -CW / 2 + 52, ay + ah + 196, CW - 110, 64, F.hand(44), P.ink, partU(c.id, 1, t));
}

function letterCard(g, t, kind) {
  cardBase(g);
  const x0 = -CW / 2 + 60, top = -CH / 2;
  // header
  g.font = F.sans(30, 600); g.fillStyle = P.inkS; g.textAlign = 'center';
  g.fillText('পোস্টকার্ড', 0, top + 82); g.textAlign = 'left';
  g.strokeStyle = 'rgba(42,39,51,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-CW / 2 + 50, top + 110); g.lineTo(CW / 2 - 50, top + 110); g.stroke();
  // address block (right)
  g.strokeStyle = 'rgba(80,100,140,0.3)';
  const ab = [top + 1080, top + 1160, top + 1240];
  for (const y of ab) { g.beginPath(); g.moveTo(40, y); g.lineTo(CW / 2 - 50, y); g.stroke(); }
  g.font = F.hand(38); g.fillStyle = P.inkS;
  const addr = kind === 'open' ? ['প্রাপক: প্রিয় বন্ধু', 'তোমার শহর', 'পিন: ______'] : ['প্রাপক: তুমি', 'কমেন্ট বক্স', 'এই ভিডিওর নিচে'];
  const au = kind === 'open' ? ss(0.6, 1.6, t - START.L1) : ss(START.L7 + 5.6, START.L7 + 6.6, t);
  addr.forEach((s, i) => { g.globalAlpha = clamp(au * 3 - i); g.fillText(s, 52, ab[i] - 14); }); g.globalAlpha = 1;
  // ruled message area
  const m0 = top + 430;
  for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(x0, m0 + 12 + i * 86); g.lineTo(CW / 2 - 60, m0 + 12 + i * 86); g.stroke(); }
  if (kind === 'open') {
    writeOn(g, LINES.L1[0], x0, m0, CW - 130, 86, F.title(78), P.terraD, partU('L1', 0, t));
    writeOn(g, LINES.L1[1], x0, m0 + 172, CW - 130, 86, F.hand(52), P.ink, partU('L1', 1, t));
    writeOn(g, LINES.L1[2], x0, m0 + 344, CW - 130, 86, F.hand(52), P.ink, partU('L1', 2, t));
  } else {
    writeOn(g, LINES.L7[0], x0, m0, CW - 130, 86, F.hand(54), P.ink, partU('L7', 0, t));
    writeOn(g, LINES.L7[1].split(',')[0] + ',', x0, m0 + 86, CW - 130, 86, F.hand(54), P.ink, partU('L7', 1, t) * 1.6);
    writeOn(g, 'তোমার কলকাতা', x0 + 60, m0 + 172, CW - 130, 86, F.title(84), P.terraD, partU('L7', 1, t) * 1.6 - 0.6);
    writeOn(g, LINES.L7[2], x0, m0 + 344, CW - 130, 86, F.hand(50), P.teal, partU('L7', 2, t));
  }
}

// ------------------------------------------------------------------ desk props + layout over time
const DATE = '২১.১১.২০২৬';
function deskProps(g, t) {
  g.drawImage(DESK, 0, 0);
  // fountain pen at bottom right, and a couple of loose stamps
  g.save(); g.translate(880, 1800); g.rotate(-0.5);
  rr(g, -220, -16, 380, 32, 16); g.fillStyle = '#26303A'; g.fill(); g.fillStyle = P.mustard; g.fillRect(40, -16, 16, 32);
  g.fillStyle = '#B8B2A6'; g.beginPath(); g.moveTo(160, -12); g.lineTo(230, 0); g.lineTo(160, 12); g.fill(); g.restore();
}
// each card's life: enter at e, stays on the pile, slight rotation per index
const PILE = [
  { kind: 'open', e: 0.0, rot: -0.03, dx: 0 },
  ...CARDS.map((c, i) => ({ kind: 'front', c, e: START[c.id] - 0.75, rot: [0.035, -0.04, 0.025, -0.03, 0.04][i], dx: [10, -14, 8, -6, 12][i] })),
  { kind: 'close', e: START.L7 - 0.75, rot: -0.015, dx: 0 },
];
export function draw(g, t) {
  textures();
  deskProps(g, t);
  // which cards are visible: the current one + the one below it (for the pile peek)
  let cur = 0; PILE.forEach((p, i) => { if (t >= p.e) cur = i; });
  for (let i = Math.max(0, cur - 2); i <= cur; i++) {
    const p = PILE[i], lt = t - p.e;
    const u = i === 0 ? ss(0, 0.6, t) : eo(lt / 0.85);
    // enters from right/below with spin, sits slightly offset
    const ox = lerp(i % 2 ? 1200 : -1200, p.dx, u), oy = lerp(140, 0, u) - (cur - i) * 10;
    const rot = lerp(i % 2 ? 0.35 : -0.35, p.rot, u);
    const dim = (cur - i) * 0.18;
    // gentle breathing drift on the top card
    const drift = i === cur ? Math.sin(t * 0.7) * 3 : 0;
    g.save(); g.translate(W / 2 + ox, H / 2 - 40 + oy + drift); g.rotate(rot);
    const sc = i === cur ? 1 + 0.012 * ss(0, 9, lt) : 1; g.scale(sc, sc);
    if (p.kind === 'open') letterCard(g, t, 'open');
    else if (p.kind === 'close') letterCard(g, t, 'close');
    else frontCard(g, p.c, t, lt);
    // stamp + postmark (top-right corner)
    const sid = p.kind === 'front' ? p.c.id : p.kind === 'open' ? 'L1' : 'L7';
    const sT = p.kind === 'front' ? START[sid] + 0.55 : p.kind === 'open' ? START.L1 + 1.9 : START.L7 + 1.4;
    const sx = CW / 2 - 140, sy = p.kind === 'front' ? -CH / 2 + 160 : -CH / 2 + 250;
    const sArt = p.kind === 'front' ? p.c.art : p.kind === 'open' ? artBridge : artChai;
    stamp(g, sx, sy, p.kind === 'front' ? p.c.stamp : p.kind === 'open' ? P.teal : P.terra, sArt, t, (t - sT) / 0.35);
    postmark(g, sx - 160, sy + 50, (t - sT - 0.45) / 0.3, DATE, 'কলকাতা', p.kind === 'front' ? p.c.no : p.kind === 'open' ? 7 : 9);
    if (dim > 0) { rr(g, -CW / 2, -CH / 2, CW, CH, 14); g.fillStyle = `rgba(60,40,20,${dim})`; g.fill(); }
    g.restore();
  }
  // final outro: the five fronts fanned as tiny stamps along the bottom
  const fu = ss(START.L7 + 5.0, START.L7 + 6.2, t);
  if (fu > 0) CARDS.forEach((c, i) => stamp(g, 150 + i * 195, 1745, c.stamp, c.art, t, (fu * 6 - i) / 1.2, (i - 2) * 0.06));
  // fade in / out
  const fade = Math.max(1 - ss(0, 0.5, t), ss(DURATION - 0.9, DURATION, t));
  if (fade > 0) { g.fillStyle = `rgba(20,14,10,${fade})`; g.fillRect(0, 0, W, H); }
  grain(g, t, 0.1);
  // vignette
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,18,8,0.35)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// sound events for the mixer
export function events() {
  const ev = [];
  PILE.forEach((p, i) => { if (i) ev.push({ t: p.e, k: 'whoosh' }); });
  ev.push({ t: START.L1 + 1.9, k: 'stamp' }, { t: START.L1 + 2.35, k: 'postmark' });
  CARDS.forEach(c => { ev.push({ t: START[c.id] + 0.55, k: 'stamp' }, { t: START[c.id] + 1.0, k: 'postmark' }); });
  ev.push({ t: START.L7 + 1.4, k: 'stamp' }, { t: START.L7 + 1.85, k: 'postmark' });
  ev.push({ t: START.L3 - 0.75 + 2.2, k: 'bell' }, { t: START.L3 - 0.75 + 2.75, k: 'bell' });
  for (let i = 0; i < 5; i++) ev.push({ t: START.L7 + 5.0 + i * 0.2, k: 'tick' });
  return ev;
}
