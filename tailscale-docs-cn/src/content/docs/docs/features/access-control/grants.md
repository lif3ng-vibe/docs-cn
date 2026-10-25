---
title: "授权（grant）"
description: "授权是 Tailscale 增强版[访问控制][docs-access-control]系统，将[网络层][ar-network-capabilities]与[应用层][ar-application-capabilities]权限整合到统一"
---

最后验证于 Jul 24, 2026

授权（grant）是 Tailscale 增强版[访问控制][docs-access-control]系统，它将[网络层][ar-network-capabilities]与[应用层][ar-application-capabilities]权限整合到一个统一框架中。借助授权，你可以精确界定每个用户或设备可以访问哪些资源，以及连接之后可以执行哪些操作。授权遵循 Tailscale 的默认拒绝方式，与[零信任][docs-zero-trust]和[最小权限][ln-principle-of-least-privilege]原则保持一致。

> **注意：**
>
> 授权能做 ACL 能做的一切，还支持应用级权限和路由过滤。参见[授权与 ACL 对比][docs-grants-vs-acls]。

准备好开始了吗？查看[入门指南][docs-start]；如果你一直在使用 ACL，请查看[迁移指南][docs-grants-migration]。

## 优势与使用场景

授权将网络与应用权限统一到单一系统中，相比传统访问控制方式优势显著。这种整合方式降低了复杂度，并为整个 tailnet 提供更一致的安全模型。使用授权，你可以：

* 定义设备可以连接哪些主机，以及连接之后对这些主机上运行的应用持有哪些权限。
* 基于[用户角色][docs-user-roles]、[设备态势][docs-device-posture]和其他上下文因素实现细粒度权限。
* 通过[带 `via` 的路由感知][docs-via]扩展访问控制策略。

浏览[授权示例][docs-grant-samples]合集，了解常见使用场景。

## 实现基础

授权的运作原则是：显式定义哪些用户或设备（来源）可以访问哪些资源（目标），以及连接之后拥有哪些能力。每条授权由三个核心组件构成：

* 来源：请求访问的用户或设备。
* 目标：被访问的资源。
* 能力：来源访问目标时被授予的权限。它们按[网络能力][ar-network-capabilities]（`ip` 字段）和[应用能力][ar-application-capabilities]（`app` 字段）分组。

使用授权时，你会在两个不同层面操作：网络层和应用层。网络层指设备之间连接所用的 IP 地址、端口和协议。应用层指应用自身内部的能力，例如用户可以访问哪些具体功能或数据源。这种双层方式比纯网络权限提供更全面的访问控制。

每条授权使用 [`grant` 语法][docs-grants-syntax]，包含一个来源（`src`）、一个目标（`dst`），以及至少一种权限类型：网络权限（`ip`）或应用权限（`app`）。你还可以用附加选项扩展这个基本结构，包括[设备态势][docs-device-posture]检查（`srcPosture`）和路由指定（`via`）。

## 来源与目标

来源（`src`）和目标（`dst`）定义了 tailnet 中谁可以访问什么。这两个字段都接受多种选择器，用于标识用户、设备、组或 IP 地址范围。

来源可以使用如下选择器指定：

* 具体电子邮件地址（`name@example.com`），对应单个用户。
* [组][docs-targets-groups]（`group:engineering`），对应用户组。
* [标签][docs-tags]（`tag:database`），对应设备组。
* 角色（`autogroup:admin`），对应管理用户。

类似地，目标可以使用同类[选择器][docs-targets]定义，还可以使用特殊选择器，如 `autogroup:internet` 和 `svc:web-server`（用于 [Tailscale Services][docs-tailscale-services]）。

更多信息参见[授权语法参考][docs-grants-syntax]。

## 网络能力

[网络能力][ar-network-capabilities]控制 tailnet 内设备之间的基础连接。这些权限定义设备能否建立连接，以及可以使用哪些协议和端口。

授权中的 `ip` 字段指定网络层能力，让你可以在协议和端口层面定义访问。你可以授权访问特定端口、端口范围或整个协议。例如，`"ip": ["tcp:443", "udp:53"]` 授予访问目标上 TCP 端口 `443`（HTTPS）和 UDP 端口 `53`（DNS）的权限。

更多信息参见[授权语法参考][docs-grants-syntax]。

## 应用能力

[应用层能力][ar-application-capabilities]超越了基础连接，定义设备建立连接之后允许执行的操作。目标设备上运行的应用可以从通过 tailnet 发来的请求中读取这些能力，对请求方进行认证与授权。这些能力支持对应用内功能访问的细粒度控制，类似于基于角色的访问控制系统。

`app` 字段以 `"domainName/capabilityName"` 的格式指定应用层能力。例如，`"tailscale.com/cap/tailsql"` 标识 [TailSQL][xt-gh-tailsql] 应用的能力。每个能力可以包含定义具体权限的参数，例如设备可以访问哪些数据源、允许执行哪些操作。这种方式将[零信任原则][docs-zero-trust]延伸到应用层，对已连接的应用实施最小权限原则。

更多信息参见[授权语法参考][docs-grants-syntax]。

## 限制与注意事项

授权虽然提供了强大的访问控制能力，但有几点重要事项需要牢记：

* [应用层能力][docs-grants-app-capabilities]由应用自身定义，而非 Tailscale。每个应用负责记录自己的能力与参数，并实现响应授权中所定义应用能力的逻辑
* Tailscale 策略引擎将应用能力参数视为不透明的 JSON 对象。它只校验应用能力对象是合法 JSON，不会对参数内容本身做任何校验。
* [设备态势][docs-device-posture]检查只作用于授权的来源（`src`），不作用于目标（`dst`）。
* 授权与[旧版 ACL][docs-acls] 可以在同一个 tailnet 策略文件中共存。推荐的最佳实践是，多数场景优先使用授权。

更多信息参见[授权的限制与注意事项][docs-grants-app-capabilities]。

## 后续步骤

不知道接下来做什么？可以考虑以下方向：

* 审视你当前的访问控制模型，寻找[迁移到授权以获得更细粒度权限][docs-grants-migration]的机会。
* 尝试[创建一条授权][docs-grants-syntax]。
* 浏览[授权示例][docs-grant-samples]合集。
* 阅读 [tailnet 策略文件文档][docs-tailnet-policy-file]，了解如何将授权与其他策略组件集成。
* 探索将授权与[设备态势][docs-device-posture]检查相结合以实现上下文感知的访问策略，或通过 [`via`][docs-via] 增加路由感知。
* 考虑实施 [GitOps 工作流][docs-gitops]来管理你的 tailnet 策略文件。

\[Missing snippet: tailscale\_skill.mdx]

[ar-application-capabilities]: #应用能力

[ar-network-capabilities]: #网络能力

[docs-access-control]: /docs/features/access-control

[docs-acls]: /docs/features/access-control/acls

[docs-device-posture]: /docs/features/device-posture

[docs-gitops]: /docs/gitops

[docs-grant-samples]: /docs/reference/examples/grants

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-migration]: /docs/reference/migrate-acls-grants

[docs-grants-syntax]: /docs/reference/syntax/grants

[docs-grants-vs-acls]: /docs/reference/grants-vs-acls

[docs-start]: /docs/how-to/quickstart

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-targets-groups]: /docs/reference/targets-and-selectors#groups

[docs-targets]: /docs/reference/targets-and-selectors

[docs-user-roles]: /docs/reference/user-roles

[docs-via]: /docs/features/access-control/grants/grants-via

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege

[xt-gh-tailsql]: https://github.com/tailscale/tailsql
