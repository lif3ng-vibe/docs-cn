---
title: '最好的 CLI 是你从不需要运行的 CLI'
description: 'Astryx CLI 是什么、为什么它以文档为先，以及每条命令的导览。'
date: '2026-07-10'
type: 'engineering'
authors:
  - 'josephfarina'
tags:
  - 'CLI'
  - 'AI'
  - 'Docs'
coverImage: '/blog/the-astryx-cli/cover.gif'
coverAlt: '运行 astryx init 的终端'
relatedDocs:
  - title: 'AI 是个模仿者，所以我们给它备好了值得模仿的好范例'
    href: '/blog/astryx-cli-build-command'
  - title: 'Astryx 是如何工作的'
    href: '/blog/how-astryx-works'
  - title: 'CLI'
    href: '/docs/cli'
---

这是 Astryx CLI 系列的第一篇。它是智能体（agent）用 Astryx 构建时使用的工具——或者按我们喜欢的说法：机器的界面。我们花了很多心思把它做对。

## CLI 即文档

智能体如今就活在终端里。给它一个好工具，它会用得很好。但我们交给智能体的大多数工具都不够好。所以我们拍板：CLI 即文档。每一份文档、示例和参考都从这里出发。你正在读的文档站是 CLI 的消费者，而不是相反。CLI 是唯一事实来源。智能体读到的永远是我们编写和维护的那份原样源文本。不存在会失步的第二份拷贝。没有任何东西会过期。

文档只是其中一部分。CLI 还提供模板，向智能体展示如何构建一个真实的页面。它构建主题。它搜索这一切。最好的 CLI 是你从不需要运行的 CLI。智能体会去运行它。这一切都是开源的，欢迎[自己去看](https://github.com/meta/astryx/blob/main/apps/docsite/scripts/generate-data.mjs)。或者你干脆别读这篇文章。让你的智能体运行 `astryx blog`，它会替你读完。

## 导览

下面是有趣的部分。你其实一条都不需要记。你的智能体全会知道。但如果你好奇，我会带你过一遍 CLI 里你可能用到的每一部分。我们从空文件夹走到交付上线一个应用。我只讲高层概貌。

**初始化**。`astryx init` 安装包并写入你的 agent 文件。你甚至不需要维护那个文件。我们来。你想要改也仍然可以改。系统变化时，`upgrade` 让它保持最新。

**学习**。`astryx search` 一次性在组件、Hook、文档和模板中排出结果。`astryx component` 打印某个组件的 prop、示例与源码。`astryx hook` 对 Hook 做同样的事。`astryx docs` 覆盖 token、颜色、字体、动效与我们的原则等参考主题。

**组合**。`astryx build` 会成为你最好的朋友。告诉它你在做什么。它会把你的智能体指向最接近的模板、合适的区块，以及填补空缺的组件。`astryx template` 把页面模板直接放进你的项目。`astryx layout` 在你动手填充之前，用一小段表达式勾出页面结构。

**变成你的**。`astryx theme build` 把主题编译为生产用 CSS 和 JS。想拥有某个组件时，`astryx swizzle` 弹出它的完整源码。

**保持最新**。`astryx upgrade` 运行 codemod，在版本间迁移你的代码。它也会刷新 agent 文档。`astryx doctor` 找出问题并告诉你怎么修。

## 一个界面，多种读者

我们在每条命令上强制 JSON 接口。也强制稳定的错误码。智能体可以依赖这两者，以编程方式工作。一份 manifest 一次调用就能描述整个工具，供需要的智能体取用。大多数命令能自我描述。智能体可以自己找到路。还有省 token 的 dense 模式。

## 这才是重点

用 Astryx 构建的智能体不需要猜。一切都只差一条命令。

阅读第二篇：[AI 是个模仿者，所以我们给它备好了值得模仿的好范例](/blog/astryx-cli-build-command)。
