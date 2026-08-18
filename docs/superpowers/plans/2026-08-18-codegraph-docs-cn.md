# codegraph 中文文档站 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把上游 `colbymchenry/codegraph` 的 `site/` Starlight 文档站完整汉化为可本地 dev、可构建的 `codegraph-docs-cn` 项目，视觉与原站一致。

**Architecture:** 整体拷贝上游 `site/`（已解压在 `C:\Users\lif3n\src\docs\codegraph-main\site\`，仅作底稿）为新项目；改 Starlight 配置为中文 locale + 中文侧边栏 + `base: '/'`；落地页与组件文案汉化；18 篇 Markdown 按术语表全译；内链 `/codegraph/` 前缀批量改写；页内锚点随中文标题重算。

**Tech Stack:** Astro 6 + Starlight 0.39（沿用上游 `site/package.json` 依赖版本），Node ≥ 20.3（Astro 6 要求）。

## Global Constraints

- 规格：`docs/superpowers/specs/2026-08-18-codegraph-docs-cn-design.md`。以下规则对每个任务生效。
- 新项目根：`C:\Users\lif3n\src\docs\codegraph-docs-cn\`；底稿（只读，不修改）：`C:\Users\lif3n\src\docs\codegraph-main\site\`。
- Windows + Git Bash 环境；npm 不改 registry 配置（安装若卡住，向用户说明，不自行换源）。
- 每个任务结束必须 `npm run build` 零错误零警告后才能 commit。
- commit message 用中文 + conventional 前缀，结尾加 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`。

### 术语表（全站统一，首次出现附英文原词）

| 英文 | 中文 |
|---|---|
| knowledge graph | 知识图谱 |
| symbol | 符号 |
| node | 节点 |
| edge | 边 |
| extraction | 提取 |
| resolution / reference resolution | 解析 / 引用解析 |
| full index | 全量索引 |
| incremental update / sync | 增量更新 / 增量同步 |
| file watcher | 文件监听器 |
| debounce | 防抖 |
| impact radius | 影响半径 |
| blast radius | 影响范围 |
| callers / callees | 调用方 / 被调用项 |
| call graph / call path | 调用图 / 调用路径 |
| dynamic dispatch | 动态派发 |
| synthesizer / synthesized edge | 合成器 / 合成边 |
| provenance | 来源 |
| staleness banner | 过期提示横幅 |
| connect-time catch-up | 连接时补齐 |
| agent | 智能体 |
| tool call | 工具调用 |
| local-first | 本地优先 |
| zero-config | 零配置 |
| installer | 安装器 |
| instructions file | 指令文件 |
| route / handler | 路由 / 处理器 |
| tracked file | 已跟踪文件 |
| self-contained / bundled runtime | 自包含 / 自带运行时 |
| working tree | 工作区 |

**不译**（保留原文）：`codegraph` 全部子命令与输出、`codegraph_explore` 等 MCP 工具名、`CODEGRAPH_*` 等环境变量、tree-sitter、MCP、SQLite、FTS5、AST、WAL、Claude Code、Cursor、Codex CLI、opencode、Hermes Agent、Gemini CLI、Antigravity IDE、Kiro、Node、npm、TypeScript、CommonJS、git/GitHub/gitignore、SVN、Perforce、VCS、CI、Electron、所有代码块、命令、路径、文件名、配置键（`maxNodes`、`exclude` 等）、API 方法名、框架名（Django/Flask/Express…）。

**标点与混排**：中文正文用全角标点（，。：；？！、（）""——）；代码/命令内保持半角；中文与英文或数字之间加一个半角空格（"覆盖 20+ 语言"）；百分数与数字保持半角。

**翻译质量线**：意译，技术文档语气，不逐词直译、不造翻译腔（避免"被……所"滥用、"对于……而言"开头句）。frontmatter description 是一句话摘要，保持一句话。

---

### Task 1: 脚手架 — 拷贝 site/ 并验证工具链

