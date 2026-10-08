#!/usr/bin/env node
/**
 * 静态导出后处理（GitHub Pages 镜像专用）：
 *  1. 折叠 root param 目录：output: 'export' 会把 root param 值（cn）物化为
 *     out/cn/ 一层，而站内 URL 不含该段——把 out/cn/* 上移合并到 out/。
 *  2. 补板块根的跳转桩页：原站 /docs、/providers、/cookbook 是服务端重定向，
 *     静态托管没有 index.html 会 404，生成 meta-refresh 桩页。
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(appDir, 'out');
const cnDir = join(outDir, 'cn');

const log = (msg) => console.log(`[postprocess] ${msg}`);

if (existsSync(cnDir)) {
  cpSync(cnDir, outDir, { recursive: true });
  rmSync(cnDir, { recursive: true, force: true });
  log('flattened out/cn -> out');
} else {
  log('no out/cn (already flattened)');
}

const redirects = [
  ['docs', './introduction/'],
  ['providers', './ai-sdk-providers/'],
  ['cookbook', '../resources/recipes/'],
];

for (const [from, to] of redirects) {
  const dir = join(outDir, from);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'index.html'),
    `<!doctype html><meta charset="utf-8"><title>Redirecting…</title>` +
      `<meta http-equiv="refresh" content="0; url=${to}">` +
      `<link rel="canonical" href="${to}">` +
      `<p>Redirecting to <a href="${to}">${to}</a></p>`,
  );
  log(`redirect stub: /${from}/ -> ${to}`);
}

log('done');