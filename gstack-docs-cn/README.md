# gstack 中文文档（非官方翻译）

[gstack](https://github.com/garrytan/gstack) 是 Garry Tan 开源的 Claude Code 虚拟工程团队技能集（MIT）。上游**没有 web 版文档站**——文档以 README + `docs/` 目录的 Markdown 形态发布。本站按 README 的链接面（正文链接 + Docs 表）自建 [Starlight](https://starlight.astro.build/) 站点组织这批文档并全量汉化。

- 源仓库：<https://github.com/garrytan/gstack>
- 快照：`main@eaf1701da2d68b5c03136ff530aa228013eedb7c`（2026-11-06，shallow clone）
- 收录：README + 34 篇 `docs/` 与根目录文档，共 35 页；`CHANGELOG.md`（约 1.9 万行版本流水账）与 agents-digest 摘要未收录，站内链接指回 GitHub 原文件
- 非官方翻译，仅供学习交流；内容以英文原文为准

## 本地运行

```bash
npm install
npm run dev      # http://localhost:4321（base 为根路径）
```

## 构建

```bash
# 本地（根路径 base）
npm run build

# 模拟 hub Pages 部署（Git Bash：MSYS2_ENV_CONV_EXCL 防 env 改写）
MSYS2_ENV_CONV_EXCL="DOCS_BASE;DOCS_SITE" \
  DOCS_SITE=https://lif3ng-vibe.github.io \
  DOCS_BASE=/docs-cn/gstack/ \
  npm run build
```

正文内链 `/slug/` 与本地图片 `/images/…` 由 `src/plugins/base-links.mjs`（rehype）在构建期统一加 base 前缀，CI 无需 sed。

## 结构

```
scripts/import-content.mjs   # 一次性迁移：gstack-main 快照 → src/content/docs（frontmatter/链接/图片改写）
scripts/fix-links.mjs        # 锚点回修：.anchor-maps 映射 → 站内链接 #片段 改中文锚点
scripts/verify-anchors.mjs   # 构建后校验：dist 内 href="#…" 与实际 id 匹配
.anchor-maps/                # 各页标题映射（英文 | 中文 | 新锚点）
GLOSSARY.md                  # 术语表与排版纪律
```

## 同步口径

一次性快照，不做上游持续同步。要更新：重拉 `gstack-main` 快照 → 对比 `scripts/source-map.json`（源路径 → slug 映射）→ 重跑 import（会覆盖中文翻译，需人工合并）→ 重新翻译增量。
