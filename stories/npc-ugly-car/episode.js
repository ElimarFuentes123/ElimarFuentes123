// NPC Nico, episode 2: "In this world, the player steals a car every 30 seconds."
import * as E from '../engine/engine.js';
import { makeNico, NICO_COLORS } from '../npc-world/nico.js';
import { makePlayer, makeMarkers, markOver, buildCity, storefront, hud, txt, pill } from '../npc-world/world.js';
const { THREE, cam, ease, easeOut, clamp01, lerp, show, makeChar, headPos, handPos, effects, box, cyl, mat, canvasTex, signTex } = E;

await document.fonts.load('800 80px Cap');
const T = await (await fetch('build/timings.json')).json();
const W = E.W, H = E.H;

// ---------- cast ----------
const nico = makeNico();
const dad = makeChar({ shirt: '#ff8a3d', pants: '#3a3a46', shoes: '#2a2a2a', hairType: 'dad', hair: '#2e1d12', mustache: '#2e1d12' });
const player = makePlayer();
const pizzaGuy = makeChar({ shirt: '#e53935', pants: '#2a2a33', hairType: 'cap', cap: '#e53935', stripe: '#ffffff' });
const mayor = makeChar({ shirt: '#23262e', pants: '#23262e', shoes: '#111', hairType: 'tophat', tie: '#ff3e9a', mustache: '#2a1a10', vest: '#3a3f4c' });
const seller = makeChar({ shirt: '#ffffff', pants: '#23262e', hairType: 'dad', hair: '#c9a04a', tie: '#16C7C1' });
const owner = makeChar({ shirt: '#4a8fe0', pants: '#3a3a46', hairType: 'bob', hair: '#6b3a1e' });
const crowd = E.makeExtras(18, 202);
const marks = makeMarkers(20);
let mi = 0; const mark = (ch, t) => markOver(marks[mi++ % marks.length], ch, t, mi * 1.7);

