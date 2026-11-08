#!/usr/bin/env node
/**
 * 静态导出后处理（GitHub Pages 镜像专用）：
 *  1. 折叠 root param 目录：output:'export' 会把 root param 值（cn）物化成
 *     out/cn/ 一层，而站内 URL 不含该段——把 out/cn/* 上移合并到 out/。
 *  3. 站点根的跳转桩页：/docs-cn/agent-desktop/ 根层无 index.html，生成
 *     meta-refresh 桩页跳 ./desktop/。
 *  4. plain 资产引用兜底前缀：plain <img>/<iframe>/flight 字符串里根绝对路径的
 *     "/desktop/...（Next 只自动给 next/image、next/link 加 basePath），
 *     统一补 basePath。已带前缀的（"/docs-cn/agent-desktop/）不含该模式，天然幂等。
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(appDir, 'apps/docs/out');
const cnDir = join(outDir, 'cn');
const BASE = '/docs-cn/agent-desktop';

const log = (msg) => console.log(`[postprocess] ${msg}`);

if (existsSync(cnDir)) {
  cpSync(cnDir, outDir, { recursive: true, force: true });
  rmSync(cnDir, { recursive: true, force: true });
  log('flattened out/cn -> out');
} else {
  log('no out/cn (already flattened)');
}

// 站点根跳转桩：/docs-cn/agent-desktop/ -> ./desktop/
writeFileSync(
  join(outDir, 'index.html'),
  `<!doctype html><meta charset="utf-8"><title>Redirecting…</title><meta http-equiv="refresh" content="0; url=./desktop/"><p>Redirecting to <a href="./desktop/">./desktop/</a></p>`
);
log('root stub index.html -> ./desktop/');

// plain 资产兜底：html/txt 里引号紧跟 /desktop/ 的根绝对路径补前缀
const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(html|txt)$/.test(e.name)) out.push(p);
  }
  return out;
};

let hit = 0;
for (const p of walk(outDir)) {
  const s = readFileSync(p, 'utf8');
  const t = s.split('"/desktop/').join(`"${BASE}/desktop/`);
  if (t !== s) {
    writeFileSync(p, t);
    hit++;
  }
}
log(`asset rewrite: ${hit} files`);

// 搜索索引（静态导出文件，无扩展名，不在上面的 walk 内）：结果 URL/内容里的
// /desktop/ 根绝对路径统一补 basePath（幂等）。
const searchIdx = join(outDir, 'desktop/api/search');
if (existsSync(searchIdx)) {
  const s = readFileSync(searchIdx, 'utf8');
  const t = s.split('"/desktop/').join(`"${BASE}/desktop/`);
  if (t !== s) {
    writeFileSync(searchIdx, t);
    log('search index URLs prefixed');
  }
}
