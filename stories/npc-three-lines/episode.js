// NPC Nico, episode 3: "In this world, every NPC can only say three things."
import * as E from '../engine/engine.js';
import { makeNico, NICO_COLORS } from '../npc-world/nico.js';
import { makePlayer, makeMarkers, markOver, buildCity, storefront, palm, hud, txt, pill } from '../npc-world/world.js';
const { THREE, cam, ease, easeOut, clamp01, lerp, show, makeChar, headPos, handPos, effects, box, cyl, mat, canvasTex } = E;

await document.fonts.load('800 80px Cap');
const T = await (await fetch('build/timings.json')).json();
const W = E.W, H = E.H;

// ---------- cast ----------
const nico = makeNico();
const player = makePlayer();
const mom = makeChar({ shirt: '#c0392b', pants: '#3b3f5c', hairType: 'mom', hair: '#6b3a1e' });
const cop = makeChar({ shirt: '#1f3a8a', pants: '#1a2240', shoes: '#111', hairType: 'police', cap: '#1a2240', stripe: '#f2c94c' });
const extras = E.makeExtras(6, 303);
const marks = makeMarkers(4);

// ---------- city ----------
const city = buildCity('city', { skipLeft: [-14], palmSkip: [[-1, -14]] });
storefront(city, -1, -14, { wall: '#ffd59e', text: 'SUNSET APTS', bg: '#16C7C1' });
box(0.2, 2.6, 1.6, mat('#6b4128'), -7.95, 1.48, -14, city);

// ---------- bridge ----------
const bridge = new THREE.Group();
{
  const water = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), mat('#2bb5d6', { roughness: 0.15, metalness: 0.1, emissive: '#0b4a66', emissiveIntensity: 0.25 })); water.rotation.x = -Math.PI / 2; water.position.y = -3; bridge.add(water);
  const grass = mat('#6cc06a'), road = mat('#3b4050'), walk = mat('#ece2d0'), dash = mat('#ffd23b');
  for (const s of [-1, 1]) {
    box(300, 4, 150, grass, 0, -2, s * 97, bridge);
    box(8, 0.05, 150, road, 0, 0.025, s * 97, bridge, false);
    for (const x of [-1, 1]) box(3.2, 0.18, 150, walk, x * 5.6, 0.09, s * 97, bridge, false);
    for (let z = 24; z < 170; z += 6) box(0.16, 0.06, 2.6, dash, 0, 0.03, s * z, bridge, false);
    for (let z = 26; z < 160; z += 12) { palm(bridge, -7.6, s * z, 1, z * s); palm(bridge, 7.6, s * (z + 6), 1, z * s + 9); }
  }
  // skyline on the far bank
  const r = E.rng(9), cols = ['#ffb3c7', '#9be7e2', '#ffd59e', '#c7b3ff', '#ff9e8a'];
  for (let i = 0; i < 16; i++) { const h = 12 + r() * 30; box(10, h, 10, mat(cols[i % 5]), -80 + i * 11, h / 2, 120 + r() * 30, bridge); }
}
const deckM = mat('#3b4050'), deckSide = mat('#c9bfae'), rail = mat('#ff3e9a');
function deck(parent, z0, z1, dz = 0) {
  const len = z1 - z0, cz = (z0 + z1) / 2 - dz;
  box(12, 0.8, len, deckSide, 0, -0.4, cz, parent); box(8, 0.06, len, deckM, 0, 0.03, cz, parent, false);
  for (const x of [-1, 1]) { box(2, 0.12, len, mat('#ece2d0'), x * 5, 0.06, cz, parent, false); box(0.2, 1.0, len, rail, x * 5.9, 0.6, cz, parent); }
  for (let z = z0 + 1; z < z1; z += 6) box(0.16, 0.08, 2.6, mat('#ffd23b'), 0, 0.07, z - dz, parent, false);
}
deck(bridge, -22, -4); deck(bridge, 4, 22);
for (const z of [-13, 13]) for (const x of [-4, 4]) cyl(0.8, 0.9, 6, mat('#c9bfae'), x, -3, z, bridge, 12);
const mid = new THREE.Group(); mid.position.set(0, 0, -4); bridge.add(mid); deck(mid, -4, 4, -4); // pivot on the near edge (z=-4)
const crackTex = canvasTex(512, 512, (g) => {
  g.clearRect(0, 0, 512, 512); g.strokeStyle = 'rgba(10,8,12,0.95)'; g.lineCap = 'round'; const r = E.rng(5);
  for (let b = 0; b < 5; b++) { g.lineWidth = 26 - b * 4; g.beginPath(); let x = 0, y = 240 + b * 10; g.moveTo(x, y); while (x < 512) { x += 30 + r() * 30; y += (r() - 0.5) * 70; g.lineTo(x, y); } g.stroke(); }
});
const crack = new THREE.Mesh(new THREE.PlaneGeometry(11, 5), new THREE.MeshBasicMaterial({ map: crackTex, transparent: true })); crack.rotation.x = -Math.PI / 2; crack.position.set(0, 0.09, 0); mid.add(crack);
const crack2 = crack.clone(); crack2.position.set(0, 0.09, -4); crack2.scale.set(1, 0.6, 1); bridge.add(crack2);
const splash = new THREE.Group(); bridge.add(splash); { const sm = mat('#ffffff', { transparent: true, opacity: 0.85 }); for (let i = 0; i < 14; i++) E.sphere(0.6 + (i % 3) * 0.3, sm, Math.cos(i) * 3, 0, Math.sin(i * 1.7) * 3, splash, 8); }
E.addSet('bridge', bridge);

