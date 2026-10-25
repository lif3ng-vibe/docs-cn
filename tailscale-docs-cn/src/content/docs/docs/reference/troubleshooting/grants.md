---
title: "授权问题排障"
description: "[授权][docs-grants]是 Tailscale 的统一机制，用于在你的 Tailscale 网络（即 [tailnet][docs-tailnet]）中同时定义[网络层与应用层][docs-grants-app-capabilities]的访问控制。"
---

最后验证于 Jan 12, 2026

[授权（grant）][docs-grants]是 Tailscale 的统一机制，用于在你的 Tailscale 网络（即 [tailnet][docs-tailnet]）中同时定义[网络层与应用层][docs-grants-app-capabilities]的访问控制。本指南将带你诊断并解决常见的授权相关问题，从基础的验证技巧逐步深入到复杂授权场景的处理。

## 排查授权（grant）问题

本节介绍可用于检查你的授权策略、验证策略编译以及研究 Tailscale 策略引擎如何将权限应用到特定设备或用户的工具与方法。运用这些诊断技巧能帮你找出大多数授权相关问题的根本原因。

请记住，Tailscale 会在你保存 [tailnet 策略文件][docs-tailnet-policy-file]时验证其语法，包括授权部分。如果存在语法错误，你将无法保存。无论是管理控制台编辑器、[GitOps][docs-gitops-acls]、[Terraform][docs-terraform-provider] 还是我们的 API，都是如此。此外，如果 tailnet 策略文件引用了未定义的目标（例如某个组），你也将无法保存。

### 验证你的授权配置

排障的第一步是验证你的授权是否在 [tailnet 策略文件][docs-tailnet-policy-file]中正确定义。你可以使用管理控制台 [Access controls][docs-access-control] 页面中的 [**Preview rules**][docs-policy-edit] 标签页来检查规则如何应用到特定用户或标签。这能帮你确认策略配置会按你的预期生效。

### 使用 `whois` 检查能力

要诊断授予特定设备或用户的[应用层能力][docs-grants-app-capabilities]相关的问题，[`tailscale whois`][docs-tailscale-cli-whois] 命令非常有用。该命令提供有关节点的详细信息，包括通过你的 tailnet 策略授予它的所有能力。

要检查某个用户或设备的能力，请使用其 [Tailscale IP 地址][docs-100.x-addresses]：

```shell
tailscale whois 100.100.123.123
```

输出内容包括：

* 设备或用户的基本信息。
* 与该设备关联的网络地址。
* 授予该设备的所有能力的列表。

请特别关注输出中的 Capabilities 部分，其中详细列出了授予该设备的所有应用能力。每个能力条目都包含其完整名称和参数，让你可以验证它是否在应用正确的权限。

## 解决常见问题

许多授权相关问题源于基础配置错误，或是对[授权工作机制][docs-grants-syntax]的误解。本节讨论你在使用授权时可能遇到的一些常见问题。

### 选择器匹配问题

[选择器（selector）][docs-targets]可能无法匹配预期的目标。当你的授权中的选择器未能正确识别你想要允许的设备或用户时，就会出现这种情况。

常见的选择器匹配问题包括：

* 电子邮件地址或域名拼写错误。
* 使用了已创建但尚未应用到任何设备的[标签（tag）][docs-tags]。
* 使用了已创建但尚未添加用户的组名。
* 忘记在组名前加 `group:` 前缀或在标签名前加 `tag:` 前缀。这类语法错误会被自动捕获，除非恰好存在与该组或标签同名的 host。

排查选择器匹配问题的方法：

1. 确认你的授权中引用的标签已应用到相应的设备。
2. 检查电子邮件地址是否有拼写错误，尤其是在你向特定用户授予访问权限时。
3. 使用 [`tailscale status`][docs-tailscale-cli-status] 验证应用到设备的标签。你必须在每台要检查的设备上运行该命令。

如果你正在使用 [autogroup][docs-targets-autogroups]（例如 `autogroup:member`），请确保你了解每个 autogroup 中包含哪些设备。例如，`autogroup:member` 包含你的 tailnet 中的所有成员用户，但不包含从其他 tailnet 共享来的设备。

