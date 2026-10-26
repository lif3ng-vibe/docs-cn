import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem'

# AWS Sagemaker
LiteLLM 支持全部 Sagemaker Huggingface Jumpstart 模型

:::tip

**我们支持所有 Sagemaker 模型，发送 LiteLLM 请求时，只需给模型名加上 `model=sagemaker/<any-model-on-sagemaker>` 前缀**

:::


### API 密钥
```python
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""
```

### 用法
```python
import os 
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
            model="sagemaker/<your-endpoint-name>", 
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            temperature=0.2,
            max_tokens=80
        )
```

### 用法 - 流式
Sagemaker 目前不支持流式输出，LiteLLM 会把响应字符串切成多个分块返回，以此模拟流式效果。

```python
import os 
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
            model="sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b", 
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            temperature=0.2,
            max_tokens=80,
            stream=True,
        )
for chunk in response:
    print(chunk)
```


## **LiteLLM 代理用法**

下面介绍如何通过 LiteLLM 代理服务器（proxy server）调用 Sagemaker

### 1. 配置 config.yaml

```yaml
model_list:
  - model_name: jumpstart-model
    litellm_params:
      model: sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614
      aws_access_key_id: os.environ/CUSTOM_AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/CUSTOM_AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/CUSTOM_AWS_REGION_NAME
```

全部可用的认证参数：

```
aws_access_key_id: Optional[str],
aws_secret_access_key: Optional[str],
aws_session_token: Optional[str],
aws_region_name: Optional[str],
aws_session_name: Optional[str],
aws_profile_name: Optional[str],
aws_role_name: Optional[str],
aws_web_identity_token: Optional[str],
```

### 2. 启动代理

```bash
litellm --config /path/to/config.yaml
```
### 3. 测试


<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "jumpstart-model",
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

response = client.chat.completions.create(model="jumpstart-model", messages = [
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
    model = "jumpstart-model",
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

## 设置 temperature、top p 等参数

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  temperature=0.7,
  top_p=1
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

**在 yaml 中设置**

```yaml
model_list:
  - model_name: jumpstart-model
    litellm_params:
      model: sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614
      temperature: <your-temp>
      top_p: <your-top-p>
```

**在请求中设置**

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="jumpstart-model", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0.7,
top_p=1
)

print(response)

```

</TabItem>
</Tabs>

## 允许为 Sagemaker 设置 **temperature=0**

默认情况下，当请求把 `temperature=0` 传给 LiteLLM 时，LiteLLM 会把它上调为 `temperature=0.1`，因为在 `temperature=0` 下 Sagemaker 的大部分请求都会失败

如果你的模型确实需要发送 `temperature=0`，可以按下面的方式配置（Sagemaker 可以托管任意类型的模型，部分模型本身允许 temperature=0）

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  temperature=0,
  aws_sagemaker_allow_zero_temp=True,
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

**在 yaml 中设置 `aws_sagemaker_allow_zero_temp`**

```yaml
model_list:
  - model_name: jumpstart-model
    litellm_params:
      model: sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614
      aws_sagemaker_allow_zero_temp: true
```

**在请求中设置 `temperature=0`**

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="jumpstart-model", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0,
)

print(response)

```

</TabItem>
</Tabs>

## 传递提供商特定参数

如果你传给 LiteLLM 一个非 OpenAI 参数，LiteLLM 会认为它是提供商（provider）特定参数，并以 kwarg 的形式放进请求体。[了解更多](../completion/input.md#litellm-专属参数)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  top_k=1 # 👈 PROVIDER-SPECIFIC PARAM
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

**在 yaml 中设置**

```yaml
model_list:
  - model_name: jumpstart-model
    litellm_params:
      model: sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614
      top_k: 1 # 👈 PROVIDER-SPECIFIC PARAM
```

**在请求中设置**

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="jumpstart-model", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0.7,
extra_body={
    "top_k": 1 # 👈 PROVIDER-SPECIFIC PARAM
}
)

print(response)

```

</TabItem>
</Tabs>


### 指定推理组件名称

如果一个端点上挂了多个模型，你需要指定具体要调用的模型名，通过 `model_id` 传入即可。

```python
import os 
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
            model="sagemaker/<your-endpoint-name>", 
            model_id="<your-model-name",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            temperature=0.2,
            max_tokens=80
        )
