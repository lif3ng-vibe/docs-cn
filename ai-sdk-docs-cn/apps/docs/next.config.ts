import { createGeistdocs } from '@vercel/geistdocs/next';
import type { NextConfig } from 'next';
import { BASE_PATH } from './lib/base-path';

// createGeistdocs composes Fumadocs MDX and discovers App Router pages and
// route handlers so createProxy can recover unknown agent/Markdown requests.
// Restart `next dev` after adding, deleting, or renaming routes.
const withGeistdocs = createGeistdocs();

// 中文镜像：GitHub Pages 子路径部署（/docs-cn/ai-sdk/），静态导出。
// basePath 统一取自 lib/base-path.ts（geistdocs config 与组件层同源）。
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: BASE_PATH,
  // cacheComponents 与 output:'export' 在 metadata 路由上互斥
  // （dynamic/revalidate 均被禁用，而导出检查要求其中之一），
  // 镜像站无 ISR 运行时，直接关闭。
  images: {
    // 静态导出无图片优化服务；MDX 远程图原 URL 直出。
    unoptimized: true,
  },
  experimental: {
    // Cap static-generation workers: the Vercel build machine exposes 30
    // cores, and ~29 concurrent prerender workers OOM the container during
    // "Generating static pages". Local 12-core builds peak fine at 11.
    cpus: 8,
  },
};

export default withGeistdocs(config);
