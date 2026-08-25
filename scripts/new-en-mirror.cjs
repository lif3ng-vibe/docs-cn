#!/usr/bin/env node
// new-en-mirror.cjs — 为「上游只有 markdown、无文档网站」的仓库生成英文 Starlight 镜像站。
// 用法：node scripts/new-en-mirror.cjs --config scripts/en-mirrors/<site>.json
// 幂等：内容每次全量覆盖；脚手架仅首次生成。重跑时 diff 上游变化产出 <dir>/SYNC.md。
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');

// ---------- 参数 ----------
function parseArgs(argv) {
	const out = {};
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === '--config') out.config = argv[++i];
	}
	if (!out.config) {
		console.error('usage: node scripts/new-en-mirror.cjs --config scripts/en-mirrors/<site>.json');
		process.exit(1);
	}
	return out;
}

function loadConfig(p) {
	const abs = path.resolve(REPO_ROOT, p);
	if (!fs.existsSync(abs)) fail(`config not found: ${p}`);
	const c = JSON.parse(fs.readFileSync(abs, 'utf8'));
	for (const k of ['repo', 'dir', 'slug', 'title', 'since']) {
		if (!c[k]) fail(`config missing field "${k}" in ${p}`);
	}
	c.mappings = c.mappings || {};
	return c;
}

function fail(msg) {
	console.error(`new-en-mirror: ${msg}`);
	process.exit(1);
}

function git(args, cwd) {
	return execSync(`git ${args}`, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
}

// ---------- clone（完整 clone，需要历史做变化检测） ----------
function cloneUpstream(config) {
	const tmp = path.join(os.tmpdir(), `new-en-mirror-${config.dir}-${process.pid}`);
	if (fs.existsSync(tmp)) fs.rmSync(tmp, { recursive: true });
	console.log(`cloning ${config.repo} (full history) …`);
	execSync(`git clone --quiet ${config.repo} ${JSON.stringify(tmp)}`, { stdio: 'inherit' });
	return tmp;
}

// ---------- 快照基线定位 ----------
// snapshot.json 存在 → 用其中的 commit；否则用 --until=<since> 在默认分支上找最后一个 commit。
function baselineCommit(config, workdir, siteDir) {
	const snap = path.join(siteDir, 'snapshot.json');
	if (fs.existsSync(snap)) {
		const prev = JSON.parse(fs.readFileSync(snap, 'utf8'));
		if (prev.commit) return { commit: prev.commit, source: 'snapshot.json', prev };
	}
	const until = `${config.since}T23:59:59Z`;
	let sha;
	try {
		sha = git(`log -1 --format=%H --until=${until}`, workdir);
	} catch {
		sha = '';
	}
	if (!sha) fail(`no commit found before since=${config.since} in ${config.repo}`);
	return { commit: sha, source: 'since', prev: null };
}

// ---------- 主流程（本任务到打印为止） ----------
function main() {
	const { config: configArg } = parseArgs(process.argv.slice(2));
	const config = loadConfig(configArg);
	const siteDir = path.join(REPO_ROOT, config.dir);
	const workdir = cloneUpstream(config);
	const branch = git('rev-parse --abbrev-ref HEAD', workdir);
	const head = git('rev-parse HEAD', workdir);
	const { commit: base, source, prev } = baselineCommit(config, workdir, siteDir);
	console.log(`upstream branch=${branch} HEAD=${head}`);
	console.log(`baseline commit=${base} (from ${source})`);
	console.log(`site dir=${siteDir}${fs.existsSync(siteDir) ? ' (exists)' : ' (new)'}`);
	fs.rmSync(workdir, { recursive: true });
}
main();
