---
title: "配置零保留模式"
description: "默认情况下，Aperture 会捕获请求体和响应体，以便你在仪表盘中浏览。本主题使用[保留设置][docs-aperture-retention]来阻止 Aperture 存储代理"
---

最后验证于 Oct 1, 2026

\[Missing snippet: aperture\_terms.mdx]

默认情况下，Aperture 会捕获请求体和响应体，以便你在仪表盘中浏览。本主题使用[保留设置][docs-aperture-retention]来阻止 Aperture 存储代理捕获内容。你无需修改代码。该设置不会删除 Aperture Chat 的历史记录，也不会阻止大多数已配置的钩子发送内容。如果你同时排除工具数据，由工具调用触发的钩子就不会触发。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个至少配置了一个提供商的 [Aperture 网关][docs-aperture-get-started]。
* 对 [Aperture 配置][docs-aperture-configuration]的管理员访问权限，包括 `/admin/settings/database` 的 **Data Export** 设置页面，或 `/admin/settings/config` 的原始配置编辑器。

配置使用 HuJSON 编写，它是允许注释和尾随逗号的 JSON。标准 JSON 是合法的 HuJSON。

## 保留机制的工作原理

Aperture 会在配置的保留窗口之后移除捕获的内容。在顶层的 [`database.retention`][docs-aperture-retention] 块中设置以下字段：

* `duration` 设置保留窗口。特殊值 `"0"` 表示启用零数据保留。非零值最小为一小时，最大为 3650 天（10 年）。
* `purge` 列出 Aperture 移除哪些类别的捕获数据。该配置字段的名称是 `purge`，但移除捕获内容并不会删除请求元数据或使用指标。
* `require_export` 可选择要求在 Aperture 移除本地捕获内容之前，必须先成功导出到 S3。

这些设置适用于存储的代理捕获。*捕获内容*包括请求体、响应体、头部和原始 HTTP 字节。*工具数据*包括工具名称、参数和调用次数。Aperture 会保留请求与会话元数据以及使用指标（身份、模型、token 数和估算成本）。捕获保留不会删除 Aperture Chat 的会话历史。护栏和 `entire_request` 钩子仍能收到其授权允许的载荷字段。如果零保留同时排除工具数据，Aperture 会跳过工具提取，因此 `tool_call_entire_request` 钩子不会触发。

在 `duration: "0"`、`require_export: false` 下，无论 `purge` 列表如何，Aperture 都不存储捕获的请求体、响应体、头部或原始 HTTP 字节。这在 `database.save_raws` 启用或提供商响应 JSON 解析失败时同样适用。在 `purge` 中加入 `"tools"` 可一并省略捕获的工具数据，其中可能包含敏感参数。

在 `require_export: true` 下，Aperture 会保留捕获内容，直到成功导出到 S3。导出成功后 Aperture 稍后可以移除本地内容，但并不保证立即删除。导出的副本仍保留在 S3 中。

## 第 1 步：选择保留策略

三个字段组合出不同的行为。请选择符合你需求的一行：

| 目标                                 | `duration` | `purge`                 | `require_export` |
| ------------------------------------ | ---------- | ----------------------- | ---------------- |
| 仅做存储管理                         | `"30d"`    | `["captures"]`          | `false`          |
| 严格存储管理                         | `"30d"`    | `["captures", "tools"]` | `false`          |
| 不在磁盘上存储捕获内容               | `"0"`      | `["captures", "tools"]` | `false`          |
| 归档到 S3 后在本地清除               | `"0"`      | `["captures"]`          | `true`           |
| 保留 90 天调试窗口并归档             | `"90d"`    | `["captures"]`          | `true`           |

要采用最严格的捕获策略，选择**不在磁盘上存储捕获内容**。在 `duration: "0"`、`purge: ["captures", "tools"]`、`require_export: false` 下，Aperture 会在写入捕获记录之前清除捕获的请求体、响应体、头部、原始 HTTP 字节和工具参数，但保留请求与会话元数据。该设置不会删除 Chat 历史，也不会阻止已配置的请求前护栏和 `entire_request` 钩子接收内容。由工具调用触发的钩子不会触发，因为 Aperture 跳过了工具提取。

如果你需要一个网关之外的副本用于长期归档，选择**归档到 S3 后在本地清除**。请确认已配置 [S3 导出][docs-aperture-export-s3]。导出成功后 Aperture 稍后可以移除本地捕获内容，但并不保证立即删除。

## 第 2 步：备份当前配置

\[Missing snippet: aperture\_admin\_nav.mdx] 在做任何修改之前，先把当前配置复制到本地文件，以便在需要时回退。

