---
title: "访问规则中的态势"
description: "设备态势是设备访问你的 tailnet 时必须满足的[一组安全规则][docs-device-postures-attributes]。态势是访问规则的一项功能，创建态势后，你必须将其作为条件添加到现有访问规则中"
---

最后验证于 Oct 6, 2026

设备态势是设备访问你的 tailnet 时必须满足的[一组安全规则][docs-device-postures-attributes]。态势是访问规则的一项功能，创建态势后，你必须将其作为条件添加到现有访问规则中。

> **注意：**
>
> 创建设备态势本身不会强制执行任何要求。必须将其添加到访问规则，其限制才会生效。

## 态势作为访问规则中的条件

包含设备态势条件的访问规则，除源、目标和协议要求外，还以态势是否满足为条件。条件中的态势不是叠加式的；如果条件中包含多个态势，只需满足其中一个即视为满足态势要求。

## 示例

以下示例展示了带态势条件的授权（grant）。态势条件通过 `srcPosture` 键添加到策略文件（tailnet policy file）中的访问规则。

```json
"grants": [
  {
    // To fulfill the posture condition, devices must meet the `anyMac` posture
    "src": ["autogroup:member"],
    "dst": ["tag:development"],
    "ip": ["*"],
    "srcPosture": ["posture:anyMac"]
  },
  {
    // Only devs can access production
    // To fulfill the posture condition, devices must meet the `latestMac` posture
    "src": ["group:dev"],
    "dst": ["tag:production"],
    "ip": ["*"],
    "srcPosture": ["posture:latestMac"]
  }
]
```

你可以向同一条访问规则添加多个态势。在下面的示例中，只要连接设备满足三个指定态势中的任意一个，态势条件即告满足，允许访问生产环境。

```json
"grants": [
  {
    "src": ["group:dev"],
    "dst": ["tag:production"],
    "ip": ["*"],
    "srcPosture": ["posture:approvedMacs", "posture:approvedWindows", "posture:approvedLinux"]
  }
]
```

## 默认态势与访问规则

你可以设置一个默认态势条件，应用到所有未另行指定态势条件的访问规则。默认态势不是叠加式的，也就是说，如果某个访问规则指定了态势条件，则只有该条件生效，默认源态势条件不会应用。

默认态势由一个或多个态势组成。与访问规则中的 `srcPosture` 条件一样，只要满足所提供的任意一个态势，默认态势条件即告满足。下面的示例默认态势，只要设备满足列出的三个态势中的任意一个即告满足。

```json
"defaultSrcPosture": [
  "posture:basicWindows",
  "posture:basicMac",
  "posture:basicLinux",
],
```

下面的授权示例展示了默认态势条件何时会被访问规则强制执行、何时不会。

```json
"grants": [
  {
    // defaultSrcPosture applies to this rule, no other posture condition is included
    "src": ["autogroup:member"],
    "dst": ["tag:intranet"],
    "ip": ["*"]
  },
  {
    "src": ["group:dev", "group:sre"],
    "dst": ["tag:production"],
    "ip": ["*"],
    // A posture condition is included; this posture condition is instead of, not in addition to, the default source posture
    "srcPosture": ["posture:prodWin", "posture:prodMac"]
  }
]
```

> **警告：**
>
> `defaultSrcPosture` 条件只作用于来自同一网络内 Tailscale 节点的流量，因为只有这些设备具有可依据定义态势进行评估的属性值。共享节点以及[子网路由器][docs-subnets]后面的设备，其流量不会基于态势受到限制，只要它们匹配基于 IP 的条件（`src`、`dst`、`proto`）就会被允许访问。

[docs-device-postures-attributes]: /docs/features/device-posture/postures-and-attributes

[docs-subnets]: /docs/features/subnet-routers

## 查看设备态势状态

有关查看设备态势状态以及配置与未通过态势相关通知的步骤，参见[设备态势的监控与警报][docs-posture-failure]。

[docs-filter-devices]: /docs/features/access-control/device-management/how-to/filter

[docs-posture-failure]: /docs/features/device-posture/monitoring-postures
