# 请求头

LiteLLM 支持的一系列特殊请求头。

## 请求头转发

默认情况下，LiteLLM 不会把客户端请求头转发给 LLM 提供商的 API。不过，你可以针对特定模型组（model group）选择性地开启请求头转发。[进一步了解如何配置请求头转发](./forward_client_headers.md)。

## LiteLLM 请求头

`x-litellm-timeout` Optional[float]：请求的超时时间，单位为秒。

`x-litellm-stream-timeout` Optional[float]：等待响应第一个分块的超时时间，单位为秒，仅对流式请求生效。[演示视频](https://www.loom.com/share/8da67e4845ce431a98c901d4e45db0e5)

`x-litellm-enable-message-redaction`：Optional[bool]：不把消息内容记录到日志集成，只追踪花费。[了解更多](./logging#脱敏消息与响应内容)

`x-litellm-tags`：Optional[str]：以逗号分隔的标签列表（如 `tag1,tag2,tag3`），可用于[基于标签的路由](./tag_routing)**或**[花费追踪](/docs/proxy/cost_tracking#自定义标签)。

`x-litellm-num-retries`：Optional[int]：请求的重试次数。优先级高于请求体中的 `num_retries`、部署 `litellm_params` 中的 `num_retries`，以及 `litellm_settings` 中的 `num_retries`。[了解更多](../routing#num_retries-可以在哪里设置以哪个为准)

`x-litellm-keepalive-seconds`：Optional[float]：当流式响应静默超过该秒数后，发送一个 SSE `: ping` 注释帧，以免看似空闲的连接被负载均衡器判定超时而断开。受部署的 `allow_client_keepalive_override` 设置约束；若部署未开启该选项，此请求头不生效。[了解更多](./timeout#为空闲流式连接发送保活心跳)

`x-litellm-spend-logs-metadata`：Optional[str]：JSON 字符串，包含要写入花费日志的自定义元数据。示例：`{"user_id": "12345", "project_id": "proj_abc", "request_type": "chat_completion"}`。[了解更多](./cost_tracking)

`x-litellm-customer-id`：Optional[str]：传递客户/终端用户 ID 的标准请求头。无需任何配置即会被检查。[了解更多](./customers)

`x-litellm-end-user-id`：Optional[str]：传递客户/终端用户 ID 的标准请求头。无需任何配置即会被检查。[了解更多](./customers)

`x-litellm-trace-id` Optional[str]：一个稳定的 ID，用于关联同一次对话或智能体流程（agentic flow）中的所有 LLM 调用。该值会存入 `LiteLLM_SpendLogs` 表的 `session_id` 列以及请求元数据（`trace_id` 和 `session_id`），并传播到嵌套的 MCP（Model Context Protocol）工具调用和 A2A（Agent-to-Agent）智能体调用，让内层 LLM 调用共享同一个会话 ID。在这三个请求头中，它的优先级最高。

`x-litellm-session-id` Optional[str]：行为与 `x-litellm-trace-id` 相同，仅在未提供 `x-litellm-trace-id` 时使用。两者可以互换，设置的也是同一个链路 ID。

`x-<vendor>-session-id` Optional[str]：兜底模式。当两个显式的 LiteLLM 请求头都不存在时，任何匹配 `x-<vendor>-session-id` 形态的请求头（例如 `x-claude-code-session-id`）都会被自动识别为会话 ID。其值必须形如会话 ID：由字母、数字、连字符或下划线组成，长度至少 8 个字符。

LiteLLM 按固定的优先级顺序解析会话 ID：先取 `x-litellm-trace-id`，再取 `x-litellm-session-id`，最后才是任意 `x-<vendor>-session-id` 请求头。命中即生效，解析出的值会成为链路 ID，在本次请求及其触发的所有嵌套 MCP 或 A2A 调用之间共享。

### 会话关联示例

发送两个携带相同 `x-litellm-trace-id` 值的对话补全请求，即可把它们归入同一个会话：

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "x-litellm-trace-id: my-conversation-123" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello, who won the world cup in 2022?"}]
  }'

curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "x-litellm-trace-id: my-conversation-123" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "And who was the top scorer?"}]
  }'
```

所有共享该值的请求，既可以通过按会话 ID 查询花费日志找到，也可以在管理界面（Admin UI）的日志页中按会话分组查看。

## Anthropic 请求头

`anthropic-version` Optional[str]：要使用的 Anthropic API 版本。  
`anthropic-beta` Optional[str]：要使用的 Anthropic API 测试版标识。
    - 对于 `/v1/messages` 端点，该请求头始终会转发给底层模型。
    - 对于 `/chat/completions` 端点，仅当模型已配置进 `forward_client_headers_to_llm_api` 时才会转发。[了解更多](./forward_client_headers.md)

## OpenAI 请求头

`openai-organization` Optional[str]：调用 OpenAI API 时使用的组织。（目前需要通过 `general_settings::forward_openai_org_id: true` 开启）

## 自定义请求头

以 `x-` 开头的自定义请求头，在模型已配置进 `forward_client_headers_to_llm_api` 时，可以转发给 LLM 提供商的 API。[进一步了解请求头转发的配置](./forward_client_headers.md)。
