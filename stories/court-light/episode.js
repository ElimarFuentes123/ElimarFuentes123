// Episode 4: "In this town, every basketball court turns its lights off at 9 PM."
import * as E from '../engine/engine.js';
const { THREE, cam, ease, clamp01, lerp, show, makeChar, handPos, headPos, face, effects, sparkles, box, cyl, mat, canvasTex, signTex } = E;

const T = await (await fetch('build/timings.json')).json();

// ---------- textures ----------
const numTex = (n, bg, fg = '#ffffff') => canvasTex(256, 256, (g) => { g.fillStyle = bg; g.fillRect(0, 0, 256, 256); g.fillStyle = fg; g.font = '800 170px Cap'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 128, 140); });
const courtTex = (base, paint) => canvasTex(512, 1024, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 1024);
  if (base === '#c98d52') { for (let x = 0; x < 512; x += 32) { g.fillStyle = `rgba(90,50,20,${0.08 + (x % 64 ? 0.04 : 0)})`; g.fillRect(x, 0, 2, 1024); } }
  g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.strokeRect(12, 12, 488, 1000); g.beginPath(); g.moveTo(12, 512); g.lineTo(500, 512); g.stroke();
  g.beginPath(); g.arc(256, 512, 70, 0, 7); g.stroke();
  for (const top of [true, false]) {
    const y0 = top ? 12 : 1012, s = top ? 1 : -1;
    g.fillStyle = paint; g.fillRect(186, top ? 12 : 1012 - 220, 140, 220); g.strokeRect(186, top ? 12 : 1012 - 220, 140, 220);
    g.beginPath(); g.arc(256, y0 + s * 220, 70, top ? 0 : Math.PI, top ? Math.PI : 2 * Math.PI); g.stroke();
    g.beginPath(); g.moveTo(40, y0); g.lineTo(40, y0 + s * 120); g.arc(256, y0 + s * 60, 216, top ? Math.PI * 0.95 : -Math.PI * 0.95, top ? Math.PI * 0.05 : -Math.PI * 0.05, top); g.lineTo(472, y0); g.stroke();
  }
});
const ballTex = canvasTex(256, 128, (g) => { g.fillStyle = '#e8741c'; g.fillRect(0, 0, 256, 128); g.strokeStyle = '#2b1608'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 64); g.lineTo(256, 64); g.moveTo(64, 0); g.lineTo(64, 128); g.moveTo(192, 0); g.lineTo(192, 128); g.stroke(); });
const fenceTex = canvasTex(128, 128, (g) => { g.clearRect(0, 0, 128, 128); g.strokeStyle = 'rgba(200,205,210,1)'; g.lineWidth = 3; for (let i = -128; i < 256; i += 24) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke(); g.beginPath(); g.moveTo(i + 128, 0); g.lineTo(i, 128); g.stroke(); } }, [10, 2]);
fenceTex.colorSpace = THREE.SRGBColorSpace;

// ---------- cast ----------
const kid = makeChar({ shirt: '#ff7a1c', pants: '#2b4a86', hairType: 'kid', hair: '#2e1d12', hood: true });
const kidJ = makeChar({ shirt: '#1e88e5', pants: '#1e88e5', hairType: 'kid', hair: '#2e1d12', logo: numTex(7, '#1e88e5') });
const coach = makeChar({ shirt: '#c62828', pants: '#2b2b33', hairType: 'cap', cap: '#c62828', stripe: '#ffffff' });
const moe = makeChar({ shirt: '#7d8a96', pants: '#6b7682', shoes: '#333', hairType: 'grandpa', hair: '#d9d9d9', mustache: '#cfcfcf' });
const moeJ = makeChar({ shirt: '#d32f2f', pants: '#6b7682', shoes: '#333', hairType: 'grandpa', hair: '#d9d9d9', mustache: '#cfcfcf', logo: numTex(23, '#d32f2f') });
const team = [3, 11, 14, 21].map((n, i) => makeChar({ shirt: '#1e88e5', pants: '#1e88e5', hairType: ['dad', 'cap', 'beanie', 'kid'][i], hair: '#1c1c1c', cap: '#0d47a1', logo: numTex(n, '#1e88e5') }));
const rivals = [5, 8, 12, 30, 33].map((n, i) => makeChar({ shirt: '#e53935', pants: '#e53935', hairType: ['dad', 'kid', 'cap', 'bob', 'beanie'][i], hair: '#3b2618', cap: '#7f0000', logo: numTex(n, '#e53935') }));
const players = E.makeExtras(4, 61);

