// "कितना कमाते हैं एक चायवाले?" — Mid-century Cartoon, 1080×1920, 24 fps.
// One timeline (voice starts + word anchors) drives picture, captions and sound events.
import { PAL, shape, ink, plane, text, fit, star, starPts, sparkle, rays, ellipse, rect, rrect, spline, setClock, seg, ss, eo, eio, back, clamp, lerp, paperFinish, dashed, xform, move, TAU, REG, measure, kidney, boomerang } from './engine/toon.js';
import { icon } from './engine/icons.js';
import { drawChaiwala, drawHand, glass, C, REST_L, REST_R } from './engine/chaiwala.js';

export const W = 1080, H = 1920;
let LINES = [], DURS = {};
// voice line starts (s): set by hand from the cue map, durations from voice/dur.json
export const START = { L01: .30, L02: 3.30, L03: 6.60, L04: 9.40, L05: 12.30, L06: 17.00, L07: 21.70, L08: 25.80, L09: 29.30, L10: 32.10, L11: 39.20, L12: 43.30, L13: 47.10, L14: 50.00, L15: 52.40, L16: 54.40 };
// word anchors (absolute s) from the whisper word timings
export const A = {
  stamp15: 1.80, jeb: 4.82, kitna: 5.34, khol: 7.60,
  milk: 9.36, milkTag: 10.32, patti: 12.26, pattiTag: 12.96, sugar: 14.66, sugarTag: 15.36, gas: 17.0, kul: 18.64, total: 19.60,
  bachte: 22.84, bacha: 23.76, ginti: 26.02, din: 27.50, d200: 28.34, mahine: 29.30, d50k: 30.26,
  ruko: 32.28, rent: 33.30, helper: 34.14, bijli: 35.62, d25k: 37.46, silence0: 38.45, silence1: 39.20, res25: 40.84,
  bheed: 44.26, d400: 46.18, d75k: 48.28, keemat: 51.20, nahin: 51.84, ginti2: 52.88, kitne: 56.46, comment: 58.70,
};
export const DURATION = 63.0;
// scene changes
const T = { iris1: [7.6, 8.5], wipe2: [21.25, 21.7], iris3: [25.35, 26.0], wipe4: [31.75, 32.15], cut5: 39.2, wipe6: [42.9, 43.3], wipe7: [49.75, 50.1], wipe8: [54.0, 54.45], irisOut: [61.2, 62.6] };

const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mixc = (a, b, u) => { const A2 = hex(a), B2 = hex(b); return '#' + A2.map((v, i) => Math.round(lerp(v, B2[i], u)).toString(16).padStart(2, '0')).join(''); };
const tint = (c, k) => mixc(c, '#FFFFFF', k), shade = (c, k) => mixc(c, '#000000', k);
const G = { mustard: '#E8B43A', blue: '#7F9CC0', avocado: '#A7AE5B', pink: '#F0B4A8', plum: '#6E4A6B', coral: '#E4613F', teal: '#3FA7A0' };
const FONT = { title: px => `${px}px Rozha`, body: px => `600 ${px}px Pop`, body5: px => `500 ${px}px Pop`, kick: px => `700 ${px}px Kalam` };
let TX = [];   // texts visible this frame, for readcheck
const say = (id, txt, x0, y0, x1, y1, extra = {}) => TX.push({ id, text: txt, x0, y0, x1, y1, ...extra });

export function setup(lines, durs) { LINES = lines; DURS = durs; }

