// Usage: node render.cjs <outDir> [fps] [workers] [onlyTimes,comma-separated]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const outDir = path.resolve(process.argv[2] || 'build/frames');
const fps = +(process.argv[3] || 30), workers = +(process.argv[4] || 4);
const only = process.argv[5] ? process.argv[5].split(',').map(Number) : null;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}/stories/grey-town/scene.html`;
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const open = async () => {
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.error('pageerror', e.message));
    page.on('console', (m) => m.type() === 'error' && console.error('console', m.text()));
    await page.goto(url); await page.waitForFunction('window.ready === true', null, { timeout: 120000 });
    return page;
  };
  const first = await open();
  const dur = await first.evaluate(() => window.duration);
  const jobs = only ? only.map((t, i) => ({ t, name: `t${String(t).replace('.', '_')}.jpg` }))
    : Array.from({ length: Math.ceil(dur * fps) }, (_, i) => ({ t: i / fps, name: `${String(i).padStart(5, '0')}.jpg` }));
  const pages = [first, ...(await Promise.all(Array.from({ length: Math.min(workers, jobs.length) - 1 }, open)))];
  let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(pages.map(async (page) => {
    while (next < jobs.length) {
      const j = jobs[next++];
      const data = await page.evaluate((t) => window.renderAt(t), j.t);
      fs.writeFileSync(path.join(outDir, j.name), Buffer.from(data.split(',')[1], 'base64'));
      if (++done % 60 === 0) console.log(`${done}/${jobs.length} ${((Date.now() - t0) / done).toFixed(0)}ms/frame`);
    }
  }));
  console.log('done', jobs.length, 'frames in', ((Date.now() - t0) / 1000).toFixed(1), 's');
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
