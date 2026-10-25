---
title: "将 Tailscale 与你的防火墙配合使用"
description: "将 Tailscale 与现有防火墙配置配合使用。"
---

最后验证于 Jan 28, 2026

大多数情况下，Tailscale 无需额外配置即可与现有防火墙协同工作。得益于 [NAT 穿透][bl-how-nat-traversal-works]，Tailscale 网络（即 tailnet）中的设备即使在防火墙之后也能直接点对点连接。当无法直连时，通常可以通过[打开防火墙端口来建立直连][docs-firewall-ports]解决。

不过，对于某些防火墙，建立直连特别困难，此时你的流量会退而依赖 [DERP 中继服务器][docs-derp-servers]，这可能导致连接变慢。请在下方列表中查看在 Tailscale 下使用你的防火墙提供商时的已知问题与解决方法。

> **提示：**
>
> 你可以搭建 Tailscale 对等中继（peer relay）服务器，在无法直连时帮助设备建立连接。这类中继服务器由你在自己的基础设施上托管。更多信息请参阅 [Tailscale Peer Relay 文档][docs-peer-relays]。

有关如何确定 tailnet 中两台设备之间的连接类型，请参阅 [Tailscale 中的连接类型][docs-connection-types]。

## 延迟与安全的权衡

你的组织可能已配置防火墙，保护网络免受未经请求的、不必要的或恶意流量的影响。虽然下面的解决方法可能帮助 Tailscale 在设备之间建立直连，但也可能让其他流量更容易到达你的网络。在实施任何这些更改之前，请权衡安全与延迟之间这种取舍的利弊。

具体而言：

* 启用 NAT-PMP 与 UPnP 后，你的网络可能会允许并转发所有流量。
* 打开防火墙端口后，你的网络会允许某一端口上符合特定规则的流量离开你的网络。请将此类流量限制到仅限所需范围。[订阅此 GitHub issue][xt-gh-tailscale-issue-1872] 以获取 Tailscale 规则集的更新动态。

## 防火墙兼容性与解决方法

下表总结了 Tailscale 在各种防火墙平台上的预期行为，以及已知的解决方法。

只有在你的 tailnet 中配置了至少一个 [Tailscale Peer Relay 服务器][docs-peer-relays]，并创建了使用它们的相应[访问控制规则][docs-grants]时，tailnet 设备才会通过对等中继连接。Tailscale 设备按以下顺序尝试连接：直接点对点；若已配置则使用 [Tailscale Peer Relay 服务器][docs-peer-relays]；最后使用 [DERP 中继服务器][docs-derp-servers]。

防火墙
预期行为
解决方法

Barracuda
通过 DERP 或对等中继连接
增大 Max UDP sessions，并打开防火墙端口

Check Point
直接连接
n/a

Cisco
通过 DERP 或对等中继连接
打开防火墙端口

Cisco（带 Cisco Umbrella Endpoint Security）
通过 DERP 或对等中继连接
无

Fortinet
通过 DERP 或对等中继连接
随机化端口

Fortinet（带 FortiGate 深度包检测）
无法连接控制平面
无

OPNsense
通过 DERP 或对等中继连接
启用 NAT-PMP，或静态 NAT 端口映射

pfSense
通过 DERP 或对等中继连接
启用 NAT-PMP，或静态 NAT 端口映射

Palo Alto Networks
通过 DERP 或对等中继连接
使用 Persistent Dynamic IP and Port

Sophos
直接连接
n/a

UniFi Gateways
通过 DERP 或对等中继连接
允许点对点流量

对于其他防火墙，如果你的连接默认使用 DERP 中继，请尝试[打开端口以建立直连][docs-firewall-ports]。你也可以在 tailnet 中搭建[对等中继服务器][docs-peer-relays]，在无法直连时帮助设备连接。

如果你遇到此处未列出的防火墙问题，或需要帮助配置特定防火墙与 Tailscale 的配合，请[联系支持团队][co-contact-support]。

### Barracuda

在使用 Barracuda 防火墙的网络中，Tailscale 设备难以建立直连，经常退回使用 DERP 中继。

为帮助 Tailscale 建立直连，请修改 Barracuda 防火墙允许的最大 UDP 会话数，让多个 Tailscale 客户端更容易连接，而不必互相竞争 UDP 端口。要修改此项，请调高防火墙配置中的 ["Max UDP" 参数][xt-barracuda-cloudgen]。

你还可以考虑[打开防火墙端口][docs-firewall-ports]，或在 tailnet 中搭建 [Tailscale Peer Relay 服务器][docs-peer-relays]。

### Check Point

在使用 Check Point 防火墙的网络中，Tailscale 设备默认应能建立直连。

### Cisco

在使用 Cisco 防火墙的网络中，Tailscale 设备难以建立直连，经常退回使用 DERP 中继。

为帮助 Tailscale 建立直连，请考虑[打开防火墙端口][docs-firewall-ports]。

#### Cisco Umbrella Endpoint Security

