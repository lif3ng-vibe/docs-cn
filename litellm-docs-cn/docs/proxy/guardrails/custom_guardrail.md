import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 自定义防护栏

如果你想通过自己写代码来运行一个自定义防护栏（custom guardrail），就适用本页内容。

## 快速上手

### 1. 编写 `CustomGuardrail` 类 {#1-write-a-customguardrail-class}

你只需要实现一个方法：`apply_guardrail`。LiteLLM 会从请求（或响应）中抽出内容，以 `inputs` 的形式交给你，再把你返回的内容写回去。抛出异常即可阻断这次调用。

**`CustomGuardrail` 类示例**

新建一个名为 `custom_guardrail.py` 的文件，加入以下代码：

```python
import os
from typing import TYPE_CHECKING, List, Literal, Optional

from litellm.integrations.custom_guardrail import CustomGuardrail
from litellm.llms.custom_httpx.http_handler import (
    get_async_httpx_client,
    httpxSpecialProvider,
)
from litellm.types.utils import GenericGuardrailAPIInputs

if TYPE_CHECKING:
    from litellm.litellm_core_utils.litellm_logging import Logging as LiteLLMLoggingObj


class myCustomGuardrail(CustomGuardrail):
    def __init__(self, api_key: Optional[str] = None, api_base: Optional[str] = None, **kwargs):
        self.api_key = api_key or os.getenv("MY_GUARDRAIL_API_KEY")
        self.api_base = api_base or os.getenv("MY_GUARDRAIL_API_BASE", "https://api.myguardrail.com")
        super().__init__(**kwargs)

    async def apply_guardrail(
        self,
        inputs: GenericGuardrailAPIInputs,
        request_data: dict,
        input_type: Literal["request", "response"],
        logging_obj: Optional["LiteLLMLoggingObj"] = None,
    ) -> GenericGuardrailAPIInputs:
        """
        Check the extracted content against your guardrail rules.
        Raise an exception to block the call.
        Return the inputs (optionally modified) to allow it through.
        """
        checked_texts: List[str] = []
        for text in inputs.get("texts") or []:
            result = await self._check_with_api(text, request_data)

            if result.get("action") == "BLOCK":
                raise Exception(f"Content blocked: {result.get('reason', 'Policy violation')}")

            checked_texts.append(result.get("masked_text") or text)

        inputs["texts"] = checked_texts
        return inputs

    async def _check_with_api(self, text: str, request_data: dict) -> dict:
        async_client = get_async_httpx_client(llm_provider=httpxSpecialProvider.LoggingCallback)

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

        response = await async_client.post(
            f"{self.api_base}/check",
            headers=headers,
            json={"text": text},
            timeout=5,
        )

        response.raise_for_status()
        return response.json()
```

### `apply_guardrail` 参数

| 参数 | 说明 |
|-----------|------------|
| `inputs` | LiteLLM 从这次调用中抽取的全部内容，键见下表。 |
| `request_data` | 请求体。`request_data["metadata"]` 里带着调用方信息，如 `user_api_key_user_id`、`user_api_key_team_id` 等。 |
| `input_type` | 请求方向为 `"request"`，响应方向为 `"response"`，一个类即可同时处理两个方向。 |
| `logging_obj` | 这次调用的 LiteLLM 日志对象，如果你想附加自己的元数据，会用到它。 |

`inputs` 里的每个键都是可选的，你只会拿到这次调用实际包含的键：

| 键 | 内容 |
|-----|--------------|
| `texts` | 待检查的文本，大多数防护栏用的就是这个。 |
| `images` | 请求中的图片，base64 或 URL 形式。 |
| `tools` | 发给 LLM 的工具定义。 |
| `tool_calls` | LLM 发起的工具调用。 |
| `structured_messages` | OpenAI 格式的完整消息列表，可据此区分系统消息与用户消息。 |
| `model` | 这次调用路由到的模型。 |

**要放行调用，原样返回 `inputs`**；要脱敏，就地修改 `texts` 或 `tool_calls`，LiteLLM 会把它们映射回原始请求或响应。

`structured_messages` 是个例外：**请换成一个新的列表**。LiteLLM 只在收到不同的对象时才会采用它，就地修改会被忽略。

流式场景下还可以设置 `stream_holdback_chars`，即每段文本需要由 LiteLLM 扣留的末尾字符数，避免命中内容被拆进两个分片。

