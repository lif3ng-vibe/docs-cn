# 英文镜像站 new-en-mirror 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 写一个通用脚本 `scripts/new-en-mirror.cjs`，对「上游只有 markdown、无文档网站」的仓库一键生成英文 Starlight 镜像站（首例 ai-memory → `ai-memory-docs-en/`），每页指回原 GitHub 仓库，重跑可 diff 上游变化产出补译工单。

**Architecture:** 单文件 Node 脚本（零第三方依赖）读每站一份配置 JSON（`scripts/en-mirrors/*.json`），git clone 上游后按映射表抽取 markdown、生成 frontmatter+横幅、脚手架（仅首次）、记录 snapshot 基线、产出 SYNC.md。部署沿用仓库现有 `deploy-pages.yml` 模式。

**Tech Stack:** Node ≥ 22（`.cjs`，`execSync` 调系统 git）、Astro + Starlight（与现有 `*-docs-cn` 站同版本：`@astrojs/starlight ^0.41.7`、`astro ^7.1.6`、`sharp ^0.35.3`）。

## Global Constraints

- 仓库根：`C:\Users\lif3n\src\docs`（bash 路径 `/c/Users/lif3n/src/docs`，下文相对路径均基于仓库根）。
- Node ≥ 22.12，npm ≥ 9.6.5；脚本零第三方依赖。
- 内容文件（`src/content/docs/*.md`、`public/`）每次重跑全量覆盖；脚手架文件（`package.json`、`astro.config.mjs`、`src/content.config.ts`、`src/styles/theme.css`、站内 `README.md`）仅首次生成，存在即跳过。
- 英文站每页 URL 必须与中文站同 slug（文件名相同即自动满足，含 Astro 去点行为 `v0.3-roadmap.md → v03-roadmap`）。
- frontmatter `source` 带快照 commit SHA（`<repo>/blob/<sha>/<path>`），不用 `main`。
- 每页页首注入 `:::note[Unofficial mirror]` 横幅，含该页 blob 链接与仓库链接。
- fail-fast：任何输入异常直接报错退出，不静默降级。
- git commit 不加 Co-Authored-By（用户全局规则）。
- 上游仓库：`https://github.com/akitaonrails/ai-memory`；中文站快照日期 2026-08-21（sites.json / 主 README 表格口径）。
- 部署 slug：`ai-memory-en`（线上 `https://lif3ng-vibe.github.io/docs-cn/ai-memory-en/`）。

---

### Task 1: 配置文件 + 脚本骨架（参数解析、clone、快照 commit 定位）

**Files:**
- Create: `scripts/en-mirrors/ai-memory.json`
- Create: `scripts/new-en-mirror.cjs`

**Interfaces:**
- Produces: `loadConfig(configPath) → {repo, dir, slug, title, since, mappings, branch}`（脚本内部函数）；配置 JSON schema（后续新站照抄）。

- [ ] **Step 1: 写配置文件**

`scripts/en-mirrors/ai-memory.json`：

```json
{
	"repo": "https://github.com/akitaonrails/ai-memory",
	"dir": "ai-memory-docs-en",
	"slug": "ai-memory-en",
	"title": "ai-memory Docs (English)",
	"description": "Unofficial English mirror of the ai-memory docs. Long-term memory for AI coding agents.",
	"since": "2026-08-21",
	"mappings": {
		"README.md": "index.md",
		"docs/examples/auto-improve-eval/README.md": "auto-improve-eval.md"
	}
}
```

- [ ] **Step 2: 写脚本骨架（解析、clone、定位快照 commit）**

`scripts/new-en-mirror.cjs`（本任务先到「打印 HEAD/快照 commit」为止）：

```js
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
```

- [ ] **Step 3: 跑骨架验证**

Run: `node scripts/new-en-mirror.cjs --config scripts/en-mirrors/ai-memory.json`
Expected: 打印 `upstream branch=main HEAD=c304ff6…`（当前上游 HEAD）、`baseline commit=… (from since)`、`site dir=…ai-memory-docs-en (new)` 后退出。

