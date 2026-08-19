---
title: "Mermaid、PDF 与图片查看器"
description: "Mermaid、PDF 与图片查看器——Orca 文档。"
source: "https://www.onorca.dev/docs/editing/viewers"
---

# Mermaid、PDF 与图片查看器

Orca 为大多数仓库里常见的格式内置了查看器。

## Mermaid

Mermaid 图在 markdown 预览中行内渲染。独立的 `.mmd` 文件在带平移/缩放的专用查看器中打开。

## PDF

滚动、缩放和文字选择。适合检入仓库的设计文档。切走 PDF 标签页再回来时（包括同一会话内关闭后重开），滚动位置会恢复——页码加页内偏移，落点就是你离开的地方。位置仅在会话内有效，Orca 重启后清空。

## 图片

`.png`、`.jpg`、`.svg`、`.webp`、`.gif`。图片 diff 模式可并排比较同一文件的两个版本。

## CSV / TSV

`.csv` 和 `.tsv` 文件在表格查看器中打开，支持可排序的列和快速搜索。适合测试夹具、导出文件以及任何检入仓库的表格数据。需要直接编辑单元格时，用工具栏切回原始文本视图。

## Jupyter notebook

`.ipynb` 文件在 notebook 查看器中打开，带渲染的 markdown、语法高亮的代码单元格和已保存的输出。编辑单元格会写回磁盘上的 `.ipynb` 并保留 nbformat，diff 保持干净。

> **Beta**：notebook 编辑器标记为 beta。单元格执行和更丰富的输出渲染仍在打磨——如果仓库里有 notebook 无法干净加载，请提一个 issue。
