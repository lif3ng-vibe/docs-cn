/**
 * 全量英文残留行扫描（residue-check.cjs 的盲区补充）：
 * 剥 fenced 代码与 frontmatter、去行内 code 后，找「≥6 个连续英文单词 且 无任何
 * CJK 字符」的行——正文漏译段落通常整行无中文。import 行、纯 ASCII 标点行、
 * 链接 URL 行按启发排除；人工复核打印结果。
 *
 * 用法：node scan-en-lines.mjs
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
  const lines = readFileSync(path, 'utf8').split('\n');
  lines.forEach((raw, i) => {
    const t = raw.trim();
    if (!seenFm && t === '---') { if (!inFm) { inFm = true; return; } else { inFm = false; seenFm = true; return; } }
    if (inFm) return;
    if (t.startsWith('```')) { fence = !fence; return; }
    if (fence) return;
    if (/^(import |export |from |const |let |var |@|<)/.test(t)) return;
    // 去行内 code
    const text = raw.replace(/`[^`]*`/g, ' ').replace(/\[\^?\d+\]\(.*\)/g, ' ');
    if (/[一-鿿]/.test(text)) return; // 有中文的行不查
    const words = text.match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
    if (words.length < 6) return;
    // 全是 URL/文件路径形态的行跳过
    if (!/[a-z] [a-z]/i.test(text.replace(/https?:\/\/\S+/g, ''))) return;
    hits.push(`${rel}:${i + 1}  ${t.slice(0, 150)}`);
  });
}

walk(ROOT);
if (hits.length) { hits.forEach(h => console.log(h)); console.error(`RESIDUE: ${hits.length} 行`); process.exit(1); }
console.log('CLEAN');