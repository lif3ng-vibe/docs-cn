import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# IBM watsonx.ai

LiteLLM 支持 IBM [watsonx.ai](https://watsonx.ai/) 的全部基础模型与嵌入模型。

## 环境变量
```python
os.environ["WATSONX_URL"] = ""  # (required) Base URL of your WatsonX instance
# (required) either one of the following:
os.environ["WATSONX_APIKEY"] = "" # IBM cloud API key
os.environ["WATSONX_TOKEN"] = "" # IAM auth token
# optional - can also be passed as params to completion() or embedding()
os.environ["WATSONX_PROJECT_ID"] = "" # Project ID of your WatsonX instance
os.environ["WATSONX_DEPLOYMENT_SPACE_ID"] = "" # ID of your deployment space to use deployed models
os.environ["WATSONX_ZENAPIKEY"] = "" # Zen API key (use for long-term api token)
```

有关如何获取访问令牌以认证 watsonx.ai 的更多信息，参见[这里](https://cloud.ibm.com/apidocs/watsonx-ai#api-authentication)。

## 用法

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/liteLLM_IBM_Watsonx.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="在 Colab 中打开"/>
</a>

```python showLineNumbers title="Chat Completion"
import os
from litellm import completion

os.environ["WATSONX_URL"] = ""
os.environ["WATSONX_APIKEY"] = ""

response = completion(
  model="watsonx/meta-llama/llama-3-1-8b-instruct",
  messages=[{ "content": "what is your favorite colour?","role": "user"}],
  project_id="<my-project-id>"
)
```

## 用法 - 流式
```python showLineNumbers title="Streaming"
import os
from litellm import completion

os.environ["WATSONX_URL"] = ""
os.environ["WATSONX_APIKEY"] = ""
os.environ["WATSONX_PROJECT_ID"] = ""

response = completion(
  model="watsonx/meta-llama/llama-3-1-8b-instruct",
  messages=[{ "content": "what is your favorite colour?","role": "user"}],
  stream=True
)
for chunk in response:
  print(chunk)
```

## 用法 - 部署空间中的模型

部署到部署空间（deployment space）中的模型（如微调后的模型），可以通过 `deployment/<deployment_id>` 格式调用。

```python showLineNumbers title="Deployment Space"
import litellm

response = litellm.completion(
    model="watsonx/deployment/<deployment_id>",
    messages=[{"content": "Hello, how are you?", "role": "user"}],
    space_id="<deployment_space_id>"
)
```

## 用法 - 嵌入

```python showLineNumbers title="Embeddings"
from litellm import embedding

response = embedding(
    model="watsonx/ibm/slate-30m-english-rtrvr",
    input=["What is the capital of France?"],
    project_id="<my-project-id>"
)
```

## LiteLLM 代理用法

### 1. 在环境中保存密钥

```bash
export WATSONX_URL=""
export WATSONX_APIKEY=""
export WATSONX_PROJECT_ID=""
```

### 2. 启动代理

<Tabs>
<TabItem value="cli" label="CLI">

```bash
$ litellm --model watsonx/meta-llama/llama-3-8b-instruct
```

</TabItem>
<TabItem value="config" label="config.yaml">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: llama-3-8b
    litellm_params:
      model: watsonx/meta-llama/llama-3-8b-instruct
      api_key: "os.environ/WATSONX_API_KEY"
```
</TabItem>
</Tabs>

### 3. 测试


<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
      "model": "llama-3-8b",
      "messages": [
        {
          "role": "user",
          "content": "what is your favorite colour?"
        }
      ]
    }'
```
</TabItem>
<TabItem value="openai" label="OpenAI SDK">

```python showLineNumbers
import openai

client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="llama-3-8b", 
    messages=[{"role": "user", "content": "what is your favorite colour?"}]
)
print(response)
```
</TabItem>
</Tabs>


## 支持的模型

| 模型名                             | 命令                                                                                      |
|------------------------------------|------------------------------------------------------------------------------------------|
| Llama 3.1 8B Instruct              | `completion(model="watsonx/meta-llama/llama-3-1-8b-instruct", messages=messages)`        |
| Llama 2 70B Chat                   | `completion(model="watsonx/meta-llama/llama-2-70b-chat", messages=messages)`             |
| Granite 13B Chat V2                | `completion(model="watsonx/ibm/granite-13b-chat-v2", messages=messages)`                 |
| Mixtral 8X7B Instruct              | `completion(model="watsonx/ibm-mistralai/mixtral-8x7b-instruct-v01-q", messages=messages)` |

全部可用模型参见 [watsonx.ai 文档](https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/fm-models.html?context=wx)。

## 支持的嵌入模型

| 模型名 | 函数调用                                                          |
|------------|------------------------------------------------------------------------|
| Slate 30m  | `embedding(model="watsonx/ibm/slate-30m-english-rtrvr", input=input)`  |
| Slate 125m | `embedding(model="watsonx/ibm/slate-125m-english-rtrvr", input=input)` |

全部可用嵌入模型参见 [watsonx.ai 嵌入文档](https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/fm-models-embed.html?context=wx)。


## 进阶

### 使用 Zen API 密钥

你可以使用 Zen API 密钥进行长期认证，无需再生成 IAM 令牌。既可以作为环境变量传入，也可以作为参数传入：

```python
import os
from litellm import completion

# Option 1: Set as environment variable
os.environ["WATSONX_ZENAPIKEY"] = "your-zen-api-key"

response = completion(
    model="watsonx/ibm/granite-13b-chat-v2",
    messages=[{"content": "What is your favorite color?", "role": "user"}],
    project_id="your-project-id"
)

# Option 2: Pass as parameter
response = completion(
    model="watsonx/ibm/granite-13b-chat-v2",
    messages=[{"content": "What is your favorite color?", "role": "user"}],
    zen_api_key="your-zen-api-key",
    project_id="your-project-id"
)
```

**通过 OpenAI 客户端配合 LiteLLM 代理使用**：

```python
import openai

client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",  # LiteLLM proxy key
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="watsonx/ibm/granite-3-3-8b-instruct",
    messages=[{"role": "user", "content": "What is your favorite color?"}],
    max_tokens=2048,
    extra_body={
        "project_id": "your-project-id",
        "zen_api_key": "your-zen-api-key"
    }
)
```

有关生成 Zen API 密钥的更多信息，参见 [IBM 文档](https://www.ibm.com/docs/en/watsonx/w-and-w/2.2.0?topic=keys-generating-zenapikey-authorization-tokens)。
