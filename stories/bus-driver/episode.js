// Episode: "In this town, the school bus never leaves until every kid is on." (real-life story)
import * as E from '../engine/engine.js';
const { THREE, cam, ease, clamp01, lerp, show, makeChar, handPos, headPos, face, effects, sparkles, box, cyl, mat, canvasTex, signTex } = E;

const T = await (await fetch('build/timings.json')).json();

// ---------- cast ----------
const leo = makeChar({ shirt: '#ff7a1c', pants: '#2b4a86', hairType: 'kid', hair: '#2e1d12', hood: true });
const sis = makeChar({ shirt: '#f48fb1', pants: '#7e57c2', hairType: 'bob', hair: '#2e1d12' }); sis.root.scale.setScalar(0.72);
const earl = makeChar({ shirt: '#1e4f8a', pants: '#2b2b33', shoes: '#111', hairType: 'police', cap: '#1e4f8a', mustache: '#9e9e9e', stripe: '#f9a825' });
const mom = makeChar({ shirt: '#4db6ac', pants: '#4db6ac', hairType: 'mom', hair: '#3b2618' });
const teacher = makeChar({ shirt: '#ffca28', pants: '#5d4037', hairType: 'long', hair: '#8a4b2a', glasses: true });
const kids = E.makeExtras(10, 33);

// ---------- props ----------
const pinkBox = () => { const g = new THREE.Group(); box(0.5, 0.34, 0.26, mat('#f48fb1'), 0, 0, 0, g); box(0.52, 0.06, 0.28, mat('#ec407a'), 0, 0.17, 0, g); const h = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 6, 12, Math.PI), mat('#ec407a')); h.position.y = 0.2; g.add(h); const st = new THREE.Mesh(new THREE.CircleGeometry(0.07, 5), mat('#fff59d')); st.position.set(0, 0, 0.135); g.add(st); return g; };
const handBox = E.prop(pinkBox()); E.scene.add(handBox);

// school bus model (front faces +z, door on the right side)
function makeBus() {
  const g = new THREE.Group();
  const y = mat('#f9a825'), blk = mat('#222'), gl = mat('#cfe9ff', { emissive: '#bfe3ff', emissiveIntensity: 0.35, roughness: 0.15 });
  box(2.8, 2.6, 11.4, y, 0, 2.05, -0.2, g); box(2.6, 1.3, 1.5, y, 0, 1.35, 6.2, g); box(2.82, 0.14, 11.4, blk, 0, 1.25, -0.2, g);
  for (const s of [-1, 1]) for (let z = -5; z <= 3.5; z += 1.25) { if (s > 0 && z > 3) continue; box(0.06, 0.8, 1.0, gl, s * 1.41, 2.65, z, g, false); }
  box(2.4, 1.0, 0.06, gl, 0, 2.7, 5.31, g, false);
  const door = box(0.08, 2.1, 1.0, mat('#cfe9ff', { emissive: '#bfe3ff', emissiveIntensity: 0.25, transparent: true, opacity: 0.7 }), 1.43, 1.75, 4.6, g, false); g.userData.door = door;
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.45), mat('#fff', { map: signTex('SCHOOL BUS', { w: 1024, h: 210, bg: '#f9a825', fg: '#111', font: '800 150px Cap' }) })); sg.position.set(0, 3.15, 5.32); g.add(sg);
  const sg2 = sg.clone(); sg2.position.set(0, 3.15, -5.92); sg2.rotation.y = Math.PI; g.add(sg2);
  const stop = new THREE.Mesh(new THREE.CircleGeometry(0.42, 8), mat('#fff', { map: signTex('STOP', { w: 256, h: 256, bg: '#d32f2f', fg: '#fff', font: '800 90px Cap' }) })); stop.position.set(-1.5, 2.1, 4.2); stop.rotation.y = -Math.PI / 2; g.add(stop);
  for (const [x, z] of [[-1.3, 4.2], [1.3, 4.2], [-1.3, -3.8], [1.3, -3.8]]) { const w = cyl(0.6, 0.6, 0.4, mat('#1d1d22'), x, 0.6, z, g, 16); w.rotation.z = Math.PI / 2; }
  for (const x of [-0.95, 0.95]) box(0.4, 0.3, 0.06, mat('#fff8d0', { emissive: '#fff3b0', emissiveIntensity: 1 }), x, 1.4, 6.96, g, false);
  for (const x of [-1.1, 1.1]) box(0.3, 0.3, 0.06, mat('#ff6d00', { emissive: '#ff6d00', emissiveIntensity: 1.2 }), x, 3.25, 5.33, g, false);
  return g;
}
const bus = E.prop(makeBus()); E.scene.add(bus);
const BUS = new THREE.Vector3(2.4, 0, 0);
function busAt(z = 0, x = 2.4) { bus.position.set(x, 0, z); bus.rotation.set(0, 0, 0); bus.visible = true; }

