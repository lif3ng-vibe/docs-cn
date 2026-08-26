#!/usr/bin/env node
/**
 * gen-index.cjs — 读 sites.json 生成入口页 index.html。
 * CI 和本地都用它：加新站点只需改 sites.json，重跑此脚本。
 * 卡片：整卡点击进中文站（相对路径 slug/，CI 下从 /docs-cn/ 解析）；右侧按钮组：
 *   en   → 「英文文档」（本仓库构建的英文镜像，仅中英双建的站有）
 *   orig → 「官方文档」（上游原站；orig 与 repo 相同即上游无站点，不显示）
 *   repo → 「仓库」（上游 GitHub 仓库）
 */
'use strict';
const fs = require('fs');
const path = require('path');

const sites = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sites.json'), 'utf8'));

function cardButtons(s) {
	const btn = (href, label) =>
		`<a class="btn" href="${href}" target="_blank" rel="noopener">${label}</a>`;
	const out = [];
	if (s.en) out.push(btn(`${s.en}/`, '英文文档'));
	if (s.orig && s.orig !== s.repo) out.push(btn(s.orig, '官方文档'));
	if (s.repo) out.push(btn(s.repo, '仓库'));
	return out.join('');
}

const cards = sites
	.map(
		(s) => `
			<div class="item">
				<a class="row" href="${s.slug}/" target="_blank" rel="noopener">
					<p class="name">${s.name}</p>
					<p class="desc">${s.desc}</p>
				</a>
				<div class="btns">${cardButtons(s)}</div>
			</div>`
	)
	.join('');

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
			<div class="list">${cards}
			</div>
			<footer>
				<a href="https://github.com/lif3ng-vibe/docs-cn" target="_blank" rel="noopener">GitHub</a> · 非官方翻译
			</footer>
		</div>
	</body>
</html>
`;

const out = path.join(__dirname, '..', 'index.html');
fs.writeFileSync(out, html, 'utf8');
console.log(`generated ${out} with ${sites.length} site(s)`);