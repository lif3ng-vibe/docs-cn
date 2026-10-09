---
title: "在 tmux 中运行 Pi"
---

Pi 可以在 tmux 内运行，但 tmux 可能把 `Shift+Enter`、`Ctrl+Enter` 和普通 `Enter` 上报成同一个按键。请启用扩展按键，让 Pi 能够区分它们。

## 检查 tmux 版本

```bash
tmux -V
```

tmux 3.5 及更新版本请使用下方推荐的 CSI-u 配置。tmux 3.2 到 3.4 请使用旧版本配置。

## 在 tmux 3.5 及更新版本中启用扩展按键

将以下行加入 `~/.tmux.conf`：

```tmux
set -g extended-keys on
set -g extended-keys-format csi-u
```

当终端不能直接提供 Kitty 键盘协议时，Pi 会请求扩展按键上报。对于在 tmux 中转发修饰键组合，CSI-u 是最可靠的格式。

## 重启 tmux

该配置作用于 tmux 服务器。要确保配置生效，请关闭你的 tmux 会话并启动新的服务器。

如果你选择从命令行停止服务器，请先保存工作。以下命令会终止该服务器管理的所有会话：

```bash
tmux kill-server
tmux
```

## 验证修饰键

在新的 tmux 会话中启动 Pi，并检查：

1. `Shift+Enter` 在编辑器中插入新的一行。
2. `Enter` 提交提示词。
3. 在 macOS 和 Linux 上 `Alt+Enter` 会将追问排入队列。Windows 和 WSL 默认使用 `Ctrl+Q`。

如果这些按键仍然表现得像普通 `Enter`，请确认 tmux 外层的终端能上报修饰键组合。参见[配置你的终端](terminal-setup)。

## 使用 tmux 3.2 至 3.4

这些版本支持扩展按键，但不支持 `extended-keys-format csi-u`。只需添加：

```tmux
set -g extended-keys on
```

Pi 支持这些版本所使用的 xterm `modifyOtherKeys` 格式。重启 tmux 并重复上述验证步骤。

对于更旧的版本，请升级 tmux 或在 tmux 之外使用 Pi，不要依赖修饰键 Enter 快捷键。
