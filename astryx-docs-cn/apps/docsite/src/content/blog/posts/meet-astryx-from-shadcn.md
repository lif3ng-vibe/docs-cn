---
title: '在人们已经在构建的地方与他们相遇'
description: '为 shadcn 用户提供一条兼容路径：安装 Astryx 组件、示例、区块和页面，无需放弃 Astryx 包或 CLI。'
date: '2026-09-02'
type: 'engineering'
draft: true
authors:
  - 'josephfarina'
tags:
  - 'CLI'
  - 'Components'
  - 'Templates'
relatedDocs:
  - title: '将 Astryx 与 shadcn 一起使用'
    href: '/docs/shadcn-compatibility'
  - title: '迁移指南'
    href: '/docs/migration'
  - title: '组件'
    href: '/components'
---

很多团队已经有 shadcn 应用。要求他们先推翻现有配置才有资格试用一个 Astryx 组件，这样的初次见面不会愉快。

于是我们试了一个更小的想法：如果 Astryx 主动走进他们已经在用的工作流呢？

## 注册表是一辆送货卡车

shadcn 有一个[注册表协议](https://ui.shadcn.com/docs/registry)。注册表是静态 JSON，告诉它的 CLI 安装哪些包、向应用添加哪些源文件。独立库采用这个协议，因为它提供了一条熟悉的安装命令，而不必让自己成为 shadcn 的一部分。

Astryx 可以做同样的事。

```bash
npx shadcn@4.19.0 add <registry-origin>/templates/dashboard.json
```

关键在于这条命令之后发生什么。Astryx 不会变成一堆被复制来的组件源码。命令安装的是真正的 `@astryxdesign/core` 包。它复制的 dashboard 代码从这个包导入 `Card`、`Table`、`Button`、`ProgressBar` 以及其他一切。

组件行为、无障碍、样式与修复仍归 Astryx 所有。应用拥有它要的那份 dashboard 组合。

## 复制组合，而不是设计系统

这把目录分成两种有用的安装：

- **组件**条目安装包，并写一个极小的本地 re-export。
- **示例、区块或页面**条目复制导入该包的可编辑应用代码。

这个区分很重要。把完整的 Button 实现复制进每个应用，会让升级更难，也让每份拷贝各自漂移。复制一个使用已发布 Button 的 dashboard，则是正常的应用开发。设计系统保持为依赖。页面保持是你的。

复制来的组合带有一份小小的 Astryx 回执。更新 Astryx 包之后，`astryx upgrade --registry` 会对照已安装基础与对应注册表发布版预览变更。加 `--apply` 可更新未改动的文件并合并不重叠的编辑。冲突时你的文件保持原样，另出一份审阅文件。

深度定制依然存在，但它始终通过 `astryx swizzle` 显式触发。常规注册表安装不会替你跨过那条线。

## 我们试跑了整个目录

第一个实验从驱动 CLI 与文档站的同一份目录生成注册表条目。它覆盖了每个已发布的组件与 Hook、每个展示与示例区块，以及每个现成页面模板。

随后我们创建了一个干净的 shadcn Vite 应用，通过 shadcn CLI 安装了一个 Button 条目、一个 Button 展示、一个 Button 示例和一个完整的 analytics dashboard。CLI 安装了 Astryx 包和其他依赖，加上了所需的 CSS，把四个文件写入应用，未做任何其他修改的应用构建成功。

这个实验的意义在于它很小。注册表是生成的 JSON。文档站已经有目录、源码、包版本与页面。我们没有再造一套组件系统。

## 这不会取代 Astryx CLI

shadcn CLI 是称职的运输工。它能取来一个已知条目并放到正确的位置。

Astryx CLI 懂这个系统。它能帮你找到符合提示的素材、解释组件契约、从多个部件拼装页面、编译主题、校验安装，以及应用升级。

两条路径可以并肩共存：

```bash
# I know the exact item and already use shadcn
npx shadcn@4.19.0 add <registry-origin>/examples/button/variants.json

# I need help finding and maintaining the right pieces
astryx build "analytics dashboard with filters"
astryx doctor
astryx upgrade --registry
astryx upgrade --registry --apply
```

## 为什么要费这个事？

渐进采用正是意义所在。团队可以在现有应用里试用一个 Astryx 区块；有用时再加一整个页面。不需要先立项一个迁移工程，也不需要先学一个新工具才看到价值。

Astryx 得到一个更宽的前门，又不放弃包边界或更丰富的 CLI 体验。我们在人们已经在构建的地方与他们相遇，并给他们继续走进来的理由。
