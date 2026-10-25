---
title: "性能最佳实践"
description: "Tailscale 一直在寻求提升性能的方法，例如[对 `wireguard-go`（Tailscale 所使用的用户态 WireGuard 实现）做出重大改进][bl-throughput-improvements]，以及利用传输层卸载引擎"
---

最后验证于 Dec 4, 2025

Tailscale 一直在寻求提升性能的方法，例如[对 `wireguard-go` 做出重大改进][bl-throughput-improvements]（这是 Tailscale 所使用的用户态 WireGuard 实现），以及利用[传输层卸载引擎][xt-tcp-offload-engine]将 Tailscale 推向 [10Gb/s 甚至更高][bl-more-throughput]。

在大多数情况下，Tailscale 无需额外配置或定制即可提供尽可能好的性能。但在某些情况下，你可以借助最佳实践来达到最高性能。以下各节介绍了在各种环境、操作系统与运行模式（[出口节点][docs-exit-nodes]、[子网路由器][docs-subnets]等）下充分利用 Tailscale 的最佳实践。

## 直连

Tailscale 使用[直连与中继连接][docs-connection-types]，并尽可能选择直连。直连几乎总能带来更低的延迟和更高的吞吐量。

要提高直连的可能性，你可以：

* 为 tailnet 设备暴露一个公网 IP 地址。
* 必要时[开放防火墙端口][docs-firewall-ports]。
* 使用[设备连接指南][docs-device-connectivity]排查设备为何可能正在使用中继连接。

> **提示：**
>
> 你还可以在 tailnet 中设置一台或多台 [Tailscale Peer Relay 服务器][docs-peer-relays]。这类服务器位于你自己的基础设施中，当无法直连时，Tailscale 客户端可以借助它们相互连接。对等中继服务器通常比 DERP 中继服务器更快。

## 操作系统建议

请使用你惯用操作系统的较新版本，因为较新版本通常包含最新的软件与硬件优化。例如，使用 [Linux 内核 6.2 或更高版本][xt-linux-kernel-releases]可以让 Tailscale 使用最新的内核特性，从而获得最佳性能。

### 针对子网路由器和出口节点的 Linux 优化

Tailscale 1.54 或更高版本搭配 Linux 6.2 或更高版本内核，可以通过[传输层卸载][xt-kernel-segmentation-offloads]提升 UDP 吞吐量。如果某台 Linux 设备正充当出口节点或子网路由器，请确保完成以下网络设备配置以获得最佳效果：

```shell
NETDEVS=$(
  (ip -4 -o route get 8.8.8.8; ip -6 -o route get 2001:4860:4860::8888) 2>/dev/null |
    awk '{for (i = 1; i < NF; i++) if ($i == "dev") print $(i + 1)}' |
    sort -u
)
for NETDEV in $NETDEVS; do
  sudo ethtool -K "$NETDEV" rx-udp-gro-forwarding on rx-gro-list off
done
```

这些命令会查询通往互联网的 IPv4 与 IPv6 路由，以确定每条路由所使用的网络设备（例如 `eth0`）。`awk` 命令找出每条路由中 `dev` 之后的设备名。`sort -u` 命令去除重复项，这样同时承载 IPv4 与 IPv6 流量的网络设备只会被配置一次。随后 `ethtool` 为每个网络设备开启 `rx-udp-gro-forwarding` 并关闭 `rx-gro-list`。如果不存在 IPv4 或 IPv6 路由，命令会跳过对应部分。

> **注意：**
>
> `8.8.8.8` 和 `2001:4860:4860::8888` 分别是 Google Public DNS 的 IPv4 和 IPv6 地址。这些命令把它们当作众所周知的互联网地址来使用。

默认情况下，使用 `ethtool` 命令所做的更改在重启后不会保留。要让更改持久生效，请按照你的设备所使用的网络服务执行相应步骤。

> **注意：**
>
> 如果 `networkd-dispatcher` 和 `NetworkManager` 都已启用，只需按照 `NetworkManager` 的步骤操作。如果两者都未启用，你可能需要考虑创建一个 "oneshot" 型的 `systemd` 服务。

#### `networkd-dispatcher`

