---
title: "加固 tailnet 的最佳实践"
description: "Tailscale 提供许多可用于提升网络安全性的安全特性。本页介绍使用这些特性来加固 Tailscale 部署的最佳实践。"
---

最后验证于 Jan 20, 2026

Tailscale 提供许多可用于提升网络安全性的安全特性。本页介绍使用这些特性来加固 Tailscale 部署的最佳实践。

参阅 [Tailscale 安全概览][co-security]，其中包括 Tailscale 如何在设计上内置安全性，以及我们用于保护你的信息安全的内部控制措施。

## 基线实践

*基线实践是适用面广、价值高的安全改进步骤。*

### 及时升级 Tailscale 客户端

**定期、及时地升级 Tailscale 客户端**。Tailscale 频繁推出新功能并[修补现有版本][docs-versions-version-support]，其中包括安全补丁。

通过[检查更新][docs-update-check-for-updates]查看 tailnet 中每台设备上安装的 Tailscale 客户端版本，并使用[自动更新][docs-update-auto-updates]让 Tailscale 客户端自动保持最新。

### 订阅安全公告

**订阅 [Tailscale 安全公告][co-security-bulletins]**（通过 [RSS][co-security-bulletins-index.xml]）。Tailscale 发布安全公告，披露影响 Tailscale 的安全问题。如果你直接受到某一安全问题的影响，且我们掌握你的联系信息，我们会主动与你联系。

### 设置安全问题邮件的联系人

**设置[安全问题邮件联系人][docs-contact-preferences-security-issues-email]**。如果你直接受到某一安全问题的影响，且我们掌握你的联系信息，我们会主动与你联系。如果未设置安全联系人邮箱，Tailscale 会采用默认行为，即将安全问题邮件发送到 tailnet 所有者的邮箱地址。

如果希望通知多名用户，可以考虑使用邮件组。例如，安全问题通知使用 `security@example.com` 而不是 `alice@example.com`。

> **注意：**
>
> 如果你使用 GitHub 作为身份提供方，那么除非你在[联系人偏好设置][docs-contact-preferences]中添加了邮箱地址，否则我们没有可用的联系邮箱。

### 在身份提供方中启用 MFA

**在身份提供方中为登录 Tailscale 启用多因素认证，最好使用硬件令牌**。Tailscale 依靠你现有的[身份提供方（IdP）][docs-sso-providers]来认证用户。身份提供方的所有认证设置都会被 Tailscale 自动沿用，包括 MFA 和上下文感知访问。

如何启用多因素认证，请遵循[身份提供方的文档][docs-multifactor-auth]。

### 定义访问控制策略

**使用访问控制，基于职务职能、按照最小权限原则来定义你要在网络中允许的连接**。Tailscale 的[访问控制策略][docs-access-control]让你可以定义网络中哪些用户、组、IP 地址、CIDR、主机和标签可以互相连接。借助访问控制策略，你可以按用户身份（而非 IP 地址）为访问网络内服务的用户定义[基于角色的访问控制][bl-rbac-meant-to-be]。请遵循[最小权限原则][ln-principle-of-least-privilege]，确保用户仅被授予访问预期资源的权限。

根据职务职能及其所需访问的内容来限制用户访问。常见场景请参阅[授权（grant）示例][docs-grant-samples]。

### 在访问控制策略中使用组

**使用组来管理你的用户**。使用组可以让身份按职务职能来管控。当有人离开组织或变更角色时，你只需调整其组成员身份，而无需更新其所有的访问控制策略。

在访问控制策略中为一组用户定义[组][docs-policy-syntax-groups]，并在访问规则中使用它们。启用[用户与组预配][docs-user-group-provisioning]可以从身份提供方同步用户和组，自动添加或停用用户，并在访问控制策略中使用同步而来的组。

### 在访问控制策略中使用标签

**使用标签（tag）来管理设备**。使用标签可以按用途（而非按所有者）定义对设备的访问。当有人离开组织或变更角色时，其设置过的公共设备（如服务器）无需重新配置。

在访问控制策略中定义[标签][docs-tags]，并在访问规则中使用它们。使用[带标签的认证密钥（auth key）][docs-tags-auth-key]，设备在认证时会自动打上标签。

### 为 Tailscale SSH 使用检查模式

