import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nscale（欧盟主权云）

https://docs.nscale.com/docs/inference/chat

:::tip

**我们支持所有 Nscale 模型：发送 litellm 请求时，只需在模型名前加上 `model=nscale/<any-model-on-nscale>` 前缀即可**

:::

| 属性 | 说明 |
|-------|-------|
| 描述 | 一家总部位于欧洲的全栈 AI 云平台，面向 LLM 与图像生成。 |
| LiteLLM 提供商路由 | `nscale/` |
| 支持的端点 | `/chat/completions`, `/images/generations` |
| API 参考 | [Nscale 文档](https://docs.nscale.com/docs/getting-started/overview) |

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["NSCALE_API_KEY"] = ""  # your Nscale API key
```

## 探索可用模型  

浏览我们完整的文本与多模态 AI 模型列表，全部以极具竞争力的价格提供：
📚 [完整模型列表](https://docs.nscale.com/docs/inference/serverless-models/current)  


## 主要特性
- **欧盟主权**：具备完整的数据主权，并符合欧洲法规
- **超低成本**（每百万 Token 低至 $0.01）：文本与图像生成模型的价格都极具竞争力
- **生产级**：可靠的无服务器部署，实现完全隔离
- **免配置**：无需管理基础设施，即刻获得算力
- **完全掌控**：数据始终保持私密与隔离

## 用法：LiteLLM Python SDK

### 文本生成

```python showLineNumbers title="Nscale Text Generation"
from litellm import completion
import os

os.environ["NSCALE_API_KEY"] = ""  # your Nscale API key
response = completion(
    model="nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct",
    messages=[{"role": "user", "content": "What is LiteLLM?"}]
)
print(response)
```

```python showLineNumbers title="Nscale Text Generation - Streaming"
from litellm import completion
import os

os.environ["NSCALE_API_KEY"] = ""  # your Nscale API key
stream = completion(
    model="nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct",
    messages=[{"role": "user", "content": "What is LiteLLM?"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

### 图像生成

```python showLineNumbers title="Nscale Image Generation"
from litellm import image_generation
import os

os.environ["NSCALE_API_KEY"] = ""  # your Nscale API key
response = image_generation(
    model="nscale/stabilityai/stable-diffusion-xl-base-1.0",
    prompt="A beautiful sunset over mountains",
    n=1,
    size="1024x1024"
)
print(response)
```

## 用法：LiteLLM 代理

将以下内容添加到 LiteLLM 代理服务器的配置文件中：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct
    litellm_params:
      model: nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct
      api_key: os.environ/NSCALE_API_KEY
  - model_name: nscale/meta-llama/Llama-3.3-70B-Instruct
    litellm_params:
      model: nscale/meta-llama/Llama-3.3-70B-Instruct
      api_key: os.environ/NSCALE_API_KEY
  - model_name: nscale/stabilityai/stable-diffusion-xl-base-1.0
    litellm_params:
      model: nscale/stabilityai/stable-diffusion-xl-base-1.0
      api_key: os.environ/NSCALE_API_KEY
```

启动 LiteLLM 代理服务器：

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Nscale via Proxy - Non-streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct",
    messages=[{"role": "user", "content": "What is LiteLLM?"}]
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Nscale via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct",
    messages=[{"role": "user", "content": "What is LiteLLM?"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Nscale via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct",
    "messages": [{"role": "user", "content": "What is LiteLLM?"}]
  }'
```

</TabItem>
</Tabs>

## 入门
1. 在 [console.nscale.com](https://console.nscale.com) 注册账号
2. 领取免费额度
3. 在设置中创建 API 密钥
4. 通过 LiteLLM 开始调用 API

## 其他资源
- [Nscale 文档](https://docs.nscale.com/docs/getting-started/overview)
- [博客：主权无服务器](https://www.nscale.com/blog/sovereign-serverless-how-we-designed-full-isolation-without-sacrificing-performance)
