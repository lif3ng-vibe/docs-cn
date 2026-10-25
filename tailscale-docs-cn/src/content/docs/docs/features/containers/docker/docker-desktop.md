---
title: "设置 Docker Desktop 以配合 Tailscale 使用"
description: "Tailscale 的 Docker Desktop 扩展让你能把本地机器上暴露的容器端口分享给你的私有 Tailscale 网络（即 tailnet）中的其他人。"
---

最后验证于 Mar 23, 2026

> **弃用：**
>
> 自 v1.78.0 起，Tailscale 的 Docker Desktop 扩展不再受支持。

Tailscale 的 [Docker Desktop][xt-docker-desktop] 扩展让你能把本地机器上暴露的容器端口分享给你的私有 Tailscale 网络（即 [tailnet][docs-tailnet]）中的其他人。你可以用 Tailscale 扩展与团队协作开发服务、通过 SSH 连入容器等等。

使用 Tailscale 扩展时，你 tailnet 的[访问控制规则][docs-access-control]和[共享节点][docs-sharing]等设置仍然存在并保持启用。如果你使用 [MagicDNS][docs-magicdns]，它在 Docker Desktop 中也会保持启用。

## 安装 Tailscale 扩展

1. 在 Docker Desktop 中，选择 **添加扩展**（Add Extension），找到 **Tailscale**，然后选择 **安装**（Install）。

2. 系统会提示你创建 Tailscale 账户或登录 Tailscale 账户。*请注意，登录 Tailscale 会把你的容器公开端口暴露给你的 tailnet。*如果想通过网页浏览器登录，请选择 **使用浏览器登录**（Log in with browser）；如果想获取二维码、用另一台设备登录，请选择 **使用其他设备登录**（Log in with another device）。

安装完成后，Tailscale 扩展会出现在 Docker Desktop 侧边栏中。

如果你的宿主设备没有运行 Tailscale，就无法在本地通过 Tailscale 访问容器（例如在浏览器中）。请在你的设备上安装 Tailscale，以便使用 Tailscale 访问容器。

## 使用 Tailscale 扩展

在 Docker Desktop 侧边栏中选择 Tailscale 扩展，即可显示你开放了端口的容器及其 Tailscale IP 地址和 URL。选择一个 URL 即可复制。你可以把这个 URL 发给 tailnet 中的其他用户，让他们访问你的容器。你也可以选择 **打开**（Open），在浏览器中打开该 URL。

## 会把你的容器端口从 tailnet 中移除的操作

在运行 Docker Desktop 的机器上执行以下任一操作，都会停止在你的 tailnet 内共享 *Docker Desktop* 中的容器端口：

* 登出 Tailscale
* 卸载 Tailscale 扩展

## 卸载 Tailscale 扩展

1. 在扩展列表中找到 **Tailscale**，然后选择 **卸载**（Uninstall）。

卸载 Tailscale 扩展后，你的容器公开端口将无法再通过 Docker Desktop 供 tailnet 中的其他用户访问。

[docs-access-control]: /docs/features/access-control

[docs-magicdns]: /docs/features/magicdns

[docs-sharing]: /docs/features/sharing

[docs-tailnet]: /docs/concepts/tailnet

[xt-docker-desktop]: https://www.docker.com/products/docker-desktop
