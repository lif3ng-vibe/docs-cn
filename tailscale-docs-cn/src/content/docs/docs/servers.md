---
title: "设置服务器"
description: "使用标签、预授权密钥、临时节点等方式安全地设置服务器。"
---

最后验证于 Mar 3, 2025

Tailscale 中的服务器是向 Tailscale 网络（即 tailnet）中其他设备提供资源或服务的设备。用户设备通过你的身份提供方完成认证，而服务器通常是非人类设备，需要不同的认证方式，例如标签（tag）和认证密钥（auth key）。服务器可以是物理机、虚拟机或云实例，运行 Web 应用、数据库或文件共享等服务。

## 认证设备并验证身份

与通过身份提供方认证的用户设备不同，服务器需要另一种处理方式。Tailscale 提供用于服务器身份管理的标签，以及用于自动化认证的认证密钥。

[**在 Tailscale 网络上设置服务器**](/docs/how-to/set-up-servers)——在 tailnet 中设置服务器，并使用 Tailscale SSH 管理这些服务器的认证。

[**用标签为设备分组**](/docs/features/tags)——使用 Tailscale 标签对服务器等非用户设备进行认证和标识。

[**认证密钥（auth keys）**](/docs/features/access-control/auth-keys)——使用 Tailscale 认证密钥认证设备、自动化设备开通并增强安全性。创建和管理认证密钥，实现更顺畅的网络访问与控制。

[**临时节点**](/docs/features/ephemeral-nodes)——在 Tailscale 中使用临时节点（ephemeral node）管理容器、CI/CD 系统等短生命周期设备。

## 保护远程访问并启用 TLS 连接

完成服务器认证后，你需要安全的方式来访问和管理它们。Tailscale 为 SSH 和 HTTPS 访问都提供了内置支持。

Tailscale SSH 消除了传统 SSH 密钥管理的复杂性。它会基于你现有的身份提供方权限，自动处理密钥分发和用户认证。

[**Tailscale SSH**](/docs/features/tailscale-ssh)——使用 Tailscale SSH 管理 tailnet 中 SSH 连接的认证与授权。

Tailscale 以端到端加密保护 tailnet 设备之间的连接。然而，有些应用并不知情，会因为指向你 tailnet 服务的 HTTP URL 看起来未加密（未使用 TLS 证书）而警告用户或禁用某些功能。你可以将 tailnet 配置为使用 HTTPS 来避免这些问题。

[**启用 HTTPS**](/docs/how-to/set-up-https-certificates)——为你的 Tailscale 网络中的设备配置 HTTPS。
