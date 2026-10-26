# litellm.moderation()
LiteLLM 支持 OpenAI 的内容审核（moderation）端点。

## 用法
```python
import os
from litellm import moderation
os.environ['OPENAI_API_KEY'] = ""
response = moderation(input="i'm ishaan cto of litellm")   
```
