import Image from '@theme/IdealImage';

# 修改或拒绝传入请求

- 在代理发起 LLM API 调用之前修改数据
- 在发起 LLM API 调用之前或返回响应之前拒绝数据
- 对所有 OpenAI 端点调用强制要求 'user' 参数
- 按调用方在模型列表中隐藏模型

:::tip
**还不了解回调钩子**？请先阅读[回调指南](../observability/callbacks.md)，弄清 `async_pre_call_hook` 这类代理专属钩子与 `async_log_success_event` 这类通用日志钩子之间的区别。
:::

## 我该用哪个钩子？

| 钩子 | 适用场景 | 触发时机 |
|------|----------|--------------|
| `async_pre_call_hook` | 在请求发往模型之前修改传入请求 | LLM API 调用发出之前 |
| `async_moderation_hook` | 与 LLM API 调用并行地对输入执行检查 | 与 LLM API 调用并行 |
| `async_post_call_success_hook` | 修改返回给客户端的响应（非流式） | LLM API 调用成功后，针对非流式响应 |
| `async_post_call_failure_hook` | 转换返回给客户端的错误响应 | LLM API 调用失败后 |
| `async_post_call_streaming_hook` | 修改返回给客户端的响应（流式） | LLM API 调用成功后，针对流式响应 |
| `async_post_call_response_headers_hook` | 注入自定义 HTTP 响应头 | LLM API 调用之后（成功与失败均触发） |
| `async_filter_listed_models` | 按调用方在模型列表中隐藏模型 | 模型列表路由上、响应构建之前 |

完整示例见我们的[并行请求速率限制器](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/hooks/parallel_request_limiter.py)

## 快速上手

1. 在你的自定义处理器中添加一个新的 `async_pre_call_hook` 函数

这个函数会在 litellm 补全调用发起前一刻被触发，让你能够修改进入 litellm 调用的数据。[**查看代码**](https://github.com/BerriAI/litellm/blob/589a6ca863000ba8e92c897ba0f776796e7a5904/litellm/proxy/proxy_server.py#L1000)

```python
from litellm.integrations.custom_logger import CustomLogger
import litellm
from litellm.proxy.proxy_server import UserAPIKeyAuth, DualCache
from litellm.types.utils import ModelResponseStream
from typing import Any, AsyncGenerator, Optional, Literal

# This file includes the custom callbacks for LiteLLM Proxy
# Once defined, these can be passed in proxy_config.yaml
class MyCustomHandler(CustomLogger): # https://docs.litellm.ai/docs/observability/custom_callback#callback-class
    # Class variables or attributes
    def __init__(self):
        pass

    #### CALL HOOKS - proxy only #### 

    async def async_pre_call_hook(self, user_api_key_dict: UserAPIKeyAuth, cache: DualCache, data: dict, call_type: Literal[
            "completion",
            "text_completion",
            "embeddings",
            "image_generation",
            "moderation",
            "audio_transcription",
        ]): 
        data["model"] = "my-new-model"
        return data 

    async def async_post_call_failure_hook(
        self, 
        request_data: dict,
        original_exception: Exception, 
        user_api_key_dict: UserAPIKeyAuth,
        traceback_str: Optional[str] = None,
    ) -> Optional[HTTPException]:
        """
        Transform error responses sent to clients.
        
        Return an HTTPException to replace the original error with a user-friendly message.
        Return None to use the original exception.
        
        Example:
            if isinstance(original_exception, litellm.ContextWindowExceededError):
                return HTTPException(
                    status_code=400,
                    detail="Your prompt is too long. Please reduce the length and try again."
                )
            return None  # Use original exception
        """
        pass

    async def async_post_call_success_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        response,
    ):
        pass

    async def async_moderation_hook( # call made in parallel to llm api call
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        call_type: Literal["completion", "embeddings", "image_generation", "moderation", "audio_transcription"],
    ):
        pass

    async def async_post_call_streaming_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        response: str,
    ):
        pass

    async def async_post_call_streaming_iterator_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        response: Any,
        request_data: dict,
    ) -> AsyncGenerator[ModelResponseStream, None]:
        """
        Passes the entire stream to the guardrail

        This is useful for plugins that need to see the entire stream.
        """
        async for item in response:
            yield item

    async def async_post_call_response_headers_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        response: Any,
        request_headers: Optional[Dict[str, str]] = None,
    ) -> Optional[Dict[str, str]]:
        """
        Inject custom headers into HTTP response (runs for both success and failure).
        """
        return {"x-custom-header": "custom-value"}

proxy_handler_instance = MyCustomHandler()
```

最后一行很关键：`callbacks` 接受的是一个**实例**的点号路径，所以文件里必须创建出一个实例

2. 将该文件加入代理配置

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}

