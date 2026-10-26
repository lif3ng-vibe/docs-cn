import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex AI 自部署模型

通过 Model Garden 或自定义端点（custom endpoint），在 Vertex AI 上部署并使用你自己的模型。

## Model Garden

:::tip

Vertex Model Garden 中所有与 OpenAI 兼容的模型均已支持。

:::

### 使用 Model Garden

**几乎所有 Vertex Model Garden 模型都与 OpenAI 兼容**。

<Tabs>

<TabItem value="openai" label="OpenAI 兼容模型">

| 属性 | 说明 |
|----------|---------|
| 提供商路由（Provider Route） | `vertex_ai/openai/{MODEL_ID}` |
| Vertex 文档 | [Model Garden LiteLLM 推理](https://github.com/GoogleCloudPlatform/generative-ai/blob/main/open-models/use-cases/model_garden_litellm_inference.ipynb), [Vertex Model Garden](https://cloud.google.com/model-garden?hl=en) |
| 支持的操作 | `/chat/completions`, `/embeddings` |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

## set ENV variables
os.environ["VERTEXAI_PROJECT"] = "hardy-device-38811"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = completion(
  model="vertex_ai/openai/<your-endpoint-id>", 
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>

<TabItem value="proxy" label="Proxy">


**1. 添加到配置文件**

```yaml
model_list:
    - model_name: llama3-1-8b-instruct
      litellm_params:
        model: vertex_ai/openai/5464397967697903616
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-east-1"
```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 测试**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header "Authorization: Bearer $LITELLM_API_KEY" \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "llama3-1-8b-instruct", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```




</TabItem>

</Tabs>

</TabItem>

<TabItem value="non-openai" label="非 OpenAI 兼容模型">

```python
from litellm import completion
import os

## set ENV variables
os.environ["VERTEXAI_PROJECT"] = "hardy-device-38811"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = completion(
  model="vertex_ai/<your-endpoint-id>", 
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>

</Tabs>

## Gemma 模型（自定义端点）

在自定义 Vertex AI 预测端点上以 OpenAI 兼容格式部署 Gemma 模型。

| 属性 | 说明 |
|----------|---------|
| 提供商路由（Provider Route） | `vertex_ai/gemma/{MODEL_NAME}` |
| Vertex 文档 | [Vertex AI 预测](https://cloud.google.com/vertex-ai/docs/predictions/get-predictions) |
| 必填参数 | `api_base` - 完整的预测端点 URL |

**代理用法**：

**1. 添加到 config.yaml**

```yaml
model_list:
  - model_name: gemma-model
    litellm_params:
      model: vertex_ai/gemma/gemma-3-12b-it-1222199011122
      api_base: https://ENDPOINT.us-central1-PROJECT.prediction.vertexai.goog/v1/projects/PROJECT_ID/locations/us-central1/endpoints/ENDPOINT_ID:predict
      vertex_project: "my-project-id"
      vertex_location: "us-central1"
```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml
```

**3. 测试**

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "gemma-model",
    "messages": [{"role": "user", "content": "What is machine learning?"}],
    "max_tokens": 100
  }'
```

**SDK 用法**：

```python
from litellm import completion

response = completion(
    model="vertex_ai/gemma/gemma-3-12b-it-1222199011122",
    messages=[{"role": "user", "content": "What is machine learning?"}],
    api_base="https://ENDPOINT.us-central1-PROJECT.prediction.vertexai.goog/v1/projects/PROJECT_ID/locations/us-central1/endpoints/ENDPOINT_ID:predict",
    vertex_project="my-project-id",
    vertex_location="us-central1",
)
```

## MedGemma 模型（自定义端点）

在自定义 Vertex AI 预测端点上以 OpenAI 兼容格式部署 MedGemma 模型。MedGemma 模型使用相同的 `vertex_ai/gemma/` 路由。

| 属性 | 说明 |
|----------|---------|
| 提供商路由（Provider Route） | `vertex_ai/gemma/{MODEL_NAME}` |
| Vertex 文档 | [Vertex AI 预测](https://cloud.google.com/vertex-ai/docs/predictions/get-predictions) |
| 必填参数 | `api_base` - 完整的预测端点 URL |

**代理用法**：

**1. 添加到 config.yaml**

```yaml
model_list:
  - model_name: medgemma-model
    litellm_params:
      model: vertex_ai/gemma/medgemma-2b-v1
      api_base: https://ENDPOINT.us-central1-PROJECT.prediction.vertexai.goog/v1/projects/PROJECT_ID/locations/us-central1/endpoints/ENDPOINT_ID:predict
      vertex_project: "my-project-id"
      vertex_location: "us-central1"
```

**2. 启动代理**

```bash
litellm --config /path/to/config.yaml
```

**3. 测试**

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "medgemma-model",
    "messages": [{"role": "user", "content": "What are the symptoms of hypertension?"}],
    "max_tokens": 100
  }'
```

**SDK 用法**：

```python
from litellm import completion

response = completion(
    model="vertex_ai/gemma/medgemma-2b-v1",
    messages=[{"role": "user", "content": "What are the symptoms of hypertension?"}],
    api_base="https://ENDPOINT.us-central1-PROJECT.prediction.vertexai.goog/v1/projects/PROJECT_ID/locations/us-central1/endpoints/ENDPOINT_ID:predict",
    vertex_project="my-project-id",
    vertex_location="us-central1",
)
```
