#!/usr/bin/env node
/**
 * gen-index.cjs — 读 sites.json 生成入口页 index.html。
 * CI 和本地都用它：加新站点只需改 sites.json，重跑此脚本。
 * 中文文档链接用相对路径（slug/），CI 下从 /docs-cn/ 解析为 /docs-cn/<slug>/，本地根路径也正确。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const sites = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sites.json'), 'utf8'));

const cards = sites
	.map(
		(s) => `
			<div class="item">
				<a class="row" href="${s.slug}/" target="_blank" rel="noopener">
					<p class="name">${s.name}</p>
					<p class="desc">${s.desc}</p>
				</a>
				<a class="orig" href="${s.orig}" target="_blank" rel="noopener">原文档</a>
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
				padding-right: 5.5rem;
			}
			.orig {
				position: absolute;
				right: 1rem;
				top: 50%;
				transform: translateY(-50%);
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
			.orig:hover {
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
				.desc {
					padding-right: 0;
				}
				.orig {
					position: static;
					transform: none;
					display: inline-block;
					margin-top: 0.6rem;
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