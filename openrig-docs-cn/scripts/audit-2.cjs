#!/usr/bin/env node
// 终审三个点的当前源文字节 + ROOT_RE 实配。
const fs = require('fs');

const targets = [
  'src/content/docs/releases/v0.5.15.md',
  'src/content/docs/releases/v0.5.17.md',
  'src/content/docs/releases/v0.4.6.md',
  'src/content/docs/releases/v0.6.0.md',
];
const ROOT_RE = /\]\((?:\.\.\/){2,}((?:CHANGELOG|README)\.md)(#[^)\s]*)?\)/g;

for (const t of targets) {
  let s;
  try { s = fs.readFileSync(t, 'utf8'); } catch (e) { console.log(t, '读不到'); continue; }
  const m = s.match(/\]\([^)]*CHANGELOG[^)]*\)|\]\([^)]*README\.md[^)]*\)/g) || [];
  console.log(t, '→', JSON.stringify(m));
}
console.log('ROOT_RE.test(v0.4.6):', ROOT_RE.test(fs.readFileSync(targets[2], 'utf8')));