**Files:**
- Create: `codegraph-docs-cn/`（整目录，自 `codegraph-main/site/` 拷贝）

**Interfaces:**
- Produces: 一个原样（英文、base `/codegraph`）但能 `npm run build` 通过的项目，供后续任务在其上修改。

- [ ] **Step 1: 确认 Node 版本**

Run: `node -v`
Expected: ≥ 20.3（Astro 6 要求）。低于此版本停下向用户报告。

- [ ] **Step 2: 拷贝项目**

```bash
cd /c/Users/lif3n/src/docs
cp -r codegraph-main/site codegraph-docs-cn
```

- [ ] **Step 3: 改 package.json 包名**

`codegraph-docs-cn/package.json` 中 `"name": "site"` 改为 `"name": "codegraph-docs-cn"`，`"version": "0.0.1"` 改为 `"0.1.0"`，其余不动。

- [ ] **Step 4: 安装依赖**

Run: `cd /c/Users/lif3n/src/docs/codegraph-docs-cn && npm install`
Expected: 成功（sharp 原生依赖在 win32 x64 正常安装）。失败/长时间卡住 → 向用户报告，不擅自换 registry。

- [ ] **Step 5: 基线构建**

Run: `cd /c/Users/lif3n/src/docs/codegraph-docs-cn && npm run build`
Expected: 构建成功，~20 个页面，零错误。（star 数获取失败不阻塞——`github.ts` 有降级。）

- [ ] **Step 6: Commit**

