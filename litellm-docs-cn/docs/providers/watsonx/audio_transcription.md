# WatsonX 语音转写

## 概览

| 属性 | 详情 |
|----------|---------|
| 说明 | 通过 Whisper 模型实现语音转文字（speech-to-text）的 WatsonX 语音转写 |
| LiteLLM 中的提供商路由 | `watsonx/` |
| 支持的操作 | `/v1/audio/transcriptions` |
| 提供商文档链接 | [IBM WatsonX.ai ↗](https://www.ibm.com/watsonx) |

## 快速上手

### **LiteLLM SDK**

```python showLineNumbers title="transcription.py"
import litellm

response = litellm.transcription(
    model="watsonx/whisper-large-v3-turbo",
    file=open("audio.mp3", "rb"),
    api_base="https://us-south.ml.cloud.ibm.com",
    api_key="your-api-key",
    project_id="your-project-id"
)
print(response.text)
```

### **LiteLLM 代理**

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: whisper-large-v3-turbo
    litellm_params:
      model: watsonx/whisper-large-v3-turbo
      api_key: os.environ/WATSONX_APIKEY
      api_base: os.environ/WATSONX_URL
      project_id: os.environ/WATSONX_PROJECT_ID
```

```bash title="Request"
curl http://localhost:4000/v1/audio/transcriptions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F file="@audio.mp3" \
  -F model="whisper-large-v3-turbo"
```

## 支持的参数

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `model` | string | 模型 ID（如 `watsonx/whisper-large-v3-turbo`） |
| `file` | file | 待转写的音频文件 |
| `language` | string | 语言代码（如 `en`） |
| `prompt` | string | 可选提示词，用于引导转写结果 |
| `temperature` | float | 采样温度（0-1） |
| `response_format` | string | `json`、`text`、`srt`、`verbose_json`、`vtt` |
