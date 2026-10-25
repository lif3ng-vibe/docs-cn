---
title: "拆分 DNS 策略"
description: "拆分 DNS（split DNS）策略让你可以针对特定[设备或组][docs-targets]，覆盖 Tailscale 网络（即 [tailnet][docs-tailnet]）的全局拆分 DNS 配置。你在 tailnet 策略文件的 `nodeAttrs` 部分定义这些覆盖项。"
---

最后验证于 Dec 10, 2025

> **注意：** 拆分 DNS 策略目前处于 alpha 阶段。

拆分 DNS 策略让你可以针对特定[设备或组][docs-targets]，覆盖 Tailscale 网络（即 [tailnet][docs-tailnet]）的全局拆分 DNS 配置。你在 tailnet 策略文件的 `nodeAttrs` 部分、使用 `tailscale.com/split-dns` 应用类型来定义这些覆盖项。Tailscale 会把策略应用到匹配的设备，定制其 [DNS 配置][docs-dns]，而无需更改客户端。

该功能解决的是组织中不同部门对同一域名需要不同 DNS 解析器的场景。例如，你可以在用户无权访问底层资源时阻止其解析内部域名，或者按设备[标签][docs-tags]（如云环境或部门）配置不同的 DNS 服务器。

> **警告：**
>
> 拆分 DNS 策略处于 alpha 阶段，需要你的 Tailscale 客户经理授权才能访问。

## 使用场景

拆分 DNS 策略适用于以下场景：

* 在把拆分 DNS 变更应用到整个 tailnet 之前，先与 IT 团队或志愿测试者一起测试。
* 把拆分 DNS 策略应用于[部分用户][docs-targets]，例如只覆盖正式员工而不覆盖承包商，尤其当[应用连接器][docs-app-connectors]承载的 SaaS 应用只允许部分用户经由连接器访问时。
* 根据设备的标签配置不同的 DNS 服务器，让 DNS 解析随云环境或其他设备特性而变化。
* 对无权访问底层资源的用户，隐藏受访问控制（[授权][docs-grants]）限制的[子网路由器][docs-subnets]或 DNS 服务器背后的内部域名。
* 防止没有应用连接器访问权的用户被导向这些连接器，让他们改为通过互联网访问 SaaS 应用。

## 前提条件

使用拆分 DNS 策略之前，你需要具备：

* 一个现有的 tailnet。
* 一个拥有 [Owner（所有者）、Admin（管理员）或 Network admin（网络管理员）](/docs/reference/user-roles)角色的用户账户，用于在管理控制台中编辑 [tailnet 策略文件][docs-policy-syntax]。
* 你的 Tailscale 客户经理授权你访问此 alpha 功能。
* 了解 tailnet 当前的拆分 DNS 配置，以及哪些域名需要定向覆盖。
* 熟悉 tailnet 策略文件结构与[节点属性][docs-policy-syntax-node-attributes]（node attribute）的定向语法。

## 开始使用

本节提供创建第一个拆分 DNS 策略的说明。你将向 tailnet 策略文件添加一条策略，为 tailnet 中所有设备覆盖特定域名的 DNS 解析。

### 确定域名与解析器

配置拆分 DNS 策略之前，先确定哪些域名需要自定义 DNS 解析，以及应由哪些 DNS 服务器解析这些域名。用标签、组或通配符 `*`（表示所有设备）来确定哪些设备应接收自定义配置。

把你使用的 DNS 服务器地址记录下来。它们可以是 IPv4 或 IPv6 地址、带端口的地址，或 [DNS over HTTPS（DoH）][docs-dns-over-https] URL。如果使用 DoH URL，确定是否需要引导解析（bootstrap resolution）以避免循环 DNS 依赖。

考虑你的策略是否需要特定优先级。负优先级在 tailnet 的全局拆分 DNS 配置和应用连接器之前生效；零或正优先级在全局配置和应用连接器之后生效。

* 像 `-1` 这样的负优先级适合在全局配置生效之前阻止对内部域名的访问。
* 像 `0` 或 `2` 这样的零或正优先级适合在全局配置生效之后提供备用 DNS 服务器。

> **警告：**
>
> 不要使用重复的优先级取值，否则可能导致不可预测的行为。

### 将拆分 DNS 策略添加到 tailnet 策略文件

