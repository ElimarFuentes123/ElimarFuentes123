// Episode: "In this school, no kid has ever owed lunch money." (real-life story)
import * as E from '../engine/engine.js';
const { THREE, cam, ease, clamp01, lerp, show, makeChar, handPos, headPos, face, effects, sparkles, box, cyl, mat, canvasTex, signTex } = E;

const T = await (await fetch('build/timings.json')).json();

// ---------- cast ----------
const kid = makeChar({ shirt: '#ff7a1c', pants: '#2b4a86', hairType: 'kid', hair: '#2e1d12', hood: true });
const rosa = makeChar({ shirt: '#f5f5f5', pants: '#5d4a3a', shoes: '#6d4c41', hairType: 'beanie', cap: '#eceff1', glasses: true, vest: '#e57373', stripe: '#e57373' });
const mom = makeChar({ shirt: '#5c8dd6', pants: '#2f3b52', hairType: 'mom', hair: '#3b2618' });
const kids = E.makeExtras(10, 81);
const adults = E.makeExtras(16, 91);
// holes in Rosa's shoes
for (const leg of rosa.legs) { box(0.16, 0.1, 0.02, mat('#f2e6d0'), 0.08, -0.9, 0.325, leg, false); box(0.1, 0.07, 0.02, mat('#f2e6d0'), -0.12, -0.95, 0.325, leg, false); }

