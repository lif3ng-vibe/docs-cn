# litellm.aembedding()

LiteLLM 为 `embedding` 函数提供了异步版本 `aembedding`。
### 用法
```python
from litellm import aembedding
import asyncio

async def test_get_response():
    response = await aembedding('text-embedding-ada-002', input=["good morning from litellm"])
    return response

response = asyncio.run(test_get_response())
print(response)
```
