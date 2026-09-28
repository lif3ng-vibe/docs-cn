# nimbus-docs-cn — Nimbus 文档中文版（非官方）

[Cloudflare Nimbus](https://github.com/cloudflare/nimbus) 官方文档站（[nimbus-docs.com](https://nimbus-docs.com)）的完整中文翻译，本地可运行、可构建。Nimbus 是 Cloudflare 开源的文档框架（"Docs for the agentic web"，基于 Astro），本仓库翻译的是该框架自己的文档站。

> **非官方声明**：本项目为社区翻译快照，与 Cloudflare 无关；内容以[英文原站](https://nimbus-docs.com)为准。

## 快照信息

| 项 | 值 |
| --- | --- |
| 上游仓库 | https://github.com/cloudflare/nimbus |
| 快照 commit | `4bec97a`（main 分支 tarball） |
| 快照日期 | 2026-09-28 |
| 上游文档站 | https://nimbus-docs.com |
| 翻译范围 | `apps/www` 全站 65 篇 MDX（docs 37 + components 28）+ 站点 UI 文案 + aria-label |

上游为一次性快照，不做持续同步。日后要跟上游：下载新版 tarball，对照 `git diff` 与 `.anchor-maps/` 里的锚点映射手动迁移。上游源 commit 记录在首个基线 commit（`e0a13c5`）的提交信息里。

## 本地运行

前置要求：**Node ≥ 22.12.0**（Astro 7 实测要求）、**pnpm ≥ 7.1**（仓库锁定 `pnpm@9`，建议 `corepack enable` 后直接用）。

```sh
pnpm install                              # 仓库根目录
pnpm --filter @cloudflare/nimbus-docs build   # 先构建框架包（www 依赖其 dist/）
cd apps/www
pnpm dev                                  # 开发服务器（自动先生成 registry）
```

## 构建

```sh
# 仓库根目录（或保持上一步的 apps/www 内直接 pnpm build）
pnpm --filter @cloudflare/nimbus-docs build
cd apps/www && pnpm build                 # 产物在 apps/www/dist/
```

`apps/www` 的 build 不会自动构建框架包——这是上游的设计（部署走 `predeploy` 钩子）。裸跑 `pnpm --filter @nimbus/www build` 前必须先构建框架包。

## 仓库导航

| 位置 | 内容 |
| --- | --- |
| `apps/www/` | 文档站本体（Astro 7 + React + Tailwind v4 + Pagefind）；翻译主体在 `src/content/`、`src/components/ui/`、`src/pages/`、`src/layouts/` |
| `packages/nimbus-docs/` | Nimbus 框架包（仅中文化了 `src/client/code-copy.ts` 的复制按钮文案；其余保持上游原样） |
| `GLOSSARY.md` | 翻译术语表——所有译名的唯一依据，补译/修订先改这里 |
| `.anchor-maps/` | 每篇文档的「原英文标题 → 中文标题 → 新锚点」映射，供上游同步与锚点回修使用（不入库） |

## 已知限制

- **OG 分享卡片**（`/og/*.png`）：生成图用的 Inter/Belleza 字体不含中文字形，中文标题在卡片上会显示为方框。修复需给 `apps/www/src/pages/og/_renderer.ts` 补充 CJK 字体，暂未处理。
- **部署配置未动**：`astro.config.ts` 的 `site`、`wrangler.jsonc`、`public/_redirects` 保持上游原样，部署时自行调整。
- **站内搜索**：Pagefind 对中文按字匹配，不支持词形还原（英文亦然），属上游行为。

## 许可

上游代码 MIT License（见 `LICENSE`）。翻译内容同样以 MIT 发布。
