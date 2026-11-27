// "Grey Town" — blocky 3D short story renderer.
// window.renderAt(t) renders the frame at time t (seconds) and returns a JPEG data URL.
import * as THREE from 'three';

const W = 1080, H = 1920;
const T = await (await fetch('build/timings.json')).json();

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.05, 900);

// ---------- helpers ----------
const C = (c) => new THREE.Color(c);
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o });
function box(w, h, d, m, x = 0, y = 0, z = 0, parent = null, shadow = true) {
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  me.position.set(x, y, z);
  me.castShadow = shadow; me.receiveShadow = true;
  if (parent) parent.add(me);
  return me;
}
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => { x = clamp01(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
const lerp = (a, b, k) => a + (b - a) * k;
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
function greyOf(c) { const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; return new THREE.Color(l * 0.92, l * 0.95, l * 1.02); }

// ---------- faces ----------
function drawFace(ctx, skin, expr, o) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = skin; ctx.fillRect(0, 0, 512, 256);
  ctx.save(); ctx.translate(256, 0); ctx.scale(0.6, 1);
  const ink = '#1b1410', ey = 112, ex = 46;
  ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 9;
  const eye = (x, s = 1) => {
    ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(x, ey, 12 * s, 18 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x + 4 * s, ey - 7 * s, 4.5 * s, 5.5 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = ink;
  };
  if (expr === 'happy') {
    for (const x of [-ex, ex]) { ctx.beginPath(); ctx.arc(x, ey + 8, 16, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  } else if (expr === 'shock') { eye(-ex, 1.35); eye(ex, 1.35); }
  else { eye(-ex); eye(ex); }
  // brows
  ctx.lineWidth = 8;
  if (expr === 'sad' || expr === 'cry' || expr === 'worried') {
    ctx.beginPath(); ctx.moveTo(-ex - 20, ey - 30); ctx.lineTo(-ex + 14, ey - 44); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex + 20, ey - 30); ctx.lineTo(ex - 14, ey - 44); ctx.stroke();
  } else if (expr === 'confused') {
    ctx.beginPath(); ctx.moveTo(-ex - 18, ey - 36); ctx.lineTo(-ex + 16, ey - 36); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex - 16, ey - 46); ctx.quadraticCurveTo(ex, ey - 56, ex + 18, ey - 44); ctx.stroke();
  } else if (expr === 'shock') {
    ctx.beginPath(); ctx.arc(-ex, ey - 26, 20, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
    ctx.beginPath(); ctx.arc(ex, ey - 26, 20, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
  }
  if (o.mustache) {
    ctx.fillStyle = '#ecebe6';
    ctx.beginPath(); ctx.ellipse(-22, 150, 30, 11, 0.15, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(22, 150, 30, 11, -0.15, 0, 7); ctx.fill();
    ctx.fillStyle = ink;
  }
  // mouth
  ctx.lineWidth = 9;
  const my = o.mustache ? 174 : 160;
  if (expr === 'happy') {
    ctx.beginPath(); ctx.arc(0, my - 4, 30, 0, Math.PI); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e2566a'; ctx.beginPath(); ctx.ellipse(0, my + 16, 15, 8, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,140,0.35)';
    ctx.beginPath(); ctx.ellipse(-82, 150, 20, 12, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(82, 150, 20, 12, 0, 0, 7); ctx.fill();
  } else if (expr === 'smile') {
    ctx.beginPath(); ctx.arc(0, my - 22, 32, Math.PI * 0.22, Math.PI * 0.78); ctx.stroke();
  } else if (expr === 'sad' || expr === 'cry' || expr === 'worried') {
    ctx.beginPath(); ctx.arc(0, my + 26, 24, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke();
  } else if (expr === 'shock') {
    ctx.beginPath(); ctx.ellipse(0, my + 8, 13, 18, 0, 0, 7); ctx.fill();
  } else if (expr === 'confused') {
    ctx.beginPath(); ctx.moveTo(-22, my + 6); ctx.quadraticCurveTo(-8, my - 6, 4, my + 4); ctx.quadraticCurveTo(14, my + 12, 24, my); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(0, my - 14, 20, Math.PI * 0.3, Math.PI * 0.7); ctx.stroke();
  }
  if (expr === 'cry') {
    ctx.fillStyle = 'rgba(90,180,255,0.85)';
    for (const x of [-ex, ex]) { ctx.beginPath(); ctx.roundRect(x - 7, ey + 18, 14, 100, 7); ctx.fill(); }
  }
  if (o.glasses) {
    const gy = o.glassesUp ? ey - 66 : ey;
    ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 6;
    for (const x of [-ex, ex]) { ctx.beginPath(); ctx.arc(x, gy, 28, 0, 7); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-ex + 28, gy); ctx.lineTo(ex - 28, gy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-ex - 28, gy); ctx.lineTo(-ex - 90, gy - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex + 28, gy); ctx.lineTo(ex + 90, gy - 6); ctx.stroke();
  }
  ctx.restore();
}

// ---------- characters ----------
const chars = [];
function makeChar(o) {
  const root = new THREE.Group(); scene.add(root);
  const greyables = [];
  const gm = (c) => { const m = mat(c); greyables.push({ m, base: C(c) }); return m; };
  const shirt = gm(o.shirt), pants = gm(o.pants), shoe = gm(o.shoes || '#f1efe9'), skinM = gm(o.skin || '#f6c945');
  const hairM = gm(o.hair || '#3b2618');
  const handM = [mat(o.skin || '#f6c945'), mat(o.skin || '#f6c945')];
  const body = new THREE.Group(); root.add(body);
  const legs = [-0.26, 0.26].map((x) => {
    const p = new THREE.Group(); p.position.set(x, 1.0, 0); body.add(p);
    box(0.5, 0.86, 0.52, pants, 0, -0.42, 0, p);
    box(0.52, 0.18, 0.58, shoe, 0, -0.91, 0.03, p);
    return p;
  });
  box(1.04, 1.0, 0.54, shirt, 0, 1.5, 0, body);
  if (o.stripe) box(1.05, 0.14, 0.55, gm(o.stripe), 0, 1.3, 0, body);
  if (o.hood) box(0.86, 0.32, 0.2, shirt, 0, 1.88, -0.3, body);
  if (o.star) {
    const s = new THREE.Mesh(new THREE.CircleGeometry(0.16, 5), gm(o.star));
    s.position.set(0, 1.55, 0.28); body.add(s);
  }
  const arms = [-1, 1].map((s, i) => {
    const p = new THREE.Group(); p.position.set(s * 0.78, 1.95, 0); body.add(p);
    box(0.5, 0.62, 0.52, shirt, 0, -0.3, 0, p);
    box(0.47, 0.38, 0.49, handM[i], 0, -0.8, 0, p);
    return p;
  });
  const headP = new THREE.Group(); headP.position.y = 2.02; body.add(headP);
  const fc = document.createElement('canvas'); fc.width = 512; fc.height = 256;
  const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 8;
  const faceM = mat('#ffffff', { map: ft });
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.72, 48, 1, false, Math.PI, Math.PI * 2), [faceM, skinM, skinM]);
  head.position.y = 0.38; head.castShadow = true; head.receiveShadow = true; headP.add(head);
  const hy = 0.38;
  if (o.hairType === 'kid') {
    box(0.88, 0.26, 0.88, hairM, 0, hy + 0.42, -0.02, headP);
    box(0.88, 0.55, 0.22, hairM, 0, hy + 0.12, -0.34, headP);
    box(0.84, 0.13, 0.14, hairM, 0.04, hy + 0.3, 0.36, headP);
    box(0.16, 0.36, 0.7, hairM, -0.37, hy + 0.2, -0.05, headP);
    box(0.16, 0.36, 0.7, hairM, 0.37, hy + 0.2, -0.05, headP);
  } else if (o.hairType === 'grandpa') {
    box(0.14, 0.3, 0.55, hairM, -0.38, hy + 0.12, -0.06, headP);
    box(0.14, 0.3, 0.55, hairM, 0.38, hy + 0.12, -0.06, headP);
    box(0.7, 0.32, 0.16, hairM, 0, hy + 0.12, -0.36, headP);
    box(0.3, 0.08, 0.3, hairM, 0, hy + 0.4, -0.05, headP);
  } else if (o.hairType === 'mom') {
    box(0.9, 0.24, 0.9, hairM, 0, hy + 0.42, -0.02, headP);
    box(0.9, 1.1, 0.26, hairM, 0, hy - 0.05, -0.34, headP);
    box(0.16, 0.9, 0.6, hairM, -0.38, hy, -0.08, headP);
    box(0.16, 0.9, 0.6, hairM, 0.38, hy, -0.08, headP);
  } else if (o.hairType === 'cap') {
    const capM = gm(o.cap || '#d33');
    box(0.86, 0.22, 0.86, capM, 0, hy + 0.44, 0, headP);
    box(0.8, 0.06, 0.42, capM, 0, hy + 0.34, 0.56, headP);
  } else if (o.hairType === 'bob') {
    box(0.9, 0.26, 0.9, hairM, 0, hy + 0.42, -0.02, headP);
    box(0.9, 0.6, 0.22, hairM, 0, hy + 0.1, -0.35, headP);
    box(0.16, 0.6, 0.6, hairM, -0.38, hy + 0.1, -0.06, headP);
    box(0.16, 0.6, 0.6, hairM, 0.38, hy + 0.1, -0.06, headP);
    box(0.3, 0.2, 0.2, gm('#ff6fae'), 0.3, hy + 0.56, 0.05, headP);
  }
  const ch = { root, body, legs, arms, headP, o, expr: 'smile', grey: 0, handGrey: [0, 0], _key: '' };
  ch.update = () => {
    for (const g of greyables) g.m.color.copy(g.base).lerp(greyOf(g.base), ch.grey);
    const sk = C(o.skin || '#f6c945');
    handM.forEach((m, i) => m.color.copy(sk).lerp(greyOf(sk), Math.max(ch.grey, ch.handGrey[i])));
    const key = ch.expr + '|' + ch.grey.toFixed(2) + '|' + !!o.glassesUp;
    if (key !== ch._key) {
      ch._key = key;
      const skc = sk.clone().lerp(greyOf(sk), ch.grey);
      drawFace(fc.getContext('2d'), '#' + skc.getHexString(THREE.SRGBColorSpace), ch.expr, o);
      ft.needsUpdate = true;
    }
  };
  ch.place = (x, y, z, ry = 0) => { root.position.set(x, y, z); root.rotation.set(0, ry, 0); root.visible = true; };
  ch.pose = (p = {}) => {
    const ph = p.walk || 0, amp = p.amp ?? 0;
    const s = Math.sin(ph) * amp;
    legs[0].rotation.set(s, 0, 0); legs[1].rotation.set(-s, 0, 0);
    arms[0].rotation.set(-s * 0.9, 0, 0); arms[1].rotation.set(s * 0.9, 0, 0);
    body.position.y = amp ? Math.abs(Math.cos(ph)) * 0.08 * amp : 0;
    body.rotation.set(p.lean || 0, 0, p.bodyZ || 0);
    if (p.sit) { legs[0].rotation.x = -Math.PI / 2; legs[1].rotation.x = -Math.PI / 2; }
    if (p.armL) arms[0].rotation.set(p.armL[0], p.armL[1] || 0, p.armL[2] || 0);
    if (p.armR) arms[1].rotation.set(p.armR[0], p.armR[1] || 0, p.armR[2] || 0);
    headP.rotation.set(p.headX || 0, p.headY || 0, p.headZ || 0);
    // breathing
    body.scale.y = 1 + Math.sin((p.t || 0) * 2.2) * 0.006;
  };
  ch.hide = () => { root.visible = false; };
  chars.push(ch);
  return ch;
}
// world position of a character's hand (0 = left, 1 = right)
function handPos(ch, i) { const v = new THREE.Vector3(0, -0.8, 0); ch.root.updateMatrixWorld(true); return ch.arms[i].localToWorld(v); }
function headPos(ch) { const v = new THREE.Vector3(0, 0.4, 0); ch.root.updateMatrixWorld(true); return ch.headP.localToWorld(v); }

const kid = makeChar({ shirt: '#ff7a1c', pants: '#2b4a86', hairType: 'kid', hair: '#2e1d12', hood: true });
const grandpa = makeChar({ shirt: '#8a6e9e', pants: '#5b4a3a', shoes: '#4a3427', hairType: 'grandpa', hair: '#f0efe9', glasses: true, mustache: true, stripe: '#6c5480' });
const mom = makeChar({ shirt: '#e8607f', pants: '#3b3f5c', hairType: 'mom', hair: '#6b3a1e' });
const extras = [
  makeChar({ shirt: '#ee4f9c', pants: '#2a3a6a', hairType: 'cap', cap: '#d8282e' }),
  makeChar({ shirt: '#3bb37a', pants: '#56503f', hairType: 'cap', cap: '#d8282e' }),
  makeChar({ shirt: '#f4d03f', pants: '#3a5b9a', hairType: 'bob', hair: '#4a2a18', star: '#ff6fae' }),
  makeChar({ shirt: '#4a8fe0', pants: '#2e2e3a', hairType: 'kid', hair: '#1c1c1c' }),
  makeChar({ shirt: '#9aa0a6', pants: '#55595e', hairType: 'mom', hair: '#3a3a3a' }), // lonely grey woman
  makeChar({ shirt: '#c2703d', pants: '#3d3d46', hairType: 'grandpa', hair: '#ddd', glasses: true }), // grey man on bench
];

// ---------- textures ----------
const woodTex = canvasTex(512, 512, (g) => {
  const r = rng(3);
  for (let i = 0; i < 8; i++) {
    const c = 120 + r() * 30;
    g.fillStyle = `rgb(${c},${c * 0.62},${c * 0.38})`; g.fillRect(0, i * 64, 512, 64);
    g.fillStyle = 'rgba(40,20,10,0.5)'; g.fillRect(0, i * 64, 512, 3);
    const off = r() * 512; g.fillRect(off, i * 64, 3, 64);
    for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(60,30,10,0.12)'; g.fillRect(0, i * 64 + 8 + r() * 50, 512, 2); }
  }
}, [3, 3]);
const wallTex = (a, b) => canvasTex(256, 256, (g) => {
  g.fillStyle = a; g.fillRect(0, 0, 256, 256);
  g.fillStyle = b; for (let x = 0; x < 256; x += 64) g.fillRect(x, 0, 24, 256);
}, [6, 3]);
const brickTex = canvasTex(256, 256, (g) => {
  const r = rng(9);
  g.fillStyle = '#d9c9b8'; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 8; y++) for (let x = -1; x < 5; x++) {
    const c = 150 + r() * 40; g.fillStyle = `rgb(${c},${c * 0.32},${c * 0.25})`;
    g.fillRect(x * 64 + (y % 2) * 32 + 3, y * 32 + 3, 58, 26);
  }
}, [2, 2]);
const photoTex = canvasTex(512, 640, (g) => {
  // a warm park photo of grandpa and the kid, laughing together
  const grd = g.createLinearGradient(0, 0, 0, 640); grd.addColorStop(0, '#f6d7a8'); grd.addColorStop(0.55, '#f2c48e'); grd.addColorStop(0.56, '#8fb36a'); grd.addColorStop(1, '#6f9550');
  g.fillStyle = grd; g.fillRect(0, 0, 512, 640);
  g.fillStyle = '#3f6e3a'; g.beginPath(); g.moveTo(40, 360); g.lineTo(100, 140); g.lineTo(160, 360); g.fill();
  g.beginPath(); g.moveTo(380, 360); g.lineTo(440, 170); g.lineTo(500, 360); g.fill();
  const fig = (x, y, s, shirt, pants, skin, hair, gp) => {
    g.fillStyle = pants; g.fillRect(x - 40 * s, y + 150 * s, 36 * s, 90 * s); g.fillRect(x + 4 * s, y + 150 * s, 36 * s, 90 * s);
    g.fillStyle = shirt; g.fillRect(x - 46 * s, y + 60 * s, 92 * s, 92 * s);
    g.fillRect(x - 84 * s, y + 60 * s, 36 * s, 64 * s); g.fillRect(x + 48 * s, y + 60 * s, 36 * s, 64 * s);
    g.fillStyle = skin; g.fillRect(x - 84 * s, y + 124 * s, 36 * s, 30 * s); g.fillRect(x + 48 * s, y + 124 * s, 36 * s, 30 * s);
    g.beginPath(); g.roundRect(x - 36 * s, y - 6 * s, 72 * s, 66 * s, 14 * s); g.fill();
    g.fillStyle = hair;
    if (gp) { g.fillRect(x - 40 * s, y + 4 * s, 12 * s, 26 * s); g.fillRect(x + 28 * s, y + 4 * s, 12 * s, 26 * s); }
    else g.fillRect(x - 38 * s, y - 14 * s, 76 * s, 22 * s);
    g.strokeStyle = '#1b1410'; g.lineWidth = 4 * s; g.lineCap = 'round';
    g.beginPath(); g.arc(x - 14 * s, y + 24 * s, 7 * s, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    g.beginPath(); g.arc(x + 14 * s, y + 24 * s, 7 * s, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    g.fillStyle = '#1b1410'; g.beginPath(); g.arc(x, y + 38 * s, 12 * s, 0, Math.PI); g.fill();
    if (gp) { g.strokeStyle = '#3a2a20'; g.lineWidth = 3 * s; g.beginPath(); g.arc(x - 14 * s, y + 22 * s, 11 * s, 0, 7); g.stroke(); g.beginPath(); g.arc(x + 14 * s, y + 22 * s, 11 * s, 0, 7); g.stroke(); }
  };
  fig(330, 250, 1.25, '#8a6e9e', '#5b4a3a', '#f6c945', '#f0efe9', true);
  fig(170, 330, 1.0, '#ff7a1c', '#2b4a86', '#f6c945', '#2e1d12', false);
  // sepia wash + border
  g.fillStyle = 'rgba(255,220,170,0.18)'; g.fillRect(0, 0, 512, 640);
  g.strokeStyle = '#fbf6ec'; g.lineWidth = 36; g.strokeRect(0, 0, 512, 640);
});
const dotTex = canvasTex(64, 64, (g) => {
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,240,190,0.8)'); r.addColorStop(1, 'rgba(255,220,120,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
});

// ---------- sky + lights ----------
const skyU = { top: { value: C('#6e9fd6') }, mid: { value: C('#f6c59a') }, bot: { value: C('#f3d6b4') } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, uniforms: skyU,
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: 'uniform vec3 top, mid, bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0. ? mix(mid, top, smoothstep(0., .42, h)) : bot; gl_FragColor = vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
}));
scene.add(sky);
const sun = new THREE.DirectionalLight('#ffd6a8', 3.0);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 150 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight('#cfe0ff', '#7a6a50', 1.2);
scene.add(hemi);

// ---------- town ----------
const town = new THREE.Group(); scene.add(town);
{
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), mat('#5f9a45'));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; town.add(ground);
  box(8, 0.05, 600, mat('#3f4659'), 0, 0.025, 0, town, false);
  const dash = mat('#efe6c6');
  for (let z = -200; z < 200; z += 7) box(0.22, 0.06, 3, dash, 0, 0.03, z, town, false);
  const walk = mat('#d2cdc4');
  for (const s of [-1, 1]) { box(3, 0.18, 600, walk, s * 5.5, 0.09, 0, town, false); box(0.2, 0.22, 600, mat('#bdb7ad'), s * 4.05, 0.11, 0, town, false); }
  const r = rng(42);
  const walls = ['#3d3d47', '#efe2c8', '#b5493a', '#5f87b3', '#e9d9b0', '#7a9a8c', '#c98b5a'];
  const roofs = ['#7d3326', '#3a3a44', '#5a3b2a', '#2f4f6f'];
  const tri = new THREE.Shape(); tri.moveTo(-4.2, 0); tri.lineTo(4.2, 0); tri.lineTo(0, 3.2); tri.closePath();
  const triGeo = new THREE.ExtrudeGeometry(tri, { depth: 8, bevelEnabled: false });
  const glass = mat('#ffd98a', { emissive: '#ffb85a', emissiveIntensity: 0.55, roughness: 0.3 });
  const white = mat('#f4f1ea');
  function house(x, z, side, wall, roof, special) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = side > 0 ? Math.PI : 0; town.add(g);
    const wm = mat(wall);
    box(8, 6, 8, wm, 0, 3, 0, g);
    const t = new THREE.Mesh(triGeo, wm); t.position.set(0, 6, -4); t.castShadow = true; t.receiveShadow = true; g.add(t);
    const rm = mat(roof);
    for (const s of [-1, 1]) {
      const sl = box(5.4, 0.35, 9, rm, s * 2.15, 7.65, 0, g); sl.rotation.z = -s * 0.65;
    }
    // facade on +x
    for (const wz of [-2, 2]) {
      box(0.2, 1.9, 1.7, white, 4.02, 4.3, wz, g);
      box(0.24, 1.5, 1.3, glass, 4.04, 4.3, wz, g, false);
      box(0.26, 0.1, 1.3, white, 4.06, 4.3, wz, g, false);
      box(0.5, 0.3, 1.8, mat('#7b4b2a'), 4.25, 3.25, wz, g);
      for (let k = 0; k < 5; k++) box(0.22, 0.22, 0.22, mat(['#ff6f91', '#ffd25a', '#9b6bff', '#ff8a3d', '#6fd3ff'][(k + wz + 7) % 5]), 4.35, 3.48, wz - 0.7 + k * 0.35, g, false);
    }
    box(0.2, 1.9, 1.7, white, 4.02, 1.8, -2, g); box(0.24, 1.5, 1.3, glass, 4.04, 1.8, -2, g, false);
    box(0.2, 2.8, 1.5, white, 4.02, 1.4, 2, g); box(0.24, 2.5, 1.2, mat(special ? '#4d6b5c' : '#2d2a30'), 4.05, 1.3, 2, g);
    box(0.1, 0.14, 0.14, mat('#e0b040', { metalness: 0.6, roughness: 0.3 }), 4.18, 1.3, 2.4, g, false);
    if (special) {
      box(2.5, 0.5, 6.6, mat('#a0704a'), 5.25, 0.25, 0, g);
      box(2.8, 0.2, 6.9, white, 5.3, 4.1, 0, g);
      for (const pz of [-3.1, 3.1]) box(0.24, 3.6, 0.24, white, 6.3, 2.3, pz, g);
      for (let k = 0; k < 3; k++) box(0.6, 0.18, 1.8, mat('#9a6a45'), 6.8 + k * 0.4, 0.4 - k * 0.15, 2, g);
    }
    return g;
  }
  for (const s of [-1, 1]) for (let i = -9; i <= 9; i++) {
    const special = s < 0 && i === 0;
    house(s * 15, i * 13, s, special ? '#7a9a8c' : walls[Math.floor(r() * walls.length)], roofs[Math.floor(r() * roofs.length)], special);
  }
  // trees
  const trunk = mat('#6b4a30'), leaf = mat('#2f5d34'), leaf2 = mat('#3b7040');
  function pine(x, z, s = 1) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); town.add(g);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.5, 8), trunk); tr.position.y = 0.75; tr.castShadow = true; g.add(tr);
    [[2.2, 2.6, 2], [1.7, 2.2, 3.4], [1.1, 1.8, 4.6]].forEach(([rad, h, y], k) => {
      const c = new THREE.Mesh(new THREE.ConeGeometry(rad, h, 8), k % 2 ? leaf2 : leaf); c.position.y = y; c.castShadow = true; c.receiveShadow = true; g.add(c);
    });
  }
  for (const s of [-1, 1]) for (let i = -9; i <= 9; i++) {
    pine(s * (9.5 + r() * 0.8), i * 13 + 6.5, 0.9 + r() * 0.5);
    pine(s * (24 + r() * 6), i * 13 + r() * 6, 1.2 + r() * 0.8);
  }
  // street lamps
  const pole = mat('#2d2f36', { metalness: 0.4, roughness: 0.5 });
  for (const s of [-1, 1]) for (let z = -130; z <= 130; z += 26) {
    box(0.18, 4.6, 0.18, pole, s * 6.8, 2.3, z + 3, town);
    box(0.9, 0.12, 0.12, pole, s * 6.4, 4.55, z + 3, town);
    box(0.4, 0.3, 0.4, mat('#fff3cf', { emissive: '#ffd27a', emissiveIntensity: 1.2 }), s * 6.0, 4.4, z + 3, town, false);
  }
  // picket fences (instanced)
  const pk = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.9, 0.18), white, 800);
  let n = 0; const m4 = new THREE.Matrix4();
  for (const s of [-1, 1]) for (let z = -60; z < 60; z += 0.55) {
    if (s < 0 && Math.abs(z - 2) < 1.6) continue; // gap for grandpa's path
    m4.makeTranslation(s * 8.6, 0.45, z); pk.setMatrixAt(n++, m4);
  }
  pk.count = n; pk.castShadow = true; pk.receiveShadow = true; town.add(pk);
  for (const s of [-1, 1]) { box(0.08, 0.1, 120, white, s * 8.6, 0.7, 0, town); }
}
function bench(parent, x, y, z, ry) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  const wood = mat('#8a5a35'), iron = mat('#2b2b30', { metalness: 0.5, roughness: 0.4 });
  box(2.8, 0.12, 0.75, wood, 0, 0.75, 0, g);
  box(2.8, 0.7, 0.1, wood, 0, 1.2, -0.36, g);
  for (const s of [-1, 1]) { box(0.1, 0.75, 0.7, iron, s * 1.2, 0.37, 0, g); box(0.1, 0.9, 0.1, iron, s * 1.2, 1.15, -0.38, g); }
  return g;
}
bench(town, 8.0, 0, -6, -Math.PI / 2);        // town bench, faces the road
bench(town, -10.4, 0.5, 2, Math.PI / 2);       // grandpa's porch bench, faces the road

