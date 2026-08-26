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
// 以链接所在文件的目录为基准解析 ./ ../ 段后查映射表；映射不到的（如 ../CLAUDE.md、仓库外文件）
// 回退为上游 blob 绝对链接（与中文站处理方式一致）；](docs/) 目录链接回退为上游 tree 链接。
function rewriteLinks(md, fromUpstreamPath, filesByUpstreamPath, config, headSha, warnings, fileLabel, imageAssets) {
	const blobOf = (p) => `${config.repo}/blob/${headSha}/${p}`;
	return md
		.replace(/\]\(([^)#]+?)(#[^)]+)?\)/g, (whole, rawPath, anchor = '') => {
			if (!rawPath || /^(https?:|mailto:|#)/.test(rawPath)) return whole;
			const anchorText = anchor || '';
			// 仓库根绝对路径 ](/docs/foo.md) → 去掉开头 / 按仓库相对处理
			const fromRoot = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
			// 目录链接（无扩展名）：](docs/) / ](.) → 指上游 tree
			if (!/\.[a-z0-9]+$/i.test(fromRoot)) {
				const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromUpstreamPath), fromRoot));
				if (resolved === 'docs' || resolved === '.') return `](${config.repo}/tree/${headSha}/docs)`;
				return whole; // 其他目录链接保持原样（极少）
			}
			if (!/\.(md|svg|png|jpe?g|gif)$/i.test(fromRoot)) return whole; // 非文档/图片资源不重写
			const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromUpstreamPath), fromRoot));
			const mapped = filesByUpstreamPath.get(resolved);
			if (mapped && mapped.endsWith('.md')) {
				// index.md 是站点落地页（根路径），链到 / 而不是 /index/
				const basePath = mapped === 'index.md' ? '' : `/${mapped.replace(/\.md$/, '')}`;
				return `](${basePath}/${anchorText})`;
			}
			if (mapped) return `](/${mapped})`; // 图片等资源 → public/ 根（copyAssets 负责落位）
			// 图片：不在显式映射表也能自动处理——copyAssets 会拷进 public/，这里直接指 /<basename>
			if (/\.(svg|png|jpe?g|gif)$/i.test(resolved)) {
				imageAssets.add(resolved);
				return `](/${path.posix.basename(resolved)})`;
			}
			// 映射不到：仓库内但不在镜像范围（如 ../CLAUDE.md、crates/…）→ 指上游 blob
			warnings.push(`${fileLabel}: ](${rawPath}) not in mirror scope → upstream blob link`);
			return `](${blobOf(resolved)}${anchorText})`;
		});
}

function buildPage({ upstreamPath, raw, config, headSha, filesByUpstreamPath, warnings, imageAssets }) {
	// README → 落地页：title 用 config.title 的产品名部分（README 首个 # 常是「1. Install …」步骤标题），
	// desc 用 config.description（首段常是 <picture> HTML）。
	const fallbackTitle = config.title.replace(/ \(English\)$/, '');
	const title = upstreamPath === 'README.md' ? fallbackTitle : (firstHeading(raw) || path.basename(upstreamPath, path.extname(upstreamPath)));
	const desc = upstreamPath === 'README.md' ? (config.description || '') : firstParagraph(raw);
	const blob = `${config.repo}/blob/${headSha}/${upstreamPath}`;
	const body = rewriteLinks(raw, upstreamPath, filesByUpstreamPath, config, headSha, warnings, upstreamPath, imageAssets);
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

// ---------- 图片资产 ----------
// 从上游拷图片到 public/：rewriteLinks 自动发现的 md 引用（imageAssets，已改写为 /<basename>）
// + HTML 属性形式的引用（<img src=…> / srcset=…，这里改写为 /<basename>）。
function copyAssets(config, workdir, siteDir, mdTexts, warnings) {
	const publicDir = path.join(siteDir, 'public');
	fs.mkdirSync(publicDir, { recursive: true });
	const referenced = new Map(); // upstreamRelPath -> siteBasename
	for (const { file, md } of mdTexts) {
		for (const m of md.matchAll(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)|srcset="([^"]+)"|src="([^"]+)"/g)) {
			const target = (m[1] || m[2] || m[3] || '').trim().split(/\s+/)[0];
			if (!target || /^(https?:|data:|\/)/.test(target)) continue;
			const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), target));
			if (!/\.(svg|png|jpe?g|gif)$/i.test(resolved)) continue;
			const src = path.join(workdir, resolved);
			if (!fs.existsSync(src)) { warnings.push(`${file}: referenced image missing upstream: ${target}`); continue; }
			referenced.set(resolved, path.basename(resolved));
		}
	}
	// HTML 属性里的相对引用改为 /<basename>
	const rewritten = mdTexts.map(({ file, md }) => {
		let out = md;
		for (const [up, base] of referenced) {
			const relFromFile = path.posix.relative(path.posix.dirname(file), up);
			out = out.split(`(${relFromFile}`).join(`(/${base}`);
			out = out.split(`="${relFromFile}`).join(`="/${base}`);
			out = out.split(`(./${relFromFile.replace(/^\.\//, '')}`).join(`(/${base}`);
		}
	return { file, md: out, siteFile: mdTexts.find((t) => t.md === md || t.file === file).siteFile };
	});
	for (const [up, base] of referenced) fs.copyFileSync(path.join(workdir, up), path.join(publicDir, base));
	return { rewritten, copied: [...referenced.keys()] };
}

