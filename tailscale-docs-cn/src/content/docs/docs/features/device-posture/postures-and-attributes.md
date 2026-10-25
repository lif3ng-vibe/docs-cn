---
title: "理解设备态势与属性"
description: "态势是设备访问你的 tailnet 时必须满足的一组安全规则。你可以将态势配置为包含与特定设备属性相关的断言，例如设备的操作系统或其所运行的 Tailscale 版本"
---

最后验证于 Oct 6, 2026

态势（posture）是设备访问你的 tailnet 时必须满足的一组安全规则。你可以将态势配置为包含与特定设备属性相关的断言（assertion），例如设备的操作系统或其所运行的 Tailscale 版本。例如，某个态势可能包含这样的断言：设备的操作系统（属性）必须是 macOS 或 Windows（条件）。你还可以指定当设备未满足态势时如何向用户告警。

## 设备态势属性

设备态势属性是你要检查的设备特征。属性可以包括预填充的主机信息（如操作系统版本）、通过 postures API 设置的自定义属性，或从集成的终端检测与响应（EDR）和移动设备管理（MDM）工具同步的属性。请注意，属性的可用性[因套餐而异][docs-posture-plans]。

> **注意：**
>
> 你可以在 **Machine Details** 页面的 **Attributes** 区域查看 tailnet 中每台设备的属性及对应取值。

属性以键值对数据的形式附加到设备上，可以是字符串、数字、布尔值或 IP 地址，并存在于命名空间中。例如，属性键 `node:os` 位于 `node` 命名空间，键 `custom:myAttribute` 位于 `custom` 命名空间。

态势属性将来自多个不同来源的数据汇聚到一处：

* 设备报告的主机信息，例如 `node` 命名空间中的操作系统版本和 Tailscale 版本。
* 由 Tailscale 控制平面收集的客户端设备信息，例如 `ip` 命名空间中设备公网 IP 的地理位置数据。
* 由你自己或你接入 Tailscale API 的软件在 `custom` 命名空间中设置的自定义态势属性。当设备通过 [OAuth 应用进行设备预配][docs-device-provisioning]时，也可以自动分配自定义属性。
* 由设备态势集成设置的属性，例如 [CrowdStrike Falcon][docs-crowdstrike] 和[其他集成][docs-posture-integrations]。

> **注意：**
>
> 态势属性与 [`nodeAttrs`][docs-syntax-nodeattrs] 不同。已有的 `nodeAttrs` 仅作为标志（flag）设置，而不是键值对。

### 默认属性

以下态势属性目前默认可用，可在访问规则态势中使用，也可配合设备属性 API 使用。

\[缺少代码片段：attributes-tailscale.mdx]

> **注意：**
>
> 仅当启用 Tailscale 内置的[自动更新][docs-update-auto-updates]时，`node:tsAutoUpdate` 属性才会被设为 `true`。当 Tailscale 通过外部机制（如 Apple App Store 或 Google Play Store）更新时，该属性会被设为 `false`。

### 地理位置属性

Tailscale 控制平面还提供带地理位置数据的设备态势属性。这些属性在 Standard、Premium 和 Enterprise 套餐中可用。

\[缺少代码片段：attributes-ip.mdx]

