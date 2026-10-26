---
id: python_sdk
title: LiteLLM Python SDK
sidebar_label: 概览
description: LiteLLM Python SDK 让你在 Python 中用同一套接口调用 100 多家 LLM 提供商，各家提供商的输入与输出格式保持一致。
---

import NavigationCards from '@site/src/components/NavigationCards';

# LiteLLM Python SDK

LiteLLM Python SDK 是一个 Python 库，让你用同一套接口、以 OpenAI 格式调用 100 多家 LLM 提供商，例如 OpenAI、Anthropic、Vertex AI 和 Bedrock。

你把 SDK 导入自己的应用代码中使用，不需要运维任何服务器。

## 安装 SDK

```shell
uv add litellm
```

也可以使用 `pip install litellm`。

想要更精简的默认安装，可以在全新环境中使用 [LiteLLM Core](./litellm_core.md)。它保留相同的 `litellm` 导入方式，并把 AWS 与 Python Hugging Face 分词器依赖变为可选。每个环境只能安装其中一个发行版：`litellm` 与 `litellm-core` 无法共存。

## 发起请求

先设置提供商的 API 密钥（API key），然后调用 `completion()`，模型名采用 `provider/model` 格式：

```python
from litellm import completion
import os

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

response = completion(
    model="anthropic/{{anthropic}}",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
)
print(response.choices[0].message.content)
```

换用其他提供商时，只需修改模型名和 API 密钥，请求与响应的代码保持不变。完整流程请参考[快速上手](/docs/learn/sdk_quickstart)。

## SDK 的功能

- **接口统一**：每家提供商都使用同一个 `completion()` 函数和相同的参数。
- **输出格式统一**：所有提供商的响应都采用 OpenAI 格式。
- **异常映射**（exception mapping）：SDK 会把提供商的错误转换为 OpenAI 异常类型，你现有捕获 OpenAI 异常的代码同样能捕获各家提供商的错误。
- **路由**：[Router](/docs/routing) 提供跨部署的重试、回退机制和负载均衡能力。
- **回调**（callback）：一行代码即可把日志和成本数据发送到 Langfuse、MLflow、Helicone 等工具。

## SDK 函数

每个函数都有以 `a` 为前缀的异步版本，例如 `completion()` 的异步版本是 `acompletion()`。

| 函数 | 用途 | 参考文档 |
|---|---|---|
| `completion()` | 向模型发送对话消息 | [completion()](/docs/completion/input) |
| `responses()` | 使用 OpenAI Responses API 格式 | [responses()](/docs/response_api) |
| `embedding()` | 获取文本的向量嵌入（embedding） | [embedding()](/docs/embedding/supported_embedding) |
| `image_generation()` | 根据文本提示词生成图像 | [image_generation()](/docs/image_generation) |
| `transcription()` | 把语音音频转成文字 | [transcription()](/docs/audio_transcription) |
| `speech()` | 把文字转成语音音频 | [speech()](/docs/text_to_speech) |
| `rerank()` | 按与查询的相关度对文档排序 | [rerank()](/docs/rerank) |

LiteLLM 支持的全部端点，请参考[支持的端点](/docs/supported_endpoints)。

## 常见任务

| 任务 | 页面 |
|---|---|
| 设置 API 密钥、API 基础地址和 API 版本 | [设置密钥](/docs/set_keys) |
| 以流式获取响应 | [流式传输](/docs/completion/stream) |
| 捕获提供商错误 | [异常映射](/docs/exception_mapping) |
| 把日志发送到可观测性工具 | [回调](/docs/observability/callbacks) |
| 计算 Token 用量与成本 | [Token 用量](/docs/completion/token_usage) |
| 添加重试、回退机制和负载均衡 | [Router](/docs/routing) |
| 缓存响应 | [缓存](/docs/caching/all_caches) |
| 从 Python 运行编码代理（coding agent） | [Agent 运行框架](/docs/harness) |

## SDK 还是 AI 网关

如果只有一个 Python 应用向 LLM 发送请求，用 SDK 即可。如果有多个应用同时发送请求，或者需要虚拟密钥（virtual key）、花费追踪（spend tracking）或集中存放日志，请使用 [AI 网关](/docs/simple_proxy)。

SDK 也可以向 AI 网关发送请求：在模型名前加上 `litellm_proxy/` 前缀即可。参见[将 LiteLLM 代理作为提供商](/docs/providers/litellm_proxy)。

## 后续步骤

<NavigationCards
columns={3}
items={[
{
title: "快速上手",
description: "安装 SDK 并发起你的第一个请求。",
to: "/docs/learn/sdk_quickstart",
},
{
title: "提供商",
description: "查看各提供商的模型名称、凭证和参数。",
to: "/docs/providers",
},
{
title: "Router",
description: "在应用代码中加入重试、回退机制和负载均衡。",
to: "/docs/routing",
},
]}
/>
