---
title: "Tailscale PAM 沙箱服务器"
description: "如果你想在不使用自己服务器的情况下试用 [Tailscale PAM][docs-pam]，可以使用多个公共沙箱服务器作为源服务器。在接入自己的基础设施之前，先用这些服务器测试不同的 Tailscale PAM 服务类型和配置。"
---

最后验证于 Aug 24, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

如果你想在不使用自己服务器的情况下试用 [Tailscale PAM][docs-pam]，可以使用多个公共沙箱服务器作为源服务器。在接入自己的基础设施之前，先用这些服务器测试不同的 Tailscale PAM 服务类型和配置。

这些沙箱服务器仅用于测试。不要用它们处理敏感数据或生产数据。它们会定期重置。

下面列出了可用的沙箱服务器、端口和凭证信息。

| 类型       | 服务器                        | 端口   | 凭证                                          |
| ---------- | ----------------------------- | ------ | --------------------------------------------- |
| HTTP       | `http.playground.border0.io`  | `80`   | 无需身份验证                                  |
| MySQL      | `mysql.playground.border0.io` | `3306` | 用户名：`border0` 密码：`Border0<3MySql`      |
| PostgreSQL | `psql.playground.border0.io`  | `5432` | 用户名：`border0` 密码：`Border0<3Psql`       |
| SSH        | `ssh.playground.border0.io`   | `22`   | 用户名：`border0` 密码：`Border0<3Ssh`        |
| TCP Echo   | `tcp.playground.border0.io`   | `9000` | 无需身份验证                                  |
| VNC        | `vnc.playground.border0.io`   | `5900` | 密码：`Border0<3VNC`                          |

[docs-pam]: /docs/privileged-access-management
