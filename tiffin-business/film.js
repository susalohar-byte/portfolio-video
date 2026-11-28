// "রাহুলের জলের ব্যবসা" — a packaged-drinking-water business story in the geometric "digital postcard" style.
// 1080×1920, 24 fps. Scene timing follows the voice durations (voice/dur.json); draw(g, t) is pure.
export const W = 1080, H = 1920, FPS = 24;
export let DURATION = 300;
const LEAD = 0.55, GAP = 0.85, INTRO = 0.5;   // visual lead before each voice line, gap between lines
let LINES = [], DUR = {}, PARTS = {}, WORDS = {}, SC = [];
export function setup(lines, dur) {
  LINES = lines; DUR = dur.dur; PARTS = dur.parts; WORDS = dur.words || {};
  let t = INTRO + 0.6;
  SC = lines.map((l, i) => { const s = { ...l, n: i + 1, v: t, art: ART[l.id] }; t += DUR[l.id] + GAP; return s; });
  SC.forEach((s, i) => { s.a = s.v - LEAD; });
  DURATION = Math.ceil((t - GAP + 2.6) * 2) / 2;
  SC.forEach((s, i) => { s.b = i + 1 < SC.length ? SC[i + 1].a : DURATION; });
}
export const voiceStarts = () => SC.map(s => ({ id: s.id, t: s.v }));

// ---------------------------------------------------------------- palette, fonts, helpers
const C = {
  paper: '#ECE5D8', ink: '#1F1D1B', orange: '#E05A2B', mustard: '#E3A232', blue: '#2E5A78', sky: '#5B9BC8', teal: '#3C7D78',
  red: '#C23B2E', green: '#56794A', pink: '#E7B49B', cream: '#F7F2E8', marble: '#DCD4C4', shade: '#B9AE99', rust: '#A5532B',
  terra: '#B0502F', gray: '#8C877E', navy: '#2B3A55', skin: '#C68A5B', skin2: '#A86F48', purple: '#6E4C8F', line: 'rgba(31,29,27,0.38)',
};
const F = { mono: (px, w = 500) => `${w} ${px}px Plex`, bn: (px, w = 600) => `${w} ${px}px Hind`, head: px => `800 ${Math.round(px * 0.86)}px NotoB`, cap: (px, w = 700) => `700 ${px}px Anek` };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const eo = u => 1 - Math.pow(1 - clamp(u), 3);
const eio = u => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
const back = (u, s = 1.6) => { u = clamp(u) - 1; return u * u * ((s + 1) * u + s) + 1; };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TAU = Math.PI * 2;
let TNOW = 0;
const bnd = s => String(s).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
function inr(n) { // Indian grouping, Bengali digits
  const s = String(Math.round(Math.abs(n))); const last3 = s.slice(-3), rest = s.slice(0, -3);
  return (n < 0 ? '−' : '') + '₹' + bnd((rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' : '') + last3);
}
const mixc = (a, b, u) => { const h = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join(''); };

// ---------------------------------------------------------------- primitives
const circ = (g, x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, Math.max(0, r), 0, TAU); g.fill(); };
const half = (g, x, y, r, c, a0 = Math.PI, a1 = TAU) => { g.fillStyle = c; g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, a0, a1); g.closePath(); g.fill(); };
const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const rrect = (g, x, y, w, h, r, c) => { g.fillStyle = c; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
const poly = (g, pts, c) => { g.fillStyle = c; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fill(); };
const arch = (g, x, y, w, h, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); g.fill(); };
const stroke = (g, pts, c, w = 6, cap = 'round') => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = cap; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.stroke(); };
function txt(g, s, x, y, font, c, align = 'left') { g.font = font; g.fillStyle = c; g.textAlign = align; g.fillText(s, x, y); g.textAlign = 'left'; }
function cLine(g, x1, y1, x2, y2, u) { return; if (u <= 0) return; g.strokeStyle = C.line; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x1, y1); g.lineTo(lerp(x1, x2, eo(u)), lerp(y1, y2, eo(u))); g.stroke(); }
function cArc(g, x, y, r, a0, a1, u) { return; if (u <= 0) return; g.strokeStyle = C.line; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, r, a0, lerp(a0, a1, eo(u))); g.stroke(); }
function cross(g, x, y, u, s = 16) { return; if (u <= 0) return; g.strokeStyle = C.ink; g.globalAlpha = clamp(u); g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x, y - s); g.lineTo(x, y + s); g.stroke(); g.globalAlpha = 1; }
function pop(g, v, px, py, fn, mode = 's') {
  if (v <= 0.001) return;
  g.save(); g.translate(px, py);
  if (mode === 's') { const k = back(v, 1.5), ph = px * 0.013 + py * 0.007; g.translate(0, Math.sin(TNOW * 1.7 + ph) * 5 * v); g.rotate((1 - eo(v)) * 0.25 * Math.sin(ph * 3) + Math.sin(TNOW * 1.3 + ph) * 0.012 * v); g.scale(k, k); }
  else if (mode === 'y') { const ph = px * 0.011; g.scale(1 - Math.sin(TNOW * 2.2 + ph) * 0.006 * v, eo(v) * (1 + Math.sin(TNOW * 2.2 + ph) * 0.012 * v)); }
  else if (mode === 'x') g.scale(eo(v), 1);
  else if (mode === 'up') { const ph = px * 0.011; g.translate(0, (1 - eo(v)) * 140); g.scale(1, 1 + Math.sin(TNOW * 2.4 + ph) * 0.01 * v); }
  else if (mode === 'drop') g.translate(0, -(1 - back(v, 1.2)) * 900);
  else if (mode === 'left') g.translate(-(1 - eo(v)) * 1200, 0);
  else if (mode === 'right') g.translate((1 - eo(v)) * 1200, 0);
  else if (mode === 'fade') g.globalAlpha *= clamp(v);
  g.translate(-px, -py); fn(); g.restore();
}
// one ground line so characters stand on something
function ground(g, y, v) { if (v <= 0) return; const w = 880 * eo(v); rect(g, 540 - w / 2, y, w, 5, C.ink); }
const frame = (g, d, V, cx = 540, cy = 820, r = 420) => { cArc(g, cx, cy, r, -Math.PI / 2, Math.PI * 1.5, V(d, 1.2)); cLine(g, 70, cy + 260, 1010, cy + 260, V(d + 0.1, 0.9)); cLine(g, cx, 320, cx, 1330, V(d + 0.2, 0.9)); cross(g, 100, 470, V(d + 0.3)); cross(g, 980, 1270, V(d + 0.35)); };

