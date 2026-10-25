---
title: "授权与 ACL 的对比"
description: "授权与 ACL 作为访问控制机制的对比"
---

最后验证于 Aug 1, 2025

Tailscale 提供两种在 tailnet 中定义访问控制的方式：访问控制列表（[ACL][docs-acls]）和[授权][docs-grants]（grants）。两种方式都遵循默认拒绝的原则，并以声明式的 [huJSON 语法][xt-wiki-json]存在于 [tailnet 策略文件][docs-tailnet-policy-file]中。本文对这两种方式进行比较，探讨它们的能力、局限以及适用的场景。

下表简要概述了这两种访问控制方式的关键差异，凸显授权如何为安全管理提供更现代、更灵活的途径。这一对比可作为后续各节更详细说明的框架。

| 特性                        | ACL                                                | 授权（grants）                                   |
| :-------------------------- | :------------------------------------------------- | :----------------------------------------------- |
| 访问控制方法                 | 仅网络层                                            | 网络层与应用层                                    |
| 默认动作                     | 总是需要显式的 "accept" `action`                    | 隐含接受                                          |
| 格式                         | 网络目标与端口分属不同字段                          | 目标与协议分离更清晰                              |
| 应用能力                     | 否                                                  | 是                                                |
| 路由感知                     | 否                                                  | 是（使用 `via` 字段）                             |
| 设备态势支持                 | 是                                                  | 是                                                |

> **注意：**
>
> 授权与 ACL 相比已*功能完备*，也就是说它具备 ACL 的全部能力。主要区别在于：授权会继续获得新功能和改进，而 ACL 不会。

## 对比

从 ACL 到授权的演变，体现了 Tailscale 在[访问控制][docs-access-control]思路上的转变。本节探讨这两种方式在理念与架构上的差异，追溯 Tailscale 的访问控制模型如何从传统的以网络为中心的方法，逐步成熟为一种衔接网络安全与应用安全的更精密体系。理解这些概念差异，有助于你领会为什么授权已成为现代 tailnet 部署的推荐方式。

### ACL

自平台诞生以来，ACL 一直是 Tailscale 访问控制方法的基石。ACL 只在网络层运作，控制哪些设备可以互相通信，以及通过哪些端口和协议。ACL 系统遵循显式的默认拒绝原则，要求管理员逐项明确允许每种连接类型。

随着组织越来越需要超出网络连接范畴的更细致的访问策略，仅靠 ACL 可能无法满足现代访问控制需求。

更多信息参阅 [ACL 语法参考][docs-policy-syntax]。

### 授权（grants）

授权代表了 Tailscale 访问控制能力的一次重要演进，它把网络层与应用层安全整合进统一、灵活的[语法][docs-grants-syntax]中。授权把安全模型从"只控制哪些设备可以互相通信"扩展为"控制设备和用户在与应用和服务交互时可以行使哪些具体[能力][docs-grants-app-capabilities]"。

这一演进源于对一个共性规律的洞察：网络权限与应用权限本质上归结为同一个概念模型——*源在与目的地通信时拥有某些能力*。授权把这个概念形式化，提供了一种简洁而强大的权限定义方式。授权系统保留了默认拒绝的安全模型，但去掉了强制 `action` 字段这类冗余元素，因为每条授权本身即隐含 `accept` 动作。

授权还引入了更高级的访问控制参数，包括管理对应用功能的访问，以及控制源如何访问目的地（使用 [`via`][docs-via]）。

更多信息参阅[授权语法参考][docs-grants-syntax]。

## 何时使用哪种方式

本节就不同场景下哪种访问控制方式最合适提供指导：解释为什么授权通常是新部署的首选，同时也说明 ACL 仍然适用的一些特定情况。理解这些考量有助于你在为未来安全需求做规划时，就 tailnet 配置做出明智决策。

### 使用授权（推荐）

对于所有新 tailnet 以及对现有部署的更新，授权都是推荐方式。以下情况应使用授权：

* 从零开始构建新的 tailnet 策略。
* 控制应用层权限。
* 需要更整洁、更易维护的策略文件。
* 使用 `via` 字段进行[路由过滤][docs-via]。
* 实现基于[设备态势][docs-device-posture]的访问控制。
* 创建 [Kubernetes][docs-kubernetes] 模拟（impersonation）规则。
* 构建与 Tailscale 集成进行身份验证和授权的自定义应用。

授权系统在持续开发中，将不断获得新功能和改进。Tailscale 的内部工具以及许多开源项目——例如 [TailSQL][xt-gh-tailsql]、[Kubernetes Operator][docs-kubernetes-operator] 和 [`golink`][xt-gh-golink]——已经在利用授权实现细粒度访问控制。

### 使用 ACL

Tailscale 将始终支持 ACL——它是访问控制策略的第一个迭代版本。你可以无限期地继续使用 ACL。

只有以下情况才应使用 ACL：

* 维护大量依赖 ACL 语法的现有部署。
* 使用明确要求 ACL 格式的工具或脚本。
* 需要与较旧的集成保持兼容。

即便在这些情况下，Tailscale 也建议逐步[迁移到授权][docs-grants-migration]，因为授权能力更强、语法更整洁。在过渡期，授权与 ACL 可以共存于同一个策略文件中，从而支持分阶段迁移。

[docs-access-control]: /docs/features/access-control

[docs-acls]: /docs/features/access-control/acls

[docs-device-posture]: /docs/features/device-posture

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-migration]: /docs/reference/migrate-acls-grants

[docs-grants-syntax]: /docs/reference/syntax/grants

[docs-grants]: /docs/features/access-control/grants

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-kubernetes]: /docs/kubernetes

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-via]: /docs/features/access-control/grants/grants-via

[xt-gh-golink]: https://github.com/tailscale/golink

[xt-gh-tailsql]: https://github.com/tailscale/tailsql

[xt-wiki-json]: https://en.wikipedia.org/wiki/JSON