- [ ] **Step 4: Commit**

```bash
git add scripts/en-mirrors/ai-memory.json scripts/new-en-mirror.cjs
git commit -m "feat(en-mirror): new-en-mirror 脚本骨架——配置解析/完整 clone/since 快照基线定位"
```

---

### Task 2: 文件抽取、映射与 frontmatter/横幅生成

**Files:**
- Modify: `scripts/new-en-mirror.cjs`

**Interfaces:**
- Consumes: Task 1 的 `config`、`workdir`、`git()`。
- Produces: `collectUpstreamFiles(config, workdir) → [{upstreamPath, siteFile}]`；`buildPage({upstreamPath, siteFile, raw, config, headSha}) → string`（完整 md：frontmatter + 横幅 + 正文，站内链接已重写）。

- [ ] **Step 1: 实现映射收集**

在 `main()` 前插入：

```js
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
```

- [ ] **Step 2: 实现 frontmatter + 横幅 + 链接重写**

```js
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
// 映射不到的保留原样并进 warnings。
function rewriteLinks(md, filesByUpstreamPath, warnings, fileLabel) {
	return md.replace(/\]\(([^)]+)\)/g, (whole, target) => {
		if (/^(https?:|mailto:|#|\/)/.test(target)) return whole; // 绝对/锚点/已是站内绝对路径
		const linkPath = target.split('#')[0];
		if (!linkPath || !/\.(md|svg|png|jpe?g|gif)$/i.test(linkPath)) return whole; // 目录链接/其他交给 Starlight
		const anchor = target.includes('#') ? target.slice(target.indexOf('#')) : '';
		const mapped = filesByUpstreamPath.get(linkPath) || filesByUpstreamPath.get(linkPath.replace(/^\.\//, ''));
		if (mapped) return `](/${mapped.replace(/\.md$/, '')}/${anchor})`;
		warnings.push(`${fileLabel}: unmapped link ](${target}) kept as-is`);
		return whole;
	});
}

function buildPage({ upstreamPath, raw, config, headSha, filesByUpstreamPath, warnings }) {
	const title = firstHeading(raw) || path.basename(upstreamPath, path.extname(upstreamPath));
	const desc = firstParagraph(raw);
	const blob = `${config.repo}/blob/${headSha}/${upstreamPath}`;
	const body = rewriteLinks(raw, filesByUpstreamPath, warnings, upstreamPath);
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
```

注意：`rewriteLinks` 的相对链接解析以 docs/ 为基准是简化（上游文档内的 `](docs/foo.md)` 从 README 出发、`](../foo.md)` 从 docs/ 出发）。实现时对每个文件以其自身目录为基准解析 `./`、`../` 段后再查映射表——若实现中发现歧义，以「查得到映射就重写，查不到就告警保留」为准，不追求完美解析。

- [ ] **Step 3: 验证（node -e 冒烟）**

Run:
```bash
node -e "
const m = require('fs').readFileSync('scripts/new-en-mirror.cjs','utf8');
new Function(m.replace(/main\(\);$/, '')); // 语法检查
console.log('syntax OK')"
```
Expected: `syntax OK`（`main()` 尚未调用新函数，下一任务接线）。

- [ ] **Step 4: Commit**

```bash
git add scripts/new-en-mirror.cjs
git commit -m "feat(en-mirror): 抽取映射/frontmatter+Unofficial mirror 横幅/站内链接重写"
```

---

### Task 3: 图片拷贝、内容全量写入、snapshot.json、SYNC.md

**Files:**
- Modify: `scripts/new-en-mirror.cjs`

**Interfaces:**
- Consumes: Task 2 的 `collectUpstreamFiles`、`buildPage`。
- Produces: `main()` 完整落地——`<dir>/src/content/docs/*.md`、`<dir>/public/*`、`<dir>/snapshot.json`、`<dir>/SYNC.md`（有变化时）；`copyAssets(config, workdir, mdTexts, warnings)`。