// ---------------------------------------------------------------- characters (built from circles, rects, triangles)
// y = feet. o: shirt, pants, skin, hair ('short'|'long'|'cap'|'bun'), sari, armL/armR (rad, 0 = hanging), walk (phase or null),
// face (-1|1), mouth ('smile'|'o'|'flat'|'sad'), hold (fn at right hand), t (for blinking)
function person(g, x, y, s, o = {}) {
  const sk = o.skin || C.skin, sh = o.shirt || C.teal, pa = o.pants || C.navy, f = o.face ?? 1, t = o.t ?? 0;
  g.save(); g.translate(x, y); g.scale(s, s);
  const w = o.walk != null ? Math.sin(o.walk) : 0, bob = o.walk != null ? Math.abs(Math.cos(o.walk)) * 4 : 0;
  const idle = o.walk == null ? 1 : 0, br = Math.sin(t * 2.1 + x * 0.01);
  g.translate(0, -bob);
  if (idle) { const hop = (1 - Math.cos(t * 3.4 + x * 0.02)) * 0.5; g.translate(0, -hop * 7); g.scale(1 + (0.5 - hop) * 0.03, 1 - (0.5 - hop) * 0.04 + br * 0.01); }
  // legs
  if (o.sari) {
    poly(g, [[-46, -80], [46, -80], [58, 0], [-58, 0]], o.sari);
    rect(g, -30, -6, 22, 8, C.ink); rect(g, 8, -6, 22, 8, C.ink);
  } else {
    for (const [lx, sg] of [[-16, 1], [16, -1]]) { g.save(); g.translate(lx, -78); g.rotate(w * 0.45 * sg); rect(g, -13, 0, 26, 74, pa); rect(g, -13 + (f > 0 ? 2 : -10), 68, 34, 10, C.ink); g.restore(); }
  }
  // arms (behind body for the far one)
  const arm = (sx, ang, front) => { g.save(); g.translate(sx, -176); g.rotate(ang); rrect(g, -11, -6, 22, 92, 11, front ? sh : mixc(sh, '#000000', 0.15)); circ(g, 0, 90, 12, sk); if (front && o.hold) { g.translate(0, 96); o.hold(g); } g.restore(); };
  const sway = idle ? Math.sin(t * 1.6 + x * 0.02) * 0.07 : 0;
  if (idle && o.armR == null) { const cyc = (t + x * 0.003) % 5.5, wave = cyc < 1.6 ? Math.sin(Math.PI * cyc / 1.6) : 0; o = { ...o, armR: -2.3 * eo(wave * 1.4) + Math.sin(t * 14) * 0.25 * wave }; }
  const aL = (o.armL ?? 0) + (o.walk != null ? w * 0.5 : 0) + sway, aR = (o.armR ?? 0) - (o.walk != null ? w * 0.5 : 0) - sway;
  arm(-44, aL, false);
  // body
  if (o.sari) { rrect(g, -42, -190, 84, 116, 18, sh); poly(g, [[-42, -190], [-10, -190], [42, -80], [10, -80]], o.sari); }
  else { rrect(g, -44, -192, 88, 120, 20, sh); poly(g, [[-14, -192], [0, -172], [14, -192]], C.cream); }
  arm(44, aR, true);
  // head
  rect(g, -9, -204, 18, 16, sk);
  g.save(); g.translate(0, -204); g.rotate(idle ? Math.sin(t * 1.1 + x * 0.03) * 0.09 : Math.sin(t * 7) * 0.04); g.translate(0, 204 - (idle ? Math.max(0, Math.sin(t * 3.4 + x * 0.02)) * 3 : 0));
  circ(g, 0, -236, 36, sk);
  const hc = o.hairc || C.ink;
  if (o.hair === 'cap') { half(g, 0, -244, 38, o.capc || C.red); rect(g, f > 0 ? 0 : -58, -248, 58, 9, o.capc || C.red); }
  else if (o.hair === 'long' || o.hair === 'bun') { half(g, 0, -240, 39, hc); if (o.hair === 'long') rect(g, -39, -242, 16, 52, hc), rect(g, 23, -242, 16, 52, hc); else circ(g, -30 * f, -262, 16, hc); }
  else { half(g, 0, -242, 38, hc); rect(g, -38 * f - (f > 0 ? 0 : -0), -244, 10, 18, hc); poly(g, [[-38, -244], [10, -244], [-24, -232]], hc); }
  // face
  const blink = (Math.floor((t + x * 0.01) * 10) % 37) === 0;
  const ex = f * 8;
  if (blink) { rect(g, ex - 16, -238, 10, 3, C.ink); rect(g, ex + 6, -238, 10, 3, C.ink); }
  else { circ(g, ex - 11, -237, 4.2, C.ink); circ(g, ex + 11, -237, 4.2, C.ink); }
  // brows: lift now and then (surprise / emphasis)
  const lift = Math.max(0, Math.sin(t * 1.3 + x * 0.05)) ** 6 * 6;
  rect(g, ex - 18, -252 - lift, 13, 3.5, C.ink); rect(g, ex + 5, -252 - lift, 13, 3.5, C.ink);
  let m = o.mouth || 'smile';
  if (m === 'smile' && ((t + x * 0.01) % 4.2) < 0.5) m = 'o';
  if (m === 'smile') half(g, ex, -222, 9, C.ink, 0, Math.PI);
  else if (m === 'o') circ(g, ex, -218, 6, C.ink);
  else if (m === 'sad') { g.strokeStyle = C.ink; g.lineWidth = 3.5; g.beginPath(); g.arc(ex, -210, 9, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
  else rect(g, ex - 8, -220, 16, 3.5, C.ink);
  if (o.sari) circ(g, ex, -252, 3.5, C.red);
  g.restore();
  g.restore();
}
// Rahul, 26: modern look — undercut quiff, light stubble, thin glasses, open overshirt over a tee, jeans, white sneakers, watch.
// Same animation vocabulary as person(): walk, idle bounce with squash/stretch, waves, head tilt, blinks, brows, mouth.
function rahul(g, x, y, s, o = {}) {
  const sk = '#C68A5B', skD = '#A9714A', over = o.shirt && o.shirt !== C.teal ? o.shirt : '#2F6E6A', tee = C.cream, jeans = '#3E5C86', jeansD = '#33507A', f = o.face ?? 1, t = o.t ?? 0;
  g.save(); g.translate(x, y); g.scale(s, s);
  const w = o.walk != null ? Math.sin(o.walk) : 0, bob = o.walk != null ? Math.abs(Math.cos(o.walk)) * 5 : 0;
  const idle = o.walk == null ? 1 : 0, br = Math.sin(t * 2.1 + x * 0.01);
  g.translate(0, -bob);
  if (idle) { const hop = (1 - Math.cos(t * 3.4 + x * 0.02)) * 0.5; g.translate(0, -hop * 6); g.scale(1 + (0.5 - hop) * 0.025, 1 - (0.5 - hop) * 0.035 + br * 0.008); }
  // legs: slim jeans + white sneakers
  for (const [lx, sg] of [[-14, 1], [14, -1]]) {
    g.save(); g.translate(lx, -94); g.rotate(w * 0.5 * sg);
    rrect(g, -13, 0, 26, 88, 8, sg > 0 ? jeans : jeansD); rect(g, -13, 76, 26, 6, '#2C4467');
    rrect(g, -15 + (f > 0 ? 3 : -11), 82, 38, 13, 6, '#FBFBF7'); rect(g, -15 + (f > 0 ? 3 : -11), 92, 38, 4, C.ink);
    g.restore();
  }
  // arms: rolled overshirt sleeve + forearm; watch on the left wrist
  const arm = (sx, ang, front) => {
    g.save(); g.translate(sx, -204); g.rotate(ang);
    rrect(g, -11, -6, 22, 52, 10, front ? over : mixc(over, '#000000', 0.18)); rect(g, -12, 38, 24, 8, mixc(over, '#FFFFFF', 0.25));
    rrect(g, -8, 44, 16, 46, 8, front ? sk : skD); if (!front) rect(g, -9, 76, 18, 7, C.ink);
    circ(g, 0, 94, 11, front ? sk : skD);
    if (front && o.hold) { g.translate(0, 98); o.hold(g); }
    g.restore();
  };
  const sway = idle ? Math.sin(t * 1.6 + x * 0.02) * 0.07 : 0;
  if (idle && o.armR == null) { const cyc = (t + x * 0.003) % 5.5, wave = cyc < 1.6 ? Math.sin(Math.PI * cyc / 1.6) : 0; o = { ...o, armR: -2.3 * eo(wave * 1.4) + Math.sin(t * 14) * 0.25 * wave }; }
  const aL = (o.armL ?? 0) + (o.walk != null ? w * 0.55 : 0) + sway, aR = (o.armR ?? 0) - (o.walk != null ? w * 0.55 : 0) - sway;
  arm(-40, aL, false);
  // torso: tee + open overshirt with lapels and a chest pocket
  rrect(g, -40, -214, 80, 124, 16, over);
  poly(g, [[-16, -214], [16, -214], [12, -90], [-12, -90]], tee);
  poly(g, [[-16, -214], [-4, -214], [-14, -178]], mixc(over, '#000000', 0.2)); poly(g, [[16, -214], [4, -214], [14, -178]], mixc(over, '#000000', 0.2));
  rect(g, 20, -184, 14, 12, mixc(over, '#000000', 0.15));
  half(g, 0, -214, 10, sk, 0, Math.PI);
  arm(40, aR, true);
  // head
  rect(g, -8, -226, 16, 14, sk);
  g.save(); g.translate(0, -226); g.rotate(idle ? Math.sin(t * 1.1 + x * 0.03) * 0.09 : Math.sin(t * 7) * 0.04); g.translate(0, 226 - (idle ? Math.max(0, Math.sin(t * 3.4 + x * 0.02)) * 3 : 0));
  circ(g, -31, -254, 7, skD); circ(g, 31, -254, 7, skD);                       // ears
  g.beginPath(); g.ellipse(0, -256, 31, 35, 0, 0, TAU); g.fillStyle = sk; g.fill();
  g.save(); g.globalAlpha *= 0.28; g.beginPath(); g.ellipse(0, -246, 30, 26, 0, 0.15, Math.PI - 0.15); g.fillStyle = C.ink; g.fill(); g.restore();  // stubble
  // hair: faded sides + swept quiff
  g.save(); g.globalAlpha *= 0.55; rect(g, -32, -284, 8, 20, C.ink); rect(g, 24, -284, 8, 20, C.ink); g.restore();
  poly(g, [[-31, -270], [-33, -292], [-20, -306], [2, -314], [26, -310], [38 * f > 0 ? 40 : 36, -296], [32, -276], [10, -286], [-12, -282]], C.ink);
  // face
  const ex = f * 6, blink = (Math.floor((t + x * 0.01) * 10) % 37) === 0;
  if (blink) { rect(g, ex - 17, -256, 10, 3, C.ink); rect(g, ex + 7, -256, 10, 3, C.ink); }
  else { circ(g, ex - 12, -255, 4, C.ink); circ(g, ex + 12, -255, 4, C.ink); }
  g.strokeStyle = C.ink; g.lineWidth = 2.6; g.beginPath(); g.roundRect(ex - 23, -264, 20, 16, 5); g.roundRect(ex + 3, -264, 20, 16, 5); g.moveTo(ex - 3, -258); g.lineTo(ex + 3, -258); g.stroke();  // glasses
  const lift = Math.max(0, Math.sin(t * 1.3 + x * 0.05)) ** 6 * 6;
  rect(g, ex - 22, -272 - lift, 16, 4, C.ink); rect(g, ex + 6, -272 - lift, 16, 4, C.ink);
  let m = o.mouth || 'smile';
  if (m === 'smile' && ((t + x * 0.01) % 4.2) < 0.5) m = 'o';
  if (m === 'smile') { half(g, ex, -238, 9, C.ink, 0, Math.PI); rect(g, ex - 6, -238, 12, 3, C.cream); }
  else if (m === 'o') circ(g, ex, -234, 6, C.ink);
  else if (m === 'sad') { g.strokeStyle = C.ink; g.lineWidth = 3.5; g.beginPath(); g.arc(ex, -226, 9, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
  else rect(g, ex - 8, -236, 16, 3.5, C.ink);
  g.restore();
  g.restore();
}

// ---------------------------------------------------------------- objects
function jar(g, x, y, s = 1, o = {}) { // y = bottom
  g.save(); g.translate(x, y); g.scale(s, s);
  const c = o.c || C.sky, d = mixc(c, '#000000', 0.25);
  rrect(g, -38, -104, 76, 104, 14, c);
  rect(g, 0, -104, 38, 104, d); g.globalAlpha = 1;
  rrect(g, -38, -104, 76, 104, 14, 'rgba(0,0,0,0)');
  for (const yy of [-78, -50, -22]) rect(g, -38, yy, 76, 5, 'rgba(247,242,232,0.45)');
  rect(g, -14, -122, 28, 20, c); rect(g, -18, -132, 36, 12, o.cap || C.blue);
  if (o.label) { rect(g, -26, -70, 52, 30, C.cream); rect(g, -18, -62, 36, 4, C.ink); rect(g, -18, -52, 24, 4, C.ink); }
  g.restore();
}
function house(g, x, y, w, h, c, roof = C.terra, door = C.ink) {
  const lit = k => Math.sin(TNOW * 0.9 + x * 0.37 + k * 2.1) > 0.35 ? C.mustard : C.cream;
  if (w > 100) { const cx = x + w * 0.72, cy = y - h - w * 0.3; rect(g, cx, cy, 18, w * 0.22, C.ink);
    for (let i = 0; i < 3; i++) { const ph = (TNOW * 0.45 + i / 3 + x * 0.01) % 1; g.globalAlpha *= 1; const a = Math.sin(ph * Math.PI) * 0.7; g.save(); g.globalAlpha *= a; circ(g, cx + 9 + Math.sin(ph * 6 + i) * 8, cy - 10 - ph * 70, 8 + ph * 12, C.cream); g.restore(); } }
  rect(g, x, y - h, w, h, c); poly(g, [[x - 12, y - h], [x + w / 2, y - h - w * 0.45], [x + w + 12, y - h]], roof); arch(g, x + w / 2 - 18, y - 70, 36, 70, door);
  rect(g, x + 14, y - h + 26, 30, 30, lit(0)); if (w > 120) rect(g, x + w - 44, y - h + 26, 30, 30, lit(1)); }
function shop(g, x, y, w, h, c) { rect(g, x, y - h, w, h, c); for (let i = 0; i < 5; i++) rect(g, x - 8 + i * (w + 16) / 5, y - h - 30, (w + 16) / 5, 30, i % 2 ? C.cream : C.red); rect(g, x + 16, y - h + 50, w - 32, h - 50, C.ink); rect(g, x + 26, y - h + 60, w - 52, 22, C.mustard); }
function coin(g, x, y, r = 34, c = C.mustard) { circ(g, x, y, r, c); g.strokeStyle = 'rgba(31,29,27,0.35)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r * 0.75, 0, TAU); g.stroke(); txt(g, '₹', x, y + r * 0.36, F.bn(r, 700), C.ink, 'center'); }
function coinStack(g, x, y, n, c = C.mustard) { for (let i = 0; i < n; i++) { rrect(g, x - 46, y - (i + 1) * 16, 92, 16, 6, i % 2 ? c : mixc(c, '#000000', 0.12)); } }
function note(g, x, y, s = 1, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); rect(g, -70, -36, 140, 72, C.green); rect(g, -60, -26, 120, 52, '#6E9160'); circ(g, 0, 0, 18, C.cream); txt(g, '₹', 0, 8, F.bn(22, 700), C.green, 'center'); g.restore(); }
function doc(g, x, y, w, h, title, stampU, stampC = C.red, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  rect(g, -w / 2 + 8, -h / 2 + 10, w, h, 'rgba(31,29,27,0.12)'); rect(g, -w / 2, -h / 2, w, h, C.cream);
  rect(g, -w / 2, -h / 2, w, 46, C.ink); txt(g, title, 0, -h / 2 + 32, F.mono(22, 500), C.cream, 'center');
  for (let i = 0; i < 4; i++) rect(g, -w / 2 + 22, -h / 2 + 76 + i * 30, (w - 44) * (i === 3 ? 0.5 : 1), 6, C.shade);
  if (stampU > 0) { g.save(); g.translate(w / 2 - 52, h / 2 - 52); g.rotate(-0.3); const k = lerp(1.6, 1, eo(stampU * 1.6)); g.scale(k, k); g.globalAlpha = clamp(stampU * 3);
    g.strokeStyle = stampC; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 38, 0, TAU); g.stroke(); g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.stroke();
    txt(g, 'OK', 0, 9, F.mono(24, 500), stampC, 'center'); g.restore(); }
  g.restore();
}
function calendar(g, x, y, s, top, big, c = C.red) { g.save(); g.translate(x, y); g.scale(s, s); rect(g, -90, -90, 180, 190, C.cream); rect(g, -90, -90, 180, 52, c); txt(g, top, 0, -54, F.bn(30, 700), C.cream, 'center'); txt(g, big, 0, 60, F.bn(80, 700), C.ink, 'center'); for (const xx of [-50, 50]) rect(g, xx - 6, -104, 12, 30, C.ink); g.restore(); }
function rickshaw(g, x, y, s, jars = 6, rot = 0, c = C.mustard) { // y = ground
  g.save(); g.translate(x, y); g.scale(s, s);
  rect(g, -10, -128, 240, 96, C.ink); rect(g, -4, -122, 228, 84, C.cream); // cargo box
  for (let i = 0; i < jars; i++) { const col = i % 4, row = Math.floor(i / 4); jar(g, 26 + col * 56, -38 - row * 66, 0.5); }
  rect(g, -150, -40, 400, 22, C.ink);
  // cab
  rect(g, -150, -210, 130, 172, c); half(g, -150, -124, 86, c, Math.PI / 2, Math.PI * 1.5); rect(g, -170, -226, 170, 22, C.ink);
  rect(g, -126, -190, 84, 66, '#9CC3D6');
  for (const wx of [-120, 170]) { circ(g, wx, -12, 36, C.ink); g.save(); g.translate(wx, -12); g.rotate(rot); half(g, 0, 0, 20, C.gray, 0, Math.PI / 2); half(g, 0, 0, 20, C.gray, Math.PI, Math.PI * 1.5); g.restore(); }
  g.restore();
}
function tank(g, x, y, w, h, c, label) { rect(g, x - w / 2, y - h, w, h, c); half(g, x, y - h, w / 2, c); rect(g, x, y - h, w / 2, h, mixc(c, '#000000', 0.18)); half(g, x, y - h, w / 2, mixc(c, '#000000', 0.18), Math.PI * 1.5, TAU); rect(g, x - w / 2, y - h * 0.55, w, 8, 'rgba(247,242,232,0.5)'); if (label) txt(g, label, x, y + 40, F.mono(20, 500), C.ink, 'center'); }
function bubbleSay(g, x, y, w, h, s, c = C.cream, tail = -1) { rrect(g, x - w / 2, y - h / 2, w, h, 26, c); poly(g, [[x + tail * w * 0.2, y + h / 2 - 2], [x + tail * w * 0.35, y + h / 2 + 34], [x + tail * w * 0.05, y + h / 2 - 2]], c); txt(g, s, x, y + 14, F.bn(36, 600), C.ink, 'center'); }
function bolt(g, x, y, s, c = C.mustard) { poly(g, [[x + 10 * s, y - 70 * s], [x - 30 * s, y + 8 * s], [x, y + 8 * s], [x - 14 * s, y + 70 * s], [x + 34 * s, y - 14 * s], [x + 4 * s, y - 14 * s]], c); }
function sunIcon(g, x, y, r, t) { g.save(); g.translate(x, y); g.rotate(t * 0.3); for (let i = 0; i < 10; i++) { g.rotate(TAU / 10); rect(g, r + 10, -5, 26, 10, C.orange); } g.restore(); circ(g, x, y, r, C.orange); }
function snow(g, x, y, r, c = C.sky) { g.strokeStyle = c; g.lineWidth = 10; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); } circ(g, x, y, 14, c); }
function tubewell(g, x, y, s, t, pumping) { g.save(); g.translate(x, y); g.scale(s, s); rect(g, -16, -200, 32, 200, C.blue); rect(g, -34, -230, 68, 40, C.blue); rect(g, 30, -214, 70, 18, C.blue); const a = pumping ? Math.sin(t * 6) * 0.35 : 0; g.save(); g.translate(-30, -216); g.rotate(-0.4 + a); rect(g, -150, -8, 150, 16, C.ink); g.restore(); rect(g, -60, -8, 120, 8, C.ink); g.restore(); }
function gen(g, x, y, s, t, on) { g.save(); g.translate(x, y); g.scale(s, s); rect(g, -130, -150, 260, 150, C.red); rect(g, -130, -150, 260, 26, C.ink); circ(g, -40, -64, 52, C.ink); g.save(); g.translate(-40, -64); g.rotate(on ? t * 14 : 0); for (let i = 0; i < 3; i++) { g.rotate(TAU / 3); half(g, 0, 0, 44, C.gray, 0, 0.8); } g.restore(); rect(g, 40, -110, 60, 18, C.mustard); rect(g, 40, -80, 60, 18, C.mustard); circ(g, 70, -36, 12, on ? C.green : C.gray); g.restore(); }
function bulb(g, x, y, on) { if (on) { g.globalAlpha = 0.25; circ(g, x, y, 70, C.mustard); g.globalAlpha = 1; } circ(g, x, y, 34, on ? C.mustard : C.gray); rect(g, x - 16, y + 30, 32, 24, C.ink); }
function phone(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); rrect(g, -70, -130, 140, 260, 22, C.ink); rrect(g, -58, -110, 116, 210, 8, C.cream); rrect(g, -48, -96, 80, 34, 10, C.green); rrect(g, -30, -50, 80, 34, 10, C.shade); rrect(g, -48, -4, 64, 34, 10, C.green); circ(g, 0, 114, 8, C.gray); g.restore(); }
function clock(g, x, y, r, t) { circ(g, x, y, r, C.cream); g.strokeStyle = C.ink; g.lineWidth = 6; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); stroke(g, [[x, y], [x + Math.cos(t * 2 - 1.57) * r * 0.75, y + Math.sin(t * 2 - 1.57) * r * 0.75]], C.ink, 6); stroke(g, [[x, y], [x + Math.cos(t * 0.3 - 1.57) * r * 0.5, y + Math.sin(t * 0.3 - 1.57) * r * 0.5]], C.red, 8); circ(g, x, y, 7, C.ink); }
function bigNum(g, s, x, y, px, c = C.ink, align = 'center') { txt(g, s, x, y, F.bn(px, 700), c, align); }
function tag(g, x, y, s, c = C.orange, tc = C.cream, px = 40) { g.font = F.bn(px, 700); const w = g.measureText(s).width + 44; rrect(g, x - w / 2, y - px * 0.95, w, px * 1.5, 12, c); txt(g, s, x, y + px * 0.18, F.bn(px, 700), tc, 'center'); }
function flask(g, x, y, s, c = C.teal) { g.save(); g.translate(x, y); g.scale(s, s); poly(g, [[-20, -120], [20, -120], [20, -70], [70, 0], [-70, 0], [-20, -70]], C.cream); poly(g, [[-44, -36], [44, -36], [70, 0], [-70, 0]], c); rect(g, -28, -132, 56, 14, C.ink); g.restore(); }

