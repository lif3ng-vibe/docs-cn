import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 日志

使用以下方式记录代理（Proxy）的输入、输出与异常：

- Langfuse
- OpenTelemetry
- GCS、s3、Azure（Blob）存储桶
- AWS SQS
- Lunary
- MLflow
- Deepeval
- 自定义回调——自定义代码与 API 端点
- Langsmith
- DataDog
- Azure Sentinel
- DynamoDB
- 等



## 获取 LiteLLM 调用 ID

LiteLLM 会为每个请求生成一个唯一的 `call_id`。凭借这个 `call_id`，可以在整个系统中追踪该请求。当你想在日志系统中查找某个特定请求的信息时（比如本页提到的任一系统），它会非常有用。

```shell
curl -i -sSL --location 'http://0.0.0.0:4000/chat/completions' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
      "model": "{{openai_small}}",
      "messages": [{"role": "user", "content": "what llm are you"}]
    }' | grep 'x-litellm'
```

输出如下：

```output
x-litellm-call-id: b980db26-9512-45cc-b1da-c511a363b83f
x-litellm-model-id: cb41bc03f4c33d310019bae8c5afdb1af0a8f97b36a234405a9807614988457c
x-litellm-model-api-base: https://x-example-1234.openai.azure.com
x-litellm-version: 1.40.21
x-litellm-response-cost: 2.85e-05
x-litellm-key-tpm-limit: None
x-litellm-key-rpm-limit: None
```

这些响应头中有不少可用于故障排查，但最适合跨系统组件（包括日志工具）追踪请求的是 `x-litellm-call-id`。


## 日志功能


### 脱敏消息与响应内容

设置 `litellm.turn_off_message_logging=True` 后，消息与响应内容不会被记录到你的日志提供商，但请求元数据（metadata，例如花费）仍会照常追踪。在处理敏感数据时，这对隐私保护与合规很有用。

<Tabs>

<TabItem value="global" label="全局">

**1. 设置 config.yaml**
```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
litellm_settings:
  success_callback: ["langfuse"]
  turn_off_message_logging: True # 👈 Key Change
```

**2. 发送请求**
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```



</TabItem>
<TabItem value="dynamic" label="按请求">

:::info

动态请求消息脱敏目前处于 BETA 阶段。

:::

传入请求头，即可为单个请求启用消息脱敏。

```
x-litellm-enable-message-redaction: true
```

config.yaml 示例

**1. 设置 config.yaml**

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
```

**2. 设置按请求生效的请求头**

```shell
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-zV5HlSIm8ihj1F9C_ZbB1g' \
-H 'x-litellm-enable-message-redaction: true' \
-d '{
  "model": "gpt-3.5-turbo-testing",
  "messages": [
    {
      "role": "user",
      "content": "Hey, how'\''s it going 1234?"
    }
  ]
}'
```

</TabItem>
</Tabs>

**3. 查看日志工具与花费日志**

**日志工具**

<Image img={require('../../img/message_redaction_logging.png')}/>

**花费日志**

<Image img={require('../../img/message_redaction_spend_logs.png')} />


### 脱敏 UserAPIKeyInfo

在日志中脱敏用户 API 密钥（user api key）的相关信息（哈希 token、user_id、团队 ID 等）。

目前支持 Langfuse、OpenTelemetry、Logfire、ArizeAI 的日志记录。

```yaml
litellm_settings: 
  callbacks: ["langfuse"]
  redact_user_api_key_info: true
```

### 关闭消息脱敏

如果你已开启 `litellm.turn_off_message_logging`，可以为特定请求覆盖这一行为：设置请求头 `LiteLLM-Disable-Message-Redaction: true`。

代理只会在密钥或团队的元数据包含 `allow_client_message_redaction_opt_out: true` 时接受该请求头。在其他任何密钥上，这个请求头都会被丢弃，消息保持脱敏状态。

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
    --header "Authorization: Bearer $LITELLM_MASTER_KEY" \
    --header 'Content-Type: application/json' \
    --data '{"metadata": {"allow_client_message_redaction_opt_out": true}}'
```

然后用该密钥发送附带此请求头的请求

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Authorization: Bearer <key-from-above>' \
    --header 'Content-Type: application/json' \
    --header 'LiteLLM-Disable-Message-Redaction: true' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```


### 关闭所有追踪与日志

某些场景下，你可能想把所有追踪与日志全部关掉。方法是在请求体中传入 `no-log=True`。

:::info

在 config.yaml 文件中设置 `global_disable_no_log_param:true` 可禁用此行为。

```yaml
litellm_settings:
  global_disable_no_log_param: True
```
:::

<Tabs>
<TabItem value="Curl" label="Curl 请求">

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <litellm-api-key>' \
-d '{
    "model": "openai/{{openai_small}}",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What'\''s in this image?"
          }
        ]
      }
    ],
    "max_tokens": 300,
    "no-log": true # 👈 Key Change
}'
```

</TabItem>
<TabItem value="OpenAI" label="OpenAI">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="{{openai_small}}",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
      "no-log": True # 👈 Key Change
    }
)

print(response)
```

</TabItem>
</Tabs>

**预期的控制台日志**  

```
LiteLLM.Info: "no-log request, skipping logging"
```

### ✨ 动态禁用指定回调

<EnterpriseFeature />

某些场景下，你可能希望对某个请求禁用特定的回调。方法是在请求头中传入 `x-litellm-disable-callbacks: <callback_name>`。

把要禁用的回调列表放在请求头 `x-litellm-disable-callbacks` 中发送即可。

<Tabs>
<TabItem value="Curl" label="Curl 请求">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'x-litellm-disable-callbacks: langfuse' \
    --data '{
    "model": "{{anthropic}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```

</TabItem>
<TabItem value="OpenAI" label="OpenAI Python SDK">

```python
import openai

client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": "what llm are you"
        }
    ],
    extra_headers={
        "x-litellm-disable-callbacks": "langfuse"
    }
)

print(response)
```

</TabItem>
</Tabs>


### ✨ 按虚拟密钥与团队条件启用日志

这个功能可以用来：
1. 按条件只为部分虚拟密钥（virtual key）/团队启用日志
2. 为不同的虚拟密钥/团队配置不同的日志提供商

[👉 **立即上手**——基于团队/密钥的日志记录](team_logging)





## 会记录哪些内容？

LiteLLM 构建完标准负载（payload）之后，最终的成功与失败回调事件都会包含 `kwargs["standard_logging_object"]`。中间产生的流式事件，以及负载构建失败的回调，则可能没有这个字段。

[👉 **标准日志负载（Standard Logging Payload）规范**](./logging_spec)

## Langfuse

我们通过 `--config` 设置 `litellm.success_callback = ["langfuse"]`，这样所有成功的 LLM 调用都会记录到 langfuse。请确保已在环境中设置 `LANGFUSE_PUBLIC_KEY` 和 `LANGFUSE_SECRET_KEY`。

**第 1 步** 安装 langfuse

```shell
uv add "langfuse>=4.7,<5"
```

**第 2 步**：创建 `config.yaml` 文件并设置 `litellm_settings`：`success_callback`

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
litellm_settings:
  success_callback: ["langfuse"]
```

**第 3 步**：设置记录到 langfuse 所需的环境变量

```shell
export LANGFUSE_PUBLIC_KEY="pk_kk"
export LANGFUSE_SECRET_KEY="sk_ss"
# Optional, defaults to https://cloud.langfuse.com
export LANGFUSE_HOST="https://xxx.langfuse.com"
```

**第 4 步**：启动代理，发起一次测试请求

启动代理

```shell
litellm --config config.yaml --debug
```

测试请求

```
litellm --test
```

Langfuse 上的预期输出

<Image img={require('../../img/langfuse_small.png')} />

### 将元数据记录到 Langfuse

<Tabs>

<TabItem value="Curl" label="Curl 请求">

在请求体中传入 `metadata`

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "metadata": {
        "generation_name": "ishaan-test-generation",
        "generation_id": "gen-id22",
        "trace_id": "trace-id22",
        "trace_user_id": "user-id2"
    }
}'
```

</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

把 `extra_body={"metadata": { }}` 设为你要传递的 `metadata`

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="{{openai_small}}",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
        "metadata": {
            "generation_name": "ishaan-generation-openai-client",
            "generation_id": "openai-client-gen-id22",
            "trace_id": "openai-client-trace-id22",
            "trace_user_id": "openai-client-user-id2"
        }
    }
)