- [ ] **Step 1: 实现图片拷贝**

```js
// ---------- 图片资产 ----------
// 扫描镜像 md 里的本地图片引用（相对路径），从上游拷到 public/ 并把引用改写为 /<basename>。
function copyAssets(config, workdir, siteDir, mdTexts, warnings) {
	const publicDir = path.join(siteDir, 'public');
	fs.mkdirSync(publicDir, { recursive: true });
	const referenced = new Map(); // upstreamRelPath -> siteBasename
	for (const { file, md } of mdTexts) {
		for (const m of md.matchAll(/!\[[^\]]*\]\(([^)]+)\)|srcset="([^"]+)"|src="([^"]+)"/g)) {
			const target = (m[1] || m[2] || m[3] || '').trim().split(/\s+/)[0];
			if (!target || /^(https?:|data:|\/)/.test(target)) continue;
			const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), target));
			if (!/\.(svg|png|jpe?g|gif)$/i.test(resolved)) continue;
			const src = path.join(workdir, resolved);
			if (!fs.existsSync(src)) { warnings.push(`${file}: referenced image missing upstream: ${target}`); continue; }
			referenced.set(resolved, path.basename(resolved));
		}
	}
	const rewritten = mdTexts.map(({ file, md }) => {
		let out = md;
		for (const [up, base] of referenced) {
			// 引用处按文件重算相对路径再替换，这里简单全局替换 basename 引用（上游文档图片引用均为仓库相对路径）
			out = out.split(`(${up}`).join(`(/${base}`);
			out = out.split(`(${path.posix.basename(up)}`).join(`(/${base}`);
		}
		return { file, md: out };
	});
	for (const [up, base] of referenced) fs.copyFileSync(path.join(workdir, up), path.join(publicDir, base));
	return { rewritten, copied: [...referenced.keys()] };
}
```

- [ ] **Step 2: 实现主流程写入 + snapshot + SYNC.md**

把 Task 1 的 `main()` 末尾 `fs.rmSync(workdir, …)` 之前替换为完整流程：

```js
function sha256(p) {
	return require('crypto').createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function writeContent(config, workdir, siteDir, head, base, basePrev, warnings) {
	const files = collectUpstreamFiles(config, workdir);
	const filesByUpstreamPath = new Map();
	for (const f of files) {
		filesByUpstreamPath.set(f.upstreamPath, f.siteFile);
		// 相对 docs/ 内部的 ./ 前缀解析
		filesByUpstreamPath.set(`docs/${path.posix.basename(f.upstreamPath)}`, f.siteFile);
	}
	const docsDir = path.join(siteDir, 'src', 'content', 'docs');
	fs.rmSync(docsDir, { recursive: true, force: true });
	fs.mkdirSync(docsDir, { recursive: true });
	let mdTexts = files.map((f) => ({
		file: f.upstreamPath,
		siteFile: f.siteFile,
		md: buildPage({ upstreamPath: f.upstreamPath, raw: fs.readFileSync(path.join(workdir, f.upstreamPath), 'utf8'), config, headSha: head, filesByUpstreamPath, warnings }),
	}));
	const { rewritten } = copyAssets(config, workdir, siteDir, mdTexts, warnings);
	for (const { siteFile, md } of rewritten) fs.writeFileSync(path.join(docsDir, siteFile), md, 'utf8');
	// snapshot.json
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
	return files;
}

function writeSyncReport(config, workdir, siteDir, base, head, files) {
	const diffs = git(`diff --name-status ${base}..${head} -- README.md docs/`, workdir).split('\n').filter(Boolean);
	const zhDir = path.join(REPO_ROOT, config.dir.replace(/-en$/, '-cn'), 'src', 'content', 'docs');
	const zhFiles = fs.existsSync(zhDir) ? new Set(fs.readdirSync(zhDir)) : null;
	const lines = [
		`# SYNC — ${config.title}`,
		'',
		`上游自基线以来有变化：`,
		`- baseline: ${base}`,
		`- current:  ${head}`,
		`- compare:  ${config.repo}/compare/${base.slice(0, 10)}…${head.slice(0, 10)}`,
		'',
		'| 状态 | 上游文件 | 中文对应页 | GitHub diff |',
		'|---|---|---|---|',
	];
	for (const d of diffs) {
		const [status, ...rest] = d.split('\t');
		const up = rest[rest.length - 1];
		const siteFile = files.find((f) => f.upstreamPath === up)?.siteFile;
		const zhPage = siteFile ? `\`${siteFile}\`${zhFiles && !zhFiles.has(siteFile) ? '（中文站缺此页）' : ''}` : '—';
		lines.push(`| ${status} | \`${up}\` | ${zhPage} | [diff](${config.repo}/compare/${base}..${head}#${encodeURI(up)}) |`);
	}
	if (!diffs.length) lines.push('（无文件级变化）');
	lines.push('', '---', '', '补译流程：逐行对照上表 diff 链接更新中文站对应页（口径见 GLOSSARY.md），完成后重跑本脚本刷新基线。', '上游删除的文件不自动删中文页——人工决定去留。');
	fs.writeFileSync(path.join(siteDir, 'SYNC.md'), lines.join('\n') + '\n', 'utf8');
	console.log(`SYNC.md written: ${diffs.length} changed file(s) since baseline`);
}

// main() 内替换：
//   const files = writeContent(config, workdir, siteDir, head, base, prev, warnings);
//   const zhDir = path.join(REPO_ROOT, config.dir.replace(/-en$/, '-cn'), 'src', 'content', 'docs');
//   if (fs.existsSync(zhDir)) {
//     const zhSet = new Set(fs.readdirSync(zhDir));
//     const missing = files.map(f => f.siteFile).filter(f => !zhSet.has(f));
//     const extra = [...zhSet].filter(f => !files.some(x => x.siteFile === f));
//     console.log('align report vs CN site:', missing.length || extra.length ? '' : 'EXACT MATCH');
//     missing.forEach(f => console.log('  EN-only:', f));
//     extra.forEach(f => console.log('  CN-only:', f));
//   }
//   if (warnings.length) { console.log('\nwarnings:'); warnings.forEach(w => console.log(' ', w)); }
//   fs.rmSync(workdir, { recursive: true });
```

- [ ] **Step 3: 跑首跑验证（此时站还没有脚手架，但内容先落位）**

Run: `node scripts/new-en-mirror.cjs --config scripts/en-mirrors/ai-memory.json`
Expected:
- `wrote 36 pages to ai-memory-docs-en\src\content\docs`
- `align report vs CN site: EXACT MATCH`（或列出个别差异，需人工核对）
- `SYNC.md written: N changed file(s) since baseline`（N = 上游 2026-08-21 以来变化的文件数）
- `ls ai-memory-docs-en/src/content/docs | wc -l` → `36`

- [ ] **Step 4: Commit**

```bash
git add scripts/new-en-mirror.cjs ai-memory-docs-en
git commit -m "feat(en-mirror): 内容全量写入+图片拷贝+snapshot 基线+SYNC.md 变化检测"
```

---

### Task 4: 脚手架生成（package.json / astro.config.mjs / content.config.ts / theme.css / README / .gitignore）

**Files:**
- Modify: `scripts/new-en-mirror.cjs`
- Create（由脚本生成）: `ai-memory-docs-en/package.json`、`ai-memory-docs-en/astro.config.mjs`、`ai-memory-docs-en/src/content.config.ts`、`ai-memory-docs-en/src/styles/theme.css`、`ai-memory-docs-en/README.md`、`ai-memory-docs-en/.gitignore`

**Interfaces:**
- Produces: 可 `npm install && npm run build` 的完整 Starlight 站。

- [ ] **Step 1: 实现 scaffold()**

```js
// ---------- 脚手架（仅首次，存在即跳过） ----------
function scaffold(config, siteDir, head) {
	const made = [];
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
	writeIfAbsent('astro.config.mjs', `// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// ${config.title} — unofficial English mirror of ${config.repo}
// Generated by scripts/new-en-mirror.cjs — do not edit content by hand; re-run to refresh.
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
			sidebar: [{ label: 'Docs', autogenerate: { collapsed: false } }],
		}),
	],
});
`);
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

- Snapshot: \`${head}\` ($(date)) — see \`snapshot.json\`
- 每页页首横幅与 frontmatter \`source\` 指向上游源文件（含快照 commit SHA）。

## 刷新（上游有更新时）

\`\`\`bash
node scripts/new-en-mirror.cjs --config scripts/en-mirrors/${path.basename(process.argv[process.argv.indexOf('--config') + 1] || '')}
\`\`\`

内容目录 \`src/content/docs/\` 是上游的镜子——勿手改，重跑脚本全量覆盖；脚手架文件（本文件、astro.config.mjs 等）可手调。

## 本地运行

\`\`\`bash
npm install
npm run dev     # http://localhost:4321
\`\`\`
`);
	writeIfAbsent('.gitignore', 'node_modules/\ndist/\n');
	console.log(made.length ? `scaffolded: ${made.join(', ')}` : 'scaffold: all files present, skipped');
}
```

注意 `README.md` 模板里 `$(date)` 是 bash 惯用占位——实现时改成 JS 的 `new Date().toISOString().slice(0, 10)` 传参进去，不要在模板字符串里留 shell 语法。

- [ ] **Step 2: main() 接线并重跑（验证「脚手架仅首次」）**

main() 中在 `writeContent` 之前调用 `scaffold(config, siteDir, head)`。

Run（连跑两次）:
```bash
node scripts/new-en-mirror.cjs --config scripts/en-mirrors/ai-memory.json
node scripts/new-en-mirror.cjs --config scripts/en-mirrors/ai-memory.json
```
Expected: 第一次 `scaffolded: package.json, astro.config.mjs, …`；第二次 `scaffold: all files present, skipped`；两次都 `wrote 36 pages`。

- [ ] **Step 3: 安装依赖并构建**

Run:
```bash
cd ai-memory-docs-en && npm install && npm run build
```
Expected: `npm install` 生成 lock 文件；`npm run build` 成功产出 `dist/`，36 页 + autogenerate sidebar 无构建错误。

- [ ] **Step 4: 构建后站内链接抽查**

Run:
```bash
node -e "
const fs=require('fs');
const dist='ai-memory-docs-en/dist';
let n=0,bad=0;
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=d+'/'+e.name;
if(e.isDirectory())walk(p);
else if(e.name==='index.html'){n++;const h=fs.readFileSync(p,'utf8');
for(const m of h.matchAll(/href=\"(\/[^\"]*)\"/g)){const t=m[1].split('#')[0];
if(!t||t==='/'||/^(https?:)/.test(t))continue;
if(!fs.existsSync(dist+t)&&!fs.existsSync(dist+t.replace(/\/$/,'/index.html')))bad++;}}}})(dist);
console.log('pages:',n,'broken hrefs:',bad)"
```
Expected: `pages: 36` 左右（含 404 可能 37）、`broken hrefs: 0`。
（broken>0 时检查是 rewriteLinks 漏映射还是图片路径问题，修脚本重跑。）

- [ ] **Step 4b: 手工抽查两页源文件**

Run: `head -12 ai-memory-docs-en/src/content/docs/install.md && head -12 ai-memory-docs-en/src/content/docs/index.md`
Expected: 均以 frontmatter（title/description/source 带 SHA）开头，随后是 `:::note[Unofficial mirror]` 横幅，再接上游正文。

- [ ] **Step 5: Commit**

```bash
git add scripts/new-en-mirror.cjs ai-memory-docs-en
git commit -m "feat(en-mirror): Starlight 脚手架仅首次生成+完整构建通过+链接抽查零断链"
```

---

### Task 5: 入口页与 CI 集成（sites.json lang 字段、gen-index.cjs、deploy-pages.yml）

**Files:**
- Modify: `sites.json`、`scripts/gen-index.cjs`、`.github/workflows/deploy-pages.yml`

**Interfaces:**
- Produces: 英文站出现在入口页（带 English 标签）并随 CI 部署到 `/docs-cn/ai-memory-en/`。

- [ ] **Step 1: sites.json 加英文条目**

在数组末尾追加：

```json
  {
    "name": "ai-memory (English)",
    "slug": "ai-memory-en",
    "desc": "Unofficial English mirror — upstream ships markdown only, rendered with Starlight.",
    "orig": "https://github.com/akitaonrails/ai-memory",
    "lang": "en"
  }
