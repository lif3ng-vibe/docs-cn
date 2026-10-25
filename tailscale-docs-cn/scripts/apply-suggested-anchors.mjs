#!/usr/bin/env node
// 应用人工甄别的锚点建议表（v2 甄别遗留的 10 条强候选）。
// 用法：node scripts/apply-suggested-anchors.mjs <check-anchors-output.txt>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const reportPath = process.argv[2];
// 甄别定表：old → dst 页上的正确新 id
const TABLE = [
  ['install-the-aperture-cli', '/docs/aperture/cli/', '安装-aperture-cli'],
  ['databaseheaders-fields', '/docs/aperture/configuration/', 'databaseheaders-字段'],
  ['autoapprovers', '/docs/reference/syntax/policy-file/', '自动批准autoapprovers'],
  ['use-tailscale-subnets', '/docs/features/client/manage-preferences/', '使用-tailscale-子网'],
  ['standalone-variant', '/docs/concepts/macos-variants/', 'standalone-变体'],
  ['flags-to-tailscaled', '/docs/reference/tailscaled/', 'tailscaled-的标志'],
  ['open-source-tailscaled-variant', '/docs/concepts/macos-variants/', '开源-tailscaled-变体'],
  ['mac-app-store-variant', '/docs/concepts/macos-variants/', 'mac-app-store-变体'],
  ['use-tailscale-dns-settings', '/docs/features/client/manage-preferences/', '使用-tailscale-dns-设置'],
  ['create-a-tsnet-hello-world-program', '/docs/features/tsnet/how-to/create-basic-tsnet-app/', '创建-tsnet-hello-world-程序'],
];
const key = (old, dst) => old + ' → ' + dst;
const table = new Map(TABLE.map(([o, d, n]) => [key(o, d), n]));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const bySrc = new Map();
let total = 0;
for (const line of readFileSync(reportPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*(\/docs\/\S+) -> #([\w-]+) \(target page (\/docs\/\S+) has no such id\)/);
  if (!m) continue;
  const neu = table.get(key(m[2], m[3]));
  if (!neu) continue;
  total++;
  if (!bySrc.has(m[1])) bySrc.set(m[1], []);
  bySrc.get(m[1]).push({ old: m[2], neu });
}
console.log(`applicable pairs: ${total}`);
let fixed = 0;
for (const [src, list] of bySrc) {
  const f = join('src/content/docs/docs', src.replace(/^\/docs\/?/, '').replace(/\/+$/, '') + '.md');
  let text = readFileSync(f, 'utf8');
  let changed = false;
  for (const { old, neu } of list) {
    const re = new RegExp('#' + esc(old) + '(?![\\w-])', 'g');
    if (re.test(text)) {
      text = text.replace(re, '#' + neu);
      changed = true;
      fixed++;
    }
  }
  if (changed) writeFileSync(f, text);
}
console.log(`rewritten: ${fixed}`);
