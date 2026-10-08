// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build
// 简体中文镜像（非官方翻译）。原站：https://skills.addy.ie
// 源仓库：https://github.com/addyosmani/skills.addy.ie（快照 976c6fd）
// 站内 authored 链接已一次性写成带 base 前缀的绝对路径（本站无 Starlight 的
// 自动 base 处理），dev 与 CI 产物一致，base 固定，勿改回 '/'。
export default defineConfig({
  site: 'https://lif3ng-vibe.github.io',
  base: '/docs-cn/agent-skills/',
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
  devToolbar: {
    enabled: false,
  },
});
