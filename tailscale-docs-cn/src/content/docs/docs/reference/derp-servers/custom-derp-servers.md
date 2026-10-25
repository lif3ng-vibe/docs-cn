---
title: "自定义 DERP 服务器"
description: "自定义 DERP 服务器是由 Tailscale 之外的组织或个人为满足特定组网需求而搭建和管理的指定 [DERP 服务器][docs-derp-servers]。默认情况下，所有 Tailscale 网络（即 tailnet）都使用 Tailscale 运营的 DERP 服务器。"
---

最后验证于 Oct 7, 2026

> **注意：** 自定义 DERP 服务器目前处于 alpha 阶段。

自定义 DERP 服务器是由 Tailscale 之外的组织或个人为满足特定组网需求而搭建和管理的指定 [DERP 服务器][docs-derp-servers]。默认情况下，所有 Tailscale 网络（即 tailnet）都使用 Tailscale 运营的 DERP 服务器。DERP 服务器主要起辅助作用，促成 Tailscale 网络（即 [tailnet][docs-tailnet]）中设备之间的连接。但在[直连][docs-connection-types]无法建立且[对等中继][docs-peer-relays]不可用时，它们也充当回退机制。

在大多数情况下，无需运行自定义 DERP 服务器。DERP 服务器通常只充当 tailnet 中设备之间的连接纽带（对设备间交换的数据不可见）。

不过，在一些受限的网络环境中，设备由于无法与其他设备建立直连，更有可能使用 DERP 服务器。由于 DERP 中继连接比直连慢，你可能遇到较差的性能。如果你经常遇到 DERP 中继连接并希望避免性能问题，通常更好的做法是[查明无法建立直连的原因][docs-troubleshoot-connectivity]，或架设对等中继，而不是部署自定义 DERP 服务器。

[Tailscale Peer Relay][docs-peer-relays]：

* 在你自己的网络或基础设施内运行，比 DERP 服务器延迟更低、性能更好。
* 不产生经 DERP 服务器出站数据传输的额外费用（针对云环境）。
* 免去维护自定义 DERP 服务器的开销与限制。

尽管如此，在少数情况下运行自定义 DERP 服务器可能仍有意义。例如，为了[按照公司策略限制加密流量的路由去向][ar-policy-compliance]，你可能会运行自定义 DERP 服务器。

## 限制

在大多数情况下，无需运行自定义 DERP 服务器。但在少数情况下运行自定义 DERP 服务器是有意义的。为此，你需要构建、部署并更新 `cmd/derper` 二进制文件。

运行自定义 DERP 服务器是一项高级操作，需要你投入大量资源来搭建和维护。此外，运行自定义 DERP 服务器还有以下注意事项：

* 自定义 DERP 服务器不支持设备共享或其他跨 tailnet 功能。
* 自定义 DERP 服务器与普通 DERP 服务器一样，对设备间交换的数据不可见，因为数据是加密的。因此，DERP 服务器对网络级调试没有帮助。
* 自定义 DERP 服务器无法受益于 Tailscale 控制平面的某些优化。
* 自定义 DERP 服务器[无法在防火墙或负载均衡器之后工作][ar-direct-internet-access]。
* [Mullvad 出口节点][docs-mullvad-exit-nodes]与自定义 DERP 服务器不兼容。
* [区域路由][docs-regional-routing]与自定义 DERP 服务器不兼容。MagicRoute 支持自定义 DERP 服务器。详情请参阅[路由选择][docs-route-selection]。

## 要求

自定义 DERP 服务器必须[能直接访问互联网][ar-direct-internet-access]、[允许 ICMP 流量][ar-icmp-traffic]，并[开放 HTTP、HTTPS 和 STUN 端口][ar-required-ports]。

### 直接的互联网访问

DERP 服务器需要直接的互联网连接，且不得位于 NAT 设备（如防火墙）或负载均衡器之后。这项直连要求出于两个关键原因：[设备识别][ar-device-identification]和[协议兼容性][ar-protocol-compatibility]。

#### 设备识别

DERP 服务器通过检查传入流量的源地址来识别 tailnet 设备。当流量经过 NAT 或负载均衡器时，原始源地址会被修改，这一关键功能就会失效。

#### 协议兼容性

Tailscale 客户端使用 HTTP upgrade 协议建立双向数据通道。大多数云负载均衡系统不支持该协议，因此与 DERP 服务器的运行不兼容。

> **注意：**
>
> 运行你自己的 DERP 服务器是一项高级操作，需要你投入大量资源来搭建和维护。

### 所需端口