// ---------- props ----------
const ball = E.prop(E.sphere(0.28, mat('#fff', { map: ballTex, roughness: 0.7 }), 0, 0, 0, null, 18)); E.scene.add(ball);
const broom = E.prop(new THREE.Group()); E.scene.add(broom); cyl(0.04, 0.04, 2.4, mat('#8d6e4f'), 0, 1.2, 0, broom, 8); box(0.8, 0.25, 0.16, mat('#c9a227'), 0, 0.12, 0, broom);
const confetti = E.prop(new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: '#fff' }), 300)); E.scene.add(confetti);
{ const r = E.rng(9); for (let i = 0; i < 300; i++) confetti.setColorAt(i, new THREE.Color(['#ffd54a', '#1e88e5', '#ffffff', '#e53935', '#43a047'][i % 5])); confetti.userData.seeds = Array.from({ length: 300 }, () => [r(), r(), r(), r()]); }
function setConfetti(t) { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(); confetti.userData.seeds.forEach(([a, b, c, d], i) => { const y = 12 - ((t * (0.8 + d) + b * 12) % 12); e.set(t * 3 + a * 9, t * 2 + c * 9, 0); q.setFromEuler(e); m4.compose(new THREE.Vector3((a - 0.5) * 24, y, (c - 0.5) * 24), q, new THREE.Vector3(1, 1, 1)); confetti.setMatrixAt(i, m4); }); confetti.instanceMatrix.needsUpdate = true; confetti.visible = true; }

// ---------- outdoor courts set ----------
const courts = new THREE.Group();
const courtLights = {};
function buildCourt(cx, name, park) {
  const g = new THREE.Group(); g.position.set(cx, 0, 0); courts.add(g);
  box(22, 0.04, 36, mat(park ? '#5a5f66' : '#4c5058'), 0, 0.02, 0, g, false);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(15, 28), mat('#fff', { map: courtTex(park ? '#2f6f4f' : '#2f6fb5', park ? '#a33b2f' : '#c0392b') })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.05; fl.receiveShadow = true; g.add(fl);
  for (const s of [-1, 1]) hoop(g, 0, s);
  // chain-link fence
  const fm = new THREE.MeshStandardMaterial({ map: fenceTex, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.6 });
  for (const s of [-1, 1]) { const a = new THREE.Mesh(new THREE.PlaneGeometry(36, 3.2), fm); a.position.set(s * 11, 1.6, 0); a.rotation.y = Math.PI / 2; g.add(a); const b = new THREE.Mesh(new THREE.PlaneGeometry(22, 3.2), fm); b.position.set(0, 1.6, s * 18); g.add(b); }
  for (let z = -18; z <= 18; z += 4) for (const s of [-1, 1]) box(0.1, 3.3, 0.1, mat('#9aa0a6', { metalness: 0.6 }), s * 11, 1.65, z, g);
  // floodlights
  const lampM = mat('#fffbe6', { emissive: '#fff2c0', emissiveIntensity: 2.5 });
  for (const [x, z] of [[-10, -16], [10, -16], [-10, 16], [10, 16]]) { box(0.3, 9, 0.3, mat('#555b63', { metalness: 0.5 }), x, 4.5, z, g); const l = box(1.6, 0.6, 0.5, lampM, x * 0.9, 9, z * 0.95, g, false); l.lookAt(cx, 0, 0); }
  const L1 = new THREE.PointLight('#fff3d6', 3.2, 40, 0), L2 = new THREE.PointLight('#fff3d6', 3.2, 40, 0); L1.position.set(0, 10, -8); L2.position.set(0, 10, 8); g.add(L1, L2);
  courtLights[name] = { lampM, L: [L1, L2], set(on) { lampM.emissiveIntensity = on ? 2.5 : 0; lampM.color.set(on ? '#fffbe6' : '#555'); L1.intensity = L2.intensity = on ? 3.2 : 0; } };
  E.bench(g, -9.3, 0, 0, Math.PI / 2);
  if (park) {
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; E.roundTree(g, Math.cos(a) * 20, Math.sin(a) * 26, 1.3, ['#2e7d32', '#388e3c', '#43a047'][i % 3]); }
    // Moe's shed with the jersey in the window
    const shed = new THREE.Group(); shed.position.set(15, 0, 4); shed.rotation.y = -Math.PI / 2; g.add(shed); g.userData.shed = shed;
    box(4.5, 3.4, 3.4, mat('#8d6e4f'), 0, 1.7, 0, shed); box(5.0, 0.3, 4.0, mat('#4e342e'), 0, 3.5, 0, shed);
    box(1.8, 1.4, 0.1, mat('#ffd9a0', { emissive: '#ffbe70', emissiveIntensity: 1.1 }), 0.8, 1.9, 1.72, shed, false);
    const jer = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.2), mat('#fff', { map: canvasTex(256, 280, (c) => { c.clearRect(0, 0, 256, 280); c.fillStyle = '#b5524a'; c.beginPath(); c.moveTo(50, 20); c.lineTo(95, 20); c.quadraticCurveTo(128, 60, 161, 20); c.lineTo(206, 20); c.lineTo(206, 270); c.lineTo(50, 270); c.fill(); c.fillStyle = '#f2e6d0'; c.font = '800 110px Cap'; c.textAlign = 'center'; c.fillText('23', 128, 190); c.font = '700 30px Cap'; c.fillText('MOE', 128, 82); }), transparent: true }));
    jer.position.set(0.8, 1.85, 1.78); shed.add(jer); g.userData.jersey = jer;
    box(0.8, 2.3, 0.1, mat('#5d4037'), -1.2, 1.15, 1.72, shed);
    // light bill taped to the floodlight pole (pole at x=10, z=16 → near the hoop)
    const bill = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), mat('#fff', { map: canvasTex(240, 320, (c) => { c.fillStyle = '#f7f3e8'; c.fillRect(0, 0, 240, 320); c.fillStyle = '#333'; c.font = '700 26px Cap'; c.fillText('PARK LIGHTS', 22, 46); c.font = '600 20px Cap'; c.fillText('Electric bill', 22, 80); c.fillText('Oct 2026', 22, 108); c.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 130; y < 200; y += 16) c.fillRect(22, y, 190, 6); c.save(); c.translate(120, 250); c.rotate(-0.15); c.strokeStyle = '#c62828'; c.lineWidth = 6; c.strokeRect(-90, -36, 180, 72); c.fillStyle = '#c62828'; c.font = '800 34px Cap'; c.textAlign = 'center'; c.fillText('PAID  R.M.', 0, 12); c.restore(); }), emissive: '#fff', emissiveIntensity: 0.25 }));
    bill.position.set(9.8, 1.8, 15.84); bill.rotation.y = Math.PI; g.add(bill); g.userData.bill = bill;
    const sw = box(0.4, 0.5, 0.2, mat('#78909c', { metalness: 0.5 }), 10.0, 1.3, -15.8, g); g.userData.switchBox = sw;
  }
  return g;
}
function hoop(g, x, s) {
  const z = s * 12.9;
  box(0.3, 3.9, 0.3, mat('#455a64', { metalness: 0.5 }), x, 1.95, s * 14.3, g);
  box(0.2, 0.2, 1.3, mat('#455a64'), x, 3.85, s * 13.65, g);
  const bb = box(1.9, 1.15, 0.08, mat('#ffffff', { map: canvasTex(190, 115, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 190, 115); c.strokeStyle = '#c62828'; c.lineWidth = 6; c.strokeRect(3, 3, 184, 109); c.strokeRect(62, 45, 66, 50); }) }), x, 3.6, z, g);
  bb.rotation.y = s > 0 ? Math.PI : 0;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.035, 8, 24), mat('#ff6d00', { metalness: 0.3 })); rim.rotation.x = Math.PI / 2; rim.position.set(x, 3.05, z - s * 0.55); g.add(rim);
  const net = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.3, 0.6, 12, 3, true), new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.8 })); net.position.set(x, 2.74, z - s * 0.55); g.add(net);
}
const courtA = buildCourt(0, 'A', false), courtB = buildCourt(80, 'B', true);
{ const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), mat('#3f7d3a')); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; ground.receiveShadow = true; courts.add(ground);
  const r = E.rng(4); for (let i = 0; i < 10; i++) { const h = 10 + r() * 14; const b = box(10, h, 10, mat(['#7f8fa6', '#a4b0be', '#8395a7'][i % 3]), -30 + (i % 5) * 13, h / 2, -40 - Math.floor(i / 5) * 14, courts); for (let y = 2; y < h - 1; y += 2.6) for (const x of [-3, 0, 3]) box(1.4, 1.4, 0.1, E.glassMat, -30 + (i % 5) * 13 + x, y, -40 - Math.floor(i / 5) * 14 + 5.05, courts, false); } }
