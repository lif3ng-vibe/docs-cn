---
title: "Tailscale SSH Console"
description: "Tailscale SSH Console 让你可以在浏览器中建立 [Tailscale SSH][docs-tailscale-ssh] 会话。使用此功能可以从管理控制台创建一条到 tailnet 中节点的基于浏览器的 SSH 会话。"
---

最后验证于 Jan 5, 2026

Tailscale SSH Console 让你可以在浏览器中建立 [Tailscale SSH][docs-tailscale-ssh] 会话。使用此功能可以从管理控制台创建一条到 tailnet 中节点的基于浏览器的 SSH 会话。

> **注意：** Tailscale SSH Console 目前处于 beta 阶段。

Tailscale SSH Console 功能适用于所有套餐。

## 工作原理

借助 [WebAssembly][xt-webassembly]（也称 Wasm），Tailscale SSH Console 在浏览器中运行：包括 Tailscale 客户端代码、WireGuard®、一个用户态网络栈和一个 SSH 客户端。建立会话时，Tailscale 会生成一个带有你身份的[临时][docs-ephemeral-nodes]认证密钥，然后使用该认证密钥为你的浏览器会话创建一个新的临时节点。该临时节点可以作为 Tailscale SSH 的来源，并在浏览器会话终止时被自动移除。

该临时节点的命名格式类似于 `tailscale-ssh-console-hostname-nnnnn`（[更详细的说明][ar-ephemeral-tailscale-ssh-console-node]见下文）。

临时节点获得授权后，用于授权该节点的认证密钥会被撤销。该认证密钥会出现在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面中，并带有 **SSH Console** 徽章。认证密钥的创建和撤销事件会出现在[配置审计日志][docs-audit-logging]中。

使用 Tailscale SSH Console 时，你的浏览器就是 tailnet 中的一个节点。与 Tailscale 中的其他连接一样，Tailscale Console SSH 会话通过 WireGuard 进行端到端加密。SSH 客户端所用节点的 WireGuard 密钥存储在浏览器的内存中，在浏览器会话期间可用。Tailscale 无法访问或读取你的会话流量。注意，流量会经由我们的[加密 TCP 中继（DERP）][docs-derp-servers]转发，但 DERP 服务器无法解密你的流量。

## 前提条件

* 你必须是 tailnet 的 [Owner、Admin、IT admin 或 Network admin](/docs/reference/user-roles) 才能使用 Tailscale SSH Console 功能。
* 你要连接的节点需要已[配置 Tailscale SSH][docs-tailscale-ssh]。
* 需要存在一条 [Tailscale SSH 策略][docs-policy-syntax-ssh]规则，允许在 `22` 端口访问该节点。访问控制策略只能针对你拥有的节点或[带标签][docs-tags]的节点编写。
* 如果你使用[设备态势条件][docs-device-posture-device-posture-conditions]来限制 SSH 访问，需要确保来自 Tailscale SSH Console 的连接被允许。在 SSH 客户端临时节点运行期间，你可以在 **Machine Details**（机器详情）页面查看其[态势属性][docs-device-posture-device-posture-attributes]的值。由于 SSH Console 运行在浏览器中，其 `node:os` 属性的值为 `js`。

## 创建 Tailscale SSH Console 会话

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。

2. 找到你要连接的节点。你可以按机器名称、所有者、是否启用了 Tailscale SSH 等条件搜索节点。更多信息请参阅[在管理控制台中筛选设备][docs-filter-devices]。

3. 选择节点最右侧的菜单，然后选择 **SSH to machine**（SSH 到机器）。也可以将鼠标悬停在该节点上并选择 **SSH**。

   *（图：管理控制台的 Machines 页面，筛选出特定机器。示例节点显示了 SSH 选项。）*

   如果找不到 **SSH** 选项，说明该节点未配置 Tailscale SSH，或者访问控制策略不允许你对该节点使用 Tailscale SSH。

