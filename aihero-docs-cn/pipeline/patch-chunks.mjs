#!/usr/bin/env node
// patch-chunks.mjs — 第三层回填：把客户端 bundle 里硬编码的英文 UI 串替换为中文
// 背景：导航/分享/复制等 chrome 由客户端组件渲染，字符串硬编码在 JS chunk 里，
//       hydration 后会用 bundle 内的英文重渲染，打回 HTML 层的中文译文。
// 方法：只做字符串字面量精确替换（"EN" → "中文"，单双引号两种形态），不做路径/代码改写。
// 输入：data/apply-report.json 的 pruned 并集（有译文但不在该页 flight 的串 = bundle 渲染串）
//       + data/translations 全量译文表
// 用法：node pipeline/patch-chunks.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const DATA = path.join(ROOT, 'data');

// 1. 组装目标串：unprune 白名单（= bundle 渲染串并集，由 apply 报告预生成）
const allowFile = path.join(DATA, 'unprune-allowlist.json');
const prunedUnion = new Set(JSON.parse(fs.readFileSync(allowFile, 'utf8')));

// 译文表（含 chrome）
const table = new Map();
(function walk(dir, prefix = '') {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) walk(path.join(dir, e.name), rel);
    else if (e.name.endsWith('.json')) {
      const t = JSON.parse(fs.readFileSync(path.join(dir, e.name), 'utf8'));
      for (const [k, v] of Object.entries(t)) if (!table.has(k)) table.set(k, v);
    }
  }
})(path.join(DATA, 'translations'));

const targets = [...prunedUnion].filter(en => {
  if (en.length < 2) return false;
  if (!table.has(en)) return false;
  if (table.get(en) === en) return false; // 译文与原文相同，跳过
  if (!/[A-Za-z]/.test(en)) return false;
  return true; // 含标点/空格的 UI 串都试（引号锚定的字面量精确匹配不会误伤长串）
});
console.log(`chunk patch targets: ${targets.length} (from pruned union ${prunedUnion.size})`);

// 2. 扫描 site/_next 下的 .js 文件做字面量替换
const files = [];
(function walk2(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk2(full);
    else if (e.name.endsWith('.js')) files.push(full);
  }
})(path.join(SITE, '_next'));
console.log(`js files: ${files.length}`);

const zeroHit = [];
let totalHits = 0;
const modified = [];
const BASELINE = path.join(DATA, 'site-en-baseline');
for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  let fileHits = 0;
  for (const en of targets) {
    const zh = table.get(en);
    for (const q of ['"', "'"]) {
      const needle = q + en + q;
      if (!src.includes(needle)) continue;
      // 中文值里若含与引号同形的字符需转义（全角引号与 ASCII 引号不同形，安全）
      const repl = q + zh + q;
      src = src.split(needle).join(repl);
      fileHits++;
    }
  }
  if (fileHits) {
    fs.writeFileSync(f, src);
    totalHits += fileHits;
    modified.push(f);
  }
}

// 语法安全网：改过的 chunk 逐个 node --check，失败从基线回滚该文件
import { execFileSync } from 'node:child_process';
let reverted = 0;
for (const f of modified) {
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
  } catch (e) {
    const rel = path.relative(SITE, f).replace(/\\/g, '/');
    fs.copyFileSync(path.join(BASELINE, rel), f);
    reverted++;
    console.error(`syntax check FAILED, reverted: ${rel}`);
  }
}
console.log(`syntax gate: ${modified.length - reverted}/${modified.length} files ok, ${reverted} reverted`);

// 3. 完成（零命中串 = flight 分段切分或其他形态，保持英文，不强求）
console.log(`chunk patch done: ${totalHits} literal replacements across ${files.length} files`);
