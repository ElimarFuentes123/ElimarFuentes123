// In-This-Town engine: blocky characters, reusable sets, props, lighting presets,
// shot timing, one-word captions. Episodes import this and only describe shots.
// Style rules: references/in-this-town/STYLE-RULES.md
import * as THREE from 'three';
export { THREE };

export const W = 1080, H = 1920;
export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(50, W / H, 0.05, 1200);

// ---------------- helpers ----------------
export const C = (c) => new THREE.Color(c);
export const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });
export function box(w, h, d, m, x = 0, y = 0, z = 0, parent = null, shadow = true) {
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  me.position.set(x, y, z); me.castShadow = shadow; me.receiveShadow = true;
  if (parent) parent.add(me);
  return me;
}
export function cyl(rt, rb, h, m, x = 0, y = 0, z = 0, parent = null, seg = 24) {
  const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true;
  if (parent) parent.add(me);
  return me;
}
export function sphere(r, m, x = 0, y = 0, z = 0, parent = null, seg = 16) {
  const me = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), m);
  me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true;
  if (parent) parent.add(me);
  return me;
}
export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
export function signTex(text, { w = 1024, h = 256, bg = '#1f3a8a', fg = '#ffffff', font = '800 150px Cap', border = null } = {}) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    if (border) { g.strokeStyle = border; g.lineWidth = 24; g.strokeRect(12, 12, w - 24, h - 24); }
    g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + 8);
  });
}
export function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const ease = (x) => { x = clamp01(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
export const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
export const lerp = (a, b, k) => a + (b - a) * k;
export const v3 = (a) => (a.isVector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]));
export const face = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2]);
function greyOf(c) { const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; return new THREE.Color(l * 0.92, l * 0.95, l * 1.02); }

