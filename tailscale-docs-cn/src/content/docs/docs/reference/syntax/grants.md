---
title: "授权（grant）语法"
description: "Tailscale 授权（grant）提供了一套统一的访问控制系统，将网络层与应用层能力合并到同一套语法中。它们是 Tailscale 访问控制列表（ACL）的演进，对资源访问提供了更强的灵活性和更细粒度的控制。"
---

最后验证于 Jan 5, 2026

Tailscale [授权][docs-grants]提供了一套统一的访问控制系统，把网络层与应用层能力合并到同一套语法中。它们是 Tailscale 访问控制列表（[ACL][docs-acls]）的演进，对资源访问提供了更强的灵活性和更细粒度的控制。授权体系通过默认拒绝的方式实现[最小权限][ln-principle-of-least-privilege]和[零信任][docs-zero-trust]原则：访问必须被显式授予。

本参考指南讲解 [tailnet 策略文件][docs-tailnet-policy-file]中定义的授权的语法与用法，涵盖[基本结构][ar-syntax]、[可用的选择器][ar-source-selectors]以及常见场景的[示例实现][ar-error-handling-and-troubleshooting]。阅读本文需要你已熟悉 Tailscale 的基本概念，例如 Tailscale 网络（即 [tailnet][docs-tailnet]）、[标签][docs-tags]和[群组][docs-targets-groups]。

## 核心概念

授权遵循声明式模型：你指定谁可以在什么条件下访问哪些资源。每条授权至少需要一个源（`src`）、一个目标（`dst`），以及[网络层能力][ar-network-layer-capabilities]（`ip`）和/或[应用层能力][ar-application-layer-capabilities]（`app`）。[设备态势要求][ar-device-posture-requirements]（`srcPosture`）和[路由指定][ar-routing-specifications]（`via`）是可选的。

当你在单个 `src` 或 `dst` 数组中列出多个[选择器][docs-targets]时，Tailscale 策略引擎会使用匹配任一选择器的所有实体的并集。

授权遵循默认拒绝原则，即只有被显式授予才允许访问。如果多条授权匹配同一连接，Tailscale 策略引擎会应用所有已授予能力的并集。更具体的授权不会覆盖更宽泛的授权，而是在其基础上叠加。此外，[应用能力][docs-grants-app-capabilities]只有在设备拥有网络层访问权限时才会生效。

## 语法

授权定义放在 tailnet 策略文件的 `grants` 部分，使用[声明式、人类可读的 JSON 语法][xt-wiki-json]。基本结构如下：

