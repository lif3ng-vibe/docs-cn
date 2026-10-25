#!/usr/bin/env node
/**
 * Local preview server serving ./site/ under /docs-cn/impeccable-mirror/
 * (plus a redirect from /), mimicking the GitHub Pages deployment path.
 *
 *   node tools/serve.mjs [port]
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = '/docs-cn/impeccable-mirror';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const PORT = Number(process.argv[2] || 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain',
  '.xml': 'application/xml', '.webmanifest': 'application/manifest+json',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (urlPath === '/' || urlPath === BASE) {
    res.writeHead(302, { Location: BASE + '/' });
    return res.end();
  }
  if (!urlPath.startsWith(BASE + '/')) {
    // mimic GitHub Pages: unknown top-level paths 404
    res.writeHead(404); return res.end('not under ' + BASE);
  }
  let fp = path.join(ROOT, urlPath.slice(BASE.length));
  if (fp.endsWith(path.sep)) fp += 'index.html';
  if (!path.extname(fp) && fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
  if (!path.extname(fp)) fp += '.html'; // legacy flat pages
  if (!fs.existsSync(fp)) { res.writeHead(404); return res.end('404 ' + urlPath); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
  res.end(fs.readFileSync(fp));
}).listen(PORT, () => console.log(`preview: http://localhost:${PORT}${BASE}/`));
