// NPC Nico, episode 1: "In this world, every time the player reloads, everything resets."
// Setting: inside a GTA-style open-world game (original art: neon beach city, our own HUD).
import * as E from '../engine/engine.js';
import { makeNico, NICO_COLORS } from '../npc-world/nico.js';
const { THREE, cam, ease, easeOut, clamp01, lerp, show, makeChar, headPos, handPos, effects, box, cyl, mat, canvasTex, signTex } = E;

await document.fonts.load('800 80px Cap');
const T = await (await fetch('build/timings.json')).json();

// ---------- cast ----------
const nico = makeNico();
const dad = makeChar({ shirt: '#ff8a3d', pants: '#3a3a46', shoes: '#2a2a2a', hairType: 'dad', hair: '#2e1d12', mustache: '#2e1d12' });
const player = makeChar({ shirt: '#2d2d33', pants: '#4a5a7a', shoes: '#111111', hairType: 'cap', cap: '#1b1b1b', stripe: '#e53935' });
const vendor = makeChar({ shirt: '#ffffff', pants: '#3a3a46', hairType: 'cap', cap: '#e53935', mustache: '#3b2618', stripe: '#e53935' });
const busGuy = makeChar({ shirt: '#9b59b6', pants: '#2a3a6a', hairType: 'bob', hair: '#c9a04a' });
const walkers = E.makeExtras(8, 77);

// player marker (floating green diamond, our own design)
const marker = E.prop(new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), new THREE.MeshBasicMaterial({ color: '#3cff8a' })));
marker.scale.set(0.8, 1.3, 0.8); E.scene.add(marker);
function markOver(ch, t) { const h = headPos(ch, 0.4); marker.position.set(h.x, h.y + 1.0 + Math.sin(t * 4) * 0.12, h.z); marker.rotation.y = t * 2; marker.visible = true; }