E.addSet('courts', courts);
const RIM_B = new THREE.Vector3(80, 3.05, 12.35), RIM_A = new THREE.Vector3(0, 3.05, 12.35);

// ---------- gym set ----------
const gym = new THREE.Group(); gym.userData.indoor = true; gym.userData.setNight = () => {};
const scoreCanvas = document.createElement('canvas'); scoreCanvas.width = 512; scoreCanvas.height = 256;
const scoreTex = new THREE.CanvasTexture(scoreCanvas); scoreTex.colorSpace = THREE.SRGBColorSpace;
function setScore(home, guest, clock, flash = false) {
  const g = scoreCanvas.getContext('2d'); g.fillStyle = flash ? '#3a2a00' : '#111'; g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#ccc'; g.font = '700 34px Cap'; g.textAlign = 'center'; g.fillText('HOME', 110, 50); g.fillText('GUEST', 402, 50);
  g.fillStyle = '#ff3b30'; g.font = '800 110px Cap'; g.fillText(String(home), 110, 160); g.fillText(String(guest), 402, 160);
  g.fillStyle = '#ffd54a'; g.font = '800 64px Cap'; g.fillText(clock, 256, 232); scoreTex.needsUpdate = true;
}
setScore(48, 49, '0:10');
{
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(15, 28), mat('#fff', { map: courtTex('#c98d52', '#1e5fa8'), roughness: 0.45 })); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01; floor.receiveShadow = true; gym.add(floor);
  box(60, 0.02, 60, mat('#8a6a48'), 0, 0, 0, gym, false);
  for (const s of [-1, 1]) hoop(gym, 0, s);
  // walls + banners
  box(60, 22, 0.4, mat('#2b3a55'), 0, 11, -22, gym, false); box(60, 22, 0.4, mat('#2b3a55'), 0, 11, 22, gym, false);
  box(0.4, 22, 60, mat('#2b3a55'), -24, 11, 0, gym, false); box(0.4, 22, 60, mat('#2b3a55'), 24, 11, 0, gym, false);
  ['#1e88e5', '#ffd54a', '#e53935', '#43a047'].forEach((c, i) => box(2.2, 4, 0.1, mat(c), -9 + i * 6, 15, -21.7, gym));
  // bleachers both sides
  for (const s of [-1, 1]) for (let r = 0; r < 6; r++) box(2.0, 0.6 + r * 0.95, 34, mat(r % 2 ? '#90a4ae' : '#b0bec5'), s * (10.2 + r * 1.6), (0.6 + r * 0.95) / 2, 0, gym);
  // scoreboard hanging over center
  const sb = new THREE.Group(); sb.position.set(0, 11, 0); gym.add(sb); gym.userData.scoreboard = sb;
  box(5.4, 2.9, 1.0, mat('#1a1a1a'), 0, 0, 0, sb);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.5), new THREE.MeshBasicMaterial({ map: scoreTex })); p.position.z = s * 0.52; if (s < 0) p.rotation.y = Math.PI; sb.add(p); }
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.5), new THREE.MeshBasicMaterial({ map: scoreTex })); p.position.x = s * 2.72; p.rotation.y = s * Math.PI / 2; p.scale.x = 0.2; sb.add(p); }
  for (const [x, z] of [[-6, -8], [6, -8], [-6, 8], [6, 8]]) { const l = new THREE.PointLight('#fff6e8', 2.2, 40, 0); l.position.set(x, 16, z); gym.add(l); }
  const sp = new THREE.SpotLight('#ffffff', 2.0, 60, 0.9, 0.6, 0); sp.position.set(0, 20, 0); sp.target.position.set(0, 0, 0); sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); gym.add(sp, sp.target);
}
// crowd on bleachers (instanced, cheap): torso + head per seat
const seats = [];
{ const r = E.rng(17); for (const s of [-1, 1]) for (let row = 0; row < 6; row++) for (let z = -15.5; z <= 15.5; z += 1.25) if (r() < 0.92) seats.push({ x: s * (10.2 + row * 1.6), y: 0.6 + row * 0.95, z: z + (r() - 0.5) * 0.2, s, ph: r() * 6.28, c: ['#e53935', '#1e88e5', '#ffd54a', '#43a047', '#ffffff', '#8e44ad', '#ff7a1c'][Math.floor(r() * 7)] }); }
const torsoIM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.95, 1.0, 0.5), mat('#fff'), seats.length);
const headIM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.38, 0.38, 0.7, 14), mat('#f6c945'), seats.length);
seats.forEach((st, i) => torsoIM.setColorAt(i, new THREE.Color(st.c)));
torsoIM.castShadow = headIM.castShadow = true; gym.add(torsoIM, headIM);
function setCrowd(t, cheer) {
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  seats.forEach((st, i) => {
    const j = cheer ? Math.max(0, Math.sin(t * 9 + st.ph)) * 0.45 : 0;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), st.s > 0 ? -Math.PI / 2 : Math.PI / 2);
    m4.compose(new THREE.Vector3(st.x, st.y + 0.5 + j, st.z), q, new THREE.Vector3(1, 1, 1)); torsoIM.setMatrixAt(i, m4);
    m4.compose(new THREE.Vector3(st.x, st.y + 1.38 + j, st.z), q, new THREE.Vector3(1, 1, 1)); headIM.setMatrixAt(i, m4);
  });
  torsoIM.instanceMatrix.needsUpdate = headIM.instanceMatrix.needsUpdate = true;
}
setCrowd(0, false);
E.addSet('gym', gym);
const RIM_G = new THREE.Vector3(0, 3.05, 12.35);

