---
title: "用标签为设备分组"
description: "使用 Tailscale 标签来认证和标识服务器等非用户设备。"
---

最后验证于 Dec 4, 2025

> **注意：** [所有套餐](https://tailscale.com/pricing)都可以使用标签。

> **注意：**
>
> 所有套餐都包含 50 台带标签设备。你可以从管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面购买更多带标签资源，或联系我们的[销售团队][co-contact-sales]。

Tailscale 标签（tag）用于认证和标识服务器、[临时节点][docs-ephemeral-nodes]（ephemeral node）等非用户设备。它们有两个主要用途：为非用户设备提供身份，以及让你按*用途*管理[访问控制策略][docs-access-control]。这里的用途可以是任何事情，从托管一个 Web 服务器，到为特定地理位置的员工充当[子网路由器][docs-subnets]。

标签本质上是服务账户，但更灵活——你可以给一台设备分配多个标签来对应多种用途。例如，你可能有一台设备既运行 PostgreSQL 数据库，又充当内部访问用的 Web 服务器。在这种场景下，你可以给该设备分配以下标签（每个标签都可以用访问控制策略单独定向）：`tag:postgresql`、`tag:internal-access` 和 `tag:web-server`。

标签的其他关键特性包括：

* 给设备应用标签会移除所有基于用户的认证。
* 每台非用户设备可以按需拥有任意数量的标签。
* 标签在 tailnet 策略文件的 `tagOwners` 部分定义。
* 只有指定的标签所有者才能给设备应用标签；每个标签可以按需拥有任意数量的所有者。

## 要求

标签是免费功能，所有套餐均可用。但执行某些与标签相关的操作需要相应权限：

* 在 tailnet 策略文件中定义标签，你需要是 tailnet 的 [Owner（所有者）、Admin（管理员）或 Network admin（网络管理员）](/docs/reference/user-roles)。
* 给设备分配标签，你需要是该标签的所有者。[Owner（所有者）、Admin（管理员）或 Network admin（网络管理员）](/docs/reference/user-roles)可以应用任何标签，即使他们不拥有该标签。

## 限制

标签有以下限制与约束：

* 你不能移除设备上的所有标签。以标签为身份的设备必须至少保留一个标签。
* 如果设备使用认证密钥（auth key）认证，你不能用 `--advertise-tags` 旗标移除标签。此时应生成一个带最新标签集合的新认证密钥。
* [IP 集][docs-ipsets]（IP set）不支持标签。
* 以标签为身份的设备只能 SSH 到其他带标签的设备，不能 SSH 到以用户为身份的设备。
* 在用标签定义组或作为 SSH 来源方面存在一些限制。

## 使用场景

标签非常适合管理你不想绑定到特定用户的设备（例如托管 Web 应用的服务器），因为删除用户会连带删除其所有设备。如果你把提供服务的设备关联到某个用户，删除该用户就会失去这台设备；而改用标签管理设备时，删除用户不会影响设备。不要用标签把用户设备关联到用户账户——标签的设计目的不是把单个用户绑定到设备，而是管理承担服务账户角色的设备。用标签替代用户会带来安全风险：即使你删除了用户，其设备仍会留在你的网络中。

标签还提供了一种让多个用户共同管理设备的方式。用用户管理设备时，每台设备必须绑定到单个用户，这对承载共享资源的设备并不理想。而用标签管理设备时，你可以把一个或多个用户指派为标签的标签所有者，这些用户就能管理所有带有其所属标签的设备。

> **警告：**
>
> **关于标签的警告**
>
> 标签只应用于非人类操作的机器。用户只能通过其指定的用户账户访问和使用 Tailscale。用标签标注用户设备是不良实践，因为一台设备不能同时拥有用户和标签——给设备加标签会移除其关联用户。设备可以有标签或用户账户，但不能兼得。
>
> 应该用标签来：
>
> * 管理未绑定到特定用户的设备（例如托管 Web 应用的服务器）。
> * 管理希望允许多个用户共同管理的设备。
>
> 不要用标签来：
>
> * 标注用户设备。
> * 把用户设备与用户关联。
> * 认证笔记本电脑或移动设备等终端用户设备。

## 所有权

tailnet 策略文件中没有"tag"部分。你通过 tailnet 策略文件 `tagOwners` 部分中的所有者来定义标签。只有标签的所有者才能把该标签应用到 Tailscale 网络（即 tailnet）中的设备。标签所有者可以是用户、组，甚至其他标签，这意味着你可以构建复杂的标签[所有权层级][ar-ownership-hierarchies]。

带标签设备的身份是其所有标签的组合（而非交集）。你可以给一台设备分配任意数量的标签，并分别管理每个标签的权限。例如，如果一台设备带有 `tag:postgresql`、`tag:prod` 和 `tag:ci-cd` 标签，那么针对其中任何一个标签的访问控制策略都会作用于这台设备。

[Owner（所有者）、Admin（管理员）或 Network admin（网络管理员）](/docs/reference/user-roles)可以应用任何标签，即使他们不是该标签的所有者。

## 标签认证与用户认证的对比

标签与用户认证并行。它们扮演与用户账户相同的角色，只是面向服务型设备，例如 Web 服务器或应用连接器。因此，用户账户身份和标签身份不可能同时存在于同一台设备上。给先前用用户账户认证的设备应用标签会移除该用户账户；同样，用用户账户认证设备会移除其所有标签。

由于标签面向非用户设备，它们具备一些使其不适合认证 MacBook 或移动设备等终端用户设备的特性与限制。例如，以标签为身份的设备无法通过 SSH 连接以用户为身份的设备。

## 密钥过期

当你第一次给设备应用标签并进行认证时，该带标签设备的密钥过期（key expiry）默认是禁用的。

> **注意：**
>
> 如果你重新认证一台在 2022 年 3 月 10 日之前加标签的设备，其过期时间也会默认禁用。

如果你从管理控制台、[Tailscale CLI][docs-cli] 或 [Tailscale API][docs-api] 更改设备上的标签，除非重新认证，设备的密钥过期设置不会改变。重新认证之后，Tailscale 会禁用该设备的密钥过期。

你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面或通过 Tailscale API 启用或禁用设备的密钥过期。

## Tailscale 生态中的标签

与 tailnet 的许多方面一样，你可以在 tailnet 策略文件中定义和管理标签。虽然有限制使你不能用它们认证终端用户设备，但它们几乎能与所有其他 Tailscale 功能无缝配合，包括出口节点、子网路由器、应用连接器、访问控制列表和授权。

### 出口节点

把一台设备用作[出口节点][docs-exit-nodes]，意味着其他 tailnet 设备可以选择把全部互联网流量都经由该设备路由。让所有流量经过出口节点，既能加密互联网流量，又能访问内部网络。例如，你可以在公司办公室把一台设备运行为出口节点，员工使用该出口节点时就能访问公司办公室的内部网络。虽然终端用户设备也能充当出口节点，但出口节点更常使用基于标签的身份。

### 子网路由器

[子网路由器][docs-subnets]是一台向 tailnet 其余部分通告子网路由的 tailnet 设备。它是把整个子网加入 tailnet 的好办法，而且无需给子网内任何设备安装 Tailscale 客户端（子网路由器本身除外）。虽然终端用户设备也能充当子网路由器，但子网路由器更常使用基于标签的身份。

### 应用连接器

[应用连接器][docs-app-connectors]是在 tailnet 中路由特定应用流量的设备。作为应用连接器运行的设备严格来说就是服务型设备，因此必须使用基于标签的身份来认证你计划用作应用连接器的设备。

### 访问控制

你可以用标签在 tailnet 中选择和定向服务型设备，用 ACL 和授权创建访问控制策略。由于 Tailscale 可以凭设备被分配的任意一个标签识别它，作用于拥有众多标签的设备的访问控制策略可能变得复杂。因此，最佳实践是清晰记录你在 tailnet 中使用和管理标签的方式。

#### ACL

你可以把标签用作[访问控制列表（ACL）][docs-acls]的一部分，更轻松地管理哪些类型的设备可以相互通信。例如，你可以用名为 `tag:prod` 的标签标记生产服务器和生产数据库，然后允许所有带 `tag:prod` 标签的设备相互通信。

下面的 [tailnet 策略文件][docs-tailnet-policy-file]示例允许所有带 `tag:prod` 标签的设备相互通信。

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["tag:prod"],
      "dst": ["tag:prod:*"],
    },
  ],
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

