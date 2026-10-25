---
title: "tailnet 策略文件语法参考"
description: "你可以在 tailnet 策略文件中编写 Tailscale [访问控制][docs-access-control]规则，例如 [ACL][docs-acls]和[授权][docs-grants]，策略文件以 [human JSON（HuJSON）][xt-gh-tailscale-hujson]表达。"
---

最后验证于 Apr 8, 2026

你可以在 tailnet 策略文件中编写 Tailscale [访问控制][docs-access-control]规则，例如 [ACL][docs-acls]和[授权][docs-grants]，策略文件以 [human JSON（HuJSON）][xt-gh-tailscale-hujson]表达。

tailnet 策略文件包含以下顶层部分：

| 部分                               | 键              | 类型           | 用途                                                                                                                                         |
| ---------------------------------- | --------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [授权（grants）][ar-grants]        | `grants`        | 访问控制       | 创建网络级和应用级访问控制策略，支持可选的路由过滤。访问控制策略优先使用 grants。                                                            |
| [ACL][ar-acls]                     | `acls`          | 访问控制       | 创建网络级访问控制策略。                                                                                                                     |
| [SSH][ar-ssh]                      | `ssh`           | 访问控制       | 指定谁可以使用 Tailscale SSH。                                                                                                               |
| [自动批准][ar-autoapprovers]       | `autoApprovers` | 自动化         | 指定谁可以跳过审批流程来通告子网路由器、出口节点和应用连接器。                                                                               |
| [节点属性][ar-nodeattrs]           | `nodeAttrs`     | 属性           | 为设备和用户应用附加属性。                                                                                                                   |
| [设备态势][ar-postures]            | `postures`      | 属性           | 定义设备态势规则，供访问控制策略引用。                                                                                                       |
| [标签所有者][ar-tag-owners]        | `tagOwners`     | 目标           | 定义谁可以给你的 tailnet 中的设备分配哪些标签。                                                                                              |
| [群组][ar-groups]                  | `groups`        | 目标           | 定义命名的用户、设备和子网群组，供访问控制策略及其他定义引用。                                                                               |
| [主机][ar-hosts]                   | `hosts`         | 目标           | 为设备和子网定义命名别名。                                                                                                                   |
| [IP 集][ar-ipsets]                 | `ipsets`        | 目标           | 定义命名的网段，供访问控制策略及其他定义引用。                                                                                               |
| [测试][ar-tests]                   | `tests`         | 测试           | 编写测试，对不应发生变化的访问策略（ACL 和网络级授权）进行断言。                                                                             |
| [SSH 测试][ar-sshtests]            | `sshTests`      | 测试           | 编写测试，对不应发生变化的 Tailscale SSH 进行断言。                                                                                          |

\[Missing snippet: visual\_policy\_editor.mdx]

## 授权（grants）

授权（grant）是一种更新、更强大的访问控制方式。ACL 能做的它都能做，而且功能更多。在与目标设备通信时，你可以向一组设备或用户授予[应用层][xt-wiki-application-layer]能力。你也可以继续定义传统的[网络层][xt-wiki-network-layer]能力。例如，你可以用一条授权规则让一组用户访问服务器上的 `8443` 端口，*同时*定义他们可以在该服务器上编辑哪些文件。

授权体系把网络层和应用层能力合并到同一套语法中，因此对资源访问提供了更强的灵活性和更细粒度的控制。每条授权只需要一个源和一个目标。由于 Tailscale 采用默认拒绝策略，每条授权都带有隐含的 *accept* 动作。

[**授权**](/docs/features/access-control/grants)——跨网络连接和应用权限授予访问控制权限。

[**授权语法**](/docs/reference/syntax/grants)——Tailscale 授权体系的完整参考文档。

## ACL

\[Missing snippet: acls\_legacy\_note.mdx]

`acls` 部分列出你 tailnet 的访问规则。每条规则把访问权从一组来源授予一组目标。

访问规则可以使用[群组][ar-groups]和[标签][docs-tags]把访问权授予预先定义的用户集合，并把服务角色账户分配给节点。群组和标签相结合，可以构建强大的[基于角色的访问控制（RBAC）][bl-rbac-meant-to-be]策略。

Tailscale 会自动把所有 ACL 转换为更底层的规则，即允许从源 IP 地址到目标 IP 地址和端口的流量。

以下示例展示了一条带有 `action`、`src`、`proto` 和 `dst` 的访问规则。

```json
{
  "action": "accept",
  "src": [ <list-of-sources> ],
  "proto": "tcp", // optional
  "dst": [ <list-of-destinations> ],
}
```

> **注意：**
>
> tailnet 策略的 `acl` 部分支持旧字段 `users` 和 `ports`，但最佳实践是使用 `src`（代替 `users`）和 `dst`（代替 `ports`）。

### `action`

Tailscale 访问规则默认拒绝访问。因此唯一可能的 `action` 是 `accept`。`accept` 允许流量从源（`src`）流向目标（`dst`）。

### `src`

`src` 字段指定规则适用的来源列表。列表中的每个元素可以是以下之一：

| **类型**                          | **示例**                     | **描述**                                                                                                                                                                                                        |
| --------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任意                              | `*`                          | 来自你 tailnet 中 Tailscale 设备、任何已批准子网以及 `autogroup:shared` 的所有流量。不允许来自非 Tailscale 设备的流量（除非是已批准的路由）。                                                                   |
| 用户                              | `shreya@example.com`         | 包含该用户的所有设备。                                                                                                                                                                                          |
| [群组][ar-groups]                 | `group:<group-name>`         | 包含该群组中的所有用户。                                                                                                                                                                                        |
| Tailscale IP                      | `100.100.123.123`            | 仅包含拥有该 Tailscale IP 的设备。IPv6 地址必须遵循 `[1:2:3::4]:80` 格式。                                                                                                                                      |
| [子网][docs-subnets] CIDR 范围    | `192.168.1.0/24`             | 包含该子网内的任意 IP 地址。                                                                                                                                                                                    |
| [主机][ar-hosts]                  | `my-host`                    | 包含 `hosts` 部分中的 Tailscale IP 地址或 CIDR。                                                                                                                                                                |
| [标签][docs-tags]                 | `tag:production`             | 包含具有该标签的所有设备。                                                                                                                                                                                      |
| [Autogroup][ar-autogroups]        | `autogroup:<role\|property>` | 包含具有相同属性或角色的用户设备、目标或用户名。                                                                                                                                                                |
| [Autogroup（all）][ar-autogroups] | `autogroup:danger-all`       | 一个特殊的 autogroup，选择包括你 tailnet 之外在内的所有来源。                                                                                                                                                   |

你可以选择性地加入 `srcPosture` 字段，把 `src` 设备进一步限制为符合一组[设备态势条件][docs-device-posture-device-posture-conditions]的设备。

### `proto`

`proto` 字段是可选字段，用于指定规则适用的协议。不指定协议时，访问规则适用于所有 TCP 和 UDP 流量。

你可以把 `proto` 指定为 [IANA IP 协议编号][xt-iana-protocol-numbers] `1-255`（例如 `"16"`）或受支持的命名别名之一。

展开查看所有命名别名。

