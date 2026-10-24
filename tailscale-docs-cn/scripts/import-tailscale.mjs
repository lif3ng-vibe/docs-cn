#!/usr/bin/env node
// 导入 tailscale.com/docs 官方 .md 快照 → Starlight 内容树。
// 用法：node scripts/import-tailscale.mjs <rawDir> <llms.txt> <paths.all>
//   rawDir：闭包爬取产物，文件名 = 站点路径把 `/` 换成 `__`（如 __docs__features__magicdns.md）
//   llms.txt：官方精选索引（提供分组、页题、描述、组内顺序）
//   paths.all：闭包收敛后的全部站点路径（每行一个，如 /docs/features/magicdns）
//
// 行为：
//   1. llms.txt 条目 → 页面 frontmatter（title/description/sidebar.order）
//      索引外的发现页（extras）：title 取正文 H1，description 取首段
//   2. 链接改写（围栏代码块内一律不动）：
//      - [id]: /docs/x 引用式定义行、](/docs/x) 内联链接 → 保留 /docs 根绝对路径（hub CI sed 统一补 base）
//        目标不存在于 paths.all → 改写为 https://tailscale.com 原站绝对外链
//      - 其他根路径（/learn/... 等）→ https://tailscale.com 原站绝对外链
//      - 图片 ![alt](...) 不改写，仅统计上报
//   3. 剥正文首个 H1（Starlight 已用 frontmatter title 渲染页首 h1）
//   4. 生成 sidebar.generated.mjs（组序 = llms.txt 板块序；目录组 autogenerate + order 排序；
//      根级散页组显式 slug 清单）

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , rawDir, llmsPath, pathsPath] = process.argv;
if (!rawDir || !llmsPath || !pathsPath) {
  console.error('用法: node scripts/import-tailscale.mjs <rawDir> <llms.txt> <paths.all>');
  process.exit(2);
}
const root = dirname(fileURLToPath(import.meta.url)); // scripts/
const proj = dirname(root);
const outDir = join(proj, 'src', 'content', 'docs');

// ---------- llms.txt 解析 ----------
const llms = readFileSync(llmsPath, 'utf8');
const sections = []; // { title: string|null, items: [{title, path, desc}] }
let cur = { title: null, items: [] };
for (const line of llms.split('\n')) {
  const h = line.match(/^##\s+(.+?)\s*$/);
  if (h) {
    if (cur.items.length) sections.push(cur);
    cur = { title: h[1], items: [] };
    continue;
  }
  const e = line.match(/^-\s+\[([^\]]+)\]\(([^)\s]+)\):\s*(.*)$/);
  if (e) {
    const [, title, url, desc] = e;
    const path = url.replace(/^https:\/\/tailscale\.com/, '').replace(/\.md$/, '');
    cur.items.push({ title, path, desc: desc.trim() });
  }
}
if (cur.items.length) sections.push(cur);

const llmsPaths = new Map(); // path -> {title, desc, section, order}
for (const s of sections) {
  s.items.forEach((it, i) => {
    if (!llmsPaths.has(it.path)) llmsPaths.set(it.path, { ...it, section: s.title, order: i });
  });
}

// ---------- 路径清单（尾斜杠归一化：上游链接两种形态并存）----------
const pathsAll = new Set(
  readFileSync(pathsPath, 'utf8')
    .split('\n')
    .map((l) => l.trim().replace(/\/+$/, ''))
    .filter(Boolean)
);

// ---------- extras（llms.txt 之外、闭包发现的页面）----------
const extras = [...pathsAll].filter((p) => !llmsPaths.has(p));

// ---------- 原文读取 ----------
const key = (p) => p.replaceAll('/', '__');
const readRaw = (p) => {
  const f = join(rawDir, key(p) + '.md');
  return existsSync(f) ? readFileSync(f, 'utf8') : null;
};