// the player's convertible (cabin + glass hidden)
const pcar = E.car(bridge, 1.6, -60, 0, '#e53935'); pcar.children[1].visible = false; pcar.children[2].visible = false;
const smoke = new THREE.Group(); bridge.add(smoke); { const sm = mat('#bbbbbb', { transparent: true, opacity: 0.7 }); for (let i = 0; i < 8; i++) E.sphere(0.5 + i * 0.08, sm, (i % 2 ? 1 : -1) * 1.0, 0.4 + i * 0.12, -1.6 - i * 0.35, smoke, 8); }

// ---------- helpers ----------
const OVER = { bubbles: [] };
let mi = 0;
function set(where, light = 'sunset') { show(where, light); mi = 0; mid.position.set(0, 0, -4); mid.rotation.set(0, 0, 0); mid.visible = true; splash.visible = false; smoke.visible = false; pcar.position.set(1.6, 0, -60); pcar.rotation.set(0, 0, 0); }
const mark = (ch, t) => markOver(marks[mi++ % marks.length], ch, t, mi);
function bubble(ch, text, style = 'white') { OVER.bubbles.push({ ch, text, style }); }
function cycle(k, arr) { return arr[Math.min(arr.length - 1, Math.floor(k * arr.length))]; }
function driving(x, z, ry, t) { pcar.position.set(x, 0, z); pcar.rotation.set(0, ry, 0); const c = Math.cos(ry), s = Math.sin(ry);
  player.place(x + (-0.45) * c + (-0.3) * s, 0.55, z - (-0.45) * s + (-0.3) * c, ry); player.expr = 'blank'; player.pose({ sit: true, t, armR: [-1.3, 0, 0], armL: [-1.3, 0, 0] }); mark(player, t); }
const near = (ch, dx, dy, dz, k, fov = 42, pull = [0, 0, 0]) => { const h = headPos(ch, 0.4), m = 1.35; cam([h.x + dx * m, h.y + dy, h.z + dz * m], [h.x + (dx + pull[0]) * m, h.y + dy + pull[1], h.z + (dz + pull[2]) * m], [h.x, h.y - 0.14, h.z], [h.x, h.y - 0.1, h.z], ease(k), fov); };
const NB = [5.4, -30]; // Nico's spot on the near bank sidewalk

