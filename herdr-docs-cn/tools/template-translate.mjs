#!/usr/bin/env node
// template-translate.mjs — 画廊/mod/layout 详情页模板 UI + 全站导航页脚 批量汉化
// 纯文本节点级替换（含 > < 边界与 JS 字面量），动态部分（标题/描述/作者/日期）按用户决策保留英文。
// 用法：node tools/template-translate.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');

// ---------- 全站通用（导航/页脚/通用按钮） ----------
const COMMON = [
  ['>Mobile<', '>移动端<'],
  ['>Gallery<', '>画廊<'],
  ['>Guide<', '>指南<'],
  ['>Blog<', '>博客<'],
  ['>Download<', '>下载<'],
  ['>Copy<', '>复制<'],
  ['>Product<', '>产品<'],
  ['>Learn<', '>学习<'],
  ['>Community<', '>社区<'],
  ['>Privacy<', '>隐私<'],
  ['>View on GitHub →<', '>在 GitHub 查看 →<'],
  ['Made for your agents. Remade by them.', '为你的智能体而生，由它们重塑。'],
  ['Open source, Apache 2.0', '开源，Apache 2.0'],
  ["'Copied'", "'已复制'"],
  ["'Copy'", "'复制'"],
];

// ---------- mods 详情页专属 ----------
const MODS = [
  ['>← Mods<', '>← mods<'],
  [' · Herdr mods</title>', ' · Herdr mod 画廊</title>'],
  ['>Tell your agent<', '>告诉你的智能体<'],
  ['Read ~/.config/herdr-app/AGENTS.md, then add this mod: ', '先读 ~/.config/herdr-app/AGENTS.md，再让智能体添加这个 mod：'],
  ["Read this mod's <a", '这个 mod 的配方，<a'],
  ['>recipe on GitHub →<', '>在 GitHub 上查看 →<'],
  ['>Files<', '>文件<'],
  ['Your agent reads every file before it adds this mod. It adds a piece to your current layout, not a new window. Check what it runs and which keys it changes before adding it.',
   '你的智能体在添加此 mod 前会先读其中每个文件。它会把这块加进你当前的布局，而不是新开一个窗口。添加前请检查它会运行什么、会改动哪些按键。'],
  ["Mods aren't reviewed by Herdr.", 'mods 未经 Herdr 审核。'],
  ['>Report this mod<', '>举报此 mod<'],
];

// ---------- layouts 详情页专属 ----------
const LAYOUTS = [
  ['>← Layouts<', '>← 布局<'],
  [' · Herdr layouts</title>', ' · Herdr 布局画廊</title>'],
  ['>Tell your agent<', '>告诉你的智能体<'],
  ['Read ~/.config/herdr-app/AGENTS.md, then add this layout: ', '先读 ~/.config/herdr-app/AGENTS.md，再让智能体添加这个布局：'],
  ["Read this layout's <a", '这个布局的配方，<a'],
  ['>recipe on GitHub →<', '>在 GitHub 上查看 →<'],
  ['>Files<', '>文件<'],
  // 长段中 ctrl-shift-l 被 <span> 包裹，按标签边界拆三条
  ['Your agent reads every file before it adds this layout. Your own layout stays as it is; switch between them with <span class="mono',
   '你的智能体在添加此布局前会先读其中每个文件。你现有的布局保持不变，可用 <span class="mono'],
  ['ctrl-shift-l</span>.', 'ctrl-shift-l</span> 在布局间切换。'],
  ["Layouts aren't reviewed by Herdr. <a", '布局未经 Herdr 审核。<a'],
  ['>Report this layout<', '>举报此布局<'],
];

const UPD_RE = />Updated (?=[A-Z][a-z]{2} \d)/g; // >Updated Nov 5< → >更新于 Nov 5<

const hits = {};
function bump(k, n) { hits[k] = (hits[k] || 0) + n; }

function apply(list, html) {
  let out = html;
  for (const [find, rep] of list) {
    const parts = out.split(find);
    const n = parts.length - 1;
    if (n) { bump(find.slice(0, 40), n); out = parts.join(rep); }
  }
  return out;
}

function walk(dir, fn) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, fn);
    else if (e.name.endsWith('.html')) fn(p);
  }
}

let files = 0;
walk(SITE, (p) => {
  const rel = path.relative(SITE, p).replace(/\\/g, '/');
  if (rel.startsWith('og/')) return; // og 卡片页不翻
  let html = fs.readFileSync(p, 'utf8');
  const before = html;
  html = apply(COMMON, html);
  html = html.replace(UPD_RE, '>更新于 ');
  if (rel.startsWith('mods/')) html = apply(MODS, html);
  if (rel.startsWith('layouts/')) html = apply(LAYOUTS, html);
  if (html !== before) { fs.writeFileSync(p, html); files++; }
});
console.log('files changed:', files);
console.log(JSON.stringify(hits, null, 1));