print(response)
```

</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model = "{{openai_small}}",
    temperature=0.1,
    extra_body={
        "metadata": {
            "generation_name": "ishaan-generation-langchain-client",
            "generation_id": "langchain-client-gen-id22",
            "trace_id": "langchain-client-trace-id22",
            "trace_user_id": "langchain-client-user-id2"
        }
    }
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```

</TabItem>
</Tabs>

:::info
Langfuse v4 要求使用 W3C 追踪 ID（32 个小写十六进制字符）。LiteLLM 会先把自定义 `trace_id` 转为小写并去掉连字符，因此 UUID 归一化后可以原样使用。仍然不是 32 位十六进制的值（比如上面的 `trace-id22`）会被确定性地哈希成合法 ID；同一个 `trace_id` 总是映射到同一条 Langfuse 追踪记录，但 Langfuse 中显示的 ID 是归一化或哈希后的形式，而不是原始字符串。
:::

### 自定义标签

在请求体中设置 `tags`


<Tabs>


<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="llama3",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    user="palantir",
    extra_body={
        "metadata": {
            "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"]
        }
    }
)

print(response)
```
</TabItem>

<TabItem value="Curl" label="Curl 请求">

在请求体中传入 `metadata`

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --data '{
    "model": "llama3",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "user": "palantir",
    "metadata": {
        "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"]
    }
}'
```
</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage
import os

os.environ["OPENAI_API_KEY"] = "sk-<your-api-key>"

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model = "llama3",
    user="palantir",
    extra_body={
        "metadata": {
            "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"]
        }
    }
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```

</TabItem>
</Tabs>



### LiteLLM 标签 - `cache_hit` 与 `cache_key`

如果你想控制 LiteLLM 代理把哪些 LiteLLM 专属字段作为标签记录，可以用这个功能。默认情况下，LiteLLM 代理不会记录任何 LiteLLM 专属字段

| LiteLLM 专属字段 | 说明 | 示例值 |
| --- | --- | --- |
| `cache_hit` | 表示是否发生了缓存命中（True 为命中，False 为未命中） | `true`, `false` |
| `cache_key` | 本次请求使用的缓存键 | `d2b758c****` |
| `proxy_base_url` | 代理服务器的基础 URL，即你服务器上环境变量 `PROXY_BASE_URL` 的值 | `https://proxy.example.com` |
| `user_api_key_alias` | LiteLLM 虚拟密钥的别名 | `prod-app1` |
| `user_api_key_user_id` | 与用户 API 密钥关联的唯一 ID | `user_123`, `user_456` |
| `user_api_key_user_email` | 与用户 API 密钥关联的邮箱 | `user@example.com`, `admin@example.com` |
| `user_api_key_team_alias` | 与 API 密钥关联的团队别名 | `team_alpha`, `dev_team` |


**用法**

指定 `langfuse_default_tags` 即可控制哪些 litellm 字段会被记录到 Langfuse

config.yaml 示例
```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  success_callback: ["langfuse"]

  # 👇 Key Change
  langfuse_default_tags: ["cache_hit", "cache_key", "proxy_base_url", "user_api_key_alias", "user_api_key_user_id", "user_api_key_user_email", "user_api_key_team_alias", "semantic-similarity", "proxy_base_url"]
```

### 查看 LiteLLM 发送给提供商的 POST 请求

当你想查看 LiteLLM 发给 LLM API 的原始 curl 请求时，就用这个功能

在 `litellm_settings` 中设置 `log_raw_request_response: true`。此后，LiteLLM 会在每个请求的 Langfuse 元数据里，把它发给提供商的 curl 命令附在 `raw_request` 中。这是全局设置，没有按请求生效的开关

```yaml
litellm_settings:
  callbacks: ["langfuse"]
  log_raw_request_response: true
```

**Langfuse 上的预期输出**

你会在 Langfuse 元数据中看到 `raw_request`，也就是 LiteLLM 发给你的 LLM API 提供商的原始 CURL 命令

<Image img={require('../../img/debug_langfuse.png')} />

## OpenTelemetry

:::tip

完整的 OpenTelemetry 参考文档（span 层级、全部会发出的 span 与属性、指标、semconv 模式以及故障排查）位于 [可观测性 → OpenTelemetry 集成](/docs/observability/opentelemetry_integration)。下面这一节是面向代理的快速上手。

:::

:::info 

（可选）在环境中设置以下变量，自定义 OTEL Service Name 与 OTEL TRACER NAME

```shell
OTEL_TRACER_NAME=<your-trace-name>     # default="litellm"
OTEL_SERVICE_NAME=<your-service-name>` # default="litellm"
```

:::

<Tabs>

<TabItem value="Console Exporter" label="记录到控制台">

**第 1 步**：设置回调与环境变量

在环境中添加以下内容

```shell
OTEL_EXPORTER="console"
```

在 `litellm_config.yaml` 中添加 `otel` 作为回调

```shell
litellm_settings:
  callbacks: ["otel"]
```

**第 2 步**：启动代理，发起一次测试请求

启动代理

```shell
litellm --config config.yaml --detailed_debug
```

测试请求

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

**第 3 步**：**服务器日志/控制台中应出现如下记录**

这就是 OTEL 日志输出的 Span

```json
{
    "name": "litellm-acompletion",
    "context": {
        "trace_id": "0x8d354e2346060032703637a0843b20a3",
        "span_id": "0xd8d3476a2eb12724",
        "trace_state": "[]"
    },
    "kind": "SpanKind.INTERNAL",
    "parent_id": null,
    "start_time": "2024-06-04T19:46:56.415888Z",
    "end_time": "2024-06-04T19:46:56.790278Z",
    "status": {
        "status_code": "OK"
    },
    "attributes": {
        "model": "llama3-8b-8192"
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "service.name": "litellm"
        },
        "schema_url": ""
    }
}
```

</TabItem>

<TabItem value="Honeycomb" label="记录到 Honeycomb">

#### 快速上手 - 记录到 Honeycomb

**第 1 步**：设置回调与环境变量

在环境中添加以下内容

```shell
OTEL_EXPORTER="otlp_http"
OTEL_ENDPOINT="https://api.honeycomb.io/v1/traces"
OTEL_HEADERS="x-honeycomb-team=<your-api-key>"
```

在 `litellm_config.yaml` 中添加 `otel` 作为回调

```shell
litellm_settings:
  callbacks: ["otel"]
```

**第 2 步**：启动代理，发起一次测试请求

启动代理

```shell
litellm --config config.yaml --detailed_debug
```

测试请求

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

</TabItem>

<TabItem value="traceloop" label="记录到 Traceloop Cloud">

#### 快速上手 - 记录到 Traceloop

**第 1 步：**
在环境中添加以下内容

```shell
OTEL_EXPORTER="otlp_http"
OTEL_ENDPOINT="https://api.traceloop.com"
OTEL_HEADERS="Authorization=Bearer%20<your-api-key>"
```

**第 2 步**：添加 `otel` 作为回调

```shell
litellm_settings:
  callbacks: ["otel"]
```

**第 3 步**：启动代理，发起一次测试请求

启动代理

```shell
litellm --config config.yaml --detailed_debug
```

测试请求

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

</TabItem>

<TabItem value="otel-col" label="记录到 OTEL HTTP Collector">

#### 快速上手 - 记录到 OTEL Collector

**第 1 步**：设置回调与环境变量

在环境中添加以下内容

```shell
OTEL_EXPORTER="otlp_http"
OTEL_ENDPOINT="http://0.0.0.0:4317"
OTEL_HEADERS="x-honeycomb-team=<your-api-key>" # Optional
```

在 `litellm_config.yaml` 中添加 `otel` 作为回调

```shell
litellm_settings:
  callbacks: ["otel"]
```

**第 2 步**：启动代理，发起一次测试请求

启动代理

```shell
litellm --config config.yaml --detailed_debug
```

测试请求

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

</TabItem>

<TabItem value="otel-col-grpc" label="记录到 OTEL GRPC Collector">

#### 快速上手 - 记录到 OTEL GRPC Collector

**第 1 步**：设置回调与环境变量

在环境中添加以下内容

```shell
OTEL_EXPORTER="otlp_grpc"
OTEL_ENDPOINT="http:/0.0.0.0:4317"
OTEL_HEADERS="x-honeycomb-team=<your-api-key>" # Optional
```

> 注意：OTLP gRPC 需要 `grpcio`，可通过 `uv add "litellm[grpc]"`（或 `grpcio`）安装。

在 `litellm_config.yaml` 中添加 `otel` 作为回调

```shell
litellm_settings:
  callbacks: ["otel"]
