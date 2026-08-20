# AI 编码词典中文版

[Matt Pocock 的 AI Coding Dictionary](https://github.com/mattpocock/dictionary-of-ai-coding)完整中文翻译——69 个词条，把 AI 编码的词汇译成平实的语言。

> **非官方翻译。** 原站：https://www.aihero.dev/ai-coding-dictionary · 源仓库：https://github.com/mattpocock/dictionary-of-ai-coding
> 快照日期：2026-08-20（上游 main 分支）。此后上游的变更不会自动同步——需要时对照词条页 frontmatter 的 `source` 链接手动 diff。

## 形式约定

- **英文术语保留**：每个词条标题形如「Session（会话）」——英文原词在前、中文译名在旁，因为工具文档、报错与社区讨论里遇到的都是英文原词
- 正文为中文意译；术语首次出现以链接形式给出英文
- 七个 Section 沿用原站分类与顺序（模型 → 会话与上下文 → 工具与环境 → 失败模式 → 交接 → 记忆与转向 → 工作模式）
- 与同仓库的 `mattpocock-skills-docs-cn` 共享术语口径（agent→智能体、session→会话、harness→智能体运行框架 等）

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

- Node.js ≥ 22.12、npm ≥ 9.6.5（`engines` 字段为准）

## 目录结构

```
src/content/docs/terms/   69 个词条（URL 化 slug：Agent mode → agent-mode）
src/content/docs/index.md 落地页（README 引言翻译 + 全部 7 个 Section 的目录）
astro.config.mjs          Starlight 配置（7 个 Section 分组 sidebar）
```

## 翻译说明

- 原词条间的相对链接（`./Agent.md`）已改写为本站路径（`/terms/agent`）；AGENTS.md 因文件名歧义落在 `agents-md` 路径
- 每个词条 frontmatter 的 `source` 指向原站对应词条 URL，slug 一一对应
- 许可证：MIT（上游）；本翻译同样遵循 MIT
