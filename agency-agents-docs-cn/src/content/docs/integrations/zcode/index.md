---
title: 'ZCode 集成'
---

[ZCode](https://z.ai) 是 Z.ai 基于 GLM 的编码智能体 harness。
每个智能体被渲染为一个带 `name` 和 `description` frontmatter 的
独立 Markdown 智能体文件，ZCode 会从其智能体目录中发现它们。

生成的文件来自 `scripts/convert.sh --tool zcode`，它为每个智能体
向 `integrations/zcode/agents/` 写一个 Markdown 文件。这些生成文件
不入库（见 `.gitignore`）；请在本地重新生成。

## 生成

从仓库根目录：

```bash
./scripts/convert.sh --tool zcode
```

## 安装

从你的目标目录运行安装器：

```bash
cd /your/project && /path/to/agency-agents/scripts/install.sh --tool zcode
```

智能体安装到 `~/.zcode/agents/<slug>.md`（用户级）——也就是 ZCode
读取子智能体的那个目录。用 `--division` / `--agent` 只安装一部分，
或设置 `ZCODE_AGENTS_DIR` 覆盖安装目的地。