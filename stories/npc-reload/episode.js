// Episode 5: "In this world, every time the player loads a save, everything resets." (user-supplied voiceover)
import * as E from '../engine/engine.js';
const { THREE, cam, ease, clamp01, lerp, show, makeChar, handPos, headPos, face, effects, sparkles, box, cyl, mat, canvasTex, signTex, W, H } = E;

const T = await (await fetch('build/timings.json')).json();

// ---------- cast ----------
const nico = makeChar({ shirt: '#2e8b72', pants: '#c2a878', hairType: 'kid', hair: '#3b2618' });
const player = makeChar({ shirt: '#f2f2f2', pants: '#34495e', shoes: '#222', hairType: 'dad', hair: '#141414', beard: '#2a1d12' });
const dad = makeChar({ shirt: '#5d6d7e', pants: '#3a3a46', hairType: 'dad', hair: '#3b2618', mustache: '#3b2618' });
const busGuy = makeChar({ shirt: '#f39c12', pants: '#2c3e50', hairType: 'cap', cap: '#8e44ad' });
const vendor = makeChar({ shirt: '#ffffff', pants: '#c0392b', hairType: 'cap', cap: '#c0392b', mustache: '#2a1a10' });
const peds = E.makeExtras(8, 71);

// ---------- city set ----------
const city = new THREE.Group();
const SW = 0.18;
{
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), mat('#5d636e')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; city.add(ground);
  box(10, 0.04, 600, mat('#3b4150'), 0, 0.02, 0, city, false);
  for (let z = -280; z < 280; z += 7) box(0.22, 0.05, 3, mat('#f1d66b'), 0, 0.03, z, city, false);
  for (const s of [-1, 1]) { box(4, SW, 600, mat('#d6d1c8'), s * 7, SW / 2, 0, city, false); box(0.2, SW + 0.04, 600, mat('#bdb6ab'), s * 5.05, SW / 2, 0, city, false); }
  for (let x = -4.5; x <= 4.5; x += 1.1) box(0.6, 0.05, 3, mat('#f4f4f4'), x, 0.04, 15, city, false); // crosswalk at the corner
  const r = E.rng(21), cols = ['#f8a5c2', '#63cdda', '#f7d794', '#cf6a87', '#778beb', '#e77f67', '#f5cd79', '#3dc1d3'];
  for (const s of [-1, 1]) for (let z = -120; z <= 120; z += 14) {
    if (s > 0 && Math.abs(z + 12) < 5) continue; // alley gap for the dumpster
    const h = 10 + r() * 26, w = 12;
    box(w, h, 12.6, mat(cols[Math.floor(r() * cols.length)]), s * (9 + w / 2), h / 2, z, city);
    for (let y = 3.2; y < h - 1; y += 3) for (let k = -4.5; k <= 4.5; k += 1.8) box(0.1, 1.6, 1.1, E.glassMat, s * 8.97, y, z + k, city, false);
    box(0.12, 2.4, 9, mat('#9fd3e8', { roughness: 0.15, metalness: 0.3 }), s * 8.95, 1.3, z, city, false);
  }
  // palms + lamps
  const palm = (x, z) => { const g = new THREE.Group(); g.position.set(x, SW, z); city.add(g); for (let i = 0; i < 6; i++) { const seg = cyl(0.22 - i * 0.015, 0.24 - i * 0.015, 1.1, mat('#8d6e4f'), Math.sin(i * 0.35) * 0.3, 0.55 + i * 1.05, 0, g, 8); seg.rotation.z = -0.05 * i; }
    for (let i = 0; i < 7; i++) { const lf = box(2.6, 0.08, 0.5, mat('#2e8b57'), 0.3, 6.5, 0, g); lf.rotation.set(0, i * 0.9, -0.45); lf.position.x = 0.3 + Math.cos(i * 0.9) * 1.1; lf.position.z = -Math.sin(i * 0.9) * 1.1; } };
  for (const s of [-1, 1]) for (let z = -100; z <= 100; z += 20) { palm(s * 8.3, z + 7); E.lamp(city, s * 5.6, z - 3); }
  // bus stop at (7, 0, 0)
  const bs = new THREE.Group(); bs.position.set(7.2, SW, 0); city.add(bs); city.userData.busStop = bs;
  box(1.4, 0.12, 4.2, mat('#2c3e50'), 0.2, 2.9, 0, bs); box(0.08, 2.8, 4.0, new THREE.MeshStandardMaterial({ color: '#9fd3e8', transparent: true, opacity: 0.45, roughness: 0.1 }), 0.85, 1.45, 0, bs);
  for (const z of [-2, 2]) box(0.12, 2.9, 0.12, mat('#2c3e50'), 0.85, 1.45, z, bs);
  box(0.6, 0.12, 3.2, mat('#7f8c8d'), 0.45, 0.8, 0, bs);
  box(0.1, 3.4, 0.1, mat('#555'), -0.8, 1.7, 2.6, bs); const bsign = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), mat('#fff', { map: signTex('BUS', { w: 256, h: 256, bg: '#1565c0', fg: '#fff', font: '800 110px Cap' }) })); bsign.position.set(-0.8, 3.2, 2.66); bs.add(bsign);
  // hotdog stand at (-7, 0, 6)
  const hd = new THREE.Group(); hd.position.set(-7.2, SW, 6); city.add(hd);
  box(1.4, 1.1, 2.4, mat('#e0e0e0'), 0, 0.85, 0, hd); box(1.42, 0.3, 2.42, mat('#c0392b'), 0, 0.5, 0, hd);
  const umb = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.7, 10), mat('#f1c40f')); umb.position.set(0, 3.1, 0); hd.add(umb); cyl(0.04, 0.04, 2.6, mat('#555'), 0, 1.7, 0, hd, 6);
  const hs = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.5), mat('#fff', { map: signTex('HOT DOGS', { w: 512, h: 180, bg: '#c0392b', fg: '#ffeb3b', font: '800 96px Cap' }) })); hs.position.set(0.72, 1.1, 0); hs.rotation.y = Math.PI / 2; hd.add(hs);
  // alley: dumpster at (8.2, 0, -12) against the back wall, notes on the wall
  box(0.4, 8, 6, mat('#8d7b6a'), 11.5, 4, -12, city);
  box(1.6, 1.5, 2.6, mat('#2e7d32'), 10.4, SW + 0.75, -12, city); box(1.7, 0.12, 2.7, mat('#1b5e20'), 10.4, SW + 1.55, -12, city);
}
const notesTex = (lines, color, font) => canvasTex(512, 512, (g) => {
  g.clearRect(0, 0, 512, 512); g.fillStyle = color; g.strokeStyle = color; g.font = font; g.lineWidth = 6;
  lines.forEach((l, i) => g.fillText(l, 24 + (i % 2) * 6, 70 + i * 62));
  for (let k = 0; k < 6; k++) { const x0 = 300 + (k % 3) * 64, y0 = 330 + Math.floor(k / 3) * 70; for (let j = 0; j < 4; j++) { g.beginPath(); g.moveTo(x0 + j * 11, y0); g.lineTo(x0 + j * 11, y0 + 46); g.stroke(); } g.beginPath(); g.moveTo(x0 - 6, y0 + 40); g.lineTo(x0 + 44, y0 + 6); g.stroke(); }
});
const myNotes = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), mat('#fff', { map: notesTex(['DAY 1', 'DAY 2', 'DAY 3...', 'DAY 517', 'DAY 900', 'I REMEMBER.'], '#f5f5f5', '700 48px Cap'), transparent: true }));
myNotes.position.set(11.28, 2.6, -13.2); myNotes.rotation.y = -Math.PI / 2; city.add(myNotes);
const hisNotes = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), mat('#fff', { map: canvasTex(512, 512, (g) => {
  g.clearRect(0, 0, 512, 512); g.fillStyle = '#ff3b30'; g.font = 'italic 700 44px serif';
  ['Day 1', 'Day 2', 'Day 3...', 'Day 900'].forEach((l, i) => g.fillText(l, 40 + i * 10, 70 + i * 62));
  g.font = '800 82px Cap'; g.fillText('SAVE', 120, 380); g.fillText('NICO', 128, 462);
  g.strokeStyle = '#ff3b30'; g.lineWidth = 8; g.beginPath(); g.ellipse(250, 400, 200, 110, -0.08, 0, 7); g.stroke();
}), transparent: true }));
hisNotes.position.set(11.28, 2.6, -10.8); hisNotes.rotation.y = -Math.PI / 2; city.add(hisNotes);
{ const al = new THREE.PointLight('#ffd9a0', 2.2, 12, 0); al.position.set(9.0, 4.2, -12); city.add(al); box(0.4, 0.3, 0.4, mat('#fff3cf', { emissive: '#ffd27a', emissiveIntensity: 2 }), 11.2, 4.6, -12, city, false); }
E.addSet('city', city);

