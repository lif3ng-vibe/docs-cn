---
title: "授权示例"
description: "[授权][docs-grants]（grants）是在 [tailnet 策略文件][docs-tailnet-policy-file]中定义访问控制规则的现代方式。它们以更灵活、功能更丰富的语法取代了[旧版 ACL 格式][docs-acls]"
---

最后验证于 Jan 5, 2026

[授权][docs-grants]（grants）是在 [tailnet 策略文件][docs-tailnet-policy-file]中定义访问控制规则的现代方式。它们以更灵活、功能更丰富的语法取代了[旧版 ACL（访问控制列表）格式][docs-acls]。

本主题全面收录了 Tailscale tailnet 策略的授权示例，按从最简单到最复杂的场景组织。每个示例都包含背景说明、完整配置（以代码片段或完整 tailnet 策略文件的形式呈现）以及实现要点，帮助你理解如何在自己的环境中套用类似模式。

| 示例 | 说明 |
| --- | --- |
| [全部允许][ar-allow-all] | 提供默认策略，允许 tailnet 内设备之间的所有连接。从其他网络共享来的设备只能响应入站连接。 |
| [允许用户访问自己的设备][ar-allow-users-access-to-their-own-devices] | 让 tailnet 成员能够访问自己的设备。这是一套专注于自助设备管理的基础访问控制配置。 |
| [允许使用出口节点][ar-allow-using-exit-nodes] | 允许 tailnet 的所有成员通过任意可用的出口节点路由互联网流量。 |
| [使用标签按用途授权][ar-allow-based-on-purpose-using-tags] | 在应用组件之间强制实施通信边界，只允许相邻层级之间的流量，适用于安全的多层应用。 |
| [按组访问不同环境][ar-allow-access-to-different-environments-by-group] | 实现基于组的访问控制，并对共享资源施加端口限制，让不同团队拥有不同的权限级别。 |
| [按位置经出口节点路由流量][ar-route-traffic-through-exit-nodes-based-on-location] | 按用户地理位置划分出口节点的使用，引导用户使用距离最近的出口节点以获得最佳性能。 |
| [基于设备态势控制资源访问][ar-allow-access-to-resources-based-on-device-posture] | 基于设备合规状态控制经由不同子网路由器的资源访问，确保只有合规设备才能访问敏感资源。 |
| [经应用连接器路由组流量][ar-route-group-traffic-through-app-connectors] | 为不同用户组经指定的应用连接器划分应用访问，在不直接暴露应用的前提下提供安全访问。 |
| [自定义 `autogroup:internet`][ar-customize-autogroup-internet] | 使用 IP 集合创建自定义互联网访问规则，并让流量经特定的子网路由器转发，实现对外部资源访问更细粒度的控制。 |
| [使用设备态势访问不同环境][ar-allow-access-to-different-environments-using-device-posture] | 基于设备安全态势控制对不同基础设施环境的访问，对更敏感的环境实施更严格的安全要求。 |
| [以特定权限访问 Kubernetes Operator][ar-allow-access-to-kubernetes-operator-with-privileges] | 管理 Kubernetes Operator 的不同权限级别，通过 Tailscale 的 Kubernetes 能力为不同用户授予管理或只读访问权限。 |
| [应用对等连接][ar-application-peering] | 支持跨云服务商和 SaaS 应用的应用间连接，实现跨环境的安全服务间通信。 |
| [CI/CD 开发流水线][ar-ci-cd-development-pipeline] | 按团队角色限制对部署流水线组件的访问，在保障部署流水线安全的同时支持自动化部署。 |
| [监控应用访问][ar-monitor-application-access] | 允许监控服务器访问 tailnet 内特定端口上的服务，在可观测性需求与安全之间取得平衡。 |
| [网络微分段][ar-network-microsegmentation] | 实现 tailnet 的逻辑分段，并支持支持团队跨段访问，限制潜在安全事件的影响范围。 |
| [VPC 访问][ar-vpc-access] | 让开发者借助子网对等能力访问 VPC 资源，在不公开暴露的前提下安全访问云资源。 |
| [使用 Tailscale Peer Relay][ar-use-tailscale-peer-relays] | 让 tailnet 中的设备充当高吞吐量中继服务器。 |

## 全部允许

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [授权][docs-grants] |

