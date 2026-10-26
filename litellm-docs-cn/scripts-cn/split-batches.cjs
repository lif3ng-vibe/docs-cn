// 把 phase1.json 切成批次：batch-00 为试点批，其余每批 ~85 个文件（超长文件均摊）。
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const files = JSON.parse(fs.readFileSync(path.join(dir, 'phase1.json'), 'utf8'));

// 试点批：覆盖各种形态——普通页、带 frontmatter 页、MDX 组件页、一个超长文件
const pilotNames = [
  'docs/index.md',
  'docs/routing.md',
  'docs/embedding/index.md',
  'docs/caching/local_cache.md',
  'docs/guides/instructor.md',
  'src/pages/stream.md',
];
const pilot = [];
const rest = [];
for (const f of files) {
  if (pilotNames.includes(f.path)) pilot.push(f);
  else rest.push(f);
}

// 超长文件均摊到各批
rest.sort((a, b) => b.lines - a.lines);
const N_BATCHES = 8;
const batches = Array.from({length: N_BATCHES}, () => []);
const batchLoad = Array(N_BATCHES).fill(0);
for (const f of rest) {
  const i = batchLoad.indexOf(Math.min(...batchLoad));
  batches[i].push(f);
  batchLoad[i] += f.lines;
}
batches.forEach((b) => b.sort((a, b2) => a.path.localeCompare(b2.path)));

const write = (name, list) =>
  fs.writeFileSync(path.join(dir, name), JSON.stringify(list, null, 1));
write('batch-00-pilot.json', pilot);
batches.forEach((b, i) => write(`batch-${String(i + 1).padStart(2, '0')}.json`, b));
console.log('pilot:', pilot.length, pilot.map((f) => f.path).join(', '));
console.log('batches:', batches.map((b, i) => `#${i + 1}:${b.length}f/${Math.round(batchLoad[i] / 1000)}k`).join('  '));
