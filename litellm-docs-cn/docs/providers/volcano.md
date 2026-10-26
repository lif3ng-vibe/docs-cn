# 火山引擎（Volcengine）
https://www.volcengine.com/docs/82379/1263482

:::tip

**我们支持全部 Volcengine 模型，包括对话与嵌入模型；发送 litellm 请求时，只需为模型名加上 `model=volcengine/<any-model-on-volcengine>` 前缀**

:::

## API 密钥
```python
# env variable
os.environ['VOLCENGINE_API_KEY']
# or
os.environ['ARK_API_KEY']
```

## 使用示例
```python
from litellm import completion
import os

os.environ['VOLCENGINE_API_KEY'] = ""
response = completion(
    model="volcengine/<OUR_ENDPOINT_ID>",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    temperature=0.2,        # optional
    top_p=0.9,              # optional
    frequency_penalty=0.1,  # optional
    presence_penalty=0.1,   # optional
    max_tokens=10,          # optional
    stop=["\n\n"],          # optional
)
print(response)
```

## 使用示例：流式
```python
from litellm import completion
import os

os.environ['VOLCENGINE_API_KEY'] = ""
response = completion(
    model="volcengine/<OUR_ENDPOINT_ID>",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    stream=True,
    temperature=0.2,        # optional
    top_p=0.9,              # optional
    frequency_penalty=0.1,  # optional
    presence_penalty=0.1,   # optional
    max_tokens=10,          # optional
    stop=["\n\n"],          # optional
)

for chunk in response:
    print(chunk)
```

## 使用示例：嵌入
```python
from litellm import embedding
import os

os.environ['VOLCENGINE_API_KEY'] = ""
response = embedding(
    model="volcengine/doubao-embedding-text-240715",
    input=["hello world", "good morning"]
)
print(response)
```

### 支持的嵌入模型
- `doubao-embedding-large`（2048 维）
- `doubao-embedding-large-text-250515`（2048 维）
- `doubao-embedding-large-text-240915`（4096 维）
- `doubao-embedding`（2560 维）
- `doubao-embedding-text-240715`（2560 维）

### 嵌入参数
```python
from litellm import embedding

response = embedding(
    model="volcengine/doubao-embedding-text-240715",
    input=["sample text"],
    encoding_format="float",  # optional: "float" (default), "base64"
    user="user-123",          # optional: user identifier for tracking
)
```

## 支持的模型：💥 全部 Volcengine 模型都支持
对话补全与嵌入场景下，我们支持全部 `volcengine` 模型：
- **对话模型**：发送补全请求时，以 `volcengine/<OUR_ENDPOINT_ID>` 作为前缀
- **嵌入模型**：使用上文列出的具体模型名（如 `volcengine/doubao-embedding-text-240715`）

## 使用示例：LiteLLM 代理

### Config.yaml 配置

```yaml
model_list:
  # Chat model
  - model_name: volcengine-model
    litellm_params:
      model: volcengine/<OUR_ENDPOINT_ID>
      api_key: os.environ/VOLCENGINE_API_KEY
  # Embedding model
  - model_name: volcengine-embedding
    litellm_params:
      model: volcengine/doubao-embedding-text-240715
      api_key: os.environ/VOLCENGINE_API_KEY
```

### 发送请求

#### 对话补全
```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "volcengine-model",
    "messages": [
        {
        "role": "user",
        "content": "here is my api key. openai_api_key=sk-<your-api-key>"
        }
    ]
}'
```

#### 嵌入
```shell
curl --location 'http://localhost:4000/embeddings' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "volcengine-embedding",
    "input": ["hello world", "good morning"]
}'
```
