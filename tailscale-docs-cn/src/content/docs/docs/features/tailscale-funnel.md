---
title: "Tailscale Funnel"
description: "使用 Tailscale Funnel 将互联网流量安全地路由到本地服务。"
---

最后验证于 Jan 20, 2026

> **注意：** Tailscale Funnel 目前处于 beta 阶段。

> **注意：** Tailscale Funnel 适用于[所有套餐](https://tailscale.com/pricing)。

Tailscale Funnel 让你可以将来自更广阔互联网的流量路由到你 Tailscale 网络（即 tailnet）中某台设备上运行的本地服务。你可以用它共享本地服务（例如一个 Web 应用），供任何人访问——即使对方并不使用 Tailscale。

> **提示：**
>
> 如果你只想与 tailnet 中的其他设备共享本地服务，请改用 [Tailscale Serve][docs-serve]。另请参阅 [Funnel 与共享的对比][docs-funnel-vs-sharing]。

> **注意：**
>
> 以下相关视频提供了更多背景信息和示例。

[Serve and Funnel | Tailscale Explained (video)](https://www.youtube.com/watch?v=MpxmfpCl20c)

浏览以下主题，了解更多关于 Tailscale Funnel 的信息：

* [开始使用 Funnel][ar-get-started]
* [Funnel 的工作原理][ar-how-funnel-works]
* [`tailscale funnel` 命令][docs-tailscale-funnel]
* [排查 Funnel 问题][ar-troubleshoot-funnel]
* [Funnel 示例][docs-funnel-examples]

## Funnel 的工作原理

Funnel 通过一个唯一的 Funnel URL 将本地资源暴露给互联网。使用 Funnel 共享本地资源时，会创建一条从互联网到你设备上特定资源的加密隧道。Tailscale 使用 TCP 代理和 Funnel 中继服务器来实现这一点。

*（图：Tailscale Funnel 工作原理示意图）*

使用 Funnel 共享本地资源时，它会创建一个可供分享的唯一 Funnel URL。当有人使用你的 Funnel URL 时，他们的设备会向 Funnel 中继服务器发送请求。Funnel 中继服务器收到请求后，会通过 Tailscale 与你的设备建立 TCP 代理。该代理是本地资源与访问指向它的 Funnel URL 的设备之间的一条加密隧道。使用 TCP 代理既保护了共享数据，也让 Tailscale 能够隐藏你本地设备的 IP 地址。Funnel 中继服务器无法解密通过该代理发送的数据。

后续步骤

从创建 Funnel 到访问通过它共享的资源，整个过程包括：

* [创建并共享 Funnel URL][ar-creating-funnel]。
* [将 Funnel URL 解析为 IP 地址][ar-resolving-funnel-url]。
* [建立加密代理][ar-establishing-encrypted-proxy]。
* [通过代理提供共享资源][ar-serving-shared-resource]。

### 创建并共享 Funnel URL

使用 Funnel 共享本地资源时，它会创建一个可供分享的唯一 Funnel URL。生成的 URL 只指向你用 Funnel 共享的那个特定资源。因此，如果你共享一个本地 Web 服务器，Funnel 只共享该特定 Web 服务器；同样，如果你共享一个文件或目录，Funnel 也只共享该特定文件或目录。

### 将 Funnel URL 解析为 IP 地址

当设备尝试访问 Funnel URL 时，它首先联系公共 DNS 服务器，将 URL 解析为 IP 地址。这些 DNS 服务器返回的是 Funnel 中继服务器的 IP 地址，而不是你设备的 IP 地址。这一步向公共互联网隐藏了你设备的位置。将 URL 解析为 IP 地址后，设备会向 Funnel 中继服务器发送请求。

### 建立加密代理

收到请求后，Funnel 中继服务器会通过 Tailscale 创建一条到你设备的 TCP 代理。该代理充当 Funnel 中继服务器与你的设备之间的加密中继，确保你的设备 IP 地址永远不会暴露给互联网。

Funnel 中继服务器不会解密公共设备与你设备之间的流量。这确保了 Tailscale 无法访问或读取任何内容，从而保持端到端的[加密][docs-encryption]与隐私。

你设备上运行的 Tailscale 服务器接收来自 TCP 代理的加密请求，然后终结 [TLS][xt-wiki-tls] 连接，并将解密后的请求传递给你通过 Funnel 暴露的本地服务。本地服务处理请求并生成响应。

### 通过代理提供共享资源

你设备上的本地服务器处理请求后，会将响应发送给你设备上的 Tailscale 服务器。Tailscale 服务器随后加密该响应，并通过已建立的 TCP 代理将其传回 Funnel 中继服务器。

收到加密响应后，Funnel 中继服务器将其转发给用户的设备，而不会解密其内容，从而保持数据的端到端加密。最后，用户的设备结束 TLS 连接，解密响应，并将所请求的信息展示给访问该 Funnel URL 的用户。

## 开始使用 Funnel

Tailscale Funnel 默认处于禁用状态，但你可以使用 [Tailscale CLI][docs-cli] 启用 Funnel 服务并创建 Funnel。

### 要求与限制

Funnel 需要满足以下条件才能工作：

* Tailscale v1.38.3 或更高版本。
* 为你的 tailnet 启用 [MagicDNS][docs-magicdns]。
* 为你的 tailnet 启用 [HTTPS][docs-enabling-https] 并持有有效的 HTTPS 证书。
* tailnet 策略文件中的 funnel [节点属性][docs-node-attribute]。该属性告诉 Tailscale 哪些 tailnet 用户可以使用 Funnel。

此外，Funnel 还有以下限制：

* Funnel 只能使用你 [tailnet 域][docs-tailnet-name]（`tailnet-name.ts.net`）中的 DNS 名称。
* Funnel 只能监听 `443`、`8443` 和 `10000` 端口。
* Funnel 只能通过 [TLS][xt-wiki-tls] 加密连接工作。
* 通过 Funnel 发送的流量受不可配置的带宽限制。
* Funnel 只能在能运行 Tailscale CLI 的平台上工作。
* 要在 macOS 上使用 Funnel，必须使用 [macOS 版 Tailscale 应用的开源变体][docs-macos-variants]之一。
* 同一个端口号不能同时用于 Serve（仅在 tailnet 内可用）和 Funnel（在 tailnet 内和公共互联网均可用）。
  * 如果最近一次配置该端口的命令是 `serve`，则该端口将完全私有。
  * 如果最近一次配置该端口的命令是 `funnel`，则该端口将完全公开。

使用 Tailscale CLI 启用 Funnel 时，Tailscale 会自动创建有效的 HTTPS 证书并更新你的 tailnet 策略文件。默认情况下，它允许 `autogroup:member` [autogroup][docs-policy-syntax-autogroups] 中的所有用户使用 Funnel。你可以手动更新 tailnet 策略文件来调整这一点。

> **警告：**
>
> 如果频繁请求新证书，可能会超出 Let's Encrypt 的速率限制，导致你需要等待 34 个小时才能重试。更多信息请参阅 Let's Encrypt 的[速率限制文档][xt-letsencrypt-rate-limits]。

### 启用 Funnel

使用 [`tailscale funnel`][docs-tailscale-funnel] 命令启用 Funnel。该命令会触发一个网页界面，提示你批准启用 Funnel。批准后，Tailscale 会为你的 tailnet 创建有效的 HTTPS 证书，并向你的 tailnet 策略文件添加 funnel 节点属性。

### 创建 Funnel

要创建 Funnel，请使用 `tailscale funnel` 命令并传入你想共享的目标。你可以共享服务、文件或目录，还可以选择传入任何[可用标志][docs-tailscale-funnel-flags]。

```shell
tailscale funnel 3000
Available on the internet:
https://amelie-workstation.pango-lin.ts.net

|-- / proxy http://127.0.0.1:3000

Press Ctrl+C to exit.
```

使用 Tailscale Funnel 时，Funnel 中继服务器会出现在你设备的 Tailscale 对等节点列表中。使用 [`tailscale status --json`][docs-cli-status] 命令即可显示所有对等节点。

> **警告：**
>
> 使用 Funnel 共享文件和目录仅适用于 macOS 版 Tailscale 客户端的[开源变体][docs-macos-variants]。其他变体存在沙箱限制。
>
> 只有当你从 App Store 安装 macOS 版 Tailscale，或以 Standalone 变体系统扩展的方式安装时，才能使用 Funnel 共享端口。

## 资源

* 浏览 [Funnel 用例示例集][docs-funnel-examples]，获取灵感和思路。
* [使用 PROXY 协议][docs-tailscale-funnel-proxy-protocol]。
* [使用 TCP 转发器][docs-tailscale-funnel-tcp-forwarder]。
* [重置 Funnel 配置][docs-tailscale-funnel-reset-funnel]。
* [禁用 Funnel][docs-tailscale-funnel-disable-funnel]。

## 排查问题

Funnel 出现问题通常与以下原因之一有关：

* [Funnel 节点属性][ar-funnel-node-attribute]
* [HTTPS 证书][ar-https]
* [访问控制][ar-access-controls]
* [DNS 传播][ar-dns]

### Funnel 节点属性

Tailscale Funnel 需要在你的 tailnet 策略文件中有一个值为 `funnel` 的[节点属性][docs-node-attribute]（`nodeAttrs`），以告诉 Tailscale 谁可以使用 Funnel。如果你使用 Tailscale CLI 启用 Funnel，Tailscale 会确保满足此要求。你也可以手动添加 Funnel 的节点属性。你必须具有 tailnet 的 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 身份才能修改 tailnet 策略文件。

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。
2. 展开 Funnel 区域并选择 **Add Funnel to policy**（将 Funnel 添加到策略）。

这会添加默认的 `nodeAttrs` 分区，并自动保存 tailnet 策略文件。

```json
"nodeAttrs": [
  {
    "target": ["autogroup:member"],
    "attr":   ["funnel"],
  },
],
```

\[Missing snippet: visual\_policy\_editor.mdx]

### HTTPS 证书

Tailscale Funnel 需要你的 tailnet 拥有有效的 [HTTPS 证书][docs-enabling-https]，以便为你唯一的 tailnet DNS 名称自动预配 TLS 证书。如果你使用 Tailscale CLI 启用 Funnel，Tailscale 会确保满足此要求。

### 访问控制

如果你 tailnet 策略文件中的 funnel 节点属性不允许你使用 Funnel，你就无法使用。用于启用 Funnel 的默认节点属性默认包含所有 tailnet 成员，但 [Owner、Admin 和 Network admin](/docs/reference/user-roles) 可以修改它以进一步限制访问。

### DNS 传播

公共 DNS 记录最长可能需要 10 分钟才能在你的 tailnet 域名上生效。在公共 DNS 记录更新之前，这段延迟可能导致他人无法使用 Funnel URL。

[ar-access-controls]: #访问控制

[ar-creating-funnel]: #创建并共享-funnel-url

[ar-dns]: #dns-传播

[ar-establishing-encrypted-proxy]: #建立加密代理

[ar-funnel-node-attribute]: #funnel-节点属性

[ar-get-started]: #开始使用-funnel

[ar-how-funnel-works]: #funnel-的工作原理

[ar-https]: #https-证书

[ar-resolving-funnel-url]: #将-funnel-url-解析为-ip-地址

[ar-serving-shared-resource]: #通过代理提供共享资源

[ar-troubleshoot-funnel]: #排查问题

[docs-cli-status]: /docs/reference/tailscale-cli#status

[docs-cli]: /docs/reference/tailscale-cli

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-funnel-examples]: /docs/reference/examples/funnel

[docs-funnel-vs-sharing]: /docs/reference/funnel-vs-sharing

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-magicdns]: /docs/features/magicdns

[docs-node-attribute]: /docs/reference/syntax/policy-file#node-attributes

[docs-policy-syntax-autogroups]: /docs/reference/syntax/policy-file#autogroups

[docs-serve]: /docs/features/tailscale-serve

[docs-tailnet-name]: /docs/concepts/tailnet-name

[docs-tailscale-funnel-disable-funnel]: /docs/reference/tailscale-cli/funnel#turn-tailscale-funnel-off

[docs-tailscale-funnel-flags]: /docs/reference/tailscale-cli/funnel#funnel-command-flags

[docs-tailscale-funnel-proxy-protocol]: /docs/reference/tailscale-cli/funnel#use-the-proxy-protocol

[docs-tailscale-funnel-reset-funnel]: /docs/reference/tailscale-cli/funnel#reset-tailscale-funnel

[docs-tailscale-funnel-tcp-forwarder]: /docs/reference/tailscale-cli/funnel#use-a-tcp-forwarder

[docs-tailscale-funnel]: /docs/reference/tailscale-cli/funnel

[xt-letsencrypt-rate-limits]: https://letsencrypt.org/docs/rate-limits/

[xt-wiki-tls]: https://en.wikipedia.org/wiki/Transport_Layer_Security
