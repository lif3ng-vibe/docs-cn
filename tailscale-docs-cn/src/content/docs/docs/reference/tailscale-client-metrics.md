---
title: "Tailscale 客户端指标"
description: "从 Tailscale 客户端收集指标。"
---

最后验证于 Jul 28, 2026

你可以暴露并收集 Tailscale 客户端指标，供 [Prometheus][xt-prometheus] 或 [Grafana][docs-grafana] 等监控系统使用，监控你的 Tailscale 网络（即 tailnet）。这些指标可以反映客户端的行为、健康状况和性能。例如，你可以监控客户端到 tailnet 中所配置[子网路由器][docs-tailscale-subnet-router]的连接信息。

> **注意：**
>
> Tailscale 客户端指标在 Tailscale v1.78.0 及更高版本中受支持。

## 可用指标

你可以从 tailnet 中的 Tailscale 客户端收集以下指标：

### 子网路由器

使用本节中的指标收集与子网路由相关的 Tailscale 客户端信息。

`tailscaled_advertised_routes`

* 指标类型为 `gauge`。
* 显示客户端通告的路由数量。
* 包括未获批准的路由。
* 不包括出口节点。

`tailscaled_approved_routes`

* 指标类型为 `gauge`。
* 显示已获管理员[批准][docs-subnet-route-approval]的已通告路由数量。

### 对等中继服务器

使用本节中的指标收集本地[对等中继][docs-peer-relays]实例的相关信息。

`tailscaled_peer_relay_forwarded_packets_total`

* 指标类型为 `counter`。
* 显示本地对等中继实例转发的数据包数量。
* 标签：
  * `transport_in`：入站数据包使用的传输协议。可能值为 `udp4`（IPv4 上的 UDP）和 `udp6`（IPv6 上的 UDP）。
  * `transport_out`：出站数据包使用的传输协议。可能值为 `udp4`（IPv4 上的 UDP）和 `udp6`（IPv6 上的 UDP）。

`tailscaled_peer_relay_forwarded_bytes_total`

* 指标类型为 `counter`。
* 显示本地对等中继实例转发的字节数。
* 标签：
  * `transport_in`：入站数据包使用的传输协议。可能值为 `udp4`（IPv4 上的 UDP）和 `udp6`（IPv6 上的 UDP）。
  * `transport_out`：出站数据包使用的传输协议。可能值为 `udp4`（IPv4 上的 UDP）和 `udp6`（IPv6 上的 UDP）。

`tailscaled_peer_relay_endpoints`

* 指标类型为 `gauge`。
* 显示本地对等中继实例当前服务的端点（隧道）数量。
* 标签：
  * `state`：端点状态。可能值为 `connecting`（一个或两个对端正在协商连接）和 `open`（端点可以转发流量）。

### 健康

使用本节中的指标收集与健康状况相关的 Tailscale 客户端信息。

`tailscaled_health_messages`

* 指标类型为 `gauge`。
* 显示 Tailscale 客户端当前报告的健康消息数量。
* 该指标带有 `type` 标签，报告健康消息的类型。例如 `warning`。

运行 [`tailscale status`][docs-cli-status] 可以收集健康消息的详细信息。

### DERP

使用本节中的指标收集与 [DERP 中继服务器][docs-derp-servers]相关的 Tailscale 客户端信息。

`tailscaled_home_derp_region_id`

* 指标类型为 `gauge`。
* 显示此节点主中继服务器的 [DERP 区域][docs-derp-servers] ID。

### Tailscale Services

使用本节中的指标收集 [Tailscale Service][docs-tailscale-services] 主机上由 Tailscale Serve 处理的连接的每服务吞吐量。这些指标在 Tailscale v1.102.0 及更高版本中可用。

`tailscaled_serve_inbound_bytes_total`

* 指标类型为 `counter`。
* 显示 Tailscale Services 的 Serve 连接上从对端接收的字节数。

`tailscaled_serve_outbound_bytes_total`

* 指标类型为 `counter`。
* 显示 Tailscale Services 的 Serve 连接上发送到对端的字节数。

两个指标都带有 `service` 标签，值为完整的 Tailscale Service 名称（含 `svc:` 前缀），例如 `svc:my-app`。这些指标不包含基于设备的 Serve、Funnel 或第 3 层（TUN 模式）Tailscale Services 的流量。

### 吞吐量

使用本节中的指标收集与吞吐量相关的 Tailscale 客户端信息。

