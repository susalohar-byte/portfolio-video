// Cast for "कितना कमाते हैं एक चायवाले?": the chaiwala (front view, held body behind his counter) and the chai glass.
// Limited animation: torso and head are a held drawing; only arms, hands, eyes, brows and mouth move.
// Units: waist centre at (0,0), head top ≈ -470. The hand drawer follows the style engine's glove grammar.
import { PAL, shape, ink, ellipse, spline, xform, move, rrect, rect, TAU, reg, path, sparkle } from './toon.js';

export const C = {
  kurta: '#3FA7A0', kurtaD: '#257A74', vest: '#6E4A6B', vestD: '#53354F', skin: '#D9A27A', skinD: '#BF8660', hair: '#2E211C',
  tea: '#B5652E', teaD: '#8A4A1E', teaL: '#D7924F', glass: '#E8EEE6', glassD: '#C7D3CB', gamchha: '#E4613F',
};

// four-finger glove-style hand (3 fingers + thumb): one union outline, then fill, thin separations
export function drawHand(ctx, x, y, a, kind = 'open', side = 1, k = 1, skin = C.skin) {
  const parts = [], seps = [];
  const E = (cx, cy, rx, ry, rot = 0) => parts.push(ellipse(cx, cy, rx, ry, 18, 0, TAU, rot));
  E(12, 0, 15, 13.5);
  if (kind === 'open') { [-0.62, 0, 0.62].forEach(r => E(12 + Math.cos(r) * 25, Math.sin(r) * 25, 12, 5, r)); E(4, -15 * side, 10, 5, -1.35 * side); }
  else if (kind === 'flat') { [-10, 0, 10].forEach((dy, i) => E(34 + (i === 1 ? 3 : 0), dy, 13, 4.8)); E(10, -15 * side, 9, 5, -0.9 * side); seps.push([[24, -5], [40, -5]], [[24, 5], [40, 5]]); }
  else if (kind === 'point') { E(38, -5 * side, 19, 4.8); E(25, 5 * side, 7, 6); E(20, 11 * side, 6, 5.5); E(8, -14 * side, 8.5, 5, -1.0 * side); }
  else { E(26, -8, 6.5, 6.5); E(28, 1, 6.5, 6.5); E(25, 10, 6, 6); E(12, -14 * side, 9, 5.5, -0.4 * side); seps.push([[22, -3.5], [30, -3.5]], [[22, 5.5], [29, 5.5]]); }
  const P = parts.map(p => xform(p, x, y, a, k));
  ctx.save(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6 * k; ctx.lineJoin = 'round';
  for (const p of P) { path(ctx, p); ctx.stroke(); }
  const o = reg(77, 0.6); ctx.fillStyle = skin;
  for (const p of P) { path(ctx, move(p, o[0] * 0.5, o[1] * 0.5)); ctx.fill(); }
  ctx.lineWidth = 2.4 * k; ctx.lineCap = 'round';
  for (const s2 of seps) { const q = xform(s2, x, y, a, k); ctx.beginPath(); ctx.moveTo(...q[0]); ctx.lineTo(...q[1]); ctx.stroke(); }
  ctx.restore();
}

// the cutting-chai glass: narrow foot, ribbed clear glass, amber tea. (x,y) = bottom centre, size = height px.
export function glass(ctx, x, y, size = 100, o = {}) {
  const { fill = 0.8, steam = 0, t = 0, seed = 300, tilt = 0 } = o;
  const k = size / 100;
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  const G = [[-26, 0], [26, 0], [36, -100], [-36, -100]].map(([a, b]) => [a * k, b * k]);
  shape(ctx, G, { fill: C.glass, line: 0, seed, grain: 0.1 });
  const h = 92 * fill, wt = 26 + 10 * (h / 100);
  const T = [[-24, -4], [24, -4], [wt - 2, -h], [-wt + 2, -h]].map(([a, b]) => [a * k, b * k]);
  shape(ctx, T, { fill: C.tea, line: 0, seed: seed + 1, grain: 0.3, shade: [{ pts: [[8 * k, 0], [40 * k, 0], [40 * k, -110 * k], [12 * k, -110 * k]], color: C.teaD, alpha: 0.55 }] });
  shape(ctx, ellipse(0, -h * k, (wt - 2) * k, 6 * k, 24), { fill: C.teaL, line: 0, seed: seed + 2, grain: 0.15 });
  ink(ctx, G, 4.2 * Math.max(0.7, k * 0.8), { closed: true, seed: seed + 3, breaks: 0.15 });
  for (let i = -1; i <= 1; i++) ink(ctx, [[(i * 14 - 2) * k, -10 * k], [(i * 19 - 2) * k, -90 * k]], 2.2 * Math.max(0.6, k * 0.7), { seed: seed + 5 + i, color: C.glassD, taper: true });
  if (steam > 0) for (let i = 0; i < 3; i++) {
    const ph = t * 1.4 + i * 0.37, x0 = (i - 1) * 18 * k, pts = [];
    for (let j = 0; j <= 14; j++) { const u = j / 14; pts.push([x0 + Math.sin(u * 6 + ph * 4) * 9 * k, -108 * k - u * 90 * k]); }
    ink(ctx, pts, 3.6 * Math.max(0.7, k * 0.7), { seed: seed + 10 + i, alpha: steam * (0.65 - 0.15 * i), color: PAL.white, taper: true });
  }
  ctx.restore();
}

// arm joints from angles (screen, before mirroring): 0 = right, π/2 = down
const UA = 118, FA = 108;
export function armJ(side, arm) {
  const sh = [side * 104, -250];
  const el = [sh[0] + Math.cos(arm.a1) * UA, sh[1] + Math.sin(arm.a1) * UA];
  const ha = [el[0] + Math.cos(arm.a2) * FA, el[1] + Math.sin(arm.a2) * FA];
  return { sh, el, ha, a2: arm.a2 };
}
function sleeve(ctx, J, seed) {
  const P = spline([J.sh, [(J.sh[0] + J.el[0]) / 2, (J.sh[1] + J.el[1]) / 2], J.el, [(J.el[0] + J.ha[0]) / 2, (J.el[1] + J.ha[1]) / 2], J.ha], false, 6);
  ink(ctx, P, 34, { seed, taper: false, wob: 0.08 });
  const o = reg(seed, 1);
  ink(ctx, move(P, o[0] * 0.6, o[1] * 0.6), 24, { seed: seed + 1, taper: false, wob: 0.05, color: C.kurta });
  // forearm skin past the rolled sleeve
  const fa = [[J.el[0] * 0.35 + J.ha[0] * 0.65, J.el[1] * 0.35 + J.ha[1] * 0.65], J.ha];
  ink(ctx, fa, 24, { seed: seed + 3, taper: false, wob: 0.05 }); ink(ctx, move(fa, o[0] * .5, o[1] * .5), 15, { seed: seed + 4, taper: false, wob: 0.05, color: C.skin });
}

// pose: {x, y, s, face:'neutral'|'happy'|'wow'|'focus'|'proud', armL:{a1,a2}, armR:{a1,a2}, handL, handR, blink, look:[dx,dy], hold:'R'|'L'|null, glassSize, steam, t}
export const REST_L = { a1: 1.95, a2: 1.6 }, REST_R = { a1: 1.19, a2: 1.54 };
export function drawChaiwala(ctx, p) {
  const s = p.s ?? 1;
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(s, s);
  const JL = armJ(-1, p.armL || REST_L), JR = armJ(1, p.armR || REST_R);
  // kurta torso (held drawing)
  const torso = spline([[-118, -262], [-60, -286], [60, -286], [118, -262], [132, -120], [140, 40], [-140, 40], [-132, -120]], true, 6);
  shape(ctx, torso, { fill: C.kurta, line: 4.4, seed: 50, grain: 0.35, breaks: 0.2, shade: [{ pts: [[50, -300], [160, -300], [160, 60], [70, 60]], color: C.kurtaD, alpha: 0.45 }] });
  // sleeveless vest (Nehru-cut) in plum
  const vestL = spline([[-112, -250], [-40, -276], [-14, -150], [-16, 40], [-134, 40], [-128, -120]], true, 5);
  const vestR = vestL.map(([a, b]) => [-a, b]);
  shape(ctx, vestL, { fill: C.vest, line: 3.6, seed: 51, grain: 0.3, breaks: 0.2 });
  shape(ctx, vestR, { fill: C.vest, line: 3.6, seed: 52, grain: 0.3, breaks: 0.2, shade: [{ pts: [[60, -300], [160, -300], [160, 60], [80, 60]], color: C.vestD, alpha: 0.5 }] });
  for (let i = 0; i < 3; i++) shape(ctx, ellipse(-22, -130 + i * 46, 6, 6, 10), { fill: '#E8B43A', line: 2.2, seed: 53 + i, grain: 0 });
  // the pocket (the film's "जेब")
  shape(ctx, rrect(-104, -150, 56, 46, 6), { fill: C.vest, line: 3.2, seed: 57, grain: 0.2, breaks: 0.2 });
  ink(ctx, [[-102, -136], [-50, -136]], 2.4, { seed: 58, taper: false, color: C.vestD });
  // gamchha over the left shoulder: coral cloth with a checked edge
  const gm = spline([[-120, -256], [-70, -282], [-46, -250], [-60, -120], [-96, -30], [-118, -120]], true, 5);
  shape(ctx, gm, { fill: C.gamchha, line: 3.6, seed: 59, grain: 0.3, breaks: 0.2 });
  for (let i = 0; i < 4; i++) ink(ctx, [[-108 + i * 4, -200 + i * 36], [-66 + i * 2, -214 + i * 36]], 2.6, { seed: 60 + i, color: PAL.white, taper: false, alpha: 0.8 });
  // neck
  shape(ctx, rect(-24, -318, 48, 44), { fill: C.skin, line: 0, seed: 64, grain: 0.1 });
  ink(ctx, spline([[-40, -282], [0, -262], [40, -282]], false, 6), 3.6, { seed: 65 });
  drawHead(ctx, p);
  // arms over the body; the glass sits in the right palm
  sleeve(ctx, JL, 70); drawHand(ctx, JL.ha[0], JL.ha[1], JL.a2, p.handL || 'open', 1, 1.5);
  sleeve(ctx, JR, 80);
  if (p.hold === 'R') glass(ctx, JR.ha[0] + 8, JR.ha[1] - 4, p.glassSize ?? 120, { steam: p.steam ?? 1, t: p.t ?? 0, seed: 320 });
  drawHand(ctx, JR.ha[0], JR.ha[1], JR.a2, p.handR || (p.hold === 'R' ? 'grip' : 'open'), -1, 1.5);
  ctx.restore();
  return { JL, JR };
}

function drawHead(ctx, p) {
  const face = p.face || 'neutral', blink = p.blink ?? 0, [lx, ly] = p.look || [0, 0];
  // ears
  [-1, 1].forEach((sd, i) => shape(ctx, ellipse(sd * 74, -392, 14, 22, 12), { fill: C.skin, line: 3.6, seed: 66 + i, grain: 0.1 }));
  // egg head: one outline, chin narrower than the crown
  const head = spline([[0, -476], [52, -462], [76, -410], [70, -352], [44, -316], [0, -304], [-44, -316], [-70, -352], [-76, -410], [-52, -462]], true, 6);
  shape(ctx, head, { fill: C.skin, line: 4.2, seed: 68, grain: 0.15, breaks: 0.12, shade: [{ pts: [[30, -480], [90, -480], [90, -300], [36, -300]], color: C.skinD, alpha: 0.45 }] });
  // hair: a flat side-parted cap shape
  shape(ctx, spline([[-74, -420], [-70, -462], [-20, -490], [40, -486], [76, -446], [74, -416], [46, -446], [-6, -450], [-44, -440]], true, 6), { fill: C.hair, line: 0, seed: 69, grain: 0.3 });
  // eyes
  [-26, 26].forEach((x, i) => {
    const ex = x + lx, ey = -404 + ly;
    if (blink > 0.5 || face === 'happy' || face === 'proud') ink(ctx, face === 'happy' || face === 'proud' ? [[ex - 9, ey + 3], [ex, ey - 6], [ex + 9, ey + 3]] : [[ex - 9, ey], [ex + 9, ey]], 4.4, { seed: 80 + i, taper: false });
    else { const r = face === 'wow' ? 9 : 7.2; shape(ctx, ellipse(ex, ey, r * 0.8, r * 1.3, 14), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] }); shape(ctx, ellipse(ex + 1.6, ey - 3.8, 2.3, 2.7, 8), { fill: PAL.white, line: 0, grain: 0, off: [0, 0] }); }
    const by = face === 'wow' ? -434 : face === 'focus' ? -422 : -428, tl = face === 'focus' ? (i ? -4 : 4) : 0;
    ink(ctx, [[x - 12, by + tl], [x + 12, by - tl - 2]], 4.6, { seed: 90 + i });
  });
  // nose: a short hook that belongs to the face
  ink(ctx, spline([[2, -398], [-8, -372], [6, -366]], false, 5), 3.6, { seed: 95 });
  // moustache: the chaiwala's signature
  shape(ctx, spline([[-38, -346], [-14, -360], [0, -352], [14, -360], [38, -346], [16, -340], [0, -346], [-16, -340]], true, 5), { fill: C.hair, line: 0, seed: 96, grain: 0.2 });
  const my = -330;
  if (face === 'happy' || face === 'proud') shape(ctx, spline([[-18, my - 4], [18, my - 4], [10, my + 12], [-10, my + 12]], true, 6), { fill: '#9C3B25', line: 3.2, seed: 97, grain: 0, breaks: 0 });
  else if (face === 'wow') shape(ctx, ellipse(0, my + 4, 8, 11, 16), { fill: '#9C3B25', line: 3.2, seed: 98, grain: 0, breaks: 0 });
  else ink(ctx, spline([[-12, my], [0, my + 4], [12, my - 1]], false, 5), 3.4, { seed: 99 });
  [-46, 46].forEach((x, i) => shape(ctx, ellipse(x, -360, 12, 8, 12), { fill: '#E58A73', line: 0, grain: 0, seed: 101 + i, alpha: 0.6 }));
}
