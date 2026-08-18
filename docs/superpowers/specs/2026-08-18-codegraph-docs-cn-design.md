# codegraph 中文文档站 — 设计文档

日期：2026-08-18
状态：已获用户批准

## 目标

将 https://colbymchenry.github.io/codegraph/ （Astro Starlight 文档站，18 篇文档 + 1 个落地页）完整汉化，产出一个本地可 dev、可构建的中文文档项目。视觉与原站 100% 一致。

## 源材料

上游仓库 `colbymchenry/codegraph` 的 `site/` 目录（已下载解压至 `C:\Users\lif3n\src\docs\codegraph-main\site\`，仅供翻译底稿，不进入新项目）：

- `astro.config.mjs` — Starlight 配置：英文 sidebar、`base: '/codegraph'`、自定义主题/组件注册
- `src/content/docs/` — 18 篇 Markdown：入门 6、核心概念 3、指南 3、参考 5、故障排查 1（共 ~6500 词）
- `src/pages/index.astro` — 落地页（hero、3 特性卡、导航/页脚）
- `src/components/` — SiteTitle、SocialIcons（GitHub star 数）、GraphDiagram（SVG 图）
- `src/styles/theme.css` — 纸/墨双主题
- `src/lib/github.ts` — star 数获取（失败静默降级）
- `public/favicon.svg`

## 项目结构

```
C:\Users\lif3n\src\docs\codegraph-docs-cn\
├── astro.config.mjs        ← base: '/'，defaultLocale: 'zh'，中文 sidebar
├── package.json            ← name: codegraph-docs-cn
├── public\favicon.svg      ← 原样
└── src\
    ├── pages\index.astro       ← 落地页汉化
    ├── components\             ← SiteTitle 汉化；GraphDiagram/SocialIcons 原样
    ├── lib\github.ts           ← 原样
    ├── styles\theme.css        ← 原样
    └── content\docs\           ← 18 篇 md 全译，目录结构不变
```

## 配置与 UI 中文化

- `astro.config.mjs`：
  - `site` 去掉（本地项目），`base: '/'`
  - `defaultLocale: 'zh'` — Starlight 内置中文 UI（搜索、上一页/下一页、目录标题等自动中文化）
  - sidebar 分组/条目标题译为中文：入门、核心概念、指南、参考、故障排查
  - `title`/`description` 译为中文
- `index.astro`：`lang="zh-CN"`、`<title>`/meta description、hero 标题“以图谱理解任何代码库”、特性卡片、按钮（“快速开始”、“查看文档”）、复制反馈 "Copied"→“已复制”
- `SiteTitle.astro`：副标题（如有英文）汉化

## 翻译规范（18 篇文档）

1. **frontmatter**：title、description 全译（影响侧边栏、SEO、页面标题）
2. **正文**：全文意译，技术写作风格，不逐词直译
3. **术语**：首次出现附英文原词，如“知识图谱（knowledge graph）”；此后统一用中文
4. **不译项**：代码块、命令、API 方法名、配置键、文件路径、产品/工具名（tree-sitter、MCP、SQLite、Claude Code、Cursor 等）、表格中的 Method/命令列
5. **锚点链接**：文内 `#锚点` 引用中文标题后需重算（Starlight 按标题 slug 生成锚点），逐页核对
6. **占位符/变量**（如 `{braces}`）：原样保留

## 验证

- `npm install` 成功
- `npm run build` 零错误零警告（Astro 构建校验内部死链，兜底翻译引入的链接错误）
- `npm run dev` 逐页人工核对：渲染、侧边栏中文、搜索中文 UI、锚点跳转、落地页文案
- 抽查英文残留：构建后对 `dist/` grep 长英文句子（≥5 个连续英文单词的正文）

## 错误处理

- star 数获取失败 → 原组件已有降级逻辑，不改
- 构建报死链 → 逐个修复，不留警告
- 锚点失效 → 按构建产物实际 slug 修正

## 范围外

- 不部署线上（用户选了“本地 dev + 可构建”）
- 不做双语 locale 切换
- 不翻译上游仓库的 README/CHANGELOG 等非站点内容
- 不新增功能、不改视觉样式
