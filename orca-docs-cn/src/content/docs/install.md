---
title: "安装"
description: "下载 macOS、Windows 或 Linux 版 Orca，并选择加入 RC 构建。"
source: "https://www.onorca.dev/docs/install"
---

## 下载

Orca 是一款桌面应用。把下面的链接发给自己，在 macOS、Windows 或 Linux 上打开：

- **macOS：** [Apple Silicon](https://github.com/stablyai/orca/releases/latest/download/orca-macos-arm64.dmg) · [Intel](https://github.com/stablyai/orca/releases/latest/download/orca-macos-x64.dmg)

- **Windows：** [安装程序](https://github.com/stablyai/orca/releases/latest/download/orca-windows-setup.exe)

- **Linux：** [AppImage](https://github.com/stablyai/orca/releases/latest/download/orca-linux.AppImage) · [.deb](https://github.com/stablyai/orca/releases)

- 历史版本：[GitHub Releases](https://github.com/stablyai/orca/releases)。

### Homebrew（macOS）

Orca 也以 Homebrew cask 形式发布，每次稳定版发布都会自动跟上：

```
brew install --cask stablyai/orca/orca
```

`brew upgrade --cask orca` 会拉取新的稳定版构建。该 cask 跟踪稳定通道——若要 RC 构建，请使用上面的 GitHub Releases 链接，或按[更新](#更新)一节所述的应用内 **Check for Updates** 流程操作。

## 首次启动

首次启动时，Orca 会：

- 请求访问你的主目录，以便添加仓库。
- 如果检测到 `~/.claude`、`~/.codex` 和 Ghostty 终端设置，提供导入。
- 把你带到一个空白的落地屏（landing screen），在那里添加你的第一个仓库。

## 更新

Orca 默认自动更新，跟踪**稳定**通道。稳定版经过充分验证；**RC（发布候选）**构建最先携带新功能，常常每天发布。

RC 通道没有永久的应用内开关。在 **Check for Updates** 上配合修饰键点击（入口在 [Settings → General → Updates](/settings)，或应用菜单 / Help 菜单）：

| 修饰键 | 效果 |
| --- | --- |
| **Shift+点击** | 包含最新的 **RC** 预发布版 |
| **Cmd+点击**（macOS）/ **Ctrl+点击**（Windows/Linux） | 最新的 **perf** 标签预发布版 |
| **Option+点击**（仅 macOS） | 选择一个通过 Orca 兼容性检查的**已验证本地 macOS 构建** |

你仍然可以直接从 [GitHub Releases 页面](https://github.com/stablyai/orca/releases)下载任意构建。

> **不喜欢当前的更新？** 历史版本始终可以在 [GitHub Releases 页面](https://github.com/stablyai/orca/releases)找到。如果你回退版本，Orca 不会强制降级你的 worktree 数据。

## 平台说明

### macOS

已签名并公证。首次启动时 macOS 仍可能要求你确认——这对基于 Electron 的应用来说是正常现象。

### Windows

默认 shell 可以在 [Settings → Terminal](/settings) 中设置为 PowerShell 或 CMD。大多数用户会想用 PowerShell。

### Linux

提供 AppImage 和 `.deb` 构建。详见 Releases 页面。
