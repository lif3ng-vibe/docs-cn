import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 沙箱与代码执行

在隔离的沙箱（sandbox）中运行模型生成的代码，并取回执行输出。这套 API 与提供商无关；目前支持 e2b 和 opensandbox 两种后端，通过 HTTPS 直连，无需额外的 SDK 依赖。

| 功能 | 支持情况 |
|---------|-----------|
| 支持的提供商 | `e2b`, `opensandbox` |
| 成本追踪（cost tracking） | 透传（沙箱计费仍归提供商） |
| 日志 | 走 `litellm.asearch` 使用的标准 `@client` 日志路径 |
| 代理端点 | 经 `/v1/responses` 和 `/v1/chat/completions` 上的代码解释器拦截器提供（见下文）；暂无独立的 `/v1/sandbox` 端点 |

:::tip

`code` 是一段可执行的字符串。没有语言选项，也没有自造的结果结构；[`CodeExecutionResult`](#响应codeexecutionresult) 原样透传沙箱自身的输出（stdout、stderr、base64 图表之类的 results、错误的 name/value/traceback、执行计数 execution count）。

:::

## 代码解释器拦截器

把 OpenAI 的 `code_interpreter` 工具路由到你自己的沙箱，而不是 OpenAI 的容器。`/v1/responses` 和 `/v1/chat/completions` 两条路径都支持，客户端请求保持标准 OpenAI 形态。在对话补全路径上，原生的 `{"type": "code_interpreter"}` 工具会被改写成一个 `litellm_code_execution` 函数工具，LiteLLM 在你的沙箱里运行生成的代码，把结果作为 `role: tool` 消息追加进对话，再继续循环，直到模型给出最终答案。

### SDK

注册沙箱工具，把拦截器安装为回调，然后带着原样的 `code_interpreter` 工具调用 `litellm.aresponses`（或 `litellm.acompletion`）。

<Tabs>
<TabItem value="responses" label="Responses API">

```python showLineNumbers title="sandbox_interceptor.py"
import os, litellm
from litellm.sandbox.sandbox_tools import register_sandbox_tools
from litellm.integrations.code_interpreter_interception.handler import (
    CodeInterpreterInterceptionLogger,
)

os.environ["E2B_API_KEY"] = "e2b_..."
os.environ["OPENAI_API_KEY"] = "sk-..."

register_sandbox_tools([
    {
        "sandbox_tool_name": "my-e2b",
        "litellm_params": {
            "sandbox_provider": "e2b",
            "api_key": "os.environ/E2B_API_KEY",
        },
    }
])

litellm.callbacks = [
    CodeInterpreterInterceptionLogger(
        sandbox_tool_name="my-e2b",
    )
]

response = await litellm.aresponses(
    model="openai/{{openai_large}}",
    tools=[{"type": "code_interpreter", "container": {"type": "auto"}}],
    input="Product of first 6 primes. Just the number.",
)
print(response.output_text)
```

</TabItem>
<TabItem value="chat" label="Chat Completions">

```python showLineNumbers title="sandbox_interceptor_chat.py"
import os, litellm
from litellm.sandbox.sandbox_tools import register_sandbox_tools
from litellm.integrations.code_interpreter_interception.handler import (
    CodeInterpreterInterceptionLogger,
)

os.environ["E2B_API_KEY"] = "e2b_..."
os.environ["OPENAI_API_KEY"] = "sk-..."

register_sandbox_tools([
    {
        "sandbox_tool_name": "my-e2b",
        "litellm_params": {
            "sandbox_provider": "e2b",
            "api_key": "os.environ/E2B_API_KEY",
        },
    }
])

litellm.callbacks = [
    CodeInterpreterInterceptionLogger(
        sandbox_tool_name="my-e2b",
    )
]

response = await litellm.acompletion(
    model="openai/{{openai_small}}",
    messages=[{"role": "user", "content": "Product of first 6 primes. Just the number."}],
    tools=[{"type": "code_interpreter", "container": {"type": "auto"}}],
    max_agentic_loops=4,
)
print(response.choices[0].message.content)
```

`max_agentic_loops` 限制 LiteLLM 在返回前最多执行多少轮沙箱往返；如果反复出现相同的工具调用指纹，循环也会提前短路。默认值偏保守，任务需要更深的链式执行时可以调大。

</TabItem>
</Tabs>

### 代理配置

#### 1. 设置密钥

```bash
export E2B_API_KEY="e2b_..."
export OPENAI_API_KEY="sk-..."
```

#### 2. 编写 `config.yaml`

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

sandbox_tools:
  - sandbox_tool_name: my-e2b
    litellm_params:
      sandbox_provider: e2b
      api_key: os.environ/E2B_API_KEY

litellm_settings:
  callbacks: ["code_interpreter_interception"]
  code_interpreter_interception_params:
    sandbox_tool_name: my-e2b
```

#### 3. 启动代理

```bash
litellm --config /path/to/config.yaml
```

#### 4. 调用代理

<Tabs>
<TabItem value="responses-curl" label="Responses (curl)">

```bash
curl -s "http://localhost:4000/v1/responses" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_large}}",
    "tools": [{"type": "code_interpreter", "container": {"type": "auto"}}],
    "input": "Product of first 6 primes. Just the number."
  }'
