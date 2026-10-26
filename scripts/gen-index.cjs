#!/usr/bin/env node
/**
 * gen-index.cjs — 读 sites.json + scripts/index/ 模板三件套，生成入口页 index.html。
 * CI 和本地都用它：加新站点只需改 sites.json，重跑此脚本。
 * 模板三件套（scripts/index/）：template.html（HTML 骨架，{{TOKEN}} 占位）、
 * styles.css（全部样式，三皮肤 data-skin=mdn/github/vercel 分层）、app.js（交互脚本）。
 * 改样式/交互直接编辑这三个文件，本脚本只负责数据与装配：动态片段（卡片/
 * 筛选chips/设置单选组等）以 {{TOKEN}} 注入，CSS/JS 内联进单文件产物（零外部请求）。
 * 皮肤：MDN（默认）/ GitHub / Vercel，settings 弹窗切换，localStorage 持久化；
 *   原 6 色主题已由皮肤系统取代（各皮肤自带主色）。
 * 卡片：整卡点击进中文站（相对路径 slug/，CI 下从 /docs-cn/ 解析）；行尾次级链接：
 *   en   → 「EN」（本仓库构建的英文镜像，仅中英双建的站有）
 *   orig → 官方文档（外链图标；orig 与 repo 相同即上游无站点，不显示）
 *   repo → 仓库（GitHub 图标）
 *   主行动=整卡点击，hover 浮现「阅读中文文档 →」（app.js/CSS 交互层）。
 * 元数据行：sites.json 可选 meta {pages,stack,snap} → 「页数 · 工具链 · 快照 日」；
 *   缺失项跳过，整行缺省则不渲染——不虚构数据。
 * 标签：sites.json 条目可带 tags（slug 见下方 TAGS），多选取交集；命中不了的标签
 *   置灰禁用；列表动画用 formkit/auto-animate（vendor ESM 构建时转全局变量内联）。
 *   lang:"en" 镜像条目自动继承中文站标签并附加 unofficial-en。
 * 搜索：按名称/描述匹配（大小写不敏感），命中片段 mark 高亮；过滤/仅高亮两种模式；
 *   筛选与搜索词同步 URL（?tags=&q=，replaceState），刷新/分享不丢。
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
	'frontend-design':   { en: 'Frontend Design',   zh: '前端设计' },
	'memory':            { en: 'Memory',            zh: '记忆系统' },
	'testing':           { en: 'Testing',           zh: '测试' },
	'deployment':        { en: 'Deployment',        zh: '部署运维' },
	'docs-engineering':  { en: 'Docs Engineering',  zh: '文档工程' },
	'ai-app-dev':        { en: 'AI App Dev',        zh: 'AI 应用开发' },
	'code-intelligence': { en: 'Code Intelligence', zh: '代码智能' },
	'learning':          { en: 'Learning',          zh: '概念与入门' },
	'cli-tool':          { en: 'CLI Tool',          zh: '命令行工具' },
	'sdk-api':           { en: 'SDK & API',         zh: 'SDK 与 API' },
	'networking':        { en: 'Networking',        zh: '网络与安全' },
	'unofficial-en':     { en: 'Unofficial EN',     zh: '非官方英文文档' },
};

// 皮肤注册表（设置弹窗单选；CSS 按 data-skin 分支）。
const SKINS = {
	mdn:    'MDN',
	github: 'GitHub',
	vercel: 'Vercel',
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

// 关键词搜索行为（设置弹窗单选）：过滤=隐藏不命中卡片；仅高亮=保留全部卡片。
const SEARCH_MODES = {
	filter:    '过滤',
	highlight: '仅高亮',
};

// 卡片各部分显隐（设置弹窗勾选；CSS 按 data-show-* 分支）。
const SHOW_PARTS = {
	desc: '描述',
	tags: '标签',
	meta: '元数据行',
	btns: '次级链接',
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

// 次级链接图标（14px 手绘内联 SVG，统一 1.5 线宽）
const ICON_EXT =
	'<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3.5H4.5A1.5 1.5 0 0 0 3 5v6.5A1.5 1.5 0 0 0 4.5 13H11a1.5 1.5 0 0 0 1.5-1.5V9"/><path d="M9.5 2.5h4v4"/><path d="M13 3 8 8"/></svg>';
const ICON_REPO =
	'<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="4.5" cy="4" r="1.7"/><circle cx="4.5" cy="12" r="1.7"/><circle cx="11.5" cy="5" r="1.7"/><path d="M4.5 5.7v4.6"/><path d="M11.5 6.7c0 2.6-4 2.2-7 3.4"/></svg>';
const ICON_ARROW =
	'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 8H13"/><path d="M8.5 3.5 13 8l-4.5 4.5"/></svg>';

function cardButtons(s) {
	const link = (href, label, icon, cls) =>
		`<a class="mini ${cls || ''}" href="${href}" ${/^https?:/.test(href) ? 'target="_blank" rel="noopener"' : ''} title="${label}" aria-label="${label}">${icon}</a>`;
	const out = [];
	if (s.en) out.push(`<a class="mini mini-text" href="${s.en}/" title="英文文档（本站镜像）" aria-label="英文文档">EN</a>`);
	if (s.orig && s.orig !== s.repo) out.push(link(s.orig, '官方文档（上游原站）', ICON_EXT, ''));
	if (s.repo) out.push(link(s.repo, '上游仓库', ICON_REPO, ''));
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

// 元数据行：meta 三段各取所需，全空则返回空串（模板侧不渲染）。
function metaLine(s) {
	const m = s.meta || {};
	return [m.pages, m.stack, m.snap ? `快照 ${m.snap}` : ''].filter(Boolean).join(' · ');
}

const cards = sites
	.map((s) => {
		const meta = metaLine(s);
		return `
				<article class="item" id="s-${s.slug}" data-tags="${(s.tags || []).join(',')}">
					<a class="row" href="${s.slug}/" target="_blank" rel="noopener">
						<div class="row-main">
							<h2 class="name">${s.name}</h2>
							<p class="desc">${s.desc}</p>
							${meta ? `<p class="meta">${meta}</p>` : ''}
							<div class="tags">${cardTags(s)}</div>
						</div>
						<span class="cta" aria-hidden="true">阅读中文文档 ${ICON_ARROW}</span>
					</a>
					<div class="btns">${cardButtons(s)}</div>
				</article>`;
	})
	.join('');

const filterChips = [
	'<button class="chip active" data-filter="all">全部</button>',
	...Object.entries(TAGS).map(
		([slug, t]) =>
			`<button class="chip" data-filter="${slug}"><span class="chip-zh">${t.zh}</span><span class="chip-en">${t.en}</span></button>`
	),
].join('');

const skinRadios = Object.entries(SKINS)
	.map(
		([id, zh]) =>
			`<label class="seg-item"><input type="radio" name="skin" value="${id}">${zh}</label>`
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

const searchModeRadios = Object.entries(SEARCH_MODES)
	.map(
		([id, zh]) =>
			`<label class="seg-item"><input type="radio" name="search-mode" value="${id}">${zh}</label>`
	)
	.join('');

const showChecks = Object.entries(SHOW_PARTS)
	.map(
		([key, zh]) =>
			`<label class="check-item"><input type="checkbox" data-show="${key}">${zh}</label>`
	)
	.join('');

// —— 模板装配：读 scripts/index/ 三份源文件，{{TOKEN}} 全量替换后内联为单文件 ——
const assetDir = path.join(__dirname, 'index');
const loadAsset = (name) => fs.readFileSync(path.join(assetDir, name), 'utf8');

function isTokenKey(key) {
	return key.length > 0 && [...key].every((c) => (c >= 'A' && c <= 'Z') || c === '_');
}

function findToken(text, from) {
	const a = text.indexOf('{{', from);
	if (a === -1) return null;
	const b = text.indexOf('}}', a + 2);
	if (b === -1) throw new Error('占位符未闭合：{{ 后无 }}');
	return { key: text.slice(a + 2, b), start: a, end: b + 2 };
}

// 用函数式逐段拼接而非 replace，避免替换文本里的 $ 序列被特殊解释
function fill(text, vars, file) {
	let out = '';
	let pos = 0;
	for (;;) {
		const t = findToken(text, pos);
		if (!t) return out + text.slice(pos);
		if (!isTokenKey(t.key)) {
			// 非 token 的 {{…}}（如注释里的花括号）：原样保留，继续扫描
			out += text.slice(pos, t.start + 2);
			pos = t.start + 2;
			continue;
		}
		if (!(t.key in vars)) throw new Error(file + ' 含未知占位符 {{' + t.key + '}}');
		out += text.slice(pos, t.start) + vars[t.key];
		pos = t.end;
	}
}

// 页脚：收录数 + 最新快照年月（各站 meta.snap 取最大，YYYY-MM）
const lastSnap = sites
	.map((s) => (s.meta && s.meta.snap) || '')
	.sort()
	.pop();

const html = fill(
	loadAsset('template.html'),
	{
		APP_JS: fill(
			loadAsset('app.js'),
			{
				SKIN_IDS: JSON.stringify(Object.keys(SKINS)),
				CARD_STYLE_IDS: JSON.stringify(Object.keys(CARD_STYLES)),
				TAG_LANG_IDS: JSON.stringify(Object.keys(TAG_LANGS)),
				SEARCH_MODE_IDS: JSON.stringify(Object.keys(SEARCH_MODES)),
			},
			'app.js'
		),
		CSS: loadAsset('styles.css'),
		AA_GLOBAL: aaGlobal,
		FILTER_CHIPS: filterChips,
		CARDS: cards,
		SKIN_RADIOS: skinRadios,
		CARD_STYLE_RADIOS: cardStyleRadios,
		TAG_LANG_RADIOS: tagLangRadios,
		SEARCH_MODE_RADIOS: searchModeRadios,
		SHOW_CHECKS: showChecks,
		SITE_COUNT: String(sites.length),
		LAST_SNAP: lastSnap ? lastSnap.slice(0, 7) : '',
	},
	'template.html'
);
{
	// 终检：不得残留任何未替换的 {{TOKEN}}
	let pos = 0;
	for (;;) {
		const t = findToken(html, pos);
		if (!t) break;
		if (isTokenKey(t.key)) throw new Error('template.html 占位符未替换：{{' + t.key + '}}');
		pos = t.end;
	}
}

const out = path.join(__dirname, '..', 'index.html');
fs.writeFileSync(out, html, 'utf8');
console.log('generated ' + out + ' with ' + sites.length + ' site(s)');