// ---------------- faces ----------------
function drawFace(ctx, skin, expr, o) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = skin; ctx.fillRect(0, 0, 512, 256);
  ctx.save(); ctx.translate(256, 0); ctx.scale(0.6, 1);
  const ink = '#1b1410', ey = 112, ex = 46;
  ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 9;
  const eye = (x, s = 1, look = 0) => {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x, ey, 17 * s, 22 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(x + look * 6, ey + 2, 11 * s, 15 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x + look * 6 + 4 * s, ey - 5 * s, 4 * s, 5 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = ink;
  };
  const closed = expr === 'happy' || expr === 'laugh';
  if (closed) { for (const x of [-ex, ex]) { ctx.beginPath(); ctx.arc(x, ey + 8, 16, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); } }
  else if (expr === 'sleep') { for (const x of [-ex, ex]) { ctx.beginPath(); ctx.arc(x, ey - 4, 15, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); } }
  else if (expr === 'shock') { eye(-ex, 1.3); eye(ex, 1.3); }
  else { const lk = o.look || 0; eye(-ex, 1, lk); eye(ex, 1, lk); }
  ctx.lineWidth = 8;
  const brow = (x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  if (['sad', 'cry', 'worried'].includes(expr)) { brow(-ex - 20, ey - 30, -ex + 14, ey - 44); brow(ex + 20, ey - 30, ex - 14, ey - 44); }
  else if (expr === 'angry' || expr === 'determined') { brow(-ex - 20, ey - 46, -ex + 16, ey - 32); brow(ex + 20, ey - 46, ex - 16, ey - 32); }
  else if (expr === 'smirk' || expr === 'confused') { brow(-ex - 18, ey - 36, -ex + 16, ey - 36); brow(ex - 16, ey - 48, ex + 18, ey - 42); }
  else if (expr === 'shock') { ctx.beginPath(); ctx.arc(-ex, ey - 30, 22, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); ctx.beginPath(); ctx.arc(ex, ey - 30, 22, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
  if (o.beard) { ctx.fillStyle = o.beard; ctx.beginPath(); ctx.moveTo(-95, 135); ctx.quadraticCurveTo(0, 250, 95, 135); ctx.lineTo(95, 256); ctx.lineTo(-95, 256); ctx.fill(); ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, 172, 34, 20, 0, 0, 7); ctx.fill(); ctx.fillStyle = ink; }
  if (o.mustache) { ctx.fillStyle = o.mustache === true ? '#ecebe6' : o.mustache; ctx.beginPath(); ctx.ellipse(-22, 150, 30, 11, 0.15, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(22, 150, 30, 11, -0.15, 0, 7); ctx.fill(); ctx.fillStyle = ink; }
  ctx.lineWidth = 9;
  const my = o.mustache ? 174 : 162;
  if (expr === 'happy' || expr === 'laugh' || expr === 'grin') {
    const r = expr === 'laugh' ? 36 : 30;
    ctx.beginPath(); ctx.arc(0, my - 4, r, 0, Math.PI); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e2566a'; ctx.beginPath(); ctx.ellipse(0, my + r * 0.55, r * 0.5, 8, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,140,0.35)';
    ctx.beginPath(); ctx.ellipse(-82, 150, 20, 12, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(82, 150, 20, 12, 0, 0, 7); ctx.fill();
  } else if (expr === 'smile') { ctx.beginPath(); ctx.arc(0, my - 22, 32, Math.PI * 0.22, Math.PI * 0.78); ctx.stroke(); }
  else if (expr === 'smirk') { ctx.beginPath(); ctx.moveTo(-26, my + 4); ctx.quadraticCurveTo(10, my + 10, 30, my - 8); ctx.stroke(); }
  else if (['sad', 'cry', 'worried'].includes(expr)) { ctx.beginPath(); ctx.arc(0, my + 26, 24, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke(); }
  else if (expr === 'shock') { ctx.beginPath(); ctx.ellipse(0, my + 8, 13, 18, 0, 0, 7); ctx.fill(); }
  else if (expr === 'angry' || expr === 'determined') { ctx.beginPath(); ctx.moveTo(-24, my + 4); ctx.lineTo(24, my + 4); ctx.stroke(); }
  else if (expr === 'talk') { ctx.beginPath(); ctx.ellipse(0, my, 18, 12, 0, 0, 7); ctx.fill(); }
  else if (expr === 'sleep') { ctx.beginPath(); ctx.arc(0, my - 14, 14, Math.PI * 0.3, Math.PI * 0.7); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(0, my - 14, 20, Math.PI * 0.3, Math.PI * 0.7); ctx.stroke(); }
  if (expr === 'cry') { ctx.fillStyle = 'rgba(90,180,255,0.9)'; for (const x of [-ex, ex]) { ctx.beginPath(); ctx.roundRect(x - 8, ey + 18, 16, 110, 8); ctx.fill(); } }
  if (o.glasses) {
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 6;
    for (const x of [-ex, ex]) { ctx.beginPath(); ctx.arc(x, ey, 30, 0, 7); ctx.stroke(); }
    brow(-ex + 30, ey, ex - 30, ey); brow(-ex - 30, ey, -ex - 90, ey - 6); brow(ex + 30, ey, ex + 90, ey - 6);
  }
  ctx.restore();
}

// ---------------- characters ----------------
export const chars = [];
export function makeChar(o) {
  const root = new THREE.Group(); scene.add(root);
  const greyables = [];
  const gm = (c) => { const m = mat(c); greyables.push({ m, base: C(c) }); return m; };
  const skin = o.skin || '#f6c945';
  const shirt = gm(o.shirt), pants = gm(o.pants), shoe = gm(o.shoes || '#f1efe9'), skinM = gm(skin), hairM = gm(o.hair || '#3b2618');
  const handM = [mat(skin), mat(skin)];
  const body = new THREE.Group(); root.add(body);
  const legs = [-0.26, 0.26].map((x) => {
    const p = new THREE.Group(); p.position.set(x, 1.0, 0); body.add(p);
    box(0.5, 0.86, 0.52, pants, 0, -0.42, 0, p); box(0.52, 0.18, 0.58, shoe, 0, -0.91, 0.03, p);
    return p;
  });
  box(1.04, 1.0, 0.54, shirt, 0, 1.5, 0, body);
  if (o.stripe) box(1.05, 0.14, 0.55, gm(o.stripe), 0, 1.3, 0, body);
  if (o.hood) box(0.86, 0.32, 0.2, shirt, 0, 1.88, -0.3, body);
  if (o.tie) box(0.16, 0.7, 0.04, gm(o.tie), 0, 1.6, 0.29, body);
  if (o.vest) { box(0.3, 0.98, 0.04, gm(o.vest), -0.36, 1.5, 0.28, body); box(0.3, 0.98, 0.04, gm(o.vest), 0.36, 1.5, 0.28, body); }
  if (o.logo) { const lg = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), mat('#fff', { map: o.logo, transparent: true })); lg.position.set(0, 1.55, 0.275); body.add(lg); }
  const arms = [-1, 1].map((s, i) => {
    const p = new THREE.Group(); p.position.set(s * 0.78, 1.95, 0); body.add(p);
    box(0.5, 0.62, 0.52, shirt, 0, -0.3, 0, p); box(0.47, 0.38, 0.49, handM[i], 0, -0.8, 0, p);
    return p;
  });
  const headP = new THREE.Group(); headP.position.y = 2.02; body.add(headP);
  const fc = document.createElement('canvas'); fc.width = 512; fc.height = 256;
  const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 8;
  const faceM = mat('#ffffff', { map: ft });
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.74, 48, 1, false, Math.PI, Math.PI * 2), [faceM, skinM, skinM]);
  head.position.y = 0.39; head.castShadow = true; head.receiveShadow = true; headP.add(head);
  const hy = 0.39, ht = o.hairType;
  if (ht === 'kid' || ht === 'dad') {
    const tall = ht === 'kid' ? 0.28 : 0.2;
    box(0.92, tall, 0.92, hairM, 0, hy + 0.42, -0.02, headP);
    box(0.92, 0.5, 0.22, hairM, 0, hy + 0.12, -0.35, headP);
    if (ht === 'kid') box(0.86, 0.13, 0.14, hairM, 0.06, hy + 0.32, 0.38, headP);
    box(0.14, 0.34, 0.7, hairM, -0.39, hy + 0.2, -0.05, headP); box(0.14, 0.34, 0.7, hairM, 0.39, hy + 0.2, -0.05, headP);
  } else if (ht === 'grandpa') {
    box(0.14, 0.3, 0.55, hairM, -0.4, hy + 0.12, -0.06, headP); box(0.14, 0.3, 0.55, hairM, 0.4, hy + 0.12, -0.06, headP);
    box(0.7, 0.32, 0.16, hairM, 0, hy + 0.12, -0.38, headP);
  } else if (ht === 'mom' || ht === 'long') {
    box(0.94, 0.24, 0.94, hairM, 0, hy + 0.42, -0.02, headP); box(0.94, 1.1, 0.26, hairM, 0, hy - 0.05, -0.36, headP);
    box(0.16, 0.9, 0.62, hairM, -0.4, hy, -0.08, headP); box(0.16, 0.9, 0.62, hairM, 0.4, hy, -0.08, headP);
  } else if (ht === 'bob') {
    box(0.94, 0.26, 0.94, hairM, 0, hy + 0.42, -0.02, headP); box(0.94, 0.6, 0.22, hairM, 0, hy + 0.1, -0.37, headP);
    box(0.16, 0.6, 0.62, hairM, -0.4, hy + 0.1, -0.06, headP); box(0.16, 0.6, 0.62, hairM, 0.4, hy + 0.1, -0.06, headP);
  } else if (ht === 'cap' || ht === 'police') {
    const capM = gm(o.cap || '#d33');
    box(0.9, 0.22, 0.9, capM, 0, hy + 0.45, 0, headP); box(0.84, 0.06, 0.44, capM, 0, hy + 0.35, 0.58, headP);
    if (ht === 'police') box(0.2, 0.16, 0.04, gm('#f2c94c'), 0, hy + 0.48, 0.46, headP);
  } else if (ht === 'tophat') {
    cyl(0.62, 0.62, 0.06, gm(o.cap || '#151515'), 0, hy + 0.4, 0, headP, 32);
    cyl(0.4, 0.4, 0.8, gm(o.cap || '#151515'), 0, hy + 0.82, 0, headP, 32);
    cyl(0.41, 0.41, 0.14, gm(o.band || '#b8292f'), 0, hy + 0.5, 0, headP, 32);
  } else if (ht === 'hood') {
    const hm = gm(o.shirt);
    box(1.0, 0.24, 1.0, hm, 0, hy + 0.45, -0.04, headP); box(1.0, 0.8, 0.2, hm, 0, hy + 0.05, -0.46, headP);
    box(0.14, 0.8, 0.9, hm, -0.49, hy + 0.05, -0.02, headP); box(0.14, 0.8, 0.9, hm, 0.49, hy + 0.05, -0.02, headP);
  } else if (ht === 'beanie') {
    const bm = gm(o.cap || '#3b6fd6');
    box(0.94, 0.34, 0.94, bm, 0, hy + 0.42, -0.02, headP); box(0.96, 0.12, 0.96, gm('#f4f4f4'), 0, hy + 0.27, -0.02, headP);
  }
  const ch = { root, body, legs, arms, headP, o, expr: 'smile', grey: 0, handGrey: [0, 0], _key: '' };
  ch.update = () => {
    for (const g of greyables) g.m.color.copy(g.base).lerp(greyOf(g.base), ch.grey);
    const sk = C(skin);
    handM.forEach((m, i) => m.color.copy(sk).lerp(greyOf(sk), Math.max(ch.grey, ch.handGrey[i])));
    const key = ch.expr + '|' + ch.grey.toFixed(2) + '|' + (o.look || 0);
    if (key !== ch._key) {
      ch._key = key;
      drawFace(fc.getContext('2d'), '#' + sk.clone().lerp(greyOf(sk), ch.grey).getHexString(THREE.SRGBColorSpace), ch.expr, o);
      ft.needsUpdate = true;
    }
  };
  ch.place = (x, y, z, ry = 0, rx = 0, rz = 0) => { root.position.set(x, y, z); root.rotation.set(rx, ry, rz, 'YXZ'); root.visible = true; return ch; };
  ch.pose = (p = {}) => {
    const ph = p.walk || 0, amp = p.amp ?? 0, s = Math.sin(ph) * amp;
    legs[0].rotation.set(s, 0, 0); legs[1].rotation.set(-s, 0, 0);
    arms[0].rotation.set(-s * 0.9, 0, 0); arms[1].rotation.set(s * 0.9, 0, 0);
    body.position.y = amp ? Math.abs(Math.cos(ph)) * 0.08 * amp : 0;
    body.rotation.set(p.lean || 0, p.bodyY || 0, p.bodyZ || 0);
    if (p.sit) { legs[0].rotation.x = -Math.PI / 2; legs[1].rotation.x = -Math.PI / 2; }
    if (p.armL) arms[0].rotation.set(p.armL[0], p.armL[1] || 0, p.armL[2] || 0);
    if (p.armR) arms[1].rotation.set(p.armR[0], p.armR[1] || 0, p.armR[2] || 0);
    headP.rotation.set(p.headX || 0, p.headY || 0, p.headZ || 0);
    if (p.jump) body.position.y += Math.abs(Math.sin(p.jump)) * 0.5;
    body.scale.y = 1 + Math.sin((p.t || 0) * 2.2) * 0.006;
    return ch;
  };
  ch.say = (t, open = 'talk', closed = 'smile') => { ch.expr = Math.sin(t * 22) > -0.2 ? open : closed; return ch; };
  ch.hide = () => { root.visible = false; };
  chars.push(ch);
  return ch;
}
export function handPos(ch, i) { const v = new THREE.Vector3(0, -0.8, 0); ch.root.updateMatrixWorld(true); return ch.arms[i].localToWorld(v); }
export function headPos(ch, dy = 0.4) { const v = new THREE.Vector3(0, dy, 0); ch.root.updateMatrixWorld(true); return ch.headP.localToWorld(v); }

const extraPalette = { shirt: ['#ee4f9c', '#3bb37a', '#f4d03f', '#4a8fe0', '#ff7a1c', '#9b59b6', '#e74c3c', '#1abc9c', '#f39c12', '#ffffff'], pants: ['#2a3a6a', '#3a3a46', '#56503f', '#2b4a86', '#4a4a4a'], hair: ['#2e1d12', '#6b3a1e', '#1c1c1c', '#c9a04a', '#8a4b2a'] };
export function makeExtras(n, seed = 1) {
  const r = rng(seed), pick = (a) => a[Math.floor(r() * a.length)];
  const types = ['kid', 'cap', 'bob', 'mom', 'dad', 'beanie', 'grandpa'];
  return Array.from({ length: n }, () => makeChar({ shirt: pick(extraPalette.shirt), pants: pick(extraPalette.pants), hair: pick(extraPalette.hair), hairType: pick(types), cap: pick(extraPalette.shirt) }));
}

// ---------------- sky + lighting ----------------
const skyU = { top: { value: C('#4f9be8') }, mid: { value: C('#bfe3ff') }, bot: { value: C('#d8eefc') } };
export const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: 'uniform vec3 top, mid, bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0. ? mix(mid, top, smoothstep(0., .42, h)) : bot; gl_FragColor = vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
}));
sky.renderOrder = -10; scene.add(sky);
const starGeo = new THREE.BufferGeometry();
{ const r = rng(77), a = []; for (let i = 0; i < 700; i++) { const th = r() * 6.283, y = 0.08 + r() * 0.9, rr = Math.sqrt(1 - y * y); a.push(Math.cos(th) * rr * 850, y * 850, Math.sin(th) * rr * 850); } starGeo.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); }
export const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 3, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9 }));
sky.add(stars);
export const moon = new THREE.Mesh(new THREE.CircleGeometry(38, 32), new THREE.MeshBasicMaterial({ color: '#fff6d8', fog: false }));
moon.position.set(-300, 420, -650); moon.lookAt(0, 0, 0); sky.add(moon);
const clouds = new THREE.Group(); sky.add(clouds);
{ const r = rng(12), cm = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false });
  for (let i = 0; i < 14; i++) { const g = new THREE.Group(); const th = r() * 6.283; g.position.set(Math.cos(th) * 700, 120 + r() * 220, Math.sin(th) * 700); g.lookAt(0, g.position.y, 0);
    for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(30 + r() * 25, 12, 8), cm); s.position.set((k - 2) * 38, r() * 20, 0); g.add(s); } clouds.add(g); } }