```

</TabItem>
<TabItem value="responses-openai" label="Responses (OpenAI SDK)">

```python
from openai import OpenAI

client = OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://localhost:4000/v1")

response = client.responses.create(
    model="{{openai_large}}",
    tools=[{"type": "code_interpreter", "container": {"type": "auto"}}],
    input="Product of first 6 primes. Just the number.",
)
print(response.output_text)
```

</TabItem>
<TabItem value="chat-curl" label="Chat Completions (curl)">

```bash
curl -s "http://localhost:4000/v1/chat/completions" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "Product of first 6 primes. Just the number."}
    ],
    "tools": [{"type": "code_interpreter", "container": {"type": "auto"}}]
  }'
```

</TabItem>
<TabItem value="chat-openai" label="Chat Completions (OpenAI SDK)">

```python
from openai import OpenAI

client = OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://localhost:4000/v1")

response = client.chat.completions.create(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Product of first 6 primes. Just the number."}],
    tools=[{"type": "code_interpreter", "container": {"type": "auto"}}],
)
print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

在 Responses 路径上，结果里会包含一个 `code_interpreter_call` 项，其 `cntr_*` 形式的 `container_id` 包着沙箱 id。在 Chat Completions 路径上，这次工具调用表现为一次 `litellm_code_execution` 函数调用（内含执行的代码），后跟一条携带 stdout 的 `role: tool` 消息；模型的最终答案出现在下一条 assistant 消息里。

要改用 OpenSandbox 而非 e2b，只需替换 `sandbox_tools` 条目：

```yaml
sandbox_tools:
  - sandbox_tool_name: my-opensandbox
    litellm_params:
      sandbox_provider: opensandbox
      api_base: os.environ/OPEN_SANDBOX_API_BASE
      api_key: os.environ/OPEN_SANDBOX_API_KEY
```

### 粘性会话

默认情况下，每个请求都会新建一个沙箱，并在这一轮 agentic 循环结束后销毁。传入 `metadata.session_id` 可以在连续请求间复用同一个沙箱，这样前一轮定义的变量、导入和文件到下一轮仍然可用。

<Tabs>
<TabItem value="sticky-curl" label="curl">

```bash
# First request: define x
curl -s "http://localhost:4000/v1/responses" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_large}}",
    "tools": [{"type": "code_interpreter", "container": {"type": "auto"}}],
    "input": "Set x = 42 and confirm.",
    "metadata": {"session_id": "chat-abc-123"}
  }'

# Second request: same session_id, x is still there
curl -s "http://localhost:4000/v1/responses" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_large}}",
    "tools": [{"type": "code_interpreter", "container": {"type": "auto"}}],
    "input": "Print x + 1.",
    "metadata": {"session_id": "chat-abc-123"}
  }'
```

