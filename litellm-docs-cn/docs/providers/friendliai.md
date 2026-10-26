# FriendliAI

:::info
**我们支持 FriendliAI 的全部模型，发送补全（completion）请求时只需在模型名前加上 `friendliai/` 前缀**
:::

| 属性                       | 说明                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| 描述                       | 速度最快、效率最高的推理引擎，助你构建可直接投产的复合 AI 系统。                                  |
| LiteLLM 提供商路由         | `friendliai/`                                                                                   |
| 提供商文档                 | [FriendliAI ↗](https://friendli.ai/docs/sdk/integrations/litellm)                               |
| 支持的 OpenAI 端点         | `/chat/completions`, `/completions`                                                             |

## API 密钥

```python
# env variable
os.environ['FRIENDLI_TOKEN']
```

## 使用示例

```python
from litellm import completion
import os

os.environ['FRIENDLI_TOKEN'] = ""
response = completion(
    model="friendliai/meta-llama-3.1-8b-instruct",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 使用示例：流式

```python
from litellm import completion
import os

os.environ['FRIENDLI_TOKEN'] = ""
response = completion(
    model="friendliai/meta-llama-3.1-8b-instruct",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 支持的模型

我们支持 FriendliAI 的全部 AI 模型，发送补全请求时只需在模型名前加上 `friendliai/` 前缀

| 模型名                      | 调用方式                                                               |
| --------------------------- | ---------------------------------------------------------------------- |
| meta-llama-3.1-8b-instruct  | `completion(model="friendliai/meta-llama-3.1-8b-instruct", messages)`  |
| meta-llama-3.1-70b-instruct | `completion(model="friendliai/meta-llama-3.1-70b-instruct", messages)` |
