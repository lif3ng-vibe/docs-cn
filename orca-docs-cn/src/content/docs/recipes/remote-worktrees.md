---
title: "通过 SSH 在远程机器上工作"
description: "通过 SSH 在远程机器上工作——Orca 文档。"
source: "https://www.onorca.dev/docs/recipes/remote-worktrees"
---

把 Orca 指向任意 SSH 目标——更强的开发机、GPU 主机、云沙箱——用起来就像本地 worktree。同样的编辑器、同样的 diff 视图、同样的智能体，只是算力不同。你可以打开远程仓库，*或者*只打开任意文件夹。本地 / SSH / 服务器 / 临时虚拟机等全部运行方式的清单，参见 [Orca 的运行方式](/ways-to-run)。

## 设置

1. 在 [Settings → SSH](/settings) 下添加主机。
2. 测试连接。要使用仓库的话，确认主机上装了 git。
3. 把仓库添加到 Orca，位置选该 SSH 目标——或直接从文件选择器打开任意远程文件夹。

## 运行

1. 创建 worktree。Orca 在远程执行 `git worktree add`。
2. 启动智能体——它运行在远程主机上，而不是你的笔记本上。
3. 就地编辑文件——Orca 把保存流式写入远程文件系统。
4. 照常在笔记本上评审 diff、提交并推送。

## 断线

笔记本睡眠、Wi-Fi 掉线——智能体仍在远程继续运行。Orca 会重连并重新挂接终端。什么都不会丢。
