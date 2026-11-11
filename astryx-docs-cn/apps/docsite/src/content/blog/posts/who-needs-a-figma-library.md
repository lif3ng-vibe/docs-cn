---
title: '谁还需要 Figma Library？'
description: '推出 Astryx Figma Library：由一个 Night Watch 构建并自维护，在每个点版本发布时与代码保持同步。'
date: '2026-08-05'
type: 'update'
authors:
  - 'ernest'
tags:
  - 'Figma'
  - 'AI'
  - 'Release'
coverImage: '/blog/who-needs-a-figma-library/cover.png'
coverAlt: '一个 Figma 画布，显示一个 Astryx Button 组件——带 Astryx 徽标、Astryx 字样和下拉尖角号的深色圆角按钮——处于选中状态、显示组件边界，光标悬停在尖角号上'
relatedDocs:
  - title: 'Vibe Test'
    href: '/blog/vibe-tests'
  - title: 'Astryx 是如何工作的'
    href: '/blog/how-astryx-works'
---

其实，我们给你准备了一份，就在[这里](https://www.figma.com/community/file/1659998707120781098)！

说实话，我们纠结了很久：到底还需不需要 Figma library。在内部，我们的周插入率锐减了 95%。身边多数设计师都在用代码而不是画布做设计。我们一直在想 Figma 在我们设计工作流里究竟处于什么位置……

让我们仍想试一试的，是发现自己在某些场景下还是会回到 Figma。做快速探索和产出视觉素材，它依然是最快的路径。虽然我们不再把它当规格说明或交付交接工具，但作为速写本它依然好用。另外，看到社区快速涌现的 Figma library，我们真的很受鼓舞。（致敬 [Lee](https://www.figma.com/community/file/1655939158795671259/astryx-for-figma) 和 [Adrian](https://www.figma.com/community/file/1661363854016665156/astryx-design-system-for-figma-v0-1)。也去看看他们的 library 吧！）

我们决定：如果能把构建与维护基本自动化，就放一份出来。我们做到了！现在拿出这份 [Astryx Figma Library](https://www.figma.com/community/file/1659998707120781098)，作为两个方向上的实验：

1. Figma library 在设计师的工作流里是否还有一席之地？
2. 我们能否把它自动化，让投入与回报的权衡保持平衡？

## Figma Librarian Night Watch

这份 Astryx Figma library 主要由一个叫 [Figma Librarian](https://github.com/meta/astryx/wiki/Night-Watch-Figma-Librarian) 的 Night Watch（Astryx 的定时任务体系）构建，并将由它持续维护。它接入 [Figma MCP](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)，并被赋予一组组件构建技能，其中包括我们的构建偏好，比如"在代码里对应 react 节点时始终使用 slot 特性"。每个点版本发布时，librarian 都会检查系统中的相关变更并自维护这份 library，让它保持最新。