litellm_settings:
  callbacks: custom_callbacks.proxy_handler_instance # sets litellm.callbacks = [proxy_handler_instance]
```

:::warning
如果把 `callbacks` 指向类（`custom_callbacks.MyCustomHandler`）而不是实例，代理会在加载配置时直接失败，并在报错中指出是哪个条目、被解析成了什么。代理只分发 `CustomLogger` 实例；在加入这道校验之前的版本里，服务会正常启动、正常接管流量，而你的钩子永远不会执行，既没有报错，也没有任何日志
:::

3. 启动服务器并测试请求

```shell
$ litellm --config /path/to/config.yaml
```
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
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


## [BETA] *全新* async_moderation_hook 

与实际的 LLM API 调用并行执行内容审核检查。

继承 `CustomGuardrail` 并定义一个 `async_moderation_hook` 函数：

- 在 `guardrails:` 下注册防护栏（guardrail），并设置 `mode: during_call`。钩子必须接受 `data`、`user_api_key_dict` 与 `call_type` 三个参数；旧的两参数签名会在每次请求时抛出 `TypeError`。 
- 该函数与实际的 LLM API 调用并行执行。 
- 如果你的 `async_moderation_hook` 抛出了异常，我们会把该异常返回给用户。 

完整示例见我们的 [Llama Guard 内容审核钩子](https://github.com/BerriAI/litellm/blob/main/enterprise/enterprise_hooks/llm_guard.py)与[自定义防护栏文档](./guardrails/custom_guardrail.md)

```python
from litellm.integrations.custom_guardrail import CustomGuardrail
from litellm.proxy._types import UserAPIKeyAuth
from litellm.types.utils import CallTypesLiteral
from fastapi import HTTPException

class MyCustomGuardrail(CustomGuardrail):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    async def async_moderation_hook( ### 👈 KEY CHANGE ###
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        call_type: CallTypesLiteral,
    ):
        messages = data["messages"]
        print(messages)
        if messages[0]["content"] == "hello world": 
            raise HTTPException(
                    status_code=400, detail={"error": "Violated content safety policy"}
                )
```


2. 将该文件加入代理配置

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}

guardrails:
  - guardrail_name: "my-moderation-guardrail"
    litellm_params:
      guardrail: custom_guardrail.MyCustomGuardrail # {file_name}.{class_name}
      mode: "during_call"
      default_on: true
```

3. 启动服务器并测试请求

```shell
$ litellm --config /path/to/config.yaml
```
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --data ' {
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "Hello world"
        }
    ],
    }'
```

## 进阶：强制要求 'user' 参数 

将 `enforce_user_param` 设为 true，要求所有对 OpenAI 端点的调用都必须携带 'user' 参数。 

[**查看代码**](https://github.com/BerriAI/litellm/blob/4777921a31c4c70e4d87b927cb233b6a09cd8b51/litellm/proxy/auth/auth_checks.py#L72)

```yaml
general_settings:
  enforce_user_param: True
```

**结果**

<Image img={require('../../img/end_user_enforcement.png')}/>

## 进阶：将拒绝消息作为响应返回 

对于对话补全和文本补全调用，你可以把一条拒绝消息作为响应直接返回给用户。 

做法是返回一个字符串。LiteLLM 会根据端点类型以及是否流式，自动以正确的格式返回响应。

对于非对话/文本补全端点，这条响应会以 400 状态码异常的形式返回。 


### 1. 创建自定义处理器 

```python
from litellm.integrations.custom_logger import CustomLogger
import litellm
from litellm.utils import get_formatted_prompt

