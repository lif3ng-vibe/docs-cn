// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// ai-memory 中文文档（非官方翻译）。源仓库：https://github.com/akitaonrails/ai-memory
// 上游无站点工程（Rust 项目，docs/ 目录 35 篇 md + 根 README），故用 Starlight 新建中文站。
// Starlight 单语言中文：defaultLocale 'root' + locales.root.lang 'zh-CN'，
// 写 'zh' 会强制 /zh/ URL 前缀导致 sidebar slug 失配。
export default defineConfig({
	site: undefined,
	// 日常 dev/build 不设 DOCS_BASE → base '/'；GitHub Pages CI 设 DOCS_BASE=/docs-cn/ai-memory/
	base: process.env.DOCS_BASE || '/',
	integrations: [
		starlight({
			title: 'ai-memory 中文文档',
			description: '给 AI 编码智能体的长期记忆——跨 CLI 共享、git 版本化的 markdown wiki。非官方中文文档。',
			defaultLocale: 'root',
			locales: {
				root: { label: '简体中文', lang: 'zh-CN' },
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/akitaonrails/ai-memory',
				},
			],
			customCss: ['./src/styles/theme.css'],
			sidebar: [
				{
					label: '开始',
					items: [
						{ label: 'ai-memory 是什么？', slug: 'index' },
						{ label: '安装指南', slug: 'install' },
						{ label: 'MCP 安装：更多客户端', slug: 'mcp-install' },
						{ label: '日常使用', slug: 'usage' },
					],
				},
				{
					label: '平台',
					items: [
						{ label: 'macOS 支持', slug: 'macos' },
						{ label: 'Windows 支持', slug: 'windows' },
						{ label: 'Shell 补全', slug: 'shell-completions' },
					],
				},
				{
					label: '部署与运维',
					items: [
						{ label: '部署到家庭实验室', slug: 'deploy' },
						{ label: '通过反向代理上 HTTPS', slug: 'https-via-proxy' },
						{ label: '生命周期操作', slug: 'lifecycle-ops' },
						{ label: '多用户归因', slug: 'users' },
						{ label: 'LLM 提供方对比：本地 Ollama vs 托管 OpenRouter', slug: 'llm-provider-comparison' },
						{ label: '向量后端策略', slug: 'vector-backend-policy' },
					],
				},
				{
					label: '架构与设计',
					items: [
						{ label: '架构', slug: 'architecture' },
						{ label: '设计决策（综合）', slug: 'design-decisions' },
						{ label: '可选伴随 crate 与项目', slug: 'companion-crates' },
						{ label: '标记文件：.ai-memory.toml', slug: 'marker-file' },
						{ label: '准入 webhook：持久化前 HTTP 钩子', slug: 'admission-webhooks' },
						{ label: '[auto_scope] 隔离模式', slug: 'auto-scope' },
						{ label: 'Wiki 结构迁移', slug: 'wiki-migrations' },
						{ label: '前端集成：/api/v1', slug: 'frontend-api' },
					],
				},
				{
					label: '托管工作流',
					items: [
						{ label: '托管跨外壳工作流', slug: 'managed-workstreams' },
						{ label: '新增托管外壳', slug: 'managed-harness-contributions' },
					],
				},
				{
					label: '自动改进（实验性）',
					items: [
						{ label: '自动改进循环调研', slug: 'auto-improvement-loop' },
						{ label: '自动改进评审门（Eval Gates）', slug: 'auto-improve-eval-gates' },
						{ label: '自动改进示例评分器', slug: 'auto-improve-eval' },
						{ label: '自动改进 SkillOpt 路线图', slug: 'auto-improve-skillopt-roadmap' },
					],
				},
				{
					label: '先前技术调研',
					items: [
						{ label: '先前技术实现发现', slug: 'prior-art-implementation-findings' },
						{ label: 'Karpathy 的「LLM wiki」调研报告', slug: 'research-karpathy-llm-wiki' },
						{ label: 'agentmemory 调研报告', slug: 'research-agentmemory' },
						{ label: 'agentmemory 问题与 PR 痛点', slug: 'issues-agentmemory' },
						{ label: 'basic-memory 调研报告', slug: 'research-basic-memory' },
						{ label: 'basic-memory 问题与 PR 痛点', slug: 'issues-basic-memory' },
						{ label: 'cognee 调研报告', slug: 'research-cognee' },
						{ label: 'cognee 问题与 PR 痛点', slug: 'issues-cognee' },
						{ label: 'MemPalace 问题与架构综合', slug: 'issues-mempalace' },
					],
				},
				{
					label: '项目',
					items: [
						// 注意：Astro 生成 slug 时去掉文件名中的点，v0.3-roadmap.md → v03-roadmap
						{ label: 'v0.3 路线图', slug: 'v03-roadmap' },
					],
				},
			],
		}),
	],
});
