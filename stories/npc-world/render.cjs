// Renders brand/npc-world/profile_picture.png and youtube_banner.png
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/stories/npc-world/index.html`);
  await page.waitForFunction('window.ready === true', null, { timeout: 120000 });
  const out = path.join(ROOT, 'brand/npc-world');
  for (const [fn, name] of [['renderProfile', 'profile_picture.png'], ['renderBanner', 'youtube_banner.png']]) {
    const data = await page.evaluate((f) => window[f](), fn);
    fs.writeFileSync(path.join(out, name), Buffer.from(data.split(',')[1], 'base64')); console.log('wrote', name);
  }
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