// ---------------------------------------------------------------- shared pieces
function ground(g, col, horizon = 1250) {
  g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H);
  plane(g, rect(-20, -20, W + 40, horizon + 20), tint(col, 0.45));
  plane(g, rect(-20, horizon, W + 40, H - horizon + 20), shade(col, 0.16));
  // horizon line with gaps
  ink(g, [[-10, horizon], [W + 10, horizon]], 4, { breaks: 0.35, seed: 11, taper: false });
}
function medallion(g, x, y, r, label, u, o = {}) {
  if (u <= 0) return;
  const k = back(u, 2.2), { fill = PAL.ink, plate = G.coral, size = r * 0.78, rot = -0.12, sub = null } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
  star(g, 0, 0, r * 1.35, { n: 14, inner: 0.78, fill: o.burst || PAL.white, rot: 0.1, line: 0, alpha: 0.95 });
  shape(g, ellipse(0, 0, r, r, 40), { fill, line: 4, seed: 200, grain: 0.15, breaks: 0.15 });
  ink(g, ellipse(0, 0, r * 0.84, r * 0.84, 40), 2.4, { closed: true, color: PAL.paper, breaks: 0.3, seed: 201 });
  text(g, label, 0, size * 0.36 + (sub ? -r * 0.12 : 0), { font: FONT.title(size), fill: PAL.paper, plate, align: 'center', maxW: r * 1.55 });
  if (sub) text(g, sub, 0, r * 0.5, { font: FONT.body(r * 0.22), fill: PAL.paper, align: 'center', maxW: r * 1.4 });
  g.restore();
}
function tagCard(g, x, y, l1, l2, u, o = {}) {
  if (u <= 0) return;
  const k = back(u, 1.9), w = o.w || 330, h = o.h || 128;
  g.save(); g.translate(x, y); g.scale(k, k); g.rotate(o.rot ?? -0.03);
  shape(g, move(rrect(-w / 2, -h / 2, w, h, 16), 12, 12), { fill: PAL.paperDD, line: 0, off: [0, 0], alpha: 0.5, grain: 0 });
  shape(g, rrect(-w / 2, -h / 2, w, h, 16), { fill: PAL.white, line: 3.6, seed: 210, grain: 0.15, breaks: 0.18 });
  sparkle(g, -w / 2 + 30, -h / 2 + 38, 18, { fill: o.star || G.coral });
  text(g, l1, -w / 2 + 56, -h / 2 + 50, { font: FONT.body(32), fill: PAL.ink, maxW: w - 70 });
  text(g, l2, -w / 2 + 28, h / 2 - 22, { font: FONT.title(52), fill: PAL.ink, plate: o.plate || G.mustard, maxW: w - 50 });
  g.restore();
  say('tag:' + l1, l1 + ' ' + l2, x - w / 2, y - h / 2, x + w / 2, y + h / 2);
}
function header(g, n, title, u, y = 190) {
  if (u <= 0) return;
  const dx = (1 - eo(Math.floor(u * 12) / 12)) * -420;   // slides in on twos
  g.save(); g.translate(dx, 0);
  shape(g, ellipse(130, y, 62, 62, 32), { fill: PAL.ink, line: 0, seed: 220, grain: 0.1 });
  text(g, String(n), 130, y + 26, { font: FONT.title(78), fill: PAL.paper, align: 'center' });
  text(g, title, 216, y + 26, { font: FONT.title(84), fill: PAL.ink, plate: PAL.white, maxW: 800 });
  g.restore();
  say('hdr' + n, title, 60, y - 70, 1020, y + 60);
}
function coin(g, x, y, r = 34, seed = 1) {
  shape(g, ellipse(x, y, r, r, 28), { fill: '#E3B341', line: 3.4, seed, grain: 0.2, breaks: 0.1 });
  ink(g, ellipse(x, y, r * 0.66, r * 0.66, 24), 2.2, { closed: true, color: '#B38419', seed: seed + 1, breaks: 0.3 });
  text(g, '₹', x, y + r * 0.34, { font: FONT.title(r), fill: '#8C6410', align: 'center' });
}
function topCup(g, x, y, r, seed = 1) {      // a chai glass seen from above: rim + tea
  shape(g, ellipse(x, y, r, r, 22), { fill: C.glass, line: 2.6, seed, grain: 0, breaks: 0.2 });
  shape(g, ellipse(x, y, r * 0.74, r * 0.74, 20), { fill: C.tea, line: 0, seed: seed + 1, grain: 0.25 });
  shape(g, ellipse(x - r * 0.18, y - r * 0.2, r * 0.22, r * 0.14, 10), { fill: C.teaL, line: 0, seed: seed + 2, grain: 0, alpha: 0.9 });
}
// a mid-century textile of cups: cols × rows, filling row by row up to `rowsShown`
function textile(g, cx, cy, cols, rows, cell, rowsShown, pal) {
  const x0 = cx - (cols - 1) * cell / 2, y0 = cy - (rows - 1) * cell / 2;
  for (let r = 0; r < rows; r++) {
    const ru = clamp(rowsShown - r); if (ru <= 0) break;
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * cell, y = y0 + r * cell, k = back(ru, 1.6);
      if ((r + c) % 2 === 0) topCup(g, x, y, cell * 0.36 * k, 500 + r * 31 + c);
      else { star(g, x, y, cell * 0.3 * k, { n: 4, inner: 0.3, fill: pal[(r + c) % pal.length], rot: 0.78, line: 0 }); shape(g, ellipse(x, y, cell * 0.07, cell * 0.07, 8), { fill: PAL.ink, line: 0, grain: 0 }); }
    }
  }
}
function caption(g, t) {
  let L = null;
  for (const l of LINES) { const s = START[l.id], d = DURS[l.id] || 2; if (t >= s - 0.05 && t < Math.max(s + 1.8, s + d + 0.6) + 0.02) L = l; }
  if (!L || L.id === 'L16') return;
  const s = START[L.id], u = seg(t, s - 0.05, s + 0.11), rise = (1 - eo(u)) * 10;
  const f = fit(g, L.text, FONT.body('{px}'), 46, 900, 2, 34);
  const lw = Math.max(...f.lines.map(l => measure(g, l, f.font))), bw = lw + 120, bh = f.lines.length * f.px * 1.42 + 44, cx = W / 2, cy = 1730 - bh / 2 + rise;
  g.save(); g.globalAlpha = u;
  shape(g, rrect(cx - bw / 2, cy - bh / 2, bw, bh, 26), { fill: PAL.white, line: 3, seed: 230, grain: 0.1, breaks: 0.15 });
  [-1, 1].forEach(sd => star(g, cx + sd * (bw / 2 - 28), cy, 13, { n: 4, inner: 0.35, fill: G.coral, rot: t * 1.5 * sd, line: 0 }));
  f.lines.forEach((l, i) => text(g, l, cx, cy - bh / 2 + 22 + f.px * 1.12 + i * f.px * 1.42, { font: f.font, fill: PAL.ink, align: 'center' }));
  g.restore();
}