**使用检查模式（check mode）验证高风险的 Tailscale SSH 连接**。检查模式要求某些连接，或以特定用户（如 `root`）身份发起的连接，在连接前重新认证。这样用户可以在接下来的 12 小时内（或指定的检查周期内）访问这些高风险应用，之后再次重新认证。检查模式仅适用于 [Tailscale SSH][docs-tailscale-ssh] 连接。

在访问控制策略的 `ssh` 规则中，[将 `action` 字段设置为 `check`][docs-tailscale-ssh-check-mode]，即可为高风险的 Tailscale SSH 连接配置检查模式。

### 为 Tailscale SSH 使用会话录制

**设置会话录制，记录 Tailscale SSH 会话的内容**。Tailscale SSH 的会话录制功能将这些录像流式传输到 tailnet 中专门的录制节点，Tailscale 无法接触这些录像。你可以将录制节点部署为 Docker 容器，并将录像配置为存储在 Docker 宿主机的磁盘或 Amazon S3（及其他 S3 兼容对象存储服务）上。会话录制仅适用于 [Tailscale SSH][docs-tailscale-ssh] 连接。

按照[这些说明][docs-tailscale-ssh-session-recording]部署录制节点，并更新访问控制策略以强制会话录制。

### 审查配置审计日志

**审查在你的 tailnet 中谁在什么时候做了什么**。[配置审计日志][docs-audit-logging]记录修改 tailnet 配置的操作，包括操作类型、操作者、目标资源和时间。

定期审查日志；如有需要，可使用 Tailscale API [导出日志][docs-audit-logging-access-via-api]以长期保存。

### 获取 tailnet 内事件的通知

**使用 webhook 订阅事件**。[Webhook][docs-webhooks] 让你能够订阅 Tailscale 网络上的特定事件，并通过集成或应用处理事件通知。例如，你可以订阅添加节点、更新 [tailnet 策略文件][docs-policy-syntax]等事件，然后在 Slack 频道或其他应用中接收事件通知。

订阅 tailnet 管理事件，即可获知 tailnet 策略文件的变更、新节点、新用户等动向。

### 在用户离开时将其移出

**将暂停或删除用户纳入离职处理流程**。将用户移出 Tailscale 可确保他们不再拥有机器授权、API 密钥、认证密钥等资源的访问权限。

在用户离开时自动或手动暂停其账户。具体流程可能因你的身份提供方以及是否使用用户与组预配（SCIM）而异。

更多信息请参阅[用户移出][docs-offboarding-users]。

## 进阶实践

*进阶实践不一定普遍适用。其中一些特性还需要更多配置，或要求对安全与网络有更深入的了解。*

### 使用测试

**编写测试，确保访问控制不会意外变动**。访问控制策略测试让你可以确认访问控制符合预期，这样在做出更改后，重要权限不会被意外撤销，关键系统也不会被意外暴露。

在访问控制策略中定义[访问控制策略测试][docs-policy-syntax-tests]。每当访问控制策略更新时，这些测试都会自动校验。

### 分配管理员角色

**基于职务职能并出于职责分离的考虑，适当地分配用于管理 Tailscale 的用户角色**。Tailscale 提供多种用户角色，用于限制谁可以修改 tailnet 配置。这样就能在可以修改用户和设备的管理员（如 IT 管理员）与可以修改网络配置的人员（如网络团队）之间实现职责分离。

在管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面[分配角色][docs-changing-user-roles]：[管理员（Admin）、网络管理员（Network admin）、IT 管理员（IT admin）、账单管理员（Billing admin）和审计员（Auditor）][docs-user-roles]。

### 启用设备审批

**要求设备在加入网络前先获得批准**。你可以要求新设备先由管理员人工审核并批准，然后才能加入网络。这可以用来确保只有受信任的设备（如公司管理的笔记本电脑和手机）才能访问网络。

在管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面[启用设备审批][docs-device-approval]。

### 自定义节点密钥过期时间

**要求用户定期将设备重新认证入网，从而轮换密钥**。设备使用公共[节点密钥（node key）][bl-tailscale-key-management-node-keys]连接到你的 tailnet，该密钥会在一段时间后自动过期，从而强制轮换密钥。默认情况下，Tailscale 要求设备每 180 天重新认证一次，但有些组织可能需要更严格的控制。

