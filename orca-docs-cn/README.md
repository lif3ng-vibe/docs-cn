# Orca 中文文档

[onorca.dev/docs](https://www.onorca.dev/docs) 的非官方中文翻译。基于 Astro + Starlight 重建站点工程，视觉与原站风格统一。

- 原站：https://www.onorca.dev/docs
- 上游产品仓库：https://github.com/stablyai/orca
- 翻译快照日期：2026-08-19

> **重要**：文档站源码（Next.js + fumadocs）不在公开仓库中。本文档内容是按计划从线上站点的 Next.js RSC（React Server Components）payload 提取后重建为 Markdown，再人工汉化。绝大多数正文、代码块、表格、链接完整保留；少量内联图标组件因渲染为组件无法静态提取，已按上下文补全。如需逐字核对，请以原站为准。

## 前置要求

- Node.js ≥ 22.12（Astro 7 / Starlight 0.41 要求）
- npm ≥ 9.6

## 本地运行

```bash
npm install
npm run dev      # http://localhost:4321/
```

## 构建

```bash
npm run build    # 产出 dist/
npm run preview  # 本地预览构建产物
```

## 内容范围

共 57 篇文档，按原站结构分为 10 组：开始、Orca 模型、使用智能体、审查与交付代码、在 Orca 中编辑、Orca CLI、内置浏览器、实用方案、参考、故障排查。

## 翻译说明

- 术语口径见 `GLOSSARY.md`（含"不译名单"）。
- 代码块、命令、配置键、产品名（Orca、Claude Code、Codex、worktree 等）保留英文。
- 按钮/菜单名保留英文加粗并首次出现括注中文。
- 一次性快照翻译，不跟踪上游；如需同步，参考每页 frontmatter 的 `source` 字段对照原站。