// ---------------------------------------------------------------- the stall (S1 and S10)
function counter(g, top = 1240) {
  shape(g, rect(-20, top, W + 40, 30), { fill: '#A2713F', line: 4, seed: 240, grain: 0.3, breaks: 0.2 });
  for (let i = 0; i < 9; i++) shape(g, rect(-20 + i * 124, top + 30, 124, 330), { fill: i % 2 ? PAL.white : G.coral, line: 3.4, seed: 241 + i, grain: 0.3, breaks: 0.25 });
  ink(g, [[-10, top + 360], [W + 10, top + 360]], 4, { breaks: 0.2, seed: 252, taper: false });
}
function kettle(g, x, y, t) {
  shape(g, spline([[x - 70, y], [x - 80, y - 70], [x - 50, y - 120], [x + 50, y - 120], [x + 80, y - 70], [x + 70, y]], true, 6), { fill: PAL.chrome, line: 4, seed: 260, grain: 0.2, shade: [{ pts: [[x + 20, y - 130], [x + 90, y - 130], [x + 90, y], [x + 30, y]], color: PAL.chromeD, alpha: 0.6 }] });
  ink(g, spline([[x + 70, y - 70], [x + 120, y - 110], [x + 140, y - 150]], false, 6), 12, { seed: 261, taper: false });
  ink(g, spline([[x - 46, y - 124], [x, y - 176], [x + 46, y - 124]], false, 6), 6, { seed: 262, taper: false });
  for (let i = 0; i < 2; i++) { const pts = []; for (let j = 0; j <= 12; j++) { const u = j / 12; pts.push([x + 140 + Math.sin(u * 5 + t * 5 + i) * 10, y - 160 - u * 90]); } ink(g, pts, 3.4, { seed: 263 + i, color: PAL.white, alpha: 0.7 }); }
}
function jars(g, x, y) {
  for (let i = 0; i < 2; i++) {
    const X = x + i * 110;
    shape(g, rrect(X - 44, y - 130, 88, 130, 14), { fill: tint(C.glass, 0.2), line: 3.6, seed: 270 + i, grain: 0.1 });
    for (let j = 0; j < 3; j++) shape(g, ellipse(X - 18 + (j % 2) * 30, y - 30 - j * 30, 22, 10, 12), { fill: '#D79A4E', line: 2.2, seed: 275 + i * 3 + j, grain: 0.2 });
    shape(g, rrect(X - 48, y - 146, 96, 20, 6), { fill: G.coral, line: 3, seed: 280 + i, grain: 0.1 });
  }
}

// ---------------------------------------------------------------- scenes
function S1(g, t) {   // hook: price stamped on the glass; pat the pocket; "?" call-out
  ground(g, G.mustard, 1240);
  rays(g, 700, 800, 30, 1200, PAL.white, { alpha: 0.18, rot: t * 0.03 });
  const push = 1 + 0.04 * ss(seg(t, 0, 7.6));
  g.save(); g.translate(540, 900); g.scale(push, push); g.translate(-540, -900);
  kettle(g, 190, 1240, t); jars(g, 820, 1240);
  // right arm lifts the glass on "एक कप चाय" (anticipation dip → rise → settle)
  const lift = ss(seg(t, 0.35, 0.8)), dip = Math.sin(Math.PI * seg(t, 0.25, 0.45)) * 0.12;
  const armR = { a1: lerp(REST_R.a1, 1.25, lift) + dip, a2: lerp(REST_R.a2, -1.9, lift) };
  // left hand pats the pocket on "जेब" (twice), then lifts away
  const pat = seg(t, A.jeb - 0.3, A.jeb + 0.05), away = seg(t, A.kitna + 0.4, A.kitna + 0.8);
  const k = ss(pat) * (1 - ss(away));
  const tap = Math.sin(clamp((t - A.jeb) / 0.5) * Math.PI * 2) * 0.05 * k;
  const armL = { a1: lerp(REST_L.a1, 2.15, k), a2: lerp(REST_L.a2, 0.27 + tap, k) };
  const face = t < A.stamp15 ? 'happy' : t < A.jeb - 0.3 ? 'proud' : t < 6.4 ? 'focus' : 'happy';
  const blink = [2.9, 6.1].some(b => Math.abs(t - b) < 0.06) ? 1 : 0;
  drawChaiwala(g, { x: 540, y: 1252, s: 1.5, face, armL, armR, handL: k > 0.3 ? 'flat' : 'open', hold: 'R', glassSize: 120, steam: 1, t, blink, look: t > A.jeb - 0.3 && t < 6.2 ? [-6, 4] : [0, 0] });
  counter(g, 1240);
  g.restore();
  // ₹15 medallion stamps onto the glass
  medallion(g, 800, 700, 92, '₹15', seg(t, A.stamp15 - 0.05, A.stamp15 + 0.25));
  if (t > A.stamp15) say('m15', '₹15', 700, 600, 900, 800);
  // pocket call-out
  const cu = seg(t, A.jeb + 0.05, A.jeb + 0.35);
  if (cu > 0) {
    const cx = 270, cy = 560, r = 170 * back(cu, 1.8), px = 540 + -76 * 1.5 * push, py = 1252 - 127 * 1.5;
    dashed(g, [[px, py], [cx + 60, cy + r * 0.9]], 4, 12, 9, t * 40);
    shape(g, ellipse(cx, cy, r, r, 48), { fill: PAL.white, line: 5, seed: 290, grain: 0.1 });
    g.save(); g.beginPath(); g.arc(cx, cy, r - 4, 0, TAU); g.clip();
    shape(g, rrect(cx - 110, cy - 60, 220, 190, 18), { fill: C.vest, line: 4, seed: 291, grain: 0.25 });
    ink(g, [[cx - 106, cy - 20], [cx + 106, cy - 20]], 3, { seed: 292, color: C.vestD, taper: false });
    coin(g, cx + 40, cy - 70, 30, 293);
    g.restore();
    const q = seg(t, A.kitna - 0.05, A.kitna + 0.25);
    if (q > 0) { text(g, '?', cx - 30, cy - 20 + 0 * q, { font: FONT.title(190 * back(q, 2)), fill: PAL.ink, plate: G.coral, align: 'center' }); say('q', '?', cx - 90, cy - 170, cx + 30, cy); }
  }
}

