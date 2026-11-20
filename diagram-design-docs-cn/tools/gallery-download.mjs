// 抓官方画廊(cathrynlavery.github.io/diagram-design/)→ upstream-gallery/(幂等)
// 页面清单从画廊 index.html 的 data-type 按钮推导:example-<type><variant>.html,
// variant ∈ {"", "-dark", "-full"},data-single 类型只有基础版;404 静默跳过。
// icons.html 为 index 显式链接,一并抓。
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = 'https://cathrynlavery.github.io/diagram-design';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'upstream-gallery');

async function fetchBin(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function save(rel, bytes) {
  const dest = join(DIR, rel);
  if (existsSync(dest) && statSize(dest) > 0) return 'skip';
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, bytes);
  return 'new';
}
function statSize(p) { try { return require('node:fs').statSync(p).size; } catch { return 0; } }

// 1. 画廊 index
console.log('GET', BASE + '/');
const idxBytes = await fetchBin(BASE + '/');
await mkdir(DIR, { recursive: true });
await writeFile(join(DIR, 'index.html'), idxBytes);
const html = idxBytes.toString('utf8');

// 2. 提取类型按钮(data-type / data-single)
const re = /<button class="tab[^"]*" data-type="([^"]+)"([^>]*)>/g;
const types = [];
let m;
while ((m = re.exec(html))) types.push({ type: m[1], single: m[2].includes('data-single') });
console.log(`${types.length} types`);

// 3. 生成页面清单并抓取
const pages = [];
for (const t of types) {
  pages.push(`example-${t.type}.html`);
  if (!t.single) pages.push(`example-${t.type}-dark.html`, `example-${t.type}-full.html`);
}
let ok = 0, skip = 0, fail = [];
for (const rel of [...pages, 'icons.html']) {
  try {
    const b = await fetchBin(`${BASE}/${rel}`);
    const r = await save(rel, b);
    r === 'new' ? ok++ : skip++;
  } catch (e) {
    if (String(e.message).startsWith('404')) { fail.push(rel + ' (404, skip)'); continue; }
    fail.push(e.message);
  }
}
console.log(`\ndone: index + ${ok} new + ${skip} skip / ${pages.length + 1} targets`);
if (fail.length) console.log('misses:\n' + fail.join('\n'));
