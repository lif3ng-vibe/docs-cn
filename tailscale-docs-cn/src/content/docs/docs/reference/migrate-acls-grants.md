---
title: "从 ACL 迁移到授权"
description: "将 ACL 转换为授权。"
---

最后验证于 Mar 13, 2026

[tailnet 策略文件][docs-tailnet-policy-file] 是定义 Tailscale 网络（即 [tailnet][docs-tailnet]）中谁可以访问什么的基础，用于控制[设备连接][docs-connect-to-devices]和管理[逻辑分组与指派][docs-targets]。传统上，访问控制列表（[ACL][docs-acls]）一直是在网络层定义这些权限的主要方法。不过，Tailscale 推出了一个更强大、更灵活的系统，叫做[授权（grant）][docs-grants]。虽然 ACL 会一直可用，但推荐的最佳实践是优先使用授权。本指南将带你完成从 ACL 迁移到授权的过程，并说明其优势、提供转换示例，还给出确保顺利过渡的最佳实践。

\[Missing snippet: visual\_policy\_editor.mdx]

## 了解差异

ACL 和授权都采用[最小权限][ln-principle-of-least-privilege]和[默认拒绝][xt-wiki-deny-by-default]的方法，但授权具备多项优势。

ACL 主要关注网络层权限，其语法将目标和端口合并到一个字段中。每条 ACL 条目还需要显式的 `action` 字段，尽管 `accept` 是唯一可能的取值。随着 tailnet 规模扩大，这种结构会变得越来越复杂、难以阅读。

而授权在 ACL 的基础上更进一步，用统一的语法涵盖网络层和应用层能力。它还把目标与端口/协议拆分到不同字段，可读性更好，并去掉了多余的 `action` 字段。

更多信息请参阅 [授权与 ACL 的对比][docs-grants-vs-acls]。

## 迁移到授权的好处

迁移到授权有以下几个好处：

* **网络层与应用层权限**：授权最显著的优势是能够同时控制网络层和应用层的访问。ACL 只能判断连接在网络层是否被允许，而授权还能规定连接建立后，在目标上运行的应用中允许执行哪些操作。
* **更直观的语法**：授权提供更直观、更一致的语法。通过将目标与端口规范分开，tailnet 策略文件更易于阅读、编写和维护。
* **路由感知**：授权中的 [`via`][docs-via] 字段可以控制流量在前往目标的途中如何经过子网路由器、出口节点或应用连接器。这意味着你不仅能控制谁可以访问什么，还能控制访问的路由方式。

## ACL 与授权的结构映射

下表列出了 ACL 与授权结构之间的映射，帮助你直观了解转换过程。

| ACL 元素                               | 授权元素                         | 说明                                       |
| :------------------------------------- | :------------------------------- | :----------------------------------------- |
| `"acls": [...]`                        | `"grants": [...]`                | 顶层数组更改名称                           |
| `"action": "accept"`                   | *已移除*                         | 在授权格式中隐含                           |
| `"src": [...]`                         | `"src": [...]`                   | 源主体保持不变                             |
| `"dst": [...]`                         | `"dst": [...]` 和 `"ip": [...]`  | 目标主体与端口分离                         |
| 端口在目标中：`"tag:server:80"`        | 端口在 `"ip"` 字段中：`"80"`     | 端口规范移至 `ip` 字段                     |
| `"proto": "tcp"`                       | `"ip"` 字段的一部分：`"tcp:80"`  | 协议嵌入 `ip` 字段                         |
| `"srcPosture": [...]`                  | `"srcPosture": [...]`            | 两种格式中相同                             |
| *不可用*                               | `"app": {...}`                   | 用于应用层能力的新字段                     |
| *不可用*                               | `"via": [...]`                   | 用于路由控制的新字段                       |

这一结构映射为下文的系统性转换过程奠定了基础。

## 基本迁移模式

将 ACL 转换为授权的过程遵循一些固定模式，你可以系统地将这些模式应用到 tailnet 策略文件中。本节通过实际示例说明基本的转换步骤。

将标准 ACL 条目转换为授权的基本模式是：在保持访问权限不变的前提下重新组织各个组成部分。

1. 移除 `action` 字段。
2. 将目标中的端口规范与 `proto` 字段中的协议合并到 `ip` 字段。

在 ACL 中，你通常会看到这样的结构：

```json
"acls": [
  {
    "action": "accept",
    "src": ["group:eng"],
    "dst": ["tag:web-server:443"],
    "proto": "tcp",
  }
]
```

转换为授权时，需要把它重组为：