export const sun = new THREE.DirectionalLight('#fff4e0', 3.2);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 160 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);
export const hemi = new THREE.HemisphereLight('#dbeaff', '#8a7a5a', 1.4);
scene.add(hemi);
export const glassMat = mat('#ffd98a', { emissive: '#ffb85a', emissiveIntensity: 0.3, roughness: 0.25 });
let sunOffset = new THREE.Vector3(18, 30, 14);

const LIGHT = {
  day: { top: '#3f8fe6', mid: '#bfe3ff', bot: '#e3f2fd', sun: '#fff4e0', sunI: 3.2, off: [18, 30, 14], hemi: '#dbeaff', hemiG: '#8a7a5a', hemiI: 1.45, fog: '#cfe6fb', fogN: 70, fogF: 260, glass: 0.25, exp: 1.12, stars: 0, clouds: 1 },
  golden: { top: '#6e9fd6', mid: '#f6c59a', bot: '#f3d6b4', sun: '#ffd6a8', sunI: 3.0, off: [28, 20, -30], hemi: '#cfe0ff', hemiG: '#7a6a50', hemiI: 1.2, fog: '#f1d3b0', fogN: 50, fogF: 200, glass: 0.6, exp: 1.05, stars: 0, clouds: 1 },
  night: { top: '#0d1a44', mid: '#2a3d78', bot: '#1c2850', sun: '#a9bcff', sunI: 1.6, off: [14, 30, 22], hemi: '#7084c8', hemiG: '#2a2a3a', hemiI: 1.3, fog: '#1c2850', fogN: 40, fogF: 160, glass: 1.6, exp: 1.45, stars: 1, clouds: 0 },
  storm: { top: '#111a33', mid: '#26324f', bot: '#1a2238', sun: '#b4c4f0', sunI: 1.5, off: [14, 26, 24], hemi: '#7a8cc0', hemiG: '#2a2a33', hemiI: 1.2, fog: '#1a2238', fogN: 34, fogF: 130, glass: 1.6, exp: 1.35, stars: 0.25, clouds: 0 },
};
export const sets = {};
export function addSet(name, group) { sets[name] = group; group.visible = false; scene.add(group); return group; }
export const roomLights = [];
export function show(setName, light = 'day') {
  for (const [n, g] of Object.entries(sets)) g.visible = n === setName;
  const indoor = sets[setName]?.userData.indoor;
  const L = LIGHT[light] || LIGHT.day;
  sky.visible = !indoor;
  sun.visible = !indoor;
  stars.material.opacity = L.stars; stars.visible = L.stars > 0; moon.visible = L.stars > 0.5; clouds.visible = L.clouds > 0;
  glassMat.emissiveIntensity = L.glass;
  renderer.toneMappingExposure = L.exp;
  if (!indoor) {
    skyU.top.value.set(L.top); skyU.mid.value.set(L.mid); skyU.bot.value.set(L.bot);
    sun.color.set(L.sun); sun.intensity = L.sunI; sunOffset.set(...L.off);
    hemi.color.set(L.hemi); hemi.groundColor.set(L.hemiG); hemi.intensity = L.hemiI;
    scene.fog = new THREE.Fog(L.fog, L.fogN, L.fogF); scene.background = null;
  } else {
    const night = light === 'night' || light === 'storm';
    hemi.color.set(night ? '#8ea0d8' : '#fff1e0'); hemi.groundColor.set('#6a5a48'); hemi.intensity = night ? 0.55 : 1.15;
    renderer.toneMappingExposure = night ? 1.2 : 1.1;
    scene.fog = null; scene.background = C(night ? '#0c1020' : '#2a2420');
    const g = sets[setName];
    g.userData.setNight?.(night);
  }
}

