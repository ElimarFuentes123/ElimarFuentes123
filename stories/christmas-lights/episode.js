// Episode 3: "In this town, every house turns on its Christmas lights on December 1st."
import * as E from '../engine/engine.js';
const { THREE, cam, ease, clamp01, lerp, show, makeChar, handPos, headPos, face, effects, sparkles, box, cyl, mat, canvasTex, signTex } = E;

const T = await (await fetch('build/timings.json')).json();

// ---------- cast ----------
const kid = makeChar({ shirt: '#ff7a1c', pants: '#2b4a86', hairType: 'kid', hair: '#2e1d12', hood: true });
const mom = makeChar({ shirt: '#c0392b', pants: '#3b3f5c', hairType: 'mom', hair: '#6b3a1e' });
const santos = makeChar({ shirt: '#7b5a3c', pants: '#4a4036', shoes: '#2a2a2a', hairType: 'grandpa', hair: '#f0efe9', glasses: true, mustache: true, stripe: '#a33b2f' });
const baker = makeChar({ shirt: '#ffffff', pants: '#8d6e4f', hairType: 'chef', mustache: '#5a3a20', stripe: '#e57373' });
const mayor = makeChar({ shirt: '#23262e', pants: '#23262e', shoes: '#111', hairType: 'tophat', tie: '#c0392b', mustache: '#2a1a10', vest: '#3a3f4c' });
const teasers = [
  makeChar({ shirt: '#3bb37a', pants: '#2a3a6a', hairType: 'beanie', cap: '#e53935' }),
  makeChar({ shirt: '#f4d03f', pants: '#3a3a46', hairType: 'bob', hair: '#6b3a1e' }),
  makeChar({ shirt: '#4a8fe0', pants: '#56503f', hairType: 'beanie', cap: '#2e7d32' }),
];
const crowd = E.makeExtras(9, 41);
const helpers = [baker, mayor, ...teasers, ...crowd];

// ---------- sets ----------
const town = E.buildTown('town', { winter: true, seed: 42 });
const plaza = E.buildPlaza('plaza', { hallText: 'TOWN HALL' });
const santosRoom = E.buildRoom('santosroom', { kind: 'living', wallA: '#b8a98f', wallB: '#ae9f84', curtain: '#6d4c41', sofa: '#5d4037', windowX: -4, lampX: 5 });
const home = E.buildRoom('home', { kind: 'living', wallA: '#cfe0ee', wallB: '#c3d6e6', curtain: '#c62828', sofa: '#4f6d8f', windowX: -4, lampX: 5.5 });
const snow = E.prop(E.snow());

