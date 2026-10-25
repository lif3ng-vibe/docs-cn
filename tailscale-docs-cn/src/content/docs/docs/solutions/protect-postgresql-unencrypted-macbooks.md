---
title: "保护生产 PostgreSQL 数据库免受未加密 MacBook 的访问"
description: "使用授权根据 MacBook 的加密状态自动路由 PostgreSQL 流量，为加密设备提供直连访问，同时监控未加密设备的连接。"
---

最后验证于 Jan 13, 2026

生产数据库访问通常要求设备已加密，但开发团队中常常有成员的 MacBook 尚未满足加密要求。安全策略迫使你做出非此即彼的选择：要么授予完全访问权，要么彻底拒绝。团队最终只能在阻断关键工作与制造破坏合规性的安全例外之间二选一。

Tailscale 的[条件路由][docs-via]通过[基于设备加密状态][docs-device-posture]路由数据库流量化解了这一两难。未加密的 MacBook 不会被直接拒绝访问。它们的 [PostgreSQL][xt-postgresql] 连接会经过安全网关（[子网路由器][docs-subnets]），网关可以施加增强的日志与控制。已加密的设备直连以获得最佳性能，未加密的设备则通过受监控的路径保持连接。

完成本指南后，你将拥有一个自动化的 PostgreSQL 路由系统：它为所有开发者保持连接能力，同时按设备合规状态施加相应等级的安全控制。

