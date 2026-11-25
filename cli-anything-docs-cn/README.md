# cli-anything-docs-cn — CLI-Anything Hub 中文镜像

[clianything.cc](https://clianything.cc/)（HKUDS/CLI-Anything，Apache-2.0）的非官方中文镜像：CLI-Anything Hub——面向 Agent 的 CLI 注册表与包管理器，让 AI Agent 发现、安装并驱动 GUI 应用、开发工具、创意软件、Web API 与公共 SaaS 平台。

- **源**：https://github.com/HKUDS/CLI-Anything 仓库内 `docs/hub/`（GitHub Pages 站点源，纯手写静态 HTML，无框架无构建）。快照 commit `34f5195`，快照日期 2026-11-25
- **形态**：静态镜像汉化（同 diagram-design 先例）。`site/` 即整站部署产物；资源与数据引用全为相对路径，子路径挂载零改写（JS 数据 fetch 原为 `../../registry.json` 形式，镜像内已改同目录相对并本地拷入 4 个数据 JSON，自包含）
- **范围**：全站 8 个内容文件——`index.html`（落地页 + 84KB 注册表浏览应用 UI 文案）、`docs.html`（文档页）、`demos.html`（演示页）、`index-modern.html`（线上可达的备选首页）、`index.md`、`pricing.md`、`llms.txt`、`llms-full.txt`。数据文件（registry/openapi/.well-known JSON）按红线不译；`sitemap.xml`、`robots.txt`、`_config.yml` 快照原样保留；`matrix.html` 为上游 sitemap 死条目（线上 404），不镜像
- **术语**：见 [GLOSSARY.md](GLOSSARY.md)（Agent / harness 不译，遵官方 README_CN 口径）
- **声明**：非官方翻译，版权归原作者（HKUDS，Lead author: Yuhao Yang）；canonical/og 等绝对 meta 保留官方原样（快照声明）

## 本地运行

```bash
node tools/serve.cjs site 4188
# 模拟生产子路径，访问 http://127.0.0.1:4188/docs-cn/cli-anything/
```

无构建步骤。

## 部署

并入 [docs-cn](https://github.com/lif3ng-vibe/docs-cn) hub，部署于 `https://lif3ng-vibe.github.io/docs-cn/cli-anything/`（CI 直接 `cp -r site _site/cli-anything`，零构建，同 diagram-design/herdr 先例）。
