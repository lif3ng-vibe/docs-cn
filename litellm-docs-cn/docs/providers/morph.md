# Morph

LiteLLM 支持 [Morph](https://morphllm.com) 上的所有模型

## 概览

Morph 提供专为智能体（agentic）工作流打造的专用 AI 模型，在精确的代码编辑与修改方面尤为出色。其 "Apply" 系列模型可对代码做定点修改，无需重写整个文件，非常适合需要基于上下文智能调整代码的 AI 智能体。

## API 密钥
```python
import os 
os.environ["MORPH_API_KEY"] = "your-api-key"
```

## 使用示例

```python
from litellm import completion

# set env variable 
os.environ["MORPH_API_KEY"] = "your-api-key"

messages = [
    {"role": "user", "content": "Write a Python function to calculate factorial"}
]

## Morph v3 Fast - Optimized for speed
response = completion(
    model="morph/morph-v3-fast",
    messages=messages,
)
print(response)

## Morph v3 Large - Most capable model
response = completion(
    model="morph/morph-v3-large", 
    messages=messages,
)
print(response)
```

## 流式使用示例
```python
from litellm import completion

# set env variable
os.environ["MORPH_API_KEY"] = "your-api-key"

messages = [
    {"role": "user", "content": "Write a Python function to calculate factorial"}
]

## Morph v3 Fast with streaming
response = completion(
    model="morph/morph-v3-fast",
    messages=messages,
    stream=True,
)

for chunk in response:
    print(chunk)
```

## 支持的模型

| 模型名称 | Function Call | 说明 | 上下文窗口 |
|--------------------------|--------------------------------------------|-----------------------|----------------|
| morph-v3-fast            | `completion('morph/morph-v3-fast', messages)` | 速度最快的模型，针对快速响应做了优化 | 16k tokens |
| morph-v3-large           | `completion('morph/morph-v3-large', messages)` | 能力最强的模型，适合复杂任务 | 16k tokens |

## LiteLLM 代理服务器用法

以下是通过 LiteLLM 代理服务器（Proxy Server）使用 Morph 的方法：

1. 在环境中保存 API 密钥
```bash
export MORPH_API_KEY="your-api-key"
```

2. 将模型添加到 config.yaml
```yaml
model_list:
  - model_name: morph-v3-fast
    litellm_params:
      model: morph/morph-v3-fast
      
  - model_name: morph-v3-large
    litellm_params:
      model: morph/morph-v3-large
```

3. 启动代理服务器
```bash
litellm --config config.yaml
```

## 进阶用法

### 设置 API 地址
```python
import litellm 

# set custom api base
response = completion(
    model="morph/morph-v3-large",
    messages=[{"role": "user", "content": "Hello, world!"}],
    api_base="https://api.morphllm.com/v1"
)
print(response)
```

### 设置 API 密钥
```python 
import litellm 

# set api key via completion
response = completion(
    model="morph/morph-v3-large",
    messages=[{"role": "user", "content": "Hello, world!"}],
    api_key="your-api-key"
)
print(response)
```
