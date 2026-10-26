import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bedrock Agents

以 OpenAI 请求/响应格式调用 Bedrock Agents。


| 属性 | 说明 |
|----------|---------|
| 描述 | Amazon Bedrock Agents 借助基础模型（FM）的推理能力、API 和数据，拆解用户请求、收集相关信息，高效完成任务。 |
| LiteLLM 中的提供商路由 | `bedrock/agent/{AGENT_ID}/{ALIAS_ID}` |
| 提供商文档 | [AWS Bedrock Agents ↗](https://aws.amazon.com/bedrock/agents/) |

## 快速上手

### 传给 LiteLLM 的模型格式

要通过 LiteLLM 调用 Bedrock Agent，需要使用以下模型格式。

其中 `model=bedrock/agent/` 会让 LiteLLM 调用 Bedrock 的 `InvokeAgent` API。

```shell showLineNumbers title="传给 LiteLLM 的模型格式"
bedrock/agent/{AGENT_ID}/{ALIAS_ID}
```

**示例**：
- `bedrock/agent/L1RT58GYRW/MFPSBCXYTW`
- `bedrock/agent/ABCD1234/LIVE`

这些 ID 可以在 AWS Bedrock 控制台的 Agents 部分找到。


### LiteLLM Python SDK

```python showLineNumbers title="基础 Agent 补全"
import litellm

# Make a completion request to your Bedrock Agent
response = litellm.completion(
    model="bedrock/agent/L1RT58GYRW/MFPSBCXYTW",  # agent/{AGENT_ID}/{ALIAS_ID}
    messages=[
        {
            "role": "user", 
            "content": "Hi, I need help with analyzing our Q3 sales data and generating a summary report"
        }
    ],
)

print(response.choices[0].message.content)
print(f"Response cost: ${response._hidden_params['response_cost']}")
```

```python showLineNumbers title="流式接收 Agent 响应"
import litellm

# Stream responses from your Bedrock Agent
response = litellm.completion(
    model="bedrock/agent/L1RT58GYRW/MFPSBCXYTW",
    messages=[
        {
            "role": "user",
            "content": "Can you help me plan a marketing campaign and provide step-by-step execution details?"
        }
    ],
    stream=True,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```


### LiteLLM 代理

#### 1. 在 config.yaml 中配置模型

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml showLineNumbers title="LiteLLM 代理配置"
model_list:
  - model_name: bedrock-agent-1
    litellm_params:
      model: bedrock/agent/L1RT58GYRW/MFPSBCXYTW
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2

  - model_name: bedrock-agent-2  
    litellm_params:
      model: bedrock/agent/AGENT456/ALIAS789
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1
```

</TabItem>
</Tabs>

#### 2. 启动 LiteLLM 代理

```bash showLineNumbers title="启动 LiteLLM 代理"
litellm --config config.yaml
```

#### 3. 向 Bedrock Agents 发起请求

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="基础 Agent 请求"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "bedrock-agent-1",
    "messages": [
      {
        "role": "user", 
        "content": "Analyze our customer data and suggest retention strategies"
      }
    ]
  }'
```

```bash showLineNumbers title="流式 Agent 请求"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "bedrock-agent-2",
    "messages": [
      {
        "role": "user",
        "content": "Create a comprehensive social media strategy for our new product"
      }
    ],
    "stream": true
  }'
```

</TabItem>

<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="通过 OpenAI SDK 调用 LiteLLM 代理"
from openai import OpenAI

# Initialize client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

# Make a completion request to your agent
response = client.chat.completions.create(
    model="bedrock-agent-1",
    messages=[
      {
        "role": "user",
        "content": "Help me prepare for the quarterly business review meeting"
      }
    ]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="用 OpenAI SDK 进行流式调用"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000", 
    api_key="your-litellm-api-key"
)

# Stream agent responses
stream = client.chat.completions.create(
    model="bedrock-agent-2",
    messages=[
      {
        "role": "user",
        "content": "Walk me through launching a new feature beta program"
      }
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>
</Tabs>

## 提供商特有参数

所有非 OpenAI 参数都会作为自定义参数传给 Agent。

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers title="使用自定义参数"
from litellm import completion

response = litellm.completion(
    model="bedrock/agent/L1RT58GYRW/MFPSBCXYTW",
    messages=[
        {
            "role": "user",
            "content": "Hi who is ishaan cto of litellm, tell me 10 things about him",
        }
    ],
    invocationId="my-test-invocation-id", # PROVIDER-SPECIFIC VALUE
)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

```yaml showLineNumbers title="LiteLLM 代理配置"
model_list:
  - model_name: bedrock-agent-1
    litellm_params:
      model: bedrock/agent/L1RT58GYRW/MFPSBCXYTW
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
      invocationId: my-test-invocation-id
```

</TabItem>
</Tabs>





## 延伸阅读

- [AWS Bedrock Agents 文档](https://aws.amazon.com/bedrock/agents/)
- [LiteLLM 对 Bedrock 的身份验证](https://docs.litellm.ai/docs/providers/bedrock#boto3---authentication)