在管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management) 页面[修改密钥过期时间][docs-key-expiry]。

### 保护你的网络边界

**限制对你私有网络的访问，例如使用防火墙**。Tailscale 让你轻松连接设备，无论它们身处哪个局域网，并确保设备间流量经过端到端加密。不过，Tailscale 并不会保护你的设备免受其他任何流量的侵扰。

为你的网络或[你的设备][docs-secure-server-ubuntu]设置防火墙。更多配置信息请参阅[将 Tailscale 与你的防火墙配合使用][docs-firewalls]。

### 启用 HTTPS

**为托管在网络内的内部 Web 工具获取公共 TLS 证书**。Tailscale 节点之间的连接已经通过端到端[加密][docs-encryption]得到保护。但浏览器并不知情，因为浏览器依赖的是校验域名的 TLS 证书。为内部 Web 工具从公共 CA 获取 TLS 证书，可以避免浏览器安全警告让用户感到困惑。

在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面为 tailnet [配置 HTTPS][docs-enabling-https]。注意，证书会被记入 Certificate Transparency 日志，因此机器名称不应包含隐私信息。

### 使用按需访问

**利用即时访问（JIT）请求来限制对网络资源的访问**。这样可以按即时方式授予和撤销访问权限，可用于管理由 Tailscale 管控的资源的临时访问。Tailscale 与[多种][docs-jit-access-integrations]按需访问产品都有集成。

### 移除不再使用的 OAuth 客户端

**定期移除网络中不再需要的 OAuth 客户端**。这可以防止泄露的 OAuth 客户端被用于通过 Tailscale API 访问你的网络。

在管理控制台的 [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) 页面找到现有的 OAuth 客户端，并移除不再需要的。

### 移除不再使用的 API 密钥和认证密钥

**定期移除网络中不再需要的 API 密钥和认证密钥**。这可以防止泄露的密钥被用来向你的网络添加未经授权的用户或设备。

在管理控制台的 [Keys](https://console.tailscale.com/admin/settings/keys) 页面找到现有的 API 密钥和认证密钥，并移除不再需要的。如果你使用认证密钥只为单台设备做认证，可以考虑改用[一次性认证密钥][docs-auth-keys]。

### 防范 DNS 重绑定攻击

**确保为 HTTP 服务提供 Host 头**。tailnet 中通过 HTTP（而非 HTTPS）提供的 Web 服务可能容易受到 [DNS 重绑定][xt-wikipedia-dns-rebinding]攻击：访问恶意网页的 Tailscale 节点可能被触发运行客户端脚本，进而攻击 tailnet 中的其他节点。HTTP 服务可以通过校验传入 HTTP 请求的 Host 头是否在允许列表中，来检测 DNS 重绑定攻击。

在发送给 tailnet 内运行的 HTTP 服务的 HTTP 请求报文中，设置 Host 头字段。例如，在 HTTP 请求报文中设置：

```
GET /resource HTTP/1.1
Host: www.example.com
```

也可以是 MagicDNS 完全限定域名，例如：

```
Host: webserver.example2.ts.net
```

### 用 GitOps 管理访问控制策略更新

**使用 GitOps 将 [tailnet 策略文件][docs-policy-syntax]的唯一事实来源保存在 Tailscale 管理控制台之外的代码中，并利用代码仓库工具的功能来管理和版本化访问控制策略**。通过 [GitHub Actions][docs-gitops-acls] 或 [GitLab CI][docs-gitops-acls-gitlab] 为 Tailscale 采用 GitOps，可以在代码仓库中管理 tailnet 策略文件，并使用受保护分支与必需的代码审查来管控变更。采用 GitOps 还能对 tailnet 策略文件的变更进行版本记录和审计追踪。

例如，你可以要求特定人员批准，或强制测试全部通过后才能合并变更。

### 用基础设施即代码部署 Tailscale

**使用基础设施即代码（IaC）工具以编程方式部署 Tailscale 基础设施**。使用 IaC 工具部署后，一旦出现问题，你可以部署（或重新部署）一致的或先前的配置版本。

设置 [Terraform][docs-terraform-provider] 或 [Pulumi][docs-pulumi-provider] 的 Tailscale provider 来与 Tailscale API 交互。支持的功能包括定义 [tailnet 策略文件][docs-policy-syntax]、设置 DNS、生成[认证密钥][docs-auth-keys]以及管理设备属性。请将 Tailscale API 的访问权限仅授予你的 IaC 工具，使所有配置变更都集中管理。

### 使用设备态势

**使用[设备态势（device posture）][docs-device-posture]来衡量设备的安全或可信程度**。根据能表明安全问题的设备属性来限制访问。例如，你可以要求特定的 Tailscale 客户端版本、特定的操作系统或磁盘加密。[Enterprise 套餐][co-pricing]还支持基于地理位置限制访问。这对远程办公安全、自带设备（BYOD）策略以及[零信任][docs-zero-trust]强制执行都很有用。

### 使用网络流日志

**使用[网络流日志（Network flow logs）][docs-network-flow-logs]来了解 Tailscale 网络中节点间的连接方式**。在启用网络流日志、客户端运行足够新的版本、且未使用 [`tailscaled --no-logs-no-support`][docs-log-mesh-traffic-opt-out] 的情况下，节点会向 Tailscale 日志服务上报其网络活动。这些日志可通过 Tailscale API 访问。

定期审查日志；如有需要，导出日志以长期保存。

### 限制多用户系统

多个用户账户共用一台设备时，某个用户若不注销就切换到另一个账户，可能让其他用户得以访问 tailnet 中的资源。这适用于 Linux、Windows 和 macOS。

不建议在多人共用的设备上使用 Tailscale，除非这些人之间共享 tailnet 访问能为你的安全策略所接受。

[bl-rbac-meant-to-be]: https://tailscale.com/blog/rbac-like-it-was-meant-to-be

[bl-tailscale-key-management-node-keys]: https://tailscale.com/blog/tailscale-key-management#node-keys

[co-pricing]: https://tailscale.com/pricing

[co-security-bulletins-index.xml]: https://tailscale.com/security-bulletins/index.xml

[co-security-bulletins]: https://tailscale.com/security-bulletins

[co-security]: https://tailscale.com/security

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#groups

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-access-control]: /docs/features/access-control

