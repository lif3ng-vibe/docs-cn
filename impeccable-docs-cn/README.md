# impeccable-docs-cn — Impeccable 中文文档（源码重建版）

[impeccable.style](https://impeccable.style) 的非官方中文翻译 —— 基于**上游最后公开的 Astro 站点源码快照**重建，可本地构建。

> **非官方声明**：本项目是学习用途的汉化镜像，Impeccable 的名称、设计与内容版权归 [Paul Bakaus](https://github.com/pbakaus) 所有（Apache-2.0）。

## 快照口径

- 上游仓库：`pbakaus/impeccable`，站点源码位于 `site/`，快照 **`main@b5ec969c`（2026-07-21）** —— 此后站点源码转入上游私有仓库 `impeccable-site`，公开快照比线上站旧约 3 个月
- 为与线上站**页集对齐**，从线上 HTML 回填了 6 个页面：`generate` 命令页（替代已弃用的 `craft`）+ 概念页 `new-work` / `improve-design` / `design-system` / `image-generation` / `doctor`；`cli/engine/registry/antipatterns.mjs` 的规则元数据（name/description）同步采线上译名
- 被重写页面的**正文**仍是 2026-07 版（版本差非翻译错）；需要与线上逐页对照请看姊妹版 `impeccable-mirror-cn`（线上构建产物镜像）

## 本地运行

```bash
npm install          # Node >= 22.12
npm run dev          # http://localhost:4321/docs-cn/impeccable/
npm run build        # prebuild(counts/detector/API JSON) + astro build → build/
```

- 部署基线：`base=/docs-cn/impeccable`（astro.config.mjs），站内 authored 链接已由 `tools/add-base.mjs` 源码级前缀化
- 站点子路径部署后如需改 base：改 astro.config.mjs + 重跑 `node tools/add-base.mjs`（幂等）+ `node tools/gen-sitemap.mjs`

## 结构与生成链

- `site/content/skills/*.md`：24 个命令页 editorial（frontmatter 仅 tagline）
- `site/content/reference/*.md` + `tutorials/*.md`：概念/自动化文档与教程（content collections）
- `scripts/prebuild-site.mjs`：构建前三件套 —— `site/public/js/generated/counts.js`（命令/规则计数）、`cli/engine/detect-antipatterns-browser.js` 拷贝、`_data/api/*.json`（复用上游 `scripts/lib/api-data.js`）
- `site/pages/docs/[...slug].astro`：命令页 = editorial + 元数据（`skill/scripts/command-metadata.json`）；上游原 `detector` 游乐场页已移除（依赖 tests/fixtures，线上亦下线）

## 已知限制

- `labs/`、`shader-lab/`、`live-lab/` 三个内部实验工装页保持英文（线上站已移除同类页面；其动态内容来自 skill 目录的产品数据目录，属产品本体不译）
- `/neo-mirai/`（虚构会议演示页）是设计成品展示，保持英文
- 检测器覆盖层的规则提示是 Rust/WASM 编译产物（`site/public/js/detect-antipatterns-browser.js`），保持英文；页面自身的图注/说明已汉化
- canonical/og:url 保持指向官方站（镜像语义）