你还可以用[测试][docs-policy-syntax-tests]确保带标签设备的 ACL 按预期工作——测试会在保存并应用 tailnet 策略文件之前对其进行校验。

例如，要验证 tailnet 策略文件允许 `tag:sre` 组中的用户访问带 `tag:prod` 标签的设备，可以编写如下 ACL：

```json
"tests": [
  {
    "src": "group:sre",
    "accept": ["tag:prod:1234"],
  },
],
```

\[Missing snippet: visual\_policy\_editor.mdx]

#### 授权

与 ACL 一样，你可以在授权中使用标签来定向一组带标签的设备。下面的示例允许带 `tag:prod` 标签的设备访问带 `tag:tailsql` 标签的设备。

```json
{
  "grants": [
    {
      "src": ["tag:prod"],
      "dst": ["tag:tailsql"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Autogroup

[Autogroup][docs-targets] 是 tailnet 中预先定义的设备组，这类分组用自定义组很难创建。其中一个 autogroup 是 `autogroup:tagged`，它会选中所有以标签为身份的设备。

你不能用 `autogroup:tagged` 定义 IP 集或自定义组。

## 高级标签层级

指派标签所有者在设计上就很灵活。你可以按需给设备指派任意数量的标签所有者，标签所有者可以是用户、组或其他标签。由于可以把一个标签指派为另一个标签的所有者，就能构建复杂的标签所有权层级。因此，最佳实践是清晰记录你的标签使用方式，并使用[访问控制策略测试][docs-policy-syntax-tests]等工具审计标签。

## 最佳实践

要有效利用标签，请考虑以下最佳实践：

* **为标签定义清晰的命名规范**。理想情况下，标签名称应在你整个 tailnet 中遵循一致且具描述性的模式。尽早定义并执行命名规范，可以减少日后出现标签名称含糊等问题的可能性。例如，名为"foo-bar"的标签看不出任何用途，而"prod-postgresql-server"则表明它用于生产环境中的 PostgreSQL 服务器。即便名称够描述性，也建议把组织的标签规范记录成文。
* **使用认证密钥**。使用预先分配好标签的[认证密钥][docs-auth-keys]，可以简化带标签设备的认证与审批流程。
* **不要用标签认证用户自有的设备**。标签用于认证服务器和提供服务的设备，其特性并不适合 MacBook 或 Android 手机等终端用户设备。此外，一台设备不能同时使用基于标签和基于用户的身份——给先前以用户认证的设备加标签会移除用户的身份。
* **慎重考虑每个标签的所有者**。标签由 tailnet 策略文件 `tagOwners` 部分中的所有者定义。由于标签的灵活性以及标签可以拥有另一个标签，标签可能形成[复杂的所有权层级][ar-ownership-hierarchies]。

### 标签命名的常见模式

标签让你能按照组织的需求反映访问模式和网络分段。这些访问模式和网络分段通常可以归入几个常见类别。按这些类别为标签名称使用一致的模式，能让你的访问控制策略更易理解和长期维护。在标签名称中值得考虑的常见访问类别有：

* **服务器角色**：例如应用服务器、数据库或队列。
* **应用名称**：例如支持控制台、财务报表或运维仪表盘。
* **环境**：例如生产、预发布（staging）或开发。
* **位置**：例如美洲、EMEA、南亚。

虽然一台设备可以拥有多个标签，但标签在访问规则中不会"联合"生效。例如，你不能定义一条同时要求 `tag:prod` 和 `tag:database` 才允许访问的规则。作为替代，你可以使用组合标签（如 `tag:prod-database`）来表示这种分段访问模式。下面是一些组合标签示例。

| **标签**                            | **访问控制**                                             |
| :---------------------------------- | :------------------------------------------------------- |
| `tag:prod-app`                      | 面向生产应用服务器                                       |
| `tag:nonprod-db`                    | 面向非生产数据库服务器                                   |
| `tag:prod-app-finance-reporting`    | 面向生产环境的财务报表应用                               |
| `tag:prod-emea-app-support-console` | 面向 EMEA 生产环境的支持控制台应用                       |
| `tag:prod-asiasouth-ingest-logging` | 面向南亚生产环境的日志采集端点                           |

## 使用标签

使用以下章节了解有关使用标签的更多信息：

* [定义标签][ar-define-a-tag]。
* [定义标签所有者][ar-define-tag-owners]。
* [为设备应用标签][ar-apply-a-tag-to-a-device]。
* [从另一个标签应用标签][ar-apply-a-tag-from-another-tag]。

### 定义标签

在给设备分配标签之前，你必须先在 [tailnet 策略文件][docs-policy-syntax]中创建该标签，并定义谁可以用它来认证设备。你通过在 tailnet 策略文件的 [`tagOwners`][docs-policy-syntax-tag-owners] 部分定义标签来创建它。

下面的示例创建标签 `tag:server` 并指定 `dave@example.com` 为唯一所有者。只有标签所有者才能应用该标签。

```json
{
  "tagOwners": {
    "tag:server": ["dave@example.com"], // dave@example.com can authenticate devices with the tag:server tag
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

Tailscale 忽略标签名称的大小写，会把 tailnet 策略文件中的所有标签按小写解析。

### 定义标签所有者

你必须显式定义谁可以使用某个标签来把其权限授予设备。你可以在 tailnet 策略文件的 [`tagOwners`][docs-policy-syntax-tag-owners] 部分定义标签所有者。

标签在 tailnet 策略文件中也可以拥有空的所有者列表。所有标签都隐式地由 tailnet 的 [Owner（所有者）、Admin（管理员）和 Network admin（网络管理员）](/docs/reference/user-roles)拥有。你可以在管理控制台中把这些标签应用到设备，也可以把它们包含在[认证密钥][docs-auth-keys]中。

下面的示例展示了没有任何标签所有者的 `tag:infrastructure`。

```json
{
  "tagOwners": {
    "tag:server": ["dave@tailscale.com"],
    "tag:infrastructure": [], // No tag owners defined
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### 为设备应用标签

你可以使用管理控制台、[Tailscale CLI][docs-cli] 或 Tailscale API 给设备加标签。

> **注意：**
>
> 重新认证并给设备加标签时，会为该设备生成新的[节点密钥][docs-node-keys]（node key）。设备的 [Tailscale IP 地址][docs-100.x-addresses]不会改变。

#### 在管理控制台中为设备应用标签

从[管理控制台](https://console.tailscale.com/admin)给设备加标签，你需要是 tailnet 的 [Owner（所有者）、Admin（管理员）或 Network admin（网络管理员）](/docs/reference/user-roles)。你无需重新认证，因为系统会自动用当前用户认证设备。

在管理控制台中给设备加标签的步骤：

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 找到目标设备所在的行。
3. 选择最右侧的菜单，然后选择 **Edit tags** 选项。
4. 添加、更改或移除所需的标签。要应用的标签必须已存在于 [tailnet 策略文件][docs-tailnet-policy-file]中。
5. 选择 **Save** 应用标签。

[Owner（所有者）、Admin（管理员）和 Network admin（网络管理员）](/docs/reference/user-roles)可以在管理控制台应用任何标签，即使他们不拥有该标签。

> **注意：**
>
> 你不能在管理控制台中移除带标签设备的全部标签，因为设备必须保有身份。要么给设备分配一个新标签，要么让设备重新认证到 Tailscale。

#### 使用 CLI 为设备应用标签

你可以使用 [Tailscale CLI][docs-cli] 为运行 Linux、macOS 或 Windows 的设备添加和移除标签。要给其他设备加标签，请使用管理控制台。

用 CLI 给设备分配标签时，运行带 `--advertise-tags=tag:<tag-name>` 旗标的 `tailscale login` 命令。

```shell
sudo tailscale login --advertise-tags=tag:server
```

要给设备分配多个标签，把多个标签（以逗号分隔）传给 `--advertise-tags` 旗标。

```shell
sudo tailscale login --advertise-tags=tag:server,tag:development
```

要移除设备的所有标签，使用不带任何取值的 `--advertise-tags=` 旗标。

```shell
sudo tailscale login --advertise-tags=
```

> **注意：**
>
> 如果设备使用认证密钥认证，你不能用 `--advertise-tags` 旗标移除标签。此时应生成一个带新标签集合的认证密钥。

如果设备已经用其他用户认证过，你可能需要更换设备上登录的用户。要以当前用户重新认证，请给 `tailscale up` 命令加上 `--force-reauth` 旗标：

```shell
sudo tailscale up --advertise-tags=tag:server --force-reauth
```

#### 通过 API 为设备应用标签

你可以使用 [Tailscale API][docs-api] 的 [Update device tags][co-api-update-tags] 方法给设备应用标签。

用这种方式应用标签时，向设备发送 `POST` 请求，并在请求体中指定所需的 `tags`。例如：

```shell
curl https://api.tailscale.com/api/v2/device/11055/tags \
-u "tskey-<key>" \
-H "Content-Type: application/json" \
--data-binary '{"tags": ["tag:foo", "tag:bar"]}'
```

### 从另一个标签应用标签

认证时，你可以应用与[认证密钥][docs-auth-keys]中不同的标签，前提是每个不同的标签都由应用于该认证密钥的原始标签直接拥有。这样做会替换设备现有的标签。

要应用不同的标签，原始标签必须直接拥有那个标签。例如，如果 `tag:a` 拥有 `tag:b`，你可以把 `tag:b` 应用到用带 `tag:a` 的认证密钥认证的设备。但如果 `tag:a` 拥有 `tag:b`，而 `tag:b` 拥有 `tag:c`，你就不能把 `tag:c` 应用到用带 `tag:a` 的认证密钥认证的设备，因为 `tag:a` 并不直接拥有 `tag:c`。

> **注意：**
>
> **对 OAuth 认证很重要**：当 OAuth 客户端或认证密钥给设备分配标签时，所请求的标签必须与该 OAuth 客户端或认证密钥上的完整标签集合完全一致，或者每个所请求的标签都必须由认证实体的某个标签在 `tagOwners` 部分中所拥有。完全一致检查不会查询 `tagOwners`——它只验证所请求的标签与认证标签完全相同。对其他任何组合（包括应用标签的子集），都必须在 `tagOwners` 中显式配置所有权。

从另一个标签应用标签适用于较大规模的基础设施部署——你可能需要用部署工具给许多服务器加标签。例如，你可以让你的部署系统带 `tag:deployment-1` 标签，它同时拥有 `tag:prod-2` 和 `tag:test-2`：

```json
  "TagOwners": {
    "tag:deployment-1": ["alice@tailscale.com"],
    "tag:prod-2": ["tag:deployment-1"],
    "tag:test-2": ["tag:deployment-1"],
  },
```

\[Missing snippet: visual\_policy\_editor.mdx]

在此配置中，带 `tag:deployment-1` 的 OAuth 客户端可以把 `tag:prod-2` 或 `tag:test-2` 应用到设备。只有一个标签 `tag:prod-2` 的 OAuth 客户端也可以应用 `tag:prod-2`，因为标签完全一致。但如果 OAuth 客户端持有多个标签而只需应用其中一部分，那么每个所请求的标签都必须由某个认证标签拥有。为支持这一点，把该标签加为它自己的所有者：

```json
  "TagOwners": {
    "tag:deployment-1": ["alice@tailscale.com"],
    "tag:prod-2": ["tag:deployment-1", "tag:prod-2"],
    "tag:test-2": ["tag:deployment-1", "tag:test-2"],
  },
```

\[Missing snippet: visual\_policy\_editor.mdx]

你可以生成一个带 `tag:deployment-1` 标签的[认证密钥][docs-auth-keys] `<key-1>`，并提供给部署工具。之后，根据部署的工作负载，系统会认证设备并应用正确的基础设施标签，从而实施正确的[访问控制][docs-access-control]。在启动新的生产服务器时，部署工具可以把设备标记为 `tag:prod-2`：

```shell
sudo tailscale up --auth-key=<key-1> --advertise-tags=tag:prod-2
```

[ar-apply-a-tag-from-another-tag]: #从另一个标签应用标签

[ar-apply-a-tag-to-a-device]: #为设备应用标签

[ar-define-a-tag]: #定义标签

[ar-define-tag-owners]: #定义标签所有者

[ar-ownership-hierarchies]: #高级标签层级

[co-api-update-tags]: https://tailscale.com/api#tag/devices/POST/device/%7BdeviceId%7D/tags

[co-contact-sales]: https://tailscale.com/contact/sales

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-access-control]: /docs/features/access-control

[docs-acls]: /docs/features/access-control/acls

[docs-api]: /docs/reference/tailscale-api

[docs-app-connectors]: /docs/features/app-connectors

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli]: /docs/reference/tailscale-cli

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-node-keys]: /docs/concepts/node-keys

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-policy-syntax-tag-owners]: /docs/reference/syntax/policy-file#tag-owners

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-subnets]: /docs/features/subnet-routers

[docs-tailnet-policy-file]: /docs/reference/glossary#tailnet-policy-file

[docs-targets]: /docs/reference/targets-and-selectors
