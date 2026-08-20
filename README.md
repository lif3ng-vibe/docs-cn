# docs-cn

开源项目文档的中文翻译集合。每个子目录是一个独立可运行的文档站点（Astro + Starlight），翻译均为非官方、一次性快照。

## 收录项目

| 项目 | 目录 | 原站 | 上游仓库 | 快照日期 |
|---|---|---|---|---|
| codegraph | `codegraph-docs-cn/` | https://colbymchenry.github.io/codegraph/ | https://github.com/colbymchenry/codegraph | 2026-08-18 |
| Orca | `orca-docs-cn/` | https://www.onorca.dev/docs | https://github.com/stablyai/orca | 2026-08-19 |
| Matt Pocock Skills | `mattpocock-skills-docs-cn/` | https://www.aihero.dev/skills | https://github.com/mattpocock/skills | 2026-08-20 |
| AI 编码词典 | `ai-coding-dictionary-docs-cn/` | https://www.aihero.dev/ai-coding-dictionary | https://github.com/mattpocock/dictionary-of-ai-coding | 2026-08-20 |

## 运行任意子项目

每个子目录都是独立站点，前置要求 Node.js ≥ 22.12：

```bash
cd <子目录>          # 如 codegraph-docs-cn 或 orca-docs-cn
npm install
npm run dev          # 本地预览，默认 http://localhost:4321/
npm run build        # 产出 dist/
npm run preview      # 预览构建产物
```

## 翻译说明

- **复用原站工程**：拿到上游站点源码时，沿用原工具链（配置/主题/组件），仅中文化内容（codegraph）。
- **从渲染站点重建**：上游站点源码不公开时，从线上站点的 Next.js RSC payload 提取正文重建为 Markdown，再用 Starlight 搭站（orca）。
- **从内容仓库新建**：上游只有 markdown 内容、没有站点工程时（托管平台不开源），用 Starlight 新建中文站（mattpocock-skills、ai-coding-dictionary）；原站的站内链接改写为本站路径，词典类词条保留英文术语加中文译名。
- 术语口径见各子目录的 `GLOSSARY.md`（如适用）。
- 代码块、命令、配置键、产品名保留英文；按钮/菜单名保留英文加粗并首次出现括注中文。
- 每页 frontmatter 的 `source` 字段记录原站 URL，便于后续手动同步。

## 目录结构

```
docs-cn/
├── sites.json             # 子站点清单（入口页数据源）
├── scripts/gen-index.cjs  # 由 sites.json 生成入口页 index.html
├── index.html             # 入口页（由脚本生成，勿手改）
├── .github/workflows/     # Pages 部署 CI
├── codegraph-docs-cn/     # codegraph 中文文档（Starlight）
├── orca-docs-cn/          # Orca 中文文档（Starlight）
├── mattpocock-skills-docs-cn/          # Matt Pocock Skills 中文文档（Starlight）
├── ai-coding-dictionary-docs-cn/       # AI 编码词典中文版（Starlight）
└── docs/                  # 翻译流程的设计文档与实施计划
```

## 新增一个翻译站点

1. 新建子目录（如 `foo-docs-cn/`），完成翻译站点。
2. 在 `sites.json` 加一条：`{ "name": "Foo", "slug": "foo", "desc": "一句话介绍。", "orig": "https://原站 URL" }`。
3. 在 `.github/workflows/deploy-pages.yml` 加一段构建步骤（以 `DOCS_BASE=/docs-cn/foo/` 构建，构建前 `sed` 给正文内链加前缀），并在 Assemble 步骤里 `mv foo-docs-cn/dist _site/foo`。
4. 本地跑 `node scripts/gen-index.cjs` 刷新 `index.html`，提交。

## 本地开发 vs GitHub Pages 部署

**日常迭代**（不带前缀，直接访问）：

```bash
cd <子目录>
npm run dev          # http://localhost:4321/
npm run build        # dist/ 可直接用 npm run preview 预览
```

子站点的 `astro.config.mjs` 用 `base: process.env.DOCS_BASE || '/'`——日常不设该变量即 `base: '/'`，所有链接为根路径。

**GitHub Pages 部署**（带前缀，CI 自动处理）：

推送到 `master` 即触发 `.github/workflows/deploy-pages.yml`，在 Linux runner 上：

1. 用 `sites.json` 生成入口页 `index.html`。
2. 给每个子站点的正文 markdown 内链 `](/path)` 临时加 `/docs-cn/<站>/` 前缀（Astro 对 Starlight 组件链接会自动加 base，但对正文 markdown 内链不会，需 CI 补齐；源码保持不带前缀）。
3. 以 `DOCS_BASE=/docs-cn/<站>/` 构建。
4. 组装产物：入口页 `index.html` 在根，子站点分别在 `codegraph/`、`orca/`、`mattpocock-skills/`、`ai-coding-dictionary/`。
5. 部署到 https://lif3ng-vibe.github.io/docs-cn/ 。

部署后访问地址：
- 入口：https://lif3ng-vibe.github.io/docs-cn/
- codegraph：https://lif3ng-vibe.github.io/docs-cn/codegraph/
- Orca：https://lif3ng-vibe.github.io/docs-cn/orca/
- Matt Pocock Skills：https://lif3ng-vibe.github.io/docs-cn/mattpocock-skills/
- AI 编码词典：https://lif3ng-vibe.github.io/docs-cn/ai-coding-dictionary/

> 仓库 Settings → Pages 的 Source 需设为 **GitHub Actions**。

## 许可

翻译内容遵循各上游项目的原始许可。每个子目录的 README 标注了来源与快照日期。