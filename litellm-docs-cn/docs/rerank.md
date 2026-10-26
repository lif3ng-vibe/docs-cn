# /rerank

:::tip

LiteLLM 遵循 [Cohere rerank API 的请求 / 响应格式](https://cohere.com/rerank)

:::

## 概览

| 功能 | 是否支持 | 说明 |
|---------|-----------------------------------------------------------------------------------------------------|-------|
| 成本追踪 | ✅ | 适用于所有支持的模型 |
| 日志 | ✅ | 所有集成都支持 |
| 终端用户追踪 | ✅ | |
| 回退机制 | ✅ | 可在支持的模型之间使用 |
| 负载均衡 | ✅ | 可在支持的模型之间使用 |
| 防护栏 | ✅ | 仅作用于输入查询（不含文档） |
| 支持的提供商 | Cohere、Together AI、Azure AI、DeepInfra、Nvidia NIM、Infinity、Fireworks AI、VoyageAI by MongoDB、watsonx.ai | |

## **LiteLLM Python SDK 用法**
### 快速上手

```python
from litellm import rerank
import os

os.environ["COHERE_API_KEY"] = "sk-.."

query = "What is the capital of the United States?"
documents = [
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Washington, D.C. is the capital of the United States.",
    "Capital punishment has existed in the United States since before it was a country.",
]

response = rerank(
    model="cohere/rerank-english-v3.0",
    query=query,
    documents=documents,
    top_n=3,
)
print(response)
```

### 异步用法

```python
from litellm import arerank
import os, asyncio

os.environ["COHERE_API_KEY"] = "sk-.."

async def test_async_rerank(): 
    query = "What is the capital of the United States?"
    documents = [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country.",
    ]

    response = await arerank(
        model="cohere/rerank-english-v3.0",
        query=query,
        documents=documents,
        top_n=3,
    )
    print(response)

asyncio.run(test_async_rerank())
```

## **LiteLLM 代理用法** {#litellm-proxy-usage}

LiteLLM 提供了与 Cohere API 兼容的 `/rerank` 端点，用于处理重排序（rerank）调用。

**配置**

将以下内容添加到你的 litellm 代理 config.yaml 中：

```yaml
model_list:
  - model_name: Salesforce/Llama-Rank-V1
    litellm_params:
      model: together_ai/Salesforce/Llama-Rank-V1
      api_key: os.environ/TOGETHERAI_API_KEY
  - model_name: rerank-english-v3.0
    litellm_params:
      model: cohere/rerank-english-v3.0
      api_key: os.environ/COHERE_API_KEY
```

启动 litellm：

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

测试请求：

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "rerank-english-v3.0",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "top_n": 3
  }'
```

## **支持的提供商**

#### ⚡️在 [models.litellm.ai](https://models.litellm.ai/) 查看所有支持的模型和提供商

| 提供商 | 用法链接 |
|--------------------------|------------------------------------------------------|
| Cohere（v1 + v2 客户端） | [用法](#快速上手) |
| Together AI | [用法](../docs/providers/togetherai) |
| Azure AI | [用法](../docs/providers/azure_ai#rerank-端点) |
| Jina AI | [用法](../docs/providers/jina_ai) |
| AWS Bedrock | [用法](../docs/providers/bedrock#rerank-api) |
| HuggingFace | [用法](../docs/providers/huggingface_rerank) |
| Infinity | [用法](../docs/providers/infinity) |
| vLLM | [用法](/docs/providers/vllm#重排序) |
| DeepInfra | [用法](../docs/providers/deepinfra#rerank-端点) |
| Vertex AI | [用法](../docs/providers/vertex#rerank-api) |
| Fireworks AI | [用法](/docs/providers/fireworks_ai#重排序rerank) |
| VoyageAI by MongoDB | [用法](../docs/providers/voyage#重排序) |
| IBM watsonx.ai | [用法](../docs/providers/watsonx/rerank) |
