---
title: "什么是 Tailscale PAM？"
description: "Tailscale PAM 为 Tailscale 网络中的 Linux 服务器、数据库和 Kubernetes 集群等资源提供特权且可审计的访问。"
---

最后验证于 Aug 17, 2026

> **注意：** Tailscale PAM 目前处于 beta 阶段。

各组织一直难以回答关于其现代基础设施的两个问题：*谁能访问什么？*以及*他们做了什么？*传统的特权访问管理（PAM）方案试图用凭证保管库、密码轮换和活动录制来解决这个问题。而现代基础设施让这一模式越来越难以为继：云、Kubernetes、数据库、临时开发环境、AI 代理和 CI/CD 都在创建特权通道，它们早已不只是"保管库里的管理员密码"。

Tailscale PAM 是新一代 PAM 方案，为 Tailscale 网络（即 tailnet）中的关键资源提供应用感知的访问。它为 Linux 服务器、数据库、Kubernetes 集群等提供安全访问。Tailscale PAM 消除了共享凭证和静态凭证带来的风险。它在访问发生的时刻治理特权会话，并在适用时提供完整的会话审计与会话录制。

Tailscale PAM 构建在 Tailscale 平台之上，使用与 Tailscale 相同的[身份层][docs-tailscale-identity]和底层 [WireGuard][docs-wireguard] 加密协议。你无需添加新的身份提供方或密码，即可管理通往 tailnet 内资源的特权通道。

## 使用场景

Tailscale PAM 解决各组织在提供特权访问时面临的常见挑战。

* **消除静态与共享凭证**：

  向开发人员和管理员分发凭证会带来安全风险和管理负担。凭证可能被不安全地共享、在缺乏密码轮换的情况下长期留存，或在员工离职时被遗忘。

  Tailscale PAM 消除了共享凭证。用户身份来自 Tailscale 的身份层，它基于用户的设备和 Tailscale 登录自动识别用户，并在每次连接时进行持续的身份验证与授权。

* **防止长期存在且过度宽泛的权限**：

  在许多组织中，开发人员和管理员会"以防万一"地积累宽泛且持久的访问权限。这是一种安全风险，也违背了[最小权限原则][ln-polp]。

  Tailscale PAM 支持即时（just-in-time）、限定范围且有时限的访问。在需要时授予访问权限——只授予合适的用户、只访问合适的资源、只依据合适的策略。

* **让网络访问具备应用感知能力**：

  传统的访问控制往往基于 IP 地址，难以保护对应用程序的访问。对服务器这类资源而言，基于 IP 的访问对许多现代工作负载来说过于宽泛。如果用户只需要访问一个 SSH 会话、查询一个数据库或使用 Kubernetes 资源，就没有必要开放整台服务器的完整访问。

  Tailscale PAM 让你管理应用感知的访问。它不再问*这个 IP 地址能否访问这台服务器？*，而是问*这个人能否运行这条 SSH 命令、查询这个数据库或操作这个 Kubernetes 资源？*这种细粒度控制能缩小攻击面，确保只有经授权的用户才能访问敏感数据。

* **提供可审计性与会话证据**：

  安全团队、审计人员和事件响应人员不仅需要知道有人连接了，还需要知道他们做了什么。缺乏足够的审计系统时，他们往往无法证明发生了什么，也无法快速发现有害变更，还可能无法应对审计或达成合规目标。

  Tailscale PAM 提供[会话日志][docs-session-logs]、录制、审批与可追溯性，让特权活动可以事后审查。

* **避免脆弱的访问模式**：

  各组织依赖混合式和分布式基础设施。针对不同类型基础设施采用各自为政的访问机制，会增加复杂性、降低效率，并可能带来安全风险。

  Tailscale PAM 通过单一平台提供对云、本地部署、混合环境、私有基础设施以及基于浏览器的工作流的特权访问。

## 系统要求

设置 Tailscale PAM 之前，请确认你已具备以下条件：

* 一个 tailnet。如果你还没有 tailnet，请[注册](https://login.tailscale.com/start)。
* 一个具有 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 权限的 Tailscale 账户，以便使用 Tailscale 管理控制台为你的 tailnet 启用 Tailscale PAM。

## 开始使用

如果你想免费试用 Tailscale PAM，请[加入等候名单][co-pam-waitlist]。如果你想为所在组织进一步了解 Tailscale PAM，请联系 [Tailscale 销售团队][co-contact-sales-border0]。

获得 Tailscale PAM 的访问权限后，请参阅 [Tailscale PAM 入门][docs-pam-get-started]。

## 常见场景

以下小节介绍与提供特权访问相关的常见任务。

* **免共享密钥 SSH 登录 Linux 服务器**：让工程师使用其 Tailscale 身份通过 Tailscale PAM 连接服务器。每个会话都会被授权、记录，并可生成可供回放的录制。
* **向值班工程师授予数据库访问权限**：向生产数据库签发基于身份、有时限的访问权限，无需分发凭证。会话结束后自动撤销。
* **控制对 Kubernetes 集群的访问**：对 `kubectl` 操作应用应用感知的策略，让用户只能运行其角色允许的命令、只能访问其角色允许的资源。
* **为新团队成员开通权限**：将用户添加到你的身份提供方，并根据组成员身份自动开通对应用程序和服务的访问。无需逐个应用开通权限，也没有共享凭证。
* **连接家庭实验室或自托管服务**：安全地访问私有资源，无需将其公开暴露、修改防火墙或运行传统 VPN。
* **生成符合合规要求的审计轨迹**：向审计人员提供基于身份的[会话日志][docs-session-logs]和录制，展示谁访问了资源、何时访问以及做了什么。

## 相关资源

* 有关 Tailscale PAM 架构的信息，请参阅 [Tailscale PAM 架构与核心概念][docs-pam-architecture-and-concepts]。
* 有关在 tailnet 中使用 Tailscale PAM 的信息，请参阅 [Tailscale PAM 入门][docs-pam-get-started]。
* 有关访问 tailnet 内资源的信息，请参阅 [Tailscale PAM 操作指南][docs-pam-how-to]。

[co-contact-sales-border0]: https://tailscale.com/contact/sales-border0

[co-pam-waitlist]: https://tailscale.com/pam-selfserve-waitlist

[docs-pam-architecture-and-concepts]: /docs/privileged-access-management/architecture-and-concepts

[docs-pam-get-started]: /docs/privileged-access-management/get-started

[docs-pam-how-to]: /docs/privileged-access-management/how-to

[docs-session-logs]: /docs/privileged-access-management/session-logs

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-wireguard]: /docs/concepts/wireguard

[ln-polp]: https://tailscale.com/learn/principle-of-least-privilege
