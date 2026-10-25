---
title: "站点到站点网络"
description: "将 tailnet 中的两个子网相互连接。"
---

最后验证于 Sep 29, 2026

站点到站点（site-to-site）网络（也称[第三层（L3）路由][docs-osi]）在两个或多个不同网络之间架起桥梁，让不同子网中的设备无需直连即可相互通信。你可以使用 Tailscale 的[子网路由器][docs-subnets]创建站点到站点连接，把整个网络（例如不同物理地点或云环境）通过你的 Tailscale 网络（即 tailnet）安全地连接在一起。典型场景包括把分支机构连接到总部，或把云环境连接到本地部署网络。

使用 Tailscale 创建站点到站点连接，是传统网络互联方法（如 [VPN][xt-wiki-vpn] 或[多协议标签交换（MPLS）][xt-wiki-multiprotocol-label-switching]）的有力替代——这些传统方法通常需要复杂的配置和管理。它让你利用 Tailscale 的加密连接安全地互联网络，无需复杂的配置或管理开销。

## 要求与限制

tailnet 内的子网和子网路由器设备必须满足以下要求，站点到站点网络才能工作：

* 各子网的 [CIDR][xt-wiki-cidr] 范围**不得**完全相同。如果你需要多台子网路由器通告完全相同的子网（例如两台路由器都通告 `10.0.0.0/24`），请使用[高可用][docs-high-availability]或 [4via6 子网路由][docs-4via6-subnets]。
* 两台子网路由器都必须使用基于 Linux 的操作系统。

### 前缀长度不同的重叠子网路由

Tailscale 支持子网路由器通告前缀长度不同的重叠路由。当多台子网路由器通告重叠的子网时，Tailscale 使用最长前缀匹配（LPM）把流量路由到可用的最精确路由。

例如，如果你有：

* 子网路由器 A 通告 `10.0.0.0/16`
* 子网路由器 B 通告 `10.0.0.0/24`

流量会按如下方式路由：

* `10.0.0.1` 经过子网路由器 B（被更精确的 `/24` 路由匹配）
* `10.0.1.1` 经过子网路由器 A（只被 `/16` 路由匹配）

这一行为遵循标准 IP 路由原则，适用于你想在更大地址空间内对特定子网的路由进行更精细控制的场景。

## 创建站点到站点连接

创建站点到站点连接包括：把每个子网中的一台设备配置为子网路由器、在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面批准这些子网路由器、更新 tailnet 访问控制策略，以及把每个子网中的设备配置为对正确的路由使用指定的子网路由器。

### 第 1 步：选择子网路由器

第一步是在子网内选择一台设备充当指定的子网路由器。这台设备必须使用基于 Linux 的操作系统。

### 第 2 步：配置子网路由器

选定子网内充当子网路由器的设备后，你需要把它配置为子网路由器。配置工作包括[安装 Tailscale 客户端][docs-installation]、启用 IP 地址转发、用正确的配置选项启动 Tailscale 客户端，以及设置设备的 `iptables`。

#### IP 地址转发

\[Missing snippet: EnableIPForwarding.mdx]

#### 子网路由器配置选项

把设备配置为子网路由器包括：指定要通告的子网路由、禁用源网络地址转换（SNAT），以及让设备接受路由。你可以使用 [`tailscale up`][docs-cli-up] 或 [`tailscale set`][docs-cli-set] CLI 命令设置这些配置选项。

| **配置选项**                                        | **CLI 旗标**                              | **说明**                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :------------------------------------------------ | :---------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 通告子网路由                                      | `--advertise-routes=<CIDR>`               | `--advertise-routes` 旗标指定要暴露给 tailnet 的 IP 地址 CIDR 范围。对这些地址的访问由 Tailscale 访问控制策略控制。                                                                                                                                                                                                                                                                |
| 禁用源网络地址转换（SNAT）                        | `--snat-subnet-routes=false`（仅限 Linux） | `--snat-subnet-routes=false` 旗标禁用源 NAT（SNAT）。默认情况下，子网路由器后面的设备看到的流量都来自子网路由器。这降低了路由复杂度，但无法跨越多个网络。禁用源 NAT 后，末端设备看到的是源设备的 IP 地址作为来源——可能是 Tailscale IP 地址，也可能是另一台子网路由器后面的地址。                                         |
| 接受路由                                          | `--accept-routes`                         | `--accept-routes` 旗标接受 tailnet 中所有其他子网路由器通告的路由。                                                                                                                                                                                                                                                                                                                 |

\[Missing snippet: WarningAcceptRoutesHA.mdx]

#### 将 MSS 钳制到 MTU

你还应该把[最大分段大小（MSS）][xt-wiki-mss]钳制到[最大传输单元（MTU）][xt-wiki-mtu]。可以用 [`iptables`][xt-wiki-iptables] 实现。以下命令会更新 Tailscale 网络接口（`tailscale0`），把 MSS 钳制到 MTU。

```shell
iptables -t mangle -A FORWARD -o tailscale0 -p tcp -m tcp \
--tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu
```

### 第 3 步：批准子网路由器

