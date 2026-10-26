---
title: "回退机制（提供商故障转移）"
description: "在 LiteLLM 中配置自动提供商故障转移。若模型或提供商在 num_retries 次重试后仍失败，则回退到另一个模型组，实现高可用与可靠性。"
keywords:
  [
    fallbacks,
    failover,
    provider failover,
    model failover,
    automatic failover,
    high availability,
    reliability,
    retries,
    backup model,
    cross-provider failover,
  ]
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 回退机制（提供商故障转移）

回退机制（fallbacks）是 LiteLLM 实现自动**故障转移**（failover）的方式。某次调用在 num_retries 次重试后仍然失败时，LiteLLM 会回退到另一个模型组，让出故障的模型或提供商自动切换到健康的备用目标。如果你要找的是 "provider failover" 或 "model failover"，看这一页就够了。

- 快速上手：[负载均衡](./load_balancing.md)
- 快速上手：[客户端侧回退](#客户端侧回退)


回退通常是从一个 `model_name` 切换到另一个 `model_name`。

## 快速上手

### 1. 配置回退

关键改动：

```python
fallbacks=[{"{{openai_small}}": ["{{openai_large}}"]}]
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python keep-model-ids
from litellm import Router 
router = Router(
  model_list=[
    {
      "model_name": "{{openai_small}}",
      "litellm_params": {
        "model": "azure/<your-deployment-name>",
        "api_base": "<your-azure-endpoint>",
        "api_key": "<your-azure-api-key>",
        "rpm": 6
      }
    },
    {
      "model_name": "{{openai_large}}",
      "litellm_params": {
        "model": "azure/gpt-4-ca",
        "api_base": "https://my-endpoint-canada-berri992.openai.azure.com/",
        "api_key": "<your-azure-api-key>",
        "rpm": 6
      }
    }
  ],
  fallbacks=[{"{{openai_small}}": ["{{openai_large}}"]}] # 👈 KEY CHANGE
)

```

</TabItem>
<TabItem value="proxy" label="PROXY">


```yaml keep-model-ids
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/<your-deployment-name>
      api_base: <your-azure-endpoint>
      api_key: <your-azure-api-key>
      rpm: 6      # Rate limit for this deployment: in requests per minute (rpm)
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/gpt-4-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: <your-azure-api-key>
      rpm: 6

router_settings:
  fallbacks: [{"{{openai_small}}": ["{{openai_large}}"]}]
```


</TabItem>
</Tabs>


### 2. 启动代理服务器

```bash
litellm --config /path/to/config.yaml
```

### 3. 测试回退

:::warning[代理请求中已弃用]
从 LiteLLM 代理 v1.85.0 起，`mock_testing_fallbacks`、`mock_testing_context_fallbacks` 和 `mock_testing_content_policy_fallbacks` 会从传入代理的请求中剥离，不再产生任何效果。这些标志仅在测试中直接调用 `litellm.Router` 时继续受支持。
:::

直接测试 `Router` 时，传入 `mock_testing_fallbacks=True` 即可触发回退。

<Tabs>
<TabItem value="sdk" label="SDK">


```python

from litellm import Router

model_list = [{...}, {...}] # defined in Step 1.

router = Router(model_list=model_list, fallbacks=[{"bad-model": ["my-good-model"]}])

response = router.completion(
  model="bad-model",
  messages=[{"role": "user", "content": "Hey, how's it going?"}],
  mock_testing_fallbacks=True,
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

这些 mock 测试标志在代理请求中已弃用。要验证代理的回退行为，请在非生产环境中触发一次真实的提供商错误，然后发送不带 `mock_testing_*` 标志的普通请求。

</TabItem>
</Tabs>




### 工作原理 {#explanation}

回退按顺序执行：例如 ["gpt-4o-mini", "gpt-4o", "gpt-4.1"] 会先请求 'gpt-4o-mini'，再请求 'gpt-4o'，依此类推。

也可以设置 [`default_fallbacks`](#默认回退)，以防某个模型组配置有误或不可用。

回退分为 3 类：
- `content_policy_fallbacks`：对应 litellm.ContentPolicyViolationError，LiteLLM 会在各提供商之间映射内容政策违规错误 [**查看代码**](https://github.com/BerriAI/litellm/blob/89a43c872a1e3084519fb9de159bf52f5447c6c4/litellm/utils.py#L8495C27-L8495C54)
- `context_window_fallbacks`：对应 litellm.ContextWindowExceededErrors，LiteLLM 会在各提供商之间映射上下文窗口超限的错误信息 [**查看代码**](https://github.com/BerriAI/litellm/blob/89a43c872a1e3084519fb9de159bf52f5447c6c4/litellm/utils.py#L8469)
- `fallbacks`：对应其余所有错误，例如 litellm.RateLimitError

回退到另一提供商或另一 API 密钥上的部署时，无法解密先前失败部署在前几轮生成的加密推理内容（即客户端通过 `include: ["reasoning.encrypted_content"]` 重放的 Responses API 推理项，或 `/v1/messages` 对话中的思考块）。回退会丢弃目标无法解密的部分，并保留每个 Responses 推理项的可读摘要（思考块则整块丢弃），因此回退目标会在该轮重新推理并给出回答，而不是因 `invalid_encrypted_content` 而失败。每一类回退都会经过这一处理：上面三种回退类型、同一模型组内部各部署之间的[基于顺序的回退](./load_balancing.md#基于-order-的回退如何工作)，以及流式传输中途断开后的回退。此行为没有按部署单独关闭的开关。对于由两个提供商组成的有序组，还应开启 [`encrypted_content_affinity`](../response_api.md#源部署无法承接该轮请求时)：它会为每个推理项标记生成它的部署，这样当 `order: 1` 处于冷却期、请求直接派发给 `order: 2` 时（未发生回退，也就不会剥离），推理内容同样会被丢弃；而回退后的那一轮会保留实际应答部署的推理内容，不必先白白消耗一次失败调用。

## 客户端侧回退

在 SDK 的 `.completion()` 调用中、以及发往代理的客户端请求中设置回退。

这次请求将发生以下过程：
1. 对 `model="zephyr-beta"` 的请求会失败
2. LiteLLM 代理会遍历 `fallbacks=["{{openai_small}}"]` 中指定的所有模型组
3. 对 `model="{{openai_small}}"` 的请求会成功，发起请求的客户端将收到来自 gpt-5.6-luna 的响应

👉 关键改动：`"fallbacks": ["{{openai_small}}"]`

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router

router = Router(model_list=[...]) # defined in Step 1.

resp = router.completion(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Hey, how's it going?"}],
    mock_testing_fallbacks=True, # 👈 trigger fallbacks
    fallbacks=[
        {
            "model": "{{anthropic}}",
            "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        }
    ],
)

print(resp)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="zephyr-beta",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
        "fallbacks": ["{{openai_small}}"]
    }
)

print(response)
```
</TabItem>

<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "zephyr-beta",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "fallbacks": ["{{openai_small}}"]
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

os.environ["OPENAI_API_KEY"] = "anything"

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model="zephyr-beta",
    extra_body={
        "fallbacks": ["{{openai_small}}"]
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
</TabItem>

</Tabs>

### 控制回退请求的提示词

可以为回退中的每个模型单独传入 messages、temperature 等参数（同样适用于嵌入、图像生成等场景）。

关键改动：

```
fallbacks = [
  {
    "model": <model_name>,
    "messages": <model-specific-messages>
    ... # any other model-specific parameters
  }
]
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router

router = Router(model_list=[...]) # defined in Step 1.

resp = router.completion(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Hey, how's it going?"}],
    mock_testing_fallbacks=True, # 👈 trigger fallbacks
    fallbacks=[
        {
            "model": "{{anthropic}}",
            "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        }
    ],
)

print(resp)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="zephyr-beta",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
      "fallbacks": [{
          "model": "{{anthropic}}",
          "messages": [{"role": "user", "content": "What is LiteLLM?"}]
      }]
    }
)

print(response)
```
</TabItem>

<TabItem value="Curl" label="Curl 请求">

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_small}}",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "Hi, how are you ?"
          }
        ]
      }
    ],
    "fallbacks": [{
        "model": "{{anthropic}}",
        "messages": [{"role": "user", "content": "What is LiteLLM?"}]
    }]
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