:::tip[进阶：使用独立事件钩子]

如果需要更细粒度的控制，可以不实现（或在实现 `apply_guardrail` 之外另行实现）独立事件钩子：

- `async_pre_call_hook` - 在发起 LLM API 调用前修改输入或拒绝请求
- `async_moderation_hook` - 拒绝请求，与 LLM API 调用并行执行（有助于降低延迟）
- `async_post_call_success_hook` - 在输入/输出上应用防护栏，于 LLM API 调用完成后执行
- `async_post_call_streaming_iterator_hook` - 把整个流交给防护栏处理

**[独立事件钩子的示例见这里](#进阶独立事件钩子)**|**[各方法的详细说明见这里](#customguardrail-方法)**

:::

### 2. 在 LiteLLM `config.yaml` 中传入自定义防护栏类

在下面的配置中，通过设置 `guardrail: custom_guardrail.myCustomGuardrail`，把防护栏指向我们的自定义实现。

- Python 文件名：`custom_guardrail.py`
- 防护栏类名：`myCustomGuardrail`，即步骤 1 中定义的类

`guardrail: custom_guardrail.myCustomGuardrail`

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "my-custom-guardrail"
    litellm_params:
      guardrail: custom_guardrail.myCustomGuardrail  # 👈 Key change
      mode: "pre_call"                  # when apply_guardrail runs - see Mode Options below
      api_key: os.environ/MY_GUARDRAIL_API_KEY
      api_base: https://api.myguardrail.com
```

:::info[模式选项]

`apply_guardrail` 在三种模式下都会运行。模式决定它*何时*运行，以及它看到的是请求还是响应。

| 模式 | 运行时机 | `input_type` | 能否脱敏？ |
|------|------|--------------|--------------|
| `pre_call` | LLM 调用之前 | `"request"` | 是 |
| `during_call` | 与 LLM 调用同时进行 | `"request"` | 仅能阻断，见下文 |
| `post_call` | LLM 响应之后 | `"response"` | 是 |

**要脱敏或改写内容，请用 `pre_call`**。`during_call` 让防护栏与 LLM 调用并行执行以节省延迟，因此它可以可靠地*阻断*违规请求，但你的修改未必赶在请求发出前生效。

如果你改用独立事件钩子，同样这三种模式会分别调用 `async_pre_call_hook`、`async_moderation_hook` 和 `async_post_call_success_hook`。

:::

:::note[流式与 post_call 防护栏]

对于**流式响应**，`post_call` 防护栏要等所有分片**都**送达客户端之后，才会对拼接完成的响应运行。这使得流式场景下的 `post_call` 防护栏**只能用于审计**：可以检查并记录完整响应，但无法拦截内容下发。防护栏结果会记录在日志负载的 `guardrail_information` 字段里，供合规与审计使用。

要实时过滤或阻断流式内容，请改用 `async_post_call_streaming_iterator_hook`，它会在分片到达时逐个处理。

实现了 `apply_guardrail` 的内置防护栏（例如 [Bedrock](./bedrock#流式处理)）在流式场景下采用相反的默认行为：LiteLLM 会缓冲每个分片，直到拼接完成的响应通过内容审核，因此阻断会发生在任何内容到达客户端之前。在这类防护栏上设置 `streaming_buffer_until_moderated: false` 并搭配 `streaming_end_of_stream_only: true`，即可得到上文所述的仅审计行为，且不会增加首 token 延迟。

:::

<details>
<summary>进阶：用独立事件钩子配置多种模式</summary>

使用独立事件钩子时，可以配置多个不同模式的防护栏：

```yaml
guardrails:
  - guardrail_name: "custom-pre-guard"
    litellm_params:
      guardrail: custom_guardrail.myCustomGuardrail
      mode: "pre_call"                  # runs async_pre_call_hook
  - guardrail_name: "custom-during-guard"
    litellm_params:
      guardrail: custom_guardrail.myCustomGuardrail  
      mode: "during_call"               # runs async_moderation_hook
  - guardrail_name: "custom-post-guard"
    litellm_params:
      guardrail: custom_guardrail.myCustomGuardrail
      mode: "post_call"                 # runs async_post_call_success_hook
```

</details>

### 3. 启动 LiteLLM 网关

<Tabs>
<TabItem value="docker" label="Docker 运行">

把你的 `custom_guardrail.py` 挂载进 LiteLLM 的 Docker 容器。

这条命令会把本地目录中的 `custom_guardrail.py` 挂载到 Docker 容器的 `/app` 目录，让 LiteLLM 网关能够读取它。


```shell
docker run -d \
  -p 4000:4000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  --name my-app \
  -v $(pwd)/my_config.yaml:/app/config.yaml \
  -v $(pwd)/custom_guardrail.py:/app/custom_guardrail.py \
  my-app:latest \
  --config /app/config.yaml \
  --port 4000 \
  --detailed_debug \
```

</TabItem>

<TabItem value="py" label="litellm pip">


```shell
litellm --config config.yaml --detailed_debug
```

</TabItem>

</Tabs>

### 4. 测试

**[Langchain 与 OpenAI SDK 用法示例](/docs/proxy/user_keys#请求格式)**

<Tabs>
<TabItem label="被阻断的请求" value = "blocked">

若请求违反防护栏策略，将被阻断：

```shell
curl -i -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_large}}",
    "messages": [
        {
            "role": "user",
            "content": "Content that violates policy"
        }
    ],
   "guardrails": ["my-custom-guardrail"]
}'
```

被阻断时的预期响应：

```json
{
  "error": {
    "message": "Content blocked: Policy violation",
    "type": "None",
    "param": "None",
    "code": "500"
  }
}
```

</TabItem>

<TabItem label="成功调用" value = "allowed">

这个请求可以通过防护栏：

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "What is the weather like today?"}
    ],
    "guardrails": ["my-custom-guardrail"]
  }'
```

