#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-export.mjs
 *
 * Windows-safe orchestrator for the zh-CN mirror static export: cmd.exe (which
 * pnpm scripts run under on Windows) does not understand `ENV=1 cmd` prefixes,
 * so this Node script sets DOCS_STATIC_EXPORT in its own environment and
 * spawns each step with stdio inherited. Always restores the real routes, even
 * when the build fails.
 *
 * Run: pnpm build:export  →  `pnpm generate && node scripts/build-export.mjs`
 */

import {spawnSync} from 'node:child_process';
import {existsSync, renameSync, rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(SCRIPT_DIR, '..');
// NEXT_PUBLIC_DOCS_TARGET only flips the UI version identity: the data
// pipeline (pnpm generate, which runs before this script) still resolves
// canary = the translated workspace content. With 'latest' the Canary notice
// banner is absent and version links point at the official deploys, which is
// the right posture for a mirror.
const env = {
  ...process.env,
  DOCS_STATIC_EXPORT: '1',
  NEXT_PUBLIC_DOCS_TARGET: 'latest',
};

function run(label, cmd, args, useEnv = false) {
  console.log(`\n[build-export] ${label}: ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, {
    cwd: APP_DIR,
    stdio: 'inherit',
    env: useEnv ? env : process.env,
    shell: process.platform === 'win32',
  });
  return r.status ?? 1;
}

let failed = 0;

// Windows: a lingering handle (AV scan, stale serve) can lock out/ with EBUSY
// when Next tries to rmdir it. Rename the old output aside instead — rename
// only touches the directory entry — and clean it up after the build.
const outDir = path.join(APP_DIR, 'out');
const outOld = path.join(APP_DIR, 'out-prev');
if (existsSync(outDir)) {
  rmSync(outOld, {recursive: true, force: true, maxRetries: 2});
  try {
    renameSync(outDir, outOld);
    console.log('\n[build-export] moved previous out/ aside');
  } catch {
    console.log('\n[build-export] could not move out/ aside (fresh build?)');
  }
}

failed ||= run('stub server-only routes', 'node', [path.join(SCRIPT_DIR, 'prepare-export.mjs')]);

if (!failed) {
  const nextBin = path.join(APP_DIR, 'node_modules', '.bin', process.platform === 'win32' ? 'next.cmd' : 'next');
  failed ||= run('next build (export)', nextBin, ['build', '--webpack'], true);
}

// Restore regardless of build outcome so the working tree never keeps stubs.
// Single-script branching (prepare-export.mjs --restore) avoids the two-file
// drift that made restore miss later additions to the transform table.
const restoreStatus = run('restore real routes', 'node', [path.join(SCRIPT_DIR, 'prepare-export.mjs'), '--restore']);
failed ||= restoreStatus;

// Clean the renamed previous output only after a successful build; keep it on
// failure so a locked tree still leaves the last good export in out-prev/.
if (!failed) {
  rmSync(outOld, {recursive: true, force: true, maxRetries: 3, retryDelay: 500});
}

console.log(`\n[build-export] ${failed ? 'FAILED' : 'DONE'}`);
process.exit(failed ? 1 : 0);