# This file includes the custom callbacks for LiteLLM Proxy
# Once defined, these can be passed in proxy_config.yaml
class MyCustomHandler(CustomLogger):
    def __init__(self):
        pass

    #### CALL HOOKS - proxy only #### 

    async def async_pre_call_hook(self, user_api_key_dict: UserAPIKeyAuth, cache: DualCache, data: dict, call_type: Literal[
            "completion",
            "text_completion",
            "embeddings",
            "image_generation",
            "moderation",
            "audio_transcription",
        ]) -> Optional[dict, str, Exception]: 
        formatted_prompt = get_formatted_prompt(data=data, call_type=call_type)

        if "Hello world" in formatted_prompt:
            return "This is an invalid response"

        return data 

proxy_handler_instance = MyCustomHandler()
```

### 2. 更新 config.yaml 

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}

litellm_settings:
  callbacks: custom_callbacks.proxy_handler_instance # sets litellm.callbacks = [proxy_handler_instance]
```


### 3. 测试一下

```shell
$ litellm --config /path/to/config.yaml
```
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --data ' {
    "model": "{{openai_small}}",
    "messages": [
        {
        "role": "user",
        "content": "Hello world"
        }
    ],
    }'
```

**预期响应**

```
{
    "id": "chatcmpl-d00bbede-2d90-4618-bf7b-11a1c23cf360",
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": "This is an invalid response.", # 👈 REJECTED RESPONSE
                "role": "assistant"
            }
        }
    ],
    "created": 1716234198,
    "model": null,
    "object": "chat.completion",
    "system_fingerprint": null,
    "usage": {}
}
```

## 进阶：转换错误响应

用 `async_post_call_failure_hook` 把技术性的 API 错误转换成对用户友好的消息。返回一个 `HTTPException` 即可替换原始错误；返回 `None` 则沿用原始异常。

```python
from litellm.integrations.custom_logger import CustomLogger
from fastapi import HTTPException
from typing import Optional
import litellm

class MyErrorTransformer(CustomLogger):
    async def async_post_call_failure_hook(
        self,
        request_data: dict,
        original_exception: Exception,
        user_api_key_dict: UserAPIKeyAuth,
        traceback_str: Optional[str] = None,
    ) -> Optional[HTTPException]:
        if isinstance(original_exception, litellm.ContextWindowExceededError):
            return HTTPException(
                status_code=400,
                detail="Your prompt is too long. Please reduce the length and try again."
            )
        if isinstance(original_exception, litellm.RateLimitError):
            return HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again in a moment."
            )
        return None  # Use original exception

proxy_handler_instance = MyErrorTransformer()
```

**结果**：客户端收到的是 `"Your prompt is too long..."`，而不是 `"ContextWindowExceededError: Prompt exceeds context window"`。

## 进阶：注入自定义 HTTP 响应头

用 `async_post_call_response_headers_hook` 向响应中注入自定义 HTTP 头。无论 LLM API 调用**成功还是失败**，这个钩子都会执行。

```python
from litellm.integrations.custom_logger import CustomLogger
from litellm.proxy.proxy_server import UserAPIKeyAuth
from typing import Any, Dict, Optional

class CustomHeaderLogger(CustomLogger):
    def __init__(self):
        super().__init__()

    async def async_post_call_response_headers_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        response: Any,
        request_headers: Optional[Dict[str, str]] = None,
    ) -> Optional[Dict[str, str]]:
        """
        Inject custom headers into all responses (success and failure).
        """
        return {"x-custom-header": "custom-value"}

proxy_handler_instance = CustomHeaderLogger()
```

## 进阶：在模型列表中隐藏模型

`async_pre_call_hook` 可以在请求时拒绝某个模型，但该模型仍会出现在 `GET /v1/models` 中，客户端的模型选择器于是会列出那些要等到请求时才以 403 失败的条目。`async_filter_listed_models` 正是补上这个缺口的：它运行在模型列表路由上，拿到调用方本可以看到的模型名单，并返回应保留的子集。随 [PR #43027](https://github.com/BerriAI/litellm/pull/43027) 发布

```python
async def async_filter_listed_models(
    self,
    user_api_key_dict: UserAPIKeyAuth,
    model_names: Sequence[str],
) -> Sequence[str]:
    return model_names