function S3(g, t) {   // the cup opened: an exploded view, one layer per word, tags land on the price words
  ground(g, G.blue, 1500);
  header(g, 1, 'कप के अंदर', seg(t, 8.6, 9.0));
  const tilt = -40 * ss(seg(t, 8.6, 21.2));
  g.save(); g.translate(0, tilt);
  // the empty glass at the base of the stack
  const gx = 540, gy = 1440;
  glass(g, gx, gy, 380, { fill: lerp(0.85, 0.0, ss(seg(t, A.milk - 0.3, A.gas + 0.6))), steam: 0, seed: 600 });
  dashed(g, [[gx, gy - 320], [gx, 380]], 3, 10, 12, 0, PAL.ink, ss(seg(t, 8.8, 9.4)));
  // layers: [anchor, y, side, label, value, draw]
  const L = [
    [A.milk, 940, -1, 'दूध', '≈ ₹3.70', A.milkTag, (x, y) => { shape(g, ellipse(x, y, 120, 46, 30), { fill: PAL.white, line: 4, seed: 610, shade: [{ pts: rect(x, y - 60, 140, 120), color: '#DCE6EE', alpha: 0.8 }] }); }],
    [A.patti, 790, 1, 'चायपत्ती', '83 पैसे', A.pattiTag, (x, y) => { for (let i = 0; i < 9; i++) shape(g, kidney(x - 70 + (i % 5) * 34, y - 14 + Math.floor(i / 5) * 26, 20, i * 0.7), { fill: i % 2 ? '#5A3A22' : '#6E4A2E', line: 2.4, seed: 620 + i, grain: 0.2 }); }],
    [A.sugar, 640, -1, 'चीनी', '47 पैसे', A.sugarTag, (x, y) => { for (let i = 0; i < 6; i++) { const X = x - 66 + (i % 3) * 46, Y = y - 20 + Math.floor(i / 3) * 40; shape(g, rect(X, Y, 34, 34), { fill: PAL.white, line: 3, seed: 630 + i, grain: 0.1 }); } }],
    [A.gas, 490, 1, 'गैस + कप', '≈ ₹1.60', A.gas + 0.7, (x, y) => { shape(g, spline([[x - 30, y + 40], [x - 34, y - 6], [x - 6, y - 50], [x + 4, y - 14], [x + 22, y - 36], [x + 34, y + 6], [x + 30, y + 40]], true, 6), { fill: '#6FA8DC', line: 3.6, seed: 640, shade: [{ pts: ellipse(x, y + 16, 16, 26, 14), color: '#F3D37F', alpha: 0.9 }] }); glass(g, x + 90, y + 40, 80, { fill: 0, steam: 0, seed: 645 }); }],
  ];
  L.forEach(([a0, y, sd, l1, l2, tagT, draw], i) => {
    const u = seg(t, a0 - 0.15, a0 + 0.45); if (u <= 0) return;
    const yy = lerp(gy - 200, y, eo(u)), x = gx + sd * 150 * ss(seg(t, a0, a0 + 0.5));
    g.save(); g.translate(x, yy); g.scale(1.55, 1.55); g.translate(-x, -yy); draw(x, yy); g.restore();
    tagCard(g, gx - sd * 270, y, l1, l2, seg(t, tagT - 0.08, tagT + 0.22), { plate: i % 2 ? G.mustard : G.pink });
    if (seg(t, tagT, tagT + 0.3) > 0) dashed(g, [[gx - sd * 100, y], [x - sd * 190, yy]], 3, 8, 8, 0, PAL.ink, seg(t, tagT, tagT + 0.3));
  });
  g.restore();
  // total: a brace and the ₹6.60 medallion
  const bu = seg(t, A.kul - 0.1, A.kul + 0.5);
  if (bu > 0) ink(g, spline([[100, 420 + tilt], [70, 460 + tilt], [70, 700 + tilt], [40, 730 + tilt], [70, 760 + tilt], [70, 1000 + tilt], [100, 1040 + tilt]], false, 6), 6, { upto: eo(bu), seed: 650, taper: true });
  medallion(g, 760, 330, 120, '₹6.60', seg(t, A.total - 0.05, A.total + 0.25), { sub: 'कुल खर्च', plate: G.coral, burst: PAL.white });
}

function S4(g, t) {   // split: what is spent vs what stays
  g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H);
  plane(g, rect(-20, -20, 560, H + 40), tint(G.pink, 0.15)); plane(g, rect(540, -20, 560, H + 40), tint(G.avocado, 0.15));
  ink(g, [[540, 120], [540, 1580]], 5, { breaks: 0.3, seed: 700, taper: false });
  text(g, 'खर्च', 270, 300, { font: FONT.title(96), fill: PAL.ink, plate: PAL.white, align: 'center' });
  text(g, 'बचत', 810, 300, { font: FONT.title(96), fill: PAL.ink, plate: PAL.white, align: 'center' });
  say('kharch', 'खर्च बचत', 120, 200, 960, 330);
  // 15 coins in a row; a flat hand slides 6.6 of them left on "बचते"
  const slide = eio(seg(t, A.bachte - 0.4, A.bachte + 0.2));
  for (let i = 0; i < 15; i++) {
    const spent = i < 7, row = Math.floor(i / 5), col = i % 5, base = [290 + col * 125, 720 + row * 125];
    let [x, y] = base;
    if (spent) { x = lerp(x, 105 + (i % 3) * 120, slide); y = lerp(y, 760 + Math.floor(i / 3) * 120, slide); }
    else { x = lerp(x, 655 + ((i - 7) % 3) * 120, slide); y = lerp(y, 700 + Math.floor((i - 7) / 3) * 120, slide); }
    if (i === 6) { g.save(); g.beginPath(); g.rect(x - 52, y - 52, 62, 104); g.clip(); coin(g, x, y, 52, 710 + i); g.restore(); }   // 6.6: the 7th coin is cut
    else coin(g, x, y, 52, 710 + i);
  }
  const hx = lerp(860, 330, slide), lift = eo(seg(t, A.bachte + 0.3, A.bachte + 0.8));
  if (lift < 1) drawHand(g, hx + 10 * Math.sin(Math.PI * seg(t, A.bachte + 0.15, A.bachte + 0.3)), 860 - 120 * Math.sin(Math.PI * seg(t, A.bachte - 0.6, A.bachte - 0.4)) - 1100 * lift, Math.PI, 'flat', 1, 2.4);
  tagCard(g, 270, 1260, 'हर कप पर खर्च', '₹6.60', seg(t, A.bachte + 0.1, A.bachte + 0.4), { plate: G.pink, w: 380 });
  medallion(g, 810, 1260, 130, '₹8.40', seg(t, A.bacha - 0.05, A.bacha + 0.25), { sub: 'हर कप पर बचत', plate: G.avocado });
}