// ---------------------------------------------------------------- scenes  (art area ≈ y 320..1340)
const ART = {};
// ---- soft modern backdrops (light tints), one shape per scene, gently animated
const PAL = { peach: '#F5D5C2', mint: '#D3E6D8', sky: '#D2E2EE', butter: '#F4E4B8', lilac: '#E3D8EC', blush: '#F2D0CA', sand: '#EBDDC6' };
const BACK = {   // like before: the orange sun only on the cover, the first scene and the last scene
  S01: ['sun', C.orange, 540, 900, 360], S16: ['sun', C.orange, 540, 960, 380], INTRO: ['sun', C.orange, 600, 1010, 380],
};
function backdrop(g, key, t, v) {
  const b = BACK[key]; if (!b || v <= 0) return;
  const [kind, col, x, y] = b, k = eo(v);
  if (kind === 'sun') { g.save(); g.translate(x, y); g.scale(lerp(0.7, 1, back(v, 1.3)), lerp(0.7, 1, back(v, 1.3))); g.translate(-x, -y); sunDisc(g, x, y, b[4], t); g.restore(); return; }
  g.save(); g.globalAlpha *= clamp(v * 1.5);
  const path = (ox = 0, oy = 0, sc = 1) => {
    g.beginPath();
    if (kind === 'blob') {
      const r = b[4] * lerp(0.6, 1, k) * sc;
      for (let i = 0; i <= 72; i++) { const a = i / 72 * TAU, rr = r * (1 + 0.07 * Math.sin(a * 3 + t * 0.9) + 0.05 * Math.sin(a * 5 - t * 1.3)); g.lineTo(x + ox + Math.cos(a) * rr, y + oy + Math.sin(a) * rr * 0.92); }
      g.closePath();
    } else if (kind === 'arch') {
      const w = b[4] * lerp(0.8, 1, k) * sc, h = b[5] * k * sc * (1 + Math.sin(t * 1.2) * 0.006);
      g.moveTo(x + ox - w / 2, y + oy); g.lineTo(x + ox - w / 2, y + oy - h + w / 2); g.arc(x + ox, y + oy - h + w / 2, w / 2, Math.PI, 0); g.lineTo(x + ox + w / 2, y + oy); g.closePath();
    } else if (kind === 'round') {
      const w = b[4] * lerp(0.85, 1, k) * sc, h = b[5] * lerp(0.85, 1, k) * sc; g.roundRect(x + ox - w / 2, y + oy - h / 2, w, h, 90);
    } else if (kind === 'wave') {
      const w = b[4] * sc, h = b[5] * k * sc; g.moveTo(x + ox - w / 2, y + oy + h / 2);
      for (let i = 0; i <= 40; i++) { const u = i / 40; g.lineTo(x + ox - w / 2 + w * u, y + oy - h / 2 + Math.sin(u * 7 + t * 1.2) * 22); }
      g.lineTo(x + ox + w / 2, y + oy + h / 2); g.closePath();
    } else if (kind === 'split') {
      g.roundRect(x + ox - b[4] / 2, y + oy - b[5] / 2 - 30, b[4], b[5] / 2, 70); g.roundRect(x + ox - b[4] / 2, y + oy + 20, b[4], b[5] / 2, 70);
    }
  };
  const fillCol = kind === 'split' ? null : col;
  // 1) soft shadow + a deeper second paper layer peeking out (paper-cut depth)
  g.save(); path(18, 20); g.fillStyle = 'rgba(80,55,30,0.10)'; g.fill(); g.restore();
  g.save(); g.translate(x, y); g.rotate(-0.025); g.translate(-x, -y); path(-10, -8, 1.0); g.fillStyle = mixc(kind === 'split' ? PAL.peach : col, '#000000', 0.06); g.fill(); g.restore();
  // 2) main shape
  if (kind === 'split') { g.save(); g.beginPath(); g.roundRect(x - b[4] / 2, y - b[5] / 2 - 30, b[4], b[5] / 2, 70); g.fillStyle = PAL.peach; g.fill(); g.beginPath(); g.roundRect(x - b[4] / 2, y + 20, b[4], b[5] / 2, 70); g.fillStyle = PAL.sky; g.fill(); g.restore(); }
  else { path(); g.fillStyle = fillCol; g.fill(); }
  // 3) inside the shape: halftone dots on one side + print grain
  g.save(); path(); g.clip();
  const dc = mixc(kind === 'split' ? PAL.sky : col, '#000000', 0.09), x0 = x + 60, y0 = y + 40;
  g.fillStyle = dc;
  for (let gy = -460; gy <= 460; gy += 26) for (let gx = -480; gx <= 480; gx += 26) {
    const px = x + gx + (Math.round(gy / 26) % 2 ? 13 : 0), py = y + gy, d = Math.hypot(px - (x + 420), py - (y + 380)) / 620;
    const r = 6.5 * clamp(1 - d) ** 1.4; if (r > 0.6) { g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill(); }
  }
  g.restore();
  // 4) thin inner highlight edge (top-left), like a cut paper lip
  g.save(); path(-3, -3, 1); g.strokeStyle = 'rgba(255,252,244,0.55)'; g.lineWidth = 3; g.stroke(); g.restore();
// a few small modern accents (dots / rings) floating around the shape
  const R = rng(key.charCodeAt(1) * 31 + key.charCodeAt(2));
  for (let i = 0; i < 5; i++) {
    const ax = x + (R() - 0.5) * 900, ay = y + (R() - 0.5) * 760 + Math.sin(t * 1.4 + i) * 10, r = 6 + R() * 10;
    if (i % 2) circ(g, ax, ay, r * k, mixc(col, '#000000', 0.12)); else { g.strokeStyle = mixc(col, '#000000', 0.18); g.lineWidth = 4; g.beginPath(); g.arc(ax, ay, r * 1.3 * k, 0, TAU); g.stroke(); }
  }
  g.restore();
}
function sunDisc(g, x, y, r, t) {
  g.save(); g.translate(x, y); g.rotate(t * 0.12);
  for (let i = 0; i < 24; i++) { g.rotate(TAU / 24); const L = 26 + Math.sin(t * 2.5 + i) * 10; rrect(g, r + 18, -6, L, 12, 6, C.orange); }
  g.restore();
  const k = 1 + Math.sin(t * 1.8) * 0.015; circ(g, x, y, r * k, C.orange); circ(g, x, y, r * 0.7 * (1 + Math.sin(t * 1.8 + 1) * 0.02), '#EE7B3E');
}
// ======================= tiffin story: props =======================
function tiffin(g, x, y, s = 1, o = {}) {   // steel tiffin carrier, y = bottom
  g.save(); g.translate(x, y); g.scale(s, s);
  const m = o.c || '#B9C0C4', d = mixc(m, '#000000', 0.22), l = mixc(m, '#FFFFFF', 0.35);
  for (let i = 0; i < 3; i++) { const yy = -36 - i * 34; rrect(g, -34, yy, 68, 34, 8, m); rect(g, 6, yy + 2, 26, 30, d); rect(g, -30, yy + 5, 10, 22, l); rect(g, -36, yy + 30, 72, 5, d); }
  rect(g, -38, -110, 6, 100, C.ink); rect(g, 32, -110, 6, 100, C.ink);
  g.strokeStyle = C.ink; g.lineWidth = 6; g.beginPath(); g.arc(0, -114, 22, Math.PI, 0); g.stroke();
  if (o.label) { rrect(g, -22, -66, 44, 20, 4, C.cream); rect(g, -14, -59, 28, 4, C.ink); }
  g.restore();
}
function pot(g, x, y, s = 1, c = '#8C9196') { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = c; g.beginPath(); g.ellipse(0, -46, 70, 52, 0, 0, TAU); g.fill(); rect(g, -54, -104, 108, 18, mixc(c, '#000000', 0.2)); rect(g, -80, -70, 18, 10, C.ink); rect(g, 62, -70, 18, 10, C.ink); g.restore(); }
function steam(g, x, y, t, n = 3, c = 'rgba(255,255,255,0.85)') { for (let k = 0; k < n; k++) { const ph = (t * 0.6 + k / n) % 1, a = Math.sin(ph * Math.PI); g.save(); g.globalAlpha *= a; circ(g, x + Math.sin(ph * 6 + k) * 12, y - ph * 120, 10 + ph * 16, c); g.restore(); } }
function cooker(g, x, y, s, t, whistle) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rrect(g, -60, -90, 120, 90, 20, '#A9B0B5'); rect(g, 10, -86, 46, 82, '#8E959A'); rrect(g, -66, -104, 132, 18, 8, '#7D848A');
  rect(g, 60, -100, 90, 14, C.ink); rect(g, -8, -128, 16, 26, C.ink); circ(g, 0, -134 - (whistle ? Math.abs(Math.sin(t * 20)) * 6 : 0), 10, C.ink);
  g.restore(); if (whistle) steam(g, x, y - 140 * s, t * 2, 4);
}
function stove(g, x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); rect(g, -110, -26, 220, 26, C.ink); for (const fx of [-55, 55]) { for (let i = 0; i < 5; i++) { const h = 18 + Math.abs(Math.sin(t * 9 + i + fx)) * 12; poly(g, [[fx - 22 + i * 11, -26], [fx - 17 + i * 11, -26 - h], [fx - 12 + i * 11, -26]], i % 2 ? C.orange : C.mustard); } } g.restore(); }
function counter(g, x0, x1, y) { rect(g, x0, y - 150, x1 - x0, 150, '#D9C3A0'); rect(g, x0 - 10, y - 166, x1 - x0 + 20, 20, '#A77D52'); for (let x = x0 + 20; x < x1 - 60; x += 170) { rrect(g, x, y - 128, 140, 108, 8, '#CDB28A'); circ(g, x + 120, y - 74, 6, C.ink); } }
function officeBld(g, x, y, w, h, c) { rect(g, x, y - h, w, h, c); for (let yy = y - h + 20; yy < y - 50; yy += 46) for (let xx = x + 16; xx < x + w - 26; xx += 40) rect(g, xx, yy, 24, 28, Math.sin(xx * 3 + yy) > 0.3 ? C.mustard : C.cream); rect(g, x + w / 2 - 22, y - 50, 44, 50, C.ink); }
function wheel(g, x, y, r, rot) { g.strokeStyle = C.ink; g.lineWidth = 7; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = rot + i * Math.PI / 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); } circ(g, x, y, 6, C.ink); }
function bicycle(g, x, y, s, rot, t, load = 3) {
  g.save(); g.translate(x, y); g.scale(s, s);
  wheel(g, -80, -46, 46, rot); wheel(g, 90, -46, 46, rot);
  stroke(g, [[-80, -46], [-10, -46], [40, -120], [-40, -120], [-80, -46]], C.red, 8); stroke(g, [[-10, -46], [-40, -130]], C.red, 8); stroke(g, [[40, -120], [90, -46]], C.red, 8); stroke(g, [[40, -120], [50, -150], [76, -154]], C.ink, 6);
  rect(g, -120, -96, 70, 10, C.ink); for (let i = 0; i < load; i++) tiffin(g, -110 + (i % 2) * 34, -96 - Math.floor(i / 2) * 8, 0.42);
  g.restore();
}
function scooter(g, x, y, s, rot, c = C.teal) {
  g.save(); g.translate(x, y); g.scale(s, s);
  wheel(g, -90, -36, 34, rot); wheel(g, 100, -36, 34, rot);
  g.fillStyle = c; g.beginPath(); g.moveTo(-140, -40); g.quadraticCurveTo(-140, -120, -40, -110); g.lineTo(30, -110); g.lineTo(60, -60); g.lineTo(130, -60); g.lineTo(130, -36); g.lineTo(-140, -36); g.fill();
  rrect(g, -120, -136, 110, 24, 12, C.ink); stroke(g, [[70, -60], [100, -170]], c, 16); rect(g, 80, -182, 50, 10, C.ink); circ(g, 112, -150, 9, C.mustard);
  for (let i = 0; i < 2; i++) tiffin(g, -110 + i * 36, -136, 0.4);
  g.restore();
}
function rain(g, t, v) { if (v <= 0) return; g.save(); g.globalAlpha *= v * 0.8; g.strokeStyle = '#7FA3BF'; g.lineWidth = 4; g.lineCap = 'round'; const R = rng(5); for (let i = 0; i < 70; i++) { const x = R() * 1200 - 60, sp = 500 + R() * 300, y = 360 + ((R() * 1000 + t * sp) % 1000); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 14, y + 40); g.stroke(); } g.restore(); }
function thali(g, x, y, r, t) { circ(g, x, y, r, '#C8CDD0'); circ(g, x, y, r * 0.88, '#DDE1E3'); circ(g, x, y + 4, r * 0.42, C.cream); const B = [[C.mustard, -0.6], [C.orange, 0.5], [C.green, 1.7], [C.red, 2.7], ['#8A5A3B', 3.9]]; B.forEach(([c, a]) => { const bx = x + Math.cos(a) * r * 0.62, by = y + Math.sin(a) * r * 0.62; circ(g, bx, by, r * 0.22, '#B5BBBF'); circ(g, bx, by, r * 0.17, c); }); }
function menuBoard(g, x, y, v, t) {
  rrect(g, x - 360, y - 150, 720, 300, 18, '#2F3A36'); rrect(g, x - 346, y - 136, 692, 272, 12, '#3B4A44');
  const D = ['সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি', 'রবি'], F = [C.orange, C.mustard, C.green, C.red, C.sky, C.pink, C.terra];
  D.forEach((d, i) => { const u = clamp(v * 8 - i); if (u <= 0) return; const cx = x - 300 + i * 100; g.save(); g.globalAlpha *= u; txt(g, d, cx, y - 70, F2(24), C.cream, 'center'); circ(g, cx, y + 10, 34, '#DDE1E3'); circ(g, cx, y + 10, 24, F[i]); rect(g, cx - 30, y + 64, 60, 6, C.cream); g.restore(); });
}
const F2 = px => `600 ${px}px Hind`;
function chatBubbles(g, x, y, v) { const B = [['মাসিক প্ল্যান চাই', 1], ['কাল থেকে শুরু?', 0], ['হ্যাঁ ✓', 1]]; B.forEach(([s, me], i) => { const u = clamp(v * 3 - i); if (u <= 0) return; g.save(); g.globalAlpha *= u; const w = 300; rrect(g, me ? x - 20 : x - w + 20, y + i * 86, w, 64, 20, me ? '#CDEBD3' : C.cream); txt(g, s, me ? x + w / 2 - 20 : x - w / 2 + 20, y + i * 86 + 42, F2(30), C.ink, 'center'); g.restore(); }); }

