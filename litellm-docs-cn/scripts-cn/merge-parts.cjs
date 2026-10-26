// 确定性拼接：把 .parts/in/<name>/ 的已译分段按序拼回源文件，锚点映射拼到 .anchor-maps。
// 用法：node scripts-cn/merge-parts.cjs <srcFile> <inDir> [mapDir]
// 约定：<inDir>/1.md..N.md 为译文分段；<inDir>/map/1.md..N.md 为每段锚点映射（可缺）。
const fs = require('fs');
const path = require('path');

const srcFile = process.argv[2];
const inDir = process.argv[3];
const {parts} = JSON.parse(fs.readFileSync(path.join(inDir, 'manifest.json'), 'utf8'));

const chunks = [];
const mapChunks = [];
for (let k = 1; k <= parts; k++) {
  const p = path.join(inDir, k + '.md');
  if (!fs.existsSync(p)) { console.error('MISSING part ' + p); process.exit(1); }
  chunks.push(fs.readFileSync(p, 'utf8'));
  const mp = path.join(inDir, 'map', k + '.md');
  if (fs.existsSync(mp)) {
    mapChunks.push(fs.readFileSync(mp, 'utf8').split('\n').filter((l) => l.trim() && !/（本段无标题）/.test(l)).join('\n'));
  }
}
// 分段各自带尾换行，直接相接；校验与原文行数一致（行级无损）
const merged = chunks.join('');
const srcLines = fs.readFileSync(srcFile, 'utf8').split('\n').length;
const mergedLines = merged.split('\n').length;
fs.writeFileSync(srcFile, merged);
if (mapChunks.length) {
  const rel = path.relative(process.cwd(), srcFile).split(path.sep).join('/');
  const mapOut = path.join(ROOT_MAP_DIR(), rel + '.map.md');
  fs.mkdirSync(path.dirname(mapOut), {recursive: true});
  fs.writeFileSync(mapOut, mapChunks.join('\n') + '\n');
}
console.log(`merged ${srcFile}: ${parts} parts, lines ${mergedLines} (src ${srcLines})${mergedLines === srcLines ? '' : '  ⚠ 行数不一致'}`);

function ROOT_MAP_DIR() {
  return path.join(__dirname, '..', '.anchor-maps');
}
