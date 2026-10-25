#!/usr/bin/env node
// 终检粗体修复（窄规则，只处理 dist 扫描实锤的三种形态；围栏内不动）：
// R1 冒号型：**标签：**文字 → **标签**：文字
// R2 句读型：**……。！？**文字 → **……**。！？文字
// R3 括注型：**词（gloss）**文字 → **词**（gloss）文字（整组括注移出）
// 不会碰 **A**、**B**（顿号夹双粗体）与行尾 **：**（本就合法）。
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

function walk(dir) {
  let out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (n.endsWith('.md')) out.push(p);
  }
  return out;
}
const R1 = /\*\*([^*\n]+)([：:])(\*\*)(?=[^\s—-])/g;
const R2 = /\*\*([^*\n]+)([。！？])(\*\*)(?=\S)/g;
const R3 = /\*\*([^*\n（(]*)([（(][^*\n]*[)）])(\*\*)(?=\S)/g;

let files = 0;
let total = 0;
for (const f of walk('src/content/docs/docs')) {
  const text = readFileSync(f, 'utf8');
  let fence = false;
  let n = 0;
  const out = text
    .split('\n')
    .map((line) => {
      if (/^\s*(`{3,}|~{3,})/.test(line)) {
        fence = !fence;
        return line;
      }
      if (fence) return line;
      let s = line.replace(R1, '**$1$3$2').replace(R2, '**$1$3$2').replace(R3, '**$1$3$2');
      if (s !== line) n++;
      return s;
    })
    .join('\n');
  if (n) {
    writeFileSync(f, out);
    files++;
    total += n;
    console.log(relative('.', f).replaceAll('\\', '/') + '  ' + n + ' 行');
  }
}
console.log(`files: ${files}  lines: ${total}`);
