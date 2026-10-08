# AI SDK 文档中文镜像（ai-sdk-docs-cn）

AI SDK（Vercel 官方 TypeScript AI 工具集）文档站的**非官方简体中文全量翻译镜像**，
基于上游站点工程（`@vercel/geistdocs` / fumadocs / Next.js）原班工具链构建。

- **原文**：https://ai-sdk.dev （仓库 https://github.com/vercel/ai ）
- **上游快照**：vercel/ai `main@5028fa4`（2026-10-08），Apache-2.0（随附 LICENSE）
- **翻译范围**：v7 当前版全部 540 页 MDX（docs 294 + providers 153 + cookbook 93），
  另含落地页、导航与全部 UI 文案；页面 URL 与原站保持一致，仅标题锚点随译文重算
- **声明**：本项目为社区翻译，与 Vercel 无关；内容版权归 Vercel 所有，
  翻译部分同样以 Apache-2.0 提供。内容基于快照翻译，不随上游自动更新
  （同步时对照 `ai-sdk-main/` 快照 diff 后重译增量）。

## 本地运行

```bash
pnpm install
pnpm --filter ai-sdk-docs dev     # http://localhost:3000
```

要求：Node.js >= 20.9.0、启用 Corepack 的 pnpm（`corepack enable`）。

## 构建（GitHub Pages 静态导出）

```bash
NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL=https://lif3ng-vibe.github.io/docs-cn/ai-sdk \
  pnpm --filter ai-sdk-docs build
```

产物在 `apps/docs/out/`（已做 root-param 目录折叠与板块根跳转桩），部署到
`/docs-cn/ai-sdk/` 子路径即可；`basePath` 写死在 `next.config.ts` 与
`lib/geistdocs/config.tsx`（迁移子路径需同步改这两处）。

## 工程说明（相对上游的改动）

| 改动 | 原因 |
| --- | --- |
| 内容 v7-only，删除 v5/v6 路由树与版本切换器 | 镜像只翻译当前版 |
| `next/font/google` → `geist` 包本地字体 | 构建机无 Google Fonts 外网 |
| `output: 'export'` + `basePath` + `trailingSlash` | GitHub Pages 子路径静态托管 |
| 删 middleware/proxy、api/chat、og、llms/md 路由组 | 静态导出不支持 / catch-all 与页面目录冲突 |
| 搜索改 fumadocs 静态索引（`app/api/search` + 自定义 SearchDialog） | 无服务端；`cn` locale 挂 Orama 中文分词器 |
| `remarkImageOptions: false` | 远程图片无法在构建机下载量尺寸 |
| pnpm patch geistdocs（桩 feedback Server Action） | Server Action 与导出不兼容；反馈已禁用 |
| `scripts/postprocess-export.mjs` | 折叠导出的 root-param 目录层、补板块根跳转桩 |
| `scripts/build-anchor-map.mjs` | git 快照与译文按标题顺序配对，产出全量锚点映射 |

翻译工作流：子代理按批次翻译 `content/` 源文件（术语表见 `GLOSSARY.md`），
锚点映射在 `.anchor-maps*/`，构建时 `sync-content` 转换为 fumadocs 结构。

已知怪癖：`next dev`（开发模式）下全部路由 404 —— Next 16 root param（`[lang]`）
在 dev 的 URL 解析与导出产物不一致；交付物为 `next build` 的静态导出
（已验证 19 条关键路由全 200、页面中文与 `lang=zh-CN` 正常），本地预览请
起静态服务器指向 `apps/docs/out/`（注意挂在 `/docs-cn/ai-sdk/` 前缀下）。
