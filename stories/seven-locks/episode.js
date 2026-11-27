// Episode 2: "In this town, nobody locks their doors."
import * as E from '../engine/engine.js';
const { THREE, cam, ease, clamp01, lerp, show, makeChar, handPos, headPos, face, effects, sparkles, box, cyl, mat, canvasTex, signTex } = E;

const T = await (await fetch('build/timings.json')).json();

// ---------- cast ----------
const kid = makeChar({ shirt: '#ff7a1c', pants: '#2b4a86', hairType: 'kid', hair: '#2e1d12', hood: true });
const dad = makeChar({ shirt: '#3d6fb6', pants: '#3a3a46', shoes: '#2a2a2a', hairType: 'dad', hair: '#3b2618', beard: '#4a2f1c', stripe: '#2f5a99' });
const baker = makeChar({ shirt: '#ffffff', pants: '#8d6e4f', hairType: 'chef', mustache: '#5a3a20', stripe: '#e57373' });
const mrsLee = makeChar({ shirt: '#9b59b6', pants: '#4a4a5a', hairType: 'long', hair: '#c8c8c8', glasses: true });
const teasers = [
  makeChar({ shirt: '#3bb37a', pants: '#2a3a6a', hairType: 'cap', cap: '#e53935' }),
  makeChar({ shirt: '#f4d03f', pants: '#3a3a46', hairType: 'bob', hair: '#6b3a1e' }),
  makeChar({ shirt: '#4a8fe0', pants: '#56503f', hairType: 'kid', hair: '#1c1c1c' }),
];
const walkers = E.makeExtras(4, 31);

// ---------- sets ----------
const SIDE = -45.5;
const town = E.buildTown('town', { sideRoad: SIDE });
const living = E.buildRoom('living', { kind: 'living', wallA: '#e9dcc5', wallB: '#e0d1b6', curtain: '#5c7fa3', sofa: '#7a5c8f', windowX: -4, lampX: -5.5 });
const bedroom = E.buildRoom('bedroom', { kind: 'bedroom', wallA: '#cfe3f7', wallB: '#c2d9f0', curtain: '#ffcc80', blanket: '#ff8a3d', windowX: -3.5 });
const emptyroom = E.buildRoom('emptyroom', { kind: 'bedroom', wallA: '#dfe6d2', wallB: '#d5ddc6', curtain: '#9fb8c9', blanket: '#dfe6ee', windowX: -3.5 });
const attic = buildAttic();

