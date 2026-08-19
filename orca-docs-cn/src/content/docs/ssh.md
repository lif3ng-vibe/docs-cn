---
title: "SSH"
description: "SSH worktree——通过 SSH 在远程机器上运行智能体，编辑器与 Diff 留在本地。"
source: "https://www.onorca.dev/docs/ssh"
---

$undefined

Orca 可以通过 SSH 在远程机器上驱动智能体——适合长时间构建、GPU 主机，或任何不适合在你的笔记本上跑工作的环境。

> **四种运行模式之一** SSH 是把智能体放到远程算力上的一种方式。本地、自托管服务器与临时 VM 见[运行方式](/ways-to-run)。

SSH 远程工作区——智能体在远程主机上运行，编辑器与 Diff 留在本地

## 添加 SSH 目标

1. 打开 [Settings → SSH](/settings)。
2. 点击 **Add Target**。主机表单在模态框中打开（而不是列表下方的内联表单），因此即使主机列表很长，Host、Advanced 与 Save 也始终可达。编辑使用同一对话框，并显示目标标签及 `user@host:port`。
3. 填写主机、用户、端口与可选的身份文件——或在同一对话框中打开 **OpenSSH config** 选择器，搜索 `~/.ssh/config`（包括 `~/.ssh/config.d` 下的文件），选中一个主机并预填表单。已保存在 Orca 中的主机在条目上显示已保存徽标。该流程可用时，你仍可从配置批量导入主机。
4. 如果密钥有口令（passphrase）保护，Orca 会在首次使用时提示。
5. 点击 **Test** 验证连通性，然后 **Save**。

有未保存内容的添加/编辑表单会忽略外部点击，误点到别处不会丢失已填字段；用 Escape、Cancel 或 × 放弃。

## 使用目标

创建 worktree 时，选择 SSH 目标而不是本地（Local）。Orca 会：

- 在远程主机上创建 git worktree。
- 通过 SSH 连接远程运行智能体。
- 同步文件事件，让编辑器、Diff 与浏览器用起来仍像本地。

## 高级连接选项

当主机需要代理、跳板机或 SSH 多路复用覆盖时，打开 **Settings → SSH**，编辑目标并展开 **Advanced Connection**。Orca 默认启用 **Reuse SSH connection for faster setup**，它在 macOS 与 Linux 上使用 OpenSSH 连接复用，使各条 setup 命令不必各自付出一次全新的 SSH 握手。仅对 SSH 策略拒绝多路复用会话的主机关闭它。

## 口令

口令只在 Orca 会话的存活期内保存在内存中。关闭 Orca 即清除。可在 SSH 设置中选择更长的 TTL。

## 状态

远程 worktree 显示一个带实时 SSH 状态的角标——绿色已连接、黄色重连中、红色已断开。当 SSH 主机仍在连接中时，Orca 可以用**持久化的本地元数据**列出工作区，让侧边栏在实时数据源就绪前不至于空白；连接稳定后，这些行会刷新为远程的权威状态。断开不会杀死运行中的智能体；Orca 会重连并重新附着。当主机掉线时，受影响的工作区卡片可显示内联的 **Connect** / 重连控件，无需打开终端覆盖层或翻找状态栏即可恢复。如果 SSH relay 以"Multiplexer disposed"之类的故障掉线，Orca 会自动恢复，而不是让窗格卡住直到你重启。智能体状态（工作中 / 空闲 / 阻塞）经 SSH 传播的方式与本地相同，因此侧边栏和[智能体动态流](/activity)会实时反映远程智能体。

## 应用关闭后的会话

关闭桌面应用不再会杀掉远程 PTY 会话。远程终端会话通过运行在远程主机上的 relay 租借，因此你笔记本上的 Orca 关闭后它们仍存活。重新打开应用并重连目标后，租借的 PTY 会以**已附着**状态恢复到各自标签页，回滚缓冲完好。短暂的宽限期（默认 5 分钟，可按目标配置）给 relay 留出时间挺过快速重连，再拆除脱离的会话。

## 下载远程文件与文件夹