如果你使用 Cisco Umbrella Endpoint Security，那么[上述方法][ar-cisco]将无法建立直连，你的流量将始终退回使用 DERP 中继。

#### Cisco Umbrella DNS Filtering

对于使用 Cisco Umbrella（前身为 OpenDNS）的 DNS 过滤，Umbrella/OpenDNS 会在没有额外配置的情况下覆盖 Tailscale 设置的 DNS。要将两者一起配置：

1. 配置 Umbrella/OpenDNS，将 `*.<your-tailnet-name>.ts.net` 查询发送到 `100.100.100.100`。[ `100.100.100.100`（即 Quad100）][docs-quad100]是你的 Tailscale 网络（即 tailnet）中的一个特殊 Tailscale IP 地址，提供包括 DNS 解析器在内的基本本地服务。
2. 在 Tailscale 管理控制台中[禁用 MagicDNS][docs-disable-magicdns]。
3. 在 Tailscale 管理控制台，以及通过 [MDM 系统策略][docs-system-policy-dns-settings]配置的最终用户客户端上，禁用 [Override DNS servers][docs-override-dns-servers]。

这样配置后，客户端会继续使用 Umbrella 处理所有 DNS 查询，同时 Umbrella 会将 tailnet 专属查询交给 Tailscale 的 Quad100 DNS 解析器处理。

### Fortinet

在使用 Fortinet 防火墙的网络中，Tailscale 设备难以建立直连，经常退回使用 DERP 中继。在较小规模下可能不会出现此问题，通常在同一防火墙后有超过 5 人使用 Tailscale 时才会出现问题。

要允许直连，请在管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面中，在你的 [tailnet 策略文件][docs-access-control]里加入 [randomizeClientPort][docs-policy-syntax-network-policy-options] 选项。这会让设备为 WireGuard 使用随机端口，而不是默认的静态端口 `41641`。

```json
{
  // tailnet 策略文件设置与其他配置
  "randomizeClientPort": true
}
```

如果你在特定配置下使用 FortiGate 应用控制规则，防火墙会拦截发往 Tailscale 控制平面的 HTTPS 连接，网络中的节点将无法连接到 Tailscale。发生这种情况时，Tailscale 客户端 UI 以及 Tailscale CLI 的 [`tailscale status`][docs-cli-status] 命令输出中会显示类似如下的证书验证错误：

```shell
fetch control key: Get "https://controlplane.tailscale.com/key?v=123": x509: "controlplane.tailscale.com" certificate is not trusted
```

要解决此问题，请从浏览器进入 FortiOS 管理控制台，选择 **Security Profiles**，然后选择 **Application Control**。禁用或缩小任何执行 SSL 检查的安全配置文件的范围。尤其要确认你没有使用任何会阻止属于 **Proxy** 类别或匹配 [FortiGuard 中定义的 Tailscale 应用][xt-fortiguard-tailscale]的流量的默认规则。这是目前唯一已知的解决方法。

### Netskope

在使用 Netskope 的网络中，Tailscale 设备难以建立直连，经常退回使用[中继连接][docs-relayed-connections]。

你可以配置 Netskope 忽略 Tailscale，让它的流量绕过 Netskope 的过滤与云代理。为此：

1. 使用以下进程名称，为你使用的平台[创建自定义证书锁定应用（Custom Certificate Pinned Application）][xt-netskope-create-certificate-pinned-application]：

   | **平台**                                                 | **类型** | **进程名称**                                                           |
   | ------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
   | Android/ChromeOS                                        | Exact    | `com.tailscale.ipn`                                                    |
   | iOS                                                     | Exact    | `io.tailscale.ipn.ios`, `io.tailscale.ipn.ios.network-extension`       |
   | Linux                                                   | Exact    | `tailscaled`                                                           |
   | [macOS（Mac App Store 版）][docs-mac-variant-appstore]   | Exact    | `io.tailscale.ipn.macos`, `io.tailscale.ipn.macos.network-extension`   |
   | [macOS（独立版）][docs-mac-variant-standalone]           | Exact    | `io.tailscale.ipn.macsys`, `io.tailscale.ipn.macsys.network-extension` |
   | Windows                                                 | Exact    | `tailscale-ipn.exe`, `tailscale.exe`, `tailscaled.exe`                 |

2. 为以下条件[添加 steering 绕过例外][xt-netskope-add-steering-bypass]：

   | **条件**     | **值**                        |
   | ------------ | ----------------------------- |
   | 域名（Domains） | `*.tailscale.com`, `*.ts.net` |

### OPNsense 与 pfSense

在使用 OPNsense 与 pfSense 防火墙的网络中，Tailscale 设备难以建立直连，经常退回使用[中继连接][docs-relayed-connections]。

不过，有一些可以允许直连的选项，例如 NAT 端口映射协议（NAT-PMP）、静态 NAT 端口映射以及通用即插即用（UPnP）。更多信息请参阅 [pfSense][docs-pfsense-direct-connections] 与 [OPNsense][docs-install-opnsense-direct-connections] 的说明。

