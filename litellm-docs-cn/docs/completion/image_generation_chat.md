import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 对话补全与 Responses API 中的图像生成

本指南介绍如何在使用 `chat/completions` 时生成图像。注意：如果你希望在 Responses API 上获得这一能力，请[在此](https://github.com/BerriAI/litellm/issues/new)提交功能请求。

:::info

需要 LiteLLM v1.76.1 及以上版本

:::

支持的提供商：
- Google AI Studio（`gemini`）
- Vertex AI（`vertex_ai/`）

对于支持在对话补全过程中生成图像的模型，LiteLLM 会对助手消息中的 `images` 响应做标准化处理。

```json title="litellm 返回的响应示例"
"message": {
    ...
    "content": "Here's the image you requested:",
    "images": [
        {
            "image_url": {
                "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
                "detail": "auto"
            },
            "index": 0,
            "type": "image_url"
        }
    ]
}
```

## 快速上手

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers title="使用对话补全生成图像"
from litellm import completion
import os 

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = completion(
    model="gemini/gemini-2.5-flash-image-preview",
    messages=[
        {"role": "user", "content": "Generate an image of a banana wearing a costume that says LiteLLM"}
    ],
)

print(response.choices[0].message.content)  # Text response
print(response.choices[0].message.images)   # List of image objects
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gemini-image-gen
    litellm_params:
      model: gemini/gemini-2.5-flash-image-preview
      api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理服务器

```bash showLineNumbers title="启动代理"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下！

```bash showLineNumbers title="发起请求"
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gemini-image-gen",
    "messages": [
      {
        "role": "user",
        "content": "Generate an image of a banana wearing a costume that says LiteLLM"
      }
    ]
  }'
```

</TabItem>
</Tabs>

**预期响应**

```bash
{
    "id": "chatcmpl-3b66124d79a708e10c603496b363574c",
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": "Here's the image you requested:",
                "role": "assistant",
                "images": [
                    {
                        "image_url": {
                            "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
                            "detail": "auto"
                        },
                        "index": 0,
                        "type": "image_url"
                    }
                ]
            }
        }
    ],
    "created": 1723323084,
    "model": "gemini/gemini-2.5-flash-image-preview",
    "object": "chat.completion",
    "usage": {
        "completion_tokens": 12,
        "prompt_tokens": 16,
        "total_tokens": 28
    }
}
```

## 流式支持

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers title="流式生成图像"
from litellm import completion
import os 

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = completion(
    model="gemini/gemini-2.5-flash-image-preview",
    messages=[
        {"role": "user", "content": "Generate an image of a banana wearing a costume that says LiteLLM"}
    ],
    stream=True,
)

for chunk in response:
    if hasattr(chunk.choices[0].delta, "images") and chunk.choices[0].delta.images is not None:
        print("Generated image:", chunk.choices[0].delta.images[0]["image_url"]["url"])
        break
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash showLineNumbers title="流式请求"
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gemini-image-gen",
    "messages": [
      {
        "role": "user",
        "content": "Generate an image of a banana wearing a costume that says LiteLLM"
      }
    ],
    "stream": true
  }'
```

</TabItem>
</Tabs>

**预期流式响应**

```bash
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1723323084,"model":"gemini/gemini-2.5-flash-image-preview","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1723323084,"model":"gemini/gemini-2.5-flash-image-preview","choices":[{"index":0,"delta":{"content":"Here's the image you requested:"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1723323084,"model":"gemini/gemini-2.5-flash-image-preview","choices":[{"index":0,"delta":{"images":[{"image_url":{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...","detail":"auto"},"index":0,"type":"image_url"}]},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1723323084,"model":"gemini/gemini-2.5-flash-image-preview","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

## 异步支持

```python showLineNumbers title="异步生成图像"
from litellm import acompletion
import asyncio
import os 

os.environ["GEMINI_API_KEY"] = "your-api-key"

async def generate_image():
    response = await acompletion(
        model="gemini/gemini-2.5-flash-image-preview",
        messages=[
            {"role": "user", "content": "Generate an image of a banana wearing a costume that says LiteLLM"}
        ],
    )
    
    print(response.choices[0].message.content)  # Text response
    print(response.choices[0].message.images)   # List of image objects

    return response

# Run the async function
asyncio.run(generate_image())
```

## 支持的模型

| 提供商 | 模型 | 
|----------|--------|
| Google AI Studio | `gemini/gemini-2.0-flash-preview-image-generation`, `gemini/gemini-2.5-flash-image-preview`, `gemini/gemini-3-pro-image-preview` |
| Vertex AI | `vertex_ai/gemini-2.0-flash-preview-image-generation`, `vertex_ai/gemini-2.5-flash-image-preview`, `vertex_ai/gemini-3-pro-image-preview` |

## 规范

响应中的 `images` 字段遵循以下结构：

```json
"images": [
    {
        "image_url": {
            "url": "data:image/png;base64,<base64_encoded_image>",
            "detail": "auto"
        },
        "index": 0,
        "type": "image_url"
    }
]
```

- `images` - List[ImageURLListItem]：生成的图像数组
  - `image_url` - ImageURLObject：图像数据的容器
    - `url` - str：data URI 格式的 Base64 编码图像数据
    - `detail` - str：图像细节级别（生成图像时固定为 "auto"）
  - `index` - int：图像在响应中的索引
  - `type` - str：类型标识（固定为 "image_url"）

图像以 base64 编码的 data URI 形式返回，可直接用于 HTML `<img>` 标签，也可以保存为文件。
