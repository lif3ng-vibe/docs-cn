---
title: "观察并导出 AI 用量"
description: "在 Chat 中查看你自己的 Aperture 用量，或使用管理仪表板检查并导出整个组织的活动。"
---

最后验证于 Sep 28, 2026

Aperture 会记录 LLM 请求的 token 计数、模型名称、会话和工具使用。使用 [Chat][docs-chat] 中的 **Usage** 和 **Sessions** 查看你自己的活动。管理员使用[管理仪表板][docs-admin-dashboard]审查整个组织的用量、检查日志并导出数据。

关于捕获和会话的详细信息，请参阅 [Aperture 的工作原理][docs-aperture-how-aperture-works]。

你还可以将 Aperture 与日志聚合器、授权引擎等外部服务连接。可用的集成请参阅[与外部工具集成][docs-aperture-integrate]。

## 留存

管理员控制 Aperture 保留捕获的请求体和响应体的时长。在零数据留存模式下，Aperture 绝不把这些内容写入磁盘。无论留存设置如何，Aperture 都会保留用量指标。设置方法请参阅[隐私与数据留存][docs-aperture-privacy]。

> **注意：**
>
> **连接器可观测性。**由 LLM 发起的 MCP 工具调用，会作为 LLM 请求体和响应体的一部分（`tool_use` 和 `tool_result` 内容块）出现在捕获中。用户可以在 **Sessions** 中检查自己的留存捕获。管理员可以在管理仪表板的 **Security** > **Logs** 中检查这些内容。
>
> HTTP 连接器代理请求（发往 `/v1/connectors/{id}/` 的流量）**不会**出现在捕获或用量遥测中。Aperture 不记录连接器请求、错误、延迟、token 或成本。配置 MCP 和 HTTP 连接器的更多信息请参阅[连接器][docs-aperture-connectors]。

[**Aperture Chat 界面参考**](/docs/aperture/reference/chat)——Aperture Chat 的编写器、项目、连接器、技能、个人会话、用量和配额参考。

[**Aperture 管理仪表板参考**](/docs/aperture/reference/dashboard-admin)——Aperture 管理仪表板中可用页面、控件和配置编辑器的参考。

[**将用量数据导出到 S3**](/docs/aperture/how-to/export-usage-data-to-s3)——配置 Aperture，把 LLM 用量数据导出到 Amazon S3 存储桶，用于分析、归档和长期留存。

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-how-aperture-works]: /docs/aperture/how-aperture-works

[docs-aperture-integrate]: /docs/aperture/integrate

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-chat]: /docs/aperture/reference/chat#usage

[docs-admin-dashboard]: /docs/aperture/admin-dashboard
