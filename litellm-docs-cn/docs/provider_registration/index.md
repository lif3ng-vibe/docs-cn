---
title: "作为模型提供商接入"
---

## OpenAI 兼容提供商快速上手

如果你的 API 与 OpenAI 兼容，只需编辑一个 JSON 文件即可添加支持。简单做法参见[添加 OpenAI 兼容提供商](/docs/contributing/adding_openai_compatible_providers)。

---

本指南聚焦的是：要作为一个对话提供商（chat provider）工作，需要搭建哪些类与配置。

请先读完本指南，再看代码库中的现有实现，就能明白如何支持其他类型的提供商，例如处理嵌入（embeddings）或图像生成。

---

### 概述

从提供商的视角看，liteLLM 的工作方式很简单。

liteLLM 扮演的是一个包装器（wrapper）：它接收 OpenAI 风格的请求并路由到你的 API，再把你的输出转换成标准输出。

要以提供商身份接入，你需要编写一个模块，接入 API 体系，充当 liteLLM API 与你的 API 之间的适配器。

你要写的这个模块既是一份配置，也负责请求与响应的适配。

你的目标是把这个模块写到位：把输入适配成你的 API 能接受的格式，再把输出适配回调用方的 liteLLM 代码。

其中包括这样一些方法：

- 校验请求
- 把请求转换（适配）成发往你 API 的请求
- 把你 API 返回的响应转换（适配）回给调用方 liteLLM 代码的响应
- \+ 还有若干其他方法

---

### 1. 创建配置类

用你的提供商名称新建一个目录

#### `litellm/llms/your_provider_name_here`

在这个目录里，为你的对话配置添加一个文件

#### `litellm/llms/your_provider_name_here/chat/transformation.py`

`transformation.py` 文件里放一个配置类，由它决定你的 API 如何嵌入 liteLLM API。

定义你的配置类（config class），继承 `BaseConfig`：

```python
from litellm.llms.base_llm.chat.transformation import BaseConfig

class MyProviderChatConfig(BaseConfig):
    def __init__(self):
        ...
```

抽象方法稍后再来填充。

---

### 2. 在代码库的多处登记自己

liteLLM 正在改进这一流程，但目前你需要做的是下面这些：

#### `litellm/__init__.py`

在文件顶部，把你的 key 作为一项加入密钥列表

```py
azure_key: Optional[str] = None
anthropic_key: Optional[str] = None
replicate_key: Optional[str] = None
bytez_key: Optional[str] = None
cohere_key: Optional[str] = None
infinity_key: Optional[str] = None
clarifai_key: Optional[str] = None
```

导入你的配置

```
from .llms.bytez.chat.transformation import BytezChatConfig
from .llms.custom_llm import CustomLLM
from .llms.bedrock.chat.converse_transformation import AmazonConverseConfig
from .llms.openai_like.chat.handler import OpenAILikeChatConfig
```

#### `litellm/main.py`

把你加入 `main.py`，让请求能够路由到你的配置类

```py
from .llms.bedrock.chat import BedrockConverseLLM, BedrockLLM
from .llms.bedrock.embed.embedding import BedrockEmbedding
from .llms.bedrock.image.image_handler import BedrockImageGeneration
from .llms.bytez.chat.transformation import BytezChatConfig
from .llms.codestral.completion.handler import CodestralTextCompletion
from .llms.cohere.embed import handler as cohere_embed
from .llms.custom_httpx.aiohttp_handler import BaseLLMAIOHTTPHandler

base_llm_http_handler = BaseLLMHTTPHandler()
base_llm_aiohttp_handler = BaseLLMAIOHTTPHandler()
sagemaker_chat_completion = SagemakerChatHandler()
bytez_transformation = BytezChatConfig()
```

然后在代码更靠下的位置

```py nolint
elif custom_llm_provider == "bytez":
    api_key = (
        api_key
        or litellm.bytez_key
        or get_secret_str("BYTEZ_API_KEY")
        or litellm.api_key
    )

    response = base_llm_http_handler.completion(
        model=model,
        messages=messages,
        headers=headers,
        model_response=model_response,
        api_key=api_key,
        api_base=api_base,
        acompletion=acompletion,
        logging_obj=logging,
        optional_params=optional_params,
        litellm_params=litellm_params,
        timeout=timeout,  # type: ignore
        client=client,
        custom_llm_provider=custom_llm_provider,
        encoding=encoding,
        stream=stream,
    )

    pass
```