DERP 服务器必须开放以下端口，才能运行 HTTP 服务器、HTTPS 服务器和 [STUN][xt-wikipedia-stun] 服务器。这三个服务的端口需要对来自互联网的流量开放，这样 tailnet 中的用户才能从家中或咖啡馆等地访问它们。

| **服务器** | **端口** |
| :--------- | :------- |
| HTTP       | `80`     |
| HTTPS      | `443`    |
| STUN       | `3478`   |

要为 HTTPS 和 STUN 使用其他端口号，请分别设置 [`DERPNode.DERPPort`][xt-go-tailscale-derpport] 或 [`DERPNode.STUNPort`][xt-go-tailscale-derpnode-stun]。HTTP 不能使用自定义端口号。

### ICMP 流量

DERP 服务器必须允许入站和出站的 ICMP（Internet Control Message Protocol）流量。

Tailscale 运行 [DERP 中继服务器][docs-derp-servers]来帮助连接你的节点。通常你无需自定义 Tailscale 的 DERP 服务器，但确实可以这样做。

## 开始使用自定义 DERP 服务器

> **警告：**
>
> 运行你自己的 DERP 服务器是一项高级操作，需要你投入大量资源来搭建和维护。在继续之前，请先权衡[要求][ar-requirements]与[限制][ar-limitations]。

要搭建自定义 DERP 服务器，你需要：

1. 从源码运行 DERP 服务器。
2. 将 DERP 服务器添加到你的 tailnet。

以下附加步骤为可选项：

1. 限制 tailnet 设备对你自定义 DERP 服务器的访问。
2. 从你的 tailnet 中移除 Tailscale 的默认 DERP 服务器。

### 从源码运行 DERP 服务器

要运行你自己的 DERP 服务器，必须从源码构建。使用[最新版 Go][xt-go-install]，运行：

```shell
go install tailscale.com/cmd/derper@latest
```

……将最新的 DERP 服务器安装到 `$HOME/go/bin`。

在运行二进制文件之前，你需要一个指向你服务器的域名。备好域名和二进制文件后，运行以下命令在你的域名上启动 DERP 服务器：

```shell
sudo derper --hostname=example.com
```

这会启动暴露在 443 端口、可通过你的域名访问的 DERP 服务器。然后，你就可以按第 2 步的说明把该 DERP 服务器添加到你的 tailnet。

> **警告：**
>
> 为保持与 Tailscale 客户端更新的兼容，你可能需要定期通过 `go install tailscale.com/cmd/derper@latest` 重新构建源码来更新 DERP 服务器。

### 将自定义 DERP 服务器添加到你的 tailnet

如果你发现 Tailscale 在你所在区域没有提供 DERP 服务器，或因其他原因无法使用提供的 DERP，你可以在 tailnet 的[策略 JSON][docs-policy-syntax] 中指定它们来扩充或修改 DERP 服务器集合，即将 `derpMap` 键设为 [`DERPMap`][xt-go-tailscale-derpmap] 类型的值。

每个区域都有唯一的区域 ID。区域 ID 值 `900` 到 `999` 保留用作自定义的用户指定区域，Tailscale 不会使用它们。

例如，以下配置启用了主机名为 `example.com` 的自定义 DERP 服务器。更多选项请参阅 [`DERPRegion`][xt-go-tailscale-derpregion] 和 [`DERPNode`][xt-go-tailscale-derpnode] 的定义。

```json
{
  // ... other parts of tailnet policy file
  "derpMap": {
    "Regions": {
      "900": {
        "RegionID": 900,
        "RegionCode": "myderp",
        "Nodes": [
          {
            "Name": "1",
            "RegionID": 900,
            "HostName": "example.com",
            // IPv4 and IPv6 are optional, but recommended, to reduce
            // potential DERP connectivity issues if DNS is unavailable
            // or having issues. Addresses must be publicly routable
            // and not in private IP ranges.
            "IPv4": "203.0.113.15",
            "IPv6": "2001:db8::1"
          }
        ]
      }
    }
  }
}
```

每个区域只能有一台 DERP 服务器。如果想要 DERP 冗余，请使用多个区域，且每个区域只放一台 DERP 服务器。

### （可选）移除 Tailscale 的 DERP 服务器

出于[合规][ar-policy-compliance]等各种原因，你可能不希望流量经过特定的 DERP 区域。你可以在 tailnet 策略文件中创建自定义 DERP 地图，移除 tailnet 中设备可用的 DERP 区域。要排除某个区域，将其值设为 `null` 即可。设为 `null` 后，tailnet 中的设备将无法连接到该区域的 DERP 服务器。

例如，以下 DERP 地图配置禁用了流量经过纽约 Tailscale DERP 区域（区域 ID 为 `1`）：

