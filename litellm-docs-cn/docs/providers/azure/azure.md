
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure OpenAI

## 概述

| 属性 | 说明 |
|-------|-------|
| 描述 | Azure OpenAI 服务通过 REST API 提供 OpenAI 旗下强大的语言模型，涵盖 o1、o1-mini、GPT-5、GPT-4o、GPT-4o mini、GPT-4 Turbo with Vision、GPT-4、GPT-3.5-Turbo 以及 Embeddings 系列模型；此外还支持通过 Azure Foundry 使用 Claude 模型。 |
| LiteLLM 中的提供商路由 | `azure/`、[`azure/o_series/`](#o-系列模型)、[`azure/gpt5_series/`](#gpt-5-模型)。经 Azure Foundry 使用的 Claude 模型则改走 [`azure_ai/claude-*`](/docs/providers/azure/azure_anthropic) 路由。 |
| 支持的操作 | [`/chat/completions`](#azure-openai-对话补全模型)、[`/responses`](/docs/providers/azure/azure_responses)、[`/completions`](#azure-instruct-模型)、[`/embeddings`](/docs/providers/azure/azure_embedding)、[`/audio/speech`](/docs/providers/azure/azure_speech)、[`/audio/transcriptions`](/docs/audio_transcription)、`/fine_tuning`、[`/batches`](#azure-batches-api)、`/files`、[`/images`](/docs/image_generation#azure-openai-图像生成模型) |
| 官方提供商文档 | [Azure OpenAI ↗](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview)、[Azure Foundry Claude ↗](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-claude) |

## API 密钥与参数
api_key、api_base、api_version 等参数可以直接传给 `litellm.completion`，也可以设置为 `litellm.api_key` 参数。
```python
import os
os.environ["AZURE_API_KEY"] = "" # "my-azure-api-key"
os.environ["AZURE_API_BASE"] = "" # "https://example-endpoint.openai.azure.com"
os.environ["AZURE_API_VERSION"] = "" # "2023-05-15"

# optional
os.environ["AZURE_AD_TOKEN"] = ""
os.environ["AZURE_API_TYPE"] = ""
```

:::info[Azure Foundry Claude 模型]

经 Azure Foundry 使用的 Claude 模型走的是 `azure_ai/` 提供商，而不是 `azure/`。请使用 `azure_ai/claude-*` 模型名（例如 `azure_ai/{{anthropic}}`）并配合 Azure 认证。详情见 [Azure Anthropic 文档](/docs/providers/azure/azure_anthropic)。

:::

## **用法：LiteLLM Python SDK**
<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_Azure_OpenAI.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

### 补全：使用 .env 环境变量

```python
from litellm import completion

## set ENV variables
os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

# azure call
response = completion(
    model = "azure/<your_deployment_name>", 
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

### 补全：使用 api_key、api_base、api_version

```python
import litellm

# azure call
response = litellm.completion(
    model = "azure/<your deployment name>",             # model = azure/<your deployment name> 
    api_base = "",                                      # azure api base
    api_version = "",                                   # azure api version
    api_key = "",                                       # azure api key
    messages = [{"role": "user", "content": "good morning"}],
)
```

### 补全：使用 azure_ad_token、api_base、api_version

```python
import litellm

# azure call
response = litellm.completion(
    model = "azure/<your deployment name>",             # model = azure/<your deployment name> 
    api_base = "",                                      # azure api base
    api_version = "",                                   # azure api version
    azure_ad_token="", 									# azure_ad_token 
    messages = [{"role": "user", "content": "good morning"}],
)
```


## **用法：LiteLLM 代理服务器**

下面介绍如何通过 LiteLLM 代理服务器调用 Azure OpenAI 模型。

### 1. 将密钥保存到环境变量

```bash
export AZURE_API_KEY=""
```

### 2. 启动代理

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      api_key: os.environ/AZURE_API_KEY # The `os.environ/` prefix tells litellm to read this from the env.
```

### 3. 测试

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
</Tabs>


### 设置 API 版本

可以通过以下几种方式，在代理的 config.yaml 中为 Azure OpenAI 设置 `api_version`。

#### 选项 1：按模型配置

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/my-gpt4-deployment
      api_base: https://your-resource.openai.azure.com/
      api_version: "2024-08-01-preview"  # Set version per model
      api_key: os.environ/AZURE_API_KEY
```





## Azure OpenAI 对话补全模型

:::tip

**我们支持所有 Azure 模型：发送 litellm 请求时，只需使用 `model=azure/<your deployment name>` 这样的前缀形式即可**

:::

| 模型名       | 调用方式                          |
|------------------|----------------------------------------|
| o1-mini | `response = completion(model="azure/<your deployment name>", messages=messages)` |
| o1-preview | `response = completion(model="azure/<your deployment name>", messages=messages)` |
| gpt-5 | `response = completion(model="azure/<your deployment name>", messages=messages)` |
| gpt-4o-mini            | `completion('azure/<your deployment name>', messages)`         |
| gpt-4o            | `completion('azure/<your deployment name>', messages)`         |
| gpt-4            | `completion('azure/<your deployment name>', messages)`         |
| gpt-4-0314            | `completion('azure/<your deployment name>', messages)`         | 
| gpt-4-0613            | `completion('azure/<your deployment name>', messages)`         |
| gpt-4-32k            | `completion('azure/<your deployment name>', messages)`         | 
| gpt-4-32k-0314            | `completion('azure/<your deployment name>', messages)`         |
| gpt-4-32k-0613            | `completion('azure/<your deployment name>', messages)`         | 
| gpt-4-1106-preview            | `completion('azure/<your deployment name>', messages)`         | 
| gpt-4-0125-preview            | `completion('azure/<your deployment name>', messages)`         | 
| gpt-3.5-turbo    | `completion('azure/<your deployment name>', messages)` |
| gpt-3.5-turbo-0301    | `completion('azure/<your deployment name>', messages)` |
| gpt-3.5-turbo-0613    | `completion('azure/<your deployment name>', messages)` |
| gpt-3.5-turbo-16k    | `completion('azure/<your deployment name>', messages)` |
| gpt-3.5-turbo-16k-0613    | `completion('azure/<your deployment name>', messages)`

## Azure OpenAI 视觉模型 
| 模型名            | 调用方式                                                   |
|-----------------------|-----------------------------------------------------------------|
| gpt-4-vision   | `completion(model="azure/<your deployment name>", messages=messages)` |
| gpt-4o            | `completion('azure/<your deployment name>', messages)`         |

#### 用法
```python
import os 
from litellm import completion

os.environ["AZURE_API_KEY"] = "your-api-key"

# azure call
response = completion(
    model = "azure/<your deployment name>", 
    messages=[
        {
            "role": "user",
            "content": [
                            {
                                "type": "text",
                                "text": "What’s in this image?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png"
                                }
                            }
                        ]
        }
    ],
)

```

#### 用法：使用 Azure 视觉增强

注意：**Azure 要求在 `base_url` 中带上 `/extensions`**

示例 
```python
base_url="https://gpt-4-vision-resource.openai.azure.com/openai/deployments/gpt-4-vision/extensions"
# base_url="{azure_endpoint}/openai/deployments/{azure_deployment}/extensions"
```

**用法**
```python
import os 
from litellm import completion

os.environ["AZURE_API_KEY"] = "your-api-key"

# azure call
response = completion(
            model="azure/gpt-4-vision",
            timeout=5,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Whats in this image?"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": "https://avatars.githubusercontent.com/u/29436595?v=4"
                            },
                        },
                    ],
                }
            ],
            base_url="https://gpt-4-vision-resource.openai.azure.com/openai/deployments/gpt-4-vision/extensions",
            api_key=os.getenv("AZURE_VISION_API_KEY"),
            enhancements={"ocr": {"enabled": True}, "grounding": {"enabled": True}},
            dataSources=[
                {
                    "type": "AzureComputerVision",
                    "parameters": {
                        "endpoint": "https://gpt-4-vision-enhancement.cognitiveservices.azure.com/",
                        "key": os.environ["AZURE_VISION_ENHANCE_KEY"],
                    },
                }
            ],
)
```

## O 系列模型

LiteLLM 支持 Azure OpenAI 的 O 系列模型。

只要部署名中的模型名包含 `o1` 或 `o3`，LiteLLM 就会采用 O 系列的[转换](https://github.com/BerriAI/litellm/blob/91ed05df2962b8eee8492374b048d27cc144d08c/litellm/llms/azure/chat/o1_transformation.py#L4)逻辑来处理请求。

如需显式指定，请将 `model` 设为 `azure/o_series/<your-deployment-name>`。

**自动路由**

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

litellm.completion(model="azure/my-o3-deployment", messages=[{"role": "user", "content": "Hello, world!"}]) # 👈 Note: 'o3' in the deployment name
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: o3-mini
    litellm_params:
      model: azure/o3-model
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
```

