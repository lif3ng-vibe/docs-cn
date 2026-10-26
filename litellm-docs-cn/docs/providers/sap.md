import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# SAP Generative AI Hub

LiteLLM 支持 SAP Generative AI Hub 的编排服务（Orchestration Service）。

| 属性 | 说明 |
|-------|------|
| 描述 | SAP Generative AI Hub 通过 AI Core 编排服务提供对 OpenAI、Anthropic、Gemini、Mistral、NVIDIA、Amazon 以及 SAP 各家 LLM 的访问。 |
| LiteLLM 中的提供商路由 | `sap/` |
| 支持的端点 | `/chat/completions`, `/embeddings` |
| API 参考 | [SAP AI Core 文档](https://help.sap.com/docs/sap-ai-core) |

## 前提条件

开始之前，请确保已具备以下条件：

1. **SAP BTP 账号**，且有权访问 SAP AI Core
2. 在子账号中已开通的 **AI Core 服务实例**
3. 为 AI Core 实例创建的**服务密钥**（service key，其中包含你的凭据）
4. 已部署 AI 模型的**资源组**（resource group，可向 SAP 管理员确认）

:::tip[凭据获取位置]
你的凭据来自在 SAP BTP Cockpit 中创建的**服务密钥**：

1. 进入你的**子账号**（Subaccount）→ **Instances and Subscriptions**（实例与订阅）
2. 找到你的 **AI Core** 实例并点击进入
3. 打开 **Service Keys**（服务密钥），新建一个（或使用现有密钥）
4. 这段 JSON 包含了下文所需的全部值

服务密钥 JSON 大致如下：

```json
{
  "clientid": "sb-abc123...",
  "clientsecret": "xyz789...",
  "url": "https://myinstance.authentication.eu10.hana.ondemand.com",
  "serviceurls": {
    "AI_API_URL": "https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com"
  }
}
```

:::info[资源组]
资源组通常在 AI Core 部署中单独配置，并不包含在服务密钥本身里。你可以通过 `AICORE_RESOURCE_GROUP` 环境变量来设置（默认值为 "default"）。
:::

## 快速上手

### 第 1 步：安装 LiteLLM

```bash
uv add litellm
```

### 第 2 步：设置凭据

从以下认证方式中**任选其一**：

> **破坏性变更**：凭据解析采用"首个来源优先"（first-source-wins）策略 
> 
> 凭据解析不再跨来源合并单个字段。
> 
> 解析顺序为：
`kwargs` → `service key` → `env (AICORE_*)` → `config` → `VCAP service`
>
> **重要行为**：一旦 LiteLLM 在某个来源中找到*任意*一个凭据值，就会**整套**采用该来源的全部凭据（`resource_group` 除外，它仍可单独解析）。

<Tabs>
<TabItem value="service-key" label="服务密钥 JSON（推荐）">

最简单的做法：把整份服务密钥作为一个环境变量粘贴进来。

> **注意**：服务密钥不再需要包裹在 "credentials" 键下。

```bash
export AICORE_SERVICE_KEY='{
    "clientid": "your-client-id",
    "clientsecret": "your-client-secret",
    "url": "https://<your-instance>.authentication.sap.hana.ondemand.com",
    "serviceurls": {
      "AI_API_URL": "https://api.ai.<your-region>.aws.ml.hana.ondemand.com"
    }
}'
export AICORE_RESOURCE_GROUP="default"
```

</TabItem>
<TabItem value="individual" label="独立变量">

如果不使用上面的服务密钥，也可以改为逐项单独设置各凭据：

```bash
export AICORE_AUTH_URL="https://<your-instance>.authentication.sap.hana.ondemand.com/oauth/token"
export AICORE_CLIENT_ID="your-client-id"
export AICORE_CLIENT_SECRET="your-client-secret"
export AICORE_RESOURCE_GROUP="default"
export AICORE_BASE_URL="https://api.ai.<your-region>.aws.ml.hana.ondemand.com/v2"
```

</TabItem>
</Tabs>

### 第 3 步：发起第一个请求

```python title="test_sap.py"
from litellm import completion

response = completion(
    model="sap/{{openai_large}}",
    messages=[{"role": "user", "content": "Hello from LiteLLM!"}]
)
print(response.choices[0].message.content)
```

运行：

```bash
python test_sap.py
```

**预期输出**：

```text
Hello! How can I assist you today?
```

### 第 4 步：验证配置（可选）

用下面这个诊断脚本检查一切是否正常：

```python title="verify_sap_setup.py"
import os
import litellm

# Enable debug logging to see what's happening
import os
os.environ["LITELLM_LOG"] = "DEBUG"

# Either use AICORE_SERVICE_KEY (contains all credentials including resourcegroup)
# OR use individual variables (all required together)
individual_vars = ["AICORE_AUTH_URL", "AICORE_CLIENT_ID", "AICORE_CLIENT_SECRET", "AICORE_BASE_URL", "AICORE_RESOURCE_GROUP"]

print("=== SAP Gen AI Hub Setup Verification ===\n")

# Check for service key method
if os.environ.get("AICORE_SERVICE_KEY"):
    print("✓ Using AICORE_SERVICE_KEY authentication (includes resource group)")
else:
    # Check individual variables
    missing = [v for v in individual_vars if not os.environ.get(v)]
    if missing:
        print(f"✗ Missing environment variables: {missing}")
    else:
        print("✓ Using individual variable authentication")
        print(f"✓ Resource group: {os.environ.get('AICORE_RESOURCE_GROUP')}")

# Test API connection
print("\n=== Testing API Connection ===\n")
try:
    response = litellm.completion(
        model="sap/{{openai_large}}",
        messages=[{"role": "user", "content": "Say 'Connection successful!' and nothing else."}],
        max_tokens=20
    )
    print(f"✓ API Response: {response.choices[0].message.content}")
    print("\n🎉 Setup complete! You're ready to use SAP Gen AI Hub with LiteLLM.")
except Exception as e:
    print(f"✗ API Error: {e}")
    print("\nTroubleshooting tips:")
    print("  1. Verify your service key credentials are correct")
    print("  2. Check that '{{openai_large}}' is deployed in your resource group")
    print("  3. Ensure your SAP AI Core instance is running")
```

运行验证脚本：

```bash
python verify_sap_setup.py
```

**成功时的预期输出**：

```text
=== SAP Gen AI Hub Setup Verification ===

✓ Using AICORE_SERVICE_KEY authentication
✓ Resource group: default

=== Testing API Connection ===

✓ API Response: Connection successful!

🎉 Setup complete! You're ready to use SAP Gen AI Hub with LiteLLM.
```

## 认证

SAP Generative AI Hub 使用 OAuth2 服务密钥进行认证。配置步骤参见[快速上手](#快速上手)。

### 环境变量参考

| 变量 | 是否必填 | 说明 |
|----------|----------|-------------|
| `AICORE_SERVICE_KEY` | 是* | 完整的服务密钥 JSON（推荐方式） |
| `AICORE_RESOURCE_GROUP` | 是 | 你的 AI Core 资源组名称 |
| `AICORE_AUTH_URL` | 是* | OAuth 令牌 URL（服务密钥的替代方案） |
| `AICORE_CLIENT_ID` | 是* | OAuth 客户端 ID（服务密钥的替代方案） |
| `AICORE_CLIENT_SECRET` | 是* | OAuth 客户端密钥（服务密钥的替代方案） |
| `AICORE_BASE_URL` | 是* | AI Core API 基础 URL（服务密钥的替代方案） |

*`AICORE_SERVICE_KEY` 与各独立变量（`AICORE_AUTH_URL`、`AICORE_CLIENT_ID`、`AICORE_CLIENT_SECRET`、`AICORE_BASE_URL`）二选一即可。

## 模型命名约定

用对模型命名是正确使用 SAP Gen AI Hub 的关键。直接使用 SDK 还是通过代理调用，命名模式并不相同。

### 直接使用 SDK

直接调用 LiteLLM 的 SDK 时，模型名**必须**带上 `sap/` 前缀：

```python
# Correct - includes sap/ prefix
model="sap/{{openai_large}}"
model="sap/anthropic--claude-4.5-sonnet"
model="sap/{{gemini_pro}}"

# Incorrect - missing prefix
model="{{openai_large}}"  # ❌ Won't work
```
3. **环境变量** - 在 .env 文件中设置以下凭据
<pre>
AICORE_AUTH_URL = "https://* * * .authentication.sap.hana.ondemand.com/oauth/token",
AICORE_CLIENT_ID  = " *** ",
AICORE_CLIENT_SECRET = " *** ",
AICORE_RESOURCE_GROUP = " *** ",
AICORE_BASE_URL = "https://api.ai.***.cfapps.sap.hana.ondemand.com/v2"
</pre>

还有其他凭据配置方式可选。更多信息参见 [SAP AI Core 文档](https://help.sap.com/doc/generative-ai-hub-sdk/CLOUD/en-US/_reference/README_sphynx.html#configuration)。

## 用法：LiteLLM Python SDK

### 通过代理使用

使用 LiteLLM 代理时，直接用配置里定义的**友好 `model_name`** 即可，`sap/` 前缀的路由由代理自动处理。

```yaml
# In config.yaml, define the mapping
model_list:
  - model_name: {{openai_large}}          # ← Use this name in client requests
    litellm_params:
      model: sap/{{openai_large}}         # ← Proxy handles the sap/ prefix
```

```python
# Client request - no sap/ prefix needed
client.chat.completions.create(
    model="{{openai_large}}",  # ✓ Correct for proxy usage
    messages=[...]
)
```

### Anthropic 模型的特殊语法

Anthropic 模型采用双连字符（`--`）前缀约定：

| 提供商 | 模型示例 | LiteLLM 格式 |
|----------|---------------|----------------|
| OpenAI | GPT-4o | `sap/gpt-4o` |
| Anthropic | Claude 4.5 Sonnet | `sap/anthropic--claude-4.5-sonnet` |
| Google | Gemini 2.5 Pro | `sap/gemini-2.5-pro` |
| Mistral | Mistral Large | `sap/mistral-large` |

### 速查表

| 使用方式 | 模型格式 | 示例 |
|------------|--------------|---------|
| 直接使用 SDK | `sap/<model-name>` | `sap/gpt-4o` |
| 直接使用 SDK（Anthropic） | `sap/anthropic--<model>` | `sap/anthropic--claude-4.5-sonnet` |
| 代理客户端 | `<friendly-name>` | `gpt-4o` 或 `claude-sonnet` |

## 使用 Python SDK

LiteLLM Python SDK 会自动识别你的认证方式，只需设好环境变量即可发起请求。

```python showLineNumbers title="基础补全"
from litellm import completion

# Assumes AICORE_AUTH_URL, AICORE_CLIENT_ID, etc. are set
response = completion(
    model="sap/anthropic--claude-4.5-sonnet",
    messages=[{"role": "user", "content": "Explain quantum computing"}]
)
print(response.choices[0].message.content)
```

两种认证方式（独立变量或服务密钥 JSON）都会自动生效，无需改动任何代码。

## 使用代理服务器

LiteLLM 代理为你的 SAP 模型提供统一的 OpenAI 兼容 API。

### 配置

在项目目录下创建一个 `config.yaml` 文件，写入模型映射和凭据：

```yaml showLineNumbers title="config.yaml"
model_list:
  # OpenAI models
  - model_name: {{openai_large}}
    litellm_params:
      model: sap/{{openai_large}}

  # Anthropic models (note the double-dash)
  - model_name: claude-sonnet
    litellm_params:
      model: sap/anthropic--claude-4.5-sonnet

  - model_name: claude-opus
    litellm_params:
      model: sap/anthropic--claude-4.5-opus

  # Embeddings
  - model_name: text-embedding-3-small
    litellm_params:
      model: sap/text-embedding-3-small

litellm_settings:
  drop_params: true
  set_verbose: false
  request_timeout: 600
  num_retries: 2
  forward_client_headers_to_llm_api: ["anthropic-version"]

general_settings:
  master_key: "sk-<your-litellm-master-key>" # Enter here your desired master key starting with 'sk-'.
  
  # UI Admin is not required but helpful including the management of keys for your team(s). If you are using a database, these parameters are required:
  database_url: "Enter you database URL."
  UI_USERNAME: "Your desired UI admin account name"
  UI_PASSWORD: "Your desired and strong pwd"

# Authentication
environment_variables:
  AICORE_SERVICE_KEY: '{"credentials": {"clientid": "...", "clientsecret": "...", "url": "...", "serviceurls": {"AI_API_URL": "..."}}}'
  AICORE_RESOURCE_GROUP: "default"
```

### 启动代理

```bash showLineNumbers title="启动代理"
litellm --config config.yaml
```

代理默认会启动在 `http://localhost:4000`。

### 发起请求

<Tabs>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="测试请求"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>"
)

response = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="LiteLLM SDK"
import os
import litellm

os.environ["LITELLM_PROXY_API_KEY"] = "sk-<your-litellm-api-key>"
litellm.use_litellm_proxy = True

response = litellm.completion(
    model="claude-sonnet",
    messages=[{"content": "Hello, how are you?", "role": "user"}],
    api_base="http://localhost:4000"
)

print(response)
```

</TabItem>
</Tabs>

## 功能特性

### 流式响应

流式实时返回响应，提升用户体验：

```python showLineNumbers title="流式对话补全"
from litellm import completion

response = completion(
    model="sap/{{openai_large}}",
    messages=[{"role": "user", "content": "Count from 1 to 10"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### 结构化输出

#### JSON Schema（推荐）

使用 JSON Schema 获得带严格校验的结构化输出：

```python showLineNumbers title="JSON Schema 响应"
from litellm import completion

response = completion(
    model="sap/{{openai_large}}",
    messages=[{
        "role": "user",
        "content": "Generate info about Tokyo"
    }],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "city_info",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "population": {"type": "number"},
                    "country": {"type": "string"}
                },
                "required": ["name", "population", "country"],
                "additionalProperties": False
            },
            "strict": True
        }
    }
)

print(response.choices[0].message.content)
# Output: {"name":"Tokyo","population":37000000,"country":"Japan"}
```

#### JSON 对象格式

要灵活输出 JSON、不需要 schema 校验时：

```python showLineNumbers title="JSON 对象响应"
from litellm import completion

response = completion(
    model="sap/{{openai_large}}",
    messages=[{
        "role": "user",
        "content": "Generate a person object in JSON format with name and age"
    }],
    response_format={"type": "json_object"}
)

print(response.choices[0].message.content)
```

:::note[SAP 平台要求]
使用 `json_object` 类型时，SAP 的编排服务要求提示词中出现 "json" 一词，以明确表达 JSON 格式化的意图。若想要带 schema 校验且无此要求的输出，建议改用 `json_schema`。
:::

### 多轮对话

跨多轮保持对话上下文：

```python showLineNumbers title="多轮对话"
from litellm import completion

response = completion(
    model="sap/{{openai_large}}",
    messages=[
        {"role": "user", "content": "My name is Alice"},
        {"role": "assistant", "content": "Hello Alice! Nice to meet you."},
        {"role": "user", "content": "What is my name?"}
    ]
)

print(response.choices[0].message.content)
# Output: Your name is Alice.
```

### 嵌入

生成向量嵌入，用于语义搜索与检索：

```python showLineNumbers title="创建嵌入"
from litellm import embedding

response = embedding(
    model="sap/text-embedding-3-small",
    input=["Hello world", "Machine learning is fascinating"]
)

print(response.data[0]["embedding"])  # Vector representation
```

### 附加模块
SAP Gen AI Hub 还包含面向进阶用例的附加模块：
- [Grounding](https://help.sap.com/docs/sap-ai-core/generative-ai/grounding-035c455a5a424697b60f4a24b6d791fe?locale=en-US)
- [翻译](https://help.sap.com/docs/sap-ai-core/generative-ai/translation?locale=en-US)
- [数据脱敏](https://help.sap.com/docs/sap-ai-core/generative-ai/data-masking-d9a54d9ca54b40beacbd24e1663ec3b4?locale=en-US)
- [内容过滤](https://help.sap.com/docs/sap-ai-core/generative-ai/content-filtering?locale=en-US)

#### Grounding
Grounding 是一项基于向量数据库、面向数据类任务（如接地与检索）的服务。它通过这些数据库提供专门的数据检索，用你自有的、与上下文相关的外部数据为检索过程提供接地支撑。对特定的 AI 驱动业务方案而言，Grounding 将生成式 AI 能力与实时、精确的数据相结合，改进决策与业务运营。
##### 前置要求
要在编排管道中使用 Grounding 模块，需要提前准备好知识库。

Generative AI Hub 为用户提供了多种数据提供方式（即准备知识库）：
- 方式一：将文档上传到受支持的数据仓库，然后运行数据管道将文档向量化。
- 方式二：直接通过 Vector API 提供文档分块。

要使用 grounding，请从以下方式中选择其一。

用法示例：
```python showLineNumbers title="Grounding 示例"
from litellm import completion

grounding_config = {
    'type': 'document_grounding_service',
    'config': {
        'filters': [
            {'id': 's3-docs',
             'data_repository_type': 'vector',
             'search_config': {'max_chunk_count': 2},
             'data_repositories': ['012345-6789-0123-4567-890123456789']
             }
        ],
        'placeholders': {'input': ['user_query'], 'output': 'grounding_response'},
        'metadata_params': ['source', 'webUrl', 'title', 'mimeType', 'fileSuffix']
    }
}

response = completion(model="sap/{{openai_large}}",
                      messages=[
                          {"content":"""Facility Solutions Company provides services to luxury residential complexes, 
                          apartments, individual homes, and commercial properties such as office buildings, retail 
                          spaces, industrial facilities, and educational institutions. Customers are encouraged to 
                          reach out with maintenance requests, service deficiencies, follow-ups, or any issues they 
                          need by email.""", "role": "system"},
                          {"content":"""You are a helpful assistant for any queries for answering questions. 
                          Answer the request by providing relevant answers that fit to the request.
                          Request: {{ ?user_query }}
                          Context:{{ ?grounding_response }}""", "role": "user"}
                      ],
                      placeholder_values={"user_query": "Is there a complaint?"},
                      grounding=grounding_config
                      )
print(response.choices[0].message.content)
```
有关全部可用的 grounding 配置，详见[文档](https://help.sap.com/docs/sap-ai-core/generative-ai/using-grounding-module-e1c4dd100dfb42ab890e1d95f3516187?locale=en-US)。

#### 翻译
翻译模块可以将 LLM 文本提示词翻译为指定的目标语言。

```python showLineNumbers title="翻译示例"
from litellm import completion

translation_config = {
    'input':
        {'type': 'sap_document_translation',
         'config':
             {'source_language': 'en-US',
              'target_language': 'de-DE'}
         },
    'output':
        {'type': 'sap_document_translation',
         'config':
             {'source_language': 'de-DE',
              'target_language': 'fr-FR'}
         }
}

response = completion(model="sap/{{openai_large}}",
                      messages=[{"role": "user", "content": "Hello world!"}],
                      translation=translation_config)

print(response.choices[0].message.content)
```
有关全部可用的翻译配置，详见[文档](https://help.sap.com/docs/sap-ai-core/generative-ai/translation?locale=en-US)。

#### 数据脱敏
数据脱敏模块用于对输入中的个人身份信息（PII）按选定实体类型进行匿名化或假名化。

```python showLineNumbers title="数据脱敏示例"
from litellm import completion, embedding
masking_config = {
            'providers':
                [
                    {
                        'type': 'sap_data_privacy_integration',
                        'method': 'anonymization',
                        'entities': [
                            {'type': 'profile-address'},
                            {'type': 'profile-email'},
                            {'type': 'profile-phone'},
                            {'type': 'profile-person'},
                            {'type': 'profile-location'}
                        ]
                    }
                ]
        }

mock_cv = "some text with personal information"

response = completion(model="sap/{{openai_large}}",
                      messages=[{"role": "user", "content": "Give a one sentence summary of the CV. CV: {{?cv}}?"}],
                      placeholder_values={"cv": mock_cv},
                      masking=masking_config)
print(response.choices[0].message.content)

# Data masking module also available for embedding 
response = embedding(model="sap/text-embedding-3-small",
                      input=mock_cv,
                      masking=masking_config)
print(response.data[0])
```
有关全部可用的数据脱敏配置，详见[文档](https://help.sap.com/docs/sap-ai-core/generative-ai/enhancing-model-consumption-with-data-masking-66ad6f469afc4c2cbaa91a27a33f7b21?locale=en-US)。





#### 内容过滤
内容过滤模块让你可以基于内容安全标准对输入和输出进行过滤。

该模块支持两种服务：
* Azure Content Safety
* Llama Guard 3

```python showLineNumbers title="内容过滤示例"
from litellm import completion

filtering_config_azure = {
    'input':
        {
            'filters':
                [
                    {'type': 'azure_content_safety',
                     'config':
                         {'hate': 0,
                          'sexual': 0,
                          'violence': 0,
                          'self_harm': 0
                          }
                     }
                ]
        },
    'output':
        {
            'filters':
                [
                    {'type': 'azure_content_safety',
                     'config': {'hate': 0,
                          'sexual': 0,
                          'violence': 0,
                          'self_harm': 0
                          }
                     }
                ]
        }
}

response = completion(model="sap/{{openai_large}}",
                      messages=[{"role": "user", "content": "Hello world!"}],
                      filtering=filtering_config_azure)
print(response.choices[0].message.content) 
# The model responds normally because the content does not violate any safety rules.

try:
    response = completion(model="sap/{{openai_large}}",
                          messages=[{"role": "user", "content": "I hate you"}],
                          filtering=filtering_config_azure)
except Exception as e:
    print(e) 
    # The service raises an error:
    # "Input Filter: Content filtered due to safety violations. Please modify the prompt and try again."
```
有关全部可用的内容过滤配置，详见[文档](https://help.sap.com/docs/sap-ai-core/generative-ai/content-filtering?locale=en-US)。

#### 用于回退的模块配置列表
SAP GEN AI Hub 提供用于处理错误的回退（fallback）机制。借助该机制，你可以指定一组出错时启用的回退模块。回退模块应包含配置请求所需的全部参数。

必需参数：
- `model` 
- `messages`

可选参数： 
- `filtering`
- `grounding`
- `translation`
- `masking`
- `tools`

- 以及该模型的任意专属参数。


```python showLineNumbers title="回退示例"
from litellm import completion

translation_config = {
    'input':
        {'type': 'sap_document_translation',
         'config':
             {'source_language': 'en-US',
              'target_language': 'de-DE'}
         },
    'output':
        {'type': 'sap_document_translation',
         'config':
             {'source_language': 'de-DE',
              'target_language': 'fr-FR'}
         }
}

response = completion(model="sap/{{openai_large}}",
                      messages=[{"role": "user", "content": "Hello world!"}],
                      translation=translation_config,
                      fallback_sap_modules=[{
                          "model":"sap/{{gemini_flash}}",
                          "messages":[{"role": "user", "content": "Hello world!"}],
                          "translation":translation_config
                      }])

# In case of error with the first configuration (model {{openai_large}}), the fallback module is used.

print(response.choices[0].message.content)

```


## 参考

### 支持的参数

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `model` | string | 模型标识符（SDK 用法需带 `sap/` 前缀） |
| `messages` | array | 对话消息 |
| `temperature` | float | 控制随机性（0-2） |
| `max_tokens` | integer | 响应中允许的最大 Token 数 |
| `top_p` | float | 核采样（nucleus sampling）阈值 |
| `stream` | boolean | 启用流式响应 |
| `response_format` | object | 输出格式（`json_object`、`json_schema`） |
| `tools` | array | 函数调用工具定义 |
| `tool_choice` | string/object | 工具选择行为 |

### 支持的模型

SAP Gen AI Hub 提供的可用模型的完整且最新的列表，请参阅 [SAP AI Core Generative AI Hub 文档](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/models-and-scenarios-in-generative-ai-hub)。

:::info[模型可用性]
模型可用性因 SAP 部署区域和你的订阅而异。请联系 SAP 管理员，确认你的环境中可用哪些模型。
:::

### 故障排查

**认证错误**

如果遇到认证错误：

1. 确认所有必需的环境变量均已正确设置
2. 检查服务密钥是否已过期
3. 确认资源组有权访问目标模型
4. 确保 `AICORE_AUTH_URL` 和 `AICORE_BASE_URL` 与你的 SAP 区域一致

**找不到模型**

如果模型返回 "not found"：

1. 确认该模型在你的 SAP 部署中可用
2. 检查模型名格式是否正确（SDK 用法需带 `sap/` 前缀）
3. 确认资源组有权访问该特定模型
4. 对 Anthropic 模型，确保使用了 `anthropic--` 双连字符前缀

**限流**

SAP Gen AI Hub 会按你的订阅实施速率限制。如果触达上限：

1. 实现指数退避的重试逻辑
2. 考虑使用代理内置的限流功能
3. 联系 SAP 管理员核查配额分配