`/admin/settings/database` 的 **Data Export** 设置页面可以设置保留时长、要移除的数据类别以及是否要求导出，还会实时预览某个时长会影响多少条已存储的捕获。你也可以在 `/admin/settings/config` 的配置编辑器中直接编辑 `database` 块。本主题给出两种方法各自要用的值。

## 第 3 步：设置"不存储"配置

设置 `database` 块，使其 `retention` 与你选择的策略一致。对于"不存储捕获内容"策略，使用以下配置：

```json
"database": {
  "retention": {
    "duration": "0",
    "purge": ["captures", "tools"],
    "require_export": false
  }
}
```

如果你选择**归档到 S3 后在本地清除**，请将 `duration` 设为 `"0"`，`purge` 保持为 `["captures"]`，并将 `require_export` 设为 `true`。配置 [S3 导出][docs-aperture-export-s3]并确认导出成功。在 `require_export: true` 下，Aperture 会保留本地捕获内容直到导出成功。导出不保证立即移除，且导出的副本仍保留在 S3 中。

## 第 4 步：保存前预览影响

把 `duration` 设为 `"0"` 会使已存在的捕获内容在新策略下符合移除条件。Aperture 保留请求元数据和使用指标。保存前请先评估影响。

在 **Data Export** 设置页面，保留部分会实时预览新时长会影响多少条捕获。查看预览不会保存策略，也不会暂停已保存策略的移除操作。**Delete after** 最小值为 1 小时；要设置 `"0"`，请选择 **Zero retention**。如果时长超过 Tailscale 设定的上限，Aperture 会将其封顶，因此预览可能显示比你输入的更短的窗口。仪表盘会要求你确认破坏性变更。哪些变更需要确认，请参阅[隐私与数据保留][docs-aperture-privacy]。

管理员还可以通过预览使用的端点获取受影响数量以及最早一条受影响捕获的时间戳：

```shell
curl "https://<aperture-hostname>/api/retention/impact?duration=0"
```

响应包含 `affected_count`，以及在可用时的 `oldest_capture`。该端点需要管理员访问权限和一个 `duration` 查询参数。如果请求的时长超过了 Tailscale 为你的托管 Aperture 服务配置的保留上限，预览会使用该上限，以与实际生效的保留策略保持一致。

## 第 5 步：保存并验证

保存后，新策略适用于后续请求。已在进行中的请求可能仍使用旧策略。Aperture 会在之后按新策略移除先前存储的捕获。仅靠零保留不会把内容从钩子载荷中移除，因此在发送测试请求前请先检查钩子。

保存并验证策略的步骤：

1. 检查每条可能匹配测试请求的授权中的 `send_hooks` `send` 数组。匹配的授权会为每个钩子合并允许的字段，因此只改一条授权是不够的。
2. 如果你的策略禁止内容经钩子外发，请从每个匹配的钩子绑定中移除 `request_body`、`response_body`、`user_message` 和 `raw_responses`。也可以在每个匹配的授权中设置 `send: []`，或在顶层钩子上设置 `disabled: true`。
3. 保存钩子改动。
4. 保存保留配置。如果使用原始编辑器，保存应当成功且没有校验错误。常见的出错原因是 `database` 块中缺少逗号。
5. 通过网关发送一条只包含非敏感测试内容的请求。
6. 在管理仪表盘 `/admin/logs` 的 [**Logs** 页面][docs-aperture-dashboard-admin-logs]中找到该请求并打开其捕获记录。

根据你保存的策略检查结果：

* **不在磁盘上存储捕获内容**（`duration: "0"`、`require_export: false`）：新请求仍会显示使用指标，例如模型、token 数，以及可用时的估算成本。其捕获记录显示的是保留提示，而不是请求体、响应体和头部。该检查不验证 Chat 历史或钩子投递。
* **归档到 S3 后在本地清除**（`duration: "0"`、`require_export: true`）：在导出和随后的清除完成之前，新请求的捕获记录可能仍显示请求体和头部。[确认预期记录已导出][docs-aperture-export-s3-verification]后，回到同一条捕获记录。如果请求体和头部的位置出现了保留提示，说明 Aperture 已在本地清除该捕获。仅存在一个 S3 对象并不能证明它包含该请求，也不能证明 Aperture 已移除本地内容。在提示出现之前，本地清除尚未得到验证。由于该策略使用 `purge: ["captures"]`，清除后 Aperture 仍保留工具数据。

