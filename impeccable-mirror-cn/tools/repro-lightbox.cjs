#!/usr/bin/env node
// 灯箱核心验证：开 → 标题/图 → Esc 关（不点复制，避免无头剪贴板挂起）
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 160)));

  await page.goto('http://localhost:4173/docs-cn/impeccable-mirror/gallery/', { waitUntil: 'load', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  const probes = {};
  await page.evaluate(() => document.querySelector('button[data-open]').click());
  await new Promise((r) => setTimeout(r, 1200));
  probes.lightboxOpen = await page.$eval('#gallery-lightbox', (e) => e.open).catch(() => false);
  probes.lightboxTitle = await page.$eval('#gallery-lightbox-title', (e) => e.textContent.trim().slice(0, 70)).catch(() => null);
  probes.lightboxImgLoaded = await page.$eval('#gallery-lightbox img', (i) => i.complete && i.naturalWidth > 0).catch(() => false);
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 500));
  probes.closedAfterEscape = await page.$eval('#gallery-lightbox', (e) => !e.open).catch(() => false);
  probes.errors = errors;
  console.log(JSON.stringify(probes, null, 1));
  await browser.close();
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
