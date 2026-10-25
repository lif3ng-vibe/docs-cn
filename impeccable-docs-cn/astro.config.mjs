import { defineConfig } from 'astro/config';
import { impeccableShikiThemes } from './site/lib/impeccable-shiki-theme.mjs';
import { worldsReviewPlugin } from './scripts/worlds-review-vite-plugin.mjs';

export default defineConfig({
  srcDir: './site',
  publicDir: './site/public',
  output: 'static',
  // GitHub Pages 子路径部署（docs-cn hub）；authored 链接由 tools/add-base.mjs 源码级前缀化
  site: 'https://lif3ng-vibe.github.io',
  base: '/docs-cn/impeccable',
  markdown: {
    shikiConfig: {
      themes: impeccableShikiThemes,
      defaultColor: false,
    },
  },
  devToolbar: {
    enabled: false,
  },
  build: {
    format: 'directory',
  },
  outDir: './build',
  vite: {
    plugins: [worldsReviewPlugin()],
    build: {
      assetsInlineLimit: 0,
    },
  },
});
