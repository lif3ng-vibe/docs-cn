---
title: "hello.ts.net 是什么？"
description: "[`hello.ts.net`][xt-hello] 是一台由 Tailscale 员工管理的服务器，用于向新用户演示 Tailscale 的工作方式。"
---

最后验证于 Jul 8, 2026

[`hello.ts.net`][xt-hello] 是一台由 Tailscale 员工管理的服务器，用于向新用户演示 Tailscale 的工作方式。

`hello.ts.net` 只能通过 Tailscale 访问。
如果 `hello.ts.net` 能在你的浏览器中打开，说明你已经通过 Tailscale 连接了！

> **注意：**
>
> `hello.ts.net` 对[临时节点][docs-ephemeral-nodes]不可用。

`hello.ts.net` 是一台私有的"单向"服务器。它无法从公共互联网访问，并且[访问控制策略][docs-access-control]限制它发起任何出站连接。Tailscale 不会从 `hello.ts.net` 向你的 tailnet 发起连接。它除了让你确认自己已连接到 Tailscale 之外，没有任何其他用途。

> **注意：**
>
> 此前使用的是 `hello.ipn.dev` 而非 `hello.ts.net`。两者用途相同。

## 如何添加 hello.ts.net？

如果你想为了测试目的添加它，可以使用这个特殊的邀请 URL 将它接入你的网络：

`console.tailscale.com/admin/invite/hello.ts.net`

## 如何将它从我的网络中移除？

你可以随时在管理控制台的[机器](https://console.tailscale.com/admin/machines)页面移除 `hello.ts.net`。点开菜单即可看到移除它的链接。

*（图：管理控制台中的菜单，用红色轮廓标出了 Remove... 选项。）*

移除后，它会从列表中消失，你网络上的所有用户都将无法连接到它。

## hello.ts.net 有可靠性保证吗？

Tailscale 以尽力而为的方式运营 `hello.ts.net`。它不是 Tailscale 服务的关键基础设施，你也不应把它当作 tailnet 的关键基础设施来依赖。

特别提醒：探测 `hello.ts.net` 并不是判断 Tailscale 服务是否在线的理想方式。要判断这一点，你可以在 CLI 中运行 `tailscale status -json | jq -r
.BackendState`（如果没有 `jq`，则运行 `tailscale status --json | grep BackendState`），连接时会输出 `Running`，未连接时输出 `Stopped`。你也可以尝试连接 tailnet 上的某个资源，可以用 `curl` 之类的标准工具，或者用例如 [`LocalClient.DialTCP`][xt-go-tailscale-dialtcp]。

[docs-access-control]: /docs/features/access-control

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[xt-go-tailscale-dialtcp]: https://pkg.go.dev/tailscale.com/client/local#Client.DialTCP

[xt-hello]: https://hello.ts.net
