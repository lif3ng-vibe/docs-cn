---
title: "Tailscale ping message types"
description: "The Tailscale CLI ping command supports four types of ping messages."
---

Last validated Jan 13, 2026

The standard `ping` command uses [Internet Control Message Protocol][xt-rfc-792] (ICMP) echo request and echo reply messages to test connectivity between two devices on a network. When you run a standard ping command, your system:

1. Sends ICMP echo request packets to the target IP address.
2. Waits for ICMP echo reply packets from the target.
3. Measures the round-trip time.
4. Reports packet loss statistics.

The standard `ping` command primarily tests basic IP connectivity and measures latency. Many firewalls and network configurations block ICMP traffic, which can cause standard `ping` commands to fail even when other types of connectivity exist.

The Tailscale ping command extends beyond standard ICMP ping functionality. It lets you test [connectivity][docs-device-connectivity] using multiple protocols to provide more comprehensive information about your Tailscale network (known as a [tailnet][docs-tailnet]) to help troubleshoot Tailscale-specific connectivity issues.

You can use the [Tailscale CLI][docs-cli] ([`tailscale ping`][docs-cli-ping]) to send Tailscale ping messages. Tailscale ping supports four distinct ping message types, each serving a specific purpose in [diagnosing network connectivity][docs-troubleshoot-connectivity]. The supported ping types are DISCO, ICMP, TSMP, and peer API.

## DISCO

DISCO (discovery) is Tailscale's protocol for peer-to-peer path discovery and [NAT traversal][bl-how-nat-traversal-works]. By default, the Tailscale ping command uses the DISCO protocol. DISCO ping messages test direct connectivity between tailnet devices.

To send a DISCO ping message, use [`tailscale ping`][docs-cli-ping] command without any flags.

```shell
tailscale ping device-name
pong from device-name  (100.100.100.123) via DERP(nue) in 20ms
pong from device-name  (100.100.100.123) via 1.2.3.4:56126 in 20ms
```

The ping output also shows the path taken to reach the target device, which starts off as a [DERP connection][docs-derp-servers], then establishes either a direct connection or a peer relay connection. The following is an example of a DERP connection followed by a [peer relay][docs-peer-relay] connection, then a direct connection:

```shell
tailscale ping device-name
pong from device-name (100.100.100.123) via DERP(iad) in 39ms
pong from device-name (100.100.100.123) via peer-relay(198.51.100.167:7777:vni:7) in 35ms
pong from device-name (100.100.100.123) via peer-relay(198.51.100.167:7777:vni:7) in 36ms
pong from device-name (100.100.100.123) via peer-relay(198.51.100.167:7777:vni:7) in 35ms
pong from device-name (100.100.100.123) via 203.0.113.5:37597 in 41ms
```

For more information about Tailscale connection types, refer to [connection types in Tailscale][docs-connection-types].

## ICMP

Tailscale ICMP ping messages send a normal ICMP ping message over Tailscale's [encrypted][docs-encryption] WireGuard connection. Tailscale ICMP ping message test end-to-end IP connectivity between Tailscale devices.

To send an ICMP ping message, use the `--icmp` flag with the [`tailscale ping`][docs-cli-ping] command.

```shell
tailscale ping --icmp device-name
pong from device-name (100.100.100.123) via ICMP in 20ms
```

## TSMP (Tailscale Message Protocol)

TSMP is a Tailscale-specific protocol designed to test connectivity when ICMP might be blocked. Tailscale TSMP ping messages test end-to-end IP connectivity over Tailscale's encrypted [WireGuard][docs-wireguard] tunnel but they bypass the device's operating system's IP stack.

To send a TSMP ping message, use the `--tsmp` flag with the [`tailscale ping`][docs-cli-ping] command.

```shell
tailscale ping --tsmp device-name
pong from device-name (100.100.100.123, 12345) via TSMP in 20ms
```

## Peer API

Peer API ping tests the HTTP-based peer API connectivity between tailnet devices. It's useful when troubleshooting Tailscale features like [Serve][docs-serve], [Taildrive][docs-taildrive], and [Taildrop][docs-taildrop].

To send a peer API ping message, use the `--peerapi` flag with the [`tailscale ping`][docs-cli-ping] command.

```shell
tailscale ping --peerapi device-name
hit peerapi of 100.100.100.123 (device-name.corp.ts.net.) at http://100.100.100.123:12345 in 20ms
```

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-tailscale-works

[docs-cli]: /docs/reference/tailscale-cli

[docs-cli-ping]: /docs/reference/tailscale-cli#ping

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-peer-relay]: /docs/features/peer-relay

[docs-serve]: /docs/features/tailscale-serve

[docs-taildrive]: /docs/features/taildrive

[docs-taildrop]: /docs/features/taildrop

[docs-tailnet]: /docs/concepts/tailnet

[docs-troubleshoot-connectivity]: /docs/reference/troubleshooting/connectivity

[docs-wireguard]: /docs/concepts/wireguard

[xt-rfc-792]: https://www.rfc-editor.org/rfc/rfc792.html
