// Episode: "In this town, every time you tell a lie, it starts raining over your head."
import * as E from '../engine/engine.js';
const { THREE, cam, ease, easeOut, clamp01, lerp, show, makeChar, handPos, headPos, face, effects, sparkles, box, mat } = E;

const T = await (await fetch('build/timings.json')).json();

// ---------- cast (signature outfits, consistent across shots) ----------
const kid = makeChar({ shirt: '#ff7a1c', pants: '#2b4a86', hairType: 'kid', hair: '#2e1d12', hood: true });
const dad = makeChar({ shirt: '#3d6fb6', pants: '#3a3a46', shoes: '#2a2a2a', hairType: 'dad', hair: '#3b2618', beard: '#4a2f1c', stripe: '#2f5a99' });
const mom = makeChar({ shirt: '#a9cbe8', pants: '#a9cbe8', hairType: 'long', hair: '#7a3f1d' });
const mayor = makeChar({ shirt: '#23262e', pants: '#23262e', shoes: '#111', hairType: 'tophat', tie: '#c0392b', mustache: '#2a1a10', vest: '#3a3f4c' });
const dale = makeChar({ shirt: '#f5c518', pants: '#3a4a6a', shoes: '#333', hairType: 'hood', mustache: '#6b3a1e' });
const teacher = makeChar({ shirt: '#4caf50', pants: '#5b4a3a', hairType: 'bob', hair: '#8a4b2a', glasses: true });
const liar = makeChar({ shirt: '#8e44ad', pants: '#2e2e3a', hairType: 'cap', cap: '#2c3e50' });
const crowd = E.makeExtras(20, 5);
const walkers = E.makeExtras(6, 11);
const students = E.makeExtras(8, 21);

// ---------- props ----------
const P = (o) => E.prop(o);
const liarCloud = P(E.rainCloud({ size: 1, drops: 70 }));
const mayorCloud = P(E.rainCloud({ size: 1.7, drops: 160, fall: 1.9 }));
const daleCloud = P(E.rainCloud({ size: 1.2, drops: 110 }));
const homeworkCloud = P(E.rainCloud({ size: 0.8, drops: 45 }));
const walkerClouds = [0, 1].map(() => P(E.rainCloud({ size: 0.8, drops: 45 })));
const kidCloud = P(E.rainCloud({ size: 0.75, drops: 40, width: 0.8 }));
const storm = P(E.rainCloud({ size: 3, dark: true, drops: 520, width: 1.25, fall: 4.7 }));
const umb = P(E.umbrella('#24408f'));
const canopy = umb.children[0];
function umbrellaOpen(open) { canopy.scale.set(open ? 1 : 0.16, open ? 1 : 2.4, open ? 1 : 0.16); canopy.position.y = open ? 2.0 : 1.35; }
for (const c of [liarCloud, mayorCloud, daleCloud, homeworkCloud, ...walkerClouds, kidCloud, storm]) { const u = c.userData.update; c.userData.update = (t) => u(t, c.userData.k ?? 1); }
const cloudOver = (cloud, ch, k = 1, h = 1.35) => { const p = headPos(ch); cloud.position.set(p.x, p.y + h, p.z); cloud.visible = true; cloud.userData.k = k; cloud.scale.setScalar(1); return cloud; };
const popScale = (k) => { const x = clamp01(k); if (x <= 0) return 0.001; const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

// ---------- sets ----------
E.buildTown('town');
const plaza = E.buildPlaza('plaza', { hallText: 'TOWN HALL' });
const classroom = E.buildRoom('classroom', { kind: 'classroom', wallA: '#fff3d6', wallB: '#fbeac2', curtain: '#4fc3f7', boardText: 'HOMEWORK DUE', boardText2: 'Page 42', windowX: -5 });
const hospital = E.buildRoom('hospital', { kind: 'hospital', wallA: '#e6f4f1', wallB: '#d9eeea', curtain: '#9ad0c2', floorTex: E.tileTex, windowX: 4.5 });
const bedroom = E.buildRoom('bedroom', { kind: 'bedroom', wallA: '#cfe3f7', wallB: '#c2d9f0', curtain: '#ffcc80', blanket: '#ff8a3d', windowX: -3.5 });
const yard = E.buildYard('yard', { wall: '#f2e2c4', winX: 2.5 });
// extras placed inside sets
{
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.0), mat('#fff', { map: E.signTex('FREE PIZZA 4 ALL!', { bg: '#ffd54a', fg: '#c62828', font: '800 120px Cap' }) }));
  banner.position.set(0, 0.62, -11.95); plaza.add(banner);
  const town = E.sets.town;
  E.car(town, -9.6, 114, Math.PI / 2, '#e53935'); E.car(town, -9.6, 119.6, Math.PI / 2, '#1e88e5');
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.6), mat('#fff', { map: E.signTex("DALE'S USED CARS", { bg: '#1b5e20', fg: '#ffeb3b', font: '800 96px Cap', border: '#ffeb3b' }) }));
  sign.position.set(-12.3, 4.2, 117); sign.rotation.y = Math.PI / 2; town.add(sign);
  box(0.2, 4, 0.2, mat('#555'), -12.4, 2, 115, town); box(0.2, 4, 0.2, mat('#555'), -12.4, 2, 119, town);
  box(2.2, 0.6, 1.2, mat('#8d6e4f'), -1.6, 0.3, -3.3, hospital); box(1.1, 0.25, 1.1, mat('#8d6e4f'), -1.6, 0.85, -3.3, hospital); // chair
  box(1.1, 1.2, 0.15, mat('#8d6e4f'), -2.1, 1.5, -3.3, hospital);
  box(2.44, 0.28, 2.3, mat('#7fb3e6'), 0.5, 1.82, -3.2, hospital); // mom's blanket
  box(2.36, 0.3, 2.0, mat('#ff8a3d'), 1.5, 1.7, -3.65, bedroom); // kid's blanket
  box(2.9, 1.7, 0.3, mat('#f2e2c4'), 2.5, 3.75, -5.15, yard); // wall patch under the window
}

