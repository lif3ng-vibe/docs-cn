import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# [BETA] Google AI Studio (Gemini) Files API

通过它可以把文件上传到 Google AI Studio (Gemini)。

适合在需要向 Gemini 的 `/generateContent` 端点传入大型媒体文件时使用。

| 操作 | 是否支持 |
|----------|-----------|
| `create` | 是 |
| `delete` | 否 |
| `retrieve` | 否 |
| `list` | 否 |

## 用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import base64
import requests
from litellm import completion, create_file
import os


### UPLOAD FILE ### 

# Fetch the audio file and convert it to a base64 encoded string
url = "https://cdn.openai.com/API/docs/audio/alloy.wav"
response = requests.get(url)
response.raise_for_status()
wav_data = response.content
encoded_string = base64.b64encode(wav_data).decode('utf-8')


file = create_file(
    file=("alloy.wav", wav_data),
    purpose="assistants",
    custom_llm_provider="gemini",
    api_key=os.getenv("GEMINI_API_KEY"),
)

print(f"file: {file}")

assert file is not None


### GENERATE CONTENT ### 
completion = completion(
    model="{{gemini_flash}}",
    messages=[
        {
            "role": "user",
            "content": [
                { 
                    "type": "text",
                    "text": "What is in this recording?"
                },
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                        "filename": "my-test-name",
                        "format": "audio/x-wav"
                    }
                }
            ]
        },
    ]
)

print(completion.choices[0].message)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: "{{gemini_flash}}"
      litellm_params:
        model: gemini/{{gemini_flash}}
        api_key: os.environ/GEMINI_API_KEY
```

2. 启动代理服务器

```bash
litellm --config config.yaml
```

3. 测试

```python
import base64
import requests
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>"
)

# Fetch the audio file and convert it to a base64 encoded string
url = "https://cdn.openai.com/API/docs/audio/alloy.wav"
response = requests.get(url)
response.raise_for_status()
wav_data = response.content
encoded_string = base64.b64encode(wav_data).decode('utf-8')


file = client.files.create(
    file=wav_data,
    purpose="user_data",
    extra_body={"target_model_names": "{{gemini_flash}}"}
)

print(f"file: {file}")

assert file is not None

completion = client.chat.completions.create(
    model="{{gemini_flash}}",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[
        {
            "role": "user",
            "content": [
                { 
                    "type": "text",
                    "text": "What is in this recording?"
                },
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                        "filename": "my-test-name",
                        "format": "audio/wav"
                    }
                }
            ]
        },
    ],
    extra_body={"drop_params": True}
)

print(completion.choices[0].message)
```




</TabItem>
</Tabs>

## Azure Blob Storage 集成

LiteLLM 支持将 Azure Blob Storage 用作 Gemini 文件上传的目标存储后端，这样文件可以存放在 Azure Data Lake Storage Gen2 中，而不必使用 Google 托管的存储。

### 步骤 1：配置 Azure Blob Storage

设置以下环境变量，完成 Azure Blob Storage 账户配置：

**必需的环境变量**：

- `AZURE_STORAGE_ACCOUNT_NAME`：你的 Azure Storage 账户名
- `AZURE_STORAGE_FILE_SYSTEM`：文件存放的容器/文件系统名称
- `AZURE_STORAGE_ACCOUNT_KEY`：你的账户密钥

**可选的环境变量**：

- `AZURE_STORAGE_ENDPOINT_SUFFIX`：存储端点后缀，例如 Azure Government 环境使用 `core.usgovcloudapi.net`，默认为 `core.windows.net`

### 步骤 2：将 Azure Blob Storage 指定为目标存储

上传文件时指定 `target_storage: "azure_storage"`，即可改用 Azure Blob Storage 而不是默认存储。

**支持的文件类型**：

Azure Blob Storage 支持所有 Gemini 兼容的文件类型：

- **图片**：PNG、JPEG、WEBP
- **音频**：AAC、FLAC、MP3、MPA、MPEG、MPGA、OPUS、PCM、WAV、WEBM
- **视频**：FLV、MOV、MPEG、MPEGPS、MPG、MP4、WEBM、WMV、3GPP
- **文档**：PDF、TXT

> **注意**：只有较小的文件才能以内联数据（inline data）方式发送，因为请求总大小上限为 20 MB。


### 步骤 3：通过 Azure Blob Storage 为 Gemini 上传文件

<Tabs>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
    - model_name: "{{gemini_flash}}"
      litellm_params:
        model: gemini/{{gemini_flash}}
        api_key: os.environ/GEMINI_API_KEY
```

2. 设置环境变量

```bash
export AZURE_STORAGE_ACCOUNT_NAME="your-storage-account"
export AZURE_STORAGE_FILE_SYSTEM="your-container-name"
export AZURE_STORAGE_ACCOUNT_KEY="your-account-key"
```
也可以直接写进你的 `.env` 文件

3. 启动代理服务器

```bash
litellm --config config.yaml
```

4. 通过 Azure Blob Storage 上传文件

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>"
)

# Upload file to Azure Blob Storage
file = client.files.create(
    file=open("document.pdf", "rb"),
    purpose="user_data",
    extra_body={
        "target_model_names": "{{gemini_flash}}",
        "target_storage": "azure_storage"  # 👈 Use Azure Blob Storage
    }
)

print(f"File uploaded to Azure Blob Storage: {file.id}")

# Use the file with Gemini
completion = client.chat.completions.create(
    model="{{gemini_flash}}",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Summarize this document"},
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                    }
                }
            ]
        }
    ]
)

print(completion.choices[0].message.content)
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
# Upload file with Azure Blob Storage
curl -X POST "http://0.0.0.0:4000/v1/files" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F "file=@document.pdf" \
  -F "purpose=user_data" \
  -F "target_storage=azure_storage" \
  -F "target_model_names={{gemini_flash}}" \
  -F "custom_llm_provider=gemini"

# Use the file with Gemini
curl -X POST "http://0.0.0.0:4000/v1/chat/completions" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{gemini_flash}}",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "Summarize this document"},
          {
            "type": "file",
            "file": {
              "file_id": "file-id-from-upload",
              "format": "application/pdf"
            }
          }
        ]
      }
    ]
  }'
```

</TabItem>
</Tabs>

:::info
上传到 Azure Blob Storage 的文件会存放在你的 Azure 账户中，可通过返回的文件 ID 访问。文件 URL 格式为：`https://{account}.blob.core.windows.net/{container}/{path}`
:::

