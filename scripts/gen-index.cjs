#!/usr/bin/env node
/**
 * gen-index.cjs — 读 sites.json 生成入口页 index.html。
 * CI 和本地都用它：加新站点只需改 sites.json，重跑此脚本。
 * 卡片：整卡点击进中文站（相对路径 slug/，CI 下从 /docs-cn/ 解析）；右侧按钮组：
 *   en   → 「英文文档」（本仓库构建的英文镜像，仅中英双建的站有）
 *   orig → 「官方文档」（上游原站；orig 与 repo 相同即上游无站点，不显示）
 *   repo → 「仓库」（上游 GitHub 仓库）
 * 标签：sites.json 条目可带 tags（slug 见下方 TAGS），入口页顶部可按标签筛选；
 *   lang:"en" 镜像条目自动继承中文站标签并附加 unofficial-en。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const sites = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sites.json'), 'utf8'));

// 标签注册表：slug → 双语对照（sites.json 里用 slug，入口页展示中文）。
// 新增站点先从这里选标签；覆盖不了新主题时先补注册表再打标。
const TAGS = {
	'ai-agent':          { en: 'AI Agent',          zh: '智能体' },
	'multi-agent':       { en: 'Multi-Agent',       zh: '多智能体协作' },
	'skills':            { en: 'Skills & Prompts',  zh: '技能与提示词' },
	'memory':            { en: 'Memory',            zh: '记忆系统' },
	'testing':           { en: 'Testing',           zh: '测试' },
	'deployment':        { en: 'Deployment',        zh: '部署运维' },
	'docs-engineering':  { en: 'Docs Engineering',  zh: '文档工程' },
	'ai-app-dev':        { en: 'AI App Dev',        zh: 'AI 应用开发' },
	'code-intelligence': { en: 'Code Intelligence', zh: '代码智能' },
	'learning':          { en: 'Learning',          zh: '概念与入门' },
	'cli-tool':          { en: 'CLI Tool',          zh: '命令行工具' },
	'sdk-api':           { en: 'SDK & API',         zh: 'SDK 与 API' },
	'unofficial-en':     { en: 'Unofficial EN',     zh: '非官方英文文档' },
};

// 英文镜像条目：继承中文站标签并附加 unofficial-en（镜像只在「上游无站点、
// 只有 markdown」时创建，定义上必然非官方，自动附加避免漏打）。
const cnByEn = new Map(sites.filter((s) => s.en).map((s) => [s.en, s]));
for (const s of sites) {
	if (s.lang !== 'en') continue;
	const cn = cnByEn.get(s.slug);
	if (!cn) throw new Error(`EN 镜像 "${s.slug}" 找不到 en 字段指向它的中文站条目`);
	s.tags = [...(cn.tags || []), 'unofficial-en'];
}

// fail-fast：未注册 slug 直接报错（防拼写错），列出全部非法值。
const badTags = sites.flatMap((s) => (s.tags || []).filter((t) => !TAGS[t]));
if (badTags.length) {
	throw new Error(
		`sites.json 含未注册标签: ${[...new Set(badTags)].join(', ')}（合法标签见上方 TAGS）`
	);
}

function cardButtons(s) {
	const btn = (href, label) =>
		`<a class="btn" href="${href}" target="_blank" rel="noopener">${label}</a>`;
	const out = [];
	if (s.en) out.push(btn(`${s.en}/`, '英文文档'));
	if (s.orig && s.orig !== s.repo) out.push(btn(s.orig, '官方文档'));
	if (s.repo) out.push(btn(s.repo, '仓库'));
	return out.join('');
}

function cardTags(s) {
	return (s.tags || [])
		.map((t) => `<span class="tag">${TAGS[t].zh}</span>`)
		.join('');
}

const cards = sites
	.map(
		(s) => `
			<div class="item" data-tags="${(s.tags || []).join(',')}">
				<a class="row" href="${s.slug}/" target="_blank" rel="noopener">
					<p class="name">${s.name}</p>
					<p class="desc">${s.desc}</p>
					<div class="tags">${cardTags(s)}</div>
				</a>
				<div class="btns">${cardButtons(s)}</div>
			</div>`
	)
	.join('');

const filterChips = [
	'<button class="chip active" data-filter="all">全部</button>',
	...Object.entries(TAGS).map(
		([slug, t]) => `<button class="chip" data-filter="${slug}">${t.zh}</button>`
	),
].join('');

const html = `<!doctype html>
<html lang="zh-CN">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>docs-cn — 开源文档中文翻译</title>
		<meta name="description" content="开源项目文档的中文翻译集合。" />
		<style>
			body {
				margin: 0;
				background: #f6f8fa;
				color: #1f2328;
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
					'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
				line-height: 1.6;
				-webkit-font-smoothing: antialiased;
			}
			.wrap {
				max-width: 680px;
				margin: 0 auto;
				padding: 4rem 1.5rem 3rem;
			}
			h1 {
				font-size: 1.6rem;
				font-weight: 700;
				margin: 0 0 0.4rem;
				letter-spacing: -0.01em;
			}
			.sub {
				color: #636c76;
				font-size: 0.95rem;
				margin: 0 0 2rem;
			}
			.list {
				display: flex;
				flex-direction: column;
				gap: 0.75rem;
			}
			.item {
				position: relative;
				background: #fff;
				border: 1px solid #d0d7de;
				border-radius: 10px;
				overflow: hidden;
				transition: border-color 0.15s ease, box-shadow 0.15s ease;
			}
			.item:hover {
				border-color: #0969da;
				box-shadow: 0 1px 4px rgba(9, 105, 218, 0.12);
			}
			.row {
				display: block;
				text-decoration: none;
				color: inherit;
				padding: 1.1rem 1.25rem;
				transition: background 0.15s ease;
			}
			.row:hover {
				background: #f0f4f8;
			}
			.name {
				font-size: 1.1rem;
				font-weight: 600;
				margin: 0 0 0.2rem;
			}
			.desc {
				color: #636c76;
				font-size: 0.9rem;
				margin: 0;
			}
			.filterbar {
				display: flex;
				flex-wrap: wrap;
				gap: 0.4rem;
				margin: 0 0 1.5rem;
			}
			.chip {
				font-size: 0.8rem;
				color: #636c76;
				border: 1px solid #d0d7de;
				border-radius: 999px;
				padding: 0.25rem 0.75rem;
				background: #fff;
				cursor: pointer;
				transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
			}
			.chip:hover {
				color: #0969da;
				border-color: #0969da;
			}
			.chip.active {
				color: #fff;
				border-color: #0969da;
				background: #0969da;
			}
			.tags {
				display: flex;
				flex-wrap: wrap;
				gap: 0.3rem;
				margin: 0.5rem 0 0;
			}
			.tag {
				font-size: 0.72rem;
				color: #57606a;
				border: 1px solid #d8dee4;
				border-radius: 999px;
				padding: 0.1rem 0.55rem;
				background: #f6f8fa;
				white-space: nowrap;
			}
			.btns {
				position: absolute;
				right: 1rem;
				top: 50%;
				transform: translateY(-50%);
				display: flex;
				gap: 0.4rem;
			}
			.btn {
				font-size: 0.85rem;
				color: #636c76;
				text-decoration: none;
				border: 1px solid #d0d7de;
				border-radius: 6px;
				padding: 0.32rem 0.7rem;
				background: #fff;
				transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
				white-space: nowrap;
			}
			.btn:hover {
				color: #0969da;
				border-color: #0969da;
				background: #fff;
			}
			footer {
				margin-top: 2.5rem;
				font-size: 0.85rem;
				color: #636c76;
			}
			footer a {
				color: #0969da;
				text-decoration: none;
			}
			footer a:hover {
				text-decoration: underline;
			}
			@media (max-width: 560px) {
				.btns {
					position: static;
					transform: none;
					padding: 0 1.25rem 1.1rem;
				}
			}
		</style>
	</head>
	<body>
		<div class="wrap">
			<h1>docs-cn</h1>
			<p class="sub">开源项目文档的中文翻译集合。</p>
			<div class="filterbar">${filterChips}</div>
			<div class="list">${cards}
			</div>
			<footer>
				<a href="https://github.com/lif3ng-vibe/docs-cn" target="_blank" rel="noopener">GitHub</a> · 非官方翻译
			</footer>
		</div>
		<script>
			(function () {
				var chips = document.querySelectorAll('.chip');
				var items = document.querySelectorAll('.item');
				var active = new Set();
				function apply() {
					var all = active.size === 0;
					chips.forEach(function (c) {
						var f = c.dataset.filter;
						c.classList.toggle('active', f === 'all' ? all : active.has(f));
					});
					items.forEach(function (it) {
						var tags = it.dataset.tags ? it.dataset.tags.split(',') : [];
						var show = all || tags.some(function (t) { return active.has(t); });
						it.style.display = show ? '' : 'none';
					});
				}
				chips.forEach(function (c) {
					c.addEventListener('click', function () {
						var f = c.dataset.filter;
						if (f === 'all') active.clear();
						else if (active.has(f)) active.delete(f);
						else active.add(f);
						apply();
					});
				});
				apply();
			})();
		</script>
	</body>
</html>
`;

const out = path.join(__dirname, '..', 'index.html');
fs.writeFileSync(out, html, 'utf8');
console.log(`generated ${out} with ${sites.length} site(s)`);