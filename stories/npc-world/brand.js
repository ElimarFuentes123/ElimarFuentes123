// Channel art for the "In This World" NPC series, rendered with the episode engine.
import * as E from '../engine/engine.js';
import { makeNico, NICO_COLORS } from './nico.js';
const { THREE } = E;
await document.fonts.load('800 80px Cap');
const nico = makeNico();
E.sky.visible = false;
const bg = E.canvasTex(1024, 1024, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, '#2a0f5e'); gr.addColorStop(0.45, '#c2307a'); gr.addColorStop(0.75, '#ff7a59'); gr.addColorStop(1, '#ffc46b'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  g.fillStyle = 'rgba(255,230,150,0.95)'; g.beginPath(); g.arc(512, 700, 230, 0, 7); g.fill();
  g.fillStyle = '#c2307a'; for (let y = 620; y < 940; y += 34) g.fillRect(0, y, 1024, 8 + (y - 620) / 26);
  g.fillStyle = '#1a0b3a'; const r = E.rng(5); for (let x = 0; x < 1024; x += 60) { const h = 120 + r() * 220; g.fillRect(x, 1024 - h, 52, h); }
  const palm = (x, s) => { g.strokeStyle = '#140826'; g.lineWidth = 16 * s; g.beginPath(); g.moveTo(x, 1024); g.quadraticCurveTo(x + 30 * s, 800, x + 10 * s, 620); g.stroke(); g.fillStyle = '#140826'; for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6; g.beginPath(); g.ellipse(x + 10 * s + Math.cos(a) * 80 * s, 620 + Math.sin(a) * 34 * s + 20 * s, 95 * s, 16 * s, a, 0, 7); g.fill(); } };
  palm(110, 1.1); palm(930, 1.2);
});
E.scene.background = bg; E.scene.fog = null;
E.hemi.color.set('#ffd6ea'); E.hemi.groundColor.set('#5a2a6a'); E.hemi.intensity = 1.6;
E.sun.color.set('#ffe2c8'); E.sun.intensity = 3.0;
const rim = new THREE.DirectionalLight('#5ff2ff', 2.2); rim.position.set(-6, 4, -4); E.scene.add(rim);
function render(w, h, sunOff) {
  E.renderer.setSize(w, h, false); E.camera.aspect = w / h; E.camera.updateProjectionMatrix();
  for (const c of E.chars) c.update();
  const look = E.camAt(); E.sun.target.position.copy(look); E.sun.position.copy(look).add(new THREE.Vector3(...sunOff));
  E.renderer.render(E.scene, E.camera);
  const out = document.createElement('canvas'); out.width = w; out.height = h; out.getContext('2d').drawImage(E.renderer.domElement, 0, 0, w, h, 0, 0, w, h);
  return out;
}
window.renderProfile = () => {
  nico.place(0, 0, 0, 0); nico.expr = 'grin'; nico.pose({ headZ: 0.06, armR: [-2.6, 0, 0.55], armL: [0.1, 0, -0.15] });
  const h = E.headPos(nico, 0.2);
  E.cam([h.x - 0.3, h.y + 0.15, h.z + 4.7], [0, 0, 0], [h.x + 0.15, h.y - 0.4, h.z], [0, 0, 0], 0, 38);
  return render(800, 800, [4, 6, 10]).toDataURL('image/png');
};
function sunsetBg(w, h, sunX, sunY, sunR) {
  return E.canvasTex(w, h, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a0f5e'); gr.addColorStop(0.45, '#c2307a'); gr.addColorStop(0.75, '#ff7a59'); gr.addColorStop(1, '#ffc46b'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,230,150,0.95)'; g.beginPath(); g.arc(sunX, sunY, sunR, 0, 7); g.fill();
    g.fillStyle = '#c2307a'; for (let y = sunY - sunR * 0.35; y < sunY + sunR; y += sunR * 0.15) g.fillRect(sunX - sunR, y, sunR * 2, 4 + (y - sunY + sunR * 0.35) / 14);
    g.fillStyle = '#1a0b3a'; const r = E.rng(8); for (let x = 0; x < w; x += 70) { const bh = h * 0.12 + r() * h * 0.22; g.fillRect(x, h - bh, 62, bh); for (let wy = h - bh + 20; wy < h - 10; wy += 34) for (let wx = x + 10; wx < x + 55; wx += 18) if (r() < 0.35) { g.fillStyle = r() < 0.5 ? '#ff3e9a' : '#5ff2ff'; g.fillRect(wx, wy, 8, 12); g.fillStyle = '#1a0b3a'; } }
    const palm = (x, s) => { g.strokeStyle = '#140826'; g.lineWidth = 16 * s; g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + 30 * s, h - 220 * s, x + 10 * s, h - 400 * s); g.stroke(); g.fillStyle = '#140826'; for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6; g.beginPath(); g.ellipse(x + 10 * s + Math.cos(a) * 80 * s, h - 400 * s + Math.sin(a) * 34 * s + 20 * s, 95 * s, 16 * s, a, 0, 7); g.fill(); } };
    palm(330, 1.3); palm(2280, 1.4); palm(2450, 1.0);
  });
}
function title(ctx, text, x, y, size, fill = NICO_COLORS.lime, align = 'left') {
  ctx.save(); ctx.font = `800 ${size}px Cap`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = size * 0.18; ctx.shadowOffsetY = size * 0.07;
  ctx.lineWidth = size * 0.2; ctx.strokeStyle = '#15102a'; ctx.strokeText(text, x, y);
  ctx.shadowColor = 'transparent'; ctx.fillStyle = fill; ctx.fillText(text, x, y); ctx.restore();
}
window.renderBanner = () => {
  E.scene.background = sunsetBg(2560, 1440, 1280, 1000, 330);
  nico.place(0, 0, 0, -0.25); nico.expr = 'grin'; nico.pose({ headZ: 0.05, headY: 0.15, armR: [-2.6, 0, 0.55], armL: [0.1, 0, -0.15] });
  const h = E.headPos(nico, 0.2);
  // camera offset so Nico sits right of center inside the 1546x423 safe area
  E.cam([h.x - 3.0, h.y + 0.2, h.z + 14], [0, 0, 0], [h.x - 3.0, h.y + 0.2, h.z], [0, 0, 0], 0, 30);
  const c = render(2560, 1440, [4, 6, 10]); const ctx = c.getContext('2d');
  title(ctx, 'NPC NICO', 600, 610, 170);
  title(ctx, "IN THIS WORLD... I'M JUST AN NPC", 606, 745, 62, '#ffffff');
  ctx.save(); ctx.font = '800 44px Cap'; ctx.fillStyle = NICO_COLORS.teal; ctx.textBaseline = 'middle';
  const pw = ctx.measureText('NEW STORY EVERY WEEK').width + 64; ctx.fillStyle = '#15102a'; ctx.beginPath(); ctx.roundRect(600, 812, pw, 76, 38); ctx.fill(); ctx.fillStyle = NICO_COLORS.lime; ctx.fillText('NEW STORY EVERY WEEK', 632, 851); ctx.restore();
  return c.toDataURL('image/png');
};
window.ready = true;
