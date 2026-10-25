---
title: "在授予访问权限前强制设备合规"
description: "在受监管环境中，验证设备在访问敏感资源之前符合安全标准是核心要求。传统做法依赖 VPN 集中器搭配"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选解决方案指南：
>
> [**保护生产 PostgreSQL 数据库免受未加密 MacBook 的访问**](/docs/solutions/protect-postgresql-unencrypted-macbooks)——使用授权根据 MacBook 的加密状态自动路由 PostgreSQL 流量：已加密设备获得直接访问，未加密设备的连接则被监控。

在受监管环境中，验证设备在访问敏感资源之前符合安全标准是核心要求。传统做法依赖 VPN 集中器搭配网络访问控制（NAC）设备，既增加复杂性，又引入单点故障。

Tailscale 的[设备态势][docs-device-posture]功能让你从 tailnet 中的每台设备收集安全属性，例如操作系统版本、磁盘加密状态或 EDR 健康评分，并在访问规则中直接强制这些属性。不再合规的设备会自动失去访问权限，无需人工干预。

## 启用设备身份收集

设备身份收集会从 tailnet 中的设备采集序列号和其他标识符。这些标识符用于把设备与 [EDR 和 MDM][docs-device-posture-mdm] 平台等第三方安全工具进行匹配。

1. 打开 Tailscale 管理控制台，选择**设备管理**（Device Management）> **设备态势集成**（Device Posture Integrations）。

2. 把**设备身份收集**（Device Identity Collection）开关打开。这需要[管理员](/docs/reference/user-roles)权限。

3. 让每台设备选择加入身份报告。在每台设备上运行以下命令：

#### Linux

```bash
sudo tailscale set --posture-checking=true
```

#### macOS

```bash
tailscale set --posture-checking=true
```

#### Windows

```powershell
tailscale set --posture-checking=true
```

> **提示：**
>
> 对于受管设备群，通过你的 MDM 方案部署 `PostureChecking` 系统策略，而不要在每台设备上单独运行 CLI 命令。

## 在策略文件中定义态势条件

态势条件是对设备属性的具名断言集合。在你的 [tailnet 策略文件][docs-tailnet-policy-file]的 `postures` 部分定义它们。这需要了解 [tailnet 策略文件语法][docs-tailnet-policy-syntax]，尤其是 `postures` 和 `grants` 部分。

### 示例：仅使用内置属性

这一态势要求设备运行较新的 Tailscale 稳定版本：

```json
"postures": {
  "posture:upToDate": [
    "node:tsReleaseTrack == 'stable'",
    "node:tsVersion >= '1.60'"
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### （可选）添加第三方集成属性

`node:os` 和 `node:tsVersion` 等内置态势属性在所有套餐中都可用。要获得更丰富的合规信号（例如 EDR 健康评分、MDM 注册状态或磁盘加密状态），请在管理控制台的**设备管理**（Device Management）> **设备态势集成**（Device Posture Integrations）下连接[第三方集成][docs-device-posture-mdm]。

> **注意：** 第三方态势集成适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

以下示例展示了使用 [CrowdStrike Falcon][docs-crowdstrike] 和 [Microsoft Intune][docs-intune] 集成属性的态势条件。

#### CrowdStrike Zero Trust Assessment 评分

```json
"postures": {
  "posture:trustedEndpoint": [
    "falcon:ztaScore >= 70"
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

#### Intune 合规与加密

```json
"postures": {
  "posture:intuneManagedDevice": [
    "intune:complianceState == 'compliant'",
    "intune:isEncrypted == true"
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

#### 结合集成按操作系统设置要求

当你的设备群包含多个操作系统时，为每个系统分别定义态势，并在访问规则中组合使用：

```json
"postures": {
  "posture:compliantMac": [
    "node:os == 'macos'",
    "node:osVersion >= '14.0.0'",
    "intune:complianceState == 'compliant'",
    "intune:isEncrypted == true"
  ],
  "posture:compliantWindows": [
    "node:os == 'windows'",
    "intune:complianceState == 'compliant'",
    "intune:isEncrypted == true"
  ],
  "posture:compliantLinux": [
    "node:os == 'linux'",
    "node:tsReleaseTrack == 'stable'",
    "node:tsVersion >= '1.60'"
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

> **注意：**
>
> 单个态势中的所有条件必须全部满足才能匹配（AND 逻辑）。如果某属性在设备上未设置，该态势就不会匹配该设备，即使使用 `!=` 这类否定运算符也一样。

## 把态势条件应用到访问规则

在[授权][docs-grants]规则中使用 `srcPosture`，根据设备合规状态限制对资源的访问。只有满足态势条件的设备才能访问目标。

```json
"grants": [
  {
    "src": ["autogroup:member"],
    "dst": ["tag:production"],
    "ip": ["*"],
    "srcPosture": ["posture:compliantMac", "posture:compliantWindows", "posture:compliantLinux"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

在 `srcPosture` 中列出多个态势时，设备只需匹配其中**任意一个**即可（OR 逻辑）。在上面的示例中，macOS 设备只需满足 `posture:compliantMac`。

### 为所有规则设置默认态势

要为整个 tailnet 强制执行基线而不必给每条规则都加 `srcPosture`，使用 `defaultSrcPosture`：

```json
"defaultSrcPosture": [
  "posture:compliantMac",
  "posture:compliantWindows",
  "posture:compliantLinux"
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

任何未指定自身 `srcPosture` 的授权规则都会继承默认值。指定了 `srcPosture` 的规则则完全覆盖默认值。默认值不是叠加关系。

> **提示：**
>
> 若有意让某条规则的访问限制更宽松，可在该规则上把 `srcPosture` 设为空列表 `[]` 来覆盖默认值。

## 验证合规状态

配置态势条件后，确认设备正在上报预期的属性。

1. 在管理控制台中打开[机器](https://console.tailscale.com/admin/machines)页面。
2. 选择一台设备查看其详情。
3. 查看**态势属性**（Posture attributes）部分，找到设备当前上报的属性。

你也可以从命令行查看设备的属性：

```bash
tailscale status --json | jq '.Self.CapMap'
```

或者通过 Tailscale API 查询属性：

```bash
curl -s -H "Authorization: Bearer $TS_API_KEY" \
  "https://api.tailscale.com/api/v2/device/{deviceId}/attributes"
```

如果设备缺少预期属性，请检查：

* 设备身份收集已启用，且设备已选择加入。
* 相关集成已连接并同步成功。
* 设备的 Tailscale 客户端为 1.52 或更高版本。

> **注意：**
>
> 态势条件只适用于同一 tailnet 内原生 Tailscale 节点的流量。被共享的节点以及经由子网路由器访问资源的设备会绕过态势检查，仅按基于 IP 的规则评估。

[docs-crowdstrike]: /docs/integrations/crowdstrike-zta

[docs-device-posture]: /docs/features/device-posture

[docs-device-posture-mdm]: /docs/features/device-posture/integrations

[docs-grants]: /docs/features/access-control/grants

[docs-intune]: /docs/integrations/mdm/intune

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet-policy-syntax]: /docs/reference/syntax/policy-file