本示例是 Tailscale tailnet（即 [tailnet][docs-tailnet]）中权限最宽松的默认策略。当你希望在一个受信任的环境里尽量少加限制时可以使用它，例如小型团队或个人 tailnet——其中所有设备都应能自由互相通信。此示例常作为实施更严格策略之前的起点。

```json
{
  "grants": [
    {
      "src": ["*"],
      "dst": ["*"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

本示例对三个关键参数都使用了通配符。源（`src`）通配符允许任何设备或用户发起连接；目标（`dst`）通配符允许连接到 tailnet 中的任何设备；IP 协议（`ip`）通配符允许任意端口上的所有流量类型，包括 TCP、UDP 和 ICMP。

> **注意：**
>
> 即使采用这种宽松的策略，从其他 tailnet [共享][docs-sharing]给你的设备也无法访问你 tailnet 中的设备。共享设备只能响应来自你 tailnet 的入站连接，而不能主动发起连接。

## 允许用户访问自己的设备

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [autogroup][docs-targets-autogroups]、[授权][docs-grants] |

本示例使用 [autogroup][docs-targets-autogroups] 实现一种基本的用户隔离，同时保留对自己设备的访问。它是在落实[最小权限原则][ln-principle-of-least-privilege]的同时，仍确保用户能访问自己的远程工作站、服务器或其他个人资源的绝佳起点。这种方式适合用户之间数据隔离较为重要的组织。

```json
{
  "grants": [
    {
      "src": ["autogroup:member"],
      "dst": ["autogroup:self"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

源 `autogroup:member` 代表 tailnet 中所有已通过身份验证的用户，而 `autogroup:self` 会动态指向当前连接用户所拥有的设备。这在用户之间形成天然隔离，同时保留完全的自助访问。你无需创建[自定义组][docs-targets-groups]，因为这些 autogroup 是 Tailscale 内置的。

本示例阻止在用户设备之间横向移动，但并未为共享资源设立规则。要允许访问文件服务器之类的公共资源，你需要添加额外的授权，并配合相应的[标签][docs-tags]或[组][docs-targets-groups]。此外，如果设备通过 Tailscale [共享][docs-sharing]被明确邀请，本示例也不会阻止用户访问另一位用户的设备。

## 允许使用出口节点

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [autogroup][docs-targets-autogroups]、[授权][docs-grants] |

本示例使用 [autogroup][docs-targets-autogroups]，让用户能够将互联网流量经你 tailnet 中的[出口节点][docs-exit-nodes]路由。这对于访问受地区限制的内容、在不可信网络上保护流量，或保持一致的出站 IP 地址尤其有用。你可以在专用服务器、云实例，甚至带宽充足的个人设备（例如 Apple TV）上配置出口节点。

```json
{
  "grants": [
    {
      "src": ["autogroup:member"],
      "dst": ["autogroup:internet"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

源 `autogroup:member` 允许 tailnet 中所有已验证的用户使用出口节点；目标 `autogroup:internet` 代表 tailnet 之外的所有可能的互联网目的地；通配的 IP 协议则允许所有类型的流量经出口节点路由。

> **警告：**
>
> 要让本示例生效，你的 tailnet 中必须至少有一台设备已配置为[出口节点][docs-exit-nodes]。这条授权只允许这种路由关系；你仍需在 Tailscale 管理控制台中或通过设备配置单独配置并批准出口节点。用户还需要在 Tailscale 客户端设置中选择出口节点才能使用它。

## 使用标签按用途授权

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [授权][docs-grants]、[标签][docs-tags] |

本示例在应用组件之间强制实施通信边界，确保每一层只能与相邻层通信。它非常适合实现[零信任架构][docs-zero-trust]——当你需要严格控制应用层之间的流量流向时。这种方式常见于包含前端、后端和数据库组件的多层应用（如 Web 服务）。

```json
{
  "grants": [
    {
      "src": ["tag:frontend"],
      "dst": ["tag:backend"],
      "ip": ["*"]
    },
    {
      "src": ["tag:backend"],
      "dst": ["tag:logging"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

第一条授权允许打上 `frontend` 标签的设备与打上 `backend` 标签的设备通信；第二条授权允许 `backend` 设备与 `logging` 服务通信。这就形成了一个与预期应用架构相符的定向流量流向，防止设备绕过中间层。

要实现本示例，你需要在 tailnet 策略文件的 `tagOwners` 部分定义[标签][docs-tags]，以控制谁可以把这些标签分配给设备。你还需要为每台设备明确打上与其角色相符的标签。

## 按组访问不同环境

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [授权][docs-grants]、[组][docs-targets-groups]、[标签][docs-tags] |

本示例实现了基于[组][docs-targets-groups]的访问控制，并附带端口限制。当你有不同团队都需要访问、但权限级别各不相同的共享资源（例如内部工具）时，这种配置很常见。这种方式可以精确控制每个组能使用哪些协议和端口，在可用性与安全性之间取得平衡。

```json
{
  "grants": [
    {
      "src": ["group:eng"],
      "dst": ["tag:internal-tools"],
      "ip": ["*"]
    },
    {
      "src": ["group:sales"],
      "dst": ["tag:internal-tools"],
      "ip": ["tcp:443", "tcp:22"]
    },
    {
      "src": ["*"],
      "dst": ["tag:dns"],
      "ip": ["udp:53"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

第一条授权让工程团队（`group:eng`）不受限制地访问内部工具，允许所有协议和端口；第二条授权为销售团队（`group:sales`）提供受限访问，只允许 HTTPS（端口 `443`）和 SSH（端口 `22`）；第三条授权确保 tailnet 中的每个人都能访问 DNS 服务（UDP 端口 `53`）。

要实现本示例，你需要在 tailnet 策略文件中定义所引用的[组][docs-targets-groups]和[标签][docs-tags]。组中列出团队成员的电子邮件地址，标签则应用到相关设备上。随着团队成员变动，这种方式需要持续维护。如果你的组织人员变动频繁或用户数量庞大，建议为组管理实现自动化。

## 按位置经出口节点路由流量

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [`autogroups`][docs-targets-autogroups]、[`grants`][docs-grants]、[`groups`][docs-targets-groups]、[`tags`][docs-tags]、[`via`][docs-via] |

本示例按用户的地理位置划分出口节点的使用。当你在不同位置都有出口节点时，可能希望引导用户使用距离最近的出口节点以获得最佳性能。这种方式还有助于确保用户经由适当司法辖区的出口节点连接，以满足合规要求或优化 tailnet 延迟。

```json
{
  "grants": [
    {
      "src": ["group:nyc"],
      "dst": ["autogroup:internet"],
      "via": ["tag:exit-node-nyc"],
      "ip": ["*"]
    },
    {
      "src": ["group:sea"],
      "dst": ["autogroup:internet"],
      "via": ["tag:exit-node-sea"],
      "ip": ["*"]
    },
    {
      "src": ["group:eng"],
      "dst": ["autogroup:internet"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

本示例使用 `via` 字段强制流量经过特定设备（这称为[路由过滤][docs-via]）。多伦多办公室（`group:tor`）和西雅图办公室（`group:sea`）的用户必须使用各自所在位置的出口节点，而工程团队（`group:eng`）可以使用任意出口节点或直接连接。本示例在不要求用户手动选择合适出口节点的情况下强制了路由路径。

要让本示例生效，你需要在策略中定义所引用的组，并为相应的出口节点打标签。每台出口节点还必须在 Tailscale 管理控制台中正确配置。如果没有 `via` 字段，用户可以选择任何可用的出口节点，可能导致次优路由或合规问题。

> **警告：**
>
> 如果指定的出口节点变得不可用，该组用户将无法通过 Tailscale 访问互联网，直到该出口节点恢复可用，或你更新策略。

## 基于设备态势控制资源访问

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [`autogroups`][docs-targets-autogroups]、[`grants`][docs-grants]、[`groups`][docs-targets-groups]、[`postures`][docs-device-posture]、[`srcPosture`][docs-device-posture]、[`tags`][docs-tags]、[`via`][docs-via] |

本示例基于设备合规状态，控制经由不同[子网路由器][docs-subnets]的资源访问。[设备态势][docs-device-posture]检查确保只有合规设备才能访问敏感资源。此方式展示了如何依据设备安全状态控制子网访问：合规设备直接访问，其他设备则经由受控网关路由。

```json
{
  "postures": {
    "posture:latestMac": [
      "node:os == 'macos'",
      "node:osVersion == '13.4.0'",
      "node:tsReleaseTrack == 'stable'"
    ]
  },
  "grants": [
    {
      "src": ["group:eng"],
      "srcPosture": ["posture:latestMac"],
      "dst": ["192.0.2.0/24"],
      "ip": ["*"]
    },
    {
      "src": ["autogroup:member"],
      "dst": ["192.0.2.0/24"],
      "via": ["tag:office-router"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

本示例定义了一个名为 `posture:latestMac` 的态势检查，验证设备正在运行 macOS Ventura 13.4.0 且使用稳定版 [Tailscale 客户端版本][docs-versions]。第一条授权允许拥有合规设备的工程团队成员直接访问该子网；第二条授权将所有其他用户经办公室路由器路由，为不合规设备增加了一层安全保障。

要实现本示例，你需要定义态势检查参数、创建所引用的[组][docs-targets-groups]，并给至少一台设备[打上][docs-tags]标签作为办公室子网路由器。态势检查会实时评估，设备状态变化时权限可自动调整。

> **警告：**
>
> 随着操作系统和 Tailscale 版本演进，本示例需要仔细维护态势要求。版本要求设置得过于严格，可能会意外阻断尚未更新系统的合法用户。

## 经应用连接器路由组流量

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [`autogroups`][docs-targets-autogroups]、[`grants`][docs-grants]、[`groups`][docs-targets-groups]、[`tags`][docs-tags]、[`via`][docs-via] |

本示例为不同用户组经特定的[应用连接器][docs-app-connectors]划分应用访问。应用连接器在不向用户直接暴露应用的情况下提供对特定应用的安全访问。此方式确保用户只能通过指定的安全通道访问某些应用，并在连接路径上增加了身份验证与监控节点。

```json
{
  "grants": [
    {
      "src": ["group:github-users"],
      "dst": ["autogroup:internet"],
      "ip": ["*"],
      "via": ["tag:github-appconnector"]
    },
    {
      "src": ["group:salesforce-users"],
      "dst": ["autogroup:internet"],
      "ip": ["*"],
      "via": ["tag:salesforce-appconnector"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

本示例根据服务需求将不同用户组引导至不同的应用连接器。`github-users` 组的用户必须经过 GitHub 应用连接器，而 `salesforce-users` 必须经过 Salesforce 应用连接器。`via` 字段强制了这些路由路径，确保流量使用安全的连接方式。

要让本示例生效，你需要定义用户组，并用相应的标签设置应用连接器。你还必须为每个应用连接器配置其对应的应用。

> **警告：**
>
> 本示例需要为每个应用维护单独的连接器，这会增加运维开销，但能提供很强的安全隔离。如果某个应用连接器发生故障，用户将无法访问该应用，直到连接器恢复可用，或你更新策略。

## 自定义 autogroup:internet

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [`grants`][docs-grants]、[`groups`][docs-targets-groups]、[`ipsets`][docs-ipsets]、[`tags`][docs-tags]、[`via`][docs-via] |

本示例使用 [IP 集合][docs-ipsets]创建自定义互联网访问规则，并让流量经特定的[子网路由器][docs-subnets]转发。有时你需要对用户可以访问哪些外部资源进行更细粒度的控制。此方式让你定义互联网地址的自定义子集，并对每个子集应用不同的路由规则，适用于把特定服务排除在一般互联网访问规则之外。

```json
{
  "ipsets": {
    "ipset:internet": [
      "add autogroup:internet",
      "remove ipset:cdn-edge",
      "remove ipset:partner-net"
    ],
    "ipset:cdn-edge": ["198.51.100.6", "198.51.100.7", "198.51.100.13", "198.51.100.14"],
    "ipset:partner-net": ["203.0.113.0/24"]
  },
  "grants": [
    {
      "src": ["group:sea"],
      "dst": ["ipset:internet"],
      "ip": ["*"],
      "via": ["tag:officerouter-sea"]
    },
    {
      "src": ["group:lon"],
      "dst": ["ipset:internet"],
      "ip": ["*"],
      "via": ["tag:officerouter-lon"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

本示例创建了一个自定义的 `ipset:internet`，包含除特定 CDN 边缘节点和合作伙伴网络之外的所有互联网地址。IP 集合定义使用 `add` 和 `remove` 操作组合出最终集合。西雅图（`group:sea`）和伦敦（`group:lon`）的用户经各自的办公室路由器路由，以访问这个自定义的互联网定义。

要实现本示例，你需要用合适的网络地址定义 IP 集合、为不同位置创建用户组，并相应地给办公室路由器打标签。本示例需要仔细管理 IP 地址列表，尤其是在被排除的网络频繁变动的情况下。如果这些 IP 集合引用了动态云资源或频繁变化的合作伙伴网络，建议使用自动化保持其更新。

## 使用设备态势访问不同环境

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [`grants`][docs-grants]、[`groups`][docs-targets-groups]、[`ipsets`][docs-ipsets]、[`postures`][docs-device-posture]、[`srcPosture`][docs-device-posture]、[`tags`][docs-tags]、[`via`][docs-via] |

本示例基于设备安全态势控制对不同基础设施环境的访问。在包含多个阶段（开发、预发布、生产）的环境中，你通常希望访问越敏感的环境，安全要求越严格。此方式根据环境敏感度实施递进式的安全态势。

```json
{
  "grants": [
    {
      "src": ["group:devs"],
      "dst": ["ipset:prod-infra"],
      "ip": ["*"],
      "via": ["tag:prod-connector"],
      "srcPosture": ["posture:strict-mac"]
    },
    {
      "src": ["group:devs"],
      "dst": ["ipset:stg-infra"],
      "ip": ["*"],
      "via": ["tag:stg-connector"],
      "srcPosture": ["posture:semi-strict-mac"]
    },
    {
      "src": ["group:devs"],
      "dst": ["ipset:dev-infra"],
      "ip": ["*"],
      "via": ["tag:dev-connector"],
      "srcPosture": ["posture:any-mac"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

本示例根据目标环境和设备的安全[态势][docs-device-posture]，将开发者流量经不同的应用连接器路由。生产基础设施要求最严格的设备安全策略，预发布要求适中，开发要求最低。用户通过专用的连接器访问每个环境，这些连接器可以实施额外的安全控制。

要实现本示例，你需要定义态势检查、每个环境的 IP 集合，并给相应的连接器设备打标签。所引用的态势、IP 集合、组和标签都需要你在 tailnet 策略文件的其他位置定义。本示例将设备安全校验与网络路径控制相结合，提供纵深防御。维护多套安全态势定义时，更新要求需要谨慎协调，以免意外阻断对关键环境的访问。

## 以特定权限访问 Kubernetes Operator

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | app、[`grants`][docs-grants]、[`groups`][docs-targets-groups]、[`tags`][docs-tags] |

本示例以不同的权限级别管理 [Kubernetes Operator][docs-kubernetes-operator] 的访问。当你在 tailnet 中运行 Kubernetes 集群时，可能希望给不同用户授予不同级别的访问权限。本示例展示如何通过 Tailscale 的 Kubernetes 能力，给生产团队授予管理权限、给其他用户授予只读访问权限。

```json
{
  "grants": [
    {
      "src": [
        "group:prod"
      ],
      "dst": [
        "tag:k8s-operator"
      ],
      "app": {
        "tailscale.com/cap/kubernetes": [
          {
            "impersonate": {
              "groups": [
                "system:masters"
              ]
            }
          }
        ]
      }
    },
    {
      "src": [
        "group:k8s-readers"
      ],
      "dst": [
        "tag:k8s-operator"
      ],
      "app": {
        "tailscale.com/cap/kubernetes": [
          {
            "impersonate": {
              "groups": [
                "tailnet-readers"
              ]
            }
          }
        ]
      }
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

本示例使用 `app` 字段授予特定的 Kubernetes 能力。生产团队（`group:prod`）可以模拟拥有管理员权限的 `system:masters` 组，而读者组（`group:k8s-readers`）只能模拟拥有只读访问权限的 `tailnet-readers` 组。你必须给 Kubernetes Operator 设备打上 `tag:k8s-operator` 标签。

要实现本示例，你需要定义用户[组][docs-targets-groups]，并给 Kubernetes Operator 设备[打标签][docs-tags]。你还需要配置 Kubernetes 集群以识别被模拟的组，并授予它们相应的权限。本示例让你通过 Tailscale 管理 Kubernetes 访问，而无需修改底层的 Kubernetes 配置。为使其正常工作，`tailnet-readers` 组必须存在于你的 Kubernetes 配置中，并具备相应的只读权限。

## 应用对等连接

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [`grants`][docs-grants]、[`groups`][docs-targets-groups]、[`tags`][docs-tags] |

> **提示：**
>
> 应用对等连接（application peering）指在两个应用或应用环境之间建立双向的点对点连接。

本示例支持跨云服务商和 SaaS 应用的应用间连接。此方式适用于跨多个云环境连接应用或服务。例如，你可能想在不同云服务商的数据库之间流式传输数据，或者在不公开暴露服务的情况下实现跨环境的安全服务间通信。

```json
{
  "groups": {
    "group:infra": ["carl@example.com"]
  },
  "grants": [
    {
      "src": ["tag:database", "tag:gcp", "tag:aws"],
      "dst": ["tag:database"],
      "ip": ["*"]
    }
  ],
  "tagOwners": {
    "tag:database": ["group:infra"],
    "tag:gcp": ["group:infra"],
    "tag:aws": ["group:infra"]
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

本示例让数据库之间可以双向通信，并允许打有云服务商标签的设备访问这些数据库。基础设施团队（`group:infra`）可以管理哪台设备获得哪个[标签][docs-tags]，从而控制哪些服务可以互相通信。本示例组合使用标签来同时标识设备的功能（`database`）及其所在环境（`gcp`、`aws`）。

要实现本示例，你需要定义基础设施团队组，并为云资源应用相应的标签。每个云资源都需要运行 Tailscale 客户端才能加入 tailnet。本示例无需复杂的 VPN 配置或公网 IP 暴露，即可创建跨云服务商的安全覆盖 tailnet。

> **警告：**
>
> 请注意，本示例允许任何打有 `database` 标签的设备与任何其他数据库通信，对于有严格数据隔离要求的环境而言，这可能过于宽松。

## CI/CD 开发流水线

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [`grants`][docs-grants]、[`groups`][docs-targets-groups]、[`tags`][docs-tags] |

本示例按团队角色限制对部署流水线组件的访问。DevOps 和 SRE（站点可靠性工程）团队通常需要保护部署流水线：既确保开发者能访问开发工具，又将生产环境访问限定给 DevOps 团队。这种配置在支持自动化部署的同时，为软件交付过程建立了恰当的边界。

```json
{
  "groups": {
    "group:dev": ["alice@example.com", "bob@example.com"],
    "group:devops": ["carl@example.com"]
  },
  "grants": [
    {
      "src": ["group:dev"],
      "dst": ["tag:dev"],
      "ip": ["*"]
    },
    {
      "src": ["group:devops"],
      "dst": ["tag:ci", "tag:prod"],
      "ip": ["*"]
    }
  ],
  "tagOwners": {
    "tag:ci": ["group:devops"],
    "tag:dev": ["group:devops", "tag:ci"],
    "tag:prod": ["group:devops", "tag:ci"]
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

本示例将开发、CI/CD 和生产环境的访问分离开。开发者可以访问开发资源，DevOps 团队则可以访问构建工具和生产环境。有意思的是，[打上][docs-tags] `tag:ci` 标签的设备还能管理设备标签，使自动化部署流程能够在资源流转于各环境时为其打上恰当的标签。

要实现本示例，你需要定义开发者和 DevOps 组，并为每个环境中的相应资源打标签。本示例在安全隔离与自动化能力之间取得了平衡。CI/CD 系统可以管理标签，因而不需人工直接干预即可处理整个部署流水线。不过这种方式确实要求对 CI/CD 系统本身做好安全防护，因为它在 tailnet 中拥有提权。

## 监控应用访问

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [`grants`][docs-grants]、[`groups`][docs-targets-groups]、[`tags`][docs-tags] |

本示例允许监控服务器访问 tailnet 内特定端口上的服务。DevOps 或 SRE 团队通常需要监控工具来查询 tailnet 中服务的日志和指标。此方式让监控服务器只访问特定的应用端口，而不授予完整的 tailnet 访问权限，在可观测性需求与安全之间取得平衡。

```json
{
  "groups": {
    "group:devops": ["carl@example.com"]
  },
  "grants": [
    {
      "src": ["tag:monitoring"],
      "dst": ["tag:logging"],
      "ip": ["80", "443", "9100"]
    },
    {
      "src": ["group:devops"],
      "dst": ["tag:monitoring", "tag:logging"],
      "ip": ["*"]
    }
  ],
  "tagOwners": {
    "tag:monitoring": ["group:devops"],
    "tag:logging": ["group:devops"]
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

本示例让监控服务器可以访问日志设备上的特定端口（HTTP、HTTPS 和 Prometheus node exporter）。DevOps 团队对监控和日志基础设施都拥有完全访问权限，并能管理哪些设备拥有承担这些角色的[标签][docs-tags]。这在监控基础设施与被监控服务之间建立了清晰的分离。

要实现本示例，你需要定义 DevOps 组，并给承担监控和日志角色的相应设备打标签。本示例将监控访问限制在必要的端口上，在保持可观测性的同时缩小了攻击面。你应根据自己使用的监控工具和协议调整端口限制。

**注意：**随着监控需求变化或引入新的监控端口，这种方法可能需要相应更新。

## 网络微分段

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [`grants`][docs-grants]、[`groups`][docs-targets-groups]、[`tags`][docs-tags]、[autogroup][docs-targets-autogroups] |

> **提示：**
>
> [网络微分段][ln-network-microsegmentation]指将 tailnet 划分为小型、隔离的分段，以增强安全性并限制潜在攻击的扩散。

本示例实现了 tailnet 的逻辑分段，并允许支持团队跨段访问。网络微分段出于安全目的将你的 tailnet 划分为多个逻辑单元，限制潜在安全事件的影响范围。每个分段相互隔离，但支持团队可能需要受控的跨段访问。

```json
{
  "grants": [
    {
      "src": ["group:support"],
      "dst": ["tag:segment-abc", "tag:segment-xyz"],
      "ip": ["443"]
    },
    {
      "src": ["tag:support"],
      "dst": ["tag:segment-abc", "tag:segment-xyz"],
      "ip": ["443"]
    }
  ],
  "groups": {
    "group:support": ["alice@example.com", "bob@example.com"]
  },
  "tagOwners": {
    "tag:support": ["autogroup:admin"]
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

本示例创建了相互隔离的 tailnet 分段，并提供受控的跨段访问。支持团队成员和打有支持标签的设备可以访问两个分段，但仅限端口 `443`（HTTPS）。这让支持团队可以访问每个分段中的 Web 界面和 API，而不会授予所有协议的更广泛访问权限。

要实现本示例，你需要定义支持团队[组][docs-targets-groups]，给每个分段中的设备[打标签][docs-tags]，并给支持工具打标签。[管理员](/docs/reference/user-roles)可以按需把支持标签分配给设备。本示例没有定义每个分段内部的通信；要让分段内的设备互相通信，你需要添加额外的授权。此方式提供了强隔离，并对支持访问保留受控例外，降低了安全事件发生时横向移动的风险。

## VPC 访问

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [`grants`][docs-grants]、[`groups`][docs-targets-groups]、[`tags`][docs-tags]、[`autogroups`][docs-targets-autogroups]、[`autoApprovers`][docs-policy-syntax-autoapprovers] |

本示例借助[子网][docs-subnets]对等能力，让开发者可以访问 VPC 资源。当你的组织使用云服务商的 VPC 时，可能希望在保持恰当的子网隔离与路由的同时，让开发者访问这些资源。此方式对于在不公开暴露的前提下安全访问云资源尤其有用。

```json
{
  "groups": {
    "group:dev": ["alice@example.com", "bob@example.com"]
  },
  "grants": [
    {
      "src": ["autogroup:admin"],
      "dst": ["tag:vpc-peering:*"],
      "ip": ["*"]
    },
    {
      "src": ["group:dev", "192.0.2.0/24", "198.51.100.0/24"],
      "dst": ["192.0.2.0/24:*", "198.51.100.0/24:*"],
      "ip": ["*"]
    }
  ],
  "tagOwners": {
    "tag:vpc-peering": ["autogroup:admin"]
  },
  "autoApprovers": {
    "routes": {
      "192.0.2.0/24": ["tag:vpc-peering", "autogroup:admin"],
      "198.51.100.0/24": ["tag:vpc-peering", "autogroup:admin"]
    }
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

本示例让两个 VPC 子网之间可以双向通信，并授予开发者对两者的访问权限。[管理员](/docs/reference/user-roles)可以访问并管理 VPC 对等设备。`autoApprovers` 部分会自动批准这些 VPC 的子网路由，无需再在 Tailscale 管理控制台中手动批准。

要实现本示例，你需要定义开发者[组][docs-targets-groups]、给 VPC 对等设备[打标签][docs-tags]，并配置[子网路由][docs-subnets]。为了让子网路由正常工作，你可能需要禁用子网路由伪装（masquerading），以允许子网之间直接通信。本示例让人类用户和子网内的设备都能互相通信，从而支持复杂的混合云架构。本示例需要仔细管理子网编址以避免冲突，并正确配置云 tailnet 设置。

你还可以使用 [auto approver][docs-policy-syntax-autoapprovers]来自动批准路由。

## 使用 Tailscale Peer Relay

| 可用性 | 相关概念 |
| --- | --- |
| [所有套餐][co-pricing] | [对等中继][docs-peer-relays]、[标签][docs-tags] |

下面的示例让所有打有 `tag:us-east-vpc` 标签的设备在与 tailnet 中其他设备通信时，使用打有 `tag:us-east-relays` 标签的 [Tailscale Peer Relay][docs-peer-relays] 作为底层网络中继。也就是说，tailnet 中的其他设备在与打有 `tag:us-east-vpc` 标签的设备通信时，可以使用打有 `tag:us-east-relays` 标签的设备作为底层网络中继。它使用 `tailscale.com/cap/relay` [应用能力][docs-grant-app-capabilities]来启用对等中继（peer relay）功能。

```json
{
  "grants": [
    {
      "src": ["tag:us-east-vpc"],
      "dst": ["tag:us-east-relays"],
      "app": {
        "tailscale.com/cap/relay": []
      }
    }
  ]
}
```

为使其生效，你还必须使用 `tailscale set` 命令[配置对等中继设备][docs-peer-relays-configure]，并创建一条基础授权策略，允许对打有 `tag:us-east-vpc` 标签的设备进行覆盖网络访问。例如，下面这条授权策略允许 tailnet 的所有成员通过 TCP 端口 80 和 443 访问打有 `tag:us-east-vpc` 标签的设备。

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

## 结语

请记住，授权遵循默认拒绝的原则，因此你必须显式允许任何想要放行的连接（除非你保留默认的全部允许策略）。授权系统的灵活性让你既能实现遵循安全最佳实践的细粒度访问控制，又能满足组织所需的连接能力。

[ar-allow-access-to-different-environments-by-group]: #按组访问不同环境

[ar-allow-access-to-different-environments-using-device-posture]: #使用设备态势访问不同环境

[ar-allow-access-to-kubernetes-operator-with-privileges]: #以特定权限访问-kubernetes-operator

[ar-allow-access-to-resources-based-on-device-posture]: #基于设备态势控制资源访问

[ar-allow-all]: #全部允许

[ar-allow-based-on-purpose-using-tags]: #使用标签按用途授权

[ar-allow-users-access-to-their-own-devices]: #允许用户访问自己的设备

[ar-allow-using-exit-nodes]: #允许使用出口节点

[ar-application-peering]: #应用对等连接

[ar-ci-cd-development-pipeline]: #cicd-开发流水线

[ar-customize-autogroup-internet]: #自定义-autogroupinternet

[ar-monitor-application-access]: #监控应用访问

[ar-network-microsegmentation]: #网络微分段

[ar-route-group-traffic-through-app-connectors]: #经应用连接器路由组流量

[ar-route-traffic-through-exit-nodes-based-on-location]: #按位置经出口节点路由流量

[ar-vpc-access]: #vpc-访问

[ar-use-tailscale-peer-relays]: #使用-tailscale-peer-relay

[co-pricing]: https://tailscale.com/pricing

[docs-acls]: /docs/features/access-control/acls

[docs-app-connectors]: /docs/features/app-connectors

[docs-device-posture]: /docs/features/device-posture

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grant-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants]: /docs/features/access-control/grants

[docs-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-peer-relays]: /docs/features/peer-relay

[docs-peer-relays-configure]: /docs/features/peer-relay#step-1

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-targets-autogroups]: /docs/reference/targets-and-selectors#autogroups

[docs-targets-groups]: /docs/reference/targets-and-selectors#groups

[docs-versions]: /docs/reference/tailscale-client-versions

[docs-via]: /docs/features/access-control/grants/grants-via

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-network-microsegmentation]: https://tailscale.com/learn/network-microsegmentation

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege
