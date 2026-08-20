// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// AI Coding Dictionary 中文版（非官方翻译）。原站：https://www.aihero.dev/ai-coding-dictionary
// 源仓库：https://github.com/mattpocock/dictionary-of-ai-coding（dictionary/ 目录 69 词条）
// sidebar 沿用原站 7 个 Section 分类与顺序（internal/Curriculum.md）。
// Starlight 单语言中文：defaultLocale 'root' + locales.root.lang 'zh-CN'。
export default defineConfig({
	site: undefined,
	base: process.env.DOCS_BASE || '/',
	integrations: [
		starlight({
			title: 'AI 编码词典中文版',
			description: 'AI 编码的词汇表，译成平实的中文。非官方翻译。',
			defaultLocale: 'root',
			locales: {
				root: { label: '简体中文', lang: 'zh-CN' },
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/mattpocock/dictionary-of-ai-coding',
				},
			],
			customCss: ['./src/styles/theme.css'],
			sidebar: [
				{ label: '词典首页', slug: 'index' },
				{ label: 'Section 1 — 模型（The Model）', items: [
					{ label: 'AI（人工智能）', slug: 'terms/ai' },
					{ label: 'Model（模型）', slug: 'terms/model' },
					{ label: 'Parameters（参数量）', slug: 'terms/parameters' },
					{ label: 'Training（训练）', slug: 'terms/training' },
					{ label: 'Inference（推理）', slug: 'terms/inference' },
					{ label: 'Effort（用力度）', slug: 'terms/effort' },
					{ label: 'Token（词元）', slug: 'terms/token' },
					{ label: 'Next-token prediction（下一 token 预测）', slug: 'terms/next-token-prediction' },
					{ label: 'Non-determinism（非确定性）', slug: 'terms/non-determinism' },
					{ label: 'Model provider（模型提供商）', slug: 'terms/model-provider' },
					{ label: 'Harness（智能体运行框架）', slug: 'terms/harness' },
					{ label: 'Model provider request（模型提供商请求）', slug: 'terms/model-provider-request' },
					{ label: 'Input tokens（输入 token）', slug: 'terms/input-tokens' },
					{ label: 'Output tokens（输出 token）', slug: 'terms/output-tokens' },
					{ label: 'Prefix cache（前缀缓存）', slug: 'terms/prefix-cache' },
					{ label: 'Cache tokens（缓存 token）', slug: 'terms/cache-tokens' },
				]},
				{ label: 'Section 2 — 会话、上下文窗口与轮（Sessions, Context Windows & Turns）', items: [
					{ label: 'Stateless（无状态）', slug: 'terms/stateless' },
					{ label: 'Context（上下文）', slug: 'terms/context' },
					{ label: 'Context window（上下文窗口）', slug: 'terms/context-window' },
					{ label: 'Stateful（有状态）', slug: 'terms/stateful' },
					{ label: 'Agent（智能体）', slug: 'terms/agent' },
					{ label: 'System prompt（系统提示词）', slug: 'terms/system-prompt' },
					{ label: 'Session（会话）', slug: 'terms/session' },
					{ label: 'Turn（轮）', slug: 'terms/turn' },
				]},
				{ label: 'Section 3 — 工具与环境（Tools & Environment）', items: [
					{ label: 'Environment（环境）', slug: 'terms/environment' },
					{ label: 'Filesystem（文件系统）', slug: 'terms/filesystem' },
					{ label: 'Tool（工具）', slug: 'terms/tool' },
					{ label: 'Tool call（工具调用）', slug: 'terms/tool-call' },
					{ label: 'Tool result（工具结果）', slug: 'terms/tool-result' },
					{ label: 'MCP（模型上下文协议）', slug: 'terms/mcp' },
					{ label: 'Permission request（权限请求）', slug: 'terms/permission-request' },
					{ label: 'Permission mode（权限模式）', slug: 'terms/permission-mode' },
					{ label: 'Agent mode（智能体模式）', slug: 'terms/agent-mode' },
					{ label: 'Sandbox（沙箱）', slug: 'terms/sandbox' },
				]},
				{ label: 'Section 4 — 失败模式（Failure Modes）', items: [
					{ label: 'Sycophancy（迎合）', slug: 'terms/sycophancy' },
					{ label: 'Hallucination（幻觉）', slug: 'terms/hallucination' },
					{ label: 'Parametric knowledge（参数化知识）', slug: 'terms/parametric-knowledge' },
					{ label: 'Knowledge cutoff（知识截止点）', slug: 'terms/knowledge-cutoff' },
					{ label: 'Contextual knowledge（情境知识）', slug: 'terms/contextual-knowledge' },
					{ label: 'Attention relationship（注意力关系）', slug: 'terms/attention-relationship' },
					{ label: 'Attention budget（注意力预算）', slug: 'terms/attention-budget' },
					{ label: 'Attention degradation（注意力退化）', slug: 'terms/attention-degradation' },
					{ label: 'Smart zone（聪明区）', slug: 'terms/smart-zone' },
				]},
				{ label: 'Section 5 — 交接（Handoffs）', items: [
					{ label: 'Clearing（清空）', slug: 'terms/clearing' },
					{ label: 'Handoff（交接）', slug: 'terms/handoff' },
					{ label: 'Primary source（一手来源）', slug: 'terms/primary-source' },
					{ label: 'Secondary source（二手来源）', slug: 'terms/secondary-source' },
					{ label: 'Handoff artifact（交接产物）', slug: 'terms/handoff-artifact' },
					{ label: 'Spec（规格）', slug: 'terms/spec' },
					{ label: 'Ticket（工单）', slug: 'terms/ticket' },
					{ label: 'Compaction（压缩）', slug: 'terms/compaction' },
					{ label: 'Autocompact（自动压缩）', slug: 'terms/autocompact' },
				]},
				{ label: 'Section 6 — 记忆与转向（Memory and Steering）', items: [
					{ label: 'Memory system（记忆系统）', slug: 'terms/memory-system' },
					{ label: 'AGENTS.md（智能体说明文件）', slug: 'terms/agents-md' },
					{ label: 'Progressive disclosure（渐进披露）', slug: 'terms/progressive-disclosure' },
					{ label: 'Context pointer（上下文指针）', slug: 'terms/context-pointer' },
					{ label: 'Skill（技能）', slug: 'terms/skill' },
					{ label: 'Subagent（子智能体）', slug: 'terms/subagent' },
				]},
				{ label: 'Section 7 — 工作模式（Patterns of Work）', items: [
					{ label: 'Human-in-the-loop（人在回路）', slug: 'terms/human-in-the-loop' },
					{ label: 'AFK（离开键盘）', slug: 'terms/afk' },
					{ label: 'Automated check（自动化检查）', slug: 'terms/automated-check' },
					{ label: 'Automated review（自动化评审）', slug: 'terms/automated-review' },
					{ label: 'Human review（人工评审）', slug: 'terms/human-review' },
					{ label: 'Vibe coding（氛围编程）', slug: 'terms/vibe-coding' },
					{ label: 'Design concept（设计概念）', slug: 'terms/design-concept' },
					{ label: 'Grilling（追问）', slug: 'terms/grilling' },
					{ label: 'Prototyping（原型法）', slug: 'terms/prototyping' },
					{ label: 'DX（开发者体验）', slug: 'terms/dx' },
					{ label: 'AX（智能体体验）', slug: 'terms/ax' },
				]},
			],
		}),
	],
});
