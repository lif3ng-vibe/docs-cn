# watsonx.ai 重排序

## 概述

| 属性 | 详情                                                                  |
|----------|--------------------------------------------------------------------------|
| 描述 | watsonx.ai 重排序集成                                            |
| LiteLLM 中的提供商路由 | `watsonx/`                                                               |
| 支持的操作 | `/ml/v1/text/rerank`                                                     |
| 提供商文档链接 | [IBM WatsonX.ai ↗](https://cloud.ibm.com/apidocs/watsonx-ai#text-rerank) |

## 快速上手

### **LiteLLM SDK**

```python
import os
from litellm import rerank

os.environ["WATSONX_APIKEY"] = "YOUR_WATSONX_APIKEY"
os.environ["WATSONX_API_BASE"] = "YOUR_WATSONX_API_BASE"
os.environ["WATSONX_PROJECT_ID"] = "YOUR_WATSONX_PROJECT_ID"

query="Best programming language for beginners?"
documents=[
    "Python is great for beginners due to simple syntax.",
    "JavaScript runs in browsers and is versatile.",
    "Rust has a steep learning curve but is very safe.",
]

response = rerank(
    model="watsonx/cross-encoder/ms-marco-minilm-l-12-v2",
    query=query,
    documents=documents,
    top_n=2,
    return_documents=True,
)

print(response)
```

### **LiteLLM Proxy**

```yaml
model_list:
  - model_name: cross-encoder/ms-marco-minilm-l-12-v2
    litellm_params:
      model: watsonx/cross-encoder/ms-marco-minilm-l-12-v2
      api_key: os.environ/WATSONX_APIKEY
      api_base: os.environ/WATSONX_API_BASE
      project_id: os.environ/WATSONX_PROJECT_ID
```