// ---------- city set ----------
const city = new THREE.Group();
{
  const g = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), mat('#6cc06a')); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; city.add(g);
  box(8, 0.05, 600, mat('#3b4050'), 0, 0.025, 0, city, false);
  const dash = mat('#ffd23b'); for (let z = -280; z < 280; z += 6) { box(0.16, 0.06, 2.6, dash, -0.15, 0.03, z, city, false); box(0.16, 0.06, 2.6, dash, 0.15, 0.03, z, city, false); }
  for (const s of [-1, 1]) { box(3.2, 0.18, 600, mat('#ece2d0'), s * 5.6, 0.09, 0, city, false); box(0.22, 0.22, 600, mat('#c9bfae'), s * 4.05, 0.11, 0, city, false); }
  for (let x = -3.4; x <= 3.4; x += 0.9) box(0.5, 0.06, 3, mat('#ffffff'), x, 0.035, -24, city, false); // crosswalk at the corner
  const r = E.rng(21), walls = ['#ffb3c7', '#9be7e2', '#ffd59e', '#c7b3ff', '#f7f0e0', '#ff9e8a', '#b8f0c8'], neon = ['#ff3e9a', '#16e0d8', '#ffd23b', '#a46bff'];
  for (const s of [-1, 1]) for (let z = -98; z <= 98; z += 14) {
    if (s < 0 && z === 14) continue; // storefront slot
    const h = 7 + r() * 12, wm = mat(walls[Math.floor(r() * walls.length)]);
    box(10, h, 12.6, wm, s * 13, h / 2, z, city);
    const fx = s * 7.97;
    for (let y = 2.2; y < h - 1; y += 2.6) for (const dz of [-4, 0, 4]) box(0.1, 1.5, 2.2, E.glassMat, fx, y, z + dz, city, false);
    const nm = new THREE.MeshBasicMaterial({ color: neon[Math.floor(r() * neon.length)] });
    box(0.14, 0.22, 12.6, nm, fx, h - 0.3, z, city, false); box(0.14, h, 0.22, nm, fx, h / 2, z + 6.2, city, false);
    box(10.4, 0.5, 13, mat('#f4efe6'), s * 13, h + 0.25, z, city);
  }
  // storefront (window that "grows back")
  box(10, 9, 12.6, mat('#9be7e2'), -13, 4.5, 14, city);
  box(10.4, 0.5, 13, mat('#f4efe6'), -13, 9.25, 14, city);
  const sgn = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.2), new THREE.MeshBasicMaterial({ map: signTex('SUNNY MART', { bg: '#ff3e9a', fg: '#ffffff' }) })); sgn.position.set(-7.94, 5.6, 14); sgn.rotation.y = Math.PI / 2; city.add(sgn);
}
const brokenTex = canvasTex(512, 320, (g) => {
  g.fillStyle = '#1d2433'; g.fillRect(0, 0, 512, 320); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 4; const r = E.rng(4);
  for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(250, 150); let x = 250, y = 150; const a = r() * 6.28; for (let k = 0; k < 6; k++) { x += Math.cos(a + (r() - 0.5)) * 50; y += Math.sin(a + (r() - 0.5)) * 50; g.lineTo(x, y); } g.stroke(); }
  g.fillStyle = '#0d1018'; g.beginPath(); g.arc(250, 150, 46, 0, 7); g.fill();
});
const glassTex = canvasTex(512, 320, (g) => {
  const gr = g.createLinearGradient(0, 0, 512, 320); gr.addColorStop(0, '#bff3ff'); gr.addColorStop(1, '#6fc3e8'); g.fillStyle = gr; g.fillRect(0, 0, 512, 320);
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.moveTo(60, 320); g.lineTo(180, 0); g.lineTo(230, 0); g.lineTo(110, 320); g.fill(); g.beginPath(); g.moveTo(200, 320); g.lineTo(290, 0); g.lineTo(310, 0); g.lineTo(220, 320); g.fill();
  g.font = '800 70px Cap'; g.fillStyle = '#ff3e9a'; g.textAlign = 'center'; g.fillText('OPEN 24/7', 380, 260);
});
const shopWinMat = new THREE.MeshStandardMaterial({ map: glassTex, roughness: 0.15, emissive: '#ffffff', emissiveMap: glassTex, emissiveIntensity: 0.25 });
const shopWin = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.4), shopWinMat); shopWin.position.set(-7.93, 2.2, 14); shopWin.rotation.y = Math.PI / 2; city.add(shopWin);
// palms
function palm(parent, x, z, s = 1, seed = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g); const r = E.rng(seed);
  const tm = mat('#9a6b43'); const lean = (r() - 0.5) * 0.3;
  for (let i = 0; i < 7; i++) { const seg = cyl(0.26 - i * 0.015, 0.3 - i * 0.015, 1.05, tm, lean * i * i * 0.08, 0.5 + i * 1.0, 0, g, 8); seg.rotation.z = -lean * i * 0.18; }
  const top = new THREE.Vector3(lean * 36 * 0.08, 7.3, 0); const lm = mat('#2fa84f'), lm2 = mat('#3cc35e');
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + r(); const lf = new THREE.Group(); lf.position.copy(top); lf.rotation.set(0, a, 0); g.add(lf); const b = box(3.2, 0.12, 0.8, i % 2 ? lm : lm2, 1.5, -0.35, 0, lf); b.rotation.z = -0.45; }
  E.sphere(0.35, mat('#6b4a2a'), top.x, top.y - 0.25, 0, g, 8);
  return g;
}
for (const s of [-1, 1]) for (let z = -95; z <= 95; z += 11) { if (s > 0 && Math.abs(z - 1) < 4) continue; if (s < 0 && Math.abs(z - 14) < 6) continue; palm(city, s * 7.3, z + (s > 0 ? 5 : 0), 0.95 + ((z * 7) % 5) * 0.04, z + 300 * s); }
for (const s of [-1, 1]) for (let z = -90; z <= 90; z += 22) E.lamp(city, s * 6.9, z + 3);
// bus stop
const shelter = new THREE.Group(); shelter.position.set(6.3, 0.18, 0); city.add(shelter);
{ const fr = mat('#2b2f3a', { metalness: 0.5, roughness: 0.4 });
  box(0.08, 2.6, 3.8, mat('#bfe8ff', { transparent: true, opacity: 0.45, roughness: 0.05 }), 0.6, 1.3, 0, shelter, false);
  for (const z of [-1.9, 1.9]) box(0.12, 2.8, 0.12, fr, 0.6, 1.4, z, shelter);
  box(1.6, 0.14, 4.1, fr, 0.0, 2.85, 0, shelter);
  box(0.7, 0.1, 3.0, mat('#ff3e9a'), 0.15, 0.62, 0, shelter); box(0.1, 0.6, 0.1, fr, 0.15, 0.3, -1.3, shelter); box(0.1, 0.6, 0.1, fr, 0.15, 0.3, 1.3, shelter);
  const ad = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.0), new THREE.MeshBasicMaterial({ map: signTex('BUS', { w: 256, h: 320, bg: '#16C7C1', fg: '#ffffff', font: '800 110px Cap' }) })); ad.position.set(0.55, 1.4, 0.9); ad.rotation.y = -Math.PI / 2; shelter.add(ad);
}
// hot dog stand
const stand = new THREE.Group(); stand.position.set(-5.8, 0.18, 6); stand.rotation.y = Math.PI / 2; city.add(stand);
{ box(2.4, 1.0, 1.1, mat('#e53935'), 0, 0.75, 0, stand); box(2.5, 0.08, 1.2, mat('#dcdcdc', { metalness: 0.6 }), 0, 1.3, 0, stand);
  cyl(0.05, 0.05, 2.2, mat('#666'), 0, 2.2, 0, stand, 8); const um = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.6, 10, 1, true), mat('#ffd23b', { side: THREE.DoubleSide })); um.position.y = 3.2; stand.add(um);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.5), new THREE.MeshBasicMaterial({ map: signTex('HOT DOGS', { bg: '#ffd23b', fg: '#e53935' }) })); s.position.set(0, 0.85, 0.56); stand.add(s);
  for (const x of [-0.9, 0.9]) { const w = cyl(0.25, 0.25, 0.1, mat('#222'), x, 0.25, 0.6, stand, 12); w.rotation.x = Math.PI / 2; } }