在 SSH worktree 文件浏览器中右键：

- **File** → **Download**——原生保存对话框；把文件复制到你的笔记本。
- **Folder** → **Download Folder**——递归下载到你选择的文件夹（仅桌面端）。

Orca 使用与连接相同的 SSH 传输通道。只有当连接声明支持递归文件夹传输（通常是完整 SFTP）时才会出现文件夹下载。仅使用系统 OpenSSH 传输的连接仍可下载**文件**，但不会显示 **Download Folder**。

这是仅桌面端的操作——Web 客户端不提供下载，因为它依赖 Electron 的保存对话框。

## 在 VS Code 中打开远程工作区

对 SSH worktree，当你配置的应用是 VS Code 或 VS Code Insiders（`code` / `code-insiders`，或指向这些启动器的直接路径）时，worktree 菜单的 **Open in** 列表可以把远程路径交给 VS Code Remote-SSH。

1. 配置 **Settings → General → Open in menu**，让 VS Code 出现在列表中（预设或自定义命令）。
2. 右键 SSH worktree（或用 worktree 溢出菜单）→ **Open in** → **VS Code**。
3. Orca 会以 Remote-SSH 方式对该主机与 worktree 路径启动 VS Code（`--remote ssh-remote+<host> <path>`）。菜单项可能显示 **Remote SSH** 徽标。

**此远程路径不支持：**Cursor、Zed、复合 shell 命令，或经由**远程 Orca 服务器**的活动运行时打开（这些仅限**本地**）。Finder/Explorer 项只用于本地路径。

## Kerberos / GSSAPI

如果 OpenSSH 配置中的某台主机设置了 `GSSAPIAuthentication yes`，Orca 会为该目标优先使用**系统 OpenSSH** 传输（内置的 ssh2 客户端不支持 GSSAPI）。连接前保持有效的 Kerberos 票据（`kinit` / 你组织的 SSO）。手动添加的目标在配置为系统 SSH 时也可以启用 GSSAPI。

对从配置导入的主机，不需要单独打开"Kerberos 模式"开关——导入过程/`ssh -G` 会带过该标志。

## FIDO2 / 安全密钥

由硬件保护的 OpenSSH 身份（`ed25519-sk`、`ecdsa-sk`，包括由 agent 支持的安全密钥）同样使用**系统 OpenSSH**而非内置 ssh2 客户端。Orca 从身份文件检测密钥类型，并把连接交给操作系统的 OpenSSH 二进制，使触摸 / PIN 提示照常工作。普通 Ed25519、ECDSA 与 RSA 密钥继续走内置传输。如果机器上没有 OpenSSH，这些 FIDO2 目标在它安装并进入 `PATH`（或位于 Windows/macOS/Linux 的常规位置）之前无法认证。

## 没有 C/C++ 工具链的 Linux 主机

首次连接时，Orca 会在远程安装一个小型 relay。远程终端需要原生 `node-pty` 模块。Linux 包通常在主机上编译；macOS/Windows 的 relay 使用预编译产物。

如果远程缺少 **make**、**C++ 编译器**与 **python3**，Orca 仍能完成**文件、git 与编辑器**的连接，但在安装构建工具之前**远程终端无法工作**。Orca 可能给出的安装提示示例：

- Debian/Ubuntu：`sudo apt-get install -y build-essential python3`
- Fedora/RHEL：`sudo dnf install -y make gcc gcc-c++ python3`
- Alpine：`sudo apk add build-base python3`
- Arch：`sudo pacman -S --needed base-devel python`

安装这些工具后重连，让 relay 得以安装原生模块。

## 端口转发

对远程 worktree，右侧栏显示 **Ports** 标签页（用 `Cmd+Shift+I` 切换）。Orca 扫描远程的 `/proc/net/tcp`，把监听端口列在 **Detected** 下——点一下即可转发到你的笔记本。也可以手动添加、编辑或删除转发。转发在应用重启与 SSH 重连后保留，远程特权端口会自动在本地重映射（例如远程 80 → 本地 10080）。
