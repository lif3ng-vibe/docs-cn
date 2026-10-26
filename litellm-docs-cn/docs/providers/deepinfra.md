import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# DeepInfra
https://deepinfra.com/

:::tip

**我们支持全部 DeepInfra 模型，发送 LiteLLM 请求时只需为模型名加上 `model=deepinfra/<any-model-on-deepinfra>` 前缀**

:::

## 目录

- [API 密钥](#api-密钥)
- [对话模型](#对话模型)
- [Rerank 端点](#rerank-端点)

## API 密钥
```python
# env variable
os.environ['DEEPINFRA_API_KEY']
```

## 使用示例
```python
from litellm import completion
import os

os.environ['DEEPINFRA_API_KEY'] = ""
response = completion(
    model="deepinfra/meta-llama/Llama-2-70b-chat-hf",
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}]
)
```

## 流式使用示例
```python
from litellm import completion
import os

os.environ['DEEPINFRA_API_KEY'] = ""
response = completion(
    model="deepinfra/meta-llama/Llama-2-70b-chat-hf",
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 对话模型
| 模型名称       | 调用方式                        |
|------------------|--------------------------------------|
| meta-llama/Meta-Llama-3-8B-Instruct  | `completion(model="deepinfra/meta-llama/Meta-Llama-3-8B-Instruct", messages)` | 
| meta-llama/Meta-Llama-3-70B-Instruct  | `completion(model="deepinfra/meta-llama/Meta-Llama-3-70B-Instruct", messages)` | 
| meta-llama/Llama-2-70b-chat-hf  | `completion(model="deepinfra/meta-llama/Llama-2-70b-chat-hf", messages)` | 
| meta-llama/Llama-2-7b-chat-hf  | `completion(model="deepinfra/meta-llama/Llama-2-7b-chat-hf", messages)` | 
| meta-llama/Llama-2-13b-chat-hf | `completion(model="deepinfra/meta-llama/Llama-2-13b-chat-hf", messages)` | 
| codellama/CodeLlama-34b-Instruct-hf | `completion(model="deepinfra/codellama/CodeLlama-34b-Instruct-hf", messages)` |
| mistralai/Mistral-7B-Instruct-v0.1 | `completion(model="deepinfra/mistralai/Mistral-7B-Instruct-v0.1", messages)` | 
| jondurbin/airoboros-l2-70b-gpt4-1.4.1 | `completion(model="deepinfra/jondurbin/airoboros-l2-70b-gpt4-1.4.1", messages)` |

## Rerank 端点

LiteLLM 为 DeepInfra 的重排序（rerank）模型提供了兼容 Cohere API 的 `/rerank` 端点。

### 支持的 Rerank 模型

| 模型名称 | 说明 |
|------------|-------------|
| `deepinfra/Qwen/Qwen3-Reranker-0.6B` | 轻量级重排序模型（0.6B 参数） |
| `deepinfra/Qwen/Qwen3-Reranker-4B` | 中等规模重排序模型（4B 参数） |
| `deepinfra/Qwen/Qwen3-Reranker-8B` | 大型重排序模型（8B 参数） |

### 用法 - LiteLLM Python SDK

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import rerank
import os

os.environ["DEEPINFRA_API_KEY"] = "your-api-key"

response = rerank(
    model="deepinfra/Qwen/Qwen3-Reranker-0.6B",
    query="What is the capital of France?",
    documents=[
        "Paris is the capital of France.",
        "London is the capital of the United Kingdom.",
        "Berlin is the capital of Germany.",
        "Madrid is the capital of Spain.",
        "Rome is the capital of Italy."
    ]
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 添加到 config.yaml
```yaml
model_list:
  - model_name: Qwen/Qwen3-Reranker-0.6B
    litellm_params:
      model: deepinfra/Qwen/Qwen3-Reranker-0.6B
      api_key: os.environ/DEEPINFRA_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000/
```

3. 测试一下！

```bash 
curl -L -X POST 'http://0.0.0.0:4000/rerank' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "model": "Qwen/Qwen3-Reranker-0.6B",
    "query": "What is the capital of France?",
    "documents": [
        "Paris is the capital of France.",
        "London is the capital of the United Kingdom.",
        "Berlin is the capital of Germany.",
        "Madrid is the capital of Spain.",
        "Rome is the capital of Italy."
    ]
}'
```

</TabItem>
</Tabs>

### 支持的 Cohere Rerank API 参数

| 参数              | 类型        | 说明                                     |
| ------------------ | ----------- | ----------------------------------------------- |
| `query`            | `str`       | 用于对文档进行重排序的查询       |
| `documents`        | `list[str]` | 待重排序的文档列表                         |


### 提供商专属参数
DeepInfra 专属参数可以作为关键字参数直接传给 rerank 函数，例如：

```
response = rerank(
    model="deepinfra/Qwen/Qwen3-Reranker-0.6B",
    query="What is the capital of France?",
    documents=[
        "Paris is the capital of France.",
        "London is the capital of the United Kingdom.",
        "Berlin is the capital of Germany.",
        "Madrid is the capital of Spain.",
        "Rome is the capital of Italy."
    ],
    my_custom_param="my_custom_value", # any other deepinfra specific parameters
)
```

### 响应格式

```json
{
  "id": "request-id",
  "results": [
    {
      "index": 0,
      "relevance_score": 0.9975274205207825
    },
    {
      "index": 1,
      "relevance_score": 0.011687257327139378
    }
  ],
  "meta": {
    "billed_units": {
      "total_tokens": 427
    },
    "tokens": {
      "input_tokens": 427,
      "output_tokens": 0
    }
  }
}
```