</TabItem>

</Tabs>

<details>
<summary>进阶：测试独立事件钩子</summary>

使用独立事件钩子时，可以分别测试每种模式：

#### 测试 `"custom-pre-guard"`

<Tabs>
<TabItem label="修改输入" value = "not-allowed">

预期在请求发给 LLM API 之前，`litellm` 一词会被脱敏。[这里运行的是 `async_pre_call_hook`](#进阶独立事件钩子)

```shell
curl -i  -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_large}}",
    "messages": [
        {
            "role": "user",
            "content": "say the word - `litellm`"
        }
    ],
   "guardrails": ["custom-pre-guard"]
}'
```

</TabItem>

<TabItem label="成功调用" value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["custom-pre-guard"]
  }'
```

</TabItem>

</Tabs>

#### 测试 `"custom-during-guard"`

<Tabs>
<TabItem label="调用失败" value = "not-allowed">

预期这次调用会失败，因为消息内容中包含 `litellm`。[这里运行的是 `async_moderation_hook`](#进阶独立事件钩子)

```shell
curl -i  -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_large}}",
    "messages": [
        {
            "role": "user",
            "content": "say the word - `litellm`"
        }
    ],
   "guardrails": ["custom-during-guard"]
}'
```

预期响应：

```json
{
  "error": {
    "message": "Guardrail failed words - `litellm` detected",
    "type": "None",
    "param": "None",
    "code": "500"
  }
}
```

</TabItem>

<TabItem label="成功调用" value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["custom-during-guard"]
  }'
```

</TabItem>

</Tabs>

#### 测试 `"custom-post-guard"`

<Tabs>
<TabItem label="调用失败" value = "not-allowed">

