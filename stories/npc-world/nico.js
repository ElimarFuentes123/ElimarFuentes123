// Nico: main character of the "In This World" (inside-GTA-6 NPC) series.
// Design: inspired by @synelite1's "Huss" build, changed: teal hoodie with pink/orange stars + NICO, pink beanie with an N.
import * as E from '../engine/engine.js';
const { THREE, mat, canvasTex } = E;
export const NICO_COLORS = { teal: '#16C7C1', pink: '#FF3E9A', orange: '#FF8A3D', lime: '#E8FF3A' };
export function makeNico() {
  const nico = E.makeChar({ shirt: NICO_COLORS.teal, pants: '#2a2f45', shoes: '#f4f4f4', hairType: 'beanie', cap: NICO_COLORS.pink, hood: true });
  // chest print: NICO + stars
  const chest = canvasTex(512, 440, (g) => {
    g.clearRect(0, 0, 512, 440);
    const star = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); };
    [[60, 60, 26, NICO_COLORS.pink], [450, 90, 22, NICO_COLORS.orange], [110, 370, 18, NICO_COLORS.orange], [420, 360, 26, NICO_COLORS.pink], [270, 60, 14, '#fff'], [40, 230, 12, '#fff'], [480, 240, 14, '#fff']].forEach((s) => star(...s));
    g.font = '800 150px Cap'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = 22; g.strokeStyle = '#1b1430'; g.strokeText('NICO', 256, 230); g.fillStyle = NICO_COLORS.lime; g.fillText('NICO', 256, 230);
  });
  const cm = mat('#ffffff', { map: chest, transparent: true });
  const cp = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.86), cm); cp.position.set(0, 1.5, 0.276); nico.body.add(cp);
  // beanie patch: N
  const patch = canvasTex(256, 256, (g) => {
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(28, 28, 200, 200, 40); g.fill();
    g.font = '800 170px Cap'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = NICO_COLORS.teal; g.fillText('N', 128, 140);
  });
  const pp = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), mat('#ffffff', { map: patch })); pp.position.set(0, 0.39 + 0.44, 0.452); nico.headP.add(pp);
  return nico;
}
