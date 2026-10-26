# 自定义 HTTP 处理器

在 LiteLLM 补全（completion）中配置自定义 aiohttp 会话（session），获得更好的性能与更强的控制力。

## 概览

你可以向 LiteLLM 注入自定义的 `aiohttp.ClientSession` 实例，用于：
- 自定义连接池（connection pool）与超时
- 企业代理与 SSL 配置
- 性能优化
- 请求监控

:::info 适用范围
`BaseLLMAIOHTTPHandler` 只被 `aiohttp_openai/` 提供商（对话补全）和 Topaz 图像变体（image variations）使用。发往其他提供商（包括普通的 `openai/`）的请求走的是基于 httpx 的客户端，不受该处理器影响。

`litellm.completion` 调用的实例位于 `litellm.main` 模块中，因此替换实例必须赋值给 `litellm.main.base_llm_aiohttp_handler`。如果设置的是 `litellm.base_llm_aiohttp_handler`，只会在 `litellm` 包上新建一个无人读取的属性，自定义会话会被静默忽略。`litellm.images.main` 在导入时就绑定了自己对处理器的引用，所以 Topaz 图像变体的调用路径不会因这次赋值而改变。
:::

## 基本用法

### 默认行为（无需更改）
```python
import litellm

# Works exactly as before
response = await litellm.acompletion(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 自定义会话
```python
import aiohttp
import litellm
import litellm.main
from litellm.llms.custom_httpx.aiohttp_handler import BaseLLMAIOHTTPHandler

# Create optimized session
session = aiohttp.ClientSession(
    timeout=aiohttp.ClientTimeout(total=180),
    connector=aiohttp.TCPConnector(limit=300, limit_per_host=75)
)

# Replace the handler that litellm.completion uses
litellm.main.base_llm_aiohttp_handler = BaseLLMAIOHTTPHandler(client_session=session)

# aiohttp_openai/ completions now use your session
response = await litellm.acompletion(model="aiohttp_openai/{{openai_small}}", messages=[...])
```

## 常见模式

### FastAPI 集成
```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
import aiohttp
import litellm
import litellm.main
from litellm.llms.custom_httpx.aiohttp_handler import BaseLLMAIOHTTPHandler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    session = aiohttp.ClientSession(
        timeout=aiohttp.ClientTimeout(total=180),
        connector=aiohttp.TCPConnector(limit=300)
    )
    litellm.main.base_llm_aiohttp_handler = BaseLLMAIOHTTPHandler(
        client_session=session
    )
    yield
    # Shutdown
    await session.close()

app = FastAPI(lifespan=lifespan)

@app.post("/chat")
async def chat(messages: list[dict]):
    return await litellm.acompletion(model="aiohttp_openai/{{openai_small}}", messages=messages)
```

### 企业代理
```python
import ssl

# Custom SSL context
ssl_context = ssl.create_default_context()
ssl_context.load_cert_chain('cert.pem', 'key.pem')

# Proxy session
session = aiohttp.ClientSession(
    connector=aiohttp.TCPConnector(ssl=ssl_context),
    trust_env=True  # Use environment proxy settings
)

litellm.main.base_llm_aiohttp_handler = BaseLLMAIOHTTPHandler(client_session=session)
```

### 高性能配置
```python
# Optimized for high throughput
session = aiohttp.ClientSession(
    timeout=aiohttp.ClientTimeout(total=300),
    connector=aiohttp.TCPConnector(
        limit=1000,             # High connection limit
        limit_per_host=200,     # Per host limit
        ttl_dns_cache=600,      # DNS cache
        keepalive_timeout=60,   # Keep connections alive
        enable_cleanup_closed=True
    )
)

litellm.main.base_llm_aiohttp_handler = BaseLLMAIOHTTPHandler(client_session=session)
```

## 构造函数选项

```python
BaseLLMAIOHTTPHandler(
    client_session=None,    # Custom aiohttp.ClientSession
    transport=None,         # Advanced transport control
    connector=None,         # Custom aiohttp.BaseConnector
)
```

## 资源管理

- **用户会话**：生命周期由你管理（需自行调用 `await session.close()`）
- **自动创建的会话**：由处理器自动清理
- **100% 向后兼容**：现有代码无需任何改动即可继续工作

## 配置建议

### 开发环境
```python
session = aiohttp.ClientSession(
    timeout=aiohttp.ClientTimeout(total=60),
    connector=aiohttp.TCPConnector(limit=50)
)
```

### 生产环境
```python
session = aiohttp.ClientSession(
    timeout=aiohttp.ClientTimeout(total=300),
    connector=aiohttp.TCPConnector(
        limit=1000,
        limit_per_host=200,
        keepalive_timeout=60
    )
)
```