> **注意：**\`ip:publicAddress\` 设备态势属性目前处于 beta 阶段。

> **注意：**
>
> `ip:publicAddress` 设备态势属性可与 `IN`、`NOT IN`、`==` 和 `!=` 运算符配合使用。用于比较的允许值为单个 IPv4 或 IPv6 地址、IP 子网（CIDR），或 [IP 集合（IP set）][docs-ip-set]。

## 设备态势

态势是设备必须满足的一组安全规则。在态势中，你声明哪些属性应满足什么条件。每条态势断言必须包含一个属性、一个运算符和一个值。设备必须满足态势中的每一条断言才算匹配该态势。你还可以指定失败行为（failure behavior），说明当设备未满足态势时如何向用户告警。

态势定义在策略文件（tailnet policy file）中，也可以通过可视化策略编辑器添加到策略文件。你可以在一个策略文件中创建多个态势。

如果态势中定义的某个属性对某台设备未设置，则无论使用哪种运算符，该态势都不会匹配这台设备。例如，未被分配 `custom:tier` 属性的设备不会匹配包含属性 `custom:tier` 的态势，即使该条件是否定式的（例如 `custom:tier != 'prod'`）。

> **提示：**
>
> 有关查看设备态势状态以及为未通过态势的设备设置警报的信息，参见[设备态势的监控与警报][docs-posture-failure]。

### 态势定义示例

下面的态势定义展示了示例态势 `latestApple`，包含断言和失败行为。

```json
"postures": {
  "posture:latestApple": {
    "assertions": [
      "node:os IN ['macos', 'ios']",
      "node:tsVersion >= '1.98'",
],
    "onFailure": {
      "showAlerts": [
      "badge-in-console",
      "notify-in-client",
      ], //options: "badge-in-console", "warn-in-client", "notify-in-client"
      "endUserMessage": "Reach out to #helpdesk on Slack for help",
    }
  }
}
```

该示例态势包含以下断言：

* 操作系统必须是 macOS 或 iOS。
* 设备上运行的 Tailscale 版本必须是 1.98 或更高。

此示例中的 `onFailure` 部分规定，未通过设备的用户会通过以下三种方式收到通知：

* 在管理控制台中添加徽标。
* 向最终用户的设备发送通知。
* 将消息 `"Reach out to #helpdesk on Slack for help"` 发送到最终用户的客户端。

有关失败行为和用户通知的更多信息，参见[设备态势的监控与警报][docs-posture-failure]。

### 态势运算符

你可以在态势中使用以下运算符。

* `==`
* `!=`
* `IN`
* `NOT IN`
* `IS SET`
* `NOT SET`
* `<`、`<=`、`>=`、`>`（仅适用于数字和版本属性：`node:osVersion` 和 `node:tsVersion`）

版本比较使用一个[比较函数][xt-gh-tailscale-cmpver]，该函数能处理同时包含数字和非数字字段的版本号。

### 将态势添加到访问规则

态势是访问规则的一项功能。创建态势后，你必须将其作为条件添加到现有访问规则中，使其作为访问要求生效。包含态势的访问规则，除源、目标和协议外，还以该态势为条件。

有关将态势添加到访问规则的更多信息，参见[态势与访问规则][docs-posture-access-rules]。

## 默认源态势

你可以设置一个默认态势，应用到所有未另行指定态势条件的访问规则。默认态势不是叠加式的，也就是说，如果某个访问规则指定了态势条件，则只有该条件生效，默认源态势条件不会应用。

在默认态势中，你需要指定其他已创建的态势。如果包含多个态势，设备只需满足其中之一即视为满足默认态势。

```json
"defaultSrcPosture": [
  "posture:basicWindows",
  "posture:basicMac",
  "posture:basicLinux",
],
```

有关默认源态势及其如何应用于访问规则的更多信息，参见[默认态势与访问规则][docs-device-posture-default-access]。

> **警告：**
>
> `defaultSrcPosture` 条件只作用于来自同一网络内 Tailscale 节点的流量，因为只有这些设备具有可依据定义态势进行评估的属性值。共享节点以及[子网路由器][docs-subnets]后面的设备，其流量不会基于态势受到限制，只要它们匹配基于 IP 的条件（`src`、`dst`、`proto`）就会被允许访问。

## Tailscale SSH 与态势

通过 [Tailscale SSH Console][docs-tailscale-ssh-console] 创建的连接同样受态势条件限制。要允许这些连接，你可以放行态势条件 `node:os == 'js'`。

## 共享节点与态势

通过 `srcPosture` 和 `defaultSrcPosture` 指定的态势条件仅应用于你 tailnet 内的 `src` 设备。如果你使用 Tailscale 的[节点共享][docs-sharing]向 tailnet 之外的用户授予某台设备的访问权限，则该用户的设备无论态势如何都可以连接。

如果你希望态势条件也作用于外部用户，考虑[邀请他们加入你的 tailnet][docs-invite-any-user]。

## 态势属性 API

有关设备态势属性 API 的信息，见我们的 [API 文档][co-api-get-device-posture-attrs]。

## 审计日志事件

设备态势新增了以下[审计日志事件][docs-audit-logging-events]。

| **Target**   | **Action**              | **说明**                                   |
| ------------ | ----------------------- | ------------------------------------------------- |
| Node changed | Update device attribute | 节点的设备态势属性发生了变更 |

> **注意：**
>
> 内置属性（`node` 和 `ip` 命名空间中的属性）的变更，只有在该属性被策略文件中任一态势引用时才会记录。来自设备态势集成的自定义属性和第三方属性的变更则始终会记录。

[docs-posture-access-rules]: /docs/features/device-posture/postures-in-access-rules

[docs-device-posture-default-access]: /docs/features/device-posture/postures-in-access-rules#default-postures-and-access-rules

[docs-posture-failure]: /docs/features/device-posture/monitoring-postures

[docs-posture-plans]: /docs/features/device-posture#usage-by-plan

[docs-posture-integrations]: /docs/features/device-posture/integrations

[co-api-get-device-posture-attrs]: https://tailscale.com/api#tag/devices/GET/device/%7BdeviceId%7D/attributes

[docs-access-control]: /docs/features/access-control

[docs-audit-logging-events]: /docs/features/logging/audit-logging#events

[docs-crowdstrike]: /docs/integrations/crowdstrike-zta

[docs-device-provisioning]: /docs/features/oauth-apps/device-provisioning

[docs-filter-devices-search-bar]: /docs/features/access-control/device-management/how-to/filter#filter-with-the-search-bar

[docs-filter-devices]: /docs/features/access-control/device-management/how-to/filter

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-ip-set]: /docs/features/tailnet-policy-file/ip-sets

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acls

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-syntax-nodeattrs]: /docs/reference/syntax/policy-file#nodeattrs

[docs-tailscale-ssh-console]: /docs/features/tailscale-ssh/tailscale-ssh-console

[docs-update-auto-updates]: /docs/features/client/update#auto-updates

[docs-zero-trust]: /docs/concepts/zero-trust

[xt-gh-tailscale-cmpver]: https://github.com/tailscale/tailscale/blob/main/util/cmpver/version.go
