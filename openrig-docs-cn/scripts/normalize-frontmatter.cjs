#!/usr/bin/env node
// 规范化 src/content/docs 下所有 md：
// 1) 无 frontmatter 的页：首行 H1 提为 frontmatter title，并从正文剥掉该 H1
//    （Starlight 渲染 frontmatter title 为页面标题，保留会双标题）
// 2) 有 frontmatter 的页：若正文首个非空行是 H1 也剥掉（title 已在 frontmatter）
// 幂等：重复运行无副作用。
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'content', 'docs');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(md|mdx)$/.test(e.name)) yield p;
  }
}

let injected = 0;
let stripped = 0;

for (const file of walk(ROOT)) {
  if (path.basename(file) === 'index.mdx') continue; // 落地页自己维护
  let src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');

  if (lines[0]?.trim() === '---') {
    // 有 frontmatter：找结束行，剥正文首个 H1
    let end = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') { end = i; break; }
    }
    if (end === -1) { console.error(`!! frontmatter 未闭合: ${file}`); continue; }
    let bodyStart = end + 1;
    while (bodyStart < lines.length && lines[bodyStart].trim() === '') bodyStart++;
    if (/^#\s/.test(lines[bodyStart] || '')) {
      lines.splice(bodyStart, 1);
      // 若剥后紧跟空行则再吃掉一个，避免双空行
      if ((lines[bodyStart] || '').trim() === '' && (lines[bodyStart + 1] || '').trim() === '') lines.splice(bodyStart, 1);
      stripped++;
      fs.writeFileSync(file, lines.join('\n'));
    }
  } else {
    // 无 frontmatter：首个非空行应是 H1
    let first = 0;
    while (first < lines.length && lines[first].trim() === '') first++;
    const m = /^#\s+(.+?)\s*$/.exec(lines[first] || '');
    if (!m) { console.error(`!! 无 H1 可提 title: ${file}`); continue; }
    const title = m[1].replace(/^#+\s*/, '');
    lines.splice(first, 1);
    if ((lines[first] || '').trim() === '' && (lines[first + 1] || '').trim() === '') lines.splice(first, 1);
    const fm = `---\ntitle: ${JSON.stringify(title)}\n---\n`;
    fs.writeFileSync(file, fm + lines.join('\n'));
    injected++;
  }
}

console.log(`frontmatter 注入: ${injected}, 正文 H1 剥除: ${stripped}`);
