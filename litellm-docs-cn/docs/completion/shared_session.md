# 共享会话支持

## 概述

LiteLLM 现已支持在多个 API 调用之间共享 `aiohttp.ClientSession` 实例，避免创建不必要的新会话。这能提升性能，并减少资源占用。

## 用法

### 基本用法

```python
import asyncio
from aiohttp import ClientSession
from litellm import acompletion

async def main():
    # Create a shared session
    async with ClientSession() as shared_session:
        # Use the same session for multiple calls
        response1 = await acompletion(
            model="{{openai_large}}",
            messages=[{"role": "user", "content": "Hello"}],
            shared_session=shared_session
        )
        
        response2 = await acompletion(
            model="{{openai_large}}", 
            messages=[{"role": "user", "content": "How are you?"}],
            shared_session=shared_session
        )
        
        # Both calls reuse the same session!

asyncio.run(main())
```

### 不使用共享会话（默认）

```python
import asyncio
from litellm import acompletion

async def main():
    # Each call creates a new session
    response1 = await acompletion(
        model="{{openai_large}}",
        messages=[{"role": "user", "content": "Hello"}]
    )
    
    response2 = await acompletion(
        model="{{openai_large}}",
        messages=[{"role": "user", "content": "How are you?"}]
    )
    # Two separate sessions created

asyncio.run(main())
```

## 优势

- **性能**：在多次调用间复用 HTTP 连接
- **资源效率**：降低内存与连接开销
- **更可控**：显式管理会话生命周期
- **易于调试**：轻松追踪哪次调用使用了哪个会话

## 调试日志

开启调试日志，即可实际观察会话的复用情况：

```python
import os
import litellm

# Enable debug logging
os.environ['LITELLM_LOG'] = 'DEBUG'

# You'll see logs like:
# 🔄 SHARED SESSION: acompletion called with shared_session (ID: 12345)
# ✅ SHARED SESSION: Reusing existing ClientSession (ID: 12345)
```

## 常见模式

### FastAPI 集成

```python
from fastapi import FastAPI
import aiohttp
import litellm

app = FastAPI()

@app.post("/chat")
async def chat(messages: list[dict]):
    # Create session per request
    async with aiohttp.ClientSession() as session:
        return await litellm.acompletion(
            model="{{openai_large}}",
            messages=messages,
            shared_session=session
        )
```

### 批处理

```python
import asyncio
from aiohttp import ClientSession
from litellm import acompletion

async def process_batch(messages_list):
    async with ClientSession() as shared_session:
        tasks = []
        for messages in messages_list:
            task = acompletion(
                model="{{openai_large}}",
                messages=messages,
                shared_session=shared_session
            )
            tasks.append(task)
        
        # All tasks use the same session
        results = await asyncio.gather(*tasks)
        return results
```

### 自定义会话配置

```python
import aiohttp
import litellm

# Create optimized session
async with aiohttp.ClientSession(
    timeout=aiohttp.ClientTimeout(total=180),
    connector=aiohttp.TCPConnector(limit=300, limit_per_host=75)
) as shared_session:
    
    response = await litellm.acompletion(
        model="{{openai_large}}",
        messages=[{"role": "user", "content": "Hello"}],
        shared_session=shared_session
    )
```

## 实现细节

`shared_session` 参数会贯穿 LiteLLM 的整条调用链：

1. **`acompletion()`** - 接受 `shared_session` 参数
2. **`BaseLLMHTTPHandler`** - 将会话传递给 HTTP 客户端的创建过程
3. **`AsyncHTTPHandler`** - 若已提供现成会话则直接使用
4. **`LiteLLMAiohttpTransport`** - 复用该会话发起 HTTP 请求

## 向后兼容

- **100% 向后兼容** - 现有代码无需任何改动即可运行
- **可选参数** - 默认为 `shared_session=None`
- **无破坏性变更** - 既有功能全部保留

## 测试

测试共享会话功能：

```python
import asyncio
from aiohttp import ClientSession
from litellm import acompletion

async def test_shared_session():
    async with ClientSession() as session:
        print(f"✅ Created session: {id(session)}")
        
        try:
            response = await acompletion(
                model="{{openai_large}}",
                messages=[{"role": "user", "content": "Hello"}],
                shared_session=session,
                api_key="your-api-key"
            )
            print(f"Response: {response.choices[0].message.content}")
        except Exception as e:
            print(f"✅ Expected error: {type(e).__name__}")
        
        print("✅ Session control working!")

asyncio.run(test_shared_session())
```

## 修改的文件

共享会话功能涉及以下文件的改动：

- `litellm/main.py` - 在 `acompletion()` 与 `completion()` 中新增 `shared_session` 参数
- `litellm/llms/custom_httpx/http_handler.py` - 会话复用的核心逻辑
- `litellm/llms/custom_httpx/llm_http_handler.py` - HTTP 处理器的集成
- `litellm/llms/openai/openai.py` - OpenAI 提供商集成
- `litellm/llms/openai/common_utils.py` - OpenAI 客户端创建
- `litellm/llms/azure/chat/o_series_handler.py` - Azure O Series 处理器

## 故障排查

### 会话未被复用

1. **查看调试日志**：开启 `LITELLM_LOG=DEBUG`，观察会话复用相关的日志输出
2. **确认会话未关闭**：确保发起调用时会话仍处于可用状态
3. **检查参数传递**：确保所有 `acompletion()` 调用都传入了 `shared_session`

### 性能问题

1. **会话配置**：根据实际场景调整 `aiohttp.ClientSession` 的参数
2. **连接数上限**：调整 `TCPConnector` 中的 `limit` 与 `limit_per_host`
3. **超时设置**：为你的运行环境配置合适的超时时间
