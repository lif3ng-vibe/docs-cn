# LiteLLM 密钥（社区密钥，已停用）

免费发放的社区 `sk-litellm-...` 密钥，连同其背后的托管代理（proxy），都已停止提供。LiteLLM SDK 对这类密钥没有任何特殊处理，因此把 `OPENAI_API_KEY`（或任何其他提供商的密钥）设成 `sk-litellm-...` 这种值时，它会被原样发给对应提供商，并因认证错误而被拒绝。

如果想用一个密钥访问多个提供商，可以自行部署 [LiteLLM Proxy](./proxy/quick_start.md) 并配置各提供商的凭据，然后通过 [`litellm_proxy/` 提供商](./providers/litellm_proxy.md)，使用你的代理签发的密钥从 SDK 调用它。

```python
import os
from litellm import completion

os.environ["LITELLM_PROXY_API_BASE"] = "http://0.0.0.0:4000"  # your proxy
os.environ["LITELLM_PROXY_API_KEY"] = os.environ["LITELLM_API_KEY"]

messages = [{"content": "Hello, how are you?", "role": "user"}]

response = completion(model="litellm_proxy/{{openai_small}}", messages=messages)
```

在基于 LiteLLM SDK 构建的工具中，`litellm_proxy/` 前缀的用法完全相同，只要 `LITELLM_PROXY_API_BASE` 指向你的代理即可。所有可调用的模型与提供商，参见[提供商列表](./providers/)或 [models.litellm.ai](https://models.litellm.ai/)。
