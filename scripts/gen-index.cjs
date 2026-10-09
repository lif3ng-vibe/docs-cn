#!/usr/bin/env node
/**
 * gen-index.cjs — 读 sites.json 生成入口页 index.html。
 * CI 和本地都用它：加新站点只需改 sites.json，重跑此脚本。
 * 卡片：整卡点击进中文站（相对路径 slug/，CI 下从 /docs-cn/ 解析）；右侧按钮组：
 *   en   → 「英文文档」（本仓库构建的英文镜像，仅中英双建的站有）
 *   orig → 「官方文档」（上游原站；orig 与 repo 相同即上游无站点，不显示）
 *   repo → 「仓库」（上游 GitHub 仓库）
 * 标签：sites.json 条目可带 tags（slug 见下方 TAGS），入口页顶部可按标签筛选：
 *   多选取交集；当前筛选下命中不了任何卡片的标签置灰禁用；列表动画用
 *   formkit/auto-animate（vendor ESM 产物构建时转全局变量内联，页面零外部请求）。
 *   lang:"en" 镜像条目自动继承中文站标签并附加 unofficial-en。
 * 设置：右上角「⚙ 设置」弹窗——主题色小方块（页面背景/卡片底色随主题联动）、
 *   卡片风格、卡片各部分显隐、标签语言（中文[默认]/English）；偏好存 localStorage
 *   （key: docs-cn-prefs），head 内联脚本预读应用防主题闪烁，刷新后仍生效。
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

// 主题色注册表：入口页设置弹窗的小方块与 CSS 变量同源于此。
// 首个为主题认默认色（:root），其余生成 [data-theme] 覆盖块。accent 取 GitHub 系
// 深色保证其上白字对比度；bg/surface 是随主题联动的页面背景与卡片底色（同色相
// 极浅着色，surface 比 bg 更接近白，保持卡片浮起感）。
const THEMES = {
	blue:   { zh: '蓝', color: '#0969da', bg: '#edf3fa', surface: '#fbfcfe' },
	green:  { zh: '绿', color: '#1a7f37', bg: '#eef6ef', surface: '#fbfdfb' },
	purple: { zh: '紫', color: '#8250df', bg: '#f3f0fa', surface: '#fcfbfe' },
	orange: { zh: '橙', color: '#bc4c00', bg: '#faf2ec', surface: '#fefbf9' },
	red:    { zh: '红', color: '#cf222e', bg: '#faf0f0', surface: '#fefbfb' },
	teal:   { zh: '青', color: '#1b7c83', bg: '#edf5f5', surface: '#fafcfc' },
};

// 卡片渲染风格（设置弹窗单选；CSS 按 data-card-style 分支）。
const CARD_STYLES = {
	standard: '标准',
	compact:  '紧凑',
	grid:     '网格',
};

// 标签语言（设置弹窗单选）：筛选按钮与卡片标签的中英文显示切换，默认中文。
const TAG_LANGS = {
	zh: '中文',
	en: 'English',
};

// 卡片各部分显隐（设置弹窗勾选；CSS 按 data-show-* 分支）。
const SHOW_PARTS = {
	desc: '描述',
	tags: '标签',
	btns: '操作按钮',
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

// formkit/auto-animate（vendor 自 @formkit/auto-animate@0.10.0，升级就换文件重跑）：
// 包只发 ESM 构建，这里构建时剥掉末尾 export 把 autoAnimate 挂到 globalThis，
// 内联进页面（保持单文件零外部请求）。fail-fast：导出形态变了就报错。
const aaSource = fs.readFileSync(path.join(__dirname, 'vendor', 'auto-animate.min.js'), 'utf8');
const aaExport = aaSource.match(/export\{([^}]*)\};?\s*$/);
if (!aaExport) throw new Error('vendor/auto-animate.min.js 末尾找不到 export 语句，无法转全局变量');
const aaFn = aaExport[1]
	.split(',')
	.map((s) => s.trim())
	.find((s) => / as autoAnimate$/.test(s));
if (!aaFn) throw new Error('vendor/auto-animate.min.js 未导出 autoAnimate');
const aaGlobal = aaSource.slice(0, aaExport.index) + `globalThis.autoAnimate=${aaFn.split(' ')[0]};`;
if (aaGlobal.includes('</script') || aaGlobal.includes('<!--')) {
	throw new Error('vendor/auto-animate.min.js 含 </script 或 <!--，不能安全内联');
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
		.map(
			(t) =>
				`<span class="tag"><span class="tag-zh">${TAGS[t].zh}</span><span class="tag-en">${TAGS[t].en}</span></span>`
		)
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
		([slug, t]) =>
			`<button class="chip" data-filter="${slug}"><span class="chip-zh">${t.zh}</span><span class="chip-en">${t.en}</span></button>`
	),
].join('');

const swatches = Object.entries(THEMES)
	.map(
		([id, t]) =>
			`<button type="button" class="swatch" data-theme="${id}" style="background:${t.color}" title="${t.zh}" aria-label="${t.zh}色主题"></button>`
	)
	.join('');

const cardStyleRadios = Object.entries(CARD_STYLES)
	.map(
		([id, zh]) =>
			`<label class="seg-item"><input type="radio" name="card-style" value="${id}">${zh}</label>`
	)
	.join('');

const tagLangRadios = Object.entries(TAG_LANGS)
	.map(
		([id, zh]) =>
			`<label class="seg-item"><input type="radio" name="tag-lang" value="${id}">${zh}</label>`
	)
	.join('');

const showChecks = Object.entries(SHOW_PARTS)
	.map(
		([key, zh]) =>
			`<label class="check-item"><input type="checkbox" data-show="${key}">${zh}</label>`
	)
	.join('');

// 主题 CSS：:root 为默认蓝，其余主题生成 data-theme 覆盖块（与 THEMES 同源）。
const themeCss = Object.entries(THEMES)
	.map(
		([id, t]) =>
			`\t\t\t\t[data-theme="${id}"] { --accent: ${t.color}; --bg: ${t.bg}; --surface: ${t.surface}; }`
	)
	.join('\n');

const html = `<!doctype html>
<html lang="zh-CN">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>docs-cn — 开源文档中文翻译</title>
		<meta name="description" content="开源项目文档的中文翻译集合。" />
		<script>
			// 预读 localStorage 偏好，CSS 渲染前落到 data-* 属性，防主题闪烁。
			// 主脚本在 body 末尾，负责交互与保存。
			(function () {
				try {
					var p = JSON.parse(localStorage.getItem('docs-cn-prefs') || '{}');
					var r = document.documentElement;
					if (p.theme) r.dataset.theme = p.theme;
					if (p.cardStyle) r.dataset.cardStyle = p.cardStyle;
					if (p.tagLang) r.dataset.tagLang = p.tagLang;
					['desc', 'tags', 'btns'].forEach(function (k) {
						if (k in p) {
							r.dataset['show' + k.charAt(0).toUpperCase() + k.slice(1)] = p[k] ? '1' : '0';
						}
					});
				} catch (e) {}
			})();
		</script>
		<style>
			:root {
				--accent: ${THEMES.blue.color};
				--bg: ${THEMES.blue.bg};
				--surface: ${THEMES.blue.surface};
			}
${themeCss}
			body {
				margin: 0;
				background: var(--bg);
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
			.header {
				display: flex;
				align-items: baseline;
				justify-content: space-between;
				gap: 1rem;
			}
			h1 {
				font-size: 1.6rem;
				font-weight: 700;
				margin: 0 0 0.4rem;
				letter-spacing: -0.01em;
			}
			.settings-btn {
				font-size: 0.85rem;
				color: #636c76;
				border: 1px solid #d0d7de;
				border-radius: 6px;
				padding: 0.32rem 0.7rem;
				background: var(--surface);
				cursor: pointer;
				white-space: nowrap;
				transition: color 0.15s ease, border-color 0.15s ease;
			}
			.settings-btn:hover {
				color: var(--accent);
				border-color: var(--accent);
			}
			.sub {
				color: #636c76;
				font-size: 0.95rem;
				margin: 0 0 2rem;
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
				background: var(--surface);
				cursor: pointer;
				transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
			}
			.chip:hover {
				color: var(--accent);
				border-color: var(--accent);
			}
			.chip.active {
				color: #fff;
				border-color: var(--accent);
				background: var(--accent);
			}
			.chip:disabled {
				opacity: 0.35;
				cursor: not-allowed;
			}
			.chip:disabled:hover {
				color: #636c76;
				border-color: #d0d7de;
			}
			.list {
				display: flex;
				flex-direction: column;
				gap: 0.75rem;
			}
			.item {
				display: flex;
				align-items: center;
				gap: 0.5rem;
				position: relative;
				background: var(--surface);
				border: 1px solid #d0d7de;
				border-radius: 10px;
				overflow: hidden;
				transition: border-color 0.15s ease, box-shadow 0.15s ease;
			}
			.item:hover {
				border-color: var(--accent);
				box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
			}
			.row {
				flex: 1;
				min-width: 0;
				display: block;
				text-decoration: none;
				color: inherit;
				padding: 1.1rem 0 1.1rem 1.25rem;
				transition: background 0.15s ease;
			}
			.row:hover {
				background: color-mix(in srgb, var(--accent) 5%, var(--surface));
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
				background: color-mix(in srgb, var(--accent) 6%, var(--surface));
				white-space: nowrap;
			}
			/* 标签语言切换：默认中文，[data-tag-lang='en'] 时显示英文 */
			.chip-en,
			.tag-en {
				display: none;
			}
			[data-tag-lang='en'] .chip-zh,
			[data-tag-lang='en'] .tag-zh {
				display: none;
			}
			[data-tag-lang='en'] .chip-en,
			[data-tag-lang='en'] .tag-en {
				display: inline;
			}
			/* 操作按钮改常规流内布局（flex 行右端），彻底避免遮挡文字 */
			.btns {
				display: flex;
				gap: 0.4rem;
				flex-shrink: 0;
				padding-right: 1.25rem;
			}
			.btn {
				font-size: 0.85rem;
				color: #636c76;
				text-decoration: none;
				border: 1px solid #d0d7de;
				border-radius: 6px;
				padding: 0.32rem 0.7rem;
				background: var(--surface);
				transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
				white-space: nowrap;
			}
			.btn:hover {
				color: var(--accent);
				border-color: var(--accent);
				background: var(--surface);
			}
			footer {
				margin-top: 2.5rem;
				font-size: 0.85rem;
				color: #636c76;
			}
			footer a {
				color: var(--accent);
				text-decoration: none;
			}
			footer a:hover {
				text-decoration: underline;
			}
			/* —— 卡片风格：紧凑 —— */
			[data-card-style='compact'] .list {
				gap: 0.4rem;
			}
			[data-card-style='compact'] .row {
				padding: 0.6rem 0 0.6rem 1rem;
			}
			[data-card-style='compact'] .btns {
				padding-right: 1rem;
			}
			[data-card-style='compact'] .name {
				font-size: 1rem;
				margin: 0;
			}
			[data-card-style='compact'] .desc {
				font-size: 0.8rem;
				margin: 0;
			}
			[data-card-style='compact'] .tags {
				margin: 0.35rem 0 0;
			}
			[data-card-style='compact'] .item {
				border-radius: 8px;
			}
			/* —— 卡片风格：网格（保持按钮堆叠在文字下方） —— */
			[data-card-style='grid'] .list {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
			}
			[data-card-style='grid'] .item {
				display: block;
			}
			[data-card-style='grid'] .row {
				padding: 1.1rem 1.25rem 0.6rem;
			}
			[data-card-style='grid'] .btns {
				padding: 0 1.25rem 1rem;
			}
			/* —— 卡片各部分显隐 —— */
			[data-show-desc='0'] .desc {
				display: none;
			}
			[data-show-tags='0'] .tags {
				display: none;
			}
			[data-show-btns='0'] .btns {
				display: none;
			}
			/* —— 设置弹窗 —— */
			.settings {
				background: var(--surface);
				user-select: none;
				border: 1px solid #d0d7de;
				border-radius: 12px;
				padding: 1.25rem 1.5rem;
				min-width: 300px;
				max-width: 92vw;
				box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
			}
			.settings::backdrop {
				background: rgba(31, 35, 40, 0.4);
			}
			.settings-head {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin: 0 0 0.75rem;
			}
			.settings-close {
				border: none;
				background: none;
				font-size: 1rem;
				color: #636c76;
				cursor: pointer;
				padding: 0.2rem 0.4rem;
				border-radius: 6px;
			}
			.settings-close:hover {
				color: #1f2328;
				background: #f0f4f8;
			}
			.settings fieldset {
				border: none;
				margin: 0 0 1rem;
				padding: 0;
			}
			.settings fieldset:last-child {
				margin-bottom: 0;
			}
			.settings legend {
				font-size: 0.85rem;
				font-weight: 600;
				color: #57606a;
				padding: 0;
				margin-bottom: 0.5rem;
			}
			.swatches {
				display: flex;
				gap: 0.5rem;
			}
			.swatch {
				width: 1.5rem;
				height: 1.5rem;
				border-radius: 6px;
				border: 1px solid rgba(0, 0, 0, 0.15);
				cursor: pointer;
				padding: 0;
				transition: transform 0.15s ease, box-shadow 0.15s ease;
			}
			.swatch:hover {
				transform: scale(1.1);
			}
			.swatch.active {
				box-shadow: 0 0 0 2px #fff, 0 0 0 4px #1f2328;
			}
			.seg {
				display: flex;
				gap: 0.4rem;
				flex-wrap: wrap;
			}
			.seg-item,
			.check-item {
				display: inline-flex;
				align-items: center;
				gap: 0.35rem;
				font-size: 0.9rem;
				border: 1px solid #d0d7de;
				border-radius: 8px;
				padding: 0.3rem 0.75rem;
				cursor: pointer;
				background: var(--surface);
			}
			.seg-item:has(input:checked) {
				border-color: var(--accent);
				color: var(--accent);
			}
			.settings input {
				accent-color: var(--accent);
				margin: 0;
			}
			.checks {
				display: flex;
				gap: 0.75rem;
				flex-wrap: wrap;
			}
			@media (max-width: 560px) {
				.item {
					display: block;
				}
				.row {
					padding: 1.1rem 1.25rem;
				}
				.btns {
					padding: 0 1.25rem 1.1rem;
				}
			}
		</style>
	</head>
	<body>
		<div class="wrap">
			<div class="header">
				<h1>docs-cn</h1>
				<button class="settings-btn" id="settings-btn" type="button" aria-haspopup="dialog">⚙ 设置</button>
			</div>
			<p class="sub">开源项目文档的中文翻译集合。</p>
			<div class="filterbar">${filterChips}</div>
			<div class="list">${cards}
			</div>
			<footer>
				<a href="https://github.com/lif3ng-vibe/docs-cn" target="_blank" rel="noopener">GitHub</a> · 非官方翻译
			</footer>
		</div>
		<dialog id="settings" class="settings" aria-label="显示设置">
			<div class="settings-head">
				<strong>显示设置</strong>
				<button class="settings-close" id="settings-close" type="button" aria-label="关闭">✕</button>
			</div>
			<fieldset>
				<legend>主题色</legend>
				<div class="swatches">${swatches}</div>
			</fieldset>
			<fieldset>
				<legend>卡片风格</legend>
				<div class="seg">${cardStyleRadios}</div>
			</fieldset>
			<fieldset>
				<legend>标签语言</legend>
				<div class="seg">${tagLangRadios}</div>
			</fieldset>
			<fieldset>
				<legend>卡片显示</legend>
				<div class="checks">${showChecks}</div>
			</fieldset>
		</dialog>
		<script>
			${aaGlobal}
		</script>
		<script>
			(function () {
				var STORAGE_KEY = 'docs-cn-prefs';
				var DEFAULTS = {
					theme: 'blue',
					cardStyle: 'standard',
					tagLang: 'zh',
					showDesc: true,
					showTags: true,
					showBtns: true,
				};
				var root = document.documentElement;

				function loadPrefs() {
					try {
						var p = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
						var out = {};
						Object.keys(DEFAULTS).forEach(function (k) {
							out[k] = k in p ? p[k] : DEFAULTS[k];
						});
						// 注册表之外的主题/风格/语言回落默认（防手改 localStorage 出脏值）
						if (THEME_IDS.indexOf(out.theme) === -1) out.theme = DEFAULTS.theme;
						if (CARD_STYLE_IDS.indexOf(out.cardStyle) === -1) out.cardStyle = DEFAULTS.cardStyle;
						if (TAG_LANG_IDS.indexOf(out.tagLang) === -1) out.tagLang = DEFAULTS.tagLang;
						return out;
					} catch (e) {
						return Object.assign({}, DEFAULTS);
					}
				}
				var THEME_IDS = ${JSON.stringify(Object.keys(THEMES))};
				var CARD_STYLE_IDS = ${JSON.stringify(Object.keys(CARD_STYLES))};
				var TAG_LANG_IDS = ${JSON.stringify(Object.keys(TAG_LANGS))};
				var prefs = loadPrefs();

				function savePrefs() {
					try {
						localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
					} catch (e) {}
				}
				function applyPrefs() {
					if (prefs.theme === 'blue') delete root.dataset.theme;
					else root.dataset.theme = prefs.theme;
					root.dataset.cardStyle = prefs.cardStyle;
					if (prefs.tagLang === 'zh') delete root.dataset.tagLang;
					else root.dataset.tagLang = prefs.tagLang;
					root.dataset.showDesc = prefs.showDesc ? '1' : '0';
					root.dataset.showTags = prefs.showTags ? '1' : '0';
					root.dataset.showBtns = prefs.showBtns ? '1' : '0';
				}

				// —— 设置弹窗 ——
				var dialog = document.getElementById('settings');
				var btn = document.getElementById('settings-btn');
				var closeBtn = document.getElementById('settings-close');

				function syncSettingsUi() {
					root.querySelectorAll('.swatch').forEach(function (sw) {
						sw.classList.toggle('active', sw.dataset.theme === prefs.theme);
					});
					var radio = root.querySelector('input[name="card-style"][value="' + prefs.cardStyle + '"]');
					if (radio) radio.checked = true;
					var langRadio = root.querySelector('input[name="tag-lang"][value="' + prefs.tagLang + '"]');
					if (langRadio) langRadio.checked = true;
					root.querySelectorAll('input[data-show]').forEach(function (cb) {
						cb.checked = !!prefs['show' + cb.dataset.show.charAt(0).toUpperCase() + cb.dataset.show.slice(1)];
					});
				}
				btn.addEventListener('click', function () {
					syncSettingsUi();
					dialog.showModal();
				});
				closeBtn.addEventListener('click', function () {
					dialog.close();
				});
				// 点遮罩关闭
				dialog.addEventListener('click', function (e) {
					if (e.target === dialog) dialog.close();
				});

				root.querySelectorAll('.swatch').forEach(function (sw) {
					sw.addEventListener('click', function () {
						prefs.theme = sw.dataset.theme;
						applyPrefs();
						savePrefs();
						syncSettingsUi();
					});
				});
				root.querySelectorAll('input[name="card-style"]').forEach(function (r) {
					r.addEventListener('change', function () {
						prefs.cardStyle = r.value;
						applyPrefs();
						savePrefs();
						syncSettingsUi();
					});
				});
				root.querySelectorAll('input[name="tag-lang"]').forEach(function (r) {
					r.addEventListener('change', function () {
						prefs.tagLang = r.value;
						applyPrefs();
						savePrefs();
						syncSettingsUi();
					});
				});
				root.querySelectorAll('input[data-show]').forEach(function (cb) {
					cb.addEventListener('change', function () {
						var key = 'show' + cb.dataset.show.charAt(0).toUpperCase() + cb.dataset.show.slice(1);
						prefs[key] = cb.checked;
						applyPrefs();
						savePrefs();
					});
				});

				// —— 标签筛选（交集 + 不可用置灰 + auto-animate 动画）——
				var list = document.querySelector('.list');
				autoAnimate(list);
				var items = Array.prototype.map.call(list.querySelectorAll('.item'), function (el) {
					return { el: el, tags: el.dataset.tags ? el.dataset.tags.split(',') : [] };
				});
				var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
				var active = new Set();
				function apply() {
					var sel = Array.from(active);
					// 交集：卡片须命中全部选中标签
					var desired = items.filter(function (it) {
						return sel.every(function (t) { return it.tags.indexOf(t) !== -1; });
					});
					// 先移出不再命中的卡片，再按原顺序补回命中的（auto-animate 负责动画）
					items.forEach(function (it) {
						if (desired.indexOf(it) === -1 && it.el.parentNode) it.el.remove();
					});
					desired.forEach(function (it, i) {
						if (list.children[i] !== it.el) list.appendChild(it.el);
					});
					// 置灰：未选中标签在当前命中卡片中一个都没有 → disabled
					chips.forEach(function (c) {
						var f = c.dataset.filter;
						if (f === 'all') {
							c.classList.toggle('active', active.size === 0);
							c.disabled = false;
							return;
						}
						c.classList.toggle('active', active.has(f));
						c.disabled =
							!active.has(f) &&
							!desired.some(function (it) { return it.tags.indexOf(f) !== -1; });
					});
				}
				chips.forEach(function (c) {
					c.addEventListener('click', function () {
						if (c.disabled) return;
						var f = c.dataset.filter;
						if (f === 'all') active.clear();
						else if (active.has(f)) active.delete(f);
						else active.add(f);
						apply();
					});
				});

				applyPrefs();
				apply();
			})();
		</script>
	</body>
</html>
`;

const out = path.join(__dirname, '..', 'index.html');
fs.writeFileSync(out, html, 'utf8');
console.log(`generated ${out} with ${sites.length} site(s)`);
