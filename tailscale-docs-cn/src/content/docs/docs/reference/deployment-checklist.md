---
title: "部署清单"
description: "确保你的 Tailscale 部署取得成功的检查清单。"
---

最后验证于 Jan 5, 2026

要实现成功且可扩展的 Tailscale 部署，除了配置单个设备和[访问控制][docs-access-control]之外，还有许多需要考虑的议题。本主题详细介绍了在大规模使用和部署 Tailscale 时那些不太显眼但依然重要的关注点。你可以将本主题用作你的 Tailscale 部署检查清单。

## 支持

* **内部支持**——向你的用户提供文档，说明如何在组织内获得内部支持。有关自定义 Tailscale 客户端以提供帮助的方法，请参阅[终端用户客户端配置][ar-end-user-client-configuration]。
* **Tailscale 支持**——在内部文档中记录[联系 Tailscale 支持][co-contact-support]的方式和时机。还应包含相关部门（例如 IT 服务台或生产运维团队），并说明要求终端用户在内部报告问题时生成 [bug 报告][docs-bug-report]、在联系 Tailscale 支持时提供 bug 报告标识符。

## 及时了解 Tailscale 动态

* 订阅 Tailscale 的[新闻邮件][xt-newsletter]和[博客][bl-blog-newsletter]，及时了解 Tailscale 的一般动态。请使用指向一组用户而非单个人员的邮箱地址。
* 订阅 Tailscale 的[更新日志（changelog）][co-changelog] RSS 源，及时了解客户端与服务的变化。
* 订阅 Tailscale 的[安全公告][co-security-bulletins] RSS 源，及时了解安全通知。

### 组织通知

