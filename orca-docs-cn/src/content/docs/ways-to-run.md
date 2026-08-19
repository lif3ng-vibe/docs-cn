---
title: "Orca 的运行方式"
description: "本地桌面、SSH 主机、自托管 Orca 服务器和按需的每工作区 VM——为每个任务选对算力。"
source: "https://www.onorca.dev/docs/ways-to-run"
---

Orca 并不锁定在你的笔记本上。每个 worktree 总要运行在某处——你面前的机器上、你已有的一台主机上、一台常开的共享服务器上，或专为那个工作区临时拉起的云 VM 上。

本页是全景地图。深入内容见各链接页面。

## 一览

| 模式 | 文件与智能体所在 | 机器归谁所有 | 最适合 |
| --- | --- | --- | --- |
| **本地** | 你的桌面 | 你 | 日常编码、快速迭代 |
| **SSH 主机** | 你通过 SSH 连接的远程主机 | 你（或你的团队） | 开发机、GPU 主机、常开 VPS |
| **远程 Orca 服务器** | 运行 Orca 桌面版或 `orca serve` 的机器 | 你（或你的团队） | 持久共享运行时、移动端、自动化 |
| **云 VM / 每工作区环境** | 每个工作区一个用后即弃的 VM/沙箱 | 你的云账号（自带提供商） | 隔离的临时智能体算力 |

Orca **不**销售托管 VPS。远程模式使用的机器和云账号始终归你掌控。

## 1. 本地桌面

安装 Orca，打开项目，创建 worktree。智能体、终端和浏览器与 UI 运行在同一台机器上。

![Local Mac 上的侧边栏 worktree——每张卡片是一个 worktree，带有自己的智能体和分支。](/ways-to-run-local-sidebar.png)

Local Mac 上的侧边栏 worktree——每张卡片是一个 worktree，带有自己的智能体和分支。

对大多数人来说这是默认路径。参见[你的第一个三智能体会话](/first-session)和 [Worktree](/model/worktrees)。

## 2. SSH 主机

把 Orca 指向任意 SSH 主机——一台更强悍的 Mac mini、一台 Linux VPS、一台 GPU 主机、一个支持 SSH 的云沙箱。创建 worktree 时，在 **Run on** 下选择那台主机。智能体和 `git worktree` 在远程运行；编辑器、diff 和 UI 留在你的笔记本上。

![Create worktree → Run on——选择 Local 或一个已配置的远程主机（此处：通过 SSH 连接的 openclaw）。](/ways-to-run-run-on.png)

Create worktree → Run on——选择 Local 或一个已配置的远程主机（此处：通过 SSH 连接的 openclaw）。

**适合场景：** 远程机器上已经有你的仓库、工具和凭据，而你想用笔记本上的一个 Orca 驱动多台主机。

**配置概要：**

1. 在 [Settings → SSH](/settings) 中添加主机。
2. 测试连接（主机上必须装有 git 才能做仓库 worktree）。
3. 创建一个 worktree 并在 **Run on** 下选择该 SSH 主机。预输入列表会列出就绪的主机；对已连接但尚未为此项目完成设置的主机，则以不可选的 **setup-needed** 行显示。

SSH worktree 可以在 VS Code Remote-SSH 中打开，在 SFTP 允许时可下载远程文件夹，即使远程无法编译终端原生模块，文件/git 功能依然可用（要使用 shell 请安装构建工具）。详情见 [SSH worktree](/ssh) 和实用方案[通过 SSH 在远程机器上工作](/recipes/remote-worktrees)。

## 3. 远程 Orca 服务器

让 Orca 在一台你掌控的机器上持续运行——旧笔记本、Mac mini、家庭服务器、云 VPS 或团队主机。把你的笔记本、浏览器客户端或手机与该运行时配对。**服务器**拥有项目、worktree、终端和智能体进程；客户端只是 UI。

**适合场景：**

- 你希望笔记本合盖睡眠后智能体继续运行
- 移动端应能重连到同一批会话
- 自动化或后端需要在一台稳定的主机上启动会话

**最简配置：** 在两台电脑上都安装 Orca 和 Tailscale。在服务器上打开 **Settings → Remote Orca Servers → Advertise this app as a server → New Link**，选择其 Tailscale 地址并生成访问链接。在客户端上选择 **Add Server** 并粘贴该链接。

