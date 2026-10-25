---
title: "将本地开发服务器共享给互联网"
description: "有时你需要把本地开发服务器共享给 Tailscale 网络之外的某个人。例如，查看原型的客户、测试集成的外包人员，或外"
---

最后验证于 May 18, 2026

有时你需要把本地开发服务器共享给 Tailscale 网络之外的某个人。例如，查看原型的客户、测试集成的外包人员，或者需要投递 webhook 的外部服务。Tailscale [Funnel][docs-funnel] 让你通过稳定的 HTTPS URL 把本地端口发布到公网，无需在设备上配置端口转发、DNS 记录或公网 IP 地址。

> **警告：**
>
> Tailscale Funnel 会把你的本地端口暴露到公网。任何拿到 URL 的人都能访问它。不要用 Funnel 发布包含敏感数据或本不该公开访问的服务。

1. 确保你的 tailnet 已启用 [MagicDNS][docs-magicdns] 和 [HTTPS 证书][docs-https]。Funnel 两者都需要，新 tailnet 默认已启用。

2. 前往管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面，打开 **Funnel**。启用 Funnel 需要拥有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) Tailscale 角色。

3. 确保你的本地开发服务器正在运行并监听请求。

4. 运行 [`tailscale funnel`][docs-tailscale-funnel] 命令，把 `3000` 替换为你的开发服务器正在监听的端口：

   ```bash
   tailscale funnel 3000
   ```

   Tailscale Funnel 将公网 HTTPS 流量代理到你的本地端口，并自动签发 TLS 证书。输出中会显示任何人都可以用来访问你开发服务器的公网 URL：

   ```
   Available on the internet:

   https://my-device.tailnet-name.ts.net/
   |-- proxy http://127.0.0.1:3000
   ```

   现在，你的开发服务器已经可以通过该 URL 以 HTTPS 方式被公网访问。

5. 从 `tailscale funnel` 的输出中复制 `https://*.ts.net` URL，分享给需要访问的人。对方无需安装 Tailscale。互联网上的任何浏览器或 HTTP 客户端都能访问该 URL。

6. 当你不再想公开开发服务器时，停止 Funnel 配置：

   ```bash
   tailscale funnel --terminate-on 3000
   ```

   这会移除公网代理，使该 URL 不可再访问。

   你也可以一次性停止所有 Funnel 端口：

   ```bash
   tailscale funnel reset
   ```

[docs-funnel]: /docs/features/tailscale-funnel

[docs-https]: /docs/how-to/set-up-https-certificates

[docs-magicdns]: /docs/features/magicdns

[docs-tailscale-funnel]: /docs/reference/tailscale-cli/funnel
