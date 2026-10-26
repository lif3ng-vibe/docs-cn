import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 动态回调管理

<EnterpriseFeature />

LiteLLM 的动态回调管理（dynamic callback management）让各团队能够按请求粒度控制日志行为，无需改动中央基础设施。对于管理大规模服务体系、面临以下诉求的组织来说，这一点至关重要：

- **团队各自负责合规**：各服务可以自行妥善处理敏感数据，无需中央监督
- **责任去中心化**：各团队在使用共享基础设施的同时，自主掌控数据处理方式

在请求中附上 `x-litellm-disable-callbacks` 请求头即可禁用回调，让团队对自己数据的日志去向拥有细粒度的控制。

## 入门：查看与禁用回调

管理回调只需两步：

1. **先列出当前启用的回调**，看看哪些正在生效
2. **然后按需禁用特定回调**，只影响你发起的请求



## 1. 查看当前启用的回调

先查看代理上当前启用的全部回调，了解有哪些可以禁用。

#### 请求

```bash
curl -X 'GET' \
  'http://localhost:4000/callbacks/list' \
  -H 'accept: application/json' \
  -H 'x-litellm-api-key: sk-<your-litellm-api-key>'
```

#### 响应

```json
{
  "success": [
    "deployment_callback_on_success",
    "sync_deployment_callback_on_success"
  ],
  "failure": [
    "async_deployment_callback_on_failure",
    "deployment_callback_on_failure"
  ],
  "success_and_failure": [
    "langfuse",
    "datadog"
  ]
}
```

#### 响应字段

响应中包含三个数组，按类别归组当前启用的回调：
- **`success`**：仅在请求成功完成时执行的回调，接收来自成功 LLM 响应的数据。
- **`failure`**：仅在请求失败或出错时执行的回调，接收错误信息和失败请求的数据。
- **`success_and_failure`**：无论请求成功或失败都会执行的回调，通常是日志或可观测性（observability）工具，需要完整捕获所有请求数据。

---

## 2. 禁用回调

知道哪些回调处于启用状态后，就可以用 `x-litellm-disable-callbacks` 请求头选择性地禁用它们。回调名称可以引用上方列表响应中返回的任意名字。

### 禁用单个回调

通过 `x-litellm-disable-callbacks` 请求头，针对单个请求禁用特定回调。

<Tabs>
<TabItem value="Curl" label="Curl 请求">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'x-litellm-disable-callbacks: langfuse' \
    --data '{
    "model": "{{anthropic}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```

</TabItem>
<TabItem value="OpenAI" label="OpenAI Python SDK">

```python
import openai

client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": "what llm are you"
        }
    ],
    extra_headers={
        "x-litellm-disable-callbacks": "langfuse"
    }
)

print(response)
```

</TabItem>
</Tabs>

### 禁用多个回调

在请求头中传入逗号分隔的列表，即可一次禁用多个回调。名称可以从 `/callbacks/list` 的响应中任意组合。

<Tabs>
<TabItem value="Curl" label="Curl 请求">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'x-litellm-disable-callbacks: langfuse,datadog,prometheus' \
    --data '{
    "model": "{{anthropic}}",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```

</TabItem>
<TabItem value="OpenAI" label="OpenAI Python SDK">

```python
import openai

client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="{{anthropic}}",
    messages=[
        {
            "role": "user",
            "content": "what llm are you"
        }
    ],
    extra_headers={
        "x-litellm-disable-callbacks": "langfuse,datadog,prometheus"
    }
)

print(response)
```

</TabItem>
</Tabs>

## 请求头格式与大小写敏感性

### 请求头的预期格式

`x-litellm-disable-callbacks` 请求头支持以下两种写法（请使用 `/callbacks/list` 返回的准确名称）：

- **单个回调**：`x-litellm-disable-callbacks: langfuse`
- **多个回调**：`x-litellm-disable-callbacks: langfuse,datadog,prometheus`

指定多个回调时，用逗号分隔取值，逗号前后不要留空格。

### 大小写敏感性

**回调名称的匹配不区分大小写**。也就是说，以下几种写法完全等价：

```bash
# 以下写法完全等价
x-litellm-disable-callbacks: langfuse
x-litellm-disable-callbacks: LANGFUSE  
x-litellm-disable-callbacks: LangFuse
x-litellm-disable-callbacks: langFUSE
```

单个和多个回调的写法都遵循这一规则：

```bash
# 多个回调同样不区分大小写
x-litellm-disable-callbacks: LANGFUSE,datadog,PROMETHEUS
x-litellm-disable-callbacks: langfuse,DATADOG,prometheus
```

---

## 关闭动态回调管理（企业版）

有些组织的合规要求规定，**任何情况下所有请求都必须记录日志**。针对这类场景，你可以完全关闭动态回调管理，确保用户无法禁用任何日志回调。

### 适用场景

该功能面向以下企业场景：
- **合规要求**规定所有 API 请求都必须记录日志
- **审计轨迹**必须完整、不留缺口
- **安全策略**要求监控所有流量
- **不允许任何例外**，一律不得禁用回调

### 禁用方法

在 config.yaml 中将 `allow_dynamic_callback_disabling` 设为 `false`：

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  allow_dynamic_callback_disabling: false
```

### 生效后的行为

关闭该功能后：
- `x-litellm-disable-callbacks` 请求头会被**忽略**
- 所有已配置的回调对每个请求都**必定执行**
- 用户无法通过请求头或请求元数据绕过日志记录
- 所有请求都保证按代理配置记录日志

### 示例：合规日志配置

下面是一个完整示例，面向要求保证日志记录的组织：

```yaml showLineNumbers title="config.yaml"
# config.yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["langfuse", "datadog", "s3"]
  # Disable dynamic callback disabling for compliance
  allow_dynamic_callback_disabling: false
```

采用这套配置后：
- 所有请求都会记录到 Langfuse、Datadog 和 S3
- 用户无法通过请求头禁用其中任何回调
- 为合规要求提供完整的审计轨迹保证

:::info

**默认行为**：动态回调禁用功能**默认处于启用状态**（`allow_dynamic_callback_disabling: true`）。必须显式将其设为 `false`，才能强制保证日志记录。

:::
