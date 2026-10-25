---
title: "Tailscale Peer Relay"
description: "在无法建立直连时，使用 Tailscale Peer Relay 实现客户端到客户端的连接。"
---

最后验证于 Feb 4, 2026

Tailscale Peer Relay 让你在因[严格 NAT 环境][docs-device-connectivity]等网络条件而无法建立[直连][docs-connection-types]时，把 Tailscale 网络（即 [tailnet][docs-tailnet]）中的设备用作高吞吐量中继服务器。

通常，当 Tailscale 无法在设备之间建立直连时，会依靠全球分布的 [DERP 服务器][docs-derp-servers]来中继流量。DERP 服务器虽能有效中继流量，但会引入额外延迟，对高吞吐量应用尤甚。当你把一台设备配置为对等中继（peer relay）后，同一 tailnet 中的其他设备就可以在无法直连时，用它来中继客户端到客户端的连接流量。Tailscale 会先尝试使用 tailnet 中任何可用的对等中继，回退无果时才改用 DERP 服务器。

> **注意：**
>
> 下面的相关视频提供了更多背景与示例。

[Peer Relays | Tailscale Explained（视频）](https://www.youtube.com/watch?v=wkBSjT1hO6k)

## 使用场景

当网络限制导致设备之间无法建立直连，而你需要比 DERP 服务器更低的延迟和更高的吞吐量时，对等中继尤其有用。常见场景包括：

* **访问受限基础设施**：访问严格 NAT 或防火墙之后、无法直连的设备，例如某些企业或云环境中的设备。
* **文件传输**：在设备之间传输大文件时，对等中继可提供更高吞吐量，加快传输过程。
* **媒体流传输**：在设备之间串流高清视频或音频时，对等中继有助于减少缓冲、保持流畅的播放体验。

> **注意：**
>
> 对等中继并非要取代 DERP 服务器。它是对 DERP 的补充，为 tailnet 内的流量中继提供了额外选择，尤其适合对延迟和吞吐量有更高要求的场合。DERP 服务器仍在协商连接、以及在对等中继不可用时提供回退中继等方面扮演关键角色。

## 工作原理

当你把一台设备配置为对等中继后，它会在指定的 UDP 端口上监听传入的中继流量。之后，tailnet 中的其他设备就能在无法直连时，用这台设备中继客户端到客户端的连接流量。

当一台设备尝试连接 tailnet 中的另一台设备时，会先检查能否直连。若不能，就查找 tailnet 中可用的对等中继。若有对等中继可用且可达，设备就通过对等中继建立连接；若没有任何可用对等中继，则回退为使用 DERP 服务器中继流量。

## 前提条件

在使用对等中继功能之前，请确保你的 Tailscale 账户以及想配置为对等中继的设备满足最低要求：

### 账户要求

要使用对等中继功能，你必须具备：

* 一个 Tailscale 账户，且有权访问你想在其中设置对等中继的 tailnet。
* tailnet 中至少有一台满足对等中继设备要求的设备。
* 拥有 [Owner（所有者）、Admin（管理员）或 Network admin（网络管理员）](/docs/reference/user-roles)权限的账户。

### 对等中继设备要求

一台设备必须满足以下要求才能充当对等中继：

* 设备运行受支持的操作系统。除 iOS、Apple TV 或 Android 外的任何操作系统均可使用。
* Tailscale 版本为 1.86 或更高。
* 具备足够的网络带宽和低延迟，能高效地为其他设备中继流量。
* 至少有一个可用于对等中继流量的可配置 UDP 端口。该端口必须能被 tailnet 中的其他设备访问。有关配置网络设置的更多信息，请参阅[安全与访问控制][ar-security-and-access-control]。

### 其他 tailnet 设备的要求

tailnet 中使用对等中继的设备必须满足以下要求：

* 能访问对等中继设备（通过适用的[访问控制策略][docs-access-control]）。
* Tailscale 版本为 1.86 或更高。
* 能访问对等中继设备上为对等中继流量配置的 UDP 端口。

使用对等中继的设备没有操作系统限制：它们可以运行任何受 Tailscale 支持的操作系统，包括 iOS 和 Apple TV。

## 开始使用

在 tailnet 中搭建对等中继功能主要分两步。首先，你需要把一台设备配置为对等中继；然后，你需要创建一条[授权策略][docs-grants]（grant），允许 tailnet 中的其他设备使用该对等中继。

### 第 1 步：将设备配置为对等中继

要使用对等中继功能获得更快的[中继连接][docs-connection-types]，你必须把 tailnet 中至少一台设备配置为对等中继。只有满足[对等中继设备要求][ar-peer-relay-device-requirements]且被你明确指定的设备才能充当对等中继。

将设备设置为对等中继的步骤：

1. 在想配置为对等中继的设备上，启动 Tailscale 客户端并完成对你 tailnet 的身份认证。
2. 在该设备上打开终端或命令提示符。
3. 使用 [`tailscale set`][docs-tailscale-cli-set] 命令加 `--relay-server-port` 选项，指定对等中继流量使用的 UDP 端口。例如，要把设备配置为使用 UDP 端口 `40000` 传输对等中继流量，运行以下命令：

   ```shell
   tailscale set --relay-server-port=40000
   ```

> **提示：**
>
> 你也可以在 `tailscale set` 命令中使用 `--relay-server-static-endpoints` 旗标，指定要向对等中继参与者通告的额外[静态端点][ar-static-endpoints]。

### 第 2 步：创建对等中继策略

在 tailnet 中的设备可以使用你指定为对等中继的设备之前，你需要创建一条允许这样做的[授权][docs-grants]策略。该授权策略使用 `tailscale.com/cap/relay` [应用能力][docs-grant-app-capabilities]来指定哪些设备可以使用对等中继功能。你可以通过管理控制台的 JSON 编辑器、[可视化策略编辑器][docs-visual-editor]或 [Tailscale API][docs-tailscale-api] 创建授权策略。

用 JSON 编辑器创建一条启用对等中继能力的授权：

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls/file) 页面。
2. 选择 **JSON editor** 标签页，用 JSON 更新 tailnet 策略文件。
3. 找到策略文件的 `grants` 部分。
4. 在策略文件的 `grants` 部分添加一条策略，指定 `src`（位于受限 NAT 之后、需要通过对等中继访问的设备）、`dst`（对等中继设备）以及 `peer-relay` 应用能力。例如，下面的示例允许所有带 `tag:us-east-vpc` 标签的设备使用带 `tag:us-east-relays` 标签的对等中继。

