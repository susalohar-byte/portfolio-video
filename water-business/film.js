// "রাহুলের জলের ব্যবসা" — a packaged-drinking-water business story in the geometric "digital postcard" style.
// 1080×1920, 24 fps. Scene timing follows the voice durations (voice/dur.json); draw(g, t) is pure.
export const W = 1080, H = 1920, FPS = 24;
export let DURATION = 300;
const LEAD = 0.55, GAP = 0.85, INTRO = 1.9;   // visual lead before each voice line, gap between lines
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
const BACK = {
  S01: ['arch', PAL.peach, 540, 1282, 640, 820], S02: ['blob', PAL.lilac, 520, 930, 380], S03: ['round', PAL.butter, 540, 900, 820, 760],
  S04: ['arch', PAL.lilac, 540, 1330, 760, 860], S05: ['round', PAL.mint, 540, 840, 900, 980], S06: ['blob', PAL.butter, 540, 860, 400],
  S07: ['round', PAL.sky, 540, 900, 900, 860], S08: ['blob', PAL.blush, 560, 960, 400], S09: ['arch', PAL.mint, 540, 1180, 820, 780],
  S10: ['blob', PAL.lilac, 540, 880, 410], S11: ['arch', PAL.sand, 470, 1330, 700, 800], S12: ['wave', PAL.mint, 540, 860, 960, 700],
  S13: ['round', PAL.peach, 540, 880, 900, 900], S14: ['split', PAL.peach, 540, 830, 920, 760], S15: ['arch', PAL.butter, 540, 1180, 860, 860],
  S16: ['blob', PAL.peach, 540, 960, 420], INTRO: ['arch', PAL.peach, 600, 1480, 700, 900],
};
function backdrop(g, key, t, v) {
  const b = BACK[key]; if (!b || v <= 0) return;
  const [kind, col, x, y] = b, k = eo(v);
  g.save(); g.globalAlpha *= clamp(v * 1.5);
  if (kind === 'blob') {
    const r = b[4] * lerp(0.6, 1, k); g.fillStyle = col; g.beginPath();
    for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU, rr = r * (1 + 0.07 * Math.sin(a * 3 + t * 0.9) + 0.05 * Math.sin(a * 5 - t * 1.3)); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.92); }
    g.closePath(); g.fill();
  } else if (kind === 'arch') {
    const w = b[4] * lerp(0.8, 1, k), h = b[5] * k * (1 + Math.sin(t * 1.2) * 0.006);
    g.fillStyle = col; g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - h + w / 2); g.arc(x, y - h + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, y); g.closePath(); g.fill();
  } else if (kind === 'round') {
    const w = b[4] * lerp(0.85, 1, k), h = b[5] * lerp(0.85, 1, k);
    g.translate(x, y); g.rotate(Math.sin(t * 0.5) * 0.012); rrect(g, -w / 2, -h / 2, w, h, 90, col);
  } else if (kind === 'wave') {
    const w = b[4], h = b[5] * k; g.fillStyle = col; g.beginPath(); g.moveTo(x - w / 2, y + h / 2);
    for (let i = 0; i <= 40; i++) { const u = i / 40; g.lineTo(x - w / 2 + w * u, y - h / 2 + Math.sin(u * 7 + t * 1.2) * 22); }
    g.lineTo(x + w / 2, y + h / 2); g.closePath(); g.fill();
  } else if (kind === 'split') {
    rrect(g, x - b[4] / 2, y - b[5] / 2 - 30, b[4], b[5] / 2, 70, PAL.peach); rrect(g, x - b[4] / 2, y + 20, b[4], b[5] / 2, 70, PAL.sky);
  }
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
ART.S01 = (g, lt, V, P, t) => {
  
  const HS = [[80, 160, 230, C.pink, C.terra], [250, 140, 300, C.mustard, C.red], [400, 170, 220, C.marble, C.teal], [580, 150, 280, C.pink, C.navy], [740, 180, 240, C.mustard, C.terra]];
  HS.forEach(([x, w, h, c, r], i) => pop(g, V(0.4 + i * 0.1, 0.6), x + w / 2, 1282, () => house(g, x, 1282, w, h, c, r), 'y'));
  ground(g, 1282, V(0.5, 0.7));
  const wx = lerp(-120, 540, eio((lt - 0.8) / 2.6)), walking = lt > 0.8 && lt < 3.4;
  rahul(g, wx, 1280, 1.15, { walk: walking ? lt * 7 : null, t, armR: lt > P(1) ? -0.4 : 0, hold: lt > P(1) ? (gg) => {} : null });
  // pocket money + plan bubble
  pop(g, V(P(1) + 0.2), 160, 1280, () => { coinStack(g, 160, 1280, Math.max(1, Math.round(8 * eo((lt - P(1) - 0.2) / 1.2)))); tag(g, 160, 1110, '₹৩ লাখ', C.ink, C.cream, 38); });
  pop(g, V(P(1) + 0.9), 760, 760, () => { circ(g, 650, 1000, 16, C.cream); circ(g, 690, 940, 24, C.cream); rrect(g, 600, 640, 360, 250, 120, C.cream); txt(g, 'প্ল্যান', 780, 730, F.bn(40, 600), C.ink, 'center'); bigNum(g, '₹১১ লাখ', 780, 820, 66, C.blue); });
};
ART.S02 = (g, lt, V, P, t) => {
  frame(g, 0, V, 540, 820, 400);
  ground(g, 1150, V(0.2, 0.7));
  pop(g, V(0.3, 0.6), 280, 1150, () => tubewell(g, 280, 1150, 1.4, lt, lt < P(1)), 'y');
  const rust = ss(P(0) + 1.4, P(0) + 3.6, lt);
  pop(g, V(0.8), 430, 1150, () => { poly(g, [[350, 1000], [510, 1000], [490, 1150], [370, 1150]], C.gray); poly(g, [[358, 1020], [502, 1020], [486, 1130], [374, 1130]], mixc(C.sky, C.rust, rust)); rect(g, 344, 992, 172, 14, C.ink); });
  if (lt > P(0) + 0.6 && lt < P(1)) { const dy = ((lt * 2) % 1) * 90; circ(g, 410, 945 + dy, 9, mixc(C.sky, C.rust, rust)); }
  pop(g, V(P(0) + 2.2), 430, 880, () => tag(g, 430, 880, 'আয়রন', C.rust, C.cream, 38));
  // brand jar, far away + expensive
  pop(g, V(P(1) + 0.1), 800, 1040, () => { jar(g, 800, 1150, 1.4, { c: C.sky, label: 1 }); tag(g, 800, 900, '₹ ₹ ₹', C.red, C.cream, 40); });
  // the idea
  pop(g, V(P(2) + 0.1), 540, 600, () => { circ(g, 600, 740, 60, C.mustard); rect(g, 582, 792, 36, 26, C.ink); for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + lt * 0.4; stroke(g, [[600 + Math.cos(a) * 80, 740 + Math.sin(a) * 80], [600 + Math.cos(a) * 104, 740 + Math.sin(a) * 104]], C.mustard, 8); } });
  if (V(P(2) + 0.2) > 0) { const u = eio((lt - P(2) - 0.2) / 1.3), wx = lerp(1180, 600, u); rahul(g, wx, 1150, 0.9, { t, face: -1, walk: u < 1 ? lt * 8 : null, armR: u >= 1 ? -2.5 : undefined, mouth: u >= 1 ? 'o' : 'smile' }); }
};
ART.S03 = (g, lt, V, P, t) => {
  cArc(g, 540, 820, 420, -Math.PI / 2, Math.PI * 1.5, V(0, 1.2)); cross(g, 100, 470, V(0.3)); cross(g, 980, 1270, V(0.35));
  // dotted route between three plants
  const pts = [[160, 1200], [300, 720], [600, 980], [880, 560]];
  g.setLineDash([4, 18]); stroke(g, pts.map(p => p), C.ink, 6); g.setLineDash([]);
  const plantIcon = (x, y, d, c) => pop(g, V(d), x, y, () => { rect(g, x - 70, y - 90, 140, 90, c); tank(g, x - 30, y - 90, 50, 70, C.sky); rect(g, x + 10, y - 150, 24, 60, C.ink); });
  plantIcon(300, 720, 0.5, C.pink); plantIcon(600, 980, 0.7, C.mustard); plantIcon(880, 560, 0.9, C.teal);
  // Rahul travels along the route
  const u = ss(P(0), P(1) - 0.3, lt), seg = Math.min(2, Math.floor(u * 3)), su = u * 3 - seg;
  const [ax, ay] = pts[seg], [bx, by] = pts[seg + 1];
  pop(g, V(0.3), ax, ay, () => rahul(g, lerp(ax, bx, eio(su)), lerp(ay, by, eio(su)) + 10, 0.55, { walk: su > 0.02 && su < 0.98 ? lt * 8 : null, t, face: bx > ax ? 1 : -1, hold: (gg) => { rect(gg, -12, -10, 40, 50, C.cream); rect(gg, -6, 0, 28, 4, C.ink); rect(gg, -6, 12, 28, 4, C.ink); } }));
  pop(g, V(P(1) + 0.1), 300, 1180, () => { circ(g, 300, 1180, 130, C.blue); bigNum(g, '১০০০', 300, 1180, 64, C.cream); txt(g, 'লিটার / ঘণ্টা', 300, 1232, F.bn(28, 600), C.cream, 'center'); });
  pop(g, V(P(1) + 1.2), 760, 1260, () => { jar(g, 760, 1290, 1.6, { label: 1 }); });
};
ART.S04 = (g, lt, V, P, t) => {
  frame(g, 0, V, 540, 840, 420);
  // desk
  ground(g, 1330, V(0.2, 0.7));
  pop(g, V(0.5), 760, 1330, () => rahul(g, 760, 1330, 0.95, { t, face: -1, mouth: lt > P(4) ? 'smile' : 'flat', armL: -0.5 }), 'up');
  pop(g, V(0.3, 0.6), 540, 1200, () => { rect(g, 120, 1180, 840, 30, C.ink); rect(g, 160, 1210, 26, 120, C.ink); rect(g, 894, 1210, 26, 120, C.ink); }, 'x');
  const D = [['FSSAI', P(1) + 0.3, 260, 640, -0.06, C.red], ['GROUNDWATER NOC', P(2) + 0.2, 560, 560, 0.05, C.blue], ['LAB TEST', P(3) + 0.4, 820, 700, 0.06, C.teal]];
  D.forEach(([ti, d, x, y, r, sc], i) => pop(g, V(d, 0.5), x, y, () => doc(g, x, y, i === 1 ? 330 : 260, 290, ti, (lt - d - (i === 1 ? 2.8 : 1.2)) / 0.4, sc, r), 'up'));
  // NOC takes longest: hourglass
  pop(g, V(P(2) + 0.6), 950, 880, () => { const fl = clamp((lt - P(2) - 0.6) / 3); g.save(); g.translate(950, 880); g.rotate(Math.floor(lt - P(2)) % 2 ? 0 : 0); poly(g, [[-36, -60], [36, -60], [0, 0]], C.cream); poly(g, [[0, 0], [36, 60], [-36, 60]], C.cream); poly(g, [[-36 * (1 - fl), -60 + 60 * fl], [36 * (1 - fl), -60 + 60 * fl], [0, 0]], C.mustard); poly(g, [[-36 * fl, 60 - 60 * fl], [36 * fl, 60 - 60 * fl], [36, 60], [-36, 60]], C.mustard); rect(g, -44, -68, 88, 10, C.ink); rect(g, -44, 58, 88, 10, C.ink); g.restore(); });
  pop(g, V(P(4) + 0.1), 330, 1095, () => calendar(g, 330, 1095, 0.6, 'সময়', '৪ মাস'));
};
const ROWS5 = [['আর-ও প্ল্যান্ট', 500000], ['জার মেশিন', 120000], ['৬০০ খালি জার', 75000], ['বোরিং, শেড, ওয়্যারিং', 150000], ['লাইসেন্স ও টেস্ট', 60000], ['ই-রিকশা লোডার', 160000], ['৩ মাসের খরচ', 100000]];
ART.S05 = (g, lt, V, P, t) => {
  cArc(g, 540, 820, 440, -Math.PI / 2, Math.PI * 1.5, V(0, 1.2)); cross(g, 100, 360, V(0.3)); cross(g, 980, 1300, V(0.35));
  // ledger card
  pop(g, V(0.3, 0.6), 540, 840, () => { rect(g, 128, 388, 840, 920, 'rgba(31,29,27,0.12)'); rect(g, 120, 380, 840, 920, C.cream); rect(g, 120, 380, 840, 70, C.ink); txt(g, 'বিনিয়োগ', 160, 428, F.bn(36, 700), C.cream); txt(g, 'INVESTMENT', 920, 426, F.mono(22), C.cream, 'right'); }, 'y');
  const icons = [(x, y) => tank(g, x, y + 30, 50, 60, C.sky), (x, y) => { rect(g, x - 30, y - 20, 60, 50, C.gray); rect(g, x - 6, y - 36, 12, 16, C.ink); }, (x, y) => jar(g, x, y + 32, 0.55), (x, y) => house(g, x - 30, y + 32, 60, 40, C.pink), (x, y) => doc(g, x, y, 54, 64, '', 0), (x, y) => rickshaw(g, x + 4, y + 30, 0.18, 2), (x, y) => coin(g, x, y, 28)];
  let total = 0;
  ROWS5.forEach(([name, amt], i) => {
    const d = P(i + 1) + 0.15, v = V(d, 0.45); if (v <= 0) return;
    total += amt * eo((lt - d) / 0.7);
    pop(g, v, 540, 510 + i * 96, () => { const y = 510 + i * 96; icons[i](200, y); txt(g, name, 260, y + 14, F.bn(38, 600), C.ink); txt(g, inr(amt), 920, y + 14, F.bn(40, 700), C.blue, 'right'); rect(g, 160, y + 44, 760, 2, C.shade); }, 'left');
  });
  pop(g, V(P(1), 0.5), 540, 1220, () => { rect(g, 160, 1190, 760, 4, C.ink); txt(g, 'মোট', 180, 1262, F.bn(44, 700), C.ink); txt(g, inr(total), 920, 1262, F.bn(54, 700), lt > P(8) ? C.red : C.ink, 'right'); });
  pop(g, V(P(8) + 0.2), 840, 420, () => { g.save(); g.translate(840, 420); g.rotate(-0.2); circ(g, 0, 0, 96, C.red); g.strokeStyle = C.cream; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 80, 0, TAU); g.stroke(); txt(g, '১১.৬৫', 0, 10, F.bn(46, 700), C.cream, 'center'); txt(g, 'লাখ', 0, 50, F.bn(28, 600), C.cream, 'center'); g.restore(); });
};
ART.S06 = (g, lt, V, P, t) => {
  frame(g, 0, V, 540, 800, 400);
  pop(g, V(0.3, 0.6), 540, 1150, () => rect(g, 100, 1150, 880, 8, C.ink), 'x');
  const cols = [['নিজের সঞ্চয়', 300000, C.mustard, 250, P(1) + 0.1], ['পরিবার', 165000, C.pink, 540, P(1) + 1.5], ['মুদ্রা লোন', 700000, C.blue, 830, P(1) + 3.0]];
  cols.forEach(([name, amt, c, x, d]) => {
    const v = V(d, 0.8); if (v <= 0) return;
    const hh = amt / 700000 * 600 * eo(v);
    rect(g, x - 100, 1150 - hh, 200, hh, c); for (let k = 1; k < hh / 40; k++) rect(g, x - 100, 1150 - k * 40, 200, 3, 'rgba(31,29,27,0.15)');
    g.globalAlpha = clamp(v * 2); bigNum(g, inr(Math.round(amt * eo(v) / 1000) * 1000), x, 1130 - hh - 22, 44, C.ink); txt(g, name, x, 1210, F.bn(36, 600), C.ink, 'center'); g.globalAlpha = 1;
  });
  pop(g, V(P(2) + 0.1), 540, 1290, () => { tag(g, 540, 1290, 'কিস্তি ₹১৫,২০০ / মাস × ৬০', C.ink, C.cream, 38); });
};
ART.S07 = (g, lt, V, P, t) => {
  cArc(g, 540, 820, 440, -Math.PI / 2, Math.PI * 1.5, V(0, 1.2)); cross(g, 100, 360, V(0.3)); cross(g, 980, 1300, V(0.35));
  const flow = (pts, d) => { const v = V(d, 0.6); if (v <= 0) return; stroke(g, pts, C.ink, 22, 'butt'); g.setLineDash([16, 22]); g.lineDashOffset = -lt * 60; stroke(g, pts, C.sky, 8, 'butt'); g.setLineDash([]); };
  // row 1 (left→right): borewell → filters → RO
  pop(g, V(P(1)), 150, 760, () => { rect(g, 60, 740, 200, 50, C.rust); rect(g, 140, 600, 22, 190, C.ink); rect(g, 120, 580, 62, 30, C.gray); txt(g, 'বোরওয়েল', 150, 470, F.bn(30, 600), C.ink, 'center'); }, 'y');
  flow([[160, 600], [160, 520], [310, 520], [310, 560]], P(1) + 0.4);
  pop(g, V(P(1) + 0.8), 340, 720, () => { rrect(g, 280, 560, 70, 200, 30, C.mustard); rrect(g, 370, 560, 70, 200, 30, C.ink); txt(g, 'বালি', 315, 800, F.bn(26, 600), C.ink, 'center'); txt(g, 'কার্বন', 405, 800, F.bn(26, 600), C.ink, 'center'); }, 'y');
  flow([[440, 600], [560, 600]], P(1) + 1.6);
  pop(g, V(P(1) + 2.2), 760, 620, () => { rrect(g, 560, 570, 400, 90, 45, C.blue); for (let i = 0; i < 6; i++) rect(g, 610 + i * 56, 580, 10, 70, C.sky); txt(g, 'RO মেমব্রেন', 760, 710, F.bn(30, 600), C.ink, 'center'); }, 'x');
  // row 2 (right→left): UV → ozone → tank
  flow([[940, 660], [940, 900], [860, 900]], P(2));
  pop(g, V(P(2) + 0.3), 760, 900, () => { rrect(g, 660, 860, 200, 80, 20, C.ink); const gl = 0.5 + 0.5 * Math.sin(lt * 8); g.globalAlpha = 0.5 + gl * 0.5; rect(g, 680, 884, 160, 32, C.purple); g.globalAlpha = 1; txt(g, 'UV', 760, 990, F.mono(26, 500), C.ink, 'center'); });
  flow([[660, 900], [560, 900]], P(2) + 0.8);
  pop(g, V(P(2) + 1.0), 470, 900, () => { circ(g, 470, 900, 70, C.teal); for (let i = 0; i < 5; i++) { const ph = (lt * 0.8 + i / 5) % 1; circ(g, 440 + i * 16, 940 - ph * 80, 6 + i % 2 * 3, C.cream); } txt(g, 'ওজোন', 470, 1010, F.bn(28, 600), C.ink, 'center'); });
  flow([[400, 900], [300, 900]], P(2) + 1.6);
  pop(g, V(P(2) + 1.8), 200, 1000, () => tank(g, 200, 1000, 130, 100, C.sky, 'STORAGE'), 'y');
  // row 3: conveyor wash → fill → seal
  pop(g, V(P(3), 0.6), 540, 1250, () => { rect(g, 100, 1250, 880, 20, C.ink); for (let i = 0; i < 12; i++) circ(g, 120 + i * 76, 1280, 10, C.gray); }, 'x');
  if (V(P(3)) > 0) {
    const st = [['ধোয়া', 260, C.sky], ['ভরা', 540, C.blue], ['সিল', 820, C.red]];
    st.forEach(([n, x, c], i) => pop(g, V(P(3) + 0.3 + i * 0.3), x, 1100, () => { rect(g, x - 70, 1108, 140, 28, C.ink); rect(g, x - 8, 1136, 16, 24, C.ink); txt(g, n, x, 1094, F.bn(32, 700), C.ink, 'center'); }));
    for (let k = 0; k < 5; k++) { const x = ((lt - P(3)) * 70 + k * 230) % 1150 - 60; jar(g, x, 1250, 0.95, { c: x > 540 ? C.sky : '#9CC3D6', cap: x > 820 ? C.red : 'rgba(0,0,0,0)' }); }
    if (V(P(3) + 0.6) > 0) { g.globalAlpha = 0.6; for (let i = 0; i < 4; i++) circ(g, 240 + i * 14, 1166 + ((lt * 3 + i * 0.3) % 1) * 30, 5, C.sky); rect(g, 536, 1160, 8, 30, C.sky); g.globalAlpha = 1; }
  }
};
ART.S08 = (g, lt, V, P, t) => {
  frame(g, 0, V, 540, 800, 400);
  ground(g, 1300, V(0.2, 0.7));
  pop(g, V(0.3, 0.6), 330, 1300, () => { shop(g, 160, 1300, 340, 280, C.teal); }, 'y');
  pop(g, V(0.6), 330, 1300, () => { for (let i = 0; i < 4; i++) jar(g, 220 + i * 74, 1300, 0.6); });
  pop(g, V(P(0) + 1.2), 330, 600, () => { tag(g, 330, 560, 'বাড়িতে ₹৩০', C.orange, C.cream, 42); tag(g, 330, 660, 'দোকানে ₹২০', C.mustard, C.ink, 42); });
  pop(g, V(P(1) + 0.1), 330, 840, () => { bigNum(g, '৫০ জার / দিন', 330, 860, 64, C.red); });
  if (V(P(2)) > 0) { const u = eio((lt - P(2)) / 1.1), wx = lerp(1200, 780, u); person(g, wx, 1300, 0.85, { sari: C.purple, shirt: C.pink, hair: 'bun', skin: C.skin2, t, face: -1, walk: u < 1 ? lt * 8 : null, mouth: 'flat', armR: u >= 1 ? -0.6 + Math.sin(lt * 3) * 0.3 : undefined }); pop(g, V(P(2) + 1.0), 760, 900, () => bubbleSay(g, 760, 900, 380, 110, 'জল কিনব কেন?', C.cream, 1)); }
  pop(g, V(P(3) + 0.1), 820, 640, () => { g.save(); g.globalAlpha = 1; jar(g, 820, 700, 0.9, { c: '#9CC3D6' }); tag(g, 820, 530, '₹১৫', C.ink, C.cream, 40); g.save(); g.translate(820, 640); g.rotate(-0.25); g.strokeStyle = C.red; g.lineWidth = 6; g.strokeRect(-130, -36, 260, 72); txt(g, 'লাইসেন্স নেই', 0, 12, F.bn(32, 700), C.red, 'center'); g.restore(); g.restore(); });
};
ART.S09 = (g, lt, V, P, t) => {
  frame(g, 0, V, 540, 800, 400);
  const HS = [[90, C.pink, C.terra], [330, C.mustard, C.red], [570, C.marble, C.teal], [810, C.pink, C.navy]];
  HS.forEach(([x, c, r], i) => { pop(g, V(0.3 + i * 0.1, 0.6), x + 80, 900, () => house(g, x, 900, 160, 220, c, r), 'y'); pop(g, V(P(0) + 1.4 + i * 0.35), x + 80, 900, () => { jar(g, x + 120, 900, 0.6); tag(g, x + 80, 590, 'ফ্রি', C.green, C.cream, 30); }, 'drop'); });
  pop(g, V(0.4, 0.6), 540, 900, () => rect(g, 60, 900, 960, 14, C.ink), 'x');
  pop(g, V(P(1) + 0.1), 240, 1150, () => { jar(g, 240, 1290, 1.5, { label: 1 }); g.save(); g.translate(330, 1100); g.rotate(0.12); rect(g, 0, 0, 150, 110, C.cream); txt(g, 'LAB', 75, 36, F.mono(24), C.ink, 'center'); rect(g, 20, 52, 110, 6, C.shade); rect(g, 20, 70, 80, 6, C.shade); txt(g, '✓', 120, 98, F.bn(30, 700), C.green, 'center'); g.restore(); });
  pop(g, V(P(2) + 0.1), 600, 1170, () => phone(g, 600, 1170, 0.85));
  pop(g, V(P(2) + 0.8), 800, 1120, () => { clock(g, 800, 1120, 90, lt); });
  pop(g, V(P(3) + 0.1), 540, 560, () => { const u = eo((lt - P(3) - 0.2) / 1.2); rect(g, 300, 560 - 40, 140, 40, C.gray); rect(g, 640, 560 - 40, lerp(140, 336, u), 40, C.blue); txt(g, '৫০', 370, 500, F.bn(34, 700), C.ink, 'center'); txt(g, bnd(Math.round(lerp(50, 120, u))) + ' জার/দিন', 640 + lerp(140, 336, u) / 2, 500, F.bn(34, 700), C.blue, 'center'); stroke(g, [[460, 540], [610, 540]], C.ink, 5); poly(g, [[612, 528], [630, 540], [612, 552]], C.ink); });
};
ART.S10 = (g, lt, V, P, t) => {
  frame(g, 0, V, 540, 800, 400);
  // a field of jars that start vanishing
  const R = rng(4);
  for (let i = 0; i < 18; i++) {
    const x = 170 + (i % 6) * 148, y = 620 + Math.floor(i / 6) * 150, d = 0.3 + i * 0.04;
    const gone = (i % 3 === 1) ? ss(P(1) + (R() * 2), P(1) + (R() * 2) + 0.6, lt) : 0;
    if (gone < 1) pop(g, V(d) * (1 - gone), x, y, () => jar(g, x, y, 0.85));
    if (gone > 0.5 && V(0) > 0) { g.globalAlpha = Math.min(1, (gone - 0.5) * 2) * V(0); txt(g, '?', x, y - 30, F.bn(64, 700), C.red, 'center'); g.globalAlpha = 1; }
  }
  pop(g, V(P(1) + 2.2), 540, 1030, () => tag(g, 540, 1030, '−১২০ জার = −₹১৫,০০০', C.red, C.cream, 42));
  pop(g, V(P(2) + 0.3), 540, 1220, () => { g.save(); g.translate(540, 1220); g.rotate(0.03); rect(g, -170, -90, 340, 180, C.cream); txt(g, 'বাকি খাতা', 0, -40, F.bn(32, 700), C.ink, 'center'); bigNum(g, '₹৪০,০০০', 0, 50, 66, C.red); g.restore(); });
  pop(g, V(P(3) + 0.1), 260, 470, () => { coin(g, 220, 460, 60, C.green); txt(g, '₹১৫০ জমা', 340, 474, F.bn(40, 700), C.ink); });
  pop(g, V(P(3) + 1.6), 860, 470, () => calendar(g, 860, 470, 0.7, 'প্রতি সপ্তাহ', 'শনি', C.blue));
};
ART.S11 = (g, lt, V, P, t) => {
  frame(g, 0, V, 540, 800, 400);
  const lightsOn = !(lt > P(0) + 0.4 && lt < P(1) + 1.2);
  g.save(); g.translate(430, 1330); g.scale(0.85, 0.85); g.translate(-540, -1100);
  pop(g, V(0.3, 0.6), 540, 1100, () => { rect(g, 200, 760, 680, 340, C.teal); poly(g, [[180, 760], [540, 620], [900, 760]], C.ink); tank(g, 330, 1100, 120, 200, C.sky); tank(g, 480, 1100, 120, 200, C.sky); rrect(g, 600, 900, 220, 70, 35, C.blue); }, 'y');
  [[380, 700], [700, 700]].forEach(([x, y], i) => pop(g, V(0.6 + i * 0.1), x, y, () => bulb(g, x, y, lightsOn)));
  if (!lightsOn && V(0) > 0.5) { g.globalAlpha = 0.35; rect(g, 200, 620, 680, 480, C.ink); g.globalAlpha = 1; pop(g, clamp((lt - P(0) - 0.4) / 0.3), 540, 520, () => { bolt(g, 540, 520, 1.3); tag(g, 540, 420, 'লোডশেডিং', C.ink, C.cream, 38); }); }
  g.restore();
  ground(g, 1330, V(0.2, 0.7));
  pop(g, V(P(1) + 0.2), 870, 1330, () => { gen(g, 870, 1330, 0.9, lt, lt > P(1) + 1.2); tag(g, 870, 1150, '₹৪০,০০০', C.red, C.cream, 36); }, 'right');
  pop(g, V(P(2) + 0.1), 870, 960, () => { const sw = ss(P(2) + 0.6, P(2) + 1.6, lt); rrect(g, 800, 900 - sw * 60, 50, 120, 20, mixc(C.cream, C.rust, 0.7)); rrect(g, 880, 900 - (1 - sw) * 60, 50, 120, 20, C.cream); txt(g, 'ফিল্টার', 870, 820, F.bn(30, 700), C.ink, 'center'); });
  if (V(P(2) + 1.8) > 0) { const wx = lerp(560, 1200, ss(P(2) + 2.2, P(2) + 5, lt)); person(g, wx, 1330, 0.7, { shirt: C.orange, pants: C.ink, hair: 'cap', capc: C.blue, t, walk: lt > P(2) + 2.2 ? lt * 7 : null, mouth: 'sad' }); }
};
ART.S12 = (g, lt, V, P, t) => {
  frame(g, 0, V, 540, 800, 400);
  // a little town that fills up
  const R = rng(12); const icons = [];
  for (let i = 0; i < 21; i++) icons.push([110 + (i % 7) * 140 + (R() - 0.5) * 30, 520 + Math.floor(i / 7) * 150 + (R() - 0.5) * 20, i]);
  icons.forEach(([x, y, i]) => pop(g, V(0.3 + i * 0.07, 0.4), x, y, () => { const c = [C.pink, C.mustard, C.marble, C.teal][i % 4]; if (i === 9 || i === 20) { shop(g, x - 45, y + 50, 90, 70, C.mustard); } else if (i === 13) { rect(g, x - 60, y - 30, 120, 80, C.red); poly(g, [[x - 70, y - 30], [x, y - 80], [x + 70, y - 30]], C.ink); } else house(g, x - 40, y + 50, 80, 70, c); }));
  const labs = [['৪০০ বাড়ি', C.pink], ['৩০ দোকান', C.mustard], ['২ স্কুল', C.red], ['অফিস', C.teal]];
  labs.forEach(([s, c], i) => pop(g, V(P(0) + 0.4 + i * 0.8), 170 + i * 250, 1150, () => tag(g, 170 + i * 250, 1150, s, c, C.ink, 34)));
  ground(g, 1332, V(P(1), 0.7));
  pop(g, V(P(1) + 0.1), 540, 1260, () => { const x = lerp(-300, 1300, ss(P(1), P(1) + 4.5, lt)); rickshaw(g, x, 1330, 0.55, 8, lt * 8); });
  pop(g, V(P(1) + 0.5), 540, 440, () => tag(g, 540, 440, bnd(Math.round(220 * eo((lt - P(1) - 0.5) / 1.6))) + ' জার / দিন', C.blue, C.cream, 54));
};
const COST13 = [['ফিল্টার, ক্যাপ, বিদ্যুৎ, জ্বালানি', 36400, C.orange], ['৩ জন কর্মীর বেতন', 28000, C.red], ['ভাড়া, টেস্ট, জার, অন্যান্য', 16750, C.mustard], ['লোনের কিস্তি', 15200, C.blue]];
ART.S13 = (g, lt, V, P, t) => {
  cArc(g, 540, 820, 440, -Math.PI / 2, Math.PI * 1.5, V(0, 1.2)); cross(g, 100, 360, V(0.3)); cross(g, 980, 1300, V(0.35));
  const X0 = 120, X1 = 960, rev = 165000, sx = (X1 - X0) / rev;
  pop(g, V(P(1) + 0.2, 0.7), X0, 520, () => { rect(g, X0, 470, X1 - X0, 100, C.green); txt(g, 'বিক্রি', X0, 448, F.bn(34, 700), C.ink); txt(g, '৬,৬০০ জার × ₹২৫', X1, 448, F.bn(30, 600), C.ink, 'right'); bigNum(g, inr(Math.round(rev * eo((lt - P(1) - 0.2) / 1.4) / 100) * 100), 540, 538, 54, C.cream); }, 'x');
  let used = 0;
  COST13.forEach(([n, amt, c], i) => {
    const d = P(i + 2) + 0.15, v = V(d, 0.7); if (v <= 0) { used += amt; return; }
    const x = X0 + used * sx, w = amt * sx, y = 640 + i * 130;
    const drop = eo(v);
    g.globalAlpha = 0.25; rect(g, x, 470, w, 100, C.ink); g.globalAlpha = 1;
    rect(g, x, lerp(470, y, drop), w, 90, c);
    g.globalAlpha = clamp(v * 2); txt(g, n, X0, y + 120 - 10, F.bn(28, 600), C.ink); txt(g, '−' + inr(amt), X1, y + 120 - 10, F.bn(34, 700), c, 'right'); g.globalAlpha = 1;
    used += amt;
  });
  pop(g, V(P(6) + 0.1), 540, 1260, () => { const px = X0 + used * sx; rect(g, px, 1170, X1 - px, 100, C.green); stroke(g, [[px, 570], [px, 1170]], C.ink, 3); txt(g, 'লাভ', X0, 1240, F.bn(48, 700), C.ink); bigNum(g, '≈ ' + inr(Math.round(68000 * eo((lt - P(6) - 0.1) / 1.4) / 100) * 100), (px + X1) / 2 - 30, 1310, 54, C.green); });
};
ART.S14 = (g, lt, V, P, t) => {
  cross(g, 100, 360, V(0.3)); cross(g, 980, 1300, V(0.35)); cLine(g, 70, 830, 1010, 830, V(0.1, 0.9));
  // summer (top)
  pop(g, V(P(1) + 0.1), 200, 560, () => sunIcon(g, 200, 560, 80, lt));
  if (V(P(1) + 0.4) > 0) for (let i = 0; i < 14; i++) pop(g, V(P(1) + 0.4 + i * 0.06), 380 + (i % 7) * 86, 700, () => jar(g, 380 + (i % 7) * 86, 610 + Math.floor(i / 7) * 120, 0.55, { c: C.orange }));
  pop(g, V(P(1) + 1.4), 680, 790, () => { bigNum(g, '৩৫০ জার/দিন', 680, 790, 40, C.ink); });
  pop(g, V(P(1) + 2.2), 210, 760, () => tag(g, 210, 760, 'লাভ ₹১.৩ লাখ+', C.orange, C.cream, 34));
  // winter (bottom)
  pop(g, V(P(2) + 0.1), 200, 960, () => snow(g, 200, 960, 70));
  if (V(P(2) + 0.4) > 0) for (let i = 0; i < 6; i++) pop(g, V(P(2) + 0.4 + i * 0.06), 380 + i * 86, 1010, () => jar(g, 380 + i * 86, 1010, 0.55));
  pop(g, V(P(2) + 1.2), 680, 1080, () => bigNum(g, '১৫০ জার/দিন', 680, 1080, 40, C.ink));
  pop(g, V(P(2) + 2.0), 210, 1090, () => tag(g, 210, 1090, 'লাভ ≈ ₹৩০,০০০', C.sky, C.ink, 34));
  // wedding orders: bunting + jars
  pop(g, V(P(3) + 0.1), 540, 1200, () => { for (let i = 0; i < 12; i++) poly(g, [[100 + i * 74, 1170], [174 + i * 74, 1170], [137 + i * 74, 1170 + 50]], [C.red, C.mustard, C.green, C.pink][i % 4]); stroke(g, [[90, 1170], [990, 1170]], C.ink, 4); for (let i = 0; i < 8; i++) jar(g, 240 + i * 86, 1330, 0.6); txt(g, 'বিয়েবাড়ির অর্ডার', 540, 1260, F.bn(36, 700), C.ink, 'center'); });
};
const MONTHS = [-35, -20, -5, 10, 25, 40, 60, 95, 130, 70, 35, 30]; // thousand ₹ profit by month (illustrative)
ART.S15 = (g, lt, V, P, t) => {
  cArc(g, 540, 820, 440, -Math.PI / 2, Math.PI * 1.5, V(0, 1.2)); cross(g, 100, 360, V(0.3)); cross(g, 980, 1300, V(0.35));
  const X0 = 140, X1 = 940, Y0 = 760, sy = 2.2, bw = (X1 - X0) / 12;
  pop(g, V(0.3, 0.6), 540, Y0, () => { rect(g, X0 - 10, Y0, X1 - X0 + 20, 4, C.ink); txt(g, '০', X0 - 24, Y0 + 10, F.mono(22), C.ink, 'right'); }, 'x');
  MONTHS.forEach((m, i) => pop(g, V(0.4 + i * 0.12 + (i < 6 ? 0 : P(1) * 0.5), 0.5), X0 + i * bw + bw / 2, Y0, () => { const h = m * sy; rect(g, X0 + i * bw + 8, m > 0 ? Y0 - h : Y0 + 4, bw - 16, Math.abs(h), m > 0 ? (i >= 7 && i <= 8 ? C.orange : C.green) : C.red); txt(g, bnd(i + 1), X0 + i * bw + bw / 2, Y0 + (m < 0 ? Math.abs(m * sy) + 40 : 40), F.mono(20), C.ink, 'center'); }, 'y'));
  pop(g, V(0.8), X0 + 3 * bw, 900, () => { g.strokeStyle = C.ink; g.lineWidth = 2; g.setLineDash([6, 8]); g.strokeRect(X0, 400, bw * 6, 470); g.setLineDash([]); txt(g, 'প্রথম ৬ মাস', X0 + 3 * bw, 430, F.bn(28, 600), C.ink, 'center'); });
  pop(g, V(P(1) + 0.2), 300, 1080, () => { coinStack(g, 220, 1150, 10, C.mustard); txt(g, inr(Math.round(465000 * eo((lt - P(1) - 0.2) / 1.6) / 1000) * 1000), 300, 1060, F.bn(40, 700), C.ink); txt(g, 'নিজের টাকা ফেরত', 300, 1100, F.bn(28, 600), C.green); });
};
ART.S16 = (g, lt, V, P, t, last) => {
  
  ground(g, 1282, V(0.2, 0.7));
  if (V(0.2) > 0) { const u = eio((lt - 0.2) / 1.4), wx = lerp(-160, 540, u); rahul(g, wx, 1280, 1.3, { t, walk: u < 1 ? lt * 8 : null, armR: u >= 1 ? -2.6 + Math.sin(lt * 6) * 0.35 : undefined, mouth: 'smile' }); }
  pop(g, V(0.6), 300, 1280, () => jar(g, 300, 1280, 1.3, { label: 1 }));
  pop(g, V(0.8), 800, 1280, () => rickshaw(g, 780, 1280, 0.45, 6));
  pop(g, V(P(1) + 0.1), 540, 620, () => { bubbleSay(g, 540, 620, 560, 120, 'কোন ব্যবসা? কমেন্টে লিখুন', C.orange, 0); });
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
  const row = (n, y, x0, r) => { for (let i = 0; i < n; i++) { const b = Math.abs(Math.sin(t * 3 + i + r)) * 8; jar(L, x0 + i * 112, y - b * (r === 0 ? 0 : 1), 1.05, { label: i % 2 === 0 }); } };
  row(4, 1480, 640, 0); row(3, 1340, 696, 1); row(2, 1200, 752, 2); row(1, 1060, 808, 3);
  rect(L, 0, 1480, W, 6, C.ink);
  rahul(L, 420, 1480, 1.8, { t: t + 0.3, armR: -2.2 + Math.sin(t * 4) * 0.12, armL: 0.25, mouth: 'smile',
    hold: (gg) => { gg.rotate(2.2); jar(gg, 0, 60, 0.75, { label: 1 }); } });
  L.save(); L.translate(870, 760); L.rotate(0.12 + Math.sin(t * 2.5) * 0.06); const k = 1 + Math.sin(t * 5) * 0.04; L.scale(k, k);
  L.fillStyle = C.mustard; L.beginPath(); for (let i = 0; i < 28; i++) { const r = i % 2 ? 150 : 178, a = i * TAU / 28 + t * 0.3; L.lineTo(Math.cos(a) * r, Math.sin(a) * r); } L.closePath(); L.fill();
  txt(L, 'মাসে', 0, -40, F.bn(40, 700), C.ink, 'center'); txt(L, '₹৬৮,০০০', 0, 30, F.bn(64, 700), C.ink, 'center'); txt(L, 'লাভ?', 0, 88, F.bn(40, 700), C.ink, 'center');
  L.restore();
}
function introText(g, t) {
  txt(g, '₹১১ লাখ দিয়ে', 540, 420, F.bn(96, 700), C.ink, 'center');
  txt(g, 'জলের ব্যবসা', 540, 545, F.head(140), C.blue, 'center');
  penLine(g, 540, 590, 520, clamp(0.35 + t / 0.8), 5);
}

