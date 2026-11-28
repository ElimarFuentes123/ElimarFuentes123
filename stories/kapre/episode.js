// Episode: KAPRE — "If you smell cigar smoke under a balete tree at night, don't look up."
// Filipino-folklore night-horror short (style: references/scary_tails/STYLE.md)
import * as E from '../engine/engine.js';
const { THREE, cam: camRaw, ease, easeOut, clamp01, lerp, show, makeChar, headPos, handPos, effects, box, cyl, sphere, mat, canvasTex, rng, camera, W, H } = E;

const T = await (await fetch('build/timings.json')).json();
// medium shots like the references: push any camera closer than 5.5 units back along its view line
function cam(p0, p1, l0, l1, k, fov = 50) {
  const back = (p, l) => { const v = new THREE.Vector3(...p).sub(new THREE.Vector3(...l)); const d = v.length(); if (d < 5.5) v.setLength(lerp(d * 1.55, 5.5, clamp01((d - 3.5) / 2))); return new THREE.Vector3(...l).add(v).toArray(); };
  camRaw(back(p0, l0), back(p1, l1), l0, l1, k, Math.min(58, fov + 6));
}
const S = await (await fetch('script.json')).json();
await document.fonts.load('700 80px Osw');

// ---------- cast ----------
const SKIN = '#a8714a';
const numTex = (n, col = '#ffffff') => canvasTex(256, 256, (g) => { g.fillStyle = col; g.font = '700 200px Osw'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, 128, 138); });
const jun = makeChar({ shirt: '#c62f2f', pants: '#1d2433', shoes: '#e8e8e8', skin: SKIN, hair: '#141414', hairType: 'kid', logo: numTex('7') });
// same shirt, inside out: faded color, seams and the care tag showing
const junIn = makeChar({ shirt: '#d9a3a3', pants: '#1d2433', shoes: '#e8e8e8', skin: SKIN, hair: '#141414', hairType: 'kid', logo: canvasTex(256, 256, (g) => { g.strokeStyle = '#9b6a6a'; g.lineWidth = 8; g.setLineDash([16, 10]); g.strokeRect(14, 14, 228, 228); g.fillStyle = '#ffffff'; g.fillRect(104, 6, 48, 44); }) });
const adult = makeChar({ shirt: '#cfd3da', pants: '#2a2a34', shoes: '#3a3a3a', skin: SKIN, hair: '#141414', hairType: 'dad', mustache: '#1a1a1a',
  logo: canvasTex(256, 256, (g) => { g.strokeStyle = '#8f949c'; g.lineWidth = 8; g.setLineDash([16, 10]); g.strokeRect(14, 14, 228, 228); g.fillStyle = '#ffffff'; g.fillRect(104, 6, 48, 44); }) });
const lola = makeChar({ shirt: '#7a3b5a', pants: '#4a3a40', shoes: '#3b2a22', skin: '#9c6a48', hair: '#dcdcdc', hairType: 'bob', glasses: true });
const allJun = [jun, junIn];
const ball = sphere(0.36, mat('#d9661f', { roughness: 0.7 }), 0, 0, 0, null, 20); E.scene.add(ball); E.prop(ball);
const phone = box(0.2, 0.42, 0.06, mat('#111', { emissive: '#7fb6ff', emissiveIntensity: 0.25 }), 0, 0, 0, null, false); E.scene.add(phone); E.prop(phone);

