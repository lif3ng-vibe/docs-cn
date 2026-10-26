# Aleph Alpha

LiteLLM 支持 [Aleph Alpha](https://www.aleph-alpha.com/) 的全部模型。

与 AI21 和 Cohere 一样，你可以直接使用这些模型，无需候补排队。

### API 密钥
```python
import os
os.environ["ALEPHALPHA_API_KEY"] = ""
```

### Aleph Alpha 模型
https://www.aleph-alpha.com/

| 模型名称       | 函数调用                                  | 所需环境变量              |
|------------------|--------------------------------------------|------------------------------------|
| luminous-base       | `completion(model='luminous-base', messages=messages)`         | `os.environ['ALEPHALPHA_API_KEY']`     |
| luminous-base-control       | `completion(model='luminous-base-control', messages=messages)`         | `os.environ['ALEPHALPHA_API_KEY']`     |
| luminous-extended       | `completion(model='luminous-extended', messages=messages)`         | `os.environ['ALEPHALPHA_API_KEY']`     |
| luminous-extended-control       | `completion(model='luminous-extended-control', messages=messages)`         | `os.environ['ALEPHALPHA_API_KEY']`     |
| luminous-supreme     | `completion(model='luminous-supreme', messages=messages)`         | `os.environ['ALEPHALPHA_API_KEY']`     |
| luminous-supreme-control     | `completion(model='luminous-supreme-control', messages=messages)`         | `os.environ['ALEPHALPHA_API_KEY']`     |