// sound events for the mixer
export function events() {
  const ev = [];
  SC.forEach(s => {
    ev.push({ t: s.a + 0.05, k: 'whoosh' });
    PARTS[s.id].forEach((o, i) => ev.push({ t: s.v + o + 0.2, k: 'tick' }));
  });
  const S = id => SC.find(s => s.id === id), at = (id, k, d) => S(id).v + PARTS[id][k] + d;
  for (let i = 1; i <= 7; i++) ev.push({ t: at('S05', i, 0.15), k: 'coin' });
  ev.push({ t: at('S05', 8, 0.2), k: 'stamp' });
  [[1, 0.1], [1, 1.5], [1, 3.0]].forEach(([k, d]) => ev.push({ t: at('S06', k, d), k: 'coin' }));
  [[1, 1.5], [2, 3.0], [3, 1.3], [3, 2.8], [3, 4.6]].forEach(([k, d]) => ev.push({ t: at('S04', k, d), k: 'stamp' }));
  for (let k = 2; k <= 5; k++) ev.push({ t: at('S13', k, 0.2), k: 'coin' });
  ev.push({ t: at('S13', 6, 0.15), k: 'stamp' });
  ev.push({ t: at('S11', 0, 0.4), k: 'thud' }, { t: at('S11', 1, 1.2), k: 'motor' });
  ev.push({ t: at('S09', 2, 0.2), k: 'bell' });
  return ev.sort((a, b) => a.t - b.t);
}