注意：你可以依赖 liteLLM 在 .completion() 调用中把每个 args/kwargs 传给你的配置类

#### `litellm/constants.py`

把自己加进 `LITELLM_CHAT_PROVIDERS` 列表

```py
LITELLM_CHAT_PROVIDERS = [
    "openai",
    "openai_like",
    "bytez",
    "xai",
    "custom_openai",
    "text-completion-openai",
    # ...
]
```

在这里把自己加进提供商的 if 判断链

#### `litellm/litellm_core_utils/get_llm_provider_logic.py`

```py
if model == "*":
    custom_llm_provider = "openai"
# bytez models
elif model.startswith("bytez/"):
    custom_llm_provider = "bytez"
if not custom_llm_provider:
    if litellm.suppress_debug_info is False:
        print()  # noqa
```

#### `litellm/litellm_core_utils/streaming_handler.py`

#### 如果你在流式处理上做了自定义，这里也需要更新，例如：

```py
    def handle_bytez_chunk(self, chunk):
        try:
            is_finished = False
            finish_reason = ""

            return {
                "text": chunk,
                "is_finished": is_finished,
                "finish_reason": finish_reason,
            }
        except Exception as e:
            raise e
```

然后在文件更靠下的位置

```
elif self.custom_llm_provider and self.custom_llm_provider == "bytez":
    response_obj = self.handle_bytez_chunk(chunk)
    completion_obj["content"] = response_obj["text"]
    if response_obj["is_finished"]:
        self.received_finish_reason = response_obj["finish_reason"]
    pass
```

---

### 3. 写一个测试文件来迭代你的代码

在项目里找个位置添加测试文件 `tests/test_litellm/llms/my_provider/chat/test.py`

写入以下内容：

```python
import os
from litellm import completion

os.environ["MY_PROVIDER_KEY"] = "KEY_GOES_HERE"

completion(model="my_provider/your-model", messages=[...], api_key="...")
```

如果想用 VS Code 调试器运行，可以用这份配置文件（推荐）

`.vscode/launch.json`

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python Debugger: Current File",
      "type": "debugpy",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "env": {
        "PYTHONPATH": "${workspaceFolder}",
        "MY_PROVIDER_API_KEY": "YOUR_API_KEY"
      }
    }
  ]
}
```

如果用调试器运行，更新 `"MY_PROVIDER_API_KEY": "YOUR_API_KEY"` 之后，就可以从测试脚本里删掉这一行：

`os.environ["MY_PROVIDER_KEY"] = "KEY_GOES_HERE"`

---

### 4. 实现必要的方法

建议顺着 `litellm/llms/custom_httpx/llm_http_handler.py` 里的 `completion()` 往下读。

你会看到它调用了基类中定义的每一个方法。

调试器是你的好朋友。

###### `validate_environment`

设置请求头，校验密钥与模型：

```python
def validate_environment(*args, **kwargs):
    headers.update({
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    })
    return headers
```

###### `get_complete_url`

返回最终的请求 URL：

```python
def get_complete_url(*args, **kwargs):
    return f"{api_base}/{model}"
```

###### `transform_request`

把 OpenAI 风格的输入适配成提供商专属格式：

```python
def transform_request(*args, **kwargs):
    data = {"messages": messages, "params": optional_params}
    return data
```

###### `transform_response`

处理并映射提供商的原始响应：

```python
def transform_response(*args, **kwargs):
    json = raw_response.json()
    model_response.model = model
    model_response.choices[0].message.content = json.get("output")
    return model_response
```

###### `get_sync_custom_stream_wrapper` / `get_async_custom_stream_wrapper`

如果你需要做些定制，这两个方法就是为你准备的。参考 `litellm/llms/sagemaker/chat/transformation.py` 或 `litellm/llms/bytez/chat/transformation.py` 的实现，可以更好地理解它们的用法。

使用 `CustomStreamWrapper` 配合 `httpx` 的流式（streaming）客户端来产出内容。

---

### 🧪 测试

在 `tests/test_litellm/llms/my_provider/chat/test.py` 中创建测试，不断迭代，直到质量令你满意！

---

### 补充想法

如果卡住了，去看看其他提供商的实现，`ctrl + shift + f` 和 `ctrl + p` 是你的好帮手！

也可以前往 [Discord 反馈频道](https://discord.gg/wuPM9dRgDw)