// old photo of young Moe
const photo = E.prop(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), mat('#fff', { map: canvasTex(480, 360, (g) => {
  g.fillStyle = '#c9b48a'; g.fillRect(0, 0, 480, 360); g.fillStyle = '#9c8458'; g.fillRect(0, 250, 480, 110);
  g.fillStyle = '#b5524a'; g.fillRect(190, 150, 110, 120); g.fillStyle = '#f2e6d0'; g.font = '800 60px Cap'; g.textAlign = 'center'; g.fillText('23', 245, 232);
  g.fillStyle = '#e8c36a'; g.beginPath(); g.roundRect(205, 70, 80, 78, 14); g.fill(); g.fillStyle = '#3b2618'; g.fillRect(200, 60, 90, 22);
  g.fillStyle = '#1b1410'; g.beginPath(); g.arc(230, 104, 6, 0, 7); g.fill(); g.beginPath(); g.arc(260, 104, 6, 0, 7); g.fill(); g.beginPath(); g.arc(245, 122, 12, 0, Math.PI); g.fill();
  g.fillStyle = '#e8741c'; g.beginPath(); g.arc(330, 120, 30, 0, 7); g.fill(); g.fillStyle = '#e8c36a'; g.fillRect(300, 140, 26, 60);
  g.fillStyle = '#3a2a1a'; g.font = '700 32px serif'; g.fillText('STATE MVP · 1991', 240, 330);
  g.fillStyle = 'rgba(120,90,40,0.25)'; g.fillRect(0, 0, 480, 360); g.strokeStyle = '#f3ead6'; g.lineWidth = 22; g.strokeRect(0, 0, 480, 360);
}), emissive: '#fff', emissiveIntensity: 0.25 })));
E.scene.add(photo);

