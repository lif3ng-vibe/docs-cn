import { createGeistdocs } from "@vercel/geistdocs/next";

// 中文镜像：GitHub Pages 子路径部署（/docs-cn/agent-desktop/），静态导出。
// cacheComponents 与 output:'export' 在 metadata 路由上互斥
// （dynamic/revalidate 均被禁用，而导出检查要求其中之一），
// 镜像站无 ISR 运行时，直接关闭。
const withGeistdocs = createGeistdocs();

const config = {
  output: "export",
  trailingSlash: true,
  basePath: "/docs-cn/agent-desktop",
  // 静态导出无图片优化服务；MDX 远程图原 URL 直出。
  images: {
    unoptimized: true,
  },
  experimental: {
    // Cap static-generation workers: Vercel build machine exposes 30 cores,
    // and ~29 concurrent prerender workers OOM the container.
    cpus: 8,
  },
};

export default withGeistdocs(config);