选定并配置好子网路由器后，你必须在管理控制台的 Machines 页面批准它。如果你在 tailnet 策略文件中为该设备使用了[自动审批者][docs-policy-syntax-autoapprovers]（auto approver）策略，就无需手动批准子网路由器。

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 通过 **Subnets** 徽章或 [`property:subnet`](https://console.tailscale.com/admin/machines?q=property%3Asubnet) 筛选器找到子网路由器设备。
3. 对每台子网路由器：
   1. 选择该菜单 > **Edit subnet routes**。
   2. 批准该设备。

> **注意：**
>
> 你可能希望对子网路由器[禁用密钥过期][docs-key-expiry]，以免定期重新认证。如果你使用了[标签][docs-tags]，[密钥过期默认是禁用的][docs-tags-key-expiry]。

### 第 4 步：更新 tailnet 访问控制策略

你必须更新 tailnet 的[访问控制策略][docs-access-control]，创建访问规则（[授权][docs-grants]）来允许子网之间连接通信。

你可以在管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面，使用[可视化编辑器][docs-visual-editor]或 JSON 编辑器完成。

以下示例允许子网之间的所有流量。

#### JSON 编辑器

使用 JSON 编辑器在子网之间创建访问规则时，你必须创建两条访问规则：子网间每个流量方向各一条。

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls/file) 页面。
2. 选择 **JSON editor** 标签页，用 JSON 更新 tailnet 策略文件。
3. 找到策略文件的 `grants` 部分。
4. 在策略文件的 `grants` 部分添加两条访问规则：子网间每个流量方向各一条。

最终结果应类似下面的示例，它允许两个子网之间的所有流量。请把 `<first-subnet-CIDR>` 和 `<second-subnet-CIDR>` 替换为子网的实际 CIDR 范围。

```json
{
  "grants": [
    {
      "src": [ <first-subnet-CIDR> ],
      "dst": [ <second-subnet-CIDR> ],
      "ip": ["*"]
    },
    {
      "src": [ <second-subnet-CIDR> ],
      "dst": [ <first-subnet-CIDR> ],
      "ip": ["*"]
    }
  ]
}
```

#### 可视化编辑器

使用[可视化编辑器][docs-visual-editor]在子网之间创建访问规则时，你必须创建两条访问规则：子网间每个流量方向各一条。

