# NLP Cloud

LiteLLM 支持 NLP Cloud 上的所有 LLM。

## API 密钥

```python
import os

os.environ["NLP_CLOUD_API_KEY"] = "your-api-key"
```

## 使用示例

```python
import os
from litellm import completion

# set env
os.environ["NLP_CLOUD_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(model="dolphin", messages=messages)
print(response)
```

## 流式

调用 completion 时设置 `stream=True` 即可。

```python
import os
from litellm import completion

# set env
os.environ["NLP_CLOUD_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(model="dolphin", messages=messages, stream=True)
for chunk in response:
    print(chunk["choices"][0]["delta"]["content"])  # same as openai format
```

## 非 dolphin 模型

默认情况下，LiteLLM 会将 `dolphin` 和 `chatdolphin` 映射到 NLP Cloud。

如果想通过 NLP Cloud 调用其他模型（如 GPT-J、Llama-2 等），只需将其设为你的自定义 LLM 提供商（provider）即可。


```python
import os
from litellm import completion

# set env - [OPTIONAL] replace with your nlp cloud key
os.environ["NLP_CLOUD_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Hey! how's it going?"}]

# e.g. to call Llama2 on NLP Cloud
response = completion(model="nlp_cloud/finetuned-llama-2-70b", messages=messages, stream=True)
for chunk in response:
    print(chunk["choices"][0]["delta"]["content"])  # same as openai format
```