// ---------- textures ----------
const soft = (r, g, b) => canvasTex(128, 128, (c) => { const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(0.4, `rgba(${r},${g},${b},0.45)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); });
const smokeTex = soft(190, 196, 210), glowTex = soft(255, 170, 90), flyTex = soft(220, 255, 140);
const glowSprite = (color, size) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.scale.setScalar(size); return s; };

// ---------- the barrio road set ----------
const TREE = new THREE.Vector3(6.2, 0, -10);           // balete trunk base
const HOME = new THREE.Vector3(-7.5, 0, 34);           // our house (porch light)
const set = new THREE.Group();
{
  const r = rng(5);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), mat('#26331f', { roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; set.add(ground);
  box(4.2, 0.04, 400, mat('#5d4d3a', { roughness: 1 }), 0, 0.02, 0, set, false);
  for (let i = 0; i < 70; i++) box(0.3 + r() * 0.5, 0.05, 0.3 + r() * 0.6, mat('#4a3d2e'), (r() - 0.5) * 3.6, 0.03, (r() - 0.5) * 160, set, false);
  // grass tufts
  const tuft = new THREE.ConeGeometry(0.06, 0.9, 4); const gm = mat('#3f5a2c', { roughness: 1 });
  const im = new THREE.InstancedMesh(tuft, gm, 2600); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < 2600; i++) {
    let x = (r() - 0.5) * 70; if (Math.abs(x) < 2.4) x += Math.sign(x || 1) * 2.4;
    const z = (r() - 0.5) * 160, s = 0.5 + r() * 1.1;
    q.setFromEuler(e.set((r() - 0.5) * 0.5, 0, (r() - 0.5) * 0.5));
    m4.compose(new THREE.Vector3(x, 0.35 * s, z), q, new THREE.Vector3(s, s, s)); im.setMatrixAt(i, m4);
  }
  im.castShadow = true; im.receiveShadow = true; set.add(im);
  // banana plants
  const banana = (x, z, s = 1) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = r() * 6; set.add(g);
    cyl(0.16, 0.22, 2.6, mat('#5d6b3a'), 0, 1.3, 0, g, 8);
    const lm = mat('#3c6b2e', { side: THREE.DoubleSide, roughness: 0.9 });
    for (let k = 0; k < 6; k++) { const p = new THREE.Group(); p.position.y = 2.5; p.rotation.y = k * 1.05; g.add(p); const l = box(0.7, 0.03, 2.4, lm, 0, 0.2, 1.1, p); l.rotation.x = -0.55 + (k % 2) * 0.25; }
  };
  // coconut palm
  const palm = (x, z, s = 1) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); set.add(g);
    for (let k = 0; k < 8; k++) { const seg = cyl(0.2, 0.24, 1.3, mat('#6b5a44'), Math.sin(k * 0.25) * 0.5, 0.65 + k * 1.25, 0, g, 8); seg.rotation.z = -0.06; }
    const lm = mat('#33552a', { side: THREE.DoubleSide });
    for (let k = 0; k < 8; k++) { const p = new THREE.Group(); p.position.set(1.0, 10.2, 0); p.rotation.y = k * 0.785; g.add(p); const l = box(0.6, 0.03, 3.6, lm, 0, -0.5, 1.6, p); l.rotation.x = 0.45; }
  };
  // bahay kubo (nipa hut on stilts) with warm window
  const kubo = (x, z, ry, lit = true) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; set.add(g);
    const bam = mat('#a8844f'), dark = mat('#6b5233');
    for (const [a, b] of [[-2.4, -2], [2.4, -2], [-2.4, 2], [2.4, 2]]) box(0.25, 1.4, 0.25, dark, a, 0.7, b, g);
    box(5.4, 0.2, 4.6, dark, 0, 1.45, 0, g);
    box(5.0, 2.6, 4.2, bam, 0, 2.85, 0, g);
    const tri = new THREE.Shape(); tri.moveTo(-3.4, 0); tri.lineTo(3.4, 0); tri.lineTo(0, 2.8); tri.closePath();
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 5.6, bevelEnabled: false }), mat('#7a6038', { roughness: 1 })); roof.position.set(0, 4.1, -2.8); roof.castShadow = true; g.add(roof);
    box(1.4, 1.1, 0.1, lit ? mat('#ffcf8a', { emissive: '#ffa64a', emissiveIntensity: 1.6 }) : mat('#1a140c'), 1.2, 3.0, 2.12, g, false);
    box(1.0, 1.9, 0.1, mat('#4a3622'), -1.2, 2.5, 2.12, g, false);
    box(1.4, 0.15, 1.6, dark, -1.2, 0.85, 2.9, g); box(1.4, 0.15, 1.0, dark, -1.2, 0.35, 3.4, g);
    return g;
  };
  // houses along the road
  kubo(-9, 20, Math.PI / 2); kubo(9.5, 46, -Math.PI / 2, false); kubo(-10, 58, Math.PI / 2); kubo(10, -44, -Math.PI / 2, false); kubo(-11, -58, Math.PI / 2);
  const home = kubo(HOME.x - 1.5, HOME.z, Math.PI / 2); set.userData.home = home;
  const porch = new THREE.PointLight('#ffb35a', 0, 20, 1.2); porch.position.set(HOME.x + 1.6, 4.2, HOME.z + 1.2); set.add(porch); set.userData.porch = porch;
  const bulb = sphere(0.18, mat('#fff1c4', { emissive: '#ffc061', emissiveIntensity: 3 }), HOME.x + 1.1, 4.0, HOME.z + 1.2, set, 10); set.userData.bulb = bulb;
  const bulbGlow = glowSprite('#ffb560', 3.2); bulbGlow.position.copy(bulb.position); set.add(bulbGlow); set.userData.bulbGlow = bulbGlow;
  // doorstep for the ash
  box(1.6, 0.2, 1.4, mat('#6b5233'), HOME.x + 3.2, 0.1, HOME.z - 1.2, set);
  for (let i = 0; i < 18; i++) { const z = -70 + i * 8 + r() * 3; if (Math.abs(z - TREE.z) < 10) continue; if (r() < 0.5) banana(-5 - r() * 6, z, 0.9 + r() * 0.5); else banana(5 + r() * 7, z, 0.9 + r() * 0.5); }
  palm(-14, -20, 1); palm(15, 10, 1.1); palm(-16, 40, 1); palm(14, -30, 0.95); palm(-15, 4, 1.05);
  // distant tree line
  for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = 45 + r() * 30; const t = sphere(4 + r() * 4, mat('#18231a', { roughness: 1 }), Math.cos(a) * d, 2 + r() * 3, Math.sin(a) * d, set, 8); t.castShadow = false; }
}

// ---------- the balete tree ----------
const balete = new THREE.Group(); balete.position.copy(TREE); set.add(balete);
{
  const r = rng(21);
  const bark = mat('#4b4033', { roughness: 1 }), bark2 = mat('#3c3329', { roughness: 1 });
  for (let i = 0; i < 14; i++) { // braided strangler-fig trunk
    const a = (i / 14) * 6.28, rad = 1.1 + r() * 0.5;
    const s = cyl(0.35 + r() * 0.25, 0.55 + r() * 0.3, 9 + r() * 2, i % 2 ? bark : bark2, Math.cos(a) * rad * 0.7, 4.6, Math.sin(a) * rad * 0.7, balete, 7);
    s.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12);
  }
  cyl(1.4, 2.2, 9, bark2, 0, 4.5, 0, balete, 10);
  for (let i = 0; i < 9; i++) { // buttress roots
    const a = (i / 9) * 6.28 + r() * 0.3, len = 2.5 + r() * 2.2;
    const root = box(0.5, 0.6 + r() * 0.4, len, bark, Math.cos(a) * (1.4 + len / 2), 0.25, Math.sin(a) * (1.4 + len / 2), balete);
    root.rotation.y = -a + Math.PI / 2; root.rotation.x = 0.12;
  }
  // big limbs
  const limb = (a, y, len, tilt) => { const p = new THREE.Group(); p.position.y = y; p.rotation.y = a; balete.add(p); const l = cyl(0.3, 0.55, len, bark, 0, 0, len / 2, p, 7); l.rotation.x = Math.PI / 2 - tilt; return p; };
  [[0.3, 8, 6, 0.35], [2.0, 8.6, 6, 0.4], [3.4, 7.8, 5.5, 0.3], [4.8, 8.8, 6.5, 0.45], [-1.0, 9.6, 5, 0.6]].forEach((v) => limb(...v));
  // canopy
  const lm = [mat('#1f3322', { roughness: 1 }), mat('#253d27', { roughness: 1 }), mat('#1a2a1c', { roughness: 1 })];
  for (let i = 0; i < 30; i++) { const a = r() * 6.28, d = r() * 7.5, x = Math.cos(a) * d, z = Math.sin(a) * d; const rad = 2.2 + r() * 2, y = 12.8 + r() * 4; if (Math.hypot(x + 4.3, z - 1.5) < 3.2) continue; sphere(rad, lm[i % 3], x, y, z, balete, 10); }
  // hanging aerial roots
  const am = mat('#5a4c3c', { roughness: 1 });
  for (let i = 0; i < 46; i++) { const a = r() * 6.28, d = 2.2 + r() * 6, len = 3 + r() * 6; if (Math.hypot(Math.cos(a) * d + 4.3, Math.sin(a) * d - 1.5) < 3) continue; cyl(0.04, 0.05, len, am, Math.cos(a) * d, 10.5 - len / 2, Math.sin(a) * d, balete, 4); }
}

// ---------- the kapre (sits on a limb facing the road) ----------
const kapre = new THREE.Group(); balete.add(kapre); kapre.position.set(-4.3, 5.0, 1.5); kapre.rotation.y = -1.25;
{ const lb = cyl(0.45, 0.75, 5.2, mat('#4b4033', { roughness: 1 }), -2.4, 4.3, 1.2, balete, 8); lb.rotation.z = Math.PI / 2 - 0.12; }
const kp = {};
{
  const skin = mat('#4a3324', { roughness: 0.9 }), hair = mat('#120d0a', { roughness: 1 }), cloth = mat('#3e2c1d', { roughness: 1 });
  const rim = new THREE.PointLight('#7f9cff', 6, 16, 1.2); rim.position.set(2.5, 5, -3.5); kapre.add(rim); kp.rim = rim;
  const fill = new THREE.PointLight('#ff8a4a', 1.3, 10, 1.4); fill.position.set(0, 3.5, 3.5); kapre.add(fill); kp.fill = fill;
  box(2.6, 3.2, 1.6, skin, 0, 1.8, 0, kapre);                       // torso
  box(2.7, 1.0, 1.7, cloth, 0, 0.3, 0, kapre);                      // loincloth
  for (const s of [-1, 1]) { const leg = box(0.9, 5.0, 0.9, skin, s * 0.75, -2.2, 0.6, kapre); leg.rotation.x = 0.15; }
  const head = new THREE.Group(); head.position.set(0, 4.2, 0.1); kapre.add(head); kp.head = head;
  box(1.6, 1.9, 1.5, skin, 0, 0, 0, head);
  box(1.9, 1.2, 1.9, hair, 0, 0.75, -0.1, head); box(1.9, 2.6, 0.5, hair, 0, -0.4, -0.8, head);
  for (const s of [-1, 1]) box(0.35, 2.4, 1.4, hair, s * 0.95, -0.3, -0.2, head);
  const beard = box(1.3, 1.5, 0.4, hair, 0, -1.2, 0.65, head);
  const eyeM = new THREE.MeshBasicMaterial({ color: '#ffb02e', fog: false, toneMapped: false });
  kp.eyes = [-0.36, 0.36].map((x) => { const e = sphere(0.11, eyeM, x, 0.25, 0.77, head, 10); e.castShadow = false; const g = glowSprite('#ff8a1e', 0.9); g.position.set(x, 0.25, 0.9); head.add(g); return [e, g]; });
  const arm = new THREE.Group(); arm.position.set(1.4, 3.0, 0); kapre.add(arm); kp.arm = arm;
  box(0.8, 3.0, 0.8, skin, 0, -1.4, 0, arm);
  arm.rotation.set(-2.2, 0, 0.45);
  for (const s of [-1]) { const a2 = box(0.8, 3.0, 0.8, skin, s * 1.4, 1.6, 0.4, kapre); a2.rotation.x = -0.5; }
  // cigar held at the mouth
  const cig = new THREE.Group(); cig.position.set(0.25, -0.55, 0.85); head.add(cig); kp.cig = cig;
  const c = cyl(0.08, 0.09, 0.9, mat('#5a3a1e'), 0, 0, 0.4, cig, 8); c.rotation.x = Math.PI / 2;
  kp.tipM = new THREE.MeshBasicMaterial({ color: '#ff6a1a', fog: false });
  kp.tip = sphere(0.1, kp.tipM, 0, 0, 0.88, cig, 8);
  kp.tipGlow = glowSprite('#ff6a1a', 1.6); kp.tipGlow.position.set(0, 0, 0.9); cig.add(kp.tipGlow);
  kp.light = new THREE.PointLight('#ff5a1a', 0, 9, 1.4); kp.light.position.set(0, 0, 1.2); cig.add(kp.light);
}
const tipWorld = () => { balete.updateMatrixWorld(true); return kp.tip.getWorldPosition(new THREE.Vector3()); };
const eyesWorld = () => { balete.updateMatrixWorld(true); return kp.head.localToWorld(new THREE.Vector3(0, 0.2, 0.8)); };
// visibility of the giant: 0 = hidden (only ember), eyes on/off, body on/off
function kapreState({ body = false, eyes = 0, ember = 1, t = 0 }) {
  kapre.children.forEach((c) => { if (c !== kp.head && c !== kp.arm) c.visible = body; });
  kp.head.children.forEach((c) => { if (c !== kp.cig) c.visible = body; });
  kp.arm.visible = body; kp.rim.visible = body; kp.fill.visible = body;
  kp.eyes.forEach(([e, g]) => { e.visible = eyes > 0; g.visible = eyes > 0; g.material.opacity = eyes; e.material.color.setRGB(1 * eyes, 0.62 * eyes, 0.12 * eyes); });
  const pulse = 0.75 + 0.25 * Math.sin(t * 3.1) + 0.1 * Math.sin(t * 11);
  kp.cig.visible = ember > 0; kp.tipGlow.material.opacity = ember * pulse; kp.light.intensity = ember * pulse * 3.5;
  kp.tipGlow.scale.setScalar(1.3 + pulse * 0.8);
}
E.addSet('barrio', set);

// ---------- smoke + fireflies ----------
const smoke = (() => {
  const N = 260, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ size: 2.6, map: smokeTex, transparent: true, depthWrite: false, opacity: 0.18, color: '#c3c8d6' }));
  p.frustumCulled = false; E.scene.add(p); E.prop(p);
  const r = rng(31), seeds = Array.from({ length: N }, () => [r(), r(), r(), r()]);
  // mode: 'rise' from a point (cigar) or 'ground' drifting low around a point
  p.userData.set = (time, at, { mode = 'ground', spread = 6, amount = 1, opacity = 0.18 } = {}) => {
    p.visible = amount > 0; p.material.opacity = opacity;
    const n = Math.floor(N * clamp01(amount));
    seeds.forEach(([a, b, c, d], i) => {
      if (i >= n) { pos.set([0, -99, 0], i * 3); return; }
      const ph = (time * (0.05 + d * 0.06) + a) % 1;
      if (mode === 'rise') pos.set([at.x + Math.sin(ph * 6 + c * 9) * ph * 1.8, at.y + ph * 4.5, at.z + Math.cos(ph * 5 + b * 9) * ph * 1.8], i * 3);
      else pos.set([at.x + (a - 0.5) * spread * 2 + Math.sin(time * 0.3 + c * 9) * 1.5, 0.3 + b * 2.2 + ph * 0.6, at.z + (c - 0.5) * spread * 2 + time * 0.25 * (d - 0.5)], i * 3);
    });
    geo.attributes.position.needsUpdate = true;
  };
  return p;
})();
const flies = (() => {
  const N = 60, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.28, map: flyTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#d8ff8a', fog: false }));
  p.frustumCulled = false; E.scene.add(p); E.prop(p);
  const r = rng(44), seeds = Array.from({ length: N }, () => [r(), r(), r(), r()]);
  p.userData.update = (time) => {
    const c = E.camAt();
    seeds.forEach(([a, b, cc, d], i) => pos.set([c.x + (a - 0.5) * 22 + Math.sin(time * 0.7 + d * 20) * 0.8, 0.4 + b * 4 + Math.sin(time * 1.3 + a * 30) * 0.3, c.z + (cc - 0.5) * 22 + Math.cos(time * 0.6 + b * 20) * 0.8], i * 3));
    p.material.opacity = 0.6 + 0.4 * Math.sin(time * 4);
    geo.attributes.position.needsUpdate = true;
  };
  return p;
})();

// ---------- shot helpers ----------
let fxState = {};
function night(t, { porch = 0, ember = 1, eyes = 0, body = false, firefly = true } = {}) {
  show('barrio', 'horror');
  set.userData.porch.intensity = porch * 3.2; set.userData.bulbGlow.visible = porch > 0; set.userData.bulbGlow.material.opacity = porch;
  set.userData.bulb.material.emissiveIntensity = porch * 3;
  kapreState({ body, eyes, ember, t });
  flies.visible = firefly;
  fxState = {};
}
const walkZ = (z0, speed, t) => z0 + speed * t;
function walker(ch, x, z, ry, t, { amp = 0.6, rate = 7, ...p } = {}) { ch.place(x, 0, z, ry); ch.pose({ walk: t * rate, amp, t, ...p }); return ch; }
const T3 = (v) => v.toArray();
const H0 = (ch, dy = 0.4) => headPos(ch, dy);
function holdBall(ch) { ball.visible = true; ball.position.copy(handPos(ch, 0)).add(new THREE.Vector3(0, -0.1, 0.15)); }
function inTree(off) { return TREE.clone().add(new THREE.Vector3(...off)); }

// ---------- shots ----------
const shots = {
  hook_tree(t, d, k) { night(t, { ember: 1 }); smoke.userData.set(t, tipWorld(), { mode: 'rise', amount: 0.6, opacity: 0.14 }); cam(T3(inTree([-9, 1.2, 14])), T3(inTree([-7.5, 2.5, 11])), T3(inTree([-2, 6, 0])), T3(inTree([-2, 7.5, 0])), ease(k), 52); },
  smoke_roots(t, d, k) { night(t); smoke.userData.set(t, inTree([-2, 0, 2]), { spread: 4, amount: 0.9, opacity: 0.2 }); cam(T3(inTree([-6, 0.8, 5])), T3(inTree([-5, 0.9, 3.8])), T3(inTree([0, 1.2, 0])), T3(inTree([0, 1.6, 0])), ease(k), 46); },
  roots_low(t, d, k) { night(t); cam([0.6, 0.7, -3.5], [1.6, 0.8, -4.2], T3(inTree([-1, 1.5, 0])), T3(inTree([-1, 2.6, 0])), ease(k), 44); },
  kapre_eyes(t, d, k) { night(t, { eyes: clamp01(k * 2.2), ember: 1 }); const e = eyesWorld(); cam(T3(e.clone().add(new THREE.Vector3(-5.6, -0.9, 2.4))), T3(e.clone().add(new THREE.Vector3(-4.6, -0.7, 2.0))), T3(e), T3(e), ease(k), 40); effects.darken(0.15); },
  kapre_reveal(t, d, k) { night(t, { eyes: 1, body: true }); smoke.userData.set(t, tipWorld(), { mode: 'rise', amount: 0.8, opacity: 0.16 }); cam(T3(inTree([-17, 1.4, 6])), T3(inTree([-15, 2.0, 5.5])), T3(inTree([-4.3, 5.5, 1.5])), T3(inTree([-4.3, 6.8, 1.5])), ease(k), 52); },
  loop_top(t, d, k) {
    night(t, { eyes: 0 }); const a = -1.2 + k * 4.5, R = 9;
    walker(jun, TREE.x + Math.cos(a) * R, TREE.z + Math.sin(a) * R, -a, t, { amp: 0.6 }); jun.expr = 'worried';
    smoke.userData.set(t, TREE, { spread: 9, amount: 0.5, opacity: 0.12 });
    cam(T3(inTree([-19, 13, 15])), T3(inTree([-17, 12, 13])), T3(TREE), T3(TREE), ease(k), 50);
  },
  tree_return(t, d, k) { night(t); walker(jun, -0.3, -24 + k * 6, 0, t); jun.expr = 'confused'; cam(T3(inTree([-8, 1.6, 9])), T3(inTree([-8.4, 1.6, 7.5])), T3(inTree([-4, 4.5, 0])), T3(inTree([-3, 5, 0])), ease(k), 50); },
  lola_porch(t, d, k) {
    night(t, { porch: 1, ember: 0 }); lola.place(HOME.x + 2.6, 0.95, HOME.z + 1.6, Math.PI / 2 + 0.3); lola.pose({ t, sit: true }); lola.say(t, 'talk', 'worried');
    cam([HOME.x + 7, 2.6, HOME.z + 5], [HOME.x + 6.2, 2.4, HOME.z + 4], [HOME.x + 2.6, 2.4, HOME.z + 1.6], [HOME.x + 2.6, 2.5, HOME.z + 1.6], ease(k), 46);
  },
  lola_close(t, d, k) {
    night(t, { porch: 1, ember: 0 }); lola.place(HOME.x + 2.6, 0.95, HOME.z + 1.6, Math.PI / 2 + 0.3); lola.pose({ t, sit: true, armR: [-1.5 + Math.sin(t * 5) * 0.15, 0, -0.3] }); lola.say(t, 'talk', 'worried');
    const h = H0(lola); cam([h.x + 2.4, h.y + 0.1, h.z + 1.3], [h.x + 2.0, h.y, h.z + 1.1], T3(h), T3(h), ease(k), 44);
  },
  jun_intro(t, d, k) {
    night(t, { ember: 0.6 }); walker(jun, 0, -30 + t * 1.6, 0, t, { amp: 0.5 }); jun.expr = 'smile'; holdBall(jun);
    const h = H0(jun); cam([h.x - 1.2, h.y + 0.2, h.z + 4.2], [h.x - 0.9, h.y + 0.1, h.z + 3.6], [h.x, h.y - 0.4, h.z], [h.x, h.y - 0.3, h.z], ease(k), 46);
    fxState.tag = { ch: jun, name: 'JUN', sub: 'MY KUYA, 16' };
  },
  jun_walk_wide(t, d, k) { night(t, { ember: 1 }); walker(jun, -0.4, -26 + t * 1.8, 0, t); jun.expr = 'smile'; holdBall(jun); cam(T3(inTree([-12, 3, -4])), T3(inTree([-11, 3.4, -2])), [-0.4, 2, -22 + t * 1.8], [-0.4, 3, -20 + t * 1.8], ease(k), 50); },
  jun_walk_track(t, d, k) { night(t); walker(jun, -0.4, -21 + t * 1.8, 0, t); jun.expr = 'smile'; holdBall(jun); const h = H0(jun); cam([h.x + 2.5, h.y - 0.6, h.z + 3.2], [h.x + 2.5, h.y - 0.5, h.z + 3.2], [h.x, h.y - 0.6, h.z], [h.x, h.y - 0.5, h.z], k, 48); },
  smoke_drift(t, d, k) { night(t); smoke.userData.set(t, new THREE.Vector3(-0.4, 0, -17), { spread: 3.5, amount: 1, opacity: 0.22 }); cam([-2.5, 0.8, -13.5], [-1.5, 0.9, -13.5], [-0.4, 1.0, -18], [-0.2, 1.1, -18], ease(k), 46); },
  jun_sniff(t, d, k) { night(t); jun.place(-0.4, 0, -17, 0.4); jun.pose({ t, headX: -0.1, headY: Math.sin(t * 2) * 0.3 }); jun.expr = 'confused'; holdBall(jun); smoke.userData.set(t, new THREE.Vector3(-0.4, 0, -17), { spread: 3, amount: 1, opacity: 0.2 }); const h = H0(jun); cam([h.x + 0.6, h.y, h.z + 2.4], [h.x + 0.5, h.y, h.z + 2.0], T3(h), T3(h), ease(k), 42); },
  jun_lookup(t, d, k) { night(t); jun.place(-0.4, 0, -14, 1.3); jun.pose({ t, headX: -0.55 * ease(k * 2) }); jun.expr = 'confused'; holdBall(jun); const h = H0(jun); cam([h.x - 1.5, h.y - 1.3, h.z - 1.8], [h.x - 1.3, h.y - 1.4, h.z - 1.5], T3(tipWorld()), T3(tipWorld().add(new THREE.Vector3(0, 0.5, 0))), ease(k), 56); },
  ember_high(t, d, k) { night(t, { ember: 1 }); smoke.userData.set(t, tipWorld(), { mode: 'rise', amount: 0.6, opacity: 0.14 }); const e = tipWorld(); cam(T3(e.clone().add(new THREE.Vector3(-6, -3, 7))), T3(e.clone().add(new THREE.Vector3(-3.5, -1.6, 4))), T3(e), T3(e), ease(k), 40); effects.darken(0.1); },
  jun_laugh(t, d, k) { night(t); jun.place(-0.2, 0, -13, 1.6); jun.pose({ t, lean: -0.15, bodyZ: Math.sin(t * 14) * 0.03, armL: [-0.4, 0, 0.3] }); jun.expr = 'laugh'; holdBall(jun); const h = H0(jun); cam([h.x + 2.2, h.y - 0.2, h.z + 2.6], [h.x + 1.9, h.y - 0.1, h.z + 2.2], T3(h), T3(h), ease(k), 44); },
  jun_kick(t, d, k) {
    night(t); const kk = Math.sin(clamp01((k - 0.35) * 3) * Math.PI); jun.place(2.4, 0, -12.2, 1.75); jun.pose({ t, armR: [-0.6, 0, -0.3] }); jun.expr = 'grin';
    jun.legs[1].rotation.x = -1.2 * kk; holdBall(jun); effects.shake(kk > 0.8 ? 0.06 : 0);
    cam([2.0, 1.2, -7.5], [2.3, 1.1, -8.3], [3.6, 1.0, -12], [3.6, 1.0, -12], ease(k), 46);
  },
  ember_out(t, d, k) { const o = 1 - clamp01((k - 0.25) * 5); night(t, { ember: o }); const e = tipWorld(); cam(T3(e.clone().add(new THREE.Vector3(-3.2, -1.2, 3.8))), T3(e.clone().add(new THREE.Vector3(-3.0, -1.1, 3.5))), T3(e), T3(e), k, 40); effects.darken(0.15 + 0.4 * (1 - o)); },
  jun_walk_on(t, d, k) { night(t, { ember: 0 }); walker(jun, -0.3, -8 + t * 2.0, 0, t, { amp: 0.65, rate: 8 }); jun.expr = 'worried'; holdBall(jun); const h = H0(jun); cam([h.x + 0.4, h.y - 0.3, h.z + 3.6], [h.x + 0.4, h.y - 0.3, h.z + 3.6], [h.x, h.y - 0.5, h.z], [h.x, h.y - 0.5, h.z], k, 48); },
  back_at_tree(t, d, k) { night(t, { ember: 0 }); jun.place(-0.4, 0, -14 + ease(k) * 1.2, 0); jun.pose({ t, amp: 0.3, walk: t * 5 }); jun.expr = 'shock'; holdBall(jun); cam([-0.6, 2.0, -4], [-0.5, 2.2, -6.5], T3(inTree([-4, 3.5, -2])), T3(inTree([-3, 5, -2])), ease(k), 52); },
  jun_turn(t, d, k) { night(t, { ember: 0 }); const ry = lerp(0, Math.PI, ease(k * 1.6)); walker(jun, -0.4, -13 - (k > 0.6 ? (k - 0.6) * 4 : 0), ry, t, { amp: k > 0.6 ? 0.7 : 0.2, rate: 9 }); jun.expr = 'worried'; holdBall(jun); const h = H0(jun); cam([h.x - 2.4, h.y + 0.3, h.z + 1.4], [h.x - 2.6, h.y + 0.3, h.z + 1.6], T3(h), T3(h), k, 46); },
  tree_again(t, d, k) { night(t, { ember: 0 }); jun.place(-0.5, 0, -5.4, Math.PI); jun.pose({ t }); jun.expr = 'shock'; holdBall(jun); const h = H0(jun); cam([h.x + 1.0, h.y + 0.1, h.z - 2.6], [h.x + 0.8, h.y + 0.1, h.z - 1.8], T3(h), T3(h), ease(k), 44); effects.shake(0.012); },
  loop_smoke(t, d, k) { night(t, { ember: 0 }); const a = 0.4 + k * 5, R = 7.5; walker(jun, TREE.x + Math.cos(a) * R, TREE.z + Math.sin(a) * R, -a, t, { rate: 9 }); jun.expr = 'worried'; holdBall(jun); smoke.userData.set(t, TREE, { spread: 9, amount: 0.6 + k * 0.4, opacity: 0.16 + k * 0.08 }); cam(T3(inTree([-18, 14, -13])), T3(inTree([-16, 12, -11])), T3(TREE), T3(TREE), ease(k), 48); },
  smoke_thick(t, d, k) { night(t, { ember: 0 }); jun.place(-0.4, 0, -12, 0.6); jun.pose({ t, armR: [-1.6, 0, -0.4], headX: 0.1 }); jun.expr = 'worried'; holdBall(jun); smoke.userData.set(t, new THREE.Vector3(-0.4, 0, -12), { spread: 4, amount: 1, opacity: 0.3 + k * 0.1 }); const h = H0(jun); cam([h.x + 1.5, h.y - 0.2, h.z + 3.5], [h.x + 1.2, h.y - 0.2, h.z + 2.9], T3(h), T3(h), ease(k), 46); },
  canopy_laugh(t, d, k) { night(t, { eyes: clamp01(k * 3), ember: 0.4, body: true }); const e = eyesWorld(); cam(T3(e.clone().add(new THREE.Vector3(-5.5, -4.5, 6))), T3(e.clone().add(new THREE.Vector3(-4.8, -3.8, 5.2))), T3(e), T3(e), ease(k), 46); effects.shake(0.05 * Math.sin(k * Math.PI)); effects.darken(0.2); },
  jun_terror(t, d, k) { night(t, { ember: 0.3 }); jun.place(-0.4, 0, -12, 1.4); jun.pose({ t, headX: -0.4, lean: 0.12, armL: [-0.3, 0, 0.5], armR: [-0.3, 0, -0.5] }); jun.expr = 'shock'; holdBall(jun); const h = H0(jun); cam([h.x + 1.6, h.y - 1.0, h.z + 1.0], [h.x + 1.4, h.y - 0.9, h.z + 0.85], T3(h), T3(h), ease(k), 40); effects.shake(0.02); },
  lola_memory(t, d, k) {
    night(t, { porch: 1, ember: 0 }); lola.place(HOME.x + 2.6, 0.95, HOME.z + 1.6, Math.PI / 2 + 0.3); lola.pose({ t, sit: true, armR: [-1.5, 0, -0.3] }); lola.say(t, 'talk', 'worried');
    const h = H0(lola); cam([h.x + 2.6, h.y + 0.2, h.z + 1.5], [h.x + 2.2, h.y + 0.1, h.z + 1.2], T3(h), T3(h), ease(k), 44);
    effects.gray(0.85); effects.flash(Math.max(0, 0.5 - t * 1.5));
  },
  jun_shirt(t, d, k) {
    night(t, { ember: 0 }); const flip = k > 0.55; const ch = flip ? junIn : jun;
    const up = Math.sin(clamp01(k / 0.55) * Math.PI);
    ch.place(-0.4, 0, -12, 0.3); ch.pose({ t, armL: [-2.6 * up, 0, 0.3], armR: [-2.6 * up, 0, -0.3], headX: 0.15 }); ch.expr = 'worried';
    if (flip) effects.flash(Math.max(0, 0.35 - (k - 0.55) * 3));
    const h = H0(ch); cam([h.x + 0.6, h.y - 0.8, h.z + 3.6], [h.x + 0.5, h.y - 0.7, h.z + 3.2], [h.x, h.y - 1, h.z], [h.x, h.y - 1, h.z], ease(k), 46);
  },
  jun_sorry(t, d, k) { night(t, { ember: 0 }); junIn.place(-0.4, 0, -12, 1.5); junIn.pose({ t, lean: 0.35 * ease(k * 2), headX: 0.3 }); junIn.say(t, 'talk', 'sad'); const h = H0(junIn); cam([h.x + 2.4, h.y - 0.4, h.z + 1.6], [h.x + 2.1, h.y - 0.4, h.z + 1.4], T3(h), T3(h), ease(k), 46); },
  porch_light(t, d, k) { night(t, { porch: easeOut(k * 1.5), ember: 0 }); junIn.place(-0.4, 0, 12 + k * 2, 0); junIn.pose({ t, walk: t * 6, amp: 0.4 }); junIn.expr = 'sad'; cam([0.6, 2.0, 6 + k * 2], [0.4, 2.1, 7 + k * 2], [HOME.x + 1, 3, HOME.z], [HOME.x + 1, 3, HOME.z], ease(k), 46); },
  ash_doorstep(t, d, k) {
    show('barrio', 'golden'); kapreState({ body: false, eyes: 0, ember: 0, t }); flies.visible = false;
    set.userData.porch.intensity = 0; set.userData.bulbGlow.visible = false;
    ash.visible = true; ash.position.set(HOME.x + 3.2, 0.2, HOME.z - 1.2);
    const p = ash.position; cam([p.x + 1.6, p.y + 1.6, p.z + 2.0], [p.x + 0.9, p.y + 1.0, p.z + 1.2], [p.x, p.y + 0.1, p.z], [p.x, p.y + 0.1, p.z], ease(k), 44); effects.darken(0.12);
  },
  adult_jun(t, d, k) { night(t, { ember: 0 }); adult.place(-0.4, 0, -6 + t * 0.6, Math.PI); adult.pose({ t, walk: t * 5, amp: 0.3 }); adult.expr = 'worried'; const h = H0(adult); cam([h.x + 0.8, h.y + 0.1, h.z - 3.6], [h.x + 0.7, h.y, h.z - 3.0], T3(h), T3(h), ease(k), 46); fxState.tag = { ch: adult, name: 'KUYA JUN', sub: 'NOW 30' }; },
  phone_call(t, d, k) { night(t, { ember: 0, firefly: false }); cam([0, 30, 80], [0, 30, 80], [0, 30, 0], [0, 30, 0], 0, 40); effects.darken(0.92); fxState.phone = k; },
  adult_under_tree(t, d, k) {
    night(t, { ember: 0 }); adult.place(-0.4, 0, -12, 1.2); adult.pose({ t, armR: [-2.2, 0, -0.55] }); adult.say(t, 'talk', 'worried');
    phone.visible = true; phone.position.copy(H0(adult, 0.3)).add(new THREE.Vector3(0.48, 0, 0)); phone.rotation.y = 1.2;
    smoke.userData.set(t, new THREE.Vector3(-0.4, 0, -12), { spread: 4, amount: 0.8, opacity: 0.22 });
    cam(T3(inTree([-12, 2.2, 3])), T3(inTree([-11, 2.4, 2])), T3(inTree([-5, 3.5, -1.5])), T3(inTree([-4.5, 4, -1.5])), ease(k), 50);
  },
  ember_return(t, d, k) { night(t, { ember: easeOut(k * 2) }); smoke.userData.set(t, tipWorld(), { mode: 'rise', amount: 0.7, opacity: 0.16 }); const e = tipWorld(); cam(T3(e.clone().add(new THREE.Vector3(-4, -2, 5))), T3(e.clone().add(new THREE.Vector3(-3.2, -1.5, 4))), T3(e), T3(e), ease(k), 42); effects.darken(0.1); },
  adult_shirt(t, d, k) {
    night(t, { ember: 0.8 }); adult.place(-0.4, 0, -12, 1.2); adult.pose({ t, armR: [-2.2, 0, -0.55] }); adult.expr = 'shock';
    phone.visible = true; phone.position.copy(H0(adult, 0.3)).add(new THREE.Vector3(0.48, 0, 0)); phone.rotation.y = 1.2;
    const h = H0(adult); const c = new THREE.Vector3(h.x + 2.4, h.y - 0.3, h.z + 1.0);
    cam(T3(c.clone().add(new THREE.Vector3(0.8, 0.4, 0.4))), T3(c), [h.x, h.y - 0.3, h.z], [h.x, h.y - 0.7, h.z], ease(k), 46);
    smoke.userData.set(t, new THREE.Vector3(-0.4, 0, -12), { spread: 4, amount: 0.8, opacity: 0.2 });
  },
  kapre_final(t, d, k) { night(t, { eyes: 1, body: true, ember: 1 }); smoke.userData.set(t, tipWorld(), { mode: 'rise', amount: 0.8, opacity: 0.16 }); const e = eyesWorld(); cam(T3(e.clone().add(new THREE.Vector3(-3.4, -0.6, 4.2))), T3(e.clone().add(new THREE.Vector3(-2.2, -0.4, 2.8))), T3(e), T3(e), ease(k), 44); },
};
// pile of grey ash + cigar stub on the doorstep
const ash = new THREE.Group(); E.scene.add(ash); E.prop(ash);
{ const am = mat('#8d8d8d', { roughness: 1 }); const c = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.28, 18), am); c.position.y = 0.14; c.castShadow = true; ash.add(c);
  const r = rng(8); for (let i = 0; i < 26; i++) sphere(0.03 + r() * 0.04, am, (r() - 0.5) * 1.1, 0.02, (r() - 0.5) * 1.1, ash, 6);
  const stub = cyl(0.05, 0.05, 0.3, mat('#5a3a1e'), 0.35, 0.05, 0.25, ash, 8); stub.rotation.z = Math.PI / 2; }

// ---------- overlays (reference style) ----------
const RED = '#ff2b2b', YEL = '#ffd23a';
const words = T.words.map((w, i) => { const line = T.lines[w.line], nx = T.words[i + 1]; return { ...w, end: Math.min(nx && nx.line === w.line ? nx.start : line.end + 0.25, line.end + 0.25) }; });
// group into 1–3 word chunks, breaking after punctuation
const chunks = []; {
  // punctuation-aware breaking: rebuild from the script tokens
  let wi = 0;
  S.lines.forEach((ln, li) => {
    const toks = ln.text.split(/\s+/); let c = null;
    toks.forEach((tok) => {
      const w = T.words[wi++]; if (!w) return;
      const word = tok.replace(/\*/g, '').toUpperCase();
      if (!c || c.ws.length >= 3 || c.len + word.length > 16) { c = { line: li, ws: [], len: 0, start: w.start }; chunks.push(c); }
      c.ws.push({ t: word, emph: tok.includes('*') }); c.len += word.length + 1;
      if (/[.,?!]$/.test(tok.replace(/\*/g, ''))) c = null;
    });
  });
  chunks.forEach((c, i) => { const nx = chunks[i + 1], ln = T.lines[c.line]; c.end = nx && nx.line === c.line ? nx.start : ln.end + 0.3; });
}
const KEYW = new Set(['KAPRE', 'BALETE', 'SMOKE', 'CIGAR', 'JUN', 'LOLA', 'ASH', 'DARK.', 'RED', 'LAUGHED', 'NEVER']);
function caption(ctx, time) {
  const c = chunks.find((x) => time >= x.start && time < x.end); if (!c) return;
  const size = 104, pop = 1 + 0.12 * Math.max(0, 1 - (time - c.start) / 0.09);
  ctx.save(); ctx.translate(W / 2, H * 0.795); ctx.scale(pop, pop);
  ctx.font = `700 ${size}px Osw`; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const parts = c.ws.map((w) => ({ ...w, wd: ctx.measureText(w.t).width })), gap = size * 0.24;
  let tw = parts.reduce((a, p) => a + p.wd, 0) + gap * (parts.length - 1); const sc = Math.min(1, W * 0.9 / tw); ctx.scale(sc, sc);
  let x = -tw / 2;
  for (const p of parts) {
    const red = p.emph || KEYW.has(p.t.replace(/[,!?]$/, ''));
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 5;
    ctx.lineWidth = 14; ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.strokeText(p.t, x, 0);
    ctx.shadowColor = 'transparent'; ctx.fillStyle = red ? RED : '#ffffff'; ctx.fillText(p.t, x, 0);
    x += p.wd + gap;
  }
  ctx.restore();
}
const lineT = (i) => T.lines[i];
const fadeIn = (time, a, b = a + 0.25) => clamp01((time - a) / (b - a));
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function pill(ctx, x, y, text, { bg = RED, fg = '#fff', size = 30, dot = false } = {}) {
  ctx.textAlign = 'left'; ctx.font = `700 ${size}px Osw`; const w = ctx.measureText(text).width + size * 0.9 + (dot ? size * 0.7 : 0);
  ctx.fillStyle = bg; rr(ctx, x, y, w, size * 1.45, 8); ctx.fill();
  if (dot) { ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(x + size * 0.55, y + size * 0.72, size * 0.16, 0, 7); ctx.fill(); }
  ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.fillText(text, x + size * 0.45 + (dot ? size * 0.6 : 0), y + size * 0.75); return w;
}
function seriesTag(ctx, time) { // opening: series pill + two-line hook title
  const a = 1 - clamp01((time - (lineT(0).end - 0.3)) / 0.4); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'left';
  const label = `${S.series} · KAPRE · PART 1 OF 2`; ctx.font = '700 30px Osw'; const w = ctx.measureText(label).width + 28;
  pill(ctx, (W - w) / 2, 150, label);
  ctx.textAlign = 'center'; ctx.font = '700 78px Osw'; ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineJoin = 'round';
  ctx.strokeText('IF IT SMOKES', W / 2, 262); ctx.fillStyle = '#fff'; ctx.fillText('IF IT SMOKES', W / 2, 262);
  ctx.strokeText('IN THE TREE', W / 2, 350); ctx.fillStyle = YEL; ctx.fillText('IN THE TREE', W / 2, 350);
  ctx.restore();
}
function infoCard(ctx, time, i, title, rows) { // dark card with red border, rows typed in
  const L = lineT(i); if (time < L.start + 0.3 || time > L.end + 0.6) return;
  const a = fadeIn(time, L.start + 0.3) * (1 - clamp01((time - L.end - 0.3) / 0.3));
  ctx.save(); ctx.globalAlpha = a; const x = 70, y = 110, w = 640, h = 92 + rows.length * 68;
  ctx.fillStyle = 'rgba(8,8,12,0.82)'; rr(ctx, x, y, w, h, 10); ctx.fill(); ctx.strokeStyle = RED; ctx.lineWidth = 4; ctx.stroke();
  ctx.font = '700 34px Osw'; ctx.fillStyle = RED; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 30, y + 46);
  rows.forEach(([k, v], j) => {
    const ta = clamp01((time - L.start - 0.6 - j * 0.55) / 0.5); if (ta <= 0) return;
    ctx.font = '700 24px Osw'; ctx.fillStyle = '#9aa0ad'; ctx.fillText(k, x + 30, y + 112 + j * 68);
    ctx.font = '700 40px Osw'; ctx.fillStyle = '#fff'; ctx.fillText(v.slice(0, Math.ceil(v.length * ta)), x + 160, y + 112 + j * 68);
  });
  ctx.restore();
}
function noteCard(ctx, time, i, head, lines, at = 0.35, rot = -0.03) { // white paper card, red header, last line red
  const L = lineT(i), t0 = L.start + (L.end - L.start) * at; if (time < t0 || time > L.end + 0.8) return;
  const a = fadeIn(time, t0, t0 + 0.15) * (1 - clamp01((time - L.end - 0.5) / 0.3)), pop = 1 + 0.15 * (1 - easeOut((time - t0) / 0.25));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W - 80 - 380, 230); ctx.rotate(rot); ctx.scale(pop, pop);
  const w = 760, h = 96 + lines.length * 74;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.fillStyle = '#f6f3ec'; rr(ctx, -w / 2, -70, w, h, 10); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = RED; rr(ctx, -w / 2, -70, w, 52, [10, 10, 0, 0]); ctx.fill();
  ctx.font = '700 32px Osw'; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(head, -w / 2 + 26, -44);
  lines.forEach((s, j) => { ctx.font = '700 60px Osw'; ctx.fillStyle = j === lines.length - 1 ? RED : '#16161a'; ctx.fillText(s, -w / 2 + 26, 24 + j * 74); });
  ctx.restore();
}
function nameTag(ctx, time, tag) {
  if (!tag) return; const p = headPos(tag.ch, 1.05).project(camera); const x = (p.x * 0.5 + 0.5) * W, y = (-p.y * 0.5 + 0.5) * H;
  const ty = y - 190; ctx.save(); ctx.globalAlpha = 0.95;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, ty + 82); ctx.lineTo(x, y - 20); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y - 20, 6, 0, 7); ctx.fill();
  ctx.font = '700 46px Osw'; const w1 = ctx.measureText(tag.name).width; ctx.font = '700 22px Osw'; const w = Math.max(w1, ctx.measureText(tag.sub).width) + 40;
  ctx.fillStyle = 'rgba(10,10,14,0.85)'; rr(ctx, x - w / 2, ty, w, 84, 8); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.font = '700 46px Osw'; ctx.fillText(tag.name, x, ty + 32); ctx.font = '700 22px Osw'; ctx.fillStyle = '#c9ccd4'; ctx.fillText(tag.sub, x, ty + 66);
  ctx.restore();
}
function phoneUI(ctx, time, k) {
  const a = clamp01(k * 6); ctx.save(); ctx.globalAlpha = a; const w = 560, h = 980, x = (W - w) / 2, y = 330 + Math.sin(time * 40) * 3 * (k < 0.9 ? 1 : 0);
  ctx.fillStyle = '#0b0d12'; rr(ctx, x - 18, y - 18, w + 36, h + 36, 70); ctx.fill(); ctx.strokeStyle = '#2b2f3a'; ctx.lineWidth = 6; ctx.stroke();
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#1d2a44'); g.addColorStop(1, '#090c14'); ctx.fillStyle = g; rr(ctx, x, y, w, h, 56); ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e8ecf5'; ctx.font = '700 120px Osw'; ctx.fillText('3:07', W / 2, y + 150);
  ctx.font = '600 30px Osw'; ctx.fillStyle = '#9aa4ba'; ctx.fillText('INCOMING CALL', W / 2, y + 330);
  ctx.font = '700 70px Osw'; ctx.fillStyle = '#fff'; ctx.fillText('KUYA JUN', W / 2, y + 400);
  const pr = 1 + 0.08 * Math.sin(time * 9); ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(W / 2 - 140, y + h - 160, 62, 0, 7); ctx.fill();
  ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.arc(W / 2 + 140, y + h - 160, 62 * pr, 0, 7); ctx.fill();
  ctx.restore();
}
function endCard(ctx, time) {
  const L = lineT(T.lines.length - 1), t0 = L.start + (L.end - L.start) * 0.62; if (time < t0) return; const a = fadeIn(time, t0, t0 + 0.3);
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.font = '700 84px Osw'; ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.strokeText('WHO TURNED IT?', W / 2, 300); ctx.fillStyle = YEL; ctx.fillText('WHO TURNED IT?', W / 2, 300);
  ctx.font = '700 40px Osw'; const label = 'PART 2 NEXT · FOLLOW', w = ctx.measureText(label).width + 40; pill(ctx, (W - w) / 2, 350, label, { size: 40 });
  ctx.restore();
}
const grain = canvasTex(256, 256, (g) => { const d = g.createImageData(256, 256); const r = rng(3); for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }).image;
function overlay(ctx, time, s) {
  if (location.search.includes('clean')) return; // clean frames for covers/thumbnails
  // film grain + extra top/bottom shade so captions read
  ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'overlay'; const ox = (Math.floor(time * 24) * 97) % 256, oy = (Math.floor(time * 24) * 61) % 256;
  for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) ctx.drawImage(grain, x, y); ctx.restore();
  const g = ctx.createLinearGradient(0, H * 0.62, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = g; ctx.fillRect(0, H * 0.62, W, H * 0.38);
  if (fxState.phone !== undefined) phoneUI(ctx, time, fxState.phone);
  nameTag(ctx, time, fxState.tag);
  seriesTag(ctx, time);
  // location stamp while the 2009 story starts
  if (time > lineT(5).start && time < lineT(7).start) { ctx.save(); ctx.globalAlpha = fadeIn(time, lineT(5).start); pill(ctx, 60, 70, 'BATANGAS · 2009', { bg: 'rgba(10,10,14,0.8)', size: 30, dot: true }); ctx.restore(); }
  if (time > lineT(19).start && time < lineT(20).start) { ctx.save(); ctx.globalAlpha = fadeIn(time, lineT(19).start); pill(ctx, 60, 70, 'LAST NIGHT · 3:07 AM', { bg: 'rgba(10,10,14,0.8)', size: 30, dot: true }); ctx.restore(); }
  infoCard(ctx, time, 2, 'THE KAPRE', [['WHAT', 'A GIANT IN THE BALETE'], ['WHO', 'THE TREE\'S OLD KEEPER'], ['WANTS', 'RESPECT']]);
  noteCard(ctx, time, 4, 'THE RULE', ['SAY "TABI TABI PO."', 'LOST? TURN YOUR', 'SHIRT INSIDE OUT.'], 0.25);
  noteCard(ctx, time, 15, "LOLA'S WORDS", ['DON\'T RUN.', 'SAY SORRY.', 'INSIDE OUT.'], 0.1, 0.03);
  endCard(ctx, time);
  caption(ctx, time);
}
const wrapped = Object.fromEntries(Object.entries(shots).map(([n, f]) => [n, (...a) => { fxState = {}; f(...a); }]));
E.run({ timings: T, shots: wrapped, captionStyle: 'none', overlay });