以下步骤演示如何向 tailnet 策略文件添加拆分 DNS 策略。

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls/file) 页面。
2. 在 tailnet 策略文件中找到 `nodeAttrs` 部分。如果不存在该部分，请在 `grants` 部分之后创建它。
3. 添加一个新的节点属性条目，包含你的目标选择器和 `tailscale.com/split-dns` 应用类型。

下面的示例创建一条适用于 tailnet 中所有设备的策略：

```json
"nodeAttrs": [
  {
    "target": ["*"],
    "app": {
      "tailscale.com/split-dns": [
        {
          "comment": "Override DNS for example.com",
          "priority": 0,
          "nameservers": [
            {
              "addr": "198.51.100.1"
            },
            {
              "addr": "198.51.100.2"
            }
          ],
          "domains": [
            "example.com",
            "*.example.com"
          ]
        }
      ]
    }
  }
]
```

该策略为 `example.com` 及其子域名配置两个名称服务器（`198.51.100.1` 和 `198.51.100.2`）。优先级 `0` 表示此策略在全局拆分 DNS 配置和应用连接器之后生效。

保存 tailnet 策略文件的更改。Tailscale 会处理你的策略，并把定制后的 DNS 配置下发给匹配的设备。

### 验证配置

保存 tailnet 策略文件后，请核实设备收到了正确的 DNS 配置。你可以连接到一台匹配目标选择器的设备并检查其 DNS 设置；也可以从域名列表中查询一个域名，确认解析确实使用了你指定的名称服务器。

如果 DNS 解析行为不符合预期，请检查目标选择器和优先级设置，确认名称服务器地址正确且可从这些设备访问。

## 常见场景

以下各节提供常见拆分 DNS 策略配置的说明。

### 为特定标签创建策略

要把拆分 DNS 策略只应用于带特定[标签][docs-tags]的设备，请在目标选择器中使用该标签。下面的示例创建一条只适用于带 `tag:production` 标签设备的策略：

```json
"nodeAttrs": [
  {
    "target": ["tag:production"],
    "app": {
      "tailscale.com/split-dns": [
        {
          "comment": "Production DNS resolvers",
          "nameservers": [
            {
              "addr": "10.0.2.53"
            }
          ],
          "domains": [
            "internal.example.com"
          ]
        }
      ]
    }
  }
]
```

不带 `tag:production` 标签的设备会继续使用全局拆分 DNS 配置来解析 `internal.example.com`。

### 引用应用连接器域名

你可以在拆分 DNS 策略中引用[应用连接器][docs-app-connectors]的域名，而不必逐一列出所有域名。这样能让你的 DNS 配置与应用连接器定义保持同步。

下面的示例引用一个名为 `saas-apps` 的应用连接器：

```json
"nodeAttrs": [
  {
    "target": ["group:employees"],
    "app": {
      "tailscale.com/split-dns": [
        {
          "comment": "Employee access to SaaS apps",
          "nameservers": [
            {
              "addr": "10.0.2.100"
            }
          ],
          "domains": [
            "appc:saas-apps"
          ]
        }
      ]
    }
  }
]
```

Tailscale 处理此策略时，会把它展开为 `saas-apps` 应用连接器定义中的所有域名。如果应用连接器的域名列表发生变化，你的拆分 DNS 策略会自动反映这些变化。

### 为特定设备移除拆分 DNS

你可以通过提供空的名称服务器列表，为特定域名移除拆分 DNS 配置。下面的示例为带 `tag:external` 标签的设备移除 `internal.example.com` 的拆分 DNS 配置：

```json
"nodeAttrs": [
  {
    "target": ["tag:external"],
    "app": {
      "tailscale.com/split-dns": [
        {
          "comment": "Remove internal DNS for external devices",
          "nameservers": [],
          "domains": [
            "internal.example.com"
          ]
        }
      ]
    }
  }
]
```

匹配此策略的设备不会收到 `internal.example.com` 的任何拆分 DNS 配置，即使全局拆分 DNS 配置或低优先级策略为该域名指定了名称服务器。

### 使用 DNS over HTTPS

你可以使用 [DNS over HTTPS（DoH）][docs-dns-over-https] URL 配置名称服务器。下面的示例为所有设备使用 DoH 解析器：

```json
"nodeAttrs": [
  {
    "target": ["*"],
    "app": {
      "tailscale.com/split-dns": [
        {
          "comment": "Use DoH for example.com",
          "nameservers": [
            {
              "addr": "https://resolver.example.com/dns-query"
            }
          ],
          "domains": [
            "example.com"
          ]
        }
      ]
    }
  }
]
```

