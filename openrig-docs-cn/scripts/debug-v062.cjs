const fs = require('fs');

function getIds(file) {
  const rawList = fs.readFileSync(file, 'utf8').match(/id="[^"]+"/g) || [];
  const set = new Set();
  for (const rawId of rawList) {
    set.add(rawId.slice(4, -1));
  }
  return set;
}

const targetFile = 'dist/reference/rig-bundle/index.html';
const targetIds = getIds(targetFile);
const hasCli = targetIds.has('cli-命令面');
console.log('v0.6.2 目标页有 cli-命令面:', hasCli);

const v2 = fs.readFileSync('dist/releases/v062/index.html', 'utf8');
const hrefs = v2.match(/href="[^"]*rig-bundle\.md[^"]*"/g) || [];
let count = 0;
for (const rawHref of hrefs) {
  const inner = rawHref.slice(6, -1);
  const hashAt = inner.indexOf('#');
  if (hashAt === -1) continue;
  const linkPath = inner.slice(0, hashAt);
  const rawFrag = inner.slice(hashAt + 1);
  let decoded = rawFrag;
  try {
    decoded = decodeURIComponent(rawFrag);
  } catch (err) {
    decoded = rawFrag;
  }
  const hit = targetIds.has(decoded);
  count++;
  console.log('v0.6.2 锚点', count, '路径:', linkPath, '原文:', JSON.stringify(rawFrag), '解码:', JSON.stringify(decoded), '命中:', hit);
}
