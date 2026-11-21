// Page contract: window.READY, window.render(t), window.DUR, window.EV, window.TEXTS
import { textures } from './engine/toon.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['80px Rozha', '500 40px Pop', '600 40px Pop', '700 40px Kalam'].map(f => document.fonts.load(f, 'कप ₹15 चाय')));
textures();
const lines = await (await fetch('lines.json')).json();
const durs = await (await fetch('voice/dur.json')).json();
const film = await import('./film.js');
film.setup(lines, durs);
window.DUR = film.DURATION; window.EV = film.events(); window.SRT = film.srtCues();
window.render = t => { film.renderFilm(g, t); };
window.TEXTS = t => { film.renderFilm(g, t); return film.texts(); };
window.READY = true;
