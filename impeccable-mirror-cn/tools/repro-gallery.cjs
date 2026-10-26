#!/usr/bin/env node
// Gallery 交互复现：控制台错误 + 请求失败 + 三类交互探测
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  const errors = [];
  const failed = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
  page.on('requestfailed', (r) => failed.push('REQFAIL ' + r.url().slice(-80)));
  page.on('response', (r) => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url().slice(-80)); });

  await page.goto('http://localhost:4173/docs-cn/impeccable-mirror/gallery/', { waitUntil: 'load', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));

  const probes = {};
  // 1. 关键控件存在性
  probes.modelButtons = await page.$$eval('[data-model]', (els) => els.map((e) => e.getAttribute('data-model')));
  probes.activeModel = await page.$eval('[data-model][aria-pressed="true"]', (e) => e.getAttribute('data-model')).catch(() => null);
  probes.briefSelect = await page.$eval('select', (e) => ({ id: e.id, options: [...e.options].slice(0, 4).map((o) => o.value) })).catch(() => null);
  probes.projectCards = await page.$$eval('.gallery-project', (els) => els.length);
  probes.statusText = await page.$eval('#gallery-status', (e) => e.textContent.trim().slice(0, 120)).catch(() => null);
  probes.imageBroken = await page.$$eval('img', (els) => els.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')));

  // 2. 交互：切换模型
  try {
    const second = await page.$$('[data-model]');
    await second[2].click();
    await new Promise((r) => setTimeout(r, 800));
    probes.afterModelClick = await page.$eval('[data-model][aria-pressed="true"]', (e) => e.getAttribute('data-model')).catch(() => null);
    probes.visibleCardsAfterModel = await page.$$eval('.gallery-project', (els) => els.filter((e) => e.offsetParent !== null).length).catch(() => null);
  } catch (e) { probes.afterModelClick = 'ERR ' + e.message.slice(0, 120); }

  // 3. 交互：换简报
  try {
    const sel = await page.$('select');
    if (sel) {
      await page.select('select', await page.$eval('select option:nth-child(2)', (o) => o.value));
      await new Promise((r) => setTimeout(r, 800));
      probes.afterBriefChange = await page.$$eval('.gallery-project', (els) => els.filter((e) => e.offsetParent !== null).length).catch(() => null);
    }
  } catch (e) { probes.afterBriefChange = 'ERR ' + e.message.slice(0, 120); }

  // 4. 交互：点卡片开灯箱
  try {
    const card = await page.$('.gallery-project');
    await card.click();
    await new Promise((r) => setTimeout(r, 800));
    probes.lightboxOpen = await page.$eval('dialog[open], .lightbox[open]', () => true).catch(() => false);
    probes.lightboxAlt = await page.$eval('dialog[open] img, .lightbox[open] img', (i) => (i.alt || '').slice(0, 60)).catch(() => null);
    const esc = await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 400));
  } catch (e) { probes.lightboxOpen = 'ERR ' + e.message.slice(0, 120); }

  console.log(JSON.stringify({ errors, failed: failed.slice(0, 12), probes }, null, 1));
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
