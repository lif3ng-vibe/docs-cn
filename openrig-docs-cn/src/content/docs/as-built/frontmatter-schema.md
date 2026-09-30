---
kind: as-built
title: As-Built Frontmatter——指引 + as-built 独有字段
status: active
topics: [knowledge-and-context, frontmatter]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  在 docs/as-built/ 下编写或更新文档时。说明约束这些文档的 frontmatter
  约定，以及 as-built 文档独有的那一个字段。
siblings: [README.md]
prerequisite-reads: [README.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---

`docs/as-built/` 下的每篇文档都带 YAML frontmatter。其形状**不**在本文
定义。它是全基底通用的上下文 frontmatter 约定；本文只指向它，并记录
as-built 文档独有的那一个字段。

## 权威约定（不复制——请去读）

`openrig-work/conventions/frontmatter-for-context/README.md` 是权威模式：
必需底线（`kind` + `title` + `status` + `applies-when`）、推荐字段
（`topics`、`domains`、`siblings`、`prerequisite-reads`），以及 `kind:`、
`topics:` 与 `domains:` 的受控词表。请对着该约定写作。除下文那个字段外，
本文对它没有任何增补。

## `kind: as-built`

这些文档使用 `kind: as-built`。该值在约定的受控 `kind:` 词表中（其
"Controlled vocabulary — `kind:`"表的第一行，来源 `openrig/docs/as-built/*`）。
使用它是合规的，不是扩展。

## `last-verified-against-source: <sha>`（as-built 独有）

as-built 文档描述运行中的系统。源码漂移时它们随之漂移。as-built 独有字段
记录该文档上次核验所对照的确切 commit：

```yaml
last-verified-against-source: 7eaf524c
```

- **值**：该文档上次编辑时核验所对的源码 HEAD 的短 SHA。与
  `last-updated: <iso-date>` 配对。
- **为何在这里而不在约定中**：约定是全基底通用的；多数上下文文档不追踪
  源码 SHA。该字段只对镜像代码的文档有意义，即 as-built 文档。它是
  context-architecture-v1 任务在自己生产上吃自家狗粮所用的逐模块漂移检测
  锚点。
- **纪律**：对照更新的 HEAD 重新核验某个模块时，递增该字段（与
  `last-updated`），并在每条被复核的承重论断上就地携带
  `re-confirmed <file:line> @HEAD` 注记。

## 另见

- `openrig-work/conventions/frontmatter-for-context/README.md`——权威模式
- `README.md`——as-built 文档集的实况地图