// ---------- shots ----------
const walkZ = (z0, t, v) => z0 + t * v;
const S = {
  // L0 hook
  hook_street(t, d, k) {
    show('town', 'day');
    walkers.forEach((w, i) => { const s = i % 2 ? -1 : 1; w.place(s * (5 + (i % 3) * 0.5), 0.18, s > 0 ? -6 - i * 3 + t * 2.4 : 14 - i * 2 - t * 2.4, s > 0 ? 0 : Math.PI); w.pose({ walk: t * 7 + i, amp: 0.55, t }); w.expr = 'smile'; });
    liar.place(5.4, 0.18, walkZ(2, t, 1.8), 0); liar.expr = 'worried'; liar.pose({ walk: t * 6, amp: 0.45, t, headX: -0.15 });
    cloudOver(liarCloud, liar);
    cam([1.0, 2.0, 16], [2.0, 2.4, 12], [5.2, 2.4, 2], [5.4, 2.8, 4], ease(k), 50);
  },
  hook_cloud(t, d, k) {
    show('town', 'day');
    liar.place(5.4, 0.18, 6, 0.3); liar.expr = k > 0.4 ? 'sad' : 'worried'; liar.pose({ t, headX: -0.45, armL: [-0.3, 0, 0.3] });
    cloudOver(liarCloud, liar, 1, 1.15).scale.setScalar(popScale(k * 3 + 0.4));
    const h = headPos(liar);
    cam([h.x - 3.0, h.y - 0.2, h.z + 4.8], [h.x - 2.5, h.y - 0.3, h.z + 4.0], [h.x, h.y + 0.5, h.z], [h.x, h.y + 0.6, h.z], ease(k), 50);
  },
  cloud_close(t, d, k) {
    show('town', 'day');
    liar.place(5.4, 0.18, 6, 0.3); liar.expr = 'sad'; liar.pose({ t, headX: -0.5, armR: [-2.6, 0, -0.2] });
    cloudOver(liarCloud, liar, 1, 1.15);
    const h = headPos(liar);
    cam([h.x + 1.3, h.y - 1.0, h.z + 3.8], [h.x + 1.0, h.y - 0.9, h.z + 3.2], [h.x, h.y + 0.7, h.z], [h.x, h.y + 0.9, h.z], ease(k), 52);
  },
  // L2 mayor
  mayor_wide(t, d, k) {
    show('plaza', 'day');
    crowd.forEach((c, i) => { const col = i % 5, row = Math.floor(i / 5); c.place(-5 + col * 2.5 + (row % 2) * 0.8, 0, -6 + row * 2.2, Math.PI); c.pose({ t, headX: -0.2, jump: (i % 3 === 0) ? t * 6 + i : 0, armR: i % 4 === 0 ? [-2.8, 0, 0] : null }); c.expr = 'happy'; });
    mayor.place(0, 1.2, -14.4, 0); mayor.say(t, 'talk', 'grin'); mayor.pose({ t, armR: [-2.4 + Math.sin(t * 5) * 0.3, 0, -0.3], armL: [-0.4, 0, 0.2] });
    cloudOver(mayorCloud, mayor, 1, 1.6).scale.setScalar(popScale(k * 2 - 0.2));
    cam([2.5, 3.2, 4], [1.5, 3.4, 0], [0, 3.2, -14], [0, 3.6, -14], ease(k), 50);
  },
  mayor_close(t, d, k) {
    show('plaza', 'day');
    mayor.place(0, 1.2, -14.4, 0); mayor.expr = k < 0.5 ? 'grin' : 'worried'; mayor.pose({ t, headX: -0.25, armL: [-0.5, 0, 0.2], armR: [-0.5, 0, -0.2] });
    cloudOver(mayorCloud, mayor, 1, 1.6).scale.setScalar(1 + ease(k) * 0.3);
    const h = headPos(mayor);
    cam([h.x + 1.6, h.y - 0.3, h.z + 5.2], [h.x + 1.2, h.y - 0.3, h.z + 4.4], [h.x, h.y + 0.6, h.z], [h.x, h.y + 0.8, h.z], ease(k), 50);
    if (k > 0.6 && k < 0.7) effects.flash(0.35);
  },
  // L3 Dale
  dale_wide(t, d, k) {
    show('town', 'day');
    dale.place(-6.4, 0.18, 117, Math.PI / 2); dale.say(t, 'talk', 'grin'); dale.pose({ t, armR: [-1.4, 0.3, -0.2], armL: [-0.2, 0, 0.1] });
    cloudOver(daleCloud, dale, 1, 1.3);
    cam([-1.2, 2.6, 124], [-1.6, 2.4, 121], [-8, 2.4, 116.5], [-7.4, 2.6, 117], ease(k), 50);
  },
  dale_close(t, d, k) {
    show('town', 'day');
    dale.place(-6.4, 0.18, 117, Math.PI / 2); dale.expr = 'grin'; dale.pose({ t, armR: [-1.6, 0, -0.5], headZ: 0.1 });
    cloudOver(daleCloud, dale, 1, 1.3);
    const h = headPos(dale);
    cam([h.x + 2.8, h.y - 0.1, h.z + 0.6], [h.x + 2.1, h.y, h.z + 0.4], [h.x, h.y, h.z], [h.x, h.y + 0.2, h.z], ease(k), 48);
  },
  // L4-5 school
  class_wide(t, d, k) { classScene(t, k, false); cam([-3.5, 4.2, -5.6], [-2.6, 3.8, -4.8], [0, 1.6, 2.4], [0, 1.9, 2.6], ease(k), 52); },
  class_kid(t, d, k) {
    classScene(t, k, true, k > 0.85 ? (k - 0.85) / 0.15 : 0);
    const h = headPos(liar);
    cam([h.x + 0.9, h.y + 0.1, h.z - 2.8], [h.x + 0.6, h.y + 0.2, h.z - 2.2], [h.x, h.y + 0.1, h.z], [h.x, h.y + 0.3, h.z], ease(k), 48);
  },
  class_lookup(t, d, k) {
    classScene(t, 1, true, 1, true);
    cam([1.8, 1.3, -2.0], [1.4, 1.4, -1.6], [0, 3.6, 2.4], [0, 3.9, 2.5], ease(k), 56);
  },
  // L6-7 me & dad
  me_walk(t, d, k) {
    show('town', 'day');
    const z = walkZ(-6, t, 2.6);
    kid.place(-5.5, 0.18, z, 0); kid.expr = 'happy'; kid.pose({ walk: t * 8, amp: 0.6, t });
    walkers.slice(0, 2).forEach((w, i) => { w.place(-4.8 - i * 0.2, 0.18, z + 7 + i * 3 - t * 4.4, Math.PI); w.pose({ walk: t * 7 + i, amp: 0.5, t, headX: -0.2 }); w.expr = 'sad'; cloudOver(walkerClouds[i], w); });
    cam([-2.8, 2.0, z + 5.5], [-3.0, 2.0, z + 5.0], [-5.5, 1.9, z], [-5.5, 1.9, z], 0, 50);
  },
  me_close(t, d, k) {
    show('town', 'day');
    kid.place(-5.5, 0.18, 2, 0.2); kid.expr = 'laugh'; kid.pose({ t, armL: [-2.9, 0, 0.3], armR: [-2.9, 0, -0.3], headX: -0.15 });
    const h = headPos(kid);
    sparkles.userData.set(new THREE.Vector3(h.x, h.y + 0.8, h.z), clamp01(k * 1.2), 0.9);
    cam([h.x + 0.6, h.y - 0.9, h.z + 3.4], [h.x + 0.4, h.y - 0.7, h.z + 2.6], [h.x, h.y + 0.3, h.z], [h.x, h.y + 0.5, h.z], ease(k), 52);
  },
  dad_walk(t, d, k) {
    show('town', 'day');
    const z = walkZ(-14, t, 2.2);
    dad.place(-5.0, 0.18, z, 0); dad.expr = 'smile'; dad.pose({ walk: t * 7, amp: 0.45, t, armR: [-0.4, 0, -0.15], headY: 0.3 });
    kid.place(-6.2, 0.18, z, 0); kid.expr = 'happy'; kid.pose({ walk: t * 7 + 1, amp: 0.55, t, armL: [-0.4, 0, 0.15], headY: -0.3 });
    holdClosedUmbrella(dad);
    cam([-1.8, 2.6, z + 6.5], [-2.2, 2.4, z + 5.5], [-5.6, 1.9, z], [-5.6, 1.9, z], 0, 50);
  },
  dad_umbrella(t, d, k) {
    show('town', 'day');
    dad.place(-5.0, 0.18, -2, -0.3); dad.expr = 'smile'; dad.pose({ t, armR: [-0.35, 0, -0.1] });
    holdClosedUmbrella(dad);
    const hp = handPos(dad, 1), h = headPos(dad);
    cam([hp.x + 2.2, hp.y + 0.2, hp.z + 2.4], [h.x + 2.0, h.y, h.z + 2.6], hp.toArray(), [h.x, h.y - 0.2, h.z], ease(k), 46);
  },
  // L8 hospital
  hospital_wide(t, d, k) {
    hospitalScene(t);
    cam([-3.4, 4.2, 1.2], [-2.8, 3.8, 0.4], [0.4, 1.6, -3.6], [0.4, 1.7, -3.8], ease(k), 50);
  },
  hospital_close(t, d, k) {
    hospitalScene(t);
    const h = headPos(mom, 0.35);
    cam([h.x + 0.2, h.y + 2.9, h.z + 1.4], [h.x + 0.15, h.y + 2.4, h.z + 1.1], h.toArray(), h.toArray(), ease(k), 46);
  },
  // L9-11 bedroom + clear sky
  tuck_wide(t, d, k) { bedScene(t, 'sleep'); cam([-2.8, 3.6, 1.4], [-2.2, 3.3, 0.4], [1.0, 1.6, -4.4], [1.0, 1.6, -4.6], ease(k), 50); },
  tuck_dad(t, d, k) {
    bedScene(t, 'sleep'); dad.say(t, 'talk', 'smile');
    const h = headPos(dad);
    cam([h.x + 2.3, h.y + 0.9, h.z + 1.8], [h.x + 1.9, h.y + 0.8, h.z + 1.5], [h.x, h.y - 0.1, h.z], [h.x, h.y, h.z], ease(k), 46);
  },
  clear_sky(t, d, k) {
    show('yard', 'night');
    cam([0, 1.2, 12], [0, 1.4, 11], [0, 9, -6], [0, 13, -6], ease(k), 58);
  },
  awake(t, d, k) {
    bedScene(t, 'worried', false);
    kid.pose({ t, headY: k > 0.5 ? -0.6 : 0, headX: 0 }); kid.o.look = k > 0.5 ? -1 : 0;
    const h = headPos(kid);
    cam([h.x + 0.4, h.y + 2.4, h.z + 1.4], [h.x + 0.3, h.y + 2.0, h.z + 1.1], h.toArray(), h.toArray(), ease(k), 50);
  },
  // L12-16 the storm
  window_kid(t, d, k) {
    yardScene(t, { kidAtWindow: true }); kid.expr = 'worried';
    cam([2.8, 3.0, 2.0], [2.7, 3.4, 0.2], [2.5, 6.2, -5.4], [2.5, 6.4, -5.4], ease(k), 46);
  },
  window_pov(t, d, k) {
    yardScene(t, { kidAtWindow: true }); kid.expr = 'shock';
    cam([3.6, 7.0, -4.3], [3.3, 6.8, -3.6], [0, 1.6, 3], [0, 1.8, 3], ease(k), 48);
  },
  umbrella_close(t, d, k) {
    yardScene(t);
    const hp = handPos(dad, 1);
    cam([hp.x + 2.6, hp.y + 0.5, hp.z + 4.2], [hp.x + 2.1, hp.y + 1.4, hp.z + 3.6], [hp.x, hp.y + 0.4, hp.z], [hp.x, hp.y + 2.2, hp.z], ease(k), 50);
  },
  storm_reveal(t, d, k) {
    yardScene(t);
    cam([1.6, 1.2, 8], [1.6, 1.2, 8.5], [0, 3, 3], [0, 13, 2], ease(k * 1.3), 60);
    if (k > 0.25 && k < 0.45) { effects.flash(0.7 * (1 - (k - 0.25) / 0.2)); effects.shake(0.12); }
  },
  storm_wide(t, d, k) {
    yardScene(t, { kidAtWindow: true });
    cam([10, 5, 22], [8, 6, 20], [0, 6, -1], [0, 7, -1], ease(k), 55);
  },
  dad_alone(t, d, k) {
    yardScene(t); dad.expr = 'sad';
    cam([-5.5, 2.2, 6.5], [-4.8, 2.4, 5.8], [0, 2.4, 3], [0, 2.6, 3], ease(k), 48);
  },
  dad_face(t, d, k) {
    yardScene(t); dad.expr = 'cry';
    const h = headPos(dad);
    cam([h.x - 0.4, h.y - 0.2, h.z + 2.4], [h.x - 0.3, h.y - 0.1, h.z + 1.8], [h.x, h.y, h.z], [h.x, h.y + 0.1, h.z], ease(k), 46);
  },
  lie_flash(t, d, k) {
    if (k < 0.42) { // memory: "Mom is going to be fine"
      bedScene(t, 'sleep'); dad.say(t, 'talk', 'smile');
      const h = headPos(dad);
      cam([h.x + 1.5, h.y, h.z + 2.0], [h.x + 1.3, h.y, h.z + 1.7], h.toArray(), h.toArray(), ease(k / 0.42), 46);
      effects.darken(0.25);
    } else {
      yardScene(t); dad.expr = 'cry';
      const h = headPos(dad);
      cam([h.x + 0.3, h.y - 0.1, h.z + 1.9], [h.x + 0.2, h.y, h.z + 1.6], h.toArray(), h.toArray(), ease((k - 0.42) / 0.58), 44);
      if (k < 0.62) { effects.flash(0.8 * (1 - (k - 0.42) / 0.2)); effects.shake(0.08); }
    }
  },
  // L17-21 together
  run_out(t, d, k) {
    yardScene(t, { kidPos: [lerp(2.5, -1.2, ease(k)), 0, lerp(-5.2, 2.4, ease(k))], kidRun: true }); kid.expr = 'determined';
    cam([5.5, 2.6, 7.5], [4.5, 2.4, 7.0], [1.8, 1.8, -2.5], [-0.8, 1.8, 2.2], ease(k), 50);
  },
  stand_next(t, d, k) {
    yardScene(t, { kidPos: [-1.35, 0, 3] }); kid.expr = 'sad'; dad.expr = 'shock';
    dad.pose({ t, armR: [-0.95, 0, 0.1], headY: -0.5 });
    cam([-0.6, 2.0, 9], [-0.6, 2.1, 7.6], [-0.6, 2.0, 3], [-0.6, 2.0, 3], ease(k), 46);
  },
  hand_hold(t, d, k) {
    yardScene(t, { kidPos: [-1.3, 0, 3], hold: true }); kid.expr = 'sad';
    const a = handPos(kid, 1), b = handPos(dad, 0);
    const c = a.add(b).multiplyScalar(0.5);
    cam([-0.6, 1.0, 6.2], [-0.6, 1.1, 5.4], [-0.6, 1.5, 3], [-0.6, 1.6, 3], ease(k), 46);
  },
  kid_say(t, d, k) {
    yardScene(t, { kidPos: [-1.3, 0, 3], hold: true }); kid.say(t, 'talk', 'determined'); kid.pose({ t, headY: 0.5, headX: -0.15, armR: [-0.35, 0, 0.35] });
    const h = headPos(kid);
    cam([h.x - 0.4, h.y - 0.1, h.z + 3.0], [h.x - 0.3, h.y - 0.05, h.z + 2.5], [h.x + 0.2, h.y, h.z], [h.x + 0.2, h.y, h.z], ease(k), 46);
  },
  kid_cloud(t, d, k) {
    yardScene(t, { kidPos: [-1.3, 0, 3], hold: true, kidCloudK: clamp01((k - 0.25) * 2.5) }); kid.expr = k > 0.3 ? 'shock' : 'determined'; dad.expr = k > 0.4 ? 'shock' : 'sad';
    dad.pose({ t, armR: [-0.95, 0, 0.1], headY: -0.55, armL: [-0.35, 0, -0.35] });
    const h = headPos(kid);
    if (k > 0.25) sparkles.userData.set(new THREE.Vector3(h.x, h.y + 1.3, h.z), clamp01((k - 0.25) * 1.5), 0.8);
    cam([-0.6, 2.4, 8.6], [-0.6, 3.0, 7.4], [-0.6, 2.8, 3], [-0.6, 3.6, 3], ease(k), 50);
  },
  kid_cloud_close(t, d, k) {
    yardScene(t, { kidPos: [-1.3, 0, 3], hold: true, kidCloudK: 1 }); kid.expr = 'happy'; kid.pose({ t, headX: -0.35, headY: 0.2, armR: [-0.35, 0, 0.35] });
    const h = headPos(kid);
    cam([h.x - 1.2, h.y - 0.5, h.z + 3.4], [h.x - 1.0, h.y - 0.4, h.z + 2.9], [h.x, h.y + 0.6, h.z], [h.x, h.y + 0.7, h.z], ease(k), 50);
  },
  final_close(t, d, k) {
    yardScene(t, { kidPos: [-1.3, 0, 3], hold: true, kidCloudK: 1, umbShare: ease(k) }); dad.expr = 'smile'; kid.expr = 'happy';
    dad.pose({ t, armR: [-0.95, 0, 0.1 + ease(k) * 0.3], headY: -0.45, headX: 0.1, armL: [-0.35, 0, -0.35] });
    cam([-0.6, 2.5, 7.8], [-0.6, 2.6, 6.8], [-0.6, 2.6, 3], [-0.6, 2.7, 3], ease(k), 50);
  },
  final_wide(t, d, k) {
    yardScene(t, { kidPos: [-1.3, 0, 3], hold: true, kidCloudK: 1, umbShare: 1 }); dad.expr = 'smile'; kid.expr = 'happy';
    cam([3.5, 3.0, 13], [5, 6, 19], [-0.6, 3.5, 3], [-0.6, 6, 2], ease(k), 52);
  },
  end_wide(t, d, k) {
    yardScene(t, { kidPos: [-1.3, 0, 3], hold: true, kidCloudK: 1, umbShare: 1 }); dad.expr = 'smile'; kid.expr = 'happy';
    cam([5, 6, 19], [7, 12, 30], [-0.6, 6, 2], [-0.6, 8, 0], ease(k), 52);
  },
};

