---
title: "将 Tailscale 与强制门户配合使用"
description: "了解当你连接到公共网络时，Tailscale 如何处理强制门户（captive portal）。"
---

最后验证于 Dec 10, 2025

当你连接到公共网络时，你可能会被重定向到一个[强制门户（captive portal）][xt-wikipedia-captive-portal]，要求你在访问互联网之前完成身份验证或接受条款。

强制门户通常在用户访问其他网页之前出现，通常包含登录表单、付费选项或广告。强制门户常见于公共 Wi-Fi 热点，例如机场、酒店、咖啡店、图书馆及其他公共场所。企业和教育机构也经常部署强制门户，以确保只有拥有凭证的用户才能连接到网络。

如果你的设备连上了强制门户却没有完成身份验证步骤，Tailscale 将无法与协调服务器（coordination server）建立连接，也无法与你 tailnet 中的其他设备连通。

## 强制门户通知

> **注意：**
>
> 强制门户通知目前仅支持 macOS 与 iOS。必须为 Tailscale 客户端授予通知权限，通知才会显示。

在 Tailscale v1.72 或更高版本中，当检测到强制门户时，你的设备上会出现一条通知：

*（图：macOS 上告知用户存在强制门户的通知）*

在 [Tailscale CLI][docs-cli] 可用的平台上，`tailscale status` 命令也会包含一条健康警告：

```shell
tailscale status
```

该命令应输出以下内容：

```shell
# Health check:
#     - This network requires you to log in using your web browser.
```

要解决此问题，请在网页浏览器中尝试访问 [`example.com`][xt-example-com] 等网站，完成必要的身份验证步骤。&#x20;

## Tailscale 如何检测强制门户

> **注意：**
>
> 强制门户检测需要 Tailscale v1.72 或更高版本。

尽管多年来已提出多项[标准][xt-rfc-8952-captive]，但每家网络设备制造商或 ISP 实现强制门户的方式都不尽相同。由于缺乏统一标准，目前没有一种被广泛使用的协议能够可靠地检测强制门户。Tailscale 客户端会在后台以尽力而为（best-effort）的方式持续检测强制门户，具体步骤如下：

1. 客户端持续观察网络接口的状态，以及与 Tailscale [协调服务器][docs-coordination-server]和[中继服务器][docs-derp]的连接状态。如果观察到连接问题，就会启动强制门户检测流程。只有观察到连接问题时才会运行强制门户检测。
2. Tailscale 会尝试联系一组已知会在 TCP 端口 `80` 上接受入站连接的中继服务器。客户端向中继服务器上的 `/generate_204` 端点发起一次未加密的 HTTP 请求。该端点应返回状态码为 204 的 HTTP 响应。
3. 由于 [DNS 解析][docs-dns]在某些强制门户之后不可靠，Tailscale 会直接使用中继服务器的 IPv4 地址来联系它。例如，发出的 HTTP 请求可能指向位于 `http://123.12.12.123/generate_204` 的中继服务器。
4. 作为上述 HTTP 请求的一部分，如果中继服务器支持挑战（challenge）协议，Tailscale 还可能在请求的 HTTP 头中发送一个挑战（`X-Tailscale-Challenge`）。该挑战头的值为 `ts_<hostname>`，其中 `<hostname>` 是所用中继服务器的主机名。
5. HTTP 请求发出后，会对 HTTP 响应的状态码与响应头进行评估。

* 如果状态码为 `204` 且 `X-Tailscale-Response` 为 `response ts_<hostname>`，Tailscale 会认为未检测到强制门户。
* 如果响应中缺少 `X-Tailscale-Response`、其值不符合预期，或返回的状态码不是 `204`，Tailscale 会推断有东西在篡改 HTTP 连接，因此很可能存在强制门户。

## 禁用强制门户检测

如果你总是在同一地点使用电脑，或想避免与检测相关的流量发往我们的服务器，可以在 tailnet 的[访问控制策略][docs-access-control]中配置 `disable-captive-portal-detection` [节点属性][docs-policy-syntax-node-attributes]来关闭强制门户检测：

```json
{
  "nodeAttrs": [
    {
      "target": [
        "autogroup:member"
      ],
      "attr": [
        "disable-captive-portal-detection"
      ]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

[docs-access-control]: /docs/features/access-control

[docs-policy-syntax-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-cli]: /docs/reference/tailscale-cli

[docs-coordination-server]: /docs/reference/glossary#协调服务器

[docs-derp]: /docs/reference/derp-servers

[docs-dns]: /docs/reference/dns-in-tailscale

[xt-rfc-8952-captive]: https://www.rfc-editor.org/rfc/rfc8952.html

[xt-example-com]: http://www.example.com

[xt-wikipedia-captive-portal]: https://en.wikipedia.org/wiki/Captive_portal