```

- [ ] **Step 2: gen-index.cjs 支持 lang 标签**

`cards` 的 `.name` 行改为：

```js
`<p class="name">${s.name}${s.lang === 'en' ? ' <span class="lang">EN</span>' : ''}</p>`
```

样式块加：

```css
.lang {
	font-size: 0.7rem;
	color: #0969da;
	border: 1px solid #0969da;
	border-radius: 4px;
	padding: 0.05rem 0.35rem;
	vertical-align: middle;
	margin-left: 0.3rem;
	font-weight: 500;
}
```

- [ ] **Step 3: 刷新入口页**

Run: `node scripts/gen-index.cjs`
Expected: `generated index.html with 6 site(s)`；`grep -c 'class="lang"' index.html` → `1`。

- [ ] **Step 4: deploy-pages.yml 加构建段**

npm cache `cache-dependency-path` 列表追加一行：

```yaml
            ai-memory-docs-en/package-lock.json
```

`Build ai-memory-docs-cn` 之后加：

```yaml
      - name: Build ai-memory-docs-en
        working-directory: ai-memory-docs-en
        env:
          DOCS_BASE: /docs-cn/ai-memory-en/
        run: |
          find src/content/docs -name '*.md' -exec sed -i 's|\](/|\](/docs-cn/ai-memory-en/|g' {} +
          npm ci
          npm run build
