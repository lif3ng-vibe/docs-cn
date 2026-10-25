---
title: "Tailscale PAM 连接器高可用"
description: "Tailscale PAM 供应系统在设计上就考虑了冗余与高可用。"
---

最后验证于 Aug 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

Tailscale PAM 供应系统在设计上就考虑了冗余与高可用。

[连接器][docs-pam-connectors]与[服务][docs-pam-services]之间是多对多关系。单个连接器可以提供对多个服务的访问；单个服务也可以由多个连接器提供服务。我们建议为每个生产环境服务至少配置两个连接器。多个连接器提供高可用性：即使某个连接器或其主机不可用，服务仍保持可访问。

你可以把连接器部署在不同的可用区、云计算区域，甚至不同的云计算提供商基础设施中。例如，你可以让一个云区域中的三个连接器为十个服务提供服务。请根据你的可用性要求决定在何处部署连接器以及部署多少个。

## 连接器故障时会发生什么？

所有客户端设备始终与所有*相关*连接器保持对等，即使没有流量发往它们。当某个连接器被关闭，或 Tailscale 控制平面检测到它离线时，所有客户端设备都会收到该事件的通知。如果你的服务由另一个可用的连接器提供服务，客户端会自动改用该连接器。

## 连接器宕机时已有连接会怎样？

对于 SSH、数据库、HTTP/HTTPS 或 TCP 服务器等服务，你当前的会话会结束，但重连（或自动重连，取决于客户端）会透明地使用下一个可用的连接器。

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-services]: /docs/privileged-access-management/services