| **协议**                                    | **`proto`**        | **IANA 协议编号**        |
| ------------------------------------------- | ------------------ | ------------------------ |
| 互联网组管理协议（IGMP）                    | `igmp`             | `2`                      |
| IPv4 封装                                   | `ipv4`, `ip-in-ip` | `4`                      |
| 传输控制（TCP）                             | `tcp`              | `6`                      |
| 外部网关协议（EGP）                         | `egp`              | `8`                      |
| 任意私有内部网关                            | `igp`              | `9`                      |
| 用户数据报（UDP）                           | `udp`              | `17`                     |
| 通用路由封装（GRE）                         | `gre`              | `47`                     |
| 封装安全载荷（ESP）                         | `esp`              | `50`                     |
| 认证头（AH）                                | `ah`               | `51`                     |
| 流控制传输协议（SCTP）                      | `sctp`             | `132`                    |

> **注意：**
>
> 关于 `proto` 字段的说明：
>
> * 必须使用 Tailscale v1.18.2 或更高版本才能使用 `proto` 字段。更早的版本会失败并阻断带协议的访问规则。
> * 如果某对 IP 地址之间的流量被允许，那么 ICMP 也会被允许。
> * 只有 TCP、UDP 和 SCTP 流量支持指定端口。其他协议只支持 `*` 作为协议端口。

### `dst`

`dst` 字段指定规则适用的目标列表。列表中的每个元素以 `<host>:<ports>` 格式指定一个 `host` 和一个或多个 `ports`。

`host` 可以是以下任意类型：

| **类型**                                                | **示例**                  | **描述**                                                                                                                                                                                                                                                |
| ------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任意                                                    | `*`                       | 包含任何目标（无限制）。                                                                                                                                                                                                                                |
| 用户                                                    | `shreya@example.com`      | 包含当前以该用户身份登录的任何设备。                                                                                                                                                                                                                    |
| [群组][ar-groups]                                       | `group:<group-name>`      | 包含该群组中的所有用户。                                                                                                                                                                                                                                |
| Tailscale IP 地址                                       | `100.100.123.123`         | 仅包含拥有该 Tailscale IP 地址的设备。                                                                                                                                                                                                                  |
| [主机][ar-hosts]                                        | `example-host-name`       | 包含 [`hosts` 部分][ar-hosts]中的 Tailscale IP 地址。                                                                                                                                                                                                   |
| [子网][docs-subnets] CIDR 范围                          | `192.168.1.0/24`          | 包含给定子网内的任意 IP 地址。                                                                                                                                                                                                                          |
| [标签][docs-tags]                                       | `tag:<tag-name>`          | 包含具有该标签的任何设备。                                                                                                                                                                                                                              |
| 通过[出口节点][docs-exit-nodes]访问互联网               | `autogroup:internet`      | 包含可以通过[出口节点][docs-exit-nodes]访问互联网的设备。                                                                                                                                                                                               |
| 自己的设备                                              | `autogroup:self`          | 选择用户自己的设备。`autogroup:self` 是一个特殊的 autogroup 选择器，与 `autogroup:<role>`、`group:<name>` 或单个用户的 `src` 选择器组合使用时，可以允许用户从自己的设备访问自己的设备。                                                                 |
| tailnet 设备                                            | `autogroup:member`        | 包含用户作为 tailnet 直接成员（而非共享用户）所在 tailnet 中的设备。                                                                                                                                                                                    |
| 管理员设备                                              | `autogroup:admin`         | 包含用户为[管理员（Admin）][docs-user-roles-admin]的设备。                                                                                                                                                                                              |
| 网络管理员设备                                          | `autogroup:network-admin` | 包含用户为[网络管理员][docs-user-roles-network-admin]的设备。                                                                                                                                                                                           |
| IT 管理员设备                                           | `autogroup:it-admin`      | 包含用户为 [IT 管理员][docs-user-roles-it-admin]的设备。                                                                                                                                                                                                |
| 计费管理员设备                                          | `autogroup:billing-admin` | 包含用户为[计费管理员][docs-user-roles-billing-admin]的设备。                                                                                                                                                                                           |
| 审计员设备                                              | `autogroup:auditor`       | 包含用户为[审计员][docs-user-roles-auditor]的设备。                                                                                                                                                                                                     |
| 所有者设备                                              | `autogroup:owner`         | 包含用户为 tailnet [所有者（Owner）][docs-user-roles-owner]的设备。                                                                                                                                                                                     |
| [IP 集][docs-ipsets]                                    | `ipset:<ip-set-name>`     | 包含该 IP 集中的所有目标。                                                                                                                                                                                                                              |

`ports` 字段可以是以下任意类型：

| **类型** | **描述**                                               | **示例**    |
| -------- | ------------------------------------------------------ | ----------- |
| 任意     | 包含任何端口号。                                       | `*`         |
| 单个     | 包含单个端口号。                                       | `22`        |
| 多个     | 包含以逗号分隔的两个或多个端口号。                     | `80,443`    |
| 范围     | 包含一个端口范围。                                     | `1000-2000` |

### 子网路由器与出口节点

ACL 不会限制路由的发现。如果一台设备是[子网路由器][docs-subnets]，你可以独立于子网来限制对它的访问。如果一台设备是[出口节点][docs-exit-nodes]，你可以独立于其公网 IP 地址来限制对它的访问。

要限制对某个子网的访问，请确保没有 ACL 授予对这些路由的访问。你可以用一条测试来强制做到这一点：如果任何规则意外授予了访问权，测试就会失败。以下示例演示了一条测试：如果 `not-allowed@example.com` 被允许访问 `198.51.100.7:22`，测试就会失败。

```json
"tests": [
  {
    "src": "not-allowed@example.com",
    "accept": ["192.0.2.100:22"], // allow access to the Tailscale IP
    "deny": ["198.51.100.7:22"], // does not allow access to the subnet
  }
],
```

只有能访问 `autogroup:internet` 的设备才能使用出口节点。所有其他设备（无法访问 `autogroup:internet`）不能使用出口节点。你可以用一条测试来强制做到这一点：如果任何规则意外授予对公网地址的访问权，测试就会失败。以下示例测试在 `not-allowed@example.com` 能访问 `198.51.100.8:22` 时失败。

```json
"tests": [
  {
    "src": "not-allowed@example.com",
    "accept": ["192.0.2.100:22"], // allow access to the Tailscale IP
    "deny": ["198.51.100.8:22"], // does not allow access to a public IP
  }
],
```

