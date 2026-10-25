---
title: "Tailscale SSH"
description: "使用 Tailscale SSH 管理 tailnet 中 SSH 连接的身份验证和授权。"
---

最后验证于 Jan 5, 2026

Tailscale SSH 让 Tailscale 能够管理你 tailnet 中 SSH 连接的身份验证和授权。

> **注意：** Tailscale SSH 适用于[所有套餐](https://tailscale.com/pricing)。

> **注意：**
>
> 以下相关视频提供了更多背景信息和示例。

[What is Tailscale SSH? (video)](https://www.youtube.com/watch?v=08clF9srJ2k)

## 为什么重要

使用 Tailscale SSH，你可以：

* **像平常一样使用 SSH**，由 Tailscale 负责身份验证。启用 Tailscale SSH 后，Tailscale 会接管 `22` 端口，处理来自 Tailscale 网络的 SSH 连接。Tailscale 会使用 Tailscale 节点密钥通过 WireGuard 对连接进行身份验证和加密。SSH 客户端与服务器仍会建立加密的 SSH 连接，但不会再进行额外的身份验证。
* **使用检查模式验证高风险连接**。可以选择要求某些连接，或以特定用户（例如 `root`）身份发起的连接，在连接之前重新进行身份验证。这样，用户在接下来的 12 小时内或指定的检查周期内可以访问这些高风险应用，之后需要重新验证。

你的 SSH 配置（`/etc/ssh/sshd_config`）和密钥（`~/.ssh/authorized_keys`）文件不会被修改，这意味着不经过 Tailscale 的其他 SSH 连接仍然可以连接同一台主机。

## 优势

* **减少 SSH 密钥的管理工作**——Tailscale SSH 使用自动生成的 WireGuard 密钥，会话结束后即过期。
* **借助 Tailscale 访问控制实施访问管理**——只向需要 SSH 的用户和组授予访问权限，并通过检查模式加以强制。
* **使用 SSH 录制记录会话**——强制启用 [SSH 录制][docs-ssh-recording]，满足审计、故障排查和合规要求。

## 用例

* **基础设施的 SSH 访问**——确保所有 SSH 流量都经由 tailnet 路由。
* **减少对其他工具的依赖**——整合用于管理 SSH 访问的工具。
* **满足合规需求**——满足针对 SSH 的员工监管与合规要求。

## Tailscale SSH 有何不同？

过去，要保护 SSH 连接，你需要在发起连接的机器（即客户端）上生成密钥对，私钥保存在客户端，公钥分发到你要连接的设备（即服务器）。这使服务器能够对来自客户端的通信进行身份验证。

使用 Tailscale，你本来就可以连接网络中的机器，并对点到点通信进行端到端加密——例如从工作笔记本 SSH 到工作台式机。Tailscale 也知道你的身份，因为你正是通过它加入 tailnet 的。启用 Tailscale SSH 后，Tailscale 会在你启用了 Tailscale SSH 的设备上，为 Tailscale IP 地址占用 `22` 端口（即只针对来自你 tailnet 的流量）。这会把该设备的 SSH 流量从 Tailscale 网络路由到由 Tailscale 运行的 SSH 服务器，而不是你标准的 SSH 服务器。借助 Tailscale SSH，你可以根据 tailnet 中的访问控制策略允许设备通过 SSH 连接，并依靠 Tailscale（而非公钥）进行身份验证。

|                           | SSH                                         | Tailscale SSH                                                                                  |
| ------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| IP 地址                   | 支持 IP 地址。                              | 支持 IP 地址。                                                                                 |
| [MagicDNS][docs-magicdns] | 支持 MagicDNS 名称。                        | 支持 MagicDNS 名称。                                                                           |
| DNS 限制                  | 使用 IP 地址时不需要 DNS。                  | 使用带主机名的自定义 `known_hosts` 文件。如果 DNS 无法解析，可能会导致错误。                   |
| 访问控制                  | 支持访问控制。                              | 使用基于 Tailscale 身份的集中式策略管理。                                                      |
| SSH 录制                  |                                             | 支持 SSH 录制。                                                                                |
| macOS                     | 可用。                                      | 需要使用[开源 `tailscaled` 变体][docs-macos-variants-open-source]。                            |

更多信息请参阅[局限性][ar-limitations]。

## 工作原理

与使用 SSH 密钥相比，Tailscale SSH 改变了连接身份验证、密钥生成与分发以及用户撤销的工作方式。

### 身份验证与授权

通常，建立 SSH 连接时，你使用的本地 SSH 客户端会连接到目标机器上的 SSH 服务器。

使用 Tailscale SSH 时，Tailscale 会使用 Tailscale 节点密钥通过 WireGuard 对连接进行身份验证和加密。SSH 客户端与服务器仍会建立 SSH 连接，但在 SSH 协议的身份验证阶段，Tailscale SSH 服务器已经知道远端是谁并直接接管，无需 SSH 客户端提供进一步的证明（使用 SSH 身份验证类型 `none`）。

只有当 tailnet 中的访问控制策略允许时，Tailscale 才会授权这两台设备连接。Tailscale 使用 `netstack` 端口拦截和对客户端 `known_hosts` 文件的即时自动配置，让 `ssh myhost` 无需任何新的二进制文件或配置文件即可工作。Tailscale 还实现了 SSH 文件传输协议（SFTP），让较新的 SSH 客户端可以使用 SCP 和 SFTP。

### 加密

使用 Tailscale SSH 时，除 SSH 协议提供的加密外，Tailscale 还会使用 WireGuard 对连接进行端到端加密，其中包括完整性保护。

### 密钥管理与分发

Tailscale 本来就会为 tailnet 中的设备管理和分发[节点密钥和机器密钥][bl-tailscale-key-management]。Tailscale 使用节点密钥对 SSH 连接进行身份验证、授权和加密。

使用 Tailscale SSH 时，Tailscale 还会分发公开的 SSH 主机密钥。私钥存储在本地，公钥则与 Tailscale 控制平面共享以便分发。有了这个主机密钥，SSH 客户端就能识别它所连接的主机。主机被识别后，Tailscale 会存储该主机密钥，以避免向用户显示"未知主机"错误消息。

根据[访问控制策略][docs-access-control]，如果允许两台设备连接，Tailscale 的控制平面会共享它们的公开节点密钥以便相互发现，使这些设备能够建立端到端加密的 WireGuard 连接。如果访问控制策略同样允许，Tailscale 还会共享它们的公开 SSH 主机密钥，使这些设备能在 SSH 连接中被识别。如果某个密钥被泄露，用户可以[移除设备上的密钥并重新安装 Tailscale][docs-uninstall]，然后重新进行身份验证，以生成并分发新的节点密钥和 SSH 主机密钥。

### 用户撤销

[访问控制策略][docs-access-control]决定哪些设备和哪些用户有权进行 SSH 连接。与需要清除的 SSH 密钥不同，要撤销用户 SSH 到某台设备的权限，只需更新访问控制策略来限制该用户的访问。访问控制策略保存后，客户端会在几秒内响应新规则。这**会**终止该用户已建立的现有 SSH 连接。

### 检查模式

可选地，通过 Tailscale SSH 发起的连接可以要求用户在建立 SSH 连接之前重新进行身份验证。这需要用户使用其身份提供方重新登录。在接下来的 12 小时内或指定的检查周期内，用户进行其他检查模式连接时无需再次验证。

## 配置 Tailscale SSH

### 前提条件

Tailscale SSH 的服务器组件仅在以下平台可用：

* Linux
* macOS 开源 [`tailscale` + `tailscaled` CLI 设备][xt-gh-tailscale-tailscaled-macos]

你可以从任何运行 Tailscale 的设备发起连接，不受平台限制。Tailscale SSH 的服务器组件要求 Tailscale v1.24 或更高版本。

要启用 Tailscale SSH，你必须：

* 在你要连接的目标设备上通告 Tailscale SSH。
* 确保存在一条访问控制策略，授予源设备在 `22` 端口访问目标设备的权限。
  * 如果你没有修改过账户中的[访问控制策略][docs-access-control]，则无需此步骤，因为[默认访问控制策略][docs-acl-samples-all-default]允许访问 tailnet 中的所有设备。
  * 这可能需要修改 tailnet 策略文件以加入 SSH。你必须具有 [Admin 或 Network admin](/docs/reference/user-roles) 身份才能修改 tailnet 策略文件。
* 确保存在一条访问控制策略，允许源设备通过 Tailscale SSH 使用 SSH 连接到目标机器。
  * 如果你没有修改过账户中的[访问控制策略][docs-access-control]，则无需此步骤，因为[默认访问控制策略中的 SSH 访问规则][ar-ssh-acls-default]允许对所有设备进行 SSH 访问。
  * 这需要修改 tailnet 策略文件以加入 SSH 策略。你必须具有 [Admin 或 Network admin](/docs/reference/user-roles) 身份才能修改 tailnet 策略文件。

### 在主机上通告 SSH

在被连接的主机上，你需要通告：由 Tailscale 管理来自 Tailscale 网络、发往该主机的 SSH 连接。为此，请运行：

```shell
tailscale set --ssh
```

> **警告：**
>
> 运行 `tailscale set --ssh` 会导致你已有的、指向该主机 Tailscale IP 的 SSH 连接挂起。

此命令会生成一个主机密钥对，将其公钥部分与 Tailscale 控制平面共享以便分发到客户端，并配置 `tailscaled` 拦截所有来自你 tailnet、路由到 Tailscale IP 地址 `22` 端口的流量。每个主机只需执行一次此 SSH 初始化。

### 确保访问控制策略允许 Tailscale SSH

在使用 Tailscale SSH 之前，你需要告诉 Tailscale 哪些用户可以 SSH 到哪些设备。由于 Tailscale 会自动为你管理授权和身份验证，因此你需要显式定义这些连接。

SSH 访问规则定义在 tailnet 策略文件中，你可以通过管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面或 Tailscale [API][docs-api] 进行编辑。

要允许一个连接，tailnet 策略文件必须同时包含允许网络访问和 SSH 访问的规则：

1. 一条允许从源到目标的连接规则。它用于允许 Tailscale 中的任何连接（包括 SSH 连接），以便分发 WireGuard 密钥。
2. 一条允许从源到目标、针对指定 SSH 用户的 SSH 连接规则。它用于 Tailscale SSH，以便分发用于验证 SSH 连接的密钥。

每条 SSH 访问规则的形式如下：

```json
{
  "action": "check", // "accept" or "check"
  "src": [list-of-sources],
  "dst": [list-of-destinations],
  "users": [list-of-ssh-users],
  "checkPeriod": "20h", // optional, only for check actions. default 12h
  "acceptEnv": [ "GIT_EDITOR", "GIT_COMMITTER_*", "CUSTOM_VAR_V?" ] // optional, allowlists environment variables that can be forwarded from clients to the host
},
```

\[Missing snippet: visual\_policy\_editor.mdx]

#### `action`

指定是接受连接还是对其进行额外检查。

* `accept` 接受已在 tailnet 中完成身份验证的用户的连接。
* `check` 要求用户按照 `checkPeriod` 定期重新验证。

#### `src`

连接的来源。可以是用户、组、标签、`user:*@<domain>` 或 [`autogroup`][docs-policy-syntax-autogroups]。

不能是单独的通配符 `*`。

> **警告：**
>
> 授予 `autogroup:member` 访问权限，也会向[外部受邀用户][docs-invite-any-user]授予访问权限——如果目标节点已与他们[共享][docs-sharing]，即使他们在你的 tailnet 中没有任何节点。

#### `dst`

连接的目标。可以是用户、标签或 autogroup。

与 ACL 不同，这里不能指定端口。只允许 `22` 端口，且无需指定，因为默认使用该端口。

不能是单独的通配符 `*`。

#### `users`

主机上允许使用的用户名集合。与其他 SSH 客户端一样，Tailscale 只会使用主机上已有的用户账户，不会创建新账户。

* 指定 `autogroup:nonroot` 可允许除 `root` 以外的任何用户。
* 指定 `localpart:*@<domain>` 可允许主机上用户名与用户登录名的 [local-part][xt-rfc-2822-3.4.1] 匹配的用户——前提是用户的登录邮箱属于 `<domain>`。Tailscale 不会对 local-part 做任何特殊处理。例如，如果登录名是 `dave+sshuser@example.com`，Tailscale 会将其映射为 SSH 用户 `dave+sshuser`。

#### `checkPeriod`

当 `action` 为 `check` 时，`checkPeriod` 指定在要求检查之前允许连接持续的时长。可以以分钟或小时为单位指定，最短 1 分钟，最长 168 小时（一周）。

* 如果未指定，默认为 12 小时。
* 也可以指定 `always`，要求每次连接都进行检查。始终要求检查模式可能会导致在短时间内打开大量 SSH 连接的自动化工具（例如 [Ansible][xt-ansible]）出现意外行为。

#### `acceptEnv`

> **注意：**
>
> 主机必须运行 Tailscale v1.76.0 或更高版本才能使用 `acceptEnv`。

指定允许客户端通过 [`SendEnv`][xt-ssh-send-env] 或 [`SetEnv`][xt-ssh-set-env] 发送到主机的环境变量名称白名单集合。

值可以包含 `*` 和 `?` 通配符。`*` 匹配零个或多个字符，`?` 匹配单个字符。

##### `acceptEnv` 示例

| `acceptEnv` | 允许                              | 拒绝                      |
| ----------- | --------------------------------- | ------------------------- |
| `*`         | `FOO_A` `FOO_B` `FOO_OTHER` `BAZ` |                           |
| `FOO_*`     | `FOO_A` `FOO_B` `FOO_OTHER`       | `BAZ`                     |
| `FOO_?`     | `FOO_A` `FOO_B`                   | `FOO_OTHER` `BAZ`         |
| `FOO_A`     | `FOO_A`                           | `FOO_B` `FOO_OTHER` `BAZ` |

#### 求值顺序

SSH 访问规则按最严格的策略优先的顺序求值：

* 检查策略
* 接受策略

例如，如果有一条 `accept` 规则允许用户 `alice@example.com` 访问某个资源，还有一条 `check` 规则允许 `alice@example.com` 所属的 `group:devops` 访问该资源，那么将适用 `check` 规则。

仅允许以下类型的连接：

* 从用户到自己的设备，可以是包括 `root` 在内的任何用户。
* 从用户到带标签的设备，可以是包括 `root` 在内的任何用户。
* 从用户到[共享][docs-sharing]给你的带标签设备，可以是包括 `root` 在内的任何用户。
* 从带标签设备到另一台带标签设备，适用于任何标签。来自带标签设备的 SSH 访问规则不能处于[检查模式][ar-tailscale-ssh-check-mode-config]。

也就是说，允许的最宽松策略如下：

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
      "dst": ["autogroup:self"],
      "src": ["autogroup:member"],
      "users": ["root", "autogroup:nonroot"]
    },
    {
      "action": "accept",
      "dst": ["tag:prod"],
      "src": ["autogroup:member"],
      "users": ["root", "autogroup:nonroot"]
    },
    {
      "action": "accept",
      "dst": ["tag:prod"],
      "src": ["tag:logging"],
      "users": ["root", "autogroup:nonroot"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

#### 默认访问控制策略中的 SSH 访问规则

默认情况下，新建的 tailnet 或未修改过访问控制策略的现有 tailnet，都有一条可用但保守的 Tailscale SSH 访问规则。为了便于建立连接，Tailscale SSH 配置了一条[默认策略][docs-acl-samples-all-default]，允许用户以检查模式访问自己的设备，身份可以是 `root` 或非 `root`：

```json
"ssh": [
  {
    // any user can use Tailscale SSH to connect to their own devices
    // in check mode as a root or non-root user
    "action": "check",
    "src": ["autogroup:member"],
    "dst": ["autogroup:self"],
    "users": ["autogroup:nonroot", "root"]
  },
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

你仍需在目标设备上选择加入。

修改 SSH 的访问控制策略会覆盖此默认配置，而将其删除则会在你的 tailnet 中禁用 Tailscale SSH。

**关于 `autogroup:nonroot` 的重要说明**

在默认 ACL 中，`ssh` 规则在 `dst` 字段使用 `autogroup:self`，在 `users` 字段使用 `autogroup:nonroot`。如果你把 `dst` 字段从 `autogroup:self` 改为其他目标（例如某个 [ACL 标签](/docs/features/tags)），请同时考虑替换 `users` 字段中的 `autogroup:nonroot`。如果不从 `users` 字段中移除 `autogroup:nonroot`，那么 `src` 设置允许的任何人都将能以 `dst` 设备上任意非 root 用户身份 SSH 登录。

#### SSH 访问规则示例

允许用户仅以非 `root` 身份 SSH 到自己的设备：

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
      "dst": ["autogroup:self"],
      "src": ["autogroup:member"],
      "users": ["autogroup:nonroot"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

允许 `group:sre` 访问带有 `tag:prod` 标签的生产环境设备：

```json
{
  "grants": [
    {
      "src": ["group:sre"],
      "dst": ["tag:prod"],
      "ip": ["*"]
    }
  ],
  "groups": {
    "group:sre": ["alice@example.com", "bob@example.com"]
  },
  "ssh": [
    {
      "action": "accept",
      "dst": ["tag:prod"],
      "src": ["group:sre"],
      "users": ["ubuntu", "root"]
    }
  ],
  "tagOwners": {
    "tag:prod": ["group:sre"]
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

将主机用户与登录邮箱匹配可能很有用。例如，你可以允许 `dave@example.com` 以主机用户 `dave` 的身份进行身份验证。要允许登录域为 `example.com` 的任何 tailnet 成员，以其登录邮箱 local-part 匹配的用户身份访问带有 `tag:prod` 标签的生产环境设备：

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
      "dst": ["tag:prod"],
      "src": ["user:*@example.com"],
      "users": ["localpart:*@example.com"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### 通过 SSH 连接

现在你的访问控制策略已允许 SSH，目标主机也已配置了 Tailscale SSH，你应该可以使用 Tailscale SSH 了。

要连接到 tailnet 中名为 `device` 的主机：

```shell
ssh device
```

此示例使用 [MagicDNS][docs-magicdns] 主机名。

> **注意：**
>
> MagicDNS 主机名是根据机器名称自动生成的。如果你想使用其他名称，可以[编辑机器名称][docs-machine-names-renaming-a-machine]。

要使用与本地用户不同的用户，请指定该用户，例如 `ubuntu`：

```shell
ssh ubuntu@device
```

> **注意：**
>
> 有些 SSH 客户端可能无法连接到使用无身份验证的 SSH 服务器。在这种情况下，你可以在客户端中给要连接的用户名加上 `+password` 来模拟密码身份验证：
>
> ```
> username: ubuntu+password
> password: [any]
> ```
>
> 此时你可以输入任意密码，无需与该用户的实际密码一致。注意，要添加到用户名中的字符串是字面量 `+password`，而不是用户的密码。

你也可以通过 SSH 连接到一台带标签且已与你[共享][docs-sharing]的节点，前提是目标主机已配置 Tailscale SSH，且目标的访问控制策略允许你通过 SSH 连接。

除主机名外，也可以使用 [Tailscale IP 地址][docs-100-x-addresses]作为 SSH 目标。无论设备的物理位置如何，Tailscale IP 地址保持不变。即使设备切换网络连接（例如从 Wi-Fi 切换到蜂窝网络），其 Tailscale IP 地址也不会改变。

例如，连接到 Tailscale IP 地址（如 `100.64.0.1`）的方式如下：

```shell
ssh user@100.64.0.1
```

你不能使用非 Tailscale IP 地址连接 Tailscale SSH 服务器。

### 从现有 SSH 客户端迁移到 Tailscale SSH

启用 Tailscale SSH 后，Tailscale 会在你启用了 SSH 的设备上，为 Tailscale IP 地址占用 `22` 端口（即只针对来自你 tailnet 的流量），并将该设备的 SSH 流量路由到由 Tailscale 运行的 SSH 服务器，而不是你标准的 SSH 服务器。你的 SSH 配置（`/etc/ssh/sshd_config`）和密钥（`~/.ssh/authorized_keys`）文件不会被修改，这意味着不经过 Tailscale 的其他 SSH 连接仍然可以连接同一台主机。

### 轮换密钥

在设备上重新进行身份验证会生成新的节点密钥对，在本地存储私钥，并与 Tailscale 共享公钥以便分发。

要生成新的节点密钥和 SSH 主机密钥：

```shell
tailscale up --ssh --force-reauth
```

## 禁用 Tailscale SSH

### 从设备禁用 Tailscale SSH

禁用 Tailscale SSH 之前，请确保你还有其他方式可以 SSH 到该设备，否则可能会失去对它的访问。

在该设备上运行带有 `--ssh=false` 的 `tailscale set` 以禁用 Tailscale SSH：

```shell
tailscale set --ssh=false
```

### 阻止其他设备通过 SSH 连接到你的设备

要在你的设备上禁用 Tailscale SSH，请使用 `--ssh=false` 重新配置设备：

```shell
tailscale set --ssh=false
```

要[阻止][docs-client-preferences-allow-incoming-connections]来自 tailnet 的传入连接（包括 Tailscale SSH 连接）：

```shell
tailscale set --shields-up
```

### 撤销用户的 SSH 权限

要撤销用户 SSH 到某台设备的权限，请修改指定该用户 SSH 权限的[访问规则][docs-policy-syntax-acls]。访问控制策略的更新会推送到设备，并几乎立即移除该用户的访问权限。如有需要，你仍可以允许该用户连接到设备，但不使用 Tailscale SSH。

这**会**终止该用户已建立的现有 SSH 连接。用户会收到"Access revoked"（访问已被撤销）的消息。

如果该用户有 Tailscale 之外的其他方式访问该设备（例如其 SSH 密钥），也需要将其移除或撤销。

### 从 tailnet 中禁用 Tailscale SSH

要从你的 tailnet 中完全移除 Tailscale SSH 功能：

* 让每台主机退出 Tailscale SSH（`tailscale set --ssh=false`）
* 从访问控制策略中移除 Tailscale SSH 的 SSH 访问规则

如果你仍希望用户能够访问指定设备（只是不使用 Tailscale SSH），则无需移除或修改其他[访问规则][docs-policy-syntax-acls]。

### 配置错误

Tailscale SSH 要求 tailnet 策略文件中的访问控制策略允许并指定 SSH 的源和目标。此外，目标设备上必须启用 Tailscale SSH。

如果缺少访问控制策略，可以在管理控制台 [Access controls](https://console.tailscale.com/admin/acls) 页面的 tailnet 策略文件中修改。你必须具有 [Admin 或 Network admin](/docs/reference/user-roles) 身份才能修改 tailnet 策略文件。

如果设备上未通告 SSH，请通过 Tailscale 连接到该设备，然后运行 `tailscale set --ssh`。

## 使用检查模式配置 Tailscale SSH

SSH 检查模式让你可以要求 SSH 连接在建立之前进行进一步验证。检查模式要求发起连接的设备重新进行身份验证。SSH 初始化会提供一个登录 URL。登录尝试还可能触发身份提供方的[多因素身份验证][docs-multifactor-auth]（MFA）或其他基于风险的质询。

*（图：使用检查模式要求用户在建立 Tailscale SSH 连接之前重新进行身份验证。）*

检查模式要求用户在浏览器中重新验证会话的示例。

对目标重新验证后，用户可以在接下来的 12 小时内访问该设备以及 tailnet 中的任何其他设备，而无需再次验证。如果为该连接指定了不同的检查周期，则用户可以在检查周期内访问*该特定*设备而无需再次验证。例如，如果指定的检查周期为 10 分钟，那么当用户在过去 10 分钟内未重新验证时，即使他们在过去 12 小时内验证过，也会被要求重新验证。

* 检查模式是可选的，默认不启用。
* 检查模式仅适用于 Tailscale SSH 连接。

检查模式通过 SSH 策略设置控制。`ssh` 规则必须包含设置为 `check` 的 `action` 字段：

```json
"ssh": [
  {
    "action": "check", // instead of "accept"
    "src": ["autogroup:member"],
    "dst": ["autogroup:self"],
    "users": ["autogroup:nonroot"],
    "checkPeriod": "5m", // optional, define in minutes, hours, or "always"
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

你可以以分钟或小时为单位指定自定义检查周期。默认检查周期为 12 小时。也可以指定 `"always"`，要求每次连接都进行检查。

> **注意：**
>
> 始终要求检查模式可能会导致在短时间内打开大量 SSH 连接的自动化工具（例如 [Ansible][xt-ansible]）出现意外行为。

例如，要求 Alice 以 `root` 身份 SSH 到带有 `tag:prod` 标签的设备时启用检查模式并在 `1h` 后重新验证，但她以非 `root` 身份 SSH 到自己的设备时不要求检查模式：

```json
{
  "grants": [
    {
      "src": ["*" ],
      "dst": ["*"],
      "ip": ["*"]
    }
  ],
  "ssh": [
    {
      "action": "accept",
      "dst": ["autogroup:self"],
      "src": ["alice@example.com"],
      "users": ["autogroup:nonroot"]
    },
    {
      "action": "check",
      "checkPeriod": "1h",
      "dst": ["tag:prod"],
      "src": ["alice@example.com"],
      "users": ["root"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

## 局限性

### 设备

* 目前 Tailscale SSH 只能连接你 Tailscale 网络中的设备。子网路由器后方未运行 Tailscale 的设备无法使用 Tailscale SSH。
* 目前 Tailscale SSH 只能连接 Linux 设备和 macOS 开源 [`tailscale` + `tailscaled` CLI 版本设备][xt-gh-tailscale-tailscaled-macos]。你可以从任何运行 Tailscale 的设备发起连接，不受平台限制。
* 不能在群晖（Synology）或 QNAP 设备上运行 Tailscale SSH。
* 重启 Tailscale 守护进程（`tailscaled`）（例如执行升级）会终止所有现有的 Tailscale SSH 会话。

### 端口

Tailscale SSH 假定你使用 `22` 端口进行 SSH。

> **注意：**
>
> 目前无法将 Tailscale SSH 配置为使用其他端口。

### SSH 用户

SSH 访问规则按严格程度求值，因此如果某个连接同时存在 check 规则和 accept 规则，将适用 check 规则。这意味着用户只会受 check 规则中 SSH `users` 的限制，而不会同时考虑 accept 规则中允许的用户。

### SSH 测试

你可以编写 [SSH 测试][docs-policy-syntax-sshtests]，断言你的 SSH 访问规则按预期工作。

### 检查模式

检查模式只能用于 Tailscale SSH 连接，不能用于普通 SSH 或其他通过 Tailscale 运行的 TCP 连接。

### 客户端上的 OS 用户身份验证

传统 SSH 要求客户端机器上的本地 OS 用户能够从磁盘文件中读取其 SSH 密钥对。这实际上限制了哪些客户端侧 OS 用户可以 SSH 到远程机器。

由于 Tailscale 不使用本地 SSH 密钥对进行身份验证，客户端机器上的任何 OS 用户都可以通过 Tailscale 连接到 SSH 服务器。此访问的范围仍受 [Tailscale 访问控制策略][docs-access-control]限制，这些策略在服务器端强制执行。

对于以下场景，Tailscale SSH 相比传统 SSH 是一种[改进][ar-how-does-it-work]：

* 使用单一系统用户运行工作负载的服务器和容器
* 单用户机器，例如员工的笔记本电脑
* 在 Tailscale 访问控制策略中不允许出站 SSH 连接的任何机器

Tailscale SSH 可能不适合：

* 多用户机器，且这些机器上的 OS 用户在 Tailscale 访问控制策略中拥有不同的 SSH 访问权限
* 具有出站 Tailscale SSH 访问权限、而你又不信任其上运行代码的机器
* 你使用 `authorized_keys` 限制远程用户可运行命令的机器

你可以通过使用[检查模式][ar-tailscale-ssh-check-mode-config]并将 `checkPeriod` 设置为 `always` 来缓解这一顾虑，这会在每个新连接上提示进行基于 SSO 的批准。

如果 Tailscale SSH 不适合你的需求，你仍然可以在 Tailscale 作为网络层的基础上运行传统的 SSH 服务器和客户端。这样既能获得标准的 SSH 体验，又不会将服务器暴露给互联网。

## 更多信息

* Tailscale CLI 命令：[`tailscale set --ssh`][docs-cli-set]
* Tailscale CLI 命令：[`tailscale up --ssh`][docs-tailscale-up]
* tailnet 策略文件分区：[`ssh`][docs-policy-syntax-ssh]

[ar-how-does-it-work]: #工作原理

[ar-limitations]: #局限性

[ar-ssh-acls-default]: #默认访问控制策略中的-ssh-访问规则

[ar-tailscale-ssh-check-mode-config]: #使用检查模式配置-tailscale-ssh

[bl-tailscale-key-management]: https://tailscale.com/blog/tailscale-key-management

[docs-100-x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-access-control]: /docs/features/access-control/acls

[docs-acl-samples-all-default]: /docs/reference/examples/acls#允许所有默认-acl

[docs-api]: /docs/reference/tailscale-api

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-client-preferences-allow-incoming-connections]: /docs/features/client/manage-preferences#allow-incoming-connections

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-macos-variants-open-source]: /docs/concepts/macos-variants#开源-tailscaled-变体

[docs-machine-names-renaming-a-machine]: /docs/concepts/machine-names#renaming-a-machine

[docs-magicdns]: /docs/features/magicdns

[docs-multifactor-auth]: /docs/multifactor-auth

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acl

[docs-policy-syntax-autogroups]: /docs/reference/syntax/policy-file#autogroup

[docs-policy-syntax-ssh]: /docs/reference/syntax/policy-file#ssh

[docs-policy-syntax-sshtests]: /docs/reference/syntax/policy-file#sshtests

[docs-sharing]: /docs/features/sharing

[docs-ssh-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[docs-uninstall]: /docs/features/client/uninstall

[xt-ansible]: https://www.ansible.com

[xt-gh-tailscale-tailscaled-macos]: https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS

[xt-rfc-2822-3.4.1]: https://www.rfc-editor.org/rfc/rfc2822.html#section-3.4.1

[xt-ssh-send-env]: https://man.openbsd.org/ssh_config#SendEnv

[xt-ssh-set-env]: https://man.openbsd.org/ssh_config#SetEnv