```

**第 2 步**：启动代理，发起一次测试请求

启动代理

```shell
litellm --config config.yaml --detailed_debug
```

测试请求

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

</TabItem>

</Tabs>

**🎉 你应该能在 OTEL Collector 中看到这条追踪记录**

### 脱敏消息与响应内容

为 `otel` 设置 `message_logging=False` 后，不会再记录任何消息或响应内容

```yaml
litellm_settings:
  callbacks: ["otel"]

## 👇 Key Change
callback_settings:
  otel:
    message_logging: False
```

### Traceparent 头
##### 跨服务传播上下文：`Traceparent HTTP Header`

❓ 当你需要**在分布式追踪系统中传递传入请求的相关信息**时，可以使用此功能

✅ 关键改动：在请求中传入 **`traceparent` 头**。[关于 traceparent 头的更多信息见这里](https://uptrace.dev/opentelemetry/opentelemetry-traceparent.html#what-is-traceparent-header)

```curl
traceparent: 00-80e1afed08e019fc1110464cfa66635c-7a085853722dc6d2-01
```

用法示例

1. 携带 `traceparent` 头向 LiteLLM 代理发起请求

```python
import openai
import uuid

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")
example_traceparent = f"00-80e1afed08e019fc1110464cfa66635c-02e80198930058d4-01"
extra_headers = {
    "traceparent": example_traceparent
}
_trace_id = example_traceparent.split("-")[1]

print("EXTRA HEADERS: ", extra_headers)
print("Trace ID: ", _trace_id)

response = client.chat.completions.create(
    model="llama3",
    messages=[
        {"role": "user", "content": "this is a test request, write a short poem"}
    ],
    extra_headers=extra_headers,
)

print(response)
```

```shell
# EXTRA HEADERS:  {'traceparent': '00-80e1afed08e019fc1110464cfa66635c-02e80198930058d4-01'}
# Trace ID:  80e1afed08e019fc1110464cfa66635c
```

2. 在 OTEL 日志系统中查找 Trace ID

在你的 OTEL Collector 中搜索 Trace=`80e1afed08e019fc1110464cfa66635c`

<Image img={require('../../img/otel_parent.png')} />

##### 向 LLM API 转发 `Traceparent HTTP Header`

如果你想把 traceparent 头转发给 vLLM 这类自托管（self-hosted）LLM，可以使用此功能

在 `config.yaml` 中设置 `forward_traceparent_to_llm_provider: True`，`traceparent` 头就会随之转发给你的 LLM API

:::warning

仅对自托管 LLM 使用此功能，否则可能导致 Bedrock、Vertex AI 调用失败

:::

```yaml
litellm_settings:
  forward_traceparent_to_llm_provider: True
```

## Google Cloud Storage 存储桶

将 LLM 日志记录到 [Google Cloud Storage 存储桶](https://cloud.google.com/storage?hl=en)

<EnterpriseFeature />

| 属性 | 详情 |
| --- | --- |
| 说明 | 将 LLM 的输入/输出记录到云存储桶 |
| 负载测试基准 | [基准测试](https://docs.litellm.ai/docs/benchmarks) |
| Cloud Storage 官方文档 | [Google Cloud Storage](https://cloud.google.com/storage?hl=en) |



#### 用法

1. 在 LiteLLM Config.yaml 中加入 `gcs_bucket`
```yaml
model_list:
- litellm_params:
    api_base: https://exampleopenaiendpoint-production.up.railway.app/
    api_key: my-fake-key
    model: openai/my-fake-model
  model_name: fake-openai-endpoint

litellm_settings:
  callbacks: ["gcs_bucket"] # 👈 KEY CHANGE # 👈 KEY CHANGE
```

2. 设置所需的环境变量

```shell
GCS_BUCKET_NAME="<your-gcs-bucket-name>"
GCS_PATH_SERVICE_ACCOUNT="/Users/ishaanjaffer/Downloads/adroit-crow-413218-a956eef1a2a8.json" # Add path to service account.json
```

3. 启动代理

```
litellm --config /path/to/config.yaml
```

4. 测试一下！

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ],
    }
'
```


#### GCS 存储桶上的预期日志

<Image img={require('../../img/gcs_bucket.png')} />

#### GCS 存储桶上记录的字段

[**GCS 存储桶中记录的是标准日志对象**](../proxy/logging_spec)


#### 从 Google Cloud Console 获取 `service_account.json`

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 搜索 IAM & Admin（权限与安全管理）
3. 点击 Service Accounts（服务账号）
4. 选择一个服务账号
5. 点击 “Keys” -> Add Key -> Create New Key -> JSON
6. 保存 JSON 文件，并将其路径填入 `GCS_PATH_SERVICE_ACCOUNT`



## Google Cloud Storage - PubSub 主题

将 LLM 日志/SpendLogs 记录到 [Google Cloud Storage PubSub 主题](https://cloud.google.com/pubsub/docs/reference/rest)

<EnterpriseFeature />

| 属性 | 详情 |
| --- | --- |
| 说明 | 将 LiteLLM 的 `SpendLogs Table` 记录到 Google Cloud Storage PubSub 主题 |

什么时候使用 `gcs_pubsub`？

- 如果你的 LiteLLM 数据库中花费日志（spend logs）已超过 100 万条，需要把 `SpendLogs` 发送到一个可供 GCS BigQuery 消费的 PubSub 主题


#### 用法

1. 在 LiteLLM Config.yaml 中加入 `gcs_pubsub`
```yaml
model_list:
- litellm_params:
    api_base: https://exampleopenaiendpoint-production.up.railway.app/
    api_key: my-fake-key
    model: openai/my-fake-model
  model_name: fake-openai-endpoint

litellm_settings:
  callbacks: ["gcs_pubsub"] # 👈 KEY CHANGE # 👈 KEY CHANGE
```

2. 设置所需的环境变量

```shell
GCS_PUBSUB_TOPIC_ID="litellmDB"
GCS_PUBSUB_PROJECT_ID="reliableKeys"
```

3. 启动代理

```
litellm --config /path/to/config.yaml
```

4. 测试一下！

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ],
    }
'
```

## Deepeval
LiteLLM 支持将日志记录到 [Confidential AI](https://documentation.confident-ai.com/)（即 Deepeval 平台）：

### 用法
1. 在 LiteLLM 的 `config.yaml` 中加入 `deepeval`

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: {{openai_large}}
litellm_settings:
  success_callback: ["deepeval"]
  failure_callback: ["deepeval"]
```

