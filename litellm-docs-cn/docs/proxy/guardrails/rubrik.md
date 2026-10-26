import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Rubrik 防护栏

使用 Rubrik 的内容审核与日志集成，把提示词和响应交由外部策略服务审查，并对所有 LLM 请求/响应做批量记录。

**核心特性：**

- **提示词内容审核**（`pre_call`）：在调用 LLM 之前审查提示词，同时支持 OpenAI 与 Anthropic 两种报文格式。
- **响应内容审核**（`post_call`）：在 LLM 返回之后审查助手的响应文本和工具调用，两者都可以被拦截。
- **流式**：流式输出会先缓冲，待拼装完成的响应通过审核后再下发，被标记的分块不会先于拦截到达客户端。
- **批量日志**：以可配置的采样和批量方式把所有 LLM 请求与响应记录到 Rubrik。无论采样如何设置，拦截事件一律记录。
- **失败放行**（fail-open）：若 Rubrik 服务不可用，请求将原样放行。

---

## 快速上手

### 1. 配置 `config.yaml`

凭据可以直接写入 YAML 配置，也可以通过环境变量提供。推荐直接在配置中设置。

<Tabs>
<TabItem value="config" label="config.yaml（推荐）" default>

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "rubrik"
    litellm_params:
      guardrail: rubrik
      mode: ["pre_call", "post_call"]
      api_key: "your-rubrik-api-key"
      api_base: "https://your-rubrik-service.example.com"
      default_on: true
```

也可以在配置中引用环境变量：

```yaml
guardrails:
  - guardrail_name: "rubrik"
    litellm_params:
      guardrail: rubrik
      mode: ["pre_call", "post_call"]
      api_key: os.environ/RUBRIK_API_KEY
      api_base: os.environ/RUBRIK_WEBHOOK_URL
      default_on: true
```

</TabItem>
<TabItem value="env" label="环境变量">

另一种方式是完全通过环境变量配置 Rubrik 服务地址和 API 密钥。当配置中未提供 `api_base` / `api_key` 时，这些环境变量将作为回退值使用。

```bash
export RUBRIK_WEBHOOK_URL="https://your-rubrik-service.example.com"
export RUBRIK_API_KEY="your-rubrik-api-key"
```

配合一份最小配置：

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "rubrik"
    litellm_params:
      guardrail: rubrik
      mode: ["pre_call", "post_call"]
      default_on: true
```

</TabItem>
</Tabs>

### 2. 启动代理服务器

```bash
litellm --config config.yaml --port 4000
```

### 3. 测试

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "What is the weather in SF?"}],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get the weather for a location",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {"type": "string"}
            },
            "required": ["location"]
          }
        }
      }
    ]
  }'
```

---

## 配置参考

### YAML 配置参数

这些参数设置在 `config.yaml` 的 `guardrails.[].litellm_params` 下：

| 参数 | 必填 | 说明 |
|-----------|----------|-------------|
| `guardrail: rubrik` | Yes | 选择 Rubrik 防护栏集成 |
| `mode` | Yes | `"pre_call"` 表示提示词内容审核，`"post_call"` 表示响应内容审核，也可以传入同时包含两者的列表 |
| `api_base` | Yes | Rubrik webhook 基础 URL，可写 `os.environ/RUBRIK_WEBHOOK_URL`。省略时回退到环境变量 `RUBRIK_WEBHOOK_URL`。 |
| `api_key` | No | Rubrik API 密钥，可写 `os.environ/RUBRIK_API_KEY`。省略时回退到环境变量 `RUBRIK_API_KEY`。 |
| `default_on` | No | 设为 `true` 时防护栏对所有请求生效。省略时默认为 `false`，调用方可在单个请求中传入 `"guardrails": ["rubrik"]` 按需启用 |

### 环境变量

这些环境变量是可选的回退项，仅在 YAML 配置中未设置 `api_base` / `api_key` 时生效。`RUBRIK_SAMPLING_RATE` 和 `RUBRIK_BATCH_SIZE` 只能通过环境变量设置。

| 变量 | 必填 | 默认值 | 说明 |
|----------|----------|---------|-------------|
| `RUBRIK_WEBHOOK_URL` | Only if `api_base` not in config | — | Rubrik webhook 服务的基础 URL |
| `RUBRIK_API_KEY` | No | — | 用于向 Rubrik 服务认证的 Bearer 令牌 |
| `RUBRIK_SAMPLING_RATE` | No | `1.0` | **记录日志**的请求占比（0.0 到 1.0）。不影响内容审核（审核始终执行），也不影响拦截日志。设为 `0.5` 表示约记录 50% 的请求。 |
| `RUBRIK_BATCH_SIZE` | No | `512` | 刷新前缓冲的日志条数。日志也会按固定时间间隔定期刷新。 |

---

## 内容审核的工作方式

在 `pre_call` 阶段，防护栏把归一化后的提示词以普通的 OpenAI 对话补全请求发送到 `{api_base}/v1/before_prompt/openai/v1`。服务返回 `{}` 表示放行；返回的对话补全若在 `choices[0].message.content` 中携带拒绝内容，LLM 将根本不会被调用。

在 `post_call` 阶段，防护栏把助手的文本和工具调用发送到 `{api_base}/v1/after_completion/openai/v1`。服务返回审核后的响应；被移除的工具调用或被替换的响应文本都视为拦截。

被拦截的请求不会返回原始响应，而是返回策略说明，并带有 `finish_reason: content_filter`。若服务不可达或返回错误，防护栏会**失败放行**，请求原样继续。

### 请求/响应格式

在 `post_call` 阶段，防护栏发送如下 JSON 信封：

```json
{
  "request": {
    "messages": [...],
    "model": "{{openai_large}}",
    "tools": [...]
  },
  "response": {
    "id": "chatcmpl-...",
    "object": "chat.completion",
    "choices": [{
      "message": {
        "role": "assistant",
        "content": "...",
        "tool_calls": [...]
      }
    }]
  }
}
```

`request.tools` 携带调用方声明的工具列表，服务可据此核对返回的工具调用。服务应返回一个 OpenAI 对话补全，其中只包含**放行**的工具调用，`content` 字段携带替换文本或拦截说明。

---

## 批量日志的工作方式

所有 LLM 请求（无论成功或失败）都会进入队列，并分批发送到 `{api_base}/v1/litellm/batch`。

- 队列达到 `RUBRIK_BATCH_SIZE`（默认 512）或到达固定时间间隔（默认 5 秒）时刷新日志。这些默认值继承自 LiteLLM 的全局设置。
- 在高流量部署中可用 `RUBRIK_SAMPLING_RATE` 降低日志量。采样只影响常规日志；内容审核始终执行，拦截事件也始终记录。
- 所有提供商的日志 ID 都会统一归一为 `litellm_call_id`，因此同一请求的内容审核日志、拦截日志和批量日志共享同一个关联键。