const hotdog = E.prop(new THREE.Group()); E.scene.add(hotdog);
{ const b = box(0.5, 0.16, 0.2, mat('#e8b86a'), 0, 0, 0, hotdog); const sg = cyl(0.07, 0.07, 0.62, mat('#c0392b'), 0, 0.08, 0, hotdog, 8); sg.rotation.z = Math.PI / 2; box(0.5, 0.03, 0.06, mat('#ffd23b'), 0, 0.16, 0, hotdog, false); }
// cars
const dadCar = E.car(city, 2.2, -8, 0, '#ffd23b');
const crashCar = E.car(city, -2.2, 18, Math.PI, '#16C7C1');
const redCar = E.car(city, -2, -20, 0.2, '#e53935');
const smoke = E.prop(new THREE.Group()); E.scene.add(smoke);
{ const sm = mat('#555', { transparent: true, opacity: 0.6 }); for (let i = 0; i < 6; i++) E.sphere(0.5 + i * 0.12, sm, Math.sin(i) * 0.3, i * 0.6, 0, smoke, 8); }
// truck
const truck = new THREE.Group(); city.add(truck);
{ box(2.6, 2.3, 2.2, mat('#2b5fd6', { roughness: 0.4 }), 0, 1.75, 3.6, truck); box(2.62, 0.9, 0.08, mat('#9cc9ef', { roughness: 0.1 }), 0, 2.3, 4.71, truck, false);
  box(2.7, 3.2, 6.8, mat('#f2f2f2'), 0, 2.2, -1.0, truck); box(2.72, 0.5, 6.82, mat('#ff3e9a'), 0, 1.0, -1.0, truck);
  for (const [x, z] of [[-1.2, 3.4], [1.2, 3.4], [-1.2, -0.5], [1.2, -0.5], [-1.2, -3.0], [1.2, -3.0]]) { const w = cyl(0.55, 0.55, 0.4, mat('#1d1d22'), x, 0.55, z, truck, 14); w.rotation.z = Math.PI / 2; }
  const hl = mat('#fffbe0', { emissive: '#fff6c0', emissiveIntensity: 3 }); box(0.6, 0.35, 0.06, hl, -0.85, 1.15, 4.73, truck, false); box(0.6, 0.35, 0.06, hl, 0.85, 1.15, 4.73, truck, false);
  const L = new THREE.PointLight('#fff2c0', 6, 26, 1.2); L.position.set(0, 1.4, 6.5); truck.add(L); }
truck.visible = false;
E.addSet('city', city);

// ---------- alley set ----------
const alley = new THREE.Group();
const brick = canvasTex(512, 512, (g) => { g.fillStyle = '#8e4a52'; g.fillRect(0, 0, 512, 512); g.fillStyle = '#7a3c45'; for (let y = 0; y < 512; y += 32) for (let x = (y / 32) % 2 ? -32 : 0; x < 512; x += 64) g.fillRect(x + 2, y + 2, 60, 28); }, [6, 3]);
{ const gr = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat('#4a4e5c')); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; alley.add(gr);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), mat('#ffffff', { map: brick })); wall.position.set(0, 4.5, -4); wall.receiveShadow = true; alley.add(wall);
  for (const s of [-1, 1]) { const sw = box(0.4, 9, 24, mat('#ffffff', { map: brick }), s * 9, 4.5, 8, alley); }
  const dm = new THREE.Group(); dm.position.set(0, 0, -2.8); alley.add(dm);
  box(2.6, 1.6, 1.6, mat('#2e7d4f', { roughness: 0.5 }), 0, 0.85, 0, dm); box(2.7, 0.15, 1.7, mat('#256a42'), 0, 1.72, -0.1, dm).rotation.x = -0.25;
  const ns = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.1), new THREE.MeshBasicMaterial({ map: signTex('NO PARKING', { bg: '#16C7C1', fg: '#ffffff' }) })); ns.position.set(0, 6.8, -3.95); alley.add(ns);
  const al = new THREE.PointLight('#ff7ad0', 2.2, 16, 1.4); al.position.set(-3, 5.5, 0); alley.add(al); const al2 = new THREE.PointLight('#5ff2ff', 2.2, 16, 1.4); al2.position.set(4, 5.5, 0); alley.add(al2); }
function notesTex(lines, { ink = '#ffffff', big = null, bigColor = '#ff3e9a', tally = true }) {
  return canvasTex(1024, 1024, (g) => {
    g.clearRect(0, 0, 1024, 1024); const r = E.rng(ink.length * 7 + lines.length);
    g.textAlign = 'left'; g.textBaseline = 'middle';
    lines.forEach((ln, i) => { g.save(); g.translate(60 + r() * 30, 80 + i * 92); g.rotate((r() - 0.5) * 0.07); g.font = `800 ${ln.size || 62}px Cap`; g.fillStyle = ink; g.globalAlpha = 0.92; g.fillText(ln.t, 0, 0); g.restore(); });
    if (tally) { g.strokeStyle = ink; g.lineWidth = 7; g.globalAlpha = 0.85; for (let b = 0; b < 9; b++) { const x0 = 560 + (b % 3) * 150, y0 = 520 + Math.floor(b / 3) * 120; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x0 + k * 24, y0); g.lineTo(x0 + k * 24 + 4, y0 + 80); g.stroke(); } g.beginPath(); g.moveTo(x0 - 10, y0 + 60); g.lineTo(x0 + 90, y0 + 20); g.stroke(); } g.globalAlpha = 1; }
    if (big) { g.save(); g.translate(512, 900); g.rotate(-0.06); g.font = '800 150px Cap'; g.textAlign = 'center'; g.lineWidth = 16; g.strokeStyle = '#111'; g.strokeText(big, 0, 0); g.fillStyle = bigColor; g.fillText(big, 0, 0); g.strokeStyle = bigColor; g.lineWidth = 10; g.beginPath(); g.ellipse(0, 0, 470, 110, 0, 0, 7); g.stroke(); g.restore(); }
  });
}
const nicoNotes = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), new THREE.MeshBasicMaterial({ transparent: true, map: notesTex([{ t: 'DAY 1 - dad car stolen' }, { t: 'DAY 2 - stolen AGAIN' }, { t: 'DAY 37 - bus stop crash' }, { t: 'DAY 118 - he did it again' }, { t: 'DAY 450 - 2000 cars' }, { t: 'DAY 900', size: 96 }], { ink: '#ffffff', big: 'I REMEMBER', bigColor: '#E8FF3A' }) }));
nicoNotes.position.set(-4.6, 3.0, -3.97); alley.add(nicoNotes);
const playerNotes = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), new THREE.MeshBasicMaterial({ transparent: true, map: notesTex([{ t: 'DAY 1 - truck. failed' }, { t: 'DAY 2 - too late' }, { t: 'DAY 3 - too late' }, { t: 'DAY 451 - almost' }, { t: 'DAY 899 - try earlier' }, { t: 'DAY 900', size: 96 }], { ink: '#5fd0ff', big: 'SAVE NICO', bigColor: '#ff3e9a' }) }));
playerNotes.position.set(4.6, 3.0, -3.97); alley.add(playerNotes);
const marker2 = new THREE.Mesh(cyl(0.06, 0.06, 0.5, mat('#ffffff')).geometry, mat('#ffffff')); // chalk in hand
E.prop(marker2); E.scene.add(marker2);
E.addSet('alley', alley);

