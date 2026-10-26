# Cloudflare Workers AI
https://developers.cloudflare.com/workers-ai/models/text-generation/

## API 密钥
```python
# env variable
os.environ['CLOUDFLARE_API_KEY'] = "3dnSGlxxxx"
os.environ['CLOUDFLARE_ACCOUNT_ID'] = "03xxxxx"
```

## 使用示例
```python
from litellm import completion
import os

os.environ['CLOUDFLARE_API_KEY'] = "3dnSGlxxxx"
os.environ['CLOUDFLARE_ACCOUNT_ID'] = "03xxxxx"

response = completion(
    model="cloudflare/@cf/meta/llama-2-7b-chat-int8",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 使用示例（流式）
```python
from litellm import completion
import os

os.environ['CLOUDFLARE_API_KEY'] = "3dnSGlxxxx"
os.environ['CLOUDFLARE_ACCOUNT_ID'] = "03xxxxx"

response = completion(
    model="cloudflare/@hf/thebloke/codellama-7b-instruct-awq",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 支持的模型
凡在 https://developers.cloudflare.com/workers-ai/models/text-generation/ 列出的模型均受支持。

| 模型名称                           | 调用方式                                                 |
|-----------------------------------|----------------------------------------------------------|
| @cf/meta/llama-2-7b-chat-fp16     | `completion(model="mistral/mistral-tiny", messages)`    |
| @cf/meta/llama-2-7b-chat-int8     | `completion(model="mistral/mistral-small", messages)`   |
| @cf/mistral/mistral-7b-instruct-v0.1 | `completion(model="mistral/mistral-medium", messages)` |
| @hf/thebloke/codellama-7b-instruct-awq | `completion(model="codellama/codellama-medium", messages)` |

