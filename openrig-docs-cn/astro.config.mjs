// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// hub Pages 部署注入（无 env 时本地开发走根路径）
const DOCS_SITE = process.env.DOCS_SITE || 'http://localhost:4321';
const DOCS_BASE = (process.env.DOCS_BASE || '/').replace(/\/+$/, '') || '/';

export default defineConfig({
  site: DOCS_SITE,
  base: DOCS_BASE,
  integrations: [
    starlight({
      title: 'OpenRig 文档',
      description: 'OpenRig 中文文档（非官方翻译）：多智能体协作框架，让 Claude Code、Codex 与 Pi 作为一个团队工作。',
      // 单语言中文：必须 root + lang（写 'zh' 会强制 /zh/ URL 前缀导致 slug 失配）
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      logo: {
        src: './src/assets/openrig-logo.svg',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/mvschwarz/openrig' },
      ],
      sidebar: [
        { label: '开始', slug: 'index' },
        {
          label: '参考',
          items: [{ autogenerate: { directory: 'reference' } }],
        },
        {
          label: '架构实录（As-Built）',
          items: [{ autogenerate: { directory: 'as-built' } }],
        },
        {
          label: '发布说明',
          items: [{ autogenerate: { directory: 'releases' } }],
        },
        { label: '设计', slug: 'design' },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