// ---------- rooms ----------
function makeRoom(v) {
  const g = new THREE.Group(); scene.add(g);
  const floorM = mat('#ffffff', { map: woodTex, roughness: 0.6 });
  box(16, 0.2, 16, floorM, 0, -0.1, 0, g, false);
  const wallM = mat('#ffffff', { map: wallTex(v.wallA, v.wallB) });
  const w1 = box(16, 8, 0.3, wallM, 0, 4, -7, g, false);
  const w2 = box(0.3, 8, 16, wallM, -8, 4, 0, g, false);
  const w3 = box(0.3, 8, 16, wallM, 8, 4, 0, g, false);
  const white = mat('#f4f1ea');
  box(16, 0.4, 0.1, white, 0, 0.2, -6.84, g, false);
  box(0.1, 0.4, 16, white, -7.84, 0.2, 0, g, false);
  box(0.1, 0.4, 16, white, 7.84, 0.2, 0, g, false);
  // window
  const wx = -3.5;
  box(3.6, 3.8, 0.3, white, wx, 3.8, -6.8, g, false);
  const pane = mat('#ffe6bf', { emissive: '#ffe0b0', emissiveIntensity: 1.6 });
  box(3.1, 3.3, 0.32, pane, wx, 3.8, -6.79, g, false);
  box(0.14, 3.3, 0.36, white, wx, 3.8, -6.77, g, false);
  box(3.1, 0.14, 0.36, white, wx, 3.8, -6.77, g, false);
  box(3.9, 0.18, 0.6, white, wx, 2.05, -6.6, g, false);
  const cur = mat(v.curtain);
  box(0.9, 4.6, 0.2, cur, wx - 2.2, 3.7, -6.55, g); box(0.9, 4.6, 0.2, cur, wx + 2.2, 3.7, -6.55, g);
  // rug
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.03, 40), mat(v.rug)); rug.position.set(0, 0.02, -0.5); rug.receiveShadow = true; g.add(rug);
  const rug2 = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.04, 40), mat(v.rug2)); rug2.position.set(0, 0.025, -0.5); rug2.receiveShadow = true; g.add(rug2);
  // window light + lamp
  const spot = new THREE.SpotLight('#ffe1b5', 2.8, 30, 0.75, 0.7, 0);
  spot.position.set(wx + 1, 7.5, -8.5); spot.target.position.set(0.5, 0, 1.5);
  spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0005;
  g.add(spot, spot.target);
  const lamp = new THREE.PointLight('#ffb36b', 1.3, 14, 0); lamp.position.set(5, 3.6, -3); g.add(lamp);
  box(0.9, 0.9, 0.9, mat('#fff1d6', { emissive: '#ffc27a', emissiveIntensity: 1.4 }), 5.6, 3.9, -5.6, g, false);
  box(0.12, 3.4, 0.12, mat('#3a2b20'), 5.6, 1.7, -5.6, g);
  // bookshelf
  const shelf = mat('#5a3a24');
  box(0.9, 5, 3.4, shelf, -7.4, 2.5, 2.5, g);
  const r = rng(v.seed);
  for (let row = 0; row < 4; row++) for (let k = 0; k < 9; k++) {
    const h = 0.6 + r() * 0.35;
    box(0.6, h, 0.28, mat(['#c0392b', '#2e86c1', '#27ae60', '#f1c40f', '#8e44ad', '#e67e22'][Math.floor(r() * 6)]), -7.15, 0.35 + row * 1.2 + h / 2, 1.1 + k * 0.32, g);
  }
  // wall art
  const frameM = mat('#6b4128');
  const art = (x, y, w, h, c) => { box(w, h, 0.1, frameM, x, y, -6.82, g); box(w - 0.25, h - 0.25, 0.12, mat(c, { emissive: c, emissiveIntensity: 0.15 }), x, y, -6.8, g, false); };
  if (v.kind === 'grandpa') {
    box(4, 3.6, 1.2, mat('#ffffff', { map: brickTex }), 3.5, 1.8, -6.4, g);
    box(2.2, 1.7, 0.2, mat('#1a1210'), 3.5, 1.0, -5.8, g, false);
    box(1.6, 0.5, 0.12, mat('#ff8a2a', { emissive: '#ff7a1a', emissiveIntensity: 2.2 }), 3.5, 0.45, -5.86, g, false);
    box(4.6, 0.3, 1.5, frameM, 3.5, 3.75, -6.2, g);
    for (const cx of [2.0, 5.0]) { box(0.16, 0.5, 0.16, mat('#fff8e7'), cx, 4.15, -6.0, g); box(0.1, 0.12, 0.1, mat('#ffcc66', { emissive: '#ffb347', emissiveIntensity: 3 }), cx, 4.46, -6.0, g, false); }
    art(3.5, 5.4, 1.6, 2.0, '#d7a85c');
    // armchair by the window
    const chair = mat('#8b3a3a');
    const ac = new THREE.Group(); ac.position.set(-3.5, 0, -3.4); ac.rotation.y = 0.25; g.add(ac);
    box(2.3, 0.85, 2.0, chair, 0, 0.42, 0, ac); box(2.3, 2.3, 0.5, chair, 0, 1.4, -0.85, ac);
    box(0.45, 1.3, 2.0, chair, -1.3, 0.85, 0, ac); box(0.45, 1.3, 2.0, chair, 1.3, 0.85, 0, ac);
    // side table with keys
    box(1.3, 0.12, 1.3, frameM, 2.2, 1.4, 1.2, g); box(0.16, 1.4, 0.16, frameM, 2.2, 0.7, 1.2, g);
    const gold = mat('#e8b93a', { metalness: 0.8, roughness: 0.25 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 20), gold); ring.rotation.x = Math.PI / 2; ring.position.set(2.1, 1.48, 1.3); g.add(ring);
    box(0.32, 0.03, 0.08, gold, 2.32, 1.48, 1.3, g); box(0.26, 0.03, 0.07, mat('#c7ccd3', { metalness: 0.8, roughness: 0.25 }), 2.25, 1.5, 1.42, g).rotation.y = 0.6;
    box(0.5, 0.3, 0.4, mat('#4a7fb0'), 1.9, 1.61, 0.9, g);
  } else {
    art(1.6, 4.6, 1.8, 1.4, '#7fb7d9'); art(4.2, 4.9, 1.2, 1.6, '#f2a65a');
    const sofa = mat('#4f6d8f');
    box(5.2, 0.9, 1.9, sofa, 0, 0.45, -4.2, g); box(5.2, 1.6, 0.5, sofa, 0, 1.35, -5.0, g);
    box(0.5, 1.3, 1.9, sofa, -2.8, 0.65, -4.2, g); box(0.5, 1.3, 1.9, sofa, 2.8, 0.65, -4.2, g);
    box(1.2, 0.6, 0.4, mat('#f2d06b'), -1.8, 1.2, -4.6, g).rotation.z = 0.2;
    box(3, 0.15, 1.4, frameM, 5.0, 0.9, 1.5, g); box(0.15, 0.9, 0.15, frameM, 3.7, 0.45, 1.5, g); box(0.15, 0.9, 0.15, frameM, 6.3, 0.45, 1.5, g);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.9, 16), mat('#c96f4a')); pot.position.set(6, 0.45, -5.5); pot.castShadow = true; g.add(pot);
    for (let k = 0; k < 6; k++) { const l = box(0.25, 1.4, 0.06, mat('#3f8a4a'), 6, 1.5, -5.5, g); l.rotation.set(0.3 * Math.cos(k), k, 0.35 * Math.sin(k * 2)); }
  }
  return g;
}
const room = makeRoom({ kind: 'grandpa', wallA: '#a8b58f', wallB: '#9daa84', curtain: '#b54b3c', rug: '#a3523d', rug2: '#c46b4f', seed: 5 });
const home = makeRoom({ kind: 'home', wallA: '#b7c7d6', wallB: '#adbecf', curtain: '#f0e3c4', rug: '#d8c08a', rug2: '#e8d4a2', seed: 8 });

