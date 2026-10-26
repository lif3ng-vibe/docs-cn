# /converse

通过 LiteLLM 代理（Proxy）调用 Bedrock 的 `/converse` 端点。

| 功能 | 是否支持 |
|---------|-----------|
| 成本追踪 | ✅ |
| 日志 | ✅ |
| 流式 | ✅（通过 `/converse-stream`） |
| 负载均衡 | ✅ |

## 快速上手

### 1. 配置 config.yaml

```yaml showLineNumbers
model_list:
  - model_name: my-bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_region_name: us-west-2
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID  # reads from environment
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      custom_llm_provider: bedrock
```

在你的环境中设置 AWS 凭证：

```bash showLineNumbers
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
```

### 2. 启动代理

```bash showLineNumbers
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. 调用 /converse 端点

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/bedrock/model/my-bedrock-model/converse' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "messages": [
        {
            "role": "user",
            "content": [{"text": "Hello, how are you?"}]
        }
    ],
    "inferenceConfig": {
        "temperature": 0.5,
        "maxTokens": 100
    }
}'
```

## 流式

如需流式响应，请使用 `/converse-stream`：

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/bedrock/model/my-bedrock-model/converse-stream' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "messages": [
        {
            "role": "user",
            "content": [{"text": "Tell me a short story"}]
        }
    ],
    "inferenceConfig": {
        "temperature": 0.7,
        "maxTokens": 200
    }
}'
```

## 负载均衡

将多个部署（deployment）配置为相同的 `model_name`，即可自动实现负载均衡：

```yaml showLineNumbers
model_list:
  # Deployment 1 - us-west-2
  - model_name: my-bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_region_name: us-west-2
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      custom_llm_provider: bedrock
  
  # Deployment 2 - us-east-1
  - model_name: my-bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_region_name: us-east-1
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      custom_llm_provider: bedrock
```

代理会自动将请求分发到这两个区域。

## 使用 boto3 SDK

```python showLineNumbers
import boto3
import json
import os

# Set dummy AWS credentials (required by boto3, but not used by LiteLLM proxy)
os.environ['AWS_ACCESS_KEY_ID'] = 'dummy'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'dummy'
os.environ['AWS_BEARER_TOKEN_BEDROCK'] = "sk-<your-litellm-api-key>"  # your litellm proxy api key

# Point boto3 to the LiteLLM proxy
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-west-2',
    endpoint_url='http://0.0.0.0:4000/bedrock'
)

response = bedrock_runtime.converse(
    modelId='my-bedrock-model',  # Your model_name from config.yaml
    messages=[
        {
            "role": "user",
            "content": [{"text": "Hello, how are you?"}]
        }
    ],
    inferenceConfig={
        "temperature": 0.5,
        "maxTokens": 100
    }
)

print(response['output']['message']['content'][0]['text'])
```

## 更多信息

有关防护栏（Guardrails）、Knowledge Bases（知识库）与 Agents 的完整文档，请参阅：
- [Bedrock 透传完整文档](./pass_through/bedrock)
