
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cohere

## API 密钥

```python
import os 
os.environ["COHERE_API_KEY"] = ""
```

## 用法

### LiteLLM Python SDK

#### Cohere v2 API（默认）

```python showLineNumbers
from litellm import completion

## set ENV variables
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere v2 call
response = completion(
    model="cohere_chat/command-a-03-2025", 
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

#### Cohere v1 API

要使用 Cohere v1/chat API，请在模型名前加上 `cohere_chat/v1/` 前缀：

```python showLineNumbers
from litellm import completion

## set ENV variables
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere v1 call
response = completion(
    model="cohere_chat/v1/command-a-03-2025", 
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

#### 流式（streaming）

**Cohere v2 流式**：

```python showLineNumbers
from litellm import completion

## set ENV variables
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere v2 streaming
response = completion(
    model="cohere_chat/command-a-03-2025", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    stream=True
)

for chunk in response:
    print(chunk)
```


**Cohere v1 流式**：

```python showLineNumbers
from litellm import completion

## set ENV variables
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere v1 streaming
response = completion(
    model="cohere_chat/v1/command-a-03-2025", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    stream=True
)

for chunk in response:
    print(chunk)
```


## 配合 LiteLLM 代理服务器使用

以下是通过 LiteLLM 代理服务器调用 Cohere 的方法。

### 1. 在环境中保存密钥

```bash
export COHERE_API_KEY="your-api-key"
```

### 2. 启动代理

在 config.yaml 中定义你要使用的 Cohere 模型。

**Cohere v1 模型**：
```yaml showLineNumbers
model_list:
  - model_name: command-a-03-2025 
    litellm_params:
      model: cohere_chat/v1/command-a-03-2025
      api_key: "os.environ/COHERE_API_KEY"
```

**Cohere v2 模型**：
```yaml showLineNumbers
model_list:
  - model_name: command-a-03-2025-v2
    litellm_params:
      model: cohere_chat/command-a-03-2025
      api_key: "os.environ/COHERE_API_KEY"
```

```bash
litellm --config /path/to/config.yaml
```


### 3. 测试

<Tabs>
<TabItem value="v1-curl" label="Cohere v1 - Curl 请求">

```shell showLineNumbers
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <your-litellm-api-key>' \
--data ' {
      "model": "command-a-03-2025",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="v2-curl" label="Cohere v2 - Curl 请求">

```shell showLineNumbers
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <your-litellm-api-key>' \
--data ' {
      "model": "command-a-03-2025-v2",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="v1-openai" label="Cohere v1 - OpenAI SDK">

```python showLineNumbers
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to cohere v1 model
response = client.chat.completions.create(model="command-a-03-2025", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)
```
</TabItem>
<TabItem value="v2-openai" label="Cohere v2 - OpenAI SDK">

```python showLineNumbers
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to cohere v2 model
response = client.chat.completions.create(model="command-a-03-2025-v2", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)
```
</TabItem>
</Tabs>


## 支持的模型
| 模型名称 | 函数调用 |
|------------|----------------|
| command-a-03-2025 | `litellm.completion('command-a-03-2025', messages)` |
| command-r-plus-08-2024 | `litellm.completion('command-r-plus-08-2024', messages)` |  
| command-r-08-2024 | `litellm.completion('command-r-08-2024', messages)` |
| command-r-plus | `litellm.completion('command-r-plus', messages)` |  
| command-r | `litellm.completion('command-r', messages)` |
| command-light | `litellm.completion('command-light', messages)` |  
| command-nightly | `litellm.completion('command-nightly', messages)` |


## 嵌入（embedding）

```python
from litellm import embedding
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere call
response = embedding(
    model="embed-english-v3.0", 
    input=["good morning from litellm", "this is another item"], 
)
```

### 为 v3 模型设置 input_type
v3 模型有一个必填参数：`input_type`。LiteLLM 默认使用 `search_document`，该参数可取以下四个值之一：

- `input_type="search_document"`：（默认）用于要存入向量数据库的文本（文档）
- `input_type="search_query"`：用于搜索查询，从向量数据库中找出最相关的文档
- `input_type="classification"`：把嵌入结果作为分类系统的输入时使用
- `input_type="clustering"`：用嵌入结果做文本聚类时使用

https://txt.cohere.com/introducing-embed-v3/


```python
from litellm import embedding
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere call
response = embedding(
    model="embed-english-v3.0", 
    input=["good morning from litellm", "this is another item"], 
    input_type="search_document" 
)
```

### 支持的嵌入模型
| 模型名称               | 函数调用                                                |
|--------------------------|--------------------------------------------------------------|
| embed-english-v3.0       | `embedding(model="embed-english-v3.0", input=["good morning from litellm", "this is another item"])` |
| embed-english-light-v3.0 | `embedding(model="embed-english-light-v3.0", input=["good morning from litellm", "this is another item"])` |
| embed-multilingual-v3.0  | `embedding(model="embed-multilingual-v3.0", input=["good morning from litellm", "this is another item"])` |
| embed-multilingual-light-v3.0 | `embedding(model="embed-multilingual-light-v3.0", input=["good morning from litellm", "this is another item"])` |
| embed-english-v2.0       | `embedding(model="embed-english-v2.0", input=["good morning from litellm", "this is another item"])` |
| embed-english-light-v2.0 | `embedding(model="embed-english-light-v2.0", input=["good morning from litellm", "this is another item"])` |
| embed-multilingual-v2.0  | `embedding(model="embed-multilingual-v2.0", input=["good morning from litellm", "this is another item"])` |

## 重排序（rerank）

### 用法

LiteLLM 的 Cohere 重排序同时支持 v1 与 v2 两种客户端。`rerank` 端点默认使用 v2 客户端；要改用 v1 客户端，请显式调用 `v1/rerank`。

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK 用法">

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
</TabItem>

<TabItem value="proxy" label="LiteLLM 代理用法">

LiteLLM 提供与 Cohere API 兼容的 `/rerank` 端点，用于重排序调用。

**配置**

将以下内容加入 litellm 代理的 config.yaml。

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

启动 litellm

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

测试请求

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

</TabItem>
</Tabs>

## Parse（OCR）

[Cohere Parse](https://docs.cohere.com/reference/parse) 可以把文档图片转成 markdown。LiteLLM 通过 [`/ocr` 端点](../ocr)提供这一能力，因此请求与响应的格式和其他 OCR 提供商（provider）保持一致，每次调用都会按计费页数进行成本追踪（cost tracking）。

Parse 仅接受 `image_url` 类型的文档：图片 URL 或 base64 编码的 `data:image/...` URI。PDF 与 `document_url` 输入会在请求发往 Cohere 之前被拒绝并返回 400 错误。

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK 用法">

```python showLineNumbers
import os
from litellm import ocr

os.environ["COHERE_API_KEY"] = ""

response = ocr(
    model="cohere/parse-v5.0",
    document={
        "type": "image_url",
        "image_url": "https://raw.githubusercontent.com/mistralai/cookbook/refs/heads/main/mistral/ocr/receipt.png",
    },
)

for page in response.pages:
    print(page.markdown)
print(response.usage_info.pages_processed)
```
</TabItem>

<TabItem value="proxy" label="LiteLLM 代理用法">

**配置**

将以下内容加入 litellm 代理的 config.yaml。

```yaml
model_list:
  - model_name: cohere-parse
    litellm_params:
      model: cohere/parse-v5.0
      api_key: os.environ/COHERE_API_KEY
```

启动 litellm

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

测试请求

```bash
curl http://0.0.0.0:4000/v1/ocr \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cohere-parse",
    "document": {
      "type": "image_url",
      "image_url": "https://raw.githubusercontent.com/mistralai/cookbook/refs/heads/main/mistral/ocr/receipt.png"
    }
  }'
```
</TabItem>
</Tabs>

### 支持的参数

| 参数 | 取值 | 说明 |
|-----------|--------|-------------|
| `output_format` | `markdown` (default), `blocks` | Cohere 的输出布局。使用 `blocks` 时，每一页都会携带 Cohere 的 `blocks` 数组，`markdown` 为空 |
| `req_format` | `litellm` (default), `native` | `native` 会返回 Cohere 原生的响应体，而非 LiteLLM 的 OCR 结构 |

部署在 Azure AI Foundry 上的 Cohere Parse 参见 [Azure AI OCR](./azure_ocr#cohere-parse)。