// ---------- sets ----------
const town = E.buildTown('town', { seed: 12 });
const rain = E.prop(E.rainCloud({ size: 3, dark: true, drops: 520, width: 1.8, fall: 4.6 }));
// bus interior
const busin = new THREE.Group(); busin.userData.indoor = true; busin.userData.setNight = () => {};
{
  box(3.0, 0.1, 13, mat('#78909c'), 0, -0.05, 0, busin, false); box(0.8, 0.02, 12, mat('#455a64'), 0, 0.01, -0.5, busin, false);
  const wallM = mat('#f6e7b4'), win = mat('#dff1ff', { emissive: '#d6ecff', emissiveIntensity: 1.3 });
  for (const s of [-1, 1]) { box(0.1, 1.3, 13, wallM, s * 1.5, 0.65, 0, busin, false); box(0.1, 0.5, 13, wallM, s * 1.5, 2.65, 0, busin, false); for (let z = -6; z <= 5.5; z += 1.25) { box(0.08, 0.9, 1.0, win, s * 1.47, 1.8, z, busin, false); box(0.1, 0.9, 0.22, wallM, s * 1.5, 1.8, z + 0.62, busin, false); } }
  box(3.0, 0.1, 13, mat('#f5f5f5'), 0, 2.95, 0, busin, false);
  for (let z = -5.5; z <= 3; z += 1.3) for (const s of [-1, 1]) { box(1.1, 0.42, 0.6, mat('#2e7d5b'), s * 0.86, 0.5, z, busin); box(1.1, 0.75, 0.14, mat('#2e7d5b'), s * 0.86, 1.05, z - 0.32, busin); }
  box(0.7, 0.45, 0.6, mat('#455a64'), -0.75, 0.55, 4.9, busin); box(0.7, 0.8, 0.14, mat('#455a64'), -0.75, 1.1, 4.55, busin); // driver seat
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 8, 20), mat('#222')); wheel.position.set(-0.75, 1.45, 5.55); wheel.rotation.x = -0.9; busin.add(wheel);
  box(2.9, 0.6, 0.7, mat('#37474f'), 0, 1.2, 6.1, busin); box(2.8, 1.2, 0.06, mat('#dff1ff', { emissive: '#d6ecff', emissiveIntensity: 1.4 }), 0, 2.15, 6.45, busin, false);
  const pb = pinkBox(); pb.position.set(0.55, 1.68, 6.05); busin.add(pb); busin.userData.pink = pb;
  const letter = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), mat('#fff', { map: canvasTex(300, 400, (g) => { g.fillStyle = '#fbfaf4'; g.fillRect(0, 0, 300, 400); g.fillStyle = '#1a237e'; g.font = '800 26px Cap'; g.fillText('CITY NIGHT', 20, 44); g.fillText('CLEANING CO.', 20, 74); g.fillStyle = '#c62828'; g.font = '800 40px Cap'; g.fillText('WARNING', 20, 140); g.fillStyle = '#333'; g.font = '600 22px Cap'; ['Employee: Earl B.', 'Late arrival #6', 'this month.', 'Next time =', 'FINAL warning.'].forEach((l, i) => g.fillText(l, 20, 190 + i * 34)); }), emissive: '#fff', emissiveIntensity: 0.25 }));
  letter.rotation.x = -Math.PI / 2; letter.position.set(-0.7, 0.79, 4.9); letter.rotation.z = 0.3; busin.add(letter); busin.userData.letter = letter;
  const door = box(0.08, 2.2, 1.0, mat('#cfe9ff', { emissive: '#bfe3ff', emissiveIntensity: 0.8, transparent: true, opacity: 0.6 }), 1.46, 1.2, 4.9, busin, false); busin.userData.door = door;
  for (const z of [-3, 2]) { const l = new THREE.PointLight('#fff6e0', 1.4, 10, 0); l.position.set(0, 2.6, z); busin.add(l); }
}
E.addSet('busin', busin);
const SEATS = []; for (let z = -5.5; z <= 3; z += 1.3) for (const s of [-1, 1]) SEATS.push([s * 0.86, z]);
// home + sister's room
const home = E.buildRoom('home', { kind: 'living', wallA: '#e3d5c3', wallB: '#d9cab6', curtain: '#90a4ae', sofa: '#8d6e63', windowX: -4, lampX: 5 });
{ box(2.6, 0.12, 1.6, mat('#bcaaa4'), 3.5, 1.35, 2.2, home); for (const x of [2.5, 4.5]) box(0.12, 1.35, 0.12, mat('#6d4c41'), x, 0.67, 2.2, home);
  cyl(0.2, 0.14, 0.14, mat('#ffffff'), 3.0, 1.48, 2.2, home, 14); box(0.35, 0.5, 0.15, mat('#ffb300'), 3.8, 1.66, 2.0, home); box(0.14, 0.32, 0.14, mat('#fafafa'), 4.2, 1.57, 2.4, home);
  box(1.6, 3.6, 0.2, mat('#795548'), 7.0, 1.8, 3.0, home).rotation.y = Math.PI / 2; }