// ---------- city ----------
const city = buildCity('city', { skipLeft: [-14], skipRight: [14], palmSkip: [[-1, -14], [1, 14], [-1, -9], [1, 19]] });
storefront(city, -1, -14, { wall: '#ffd59e', text: 'SUNSET APTS', bg: '#16C7C1' });
storefront(city, 1, 14, { wall: '#f7f0e0', text: 'LUXE MOTORS', bg: '#111111', fg: '#ffd23b' });
{ const door = box(0.2, 2.6, 1.6, mat('#6b4128'), -7.95, 1.48, -14, city); } // apartment door
// balloons at the dealership
const balloonCols = ['#ff3e9a', '#16C7C1', '#ffd23b', '#a46bff'];
for (let i = 0; i < 8; i++) { const x = 6.2 + (i % 2) * 0.6, z = 10 + i * 1.1; cyl(0.01, 0.01, 2.6, mat('#ffffff'), x, 1.5, z, city, 4); E.sphere(0.35, mat(balloonCols[i % 4], { roughness: 0.3 }), x, 3.0, z, city, 12); }
// cars
const sport = E.car(city, 2.6, -4, Math.PI, '#e53935');
const carB = E.car(city, -2.4, 8, 0, '#16C7C1');
const newCar = E.car(city, 5.4, 14, -Math.PI / 2, '#ffd23b'); // on the dealership sidewalk
const dadCar = E.car(city, -2.7, -12, 0, '#a46bff');
// the ugly car
const ugly = new THREE.Group(); city.add(ugly);
const UG = {};
{ const pink = mat('#ff3e9a', { roughness: 0.4 }), lime = mat('#b6ff3a', { roughness: 0.4 }), orange = mat('#ff8a3d', { roughness: 0.4 });
  box(2.3, 0.8, 4.6, mat('#8a6bd6', { roughness: 0.5 }), 0, 0.85, 0, ugly);
  UG.doorL = box(0.12, 0.9, 1.6, pink, -1.18, 1.0, -0.2, ugly); UG.doorR = box(0.12, 0.9, 1.6, lime, 1.18, 1.0, -0.2, ugly);
  box(0.12, 0.6, 1.0, orange, -1.18, 1.0, 1.4, ugly); box(0.12, 0.6, 1.0, mat('#16C7C1'), 1.18, 1.0, -1.7, ugly);
  // couch seat
  UG.couch = new THREE.Group(); UG.couch.position.set(0, 1.25, -0.4); ugly.add(UG.couch);
  const cm = mat('#7a4a3a'), cm2 = mat('#9a6a4a'); box(2.0, 0.4, 1.2, cm, 0, 0.2, 0, UG.couch); box(2.0, 0.9, 0.35, cm, 0, 0.6, -0.55, UG.couch); box(0.3, 0.6, 1.2, cm, -1.0, 0.45, 0, UG.couch); box(0.3, 0.6, 1.2, cm, 1.0, 0.45, 0, UG.couch);
  box(0.85, 0.15, 0.9, cm2, -0.45, 0.45, 0.05, UG.couch); box(0.85, 0.15, 0.9, cm2, 0.45, 0.45, 0.05, UG.couch);
  // toilet horn on the hood
  UG.toilet = new THREE.Group(); UG.toilet.position.set(0, 1.25, 1.6); ugly.add(UG.toilet);
  const wm = mat('#ffffff', { roughness: 0.2 }); cyl(0.32, 0.22, 0.45, wm, 0, 0.22, 0, UG.toilet, 18); box(0.7, 0.55, 0.25, wm, 0, 0.5, -0.4, UG.toilet);
  UG.lid = new THREE.Group(); UG.lid.position.set(0, 0.46, -0.3); UG.toilet.add(UG.lid); cyl(0.34, 0.34, 0.06, wm, 0, 0, 0.3, UG.lid, 18);
  // mismatched wheels
  for (const [x, z, r] of [[-1.1, 1.5, 0.45], [1.1, 1.5, 0.3], [-1.1, -1.5, 0.6], [1.1, -1.5, 0.45]]) { const w = cyl(r, r, 0.35, mat(r > 0.5 ? '#ffd23b' : '#1d1d22'), x, r, z, ugly, 14); w.rotation.z = Math.PI / 2; }
  // flag + duck
  cyl(0.03, 0.03, 2.2, mat('#ddd'), 0.9, 2.2, -2.0, ugly, 6);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: signTex('DO NOT STEAL', { w: 512, h: 256, bg: '#ffd23b', fg: '#e53935', font: '800 70px Cap' }) })); flag.position.set(1.7, 2.9, -2.0); flag.rotation.y = Math.PI / 2; ugly.add(flag);
  E.sphere(0.22, mat('#ffd23b'), -0.8, 1.45, -2.0, ugly, 10); box(0.16, 0.08, 0.16, mat('#ff8a3d'), -0.8, 1.45, -1.8, ugly);
  box(0.5, 0.25, 0.06, mat('#fff8d0', { emissive: '#fff3b0', emissiveIntensity: 0.8 }), -0.65, 0.95, 2.31, ugly, false); box(0.3, 0.3, 0.06, mat('#9bff9b', { emissive: '#7dff7d', emissiveIntensity: 0.8 }), 0.65, 0.95, 2.31, ugly, false);
}
const UGLY_SPOT = [-2.7, -12];
// bicycle
const bike = E.prop(new THREE.Group()); E.scene.add(bike);
{ const fr = mat('#16C7C1'); for (const z of [-0.9, 0.9]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 24), mat('#1d1d22')); w.position.set(0, 0.55, z); w.rotation.y = Math.PI / 2; bike.add(w); }
  const f1 = box(0.08, 0.08, 1.6, fr, 0, 1.0, 0, bike); box(0.08, 0.9, 0.08, fr, 0, 0.8, -0.3, bike); box(0.08, 0.8, 0.08, fr, 0, 1.0, 0.8, bike); box(0.7, 0.06, 0.06, mat('#222'), 0, 1.4, 0.8, bike); box(0.3, 0.08, 0.4, mat('#222'), 0, 1.25, -0.35, bike); }
// small props
const pizza = E.prop(new THREE.Group()); E.scene.add(pizza); box(0.9, 0.14, 0.9, mat('#f2e2c4'), 0, 0, 0, pizza); { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ map: signTex('PIZZA', { w: 256, h: 256, bg: '#f2e2c4', fg: '#e53935', font: '800 70px Cap' }) })); l.rotation.x = -Math.PI / 2; l.position.y = 0.075; pizza.add(l); }
const keys = E.prop(box(0.14, 0.24, 0.05, mat('#ffd23b', { metalness: 0.7, roughness: 0.3 }))); E.scene.add(keys);
const phones = Array.from({ length: 10 }, () => { const p = E.prop(box(0.22, 0.38, 0.05, mat('#111'))); E.scene.add(p); return p; });
const holdPhone = (ch, i) => { const p = handPos(ch, 1); phones[i].position.set(p.x, p.y + 0.15, p.z); phones[i].rotation.y = ch.root.rotation.y; phones[i].visible = true; };
// ticket booth
const booth = new THREE.Group(); booth.position.set(-5.4, 0.18, -6.8); city.add(booth);
{ box(2.4, 1.1, 1.0, mat('#ffd23b'), 0, 0.55, 0, booth); const s = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.9), new THREE.MeshBasicMaterial({ map: signTex('UGLY CAR TOUR $5', { w: 1024, h: 300, bg: '#ff3e9a', fg: '#ffffff', font: '800 110px Cap' }) })); s.position.set(0, 2.6, 0.1); booth.add(s); box(0.08, 1.6, 0.08, mat('#333'), -1.2, 1.6, 0, booth); box(0.08, 1.6, 0.08, mat('#333'), 1.2, 1.6, 0, booth); }
booth.rotation.y = Math.PI / 2;

