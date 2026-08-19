# docs-cn

开源项目文档的中文翻译集合。每个子目录是一个独立可运行的文档站点（Astro + Starlight），翻译均为非官方、一次性快照。

## 收录项目

| 项目 | 目录 | 原站 | 上游仓库 | 快照日期 |
|---|---|---|---|---|
| codegraph | `codegraph-docs-cn/` | https://colbymchenry.github.io/codegraph/ | https://github.com/colbymchenry/codegraph | 2026-08-18 |
| Orca | `orca-docs-cn/` | https://www.onorca.dev/docs | https://github.com/stablyai/orca | 2026-08-19 |

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
- 术语口径见各子目录的 `GLOSSARY.md`（如适用）。
- 代码块、命令、配置键、产品名保留英文；按钮/菜单名保留英文加粗并首次出现括注中文。
- 每页 frontmatter 的 `source` 字段记录原站 URL，便于后续手动同步。

## 目录结构

```
docs-cn/
├── index.html             # GitHub Pages 入口页（列出所有子站）
├── .github/workflows/     # Pages 部署 CI
├── codegraph-docs-cn/     # codegraph 中文文档（Starlight）
├── orca-docs-cn/          # Orca 中文文档（Starlight）
└── docs/                  # 翻译流程的设计文档与实施计划
```

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

1. 给每个子站点的正文 markdown 内链 `](/path)` 临时加 `/docs-cn/<站>/` 前缀（Astro 对 Starlight 组件链接会自动加 base，但对正文 markdown 内链不会，需 CI 补齐；源码保持不带前缀）。
2. 以 `DOCS_BASE=/docs-cn/<站>/` 构建。
3. 组装产物：入口页 `index.html` 在根，子站点分别在 `codegraph/`、`orca/`。
4. 部署到 https://lif3ng-vibe.github.io/docs-cn/ 。

部署后访问地址：
- 入口：https://lif3ng-vibe.github.io/docs-cn/
- codegraph：https://lif3ng-vibe.github.io/docs-cn/codegraph/
- Orca：https://lif3ng-vibe.github.io/docs-cn/orca/

> 仓库 Settings → Pages 的 Source 需设为 **GitHub Actions**。

## 许可

翻译内容遵循各上游项目的原始许可。每个子目录的 README 标注了来源与快照日期。