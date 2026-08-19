---
title: "计算机使用"
description: "让智能体通过无障碍树、截图与安全的 UI 操作驱动本地桌面应用。"
source: "https://www.onorca.dev/docs/cli/computer-use"
---

`orca computer` CLI 让智能体检查并控制本地桌面应用——列出运行中的应用、读取无障碍树、点击控件、设置值、输入文本、滚动和截图。当任务需要操作操作系统或第三方应用而非终端或内置浏览器时使用它。

> **Beta** 计算机使用按平台附带原生辅助程序，需要 Accessibility（辅助功能）权限，macOS 上还需要 Screen Recording（屏幕录制）权限。命令面已足够稳定，技能可以基于它构建，但标志名仍可能变动。

## 首次设置

检查运行时与权限：

```
orca status --json
orca computer permissions --json
orca computer capabilities --json
```

如果 `permissions` 报告有缺失，在系统设置里把 Accessibility（macOS 上还包括 Screen Recording）授予 **Orca Computer Use**，然后重新运行 `permissions --json` 确认。

## 快照 → 操作 → 快照

每次交互都遵循同一循环：读取应用当前状态，对特定元素执行操作，再重新读取状态验证结果。

```
orca computer list-apps --json
orca computer get-app-state --app com.spotify.client --json
orca computer click --app com.spotify.client --element-index 42 --json
```

元素索引的作用域是最近一次 `get-app-state` 的结果，而且可能是**稀疏的**。在 `--json` 输出中，从 `result.snapshot.treeText` 读取树。不要根据 `elementCount` 凭空推算索引。在导航、焦点变化、滚动或应用重渲染之后、复用索引之前，先刷新状态。

## 多窗口应用

```
orca computer list-windows --app com.microsoft.edgemac --json
orca computer get-app-state --app com.microsoft.edgemac --window-id <id> --json
orca computer click --app com.microsoft.edgemac --window-id <id> --element-index 12 --json
```

当列出的 id 不是 `none` 时，优先使用稳定的 `--window-id`；否则用 `--window-index`。

## 选择应用

优先使用 `list-apps` 返回的 bundle ID：

```
orca computer get-app-state --app com.microsoft.edgemac --json
```

应用名无歧义时也可用（`--app Spotify`）。仅当 bundle ID 与名称都撞车时才用 `--app pid:<number>`。

## 可用操作

```
orca computer click --app <app> --element-index <i> --json
orca computer set-value --app <app> --element-index <i> --value "text" --json
orca computer type-text --app <app> --text "text" --json
orca computer press-key --app <app> --key Return --json
orca computer hotkey --app <app> --key CmdOrCtrl+A --json
orca computer paste-text --app <app> --text "text" --json
orca computer scroll --app <app> --element-index <i> --direction down --json
orca computer drag --app <app> --from-x 100 --from-y 100 --to-x 300 --to-y 300 --json
orca computer perform-secondary-action --app <app> --element-index <i> --action <name> --json
```

优先用语义化操作（`click`、`set-value`、`perform-secondary-action`），而不是裸的 `type-text` 或 `press-key`——它们直接定位无障碍元素，并且在键盘输入会失效的焦点变化下仍然有效。

当无障碍定位失败时，谨慎回退到坐标：

```
orca computer click --app com.apple.Safari --x 120 --y 340 --json
orca computer drag --app <app> --from-element-index 3 --to-element-index 9 --json
```

## 敏感输入

把机密内容通过 stdin 传入，避免落入 shell 历史：

```
printf '%s' "$TEXT" | orca computer set-value \
 --app com.apple.Safari --element-index 7 --value-stdin --json
```

`type-text` 和 `paste-text` 同样支持 `--text-stdin`。

## 截图

`get-app-state` 返回无障碍树，默认还返回截图。带 `--json` 时，图像字节会写入磁盘，路径放在 `screenshot.path` 里返回，而不是内嵌在响应中。不需要像素时传 `--no-screenshot`（更快、负载更小）。传 `--restore-window` 可在截取前把隐藏或最小化的窗口恢复到可见。

## 从智能体中使用

自带的 `computer-use` 技能把同样的命令面连同安全指引打包在一起。把它安装到智能体的技能目录：

```
npx skills add https://github.com/stablyai/orca --skill computer-use
```

技能如何被识别见[技能](/cli/skills)。

## 后续步骤

- [CLI 概览](/cli/overview)——其余 CLI 能力（worktree、终端、浏览器）。
- [技能](/cli/skills)——把这套 CLI 分发给智能体。