```

没有出现在返回值里的模型名会从所有列表中消失，而查询单个模型的路由会表现得像这个模型根本不存在一样

| 路由 | 隐藏后的表现 |
|-------|--------------|
| `GET /v1/models`, `GET /models` | 不再列出 |
| `GET /v1/models/{model_id}`, `GET /models/{model_id}` | 404，与模型不存在时一致 |
| `GET /model/info`, `GET /v1/model/info` | 不再列出 |
| `GET /model/info?litellm_model_id=<id>` | 400，与部署 id 不存在时一致 |
| `GET /model_group/info` | 不再列出，`a2a/<agent>` 模型组也在隐藏之列 |

`/v1/models` 的过滤对 OpenAI 与 Anthropic 两种响应格式同样生效，也覆盖 `?scope=expand`。`/v2/model/info` 与 auto-router 相关路由不受影响，推理调用同样不受影响。知道隐藏模型名的调用方仍然可以直接调用它，除非 `async_pre_call_hook` 拒绝了请求，因此请像下面的示例那样把两个钩子搭配使用

钩子拿到的是调用方本可以看到的公开模型名，因此团队模型会以公开名传入，而不是内部路由名。密钥别名与团队别名永远不会传入；它们在过滤之后才追加，且只会解析到过滤后保留下来的目标。Router 中 `model_group_alias` 的目标若被隐藏，别名本身也会随之隐藏。返回值里那些未被传入的名字会被忽略，传入的顺序保持不变，因此回调只能收窄列表，不能扩大

这个钩子对所有调用方都会执行，代理管理员也不例外。`user_api_key_dict` 会告诉回调发起请求的是谁（`user_role`、`team_id`、`user_id` 等），如果管理员应当照常看到全部模型，就在回调里为其放行。多个已注册回调都覆写了这个钩子时，它们按注册顺序依次执行，每个回调看到的都是上一个回调保留的结果，因此一个名字必须在所有回调中幸存才会留下。未覆写该钩子的回调不会被调用；若没有任何回调覆写它，列表路由的行为与从前完全一致

返回值必须是字符串序列。裸字符串、`None` 或其他任何类型都会让代理抛出 `TypeError`，并在报错中指明是哪个回调类，而不是悄悄清空列表（否则裸字符串会被逐字符遍历）。钩子内部抛出的异常会向上传播给调用方，因此权限服务出问题时会大声失败，而不是把完整列表泄漏出去。每次列表请求中每个回调都会被 await 一次，权限查询如果开销大，列表响应就会随之变慢；这种情况下可以在回调内部缓存查询结果

### 1. 创建自定义处理器

`gate.py` 把请求时的拒绝与列表过滤组合在一起，被隐藏的模型既不会出现在列表里，也无法被调用

```python
from collections.abc import Sequence

from fastapi import HTTPException
from litellm.integrations.custom_logger import CustomLogger
from litellm.proxy._types import UserAPIKeyAuth

RESTRICTED = {"restricted-model"}


class Gate(CustomLogger):
    async def async_pre_call_hook(self, user_api_key_dict, cache, data, call_type):
        if data.get("model") in RESTRICTED:
            raise HTTPException(status_code=403, detail="not entitled to this model")
        return data

    async def async_filter_listed_models(
        self, user_api_key_dict: UserAPIKeyAuth, model_names: Sequence[str]
    ) -> Sequence[str]:
        return [name for name in model_names if name not in RESTRICTED]


gate = Gate()
```

### 2. 更新 config.yaml

```yaml
model_list:
  - model_name: open-model
    litellm_params:
      model: {{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: restricted-model
    litellm_params:
      model: {{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: gate.gate # sets litellm.callbacks = [gate]

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 3. 测试一下

```shell
$ litellm --config /path/to/config.yaml
```

主密钥（master key）就是代理管理员的身份，而这个示例对它也隐藏了 `restricted-model`，因为钩子对所有调用方都会执行

```shell
curl -s http://0.0.0.0:4000/v1/models \
    -H "Authorization: Bearer $LITELLM_MASTER_KEY" | jq "[.data[].id]"
```

**预期响应**

```
["open-model"]
```

按 id 获取被隐藏的模型会返回 404，与模型不存在时的表现一致

```shell
curl -s http://0.0.0.0:4000/v1/models/restricted-model \
    -H "Authorization: Bearer $LITELLM_MASTER_KEY"
```

```
{"detail":"The model `restricted-model` does not exist or is not accessible"}
```
