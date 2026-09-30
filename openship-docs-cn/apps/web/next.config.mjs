import path from "path";
import { fileURLToPath } from "url";
import { createMDX } from "fumadocs-mdx/next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const withMDX = createMDX({ configPath: "./source.config.ts" });

// 中文镜像的静态导出模式（GitHub Pages 托管）：NEXT_OUTPUT=export 启用。
//   NEXT_BASE_PATH          镜像子路径，如 /docs-cn/openship（Next 自动给资源与 <Link> 加前缀）
//   NEXT_PUBLIC_SITE_URL    规范地址（llms.txt/sitemap/OG 用），含子路径
// 不设 NEXT_OUTPUT 时保持上游 standalone 服务器构建，本地 dev 不受影响。
const isExport = process.env.NEXT_OUTPUT === "export";
const basePath = process.env.NEXT_BASE_PATH || undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isExport ? "export" : "standalone",
  ...(basePath ? { basePath } : {}),
  // 静态导出：目录式 URL（/docs/foo/ → index.html，GitHub Pages 直服）+ 关闭图片优化
  ...(isExport ? { trailingSlash: true, images: { unoptimized: true } } : {}),
  // Monorepo: trace from the repo root so the standalone bundle includes the
  // root-hoisted node_modules + workspace packages. Without this, `output:
  // "standalone"` traces from apps/web and can ship an incomplete bundle that
  // fails at runtime with "cannot find module".
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  transpilePackages: ["@repo/ui", "@repo/core"],
  // redirects/rewrites 是服务器能力，静态导出不支持（构建会报错），故导出时置空：
  // .md 原文端点由 scripts/export-post.mjs 在导出后改名 docs-raw/** → docs/**.md 落地。
  async redirects() {
    if (isExport) return [];
    const movedDocs = [
      ["/docs/api/sdk/reference", "/docs/api"],
      ["/docs/api/sdk/deployments", "/docs/api/deployments"],
    ];
    return movedDocs.flatMap(([source, destination]) => [
      { source, destination, permanent: true },
      { source: `${source}.md`, destination: `${destination}.md`, permanent: true },
    ]);
  },
  // Serve each doc as raw markdown at `/docs/<slug>.md` (llms.txt convention) —
  // rewritten to the `docs-raw` route handler, which emits text/markdown.
  async rewrites() {
    if (isExport) return [];
    return [
      { source: "/docs.md", destination: "/docs-raw" },
      { source: "/docs/:slug*.md", destination: "/docs-raw/:slug*" },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname, "../.."),
    resolveAlias: {
      "@/.source/*": "./.source/*",
    },
  },
};

export default withMDX(nextConfig);