// ---------- cafeteria ----------
const caf = new THREE.Group(); caf.userData.indoor = true;
const tile = canvasTex(128, 128, (g) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.fillStyle = (x + y) % 2 ? '#e8e2d4' : '#b9c7d8'; g.fillRect(x * 64, y * 64, 64, 64); } }, [12, 12]);
const regCanvas = document.createElement('canvas'); regCanvas.width = 512; regCanvas.height = 256;
const regTex = new THREE.CanvasTexture(regCanvas); regTex.colorSpace = THREE.SRGBColorSpace;
function setRegister(name, amount = '$0.00') {
  const g = regCanvas.getContext('2d'); g.fillStyle = '#0b2b1a'; g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#7dffb0'; g.font = '700 40px Cap'; g.textAlign = 'center'; g.fillText(name, 256, 80);
  g.font = '700 34px Cap'; g.fillText('BALANCE', 256, 135); g.font = '800 80px Cap'; g.fillText(amount, 256, 220); regTex.needsUpdate = true;
}
setRegister('STUDENT');
const cafLights = [];
{
  box(24, 0.2, 24, mat('#fff', { map: tile, roughness: 0.5 }), 0, -0.1, 0, caf, false);
  const wm = mat('#fff', { map: E.wallTex('#fff4dc', '#fbeccb') });
  box(24, 8, 0.3, wm, 0, 4, -9, caf, false); box(0.3, 8, 24, wm, -12, 4, 0, caf, false); box(0.3, 8, 24, wm, 12, 4, 0, caf, false);
  for (const x of [-8, 8]) { box(3.4, 3, 0.2, mat('#ffffff'), x, 4.6, -8.8, caf, false); box(3.0, 2.6, 0.22, mat('#dff1ff', { emissive: '#cfe9ff', emissiveIntensity: 1.2 }), x, 4.6, -8.78, caf, false); }
  // serving counter + sneeze guard + food
  box(11, 1.3, 1.3, mat('#b0bec5', { metalness: 0.4, roughness: 0.4 }), -1, 0.65, -5.6, caf);
  box(11, 0.06, 0.8, new THREE.MeshStandardMaterial({ color: '#cfe8f5', transparent: true, opacity: 0.4 }), -1, 2.1, -5.6, caf, false);
  ['#f4d03f', '#e67e22', '#27ae60', '#c0392b', '#f5f5dc', '#8d6e63'].forEach((c, i) => box(1.3, 0.12, 0.8, mat(c), -5.5 + i * 1.7, 1.36, -5.7, caf, false));
  box(1.2, 0.9, 1.0, mat('#455a64'), 5.4, 1.75, -5.6, caf); const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), new THREE.MeshBasicMaterial({ map: regTex })); scr.position.set(5.4, 2.0, -5.08); caf.add(scr); caf.userData.screen = scr;
  box(1.4, 1.3, 1.3, mat('#78909c'), 5.4, 0.65, -5.6, caf);
  const menu = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.6), mat('#fff', { map: signTex('TODAY: PIZZA · SOUP · FRUIT', { w: 1024, h: 330, bg: '#2f5d3a', fg: '#ffffff', font: '800 70px Cap', border: '#8b5a2b' }) })); menu.position.set(-1, 5.8, -8.8); caf.add(menu);
  // tables + benches
  caf.userData.seats = [];
  for (const z of [0, 4]) for (const x0 of [-6, 2]) {
    box(6.5, 0.12, 1.4, mat('#e0b97a'), x0, 1.3, z, caf); box(0.15, 1.3, 0.15, mat('#555'), x0 - 2.8, 0.65, z, caf); box(0.15, 1.3, 0.15, mat('#555'), x0 + 2.8, 0.65, z, caf);
    for (const s of [-1, 1]) { box(6.5, 0.1, 0.5, mat('#90a4ae'), x0, 0.8, z + s * 1.15, caf); for (const dx of [-2, 0, 2]) caf.userData.seats.push([x0 + dx, z + s * 1.15, s]); }
  }
  // retirement banner (only on her last day)
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.3), mat('#fff', { map: signTex('HAPPY RETIREMENT, MISS ROSA!', { w: 1400, h: 200, bg: '#ff7043', fg: '#ffffff', font: '800 96px Cap' }) })); banner.position.set(-1, 7.0, -8.8); caf.add(banner); caf.userData.banner = banner;
  for (const [x, z] of [[-6, -2], [6, -2], [-6, 5], [6, 5]]) { const l = new THREE.PointLight('#fff6e8', 1.6, 18, 0); l.position.set(x, 7.2, z); caf.add(l); cafLights.push(l); }
  const sp = new THREE.SpotLight('#fff2dc', 1.6, 40, 0.9, 0.6, 0); sp.position.set(0, 10, 6); sp.target.position.set(0, 0, -2); sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); caf.add(sp, sp.target); cafLights.push(sp);
  const desk = new THREE.PointLight('#ffcf8a', 0, 8, 0); desk.position.set(5.0, 3.2, -4.2); caf.add(desk); caf.userData.desk = desk;
  caf.userData.setNight = (night) => { cafLights.forEach((l) => (l.intensity = night ? 0.15 : l.isSpotLight ? 1.6 : 1.6)); desk.intensity = night ? 2.4 : 0; };
}
E.addSet('cafeteria', caf);

// ---------- home (tired mom, empty fridge) ----------
const home = E.buildRoom('home', { kind: 'living', wallA: '#d8cfc0', wallB: '#cfc5b4', curtain: '#8d6e63', sofa: '#6d7f99', windowX: -4, lampX: 4.5 });
{ const fr = new THREE.Group(); fr.position.set(6.5, 0, -5.6); home.add(fr); home.userData.fridge = fr;
  box(1.8, 4.0, 1.4, mat('#eceff1'), 0, 2.0, 0, fr); box(1.6, 3.8, 0.03, mat('#fffbe6', { emissive: '#fff3c4', emissiveIntensity: 0.9 }), 0, 2.0, 0.72, fr, false);
  for (const y of [1.0, 2.0, 3.0]) box(1.5, 0.05, 0.08, mat('#cfe8f5'), 0, y, 0.76, fr, false);
  box(0.25, 0.4, 0.12, mat('#e53935'), -0.4, 1.25, 0.82, fr); // one lonely ketchup bottle
  const door = box(1.8, 4.0, 0.15, mat('#e0e3e6'), 0, 2.0, 0, null); const hinge = new THREE.Group(); hinge.position.set(-0.9, 0, 0.75); fr.add(hinge); door.position.set(0.9, 2.0, 0); hinge.add(door); hinge.rotation.y = -1.9;
  const fl = new THREE.PointLight('#fff3c4', 1.4, 6, 0); fl.position.set(0, 2, 1.6); fr.add(fl); }

