import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# CLI 快速上手

通过 CLI 快速搭建 LiteLLM 代理。

LiteLLM Server（LLM 网关）提供以下能力：

* **统一接口**：以 OpenAI `ChatCompletions` 和 `Completions` 格式调用 100 多种 LLM（[Huggingface/Bedrock/TogetherAI 等](/docs/proxy/quick_start#支持的-llm)）
* **成本追踪**：认证、花费追踪与预算，通过[虚拟密钥（virtual key）](https://docs.litellm.ai/docs/proxy/virtual_keys)实现
* **负载均衡**：在多个模型以及同一模型的多个部署（deployment）之间分发流量——LiteLLM 代理在压测中可承载每秒 1500+ 请求。

```shell
$ uv tool install 'litellm[proxy]'
```

:::warning[最低 Python 版本]
LiteLLM 1.84.0 及以上版本要求 Python {{python_min_version}} 或更高（`requires-python >={{python_min_version}}`）。`uv tool install` 会自动准备一个兼容的 Python，帮你满足这一要求；而直接 `pip install 'litellm[proxy]'` 不会。在较旧的解释器上，pip 会静默降级解析到最后一个仍允许该解释器的版本（旧下限对应 1.83.9），且不报任何错误。如果发现依赖被固定到了旧版本，请检查 `python --version`，升级到 {{python_min_version}}+（或改用 uv）后重新安装。
:::

## 快速上手：LiteLLM 代理 CLI

运行以下命令启动 litellm 代理
```shell
$ litellm --model huggingface/bigcode/starcoder

#INFO: Proxy running on http://0.0.0.0:4000
```


:::info

如需详细调试日志，可在启动时加上 `--detailed_debug`

```shell
$ litellm --model huggingface/bigcode/starcoder --detailed_debug
```
:::

### 测试
另开一个终端运行如下命令，它会发起一次 `openai.chat.completions` 请求。请确保 openai 版本不低于 v1.0.0
```shell
litellm --test
```

此后，所有发往 gpt-3.5-turbo 的请求都会被自动路由到托管在 huggingface 推理端点上的 bigcode starcoder。

### 支持的 LLM
代理支持所有 LiteLLM 支持的 LLM。完整列表见[支持的 LLM](https://docs.litellm.ai/docs/providers)。
<Tabs>
<TabItem value="bedrock" label="AWS Bedrock">

```shell
$ export AWS_ACCESS_KEY_ID=
$ export AWS_REGION_NAME=
$ export AWS_SECRET_ACCESS_KEY=
```

```shell
$ litellm --model bedrock/us.anthropic.{{anthropic}}
```
</TabItem>
<TabItem value="azure" label="Azure OpenAI">

```shell
$ export AZURE_API_KEY=my-api-key
$ export AZURE_API_BASE=my-api-base
```
```
$ litellm --model azure/my-deployment-name
```

</TabItem>
<TabItem value="openai" label="OpenAI">

```shell
$ export OPENAI_API_KEY=my-api-key
```

```shell
$ litellm --model {{openai_small}}
```
</TabItem>
<TabItem value="ollama" label="Ollama">

```
$ litellm --model ollama/<ollama-model-name>
```

</TabItem>
<TabItem value="openai-proxy" label="OpenAI 兼容端点">

```shell
$ export OPENAI_API_KEY=my-api-key
```

```shell
$ litellm --model openai/<your model name> --api_base <your-api-base> # e.g. http://0.0.0.0:3000
```
</TabItem>

<TabItem value="vertex-ai" label="Vertex AI [Gemini]">

```shell
$ export VERTEX_PROJECT="hardy-project"
$ export VERTEX_LOCATION="us-west"
```

```shell
$ litellm --model vertex_ai/{{gemini_flash}}
```
</TabItem>

<TabItem value="huggingface" label="Huggingface（TGI）远程部署">

```shell
$ export HUGGINGFACE_API_KEY=my-api-key #[OPTIONAL]
```
```shell
$ litellm --model huggingface/<your model name> --api_base <your-api-base> # e.g. http://0.0.0.0:3000
```

</TabItem>
<TabItem value="huggingface-local" label="Huggingface（TGI）本地部署">

```shell
$ litellm --model huggingface/<your model name> --api_base http://0.0.0.0:8001
```

</TabItem>
<TabItem value="aws-sagemaker" label="AWS Sagemaker">

```shell
export AWS_ACCESS_KEY_ID=
export AWS_REGION_NAME=
export AWS_SECRET_ACCESS_KEY=
```

```shell
$ litellm --model sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b
```

</TabItem>
<TabItem value="anthropic" label="Anthropic">

```shell
$ export ANTHROPIC_API_KEY=my-api-key
```
```shell
$ litellm --model {{anthropic}}
```

</TabItem>
<TabItem value="vllm-local" label="VLLM">
假设 vllm 运行在本地

```shell
$ litellm --model vllm/facebook/opt-125m
```
</TabItem>
<TabItem value="together_ai" label="TogetherAI">

```shell
$ export TOGETHERAI_API_KEY=my-api-key
```
```shell
$ litellm --model together_ai/lmsys/vicuna-13b-v1.5-16k
```

</TabItem>

<TabItem value="replicate" label="Replicate">

```shell
$ export REPLICATE_API_KEY=my-api-key
```
```shell
$ litellm \
  --model replicate/meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3
```

</TabItem>

<TabItem value="petals" label="Petals">

```shell
$ litellm --model petals/meta-llama/Llama-2-70b-chat-hf
```

</TabItem>

<TabItem value="gemini" label="Gemini (Google AI Studio)">

```shell
$ export GEMINI_API_KEY=my-gemini-key
```
```shell
$ litellm --model gemini/{{gemini_flash}}
```

</TabItem>

<TabItem value="ai21" label="AI21">

```shell
$ export AI21_API_KEY=my-api-key
```

```shell
$ litellm --model j2-light
```

</TabItem>

<TabItem value="cohere" label="Cohere">

```shell
$ export COHERE_API_KEY=my-api-key
```

```shell
$ litellm --model command-nightly
```

</TabItem>

</Tabs>

## 快速上手：LiteLLM 代理 + Config.yaml
通过配置文件可以创建模型列表，并设置 `api_base`、`max_tokens` 等 litellm 参数。配置的更多细节见[这里](https://docs.litellm.ai/docs/proxy/configs)

### 为 LiteLLM 代理创建配置
配置示例

```yaml
model_list: 
  - model_name: {{openai_small}} # user-facing model alias
    litellm_params: # all params accepted by litellm.completion() - https://docs.litellm.ai/docs/completion/input
      model: azure/<your-deployment-name>
      api_base: <your-azure-api-endpoint>
      api_key: <your-azure-api-key>
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/gpt-turbo-small-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: <your-azure-api-key>
  - model_name: vllm-model
    litellm_params:
      model: openai/<your-model-name>
      api_base: <your-vllm-api-base> # e.g. http://0.0.0.0:3000/v1
      api_key: <your-vllm-api-key|none>
```

### 使用配置运行代理

```shell
litellm --config your_config.yaml
```


## 使用 LiteLLM 代理：Curl 请求、OpenAI 包、Langchain

:::info
LiteLLM 兼容多种 SDK，包括 OpenAI SDK、Anthropic SDK、Mistral SDK、LLamaIndex、Langchain（JS、Python）

[更多示例见这里](user_keys)
:::

<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "{{openai_small}}",
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
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="{{openai_small}}", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)

```
</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000", # set openai_api_base to the LiteLLM Proxy
    model = "{{openai_small}}",
    temperature=0.1
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```

</TabItem>
<TabItem value="langchain-embedding" label="Langchain 嵌入">

```python
from langchain.embeddings import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="sagemaker-embeddings", openai_api_base="http://0.0.0.0:4000", openai_api_key="temp-key")


text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"SAGEMAKER EMBEDDINGS")
print(query_result[:5])

embeddings = OpenAIEmbeddings(model="bedrock-embeddings", openai_api_base="http://0.0.0.0:4000", openai_api_key="temp-key")

text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"BEDROCK EMBEDDINGS")
print(query_result[:5])

embeddings = OpenAIEmbeddings(model="bedrock-titan-embeddings", openai_api_base="http://0.0.0.0:4000", openai_api_key="temp-key")

text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"TITAN EMBEDDINGS")
print(query_result[:5])
```
</TabItem>
<TabItem value="litellm" label="LiteLLM SDK">

**不推荐**这种用法。代理自身也在使用这套 SDK，存在重复逻辑，可能引发意料之外的错误。

```python
from litellm import completion 

response = completion(
    model="openai/{{openai_small}}", 
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ], 
    api_key="anything", 
    base_url="http://0.0.0.0:4000"
    )

print(response)

```
</TabItem>

<TabItem value="anthropic-py" label="Anthropic Python SDK">

```python
import os

from anthropic import Anthropic

client = Anthropic(
    base_url="http://localhost:4000", # proxy endpoint
    api_key="sk-test-proxy-key-123", # litellm proxy virtual key (example)
)

message = client.messages.create(
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Hello, Claude",
        }
    ],
    model="{{anthropic}}",
)
print(message.content)
```

</TabItem>

</Tabs>

[**更多信息**](./configs.md)



## 📖 代理端点 - [Swagger 文档](https://docs.litellm.ai/api-reference/)
- POST `/chat/completions` - 对话补全端点，可调用 100 多种 LLM
- POST `/completions` - 补全端点
- POST `/embeddings` - 嵌入端点，适用于 Azure、OpenAI、Huggingface 端点
- GET `/models` - 服务器上当前可用的模型
- POST `/key/generate` - 生成用于访问代理的密钥


## 代理调试

正常运行期间发生的事件
```shell
litellm --model {{openai_small}} --debug
```

详细信息
```shell
litellm --model {{openai_small}} --detailed_debug
```

### 通过环境变量设置调试级别

正常运行期间发生的事件
```shell
export LITELLM_LOG=INFO
```

详细信息
```shell
export LITELLM_LOG=DEBUG
```

仅记录错误
```shell
export LITELLM_LOG=ERROR
```

`LITELLM_LOG` 必须是有效的 Python 日志级别（`DEBUG`、`INFO`、`WARNING`、`ERROR`、`CRITICAL`）。设为 `None` 会导致 `import litellm` 失败。