// ---------- christmas lights on every house ----------
const BULB_COLORS = ['#ff4040', '#40ff70', '#ffd23b', '#40b8ff', '#ffffff', '#ff7ad0'];
const bulbGeo = new THREE.SphereGeometry(0.09, 8, 6);
function houseLightPoints() {
  const P = [];
  for (let z = -4.4; z <= 4.4; z += 0.32) P.push([4.38, 5.98, z]); // front eave
  for (let z = -4.4; z <= 4.4; z += 0.4) P.push([0, 9.32, z]); // ridge
  for (const zs of [-4.08, 4.08]) for (let k = 0; k <= 12; k++) P.push([4.2 * k / 12, 9.2 - 3.2 * k / 12, zs]); // gable edge
  const rect = (y, z, w, h) => { for (let a = 0; a <= 1.001; a += 0.14) { P.push([4.17, y - h / 2, z - w / 2 + w * a]); P.push([4.17, y + h / 2, z - w / 2 + w * a]); } for (let a = 0.14; a < 0.99; a += 0.18) { P.push([4.17, y - h / 2 + h * a, z - w / 2]); P.push([4.17, y - h / 2 + h * a, z + w / 2]); } };
  rect(4.3, -2, 1.9, 2.1); rect(4.3, 2, 1.9, 2.1); rect(1.8, -2, 1.9, 2.1); rect(1.45, 2, 1.7, 3.0);
  return P;
}
const LP = houseLightPoints();
function makeLights(h, seed) {
  const grp = new THREE.Group(); grp.position.copy(h.g.position); grp.rotation.copy(h.g.rotation); town.add(grp);
  const m = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const mesh = new THREE.InstancedMesh(bulbGeo, m, LP.length); const m4 = new THREE.Matrix4();
  LP.forEach((p, i) => { m4.makeTranslation(p[0], p[1], p[2]); mesh.setMatrixAt(i, m4); mesh.setColorAt(i, new THREE.Color(BULB_COLORS[(i + seed) % BULB_COLORS.length])); });
  grp.add(mesh);
  return { grp, mesh, mat: m, h };
}
const houseLights = town.userData.houses.filter((h) => Math.abs(h.i) <= 6).map((h, n) => makeLights(h, n));
const santosL = houseLights.find((l) => l.h.s > 0 && l.h.i === 0);
const setLights = (L, on, frac = 1) => { L.grp.visible = frac > 0; L.mesh.count = Math.floor(LP.length * frac); L.mat.color.set(on ? '#ffffff' : '#2a2a2a'); };
// Santos's house: dark windows overlay
const santosDark = new THREE.Group(); santosDark.position.copy(santosL.h.g.position); santosDark.rotation.copy(santosL.h.g.rotation); town.add(santosDark);
{ const dm = mat('#141a26', { roughness: 0.4 }); box(0.06, 1.55, 1.35, dm, 4.22, 4.3, -2, santosDark, false); box(0.06, 1.55, 1.35, dm, 4.22, 4.3, 2, santosDark, false); box(0.06, 1.55, 1.35, dm, 4.22, 1.8, -2, santosDark, false); }
// glow lights for the reveal
const glowA = new THREE.PointLight('#ffb3a0', 0, 14, 0), glowB = new THREE.PointLight('#d8ffe0', 0, 14, 0), glowC = new THREE.PointLight('#ffd9a0', 0, 12, 0);
glowA.position.set(9, 3.5, -4); glowB.position.set(9, 3.5, 3); glowC.position.set(9.8, 4.5, -2); town.add(glowA, glowB, glowC);
// the empty socket + the one bulb (world space, above Santos's door at (10.95, 1.3, -2))
const socket = box(0.2, 0.12, 0.2, mat('#888', { metalness: 0.7 }), 10.82, 3.12, -2, town);
const bigBulbMat = mat('#fff3c4', { emissive: '#ffcc55', emissiveIntensity: 0, roughness: 0.2 });
const bigBulb = E.sphere(0.16, bigBulbMat, 10.82, 2.92, -2, town, 14);
const starGlow = new THREE.PointLight('#ffcf70', 0, 10, 0); starGlow.position.set(10.3, 2.9, -2); town.add(starGlow);
// a hand-held bulb prop
const handBulb = E.prop(new THREE.Group()); E.scene.add(handBulb);
E.sphere(0.14, mat('#fff8e0', { roughness: 0.1, emissive: '#ffe9b0', emissiveIntensity: 0.15, transparent: true, opacity: 0.9 }), 0, 0.12, 0, handBulb, 14);
cyl(0.07, 0.07, 0.14, mat('#b0b4ba', { metalness: 0.8, roughness: 0.3 }), 0, -0.04, 0, handBulb, 12);
// Santos's door slab (opens at the reveal)
const santosDoor = new THREE.Group(); santosDoor.position.set(10.82, 0.05, -2.6); town.add(santosDoor);
box(0.14, 2.5, 1.2, mat('#5d3a22'), 0, 1.25, 0.6, santosDoor);
// ladders
function ladder(x, z, ry) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.set(0, ry, 0.22); town.add(g); const w = mat('#c49a6c'); box(0.12, 5.2, 0.12, w, 0, 2.6, -0.45, g); box(0.12, 5.2, 0.12, w, 0, 2.6, 0.45, g); for (let y = 0.4; y < 5; y += 0.5) box(0.1, 0.08, 0.9, w, 0, y, 0, g); return g; }
const ladders = [ladder(9.6, -4.2, 0), ladder(9.6, 0.6, 0)];
// bakery candy canes (left house i=2, z=26; eave at x=-10.62, y=6)
const caneTex = canvasTex(64, 256, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 256); g.fillStyle = '#e53935'; for (let y = -64; y < 256; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(64, y + 32); g.lineTo(64, y + 56); g.lineTo(0, y + 24); g.fill(); } });
for (let k = 0; k < 9; k++) { const z = 22.2 + k * 0.95; const c = cyl(0.09, 0.09, 1.3, mat('#fff', { map: caneTex }), -10.5, 5.4, z, town, 10); const hk = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.09, 8, 14, Math.PI), mat('#fff', { map: caneTex })); hk.position.set(-10.5, 6.05, z - 0.22); hk.rotation.y = Math.PI / 2; town.add(hk); }
// plaza christmas tree
const xtree = new THREE.Group(); xtree.position.set(0, 0, -6); plaza.add(xtree);
{ cyl(0.5, 0.6, 1.4, mat('#6b4a30'), 0, 0.7, 0, xtree, 10);
  [[4.2, 4, 2.6], [3.4, 3.6, 4.8], [2.6, 3.2, 6.8], [1.7, 2.8, 8.6]].forEach(([r, h, y]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 12), mat('#1f6b35')); c.position.y = y; c.castShadow = true; xtree.add(c); });
  const tm = new THREE.InstancedMesh(bulbGeo, new THREE.MeshBasicMaterial({ color: '#fff' }), 160); const m4 = new THREE.Matrix4(); const r = E.rng(3);
  for (let i = 0; i < 160; i++) { const y = 1.6 + r() * 8; const rad = Math.max(0.3, 4.0 * (1 - (y - 1.4) / 9.4)) + 0.05; const a = r() * 6.283; m4.makeTranslation(Math.cos(a) * rad, y, Math.sin(a) * rad); m4.scale(new THREE.Vector3(1.6, 1.6, 1.6)); tm.setMatrixAt(i, m4); tm.setColorAt(i, new THREE.Color(BULB_COLORS[i % 6])); }
  xtree.add(tm);
  const star = E.sphere(0.5, mat('#ffe066', { emissive: '#ffcc33', emissiveIntensity: 2.5 }), 0, 10.4, 0, xtree, 10); star.scale.set(1, 1, 0.4);
  const tl = new THREE.PointLight('#ffd27a', 3, 22, 0); tl.position.set(0, 6, 5); xtree.add(tl); }