// ---------- vehicles + props ----------
const vehicle = (fn) => { const g = E.prop(new THREE.Group()); E.scene.add(g); fn(g); return g; };
const carA = vehicle((g) => E.car(g, 0, 0, 0, '#e53935'));
const dadCar = vehicle((g) => E.car(g, 0, 0, 0, '#1e88e5'));
const bus = vehicle((g) => { box(2.8, 3.0, 11, mat('#f9a825'), 0, 1.9, 0, g); box(2.82, 1.0, 9.5, mat('#9fd3e8', { roughness: 0.1 }), 0, 2.5, 0.2, g, false); for (const z of [-3.5, 3.5]) for (const x of [-1.3, 1.3]) { const w = cyl(0.55, 0.55, 0.4, mat('#1d1d22'), x, 0.55, z, g, 16); w.rotation.z = Math.PI / 2; } });
const truck = vehicle((g) => { box(2.8, 3.2, 3.0, mat('#c62828'), 0, 2.0, 4.5, g); box(2.82, 1.0, 0.1, mat('#9fd3e8'), 0, 2.8, 6.0, g, false); box(2.9, 3.8, 8.5, mat('#eceff1'), 0, 2.3, -1.6, g);
  for (const z of [-4.5, -1.5, 4.5]) for (const x of [-1.35, 1.35]) { const w = cyl(0.6, 0.6, 0.45, mat('#1d1d22'), x, 0.6, z, g, 16); w.rotation.z = Math.PI / 2; }
  for (const x of [-0.95, 0.95]) box(0.55, 0.35, 0.06, mat('#fff8d0', { emissive: '#fff3b0', emissiveIntensity: 3 }), x, 1.2, 6.03, g, false);
  const hl = new THREE.SpotLight('#fff3c0', 6, 40, 0.5, 0.5, 0); hl.position.set(0, 1.3, 6.2); hl.target.position.set(0, 0, 20); g.add(hl, hl.target); });