os.environ["OPENAI_API_KEY"] = "anything"

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model="zephyr-beta",
    extra_body={
      "fallbacks": [{
          "model": "{{anthropic}}",
          "messages": [{"role": "user", "content": "What is LiteLLM?"}]
      }]
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

</TabItem>
</Tabs>

## 内容政策违规回退

关键改动：

```python
content_policy_fallbacks=[{"{{anthropic}}": ["my-fallback-model"]}]
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router 

router = Router(
  model_list=[
    {
      "model_name": "{{anthropic}}",
      "litellm_params": {
        "model": "{{anthropic}}",
        "api_key": "",
        "mock_response": Exception("content filtering policy"),
      },
    },
    {
      "model_name": "my-fallback-model",
      "litellm_params": {
        "model": "{{anthropic}}",
        "api_key": "",
        "mock_response": "This works!",
      },
    },
  ],
  content_policy_fallbacks=[{"{{anthropic}}": ["my-fallback-model"]}], # 👈 KEY CHANGE
  # fallbacks=[..], # [OPTIONAL]
  # context_window_fallbacks=[..], # [OPTIONAL]
)

response = router.completion(
  model="{{anthropic}}",
  messages=[{"role": "user", "content": "Hey, how's it going?"}],
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

在代理的 config.yaml 中加上这一行 👇

```yaml
router_settings:
  content_policy_fallbacks: [{"{{anthropic}}": ["my-fallback-model"]}]
```

启动代理服务器

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

</TabItem>
</Tabs>

## 上下文窗口超限回退

关键改动：

```python
context_window_fallbacks=[{"{{anthropic}}": ["my-fallback-model"]}]
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router 

router = Router(
  model_list=[
    {
      "model_name": "{{anthropic}}",
      "litellm_params": {
        "model": "{{anthropic}}",
        "api_key": "",
        "mock_response": Exception("prompt is too long"),
      },
    },
    {
      "model_name": "my-fallback-model",
      "litellm_params": {
        "model": "{{anthropic}}",
        "api_key": "",
        "mock_response": "This works!",
      },
    },
  ],
  context_window_fallbacks=[{"{{anthropic}}": ["my-fallback-model"]}], # 👈 KEY CHANGE
  # fallbacks=[..], # [OPTIONAL]
  # content_policy_fallbacks=[..], # [OPTIONAL]
)

response = router.completion(
  model="{{anthropic}}",
  messages=[{"role": "user", "content": "Hey, how's it going?"}],
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

在代理的 config.yaml 中加上这一行 👇

```yaml
router_settings:
  context_window_fallbacks: [{"{{anthropic}}": ["my-fallback-model"]}]
```

启动代理服务器

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

</TabItem>
</Tabs>

## 进阶用法
### 回退、重试、超时与冷却

设置回退只需：

```
litellm_settings:
  fallbacks: [{"zephyr-beta": ["{{openai_small}}"]}] 
```

**覆盖所有错误**（429、500 等）

**通过 config 设置**
```yaml
model_list:
  - model_name: zephyr-beta
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8001
  - model_name: zephyr-beta
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8002
  - model_name: zephyr-beta
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8003
  - model_name: {{openai_small}}
    litellm_params:
        model: {{openai_small}}
        api_key: <my-openai-key>
  - model_name: {{openai_large}}
    litellm_params:
        model: {{openai_large}}
        api_key: <my-openai-key>

litellm_settings:
  num_retries: 3 # retry call 3 times on each model_name (e.g. zephyr-beta)
  request_timeout: 10 # raise Timeout error if call takes longer than 10s. Sets litellm.request_timeout 
  fallbacks: [{"zephyr-beta": ["{{openai_small}}"]}] # fallback to {{openai_small}} if call fails num_retries 
  allowed_fails: 3 # cooldown model if it fails > 1 call in a minute. 
  cooldown_time: 30 # how long to cooldown model if fails/min > allowed_fails
```

### 回退到指定模型 ID

如果模型组中的所有模型都处于冷却状态（例如被限流），LiteLLM 会回退到具有指定模型 ID 的那个模型。

这条路径会跳过回退模型的一切冷却检查。

1. 在 `model_info` 中指定模型 ID
```yaml keep-model-ids
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
    model_info:
      id: my-specific-model-id # 👈 KEY CHANGE
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
  - model_name: anthropic-claude
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
```

**注意**：这只会回退到具有该指定模型 ID 的模型。如果你想回退到另一个模型组，可以设置 `fallbacks=[{"{{openai_large}}": ["anthropic-claude"]}]`

2. 在配置中设置回退

```yaml
litellm_settings:
  fallbacks: [{"{{openai_large}}": ["my-specific-model-id"]}]
```

3. 在主部署不可用时进行测试。

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "{{openai_large}}",
  "messages": [
    {
      "role": "user",
      "content": "ping"
    }
  ]
}'
```

通过检查响应头 `x-litellm-model-id` 来验证是否生效

```bash
x-litellm-model-id: my-specific-model-id
```

### 测试回退

在非生产环境中触发相应的提供商错误，检查回退是否按预期工作。

#### **常规回退**

让主测试部署返回一个可重试的提供商错误（如限流或服务器错误），然后发送一条普通请求。


#### **内容策略回退**

使用一条会被主提供商以内容策略错误拒绝的测试请求。

#### **上下文窗口回退** {#context-window-fallbacks}

开启调用前检查（pre-call checks），并发送一条超出主模型所配上下文窗口的测试请求。


### 在花费日志中追踪回退

每条花费日志都会记录该请求是由客户端请求的模型组服务，还是由某次回退服务。代理会在 `LiteLLM_SpendLogs` 表的 `metadata` 列中写入两个键：

| 键 | 类型 | 说明 |
|-----|------|-------------|
| `attempted_fallbacks` | int | 已执行的回退尝试次数。`0` 表示由所请求的模型组直接服务 |
| `original_model_group` | str | 客户端最初请求的模型组 |

例如，一条发往 `{{openai_small}}` 但故障转移到 `claude-fable-5` 的请求会产生一行 `model_group=claude-fable-5`、`attempted_fallbacks=1`、`original_model_group={{openai_small}}` 的记录，因此事后仍能区分由回退服务的请求与直接服务的请求：

```sql
SELECT model_group,
       metadata->>'attempted_fallbacks' AS attempted_fallbacks,
       metadata->>'original_model_group' AS original_model_group
FROM "LiteLLM_SpendLogs";
```

这两个键都由代理写入，并覆盖客户端提供的同名值。在该功能上线之前写入的行，这两个键读到的都是 `null`。

### 上下文窗口回退（调用前检查与回退）

**在发起调用之前**，通过 **`enable_pre_call_checks: true`** 检查调用是否在模型上下文窗口之内。

[**查看代码**](https://github.com/BerriAI/litellm/blob/c9e6b05cfb20dfb17272218e2555d6b496c47f6f/litellm/router.py#L2163)

:::important
要强制执行上下文窗口限制，**必须设置 `enable_pre_call_checks`**。没有它，无论输入多少 token，请求都会被直接发给提供商。请在配置的 `router_settings` 中设置 `enable_pre_call_checks: true`。
:::

#### 为每个部署自定义 max_input_tokens

在 `model_info` 中设置 `max_input_tokens`，即可覆盖某个部署的默认上下文上限。这在测试、限制过长的提示词，或要施加比提供商默认值更严格的限制时很有用。

以下两项**缺一不可**：

1. **`router_settings.enable_pre_call_checks: true`**，用于启用调用前检查
2. 该部署上的 **`model_info.max_input_tokens`**，用于覆盖该模型的限额

```yaml
router_settings:
  enable_pre_call_checks: true  # Required for enforcement

model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      max_input_tokens: 10  # Override: reject prompts > 10 tokens
```

如果请求超出限额，LiteLLM 会抛出 `ContextWindowExceededError`，详情形如 `Model={{openai_large}}, Max Input Tokens=10, Got=306`。

**1. 设置配置**

对于 Azure 部署，需要设置基础模型。基础模型可从[这份列表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)中选取，所有 Azure 模型都以 azure/ 开头。


<Tabs>
<TabItem value="same-group" label="同一模型组">

筛选出同一模型（如 gpt-4o-mini）中上下文窗口较小的实例

本例中的模型 ID 仅为示意，保留它们是为了体现各自上下文窗口的大小。

```yaml keep-model-ids
router_settings:
  enable_pre_call_checks: true # 1. Enable pre-call checks

model_list:
  - model_name: gpt-4o-mini
    litellm_params:
    model: azure/chatgpt-v-2
    api_base: os.environ/AZURE_API_BASE
    api_key: os.environ/AZURE_API_KEY
    api_version: "2023-07-01-preview"
    model_info:
    base_model: azure/gpt-4.1 # 2. 👈 (azure-only) SET BASE MODEL

  - model_name: gpt-4o-mini
    litellm_params:
    model: gpt-4o-mini
    api_key: os.environ/OPENAI_API_KEY
```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**3. 测试一下**

```python keep-model-ids
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

text = "What is the meaning of 42?" * 25000

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages = [
      {"role": "system", "content": text},
      {"role": "user", "content": "Who was Alexander?"},
    ],
)