4. 在弹出的新窗口中，选择你要用于连接的本地用户名。如果没有下拉菜单，请在文本框中输入本地用户名。

   *（图：SSH to machine 对话框，包含"Local username"选择菜单、Cancel 按钮和 SSH 按钮。）*

   下拉菜单中列出的本地用户名是根据 [tailnet 策略文件][docs-acls] 的 [SSH][docs-policy-syntax-ssh] 分区中明确列出的用户生成的。实际可用的用户可能比下拉菜单中列出的更多。例如，如果 SSH 策略指定了 `autogroup:nonroot`，那么本地识别的任何非 root 用户都可以使用。在这种情况下，你可以选择 **Other**（其他）作为 **Local username** 的值，并在选择 **Other** 后出现的文本框中输入本地用户名。

5. 选择 **SSH**。

6. 在弹出的身份验证窗口中，按照提示重新进行身份验证。每个新的 Tailscale SSH Console 会话都需要重新验证。

   *（图：重新身份验证窗口。）*

7. 如果重新验证成功，会打开一个标题为 **Tailscale — SSH to *Machine name*** 的新浏览器窗口。此时你已进入 Tailscale SSH Console 会话。

如果你仍在该浏览器会话中 SSH 到另一台设备，浏览器会复用同一个 Tailscale SSH Console 会话。

## 临时 Tailscale SSH Console 节点

创建 Tailscale SSH Console 会话时，Tailscale 会在你的 tailnet 中创建一个新的[临时][docs-ephemeral-nodes]节点。你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面找到它。此节点无需手动授权——因为会话由管理员创建，所以视为已获得授权。该节点归属于创建会话的用户，机器名称的格式为：

  `tailscale-ssh-console-hostname-nnnnn`

其中：

* `hostname` 是用户的"类邮箱"名称，其中不允许的字符被替换为连字符。对大多数用户来说，主机名基于电子邮件地址；例如用户 `alice@example.com` 的 Tailscale SSH Console 主机名是 `alice-example-com`。对于使用 GitHub 登录的用户，主机名格式为 `username-github`。
* `nnnnn` 是随机分配的字符串。

例如，如果用户 `alice@example.com` 创建了 Tailscale SSH Console 会话，临时节点的名称将类似于 `tailscale-ssh-console-alice-example-com-12345abcde`。

该节点还带有 **Ephemeral** 和 **SSH Console** 徽章。**SSH Console** 徽章表示该节点是运行 Tailscale SSH Console 的浏览器。由于它是临时节点，会话终止后不久就会被自动移除。

## 结束 Tailscale SSH Console 会话

结束 Tailscale SSH Console 会话有多种方式。

* 在 **Tailscale — SSH** 浏览器窗口中，你可以通过运行 `exit` 命令或关闭窗口来结束会话。

* 如果你重新加载或结束用于创建 Tailscale SSH Console 会话的浏览器会话，Tailscale SSH Console 也会结束。

* 如果访问控制策略被修改为不再允许该用户访问，Tailscale SSH Console 会话会自动结束。

## Tailscale SSH Console 会话的审计日志

当用户启动 Tailscale SSH Console 会话时，会话的创建会出现在[配置审计日志][docs-audit-logging]中。这包括以下事件：

* 创建认证密钥
* 创建节点并按 `tailscale-ssh-console-hostname-nnnnn` 格式命名
* 使用该认证密钥授权节点
* 撤销认证密钥
* 更新节点的密钥过期时间
* 登录该节点

Tailscale Console SSH 会话终止后，节点的删除会作为事件出现在配置审计日志中。

对于每个被记录的事件，日志条目会显示执行操作的人以及操作发生的时间。

## 局限性

* Tailscale SSH Console 会话必须从 Tailscale 管理控制台发起——你无法创建独立的 SSH 会话。
* 只有 tailnet 的 [Owner、Admin、IT admin 或 Network admin](/docs/reference/user-roles) 用户才能使用 Tailscale SSH Console。
* 所有 Tailscale SSH Console 流量都经由 [DERP 中继服务器][docs-derp-servers]。

[ar-ephemeral-tailscale-ssh-console-node]: #临时-tailscale-ssh-console-节点

[docs-policy-syntax-ssh]: /docs/reference/syntax/policy-file#ssh

[docs-tags]: /docs/features/tags

[docs-acls]: /docs/features/access-control/acls

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-posture-device-posture-attributes]: /docs/features/device-posture/postures-and-attributes

[docs-device-posture-device-posture-conditions]: /docs/features/device-posture/postures-in-access-rules

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-filter-devices]: /docs/features/access-control/device-management/how-to/filter

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[xt-webassembly]: https://webassembly.org