// ---------- rainy street + school entrance ----------
const town = E.buildTown('town', { seed: 3 });
const rainGrey = E.prop(E.rainCloud({ size: 3, dark: true, drops: 520, width: 1.6, fall: 4.6 }));
const umb = E.prop(E.umbrella('#7b1fa2'));
const school = new THREE.Group();
{
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat('#6cbf4f')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; school.add(ground);
  box(400, 0.18, 5, mat('#dcd8d0'), 0, 0.09, 6, school, false); box(400, 0.05, 9, mat('#4a5266'), 0, 0.025, 13, school, false);
  const brick = canvasTex(256, 256, (g) => { const r = E.rng(9); g.fillStyle = '#d9c9b8'; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 8; y++) for (let x = -1; x < 5; x++) { const c = 150 + r() * 40; g.fillStyle = `rgb(${c},${c * 0.36},${c * 0.28})`; g.fillRect(x * 64 + (y % 2) * 32 + 3, y * 32 + 3, 58, 26); } }, [10, 4]);
  box(40, 9, 8, mat('#fff', { map: brick }), 0, 4.5, -2, school);
  for (let x = -16; x <= 16; x += 4) if (Math.abs(x) > 3) for (const y of [2.5, 6.2]) { box(2.2, 2.0, 0.2, mat('#fff'), x, y, 2.05, school, false); box(1.9, 1.7, 0.22, E.glassMat, x, y, 2.07, school, false); }
  box(3.2, 3.6, 0.2, mat('#1565c0'), 0, 1.8, 2.05, school); box(3.4, 0.4, 1.4, mat('#eceff1'), 0, 3.9, 2.6, school);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.3), mat('#fff', { map: signTex('MAPLE ELEMENTARY · CAFETERIA', { w: 1500, h: 216, bg: '#1565c0', fg: '#ffffff', font: '800 100px Cap' }) })); sg.position.set(0, 5.3, 2.1); school.add(sg);
  box(0.15, 7, 0.15, mat('#999'), 8, 3.5, 4.5, school); box(2.2, 1.4, 0.04, mat('#c62828'), 9.1, 6.2, 4.5, school);
  E.roundTree(school, -14, 6.5, 1.2); E.roundTree(school, 15, 6.5, 1.1);
}
E.addSet('school', school);

// ---------- props: notebook, jar, tray, money ----------
const pageTex = (last) => canvasTex(400, 520, (g) => {
  g.fillStyle = '#fbf7ea'; g.fillRect(0, 0, 400, 520); g.strokeStyle = '#a7c4e0'; g.lineWidth = 2; for (let y = 60; y < 520; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(400, y); g.stroke(); }
  g.strokeStyle = '#e57373'; g.beginPath(); g.moveTo(52, 0); g.lineTo(52, 520); g.stroke();
  g.fillStyle = '#1f3a8a'; g.font = 'italic 600 24px serif';
  const names = last ? ['Sofia L.  - $3.25', 'Jayden K. - $3.25', 'Ava P.    - $3.25', 'Noah T.   - $3.25', 'Liam D.   - $3.25'] : ['Marco 2006 - $2.10', 'Tina 2006 - $2.10', 'Ben 2009  - $2.40', 'Grace 2011 - $2.60', 'Omar 2013 - $2.80', 'Kim 2015  - $2.90', 'Luis 2018  - $3.00', 'Ana 2020   - $3.10', 'Rey 2022   - $3.25', 'Mia 2024   - $3.25', 'Eli 2025   - $3.25', 'Zoe 2025   - $3.25'];
  names.forEach((n, i) => g.fillText(n, 62, 52 + i * 34));
  if (last) { g.font = 'italic 800 40px serif'; g.fillStyle = '#c62828'; g.fillText('MATEO R.', 80, 330); g.font = 'italic 600 26px serif'; g.fillText('every day. paid. ♥', 80, 372); g.strokeStyle = '#c62828'; g.lineWidth = 5; g.beginPath(); g.ellipse(190, 340, 150, 56, -0.05, 0, 7); g.stroke(); }
});
const notebook = E.prop(new THREE.Group()); E.scene.add(notebook);
{ const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.8), mat('#fff', { map: pageTex(false), emissive: '#fff', emissiveIntensity: 0.25 })); pl.position.x = -0.32; pl.rotation.y = 0.12; notebook.add(pl);
  const pr = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.8), mat('#fff', { map: pageTex(true), emissive: '#fff', emissiveIntensity: 0.25 })); pr.position.x = 0.32; pr.rotation.y = -0.12; notebook.add(pr); notebook.userData.right = pr;
  box(1.32, 0.86, 0.03, mat('#5d4037'), 0, 0, -0.03, notebook); }
