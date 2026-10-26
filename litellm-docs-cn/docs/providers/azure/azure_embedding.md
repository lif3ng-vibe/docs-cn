import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure OpenAI 嵌入（Embeddings）

### API 密钥
这些值既可以设置为环境变量，也可以作为 **litellm.embedding() 的参数** 传入。
```python
import os
os.environ['AZURE_API_KEY'] = ""
os.environ['AZURE_API_BASE'] = ""
os.environ['AZURE_API_VERSION'] = ""
```

### 用法
```python
from litellm import embedding
response = embedding(
    model="azure/<your deployment name>",
    input=["good morning from litellm"],
    api_key=api_key,
    api_base=api_base,
    api_version=api_version,
)
print(response)
```

| 模型名称           | 函数调用                               |
|----------------------|---------------------------------------------|
| text-embedding-ada-002 | `embedding(model="azure/<your deployment name>", input=input)` |

感谢 [Mikko](https://www.linkedin.com/in/mikkolehtimaki/) 贡献了这一集成


## **通过 LiteLLM 代理服务器使用**

下面介绍如何通过 LiteLLM 代理服务器调用 Azure OpenAI 模型

### 1. 将密钥保存到环境变量

```bash
export AZURE_API_KEY=""
```

### 2. 启动代理

```yaml
model_list:
  - model_name: text-embedding-ada-002
    litellm_params:
      model: azure/my-deployment-name
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      api_key: os.environ/AZURE_API_KEY # The `os.environ/` prefix tells litellm to read this from the env.
```

### 3. 测试

<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/embeddings' \
  --header 'Content-Type: application/json' \
  --data ' {
  "model": "text-embedding-ada-002",
  "input": ["write a litellm poem"]
  }'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
from openai import OpenAI

# set base_url to your proxy server
# set api_key to send to proxy server
client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    input=["hello from litellm"],
    model="text-embedding-ada-002"
)

print(response)

```
</TabItem>
</Tabs>
