import Image from '@theme/IdealImage';

# Code Interpreter

使用 OpenAI 的 Code Interpreter 工具，在安全隔离的沙箱环境中执行 Python 代码。

| 特性 | 是否支持 |
|---------|-----------|
| LiteLLM Python SDK | ✅ |
| LiteLLM AI 网关 | ✅ |
| 支持的提供商 | `openai` |

:::tip[将 Code Interpreter 路由到你自己的沙箱]

LiteLLM 代理可以在 `/v1/responses` 上拦截 `code_interpreter` 请求，在已配置的沙箱（目前支持 e2b）中运行代码，替代 OpenAI 的容器，客户端请求无需任何改动。响应结构保持不变（`code_interpreter_call` 仍与 `message` 并列）。参见 [Code Interpreter 沙箱拦截](/docs/sandbox#代码解释器拦截器)。

:::

## LiteLLM AI 网关

### API（OpenAI SDK）

把 OpenAI SDK 指向你的 LiteLLM 网关：

```python showLineNumbers title="code_interpreter_gateway.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM API key
    base_url="http://localhost:4000"
)

response = client.responses.create(
    model="openai/{{openai_large}}",
    tools=[{"type": "code_interpreter"}],
    input="Calculate the first 20 fibonacci numbers and plot them"
)

print(response)
```

#### 流式输出

```python showLineNumbers title="code_interpreter_streaming.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

stream = client.responses.create(
    model="openai/{{openai_large}}",
    tools=[{"type": "code_interpreter"}],
    input="Generate sample sales data CSV and create a visualization",
    stream=True
)

for event in stream:
    print(event)
```

#### 获取生成的文件内容

```python showLineNumbers title="get_file_content_gateway.py"
from openai import OpenAI

client = OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

# 1. Run code interpreter
response = client.responses.create(
    model="openai/{{openai_large}}",
    tools=[{"type": "code_interpreter"}],
    input="Create a scatter plot and save as PNG"
)

# 2. Get container_id from response
container_id = response.output[0].container_id

# 3. List files
files = client.containers.files.list(container_id=container_id)

# 4. Download file content
for file in files.data:
    content = client.containers.files.content(
        container_id=container_id,
        file_id=file.id
    )
    
    with open(file.filename, "wb") as f:
        f.write(content.read())
    print(f"Downloaded: {file.filename}")
```

### AI 网关 UI

LiteLLM 管理界面（Admin UI）内置了 Code Interpreter 支持。

<Image img={require('../../img/code_interp.png')} />

**步骤：**

1. 在 LiteLLM UI 中进入 **Playground**
2. 选择一个 **OpenAI 模型**（如 `openai/{{openai_large}}`）
3. 在 **Endpoint Type** 下选择 `/v1/responses` 作为端点
4. 在左侧面板打开 **Code Interpreter** 开关
5. 发送一条需要执行代码或生成文件的提示词

界面上会显示：
- 已执行的 Python 代码（可折叠）
- 内联展示的生成图片
- 文件（CSV 等）的下载链接

## LiteLLM Python SDK

### 运行 Code Interpreter

```python showLineNumbers title="code_interpreter.py"
import litellm

response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Generate a bar chart of quarterly sales and save as PNG",
    tools=[{"type": "code_interpreter"}]
)

print(response)
```

### 获取生成的文件内容

Code Interpreter 运行结束后，按下面的方式取回生成的文件：

```python showLineNumbers title="get_file_content.py"
import litellm

# 1. Run code interpreter
response = litellm.responses(
    model="openai/{{openai_large}}",
    input="Create a pie chart of market share and save as PNG",
    tools=[{"type": "code_interpreter"}]
)

# 2. Extract container_id from response
container_id = response.output[0].container_id  # e.g. "cntr_abc123..."

# 3. List files in container
files = litellm.list_container_files(
    container_id=container_id,
    custom_llm_provider="openai"
)

# 4. Download each file
for file in files.data:
    content = litellm.containers.retrieve_container_file_content(
        container_id=container_id,
        file_id=file.id,
        custom_llm_provider="openai"
    )
    
    with open(file.filename, "wb") as f:
        f.write(content)
    print(f"Downloaded: {file.filename}")
```


## 相关资源

- [Containers API](/docs/containers) - 管理容器
- [Container Files API](/docs/container_files) - 管理容器内的文件
- [OpenAI Code Interpreter 文档](https://platform.openai.com/docs/guides/tools-code-interpreter) - OpenAI 官方文档