// ======================= characters =======================
// Mita, 34: saree with border, pallu, bun, bindi, bangles; optional kitchen cap + gloves
function mita(g, x, y, s, o = {}) {
  const sk = '#B97A50', skD = '#9E6642', sar = o.saree || '#A8324A', brd = C.mustard, blouse = o.blouse || C.teal, f = o.face ?? 1, t = o.t ?? 0;
  g.save(); g.translate(x, y); g.scale(s, s);
  const w = o.walk != null ? Math.sin(o.walk) : 0, bob = o.walk != null ? Math.abs(Math.cos(o.walk)) * 4 : 0, idle = o.walk == null ? 1 : 0, br = Math.sin(t * 2.1 + x * 0.01);
  g.translate(0, -bob);
  if (idle) { const hop = (1 - Math.cos(t * 3.4 + x * 0.02)) * 0.5; g.translate(0, -hop * 5); g.scale(1 + (0.5 - hop) * 0.02, 1 - (0.5 - hop) * 0.03 + br * 0.008); }
  // skirt (sways when walking) + feet
  g.save(); g.transform(1, 0, w * 0.08, 1, 0, 0); poly(g, [[-36, -112], [36, -112], [52, -6], [-52, -6]], sar); rect(g, -52, -22, 104, 12, brd); for (let i = 0; i < 4; i++) rect(g, -20 + i * 12, -104, 4, 92, mixc(sar, '#000000', 0.12)); g.restore();
  rrect(g, -30 + w * 8, -8, 26, 9, 4, '#5B3A2A'); rrect(g, 6 - w * 8, -8, 26, 9, 4, '#5B3A2A');
  const arm = (sx, ang, front) => { g.save(); g.translate(sx, -196); g.rotate(ang); rrect(g, -10, -4, 20, 30, 8, blouse); rrect(g, -8, 22, 16, 66, 8, front ? sk : skD); rect(g, -9, 70, 18, 5, C.mustard); rect(g, -9, 77, 18, 4, C.red); circ(g, 0, 92, 10, o.gloves ? '#7FB3D5' : (front ? sk : skD)); if (front && o.hold) { g.translate(0, 96); o.hold(g); } g.restore(); };
  const sway = idle ? Math.sin(t * 1.6 + x * 0.02) * 0.07 : 0;
  if (idle && o.armR == null) { const cyc = (t + x * 0.003) % 6, wave = cyc < 1.4 ? Math.sin(Math.PI * cyc / 1.4) : 0; o = { ...o, armR: -2.2 * eo(wave * 1.4) + Math.sin(t * 13) * 0.22 * wave }; }
  const aL = (o.armL ?? 0) + (o.walk != null ? w * 0.5 : 0) + sway, aR = (o.armR ?? 0) - (o.walk != null ? w * 0.5 : 0) - sway;
  arm(-36, aL, false);
  // blouse + bare midriff + pallu across the chest to the left shoulder
  rrect(g, -34, -206, 68, 76, 14, blouse); rect(g, -30, -134, 60, 22, sk);
  poly(g, [[-36, -206], [-8, -206], [40, -112], [8, -112]], sar); poly(g, [[-36, -206], [-24, -206], [24, -112], [12, -112]], brd);
  arm(36, aR, true);
  // head
  rect(g, -7, -218, 14, 14, sk);
  g.save(); g.translate(0, -218); g.rotate(idle ? Math.sin(t * 1.1 + x * 0.03) * 0.08 : Math.sin(t * 7) * 0.04); g.translate(0, 218);
  if (!o.cap) circ(g, -26 * f, -270, 18, C.ink);                                        // bun
  g.beginPath(); g.ellipse(0, -248, 30, 33, 0, 0, TAU); g.fillStyle = sk; g.fill();
  if (o.cap) { half(g, 0, -258, 34, '#F4F2EC'); rect(g, -34, -262, 68, 8, '#E3E0D8'); }
  else { half(g, 0, -256, 32, C.ink); poly(g, [[-32, -256], [-30, -238], [-20, -254]], C.ink); poly(g, [[32, -256], [30, -238], [20, -254]], C.ink); rect(g, -1, -288, 2, 14, C.red); }
  circ(g, -30, -238, 4, C.mustard); circ(g, 30, -238, 4, C.mustard);                   // earrings
  const ex = f * 5, blink = (Math.floor((t + x * 0.01) * 10) % 41) === 0;
  if (blink) { rect(g, ex - 16, -250, 10, 3, C.ink); rect(g, ex + 6, -250, 10, 3, C.ink); } else { circ(g, ex - 11, -249, 4, C.ink); circ(g, ex + 11, -249, 4, C.ink); rect(g, ex - 16, -254, 4, 2, C.ink); rect(g, ex + 13, -254, 4, 2, C.ink); }
  const lift = Math.max(0, Math.sin(t * 1.3 + x * 0.05)) ** 6 * 5; rect(g, ex - 18, -262 - lift, 13, 3, C.ink); rect(g, ex + 5, -262 - lift, 13, 3, C.ink);
  circ(g, ex, -268, 4, C.red);                                                          // bindi
  let m = o.mouth || 'smile'; if (m === 'smile' && ((t + x * 0.01) % 4.6) < 0.45) m = 'o';
  if (m === 'smile') half(g, ex, -233, 8, '#7A2E2E', 0, Math.PI); else if (m === 'o') circ(g, ex, -230, 5, '#7A2E2E');
  else if (m === 'sad') { g.strokeStyle = '#7A2E2E'; g.lineWidth = 3.5; g.beginPath(); g.arc(ex, -222, 8, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); } else rect(g, ex - 7, -231, 14, 3, '#7A2E2E');
  g.restore(); g.restore();
}
// Sujoy, 36: side-parted hair, moustache, checked half-shirt, trousers, sandals
function sujoy(g, x, y, s, o = {}) {
  const sk = '#A86F48', skD = '#8E5C3B', sh = o.shirt || '#4E79A7', pa = '#3F3A36', f = o.face ?? 1, t = o.t ?? 0;
  g.save(); g.translate(x, y); g.scale(s, s);
  const w = o.walk != null ? Math.sin(o.walk) : 0, bob = o.walk != null ? Math.abs(Math.cos(o.walk)) * 5 : 0, idle = o.walk == null ? 1 : 0, br = Math.sin(t * 2.1 + x * 0.01);
  g.translate(0, -bob);
  if (idle) { const hop = (1 - Math.cos(t * 3.1 + x * 0.02)) * 0.5; g.translate(0, -hop * 5); g.scale(1 + (0.5 - hop) * 0.02, 1 - (0.5 - hop) * 0.03 + br * 0.008); }
  for (const [lx, sg] of [[-15, 1], [15, -1]]) { g.save(); g.translate(lx, -96); g.rotate(w * 0.5 * sg); rrect(g, -14, 0, 28, 90, 8, sg > 0 ? pa : mixc(pa, '#000000', 0.15)); rrect(g, -15 + (f > 0 ? 3 : -11), 86, 36, 9, 4, '#5B3A2A'); g.restore(); }
  const arm = (sx, ang, front) => { g.save(); g.translate(sx, -206); g.rotate(ang); rrect(g, -12, -6, 24, 40, 10, front ? sh : mixc(sh, '#000000', 0.18)); rrect(g, -8, 30, 16, 58, 8, front ? sk : skD); circ(g, 0, 92, 11, front ? sk : skD); if (front && o.hold) { g.translate(0, 98); o.hold(g); } g.restore(); };
  const sway = idle ? Math.sin(t * 1.5 + x * 0.02) * 0.07 : 0;
  const aL = (o.armL ?? 0) + (o.walk != null ? w * 0.55 : 0) + sway, aR = (o.armR ?? 0) - (o.walk != null ? w * 0.55 : 0) - sway;
  arm(-42, aL, false);
  rrect(g, -42, -216, 84, 124, 16, sh);
  g.save(); g.beginPath(); g.roundRect(-42, -216, 84, 124, 16); g.clip(); g.globalAlpha *= 0.35; for (let i = -40; i < 44; i += 18) rect(g, i, -216, 5, 124, C.cream); for (let j = -210; j < -92; j += 18) rect(g, -42, j, 84, 5, C.cream); g.restore();
  poly(g, [[-16, -216], [0, -196], [16, -216]], mixc(sh, '#FFFFFF', 0.3)); for (let j = -186; j < -100; j += 24) circ(g, 0, j, 3, C.cream);
  arm(42, aR, true);
  rect(g, -8, -228, 16, 14, sk);
  g.save(); g.translate(0, -228); g.rotate(idle ? Math.sin(t * 1.0 + x * 0.03) * 0.08 : Math.sin(t * 7) * 0.04); g.translate(0, 228);
  circ(g, -31, -256, 7, skD); circ(g, 31, -256, 7, skD);
  g.beginPath(); g.ellipse(0, -258, 31, 35, 0, 0, TAU); g.fillStyle = sk; g.fill();
  half(g, 0, -266, 33, C.ink); poly(g, [[-33, -266], [-31, -250], [-22, -264]], C.ink); poly(g, [[-6, -298], [34, -288], [32, -266], [4, -280]], C.ink); // side part
  const ex = f * 6, blink = (Math.floor((t + x * 0.01) * 10) % 37) === 0;
  if (blink) { rect(g, ex - 17, -258, 10, 3, C.ink); rect(g, ex + 7, -258, 10, 3, C.ink); } else { circ(g, ex - 12, -257, 4, C.ink); circ(g, ex + 12, -257, 4, C.ink); }
  const lift = Math.max(0, Math.sin(t * 1.2 + x * 0.05)) ** 6 * 5; rect(g, ex - 21, -272 - lift, 16, 4, C.ink); rect(g, ex + 5, -272 - lift, 16, 4, C.ink);
  poly(g, [[ex - 16, -240], [ex + 16, -240], [ex + 10, -234], [ex - 10, -234]], C.ink);            // moustache
  let m = o.mouth || 'smile'; if (m === 'smile' && ((t + x * 0.01) % 4.2) < 0.45) m = 'o';
  if (m === 'smile') half(g, ex, -230, 8, '#5A2A22', 0, Math.PI); else if (m === 'o') circ(g, ex, -226, 5, '#5A2A22');
  else if (m === 'sad') { g.strokeStyle = '#5A2A22'; g.lineWidth = 3.5; g.beginPath(); g.arc(ex, -218, 8, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); } else rect(g, ex - 7, -228, 14, 3, '#5A2A22');
  g.restore(); g.restore();
}
const walkIn = (lt, d, dur, x0, x1) => { const u = eio((lt - d) / dur); return { x: lerp(x0, x1, u), walking: u > 0 && u < 1, u }; };

