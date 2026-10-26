import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 结构化输出 /v1/messages

通过 `/v1/messages` 端点，可以使用 LiteLLM 调用 Anthropic 的结构化输出（structured output）功能。

## 支持的提供商

| 提供商 | 是否支持 | 说明 |
|--------|----------|------|
| Anthropic | ✅ | 原生支持 |
| Azure AI（Anthropic 模型） | ✅ | Azure AI 上的 Claude 模型 |
| Bedrock（Converse 方式的 Anthropic 模型） | ✅ | 通过 Bedrock Converse API 调用的 Claude 模型 |
| Bedrock（Invoke 方式的 Anthropic 模型） | ✅ | 通过 Bedrock Invoke API 调用的 Claude 模型 |

## 用法

### LiteLLM 代理服务器

<Tabs>
<TabItem value="anthropic" label="Anthropic">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下

```bash
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Extract the key information from this email: John Smith (john@example.com) is interested in our Enterprise plan and wants to schedule a demo for next Tuesday at 2pm."
      }
    ],
    "output_format": {
      "type": "json_schema",
      "schema": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string"},
          "plan_interest": {"type": "string"},
          "demo_requested": {"type": "boolean"}
        },
        "required": ["name", "email", "plan_interest", "demo_requested"],
        "additionalProperties": false
      }
    }
  }'
```

</TabItem>

<TabItem value="azure_ai" label="Azure AI（Anthropic）">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: azure-claude-sonnet
    litellm_params:
      model: azure_ai/{{anthropic}}
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: https://your-endpoint.inference.ai.azure.com
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下

```bash
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "azure-claude-sonnet",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Extract the key information from this email: John Smith (john@example.com) is interested in our Enterprise plan and wants to schedule a demo for next Tuesday at 2pm."
      }
    ],
    "output_format": {
      "type": "json_schema",
      "schema": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string"},
          "plan_interest": {"type": "string"},
          "demo_requested": {"type": "boolean"}
        },
        "required": ["name", "email", "plan_interest", "demo_requested"],
        "additionalProperties": false
      }
    }
  }'
```

</TabItem>

<TabItem value="bedrock" label="Bedrock（Converse）">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: bedrock-claude-sonnet
    litellm_params:
      model: bedrock/global.anthropic.{{anthropic}}
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下

```bash
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "bedrock-claude-sonnet",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Extract the key information from this email: John Smith (john@example.com) is interested in our Enterprise plan and wants to schedule a demo for next Tuesday at 2pm."
      }
    ],
    "output_format": {
      "type": "json_schema",
      "schema": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string"},
          "plan_interest": {"type": "string"},
          "demo_requested": {"type": "boolean"}
        },
        "required": ["name", "email", "plan_interest", "demo_requested"],
        "additionalProperties": false
      }
    }
  }'
```

</TabItem>

<TabItem value="bedrock_invoke" label="Bedrock（Invoke）">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: bedrock-claude-invoke
    litellm_params:
      model: bedrock/invoke/global.anthropic.{{anthropic}}
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下

```bash
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "bedrock-claude-invoke",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Extract the key information from this email: John Smith (john@example.com) is interested in our Enterprise plan and wants to schedule a demo for next Tuesday at 2pm."
      }
    ],
    "output_format": {
      "type": "json_schema",
      "schema": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "email": {"type": "string"},
          "plan_interest": {"type": "string"},
          "demo_requested": {"type": "boolean"}
        },
        "required": ["name", "email", "plan_interest", "demo_requested"],
        "additionalProperties": false
      }
    }
  }'
```


</TabItem>
</Tabs>

## 响应示例

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "{\"name\":\"John Smith\",\"email\":\"john@example.com\",\"plan_interest\":\"Enterprise\",\"demo_requested\":true}"
    }
  ],
  "model": "{{anthropic}}",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 75,
    "output_tokens": 28
  }
}
```

## 请求格式

### output_format

`output_format` 参数用于指定结构化输出的格式。

```json
{
  "output_format": {
    "type": "json_schema",
    "schema": {
      "type": "object",
      "properties": {
        "field_name": {"type": "string"},
        "another_field": {"type": "integer"}
      },
      "required": ["field_name", "another_field"],
      "additionalProperties": false
    }
  }
}
```

#### 字段

- **type**（string）：必须为 `"json_schema"`
- **schema**（object）：一个 JSON Schema 对象，定义期望的输出结构
  - **type**（string）：根类型，通常为 `"object"`
  - **properties**（object）：定义各个字段及其类型
  - **required**（array）：必填字段名的列表
  - **additionalProperties**（boolean）：设为 `false` 即强制严格遵循 schema
