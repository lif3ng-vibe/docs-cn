#!/usr/bin/env node
'use strict';
// 静态伺服 site/，模拟生产子路径 /docs-cn/herdr/（site 内引用已带该前缀）
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2] || path.join(__dirname, '..', 'site');
const PORT = Number(process.argv[3] || 4176);
const BASE = '/docs-cn/herdr';
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p === BASE) { res.writeHead(302, { location: BASE + '/' }); res.end(); return; }
  if (p.startsWith(BASE + '/')) p = p.slice(BASE.length);
  else { res.writeHead(404); res.end('not under ' + BASE); return; }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log('serving ' + ROOT + ' at http://127.0.0.1:' + PORT + BASE + '/'));
