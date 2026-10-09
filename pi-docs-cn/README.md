# pi-docs-cn — Pi 文档中文镜像（非官方）

[Earendil](https://earendil.com) 的终端 AI 编码智能体 [Pi](https://pi.dev) 官方文档（<https://pi.dev/docs/latest>）的全站中文翻译，非官方镜像。

- **上游源**：<https://github.com/earendil-works/pi>（文档在 `packages/coding-agent/docs/`，40 篇 Markdown + `docs.json` 导航）
- **上游快照**：`main@6fb2e7815167e6b19006fc526d1a5d0f5f998787`（2026-10-08）
- **快照日期**：2026-10-09。上游更新后可按此 commit 手动 diff 同步。

## 说明

- 上游 pi.dev 使用自研渲染器（未开源），但内容按 Mintlify 格式撰写（`docs.json` navigation）。本镜像用 **Mintlify 原班工具链**（CLI 4.2.992）渲染同一份 Markdown，主题为 Mintlify 默认 `mint` 主题，与 pi.dev 视觉不完全一致。
- 纯中文单语，无双语切换。产品名、命令、配置键、代码保持英文原文；术语首次出现附英文原词（见 `GLOSSARY.md`）。
- 锚点（标题链接）按 Mintlify slug 规则随中文标题重新生成，页内/跨页锚点链接已按产物实测回修。
- 图片沿用上游原图（含英文截图），未重绘。

## 本地运行

```bash
npm install
npx mintlify dev        # http://localhost:3000（首次需登录 Mintlify 账号）
```

## 本地构建（静态导出）

```bash
npx mintlify export --disable-openapi   # 产出 export.zip（匿名可用，无需登录）
```

产物为根路径静态站。部署到子路径（如 GitHub Pages `/docs-cn/pi/`）需先经 `scripts/prefix-dist.mjs` 加前缀（参见 hub 仓库 `.github/workflows/deploy-pages.yml` 的 `Build pi-docs-cn` 段）：

```bash
mkdir dist && (cd dist && unzip -q ../export.zip -x "export.zip" "Start Docs.bat" "Start Docs.command" "serve.js")
DOCS_BASE=/docs-cn/pi node scripts/prefix-dist.mjs
```

## 校验脚本

```bash
npx mintlify validate                          # docs.json + 内容结构校验
node scripts/verify-anchors-cn.mjs dist        # 导出产物全站锚点核对（DOCS_BASE 环境变量传部署前缀）
```

## 目录

- `docs.json` — Mintlify 配置（中文导航）
- `*.md` — 40 篇文档正文（中文）
- `images/` — 上游图片
- `GLOSSARY.md` — 术语表与翻译规范
- `scripts/` — 部署前缀与锚点校验脚本
- `LICENSE.upstream` — 上游 MIT 许可证副本

## 许可

文档内容源自 [earendil-works/pi](https://github.com/earendil-works/pi)（MIT License，Copyright (c) 2025 Mario Zechner）。本翻译项目同样以 MIT 许可发布。翻译由 AI 辅助完成，如发现译误欢迎提 issue。
