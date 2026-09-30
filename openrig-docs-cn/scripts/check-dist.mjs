#!/usr/bin/env node
// dist 终检：字面 ** 扫描（剥 script/style/code/pre）+ 跨页锚点核对（href 解码后逐页查 id）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(here, '..', 'dist');
const envBase = (process.env.DOCS_BASE || '/').replace(/[/]+$/, '');

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      for (const child of walk(p)) out.push(child);
    } else if (e.name.endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

const pages = walk(DIST);

const star = [];
for (const f of pages) {
  let html = fs.readFileSync(f, 'utf8');
  html = html.replace(/<script[\s\S]*?<\/script>/g, ' ');
  html = html.replace(/<style[\s\S]*?<\/style>/g, ' ');
  html = html.replace(/ data-code="[^"]*"/g, ' data-code=""');
  html = html.replace(/<(code|pre)[^>]*>[\s\S]*?<\/\1>/g, ' ');
  html = html.replace(/<(code|pre)[^>]*>[\s\S]*?<\/\1>/g, ' ');
  html = html.replace(/<[^>]+>/g, ' ');
  let at = html.indexOf("**");
  while (at !== -1) {
    const prev = html[at - 1];
    if (prev !== "/") {
      star.push(f);
      break;
    }
    at = html.indexOf("**", at + 1);
  }
}
console.log('字面 ** 页面数:', star.length, JSON.stringify(star));

const idsByDir = new Map();
for (const f of pages) {
  const rel = path.relative(DIST, f).split(path.sep).join('/');
  const dir = path.posix.dirname(rel);
  if (!idsByDir.has(dir)) idsByDir.set(dir, new Set());
  const page = fs.readFileSync(f, 'utf8');
  for (const m of page.match(/id="[^"]+"/g) || []) {
    idsByDir.get(dir).add(m.slice(4, -1));
  }
}

let seen = 0;
let bad = 0;
for (const f of pages) {
  const rel = path.relative(DIST, f).split(path.sep).join('/');
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.match(/href="[^"]*#[^"]+"/g) || []) {
    const inner = m.slice(6, -1);
    const hashAt = inner.indexOf('#');
    if (hashAt === -1) continue;
    const linkPath = inner.slice(0, hashAt);
    const rawFrag = inner.slice(hashAt + 1);
    if (!/^(\/|\.\.?\/)/.test(linkPath)) continue;
    let lp = linkPath;
    if (envBase !== '' && envBase !== '/' && lp.startsWith(envBase)) lp = lp.slice(envBase.length);
    seen++;
    let frag = rawFrag;
    try {
      frag = decodeURIComponent(rawFrag);
    } catch (err) {
      frag = rawFrag;
    }
    const joined = lp.startsWith('/') ? lp.slice(1) : path.posix.join(path.posix.dirname(rel), lp);
    const target = path.posix.normalize(joined).replace(/[/]+$/, '');
    const cut = target.lastIndexOf('.md');
    const stem = cut === -1 ? target : target.slice(0, cut);
    const dir0 = path.posix.dirname(stem);
    const stem2 = stem.slice(stem.lastIndexOf('/') + 1);
    const variants = [stem2, stem2.toLowerCase(), stem2.replace(/\./g, ''), stem2.replace(/[.\s]/g, '-')];
    const okDirs = [];
    for (const one of variants) {
      okDirs.push((dir0 === '.' ? '' : dir0 + '/') + one);
    }
    let ok = false;
    for (const d of okDirs) {
      const ids = idsByDir.get(d);
      if (ids && ids.has(frag)) {
        ok = true;
        break;
      }
    }
    if (!ok) {
      console.log("DBG", JSON.stringify(okDirs), "frag:", JSON.stringify(frag), "dirHas:", idsByDir.get(okDirs[0]));
      bad++;
      console.log('MISS', rel, '->', linkPath + '#' + frag);
    }
  }
}
console.log('跨页锚点 ' + seen + '，失配 ' + bad);
process.exit(star.length || bad ? 1 : 0);
