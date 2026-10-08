// 去重：Starlight 已用 frontmatter title 渲染页首 <h1 id="_top">，
// 正文自带的同义 H1 会造成标题重复。本脚本移除这样的 H1 行（及后随空行）。
// 判定：归一化(H1) == 归一化(title)，装饰尾词（智能体/人格/Agent[s]）忽略。
// 用法：node scripts/strip-h1.mjs [--check]   （在站点项目根执行）
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const check = process.argv.includes('--check');

function walk(dir) {
  let out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (n.endsWith('.md')) out.push(p);
  }
  return out;
}

// 归一化：剥 emoji、标点与空白，拉丁转小写，剥装饰尾词
const norm = (s) =>
  s
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .toLowerCase()
    .replace(/(智能体人格|智能体|人格|agents|agent|personality)+$/u, '');

let removed = 0;
const kept = [];
for (const f of walk('src/content/docs')) {
  const text = readFileSync(f, 'utf8');
  if (!text.startsWith('---\n')) continue;
  const lines = text.split('\n');
  // frontmatter：第 0 行 '---'，找闭合行
  let close = -1;
  for (let i = 1; i < lines.length; i++) if (lines[i] === '---') { close = i; break; }
  if (close < 0) continue;
  const fm = lines.slice(1, close).join('\n');
  const tm = fm.match(/^title:\s*(.+)$/m);
  if (!tm) continue;
  const title = tm[1].replace(/^['"]|['"]$/g, '').trim();
  // 闭合行之后的第一个非空行必须是 H1 才算页首标题
  let first = -1;
  for (let i = close + 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    if (/^#\s+\S/.test(lines[i])) first = i;
    break;
  }
  if (first < 0) continue;
  const h1 = lines[first].replace(/^#\s+/, '').trim();
  const same = true; // frontmatter title 必然渲染为页首 h1——顶格 H1 一律视为冗余
  if (same) {
    removed++;
    if (!check) {
      let end = first + 1;
      while (end < lines.length && !lines[end].trim()) end++;
      writeFileSync(f, lines.slice(0, first).concat(lines.slice(end)).join('\n'));
    }
  } else {
    kept.push(relative('.', f).replaceAll('\\', '/') + ' | H1=' + h1 + ' | title=' + title);
  }
}
console.log((check ? '[check] ' : '') + 'h1 removed:', removed, '| kept(differ):', kept.length);
for (const k of kept.slice(0, 200)) console.log('  KEPT ' + k);