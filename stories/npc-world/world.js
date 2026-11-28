// Shared world for the NPC Nico series: neon beach city, props, the player, and the game HUD (our own design).
// Episode 1 (npc-reload) has its own copy of this code; episodes from 2 on import it from here.
import * as E from '../engine/engine.js';
import { NICO_COLORS } from './nico.js';
const { THREE, mat, box, cyl, canvasTex, signTex, headPos, clamp01 } = E;

export function makePlayer() {
  const player = E.makeChar({ shirt: '#2d2d33', pants: '#4a5a7a', shoes: '#111111', hairType: 'cap', cap: '#1b1b1b', stripe: '#e53935' });
  return player;
}
// floating green diamond over players
const diamondGeo = new THREE.OctahedronGeometry(0.32, 0), diamondMat = new THREE.MeshBasicMaterial({ color: '#3cff8a' });
export function makeMarkers(n) {
  return Array.from({ length: n }, () => { const m = E.prop(new THREE.Mesh(diamondGeo, diamondMat)); m.scale.set(0.8, 1.3, 0.8); E.scene.add(m); return m; });
}
export function markOver(marker, ch, t, phase = 0) { const h = headPos(ch, 0.4); marker.position.set(h.x, h.y + 1.0 + Math.sin(t * 4 + phase) * 0.12, h.z); marker.rotation.y = t * 2 + phase; marker.visible = true; }

export function palm(parent, x, z, s = 1, seed = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g); const r = E.rng(seed);
  const tm = mat('#9a6b43'); const lean = (r() - 0.5) * 0.3;
  for (let i = 0; i < 7; i++) { const seg = cyl(0.26 - i * 0.015, 0.3 - i * 0.015, 1.05, tm, lean * i * i * 0.08, 0.5 + i * 1.0, 0, g, 8); seg.rotation.z = -lean * i * 0.18; }
  const top = new THREE.Vector3(lean * 36 * 0.08, 7.3, 0); const lm = mat('#2fa84f'), lm2 = mat('#3cc35e');
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + r(); const lf = new THREE.Group(); lf.position.copy(top); lf.rotation.set(0, a, 0); g.add(lf); const b = box(3.2, 0.12, 0.8, i % 2 ? lm : lm2, 1.5, -0.35, 0, lf); b.rotation.z = -0.45; }
  E.sphere(0.35, mat('#6b4a2a'), top.x, top.y - 0.25, 0, g, 8);
  return g;
}

