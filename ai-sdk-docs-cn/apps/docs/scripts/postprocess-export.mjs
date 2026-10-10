#!/usr/bin/env node
/**
 * 静态导出后处理（GitHub Pages 镜像专用）：
 *  1. 折叠 root param 目录：output: 'export' 会把 root param 值（cn）物化为
 *     out/cn/ 一层，而站内 URL 不含该段——把 out/cn/* 上移合并到 out/。
 *  2. 补板块根的跳转桩页：原站 /docs、/providers、/cookbook 是服务端重定向，
 *     静态托管没有 index.html 会 404，生成 meta-refresh 桩页。
 *  3. public 资产引用兜底前缀：html 与 RSC payload（.txt）里根绝对路径的
 *     "/images/..."（plain <img>/<video>/<track>、flight 字符串、模板字面量
 *     残留）统一补 basePath——Next 只给 next/image、next/link 自动加前缀。
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(appDir, 'out');
const cnDir = join(outDir, 'cn');
const BASE = '/docs-cn/ai-sdk';

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

// public 资产引用兜底前缀：仅匹配引号紧跟 /images/ 的形态（已带前缀的
// "/docs-cn/ai-sdk/images/" 不含该模式，天然幂等）。
const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(html|txt)$/.test(e.name)) out.push(p);
  }
  return out;
};

const RAW = `"/images/`;
const FIXED = `"${BASE}/images/`;
let files = 0;
let hits = 0;
for (const file of walk(outDir)) {
  let s;
  try {
    s = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (!s.includes(RAW)) continue;
  const count = s.split(RAW).length - 1;
  writeFileSync(file, s.split(RAW).join(FIXED));
  files++;
  hits += count;
}
log(`prefixed /images refs: ${hits} in ${files} files`);

log('done');
