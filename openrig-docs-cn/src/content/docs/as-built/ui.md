---
kind: as-built
title: ui.md——已重组进模块化 As-Built 目录树（重定向存根）
status: superseded
topics: [knowledge-and-context]
domains: [engineering-advisor, operating-advisor, product-advisor]
applies-when: |
  你沿着一个旧引用来到了 docs/as-built/ui.md。这份单体大文件已重组
  （slice-08，context-architecture-v1）为 ui/ 模块文件夹。请前往 README.md
  （实况地图）或 codemap.md（按用例查找），再进入指名的 ui/ 模块。
siblings: [README.md, codemap.md, architecture.md]
prerequisite-reads: []
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---

这份单文件 UI 单体已拆分为一个由可独立加载、带 frontmatter 标签的主题模块
组成的文件夹（slice-08，`context-architecture-v1`）。已交付操作者 UI 的权威
as-built 描述现位于 `ui/`。本存根只是一个转发指针，让旧引用仍可解析。

**从这里开始**：

- [`./README.md`](/as-built/README/)——实况地图与完整模块索引。
- [`./codemap.md`](/as-built/codemap/)——导航索引：按用例查找表与源码根指针。
  当你清楚自己需要*什么*但不知道是*哪个*模块时，用它。

## 主要内容去向

UI 内容现为 **`ui/` 下的 4 个模块**：

| 模块 | 迁移至此的内容 |
|---|---|
| [`ui/shell-and-routing.md`](/as-built/ui/shell-and-routing/) | 包形态、`AppShell` 外壳模型（rail / Explorer / 中央工作区 / 抽屉 / 预览栈）、路由树、设计原语、共享详情抽屉/查看器系统、事件/活动消费。 |
| [`ui/topology.md`](/as-built/ui/topology/) | 拓扑呈现面——宿主混合图、表格/终端视图、活动环 / 烫手山芋视觉语言、终端预览弹出框、导航/覆盖层契约。 |
| [`ui/project-and-for-you.md`](/as-built/ui/project-and-for-you/) | 操作者目的地呈现面——Project 可观测性（workspace/mission/slice scope 标签页）、For-You 关注信息流（5 卡分类器 + 队列操作）、基于 vellum 品牌系统的 Dashboard 落地页。 |
| [`ui/library-specs-and-design-system.md`](/as-built/ui/library-specs-and-design-system/) | Library（`/specs`）UI——specs/applications/skills 呈现面、图形层、当前设计约束，以及指向 `../DESIGN.md` 的设计系统指引。 |

品牌/设计规则仍住在 `docs/DESIGN.md`（按设计位于仓库 `docs/` 根——见
`ui/library-specs-and-design-system.md`）。