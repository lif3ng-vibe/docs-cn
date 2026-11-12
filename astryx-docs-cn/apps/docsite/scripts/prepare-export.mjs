#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file prepare-export.mjs / restore-routes.mjs
 *
 * Swap server-only routes for static-export stubs before a DOCS_STATIC_EXPORT
 * build, and put the originals back afterwards. Run as:
 *
 *   node scripts/prepare-export.mjs   # original -> .bak, stub -> live
 *   node scripts/restore-routes.mjs   # .bak -> original
 *
 * Idempotent: prepare no-ops (and keeps the first .bak) if run twice; restore
 * no-ops without a .bak.
 */

import {copyFileSync, existsSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(SCRIPT_DIR, '..', 'src', 'app');

const ROUTES = [
  {live: path.join(APP, 'api', 'search', 'route.ts'), stub: path.join(SCRIPT_DIR, 'export-stubs', 'api-search.stub.ts')},
  {live: path.join(APP, 'mcp', 'route.ts'), stub: path.join(SCRIPT_DIR, 'export-stubs', 'mcp.stub.ts')},
];

// In-place transforms: source edits needed only while cacheComponents is off
// (its `use cache` directive is a syntax error without the flag). Backed up
// and restored through the same .bak mechanism as the stub routes.
const stripUseCache = source =>
  source
    .replace(/^(\s*)'use cache';(\s*$)/gm, '$1// [export build] use cache requires cacheComponents$2')
    .replace(/^(\s*)cacheLife\([^)]*\);(\s*$)/gm, '$1// [export build] cacheLife requires cacheComponents$2');

// Generation-only routes need an explicit force-static under output:export,
// while the canonical cacheComponents build rejects route segment config — so
// the config is injected only in the export build, never committed to source.
const addForceStatic = source =>
  `${source}\n// [export build] injected: output export requires an explicit force-static on\n// generation-only routes; the canonical cacheComponents build rejects route\n// segment config instead.\nexport const dynamic = 'force-static';\n`;

const TRANSFORMS = [
  {live: path.join(APP, 'sitemap.ts'), apply: s => addForceStatic(stripUseCache(s))},
  {live: path.join(APP, '(site)', 'community', 'page.tsx'), apply: stripUseCache},
  {live: path.join(APP, '..', 'lib', 'copyrightYear.ts'), apply: stripUseCache},
  {live: path.join(APP, 'robots.ts'), apply: addForceStatic},
  {live: path.join(APP, 'llms.txt', 'route.ts'), apply: addForceStatic},
  {live: path.join(APP, 'rss.xml', 'route.ts'), apply: addForceStatic},
  {live: path.join(APP, 'blog', 'txt', '[slug]', 'route.ts'), apply: addForceStatic},
];

const restore =
  process.argv[1]?.endsWith('restore-routes.mjs') || process.argv.includes('--restore');

const RESTORE_TARGETS = [...ROUTES.map(r => r.live), ...TRANSFORMS.map(t => t.live)];

for (const target of RESTORE_TARGETS) {
  const bak = `${target}.export-bak`;
  if (restore) {
    if (existsSync(bak)) {
      copyFileSync(bak, target);
      unlinkSync(bak);
      console.log(`  restored ${path.relative(APP, target)}`);
    } else {
      console.log(`  no backup for ${path.relative(APP, target)} (already restored?)`);
    }
    continue;
  }
}

for (const {live, stub} of ROUTES) {
  const bak = `${live}.export-bak`;
  if (restore) continue;
  if (existsSync(bak)) {
    console.log(`  keeping existing backup for ${path.relative(APP, live)}`);
  } else {
    copyFileSync(live, bak);
  }
  copyFileSync(stub, live);
  console.log(`  stubbed ${path.relative(APP, live)}`);
}

if (!restore) {
  for (const {live, apply} of TRANSFORMS) {
    const bak = `${live}.export-bak`;
    if (!existsSync(bak)) copyFileSync(live, bak);
    writeFileSync(live, apply(readFileSync(bak, 'utf8')));
    console.log(`  transformed ${path.relative(APP, live)}`);
  }
}