```json
{
  "grants": [
    {
      "src": ["tag:us-east-vpc"], // Devices that can be accessed through the peer relay
      "dst": ["tag:us-east-relays"], // Devices functioning as peer relays for the src devices
      "app": {
        "tailscale.com/cap/relay": [] // The relay capability doesn't require any parameters
      }
    }
  ]
}
```

> **注意：**
>
> 在访问规则的 `dst` 字段中，你可以用[标签][docs-tags]、主机名、[IP 集][docs-ipsets]（IP set）或 Tailscale IP 地址来引用对等中继设备。`app` 字段必须包含 `tailscale.com/cap/relay` 能力才能为指定设备启用对等中继功能，它不需要任何额外参数。

创建对等中继授权策略后，当无法直连时，tailnet 中的设备就能开始使用对等中继进行客户端到客户端的连接。当设备无法直连另一台设备时，会先查找 tailnet 中可用的对等中继；若没有可用的对等中继，则回退为使用 DERP 服务器。

> **警告：**
>
> 避免在授权策略的 `src` 字段使用过度宽松的目标（例如 `*`）。比如使用 `*` 会让 tailnet 中的所有设备都尝试使用 `dst` 中的对等中继设备，可能导致意料之外的流量路由和高延迟。请指定精确的设备[标签][docs-tags]、主机名或 [IP 集][docs-ipsets]，限制哪些设备可以使用对等中继。
>
> 根据经验，授权策略中的 `src` 设备通常应位于固定物理位置、处在阻止直连的严格 NAT 或防火墙之后，例如企业网络或云环境中的设备；通常不包括经常变换位置和网络环境的移动设备或笔记本电脑。

### 第 3 步：观察对等中继流量

产生一些流量来测试对等中继配置。然后使用 `tailscale status` 命令监控设备状态，验证它确实在充当对等中继。当 tailnet 设备使用对等中继时，该设备的连接类型会变为 `peer-relay`。

运行 [`tailscale status`][docs-tailscale-cli-status] 命令并过滤出 `peer-relay` 条目：

```shell
tailscale status | grep peer-relay
```

当设备正在使用对等中继时，返回的设备连接类型为 `peer-relay`（而不是 `direct` 或 `relay`）。例如：

```shell
<tailscale-ip-address> <hostname> <user> <os> active; peer-relay <ip-address>:<udp-port>:vni:<vni-id>, tx <bytes-sent> rx <bytes-received>
```

> **提示：**
>
> 你也可以使用 [`tailscale ping`][docs-tailscale-cli-ping] 命令测试设备之间的连通性，并观察连接是否使用了对等中继。

## 禁用对等中继

要对某台设备禁用对等中继，请使用 [`tailscale set`][docs-tailscale-cli-set] 命令，把 `--relay-server-port` 旗标设为空字符串：

```shell
tailscale set --relay-server-port=""
```

## 示例

适合使用 Tailscale Peer Relay 的示例场景包括：