ACL 无法限制对特定出口节点的使用。相关进展请参阅 [issue #1567][xt-gh-tailscale-issue-1567]。

### 4via6 需要 IPv6 而非 IPv4

编写针对 [4via6 子网][docs-4via6-subnets]路由器后面资源的访问控制规则时，请使用 IPv6 CIDR 或地址作为目标，而不是 IPv4 地址。

使用 `tailscale debug via` 获取 IPv6 CIDR。

### Taildrop 优先级

即使你使用 ACL 限制访问，Taildrop 仍允许你在已登录的设备之间共享文件。

## 引用用户

> **注意：**用户功能适用于[所有套餐](https://tailscale.com/pricing)。

你可以在访问规则的源（`src`）和目标（`dst`）字段中指定用户。指定用户时，请使用以下格式之一（取决于用户的 Tailscale 登录方式）：

| **格式**               | **描述**                                                    | **示例**            |
| ---------------------- | ----------------------------------------------------------- | ------------------- |
| `username@example.com` | 用户使用电子邮件地址登录 Tailscale 时使用。                 | `alice@example.com` |
| `username@github`      | 用户使用 GitHub 账户登录 Tailscale 时使用。                 | `alice@github`      |
| `username@passkey`     | 用户使用 Passkey 登录 Tailscale 时使用。                    | `alice@passkey`     |

你可以使用群组来引用一组用户。群组让你能够定义基于角色的访问控制。群组有多种类型：

* 引用所有具有相同属性的用户的 autogroup。
* 在 tailnet 策略文件的 `groups` 部分中定义为特定用户列表的群组。
* 在身份提供方中预配置并通过用户和群组预配置同步的群组。

## Autogroup

> **注意：**Autogroup 适用于[所有套餐](https://tailscale.com/pricing)。

[Autogroup][docs-targets-autogroups] 是一种特殊的群组，会自动包含具有相同属性的用户、目标或用户名。

| **允许的用法**                                     | **Autogroup**             | **描述**                                                                                                                                                                                     | **各套餐可用性**                                                       |
| -------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 作为 `dst`                                         | `autogroup:internet`      | 用于允许任何用户通过你 tailnet 中的*任意*[出口节点][docs-exit-nodes]进行访问。                                                                                                               | [所有套餐][co-pricing]可用                                             |
| 作为 `dst`                                         | `autogroup:self`          | 用于允许任何通过与源相同的用户身份完成认证的用户进行访问。不适用于标签。                                                                                                                     | [所有套餐][co-pricing]可用                                             |
| 作为 `src` 或 `dst`、`tagOwner` 或 `autoApprover`  | `autogroup:owner`         | 用于允许 tailnet [所有者][docs-user-roles-owner]访问。                                                                                                                                       | [所有套餐][co-pricing]可用                                             |
| 作为 `src` 或 `dst`、`tagOwner` 或 `autoApprover`  | `autogroup:admin`         | 用于允许具有[管理员][docs-user-roles-admin]角色的任何用户访问。                                                                                                                              | [所有套餐][co-pricing]可用                                             |
| 作为 `src` 或 `dst`、`tagOwner` 或 `autoApprover`  | `autogroup:member`        | 用于允许作为 tailnet 直接成员（包括所有受邀用户）的任何用户访问。不包括来自共享设备的用户。                                                                                                  | [所有套餐][co-pricing]可用                                             |
| 作为 `src` 或 `dst`、`tagOwner` 或 `autoApprover`  | `autogroup:tagged`        | 用于允许作为[带标签][docs-tags]设备的任何用户访问。                                                                                                                                          | [所有套餐][co-pricing]可用                                             |
| 作为 `src` 或 `dst`、`tagOwner` 或 `autoApprover`  | `autogroup:auditor`       | 用于允许具有[审计员][docs-user-roles-auditor]角色的任何用户访问。                                                                                                                            | [Standard、Premium 和 Enterprise 套餐][co-pricing]可用                 |
| 作为 `src` 或 `dst`、`tagOwner` 或 `autoApprover`  | `autogroup:billing-admin` | 用于允许具有[计费管理员][docs-user-roles-billing-admin]角色的任何用户访问。                                                                                                                  | [Standard、Premium 和 Enterprise 套餐][co-pricing]可用                 |
| 作为 `src` 或 `dst`、`tagOwner` 或 `autoApprover`  | `autogroup:it-admin`      | 用于允许具有 [IT 管理员][docs-user-roles-it-admin]角色的任何用户访问。                                                                                                                       | [Standard、Premium 和 Enterprise 套餐][co-pricing]可用                 |
| 作为 `src` 或 `dst`、`tagOwner` 或 `autoApprover`  | `autogroup:network-admin` | 用于允许具有[网络管理员][docs-user-roles-network-admin]角色的任何用户访问。                                                                                                                  | [Standard、Premium 和 Enterprise 套餐][co-pricing]可用                 |
| 作为 `src` 或 `dst`                                | `user:*@<domain>`         | 用于允许登录名属于指定域名且是 tailnet 直接成员（包括受邀用户）的任何用户访问。不包括来自共享设备的用户。                                                                                     | [所有套餐][co-pricing]可用                                             |
| 作为 `src`                                         | `autogroup:shared`        | 用于允许接受了你的网络[共享][docs-sharing]邀请的任何用户访问。这让你无需预先知道电子邮件地址即可编写规则。                                                                                    | [所有套餐][co-pricing]可用                                             |
| 作为 [SSH][ar-ssh] 用户                            | `autogroup:nonroot`       | 用于允许 [Tailscale SSH][docs-tailscale-ssh] 访问除 `root` 之外的任何用户。                                                                                                                  | [所有套餐][co-pricing]可用                                             |
| 作为 [SSH][ar-ssh] 用户                            | `localpart:*@<domain>`    | 用于允许 [Tailscale SSH][docs-tailscale-ssh] 访问其名称与用户登录名[本地部分（local-part）][xt-rfc-2822-3.4.1]匹配的用户。                                                                   | [Premium 和 Enterprise 套餐][co-pricing]可用                           |

> **注意：**
>
> `autogroup:self` 仅适用于用户自有设备，不适用于带标签的设备。`autogroup:self` 不能与 `autogroup:tagged` 一起使用。

> **注意：**
>
> 旧版 autogroup `autogroup:members` 仍可继续使用，但最佳实践是改用 `autogroup:member`。同一个 tailnet 策略文件中不能同时使用 `autogroup:member` 和 `autogroup:members`。

以下 [`ssh` 规则][ar-ssh]示例允许所有用户以非 root 身份通过 Tailscale SSH 访问他们自己的设备：

```json
"ssh": [
  {
    // All users can SSH to their own devices, as non-root
    "action": "accept",
    "src": ["autogroup:member"],
    "dst": ["autogroup:self"],
    "users": ["autogroup:nonroot"]
  },
]
```

在默认 ACL 中，`ssh` 规则在 `dst` 字段使用 `autogroup:self`，并在 `users` 字段使用 `autogroup:nonroot`。如果你把 `dst` 字段从 `autogroup:self` 改为其他目标（例如某个 [ACL 标签](/docs/features/tags)），也请考虑替换 `users` 字段中的 `autogroup:nonroot`。如果不从 `users` 字段中移除 `autogroup:nonroot`，那么 `src` 设置所允许的任何人都能以 `dst` 设备上任意非 root 用户的身份 SSH 登录。

### 基于域名的 autogroup

有些 autogroup 包含特定的域名，例如 `user:*@example.com` 或 `localpart:*@example.com`。这些 autogroup 包含这样的用户：既是 tailnet 的成员，其登录名又属于该 autogroup 的域名。例如，如果 tailnet `example.com` 使用 autogroup `user:*@altostrat.com`，该群组会包含 `example.com` tailnet 中所有以 `@altostrat.com` 用户身份登录的成员（例如 `laura@altostrat.com`）。

autogroup 中使用的域名受到以下限制：

* 提供的域名不能是已知的共享域名（例如 `gmail.com`）。
* 如果 tailnet 使用了域名别名，必须在 ACL 中显式指定这些别名域名。例如，如果 `example.io` 是 `example.com` 的别名，而你想同时包含来自 `example.com` 和 `example.io` 的用户，请同时使用 `user:*@example.com` 和 `user:*@example.io`。
* 尽管表达式使用了通配符 `*`，但并不支持任意通配符。例如，`user:b*b@example.com` 不会匹配 `bob@example.com`。
* 基于域名的 autogroup 不能与[外部受邀用户][docs-invite-any-user]一起使用。基于域名的 autogroup 只包含电子邮件直接匹配（或通过域名别名匹配）tailnet 域名的成员。

## 群组（groups）

> **注意：**
>
> 群组功能在所有套餐上都可用。但你的 tailnet 支持的群组数量取决于套餐。更多信息请参阅我们的[定价][co-pricing]页面。

`groups` 部分让你创建用户群组，你可以在访问规则中使用它们（而不必逐一列出用户）。对群组成员资格的任何更改都会传播到引用该群组的所有规则。

以下示例演示创建一个 `engineering` 群组和一个 `sales` 群组。

```json
"groups": {
  "group:engineering": [
    "dave@example.com",
    "laura@example.com",
  ],
  "group:sales": [
    "brad@example.com",
    "alice@example.com",
  ],
},
```

每个群组名都必须以 `group:` 前缀开头。每个群组成员都用其完整的电子邮件地址指定，如上文[用户部分][ar-reference-users]所述。为避免群组成员身份被混淆的风险，群组不能包含其他群组。

你可以通过编辑 tailnet 策略文件（如上面的 `groups` 定义示例所示）来添加或移除用户的群组成员身份，也可以直接在管理控制台的[用户（Users）](https://console.tailscale.com/admin/users)页面操作。

### 从"用户"页面编辑用户的群组成员资格

你必须拥有[所有者、管理员或网络管理员](/docs/reference/user-roles)角色，才能在**用户（Users）**页面编辑用户的群组成员资格。

1. 打开管理控制台中的[用户（Users）](https://console.tailscale.com/admin/users)页面。
2. 按名称查找用户。
3. 选择菜单 > **编辑群组成员资格**。
4. 在**编辑群组成员资格**对话框中：
   1. 要添加群组，选择**添加到群组**，然后选择要添加的群组。
   2. 要移除群组，选择要删除的群组旁边的 **X**。
5. 完成该用户的群组编辑后，选择**保存**。

### 同步的群组

你可以在身份提供方中创建群组，并通过[用户和群组预配置][docs-user-group-provisioning-sync-groups]把它们与 Tailscale 的访问控制策略同步。

你可以在身份提供方中使用相同的人类可读群组名来引用 tailnet 策略文件中的群组。以下示例展示了一条为 `security-team` 群组管理访问的访问规则。

```json
{
  "grants": [
    {
      "src": ["group:security-team@example.com"],
      "dst": ["tag:logging"],
      "ip": ["*"]
    }
  ],
  "tagOwners": {
    "tag:logging": ["group:security-team@example.com"]
  }
}
```

你只能编辑 tailnet 策略文件中定义的群组。你可以使用从 SCIM（跨域身份管理系统）集成同步来的群组或 tailnet 的 autogroup，但不能编辑它们。

## 引用多台设备

你可以使用标签或主机为成组的设备定义访问规则。标签让你定义基于角色的访问控制，使不同的服务拥有不同的访问规则。主机让你基于对 IP 地址的引用来定义控制。

* 标签引用非用户设备的群组（例如应用或服务器）。例如，你可能有一个标签，把特定数据中心里的所有服务器归为一组。
* 主机按 IP 地址范围引用设备群组（tailnet 内外皆可）。例如，你可以用主机来指代那些 IP 地址固定、可能无法修改的应用。

### 标签

> **注意：**标签功能适用于[所有套餐](https://tailscale.com/pricing)。

tailnet 策略文件的 `tags` 部分让你创建把非人类设备分组的[标签][docs-tags]。然后你可以在 ACL 中使用这些标签来选择这些设备。

> **注意：**
>
> 在 ACL 中使用标签之前，必须先在 tailnet 策略文件的 [`tagOwners`][ar-tag-owners] 部分[定义该标签][docs-tags-defining-a-tag]。要为设备打标签，请在设备上[以该标签身份进行认证][docs-tags-tag-a-device]。

### 主机

> **注意：**主机功能适用于[所有套餐](https://tailscale.com/pricing)。

`hosts` 部分让你为 IP 地址或 CIDR 范围定义一个人类友好的名称。

以下示例展示了两个主机定义：一个针对单个 IP 地址，一个针对 CIDR 范围。

```json
"hosts": {
  "example-host-1": "198.51.100.100",
  "example-network-1": "198.51.100.0/24",
},
```

> **注意：**
>
> 人类友好的主机名不能包含 `@` 字符。

## 设备态势（postures）

> **注意：**设备态势功能适用于[所有套餐](https://tailscale.com/pricing)。

`postures` 部分让你定义一组[设备态势管理][docs-device-posture]规则，设备必须满足这些规则才能符合特定的访问规则。

每条态势（posture）都必须以 `posture:` 前缀开头并跟一个名称，由一组态势属性及其允许的值定义。

> **注意：**
>
> 单条态势可以用两种方式定义：对象语法（推荐）和数组语法（旧版）。
>
> 基于数组的语法（态势名映射到一组态势属性规则）将继续工作并被无限期支持，**但不会获得新特性**。
>
> 新特性（包括[对未通过态势的监控与告警][docs-device-posture-monitoring]）仅在基于对象的语法中可用，我们建议新的和现有的态势都采用它。
>
> 在同一个 tailnet 策略文件的同一个"postures"块中，可以对不同的态势混用两种语法。

### 推荐的态势语法

设备态势推荐使用基于对象的语法。

在基于对象的语法中，每条态势都是一个 JSON 对象，包含一个 `assertions` 数组和一个可选的 `onFailure` 块。

以下示例展示如何使用 `postures` 选中运行 `node` 1.40 或更高版本的 macOS 设备。
未通过该态势的设备会在其 Tailscale 客户端图标上显示警告，用户打开 Tailscale 应用时可以看到警告消息。

```json
"postures": {
  "posture:latestMac": {
    "assertions": [
      "node:os IN ['macos']",
      "node:tsReleaseTrack == 'stable'",
      "node:tsVersion >= '1.40'",
    ],
    "onFailure": {
      "showAlerts": ["warn-in-client"],
      "endUserMessage": "You need to update your Mac. Contact IT helpdesk for detailed instructions."
    },
  }
},
```

以下示例定义了一条更简单的仅含断言（assertions）的基于对象的态势，设备未通过态势时不会收到告警：

```json
"postures": {
  "posture:upToDateMac": {
    "assertions": [
      "node:os IN ['macos']",
      "node:tsReleaseTrack == 'stable'",
      "node:tsVersion >= '1.40'",
    ],
  },
},
```

#### `assertions`

设备必须满足的态势条件列表。支持语法的详细说明请参阅[设备态势与属性][docs-device-posture-device-posture-attributes]。

#### `onFailure`

一个可选的块，定义当设备不满足态势断言时如何通知 tailnet 管理员和用户。如果省略，设备未通过态势时管理员和用户不会收到任何告警。

关于此功能的更多信息请参阅[设备态势监控与告警][docs-device-posture-monitoring]。

`onFailure` 块支持以下字段：

##### `showAlerts`

用于向用户呈现未通过情况的告警渠道列表。例如，`warn-in-client` 会在 Tailscale 客户端中显示一条警告横幅。

##### `endUserMessage`

向未通过态势检查的设备的用户显示的消息。用它给用户提供可操作的指引，例如如何更新设备或向谁寻求帮助。

### 旧版数组语法

> **警告：**
>
> 以旧版数组语法编写的态势将继续工作并被无限期支持，但不会获得新特性。
>
> 新特性（包括[对未通过态势的监控与告警][docs-device-posture-monitoring]）仅在[基于对象的语法][ar-object-syntax]中可用，我们建议新的和现有的态势都采用它。

以下示例展示如何使用 `postures` 选中运行 `node` 1.40 或更高版本的 macOS 设备。

```json
"postures": {
  "posture:latestMac": [
    "node:os IN ['macos']",
    "node:tsReleaseTrack == 'stable'",
    "node:tsVersion >= '1.40'",
  ],
},
```

每条态势都必须以 posture: 前缀开头并跟一个名称、一组态势属性及其允许的值，以字符串列表的形式给出。

## 标签所有者

> **注意：**标签功能适用于[所有套餐](https://tailscale.com/pricing)。

tailnet 策略文件的 `tagOwners` 部分定义了可分配给设备的标签，以及允许分配每个标签的用户列表。

以下示例展示了一个 `tagOwners` 定义，它：

* 把 `engineering` 群组设为 `webserver` 标签的所有者。
* 把 `president@example.com` 和 `security-admins` 群组设为 `secure-server` 标签的所有者。
* 把 `autogroup:member` autogroup 设为 `corp` 标签的所有者。

```json
"tagOwners": {
  "tag:webserver": [
    "group:engineering",
  ],
  "tag:secure-server": [
    "group:security-admins",
    "president@example.com",
  ],
  "tag:corp": [
    "autogroup:member",
  ],
}
```

每个标签名都必须以 `tag:` 前缀开头。标签所有者可以是用户的完整登录电子邮件地址（如上文[用户部分][ar-reference-users]所述）、[群组名][ar-groups]、[autogroup][ar-autogroups]或另一个标签。

可以使用简写 `[]` 来表示 `autogroup:admin`。也就是说，以下两种写法等价：

```json
"tag:monitoring": [
  "autogroup:admin",
],
```

```json
"tag:monitoring": [],
```

autogroup `autogroup:admin` 和 `autogroup:network-admin` 可以分配所有标签，因此 `[]` 隐含表示只有 `autogroup:admin` 和 `autogroup:network-admin` 可以分配标签。

## 自动批准（autoApprovers）

> **注意：**自动批准功能适用于[所有套餐](https://tailscale.com/pricing)。

tailnet 策略文件的 `autoApprovers` 部分定义了无需在管理控制台进一步批准即可执行特定操作的用户列表。Tailscale 中的某些操作需要双重确认：[管理员](/docs/reference/user-roles)既要在运行 Tailscale 的设备上启用，也要在 Tailscale 管理控制台中启用。这些操作包括：

* 作为子网路由器[通告一组指定路由][docs-subnets-subnet-router]。
* [通告出口节点][docs-exit-nodes-advertise-exit-node]。

对于路由，这也允许自动批准者通告指定路由的子集路由。

出现以下情况之一时，Tailscale 会停止通告路由：

* 该设备被另一个（无法通告该路由或出口节点的）用户重新认证。
* 通告该路由的用户被暂停或删除。

为了避免 Tailscale 停止通告路由的情况，可以考虑使用[标签][docs-tags]作为自动批准者。

以下示例展示了一个 `autoApprovers` 定义，它为 `alice@example.com`、`engineering` 群组成员以及打了 `foo` 标签的设备自动批准 `192.0.2.0/24` 路由，同时为打了 `bar` 标签的设备自动批准出口节点通告。

```json
"autoApprovers": {
  "routes": {
    "192.0.2.0/24": ["group:engineering", "alice@example.com", "tag:foo"],
  },
  "exitNode": ["tag:bar"],
}
```

路由或出口节点的自动批准者可以是用户的完整登录电子邮件地址（如上文[用户部分][ar-reference-users]所述）、[群组名][ar-groups]、[autogroup][ar-autogroups]或标签。

> **警告：**
>
> 自动批准策略只在 Tailscale 首次收到子网路由通告时生效。更新 tailnet 策略文件以添加或修改自动批准者，不会追溯批准现有的未批准路由。要为现有的未批准路由触发自动批准，请从子网路由器中移除该路由并重新通告。

## Tailscale SSH

> **注意：**Tailscale SSH tailnet 策略适用于[所有套餐](https://tailscale.com/pricing)。

tailnet 策略文件的 `ssh` 部分定义了可以使用 [Tailscale SSH][docs-tailscale-ssh] 的用户和设备列表（以及 SSH 用户）。要允许一条连接，tailnet 策略文件必须同时包含允许网络访问和 SSH 访问的规则：

1. 一条访问规则，允许从源到目标在 22 端口的连接。
2. 一条 SSH 访问规则，允许从源到目标、以给定 SSH 用户的连接。Tailscale SSH 用它来为通过认证的 SSH 连接分发密钥。

以下示例展示了一个 `ssh` 定义，要求一组源、目标和 SSH 用户每 20 小时重新认证一次。

```json
{
  "action": "check", // "accept" or "check"
  "src": [ <list-of-sources> ],
  "dst": [ <list-of-destinations> ],
  "users": [ <list-of-ssh-users> ],
  "checkPeriod": "20h", // optional, only for check actions. default 12h
  "acceptEnv": [ "GIT_EDITOR", "GIT_COMMITTER_*", "CUSTOM_VAR_V?" ], // optional, allowlists environment variables that can be forwarded from clients to the host
  "srcPosture": [ <list-of-posture-conditions> ], // optional, permit access only if the list of posture conditions apply
},
```

### `action`

指定是接受连接，还是对连接执行额外检查。

* `accept` 接受已在 tailnet 中完成认证的用户的连接。
* `check` 要求用户按照 `checkPeriod` 定期重新认证。

### `src`

指定来源（连接的发起方）。访问规则的目标（`dst`）只能定义为你自己、某个群组、某个标签或某个 autogroup。不能使用 `*`、其他用户、IP 地址或主机名。

创建访问规则时，无法保证 IP 地址或主机名的归属。作为安全措施，Tailscale 禁止在访问规则的 `dst` 字段中使用用户、IP 地址或主机名，以防止某个用户无意间访问不属于他的设备。Tailscale 还禁止任何允许多个用户访问单个用户设备的 `src` 和 `dst` 组合。

> **注意：**
>
> 向 `autogroup:member` 授予访问权时，如果目标设备与他们[共享][docs-sharing]，即使他们在你的 tailnet 中没有任何设备，也会同时向[外部受邀用户][docs-invite-any-user]授予访问权。

### `dst`

指定目标（连接的去向）。目标可以是标签、`autogroup:self`（当源只包含用户或群组时），或单个具名用户（当源只包含同一具名用户时）。存在这些限制是因为 Tailscale 不允许用户在用户自有设备上发起 Tailscale SSH 会话，除非源是同一用户拥有的设备。

不能为目标指定端口，因为唯一允许的端口是 `22`。不能把 `*` 指定为目标。

### `users`

> **注意：**此策略适用于[所有套餐](https://tailscale.com/pricing)。

指定主机上允许的用户名集合。Tailscale 只使用主机上已经存在的用户账户。

* 指定 `autogroup:nonroot` 以允许除 `root` 之外的任何用户。
* 指定 `localpart:*@<domain>`，当且仅当用户的登录电子邮件属于 `<domain>` 时，允许主机上名称与用户登录名[本地部分（local-part）][xt-rfc-2822-3.4.1]匹配的用户。Tailscale 不会对本地部分做任何特殊处理。例如，如果登录名是 `dave+sshuser@example.com`，Tailscale 会把它映射为 SSH 用户 `dave+sshuser`。此方法仅在 [Premium 和 Enterprise 套餐][co-pricing]可用。
* 如果未指定用户，Tailscale 将使用本地主机上的用户。也就是说，如果用户本地以 `alice` 登录，然后通过 SSH 连接到另一台设备，Tailscale SSH 会尝试以用户 `alice` 登录。

### `checkPeriod`

> **注意：**此策略仅在 [Premium 和 Enterprise 套餐](https://tailscale.com/pricing)可用。

当 `action` 为 `check` 时，`checkPeriod` 指定在要求重新检查之前允许连接存续的时间段。你可以以分钟或小时为单位指定时间。时间必须至少一分钟，至多 168 小时（一周）。

* 默认检查周期为 12 小时。
* 你也可以指定 `always`，要求每次连接都进行检查。使用 `always` 可能会导致快速连续打开大量 SSH 连接的自动化工具（例如 [Ansible][xt-ansible]）出现意外行为。

### `acceptEnv`

> **注意：**
>
> 主机必须运行 Tailscale v1.76.0 或更高版本才能使用 `acceptEnv`。

指定允许客户端通过 [`SendEnv`][xt-ssh-send-env] 或 [`SetEnv`][xt-ssh-set-env] 发送到主机的环境变量名白名单。

值可以包含 `*` 和 `?` 通配符。`*` 匹配零个或多个字符，`?` 匹配单个字符。

#### `acceptEnv` 示例

| `acceptEnv` | 允许通过                          | 拒绝                      |
| ----------- | --------------------------------- | ------------------------- |
| `*`         | `FOO_A` `FOO_B` `FOO_OTHER` `BAZ` |                           |
| `FOO_*`     | `FOO_A` `FOO_B` `FOO_OTHER`       | `BAZ`                     |
| `FOO_?`     | `FOO_A` `FOO_B`                   | `FOO_OTHER` `BAZ`         |
| `FOO_A`     | `FOO_A`                           | `FOO_B` `FOO_OTHER` `BAZ` |

### `srcPosture`

`srcPosture` 字段是一个设备态势条件数组，可用于进一步限制网络来源（`src`）。例如，你可以用 `srcPosture` 把访问限制为只允许运行特定版本 Tailscale 客户端的设备。

### 评估顺序

Tailscale 按从最严格到最宽松的顺序评估 SSH 访问规则：

* 先检查 check 策略
* 再检查 accept 策略

例如，如果你有一条 `accept` 规则允许用户 `alice@example.com` 访问某个资源，还有一条规则允许 `alice@example.com` 所属的 `group:devops` 以 `check` 方式访问该资源，那么将适用 `check` 规则。

> **注意：**
>
> 未修改过 tailnet 策略文件的 tailnet 有一条[默认 SSH 策略][docs-tailscale-ssh-ssh-access-rules]，允许用户以检查模式访问自己拥有的设备。

允许的连接类型只有：

* 从用户到自己拥有的设备（以任意用户身份，包括 `root`）。
* 从用户到[带标签][docs-tags]的设备（以任意用户身份，包括 `root`）。
* 从带标签的设备到另一台带标签的设备（任意标签）。来自带标签设备的 SSH 访问规则不能处于[检查模式][docs-tailscale-ssh-check-mode]。
* 从用户到与其[共享][docs-sharing]的带标签设备，前提是目标主机配置了 Tailscale SSH，且目标的 ACL 允许该用户通过 SSH 连接。

也就是说，允许的最宽泛策略是：

```json
{
  "grants": [
    {
      "src": ["*"],
      "dst": ["*"],
      "ip": ["*"]
    }
  ],
  "ssh": [
    {
      "action": "accept",
      "src": ["autogroup:member"],
      "dst": ["autogroup:self"],
      "users": ["root", "autogroup:nonroot"]
    },
    {
      "action": "accept",
      "src": ["autogroup:member"],
      "dst": ["tag:prod"],
      "users": ["root", "autogroup:nonroot"]
    },
    {
      "action": "accept",
      "src": ["tag:logging"],
      "dst": ["tag:prod"],
      "users": ["root", "autogroup:nonroot"]
    }
  ]
}
```

要允许用户只 SSH 到自己拥有的设备（以非 `root` 身份）：

```json
{
  "grants": [
    {
      "src": ["*"],
      "dst": ["*"],
      "ip": ["*"]
    }
  ],
  "ssh": [
    {
      "action": "accept",
      "src": ["autogroup:member"],
      "dst": ["autogroup:self"],
      "users": ["autogroup:nonroot"]
    }
  ]
}
```

要允许 `group:sre` 访问生产环境中打了 `tag:prod` 标签的设备：

```json
{
  "groups": {
    "group:sre": ["alice@example.com", "bob@example.com"]
  },
  "grants": [
    {
      "src": ["group:sre"],
      "dst": ["tag:prod"],
      "ip": ["*"]
    }
  ],
  "ssh": [
    {
      "action": "accept",
      "src": ["group:sre"],
      "dst": ["tag:prod"],
      "users": ["ubuntu", "root"]
    }
  ],
  "tagOwners": {
    // users in group:sre can apply the tag tag:prod
    "tag:prod": ["group:sre"]
  }
}
```

要允许 Alice 访问开发环境中打了 `tag:dev` 标签、且与她[共享][docs-sharing]的设备：

```json
{
  "ssh": [
    {
      "action": "accept",
      "src": ["alice@example.com"],
      "dst": ["tag:dev"],
      "users": ["root", "alice"]
    },
  ]
}
```

把主机用户与登录邮箱匹配起来可能很有用。例如，你可以允许 `dave@example.com` 以主机用户 `dave` 的身份进行认证。

要允许登录域名 `example.com` 中的任何 tailnet 成员，以其登录邮箱本地部分匹配的用户身份访问生产环境中打了 `tag:prod` 标签的设备：

```json
{
  "grants": [
    {
      "src": ["user:*@example.com"],
      "dst": ["tag:prod"],
      "ip": ["*"]
    }
  ],
  "ssh": [
    {
      "action": "accept",
      "src": ["user:*@example.com"],
      "dst": ["tag:prod"],
      "users": ["localpart:*@example.com"]
    }
  ]
}
```

## 节点属性

tailnet 策略文件的 `nodeAttrs` 部分定义应用于 tailnet 中特定设备的附加属性。

\[Missing snippet: node\_attrs\_vs\_app\_caps\_note.mdx]

节点属性的一个用途是为 tailnet 中的不同设备设置不同的 [NextDNS 配置][docs-nextdns]。以下示例展示了一个 `nodeAttrs` 定义，它面向 `my-kid@my-home.com` 和 `tag:server`，应用属性 `nextdns:abc123` 和 `nextdns:no-device-info`。

```json
"nodeAttrs": [
  {
    "target": ["my-kid@my-home.com", "tag:server"],
    "attr": [
      "nextdns:abc123",
      "nextdns:no-device-info",
    ],
  },
],
```

### `target`

指定这些属性应用于哪些节点（设备）。你可以用标签（`tag:server`）、用户（`alice@example.com`）、群组（`group:kids`）或 `*` 来选择设备。

### `attr`

指定应用于这些节点（设备）的属性。

例如：

* 属性 `nextdns:abc123` 指定 NextDNS 配置 ID `abc123`。使用时，该属性会覆盖全局 NextDNS 配置。
* 属性 `nextdns:no-device-info` 禁止向 NextDNS 发送设备元数据。

以下示例让 tailnet 成员可以在其节点上使用 [Tailscale Funnel][docs-funnel]：

```json
"nodeAttrs": [
  {
    "target": ["autogroup:member"],
    "attr":   ["funnel"],
  },
],
```

你可以使用 `nodeAttrs` 策略为特定设备启用 `randomize-client-port` 设置，而不必使用[全网策略设置][ar-randomizeclientport]。

```json
"nodeAttrs": [
  {
    "target": ["tag:office-network", "group:sea-office"],
    "attr":   ["randomize-client-port"],
  },
],
```

### `app`

指定应用于这些节点（设备）的应用层能力。

以下示例节点属性定义为 `example.com` 域配置 `example-connector` 标签。

```json
{
  "target": ["*"],
  "app": {
    "tailscale.com/app-connectors": [
      {
        "name": "example-app",
        "connectors": ["tag:example-connector"],
        "domains": ["example.com"],
        "routes": ["192.0.2.0/24"],
      },
    ],
  },
}
```

具体的应用以 `<domainName>/<capabilityName>` 的格式定义能力名称。该示例使用的是 `tailscale.com/app-connectors`。

每个能力关联的值是一个 JSON 对象数组，每个对象包含该能力特定的配置选项。

请参阅[应用连接器的工作方式][docs-app-connectors]和[使用应用连接器的最佳实践][docs-app-connectors-best-practices]主题。

## 测试（tests）

> **注意：**测试功能适用于[所有套餐](https://tailscale.com/pricing)。

`tests` 部分让你对访问控制策略（授权和 ACL）编写断言，这些断言会在每次 tailnet 策略文件变更时作为检查运行。如果某个断言失败，Tailscale 会拒绝更新后的 tailnet 策略文件并报错，错误消息会指出失败的测试。

通过测试可以确保你不会意外撤销重要权限或暴露关键系统。

`tests` 定义如下所示：

```json
"tests": [
  {
    "src": "dave@example.com",
    "srcPostureAttrs": {
      "node:os": "windows",
    },
    "proto": "tcp",
    "accept": ["example-host-1:22", "vega:80"],
    "deny": ["192.0.2.3:443"],
  },
],
```

### `src`

指定要测试的用户身份，可以是[用户的电子邮件地址][ar-reference-users]、[群组][ar-groups]、[标签][docs-tags]或映射到 IP 地址的[主机][ar-hosts]。测试用例从以该身份认证的设备的角度运行。

### `srcPostureAttrs`

指定评估访问规则中的态势条件时使用的[设备态势属性][docs-device-posture]（以键值对形式）。只有当访问规则包含[设备态势条件][docs-device-posture-device-posture-conditions]时才需要使用此字段。

### `proto`

指定 `accept` 和 `deny` 规则的 IP 协议，类似于 [ACL 规则][ar-acls]中的 `proto` 字段。省略时，测试会检查 TCP 或 UDP 访问。

测试互联网控制报文协议（ICMP）访问时，设置 `"proto": "icmp"` 并在目标中使用端口 `0`，因为 ICMP 不使用端口。以下示例测试用户 `alice@example.com` 可以 `ping` 打了 `tag:production` 标签的设备：

```json
"tests": [
  {
    "src": "alice@example.com",
    "proto": "icmp",
    "accept": ["tag:production:0"],
  },
],
```

### `accept` 和 `deny` 目标

指定要接受或拒绝的目标。列表中的每个目标都是 `host:port` 形式，其中 `port` 是单个数字端口，`host` 是以下之一：

| **类型**                           | **示例**                     | **描述**                                                                                                           |
| ---------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Tailscale IP                       | `100.100.123.123`            | 包含拥有该 Tailscale IP 地址的设备。IPv6 地址必须遵循 `[1:2:3::4]:80` 格式。                                       |
| [主机][ar-hosts]                   | `my-host`                    | 包含 `hosts` 部分中的 Tailscale IP 地址。                                                                          |
| 用户                               | `shreya@example.com`         | 包含以该用户身份登录的设备的 Tailscale IP 地址。                                                                   |
| [群组][ar-groups]                  | `group:security@example.com` | 包含以该群组代表性成员身份登录的设备的 Tailscale IP 地址。                                                         |
| [标签][docs-tags]                  | `tag:production`             | 包含打了该标签的设备的 Tailscale IP 地址。                                                                         |
| [服务][docs-tailscale-services]    | `svc:my-service`             | 包含与该服务关联的 Tailscale 虚拟 IP 地址。                                                                        |

> **警告：**
>
> 不能使用 CIDR（子网）表示法来测试子网范围。例如，`192.168.1.0/24` 无效。你必须改为逐个指定 IP 地址或主机名。

`src` 中的来源以及 `accept` 和 `deny` 中的目标必须指向具体实体，不支持 `*` 通配符。例如，`accept` 目标不能是 `tags:*`。

> **注意：**
>
> 旧版的 `allow`（而非 `accept`）在 ACL 中仍然可用。不过，最佳实践是使用 `accept`。

## SSH 测试

> **注意：**SSH 测试适用于[所有套餐](https://tailscale.com/pricing)。

`sshTests` 部分让你对 [Tailscale SSH][docs-tailscale-ssh] 访问规则编写断言。SSH 测试的工作方式与 ACL [测试][ar-tests]类似。

SSH 测试在 tailnet 策略文件变更时运行。如果某个断言失败，Tailscale 会拒绝更新后的 tailnet 策略文件并报错，错误详情会指出失败的测试。

以下示例展示了一个 `sshTests` 定义，对从 `dave@example.com` 到 `example-host-1` 的连接执行以下测试：

* 如果 SSH 用户是 `dave`，接受该连接。
* 如果 SSH 用户是 `admin`，检查该连接。
* 如果 SSH 用户是 `root`，拒绝该连接。

```json
"sshTests": [
  {
    "src": "dave@example.com",
    "dst": ["example-host-1"],
    "accept": ["dave"],
    "check": ["admin"],
    "deny": ["root"],
    "srcPostureAttrs": {
      "node:os": "windows",
    },
  },
],
```

### `src`

指定尝试以 SSH 连接的用户身份，可以是[用户的电子邮件地址][ar-reference-users]、[群组][ar-groups]、[标签][docs-tags]或映射到 IP 地址的[主机][ar-hosts]。测试用例从以该身份认证的设备的角度运行。

### `srcPostureAttrs`

指定评估访问规则中的态势条件时使用的[设备态势属性][docs-device-posture]（以键值对形式）。只有当访问规则包含[设备态势条件][docs-device-posture-device-posture-conditions]时才需要使用此字段。

### `dst`

指定 `src` 用户连接到的一个或多个目标，可以是[用户的电子邮件地址][ar-reference-users]、[群组][ar-groups]、[标签][docs-tags]或映射到 IP 地址的[主机][ar-hosts]。

### `accept`

指定零个、一个或多个用户名，允许他们在 `dst` 主机上登录且无需额外检查。请参阅 [`accept` 动作][ar-action-1]。

### `check`

指定零个、一个或多个用户名，在 `src` 用户通过额外检查后允许他们在 `dst` 主机上登录。请参阅 [`check` 动作][ar-action-1]。

### `deny`

指定零个、一个或多个用户名，（在任何情况下都）不允许他们在 `dst` 主机上登录。

## IP 集

IP 集是一种管理 IP 地址群组的方式。它可以封装一组 IP 地址、CIDR、主机、autogroup 和其他 IP 集。IP 集的主要好处是让你可以把多个网络部分归入一个集合，从而对整个集合（而非单个 IP 地址、主机或子网）应用访问控制策略。

请参阅 [IP 集文档][docs-ipsets]。

## 网络策略选项

> **注意：**网络策略选项适用于[所有套餐](https://tailscale.com/pricing)。

除了访问规则，tailnet 策略文件还包含一些用于特定目的的全网策略设置。大多数网络永远不需要指定这些。

### `derpMap`

`derpMap` 部分让你向网络添加[自定义 DERP 服务器][docs-custom-derp-servers]，设备会按需使用它们来中继流量。你也可以用这部分禁用 Tailscale 提供的 DERP 服务器。例如，你可能想禁用 tailnet 提供的 DERP 服务器以满足公司合规要求。更多信息请参阅[运行自定义 DERP 服务器][docs-custom-derp-servers]。

### `disableIPv4`

> **注意：**
>
> 建议不要使用 `disableIPv4` 字段，而是按照 [CGNAT 冲突][docs-troubleshooting-cgnat-conflicts]中的说明使用 `disable-ipv4` 节点属性。

`disableIPv4` 字段（设为 `true` 时）会停止为你的设备分配 Tailscale IPv4 地址。禁用 IPv4 后，网络中的所有设备只接收 IPv6 Tailscale 地址。不支持 IPv6 的设备（例如在操作系统中禁用了 IPv6 的系统）将不可达。此选项面向已经在 `100.64.0.0/10` 运营商级 NAT 地址段上有既存冲突用途的用户。

### `OneCGNATRoute`

`OneCGNATRoute` 字段控制 Tailscale 客户端生成的路由。

Tailscale 客户端可以有两种选择：

* 一条大的 `100.64/10` 路由，避免设备上下线时路由表的频繁变动。（这种变动对 macOS 上的 Chromium 内核浏览器有[干扰][xt-chromium-issue-1076619]。）
* 细粒度的 `/32` 路由。

`OneCGNATRoute` 的可能取值：

* 空字符串或未提供：对每个平台使用默认启发式规则。
  * 对于所有平台（macOS 除外），Tailscale 为每台设备添加细粒度的 `/32` 路由。
  * 在 macOS 上（Tailscale v1.28 或更高版本），Tailscale 添加一条 `100.64/10` 路由。如果其他接口也路由该范围内的 IP 地址，Tailscale 就不会使用一条 `100.64/10` 路由。
* `"mac-always"`：macOS 客户端始终添加一条 `100.64/10` 路由。
* `"mac-never"`：macOS 客户端始终添加细粒度的 `/32` 路由。

### `randomizeClientPort`

> **警告：**
>
> 只有在咨询 [Tailscale 支持][co-contact-support]之后，才应将 `randomizeClientPort` 字段用作某些[防火墙设备][docs-firewalls]的变通方案。

把 `randomizeClientPort` 字段设为 `true` 会让设备对 [WireGuard][docs-wireguard] 流量使用随机端口，而不是默认的静态端口 `41641`。

[ar-acls]: #acl

[ar-action-1]: #action-1

[ar-autoapprovers]: #自动批准autoapprovers

[ar-autogroups]: #autogroup

[ar-grants]: #授权grants

[ar-groups]: #群组groups

[ar-hosts]: #主机

[ar-ipsets]: #ip-集

[ar-nodeattrs]: #节点属性

[ar-object-syntax]: #推荐的态势语法

[ar-postures]: #设备态势postures

[ar-randomizeclientport]: #randomizeclientport

[ar-reference-users]: #引用用户

[ar-ssh]: #tailscale-ssh

[ar-sshtests]: #ssh-测试

[ar-tag-owners]: #标签所有者

[ar-tests]: #测试tests

[bl-rbac-meant-to-be]: https://tailscale.com/blog/rbac-like-it-was-meant-to-be

[co-contact-support]: https://tailscale.com/contact/support

[co-pricing]: https://tailscale.com/pricing

[docs-4via6-subnets]: /docs/features/subnet-routers/4via6-subnets

[docs-access-control]: /docs/features/access-control

[docs-acls]: /docs/features/access-control/acls

[docs-app-connectors]: /docs/features/app-connectors

[docs-app-connectors-best-practices]: /docs/reference/best-practices/app-connectors

[docs-custom-derp-servers]: /docs/reference/derp-servers/custom-derp-servers

[docs-device-posture]: /docs/features/device-posture

[docs-device-posture-device-posture-attributes]: /docs/features/device-posture/postures-and-attributes#device-posture-attributes

[docs-device-posture-device-posture-conditions]: /docs/features/device-posture/postures-in-access-rules

[docs-device-posture-monitoring]: /docs/features/device-posture/monitoring-postures

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-exit-nodes-advertise-exit-node]: /docs/features/exit-nodes#advertise-a-device-as-an-exit-node

[docs-firewalls]: /docs/integrations/firewalls

[docs-funnel]: /docs/features/tailscale-funnel

[docs-grants]: /docs/features/access-control/grants

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-nextdns]: /docs/integrations/nextdns

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-subnets-subnet-router]: /docs/features/subnet-routers#connect-to-tailscale-as-a-subnet-router

[docs-tags]: /docs/features/tags

[docs-tags-defining-a-tag]: /docs/features/tags#define-a-tag

[docs-tags-tag-a-device]: /docs/features/tags#apply-a-tag-to-a-device

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-tailscale-ssh-check-mode]: /docs/features/tailscale-ssh#configure-tailscale-ssh-with-check-mode

[docs-tailscale-ssh-ssh-access-rules]: /docs/features/tailscale-ssh#ssh-access-rules-in-default-acl

[docs-targets-autogroups]: /docs/reference/targets-and-selectors#autogroups

[docs-troubleshooting-cgnat-conflicts]: /docs/reference/troubleshooting/network-configuration/cgnat-conflicts

[docs-user-group-provisioning-sync-groups]: /docs/features/user-group-provisioning#syncing-group-membership

[docs-user-roles-admin]: /docs/reference/user-roles#admin

[docs-user-roles-auditor]: /docs/reference/user-roles#auditor

[docs-user-roles-billing-admin]: /docs/reference/user-roles#billing-admin

[docs-user-roles-it-admin]: /docs/reference/user-roles#it-admin

[docs-user-roles-network-admin]: /docs/reference/user-roles#network-admin

[docs-user-roles-owner]: /docs/reference/user-roles#owner

[docs-wireguard]: /docs/concepts/wireguard

[xt-ansible]: https://ansible.com

[xt-chromium-issue-1076619]: https://bugs.chromium.org/p/chromium/issues/detail?id=1076619

[xt-gh-tailscale-hujson]: https://github.com/tailscale/hujson

[xt-gh-tailscale-issue-1567]: https://github.com/tailscale/tailscale/issues/1567

[xt-iana-protocol-numbers]: https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml

[xt-rfc-2822-3.4.1]: https://www.rfc-editor.org/rfc/rfc2822.html#section-3.4.1

[xt-ssh-send-env]: https://man.openbsd.org/ssh_config#SendEnv

[xt-ssh-set-env]: https://man.openbsd.org/ssh_config#SetEnv

[xt-wiki-application-layer]: https://en.wikipedia.org/wiki/Application_layer

[xt-wiki-network-layer]: https://en.wikipedia.org/wiki/Network_layer
