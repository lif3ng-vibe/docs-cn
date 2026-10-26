---
title: "API 参考"
description: "接入并读取 Agent 追踪记录，发起调查，并获取 Lens 的发现结果。"
slug: "/proxy/lens/api"
---

# API 参考

## Agent 追踪 API

上传数据通过专用追踪密钥（tracing key）发送到 Lens，置于 `Authorization: Bearer <tracing-key>` 请求头中。作为代理管理员，你可以通过 LiteLLM 的 `POST /lens/tracing/keys` 生成密钥，也可以使用 **Lens > Traces > Set up tracing**。`GET /lens/service` 返回公开的接入（ingestion）基础 URL 与连接状态。读取追踪记录则使用你的 LiteLLM URL 和常规代理认证。

### 上传到 Lens

使用 Lens 的基础 URL，若其中带有 `/lens-ingest` 则予以保留，后接下方路径。仪表板中的 **Traces endpoint** 已包含 `/v1/traces`。

| 端点 | 用途 |
| --- | --- |
| `POST /v1/traces` | 以 protobuf（`application/x-protobuf`）或 JSON（`application/json`）格式接入 OTLP/HTTP 追踪记录。通过 `Content-Encoding: gzip` 支持 gzip 压缩。 |
| `POST /v1/logs` | 接入 OTLP/HTTP 日志，包括编程 Agent（coding agent）的会话事件 |
| `POST /v1/traces/receipt` | 检查使用同一追踪密钥上传的某个 `trace_id` 及最多 1,000 个 `span_ids` 是否已送达。返回 `received`；不会返回追踪记录内容 |

### 通过 LiteLLM 读取

使用你的 LiteLLM 基础 URL，以及一个关联了可读取追踪记录的用户的代理密钥。

| 端点 | 用途 |
| --- | --- |
| `GET /v1/traces` | 列出追踪记录摘要。可选参数 `start_ms` 和 `end_ms` 为 Unix 毫秒时间戳，默认时间窗口为最近 24 小时。 |
| `GET /v1/traces/{trace_id}` | 读取追踪记录的 `summary`、`agents` 和 `spans`。可接受可选的 `trace_ref`。 |
| `GET /v1/traces/{trace_id}/spans/{span_id}` | 读取某个 span 的 `input`、`output` 和 `attributes`。可接受可选的 `trace_ref`。 |

当运行设置了 [`agent.source.url`](./first-trace.md#link-a-run-to-its-source) 时，追踪记录的 `summary.source` 会包含 `type`、`url` 和 `title`，否则不含该字段。

列表响应包含 `data` 和 `next_cursor`，默认每页 50 条摘要。把 `next_cursor` 作为 `cursor` 传回即可读取下一页。读取追踪记录或其 span 时，请使用摘要中的 `trace_ref`。

```bash
curl -H "Authorization: Bearer <key>" \
  "https://<your-litellm-proxy>/v1/traces"
```

代理管理员和代理管理员查看者（viewer）可以读取所有追踪记录。追踪密钥仅允许接入数据并查询自身的送达回执，不能读取追踪记录或调用模型。普通模型密钥无权接入数据。网关上传路由会返回 410，导出器（exporter）URL 必须直接指向 Lens。其他所有用户（包括通过 SCIM 创建的用户）可以读取自己拥有的追踪记录，以及各团队共享给自己的追踪记录，详见[谁可以看到哪些追踪记录](#trace-access)。不属于任何用户的密钥（例如团队服务账号密钥）无法读取追踪记录，会收到 403。

上传成功即表示 ClickHouse 已接收该数据。429 或 503 属于可重试错误，请为导出器配置有上限的重试。长时间故障期间，导出器可能会丢弃追踪记录。密钥在每个 Lens 副本上每 30 秒刷新一次，凭据快照最长有效 90 秒。

### 谁可以看到哪些追踪记录 {#trace-access}

团队通过 `/spend/logs` 成员权限向成员共享其追踪记录。团队管理员始终能看到团队的追踪记录；普通成员只要所在团队的 `team_member_permissions` 包含 `/spend/logs`，也能看到。可以在 Admin UI（Teams 页面，打开团队，Member Permissions 标签页）中授予该权限，也可以通过 API 授予：

```bash
curl -X POST "https://<your-litellm-proxy>/team/permissions_update" \
  -H "Authorization: Bearer <admin-key>" \
  -H "Content-Type: application/json" \
  -d '{"team_id": "<team-id>", "team_member_permissions": ["/spend/logs"]}'
```

若要一次性授予所有现有团队：

```bash
curl -X POST "https://<your-litellm-proxy>/team/permissions_bulk_update" \
  -H "Authorization: Bearer <admin-key>" \
  -H "Content-Type: application/json" \
  -d '{"permissions": ["/spend/logs"], "apply_to_all_teams": true}'
```

要让每个新建团队都共享其追踪记录，包括 [SCIM](../identity_provisioning.md) 依据身份提供商中的组创建的团队，请在 [`default_team_params`](../self_serve.md#为新团队设置默认参数) 中设置该权限。此后，身份提供商中的组成员关系将决定谁能看到哪些追踪记录，无需逐团队操作：

```yaml
litellm_settings:
  default_team_params:
    team_member_permissions: ["/spend/logs"]
```

此后 SCIM 对组的更新会保留团队已有的权限。同一权限也允许成员查看团队的花费日志（spend logs）。`/lens` 下的调查与发现仍然仅限代理管理员使用。

## Lens API {#use-the-api}

在你的 LiteLLM 代理上发起调查并读取发现结果。请在 `Authorization: Bearer <key>` 请求头中传入代理管理员密钥。

| 端点 | 用途 |
| --- | --- |
| `GET /lens` | 列出 `lenses` 下的调查，以及 `workers` 和 `tracing_enabled`。 |
| `POST /lens` | 创建一项调查并将其首次运行加入队列。发送 `name`、`model`，以及 `context` 或 `checks`；返回调查的 `id` 和 `jobs`。 |
| `GET /lens/{id}` | 读取已保存的 `settings`、最近的 `jobs` 和 `findings`。每个 job 包含 `status`、`stage`、`coverage` 和 `cost`。 |
| `POST /lens/{id}/runs` | 将另一次运行加入队列。发送 `{}` 可复用已保存的设置，或发送 `settings` 对象进行一次性覆盖。 |

```bash
curl -H "Authorization: Bearer <key>" \
  "https://<your-litellm-proxy>/lens"
```

只读代理管理员可以预览活动，并读取调查、发现结果与历史记录。团队与普通虚拟密钥（virtual key）无法使用此 API。