// ======================= scenes =======================
ART.S01 = (g, lt, V, P, t) => {
  ground(g, 1282, V(0.3, 0.7));
  pop(g, V(0.4, 0.6), 540, 1282, () => counter(g, 120, 960, 1282), 'y');
  pop(g, V(0.7), 330, 1116, () => stove(g, 330, 1116, 1, t));
  pop(g, V(0.9), 300, 1090, () => cooker(g, 300, 1090, 1, t, (lt % 6) > 4.6));
  pop(g, V(1.1), 820, 1116, () => pot(g, 820, 1116, 0.9));
  const m = walkIn(lt, 0.6, 1.5, 1180, 600); mita(g, m.x, 1282, 1.05, { t, face: m.walking ? -1 : -1, walk: m.walking ? lt * 7 : null, mouth: lt > P(1) ? 'smile' : 'flat', armR: lt > P(1) ? undefined : 0.1 });
  pop(g, V(P(1) + 0.2), 160, 1282, () => { coinStack(g, 160, 1110, Math.max(1, Math.round(8 * eo((lt - P(1) - 0.2) / 1.2)))); tag(g, 160, 950, '₹৪২,০০০', C.ink, C.cream, 38); });
  pop(g, V(P(1) + 1.4), 830, 760, () => bubbleSay(g, 830, 760, 360, 100, 'এতে কিছু হবে না!', C.cream, -1));
};
ART.S02 = (g, lt, V, P, t) => {
  ground(g, 1282, V(0.2, 0.7));
  pop(g, V(0.3, 0.6), 230, 1282, () => { rect(g, 120, 760, 220, 522, '#8A5A3B'); rect(g, 140, 780, 180, 502, '#6E4630'); circ(g, 300, 1040, 9, C.mustard); }, 'y');
  const s = walkIn(lt, P(0) + 0.6, 1.4, 120, 420); sujoy(g, s.x, 1282, 1.0, { t, walk: s.walking ? lt * 6 : null, mouth: 'sad', armR: 0.15, armL: 0.1, hold: (gg) => { rrect(gg, -24, 0, 48, 56, 8, '#5B3A2A'); } });
  mita(g, 760, 1282, 1.0, { t, face: -1, mouth: lt > P(2) + 0.6 ? 'o' : 'sad', armR: lt > P(2) ? -2.4 : 0.2 });
  const B = [['স্কুলের ফি', C.red], ['বাড়ি ভাড়া', C.blue], ['ওষুধ', C.green]];
  B.forEach(([n, c], i) => pop(g, V(P(1) + 0.2 + i * 0.6), 330 + i * 230, 560, () => { g.save(); g.translate(330 + i * 230, 600); g.rotate((i - 1) * 0.08); rect(g, -90, -60, 180, 120, C.cream); rect(g, -90, -60, 180, 34, c); txt(g, n, 0, -36, F2(26), C.cream, 'center'); rect(g, -60, -6, 120, 6, C.shade); rect(g, -60, 14, 80, 6, C.shade); txt(g, '₹?', 50, 46, F2(28), c, 'center'); g.restore(); }, 'drop'));
  pop(g, V(P(2) + 0.3), 760, 860, () => { circ(g, 760, 860, 46, C.mustard); rect(g, 744, 902, 32, 22, C.ink); for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + lt * 0.4; stroke(g, [[760 + Math.cos(a) * 62, 860 + Math.sin(a) * 62], [760 + Math.cos(a) * 82, 860 + Math.sin(a) * 82]], C.mustard, 7); } });
};
ART.S03 = (g, lt, V, P, t) => {
  ground(g, 1300, V(0.2, 0.7));
  const B = [[110, 200, 380, C.blue], [330, 160, 300, C.teal], [520, 180, 420, C.marble]];
  B.forEach(([x, w, h, c], i) => pop(g, V(0.4 + i * 0.15, 0.6), x + w / 2, 1300, () => officeBld(g, x, 1300, w, h, c), 'y'));
  pop(g, V(0.9, 0.6), 830, 1300, () => { rect(g, 720, 1000, 240, 300, C.pink); rect(g, 730, 1010, 220, 50, C.ink); txt(g, 'কোচিং', 840, 1046, F2(30), C.cream, 'center'); for (let i = 0; i < 3; i++) arch(g, 750 + i * 66, 1100, 44, 80, C.cream); }, 'y');
  const m = walkIn(lt, P(0) + 0.2, 4.5, -120, 980); mita(g, m.x, 1300, 0.7, { t, walk: m.walking ? lt * 8 : null });
  const pins = [[210, 880], [410, 960], [610, 840], [840, 960]]; pins.forEach(([x, y], i) => pop(g, V(P(0) + 0.8 + i * 0.9), x, y, () => { circ(g, x, y - 40, 26, C.red); poly(g, [[x - 20, y - 30], [x + 20, y - 30], [x, y]], C.red); circ(g, x, y - 40, 10, C.cream); }));
  pop(g, V(P(1) + 0.2), 300, 600, () => { thali(g, 300, 600, 70, t); tag(g, 300, 720, 'তেলেভাজা', C.orange, C.cream, 30); });
  pop(g, V(P(1) + 0.9), 760, 600, () => { circ(g, 760, 600, 70, C.cream); circ(g, 760, 600, 48, '#E9E4D8'); tag(g, 760, 720, 'ঠান্ডা ভাত', C.sky, C.ink, 30); });
};
ART.S04 = (g, lt, V, P, t) => {
  ground(g, 1300, V(0.2, 0.7));
  pop(g, V(0.3, 0.6), 760, 1300, () => officeBld(g, 560, 1300, 420, 560, C.marble), 'y');
  const people = [C.orange, C.blue, C.green, C.red, C.mustard];
  people.forEach((c, i) => { const x = 600 + (i % 3) * 120 - (i > 2 ? 60 : 0), y = i > 2 ? 1300 : 1240; if (V(0.6 + i * 0.1) > 0) person(g, x, y, i > 2 ? 0.62 : 0.55, { shirt: c, pants: C.navy, hair: i === 1 ? 'long' : 'short', t, armR: lt > P(2) && i !== 2 ? -2.4 : undefined }); });
  const m = walkIn(lt, P(1) - 0.2, 1.2, -100, 260); mita(g, m.x, 1300, 0.85, { t, walk: m.walking ? lt * 8 : null, hold: (gg) => tiffin(gg, 0, 40, 0.5) });
  for (let i = 0; i < 5; i++) pop(g, V(P(1) + 0.8 + i * 0.25), 140 + i * 60, 760, () => { tiffin(g, 110 + i * 70, 820, 0.55); tag(g, 110 + i * 70, 640, 'ফ্রি', C.green, C.cream, 24); });
  pop(g, V(P(2) + 0.3), 760, 640, () => bubbleSay(g, 760, 640, 360, 100, 'মাসে কত দিতে হবে?', C.cream, 0));
  for (let i = 0; i < 4; i++) pop(g, V(P(2) + 1.2 + i * 0.2), 650 + i * 70, 760, () => { circ(g, 650 + i * 70, 770, 22, C.green); txt(g, '✓', 650 + i * 70, 780, F2(28), C.cream, 'center'); });
};
const ROWS_T = [['হাঁড়ি, কুকার, ইন্ডাকশন, গ্যাস', 18000], ['৪০টা স্টিলের টিফিন', 14000], ['FSSAI, প্যাকেট, স্টিকার', 2000], ['প্রথম সপ্তাহের বাজার', 8000]];
ART.S05 = (g, lt, V, P, t) => {
  pop(g, V(0.3, 0.6), 540, 840, () => { rect(g, 128, 448, 840, 760, 'rgba(31,29,27,0.12)'); rect(g, 120, 440, 840, 760, C.cream); rect(g, 120, 440, 840, 70, C.ink); txt(g, 'বিনিয়োগ', 160, 488, F.bn(36, 700), C.cream); }, 'y');
  const icons = [(x, y) => pot(g, x, y + 34, 0.32), (x, y) => tiffin(g, x, y + 38, 0.42), (x, y) => doc(g, x, y, 54, 64, '', 0), (x, y) => { rrect(g, x - 30, y - 10, 60, 40, 8, C.mustard); circ(g, x - 12, y - 14, 12, C.green); circ(g, x + 10, y - 16, 12, C.red); }];
  let total = 0;
  ROWS_T.forEach(([name, amt], i) => { const d = P(i + 1) + 0.15, v = V(d, 0.45); if (v <= 0) return; total += amt * eo((lt - d) / 0.7);
    pop(g, v, 540, 590 + i * 120, () => { const y = 590 + i * 120; icons[i](200, y); txt(g, name, 260, y + 14, F.bn(38, 600), C.ink); txt(g, inr(amt), 920, y + 14, F.bn(42, 700), C.blue, 'right'); rect(g, 160, y + 50, 760, 2, C.shade); }, 'left'); });
  pop(g, V(P(1), 0.5), 540, 1120, () => { rect(g, 160, 1090, 760, 4, C.ink); txt(g, 'মোট', 180, 1162, F.bn(46, 700), C.ink); txt(g, inr(total), 920, 1162, F.bn(56, 700), lt > P(5) ? C.red : C.ink, 'right'); });
  pop(g, V(P(5) + 0.2), 840, 480, () => { g.save(); g.translate(840, 480); g.rotate(-0.2); circ(g, 0, 0, 92, C.red); g.strokeStyle = C.cream; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 76, 0, TAU); g.stroke(); txt(g, '৪২', 0, 12, F.bn(54, 700), C.cream, 'center'); txt(g, 'হাজার', 0, 48, F.bn(26, 600), C.cream, 'center'); g.restore(); });
};
ART.S06 = (g, lt, V, P, t) => {
  ground(g, 1300, V(0.2, 0.7));
  pop(g, V(P(0) + 0.3, 0.5), 270, 640, () => { doc(g, 270, 640, 300, 300, 'FSSAI', (lt - P(0) - 1.4) / 0.4, C.green, -0.05); tag(g, 270, 860, '₹১০০ / বছর', C.ink, C.cream, 34); }, 'up');
  const m = mita(g, 760, 1300, 1.0, { t, cap: lt > P(1), gloves: lt > P(1) + 0.4, face: -1, armR: lt > P(1) ? -1.2 + Math.sin(lt * 5) * 0.2 : undefined });
  if (V(P(1) + 0.4) > 0) for (let i = 0; i < 6; i++) { const ph = (lt * 0.9 + i / 6) % 1; g.save(); g.globalAlpha *= Math.sin(ph * Math.PI) * 0.8; circ(g, 600 + i * 60, 1240 - ph * 120, 8 + (i % 2) * 5, '#BFDDEB'); g.restore(); }
  pop(g, V(P(2) + 0.1, 0.5), 540, 1080, () => menuBoard(g, 540, 1040, clamp((lt - P(2) - 0.1) / 2), t), 'up');
};
ART.S07 = (g, lt, V, P, t) => {
  pop(g, V(0.3), 540, 760, () => { tiffin(g, 540, 820, 1.5, { label: 1 }); tag(g, 540, 560, bnd(Math.round(92 * eo((lt - 0.4) / 1.2))) + ' টাকা / টিফিন', C.ink, C.cream, 44); });
  const X0 = 140, X1 = 940, sc = (X1 - X0) / 92, parts = [[42, 'বাজার', C.orange, P(1)], [18, 'গ্যাস, প্যাকেট, ডেলিভারি', C.mustard, P(2)], [32, 'হাতে থাকে', C.green, P(3)]];
  pop(g, V(P(1) - 0.2, 0.5), 540, 960, () => rect(g, X0, 940, X1 - X0, 90, '#E3DBCD'), 'x');
  let x = X0;
  parts.forEach(([amt, n, c, d], i) => { const v = V(d + 0.1, 0.6); const w = amt * sc; if (v > 0) { rect(g, x, 940, w * eo(v), 90, c); g.globalAlpha = clamp(v * 2); txt(g, '₹' + bnd(Math.round(amt * eo(v))), x + w / 2, 1000, F.bn(44, 700), C.cream, 'center'); txt(g, n, x + w / 2, 1090 + (i % 2) * 44, F.bn(28, 600), C.ink, 'center'); g.globalAlpha = 1; } x += w; });
  pop(g, V(P(3) + 0.6), 760, 1230, () => { coin(g, 700, 1230, 40); coin(g, 790, 1220, 40); txt(g, '× ২৬ দিন', 860, 1240, F.bn(32, 700), C.ink); });
};
ART.S08 = (g, lt, V, P, t) => {
  ground(g, 1300, V(0.2, 0.7));
  const bx = lerp(-260, 1300, ss(P(0) + 0.3, P(0) + 6, lt)), wobble = lt > P(2) ? Math.sin(lt * 9) * 0.03 : 0;
  if (V(P(0) + 0.2) > 0) { g.save(); g.translate(bx, 1300); g.rotate(wobble); g.translate(-bx, -1300); bicycle(g, bx, 1300, 1.0, lt * 7, t, 4); sujoy(g, bx + 10, 1170, 0.72, { t, walk: null, armL: -1.2, armR: -1.1, mouth: lt > P(2) ? 'sad' : 'smile' }); g.restore(); }
  pop(g, V(P(0) + 0.4), 240, 560, () => { bigNum(g, bnd(lt > P(1) + 1.6 ? 9 : 12) + ' জন গ্রাহক', 260, 560, 52, lt > P(1) + 1.6 ? C.red : C.ink); });
  for (let i = 0; i < 12; i++) { const gone = i >= 9 ? ss(P(1) + 1.0 + (i - 9) * 0.3, P(1) + 1.5 + (i - 9) * 0.3, lt) : 0; pop(g, V(P(0) + 0.6 + i * 0.06) * (1 - gone), 100 + i * 46, 640, () => { circ(g, 100 + i * 70 * 0.66, 630, 14, C.ink); rrect(g, 100 + i * 70 * 0.66 - 14, 646, 28, 30, 8, C.ink); }); }
  pop(g, V(P(1) + 0.2), 820, 620, () => { rrect(g, 790, 560, 60, 90, 14, C.cream); rect(g, 790, 560, 60, 22, C.gray); for (let i = 0; i < 3; i++) circ(g, 805 + i * 15, 571, 3, C.ink); tag(g, 820, 700, 'নুন বেশি', C.red, C.cream, 30); });
  rain(g, t, V(P(2), 0.6) * (lt < P(3) + 1 ? 1 : 0.4));
  pop(g, V(P(3) + 0.2), 540, 820, () => tag(g, 540, 820, 'লাভ মাত্র ₹৭,০০০', C.red, C.cream, 46));
};
ART.S09 = (g, lt, V, P, t) => {
  pop(g, V(0.3), 300, 1000, () => phone(g, 300, 1000, 1.6));
  for (let i = 0; i < 4; i++) pop(g, V(P(0) + 0.6 + i * 0.4), 300, 760, () => { rrect(g, 190, 760 + i * 70, 220, 56, 12, i % 2 ? C.orange : C.red); txt(g, 'নতুন অর্ডার', 300, 798 + i * 70, F2(26), C.cream, 'center'); });
  const fadeChat = 1 - clamp((lt - P(3)) / 0.5);
  if (fadeChat > 0) { g.save(); g.globalAlpha *= fadeChat;
  pop(g, V(P(1) + 0.2), 760, 800, () => { const u = eo((lt - P(1) - 0.3) / 1); circ(g, 760, 800, 150, C.green); g.fillStyle = C.red; g.beginPath(); g.moveTo(760, 800); g.arc(760, 800, 150, -Math.PI / 2, -Math.PI / 2 + TAU * 0.3 * u); g.closePath(); g.fill(); txt(g, '১৮–৩০%', 760, 812, F.bn(46, 700), C.cream, 'center'); tag(g, 760, 1000, '+ জিএসটি', C.ink, C.cream, 32); });
  pop(g, V(P(2) + 0.2), 760, 1180, () => { coin(g, 640, 1180, 50); txt(g, '₹১০০ →', 740, 1196, F.bn(40, 700), C.ink); tag(g, 900, 1180, '< ₹১০', C.red, C.cream, 40); });
  g.restore(); }
  if (V(P(3)) > 0) { g.save(); g.globalAlpha = clamp((lt - P(3)) / 0.5) * 0.55; rect(g, 100, 720, 400, 560, C.paper); g.restore(); pop(g, V(P(3) + 0.4), 760, 760, () => chatBubbles(g, 760, 640, clamp((lt - P(3) - 0.4) / 1.5)), 'up'); }
};
ART.S10 = (g, lt, V, P, t) => {
  ground(g, 1300, V(0.2, 0.7));
  pop(g, V(0.2), 760, 600, () => { g.save(); g.translate(760, 620); g.rotate(lt < P(0) + 2.5 ? Math.sin(lt * 30) * 0.12 : 0); phone(g, 0, 0, 0.9); g.restore(); if (lt < P(0) + 2.5) for (let k = 0; k < 3; k++) { g.strokeStyle = C.red; g.lineWidth = 6; g.globalAlpha = 0.7 - k * 0.2; g.beginPath(); g.arc(760, 560, 120 + k * 26, -0.9, -0.3); g.stroke(); g.beginPath(); g.arc(760, 560, 120 + k * 26, Math.PI + 0.3, Math.PI + 0.9); g.stroke(); g.globalAlpha = 1; } });
  pop(g, V(P(1)), 200, 520, () => { circ(g, 200, 520, 46, '#F4EEDC'); circ(g, 220, 506, 40, C.paper); });
  mita(g, 300, 1300, 0.95, { t, armR: lt > P(1) ? -1.3 + Math.sin(lt * 6) * 0.3 : undefined, mouth: 'smile' });
  sujoy(g, 470, 1300, 0.95, { t, armR: lt > P(1) ? -1.2 + Math.cos(lt * 6) * 0.3 : undefined });
  const n = Math.round(50 * eo((lt - P(1) - 0.3) / 3.5));
  if (V(P(1) + 0.3) > 0) { for (let i = 0; i < n; i++) { const cx = 620 + (i % 10) * 38, cy = 1290 - Math.floor(i / 10) * 34; rrect(g, cx - 16, cy - 28, 32, 28, 5, i % 2 ? C.mustard : C.orange); } bigNum(g, bnd(n) + ' বক্স', 790, 980, 52, C.ink); }
  pop(g, V(P(2) + 0.2), 300, 800, () => tag(g, 300, 800, '+২০ মাসিক প্ল্যান', C.green, C.cream, 40));
  for (let i = 0; i < 4; i++) pop(g, V(P(3) + 0.3 + i * 0.4), 0, 0, () => { const x = 160 + i * 230; circ(g, x, 680, 30, [C.orange, C.blue, C.teal, C.red][i]); if (i < 3) { g.setLineDash([8, 10]); stroke(g, [[x + 40, 680], [x + 190, 680]], C.ink, 4); g.setLineDash([]); } rrect(g, x - 40, 600, 80, 44, 14, C.cream); txt(g, '...', x, 630, F2(30), C.ink, 'center'); });
};
ART.S11 = (g, lt, V, P, t) => {
  const R = rng(8);
  for (let i = 0; i < 15; i++) { const x = 180 + (i % 5) * 180, y = 760 + Math.floor(i / 5) * 170; const gone = (i % 2 === 1) ? ss(P(1) + R() * 2, P(1) + R() * 2 + 0.6, lt) : 0; if (gone < 1) pop(g, V(0.3 + i * 0.04) * (1 - gone), x, y, () => tiffin(g, x, y, 0.8)); if (gone > 0.5) { g.globalAlpha = (gone - 0.5) * 2 * V(0); txt(g, '?', x, y - 50, F.bn(60, 700), C.red, 'center'); g.globalAlpha = 1; } }
  pop(g, V(P(1) + 2.2), 540, 1170, () => tag(g, 540, 1170, '−৩০ টিফিন = −₹১০,৫০০', C.red, C.cream, 42));
  pop(g, V(P(2) + 0.2), 540, 560, () => { rect(g, 380, 470, 320, 180, C.cream); txt(g, 'হোস্টেল: বাকি', 540, 530, F2(32), C.ink, 'center'); bigNum(g, '₹ ? ? ?', 540, 610, 54, C.red); });
  pop(g, V(P(3) + 0.2), 300, 1300, () => { coin(g, 220, 1300, 54, C.green); txt(g, '₹৩০০ জমা', 300, 1314, F.bn(40, 700), C.ink); });
  pop(g, V(P(3) + 1.4), 820, 1300, () => calendar(g, 820, 1290, 0.75, 'অগ্রিম', '১ তারিখ', C.blue));
};
ART.S12 = (g, lt, V, P, t) => {
  ground(g, 1300, V(0.2, 0.7));
  pop(g, V(0.3, 0.6), 720, 1300, () => counter(g, 430, 1010, 1300), 'y');
  pop(g, V(0.5), 560, 1134, () => stove(g, 560, 1134, 0.75, t)); pop(g, V(0.6), 760, 1134, () => pot(g, 760, 1134, 0.7)); pop(g, V(0.7), 930, 1134, () => { for (let i = 0; i < 3; i++) tiffin(g, 880 + i * 46, 1134, 0.42); });
  steam(g, 760, 1030, t, 3);
  mita(g, 730, 1300, 0.92, { t, cap: true, gloves: true, armR: -1.4 + Math.sin(lt * 5) * 0.3 });
  [[560, C.green], [910, C.purple]].forEach(([x, c], i) => { if (V(P(1) + 0.2 + i * 0.4) > 0) { const w = walkIn(lt, P(1) + 0.2 + i * 0.4, 1.0, 1200, x); mita(g, w.x, 1300, 0.85, { t, saree: c, blouse: C.mustard, cap: true, walk: w.walking ? lt * 8 : null, armR: w.walking ? undefined : -1.3 + Math.cos(lt * 5 + i) * 0.3 }); } });
  pop(g, V(P(0) + 0.3), 540, 560, () => tag(g, 540, 560, bnd(Math.round(90 * eo((lt - P(0) - 0.3) / 1.5))) + ' টিফিন / দিন', C.blue, C.cream, 50));
  pop(g, V(P(1) + 1.2), 540, 680, () => tag(g, 540, 680, '₹৬,০০০ × ২', C.ink, C.cream, 38));
  if (V(P(2)) > 0) { const s = walkIn(lt, P(2), 2.0, -400, 200); scooter(g, s.x, 1300, 0.85, lt * 8); sujoy(g, s.x - 10, 1202, 0.66, { t, armL: -1.3, armR: -1.2 }); pop(g, V(P(2) + 1.4), 200, 900, () => tag(g, 200, 900, '₹৩৫,০০০', C.red, C.cream, 36)); }
};
const COST_T = [['বাজার', 98280, C.orange, 2], ['গ্যাস, প্যাকেট', 18720, C.mustard, 2], ['দুজনের বেতন', 12000, C.red, 3], ['তেল, অন্যান্য', 9000, C.blue, 3]];
ART.S13 = (g, lt, V, P, t) => {
  const X0 = 120, X1 = 960, rev = 215280, sx = (X1 - X0) / rev;
  pop(g, V(P(1) + 0.2, 0.7), X0, 520, () => { rect(g, X0, 470, X1 - X0, 100, C.green); txt(g, 'বিক্রি', X0, 448, F.bn(34, 700), C.ink); txt(g, '২,৩৪০ টিফিন × ₹৯২', X1, 448, F.bn(30, 600), C.ink, 'right'); bigNum(g, inr(Math.round(rev * eo((lt - P(1) - 0.2) / 1.4) / 100) * 100), 540, 538, 54, C.cream); }, 'x');
  let used = 0;
  COST_T.forEach(([n, amt, c, k], i) => { const d = P(k) + 0.15 + (i % 2) * 1.2, v = V(d, 0.7); if (v <= 0) { used += amt; return; } const x = X0 + used * sx, w = amt * sx, y = 640 + i * 130, drop = eo(v);
    g.globalAlpha = 0.25; rect(g, x, 470, w, 100, C.ink); g.globalAlpha = 1; rect(g, x, lerp(470, y, drop), w, 90, c);
    g.globalAlpha = clamp(v * 2); txt(g, n, X0, y + 110, F.bn(28, 600), C.ink); txt(g, '−' + inr(amt), X1, y + 110, F.bn(34, 700), c, 'right'); g.globalAlpha = 1; used += amt; });
  pop(g, V(P(4) + 0.1), 540, 1190, () => { txt(g, 'মোট খরচ', X0, 1200, F.bn(34, 700), C.ink); txt(g, '−' + inr(138000), X1, 1200, F.bn(40, 700), C.red, 'right'); });
  pop(g, V(P(5) + 0.1), 540, 1300, () => { const px = X0 + 138000 * sx; rect(g, px, 1230, X1 - px, 100, C.green); txt(g, 'লাভ', X0, 1300, F.bn(48, 700), C.ink); bigNum(g, '≈ ' + inr(Math.round(77280 * eo((lt - P(5) - 0.1) / 1.4) / 100) * 100), (px + X1) / 2, 1300, 46, C.cream); });
};
ART.S14 = (g, lt, V, P, t) => {
  pop(g, V(P(1) + 0.1), 300, 620, () => { officeBld(g, 160, 760, 280, 300, C.marble); g.save(); g.globalAlpha *= 0.6; rect(g, 160, 460, 280, 300, C.paper); g.restore(); tag(g, 300, 800, 'হোস্টেল ফাঁকা', C.ink, C.cream, 30); });
  pop(g, V(P(1) + 0.6), 760, 620, () => { const u = eo((lt - P(1) - 0.8) / 1.2); const h1 = 300, h2 = lerp(300, 200, u); rect(g, 620, 760 - h1, 110, h1, C.gray); rect(g, 790, 760 - h2, 110, h2, C.orange); txt(g, '৯০', 675, 740 - h1, F.bn(40, 700), C.ink, 'center'); txt(g, bnd(Math.round(lerp(90, 60, u))), 845, 740 - h2, F.bn(40, 700), C.orange, 'center'); });
  pop(g, V(P(2) + 0.1), 300, 1040, () => { poly(g, [[140, 1140], [300, 940], [460, 1140]], C.red); rect(g, 170, 1140, 260, 160, C.mustard); arch(g, 260, 1180, 80, 120, C.ink); for (let i = 0; i < 9; i++) poly(g, [[130 + i * 38, 1140], [168 + i * 38, 1140], [149 + i * 38, 1172]], [C.green, C.pink, C.blue][i % 3]); });
  pop(g, V(P(3) + 0.2), 760, 1150, () => { thali(g, 760, 1150, 130, t); tag(g, 760, 1340, 'পুজোর স্পেশাল থালি', C.terra, C.cream, 34); });
};
const MONTHS_T = [4, 7, 9, 18, 30, 45, 60, 72, 80, 95, 55, 77];
ART.S15 = (g, lt, V, P, t) => {
  const X0 = 140, X1 = 940, Y0 = 820, sy = 3.0, bw = (X1 - X0) / 12;
  pop(g, V(0.3, 0.6), 540, Y0, () => rect(g, X0 - 10, Y0, X1 - X0 + 20, 4, C.ink), 'x');
  MONTHS_T.forEach((m, i) => pop(g, V(0.4 + i * 0.12, 0.5), X0 + i * bw + bw / 2, Y0, () => { const h = m * sy; rect(g, X0 + i * bw + 8, Y0 - h, bw - 16, h, i < 3 ? C.gray : i === 9 ? C.orange : C.green); txt(g, bnd(i + 1), X0 + i * bw + bw / 2, Y0 + 40, F.mono(20), C.ink, 'center'); }, 'y'));
  pop(g, V(0.8), X0 + 1.5 * bw, 700, () => { g.strokeStyle = C.ink; g.lineWidth = 2; g.setLineDash([6, 8]); g.strokeRect(X0, 520, bw * 3, 320); g.setLineDash([]); txt(g, 'প্রথম ৩ মাস', X0 + 1.5 * bw, 548, F.bn(26, 600), C.ink, 'center'); });
  pop(g, V(P(1) + 0.2), 260, 1100, () => { coinStack(g, 200, 1170, 9); txt(g, '₹৪২,০০০ ফেরত', 260, 1000, F.bn(36, 700), C.green, 'center'); });
  pop(g, V(P(1) + 1.0), 620, 1170, () => scooter(g, 620, 1180, 0.7, 0));
  pop(g, V(P(2) + 0.2), 880, 1180, () => sujoy(g, 880, 1180, 0.7, { t, hold: (gg) => { rect(gg, -20, 0, 40, 50, C.cream); rect(gg, -14, 10, 28, 4, C.ink); rect(gg, -14, 22, 20, 4, C.ink); } }), 'up');
};
ART.S16 = (g, lt, V, P, t) => {
  ground(g, 1282, V(0.2, 0.7));
  const m = walkIn(lt, 0.2, 1.3, -160, 420); mita(g, m.x, 1282, 1.15, { t, walk: m.walking ? lt * 8 : null, armR: m.walking ? undefined : -2.5 + Math.sin(lt * 6) * 0.3, mouth: 'smile' });
  const s = walkIn(lt, 0.4, 1.3, 1240, 680); sujoy(g, s.x, 1282, 1.15, { t, face: -1, walk: s.walking ? lt * 8 : null, hold: (gg) => tiffin(gg, 0, 44, 0.55) });
  pop(g, V(1.4), 880, 1282, () => { for (let i = 0; i < 3; i++) tiffin(g, 860 + i * 44, 1282, 0.5); });
  pop(g, V(P(1) + 0.1), 540, 640, () => bubbleSay(g, 540, 640, 560, 120, 'কোন ব্যবসা? কমেন্টে লিখুন', C.orange, 0));
};

