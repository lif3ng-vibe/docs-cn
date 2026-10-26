#!/usr/bin/env node
// 三页冒烟：新补 helper 服务的页面（首页/docs/changelog）
const puppeteer = require('puppeteer');

(async () => {
  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const p = await b.newPage();
  for (const u of ['/', '/docs/polish/', '/changelog/']) {
    const errs = [];
    const f404 = [];
    p.removeAllListeners('pageerror');
    p.removeAllListeners('response');
    p.on('pageerror', (e) => errs.push(e.message.slice(0, 120)));
    p.on('response', (r) => {
      if (r.status() >= 400 && !r.url().includes('relay') && !r.url().includes('cdn-cgi')) f404.push(r.status() + ' ' + r.url().slice(-70));
    });
    await p.goto('http://localhost:4173/docs-cn/impeccable-mirror' + u, { waitUntil: 'load', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1800));
    const cn = await p.evaluate(() => (document.body.innerText.match(/[一-龥]/g) || []).length);
    console.log(u, '| pageerrors:', errs.length, '| 失败:', f404.length, '| 中文字符:', cn);
    if (f404.length) console.log('  ', f404.slice(0, 3));
  }
  await b.close();
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
