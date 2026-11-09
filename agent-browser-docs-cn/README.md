# agent-browser 中文文档（非官方翻译）

[vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)（面向 AI 智能体的浏览器自动化 CLI）官方文档的中文镜像。

- 上游快照：`main@4b0e9f01`（2026-11-08，Apache-2.0）
- 上游官方站：https://agent-browser.dev
- 本镜像：https://lif3ng-vibe.github.io/docs-cn/agent-browser/
- 页数：38 页 + 首页

## 构建

```bash
pnpm install        # node >= 22，pnpm 11.1.3（packageManager 钉死）
pnpm build          # fumadocs-mdx + next build（output:export）+ postprocess
pnpm dev            # 本地开发（无 base 路径形态）
```

产物在 `out/`，部署形态为 GitHub Pages 子路径 `/docs-cn/agent-browser/`。

## 工程说明

- 栈：geistdocs 2.7.5 + fumadocs 16.2.2 + Next 16.3.4 静态导出（Turbopack）
- `patches/@vercel__geistdocs@2.7.5.patch`：静态搜索（staticGET + 客户端
  mandarin tokenizer）、feedback action 桩、UI 文案中文化（Copy page /
  On this page / Previous / Next 等）；`patches/next@16.3.4.patch` 沿用上游
- 上游服务端特性已按静态导出改造：删 proxy.ts / api/{docs-chat,
  docs-markdown,docs-md,mcp} / og 路由（OG 图指上游）/ llms.txt route
  （postprocess 生成静态版）；api/search 换 geistdocs staticGET 静态索引
- `scripts/postprocess-export.mjs`：折叠 out/cn（root param 物化层）、
  生成 llms.txt
- 单语中文（`[lang]` root param = cn，物化后折叠）；默认语言 cn，搜索
  用 @orama/tokenizers mandarin 分词
- 术语表见 `GLOSSARY.md`；翻译与锚点规则（中文标题 → 中文 slug，
  `src/lib/remark-legacy-headings.ts` 保留 CJK）

## 免责

本站为社区翻译，非官方维护；内容以上游英文文档为准。翻译错误欢迎提
issue 到 [lif3ng-vibe/docs-cn](https://github.com/lif3ng-vibe/docs-cn)。
