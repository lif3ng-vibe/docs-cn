---
title: "Performance best practices"
description: "Tailscale continuously seeks ways to improve performance, such as [making significant changes to `wireguard-go`][bl-throughput-improvements] (the userspace WireGuard implementation that Tailscale uses"
---

Last validated Dec 4, 2025

Tailscale continuously seeks ways to improve performance, such as [making significant changes to `wireguard-go`][bl-throughput-improvements] (the userspace WireGuard implementation that Tailscale uses) and taking advantage of the [transport layer offload engine][xt-tcp-offload-engine] to push Tailscale to [10Gb/s and beyond][bl-more-throughput].

In most cases, Tailscale delivers the best possible performance without additional configuration or customization. But there are some situations in which you can use best practices to achieve the highest performance. The following sections offer best practices for getting the most out of Tailscale in various environments, operating systems, and modes of operation ([exit nodes][docs-exit-nodes], [subnet routers][docs-subnets], and the like).

## Direct connections

Tailscale uses [direct and relayed connections][docs-connection-types], opting for direct connections when possible. Direct connections nearly always result in lower latency and higher throughput.

To increase the likelihood of a direct connection, you can:

* Expose a public IP address for your tailnet devices.
* [Open a firewall port][docs-firewall-ports] when necessary.
* Use the [device connectivity guide][docs-device-connectivity] to troubleshoot why a device might be using a relayed connection.

> **Tip:**
>
> You can also set up one or more [Tailscale Peer Relay servers][docs-peer-relays] in your tailnet. These are devices in your own infrastructure that Tailscale clients can use to connect to each other when a direct connection isn't possible. Peer relay servers are usually faster than DERP relay servers.

## Operating system recommendations

Use a recent version of your preferred operating system because it typically offers the most recent software and hardware optimizations. For example, using [Linux kernel version 6.2 or later][xt-linux-kernel-releases] provides the best performance by enabling Tailscale to use the latest kernel features.

### Linux optimizations for subnet routers and exit nodes

Tailscale version 1.54 or later used with a Linux 6.2 or later kernel enables UDP throughput improvements using [transport layer offloads][xt-kernel-segmentation-offloads]. If a Linux device is acting as an exit node or subnet router, make sure the following network device configuration is in place for the best results:

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

These commands look up the IPv4 and IPv6 routes to the internet to determine the network device each route uses, such as `eth0`. The `awk` command finds the device name that follows `dev` in each route. The `sort -u` command removes duplicates so a network device that carries both IPv4 and IPv6 traffic is only configured once. Then `ethtool` turns `rx-udp-gro-forwarding` on and `rx-gro-list` off for each network device. If there's no IPv4 or IPv6 route, the commands skip it.

> **Note:**
>
> `8.8.8.8` and `2001:4860:4860::8888` are the IPv4 and IPv6 addresses for Google Public DNS. The commands use them as well-known internet addresses.

By default, changes made using the `ethtool` command don't persist after a reboot. To make them persist, follow the steps for the network service your device uses.

> **Note:**
>
> If both `networkd-dispatcher` and `NetworkManager` are enabled, only follow the `NetworkManager` steps. If neither is enabled, you may need to consider a "oneshot" `systemd` service.

#### `networkd-dispatcher`

Some Linux distributions use `networkd-dispatcher`. Check with the following command:

```shell
systemctl is-enabled networkd-dispatcher
```

Run the following commands to create a script that configures these settings each time the network connects:

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

Run the following commands to test that the script runs successfully:

```shell
sudo /etc/networkd-dispatcher/routable.d/50-tailscale
test $? -eq 0 || echo 'An error occurred.'
```

#### `NetworkManager`

Distributions such as Raspberry Pi OS (Bookworm and later), Fedora, and Red Hat Enterprise Linux use `NetworkManager` by default. Check with the following command:

```shell
systemctl is-enabled NetworkManager
```

Run the following commands to save these settings in the `NetworkManager` connection profile for each network device, so the settings persist after a reboot:

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

## Machine sizing recommendations

For best performance, use the most recent generation of CPU architecture available to you. In general, higher CPU clock speed is more important than more cores.

### Provider-specific recommendations

Refer to the following for provider-specific sizing recommendations:

* [Amazon Elastic Compute Cloud (EC2) instance sizing][docs-aws-recommended-instance-sizing]
* [Google Compute Engine (GCE) sizing][docs-gce-recommended-instance-sizing]
* [Microsoft Azure virtual machine sizing][docs-azure-recommended-vm-sizing]

#### AWS single-flow bandwidth limitation

\[Missing snippet: aws\_single\_flow\_bandwidth\_limitation.mdx]

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
