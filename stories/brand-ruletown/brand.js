// RULE TOWN channel art, rendered with the episode engine so it matches the videos.
import * as E from '../engine/engine.js';
const { THREE, show, makeChar, headPos, cam } = E;

E.buildTown('town', { seed: 7 });
const kid = makeChar({ shirt: '#ff7a1c', pants: '#2b4a86', hairType: 'kid', hair: '#2e1d12', hood: true });
const dad = makeChar({ shirt: '#3d6fb6', pants: '#3a3a46', shoes: '#2a2a2a', hairType: 'dad', hair: '#3b2618', beard: '#4a2f1c', stripe: '#2f5a99' });
const mayor = makeChar({ shirt: '#23262e', pants: '#23262e', shoes: '#111', hairType: 'tophat', tie: '#c0392b', mustache: '#2a1a10', vest: '#3a3f4c' });
const dale = makeChar({ shirt: '#f5c518', pants: '#3a4a6a', shoes: '#333', hairType: 'hood', mustache: '#6b3a1e' });
const teacher = makeChar({ shirt: '#4caf50', pants: '#5b4a3a', hairType: 'bob', hair: '#8a4b2a', glasses: true });
const kidCloud = E.rainCloud({ size: 0.75, drops: 40, width: 0.8 });
const mayorCloud = E.rainCloud({ size: 1.2, drops: 90 });
const daleCloud = E.rainCloud({ size: 1.0, drops: 70 });
const umb = E.umbrella('#24408f');
const over = (c, ch, h = 1.3) => { const p = headPos(ch); c.position.set(p.x, p.y + h, p.z); c.visible = true; c.userData.update(0.37, 1); };
await document.fonts.load('800 80px Cap');

function render(w, h) {
  E.renderer.setSize(w, h, false); E.camera.aspect = w / h; E.camera.updateProjectionMatrix();
  for (const c of E.chars) c.update();
  E.sky.position.copy(E.camera.position);
  const look = E.camAt(); E.sun.target.position.copy(look); E.sun.position.copy(look).add(new THREE.Vector3(18, 30, 14));
  E.renderer.render(E.scene, E.camera);
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const ctx = out.getContext('2d'); ctx.drawImage(E.renderer.domElement, 0, 0, w, h, 0, 0, w, h);
  return { out, ctx };
}
function title(ctx, text, x, y, size, fill = '#E8FF3A') {
  ctx.save(); ctx.font = `800 ${size}px Cap`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = size * 0.18; ctx.shadowOffsetY = size * 0.07;
  ctx.lineWidth = size * 0.2; ctx.strokeStyle = '#15130f'; ctx.strokeText(text, x, y);
  ctx.shadowColor = 'transparent'; ctx.fillStyle = fill; ctx.fillText(text, x, y); ctx.restore();
}

window.renderProfile = () => {
  show('town', 'day');
  E.chars.forEach((c) => c.hide());
  kid.place(-5.5, 0.18, 2, 0.15); kid.expr = 'happy'; kid.pose({ headX: -0.12, armR: [-2.9, 0, -0.25] });
  over(kidCloud, kid, 1.15);
  const h = headPos(kid);
  cam([h.x + 0.5, h.y + 0.05, h.z + 3.3], [h.x + 0.5, h.y + 0.05, h.z + 3.3], [h.x, h.y + 0.45, h.z], [h.x, h.y + 0.45, h.z], 0, 42);
  const { out } = render(1080, 1080);
  return out.toDataURL('image/png');
};

window.renderBanner = () => {
  show('town', 'day');
  E.chars.forEach((c) => c.hide());
  const z = 0, y = 0.18;
  teacher.place(-8.6 + 3.2, y, z + 0.6, 0.35).pose({ armR: [-1.2, 0, -0.3] }); teacher.expr = 'smirk';
  mayor.place(-6.6 + 3.0, y, z - 0.4, 0.2).pose({ armR: [-2.6, 0, -0.3] }); mayor.expr = 'grin'; over(mayorCloud, mayor, 1.6);
  kid.place(0.2, y - 0.18, z + 1.6, 0).pose({ armL: [-2.9, 0, 0.25], armR: [-2.9, 0, -0.25] }); kid.expr = 'laugh'; over(kidCloud, kid, 1.15);
  dad.place(2.0, y - 0.18, z + 0.8, -0.15).pose({ armR: [-0.95, 0, 0.1] }); dad.expr = 'smile';
  const hp = E.handPos(dad, 1); umb.position.set(hp.x, hp.y - 0.1, hp.z); umb.visible = true;
  dale.place(4.4, y, z - 0.2, -0.3).pose({ armR: [-1.6, 0, -0.5] }); dale.expr = 'grin'; over(daleCloud, dale, 1.3);
  cam([0.2, 1.6, 12.5], [0.2, 1.6, 12.5], [0.2, 4.9, 0], [0.2, 4.9, 0], 0, 38);
  const { out, ctx } = render(2560, 1440);
  // safe area for all devices: 1546x423 centred. Title + tagline live inside it.
  const g = ctx.createLinearGradient(0, 420, 0, 1020); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,0,0.28)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 420, 2560, 600);
  title(ctx, 'RULE TOWN', 1280, 600, 180);
  title(ctx, 'One town. One strange rule. One twist.', 1280, 735, 58, '#ffffff');
  return out.toDataURL('image/png');
};
window.ready = true;