// ---------------------------------------------------------------- thumbnail / cover (1080×1920; key content inside the 4:5 centre crop y 285..1635)
export function thumb(g) {
  textures(); TNOW = 0;
  g.drawImage(PAPER, 0, 0);
  const L = LAYER.getContext('2d'); L.clearRect(0, 0, W, H);
  // big sun disc behind the hero
  backdrop(L, 'INTRO', 0, 1);
  // jar pyramid (the business)
  const row = (n, y, x0) => { for (let i = 0; i < n; i++) jar(L, x0 + i * 112, y, 1.05, { label: i % 2 === 0 }); };
  row(4, 1480, 640); row(3, 1340, 696); row(2, 1200, 752); row(1, 1060, 808);
  // ground
  rect(L, 0, 1480, W, 160, C.ink);
  rect(L, 0, 1540, W, 8, C.paper);
  // hero: Rahul, proud, holding a jar
  rahul(L, 420, 1480, 1.8, { t: 0.5, armR: -2.2, armL: 0.25, mouth: 'smile',
    hold: (gg) => { gg.rotate(2.2); jar(gg, 0, 60, 0.75, { label: 1 }); } });
  // money sticker
  L.save(); L.translate(870, 760); L.rotate(0.12);
  L.fillStyle = C.mustard; L.beginPath(); for (let i = 0; i < 28; i++) { const r = i % 2 ? 150 : 178, a = i * TAU / 28; L.lineTo(Math.cos(a) * r, Math.sin(a) * r); } L.closePath(); L.fill();
  txt(L, 'মাসে', 0, -40, F.bn(40, 700), C.ink, 'center'); txt(L, '₹৬৮,০০০', 0, 30, F.bn(64, 700), C.ink, 'center'); txt(L, 'লাভ?', 0, 88, F.bn(40, 700), C.ink, 'center');
  L.restore();
  // speckle print texture on the art
  L.save(); L.globalCompositeOperation = 'destination-out'; L.globalAlpha = 0.45; L.fillStyle = L.createPattern(SPECK, 'repeat'); L.fillRect(0, 0, W, H); L.restore();
  g.drawImage(LAYER, 0, 0);
  // headline
  txt(g, '₹১১ লাখ দিয়ে', 540, 420, F.bn(96, 700), C.ink, 'center');
  txt(g, 'জলের ব্যবসা', 540, 545, F.head(140), C.blue, 'center');
  penLine(g, 540, 590, 520, 1, 5);
  tag(g, 540, 1760, 'ছোট শহরের পুরো হিসেব', C.ink, C.cream, 46);
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.11; g.fillStyle = g.createPattern(GRAIN, 'repeat'); g.fillRect(0, 0, W, H); g.restore();
}
