
# Scaleway
LiteLLM 支持 [Scaleway Generative APIs 上提供的所有模型 ↗](https://www.scaleway.com/en/docs/generative-apis/reference-content/supported-models/)。

## 通过 LiteLLM Python SDK 使用

```python
import os
from litellm import completion 

os.environ["SCW_SECRET_KEY"] = "your-scaleway-secret-key"

messages = [{"role": "user", "content": "Write a short poem"}]
response = completion(model="scaleway/qwen3-235b-a22b-instruct-2507", messages=messages)
print(response)
```

## 通过 LiteLLM 代理使用

### 1. 在 config.yaml 中设置 Scaleway 模型

```yaml
model_list:
  - model_name: scaleway-model
    litellm_params:
      model: scaleway/qwen3-235b-a22b-instruct-2507
      api_key: "os.environ/SCW_SECRET_KEY" # ensure you have `SCW_SECRET_KEY` in your .env
```

### 2. 启动代理

```bash
litellm --config config.yaml
```

### 3. 调用代理

假设代理运行在 [http://localhost:4000](http://localhost:4000)：
```bash
curl http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_LITELLM_MASTER_KEY" \
  -d '{
    "model": "scaleway-model",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Write a short poem"
      }
    ]
  }'
```
只有当你设置了 LiteLLM 主密钥（master key）时，才需要加 `-H "Authorization: Bearer YOUR_LITELLM_MASTER_KEY" ` 这一项


## 支持的功能

Scaleway 提供商支持 [Generative APIs 参考文档 ↗](https://www.scaleway.com/en/developers/api/generative-apis/) 中的全部功能，例如流式（streaming）、结构化输出（structured outputs）与工具调用（tool calling）。

## 语音转写

Scaleway 的 `/audio/transcriptions` 端点与 OpenAI 兼容，可搭配 Whisper 模型使用。

### Python SDK

```python
import os
from litellm import transcription

os.environ["SCW_SECRET_KEY"] = "your-scaleway-secret-key"

with open("speech.mp3", "rb") as audio_file:
    response = transcription(
        model="scaleway/whisper-large-v3",
        file=audio_file,
    )
print(response.text)
```

### 代理配置

```yaml
model_list:
  - model_name: scaleway-whisper
    litellm_params:
      model: scaleway/whisper-large-v3
      api_key: "os.environ/SCW_SECRET_KEY"
```

### 代理请求

```bash
curl http://localhost:4000/v1/audio/transcriptions \
  -H "Authorization: Bearer YOUR_LITELLM_MASTER_KEY" \
  -F model="scaleway-whisper" \
  -F file="@speech.mp3"
```

支持的可选参数：`language`、`prompt`、`response_format`、`temperature`、`timestamp_granularities`。
