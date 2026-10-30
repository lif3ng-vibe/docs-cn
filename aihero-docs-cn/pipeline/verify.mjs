#!/usr/bin/env node
// verify.mjs — 镜像终检：内链完整性、flight 可解析、英文残留、CJK 覆盖
// 用法：node pipeline/verify.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const P = '/docs-cn/aihero';
const UPSTREAM = 'https://www.aihero.dev';

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name === 'index.html') {
      const rel = path.relative(SITE, full).replace(/\\/g, '/');
      pages.push(rel === 'index.html' ? '' : rel.replace(/\/index\.html$/, ''));
    }
  }
})(SITE);

const problems = { brokenLinks: {}, flightParse: {}, noCjk: [], enResidue: {}, leftoverUpstream: {} };
const FLIGHT_RX = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
const STOPWORDS = /\b(the|and|with|your|from|that|what|when|how|why|this|these|those|using|build|learn)\b/;

function stripProtected(html) {
  return html
    .replace(/<(script|style|code|pre|textarea|svg|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

for (const page of pages) {
  const rel = page === '' ? 'index.html' : `${page}/index.html`;
  const html = fs.readFileSync(path.join(SITE, rel), 'utf8');

  // 1. 内链完整性：本地 href/src 指向的文件必须存在于 site/
  const refs = new Set();
  for (const m of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) refs.add(m[1].split('#')[0]);
  const broken = [];
  for (const ref of refs) {
    if (ref.startsWith(`${P}/`)) {
      const fsPath = path.join(SITE, ref.slice(P.length).split('?')[0]);
      const target = fs.existsSync(fsPath) || fs.existsSync(path.join(fsPath, 'index.html'));
      if (!target) broken.push(ref);
    } else if (ref.startsWith('//') || ref.startsWith('http')) continue;
    // 指回原站的路径（登录/报名）不算断链
  }
  if (broken.length) problems.brokenLinks[page || '(home)'] = broken.slice(0, 30);

  // 2. flight 可解析
  let bad = 0;
  for (const m of html.matchAll(FLIGHT_RX)) {
    try { JSON.parse('"' + m[1] + '"'); } catch { bad++; }
  }
  if (bad) problems.flightParse[page || '(home)'] = bad;

  // 3. CJK 覆盖（内容页应有中文）
  const text = stripProtected(html);
  const cjk = (text.match(/[一-龥]/g) || []).length;
  if (cjk === 0 && page && !/^(sandcastle|api|privacy)/.test(page)) problems.noCjk.push(page);

  // 4. 英文残留（可见文本中含高频停用词的长英文串）
  const residue = [];
  for (const line of text.split(/<|>/).map(s => s.trim()).filter(s => s.length > 40)) {
    if (STOPWORDS.test(line)) residue.push(line.slice(0, 160));
  }
  if (residue.length) problems.enResidue[page || '(home)'] = residue.slice(0, 15);

  // 5. 上游 URL 残留（不应再出现指向原站的资源引用）
  const upstreamRefs = (html.match(/https:\/\/www\.aihero\.dev\/[^"'\\<\s)]*/g) || [])
    .filter(u => !/\.(png|jpg|svg|webp|ico)$/.test(u));
  if (upstreamRefs.length) problems.leftoverUpstream[page || '(home)'] = [...new Set(upstreamRefs)].slice(0, 10);
}

// 汇总
let fail = false;
const counts = {
  pages: pages.length,
  brokenLinkPages: Object.keys(problems.brokenLinks).length,
  flightParsePages: Object.keys(problems.flightParse).length,
  noCjkPages: problems.noCjk.length,
  residuePages: Object.keys(problems.enResidue).length,
  upstreamRefPages: Object.keys(problems.leftoverUpstream).length,
};
console.log(JSON.stringify(counts, null, 2));
if (counts.flightParsePages > 0) fail = true;
fs.writeFileSync(path.join(ROOT, 'data', 'verify-report.json'), JSON.stringify(problems, null, 1));
console.log(fail ? 'VERIFY FAIL (flight parse errors)' : 'verify done — 见 data/verify-report.json');
process.exit(fail ? 1 : 0);