// ---------- helpers ----------
function arc(from, to, k, h = 2.2) { const p = from.clone().lerp(to, k); p.y += Math.sin(Math.PI * k) * h; return p; }
function ballAt(p) { ball.position.copy(p); ball.visible = true; ball.rotation.set(p.z * 2, 0, p.x); }
function outdoors(court, on = true) { show('courts', 'night'); courtLights.A.set(court === 'A' ? on : true); courtLights.B.set(court === 'B' ? on : true); }

// ---------- shots ----------
const S = {
  courtA_wide(t, d, k) {
    outdoors('A', true);
    players.forEach((p, i) => { p.place(-3 + i * 2, 0.05, 4 + (i % 2) * 3 + Math.sin(t * 2 + i) * 1.5, Math.PI + 0.3 * i); p.expr = 'happy'; p.pose({ walk: t * 8 + i, amp: 0.5, t }); });
    ballAt(new THREE.Vector3(-1 + Math.sin(t * 2) * 1.5, 0.3 + Math.abs(Math.sin(t * 7)) * 1.0, 4.5));
    cam([14, 9, 22], [12, 8, 19], [0, 1, 2], [0, 1, 2], ease(k), 50);
  },
  light_click(t, d, k) {
    const on = k < 0.55; outdoors('A', on);
    if (!on && k < 0.65) effects.flash(0.12, '0,0,0');
    cam([6.5, 6.2, 9], [7.0, 6.6, 10], [9, 9, 15.2], [9, 9, 15.2], ease(k), 44);
  },
  coach_dan(t, d, k) {
    outdoors('A', true);
    coach.place(0, 0.05, 2, Math.PI); coach.say(t, 'talk', 'angry'); coach.pose({ t, armR: [-1.5, 0, -0.1], armL: [-0.6, 0, 0.4] });
    const h = headPos(coach);
    cam([h.x + 1.2, h.y - 0.6, h.z - 3.0], [h.x + 0.9, h.y - 0.4, h.z - 2.4], [h.x, h.y - 0.1, h.z], [h.x, h.y, h.z], ease(k), 46);
  },
  park_court(t, d, k) { outdoors('B', true); cam([80 - 18, 5, 30], [80 - 14, 6, 27], [80, 1.5, 0], [80, 1.8, 0], ease(k), 50); },
  park_lights(t, d, k) { outdoors('B', true); cam([80 + 4, 1.4, 10], [80 + 4.5, 1.6, 11], [80 + 9, 9, 15.2], [80 + 9, 9.5, 15.5], ease(k), 54); },
  kid_shoot1(t, d, k) {
    outdoors('B', true);
    kid.place(80 - 1, 0.05, 6, 0.1); kid.expr = 'determined'; kid.pose({ t, armR: [-0.9, 0, -0.2] });
    const hp = handPos(kid, 1); ballAt(new THREE.Vector3(hp.x, 0.3 + Math.abs(Math.sin(t * 6)) * (hp.y - 0.6), hp.z + 0.4));
    cam([80 + 2.2, 1.0, 9.6], [80 + 1.8, 1.0, 9.0], [80 - 0.8, 1.3, 6], [80 - 0.8, 1.3, 6], ease(k), 50);
  },
  kid_shoot2(t, d, k) {
    outdoors('B', true);
    const rel = clamp01((k - 0.15) / 0.7);
    kid.place(80, 0.05, 5.5, 0); kid.expr = 'determined'; kid.pose({ t, armL: [-2.8, 0, 0.2], armR: [-2.9, 0, -0.2], jump: k < 0.35 ? k * 9 : 0 });
    const start = headPos(kid).add(new THREE.Vector3(0, 0.6, 0.3));
    ballAt(rel < 1 ? arc(start, RIM_B.clone().add(new THREE.Vector3(0, 0.1, 0)), rel, 2.6) : RIM_B.clone().add(new THREE.Vector3(0, -0.4 - (k - 0.85) * 6, 0)));
    cam([80 - 2.5, 2.0, 1.0], [80 - 2.3, 2.2, 1.4], [80, 2.6, 9], [80, 3.0, 11], ease(k), 52);
  },
  kid_shoot3(t, d, k) {
    outdoors('B', true);
    kid.place(80 + 3, 0.05, lerp(10, 8, k), Math.PI); kid.expr = 'smile'; kid.pose({ walk: t * 6, amp: 0.4, t, armR: [-0.9, 0, -0.2] });
    ballAt(handPos(kid, 1).add(new THREE.Vector3(0, 0.1, -0.35)));
    cam([80 + 0.5, 2.6, 3], [80 + 1.0, 2.5, 3.5], [80 + 3, 1.6, 9], [80 + 3, 1.6, 8], ease(k), 50);
  },
  coach_cut(t, d, k) {
    show('courts', 'day'); courtLights.A.set(false); courtLights.B.set(false);
    coach.place(0, 0.05, 0, 0.2); coach.expr = 'angry'; coach.pose({ t, armR: [-1.2, 0, -0.2], headY: Math.sin(t * 5) * 0.35 });
    team.forEach((p, i) => { p.place(-3 + i * 1.6, 0.05, -2.5, 0); p.expr = 'happy'; p.pose({ t, jump: t * 7 + i }); });
    kid.place(1.0, 0.05, 2.4, Math.PI + 0.3); kid.expr = 'sad'; kid.pose({ t, headX: 0.3 });
    cam([-2.6, 2.4, 7.5], [-2.2, 2.3, 6.6], [0.2, 1.7, 0.3], [0.2, 1.7, 0.5], ease(k), 50);
  },
  kid_notice(t, d, k) {
    outdoors('B', true);
    kid.place(80 + 5, 0.05, 3, Math.PI / 2 + 0.6); kid.expr = 'worried'; kid.pose({ t, armR: [-0.9, 0, -0.2] }); ballAt(handPos(kid, 1).add(new THREE.Vector3(0.2, 0.1, 0.1)));
    moe.place(80 + 12.5, 0, 1, -Math.PI / 2 - 0.3); moe.expr = 'smile'; moe.pose({ t, armL: [-0.8, 0, 0.3], armR: [-0.8, 0, -0.3] });
    const h = headPos(kid);
    cam([h.x - 1.6, h.y + 0.3, h.z - 2.2], [h.x - 1.4, h.y + 0.2, h.z - 1.9], [80 + 12, 1.8, 1.2], [80 + 12, 1.8, 1.2], ease(k), 46);
  },
  janitor_sweep(t, d, k) {
    outdoors('B', true);
    moe.place(80 + 9.5, 0.05, lerp(-2, 1, k), 0); moe.expr = 'smile'; moe.pose({ t, armL: [-0.9 + Math.sin(t * 5) * 0.3, 0, 0.4], armR: [-0.9 + Math.sin(t * 5) * 0.3, 0, -0.4] });
    const p = handPos(moe, 0).add(handPos(moe, 1)).multiplyScalar(0.5); broom.position.set(p.x, 0.05, p.z + 0.5 + Math.sin(t * 5) * 0.3); broom.rotation.set(0.35, 0, 0); broom.visible = true;
    cam([80 + 5.5, 2.0, 5.5], [80 + 6.0, 2.0, 5.0], [80 + 9.5, 1.6, 0], [80 + 9.5, 1.7, 0.5], ease(k), 48);
  },
  bill_close(t, d, k) { outdoors('B', true); const b = courtB.userData.bill.getWorldPosition(new THREE.Vector3()); cam([b.x, b.y + 0.2, b.z - 2.2], [b.x, b.y + 0.05, b.z - 1.4], b.toArray(), b.toArray(), ease(k), 44); },
  shed_window(t, d, k) { outdoors('B', true); const j = courtB.userData.jersey.getWorldPosition(new THREE.Vector3()); cam([j.x - 7, 2.6, j.z + 3], [j.x - 5, 2.3, j.z + 2], j.toArray(), j.toArray(), ease(k), 48); },
  jersey_close(t, d, k) { outdoors('B', true); const j = courtB.userData.jersey.getWorldPosition(new THREE.Vector3()); cam([j.x - 2.0, j.y + 0.1, j.z + 0.3], [j.x - 1.5, j.y, j.z + 0.2], j.toArray(), j.toArray(), ease(k), 42); },
  injured(t, d, k) {
    show('gym', 'day'); setCrowd(t, false); setScore(0, 0, '8:00');
    team.slice(0, 2).forEach((p, i) => { p.place(-8.6, 0.12, -1.6 + i * 2.2, Math.PI / 2); p.expr = 'cry'; p.pose({ sit: true, t, headX: 0.3 }); });
    coach.place(-6.5, 0.05, -0.4, -Math.PI / 2 + 0.4); coach.expr = 'worried'; coach.pose({ t, armR: [-0.5, 0, 0.2], headX: 0.2 });
    cam([-3.5, 2.4, 3.5], [-4.2, 2.2, 2.8], [-8.2, 1.4, -0.4], [-8.2, 1.4, -0.4], ease(k), 50);
  },
  kid_called(t, d, k) {
    show('gym', 'day'); setCrowd(t, false);
    coach.place(-2, 0.05, 0, Math.PI / 2); coach.expr = 'determined'; coach.pose({ t, armR: [-1.55, 0, 0] });
    kid.place(1.5, 0.05, 0.1, -Math.PI / 2); kid.expr = 'shock'; kid.pose({ t });
    cam([-0.2, 2.4, 9.0], [-0.2, 2.3, 7.6], [-0.2, 1.9, 0], [-0.2, 1.9, 0], ease(k), 50);
  },
  gym_crowd(t, d, k) {
    show('gym', 'day'); setCrowd(t, true); setScore(40, 42, '2:31');
    teamOnCourt(t);
    cam([7, 6.5, -17], [6, 7.5, -15], [-12, 3, 4], [-12, 3.5, 2], ease(k), 58);
  },
  scoreboard(t, d, k) { show('gym', 'day'); setCrowd(t, true); setScore(48, 49, k < 0.5 ? '0:10' : '0:09'); cam([2.4, 8.0, -6.5], [1.8, 8.6, -5.4], [0, 11, 0], [0, 11, 0], ease(k), 44); },
  kid_ball(t, d, k) {
    show('gym', 'day'); setCrowd(t, true); setScore(48, 49, '0:08');
    kidJ.place(0.5, 0.05, 4, 0); kidJ.expr = 'determined'; kidJ.pose({ t, armL: [-1.1, 0, 0.35], armR: [-1.1, 0, -0.35] });
    const a = handPos(kidJ, 0).add(handPos(kidJ, 1)).multiplyScalar(0.5); ballAt(a.add(new THREE.Vector3(0, 0.15, 0.25)));
    const h = headPos(kidJ);
    cam([h.x + 0.6, h.y - 0.3, h.z + 2.4], [h.x + 0.5, h.y - 0.2, h.z + 2.0], [h.x, h.y - 0.3, h.z], [h.x, h.y - 0.25, h.z], ease(k), 46);
  },
  stands_look(t, d, k) {
    show('gym', 'day'); setCrowd(t, true);
    kidJ.place(0.5, 0.05, 4, -Math.PI / 2 + 0.3); kidJ.expr = 'worried'; kidJ.pose({ t, armR: [-0.9, 0, -0.2] }); ballAt(handPos(kidJ, 1).add(new THREE.Vector3(0, 0.1, 0.2)));
    moeJ.place(-10.2, 0.6, 3.4, Math.PI / 2); moeJ.expr = 'smile'; moeJ.pose({ t });
    const h = headPos(kidJ);
    cam([h.x + 1.8, h.y + 0.3, h.z + 1.2], [h.x + 1.5, h.y + 0.25, h.z + 1.0], [-10, 2.6, 3.4], [-10, 2.6, 3.4], ease(k), 46);
  },
  moe_frontrow(t, d, k) {
    show('gym', 'day'); setCrowd(t, true);
    moeJ.place(-10.2, 0.6, 3.4, Math.PI / 2); moeJ.expr = k > 0.4 ? 'happy' : 'smile'; moeJ.pose({ t, armR: [-2.8 + Math.sin(t * 6) * 0.15, 0, -0.2] });
    const h = headPos(moeJ);
    cam([h.x + 3.4, h.y - 0.3, h.z + 0.6], [h.x + 2.6, h.y - 0.2, h.z + 0.4], [h.x, h.y - 0.4, h.z], [h.x, h.y - 0.4, h.z], ease(k), 46);
  },
  the_shot(t, d, k) {
    show('gym', 'day'); setCrowd(t, false); setScore(48, 49, k < 0.5 ? '0:02' : '0:01');
    rivals.slice(0, 2).forEach((p, i) => { p.place(-1.2 + i * 2.6, 0.05, 5.6 + i * 0.6, Math.PI); p.expr = 'angry'; p.pose({ t, armL: [-2.7, 0, 0.3], armR: [-2.7, 0, -0.3], jump: k * 5 }); });
    kidJ.place(0.2, 0.05, 4, 0); kidJ.expr = 'determined'; kidJ.pose({ t, armL: [-2.8, 0, 0.2], armR: [-2.9, 0, -0.2], jump: Math.min(k, 0.3) * 10 });
    const start = headPos(kidJ).add(new THREE.Vector3(0, 0.6, 0.3)); const rel = clamp01((k - 0.2) / 0.8);
    ballAt(arc(start, RIM_G.clone().add(new THREE.Vector3(0, 0.12, 0)), rel, 3.5));
    cam([1.6, 4.4, -2.0], [1.3, 4.8, -1.2], [0.1, 3.3, 8.5], [0, 3.6, 10.5], ease(k), 54);
  },
  swish(t, d, k) {
    show('gym', 'day'); setCrowd(t, k > 0.2); setScore(k > 0.2 ? 50 : 48, 49, '0:00', k > 0.2 && Math.sin(t * 20) > 0);
    ballAt(RIM_G.clone().add(new THREE.Vector3(0, 0.15 - k * 3.2, 0)));
    if (k > 0.18 && k < 0.35) effects.flash(0.5 * (1 - (k - 0.18) / 0.17));
    cam([1.6, 2.3, 9.8], [1.4, 2.4, 10.2], [0, 2.9, 12.35], [0, 2.8, 12.35], ease(k), 44);
  },
  coach_tell(t, d, k) {
    show('gym', 'day'); setCrowd(t, true); setScore(50, 49, '0:00'); setConfetti(t);
    coach.place(-0.6, 0.05, 1, Math.PI / 2 - 0.3); coach.say(t, 'talk', 'smile'); coach.pose({ t, armR: [-0.6, 0, -0.3] });
    kidJ.place(0.9, 0.05, 1.2, -Math.PI / 2 + 0.3); kidJ.expr = 'happy'; kidJ.pose({ t });
    cam([0.2, 2.4, 5.5], [0.2, 2.3, 4.4], [0.1, 2.2, 1], [0.1, 2.2, 1], ease(k), 50);
  },
  moe_photo(t, d, k) {
    show('gym', 'day'); setCrowd(t, false);
    photo.position.set(0, 2.0, -12); photo.rotation.set(0, 0, 0); photo.visible = true;
    effects.darken(0.15);
    cam([0.2, 2.1, -10.6], [0.1, 2.05, -10.95], [0, 2.0, -12], [0, 2.0, -12], ease(k), 42);
  },
  moe_alone(t, d, k) {
    outdoors('B', true);
    moe.place(80 - 9.3, 0.12, 0, Math.PI / 2); moe.expr = 'sad'; moe.pose({ sit: true, t, headX: 0.35, armR: [-0.9, 0, 0.3] });
    cam([80 - 3, 2.4, 4.5], [80 - 4, 2.2, 3.6], [80 - 9.2, 1.4, 0], [80 - 9.2, 1.5, 0], ease(k), 48);
  },
  moe_light(t, d, k) {
    outdoors('B', k > 0.4);
    moe.place(80 + 9.6, 0.05, -15.0, Math.PI); moe.expr = 'smile'; moe.pose({ t, armR: [-1.6, 0, 0.2] });
    if (k > 0.4 && k < 0.5) effects.flash(0.3, '255,245,210');
    cam([80 + 6.8, 2.2, -17.0], [80 + 7.0, 2.6, -16.8], [80 + 9.7, 1.8, -15.3], [80 + 9.5, 4.5, -15.0], ease(k), 50);
  },
  kid_moe(t, d, k) {
    outdoors('B', true);
    moe.place(80 - 0.8, 0.05, 6, 0.4); moe.expr = 'happy'; moe.pose({ t, armL: [-0.4, 0, 0.3] });
    kid.place(80 + 0.6, 0.05, 6.2, -0.4); kid.expr = 'happy'; kid.pose({ t, armR: [-0.9, 0, -0.2], armL: [-0.5, 0, 0.6] }); ballAt(handPos(kid, 1).add(new THREE.Vector3(0, 0.1, 0.3)));
    cam([80 - 0.1, 2.3, 10.5], [80 - 0.1, 2.3, 9.4], [80 - 0.1, 2.0, 6], [80 - 0.1, 2.0, 6], ease(k), 48);
  },
  end_court(t, d, k) {
    outdoors('B', true);
    moe.place(80 - 2, 0.05, 7, 0); moe.expr = 'happy'; moe.pose({ t, armL: [-2.8, 0, 0.2], armR: [-2.8, 0, -0.2] });
    kid.place(80 + 1.5, 0.05, 6, 0); kid.expr = 'happy'; kid.pose({ t, armL: [-2.8, 0, 0.2], armR: [-2.9, 0, -0.2], jump: t * 4 });
    const rel = (t * 0.6) % 1; ballAt(arc(new THREE.Vector3(80 + 1.5, 3.2, 6.3), RIM_B.clone().add(new THREE.Vector3(0, 0.1, 0)), rel, 2.4));
    cam([80 + 6, 3, 0], [80 + 26, 30, -26], [80, 2, 6], [80, 0, 2], ease(k), 52);
  },
};
function teamOnCourt(t) {
  team.forEach((p, i) => { p.place(-4 + i * 2.6, 0.05, 2 + Math.sin(t + i) * 2, 0); p.expr = 'determined'; p.pose({ walk: t * 8 + i, amp: 0.55, t }); });
  rivals.forEach((p, i) => { p.place(-5 + i * 2.4, 0.05, 4 + Math.cos(t + i) * 2, Math.PI); p.expr = 'angry'; p.pose({ walk: t * 8 + i + 1, amp: 0.55, t }); });
  kidJ.place(0.5, 0.05, 6, 0); kidJ.expr = 'determined'; kidJ.pose({ walk: t * 9, amp: 0.6, t });
  ballAt(handPos(kidJ, 1).add(new THREE.Vector3(0, -0.5 + Math.abs(Math.sin(t * 7)) * 0.5, 0.3)));
}

E.run({ timings: T, shots: S, captionStyle: 'lime' });