```bash
cd /c/Users/lif3n/src/docs
git add codegraph-docs-cn
git commit -m "chore: 从上游 site/ 搭建 codegraph-docs-cn 脚手架

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

（`.gitignore` 已排除 `node_modules/`、`dist/`、`.astro/`。）

---

### Task 2: 站点配置与骨架中文化

**Files:**
- Modify: `codegraph-docs-cn/astro.config.mjs`（整文件重写，内容见下）
- Modify: `codegraph-docs-cn/src/pages/index.astro`（仅 head/文案/aria-label，样式与结构不动）
- Modify: `codegraph-docs-cn/src/components/SocialIcons.astro`（两处导航文案 + aria-label）
- Modify: `codegraph-docs-cn/src/components/GraphDiagram.astro`（仅 aria-label）
- Modify: `codegraph-docs-cn/src/styles/theme.css`（仅 `--sl-font` 加 CJK fallback）
- Modify: `codegraph-docs-cn/src/content/docs/**/*.md`（18 个文件，仅 `/codegraph/` 链接前缀改写）

**Interfaces:**
- Consumes: Task 1 的可构建项目。
- Produces: 中文 UI 框架（Starlight 内置中文搜索/分页/目录文案）、中文侧边栏、`base: '/'`、改写后的内链；正文仍是英文，供 Task 3–7 逐篇替换。

- [ ] **Step 1: 重写 astro.config.mjs**

整文件替换为（与上游差异：去 `site`、`base: '/'`、`defaultLocale: 'zh'` + `locales`、中文 title/description、中文 sidebar；其余逐字保留）：

```js
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	base: '/',
	integrations: [
		starlight({
			title: 'codegraph',
			description:
				'一款本地优先的代码智能工具，把任何代码库变成可供 AI 编码智能体查询的知识图谱。',
			favicon: '/favicon.svg',
			defaultLocale: 'zh',
			locales: {
				zh: { label: '简体中文' },
			},
			head: [
				{
					// Default to the light / paper theme on first visit; the toggle still
					// lets a visitor switch to (and persist) the dark / ink theme.
					tag: 'script',
					content:
						"if(!localStorage.getItem('starlight-theme')){try{localStorage.setItem('starlight-theme','light')}catch(e){}document.documentElement.dataset.theme='light';document.documentElement.style.colorScheme='light'}",
				},
			],
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/colbymchenry/codegraph',
				},
			],
			customCss: [
				'@fontsource-variable/archivo',
				'@fontsource/ibm-plex-mono/400.css',
				'@fontsource/ibm-plex-mono/500.css',
				'@fontsource/ibm-plex-mono/600.css',
				'./src/styles/theme.css',
			],
			components: {
				// Wordmark in the docs header.
				SiteTitle: './src/components/SiteTitle.astro',
				// Default GitHub icon + a live star-count pill (matches the landing nav).
				SocialIcons: './src/components/SocialIcons.astro',
			},
			expressiveCode: {
				themes: ['github-light', 'github-dark'],
				styleOverrides: {
					borderRadius: '0px',
					borderColor: '#cdcabf',
					codeFontFamily: "'IBM Plex Mono', ui-monospace, monospace",
				},
			},
			sidebar: [
				{
					label: '入门',
					items: [
						{ label: '简介', slug: 'getting-started/introduction' },
						{ label: '快速开始', slug: 'getting-started/quickstart' },
						{ label: '安装', slug: 'getting-started/installation' },
						{ label: '配置', slug: 'getting-started/configuration' },
						{ label: '你的第一个图谱', slug: 'getting-started/your-first-graph' },
						{ label: '下一步', slug: 'getting-started/next-steps' },
					],
				},
				{
					label: '核心概念',
					items: [
						{ label: '工作原理', slug: 'core-concepts/how-it-works' },
						{ label: '知识图谱', slug: 'core-concepts/knowledge-graph' },
						{ label: '解析与框架', slug: 'core-concepts/resolution' },
					],
				},
				{
					label: '指南',
					items: [
						{ label: '索引一个项目', slug: 'guides/indexing' },
						{ label: '框架路由', slug: 'guides/framework-routes' },
						{ label: 'CI 中的受影响测试', slug: 'guides/affected-tests' },
					],
				},
				{
					label: '参考',
					items: [
						{ label: 'MCP 服务器', slug: 'reference/mcp-server' },
						{ label: '集成', slug: 'reference/integrations' },
						{ label: 'CLI', slug: 'reference/cli' },
						{ label: 'API', slug: 'reference/api' },
						{ label: '语言支持', slug: 'reference/languages' },
					],
				},
				{ label: '故障排查', slug: 'troubleshooting' },
			],
		}),
	],
});
```

- [ ] **Step 2: 批量改写文档内链前缀**

```bash
cd /c/Users/lif3n/src/docs/codegraph-docs-cn
find src/content/docs -name '*.md' -exec sed -i 's|](/codegraph/|](/|g' {} +
grep -rn '](/codegraph/' src/content/docs || echo "OK: no leftover prefixed links"
grep -rn '/codegraph/' src/content/docs
```

Expected: 第一条 grep 无输出（显示 OK）；第二条 grep 仅剩 `raw.githubusercontent.com/colbymchenry/codegraph/main/...` 安装脚本外链（它们不含 `](/codegraph/` 形式，不受影响）。若出现被改坏的外链（`colbymchenry/main`），还原该行手工修复。

同时确认 `src/components/SiteTitle.astro` 无需改动：它只渲染配置里的 `title`（产品名 "codegraph"，带 `translate="no"`），没有英文句子——不修改此文件。

- [ ] **Step 3: 落地页 index.astro 汉化**

只改以下文案与属性，样式块（`<style>`）与结构一律不动：

- `<html lang="en">` → `<html lang="zh-CN">`
- `<title>codegraph — Understand any codebase as a graph</title>` → `<title>codegraph — 以图谱理解任何代码库</title>`
- meta description → `一款本地优先的代码智能工具，把任何代码库变成可供 AI 编码智能体查询的知识图谱。`
- `og:description` → `以图谱理解任何代码库。`
- 导航：`>Docs<` → `>文档<`；`>Languages<` → `>语言支持<`（GitHub、star 徽标不动）
- `<h1>` → `以图谱理解任何代码库`
- `.lede` 段 → `一款本地优先（local-first）的代码智能工具，把任何代码库变成可供 AI 编码智能体查询的知识图谱。`
- 按钮：`Get started` → `快速开始`；`View documentation` → `查看文档`
- 复制按钮 aria-label `Copy install command` → `复制安装命令`
- `<span class="copied">Copied</span>` → `<span class="copied">已复制</span>`
- 三个特性卡：
  - `<h2>Tree-sitter parsing</h2>` → `<h2>Tree-sitter 解析</h2>`，正文 → `覆盖 20+ 语言的快速增量解析——从真实 AST 提取精准的符号与边，而非猜测。`
  - `<h2>MCP server</h2>` → `<h2>MCP 服务器</h2>`，正文 → `通过 MCP 把图谱开放给 Claude Code、Cursor、Codex、opencode、Hermes、Gemini、Antigravity 与 Kiro——智能体寥寥数次调用即可作答。`
  - `<h2>Impact analysis</h2>` → `<h2>影响分析</h2>`，正文 → `在改动一行代码之前，追踪任意符号的调用方、被调用项与完整影响半径。`
- 页脚：`>Docs<` → `>文档<`（GitHub、npm、MIT 不动）

- [ ] **Step 4: SocialIcons.astro 文案**

- `>Docs</a>` → `>文档</a>`；`>Languages</a>` → `>语言支持</a>`
- aria-label：`${stars} GitHub stars` → `GitHub 星标 ${stars}`

- [ ] **Step 5: GraphDiagram.astro aria-label**

`aria-label="A code knowledge graph: index.ts links to auth.ts, router.ts and api/users.ts, which branch to middleware.ts, types/index.ts, createRouter and listUsers."` → `aria-label="一张代码知识图谱：index.ts 连接到 auth.ts、router.ts 和 api/users.ts，再分叉到 middleware.ts、types/index.ts、createRouter 和 listUsers。"`（节点标签是文件名/符号名，不动。）

- [ ] **Step 6: theme.css 中文字体 fallback**

`--sl-font` 一行改为（仅追加 CJK fallback，拉丁字形不变，视觉不变）：

```css
	--sl-font: 'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
```

- [ ] **Step 7: 构建 + 冒烟**

```bash
cd /c/Users/lif3n/src/docs/codegraph-docs-cn
npm run build
```

Expected: 零错误。构建后抽查 `dist/index.html` 存在且 `<html lang="zh-CN">`；`dist/getting-started/introduction/index.html` 内 href 不再含 `/codegraph/`。

- [ ] **Step 8: Commit**

```bash
cd /c/Users/lif3n/src/docs
git add codegraph-docs-cn
git commit -m "feat: 站点配置与骨架中文化（zh locale/中文侧边栏/落地页/内链改写）

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: 翻译入门篇（6 篇）

**Files:**
- Modify: `codegraph-docs-cn/src/content/docs/getting-started/introduction.md`
- Modify: `codegraph-docs-cn/src/content/docs/getting-started/quickstart.md`
- Modify: `codegraph-docs-cn/src/content/docs/getting-started/installation.md`
- Modify: `codegraph-docs-cn/src/content/docs/getting-started/configuration.md`
- Modify: `codegraph-docs-cn/src/content/docs/getting-started/your-first-graph.md`
- Modify: `codegraph-docs-cn/src/content/docs/getting-started/next-steps.md`

**Interfaces:**
- Consumes: Task 2 的中文框架与改写后的内链。
- Produces: 6 篇中文文档；`configuration.md` 的中文小节锚点（Task 5 `indexing.md` 无依赖它，但 quickstart/introduction 文内链接指向这些页面路径不变）。

- [ ] **Step 1: 逐篇翻译（源：`codegraph-main/site/src/content/docs/getting-started/*.md`，正文按 Global Constraints 术语表与质量线意译；代码块/表格命令列/不译项逐字保留）**

各文件 frontmatter（精确使用）：

- introduction.md: `title: 简介` / `description: CodeGraph 是什么，以及它为什么能让 AI 编码智能体更快、更精准。`
- quickstart.md: `title: 快速开始` / `description: 几秒钟内上手 CodeGraph。`
- installation.md: `title: 安装` / `description: 安装 CodeGraph 并配置你的 AI 编码智能体。`
- configuration.md: `title: 配置` / `description: CodeGraph 默认零配置，仅一个可选的 codegraph.json，用于自定义文件扩展名、排除已跟踪目录、索引被 gitignore 的源码以及索引嵌套 git 仓库。`
- your-first-graph.md: `title: 你的第一个图谱` / `description: 构建索引并运行你的第一批查询。`
- next-steps.md: `title: 下一步` / `description: CodeGraph 安装完成、索引跑起来之后，接下来去哪里。`

configuration.md 小节标题与锚点（本文首段链接到 4 个锚点，必须按此表重算——github-slugger 规则：小写拉丁、去标点、空格转连字符、CJK 保留）：

| 英文标题 | 中文标题 | 页内锚点 |
|---|---|---|
| What it skips out of the box | 开箱即跳过的内容 | `#开箱即跳过的内容` |
| Excluding or including more | 排除或纳入更多 | `#排除或纳入更多` |
| Excluding a tracked directory | 排除已跟踪目录 | `#排除已跟踪目录` |
| Indexing gitignored source (a second VCS) | 索引被 gitignore 的源码 | `#索引被-gitignore-的源码` |
| Custom file extensions | 自定义文件扩展名 | `#自定义文件扩展名` |
| Indexing nested git repositories | 索引嵌套 git 仓库 | `#索引嵌套-git-仓库` |
| Where data lives | 数据存放位置 | `#数据存放位置` |

首段的 4 个 `[...](#...)` 链接改为上表锚点（"第二套 VCS"语义并入正文）。

introduction.md 特殊处理：`**58% fewer tool calls**`/`**22% faster**`/`**file reads cut to ~zero**` 译为 `**工具调用减少 58%**`/`**提速 22%**`/`**文件读取降到约零次**`；7 个代码库基准一句保留全部数字。

- [ ] **Step 2: 构建验证**

```bash
cd /c/Users/lif3n/src/docs/codegraph-docs-cn && npm run build
```

Expected: 零错误（Astro 校验页间链接）。

- [ ] **Step 3: 锚点核对（configuration.md）**

```bash
grep -o 'href="#[^"]*"' dist/getting-started/configuration/index.html | sort -u
grep -o 'id="[^"]*"' dist/getting-started/configuration/index.html | sort -u
```

Expected: 每个内部 `href="#…"` 都能在同页 `id="…"` 集合中找到。不一致 → 以实际生成的 id 修正 md 锚点，重建再核对。

- [ ] **Step 4: 英文残留抽查**

用 awk 跳过围栏代码块（``` 与 ~~~）后按行首正则查正文长英文（避免代码行误报）：

```bash
cd /c/Users/lif3n/src/docs/codegraph-docs-cn
awk -v incode=0 '/^(```|~~~)/{incode=!incode; next} !incode && /^[^`|#>-].*\b(the|and|with|your|from|that)\b/' src/content/docs/getting-started/*.md || echo "CLEAN"
```

Expected: `CLEAN`。有输出 → 该句漏译，补译后重跑。（frontmatter 的 title/description 已是中文；表格行以 `|` 开头不参与此检，靠人工过目。）

- [ ] **Step 5: Commit**

```bash
cd /c/Users/lif3n/src/docs
git add codegraph-docs-cn
git commit -m "docs(zh): 翻译入门篇 6 篇

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: 翻译核心概念（3 篇）

**Files:**
- Modify: `codegraph-docs-cn/src/content/docs/core-concepts/how-it-works.md`
- Modify: `codegraph-docs-cn/src/content/docs/core-concepts/knowledge-graph.md`
- Modify: `codegraph-docs-cn/src/content/docs/core-concepts/resolution.md`

**Interfaces:**
- Produces: Task 3 `next-steps.md` 已链接的三个中文页面标题（工作原理/知识图谱/解析与框架——与侧边栏一致）。

- [ ] **Step 1: 逐篇翻译（源：`codegraph-main/site/src/content/docs/core-concepts/*.md`）**

frontmatter：

- how-it-works.md: `title: 工作原理` / `description: 提取、存储、解析与自动同步的四段流水线。`
- knowledge-graph.md: `title: 知识图谱` / `description: 构成图谱的节点类型与边类型。`
- resolution.md: `title: 解析与框架` / `description: CodeGraph 如何连接引用，以及如何把路由链接到处理器。`

特殊处理：

- how-it-works.md 的 ASCII 流程图代码块：`files → Extraction (tree-sitter) → ...` 保持英文原样（图示术语），或按"提取/存储/解析"加中文注释行——选择保持原样（图示是通用术语，正文四小节已是中文标题）。
- knowledge-graph.md 的 Node kinds / Edge kinds 列表：代码字面量（`file`、`calls`…）全部保留原样，仅译小节标题（节点类型/边类型/来源/如何查询）。
- resolution.md 动态派发列表中 `setState` → `render` 等代码引用保留。

- [ ] **Step 2: 构建 + 英文残留抽查**

```bash
cd /c/Users/lif3n/src/docs/codegraph-docs-cn && npm run build
```
Expected: 零错误。残留抽查：

```bash
awk -v incode=0 '/^(```|~~~)/{incode=!incode; next} !incode && /^[^`|#>-].*\b(the|and|with|your|from|that)\b/' src/content/docs/core-concepts/*.md || echo "CLEAN"
```
Expected: `CLEAN`。

- [ ] **Step 3: Commit**

```bash
cd /c/Users/lif3n/src/docs
git add codegraph-docs-cn
git commit -m "docs(zh): 翻译核心概念 3 篇

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: 翻译指南篇（3 篇）

**Files:**
- Modify: `codegraph-docs-cn/src/content/docs/guides/indexing.md`
- Modify: `codegraph-docs-cn/src/content/docs/guides/framework-routes.md`
- Modify: `codegraph-docs-cn/src/content/docs/guides/affected-tests.md`

**Interfaces:**
- Produces: 中文页面标题：索引一个项目 / 框架路由 / CI 中的受影响测试（与侧边栏一致）。

- [ ] **Step 1: 逐篇翻译（源：`codegraph-main/site/src/content/docs/guides/*.md`）**

frontmatter：

- indexing.md: `title: 索引一个项目` / `description: 全量索引、增量同步与文件监听器。`
- framework-routes.md: `title: 框架路由` / `description: CodeGraph 把 URL 模式链接到服务它们的处理器。`
- affected-tests.md: `title: CI 中的受影响测试` / `description: 只运行一次变更真正触及的测试。`

indexing.md 小节标题与锚点（正文两处链接 `#stay-fresh-automatically`）：

| 英文标题 | 中文标题 | 页内锚点 |
|---|---|---|
| Initialize and index | 初始化并建立索引 | （无链接指向） |
| Full vs. incremental | 全量与增量 | （无链接指向） |
| Stay fresh automatically | 始终保持最新 | `#始终保持最新` |
| Check status | 查看状态 | （无链接指向） |
| What gets indexed | 哪些内容会被索引 | （无链接指向） |

indexing.md 特殊处理：

- `⚠️` 横幅示例代码块内的英文输出（`Some files referenced below...`）是工具实际输出，**保持原样不译**，仅译其前后的说明段。
- `CODEGRAPH_WATCH_DEBOUNCE_MS`、`CODEGRAPH_NO_DAEMON=1`、`CODEGRAPH_DIR` 等环境变量原样。
- v0.9.5 release notes 外链保留。

framework-routes.md 特殊处理：框架表格整表保留——框架名、识别形态列（全是代码）原样，仅译表头（框架 / 识别的形态）与首尾段落。

affected-tests.md 特殊处理：选项表格——Option 列原样，Default 列值原样，仅译 Description 列与表头；CI 脚本代码块原样。

- [ ] **Step 2: 构建 + 锚点核对 + 英文残留抽查**

```bash
cd /c/Users/lif3n/src/docs/codegraph-docs-cn && npm run build
```
Expected: 零错误。indexing.md 锚点核对：

```bash
grep -o 'href="#[^"]*"' dist/guides/indexing/index.html | sort -u
grep -o 'id="[^"]*"' dist/guides/indexing/index.html | sort -u
```
Expected: 每个内部 `href="#…"` 都能在同页 id 集合中找到。残留抽查：

```bash
awk -v incode=0 '/^(```|~~~)/{incode=!incode; next} !incode && /^[^`|#>-].*\b(the|and|with|your|from|that)\b/' src/content/docs/guides/*.md || echo "CLEAN"
```
Expected: `CLEAN`（framework-routes 表格行以 `|` 开头不参与此检，表格中文部分靠人工过目）。

- [ ] **Step 3: Commit**

```bash
cd /c/Users/lif3n/src/docs
git add codegraph-docs-cn
git commit -m "docs(zh): 翻译指南篇 3 篇

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: 翻译参考篇（5 篇）

**Files:**
- Modify: `codegraph-docs-cn/src/content/docs/reference/mcp-server.md`
- Modify: `codegraph-docs-cn/src/content/docs/reference/integrations.md`
- Modify: `codegraph-docs-cn/src/content/docs/reference/cli.md`
- Modify: `codegraph-docs-cn/src/content/docs/reference/api.md`
- Modify: `codegraph-docs-cn/src/content/docs/reference/languages.md`

**Interfaces:**
- Produces: 中文页面标题：MCP 服务器 / 集成 / CLI / API / 语言支持（与侧边栏一致；CLI、API 标题保留拉丁缩写）。

- [ ] **Step 1: 逐篇翻译（源：`codegraph-main/site/src/content/docs/reference/*.md`）**

frontmatter：

- mcp-server.md: `title: MCP 服务器` / `description: CodeGraph 通过 MCP 向 AI 智能体暴露的工具。`
- integrations.md: `title: 集成` / `description: 受支持的智能体，以及手动 MCP 配置。`
- cli.md: `title: CLI` / `description: CodeGraph 的每一条命令及其支持的标志。`
- api.md: `title: API` / `description: 将 CodeGraph 作为 TypeScript 库使用。`
- languages.md: `title: 语言支持` / `description: CodeGraph 能解析的每种语言，以及它识别的扩展名。`

特殊处理：

- cli.md 命令清单代码块：命令与行内注释——命令原样；`#` 注释译为中文（如 `# Run interactive installer` → `# 运行交互式安装器`）。
- cli.md 小节标题：init、index 与 sync / 查询命令 / affected（"## init, index, and sync" → `## init、index 与 sync`；"## Query commands" → `## 查询命令`）。
- api.md：全部代码块原样；方法表格 Method 列原样，Purpose 列与表头译中文（方法 / 用途）。
- languages.md：表格 Language 列（语言名译中文：TypeScript→TypeScript 不译，但"语言"表头、Status 列值 Full support→完全支持 / Partial support→部分支持；括号内的能力说明译中文，代码引用如 `@property`、`#import` 原样）。Objective-C 行的长说明整句意译。
- mcp-server.md 工具表格：Tool 列原样，Purpose 列译中文。
- integrations.md：`:::tip` 块译中文；JSON 配置代码块原样。

- [ ] **Step 2: 构建 + 英文残留抽查**

```bash
cd /c/Users/lif3n/src/docs/codegraph-docs-cn && npm run build
```
Expected: 零错误。残留抽查：

```bash
awk -v incode=0 '/^(```|~~~)/{incode=!incode; next} !incode && /^[^`|#>-].*\b(the|and|with|your|from|that)\b/' src/content/docs/reference/*.md || echo "CLEAN"
```
Expected: `CLEAN`（languages.md / cli.md 表格与代码块不参与此检，靠人工过目）。

- [ ] **Step 3: Commit**

```bash
cd /c/Users/lif3n/src/docs
git add codegraph-docs-cn
git commit -m "docs(zh): 翻译参考篇 5 篇

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: 故障排查篇 + 全站终检

**Files:**
- Modify: `codegraph-docs-cn/src/content/docs/troubleshooting.md`

**Interfaces:**
- Consumes: Task 2–6 的全部中文页面（本篇链接到 `语言支持`）。

- [ ] **Step 1: 翻译 troubleshooting.md（源：`codegraph-main/site/src/content/docs/troubleshooting.md`）**

frontmatter：`title: 故障排查` / `description: 最常见 CodeGraph 问题的修复方法。`

小节标题（疑难症状名保留引号包裹的报错原文，说明用中文）：

- `## "CodeGraph not initialized"` → `## "CodeGraph not initialized"（CodeGraph 未初始化）`
- `## Indexing is slow` → `## 索引很慢`
- `## MCP hits \`database is locked\`` → `## MCP 遇到 \`database is locked\``
- `## MCP server not connecting` → `## MCP 服务器连不上`
- `## Missing symbols` → `## 符号缺失`
- `## Sharing one checkout between Windows and WSL` → `## 在 Windows 与 WSL 之间共享同一份检出`

特殊处理：安装命令、`Journal:` 等输出字面量、`CODEGRAPH_DIR=.codegraph-win` 原样；文内链接 `[supported](/reference/languages/)` 译为 `[受支持的语言](/reference/languages/)`。

- [ ] **Step 2: 全量构建**

```bash
cd /c/Users/lif3n/src/docs/codegraph-docs-cn && npm run build
```

Expected: 零错误零警告，19 个文档页 + 落地页全部产出。

- [ ] **Step 3: 全站锚点终检**

```bash
cd /c/Users/lif3n/src/docs/codegraph-docs-cn
for f in dist/getting-started/configuration/index.html dist/guides/indexing/index.html; do
  echo "== $f"
  grep -o 'href="#[^"]*"' "$f" | sort -u
done
```

Expected: 每个 href 都存在于对应页面 id 集合（Step Task 3/5 已核对的页不再回归）。

- [ ] **Step 4: 全站英文残留终检**

```bash
cd /c/Users/lif3n/src/docs/codegraph-docs-cn
awk -v incode=0 '/^(```|~~~)/{incode=!incode; next} !incode && /^[^`|#>-].*\b(the|and|with|your|from|that|which)\b/' $(find src/content/docs -name '*.md') || echo "CLEAN"
```

Expected: `CLEAN`。

- [ ] **Step 5: dev 冒烟（用户验收入口）**

```bash
cd /c/Users/lif3n/src/docs/codegraph-docs-cn && npm run dev
```

启动后向用户报告地址（默认 `http://localhost:4321/`），请用户过目：落地页、任一文档页（侧边栏中文、搜索框中文占位、上一页/下一页中文）、`配置` 页锚点跳转。

- [ ] **Step 6: 写 README.md**

创建 `codegraph-docs-cn/README.md`：

```markdown
# codegraph 中文文档

[colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) 文档站的非官方中文翻译。视觉与原站一致，基于 Astro + Starlight。

- 原站：https://colbymchenry.github.io/codegraph/
- 上游版本：main 分支（2026-08-18）

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
```

- [ ] **Step 7: Commit**

```bash
cd /c/Users/lif3n/src/docs
git add codegraph-docs-cn
git commit -m "docs(zh): 翻译故障排查篇；README；全站终检通过

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