// ---------- 链接改写 ----------
const stats = { defRewritten: 0, inlineRewritten: 0, extDocs: 0, extOther: 0, missing: new Set() };
const missingLog = [];
const imageRefs = new Set();

function rewriteTarget(t) {
  if (/^\/docs(\/|$|[?#])/.test(t)) {
    // 归一化：剥尾斜杠；?query/#fragment 保留
    const m = t.match(/^([^?#]*)([?#].*)?$/);
    const path = m[1].replace(/\/+$/, '') || '/docs';
    const tail = m[2] || '';
    if (pathsAll.has(path)) return { target: path + tail, kind: 'internal' };
    stats.missing.add(path);
    missingLog.push(path + tail);
    stats.extDocs++;
    return { target: 'https://tailscale.com' + t, kind: 'ext' };
  }
  if (t.startsWith('/')) {
    stats.extOther++;
    return { target: 'https://tailscale.com' + t, kind: 'ext' };
  }
  return { target: t, kind: 'other' };
}

const IMG_TOKEN = '\u0000IMG';
function processBody(body, report) {
  const lines = body.split('\n');
  let fence = false;
  let masked = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(?:>\s*)*(`{3,}|~{3,})/.test(lines[i])) {
      fence = !fence;
      continue;
    }
    if (fence) continue;
    // 图片先遮蔽（![alt](x)），避免与内联链接改写互相干扰
    let line = lines[i];
    line = line.replace(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g, (m, t) => {
      if (t.startsWith('/')) imageRefs.add(t);
      masked.push(m);
      return IMG_TOKEN + (masked.length - 1) + '\u0000';
    });
    // 引用式定义行：[id]: /target
    line = line.replace(/^(\[[^\]]+\]):\s*(\S+)\s*$/, (m, id, t) => {
      const r = rewriteTarget(t);
      if (r.kind === 'internal' && r.target !== t) stats.defRewritten++;
      else if (r.kind === 'ext') stats.defRewritten++;
      return `${id}: ${r.target}`;
    });
    // 内联链接：](target「title」)
    line = line.replace(/\]\(([^)\s]+)([^)]*)\)/g, (m, t, rest) => {
      const r = rewriteTarget(t);
      if (r.kind === 'internal' && r.target !== t) stats.inlineRewritten++;
      else if (r.kind === 'ext') stats.inlineRewritten++;
      return `](${r.target}${rest})`;
    });
    // 解除遮蔽
    line = line.replace(/\u0000IMG(\d+)\u0000/g, (m, n) => masked[Number(n)]);
    lines[i] = line;
  }
  return lines.join('\n');
}

// ---------- 正文清理 ----------
function cleanBody(body, report) {
  // 上游若自带 frontmatter（异常情况），上报并剥掉
  if (body.startsWith('---\n')) {
    const close = body.indexOf('\n---', 4);
    if (close > 0) {
      report.frontmatterUnexpected.push(body.slice(4, close).slice(0, 200));
      body = body.slice(close + 4).replace(/^\n+/, '');
    }
  }
  // 剥首个 H1 及其后空行（Starlight 用 frontmatter title 渲染页首 h1）
  const lines = body.split('\n');
  let start = 0;
  while (start < lines.length && !lines[start].trim()) start++;
  if (start < lines.length && /^#\s+\S/.test(lines[start])) {
    let end = start + 1;
    while (end < lines.length && !lines[end].trim()) end++;
    lines.splice(0, end);
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

// ---------- 生成页面 ----------
const yaml = (s) => JSON.stringify(s ?? '');
const writePage = (path, meta) => {
  const raw = readRaw(path);
  if (raw == null) {
    console.error('  [缺文件] ' + path);
    return false;
  }
  const report = { frontmatterUnexpected: [] };
  let body = processBody(raw, report);
  body = cleanBody(body, report);
  let fm = `---\ntitle: ${yaml(meta.title)}\ndescription: ${yaml(meta.desc)}\n`;
  if (meta.order !== undefined) fm += `sidebar:\n  order: ${meta.order}\n`;
  fm += `---\n\n`;
  const rest = path === '/docs' ? '' : path.slice('/docs/'.length);
  const dest = join(outDir, 'docs', rest ? rest + '.md' : 'index.md');
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, fm + body);
  return true;
};

let written = 0;
let failed = 0;
for (const s of sections) {
  for (const it of s.items) {
    if (writePage(it.path, { title: it.title, desc: it.desc, order: it.order })) written++;
    else failed++;
  }
}
// extras：title 取 H1，description 取首个长段落
const firstPara = (body) => {
  const paras = body.split('\n\n').map((p) => p.replace(/^#+\s.*$|^\s*>.*$|^\s*[-*|]\s.*$/gm, '').trim());
  const p = paras.find((x) => x.length > 60) || paras.find((x) => x.length > 0) || '';
  return p.replace(/\s+/g, ' ').slice(0, 200);
};
const rootExtras = [];
for (const p of extras) {
  if (p === '/docs') continue;
  const raw = readRaw(p) || '';
  const h1 = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() || p.slice('/docs/'.length);
  if (writePage(p, { title: h1, desc: firstPara(raw) })) written++;
  else failed++;
  if (/^\/docs\/[^/]+$/.test(p)) rootExtras.push(p);
}

// ---------- sidebar.generated.mjs ----------
const GROUP_LABELS = {
  'Install Tailscale': '安装 Tailscale',
  'Use cases': '使用场景',
  Solutions: '解决方案',
  Features: '功能特性',
  Aperture: 'Aperture',
  'Tailscale PAM': 'Tailscale PAM',
  'Tailscale Kubernetes Operator': 'Tailscale Kubernetes Operator',
  'How-to Guides': '操作指南',
  Hubs: '主题集（Hubs）',
  Integrations: '集成',
  'Manage your organization': '账户与组织管理',
  'Technical overviews': '技术概览',
  'Technical reference': '技术参考',
};
const slugOf = (p) => (p === '/docs' ? 'docs' : 'docs/' + p.slice('/docs/'.length));
const sb = [{ label: '总览', items: [{ slug: 'docs' }] }];
for (const s of sections) {
  if (s.title === null) continue; // llms.txt 顶部引导条目（无 ## 标题），已并入「总览」
  const label = GROUP_LABELS[s.title] || s.title;
  if (s.title === 'Hubs') {
    const slugs = s.items.map((it) => ({ slug: slugOf(it.path) }));
    const extraSlugs = rootExtras.sort().map((p) => ({ slug: slugOf(p) }));
    sb.push({ label, items: [...slugs, ...extraSlugs] });
  } else {
    const dir = s.items[0]?.path.startsWith('/docs/')
      ? 'docs/' + s.items[0].path.slice('/docs/').split('/')[0]
      : 'docs';
    sb.push({ label, items: [{ autogenerate: { directory: dir } }] });
  }
}
const sbSrc =
  '// 由 scripts/import-tailscale.mjs 生成——勿手改；组序 = llms.txt 板块序\n' +
  'export const sidebar = ' + JSON.stringify(sb, null, 2) + ';\n';
writeFileSync(join(proj, 'sidebar.generated.mjs'), sbSrc);

// ---------- 汇报 ----------
console.log(`pages written: ${written}  failed: ${failed}`);
console.log(`llms entries: ${llmsPaths.size}  extras: ${extras.length} (root-level: ${rootExtras.length})`);
console.log(`link rewrites: def=${stats.defRewritten} inline=${stats.inlineRewritten} (ext-docs=${stats.extDocs} ext-other=${stats.extOther})`);
console.log(`images referenced: ${imageRefs.size}`);
for (const img of [...imageRefs].slice(0, 30)) console.log('  IMG ' + img);
console.log(`missing /docs targets (→ 原站外链): ${stats.missing.size}`);
for (const m of missingLog.slice(0, 30)) console.log('  MISS ' + m);
