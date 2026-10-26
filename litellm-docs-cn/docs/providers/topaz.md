# Topaz

| Property | Details |
|-------|-------|
| 描述 | AI 驱动的专业级照片与视频编辑。 |
| LiteLLM 提供商路由 | `topaz/` |
| 提供商文档 | [Topaz ↗](https://www.topazlabs.com/enhance-api) |
| 提供商 API 端点 | https://api.topazlabs.com |
| 支持的 OpenAI 端点 | `/image/variations` |


## 快速上手

```python
from litellm import image_variation
import os 

os.environ["TOPAZ_API_KEY"] = ""
response = image_variation(
    model="topaz/Standard V2", image=image_url
)
```

## 支持的 OpenAI 参数

- `response_format`
- `size`（宽 x 高）