const sisroom = E.buildRoom('sisroom', { kind: 'bedroom', wallA: '#f8d7e6', wallB: '#f3c9dc', curtain: '#ce93d8', blanket: '#f48fb1', windowX: -3.5 });
box(2.36, 0.25, 1.6, mat('#f48fb1'), 1.5, 1.42, -3.4, sisroom);
// daycare
const daycare = new THREE.Group();
{ const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat('#7cc95a')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; daycare.add(ground);
  box(400, 0.18, 4, mat('#e0dbd2'), 0, 0.09, 5, daycare, false); box(400, 0.05, 8, mat('#4a5266'), 0, 0.025, 11, daycare, false);
  box(14, 5, 7, mat('#fff3e0'), 0, 2.5, -3, daycare); const roof = box(15, 0.4, 8, mat('#ef5350'), 0, 5.2, -3, daycare);
  box(2.0, 3.0, 0.2, mat('#42a5f5'), 0, 1.5, 0.55, daycare);
  for (const x of [-4.5, 4.5]) { box(2.4, 1.8, 0.2, mat('#fff'), x, 2.4, 0.55, daycare, false); box(2.1, 1.5, 0.22, E.glassMat, x, 2.4, 0.57, daycare, false); }
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.2), mat('#fff', { map: signTex('★ LITTLE STARS DAYCARE ★', { w: 1400, h: 210, bg: '#7e57c2', fg: '#fff59d', font: '800 100px Cap' }) })); sg.position.set(0, 4.3, 0.62); daycare.add(sg);
  const sl = new THREE.Group(); sl.position.set(9, 0, 1.5); daycare.add(sl); box(0.15, 2.2, 0.15, mat('#1e88e5'), -0.5, 1.1, 0, sl); box(0.15, 2.2, 0.15, mat('#1e88e5'), 0.5, 1.1, 0, sl); const ramp = box(1.0, 0.1, 3.2, mat('#fdd835'), 0, 1.1, 1.4, sl); ramp.rotation.x = 0.6;
  E.roundTree(daycare, -11, 2, 1.2); }
E.addSet('daycare', daycare);