</TabItem>
</Tabs>

**显式路由**

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

litellm.completion(model="azure/o_series/my-random-deployment-name", messages=[{"role": "user", "content": "Hello, world!"}]) # 👈 Note: 'o_series/' in the deployment name
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: o3-mini
    litellm_params:
      model: azure/o_series/my-random-deployment-name
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
```
</TabItem>
</Tabs>


## GPT-5 模型

| 属性 | 说明 |
|-------|-------|
| 描述 | Azure OpenAI 的 GPT-5 系列模型 |
| LiteLLM 中的提供商路由 | `azure/gpt5_series/<custom-name>` 或 `azure/gpt-5-deployment-name` |

LiteLLM 支持通过以下两种方式之一使用 Azure 的 GPT-5 模型：
1. 显式路由：`model = azure/gpt5_series/<deployment-name>`。此时接入 litellm 的模型按 `model=azure/gpt5_series/<deployment-name>` 的格式书写。
2. 推断路由（Azure 部署名中包含 `gpt-5` 时）：`model = azure/gpt-5.6-luna`。此时接入 litellm 的模型按 `model=azure/gpt-5.6-luna` 的格式书写。

#### 显式路由
使用 `azure/gpt5_series/<deployment-name>` 显式指定 GPT-5 模型的路由。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

response = litellm.completion(
    model="azure/gpt5_series/my-gpt-5-deployment",
    messages=[{"role": "user", "content": "Hello, world!"}]
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: azure/gpt5_series/my-gpt-5-deployment
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
```