// ---------- helpers ----------
const NX = 5.0, NZ = 0.8; // Nico's spot at the bus stop
let nightMode = false;
const day = (set = 'city') => { show(set, 'sunset'); nightMode = false; };
const night = (set = 'city') => { show(set, 'neon'); nightMode = true; };
function reset() {
  truck.visible = false; dadCar.position.set(2.2, 0, -8); dadCar.rotation.set(0, 0, 0); crashCar.position.set(-2.2, 0, 18); crashCar.rotation.set(0, Math.PI, 0);
  redCar.position.set(-2, 0, -20); redCar.rotation.set(0, 0.2, 0); shelter.rotation.set(0, 0, 0); shelter.position.set(6.3, 0.18, 0); shopWinMat.map = glassTex; shopWinMat.emissiveMap = glassTex;
  playerNotes.visible = true; dadCar.visible = !nightMode;
}
const head = (ch, dy = 0) => headPos(ch, dy);
const near = (ch, dx, dy, dz, k, fov = 44, pull = [0, 0, 0]) => { const h = head(ch, 0.4), m = 1.35; cam([h.x + dx * m, h.y + dy, h.z + dz * m], [h.x + (dx + pull[0]) * m, h.y + dy + pull[1], h.z + (dz + pull[2]) * m], [h.x, h.y - 0.14, h.z], [h.x, h.y - 0.1, h.z], ease(k), fov); };
const walkersOn = (t, n = 6, zBase = 0, faceExpr = 'blank') => walkers.slice(0, n).forEach((c, i) => {
  const dir = i % 2 ? 1 : -1, x = dir > 0 ? 4.9 + (i % 3) * 0.3 : 6.3 - (i % 3) * 0.25; const z = zBase + ((i * 5.3 + dir * t * 2.2) % 26 + 26) % 26 - 13;
  c.place(x, 0.18, z, dir > 0 ? 0 : Math.PI); c.expr = faceExpr; c.pose({ walk: t * 7 + i, amp: 0.55, t });
});
const fullScreen = { load_screen: 'load', load_screen2: 'load', game_over: 'over', game_over2: 'over', reload_montage: 'montage' };
const STARS = { dad_car_stolen: 2, dad_shock: 2, busstop_crash: 3, player_stand: 0, truck_coming: 0, player_run: 1, grab_save: 0, truck_miss: 1 };