`tailscaled_inbound_packets_total`

* 指标类型为 `counter`。
* 显示节点从其他对端接收的数据包数量。

`tailscaled_inbound_bytes_total`

* 指标类型为 `counter`。
* 显示节点从其他对端接收的字节数。

`tailscaled_outbound_packets_total`

* 指标类型为 `counter`。
* 显示设备发送给其他对端的数据包数量。

`tailscaled_outbound_bytes_total`

* 指标类型为 `counter`。
* 显示节点发送给其他对端的字节数。

所有吞吐量指标都带有 `path` 标签，表示数据包所走的[连接类型][docs-connection-types]。`path` 标签可以是以下值之一：

* `direct_ipv4`：直接通过 IPv4 发送或接收的数据包。
* `direct_ipv6`：直接通过 IPv6 发送或接收的数据包。
* `derp`：通过 [DERP 中继][docs-derp-servers]发送或接收的数据包。
* `peer_relay_ipv4`：通过 IPv4 上的 [Tailscale 对等中继][docs-peer-relays]发送或接收的数据包。
* `peer_relay_ipv6`：通过 IPv6 上的 [Tailscale 对等中继][docs-peer-relays]发送或接收的数据包。

### 丢包

使用本节中的指标收集与丢包相关的 Tailscale 客户端信息。

`tailscaled_inbound_dropped_packets_total`

* 指标类型为 `counter`。
* 显示从其他对端接收后被丢弃的数据包数量。

`tailscaled_outbound_dropped_packets_total`

* 指标类型为 `counter`。
* 显示发送给其他对端时被丢弃的数据包数量。

`tailscaled_inbound_dropped_packets_total` 和 `tailscaled_outbound_dropped_packets_total` 两个指标都带有 `reason` 标签，取以下值之一：

* `acl`：被 [Tailscale 访问控制][docs-access-control]丢弃的数据包。
* `multicast`：因为是组播而被丢弃的数据包。
* `link_local_unicast`：因为是链路本地单播而被丢弃的数据包。
* `too_short`：因为过短而被丢弃的数据包。
* `fragment`：因为是 IP 分片而被丢弃的数据包。
* `unknown_protocol`：因为协议未知而被丢弃的数据包。
* `error`：因错误而被丢弃的数据包。

## 收集指标

你可以通过 Tailscale [网页界面][docs-device-web-interface]或 [Tailscale CLI][docs-cli-metrics]收集 Tailscale 指标。

### 网页界面

Tailscale [网页界面][docs-device-web-interface]在常规的 `/metrics` 路径上暴露客户端指标。

#### 本地访问指标

每个客户端都通过 [`http://100.100.100.100/metrics`][docs-what-is-quad100] URL 在本地暴露指标。当监控服务器（或代理）与 Tailscale 客户端运行在同一主机上时，可以使用该 URL。

#### 通过 Tailscale 收集指标

要通过 tailnet 收集指标，你必须：

* 在每台计划暴露指标的设备上，使用 [`tailscale set --webclient`][docs-cli-set] 命令启用 Tailscale [网页界面][docs-device-web-interface]。
* 在 [tailnet 策略文件][docs-tailnet-policy-file]中，授予你的监控服务器访问每台设备 `5252` 端口的权限。

当监控服务器运行在 tailnet 中的另一台设备上时，我们建议使用此方法。

#### 向其他网络暴露指标

你可以通过运行 [`tailscale web`][docs-cli-web] 命令，让网页界面通过机器上的另一个网络接口可用。例如，如果你有一个 IP 地址为 `203.0.113.5` 的本地接口，运行 `tailscale web --readonly --listen 203.0.113.5:8080` 即可让指标通过 `http://203.0.113.5:8080/metrics` 访问。

> **注意：**
>
> `tailscale web --readonly` 命令会启动一个单独的服务器，只监听所提供的 IP 地址和端口。它不会通过 Tailscale IP 地址暴露指标。

### 命令行

要在脚本中使用指标，或在 [Tailscale CLI][docs-cli] 中查看指标：

```shell
tailscale metrics print
```

#### 把指标写入文件

你可以使用 `tailscale metrics write` 命令把指标值写入一个文本文件（作为其唯一参数）。你可以配合 [Prometheus node exporter][xt-node-exporter] 使用，让 [textfile collector][xt-node-exporter-textfile] 消费并导出 Tailscale 客户端指标。

例如：

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
