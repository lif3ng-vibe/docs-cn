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

// ---------- 抽取清单 ----------
// 默认规则：README.md → index.md；docs/*.md → 同名拍平。mappings 字段显式覆盖（键=上游路径，值=站内文件名）。
function collectUpstreamFiles(config, workdir) {
	const out = [];
	const explicit = new Map(Object.entries(config.mappings));
	// 显式映射优先，校验存在性
	for (const [up, site] of explicit) {
		if (!fs.existsSync(path.join(workdir, up))) fail(`mapping source not found in upstream: ${up}`);
		out.push({ upstreamPath: up, siteFile: site });
	}
	if (!fs.existsSync(path.join(workdir, 'docs'))) fail(`upstream has no docs/ directory — not suitable for this flow: ${config.repo}`);
	const docsDir = path.join(workdir, 'docs');
	for (const f of fs.readdirSync(docsDir)) {
		if (!f.endsWith('.md')) continue;
		if ([...explicit.values()].includes(f)) continue; // 被显式映射占用（如 auto-improve-eval.md）
		if (explicit.has(`docs/${f}`)) continue; // 同路径已有显式规则
		out.push({ upstreamPath: `docs/${f}`, siteFile: f });
	}
	if (!out.some((x) => x.siteFile === 'index.md')) fail('no README mapping — mappings must map README.md to index.md');
	if (out.length === 0) fail('no markdown files collected — upstream layout not recognized');
	return out;
}

// ---------- 页面生成 ----------
function firstHeading(text) {
	const m = text.match(/^#\s+(.+)$/m);
	return m ? m[1].trim() : null;
}
function stripMd(s) {
	return s
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/[*_`]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}
function firstParagraph(text) {
	const lines = text.split('\n');
	let inCode = false;
	const out = [];
	for (const line of lines) {
		if (line.trim().startsWith('```')) { inCode = !inCode; continue; }
		if (inCode) continue;
		if (line.startsWith('#') || line.startsWith('>') || line.startsWith('|') || line.startsWith('![')) continue;
		if (!line.trim()) { if (out.length) break; continue; }
		if (line.trim().startsWith('- ') || /^\s/.test(line)) { if (out.length) break; continue; }
		out.push(line.trim());
	}
	return stripMd(out.join(' ')).slice(0, 180);
}

// 站内相对链接重写：](docs/foo.md) / ](../foo.md) / ](README.md#anchor) → ](/foo/)
// 以链接所在文件的目录为基准解析 ./ ../ 段后查映射表；映射不到的保留原样并进 warnings。
function rewriteLinks(md, fromUpstreamPath, filesByUpstreamPath, warnings, fileLabel) {
	return md.replace(/\]\(([^)]+)\)/g, (whole, target) => {
		if (/^(https?:|mailto:|#)/.test(target)) return whole; // 外部/锚点
		if (target.startsWith('/')) return whole; // 上游仓库根绝对路径，下面统一处理
		const linkPath = target.split('#')[0];
		if (!linkPath || !/\.(md|svg|png|jpe?g|gif)$/i.test(linkPath)) return whole; // 目录链接/其他交给后续处理
		const anchor = target.includes('#') ? target.slice(target.indexOf('#')) : '';
		const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromUpstreamPath), linkPath));
		const mapped = filesByUpstreamPath.get(resolved);
		if (mapped && mapped.endsWith('.md')) return `](/${mapped.replace(/\.md$/, '')}/${anchor})`;
		if (mapped) return `](/${mapped})`; // 图片等资源 → public/ 根（copyAssets 负责落位）
		warnings.push(`${fileLabel}: unmapped link ](${target}) kept as-is`);
		return whole;
	}).replace(/\]\((\/[^)#]*?)\)/g, (whole, target) => {
		// 上游仓库根绝对路径 ](/docs/foo.md) / ](/README.md) 也按映射重写为站内路径
		if (target === '/') return whole;
		const anchor = '';
		const mapped = filesByUpstreamPath.get(target.replace(/^\//, ''));
		if (mapped && mapped.endsWith('.md')) return `](/${mapped.replace(/\.md$/, '')}/${anchor})`;
		if (mapped) return `](/${mapped})`;
		return whole;
	});
}

function buildPage({ upstreamPath, raw, config, headSha, filesByUpstreamPath, warnings }) {
	const title = firstHeading(raw) || path.basename(upstreamPath, path.extname(upstreamPath));
	const desc = firstParagraph(raw);
	const blob = `${config.repo}/blob/${headSha}/${upstreamPath}`;
	const body = rewriteLinks(raw, upstreamPath, filesByUpstreamPath, warnings, upstreamPath);
	const fm = [
		'---',
		`title: "${title.replace(/"/g, '\\"')}"`,
		`description: "${desc.replace(/"/g, '\\"')}"`,
		`source: "${blob}"`,
		'---',
		'',
	].join('\n');
	const banner = [
		':::note[Unofficial mirror]',
		`This is an unofficial documentation mirror. [View the source on GitHub](${blob}) · [Upstream repo](${config.repo})`,
		':::',
		'',
	].join('\n');
	return fm + banner + body;
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
