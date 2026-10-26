import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /generateContent

使用 LiteLLM 调用 Google AI 的 generateContent 端点，实现文本生成、多模态交互与流式响应。

## 概览

| 功能 | 是否支持 | 说明 |
|-------|-------|-------|
| 成本追踪 | ✅ |  |
| 日志 | ✅ | 适用于所有集成 |
| 终端用户追踪 | ✅ | |
| 流式 | ✅ | |
| 回退 | ✅ | 在支持的模型之间 |
| 负载均衡 | ✅ | 在支持的模型之间 |
| 元数据追踪 | ✅ | 将 trace ID 与元数据传给可观测性回调（如 S3、Langfuse） |

## 用法
---

### LiteLLM Python SDK

<Tabs>
<TabItem value="basic" label="基础用法">

#### 非流式示例
```python showLineNumbers title="Basic Text Generation"
from litellm.google_genai import agenerate_content
from google.genai.types import ContentDict, PartDict
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

contents = ContentDict(
    parts=[
        PartDict(text="Hello, can you tell me a short joke?")
    ],
    role="user",
)

response = await agenerate_content(
    contents=contents,
    model="gemini/{{gemini_flash}}",
    max_tokens=100,
)
print(response)
```

#### 流式示例
```python showLineNumbers title="Streaming Text Generation"
from litellm.google_genai import agenerate_content_stream
from google.genai.types import ContentDict, PartDict
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

contents = ContentDict(
    parts=[
        PartDict(text="Write a long story about space exploration")
    ],
    role="user",
)

response = await agenerate_content_stream(
    contents=contents,
    model="gemini/{{gemini_flash}}",
    max_tokens=500,
)

async for chunk in response:
    print(chunk)
```

</TabItem>

<TabItem value="sync" label="同步用法">

#### 同步非流式示例
```python showLineNumbers title="Sync Text Generation"
from litellm.google_genai import generate_content
from google.genai.types import ContentDict, PartDict
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

contents = ContentDict(
    parts=[
        PartDict(text="Hello, can you tell me a short joke?")
    ],
    role="user",
)

response = generate_content(
    contents=contents,
    model="gemini/{{gemini_flash}}",
    max_tokens=100,
)
print(response)
```

#### 同步流式示例
```python showLineNumbers title="Sync Streaming Text Generation"
from litellm.google_genai import generate_content_stream
from google.genai.types import ContentDict, PartDict
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

contents = ContentDict(
    parts=[
        PartDict(text="Write a long story about space exploration")
    ],
    role="user",
)

response = generate_content_stream(
    contents=contents,
    model="gemini/{{gemini_flash}}",
    max_tokens=500,
)

for chunk in response:
    print(chunk)
```

</TabItem>
</Tabs>

### LiteLLM 代理服务器

1. 配置 config.yaml

```yaml
model_list:
    - model_name: gemini-flash
      litellm_params:
        model: gemini/{{gemini_flash}}
        api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

<Tabs>
<TabItem value="gemini-proxy" label="Google GenAI SDK">

```python showLineNumbers title="Google GenAI SDK with LiteLLM Proxy"
from google.genai import Client
import os

# Configure Google GenAI SDK to use LiteLLM proxy
os.environ["GOOGLE_GEMINI_BASE_URL"] = "http://localhost:4000"
os.environ["GEMINI_API_KEY"] = "sk-<your-litellm-api-key>"

client = Client()

response = client.models.generate_content(
    model="gemini-flash",
    contents=[
        {
            "parts": [{"text": "Write a short story about AI"}],
            "role": "user"
        }
    ],
    config={"max_output_tokens": 100}
)
```


</TabItem>

<TabItem value="curl-proxy" label="curl">

#### Generate Content

```bash showLineNumbers title="generateContent via LiteLLM Proxy"
curl -L -X POST 'http://localhost:4000/v1beta/models/gemini-flash:generateContent' \
-H 'content-type: application/json' \
-H "authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "contents": [
    {
      "parts": [
        {
          "text": "Write a short story about AI"
        }
      ],
      "role": "user"
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 100
  }
}'
```

#### Stream Generate Content

```bash showLineNumbers title="streamGenerateContent via LiteLLM Proxy"
curl -L -X POST 'http://localhost:4000/v1beta/models/gemini-flash:streamGenerateContent' \
-H 'content-type: application/json' \
-H "authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "contents": [
    {
      "parts": [
        {
          "text": "Write a long story about space exploration"
        }
      ],
      "role": "user"
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 500
  }
}'
```

</TabItem>
</Tabs>


## 原生请求字段

`generateContent` 端点与 Google 的 [Generative Language REST API](https://ai.google.dev/api/generate-content) 完全兼容，因此 Google `GenerateContentRequest` 中与 `generationConfig` 同级的顶层字段会原样转发给 Google，包括 `safetySettings`、`toolConfig`、`cachedContent` 和 `labels`。这些字段直接放在请求体顶层即可，写法与直连 Google 时完全一致，无需包在 `extra_body` 里。如果确实传了 `extra_body`，发生冲突时以其中显式给出的值为准。

<Tabs>
<TabItem value="curl-native" label="curl">

```bash showLineNumbers title="Native top-level fields via LiteLLM Proxy"
curl -L -X POST 'http://localhost:4000/v1beta/models/gemini-flash:generateContent' \
-H 'content-type: application/json' \
-H "authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "contents": [
    {
      "parts": [{"text": "Say hi"}],
      "role": "user"
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 100
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HATE_SPEECH",
      "threshold": "BLOCK_NONE"
    }
  ],
  "toolConfig": {
    "functionCallingConfig": {"mode": "AUTO"}
  }
}'
```

</TabItem>

<TabItem value="sdk-native" label="LiteLLM Python SDK">

```python showLineNumbers title="Native top-level fields via LiteLLM Python SDK"
from litellm.google_genai import generate_content
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

response = generate_content(
    model="gemini/{{gemini_flash}}",
    contents=[{"role": "user", "parts": [{"text": "Say hi"}]}],
    safetySettings=[
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"}
    ],
    toolConfig={"functionCallingConfig": {"mode": "AUTO"}},
)
print(response)
```

</TabItem>
</Tabs>


## 相关阅读

- [在 gemini-cli 中使用 LiteLLM](../docs/tutorials/litellm_gemini_cli)
