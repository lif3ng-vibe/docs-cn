---
title: "排查 Tally ERP 问题"
description: "Tally 绑定网络接口的方式似乎会与 Tailscale 等 VPN 软件冲突。如果许可证服务器运行在本地设备上，可以通过 UI 修改 Tally 配置或编辑 `Tally.ini` 来解决。"
---

最后验证于 Mar 16, 2026

Tally 绑定网络接口的方式似乎会与 Tailscale 等 VPN 软件冲突。如果许可证服务器（license server）运行在本地设备上，可以通过 UI 修改 Tally 配置，或者编辑 `Tally.ini`，把许可证服务器改为 `127.0.0.1:9999` 而不是使用 PC 主机名，即可解决此问题。
