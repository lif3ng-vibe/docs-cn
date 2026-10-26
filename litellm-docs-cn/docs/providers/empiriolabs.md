import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# EmpirioLabs AI

## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | EmpirioLabs AI 通过一套兼容 OpenAI 的 API 统一托管开源、专有及自定义模型，覆盖文本、图像、视频、音频、搜索与 3D 各类端点，按量计费。 |
| LiteLLM 提供商路由 | `empiriolabs/` |
| 提供商文档 | [EmpirioLabs AI 文档 ↗](https://docs.empiriolabs.ai) |
| Base URL | `https://api.empiriolabs.ai/v1` |
| 支持的操作 | [`/chat/completions`](/docs/providers/empiriolabs#用法---litellm-python-sdk)、`/responses` |

<br />
<br />

**支持全部 EmpirioLabs 对话模型，发送补全（completion）请求时只需在模型名前加上 `empiriolabs/` 前缀即可**

## 可用模型（节选）

包含实时定价的完整模型目录见 [empiriolabs.ai/models](https://empiriolabs.ai/models)。热门对话模型如下：

| 模型 | 说明 | 上下文窗口 |
|-------|-------------|----------------|
| `empiriolabs/qwen3-7-max` | Qwen3.7 Max 旗舰文本模型，适用于编程、智能体与深度思考 | 1M tokens |
| `empiriolabs/qwen3-7-plus` | 高性价比的 Qwen3.7 视觉语言模型（支持文本、图像、视频输入） | 1M tokens |
| `empiriolabs/deepseek-v4-pro` | DeepSeek V4 旗舰 MoE 模型（总参数 1.6T，激活参数 49B） | 1M tokens |
| `empiriolabs/deepseek-v4-flash` | 轻量级 DeepSeek V4 MoE 模型（总参数 284B，激活参数 13B） | 1M tokens |
| `empiriolabs/glm-5-1` | 智谱 AI 长上下文推理模型，支持工具调用 | 202K tokens |
| `empiriolabs/kimi-k2-6` | Moonshot Kimi K2.6 多模态推理模型 | 256K tokens |
| `empiriolabs/minimax-m3` | MiniMax M3 多模态推理模型，面向编程与智能体场景 | 524K tokens |
| `empiriolabs/gemma-4-26b-a4b` | Google Gemma 4 26B A4B 开放多模态模型 | 256K tokens |

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["EMPIRIOLABS_API_KEY"] = ""  # your EmpirioLabs API key
```

请前往 [EmpirioLabs 仪表板](https://platform.empiriolabs.ai/dashboard/api-keys)获取 API 密钥。

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="EmpirioLabs Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["EMPIRIOLABS_API_KEY"] = ""  # your EmpirioLabs API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# EmpirioLabs call
response = completion(model="empiriolabs/qwen3-7-plus", messages=messages)

print(response)
```

### 流式

```python showLineNumbers title="EmpirioLabs Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["EMPIRIOLABS_API_KEY"] = ""  # your EmpirioLabs API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# EmpirioLabs call with streaming
response = completion(
    model="empiriolabs/qwen3-7-plus",
    messages=messages,
    stream=True,
)

for chunk in response:
    print(chunk)
```

## 用法 - LiteLLM Proxy

将以下内容添加到 LiteLLM 代理（Proxy）配置文件：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: qwen3-7-plus
    litellm_params:
      model: empiriolabs/qwen3-7-plus
      api_key: os.environ/EMPIRIOLABS_API_KEY

  - model_name: deepseek-v4-flash
    litellm_params:
      model: empiriolabs/deepseek-v4-flash
      api_key: os.environ/EMPIRIOLABS_API_KEY
```

启动 LiteLLM 代理服务器：

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="EmpirioLabs via Proxy"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key",      # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="qwen3-7-plus",
    messages=[{"role": "user", "content": "hello from litellm"}],
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="EmpirioLabs via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "qwen3-7-plus",
    "messages": [{"role": "user", "content": "hello from litellm"}]
  }'
```

</TabItem>
</Tabs>

## 补充说明

- 支持思考能力的模型接受 `reasoning_effort` 参数（`none`、`low`、`medium`、`high`、`max`），网关会将其映射为各模型原生的思考控制项。
- 各模型的参数、限制与实时定价见 [docs.empiriolabs.ai](https://docs.empiriolabs.ai)，也可在 [empiriolabs.ai/models](https://empiriolabs.ai/models) 的各模型页面查看。