print(response)
```

</TabItem>

<TabItem value="different-group" label="上下文窗口回退（跨模型组）">

当前模型的上下文窗口太小、装不下请求时，回退到更大的模型。

本例中的模型 ID 仅为示意，保留它们是为了体现各自上下文窗口的大小。

```yaml keep-model-ids
router_settings:
  enable_pre_call_checks: true # 1. Enable pre-call checks

model_list:
  - model_name: gpt-3.5-turbo-small
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
    model_info:
      base_model: azure/gpt-4o # 2. 👈 (azure-only) SET BASE MODEL

  - model_name: gpt-3.5-turbo-large
    litellm_params:
      model: gpt-4.1
      api_key: os.environ/OPENAI_API_KEY

  - model_name: claude-opus
    litellm_params:
      model: claude-opus-4-6
      api_key: os.environ/ANTHROPIC_API_KEY

litellm_settings:
  context_window_fallbacks: [{"gpt-3.5-turbo-small": ["gpt-3.5-turbo-large", "claude-opus"]}]
```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**3. 测试一下**

```python keep-model-ids
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

text = "What is the meaning of 42?" * 25000

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-3.5-turbo-small",
    messages = [
      {"role": "system", "content": text},
      {"role": "user", "content": "Who was Alexander?"},
    ],
)

