---
title: "Use Grafana with Tailscale"
description: "Use Grafana to monitor your tailnet or secure access to a Grafana dashboard using Tailscale."
---

Last validated Jul 31, 2025

Tailscale and [Grafana][xt-grafana] can work together in a variety of ways. For example, you can secure access to Grafana dashboards, use Tailscale as an identity provider, or create Grafana dashboards to monitor your Tailscale network (known as a tailnet).

## Secure Grafana dashboards with Tailscale

[Use Tailscale to secure remote access to Grafana dashboards][ln-grafana-access]. You can host your Grafana server within your tailnet to avoid exposing Grafana data to the public internet and control access to dashboards using [access control policies][docs-access-control-policies].

## Authenticate Grafana users using Tailscale

[Configure Grafana to use Tailscale as its authentication mechanism][bl-grafana-auth] using Tailscale's open source Grafana proxy ([`proxy-to-grafana`][xt-github-proxy-to-grafana]). Tailscale's Grafana proxy identifies users based on their [Tailscale identity][docs-tailscale-identity] and uses Grafana's [AuthProxy][xt-grafana-authproxy] to map each user's Tailscale identity to the corresponding Grafana user.

## Integrate with Grafana Cloud Private Data Source Connect

[Use Private Data Source Connect in Grafana Cloud][xt-grafana-cloud-private-data-source-connect] to securely query data sources in your tailnet.

## Monitor your tailnet with Grafana

Create a Grafana dashboard to monitor [Tailscale client metrics][docs-client-metrics], such as subnet routes, device health, and connectivity data. You can use the data to:

* Gain insights into how your tailnet is performing.
* Identify [connectivity issues][docs-troubleshoot-device-connectivity] between devices.
* Track bandwidth usage and plan for capacity needs.

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