// ---------- garage ----------
const garage = new THREE.Group(); garage.userData.indoor = true;
{ const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), mat('#9a9aa2')); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; garage.add(fl);
  const wl = mat('#c9b8a6'); box(20, 7, 0.3, wl, 0, 3.5, -6, garage); box(0.3, 7, 14, wl, -9, 3.5, 0, garage); box(0.3, 7, 14, wl, 9, 3.5, 0, garage);
  const peg = box(6, 3, 0.1, mat('#b5875a'), -4, 3.5, -5.8, garage); const tm = mat('#555', { metalness: 0.6 });
  for (let i = 0; i < 7; i++) box(0.12, 0.8 + (i % 3) * 0.2, 0.08, i % 2 ? tm : mat('#e53935'), -6.4 + i * 0.8, 3.6, -5.7, garage);
  box(4, 1.0, 1.4, mat('#7a5233'), 4.5, 0.5, -5, garage); for (let i = 0; i < 4; i++) cyl(0.25, 0.25, 0.5, mat(['#ff3e9a', '#b6ff3a', '#16C7C1', '#ff8a3d'][i]), 3.2 + i * 0.8, 1.25, -5, garage, 12);
  const lamp = new THREE.PointLight('#fff1d0', 3.5, 30, 1.2); lamp.position.set(0, 6, 1); garage.add(lamp); box(1.6, 0.1, 0.4, mat('#fff', { emissive: '#fff6d8', emissiveIntensity: 2 }), 0, 6.4, 1, garage, false);
  garage.userData.setNight = () => {}; }
E.addSet('garage', garage);
const gUgly = ugly.clone(true); garage.add(gUgly); gUgly.position.set(0, 0, -1); gUgly.rotation.y = Math.PI / 2;
const gParts = { couch: gUgly.children.find((c) => c.position.y === 1.25 && c.position.z === -0.4), toilet: gUgly.children.find((c) => c.position.z === 1.6 && c.position.y === 1.25) };
const roller = E.prop(new THREE.Group()); E.scene.add(roller); cyl(0.12, 0.12, 0.5, mat('#ff3e9a'), 0, 0, 0, roller, 10).rotation.z = Math.PI / 2; cyl(0.03, 0.03, 0.8, mat('#333'), 0, -0.4, 0, roller, 6);

// ---------- helpers ----------
let mode = 'sunset';
function set(where = 'city', light = 'sunset') { show(where, light); mode = light; mi = 0; }
function reset() {
  sport.position.set(2.6, 0, -4); sport.rotation.set(0, Math.PI, 0); carB.position.set(-2.4, 0, 8); carB.rotation.set(0, 0, 0);
  dadCar.position.set(-2.7, 0, -12); dadCar.visible = false; ugly.visible = false; ugly.position.set(UGLY_SPOT[0], 0, UGLY_SPOT[1]); booth.visible = false; newCar.visible = true;
  UG.lid.rotation.x = 0; gParts.couch.visible = true; gParts.toilet.visible = true;
}
const near = (ch, dx, dy, dz, k, fov = 42, pull = [0, 0, 0]) => { const h = headPos(ch, 0.4), m = 1.35; cam([h.x + dx * m, h.y + dy, h.z + dz * m], [h.x + (dx + pull[0]) * m, h.y + dy + pull[1], h.z + (dz + pull[2]) * m], [h.x, h.y - 0.14, h.z], [h.x, h.y - 0.1, h.z], ease(k), fov); };
const drive = (car, x0, z0, dirZ, k, k0, speed = 40) => { const dk = clamp01((k - k0) / (1 - k0)); car.position.set(x0, 0, z0 + dirZ * dk * dk * speed); };
const crowdAround = (t, cx, cz, n = 18, rad = 5.5, opts = {}) => crowd.slice(0, n).forEach((c, i) => {
  const a = (i / n) * Math.PI * 1.6 - Math.PI * 0.3 + (i % 3) * 0.12, rr = rad + (i % 3) * 1.4;
  const x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr; c.place(x, x > 4 || x < -4 ? 0.18 : 0, z, Math.atan2(cx - x, cz - z)); c.expr = i % 3 ? 'happy' : 'grin';
  c.pose({ t, armR: opts.phones && i % 2 ? [-2.6, 0, 0.2] : null, jump: opts.jump ? t * 6 + i : 0 }); if (opts.phones && i % 2 && i < 20) holdPhone(c, (i >> 1) % phones.length); mark(c, t);
});
const OVER = {};

