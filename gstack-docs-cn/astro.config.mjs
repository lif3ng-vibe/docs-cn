// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

import { rehypeBaseLinks } from './src/plugins/base-links.mjs';

// hub Pages 部署注入（无 env 时本地开发走根路径）
const DOCS_SITE = process.env.DOCS_SITE || 'http://localhost:4321';
const DOCS_BASE = (process.env.DOCS_BASE || '/').replace(/\/+$/, '') || '/';

export default defineConfig({
  site: DOCS_SITE,
  base: DOCS_BASE,
  devToolbar: {
    enabled: false,
  },
  // 站内 /slug/ 绝对链接与 raw HTML 资源在构建期统一加 base 前缀（CI 免 sed）。
  // Astro 顶层 markdown rehype 作用于所有内容渲染（含 Starlight 页面）；
  // Starlight 0.42.4 的 markdown.processor 在本版本组合上未生效，故不用 worktrunk 的写法。
  markdown: {
    rehypePlugins: [[rehypeBaseLinks, DOCS_BASE]],
  },
  integrations: [
    starlight({
      title: 'gstack',
      description:
        'gstack 中文文档（非官方翻译）：Garry Tan 开源的 Claude Code 虚拟工程团队——CEO、设计、工程经理、评审、QA、安全与发布的全套 slash command 技能集。',
      // 单语言中文：必须 root + lang（写 'zh' 会强制 /zh/ URL 前缀导致 slug 失配）
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      logo: {
        src: './src/assets/icon.png',
      },
      favicon: 'favicon.png',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/garrytan/gstack',
        },
      ],
      sidebar: [
        { label: '首页', slug: 'index' },
        {
          label: '开始',
          items: [
            { label: '为什么是 gstack', slug: 'why-gstack' },
            { label: '安装细节', slug: 'install' },
            { label: '发布与更新渠道', slug: 'releases' },
            { label: '卸载', slug: 'uninstall' },
            { label: '支持层级', slug: 'support-tiers' },
          ],
        },
        {
          label: '核心指南',
          items: [
            { label: '技能深度指南', slug: 'skills' },
            { label: '推荐工作流（gstack + Capy）', slug: 'recommended-harness' },
            { label: 'gstack + Capy：软件工厂', slug: 'capy' },
            { label: '运行 Captain 编队', slug: 'captain' },
          ],
        },
        {
          label: '浏览器与 QA',
          items: [
            { label: '浏览器', slug: 'browser' },
            { label: '无网页 QA', slug: 'qa-without-a-webpage' },
            { label: '域名技能', slug: 'domain-skills' },
            { label: 'Agent 友好报错', slug: 'agent-ready-errors' },
          ],
        },
        {
          label: 'GBrain 持久记忆',
          items: [
            { label: '快速上手', slug: 'gbrain-quick-tour' },
            { label: 'gstack 集成全指南', slug: 'gbrain-with-gstack' },
            { label: '跨机同步', slug: 'gbrain-sync' },
            { label: '同步错误索引', slug: 'gbrain-sync-errors' },
          ],
        },
        {
          label: '实战指南',
          items: [
            { label: '图表与文档格式', slug: 'howto-diagrams-and-formats' },
            { label: '首次生产部署', slug: 'howto-bring-up-a-first-deploy' },
            { label: '为已上线功能写文档', slug: 'howto-document-a-shipped-feature' },
            { label: '文档生成教程', slug: 'tutorial-document-generate' },
            { label: '为什么用 Diataxis', slug: 'explanation-diataxis-in-gstack' },
            { label: 'iOS 真机测试', slug: 'howto-ios-testing-with-gstack' },
          ],
        },
        {
          label: '多 Agent 支持',
          items: [
            { label: '其他 Agent 平台', slug: 'hosts' },
            { label: '新增 Host', slug: 'adding-a-host' },
            { label: 'OpenClaw 集成', slug: 'openclaw' },
          ],
        },
        {
          label: '参考',
          items: [
            { label: '独立二进制', slug: 'standalone-binaries' },
            { label: '隐私与遥测', slug: 'privacy' },
            { label: '语音输入别名', slug: 'voice-input' },
            { label: 'Memorable 记忆桥接', slug: 'memorable-workflow-memory' },
            { label: '故障排查', slug: 'troubleshooting' },
          ],
        },
        {
          label: '项目内幕',
          items: [
            { label: '架构', slug: 'architecture' },
            { label: 'Builder 心法', slug: 'ethos' },
            { label: '参与贡献', slug: 'contributing' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