function ambient(g, t, si, v) {
  if (v <= 0) return;
  g.save(); g.globalAlpha *= v * 0.9;
  const cl = (x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s); rrect(g, -70, -18, 140, 36, 18, '#F4EEE2'); circ(g, -20, -22, 30, '#F4EEE2'); circ(g, 22, -14, 22, '#F4EEE2'); g.restore(); };
  cl(((t * 14 + si * 300) % 1400) - 180, 470, 1.1); cl(((t * 9 + si * 520 + 700) % 1400) - 180, 560, 0.8);
  const bx = ((t * 40 + si * 211) % 1600) - 300;
  for (let i = 0; i < 3; i++) { const x = bx + i * 46, y = 520 + i * 18 + Math.sin(t * 2 + i) * 6, f = Math.sin(t * 9 + i) * 7; g.strokeStyle = C.ink; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 14, y - f); g.quadraticCurveTo(x - 6, y - 8, x, y); g.quadraticCurveTo(x + 6, y - 8, x + 14, y - f); g.stroke(); }
  g.restore();
}
// ---------------------------------------------------------------- textures
let GRAIN, SPECK, PAPER, LAYER;
function textures() {
  if (PAPER) return;
  const mk = (w, h) => { const c = new OffscreenCanvas(w, h); return [c, c.getContext('2d')]; };
  let x;
  [GRAIN, x] = mk(512, 512); { const im = x.createImageData(512, 512), R = rng(7); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (R() - 0.5) * 110; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); }
  [SPECK, x] = mk(512, 512); { const R = rng(11); for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(0,0,0,${0.25 + R() * 0.7})`; x.beginPath(); x.arc(R() * 512, R() * 512, 0.6 + R() * 1.8, 0, TAU); x.fill(); } }
  [PAPER, x] = mk(W, H); {
    x.fillStyle = C.paper; x.fillRect(0, 0, W, H); const R = rng(3);
    for (let i = 0; i < 90; i++) { const gx = R() * W, gy = R() * H, r = 80 + R() * 260; const gr = x.createRadialGradient(gx, gy, 0, gx, gy, r); const a = (R() - 0.5) * 0.06; gr.addColorStop(0, a > 0 ? `rgba(255,252,245,${a})` : `rgba(150,130,100,${-a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(gx - r, gy - r, 2 * r, 2 * r); }
    x.globalAlpha = 0.07; x.strokeStyle = '#6B5B45';
    for (let i = 0; i < 500; i++) { const fx = R() * W, fy = R() * H, a = R() * TAU, L = 6 + R() * 20; x.lineWidth = 0.6 + R(); x.beginPath(); x.moveTo(fx, fy); x.lineTo(fx + Math.cos(a) * L, fy + Math.sin(a) * L); x.stroke(); }
    x.globalAlpha = 1;
  }
  [LAYER] = mk(W, H);
}