* 设置[联系人偏好](https://console.tailscale.com/admin/settings/contact-preferences)，以接收有关账户、配置和安全更新的邮件通知。请使用指向一组用户而非单个人员的邮箱地址。

## 生产环境最佳实践

* 了解 Tailscale 与客户之间如何[分担安全责任][docs-shared-responsibility]。
* 落实与[安全][docs-security-hardening]、[性能][docs-performance-best-practices]及特定提供商相关的[生产环境最佳实践][docs-production-best-practices]。
* 了解[直连与中继连接][docs-connection-types]的区别，以及在你的环境中需要[开放哪些防火墙端口][docs-firewall-ports]（如果需要）才能获得最佳性能。

## tailnet 管理

以下各节详细介绍如何大规模管理你的 Tailscale 网络（即 tailnet）。

### 常规设置

* 根据你组织的需求和安全策略，配置 [tailnet](https://console.tailscale.com/admin/settings/general)、[用户管理](https://console.tailscale.com/admin/settings/user-management)和[设备管理](https://console.tailscale.com/admin/settings/device-management)设置。
* 使用[基础设施即代码][docs-infrastructure-as-code]和 [GitOps][docs-gitops-acls] 管理 tailnet 设置（如设备审批与密钥有效期、DNS 设置、日志流式传输和态势集成等），从而在你的版本控制系统中留存 Tailscale 访问控制与配置变更的审计追踪，并由同伴评审变更。

### tailnet 策略文件管理

* 使用[基础设施即代码][docs-infrastructure-as-code]和 [GitOps][docs-gitops-acls] 管理 tailnet 策略文件（其中包括访问控制策略、标签和其他设置）。这样可以在你的版本控制系统中留存 Tailscale 访问控制与配置变更的审计追踪，并由同伴评审变更。
* 查看[标签命名的常见模式][docs-tags-common-tag-names]，并实现一致的标签，用以表示设备的访问模式与网段。

## 用户管理

以下各节详细介绍如何大规模管理 tailnet 中的用户，包括用户预配、角色分配和认证要求。

### 用户与组预配

* 使用受支持的提供商配置[跨域身份管理系统（SCIM）][ln-what-is-scim]，以启用自动[用户与组预配][docs-user-group-provisioning]。

### Tailscale 专属角色

* 将组织的[所有权][docs-user-roles-owner]移交给合适的团队成员。创建 tailnet 的人往往并不是适合长期担任所有者的人。
* 根据团队成员的职务职能与职责，为其分配合适的 [Tailscale 专属角色][docs-user-roles]。网络管理员（Network admin）、IT 管理员（IT admin）和账单管理员（Billing admin）是常见的分配角色。

## 设备管理

* 设置[自定义认证周期][docs-key-expiry-custom-auth-period]，按照你公司的安全策略要求用户向你的身份提供方重新认证。
* 启用[设备身份收集][docs-device-identity]，以准确识别 tailnet 中的设备。
* 设置[默认源态势规则][docs-device-posture-default-source-posture]，要求最低的操作系统和 Tailscale 客户端版本。

### EDR 与 MDM 集成

* 将 Tailscale 与你的 [EDR 和 MDM 工具][docs-device-posture-edr-and-mdm-integrations]集成配置。
* 基于 EDR 和 MDM 工具提供的设备属性定义[设备态势条件][docs-device-posture-conditions]。

### 终端用户客户端配置

* 使用[移动设备管理（MDM）][docs-mdm]方案向终端用户部署 Tailscale 客户端应用。
* 为终端用户设备启用[客户端自动更新][docs-update-auto-updates]，确保员工设备保持最新。
* 通过你的 MDM 方案，使用[系统策略][docs-mdm-keys]配置终端用户客户端应用。请查看完整的系统策略列表，确定哪些选项对你的组织重要。一些常见的系统策略包括：
  * 强制终端用户所依赖的客户端行为：
    * [`Tailnet`][docs-mdm-keys-tailnet]：设置建议或必需的 tailnet。
    * [`UseTailscaleDNSSettings`][docs-mdm-keys-use-tailscale-dns]：设置隧道连接时始终或从不应用 Tailscale DNS 配置。
    * [`UseTailscaleSubnets`][docs-mdm-keys-use-tailscale-subnets]：设置始终或从不接受 tailnet 中其他设备通告的子网。
    * [`PostureChecking`][docs-mdm-keys-posture-checking]：设置始终或从不收集设备态势数据。
  * 在客户端菜单中隐藏用不到的功能，例如：
    * [`AdminConsole`][docs-mdm-keys-hide-menu-item]：显示或隐藏 Tailscale 管理控制台菜单。
    * [`HiddenNetworkDevices`][docs-mdm-keys-hide-network-devices]：在 **Network Devices** 菜单中显示或隐藏一类或多类设备。
    * [`ManageTailnetLock`][docs-mdm-keys-tailnet-lock-settings]：显示或隐藏 **Manage Tailnet Lock** 菜单。
    * [`RunExitNode`][docs-mdm-keys-exit-node-picker]：显示或隐藏 **Run as Exit Node** 菜单。
  * 提供如何向 Tailscale 管理员或你的 IT 团队寻求支持的信息：
    * [`ManagedByCaption`][docs-mdm-keys-info-message]：指定显示在 **Managed By** 区域的说明文字。
    * [`ManagedByOrganizationName`][docs-mdm-keys-org-name]：指定管理 Tailscale 的组织名称，例如 "XYZ Corp IT"。
    * [`ManagedByURL`][docs-mdm-keys-support-url]：指定一个指向服务台网页或 Slack 频道的 URL。

### 服务器配置

* 使用[基础设施即代码][docs-infrastructure-as-code]实现服务器部署自动化，以可重复、不易受人为差错影响的方式置备设备。

## 监控

### 客户端指标

* 从子网路由器、出口节点、应用连接器和其他重要设备收集[客户端指标][docs-client-metrics]，供你的监控系统使用。

### 监控 tailnet 变更

* 配置 [webhook][docs-webhooks]，让你的中央监控与告警系统（例如监控服务或 Slack）接收重要通知。我们特别建议为以下[事件类型][docs-webhooks-events]开启通知：
  * 设备配置错误：`exitNodeIPForwardingNotEnabled`
  * 设备配置错误：`subnetIPForwardingNotEnabled`
  * tailnet 管理：`nodeNeedsApproval`
  * tailnet 管理：`userNeedsApproval`
  * tailnet 管理：`userRoleUpdated`
  * webhook 管理：`webhookUpdated`
  * webhook 管理：`webhookDeleted`

### 日志流式传输

* 配置[日志流式传输][docs-log-streaming]，将配置日志和网络流日志流式传输到你的[安全信息与事件管理（SIEM）][ln-siem]系统。
* 按照你公司的安全策略，在 SIEM 中配置日志的数据保留期。
* 在 SIEM 中配置告警，在发生值得注意的事件时通知你。我们特别建议针对与通过 Tailscale 管理控制台更改的设置相关的事件配置告警：

  ```json
  // Other fields omitted for brevity
  {
    "action": "CREATE",
    "origin": "ADMIN_CONSOLE",
    // ...
  },
  {
    "action": "UPDATE",
    "origin": "ADMIN_CONSOLE",
    // ...
  },
  {
    "action": "DELETE",
    "origin": "ADMIN_CONSOLE",
    // ...
  },
  ```

  \[缺失片段：visual\_policy\_editor.mdx]

[ar-end-user-client-configuration]: #终端用户客户端配置

[bl-blog-newsletter]: https://tailscale.com/blog#blog-newsletter

[co-changelog]: https://tailscale.com/changelog

[co-contact-support]: https://tailscale.com/contact/support

[co-security-bulletins]: https://tailscale.com/security-bulletins

[docs-access-control]: /docs/features/access-control

[docs-bug-report]: /docs/account/bug-report

[docs-client-metrics]: /docs/reference/tailscale-client-metrics

[docs-connection-types]: /docs/reference/connection-types

[docs-device-identity]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-device-posture-conditions]: /docs/features/device-posture/postures-in-access-rules

[docs-device-posture-default-source-posture]: /docs/features/device-posture/postures-in-access-rules#default-postures-and-access-rules

[docs-device-posture-edr-and-mdm-integrations]: /docs/features/device-posture/integrations

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-gitops-acls]: /docs/gitops

