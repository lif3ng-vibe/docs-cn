// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Orca 中文文档（非官方翻译）。原站：https://www.onorca.dev/docs
// Starlight 单语言中文：defaultLocale 'root' + locales.root.lang 'zh-CN'，
// 写 'zh' 会强制 /zh/ URL 前缀导致 sidebar slug 失配。
export default defineConfig({
	site: undefined,
	base: '/',
	integrations: [
		starlight({
			title: 'Orca 文档',
			description: 'Orca——跨 git worktree 编排编码智能体的桌面应用。非官方中文文档。',
			defaultLocale: 'root',
			locales: {
				root: { label: '简体中文', lang: 'zh-CN' },
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/stablyai/orca',
				},
			],
			customCss: ['./src/styles/theme.css'],
			sidebar: [
				{
					label: '开始',
					items: [
						{ label: 'Orca 是什么', slug: 'index' },
						{ label: '安装', slug: 'install' },
						{ label: '你的第一个三智能体会话', slug: 'first-session' },
						{ label: '运行方式', slug: 'ways-to-run' },
					],
				},
				{
					label: 'Orca 模型',
					items: [
						{ label: 'Worktree', slug: 'model/worktrees' },
						{ label: '标签页、窗格与分屏', slug: 'model/tabs-panes-splits' },
						{ label: '智能体与会话', slug: 'model/agents-sessions' },
						{ label: '会话恢复', slug: 'model/session-restore' },
						{ label: '快速打开与跳转面板', slug: 'model/quick-open' },
					],
				},
				{
					label: '使用智能体',
					items: [
						{ label: '受支持的智能体', slug: 'agents/supported' },
						{ label: '在 Orca 中使用 Claude Code', slug: 'agents/claude-code' },
						{ label: '在 Orca 中使用 GLM-5.2', slug: 'agents/glm-agent' },
						{ label: '在 Orca 中使用 Codex', slug: 'agents/codex' },
						{ label: '在 Orca 中使用 Cursor CLI', slug: 'agents/cursor-cli' },
						{ label: '热切换 Codex 账号', slug: 'agents/codex-hot-swap' },
						{ label: '聊天界面（原生聊天）', slug: 'agents/native-chat' },
						{ label: '智能体会话历史', slug: 'agents/session-history' },
						{ label: '智能体休眠', slug: 'agents/hibernation' },
						{ label: '用量与限流追踪', slug: 'agents/usage-tracking' },
						{ label: '智能体钩子与记忆', slug: 'agents/hooks-memory' },
					],
				},
				{
					label: '审查与交付代码',
					items: [
						{ label: 'Diff 查看器', slug: 'review/diff-viewer' },
						{ label: '标注 AI Diff', slug: 'review/annotate-ai-diff' },
						{ label: '归属', slug: 'review/attribution' },
						{ label: '在 Orca 中提交与推送', slug: 'review/commit-push' },
						{ label: 'GitHub 评审、议题与 Actions', slug: 'review/github' },
						{ label: 'Linear 事项抽屉', slug: 'review/linear' },
						{ label: 'Jira 事项抽屉', slug: 'review/jira' },
					],
				},
				{
					label: '在 Orca 中编辑',
					items: [
						{ label: 'Monaco 编辑器与自动保存', slug: 'editing/monaco' },
						{ label: '富文本 Markdown 编辑器', slug: 'editing/markdown' },
						{ label: '文件浏览器', slug: 'editing/file-explorer' },
						{ label: '查看器', slug: 'editing/viewers' },
					],
				},
				{
					label: 'Orca CLI',
					items: [
						{ label: 'CLI 概览', slug: 'cli/overview' },
						{ label: 'CLI 参考', slug: 'cli/reference' },
						{ label: '编排', slug: 'cli/orchestration' },
						{ label: '自动化', slug: 'cli/automations' },
						{ label: '技能', slug: 'cli/skills' },
						{ label: '计算机使用', slug: 'cli/computer-use' },
						{ label: 'Worktree 检查点', slug: 'cli/worktree-checkpoints' },
					],
				},
				{
					label: '内置浏览器',
					items: [
						{ label: '概览', slug: 'browser/overview' },
						{ label: '设计模式', slug: 'browser/design-mode' },
						{ label: '浏览器配置', slug: 'browser/profiles' },
					],
				},
				{
					label: '实用方案',
					items: [
						{ label: '并行智能体', slug: 'recipes/parallel-agents' },
						{ label: '在 worktree 之间跳转', slug: 'recipes/jump-worktrees' },
						{ label: '远程 worktree', slug: 'recipes/remote-worktrees' },
						{ label: '评审 AI Diff', slug: 'recipes/review-ai-diff' },
						{ label: '修复设计模式', slug: 'recipes/design-mode-fix' },
					],
				},
				{
					label: '参考',
					items: [
						{ label: '移动端伴侣应用', slug: 'mobile' },
						{ label: 'Android APK', slug: 'android-apk' },
						{ label: '远程服务器', slug: 'remote-servers' },
						{ label: 'SSH', slug: 'ssh' },
						{ label: '终端', slug: 'terminal' },
						{ label: '通知', slug: 'notifications' },
						{ label: '设置', slug: 'settings' },
						{ label: '遥测', slug: 'telemetry' },
						{ label: 'GitHub 错误', slug: 'github-errors' },
						{ label: '活动', slug: 'activity' },
					],
				},
				{
					label: '故障排查',
					items: [{ label: '故障排查', slug: 'troubleshooting' }],
				},
			],
		}),
	],
});