// ---------------- shared textures ----------------
export const woodTex = canvasTex(512, 512, (g) => {
  const r = rng(3);
  for (let i = 0; i < 8; i++) {
    const c = 150 + r() * 30; g.fillStyle = `rgb(${c},${c * 0.66},${c * 0.42})`; g.fillRect(0, i * 64, 512, 64);
    g.fillStyle = 'rgba(60,30,10,0.45)'; g.fillRect(0, i * 64, 512, 3); g.fillRect(r() * 512, i * 64, 3, 64);
  }
}, [3, 3]);
export const tileTex = canvasTex(256, 256, (g) => {
  g.fillStyle = '#e9e4dc'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#cfc8bd'; g.lineWidth = 4;
  for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
}, [40, 40]);
export const wallTex = (a, b) => canvasTex(256, 256, (g) => { g.fillStyle = a; g.fillRect(0, 0, 256, 256); g.fillStyle = b; for (let x = 0; x < 256; x += 64) g.fillRect(x, 0, 24, 256); }, [6, 3]);
export const dotTex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,240,190,0.8)'); r.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });

// ---------------- props ----------------
const white = mat('#f4f1ea');
export function roundTree(parent, x, z, s = 1, color = '#4caf50') {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
  cyl(0.28, 0.35, 2.2, mat('#7a5233'), 0, 1.1, 0, g, 10);
  const lm = mat(color);
  [[0, 3.2, 0, 1.5], [0.9, 2.8, 0.3, 1.1], [-0.9, 2.9, -0.2, 1.15], [0.2, 4.1, -0.2, 1.1], [-0.3, 2.7, 0.9, 1.0]].forEach(([a, b, c, r]) => sphere(r, lm, a, b, c, g, 12));
  return g;
}
export function pine(parent, x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
  cyl(0.25, 0.3, 1.5, mat('#6b4a30'), 0, 0.75, 0, g, 8);
  [[2.2, 2.6, 2], [1.7, 2.2, 3.4], [1.1, 1.8, 4.6]].forEach(([r, h, y], k) => { const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), mat(k % 2 ? '#3f8a45' : '#2f7a3a')); c.position.y = y; c.castShadow = true; g.add(c); });
  return g;
}
export function lamp(parent, x, z) {
  const pole = mat('#2d2f36', { metalness: 0.4, roughness: 0.5 });
  box(0.18, 4.6, 0.18, pole, x, 2.3, z, parent); box(0.9, 0.12, 0.12, pole, x - 0.4 * Math.sign(x || 1), 4.55, z, parent);
  box(0.4, 0.3, 0.4, mat('#fff3cf', { emissive: '#ffd27a', emissiveIntensity: 1.2 }), x - 0.8 * Math.sign(x || 1), 4.4, z, parent, false);
}
export function bench(parent, x, y, z, ry) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  const wood = mat('#a0683a'), iron = mat('#2b2b30', { metalness: 0.5, roughness: 0.4 });
  box(2.8, 0.12, 0.75, wood, 0, 0.75, 0, g); box(2.8, 0.7, 0.1, wood, 0, 1.2, -0.36, g);
  for (const s of [-1, 1]) { box(0.1, 0.75, 0.7, iron, s * 1.2, 0.37, 0, g); box(0.1, 0.9, 0.1, iron, s * 1.2, 1.15, -0.38, g); }
  return g;
}
export function car(parent, x, z, ry, color = '#d23b3b') {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
  const bm = mat(color, { roughness: 0.35, metalness: 0.2 });
  box(2.2, 0.9, 4.4, bm, 0, 0.85, 0, g); box(1.9, 0.75, 2.2, bm, 0, 1.65, -0.3, g);
  box(1.92, 0.55, 2.0, mat('#9cc9ef', { roughness: 0.1, metalness: 0.3 }), 0, 1.68, -0.3, g, false);
  for (const [a, b] of [[-1, 1.4], [1, 1.4], [-1, -1.4], [1, -1.4]]) { const w = cyl(0.45, 0.45, 0.35, mat('#1d1d22'), a * 1.05, 0.45, b, g, 16); w.rotation.z = Math.PI / 2; }
  box(0.5, 0.25, 0.06, mat('#fff8d0', { emissive: '#fff3b0', emissiveIntensity: 0.8 }), -0.65, 0.95, 2.21, g, false);
  box(0.5, 0.25, 0.06, mat('#fff8d0', { emissive: '#fff3b0', emissiveIntensity: 0.8 }), 0.65, 0.95, 2.21, g, false);
  return g;
}
export function umbrella(color = '#2b4fd6') {
  const g = new THREE.Group(); scene.add(g);
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.45, 0.6, 8, 1, true), mat(color, { side: THREE.DoubleSide }));
  canopy.position.y = 2.0; canopy.castShadow = true; g.add(canopy);
  cyl(0.04, 0.04, 2.1, mat('#222'), 0, 1.0, 0, g, 8);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 6, 12, Math.PI), mat('#222')); hook.position.y = -0.02; hook.rotation.z = Math.PI; g.add(hook);
  g.visible = false;
  return g;
}

// ---- rain clouds: personal (small) or storm (huge). update(t) animates rain ----
export function rainCloud({ size = 1, dark = false, drops = 70, width = 0.9, fall = 2.2, color } = {}) {
  const g = new THREE.Group(); scene.add(g);
  const cm = mat(color || (dark ? '#3c4250' : '#9aa3b0'), { roughness: 1 });
  const r = rng(Math.floor(size * 1000) + drops);
  const puffs = dark ? 26 : 7;
  for (let i = 0; i < puffs; i++) {
    const s = sphere((0.35 + r() * 0.3) * size * (dark ? 1.6 : 1), cm, (r() - 0.5) * 1.7 * size * (dark ? 3 : 1), (r() - 0.3) * 0.35 * size * (dark ? 2 : 1), (r() - 0.5) * 0.9 * size * (dark ? 3 : 1), g, 12);
    s.castShadow = !dark;
  }
  const pos = new Float32Array(drops * 6);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#b8d4ff', transparent: true, opacity: 0.75 })); lines.frustumCulled = false;
  g.add(lines);
  const seeds = Array.from({ length: drops }, () => [r(), r(), r()]);
  g.userData.update = (t, k = 1) => {
    const n = Math.floor(drops * clamp01(k));
    seeds.forEach(([a, b, c], i) => {
      const ph = (t * (dark ? 1.6 : 1.3) + c) % 1;
      const x = (a - 0.5) * width * 2 * size, z = (b - 0.5) * width * 1.2 * size;
      let y = -0.2 - ph * fall * size, y2 = y - 0.22 * (dark ? 2 : 1);
      let vis = i < n ? 1 : 0;
      const sh = g.userData.shelter; // {x,z,r,y} in world space: drops stop on the umbrella
      if (sh && vis) {
        const wx = g.position.x + x, wz = g.position.z + z;
        if ((wx - sh.x) ** 2 + (wz - sh.z) ** 2 < sh.r * sh.r) {
          const ly = sh.y - g.position.y;
          if (y < ly) vis = 0; else if (y2 < ly) y2 = ly;
        }
      }
      pos.set([x, y * vis, z, x - 0.02, y2 * vis, z], i * 6);
    });
    lines.visible = n > 0;
    geo.attributes.position.needsUpdate = true;
  };
  g.visible = false;
  return g;
}