function S5(g, t) {   // signature: one cup → 200 cups a day (a textile) → 30 days → ₹50,000
  g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H);
  plane(g, rect(-20, -20, W + 40, H + 40), tint(G.plum, 0.78));
  const pb = eio(seg(t, 25.9, A.d200)), sc = lerp(5.2, 1, pb), rot = lerp(-6, 0, pb) * Math.PI / 180;
  const month = eio(seg(t, A.mahine, A.mahine + 0.85));
  const fx = lerp(-4.5 * 104, 0, pb), fy = lerp(-9.5 * 104, 0, pb);
  g.save(); g.translate(540, 860); g.rotate(rot); g.scale(sc * lerp(1, 0.17, month), sc * lerp(1, 0.17, month)); g.translate(-fx * (1 - month), -fy * (1 - month));
  // the pattern: 10 cols × 20 rows (cups on alternate cells → 100 cups shown + 100 ornaments read as one textile of 200)
  const rowsShown = 1 + 19 * ss(seg(t, 26.1, A.d200));
  const pal = [G.mustard, G.coral, G.teal, G.pink];
  for (let m = 0; m < 30; m++) {
    const mx = (m % 5 - 2) * 1180, my = (Math.floor(m / 5) - 2.5) * 2280;
    if (m && month <= 0) continue;
    const mu = m ? clamp(month * 30 - m * 0.6 + 1) : 1; if (mu <= 0) continue;
    g.save(); g.translate(m ? mx : 0, m ? my : 0);
    if (m) g.globalAlpha = mu;
    textile(g, 0, 0, 10, 20, 104, m ? 20 : rowsShown, pal);
    g.restore();
  }
  g.restore();
  // labels (screen space)
  const l200 = seg(t, A.din - 0.05, A.din + 0.25);
  if (l200 > 0 && month < 0.5) { plate(g, 540, 200, 600, 140, 1 - month * 2); text(g, '200 कप / दिन', 540, 230, { font: FONT.title(96 * back(l200, 1.8)), fill: PAL.ink, plate: PAL.white, align: 'center', alpha: 1 - month * 2 }); say('d200', '200 कप / दिन', 160, 140, 920, 260); }
  if (month > 0.3) { plate(g, 540, 200, 460, 140, seg(month, 0.3, 0.6)); text(g, '× 30 दिन', 540, 230, { font: FONT.title(96), fill: PAL.ink, plate: PAL.white, align: 'center', alpha: seg(month, 0.3, 0.6) }); say('x30', '× 30 दिन', 300, 140, 780, 260); }
  medallion(g, 540, 1300, 170, '₹50,000', seg(t, A.d50k - 0.05, A.d50k + 0.28), { sub: 'करीब, हर महीने', plate: G.mustard, size: 92 });
  if (t > A.d50k) say('m50', '₹50,000 करीब, हर महीने', 370, 1130, 710, 1470, { pass: true });   // the same figure stays readable as the slab in the next scene and in the caption
}