```json
{
  "grants": [
    {
      "src": ["<list-of-sources>"],
      "dst": ["<list-of-destinations>"],
      "ip": ["<list-of-ports-or-protocols>"],
      "app": {
        "<capability-identifier>": [
          {
            "<parameter-name>": "<parameter-value>",
            // Additional parameters as required
          }
        ]
      },
      "srcPosture": ["<list-of-posture-conditions>"],
      "via": ["<list-of-routing-devices>"]
    }
    // Additional grants as needed
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

所有授权属性都是数组（即使只有一项），唯独 `app` 例外——它是一个映射，把[能力][docs-grants-app-capabilities]标识符映射到参数对象数组。

授权带有隐含的 `accept` 动作，因此在其指定范围内天然是放行的。策略引擎会编译所有授权并分发到 [Tailscale 客户端][docs-installation]，客户端会在本地缓存。

## 源选择器

源（`src`）字段定义发起连接的网络来源，可以是设备、用户、群组、IP 地址段或其他[选择器][docs-targets]。所有授权定义都必须包含 `src` 字段，它接受一个选择器数组。你可以使用多种选择器类型来定位 tailnet 内的特定实体或实体集合。

下表列出了所有可用的源选择器、它们的含义和用法示例，帮助你构建精确的访问策略。

| 选择器              | 描述                                                                                                                                                                           | 示例                                  |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------ |
| `*`                 | 选择 tailnet 中的所有来源，以及来自已批准子网路由的来源。不包括 tailnet 之外的设备（除非它们位于已批准的子网中）。                                                                     | `*`                                   |
| `group:<groupName>` | 选择特定群组的所有成员。                                                                                                                                                              | `group:prod`                          |
| `<email>`           | 按电子邮件地址选择特定用户。GitHub 用户使用 `username@github`；Passkey 用户使用 `username@passkey`。                                                                                   | `user@example.com`, `username@github` |
| `tag:<tagName>`     | 选择具有特定标签的所有设备。                                                                                                                                                          | `tag:server`                          |
| `autogroup:<role>`  | 选择特定角色的所有成员。可选角色有 `admin`、`member`、`owner`、`it-admin`、`network-admin`、`billing-admin` 和 `auditor`。                                                             | `autogroup:admin`                     |
| `autogroup:tagged`  | 选择所有带标签（任意标签）的设备。                                                                                                                                                    | `autogroup:tagged`                    |
| `autogroup:shared`  | 选择属于已接受你 tailnet 共享邀请的用户的全部设备。                                                                                                                                   | `autogroup:shared`                    |
| `<cidr>/<ip>`       | 选择 CIDR 范围内的所有设备。                                                                                                                                                         | `192.0.2.0/24`, `192.0.2.5`           |
| `<hostAlias>`       | 按用户定义的别名选择主机。你可以用这个选择器把访问权限授予特定设备或 CIDR 范围。`hostAlias` 的定义位于 `hosts` 部分。                                                                  | `example-host-name`                   |
| `ipset:<ipsetName>` | 选择一个 IP 集（一组命名的 IP 地址段）。                                                                                                                                             | `ipset:prod`                          |

## 目标选择器

目标（`dst`）字段定义源可以访问的端点，可以是设备、用户、群组、IP 地址段或其他[选择器][docs-targets]。所有授权定义都必须包含 `dst` 字段，它接受一个选择器数组。目标选择器包括源可用的全部选项，外加一些专用于目标的选择器。

| 选择器               | 描述                                                                                                                                                                                                                                                  | 示例                                                      |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| `*`                  | 选择 tailnet 中的所有来源，以及来自已批准子网路由的来源。不包括 tailnet 之外的设备（除非它们位于已批准的子网中）。                                                                                                                                     | `*`                                                       |
| `group:<groupName>`  | 选择特定群组的所有成员。                                                                                                                                                                                                                              | `group:analytics`                                         |
| `<email>`            | 按电子邮件地址选择特定用户。GitHub 用户使用 `username@github`；Passkey 用户使用 `username@passkey`。                                                                                                                                                   | `name@example.com`, `username@github`, `username@passkey` |
| `tag:<tagName>`      | 选择具有特定标签的所有设备。                                                                                                                                                                                                                          | `tag:tailsql`                                             |
| `svc:<serviceName>`  | 选择特定的 [Tailscale Service][docs-tailscale-services]。                                                                                                                                                                                             | `svc:web-server`                                          |
| `autogroup:<role>`   | 选择特定角色的所有成员。可选角色有 `admin`、`member`、`owner`、`it-admin`、`network-admin`、`billing-admin` 和 `auditor`。                                                                                                                             | `autogroup:admin`                                         |
| `autogroup:tagged`   | 选择所有带标签（任意标签）的设备。                                                                                                                                                                                                                    | `autogroup:tagged`                                        |
| `autogroup:internet` | `autogroup:internet` 是一个特殊的 autogroup 选择器，让你可以授予使用出口节点访问互联网的权限。                                                                                                                                                        | `autogroup:internet`                                      |
| `autogroup:self`     | 选择用户自己的设备。`autogroup:self` 是一个特殊的 autogroup 选择器，与 `autogroup:<role>`、`group:<name>` 或单个用户的 `src` 选择器组合使用时，可以允许用户从自己的设备访问自己的设备。                                                                | `autogroup:self`                                          |
| `<cidr>/<ip>`        | 选择 CIDR 范围内的所有设备。                                                                                                                                                                                                                         | `192.0.2.0/24`, `192.0.2.5`.                              |
| `<hostAlias>`        | 按用户定义的别名选择主机。你可以用这个选择器把访问权限授予特定设备或 CIDR 范围。`hostAlias` 的定义位于 `hosts` 部分。                                                                                                                                  | `example-host-name`                                       |
| `ipset:<ipsetName>`  | 选择一个 IP 集（一组命名的 IP 地址段）。                                                                                                                                                                                                             | `ipset:prod`                                              |

你可以用这些选择器定义精确的目标范围。例如，你可以用 `tag:database` 允许访问数据库，用 `tag:prod` 和 `tag:dev` 同时允许访问生产环境和开发环境，或者用 `autogroup:internet` 允许通过[出口节点][docs-exit-nodes]访问互联网。

> **注意：**
>
> 授权中的 CIDR 选择器控制的是放行哪些流量，而不是向客户端路由表注入哪些路由。一条允许 `192.168.0.0/16` 的授权不会注入指向该范围的路由。路由只有在[子网路由器][docs-subnets]通告且管理员批准后才会被注入。更多信息请参阅[路由注入参考][docs-route-injection]。

## 网络层能力

`ip` 字段定义网络层[能力][docs-grants-app-capabilities]，例如端口和协议。你必须包含 `ip` 字段或 `app` 字段，或两者都包含。如果省略，源就没有网络层访问权限，除非由其他规则授予。包含该字段时，它接受一个选择器数组，用于指定允许的端口和协议。网络层能力是访问控制的基础，决定了你允许源与目标之间使用哪些通信通道。下表展示了可用的网络层能力选择器及其说明，涵盖从放行所有协议的宽泛选项到精确到协议-端口组合的选项。

| 选择器           | 描述                                                                                                                                                                                           | 示例                    |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| `*`              | 允许访问目标上的所有端口（隐含 TCP、UDP 和 ICMP 访问）。                                                                                                                                        | `*`                     |
| `<port>`         | 允许访问目标上的特定端口（隐含 TCP、UDP 和 ICMP 访问）。可以指定单个端口（`443`）或端口范围（`80-443`）。                                                                                       | `443`, `80-443`         |
| `<proto>:*`      | 允许以指定协议（`proto`）访问目标的所有端口。对于没有端口概念的协议（如 ICMP）尤其有用。例如 `icmp:*` 或 `sctp:*`。                                                                             | `icmp:*`, `sctp:*`      |
| `<proto>:<port>` | 允许访问目标上特定的协议与端口组合。可以指定单个端口（`tcp:443`）或端口范围（`tcp:80-443`）。                                                                                                   | `tcp:443`, `tcp:80-443` |

指定协议时，你可以使用 [IANA IP 协议编号][xt-wiki-iana]（1-255）或命名别名。下表把常见协议名映射到对应的 IANA 编号，让你在定义网络能力时可以使用人类可读的协议标识符代替数字代码。这让授权定义更易读、更易维护，同时保留了正确执行所需的技术精确性。

| 协议                                        | 命名别名           | IANA 编号   |
| :------------------------------------------ | :----------------- | :---------- |
| 互联网组管理协议（IGMP）                    | `igmp`             | 2           |
| IPv4 封装                                   | `ipv4`, `ip-in-ip` | 4           |
| 传输控制（TCP）                             | `tcp`              | 6           |
| 外部网关协议（EGP）                         | `egp`              | 8           |
| 任意私有内部网关                            | `igp`              | 9           |
| 用户数据报（UDP）                           | `udp`              | 17          |
| 通用路由封装（GRE）                         | `gre`              | 47          |
| 封装安全载荷（ESP）                         | `esp`              | 50          |
| 认证头（AH）                                | `ah`               | 51          |
| 流控制传输协议（SCTP）                      | `sctp`             | 132         |

## 应用层能力

`app` 字段是可选字段，它把字符串映射到对象数组，用于定义要授予的应用层[能力][docs-grants-app-capabilities]。字符串是要授予的应用能力字符串，对象则是这些能力的参数。

具体的应用（例如 [`golink`][xt-gh-golink]）以 `<domainName>/<capabilityName>` 的格式定义能力名称。

* `domainName` 把能力分组到命名空间中，以避免与其他应用冲突。
  * `tailscale.com` 和 `tailscale.io` 是 Tailscale 为自己产品保留的域名命名空间。如果你要编写自定义应用能力，应当使用你自己控制的域名，以避免与其他第三方集成冲突。
* `capabilityName` 定义具体的能力。例如，[TailSQL][xt-gh-tailsql] 应用定义了 `tailscale.com/cap/tailsql` 能力。

具体的应用也会为每种能力定义参数。Tailscale 策略引擎把这些参数当作不透明的 JSON 对象处理：策略引擎会编译参数并发送给 Tailscale 客户端，但只检查该字段是否为合法 JSON，不会按照任何特定模式校验参数。客户端随后可以使用这些参数在本地做出授权决策。

```json
"app": {
  "<domainName>/<capabilityName>": [
    {
      "<parameterName>": "<parameterValue>",
      // Additional parameters as defined by the application
    }
  ]
}
```

除非应用本身是 Tailscale 自家的应用，否则 Tailscale 不会参与创建、命名或校验应用能力及其参数。为所有能力和参数编写文档是应用开发者的责任。

应用能力为你在应用内允许的操作提供了细粒度控制。例如，你可以用以下配置授予对所有 [TailSQL][xt-gh-tailsql] 数据源的访问：

```json
"app": {
  "tailscale.com/cap/tailsql": [
    {
      "dataSrc": ["*"]
    }
  ]
}
```

你可以用以下配置授予 [`golink`][xt-gh-golink] 的管理权限：

```json
"app": {
  "tailscale.com/cap/golink": [
    {
      "admin": true
    }
  ]
}
```

或者用以下配置授予 Kubernetes 模拟（impersonation）能力：

```json
"app": {
  "tailscale.com/cap/kubernetes": [
    {
      "impersonate": {
        "groups": ["system:masters"]
      }
    }
  ]
}
```

## 设备态势要求

`srcPosture` 字段是一个[设备态势][docs-device-posture]条件数组，可用于进一步限制网络来源（`src`）。例如，你可以用 `srcPosture` 把访问限制为只允许运行特定版本 Tailscale 客户端的设备。

设备态势要求有助于确保只有满足特定安全或配置标准的设备才能建立连接。例如，你可以要求特定的 macOS 版本才允许访问，或者要求同时满足多个设备条件。

## 路由指定

`via` 字段为授权引入了路由感知能力，让你可以指定 Tailscale 可以*如何*把目标（`dst`）从源（`src`）路由出去。你可以使用 `via` 语法来定义源在使用特定目标时可以访问的[出口节点][docs-exit-nodes]、[子网路由器][docs-subnets]或[应用连接器][docs-app-connectors]。例如，你可以创建一条授权，强制从工程团队群组发往 GitHub 应用连接器的流量经过特定的出口节点。

`via` 字段指定流量从源到目标的必经路由方式。该字段是可选的，接受一个标签数组，用于标识路由设备，例如出口节点、子网路由器或应用连接器。

在授权中使用 `via` 字段可以实现诸如：

* 把发往企业应用的流量经由特定的出口节点路由。
* 基于设备态势标准路由流量。
* 把来自特定用户的流量经由子网路由器路由。

创建授权时，你可以省略 `via` 字段（或将其设为 `[]` 或 `null`），以允许任意一组设备访问某个资源（经由任意出口节点、子网路由器或应用连接器）。

> **警告：**
>
> `via` 字段有以下限制：
>
> * `via` 字段中只能使用[标签][docs-tags]。
> * 出于[故障转移和区域路由方面的原因][docs-high-availability]，只有可访问的路由器才能作为 `via` 候选。用户可访问哪些路由器取决于适用的[访问策略][docs-acls]。

## 错误处理与故障排除

Tailscale 策略引擎会编译授权并分发给 Tailscale 客户端，客户端在本地缓存。在策略编译、分发或执行过程中都可能出现错误。

常见错误包括无效的选择器（使用了不存在的群组、标签或 IP 集）、不可达的主机（把访问权授予了并不存在的目标）、协议不匹配（指定了不存在或格式错误的协议标识符）以及应用能力不匹配（引用了目标应用不支持的能力）。策略引擎在检测到问题时会尽可能提供错误信息。

更多故障排除指导请参阅[授权故障排除主题][docs-grants-troubleshooting]。

[ar-application-layer-capabilities]: #应用层能力

[ar-device-posture-requirements]: #设备态势要求

[ar-error-handling-and-troubleshooting]: #错误处理与故障排除

[ar-network-layer-capabilities]: #网络层能力

[ar-routing-specifications]: #路由指定

[ar-source-selectors]: #源选择器

[ar-syntax]: #语法

[docs-acls]: /docs/features/access-control/acls

[docs-app-connectors]: /docs/features/app-connectors

[docs-device-posture]: /docs/features/device-posture

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-troubleshooting]: /docs/reference/troubleshooting/grants

[docs-grants]: /docs/features/access-control/grants

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-installation]: /docs/install

[docs-route-injection]: /docs/reference/route-injection

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-targets-groups]: /docs/reference/targets-and-selectors#组

[docs-targets]: /docs/reference/targets-and-selectors

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege

[xt-gh-golink]: https://github.com/tailscale/golink

[xt-gh-tailsql]: https://github.com/tailscale/tailsql

[xt-wiki-iana]: https://en.wikipedia.org/wiki/Internet_Assigned_Numbers_Authority

[xt-wiki-json]: https://en.wikipedia.org/wiki/JSON
