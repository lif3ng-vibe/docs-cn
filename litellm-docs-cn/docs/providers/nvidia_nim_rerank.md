import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# NVIDIA NIM 重排序（Rerank）

通过 LiteLLM 使用 NVIDIA NIM 的重排序模型。

| 属性 | 说明 |
|----------|---------|
| 描述 | NVIDIA NIM 提供高性能的重排序模型，面向语义搜索与检索增强生成（RAG）场景 |
| 提供商文档 | [Nvidia NIM Rerank API ↗](https://docs.api.nvidia.com/nim/reference/nvidia-llama-3_2-nv-rerankqa-1b-v2-infer) |
| 支持的端点 | `/rerank` |

## 概述

NVIDIA NIM 的重排序模型可以帮你：
- 根据与查询的相关度重新排序搜索结果
- 提升 RAG（检索增强生成）的准确率
- 高效地筛选并排序大规模文档集

**支持的模型**：
- NVIDIA NIM 平台上的全部重排序模型

:::tip

在 [Nvidia NIM](https://models.litellm.ai) 可查看 LiteLLM 支持的 NVIDIA NIM 重排序模型完整列表

:::

## 用法

### LiteLLM Python SDK

<Tabs>
<TabItem value="llama-1b" label="LLaMa 1B 模型">

```python
import litellm
import os

os.environ['NVIDIA_NIM_API_KEY'] = "nvapi-..."

response = litellm.rerank(
    model="nvidia_nim/nvidia/llama-3_2-nv-rerankqa-1b-v2",
    query="What is the GPU memory bandwidth of H100 SXM?",
    documents=[
        "The Hopper GPU is paired with the Grace CPU using NVIDIA's ultra-fast chip-to-chip interconnect, delivering 900GB/s of bandwidth.",
        "A100 provides up to 20X higher performance over the prior generation.",
        "Accelerated servers with H100 deliver 3 terabytes per second (TB/s) of memory bandwidth per GPU."
    ],
    top_n=3,
)

print(response)
```

</TabItem>
<TabItem value="mistral-4b" label="Mistral 4B 模型">

```python
import litellm
import os

os.environ['NVIDIA_NIM_API_KEY'] = "nvapi-..."

response = litellm.rerank(
    model="nvidia_nim/nvidia/nv-rerankqa-mistral-4b-v3",
    query="What is the GPU memory bandwidth of H100 SXM?",
    documents=[
        "The Hopper GPU is paired with the Grace CPU using NVIDIA's ultra-fast chip-to-chip interconnect, delivering 900GB/s of bandwidth.",
        "A100 provides up to 20X higher performance over the prior generation.",
        "Accelerated servers with H100 deliver 3 terabytes per second (TB/s) of memory bandwidth per GPU."
    ],
    top_n=3,
)

print(response)
```

</TabItem>
</Tabs>

**响应**：
```json
{
    "results": [
        {
            "index": 2,
            "relevance_score": 6.828125,
            "document": {
                "text": "Accelerated servers with H100 deliver 3 terabytes per second (TB/s) of memory bandwidth per GPU."
            }
        },
        {
            "index": 0,
            "relevance_score": -1.564453125,
            "document": {
                "text": "The Hopper GPU is paired with the Grace CPU using NVIDIA's ultra-fast chip-to-chip interconnect, delivering 900GB/s of bandwidth."
            }
        }
    ]
}
```


## 通过 LiteLLM 代理使用

### 1. 设置配置文件

将 NVIDIA NIM 重排序模型添加到代理配置中：

```yaml
model_list:
  - model_name: nvidia-rerank
    litellm_params:
      model: nvidia_nim/nvidia/llama-3_2-nv-rerankqa-1b-v2
      api_key: os.environ/NVIDIA_NIM_API_KEY
```

### 2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

### 3. 发起重排序请求

```bash
curl -X POST http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nvidia-rerank",
    "query": "What is the GPU memory bandwidth of H100?",
    "documents": [
      "H100 delivers 3TB/s memory bandwidth",
      "A100 has 2TB/s memory bandwidth",
      "V100 offers 900GB/s memory bandwidth"
    ],
    "top_n": 2
  }'
```

## `/v1/ranking` 模型（llama-3.2-nv-rerankqa-1b-v2）

部分 NVIDIA NIM 重排序模型使用的是 `/v1/ranking` 端点，而非默认的 `/v1/retrieval/{model}/reranking` 端点。

使用 `ranking/` 前缀可以强制请求走 `/v1/ranking` 端点：

### LiteLLM Python SDK

```python showLineNumbers title="Force /v1/ranking endpoint with ranking/ prefix"
import litellm
import os

os.environ['NVIDIA_NIM_API_KEY'] = "nvapi-..."

# Use "ranking/" prefix to force /v1/ranking endpoint
response = litellm.rerank(
    model="nvidia_nim/ranking/nvidia/llama-3.2-nv-rerankqa-1b-v2",
    query="which way did the traveler go?",
    documents=[
        "two roads diverged in a yellow wood...",
        "then took the other, as just as fair...",
        "i shall be telling this with a sigh somewhere ages and ages hence..."
    ],
    top_n=3,
    truncate="END",  # Optional: truncate long text from the end
)

print(response)
```

### LiteLLM 代理

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: nvidia-ranking
    litellm_params:
      model: nvidia_nim/ranking/nvidia/llama-3.2-nv-rerankqa-1b-v2
      api_key: os.environ/NVIDIA_NIM_API_KEY
```

```bash title="Request to LiteLLM Proxy"
curl -X POST http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nvidia-ranking",
    "query": "which way did the traveler go?",
    "documents": [
      "two roads diverged in a yellow wood...",
      "then took the other, as just as fair..."
    ],
    "top_n": 2
  }'
```

### 理解模型解析

**Ranking 端点**（`/v1/ranking`）：

```
model: nvidia_nim/ranking/nvidia/llama-3.2-nv-rerankqa-1b-v2
       └────┬────┘ └──┬──┘ └─────────────┬──────────────────┘
            │        │                   │
            │        │                   └────▶ Model name sent to provider
            │        │
            │        └────────────────────────▶ Tells LiteLLM the request/response and url should be sent to Nvidia NIM /v1/ranking endpoint
            │
            └─────────────────────────────────▶ Provider prefix

API URL: https://ai.api.nvidia.com/v1/ranking
```

**流程示意**：

```
Client Request                LiteLLM                              Provider API
──────────────              ────────────                         ─────────────

# Default reranking endpoint
model: "nvidia_nim/nvidia/model-name"
                            1. Extracts model: nvidia/model-name
                            2. Routes to default endpoint ──────▶ POST /v1/retrieval/nvidia/model-name/reranking


# Forced ranking endpoint  
model: "nvidia_nim/ranking/nvidia/model-name"
                            1. Detects "ranking/" prefix
                            2. Extracts model: nvidia/model-name
                            3. Routes to ranking endpoint ──────▶ POST /v1/ranking
                                                                  Body: {"model": "nvidia/model-name", ...}
```

**各端点的适用场景**：

| 端点 | 模型前缀 | 适用场景 |
|------|----------|----------|
| `/v1/retrieval/{model}/reranking` | `nvidia_nim/<model>` | 大多数重排序模型的默认端点 |
| `/v1/ranking` | `nvidia_nim/ranking/<model>` | 适用于 `nvidia/llama-3.2-nv-rerankqa-1b-v2` 这类必须使用该端点的模型 |

:::tip

查看 [NVIDIA NIM 模型部署页面](https://build.nvidia.com/nvidia/llama-3_2-nv-rerankqa-1b-v2/deploy)，确认你的模型需要哪种端点。

:::

## API 参数

### 必填参数

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `model` | string | 带 `nvidia_nim/` 前缀的 NVIDIA NIM 重排序模型名称 |
| `query` | string | 用于对文档排序的查询文本 |
| `documents` | array | 待排序的文档列表（1-1000 个文档） |

### 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `top_n` | integer | All documents | 返回排名靠前的文档数量 |

### NVIDIA 专属参数

**`truncate`**：控制文本超出模型上下文窗口时的截断方式
- `"NONE"`：不截断（文本过长时请求可能失败）
- `"END"`：从文本末尾开始截断

```python
response = litellm.rerank(
    model="nvidia_nim/nvidia/llama-3_2-nv-rerankqa-1b-v2",
    query="GPU performance",
    documents=["High performance computing", "Fast GPU processing"],
    top_n=2,
    truncate="END",  # Nvidia-specific parameter
)
```

## 身份验证

设置你的 NVIDIA NIM API 密钥：

<Tabs>
<TabItem value="env" label="环境变量">

```bash
export NVIDIA_NIM_API_KEY="nvapi-..."
```

</TabItem>
<TabItem value="python" label="Python">

```python
import os
os.environ['NVIDIA_NIM_API_KEY'] = "nvapi-..."

# Or pass directly
response = litellm.rerank(
    model="nvidia_nim/nvidia/llama-3_2-nv-rerankqa-1b-v2",
    query="test",
    documents=["doc1"],
    api_key="nvapi-...",
)
```

</TabItem>
</Tabs>

## 自定义 API Base URL

你可以通过多种方式覆盖默认的 Base URL：

**方式 1：环境变量**

```bash
export NVIDIA_NIM_API_BASE="https://your-custom-endpoint.com"
```

**方式 2：以参数形式传入**

```python
response = litellm.rerank(
    model="nvidia_nim/nvidia/llama-3_2-nv-rerankqa-1b-v2",
    query="test",
    documents=["doc1"],
    api_base="https://your-custom-endpoint.com",
)
```

**方式 3：完整 URL**（含模型路径）

如果你已经拿到完整的端点 URL，可以直接传入：

```python
response = litellm.rerank(
    model="nvidia_nim/nvidia/llama-3_2-nv-rerankqa-1b-v2",
    query="test",
    documents=["doc1"],
    api_base="https://your-custom-endpoint.com/v1/retrieval/nvidia/llama-3_2-nv-rerankqa-1b-v2/reranking",
)
```

LiteLLM 会自动识别完整 URL（通过检查路径中是否包含 `/retrieval/`），并按原样使用。

### 如何获取 API 密钥？

前往 [NVIDIA 官网](https://developer.nvidia.com/nim/) 获取 NVIDIA NIM API 密钥。

## 相关文档

- [NVIDIA NIM 主文档](./nvidia_nim)
- [NVIDIA NIM 对话补全](./nvidia_nim#使用示例)
- [LiteLLM 重排序端点](../rerank)
- [NVIDIA NIM 官方文档 ↗](https://docs.api.nvidia.com/nim/reference/)
