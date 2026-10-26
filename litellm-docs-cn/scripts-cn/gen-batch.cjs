// 生成一期翻译清单 phase1.json：docs/ 下除二期目录外的全部 md/mdx + src/pages 的 md。
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDE_DIRS = ['tutorials', 'projects', 'observability', 'search', 'harness', 'pass_through'];

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) out.push(full);
  }
}

const docsFiles = [];
walk(path.join(ROOT, 'docs'), docsFiles);
const phase1 = docsFiles
  .map((f) => path.relative(path.join(ROOT, 'docs'), f).replace(/\\/g, '/'))
  .filter((rel) => !EXCLUDE_DIRS.includes(rel.split('/')[0]))
  .sort();
// src/pages 下的一期 markdown 页（落地页 index.js 与 rust-migration 已移除/另行处理）
const srcPages = [
  'pages/contact.md', 'pages/contributing.md', 'pages/stream.md', 'pages/token_usage.md',
  'pages/completion/input.md', 'pages/completion/output.md', 'pages/completion/supported.md',
  'pages/embedding/supported_embedding.md',
];
const list = [...phase1.map((rel) => 'docs/' + rel), ...srcPages.map((rel) => 'src/' + rel)];
const detail = list.map((rel) => {
  const lines = fs.readFileSync(path.join(ROOT, rel), 'utf8').split('\n').length;
  return {path: rel, lines};
});
fs.writeFileSync(path.join(__dirname, 'phase1.json'), JSON.stringify(detail, null, 1));
const byDir = {};
for (const d of detail) {
  const dir = d.path.split('/').slice(0, 2).join('/');
  byDir[dir] = (byDir[dir] || 0) + 1;
}
console.log('total files:', detail.length);
console.log('total lines:', detail.reduce((n, d) => n + d.lines, 0));
console.log('over 1000 lines:', detail.filter((d) => d.lines > 1000).map((d) => `${d.path}(${d.lines})`).join(', '));
console.log(JSON.stringify(byDir, null, 1));
