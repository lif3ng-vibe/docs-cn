#!/usr/bin/env node
/**
 * smoke-serve.mjs —— 本地按部署前缀提供 dist/，做镜像冒烟
 * 用法：node scripts/smoke-serve.mjs [端口]，然后另开 shell:
 *   curl -s -o /dev/null -w '%{http_code}' http://localhost:PORT/docs-cn/claude-mem/
 */
import { createServer } from 'node:http';
import { statSync, readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const BASE = (process.env.DOCS_BASE || '/docs-cn/claude-mem').replace(/\/+$/, '');
const PORT = Number(process.argv[2]) || 4639;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png' };

createServer((req, res) => {
  let u = decodeURI((req.url || '').split('?')[0]);
  if (!u.startsWith(BASE)) {
    res.writeHead(404).end('outside base');
    return;
  }
  let p = u.slice(BASE.length) || '/';
  if (p.endsWith('/')) p += 'index.html';
  const file = join(DIST, p);
  try {
    if (existsSync(file) && statSync(file).isFile()) {
      res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
      res.end(readFileSync(file));
      return;
    }
    res.writeHead(404).end('no file: ' + p);
  } catch (e) {
    res.writeHead(500).end(e.message);
  }
}).listen(PORT, () => console.log(`smoke server :${PORT}${BASE}`));