export const sparkles = (() => {
  const N = 70, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.14, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffe9a0' }));
  scene.add(p);
  const seeds = Array.from({ length: N }, (_, i) => { const r = rng(100 + i); return [r(), r(), r(), r()]; });
  p.userData.set = (center, k, spread = 0.6) => {
    p.visible = k > 0; const a = geo.attributes.position.array;
    seeds.forEach(([u, v, w, s], i) => { const ph = (k * (0.6 + s) + u) % 1, ang = u * 6.283 + k * 3, rad = spread * (0.3 + v * 0.8);
      a[i * 3] = center.x + Math.cos(ang) * rad; a[i * 3 + 1] = center.y - 0.4 + ph * 1.4; a[i * 3 + 2] = center.z + Math.sin(ang) * rad * 0.7 + (w - 0.5) * 0.3; });
    geo.attributes.position.needsUpdate = true;
  };
  return p;
})();

// ---------------- sets ----------------
// Town street: road along Z, houses both sides, front facing the road.
export function buildTown(name = 'town', { seed = 42, houseColors } = {}) {
  const town = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), mat('#6cbf4f')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; town.add(ground);
  box(8, 0.05, 800, mat('#4a5266'), 0, 0.025, 0, town, false);
  const dash = mat('#f7f1d4'); for (let z = -260; z < 260; z += 7) box(0.22, 0.06, 3, dash, 0, 0.03, z, town, false);
  const walk = mat('#dcd8d0'); for (const s of [-1, 1]) { box(3, 0.18, 800, walk, s * 5.5, 0.09, 0, town, false); box(0.2, 0.22, 800, mat('#c4bdb2'), s * 4.05, 0.11, 0, town, false); }
  const r = rng(seed);
  const walls = houseColors || ['#f2e2c4', '#ef8f7a', '#7fb5e8', '#f6d36b', '#a8d8a0', '#f4f1ea', '#c9a3e6', '#ffb26b'];
  const roofs = ['#c0392b', '#34495e', '#8e5a3c', '#2c6fb3', '#7a4a8a'];
  const tri = new THREE.Shape(); tri.moveTo(-4.2, 0); tri.lineTo(4.2, 0); tri.lineTo(0, 3.2); tri.closePath();
  const triGeo = new THREE.ExtrudeGeometry(tri, { depth: 8, bevelEnabled: false });
  for (const s of [-1, 1]) for (let i = -11; i <= 11; i++) {
    const g = new THREE.Group(); g.position.set(s * 15, 0, i * 13); g.rotation.y = s > 0 ? Math.PI : 0; town.add(g);
    const wm = mat(walls[Math.floor(r() * walls.length)]);
    box(8, 6, 8, wm, 0, 3, 0, g);
    const t = new THREE.Mesh(triGeo, wm); t.position.set(0, 6, -4); t.castShadow = true; g.add(t);
    const rm = mat(roofs[Math.floor(r() * roofs.length)]);
    for (const q of [-1, 1]) { const sl = box(5.4, 0.35, 9, rm, q * 2.15, 7.65, 0, g); sl.rotation.z = -q * 0.65; }
    for (const wz of [-2, 2]) { box(0.2, 1.9, 1.7, white, 4.02, 4.3, wz, g); box(0.24, 1.5, 1.3, glassMat, 4.04, 4.3, wz, g, false); box(0.26, 0.1, 1.3, white, 4.06, 4.3, wz, g, false); }
    box(0.2, 1.9, 1.7, white, 4.02, 1.8, -2, g); box(0.24, 1.5, 1.3, glassMat, 4.04, 1.8, -2, g, false);
    box(0.2, 2.8, 1.5, white, 4.02, 1.4, 2, g); box(0.24, 2.5, 1.2, mat(roofs[Math.floor(r() * roofs.length)]), 4.05, 1.3, 2, g);
    if (r() < 0.5) roundTree(town, s * (10 + r()), i * 13 + 6.5, 0.9 + r() * 0.4, ['#4caf50', '#66bb6a', '#43a047'][Math.floor(r() * 3)]);
    else pine(town, s * (10 + r()), i * 13 + 6.5, 0.9 + r() * 0.4);
  }
  for (const s of [-1, 1]) for (let z = -260; z <= 260; z += 26) lamp(town, s * 6.8, z + 3);
  const pk = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.9, 0.18), white, 1200); let n = 0; const m4 = new THREE.Matrix4();
  for (const s of [-1, 1]) for (let z = -80; z < 80; z += 0.55) { m4.makeTranslation(s * 8.6, 0.45, z); pk.setMatrixAt(n++, m4); }
  pk.count = n; pk.castShadow = true; town.add(pk);
  return addSet(name, town);
}

