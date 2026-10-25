# tailscale-docs-cn — Tailscale 官方文档全站中文镜像

Tailscale（零信任连接平台）官方文档 <https://tailscale.com/docs> 的非官方中文翻译镜像，Starlight 构建，700 页全集：安装、使用场景、解决方案、功能特性、Aperture、Tailscale PAM、Kubernetes Operator、操作指南、集成、账户管理、技术概览与技术参考。

> **非官方声明**：本项目为社区翻译，与 Tailscale, Inc. 无任何关联。Tailscale 及相关名称为其各自所有者的商标。以英文官方文档为准。

## 本地运行

```bash
npm install
npm run dev        # http://localhost:4321
```

## 构建

```bash
npm run build      # 产物 dist/（Pagefind 搜索索引 + sitemap 一并生成）
npm run preview
```

部署到子路径时注入 env（hub Pages 同款）：

```bash
MSYS2_ENV_CONV_EXCL="DOCS_BASE;DOCS_SITE" \
  DOCS_BASE=/docs-cn/tailscale/ DOCS_SITE=https://lif3ng-vibe.github.io \
  npm run build
```

Node ≥ 22.12（读 node_modules 内 Astro engines 实测要求）。

## 源与快照

- 源：<https://tailscale.com/docs>（Vercel + Next.js 闭源站，每页有官方 `.md` 导出，本项目以官方 Markdown 为源，非 HTML 抓取）
- 快照日期：2026-10-24（上游闭包 704 个路径 / 700 页落地）
- 重取快照：`%TEMP%/ts-docs/raw`（`__` 为路径分隔转义）+ `scripts/import-tailscale.mjs <rawDir> <llms.txt> <paths.all>` 可重建内容树与 `sidebar.generated.mjs`

## 工程说明

- 脚手架：Starlight（`defaultLocale: 'root'` + `zh-CN`），`astro.config.mjs` 经 `DOCS_SITE`/`DOCS_BASE` env 注入 hub 部署参数
- `scripts/import-tailscale.mjs`：快照导入（frontmatter 生成、围栏感知链接归一、H1 剥离、sidebar 生成）
- `scripts/fetch-images.mjs`：相对图片引用处理（三候选下载，失败转图注占位）
- `scripts/check-anchors.mjs` / `scan-dist-bold.mjs` / `fix-bold-cjk.mjs` / `progress.mjs`：构建后校验与译态统计
- `GLOSSARY.md`：全站术语表；`TRANSLATION-SPEC.md`：译员规范；`.anchor-maps/`：各批次标题锚点映射（跨页锚点回修与对照工具底稿）

## 已知差异

- 原站 `.md` 导出中的相对图片路径在原站本身已失效（381 处），本镜像就地转为图注占位「*（图：描述）*」，仅 1 张可取回的已落盘
- 上游内容管道占位符 `\[Missing snippet: xxx]` 按原样保留
- UI 标签两种形态并存：控制台英文界面原词直接保留，或「中文（English）」对照