</TabItem>
<TabItem value="sticky-openai" label="OpenAI SDK">

```python
from openai import OpenAI

client = OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://localhost:4000/v1")

client.responses.create(
    model="{{openai_large}}",
    tools=[{"type": "code_interpreter", "container": {"type": "auto"}}],
    input="Set x = 42 and confirm.",
    extra_body={"metadata": {"session_id": "chat-abc-123"}},
)

# Same session_id reuses the same e2b container, so x is still defined
followup = client.responses.create(
    model="{{openai_large}}",
    tools=[{"type": "code_interpreter", "container": {"type": "auto"}}],
    input="Print x + 1.",
    extra_body={"metadata": {"session_id": "chat-abc-123"}},
)
print(followup.output_text)
```

</TabItem>
</Tabs>

跨租户隔离的实现方式是：把客户端提供的 `session_id` 与代理生成的 `user_api_key_hash` 组合成缓存键（`{hash}:{session_id}`），因此两个 API 密钥即使发送相同的 `session_id` 也绝不会共享沙箱。每个 API 密钥最多同时持有 10 个会话级沙箱；一旦新会话超出上限，该密钥下最近最少使用的会话会被逐出，其沙箱随之删除。活跃会话不会在对话中途过期，因为 TTL 在每次访问时都会重置。不传 `session_id` 则保持原来按请求临时创建的行为。

### 补充说明

响应结构与 OpenAI 原生的 `code_interpreter_call` 一致。`stream: true` 可用。强制指定 `tool_choice: {"type":"code_interpreter"}` 时会自动改写。沙箱默认按请求临时创建，设置 `metadata.session_id` 后则变为粘性（见上文）；并发请求由服务端生成的缓存键相互隔离。从 `sandbox_tools` 中移除某个工具后，重新加载时会清除其凭据。v0 暂不支持文件上传和下载。

## 直接使用沙箱 SDK

如果想绕开模型、自己直接驱动沙箱，同一批提供商也以普通 Python 辅助函数的形式开放。

### 快速上手（临时沙箱）

最快捷的入口是 `acode_interpreter_tool`：它先创建沙箱、运行代码，再在 `finally` 块里删除沙箱，即使中途抛出异常也能完成清理。

```python showLineNumbers title="Ephemeral code execution"
import asyncio, os, litellm

os.environ["E2B_API_KEY"] = "e2b_..."

async def main():
    result = await litellm.acode_interpreter_tool(
        provider="e2b",
        code="print(sum(range(10)))",
    )
    print(result.stdout)   # '45\n'
    print(result.error)    # None

asyncio.run(main())
```

如果代码在沙箱内部抛出异常，错误会体现在 `result.error` 里，而不是作为 Python 异常抛出，因此沙箱级的 `ZeroDivisionError` 不会让调用方崩溃：

```python
result = await litellm.acode_interpreter_tool(provider="e2b", code="1/0")
result.error["name"]       # 'ZeroDivisionError'
result.error["value"]      # 'division by zero'
result.error["traceback"]  # full traceback string
```

### 底层生命周期

如果想在多次 `arun_code` 调用之间复用同一个沙箱，可以用 `acreate_sandbox`、`arun_code` 和 `adelete_sandbox` 自行管理生命周期。这些底层命名刻意限定在沙箱范围内，避免与现有的 OpenAI Containers API（`litellm.create_container`）冲突，后者与本功能无关，保持原样不动。

```python showLineNumbers title="Manual sandbox lifecycle"
import asyncio, os, litellm

os.environ["E2B_API_KEY"] = "e2b_..."

async def main():
    container = await litellm.acreate_sandbox(provider="e2b")
    try:
        first = await litellm.arun_code(
            provider="e2b", container=container, code="x = 6 * 7\nprint(x)",
        )
        print(first.stdout)   # '42\n'

        second = await litellm.arun_code(
            provider="e2b", container=container, code="print(x + 1)",
        )
        print(second.stdout)  # '43\n' (state persists inside the container)
    finally:
        await litellm.adelete_sandbox(provider="e2b", container=container)

asyncio.run(main())
```