* 使用位于特定地理区域的对等中继来访问该区域的设备，以降低延迟。
* 使用对等中继连接严格 NAT 或防火墙之后、无法直连的设备。
* 设置专用的对等中继设备，为特定应用或服务处理高吞吐量流量。

下面的对等中继策略示例展示了授权策略在不同场景下的样子。

### 使用带标签的对等中继设备

下面的示例允许所有带 `tag:us-east-vpc` 标签的设备在与 tailnet 中其他设备通信时，使用带 `tag:us-east-relays` 标签的对等中继设备作为底层网络中继。也就是说，tailnet 中的其他设备与带 `tag:us-east-vpc` 标签的设备通信时，可以把带 `tag:us-east-relays` 标签的设备用作底层网络中继。

```json
{
  "grants": [
    {
      "src": ["tag:us-east-vpc"], // Devices behind a restrictive NAT that need to be accessed through the peer relay
      "dst": ["tag:us-east-relays"], // The devices functioning as peer relays for the src devices
      "app": {
        "tailscale.com/cap/relay": []
      }
    }
  ]
}
```

要使其生效，你还必须用 `tailscale set` 命令[配置对等中继设备][ar-step-1]，并创建一条允许对带 `tag:us-east-vpc` 标签的设备进行 overlay 网络访问的授权访问控制策略。

例如，下面这条授权策略允许 tailnet 的所有成员通过 TCP 端口 80 和 443 访问带 `tag:us-east-vpc` 标签的设备。

```json
{
  "grants": [
    {
      "src": ["autogroup:member"],
      "dst": ["tag:us-east-vpc"],
      "ip": ["tcp:80","tcp:443"]
    }
  ]
}
```

### 将自身用作对等中继

设备可以把自身用作对等中继。下面的示例让主机名为 `us-west-1` 的设备把自身用作对等中继。当你需要封禁设备的所有入站端口、只保留对等中继流量所用 UDP 端口时，可以使用这种配置。

```json
{
  "grants": [
    {
      "src": ["us-west-1"],
      "dst": ["us-west-1"],
      "app": {
        "tailscale.com/cap/relay": []
      }
    }
  ]
}
```

要使其生效，你还必须用 `tailscale set` 加上对等中继流量的 UDP 端口，[将该设备配置为对等中继][ar-step-1]。

## 安全与访问控制

对等中继只能为同一 tailnet 中的设备中继流量。赋予 `tailscale.com/cap/relay` 能力的授权规则本身就是访问控制机制——没有该授权的设备无法在对等中继上分配中继绑定。你不需要对对等中继设备本身另建一条网络授权。

为对等中继流量配置的 UDP 端口必须开放，且能被 tailnet 中的其他设备访问。例如，如果你把对等中继配置为使用 UDP 端口 `40000`，请确保所有防火墙或网络安全设置都允许该端口的入站流量。

## 静态端点

你可以在 [`tailscale set`][docs-tailscale-cli-set] 命令中使用 `--relay-server-static-endpoints` 旗标，为对等中继指定一个或多个要向其他 tailnet 设备通告的额外静态端点。这在用户使用端口转发、或使用 AWS Network Load Balancer（[NLB][xt-aws-nlb]）这类负载均衡器的网络环境中很有用。在这些场景下，对等中继可能无法自动发现所有可能的端点，因为它无法通过所有可能的路径发送出站端点发现包。

该旗标接受以逗号分隔的 `ip:port` 对列表（或空字符串，表示不通告任何静态端点）。每个 `ip:port` 对对应一个对等中继向其他 tailnet 设备通告的额外端点。

```shell
tailscale set --relay-server-port=<port> --relay-server-static-endpoints="<ip-address-1>:<port>,<ip-address-2>:<port>"
```

例如，要配置对等中继通告两个额外的静态端点（`[2001:db8::1]:40000` 和 `192.0.2.2:40000`），运行以下命令：

```shell
tailscale set --relay-server-port=40000 --relay-server-static-endpoints="[2001:db8::1]:40000,192.0.2.2:40000"
```

[ar-peer-relay-device-requirements]: #对等中继设备要求

[ar-security-and-access-control]: #安全与访问控制

[ar-static-endpoints]: #静态端点

[ar-step-1]: #第-1-步将设备配置为对等中继

[docs-access-control]: /docs/features/access-control

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-grant-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants]: /docs/features/access-control/grants

[docs-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-tags]: /docs/features/tags

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-api]: /docs/reference/tailscale-api

[docs-tailscale-cli-ping]: /docs/reference/tailscale-cli#ping

[docs-tailscale-cli-set]: /docs/reference/tailscale-cli#set

[docs-tailscale-cli-status]: /docs/reference/tailscale-cli#status

[docs-visual-editor]: /docs/features/visual-editor

[xt-aws-nlb]: https://aws.amazon.com/elasticloadbalancing/network-load-balancer/