2. 在 `.env` 文件中设置环境变量
```shell
CONFIDENT_API_KEY=<your-api-key>
```
:::info
登录 [Confident AI](https://app.confident-ai.com/project) 平台即可获取 `CONFIDENT_API_KEY`。
:::

3. 启动你的代理服务器：
```shell
litellm --config config.yaml --debug
```

4. 发起请求：
```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_small}}",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      {
        "role": "user",
        "content": "how can I solve 8x + 7 = -23"
      }
    ]
}'
```

5. 在平台上查看追踪记录：

<Image img={require('../../img/deepeval_visible_trace.png')} />

## s3 存储桶

我们将通过 `--config` 来进行设置

- `litellm.success_callback = ["s3"]`

这会将所有成功的 LLM 调用日志记录到 s3 存储桶

**第 1 步** 在 .env 中设置 AWS 凭证

```shell
AWS_ACCESS_KEY_ID = ""
AWS_SECRET_ACCESS_KEY = ""
AWS_REGION_NAME = ""
```

**第 2 步**：创建 `config.yaml` 文件，并在 `litellm_settings` 中设置 `success_callback`

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
litellm_settings:
  success_callback: ["s3_v2"]
  s3_callback_params:
    s3_bucket_name: logs-bucket-litellm   # AWS Bucket Name for S3
    s3_region_name: us-west-2              # AWS Region Name for S3
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID  # us os.environ/<variable name> to pass environment variables. This is AWS Access Key ID for S3
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY  # AWS Secret Access Key for S3
    s3_path: my-test-path # [OPTIONAL] set path in bucket you want to write logs to
    s3_endpoint_url: https://s3.amazonaws.com  # [OPTIONAL] S3 endpoint URL, if you want to use Backblaze/cloudflare s3 buckets
    s3_use_virtual_hosted_style: false # [OPTIONAL] use virtual-hosted-style URLs (bucket.endpoint/key) instead of path-style (endpoint/bucket/key). Useful for S3-compatible services like MinIO
    s3_strip_base64_files: false # [OPTIONAL] remove base64 files before storing in s3
    s3_server_side_encryption: aws:kms # [OPTIONAL] server-side encryption algorithm for log objects: AES256 or aws:kms
    s3_sse_kms_key_id: arn:aws:kms:us-west-2:111122223333:key/my-key-id # [OPTIONAL] KMS key id or ARN to encrypt log objects with; requires s3_server_side_encryption: aws:kms (inferred automatically if only the key id is set)
    s3_max_concurrent_uploads: 16 # [OPTIONAL] cap on simultaneous PUTs per flush; values below 1 or non integers fall back to 16 with a warning
    s3_adaptive_concurrency: false # [OPTIONAL] grow the PUT concurrency bound above s3_max_concurrent_uploads while uploads succeed and halve it on throttling (429, 503, SlowDown, transport errors)
    s3_max_adaptive_concurrency: 200 # [OPTIONAL] ceiling for s3_adaptive_concurrency; values below 1 or non integers fall back to 200 with a warning
    s3_max_retry_age_seconds: 3600 # [OPTIONAL] drop a failed upload once it has been retrying longer than this many seconds, measured from the first flush where a sibling upload delivered; set 0 to retry forever, non integers fall back to 3600 with a warning
    s3_drop_on_terminal_error: true # [OPTIONAL] drop an object after a terminal, object-specific S3 rejection (400/403 with a code like EntityTooLarge or InvalidArgument) once a sibling delivered, instead of retrying it every flush; set false to keep retrying
    s3_max_queue_size: 50000 # [OPTIONAL] cap on queued log events applied after a failed flush; the oldest events are dropped once the queue exceeds this size
    s3_batch_file_upload: false # [OPTIONAL] write each flush as one NDJSON .jsonl file per object key prefix instead of one object per request
    s3_partition_granularity: day # [OPTIONAL] date folder layout for log objects: day (default) or hour, see Hourly Folders below
```

`s3_max_concurrent_uploads` 的默认值 16 来自刷新预算，而非 S3 的硬性限制：一个装满 `DEFAULT_S3_BATCH_SIZE`（512）条目的队列必须在 `DEFAULT_S3_FLUSH_INTERVAL_SECONDS`（10 秒）内清空，按每个 PUT 最悲观 300 毫秒计算，需要 `512 * 0.3 / 10 = 15.4` 个在途上传，因此 16 是能满足预算的最小整数。这一取值也比 S3 支持的[每个前缀每秒 3,500 次 PUT](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html)低一个数量级，与 boto3 的 `max_concurrency`（10）以及 Fluentd 建议的 8 个刷新线程处于同一量级。该限制按单个 uvicorn worker 计，因此整个进程的并发为 `workers * 16`

这个上限是滑动窗口，而不是批大小：前 16 个上传中只要有 1 个完成，第 17 个就会立刻开始，因此单个 worker 每秒大约能投递 `s3_max_concurrent_uploads / PUT 延迟` 个对象。对 us-east-1 存储桶的实测显示，一次小型 PUT 的往返耗时约 100 毫秒，因此 16 大约支撑每个 worker 每秒 160 条日志，32 约 320 条，64 约 610 条。跨区域访问或在 `503 SlowDown` 限流下，延迟接近 300 毫秒，这些数字会降到原来的三分之一。容量按 `s3_max_concurrent_uploads >= 每 worker 每秒峰值请求数 * PUT 延迟（秒）` 估算，再向上取整到 2 的幂。一个以 100 毫秒延迟每秒处理 250 个请求的 worker 需要 25，因此设为 32

如果上限相对流量设置得过低，日志不会丢失，但投递会滞后：一次刷新耗时超过 `DEFAULT_S3_FLUSH_INTERVAL_SECONDS`，对象出现在存储桶里的时间晚于刷新间隔，`log_queue` 在内存中持续增长，直到流量回落。如果你发现对象晚到了几分钟，而代理日志里并没有 `Error uploading to s3` 字样，这就是该调高上限的信号。如果算出的数值超过 64，建议改用 `s3_batch_file_upload`：每次刷新变成每个键前缀一个对象，上限不再重要，存储桶每个周期只会看到少量 PUT。把上限抬到远超公式给出的值，反而会回到让 S3 限流的突发形态：实测中 8 个 worker 各自维持数百个在途请求时，向一个新建的按天前缀每秒写入约 4,500 个 PUT，其中 11% 到 18% 收到 `503 SlowDown`；而同样 8 个 worker 在 16 并发下失败率只有 0.08%，且全部在第一次重试时恢复

启用 `s3_batch_file_upload` 后，每次刷新会为每个对象键前缀生成一个 `batch_<HH-MM-SS>_<uuid>.jsonl` 对象，批量文件与它们替代的单请求对象存放在一起，团队或 API 密钥前缀也保持不变。上传失败的对象会留在队列里，在下一次刷新时重试。设置了 `cold_storage_custom_logger: s3_v2` 时，该开关会被忽略并给出警告，因为花费日志查询依赖单请求对象

上传失败会重试，但不会永远重试。每次刷新先上传新事件，再处理重试项；403、500、503 会在同一次刷新内以先 1 秒后 2 秒的退避最多重试 3 次，其他失败则要等下一次刷新。如果 S3 因对象自身的问题拒绝某个对象（400 或 403，错误码如 `EntityTooLarge`、`InvalidArgument`、`MalformedXML`、`InvalidDigest`、`KeyTooLongError`），只要同批已有其他对象投递成功，该对象会在这次刷新结束时被丢弃，因为重试注定不会成功；`AccessDenied`、凭证与 KMS 错误、404、429 以及 5xx 视为可恢复，会继续重试。某个对象若在同批其他对象都投递成功后仍持续失败，会在 `s3_max_retry_age_seconds`（默认 1 小时）后被丢弃；计时从第一个同批对象投递成功才开始，因此整桶故障期间谁都没有投递成功时不会计时，但已经进入计时的对象在后续故障期间会继续累计。这是两条相互独立的丢弃规则：`s3_drop_on_terminal_error: false` 只关闭终态丢弃，`s3_max_retry_age_seconds: 0` 只关闭时限丢弃，想让所有失败对象一直重试就两项都设置。另外，与这两条规则无关，刷新失败后队列会丢弃最旧的事件、裁剪到 `s3_max_queue_size`，如果队列需要挺过长时间故障，请调高这一上限；每次丢弃都会记录 `s3 logging: N uploads dropped`

**第 3 步**：启动代理，发起一次测试请求

启动代理

```shell
litellm --config config.yaml --debug
```

测试请求

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "Azure OpenAI GPT-4 East",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

此时日志应已写入你指定的 s3 存储桶

### 按小时分文件夹

默认情况下，`s3_v2` 会把一天内的所有日志写进同一个日期文件夹，例如 `my-test-path/2026-10-01/time-14-05-09-123456_chatcmpl-abc.json`。设置 `s3_partition_granularity: hour` 可在日期下再分出一层小时文件夹，同一对象会落在 `my-test-path/2026-10-01/14/time-14-05-09-123456_chatcmpl-abc.json`，按时间段查询时只需列出相关的小时目录

```yaml
litellm_settings:
  callbacks: ["s3_v2"]
  s3_callback_params:
    s3_bucket_name: logs-bucket-litellm
    s3_region_name: us-west-2
    s3_path: my-test-path
    s3_partition_granularity: hour
```

也可以通过环境变量 `S3_PARTITION_GRANULARITY` 来设置，`s3_callback_params` 中的值优先于环境变量。日期和小时都取自请求开始时间，与按天布局使用的时钟一致，团队或密钥别名前缀仍位于日期文件夹之前。不设置该项，或将其设为 `day` 或空值，都保持按天布局不变；其他任何取值会记录一条警告并回退为 `day`

同样的设置也适用于审计日志对象、`s3_batch_file_upload` 文件和冷存储对象键，因此 `cold_storage_custom_logger: s3_v2` 仍能找到它写出的对象。当审计日志通过 `s3_audit_callback_params` 写入单独的存储桶时，其目录布局改由该配置块中的 `s3_partition_granularity` 决定，再回退到环境变量，因此请求日志与审计日志可以使用不同的布局。开启批量上传后，跨越整点边界的刷新会向每个小时文件夹各写一个 `.jsonl` 文件。在管理界面（Admin UI）中，该选项以 Folder Partitioning 的形式出现在 `s3_v2` 回调表单里。只有 `s3_v2` 支持此设置；旧版 `s3` 回调和 `gcs_bucket` 日志记录器始终按天分目录

### 对象键中的团队别名前缀

在 `config.yaml` 文件中设置 `team_alias`，即可把团队别名加入对象键，对象键会以团队别名作为前缀。

```yaml
litellm_settings:
  callbacks: ["s3_v2"]
  s3_callback_params:
    s3_bucket_name: logs-bucket-litellm
    s3_region_name: us-west-2
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    s3_path: my-test-path
    s3_endpoint_url: https://s3.amazonaws.com
    s3_use_team_prefix: true
```

在 s3 存储桶中，你会看到对象键形如 `my-test-path/my-team-alias/...`

### 对象键中的密钥别名前缀

启用 s3_use_key_prefix，即可把用户 API 密钥别名加入 s3 对象键。

```yaml
litellm_settings:
  callbacks: ["s3_v2"]
  s3_callback_params:
    s3_bucket_name: logs-bucket-litellm
    s3_region_name: us-west-2
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    s3_path: my-test-path
    s3_endpoint_url: https://s3.amazonaws.com
    s3_use_key_prefix: true
```

在 s3 存储桶中，你会看到对象键形如 `my-test-path/my-key-alias/...`

如果团队别名和密钥别名同时启用，路径会变成
`my-test-path/my-team-alias/my-key-alias/...`

## AWS SQS


| 属性 | 详情 |
| --- | --- |
| 说明 | 将 LLM 的输入/输出记录到 AWS SQS 队列 |
| AWS SQS 官方文档 | [AWS SQS](https://aws.amazon.com/sqs/) |
| 记录到 SQS 的字段 | LiteLLM [每次 LLM 调用都会记录标准日志负载（Standard Logging Payload）](../proxy/logging_spec) |


将 LLM 日志记录到 [AWS Simple Queue Service（SQS）](https://aws.amazon.com/sqs/)

我们将通过 litellm 的 `--config` 来进行设置

- `litellm.callbacks = ["aws_sqs"]`

这会将所有成功的 LLM 调用日志记录到 AWS SQS 队列

**第 1 步** 在 .env 中设置 AWS 凭证

```shell
AWS_ACCESS_KEY_ID = ""
AWS_SECRET_ACCESS_KEY = ""
AWS_REGION_NAME = ""
```

**第 2 步**：创建 `config.yaml` 文件，并在 `litellm_settings` 中设置 `callbacks`

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: {{openai_large}}

litellm_settings:
  callbacks: ["aws_sqs"]

  aws_sqs_callback_params:
    # --- 🧱 Required Parameters ---
    sqs_queue_url: https://sqs.us-west-2.amazonaws.com/123456789012/my-queue
    # The AWS SQS Queue URL to which LiteLLM will send log events.

    sqs_region_name: us-west-2
    # AWS Region for your SQS queue (e.g., us-east-1, eu-central-1, etc.)

    # --- Logging Controls ---
    sqs_strip_base64_files: false
    # If true, LiteLLM will remove or redact base64-encoded binary data (e.g., PDFs, images, audio)
    # from logged messages to avoid large payloads. SQS has a 1 MB payload size limit.

```

**第 3 步**：启动代理，发起一次测试请求

启动代理

```shell
litellm --config config.yaml --debug
```

测试请求

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "{{openai_large}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```


## Azure Blob Storage

将 LLM 日志记录到 [Azure Data Lake Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction)

<EnterpriseFeature />

| 属性 | 详情 |
| --- | --- |
| 说明 | 将 LLM 的输入/输出记录到 Azure Blob Storage（存储桶） |
| Azure Data Lake Storage 官方文档 | [Azure Data Lake Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction) |



#### 用法

1. 在 LiteLLM Config.yaml 中加入 `azure_storage`
```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["azure_storage"] # 👈 KEY CHANGE # 👈 KEY CHANGE
```

2. 设置所需的环境变量

```shell
# Required Environment Variables for Azure Storage
AZURE_STORAGE_ACCOUNT_NAME="litellm2" # The name of the Azure Storage Account to use for logging
AZURE_STORAGE_FILE_SYSTEM="litellm-logs" # The name of the Azure Storage File System to use for logging.  (Typically the Container name)

# Authentication Variables
# Option 1: Use Storage Account Key
AZURE_STORAGE_ACCOUNT_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" # The Azure Storage Account Key to use for Authentication

# Option 2: Use Tenant ID + Client ID + Client Secret
AZURE_STORAGE_TENANT_ID="985efd7cxxxxxxxxxx" # The Application Tenant ID to use for Authentication
AZURE_STORAGE_CLIENT_ID="abe66585xxxxxxxxxx" # The Application Client ID to use for Authentication
AZURE_STORAGE_CLIENT_SECRET="uMS8Qxxxxxxxxxx" # The Application Client Secret to use for Authentication

# Option 3: Use the identity the deployment already runs as
# Leave the AZURE_STORAGE_* service principal variables unset. LiteLLM authenticates with
# Workload Identity Federation or with a managed identity, and with nothing else: a developer
# sign-in such as the Azure CLI is never used, and neither is the AZURE_CLIENT_SECRET service
# principal you may have configured for Azure OpenAI. Assign Storage Blob Data Contributor to
# the identity on the storage account, container, or resource group.
# Workload Identity Federation reads AZURE_CLIENT_ID, AZURE_TENANT_ID and
# AZURE_FEDERATED_TOKEN_FILE, which the AKS webhook injects into the pod. A user assigned
# managed identity reads AZURE_CLIENT_ID. AZURE_AUTHORITY_HOST selects a sovereign cloud.
# AZURE_CLIENT_ID names one identity for the whole proxy, so if the identity that holds Storage
# Blob Data Contributor is not the one you use for Azure OpenAI, or if you authenticate with a
# plain service principal rather than a federated or managed identity, use Option 2 instead

# Sovereign Clouds (optional, defaults to the Azure commercial cloud)
AZURE_STORAGE_ENDPOINT_SUFFIX="core.usgovcloudapi.net" # The storage endpoint suffix to use. Defaults to core.windows.net
AZURE_AUTHORITY_HOST="https://login.microsoftonline.us" # The Entra ID login authority to use. Needed with Option 2 and Option 3
```

3. 启动代理

```
litellm --config /path/to/config.yaml
```

4. 测试一下！

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ],
    }