对于无头 Linux 服务器或由服务管理的 VM，可改用 `orca serve`：

```
orca serve --pairing-address <reachable-tailscale-ip-or-hostname>
```

完整细节见[远程 Orca 服务器](/remote-servers)。

### SSH 与远程 Orca 服务器对比

| | SSH worktree | 远程 Orca 服务器 |
| --- | --- | --- |
| 运行时所有者 | 笔记本上的 Orca | 远程机器（Orca 桌面版或 `orca serve`） |
| 断开连接 | 智能体继续在主机上运行；笔记本重新接入 | 完整会话状态保存在服务器上 |
| 多客户端 | 一台笔记本驱动该主机 | 笔记本、网页、移动端和自动化可共享同一运行时 |
| 典型配置 | 导入 SSH 配置，选择 **Run on** | 分享服务器应用或运行 `orca serve`，然后通过 URL 配对 |

## 4. 云 VM（每工作区环境）

每个 worktree 都可以启动自己的按需环境——云沙箱、VM 或本地 Docker 容器——由检入仓库的**配方（recipe）**定义（`orca.yaml` + 生命周期脚本）。创建即拉起；挂起/恢复/销毁即拆除。Orca 只是一层薄封装：你的提供商账号、镜像和账单都归你自己。

在产品 UI 中，这个能力在 [Settings → Experimental](/settings) 下标记为 **Cloud VM**。配方创建的仍然是每工作区环境。

目前大家接入的提供商包括 Vercel Sandbox、Fly、Modal、普通 SSH 主机和本地 Docker。连接方式为 **Orca server**（配方启动 `orca serve` 并返回配对 URL）或 **SSH**（配方返回连接详情，由 Orca 去拨号）。

![Settings → Experimental → Cloud VM——启用该技能，然后让智能体为仓库配置一个配方。](/ways-to-run-per-workspace-env.png)

Settings → Experimental → Cloud VM——启用该技能，然后让智能体为仓库配置一个配方。

**适合场景：** 你想为每个任务获得干净的隔离、用后即弃的算力，或让每个智能体启动时都进入同一套标准环境。

**配置概要：**

1. 在 [Settings → Experimental](/settings) 下启用 **Cloud VM**。该窗格包含一份简短的 **Create a Cloud VM** 指南和配方/运行时控制。

2. 如有需要，安装/更新 Cloud VM / 每工作区环境技能。

3. 在任意工作区中，对你的智能体说：

```
Use the orca-per-workspace-env skill to set up a per-workspace environment for this repo.
```

4. 该技能会引导你走完前置条件 → 基础快照 → 智能体认证 → `orca.yaml` 配方 → doctor 校验。

5. 当 **Recipes** 下出现配方后，创建一个 worktree 并在 **Run on** 下选择它。

只有当 `orca.yaml` 的 `environmentRecipes` 条目位于项目的**主**检出上时（而不仅在某个功能分支上），配方才会出现在工作区创建入口中。在你迭代脚本期间，doctor 和实时开通仍可在任意分支上运行。

> **自带云——不是 Orca VPS** Cloud VM 给你的不是一台 Orca 托管的 VPS。提供商由你自己带来（并向其付费）。Orca 只负责运行你的创建/挂起/恢复/销毁脚本，并通过它们输出的配对 URL 或 SSH 详情来连接。

## 如何选择

- 笔记本够快、智能体任务短暂，就**留在本地**。
- 已有 VPS 或开发机、想让智能体在那边跑且不想装第二个 Orca 运行时，选 **SSH**。
- 想要一个常开的 Orca 运行时供移动端、浏览器和自动化使用，选**远程 Orca 服务器**。
- 希望每个任务都得到一个随 worktree 消亡的、由配方定义的全新沙箱，选**云 VM / 每工作区环境**。

你可以在一个安装中混用多种模式：快速改动用本地 worktree，GPU 主机走 SSH，类 CI 的隔离用配方。

## 相关页面

- [SSH worktree](/ssh)
- [远程 Orca 服务器](/remote-servers)
- [Worktree](/model/worktrees)
- [移动端](/mobile)
- [设置参考](/settings)