```json
{
  // ... other parts of tailnet policy file
  "derpMap": { "Regions": { "1": null } }
}
```

你可以从 `https://controlplane.tailscale.com/derpmap/default` 获取 Tailscale 的默认 DERP 地图：

```shell
curl https://controlplane.tailscale.com/derpmap/default
```

如果你安装了 `jq`，可以用以下命令列出 Tailscale 的默认 DERP 区域及其 ID：

```shell
curl --silent https://controlplane.tailscale.com/derpmap/default | jq -r '.Regions[] | "\(.RegionID) \(.RegionName)"'
```

为确保你的流量只经过你的自定义 DERP 服务器，可在 DERP 地图中将 `OmitDefaultRegions` 标志设为 `true`，从而移除 Tailscale 的所有默认 DERP 区域：

```json
{
  // ... other parts of tailnet policy file
  "derpMap": {
    "OmitDefaultRegions": true,
    "Regions": {
      "900": {
        "RegionID": 900,
        "RegionCode": "myderp",
        "Nodes": [
          {
            "Name": "1",
            "RegionID": 900,
            "HostName": "example.com",
            // IPv4 and IPv6 are optional, but recommended, to reduce
            // potential DERP connectivity issues if DNS is unavailable
            // or having issues. Addresses must be publicly routable
            // and not in private IP ranges.
            "IPv4": "203.0.113.15",
            "IPv6": "2001:db8::1"
          }
        ]
      }
    }
  }
}
```

DERP 地图的完整选项集请查看源代码中的 [`DERPMap` 定义][xt-go-tailscale-derpmap]。

### （可选）验证发往自定义 DERP 服务器的客户端流量

任何知道你 DERP 服务器 IP 地址的人都可以把它加入自己的 DERP 地图，让其 tailnet 流量经由你的 DERP 服务器中转。要只允许你的 tailnet 流量通过你的 DERP 服务器，请在与 DERP 服务器相同的设备上运行 `tailscaled`，并带 `--verify-clients` 标志启动 `derper`：

```shell
sudo derper --hostname=example.com --verify-clients
```

## 监控自定义 DERP 服务器

使用 [`cmd/derpprobe`][xt-gh-tailscale-cmd-derpprobe] 二进制文件监控你的自定义 DERP 服务器并验证其工作正常。你需要指定一个 `--derp-map=file://` URL，指向一份包含待监控 DERP 地图的 JSON 文档。

## 策略合规

托管自定义 DERP 服务器的一个原因是为了确保策略合规。例如，你可能有严格的政策要求，禁止流量经过公共服务器，即使流量是加密的。

DERP 服务器只转发加密流量，无法接触明文流量。此外，Tailscale 的 DERP 服务器是所有 Tailscale 客户共享的资源。你可能持有严格的路由策略，例如禁止加密流量经过你无法控制的服务器。

为遵守这类策略，你可以运行一台或多台自定义 DERP 服务器，并从 tailnet 可用的 DERP 服务器列表中移除 Tailscale 的默认 DERP 服务器。

[ar-device-identification]: #设备识别

[ar-direct-internet-access]: #直接的互联网访问

[ar-icmp-traffic]: #icmp-流量

[ar-limitations]: #限制

[ar-policy-compliance]: #策略合规

[ar-protocol-compatibility]: #协议兼容性

[ar-required-ports]: #所需端口

[ar-requirements]: #要求

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes

[docs-peer-relays]: /docs/features/peer-relay

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-regional-routing]: /docs/features/route-selection#区域路由

[docs-route-selection]: /docs/features/route-selection

[docs-tailnet]: /docs/concepts/tailnet

[docs-troubleshoot-connectivity]: /docs/reference/troubleshooting/connectivity

[xt-gh-tailscale-cmd-derpprobe]: https://github.com/tailscale/tailscale/tree/main/cmd/derpprobe

[xt-go-install]: https://golang.org/doc/install

[xt-go-tailscale-derpmap]: https://pkg.go.dev/tailscale.com/tailcfg#DERPMap

[xt-go-tailscale-derpnode]: https://pkg.go.dev/tailscale.com/tailcfg#DERPNode

[xt-go-tailscale-derpnode-stun]: https://pkg.go.dev/tailscale.com/tailcfg#DERPNode.STUNPort

[xt-go-tailscale-derpport]: https://pkg.go.dev/tailscale.com/tailcfg#DERPNode.DERPPort

[xt-go-tailscale-derpregion]: https://pkg.go.dev/tailscale.com/tailcfg#DERPRegion

[xt-wikipedia-stun]: https://en.wikipedia.org/wiki/STUN