1. 创建一条允许从第一个子网到第二个子网流量的访问规则：
   1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls/file) 页面。
   2. 选择 [Visual editor](https://console.tailscale.com/admin/acls/visual) 标签页。
   3. 选择 **Add rule**。
   4. 在 **Source** 字段中，输入第一个子网的 CIDR 范围。
   5. 在 **Destination** 字段中，输入第二个子网的 CIDR 范围。
   6. 在 **Port and protocol** 字段中，选择 **All ports and protocols**。
   7. （可选）为访问规则添加描述性备注，方便日后识别。
   8. 选择 **Save grant**。
2. 创建一条允许从第二个子网到第一个子网流量的访问规则：
   1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls/file) 页面。
   2. 选择 [Visual editor](https://console.tailscale.com/admin/acls/visual) 标签页。
   3. 选择 **Add rule**。
   4. 在 **Source** 字段中，输入第二个子网的 CIDR 范围。
   5. 在 **Destination** 字段中，输入第一个子网的 CIDR 范围。
   6. 在 **Port and protocol** 字段中，选择 **All ports and protocols**。
   7. （可选）为访问规则添加描述性备注，方便日后识别。
   8. 选择 **Save grant**。

这会以 grants 语法创建两条访问规则，保存后立即生效。

### 第 5 步：配置其他子网设备

配置并批准子网路由器后，确保子网中的设备对正确的路由使用指定的子网路由器。配置子网设备的最佳方式取决于你的基础设施。例如，如果子网设备已经把子网路由器用作默认网关，就无需配置它们，因为它们会自动把所有流量（除非有更精确的路由）都交给子网路由器。如果子网设备没有把子网路由器用作默认网关，你必须配置它们对正确的路由使用子网路由器。

例如，在 Linux 设备上，你可以使用 [`ip route` 命令][xt-ip-route-command]。如果你为子网选定的子网路由器已经是该子网的默认网关，则无需配置子网设备。

```shell
ip route add <first-subnet-CIDR> via <first-subnet-router-IP-address>
ip route add <second-subnet-CIDR> via <second-subnet-router-IP-address>
```

> **注意：**
>
> `ip route` 命令在重启后不会保留。每次重启后都必须重新运行。根据你的环境，你可以把路由设置加入网络管理器或 [`netplan`][xt-netplan] 配置使其持久化；也可以用网络中的 DHCP 服务器管理路由设置。

如果子网位于云环境（例如 [AWS][docs-install-aws]）中，通常可以直接更新云服务商的路由表，而无需逐台配置设备。

## 示例场景

以下各节演示如何使用两台子网路由器连接 tailnet 内的两个子网。下表记录了示例中的子网与子网路由器。

| **子网名称** | **子网 CIDR 范围**    | **子网路由器 IP 地址**           |
| :-------------- | :-------------------- | :------------------------------- |
| 子网 A          | `192.0.2.0/24`        | `192.0.2.2`（子网路由器 A）      |
| 子网 B          | `172.16.100.0/24`     | `172.16.100.2`（子网路由器 A）   |

要在子网 A 和子网 B 之间创建站点到站点连接，请按以下步骤操作：

1. 配置两台子网路由器（子网 A 位于 `192.0.2.2`，子网 B 位于 `172.16.100.2`）：
   1. 在每台子网路由器上[安装 Tailscale 客户端][docs-installation]。

   2. [启用 IP 地址转发][ar-ip-address-forwarding]。

   3. [配置 Tailscale 客户端][ar-subnet-router-configuration-options]。

      对于 `192.0.2.2` 子网路由器，使用 `192.0.2.0/24`：

      ```shell
      tailscale up --advertise-routes=192.0.2.0/24 --snat-subnet-routes=false --accept-routes
      ```

      对于 `172.16.100.2` 子网路由器，使用 `172.16.100.0/24`：

      ```shell
      tailscale up --advertise-routes=172.16.100.0/24 --snat-subnet-routes=false --accept-routes
      ```

      > **警告：**
      >
      > `--snat-subnet-routes` 旗标只在操作系统为 Linux 时有效。

   4. 配置 `iptables`，[将 MSS 钳制到 MTU][ar-clamp-the-mss-to-the-mtu]。

2. [批准子网路由][ar-approve-the-subnet-router]。

3. 在子网内每台设备（子网路由器除外）上运行以下命令来[配置子网设备][ar-configure-subnet-devices]：
   1. 对于 `192.0.2.0/24` 子网中的每台设备（子网路由器除外），运行以下命令：

      ```shell
      ip route add 100.64.0.0/10 via 192.0.2.2
      ip route add 172.16.100.0/24 via 192.0.2.2
      ```

   2. 对于 `172.16.100.0/24` 子网中的每台设备（子网路由器除外），运行以下命令：

      ```shell
      ip route add 100.64.0.0/10 via 172.16.100.2
      ip route add 192.0.2.0/24 via 172.16.100.2
      ```

4. 更新 tailnet 的[访问控制策略][docs-access-control]，允许子网之间通信。下例中，tailnet 策略文件使用[授权][docs-grants]允许子网之间的所有流量：

   ```json
   {
     "grants": [
       {
         "src": ["100.64.0.0/10"], // CIDR range of subnet A
         "dst": ["192.0.2.0/24"], // CIDR range of subnet B
         "ip": ["*"]
       },
       {
         "src": ["192.0.2.0/24"], // CIDR range of subnet B
         "dst": ["100.64.0.0/10"], // CIDR range of subnet A
         "ip": ["*"]
       }
     ]
   }
   ```

5. 测试子网 A 与子网 B 之间的[连通性][docs-troubleshoot-connectivity]：

   现在，子网 A 中的一台设备可以连接子网 B 中的设备（反之亦然），双方都无需安装 Tailscale 客户端。你可以从子网 A 的设备向子网 B 的设备运行 `ping` 命令来测试连接。例如，从 `198.0.2.3` ping `172.16.100.3`：

   ```shell
   ping 172.16.100.3

   PING 172.16.100.3 (172.16.100.3) 56(84) bytes of data.
   64 bytes from 172.16.100.3: icmp_seq=1 ttl=64 time=9.34 ms
   64 bytes from 172.16.100.3: icmp_seq=2 ttl=64 time=3.85 ms
   ```

[ar-approve-the-subnet-router]: #第-3-步批准子网路由器

[ar-clamp-the-mss-to-the-mtu]: #将-mss-钳制到-mtu

[ar-configure-subnet-devices]: #第-5-步配置其他子网设备

[ar-ip-address-forwarding]: #ip-地址转发

[ar-subnet-router-configuration-options]: #子网路由器配置选项

[docs-4via6-subnets]: /docs/features/subnet-routers/4via6-subnets

[docs-access-control]: /docs/features/access-control

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-cli-up]: /docs/reference/tailscale-cli#up

[docs-grants]: /docs/features/access-control/grants

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-install-aws]: /docs/install/cloud/aws

[docs-installation]: /docs/install

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-osi]: /docs/concepts/tailscale-osi

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tags-key-expiry]: /docs/features/tags#key-expiry

[docs-troubleshoot-connectivity]: /docs/reference/troubleshooting/connectivity

[docs-visual-editor]: /docs/features/visual-editor

[xt-ip-route-command]: https://www.man7.org/linux/man-pages/man8/ip-route.8.html

[xt-netplan]: https://netplan.readthedocs.io/en/stable/

[xt-wiki-cidr]: https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing

[xt-wiki-iptables]: https://en.wikipedia.org/wiki/iptables

[xt-wiki-mss]: https://en.wikipedia.org/wiki/Maximum_segment_size

[xt-wiki-mtu]: https://en.wikipedia.org/wiki/Maximum_transmission_unit

[xt-wiki-multiprotocol-label-switching]: https://en.wikipedia.org/wiki/Multiprotocol_Label_Switching

[xt-wiki-vpn]: https://en.wikipedia.org/wiki/Virtual_private_network