对于需要引导解析（`bootstrapResolution`）以避免循环 DNS 依赖的 DoH URL，请指定预先解析好的 IP 地址：

```json
"nameservers": [
  {
    "addr": "https://resolver.example.com/dns-query",
    "bootstrapResolution": ["192.0.2.1", "192.0.2.2"]
  }
]
```

Tailscale 会使用这些 IP 地址连接 DoH 服务器，而无需通过 DNS 解析其主机名。

### 为出口节点使用配置 DNS

你可以控制设备流量经由[出口节点][docs-exit-nodes]路由时是否使用某个名称服务器。`useWithExitNode` 字段指定在出口节点路由生效时，该名称服务器是否仍应解析查询。

下面的示例配置两个具有不同出口节点行为的名称服务器：

```json
"nameservers": [
  {
    "addr": "198.51.100.1"
  },
  {
    "addr": "198.51.100.2",
    "useWithExitNode": true
  }
]
```

当设备使用出口节点时，Tailscale 只用 `198.51.100.2` 为指定域名做 DNS 解析，然后把得到的流量经出口节点路由出去。当设备不使用出口节点时，两个名称服务器都可用。未指定时，`useWithExitNode` 字段默认为 `false`。

## 参考

本节提供拆分 DNS 策略配置结构与可用选项的详细信息。

### tailnet 策略文件结构

你在 tailnet 策略文件的 `nodeAttrs` 部分定义拆分 DNS 策略。每个条目由一个决定哪些设备接收策略的目标选择器，以及 `tailscale.com/split-dns` 应用类型下的一个或多个拆分 DNS 策略组成。

完整的结构为：

```json
"nodeAttrs": [
  {
    "target": ["<target-selector>"], // The devices to which this policy applies
    "app": {
      "tailscale.com/split-dns": [ // The split DNS application capability
        {
          "comment": "<description>", // Optional comment
          "priority": 0, // Positive or negative integer
          "nameservers": [
            {
              "addr": "<dns-server-address>", // IPv4, IPv6, address:port, or DoH URL
              "bootstrapResolution": ["<ip-address>"], // Optional list of IPs for DoH bootstrap
              "useWithExitNode": false // Use even when using an exit node
            }
          ],
          "domains": [
            "<domain-name>" // Domains to which this policy applies
          ]
        }
      ]
    }
  }
]
```

你可以用不同的目标选择器定义多个 `nodeAttrs` 条目。每个条目的 `tailscale.com/split-dns` 数组中可以包含多个拆分 DNS 策略。

### 字段定义

**`comment`**（可选）：用于文档说明的自由文本字段，不影响策略行为。使用描述性注释能让你的 tailnet 策略文件更易维护。

**`priority`**（可选）：决定策略处理顺序的整数。未指定时默认为 `0`。Tailscale 按优先级升序处理策略。不要使用重复的优先级取值，否则可能导致不可预测的行为。

**`nameservers`**（必需）：名称服务器条目列表，定义由哪些 DNS 服务器解析指定域名。你可以提供空列表来移除所列域名的既有策略。每个名称服务器条目都必须有 `addr` 字段，并支持可选的 `bootstrapResolution` 与 `useWithExitNode` 字段。

**`domains`**（必需）：名称服务器适用的域名列表。你可以用标准 DNS 记法直接指定域名，例如 `example.com` 或用 `*.example.com` 表示通配符。你也可以用 `appc:name` 格式引用应用连接器配置，其中 name 对应 tailnet 策略文件中的某个应用连接器定义。引用应用连接器时，Tailscale 会把它展开为该连接器域名列表中的所有域名。策略必须至少指定一个域名才有效。

### 名称服务器配置

`nameservers` 列表中的每个条目支持以下字段：

**`addr`**（必需）：DNS 解析器的地址。可以是标准用户数据报协议（UDP）和传输控制协议（TCP）DNS 解析器的纯 IPv4 或 IPv6 地址、格式为 `address:port` 的带端口 IP 地址（带端口的 IPv6 地址用 `[IPv6-address]:port`），或 DNS over HTTPS（DoH）的 HTTPS URL。

