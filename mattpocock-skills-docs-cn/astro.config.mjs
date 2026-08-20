// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Matt Pocock Skills 中文文档（非官方翻译）。原站：https://www.aihero.dev/skills
// 源仓库：https://github.com/mattpocock/skills（docs/ 目录，25 篇）
// Starlight 单语言中文：defaultLocale 'root' + locales.root.lang 'zh-CN'，
// 写 'zh' 会强制 /zh/ URL 前缀导致 sidebar slug 失配。
export default defineConfig({
	site: undefined,
	// 日常 dev/build 不设 DOCS_BASE → base '/'；GitHub Pages CI 设 DOCS_BASE=/docs-cn/mattpocock-skills/
	base: process.env.DOCS_BASE || '/',
	integrations: [
		starlight({
			title: 'Matt Pocock Skills 中文文档',
			description: 'Matt Pocock 的智能体技能集——给真正的工程师用的 AI 技能。非官方中文文档。',
			defaultLocale: 'root',
			locales: {
				root: { label: '简体中文', lang: 'zh-CN' },
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/mattpocock/skills',
				},
			],
			customCss: ['./src/styles/theme.css'],
			sidebar: [
				{
					label: '开始',
					items: [
						{ label: '这套技能集是什么？', slug: 'index' },
						{
							label: '工程技能 · 用户调用',
							items: [
								{ label: 'setup-matt-pocock-skills：初始化配置', slug: 'engineering/setup-matt-pocock-skills' },
								{ label: 'ask-matt：问路', slug: 'engineering/ask-matt' },
								{ label: 'grill-with-docs：带领域建模的追问', slug: 'engineering/grill-with-docs' },
								{ label: 'to-spec：把对话落成规格', slug: 'engineering/to-spec' },
								{ label: 'to-tickets：拆成曳光弹工单', slug: 'engineering/to-tickets' },
								{ label: 'implement：按规格实现', slug: 'engineering/implement' },
								{ label: 'wayfinder：规划大块工作', slug: 'engineering/wayfinder' },
								{ label: 'triage：工单分诊', slug: 'engineering/triage' },
								{ label: 'improve-codebase-architecture：改进架构', slug: 'engineering/improve-codebase-architecture' },
							],
						},
						{
							label: '工程技能 · 模型调用',
							items: [
								{ label: 'tdd：测试驱动开发', slug: 'engineering/tdd' },
								{ label: 'code-review：两轴代码评审', slug: 'engineering/code-review' },
								{ label: 'codebase-design：深模块设计', slug: 'engineering/codebase-design' },
								{ label: 'domain-modeling：领域建模', slug: 'engineering/domain-modeling' },
								{ label: 'diagnosing-bugs：诊断 bug', slug: 'engineering/diagnosing-bugs' },
								{ label: 'prototype：原型验证', slug: 'engineering/prototype' },
								{ label: 'research：调研', slug: 'engineering/research' },
								{ label: 'resolving-merge-conflicts：解决合并冲突', slug: 'engineering/resolving-merge-conflicts' },
								{ label: 'wizard：交互式向导', slug: 'engineering/wizard' },
							],
						},
						{
							label: '生产力技能 · 用户调用',
							items: [
								{ label: 'grill-me：追问到底', slug: 'productivity/grill-me' },
								{ label: 'handoff：会话交接', slug: 'productivity/handoff' },
								{ label: 'teach：多会话教学', slug: 'productivity/teach' },
								{ label: 'to-questionnaire：生成问卷', slug: 'productivity/to-questionnaire' },
								{ label: 'wait-what：没听懂就喊停', slug: 'productivity/wait-what' },
							],
						},
						{
							label: '生产力技能 · 模型调用',
							items: [
								{ label: 'grilling：可复用的追问原语', slug: 'productivity/grilling' },
								{ label: 'writing-for-agents：为智能体写作', slug: 'productivity/writing-for-agents' },
							],
						},
					],
				},
			],
		}),
	],
});
