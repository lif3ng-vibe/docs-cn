#!/usr/bin/env node
/**
 * 自动构建全量标题锚点映射：git 快照提交 = 英文原文，工作区 = 中文译文。
 * 逐文件提取两侧标题（frontmatter title + H2-H4，含保留英文的 H1），
 * 按出现顺序配对，输出到 .anchor-maps-auto/<相对 content 路径>.map.md。
 * 行格式与手工映射一致：`原英文标题 | 中文标题 | 新锚点`
 *
 * 用法：node scripts/build-anchor-map.mjs [snapshot-commit]
 * 默认 snapshot-commit = 第一次提交（英文快照）。
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const outDir = join(root, '.anchor-maps-auto');
const snapshot =
  process.argv[2] ??
  execSync('git rev-list --max-parents=0 HEAD', { cwd: root })
    .toString()
    .trim();

const log = (m) => console.log(`[anchor-map] ${m}`);

const slug = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/\s/g, '-');

/** 提取 frontmatter title 与正文标题（按出现顺序）。 */
const headingsOf = (md) => {
  const out = [];
  const fm = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    const t = fm[1].match(/^title:\s*(.+)$/m)?.[1]?.trim();
    if (t) out.push(t.replace(/^(['"])(.*)\1$/, '$2'));
  }
  const body = fm ? md.slice(fm[0].length) : md;
  for (const m of body.matchAll(/^#{1,4}\s+(.+?)\s*$/gm)) {
    out.push(m[1].trim());
  }
  return out;
};

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.mdx')) out.push(p);
  }
  return out;
};

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const files = walk(contentDir);
let paired = 0;
let skipped = 0;
let mismatch = 0;

for (const file of files) {
  const rel = relative(contentDir, file).split('\\').join('/');
  let en;
  try {
    en = execSync(`git show ${snapshot}:content/${rel}`, {
      cwd: root,
      maxBuffer: 64 * 1024 * 1024,
    }).toString();
  } catch {
    log(`skip (not in snapshot): ${rel}`);
    skipped++;
    continue;
  }
  const cn = readFileSync(file, 'utf8');
  const enH = headingsOf(en);
  const cnH = headingsOf(cn);
  if (enH.length !== cnH.length) {
    mismatch++;
    log(
      `heading count mismatch (${enH.length} vs ${cnH.length}): ${rel} — 按最短配对`,
    );
  }
  const n = Math.min(enH.length, cnH.length);
  if (n === 0) continue;
  const rows = [];
  for (let i = 0; i < n; i++) {
    const enTitle = enH[i];
    const cnTitle = cnH[i];
    // H1 与 frontmatter title 的锚点不用于页内跳转，但仍记录（对照工具用）
    rows.push(`${enTitle} | ${cnTitle} | ${slug(cnTitle)}`);
  }
  const outFile = join(outDir, rel + '.map.md');
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, rows.join('\n') + '\n');
  paired += rows.length;
}

log(`pages: ${files.length - skipped}, rows: ${paired}, mismatched: ${mismatch}`);
log(`output: ${outDir}`);
