#!/usr/bin/env node
// 从线上站补抓缺失文件（带重试 + 已存在跳过）
// 用法: node tools/fetch-missing.mjs <清单文件，每行一个站点根相对路径>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'https://impeccable.style';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36';

const list = fs.readFileSync(process.argv[2], 'utf8').trim().split(/\r?\n/).filter(Boolean);
let ok = 0;
let skip = 0;
let fail = [];

async function fetchOne(p, attempt = 1) {
  const dest = path.join(OUT, p.replaceAll('/', path.sep));
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) { skip++; return; }
  try {
    const res = await fetch(ORIGIN + p, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    if (!res.ok) { fail.push(`${res.status} ${p}`); return; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    ok++;
  } catch (err) {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return fetchOne(p, attempt + 1);
    }
    fail.push(`ERR ${err.message.slice(0, 60)} ${p}`);
  }
}

for (const p of list) {
  await fetchOne(p);
  process.stdout.write(`\rok=${ok} skip=${skip} fail=${fail.length} | ${p.slice(-60)}   `);
}
console.log(`\ndone ok=${ok} skip=${skip} fail=${fail.length}`);
if (fail.length) {
  console.log(fail.slice(0, 20).join('\n'));
  process.exit(1);
}
