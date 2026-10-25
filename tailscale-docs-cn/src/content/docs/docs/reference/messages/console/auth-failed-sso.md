---
title: "从身份提供方获取详情时身份验证失败"
description: "本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Aug 1, 2025

本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 管理控制台中显示的消息

**HTTP status:** `Error 403`

Authentication failed while retrieving details from your SSO provider

## 为什么会看到这条消息

当用户尝试使用由第三方身份提供方（IdP）支持的账户登录 Tailscale，但 Tailscale 无法连接到该 IdP 的身份验证服务时，就会出现这条错误消息。常见的 IdP 包括 Apple、Authelia、GitLab、JumpCloud、Keycloak 和 Okta。

可能显示这条消息的原因有：

* IdP 自身出现问题，例如停机、故障或配置问题导致身份验证无法完成。
* Tailscale 与 IdP 之间的重定向或集成存在问题。
* 身份验证设置发生了临时故障或近期变更，尚未正确生效。

## 处理方法

你可以尝试以下方法来解决此问题：

* 确认你的 IdP 服务在线且配置正确，包括检查近期的身份验证设置变更是否已保存并生效。
* 检查你的服务器或 Web 应用防火墙（WAF）日志，确保 Tailscale 的 IP 地址未被拦截。IPv4 地址段为 `192.200.0.0/24`，IPv6 地址段为 `2606:B740:49::/48`。
* 如果你使用的是自定义 IdP，请确保重定向 URL 和凭证正确无误。

## 更多信息

* 有关将 Tailscale 与 IdP 配合使用的更多信息，请参阅 [支持的 SSO 身份提供方][docs-sso-providers]。
* 有关将 Tailscale 与防火墙配合使用的信息，请参阅 [使用 Tailscale 需要开放哪些防火墙端口？][docs-firewall-ports]。

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-messages]: /docs/reference/messages

[docs-sso-providers]: /docs/integrations/identity
