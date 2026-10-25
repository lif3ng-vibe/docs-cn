---
title: 在设计系统内工作
tagline: "让下一个页面与整体融为一体。"
description: "记录现有的视觉系统，在其约定之内构建，并随着产品演进而让 Impeccable 的设计上下文保持最新。"
section: concepts
order: 5
---

如果你的产品已经有一套想保留的设计，先把这些上下文交给 Impeccable，再让它扩展界面。既有代码、组件和已渲染的页面，同样也是这套系统的证据。

## 记录现有系统

让 Impeccable 把当前系统记录下来：

```text
/impeccable document
```

它会读取实现，把颜色、字体、布局规则和组件记录进 `DESIGN.md`，并在 `.impeccable/design.json` 里生成额外的元数据。审阅一遍记录，确保它捕捉的是有意的决策，而不是意外产物或过时样式。

如果 `DESIGN.md` 已存在，实现变化后就让它刷新。受众、目标和产品约束放在 `PRODUCT.md` 里，用 [init](/docs-cn/impeccable/docs/init)) 建立。[上下文文件](/docs-cn/impeccable/docs/context))解释每份记录里该放什么。

## 在系统内构建

有帮助时，点名一个有代表性的页面或组件：

```text
/impeccable add a billing settings page. Follow our existing settings screens and reuse the shared form controls.
```

新页面可以为它的任务探索更好的布局，同时保留既有的视觉识别。小的增量会继承周围的设计。仅凭文档缺失，并不构成让 Impeccable 替换一套连贯界面的许可。

[新页面工作流](/docs-cn/impeccable/docs/new-work#示例在既有视觉体系内新建页面))说明如何在既有系统内选择结构。

## 让改动可复用

当重复出现的模式应该沉淀为共享组件或令牌时，用 [extract](/docs-cn/impeccable/docs/extract))：

```text
/impeccable extract the repeated filter controls into our design system
```

用[自动设计检查](/docs-cn/impeccable/docs/hooks))或[检测器扫描](/docs-cn/impeccable/docs/detector#designmd-感知))来找出文档化数值所支持检查的那些漂移。遇到有意的例外，连同原因一起[记录一条具体的忽略](/docs-cn/impeccable/docs/config#值忽略))。

## 系统变化时更新记录

一次视觉改动获得通过后，让 Impeccable 从实现刷新 `DESIGN.md`。如果只是生成的元数据过时了，则保留文档本身：

```text
/impeccable document: refresh .impeccable/design.json from the existing DESIGN.md and current components. Preserve DESIGN.md.
```

拿不准哪些文件需要关注时，用 [doctor](/docs-cn/impeccable/docs/doctor))。共享的设计决策随代码一起提交，让下一个会话和团队其他人用上同一份上下文。
