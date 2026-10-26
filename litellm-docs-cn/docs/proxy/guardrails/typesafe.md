# 基于相关性的压缩（TypeSafe / Jev）

[TypeSafe](https://typesafe.ai) 的 Jev 模型会判断每一轮已完成的工具交互是否仍与当前任务相关。作为 LiteLLM 防护栏（guardrail），它会在请求到达模型之前，把 Jev 评分低于相关性阈值的工具结果置空，让失效的上下文不再消耗输入 Token。与摘要式压缩器不同，它对每轮交互的处理是全有或全无的：结果要么原样保留，要么被替换成一条移除提示。

该功能适用于 `/v1/chat/completions`、`/v1/messages`（Anthropic 格式）和 `/v1/responses`。

## 工作原理

该防护栏在 `pre_call` 步骤中以进程内方式运行，并调用 TypeSafe 的托管 API（`https://api.typesafe.ai`），因此无需额外部署任何服务。只有代理服务器会与 TypeSafe 通信。被改写的只有请求输入；响应原样透传。

压缩按每轮已完成的工具交互进行：

1. **筛选候选**。候选是一条发起了工具调用的 assistant 消息，加上应答它的 `tool`/`function` 消息，且合并后的结果文本至少达到 `min_chars_to_evaluate` 个字符。系统消息、最后一条用户消息，以及最近一轮交互（依据"最后一条 assistant"规则）永远不会被评估或改写，这与 litellm 的共享压缩保护策略一致。每个请求最多评估最近 200 轮符合条件的交互。
2. **评估**。一次 `POST {api_base}/v1/systemone` 调用会把最后一条用户消息作为 `task`、拼接后的系统文本，以及每个候选的工具调用和（截断后的）结果一并放入 `state` 发送，并为每轮交互附带一个 `noul` 是/否问题：这轮交互对完成任务还有必要吗？
3. **压缩**。`noul` 得分低于 `relevance_threshold` 的每一轮交互，其工具结果都会被替换为 `[Tool result removed by TypeSafe compaction: judged no longer relevant to the current task]`。assistant 的工具调用行保持原样，因此对话结构依然完整。如果没有内容被丢弃，请求将逐字节原样转发。

## 前提条件

一个包含 `typesafe` 防护栏的 LiteLLM 版本，以及一个来自 [typesafe.ai](https://typesafe.ai) 的 TypeSafe API 密钥。

## 快速上手

### 1. 在配置中定义防护栏

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

guardrails:
  - guardrail_name: jev-compaction
    litellm_params:
      guardrail: typesafe
      mode: pre_call
      api_key: os.environ/TYPESAFE_API_KEY
      optional_params:
        relevance_threshold: 0.2
```

使用 `mode: pre_call`，因为该防护栏只改写请求输入。`api_key` 为必填项，可以写在配置里，也可以来自 `TYPESAFE_API_KEY` 环境变量。设置 `default_on: true` 即可对每个请求执行压缩；保持关闭则压缩需要按密钥或按请求显式开启。

### 2. 启动 LiteLLM 网关

```shell
litellm --config config.yaml
```

### 3. 发送请求

```shell
curl -i http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [
      {"role": "user", "content": "Which filing discusses Q3 revenue?"},
      {"role": "assistant", "tool_calls": [{"id": "call_1", "type": "function", "function": {"name": "search_filings", "arguments": "{\"query\": \"Q1 revenue\"}"}}]},
      {"role": "tool", "tool_call_id": "call_1", "content": "<...tens of thousands of tokens of Q1 filing text...>"},
      {"role": "assistant", "tool_calls": [{"id": "call_2", "type": "function", "function": {"name": "search_filings", "arguments": "{\"query\": \"Q3 revenue\"}"}}]},
      {"role": "tool", "tool_call_id": "call_2", "content": "<...tens of thousands of tokens of Q3 filing text...>"}
    ],
    "guardrails": ["jev-compaction"]
  }'
```

与任务无关的 Q1 结果会被置空，而任务真正需要的 Q3 结果则原样通过。

## 按密钥启用压缩

未设置 `default_on` 时，压缩只对显式开启的请求生效。常见做法是把防护栏绑定到一个虚拟密钥（virtual key）上。

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
        "guardrails": ["jev-compaction"]
      }'
```

## 按请求启用压缩

客户端可以在单次调用中通过请求体里的 `guardrails` 数组开启；对于 `/v1/messages`（其请求体没有顶层 `guardrails` 字段），则使用 `litellm_metadata.guardrails`。压缩实际执行时，响应中会带有 `x-litellm-applied-guardrails: jev-compaction` 响应头。

## 失败语义

默认行为是 `fail_open`：如果 TypeSafe 服务不可达、超时（预算 30 秒），或返回异常的状态码与响应体，请求会不做压缩直接转发，并在代理日志中记录一条警告。压缩本质上是一种优化，评估服务宕机也不会阻塞流量。

设置 `unreachable_fallback: fail_closed` 可以改为让请求以 `500` 和一条通用错误信息失败；上游响应体只会留在服务器日志中，绝不会发给客户端。

## 验证 TypeSafe 是否已生效

1. 响应头 `x-litellm-applied-guardrails: jev-compaction`。
2. 花费日志条目上的 `guardrail_information` 字段：`exchanges_evaluated`、`exchanges_dropped`、`chars_removed`、`model`。
3. 管理界面（Admin UI）：在 **Logs** 中打开任意一个请求，滚动到 **Guardrails & Policy Compliance**，`jev-compaction` 会作为 `pre-call` 步骤出现在 **Request Lifecycle** 下。

## 配置参考

顶层的 `litellm_params`：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `guardrail` | str | 必须为 `typesafe`。 |
| `mode` | str | 使用 `pre_call`。该防护栏只改写请求输入；响应原样透传。 |
| `api_key` | str | TypeSafe API 密钥，以 `Authorization: Bearer` 形式发送。未设置时回退到 `TYPESAFE_API_KEY`。必填。 |
| `api_base` | str | TypeSafe API 基础 URL。未设置时先回退到 `TYPESAFE_API_BASE`，再回退到 `https://api.typesafe.ai`。 |
| `model` | str | TypeSafe 评估模型（不是 LLM 本身）。默认为 `jev-latest`。 |
| `unreachable_fallback` | str | 服务故障时，`fail_open`（默认）不做压缩直接转发；`fail_closed` 返回 500。 |
| `default_on` | bool | 对每个请求都运行，无需逐次调用开启。默认为 `false`。 |

嵌套的 `optional_params`（每个参数也接受直接写在 `litellm_params` 下；嵌套值优先）：

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `relevance_threshold` | float | `0.2` | `noul` 概率低于该值的交互会被丢弃。 |
| `min_chars_to_evaluate` | int | `200` | 合并后的工具结果文本短于该字符数的交互，既不会发给 Jev 评估，也不会被丢弃。 |
| `max_result_chars_in_state` | int | `4000` | 发送给 Jev 的 state 中，工具结果文本会被截断到该字符数。 |

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `TYPESAFE_API_KEY` | `api_key` 未设置时的回退 API 密钥。 |
| `TYPESAFE_API_BASE` | `api_base` 未设置时的回退 API 基础 URL。 |