// ---------- shots ----------
const S = {
  npc_lines_a(t, d, k) {
    set('city'); const lines = ['Nice day!', 'Hey!', 'Watch it!'];
    extras.slice(0, 3).forEach((c, i) => { c.place(4.8 + i * 0.6, 0.18, -2 - i * 2.6, -Math.PI / 2 + 0.5); c.expr = 'smile'; c.pose({ t }); if (k > i * 0.25) bubble(c, lines[i]); });
    cam([0.0, 2.8, 4.0], [0.4, 2.8, 3.2], [5.4, 2.2, -4], [5.4, 2.2, -4], ease(k), 50);
  },
  npc_lines_b(t, d, k) {
    set('city'); const lines = ['Hot dogs!', 'Got any change?', 'Nice car!'];
    extras.slice(3, 6).forEach((c, i) => { c.place(-5.0 - (i % 2) * 0.6, 0.18, 2 - i * 2.4, Math.PI / 2 - 0.4); c.expr = i === 1 ? 'confused' : 'smile'; c.pose({ t }); if (k > i * 0.25) bubble(c, lines[i]); });
    cam([0.2, 2.8, 5.0], [-0.2, 2.8, 4.2], [-5.4, 2.2, -0.5], [-5.4, 2.2, -0.5], ease(k), 50);
  },
  cop_lines(t, d, k) {
    set('city'); cop.place(5.0, 0.18, -2, -Math.PI / 2 + 0.3); cop.expr = k < 0.66 ? 'angry' : 'smile'; cop.pose({ t, armR: k < 0.66 ? [-1.6, 0, 0] : null });
    bubble(cop, cycle(k, ['Freeze!', 'Stop right there!', 'Nice weather.'])); near(cop, -2.6, 0.2, 1.2, k, 46);
  },
  mom_lines(t, d, k) {
    set('city'); mom.place(-6.6, 0.18, -14, Math.PI / 2); mom.expr = cycle(k, ['smile', 'happy', 'shock']); mom.pose({ t, armR: k > 0.66 ? [-1.6, 0, 0.2] : null });
    bubble(mom, cycle(k, ["Dinner's ready.", 'Love you.', 'Did you see that?'])); near(mom, 2.6, 0.2, 1.4, k, 46);
  },
  nico_lines(t, d, k) {
    set('city'); nico.place(5.2, 0.18, 0, -Math.PI / 2 + 0.4); nico.expr = cycle(k, ['talk', 'grin', 'angry']); nico.pose({ t, armR: cycle(k, [[-2.6, 0, 0.4], [-1.6, 0, 0], [-1.2, 0, 0.3]]) });
    bubble(nico, cycle(k, ['Hey!', 'Nice car!', 'Watch it!'])); near(nico, -2.6, 0.2, 1.2, k, 46);
  },
  counter(t, d, k) {
    set('city'); nico.place(4.6, -0.5, 0, -Math.PI / 2); nico.expr = 'sleep'; nico.pose({ sit: true, t, headX: 0.3 });
    OVER.count = Math.floor(lerp(7999000, 8000000, easeOut(k)));
    cam([0.6, 2.0, 3.6], [0.8, 2.0, 3.0], [4.6, 2.4, 0], [4.6, 2.4, 0], ease(k), 48);
  },
  nico_sees(t, d, k) {
    set('bridge'); const z = lerp(-34, -27, easeOut(clamp01(k * 1.4))); nico.place(NB[0], 0.18, z, 0); nico.expr = k > 0.6 ? 'shock' : 'smile'; nico.pose({ walk: t * 6, amp: k < 0.7 ? 0.5 : 0, t, headX: k > 0.6 ? 0.35 : 0 });
    cam([2.6, 2.6, z - 5], [2.8, 2.6, z - 4.6], [NB[0], 1.6, z + 4], [NB[0], 1.2, z + 8], ease(k), 50);
  },
  bridge_crack(t, d, k) {
    set('bridge'); mid.rotation.x = Math.sin(t * 30) * 0.002;
    cam([2.0, 3.0, -9], [1.2, 2.2, -7.5], [0, 0, -4], [0, 0, -3.5], ease(k), 46);
  },
  player_racing(t, d, k) {
    set('bridge'); const z = lerp(-150, -64, k); driving(0.8, z, 0, t); OVER.stars = 2;
    cam([-2.4, 0.9, -50], [-2.3, 0.9, -50], [0.8, 1.2, z], [0.8, 1.2, z], 0, 46);
  },
  nico_panic(t, d, k) {
    set('bridge'); nico.place(NB[0], 0.18, -27, -Math.PI + 0.4); nico.expr = 'worried'; nico.o.look = Math.sin(t * 4) > 0 ? 1 : -1; nico.pose({ t, headY: Math.sin(t * 4) * 0.2 });
    OVER.options = { used: 0 }; near(nico, -1.2, 0.2, -2.4, k, 44);
  },
  yell_hey(t, d, k) {
    set('bridge'); nico.place(1.8, 0, -40, Math.PI); nico.expr = 'talk'; nico.pose({ t, armR: [-2.8 + Math.sin(t * 9) * 0.3, 0, 0.4], armL: [-2.8 - Math.sin(t * 9) * 0.3, 0, -0.4] });
    driving(1.6, lerp(-110, -62, k), 0, t); bubble(nico, 'HEY!', 'yell'); OVER.options = { used: 0, active: 0 }; OVER.stars = 2;
    cam([3.4, 2.2, -35], [3.2, 2.2, -35.5], [1.8, 2.2, -48], [1.6, 2.0, -52], ease(k), 50);
  },
  honk_around(t, d, k) {
    set('bridge'); const z = lerp(-60, -22, k), sw = Math.sin(clamp01((z + 52) / 22) * Math.PI);
    driving(lerp(1.6, -2.2, sw), z, -0.35 * Math.cos(clamp01((z + 52) / 22) * Math.PI) * (sw > 0.05 ? 1 : 0), t);
    nico.place(1.8, 0, -40, Math.PI - k * 2.5); nico.expr = 'shock'; nico.pose({ t, armR: [-2.8, 0, 0.3], armL: [-2.8, 0, -0.3] });
    if (k > 0.25 && k < 0.6) OVER.honk = true; OVER.options = { used: 1 };
    cam([7.0, 3.4, -38], [6.6, 3.4, -36], [1.0, 1.0, -42], [0.0, 1.0, -34], ease(k), 52);
  },
  chase(t, d, k) {
    set('bridge'); const z = lerp(-36, -26, k); driving(-1.6, z + 3.2, 0, t);
    nico.place(1.2, 0, z, 0); nico.expr = 'talk'; nico.pose({ walk: t * 14, amp: 1, t, lean: 0.25, armR: [-2.6, 0, 0.4] });
    bubble(nico, 'NICE CAR!', 'yell'); OVER.options = { used: 1, active: 1 };
    cam([3.6, 2.4, z + 7], [3.6, 2.4, z + 7], [0, 1.6, z + 1], [0, 1.6, z + 1], 0, 52);
  },
  thumbs(t, d, k) {
    set('bridge'); const z = lerp(-30, -26, k); driving(-1.6, z, 0, t); player.expr = 'grin'; player.pose({ sit: true, t, armL: [-1.3, 0, 0], armR: [-2.9, 0, 0.5] });
    OVER.options = { used: 2 }; cam([-5.4, 2.4, z + 4.5], [-5.2, 2.4, z + 4.0], [-1.6, 1.8, z], [-1.6, 1.8, z], ease(k), 44);
  },
  jump_front(t, d, k) {
    set('bridge'); const j = easeOut(clamp01((k - 0.3) / 0.4)); nico.place(lerp(4.6, 0.6, j), j > 0 && j < 1 ? Math.sin(j * Math.PI) * 0.8 : (j >= 1 ? 0 : 0.18), -24.6, -Math.PI / 2 - j * Math.PI / 2); nico.expr = 'determined'; nico.pose({ t, armR: [-1.6, 0, 1.2], armL: [-1.6, 0, -1.2] });
    driving(0.4, lerp(-58, -40, k), 0, t); OVER.options = { used: 2 };
    cam([4.6, 2.0, -19], [4.2, 2.0, -19.5], [0.6, 1.4, -32], [0.6, 1.4, -34], ease(k), 52);
  },
  watch_it(t, d, k) {
    set('bridge'); nico.place(0.6, 0, -24.6, Math.PI); nico.expr = 'angry'; nico.pose({ t, armR: [-1.6, 0, 1.2], armL: [-1.6, 0, -1.2] });
    driving(0.4, lerp(-36, -32, k), 0, t); bubble(nico, 'WATCH IT!', 'yell'); OVER.options = { used: 2, active: 2 }; effects.shake(0.05);
    cam([1.8, 2.8, -20.5], [1.6, 2.8, -21.0], [0.6, 2.5, -24.6], [0.6, 2.5, -24.6], ease(k), 46);
  },
  brakes(t, d, k) {
    set('bridge'); const bz = lerp(-34, -29.0, easeOut(clamp01(k / 0.5))); driving(0.4, bz, 0, t); player.expr = 'shock';
    nico.place(0.6, 0, -24.6, Math.PI); nico.expr = 'shock'; nico.pose({ t, armR: [-1.6, 0, 1.2], armL: [-1.6, 0, -1.2] });
    smoke.position.copy(pcar.position); smoke.visible = k < 0.8; if (k < 0.5) effects.shake(0.12);
    OVER.inches = k > 0.5;
    cam([-8.5, 1.6, -25.4], [-8.2, 1.6, -25.4], [0.5, 1.7, -25.8], [0.5, 1.7, -25.8], 0, 54);
  },
  collapse(t, d, k) {
    set('bridge'); driving(0.4, -29.0, 0, t);
    nico.place(0.6, 0, -24.6, 0); nico.expr = 'shock'; nico.pose({ t });
    const c = clamp01((k - 0.3) / 0.6); mid.rotation.x = easeOut(c) * 0.9; mid.position.y = -c * c * 6;
    if (c > 0.6) { splash.position.set(0, -3 + (c - 0.6) * 6, 0); splash.scale.setScalar(0.6 + (c - 0.6) * 2); splash.visible = true; }
    if (k > 0.3 && k < 0.9) effects.shake(0.15); if (k > 0.3 && k < 0.36) effects.flash(0.4);
    cam([9.0, 4.0, -30], [8.5, 4.4, -31], [0, 0, -6], [0, -1, -4], ease(k), 52);
  },
  player_looks(t, d, k) {
    set('bridge'); mid.visible = false; driving(0.4, -29.0, 0, t); player.place(-1.6, 0, -27.0, 0); player.expr = 'shock'; player.pose({ t }); mark(player, t);
    nico.place(0.8, 0, -24.4, 0.2); nico.expr = 'worried'; nico.pose({ t });
    cam([-0.4, 4.6, -35], [-0.4, 4.8, -34], [0, 0.5, -10], [0, 0.0, -4], ease(k), 50);
  },
  player_turns(t, d, k) {
    set('bridge'); mid.visible = false; driving(0.4, -29.0, 0, t); player.place(-1.6, 0, -24.8, lerp(0, 1.2, ease(k))); player.expr = 'blank'; player.pose({ t }); mark(player, t);
    near(player, 2.0, 0.2, 1.6, k, 44);
  },
  tension(t, d, k) {
    set('bridge'); mid.visible = false; driving(0.4, -29.0, 0, t); player.place(-1.6, 0, -24.6, 1.3); player.expr = 'blank'; player.pose({ t }); mark(player, t);
    nico.place(0.6, 0, -24.2, -1.6); nico.expr = 'worried'; nico.pose({ t });
    cam([-0.5, 2.6, -19.5], [-0.5, 2.6, -20.4], [-0.5, 2.3, -24.4], [-0.5, 2.3, -24.4], ease(k), 46);
  },
  thank_you(t, d, k) {
    set('bridge'); mid.visible = false; player.place(-1.6, 0, -24.6, 1.3); player.expr = 'smile'; player.pose({ t }); mark(player, t);
    bubble(player, 'Thank you.', 'gold'); near(player, 2.2, 0.2, 0.9, k, 44, [-0.3, 0, -0.1]);
  },
  end_two(t, d, k) {
    set('bridge'); mid.visible = false; player.place(-1.0, 0, -22.6, 0); player.expr = 'smile'; player.pose({ t }); mark(player, t);
    nico.place(1.0, 0, -22.6, 0); nico.expr = 'grin'; nico.pose({ t, armR: [-0.4, 0, 0.6] });
    cam([0, 2.4, -30], [0, 2.6, -31], [0, 2.0, -18], [0, 2.2, -14], ease(k), 50);
  },
  end_pull(t, d, k) {
    set('bridge'); mid.visible = false; driving(0.4, -29.0, 0, t); player.place(-1.0, 0, -22.6, 0); player.expr = 'smile'; player.pose({ t }); mark(player, t);
    nico.place(1.0, 0, -22.6, 0); nico.expr = 'grin'; nico.pose({ t });
    cam([0, 2.6, -31], [14, 26, -60], [0, 2.0, -16], [0, 0, -6], ease(k), 50);
  },
};

