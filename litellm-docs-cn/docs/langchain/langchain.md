import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 在 Langchain 中使用 ChatLiteLLM()

## 前置条件
```shell
!uv add litellm langchain
```
## 快速上手

<Tabs>
<TabItem value="openai" label="OpenAI">

```python
import os
from langchain_community.chat_models import ChatLiteLLM
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

os.environ['OPENAI_API_KEY'] = ""
chat = ChatLiteLLM(model="{{openai_small}}")
messages = [
    HumanMessage(
        content="what model are you"
    )
]
chat.invoke(messages)
```

</TabItem>

<TabItem value="anthropic" label="Anthropic">

```python
import os
from langchain_community.chat_models import ChatLiteLLM
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

os.environ['ANTHROPIC_API_KEY'] = ""
chat = ChatLiteLLM(model="{{anthropic}}", temperature=0.3)
messages = [
    HumanMessage(
        content="what model are you"
    )
]
chat.invoke(messages)
```

</TabItem>

<TabItem value="replicate" label="Replicate">

```python
import os
from langchain_community.chat_models import ChatLiteLLM
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

os.environ['REPLICATE_API_TOKEN'] = ""
chat = ChatLiteLLM(model="replicate/llama-2-70b-chat:2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1")
messages = [
    HumanMessage(
        content="what model are you?"
    )
]
chat.invoke(messages)
```

</TabItem>

<TabItem value="cohere" label="Cohere">

```python
import os
from langchain_community.chat_models import ChatLiteLLM
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

os.environ['COHERE_API_KEY'] = ""
chat = ChatLiteLLM(model="command-nightly")
messages = [
    HumanMessage(
        content="what model are you?"
    )
]
chat.invoke(messages)
```

</TabItem>
</Tabs>

## 在 Langchain ChatLiteLLM 中使用 MLflow

MLflow 为 ChatLiteLLM 提供开源的可观测性（observability）方案。

要启用该集成，只需在代码中先调用 `mlflow.litellm.autolog()`，无需其他任何设置。

```python
import mlflow

mlflow.litellm.autolog()
```

启用自动追踪（tracing）后，你就可以调用 `ChatLiteLLM`，并在 MLflow 中查看记录到的追踪记录。

```python
import os
from langchain.chat_models import ChatLiteLLM

os.environ['OPENAI_API_KEY']="sk-..."

chat = ChatLiteLLM(model="{{openai_small}}")
chat.invoke("Hi!")
```

## 在 Langchain ChatLiteLLM 中使用 Lunary
```python
import os
from langchain.chat_models import ChatLiteLLM
from langchain.schema import HumanMessage
import litellm

os.environ["LUNARY_PUBLIC_KEY"] = "" # from https://app.lunary.ai/settings
os.environ['OPENAI_API_KEY']="sk-..."

litellm.success_callback = ["lunary"] 
litellm.failure_callback = ["lunary"] 

chat = ChatLiteLLM(
  model="{{openai_large}}"
)
messages = [
    HumanMessage(
        content="what model are you"
    )
]
chat(messages)
```

更多细节请见[这里](../observability/lunary_integration.md)。