// ---------- helpers ----------
function seatedKids(t, expr = 'smile', look = null, n = 10) { kids.slice(0, n).forEach((c, i) => { const [x, z] = SEATS[(i * 3 + 1) % 10]; c.place(x, 0.05, z, 0); c.expr = typeof expr === 'function' ? expr(i) : expr; c.pose({ sit: true, t, headY: look ? face([x, 0, z], look) : Math.sin(t + i) * 0.2, headX: look ? -0.05 : 0 }); }); }
function earlSeated(t) { earl.place(-0.75, 0.15, 4.9, 0); earl.pose({ sit: true, t, armL: [-1.3, 0, 0.1], armR: [-1.3, 0, -0.1] }); }
const S = {
  bus_stop_wide(t, d, k) { show('town', 'day'); busAt(); kids.slice(0, 4).forEach((c, i) => { c.place(5.0 - i * 0.2, 0.18, 1.6 + i * 1.2 - k * 2, Math.PI); c.expr = 'smile'; c.pose({ walk: t * 6 + i, amp: 0.4, t }); }); cam([-3, 5.5, 18], [-2, 4.5, 14], [2.4, 1.8, 0], [2.4, 1.8, 0], ease(k), 52); },
  earl_watch(t, d, k) { show('town', 'day'); busAt(); earl.place(4.7, 0.18, 4.6, Math.PI); earl.expr = 'determined'; earl.pose({ t, armL: [-1.6, 0, 0.5], headX: 0.35 }); const h = headPos(earl); cam([h.x + 1.6, h.y - 0.2, h.z - 2.4], [h.x + 1.2, h.y - 0.1, h.z - 2.0], [h.x, h.y - 0.4, h.z], [h.x, h.y - 0.3, h.z], ease(k), 46); },
  rain_wait(t, d, k) { show('town', 'rainy'); busAt(); rain.position.set(3, 13, 0); rain.visible = true; earl.place(4.6, 0.18, 4.6, Math.PI); earl.expr = 'smile'; earl.pose({ t }); cam([7.5, 2.2, 10], [7.2, 2.2, 9], [3.0, 2.2, 1], [3.0, 2.2, 1], ease(k), 50); },
  kids_groan(t, d, k) { show('busin', 'day'); seatedKids(t, (i) => (i % 2 ? 'angry' : 'sad'), [1.4, 0, 4.9]); cam([0, 2.75, 5.4], [0, 2.7, 5.0], [0, 1.1, -3], [0, 1.1, -3], ease(k), 58); },
  kid_running(t, d, k) { show('town', 'day'); busAt(); const z = lerp(-22, -12, k); leo.place(5.4, 0.18, z, 0); leo.expr = 'worried'; leo.pose({ walk: t * 13, amp: 0.95, t, lean: 0.12 }); cam([2.0, 1.8, z + 5.5], [2.2, 1.8, z + 5.5], [5.4, 1.6, z], [5.4, 1.6, z], 0, 52); },
  bus_tease(t, d, k) { show('busin', 'day'); const lz = lerp(3.0, 0.6, k); seatedKids(t, 'laugh', [0, 0, lz]); leo.place(0, 0.05, lz, Math.PI); leo.expr = 'sad'; leo.pose({ walk: t * 5, amp: 0.3, t, headX: 0.25 }); cam([0.5, 2.75, 5.4], [0.5, 2.7, 5.0], [0, 1.2, -3], [0, 1.2, -3], ease(k), 58); },
  earl_nod(t, d, k) { show('busin', 'day'); earlSeated(t); earl.expr = 'smile'; earl.pose({ sit: true, t, armL: [-1.3, 0, 0.1], armR: [-1.3, 0, -0.1], headX: Math.max(0, Math.sin(t * 5)) * 0.25, headY: 0.7 }); const h = headPos(earl); cam([h.x + 1.3, h.y - 0.1, h.z + 0.9], [h.x + 1.1, h.y - 0.05, h.z + 0.7], h.toArray(), h.toArray(), ease(k), 50); },
  door_close(t, d, k) { show('busin', 'day'); earlSeated(t); earl.expr = 'smile'; const dr = busin.userData.door; dr.position.z = lerp(5.9, 4.9, ease(k)); cam([0.2, 1.8, 2.2], [0.3, 1.8, 2.6], [1.45, 1.3, 4.9], [1.45, 1.3, 4.9], ease(k), 54); },
  kid_window(t, d, k) { show('busin', 'day'); earlSeated(t); earl.expr = 'smile'; const [x, z] = SEATS[11]; leo.place(x, 0.05, z, 0); leo.expr = 'worried'; leo.pose({ sit: true, t, headY: -0.3 }); const h = headPos(leo); cam([h.x - 0.6, h.y + 0.45, h.z - 1.4], [h.x - 0.55, h.y + 0.4, h.z - 1.2], [h.x - 0.8, h.y - 0.4, h.z + 4.5], [h.x - 0.9, h.y - 0.4, h.z + 5], ease(k), 54); },
  pink_lunchbox(t, d, k) { show('busin', 'day'); const p = busin.userData.pink.position; cam([p.x - 0.6, p.y + 0.4, p.z - 1.3], [p.x - 0.4, p.y + 0.3, p.z - 0.95], p.toArray(), p.toArray(), ease(k), 44); },
  warning_letter(t, d, k) { show('busin', 'day'); const p = busin.userData.letter.position; cam([p.x + 0.2, p.y + 1.0, p.z - 0.4], [p.x + 0.1, p.y + 0.75, p.z - 0.25], p.toArray(), p.toArray(), ease(k), 44); },
  daycare_lunch(t, d, k) { show('daycare', 'day'); teacher.place(-0.6, 0.0, 1.4, 0.2); teacher.expr = 'smile'; teacher.pose({ t, armR: [-1.2, 0, -0.1] }); const p = handPos(teacher, 1); handBox.position.set(p.x, p.y + 0.15, p.z + 0.25); handBox.visible = true; sis.place(0.8, 0, 2.6, Math.PI - 0.5); sis.expr = 'happy'; sis.pose({ t, jump: t * 6, armL: [-2.6, 0, 0.3] }); cam([3.2, 2.0, 7.5], [2.8, 1.9, 6.6], [0.1, 1.6, 1.8], [0.1, 1.6, 1.8], ease(k), 50); },
  kid_sad(t, d, k) { show('busin', 'day'); const [x, z] = SEATS[11]; leo.place(x, 0.05, z, 0); leo.expr = 'sad'; leo.pose({ sit: true, t, headY: 0.5, headX: 0.15 }); const h = headPos(leo); cam([h.x - 0.3, h.y + 0.05, h.z + 1.8], [h.x - 0.25, h.y + 0.05, h.z + 1.5], h.toArray(), h.toArray(), ease(k), 48); },
  mom_asleep(t, d, k) { show('home', 'night'); mom.place(-0.95, 0.12, -4.0, 0.2); mom.expr = 'sleep'; mom.pose({ sit: true, t, headZ: 0.35, headX: 0.2 }); leo.place(1.6, 0, -1.2, -2.8); leo.expr = 'sad'; leo.pose({ t, armR: [-0.2, 0, 0] }); cam([-3.0, 3.0, 3.0], [-2.4, 2.8, 2.2], [0.1, 1.6, -3.5], [0.1, 1.6, -3.5], ease(k), 50); },
  sister_wake(t, d, k) { show('sisroom', 'night'); const up = ease(clamp01((k - 0.4) * 2.5)); sis.place(1.5, 1.21, -3.57, 0, -Math.PI / 2 * (1 - up * 0.35)); sis.expr = up > 0.3 ? 'happy' : 'sleep'; sis.pose({ t }); leo.place(-0.2, 0, -4.2, Math.PI / 2); leo.expr = 'smile'; leo.pose({ t, armR: [-1.4 + Math.sin(t * 8) * 0.15, 0, 0], lean: 0.15 }); cam([3.8, 3.4, -1.2], [3.5, 3.2, -1.7], [1.3, 1.3, -4.4], [1.3, 1.3, -4.4], ease(k), 50); },
  breakfast(t, d, k) { show('home', 'day'); sis.place(3.5, 0.05, 3.5, Math.PI); sis.expr = 'happy'; sis.pose({ t, armR: [-1.2, 0, 0] }); leo.place(3.5, 0, 0.8, 0); leo.expr = 'smile'; leo.pose({ t, armR: [-1.4 + Math.sin(t * 4) * 0.2, 0, 0.2] }); cam([0.4, 2.6, 4.6], [0.8, 2.5, 4.0], [3.5, 1.5, 2.2], [3.5, 1.5, 2.2], ease(k), 50); },
  shoes(t, d, k) { show('home', 'day'); sis.place(6.0, 0, 2.2, -Math.PI / 2); sis.expr = 'smile'; sis.pose({ t }); leo.place(4.3, -0.62, 2.2, Math.PI / 2); leo.expr = 'determined'; leo.pose({ sit: true, t, lean: 0.35, armL: [-1.3 + Math.sin(t * 9) * 0.12, 0, 0.2], armR: [-1.3 - Math.sin(t * 9) * 0.12, 0, -0.2], headX: 0.35 }); cam([6.6, 3.6, 7.2], [6.4, 3.4, 6.7], [5.2, 0.9, 2.2], [5.2, 0.9, 2.2], ease(k), 50); },
  walk_daycare(t, d, k) { show('daycare', 'golden'); const x = lerp(-9, -2, k); leo.place(x, 0.18, 5.0, Math.PI / 2); leo.expr = 'smile'; leo.pose({ walk: t * 6, amp: 0.4, t, armR: [-0.4, 0, 0.4] }); sis.place(x + 0.2, 0.18, 5.9, Math.PI / 2); sis.expr = 'happy'; sis.pose({ walk: t * 8, amp: 0.5, t, armL: [-0.5, 0, -0.4] }); cam([x + 4, 1.8, 11], [x + 4, 1.8, 10.6], [x, 1.4, 5.4], [x, 1.4, 5.4], 0, 50); },
  run_street(t, d, k) { show('town', 'golden'); const z = lerp(-60, -45, k); leo.place(5.4, 0.18, z, 0); leo.expr = 'determined'; leo.pose({ walk: t * 14, amp: 1.0, t, lean: 0.15 }); cam([3.0, 2.0, z + 4.5], [3.0, 2.0, z + 4.5], [5.4, 1.8, z], [5.4, 1.8, z], 0, 52); },
  kid_panic(t, d, k) { show('town', 'day'); leo.place(5.4, 0.18, -16, 0); leo.expr = 'shock'; leo.pose({ t, armL: [-2.6, 0, 0.6], armR: [-2.6, 0, -0.6] }); const h = headPos(leo); cam([h.x - 1.6, h.y - 0.2, h.z + 2.6], [h.x - 1.2, h.y - 0.1, h.z + 2.1], h.toArray(), h.toArray(), ease(k), 46); },
  bus_still_there(t, d, k) { show('town', 'day'); busAt(); earl.place(4.7, 0.18, 4.4, Math.PI); earl.expr = 'smile'; earl.pose({ t }); leo.place(5.4, 0.18, lerp(-14, -10, k), 0); leo.expr = 'shock'; leo.pose({ walk: t * 4, amp: 0.2, t }); cam([4.6, 1.4, -18], [4.8, 1.5, -16.5], [3.4, 2.0, 2], [3.4, 2.0, 2], ease(k), 52); },
  earl_lunchbox(t, d, k) { show('town', 'day'); busAt(); earl.place(5.0, 0.18, 2.0, Math.PI); earl.expr = 'smile'; earl.pose({ t, armR: [-1.3, 0, 0.1] }); const p = handPos(earl, 1); handBox.position.set(p.x, p.y + 0.15, p.z - 0.25); handBox.rotation.set(0, Math.PI, 0); handBox.visible = true; leo.place(5.3, 0.18, -0.6, 0); leo.expr = 'shock'; leo.pose({ t }); cam([10.0, 2.6, 0.8], [9.7, 2.6, 0.8], [5.1, 1.9, 0.7], [5.1, 1.9, 0.7], ease(k), 54); },
  lunchbox_close(t, d, k) { show('town', 'day'); busAt(); earl.place(5.0, 0.18, 2.0, Math.PI); earl.expr = 'smile'; earl.pose({ t, armR: [-1.3, 0, 0.1] }); const p = handPos(earl, 1); handBox.position.set(p.x, p.y + 0.15, p.z - 0.25); handBox.rotation.set(0, Math.PI, 0); handBox.visible = true; const b = handBox.position; cam([b.x + 1.0, b.y + 0.5, b.z - 1.9], [b.x + 0.8, b.y + 0.4, b.z - 1.6], b.toArray(), b.toArray(), ease(k), 44); },
  earl_smile(t, d, k) { show('town', 'day'); busAt(); earl.place(5.0, 0.18, 2.0, Math.PI); earl.say(t, 'talk', 'smile'); earl.pose({ t, armR: [-0.6, 0, 0.1], headX: 0.15 }); const h = headPos(earl); cam([h.x - 0.5, h.y - 0.15, h.z - 2.4], [h.x - 0.4, h.y - 0.1, h.z - 2.0], h.toArray(), h.toArray(), ease(k), 44); },
  bus_quiet(t, d, k) { show('busin', 'day'); seatedKids(t, (i) => (i === 3 ? 'smile' : 'sad'), [0, 0, 3]); const [x, z] = SEATS[11]; leo.place(lerp(0, x, ease(k)), 0.05, z, 0); leo.expr = 'smile'; leo.pose({ sit: k > 0.6, t }); cam([0, 2.75, 5.4], [0, 2.7, 5.0], [0, 1.1, -2], [0, 1.1, -2], ease(k), 58); },
  end_pull(t, d, k) { show('town', 'golden'); busAt(lerp(0, 22, ease(k))); kids.slice(0, 2).forEach((c) => c.hide()); cam([-2, 3, -8], [-10, 20, -24], [2.4, 2, lerp(0, 22, ease(k))], [2.4, 1, 20], ease(k), 52); },
};
const wrapped = Object.fromEntries(Object.entries(S).map(([n, f]) => [n, (...a) => { handBox.rotation.set(0, 0, 0); busin.userData.door.position.z = 4.9; f(...a); }]));
E.run({ timings: T, shots: wrapped, captionStyle: 'lime' });