[docs-audit-logging-access-via-api]: /docs/features/logging/audit-logging#accessing-configuration-audit-logs-using-the-tailscale-api

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-changing-user-roles]: /docs/features/sharing/how-to/change-role

[docs-contact-preferences-security-issues-email]: /docs/reference/contact-preferences#setting-the-security-issues-email

[docs-contact-preferences]: /docs/reference/contact-preferences

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-device-posture]: /docs/features/device-posture

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-firewalls]: /docs/integrations/firewalls

[docs-gitops-acls-gitlab]: /docs/integrations/gitlab/gitops

[docs-gitops-acls]: /docs/gitops

[docs-grant-samples]: /docs/reference/examples/grants

[docs-jit-access-integrations]: /docs/integrations/jit-access

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-log-mesh-traffic-opt-out]: /docs/features/logging#opt-out-of-client-logging

[docs-multifactor-auth]: /docs/multifactor-auth

[docs-network-flow-logs]: /docs/features/logging/network-flow-logs

[docs-offboarding-users]: /docs/features/sharing/how-to/offboard

[docs-pulumi-provider]: /docs/integrations/pulumi-provider

[docs-secure-server-ubuntu]: /docs/how-to/secure-ubuntu-server-with-ufw

[docs-sso-providers]: /docs/integrations/identity

[docs-tags-auth-key]: /docs/features/tags#best-practices

[docs-tags]: /docs/features/tags

[docs-tailscale-ssh-check-mode]: /docs/features/tailscale-ssh#configure-tailscale-ssh-with-check-mode

[docs-tailscale-ssh-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-terraform-provider]: /docs/integrations/terraform-provider

[docs-update-auto-updates]: /docs/features/client/update#auto-updates

[docs-update-check-for-updates]: /docs/features/client/update#check-for-updates

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[docs-user-roles]: /docs/reference/user-roles

[docs-versions-version-support]: /docs/reference/tailscale-client-versions

[docs-webhooks]: /docs/features/webhooks

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege

[xt-wikipedia-dns-rebinding]: https://en.wikipedia.org/wiki/DNS_rebinding
