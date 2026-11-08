# agent-desktop-docs-cn — agent-desktop 文档简体中文镜像

上游：https://agent-browser.dev/desktop（vercel-labs/agent-desktop，
快照 main@b43ac4f6e892ef608f8851428613c4009f0e84c7，2026-11-05，Apache-2.0）。
本仓库为非官方翻译镜像，仅汉化文案，构建工程与上游原班同栈
（@vercel/geistdocs 2.14 + fumadocs + Next.js 16 静态导出）。

## 构建
- `pnpm install`（根目录，包含 geistdocs 静态导出补丁）
- `pnpm --filter agent-desktop build`（apps/docs）
- 产物：`apps/docs/out/`（已含 /docs-cn/agent-desktop/ basePath 与 postprocess）

## 结构
- apps/docs/ 上游 apps/docs 原班工程（内容汉化、路由静态化）
- patches/  @vercel/geistdocs 2.14 补丁：feedback Server Action 桩、
  搜索路由 staticGET + 客户端 static 模式（cn 带 Mandarin 分词器）
- scripts/  fix-cross-page-anchors.mjs（锚点回修）、postprocess-export.mjs（导出后处理）、
  final-check.mjs（字面 ** 与锚点终检）
- .anchor-maps/ 每页英文标题→中文标题→新锚点映射；GLOSSARY.md 术语表

## 偏离上游说明
- 纯中文单语：locale 键 `cn`（URL 不带前缀），defaultLanguage: cn
- 删除：proxy.ts、Ask AI chat 路由、llms/og/markdown 路由、api/search/export
- 保留：/desktop/api/search（staticGET 导出静态索引，客户端本地检索）
- 字体改 geist npm 本地 woff2；Vercel Analytics/SpeedInsights 移除
- Next 16 dev 模式对 root param 的 URL 解析与导出产物不一致（dev 404 为已知现象，
  交付物以 build 产物为准）
