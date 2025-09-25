import puppeteer from 'puppeteer';

const base = process.env.TEST_BASE || 'http://localhost:8787';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE:', msg.text()));

  try {
    await page.goto(base + '/test.html', { waitUntil: 'networkidle2' });

    // wait for service worker controller to be available on the page
    const reg = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { ok: false, msg: 'no-sw' };
      let attempt = 0;
      while (!navigator.serviceWorker.controller && attempt++ < 20) {
        await new Promise(r => setTimeout(r, 250));
      }
      return { ok: !!navigator.serviceWorker.controller };
    });

    console.log('sw-controller on page:', reg);

    // Run fetches inside the page so the SW can intercept them
    const debug = await page.evaluate(async () => {
      try {
        const r = await fetch('/__sw-debug');
        const text = await r.text().catch(() => '<no-body>');
        return { path: '/__sw-debug', status: r.status, body: text.slice(0, 1000) };
      } catch (e) {
        return { path: '/__sw-debug', error: e && e.message };
      }
    });
    console.log('page fetch result:', debug.path, debug.status || debug.error);
    if (debug.body) console.log('body (truncated):', debug.body.slice(0,200));

    // Perform a probe: ask SW which proxy would route several candidate paths
    const candidates = [
      '/scramjet/?url=https://example.com/',
      '/a/?url=https://example.com/',
      '/a/https://example.com/',
      '/a/https://example.com',
      '/a/https%3A%2F%2Fexample.com%2F',
      '/__sw-probe?path=/scramjet/?url=https://example.com/',
      '/__sw-probe?path=/a/?url=https://example.com/',
      '/__sw-probe?path=/a/https://example.com/'
    ];

    for (const c of candidates) {
      const res = await page.evaluate(async (path) => {
        try {
          const r = await fetch(path);
          const text = await r.text().catch(() => '<no-body>');
          return { path, status: r.status, body: text.slice(0, 1200) };
        } catch (e) {
          return { path, error: e && e.message };
        }
      }, c);
      console.log('candidate result:', res.path, res.status || res.error);
      if (res.body) console.log('body (truncated):', res.body.slice(0,300));
    }

    const logs = await page.evaluate(async () => {
      try {
        const r = await fetch('/__sw-logs');
        const text = await r.text().catch(() => '<no-body>');
        return { path: '/__sw-logs', status: r.status, body: text.slice(0, 2000) };
      } catch (e) {
        return { path: '/__sw-logs', error: e && e.message };
      }
    });
    console.log('page fetch result:', logs.path, logs.status || logs.error);
    if (logs.body) console.log('logs (truncated):', logs.body.slice(0,400));

    const active = await page.evaluate(async () => {
      try {
        const r = await fetch('/__sw-active');
        const text = await r.text().catch(() => '<no-body>');
        return { path: '/__sw-active', status: r.status, body: text.slice(0, 2000) };
      } catch (e) {
        return { path: '/__sw-active', error: e && e.message };
      }
    });
    console.log('page fetch result:', active.path, active.status || active.error);
    if (active.body) console.log('active (truncated):', active.body.slice(0,400));

    const alt = await page.evaluate(async () => {
      try {
        const r = await fetch('/a/?url=https://example.com/');
        const text = await r.text().catch(() => '<no-body>');
        return { path: '/a/?url=example', status: r.status, body: text.slice(0, 1000) };
      } catch (e) {
        return { path: '/a/?url=example', error: e && e.message };
      }
    });
    console.log('page fetch result:', alt.path, alt.status || alt.error);
    if (alt.body) console.log('body (truncated):', alt.body.slice(0,200));

  } catch (e) {
    console.error('test-run-failed', e && e.message);
  } finally {
    await browser.close();
  }
})();
