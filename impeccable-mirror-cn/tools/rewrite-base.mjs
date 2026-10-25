#!/usr/bin/env node
/**
 * Rewrite the mirror for subpath deployment under GitHub Pages.
 *
 * Run AFTER translation is complete:
 *   node tools/rewrite-base.mjs
 *
 * - Root-relative URLs in HTML/CSS/JS → prefixed with BASE
 * - /api/* endpoints (Cloudflare Pages functions/rewrites) → absolute URLs on
 *   the official origin, so downloads and version checks keep working
 * - data-cfemail obfuscated emails → decoded plaintext
 * - sitemap.xml/robots.txt → point at the deployed mirror URL
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = '/docs-cn/impeccable-mirror';
const OFFICIAL = 'https://impeccable.style';
const SITE_URL = 'https://lif3ng-vibe.github.io';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');

// Path prefixes that exist as real files in the mirror → prefix them.
const LOCAL_PREFIXES = [
  '/_astro/', '/assets/', '/antipattern-images/', '/antipattern-examples/',
  '/js/', '/_data/', '/images/', '/docs', '/tutorials', '/slop', '/gallery',
  '/research', '/cases', '/designing', '/live-mode', '/faq', '/privacy',
  '/changelog', '/neo-mirai', '/sitemap.xml', '/robots.txt', '/favicon.svg',
  '/apple-touch-icon.png', '/og-image',
];

// API endpoints served by Cloudflare functions/rewrites on the official site.
const API_RE = /\/api\/(?:download|skills|version|commands|patterns|command-source|roll)\b/g;

function prefixLocal(url) {
  // whole-path match against known local prefixes
  const clean = url.split('#')[0].split('?')[0];
  const isLocal = LOCAL_PREFIXES.some((p) => clean === p.replace(/\/$/, '') || clean.startsWith(p));
  if (!isLocal) return null;
  if (clean.startsWith('/api/')) return null;
  return BASE + url;
}

function decodeCfemail(hex) {
  const key = parseInt(hex.slice(0, 2), 16);
  let out = '';
  for (let i = 2; i < hex.length; i += 2) {
    out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  }
  return out;
}

let files = 0;
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    const ext = path.extname(p).toLowerCase();
    if (!['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg', '.webmanifest'].includes(ext)) continue;
    let t = fs.readFileSync(p, 'utf8');
    const before = t;

    // 1. quoted root-relative URLs (html attrs, js strings, json)
    t = t.replace(/"(\/[^"*\n]+)"/g, (m, url) => {
      if (url.startsWith('//')) return m;               // protocol-relative
      const rewritten = prefixLocal(url);
      return rewritten ? `"${rewritten}"` : m;
    });
    // single-quoted JS strings
    t = t.replace(/'(\/[^'\n]+)'/g, (m, url) => {
      if (url.startsWith('//')) return m;
      const rewritten = prefixLocal(url);
      return rewritten ? `'${rewritten}'` : m;
    });
    // CSS url(...) and unquoted srcset candidates
    t = t.replace(/url\(\s*['"]?(\/[^'")]+)['"]?\s*\)/g, (m, url) => {
      const rewritten = prefixLocal(url);
      return rewritten ? `url(${rewritten})` : m;
    });

    // 2. API endpoints → official origin (functions don't exist on GH Pages)
    t = t.replace(API_RE, (m) => (p.endsWith('.html') || p.endsWith('.js'))
      ? `${OFFICIAL}${m}`
      : m);

    // 3. Cloudflare email protection → plaintext
    t = t.replace(/<a href="\/cdn-cgi\/l\/email-protection#([a-f0-9]+)"[^>]*>([\s\S]*?)<\/a>/g,
      (m, hex, inner) => `<a href="mailto:${decodeCfemail(hex)}">${inner}</a>`);
    t = t.replace(/data-cfemail="([a-f0-9]+)"/g, (m, hex) => `data-email="${decodeCfemail(hex)}"`);

    if (t !== before) { fs.writeFileSync(p, t); files++; }
  }
}

// 4. sitemap.xml / robots.txt → deployed URLs
function rewriteSitemap() {
  const sm = path.join(OUT, 'sitemap.xml');
  if (fs.existsSync(sm)) {
    const t = fs.readFileSync(sm, 'utf8')
      .replaceAll('https://impeccable.style', SITE_URL + BASE);
    fs.writeFileSync(sm, t);
    files++;
  }
  const rb = path.join(OUT, 'robots.txt');
  if (fs.existsSync(rb)) {
    const t = fs.readFileSync(rb, 'utf8')
      .replaceAll('https://impeccable.style', SITE_URL + BASE);
    fs.writeFileSync(rb, t);
    files++;
  }
}

walk(OUT);
rewriteSitemap();
console.log(`rewritten: ${files} files (base=${BASE})`);