`arun_code` 和 `adelete_sandbox` 既接受 `acreate_sandbox` 返回的 `ContainerHandle`，也接受裸的沙箱 id 字符串，因此可以把 id 持久化到进程之外，之后再接回原来的沙箱。

## 参数

### `acode_interpreter_tool`

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `provider` | string | Yes | 沙箱提供商标识。取值为 `"e2b"` 或 `"opensandbox"`。 |
| `code` | string | Yes | 直接传给沙箱执行的可执行字符串。 |
| `template` | string | No | 提供商模板 id。默认为 e2b 的 `code-interpreter-v1`。 |
| `timeout` | int | No | 沙箱存活时长（秒）。默认 300。 |
| `api_key` | string | No | 覆盖默认的环境变量取值。 |
| `api_base` | string | No | 覆盖提供商默认主机。可用它把自托管沙箱指向集群 URL。 |

### `acreate_sandbox`

参数与上文一致，只是去掉 `code`，另外多了 `allow_internet_access: bool = True`，用于有出网管控的后端。

### `arun_code` 和 `adelete_sandbox`

接受 `provider`、`container`（`ContainerHandle` 或沙箱 id 字符串）以及可选的 `api_key` / `api_base`。`arun_code` 还接受 `code`。

## 响应：`CodeExecutionResult`

返回值是一个轻量的 pydantic 模型，原样保留沙箱产生的所有内容。

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `stdout` | string | 捕获到的 stdout。没有输出时为空字符串。 |
| `stderr` | string | 捕获到的 stderr。 |
| `results` | list[dict] | 富输出，例如 base64 PNG 图表；原样透传。 |
| `error` | dict \| None | 沙箱内代码抛出异常时为 `{name, value, traceback}`，否则为 `None`。 |
| `execution_count` | int \| None | 本次运行对应的 Jupyter 式单元格计数。 |
| `object` | string | 固定为 `"code_execution"`。 |

## 提供商配置

### e2b

设置 `E2B_API_KEY`（或在每次调用时传入 `api_key=...`）。默认值：模板为 `code-interpreter-v1`，沙箱超时 300 秒，开启外网访问。覆盖 `template` 即可使用你发布过的任意 e2b 自定义模板。

```python
result = await litellm.acode_interpreter_tool(
    provider="e2b",
    code="...",
    template="my-org/custom-template",
    timeout=120,
)
```

底层实现直接调用 e2b 的 REST API：用 `POST api.e2b.app/sandboxes` 创建，向端口 49999 上的沙箱专属主机发送流式 NDJSON `POST` 来执行，再用 `DELETE api.e2b.app/sandboxes/{id}` 销毁。

### opensandbox

需要自托管代码执行时，可以使用 [OpenSandbox](https://github.com/opensandboxai/opensandbox)。设置 `OPEN_SANDBOX_API_BASE`（或在每次调用时传入 `api_base=...`）指向你的服务器；没有 localhost 回退。`OPEN_SANDBOX_API_KEY` 是可选的，本地无鉴权服务器留空即可。沙箱默认禁止出网；传入 `allow_internet_access=True` 或显式的 `network_policy` 即可放开。

```python
import os, litellm

os.environ["OPEN_SANDBOX_API_BASE"] = "http://127.0.0.1:8080/v1"
os.environ["OPEN_SANDBOX_API_KEY"] = ""  # optional for local no-auth servers

result = await litellm.acode_interpreter_tool(
    provider="opensandbox",
    code="print(sum(range(10)))",
)
print(result.stdout)  # '45\n'
```

该提供商直接驱动 OpenSandbox 的 REST 生命周期：用 `POST /v1/sandboxes` 创建，解析出沙箱专属的 execd 端点，把 `/code` SSE 流式读入 `CodeExecutionResult`，最后用 `DELETE /v1/sandboxes/{id}` 销毁。其余默认值（模板、entrypoint、语言、轮询间隔、execd 端口、默认网络策略、输出上限）以字面量形式写在 `litellm/constants.py` 里。