**`bootstrapResolution`**（可选）：DoH URL 中主机名的预解析 IP 地址列表。此字段仅在 `addr` 指定 DoH URL 时适用。引导解析让 Tailscale 无需通过 DNS 解析 DoH 服务器的主机名即可连接它，从而避免循环依赖。例如，如果你的 DoH URL 是 `https://resolver.example.com/dns-query`，可以指定 `["192.0.2.1", "192.0.2.2"]` 为 `resolver.example.com` 提供静态 IP 地址。对于知名的公共 DNS 解析器，Tailscale 可能已经知道其 IP 地址，无需引导解析。

**`useWithExitNode`**（可选）：一个布尔值，指示设备的流量经出口节点路由时是否使用该名称服务器。未指定时默认为 false。设为 true 时，Tailscale 会用你指定的解析器完成 DNS 解析，再把得到的流量经出口节点路由出去。

### 优先级系统

优先级系统决定 Tailscale 应用拆分 DNS 策略的顺序。当多条策略影响相同域名时，理解优先级对获得可预测的行为至关重要。

Tailscale 按以下顺序应用策略：

1. 先处理负优先级取值的策略（例如 `-2`、`-1`）。
2. 应用你 tailnet 的全局拆分 DNS 配置。
3. 应用应用连接器的 DNS 配置。
4. 最后处理零或正优先级取值的策略（例如 `0`、`1`、`2`）。

当多条策略为同一域名定义名称服务器时，优先级最高的策略优先生效。空的 `nameservers` 列表会显式移除指定域名的所有既有拆分 DNS 配置，包括来自低优先级策略的配置。

### 目标选择器

每个 `nodeAttrs` 条目中的 `target` 字段决定哪些设备接收拆分 DNS 策略。你可以使用节点属性支持的任何选择条件：

* **通配符**：`*` 匹配 tailnet 中的所有设备。
* **标签**：`tag:production` 匹配带 production 标签的设备。
* **组**：`group:employees` 匹配 employees 组中的设备。
* **多个目标**：`["tag:production", "tag:staging"]` 匹配满足任一所列条件的设备。

单台设备可以匹配多个 `nodeAttrs` 条目。发生这种情况时，控制平面会收集所有匹配的策略，按优先级排序后再应用。这种定向能力让你可以创建随组织结构而变的 DNS 配置。

更多信息请参阅[目标与选择器][docs-targets]文档。

## 限制

拆分 DNS 策略有以下限制：

* **Alpha 版本**：该功能处于 alpha 阶段。请联系你的 Tailscale 客户经理申请访问。
* **不支持可视化编辑器**：你必须直接在管理控制台中编辑 tailnet 策略文件来配置拆分 DNS 策略，可视化编辑器不支持此功能。
* **只能通过 tailnet 策略文件配置**：配置只能通过 tailnet 策略文件完成。没有用于管理这些策略的应用程序接口（API）或命令行界面（CLI）支持。
* **过渡方案**：在更全面的 DNS 配置功能开发完成之前，该功能只是权宜之计。长期方案完成后，其实现与配置方式可能会改变。
* **无法按设备控制 MagicDNS**：你不能用拆分 DNS 策略为特定设备启用或禁用 MagicDNS、覆盖本地 DNS 设置、在不同设备间使用不同的全局 DNS 服务器，或按设备自定义搜索域。
* **由控制平面处理策略**：[控制平面][docs-control-data-planes]处理策略并把预配置的 DNS 设置下发给客户端。客户端无法在本地覆盖这些设置。

## 未来方向与反馈

拆分 DNS 策略有意保持克制，只为满足当前客户需求，无需投入大量开发资源。该功能不是 Tailscale DNS 配置的长期方向。一个更全面的方案正在开发中，它将把所有拆分 DNS 配置迁移到 tailnet 策略文件中，并提供更灵活的 DNS 管理。

待全面的 DNS 方案完成后，Tailscale 会评估是把拆分 DNS 策略升级为 beta、将其保留为面向特定情况的专用工具，还是以新系统取代并弃用它。这一做法既满足当前客户需求，又为未来的改进保留灵活性。

作为一项 alpha 功能，拆分 DNS 策略非常依赖你的反馈。如果你遇到问题、有改进建议或需要更多功能，请联系你的 Tailscale 客户经理或支持团队。你的意见将帮助塑造这项功能以及更长期的 DNS 配置方案。

[docs-app-connectors]: /docs/features/app-connectors

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-dns-over-https]: /docs/reference/faq/magicdns

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-policy-syntax-node-attributes]: /docs/reference/syntax/policy-file#node-attributes

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet]: /docs/concepts/tailnet

[docs-targets]: /docs/reference/targets-and-selectors
