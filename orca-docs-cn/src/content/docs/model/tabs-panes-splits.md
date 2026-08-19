---
title: "标签页、窗格与分屏"
description: "拖拽分屏窗格、标签组，以及固定不动的边界。"
source: "https://www.onorca.dev/docs/model/tabs-panes-splits"
---

Orca 的窗格系统为同时观察多个智能体工作而不丢失上下文而设计。标签页组成窗格；窗格分屏成布局。

把标签页拖到窗格边缘即可分屏——终端、diff 和浏览器标签页并排

## 标签页

每个标签页装一样东西：一个终端、一个编辑器缓冲区、一个浏览器、一个 diff、一个 PR。标签页存在于**标签组（tab group）**中。

- 在组内上下拖动标签页可重排。
- 把标签页拖到另一个组可移动它。
- 在 macOS 上用 `Cmd+Option+W`、Windows / Linux 上用 `Ctrl+Alt+W` 关闭活动 worktree 中的所有编辑器文件标签页。
- 活动标签页的色条标记哪个窗格拥有焦点。

### 切换标签页

**新安装**的默认组合键：

| 操作 | macOS | Linux / Windows |
| --- | --- | --- |
| 下一个 / 上一个标签页（所有类型） | `Cmd+Shift+]` / `Cmd+Shift+[` | `Ctrl+Shift+]` / `Ctrl+Shift+[` |

可在 [Settings → Shortcuts](/settings) 中重新映射。既有安装保留 `~/.orca/keybindings.json` 中的自定义覆盖。

## 分屏窗格

把标签页拖到窗格边缘创建分屏：

- **右缘**——左右分屏（水平分割）。
- **底缘**——上下分屏（垂直分割）。

分屏可以嵌套。你可以左边放智能体终端、右上放 diff 视图、右下放浏览器标签页——同时进行。

![任意标签页类型都可以彼此分屏——智能体终端、diff、浏览器、编辑器、PR 视图共存于一棵窗格树。](/whats-new/split-anything.webp)

任意标签页类型都可以彼此分屏——智能体终端、diff、浏览器、编辑器、PR 视图共存于一棵窗格树。

终端标签页还可以在标签内部分屏。用终端标签菜单的 **Split terminal right** 或 **Split terminal down**，或用活动终端窗格头部的分屏按钮做右分屏。

## 固定边界

窗格边界停在你放置的位置。调整窗口大小不会打乱你的布局；边界位置按 worktree 保存。

## 跨 worktree 的标签组

每个 worktree 拥有自己的标签布局。切换 worktree 会换掉整棵窗格树——你的浏览器标签页、终端和 diff 会原样重现。