// town dressing: open doors everywhere, the bakery, and OUR door with seven locks
const warm = mat('#ffd9a0', { emissive: '#ffc070', emissiveIntensity: 1.2 });
function openDoor(i, s) {
  const zDoor = s < 0 ? i * 13 + 2 : i * 13 - 2, x = s * 10.93;
  box(0.05, 2.5, 1.2, warm, x - s * 0.16, 1.3, zDoor, town, false);
  const a = 1.25, hingeZ = zDoor - s * 0.6;
  const slab = box(0.12, 2.5, 1.2, mat('#6b4a30'), x - s * Math.sin(a) * 0.6, 1.3, hingeZ + s * Math.cos(a) * 0.6, town);
  slab.rotation.y = s < 0 ? a : a + Math.PI;
}
for (let i = -3; i <= 4; i++) for (const s of [-1, 1]) if (!(s < 0 && i === 0)) openDoor(i, s);
{
  // bakery on the left, house i=2 (z=26)
  const aw = box(0.9, 0.12, 6.5, mat('#e57373'), -10.4, 3.25, 26, town); aw.rotation.z = -0.35;
  for (let k = 0; k < 6; k++) box(0.92, 0.13, 0.5, mat('#fff'), -10.4, 3.26, 23.3 + k * 1.1, town).rotation.z = -0.35;
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.0), mat('#fff', { map: signTex('BAKERY · OPEN 24/7', { bg: '#5d4037', fg: '#ffe082', font: '800 92px Cap' }) }));
  sg.position.set(-10.85, 5.7, 26); sg.rotation.y = Math.PI / 2; town.add(sg);
  for (let k = 0; k < 5; k++) box(0.4, 0.25, 0.6, mat('#c98b4a'), -10.6, 1.3, 23.3 + k * 0.5, town);
  // our door: seven locks on the outside
  for (let k = 0; k < 7; k++) box(0.08, 0.18, 0.26, mat(k % 2 ? '#c7ccd3' : '#e0b040', { metalness: 0.7, roughness: 0.3 }), -10.83, 0.55 + k * 0.32, 2.42, town);
  // highway 9 sign at the side road
  const hs = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.9), mat('#fff', { map: signTex('HWY 9  →', { w: 1024, h: 440, bg: '#1b7a3a', fg: '#ffffff', font: '800 230px Cap', border: '#ffffff' }) }));
  hs.position.set(6.4, 4.6, SIDE + 3.2); town.add(hs);
  box(0.18, 4.2, 0.18, mat('#666'), 5.0, 2.1, SIDE + 3.15, town); box(0.18, 4.2, 0.18, mat('#666'), 7.8, 2.1, SIDE + 3.15, town);
}
// living room: front door with 7 locks, chair (prop) in front of it
{
  box(2.1, 3.9, 0.14, mat('#7b4a2a'), 4.5, 1.95, -6.78, living);
  box(2.4, 0.2, 0.2, mat('#f4f1ea'), 4.5, 4.0, -6.75, living);
  sphere(0.1, 3.75, 1.9, -6.66);
  for (let k = 0; k < 7; k++) {
    const y = 1.0 + k * 0.38;
    if (k % 3 === 2) { const ch = box(0.5, 0.05, 0.05, mat('#c7ccd3', { metalness: 0.8, roughness: 0.3 }), 5.15, y, -6.66, living); ch.rotation.z = -0.4; }
    else box(0.32, 0.2, 0.12, mat(k % 2 ? '#c7ccd3' : '#e0b040', { metalness: 0.75, roughness: 0.3 }), 5.25, y, -6.66, living);
  }
  const hook = box(0.9, 0.08, 0.1, mat('#5a3a24'), 2.6, 3.0, -6.8, living);
}
function sphere(r, x, y, z) { E.sphere(r, mat('#e0b040', { metalness: 0.8, roughness: 0.3 }), x, y, z, living, 10); }
const chair = E.prop(new THREE.Group()); E.scene.add(chair);
{ const cm = mat('#6d8f5e'); box(2.2, 0.85, 2.0, cm, 0, 0.42, 0, chair); box(2.2, 2.3, 0.5, cm, 0, 1.4, -0.85, chair); box(0.45, 1.3, 2.0, cm, -1.3, 0.85, 0, chair); box(0.45, 1.3, 2.0, cm, 1.3, 0.85, 0, chair); chair.position.set(4.5, 0, -5.0); }
// bedrooms
box(2.36, 0.3, 2.0, mat('#ff8a3d'), 1.5, 1.7, -3.65, bedroom);
{ const sheet = mat('#f2f2ee'); box(2.6, 0.3, 4.6, sheet, 1.5, 1.2, -4, emptyroom); box(0.06, 1.0, 4.6, sheet, 0.2, 0.7, -4, emptyroom); box(0.06, 1.0, 4.6, sheet, 2.8, 0.7, -4, emptyroom);
  const cols = ['#e53935', '#1e88e5', '#fdd835', '#43a047']; for (let k = 0; k < 7; k++) box(0.35, 0.35, 0.35, mat(cols[k % 4]), -2 + (k % 4) * 0.5, 0.18 + Math.floor(k / 4) * 0.35, 1 + (k % 3) * 0.2, emptyroom);
  E.car(emptyroom, -3.5, 2.5, 0.6, '#e53935').scale.setScalar(0.18); }

