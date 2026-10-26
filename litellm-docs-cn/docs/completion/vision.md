import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 使用视觉模型

## 快速上手
下面示例演示如何向模型传入图片。


<Tabs>

<TabItem label="LiteLLMPython SDK" value="Python">

```python
import os 
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"

# openai call
response = completion(
    model = "{{openai_large}}", 
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

</TabItem>
<TabItem label="LiteLLM 代理服务器" value="proxy">

1. 在 config.yaml 中定义视觉模型

```yaml
model_list:
  - model_name: {{openai_large}} # OpenAI {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: llava-hf          # Custom OpenAI compatible model
    litellm_params:
      model: openai/llava-hf/llava-v1.6-vicuna-7b-hf
      api_base: http://localhost:8000
      api_key: fake-key
    model_info:
      supports_vision: True        # set supports_vision to True so /model/info returns this attribute as True

```

2. 启动代理服务器

```bash
litellm --config config.yaml
```

3. 使用 OpenAI Python SDK 进行测试


```python
import os 
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>", # your litellm proxy api key
)

response = client.chat.completions.create(
    model = "{{openai_large}}",  # use model="llava-hf" to test your custom OpenAI endpoint
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




</TabItem>
</Tabs>



## 检查模型是否支持 `vision`

<Tabs>
<TabItem label="LiteLLM Python SDK" value="Python">

使用 `litellm.supports_vision(model="")`：模型支持 `vision` 时返回 `True`，不支持则返回 `False`。

```python keep-model-ids
assert litellm.supports_vision(model="openai/gpt-5.6-terra") == True
assert litellm.supports_vision(model="vertex_ai/gemini-3.1-pro-preview") == True
assert litellm.supports_vision(model="openai/gpt-3.5-turbo") == False
assert litellm.supports_vision(model="xai/grok-2-vision-latest") == True
assert litellm.supports_vision(model="xai/grok-2-latest") == False
```
</TabItem>

<TabItem label="LiteLLM 代理服务器" value="proxy">


1. 在 config.yaml 中定义视觉模型

```yaml
model_list:
  - model_name: {{openai_large}} # OpenAI {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: llava-hf          # Custom OpenAI compatible model
    litellm_params:
      model: openai/llava-hf/llava-v1.6-vicuna-7b-hf
      api_base: http://localhost:8000
      api_key: fake-key
    model_info:
      supports_vision: True        # set supports_vision to True so /model/info returns this attribute as True
```

2. 启动代理服务器

```bash
litellm --config config.yaml
```

3. 调用 `/model_group/info` 检查你的模型是否支持 `vision`

```shell
curl -X 'GET' \
  'http://localhost:4000/model_group/info' \
  -H 'accept: application/json' \
  -H "x-api-key: $LITELLM_API_KEY"
```

预期响应

```json
{
  "data": [
    {
      "model_group": "{{openai_large}}",
      "providers": ["openai"],
      "max_input_tokens": 922000,
      "max_output_tokens": 128000,
      "mode": "chat",
      "supports_vision": true, # 👈 supports_vision is true
      "supports_function_calling": true
    },
    {
      "model_group": "llava-hf",
      "providers": ["openai"],
      "max_input_tokens": null,
      "max_output_tokens": null,
      "mode": null,
      "supports_vision": true, # 👈 supports_vision is true
      "supports_function_calling": false
    }
  ]
}
```

</TabItem>
</Tabs>


## 显式指定图片类型

如果图片没有 MIME 类型，或者 litellm 推断出的 MIME 类型不正确（例如配合 Vertex AI 调用 `gs://` 地址），可以通过 `format` 参数显式指定。

```json
"image_url": {
  "url": "gs://my-gs-image",
  "format": "image/jpeg"
}
```

所有支持指定 MIME 类型的 API 端点（如 anthropic/bedrock/vertex ai）都会使用该值。

其他端点（如 openai）则会忽略它。

<Tabs>
<TabItem label="SDK" value="sdk">

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

# openai call
response = completion(
    model = "{{anthropic}}", 
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
                                  "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png",
                                  "format": "image/jpeg"
                                }
                            }
                        ]
        }
    ],
)

```

</TabItem>
<TabItem label="代理" value="proxy">

1. 在 config.yaml 中定义视觉模型

```yaml
model_list:
  - model_name: {{openai_large}} # OpenAI {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: llava-hf          # Custom OpenAI compatible model
    litellm_params:
      model: openai/llava-hf/llava-v1.6-vicuna-7b-hf
      api_base: http://localhost:8000
      api_key: fake-key
    model_info:
      supports_vision: True        # set supports_vision to True so /model/info returns this attribute as True

```

2. 启动代理服务器

```bash
litellm --config config.yaml
```

3. 使用 OpenAI Python SDK 进行测试


```python
import os 
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>", # your litellm proxy api key
)

response = client.chat.completions.create(
    model = "{{openai_large}}",  # use model="llava-hf" to test your custom OpenAI endpoint
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
                                "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png",
                                "format": "image/jpeg"
                                }
                            }
                        ]
        }
    ],
)

```




</TabItem>
</Tabs>



## 规范

```
"image_url": str

OR 

"image_url": {
  "url": "url OR base64 encoded str",
  "detail": "openai-only param", 
  "format": "specify mime-type of image"
}
```