// City street along z (road x in [-4,4], sidewalks to x=±7.2, buildings from x=±8).
// skipLeft/skipRight: z positions where no building is placed (for custom fronts).
export function buildCity(name = 'city', { seed = 21, skipLeft = [], skipRight = [], palmSkip = [] } = {}) {
  const city = new THREE.Group();
  const g = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), mat('#6cc06a')); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; city.add(g);
  box(8, 0.05, 600, mat('#3b4050'), 0, 0.025, 0, city, false);
  const dash = mat('#ffd23b'); for (let z = -280; z < 280; z += 6) { box(0.16, 0.06, 2.6, dash, -0.15, 0.03, z, city, false); box(0.16, 0.06, 2.6, dash, 0.15, 0.03, z, city, false); }
  for (const s of [-1, 1]) { box(3.2, 0.18, 600, mat('#ece2d0'), s * 5.6, 0.09, 0, city, false); box(0.22, 0.22, 600, mat('#c9bfae'), s * 4.05, 0.11, 0, city, false); }
  for (let x = -3.4; x <= 3.4; x += 0.9) box(0.5, 0.06, 3, mat('#ffffff'), x, 0.035, -24, city, false);
  const r = E.rng(seed), walls = ['#ffb3c7', '#9be7e2', '#ffd59e', '#c7b3ff', '#f7f0e0', '#ff9e8a', '#b8f0c8'], neon = ['#ff3e9a', '#16e0d8', '#ffd23b', '#a46bff'];
  for (const s of [-1, 1]) for (let z = -98; z <= 98; z += 14) {
    if ((s < 0 ? skipLeft : skipRight).includes(z)) continue;
    const h = 7 + r() * 12, wm = mat(walls[Math.floor(r() * walls.length)]);
    box(10, h, 12.6, wm, s * 13, h / 2, z, city);
    const fx = s * 7.97;
    for (let y = 2.2; y < h - 1; y += 2.6) for (const dz of [-4, 0, 4]) box(0.1, 1.5, 2.2, E.glassMat, fx, y, z + dz, city, false);
    const nm = new THREE.MeshBasicMaterial({ color: neon[Math.floor(r() * neon.length)] });
    box(0.14, 0.22, 12.6, nm, fx, h - 0.3, z, city, false); box(0.14, h, 0.22, nm, fx, h / 2, z + 6.2, city, false);
    box(10.4, 0.5, 13, mat('#f4efe6'), s * 13, h + 0.25, z, city);
  }
  for (const s of [-1, 1]) for (let z = -95; z <= 95; z += 11) {
    const pz = z + (s > 0 ? 5 : 0); if (palmSkip.some(([ps, zz]) => ps === s && Math.abs(pz - zz) < 5)) continue;
    palm(city, s * 7.3, pz, 0.95 + ((z * 7) % 5) * 0.04, z + 300 * s);
  }
  for (const s of [-1, 1]) for (let z = -90; z <= 90; z += 22) E.lamp(city, s * 6.9, z + 3);
  return E.addSet(name, city);
}
export function storefront(city, s, z, { wall = '#9be7e2', h = 9, text = 'SHOP', bg = '#ff3e9a', fg = '#ffffff' } = {}) {
  box(10, h, 12.6, mat(wall), s * 13, h / 2, z, city); box(10.4, 0.5, 13, mat('#f4efe6'), s * 13, h + 0.25, z, city);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.2), new THREE.MeshBasicMaterial({ map: signTex(text, { bg, fg }) })); sg.position.set(s * 7.94, 5.6, z); sg.rotation.y = -s * Math.PI / 2; city.add(sg);
  return sg;
}

// ---------- HUD ----------
const W = E.W, H = E.H;
export function txt(ctx, s, x, y, size, fill, align = 'center', stroke = '#120a24') {
  ctx.save(); ctx.font = `800 ${size}px Cap`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.18; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); ctx.fillStyle = fill; ctx.fillText(s, x, y); ctx.restore();
}
export function starShape(ctx, x, y, r, fill) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#120a24'; ctx.stroke(); }
export function hud(ctx, time, { stars = 0, money = '$48,230', clock = null } = {}) {
  const cx = 150, cy = 330, r = 108;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = 'rgba(18,10,40,0.78)'; ctx.fill(); ctx.clip();
  ctx.translate(cx, cy); ctx.rotate(time * 0.08); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 12;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 60, -200); ctx.lineTo(i * 60, 200); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-200, i * 70); ctx.lineTo(200, i * 70); ctx.stroke(); }
  ctx.fillStyle = '#ff3e9a'; ctx.beginPath(); ctx.arc(40, -50, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#3cff8a'; ctx.beginPath(); ctx.arc(-55, 30, 9, 0, 7); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = NICO_COLORS.teal; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx + 14, cy + 14); ctx.lineTo(cx, cy + 6); ctx.lineTo(cx - 14, cy + 14); ctx.closePath(); ctx.fill(); ctx.restore();
  txt(ctx, money, W - 50, 250, 64, '#7dff9a', 'right');
  for (let i = 0; i < 5; i++) starShape(ctx, W - 80 - i * 64, 330, 26, i < stars ? '#ffffff' : 'rgba(255,255,255,0.18)');
  if (clock) txt(ctx, clock, W - 50, 410, 54, '#ffffff', 'right');
}
export function pill(ctx, s, x, y, size, fill = NICO_COLORS.lime, bg = 'rgba(18,10,36,0.85)') {
  ctx.save(); ctx.font = `800 ${size}px Cap`; const w = ctx.measureText(s).width + size * 1.1;
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.75, w, size * 1.5, size * 0.75); ctx.fill(); ctx.restore();
  txt(ctx, s, x, y, size, fill);
}
