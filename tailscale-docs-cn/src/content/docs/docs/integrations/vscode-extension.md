---
title: "使用适用于 Visual Studio Code 的 Tailscale 扩展"
description: "使用适用于 VS Code 的 Tailscale 扩展。"
---

最后验证于 Jan 5, 2026

适用于 [Visual Studio Code][xt-vs-code] 的 Tailscale 扩展让你可以直接在 VS Code IDE 中操作 tailnet 里的资源。

## 下载并安装扩展

你可以在 [VS Code Marketplace][xt-visualstudio-tailscale-ext] 中找到该扩展，或[直接在 VS Code 中打开扩展页面][xt-vscode-extension-download]。

## 使用 Machine explorer

你可以在 VS Code 的主侧边栏中操作 tailnet 里的机器。点击 Tailscale 图标，打开 Tailscale Machine explorer，然后选择你想访问的机器。

*（图：VS Code 及其 Tailscale Funnel 与 Machine explorer 面板。）*

> **注意：**
>
> 机器上必须启用 [Tailscale SSH][docs-tailscale-ssh] 才能连接。目前此功能仅适用于 Linux 设备，以及运行[开源 `tailscale` + `tailscaled` CLI][docs-macos-variants] 的 macOS 设备。

### 连接到 tailnet 中的机器

你只需一次点击，即可启动新的终端会话，或把 VS Code 附加到某台机器上进行远程开发。将鼠标悬停在你想连接的机器上，然后选择  图标启动终端会话，或选择  图标将 VS Code 窗口附加到该机器。

#### 解决 SSH 用户名的常见问题

如果你使用 VS Code 的远程连接功能，且远程实例上的用户名与本地用户名不同，则需要在本地 SSH 配置中指定远程用户名，否则可能遇到连接问题。

请按以下步骤配置 SSH 设置：

1. 打开 Tailscale Machine explorer 找到远程实例，右键点击你想连接的节点，然后选择 **Copy DNS name**。
2. 打开本地 SSH 配置文件编辑 SSH 配置。该文件通常位于 `~/.ssh/config`。
3. 在配置文件中为远程服务器插入一个新条目，添加远程用户配置。将 `my-server.example.ts.net` 替换为第一步复制的 DNS 名称，将 `alice` 替换为你的远程用户名。

```
Host my-server.example.ts.net
  User alice
```

在 SSH 设置中配置正确的远程用户名后，你应该就能用 VS Code 成功连接到远程实例。

### 编辑 tailnet 中机器上的文件

要读取并编辑 tailnet 中某台机器上的文件，请展开该机器，然后选择 **File explorer** 项。使用文件资源管理器前，必须在机器上[启用 Tailscale SSH][docs-tailscale-ssh]。

首次打开某台机器的文件资源管理器时，扩展会提示你输入该机器使用的 SSH 用户名。此用户名会在本地缓存，供之后连接该机器时使用。如果之后想更换 SSH 用户名，右键点击该机器，然后从上下文菜单中选择 **Change SSH username**。

你可以在文件资源管理器中右键点击某个目录，选择 **New file** 或 **New directory** 来添加新文件或目录。要重命名或删除现有文件或目录，右键点击对应条目，然后从上下文菜单中选择 **Rename** 或 **Delete**。

> **注意：**
>
> 从文件资源管理器中删除文件或文件夹是永久性操作，无法撤销。

#### 更改根目录

默认情况下，文件资源管理器会打开你所提供用户名的主目录（`~/`）。你可以右键点击该机器，然后从上下文菜单中选择 **Change root directory** 来更改根目录。

## 启动 Tailscale Funnel

你可以在 VS Code 中通过命令面板或 Tailscale 面板配置 [Tailscale Funnel][docs-funnel]。要使用此功能，必须在 tailnet 访问控制策略中[启用 Funnel][docs-funnel-setup]。

借助此 VS Code 扩展，你可以用 Funnel 将本地机器上的一个端口暴露到公共互联网。要暴露多个端口，请使用 [Funnel CLI][docs-funnel-examples]。

> **注意：**
>
> 要使用 Funnel，你必须在管理控制台中[启用 MagicDNS][docs-magicdns-enabling-magicdns] 和 [HTTPS 证书][docs-enabling-https]，并在 tailnet 策略文件中[添加相应的节点属性][docs-funnel-node-attribute-required]（`nodeAttrs`）。