print(response)
```

</TabItem>
</Tabs>


### 内容策略回退

遇到内容策略违规错误时，可以跨提供商回退（例如从 Azure OpenAI 回退到 Anthropic）。

```yaml keep-model-ids
model_list:
    - model_name: gpt-3.5-turbo-small
      litellm_params:
        model: azure/chatgpt-v-2
        api_base: os.environ/AZURE_API_BASE
        api_key: os.environ/AZURE_API_KEY
        api_version: "2023-07-01-preview"

    - model_name: claude-opus
      litellm_params:
        model: {{anthropic_large}}
        api_key: os.environ/ANTHROPIC_API_KEY

litellm_settings:
  content_policy_fallbacks: [{"gpt-3.5-turbo-small": ["claude-opus"]}]
```



### 默认回退

还可以设置 default_fallbacks，以防某个模型组配置错误或不可用。


```yaml keep-model-ids
model_list:
    - model_name: gpt-3.5-turbo-small
      litellm_params:
        model: azure/chatgpt-v-2
        api_base: os.environ/AZURE_API_BASE
        api_key: os.environ/AZURE_API_KEY
        api_version: "2023-07-01-preview"

    - model_name: claude-opus
      litellm_params:
        model: {{anthropic_large}}
        api_key: os.environ/ANTHROPIC_API_KEY

