---
title: "Monaco 编辑器与自动保存"
description: "Monaco 编辑器与自动保存——Orca 文档。"
source: "https://www.onorca.dev/docs/editing/monaco"
---

# Monaco 编辑器与自动保存

Orca 的代码编辑器是 Monaco——与 VS Code 同款——外加一些 Orca 特有的调整。

## 自动保存

文件在失焦和短暂空闲后保存。没有"脏"圆点，因为正常流程中不存在未保存的变更。

## 多光标、跳转、查找

- `Cmd-D`——选中下一个相同词。
- `Cmd-F` / `Cmd-Shift-F`——文件内查找 / worktree 查找。选中文字时，文件内查找会以当前选区填充搜索框。
- `Cmd-Click`——转到定义（语言扩展支持处可用）。

## 变更视图模式

在任意编辑器标签页切换 **Changes view mode**（变更视图模式），即可把文件变成标签页内的 HEAD 对比工作树 diff，且不打断光标位置。快捷键与 [Diff 查看器](/review/diff-viewer) 相同——`n`/`p` 遍历 hunk，`s` 暂存。再次切换即回到常规文件视图。

## 自动换行

文件编辑器默认对长行换行。可从编辑器标签页的 **⋯** 菜单切换 **Word Wrap**（自动换行），按 `Alt+Z`（与 VS Code 相同；可在 [Settings → Shortcuts](/settings) 重映射），或在 [Settings → General → Editor Word Wrap](/settings) 设置默认值。该设置与 **Diff Word Wrap** 相互独立，后者只影响 diff 编辑器。

## Minimap

文件编辑器可在 [Settings → Appearance](/settings) 中开启 minimap（小地图）。默认关闭；喜欢 VS Code 式概览栏的话可以打开。

## 自定义编辑器字体

默认情况下，编辑器与 diff 视图使用与终端相同的字体。保持 [Settings → Appearance](/settings) 中 **Editor Font Family**（编辑器字体族）为空即可维持这一联动；设置字体则仅覆盖编辑器（UI 字体保持独立）。

## 语言支持

Monaco 开箱支持的语法高亮全部可用。Orca 有意做编辑器优先而非 IDE 优先——类型检查器和 linter 请在终端窗格中运行。
