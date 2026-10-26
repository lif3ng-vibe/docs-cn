# LlamaGate

## 概览

| 属性 | 详情 |
|-------|-------|
| 说明 | LlamaGate 是一个兼容 OpenAI 的 API 网关，面向开源 LLM，采用基于额度（credit）的计费方式。以有竞争力的价格使用 Llama、Mistral、DeepSeek、Qwen 等 26 个以上的开源模型。 |
| LiteLLM 提供商路由 | `llamagate/` |
| 提供商文档链接 | [LlamaGate 文档 ↗](https://llamagate.dev/docs) |
| Base URL | `https://api.llamagate.dev/v1` |
| 支持的操作 | [`/chat/completions`](/docs/providers/llamagate#用法---litellm-python-sdk) |

<br />

## LlamaGate 是什么？

LlamaGate 通过兼容 OpenAI 的 API 提供对开源 LLM 的访问：
- **26 个以上开源模型**：Llama 3.1/3.2、Mistral、Qwen、DeepSeek R1 等
- **兼容 OpenAI 的 API**：可直接替换 OpenAI SDK 使用
- **视觉模型**：Qwen VL、LLaVA、olmOCR、UI-TARS，用于多模态任务
- **推理模型**：DeepSeek R1、OpenThinker，适合解决复杂问题
- **代码模型**：CodeLlama、DeepSeek Coder、Qwen Coder、StarCoder2
- **有竞争力的价格**：每 100 万 token $0.02-$0.55

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["LLAMAGATE_API_KEY"] = ""  # your LlamaGate API key
```

API 密钥可在 [llamagate.dev](https://llamagate.dev) 获取。

## 支持的模型

### 通用模型
| 模型 | 模型 ID |
|-------|----------|
| Llama 3.1 8B | `llamagate/llama-3.1-8b` |
| Llama 3.2 3B | `llamagate/llama-3.2-3b` |
| Mistral 7B v0.3 | `llamagate/mistral-7b-v0.3` |
| Qwen 3 8B | `llamagate/qwen3-8b` |
| Dolphin 3 8B | `llamagate/dolphin3-8b` |

### 推理模型
| 模型 | 模型 ID |
|-------|----------|
| DeepSeek R1 8B | `llamagate/deepseek-r1-8b` |
| DeepSeek R1 Distill Qwen 7B | `llamagate/deepseek-r1-7b-qwen` |
| OpenThinker 7B | `llamagate/openthinker-7b` |

### 代码模型
| 模型 | 模型 ID |
|-------|----------|
| Qwen 2.5 Coder 7B | `llamagate/qwen2.5-coder-7b` |
| DeepSeek Coder 6.7B | `llamagate/deepseek-coder-6.7b` |
| CodeLlama 7B | `llamagate/codellama-7b` |
| CodeGemma 7B | `llamagate/codegemma-7b` |
| StarCoder2 7B | `llamagate/starcoder2-7b` |

### 视觉模型
| 模型 | 模型 ID |
|-------|----------|
| Qwen 3 VL 8B | `llamagate/qwen3-vl-8b` |
| LLaVA 1.5 7B | `llamagate/llava-7b` |
| Gemma 3 4B | `llamagate/gemma3-4b` |
| olmOCR 7B | `llamagate/olmocr-7b` |
| UI-TARS 1.5 7B | `llamagate/ui-tars-7b` |

:::info
LiteLLM 目前对 LlamaGate 仅支持 `/chat/completions`。`llamagate/` 路由暂不支持 `litellm.embedding()`。
:::

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="LlamaGate Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["LLAMAGATE_API_KEY"] = ""  # your LlamaGate API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# LlamaGate call
response = completion(
    model="llamagate/llama-3.1-8b",
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="LlamaGate Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["LLAMAGATE_API_KEY"] = ""  # your LlamaGate API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# LlamaGate call with streaming
response = completion(
    model="llamagate/llama-3.1-8b",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 视觉

```python showLineNumbers title="LlamaGate Vision Completion"
import os
import litellm
from litellm import completion

os.environ["LLAMAGATE_API_KEY"] = ""  # your LlamaGate API key

messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
        ]
    }
]

# LlamaGate vision call
response = completion(
    model="llamagate/qwen3-vl-8b",
    messages=messages
)

print(response)
```

## 用法 - LiteLLM 代理服务器

### 1. 在环境中保存密钥

```bash
export LLAMAGATE_API_KEY=""
```

### 2. 启动代理

```yaml
model_list:
  - model_name: llama-3.1-8b
    litellm_params:
      model: llamagate/llama-3.1-8b
      api_key: os.environ/LLAMAGATE_API_KEY
  - model_name: deepseek-r1
    litellm_params:
      model: llamagate/deepseek-r1-8b
      api_key: os.environ/LLAMAGATE_API_KEY
  - model_name: qwen-coder
    litellm_params:
      model: llamagate/qwen2.5-coder-7b
      api_key: os.environ/LLAMAGATE_API_KEY
```

## 支持的 OpenAI 参数

LlamaGate 支持所有标准的 OpenAI 兼容参数：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `messages` | array | **必填**。包含 'role' 和 'content' 的消息对象数组 |
| `model` | string | **必填**。模型 ID |
| `stream` | boolean | 可选。启用流式响应 |
| `temperature` | float | 可选。采样温度（0-2） |
| `top_p` | float | 可选。核采样（nucleus sampling）参数 |
| `max_tokens` | integer | 可选。生成的最大 token 数 |
| `frequency_penalty` | float | 可选。对出现频繁的 token 施加惩罚 |
| `presence_penalty` | float | 可选。根据 token 是否出现施加惩罚 |
| `stop` | string/array | 可选。停止序列 |
| `tools` | array | 可选。可用工具/函数列表 |
| `tool_choice` | string/object | 可选。控制工具/函数调用 |
| `response_format` | object | 可选。JSON 模式或 JSON schema |

## 价格

LlamaGate 提供有竞争力的按 token 计费价格：

| 模型类别 | 输入（每 100 万） | 输出（每 100 万） |
|----------------|----------------|-----------------|
| 小型（3-4B） | $0.03-$0.04 | $0.08 |
| 中型（7-8B） | $0.03-$0.15 | $0.05-$0.55 |
| 代码模型 | $0.06-$0.10 | $0.12-$0.20 |
| 推理 | $0.08-$0.10 | $0.15-$0.20 |

## 更多资源

- [LlamaGate 文档](https://llamagate.dev/docs)
- [LlamaGate 价格页](https://llamagate.dev/pricing)
- [LlamaGate API 参考](https://llamagate.dev/docs/api)