## 较少见与复杂的问题

除了基础配置问题之外，你还可能遇到更复杂的授权问题，尤其是在实现复杂的[访问控制策略][docs-access-control]（例如态势检查、路由过滤或自定义[应用能力][docs-grants-app-capabilities]）时。这些问题通常需要对 Tailscale 策略引擎如何处理和应用授权有更深入的理解。

### `via` 字段路由问题

[授权中的 `via` 字段][docs-via]让你能够依据特定条件，经由不同的路由器对资源访问进行分段。然而，配置不当可能导致路由失败或出现意料之外的流量路径。

常见的 `via` 路由问题包括：

* 指定的 `via` 目标从源无法到达。
* 将 `via` 目标用于未通告相应[子网路由][docs-subnets]的子网路由器。
* 将 `via` 目标用于尚未正确配置的[应用连接器][docs-app-connectors]。
* 将 `via` 目标用于尚未获批准的出口节点。
* 打算将流量路由到子网路由、应用连接器或[出口节点][docs-exit-nodes]，却遗漏了 `via` 字段。

排查 `via` 路由问题的方法：

1. 使用 [`tailscale status`][docs-tailscale-cli-status] 验证 `via` 字段中指定的设备存在且在线。
2. 确认 `via` 设备具有适当的配置。
3. 对于[子网路由器][docs-subnets]，使用 `tailscale status --routes` 检查子网路由是否已通告。
4. 对于[应用连接器][docs-app-connectors]，检查应用连接器是否已正确配置。
5. 对于[出口节点][docs-exit-nodes]，检查出口节点是否已在管理控制台中获得批准。
6. 使用 [`tailscale ping`][docs-tailscale-cli-ping] 检查从源设备能否到达 `via` 设备。
7. 通过查看 `via` 设备上的日志，验证目的地能否经由 `via` 设备到达。

正确的 `via` 配置示例：

```json
"grants": [
  {
    "src": ["group:eng"],
    "dst": ["192.0.2.0/24"],
    "ip":  ["*"],
    "via": ["tag:subnet-router"]
  }
]
```

\[缺失片段：visual\_policy\_editor.mdx]

在此示例中，请确保带有 `tag:subnet-router` 标签的设备存在、在线，并且已通告 `192.0.2.0/24` 子网路由。

### 设备态势验证失败

`srcPosture` 字段让你能够基于[设备态势][docs-device-posture]条件来限制访问。

常见的设备态势问题包括：

* 设备运行的 [Tailscale 版本][docs-versions]过旧，不支持态势检查。
* 态势条件过于严格，或者根本无法满足。
* 态势条件配置错误，存在语法问题。
* 设备缺少态势检查所需的属性。

排查设备态势问题的方法：

1. 验证所有设备都运行最新版本的 Tailscale 客户端。1.52.0 之前的版本不支持态势检查。
2. 检查 tailnet 策略文件中的态势条件是否正确。
3. 使用 [`tailscale status --self`][docs-tailscale-cli-status] 获取用于态势验证的设备属性。
4. 先用更宽松的态势条件进行测试，然后逐步收紧限制。

设备态势验证示例：

```json
"postures": {
  "posture:latest": [
    "node:tsVersion >= '1.42.0'",
    "node:os == 'linux'"
  ]
},
"grants": [
  {
    "src": ["group:eng"],
    "dst": ["tag:prod"],
    "ip":  ["*"]
    "srcPosture": ["posture:latest"]
  }
]
```

\[缺失片段：visual\_policy\_editor.mdx]

如果设备未能通过态势检查，可以暂时移除 `srcPosture` 字段，验证授权在没有态势条件的情况下是否正常工作，然后逐个加回这些条件，以定位有问题的那条条件。

### 应用能力集成问题

将[应用能力][docs-grants-app-capabilities]与授权集成时，如果应用程序未能正确解析 [Tailscale 客户端][docs-installation]提供的能力，就可能出问题。

常见的应用能力问题包括：

