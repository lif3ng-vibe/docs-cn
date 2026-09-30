# openship-docs-cn — OpenShip 文档中文镜像（非官方翻译）

[OpenShip](https://github.com/oblien/openship) 是一个开源的自托管部署平台（self-hosted deployment platform）。本仓库是其文档站 [openship.io/docs](https://openship.io/docs) 的**非官方中文镜像**：全站 164 篇 MDX 文档、营销落地页与界面文案的汉化，基于 fumadocs + Next.js 16 原班工具链，改为纯静态导出以便 GitHub Pages 托管。

- 上游仓库：<https://github.com/oblien/openship>
- 快照 commit：`0ca13fe9c52f9fb5a447350f2d0ea1e8fbc657a3`（2026-09-30）
- 许可：Apache-2.0（见 [LICENSE](./LICENSE)，本翻译为衍生作品）

## 本地运行

```bash
pnpm install        # Node 22+，pnpm 10+
pnpm dev            # http://localhost:3009
```

## 本地构建（静态导出）

```bash
MSYS2_ENV_CONV_EXCL="NEXT_BASE_PATH;NEXT_PUBLIC_SITE_URL" \
  NEXT_OUTPUT=export \
  NEXT_BASE_PATH=/docs-cn/openship \
  NEXT_PUBLIC_SITE_URL=https://lif3ng-vibe.github.io/docs-cn/openship \
  pnpm build
# 产物在 apps/web/out/（含 base 子路径结构），后接 node scripts/export-post.mjs 落 .md 原文
```

环境变量：

| 变量 | 作用 |
|---|---|
| `NEXT_OUTPUT=export` | 静态导出模式（不设则为上游 standalone 服务器构建） |
| `NEXT_BASE_PATH` | Pages 子路径前缀（Next 自动给资源与内链加前缀） |
| `NEXT_PUBLIC_SITE_URL` | 规范地址（llms.txt/sitemap/OG 引用） |

## 与上游的差异

- **纯中文单语**，无 en/zh 切换；上游 i18n 路由不变动（上游本身未开多语言）。
- **裁撤 changelog**（原站运行时抓 GitHub API + git tags，与静态导出不兼容），导航指向官方站 <https://openship.io/changelog>。
- **支持表单（/contact、/support）改为提示卡**——原站表单后端 `/api/contact` 是服务器路由，静态镜像不可用；指引到官方站提交。
- **docs-og 逐页社交卡**在导出模式跳过（构建时长考虑），og:image 引用为无害死链。
- 其余（sidebar 结构、导航、搜索、TOC）与上游一致，界面文案汉化见 `src/lib/ui-translations.ts`。

## 目录

```
apps/web/            文档站（fumadocs-mdx + Next.js App Router）
  content/docs/      164 篇 MDX 文档（已汉化）
  src/               布局、组件、lib
packages/core        上游 workspace 包（core）
packages/contracts   上游 workspace 包（contracts）
packages/ui          上游 workspace 包（ui）
scripts/             锚点回修等脚本
GLOSSARY.md          术语表（翻译与终检的共同依据）
```

## 翻译说明

- 翻译依据 `GLOSSARY.md` 统一术语；标题汉化后页内/跨页锚点链接经 `scripts/repair-anchors.mjs` 重算。
- 图片沿用上游英文截图；正文中的英文示例输出保持原样。
- 已知残留：`/resources` 的 3 篇文章与营销页代码注释保持必要原文——以全站终检结果为准。