// ---------- overlay ----------
const v3 = new THREE.Vector3();
function drawBubble(ctx, x, y, text, style) {
  const size = style === 'yell' ? 84 : style === 'gold' ? 80 : 64;
  ctx.save(); ctx.font = `800 ${size}px Cap`; const w = ctx.measureText(text).width + size * 1.1, h = size * 1.6;
  x = Math.max(w / 2 + 30, Math.min(W - w / 2 - 30, x)); y = Math.max(h + 470, y);
  ctx.fillStyle = style === 'gold' ? '#ffd23b' : style === 'yell' ? '#ffffff' : '#ffffff'; ctx.strokeStyle = '#120a24'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h, w, h, h / 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 22, y - 4); ctx.lineTo(x, y + 34); ctx.lineTo(x + 18, y - 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = style === 'yell' ? '#e53935' : '#120a24'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y - h / 2 + 4); ctx.restore();
}
const OPTS = ['Hey!', 'Nice car!', 'Watch it!'];
function overlay(ctx, time, shot, t, d) {
  hud(ctx, time, { stars: OVER.stars || 0 });
  for (const b of OVER.bubbles) { const p = headPos(b.ch, 0.4); v3.set(p.x, p.y + 1.1, p.z).project(E.camera); drawBubble(ctx, (v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H, b.text, b.style); }
  if (OVER.count != null) { pill(ctx, 'LINES SAID', W / 2, H * 0.24, 50, '#ffffff'); txt(ctx, OVER.count.toLocaleString('en-US'), W / 2, H * 0.32, 120, NICO_COLORS.lime); }
  if (OVER.options) {
    const o = OVER.options, x0 = W / 2 - 300, y0 = H * 0.70;
    ctx.save(); ctx.fillStyle = 'rgba(18,10,36,0.82)'; ctx.beginPath(); ctx.roundRect(x0 - 20, y0 - 20, 640, 270, 30); ctx.fill(); ctx.restore();
    txt(ctx, 'DIALOGUE OPTIONS', W / 2, y0 + 20, 36, '#5ff2ff');
    OPTS.forEach((s, i) => { const y = y0 + 85 + i * 64, used = i < o.used, act = o.active === i;
      if (act) { ctx.save(); ctx.fillStyle = 'rgba(255,62,154,0.9)'; ctx.beginPath(); ctx.roundRect(x0 + 10, y - 28, 580, 56, 16); ctx.fill(); ctx.restore(); }
      txt(ctx, `${i + 1}.  ${s}`, x0 + 40, y, 46, used ? 'rgba(255,255,255,0.35)' : '#ffffff', 'left');
      if (used) { ctx.save(); ctx.strokeStyle = '#ff3e9a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x0 + 30, y); ctx.lineTo(x0 + 360, y); ctx.stroke(); ctx.restore(); } });
  }
  if (OVER.honk) { ctx.save(); ctx.translate(W * 0.3, H * 0.33); ctx.rotate(-0.12); txt(ctx, 'HONK HONK!', 0, 0, 110, '#ffd23b'); ctx.restore(); }
  if (OVER.inches) pill(ctx, '2 INCHES', W / 2, H * 0.3, 64, '#ff3e9a');
  OVER.bubbles = []; for (const key of Object.keys(OVER)) if (key !== 'bubbles') delete OVER[key];
}

E.run({ timings: T, shots: S, overlay });