// ---------- shots ----------
const S = {
  load_screen(t, d, k) { day(); reset(); cam([0, 30, 40], [0, 30, 40], [0, 0, 0], [0, 0, 0], 0); },
  load_screen2(t, d, k) { S.load_screen(t, d, k); },
  city_reset(t, d, k) {
    day(); reset(); walkersOn(t, 4, 14);
    const fixed = k > 0.42; crashCar.rotation.set(0, Math.PI + (fixed ? 0 : 0.6), fixed ? 0 : Math.PI); crashCar.position.y = fixed ? 0 : 1.9;
    redCar.rotation.set(fixed ? 0 : 0.5, 0.2, fixed ? 0 : 1.2); redCar.position.y = fixed ? 0 : 1.0;
    if (!fixed) { smoke.position.set(-2.2, 1.5 + t * 0.3, 18); smoke.visible = true; }
    if (k > 0.42 && k < 0.6) effects.flash(1 - (k - 0.42) / 0.18, '255,255,255');
    if (fixed) { E.sparkles.position.set(-2.2, 1.6, 18); E.sparkles.visible = true; }
    cam([4, 9, 34], [3, 7, 30], [-1, 1, 12], [-1, 1.2, 12], ease(k), 52);
  },
  car_fix(t, d, k) {
    day(); reset(); const fixed = k > 0.45;
    crashCar.rotation.set(0, Math.PI + (fixed ? 0 : 0.6), fixed ? 0 : Math.PI); crashCar.position.y = fixed ? lerp(0.8, 0, clamp01((k - 0.45) * 8)) : 1.9;
    if (!fixed) { smoke.position.set(-2.2, 1.8 + t * 0.4, 18); smoke.visible = true; } else { E.sparkles.position.set(-2.2, 1.5, 18); E.sparkles.visible = true; }
    if (k > 0.45 && k < 0.6) effects.flash(0.8 * (1 - (k - 0.45) / 0.15));
    cam([3.5, 2.6, 25], [3.0, 2.3, 23.5], [-2.2, 1.2, 18], [-2.2, 1.1, 18], ease(k), 46);
  },
  window_fix(t, d, k) {
    day(); reset(); const fixed = k > 0.5; shopWinMat.map = fixed ? glassTex : brokenTex; shopWinMat.emissiveMap = shopWinMat.map; shopWinMat.needsUpdate = true;
    if (fixed) { E.sparkles.position.set(-7.6, 2.2, 14); E.sparkles.visible = true; } if (k > 0.5 && k < 0.62) effects.flash(0.7 * (1 - (k - 0.5) / 0.12));
    cam([-1.5, 2.4, 19], [-2.2, 2.3, 17.5], [-7.9, 2.2, 14], [-7.9, 2.2, 14], ease(k), 46);
  },
  bus_guy_up(t, d, k) {
    day(); reset(); const up = easeOut(clamp01((k - 0.25) / 0.45));
    busGuy.place(-1.5, lerp(0.3, 0, up), 9, 0.4, lerp(-Math.PI / 2, 0, up)); busGuy.expr = up < 0.5 ? 'sleep' : 'confused'; busGuy.pose({ t, headY: up > 0.9 ? Math.sin(t * 3) * 0.4 : 0 });
    if (k > 0.25 && k < 0.35) effects.flash(0.4);
    cam([2.6, 1.6, 15], [2.2, 1.9, 14], [-1.5, 0.8, 9], [-1.5, 2.0, 9], ease(k), 48);
  },
  hotdog(t, d, k) {
    day(); reset();
    vendor.place(-6.9, 0.18, 6, Math.PI / 2); vendor.expr = 'happy'; vendor.pose({ t, armR: [-1.15, 0, 0] });
    busGuy.place(-4.4, 0.18, 6, -Math.PI / 2); busGuy.expr = k > 0.55 ? 'happy' : 'smile'; busGuy.pose({ t, armR: [-1.4 - (k > 0.55 ? 0.8 : 0), 0, 0], jump: k > 0.55 ? t * 8 : 0 });
    const p = handPos(k > 0.55 ? busGuy : vendor, 1); hotdog.position.set(p.x, p.y + 0.1, p.z); hotdog.rotation.y = Math.PI / 2; hotdog.visible = true;
    cam([-3.4, 2.6, 10.5], [-3.6, 2.5, 9.6], [-5.6, 2.0, 6], [-5.6, 2.1, 6], ease(k), 46);
  },
  npcs_blank(t, d, k) {
    day(); reset(); walkersOn(t, 8, 0);
    cam([0.8, 2.0, 9], [0.8, 2.2, 6], [5.6, 1.9, 0], [5.6, 2.0, -3], ease(k), 50);
  },
  nico_reveal(t, d, k) {
    day(); reset(); walkersOn(t, 6, 0); walkers.forEach((c) => { if (Math.abs(c.root.position.z - NZ) < 1.2 && Math.abs(c.root.position.x - NX) < 0.8) c.hide(); });
    nico.place(NX, 0.18, NZ, -0.4); nico.expr = 'smirk'; nico.o.look = 0; nico.pose({ t, headY: -0.3 });
    near(nico, -2.0, 0.1, 3.4, k, 42, [0.9, 0, -1.4]);
  },
  nico_intro(t, d, k) {
    day(); reset(); nico.place(NX + 0.6, 0.18, NZ, -Math.PI / 2 + 0.6); nico.say(t, 'talk', 'grin'); nico.pose({ t, armR: [-2.7 + Math.sin(t * 7) * 0.25, 0, 0.4] });
    cam([1.4, 2.6, 5.4], [1.8, 2.6, 4.6], [NX + 0.4, 2.1, NZ], [NX + 0.4, 2.2, NZ], ease(k), 46);
  },
  nico_walk(t, d, k) {
    day(); reset(); const z = lerp(NZ, -9, k); nico.place(5.2, 0.18, z, Math.PI); nico.expr = 'blank'; nico.pose({ walk: t * 7, amp: 0.55, t });
    cam([0.6, 2.6, z + 5.5], [0.6, 2.6, z + 5.5], [5.2, 1.6, z - 1], [5.2, 1.6, z - 1], 0, 50);
  },
  nico_walk_back(t, d, k) {
    day(); reset(); const z = lerp(-20, -12, k); nico.place(5.2, 0.18, z, 0); nico.expr = 'sad'; nico.pose({ walk: t * 6, amp: 0.45, t, headX: 0.2 });
    cam([5.0, 2.3, z + 5.5], [5.0, 2.3, z + 4.2], [5.2, 2.0, z], [5.2, 2.0, z], ease(k), 46);
  },
  nico_close(t, d, k) {
    day(); reset(); nico.place(NX, 0.18, NZ, -Math.PI / 2 + 0.3); nico.expr = 'determined'; nico.pose({ t, headX: -0.05 });
    near(nico, -2.6, 0.05, 1.0, k, 40, [0.7, 0, -0.25]);
  },
  dad_car_stolen(t, d, k) {
    day(); reset();
    dad.place(4.6, 0.18, -6.5, -Math.PI / 2 - 0.5); dad.expr = k > 0.5 ? 'shock' : 'smile'; dad.pose({ t, armR: k > 0.5 ? [-2.8, 0, 0.3] : null, armL: k > 0.5 ? [-2.8, 0, -0.3] : null });
    const run = clamp01(k / 0.4);
    if (k < 0.45) { player.place(lerp(-1.5, 1.0, run), 0, lerp(2, -7.5, run), Math.PI - 0.6); player.expr = 'determined'; player.pose({ walk: t * 12, amp: 1, t, lean: 0.25 }); markOver(player, t); }
    else { const dk = clamp01((k - 0.48) / 0.52); dadCar.position.set(2.2 - dk * 0.6, 0, -8 - easeOut(dk) * 0 - dk * dk * 40); dadCar.rotation.y = Math.PI * 0 + dk * 0.05; }
    cam([-1.6, 3.2, 4], [-1.8, 3.4, 3], [3.0, 1.3, -8], [2.4, 1.3, -14], ease(k), 50);
  },
  dad_shock(t, d, k) {
    day(); reset(); dadCar.visible = false;
    dad.place(4.6, 0.18, -6.5, -Math.PI / 2 - 0.2); dad.expr = 'cry'; dad.pose({ t, armR: [-2.9, 0, 0.3], armL: [-2.9, 0, -0.3], jump: t * 6 });
    near(dad, -2.4, -0.1, 1.2, k, 42, [0.8, 0, -0.3]); dadCar.visible = true;
  },
  busstop_crash(t, d, k) {
    day(); reset();
    const hit = 0.55, ck = clamp01(k / hit);
    redCar.position.set(lerp(-1.5, 4.4, ck), 0, lerp(-16, -0.4, ck)); redCar.rotation.set(0, lerp(0.15, 0.9, ck), 0);
    if (k > hit) { shelter.rotation.set(0, 0, -0.18); shelter.position.x = 6.6; redCar.rotation.set(0, 0.9, 0.06); effects.shake(Math.max(0, 0.3 - (k - hit) * 0.8)); smoke.position.set(5, 1.4 + (k - hit) * 2, -0.2); smoke.visible = true; }
    if (k > hit && k < hit + 0.08) effects.flash(0.8);
    nico.place(5.4, 0.18, 4.2, -Math.PI / 2 - 0.4); nico.expr = k > hit ? 'shock' : 'blank'; nico.pose({ t, armR: k > hit ? [-2.7, 0, 0.4] : null, armL: k > hit ? [-2.7, 0, -0.4] : null, jump: k > hit ? (k - hit) * 18 : 0 });
    cam([-2.2, 2.6, 11], [-1.8, 2.7, 10], [4.6, 1.3, 0.5], [4.6, 1.4, 0.5], ease(k), 50);
  },
  alley_notes(t, d, k) {
    day('alley'); reset(); playerNotes.visible = false;
    nico.place(-4.4, 0, -2.6, Math.PI); nico.expr = 'determined'; nico.pose({ t, armR: [-2.1 + Math.sin(t * 9) * 0.2, 0, 0.2 + Math.sin(t * 5) * 0.15] });
    cam([-1.2, 2.8, 4.5], [-1.8, 2.7, 3.4], [-4.5, 2.6, -3.5], [-4.6, 2.7, -3.5], ease(k), 50);
  },
  notes_close(t, d, k) {
    day('alley'); reset(); playerNotes.visible = false;
    cam([-4.6, lerp(4.4, 2.0, ease(k)), 2.0], [-4.6, lerp(4.4, 2.0, ease(k)), 2.0], [-4.6, lerp(4.4, 2.0, ease(k)), -4], [-4.6, lerp(4.4, 2.0, ease(k)), -4], 0, 40);
  },
  night_street(t, d, k) {
    night(); reset(); cam([0.5, 6, 30], [0.5, 4.2, 18], [3, 2.0, -10], [4, 1.8, -10], ease(k), 50);
  },
  player_stand(t, d, k) {
    night(); reset(); player.place(2.0, 0, NZ, Math.PI / 2); player.expr = 'blank'; player.pose({ t }); markOver(player, t);
    nico.place(NX, 0.18, NZ, -Math.PI / 2); nico.expr = 'worried'; nico.pose({ t });
    cam([7.4, 2.4, 3.3], [7.0, 2.4, 2.8], [2.0, 2.3, NZ], [2.0, 2.4, NZ], ease(k), 44);
  },
  nico_nervous(t, d, k) {
    night(); reset(); nico.place(NX, 0.18, NZ, -Math.PI / 2); nico.expr = 'worried'; nico.o.look = Math.sin(t * 3) > 0 ? 1 : -1; nico.pose({ t, headY: Math.sin(t * 3) * 0.15 });
    near(nico, -2.6, 0.1, 0.8, k, 40, [0.5, 0, -0.1]);
  },
  truck_coming(t, d, k) {
    night(); reset(); truck.visible = true; const tk = ease(k);
    truck.position.set(lerp(0.2, 2.6, tk), 0, lerp(-70, -9, tk)); truck.rotation.set(0, lerp(0, 0.25, tk), Math.sin(t * 9) * 0.02);
    player.place(2.0, 0, NZ, Math.PI / 2 - 0.9); player.expr = 'shock'; player.pose({ t }); nico.place(NX, 0.18, NZ, -Math.PI / 2 - 0.7); nico.expr = 'shock'; nico.pose({ t });
    effects.shake(0.04 + k * 0.18); if (k > 0.9) effects.flash((k - 0.9) * 10);
    cam([-2.5, 1.2, 4.0], [-2.3, 1.1, 3.6], [2.0, 1.8, -15], [2.2, 1.8, -12], ease(k), 52);
  },
  game_over(t, d, k, o) {
    night(); reset(); truck.visible = true; truck.position.set(3.2, 0, -4.5); truck.rotation.set(0, 0.5, 0);
    nico.place(5.4, 0.45, 3.6, 0.6, -Math.PI / 2); nico.expr = 'sleep'; nico.pose({});
    player.place(3.2, 0.3, 3.2, -0.4, -Math.PI / 2); player.expr = 'sleep'; player.pose({});
    const a = (o?.alt ? 1.2 : 0) + k * 0.5;
    cam([4.3 + Math.cos(a) * 6, 9, 3.4 + Math.sin(a) * 6], [4.3 + Math.cos(a) * 5, 8, 3.4 + Math.sin(a) * 5], [4.3, 0.4, 3.4], [4.3, 0.4, 3.4], ease(k), 46);
  },
  game_over2(t, d, k) { S.game_over(t, d, k, { alt: true }); },
  player_run(t, d, k) {
    night(); reset(); const z = lerp(-22, -3, k); player.place(4.6, 0.18, z, 0); player.expr = 'determined'; player.pose({ walk: t * 13, amp: 1, t, lean: 0.25 }); markOver(player, t);
    cam([0.8, 2.6, z + 6.5], [0.8, 2.6, z + 6.0], [4.6, 1.8, z], [4.6, 1.8, z], 0, 50);
  },
  reload_montage(t, d, k) { S.truck_coming(t % 0.6, 0.6, (t % 0.6) / 0.6); },
  grab_save(t, d, k) {
    night(); reset(); truck.visible = true; truck.position.set(lerp(1.0, 2.0, k), 0, lerp(-40, -22, k)); truck.rotation.y = 0.2;
    const pull = easeOut(clamp01((k - 0.3) / 0.5));
    player.place(NX - 0.2 + pull * 0.3, 0.18, NZ + 0.9 + pull * 3.6, Math.PI * 0.05); player.expr = 'determined'; player.pose({ walk: t * 12, amp: pull > 0 && pull < 1 ? 0.9 : 0, t, armL: [-1.6, 0, 0.2] }); markOver(player, t);
    nico.place(NX + pull * 0.2, 0.18, NZ + pull * 3.4, Math.PI * 0.1); nico.expr = 'shock'; nico.pose({ walk: t * 12, amp: pull > 0 && pull < 1 ? 0.9 : 0, t, armR: [-1.6, 0, -0.2], lean: 0.15 });
    cam([1.0, 2.0, 9], [1.4, 2.0, 9.6], [NX, 1.8, NZ + 2], [NX, 1.8, NZ + 3], ease(k), 50);
  },
  truck_miss(t, d, k) {
    night(); reset(); truck.visible = true; const tk = clamp01(k / 0.55);
    truck.position.set(lerp(2.2, 4.6, tk), 0, lerp(-24, -1.0, tk)); truck.rotation.y = lerp(0.2, 0.55, tk);
    if (k > 0.55) { shelter.rotation.set(0, 0, -0.3); shelter.position.x = 6.9; effects.shake(Math.max(0, 0.35 - (k - 0.55))); smoke.position.set(5.5, 1.2 + (k - 0.55) * 2, 0); smoke.visible = true; }
    if (k > 0.55 && k < 0.62) effects.flash(0.7, '255,240,200');
    player.place(5.5, 0.18, 5.6, Math.PI + 0.3); player.expr = k > 0.6 ? 'happy' : 'shock'; player.pose({ t, armR: k > 0.6 ? [-2.8, 0, 0.3] : null });
    nico.place(4.7, 0.18, 5.3, Math.PI - 0.2); nico.expr = k > 0.6 ? 'shock' : 'worried'; nico.pose({ t });
    cam([0.6, 2.4, 12], [0.4, 2.6, 13], [4.5, 1.6, 2], [4.6, 1.6, 1], ease(k), 54);
  },
  walk_alley(t, d, k) {
    day('alley'); reset(); const z = lerp(8, 2.5, k);
    nico.place(-1.0, 0, z, Math.PI); nico.expr = 'smile'; nico.pose({ walk: t * 6, amp: 0.5, t });
    player.place(1.0, 0, z + 0.3, Math.PI); player.expr = 'smile'; player.pose({ walk: t * 6 + 1, amp: 0.5, t }); markOver(player, t);
    cam([0, 2.6, z + 6], [0, 2.6, z + 5], [0, 2.2, z - 4], [0, 2.2, z - 4], 0, 50);
  },
  wall_reveal(t, d, k) {
    day('alley'); reset();
    const x = lerp(-4.6, 4.6, ease(clamp01(k * 1.2))); cam([x * 0.7, 3.0, 4.2], [x * 0.7, 3.0, 3.6], [x, 3.0, -4], [x, 3.0, -4], 0, 48);
  },
  player_notes(t, d, k) {
    day('alley'); reset();
    cam([4.6, lerp(4.2, 2.1, ease(clamp01(k * 1.3))), 2.4], [4.6, lerp(4.2, 2.1, ease(clamp01(k * 1.3))), 2.0], [4.6, lerp(4.2, 1.6, ease(clamp01(k * 1.3))), -4], [4.6, lerp(4.2, 1.6, ease(clamp01(k * 1.3))), -4], 0, 42);
  },
  end_two(t, d, k) {
    day(); reset(); shelter.rotation.set(0, 0, 0);
    nico.place(5.5, 0.3, 0.7, -Math.PI / 2); nico.expr = 'grin'; nico.pose({ sit: true, t, armL: [-1.4 + Math.sin(t * 2) * 0.05, 0, 0] });
    player.place(5.5, 0.3, -0.8, -Math.PI / 2); player.expr = 'happy'; player.pose({ sit: true, t, armR: [-1.4, 0, 0] }); markOver(player, t);
    cam([-0.2, 2.6, 1.6], [0.4, 2.5, 1.2], [5.5, 1.6, 0], [5.5, 1.6, 0], ease(k), 46);
  },
  end_pull(t, d, k) {
    day(); reset();
    nico.place(5.5, 0.3, 0.7, -Math.PI / 2); nico.expr = 'grin'; nico.pose({ sit: true, t });
    player.place(5.5, 0.3, -0.8, -Math.PI / 2); player.expr = 'happy'; player.pose({ sit: true, t }); markOver(player, t);
    cam([2.0, 2.4, 1.0], [-12, 32, 26], [5.5, 1.6, 0], [3, 0, -10], ease(k), 50);
  },
};