litellm_settings:
  default_fallbacks: ["claude-opus"]
```

这样，任何模型失败时都会默认回退到 claude-opus。

模型专属的回退配置（如 `{"gpt-3.5-turbo-small": ["claude-opus"]}`）会覆盖默认回退。

### 欧盟区域过滤（调用前检查）

**在发起调用之前**，通过 **`enable_pre_call_checks: true`** 检查调用是否在模型上下文窗口之内。

为部署设置 'region_name'。

**注意**：LiteLLM 能根据你的 litellm 参数自动推断 Vertex AI、Bedrock 和 IBM WatsonxAI 的 region_name。Azure 则需设置 `litellm.enable_preview = True`。

**1. 设置配置**

```yaml keep-model-ids
router_settings:
  enable_pre_call_checks: true # 1. Enable pre-call checks

model_list:
- model_name: {{openai_small}}
  litellm_params:
    model: azure/chatgpt-v-2
    api_base: os.environ/AZURE_API_BASE
    api_key: os.environ/AZURE_API_KEY
    api_version: "2023-07-01-preview"
    region_name: "eu" # 👈 SET EU-REGION

- model_name: {{openai_small}}
  litellm_params:
    model: {{openai_small}}
    api_key: os.environ/OPENAI_API_KEY

- model_name: {{gemini_flash}}
  litellm_params:
    model: vertex_ai/{{gemini_flash}}
    vertex_project: adroit-crow-1234
    vertex_location: us-east1 # 👈 AUTOMATICALLY INFERS 'region_name'