'
```


#### Azure Data Lake Storage 上的预期日志

<Image img={require('../../img/azure_blob.png')} />

#### Azure Data Lake Storage 上记录的字段

[**Azure Data Lake Storage 中记录的是标准日志对象**](../proxy/logging_spec)


## [Datadog](../observability/datadog)

👉 了解如何在 LiteLLM 代理中使用 [Datadog LLM Observability](../observability/datadog)

## [Azure Sentinel](../observability/azure_sentinel)

👉 了解如何在 LiteLLM 代理中使用 [Azure Sentinel](../observability/azure_sentinel)


## Lunary
#### 第 1 步：安装依赖并设置环境变量
安装依赖
```shell
uv add litellm lunary
```

从 https://app.lunary.ai/settings 获取你的 Lunary 公钥
```shell
export LUNARY_PUBLIC_KEY="<your-public-key>"
```

#### 第 2 步：创建 `config.yaml` 并设置 `lunary` 回调

```yaml
model_list:
  - model_name: "*"
    litellm_params:
      model: "*"
litellm_settings:
  success_callback: ["lunary"]
  failure_callback: ["lunary"]
```

#### 第 3 步：启动 LiteLLM 代理
```shell
litellm --config config.yaml
```

#### 第 4 步：发起请求

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-d '{
    "model": "{{openai_large}}",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      {
        "role": "user",
        "content": "how can I solve 8x + 7 = -23"
      }
    ]
}'
```

## MLflow

👉 想在 LiteLLM 代理服务器上开始使用 mlflow，请跟随[此教程](../observability/mlflow)



## 自定义回调类 [Async]

当你想在 `python` 中运行自定义回调时，可以使用这种方式

#### 第 1 步 - 创建你的自定义 `litellm` 回调类

