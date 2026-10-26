// docs/src-pages 中指向 blog 的死链改写为上游绝对地址；本地存在的资源路径一律不动。
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const UPSTREAM = 'https://docs.litellm.ai/blog/';

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) out.push(full);
  }
}

const files = [];
walk(path.join(ROOT, 'docs'), files);
walk(path.join(ROOT, 'src', 'pages'), files);

let rewritten = 0;
const perFile = [];
for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const src = fs.readFileSync(file, 'utf8');
  let changed = 0;
  const out = src.replace(/\]\((\.?\.?\/blog\/[^)\s]+|blog\/[^)\s]+|\/blog\/[^)\s]+)/g, (whole, p) => {
    // 归一化出 blog/ 内部路径，判断目标在本地是否存在（图片/组件目录 → 保留）
    const inner = p.replace(/^(\.\.\/)*|^\.?\/|^\.\.\//, (m) => '').replace(/^(\.\.\/)+/, '');
    const localTry = [path.join(ROOT, p), path.join(path.dirname(file), p), path.join(ROOT, 'blog', inner.replace(/^blog\//, ''))];
    if (localTry.some((t) => fs.existsSync(t))) return whole;
    changed += 1;
    return '](' + UPSTREAM + inner.replace(/^blog\//, '');
  });
  if (changed) {
    fs.writeFileSync(file, out);
    rewritten += changed;
    perFile.push(rel + ':' + changed);
  }
}
console.log('rewritten links:', rewritten);
console.log(perFile.slice(0, 30).join('\n'));
