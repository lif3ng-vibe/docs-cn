# ollama-docs-cn

Ollama 官方文档中文镜像（非官方翻译）。

- **源站**：https://docs.ollama.com （Mintlify 托管，theme: maple）
- **上游快照**：[ollama/ollama](https://github.com/ollama/ollama) `main` 分支 `docs/` 目录，commit `c1db5f9ef203b2e946161bf4c6bd4f2ec7f123b3`（2026-11-02 抓取）
- **规模**：72 页（Guide 23 + Integrations 28 + API Reference 21）
- **部署**：https://lif3ng-vibe.github.io/docs-cn/ollama/ （由 hub 仓库 CI 构建发布）

## 非官方声明

本项目是 Ollama 文档的社区中文翻译，与 Ollama 官方无关。Ollama 及其标志是 Ollama 的商标。翻译基于上游快照，内容可能滞后于官方最新文档。

## 本地构建

```bash
npm install
npx mintlify export --disable-openapi   # 匿名导出静态站（无需 Mintlify 账号）
```

产物为根路径站，部署到子路径需先跑后处理：

```bash
DOCS_BASE=/docs-cn/ollama node scripts/prefix-dist.mjs
npx pagefind --site dist                # 补充搜索索引（匿名导出无搜索）
node scripts/inject-theme.mjs           # 注入 Pagefind 搜索 UI + CJK 字体
```

## 翻译管线说明

- 翻译对象：导航内 60 个 MDX 页 + `openapi.yaml` 人类可读字段 + `docs.json` 导航文案
- 不译（上游仓库内部文档，不在站点导航）：根 `README.md`、`development.md`、`examples.md`、`template.mdx`、`api.md`、`tools/`
- 锚点：中文标题重算 Mintlify slug（转连字符型），页内/跨页链接按 `.anchor-maps/` 映射回修（`scripts/fix-anchors-from-maps.mjs`），导出产物再用标题配对法校验兜底（`scripts/fix-anchors-by-pairing.mjs`）
- 术语：见 [GLOSSARY.md](GLOSSARY.md)