</TabItem>
</Tabs>

#### 推断路由（部署名含 gpt-5）
如果你的 Azure 部署名中包含 `gpt-5`，LiteLLM 会自动将其识别为 GPT-5 模型。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

# Deployment name contains 'gpt-5' - automatically inferred
response = litellm.completion(
    model="azure/my-gpt-5-deployment", 
    messages=[{"role": "user", "content": "Hello, world!"}]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml keep-model-ids
model_list:
  - model_name: gpt-5.6-luna
    litellm_params:
      model: azure/my-gpt-5-deployment  # deployment name contains 'gpt-5'
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
```

</TabItem>
</Tabs>





## Azure 音频模型

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

response = completion(
    model="azure/azure-openai-4o-audio",
    messages=[
      {
        "role": "user",
        "content": "I want to try out speech to speech"
      }
    ],
    modalities=["text","audio"],
    audio={"voice": "alloy", "format": "wav"}
)

print(response)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: azure-openai-4o-audio
    litellm_params:
      model: azure/azure-openai-4o-audio
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: os.environ/AZURE_API_VERSION
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试！


```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-openai-4o-audio",
    "messages": [{"role": "user", "content": "I want to try out speech to speech"}],
    "modalities": ["text","audio"],
    "audio": {"voice": "alloy", "format": "wav"}
  }'