// Town plaza: fountain, town hall with columns, podium, round trees.
export function buildPlaza(name = 'plaza', { hallText = 'TOWN HALL' } = {}) {
  const g = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat('#ffffff', { map: tileTex })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  // fountain
  cyl(4, 4.2, 0.8, mat('#d9d4cc'), 0, 0.4, 0, g, 40);
  cyl(3.6, 3.6, 0.1, mat('#5ec8f2', { emissive: '#2aa7e0', emissiveIntensity: 0.25, roughness: 0.1 }), 0, 0.78, 0, g, 40);
  cyl(0.6, 0.8, 2.2, mat('#d9d4cc'), 0, 1.6, 0, g, 20); cyl(1.6, 1.2, 0.3, mat('#d9d4cc'), 0, 2.7, 0, g, 24);
  cyl(0.25, 0.4, 1.4, mat('#bde9fb', { emissive: '#7fd3f5', emissiveIntensity: 0.4, transparent: true, opacity: 0.8 }), 0, 3.5, 0, g, 12);
  // town hall
  const hall = new THREE.Group(); hall.position.set(0, 0, -22); g.add(hall);
  box(26, 12, 10, mat('#f4efe4'), 0, 6, -2, hall); box(28, 1, 12, mat('#e0d8c8'), 0, 12.5, -2, hall);
  const tri = new THREE.Shape(); tri.moveTo(-10, 0); tri.lineTo(10, 0); tri.lineTo(0, 4); tri.closePath();
  const ped = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 1, bevelEnabled: false }), mat('#efe8da')); ped.position.set(0, 13, 3); ped.castShadow = true; hall.add(ped);
  for (let i = -4; i <= 4; i++) cyl(0.5, 0.55, 10, mat('#fbf8f2'), i * 2.3, 5, 3.6, hall, 16);
  box(24, 0.6, 3, mat('#e8e2d6'), 0, 0.3, 4.5, hall); box(22, 0.6, 2, mat('#e8e2d6'), 0, 0.9, 4.0, hall);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.6), mat('#ffffff', { map: signTex(hallText, { bg: '#1f3a8a', fg: '#ffd54a' }), emissive: '#ffffff', emissiveIntensity: 0.15 }));
  sign.position.set(0, 11.2, 4.1); hall.add(sign);
  box(2.2, 3.2, 0.2, mat('#6b4128'), 0, 1.6, 3.0, hall);
  // banners + flags
  for (const x of [-11, 11]) { box(0.15, 9, 0.15, mat('#333'), x, 4.5, 3.8, hall); box(1.6, 3, 0.05, mat(x < 0 ? '#e53935' : '#1e88e5'), x + 0.9 * Math.sign(-x), 7.5, 3.8, hall); }
  // podium in front of hall
  const pod = new THREE.Group(); pod.position.set(0, 0, -14); g.add(pod); g.userData.podium = pod;
  box(6, 1.2, 4, mat('#b23a3a'), 0, 0.6, 0, pod); box(1.4, 1.5, 0.8, mat('#6b4128'), 0, 1.95, 1.3, pod);
  box(1.2, 0.5, 0.06, mat('#ffffff', { map: signTex('★', { w: 256, h: 128, bg: '#1f3a8a', fg: '#ffd54a', font: '800 100px Cap' }) }), 0, 2.2, 1.72, pod);
  cyl(0.03, 0.03, 0.6, mat('#222'), 0, 2.9, 1.3, pod, 6); sphere(0.09, mat('#333'), 0, 3.25, 1.35, pod, 8);
  // trees, benches, lamps around
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; if (Math.abs(Math.sin(a)) > 0.9 && Math.cos(a) < 0) continue; roundTree(g, Math.cos(a) * 16, Math.sin(a) * 12 + 2, 1.1, ['#4caf50', '#66bb6a', '#7cb342'][i % 3]); }
  for (const x of [-9, 9]) { bench(g, x, 0, 6, Math.PI); lamp(g, x * 1.4, -6); }
  // surrounding buildings
  const r = rng(9), cols = ['#f6d36b', '#ef8f7a', '#7fb5e8', '#a8d8a0', '#c9a3e6'];
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const h = 9 + r() * 8; const b = box(10, h, 10, mat(cols[Math.floor(r() * cols.length)]), s * 26, h / 2, -14 + i * 12, g);
    for (let y = 2; y < h - 1; y += 2.6) for (const z of [-3, 0, 3]) box(0.1, 1.4, 1.4, glassMat, s * 26 - s * 5.05, y, -14 + i * 12 + z, g, false);
  }
  return addSet(name, g);
}

