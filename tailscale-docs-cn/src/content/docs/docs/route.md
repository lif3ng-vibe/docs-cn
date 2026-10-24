---
title: "Route traffic"
description: "Explore Tailscale routing features, such as subnet routers, exit nodes, and MagicDNS."
---

Last validated Sep 29, 2026

Use Tailscale routing features to control how network traffic is routed to, from, and within your Tailscale network, known as a tailnet.

## Access non-Tailscale devices

In cases where you can't install Tailscale on every device on your physical network, you can set up a *subnet router* to access these devices from your tailnet. Subnet routers respect features like [access control policies][docs-access-control], which make it easy to migrate a large network to Tailscale without installing the Tailscale client on every device.

[**Subnet routers**](/docs/features/subnet-routers) — Use subnet routers to give devices outside your local network access to services within specific subnets. Extend your private network with Tailscale.

## Route all internet traffic

Routing internet traffic through an *exit node* is useful when accessing untrusted Wi-Fi in a cafe or using an online service (such as banking) only available in your home country from overseas.

Exit nodes route **all** your network traffic, which is often not what you want. To configure Tailscale to only route traffic to certain subnets (the more common configuration), read about [Accessing non-Tailscale devices from your network][ar-non-tailscale-devices] instead.

[**Exit nodes (route all traffic)**](/docs/features/exit-nodes) — Route all internet traffic through a specific device on your network.

[**Mullvad exit nodes**](/docs/features/exit-nodes/mullvad-exit-nodes) — Use Mullvad VPN endpoints as exit nodes for your tailnet.

## Control access to third-party applications

App connectors let you control device and user access to applications without any end-user setup. They let you manage and monitor access to both SaaS and self-hosted apps across your tailnet.

[**How app connectors work**](/docs/features/app-connectors) — Route SaaS application traffic in your tailnet using app connectors.

## Choose how Tailscale selects routes

Deploy redundant subnet routers and app connectors for high availability. Use route selection to choose how Tailscale selects among them.

[**Set up high availability**](/docs/how-to/set-up-high-availability) — Set up high availability (HA) for subnet routers and app connectors.

[**Route selection**](/docs/features/route-selection) — Compare and configure route selection for subnet routers, app connectors, and Tailscale Service hosts, including MagicRoute exit node recommendations.

## Manage DNS

You can map Tailscale IP addresses to human-readable and memorable names using the Domain Name System (DNS). For example, instead of remembering which IP address maps to an internal expense report server hosted in your tailnet, you can use DNS to map the IP address to the server's name, like "Expenses".

[**DNS in Tailscale**](/docs/reference/dns-in-tailscale) — Optimize your Tailscale network for DNS management, including custom DNS servers, for seamless access and better control.

[ar-non-tailscale-devices]: #access-non-tailscale-devices

[docs-access-control]: /docs/features/access-control