### 使用 Funnel 面板

你的浏览器不支持 video 标签。

1. 打开面板。可以使用键盘快捷键 `CMD` + `J`。
2. 在 **port** 字段中输入你想通过互联网暴露的本地端口。
3. 选择 **Start**，开始通过互联网提供该端口的服务。

你可以在默认浏览器中打开公共 URL，或将其复制到剪贴板。要在此面板中修改现有的 Funnel 配置，请更改端口号，然后选择 **Update** 按钮。

### 通过命令面板使用 Funnel

你的浏览器不支持 video 标签。

1. 使用键盘快捷键 `CMD` + `Shift` + `P` 打开命令面板。
2. 输入 **Tailscale**，浏览扩展的所有命令。
3. 若要启动 Tailscale Funnel，请选择 **Tailscale: Share port publicly using Funnel**。
4. 输入你想通过 Funnel 共享的端口号。

### 端口发现

你的浏览器不支持 video 标签。

当你从 VS Code 启动本地服务器时，Tailscale 会询问你是否想用 Funnel 将该端口通过互联网共享。

## 故障排除

### VS Code 扩展中 Machine explorer 的故障排除

如果 Machine explorer 未按预期工作，我们建议执行以下步骤：

1. 检查你想连接的机器的访问控制策略中是否启用了 Tailscale SSH。目前，此功能仅适用于 Linux 设备和运行[开源 Tailscale + tailscaled CLI][docs-macos-variants] 的 macOS 设备。这意味着 Machine explorer 的部分功能在 Windows 设备、iOS/Android 设备，或运行 App Store 版或独立版（Standalone）macOS 应用的设备上无法使用。
2. 检查你的[访问控制策略][docs-access-control]是否已设置为在本地机器与目标机器之间[允许 Tailscale SSH 访问][docs-tailscale-ssh]。
3. 确保你使用的用户名有效且已存在于目标机器上。如果需要更换用户名，右键点击该机器，然后从上下文菜单中选择 **Change SSH username**。

### VS Code 扩展中 Funnel 的故障排除

如果 Funnel 未按预期工作，我们建议执行以下步骤：

1. 检查 Tailscale 是否已登录且处于活动状态。在 macOS 和 Windows 上，可以点击系统状态栏中的 Tailscale 图标来确认；在 Linux 上，请在 CLI 中运行 `tailscale status`。
   如果你的设备上登录了多个 Tailscale 账户，请确保激活的是正确的账户。
2. 确保你的 tailnet [访问控制][docs-access-control]已[配置为允许你的设备使用 Tailscale Funnel][docs-funnel-setup]。
3. 确保你的 tailnet 中[已启用 MagicDNS 和 HTTPS 证书][docs-enabling-https]。
4. 确保 `tailscale` 在环境路径中可用。可以在 CLI 中运行 `tailscale status` 来检查；如果找不到该命令，可能需要将 Tailscale 可执行文件添加到路径中。或者，你也可以在 VS Code 中通过 `tailscale.path` 设置来指定其路径。

## 配置

* `tailscale.path`：`tailscale` 可执行文件的路径。若未设置，扩展将通过环境路径解析 `tailscale` 可执行文件；若已设置，扩展将使用指定的路径。路径中应包含可执行文件名（例如 `/usr/bin/tailscale`、`C:\Program Files\tailscale\tailscale.exe`）。

[docs-access-control]: /docs/features/access-control

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-funnel-examples]: /docs/reference/examples/funnel

[docs-funnel-node-attribute-required]: /docs/features/tailscale-funnel#node-attribute-required

[docs-funnel-setup]: /docs/features/tailscale-funnel#setup

[docs-funnel]: /docs/features/tailscale-funnel

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-magicdns-enabling-magicdns]: /docs/features/magicdns#启用-magicdns

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[xt-visualstudio-tailscale-ext]: https://marketplace.visualstudio.com/items?itemName=Tailscale.vscode-tailscale

[xt-vs-code]: https://code.visualstudio.com

[xt-vscode-extension-download]: vscode:extension/Tailscale.vscode-tailscale