## LangChain ChatLiteLLM 与 Langfuse
如何将 Langfuse 与 ChatLiteLLM 集成，更多细节请参见[这一节](/docs/observability/langfuse_integration#use-langchain-chatlitellm--langfuse)。

## 在 LangChain 和 LiteLLM 中使用标签

标签是 LiteLLM 的一项强大功能，可用于对 LLM 请求进行分类、过滤和追踪。将 LangChain 与 LiteLLM 搭配使用时，可以在元数据（metadata）中通过 `extra_body` 参数传入标签。

### 标签基础用法

<Tabs>
<TabItem value="openai" label="OpenAI">

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

os.environ['OPENAI_API_KEY'] = "sk-your-key-here"

chat = ChatOpenAI(
    model="{{openai_large}}",
    temperature=0.7,
    extra_body={
        "metadata": {
            "tags": ["production", "customer-support", "high-priority"]
        }
    }
)

messages = [
    SystemMessage(content="You are a helpful customer support assistant."),
    HumanMessage(content="How do I reset my password?")
]

response = chat.invoke(messages)
print(response)
```

</TabItem>

<TabItem value="anthropic" label="Anthropic">

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

os.environ['ANTHROPIC_API_KEY'] = "sk-ant-your-key-here"

chat = ChatOpenAI(
    model="{{anthropic}}",
    temperature=0.7,
    extra_body={
        "metadata": {
            "tags": ["research", "analysis", "claude-model"]
        }
    }
)

messages = [
    SystemMessage(content="You are a research analyst."),
    HumanMessage(content="Analyze this market trend...")
]

response = chat.invoke(messages)
print(response)
```

</TabItem>

<TabItem value="litellm-proxy" label="LiteLLM Proxy">

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# No API key needed when using proxy
chat = ChatOpenAI(
    openai_api_base="http://localhost:4000",  # Your proxy URL
    model="{{openai_large}}",
    temperature=0.7,
    extra_body={
        "metadata": {
            "tags": ["proxy", "team-alpha", "feature-flagged"],
            "generation_name": "customer-onboarding",
            "trace_user_id": "user-12345"
        }
    }
)

messages = [
    SystemMessage(content="You are an onboarding assistant."),
    HumanMessage(content="Welcome our new customer!")
]

response = chat.invoke(messages)
print(response)
```

</TabItem>
</Tabs>

### 高级标签模式

#### 基于上下文的动态标签

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

def create_chat_with_tags(user_type: str, feature: str):
    """Create a chat instance with dynamic tags based on context"""
    
    # Build tags dynamically
    tags = ["langchain-integration"]
    
    if user_type == "premium":
        tags.extend(["premium-user", "high-priority"])
    elif user_type == "enterprise":
        tags.extend(["enterprise", "custom-sla"])
    else:
        tags.append("standard-user")
    
    # Add feature-specific tags
    if feature == "code-review":
        tags.extend(["development", "code-analysis"])
    elif feature == "content-gen":
        tags.extend(["marketing", "content-creation"])
    
    return ChatOpenAI(
        openai_api_base="http://localhost:4000",
        model="{{openai_large}}",
        temperature=0.7,
        extra_body={
            "metadata": {
                "tags": tags,
                "user_type": user_type,
                "feature": feature,
                "trace_user_id": f"user-{user_type}-{feature}"
            }
        }
    )

# Usage examples
premium_chat = create_chat_with_tags("premium", "code-review")
enterprise_chat = create_chat_with_tags("enterprise", "content-gen")

messages = [HumanMessage(content="Help me with this task")]
response = premium_chat.invoke(messages)
```

#### 用于成本追踪与分析的标签

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# Tags for cost tracking
cost_tracking_chat = ChatOpenAI(
    openai_api_base="http://localhost:4000",
    model="{{openai_large}}",
    temperature=0.7,
    extra_body={
        "metadata": {
            "tags": [
                "cost-center-marketing",
                "budget-q4-2024",
                "project-launch-campaign",
                "high-cost-model"  # Flag for expensive models
            ],
            "department": "marketing",
            "project_id": "campaign-2024-q4",
            "cost_threshold": "high"
        }
    }
)

messages = [
    SystemMessage(content="You are a marketing copywriter."),
    HumanMessage(content="Create compelling ad copy for our new product launch.")
]

response = cost_tracking_chat.invoke(messages)
```

#### 用于 A/B 测试的标签

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import random

def create_ab_test_chat(test_variant: str = None):
    """Create chat instance for A/B testing with appropriate tags"""
    
    if test_variant is None:
        test_variant = random.choice(["variant-a", "variant-b"])
    
    return ChatOpenAI(
        openai_api_base="http://localhost:4000",
        model="{{openai_large}}",
        temperature=0.7 if test_variant == "variant-a" else 0.9,  # Different temp for variants
        extra_body={
            "metadata": {
                "tags": [
                    "ab-test-experiment-1",
                    f"variant-{test_variant}",
                    "temperature-test",
                    "user-experience"
                ],
                "experiment_id": "ab-test-001",
                "variant": test_variant,
                "test_group": "temperature-optimization"
            }
        }
    )

# Run A/B test
variant_a_chat = create_ab_test_chat("variant-a")
variant_b_chat = create_ab_test_chat("variant-b")

test_message = [HumanMessage(content="Explain quantum computing in simple terms")]

response_a = variant_a_chat.invoke(test_message)
response_b = variant_b_chat.invoke(test_message)
```

### 标签最佳实践

#### 1. **命名规范一致**
```python
# ✅ Good: Consistent, descriptive tags
tags = ["production", "api-v2", "customer-support", "urgent"]

# ❌ Avoid: Inconsistent or unclear tags
tags = ["prod", "v2", "support", "urgent123"]
```

#### 2. **层级式标签**
```python
# ✅ Good: Hierarchical structure
tags = ["env:production", "team:backend", "service:api", "priority:high"]

# This allows for easy filtering and grouping
```

#### 3. **附上上下文信息**
```python
extra_body={
    "metadata": {
        "tags": ["production", "user-onboarding"],
        "user_id": "user-12345",
        "session_id": "session-abc123",
        "feature_flag": "new-onboarding-flow",
        "environment": "production"
    }
}
```

#### 4. **标签分类**
建议将标签按类别组织：
- **环境**（Environment）：`production`、`staging`、`development`
- **团队/服务**：`backend`、`frontend`、`api`、`worker`
- **功能**：`authentication`、`payment`、`notification`
- **优先级**：`critical`、`high`、`medium`、`low`
- **用户类型**：`premium`、`enterprise`、`free`

### 在 LiteLLM Proxy 中使用标签

在 LiteLLM Proxy 中使用标签时，你可以：

1. **基于标签过滤请求**
2. **在花费报告中按标签追踪成本**
3. **基于标签应用路由规则**
4. **借助基于标签的分析监控用量**

#### 带标签的代理配置示例

标签路由按部署（deployment）逐个配置：在每个部署的 `litellm_params` 下添加 `tags`，并在 `router_settings` 中开启 `enable_tag_filtering`。此后，打上 `premium` 标签的 `chat` 请求只会路由到携带该标签的部署。默认标签与匹配模式详见[基于标签的路由](../proxy/tag_routing.md)。

```yaml
# config.yaml
model_list:
  - model_name: chat
    litellm_params:
      model: {{openai_large}}
      api_key: your-key
      tags: ["premium", "high-priority"]
  - model_name: chat
    litellm_params:
      model: {{openai_small}}
      api_key: your-key
      tags: ["standard"]

router_settings:
  enable_tag_filtering: true
```

### 监控与分析

标签能带来强大的分析能力：

```python
# Example: Get spend per tag
import requests

response = requests.get(
    "http://localhost:4000/spend/tags",
    headers={"Authorization": "Bearer sk-your-key"},
    params={
        "start_date": "2024-01-01",
        "end_date": "2024-12-31"
    }
)

spend_by_tags = response.json()
# [{"individual_request_tag": "premium", "log_count": 23, "total_spend": 0.0000882}, ...]
```

`/global/spend/report` 的 `group_by` 只接受 `team`、`customer` 和 `api_key` 这几个取值，因此按标签统计花费请使用 `/spend/tags`。

本文涵盖了在 LangChain 和 LiteLLM 中高效使用标签的关键模式，帮助你更好地组织、追踪并分析 LLM 请求。
