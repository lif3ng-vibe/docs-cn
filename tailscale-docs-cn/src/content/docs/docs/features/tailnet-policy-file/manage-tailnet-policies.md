---
title: "编辑 tailnet 策略文件中的访问控制策略"
description: "你可以通过管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面、[Tailscale 的 GitOps][docs-gitops-acls] 或 [Tailscale API][docs-api]，编辑 [tailnet 策略文件][docs-tailnet-policy-file]中的[访问控制策略][docs-acls]。"
---

最后验证于 Mar 13, 2026

你可以通过管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面、[Tailscale 的 GitOps][docs-gitops-acls] 或 [Tailscale API][docs-api]，编辑 [tailnet 策略文件][docs-tailnet-policy-file]中的[访问控制策略][docs-acls]。请参阅[tailnet 策略语法][docs-policy-syntax]。

你必须具有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 身份才能编辑 tailnet 策略文件。

## 将 ACL 转换为授权

JSON 编辑器中有一个 **Convert to grants**（转换为授权）按钮，可自动将 tailnet 策略文件中整个 `acls` 分区转换为等效的[授权][docs-grants]。该按钮始终可见，但在没有 `acls` 分区时处于禁用状态。更多信息请参阅[从 ACL 迁移到授权][docs-migrate-acls-grants]。

## 预览更改

在编辑 tailnet 策略文件中的访问控制策略时，你可以预览用户权限。

1. 前往管理控制台的 [Access controls](https://console.tailscale.com/admin/acls) 页面。
2. 打开 **Preview rules**（预览规则）标签页。
3. 选择一个用户，查看该用户可访问的目标列表（每行一个）。

该列表还会显示定义该规则的行号，以及（因该规则而）可以访问该目标的其他用户或组。

你还可以定义[访问控制策略测试][docs-policy-syntax-tests]，确保更改不会意外移除对重要系统的访问，或无意间允许访问某些资源。

## 调试访问控制策略

你可以使用 [`tailscale ping` 命令][docs-tailscale-cli-ping]，通过测试设备之间的连接来调试访问控制策略。`tailscale ping` 支持 TSMP ping 和 ICMP ping。

TSMP ping 用于检查两台设备能否建立网络连接，但会在访问控制策略检查之前停止。使用 `tailscale ping --tsmp` 发送 TSMP ping。

```shell
tailscale ping --tsmp
```

ICMP ping 用于检查设备之间的端到端连通性，包括访问控制策略。使用 `tailscale ping --icmp` 或普通 `ping` 发送 ICMP ping。

```shell
tailscale ping
```

如果 TSMP ping 成功而 ICMP ping 失败，说明设备之间的连接很可能被访问控制策略阻止。如果 TSMP ping 失败，说明设备无法建立网络连接，即使访问控制策略可能允许连接。如果 TSMP 和 ICMP ping 都成功但连接仍然失败，请检查访问控制策略中的端口号以及你尝试连接的服务。

除了手动测试之外，你还可以创建内置的访问控制策略[测试][docs-policy-syntax-tests]，确保特定连接始终被允许，并防止访问控制策略的更改意外破坏这些连接。

## 撤销更改

你可以在管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面，将 [tailnet 策略文件][docs-tailnet-policy-file]恢复到以前的日期和时间。操作说明请参阅[从审计日志恢复访问控制策略][docs-audit-logging-revert-acls]。

> **注意：**
>
> 如果你正在使用 [Tailscale 的 GitOps][docs-gitops-acls]，则无法撤销 tailnet 策略文件。

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-acls]: /docs/features/access-control/acls

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-api]: /docs/reference/tailscale-api

[docs-audit-logging-revert-acls]: /docs/features/logging/audit-logging#reverting-access-control-policies-from-audit-logs

[docs-gitops-acls]: /docs/gitops

[docs-tailscale-cli-ping]: /docs/reference/tailscale-cli#ping

[docs-grants]: /docs/features/access-control/grants

[docs-migrate-acls-grants]: /docs/reference/migrate-acls-grants

[docs-tailnet-policy-file]: /docs/reference/glossary#tailnet-policy-file