const jar = E.prop(new THREE.Group()); E.scene.add(jar);
const coinIM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12), mat('#f2c230', { metalness: 0.8, roughness: 0.25 }), 240);
const billIM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.01, 0.14), mat('#7cb342'), 80);
{ cyl(0.55, 0.55, 1.4, new THREE.MeshStandardMaterial({ color: '#dff4ff', transparent: true, opacity: 0.35, roughness: 0.05 }), 0, 0.7, 0, jar, 24); jar.add(coinIM, billIM);
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), mat('#fff', { map: signTex('FOR MISS ROSA ♥', { w: 512, h: 190, bg: '#fff8e1', fg: '#c62828', font: '800 64px Cap' }) })); lab.position.set(0, 0.95, 0.56); jar.add(lab); }
function setJar(k) { const r = E.rng(7), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(); const nc = Math.floor(240 * k), nb = Math.floor(80 * k);
  for (let i = 0; i < 240; i++) { const a = r() * 6.28, rad = r() * 0.42, y = 0.05 + (i / 240) * 1.25; q.setFromEuler(new THREE.Euler(r() * 0.8, 0, r() * 0.8)); m4.compose(new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad), q, new THREE.Vector3(1, 1, 1)); coinIM.setMatrixAt(i, m4); }
  for (let i = 0; i < 80; i++) { const a = r() * 6.28, rad = r() * 0.38, y = 0.1 + (i / 80) * 1.2; q.setFromEuler(new THREE.Euler(r(), r() * 3, r())); m4.compose(new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad), q, new THREE.Vector3(1, 1, 1)); billIM.setMatrixAt(i, m4); }
  coinIM.count = nc; billIM.count = nb; coinIM.instanceMatrix.needsUpdate = billIM.instanceMatrix.needsUpdate = true; }
const tray = E.prop(new THREE.Group()); E.scene.add(tray);
{ box(0.9, 0.05, 0.6, mat('#ff8a65'), 0, 0, 0, tray); E.sphere(0.13, mat('#f4d03f'), -0.22, 0.1, 0, tray, 10); box(0.3, 0.06, 0.25, mat('#e67e22'), 0.18, 0.06, -0.05, tray); E.sphere(0.09, mat('#e53935'), 0.25, 0.1, 0.18, tray, 8); cyl(0.07, 0.06, 0.2, mat('#ffffff'), -0.3, 0.12, 0.2, tray, 10); }
const money = E.prop(new THREE.Group()); E.scene.add(money);
for (let i = 0; i < 6; i++) box(0.32, 0.012, 0.15, mat('#7cb342'), (i % 3) * 0.05, i * 0.014, (i % 2) * 0.03, money);