这里用到 `litellm.integrations.custom_logger`，**litellm 自定义回调的更多细节见[这里](https://docs.litellm.ai/docs/observability/custom_callback)**

在一个 Python 文件中定义你的自定义回调类。

下面这个自定义日志记录器示例会追踪 `key, user, model, prompt, response, tokens, cost`。我们创建一个名为 `custom_callbacks.py` 的文件，并在其中初始化 `proxy_handler_instance`

```python
from litellm.integrations.custom_logger import CustomLogger
import litellm

# This file includes the custom callbacks for LiteLLM Proxy
# Once defined, these can be passed in proxy_config.yaml
class MyCustomHandler(CustomLogger):
    def log_pre_api_call(self, model, messages, kwargs): 
        print(f"Pre-API Call")
    
    def log_post_api_call(self, kwargs, response_obj, start_time, end_time): 
        print(f"Post-API Call")
        
    def log_success_event(self, kwargs, response_obj, start_time, end_time): 
        print("On Success")

    def log_failure_event(self, kwargs, response_obj, start_time, end_time): 
        print(f"On Failure")

    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        print(f"On Async Success!")
        # log: key, user, model, prompt, response, tokens, cost
        # Access kwargs passed to litellm.completion()
        model = kwargs.get("model", None)
        messages = kwargs.get("messages", None)
        user = kwargs.get("user", None)

        # Access litellm_params passed to litellm.completion(), example access `metadata`
        litellm_params = kwargs.get("litellm_params", {})
        metadata = litellm_params.get("metadata", {})   # headers passed to LiteLLM proxy, can be found here

        # Calculate cost using  litellm.completion_cost()
        cost = litellm.completion_cost(completion_response=response_obj)
        response = response_obj
        # tokens used in response 
        usage = response_obj["usage"]

        print(
            f"""
                Model: {model},
                Messages: {messages},
                User: {user},
                Usage: {usage},
                Cost: {cost},
                Response: {response}
                Proxy Metadata: {metadata}
            """
        )
        return

    async def async_log_failure_event(self, kwargs, response_obj, start_time, end_time): 
        try:
            print(f"On Async Failure !")
            print("\nkwargs", kwargs)
            # Access kwargs passed to litellm.completion()
            model = kwargs.get("model", None)
            messages = kwargs.get("messages", None)
            user = kwargs.get("user", None)

            # Access litellm_params passed to litellm.completion(), example access `metadata`
            litellm_params = kwargs.get("litellm_params", {})
            metadata = litellm_params.get("metadata", {})   # headers passed to LiteLLM proxy, can be found here

            # Access Exceptions & Traceback
            exception_event = kwargs.get("exception", None)
            traceback_event = kwargs.get("traceback_exception", None)

            # Calculate cost using  litellm.completion_cost()
            cost = litellm.completion_cost(completion_response=response_obj)
            print("now checking response obj")
            
            print(
                f"""
                    Model: {model},
                    Messages: {messages},
                    User: {user},
                    Cost: {cost},
                    Response: {response_obj}
                    Proxy Metadata: {metadata}
                    Exception: {exception_event}
                    Traceback: {traceback_event}
                """
            )
        except Exception as e:
            print(f"Exception: {e}")

proxy_handler_instance = MyCustomHandler()

# Set litellm.callbacks = [proxy_handler_instance] on the proxy
```

#### 第 2 步 - 在 `config.yaml` 中传入你的自定义回调类

我们把**第 1 步**中定义的自定义回调类传入 config.yaml。
把 `callbacks` 设置为 `python_filename.logger_instance_name`

在下面的配置中，我们传入了

- python_filename: `custom_callbacks.py`
- logger_instance_name: `proxy_handler_instance`，即第 1 步中定义的实例名

`callbacks: custom_callbacks.proxy_handler_instance`

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}

litellm_settings:
  callbacks: custom_callbacks.proxy_handler_instance # sets litellm.callbacks = [proxy_handler_instance]

```

:::warning
点分路径必须指向第 1 步中创建的实例（`proxy_handler_instance = MyCustomHandler()`），而不是类。如果填了类名，代理加载配置时会直接报错，错误信息会指出是哪个条目以及它解析到了什么，因为只有 `CustomLogger` 实例会被分发。在加入该校验之前的版本中，写成类名的条目会正常启动却从不执行，既不报错也不输出日志
:::

#### 第 2b 步 - 从 S3/GCS 加载自定义回调（替代方案）

除了使用本地 Python 文件，你还可以直接从 S3 或 GCS 存储桶加载自定义回调。这对集中管理回调文件、或在容器化环境中部署时很有用。

**URL 格式**：
- **S3**：`s3://bucket-name/module_name.instance_name`
- **GCS**：`gcs://bucket-name/module_name.instance_name`

**示例 - 从 S3 加载**：

假设你的 S3 存储桶 `litellm-proxy` 中存有一个 `custom_callbacks.py` 文件，内容如下：

```python
# custom_callbacks.py (stored in S3)
from litellm.integrations.custom_logger import CustomLogger
import litellm

class MyCustomHandler(CustomLogger):
    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        print(f"Custom UI SSO callback executed!")
        # Your custom logic here
  
    async def async_log_failure_event(self, kwargs, response_obj, start_time, end_time): 
        print(f"Custom UI SSO failure callback!")
        # Your failure handling logic

# Instance that will be loaded by LiteLLM
custom_handler = MyCustomHandler()
```

**配置**：

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}

litellm_settings:
  callbacks: ["s3://litellm-proxy/custom_callbacks.custom_handler"]
```

**示例 - 从 GCS 加载**：

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}

litellm_settings:
  callbacks: ["gcs://my-gcs-bucket/custom_callbacks.custom_handler"]
```

**工作原理**：
1. LiteLLM 识别出 S3/GCS URL 前缀
2. 将 Python 文件下载到临时位置
3. 加载模块并取出指定的实例
4. 清理临时文件
5. 使用该回调实例记录日志

借助这种方式，你可以：
- 在多个代理实例间集中管理回调文件
- 在不同环境间共享回调
- 在云存储中对回调文件做版本管理

#### 第 2c 步 - 在 Helm/Kubernetes 中挂载自定义回调（替代方案）

使用 Helm 或 Kubernetes 部署时，可以用 `subPath` 把自定义回调 Python 文件与 `config.yaml` 一起挂载，避免覆盖整个配置目录。

**问题所在**：
把卷挂载到某个目录（例如 `/app/`）时，该目录下所有已有文件都会被隐藏，包括你的 `config.yaml`。

**解决方法**：
在 `volumeMounts` 中使用 `subPath`，逐个挂载文件而不覆盖整个目录。

**示例 - Helm values.yaml**：

```yaml
# values.yaml
volumes:
  - name: callback-files
    configMap:
      name: litellm-callback-files

volumeMounts:
  - name: callback-files
    mountPath: /app/custom_callbacks.py  # Mount to specific FILE path
    subPath: custom_callbacks.py         # Required to avoid overwriting directory
```

**用回调文件创建 ConfigMap**：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: litellm-callback-files
data:
  custom_callbacks.py: |
    from litellm.integrations.custom_logger import CustomLogger
    
    class MyCustomHandler(CustomLogger):
        async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
            print(f"Success! Model: {kwargs.get('model')}")
    
    proxy_handler_instance = MyCustomHandler()
```

**在 config.yaml 中引用**：

```yaml
litellm_settings:
  callbacks: custom_callbacks.proxy_handler_instance
```

**工作原理**：
1. `subPath` 参数让 Kubernetes 只挂载指定的那个文件
2. 这样 `custom_callbacks.py` 会与现有的 `config.yaml` 并排放在 `/app/` 下
3. LiteLLM 会自动在与配置文件相同的目录中找到回调文件
4. 不会有任何文件被覆盖或隐藏

**注意**：添加更多 `volumeMounts` 条目即可挂载多个回调文件，每个条目使用各自的 `subPath`。

#### 第 3 步 - 启动代理并发起测试请求

```shell
litellm --config proxy_config.yaml
```

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --data ' {
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "good morning good sir"
        }
    ],
    "user": "ishaan-app",
    "temperature": 0.2
    }'
```

#### 代理上的日志结果

```shell
On Success
    Model: {{openai_small}},
    Messages: [{'role': 'user', 'content': 'good morning good sir'}],
    User: ishaan-app,
    Usage: {'completion_tokens': 10, 'prompt_tokens': 11, 'total_tokens': 21},
    Cost: 1.42e-05,
    Response: {'id': 'chatcmpl-8S8avKJ1aVBg941y5xzGMSKrYCMvN', 'choices': [{'finish_reason': 'stop', 'index': 0, 'message': {'content': 'Good morning! How can I assist you today?', 'role': 'assistant'}}], 'created': 1701716913, 'model': '{{openai_small}}', 'object': 'chat.completion', 'system_fingerprint': None, 'usage': {'completion_tokens': 10, 'prompt_tokens': 11, 'total_tokens': 21}}
    Proxy Metadata: {'user_api_key': None, 'headers': Headers({'host': '0.0.0.0:4000', 'user-agent': 'curl/7.88.1', 'accept': '*/*', 'authorization': "Bearer $LITELLM_API_KEY", 'content-length': '199', 'content-type': 'application/x-www-form-urlencoded'}), 'model_group': '{{openai_small}}', 'deployment': 'gpt-5.6-luna-ModelID-gpt-5.6-luna'}
```

#### 记录代理请求对象、请求头与 URL

下面介绍如何获取每个请求发往代理的 `url`、`headers` 与请求体。

