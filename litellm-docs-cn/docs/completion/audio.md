import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 使用音频模型

如何通过 `/chat/completions` 端点发送 / 接收音频


## 模型的音频输出

示例：针对一段提示词，生成拟人化的音频回复

<Tabs>

<TabItem label="LiteLLM Python SDK" value="Python">

```python
import os 
import base64
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"

# openai call
completion = await litellm.acompletion(
    model="gpt-4o-audio-preview",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[{"role": "user", "content": "Is a golden retriever a good family dog?"}],
)

wav_bytes = base64.b64decode(completion.choices[0].message.audio.data)
with open("dog.wav", "wb") as f:
    f.write(wav_bytes)
```

</TabItem>
<TabItem label="LiteLLM 代理服务器" value="proxy">

1. 在 config.yaml 中定义音频模型

```yaml
model_list:
  - model_name: gpt-4o-audio-preview # OpenAI gpt-4o-audio-preview
    litellm_params:
      model: openai/gpt-4o-audio-preview
      api_key: os.environ/OPENAI_API_KEY 

```

2. 启动代理服务器

```bash
litellm --config config.yaml
```

3. 使用 OpenAI Python SDK 测试


```python
import base64
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY", # sk-<your-litellm-api-key>
    base_url="LITELLM_PROXY_BASE" # http://0.0.0.0:4000
)

completion = client.chat.completions.create(
    model="gpt-4o-audio-preview",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[
        {
            "role": "user",
            "content": "Is a golden retriever a good family dog?"
        }
    ]
)

print(completion.choices[0])

wav_bytes = base64.b64decode(completion.choices[0].message.audio.data)
with open("dog.wav", "wb") as f:
    f.write(wav_bytes)

```




</TabItem>
</Tabs>

## 向模型输入音频


<Tabs>

<TabItem label="LiteLLM Python SDK" value="Python">

```python
import base64
import requests

url = "https://openaiassets.blob.core.windows.net/$web/API/docs/audio/alloy.wav"
response = requests.get(url)
response.raise_for_status()
wav_data = response.content
encoded_string = base64.b64encode(wav_data).decode("utf-8")

completion = litellm.completion(
    model="gpt-4o-audio-preview",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this recording?"},
                {
                    "type": "input_audio",
                    "input_audio": {"data": encoded_string, "format": "wav"},
                },
            ],
        },
    ],
)

print(completion.choices[0].message)
```

</TabItem>

<TabItem label="LiteLLM 代理服务器" value="proxy">


1. 在 config.yaml 中定义音频模型

```yaml
model_list:
  - model_name: gpt-4o-audio-preview # OpenAI gpt-4o-audio-preview
    litellm_params:
      model: openai/gpt-4o-audio-preview
      api_key: os.environ/OPENAI_API_KEY 

```

2. 启动代理服务器

```bash
litellm --config config.yaml
```

3. 使用 OpenAI Python SDK 测试


```python
import base64
from openai import OpenAI

client = OpenAI(
    api_key="LITELLM_PROXY_KEY", # sk-<your-litellm-api-key>
    base_url="LITELLM_PROXY_BASE" # http://0.0.0.0:4000
)


# Fetch the audio file and convert it to a base64 encoded string
url = "https://openaiassets.blob.core.windows.net/$web/API/docs/audio/alloy.wav"
response = requests.get(url)
response.raise_for_status()
wav_data = response.content
encoded_string = base64.b64encode(wav_data).decode('utf-8')

completion = client.chat.completions.create(
    model="gpt-4o-audio-preview",
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
                    "type": "input_audio",
                    "input_audio": {
                        "data": encoded_string,
                        "format": "wav"
                    }
                }
            ]
        },
    ]
)

print(completion.choices[0].message)
```


</TabItem>
</Tabs>

## 检查模型是否支持 `audio_input` 与 `audio_output`

<Tabs>
<TabItem label="LiteLLM Python SDK" value="Python">

使用 `litellm.supports_audio_output(model="")` —— 若模型能生成音频输出则返回 `True`

使用 `litellm.supports_audio_input(model="")` —— 若模型能接受音频输入则返回 `True`

```python
assert litellm.supports_audio_output(model="gpt-audio") == True
assert litellm.supports_audio_input(model="gpt-audio") == True

assert litellm.supports_audio_output(model="{{openai_small}}") == False
assert litellm.supports_audio_input(model="{{openai_small}}") == False
```
</TabItem>

<TabItem label="LiteLLM 代理服务器" value="proxy">


1. 在 config.yaml 中定义音频模型

```yaml
model_list:
  - model_name: gpt-audio # OpenAI gpt-audio
    litellm_params:
      model: openai/gpt-audio
      api_key: os.environ/OPENAI_API_KEY
  - model_name: llava-hf          # Custom OpenAI compatible model
    litellm_params:
      model: openai/llava-hf/llava-v1.6-vicuna-7b-hf
      api_base: http://localhost:8000
      api_key: fake-key
    model_info:
      supports_audio_output: True        # set supports_audio_output to True so /model/info returns this attribute as True
      supports_audio_input: True         # set supports_audio_input to True so /model/info returns this attribute as True
```

2. 启动代理服务器

```bash
litellm --config config.yaml
```

3. 调用 `/model/info` 检查模型是否支持音频输入与输出。这些标志会出现在每个部署的 `model_info` 中，来源是 `litellm.model_cost` 或你在 `config.yaml` 中的设置。`/model_group/info` 不会返回 `supports_audio_input` 或 `supports_audio_output`

```shell
curl -X 'GET' \
  'http://localhost:4000/model/info' \
  -H 'accept: application/json' \
  -H "x-api-key: $LITELLM_API_KEY"
```

预期响应（有删减）

```json
{
  "data": [
    {
      "model_name": "gpt-audio",
      "model_info": {
        "max_input_tokens": 128000,
        "max_output_tokens": 16384,
        "mode": "chat",
        "supports_audio_input": true,
        "supports_audio_output": true
      }
    },
    {
      "model_name": "llava-hf",
      "model_info": {
        "max_input_tokens": null,
        "max_output_tokens": null,
        "mode": null,
        "supports_audio_input": true,
        "supports_audio_output": true
      }
    }
  ]
}
```

</TabItem>
</Tabs>


## 音频响应格式

下面是向模型发送音频输入时，`/chat/completions` 端点可能返回的 `message` JSON 数据结构示例。

```json
{
  "index": 0,
  "message": {
    "role": "assistant",
    "content": null,
    "refusal": null,
    "audio": {
      "id": "audio_abc123",
      "expires_at": 1729018505,
      "data": "<bytes omitted>",
      "transcript": "Yes, golden retrievers are known to be ..."
    }
  },
  "finish_reason": "stop"
}
```
- `audio` 当请求了音频输出模态时，该对象包含模型音频响应的相关数据
    - `audio.id` 这条音频响应的唯一标识符
    - `audio.expires_at` Unix 时间戳（秒），超过这个时间点后，该音频响应将无法再从服务器获取，也无法继续用于多轮对话。
    - `audio.data` 模型生成的 Base64 编码音频字节，格式为请求中指定的格式。
    - `audio.transcript` 模型生成的音频所对应的文字转录。