// newspaper prop
const paperTex = canvasTex(600, 800, (g) => {
  g.fillStyle = '#efe6cf'; g.fillRect(0, 0, 600, 800);
  g.fillStyle = '#1a1a1a'; g.font = '800 54px serif'; g.textAlign = 'center'; g.fillText('THE TOWN GAZETTE', 300, 70);
  g.fillRect(30, 88, 540, 4); g.font = '600 20px serif'; g.fillText('MARCH 14, 2014', 300, 116); g.fillRect(30, 128, 540, 2);
  g.font = '800 46px Cap'; ['BOY, 6, SLEEPWALKS', 'OUT OF UNLOCKED', 'HOME ONTO HWY 9'].forEach((l, k) => g.fillText(l, 300, 186 + k * 52));
  // photo of the brother: same hair, green shirt, big smile
  g.fillStyle = '#9fb6c4'; g.fillRect(150, 350, 300, 260);
  g.fillStyle = '#3bb37a'; g.fillRect(205, 520, 190, 90);
  g.fillStyle = '#f6c945'; g.beginPath(); g.roundRect(230, 410, 140, 115, 22); g.fill();
  g.fillStyle = '#2e1d12'; g.fillRect(222, 392, 156, 38); g.fillRect(222, 392, 24, 70); g.fillRect(354, 392, 24, 70);
  g.fillStyle = '#1b1410'; g.beginPath(); g.ellipse(275, 462, 9, 13, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(325, 462, 9, 13, 0, 0, 7); g.fill();
  g.beginPath(); g.arc(300, 488, 22, 0, Math.PI); g.fill();
  g.strokeStyle = '#1a1a1a'; g.lineWidth = 4; g.strokeRect(150, 350, 300, 260);
  g.fillStyle = 'rgba(40,40,40,0.55)'; for (let y = 640; y < 780; y += 16) { g.fillRect(40, y, 250, 6); g.fillRect(310, y, 250, 6); }
  g.fillStyle = 'rgba(120,90,40,0.12)'; g.fillRect(0, 0, 600, 800);
});
const paper = E.prop(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2), mat('#fff', { map: paperTex, emissive: '#ffffff', emissiveMap: paperTex, emissiveIntensity: 0.35, side: THREE.DoubleSide })));
E.scene.add(paper);
const keyProp = E.prop(new THREE.Group()); E.scene.add(keyProp);
{ const gold = mat('#f2c230', { metalness: 0.85, roughness: 0.2, emissive: '#7a5a00', emissiveIntensity: 0.3 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 8, 20), gold); keyProp.add(ring);
  box(0.06, 0.34, 0.03, gold, 0, -0.27, 0, keyProp); box(0.1, 0.05, 0.03, gold, 0.06, -0.38, 0, keyProp); box(0.08, 0.05, 0.03, gold, 0.05, -0.3, 0, keyProp); }
const dadCar = (() => { const g = E.prop(new THREE.Group()); E.scene.add(g); E.car(g, 0, 0, 0, '#455a64'); return g; })();

function buildAttic() {
  const g = new THREE.Group(); g.userData.indoor = true;
  const wood = mat('#ffffff', { map: E.woodTex });
  box(14, 0.2, 14, wood, 0, -0.1, 0, g, false);
  for (const s of [-1, 1]) { const r = box(10, 0.3, 14, mat('#8a6a4a'), s * 3.4, 3.6, 0, g, false); r.rotation.z = -s * 0.8; }
  for (let z = -6; z <= 6; z += 2) for (const s of [-1, 1]) { const b = box(0.25, 0.25, 0.25, mat('#5a3d26'), s * 3.3, 3.5, z, g, false); b.scale.set(38, 1, 1); b.rotation.z = -s * 0.8; }
  box(14, 7, 0.3, mat('#7a5a3c'), 0, 3.5, -6.5, g, false);
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), mat('#2a3d78', { emissive: '#4a66b8', emissiveIntensity: 1.2 })); win.position.set(0, 4.6, -6.33); g.add(win);
  const moon = new THREE.SpotLight('#9fb4ff', 2.2, 30, 0.5, 0.6, 0); moon.position.set(0, 4.6, -7.5); moon.target.position.set(0.3, 0, -1.2); moon.castShadow = true; g.add(moon, moon.target);
  const bulb = new THREE.PointLight('#ffb766', 1.4, 12, 0); bulb.position.set(1.2, 4.0, 1.0); g.add(bulb);
  E.sphere(0.14, mat('#fff3cf', { emissive: '#ffcc66', emissiveIntensity: 3 }), 1.2, 4.0, 1.0, g, 10); cyl(0.01, 0.01, 2.2, mat('#222'), 1.2, 5.1, 1.0, g, 4);
  const card = mat('#b58a5a');
  [[-3.2, -3, 1.4, 1.2], [-3.4, -1.6, 1.2, 1.0], [-3.0, -3, 1.0, 0.8, 1.2], [3.0, -2.5, 1.6, 1.3], [3.2, 0.5, 1.2, 1.0]].forEach(([x, z, w, h, y0 = 0]) => box(w, h, w * 0.9, card, x, y0 + h / 2, z, g));
  // the open box with the newspaper
  box(1.5, 0.9, 1.1, card, 0.2, 0.45, -1.5, g); const f1 = box(1.5, 0.05, 0.55, card, 0.2, 0.95, -0.85, g); f1.rotation.x = 0.9; const f2 = box(1.5, 0.05, 0.55, card, 0.2, 0.95, -2.15, g); f2.rotation.x = -0.9;
  box(0.9, 0.08, 0.7, mat('#efe6cf'), 0.2, 0.86, -1.5, g, false);
  g.userData.setNight = () => {};
  return E.addSet('attic', g);
}