// ---------- shots ----------
const S = {
  steal_a(t, d, k) {
    set(); reset(); owner.place(4.6, 0.18, -4.5, -Math.PI / 2); owner.expr = k > 0.45 ? 'shock' : 'smile'; owner.pose({ t, armR: k > 0.45 ? [-2.8, 0, 0.3] : [-1.2, 0, 0] });
    if (k < 0.45) { player.place(lerp(-1, 2.0, k / 0.45), 0, lerp(4, -2.3, k / 0.45), Math.PI - 0.4); player.expr = 'determined'; player.pose({ walk: t * 12, amp: 1, t, lean: 0.25 }); mark(player, t); }
    else drive(sport, 2.6, -4, -1, k, 0.45, 45);
    OVER.stars = k > 0.45 ? 1 : 0;
    cam([-2.6, 2.6, 6], [-2.2, 2.5, 5], [3.0, 1.2, -4], [2.6, 1.2, -9], ease(k), 50);
  },
  steal_b(t, d, k) {
    set(); reset(); drive(carB, -2.4, -6, 1, k, 0, 30);
    marks[0].position.set(carB.position.x, 3.2 + Math.sin(t * 4) * 0.1, carB.position.z); marks[0].visible = true;
    owner.place(lerp(-1.6, -2.2, k), 0, lerp(-9, -4, k), 0); owner.expr = 'cry'; owner.pose({ walk: t * 12, amp: 1, t, armR: [-2.8, 0, 0.3], armL: [-2.8, 0, -0.3] });
    OVER.stars = 1; cam([1.2, 0.9, 10], [1.0, 0.9, 10], [-2.4, 1.0, 2], [-2.4, 1.2, 6], ease(k), 54);
  },
  pizza_walk(t, d, k) {
    set(); reset(); const z = lerp(-4, 4, k); pizzaGuy.place(5.4, 0.18, z, 0); pizzaGuy.expr = 'sad'; pizzaGuy.pose({ walk: t * 6, amp: 0.5, t, armR: [-1.4, 0, 0.2], armL: [-1.4, 0, -0.2] });
    const p = handPos(pizzaGuy, 1), q = handPos(pizzaGuy, 0); pizza.position.set((p.x + q.x) / 2, p.y + 0.15, p.z + 0.05); pizza.visible = true;
    cam([2.0, 2.4, z + 4.8], [2.0, 2.4, z + 4.8], [5.4, 1.8, z], [5.4, 1.8, z], 0, 48);
  },
  mayor_bike(t, d, k) {
    set(); reset(); const z = lerp(-6, 6, k); bike.position.set(1.8, 0, z); bike.rotation.y = 0; bike.visible = true;
    mayor.place(1.8, 0.05, z - 0.3, 0); mayor.expr = 'determined'; mayor.pose({ sit: true, t, armR: [-1.3, 0, 0.1], armL: [-1.3, 0, -0.1], lean: 0.2 });
    mayor.legs[0].rotation.x = -1.2 + Math.sin(t * 9) * 0.5; mayor.legs[1].rotation.x = -1.2 - Math.sin(t * 9) * 0.5;
    cam([-2.6, 2.2, z + 3.6], [-2.6, 2.2, z + 3.6], [1.8, 1.8, z], [1.8, 1.8, z], 0, 50);
  },
  owned_timer(t, d, k) {
    set(); reset(); owner.place(-5.0, 0.18, 0, Math.PI / 2); owner.expr = 'confused'; owner.pose({ t, armR: [-1.6, 0, 0], headY: Math.sin(t * 2.5) * 0.5 });
    const p = handPos(owner, 1); keys.position.set(p.x + 0.1, p.y + 0.1, p.z); keys.visible = true;
    OVER.timer = 'LONGEST CAR OWNED: 0:59';
    cam([-1.2, 2.2, 4.8], [-1.6, 2.2, 3.8], [-5.0, 1.8, 0], [-5.0, 1.9, 0], ease(k), 46);
  },
  dad_proud(t, d, k) {
    set(); reset(); dad.place(-5.2, 0.18, -10, Math.PI / 2 - 0.3); dad.expr = 'grin'; dad.pose({ t, armR: [-0.3, 0, 0.7], armL: [-0.3, 0, -0.7] });
    nico.place(-5.6, 0.18, -8.2, Math.PI / 2 - 0.5); nico.expr = 'smile'; nico.pose({ t });
    cam([-0.4, 1.0, -4.6], [-0.6, 1.1, -5.0], [-5.2, 2.4, -9.6], [-5.2, 2.6, -9.6], ease(k), 54);
  },
  dealership(t, d, k) {
    set(); reset(); newCar.visible = true; E.sparkles.position.set(5.4, 1.6, 14); E.sparkles.visible = true;
    dad.place(4.8, 0.18, 11.2, 0.3); dad.expr = 'happy'; dad.pose({ t, armR: [-1.4, 0, -0.3] });
    seller.place(5.6, 0.18, 12.0, -Math.PI + 0.6); seller.expr = 'grin'; seller.pose({ t, armL: [-1.4, 0, 0.3] });
    cam([1.0, 2.6, 18.0], [1.4, 2.4, 17.2], [5.2, 1.5, 12.6], [5.2, 1.5, 12.6], ease(k), 50);
  },
  dad_keys(t, d, k) {
    set(); reset(); dadCar.visible = true;
    dad.place(-5.4, 0.18, -11.5, Math.PI / 2); dad.expr = 'confused'; dad.pose({ t, armR: [Math.sin(t * 9) * 0.3, 0, 0.3], armL: [-Math.sin(t * 9) * 0.3, 0, -0.3], headX: 0.3 });
    if (k > 0.5) { player.place(lerp(-0.5, -2.0, (k - 0.5) * 2), 0, lerp(-7, -11, (k - 0.5) * 2), Math.PI + 0.3); player.expr = 'smirk'; player.pose({ walk: t * 12, amp: 1, t }); mark(player, t); }
    cam([-1.6, 2.6, -5.0], [-1.4, 2.6, -5.6], [-4.2, 1.6, -11.5], [-4.0, 1.6, -11.5], ease(k), 50);
  },
  car_gone(t, d, k) {
    set(); reset(); dadCar.visible = true; drive(dadCar, -2.7, -12, 1, k, 0.1, 50);
    dad.place(-5.4, 0.18, -11.5, Math.PI / 2 - 0.3); dad.expr = 'shock'; dad.pose({ t, armR: [-2.9, 0, 0.3] });
    const p = handPos(dad, 1); keys.position.set(p.x, p.y + 0.2, p.z); keys.visible = true; OVER.stars = 1;
    cam([-3.2, 1.6, -4.5], [-3.0, 1.6, -4.0], [-5.0, 2.4, -11.5], [-4.6, 2.4, -11.5], ease(k), 46);
  },
  dad_curb(t, d, k) {
    set(); reset(); dad.place(-4.6, -0.5, -11, Math.PI / 2); dad.expr = 'sad'; dad.pose({ sit: true, t, headX: 0.35, armR: [-0.9, 0, 0.1], armL: [-0.9, 0, -0.1] });
    nico.place(-4.6, -0.5, -9.3, Math.PI / 2); nico.expr = 'worried'; nico.pose({ sit: true, t, headY: -0.4 });
    cam([-0.6, 1.8, -8.0], [-0.9, 1.8, -8.6], [-4.6, 1.3, -10.2], [-4.6, 1.3, -10.2], ease(k), 48);
  },
  nico_sad(t, d, k) {
    set(); reset(); nico.place(-4.6, -0.5, -9.3, Math.PI / 2); nico.expr = 'sad'; nico.pose({ sit: true, t, headX: 0.2 });
    near(nico, 3.0, 0.1, 1.0, k, 42, [-0.5, 0, -0.2]);
  },
  nico_plan(t, d, k) {
    set('garage'); reset(); nico.place(-3.5, 0, 2.0, 0.4); nico.expr = 'determined'; nico.pose({ t, armR: [-0.3, 0, 0.6], armL: [-0.3, 0, -0.6] });
    OVER.mission = 'NEW MISSION: BUILD THE UGLIEST CAR';
    near(nico, 1.0, 0.1, 3.4, k, 44, [0.2, 0, -0.6]);
  },
  garage_build(t, d, k) {
    set('garage'); reset(); gParts.couch.visible = false; gParts.toilet.visible = false;
    nico.place(0.4, 0, -3.3, 0); nico.expr = 'determined'; nico.pose({ t, armR: [-2.4 + Math.abs(Math.sin(t * 10)) * 1.2, 0, 0] });
    E.sparkles.position.set(0.4, 1.4, -2.2); E.sparkles.visible = true;
    cam([2.6, 3.0, 5.6], [2.2, 2.8, 5.0], [0.2, 1.4, -1.6], [0.2, 1.4, -1.6], ease(k), 50);
  },
  garage_build2(t, d, k) {
    set('garage'); reset(); gParts.toilet.visible = false;
    dad.place(-2.6, 0, 0.6, Math.PI / 2); dad.expr = 'laugh'; dad.pose({ t, armR: [-1.6 + Math.sin(t * 7) * 0.4, 0, 0] });
    const p = handPos(dad, 1); roller.position.set(p.x + 0.3, p.y + 0.3, p.z); roller.visible = true;
    nico.place(2.8, 0, 0.8, -Math.PI / 2); nico.expr = 'happy'; nico.pose({ t, jump: t * 6 });
    cam([0, 3.6, 7.5], [0.6, 3.3, 7.0], [0, 1.2, -1], [0, 1.2, -1], ease(k), 50);
  },
  ugly_doors(t, d, k) {
    set('garage'); reset(); cam([-1.6, 1.3, 4.0], [-0.4, 1.3, 4.2], [0, 1.0, -0.2], [0.6, 1.0, -0.2], ease(k), 44);
  },
  ugly_couch(t, d, k) {
    set('garage'); reset(); nico.place(-0.4, 1.25, -1.0, Math.PI / 2); nico.expr = 'happy'; nico.pose({ sit: true, t, armR: [-2.8, 0, 0.3] });
    cam([-1.4, 6.6, 4.6], [-1.0, 6.0, 4.0], [-0.4, 1.8, -1.0], [-0.4, 1.8, -1.0], ease(k), 46);
  },
  toilet_horn(t, d, k) {
    set('garage'); reset(); const press = k > 0.45 && k < 0.8; gUgly.children.forEach((c) => {});
    const lid = gParts.toilet.children.find((c) => c.type === 'Group'); if (lid) lid.rotation.x = press ? -1.2 : 0;
    nico.place(1.9, 0, 0.5, Math.PI); nico.expr = press ? 'laugh' : 'grin'; nico.pose({ t, armR: [press ? -1.3 : -1.0, 0, 0] });
    if (press) { OVER.honk = (k - 0.45) / 0.35; effects.shake(0.05); }
    cam([4.8, 2.6, 1.4], [4.3, 2.4, 1.0], [1.6, 1.6, -1.0], [1.6, 1.6, -1.0], ease(k), 46);
  },
  park_wait(t, d, k) {
    set(); reset(); ugly.visible = true; ugly.position.set(UGLY_SPOT[0], 0, lerp(-22, UGLY_SPOT[1], easeOut(clamp01(k * 1.6))));
    dad.place(-4.6, -0.5, -7.2, Math.PI / 2 + 0.6); dad.expr = 'determined'; dad.pose({ sit: true, t });
    nico.place(-4.6, -0.5, -5.6, Math.PI / 2 + 0.6); nico.expr = 'smile'; nico.pose({ sit: true, t });
    cam([1.8, 2.4, -3.0], [1.6, 2.6, -3.6], [-3.6, 1.2, -8.8], [-3.6, 1.2, -8.8], ease(k), 50);
  },
  clock_1(t, d, k, o = {}) {
    set(); reset(); ugly.visible = true;
    dad.place(-4.6, -0.5, -7.2, Math.PI / 2 + 0.6); dad.expr = o.dad || 'worried'; dad.pose({ sit: true, t });
    nico.place(-4.6, -0.5, -5.6, Math.PI / 2 + 0.6); nico.expr = 'worried'; nico.pose({ sit: true, t });
    crowd.slice(0, 3).forEach((c, i) => { const z = lerp(-20, 2, (k + i * 0.33) % 1); c.place(5.3 - i * 0.3, 0.18, z, 0); c.expr = 'confused'; c.pose({ walk: t * 7 + i, amp: 0.5, t, headY: -0.6 }); mark(c, t); });
    OVER.clock = o.label || '0:01:00';
    const a = o.angle || 0; cam([1.8 + a, 2.4, -2.0 - a], [1.8 + a, 2.4, -2.6 - a], [-3.6, 1.2, -8.8], [-3.6, 1.2, -8.8], ease(k), 50);
  },
  clock_10(t, d, k) { S.clock_1(t, d, k, { label: '0:10:00', angle: 2.5 }); },
  clock_60(t, d, k) { mode = 'neon'; show('city', 'sunset'); S.clock_1(t, d, k, { label: '1:00:00', angle: -1.5, dad: 'shock' }); },
  dad_happy(t, d, k) {
    set(); reset(); ugly.visible = true; dad.place(-4.8, 0.18, -10, Math.PI / 2 - 0.3); dad.expr = 'laugh'; dad.pose({ t, jump: t * 7, armR: [-2.9, 0, 0.3], armL: [-2.9, 0, -0.3] });
    nico.place(-5.2, 0.18, -8.2, Math.PI / 2 - 0.5); nico.expr = 'happy'; nico.pose({ t, jump: t * 7 + 1 });
    E.sparkles.position.set(-4.8, 3.0, -10); E.sparkles.visible = true; OVER.tears = true;
    near(dad, 2.6, 0.2, 1.4, k, 44, [-0.4, 0, -0.3]);
  },
  player_walks(t, d, k) {
    set(); reset(); ugly.visible = true; const z = lerp(-20, -13.5, k);
    player.place(-5.0, 0.18, z, 0); player.expr = 'blank'; player.pose({ walk: t * 6, amp: k < 0.9 ? 0.5 : 0, t }); mark(player, t);
    cam([0.4, 2.2, -6], [0.2, 2.2, -6.5], [-4.0, 1.4, -14], [-4.0, 1.4, -14], ease(k), 50);
  },
  player_stares(t, d, k) {
    set(); reset(); ugly.visible = true; player.place(-5.0, 0.18, -13.5, Math.PI / 2); player.expr = k > 0.5 ? 'shock' : 'confused'; player.pose({ t }); mark(player, t);
    near(player, 2.4, 0.0, 0.9, k, 42, [-0.5, 0, -0.2]);
  },
  photo_flash(t, d, k) {
    set(); reset(); ugly.visible = true; player.place(-5.0, 0.18, -13.5, Math.PI / 2 - 0.2); player.expr = 'grin'; player.pose({ t, armR: [-1.9, 0, 0] }); holdPhone(player, 0); mark(player, t);
    if (k > 0.55 && k < 0.7) effects.flash(1 - (k - 0.55) / 0.15);
    OVER.photo = k;
    cam([-3.4, 2.4, -20.5], [-3.3, 2.4, -20.0], [-2.7, 1.4, -12], [-2.7, 1.4, -12], ease(k), 46);
  },
  crowd_reveal(t, d, k) {
    set('city', 'day'); reset(); ugly.visible = true; crowdAround(t, -2.7, -12, 18, 5.0, {});
    OVER.online = Math.floor(lerp(12, 500, easeOut(k)));
    cam([-2.0, 3.0, -2.0], [6.0, 16, 8], [-2.7, 1.4, -12], [-2.7, 0.5, -12], ease(k), 50);
  },
  selfies(t, d, k) {
    set('city', 'day'); reset(); ugly.visible = true; crowdAround(t, -2.7, -12, 18, 4.6, { phones: true });
    if ((t * 3) % 1 < 0.08) effects.flash(0.5);
    cam([2.6, 5.2, -2.0], [2.2, 4.8, -3.0], [-2.7, 1.4, -12], [-2.7, 1.4, -12], ease(k), 50);
  },
  selfies2(t, d, k) {
    set('city', 'day'); reset(); ugly.visible = true;
    const a = crowd[0], b = crowd[1]; a.place(-0.5, 0, -9.8, Math.PI - 0.3); a.expr = 'grin'; a.pose({ t, armR: [-2.6, 0, 0.6] }); mark(a, t);
    b.place(0.6, 0, -9.4, Math.PI + 0.3); b.expr = 'laugh'; b.pose({ t, armL: [-2.6, 0, -0.5] }); mark(b, t);
    const p = handPos(a, 1); phones[0].position.set(p.x, p.y + 0.2, p.z); phones[0].rotation.y = Math.PI; phones[0].visible = true;
    if (k > 0.6 && k < 0.7) effects.flash(0.8);
    cam([0.2, 2.6, -5.8], [0.1, 2.5, -6.4], [0, 1.9, -10], [0, 1.9, -10], ease(k), 46);
  },
  dad_tickets(t, d, k) {
    set('city', 'day'); reset(); ugly.visible = true; booth.visible = true;
    dad.place(-6.2, 0.18, -6.8, Math.PI / 2); dad.expr = 'laugh'; dad.pose({ t, armR: [-1.5 + Math.sin(t * 8) * 0.2, 0, 0] });
    crowd.slice(0, 7).forEach((c, i) => { c.place(-4.4 + (i % 2) * 0.2, 0.18, -5.2 + i * 1.3, Math.PI); c.expr = 'happy'; c.pose({ t, jump: i === 0 ? t * 6 : 0 }); mark(c, t); });
    OVER.money = '$' + Math.floor(lerp(48230, 1250000, easeOut(k))).toLocaleString('en-US');
    cam([-1.4, 3.2, -13.0], [-1.8, 3.2, -12.4], [-5.6, 1.8, -6.8], [-5.6, 1.8, -6.8], ease(k), 50);
  },
  end_line(t, d, k) {
    set('city', 'sunset'); reset(); ugly.visible = true; crowdAround(t, -2.7, -12, 12, 6.0, { phones: true });
    dad.place(-4.8, 0.18, -10.4, Math.PI / 2 - 0.6); dad.expr = 'grin'; dad.pose({ t, armR: [-0.3, 0, 0.7], armL: [-0.3, 0, -0.7] });
    nico.place(-4.9, 0.18, -12.4, Math.PI / 2 - 0.3); nico.expr = 'grin'; nico.pose({ t, armR: [-2.7, 0, 0.4] });
    cam([-1.0, 3.2, -4.4], [-1.4, 3.0, -5.2], [-4.6, 2.0, -11.4], [-4.6, 2.0, -11.4], ease(k), 46);
  },
  end_pull(t, d, k) {
    set('city', 'sunset'); reset(); ugly.visible = true; crowdAround(t, -2.7, -12, 18, 5.5, { phones: true });
    dad.place(-4.8, 0.18, -10.4, Math.PI / 2 - 0.6); dad.expr = 'grin'; dad.pose({ t });
    nico.place(-4.9, 0.18, -12.4, Math.PI / 2 - 0.3); nico.expr = 'grin'; nico.pose({ t, armR: [-2.7 + Math.sin(t * 6) * 0.2, 0, 0.4] });
    cam([-1.0, 3.2, -4.4], [-1.0, 34, 12], [-4.6, 2.0, -11.4], [-2.7, 0, -14], ease(k), 50);
  },
};

