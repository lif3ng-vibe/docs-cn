---
title: "远程服务器"
description: "让 Orca 在另一台计算机上持续运行，从你的笔记本电脑连接。"
source: "https://www.onorca.dev/docs/remote-servers"
---

远程 Orca 服务器让一台计算机干活、另一台计算机提供 UI。服务器持有项目、worktree、终端、标签页、提供商账号与智能体会话。你的笔记本电脑连接到那个运行中的 Orca 实例。

最简单的方案是两台机器都装 Orca 桌面应用，通过 [Tailscale](https://tailscale.com/) 连接。这条路不需要运行 `orca serve`。

> **Beta** 远程 Orca 服务器处于 beta 阶段。请让服务器与客户端留在你可控的私有网络路径上，例如同一个 Tailscale tailnet 或局域网。

## 什么运行在哪里

```
Client computer · Orca client
 Shows the UI and sends your input
 │
 │ private network route
 ▼
Server computer · Orca server
 Stores repos and worktrees
 Runs terminals and agents
```

在**服务器**上安装并登录 Codex、Claude Code、OpenCode、`git` 及任何提供商 CLI。笔记本电脑上的登录不会自动带到服务器。

在无头的 `orca serve` 主机上，从服务器 shell 注册托管的 Claude/Codex 账号（远程客户端会禁用 **Add account**）：

```
orca account add --agent claude
orca account add --agent codex
orca account list
```

无需 Settings 界面即可安装或刷新智能体技能：

```
orca skills install --skill orca-cli --skill orchestration
orca skills update --all
```

## 推荐：桌面应用 + Tailscale

你需要：

- 两台机器都安装并更新了 Orca
- 两台机器都安装了 Tailscale
- 两台机器登录同一 tailnet
- 服务器保持唤醒、在线并运行 Orca

Tailscale 会给服务器一个通常以 `100.` 开头的私有地址。Orca 会把该地址排在连接地址选择器的最前面。

### 1. 在服务器上创建访问链接

在应当持续承载会话的那台机器上：

1. 打开 Orca 桌面应用。
2. 打开 **Settings → Remote Orca Servers**。
3. 在 **Advertise this app as a server** 下，点击 **New Link**。
4. 在 **Connection address** 中选择 Tailscale 地址，通常形如 `100.x.y.z`。
5. 点击 **Generate Access Link**。
6. 复制 **Pair another Orca client** 下方的链接。

如果列表里没有 Tailscale 地址，确认 Tailscale 已连接，然后点击 **Connection address** 旁边的刷新按钮。

![在服务器上：选择其 Tailscale 地址，生成访问链接，并复制已脱敏的配对 URL。授权之后可以撤销。](/remote-server-share-desktop.png)

在服务器上：选择其 Tailscale 地址，生成访问链接，并复制已脱敏的配对 URL。授权之后可以撤销。

> **保管好访问链接** 配对 URL 授予访问此 Orca 运行时的权限。像对待密码一样对待它，只发给你打算配对的客户端。

### 2. 在笔记本电脑上添加服务器

在你想作为客户端使用的机器上：

1. 打开 **Settings → Remote Orca Servers**。
2. 点击 **Add Server**。
3. 输入一个容易辨认的名称，例如 `Remote Server`。
4. 粘贴来自服务器的访问链接。
5. 点击 **Add Server**。
6. 如果保存的服务器显示 **Disconnected**，点击 **Connect**。

![在客户端上：为服务器命名，粘贴其访问链接并添加。示例中配对码已脱敏。](/remote-server-add-client.png)

在客户端上：为服务器命名，粘贴其访问链接并添加。示例中配对码已脱敏。

添加服务器只是保存它，并不会强制之后所有新项目都用它。仅当你希望由服务器路由的项目、终端、提供商检查以及浏览器/移动端交接默认使用该服务器时，才打开 **Advanced → Active Server**。

## 使用远程服务器

当服务器显示 **Connected** 后，选中它或它的某个项目，照常使用 Orca。终端、智能体进程、文件、worktree 与会话状态都在服务器上。

当多台配对客户端共享该服务器时，侧边栏过滤器可提供 **Hide other-client workspaces**，让本设备只列出自己创建的工作区。见 [Worktree → 侧边栏布局](/model/worktrees#侧边栏布局)。

这意味着：

- 客户端笔记本休眠或断开时，智能体继续运行；
- 服务器需要这些智能体用到的仓库、工具与凭据；
- 服务器必须保持唤醒并连接到 tailnet；
- 客户端重连后回到服务器持有的状态；
- 在服务器上删除的项目会从每台配对客户端的侧边栏消失（不会留下永久的残留行）。

## 访问与安全

Orca 为每台配对客户端创建独立、可撤销的令牌。服务器在 **Shared Server Access** 下列出它们。

- 点击某条授权旁的垃圾桶按钮即可撤销。正在使用该授权的活跃客户端会立即断开。
- 再生成一条链接会替换上一条**未使用**的链接。已配对的客户端保留各自的授权，直到你撤销。
- 在环境允许的范围内，把 Tailscale ACL 或授权收得尽量窄。
- 不要把 Orca 端口直接转发到公网。优先使用 Tailscale、WireGuard、可信局域网、SSH 转发或带认证的隧道。
- 不要为另一台机器选择 `127.0.0.1`。该地址只在服务器本机有效。

## 替代方案：`orca serve`

当主机应在不打开桌面窗口的情况下运行时使用 `orca serve`——例如无头 Linux 服务器或由服务托管的 VM。对于可以保持登录的 MacBook 或台式机，上面的应用内设置更简单。

在服务器上安装 Orca 及其附带 CLI，然后运行：

```
orca serve --pairing-address <server-tailscale-ip-or-hostname>
```

例如：

```
orca serve --pairing-address 100.64.1.20
```

该命令会：

- 在不打开桌面窗口的情况下启动 Orca 运行时；
- 在前台运行，直到按 `Ctrl-C`；
- 打印绑定的端点与一个运行时配对 URL；
- `--pairing-address` 只用于客户端应拨打的地址。

把打印出的配对 URL 粘贴到客户端的 **Settings → Remote Orca Servers → Add Server**。

当防火墙、隧道或服务定义要求固定端口时，加 `--port 6768`：

```
orca serve --port 6768 --pairing-address 100.64.1.20
```

一次只使用一种主机模式。如果 Orca 桌面应用已在该机器上共享，就不要为同一环境再启动第二个 `orca serve` 进程。

### 从无头服务器连接移动端

为 Orca 移动应用申请一个移动范围的二维码与链接：

```
orca serve --pairing-address 100.64.1.20 --mobile-pairing
```

让手机处于同一 tailnet，打开 Orca 移动版，选择 **Pair**，扫描终端里的二维码或粘贴打印出的链接。

## 桌面应用还是 `orca serve`？

| | 服务器上的桌面应用 | `orca serve` |
| --- | --- | --- |
| 最适合 | 旧笔记本、Mac mini 或台式机 | 无头 Linux 主机、VM 或托管服务 |
| 设置方式 | 设置界面与按钮 | 终端命令与服务配置 |
| 服务器窗口 | 打开 | 无 |
| 访问链接 | **New Link → Generate Access Link** | 在终端中打印 |
| 存活时间 | 桌面应用运行期间 | 前台进程或服务运行期间 |

## 远程 Orca 服务器还是 SSH？

当笔记本电脑上的 Orca 应拥有运行时、只用另一台机器跑选定的 worktree 与终端时，使用 [SSH worktree](/ssh)。

当另一台机器应拥有完整的 Orca 运行时、并为桌面、浏览器、移动或自动化客户端保留共享会话时，使用远程 Orca 服务器。

完整对比见[运行方式](/ways-to-run)。

## 故障排查

### Tailscale 地址未出现在列表中

在服务器上确认 Tailscale 已连接，然后点击 **Connection address** 旁的刷新按钮。两台机器必须登录同一 tailnet。Tailscale IPv4 地址通常以 `100.` 开头。

### 服务器显示已断开

确认服务器保持唤醒、Orca 仍在运行，且 Tailscale 显示两台设备都在线。若一台无法连另一台，检查 tailnet ACL 或授权。

如果服务器条目报告协议版本不兼容，请更新两台机器上的 Orca。

### 访问链接给错了人

在服务器上打开 **Settings → Remote Orca Servers → Shared Server Access**，撤销那条授权，然后为正确的客户端生成新链接。

### 服务器找不到某个智能体 CLI

在服务器上安装并登录该 CLI。远程会话使用服务器的 `PATH`、主目录与凭据——而不是客户端的。

### `orca serve` 公告了错误的地址

停掉命令，换成客户端可达的地址重启：

```
orca serve --pairing-address <reachable-tailscale-ip-or-hostname>
```

不要为远程客户端使用通配地址或 `127.0.0.1`。

## 后续步骤

- 在[运行方式](/ways-to-run)中比较所有运行模式。
- 当笔记本电脑应拥有 Orca 运行时时，使用 [SSH worktree](/ssh)。
- `orca serve` 标志与自动化命令见 [CLI 参考](/cli/reference)。
