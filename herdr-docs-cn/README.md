# herdr-docs-cn — Herdr 官网中文镜像

[herdr.dev](https://herdr.dev/)（herdrdev，Apache 2.0）的非官方中文镜像：一个为运行编码智能体而生的原生应用——窗口、布局与 mod 全部由智能体改造，关掉窗口智能体照常干活。

- **源**：https://herdr.dev（Cloudflare Pages，站点工程闭源；`herdrdev/herdr` 公开仓库只含 TUI 文档源码）。快照 2026-11-12
- **形态**：HTML 产物镜像汉化（无 Markdown 源码，不重建 Astro 工程）。`site/` 即整站部署产物，资源引用已带 `/docs-cn/herdr/` 前缀
- **范围**：官方页 15 页全量汉化（落地页、博客 ×7、core、guide、gallery 框架、mobile、download、privacy）；画廊 888 页（`/layouts/` 319 + `/mods/` 577）模板 UI 汉化——导航/页脚/按钮/固定说明全站统一，社区作者的标题与描述按用户决策保留英文
- **TUI**：`herdr.dev/tui` 官方自带中文（`/zh-cn/tui/docs/`），本镜像不做；全站 TUI 链接已改指官方中文版
- **界面复刻保留英文**：落地页模拟终端/侧边栏 mockup/agent 会话演示、画廊卡片墙、`hc ls` 等终端示例输出——它们是产品界面的复刻，翻译反而失真
- **`/og/`** 2 页（og 卡片预览）与 `/cloud/`（上游死链 fallback）未收录/未汉化
- **术语**：见 [GLOSSARY.md](GLOSSARY.md)（agent→智能体、mod 不译、space→空间、"没有两台 Herdr 长得一样。"等）

## 本地运行

```bash
node tools/serve.cjs site 4176
# 伺服器模拟生产子路径，访问 http://127.0.0.1:4176/docs-cn/herdr/
```

无构建步骤。`tools/` 是管线辅助（抓站 download.mjs / fetch-assets.mjs、前缀改写 build-site.mjs、模板汉化 template-translate.mjs、残留扫描 residue-check-html.cjs、冒烟伺服 serve.cjs），不随站点部署。

## 管线（复现）

```bash
node tools/download.mjs          # 1. 抓站 → upstream/（英文底稿，已 gitignore）
node tools/fetch-assets.mjs      # 2. 补抓资产（download 卡死时的快速通道，幂等）
node tools/build-site.mjs        # 3. upstream → site：/docs-cn/herdr 前缀改写 + TUI 链接改官方中文版
node tools/template-translate.mjs # 4. 画廊 888 页模板 UI + 全站导航页脚批量汉化（幂等）
# 5. 官方 15 页子代理逐页汉化（见 GLOSSARY 与各页简报）
node tools/residue-check-html.cjs # 6. 官方页英文残留扫描
```

## 部署

并入 [docs-cn](https://github.com/lif3ng-vibe/docs-cn) hub，部署于 `https://lif3ng-vibe.github.io/docs-cn/herdr/`（CI 直接 `mv site → _site/herdr`，无构建缓存）。
