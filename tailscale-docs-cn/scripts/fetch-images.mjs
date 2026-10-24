#!/usr/bin/env node
// 相对路径图片处理：三候选地址并行试下（页面目录 / docs 根 / files/images）。
// 下载成功 → 落盘到 md 同目录（保留引用，Astro 构建时打包）；
// 失败 → 就地改写为图注占位（*（图：alt）*），引用式定义行一并移除。
// 用法：node scripts/fetch-images.mjs
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { join, relative, dirname, posix } from 'node:path';

const root = join('src', 'content', 'docs', 'docs');
const TIMEOUT = 15000;
const CONCURRENCY = 8;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function walk(dir) {
  let out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (n.endsWith('.md')) out.push(p);
  }
  return out;
}
const isRel = (t) => t && !/^https?:/.test(t) && !/^[/#]/.test(t);

async function tryFetch(urls) {
  for (const u of urls) {
    try {
      const res = await fetch(u, {
        signal: AbortSignal.timeout(TIMEOUT),
        headers: { 'user-agent': 'Mozilla/5.0 docs-mirror-sync' },
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 100) return buf;
      }
    } catch {
      /* 下一个候选 */
    }
  }
  return null;
}

// ---------- 收集 ----------
const jobs = [];

for (const f of walk(root)) {
  const text = readFileSync(f, 'utf8');
  let fence = false;
  const lines = text.split('\n');
  const keep = lines.map((l) => {
    if (/^\s*(`{3,}|~{3,})/.test(l)) {
      fence = !fence;
      return false;
    }
    return !fence;
  });
  const noFence = lines.filter((_, i) => keep[i]).join('\n');

  const relFile = relative(root, f).replaceAll('\\', '/');
  const routeDir = relFile.endsWith('/index.md')
    ? posix.dirname(posix.dirname(relFile))
    : posix.dirname(relFile);
  const pageDir = routeDir === '.' ? '' : routeDir + '/';

  const defs = new Map();
  for (const m of noFence.matchAll(/^\[([^\]]+)\]:\s*(\S+)\s*$/gm)) defs.set(m[1], m[2]);

  const seen = new Set();
  const add = (clean, alt, id) => {
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    const dest = join(dirname(f), ...clean.split('/'));
    const rootUrl = 'https://tailscale.com/docs/' + clean;
    const pageUrl = 'https://tailscale.com/docs/' + pageDir + clean;
    const filesUrl = 'https://tailscale.com/files/images/' + clean;
    const first = clean.startsWith(routeDir + '/') ? rootUrl : pageUrl;
    const urls = [first, first === rootUrl ? pageUrl : rootUrl, filesUrl];
    jobs.push({ file: f, clean, alt: alt || '', id, dest, urls });
  };
  for (const m of noFence.matchAll(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g)) {
    if (isRel(m[2])) add(m[2].split(/[?#]/)[0], m[1]);
  }
  for (const m of noFence.matchAll(/!\[([^\]]*)\]\[([^\]]*)\]/g)) {
    const t = defs.get(m[2] || '');
    if (t && isRel(t)) add(t.split(/[?#]/)[0], m[1], m[2] || '');
  }
}

console.log(`image jobs: ${jobs.length}`);

// ---------- 并发下载 ----------
const ok = new Map(); // file|clean -> Buffer
const failed = [];
let idx = 0;
async function worker() {
  while (idx < jobs.length) {
    const j = jobs[idx++];
    const buf = await tryFetch(j.urls);
    if (buf) ok.set(j.file + '|' + j.clean, buf);
    else failed.push(j);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

for (const j of jobs) {
  const buf = ok.get(j.file + '|' + j.clean);
  if (buf) {
    mkdirSync(dirname(j.dest), { recursive: true });
    writeFileSync(j.dest, buf);
  }
}

// ---------- 失败项就地改写 ----------
let touched = 0;
for (const j of failed) {
  let text = readFileSync(j.file, 'utf8');
  const placeholder = j.alt ? `*（图：${j.alt}）*` : '';
  if (j.id !== undefined) {
    text = text.replace(new RegExp(`!\\[[^\\]]*\\]\\[${esc(j.id)}\\]`, 'g'), placeholder);
    text = text.replace(new RegExp(`^\\[${esc(j.id)}\\]:\\s*\\S+\\s*$`, 'gm'), '');
  } else {
    text = text.replace(new RegExp(`!\\[([^\\]]*)\\]\\([^)\\s]*${esc(j.clean)}[^)\\s]*[^)]*\\)`, 'g'), placeholder);
  }
  writeFileSync(j.file, text);
  touched++;
}

console.log(`downloaded: ${ok.size}  failed/placeholder: ${failed.length} (rewritten in ${touched} files)`);
for (const j of failed.slice(0, 40)) console.log('  IMG-FAIL ' + relative('.', j.file) + ' | ' + j.clean);