```


</TabItem>
</Tabs>

## Azure Instruct 模型

使用 `model="azure_text/<your-deployment>"`

| 模型名          | 调用方式                                      |
|---------------------|----------------------------------------------------|
| gpt-3.5-turbo-instruct | `response = completion(model="azure_text/<your deployment name>", messages=messages)` |
| gpt-3.5-turbo-instruct-0914 | `response = completion(model="azure_text/<your deployment name>", messages=messages)` |


```python
import litellm

## set ENV variables
os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

response = litellm.completion(
    model="azure_text/<your-deployment-name",
    messages=[{"role": "user", "content": "What is the weather like in Boston?"}]
)

print(response)
```

## **认证**


### Entra ID：使用 `azure_ad_token`

本节演示如何使用 Azure Active Directory 令牌（Microsoft Entra ID）发起 `litellm.completion()` 调用。  
> **注意**：下面的同样流程，也适用于在 LiteLLM 中为所有其他 Azure 端点（如对话补全、嵌入、图像、音频等）使用 Azure Active Directory 令牌。

第 1 步：下载 Azure CLI  
安装说明：https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
```shell
brew update && brew install azure-cli
```
第 2 步：使用 `az` 登录
```shell
az login --output table
```

第 3 步：生成 Azure AD 令牌
```shell
az account get-access-token --resource https://cognitiveservices.azure.com
```

这一步你应该能看到一个生成的 `accessToken`
```shell
{
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjlHbW55RlBraGMzaE91UjIybXZTdmduTG83WSIsImtpZCI6IjlHbW55RlBraGMzaE91UjIybXZTdmduTG83WSJ9",
  "expiresOn": "2023-11-14 15:50:46.000000",
  "expires_on": 1700005846,
  "subscription": "db38de1f-4bb3..",
  "tenant": "bdfd79b3-8401-47..",
  "tokenType": "Bearer"
}
```

第 4 步：携带 Azure AD 令牌发起 litellm.completion 调用

将 `azure_ad_token` 设为第 3 步得到的 `accessToken`，或者设置 `os.environ['AZURE_AD_TOKEN']`。


<Tabs>
<TabItem value="sdk" label="SDK">


```python
response = litellm.completion(
    model = "azure/<your deployment name>",             # model = azure/<your deployment name> 
    api_base = "",                                      # azure api base
    api_version = "",                                   # azure api version
    azure_ad_token="", 									# your accessToken from step 3 
    messages = [{"role": "user", "content": "good morning"}],
)

```

</TabItem>
<TabItem value="proxy" label="PROXY config.yaml">

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      azure_ad_token: os.environ/AZURE_AD_TOKEN
```

</TabItem>
</Tabs>

### Entra ID：使用 tenant_id、client_id、client_secret

下面是在 litellm 代理的 `config.yaml` 中配置 `tenant_id`、`client_id`、`client_secret` 的示例
```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      tenant_id: os.environ/AZURE_TENANT_ID
      client_id: os.environ/AZURE_CLIENT_ID
      client_secret: os.environ/AZURE_CLIENT_SECRET
      azure_scope: os.environ/AZURE_SCOPE  # defaults to "https://cognitiveservices.azure.com/.default"
```

测试

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

下面是配合 LiteLLM 代理服务器使用 `tenant_id`、`client_id`、`client_secret` 的示例视频

<iframe width="840" height="500" src="https://www.loom.com/embed/70d3f219ee7f4e5d84778b7f17bba506?sid=04b8ff29-485f-4cb8-929e-6b392722f36d" frameBorder="0" allowFullScreen></iframe>

### Entra ID：使用 client_id、username、password

下面是在 litellm 代理的 `config.yaml` 中配置 `client_id`、`azure_username`、`azure_password` 的示例
```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      client_id: os.environ/AZURE_CLIENT_ID
      azure_username: os.environ/AZURE_USERNAME
      azure_password: os.environ/AZURE_PASSWORD
      azure_scope: os.environ/AZURE_SCOPE  # defaults to "https://cognitiveservices.azure.com/.default"
```

