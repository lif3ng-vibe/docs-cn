# impeccable-mirror-cn — Impeccable 线上镜像中文版

[impeccable.style](https://impeccable.style) 线上构建产物的**非官方中文镜像**——与官方站逐页对照（docs-compare 登记用这一版）。

> **非官方声明**：学习用途的汉化镜像，Impeccable 的名称、设计与内容版权归 [Paul Bakaus](https://github.com/pbakaus) 所有（Apache-2.0）。

## 快照口径

- 抓取自线上站构建产物，**2026-10-25 快照**（站点源码在上游私有仓库 `impeccable-site`，未公开）
- 49 个页面（含 sitemap 之外的 gallery/research/docs/design-system/docs/image-generation）+ 249 个文件
- 上游快照重建版见姊妹目录 `impeccable-docs-cn`（源码可维护，内容为 2026-07 口径）

## 结构与工具链

```
site/               # 镜像本体（部署即此目录，无构建步骤）
tools/crawl.mjs     # 抓取器（sitemap 种子 + 引用发现 + chunk 图谱）
tools/rewrite-base.mjs  # 部署前改写：根相对链接 → /docs-cn/impeccable-mirror/ 前缀；
                        # /api/* → 官方绝对 URL（Cloudflare Functions 不随镜像走）；
                        # Cloudflare 邮箱保护锚还原为明文 mailto
tools/serve.mjs     # 本地带前缀预览（node tools/serve.mjs 4173）
tools/residue-check.mjs # 英文残留检查（剥 script/style/code 后按行扫描）
```

## 已知限制

- 检测器覆盖层提示（样例页 overlay、扩展弹层）是 Rust/WASM 编译产物，保持英文
- changelog 页内嵌的 JSON 搜索索引保持英文——站内搜索只匹配英文关键词
- `commands.json` / `skills.json` / `version.json` 是产品路由数据（无页面消费），保持英文不译；`patterns.json`（首页客户端渲染）已译
- `/neo-mirai/`（虚构会议演示页）是设计成品展示，保持英文
- canonical/og:url 保持指向官方站（镜像语义）；下载与版本检查 `/api/*` 指回官方站
