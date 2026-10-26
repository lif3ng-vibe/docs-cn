# LiteLLM 文档中文镜像（litellm-docs-cn）

LiteLLM 官方文档（docs.litellm.ai）的全站非官方中文翻译，基于上游公开快照重建，可本地运行与构建。

> **非官方声明**：本项目与 BerriAI 无关，仅供学习参考。内容版权归 [Berri AI](https://github.com/BerriAI/litellm-docs) 所有（MIT 许可）。翻译以官方英文文档为准，如有出入以官方站为准。

## 快照信息

- 源仓库：https://github.com/BerriAI/litellm-docs（分支 main）
- 快照 commit：`f8aa00d07ef51730a41c9d8047699d556e1ce64f`（2026-10-09）
- 翻译范围：一期 715 个文件（`docs/` 全部 + `src/pages/`），二期生态页（tutorials / projects / observability / search / harness / pass_through）暂未翻译

## 本地运行

前置要求：Node.js ≥ 22.18、npm ≥ 8.3

```bash
npm ci
npm start        # 开发服务器 http://localhost:3000
```

## 构建

```bash
npm run build    # 产物在 build/
npm run serve    # 本地预览构建产物
```

GitHub Pages 子路径部署（可选）：

```bash
DOCS_SITE=https://<user>.github.io DOCS_BASE=/docs-cn/litellm/ npm run build
```

## 与上游的差异（镜像裁剪）

- 移除全部上游遥测（PostHog / GA / Crisp / FeedbackRocket）、Ask AI（外发提问）、销售与订阅表单外发
- 移除 blog 与 release-notes 区块（正文中的相关链接改指上游官方站）
- 移除 Rust 迁移横幅与 `/rust-migration` 页面
- 新增中文搜索 UI（本地索引），`llms.txt` / `.md` 伴生输出保留

## 工具脚本（scripts-cn/）

一期翻译与终检过程中沉淀的管线工具，供后续维护（如上游同步 diff）复用：

- `check-zh.cjs` — 译态判定（剥代码围栏后 CJK 正文行占比）
- `check-headings.cjs` — 标题数对账（EN 锚点底稿 vs 译文，防静默丢节）
- `scan-fences.cjs` / `scan-tabs.cjs` — 围栏奇偶与 Tabs/TabItem 配对扫描
- `extract-anchors.cjs` — 从构建产物提取页级锚点清单（兼容压缩 HTML）
- `repair-anchors.cjs` / `repair-pass2.cjs` — 跨页锚点回修（map 驱动 + 按序配对兜底）
- `check-bold.cjs` — 构建产物字面 `**` 扫描（CJK 粗体闭合终检）
- `split-parts.cjs` / `merge-parts.cjs` — 超长文件确定性分段/拼接（围栏感知）