const BITES = [[A.rent, 'किराया', 'house'], [A.helper, 'हेल्पर', 'helper'], [A.bijli, 'बिजली', 'bulb']];
function costIcon(g, kind, x, y, s) {
  if (kind === 'bulb') return icon(g, 'bulb', x, y, 120 * s, { main: '#F3D37F' });
  if (kind === 'house') { shape(g, [[x - 60 * s, y + 50 * s], [x - 60 * s, y - 10 * s], [x, y - 64 * s], [x + 60 * s, y - 10 * s], [x + 60 * s, y + 50 * s]], { fill: G.coral, line: 4, seed: 800, grain: 0.2 }); shape(g, rect(x - 16 * s, y + 6 * s, 32 * s, 44 * s), { fill: PAL.ink, line: 0, grain: 0 }); return; }
  shape(g, ellipse(x, y - 12 * s, 34 * s, 38 * s, 20), { fill: C.skin, line: 4, seed: 810 });
  shape(g, spline([[x - 38 * s, y - 24 * s], [x - 26 * s, y - 56 * s], [x + 30 * s, y - 56 * s], [x + 40 * s, y - 24 * s], [x + 64 * s, y - 20 * s]], true, 4), { fill: G.teal, line: 3.4, seed: 811 });
  shape(g, spline([[x - 56 * s, y + 70 * s], [x - 40 * s, y + 24 * s], [x + 40 * s, y + 24 * s], [x + 56 * s, y + 70 * s]], true, 4), { fill: G.mustard, line: 3.4, seed: 812 });
}
function S6(g, t) {   // costs take three bites out of the month
  ground(g, G.pink, 1420);
  header(g, 2, 'खर्च', seg(t, 32.1, 32.5));
  const SW = 860, x0 = 110, y0 = 740, h = 300;
  let eaten = 0; BITES.forEach(([a]) => { eaten += ss(seg(t, a + 0.15, a + 0.5)); });
  const w = SW * (1 - eaten / 6);
  // the money slab: stacked notes
  shape(g, move(rrect(x0, y0, w, h, 14), 12, 12), { fill: PAL.paperDD, line: 0, off: [0, 0], alpha: 0.5, grain: 0 });
  shape(g, rrect(x0, y0, w, h, 14), { fill: '#9FC08A', line: 4.4, seed: 820, grain: 0.3, breaks: 0.15, shade: [{ pts: rect(x0, y0 + h * 0.62, SW, h), color: '#7EA36A', alpha: 0.6 }] });
  for (let i = 1; i < 6; i++) ink(g, [[x0 + 10, y0 + i * h / 6], [x0 + w - 10, y0 + i * h / 6]], 2.2, { seed: 821 + i, color: '#5E8550', taper: false, breaks: 0.3 });
  text(g, t < A.d25k ? '₹50,000' : '≈ ₹25,000', x0 + w / 2, y0 + h / 2 + 34, { font: FONT.title(t < A.d25k ? 104 : 96), fill: PAL.ink, plate: PAL.white, align: 'center', maxW: w - 30 });
  say('slab' + (t < A.d25k ? 'a' : 'b'), t < A.d25k ? '₹50,000' : '≈ ₹25,000', x0, y0, x0 + w, y0 + h, t < A.d25k ? {} : { pass: true });
  // each cost flies in, grabs a chunk, flies out top-right
  BITES.forEach(([a, label, kind], i) => {
    const inU = eo(seg(t, a - 0.45, a + 0.1)), outU = ei2(seg(t, a + 0.5, a + 1.1));
    if (inU <= 0 || outU >= 1) return;
    const tx = x0 + SW * (1 - (i + 0.5) / 6), ty = y0 - 40;
    const x = lerp(1250, tx, inU) + 600 * outU, y = lerp(560, ty, inU) - 500 * outU;
    if (t > a + 0.15) { const cw = SW / 6; shape(g, rrect(x - cw / 2, y + 60, cw, h, 10), { fill: '#9FC08A', line: 3.6, seed: 830 + i, grain: 0.3 }); }
    costIcon(g, kind, x, y, 1.15);
    text(g, label, x, y - 110, { font: FONT.title(60), fill: PAL.ink, plate: PAL.white, align: 'center' });
    if (t > a && t < a + 1.0) say('bite' + i, label, x - 120, y - 170, x + 120, y - 90, { pass: true });
  });
  tagCard(g, 540, 1560, 'किराया + हेल्पर + बिजली', '≈ ₹25,000', seg(t, A.d25k - 0.05, A.d25k + 0.25), { w: 560, plate: G.pink });
}
const ei2 = u => u * u;
function plate(g, x, y, w, h, a = 1) { if (a <= 0) return; shape(g, rrect(x - w / 2, y - h / 2, w, h, 24), { fill: PAL.white, line: 3.6, seed: 1300, grain: 0.1, alpha: a }); }

function S7(g, t) {   // the result, after the silence: notes go into the cash tin
  ground(g, G.mustard, 1440);
  rays(g, 540, 820, 30, 1300, PAL.white, { alpha: 0.4, rot: twosT(t) * 0.12 });
  if (t < 41.6) tagCard(g, 540, 1560, 'किराया + हेल्पर + बिजली', '≈ ₹25,000', 1 - seg(t, 41.4, 41.6), { w: 560, plate: G.pink });
  const ru = seg(t, 39.55, 39.85);
  // cash tin
  shape(g, rrect(320, 960, 440, 300, 22), { fill: '#C9CFCB', line: 4.6, seed: 900, grain: 0.25, shade: [{ pts: rect(560, 950, 220, 320), color: '#8E9894', alpha: 0.6 }] });
  shape(g, rrect(300, 930, 480, 60, 14), { fill: '#8E9894', line: 4, seed: 901, grain: 0.2 });
  // a note drops in on the number: hand anticipation (lift) → drop → recoil
  const d = seg(t, A.res25 - 0.5, A.res25), hy = t < A.res25 - 0.5 ? 760 : t < A.res25 ? lerp(700, 900, eio(d)) : 900 - 20 * Math.sin(Math.PI * seg(t, A.res25, A.res25 + 0.25)) - 160 * eo(seg(t, A.res25 + 0.5, A.res25 + 1.0));
  if (t < A.res25 + 0.1) shape(g, rrect(470, hy + 10, 150, 80, 6), { fill: '#9FC08A', line: 3.2, seed: 902, grain: 0.3 });
  drawHand(g, 540, hy, Math.PI / 2, t < A.res25 + 0.1 ? 'grip' : 'open', 1, 2.4);
  medallion(g, 540, 560, 210, '≈ ₹25,000', ru, { sub: 'हाथ में, हर महीने', plate: G.coral, size: 92 });
  if (ru > 0) say('res', '≈ ₹25,000 हाथ में, हर महीने', 330, 350, 750, 770);
}
const twosT = t => Math.floor(t * 12) / 12;

function S8(g, t) {   // a busy corner: 400 cups → ₹75,000
  ground(g, G.avocado, 1450);
  header(g, 3, 'भीड़ वाली जगह', seg(t, 43.3, 43.7));
  // a queue of customers bobbing (geometric heads, held bodies)
  for (let i = 0; i < 7; i++) {
    const x = 120 + i * 140, bob = Math.sin(twosT(t) * 6 + i) * 6, cols = [G.coral, G.teal, G.mustard, G.plum, G.blue];
    shape(g, spline([[x - 52, 1450], [x - 46, 1330], [x + 46, 1330], [x + 52, 1450]], true, 4), { fill: cols[i % 5], line: 3.6, seed: 950 + i, grain: 0.3 });
    shape(g, ellipse(x, 1290 + bob, 36, 42, 18), { fill: i % 2 ? C.skin : '#C98E66', line: 3.6, seed: 960 + i, grain: 0.1 });
    shape(g, ellipse(x, 1262 + bob, 36, 18, 14, Math.PI, TAU), { fill: C.hair, line: 0, seed: 970 + i, grain: 0.2 });
  }
  // two textiles side by side = 400
  const rows = 1 + 19 * ss(seg(t, 44.4, A.d400));
  g.save(); g.translate(540, 760); g.scale(0.42, 0.42);
  textile(g, -560, 0, 10, 20, 104, rows, [G.mustard, G.coral, G.plum]);
  textile(g, 560, 0, 10, 20, 104, rows, [G.mustard, G.coral, G.plum]);
  g.restore();
  const l = seg(t, A.d400 - 0.1, A.d400 + 0.2);
  if (l > 0) { plate(g, 540, 1112, 640, 130, 1); text(g, '400 कप / दिन', 540, 1150, { font: FONT.title(88 * back(l, 1.8)), fill: PAL.ink, plate: PAL.white, align: 'center' }); say('d400', '400 कप / दिन', 220, 1050, 860, 1180); }
  medallion(g, 800, 470, 150, '≈ ₹75,000', seg(t, 47.15, 47.45), { sub: 'हर महीने', plate: G.mustard, size: 70 });
  if (t > 47.45) say('m75', '≈ ₹75,000 हर महीने', 650, 320, 950, 620);
}

