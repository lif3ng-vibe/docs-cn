# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

中文开发者（含仓库维护者本人）：在寻找、评估 AI 编码生态开源项目时，需要快速定位该项目文档的中文版，或按主题标签浏览发现新工具。无其他已确认受众。

## Product Purpose

docs-cn：开源项目文档的中文翻译集合。每个子目录是一个独立可运行的文档站点（复用各上游原站工具链：Starlight、Docusaurus、Mintlify、fumadocs 等），统一经 GitHub Pages 上的入口页导航。成功 = 访客更快定位目标文档、更快通过标签/搜索发现感兴趣的站点。

## Positioning

一站式中文入口聚合多个 AI 编码相关开源项目的非官方中文文档。机制上与"把所有文档塞进统一主题"的聚合站不同：每个子站复用上游原班工具链原位翻译，保持与上游 1:1 的站点结构与快照可同步性（每页 `source` frontmatter + 快照日期）。

## Operating Context

- 部署：GitHub Pages，路径前缀 `/docs-cn/`，CI 走 `.github/workflows/deploy-pages.yml`（构建时注入 `DOCS_BASE`，正文内链加前缀，产物按内容哈希缓存）。
- 运行：Node ≥ 22.12；每个子目录独立 `npm install && npm run dev/build`。
- 入口页 `index.html` 由 `scripts/gen-index.cjs` 从 `sites.json` 生成，**勿手改**；标签注册表 `TAGS` 也在 `gen-index.cjs`，改动后跑 `node scripts/gen-index.cjs` 刷新。
- 新增站点流程：翻译站目录 → `sites.json` 加条目（名称/slug/一句话简介/原站/上游仓库/2-4 个已注册标签）→ CI 加构建段 → 刷新入口页。

## Capabilities and Constraints

- 入口页功能（现状）：标签多选取交集筛选、标题行关键词搜索（命中高亮，可选过滤/仅高亮）、设置弹窗（主题色、卡片风格、各部分显隐、标签语言中/英）；偏好存 localStorage（key: `docs-cn-prefs`），页面零外部请求。
- 各子站为非官方一次性快照；代码块、命令、配置键、产品名保留英文，按钮/菜单名英文加粗首次括注中文；术语口径见各站 `GLOSSARY.md`（如适用）。
- **设计范围（2026-10-26 与用户确认）**：Impeccable 设计工作当前只针对入口页；子站保持上游视觉、只译不重设计。未来可能对某个独立子站做独立调整——届时需单独约定该子站的范围。
- 未决事项：无。

## Brand Commitments

- 名称：docs-cn；入口页标题「docs-cn — 开源文档中文翻译」。
- 语态：简体中文；界面文案中文为主（标签提供中/英双语显示）。
- **入口页视觉方向（2026-10-26 用户在方向决策页裁定）**：走品类标准（Primer 系聚合页）精修路线，**不引入新视觉世界**；**主对标 MDN**（developer.mozilla.org 2023 设计语言），并提供 **MDN / GitHub / Vercel 三皮肤切换**（用户追加需求，默认 MDN）；以评审 P0/P1/P2 修复兑现至全保真。后续重提「特异性视觉世界」需用户重新开口。

## Evidence on Hand

- `sites.json`：21 个站点条目（名称、slug、中文简介、标签、原站、上游仓库）。
- `README.md`：收录项目表（含快照日期）、翻译约定、新增站点流程、部署说明。
- `scripts/gen-index.cjs`：入口页生成器（卡片/标签/搜索/设置的实现源头）。
- `index.html`：当前生成的入口页（生成产物，作为现状视觉证据）。
- 线上：https://lif3ng-vibe.github.io/docs-cn/
- 缺口：无用户测试数据、无访问量指标——后续工作不得虚构使用数据或用户反馈。

## Product Principles

1. **快速定位优先**：访客几秒内找到目标项目的中文文档——搜索、标签筛选、整卡直达点击都是为这一步服务的。
2. **忠于上游**：内容与结构跟随上游快照，工程复用原站工具链；翻译不改变原站信息架构。
3. **快照可同步**：每页可溯源（`source` frontmatter、快照日期），始终为上游变更后的增量同步留路。
4. **自包含前端**：入口页零外部请求，断网可用，偏好本地持久化。