const hotdog = vehicle((g) => { cyl(0.09, 0.09, 0.45, mat('#c0392b'), 0, 0, 0, g, 8).rotation.z = Math.PI / 2; box(0.42, 0.12, 0.2, mat('#e3b778'), 0, -0.06, 0, g); });
const shards = E.prop(new THREE.InstancedMesh(new THREE.BoxGeometry(0.28, 0.32, 0.04), mat('#bfe6f5', { roughness: 0.1, transparent: true, opacity: 0.85 }), 48)); E.scene.add(shards);
const shardSeeds = (() => { const r = E.rng(5); return Array.from({ length: 48 }, (_, i) => ({ home: new THREE.Vector3(-8.85, 0.5 + Math.floor(i / 8) * 0.38, -6 + (i % 8) * 0.34 - 1.2), lie: new THREE.Vector3(-7.2 + r() * 2.2, SW + 0.03, -7 + r() * 3), rot: r() * 6 })); })();
function setShards(k) { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(); shardSeeds.forEach((s, i) => { const p = s.lie.clone().lerp(s.home, k); p.y += Math.sin(Math.PI * k) * 1.2; q.setFromEuler(new THREE.Euler((1 - k) * Math.PI / 2, (1 - k) * s.rot, 0)); m4.compose(p, q, new THREE.Vector3(1, 1, 1)); shards.setMatrixAt(i, m4); }); shards.instanceMatrix.needsUpdate = true; shards.visible = true; }
const path = E.prop(new THREE.Group()); E.scene.add(path); for (let z = 0.5; z <= 14; z += 0.7) box(0.25, 0.03, 0.4, mat('#ffd54a', { emissive: '#ffd54a', emissiveIntensity: 0.8 }), 6.2, SW + 0.02, z, path, false);
const chalk = vehicle((g) => box(0.06, 0.06, 0.2, mat('#fff'), 0, 0, 0, g));