function S9(g, t) {   // price vs count
  g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H);
  plane(g, rect(-20, -20, W + 40, 960), tint(G.blue, 0.2)); plane(g, rect(-20, 960, W + 40, 1000), tint(G.pink, 0.2));
  ink(g, [[-10, 960], [W + 10, 960]], 5, { breaks: 0.3, seed: 1000, taper: false });
  text(g, 'कीमत', 540, 270, { font: FONT.title(96), fill: PAL.ink, plate: PAL.white, align: 'center' });
  text(g, 'गिनती', 540, 1140, { font: FONT.title(96), fill: PAL.ink, plate: PAL.white, align: 'center' });
  say('kg', 'कीमत गिनती', 300, 180, 780, 1170);
  tagCard(g, 540, 580, 'एक कप', '₹15', 1, { w: 300 });
  const x = seg(t, A.nahin - 0.05, A.nahin + 0.25);
  if (x > 0) { ink(g, [[360, 470], [720, 700]], 16, { color: G.coral, upto: eo(x), seed: 1001, taper: false }); ink(g, [[720, 470], [360, 700]], 16, { color: G.coral, upto: eo(seg(t, A.nahin + 0.1, A.nahin + 0.35)), seed: 1002, taper: false }); }
  // the counter rolls up on twos
  const n = Math.round(400 * eo(seg(twosT(t), 52.3, A.ginti2 + 0.3)));
  const cu = seg(t, 52.2, 52.5);
  if (cu > 0) {
    shape(g, rrect(290, 1250, 500, 200, 24), { fill: PAL.ink, line: 0, seed: 1003, grain: 0.1 });
    text(g, String(n).padStart(3, '0'), 540, 1395, { font: FONT.title(150), fill: PAL.paper, plate: G.coral, align: 'center' });
    text(g, 'कप', 840, 1400, { font: FONT.title(80), fill: PAL.ink });
    say('cnt', 'कप', 290, 1250, 940, 1450, { pass: true });
  }
  const st = seg(t, A.ginti2, A.ginti2 + 0.3);
  if (st > 0) { for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.3; sparkle(g, 540 + Math.cos(a) * 330 * back(st), 1350 + Math.sin(a) * 170 * back(st), 34, { fill: G.mustard }); } }
}

function S10(g, t) {   // the question card, held still; iris-out on the glass
  ground(g, G.mustard, 1300);
  star(g, 540, 400, 470, { n: 16, inner: 0.82, fill: PAL.white, rot: 0.05, line: 0, alpha: 0.85 });
  const cu = seg(t, 54.5, 54.85);
  if (cu > 0) {
    const k = back(cu, 1.8); g.save(); g.translate(540, 400); g.scale(k, k);
    shape(g, rrect(-430, -190, 860, 380, 30), { fill: PAL.white, line: 4.4, seed: 1100, grain: 0.15 });
    text(g, 'आपके इलाके का चायवाला', 0, -70, { font: FONT.title(70), fill: PAL.ink, plate: G.pink, align: 'center', maxW: 780 });
    text(g, 'दिन में कितने कप बेचता है?', 0, 30, { font: FONT.title(70), fill: PAL.ink, plate: G.pink, align: 'center', maxW: 780 });
    text(g, 'कमेंट में बताइए', 0, 128, { font: FONT.kick(58), fill: G.coral, align: 'center' });
    g.restore();
    say('cta', 'आपके इलाके का चायवाला दिन में कितने कप बेचता है? कमेंट में बताइए', 110, 210, 970, 590);
  }
  // the chaiwala offers the glass to the viewer (one move, then held dead still)
  const off = ss(seg(t, 54.6, 55.4));
  const armR = { a1: lerp(REST_R.a1, 0.6, off), a2: lerp(REST_R.a2, -0.55, off) };
  drawChaiwala(g, { x: 540, y: 1320, s: 1.25, face: 'happy', armR, hold: 'R', glassSize: 130, steam: 1, t: Math.min(t, 57), handR: 'grip' });
  counter(g, 1300);
  text(g, 'अनुमानित उदाहरण · स्रोत: OkCredit (2026), IIFL', 540, 1760, { font: FONT.body5(30), fill: PAL.ink, align: 'center', alpha: seg(t, 55, 55.4), maxW: 980 });
  if (t > 55.4) say('src', 'अनुमानित उदाहरण · स्रोत: OkCredit (2026), IIFL', 50, 1720, 1030, 1775);
}