function sha256(p) {
	return require('crypto').createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

// ---------- 内容全量写入 + snapshot + SYNC ----------
function writeContent(config, workdir, siteDir, head, base, warnings) {
	const files = collectUpstreamFiles(config, workdir);
	const filesByUpstreamPath = new Map();
	for (const f of files) {
		filesByUpstreamPath.set(f.upstreamPath, f.siteFile);
		// README 链到仓库根路径形式 ](/README.md) 的场景
		if (f.upstreamPath === 'README.md') filesByUpstreamPath.set('', 'index.md');
	}
	const docsDir = path.join(siteDir, 'src', 'content', 'docs');
	fs.rmSync(docsDir, { recursive: true, force: true });
	fs.mkdirSync(docsDir, { recursive: true });
	const imageAssets = new Set();
	const mdTexts = files.map((f) => ({
		file: f.upstreamPath,
		siteFile: f.siteFile,
		md: buildPage({ upstreamPath: f.upstreamPath, raw: fs.readFileSync(path.join(workdir, f.upstreamPath), 'utf8'), config, headSha: head, filesByUpstreamPath, warnings, imageAssets }),
	}));
	const { rewritten } = copyAssets(config, workdir, siteDir, mdTexts, warnings, imageAssets);
	for (const { siteFile, md } of rewritten) fs.writeFileSync(path.join(docsDir, siteFile), md, 'utf8');
	// snapshot.json（基线：HEAD + 每文件 sha256）
	const snapFiles = {};
	for (const f of files) snapFiles[f.upstreamPath] = sha256(path.join(workdir, f.upstreamPath));
	fs.writeFileSync(
		path.join(siteDir, 'snapshot.json'),
		JSON.stringify({ commit: head, date: new Date().toISOString().slice(0, 10), files: snapFiles }, null, '\t') + '\n',
		'utf8'
	);
	console.log(`wrote ${rewritten.length} pages to ${path.relative(REPO_ROOT, docsDir)}`);
	// 变化检测 → SYNC.md
	if (base !== head) writeSyncReport(config, workdir, siteDir, base, head, files);
	else console.log('no upstream change since baseline — SYNC.md not written');
	return files;
}

function writeSyncReport(config, workdir, siteDir, base, head, files) {
	const diffs = git(`diff --name-status ${base}..${head} -- README.md docs/`, workdir).split('\n').filter(Boolean);
	const zhDir = path.join(REPO_ROOT, config.dir.replace(/-en$/, '-cn'), 'src', 'content', 'docs');
	const zhFiles = fs.existsSync(zhDir) ? new Set(fs.readdirSync(zhDir)) : null;
	const lines = [
		`# SYNC — ${config.title}`,
		'',
		'上游自基线以来的变化：',
		`- baseline: ${base}`,
		`- current:  ${head}`,
		`- compare:  ${config.repo}/compare/${base.slice(0, 10)}…${head.slice(0, 10)}`,
		'',
		'| 状态 | 上游文件 | 中文对应页 | GitHub diff |',
		'|---|---|---|---|',
	];
	for (const d of diffs) {
		const parts = d.split('\t');
		const status = parts[0];
		const up = parts[parts.length - 1];
		const siteFile = files.find((f) => f.upstreamPath === up)?.siteFile;
		const zhPage = siteFile ? `\`${siteFile}\`${zhFiles && !zhFiles.has(siteFile) ? '（中文站缺此页）' : ''}` : '—';
		lines.push(`| ${status} | \`${up}\` | ${zhPage} | [diff](${config.repo}/compare/${base.slice(0, 10)}…${head.slice(0, 10)}#diff) |`);
	}
	if (!diffs.length) lines.push('（无文件级变化）');
	lines.push('', '---', '', '补译流程：逐行对照上表 diff 链接更新中文站对应页（口径见 GLOSSARY.md），完成后重跑本脚本刷新基线。', '上游删除的文件不自动删中文页——人工决定去留。');
	fs.writeFileSync(path.join(siteDir, 'SYNC.md'), lines.join('\n') + '\n', 'utf8');
	console.log(`SYNC.md written: ${diffs.length} changed file(s) since baseline`);
}

// ---------- sidebar 渲染 ----------
// config.sidebar：[{ label: '组名', slugs: ['slug', …] }]（结构对齐中文站）。
// 每条 label 从 EN 站 md 的 frontmatter title 自动提取——上游改标题后重跑即跟。
// 校验：sidebar 引用的 slug 必须存在；内容目录里不在任何组的页报警（不阻塞）。
function renderSidebarJS(config, docsDir, warnings) {
	if (!config.sidebar) {
		return `\t\t\t// 不配 sidebar：Starlight 默认按文件字母序自动生成全部条目。\n\t\t\t// autogenerate 只支持具名子目录，指向根目录（''/'.'）会静默生成空 sidebar。`;
	}
	const titleOf = (slug) => {
		const p = path.join(docsDir, `${slug}.md`);
		if (!fs.existsSync(p)) return null;
		const m = fs.readFileSync(p, 'utf8').match(/^title: "(.*)"$/m);
		return m ? m[1] : null;
	};
	const grouped = new Set();
	const groupsJS = config.sidebar.map((g) => {
		const items = g.slugs.map((slug) => {
			const t = titleOf(slug);
			if (t === null) fail(`sidebar slug not found in content: "${slug}" (group "${g.label}") — 更新 en-mirrors 配置的 sidebar`);
			grouped.add(slug);
			return `\t\t\t\t\t{ label: ${JSON.stringify(t)}, slug: '${slug}' },`;
		}).join('\n');
		return `\t\t\t\t{\n\t\t\t\t\tlabel: ${JSON.stringify(g.label)},\n\t\t\t\t\titems: [\n${items}\n\t\t\t\t\t],\n\t\t\t\t},`;
	}).join('\n');
	// 未分组的页报警
	const all = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
	for (const s of all) if (!grouped.has(s)) warnings.push(`page "${s}" not in any sidebar group — add to config sidebar or it won't appear`);
	return `\t\t\tsidebar: [\n${groupsJS}\n\t\t\t],`;
}

// ---------- 脚手架（仅首次，存在即跳过） ----------
function renderAstroConfig(config, siteDir, warnings) {
	const astroConfig = `// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// ${config.title} — unofficial English mirror of ${config.repo}
// Generated by scripts/new-en-mirror.cjs — do not edit by hand; re-run to refresh.
export default defineConfig({
	site: undefined,
	base: process.env.DOCS_BASE || '/',
	integrations: [
		starlight({
			title: ${JSON.stringify(config.title)},
			description: ${JSON.stringify(config.description || '')},
			defaultLocale: 'root',
			locales: { root: { label: 'English', lang: 'en' } },
			social: [{ icon: 'github', label: 'GitHub', href: ${JSON.stringify(config.repo)} }],
			favicon: '/logo-light.png',
${renderSidebarJS(config, path.join(siteDir, 'src', 'content', 'docs'), warnings)}
		}),
	],
});
`;
	fs.writeFileSync(path.join(siteDir, 'astro.config.mjs'), astroConfig, 'utf8');
}

function scaffold(config, siteDir, head, configPath) {
	const made = [];
	const today = new Date().toISOString().slice(0, 10);
	const writeIfAbsent = (rel, content) => {
		const p = path.join(siteDir, rel);
		if (fs.existsSync(p)) return;
		fs.mkdirSync(path.dirname(p), { recursive: true });
		fs.writeFileSync(p, content, 'utf8');
		made.push(rel);
	};
	writeIfAbsent('package.json', JSON.stringify({
		name: config.dir,
		type: 'module',
		version: '0.1.0',
		scripts: { dev: 'astro dev', start: 'astro dev', build: 'astro build', preview: 'astro preview', astro: 'astro' },
		dependencies: { '@astrojs/starlight': '^0.41.7', astro: '^7.1.6', sharp: '^0.35.3' },
		engines: { node: '>=22.12.0', npm: '>=9.6.5' },
	}, null, '\t') + '\n');
	// astro.config.mjs：无 sidebar 配置 → 仅首次生成（Starlight 默认字母序 sidebar）；
	// 有 sidebar 配置 → main() 在内容落位后经 renderAstroConfig 每次重渲染。
	if (!config.sidebar) {
		renderAstroConfig(config, siteDir, []);
		made.push('astro.config.mjs');
	}
	writeIfAbsent('src/content.config.ts', `import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
`);
	writeIfAbsent('src/styles/theme.css', `/* ${config.title} — default Starlight typography (no CJK fallback needed) */\n`);
	writeIfAbsent('README.md', `# ${config.title}

Unofficial English mirror of [${config.repo}](${config.repo}). The upstream repo ships markdown only (no docs site) — this site renders that markdown with Starlight.

- Snapshot: \`${head}\` (${today}) — see \`snapshot.json\`
- 每页页首横幅与 frontmatter \`source\` 指向上游源文件（含快照 commit SHA）。

## 刷新（上游有更新时）

\`\`\`bash
node scripts/new-en-mirror.cjs --config ${configPath}
\`\`\`

内容目录 \`src/content/docs/\` 是上游的镜子——勿手改，重跑脚本全量覆盖；脚手架文件（本文件、astro.config.mjs 等）可手调。
上游有变化时会产出/更新 \`SYNC.md\`（中文站补译工单）。

## 本地运行

\`\`\`bash
npm install
npm run dev     # http://localhost:4321
\`\`\`
`);
	writeIfAbsent('.gitignore', 'node_modules/\ndist/\n');
	console.log(made.length ? `scaffolded: ${made.join(', ')}` : 'scaffold: all files present, skipped');
}

// ---------- 主流程 ----------
function main() {
	const { config: configArg } = parseArgs(process.argv.slice(2));
	const config = loadConfig(configArg);
	const siteDir = path.join(REPO_ROOT, config.dir);
	const workdir = cloneUpstream(config);
	const branch = git('rev-parse --abbrev-ref HEAD', workdir);
	const head = git('rev-parse HEAD', workdir);
	const { commit: base } = baselineCommit(config, workdir, siteDir);
	console.log(`upstream branch=${branch} HEAD=${head}`);
	console.log(`baseline commit=${base}`);
	console.log(`site dir=${siteDir}${fs.existsSync(siteDir) ? ' (exists)' : ' (new)'}`);
	const warnings = [];
	scaffold(config, siteDir, head, configArg);
	const files = writeContent(config, workdir, siteDir, head, base, warnings);
	// sidebar 配置存在时，内容落位后重渲染 astro.config.mjs（label 从刚写入的 md title 提取）
	if (config.sidebar) {
		const cfgPath = path.join(siteDir, 'astro.config.mjs');
		const before = fs.existsSync(cfgPath) ? fs.readFileSync(cfgPath, 'utf8') : '';
		renderAstroConfig(config, siteDir, warnings);
		const after = fs.readFileSync(cfgPath, 'utf8');
		if (before !== after) console.log('astro.config.mjs: sidebar regenerated');
	}
	// 与中文站文件名对齐报告
	const zhDir = path.join(REPO_ROOT, config.dir.replace(/-en$/, '-cn'), 'src', 'content', 'docs');
	if (fs.existsSync(zhDir)) {
		const zhSet = new Set(fs.readdirSync(zhDir));
		const missing = files.map((f) => f.siteFile).filter((f) => !zhSet.has(f));
		const extra = [...zhSet].filter((f) => !files.some((x) => x.siteFile === f));
		console.log(missing.length || extra.length ? 'align report vs CN site: MISMATCH' : 'align report vs CN site: EXACT MATCH');
		missing.forEach((f) => console.log('  EN-only:', f));
		extra.forEach((f) => console.log('  CN-only:', f));
	}
	if (warnings.length) {
		console.log(`\nwarnings (${warnings.length}):`);
		warnings.forEach((w) => console.log(' ', w));
	}
	fs.rmSync(workdir, { recursive: true });
}
main();
