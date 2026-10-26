# Petals
Petals：https://github.com/bigscience-workshop/petals

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_Petals.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="在 Colab 中打开"/>
</a>

## 前提条件
请确保已安装 `petals`
```shell
uv add git+https://github.com/bigscience-workshop/petals
```

## 用法
请确保为所有 petals 模型加上 `petals/` 前缀，这样会将 custom_llm_provider 设置为 petals。

```python
from litellm import completion

response = completion(
    model="petals/petals-team/StableBeluga2", 
    messages=[{ "content": "Hello, how are you?","role": "user"}]
)

print(response)
```

## 流式用法

```python
response = completion(
    model="petals/petals-team/StableBeluga2", 
    messages=[{ "content": "Hello, how are you?","role": "user"}],
    stream=True
)

print(response)
for chunk in response:
  print(chunk)
```

### 模型详情

| 模型名称       | 函数调用                              |
|------------------|--------------------------------------------|
| petals-team/StableBeluga | `completion('petals/petals-team/StableBeluga2', messages)` | 
| huggyllama/llama-65b | `completion('petals/huggyllama/llama-65b', messages)` | 

