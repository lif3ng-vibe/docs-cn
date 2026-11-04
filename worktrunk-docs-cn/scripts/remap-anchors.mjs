#!/usr/bin/env node
// Remap markdown link fragments from English (dist-en) heading ids to
// Chinese (dist) heading ids after translating src/content/docs/*.md.
//
// Usage:
//   node scripts/remap-anchors.mjs [--dry-run] [--dist-en=DIR] [--dist=DIR]
//
// --dist-en / --dist overrides exist for self-testing (e.g. heading-count
// mismatch must abort before any file is written).

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
function argValue(flag) {
  const a = args.find((x) => x.startsWith(flag));
  return a ? a.slice(flag.length) : undefined;
}
const DIST_EN = argValue('--dist-en=') ?? path.join(ROOT, 'dist-en');
const DIST = argValue('--dist=') ?? path.join(ROOT, 'dist');
const DOCS_DIR = path.join(ROOT, 'src/content/docs');
const NAV_FILE = path.join(ROOT, 'src/site-navigation.mjs');

const HEADING_RE = /<h[1-6][^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h[1-6]>/g;
// Markdown links with a fragment: ](#frag) or ](/page/#frag)
const LINK_RE = /\]\(([^)]+)\)/g;

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function readIfExists(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

/** Ordered (id, text) heading list from a built html page. */
function extractHeadings(html) {
  const out = [];
  let m;
  HEADING_RE.lastIndex = 0;
  while ((m = HEADING_RE.exec(html))) {
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    out.push({ id: m[1], text });
  }
  return out;
}

/** Character ranges of fenced code blocks (``` ... ```), for skipping rewrites inside them. */
function fenceRanges(src) {
  const ranges = [];
  const fenceRe = /^```/gm;
  let m;
  let start = -1;
  while ((m = fenceRe.exec(src))) {
    if (start === -1) start = m.index;
    else {
      ranges.push([start, m.index + 3]);
      start = -1;
    }
  }
  return ranges;
}

/** Run fn over markdown links outside fenced code blocks. */
function mapLinks(src, fn) {
  const ranges = fenceRanges(src);
  const inFence = (idx) => ranges.some(([a, b]) => idx >= a && idx < b);
  return src.replace(LINK_RE, (whole, target, offset) => {
    if (inFence(offset)) return whole;
    return fn(whole, target);
  });
}

const mdFiles = fs
  .readdirSync(DOCS_DIR)
  .filter((f) => f.endsWith('.md'))
  .sort();
if (mdFiles.length === 0) fail(`no md files under ${toPosix(DOCS_DIR)}`);

// 1-2. Build per-page old->new id maps from dist-en vs dist heading order.
const pages = new Map(); // page slug -> { en, cn, map: Map old->new, cnIds: Set }
for (const f of mdFiles) {
  const slug = f.replace(/\.md$/, '');
  const enHtml = readIfExists(path.join(DIST_EN, slug, 'index.html'));
  const cnHtml = readIfExists(path.join(DIST, slug, 'index.html'));
  if (!enHtml) fail(`missing ${toPosix(path.join(DIST_EN, slug, 'index.html'))}`);
  if (!cnHtml) fail(`missing ${toPosix(path.join(DIST, slug, 'index.html'))}`);
  const en = extractHeadings(enHtml);
  const cn = extractHeadings(cnHtml);
  if (en.length !== cn.length) {
    fail(
      `heading count mismatch for "${slug}": dist-en has ${en.length}, dist has ${cn.length} — ` +
        `refusing to rewrite anything (translation must not change heading count/order)`,
    );
  }
  const map = new Map();
  for (let i = 0; i < en.length; i++) map.set(en[i].id, cn[i].id);
  pages.set(slug, { en, cn, map, cnIds: new Set(cn.map((h) => h.id)) });
}

// Route "/" (homepage) renders worktrunk.md, so its ids come from the
// dist/worktrunk page.
const worktrunk = pages.get('worktrunk');
if (!worktrunk) fail('worktrunk.md not found in src/content/docs');

/** Resolve a link target to { page, frag } or null when it has no fragment. */
function parseTarget(target, selfSlug) {
  if (target.startsWith('#')) return { page: selfSlug, frag: target.slice(1) };
  const m = target.match(/^\/([^/?#]*)\/?(#.*)?$/);
  if (!m) return null;
  const page = m[1] === '' ? 'worktrunk' : m[1];
  if (!m[2]) return null; // no anchor — leave untouched
  return { page, frag: m[2].slice(1) };
}

// 3-4. Rewrite fragments in each md (skipping fenced code blocks).
let totalRewrites = 0;
const perFile = [];
const rewritten = new Map(); // slug -> new content (for verification)

for (const f of mdFiles) {
  const slug = f.replace(/\.md$/, '');
  const file = path.join(DOCS_DIR, f);
  const src = fs.readFileSync(file, 'utf8');
  let rewrites = 0;
  const unknown = [];

  const out = mapLinks(src, (whole, target) => {
    const parsed = parseTarget(target, slug);
    if (!parsed) return whole;
    const pageInfo = pages.get(parsed.page);
    if (!pageInfo) return whole; // target outside the 15 pages — leave as-is
    const newFrag = pageInfo.map.get(parsed.frag);
    if (newFrag === undefined) {
      unknown.push(`${target}`);
      return whole;
    }
    if (newFrag === parsed.frag) return whole;
    rewrites++;
    const newTarget = target.slice(0, target.length - parsed.frag.length) + newFrag;
    return `](${newTarget})`;
  });
  rewritten.set(slug, out);
  perFile.push({ slug, rewrites, unknown, changed: out !== src, src, out, file });
  totalRewrites += rewrites;
}

// 5. site-navigation.mjs: '/#install' -> worktrunk's new install anchor.
let navRewrite = null;
const navSrc = readIfExists(NAV_FILE);
if (navSrc !== null) {
  const newInstall = worktrunk.map.get('install');
  if (newInstall !== undefined && `'/#install'` !== `'/#${newInstall}'`) {
    if (navSrc.includes(`'/#install'`)) {
      navRewrite = { from: `'/#install'`, to: `'/#${newInstall}'` };
    }
  }
}

// Report + write.
console.log(`pages paired (dist-en -> dist headings):`);
for (const [slug, p] of pages) {
  const changed = [...p.map.entries()].filter(([a, b]) => a !== b).length;
  console.log(`  ${slug.padEnd(20)} ${String(p.en.length).padStart(3)} headings, ${changed} id(s) changed`);
}

console.log(`\nfragment rewrites per md file:`);
for (const r of perFile) {
  console.log(
    `  ${r.slug.padEnd(20)} ${String(r.rewrites).padStart(3)} rewritten` +
      (r.unknown.length ? `  (unmapped: ${[...new Set(r.unknown)].join(', ')})` : ''),
  );
}
if (navRewrite) console.log(`site-navigation.mjs: ${navRewrite.from} -> ${navRewrite.to}`);
else console.log(`site-navigation.mjs: '/#install' unchanged (install anchor identical)`);

// 6. Final check: every fragment in the rewritten md must exist in new dist.
const failures = [];
for (const [slug, content] of rewritten) {
  mapLinks(content, (whole, target) => {
    const parsed = parseTarget(target, slug);
    if (!parsed) return whole;
    const pageInfo = pages.get(parsed.page);
    if (!pageInfo) return whole; // external page, cannot verify here
    if (!pageInfo.cnIds.has(parsed.frag)) {
      failures.push(`${slug}.md: ](${target}) -> #${parsed.frag} not found in dist/${parsed.page}/`);
    }
    return whole;
  });
}

if (DRY_RUN) {
  console.log(`\n[dry-run] would rewrite ${totalRewrites} fragment(s) across ${perFile.filter((r) => r.changed).length} md file(s)${navRewrite ? ' + site-navigation.mjs' : ''}; no files written.`);
} else {
  for (const r of perFile) {
    if (r.changed) fs.writeFileSync(r.file, r.out, 'utf8');
  }
  if (navRewrite && navSrc !== null) {
    fs.writeFileSync(NAV_FILE, navSrc.split(navRewrite.from).join(navRewrite.to), 'utf8');
  }
  console.log(`\nwrote ${totalRewrites} fragment rewrite(s) across ${perFile.filter((r) => r.changed).length} md file(s)${navRewrite ? ' + site-navigation.mjs' : ''}.`);
}

if (failures.length) {
  console.error(`\nANCHORS-FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('ANCHORS-OK');
