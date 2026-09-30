# OpenRig 文档中文镜像（openrig-docs-cn）

[mvschwarz/openrig](https://github.com/mvschwarz/openrig) 仓库 `docs/` 目录的社区中文翻译，以 Astro + Starlight 全新搭站（上游的 openrig.dev 为 Next.js 站点、源码不公开，本站收录的是仓库内 markdown 文档全集）。**非官方翻译**，一切以上游英文文档与 [openrig.dev](https://openrig.dev/) 为准。

- **上游快照**：mvschwarz/openrig `main` 分支，版本 0.6.2，快照日期 2026-09-30
- **收录范围**：`docs/` 全树 90 篇——as-built 架构实录 24、reference 参考 28、releases 发布说明 37、DESIGN 设计 1；`releases/_template.md`（占位模板）未收录
- **术语**：见 `GLOSSARY.md`（席位/守护进程/内核/预置模板等约 60 条 + 不译名单）
- **锚点映射**：`.anchor-maps/`（90 份，原英文标题 → 中文标题 → 新锚点）

## 本地运行

前置要求 Node.js ≥ 22.12（读 `node_modules` 里 astro@7 的实际要求）：

```bash
npm install
npm run dev        # http://localhost:4321/
npm run build      # 产出 dist/
npm run preview
```

## 部署形态

`astro.config.mjs` 读取 `DOCS_SITE` / `DOCS_BASE` 环境变量（不设即根路径本地开发）。GitHub Pages 子路径部署由 hub 仓库的 CI 完成：构建前给正文内链 `](/…)` 与 frontmatter hero 的 `link: '/…` 临时加 `/docs-cn/openrig/` 前缀，再以 `DOCS_BASE=/docs-cn/openrig/` 构建。

## 辅助脚本（scripts/）

- `normalize-frontmatter.cjs`：无 frontmatter 的页从正文 H1 提 title 并剥 H1（Starlight 以 frontmatter title 为页面标题）
- `fix-cross-anchors.mjs`：跨文件锚点回修（读 `.anchor-maps/`，github-slugger 口径）
- `fix-md-links.cjs`：相对 `.md` 内链 → 根绝对路由链接（Starlight 不改写 .md 相对链接，dist 原样保留会 404）
- `fix-repo-links.cjs`：指向仓库源码树（`../../packages/`、根 README/CHANGELOG）的链接改写为 GitHub 绝对 URL
- `check-bold-close.cjs`：CJK 粗体闭合审计（闭合 `**` 前全角标点+后紧跟文字 = 页面字面 `**`）
- `check-dist.mjs`：dist 终检（字面 `**` 扫描 + 跨页锚点 href↔id 全量核对）
- `check-base.cjs`：base 前缀终检（DOCS_BASE 注入后站内根路径须全部带前缀）
