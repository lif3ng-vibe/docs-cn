# /invoke

通过 LiteLLM 代理调用 Bedrock 的 `/invoke` 端点。

| 功能 | 支持 |
|---------|-----------|
| 成本追踪 | ✅ |
| 日志 | ✅ |
| 流式 | ✅ 通过 `/invoke-with-response-stream` |
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

### 3. 调用 /invoke 端点

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/bedrock/model/my-bedrock-model/invoke' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "max_tokens": 100,
    "messages": [
        {
            "role": "user",
            "content": "Hello, how are you?"
        }
    ],
    "anthropic_version": "bedrock-2023-05-31"
}'
```

## 流式

如需流式响应，请使用 `/invoke-with-response-stream`：

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/bedrock/model/my-bedrock-model/invoke-with-response-stream' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "max_tokens": 100,
    "messages": [
        {
            "role": "user",
            "content": "Tell me a short story"
        }
    ],
    "anthropic_version": "bedrock-2023-05-31"
}'
```

## 负载均衡

为多个部署配置相同的 `model_name`，即可自动进行负载均衡：

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

代理会自动把请求分发到这两个区域。

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

response = bedrock_runtime.invoke_model(
    modelId='my-bedrock-model',  # Your model_name from config.yaml
    contentType='application/json',
    accept='application/json',
    body=json.dumps({
        "max_tokens": 100,
        "messages": [{"role": "user", "content": "Hello"}],
        "anthropic_version": "bedrock-2023-05-31"
    })
)

response_body = json.loads(response['body'].read())
print(response_body['content'][0]['text'])
```

## 更多信息

完整文档（包括防护栏（Guardrails）、知识库（Knowledge Bases）和 Agent）请参见：
- [Bedrock 透传完整文档](./pass_through/bedrock)
