# lightpanda-docs-cn

Lightpanda 文档站的中文镜像（非官方翻译）。Lightpanda 是用 Zig 编写的、面向 AI 与自动化场景的高性能无头浏览器（headless browser）。

- 原站：<https://lightpanda.io/docs/>
- 上游仓库：<https://github.com/lightpanda-io/docs>（Apache-2.0）
- 快照：上游 `main` 分支 commit `e45234d8e0f3c871a9939578308acac3ae50b34b`（2026-10-26）
- 部署地址：<https://lif3ng-vibe.github.io/docs-cn/lightpanda/>

## 这是什么

对上游文档的一次性快照汉化：保留原站 Nextra 4 + Next.js 15 工程与视觉，全部正文、侧边栏、UI 文案中文化，构建为纯中文静态站点。上游更新后如需同步，以快照 commit 为基线手动 diff。

## 本地运行

```bash
npm install
npm run dev     # http://localhost:1414/docs-cn/lightpanda/
```

要求 Node ≥ 20.19。

## 构建与产物

```bash
npm run build   # next build（静态导出到 out/）+ pagefind 索引 + 重定向桩页
```

产物在 `out/`，部署时以子路径 `/docs-cn/lightpanda/` 访问（`redirects.mjs` 中的 `basePath` 已指向该前缀）。

## 与上游的差异（汉化改造点）

- **`@lightpanda/common` 为本地桩实现**（`packages/common/`）：上游该包是私有 monorepo 内部包（npm 上不存在，仓库外工作区引用）。桩包提供接口等价实现——`Logo`/`SocialIcons` 的 SVG 从线上渲染 HTML 提取，`siteDetails`/`Favicon`/`DNSPrefetch`/`Providers`/`Version` 按线上行为重建，`variables.css` 变量取自线上编译产物。
- **`basePath`**：上游 `/docs` → 本镜像 `/docs-cn/lightpanda`（`redirects.mjs`）。
- **补依赖**：上游 `package.json` 漏提交 `cssnano`（`postcss.config.mjs` 生产条件依赖，靠其私有工作区传递安装），此处显式声明。
- **钉 `zod@4.0.16`**：zod ≥4.1 对 Nextra 4.6.1 的 `Head` 组件 props 校验会以 "expected nonoptional" 失败，构建期预渲染报错，需按 overrides 锁回旧版。
- **`build` script** 去掉了 `NODE_ENV='production'` 前缀（Windows cmd 不兼容；`next build` 默认即 production）。
- **锚点回修脚本**：`scripts/fix-anchors.mjs` 依据 `.anchor-maps/` 的标题映射表回写全站跨页/本页锚点链接。
- `src/generated/` 三个生成页（上游 CI 由浏览器源码 `zig build docs` 生成）按快照内容直接翻译，上游更新时会重新生成覆盖。

## 许可

上游文档内容遵循 Apache-2.0（见 [LICENSE](LICENSE)）。本镜像为非官方翻译，版权归原作者；译文与上游的商标、Logo 等品牌资产归 Lightpanda 团队所有，此处引用仅用于文档汉化展示。
