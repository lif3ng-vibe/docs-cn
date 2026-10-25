---
title: "Aperture 管理仪表板"
description: "使用 Aperture 管理仪表板监控组织范围的 AI 活动、调查请求、管理访问与支出，并配置你的 Aperture 网关。"
---

最后验证于 Sep 28, 2026

使用 Aperture 管理仪表板监控组织范围的 AI 活动、调查请求、管理访问与支出，并配置你的网关。

\[Missing snippet: aperture\_open\_dashboard.mdx]

## 访问管理仪表板

使用管理仪表板需要 Aperture 管理员角色。其他用户可通过 [Chat][docs-chat] 进行对话并查看自己的活动。

新建的 Aperture 网关起初会向所有人授予管理员访问权限。请在团队开始使用 Aperture 之前限制该角色。具体说明参阅[设置管理员访问权限][docs-set-up-admin-access]。

## 探索管理能力

可以使用管理仪表板：

* **监控采用情况与支出。** 按用户、模型或智能体比较用量，并查看配额余额。
* **调查请求。** 检查保留的抓包记录与工具活动，并在审计日志中查看管理事件。
* **管理访问与预算。** 配置授权（grant）、提供商、连接器与支出限额。
* **配置网关。** 常用设置使用可视化编辑器，或以 HuJSON 格式编辑完整的 [Aperture 配置][docs-aperture-configuration]。

页面控件与配置保存行为的详细信息，参阅[管理仪表板参考][docs-aperture-admin-dashboard-reference]。

## 后续步骤

* [授予模型访问权限][docs-grant-model-access]。
* [设置每用户支出限额][docs-set-per-user-spending-limits]。
* [设置团队预算][docs-set-team-budget]。
* [按标签授予连接器访问权限][docs-grant-connector-access]。
* [授予 MCP 工具访问权限][docs-grant-mcp-tool-access]。
* [按请求或响应头筛选日志][docs-filter-logs-by-header]。
* [将用量数据导出到 S3][docs-export-usage-data]。
* [配置零保留模式][docs-configure-zero-retention]。

[docs-aperture-admin-dashboard-reference]: /docs/aperture/reference/dashboard-admin

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-chat]: /docs/aperture/chat

[docs-configure-zero-retention]: /docs/aperture/how-to/configure-zero-retention

[docs-export-usage-data]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-filter-logs-by-header]: /docs/aperture/how-to/filter-logs-by-header

[docs-grant-connector-access]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-set-team-budget]: /docs/aperture/how-to/set-team-budget

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access