你还可以使用适用于 pfSense 的插件与 [OPNsense 的 FreeBSD Tailscale 软件包][docs-install-opnsense]，直接在这些路由器上运行 Tailscale。

### Palo Alto Networks

在 NAT Policy 转换类型中使用 [Persistent Dynamic IP and Port][xt-paloalto-pdipp]，可让 Tailscale 穿透防火墙建立直接的 WireGuard 连接。

*（图：Palo Alto Networks 的 'NAT Policy Rule' 界面。显示 'Translated Packet' 标签页。'Translation Type' 设为 'Persistent Dynamic IP and Port'。）*

Persistent Dynamic IP 支持自 PAN-OS 11.1.1 起可用。[Palo Alto Networks 防火墙][docs-firewall-palo-alto-networks]另有单独主题，涵盖更多细节与若干附加选项。

### Sophos

在使用 Sophos 安全网关的网络中，默认防火墙设置即可很好地支持 Tailscale 连接。它为第一个映射选择一个随机端口，随后对所有使用相同源端口的后续流使用同一端口。这让另一端的 Tailscale 知道应使用哪个端口发送流量。

要确认这一点，可使用 [Tailscale CLI][docs-cli] 的 [`tailscale netcheck`][docs-cli-netcheck] 命令，确保 `MappingVariesByDestIP: false` 这一关键项成立。

*（图：Sophos 的 'Rules and policies' 界面。显示 'NAT rules' 面板。列出了一个 'NAT Default Network'。）*

### UniFi Gateways

如果你的 UniFi 安全网关启用了威胁检测，请确保为 tailnet 中的节点允许点对点流量。

在 UniFi Network 9.0.107 及更早版本中，依次进入 **Settings, Firewall & Security, Edit threat categories**，取消勾选 **P2P**。

在 UniFi Network 9.0.108 及更高版本中，依次进入 **Network, Security, Protection, Peer to Peer and Dark Web**，取消勾选 **P2P**。

*（图：UniFi Network 界面，显示 Peer to Peer and Dark Web 设置页面，P2P 复选框未勾选。）*

## 只允许经 Tailscale 的流量

你还可以使用防火墙限制网络中的流量，要求必须使用 Tailscale。例如，请参阅[使用 ufw 锁定 Ubuntu 服务器][docs-secure-server-ubuntu]的说明。

[ar-cisco]: #cisco

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[co-contact-support]: https://tailscale.com/contact/support

[docs-access-control]: /docs/features/access-control

[docs-cli]: /docs/reference/tailscale-cli

[docs-cli-netcheck]: /docs/reference/tailscale-cli#netcheck

[docs-cli-status]: /docs/reference/tailscale-cli#status

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-disable-magicdns]: /docs/features/magicdns#disabling-magicdns

[docs-firewall-palo-alto-networks]: /docs/integrations/firewalls/palo-alto-firewall

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-grants]: /docs/features/access-control/grants

[docs-install-opnsense]: /docs/install/opnsense

[docs-install-opnsense-direct-connections]: /docs/install/opnsense#direct-connections-for-lan-clients

[docs-mac-variant-appstore]: /docs/concepts/macos-variants#mac-app-store-variant

[docs-mac-variant-standalone]: /docs/concepts/macos-variants#standalone-variant

[docs-override-dns-servers]: /docs/reference/dns-in-tailscale#override-dns-servers

[docs-peer-relays]: /docs/features/peer-relay

[docs-pfsense-direct-connections]: /docs/integrations/firewalls/pfsense#direct-connections-for-lan-clients

[docs-policy-syntax-network-policy-options]: /docs/reference/syntax/policy-file#network-policy-options

[docs-quad100]: /docs/reference/quad100

[docs-relayed-connections]: /docs/reference/connection-types#relayed-connections

[docs-secure-server-ubuntu]: /docs/how-to/secure-ubuntu-server-with-ufw

[docs-system-policy-dns-settings]: /docs/features/tailscale-system-policies#set-whether-the-device-uses-tailscale-dns-settings

[xt-barracuda-cloudgen]: https://campus.barracuda.com/product/cloudgenfirewall/doc/95258827/general-firewall-configuration/?sl=AX5zwzvyOBUvMAhoTe4U&so=2

[xt-fortiguard-tailscale]: https://fortiguard.fortinet.com/appcontrol/51457

[xt-gh-tailscale-issue-1872]: https://github.com/tailscale/tailscale/issues/1872

[xt-netskope-add-steering-bypass]: https://docs.netskope.com/en/add-bypasses-in-netskope

[xt-netskope-create-certificate-pinned-application]: https://docs.netskope.com/en/creating-a-custom-certificate-pinned-application

[xt-paloalto-pdipp]: https://docs.paloaltonetworks.com/pan-os/10-1/pan-os-new-features/networking-features/persistent-nat-for-dipp