```

Assemble 步骤加：

```bash
          mv ai-memory-docs-en/dist _site/ai-memory-en
```

- [ ] **Step 5: 本地模拟 CI 前缀构建（验证 sed + DOCS_BASE 生效）**

Run:
```bash
cd ai-memory-docs-en && git stash list >/dev/null 2>&1; cd ..
```
注意：sed 会改工作区文件，先在临时副本验证：
```bash
cp -r ai-memory-docs-en /tmp/en-prefix-test && cd /tmp/en-prefix-test
find src/content/docs -name '*.md' -exec sed -i 's|\](/|\](/docs-cn/ai-memory-en/|g' {} +
DOCS_BASE=/docs-cn/ai-memory-en/ npm ci --no-audit --no-fund && DOCS_BASE=/docs-cn/ai-memory-en/ npm run build
grep -rl 'href="/docs-cn/ai-memory-en/install/' dist/install/index.html
cd - && rm -rf /tmp/en-prefix-test
```
Expected: grep 命中（前缀链接进了产物）；构建成功。
（临时目录验证完删除，工作区源码保持无前缀——sed 只在 CI 里跑。）

- [ ] **Step 6: Commit**

```bash
git add sites.json scripts/gen-index.cjs index.html .github/workflows/deploy-pages.yml
git commit -m "feat(en-mirror): 英文站入册 sites.json+入口 EN 标签+CI 构建部署段"
```

---

### Task 6: 主 README 登记与收尾检查

**Files:**
- Modify: `README.md`（仓库根）

- [ ] **Step 1: 主 README 更新**

「收录项目」表格加一行：

```markdown
| ai-memory (EN) | `ai-memory-docs-en/` | 无（仓库即源） | https://github.com/akitaonrails/ai-memory | 2026-08-25 |
```

「目录结构」树加：`├── ai-memory-docs-en/                # ai-memory 英文镜像（Starlight，脚本生成，36 篇）`（插在 ai-memory-docs-cn 行后）。