测试

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

测试一下

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


### Azure AD 令牌刷新 - `DefaultAzureCredential`

如果你想在请求中使用 Azure 的 `DefaultAzureCredential` 完成身份验证，可以使用这一功能。`DefaultAzureCredential` 会自动发现并使用来自多个来源的可用 Azure 凭据。

<Tabs>
<TabItem value="sdk" label="SDK">

**方式一：显式指定 DefaultAzureCredential**（推荐）
```python
from litellm import completion
from azure.identity import DefaultAzureCredential, get_bearer_token_provider

# DefaultAzureCredential automatically discovers credentials from:
# - Environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
# - Managed Identity (AKS, Azure VMs, etc.)
# - Azure CLI credentials
# - And other Azure identity sources
token_provider = get_bearer_token_provider(DefaultAzureCredential(), "https://cognitiveservices.azure.com/.default")

response = completion(
    model = "azure/<your deployment name>",             # model = azure/<your deployment name> 
    api_base = "",                                      # azure api base
    api_version = "",                                   # azure api version
    azure_ad_token_provider=token_provider,
    messages = [{"role": "user", "content": "good morning"}],
)
```

**方式二：LiteLLM 自动回退到 DefaultAzureCredential**
```python
import litellm

# Enable automatic fallback to DefaultAzureCredential
litellm.enable_azure_ad_token_refresh = True

response = litellm.completion(
    model = "azure/<your deployment name>",
    api_base = "",
    api_version = "",
    messages = [{"role": "user", "content": "good morning"}],
)
```

</TabItem>
<TabItem value="proxy" label="PROXY config.yaml">

**场景一：使用环境变量**（传统方式）

1. 添加相关环境变量

```bash
export AZURE_TENANT_ID=""
export AZURE_CLIENT_ID=""
export AZURE_CLIENT_SECRET=""
```

2. 配置 config.yaml

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/your-deployment-name
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/

litellm_settings:
    enable_azure_ad_token_refresh: true # 👈 KEY CHANGE
```

**场景二：托管标识**（AKS、Azure 虚拟机）——无需硬编码凭据

非常适合 AKS 集群、Azure 虚拟机等由 Azure 自动注入凭据的托管环境。

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/your-deployment-name
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/

litellm_settings:
    enable_azure_ad_token_refresh: true # 👈 KEY CHANGE
```

**场景三：Azure CLI 身份验证**

如果你已经用 `az login` 登录过，则无需任何额外配置：

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: azure/your-deployment-name
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/

litellm_settings:
    enable_azure_ad_token_refresh: true # 👈 KEY CHANGE
```

3. 启动代理

```bash
litellm --config /path/to/config.yaml
```

**工作原理**：
- 环境变量可用时，LiteLLM 会先尝试服务主体（Service Principal）身份验证
- 如果失败，会自动回退到 `DefaultAzureCredential`
- `DefaultAzureCredential` 会使用托管标识（Managed Identity）、Azure CLI 凭据或其他可用的 Azure 身份来源
- 这样在 AKS 这类托管环境中就不必再硬编码凭据

</TabItem>
</Tabs>


## **Azure 批处理 API** {#azure-batches-api}

| 属性 | 说明 |
|-------|-------|
| 描述 | Azure OpenAI 批处理 API |
| LiteLLM 中的 `custom_llm_provider` | `azure/` |
| 支持的操作 | `/v1/batches`, `/v1/files` |
| Azure OpenAI 批处理 API | [Azure OpenAI Batches API ↗](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/batch) |
| 成本追踪与日志支持 | ✅ LiteLLM 会为 Batch API 请求记录日志并追踪成本 |


### 快速上手

只需将 Azure 相关的环境变量加入你的环境。

```bash
export AZURE_API_KEY=""
export AZURE_API_BASE=""
```

<Tabs>
<TabItem value="proxy" label="LiteLLM PROXY Server">

**1. 上传文件**

<Tabs>
<TabItem value="sdk" label="OpenAI Python SDK">

```python
from openai import OpenAI

