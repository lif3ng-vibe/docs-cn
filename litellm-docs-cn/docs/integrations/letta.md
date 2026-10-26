import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Letta 集成

[Letta](https://github.com/letta-ai/letta)（前身为 MemGPT）是一个用于构建具备持久记忆的有状态 LLM 智能体（agent）的框架。本指南介绍如何将 LiteLLM SDK 与 LiteLLM 代理同时接入 Letta，让你在构建具备记忆能力的智能体时自由选用多家 LLM 提供商。

## Letta 是什么？

Letta 让你能够构建具备以下能力的 LLM 智能体：
- 跨对话维持长期记忆
- 通过函数调用（function calling）与工具交互
- 高效处理大上下文窗口
- 持久化智能体状态与记忆

## 前提条件

```bash
uv add letta litellm
```

## 快速上手

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

### 1. 启动 LiteLLM 代理

首先，为你的 LiteLLM 代理创建一个配置文件：

```yaml
# config.yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: {{openai_small}}
    litellm_params:
      model: azure/{{openai_small}}
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
      api_version: "2023-07-01-preview"
```

启动代理：

```bash
litellm --config config.yaml --port 4000
```

### 2. 配置 Letta 使用 LiteLLM 代理

将 Letta 配置为使用你的 LiteLLM 代理端点：

```python
import letta
from letta import create_client

# Configure Letta to use LiteLLM proxy
client = create_client()

# Configure the LLM endpoint
client.set_default_llm_config(
    model="{{openai_large}}",  # This should match a model from your LiteLLM config
    model_endpoint_type="openai",
    model_endpoint="http://localhost:4000",  # Your LiteLLM proxy URL
    context_window=8192
)

# Configure embedding endpoint (optional)
client.set_default_embedding_config(
    embedding_endpoint_type="openai",
    embedding_endpoint="http://localhost:4000",
    embedding_model="text-embedding-ada-002"
)
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK">

### 1. 配置 LiteLLM SDK

设置好 API 密钥并配置 LiteLLM：

```python
import os
import litellm

# Set your API keys
os.environ["OPENAI_API_KEY"] = "your-openai-key"
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-key"

# Optional: Configure default settings
litellm.set_verbose = True  # For debugging
```

### 2. 为 Letta 创建自定义 LLM 包装器

创建一个基于 LiteLLM SDK 的自定义 LLM 包装器（wrapper）：

```python
import letta
from letta import create_client
from letta.llm_api.llm_api_base import LLMConfig
import litellm
from typing import List, Dict, Any

class LiteLLMWrapper:
    def __init__(self, model: str):
        self.model = model

    def chat_completions_create(self, messages: List[Dict], **kwargs):
        # Use LiteLLM SDK for completion
        response = litellm.completion(
            model=self.model,
            messages=messages,
            **kwargs
        )
        return response

# Configure Letta with custom LiteLLM wrapper
client = create_client()

# Set up LLM configuration using direct SDK integration
llm_config = LLMConfig(
    model="{{openai_large}}",  # or "{{anthropic}}", "azure/{{openai_small}}", etc.
    model_endpoint_type="openai",
    context_window=8192
)

client.set_default_llm_config(llm_config)
```

</TabItem>
</Tabs>

### 3. 创建并使用 Letta 智能体

<Tabs>
<TabItem value="proxy" label="使用 LiteLLM 代理">

```python
import letta
from letta import create_client

# Create Letta client
client = create_client()

# Create a new agent
agent_state = client.create_agent(
    name="my-assistant",
    system="You are a helpful assistant with persistent memory.",
    llm_config=client.get_default_llm_config(),
    embedding_config=client.get_default_embedding_config()
)

# Send a message to the agent
response = client.user_message(
    agent_id=agent_state.id,
    message="Hi! My name is Alice and I love reading science fiction books."
)

print(f"Agent response: {response.messages[-1].text}")

# Send another message - the agent will remember previous context
response = client.user_message(
    agent_id=agent_state.id,
    message="What did I tell you about my interests?"
)

print(f"Agent response: {response.messages[-1].text}")
```

</TabItem>
<TabItem value="sdk" label="使用 LiteLLM SDK">

```python
import letta
from letta import create_client
import litellm
import os

# Set up environment variables
os.environ["OPENAI_API_KEY"] = "your-openai-key"

# Create Letta client with LiteLLM integration
client = create_client()

# Create a new agent
agent_state = client.create_agent(
    name="my-assistant",
    system="You are a helpful assistant with persistent memory.",
    llm_config=client.get_default_llm_config(),
    embedding_config=client.get_default_embedding_config()
)

# Send a message to the agent
response = client.user_message(
    agent_id=agent_state.id,
    message="Hi! My name is Alice and I love reading science fiction books."
)

print(f"Agent response: {response.messages[-1].text}")

# Send another message - the agent will remember previous context
response = client.user_message(
    agent_id=agent_state.id,
    message="What did I tell you about my interests?"
)

print(f"Agent response: {response.messages[-1].text}")
```

</TabItem>
</Tabs>

## 高级配置

### 为不同智能体使用不同模型

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

```python
from letta import LLMConfig, EmbeddingConfig

# Create different LLM configurations pointing to your proxy
gpt_config = LLMConfig(
    model="{{openai_large}}",
    model_endpoint_type="openai",
    model_endpoint="http://localhost:4000",
    context_window=8192
)

claude_config = LLMConfig(
    model="{{anthropic}}",
    model_endpoint_type="openai",  # Using OpenAI-compatible endpoint
    model_endpoint="http://localhost:4000",
    context_window=200000
)

# Create agents with different configurations
research_agent = client.create_agent(
    name="research-agent",
    system="You are a research assistant specialized in analysis.",
    llm_config=claude_config  # Use Claude for research tasks
)

creative_agent = client.create_agent(
    name="creative-agent",
    system="You are a creative writing assistant.",
    llm_config=gpt_config  # Use {{openai_large}} for creative tasks
)
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK">

```python
import os
import litellm
from letta import LLMConfig, EmbeddingConfig

# Set up API keys for different providers
os.environ["OPENAI_API_KEY"] = "your-openai-key"
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-key"

# Create different LLM configurations for direct SDK usage
gpt_config = LLMConfig(
    model="openai/{{openai_large}}",  # Using LiteLLM model format
    model_endpoint_type="openai",
    context_window=8192
)

claude_config = LLMConfig(
    model="anthropic/{{anthropic}}",  # Using LiteLLM model format
    model_endpoint_type="openai",
    context_window=200000
)

# Create agents with different configurations
research_agent = client.create_agent(
    name="research-agent",
    system="You are a research assistant specialized in analysis.",
    llm_config=claude_config  # Use Claude for research tasks
)

creative_agent = client.create_agent(
    name="creative-agent",
    system="You are a creative writing assistant.",
    llm_config=gpt_config  # Use {{openai_large}} for creative tasks
)
```

</TabItem>
</Tabs>

### 通过工具进行函数调用

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

```python
# Define custom tools for your agent
def search_web(query: str) -> str:
    """Search the web for information"""
    # Your web search implementation
    return f"Search results for: {query}"

def save_note(content: str) -> str:
    """Save a note to persistent storage"""
    # Your note saving implementation
    return f"Note saved: {content}"

# Create agent with tools (using proxy endpoint)
agent_state = client.create_agent(
    name="research-assistant",
    system="You are a research assistant that can search the web and save notes.",
    llm_config=client.get_default_llm_config(),
    embedding_config=client.get_default_embedding_config(),
    tools=[search_web, save_note]
)

# The agent can now use these tools
response = client.user_message(
    agent_id=agent_state.id,
    message="Search for recent developments in AI and save important findings."
)
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK">

```python
import litellm
import os

# Set up API keys
os.environ["OPENAI_API_KEY"] = "your-openai-key"

# Define custom tools for your agent
def search_web(query: str) -> str:
    """Search the web for information"""
    # Your web search implementation
    return f"Search results for: {query}"

def save_note(content: str) -> str:
    """Save a note to persistent storage"""
    # Your note saving implementation
    return f"Note saved: {content}"

# Create agent with tools (using LiteLLM SDK directly)
agent_state = client.create_agent(
    name="research-assistant",
    system="You are a research assistant that can search the web and save notes.",
    llm_config=LLMConfig(
        model="openai/{{openai_large}}",  # Direct model specification
        model_endpoint_type="openai",
        context_window=8192
    ),
    embedding_config=client.get_default_embedding_config(),
    tools=[search_web, save_note]
)

# The agent can now use these tools
response = client.user_message(
    agent_id=agent_state.id,
    message="Search for recent developments in AI and save important findings."
)
```

</TabItem>
</Tabs>

## 身份验证

<Tabs>
<TabItem value="proxy" label="LiteLLM 代理身份验证">

如果你的 LiteLLM 代理要求身份验证：

```python
import os
from letta import LLMConfig

# Set up authenticated configuration
llm_config = LLMConfig(
    model="{{openai_large}}",
    model_endpoint_type="openai",
    model_endpoint="http://localhost:4000",
    model_wrapper="openai",
    context_window=8192
)

# If using API keys with your proxy
os.environ["OPENAI_API_KEY"] = "your-litellm-proxy-api-key"

client = create_client()
client.set_default_llm_config(llm_config)
```

代理启用身份验证时的配置：

```yaml
# config.yaml with auth
general_settings:
  master_key: "your-master-key"

model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

```python
# Configure Letta with authenticated proxy
llm_config = LLMConfig(
    model="{{openai_large}}",
    model_endpoint_type="openai",
    model_endpoint="http://localhost:4000",
    context_window=8192,
    api_key="your-master-key"  # Proxy master key
)
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK 身份验证">

使用 LiteLLM SDK 时，直接设置各提供商的 API 密钥即可：

```python
import os
import litellm

# Set up API keys for different providers
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-api-key"
os.environ["AZURE_API_KEY"] = "your-azure-api-key"
os.environ["AZURE_API_BASE"] = "https://your-resource.openai.azure.com"
os.environ["AZURE_API_VERSION"] = "2023-07-01-preview"

# Optional: Configure default settings
litellm.api_key = os.environ.get("OPENAI_API_KEY")  # Default key
litellm.set_verbose = True  # For debugging

# Use in Letta configuration
from letta import LLMConfig

llm_config = LLMConfig(
    model="openai/{{openai_large}}",  # Will use OPENAI_API_KEY automatically
    model_endpoint_type="openai",
    context_window=8192
)

# Or for Azure
azure_config = LLMConfig(
    model="azure/{{openai_small}}",
    model_endpoint_type="openai",
    context_window=4096
)
```

</TabItem>
</Tabs>

## 负载均衡与回退

<Tabs>
<TabItem value="proxy" label="LiteLLM 代理功能">

LiteLLM 代理的负载均衡与回退功能可以直接配合 Letta 使用：

```yaml
# config.yaml with fallbacks
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
    tpm: 40000
    rpm: 500

  - model_name: {{openai_large}}  # Same model name for fallback
    litellm_params:
      model: azure/{{openai_large}}
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
      api_version: "2023-07-01-preview"
    tpm: 80000
    rpm: 800

router_settings:
  routing_strategy: "usage-based-routing"
  fallbacks: [{"{{openai_large}}": ["azure/{{openai_large}}"]}]
```

路由、负载均衡与回退全部由代理透明地处理，Letta 无需感知。

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK 路由器">

使用 LiteLLM SDK 时，可以用编程方式设置路由与回退：

```python
import litellm
from litellm import Router

# Configure router with multiple models
router = Router(
    model_list=[
        {
            "model_name": "{{openai_large}}",
            "litellm_params": {
                "model": "openai/{{openai_large}}",
                "api_key": os.environ["OPENAI_API_KEY"]
            },
            "tpm": 40000,
            "rpm": 500
        },
        {
            "model_name": "{{openai_large}}",  # Same name for fallback
            "litellm_params": {
                "model": "azure/{{openai_large}}",
                "api_key": os.environ["AZURE_API_KEY"],
                "api_base": os.environ["AZURE_API_BASE"],
                "api_version": "2023-07-01-preview"
            },
            "tpm": 80000,
            "rpm": 800
        }
    ],
    fallbacks=[{"{{openai_large}}": ["azure/{{openai_large}}"]}],
    routing_strategy="usage-based-routing"
)

# Create custom completion function for Letta
def custom_completion(messages, model="{{openai_large}}", **kwargs):
    return router.completion(
        model=model,
        messages=messages,
        **kwargs
    )

# Use with Letta by monkey-patching or custom wrapper
litellm.completion = custom_completion
```

</TabItem>
</Tabs>

## 监控与可观测性

<Tabs>
<TabItem value="proxy" label="LiteLLM 代理监控">

启用日志记录，通过代理追踪 Letta 智能体的 LLM 用量：

```yaml
# config.yaml with logging
model_list:
  # ... your models

litellm_settings:
  success_callback: ["langfuse"]  # or other observability tools

environment_variables:
  LANGFUSE_PUBLIC_KEY: "your-key"
  LANGFUSE_SECRET_KEY: "your-secret"
```

在代理仪表板（dashboard）中查看各项指标：
```bash
# Start proxy with UI
litellm --config config.yaml --port 4000 --detailed_debug
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK 监控">

直接在你的 SDK 集成中配置可观测性（observability）：

```python
import litellm
import os

# Configure observability callbacks
os.environ["LANGFUSE_PUBLIC_KEY"] = "your-key"
os.environ["LANGFUSE_SECRET_KEY"] = "your-secret"

# Set global callbacks
litellm.success_callback = ["langfuse"]
litellm.failure_callback = ["langfuse"]

# Optional: Set up custom logging
litellm.set_verbose = True

# Create custom completion wrapper with logging
def logged_completion(messages, model="{{openai_large}}", **kwargs):
    try:
        response = litellm.completion(
            model=model,
            messages=messages,
            **kwargs
        )
        # Custom logging logic here if needed
        return response
    except Exception as e:
        # Custom error handling
        print(f"LLM call failed: {e}")
        raise

# Use in Letta configuration
litellm.completion = logged_completion
```

</TabItem>
</Tabs>

## 示例：多智能体系统

<Tabs>
<TabItem value="proxy" label="使用 LiteLLM 代理">

```python
import letta
from letta import create_client, LLMConfig

client = create_client()

# Create specialized agents using proxy endpoints
agents = {}

# Research agent using Claude for analysis
agents['researcher'] = client.create_agent(
    name="researcher",
    system="You are a research specialist. Analyze information thoroughly.",
    llm_config=LLMConfig(
        model="{{anthropic}}",
        model_endpoint="http://localhost:4000",
        model_endpoint_type="openai"
    )
)

# Writer agent using {{openai_large}} for content creation
agents['writer'] = client.create_agent(
    name="writer",
    system="You are a content writer. Create engaging, well-structured content.",
    llm_config=LLMConfig(
        model="{{openai_large}}",
        model_endpoint="http://localhost:4000",
        model_endpoint_type="openai"
    )
)

# Coordinator workflow
def research_and_write_workflow(topic: str):
    # Research phase
    research_response = client.user_message(
        agent_id=agents['researcher'].id,
        message=f"Research the topic: {topic}. Provide key insights and data."
    )

    research_results = research_response.messages[-1].text

    # Writing phase
    write_response = client.user_message(
        agent_id=agents['writer'].id,
        message=f"Based on this research: {research_results}\n\nWrite an article about {topic}."
    )

    return write_response.messages[-1].text

# Execute workflow
article = research_and_write_workflow("The future of AI in healthcare")
print(article)
```

</TabItem>
<TabItem value="sdk" label="使用 LiteLLM SDK">

```python
import letta
from letta import create_client, LLMConfig
import litellm
import os

# Set up environment
os.environ["OPENAI_API_KEY"] = "your-openai-key"
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-key"

client = create_client()

# Create specialized agents using direct SDK models
agents = {}

# Research agent using Claude for analysis
agents['researcher'] = client.create_agent(
    name="researcher",
    system="You are a research specialist. Analyze information thoroughly.",
    llm_config=LLMConfig(
        model="anthropic/{{anthropic}}",
        model_endpoint_type="openai"
    )
)

# Writer agent using {{openai_large}} for content creation
agents['writer'] = client.create_agent(
    name="writer",
    system="You are a content writer. Create engaging, well-structured content.",
    llm_config=LLMConfig(
        model="openai/{{openai_large}}",
        model_endpoint_type="openai"
    )
)

# Cost-conscious agent using {{openai_small}}
agents['reviewer'] = client.create_agent(
    name="reviewer",
    system="You are an editor. Review and improve content quality.",
    llm_config=LLMConfig(
        model="openai/{{openai_small}}",
        model_endpoint_type="openai"
    )
)

# Enhanced workflow with multiple agents
def enhanced_workflow(topic: str):
    # Research phase
    research_response = client.user_message(
        agent_id=agents['researcher'].id,
        message=f"Research the topic: {topic}. Provide key insights and data."
    )

    research_results = research_response.messages[-1].text

    # Writing phase
    write_response = client.user_message(
        agent_id=agents['writer'].id,
        message=f"Based on this research: {research_results}\n\nWrite an article about {topic}."
    )

    draft_article = write_response.messages[-1].text

    # Review phase
    review_response = client.user_message(
        agent_id=agents['reviewer'].id,
        message=f"Please review and improve this article:\n\n{draft_article}"
    )

    return review_response.messages[-1].text

# Execute enhanced workflow
article = enhanced_workflow("The future of AI in healthcare")
print(article)
```

</TabItem>
</Tabs>

## 最佳实践

<Tabs>
<TabItem value="proxy" label="LiteLLM 代理最佳实践">

1. **模型选择**：不同任务选用合适的模型：
   - 分析与推理用 Claude
   - 创意类任务用 gpt-5.6-terra
   - 简单交互用 gpt-5.6-luna

2. **代理配置**：
   - 设置合理的速率限制与超时
   - 用回退机制保障可靠性
   - 生产环境启用身份验证

3. **记忆管理**：Letta 会自动管理记忆，但使用大上下文时需留意用量

4. **成本优化**：
   - 借助代理的预算功能控制开销
   - 按用户/团队设置限流
   - 通过代理仪表板监控 Token 用量

5. **监控**：启用可观测性来追踪智能体的表现与 Token 用量

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK 最佳实践">

1. **模型选择**：按任务需求挑选模型：
   - 复杂推理用 `openai/{{openai_large}}`
   - 分析类任务用 `anthropic/{{anthropic}}`
   - 简单且高性价比的任务用 `openai/{{openai_small}}`

2. **错误处理**：通过重试实现健壮的错误处理：
   ```python
   import litellm
   from litellm import completion

   # Set up retry logic
   litellm.num_retries = 3
   litellm.request_timeout = 60

   # Custom error handling
   def safe_completion(**kwargs):
       try:
           return completion(**kwargs)
       except Exception as e:
           print(f"LLM call failed: {e}")
           # Implement fallback logic
           return completion(model="openai/{{openai_small}}", **kwargs)
   ```

3. **成本管理**：
   - 非关键任务改用更便宜的模型
   - 落实 Token 计数与预算
   - 在合适场景缓存响应

4. **性能**：
   - 并发请求使用异步操作
   - 实现连接池
   - 监控响应时长

5. **安全**：
   - 安全存放 API 密钥（使用环境变量）
   - 定期轮换密钥
   - 实施速率限制

</TabItem>
</Tabs>

## 故障排查

<Tabs>
<TabItem value="proxy" label="LiteLLM 代理问题">

### 连接问题
```bash
# Test your LiteLLM proxy
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 配置调试
```python
# Enable verbose logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Test Letta configuration
client = create_client()
print(client.get_default_llm_config())
```

### 常见代理问题
- **端口冲突**：确保 4000 端口未被占用
- **模型未找到**：核对模型名称是否与 config.yaml 一致
- **身份验证错误**：检查主密钥（master key）配置
- **速率限制**：留意代理日志中的限流命中情况

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK 问题">

### API 密钥问题
```python
import os
import litellm

# Check if API keys are set
print("OpenAI Key:", os.environ.get("OPENAI_API_KEY", "Not set"))
print("Anthropic Key:", os.environ.get("ANTHROPIC_API_KEY", "Not set"))

# Test direct LiteLLM call
try:
    response = litellm.completion(
        model="openai/{{openai_small}}",
        messages=[{"role": "user", "content": "Hello"}]
    )
    print("LiteLLM working:", response.choices[0].message.content)
except Exception as e:
    print("LiteLLM error:", e)
```

### 配置调试
```python
# Enable verbose logging
litellm.set_verbose = True

# Test model availability
models = ["openai/{{openai_large}}", "anthropic/{{anthropic}}"]
for model in models:
    try:
        response = litellm.completion(
            model=model,
            messages=[{"role": "user", "content": "Test"}],
            max_tokens=10
        )
        print(f"✓ {model} working")
    except Exception as e:
        print(f"✗ {model} failed: {e}")
```

### 常见 SDK 问题
- **导入错误**：确认已执行 `uv add litellm letta`
- **模型格式**：使用 `provider/model` 格式（如 `openai/{{openai_large}}`）
- **API 密钥格式**：不同提供商的密钥格式各不相同
- **速率限制**：重试时实现指数退避

</TabItem>
</Tabs>

## 参考资源

- [Letta 文档](https://docs.letta.com/)
- [LiteLLM 代理文档](/docs/simple_proxy)
- [LiteLLM SDK 文档](/docs/#litellm-python-sdk)
- [函数调用指南](/docs/completion/function_call)
- [可观测性配置](/docs/integrations/observability_integrations)
- [路由器配置](/docs/routing)
