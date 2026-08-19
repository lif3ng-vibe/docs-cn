---
title: "Diff 查看器"
description: "Diff 查看器——Orca 文档。"
source: "https://www.onorca.dev/docs/review/diff-viewer"
---

# Diff 查看器

Orca 的 Diff 查看器为认真评审 AI 生成的代码而设计——不是扫一眼了事。每个 worktree 都内置了相对其起始引用（start-from ref）的 diff。

## 功能特性

- **合并 diff**——覆盖所有已暂存、未暂存和未跟踪文件。
- **行号**——两侧都有，可开关。
- **图片 diff**——二进制图片提供并排、滑动对比和洋葱皮模式。
- **HTML 预览**——在 **View all**（查看全部）/ 合并 diff 中，工作树里仍然存在的 HTML 区段会在常驻可见的打开文件控件旁显示 **Open Preview to the Side**（在侧边打开预览，眼睛图标）。预览会在侧边的浏览器分屏中打开工作树的 HTML。已删除的 HTML 以及仅展示 commit 的合并界面不显示眼睛图标。
- **合并冲突界面**——三方视图加行内解决。
- **按 hunk 或按行暂存**——与 `git add -p` 等效，但是可视化的。

## 范围限定

默认情况下，diff 展示相对 worktree 起始引用的变更。可以从 diff 工具栏切换为与任意 commit、分支或基准引用（base ref）对比。

## 自动换行

开启 diff 自动换行后，长行就地折行，宽 diff 可以自上而下阅读而无需横向滚动。默认关闭。在 diff 编辑器标题栏的 **⋯** 操作菜单中切换 **Word Wrap**（自动换行），或在 **Settings → General → Diff Word Wrap** 下设置全局默认值。两处控件共享同一设置——在编辑器里切换即全局生效。

## 文件树

合并 diff 可以在 hunk 旁显示一个可折叠的文件树。拖动文件树的尺寸手柄（或使用手柄上的方向键，Shift 可加大步进）来设定宽度——尺寸会跨会话记住。可从合并 diff 工具栏折叠或显示文件树。

## 键盘快捷键

- `j` / `k`——下一个 / 上一个变更文件。
- `n` / `p`——下一个 / 上一个 hunk。
- `F7` / `Shift+F7`——活动编辑器中的下一处 / 上一处变更。
- `s`——暂存光标所在 hunk。
- `c`——发起评论（[标注 AI Diff](/review/annotate-ai-diff)）。