// ---------- helpers ----------
const SEAT = (i) => caf.userData.seats[i];
function seatedKids(t, n = 10, look = null) {
  kids.slice(0, n).forEach((c, i) => { const [x, z, s] = SEAT((i * 3 + 1) % caf.userData.seats.length); c.place(x, 0.06, z, s > 0 ? Math.PI : 0); c.expr = look ? look.expr : 'happy'; c.pose({ sit: true, t, headY: look ? face([x, 0, z], look.at) - (s > 0 ? Math.PI : 0) : Math.sin(t * 2 + i) * 0.3, headX: look ? -0.15 : 0, armR: [-0.9 + Math.sin(t * 5 + i) * 0.2, 0, -0.2] }); });
}
function cafe(light = 'day', banner = false) { show('cafeteria', light); caf.userData.banner.visible = banner; }
function rosaServe(t, expr = 'smile') { rosa.place(0.5, 0, -6.7, 0); rosa.expr = expr; rosa.pose({ t, armL: [-1.1, 0, 0.2], armR: [-1.1, 0, -0.2] }); }
function holdTray(ch, k = 1) { const a = handPos(ch, 0).add(handPos(ch, 1)).multiplyScalar(0.5); tray.position.set(a.x, a.y + 0.08, a.z + 0.15 * k); tray.rotation.set(0, ch.root.rotation.y, 0); tray.visible = true; }

