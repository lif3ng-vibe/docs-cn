/**
 * CJK 粗体闭合坑扫描：CommonMark 的 right-flanking 规则下，
 * 闭合 ** 前若是标点且闭合后紧跟文字，粗体无法闭合、字面渲染 **。
 * 剥 fenced code 与行内 code 后，匹配形如 **……[标点]**文字 的片段。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const hits = [];

function walk(dir, rel = '') {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (['node_modules', 'examples', 'snippets', '.git', '.anchor-maps'].includes(e.name)) continue;
      walk(join(dir, e.name), r);
    } else if (e.name.endsWith('.mdx') || e.name.endsWith('.md')) {
      scan(join(dir, e.name), r);
    }
  }
}

function scan(path, rel) {
  let inFm = false, seenFm = false, fence = false;
  readFileSync(path, 'utf8').split('\n').forEach((raw, i) => {
    const t = raw.trim();
    if (!seenFm && t === '---') { if (!inFm) { inFm = true; return; } else { inFm = false; seenFm = true; return; } }
    if (inFm) return;
    if (t.startsWith('```')) { fence = !fence; return; }
    if (fence) return;
    const text = raw.replace(/`[^`]*`/g, ' ');
    // 违规仅当：闭合 ** 的前一字符是标点，且 ** 之后紧跟非空白/非标点字符
    const re = /\*\*[^\n]*?[，。：；？！）”）（，]\*\*(?=[^\s|，。：；？！）…])/g;
    let m;
    while ((m = re.exec(text))) hits.push(`${rel}:${i + 1}  ${text.trim().slice(Math.max(0, m.index - 25), m.index + m[0].length + 25)}`);
  });
}

walk(ROOT);
if (hits.length) { hits.forEach(h => console.log(h)); console.error(`BOLD-MISMATCH: ${hits.length} 处`); process.exit(1); }
console.log('CLEAN');