# docs-cn

开源项目文档的中文翻译集合。每个子目录是一个独立可运行的文档站点（Astro + Starlight），翻译均为非官方、一次性快照。

## 收录项目

| 项目 | 目录 | 原站 | 上游仓库 | 快照日期 |
|---|---|---|---|---|
| codegraph | `codegraph-docs-cn/` | https://colbymchenry.github.io/codegraph/ | https://github.com/colbymchenry/codegraph | 2026-08-18 |
| Orca | `orca-docs-cn/` | https://www.onorca.dev/docs | https://github.com/stablyai/orca | 2026-08-19 |

## 运行任意子项目

每个子目录都是独立站点，前置要求 Node.js ≥ 22.12：

```bash
cd <子目录>          # 如 codegraph-docs-cn 或 orca-docs-cn
npm install
npm run dev          # 本地预览，默认 http://localhost:4321/
npm run build        # 产出 dist/
npm run preview      # 预览构建产物
```

## 翻译说明

- **复用原站工程**：拿到上游站点源码时，沿用原工具链（配置/主题/组件），仅中文化内容（codegraph）。
- **从渲染站点重建**：上游站点源码不公开时，从线上站点的 Next.js RSC payload 提取正文重建为 Markdown，再用 Starlight 搭站（orca）。
- 术语口径见各子目录的 `GLOSSARY.md`（如适用）。
- 代码块、命令、配置键、产品名保留英文；按钮/菜单名保留英文加粗并首次出现括注中文。
- 每页 frontmatter 的 `source` 字段记录原站 URL，便于后续手动同步。

## 目录结构

```
docs-cn/
├── codegraph-docs-cn/     # codegraph 中文文档（Starlight）
├── orca-docs-cn/          # Orca 中文文档（Starlight）
└── docs/                  # 翻译流程的设计文档与实施计划
```

## 许可

翻译内容遵循各上游项目的原始许可。每个子目录的 README 标注了来源与快照日期。