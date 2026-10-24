---
title: "Tailscale PAM sandbox servers"
description: "If you want to experiment with [Tailscale PAM][docs-pam] without using your own servers, you can use various public sandbox servers as origin servers. Use these servers to test different Tailscale PAM"
---

Last validated Aug 24, 2026

> **Note:** Tailscale PAM is currently in beta.

If you want to experiment with [Tailscale PAM][docs-pam] without using your own servers, you can use various public sandbox servers as origin servers. Use these servers to test different Tailscale PAM service types and configurations before connecting your own infrastructure.

The sandbox servers are intended for testing only. Don't use them for sensitive or production data. They are periodically reset.

The following shows information about the available sandbox servers, ports, and credentials.

| Type       | Server                        | Port   | Credentials                                   |
| ---------- | ----------------------------- | ------ | --------------------------------------------- |
| HTTP       | `http.playground.border0.io`  | `80`   | No authentication required                    |
| MySQL      | `mysql.playground.border0.io` | `3306` | Username: `border0`Password: `Border0<3MySql` |
| PostgreSQL | `psql.playground.border0.io`  | `5432` | Username: `border0`Password: `Border0<3Psql`  |
| SSH        | `ssh.playground.border0.io`   | `22`   | Username: `border0`Password: `Border0<3Ssh`   |
| TCP Echo   | `tcp.playground.border0.io`   | `9000` | No authentication required                    |
| VNC        | `vnc.playground.border0.io`   | `5900` | Password: `Border0<3VNC`                      |

[docs-pam]: /docs/privileged-access-management
