#!/usr/bin/env node
'use strict';
/**
 * build.cjs — 本地构建入口：入口页 / 指定子站 / 全部，一了个脚本。
 *
 *   node scripts/build.cjs                # = all
 *   node scripts/build.cjs index          # 只生成入口页（sites.json → index.html）
 *   node scripts/build.cjs <slug> [...]   # 构建指定子站（可多个，slug 见 list）
 *   node scripts/build.cjs all            # 全部子站 + 入口页
 *   node scripts/build.cjs list           # 列出全部 slug / 构建类型 / 产物位置
 *
 * 口径：本地构建不带 /docs-cn/ 前缀（根相对路径，直接 dev/preview）；
 * 部署前缀、md 内链 sed、_site 组装是 CI（deploy-pages.yml）的事，本脚本不碰。
 * 产物留在各子站目录内（dist/、build/ 或 out/），不移动。
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IS_WIN = process.platform === 'win32';

// slug → 构建配方（顺序即 all 的构建顺序）。type：
//   npm      —— npm run build（Starlight / Astro / Docusaurus 常规站）
//   pnpm     —— pnpm monorepo：pnpm install 后逐 filter 构建，产物在 out（repo 相对路径）
//   mintlify —— npx mintlify export 出 export.zip 后解压到 dist/（本地跳过 CI 的前缀步骤）
//   ci-only  —— 需要 CI 凭据，本地不可构建
//   collect  —— 无构建系统，静态目录即产物，无需构建
const SITES = [
	{ slug: 'codegraph', dir: 'codegraph-docs-cn', type: 'npm', out: 'dist' },
	{ slug: 'orca', dir: 'orca-docs-cn', type: 'npm', out: 'dist' },
	{ slug: 'mattpocock-skills', dir: 'mattpocock-skills-docs-cn', type: 'npm', out: 'dist' },
	{ slug: 'agency-agents', dir: 'agency-agents-docs-cn', type: 'npm', out: 'dist' },
	{ slug: 'agency-agents-en', dir: 'agency-agents-docs-en', type: 'npm', out: 'dist' },
	{ slug: 'ai-coding-dictionary', dir: 'ai-coding-dictionary-docs-cn', type: 'npm', out: 'dist' },
	{ slug: 'ai-memory', dir: 'ai-memory-docs-cn', type: 'npm', out: 'dist' },
	{ slug: 'ai-memory-en', dir: 'ai-memory-docs-en', type: 'npm', out: 'dist' },
	{ slug: 'openrig', dir: 'openrig-docs-cn', type: 'npm', out: 'dist' },
	{ slug: 'openrig-en', dir: 'openrig-docs-en', type: 'npm', out: 'dist' },
	{ slug: 'openshell', dir: 'openshell-docs-cn', type: 'npm', out: 'dist' },
	{ slug: 'tailscale', dir: 'tailscale-docs-cn', type: 'npm', out: 'dist' },
	{ slug: 'agent-skills', dir: 'agent-skills-docs-cn', type: 'npm', out: 'dist' },
	// Docusaurus 大构建，与 CI 同款显式堆上限
	{ slug: 'litellm', dir: 'litellm-docs-cn', type: 'npm', out: 'build', env: { NODE_OPTIONS: '--max-old-space-size=6144' } },
	{ slug: 'impeccable', dir: 'impeccable-docs-cn', type: 'npm', out: 'build' },
	{ slug: 'ai-sdk', dir: 'ai-sdk-docs-cn', type: 'pnpm', filters: ['ai-sdk-docs'], out: 'apps/docs/out' },
	{ slug: 'nimbus', dir: 'nimbus-docs-cn', type: 'pnpm', filters: ['@cloudflare/nimbus-docs', '@nimbus/www'], out: 'apps/www/dist' },
	// openship 的部署前缀由 NEXT_BASE_PATH/NEXT_PUBLIC_SITE_URL 注入，本地构建不设（根相对预览）
	{ slug: 'openship', dir: 'openship-docs-cn', type: 'pnpm', filters: ['@repo/web'], out: 'apps/web/out', env: { NEXT_OUTPUT: 'export' } },
	{ slug: 'claude-mem', dir: 'claude-mem-docs-cn', type: 'mintlify', out: 'dist' },
	{ slug: 'pi', dir: 'pi-docs-cn', type: 'mintlify', out: 'dist', post: ['pagefind', 'theme'] },
	{ slug: 'tester-army-e2e', dir: 'tester-army-e2e-docs-cn', type: 'ci-only', why: 'Mintlify 登录式导出需要 repo secret MINT_CONFIG，仅 CI 可构建' },
	{ slug: 'impeccable-mirror', dir: 'impeccable-mirror-cn', type: 'collect', out: 'site' },
];

function run(cmd, args, opts) {
	const where = opts.cwd ? `  (${path.relative(ROOT, opts.cwd)})` : '';
	console.log(`\n$ ${cmd} ${args.join(' ')}${where}`);
	const r = spawnSync(cmd, args, {
		cwd: opts.cwd,
		env: { ...process.env, ...(opts.env || {}) },
		stdio: 'inherit',
		shell: true,
	});
	if (r.status !== 0) {
		throw new Error(`命令失败（exit ${r.status}）：${cmd} ${args.join(' ')}`);
	}
}

function siteDir(site) {
	return path.join(ROOT, site.dir);
}

function ensureInstall(site) {
	if (!fs.existsSync(path.join(siteDir(site), 'node_modules'))) {
		console.log(`${site.dir} 缺 node_modules，先 npm install…`);
		run('npm', ['install'], { cwd: siteDir(site) });
	}
}

function buildNpm(site) {
	ensureInstall(site);
	run('npm', ['run', 'build'], { cwd: siteDir(site), env: site.env });
}

function buildPnpm(site) {
	if (site.env) {
		for (const [k, v] of Object.entries(site.env)) console.log(`  env ${k}=${v}`);
	}
	run('corepack', ['enable']);
	run('pnpm', ['install', '--frozen-lockfile'], { cwd: siteDir(site) });
	for (const f of site.filters) {
		run('pnpm', ['--filter', f, 'build'], { cwd: siteDir(site) });
	}
	console.log(`产物：${site.dir}/${site.out}/`);
}

function buildMintlify(site) {
	const cwd = siteDir(site);
	// export 会把项目根散文件复制进渲染客户端 public，先清旧产物（同 CI 口径）
	fs.rmSync(path.join(cwd, 'dist'), { recursive: true, force: true });
	fs.rmSync(path.join(cwd, 'export.zip'), { force: true });
	run('npx', ['mintlify', 'export', '--disable-openapi'], { cwd });
	// 解压：Windows 用 PowerShell Expand-Archive，其余用 unzip
	if (IS_WIN) {
		run('powershell', [
			'-NoProfile', '-Command',
			'Expand-Archive -Path export.zip -DestinationPath dist -Force',
		], { cwd });
	} else {
		fs.mkdirSync(path.join(cwd, 'dist'), { recursive: true });
		run('unzip', ['-qo', 'export.zip', '-d', 'dist'], { cwd });
	}
	fs.rmSync(path.join(cwd, 'export.zip'), { force: true });
	if ((site.post || []).includes('pagefind')) {
		run('npx', ['pagefind', '--site', 'dist'], { cwd });
	}
	if ((site.post || []).includes('theme')) {
		run('node', ['scripts/inject-theme.mjs'], { cwd });
	}
	console.log('注：本地产物为根相对路径；/docs-cn/ 前缀改写（prefix-dist）由 CI 部署时执行。');
}

function buildOne(site) {
	console.log(`\n=== ${site.slug} → ${site.dir}/ [${site.type}] ===`);
	switch (site.type) {
		case 'npm':
			return buildNpm(site);
		case 'pnpm':
			return buildPnpm(site);
		case 'mintlify':
			return buildMintlify(site);
		case 'ci-only':
			console.log(`跳过：${site.why}`);
			return false;
		case 'collect':
			console.log(`无需构建：静态产物即 ${site.dir}/${site.out}/`);
			return false;
		default:
			throw new Error(`未知构建类型：${site.type}`);
	}
}

function genIndex() {
	run(process.execPath, [path.join(__dirname, 'gen-index.cjs')], { cwd: ROOT });
}

function listSites() {
	console.log('slug                   类型      产物');
	console.log('-'.repeat(60));
	for (const s of SITES) {
		const out = s.type === 'ci-only' ? `（仅 CI：${s.why}）` : `${s.dir}/${s.out || ''}/`;
		console.log(`${s.slug.padEnd(22)} ${s.type.padEnd(9)} ${out}`);
	}
}

function main() {
	const argv = process.argv.slice(2);
	const cmd = argv[0] || 'all';

	if (cmd === 'list') {
		listSites();
		return;
	}
	if (cmd === 'index') {
		genIndex();
		return;
	}
	if (cmd === 'all') {
		let built = 0;
		for (const site of SITES) {
			if (buildOne(site) !== false) built++;
		}
		genIndex();
		console.log(`\n完成：${built} 个子站构建 + 入口页生成（ci-only/collect 项已跳过）。`);
		return;
	}

	// 其余参数按 slug 处理（可多个）
	const bySlug = new Map(SITES.map((s) => [s.slug, s]));
	const unknown = argv.filter((a) => !bySlug.has(a));
	if (unknown.length) {
		console.error(`未知 slug：${unknown.join(', ')}（合法值见 node scripts/build.cjs list）`);
		process.exit(2);
	}
	for (const slug of argv) {
		buildOne(bySlug.get(slug));
	}
}

try {
	main();
} catch (e) {
	console.error(`\n构建失败：${e.message}`);
	process.exit(1);
}