// ---------- overlay ----------
function overlay(ctx, time, shot, t, d) {
  const k = t / d;
  hud(ctx, time, { stars: OVER.stars || 0, money: OVER.money || '$48,230' });
  if (OVER.timer) pill(ctx, OVER.timer, W / 2, H * 0.27, 58);
  if (OVER.mission) { pill(ctx, OVER.mission, W / 2, H * 0.27, 46, '#ffffff', 'rgba(255,62,154,0.92)'); }
  if (OVER.clock) txt(ctx, OVER.clock, W / 2, H * 0.28, 150, '#ffffff');
  if (OVER.honk != null) { const s = 1 + 0.3 * Math.sin(OVER.honk * Math.PI); ctx.save(); ctx.translate(W * 0.36, H * 0.32); ctx.rotate(-0.15); ctx.scale(s, s); txt(ctx, 'FLUUUSH!', 0, 0, 120, '#5ff2ff'); ctx.restore(); }
  if (OVER.tears) { ctx.fillStyle = 'rgba(95,242,255,0.0)'; }
  if (OVER.photo != null) {
    const p = OVER.photo; ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 10; const m = 120, L = 110;
    for (const [x, y, sx, sy] of [[m, H * 0.2, 1, 1], [W - m, H * 0.2, -1, 1], [m, H * 0.8, 1, -1], [W - m, H * 0.8, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke(); }
    ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(m + 40, H * 0.2 + 50, 14, 0, 7); ctx.fill(); ctx.restore();
    if (p > 0.62) pill(ctx, 'SAVED TO GALLERY ✓', W / 2, H * 0.74, 50, '#7dff9a');
  }
  if (OVER.online != null) pill(ctx, `PLAYERS HERE: ${OVER.online}`, W / 2, H * 0.27, 60, '#3cff8a');
  for (const key of Object.keys(OVER)) delete OVER[key];
}

E.run({ timings: T, shots: S, overlay });