# Initialize the client
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-api-key"
)

batch_input_file = client.files.create(
    file=open("mydata.jsonl", "rb"),
    purpose="batch",
    extra_headers={"custom-llm-provider": "azure"}
)
file_id = batch_input_file.id
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/files \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -F purpose="batch" \
    -F file="@mydata.jsonl"
```

</TabItem>
</Tabs>

**文件格式示例**
```json
{"custom_id": "task-0", "method": "POST", "url": "/chat/completions", "body": {"model": "REPLACE-WITH-MODEL-DEPLOYMENT-NAME", "messages": [{"role": "system", "content": "You are an AI assistant that helps people find information."}, {"role": "user", "content": "When was Microsoft founded?"}]}}
{"custom_id": "task-1", "method": "POST", "url": "/chat/completions", "body": {"model": "REPLACE-WITH-MODEL-DEPLOYMENT-NAME", "messages": [{"role": "system", "content": "You are an AI assistant that helps people find information."}, {"role": "user", "content": "When was the first XBOX released?"}]}}
{"custom_id": "task-2", "method": "POST", "url": "/chat/completions", "body": {"model": "REPLACE-WITH-MODEL-DEPLOYMENT-NAME", "messages": [{"role": "system", "content": "You are an AI assistant that helps people find information."}, {"role": "user", "content": "What is Altair Basic?"}]}}
```

**2. 创建批处理请求**

<Tabs>
<TabItem value="sdk" label="OpenAI Python SDK">

```python
batch = client.batches.create( # re use client from above
    input_file_id=file_id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
    metadata={"description": "My batch job"},
    extra_headers={"custom-llm-provider": "azure"}
)
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/batches \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-abc123",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'
```
</TabItem>
</Tabs>

**3. 获取批处理任务**

<Tabs>
<TabItem value="sdk" label="OpenAI Python SDK">

```python
retrieved_batch = client.batches.retrieve(
    batch.id,
    extra_headers={"custom-llm-provider": "azure"}
)
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/batches/batch_abc123 \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
```

</TabItem>
</Tabs>

**4. 取消批处理任务**

<Tabs>
<TabItem value="sdk" label="OpenAI Python SDK">

```python
cancelled_batch = client.batches.cancel(
    batch.id,
    extra_headers={"custom-llm-provider": "azure"}
)
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/batches/batch_abc123/cancel \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST
```

</TabItem>
</Tabs>

**5. 列出批处理任务**

<Tabs>
<TabItem value="sdk" label="OpenAI Python SDK">

```python
client.batches.list(extra_headers={"custom-llm-provider": "azure"})
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/batches?limit=2 \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json"
```
</TabItem>
</Tabs>
</TabItem>
<TabItem value="sdk" label="LiteLLM SDK">

**1. 为批处理补全创建文件**

```python
import litellm
import os 

os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""

file_name = "azure_batch_completions.jsonl"
_current_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(_current_dir, file_name)
file_obj = await litellm.acreate_file(
    file=open(file_path, "rb"),
    purpose="batch",
    custom_llm_provider="azure",
)
print("Response from creating file=", file_obj)
```

**2. 创建批处理请求**

```python
create_batch_response = await litellm.acreate_batch(
    completion_window="24h",
    endpoint="/v1/chat/completions",
    input_file_id=batch_input_file_id,
    custom_llm_provider="azure",
    metadata={"key1": "value1", "key2": "value2"},
)

print("response from litellm.create_batch=", create_batch_response)
```

**3. 获取批处理任务与文件内容**

```python
retrieved_batch = await litellm.aretrieve_batch(
    batch_id=create_batch_response.id, 
    custom_llm_provider="azure"
)
print("retrieved batch=", retrieved_batch)

