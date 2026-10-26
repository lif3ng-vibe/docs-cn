import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 调用微调模型

## OpenAI


| 模型名称                | 调用方式                                                          |
|---------------------------|-----------------------------------------------------------------|
| 微调后的 `gpt-4-0613`    | `response = completion(model="ft:gpt-4-0613", messages=messages)`     |
| 微调后的 `gpt-4o-2024-05-13` | `response = completion(model="ft:gpt-4o-2024-05-13", messages=messages)` |
| 微调后的 `gpt-3.5-turbo-0125` | `response = completion(model="ft:gpt-3.5-turbo-0125", messages=messages)` |
| 微调后的 `gpt-3.5-turbo-1106` | `response = completion(model="ft:gpt-3.5-turbo-1106", messages=messages)` |
| 微调后的 `gpt-3.5-turbo-0613` | `response = completion(model="ft:gpt-3.5-turbo-0613", messages=messages)` |


## Vertex AI

Vertex AI 上的微调模型使用纯数字形式的模型/端点 ID。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

## set ENV variables
os.environ["VERTEXAI_PROJECT"] = "hardy-device-38811"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = completion(
  model="vertex_ai/<your-finetuned-model>",  # e.g. vertex_ai/4965075652664360960
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  base_model="vertex_ai/{{gemini_pro}}" # the base model - used for routing
)
```

</TabItem>
<TabItem value="proxy" label="代理服务器">

1. 将 Vertex 凭据添加到环境变量

```bash
!gcloud auth application-default login
```

2. 配置 config.yaml

```yaml
- model_name: finetuned-gemini
  litellm_params:
    model: vertex_ai/<ENDPOINT_ID>
    vertex_project: <PROJECT_ID>
    vertex_location: <LOCATION>
  model_info:
    base_model: vertex_ai/{{gemini_pro}} # IMPORTANT
```

3. 测试一下

```bash
curl --location 'https://0.0.0.0:4000/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: <LITELLM_KEY>' \
--data '{"model": "finetuned-gemini" ,"messages":[{"role": "user", "content":[{"type": "text", "text": "hi"}]}]}'
```

</TabItem>
</Tabs>