// ---------- shots ----------
const S = {
  open_doors(t, d, k) {
    show('town', 'day');
    walkers.forEach((w, i) => { const s = i % 2 ? -1 : 1; w.place(s * 5.4, 0.18, s > 0 ? -2 - i * 4 + t * 2.2 : 12 - i * 3 - t * 2.2, s > 0 ? 0 : Math.PI); w.pose({ walk: t * 7 + i, amp: 0.5, t }); w.expr = 'smile'; });
    cam([1.0, 3.6, 30], [0.6, 3.0, 24], [0, 2.0, 0], [0, 2.0, 0], ease(k), 50);
  },
  door_close_open(t, d, k) {
    show('town', 'day');
    cam([6.6, 1.8, 17], [7.4, 1.8, 15], [10.9, 1.4, 11], [10.9, 1.4, 11], ease(k), 48);
  },
  baker(t, d, k) {
    show('town', 'day');
    baker.place(-9.9, 0, 27.2, Math.PI / 2); baker.expr = 'happy'; baker.pose({ t, armR: [-2.6 + Math.sin(t * 7) * 0.25, 0, -0.4] });
    cam([-4.2, 2.6, 33], [-4.6, 2.5, 31.5], [-10, 2.4, 26], [-10, 2.6, 26.5], ease(k), 50);
  },
  mrs_lee(t, d, k) {
    show('town', 'day');
    mrsLee.place(10.1, 0, 12.2, -Math.PI / 2); mrsLee.expr = 'happy'; mrsLee.pose({ t, armR: [-2.7 + Math.sin(t * 6) * 0.25, 0, -0.3] });
    cam([5.4, 2.4, 16.5], [6.0, 2.4, 15.0], [10.6, 2.2, 11.4], [10.6, 2.3, 11.4], ease(k), 48);
  },
  our_door(t, d, k) {
    show('town', 'day');
    kid.place(-9.6, 0, 5.2, -2.2); kid.expr = 'worried'; kid.pose({ t, headY: 0.3 });
    cam([-6.2, 1.7, 5.0], [-7.4, 1.6, 4.0], [-10.9, 1.5, 2.4], [-10.9, 1.4, 2.4], ease(k), 48);
  },
  locks_pan(t, d, k) {
    show('living', 'day');
    cam([6.4, 1.0, -3.8], [6.4, 3.4, -3.8], [5.1, 1.0, -6.7], [5.1, 3.3, -6.7], ease(k), 40);
  },
  kids_tease(t, d, k) {
    show('town', 'day');
    teasers.forEach((c, i) => { c.place(-5.0 - (i % 2) * 0.7, 0.18, 5.5 + i * 1.3, -Math.PI / 2 + 0.3); c.expr = 'laugh'; c.pose({ t, armR: i !== 1 ? [-1.6, 0, 0] : null, jump: i === 1 ? t * 9 : 0 }); });
    kid.place(-5.3, 0.18, lerp(1.5, 0.0, k), 0.3); kid.expr = 'sad'; kid.pose({ walk: t * 5, amp: 0.3, t, headX: 0.3 });
    cam([1.2, 2.2, 10.5], [0.6, 2.2, 9.5], [-6.0, 1.8, 3.5], [-6.2, 1.8, 3.5], ease(k), 50);
  },
  dad_checks(t, d, k) {
    show('living', 'night');
    dad.place(4.5, 0, -5.4, Math.PI); dad.expr = 'worried'; dad.pose({ t, armR: [-2.1 + Math.sin(t * 4) * 0.25, 0, 0.35], headX: -0.1 });
    cam([1.0, 3.0, -1.0], [1.4, 2.9, -1.6], [4.7, 2.2, -6.2], [4.8, 2.2, -6.2], ease(k), 48);
  },
  lock_hand(t, d, k) {
    show('living', 'night');
    dad.place(4.6, 0, -5.55, Math.PI); dad.expr = 'worried'; dad.pose({ t, armR: [-1.9 + Math.sin(t * 5) * 0.2, 0, 0.45] });
    cam([6.8, 2.6, -4.6], [6.6, 2.8, -4.9], [5.2, 2.2, -6.6], [5.2, 2.4, -6.6], ease(k), 42);
  },
  empty_hall(t, d, k) {
    show('emptyroom', 'night');
    kid.place(0.5, 0, 3.2, Math.PI); kid.expr = 'sad'; kid.pose({ t, headX: 0.1 });
    cam([0.0, 3.0, 8.5], [0.3, 2.9, 7.2], [0.8, 1.8, -3], [0.9, 1.8, -3], ease(k), 50);
  },
  empty_room(t, d, k) {
    show('emptyroom', 'night');
    cam([-1.8, 2.4, 3.6], [-0.6, 2.2, 2.8], [1.2, 0.9, -3.5], [-1.0, 0.6, 1.2], ease(k), 48);
  },
  highway_sign(t, d, k) {
    show('town', 'day');
    const z = lerp(-26, -36, ease(k)); dadCar.position.set(-2, 0, z); dadCar.rotation.y = Math.PI; dadCar.visible = true;
    cam([-0.2, 2.6, -16], [-0.6, 2.6, -22], [6.4, 4.0, SIDE + 3.2], [6.4, 4.2, SIDE + 3.2], ease(k), 46);
  },
  car_turns(t, d, k) {
    show('town', 'day');
    const z = lerp(-38, -58, ease(k)); dadCar.position.set(-2, 0, z); dadCar.rotation.y = Math.PI; dadCar.visible = true;
    cam([12, 22, -30], [10, 22, -36], [0, 0, -46], [-1, 0, -50], ease(k), 50);
  },
  bed_determined(t, d, k) {
    show('bedroom', 'night');
    kid.place(1.5, 1.29, -2.9, 0, -Math.PI / 2); kid.expr = 'determined'; kid.pose({ t, headY: -0.2 });
    const h = headPos(kid);
    cam([h.x + 0.4, h.y + 2.4, h.z + 1.4], [h.x + 0.3, h.y + 1.9, h.z + 1.1], h.toArray(), h.toArray(), ease(k), 50);
  },
  tiptoe(t, d, k) {
    show('living', 'night');
    kid.place(lerp(-1.5, 1.6, k), 0, lerp(4.5, 0.2, k), face([-1.5, 0, 4.5], [1.6, 0, 0.2])); kid.expr = 'worried'; kid.pose({ walk: t * 4, amp: 0.25, t, armL: [-0.6, 0, 0.5], armR: [-0.6, 0, -0.5] });
    cam([-3.5, 1.2, 7.0], [-2.6, 1.3, 5.5], [0, 1.6, 2], [1.4, 1.6, 0.4], ease(k), 50);
  },
  dad_chair_reveal(t, d, k) {
    livingNight(t);
    kid.place(2.0, 0, -0.2, face([2.0, 0, -0.2], [4.5, 0, -5])); kid.expr = 'shock'; kid.pose({ t });
    const h = headPos(kid);
    cam([0.2, 3.2, 1.0], [0.6, 3.0, 0.4], [4.5, 1.8, -5], [4.5, 1.9, -5], ease(k), 46);
  },
  dad_chair_close(t, d, k) { livingNight(t); const h = headPos(dad); cam([h.x - 0.6, h.y + 0.1, h.z + 2.6], [h.x - 0.4, h.y, h.z + 2.0], h.toArray(), h.toArray(), ease(k), 46); },
  attic_enter(t, d, k) {
    show('attic', 'night');
    kid.place(lerp(0.6, 0.4, k), 0, lerp(4.5, 0.2, ease(k)), Math.PI); kid.expr = 'worried'; kid.pose({ walk: t * 5, amp: 0.3, t });
    cam([1.6, 2.2, 7.5], [1.2, 2.4, 6.0], [0.3, 1.6, -2], [0.3, 1.4, -1.6], ease(k), 52);
  },
  box_open(t, d, k) {
    atticKid(t, false); kid.expr = 'worried';
    cam([2.6, 2.6, -2.8], [2.2, 2.4, -2.6], [0.2, 0.9, -1.4], [0.2, 0.9, -1.4], ease(k), 46);
  },
  paper_lift(t, d, k) { atticKid(t, true, clamp01(k * 1.4)); kid.expr = 'worried'; const p = paper.position; cam([p.x + 1.3, p.y + 0.3, p.z - 2.4], [p.x + 0.9, p.y + 0.2, p.z - 1.9], [p.x, p.y + 0.2, p.z], p.toArray(), ease(k), 46); },
  headline(t, d, k) { atticKid(t, true, 1); const p = paper.position; cam([p.x - 0.05, p.y + 0.2, p.z - 1.45], [p.x - 0.05, p.y + 0.25, p.z - 1.15], [p.x, p.y + 0.25, p.z], [p.x, p.y + 0.3, p.z], ease(k), 40); },
  photo_close(t, d, k) { atticKid(t, true, 1); const p = paper.position; cam([p.x, p.y - 0.12, p.z - 0.85], [p.x, p.y - 0.14, p.z - 0.6], [p.x, p.y - 0.12, p.z], [p.x, p.y - 0.14, p.z], ease(k), 40); },
  kid_shock(t, d, k) { atticKid(t, true, 0.55, true); kid.expr = 'shock'; const h = headPos(kid); cam([h.x + 0.7, h.y + 0.3, h.z - 2.4], [h.x + 0.5, h.y + 0.3, h.z - 2.0], h.toArray(), h.toArray(), ease(k), 46); },
  kid_cry(t, d, k) { atticKid(t, true, 0.5, true); kid.expr = 'cry'; const h = headPos(kid); cam([h.x - 0.4, h.y + 0.3, h.z - 2.3], [h.x - 0.3, h.y + 0.3, h.z - 1.9], h.toArray(), h.toArray(), ease(k), 44); },
  dad_sleep_close(t, d, k) { livingNight(t); const h = headPos(dad); cam([h.x + 0.9, h.y - 0.2, h.z + 2.2], [h.x + 0.7, h.y - 0.1, h.z + 1.8], h.toArray(), h.toArray(), ease(k), 44); },
  locks_slow(t, d, k) { livingNight(t); cam([6.6, 2.6, -4.4], [6.4, 3.6, -4.6], [5.2, 2.6, -6.7], [5.2, 3.4, -6.7], ease(k), 40); },
  dad_wide_lonely(t, d, k) { livingNight(t); cam([-1.5, 4.5, 6.5], [-2.5, 5.2, 8.0], [4.3, 1.4, -4.8], [4.3, 1.6, -4.8], ease(k), 50); },
  kid_sits(t, d, k) {
    livingNight(t);
    const sitK = ease(clamp01(k * 1.6));
    kid.place(lerp(2.4, 2.75, sitK), lerp(0, -0.72, sitK), -4.3, 0.15); kid.expr = 'sad'; kid.pose({ sit: sitK > 0.5, t, headZ: -0.25 * sitK, bodyZ: -0.08 * sitK });
    cam([0.8, 2.4, 1.6], [1.2, 2.2, 0.6], [3.6, 1.2, -4.6], [3.6, 1.2, -4.6], ease(k), 48);
  },
  both_sleep(t, d, k) {
    livingNight(t);
    kid.place(2.75, -0.72, -4.3, 0.15); kid.expr = 'sleep'; kid.pose({ sit: true, t, headZ: -0.3, bodyZ: -0.1 });
    cam([3.2, 2.3, -0.4], [2.2, 3.2, 1.6], [3.8, 1.3, -4.7], [3.8, 1.5, -4.7], ease(k), 48);
  },
  morning_wake(t, d, k) {
    show('living', 'day'); chair.visible = true;
    dad.place(3.4, 0, -3.2, -2.3); dad.expr = 'smile'; dad.pose({ t, armR: [-1.2, 0, -0.1], headX: 0.25 });
    kid.place(2.75, -0.72, -4.3, 0.15); kid.expr = k > 0.4 ? 'smile' : 'sleep'; kid.pose({ sit: true, t, headX: -0.3 * clamp01(k * 2) });
    cam([0.0, 2.6, 1.8], [0.6, 2.4, 0.8], [3.0, 1.6, -3.9], [3.0, 1.6, -3.9], ease(k), 48);
    keyAtHand(1);
  },
  key_hand(t, d, k) {
    show('living', 'day'); chair.visible = true;
    dad.place(3.4, 0, -3.2, -2.3); dad.expr = 'smile'; dad.pose({ t, armR: [-1.35, 0, -0.1] });
    kid.place(2.75, -0.72, -4.3, 0.15); kid.expr = 'happy'; kid.pose({ sit: true, t, headX: -0.35, armL: [-1.6 * ease(k * 2), 0, -0.2] });
    const p = keyAtHand(1);
    sparkles.userData.set(p, clamp01((k - 0.6) * 2.5), 0.4);
    cam([p.x + 1.3, p.y + 0.5, p.z + 0.9], [p.x + 1.0, p.y + 0.4, p.z + 0.7], p.toArray(), p.toArray(), ease(k), 44);
  },
  house_morning(t, d, k) {
    show('town', 'golden');
    dad.place(-9.6, 0, 3.0, Math.PI / 2 + 0.4); dad.expr = 'smile'; dad.pose({ t, headY: 0.4 });
    kid.place(-10.3, 0, 2.6, -Math.PI / 2); kid.expr = 'happy'; kid.pose({ t, armR: [-1.5, 0, 0.1] });
    cam([-5.0, 2.2, 7.5], [-5.6, 2.3, 6.4], [-10.6, 1.6, 2.4], [-10.6, 1.7, 2.4], ease(k), 48);
  },
  end_pull(t, d, k) {
    show('town', 'golden');
    dad.place(-9.6, 0, 3.0, Math.PI / 2 + 0.4); dad.expr = 'smile'; dad.pose({ t });
    kid.place(-9.9, 0, 4.2, Math.PI / 2); kid.expr = 'happy'; kid.pose({ t, headY: -0.4 });
    cam([-4.5, 3.0, 9.0], [6, 18, 30], [-10.2, 1.8, 2.8], [-6, 2, -8], ease(k), 50);
  },
};
function livingNight(t) {
  show('living', 'night'); chair.visible = true;
  dad.place(4.5, 0.12, -5.0, 0); dad.expr = 'sleep'; dad.pose({ sit: true, t, headZ: 0.25, headX: 0.15, armL: [-0.6, 0, 0.15], armR: [-0.6, 0, -0.15] });
}
function atticKid(t, holding, lift = 0, lower = false) {
  show('attic', 'night');
  kid.place(0.2, 0, -0.2, Math.PI); kid.o.look = 0;
  kid.pose({ t, headX: 0.25, armL: holding ? [-1.25 * lift, 0, 0.35] : [-0.4, 0, 0.1], armR: holding ? [-1.25 * lift, 0, -0.35] : [-0.4, 0, -0.1] });
  if (holding) {
    const a = handPos(kid, 0), b = handPos(kid, 1); const c = a.add(b).multiplyScalar(0.5);
    paper.position.set(c.x, c.y + (lower ? 0.15 : 0.45), c.z - 0.12); paper.rotation.set(-0.25, Math.PI, 0); paper.visible = true;
  }
}
function keyAtHand(i) { const p = handPos(dad, i); keyProp.position.set(p.x, p.y - 0.1, p.z); keyProp.rotation.set(0, -2.3, 0); keyProp.visible = true; return keyProp.position.clone(); }

E.run({ timings: T, shots: S, captionStyle: 'lime' });