[docs-infrastructure-as-code]: /docs/integration-infrastructure-as-code

[docs-key-expiry-custom-auth-period]: /docs/features/access-control/key-expiry#setting-a-custom-authentication-period

[docs-log-streaming]: /docs/features/logging/log-streaming

[docs-mdm-keys-exit-node-picker]: /docs/features/tailscale-system-policies#隐藏出口节点选择器

[docs-mdm-keys-hide-menu-item]: /docs/features/tailscale-system-policies#隐藏管理控制台菜单项

[docs-mdm-keys-hide-network-devices]: /docs/features/tailscale-system-policies#隐藏网络设备

[docs-mdm-keys-info-message]: /docs/features/tailscale-system-policies#设置信息消息

[docs-mdm-keys-org-name]: /docs/features/tailscale-system-policies#设置组织名称

[docs-mdm-keys-posture-checking]: /docs/features/tailscale-system-policies#启用设备态势数据收集

[docs-mdm-keys-support-url]: /docs/features/tailscale-system-policies#设置支持-url

[docs-mdm-keys-tailnet-lock-settings]: /docs/features/tailscale-system-policies#隐藏-tailnet-lock-设置

[docs-mdm-keys-tailnet]: /docs/features/tailscale-system-policies#设置建议或强制的-tailnet

[docs-mdm-keys-use-tailscale-dns]: /docs/features/tailscale-system-policies#设置设备是否使用-tailscale-dns-设置

[docs-mdm-keys-use-tailscale-subnets]: /docs/features/tailscale-system-policies#设置设备是否接受-tailscale-子网

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm]: /docs/mdm

[docs-performance-best-practices]: /docs/reference/best-practices/performance

[docs-production-best-practices]: /docs/reference/best-practices/production

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-shared-responsibility]: /docs/concepts/shared-responsibility

[docs-tags-common-tag-names]: /docs/features/tags#标签命名的常见模式

[docs-update-auto-updates]: /docs/features/client/update#自动更新

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[docs-user-roles-owner]: /docs/reference/user-roles#owner所有者

[docs-user-roles]: /docs/reference/user-roles

[docs-webhooks-events]: /docs/features/webhooks#事件

[docs-webhooks]: /docs/features/webhooks

[ln-siem]: https://tailscale.com/learn/security-information-and-event-management

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim

[xt-newsletter]: https://info.tailscale.com/tailscale-newsletter-sign-up