```json
"grants": [
  {
    "src": ["group:eng"],
    "dst": ["tag:web-server"],
    "ip": ["tcp:443"],
  }
]
```

主要区别：授权中 `action` 字段是隐含的，因此被移除；端口规范则从 `dst` 字段移到单独的 `ip` 字段。这种拆分让策略更易读、更易维护，在处理多个端口或协议时尤其明显。

> **提示：**
>
> 如果 ACL 未指定协议，授权中也无需指定协议。

对于指定了多个端口的 ACL：

```json
"acls": [
  {
    "action": "accept",
    "src": ["group:eng"],
    "dst": ["tag:web-server:80", "tag:web-server:22"],
  }
]
```

转换为：

```json
"grants": [
  {
    "src": ["group:eng"],
    "dst": ["tag:web-server"],
    "ip": ["80", "22"]
  }
]
```

但如果原始目标（`dst` 字段）指向两个不同的[标签][docs-tags]，你必须创建两条授权——每条对应一个标签。

```json
"acls": [
  {
    "action": "accept",
    "src": ["group:eng"],
    "dst": ["tag:web-server:80", "tag:dev-server:22"],
  }
]
```

转换为：

```json
"grants": [
  {
    "src": ["group:eng"],
    "dst": ["tag:web-server"],
    "ip": ["80"]
  },
  {
    "src": ["group:eng"],
    "dst": ["tag:dev-server"],
    "ip": ["22"]
  }
]
```

如果把这个 ACL 转换成单条授权，`dev-server` 和 `web-server` 两个标签都会同时获得端口 `80` 和端口 `22` 的访问权限，这与原始 ACL 的权限结果不同。

### 使用管理控制台将 ACL 转换为授权

管理控制台在 JSON 编辑器旁提供了一个 **Convert to grants** 按钮，可自动将整个 `acls` 部分转换为等效的 `grants` 条目。

1. 打开管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。
2. 选择 **JSON editor**。
3. 在 **Convert ACLs to grants** 下方，选择 **Convert to grants**。
4. 在编辑器中检查转换后的授权。转换会移除 `acls` 部分，并替换为等效的 `grants` 部分。
5. 选择 **Save** 应用更改。

**Convert to grants** 按钮始终显示在 JSON 编辑器中，但当你的 tailnet 策略文件不包含 `acls` 部分时，该按钮处于禁用状态。

> **警告：**
>
> 转换会在编辑器中立即生效，不会弹出确认对话框。保存前请仔细检查转换后的授权。Tailscale 会将所有 tailnet 策略文件变更记录在[配置审计日志][docs-audit-logging]中，你可以借此还原更改。

### 手动将 ACL 转换为授权

本节介绍手动将 ACL 转换为授权的分步流程，并说明一些可能增加复杂度的情形。

> **提示：**
>
> Tailscale 会将所有 tailnet 策略文件变更记录在[配置审计日志][docs-audit-logging]中，你可以借此还原更改。

首先，找出 tailnet 策略文件中的所有 ACL 条目，并按其功能或所保护的资源进行分类。这样组织有助于你把相关条目放在一起转换，并让授权保持清晰连贯的结构。

对每条 ACL 条目，按以下流程转换：

1. 创建一个新的授权对象，其 `src` 数组包含 ACL 中 `src` 数组的值。
2. 在授权对象中创建 `dst` 数组。
3. 在授权对象中创建 `ip` 数组。
4. 对 ACL 中 `dst` 数组的每个条目：
   1. 按冒号（`:`）拆分条目，分离出目标和端口。
   2. 将目标（冒号前的部分）加入 `dst` 数组。
   3. 如果 ACL 规则有 `proto` 字段，就把该协议加到 `dst` 字段的端口前面（例如 `"tcp:80", "tcp:443"`）。
   4. 如果未指定 `proto` 字段，则不加协议前缀。
   5. 将得到的协议字符串加入 `ip` 数组。
5. 如果 ACL 规则有 `srcPosture` 数组，直接把它复制到授权对象中。

如果同一条 ACL 规则中的多个目标有不同的端口要求，应为每个目标创建单独的授权规则，以保持权限清晰、明确。

对于复杂的策略，可以考虑分阶段进行，每次转换一个部分或一个功能区域。这种渐进策略可以降低风险，也更容易发现并解决迁移过程中出现的问题。

把所有 ACL 都转换为授权后，请通读整个 tailnet 策略文件，检查其一致性和完整性。确认所有必需的权限都得到保留，并且最终的授权结构合理、可维护。

## 迁移场景