# Get file content
file_content = await litellm.afile_content(
    file_id=batch_input_file_id, 
    custom_llm_provider="azure"
)
print("file content = ", file_content)
```

**4. 列出批处理任务**

```python
list_batches_response = litellm.list_batches(
    custom_llm_provider="azure", 
    limit=2
)
print("list_batches_response=", list_batches_response)
```

</TabItem>
</Tabs>

### [Azure 批处理模型健康检查](../../proxy/health.md#模型模式)


### [BETA] 多个 Azure 部署间的负载均衡
在 config.yaml 中设置 `enable_loadbalancing_on_batch_endpoints: true`

```yaml
model_list:
  - model_name: "batch-gpt-4o-mini"
    litellm_params:
      model: "azure/{{openai_small}}"
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
    model_info:
      mode: batch

litellm_settings:
  enable_loadbalancing_on_batch_endpoints: true # 👈 KEY CHANGE
```

注意：此功能适用于 `{PROXY_BASE_URL}/v1/files` 与 `{PROXY_BASE_URL}/v1/batches`。
注意：响应采用 OpenAI 格式。

1. 上传文件

只需在 .jsonl 文件里把 `model` 设为 `batch-gpt-4o-mini`。

```bash
curl http://localhost:4000/v1/files \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -F purpose="batch" \
    -F file="@mydata.jsonl"
```

**文件示例**

注意：`model` 应填你的 Azure 部署名称。

```json
{"custom_id": "task-0", "method": "POST", "url": "/chat/completions", "body": {"model": "batch-gpt-4o-mini", "messages": [{"role": "system", "content": "You are an AI assistant that helps people find information."}, {"role": "user", "content": "When was Microsoft founded?"}]}}
{"custom_id": "task-1", "method": "POST", "url": "/chat/completions", "body": {"model": "batch-gpt-4o-mini", "messages": [{"role": "system", "content": "You are an AI assistant that helps people find information."}, {"role": "user", "content": "When was the first XBOX released?"}]}}
{"custom_id": "task-2", "method": "POST", "url": "/chat/completions", "body": {"model": "batch-gpt-4o-mini", "messages": [{"role": "system", "content": "You are an AI assistant that helps people find information."}, {"role": "user", "content": "What is Altair Basic?"}]}}
```

预期响应（OpenAI 兼容格式）

```bash
{"id":"file-f0be81f654454113a922da60acb0eea6",...}
```

2. 创建批处理任务

```bash
curl http://0.0.0.0:4000/v1/batches \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-f0be81f654454113a922da60acb0eea6",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h",
    "model": "batch-gpt-4o-mini"
  }'