// ---------- scene builders ----------
function classScene(t, k, standing, cloudK = 0, lookUp = false) {
  show('classroom', 'day');
  const desks = classroom.userData.desks;
  students.forEach((s, i) => {
    const di = i < 4 ? i : i + 1; const [x, z] = desks[di];
    s.place(x, 0.12, z, Math.PI); s.expr = lookUp ? 'shock' : 'smile';
    s.pose({ sit: true, t, headX: lookUp ? -0.55 : 0.05, headY: lookUp ? face([x, 0, z], [0, 0, 2.6]) - Math.PI : 0 });
  });
  teacher.place(3.2, 0, -4.9, -0.2); teacher.expr = lookUp ? 'shock' : 'smirk';
  teacher.pose({ t, headX: lookUp ? -0.5 : 0, armR: lookUp ? null : [-1.2, 0, -0.4] });
  const [x, z] = desks[4];
  liar.o.look = 0;
  if (standing) { liar.place(x, 0, z + 0.3, Math.PI); liar.say(t, 'talk', 'grin'); liar.pose({ t, armR: [-1.6, 0, -0.2], headX: lookUp ? -0.5 : 0 }); if (lookUp) liar.expr = 'worried'; }
  else { liar.place(x, 0.12, z, Math.PI); liar.expr = 'smile'; liar.pose({ sit: true, t }); }
  if (cloudK > 0) cloudOver(homeworkCloud, liar, 1, 1.25).scale.setScalar(popScale(cloudK));
}
function hospitalScene(t) {
  show('hospital', 'day');
  mom.place(0.5, 1.47, -2.2, 0, -Math.PI / 2); mom.expr = 'smile'; mom.pose({ t, headY: -0.35 });
  dad.place(-1.6, 0.12, -3.3, Math.PI / 2); dad.expr = 'sad'; dad.pose({ sit: true, t, headX: 0.15 });
  kid.place(2.6, 0, -1.0, face([2.6, 0, -1], [0.5, 0, -4])); kid.expr = 'sad'; kid.pose({ t, headX: 0.2 });
}
function bedScene(t, kidExpr, withDad = true) {
  show('bedroom', 'night');
  kid.place(1.5, 1.29, -2.9, 0, -Math.PI / 2); kid.expr = kidExpr; kid.pose({ t });
  if (withDad) { dad.place(-0.35, 0, -4.4, Math.PI / 2); dad.pose({ t, lean: 0.22, armR: [-1.1, 0, 0], headX: 0.15 }); dad.expr = 'smile'; }
}
function holdClosedUmbrella(ch) {
  umbrellaOpen(false); umb.visible = true;
  const hp = handPos(ch, 1); umb.position.copy(hp).add(new THREE.Vector3(0, 0.15, 0)); umb.rotation.set(0, 0, Math.PI);
}
function yardScene(t, o = {}) {
  show('yard', 'storm');
  dad.place(0, 0, 3, 0); dad.expr = 'sad'; dad.pose({ t, armR: [-0.95, 0, 0.1], headX: -0.25, armL: o.hold ? [-0.35, 0, -0.35] : null });
  storm.position.set(0.3, 13.5, 3); storm.visible = true; storm.userData.k = 1;
  // umbrella over dad (or shared)
  umbrellaOpen(true); umb.visible = true; umb.rotation.set(0, 0, 0);
  const hp = handPos(dad, 1); const share = o.umbShare || 0;
  umb.position.set(lerp(hp.x, -0.5, share), hp.y - 0.1 + share * 0.2, hp.z); umb.rotation.z = share * 0.12;
  storm.userData.shelter = { x: umb.position.x - share * 0.2, z: umb.position.z, r: 1.55, y: umb.position.y + 2.1 };
  if (o.kidAtWindow) { const [wx, , wz] = E.sets.yard.userData.window; kid.place(wx, 3.9, wz - 0.05, 0); kid.pose({ t, headX: 0.35, armL: [-0.4, 0, 0.2], armR: [-0.4, 0, -0.2] }); }
  else if (o.kidPos) {
    const [x, y, z] = o.kidPos; kid.place(x, y, z, o.kidRun ? face([2.5, 0, -5.2], [-1.2, 0, 2.4]) : 0);
    kid.pose(o.kidRun ? { walk: t * 13, amp: 0.95, t, lean: 0.12 } : { t, headY: 0.45, headX: -0.15, armR: o.hold ? [-0.35, 0, 0.35] : null });
    if (o.kidCloudK) { cloudOver(kidCloud, kid, 1, 1.25).scale.setScalar(popScale(o.kidCloudK)); }
  }
}

E.run({ timings: T, shots: S, captionStyle: 'lime' });
