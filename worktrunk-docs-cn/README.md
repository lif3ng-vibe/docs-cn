# worktrunk-docs-cn

Worktrunk 官方文档站中文镜像（非官方翻译）。Worktrunk 是面向并行 AI agent 工作流的 Git worktree 管理 CLI（`wt`）。

- 源站：https://worktrunk.dev/
- 上游仓库：https://github.com/max-sixty/worktrunk（docs/ 目录为 Astro 7.4 + Starlight 0.42 工程）
- 快照：main@5bdb832fe83542359d17fb23af03e18448a55aa7，2026-11-04
- 许可证：MIT OR Apache-2.0（上游双许可）

## 本地运行

前置要求：Node.js >= 22.23.4（读 node_modules/astro 的 engines，可用 `volta run --node 22.23.4` 临时拉起）。

```bash
npm install     # 或 npm ci
npm run dev     # 开发服务器
npm run build   # 产物在 dist/（base=/docs-cn/worktrunk/）
npm run preview # 预览构建产物
```

## 镜像适配（相对上游的改动）

- `astro.config.mjs`：`site` 改为镜像站、`base: '/docs-cn/worktrunk/'`、Starlight `locales: { root: { lang: 'zh-CN' } }`、sitemap filter 按 base 过滤。
- `src/plugins/base-links.mjs`（新增）：构建期给 md 正文与 raw HTML 中的绝对路径（href/src/srcset）统一加 base 前缀，CI 无需 sed。
- `public/assets/`：上游 gitignore 的演示 GIF（18 枚，light/dark）与 og social-card 从 max-sixty/worktrunk-assets 抓取并随仓库提交。
- `src/components/Footer.astro`：Cargo.toml 改为项目内快照拷贝（上游引用仓库根），版本 0.81.0；`src/components/Head.astro`：OG 图与 structuredData 走镜像 URL。
- robots.txt sitemap 指向镜像。
- CJK 字体 fallback：`--sl-font` 加 PingFang SC/Hiragino Sans GB/Microsoft YaHei，`--wt-font-display` 加 Noto Serif SC/宋体系。

## 翻译口径

- 术语见 `GLOSSARY.md`（worktree/wt 命令/hook 名/模板变量等产品与命令词汇不译）。
- 15 篇文档全量汉化（frontmatter/正文/表格/admonition/raw HTML 可见文案）；代码块、终端输出快照（`<!-- ⚠️ AUTO-GENERATED -->` 包裹区）、报错原文保留英文。
- 锚点：`src/plugins/stable-heading-ids.mjs` 自定义 slugger 保留 CJK；中文标题生成中文锚点，全站链接 fragment 已由 `scripts/remap-anchors.mjs` 按 dist-en/dist 标题顺序配对回修（833 个页内锚点零断链）。
- `public/` 下的原始 md 副本（config.md 等）、`.well-known/agent-skills/`、`llms.txt` 为面向 AI agent 的上游分发物，保持英文原样。

## 上游开发工具（未适配翻译版）

`tests/built-site.test.mjs`、`tests/browser-site.test.mjs` 与 `scripts/parity.mjs` 是上游 CI 工具，断言英文产物与 Rust CLI 的同步关系，翻译版未适配；`npm test`（plugins 单测）仍然通过。
