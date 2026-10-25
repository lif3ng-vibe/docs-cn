---
title: "使用 Via 进行路由过滤"
description: "Via 通过引入 `via` 字段，为[授权][docs-grants]带来路由感知能力，让你指定 Tailscale 可以*以何种方式*把来源（`src`）路由到目标（`dst`）。"
---

最后验证于 Jan 5, 2026

Via 通过引入 `via` 字段，为[授权][docs-grants]带来路由感知能力，让你指定 Tailscale 可以*以何种方式*把来源（`src`）路由到目标（`dst`）。

你可以使用 [`via` 语法][ar-syntax]定义来源访问特定目标时可以经过哪些[出口节点][docs-exit-nodes]、[子网路由器][docs-subnets]或[应用连接器][docs-app-connectors]。例如，你可以创建一条授权，强制从工程团队组发往 GitHub 应用连接器的流量经由特定的出口节点。

在授权中使用 `via` 字段可以实现诸如：

* 将发往企业应用的流量经由特定出口节点路由。
* 根据设备是否满足设备态势标准，让设备的流量经由不同出口节点路由。
* 将特定用户的流量经由某个子网路由器路由。

> **注意：**
>
> 创建授权时可以省略 `via` 字段（或将其设为 `[]` 或 `null`），从而允许任意一组设备通过任意出口节点、子网路由器或应用连接器访问资源。

## 限制

* `via` 字段中只能使用[标签][docs-tags]。
* 出于[故障转移和区域路由方面的考虑][docs-high-availability]，只能将可访问的路由器作为 `via` 候选。用户可访问哪些路由器取决于适用的[访问策略][docs-acls]。

## 语法

Via 是授权语法的扩展。它增加了一个字段 `via`，用于指定来源以何种方式路由到目标。以下示例展示了 `via` 字段的用法。

```json
"grants": [
  {
    "src": ["<source>"],
    "dst": ["<destination>"],
    "via": ["tag:<tag-name>"],
    "ip": ["*"]
  },
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

这个例子确保从 `<source>` 到 `<destination>` 的流量经过一台带有 `<tag-name>` 标签的设备。

## 示例

以下示例展示了在授权中使用 `via` 字段应对常见使用场景的方式。

* [根据设备态势规则路由流量][ar-routers-to-device-postures]。
* [按所在位置通过出口节点路由用户流量][ar-exit-nodes-to-users]。
* [通过应用连接器路由用户流量][ar-app-connectors-to-users]。

### 根据设备态势规则路由流量

你可以使用 `via` 字段，依据不同的[设备态势][docs-block-unencrypted-laptops-database-access]管理规则，让对资源的访问经由不同路由器进行分段。

下面的示例演示了这样一个场景：工程团队组的成员如果满足 `latestMac` 态势（确保他们运行最新稳定版的 macOS Tailscale 客户端），就可以使用任意可用路由器访问 `192.0.2.0/24`。其他所有人（`autogroup:member`）则只能使用指定的办公室路由器（`tag:office-router`）访问 `192.0.2.0/24`。

```json
"postures": {
  "posture:latestMac": [
    "node:os == 'macos'",
    "node:osVersion == '13.4.0'",
    "node:tsReleaseTrack == 'stable'",
  ]
},
"grants": [
  {
    "src": ["group:eng"],
    "srcPosture": ["posture:latestMac"],
    "dst": ["192.0.2.0/24"],
    "ip": ["*"],
  },
  {
    "src": ["autogroup:member"],
    "dst": ["192.0.2.0/24"],
    "via": ["tag:office-router"],
    "ip": ["*"],
  },
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

### 按所在位置通过出口节点路由用户流量

你可以使用 `via` 字段，将不同的[出口节点][docs-exit-nodes]分配给不同的用户。

下面的示例演示了这样一个场景：用户可以根据其所属办公室的位置，通过出口节点访问互联网资源。

多伦多（`group:tor`）和西雅图（`group:sea`）办公室的用户可以使用靠近其所属办公室的出口节点访问互联网资源（未选择出口节点时则直接从本机访问）。工程团队（`group:eng`）的用户可以使用 tailnet 中的任意出口节点访问互联网资源（未选择出口节点时则直接从本机访问）。

```json
"grants": [
  {
    "src": ["group:tor"],
    "dst": ["autogroup:internet"],
    "via": ["tag:exit-node-tor"],
    "ip": ["*"],
  },
  {
    "src": ["group:sea"],
    "dst": ["autogroup:internet"],
    "via": ["tag:exit-node-sea"],
    "ip": ["*"],
  },
  {
    "src": ["group:eng"],
    "dst": ["autogroup:internet"],
    "ip": ["*"],
  },
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

### 通过应用连接器路由用户流量

你可以使用 `via` 字段，将不同的[应用连接器][docs-app-connectors]分配给不同的用户。

下面的示例演示了这样一个场景：`group:github-users` 组的用户可以通过打有 `tag:github-appconnector` 标签的应用连接器访问 GitHub，而 `group:salesforce-users` 组的用户可以通过打有 `tag:salesforce-appconnector` 标签的应用连接器访问 Salesforce。

```json
"grants": [
  {
    "src": ["group:github-users"],
    "dst": ["autogroup:internet"],
    "ip":  ["*"],
    "via": ["tag:github-appconnector"],
  },
  {
    "src": ["group:salesforce-users"],
    "dst": ["autogroup:internet"],
    "ip":  ["*"],
    "via": ["tag:salesforce-appconnector"],
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

[ar-app-connectors-to-users]: #通过应用连接器路由用户流量

[ar-exit-nodes-to-users]: #按所在位置通过出口节点路由用户流量

[ar-routers-to-device-postures]: #根据设备态势规则路由流量

[ar-syntax]: #语法

[docs-acls]: /docs/features/access-control/acls

[docs-app-connectors]: /docs/features/app-connectors

[docs-block-unencrypted-laptops-database-access]: /docs/solutions/protect-postgresql-unencrypted-macbooks

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags
