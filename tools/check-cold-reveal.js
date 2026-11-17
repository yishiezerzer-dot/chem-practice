#!/usr/bin/env node
// Cold-start reveal check. Opens an Organic card in a FRESH browser context (empty cache and storage, so the answer
// picture is not loaded yet), presses its button once (Show answer / Check / Submit), waits for the scroll to settle,
// and fails if the book line or the draft status line ends up under the sticky rating bar (or under the top bar).
// Usage: node tools/check-cold-reveal.js [--sizes 360x640,360x800,430x900] [--langs he,en] [--repeat 3] [--cards notebook,mc,typed]
// Defaults: 360x640, he and en, 1 run each, notebook card. Exit code 1 if any run fails.
// Needs playwright-core (a local install, or the global @playwright/cli package) and a Chromium build from Playwright.
const fs = require('fs'), path = require('path'), http = require('http'), { execSync } = require('child_process');
const root = path.join(__dirname, '..', 'site');

function loadPlaywright() {
  try { return require('playwright-core'); } catch (_) {}
  let g = ''; try { g = execSync('npm root -g', { encoding: 'utf8' }).trim(); } catch (_) {}
  for (const p of ['@playwright/cli/node_modules/playwright-core', 'playwright-core', 'playwright']) {
    try { return require(path.join(g, p)); } catch (_) {}
  }
  console.error('playwright-core not found (tried a local install and the global npm packages).'); process.exit(2);
}
// Newest Chromium in Playwright's browser folder, used when the build playwright-core expects is not installed.
function chromiumFallback() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || (process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA || '', 'ms-playwright')
    : process.platform === 'darwin' ? path.join(process.env.HOME || '', 'Library/Caches/ms-playwright') : path.join(process.env.HOME || '', '.cache/ms-playwright'));
  const dirs = fs.existsSync(base) ? fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1]) : [];
  for (const d of dirs) for (const exe of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe', 'chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
    const p = path.join(base, d, exe); if (fs.existsSync(p)) return p;
  }
  return null;
}

const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
const sizes = arg('sizes', '360x640').split(',').map(s => s.split('x').map(Number));
const langs = arg('langs', 'he,en').split(',');
const repeat = +arg('repeat', '1');
const cards = arg('cards', 'notebook').split(',');

// Plain static server for site/ (no caching headers, so each fresh context really fetches everything).
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, path.normalize(p));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const { chromium } = loadPlaywright();
  let browser;
  try { browser = await chromium.launch(); } catch (e) {
    const exe = chromiumFallback(); if (!exe) throw e;
    browser = await chromium.launch({ executablePath: exe });
  }
  let pass = 0, total = 0;
  for (const card of cards) for (const [w, h] of sizes) for (const lang of langs) for (let run = 1; run <= repeat; run++) {
    total++;
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); // fresh: empty cache, cookies and storage
    const page = await ctx.newPage();
    await page.goto(url);
    await page.waitForFunction(() => typeof enterCourse === 'function' && typeof COURSE !== 'undefined' && document.querySelector('#app').children.length > 0);
    const at = await page.evaluate(async ([lang, card]) => {
      setLang(lang); enterCourse('organic1'); start('o-02-nomenclature', ['o-sample-' + card]);
      await new Promise(r => setTimeout(r, 300));
      if (card === 'mc') document.querySelector('.choice').click();
      if (card === 'typed') { const i = document.querySelector('#typed'); i.value = '1-bromo-3-methylbutane'; i.dispatchEvent(new Event('input')); }
      document.querySelector('#show').click();
      const a = document.querySelector('#answer'), imgs = [...a.querySelectorAll('img')];
      return { h: Math.round(a.getBoundingClientRect().height), imgs: imgs.length, loaded: imgs.filter(i => i.complete && i.naturalWidth).length };
    }, [lang, card]);
    // Wait for the smooth scroll (it can start late in headless Chromium) and any follow-up scroll to settle.
    await page.waitForTimeout(2500);
    let prev = -1, still = 0;
    for (let i = 0; i < 50 && still < 8; i++) { await page.waitForTimeout(200); const y = await page.evaluate(() => scrollY); still = y === prev ? still + 1 : 0; prev = y; }
    const m = await page.evaluate(() => {
      const a = document.querySelector('#answer'), r = e => e && e.getBoundingClientRect();
      const book = r(a.querySelector(':scope > .meta')), status = r(a.querySelector(':scope > .meta + .cap')), bar = r(document.querySelector('#act'));
      const imgs = [...a.querySelectorAll('img')];
      return { book: [book.top, book.bottom], status: status ? status.bottom : null, bar: bar.top, h: Math.round(r(a).height), y: Math.round(scrollY), loaded: imgs.filter(i => i.complete && i.naturalWidth).length };
    });
    const end = m.status !== null ? m.status : m.book[1];
    const ok = end <= m.bar + 0.5 && m.book[0] >= 56;
    if (ok) pass++;
    const why = ok ? '' : end > m.bar + 0.5 ? ` (book line ${Math.round(m.book[1] - m.bar)}px and status line ${Math.round(end - m.bar)}px under the bar)` : ' (book line under the top bar)';
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${w}x${h} ${lang} ${card} run ${run}: book line ${Math.round(m.book[0])}-${Math.round(m.book[1])}, status line ends ${m.status === null ? '-' : Math.round(m.status)}, bar top ${Math.round(m.bar)}${why}` +
      ` · at reveal: answer ${at.h}px, pictures loaded ${at.loaded}/${at.imgs} · settled: answer ${m.h}px, pictures loaded ${m.loaded}/${at.imgs}, scrollY ${m.y}`);
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(`\ncold-reveal: ${pass}/${total} runs end visible`);
  process.exit(pass === total ? 0 : 1);
})().catch(e => { console.error(e); server.close(); process.exit(2); });
