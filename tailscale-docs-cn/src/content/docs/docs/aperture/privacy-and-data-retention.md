---
title: "隐私与数据留存"
description: "控制 Aperture 保留捕获数据的时长、数据的导出位置，以及请求内容离开 Aperture 的去向。"
---

最后验证于 Oct 1, 2026

\[缺失片段：aperture\_terms.mdx]

Aperture 会捕获 LLM 请求的请求体、响应体、header 和工具使用数据，以及 token 计数、模型和估算成本等用量指标。本主题介绍对已存储代理捕获的控制措施，以及可能接收请求内容的目的地。捕获留存会保留请求和会话元数据以及用量指标供报告使用。它不会删除 Aperture Chat 对话——这些内容由 Aperture 单独存储。在零留存模式下，大多数已配置的 hook 仍可接收内容。如果你同时排除了工具数据，Aperture 会跳过工具提取，因此由工具调用触发的 hook 不会触发。

## 控制留存

配置 Aperture 在删除之前保留捕获的请求和响应内容的时长。你也可以启用零留存（`duration: "0"`、`require_export: false`），让 Aperture 不存储捕获的内容体和 header。除非你把 `"tools"` 加入 `purge`，否则 Aperture 仍会保留捕获的工具数据。对比[留存姿态选项][docs-retention-postures]，在定时删除、从不存储捕获内容、本地删除前先归档之间做出选择。留存字段请参阅 [`database` 配置参考][docs-retention]。

### 预览留存变更

在管理的 **Data Export** 设置页面上，预览会显示在提议的策略下 Aperture 将删除多少个捕获负载。管理员可以使用[影响端点][docs-zero-retention-impact]查看受影响最早捕获的时间戳。仪表板不显示该时间戳。查看预览不会保存你的更改，也不会暂停已保存策略下的后台删除。策略生效后，Aperture 会移除捕获的请求体、响应体和 header；如果你选择了工具使用数据，也会一并移除。捕获元数据记录、会话摘要和用量指标会被保留。

**Delete after** 控件的最小值为 1 小时。更短的值会让预览留空。要在没有留存窗口的情况下移除内容，请改选 **Zero retention**。Aperture 会把超过 Tailscale 为你的网关所允许上限的时长封顶，因此预览反映的窗口可能比你输入的更短。

保存之前，对于符合以下任一情况的提议策略，仪表板会要求你确认：

* 标记为移除的捕获数量多于已保存的策略。
* 切换到零留存。
* 开始移除工具使用数据。
* 在已配置 S3 导出时不再强制要求 S3 导出。

确认之前请核对受影响的数量。要查看受影响的最早时间戳，请使用影响端点。

### 了解捕获脱敏

默认情况下，在解析后的请求和响应捕获中，Aperture 会用占位符替换提供商加密的思维块（thinking block）签名、网页搜索加密内容、引用索引和加密响应条目。将 `database.keep_encrypted_blobs` 设置为 `true`，可以在留存策略移除其捕获内容之前，把这些字段保留在捕获中。占位符替换不适用于保留的原始 HTTP 内容体。当 `database.save_raws` 启用或响应 JSON 解析失败时，这些内容体可能包含原始加密值。占位符替换也不会清除提示文本或个人身份信息（PII）。在零留存模式下，无论这些设置如何，Aperture 都不会存储捕获的内容体。

在存储捕获的请求和响应 header 之前，Aperture 会对 `Authorization`、`X-Api-Key`、`X-Goog-Api-Key` 和 `Cf-Aig-Authorization` 进行脱敏。对于提供商或授权的 `add_headers` 中配置的 header 名称，它同样会脱敏。header 名称匹配不区分大小写。Aperture 会保留每个 header 名称。它会把以 `Bearer` 加空格开头的值改为 `Bearer (redacted)`，把其他被脱敏的值改为 `(redacted)`。没有值的 header 不会出现在存储的映射中。

捕获的请求 header 反映的是 Aperture 添加网关配置 header 之后的出站流量。其他 header——包括 `Cookie`、`Set-Cookie`、`User-Agent`，以及未被配置为敏感项的客户端自定义 header——会以明文形式保留在本地捕获中，直到 Aperture 将其移除。它们也会保留在此前导出的 S3 对象中，直到你另行删除那些对象。请把捕获和导出数据当作敏感数据处理。原始内容体的控制请参阅 [`database` 配置参考][docs-retention]。

[**配置零留存模式**](/docs/aperture/how-to/configure-zero-retention)——配置 Aperture 不在磁盘上存储捕获的提示和响应内容，并了解该设置不覆盖哪些 Chat 和 hook 数据。

## 导出并归档用量数据

把捕获的用量数据导出到兼容 S3 的存储进行长期归档。你可以要求先成功导出，之后 Aperture 才移除本地捕获内容。在某个捕获成功导出之前，Aperture 会保留它，即使已超过其留存窗口。导出成功让 Aperture 以后可以移除本地内容，但不保证立即移除。之后的导出会排除 Aperture 已移除的捕获内容，包括 header。移除本地内容不会删除先前导出到 S3 的对象。Aperture 会保留请求元数据、指标和会话摘要。

[**将用量数据导出到 S3**](/docs/aperture/how-to/export-usage-data-to-s3)——配置 Aperture，把 LLM 用量数据导出到 Amazon S3 存储桶，用于分析、归档和长期留存。

[**观察并导出 AI 用量**](/docs/aperture/observe-and-export)——在 Chat 中查看你自己的 Aperture 用量，或使用管理仪表板检查并导出整个组织的活动。

## 请求内容的去向

Aperture 转发给模型的请求会发送到已配置的提供商。你的配置可以添加以下目的地：

* [护栏（guardrails）][docs-guardrails]在模型提供商之前接收选定的请求字段。它们可以检查、修改或拦截请求。
* [连接器][docs-connectors]代理对已配置 MCP 服务器和 HTTP API 的调用。
* [集成 hook][docs-integrate]把选定字段发送到已配置的 webhook 端点。

启用每个端点之前，请确认其托管位置。

零捕获留存并不会阻止大多数 hook 发送内容。请求前护栏可以在不脱敏的情况下收到提示。响应后的 `entire_request` hook 在匹配授权允许 `request_body`、`response_body`、`user_message` 或 `raw_responses` 等字段时，可以收到提示或补全内容。在零留存（`duration: "0"`、`require_export: false`）且 `purge: ["captures", "tools"]` 的情况下，Aperture 会跳过工具提取，因此 `tool_call_entire_request` hook 不会触发。要防止内容通过会触发的 hook 泄出，请停用该 hook，或在每个匹配授权中把 `send_hooks` 的 `send` 限制为元数据。Aperture 会从 webhook JSON 中省略被排除的字段，而不是发送空值。

[docs-connectors]: /docs/aperture/connectors

[docs-guardrails]: /docs/aperture/guardrails

[docs-integrate]: /docs/aperture/integrate

[docs-retention-postures]: /docs/aperture/how-to/configure-zero-retention#step-1-choose-a-retention-posture

[docs-retention]: /docs/aperture/configuration#database

[docs-zero-retention-impact]: /docs/aperture/how-to/configure-zero-retention#step-4-preview-the-impact-before-saving
