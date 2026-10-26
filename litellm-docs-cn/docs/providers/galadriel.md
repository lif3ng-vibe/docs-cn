import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Galadriel
https://docs.galadriel.com/api-reference/chat-completion-API

LiteLLM 支持 Galadriel 上的所有模型。

## API 密钥
```python
import os 
os.environ['GALADRIEL_API_KEY'] = "your-api-key"
```

## 使用示例
```python
from litellm import completion
import os

os.environ['GALADRIEL_API_KEY'] = ""
response = completion(
    model="galadriel/llama3.1", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 流式使用示例
```python
from litellm import completion
import os

os.environ['GALADRIEL_API_KEY'] = ""
response = completion(
    model="galadriel/llama3.1", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```


## 支持的模型
### Serverless 端点
我们支持 Galadriel AI 的全部模型，发送对话补全（completion）请求时只需在模型名前加上 `galadriel/` 前缀即可。

完整模型名和简化名两种匹配方式都支持。

指定模型时，既可以用完整名称，也可以用简化版本，例如 `llama3.1:70b`。

| 模型名称                                                 | 简化名称                         | 调用示例                                                |
| -------------------------------------------------------- | -------------------------------- | ------------------------------------------------------- |
| neuralmagic/Meta-Llama-3.1-8B-Instruct-FP8               | llama3.1 或 llama3.1:8b          | `completion(model="galadriel/llama3.1", messages)`      |
| neuralmagic/Meta-Llama-3.1-70B-Instruct-quantized.w4a16  | llama3.1:70b                     | `completion(model="galadriel/llama3.1:70b", messages)`  |
| neuralmagic/Meta-Llama-3.1-405B-Instruct-quantized.w4a16 | llama3.1:405b                    | `completion(model="galadriel/llama3.1:405b", messages)` |
| neuralmagic/Mistral-Nemo-Instruct-2407-quantized.w4a16   | mistral-nemo 或 mistral-nemo:12b | `completion(model="galadriel/mistral-nemo", messages)`  |
