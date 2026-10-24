---
title: "Tailscale client metrics"
description: "Collect metrics from Tailscale clients."
---

Last validated Jul 28, 2026

You can expose and collect Tailscale client metrics for use with monitoring systems such as [Prometheus][xt-prometheus] or [Grafana][docs-grafana] for your Tailscale network (known as a tailnet). These metrics provide insights into client behavior, health, and performance. For example, you can monitor information about client connectivity to [subnet routers][docs-tailscale-subnet-router] configured in your tailnet.

> **Note:**
>
> Tailscale client metrics are supported in Tailscale v1.78.0 and later.

## Available metrics

You can collect the following metrics from the Tailscale clients in your tailnet:

### Subnet router

Use the metrics in this section to collect Tailscale client information related to subnet routes.

`tailscaled_advertised_routes`

* The metric type is `gauge`.
* Displays the number of routes advertised by the client.
* Includes routes that are not approved.
* Does not include exit nodes.

`tailscaled_approved_routes`

* The metric type is `gauge`.
* Displays number of advertised routes that have been [approved][docs-subnet-route-approval] by an administrator.

### Peer relay servers

Use the metrics in this section to collect information about the local [peer relay][docs-peer-relays] instance.

`tailscaled_peer_relay_forwarded_packets_total`

* The metric type is `counter`.
* Displays the number of packets forwarded by the local peer relay instance.
* Labels:
  * `transport_in`: The transport protocol used for incoming packets. Possible values are `udp4` for UDP over IPv4 and `udp6` for UDP over IPv6.
  * `transport_out`: The transport protocol used for outgoing packets. Possible values are `udp4` for UDP over IPv4 and `udp6` for UDP over IPv6.

`tailscaled_peer_relay_forwarded_bytes_total`

* The metric type is `counter`.
* Displays number of bytes forwarded by the local peer relay instance.
* Labels:
  * `transport_in`: The transport protocol used for incoming packets. Possible values are `udp4` for UDP over IPv4 and `udp6` for UDP over IPv6.
  * `transport_out`: The transport protocol used for outgoing packets. Possible values are `udp4` for UDP over IPv4 and `udp6` for UDP over IPv6.

`tailscaled_peer_relay_endpoints`

* The metric type is `gauge`.
* Displays number of endpoints (tunnels) currently served by the local peer relay instance.
* Labels:
  * `state`: The endpoint state. Possible values are `connecting` when one or both peers are negotiating a connection, and `open` for endpoints able to forward traffic.

### Health

Use the metrics in this section to collect Tailscale client information related to health.

`tailscaled_health_messages`

* The metric type is `gauge`.
* Displays the number of health messages currently reported by the Tailscale client.
* This metric has a `type` label, reporting health message type. For example, `warning`.

You can collect details about the health messages by running [`tailscale status`][docs-cli-status].

### DERP

Use the metrics in this section to collect Tailscale client information related to [DERP relay servers][docs-derp-servers].

`tailscaled_home_derp_region_id`

* The metric type is `gauge`.
* Displays the [DERP region][docs-derp-servers] ID of this node's home relay server.

### Tailscale Services

Use the metrics in this section to collect per-Service throughput for connections handled by Tailscale Serve on a [Tailscale Service][docs-tailscale-services] host. These metrics are available in Tailscale v1.102.0 and later.

`tailscaled_serve_inbound_bytes_total`

* The metric type is `counter`.
* Displays the number of bytes received from peers on Serve connections for Tailscale Services.

`tailscaled_serve_outbound_bytes_total`

* The metric type is `counter`.
* Displays the number of bytes sent to peers on Serve connections for Tailscale Services.

Both metrics contain a `service` label with the full Tailscale Service name, including the `svc:` prefix. For example, `svc:my-app`. These metrics don't include traffic from device-based Serve, Funnel, or layer 3 (TUN-mode) Tailscale Services.

### Throughput

Use the metrics in this section to collect Tailscale client information related to throughput.

`tailscaled_inbound_packets_total`

* The metric type is `counter`.
* Displays the number of packets received by the node from other peers.

`tailscaled_inbound_bytes_total`

* The metric type is `counter`.
* Displays the number of bytes received by the node from other peers.

`tailscaled_outbound_packets_total`

* The metric type is `counter`.
* Displays the number of packets sent by the device to other peers.

`tailscaled_outbound_bytes_total`

* The metric type is `counter`.
* Displays the number of bytes sent by the node to other peers.