```

预期响应：

```bash
{"id":"batch_94e43f0a-d805-477d-adf9-bbb9c50910ed",...}
```

3. 获取批处理任务

```bash
curl http://0.0.0.0:4000/v1/batches/batch_94e43f0a-d805-477d-adf9-bbb9c50910ed \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
```


预期响应：

```
{"id":"batch_94e43f0a-d805-477d-adf9-bbb9c50910ed",...}
```

4. 列出批处理任务

```bash
curl http://0.0.0.0:4000/v1/batches?limit=2 \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json"
```

预期响应：

```bash
{"data":[{"id":"batch_R3V...}
```

## 高级
### Azure API 负载均衡

如果你需要在多个 Azure/OpenAI 部署之间做负载均衡，可以使用这一功能。

`Router` 会挑选未触达速率限制、已用 Token 最少的部署，从而避免请求失败。

生产环境中，[Router 会连接 Redis 缓存](#redis-队列)来追踪多个部署间的用量。

#### 快速上手

```bash
uv add litellm
```

```python
from litellm import Router

model_list = [{ # list of model deployments 
	"model_name": "{{openai_small}}", # openai model name 
	"litellm_params": { # params for litellm completion/embedding call 
		"model": "azure/chatgpt-v-2", 
		"api_key": os.getenv("AZURE_API_KEY"),
		"api_version": os.getenv("AZURE_API_VERSION"),
		"api_base": os.getenv("AZURE_API_BASE")
	},
	"tpm": 240000,
	"rpm": 1800
}, {
    "model_name": "{{openai_small}}", # openai model name 
	"litellm_params": { # params for litellm completion/embedding call 
		"model": "azure/chatgpt-functioncalling", 
		"api_key": os.getenv("AZURE_API_KEY"),
		"api_version": os.getenv("AZURE_API_VERSION"),
		"api_base": os.getenv("AZURE_API_BASE")
	},
	"tpm": 240000,
	"rpm": 1800
}, {
    "model_name": "{{openai_small}}", # openai model name 
	"litellm_params": { # params for litellm completion/embedding call 
		"model": "{{openai_small}}", 
		"api_key": os.getenv("OPENAI_API_KEY"),
	},
	"tpm": 1000000,
	"rpm": 9000
}]

router = Router(model_list=model_list)

# openai.chat.completions.create replacement
response = router.completion(model="{{openai_small}}", 
				messages=[{"role": "user", "content": "Hey, how's it going?"}])

print(response)
```

#### Redis 队列

```python
router = Router(model_list=model_list, 
                redis_host=os.getenv("REDIS_HOST"), 
                redis_password=os.getenv("REDIS_PASSWORD"), 
                redis_port=os.getenv("REDIS_PORT"))

print(response)
```


### 工具调用 / 函数调用

litellm 并行函数调用的详细讲解见[这里](https://docs.litellm.ai/docs/completion/function_call)


<Tabs>
<TabItem value="sdk" label="SDK">

```python
# set Azure env variables
import os
import litellm
import json

os.environ['AZURE_API_KEY'] = "" # litellm reads AZURE_API_KEY from .env and sends the request
os.environ['AZURE_API_BASE'] = "https://openai-gpt-4-test-v-1.openai.azure.com/"
os.environ['AZURE_API_VERSION'] = "2023-07-01-preview"

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]

response = litellm.completion(
    model="azure/chatgpt-functioncalling", # model = azure/<your-azure-deployment-name>
    messages=[{"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris?"}],
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
)
print("\nLLM Response1:\n", response)
response_message = response.choices[0].message
tool_calls = response.choices[0].message.tool_calls
print("\nTool Choice:\n", tool_calls)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: azure-gpt-3.5
    litellm_params:
      model: azure/chatgpt-functioncalling
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
```

2. 启动代理

```bash
litellm --config config.yaml
```

3. 测试

```bash
curl -L -X POST 'http://localhost:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "azure-gpt-3.5",
    "messages": [
        {
            "role": "user",
            "content": "Hey, how'\''s it going? Thinking long and hard before replying - what is the meaning of the world and life itself"
        }
    ]
}'
```




</TabItem>
</Tabs>
### Azure OpenAI 模型的花费追踪（PROXY）

为 Azure 图像生成调用设置基础模型（base model），以便进行成本追踪

#### 图像生成

```yaml
model_list: 
  - model_name: dall-e-3
    litellm_params:
        model: azure/dall-e-3-test
        api_version: 2023-06-01-preview
        api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
        api_key: os.environ/AZURE_API_KEY
        base_model: dall-e-3 # 👈 set dall-e-3 as base model
    model_info:
        mode: image_generation
```

#### 对话补全 / 嵌入

**问题**：使用 `azure/gpt-4-1106-preview` 时，Azure 在响应中返回的是 `gpt-4`，这会导致成本追踪不准确。

**解决方案** ✅：在配置中设置 `base_model`，让 litellm 使用正确的模型来计算 Azure 成本

基础模型名称可从[这里](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)获取

含 `base_model` 的配置示例
```yaml
model_list:
  - model_name: azure-gpt-3.5
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
    model_info:
      base_model: azure/{{openai_large}}
```