// ---------------------------------------------------------------- transitions + frame
const SCN = [[0, S1], [8.5, S3], [21.7, S4], [26.0, S5], [32.15, S6], [39.2, S7], [43.3, S8], [50.1, S9], [54.45, S10]];
const sceneAt = t => { let f = SCN[0][1]; for (const [s, fn] of SCN) if (t >= s) f = fn; return f; };
function irisTo(g, t, [a, b], from, to, cx, cy, toStart) {
  from(g, t);
  const u = eio(seg(t, a, b)), r = u * 2300;
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip(); to(g, Math.max(t, toStart + 0.001)); g.restore();
  ink(g, ellipse(cx, cy, r, r, 64), 8, { closed: true, seed: 1200, breaks: 0.1 });
}
function wipeTo(g, t, [a, b], from, to, dir, toStart) {
  from(g, t);
  const u = eio(seg(t, a, b));
  g.save(); g.beginPath();
  if (dir === 'up') g.rect(0, H * (1 - u), W, H * u + 2); else g.rect(W * (1 - u), 0, W * u + 2, H);
  g.clip(); to(g, Math.max(t, toStart + 0.001)); g.restore();
  if (dir === 'up') ink(g, [[-10, H * (1 - u)], [W + 10, H * (1 - u)]], 6, { seed: 1210, taper: false }); else ink(g, [[W * (1 - u), -10], [W * (1 - u), H + 10]], 6, { seed: 1211, taper: false });
}

export function renderFilm(g, t) {
  setClock(t); TX = [];
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (t >= T.iris1[0] && t < T.iris1[1]) irisTo(g, t, T.iris1, S1, S3, 800, 700, 8.5);
  else if (t >= T.wipe2[0] && t < T.wipe2[1]) wipeTo(g, t, T.wipe2, S3, S4, 'up', 21.7);
  else if (t >= T.iris3[0] && t < T.iris3[1]) irisTo(g, t, T.iris3, S4, S5, 810, 1260, 26.0);
  else if (t >= T.wipe4[0] && t < T.wipe4[1]) wipeTo(g, t, T.wipe4, S5, S6, 'side', 32.15);
  else if (t >= A.silence0 && t < A.silence1) S6(g, A.silence0);            // the held silence: a frozen frame
  else if (t >= T.wipe6[0] && t < T.wipe6[1]) wipeTo(g, t, T.wipe6, S7, S8, 'side', 43.3);
  else if (t >= T.wipe7[0] && t < T.wipe7[1]) wipeTo(g, t, T.wipe7, S8, S9, 'up', 50.1);
  else if (t >= T.wipe8[0] && t < T.wipe8[1]) wipeTo(g, t, T.wipe8, S9, S10, 'up', 54.45);
  else if (t >= T.irisOut[0]) {
    S10(g, Math.min(t, 61.2));
    const u = eio(seg(t, T.irisOut[0], T.irisOut[1])), r = lerp(2300, 0, u), cx = 910, cy = 950;
    g.save(); g.fillStyle = PAL.ink; g.beginPath(); g.rect(0, 0, W, H); g.arc(cx, cy, Math.max(0.1, r), 0, TAU, true); g.fill('evenodd'); g.restore();
    TX = TX.filter(x => x.id !== 'cta' || u < 0.05);
  }
  else sceneAt(t)(g, t);
  if (t < A.silence0 || t >= A.silence1) caption(g, t);
  paperFinish(g, W, H, 0.9);
}
export const texts = () => TX;

// ---------------------------------------------------------------- sound events (exported for the mixer)
export function events() {
  const E = (t, type, extra = {}) => ({ t: +t.toFixed(3), type, ...extra });
  return [
    E(0.25, 'clink'), E(A.stamp15, 'stamp'), E(A.jeb, 'pat'), E(A.jeb + 0.25, 'pat'), E(A.jeb + 0.1, 'pop'), E(A.kitna, 'pop'),
    E(T.iris1[0], 'iris'), E(8.6, 'swish'),
    E(A.milk, 'pour'), E(A.milkTag, 'tag'), E(A.patti, 'rustle'), E(A.pattiTag, 'tag'), E(A.sugar, 'sprinkle'), E(A.sugarTag, 'tag'), E(A.gas, 'gas'), E(A.gas + 0.7, 'tag'), E(A.kul, 'pen'), E(A.total, 'stamp'),
    E(T.wipe2[0], 'swish'), E(A.bachte - 0.4, 'slide'), E(A.bachte, 'coins'), E(A.bacha, 'stamp'),
    E(T.iris3[0], 'iris'), ...Array.from({ length: 20 }, (_, i) => E(26.1 + i * (A.d200 - 26.1) / 20, 'cup', { i })), E(A.d200, 'pop'), E(A.mahine, 'whoosh'), E(A.d50k, 'stamp'),
    E(T.wipe4[0], 'swish'), E(32.1, 'swish'), E(A.rent + 0.15, 'knock'), E(A.helper + 0.15, 'cloth'), E(A.bijli + 0.15, 'switch'), E(A.d25k, 'tag'),
    E(A.silence1, 'silenceEnd'), E(A.res25, 'ding'), E(A.res25 - 0.02, 'drop'),
    E(T.wipe6[0], 'swish'), E(43.3, 'crowd'), ...Array.from({ length: 20 }, (_, i) => E(44.4 + i * (A.d400 - 44.4) / 20, 'cup', { i })), E(A.d400, 'pop'), E(47.15, 'stamp'),
    E(T.wipe7[0], 'swish'), E(A.nahin, 'cross'), E(52.3, 'counter'), E(A.ginti2, 'sparkle'),
    E(T.wipe8[0], 'swish'), E(54.5, 'pop'), E(55.4, 'clink'), E(T.irisOut[0], 'iris'),
  ];
}
export function srtCues() {
  return LINES.map(l => ({ t0: START[l.id], t1: Math.max(START[l.id] + 1.8, START[l.id] + (DURS[l.id] || 2) + 0.6), text: l.text }));
}
