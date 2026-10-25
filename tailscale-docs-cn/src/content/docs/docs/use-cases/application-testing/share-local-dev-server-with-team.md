---
title: "将本地开发服务器共享给你的团队"
description: "在开发功能或修复 bug 时，你常常想让队友在部署之前预览你的工作成果，而不必推送到预发环境。Tailscale Serve 让你能够"
---

最后验证于 May 18, 2026

在开发功能或修复 bug 时，你常常想让队友在部署之前预览你的工作成果，而不必推送到预发环境。Tailscale [Serve][docs-serve] 让你通过安全的 HTTPS URL，把本地开发服务器展现给你的 Tailscale 网络（即 tailnet）中的其他成员。无需端口转发，无需隧道服务，也无需公网访问。

> **注意：**
>
> Tailscale Serve 仅对你 tailnet 的成员可见，不会把你的开发服务器暴露到公网。要与 tailnet 之外的人共享，请参阅 [Tailscale Funnel][docs-funnel]。

1. 确保你的 tailnet 已启用 [MagicDNS][docs-magicdns] 和 [HTTPS 证书][docs-certs]。Serve 两者都需要，新 tailnet 默认已启用。

2. 确保你的本地开发服务器正在运行并监听请求。

3. 运行 [`tailscale serve`][docs-tailscale-serve] 命令，把 `3000` 替换为你的开发服务器正在监听的端口：

   ```bash
   tailscale serve 3000
   ```

   Tailscale Serve 把发往你 `*.ts.net` 主机名的请求代理到本地端口，并自动签发 TLS 证书。输出中会显示队友用来访问你开发服务器的 URL：

   ```
   Available within your tailnet:

   https://my-device.tailnet-name.ts.net/
   |-- proxy http://127.0.0.1:3000
   ```

   现在，tailnet 中的其他成员已经可以通过该 URL 以 HTTPS 方式访问你的开发服务器。

4. 从 `tailscale serve` 的输出中复制 `https://*.ts.net` URL 并分享给你的队友。只要对方已连接到你的 tailnet，就能在浏览器中打开该 URL，访问你的本地开发服务器。

> **提示：**
>
> 队友的 Tailscale 客户端必须处于运行并已连接的状态，才能访问你的 `*.ts.net` 主机名。

1. 当你不再想共享开发服务器时，停止 Serve 配置：

   ```bash
   tailscale serve --terminate-on 3000
   ```

   这会移除代理，并停止在 `*.ts.net` 主机名上宣告你的开发服务器。

   你也可以一次性停止所有端口的共享：

   ```bash
   tailscale serve reset
   ```

[docs-certs]: /docs/how-to/set-up-https-certificates

[docs-funnel]: /docs/features/tailscale-funnel

[docs-magicdns]: /docs/features/magicdns

[docs-serve]: /docs/features/tailscale-serve

[docs-tailscale-serve]: /docs/reference/tailscale-cli/serve
