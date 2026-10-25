---
title: "使用 NextDNS"
description: "在 tailnet 中的设备上使用 NextDNS。"
---

最后验证于 Dec 8, 2025

[NextDNS][xt-nextdns] 是一种个性化 DNS 域名服务器，可通过阻止恶意域名、屏蔽广告和跟踪器、以及限制 tailnet 中用户的浏览体验，来提升网络的安全性。Tailscale 仅通过 DNS over HTTPS（DoH）使用 NextDNS。

你可以将 NextDNS 配置为 Tailscale 中的全局域名服务器（global nameserver），并为不同设备设置不同的 NextDNS 配置档案（profile）。

## 哪些信息会共享给 NextDNS？

默认情况下，在 Tailscale 中使用 NextDNS 时，你的设备信息会发送到你的 NextDNS 日志，以便你获得详细的日志和分析。这些信息包括：设备名称、操作系统、Tailscale IP 和 Tailscale 节点 ID。

你可以[禁止共享这些元数据][ar-next-disable-metadata-sharing]。

## 前提条件

> **注意：**
>
> 在 Tailscale 中使用 NextDNS 要求 Tailscale v1.32 或更高版本。

你需要一个 NextDNS 配置档案。如果还没有，请[创建一个 NextDNS 配置档案][xt-nextdns-start]。

## 将 NextDNS 用作全局域名服务器

将 NextDNS 用作全局域名服务器，可以把 tailnet 中所有设备的 DNS 查询路由到 NextDNS。

要将 NextDNS 添加为全局域名服务器：

1. 打开管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。

2. 前往 **Nameservers**（域名服务器），然后从 **Add nameserver**（添加域名服务器）下拉列表中选择 **NextDNS**。

3. 输入你的 NextDNS 配置档案的 IPv6 地址。该地址可在 NextDNS Web 控制台 [setup 标签页][xt-nextdns-setup]的 **Endpoints**（端点）部分找到。

   *（图："Add NextDNS configuration"（添加 NextDNS 配置）对话框。"Endpoint"字段中包含一个 IPv6 地址。）*

4. 选择 **Save**（保存）。该 NextDNS 配置档案将保存为你的配置 ID（profile ID）对应的全局域名服务器。一个 NextDNS IPv6 地址会自动添加该配置档案的全部 IPv6 地址。

5. 选择 **Override DNS servers**（覆盖 DNS 服务器），强制设备使用 NextDNS 作为全局域名服务器，而不是使用每台设备上本地配置的 DNS 服务器。

   *（图：管理控制台的 DNS 页面，含"Global Nameservers"部分。示例 NextDNS 配置档案为"abc123"。）*

> **注意：**
>
> 如果你将 NextDNS 配置为全局域名服务器，就不要再为 tailnet 配置另一个全局域名服务器。这是因为被 NextDNS 拒绝的查询可能由其他域名服务器应答，意外绕过隐私或内容限制。此外，NextDNS 不能用作 split DNS 服务器。

## 为不同设备使用不同的 NextDNS 配置档案

NextDNS 允许你创建多个配置档案（也称为配置），以便以不同方式保护不同的设备。例如，你可以为你的设备创建一个管理员管控配置档案和一个用户管控配置档案。

> **注意：**
>
> 必须将 NextDNS 用作全局域名服务器，才能为不同设备使用不同的配置档案。

要为特定的 Tailscale 设备指定不同于全局配置档案的配置：

1. 将 NextDNS 设置为 tailnet 的全局域名服务器。

2. 在 tailnet 策略文件中添加一个节点属性 `nodeAttrs` 部分。为你希望应用该配置档案的设备设置 `target`。target 可以是标签（tag）、用户、组或 `*`。

3. 将属性 `nextdns:abc123` 设置为使用所需的 NextDNS 配置档案 ID `abc123`。

例如，在你的 tailnet 策略文件中：

```json
{
  "grants": ["..."],
  "nodeAttrs": [
    {
      "target": ["user@example.com", "tag:server"],
      "attr": [
        "nextdns:abc123",
      ],
    },
  ],
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

## 禁止与 NextDNS 共享设备元数据

要阻止与 NextDNS 共享设备元数据，请在你的 tailnet 策略文件中设置属性 `nextdns:no-device-info`：

```json
{
  "grants": ["..."],
  "nodeAttrs": [
    {
      "target": ["*"],
      "attr": [
        "nextdns:no-device-info",
      ],
    },
  ],
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

[ar-next-disable-metadata-sharing]: #禁止与-nextdns-共享设备元数据

[xt-nextdns-setup]: https://my.nextdns.io/setup

[xt-nextdns-start]: https://my.nextdns.io/start

[xt-nextdns]: https://nextdns.io
