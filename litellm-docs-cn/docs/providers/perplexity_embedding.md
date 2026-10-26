import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Perplexity 嵌入

https://docs.perplexity.ai/docs/embeddings/quickstart

LiteLLM 支持 Perplexity 的 pplx-embed 系列嵌入（embedding）模型，可用于网络规模的文本检索。

## API 密钥

```python
# env variable
os.environ['PERPLEXITYAI_API_KEY']
```

## 嵌入用法示例

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
import os

os.environ['PERPLEXITYAI_API_KEY'] = ""

response = embedding(
    model="perplexity/pplx-embed-v1-0.6b",
    input=["good morning from litellm"],
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: pplx-embed-v1-0.6b
    litellm_params:
      model: perplexity/pplx-embed-v1-0.6b
      api_key: os.environ/PERPLEXITYAI_API_KEY
  - model_name: pplx-embed-v1-4b
    litellm_params:
      model: perplexity/pplx-embed-v1-4b
      api_key: os.environ/PERPLEXITYAI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl http://0.0.0.0:4000/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "pplx-embed-v1-0.6b",
    "input": ["good morning from litellm"]
  }'
```

</TabItem>
</Tabs>

## 支持的参数

Perplexity 嵌入支持以下可选参数：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `dimensions` | int | 输出嵌入的维度。0.6b 模型为 128–1024，4b 模型为 128–2560。默认取最大值。 |
| `encoding_format` | string | `"base64_int8"`（默认）或 `"base64_binary"`（压缩输出）。 |

### 参数用法示例

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
import os

os.environ['PERPLEXITYAI_API_KEY'] = ""

response = embedding(
    model="perplexity/pplx-embed-v1-4b",
    input=["Your text here"],
    dimensions=512,
)
print(f"Embedding dimensions: {len(response.data[0]['embedding'])}")
```

</TabItem>
<TabItem value="proxy" label="代理">

```bash
curl http://0.0.0.0:4000/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "pplx-embed-v1-4b",
    "input": ["Your text here"],
    "dimensions": 512
  }'
```

</TabItem>
</Tabs>

## 支持的模型

[Perplexity Embeddings 文档](https://docs.perplexity.ai/docs/embeddings/quickstart)中列出的所有模型均受支持。使用 `model=perplexity/<model-name>` 调用即可。

| 模型名称 | 维度 | 最大 Token 数 | 价格（每 1M Token） | 函数调用 |
|---|---|---|---|---|
| pplx-embed-v1-0.6b | 1024 | 32K | $0.004 | `embedding(model="perplexity/pplx-embed-v1-0.6b", input)` |
| pplx-embed-v1-4b | 2560 | 32K | $0.03 | `embedding(model="perplexity/pplx-embed-v1-4b", input)` |

### 关键规格

- **单次请求最大文本数**：512
- **单个输入最大 Token 数**：32,768
- **单次请求总量上限**：120,000 Token
- **Matryoshka 维度缩减**——把维度降到 128 以上，即可获得更快的检索速度与更低的存储占用
- **无需指令前缀**——文本可直接嵌入
- **嵌入向量不做归一化**——比较时请使用余弦相似度