```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**3. 测试一下**

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.with_raw_response.create(
    model="{{openai_small}}",
    messages = [{"role": "user", "content": "Who was Alexander?"}]
)

print(response)

print(response.headers.get('x-litellm-model-api-base'))
```

### 为通配模型设置回退

可以在配置文件中为通配模型（如 `azure/*`）设置回退。

1. 设置配置
```yaml
model_list:
  - model_name: "{{openai_large}}"
    litellm_params:
      model: "openai/{{openai_large}}"
      api_key: os.environ/OPENAI_API_KEY
  - model_name: "azure/*"
    litellm_params:
      model: "azure/*"
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE

litellm_settings:
  fallbacks: [{"{{openai_large}}": ["azure/{{openai_large}}"]}]
```

2. 启动代理
```bash
litellm --config /path/to/config.yaml
```

3. 在主部署不可用时进行测试。

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_large}}",
    "messages": [
      {
        "role": "user",
        "content": [    
          {
            "type": "text",
            "text": "what color is red"
          }
        ]
      }
    ],
    "max_tokens": 300
}'
```

#### 裸模型名的提供商前缀回退键

像 `{{anthropic}}` 这样的裸模型名请求（Claude Code 发出的就是这种形式）会由 `anthropic/*` 部署服务，回退查找时会把请求模型与按该通配写法书写的键（`anthropic/{{anthropic}}`）相匹配。LiteLLM 推断提供商的方式与路由一致，且只有当某个回退键以 `/<model name>` 结尾时才会尝试这种匹配，因此解析不出提供商的别名仍会落到 `*`。优先级为：精确键最先，其次是同义键（裸名的 `<provider>/<model>` 写法，或带前缀名的裸写法），最后是 `*`；`fallbacks`、`context_window_fallbacks` 与 `content_policy_fallbacks` 走的是同一套查找逻辑。匹配到的链是终态的：一旦选中 `anthropic/{{anthropic}}` 这条链，其目标全部失败后不会再尝试 `*`，所以如果 `*` 的目标也应执行，就把它们列在这条链的末尾。该功能在 [PR #43062](https://github.com/BerriAI/litellm/pull/43062) 中引入，即将随下一个 release candidate 发布

```yaml
model_list:
  - model_name: "anthropic/*"
    litellm_params:
      model: "anthropic/*"
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: "openai/{{openai_large}}"
    litellm_params:
      model: "openai/{{openai_large}}"
      api_key: os.environ/OPENAI_API_KEY
  - model_name: "{{openai_small}}"
    litellm_params:
      model: "openai/{{openai_small}}"
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  fallbacks:
    - {"anthropic/{{anthropic}}": ["openai/{{openai_large}}", "{{openai_small}}"]}
    - {"*": ["{{openai_small}}"]}
```

发往 `{{anthropic}}` 的请求在 `anthropic/*` 上失败后，会在 `openai/{{openai_large}}` 上重试，再尝试 `{{openai_small}}`；而其他没有专属键的裸模型名请求则直接落到 `*`

### 回退时强制执行密钥的模型访问权限

默认情况下，`router_settings` 中配置的回退会对每个请求生效，即使发起调用的密钥本无权直接调用回退模型。一个仅限 `gpt-5.6` 访问组的密钥，只要 `gpt-5.6` 失败且其回退目标是 `{{anthropic}}`，就仍能从 `{{anthropic}}` 拿到响应。

设置 `general_settings.enforce_fallback_model_access: true` 后，在尝试每个回退目标之前，都会对该目标执行与密钥、团队和项目相同的模型访问检查。调用方无权使用的目标会被跳过；如果不再有任何有权限的目标，调用方会拿到主模型自身的错误。有权调用回退模型的密钥仍照常回退，且该检查覆盖 `fallbacks`、`context_window_fallbacks`、`content_policy_fallbacks` 和 `default_fallbacks`。

```yaml keep-model-ids
model_list:
  - model_name: gpt-5.6
    litellm_params:
      model: openai/gpt-5.6
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      access_groups: ["openai-only"]
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

router_settings:
  fallbacks:
    - gpt-5.6: ["{{anthropic}}"]

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  enforce_fallback_model_access: true
```

以 `"models": ["openai-only"]` 创建的密钥可以调用 `gpt-5.6`，但不能调用 `{{anthropic}}`。开启该开关后，该密钥发出的失败 `gpt-5.6` 请求会返回 OpenAI 的错误，而不是 `{{anthropic}}` 的补全，响应中也不带 `x-litellm-attempted-fallbacks` 头。以 `"models": ["openai-only", "{{anthropic}}"]` 创建的密钥则仍会回退。

不携带虚拟密钥（virtual key）的请求（例如代理自身的健康检查）不受任何限制。如果访问查询本身失败，回退会被跳过，而不是被放行。

### 回退时强制执行预算

预算只在请求通过身份验证时，针对调用方请求的那个模型检查一次，而回退目标是之后才选定的，因此这一次检查本身看不到实际计费的模型。这在主模型定价为零时影响最大：零成本模型完全不受预算检查约束，如果没有第二次检查，发往它的请求会被放行，回退到付费模型后全额计费，且不受任何上限约束。

代理会在尝试每个回退目标之前，重新核对调用密钥和用户的预算，因此这一行为无需任何配置。超出预算的目标会被跳过；如果不再有预算允许的目标，调用方会拿到主模型自身的错误。主模型尝试本身永远不会被拦截，所以零成本模型在达到上限时仍能继续使用，零成本的回退目标也总是被允许。该检查覆盖 `fallbacks`、`context_window_fallbacks`、`content_policy_fallbacks` 和 `default_fallbacks`。

```yaml keep-model-ids
model_list:
  - model_name: free-model
    litellm_params:
      model: ollama/llama2
      api_base: http://localhost:11434
      input_cost_per_token: 0
      output_cost_per_token: 0
    model_info:
      input_cost_per_token: 0
      output_cost_per_token: 0
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

router_settings:
  fallbacks:
    - free-model: ["{{anthropic}}"]

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

花费已超出 `max_budget` 的用户仍然可以调用 `free-model` 且分文不付。一旦 `free-model` 失败，该用户会拿到 `free-model` 的错误，而不是计费的 `{{anthropic}}` 补全，响应中也不带 `x-litellm-attempted-fallbacks` 头。预算未超的用户则照常回退到 `{{anthropic}}`。

要关闭这一行为、让回退无视调用方预算照常执行，请设置 `enforce_fallback_budget: false`：

```yaml
general_settings:
  enforce_fallback_budget: false
```

除非设置了 `general_settings.apply_user_budget_to_team_keys`，否则团队密钥不会继承密钥所有者的个人 `max_budget`，这与个人预算在其他场景下的执行方式一致。不携带虚拟密钥的请求（例如代理自身的健康检查）不受任何限制。如果花费查询本身失败，回退会被跳过，而不是被放行。

### 禁用回退（按请求/按密钥）


<Tabs>

<TabItem value="request" label="按请求">

在请求体中设置 `disable_fallbacks: true`，即可按请求禁用回退。

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "messages": [
        {
            "role": "user",
            "content": "List 5 important events in the XIX century"
        }
    ],
    "model": "{{openai_small}}",
    "disable_fallbacks": true
}'
```

</TabItem>

<TabItem value="key" label="按密钥">

在密钥元数据中设置 `disable_fallbacks: true`，即可按密钥禁用回退。

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "disable_fallbacks": true
    }
}'
```

</TabItem>
</Tabs>

这两种方式都会覆盖代理本应为该请求执行的所有回退，流中回退也不例外：在 `/chat/completions`、`/v1/messages` 或 `/v1/responses` 上，若所选部署的流在首个分块之前就失败，请求会返回该部署自身的错误，而不是某个回退部署的响应