「部署后访问地址」列表加：`- ai-memory（英文镜像）：https://lif3ng-vibe.github.io/docs-cn/ai-memory-en/`。

「翻译说明」或「新增一个翻译站点」节补一句：上游无站点、只有 markdown 时，可用 `node scripts/new-en-mirror.cjs --config scripts/en-mirrors/<site>.json` 生成英文镜像站（配置见 `scripts/en-mirrors/`，重跑即刷新并产出 `SYNC.md` 变化工单）。

- [ ] **Step 2: 全量自检**

Run:
```bash
node scripts/gen-index.cjs && cd ai-memory-docs-en && npm run build && cd ..
git status --short
```
Expected: 构建通过；`git status` 只显示预期改动（README.md）。

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: 主 README 登记英文镜像站+new-en-mirror 用法说明"
```

---

### Task 7: 按 SYNC.md 补译中文站

**Files:**
- Modify: `ai-memory-docs-cn/src/content/docs/*.md`（以 Task 3 产出的 `ai-memory-docs-en/SYNC.md` 工单为准）

**Interfaces:**
- Consumes: `ai-memory-docs-en/SYNC.md`（M/A 文件清单 + GitHub diff 链接）、中文站 `GLOSSARY.md` 术语口径、各页 frontmatter `source` URL。

- [ ] **Step 1: 读 SYNC.md 确定补译范围**

Run: `cat ai-memory-docs-en/SYNC.md`
Expected: 基线（2026-08-21 对应 commit）到 HEAD 的变更文件表。无变化则本任务改为「记录无变化」直接跳到 Step 4。

- [ ] **Step 2: 逐文件补译**

对每个 M/A 文件：打开 SYNC.md 里的 GitHub compare 链接对照 diff，把变更段落按 GLOSSARY 口径汉化进中文站对应页（保持该页既有行文风格；M 只改变更段落，A 新建整页——新页 frontmatter 的 `source` 用上游 blob URL）。产品名/命令/代码块不译（GLOSSARY 不译名单）。

- [ ] **Step 3: 中文站构建验证**

Run:
```bash
cd ai-memory-docs-cn && npm run build && node scripts/check-anchors.cjs && cd ..
```
Expected: 构建成功；`ALL INTERNAL ANCHORS OK`。

- [ ] **Step 4: Commit（按文件粒度，沿用现有惯例 `translate(ai-memory): …`）**

```bash
git add ai-memory-docs-cn
git commit -m "translate(ai-memory): 按 SYNC.md 补译上游快照后变更——<具体篇目>"
```

无变化时：`git commit --allow-empty -m "chore(ai-memory): SYNC 检查——上游自 2026-08-21 快照无文档变更"`（或直接不提交，口头报告即可）。

---

### Task 8: 推送与线上验证

- [ ] **Step 1: 推送前确认**

Run: `git log --oneline origin/master..HEAD`
Expected: 本计划的全部 commit。向用户确认推送（全局规则：git push 需明确确认）。

- [ ] **Step 2: 推送并等待部署**

用户确认后 `git push`。GitHub Actions 跑 `deploy-pages.yml`（六站构建）。

- [ ] **Step 3: 线上抽查**

部署完成后访问/抓取：
- `https://lif3ng-vibe.github.io/docs-cn/` — 入口页出现「ai-memory (English) EN」卡片
- `https://lif3ng-vibe.github.io/docs-cn/ai-memory-en/` — 英文落地页渲染正常、横幅指向上游
- `https://lif3ng-vibe.github.io/docs-cn/ai-memory-en/install/` — 与中文 `/ai-memory/install/` 同 slug
Expected: 三项全过。