All throughput metrics contain a `path` label, indicating [the type of connection][docs-connection-types] that
a packet took. The `path` label can contain one of the following values:

* `direct_ipv4`: Packets sent or received directly over IPv4.
* `direct_ipv6`: Packets sent or received directly over IPv6.
* `derp`: Packets sent or received through a [DERP relay][docs-derp-servers].
* `peer_relay_ipv4`: Packets sent or received through a [Tailscale Peer Relay][docs-peer-relays] over IPv4.
* `peer_relay_ipv6`: Packets sent or received through a [Tailscale Peer Relay][docs-peer-relays] over IPv6.

### Dropped packets

Use the metrics in this section to collect Tailscale client information related to dropped packets.

`tailscaled_inbound_dropped_packets_total`

* The metric type is `counter`.
* Displays the number of packets dropped after being received from other peers.

`tailscaled_outbound_dropped_packets_total`

* The metric type is `counter`.
* Displays the number of packets dropped while being sent to other peers.

Both the `tailscaled_inbound_dropped_packets_total` and `tailscaled_outbound_dropped_packets_total` metrics contain a `reason` label with one of the following values:

* `acl`: The reported packets dropped by [Tailscale access control][docs-access-control].
* `multicast`: The reported packets dropped because they were multicast.
* `link_local_unicast`: The reported packets dropped because they were link-local unicast.
* `too_short`: The reported packets dropped because they were too short.
* `fragment`: The reported packets dropped because they were IP fragments.
* `unknown_protocol`: The reported packets dropped because they had an unknown protocol.
* `error`: The reported packets dropped because of an error.

## Collect metrics

You can collect Tailscale metrics either from the Tailscale [web interface][docs-device-web-interface] or the [Tailscale CLI][docs-cli-metrics].

### Web interface

The Tailscale [web interface][docs-device-web-interface] exposes client metrics on the conventional `/metrics` path.

#### Access metrics locally

Each client exposes metrics locally through the [`http://100.100.100.100/metrics`][docs-what-is-quad100] URL. You can use this URL when the monitoring server (or agent) is running on the same host as the Tailscale client.

#### Collect metrics over Tailscale

To collect metrics over your tailnet, you must:

* Enable the Tailscale [web interface][docs-device-web-interface] on each device that you plan to expose metrics by running using the [`tailscale set --webclient`][docs-cli-set] command.
* Grant your monitoring server access to port `5252` of each device in your [tailnet policy file][docs-tailnet-policy-file].

We recommend using this method when your monitoring server is running on another device in your tailnet.

#### Expose metrics to other networks

You can make the web interface available through another network interface on your machine by running the [`tailscale web`][docs-cli-web] command. For example, if you have a local interface with an IP address `203.0.113.5`, running `tailscale web --readonly --listen 203.0.113.5:8080`  makes metrics accessible at `http://203.0.113.5:8080/metrics`.

> **Note:**
>
> The `tailscale web --readonly` command starts a separate server that listens only on the provided IP address and port number. It does not expose metrics over a Tailscale IP address.

### Command line

To use metrics in a script or to inspect them in the [Tailscale CLI][docs-cli] command:

```shell
tailscale metrics print
```

#### Write metrics to a file

You can use the `tailscale metrics write` command to write metric values to a text file provided as its only argument. You can use this alongside [Prometheus node exporter][xt-node-exporter] to let the [textfile collector][xt-node-exporter-textfile] consume and export Tailscale client metrics.

For example:

```shell
tailscale metrics write /var/lib/prometheus/node-exporter/tailscaled.prom
```

[docs-access-control]: /docs/features/access-control

[docs-cli]: /docs/reference/tailscale-cli

[docs-cli-metrics]: /docs/reference/tailscale-cli#metrics

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-cli-status]: /docs/reference/tailscale-cli#status

[docs-cli-web]: /docs/reference/tailscale-cli#web

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-web-interface]: /docs/features/client/device-web-interface

[docs-grafana]: /docs/integrations/grafana

[docs-peer-relays]: /docs/features/peer-relay

[docs-subnet-route-approval]: /docs/features/subnet-routers#enable-subnet-routes-from-the-admin-console

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-tailscale-subnet-router]: /docs/features/subnet-routers

[docs-what-is-quad100]: /docs/reference/quad100

[xt-node-exporter]: https://github.com/prometheus/node_exporter

[xt-node-exporter-textfile]: https://github.com/prometheus/node_exporter#textfile-collector

[xt-prometheus]: https://prometheus.io/
