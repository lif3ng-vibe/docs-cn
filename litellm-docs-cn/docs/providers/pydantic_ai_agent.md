import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Pydantic AI 智能体

通过 LiteLLM 的 A2A（Agent-to-Agent）网关调用 Pydantic AI 智能体。

| 属性 | 说明 |
|----------|---------|
| 描述 | Pydantic AI 智能体通过 `to_a2a()` 方法原生支持 A2A。对于本身不支持流式输出的智能体，LiteLLM 提供模拟流式（fake streaming）支持。 |
| LiteLLM 上的提供商路由 | A2A Gateway |
| 支持的端点 | `/v1/a2a/message/send` |
| 提供商文档 | [Pydantic AI 智能体 ↗](https://ai.pydantic.dev/agents/) |

## LiteLLM A2A 网关

所有 Pydantic AI 智能体都需要先用 `to_a2a()` 方法暴露为 A2A 智能体。智能体服务器运行起来后，就可以把它添加到 LiteLLM 网关。

### 1. 搭建 Pydantic AI 智能体服务器

LiteLLM 要求 Pydantic AI 智能体遵循 [A2A（Agent-to-Agent）协议](https://github.com/google/A2A)。Pydantic AI 通过 `to_a2a()` 方法原生支持 A2A，该方法会把你的智能体暴露为一个符合 A2A 规范的服务器。

#### 安装依赖

```bash
uv add pydantic-ai fasta2a uvicorn
```

#### 创建智能体

```python title="agent.py"
from pydantic_ai import Agent

agent = Agent('openai:gpt-4o-mini', instructions='Be helpful!')

@agent.tool_plain
def get_weather(city: str) -> str:
    """Get weather for a city."""
    return f"Weather in {city}: Sunny, 72°F"

@agent.tool_plain  
def calculator(expression: str) -> str:
    """Evaluate a math expression."""
    return str(eval(expression))

# Native A2A server - Pydantic AI handles it automatically
app = agent.to_a2a()
```

#### 运行服务器

```bash
uvicorn agent:app --host 0.0.0.0 --port 9999
```

服务器运行在 `http://localhost:9999`

### 2. 进入智能体页面

在侧边栏中点击 “Agents”，打开智能体管理页面，然后点击 “+ Add New Agent”。

### 3. 选择 Pydantic AI 智能体类型

点击 “A2A Standard” 查看可用的智能体类型，然后选择 “Pydantic AI”。

![选择 A2A Standard](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/1055acb1-064b-4465-8e6a-8278291bc661/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=395,147)

![选择 Pydantic AI](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/0998e38c-8534-40f1-931a-be96c2cae0ad/ascreenshot.jpeg?tl_px=0,52&br_px=2201,1283&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=421,277)

### 4. 配置智能体

填写以下字段：

- **Agent Name** - 智能体的唯一标识符（例如 `test-pydantic-agent`）
- **Agent URL** - Pydantic AI 智能体运行所在的 URL。这里填 `http://localhost:9999`，因为上一步的 Pydantic AI 智能体服务器就运行在这个地址上。

![输入 Agent Name](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/8cf3fbde-05f3-48d1-81b6-6f857bd6d360/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=443,225)

![配置 Agent Name](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/fb555808-4761-4c49-a415-200ac1bdb525/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1463&force_format=jpeg&q=100&width=1120.0)

![输入 Agent URL](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/303eae61-4352-4fb0-a537-806839c234ba/ascreenshot.jpeg?tl_px=0,212&br_px=2201,1443&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=456,277)

### 5. 创建智能体

点击 “Create Agent” 保存你的配置。

![创建智能体](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/914f3367-df7d-4244-bd4d-e99ce0a6193a/ascreenshot.jpeg?tl_px=416,438&br_px=2618,1669&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=690,277)

### 6. 在 Playground 中测试

在侧边栏进入 “Playground”，测试你的智能体。

![进入 Playground](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/c73c9f3b-22af-4105-aafa-2d34c4986ef3/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=44,97)

### 7. 选择 A2A 端点

点击端点下拉框并搜索 “a2a”，然后选择 `/v1/a2a/message/send`。

![点击端点下拉框](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/196d97ac-bcba-47f0-9880-97b80250e00c/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=261,230)

![搜索 A2A](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/26b68f21-29f9-4c4c-b8b5-d2e11cbfd14a/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1463&force_format=jpeg&q=100&width=1120.0)

![选择 A2A 端点](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/41576fb1-d385-4fb2-84e9-142dd7fe5181/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=307,270)

### 8. 选择智能体并发送消息

从下拉框中选中你的 Pydantic AI 智能体，发送一条测试消息。

![点击智能体下拉框](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/a96d7967-3d54-4cbf-bd3e-b38f1be9df76/ascreenshot.jpeg?tl_px=0,54&br_px=2201,1285&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=274,277)

![选择智能体](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/e05a5a6e-d044-4480-b94e-7c03cfb92ac5/ascreenshot.jpeg?tl_px=0,113&br_px=2201,1344&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=290,277)

![发送消息](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/29162702-968a-401a-aac1-c844bfc5f4a3/ascreenshot.jpeg?tl_px=91,653&br_px=2292,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,436)


## 延伸阅读

- [Pydantic AI 文档](https://ai.pydantic.dev/)
- [Pydantic AI 智能体](https://ai.pydantic.dev/agents/)
- [A2A 智能体网关](../a2a.md)
- [A2A 成本追踪](../a2a_cost_tracking.md)
