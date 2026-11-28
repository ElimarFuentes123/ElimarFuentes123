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
window.ready = true;