// photo frame prop
const frame = new THREE.Group(); scene.add(frame);
box(0.95, 1.15, 0.08, mat('#6b4128'), 0, 0, 0, frame);
const ph = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.95), mat('#ffffff', { map: photoTex, emissive: '#ffffff', emissiveMap: photoTex, emissiveIntensity: 0.25 }));
ph.position.z = 0.045; frame.add(ph);

// sparkles
const SP = 60;
const spGeo = new THREE.BufferGeometry(); spGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SP * 3), 3));
const sparkles = new THREE.Points(spGeo, new THREE.PointsMaterial({ size: 0.12, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffe9a0' }));
scene.add(sparkles);
const spSeed = Array.from({ length: SP }, (_, i) => { const r = rng(100 + i); return [r(), r(), r(), r()]; });
function setSparkles(center, k, spread = 0.5) {
  sparkles.visible = k > 0;
  const a = spGeo.attributes.position.array;
  spSeed.forEach(([u, v, w, s], i) => {
    const ph = (k * (0.6 + s) + u) % 1;
    const ang = u * 6.283 + k * 3;
    const rad = spread * (0.3 + v * 0.8);
    a[i * 3] = center.x + Math.cos(ang) * rad;
    a[i * 3 + 1] = center.y - 0.4 + ph * 1.4;
    a[i * 3 + 2] = center.z + Math.sin(ang) * rad * 0.7 + (w - 0.5) * 0.3;
  });
  spGeo.attributes.position.needsUpdate = true;
  sparkles.material.opacity = Math.min(1, k * 4) * Math.min(1, (1 - k) * 3 + 0.2);
}

// ---------- environments ----------
function setEnv(name) {
  town.visible = name === 'town' || name === 'sunset';
  room.visible = name === 'room'; home.visible = name === 'home';
  sky.visible = town.visible;
  sun.visible = town.visible;
  if (town.visible) {
    const sunset = name === 'sunset';
    skyU.top.value.set(sunset ? '#5b6fb8' : '#6e9fd6');
    skyU.mid.value.set(sunset ? '#ff9e7a' : '#f6c59a');
    skyU.bot.value.set(sunset ? '#f7b493' : '#f3d6b4');
    sun.color.set(sunset ? '#ffb08a' : '#ffd6a8');
    sun.intensity = sunset ? 2.6 : 3.0;
    hemi.color.set(sunset ? '#f0c8d8' : '#cfe0ff'); hemi.intensity = sunset ? 1.0 : 1.2;
    scene.fog = new THREE.Fog(sunset ? '#f2b296' : '#f1d3b0', 45, 170);
    scene.background = null;
  } else {
    hemi.color.set('#ffe7cf'); hemi.intensity = 0.75;
    scene.fog = null;
    scene.background = C('#2a1f1a');
  }
}

// ---------- shots ----------
const shotStart = T.lines.map((l, i) => (i === 0 ? 0 : l.start - 0.12));
const shotIndex = (t) => { let i = 0; while (i + 1 < shotStart.length && t >= shotStart[i + 1]) i++; return i; };
let camLook = new THREE.Vector3();
function cam(p0, p1, l0, l1, k, fov = 50) {
  camera.position.lerpVectors(v3(p0), v3(p1), k);
  camLook.lerpVectors(v3(l0), v3(l1), k);
  camera.fov = fov; camera.updateProjectionMatrix();
  camera.lookAt(camLook);
}
const face = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2]);

// grandpa's armchair seat
const GX = -3.5, GZ = -3.3, GRY = 0.25;
function grandpaInChair(t, extra = {}) {
  grandpa.place(GX, 0.12, GZ, GRY);
  grandpa.pose({ sit: true, t, armL: [-1.05, 0, 0.32], armR: [-1.05, 0, -0.32], headX: 0.22, ...extra });
}
function framePos() { // photo held in grandpa's hands, facing him
  const a = handPos(grandpa, 0), b = handPos(grandpa, 1);
  const c = a.add(b).multiplyScalar(0.5);
  frame.position.set(c.x, c.y + 0.42, c.z + 0.1);
  frame.rotation.set(-0.55, GRY + Math.PI, 0, 'YXZ');
  frame.visible = true;
}

const shots = {
  town(t, d, k) {
    setEnv('town');
    const [a, b, c, e, gw, gm] = extras;
    a.place(5.2, 0.18, -14 + t * 2.2, 0); a.pose({ walk: t * 7, amp: 0.55, t });
    b.place(6.2, 0.18, -15 + t * 2.2, 0); b.pose({ walk: t * 7 + 1, amp: 0.55, t, headY: -0.5 }); a.expr = 'happy'; b.expr = 'happy';
    c.place(-5.0, 0.18, 4 - t * 2.0, Math.PI); c.pose({ walk: t * 7, amp: 0.5, t }); c.expr = 'smile';
    e.place(-6.0, 0.18, 4.8 - t * 2.0, Math.PI); e.pose({ walk: t * 7 + 2, amp: 0.5, t, headY: 0.4 }); e.expr = 'happy';
    gw.place(-5.5, 0.18, -10 - t * 0.9, Math.PI); gw.pose({ walk: t * 4, amp: 0.3, t, headX: 0.3 }); gw.grey = 0.92; gw.expr = 'sad';
    gm.place(8.15, 0.06, -6, -Math.PI / 2); gm.pose({ sit: true, t, headX: 0.35 }); gm.grey = 0.95; gm.expr = 'sad';
    cam([1.5, 8, 24], [3.6, 3.0, 6], [0, 1.6, -12], [7.5, 1.6, -6], ease(k));
  },
  grandpa(t, d, k) {
    setEnv('room');
    grandpa.place(0, 0, -0.8, 0); grandpa.expr = 'confused';
    grandpa.pose({ t, armR: [-2.7 + Math.sin(t * 9) * 0.12, 0, -0.35], headZ: 0.12, headY: Math.sin(t * 1.5) * 0.2 });
    cam([0.4, 2.6, 7.5], [0.2, 2.5, 4.6], [0, 2.2, -0.8], [0, 2.3, -0.8], ease(k));
  },
  keys(t, d, k) {
    setEnv('room');
    grandpa.o.glassesUp = true;
    grandpa.place(-0.6, 0, -1.6, 0.3); grandpa.expr = k > 0.65 ? 'confused' : 'worried';
    const pat = Math.sin(t * 6) * 0.25;
    grandpa.pose({ t, armL: [-0.3 + pat, 0, 0.25], armR: [-0.3 - pat, 0, -0.25], headY: Math.sin(t * 2.2) * 0.65, headX: 0.1 });
    cam([3.6, 2.1, 4.4], [3.3, 2.2, 3.6], [1.4, 1.5, 0.4], [0.2, 2.2, -1.2], ease(k), 48);
  },
  mom(t, d, k) {
    setEnv('home');
    mom.place(-0.95, 0.12, -4.0, 0); mom.expr = 'sad'; mom.pose({ sit: true, t, headY: 0.45, headX: 0.08, armR: [-0.6, 0, -0.6] });
    kid.place(1.0, 0.12, -4.0, 0); kid.expr = 'sad'; kid.pose({ sit: true, t, headX: 0.35, headY: -0.1 });
    cam([0, 2.5, 4.2], [0, 2.3, 2.4], [0, 1.9, -4], [0, 2.0, -4], ease(k));
  },
  hand(t, d, k) {
    setEnv('home');
    kid.place(0, 0, -1.5, 0); kid.expr = k > 0.25 ? 'shock' : 'worried';
    kid.handGrey = [0, ease((k - 0.12) / 0.75) * 0.95];
    kid.pose({ t, armR: [-1.45, 0, -0.55], headX: 0.18, headY: -0.15 });
    const h = handPos(kid, 1);
    cam([h.x + 0.5, h.y + 0.35, h.z + 3.0], [h.x + 0.35, h.y + 0.3, h.z + 2.3], [h.x - 0.1, h.y + 0.15, h.z - 0.4], [h.x - 0.15, h.y + 0.15, h.z - 0.4], ease(k), 45);
  },
  run(t, d, k) {
    setEnv('town');
    const z = 30 - t * 6.5;
    kid.place(-5.5, 0.18, z, Math.PI); kid.expr = 'worried'; kid.handGrey = [0, 0.95];
    kid.pose({ walk: t * 13, amp: 0.95, t, lean: 0.12 });
    cam([-3.0, 2.0, z - 4.2], [-3.0, 2.0, z - 4.2], [-5.5, 1.9, z], [-5.5, 1.9, z], 0, 52);
  },
  window(t, d, k) {
    setEnv('room');
    grandpaInChair(t); grandpa.expr = 'smile'; framePos();
    const kp = [4.2 - ease(k) * 1.2, 0, 3.6 - ease(k) * 0.8];
    kid.place(kp[0], 0, kp[2], face(kp, [GX, 0, GZ])); kid.expr = 'worried'; kid.handGrey = [0, 0.95];
    kid.pose({ walk: t * 6, amp: k < 0.9 ? 0.35 : 0, t });
    cam([3.2, 3.4, 5.6], [1.6, 3.0, 3.6], [-1.6, 1.9, -2.4], [-2.4, 2.1, -2.8], ease(k));
  },
  ask(t, d, k) {
    setEnv('room');
    grandpaInChair(t, { headX: -0.05, headY: 0.35 }); grandpa.expr = 'smile'; framePos();
    const kp = [-1.4, 0, -0.9];
    kid.place(kp[0], 0, kp[2], face(kp, [GX, 0, GZ])); kid.expr = 'worried'; kid.handGrey = [0, 0.95];
    kid.pose({ t, armR: [-0.35, 0, 0], headX: 0.25 });
    cam([0.3, 3.0, -1.9], [-0.3, 2.9, -2.1], [-2.6, 2.1, -2.2], [-2.8, 2.2, -2.4], ease(k), 50);
  },
  smile(t, d, k) {
    setEnv('room');
    grandpaInChair(t, { headX: 0.28 + Math.sin(t * 1.2) * 0.03 }); grandpa.expr = 'smile'; framePos();
    kid.hide();
    const hp = headPos(grandpa);
    cam([hp.x + 3.4, hp.y + 0.35, hp.z + 2.4], [hp.x + 2.9, hp.y + 0.25, hp.z + 2.0], [hp.x, hp.y - 0.4, hp.z], [hp.x, hp.y - 0.3, hp.z], ease(k), 44);
  },
  photo(t, d, k) {
    setEnv('room');
    grandpaInChair(t); grandpa.expr = 'smile'; framePos();
    const f = frame.position, n = new THREE.Vector3(0, 0, 1).applyEuler(frame.rotation);
    grandpa.headP.visible = false;
    const p0 = f.clone().addScaledVector(n, 1.35), p1 = f.clone().addScaledVector(n, 1.1);
    cam(p0.toArray(), p1.toArray(), f.toArray(), f.toArray(), ease(k), 44);
  },
  handback(t, d, k) {
    setEnv('room');
    grandpaInChair(t); grandpa.expr = 'smile'; framePos();
    const kp = [-1.4, 0, -0.9];
    kid.place(kp[0], 0, kp[2], face(kp, [GX, 0, GZ]) + 0.9); kid.expr = k > 0.45 ? 'happy' : 'shock';
    const g = 0.95 * (1 - ease((k - 0.05) / 0.6)); kid.handGrey = [0, g];
    kid.pose({ t, armR: [-1.45, 0, -0.55], headX: 0.18, headY: -0.15 });
    const h = handPos(kid, 1);
    const fwd = new THREE.Vector3(Math.sin(kid.root.rotation.y), 0, Math.cos(kid.root.rotation.y));
    const side = new THREE.Vector3(fwd.z, 0, -fwd.x);
    const p0 = h.clone().addScaledVector(fwd, 3.0).addScaledVector(side, -0.9).add(new THREE.Vector3(0, 0.35, 0));
    const p1 = h.clone().addScaledVector(fwd, 2.4).addScaledVector(side, -0.7).add(new THREE.Vector3(0, 0.3, 0));
    const l = h.clone().addScaledVector(fwd, -0.4).add(new THREE.Vector3(0, 0.15, 0));
    cam(p0.toArray(), p1.toArray(), l.toArray(), l.toArray(), ease(k), 45);
    setSparkles(h, clamp01(k * 1.1), 0.55);
  },
  greyhand(t, d, k) {
    setEnv('room');
    grandpaInChair(t); grandpa.expr = 'smile'; framePos(); kid.hide();
    grandpa.grey = ease((k - 0.05) / 0.7) * 0.8;
    const hp = headPos(grandpa), a = handPos(grandpa, 0), b = handPos(grandpa, 1);
    const hc = a.add(b).multiplyScalar(0.5);
    const k2 = ease(k);
    cam([hc.x + 2.2, hc.y + 0.5, hc.z + 0.9], [hp.x + 2.2, hp.y + 0.15, hp.z + 1.3], hc.toArray(), [hp.x, hp.y - 0.3, hp.z], k2, 46);
  },
  street2(t, d, k) {
    setEnv('town');
    const [a, b, c, e] = extras;
    grandpa.o.glassesUp = false;
    grandpa.place(8.15, 0.06, -6.3, -Math.PI / 2); grandpa.pose({ sit: true, t, headX: 0.35 }); grandpa.grey = 0.85; grandpa.expr = 'sad';
    a.place(5.2, 0.18, -14 + t * 2.6, 0); a.pose({ walk: t * 7, amp: 0.55, t, headY: -0.6 }); a.expr = 'happy';
    b.place(6.0, 0.18, -15.2 + t * 2.6, 0); b.pose({ walk: t * 7 + 1, amp: 0.55, t, headY: 0.5 }); b.expr = 'happy';
    c.place(5.6, 0.18, 2 - t * 2.4, Math.PI); c.pose({ walk: t * 7, amp: 0.55, t }); c.expr = 'smile';
    e.place(-5.4, 0.18, -2 + t * 1.6, 0); e.pose({ walk: t * 7, amp: 0.5, t }); e.expr = 'smile';
    cam([-1.0, 2.4, 2.0], [1.8, 2.2, -1.0], [8.1, 1.6, -6.3], [8.1, 1.7, -6.3], ease(k), 48);
  },
  porch(t, d, k) {
    setEnv('sunset');
    // porch bench at (-10.4, 0.5, 2) facing +x
    grandpa.place(-10.25, 0.62, 1.4, Math.PI / 2); grandpa.grey = 0.85 * (1 - ease((k - 0.25) / 0.55));
    grandpa.expr = k > 0.6 ? 'happy' : 'smile';
    grandpa.pose({ sit: true, t, headZ: 0.1, armR: [-0.4, 0, -0.3] });
    kid.place(-10.25, 0.62, 2.45, Math.PI / 2); kid.expr = 'happy'; kid.handGrey = [0, 0];
    kid.pose({ sit: true, t, headZ: -0.22, bodyZ: -0.08, armL: [-0.5, 0, 0.9] });
    cam([-6.0, 2.4, 0.2], [-1.5, 3.8, -5.5], [-10.2, 2.1, 1.9], [-10.4, 2.5, 1.9], ease(k), 46);
  },
};

// ---------- captions ----------
const words = T.words.map((w, i) => {
  const line = T.lines.find((l) => w.start >= l.start - 0.01 && w.start <= l.end + 0.01);
  const next = T.words[i + 1];
  const end = Math.min(next && next.start <= line.end ? next.start : line.end + 0.25, line.end + 0.25);
  return { ...w, end };
});

const out = document.getElementById('out');
const ctx = out.getContext('2d');
await document.fonts.load('800 80px Cap');

window.renderAt = (time) => {
  // reset per-frame state
  for (const c of chars) { c.hide(); c.grey = 0; c.handGrey = [0, 0]; c.headP.visible = true; }
  frame.visible = false; sparkles.visible = false;
  grandpa.o.glassesUp = false;
  // story state that persists across shots
  const i = shotIndex(time);
  const name = T.lines[i].shot;
  const t0 = shotStart[i], t1 = shotStart[i + 1] ?? T.duration;
  const t = time - t0, d = t1 - t0;
  shots[name](t, d, t / d);
  if (['window', 'ask', 'smile', 'photo'].includes(name)) kid.handGrey = [0, 0.95];
  for (const c of chars) if (c.root.visible) c.update();
  sky.position.copy(camera.position);
  // keep sun shadow box around the action
  sun.target.position.copy(camLook); sun.position.copy(camLook).add(new THREE.Vector3(28, 24, -30));
  renderer.render(scene, camera);

  ctx.drawImage(renderer.domElement, 0, 0);
  // vignette
  const vg = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.28, W / 2, H * 0.5, H * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,5,0,0.55)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // warm flash when the hand turns back
  if (name === 'handback' && t < 0.6) { ctx.fillStyle = `rgba(255,236,190,${0.75 * (1 - t / 0.6)})`; ctx.fillRect(0, 0, W, H); }
  // caption: one word at a time
  const w = words.find((x) => time >= x.start && time < x.end);
  if (w) {
    const pop = 1 + 0.18 * Math.max(0, 1 - (time - w.start) / 0.09);
    ctx.save(); ctx.translate(W / 2, H * 0.6); ctx.scale(pop, pop);
    ctx.font = '800 92px Cap'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    ctx.strokeText(w.w, 0, 0);
    ctx.shadowColor = 'transparent'; ctx.fillStyle = '#ffffff'; ctx.fillText(w.w, 0, 0);
    ctx.restore();
  }
  // fade in / fade out
  const fadeIn = clamp01(1 - time / 0.5), fadeOut = clamp01((time - (T.duration - 1.6)) / 1.2);
  const f = Math.max(fadeIn, fadeOut);
  if (f > 0) { ctx.fillStyle = `rgba(0,0,0,${f})`; ctx.fillRect(0, 0, W, H); }
  return out.toDataURL('image/jpeg', 0.93);
};
window.duration = T.duration;
window.ready = true;
