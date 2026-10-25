---
title: "Tailscale 消息"
description: "Tailscale 客户端与管理控制台消息，帮助你理解、管理和排查 tailnet 相关问题。"
---

最后验证于 Jan 30, 2026

信息性消息和错误消息可能出现在管理控制台、Tailscale 客户端 UI 以及 Tailscale 客户端命令行界面（CLI）中。理解这些不同消息类型的上下文和用途，有助于你管理和排查 tailnet 相关问题。

如果这些主题中的信息未能解决你的问题、消息仍然存在，请联系 [Tailscale 支持][co-support]。

## 管理控制台消息

* [从身份提供方获取详情时身份验证失败][docs-messages-console-auth-failed-sso]
* [共享信息加载失败][docs-messages-console-sharing-failure]
* [检测到登录名变更][docs-messages-console-login-name-change]
* [多个用户使用同一登录名][docs-messages-console-multi-user-login]
* [无身份验证服务][docs-messages-console-no-auth-service]
* [已达到使用上限][docs-messages-console-reached-use-limit]
* [你无权访问管理控制台][docs-messages-console-no-access]
* [你的账户不是管理员][docs-messages-console-account-not-admin]
* [你的组织已限制成员加入外部 tailnet][docs-messages-console-org-has-restrictions]

## 客户端消息

* [协调服务器报告问题][docs-messages-client-control-health]
* [无法应用配置][docs-messages-client-apply-disk-config]
* [Docker 有状态过滤][docs-messages-client-docker-stateful-filtering]
* [加密连接失败][docs-messages-client-tls-connection-failed]
* [无效的数据包过滤器][docs-messages-client-invalid-packet-filter]
* [Linux DNS 配置问题][docs-messages-client-resolv-conf-overwritten]
* [本地日志配置错误][docs-messages-client-local-log-config-error]
* [MagicSock 函数未运行][docs-messages-client-magicsock-receive-func-error]
* [网络断开][docs-messages-client-network-down]
* [网络映射响应超时][docs-messages-client-mapresponse-timeout]
* [没有归属中继服务器][docs-messages-client-no-derp-home]
* [状态不同步][docs-messages-client-not-in-map-poll]
* [中继服务器不可用][docs-messages-client-no-derp-connection]
* [安全更新可用][docs-messages-client-security-update-available]
* [Tailscale 被屏幕使用时间阻止][docs-messages-client-macos-screen-time-controlclient]
* [Tailscale SSH 与 SELinux][docs-messages-client-ssh-unavailable-selinux-enabled]
* [有可用更新][docs-messages-client-update-available]
* [正在使用不稳定版本][docs-messages-client-is-using-unstable-version]
* [Windows 网络配置失败][docs-messages-client-set-network-category-failed]

[co-support]: https://tailscale.com/contact/support

[docs-messages-client-apply-disk-config]: /docs/reference/messages/client/could-not-apply-config

[docs-messages-client-control-health]: /docs/reference/messages/client/coordination-server-issue

[docs-messages-client-docker-stateful-filtering]: /docs/reference/messages/client/docker-stateful-filtering

[docs-messages-client-invalid-packet-filter]: /docs/reference/messages/client/invalid-packet-filter

[docs-messages-client-is-using-unstable-version]: /docs/reference/messages/client/using-unstable-version

[docs-messages-client-local-log-config-error]: /docs/reference/messages/client/local-log-config-error

[docs-messages-client-macos-screen-time-controlclient]: /docs/reference/messages/client/screen-time-controlclient

[docs-messages-client-magicsock-receive-func-error]: /docs/reference/messages/client/magicsock-receive-func-error

[docs-messages-client-mapresponse-timeout]: /docs/reference/messages/client/network-map-response-timeout

[docs-messages-client-network-down]: /docs/reference/messages/client/network-status

[docs-messages-client-no-derp-connection]: /docs/reference/messages/client/no-derp-connection

[docs-messages-client-no-derp-home]: /docs/reference/messages/client/no-derp-home

[docs-messages-client-not-in-map-poll]: /docs/reference/messages/client/not-in-map-poll

[docs-messages-client-resolv-conf-overwritten]: /docs/reference/messages/client/resolv-conf-overwritten

[docs-messages-client-security-update-available]: /docs/reference/messages/client/security-update-available

[docs-messages-client-set-network-category-failed]: /docs/reference/messages/client/set-network-category-failed

[docs-messages-client-ssh-unavailable-selinux-enabled]: /docs/reference/messages/client/ssh-unavailable-selinux-enabled

[docs-messages-client-tls-connection-failed]: /docs/reference/messages/client/tls-connection-failed

[docs-messages-client-update-available]: /docs/reference/messages/client/update-available

[docs-messages-console-account-not-admin]: /docs/reference/messages/console/account-not-admin

[docs-messages-console-auth-failed-sso]: /docs/reference/messages/console/auth-failed-sso

[docs-messages-console-login-name-change]: /docs/reference/messages/console/login-name-change

[docs-messages-console-multi-user-login]: /docs/reference/messages/console/multi-user-login

[docs-messages-console-no-access]: /docs/reference/messages/console/no-access

[docs-messages-console-no-auth-service]: /docs/reference/messages/console/no-auth-service

[docs-messages-console-org-has-restrictions]: /docs/reference/messages/console/org-has-restrictions

[docs-messages-console-reached-use-limit]: /docs/reference/messages/console/reached-use-limit

[docs-messages-console-sharing-failure]: /docs/reference/messages/console/sharing-failure
