---
title: "快速用户切换"
description: "快速用户切换让你在同一台设备上已登录的两个或更多账户之间快速切换，无需重新进行身份验证。"
---

最后验证于 Dec 4, 2025

快速用户切换（fast user switching）让你可以在同一台设备上已登录的两个或更多账户之间快速切换，而无需重新进行身份验证。

> **注意：** 快速用户切换适用于[所有套餐](https://tailscale.com/pricing)。

## 工作原理

Tailscale 客户端设备同一时间只允许一个活跃账户登录。
借助快速用户切换，客户端设备上的用户可以快速切换到另一个 [tailnet][docs-tailnet] 上的账户。

除非出现以下情况之一，否则无需重新进行身份验证：

* 要切换到的账户从未在该设备上使用过。
* 该设备在要切换到的 tailnet 中的[节点密钥][bl-tailscale-key-management-node-keys]已过期。

一台设备无法同时在多个 tailnet 上传输数据包。
在 tailnet 之间使用快速用户切换时，一个 tailnet 不知道另一个 tailnet 的存在，也不知道客户端设备是否同时在另一个 tailnet 中。

请注意，Tailscale 客户端的活跃账户与用于登录 Tailscale [管理控制台](https://console.tailscale.com/admin)的账户相互独立。一台设备上只能有一个活跃账户登录 Tailscale 客户端，但如果你打开了多个浏览器，就可以同时用不同账户登录管理控制台。

### 向设备添加账户

你可以通过客户端应用（适用于 macOS、iOS 和 Windows）或 [Tailscale CLI][docs-cli]（适用于 Linux、macOS 和 Windows）添加账户。

#### 使用客户端应用添加账户

#### macOS

如果你运行的是 Tailscale v1.60.0 或更高版本：

1. 在菜单栏中选择 Tailscale 图标。
2. 选择 **设置**（Settings）。
3. 选择 **账户**（Accounts）。
4. 选择 **添加账户**（Add Account）。
5. 在打开的浏览器窗口中用目标账户登录，以完成身份验证流程。

如果你运行的是 v1.60.0 之前的 Tailscale 版本：

1. 在菜单栏中选择 Tailscale 图标。
2. 选择当前已登录的账户。
3. 选择 **添加其他账户**（Add another account）。
4. 在打开的浏览器窗口中用目标账户登录，以完成身份验证流程。

#### iOS

1. 点按屏幕右上角的个人头像，打开 **设置**（Settings）板块。
2. 点按屏幕顶部的账户信息，展开用户切换器。
3. 点按 **添加其他账户**（Add another account）。
4. 在打开的浏览器窗口中用目标账户登录，以完成身份验证流程。

#### Windows

1. 右键单击 Windows 系统托盘中的 Tailscale 图标。
2. 悬停或选择当前登录的账户；如果没有活跃账户，则选择 **账户**（Accounts）菜单。
3. 选择 **添加其他账户**（Add another account）。
4. 在打开的浏览器窗口中用目标账户登录，以完成身份验证流程。

#### Android

1. 点按右上角的图标。
2. 点按当前已登录的账户。
3. 点按 **添加其他账户**（Add another account）。
4. 在打开的浏览器窗口中用目标账户登录，以完成身份验证流程。

#### 使用 CLI 添加账户

1. 运行 [`tailscale login`][docs-cli-login] 命令：

   ```shell
   tailscale login
   ```

2. 使用打开的 URL 指定你要使用的账户，并完成身份验证流程。

### 在账户之间切换

你可以通过客户端应用（适用于 macOS、iOS 和 Windows）或 [Tailscale CLI][docs-cli]（适用于 Linux、macOS 和 Windows）在账户之间切换。

此步骤假设你已经向客户端设备[添加了其他账户][ar-add-account-to-device]。

#### 使用客户端应用在账户之间切换

#### macOS

1. 在菜单栏中选择 Tailscale 图标。
2. 选择当前已登录的账户。
3. 选择你要切换到的账户。

除非该设备在要切换到的 tailnet 中的[节点密钥][bl-tailscale-key-management-node-keys]已过期，否则不会要求你重新进行身份验证。

#### iOS

1. 点按屏幕右上角的个人头像，打开 **设置**（Settings）板块。
2. 点按屏幕顶部的账户信息，展开用户切换器。
3. 点按你要切换到的账户。

除非该设备在要切换到的 tailnet 中的[节点密钥][bl-tailscale-key-management-node-keys]已过期，否则不会要求你重新进行身份验证。

#### Windows

1. 右键单击 Windows 系统托盘中的 Tailscale 图标。
2. 选择当前已登录的账户。
3. 选择你要切换到的账户。

除非该设备在要切换到的 tailnet 中的[节点密钥][bl-tailscale-key-management-node-keys]已过期，否则不会要求你重新进行身份验证。

#### Android

1. 点按右上角的图标。
2. 点按当前已登录的账户。
3. 点按你要切换到的账户。

除非该设备在要切换到的 tailnet 中的[节点密钥][bl-tailscale-key-management-node-keys]已过期，否则不会要求你重新进行身份验证。

#### 使用 CLI 在账户之间切换

使用 [`tailscale switch`][docs-cli-switch] 命令在账户之间切换。

```shell
tailscale switch alice@example.com
```

除非该设备在要切换到的 tailnet 中的[节点密钥][bl-tailscale-key-management-node-keys]已过期，否则不会要求你重新进行身份验证。

如果你之前为账户[设置过昵称][ar-setting-a-nickname]，切换账户时请使用该昵称。

```shell
tailscale switch work
```

### 查看所有账户

你可以通过客户端应用或 [Tailscale CLI][docs-cli] 查看已在该设备上完成身份验证的账户。

#### 使用客户端应用查看账户

#### macOS

1. 在菜单栏中选择 Tailscale 图标。
2. 选择当前已登录的账户。

随后会显示账户列表，带勾选标记的即为当前登录的账户。

#### iOS

1. 点按屏幕右上角的个人头像，打开 **设置**（Settings）板块。
2. 点按屏幕顶部的账户信息，展开用户切换器。

随后会显示账户列表，带勾选标记的即为当前登录的账户。

#### Windows

1. 右键单击 Windows 系统托盘中的 Tailscale 图标。
2. 选择当前已登录的账户。

随后会显示账户列表，带 **(current)**（当前）字样的即为当前登录的账户。

#### Android

1. 点按右上角的图标。
2. 点按当前已登录的账户。

随后会显示账户列表，带勾选标记的即为当前登录的账户。

#### 使用 CLI 查看账户

运行带 `--list` 标志的 [`tailscale switch`][docs-cli-switch] 命令：

```shell
tailscale switch --list
```

随后会显示账户列表，带星号的即为当前登录的账户。

```shell
alice@example.com
alice@gmail.com *
```

如果你为账户[设置过昵称][ar-setting-a-nickname]，`tailscale switch --list` 命令会显示昵称：

```shell
alice@example.com
work *
```

### 设置昵称

使用 [`tailscale set`][docs-cli-set] 命令为当前活跃账户设置昵称。

在本例中，假设设置昵称之前 `tailscale switch --list` 显示活跃账户为 `alice@example.com`。

```shell
tailscale switch --list
```

输出为：

```shell
alice@example.com *
alice@gmail.com
```

将活跃账户的昵称设置为 `work`：

```shell
tailscale set --nickname=work
```

再次运行 `tailscale switch --list`，可以看到输出中出现了昵称 `work`（取代了 `alice@example.com`）：

```shell
alice@gmail.com
work *
```

### 登出账户

你可以通过客户端应用或 [Tailscale CLI][docs-cli] 登出账户。

#### 使用客户端应用登出

#### macOS

如果你运行的是 Tailscale v1.60.0 或更高版本：

1. 在菜单栏中选择 Tailscale 图标。
2. 选择 **设置**（Settings）。
3. 选择 **账户**（Accounts）。
4. 选择 **登出**（Log Out）。

如果你运行的是 v1.60.0 之前的 Tailscale 版本：

1. 在菜单栏中选择 Tailscale 图标。
2. 选择当前已登录的账户。
3. 选择 **登出**（Log out）。

#### iOS

1. 点按屏幕右上角的个人头像，打开 **设置**（Settings）板块。
2. 点按屏幕顶部的账户信息，展开用户切换器。
3. 点按 **登出**（Log out）。

#### Windows

1. 右键单击 Windows 系统托盘中的 Tailscale 图标。
2. 选择当前已登录的账户。
3. 选择 **登出**（Log out）。

#### Android

1. 点按右上角的图标。
2. 点按当前已登录的账户。
3. 点按 **登出**（Log out）。

#### 使用 CLI 登出

运行 [`tailscale logout`][docs-cli-logout] 命令登出当前活跃账户：

```shell
tailscale logout
```

### 局限性

* 你仍可以在同一 tailnet 内的账户之间切换（系统不会阻止）。如果你不想在同一 tailnet 内切换账户，请对设备重新进行身份验证，而不是在账户之间切换。

[ar-add-account-to-device]: #向设备添加账户

[ar-setting-a-nickname]: #设置昵称

[bl-tailscale-key-management-node-keys]: https://tailscale.com/blog/tailscale-key-management#node-keys

[docs-cli-login]: /docs/reference/tailscale-cli#login

[docs-cli-logout]: /docs/reference/tailscale-cli#logout

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-cli-switch]: /docs/reference/tailscale-cli#switch

[docs-cli]: /docs/reference/tailscale-cli

[docs-tailnet]: /docs/concepts/tailnet
