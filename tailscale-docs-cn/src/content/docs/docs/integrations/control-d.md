---
title: "使用 Control D"
description: "将 Control D 与 tailnet 中的设备配合使用。"
---

最后验证于 Dec 8, 2025

[Control D][xt-control-d] 是一项可自定义的任播（anycast）[DNS][docs-dns] 服务，可拦截恶意威胁、不良内容、跟踪器与广告。Tailscale 通过 [DNS over HTTPS][xt-wiki-dns-over-https]（DoH）使用 Control D。你可以将 Control D 配置为[全局名称服务器][docs-dns-global-nameservers]，从而在整个 tailnet 中使用 Control D。你不能将 Control D 用作拆分 DNS（split DNS）服务器（也称[受限名称服务器][docs-dns-restricted-nameservers]）。

> **注意：**
>
> 目前，Tailscale 只与 Control D 共享设备主机名。

## 前提条件

将 Control D 与 Tailscale 一起使用需要：

* Tailscale v1.70.0 或更高版本
* 一个 [Control D 端点][xt-control-d-endpoint]。

> **注意：**
>
> 还没有 Control D 账户？可以直接从 Tailscale [购买 Control D][co-contact-sales]。

## 将 Control D 用作全局名称服务器

将 Control D 用作全局名称服务器，可将 tailnet 中所有设备的 DNS 查询路由到 Control D。

> **注意：**
>
> 如果你将 Control D 配置为全局名称服务器，请避免再为 tailnet 配置另一个全局名称服务器，否则可能会绕过 Control D 强制执行的隐私与内容限制。

要将 Control D 添加为全局名称服务器：

1. 打开管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面。
2. 进入 **Nameservers**，然后选择 **Add nameserver** > **Control D**。
3. 输入你的 Control D 端点的 [resolver ID][xt-control-d-resolver-id]。
4. 选择 **Save**，将该 Control D 端点保存为 tailnet 的全局名称服务器。
5. 选择 **Override DNS servers**，强制设备使用 Control D 作为全局名称服务器，而不是本地配置的 DNS 设置。

## 为不同设备使用不同的 Control D 配置档

Control D 允许你创建多个配置档（profile，也称 profile ID），以控制不同类型设备的访问。例如，你可以为设备分别创建管理员 Control D 配置档和用户 Control D 配置档。

> **注意：**
>
> 必须将 Control D 用作全局名称服务器，才能为不同设备使用不同的配置档。

要为特定 Tailscale 设备指定不同于全局配置档的配置档：

1. 将 Control D 设置为 tailnet 的全局名称服务器。
2. 在你的 [tailnet 策略文件][docs-tailnet-policy-file]中添加 `nodeAttrs` 部分，并为适用该 Control D 配置档的设备设置 `target`。你可以使用标签、用户、组或 `*`。
3. 添加包含 `controld:<resolver-uid>` 的 `attr` 部分，其中 `<resolver-uid>` 是你的 Control D 端点的唯一 resolver ID。

例如，在你的 tailnet 策略文件中：

```json
{
  "grants": ["..."],
  "nodeAttrs": [
    {
      "target": ["user@example.com", "tag:server"],
      "attr": [
        "controld:<resolver-uid>",
      ],
    },
  ],
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

## 带标签设备的优先级

由于 `nodeAttrs` 是可叠加的，且可作用于多台设备，你可以使用优先级值来控制哪个 Control D 配置档优先生效。例如，一个 tailnet 节点可能同时匹配多个配置档：一个针对 `tag:server`，另一个同时针对 `tag:server` 与 `tag:secure-server`。

如果 `tag:server` 配置档包含一个 Control D 覆盖设置，但你希望为 `tag:secure-server` 使用更具体的覆盖设置，可以为该配置档分配更高的优先级。为此，请在 `attr` 条目后添加优先级后缀 `?priority=1`、`?priority=2`（依此类推）。优先级数字越大，优先级越高。

例如，对于以下 `attr` 条目：

```json
{
  "nodeAttrs": [
    {
      "target": ["tag:server"],
      "attr": [
        "controld:<resolver-uid-1>?priority=1",
      ],
    },
    {
      "target": ["tag:secure-server"],
      "attr": [
        "controld:<resolver-uid-2>?priority=2",
      ],
    },
  ],
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

在上面的示例中，只带有 `tag:server` 的设备会匹配优先级较低的 `<resolver-uid-1>` 配置档。同时带有 `tag:server` 与 `tag:secure-server` 的设备会同时匹配两个配置档，但 Tailscale 会因优先级更高而优先采用 `<resolver-uid-2>`。

Tailscale 在将数据发送给 Control D 之前会去掉优先级后缀。

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-dns-global-nameservers]: /docs/reference/dns-in-tailscale#global-nameservers

[docs-dns-restricted-nameservers]: /docs/reference/dns-in-tailscale#restricted-nameservers

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-control-d]: https://controld.com/

[xt-control-d-endpoint]: https://docs.controld.com/docs/devices

[xt-control-d-resolver-id]: https://docs.controld.com/docs/devices#setting-up

[xt-wiki-dns-over-https]: https://en.wikipedia.org/wiki/DNS_over_HTTPS

[co-contact-sales]: https://tailscale.com/contact/sales
