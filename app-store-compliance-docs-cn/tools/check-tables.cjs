#!/usr/bin/env node
/**
 * check-tables.cjs — 表格行英文残留启发式检查（residue-check.cjs 的补充）
 * 背景：residue-check.cjs 整行跳过以 | 开头的表格行，而本站 REGULATORY-TIMELINE.md
 *      等文件几乎全是表格。本工具对表格单元格做启发式判断。
 * 规则：剥围栏代码块后，逐个表格单元格检查；命中以下全部条件判为疑似残留：
 *      - 长度 ≥ 30 且 ASCII 字母占比 > 60%
 *      - 含 ≥ 5 个英文单词（≥2 字母）
 *      - 不含 CJK
 * 白名单（不算残留）：纯代码/token/URL/路径/编号/日期单元格会因词数或字符占比自然排除；
 *      法条名（Regulation (EU) …、16 CFR …）与 entitlement 字符串按上游原文保留，
 *      若误报请对照源文件人工判断后在行尾加 <!-- keep --> 标记，本工具跳过带标记的行。
 * 用法：node tools/check-tables.cjs <file-or-dir>…
 * 输出：文件:行:单元格；全干净打印 CLEAN 退出 0，否则退出 1。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const targets = process.argv.slice(2);
const files = [];
function add(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) for (const e of fs.readdirSync(p)) add(path.join(p, e));
  else if (p.endsWith('.md')) files.push(p);
}
targets.forEach(add);

let problems = 0;
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (line.includes('<!-- keep -->')) continue;
    if (!line.trim().startsWith('|')) continue;
    for (const cell of line.split('|')) {
      const c = cell.trim();
      if (c.length < 30) continue;
      if (/[一-龥]/.test(c)) continue;
      const letters = (c.match(/[A-Za-z]/g) || []).length;
      if (letters / c.length <= 0.6) continue;
      const words = c.match(/[A-Za-z]{2,}/g) || [];
      if (words.length < 5) continue;
      console.log(`${path.basename(f)}:${i + 1}: ${c.slice(0, 90)}`);
      problems++;
    }
  }
}
console.log(problems === 0 ? 'CLEAN' : `PROBLEMS: ${problems}`);
process.exit(problems === 0 ? 0 : 1);
