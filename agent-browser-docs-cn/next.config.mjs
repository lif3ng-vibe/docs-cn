import { createGeistdocs } from "@vercel/geistdocs/next";

// 中文镜像：GitHub Pages 子路径部署（/docs-cn/agent-browser/），静态导出。
// 上游的 rewrites（.md markdown 协商）、withMicrofrontends、headers（Vercel
// 预览环境）均为平台/服务端特性，静态导出一并移除。
const withGeistdocs = createGeistdocs();

const config = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  output: "export",
  trailingSlash: true,
  basePath: "/docs-cn/agent-browser",
  // 静态导出无图片优化服务。
  images: { unoptimized: true },
  skipProxyUrlNormalize: true,
  experimental: {
    // Cap static-generation workers: 构建机核数高时并发 prerender 会 OOM。
    cpus: 8,
  },
};

export default withGeistdocs(config);