// ---------- HUD overlays (drawn on the 2D frame) ----------
const OV = {};
const resetOV = () => Object.assign(OV, { loading: 0, gameover: 0, clock: null, attempt: null, tags: [], hud: false, saved: 0 });
function project(v) { const p = v.clone().project(E.camera); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z]; }
function pill(ctx, text, x, y, bg, fg = '#fff', size = 40) { ctx.font = `800 ${size}px Cap`; const w = ctx.measureText(text).width + size; ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 2); }
function overlay(ctx, time) {
  for (const t of OV.tags) { const [x, y, z] = project(t.pos); if (z < 1) pill(ctx, t.text, x, y, t.bg || 'rgba(30,30,30,0.75)', '#fff', t.size || 36); }
  if (OV.hud) {
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.arc(150, H - 300, 110, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#9aa0a6'; ctx.fillRect(140, H - 400, 20, 200); ctx.fillRect(50, H - 310, 200, 20); ctx.fillStyle = '#ffd54a'; ctx.beginPath(); ctx.moveTo(150, H - 320); ctx.lineTo(136, H - 288); ctx.lineTo(164, H - 288); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(W - 360, 120, 300, 26); ctx.fillStyle = '#4caf50'; ctx.fillRect(W - 356, 124, 230, 18); ctx.restore();
  }
  if (OV.clock) { ctx.save(); ctx.font = '800 110px Cap'; ctx.textAlign = 'right'; ctx.lineWidth = 14; ctx.strokeStyle = '#111'; ctx.strokeText(OV.clock, W - 60, 260); ctx.fillStyle = '#fff'; ctx.fillText(OV.clock, W - 60, 260); ctx.restore(); }
  if (OV.attempt) pill(ctx, OV.attempt, W / 2, 230, 'rgba(198,40,40,0.9)', '#fff', 54);
  if (OV.gameover > 0) {
    ctx.save(); ctx.fillStyle = `rgba(80,0,0,${0.35 * OV.gameover})`; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = OV.gameover; ctx.font = '800 150px Cap'; ctx.textAlign = 'center'; ctx.lineWidth = 18; ctx.strokeStyle = '#000'; ctx.strokeText('GAME OVER', W / 2, H * 0.38); ctx.fillStyle = '#e53935'; ctx.fillText('GAME OVER', W / 2, H * 0.38); ctx.restore();
  }
  if (OV.loading > 0) {
    ctx.save(); ctx.globalAlpha = OV.loading; ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.font = '800 80px Cap'; ctx.textAlign = 'center'; ctx.fillText('LOADING' + '.'.repeat(1 + Math.floor(time * 4) % 3), W / 2, H * 0.42);
    ctx.strokeStyle = '#ffd54a'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(W / 2, H * 0.5, 60, time * 6, time * 6 + 4.2); ctx.stroke(); ctx.restore();
  }
  if (OV.saved > 0) pill(ctx, 'SAVE COMPLETE ✓', W / 2, H - 260, `rgba(46,125,50,${0.9 * OV.saved})`, '#fff', 46);
}

// ---------- helpers ----------
const day = () => show('city', 'day');
const night = () => show('city', 'night');
const NICO_STOP = [6.4, SW, 0.6];
function nicoAtStop(t, expr = 'worried') { nico.place(...NICO_STOP, -Math.PI / 2 + 0.2); nico.expr = expr; nico.pose({ t, headX: 0.05 }); }
function walkers(t, n = 6) { peds.slice(0, n).forEach((p, i) => { const s = i % 2 ? -1 : 1, z = s > 0 ? -18 + i * 3 + t * 2.0 : 20 - i * 3 - t * 2.0; p.place(s * 6.5 + (i % 3) * 0.4, SW, z, s > 0 ? 0 : Math.PI); p.expr = 'smile'; p.pose({ walk: t * 7 + i, amp: 0.5, t }); }); }
function tag(ch, text, bg, dy = 0.95) { OV.tags.push({ pos: headPos(ch).add(new THREE.Vector3(0, dy, 0)), text, bg, size: 54 }); }
const S = {
  city_wide(t, d, k) { day(); walkers(t, 8); carA.position.set(-2.5, 0, lerp(-30, 10, k)); carA.rotation.y = 0; carA.visible = true; bus.position.set(2.5, 0, lerp(40, 10, k)); bus.rotation.y = Math.PI; bus.visible = true; cam([0, 30, 46], [0, 22, 32], [0, 0, -5], [0, 1, -5], ease(k), 52); },
  loading_save(t, d, k) { day(); walkers(t, 8); OV.loading = clamp01(1 - Math.abs(k - 0.55) * 3); cam([0, 22, 32], [0, 20, 28], [0, 1, -5], [0, 1, -5], ease(k), 52); },
  car_fix(t, d, k) {
    day(); const fixed = k > 0.35; carA.position.set(-2.5, fixed ? 0 : 1.1, 4); carA.rotation.set(0, 0.6, fixed ? 0 : Math.PI / 2 * 0.95); carA.visible = true;
    if (k > 0.33 && k < 0.45) { effects.flash(0.6 * (1 - (k - 0.33) / 0.12), '255,250,220'); sparkles.userData.set(new THREE.Vector3(-2.5, 1.5, 4), (k - 0.33) * 5, 2); }
    cam([4, 2.6, 12], [3.4, 2.5, 11], [-2.5, 1.0, 4], [-2.5, 1.0, 4], ease(k), 50);
  },
  window_fix(t, d, k) { day(); setShards(ease(clamp01((k - 0.1) / 0.6))); walkers(t, 2); cam([-5.0, 2.0, -1.4], [-5.2, 1.9, -2.0], [-8.8, 1.3, -6.0], [-8.8, 1.3, -6.0], ease(k), 48); },
  bus_guy(t, d, k) {
    day(); bus.position.set(-2.4, 0, 1); bus.rotation.y = 0; bus.visible = true;
    const up = ease(clamp01((k - 0.25) / 0.5)); busGuy.place(-1.0, lerp(0.27, 0, up), 9.8, -Math.PI / 2 + 0.4, -Math.PI / 2 * (1 - up)); busGuy.expr = up > 0.6 ? 'smile' : 'sleep'; busGuy.pose({ t });
    cam([3.4, 2.8, 15.5], [3.0, 2.7, 15.0], [-1.0, 0.9, 9.6], [-1.0, 1.4, 9.7], ease(k), 50);
  },
  hotdog(t, d, k) {
    day(); vendor.place(-8.5, SW, 6, Math.PI / 2); vendor.expr = 'happy'; vendor.pose({ t, armR: [-1.4, 0, -0.1] });
    busGuy.place(-5.5, SW, 6.1, -Math.PI / 2); busGuy.expr = 'happy'; busGuy.pose({ t, armL: [-1.4 * ease(k * 2), 0, 0.1] });
    const p = handPos(vendor, 1); hotdog.position.set(lerp(p.x, p.x + 0.8, ease(k)), p.y + 0.1, p.z); hotdog.visible = true;
    cam([-3.0, 1.9, 9.8], [-3.3, 1.9, 9.3], [-7.0, 1.8, 6], [-7.0, 1.8, 6], ease(k), 50);
  },
  crowd_normal(t, d, k) { day(); walkers(t, 8); nicoAtStop(t, 'worried'); cam([-1.5, 3.4, 14], [-0.5, 3.0, 11], [5.5, 1.6, 2], [6.0, 1.6, 1.5], ease(k), 50); },
  nico_reveal(t, d, k) { day(); nicoAtStop(t, 'worried'); nico.o.look = -1; const h = headPos(nico); cam([h.x - 4.5, h.y - 0.4, h.z + 1.2], [h.x - 2.6, h.y - 0.3, h.z + 0.6], [h.x, h.y - 0.4, h.z], [h.x, h.y - 0.2, h.z], ease(k), 46); },
  nico_tag(t, d, k) { day(); nicoAtStop(t, k > 0.5 ? 'sad' : 'worried'); tag(nico, 'NICO  ·  NPC', 'rgba(40,40,40,0.8)'); const h = headPos(nico); cam([h.x - 3.2, h.y + 0.2, h.z + 0.8], [h.x - 2.6, h.y + 0.15, h.z + 0.6], [h.x, h.y + 0.25, h.z], [h.x, h.y + 0.25, h.z], ease(k), 46); },
  nico_walk(t, d, k) { day(); path.visible = true; const z = lerp(0.6, 8, k); nico.place(6.2, SW, z, 0); nico.expr = 'sad'; nico.pose({ walk: t * 6, amp: 0.4, t }); tag(nico, 'NPC'); cam([1.5, 2.4, z + 7], [1.6, 2.4, z + 6.5], [6.2, 1.5, z], [6.2, 1.5, z], 0, 50); },
  nico_loop(t, d, k) { day(); path.visible = true; const ph = (k * 1.6) % 1, z = ph < 0.5 ? lerp(0.6, 14, ph * 2) : lerp(14, 0.6, (ph - 0.5) * 2); nico.place(6.2, SW, z, ph < 0.5 ? 0 : Math.PI); nico.expr = 'sad'; nico.pose({ walk: t * 7, amp: 0.4, t }); cam([1, 12, 7], [1.2, 11, 7.5], [6, 0, 7], [6, 0, 7.2], ease(k), 50); },
  nico_eyes(t, d, k) { day(); nicoAtStop(t, 'shock'); const h = headPos(nico, 0.35); cam([h.x - 1.4, h.y, h.z + 0.25], [h.x - 1.05, h.y, h.z + 0.2], h.toArray(), h.toArray(), ease(k), 40); },
  dad_car(t, d, k) {
    day(); dadCar.position.set(-2.5 + Math.min(k * 3, 1) * 0, 0, lerp(2, 18, ease(clamp01((k - 0.25) / 0.75)))); dadCar.rotation.y = 0; dadCar.visible = true;
    dad.place(-5.6, SW, 3, Math.PI / 2 - 0.4); dad.expr = k > 0.3 ? 'angry' : 'shock'; dad.pose({ t, armR: [-1.6, 0, 0], jump: k > 0.3 ? t * 8 : 0 });
    tag(dad, 'STOLEN x4,000', 'rgba(198,40,40,0.85)');
    cam([-7.6, 2.8, 15], [-7.4, 2.8, 14], [-4.2, 1.4, 4], [-3.6, 1.3, 8], ease(k), 54);
  },
  stop_crash(t, d, k) {
    day(); const hit = k > 0.45;
    carA.position.set(lerp(-1, 6.0, ease(clamp01(k / 0.45))), 0, lerp(-14, -0.6, ease(clamp01(k / 0.45)))); carA.rotation.set(0, 0.45, hit ? 0.1 : 0); carA.visible = true;
    nico.place(lerp(6.4, 4.2, ease(clamp01((k - 0.35) * 4))), SW, 2.6, -Math.PI / 2); nico.expr = 'shock'; nico.pose({ t, jump: k > 0.35 && k < 0.6 ? (k - 0.35) * 12 : 0, armL: [-2.8, 0, 0.3], armR: [-2.8, 0, -0.3] });
    if (hit && k < 0.6) { effects.shake(0.25); effects.flash(0.4 * (1 - (k - 0.45) / 0.15)); }
    tag(nico, 'x300', 'rgba(198,40,40,0.85)', 1.4);
    cam([-4, 2.6, 8], [-3.5, 2.6, 7.5], [5.5, 1.5, 0.5], [5.5, 1.5, 0.5], ease(k), 52);
  },
  dumpster_write(t, d, k) {
    day(); hisNotes.visible = false; nico.place(10.5, SW, -14.4, Math.PI / 2); nico.expr = 'determined'; nico.pose({ t, armR: [-2.0 + Math.sin(t * 10) * 0.12, 0, 0.2] });
    const p = handPos(nico, 1); chalk.position.copy(p); chalk.visible = true;
    cam([7.0, 2.4, -17.0], [7.4, 2.4, -16.6], [10.8, 2.2, -13.6], [10.9, 2.2, -13.6], ease(k), 48);
  },
  notes_wall(t, d, k) { day(); hisNotes.visible = false; const p = myNotes.position; cam([p.x - 3.0, p.y, p.z + 0.3], [p.x - 2.3, p.y, p.z + 0.1], p.toArray(), p.toArray(), ease(k), 44); },
  night_clock(t, d, k) { night(); OV.clock = '2:13 AM'; cam([-12, 14, 26], [-10, 12, 20], [3, 2, -2], [3, 2, -2], ease(k), 52); },
  night_street(t, d, k) { night(); nicoAtStop(t, 'worried'); OV.clock = '2:13 AM'; cam([0.5, 2.2, 9], [1.2, 2.2, 7.6], [6.4, 1.6, 0.6], [6.4, 1.6, 0.6], ease(k), 50); },
  player_idle(t, d, k) { night(); nicoAtStop(t, 'worried'); player.place(-6.4, SW, 1.0, Math.PI / 2 - 0.1); player.expr = 'determined'; player.pose({ t }); carA.position.set(-3.2, 0, -3); carA.rotation.y = 0; carA.visible = true; OV.hud = true; tag(player, 'PLAYER', 'rgba(25,118,210,0.85)'); cam([-1.8, 2.0, 9.5], [-1.4, 2.0, 8.8], [-4, 1.6, 0.8], [-3.6, 1.6, 0.8], ease(k), 52); },
  player_stare(t, d, k) { night(); player.place(-6.4, SW, 1.0, Math.PI / 2 - 0.1); player.expr = 'determined'; player.pose({ t }); OV.hud = true; const h = headPos(player); cam([h.x + 2.6, h.y - 0.1, h.z + 0.6], [h.x + 2.0, h.y, h.z + 0.4], h.toArray(), h.toArray(), ease(k), 44); },
  nico_nervous(t, d, k) { night(); nicoAtStop(t, 'worried'); nico.o.look = -1; const h = headPos(nico); cam([h.x - 2.4, h.y, h.z + 0.9], [h.x - 1.9, h.y, h.z + 0.7], h.toArray(), h.toArray(), ease(k), 44); },
  truck_coming(t, d, k) { night(); nicoAtStop(t, 'shock'); player.place(5.4, SW, 2.2, -Math.PI / 2); player.expr = 'shock'; player.pose({ t }); truck.position.set(lerp(2, 4.5, k), 0, lerp(-40, -12, ease(k))); truck.rotation.y = 0.12 * k; truck.visible = true; cam([1.2, 1.3, 7.0], [1.4, 1.4, 7.5], [3.2, 2.0, -14], [3.6, 2.0, -12], ease(k), 54); },
  game_over(t, d, k) {
    night(); truck.position.set(5.2, 0, -2.5); truck.rotation.y = 0.35; truck.visible = true;
    nico.place(4.5, SW + 0.1, 3.5, 1.0, -Math.PI / 2); nico.expr = 'sleep'; nico.pose({ t });
    player.place(3.0, 0.27, 4.4, -0.6, -Math.PI / 2); player.expr = 'sleep'; player.pose({ t });
    effects.gray(ease(clamp01(k * 2))); OV.gameover = ease(clamp01((k - 0.15) * 3));
    if (k < 0.15) { effects.flash(1 - k / 0.15); effects.shake(0.3); }
    cam([0, 7, 10], [0, 8.5, 11], [4, 0.5, 2], [4, 0.5, 2], ease(k), 52);
  },
  reload_1(t, d, k) {
    night(); OV.loading = k < 0.3 ? 1 - k / 0.3 : 0; OV.attempt = 'ATTEMPT 2';
    nicoAtStop(t, 'worried'); player.place(lerp(-6.4, 2.5, ease(clamp01((k - 0.25) / 0.75))), SW, 1.6, Math.PI / 2); player.expr = 'determined'; player.pose({ walk: t * 12, amp: 0.9, t, lean: 0.15 });
    cam([0, 2.2, 10], [0.5, 2.2, 9.5], [3, 1.6, 1], [4, 1.6, 1], ease(k), 52);
  },
  truck_again(t, d, k) {
    night(); OV.attempt = 'ATTEMPT 2'; nicoAtStop(t, 'shock'); player.place(5.0, SW, 2.0, -Math.PI / 2 + 0.3); player.expr = 'shock'; player.pose({ t, armR: [-1.6, 0, 0] });
    truck.position.set(lerp(3, 5.2, k), 0, lerp(-24, -3, ease(clamp01(k / 0.85)))); truck.rotation.y = 0.3 * k; truck.visible = true;
    if (k > 0.82) { effects.flash(0.9); effects.gray(1); OV.gameover = 1; effects.shake(0.3); }
    cam([8.6, 2.0, 7], [8.6, 2.2, 7.4], [4.5, 1.8, -6], [5, 1.8, -2], ease(k), 54);
  },
  reload_montage(t, d, k) {
    night(); const n = Math.floor(k * 9), sub = (k * 9) % 1; OV.attempt = 'ATTEMPT ' + Math.round(lerp(3, 47, k));
    if (sub < 0.25) OV.loading = 1 - sub * 4;
    nicoAtStop(t, 'worried'); const variants = [[-6.4, 1.6], [-2, 3], [0, -2], [-4, -4], [2, 3]];
    const [px, pz] = variants[n % 5]; player.place(lerp(px, px + 4, sub), SW, pz, Math.PI / 2); player.expr = 'determined'; player.pose({ walk: t * 12, amp: 0.9, t, lean: 0.15 });
    truck.position.set(3 + (n % 3), 0, lerp(-30, -4, sub)); truck.rotation.y = 0.2; truck.visible = true;
    if (sub > 0.88) { effects.flash(0.8); effects.gray(1); }
    const angles = [[0, 2.2, 10], [10, 3, 6], [-3, 8, 12], [9, 1.5, -6], [-2, 2, -10]]; const a = angles[n % 5];
    cam(a, a, [4, 1.6, 0], [4, 1.6, 0], 0, 52);
  },
  try48_grab(t, d, k) {
    night(); OV.attempt = 'ATTEMPT 48'; const pull = ease(clamp01((k - 0.3) / 0.5));
    player.place(lerp(5.4, 3.6, pull), SW, 1.0, -Math.PI / 2); player.expr = 'determined'; player.pose({ t, armR: [-1.6, 0, 0.2], lean: -0.15 * pull });
    nico.place(lerp(6.3, 4.6, pull), SW, 1.1, -Math.PI / 2 + 0.2); nico.expr = 'shock'; nico.pose({ t, armL: [-1.5, 0, -0.2], lean: 0.2 * pull });
    truck.position.set(4.5, 0, lerp(-40, -16, k)); truck.rotation.y = 0.12; truck.visible = true;
    cam([0.5, 2.0, 6.5], [0.8, 2.0, 6.0], [5, 1.8, 0.8], [4.6, 1.8, 0.8], ease(k), 50);
  },
  truck_miss(t, d, k) {
    night(); OV.attempt = 'ATTEMPT 48';
    player.place(3.0, 0.3, 2.2, 0.4, -Math.PI / 2 * 0.0); player.expr = 'shock'; player.pose({ sit: true, t });
    nico.place(1.7, 0.3, 2.6, 0.6); nico.expr = 'shock'; nico.pose({ sit: true, t });
    truck.position.set(6.4, 0, lerp(-16, 30, k)); truck.rotation.y = 0.05; truck.visible = true;
    if (k > 0.35 && k < 0.55) effects.shake(0.15);
    cam([0.2, 2.6, 9.5], [0.5, 2.5, 9.0], [4.0, 1.2, 0], [4.0, 1.2, 0], ease(k), 56);
  },
  dumpster_return(t, d, k) { night(); nico.place(8.6, SW, -14.2, Math.PI / 2 + 0.3); nico.expr = 'worried'; nico.pose({ t }); player.place(7.4, SW, -15.8, Math.PI / 2 + 0.2); player.expr = 'smile'; player.pose({ t }); cam([5.0, 2.8, -7.0], [5.6, 2.7, -7.6], [11, 2.4, -12.4], [11, 2.4, -12.4], ease(k), 50); },
  his_notes(t, d, k) { night(); nico.place(9.4, SW, -14.9, Math.PI / 2 + 0.4); nico.expr = 'shock'; nico.pose({ t }); const a = myNotes.position.clone().lerp(hisNotes.position, ease(k)); cam([a.x - 4.6, 2.5, a.z + 0.6], [a.x - 4.0, 2.5, a.z + 0.4], a.toArray(), a.toArray(), ease(k), 48); },
  his_notes_close(t, d, k) { night(); const p = hisNotes.position; cam([p.x - 2.8, p.y + 0.4, p.z], [p.x - 2.2, p.y + 0.4, p.z], [p.x, p.y + 0.45, p.z], [p.x, p.y + 0.45, p.z], ease(k), 44); },
  save_nico(t, d, k) { night(); const p = hisNotes.position; effects.flash(k < 0.15 ? 0.3 * (1 - k / 0.15) : 0, '255,60,48'); cam([p.x - 1.9, p.y - 0.35, p.z + 0.05], [p.x - 1.5, p.y - 0.35, p.z + 0.05], [p.x, p.y - 0.4, p.z + 0.05], [p.x, p.y - 0.4, p.z + 0.05], ease(k), 42); },
  two_remember(t, d, k) {
    night(); nicoAtStop(t, k > 0.5 ? 'happy' : 'smile'); player.place(5.2, SW, 0.9, Math.PI / 2 + 0.5); player.expr = 'smile'; player.pose({ t, armR: [-0.9, 0, 0.5] });
    nico.pose({ t, headY: -0.5 }); tag(nico, 'NICO', 'rgba(46,125,50,0.85)'); tag(player, 'PLAYER', 'rgba(25,118,210,0.85)');
    cam([1.0, 2.2, 7.5], [1.4, 2.2, 6.4], [5.8, 1.9, 0.8], [5.8, 1.9, 0.8], ease(k), 50);
  },
  end_pull(t, d, k) { night(); nicoAtStop(t, 'happy'); player.place(5.2, SW, 0.9, Math.PI / 2 + 0.5); player.expr = 'happy'; player.pose({ t }); OV.saved = clamp01((k - 0.3) * 3); cam([1.4, 2.2, 6.4], [-1.5, 5.5, 13], [5.8, 1.9, 0.8], [5.4, 1.6, 0.6], ease(k), 52); },
};
const wrapped = Object.fromEntries(Object.entries(S).map(([n, f]) => [n, (...a) => { resetOV(); hisNotes.visible = true; f(...a); }]));
E.run({ timings: T, shots: wrapped, captionStyle: 'lime', overlay });