没有工具调用的请求无法测试"不存储"策略对工具数据的处理。如果你的模型和客户端支持工具调用，请另发一条带有合成、非敏感工具参数的测试请求，并确认其捕获记录不包含工具名称或参数。它们缺失与捕获策略一致，但仪表盘无法显示是否有钩子或其他数据存储收到了它们。此测试前同样要检查匹配的钩子。

## 故障排除

当你更改保留设置后，请求内容或工具参数仍然可见时，使用以下检查。

### 管理仪表盘中内容仍然可见

首先确认配置已保存。重新打开 `/admin/settings/config` 的配置编辑器或 `/admin/settings/database` 的 **Data Export** 设置页面，检查 `retention.duration` 是否为 `"0"`，以及 `purge` 是否列出了你想要的类别。

Aperture 不会在你保存后立即移除先前存储的捕获内容。影响预览会显示新策略将移除哪些内容。保存之后的新请求，在 `duration: "0"`、`require_export: false` 下不会存储任何捕获的正文内容。验证策略时请使用新请求，而不是旧请求。

Aperture 将建立了索引的头部值单独存储，清除捕获记录不会移除它们。零保留模式会停止新的头部索引写入，但不会移除已建立索引的值。

### 请求体已消失但工具参数仍然出现

确认你查看的是保存"不存储"设置之后发出的请求。若只设置 `purge: ["captures"]`，Aperture 会把工具名称、参数和次数作为单独类别保留。如果你的策略要求移除它们，请在 `purge` 中加入 `"tools"`。对已归档的请求，请等待其本地清除完成后再检查工具数据。归档到 S3 的示例不会清除工具数据。

### 归档到 S3 模式下捕获内容仍然存在

当 `require_export` 为 `true` 时，Aperture 只有在成功把捕获导出到 S3 之后才会移除本地捕获内容。如果导出失败或未配置 S3，Aperture 会让捕获内容保留超过保留窗口，而不是删除从未归档过的数据。请检查 [S3 导出][docs-aperture-export-s3]已配置且在成功运行。

## 安全注意事项

在 `duration: "0"`、`purge: ["captures", "tools"]`、`require_export: false` 下，Aperture 会在把捕获记录写入磁盘之前清除捕获的提示词、响应体、头部、原始 HTTP 字节和工具参数。这减少了静态存储的捕获内容，但不意味着网关的其他数据存储都不含内容。

零捕获保留有以下边界：

* 请求与会话元数据以及使用指标（身份、模型、token 数和估算成本）仍然可用。零保留不是"无日志"设置。除非你在 `purge` 中加入 `"tools"`，否则 Aperture 还会保留捕获的工具参数和其他工具数据。
* Aperture Chat 的会话消息保存在独立的存储中。代理捕获保留不会删除 Chat 历史。
* 零保留不会阻止大多数钩子发送内容。请求前护栏可以在不脱敏的情况下收到提示词，响应后的 `entire_request` 钩子可以收到提示词或补全内容。在 `duration: "0"`、`require_export: false`、`purge: ["captures", "tools"]` 下，Aperture 跳过工具提取，因此 `tool_call_entire_request` 钩子不会触发。对仍然触发的钩子，检查每条匹配授权中的 `send_hooks` `send`。`request_body`、`response_body`、`user_message`、`raw_responses` 等字段可能携带内容。匹配的授权会为每个钩子合并允许的字段。当内容不得外发时，把所有匹配的绑定限制为元数据，或在每个绑定中设置 `send: []`，或在顶层钩子上设置 `disabled: true`。Aperture 会从 webhook JSON 中省略被排除的字段，而不是发送空值。
* Aperture 不会改变上游提供商处理你内容的方式。tailnet 连接使用 Tailscale 加密，Aperture 通过 TLS 访问上游提供商。请分别审查每个提供商的数据处理方式。

归档到 S3 的选项会在 Aperture 本地移除内容后，把捕获内容的副本保留在外部存储桶中。移除本地内容不会删除 S3 对象。请对该存储桶施加同等的访问控制和加密要求。

## 后续步骤

* 阅读[隐私与数据保留][docs-aperture-privacy]，了解 Aperture 如何存储、保留和导出捕获数据。
* 完整字段参考请参阅 [`database` 配置参考][docs-aperture-retention]。
* [将使用数据导出到 S3][docs-aperture-export-s3]，保留一个持久的、网关之外的归档。

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-dashboard-admin-logs]: /docs/aperture/reference/dashboard-admin#日志logs

[docs-aperture-export-s3-verification]: /docs/aperture/how-to/export-usage-data-to-s3#验证导出

[docs-aperture-export-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-aperture-retention]: /docs/aperture/configuration#database
