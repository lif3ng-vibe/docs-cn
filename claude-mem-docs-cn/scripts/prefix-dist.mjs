#!/usr/bin/env node
/**
 * prefix-dist.mjs —— 给 Mintlify 导出产物加 GitHub Pages 子路径前缀
 *
 * 背景：`mintlify export` 产物是根路径站（href="/introduction"、src="/_next/…"、
 * 水合数据里的 assetPrefix 均不带前缀），部署到 lif3ng-vibe.github.io/docs-cn/claude-mem/
 * 子路径会全部 404。本脚本对 dist 做：
 *   1) html：href/src/content/srcset 里的根绝对路径 → 加前缀（排除 //、http、#、mailto、data:）
 *   2) js/json：水合数据 assetPrefix 修补（"" → 前缀，Next 运行时用它拼 _next URL）
 *   3) 删除 zip 附带的 Start Docs.* / serve.js（air-gap 启动器，Pages 用不上）
 *
 * 用法：node scripts/prefix-dist.mjs [dist目录]   （默认 dist；DOCS_BASE 可覆盖前缀）
 */
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, process.argv[2] || 'dist');
const BASE = (process.env.DOCS_BASE || '/docs-cn/claude-mem').replace(/\/+$/, '');
if (!BASE || BASE === '/') {
  console.log('[prefix] 无前缀，跳过');
  process.exit(0);
}
const P = BASE;

let changed = 0;
const skip = (u) =>
  !u ||
  u.startsWith('#') ||
  u.startsWith('//') ||
  /^(https?:|mailto:|data:|tel:)/.test(u) ||
  u === P ||
  u.startsWith(P + '/');

function reAttr(html) {
  return html.replace(/((?:href|src|content)=")([^"]*)"/g, (full, head, u) => {
    if (skip(u) || !u.startsWith('/')) return full;
    changed++;
    return `${head}${P}${u}"`;
  });
}
function reSrcset(html) {
  return html.replace(/(srcset=")([^"]*)"/g, (full, head, val) => {
    let any = false;
    const out = val
      .split(', ')
      .map((it) => {
        const parts = it.split(' ');
        const u = parts[0];
        if (skip(u) || !u.startsWith('/')) return it;
        any = true;
        parts[0] = P + u;
        return parts.join(' ');
      })
      .join(', ');
    if (any) changed++;
    return any ? `${head}"${out}"` : full;
  });
}
function reJs(s) {
  let out = s;
  const variants = [
    ['\\"assetPrefix\\":\\"', '\\"assetPrefix\\":\\"' + P], // RSC 字符串内转引号形态
    ['"assetPrefix":""', '"assetPrefix":"' + P + '"'],
  ];
  for (const [from, to] of variants) {
    const n = out.split(from).length - 1;
    if (n) {
      out = out.split(from).join(to);
      changed += n;
    }
  }
  return out;
}

for (const f of ['Start Docs.bat', 'Start Docs.command', 'serve.js']) {
  try {
    unlinkSync(join(DIST, f));
  } catch {}
}

function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (!/\.(html|js)$/.test(e.name)) continue;
    else {
      const src = readFileSync(p, 'utf8');
      let out = src;
      if (e.name.endsWith('.html')) out = reSrcset(reAttr(src));
      out = reJs(out);
      if (out !== src) writeFileSync(p, out);
    }
  }
}
walk(DIST);
console.log(`[prefix] rewrote ${changed} refs → ${P}`);