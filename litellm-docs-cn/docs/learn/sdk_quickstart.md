---
title: SDK 快速上手
sidebar_label: SDK 快速上手
description: 完成你的第一次 LiteLLM SDK 调用，再按下一步需要的功能跳转到对应文档。
---

import NavigationCards from '@site/src/components/NavigationCards';

如果你要把 LiteLLM 直接集成进应用代码，就走这条路线。

## 1. 安装 LiteLLM

```bash
uv add litellm
```

## 2. 配置提供商凭证

先从一家提供商开始，设置好对应的环境变量（environment variable）。

- OpenAI：`OPENAI_API_KEY`
- Anthropic：`ANTHROPIC_API_KEY`
- Azure OpenAI：`AZURE_API_KEY`, `AZURE_API_BASE`, `AZURE_API_VERSION`
- Bedrock：标准 AWS 凭证
- Vertex AI：`VERTEXAI_PROJECT`, `VERTEXAI_LOCATION`

还没选定提供商？可以先浏览[全部支持的提供商](/docs/providers)。

## 3. 发起第一次调用

```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
    model="openai/{{openai_large}}",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
)

print(response.choices[0].message.content)
```

## 4. 查看响应

下面这行代码：

```python
print(response.choices[0].message.content)
```

会打印助手的回复文本，例如：

```text
Hello! I'm doing well, thanks for asking.
```

如果用下面这行打印完整对象：

```python
print(response)
```

你会看到一个 Python 的 `ModelResponse(...)` 对象。对于 OpenAI 系模型，它大致长这样：

```python
ModelResponse(
    id='chatcmpl-abc123',
    created=1773782130,
    model='{{openai_large}}',
    object='chat.completion',
    system_fingerprint='fp_4ff89bf575',
    choices=[
        Choices(
            finish_reason='stop',
            index=0,
            message=Message(
                content="Hello! I'm just a program, but I'm here to help you. How can I assist you today?",
                role='assistant',
                tool_calls=None,
                function_call=None,
                provider_specific_fields={'refusal': None},
                annotations=[]
            ),
            provider_specific_fields={}
        )
    ],
    usage=Usage(
        completion_tokens=21,
        prompt_tokens=13,
        total_tokens=34,
        completion_tokens_details=CompletionTokensDetailsWrapper(...),
        prompt_tokens_details=PromptTokensDetailsWrapper(...)
    ),
    service_tier='default'
)
```

这份响应沿用了 OpenAI 风格的结构，概念上等价于：

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "{{openai_large}}",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thanks for asking."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 12,
    "total_tokens": 25
  }
}
```

`id`、`created`、Token 数量与消息文本都会随请求而变。

调用 OpenAI 系模型时，你还可能看到 `system_fingerprint`、`service_tier`、`tool_calls`、`function_call`、`annotations`、`provider_specific_fields` 以及更细粒度的 Token 用量等额外字段。完整输出参考见 [completion 输出](/docs/completion/output)。

需要更多提供商的示例？请查看主[入门](/docs/#快速开始)页面。

## 5. 选择下一步

<NavigationCards
columns={3}
items={[
{
icon: "⚡",
title: "流式响应",
description: "通过 stream=True 逐段接收 Token。",
to: "/docs/completion/stream",
},
{
icon: "🧰",
title: "使用工具",
description: "以与提供商无关的方式添加函数调用（function calling）。",
to: "/docs/completion/function_call",
},
{
icon: "📦",
title: "返回 JSON",
description: "把响应约束为结构化输出（structured output）。",
to: "/docs/completion/json_mode",
},
{
icon: "🔀",
title: "添加路由",
description: "在应用代码里使用重试、回退机制与负载均衡。",
to: "/docs/routing",
},
{
icon: "🌐",
title: "选择提供商",
description: "查询各提供商的认证方式、模型命名与参数。",
to: "/docs/providers",
},
]}
/>

## 什么时候改用网关

如果你需要集中式认证、虚拟密钥（virtual key）、花费追踪（spend tracking）、共享日志，或者想为多个应用提供同一个 OpenAI 兼容的端点（endpoint），就用 LiteLLM Gateway。

[前往 Gateway 快速上手 →](/docs/learn/gateway_quickstart)