除了基本模式之外，迁移时你还可能遇到需要特殊处理的更复杂 ACL 配置。本节讨论这些场景，并给出转换为授权的指导。

### 通配符

处理使用通配符端口或协议（`*`）的 ACL 时，转换为授权需遵循特定规则。例如，允许访问所有端口的 ACL：

```json
"acls": [
  {
    "action": "accept",
    "src": ["group:prod"],
    "dst": ["tag:database:*"],
  }
]
```

转换为：

```json
"grants": [
  {
    "src": ["group:prod"],
    "dst": ["tag:database"],
    "ip": ["*"],
  }
]
```

### IP 地址段与 CIDR 表示法

对于使用 IP 地址段或 [CIDR 表示法][xt-wiki-cidr] 的 ACL，转换方法类似，但要注意 `dst` 和 `ip` 字段的组织方式。在授权中，CIDR 表示法保留在 `dst` 字段，协议和端口规范则移到 `ip` 字段：

```json
"acls": [
  {
    "action": "accept",
    "src": ["group:devops"],
    "dst": ["192.0.2.0/24:22"],
    "proto": ["tcp"],
  }
]
```

转换为：

```json
"grants": [
  {
    "src": ["group:devops"],
    "dst": ["192.0.2.0/24"],
    "ip": ["tcp:22"],
  }
]
```

### autogroup

如果你在 ACL 中使用了 `autogroup:member` 或 `autogroup:self` 等 [autogroup 选择器][docs-targets-autogroups]，它们可以直接转换为授权，无需任何特殊处理：

```json
"acls": [
  {
    "action": "accept",
    "src": ["autogroup:member"],
    "dst": ["autogroup:self:*"],
  }
]
```

转换为：

```json
"grants": [
  {
    "src": ["autogroup:member"],
    "dst": ["autogroup:self"],
    "ip": ["*"],
  }
]
```

## SSH 规则

[Tailscale SSH][docs-tailscale-ssh] 在策略文件中使用单独的 `ssh` 部分，与 ACL 和授权都相互独立。迁移期间，这些 SSH 规则保持原格式不变。

## 测试迁移结果

你可以在 tailnet 策略文件中编写访问控制[测试][docs-tests]，确保迁移后的策略授予预期的访问权限。

你也可以使用管理控制台编辑器中的 **Preview rules** 标签页。通过 Tailscale 管理控制台修改 tailnet 策略文件时，可以在应用更改前先预览，检查策略是否授予预期的访问权限。

## 授权管理最佳实践

在你过渡到授权并开始以这种新格式管理策略时，遵循以下最佳实践有助于确保访问控制系统平稳且可维护。

* 合理组织授权，把相关权限归为一组，并用注释说明每个部分的用途。
* 考虑采用分阶段迁移方式，对大型组织尤其如此。先把最基本的 ACL 转换为授权，再逐步迁移更复杂的规则，最后一步再添加应用层能力。这种分阶段方式可以降低风险，也更容易发现并解决迁移过程中出现的问题。
* 为授权结构及其设计理由编写文档，应用层能力尤其如此。这些文档对新团队成员的上手很有价值，方便他们理解或修改策略。

## 常见问题排查

即使经过周密的规划和测试，迁移过程中仍可能遇到一些挑战。

如果迁移后发现权限缺失，请仔细检查是否正确转换了所有 ACL 条目。常见错误包括：忘记在 `ip` 字段中包含所有端口或协议，或者在合并多条 ACL 条目时遗漏了某些目标。

在复杂环境中，你可能遇到授权相互重叠、产生意外访问路径的情况。请检查你的授权，确保它们没有在无意中提供超出预期的访问权限，在处理 `ip` 字段中的通配符或地址段时尤其要注意。

更多排查指导请参阅 [授权问题排查][docs-grants-troubleshooting]。

[docs-acls]: /docs/features/access-control/acls

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-connect-to-devices]: /docs/how-to/connect-to-devices

[docs-grants-troubleshooting]: /docs/reference/troubleshooting/grants

[docs-grants-vs-acls]: /docs/reference/grants-vs-acls

[docs-grants]: /docs/features/access-control/grants

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-targets-autogroups]: /docs/reference/targets-and-selectors#autogroups

[docs-targets]: /docs/reference/targets-and-selectors

[docs-via]: /docs/features/access-control/grants/grants-via

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege

[xt-wiki-cidr]: https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing

[xt-wiki-deny-by-default]: https://en.wikipedia.org/wiki/Fail-safe

[docs-tests]: /docs/reference/syntax/policy-file#tests
