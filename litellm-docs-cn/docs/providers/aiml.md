# AI/ML API
https://aimlapi.com/

## 概述

| 属性 | 详情 |
|-------|-------|
| 描述 | AI/ML API 提供众多最先进的 AI 模型，包括可生成高质量图像的 flux-pro/v1.1。 |
| LiteLLM 中的提供商路由 | `aiml/` |
| 提供商文档链接 | [AI/ML API ↗](https://docs.aimlapi.com/) |
| 支持的操作 | [`/chat/completions`], [`/images/generations`](/docs/providers/aiml#异步图像生成) |

LiteLLM 支持 AI/ML API 的图像生成调用。

## API 地址与密钥
```python
# env variable
os.environ['AIML_API_KEY'] = "your-api-key"
os.environ['AIML_API_BASE'] = "https://api.aimlapi.com"  # [optional]
```
上手 AI/ML API 很简单，按以下步骤完成接入即可：

### 1. 获取 API 密钥
首先需要一把 API 密钥，点击下方链接即可获取：
🔑 [获取 API 密钥](https://aimlapi.com/app/keys/?utm_source=aimlapi&utm_medium=github&utm_campaign=integration)

### 2. 探索可用模型
想换个模型？在这里浏览全部支持的模型：
📚 [完整模型列表](https://docs.aimlapi.com/api-overview/model-database/text-models?utm_source=aimlapi&utm_medium=github&utm_campaign=integration)

### 3. 阅读文档
详细的配置说明与使用指南请查阅官方文档：
📖 [AI/ML API 文档](https://docs.aimlapi.com/quickstart/setting-up?utm_source=aimlapi&utm_medium=github&utm_campaign=integration)

### 4. 需要帮助？
有任何疑问欢迎随时联系我们，我们很乐意帮忙！🚀  [Discord](https://discord.gg/hvaUsJpVJf)

## 用法
你可以在 aimlapi.com/models 上从 LLama、Qwen、Flux 等 200 多个开源与闭源模型中挑选。例如：

```python
import litellm

response = litellm.completion(
    model="aiml/meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo", # The model name must include prefix "openai" + the model name from ai/ml api
    api_key="", # your aiml api-key
    api_base="https://api.aimlapi.com/v2",
    messages=[
        {
            "role": "user",
            "content": "Hey, how's it going?",
        }
    ],
)
```

## 流式调用

```python
import litellm

response = litellm.completion(
    model="aiml/Qwen/Qwen2-72B-Instruct",  # The model name must include prefix "openai" + the model name from ai/ml api
    api_key="",  # your aiml api-key
    api_base="https://api.aimlapi.com/v2",
    messages=[
        {
            "role": "user",
            "content": "Hey, how's it going?",
        }
    ],
    stream=True,
)
for chunk in response:
    print(chunk)
```

## 异步补全

```python
import asyncio

import litellm


async def main():
    response = await litellm.acompletion(
        model="aiml/anthropic/{{anthropic}}",  # The model name must include prefix "openai" + the model name from ai/ml api
        api_key="",  # your aiml api-key
        api_base="https://api.aimlapi.com/v2",
        messages=[
            {
                "role": "user",
                "content": "Hey, how's it going?",
            }
        ],
    )
    print(response)


if __name__ == "__main__":
    asyncio.run(main())
```

## 异步流式调用

```python
import asyncio
import traceback

import litellm


async def main():
    try:
        print("test acompletion + streaming")
        response = await litellm.acompletion(
            model="aiml/nvidia/Llama-3.1-Nemotron-70B-Instruct-HF", # The model name must include prefix "openai" + the model name from ai/ml api
            api_key="", # your aiml api-key
            api_base="https://api.aimlapi.com/v2",
            messages=[{"content": "Hey, how's it going?", "role": "user"}],
            stream=True,
        )
        print(f"response: {response}")
        async for chunk in response:
            print(chunk)
    except:
        print(f"error occurred: {traceback.format_exc()}")
        pass


if __name__ == "__main__":
    asyncio.run(main())
```

## 异步嵌入

```python
import asyncio

import litellm


async def main():
    response = await litellm.aembedding(
        model="aiml/text-embedding-3-small", # The model name must include prefix "openai" + the model name from ai/ml api
        api_key="",  # your aiml api-key
        api_base="https://api.aimlapi.com/v1", # 👈 the URL has changed from v2 to v1
        input="Your text string",
    )
    print(response)


if __name__ == "__main__":
    asyncio.run(main())
```

## 异步图像生成

```python
import asyncio

import litellm


async def main():
    response = await litellm.aimage_generation(
        model="aiml/dall-e-3",  # The model name must include prefix "openai" + the model name from ai/ml api
        api_key="",  # your aiml api-key
        api_base="https://api.aimlapi.com/v1", # 👈 the URL has changed from v2 to v1
        prompt="A cute baby sea otter",
    )
    print(response)


if __name__ == "__main__":
    asyncio.run(main())
```