// home christmas tree (small)
{ const t = new THREE.Group(); t.position.set(-6.2, 0, -5.2); home.add(t);
  [[1.3, 1.6, 1.2], [1.0, 1.4, 2.2], [0.7, 1.2, 3.1]].forEach(([r, h, y]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), mat('#2e7d32')); c.position.y = y; t.add(c); });
  for (let i = 0; i < 26; i++) E.sphere(0.07, new THREE.MeshBasicMaterial({ color: BULB_COLORS[i % 6] }), Math.cos(i * 2.4) * (1.25 - i * 0.035), 0.8 + i * 0.1, Math.sin(i * 2.4) * (1.25 - i * 0.035), t, 6); }
// Santos's room: armchair, side table with the old photo, the box that says HERS
const photoTex = canvasTex(512, 400, (g) => {
  g.fillStyle = '#2a2440'; g.fillRect(0, 0, 512, 400);
  g.fillStyle = '#8d6e63'; g.fillRect(60, 150, 392, 250); g.fillStyle = '#5d4037'; g.beginPath(); g.moveTo(40, 160); g.lineTo(256, 40); g.lineTo(472, 160); g.fill();
  for (let i = 0; i < 46; i++) { g.fillStyle = BULB_COLORS[i % 6]; const x = 40 + i * 9.4, y = i < 23 ? 160 - i * 5.2 : 40 + (i - 23) * 5.2; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
  const fig = (x, hair, shirt, bun) => { g.fillStyle = shirt; g.fillRect(x - 40, 300, 80, 100); g.fillStyle = '#f6c945'; g.beginPath(); g.roundRect(x - 32, 228, 64, 70, 12); g.fill(); g.fillStyle = hair; if (bun) { g.fillRect(x - 34, 220, 68, 20); g.beginPath(); g.arc(x, 214, 14, 0, 7); g.fill(); } else { g.fillRect(x - 36, 236, 10, 26); g.fillRect(x + 26, 236, 10, 26); } g.strokeStyle = '#1b1410'; g.lineWidth = 4; g.beginPath(); g.arc(x - 12, 258, 6, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(x + 12, 258, 6, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.fillStyle = '#1b1410'; g.beginPath(); g.arc(x, 274, 10, 0, Math.PI); g.fill(); };
  fig(200, '#d9d9d9', '#7b5a3c', false); fig(310, '#bdbdbd', '#c2185b', true);
  g.fillStyle = 'rgba(255,200,140,0.18)'; g.fillRect(0, 0, 512, 400); g.strokeStyle = '#f5efe0'; g.lineWidth = 26; g.strokeRect(0, 0, 512, 400);
});
{ const cm = mat('#7a4a3a'); const ac = new THREE.Group(); ac.position.set(2.5, 0, -4.0); ac.rotation.y = -0.5; santosRoom.add(ac);
  box(2.2, 0.85, 2.0, cm, 0, 0.42, 0, ac); box(2.2, 2.3, 0.5, cm, 0, 1.4, -0.85, ac); box(0.45, 1.3, 2.0, cm, -1.3, 0.85, 0, ac); box(0.45, 1.3, 2.0, cm, 1.3, 0.85, 0, ac);
  box(1.2, 0.1, 1.2, mat('#5d4037'), 4.6, 1.3, -3.2, santosRoom); box(0.14, 1.3, 0.14, mat('#5d4037'), 4.6, 0.65, -3.2, santosRoom);
  const fr = new THREE.Group(); fr.position.set(4.6, 1.75, -3.3); fr.rotation.set(-0.15, -0.6, 0); santosRoom.add(fr); santosRoom.userData.photo = fr;
  box(0.95, 0.78, 0.06, mat('#3e2723'), 0, 0, 0, fr); const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.64), mat('#fff', { map: photoTex, emissive: '#fff', emissiveMap: photoTex, emissiveIntensity: 0.3 })); pm.position.z = 0.035; fr.add(pm);
  const bx = new THREE.Group(); bx.position.set(-5.6, 0, -5.6); santosRoom.add(bx); santosRoom.userData.box = bx;
  box(1.6, 1.0, 1.1, mat('#b58a5a'), 0, 0.5, 0, bx); box(1.62, 0.06, 1.12, mat('#a07448'), 0, 1.02, 0, bx);
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.42), mat('#fff', { map: signTex('HERS', { w: 512, h: 240, bg: '#f5efe0', fg: '#3e2723', font: '800 150px Cap' }) })); lab.position.set(0, 0.55, 0.56); bx.add(lab);
  for (let i = 0; i < 7; i++) E.sphere(0.07, mat(BULB_COLORS[i % 6], { roughness: 0.4 }), -0.6 + i * 0.2, 1.08, 0.2 * Math.sin(i), bx, 6); }

