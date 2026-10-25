---
title: "Tailscale PAM FAQ"
description: "可以。如果你想在不使用自己服务器的情况下试用 Tailscale PAM，可以使用多个公共沙箱服务器作为源服务器。"
---

最后验证于 Jul 6, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

## 有可以配合 Tailscale PAM 使用的沙箱服务器吗？

可以。如果你想在不使用自己服务器的情况下试用 Tailscale PAM，可以使用多个公共沙箱服务器作为源服务器。

这些沙箱服务器仅用于测试。不要用它们处理敏感数据或生产数据。它们会定期重置。

沙箱包含 SSH、HTTP、MySQL、PostgreSQL、VNC、RDP 和 TCP 服务。关于可用的沙箱服务器、端口和凭证，参见[沙箱服务器][docs-pam-sandbox-servers]。

## Tailscale 客户端能识别哪些数据库客户端？

当你在 Tailscale 客户端中选择一个数据库服务时，客户端会尝试检测你设备上已安装的知名数据库应用。如果检测到，Tailscale 可以带着该 PAM 服务的连接配置启动该应用。

目前可识别的数据库客户端包括：

* `mycli`
* `pgcli`
* `psql`
* CockroachDB SQL shell
* DataGrip
* DBeaver
* MySQL
* MySQL Workbench
* pgAdmin
* TablePlus

你并不局限于这些数据库客户端。如果你偏好的客户端不在列表中，Tailscale 客户端不会自动为你检测并启动它，但你仍然可以把它与 Tailscale PAM 搭配使用。

手动启动你的数据库客户端，并把它配置为连接到该 Tailscale PAM 服务名称。然后你就可以使用自己的 [Tailscale 身份][docs-tailscale-identity]进行身份验证。

## 如何让 Tailscale PAM 服务实现高可用？

要实现高可用，请部署两个或更多能独立到达同一服务的 Tailscale PAM 连接器。一个 PAM 服务可以关联多个连接器，这样当某个连接器不可用时，客户端可以使用另一个可用连接器来访问该服务。

为获得最佳可用性，请把连接器部署在不同的故障域中，例如不同的主机、可用区或区域，并确保每个连接器都能独立到达该服务。

当某个服务有多个连接器可用时，Tailscale 客户端会选择最稳定的连接器。这通常是保持对等连接时间最长的那个连接器。连接器选择基于连接稳定性，而不是轮询式的负载均衡。

如果当前使用的连接器变得不可用，新连接会改用另一个可用连接器。经过失效连接器的既有 TCP 连接会被中断，需要重新连接。

更多信息，参见 [Tailscale PAM 连接器高可用][docs-pam-connector-ha]。

## 如何检查或升级 Tailscale PAM 连接器的版本？

Tailscale PAM 连接器的可执行文件名为 `tailzero`。

要检查你正在运行的连接器版本：

```shell
tailzero version check
```

要升级到最新版本：

```shell
sudo tailzero version upgrade
sudo systemctl restart tailzero
```

`tailzero version upgrade` 命令会下载最新的连接器可执行文件并替换当前安装的版本。升级后请重启 `tailzero` 服务，让新版本生效。

## 为什么通过 Tailscale PAM HTTP 服务登录 SSO 会失败？

当你通过 Tailscale PAM [HTTP 服务][docs-pam-http-service]访问一个应用时，该服务的公共主机名可能与你直接访问该应用所用的主机名不同。这可能导致单点登录（SSO）失败。包括解决方法在内的更多信息，参见[排查 HTTP 服务的 SSO 登录失败][docs-pam-http-service-troubleshoot-sso-failure]。

[docs-pam-connector-ha]: /docs/privileged-access-management/connectors/high-availability

[docs-pam-http-service-troubleshoot-sso-failure]: /docs/privileged-access-management/how-to/access-http-service/troubleshoot-sso-failure

[docs-pam-http-service]: /docs/privileged-access-management/how-to/access-http-service

[docs-pam-sandbox-servers]: /docs/privileged-access-management/reference/sandbox-servers

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