// ---------- HUD (our own design) ----------
const W = E.W, H = E.H;
function txt(ctx, s, x, y, size, fill, align = 'center', stroke = '#120a24') {
  ctx.save(); ctx.font = `800 ${size}px Cap`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.18; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); ctx.fillStyle = fill; ctx.fillText(s, x, y); ctx.restore();
}
function star(ctx, x, y, r, fill) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#120a24'; ctx.stroke(); }
function hud(ctx, time, name) {
  // minimap
  const cx = 150, cy = 330, r = 108;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = 'rgba(18,10,40,0.78)'; ctx.fill(); ctx.clip();
  ctx.translate(cx, cy); ctx.rotate(time * 0.08); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 12;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 60, -200); ctx.lineTo(i * 60, 200); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-200, i * 70); ctx.lineTo(200, i * 70); ctx.stroke(); }
  ctx.fillStyle = '#ff3e9a'; ctx.beginPath(); ctx.arc(40, -50, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#3cff8a'; ctx.beginPath(); ctx.arc(-55, 30, 9, 0, 7); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = '#16C7C1'; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx + 14, cy + 14); ctx.lineTo(cx, cy + 6); ctx.lineTo(cx - 14, cy + 14); ctx.closePath(); ctx.fill(); ctx.restore();
  // money + stars + clock
  txt(ctx, '$48,230', W - 50, 250, 64, '#7dff9a', 'right');
  const n = STARS[name] || 0; for (let i = 0; i < 5; i++) star(ctx, W - 80 - i * 64, 330, 26, i < n ? '#ffffff' : 'rgba(255,255,255,0.18)');
  if (name === 'night_street' || name === 'player_stand' || name === 'nico_nervous') txt(ctx, '2:13 AM', W - 50, 410, 54, '#ffffff', 'right');
}
function loading(ctx, time, k) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a0b3a'); g.addColorStop(0.6, '#7a1f6e'); g.addColorStop(1, '#ff7a59'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,230,150,0.9)'; ctx.beginPath(); ctx.arc(W / 2, H * 0.78, 260, Math.PI, 0); ctx.fill();
  txt(ctx, 'LOADING SAVE', W / 2, H * 0.36, 110, NICO_COLORS.lime);
  ctx.save(); ctx.translate(W / 2, H * 0.46); ctx.rotate(time * 6); ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 54, 0, 4.4); ctx.stroke(); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(140, H * 0.53, W - 280, 30); ctx.fillStyle = '#16C7C1'; ctx.fillRect(140, H * 0.53, (W - 280) * clamp01(k * 1.1), 30);
  txt(ctx, "TIP: NPCs don't remember anything.", W / 2, H * 0.88, 44, '#ffffff');
}
function gameOver(ctx, time, k) {
  ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.fillStyle = 'rgba(10,0,0,0.3)'; ctx.fillRect(0, 0, W, H);
  const s = 1 + 0.25 * Math.max(0, 1 - k * 5); ctx.save(); ctx.translate(W / 2, H * 0.4); ctx.scale(s, s); txt(ctx, 'GAME OVER', 0, 0, 150, '#e5383b'); ctx.restore();
}
function overlay(ctx, time, shot, t, d) {
  const kind = fullScreen[shot.name], k = t / d;
  if (kind === 'load') return loading(ctx, time, k);
  if (kind === 'over') return gameOver(ctx, time, k);
  if (kind === 'montage') {
    const ph = Math.floor(t / 0.2) % 3; const tries = Math.min(47, 3 + Math.floor(k * 46));
    if (ph === 1) gameOver(ctx, time, 1); else if (ph === 2) loading(ctx, time, (t % 0.2) / 0.2); else hud(ctx, time, 'truck_coming');
    txt(ctx, `TRY ${tries}`, W / 2, H * 0.22, 120, '#ffffff'); return;
  }
  hud(ctx, time, shot.name);
}

E.run({ timings: T, shots: S, overlay });