```

### 以参数形式传递凭证 - Completion()
把 AWS 凭证作为参数直接传给 litellm.completion
```python
import os 
from litellm import completion

response = completion(
            model="sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            aws_access_key_id="",
            aws_secret_access_key="",
            aws_region_name="",
)
```

### 应用提示词模板
要为你的 Sagemaker 部署应用正确的提示词模板（prompt template），还需要同时传入对应的 Huggingface 模型名。

```python
import os 
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
            model="sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b", 
            messages=messages,
            temperature=0.2,
            max_tokens=80,
            hf_model_name="meta-llama/Llama-2-7b",
        )
```

你也可以传入自己的[自定义提示词模板](../completion/prompt_formatting.md#自行格式化提示词)


## Sagemaker Messages API

使用 `sagemaker_chat/*` 路由，即可把请求路由到 Sagemaker Messages API

```
model: sagemaker_chat/<your-endpoint-name>
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
import litellm
from litellm import completion

litellm.set_verbose = True # 👈 SEE RAW REQUEST

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
            model="sagemaker_chat/<your-endpoint-name>", 
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            temperature=0.2,
            max_tokens=80
        )
```

</TabItem>
<TabItem value="proxy" label="PROXY">

#### 1. 配置 config.yaml

```yaml
model_list:
  - model_name: "sagemaker-model"
    litellm_params:
      model: "sagemaker_chat/jumpstart-dft-hf-textgeneration1-mp-20240815-185614"
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

#### 2. 启动代理

```bash
litellm --config /path/to/config.yaml
```
#### 3. 测试


```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "sagemaker-model",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```

[**👉 查看 OpenAI SDK/Langchain/Llamaindex 等示例**](../proxy/user_keys.md#chatcompletions)

</TabItem>
</Tabs>


## 补全模型


:::tip

**我们支持所有 Sagemaker 模型，发送 LiteLLM 请求时，只需给模型名加上 `model=sagemaker/<any-model-on-sagemaker>` 前缀**

:::

下面是配合 LiteLLM 使用 Sagemaker 模型的示例

| 模型名称                    | 函数调用                                                                                       |
|-------------------------------|-------------------------------------------------------------------------------------------|
| 自定义 Huggingface 模型               | `completion(model='sagemaker/<your-deployment-name>', messages=messages)`        | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`      
| Meta Llama 2 7B               | `completion(model='sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b', messages=messages)`        | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`              |
| Meta Llama 2 7B（对话/微调）  | `completion(model='sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b-f', messages=messages)`      | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`              |
| Meta Llama 2 13B              | `completion(model='sagemaker/jumpstart-dft-meta-textgeneration-llama-2-13b', messages=messages)`       | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`              |
| Meta Llama 2 13B（对话/微调） | `completion(model='sagemaker/jumpstart-dft-meta-textgeneration-llama-2-13b-f', messages=messages)`     | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`              |
| Meta Llama 2 70B              | `completion(model='sagemaker/jumpstart-dft-meta-textgeneration-llama-2-70b', messages=messages)`       | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`              |
| Meta Llama 2 70B（对话/微调） | `completion(model='sagemaker/jumpstart-dft-meta-textgeneration-llama-2-70b-b-f', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`              |

## 嵌入模型

LiteLLM 支持所有 Sagemaker Jumpstart Huggingface 嵌入模型，调用方式如下：

```python
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = litellm.embedding(model="sagemaker/<your-deployment-name>", input=["good morning from litellm", "this is another item"])
print(f"response: {response}")
```

### 推理组件上的嵌入

如果端点上托管了推理组件（inference component），与补全一样，通过 `model_id` 指定要调用的组件。LiteLLM 会把它作为 invoke 调用的 `InferenceComponentName` 发送，而不会放进请求体。

```python
response = litellm.embedding(
    model="sagemaker/<your-endpoint-name>",
    model_id="<your-inference-component-name>",
    input=["good morning from litellm"],
)
```

### 兼容 OpenAI 的嵌入端点

默认情况下，LiteLLM 以 Hugging Face 格式（`{"inputs": [...]}`）发送嵌入请求，并把返回内容当作向量列表读取。如果你的端点背后的容器提供的其实是 OpenAI embeddings API（入参为 `{"input": [...]}`，返回 `{"data": [{"embedding": [...]}], "usage": {...}}`），请在端点名前面加上 `openai/` 路由。此后请求会以 OpenAI 格式发出，`extra_body` 里的字段会一并合并进去，并从响应中读取 `data[].embedding` 和 `usage`。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.embedding(
    model="sagemaker/openai/<your-endpoint-name>",
    model_id="<your-inference-component-name>",  # only for endpoints with inference components
    extra_body={"model": "<model name the container expects>"},  # only if the container needs one
    input=["good morning from litellm"],
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: my-embeddings
    litellm_params:
      model: sagemaker/openai/<your-endpoint-name>
      model_id: <your-inference-component-name>
      extra_body:
        model: <model name the container expects>
      aws_region_name: us-east-1
    model_info:
      mode: embedding
```

</TabItem>
</Tabs>

`litellm_params` 中的提供商特定键会按原样放进请求体，因此只保留你的容器能接受的那些键即可。



## SageMaker 上的 Nova 模型

LiteLLM 支持部署在 SageMaker Inference 实时端点上的 Amazon Nova 模型（Nova Micro、Nova Lite、Nova 2 Lite）。这些自定义/微调的 Nova 模型采用兼容 OpenAI 的 API 格式。

**参考：** [AWS 博客：Amazon SageMaker Inference 支持自定义 Amazon Nova 模型](https://aws.amazon.com/blogs/aws/announcing-amazon-sagemaker-inference-for-custom-amazon-nova-models/)

### 用法

使用 `sagemaker_nova/` 前缀加上你的 SageMaker 端点名：

```python
import litellm
import os

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = "us-east-1"

# Basic chat completion
response = litellm.completion(
    model="sagemaker_nova/my-nova-endpoint",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    temperature=0.7,
    max_tokens=512,
)
print(response.choices[0].message.content)
```

### 流式

```python
response = litellm.completion(
    model="sagemaker_nova/my-nova-endpoint",
    messages=[{"role": "user", "content": "Write a short poem"}],
    stream=True,
    stream_options={"include_usage": True},
)
for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### 多模态（图像）

SageMaker 上的 Nova 模型支持以 base64 data URI 形式传入图像输入：

```python
response = litellm.completion(
    model="sagemaker_nova/my-nova-endpoint",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,..."}}
            ]
        }
    ],
)
```

### 代理配置

```yaml
model_list:
  - model_name: nova-micro
    litellm_params:
      model: sagemaker_nova/my-nova-micro-endpoint
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1
```

### 支持的参数

所有标准 OpenAI 参数均受支持，此外还支持以下 Nova 特有参数：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `top_k` | integer | 把 token 选择限制在概率最高的前 K 个 |
| `reasoning_effort` | `"low"` \| `"high"` | 推理力度级别（仅 Nova 2 Lite 自定义模型可用） |
| `allowed_token_ids` | array[int] | 把输出限制在指定的 token ID 内 |
| `truncate_prompt_tokens` | integer | 当提示词超过上限时，截断为 N 个 token |

```python
response = litellm.completion(
    model="sagemaker_nova/my-nova-endpoint",
    messages=[{"role": "user", "content": "Think step by step: what is 2+2?"}],
    top_k=40,
    reasoning_effort="low",
    logprobs=True,
    top_logprobs=2,
)
```
