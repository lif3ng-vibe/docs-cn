---
title: "从 Coder 访问你的 tailnet"
description: "[Coder][xt-coder] 是一个开发者工作区平台，让你能在远程环境（例如云服务商的虚拟机）中编写代码。在 Coder 中，你可以将开发工作区定义为一个 Dockerfile。"
---

最后验证于 Mar 3, 2025

[Coder][xt-coder] 是一个开发者工作区平台，让你能在远程环境（例如云服务商的虚拟机）中编写代码。在 Coder 中，你可以将开发工作区定义为一个 Dockerfile。

你可以在 Coder 工作区内安装 Tailscale，从而安全地访问私有资源（例如软件包仓库），或者与同事共享环境，进行代码评审或结对编程。

## 集成

按照 [Coder 让 Tailscale 在 Coder 工作区中运行的说明][xt-coder-tailscale-customize]操作。你需要：

1. 在你[工作区的 Dockerfile][xt-coder-custom-images] 中添加 `tailscaled`。还需要确保将 Tailscale 的持久化状态存储在工作区的持久主目录卷中，这样 Tailscale 才能在工作区重建后保持连接
2. 启用[用户态网络][docs-userspace-networking]，如果需要建立出站连接，将 Tailscale 配置为 SOCKS5 或 HTTP 代理

## 授权

要让 Coder 工作区加入你的 tailnet，请从工作区中使用 `sudo tailscale up` 向 Tailscale 进行认证。

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-coder-custom-images]: https://coder.com/docs/coder/latest/images/writing

[xt-coder-tailscale-customize]: https://coder.com/docs/coder/latest/guides/customization/tailscale

[xt-coder]: https://coder.com