// ---------- helpers ----------
function night(set = 'town') { show(set, 'night'); if (set === 'town') snow.visible = true; }
let santosLit = 0; // 0 dark, 1 lit
function streetState(opts = {}) {
  houseLights.forEach((L) => setLights(L, true, 1));
  const frac = opts.santosFrac ?? 0, on = opts.santosOn ?? false;
  setLights(santosL, on, frac);
  santosDark.visible = !on;
  const g = on ? 1 : 0; glowA.intensity = 1.3 * g; glowB.intensity = 1.0 * g; glowC.intensity = 1.8 * g;
  ladders.forEach((l) => (l.visible = !!opts.ladders));
  const b = opts.bigBulb ?? 0; bigBulb.visible = b > 0; bigBulbMat.emissiveIntensity = b * 3; starGlow.intensity = b * 3;
  santosDoor.rotation.y = opts.doorOpen ? -1.3 * opts.doorOpen : 0;
}
const SX = 10.15, SZ = -2.0; // Santos's doorstep
const S = {
  street_light_up(t, d, k) {
    night(); streetState();
    houseLights.forEach((L) => { if (L === santosL) return; const order = (6 - L.h.i) / 12; setLights(L, true, k * 1.25 > order ? 1 : 0); });
    cam([0.5, 5.5, 34], [0.5, 4.5, 26], [0, 3, -10], [0, 3, -10], ease(k), 50);
  },
  lights_close(t, d, k) { night(); streetState(); cam([-6.4, 4.6, 19], [-7.2, 5.0, 17], [-10.6, 5.8, 12], [-10.6, 5.9, 11], ease(k), 46); },
  plaza_tree(t, d, k) {
    night('plaza');
    crowd.slice(0, 8).forEach((c, i) => { c.place((i % 2 ? 1 : -1) * (3.5 + (i % 4) * 1.2), 0, 1 + Math.floor(i / 4) * 2.2, Math.PI); c.expr = 'happy'; c.pose({ t, jump: t * 7 + i, armR: i % 2 ? [-2.8, 0, 0] : null }); });
    mayor.place(3.2, 0, -2.2, -0.4); mayor.expr = 'grin'; mayor.pose({ t, armR: [-2.8, 0, -0.3] });
    cam([0.4, 2.2, 15], [0.3, 2.4, 12], [0, 6.0, -6], [0, 7.0, -6], ease(k), 56);
  },
  bakery_canes(t, d, k) {
    night(); streetState();
    baker.place(-9.7, 0, 27, Math.PI / 2); baker.expr = 'happy'; baker.pose({ t, armR: [-2.6 + Math.sin(t * 7) * 0.25, 0, -0.4] });
    cam([-4.6, 2.6, 33], [-5.0, 3.0, 31.5], [-10.4, 4.0, 26], [-10.4, 4.6, 26], ease(k), 50);
  },
  dark_house_wide(t, d, k) { night(); streetState(); cam([-2.5, 3.0, 16], [-1.0, 3.0, 12], [11, 3.2, -1], [11, 3.4, -1.5], ease(k), 50); },
  santos_window(t, d, k) {
    night(); streetState();
    santos.place(SX, 0, SZ + 0.2, -Math.PI / 2); santos.expr = 'sad'; santos.pose({ t, headX: 0.25 });
    const h = headPos(santos);
    cam([h.x - 3.4, h.y - 0.2, h.z + 1.6], [h.x - 2.7, h.y - 0.1, h.z + 1.2], [h.x, h.y - 0.1, h.z], [h.x, h.y, h.z], ease(k), 46);
  },
  kids_grinch(t, d, k) {
    night(); streetState();
    teasers.forEach((c, i) => { c.place(5.2 + (i % 2) * 0.6, 0.18, 2.5 + i * 1.3, Math.PI / 2 + 0.3); c.expr = 'laugh'; c.pose({ t, armR: i !== 1 ? [-1.6, 0, 0] : null, jump: i === 1 ? t * 9 : 0 }); });
    cam([0.6, 2.2, 7.5], [1.2, 2.2, 6.5], [6.0, 1.8, 2.5], [7.0, 2.2, 1.0], ease(k), 50);
  },
  kid_notices(t, d, k) {
    night(); streetState();
    kid.place(-5.5, 0.18, 2.5, Math.PI / 2 - 0.15); kid.expr = 'worried'; kid.pose({ t, headX: 0.05 });
    cam([-7.4, 3.0, 4.8], [-7.0, 2.9, 4.4], [10, 2.4, -1.5], [10.5, 2.4, -1.8], ease(k), 46);
  },
  box_hers(t, d, k) {
    show('santosroom', 'night');
    santos.place(2.5, 0.12, -4.0, -0.5); santos.expr = 'sad'; santos.pose({ sit: true, t, headX: 0.25, headY: -0.5 });
    const b = santosRoom.userData.box.position;
    cam([b.x + 1.4, 1.9, b.z + 3.6], [b.x + 1.0, 1.7, b.z + 2.8], [b.x, 0.7, b.z], [b.x, 0.7, b.z], ease(k), 46);
  },
  bulb_walk(t, d, k) {
    night(); streetState();
    const z = lerp(-16, -9, k); santos.place(5.3, 0.18, z, 0); santos.expr = 'sad'; santos.pose({ walk: t * 5, amp: 0.3, t, armR: [-0.8, 0, 0], headX: 0.2 });
    const p = handPos(santos, 1); handBulb.position.set(p.x, p.y + 0.05, p.z + 0.1); handBulb.visible = true;
    cam([2.5, 2.4, z + 6], [2.6, 2.3, z + 5], [5.2, 1.6, z], [5.2, 1.6, z], 0, 48);
  },
  bulb_close(t, d, k) {
    night(); streetState();
    santos.place(5.3, 0.18, -8.5, 0); santos.expr = 'sad'; santos.pose({ t, armR: [-1.1, 0, -0.2], headX: 0.35 });
    const p = handPos(santos, 1); handBulb.position.set(p.x, p.y + 0.05, p.z + 0.1); handBulb.visible = true;
    cam([p.x - 0.5, p.y + 0.5, p.z + 1.4], [p.x - 0.4, p.y + 0.4, p.z + 1.1], handBulb.position.toArray(), handBulb.position.toArray(), ease(k), 42);
  },
  santos_wave(t, d, k) {
    night(); streetState();
    santos.place(SX, 0, SZ + 0.2, -Math.PI / 2); santos.expr = 'sad'; santos.pose({ t, armR: [-2.6 + Math.sin(t * 5) * 0.2, 0, -0.3] });
    cam([-1.5, 2.4, 3.5], [0.5, 2.4, 2.5], [SX, 2.2, SZ], [SX, 2.3, SZ], ease(k), 46);
  },
  kid_waves_back(t, d, k) {
    night(); streetState();
    kid.place(-9.8, 0, 3.2, Math.PI / 2 - 0.2); kid.expr = 'smile'; kid.pose({ t, armR: [-2.6 + Math.sin(t * 6) * 0.25, 0, -0.3] });
    const h = headPos(kid);
    cam([h.x + 3.6, h.y - 0.3, h.z + 1.8], [h.x + 2.9, h.y - 0.2, h.z + 1.4], [h.x, h.y - 0.2, h.z], [h.x, h.y - 0.1, h.z], ease(k), 46);
  },
  mom_ask(t, d, k) {
    show('home', 'night');
    mom.place(-0.95, 0.12, -4.0, 0); mom.say(t, 'talk', 'sad'); mom.pose({ sit: true, t, headY: 0.45, armR: [-0.6, 0, -0.6] });
    kid.place(1.0, 0.12, -4.0, 0); kid.expr = 'worried'; kid.pose({ sit: true, t, headY: -0.45 });
    cam([0.8, 2.6, 3.2], [0.4, 2.4, 1.8], [0, 2.0, -4], [0, 2.0, -4], ease(k), 50);
  },
  old_photo(t, d, k) {
    show('santosroom', 'night');
    const f = santosRoom.userData.photo; f.updateMatrixWorld(true);
    const c = f.getWorldPosition(new THREE.Vector3()), n = new THREE.Vector3(0, 0, 1).applyQuaternion(f.getWorldQuaternion(new THREE.Quaternion()));
    cam(c.clone().addScaledVector(n, 1.5).toArray(), c.clone().addScaledVector(n, 1.05).toArray(), c.toArray(), c.toArray(), ease(k), 42);
  },
  santos_alone(t, d, k) {
    show('santosroom', 'night');
    santos.place(2.5, 0.12, -4.0, -0.5); santos.expr = 'cry'; santos.pose({ sit: true, t, headX: 0.35 });
    cam([-2.0, 3.6, 4.5], [-1.0, 3.0, 2.6], [2.2, 1.6, -4], [2.4, 1.8, -4], ease(k), 50);
  },
  knock1(t, d, k) {
    night(); streetState();
    kid.place(-10.0, 0, 15, Math.PI / 2 + Math.PI); kid.expr = 'determined'; kid.pose({ t, armR: [-1.6 + Math.abs(Math.sin(t * 9)) * 0.35, 0, 0] });
    cam([-6.5, 2.2, 18.5], [-7.0, 2.2, 17.8], [-10.4, 1.8, 15], [-10.4, 1.8, 15], ease(k), 48);
  },
  knock2(t, d, k) {
    night(); streetState();
    baker.place(-10.2, 0, 28, Math.PI / 2); baker.expr = k > 0.4 ? 'happy' : 'shock'; baker.pose({ t, armR: k > 0.4 ? [-2.5, 0, -0.3] : null });
    kid.place(-8.9, 0, 28.2, -Math.PI / 2); kid.say(t, 'talk', 'determined'); kid.pose({ t, armL: [-1.0, 0, 0.3] });
    cam([-7.6, 2.4, 32], [-7.9, 2.4, 31.2], [-9.7, 2.0, 28], [-9.7, 2.0, 28], ease(k), 48);
  },
  knock3(t, d, k) {
    night(); streetState();
    mayor.place(10.2, 0, 11, -Math.PI / 2); mayor.expr = k > 0.4 ? 'smile' : 'shock'; mayor.pose({ t, headX: 0.25 * Math.sin(t * 6) * (k > 0.4 ? 1 : 0) });
    kid.place(8.9, 0, 11.2, Math.PI / 2); kid.say(t, 'talk', 'determined'); kid.pose({ t, armR: [-1.0, 0, -0.3] });
    cam([7.6, 2.4, 15], [7.9, 2.4, 14.2], [9.7, 2.0, 11], [9.7, 2.0, 11], ease(k), 48);
  },
  crowd_arrive(t, d, k) {
    night(); streetState();
    helpers.forEach((c, i) => { const z = 14 + (i % 4) * 1.4 + Math.floor(i / 4) * 2 - t * 3.0; c.place(-2.5 + (i % 4) * 1.6, 0, z, Math.PI); c.expr = 'smile'; c.pose({ walk: t * 7 + i, amp: 0.5, t, armL: i % 3 === 0 ? [-1.2, 0, 0.3] : null, armR: i % 3 === 0 ? [-1.2, 0, -0.3] : null }); });
    kid.place(-1.0, 0, 9.5 - t * 3.0, Math.PI); kid.expr = 'determined'; kid.pose({ walk: t * 8, amp: 0.6, t });
    cam([-1.0, 1.4, -2], [-1.0, 1.6, -3], [-1.0, 1.8, 10], [-1.0, 1.8, 8], ease(k), 54);
  },
  crowd_wide(t, d, k) {
    night(); streetState();
    gather(t); kid.place(6.6, 0.18, -2.0, Math.PI / 2); kid.expr = 'happy'; kid.pose({ t, armR: [-2.8, 0, -0.2], headY: -0.4 });
    cam([-4, 4.4, 9], [-3, 4.6, 7], [8, 2.2, -1.5], [8.5, 2.4, -1.5], ease(k), 50);
  },
  ladders(t, d, k) {
    night(); streetState({ ladders: true, santosFrac: lerp(0.15, 0.5, k), santosOn: false });
    workers(t);
    cam([3.5, 3.2, 6.5], [4.2, 3.8, 5.5], [10.2, 4.6, -1.8], [10.2, 5.0, -1.8], ease(k), 50);
  },
  lights_progress(t, d, k) {
    night(); streetState({ ladders: true, santosFrac: lerp(0.5, 1.0, k), santosOn: false });
    workers(t);
    effects.darken(0.15 * Math.sin(k * Math.PI));
    cam([-1.5, 6.0, 8.5], [-1.0, 6.5, 7.5], [10.5, 4.0, -1.5], [10.5, 4.0, -1.5], ease(k), 50);
  },
  door_open(t, d, k) {
    night(); streetState({ santosFrac: 1, santosOn: true, doorOpen: ease(clamp01(k * 2)) });
    santos.place(lerp(10.9, SX - 0.4, ease(clamp01(k * 1.6))), 0, SZ, -Math.PI / 2); santos.expr = k > 0.45 ? 'shock' : 'sad'; santos.pose({ t, headX: -0.2 * clamp01(k * 2) });
    if (k > 0.45 && k < 0.6) effects.flash(0.35 * (1 - (k - 0.45) / 0.15), '255,240,200');
    cam([5.6, 2.2, 1.4], [6.2, 2.3, 0.6], [SX, 2.2, SZ], [SX, 2.3, SZ], ease(k), 48);
  },
  house_reveal(t, d, k) {
    night(); streetState({ santosFrac: 1, santosOn: true, doorOpen: 1 });
    gather(t, true);
    santos.place(SX - 0.4, 0, SZ, -Math.PI / 2); santos.expr = 'shock'; santos.pose({ t, headX: -0.3 });
    cam([-3, 2.4, 11], [-5, 4.5, 13.5], [9, 3.6, -1.2], [9, 4.0, -1.2], ease(k), 52);
  },
  santos_inside_out(t, d, k) {
    night(); streetState({ santosFrac: 1, santosOn: true, doorOpen: 1 });
    gather(t, false);
    const inK = k < 0.45 ? k / 0.45 : 1 - (k - 0.55) / 0.45;
    const x = lerp(SX - 0.4, 12.2, ease(clamp01(inK)));
    santos.place(x, 0, SZ, k < 0.5 ? Math.PI / 2 : -Math.PI / 2); santos.expr = 'sad'; santos.pose({ walk: t * 6, amp: k > 0.4 && k < 0.6 ? 0 : 0.35, t, armR: k > 0.55 ? [-1.1, 0, -0.2] : null });
    if (k > 0.55) { const p = handPos(santos, 1); handBulb.position.set(p.x - 0.1, p.y + 0.05, p.z); handBulb.visible = true; }
    cam([5.0, 2.4, 2.6], [5.4, 2.4, 2.0], [SX, 2.0, SZ], [SX, 2.0, SZ], ease(k), 46);
  },
  bulb_hand(t, d, k) {
    night(); streetState({ santosFrac: 1, santosOn: true, doorOpen: 1 });
    santos.place(SX - 0.4, 0, SZ, -Math.PI / 2); santos.expr = 'sad'; santos.pose({ t, armR: [-1.2, 0, -0.1], headX: 0.3 });
    const p = handPos(santos, 1); handBulb.position.set(p.x - 0.1, p.y + 0.05, p.z); handBulb.visible = true;
    const b = handBulb.position;
    cam([b.x - 1.4, b.y + 0.35, b.z - 0.5], [b.x - 1.1, b.y + 0.3, b.z - 0.4], b.toArray(), b.toArray(), ease(k), 42);
  },
  bulb_screw(t, d, k) {
    const on = k > 0.42;
    night(); streetState({ santosFrac: 1, santosOn: true, doorOpen: 1, bigBulb: on ? Math.min(1, (k - 0.42) * 5) : 0.001 });
    bigBulb.visible = k > 0.25;
    santos.place(SX - 0.25, 0, SZ, -Math.PI / 2); santos.expr = on ? 'shock' : 'sad'; santos.pose({ t, armR: [-2.9, 0, 0.15], headX: -0.45 });
    if (on && k < 0.55) effects.flash(0.5 * (1 - (k - 0.42) / 0.13), '255,230,170');
    if (on) sparkles.userData.set(bigBulb.position, clamp01((k - 0.42) * 2), 0.6);
    cam([6.6, 1.6, 0.4], [7.0, 1.7, -0.2], [10.6, 2.8, SZ], [10.6, 2.8, SZ], ease(k), 46);
  },
  santos_smile(t, d, k) {
    night(); streetState({ santosFrac: 1, santosOn: true, doorOpen: 1, bigBulb: 1 });
    santos.place(SX - 0.4, 0, SZ, -Math.PI / 2 + 0.25); santos.expr = k > 0.3 ? 'smile' : 'sad'; santos.pose({ t, headX: -0.1 });
    const h = headPos(santos);
    cam([h.x - 2.6, h.y - 0.1, h.z + 1.3], [h.x - 2.0, h.y, h.z + 1.0], [h.x, h.y, h.z], [h.x, h.y + 0.05, h.z], ease(k), 44);
  },
  end_pull(t, d, k) {
    night(); streetState({ santosFrac: 1, santosOn: true, doorOpen: 1, bigBulb: 1 });
    gather(t, true);
    santos.place(SX - 0.4, 0, SZ, -Math.PI / 2); santos.expr = 'happy'; santos.pose({ t, armR: [-2.7, 0, -0.3] });
    kid.place(7.8, 0.18, -1.0, Math.PI / 2); kid.expr = 'happy'; kid.pose({ t, armR: [-2.8, 0, -0.2] });
    cam([-2, 3.4, 10], [-14, 22, 34], [9, 3.4, -1.5], [2, 2, -10], ease(k), 52);
  },
};
function gather(t, cheer = true) {
  helpers.forEach((c, i) => { const col = i % 6, row = Math.floor(i / 6); c.place(2.6 + row * 1.6, row ? 0 : 0.18, -6 + col * 1.9 + row * 0.6, Math.PI / 2); c.expr = 'happy'; c.pose({ t, jump: cheer ? t * 7 + i : 0, armR: cheer && i % 2 ? [-2.8, 0, -0.2] : null, armL: cheer && i % 3 === 0 ? [-2.8, 0, 0.2] : null }); });
}
function workers(t) {
  const [a, b] = helpers;
  a.place(9.0, 1.6, -4.2, Math.PI / 2); a.expr = 'happy'; a.pose({ t, armL: [-2.9, 0, 0.2], armR: [-2.6 + Math.sin(t * 6) * 0.2, 0, -0.2] });
  b.place(9.0, 1.4, 0.6, Math.PI / 2); b.expr = 'smile'; b.pose({ t, armL: [-2.7 + Math.sin(t * 5) * 0.2, 0, 0.2], armR: [-2.9, 0, -0.2] });
  helpers.slice(2, 8).forEach((c, i) => { c.place(7.2 + (i % 2) * 0.8, 0.0, -5.5 + i * 1.4, Math.PI / 2 - 0.3 + (i % 3) * 0.3); c.expr = 'smile'; c.pose({ t, armL: [-1.3, 0, 0.3], armR: [-1.3, 0, -0.3] }); });
  kid.place(7.5, 0.0, 2.6, Math.PI / 2 - 0.6); kid.expr = 'happy'; kid.pose({ t, armL: [-1.4, 0, 0.3], armR: [-1.4, 0, -0.3] });
}

E.run({ timings: T, shots: S, captionStyle: 'lime' });
