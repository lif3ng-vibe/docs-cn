# [BETA] 图像变体

现已支持 OpenAI 的 `/image/variations` 端点。

## 快速上手

```python
from litellm import image_variation
import os 

# set env vars 
os.environ["OPENAI_API_KEY"] = ""
os.environ["TOPAZ_API_KEY"] = ""

# openai call
response = image_variation(
    model="dall-e-2", image=image_url
)

# topaz call
response = image_variation(
    model="topaz/Standard V2", image=image_url
)

print(response)
```

## 支持的提供商

- OpenAI
- Topaz