```python
class MyCustomHandler(CustomLogger):
    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        print(f"On Async Success!")

        litellm_params = kwargs.get("litellm_params", None)
        proxy_server_request = litellm_params.get("proxy_server_request")
        print(proxy_server_request)
```

**预期输出**

```shell
{
  "url": "http://testserver/chat/completions",
  "method": "POST",
  "headers": {
    "host": "testserver",
    "accept": "*/*",
    "accept-encoding": "gzip, deflate",
    "connection": "keep-alive",
    "user-agent": "testclient",
    "authorization": "Bearer None",
    "content-length": "105",
    "content-type": "application/json"
  },
  "body": {
    "model": "Azure OpenAI GPT-4 Canada",
    "messages": [
      {
        "role": "user",
        "content": "hi"
      }
    ],
    "max_tokens": 10
  }
}
```

#### 记录 config.yaml 中设置的 `model_info`

下面介绍如何记录代理 `config.yaml` 中设置的 `model_info`。有关 `model_info` 的设置方法，参见 [config.yaml](https://docs.litellm.ai/docs/proxy/configs)。

```python
class MyCustomHandler(CustomLogger):
    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        print(f"On Async Success!")

        litellm_params = kwargs.get("litellm_params", None)
        model_info = litellm_params.get("model_info")
        print(model_info)
```

**预期输出**

```python
{'mode': 'embedding', 'input_cost_per_token': 0.002}
```

##### 记录代理返回的响应

`/chat/completions` 和 `/embeddings` 的响应都可以通过 `response_obj` 获取。

**注意**：对于 `/chat/completions`，`stream=True` 流式与非流式响应都可以通过 `response_obj` 获取。

```python
class MyCustomHandler(CustomLogger):
    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        print(f"On Async Success!")
        print(response_obj)

```

**`/chat/completion` 的预期输出**（`stream` 与非流式响应均适用）

```python
ModelResponse(
    id='chatcmpl-8Tfu8GoMElwOZuj2JlHBhNHG01PPo',
    choices=[
        Choices(
            finish_reason='stop',
            index=0,
            message=Message(
                content='As an AI language model, I do not have a physical body and therefore do not possess any degree or educational qualifications. My knowledge and abilities come from the programming and algorithms that have been developed by my creators.',
                role='assistant'
            )
        )
    ],
    created=1702083284,
    model='chatgpt-v-2',
    object='chat.completion',
    system_fingerprint=None,
    usage=Usage(
        completion_tokens=42,
        prompt_tokens=5,
        total_tokens=47
    )
)
```

**`/embeddings` 的预期输出**

```python
{
    'model': 'ada',
    'data': [
        {
            'embedding': [
                -0.035126980394124985, -0.020624293014407158, -0.015343423001468182,
                -0.03980357199907303, -0.02750781551003456, 0.02111034281551838,
                -0.022069307044148445, -0.019442008808255196, -0.00955679826438427,
                -0.013143060728907585, 0.029583381488919258, -0.004725852981209755,
                -0.015198921784758568, -0.014069183729588985, 0.00897879246622324,
                0.01521205808967352,
                # ... (truncated for brevity)
            ]
        }
    ]
}
```

## 自定义回调 API [异步]

<Image 
  img={require('../../img/callback_api.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>将 LiteLLM 日志发送到自定义 API 端点</p>

<EnterpriseFeature />

| 属性       | 详情                                                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 描述    | 将 LLM 输入/输出记录到自定义 API 端点                                                                                                              |
| 记录的负载 | `List[StandardLoggingPayload]` LiteLLM 会把一组 [`StandardLoggingPayload` 对象](https://docs.litellm.ai/docs/proxy/logging_spec) 记录到你的端点 |



适用于以下场景：

- 想使用非 Python 语言编写的自定义回调
- 想让回调运行在另一个微服务上

#### 用法

1. 在 litellm config.yaml 中设置 `success_callback: ["generic_api"]`

```yaml showLineNumbers title="litellm config.yaml"
model_list:
  - model_name: openai/{{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  success_callback: ["generic_api"]
```

2. 为自定义 API 端点设置环境变量

| 环境变量                  | 详情                                                     | 是否必填             |
| ------------------------- | ----------------------------------------------------------- | -------------------- |
| `GENERIC_LOGGER_ENDPOINT` | 回调日志应发送到的端点与路由        | 必填                 |
| `GENERIC_LOGGER_HEADERS`  | 可选：设置发送到自定义 API 端点的请求头 | 否，可选 |

```shell showLineNumbers title=".env"
GENERIC_LOGGER_ENDPOINT="https://webhook-test.com/30343bc33591bc5e6dc44217ceae3e0a"


# Optional: Set headers to be sent to the custom API endpoint
GENERIC_LOGGER_HEADERS="Authorization=Bearer <your-api-key>"
# if multiple headers, separate by commas
GENERIC_LOGGER_HEADERS="Authorization=Bearer <your-api-key>,X-Custom-Header=custom-header-value"
```

3. 启动代理

```shell
litellm --config /path/to/config.yaml
```

4. 发起测试请求

```shell
curl -i --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --data '{
    "model": "openai/{{openai_large}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```



## Langsmith

1. 在 litellm config.yaml 中设置 `success_callback: ["langsmith"]`

如果你使用的是自托管（self-hosted）的 LangSmith 实例，可以设置 `LANGSMITH_BASE_URL` 环境变量指向你自己的实例。

```yaml
litellm_settings:
  success_callback: ["langsmith"]

environment_variables:
  LANGSMITH_API_KEY: "lsv2_pt_xxxxxxxx"
  LANGSMITH_PROJECT: "litellm-proxy"

  LANGSMITH_BASE_URL: "https://api.smith.langchain.com" # (Optional - only needed if you have a custom Langsmith instance)
```


2. 启动代理

```
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "Hello, Claude gm!"
        }
      ],
    }
'
```
完成后即可在 Langfuse 上看到你的日志
<Image img={require('../../img/langsmith_new.png')} />


## Arize AI

1. 在 litellm config.yaml 中设置 `success_callback: ["arize"]`

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["arize"]

environment_variables:
    ARIZE_SPACE_KEY: "d0*****"
    ARIZE_API_KEY: "141a****"
    ARIZE_ENDPOINT: "https://otlp.arize.com/v1" # OPTIONAL - your custom arize GRPC api endpoint
    ARIZE_HTTP_ENDPOINT: "https://otlp.arize.com/v1" # OPTIONAL - your custom arize HTTP api endpoint. Set either this or ARIZE_ENDPOINT
```

2. 启动代理

```
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "Hello, Claude gm!"
        }
      ],
    }
'
```
随后即可在 Arize 中看到你的日志。


## Langtrace

`langtrace` 回调会把 span 直接上报到 `https://app.langtrace.ai/api/trace`，并在 `x-api-key` 请求头中携带 `LANGTRACE_API_KEY`。如果使用自托管的 Langtrace，把 `LANGTRACE_API_HOST` 设为其基础 URL（例如 `https://langtrace.example.com`），回调就会上报到 `<host>/api/trace`。[Langtrace 页面](../observability/langtrace_integration)介绍的是 OpenTelemetry v2 导出器，那种方式会经由 collector 中转。

1. 在 litellm config.yaml 中设置 `callbacks: ["langtrace"]`

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["langtrace"]

environment_variables:
    LANGTRACE_API_KEY: "141a****"
```

2. 启动代理

```
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "Hello, Claude gm!"
        }
      ],
    }
'
```

## Galileo

[BETA]

在 [www.rungalileo.io](https://www.rungalileo.io/) 上记录 LLM 输入/输出

:::info

Beta 集成

:::

**必需的环境变量**

Galileo Cloud（app.galileo.ai）：

```bash
export GALILEO_API_KEY=""
export GALILEO_PROJECT_ID=""
export GALILEO_LOG_STREAM_ID=""  # optional
export GALILEO_BASE_URL="https://api.galileo.ai"  # optional, defaults when GALILEO_API_KEY is set
```

企业版 / 自托管 Observe：

```bash
export GALILEO_BASE_URL=""  # Replace 'console' with 'api' in your console URL (e.g. https://api.galileo.myenterprise.com)
export GALILEO_PROJECT_ID=""
export GALILEO_USERNAME=""
export GALILEO_PASSWORD=""
```

#### 快速上手

1. 添加到 Config.yaml

```yaml
model_list:
- litellm_params:
    api_base: https://exampleopenaiendpoint-production.up.railway.app/
    api_key: my-fake-key
    model: openai/my-fake-model
  model_name: fake-openai-endpoint