const S = {
  cafeteria_wide(t, d, k) { cafe(); seatedKids(t); rosaServe(t); cam([9, 6.5, 10], [7, 5.5, 8], [-1, 1.5, -2], [-1, 1.5, -2.5], ease(k), 52); },
  register_zero(t, d, k) { cafe(); setRegister('JAKE M.'); const p = caf.userData.screen.position; cam([p.x - 0.3, p.y + 0.1, p.z + 2.2], [p.x - 0.2, p.y + 0.05, p.z + 1.4], p.toArray(), p.toArray(), ease(k), 42); },
  kids_line(t, d, k) {
    cafe(); rosaServe(t);
    kids.slice(0, 6).forEach((c, i) => { c.place(-4 + i * 1.6 + k * 1.2, 0, -4.4, Math.PI); c.expr = 'smile'; c.pose({ t, walk: t * 4 + i, amp: 0.2 }); });
    cam([2.2, 2.6, 2.2], [1.6, 2.5, 1.4], [-0.5, 1.8, -5], [0, 1.8, -5], ease(k), 50);
  },
  balance_zero(t, d, k) { cafe(); const names = ['LILY S.', 'OMAR K.', 'ZOE P.', 'EVAN T.']; setRegister(names[Math.min(3, Math.floor(k * 4))]); const p = caf.userData.screen.position; cam([p.x, p.y, p.z + 1.25], [p.x, p.y, p.z + 1.1], p.toArray(), p.toArray(), 0, 42); },
  kid_tray(t, d, k) {
    cafe(); rosaServe(t, 'smile');
    kid.place(0.6, 0, -4.4, Math.PI); kid.expr = 'smile'; kid.pose({ t, armL: [-1.15, 0, 0.25], armR: [-1.15, 0, -0.25] }); holdTray(kid);
    cam([3.6, 2.8, -1.6], [3.1, 2.7, -2.0], [0.6, 1.9, -5.4], [0.6, 1.9, -5.4], ease(k), 48);
  },
  mom_tired(t, d, k) { show('home', 'night'); mom.place(-1.0, 0.12, -4.0, 0.2); mom.expr = 'sleep'; mom.pose({ sit: true, t, headZ: 0.35, headX: 0.2 }); kid.place(1.8, 0, -1.6, -2.6); kid.expr = 'sad'; kid.pose({ t, headX: 0.2 }); cam([-2.6, 3.0, 3.2], [-2.0, 2.8, 2.2], [0.2, 1.6, -3.6], [0.2, 1.6, -3.6], ease(k), 50); },
  fridge_empty(t, d, k) { show('home', 'night'); const f = home.userData.fridge.position; kid.place(f.x - 1.7, 0, f.z + 2.0, Math.PI - 0.6); kid.expr = 'sad'; kid.pose({ t, headX: 0.1 }); cam([f.x + 0.4, 2.4, f.z + 4.8], [f.x + 0.3, 2.3, f.z + 4.0], [f.x - 0.5, 1.8, f.z + 0.6], [f.x - 0.5, 1.8, f.z + 0.6], ease(k), 48); },
  rosa_tray(t, d, k) {
    cafe(); rosaServe(t, 'happy'); rosa.pose({ t, armR: [-1.4 + Math.sin(t * 6) * 0.2, 0, -0.2], armL: [-1.1, 0, 0.2] });
    kid.place(0.6, 0, -4.4, Math.PI); kid.expr = 'happy'; kid.pose({ t, armL: [-1.15, 0, 0.25], armR: [-1.15, 0, -0.25] }); holdTray(kid); tray.scale.setScalar(1 + ease(k) * 0.35);
    cam([-1.6, 2.6, -2.6], [-1.2, 2.5, -3.0], [0.5, 2.2, -6.2], [0.5, 2.2, -6.2], ease(k), 48);
  },
  rosa_close(t, d, k) { cafe(); rosaServe(t); rosa.say(t, 'talk', 'smile'); const h = headPos(rosa); cam([h.x - 0.6, h.y - 0.2, h.z + 2.6], [h.x - 0.4, h.y - 0.1, h.z + 2.1], h.toArray(), h.toArray(), ease(k), 44); },
  kid_notice(t, d, k) { cafe(); seatedKids(t, 6); rosaServe(t, 'smile'); const [x, z] = SEAT(15); kid.place(x, 0.06, z, Math.PI); kid.expr = 'worried'; kid.pose({ sit: true, t, headY: 0.4 }); const h = headPos(kid); cam([h.x + 1.0, h.y + 0.1, h.z - 2.3], [h.x + 0.8, h.y + 0.1, h.z - 1.9], [h.x, h.y - 0.1, h.z], [h.x, h.y - 0.1, h.z], ease(k), 46); },
  rosa_rain(t, d, k) {
    show('town', 'rainy'); const z = lerp(-6, 2, k);
    rosa.place(5.4, 0.18, z, 0); rosa.expr = 'smile'; rosa.pose({ walk: t * 5, amp: 0.35, t, armR: [-0.95, 0, 0.1] });
    const hp = handPos(rosa, 1); umb.position.set(hp.x, hp.y - 0.1, hp.z); umb.visible = true; umb.rotation.set(0, 0, 0);
    rainGrey.position.set(4, 13, z + 2); rainGrey.visible = true;
    rainGrey.userData.shelter = { x: umb.position.x, z: umb.position.z, r: 1.5, y: umb.position.y + 2.1 };
    cam([1.6, 2.2, z + 6.5], [1.8, 2.2, z + 6.0], [5.4, 2.0, z], [5.4, 2.0, z], 0, 50);
  },
  shoes_close(t, d, k) {
    show('town', 'rainy'); rosa.place(5.4, 0.18, 2, 0); rosa.expr = 'smile'; rosa.pose({ t });
    rainGrey.position.set(4, 13, 4); rainGrey.visible = true; rainGrey.userData.shelter = null;
    cam([5.0, 0.7, 4.1], [5.1, 0.6, 3.6], [5.4, 0.3, 2.3], [5.4, 0.3, 2.3], ease(k), 44);
  },
  rosa_counting(t, d, k) {
    cafe('night'); rosa.place(5.4, 0, -6.6, 0); rosa.expr = 'worried'; rosa.pose({ t, headX: 0.45, armL: [-0.9, 0, 0.3], armR: [-0.9 + Math.sin(t * 7) * 0.15, 0, -0.3] });
    const a = handPos(rosa, 0).add(handPos(rosa, 1)).multiplyScalar(0.5); money.position.set(a.x, 1.32, a.z + 0.25); money.visible = true;
    cam([2.4, 2.6, -2.8], [2.8, 2.5, -3.3], [5.3, 1.6, -5.8], [5.3, 1.6, -5.8], ease(k), 48);
  },
  last_day(t, d, k) { cafe('day', true); rosa.place(-2.5, 0, -6.7, 0.2); rosa.expr = 'sad'; rosa.pose({ t, armL: [-1.0, 0, 0.3], armR: [-1.0, 0, -0.3], headX: 0.25 }); cam([6, 4.5, 6], [5, 4.2, 5], [-1.5, 3.5, -7], [-1.5, 3.8, -7], ease(k), 52); },
  notebook_find(t, d, k) {
    cafe('day', true); kid.place(5.4, 0, -4.2, Math.PI); kid.expr = 'worried'; kid.pose({ t, armL: [-1.25 * ease(k * 1.6), 0, 0.35], armR: [-1.25 * ease(k * 1.6), 0, -0.35], headX: 0.3 });
    const a = handPos(kid, 0).add(handPos(kid, 1)).multiplyScalar(0.5); notebook.position.set(a.x, a.y + 0.3, a.z - 0.15); notebook.rotation.set(-0.5, Math.PI, 0); notebook.visible = true;
    cam([3.6, 3.0, -7.0], [4.0, 2.9, -6.6], [5.3, 2.0, -4.4], [5.3, 2.1, -4.4], ease(k), 48);
  },
  notebook_pages(t, d, k) { cafe('day', true); notebook.position.set(0, 2, 6); notebook.rotation.set(0, 0, 0); notebook.visible = true; cam([0, 2.1, 7.7], [-0.25, 2.05, 7.1], [0, 2, 6], [-0.25, 2.0, 6], ease(k), 42); },
  names_close(t, d, k) { cafe('day', true); notebook.position.set(0, 2, 6); notebook.rotation.set(0, 0, 0); notebook.visible = true; cam([-0.32, 2.2, 6.75], [-0.32, 1.95, 6.6], [-0.32, 2.15, 6], [-0.32, 1.9, 6], ease(k), 42); },
  my_name(t, d, k) { cafe('day', true); notebook.position.set(0, 2, 6); notebook.rotation.set(0, 0, 0); notebook.visible = true; effects.flash(k < 0.12 ? 0.25 : 0, '255,80,80'); cam([0.24, 1.95, 7.4], [0.24, 1.94, 7.15], [0.24, 1.93, 6], [0.24, 1.93, 6], ease(k), 42); },
  kid_tells(t, d, k) {
    cafe('day', true); kid.place(-6, 1.36, 0, 0); kid.say(t, 'talk', 'determined'); kid.pose({ t, armR: [-2.6 + Math.sin(t * 6) * 0.2, 0, -0.2] });
    seatedKids(t, 10, { expr: 'shock', at: [-6, 0, 0] });
    cam([-2.0, 2.2, 7.5], [-2.6, 2.4, 6.5], [-6, 2.6, 0], [-6, 2.8, 0], ease(k), 50);
  },
  spread_1(t, d, k) { cafe('day', true); kids.slice(0, 6).forEach((c, i) => { c.place(-3 + i * 1.3, 0, 2.5 - (i % 2) * 0.8, Math.PI + 0.2 - i * 0.08); c.expr = 'shock'; c.pose({ t, armR: i % 2 ? [-2.8, 0, -0.2] : null }); }); cam([-0.2, 2.0, -3.0], [0, 2.1, -2.2], [0.2, 1.8, 2.5], [0.2, 1.8, 2.5], ease(k), 52); },
  spread_2(t, d, k) { show('town', 'day'); adults.slice(0, 8).forEach((c, i) => { const s = i % 2 ? -1 : 1; c.place(s * 5.5, 0.18, 20 - i * 2.4 - t * 2.2, Math.PI); c.expr = 'determined'; c.pose({ walk: t * 7 + i, amp: 0.55, t, armR: [-1.0, 0, -0.2] }); }); cam([0, 2.6, -6], [0, 2.8, -4.5], [0, 1.8, 14], [0, 1.8, 12], ease(k), 52); },
  line_outside(t, d, k) { show('school', 'day'); adults.forEach((c, i) => { c.place(-1.2 - i * 1.25, 0.18, 5.6 + (i % 2) * 0.5, Math.PI / 2 + 0.2); c.expr = i % 3 ? 'smile' : 'happy'; c.pose({ t, armR: i % 3 === 0 ? [-1.0, 0, -0.2] : null }); }); cam([6, 3.6, 18], [3, 4.4, 16], [-6, 2, 4], [-9, 2, 4], ease(k), 52); },
  jar_fill(t, d, k) { cafe('day', true); jar.position.set(4.0, 1.3, -5.55); jar.visible = true; setJar(ease(k) * 0.98 + 0.02); sparkles.userData.set(new THREE.Vector3(4.0, 2.4, -5.4), clamp01((k - 0.4) * 2), 0.7); cam([4.0, 2.4, -3.3], [4.0, 2.2, -3.8], [4.0, 1.9, -5.5], [4.0, 1.9, -5.5], ease(k), 46); },
  rosa_cry(t, d, k) { cafe('day', true); rosa.place(4.6, 0, -6.6, -0.3); rosa.expr = 'cry'; rosa.pose({ t, armL: [-1.8, 0, 0.6], armR: [-1.8, 0, -0.6], headX: 0.1 }); jar.position.set(4.0, 1.3, -5.55); jar.visible = true; setJar(1); const h = headPos(rosa); cam([h.x + 1.8, h.y - 0.05, h.z + 2.0], [h.x + 1.5, h.y, h.z + 1.6], h.toArray(), h.toArray(), ease(k), 44); },
  rosa_smile(t, d, k) {
    cafe('day', true); rosa.place(4.6, 0, -6.6, -0.3); rosa.say(t, 'talk', 'happy'); rosa.pose({ t, armR: [-1.1, 0, -0.2] });
    kid.place(3.8, 0, -4.4, Math.PI + 0.3); kid.expr = 'happy'; kid.pose({ t, armL: [-1.15, 0, 0.25], armR: [-1.15, 0, -0.25] }); holdTray(kid);
    cam([0.8, 2.6, -2.8], [1.2, 2.5, -3.2], [4.2, 2.1, -5.6], [4.2, 2.1, -5.6], ease(k), 48);
  },
  end_pull(t, d, k) {
    cafe('day', true); rosa.place(0.5, 0, -6.7, 0); rosa.expr = 'happy'; rosa.pose({ t, armL: [-2.7, 0, 0.3], armR: [-2.7, 0, -0.3] });
    adults.slice(0, 12).forEach((c, i) => { c.place(-6 + (i % 6) * 2.4, 0, -3.6 + Math.floor(i / 6) * 2.2, Math.PI); c.expr = 'happy'; c.pose({ t, jump: t * 7 + i, armR: i % 2 ? [-2.8, 0, -0.2] : null }); });
    kid.place(0.6, 0, -4.6, Math.PI); kid.expr = 'happy'; kid.pose({ t, armR: [-2.8, 0, -0.2] });
    jar.position.set(4.0, 1.3, -5.55); jar.visible = true; setJar(1);
    cam([1.0, 3.0, 4], [2, 8, 11], [0.5, 2.4, -6], [0.5, 3, -6], ease(k), 52);
  },
};
const wrapped = Object.fromEntries(Object.entries(S).map(([n, f]) => [n, (...a) => { tray.scale.setScalar(1); f(...a); }]));
E.run({ timings: T, shots: wrapped, captionStyle: 'lime' });
