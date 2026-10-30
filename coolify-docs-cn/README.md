# Coolify 文档（中文镜像）coolify-docs-cn

非官方中文镜像：将 [Coolify 官方文档](https://coolify.io/docs)（源码 [coollabsio/coolify-docs](https://github.com/coollabsio/coolify-docs)）汉化为纯中文单语站。

- **上游快照**：`coollabsio/coolify-docs@main`（2026-10-24），上游许可证 Apache-2.0，本镜像同样以 Apache-2.0 发布
- **范围**：全站 954 页汉化——一期人工内容 317 页（产品介绍、core、applications、databases、API、MCP、integrations、troubleshoot、contribute、CLI 指南）+ 二期 services 344 页（服务目录，41 个分类已中文化）与 CLI 命令参考 299 页（生成器模板与 llms-full 数据源双语料中文化，构建可重现）
- **UI 壳层**：导航、搜索、TOC、页脚提示、404 页均已中文化；第三方广告位（Carbon）已禁用
- **术语表**：见 [GLOSSARY.md](GLOSSARY.md)；各页标题翻译对照见 `.anchor-maps/`（页内锚点已按 github-slugger 规则重算）

## 与上游的差异

| 改动 | 说明 |
|---|---|
| `config/site.shared.ts` + `vite.config.ts` | `docsBasePath`/`base` 改为 `/docs-cn/coolify`（子路径部署）；`locale: zh-CN`；站点标题与描述汉化 |
| `scripts/generate-cli-command-reference.mjs` | 新增 `COOLIFY_CLI_CATALOG_FILE` 环境变量：指向本地 `scripts/fixtures/coolify-cli-llms-full.txt` 快照，构建免访问 GitHub（默认不设时行为与上游一致，仍远程拉取） |
| `scripts/postbuild.ts` | OG 图 font-family 追加 CJK 字体 fallback（本地 Microsoft YaHei / CI Noto Sans CJK SC） |
| `src/components/layout/carbon-ads.tsx` | 广告位禁用（原实现保留在 `CarbonAdsOriginal`） |
| `src/routes/__root.tsx` | fumadocs `I18nProvider` 中文文案 + 中文 404 页 |
| content 内 `/docs/images/…` 等 base 引用 | 批量改写为 `/docs-cn/coolify/…` |

## 本地运行

```bash
bun install
bun run dev        # 开发服务器（默认已带 COOLIFY_CLI_CATALOG_FILE 时无需外网）
bun run build      # 产物在 .output/public/docs-cn/coolify/
```

前置要求：Node.js ≥ 22.12（或 20.19+）、[Bun](https://bun.sh) 1.2+。构建需设置：

```bash
export COOLIFY_CLI_CATALOG_FILE=scripts/fixtures/coolify-cli-llms-full.txt
export VITE_SITE_URL=https://lif3ng-vibe.github.io   # 镜像站自身 origin（sitemap 用；不设则指向上游）
```

## 声明

本站为个人学习用途的非官方翻译镜像，与 Coolify 官方（[coollabs.io](https://coolify.io)）无关联；内容的英文原版以官方文档为准。上游更新不做自动同步——如需同步，以上述快照 commit 为基线 diff 上游仓库。