// Interior rooms. kind: 'living' | 'classroom' | 'hospital' | 'bedroom' | 'shop'
export function buildRoom(name, v) {
  const g = new THREE.Group(); g.userData.indoor = true;
  box(18, 0.2, 18, mat('#ffffff', { map: v.floorTex || woodTex, roughness: 0.6 }), 0, -0.1, 0, g, false);
  const wallM = mat('#ffffff', { map: wallTex(v.wallA, v.wallB) });
  box(18, 8, 0.3, wallM, 0, 4, -7, g, false); box(0.3, 8, 18, wallM, -9, 4, 0, g, false); box(0.3, 8, 18, wallM, 9, 4, 0, g, false);
  box(18, 0.4, 0.1, white, 0, 0.2, -6.84, g, false);
  // window (pane color switches day/night)
  const wx = v.windowX ?? -4;
  box(3.6, 3.8, 0.3, white, wx, 4.0, -6.8, g, false);
  const paneDay = { c: '#dff1ff', e: '#cfe9ff', i: 1.4 }, paneNight = { c: '#1a2a55', e: '#22356e', i: 0.9 };
  const pane = mat(paneDay.c, { emissive: paneDay.e, emissiveIntensity: paneDay.i });
  box(3.1, 3.3, 0.32, pane, wx, 4.0, -6.79, g, false);
  const starsP = []; { const r = rng(4); for (let i = 0; i < 14; i++) starsP.push(box(0.05, 0.05, 0.02, mat('#fff', { emissive: '#fff', emissiveIntensity: 2 }), wx - 1.4 + r() * 2.8, 2.5 + r() * 3, -6.6, g, false)); }
  box(0.14, 3.3, 0.36, white, wx, 4.0, -6.77, g, false); box(3.1, 0.14, 0.36, white, wx, 4.0, -6.77, g, false);
  const cur = mat(v.curtain || '#e57373'); box(0.9, 4.6, 0.2, cur, wx - 2.2, 3.9, -6.55, g); box(0.9, 4.6, 0.2, cur, wx + 2.2, 3.9, -6.55, g);
  const spot = new THREE.SpotLight('#fff1dc', 2.4, 34, 0.85, 0.7, 0); spot.position.set(wx + 1, 8, -9); spot.target.position.set(0.5, 0, 2);
  spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0005; g.add(spot, spot.target);
  const fill = new THREE.PointLight('#ffd7a8', 1.2, 16, 0); fill.position.set(3, 6.5, 3); g.add(fill);
  const nightLamp = new THREE.PointLight('#ffb060', 0, 9, 0); nightLamp.position.set(v.lampX ?? 4.5, 2.6, -3.5); g.add(nightLamp);
  g.userData.setNight = (night) => {
    pane.color.set(night ? paneNight.c : paneDay.c); pane.emissive.set(night ? paneNight.e : paneDay.e); pane.emissiveIntensity = night ? paneNight.i : paneDay.i;
    starsP.forEach((s) => (s.visible = night));
    spot.color.set(night ? '#7f97ff' : '#fff1dc'); spot.intensity = night ? 0.8 : 2.4;
    fill.intensity = night ? 0.25 : 1.2; nightLamp.intensity = night ? 1.6 : 0;
  };
  const frameM = mat('#6b4128');
  const art = (x, y, w, h, c) => { box(w, h, 0.1, frameM, x, y, -6.82, g); box(w - 0.25, h - 0.25, 0.12, mat(c, { emissive: c, emissiveIntensity: 0.1 }), x, y, -6.8, g, false); };
  const k = v.kind;
  if (k === 'classroom') {
    const board = new THREE.Mesh(new THREE.PlaneGeometry(7, 3), mat('#ffffff', { map: canvasTex(700, 300, (c) => { c.fillStyle = '#2f5d3a'; c.fillRect(0, 0, 700, 300); c.strokeStyle = '#8b5a2b'; c.lineWidth = 20; c.strokeRect(0, 0, 700, 300); c.fillStyle = '#f4f4f4'; c.font = '800 70px Cap'; c.textAlign = 'center'; c.fillText(v.boardText || 'HOMEWORK DUE', 350, 130); c.font = '600 46px Cap'; c.fillText(v.boardText2 || 'Page 42', 350, 220); }) }));
    board.position.set(3, 4, -6.8); g.add(board);
    box(3, 1.4, 1.4, mat('#8d6e4f'), 3, 0.7, -4.2, g);
    g.userData.desks = [];
    for (let row = 0; row < 3; row++) for (let col = -1; col <= 1; col++) {
      const x = col * 3.2, z = -1 + row * 3;
      box(1.8, 0.1, 1.1, mat('#e0b97a'), x, 1.3, z - 0.6, g); box(0.1, 1.3, 0.1, mat('#555'), x - 0.8, 0.65, z - 0.6, g); box(0.1, 1.3, 0.1, mat('#555'), x + 0.8, 0.65, z - 0.6, g);
      box(1.0, 0.1, 0.9, mat('#4a7fb0'), x, 0.8, z + 0.35, g); box(1.0, 1.0, 0.1, mat('#4a7fb0'), x, 1.3, z + 0.82, g);
      g.userData.desks.push([x, z + 0.3]);
    }
    const clock = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32), mat('#ffffff', { map: canvasTex(128, 128, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#222'; c.lineWidth = 8; c.beginPath(); c.arc(64, 64, 58, 0, 7); c.stroke(); c.lineWidth = 6; c.beginPath(); c.moveTo(64, 64); c.lineTo(64, 22); c.moveTo(64, 64); c.lineTo(92, 70); c.stroke(); }) }));
    clock.position.set(-1, 6.4, -6.8); g.add(clock);
  } else if (k === 'hospital') {
    const bed = new THREE.Group(); bed.position.set(0.5, 0, -3); g.add(bed); g.userData.bed = bed;
    box(2.6, 0.9, 5.2, mat('#e8eef3'), 0, 0.45, 0, bed); box(2.4, 0.3, 5.0, mat('#ffffff'), 0, 1.05, 0, bed);
    box(2.42, 0.32, 3.0, mat('#7fb3e6'), 0, 1.1, 0.9, bed); box(1.6, 0.35, 0.9, mat('#ffffff'), 0, 1.35, -1.9, bed);
    box(2.6, 1.8, 0.15, mat('#c9d6df'), 0, 1.4, -2.6, bed);
    cyl(0.04, 0.04, 4, mat('#9aa4ad'), 2.2, 2, -4.2, g, 8); box(0.4, 0.6, 0.15, mat('#dff4ff', { transparent: true, opacity: 0.85 }), 2.2, 3.6, -4.2, g);
    const mon = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), mat('#000', { map: canvasTex(280, 200, (c) => { c.fillStyle = '#0a1a14'; c.fillRect(0, 0, 280, 200); c.strokeStyle = '#3cff7a'; c.lineWidth = 5; c.beginPath(); let x = 0; c.moveTo(0, 120); for (const p of [[40, 120], [55, 60], [70, 160], [85, 120], [150, 120], [165, 60], [180, 160], [195, 120], [280, 120]]) c.lineTo(...p); c.stroke(); c.fillStyle = '#3cff7a'; c.font = '700 34px Cap'; c.fillText('72', 200, 50); }), emissive: '#ffffff', emissiveIntensity: 0.6 }));
    mon.position.set(-2.2, 3.4, -6.8); g.add(mon); box(1.6, 1.2, 0.2, mat('#d0d6da'), -2.2, 3.4, -6.92, g);
    box(1.0, 1.4, 1.0, mat('#e4e9ee'), -2.4, 0.7, -3, g);
    cyl(0.25, 0.2, 0.5, mat('#dfe9f5', { transparent: true, opacity: 0.7 }), -2.4, 1.65, -3, g, 12);
    for (let i = 0; i < 5; i++) sphere(0.16, mat(['#ff6f91', '#ffd25a', '#ff8a3d', '#f06292', '#ba68c8'][i]), -2.4 + Math.cos(i) * 0.18, 2.15 + (i % 2) * 0.12, -3 + Math.sin(i) * 0.18, g, 8);
  } else if (k === 'bedroom') {
    const bed = new THREE.Group(); bed.position.set(1.5, 0, -4); g.add(bed); g.userData.bed = bed;
    box(2.4, 0.7, 4.4, mat('#6b4a30'), 0, 0.35, 0, bed); box(2.3, 0.35, 4.2, mat('#ffffff'), 0, 0.85, 0, bed);
    box(2.34, 0.38, 2.6, mat(v.blanket || '#ff8a3d'), 0, 0.9, 0.75, bed); box(1.5, 0.3, 0.8, mat('#ffffff'), 0, 1.15, -1.6, bed);
    box(2.4, 1.8, 0.2, mat('#6b4a30'), 0, 1.2, -2.2, bed);
    art(-1.2, 5.2, 1.4, 1.8, '#4fc3f7'); art(5.5, 5.0, 1.6, 1.2, '#ffd54f');
    box(1.0, 1.2, 1.0, mat('#8d6e4f'), 4.2, 0.6, -5.6, g); sphere(0.35, mat('#fff1d6', { emissive: '#ffb060', emissiveIntensity: 1.5 }), 4.2, 1.6, -5.6, g, 12);
  } else if (k === 'living') {
    const sofa = mat(v.sofa || '#4f6d8f');
    box(5.2, 0.9, 1.9, sofa, 0, 0.45, -4.2, g); box(5.2, 1.6, 0.5, sofa, 0, 1.35, -5.0, g);
    box(0.5, 1.3, 1.9, sofa, -2.8, 0.65, -4.2, g); box(0.5, 1.3, 1.9, sofa, 2.8, 0.65, -4.2, g);
    art(2.5, 4.8, 1.8, 1.4, '#7fb7d9'); art(5.2, 5.0, 1.2, 1.6, '#f2a65a');
    box(3, 0.15, 1.4, frameM, 0, 0.9, -1.6, g);
  }
  return addSet(name, g);
}

