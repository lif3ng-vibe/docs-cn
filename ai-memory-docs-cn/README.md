# ai-memory 中文文档

[ai-memory](https://github.com/akitaonrails/ai-memory) 的完整中文翻译——给 AI 编码智能体的长期记忆：单个 Rust 二进制跑 MCP/HTTP 服务器，把生命周期钩子捕获的观察编译成 git 版本化的 markdown wiki，让 Claude Code、Codex、Cursor 等不同 CLI 在同一目录共享跨会话、跨智能体的记忆（交接、决策、坑点、流程）。共 36 篇：落地页（README 全译）+ 安装/使用/部署运维 + 架构与内部机制 + 托管工作流 + 自动改进 + 先前技术调研。

> **非官方翻译。** 源仓库：https://github.com/akitaonrails/ai-memory（上游无独立站点，docs/ 目录 35 篇 + 根 README 即全部文档）
> 快照日期：2026-08-21（上游 main 分支）。此后上游的变更不会自动同步——需要时对照源仓库手动 diff。

## 本地运行

```bash
npm install
npm run dev     # 开发服务器，默认 http://localhost:4321
```

## 构建

```bash
npm run build   # 产出 dist/
npm run preview # 本地预览构建产物
```

## 前置要求

- Node.js ≥ 22.12（`engines` 字段为准）
- npm ≥ 9.6.5

## 目录结构

```
src/content/docs/        36 篇文档（35 篇 docs/*.md + README 译成的落地页 index.md）
GLOSSARY.md              术语表（翻译统一口径，也是全文检索术语一致性的清单）
astro.config.mjs         Starlight 配置（中文单语 sidebar）
public/                  原仓库文档图片（logo、架构图、Web UI 截图）
scripts/add-frontmatter.cjs  初次导入时批量生成 frontmatter 的一次性脚本
```

## 翻译说明

- 单语中文站，无 en/zh 切换；CLI 子命令、MCP 工具名、产品名、代码、命令保留英文
- 术语首次出现附英文原词，如「交接（handoff）」「台账（ledger）」；统一口径见 [GLOSSARY.md](./GLOSSARY.md)
- 原文的 `docs/*.md` 站内链接已改写为本站 `/slug/` 路径；GitHub 上游文件链接保留原样
- 每页 frontmatter 的 `source` 字段记录上游源文件 URL
- 与 README 中「请让智能体说英文」类示例：示例提示语保留英文原句（它们是要发给智能体 CLI 的原文），说明文字翻译
- 许可证：MIT（上游）；本翻译同样遵循 MIT
