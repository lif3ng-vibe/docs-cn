---
title: "将 Grafana 与 Tailscale 配合使用"
description: "使用 Grafana 监控你的 tailnet，或使用 Tailscale 保护对 Grafana 仪表板的访问。"
---

最后验证于 Jul 31, 2025

Tailscale 与 [Grafana][xt-grafana] 可以以多种方式协同工作。例如，你可以保护对 Grafana 仪表板的访问、将 Tailscale 用作身份提供方，或创建 Grafana 仪表板来监控你的 Tailscale 网络（即 tailnet）。

## 用 Tailscale 保护 Grafana 仪表板

[使用 Tailscale 保护对 Grafana 仪表板的远程访问][ln-grafana-access]。你可以把 Grafana 服务器托管在 tailnet 内，避免将 Grafana 数据暴露给公共互联网，并使用[访问控制策略][docs-access-control-policies]控制对仪表板的访问。

## 使用 Tailscale 验证 Grafana 用户身份

使用 Tailscale 的开源 Grafana 代理（[`proxy-to-grafana`][xt-github-proxy-to-grafana]）[将 Grafana 配置为以 Tailscale 作为其身份验证机制][bl-grafana-auth]。Tailscale 的 Grafana 代理基于用户的 [Tailscale 身份][docs-tailscale-identity]识别用户，并使用 Grafana 的 [AuthProxy][xt-grafana-authproxy] 将每个用户的 Tailscale 身份映射到对应的 Grafana 用户。

## 与 Grafana Cloud Private Data Source Connect 集成

[在 Grafana Cloud 中使用 Private Data Source Connect][xt-grafana-cloud-private-data-source-connect]，安全地查询 tailnet 中的数据源。

## 用 Grafana 监控你的 tailnet

创建一个 Grafana 仪表板来监控 [Tailscale 客户端指标][docs-client-metrics]，例如子网路由、设备健康状况与连接数据。你可以利用这些数据：

* 洞察 tailnet 的运行状况。
* 发现设备之间的[连接问题][docs-troubleshoot-device-connectivity]。
* 跟踪带宽使用情况并规划容量需求。

[bl-grafana-auth]: https://tailscale.com/blog/grafana-auth

[docs-access-control-policies]: /docs/features/access-control

[docs-client-metrics]: /docs/reference/tailscale-client-metrics

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-troubleshoot-device-connectivity]: /docs/reference/troubleshooting/connectivity

[ln-grafana-access]: https://tailscale.com/learn/remote-access-to-grafana-dashboards

[xt-github-proxy-to-grafana]: https://github.com/tailscale/tailscale/tree/main/cmd/proxy-to-grafana

[xt-grafana-authproxy]: https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/auth-proxy/

[xt-grafana]: https://grafana.com/

[xt-grafana-cloud-private-data-source-connect]: https://grafana.com/blog/2025/07/24/securely-query-data-sources-on-your-tailscale-network-using-private-data-source-connect-in-grafana-cloud/
