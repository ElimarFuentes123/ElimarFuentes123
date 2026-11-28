// Renders brand/alastres/{profile_picture,youtube_banner,kapre_cover}.png
// Usage: node stories/brand-alastres/render.cjs  (needs stories/kapre/build/timings.json)
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
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ep = await browser.newPage(); ep.on('pageerror', (e) => console.error('pageerror', e.message));
  await ep.goto(`${base}/stories/kapre/index.html?clean`); await ep.waitForFunction('window.ready === true', null, { timeout: 120000 });
  const frame = await ep.evaluate((t) => window.renderAt(t), +(process.argv[2] || 10.37));
  const page = await browser.newPage(); page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${base}/stories/brand-alastres/index.html`); await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
  const out = path.join(ROOT, 'brand/alastres'); fs.mkdirSync(out, { recursive: true });
  for (const [fn, name] of [['renderProfile', 'profile_picture.png'], ['renderBanner', 'youtube_banner.png'], ['renderCover', 'kapre_cover.png']]) {
    const data = await page.evaluate(([f, src]) => window[f](src), [fn, frame]);
    fs.writeFileSync(path.join(out, name), Buffer.from(data.split(',')[1], 'base64')); console.log('wrote', name);
  }
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