// Backyard at the back of a house (house wall at z=-6, window upstairs at x=winX).
export function buildYard(name = 'yard', { wall = '#f2e2c4', winX = 2.5 } = {}) {
  const g = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat('#4f9a3f')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  const wm = mat(wall);
  box(16, 9, 10, wm, 0, 4.5, -11, g);
  for (const q of [-1, 1]) { const sl = box(9.6, 0.4, 11, mat('#8e5a3c'), q * 3.9, 10.6, -11, g); sl.rotation.z = -q * 0.6; }
  const tri = new THREE.Shape(); tri.moveTo(-8.1, 0); tri.lineTo(8.1, 0); tri.lineTo(0, 4.6); tri.closePath();
  const ped = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 10, bevelEnabled: false }), wm); ped.position.set(0, 9, -16); g.add(ped);
  // upstairs window with warm interior: a character can stand in front of the glow
  box(2.8, 3.0, 0.3, white, winX, 6.1, -5.95, g, false);
  const glow = box(2.4, 2.6, 0.1, mat('#ffd9a0', { emissive: '#ffbe70', emissiveIntensity: 1.3 }), winX, 6.1, -5.78, g, false);
  box(3.2, 0.2, 0.5, white, winX, 4.6, -5.7, g);
  g.userData.window = [winX, 4.7, -5.4];
  // downstairs window + back door + porch light
  box(2.4, 2.4, 0.3, white, -3.5, 2.2, -5.95, g, false); box(2.0, 2.0, 0.1, glassMat, -3.5, 2.2, -5.78, g, false);
  box(1.6, 3.0, 0.3, mat('#6b4128'), 2.5, 1.5, -5.95, g);
  const porch = new THREE.PointLight('#ffb766', 2.6, 16, 0);
  const key = new THREE.PointLight('#d6e2ff', 2.4, 34, 0); key.position.set(4, 7, 12); g.add(key); porch.position.set(2.5, 3.6, -4.8); g.add(porch);
  box(0.4, 0.4, 0.3, mat('#fff3cf', { emissive: '#ffd27a', emissiveIntensity: 2 }), 2.5, 3.4, -5.7, g, false);
  // fence + trees + swing
  const pk = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 1.4, 0.2), mat('#e9e2d4'), 400); let n = 0; const m4 = new THREE.Matrix4();
  for (let x = -14; x <= 14; x += 0.55) { m4.makeTranslation(x, 0.7, 14); pk.setMatrixAt(n++, m4); }
  for (let z = -6; z <= 14; z += 0.55) for (const x of [-14, 14]) { m4.makeTranslation(x, 0.7, z); pk.setMatrixAt(n++, m4); }
  pk.count = n; pk.castShadow = true; g.add(pk);
  roundTree(g, -9, 6, 1.4); roundTree(g, 10, 9, 1.2); pine(g, -11, -2, 1.3);
  const sw = mat('#8a5a35'); box(0.2, 4, 0.2, sw, 6, 2, 3, g); box(0.2, 4, 0.2, sw, 9, 2, 3, g); box(3.4, 0.2, 0.2, sw, 7.5, 4, 3, g); box(1.2, 0.12, 0.5, mat('#c0392b'), 7.5, 1.0, 3, g);
  return addSet(name, g);
}

// ---------------- shot runner + captions ----------------
let camLook = new THREE.Vector3();
const shake = { amp: 0 };
export function cam(p0, p1, l0, l1, k, fov = 50) {
  camera.position.lerpVectors(v3(p0), v3(p1), k); camLook.lerpVectors(v3(l0), v3(l1), k);
  camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(camLook);
  if (shake.amp > 0) { camera.position.x += (Math.random() - 0.5) * shake.amp; camera.position.y += (Math.random() - 0.5) * shake.amp; }
}
export function camAt() { return camLook.clone(); }
const fx = { flash: 0, flashColor: '255,255,255', dark: 0 };
export const effects = {
  flash(a, color = '255,255,255') { fx.flash = Math.max(fx.flash, a); fx.flashColor = color; },
  shake(a) { shake.amp = a; },
  darken(a) { fx.dark = a; },
};
const props = [];
export function prop(p) { props.push(p); return p; }

const FILLER = new Set(['a', 'an', 'the', 'and', 'of', 'to', 'in', 'on', 'it', 'is', 'was', 'i', 'my', 'he', 'his', 'her', 'for', 'at', 'so', 'but', 'with', 'that', 'just']);

export async function run({ timings, shots, captionStyle = 'lime', perFrame }) {
  const T = timings;
  const out = document.getElementById('out'), ctx = out.getContext('2d');
  await document.fonts.load('800 80px Cap');
  // build shot list: each line split across its shots by weight
  const list = [];
  T.lines.forEach((l, i) => {
    const s0 = i === 0 ? 0 : l.start - 0.08, s1 = i + 1 < T.lines.length ? T.lines[i + 1].start - 0.08 : T.duration;
    const w = l.weights || l.shots.map(() => 1), tot = w.reduce((a, b) => a + b, 0);
    let acc = s0;
    l.shots.forEach((name, j) => { const d = (s1 - s0) * w[j] / tot; list.push({ name, start: acc, end: acc + d, line: i }); acc += d; });
  });
  const words = T.words.map((w, i) => {
    const line = T.lines[w.line]; const next = T.words[i + 1];
    const end = Math.min(next && next.line === w.line ? next.start : line.end + 0.2, line.end + 0.2);
    return { ...w, end };
  });
  window.shotList = list;
  window.renderAt = (time) => {
    for (const c of chars) { c.hide(); c.grey = 0; c.handGrey = [0, 0]; c.o.look = 0; c.headP.visible = true; }
    for (const p of props) p.visible = false;
    sparkles.visible = false; fx.flash = 0; fx.dark = 0; shake.amp = 0;
    let si = list.findIndex((s) => time >= s.start && time < s.end); if (si < 0) si = list.length - 1;
    const s = list[si], t = time - s.start, d = s.end - s.start;
    if (!shots[s.name]) throw new Error('missing shot ' + s.name);
    shots[s.name](t, d, t / d, { time, line: s.line, prev: list[si - 1]?.name });
    perFrame?.(time);
    for (const c of chars) if (c.root.visible) c.update();
    for (const p of props) if (p.visible) p.userData.update?.(time);
    sky.position.copy(camera.position);
    sun.target.position.copy(camLook); sun.position.copy(camLook).add(sunOffset);
    renderer.render(scene, camera);
    ctx.drawImage(renderer.domElement, 0, 0);
    const vg = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.32, W / 2, H * 0.5, H * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.32)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    if (fx.dark > 0) { ctx.fillStyle = `rgba(0,0,0,${fx.dark})`; ctx.fillRect(0, 0, W, H); }
    if (fx.flash > 0) { ctx.fillStyle = `rgba(${fx.flashColor},${fx.flash})`; ctx.fillRect(0, 0, W, H); }
    const w = words.find((x) => time >= x.start && time < x.end);
    if (w) {
      const base = 84 * (w.emph ? 1.45 : FILLER.has(w.w.toLowerCase()) ? 0.82 : 1);
      const pop = 1 + 0.16 * Math.max(0, 1 - (time - w.start) / 0.08);
      ctx.save(); ctx.translate(W / 2, H * 0.6); ctx.scale(pop, pop);
      ctx.font = `800 ${base}px Cap`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      const maxW = W * 0.86, mw = ctx.measureText(w.w).width; if (mw > maxW) ctx.scale(maxW / mw, maxW / mw);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
      ctx.lineWidth = base * 0.2; ctx.strokeStyle = captionStyle === 'lime' ? '#15130f' : 'rgba(0,0,0,0.92)'; ctx.strokeText(w.w, 0, 0);
      ctx.shadowColor = 'transparent'; ctx.fillStyle = captionStyle === 'lime' ? '#E8FF3A' : '#ffffff'; ctx.fillText(w.w, 0, 0);
      ctx.restore();
    }
    const fadeOut = clamp01((time - (T.duration - 1.3)) / 1.0);
    if (fadeOut > 0) { ctx.fillStyle = `rgba(0,0,0,${fadeOut})`; ctx.fillRect(0, 0, W, H); }
    return out.toDataURL('image/jpeg', 0.92);
  };
  window.duration = T.duration;
  window.ready = true;
}