> **提示：**
>
> 本指南的示例面向使用 MacBook 访问生产 PostgreSQL 数据库的工程团队，采用了安全网关模式。你可以用这一模式为其他团队或使用场景创建类似的安全网关模式。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个 Tailscale 账户。如果还没有，请[创建免费的 Personal 账户](https://login.tailscale.com/start)。
* 拥有修改 tailnet 策略文件和管理设备标签的 [Admin](/docs/reference/user-roles) 权限。
* 了解 [tailnet 策略文件语法][docs-tailnet-policy-syntax]，尤其是 `grants`、`postures` 和 `tagOwners` 部分。
* 至少一台可以充当数据库监控网关基础设施[子网路由器][docs-subnets]的 Linux 服务器。
* 生产 PostgreSQL 数据库。
* 你的服务器上已安装并运行 Tailscale 客户端。请按照[在 Linux 上安装 Tailscale][docs-install-linux]的说明安装 Tailscale 客户端。
* 具有不同加密特征的测试设备（每台都安装并运行了 Tailscale 客户端）：
  * 至少一台启用了 [FileVault][xt-filevault] 加密、运行 macOS Ventura 13.4 或更高版本的 MacBook。
  * 至少一台禁用了 FileVault 加密的 MacBook，用于测试路由行为。
* （可选）测试设备上已安装 PostgreSQL 客户端工具，用于验证连接。

## 第 1 步：定义设备加密要求

第一步是使用[设备态势策略][docs-device-posture]定义设备加密要求。这些策略通过评估 [FileVault][xt-filevault] 加密状态（以及 Tailscale 能在已连接设备上检测到的其他安全属性），确定哪些 MacBook 有资格直连数据库、哪些应经由网关路由。

磁盘加密状态取决于你所使用的[移动设备管理（MDM）集成][docs-device-posture-mdm]：

| 集成                            | 属性键                              |
| ------------------------------- | ----------------------------------- |
| [Jamf Pro][docs-jamf-pro]       | `jamfPro:fileVaultStatus`           |
| [SentinelOne][docs-sentinelone] | `sentinelOne:encryptedApplications` |

开始配置：在管理控制台中打开你的 [tailnet 策略文件][docs-tailnet-policy-file]。然后找到 tailnet 策略文件中的 `postures` 部分（如不存在则新建），添加适用于你设备的态势定义：

Jamf Pro 示例：

```json
"postures": {
  "posture:encryptedMacBook": [
    "node:os == 'macos'",
    "node:osVersion >= '13.4.0'",
    "node:tsReleaseTrack == 'stable'",
    "jamfPro:fileVaultStatus == 'ALL_ENCRYPTED'"
  ]
}
```

SentinelOne 示例：

```json
"postures": {
  "posture:encryptedMacBook": [
    "node:os == 'macos'",
    "node:osVersion >= '13.4.0'",
    "node:tsReleaseTrack == 'stable'",
    "sentinelOne:encryptedApplications == true"
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

这条 `encryptedMacBook` 态势策略验证设备运行 macOS Ventura 13.4.0 或更高版本、使用稳定的 [Tailscale 发布版][docs-tailscale-releases]，并且启用了 FileVault 磁盘加密。只有所有条件都为真，MacBook 才符合该态势，从而有资格直连数据库。任何一条条件不满足的 MacBook 都不会匹配要求该态势的授权，而是落到其他适用的授权上——经由监控基础设施路由。

保存策略文件，将态势定义应用到你的 tailnet。

定义好加密要求后，你可以为数据库监控网关创建标签了。

## 第 2 步：为安全网关和数据库创建身份

在这一步，你将为系统中各个工作部件建立标识，包括安全网关、使用 MacBook 的开发者以及数据库。数据库监控网关和数据库属于服务型资产，因此使用[标签][docs-tags]；开发者则使用 `group`（群组）。

首先，为安全网关和数据库创建基于标签的身份。做法是在 tailnet 策略文件中定义 `tagOwners`。标签所有者可以把标签应用到设备，并管理已打标签基础设施的生命周期。

找到 tailnet 策略文件中的 `tagOwners` 部分（如不存在则新建），为你的数据库监控网关定义标签：

```json
"tagOwners": {
  "tag:db-gateway": ["security-admin@yourcompany.com"]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

然后，为数据库定义标签：

```json
"tagOwners": {
  "tag:prod-database": ["security-admin@yourcompany.com"]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

> **提示：**
>
> 在这个例子中，只有邮箱为 `security-admin@yourcompany.com` 的用户可以管理 `tag:db-gateway` 和 `tag:prod-database` 标签。不过，你可以根据需要把多个用户、群组甚至其他标签添加为标签所有者。

接下来，在监控网关服务器上运行以下命令，使用 [Tailscale CLI][docs-cli] 将 `tag:db-gateway` 标签分配给监控网关服务器：

```shell
sudo tailscale login --advertise-tags=tag:db-gateway
```

这条命令会把 `tag:db-gateway` 标签分配给监控网关服务器。

标签配置完毕。现在你将为团队创建一个群组，这样你就能从一个地方管理所有开发者的权限。

## 第 3 步：为你的开发团队创建身份

在这一步，你将为开发团队创建一个群组，用它来标识 tailnet 中的开发者，而不必逐一引用他们的电子邮箱地址。

在 tailnet 策略文件中，创建一个名为 `group:developers` 的群组，并把开发者的电子邮箱地址加入该群组。本例使用两个电子邮箱地址，你可以按需添加任意数量。

```json
"groups": {
  "group:developers": ["user1@yourcompany.com", "user2@yourcompany.com"]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

保存策略文件，将群组定义应用到你的 tailnet。

创建好群组后，你就可以配置条件数据库授权了。

## 第 4 步：设置条件访问策略

在这一步，你将配置条件授权，根据设备加密状态路由数据库连接。

[授权][docs-grants]定义访问控制策略，既决定开发者可以访问哪些数据库资源，也决定他们的 PostgreSQL 流量如何到达这些资源。把态势要求与 `via` 字段结合，你可以创建根据设备加密状态路由数据库连接的授权。

首先，找到 tailnet 策略文件中的 `grants` 部分（如不存在则新建），为已加密的 MacBook 添加授权：

```json
"grants": [
  {
    "src": ["group:developers"],
    "dst": ["tag:prod-database"],
    "srcPosture": ["posture:encryptedMacBook"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

这条授权为 MacBook 满足加密设备态势要求（`posture:encryptedMacBook`）的开发团队成员（`group:developers`）提供 PostgreSQL 数据库直连。`srcPosture` 字段确保只有合规设备才匹配这条授权，从而获得降低延迟、提升性能的优化路由。

然后，在加密设备授权之后添加回退授权：

```json
"grants": [
  {
    "src": ["group:developers"],
    "dst": ["tag:prod-database"],
    "srcPosture": ["posture:encryptedMacBook"]
  },
  {
    "src": ["group:developers"],
    "dst": ["tag:prod-database"],
    "via": ["tag:db-gateway"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

第二条授权充当监控回退，捕获开发团队中未被第一条授权匹配的所有 PostgreSQL 流量。由于它没有 `srcPosture` 要求，无论加密状态如何它都会匹配设备。[`via`][docs-via] 字段把这部分流量路由到打了数据库网关标签的设备，你可以在那里施加额外的日志与控制。

保存策略更改并将其应用到你的 tailnet。

配置好授权后，你就可以部署数据库监控网关了。

## 第 5 步：启动安全网关

数据库监控网关是一台[子网路由器][docs-subnets]，负责拦截并路由来自未加密 MacBook 的 PostgreSQL 流量。你必须把这台服务器配置为子网路由器来处理流量转发，然后分配 `tag:db-gateway` 标签使其承担路由职责。监控网关服务器接收所有试图访问生产数据库的未加密 MacBook 的 PostgreSQL 流量。在选择硬件和部署位置时，请考虑这台服务器的网络位置、性能需求和日志能力。

> **注意：**
>
> 数据库监控网关必须具备子网路由器功能，因为它需要在你的 tailnet 与生产数据库网络之间转发 PostgreSQL 流量。普通 tailnet 设备只能收发自己的流量。子网路由器会宣告额外的网络路由，从而能代表其他设备转发流量。

首先，根据你的网络拓扑和预期的 PostgreSQL 流量规模，选择一台 Linux 服务器充当数据库监控网关。这台服务器应有足够的网络容量和存储空间来保存全面的数据库连接日志。然后，在选定的监控网关服务器上运行以下命令，启用[子网路由器][docs-subnets]功能并分配数据库网关[标签][docs-tags]：

```shell
sudo tailscale up --advertise-routes=<subnet-range> --advertise-tags=tag:db-gateway
```

将 `<subnet-range>` 替换为包含你生产 PostgreSQL 数据库的实际子网范围（例如 `10.0.100.0/24`）。这会把数据库网络宣告给你的 tailnet，并使该服务器能够向这些资源转发流量。

接着，在管理控制台中批准这些子网路由：前往 [Machines](https://console.tailscale.com/admin/machines) 页面，找到监控网关服务器，并启用已宣告的路由。

部署好数据库监控网关后，你可以通过分别从一台已加密和一台未加密的 MacBook 测试连接路径，验证数据库路由行为是否符合预期。

## 第 6 步：验证数据库路由行为

数据库监控网关基础设施部署完成后，当开发者的 MacBook 尝试访问生产 PostgreSQL 数据库时，Tailscale 会将设备属性与 `posture:encryptedMacBook` 进行比对。如果设备已加密，第一条授权匹配，授予数据库直连权限。如果设备未加密，第一条授权不匹配，第二条授权匹配，流量经由监控网关路由。我们来测试这一行为。

首先，找一台满足 `posture:encryptedMacBook` 定义中所有要求的已加密 MacBook。直接在这台 MacBook 上运行 [`tailscale status` 命令][docs-cli]验证其合规状态：

```shell
tailscale status --json | grep -E "(OS|Version|DiskEncrypted)"
```

确认输出显示 `"OS": "macos"`、版本号为 13.4.0 或更高，以及 `"DiskEncrypted": true`。

然后，检查连接路径，确认它绕过了监控网关：

```shell
tailscale ping <database-name>.<tailnet-name>.ts.net
```

将 `<database-name>` 和 `<tailnet-name>` 替换为你的生产数据库和 tailnet 名称的实际值。

应能看到直连生产数据库、没有经过监控网关服务器的中间跳点。`tailscale ping` 的结果应显示一条通往你数据库基础设施的直接路径。

接下来，从一台未加密的 MacBook（禁用了 FileVault 的设备）尝试访问同一个生产数据库，然后通过检查连接路径验证 PostgreSQL 流量是否经由你的监控网关基础设施路由：

```shell
tailscale ping <database-name>.<tailnet-name>.ts.net
```

`tailscale ping` 的结果应显示经由你的监控网关服务器的连接，而不是直连。这证明未加密的 MacBook 按预期经由监控基础设施路由。

## 结语

你实现了基于设备加密状态的数据库路由，自动执行安全边界，同时为开发团队保持 PostgreSQL 访问能力。系统会评估 MacBook 的加密状态，无需人工干预即可将流量路由到合适的网络路径。

你的 tailnet 策略文件的最终版本应如下所示：

```json
"postures": {
  "posture:encryptedMacBook": [
    "node:os == 'macos'",
    "node:osVersion >= '13.4.0'",
    "node:tsReleaseTrack == 'stable'",
    "node:diskEncrypted == true"
  ]
}
"tagOwners": {
  "tag:db-gateway": ["security-admin@yourcompany.com"],
  "tag:prod-database": ["security-admin@yourcompany.com"]
}
"groups": {
  "group:developers": ["user1@yourcompany.com", "user2@yourcompany.com"]
}
"grants": [
  {
    "src": ["group:developers"],
    "dst": ["tag:prod-database"],
    "srcPosture": ["posture:encryptedMacBook"]
  },
  {
    "src": ["group:developers"],
    "dst": ["tag:prod-database"],
    "via": ["tag:db-gateway"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

## 进一步探索

你可以扩展这一方案以满足特定的安全需求。例如：

* 在安全网关上配置[日志][docs-logging]，并与你的 SIEM 系统集成进行异常检测。
* 为从非合规设备发起的紧急访问添加[即时访问][docs-just-in-time-access]工作流，并保留审计追踪。
* 扩展态势检查范围，纳入证书、杀毒软件状态或 [MDM][docs-mdm] 集成。
* 部署区域级网关基础设施以降低延迟。
* 根据合规等级创建分层访问级别，而不是非黑即白的决策。

[docs-cli]: /docs/reference/tailscale-cli

[docs-device-posture-mdm]: /docs/features/device-posture/integrations

[docs-device-posture]: /docs/features/device-posture

[docs-grants]: /docs/features/access-control/grants

[docs-install-linux]: /docs/install/linux

[docs-jamf-pro]: /docs/integrations/jamf-pro

[docs-just-in-time-access]: /docs/features/tailscale-accessbot-jit

[docs-logging]: /docs/features/logging

[docs-mdm]: /docs/integrations/partners/mdm

[docs-sentinelone]: /docs/integrations/sentinelone

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet-policy-syntax]: /docs/reference/syntax/policy-file

[docs-tailscale-releases]: /docs/install/unstable

[docs-via]: /docs/features/access-control/grants/grants-via

[xt-filevault]: https://support.apple.com/guide/deployment/intro-to-filevault-dep82064ec40/web

[xt-postgresql]: https://www.postgresql.org/