* 应用程序没有向本地 Tailscale 客户端查询能力。
* 能力名称或参数结构不正确。
* 应用程序错误解读了 Tailscale 客户端返回的能力。

排查应用能力问题的方法：

1. 验证你的应用程序是否使用 [LocalAPI][xt-tailscale-localapi] 正确地向 Tailscale 客户端查询能力。只有当应用程序不使用 [`tsnet` 库][docs-tsnet]时才需要这样做。
2. 检查能力名称是否与应用程序期望的名称完全一致。
3. 确认授权中的参数符合应用程序期望的模式。
4. 先用简化的能力参数进行测试，再逐步增加复杂度。

正确的应用能力授权示例：

```json
"grants": [
  {
    "src": ["group:eng"],
    "dst": ["tag:tailsql"],
    "ip":  ["tcp:443"],
    "app": {
      "tailscale.com/cap/tailsql": [
        {
          "dataSrc": ["prod", "staging"]
        }
      ]
    }
  }
]
```

\[缺失片段：visual\_policy\_editor.mdx]

在此示例中，请确保运行在带有 `tag:tailsql` 标签的设备上的应用程序正确地检查 `tailscale.com/cap/tailsql` 能力，并正确解析 `dataSrc` 参数。

## 预防策略

本节概述在你的 tailnet 策略中设计、实现和维护授权的最佳实践。遵循这些建议，你可以尽量减少问题的发生，并在问题出现时更顺畅地排障。

### 高效授权的设计原则

* [**最小权限**][ln-principle-of-least-privilege]：对每个源-目的地组合只授予所需的最小权限。在适当的情况下，在 `ip` 字段中明确指定端口和协议。
* **逻辑分组**：将相关的授权放在一起组织，并使用注释说明其用途。这让策略文件更易读、更易维护。
* **命名规范化**：对授权中引用的组、标签和 IP 集合使用一致的命名约定。这能降低拼写错误的风险，让排障更容易。
* **渐进式细化**：先从宽泛的授权开始，随着你对访问控制需求理解的加深逐步细化。这种方式不太可能导致意外的拒绝。
* **文档化**：在策略文件中用注释记录你的授权，说明每条授权存在的原因以及它意图允许的内容。

遵循这些原则将带来一个更易维护的策略文件，更不容易出问题，出现问题后也更容易排查。

### 测试策略

在将变更部署到你的授权之前，请考虑采用以下测试策略：

* **记录测试用例**：在 tailnet 策略文件中创建一组[测试][docs-tests]，覆盖你需要验证的所有权限。
* [**使用访问控制规则预览**][docs-policy-edit]：管理控制台的策略文件编辑器包含一个预览功能，可显示你的编辑将对生效策略产生的变更。在应用变更之前请仔细查看。
* **分阶段推出**：对于重大变更，考虑先向一部分设备或用户分阶段推出，然后再应用到整个 tailnet。

通过在部署前充分测试变更并在部署后持续监控问题，你可以在问题影响用户之前发现并解决它们。

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-access-control]: /docs/features/access-control

[docs-app-connectors]: /docs/features/app-connectors

[docs-device-posture]: /docs/features/device-posture

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-gitops-acls]: /docs/gitops

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-syntax]: /docs/reference/syntax/grants

[docs-grants]: /docs/features/access-control/grants

[docs-installation]: /docs/install

[docs-policy-edit]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-cli-ping]: /docs/reference/tailscale-cli#ping

[docs-tailscale-cli-status]: /docs/reference/tailscale-cli#status

[docs-tailscale-cli-whois]: /docs/reference/tailscale-cli#whois

[docs-targets-autogroups]: /docs/reference/targets-and-selectors#autogroup

[docs-targets]: /docs/reference/targets-and-selectors

[docs-terraform-provider]: /docs/integrations/terraform-provider

[docs-tests]: /docs/reference/syntax/policy-file#测试tests

[docs-tsnet]: /docs/features/tsnet

[docs-versions]: /docs/reference/tailscale-client-versions

[docs-via]: /docs/features/access-control/grants/grants-via

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege

[xt-tailscale-localapi]: https://pkg.go.dev/tailscale.com/ipn/localapi
