# Anyscale
https://app.endpoints.anyscale.com/

## API 密钥
```python
# env variable
os.environ['ANYSCALE_API_KEY']
```

## 使用示例
```python
from litellm import completion
import os

os.environ['ANYSCALE_API_KEY'] = ""
response = completion(
    model="anyscale/mistralai/Mistral-7B-Instruct-v0.1", 
    messages=messages
)
print(response)
```

## 使用示例（流式）
```python
from litellm import completion
import os

os.environ['ANYSCALE_API_KEY'] = ""
response = completion(
    model="anyscale/mistralai/Mistral-7B-Instruct-v0.1", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```


## 支持的模型
https://app.endpoints.anyscale.com/ 上列出的所有模型均已支持。模型清单、价格、上下文窗口等信息，我们都会在[这里](https://github.com/BerriAI/litellm/blob/31fbb095c2c365ef30caf132265fe12cff0ef153/model_prices_and_context_window.json#L957)持续维护。

| 模型名称                 | 调用方式                                                                                                                                                           |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| llama2-7b-chat | `completion(model="anyscale/meta-llama/Llama-2-7b-chat-hf", messages)` | 
| llama-2-13b-chat | `completion(model="anyscale/meta-llama/Llama-2-13b-chat-hf", messages)` | 
| llama-2-70b-chat | `completion(model="anyscale/meta-llama/Llama-2-70b-chat-hf", messages)` | 
| mistral-7b-instruct | `completion(model="anyscale/mistralai/Mistral-7B-Instruct-v0.1", messages)` | 
| CodeLlama-34b-Instruct | `completion(model="anyscale/codellama/CodeLlama-34b-Instruct-hf", messages)` |
