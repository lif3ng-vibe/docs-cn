// 抓 diagramdesign.dev 英文底稿 → upstream/（幂等，已存在且非空则跳过）
// 站点是纯手写静态站：首页 + 8 个自包含示例页 + 图片/视频资产。
// 视频文件名由 JS 按 data-mode 拼接（assets/demo-<light|dark>.mp4），正则抓不到，走 MANUAL 清单。
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = 'https://diagramdesign.dev';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const EXAMPLES = [
  'axonometric-plan-campus-animated',
  'axonometric-plan-campus',
  'axonometric-plan',
  'exploded-phone-animated',
  'exploded-phone',
  'exploded-unboxing-animated',
  'exploded-unboxing',
  'exploded',
];

// JS 动态拼接 + meta 引用的资产，正则发现不了的补在这里
const MANUAL_ASSETS = [
  'assets/demo-light.mp4',
  'assets/demo-dark.mp4',
  'assets/demo-light-poster.jpg',
  'assets/demo-dark-poster.jpg',
  'og.png',
  'favicon.ico',
];

async function save(rel, bytes) {
  const dest = join(ROOT, 'upstream', rel);
  if (existsSync(dest) && existsSync(dest) && (await import('node:fs')).statSync(dest).size > 0) return 'skip';
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, bytes);
  return 'new';
}

async function fetchBin(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

// 1. 首页
const homeUrl = BASE + '/';
console.log('GET', homeUrl);
const homeBytes = await fetchBin(homeUrl);
await mkdir(join(ROOT, 'upstream'), { recursive: true });
await writeFile(join(ROOT, 'upstream', 'index.html'), homeBytes);
const html = homeBytes.toString('utf8');

// 2. 从首页解析本地资产引用（src / srcset / poster / data-full / data-full-light）
const refs = new Set();
for (const m of html.matchAll(/(?:src|srcset|poster|data-full|data-full-light)="([^"]+)"/g)) {
  const v = m[1];
  if (/^(https?:|\/\/|#|data:)/.test(v)) continue;
  refs.add(v);
}

// 3. 示例页（官方是目录式 URL，308 去掉 .html）
let n = 0;
for (const name of EXAMPLES) {
  const url = `${BASE}/examples/${name}`;
  console.log('GET', url);
  const b = await fetchBin(url);
  await save(`examples/${name}.html`, b);
  n++;
}

// 4. 资产（去重合并手动清单）
const assets = [...new Set([...refs, ...MANUAL_ASSETS])].sort();
let ok = 0, fail = [];
for (const rel of assets) {
  try {
    console.log('GET', BASE + '/' + rel);
    const b = await fetchBin(BASE + '/' + rel);
    await save(rel, b);
    ok++;
  } catch (e) {
    fail.push(`${e.message}`);
  }
}

console.log(`\ndone: index.html + ${n} examples + ${ok}/${assets.length} assets ok`);
if (fail.length) console.log('failed:\n' + fail.join('\n'));
