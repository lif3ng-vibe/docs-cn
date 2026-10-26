import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GradientAI
https://digitalocean.com/products/gradientai


LiteLLM 原生支持 GradientAI 模型。
要使用 GradientAI 模型，请在 LiteLLM 请求中将其指定为 `gradient_ai/<model-name>`。


## API 密钥与端点

将 API 密钥（API key）设为环境变量。请求默认发往无服务器推理端点（serverless inference endpoint）`https://inference.do-ai.run/v1/chat/completions`，因此无需设置端点变量：

```python
import os
os.environ['GRADIENT_AI_API_KEY'] = "your-api-key"
```

如果要调用的是 GradientAI 智能体（agent），请将 `GRADIENT_AI_AGENT_ENDPOINT`（或传入 `api_base`）设为该智能体的基础 URL。LiteLLM 会在其后拼接 `/api/v1/chat/completions`，因此不要包含路径：

```python
os.environ['GRADIENT_AI_AGENT_ENDPOINT'] = "https://<agent-id>.agents.do-ai.run"  # optional, agents only
```

## 使用示例

```python
from litellm import completion
import os

os.environ['GRADIENT_AI_API_KEY'] = "your-api-key"
response = completion(
    model="gradient_ai/model-name",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ],
)
print(response.choices[0].message.content)
```

## 流式示例

```python
from litellm import completion
import os

os.environ['GRADIENT_AI_API_KEY'] = "your-api-key"
response = completion(
    model="gradient_ai/model-name",
    messages=[
        {"role": "user", "content": "Write a story about a robot learning to love"}
    ],
    stream=True,
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

## 支持的参数

| 参数                             | 类型         | 说明                                                               |
|----------------------------------|--------------|--------------------------------------------------------------------|
| `temperature`                    | float        | 控制随机性（0.0-2.0）                                              |
| `top_p`                          | float        | 核采样（nucleus sampling）参数（0.0-1.0）                          |
| `max_tokens`                     | int          | 可生成的最大 Token 数                                              |
| `max_completion_tokens`          | int          | max_tokens 的替代写法                                              |
| `stream`                         | bool         | 是否流式返回响应                                                   |
| `k`                              | int          | 从知识库返回的前若干条结果                                         |
| `retrieval_method`               | string       | 检索策略（rewrite/step_back/sub_queries/none）                     |
| `frequency_penalty`              | float        | 惩罚重复出现的 Token（-2.0 到 2.0）                                |
| `presence_penalty`               | float        | 根据 Token 是否出现进行惩罚（-2.0 到 2.0）                         |
| `stop`                           | string/list  | 触发停止生成的序列                                                 |
| `kb_filters`                     | List[Dict]   | 知识库检索的过滤条件                                               |
| `instruction_override`           | string       | 覆盖智能体的默认指令                                               |
| `include_retrieval_info`         | bool         | 在响应中包含文档检索元数据                                         |
| `include_guardrails_info`        | bool         | 在响应中包含防护栏（guardrails）触发元数据                         |
| `provide_citations`              | bool         | 在响应中包含引用来源                                               |

---

更多细节请参阅 [DigitalOcean GradientAI 文档](https://digitalocean.com/products/gradientai)。