environment_variables:
  GALILEO_API_KEY: "os.environ/GALILEO_API_KEY"
  GALILEO_PROJECT_ID: "your-project-id"
  GALILEO_LOG_STREAM_ID: "your-log-stream-id"  # optional

litellm_settings:
  success_callback: ["galileo"] # 👈 KEY CHANGE
```

2. 启动代理

```
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ],
    }
'
```

🎉 到这里就完成了，你的日志会出现在 Galileo 仪表板上

## OpenMeter

使用 [OpenMeter](../observability/openmeter.md) 按 LLM API 用量向客户计费

**必需的环境变量**

```bash
# from https://openmeter.cloud
export OPENMETER_API_ENDPOINT="" # defaults to https://openmeter.cloud
export OPENMETER_API_KEY=""
```

##### 快速上手

1. 添加到 Config.yaml

```yaml
model_list:
- litellm_params:
    api_base: https://openai-function-calling-workers.tasslexyz.workers.dev/
    api_key: my-fake-key
    model: openai/my-fake-model
  model_name: fake-openai-endpoint

litellm_settings:
  success_callback: ["openmeter"] # 👈 KEY CHANGE
```

2. 启动代理

```
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ],
    }
'
```

<Image img={require('../../img/openmeter_img_2.png')} />

## DynamoDB

我们将通过 `--config` 设置

- `litellm.success_callback = ["dynamodb"]` 
- `litellm.dynamodb_table_name = "your-table-name"`

这会把所有成功的 LLM 调用记录到 DynamoDB

**第 1 步** 在 .env 中设置 AWS 凭证

```shell
AWS_ACCESS_KEY_ID = ""
AWS_SECRET_ACCESS_KEY = ""
AWS_REGION_NAME = ""
```

**第 2 步**：创建 `config.yaml` 文件并设置 `litellm_settings`：`success_callback`

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
litellm_settings:
  success_callback: ["dynamodb"]
  dynamodb_table_name: your-table-name
```

**第 3 步**：启动代理，发起测试请求

启动代理

```shell
litellm --config config.yaml --debug
```

测试请求

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "Azure OpenAI GPT-4 East",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

你的日志应该已经可以在 DynamoDB 中查看

#### 记录到 DynamoDB 的 /chat/completions 数据

```json
{
  "id": {
    "S": "chatcmpl-8W15J4480a3fAQ1yQaMgtsKJAicen"
  },
  "call_type": {
    "S": "acompletion"
  },
  "endTime": {
    "S": "2023-12-15 17:25:58.424118"
  },
  "messages": {
    "S": "[{'role': 'user', 'content': 'This is a test'}]"
  },
  "metadata": {
    "S": "{}"
  },
  "model": {
    "S": "{{openai_small}}"
  },
  "modelParameters": {
    "S": "{'temperature': 0.7, 'max_tokens': 100, 'user': 'ishaan-2'}"
  },
  "response": {
    "S": "ModelResponse(id='chatcmpl-8W15J4480a3fAQ1yQaMgtsKJAicen', choices=[Choices(finish_reason='stop', index=0, message=Message(content='Great! What can I assist you with?', role='assistant'))], created=1702641357, model='{{openai_small}}', object='chat.completion', system_fingerprint=None, usage=Usage(completion_tokens=9, prompt_tokens=11, total_tokens=20))"
  },
  "startTime": {
    "S": "2023-12-15 17:25:56.047035"
  },
  "usage": {
    "S": "Usage(completion_tokens=9, prompt_tokens=11, total_tokens=20)"
  },
  "user": {
    "S": "ishaan-2"
  }
}
```

#### 记录到 DynamoDB 的 /embeddings 数据

```json
{
  "id": {
    "S": "4dec8d4d-4817-472d-9fc6-c7a6153eb2ca"
  },
  "call_type": {
    "S": "aembedding"
  },
  "endTime": {
    "S": "2023-12-15 17:25:59.890261"
  },
  "messages": {
    "S": "['hi']"
  },
  "metadata": {
    "S": "{}"
  },
  "model": {
    "S": "text-embedding-ada-002"
  },
  "modelParameters": {
    "S": "{'user': 'ishaan-2'}"
  },
  "response": {
    "S": "EmbeddingResponse(model='text-embedding-ada-002-v2', data=[{'embedding': [-0.03503197431564331, -0.020601635798811913, -0.015375726856291294,"
  }
}
```

## Sentry

如果 API 调用失败（LLM/数据库），可以把这些失败记录到 Sentry：

**第 1 步** 安装 Sentry

```shell
uv add --upgrade sentry-sdk
```

**第 2 步**：保存你的 Sentry_DSN，并添加 `litellm_settings`：`failure_callback`

```shell
export SENTRY_DSN="your-sentry-dsn"
# Optional: Configure Sentry sampling rates
export SENTRY_API_SAMPLE_RATE="1.0"  # Controls what percentage of errors are sent (default: 1.0 = 100%)
export SENTRY_API_TRACE_RATE="1.0"   # Controls what percentage of transactions are sampled for performance monitoring (default: 1.0 = 100%)
export SENTRY_ENVIRONMENT="development" # Controls the Sentry Environment (default: production)
export SENTRY_SEND_DEFAULT_PII="true" # Sends user ids, emails, and key hashes to Sentry; secrets stay filtered (default: false, see /observability/sentry)
```

```yaml 
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
litellm_settings:
  # other settings
  failure_callback: ["sentry"]
general_settings: 
  database_url: "my-bad-url" # set a fake url to trigger a sentry exception
```

**第 3 步**：启动代理，发起测试请求

启动代理

```shell
litellm --config config.yaml --debug
```

测试请求

```
litellm --test
```

## Athina

[Athina](https://athina.ai/) 支持记录 LLM 输入/输出，用于监控、分析与可观测性。

我们通过 `--config` 设置 `litellm.success_callback = ["athina"]`，这会把所有成功的 LLM 调用记录到 Athina。

**第 1 步** 设置 Athina API 密钥

```shell
ATHINA_API_KEY = "your-athina-api-key"
```

**第 2 步**：创建 `config.yaml` 文件并设置 `litellm_settings`：`success_callback`

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
litellm_settings:
  success_callback: ["athina"]
```

**第 3 步**：启动代理，发起测试请求

启动代理

```shell
litellm --config config.yaml --debug
```

测试请求

```
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "which llm are you"
        }
    ]
    }'
```


{/* ## (BETA) Moderation with Azure Content Safety

Note: This page is for logging callbacks and this is a moderation service. Commenting until we found a better location for this.

[Azure Content-Safety](https://azure.microsoft.com/en-us/products/ai-services/ai-content-safety) is a Microsoft Azure service that provides content moderation APIs to detect potential offensive, harmful, or risky content in text.

We will use the `--config` to set `litellm.success_callback = ["azure_content_safety"]` this will moderate all LLM calls using Azure Content Safety.

**Step 0** Deploy Azure Content Safety

Deploy an Azure Content-Safety instance from the Azure Portal and get the `endpoint` and `key`.

**Step 1** Set Athina API key

```shell
AZURE_CONTENT_SAFETY_KEY = "<your-azure-content-safety-key>"
```

**Step 2**: Create a `config.yaml` file and set `litellm_settings`: `success_callback`

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
litellm_settings:
  callbacks: ["azure_content_safety"]
  azure_content_safety_params:
    endpoint: "<your-azure-content-safety-endpoint>"
    key: "os.environ/AZURE_CONTENT_SAFETY_KEY"
```

**Step 3**: Start the proxy, make a test request

Start proxy

```shell
litellm --config config.yaml --debug
```

Test Request

```
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
        "model": "{{openai_small}}",
        "messages": [
            {
                "role": "user",
                "content": "Hi, how are you?"
            }
        ]
    }'
```

An HTTP 400 error will be returned if the content is detected with a value greater than the threshold set in the `config.yaml`.
The details of the response will describe:

- The `source` : input text or llm generated text
- The `category` : the category of the content that triggered the moderation
- The `severity` : the severity from 0 to 10

**Step 4**: Customizing Azure Content Safety Thresholds

You can customize the thresholds for each category by setting the `thresholds` in the `config.yaml`

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
litellm_settings:
  callbacks: ["azure_content_safety"]
  azure_content_safety_params:
    endpoint: "<your-azure-content-safety-endpoint>"
    key: "os.environ/AZURE_CONTENT_SAFETY_KEY"
    thresholds:
      Hate: 6
      SelfHarm: 8
      Sexual: 6
      Violence: 4
```

:::info
`thresholds` are not required by default, but you can tune the values to your needs.
Default values is `4` for all categories
::: */}
