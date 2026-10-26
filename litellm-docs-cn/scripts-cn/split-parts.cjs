// 确定性分段：围栏感知，在标题边界切分，保证 concat(parts) === 原文。
// 用法：node scripts-cn/split-parts.cjs <file> <outdir> [maxLines=900]
// 产出 <outdir>/1.md..N.md + manifest.json（段数）。
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
const outdir = process.argv[3];
const maxLines = Number(process.argv[4] || 900);
const lines = fs.readFileSync(file, 'utf8').split('\n');

// 找所有「围栏外」的标题行号（0-based）
const headingLines = [];
let inFence = false;
lines.forEach((l, i) => {
  if (/^\s*(```|~~~)/.test(l)) inFence = !inFence;
  if (!inFence && /^#{1,6} /.test(l)) headingLines.push(i);
});

// 分段：每段 ≤maxLines，向后延伸到下一个标题行（不含）为止
const parts = [];
let start = 0;
while (start < lines.length) {
  let end = Math.min(start + maxLines, lines.length); // exclusive
  if (end < lines.length) {
    // end 向后推到下一个标题行（含该行归下一段，所以 end=标题行号）
    const next = headingLines.find((h) => h >= end);
    end = next === undefined ? lines.length : next;
  }
  parts.push([start, end]);
  start = end;
}

fs.mkdirSync(outdir, {recursive: true});
parts.forEach(([a, b], idx) => {
  fs.writeFileSync(path.join(outdir, (idx + 1) + '.md'), lines.slice(a, b).join('\n') + (b < lines.length ? '\n' : ''));
});
fs.writeFileSync(path.join(outdir, 'manifest.json'), JSON.stringify({parts: parts.length, ranges: parts}, null, 1));
// 自校验：拼接必须逐字节等于原文
const joined = parts.map(([a, b], idx) => fs.readFileSync(path.join(outdir, (idx + 1) + '.md'), 'utf8')).join('');
const orig = fs.readFileSync(file, 'utf8');
if (joined !== orig) {
  // 末尾换行差异容忍
  if (joined.replace(/\n$/, '') !== orig.replace(/\n$/, '')) { console.error('SPLIT VERIFY FAILED'); process.exit(1); }
}
console.log(`${path.basename(file)}: ${parts.length} parts, ranges=${JSON.stringify(parts.map(([a, b]) => a + '-' + b))}`);
