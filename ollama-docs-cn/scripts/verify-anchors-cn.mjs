#!/usr/bin/env node
/**
 * verify-anchors-cn.mjs —— 对 Mintlify 导出产物 dist/ 做全站锚点核对
 *
 * 两遍扫描：第一遍收集全部页面的真实 heading id（排除框架哈希 id `_R_*`），
 * 第二遍核对每页的 href="#x"（页内）与 href="/path#x" / 相对 path#x（跨页）。
 * 报告所有无法命中的链接目标（只读，不修改；回修在源 mdx 里做后重导出复验）。
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = process.argv[2] || 'dist';
// 产物经 prefix-dist 重写后，内链带部署前缀；核对时先剥掉
const STRIP = (process.env.DOCS_BASE || '/docs-cn/claude-mem').replace(/\/+$/, '');

const decode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

const rawHTML = new Map(); // rel -> html
const ids = new Map(); // rel -> Set<id>

function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') {
      const rel = relative(DIST, dir).replace(/\\/g, '/'); // '' for root, or 'usage/getting-started'
      const html = readFileSync(p, 'utf8');
      rawHTML.set(rel, html);
      const set = new Set();
      for (const m of html.matchAll(/id="([^"]+)"/g)) set.add(m[1]);
      ids.set(rel, set);
    }
  }
}
walk(DIST);

const broken = [];
for (const [rel, html] of rawHTML) {
  const set = ids.get(rel);
  for (const m of html.matchAll(/href="([^"]*)"/g)) {
    let href = m[1].slice(0, 400);
    if (/^(https?:|\/|mailto:)/.test(href) === false) {
      // 相对链接先不处理（除非带 #）
      if (!href.includes('#')) continue;
    }
    href = decode(href);
    if (STRIP !== '/' && href.startsWith(STRIP)) href = href.slice(STRIP.length) || '/';
    if (href.startsWith('#')) {
      const t = href.slice(1);
      if (t && !set.has(t)) broken.push(`${rel || '(root)'}  页内#${t}`);
    } else if (!/(^https?:|^\/\/|^mailto:)/.test(href)) {
      const hashIdx = href.indexOf('#');
      if (hashIdx >= 0) {
        let page = href.slice(0, hashIdx).replace(/\/$/, '');
        const anchor = href.slice(hashIdx + 1);
        if (!page.startsWith('/')) {
          const base = rel ? rel.split('/').slice(0, -1) : [];
          for (const s of page.split('/').filter((x) => x && x !== '.')) {
            if (s === '..') base.pop();
            else base.push(s);
          }
          page = (base.join('/') || '.'); // 相对当前页目录
          if (/\.(md|mdx)$/.test(page)) page = page.replace(/\.(md|mdx)$/, '');
          page = page === '.' ? '' : page;
        }
        if (anchor && !page.startsWith('..')) {
          const targetIds = ids.get(page.replace(/^\//, ''));
          if (!targetIds) broken.push(`${rel || '(root)'}  跨页 ${page}#${anchor}（目标页不存在）`);
          else if (!targetIds.has(anchor)) broken.push(`${rel || '(root)'}  跨页 ${page}#${anchor}`);
        } else if (anchor) {
          broken.push(`${rel || '(root)'}  跨页 ${page}#${anchor}（目录解析越界）`);
        }
      }
    }
  }
}

let pageTotal = 0;
for (const set of ids.values()) {
  pageTotal += [...set].filter((id) => !id.startsWith('_R_') && id !== 'page-title' && id !== 'navbar').length;
}
console.log(`页面：${ids.size}，真实内容 heading id 总数：${pageTotal}`);
if (broken.length) {
  console.log(`未命中锚点 ${broken.length} 处：`);
  console.log(broken.join('\n'));
  process.exit(1);
} else {
  console.log('CLEAN：全部锚点链接命中');
}