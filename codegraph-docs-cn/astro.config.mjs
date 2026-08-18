// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	base: '/',
	integrations: [
		starlight({
			title: 'codegraph',
			description:
				'一款本地优先的代码智能工具，把任何代码库变成可供 AI 编码智能体查询的知识图谱。',
			favicon: '/favicon.svg',
			defaultLocale: 'root',
			locales: {
				root: { label: '简体中文', lang: 'zh-CN' },
			},
			head: [
				{
					// Default to the light / paper theme on first visit; the toggle still
					// lets a visitor switch to (and persist) the dark / ink theme.
					tag: 'script',
					content:
						"if(!localStorage.getItem('starlight-theme')){try{localStorage.setItem('starlight-theme','light')}catch(e){}document.documentElement.dataset.theme='light';document.documentElement.style.colorScheme='light'}",
				},
			],
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/colbymchenry/codegraph',
				},
			],
			customCss: [
				'@fontsource-variable/archivo',
				'@fontsource/ibm-plex-mono/400.css',
				'@fontsource/ibm-plex-mono/500.css',
				'@fontsource/ibm-plex-mono/600.css',
				'./src/styles/theme.css',
			],
			components: {
				// Wordmark in the docs header.
				SiteTitle: './src/components/SiteTitle.astro',
				// Default GitHub icon + a live star-count pill (matches the landing nav).
				SocialIcons: './src/components/SocialIcons.astro',
			},
			expressiveCode: {
				themes: ['github-light', 'github-dark'],
				styleOverrides: {
					borderRadius: '0px',
					borderColor: '#cdcabf',
					codeFontFamily: "'IBM Plex Mono', ui-monospace, monospace",
				},
			},
			sidebar: [
				{
					label: '入门',
					items: [
						{ label: '简介', slug: 'getting-started/introduction' },
						{ label: '快速开始', slug: 'getting-started/quickstart' },
						{ label: '安装', slug: 'getting-started/installation' },
						{ label: '配置', slug: 'getting-started/configuration' },
						{ label: '你的第一个图谱', slug: 'getting-started/your-first-graph' },
						{ label: '下一步', slug: 'getting-started/next-steps' },
					],
				},
				{
					label: '核心概念',
					items: [
						{ label: '工作原理', slug: 'core-concepts/how-it-works' },
						{ label: '知识图谱', slug: 'core-concepts/knowledge-graph' },
						{ label: '解析与框架', slug: 'core-concepts/resolution' },
					],
				},
				{
					label: '指南',
					items: [
						{ label: '索引一个项目', slug: 'guides/indexing' },
						{ label: '框架路由', slug: 'guides/framework-routes' },
						{ label: 'CI 中的受影响测试', slug: 'guides/affected-tests' },
					],
				},
				{
					label: '参考',
					items: [
						{ label: 'MCP 服务器', slug: 'reference/mcp-server' },
						{ label: '集成', slug: 'reference/integrations' },
						{ label: 'CLI', slug: 'reference/cli' },
						{ label: 'API', slug: 'reference/api' },
						{ label: '语言支持', slug: 'reference/languages' },
					],
				},
				{ label: '故障排查', slug: 'troubleshooting' },
			],
		}),
	],
});
