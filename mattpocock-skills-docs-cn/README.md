# Matt Pocock Skills 中文文档

[Matt Pocock 的智能体技能集](https://github.com/mattpocock/skills)的完整中文翻译——他每天用来做真正工程的 AI 技能（不是氛围编程）：追问对齐、领域建模、TDD、两轴代码评审、架构勘察等 25 个技能的逐篇详解。

> **非官方翻译。** 原站：https://www.aihero.dev/skills · 源仓库：https://github.com/mattpocock/skills
> 快照日期：2026-08-20（上游 main 分支，版本 1.2.3）。此后上游的变更不会自动同步——需要时对照源 URL 手动 diff。

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
- npm ≥ 10

## 目录结构

```
src/content/docs/        25 篇技能文档（engineering/ + productivity/）+ 落地页
GLOSSARY.md              术语表（翻译统一口径，也是全文检索术语一致性的清单）
astro.config.mjs         Starlight 配置（中文单语 sidebar）
```

## 翻译说明

- 单语中文站，无 en/zh 切换；技能名、产品名、代码、命令保留英文
- 术语首次出现附英文原词，如「接缝（seam）」；统一口径见 [GLOSSARY.md](./GLOSSARY.md)
- 原文的站内技能链接（`aihero.dev/skills-<name>`）已改写为本站路径；
  指向 aihero.dev 词典（`ai-coding-dictionary`）的链接保留为原文外链
- 许可证：MIT（上游）；本翻译同样遵循 MIT