预期这次调用会失败，因为响应内容中会出现 `coffee`。[这里运行的是 `async_post_call_success_hook`](#进阶独立事件钩子)

```shell
curl -i  -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_large}}",
    "messages": [
        {
            "role": "user",
            "content": "what is coffee"
        }
    ],
   "guardrails": ["custom-post-guard"]
}'
```

预期响应：

```json
{
  "error": {
    "message": "Guardrail failed Coffee Detected",
    "type": "None",
    "param": "None",
    "code": "500"
  }
}
```

</TabItem>

<TabItem label="成功调用" value = "allowed">

```shell
curl -i  -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_large}}",
    "messages": [
        {
            "role": "user",
            "content": "what is tea"
        }
    ],
   "guardrails": ["custom-post-guard"]
}'
```

</TabItem>

</Tabs>

</details>

## ✨ 向防护栏传递额外参数

<EnterpriseFeature />

用于在向防护栏 API 发起调用时传递额外参数，例如成功阈值之类的配置。

1. 使用 `get_guardrail_dynamic_request_body_params`

`get_guardrail_dynamic_request_body_params` 是 `litellm.integrations.custom_guardrail.CustomGuardrail` 类上的方法，用于取回请求体中传入的动态防护栏参数。

```python
from typing import Any, Dict, List, Literal, Optional, Union
import litellm
from litellm._logging import verbose_proxy_logger
from litellm.caching.caching import DualCache
from litellm.integrations.custom_guardrail import CustomGuardrail
from litellm.proxy._types import UserAPIKeyAuth

class myCustomGuardrail(CustomGuardrail):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    async def async_pre_call_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        cache: DualCache,
        data: dict,
        call_type: Literal[
            "completion",
            "text_completion",
            "embeddings",
            "image_generation",
            "moderation",
            "audio_transcription",
            "pass_through_endpoint",
            "rerank"
        ],
    ) -> Optional[Union[Exception, str, dict]]:
        # Get dynamic params from request body
        params = self.get_guardrail_dynamic_request_body_params(request_data=data)
        # params will contain: {"success_threshold": 0.9}
        verbose_proxy_logger.debug("Guardrail params: %s", params)
        return data
```

2. 在 API 请求中传参：

LiteLLM Proxy 允许在请求体中传入 `guardrails`，遵循 [`guardrails` 规范](/docs/proxy/guardrails/quick_start#guardrails-请求参数)。要给某个防护栏附加 `extra_body`，请将 `guardrails` 写成列表，并把防护栏写成以 `guardrail_name` 为键的对象。

<Tabs>
<TabItem value="openai" label="OpenAI Python">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Write a short poem"}],
    extra_body={
        "guardrails": [
            {
                "custom-pre-guard": {
                    "extra_body": {
                        "success_threshold": 0.9
                    }
                }
            }
        ]
    }
)
```
</TabItem>

<TabItem value="curl" label="Curl">

```shell
curl 'http://0.0.0.0:4000/chat/completions' \
    -H 'Content-Type: application/json' \
    -d '{
    "model": "{{openai_large}}",
    "messages": [
        {
            "role": "user",
            "content": "Write a short poem"
        }
    ],
    "guardrails": [
        {
            "custom-pre-guard": {
                "extra_body": {
                    "success_threshold": 0.9
                }
            }
        }
    ]
}'
```
</TabItem>
</Tabs>

`get_guardrail_dynamic_request_body_params` 方法会返回：
```json
{
    "success_threshold": 0.9
}
```

## 进阶：独立事件钩子

优点：更灵活。
缺点：你需要为每种 LLM 调用类型（对话补全、文本补全、嵌入、图像生成、内容审核、语音转写、透传端点、重排序等）分别实现一遍。

如果想更细粒度地控制防护栏何时运行、如何运行，可以实现独立事件钩子。它给你带来这些灵活性：
- 在 LLM 调用前修改输入
- 与 LLM 调用并行执行检查（更低延迟）
- 在 LLM 调用后校验或修改输出
- 处理流式响应

### 独立事件钩子示例

```python
from typing import Any, AsyncGenerator, Literal, Optional, Union

import litellm
from litellm._logging import verbose_proxy_logger
from litellm.caching.caching import DualCache
from litellm.integrations.custom_guardrail import CustomGuardrail
from litellm.proxy._types import UserAPIKeyAuth
from litellm.types.utils import ModelResponseStream, CallTypes


