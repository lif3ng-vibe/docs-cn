---
title: 'Astryx v0.1.3：更好的表格、键盘导航与无障碍'
description: 'Table 上由插件贡献的右键菜单、完整的 WAI-ARIA 键盘模式、InputGroup 组合，以及更多内容——外加一个很容易处理的破坏性变更。'
date: '2026-07-04'
type: 'update'
authors:
  - 'team'
tags:
  - 'Release'
  - 'Accessibility'
  - 'Components'
---

Astryx v0.1.3 发布了。本次发布在无障碍、键盘导航和数据表格上是一大步进展。安装命令：

```bash
npm i @astryxdesign/core@0.1.3
```

所有包以同一版本一起发布，请把每个 `@astryxdesign/*` 包都升级到 `0.1.3` 以保持一致。

## 亮点

### Table 支持右键上下文菜单

表格现在支持由插件贡献的上下文菜单。右键点击列标题或某一行，就能得到真正的操作——比如升序排序、降序排序、清除排序——而不是浏览器的默认菜单。插件通过现有的 cell transforms 添加自己的操作，表格会把所有已启用插件的条目拼接在一起，因此无需改动核心代码就能扩展菜单。

### 键盘导航

`TabList`、`TreeList`、`Toolbar`、`SegmentedControl` 和各菜单组件现在遵循 WAI-ARIA APG 模式：单一 Tab 停靠点、方向键导航、Home/End、typeahead 以及漫游焦点（roving focus）。全新的构建单元——`useListFocus`、`useGridFocus`、`useTypeahead`、`useKeyboardHint` 和 `useAnnounce`——让你也能构建自己的无障碍复合控件；新的 `VisuallyHidden` 原语让"仅供屏幕阅读器的上下文"变得易于添加。

### 在 InputGroup 中组合输入组件

`Selector`、`MultiSelector`、`DateInput`、`TimeInput` 和 `Typeahead` 现在可以放进 `InputGroup`，共享标签、描述，边框连为一体。

### 说明控件为何禁用

为选择、拾取和文本录入类输入组件添加 `disabledMessage`，即可显示一个 tooltip，告诉用户控件_为什么_被禁用——同时控件保持可聚焦，确保这一说明通过键盘也能到达。

### 布局易用性提升

`Stack`、`Grid` 和 `Center` 获得了 padding、尺寸与滚动相关 prop，常见的框架布局不再需要内联 `style={{}}`。

### Popover 关闭行为控制

新增的 `hasLightDismiss` 和 `hasEscapeDismiss` prop 让你能构建"显式关闭"的表面，例如引导式 coachmark。层级动画现在也遵循 `prefers-reduced-motion`。

### 更多

新增 **Kanban Board** 模板，外加 **博客 RSS 订阅与纯文本（`.txt`）文章**。

## 一个破坏性变更（很容易处理）

`hasAutoFocus` 已从 `DropdownMenu`、`ContextMenu` 和 `MoreMenu` 中移除。菜单现在打开时总是聚焦第一项——这才是正确的 APG 行为。无需迁移；如果你之前传了这个 prop，删掉即可。

## 致谢

非常感谢本次发布的所有贡献者：[@AKnassa](https://github.com/AKnassa)、[@arham766](https://github.com/arham766)、[@athz](https://github.com/athz)、[@cixzhang](https://github.com/cixzhang)、[@durvesh1992](https://github.com/durvesh1992)、[@ejhammond](https://github.com/ejhammond)、[@ernestt](https://github.com/ernestt)、[@harshavardhan194](https://github.com/harshavardhan194)、[@humbertovirtudes](https://github.com/humbertovirtudes)、[@IFAKA](https://github.com/IFAKA)、[@imdreamrunner](https://github.com/imdreamrunner)、[@josephfarina](https://github.com/josephfarina)、[@kentonquatman](https://github.com/kentonquatman)、[@mohitWeb-lab](https://github.com/mohitWeb-lab)、[@pollychen-lab](https://github.com/pollychen-lab)、[@thedjpetersen](https://github.com/thedjpetersen)。

同时感谢 [@aarongarciah](https://github.com/aarongarciah) 在无障碍方面的反馈，以及 [@aurorascharff](https://github.com/aurorascharff)，她主导了文档站基于最新 Next.js 特性的优化工作。

完整变更日志见 [v0.1.3 发布页](https://github.com/meta/astryx/releases/tag/v0.1.3)。
