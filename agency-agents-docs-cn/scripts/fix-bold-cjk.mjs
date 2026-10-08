// 修复 CJK 粗体闭合坑：`**……。**文字` → `**……**。文字`
// 规则：闭合 ** 紧跟在 CJK 标点后、且后面是非空白非标点字符时，
// 把该标点移出粗体。代码围栏内的行不动。
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const docs = join(root, 'src', 'content', 'docs');
const TAIL_PUNCT = '。！？，；：、）》】〉」』' + '，；：';

function walk(dir) {
  let out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (n.endsWith('.md') || n.endsWith('.mdx')) out.push(p);
  }
  return out;
}

let fixes = 0;
for (const f of walk(docs)) {
  const lines = readFileSync(f, 'utf8').split('\n');
  let inFence = false, changed = 0;
  const out = lines.map((line, idx) => {
    if (/^\s{0,3}(`{3,}|~{3,})/.test(line)) { inFence = !inFence; return line; }
    if (inFence) return line;
    // 闭合 ** 前 1 个字符是全角尾标点、其后紧跟非空白字符 → 标点移出
    let res = line;
    for (;;) {
      const m = res.match(/(\*\*[^*\n]*)([。！？，；：、）》】〉」』])(\*\*)(?=[^\s*、。！？，；：）】【〉」』])/);
      if (!m) break;
      res = res.replace(m[0], m[1] + m[3] + m[2]);
      changed++;
    }
    return res;
  });
  if (changed) {
    writeFileSync(f, out.join('\n'));
    fixes += changed;
    console.log(fixes, relative(root, f).replaceAll('\\', '/'));
  }
}
console.log(fixes === 0 ? 'NO FIXES NEEDED' : fixes + ' fixes applied');