// ---------------------------------------------------------------- frame furniture
const EXIT = 0.6;
function makeV(sc, lt, last) {
  const len = sc.b - sc.a;
  return (d, dur = 0.55) => {
    const inU = clamp((lt - d) / dur);
    if (last === 'hold') return inU;
    if (last) return inU * (1 - ss(len - 1.0, len - 0.2, lt));
    return inU;
  };
}
const DOTS = [C.orange, C.mustard, C.blue, C.ink];
function labels(g, sc, V) {
  const a = V(0.1, 0.5);
  g.globalAlpha = a; g.font = F.mono(24); g.fillStyle = C.ink;
  [...sc.label, `/ ${String(sc.n).padStart(2, '0')}`].forEach((s, i) => g.fillText(s, 70, 110 + i * 34));
  rect(g, 70, 222, 40 * a, 2, C.ink);
  g.fillText('PACKAGED', 70, 1790); g.fillText('DRINKING WATER', 70, 1824); rect(g, 70, 1850, 40 * a, 2, C.ink);
  g.textAlign = 'right'; g.fillText(`CH. ${String(sc.n).padStart(2, '0')} / 16`, 1010, 1790); g.fillText('JAL_BYABSA', 1010, 1824); g.textAlign = 'left'; rect(g, 1010 - 40 * a, 1850, 40 * a, 2, C.ink);
  g.globalAlpha = 1;
  DOTS.forEach((c, i) => pop(g, V(0.3 + i * 0.08, 0.4), 1000, 100 + i * 44, () => circ(g, 1000, 100 + i * 44, 13, c)));
  // progress ticks (which chapter)
  for (let i = 0; i < 16; i++) rect(g, 300 + i * 34, 1872, 24, 4, i < sc.n ? C.ink : 'rgba(31,29,27,0.18)');
}
function wrap(g, s, maxW) { const out = []; let cur = ''; for (const w of s.split(' ')) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; }
// hand-drawn pen stroke under the headline: a tapered, slightly wavy ink line drawn on left→right
function penLine(g, cx, y, w, u, seed, col = C.orange) {
  if (u <= 0) return;
  const R = rng(seed), n = 40, pts = [];
  const a1 = R() * 6, a2 = R() * 6, tilt = (R() - 0.5) * 10;
  for (let i = 0; i <= n; i++) { const k = i / n; pts.push([cx - w / 2 + w * k, y + Math.sin(k * 5 + a1) * 3.5 + Math.sin(k * 13 + a2) * 1.6 + tilt * (k - 0.5)]); }
  const m = Math.max(2, Math.round(n * clamp(u)));
  const th = k => 7.5 * Math.sin(Math.PI * Math.min(1, k * 1.15)) ** 0.6 + 0.8;
  g.fillStyle = col; g.beginPath();
  for (let i = 0; i <= m; i++) { const [x, yy] = pts[i]; g.lineTo(x, yy - th(i / n)); }
  for (let i = m; i >= 0; i--) { const [x, yy] = pts[i]; g.lineTo(x, yy + th(i / n) * 0.7); }
  g.closePath(); g.fill();
  // little flick at the end
  if (u > 0.95) { const [x, yy] = pts[n]; g.beginPath(); g.moveTo(x - 4, yy - 4); g.quadraticCurveTo(x + 22, yy - 16, x + 30, yy - 34); g.lineTo(x + 26, yy - 34); g.quadraticCurveTo(x + 16, yy - 14, x - 6, yy + 2); g.fill(); }
}
// paper-cut caption strip: cream paper with cut/torn edges, shadow and a bit of tape
function paperStrip(g, cx, cy, w, h, seed, fill = '#FBF7EE') {
  const R = rng(seed), pts = [];
  const step = 26;
  for (let x = -w / 2; x <= w / 2; x += step) pts.push([x, -h / 2 + (R() - 0.5) * 9]);
  for (let y = -h / 2; y <= h / 2; y += step) pts.push([w / 2 + (R() - 0.5) * 7, y]);
  for (let x = w / 2; x >= -w / 2; x -= step) pts.push([x, h / 2 + (R() - 0.5) * 9]);
  for (let y = h / 2; y >= -h / 2; y -= step) pts.push([-w / 2 + (R() - 0.5) * 7, y]);
  g.save(); g.translate(cx, cy);
  g.save(); g.translate(8, 10); poly(g, pts, 'rgba(60,40,20,0.22)'); g.restore();
  poly(g, pts, fill);
  g.save(); g.translate(-w / 2 + 70, -h / 2 + 2); g.rotate(-0.35); rect(g, -50, -16, 100, 32, 'rgba(227,162,50,0.75)'); g.restore();
  g.restore();
}
function captions(g, sc, t, V) {
  // headline (top) with a pen stroke under it
  const tv = V(0.25, 0.6);
  if (tv > 0) {
    g.save(); g.globalAlpha *= clamp(tv * 2); g.font = F.head(sc.title.length > 14 ? 76 : 88); const tw = g.measureText(sc.title).width;
    txt(g, sc.title, 540, 330 + (1 - eo(tv)) * 24, F.head(sc.title.length > 14 ? 76 : 88), C.ink, 'center');
    penLine(g, 540, 372, Math.min(820, tw * 0.9 + 60), clamp((t - sc.a - 0.45) / 0.55), sc.n * 7);
    g.restore();
  }
  // captions: short lines (as many words as fit the paper-cut box), each word typed in as it is spoken
  const offs = PARTS[sc.id]; if (!offs) return;
  const CH = chunksFor(g, sc);
  let ci = -1; CH.forEach((c, i) => { if (t >= c.t0) ci = i; });
  if (ci < 0) return;
  const vis = V(0, 0.01);
  if (vis <= 0) return;
  const ACC = [C.orange, C.blue, C.mustard, C.teal, C.red, C.green], acc = ACC[(sc.n - 1) % ACC.length];
  const draw1 = (c, wus, inU) => {
    // width = words spoken so far (the newest one eases in), the paper grows with it and reveals the word
    const vw = c.words.reduce((a, wd, j) => a + (wd.w + (j ? c.sp : 0)) * wus[j], 0);
    const e = back(inU, 1.5);
    g.save(); g.globalAlpha *= vis;
    g.translate(540, 1478 + (1 - e) * 30 + Math.sin(TNOW * 2.2) * 2); g.rotate(c.rot + (1 - e) * 0.05); g.scale(lerp(0.9, 1, e), lerp(0.75, 1, e));
    paperCut(g, vw + 92, 112, c.seed, acc);
    g.beginPath(); g.rect(-vw / 2 - 10, -64, vw + 20, 128); g.clip();
    // which word is being said right now
    let cur = -1; c.words.forEach((wd, j) => { if (wus[j] > 0) cur = j; });
    let x = -vw / 2;
    c.words.forEach((wd, j) => {
      if (wus[j] <= 0) return; if (j) x += c.sp;
      if (j === cur && ci2(c, j)) { const u = eo(clamp((TNOW - wd.t) / 0.22)); g.save(); g.globalAlpha *= 0.55; g.translate(x - 8, 30); g.transform(1, 0, -0.18, 1, 0, 0); rrect(g, 0, -36, (wd.w + 16) * u, 30, 10, C.mustard); g.restore(); }
      const pop = 1 + (1 - eo(clamp((TNOW - wd.t) / 0.2))) * 0.18;
      g.save(); g.translate(x + wd.w / 2, 14); g.scale(pop, pop); txt(g, wd.s, -wd.w / 2, 0, F.cap(52, 700), wd.hi ? (acc === C.mustard ? C.terra : acc) : C.ink); g.restore();
      x += wd.w;
    });
    g.restore();
  };
  const c = CH[ci], wus = c.words.map(wd => eo(clamp((t - wd.t) / 0.18)));
  const vw = c.words.reduce((a, wd, j) => a + (wd.w + (j ? c.sp : 0)) * wus[j], 0);
  if (vw < 60 && ci > 0 && CH[ci - 1].t0 > c.t0 - 8) draw1(CH[ci - 1], CH[ci - 1].words.map(() => 1), 1);
  else if (vw >= 2) draw1(c, wus, clamp((t - c.t0) / 0.3));
}
const ci2 = (c, j) => TNOW - c.words[j].t < 0.9;   // highlight only while the word is fresh
// two-layer paper cut: coloured paper behind, cream paper with scissor-cut edges in front
function paperCut(g, w, h, seed, acc) {
  const R = rng(seed);
  const edge = (ww, hh, j) => { const pts = []; const st = 22;
    for (let x = -ww / 2; x <= ww / 2; x += st) pts.push([x, -hh / 2 + (R() - 0.5) * j]);
    pts.push([ww / 2 + (R() - 0.5) * j, 0]);
    for (let x = ww / 2; x >= -ww / 2; x -= st) pts.push([x, hh / 2 + (R() - 0.5) * j]);
    pts.push([-ww / 2 + (R() - 0.5) * j, 0]); return pts; };
  const back = edge(w + 16, h + 14, 8), front = edge(w, h, 6);
  g.save(); g.translate(10, 12); poly(g, back, 'rgba(60,40,20,0.20)'); g.restore();
  g.save(); g.translate(6, 7); g.rotate(0.025); poly(g, back, acc); g.restore();
  poly(g, front, '#FBF7EE');
}
// split every sentence of a scene into one-line chunks and give each word a start time (proportional to its length)
const CHUNKS = {};
function chunksFor(g, sc) {
  if (CHUNKS[sc.id]) return CHUNKS[sc.id];
  g.save(); g.font = F.cap(52, 700); const sp = g.measureText(' ').width;
  const out = [], offs = PARTS[sc.id];
  sc.parts.forEach((sent, k) => {
    const p0 = sc.v + offs[k], p1 = sc.v + (k + 1 < offs.length ? offs[k + 1] - 0.3 : DUR[sc.id] - 0.1);
    const ws = sent.split(' ').filter(Boolean), wt = ws.map(w => w.length + 2), tot = wt.reduce((a, b) => a + b, 0);
    let acc = 0, cur = [];
    const flush = () => { if (!cur.length) return; const w = cur.reduce((a, x) => a + x.w, 0) + sp * (cur.length - 1); const seed = sc.n * 97 + out.length * 13; out.push({ t0: cur[0].t - 0.05, words: cur, w, sp, seed, rot: ((seed % 5) - 2) * 0.008 }); cur = []; };
    ws.forEach((w, i) => {
      const wl = WORDS[sc.id] && WORDS[sc.id][k], ww = g.measureText(w).width, wtime = wl && wl[i] != null ? sc.v + wl[i] : p0 + (p1 - p0) * acc / tot; acc += wt[i];
      const curW = cur.reduce((a, x) => a + x.w, 0) + sp * cur.length;
      if (cur.length && (curW + ww > 760 || cur.length >= 5)) flush();
      cur.push({ s: w, w: ww, t: wtime, hi: /[০-৯\d]/.test(w) || /টাকা|লাখ|হাজার/.test(w) });
      if (/[,।?!]$/.test(w) && cur.length >= 2) flush();
    });
    flush();
  });
  g.restore();
  return (CHUNKS[sc.id] = out);
}
let LAYERB = null;
// draw scene si (or the intro when si < 0) at time t into ctx; hold = keep everything on screen (outgoing scene)
function sceneInto(ctx, si, t, hold) {
  ctx.clearRect(0, 0, W, H);
  if (si < 0) { introArt(ctx, t); }
  else {
    const sc = SC[si], lt = t - sc.a, last = si === SC.length - 1, V = makeV(sc, lt, hold ? 'hold' : last);
    const P = k => LEAD + (PARTS[sc.id][Math.min(k, PARTS[sc.id].length - 1)] ?? 0);
    const len = sc.b - sc.a, cu = eio(clamp(lt / len)), mv = sc.n % 4;
    let punch = 0; PARTS[sc.id].forEach((o, i) => { if (i) { const d = lt - (LEAD + o); if (d > 0 && d < 0.7) punch = Math.max(punch, Math.sin(Math.PI * clamp(d / 0.7)) * (1 - d / 0.7 * 0.3)); } });
    const zc = 0.88 * [lerp(0.97, 1.02, cu), 1.0, lerp(1.03, 0.98, cu), 1.0][mv] * (1 + 0.016 * punch);
    const pxo = mv === 1 ? lerp(26, -26, cu) : 0, pyo = mv === 3 ? lerp(20, -20, cu) : 0;
    ctx.save(); ctx.translate(540 + pxo, 930 + pyo); ctx.scale(zc, zc); ctx.rotate(mv === 3 ? lerp(-0.006, 0.006, cu) : 0); ctx.translate(-540, -830);
    backdrop(ctx, sc.id, t, V(0.05, 0.7)); ambient(ctx, t, si, V(0.1, 0.8)); sc.art(ctx, lt, V, P, t, last); ctx.restore();
  }
  ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 0.5; const sp = ctx.createPattern(SPECK, 'repeat'); sp.setTransform(new DOMMatrix().translate(((si + 1) * 97) % 512, ((si + 1) * 61) % 512)); ctx.fillStyle = sp; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function overlay(g, si, t, hold) {   // headline + caption for scene si (intro has its own headline)
  if (si < 0) { introText(g, t); return; }
  const sc = SC[si]; captions(g, sc, t, makeV(sc, t - sc.a, hold ? 'hold' : si === SC.length - 1));
}
const TR = 0.75;
export function draw(g, t) {
  textures(); TNOW = t;
  if (!LAYERB) LAYERB = new OffscreenCanvas(W, H);
  g.drawImage(PAPER, 0, 0);
  let si = -1; SC.forEach((s, i) => { if (t >= s.a) si = i; });
  const start = si < 0 ? 0 : SC[si].a, u = si < 0 ? 1 : eio(clamp((t - start) / TR));
  if (u < 1) {   // outgoing: drifts left, shrinks a touch and fades
    sceneInto(LAYERB.getContext('2d'), si - 1, t, true);
    g.save(); g.globalAlpha = 1 - u; g.translate(540 - 110 * u, 960); g.scale(1 - 0.04 * u, 1 - 0.04 * u); g.translate(-540, -960); g.drawImage(LAYERB, 0, 0); overlay(g, si - 1, t, true); g.restore();
  }
  sceneInto(LAYER.getContext('2d'), si, t, false);
  g.save(); g.globalAlpha = u; g.translate(110 * (1 - u), 0); g.drawImage(LAYER, 0, 0); g.restore();
  g.save(); g.globalAlpha = u; overlay(g, si, t, false); g.restore();
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.11;
  const gp = g.createPattern(GRAIN, 'repeat'); gp.setTransform(new DOMMatrix().translate(-Math.floor((t * 24 * 37) % 512), -Math.floor((t * 24 * 53) % 512))); g.fillStyle = gp; g.fillRect(0, 0, W, H); g.restore();
  const fade = ss(DURATION - 0.9, DURATION, t);
  if (fade > 0) { g.fillStyle = `rgba(236,229,216,${fade})`; g.fillRect(0, 0, W, H); }
}

// animated cover (first ~2 s): Rahul with the jar business and the hook headline
function introArt(L, t) {
  backdrop(L, 'INTRO', t, 1);
  const row = (n, y, x0, r) => { for (let i = 0; i < n; i++) { const b = Math.abs(Math.sin(t * 3 + i + r)) * 7; tiffin(L, x0 + i * 100, y - b * (r ? 1 : 0), 0.95, { label: i % 2 === 0 }); } };
  row(4, 1480, 640, 0); row(3, 1352, 690, 1); row(2, 1224, 740, 2); row(1, 1096, 790, 3);
  rect(L, 0, 1480, W, 6, C.ink);
  mita(L, 400, 1480, 1.85, { t: t + 0.3, armR: -2.1 + Math.sin(t * 4) * 0.12, armL: 0.2, mouth: 'smile', hold: (gg) => { gg.rotate(2.1); tiffin(gg, 0, 70, 0.75, { label: 1 }); } });
  L.save(); L.translate(870, 760); L.rotate(0.12 + Math.sin(t * 2.5) * 0.06); const k = 1 + Math.sin(t * 5) * 0.04; L.scale(k, k);
  L.fillStyle = C.mustard; L.beginPath(); for (let i = 0; i < 28; i++) { const r = i % 2 ? 150 : 178, a = i * TAU / 28 + t * 0.3; L.lineTo(Math.cos(a) * r, Math.sin(a) * r); } L.closePath(); L.fill();
  txt(L, 'মাসে', 0, -40, F.bn(40, 700), C.ink, 'center'); txt(L, '₹৭৭,০০০', 0, 30, F.bn(64, 700), C.ink, 'center'); txt(L, 'লাভ?', 0, 88, F.bn(40, 700), C.ink, 'center');
  L.restore();
}
function introText(g, t) {
  txt(g, '₹৪২ হাজারে', 540, 400, F.head(104), C.ink, 'center');
  txt(g, 'রান্নাঘর থেকে ব্যবসা', 540, 525, F.head(104), C.terra, 'center');
  penLine(g, 540, 572, 600, clamp(0.35 + t / 0.8), 5);
}

export function events() {
  const ev = [];
  SC.forEach(sc => ev.push({ t: sc.a + 0.05, k: 'whoosh' }));
  const S = id => SC.find(s => s.id === id), at = (id, k, d) => S(id).v + PARTS[id][k] + d;
  ev.push({ t: at('S10', 0, 0.3), k: 'bell' });
  return ev.sort((a, b) => a.t - b.t);
}

export function thumb(g) {
  textures(); TNOW = 0;
  g.drawImage(PAPER, 0, 0);
  const L = LAYER.getContext('2d'); L.clearRect(0, 0, W, H);
  introArt(L, 0.5);
  L.save(); L.globalCompositeOperation = 'destination-out'; L.globalAlpha = 0.45; L.fillStyle = L.createPattern(SPECK, 'repeat'); L.fillRect(0, 0, W, H); L.restore();
  g.drawImage(LAYER, 0, 0);
  introText(g, 1);
  tag(g, 540, 1760, 'একজন মায়ের ব্যবসার পুরো হিসেব', C.ink, C.cream, 44);
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.11; g.fillStyle = g.createPattern(GRAIN, 'repeat'); g.fillRect(0, 0, W, H); g.restore();
}
