// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { sidebar } from './sidebar.generated.mjs';

// hub Pages 部署注入（无 env 时本地开发走根路径）
const DOCS_SITE = process.env.DOCS_SITE || 'http://localhost:4321';
const DOCS_BASE = (process.env.DOCS_BASE || '/').replace(/\/+$/, '') || '/';

export default defineConfig({
  site: DOCS_SITE,
  base: DOCS_BASE,
  integrations: [
    starlight({
      title: 'Tailscale 中文文档',
      description:
        'Tailscale 官方文档全站中文镜像（非官方翻译）——零信任连接平台：安装、使用场景、功能特性、Aperture、集成与技术参考。',
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      customCss: ['./src/styles/custom.css'],
      sidebar,
    }),
  ],
});
