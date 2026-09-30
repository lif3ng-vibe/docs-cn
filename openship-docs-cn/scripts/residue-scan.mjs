// 终检残留扫描（精准版）：
// - 剥除围栏代码块与 import 行
// - 只报告：不含 CJK、且含 >=3 个连续英文单词、且不是纯链接/URL/JSX 属性行 的正文行
import fs from "node:fs";

let root = process.argv[2];
if (!root) root = "apps/web/content/docs";
let hits = 0;

function scan(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    if (/^\s*(import|export)\s/.test(line)) return;
    if (/[一-龥]/.test(line)) return; // 有中文，不算残留行
    // 纯链接行（[text](url) 或 <url>）、表格分隔、HTML 注释、frontmatter
    if (/^\s*(\||>|<!|--|\{\/\*|<\/?[A-Za-z][^>]*>\s*|https?:\/\/\S+\s*)+$/.test(line)) return;
    if (/^\s*\[.[^\]]*\]\([^)]*\)\s*$/.test(line)) return;
    // 去掉链接目标与行内代码后再测英文连续词
    const stripped = line
      .replace(/`[^`]*`/g, " ")
      .replace(/\]\([^)]*\)/g, "]()")
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/&[a-z#0-9]+;/gi, " ");
    const words = stripped.match(/[A-Za-z][A-Za-z''-]{1,}/g) || [];
    // 连续英文词 >=3 视为句子残留
    let run = 0, maxRun = 0;
    for (const w of words) {
      run = /[:]$/.test(w) ? 0 : run + 1;
      maxRun = Math.max(maxRun, run);
    }
    if (maxRun >= 3) {
      hits++;
      console.log(`${file}:${i + 1}: ${line.trim().slice(0, 160)}`);
    }
  });
}

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + "/" + e.name;
    if (e.isDirectory()) walk(p);
    else if (/\.(mdx|md)$/.test(e.name)) scan(p);
  }
}
walk(root);
console.log(hits ? `\n${hits} 行疑似英文残留` : "CLEAN");
process.exit(hits ? 1 : 0);