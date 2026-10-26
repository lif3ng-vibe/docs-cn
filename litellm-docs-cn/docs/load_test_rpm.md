
# 多实例 TPM/RPM（litellm.Router）

测试你定义的 tpm/rpm 限制在多个 Router 对象实例之间是否得到遵守。

本次测试设定：
- 每个部署（deployment）的最大 RPM 为每分钟 100 个请求
- 路由器的每分钟最大吞吐量为 200 个请求（2 个部署）
- 我们将通过路由器发送的负载为每分钟 600 个请求

:::info

如果不想调用真实的 LLM API 端点（endpoint），可以搭建一个模拟 OpenAI 服务器来代替。[查看代码](#附加搭建模拟-openai-服务器)

:::

### 代码

我们以每分钟 600 个请求的强度压测路由器。

复制下方脚本 👇，保存为 `test_loadtest_router.py`，然后用 `python3 test_loadtest_router.py` 运行。


```python
from litellm import Router 
import litellm
litellm.suppress_debug_info = True
litellm.set_verbose = False
import logging
logging.basicConfig(level=logging.CRITICAL)
import os, random, uuid, time, asyncio

# Model list for OpenAI and Anthropic models
model_list = [
    {
        "model_name": "fake-openai-endpoint",
        "litellm_params": {
            "model": "{{openai_small}}",
            "api_key": "my-fake-key",
            "api_base": "http://0.0.0.0:8080",
            "rpm": 100
        },
    },
    {
        "model_name": "fake-openai-endpoint",
        "litellm_params": {
            "model": "{{openai_small}}",
            "api_key": "my-fake-key",
            "api_base": "http://0.0.0.0:8081",
            "rpm": 100
        },
    },
]

router_1 = Router(model_list=model_list, num_retries=0, enable_pre_call_checks=True, routing_strategy="simple-shuffle", redis_host=os.getenv("REDIS_HOST"), redis_port=os.getenv("REDIS_PORT"), redis_password=os.getenv("REDIS_PASSWORD"))
router_2 = Router(model_list=model_list, num_retries=0, routing_strategy="simple-shuffle", enable_pre_call_checks=True, redis_host=os.getenv("REDIS_HOST"), redis_port=os.getenv("REDIS_PORT"), redis_password=os.getenv("REDIS_PASSWORD"))



async def router_completion_non_streaming():
  try:
    client: Router = random.sample([router_1, router_2], 1)[0] # randomly pick b/w clients
    # print(f"client={client}")
    response = await client.acompletion(
              model="fake-openai-endpoint", # [CHANGE THIS] (if you call it something else on your proxy)
              messages=[{"role": "user", "content": f"This is a test: {uuid.uuid4()}"}],
          )
    return response
  except Exception as e:
    # print(e)
    return None
  
async def loadtest_fn():
    start = time.time()
    n = 600  # Number of concurrent tasks
    tasks = [router_completion_non_streaming() for _ in range(n)]
    chat_completions = await asyncio.gather(*tasks)
    successful_completions = [c for c in chat_completions if c is not None]
    print(n, time.time() - start, len(successful_completions))

def get_utc_datetime():
    import datetime as dt
    from datetime import datetime

    if hasattr(dt, "UTC"):
        return datetime.now(dt.UTC)  # type: ignore
    else:
        return datetime.utcnow()  # type: ignore


# Run the event loop to execute the async function
async def parent_fn():
  for _ in range(10):
    dt = get_utc_datetime()
    current_minute = dt.strftime("%H-%M")
    print(f"triggered new batch - {current_minute}")
    await loadtest_fn()
    await asyncio.sleep(10)

asyncio.run(parent_fn())
```
## 多实例 TPM/RPM 负载测试（代理）

测试你定义的 tpm/rpm 限制在多个实例之间是否得到遵守。

最快的方法是直接对[代理（proxy）](./proxy/quick_start.md)进行测试。代理底层用的就是[路由器（router）](./routing.md)，所以无论你用的是哪一个，这个测试都适用。

本次测试设定：
- 每个部署的最大 RPM 为每分钟 100 个请求
- 代理的每分钟最大吞吐量为 200 个请求（2 个部署）
- 我们将发送给代理的负载为每分钟 600 个请求


也就是说，我们每分钟会发出 600 个请求，但预期每分钟只有 200 个请求能成功。

:::info

如果不想调用真实的 LLM API 端点，可以搭建一个模拟 OpenAI 服务器来代替。[查看代码](#附加搭建模拟-openai-服务器)

:::

### 1. 配置设置

```yaml
model_list:
- litellm_params:
    api_base: http://0.0.0.0:8080
    api_key: my-fake-key
    model: openai/my-fake-model
    rpm: 100
  model_name: fake-openai-endpoint
- litellm_params:
    api_base: http://0.0.0.0:8081
    api_key: my-fake-key
    model: openai/my-fake-model-2
    rpm: 100
  model_name: fake-openai-endpoint
router_settings:
  num_retries: 0
  enable_pre_call_checks: true
  redis_host: os.environ/REDIS_HOST ## 👈 IMPORTANT! Setup the proxy w/ redis
  redis_password: os.environ/REDIS_PASSWORD
  redis_port: os.environ/REDIS_PORT
  routing_strategy: simple-shuffle # recommended for best performance
```

### 2. 启动 2 个代理实例

**实例 1**
```bash
litellm --config /path/to/config.yaml --port 4000

## RUNNING on http://0.0.0.0:4000
```

**实例 2**
```bash
litellm --config /path/to/config.yaml --port 4001

## RUNNING on http://0.0.0.0:4001
```

### 3. 运行测试

我们以每分钟 600 个请求的强度压测代理。

复制下方脚本 👇，保存为 `test_loadtest_proxy.py`，然后用 `python3 test_loadtest_proxy.py` 运行。

```python
from openai import AsyncOpenAI, AsyncAzureOpenAI
import random, uuid
import time, asyncio, litellm
# import logging
# logging.basicConfig(level=logging.DEBUG)
#### LITELLM PROXY #### 
litellm_client = AsyncOpenAI(
    api_key="sk-<your-litellm-api-key>", # [CHANGE THIS]
    base_url="http://0.0.0.0:4000"
)
litellm_client_2 = AsyncOpenAI(
    api_key="sk-<your-litellm-api-key>", # [CHANGE THIS]
    base_url="http://0.0.0.0:4001"
)

async def proxy_completion_non_streaming():
  try:
    client = random.sample([litellm_client, litellm_client_2], 1)[0] # randomly pick b/w clients
    # print(f"client={client}")
    response = await client.chat.completions.create(
              model="fake-openai-endpoint", # [CHANGE THIS] (if you call it something else on your proxy)
              messages=[{"role": "user", "content": f"This is a test: {uuid.uuid4()}"}],
          )
    return response
  except Exception as e:
    # print(e)
    return None
  
async def loadtest_fn():
    start = time.time()
    n = 600  # Number of concurrent tasks
    tasks = [proxy_completion_non_streaming() for _ in range(n)]
    chat_completions = await asyncio.gather(*tasks)
    successful_completions = [c for c in chat_completions if c is not None]
    print(n, time.time() - start, len(successful_completions))

def get_utc_datetime():
    import datetime as dt
    from datetime import datetime

    if hasattr(dt, "UTC"):
        return datetime.now(dt.UTC)  # type: ignore
    else:
        return datetime.utcnow()  # type: ignore


# Run the event loop to execute the async function
async def parent_fn():
  for _ in range(10):
    dt = get_utc_datetime()
    current_minute = dt.strftime("%H-%M")
    print(f"triggered new batch - {current_minute}")
    await loadtest_fn()
    await asyncio.sleep(10)

asyncio.run(parent_fn())

```


### 附加：搭建模拟 OpenAI 服务器

我们来搭建一个 RPM 限制为 100 的模拟 OpenAI 服务器。

我们将文件命名为 `fake_openai_server.py`。

```
# import sys, os
# sys.path.insert(
#     0, os.path.abspath("../")
# )  # Adds the parent directory to the system path
from fastapi import FastAPI, Request, status, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import FastAPI, Request, HTTPException, UploadFile, File
import httpx, os, json
from openai import AsyncOpenAI
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import PlainTextResponse


class ProxyException(Exception):
    # NOTE: DO NOT MODIFY THIS
    # This is used to map exactly to OPENAI Exceptions
    def __init__(
        self,
        message: str,
        type: str,
        param: Optional[str],
        code: Optional[int],
    ):
        self.message = message
        self.type = type
        self.param = param
        self.code = code

    def to_dict(self) -> dict:
        """Converts the ProxyException instance to a dictionary."""
        return {
            "message": self.message,
            "type": self.type,
            "param": self.param,
            "code": self.code,
        }


limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def _rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429,
                        content={"detail": "Rate Limited!"})

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# for completion
@app.post("/chat/completions")
@app.post("/v1/chat/completions")
@limiter.limit("100/minute")
async def completion(request: Request):
    # raise HTTPException(status_code=429, detail="Rate Limited!")
    return {
        "id": "chatcmpl-123",
        "object": "chat.completion",
        "created": 1677652288,
        "model": None,
        "system_fingerprint": "fp_44709d6fcb",
        "choices": [{
            "index": 0,
            "message": {
            "role": "assistant",
            "content": "\n\nHello there, how may I assist you today?",
            },
            "logprobs": None,
            "finish_reason": "stop"
        }],
        "usage": {
            "prompt_tokens": 9,
            "completion_tokens": 12,
            "total_tokens": 21
        }
    }

if __name__ == "__main__":
    import socket
    import uvicorn
    port = 8080
    while True:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('0.0.0.0', port))
        if result != 0:
            print(f"Port {port} is available, starting server...")
            break
        else:
            port += 1

    uvicorn.run(app, host="0.0.0.0", port=port)
```

```bash
python3 fake_openai_server.py
```
