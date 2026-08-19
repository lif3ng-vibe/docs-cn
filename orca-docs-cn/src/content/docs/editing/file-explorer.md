---
title: "文件浏览器与外部拖放"
description: "文件浏览器与外部拖放——Orca 文档。"
source: "https://www.onorca.dev/docs/editing/file-explorer"
---

文件浏览器位于每个 worktree 的左侧。它实时追踪磁盘上的文件——创建、重命名、删除和移动都映射为文件系统操作，因此外部变更（比如来自智能体的）会即时出现。目录列表先排目录再排文件，采用**自然（数字感知）名称排序**——`9`、`99`、`100` 而不是字典序的 `100`、`99`。同一排序也适用于 SSH、远程运行时、Source Control 树节点、文件夹选择器和移动端文件树。

## 外部拖放

- 从 Finder/Explorer 把文件拖入文件树即可复制进来。
- 把图片拖入 markdown 编辑器即可插入到光标处。
- 把文件拖到智能体终端上，即可把路径粘贴到提示符处。
- 对 [SSH worktree](/ssh) 同样支持拖放——Orca 会先把文件上传到远程主机再完成放置，智能体看到的就是真实的磁盘路径。

## Git 状态

文件按 git 状态着色——未跟踪、已修改、已暂存、已忽略。右键可执行常规操作：丢弃、暂存、重命名、**Copy Path**（复制路径）和 **Copy Relative Path**（复制相对路径）（默认 `Cmd+Option+Shift+C` / `Ctrl+Alt+Shift+C`；可重映射）。

右键单个文件并选择 **Copy**（复制），把文件本身放进操作系统剪贴板。对 SSH worktree，Orca 会先把远程文件在本地暂存，再把该暂存文件引用写入剪贴板；远程文件夹被排除在外。

## 下载（SSH / 远程）

在桌面应用中，右键远程文件 → **Download**（下载），或右键远程文件夹 → **Download Folder**（下载文件夹，连接支持递归传输时可用）。Orca 会打开系统保存/选择文件夹对话框。Web 客户端不可用。本地 worktree 不显示该操作。

## 在文件夹中查找

右键文件夹并选择 **Find in Folder**（在文件夹中查找），打开搜索且范围已限定为该文件夹。也可以在文件浏览器中选中文件夹后，在 macOS 上按 `Cmd-Shift-F`，在 Windows 和 Linux 上按 `Ctrl-Shift-F`。

## 后续步骤

- [Monaco 编辑器与自动保存](/editing/monaco)——找到匹配后即可编辑文件。
- [Diff 查看器](/review/diff-viewer)——评审智能体或编辑器做出的变更。