有些 Linux 发行版使用 `networkd-dispatcher`。可用以下命令检查：

```shell
systemctl is-enabled networkd-dispatcher
```

运行以下命令创建一个脚本，以便每次网络连接时都配置这些设置：

```shell
NETDEVS=$(
  (ip -4 -o route get 8.8.8.8; ip -6 -o route get 2001:4860:4860::8888) 2>/dev/null |
    awk '{for (i = 1; i < NF; i++) if ($i == "dev") print $(i + 1)}' |
    sort -u
)
if [ -n "$NETDEVS" ]; then
  {
    printf '#!/bin/sh\n\n'
    printf 'ethtool -K %s rx-udp-gro-forwarding on rx-gro-list off\n' $NETDEVS
  } | sudo tee /etc/networkd-dispatcher/routable.d/50-tailscale
  sudo chmod 755 /etc/networkd-dispatcher/routable.d/50-tailscale
else
  echo 'No network devices found.'
fi
```

运行以下命令测试脚本能否成功运行：

```shell
sudo /etc/networkd-dispatcher/routable.d/50-tailscale
test $? -eq 0 || echo 'An error occurred.'
```

#### `NetworkManager`

Raspberry Pi OS（Bookworm 及更高版本）、Fedora 和 Red Hat Enterprise Linux 等发行版默认使用 `NetworkManager`。可用以下命令检查：

```shell
systemctl is-enabled NetworkManager
```

运行以下命令，把这些设置保存到每个网络设备的 `NetworkManager` 连接配置文件中，使设置在重启后依然生效：

```shell
NETDEVS=$(
  (ip -4 -o route get 8.8.8.8; ip -6 -o route get 2001:4860:4860::8888) 2>/dev/null |
    awk '{for (i = 1; i < NF; i++) if ($i == "dev") print $(i + 1)}' |
    sort -u
)
if [ -n "$NETDEVS" ]; then
  for NETDEV in $NETDEVS; do
    CONNECTION_UUID=$(nmcli -g GENERAL.CON-UUID device show "$NETDEV") || continue
    case "$CONNECTION_UUID" in
      "" | "--")
        echo "$NETDEV has no active NetworkManager connection."
        continue
        ;;
    esac
    sudo nmcli connection modify uuid "$CONNECTION_UUID" \
      ethtool.feature-rx-udp-gro-forwarding on \
      ethtool.feature-rx-gro-list off &&
      sudo ethtool -K "$NETDEV" rx-udp-gro-forwarding on rx-gro-list off
  done
else
  echo 'No network devices found.'
fi
```

## 机器规格建议

为获得最佳性能，请使用你所能获得的最新一代 CPU 架构。总体而言，更高的 CPU 主频比更多的核心数更重要。

### 各提供商的规格建议

各云提供商的规格建议请参阅：

* [Amazon Elastic Compute Cloud (EC2) 实例规格][docs-aws-recommended-instance-sizing]
* [Google Compute Engine (GCE) 规格][docs-gce-recommended-instance-sizing]
* [Microsoft Azure 虚拟机规格][docs-azure-recommended-vm-sizing]

#### AWS 单流带宽限制

\[缺失片段：aws\_single\_flow\_bandwidth\_limitation.mdx]

[bl-more-throughput]: https://tailscale.com/blog/more-throughput

[bl-throughput-improvements]: https://tailscale.com/blog/throughput-improvements

[docs-aws-recommended-instance-sizing]: /docs/reference/reference-architectures/aws#recommended-instance-sizing

[docs-azure-recommended-vm-sizing]: /docs/reference/reference-architectures/azure#recommended-vm-sizing

[docs-connection-types]: /docs/reference/connection-types

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-gce-recommended-instance-sizing]: /docs/reference/reference-architectures/gcp#recommended-instance-sizing

[docs-peer-relays]: /docs/features/peer-relay

[docs-subnets]: /docs/features/subnet-routers

[xt-kernel-segmentation-offloads]: https://www.kernel.org/doc/html/latest/networking/segmentation-offloads.html

[xt-linux-kernel-releases]: https://www.kernel.org/category/releases.html

[xt-tcp-offload-engine]: https://en.wikipedia.org/wiki/TCP_offload_engine