class myCustomGuardrail(CustomGuardrail):
    def __init__(
        self,
        **kwargs,
    ):
        # store kwargs as optional_params
        self.optional_params = kwargs

        super().__init__(**kwargs)

    async def async_pre_call_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        cache: DualCache,
        data: dict,
        call_type: Optional[CallTypes],
    ) -> Optional[Union[Exception, str, dict]]:
        """
        Runs before the LLM API call
        Runs on only Input
        Use this if you want to MODIFY the input
        """

        # In this guardrail, if a user inputs `litellm` we will mask it and then send it to the LLM
        _messages = data.get("messages")
        if _messages:
            for message in _messages:
                _content = message.get("content")
                if isinstance(_content, str):
                    if "litellm" in _content.lower():
                        _content = _content.replace("litellm", "********")
                        message["content"] = _content

        verbose_proxy_logger.debug(
            "async_pre_call_hook: Message after masking %s", _messages
        )

        return data

    async def async_moderation_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        call_type: Literal["completion", "embeddings", "image_generation", "moderation", "audio_transcription"],
    ):
        """
        Runs in parallel to LLM API call
        Runs on only Input

        This can NOT modify the input, only used to reject or accept a call before going to LLM API
        """

        # this works the same as async_pre_call_hook, but just runs in parallel as the LLM API Call
        # In this guardrail, if a user inputs `litellm` we will mask it.
        _messages = data.get("messages")
        if _messages:
            for message in _messages:
                _content = message.get("content")
                if isinstance(_content, str):
                    if "litellm" in _content.lower():
                        raise ValueError("Guardrail failed words - `litellm` detected")

    async def async_post_call_success_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        response,
    ):
        """
        Runs on response from LLM API call

        It can be used to reject a response

        If a response contains the word "coffee" -> we will raise an exception
        """
        verbose_proxy_logger.debug("async_pre_call_hook response: %s", response)
        if isinstance(response, litellm.ModelResponse):
            for choice in response.choices:
                if isinstance(choice, litellm.Choices):
                    verbose_proxy_logger.debug("async_pre_call_hook choice: %s", choice)
                    if (
                        choice.message.content
                        and isinstance(choice.message.content, str)
                        and "coffee" in choice.message.content
                    ):
                        raise ValueError("Guardrail failed Coffee Detected")

    async def async_post_call_streaming_iterator_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        response: Any,
        request_data: dict,
    ) -> AsyncGenerator[ModelResponseStream, None]:
        """
        Passes the entire stream to the guardrail

        This is useful for guardrails that need to see the entire response, such as PII masking.

        See Aim guardrail implementation for an example - https://github.com/BerriAI/litellm/blob/d0e022cfacb8e9ebc5409bb652059b6fd97b45c0/litellm/proxy/guardrails/guardrail_hooks/aim.py#L168

        Triggered by mode: 'post_call'
        """
        async for item in response:
            yield item

```

## **CustomGuardrail 方法**

| 组件 | 说明 | 可选 | 检查的数据 | 可修改输入 | 可修改输出 | 可中断调用 |
|-----------|-------------|----------|--------------|------------------|-------------------|----------------|
| `apply_guardrail` | 单一方法，检查并按需修改抽取出的输入，请求与响应均适用 | ✅ | 输入或输出 | ✅ | ✅ | ✅ |
| `async_pre_call_hook` | 在 LLM API 调用前运行的钩子 | ✅ | 输入 | ✅ | ❌ | ✅ |
| `async_moderation_hook` | 在 LLM API 调用期间运行的钩子 | ✅ | 输入 | ❌ | ❌ | ✅ |
| `async_post_call_success_hook` | 在 LLM API 调用成功后运行的钩子。流式场景下，在内容送达后对拼接完成的响应运行（仅审计，无法阻断）。 | ✅ | 输入、输出 | ❌ | ✅ | ✅（仅非流式） |
| `async_post_call_streaming_iterator_hook` | 实时处理流式响应的钩子（可过滤/阻断分片） | ✅ | 输出 | ❌ | ✅ | ✅ |


## 常见问题

**问：`apply_guardrail` 在请求和响应两个方向都适用吗（pre_call、during_call 和 post_call 钩子）？**

**答**：是的，同一个函数两个方向都能用。实现见[这里](https://github.com/BerriAI/litellm/blob/0292b84dc47473ddeff29bd5a86f529bc523034b/litellm/proxy/utils.py#L825)。

**问：`apply_guardrail` 的 `inputs` 里能拿到什么？每个字段分别代表什么？**

**答**：见上文[参数参考](#apply_guardrail-参数)。最该先关注的是 `inputs["texts"]`，即你会发给自己 API 做校验的抽取文本。实现见[这里](https://github.com/BerriAI/litellm/blob/main/litellm/llms/anthropic/chat/guardrail_translation/handler.py)。

**问：这个函数与 LLM 提供商无关吗？也就是说，对 OpenAI 和 Anthropic 传入的值是一样的吗？**

**答**：是

**问：怎么知道我的防护栏有没有在运行？**

**答**：如果你实现的是 `apply_guardrail`，可以通过 [`/apply_guardrail` API](../../apply_guardrail) 直接查询防护栏。
