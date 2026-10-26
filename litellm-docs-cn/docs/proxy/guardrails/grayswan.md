import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gray Swan Cygnal 防护栏

使用 [Gray Swan Cygnal](https://docs.grayswan.ai/cygnal/monitor-requests) 持续监控对话中的策略违规、间接提示注入（IPI）、越狱尝试及其他安全风险。

Cygnal 会返回一个介于 `0` 到 `1` 之间的 `violation` 分数（分数越高，违反策略的可能性越大），并附带违规规则索引、变异检测和 IPI 标记等元数据。LiteLLM 可以根据这一信号自动拦截或监控请求。

---

## 快速上手

### 1. 获取凭证

1. 登录 Gray Swan 平台，生成一个 Cygnal API 密钥。

    老客户应该已经可以访问我们的[平台](https://platform.grayswan.ai)。

    新用户请在这个[页面](https://hubs.ly/Q03-sX1J0)注册，我们非常乐意为你提供上手指导！


2. 为 LiteLLM 代理主机配置环境变量：

    ```bash
    export GRAYSWAN_API_KEY="your-grayswan-key"
    export GRAYSWAN_API_BASE="https://api.grayswan.ai"
    ```

### 2. 配置 `config.yaml`

添加一个引用 Gray Swan 集成的防护栏条目。以下是我们推荐的配置。

```yaml
model_list:                                 # this part is a standard litellm configuration for reference
  - model_name: openai/{{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "cygnal-monitor"
    litellm_params:
      guardrail: grayswan
      mode: [pre_call, post_call]            # monitor both input and output
      api_key: os.environ/GRAYSWAN_API_KEY
      api_base: os.environ/GRAYSWAN_API_BASE  # optional
      optional_params:
        on_flagged_action: passthrough         # or "block" or "monitor"
        violation_threshold: 0.5               # score >= threshold is flagged
        reasoning_mode: hybrid                 # off | hybrid | thinking
        policy_id: "your-cygnal-policy-id"     # Optional: Your Cygnal policy ID. Defaults to a content safety policy if empty.
      streaming_end_of_stream_only: true       # For streaming API, only send the assembled message to Cygnal (post_call only). Defaults to false.
      default_on: true
      guardrail_timeout: 30                   # Defaults to 30 seconds. Change accordingly.
      fail_open: true                         # Defaults to true; set to false to propagate guardrail errors.

general_settings:
  master_key: "your-litellm-master-key"

litellm_settings:
  set_verbose: true
```

### 3. 启动代理

```bash
litellm --config config.yaml --port 4000
```

---

## 选择防护栏模式

Gray Swan 可以在 `pre_call`、`during_call` 和 `post_call` 阶段运行。请根据延迟和覆盖范围的需求组合这些模式。

| 模式         | 运行时机      | 保护范围              | 典型用例 |
|--------------|-------------------|-----------------------|------------------|
| `pre_call`   | LLM 调用前   | 仅用户输入       | 在提示注入到达模型之前将其拦截 |
| `during_call`| 与调用并行  | 仅用户输入       | 不阻塞请求的低延迟监控 |
| `post_call`  | 响应返回后    | 模型输出，并结合请求上下文判断 | 扫描回答和工具调用中的策略违规、泄露的密钥或 IPI |


当 `during_call` 搭配 `on_flagged_action: block` 或 `on_flagged_action: passthrough` 使用时：

- **LLM 调用通过 `asyncio.gather` 与防护栏检查并行运行**
- 即使防护栏检测到违规，**LLM token 仍会被消耗**
- 防护栏异常会阻止响应到达用户，但**不会取消正在运行的 LLM 任务**
- 这意味着你在向用户返回错误或透传消息的同时，仍要支付完整的 LLM 成本

**建议**：当 `on_flagged_action` 为 `passthrough`（或 `block`）时，请使用 `pre_call` 和 `post_call` 而不是 `during_call`（参见上文推荐的配置）。只有当你想要在不影响用户体验的前提下做低延迟日志记录时，才把 `during_call` 用于 `monitor` 模式。

### Cygnal 在 `post_call` 时收到什么

在 `post_call` 阶段，LiteLLM 会把请求对话连同模型的回答一起发送给 Cygnal，这样 Cygnal 就能判断回答以及其中的工具调用是否有前面的内容作为依据。回答会包含它的工具调用，请求的 `tools` 定义也会随消息一并发送。这意味着仅用 `post_call` 的配置，同样会把该请求的用户提示词和工具结果发送给 Gray Swan。

只包含工具调用的回答也会被扫描。`on_flagged_action: block` 时，被标记的工具调用会返回 400 而不会到达客户端；`fail_open: false` 时，Cygnal 出错会让请求失败，处理方式与文本回答相同。

[跳过标志](./quick_start#在防护栏评估中跳过-system-消息)可以限制发送的内容。`skip_system_message_in_guardrail` 和 `skip_tool_message_in_guardrail` 会把这些消息从对话中剔除；`scan_only_tool_results` 只保留工具结果，并省去请求的 `tools`。模型的回答始终会发送。如果 LiteLLM 无法读取某个端点的对话，Cygnal 只会收到回答本身。

流式场景下若未设置 `streaming_end_of_stream_only`，每次抽样 chunk 检查都会携带同一份对话，因此请设置 `streaming_end_of_stream_only: true`，让每个响应只发送一次。

---

## 与 Claude Code 配合使用

按照 litellm 官方[指南](https://docs.litellm.ai/docs/tutorials/claude_responses_api)设置 Claude Code 与 litellm 的搭配，并把上文提到的防护栏部分加入你的 litellm 配置。Cygnal 原生支持编码代理（coding agent）策略防御。你可以在平台上定义自己的策略，或使用平台提供的编码策略。上面展示的示例配置同样适用于 Claude Code 的推荐设置（把 `policy_id` 替换为合适的值即可）。

---

## 通过 `extra_body` 进行按请求覆盖

通过传入 `litellm_metadata.guardrails[*].grayswan.extra_body`，可以按请求覆盖 Gray Swan 防护栏配置中的部分内容。

`extra_body` 会合并进 Cygnal 请求体，并优先于 `config.yaml` 中的这几个特定字段：`policy_id`、`violation_threshold` 和 `reasoning_mode`。

如果在 `extra_body` 里包含 `metadata` 字段，它会原样转发给 Cygnal API，位于请求体的 `metadata` 字段之下。

示例：

```bash
curl -X POST "http://0.0.0.0:4000/v1/messages?beta=true" \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openrouter/anthropic/{{anthropic}}",
    "messages": [{"role": "user", "content": "hello"}],
    "litellm_metadata": {
      "guardrails": [
        {
          "cygnal-monitor": {
            "extra_body": {
              "policy_id": "specific policy id you want to use",
              "metadata": {
                "user": "health-check"
              }
            }
          }
        }
      ]
    }
  }'
```

OpenAI 客户端：

```python
from openai import OpenAI

client = OpenAI(api_key="anything", base_url="http://0.0.0.0:4000")

resp = client.responses.create(
    model="openrouter/anthropic/{{anthropic}}",
    input="hello",
    extra_body={
        "litellm_metadata": {
            "guardrails": [
                {
                    "cygnal-monitor": {
                        "extra_body": {
                            "policy_id": "69038214e5cdb6befc5e991e",
                            "metadata": {"trace_id": "trace-123"},
                        }
                    }
                }
            ]
        }
    },
)
```

Anthropic 客户端：

```python
from anthropic import Anthropic

client = Anthropic(api_key="anything", base_url="http://0.0.0.0:4000")

resp = client.messages.create(
    model="openrouter/anthropic/{{anthropic}}",
    max_tokens=256,
    messages=[{"role": "user", "content": "hello"}],
    extra_body={
        "litellm_metadata": {
            "guardrails": [
                {
                    "cygnal-monitor": {
                        "extra_body": {
                            "policy_id": "69038214e5cdb6befc5e991e",
                            "metadata": {"trace_id": "trace-123"},
                        }
                    }
                }
            ]
        }
    },
)
```

注意事项：

- 防护栏名称（例如 `cygnal-monitor`）必须与 `config.yaml` 中的 `guardrail_name` 一致。
- 根据你的代理设置，按请求覆盖防护栏可能需要高级版（premium）许可证。

---

## 配置参考

| 参数                                  | 类型            | 说明 |
|---------------------------------------|-----------------|-------------|
| `api_key`                             | string          | Gray Swan Cygnal API 密钥。省略时从 `GRAYSWAN_API_KEY` 读取。 |
| `api_base`                            | string          | 覆盖 Gray Swan API 的基础 URL。默认为 `https://api.grayswan.ai` 或 `GRAYSWAN_API_BASE`。 |
| `mode`                                | string or list  | 防护栏阶段（`pre_call`、`during_call`、`post_call`）。 |
| `optional_params.on_flagged_action`   | string          | `monitor`（仅记录日志）、`block`（抛出 `HTTPException`）或 `passthrough`（用违规消息替换响应内容，不返回 400 错误）。 |
| `optional_params.violation_threshold` | number (0-1)    | 达到或超过该值的分数视为违规。 |
| `optional_params.reasoning_mode`      | string          | `off`、`hybrid` 或 `thinking`。启用 Cygnal 的推理能力。 |
| `optional_params.categories`          | object          | 自定义类别名称到描述的映射。 |
| `optional_params.policy_id`           | string          | Gray Swan 策略标识符。 |
| `guardrail_timeout`                   | number          | Cygnal 请求的超时时间（秒）。默认为 30。 |
| `fail_open`                           | boolean         | 为 true 时，联系 Cygnal 出错只记录日志并继续处理请求；为 false 时，错误向外抛出。默认为 true。 |
| `streaming_end_of_stream_only`        | boolean         | 流式 `post_call` 时，只把最终拼装完成的响应发送给 Cygnal。默认为 false。 |
| `default_on`                          | boolean         | 默认对每个请求都运行该防护栏。 |
