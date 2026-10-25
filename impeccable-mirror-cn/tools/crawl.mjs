#!/usr/bin/env node
/**
 * Crawl https://impeccable.style into ./site/ as a static mirror.
 *
 * - Seeds: sitemap.xml URLs + known data/specimen endpoints
 * - Discovers: HTML attrs (href/src/srcset), CSS url(), JS relative imports
 *   inside /_astro/ chunk graphs, /_data/api JSON payloads
 * - Pages are saved as <path>/index.html (directory format, matches upstream)
 *
 * Serial on purpose (user directive: no concurrency).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'https://impeccable.style';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');

const seen = new Set();
const queue = [];

function enqueue(urlPath) {
  if (!urlPath || !urlPath.startsWith('/')) return;
  const clean = urlPath.split('#')[0].split('?')[0];
  if (!clean || seen.has(clean)) return;
  seen.add(clean);
  queue.push(clean);
}

function localPathFor(urlPath) {
  const isFile = /\.[a-z0-9]+$/i.test(urlPath) || urlPath.endsWith('/');
  let p = urlPath;
  if (p.endsWith('/')) p += 'index.html';
  else if (!isFile) p += '/index.html';
  return path.join(OUT, p.replaceAll('/', path.sep));
}

async function fetchIt(urlPath) {
  const res = await fetch(ORIGIN + urlPath, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${res.status} ${urlPath}`);
  return Buffer.from(await res.arrayBuffer());
}

const HTML_RE = /(?:href|src|poster|data-src)="(\/[^"]*)"/g;
const SRCSET_RE = /srcset="([^"]*)"/g;
const CSS_URL_RE = /url\(\s*['"]?(\/[^'")]+)['"]?\s*\)/g;
const JS_REL_RE = /(?:from|import)\s*["'](\.\.?\/[^"']+)["']/g;
const JS_ABS_RE = /["'](\/(?:_astro|assets|js|_data|antipattern-[a-z]+)\/[^"'\s)]+)["']/g;

function extractRefs(kind, base, text) {
  const refs = [];
  const regexes = kind === 'html' ? [HTML_RE, SRCSET_RE, CSS_URL_RE] : kind === 'css' ? [CSS_URL_RE] : [JS_REL_RE, JS_ABS_RE];
  for (const re of regexes) {
    for (const m of text.matchAll(re)) {
      // srcset values hold multiple comma-separated "url width" candidates
      const candidates = re === SRCSET_RE ? m[1].split(',') : [m[1]];
      for (const cand of candidates) {
        let ref = cand.trim().split(/\s+/)[0];
        if (!ref || !ref.startsWith('/')) continue;
        if (ref.startsWith('./') || ref.startsWith('../')) {
          ref = new URL(ref, 'https://x.test' + base).pathname;
        }
        refs.push(ref);
      }
    }
  }
  return refs;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  // Seed: sitemap
  const sitemap = (await fetchIt('/sitemap.xml')).toString();
  for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    enqueue(new URL(m[1]).pathname);
  }
  // Seed: data payloads consumed by client JS
  enqueue('/_data/api/commands.json');
  enqueue('/_data/api/patterns.json');
  enqueue('/_data/api/skills.json');
  enqueue('/_data/api/version.json');
  enqueue('/js/detect-antipatterns-browser.js');
  enqueue('/robots.txt');
  enqueue('/sitemap.xml');
  enqueue('/favicon.svg');
  enqueue('/apple-touch-icon.png');

  let pages = 0;
  let assets = 0;
  while (queue.length > 0) {
    const urlPath = queue.shift();
    const dest = localPathFor(urlPath);
    let body;
    try {
      body = await fetchIt(urlPath);
    } catch (err) {
      console.error(`SKIP ${err.message}`);
      continue;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, body);

    const isHtml = urlPath === '/' || urlPath.endsWith('/') || urlPath.endsWith('.html') || !/\.[a-z0-9]{2,5}$/i.test(urlPath);
    const text = body.toString('utf8');
    if (isHtml && !text.startsWith('<')) {
      // JSON or other non-HTML — still scan for absolute refs
    }
    const kind = /\.(css)$/i.test(urlPath) ? 'css'
      : /\.(m?js)$/i.test(urlPath) ? 'js'
      : /\.json$/i.test(urlPath) ? 'js'
      : 'html';
    if (kind === 'html' && isHtml) {
      pages++;
      for (const ref of extractRefs('html', urlPath, text)) enqueue(ref);
    } else if (kind === 'css') {
      assets++;
      for (const ref of extractRefs('css', urlPath, text)) enqueue(ref);
    } else if (kind === 'js') {
      assets++;
      if (urlPath.includes('/_astro/')) {
        for (const ref of extractRefs('js', urlPath, text)) enqueue(ref);
      }
      // client data fetches
      for (const m of text.matchAll(/["'](\/_data\/[^"']+)["']/g)) enqueue(m[1]);
    } else {
      assets++;
    }
    process.stdout.write(`\r${queue.length} queued | ${pages} pages, ${assets} assets`);
    await new Promise((r) => setTimeout(r, 60));
  }
  console.log(`\ndone: ${pages} pages, ${assets} assets`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
