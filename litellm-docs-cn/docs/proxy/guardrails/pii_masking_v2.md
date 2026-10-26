import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# PII、PHI 掩码（Presidio）

## 概述

| 属性 | 说明 |
|-------|-------|
| 描述 | 使用这条防护栏掩码 PII（个人身份信息，Personally Identifiable Information）、PHI（受保护健康信息，Protected Health Information）及其他敏感数据。 |
| 提供方 | [Microsoft Presidio](https://github.com/microsoft/presidio/) |
| 支持的实体类型 | 所有 Presidio 实体类型 |
| 支持的操作 | `MASK`, `BLOCK` |
| 支持的模式 | `pre_call`, `during_call`, `post_call`, `logging_only`, `pre_mcp_call` |
| 语言支持 | 通过 `presidio_language` 参数配置（支持英语、西班牙语、德语等多种语言） |

## 部署选项

使用这条防护栏前，需要先部署 Presidio Analyzer 和 Presidio Anonymizer 容器。

| 部署选项 | 说明 |
|------------------|----------|
| 部署 Presidio Docker 容器 | - [Presidio Analyzer Docker 容器](https://hub.docker.com/r/microsoft/presidio-analyzer)<br/>- [Presidio Anonymizer Docker 容器](https://hub.docker.com/r/microsoft/presidio-anonymizer) |

## 快速上手

<Tabs>
<TabItem value="ui" label="LiteLLM UI">

### 1. 创建 PII、PHI 掩码防护栏

在 LiteLLM UI 中进入 Guardrails 页面，点击 "Add Guardrail"，在下拉菜单中选择 "Presidio PII"，然后填入你的 Presidio Analyzer 和 Anonymizer 端点。

<Image 
  img={require('../../../img/presidio_1.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>
<br/>

#### 1.2 配置实体类型

接下来选择想要掩码的实体类型，支持的操作见[此处](#支持的操作)。

<Image 
  img={require('../../../img/presidio_2.png')}
  style={{width: '50%', display: 'block', margin: '0'}}
/>

#### 1.3 设置默认语言（可选）

你也可以在 UI 中用 `presidio_language` 字段为 PII 分析配置默认语言。除非被按请求的语言设置覆盖，所有请求都会使用这个默认语言。

**支持的语言代码包括：**
- `en` - 英语（默认）
- `es` - 西班牙语  
- `de` - 德语


未指定时默认使用英语（`en`）。

</TabItem>


<TabItem value="config" label="Config.yaml">

在 `guardrails` 部分定义你的防护栏

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "presidio-pii"
    litellm_params:
      guardrail: presidio  # supported values: "aporia", "bedrock", "lakera", "presidio"
      mode: "pre_call"
      presidio_language: "en"  # optional: set default language for PII analysis
```

设置以下环境变量

```bash title="Setup Environment Variables" showLineNumbers
export PRESIDIO_ANALYZER_API_BASE="http://localhost:5002"
export PRESIDIO_ANONYMIZER_API_BASE="http://localhost:5001"
```

#### `mode` 的可用取值

- `pre_call`：在 LLM 调用**之前**运行，作用于**输入**
- `post_call`：在 LLM 调用**之后**运行，作用于**输入与输出**
- `logging_only`：在 LLM 调用**之后**运行，仅在写入 Langfuse 等日志之前应用 PII 掩码，不作用于实际的 LLM API 请求 / 响应。

### 2. 启动 LiteLLM 网关

```shell title="Start Gateway" showLineNumbers
litellm --config config.yaml --detailed_debug
```

</TabItem>
</Tabs>


### 3. 测试一下

#### 3.1 LiteLLM UI

在 LiteLLM UI 中进入 "Test Keys" 页面，选中你创建的防护栏，并发送下面这条充满 PII 数据的消息。

```text title="PII Request" showLineNumbers
My credit card is 4111-1111-1111-1111 and my email is test@example.com.
```

<Image 
  img={require('../../../img/presidio_3.png')}
  style={{width: '100%', display: 'block', margin: '0'}}
/>

<br/>

#### 3.2 在代码中测试

要让请求应用防护栏，在请求体中传入 `guardrails=["presidio-pii"]` 即可。

**[Langchain、OpenAI SDK 用法示例](/docs/proxy/user_keys#请求格式)**

<Tabs>
<TabItem label="PII 掩码调用" value = "not-allowed">

`Jane Doe` 属于 PII，预期它会被掩码

```shell title="Masked PII Request" showLineNumbers
curl http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "Hello my name is Jane Doe"}
    ],
    "guardrails": ["presidio-pii"],
  }'
```

掩码后的预期响应

```shell title="Response with Masked PII" showLineNumbers
{
 "id": "chatcmpl-A3qSC39K7imjGbZ8xCDacGJZBoTJQ",
 "choices": [
   {
     "finish_reason": "stop",
     "index": 0,
     "message": {
       "content": "Hello, <PERSON>! How can I assist you today?",
       "role": "assistant",
       "tool_calls": null,
       "function_call": null
     }
   }
 ],
 "created": 1725479980,
 "model": "{{openai_small}}",
 "object": "chat.completion",
 "system_fingerprint": "fp_5bd87c427a",
 "usage": {
   "completion_tokens": 13,
   "prompt_tokens": 14,
   "total_tokens": 27
 },
 "service_tier": null
}
```

</TabItem>

<TabItem label="无 PII 调用" value = "allowed">

```shell title="No PII Request" showLineNumbers
curl http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "Hello good morning"}
    ],
    "guardrails": ["presidio-pii"],
  }'
```

</TabItem>
</Tabs>


## 追踪防护栏请求

防护栏在生产环境上线后，你可以在 LiteLLM Logs、Langfuse、Arize Phoenix 等 LiteLLM 的全部日志集成中追踪防护栏。

### LiteLLM UI

在 LiteLLM 日志页面可以看到这条请求的 PII 内容已被掩码，还能查看防护栏的详细追踪记录：监控被掩码的实体类型、对应的置信度分数，以及防护栏执行的耗时。

<Image 
  img={require('../../../img/presidio_4.png')}
  style={{width: '60%', display: 'block', margin: '0'}}
/>

### Langfuse

将 LiteLLM 接入 Langfuse 后，可以在 Langfuse Trace 中看到防护栏信息。

<Image 
  img={require('../../../img/presidio_5.png')}
  style={{width: '60%', display: 'block', margin: '0'}}
/>

## 实体类型、检测置信度阈值与作用范围配置

- **实体类型**
  - 你可以为 PII 检测配置具体的实体类型，并决定每种类型的处理方式（掩码还是拦截）。
- **检测置信度阈值**
  - 你还可以提供一个可选的置信度阈值，只有达到该阈值的检测结果才会交给匿名化器处理。未在 `presidio_score_thresholds` 中出现的实体类型会保留全部检测结果（不设最低分数）。
- **作用范围**
  - 使用可选的 `presidio_filter_scope` 选择检查的范围：

      - `input`：只扫描用户 → 模型的内容
      - `output`：只扫描模型 → 用户的内容
      - `both`（默认）：双向都扫描

    **那 `output_parse_pii` 呢？**  
    这个开关只在模型调用完成后把掩码 token 还原为原始值，并不会对输出运行 Presidio 检测。想让 Presidio 主动扫描并掩码模型响应、再交给用户，请使用 `presidio_filter_scope: output`（或 `both`）。

    **`input` 和 `output` 怎么选：**
    - `input`：保护上游提供商，在 PII 离开你的边界之前先剥离掉。
    - `output`：拦住模型可能生成或回流给用户的 PII。
    - `both`：双向端到端保护。

### 在 `config.yaml` 中配置实体类型、检测置信度阈值与作用范围

定义防护栏时加上具体的实体类型配置：

```yaml title="config.yaml with Entity Types" showLineNumbers
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "presidio-mask-guard"
    litellm_params:
      guardrail: presidio
      mode: "pre_mcp_call"  # Use this mode for MCP requests
      presidio_filter_scope: both  # input | output | both, optional
      presidio_score_thresholds: # Optional
        ALL: 0.7            # Default confidence threshold applied to all entities
        CREDIT_CARD: 0.8    # Override for credit cards
        EMAIL_ADDRESS: 0.6  # Override for emails
      pii_entities_config:
        CREDIT_CARD: "MASK"  # Will mask credit card numbers
        EMAIL_ADDRESS: "MASK"  # Will mask email addresses

  - guardrail_name: "presidio-block-guard"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"  # Use this mode for regular LLM requests
      presidio_filter_scope: both  # input | output | both, optional
      presidio_score_thresholds: # Optional
        CREDIT_CARD: 0.8  # Only keep credit card detections scoring 0.8+
      pii_entities_config:
        CREDIT_CARD: "BLOCK"  # Will block requests containing credit card numbers
```

#### 置信度阈值行为
- 未配置 `presidio_score_thresholds`：保留全部检测结果（不应用任何阈值）
- `presidio_score_thresholds.ALL`：对所有检测结果应用该置信度阈值
- `presidio_score_thresholds.<ENTITY>`：只对该实体类型应用阈值
- 同时存在 `ALL` 和某个实体类型的覆盖配置时，`ALL` 全局生效，该实体类型以覆盖配置为准

### 大内容分块

Presidio analyzer 部署通常限制 `/analyze` 请求体大小（例如 1 MB），且分析延迟会随负载增大而上升。当某个内容块序列化后的 `/analyze` 请求体会超过 `presidio_analyze_chunk_size_bytes`（默认 `500000` 字节，按分析器实际收到的 JSON 转义形式计算）时，LiteLLM 会自动把它切分成带重叠的多个分块，以受控并发逐块分析，再把检测结果合并回原文。这样大内容块也能被正确掩码，而不是以 `HTTP 413` 失败。

```yaml
guardrails:
  - guardrail_name: "presidio-pii"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
      presidio_analyze_chunk_size_bytes: 500000 # optional, default 500000
```

把该值设到低于分析器部署的请求体上限，并为 analyze 负载的其他部分（实体列表、Ad Hoc 识别器）留出余量。

### 支持的实体类型

LiteLLM 支持所有 Presidio 实体类型，完整列表见 [Presidio 支持的实体类型](https://microsoft.github.io/presidio/supported_entities/)。

### 支持的操作

对每种实体类型，你可以指定以下操作之一：

- `MASK`：用占位符替换该实体（例如 `<PERSON>`）
- `BLOCK`：一旦检测到该实体类型，直接拦截整个请求

### 使用实体类型配置测试请求

<Tabs>
<TabItem label="掩码 PII 实体" value="masked-entities">

使用掩码配置时，实体会被替换为占位符：

```shell title="Masking PII Request" showLineNumbers
curl http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "My credit card is 4111-1111-1111-1111 and my email is test@example.com"}
    ],
    "guardrails": ["presidio-mask-guard"]
  }'
```

掩码后的响应示例：

```json
{
  "id": "chatcmpl-123abc",
  "choices": [
    {
      "message": {
        "content": "I can see you provided a <CREDIT_CARD> and an <EMAIL_ADDRESS>. For security reasons, I recommend not sharing this sensitive information.",
        "role": "assistant"
      },
      "index": 0,
      "finish_reason": "stop"
    }
  ]
  // ... other response fields
}
```

</TabItem>

<TabItem label="拦截 PII 实体" value="blocked-entity">

使用拦截配置时，包含所配置实体类型的请求会被整体拦截并抛出异常：

```shell title="Blocking PII Request" showLineNumbers
curl http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "My credit card is 4111-1111-1111-1111"}
    ],
    "guardrails": ["presidio-block-guard"]
  }'
```

运行这条请求时，代理会抛出 `BlockedPiiEntityError` 异常。

```json
{
  "error": {
    "message": "Blocked PII entity detected: CREDIT_CARD by Guardrail: presidio-block-guard."
  }
}
```

异常中包含被拦截的实体类型（这里是 `CREDIT_CARD`）以及触发拦截的防护栏名称。

</TabItem>
</Tabs>

## 高级用法

### 支持的模式

Presidio 防护栏支持以下模式：

- `pre_call`：在 LLM 调用**之前**运行，作用于**输入**
- `post_call`：在 LLM 调用**之后**运行，作用于**输入与输出**
- `logging_only`：在 LLM 调用**之后**运行，仅在写入 Langfuse 等日志之前应用 PII 掩码，不作用于实际的 LLM API 请求 / 响应
- `pre_mcp_call`：在 MCP 调用**之前**运行，作用于**输入**。想对 MCP 请求应用 PII 掩码 / 拦截时使用此模式

### MCP 使用示例

下面是在 MCP 场景中使用 Presidio 防护栏的方法：

```yaml title="MCP Configuration Example" showLineNumbers
guardrails:
  - guardrail_name: "presidio-mcp-guard"
    litellm_params:
      guardrail: presidio
      mode: "pre_mcp_call"
      presidio_filter_scope: both  # input | output | both
      presidio_score_thresholds:
        CREDIT_CARD: 0.8  # Only keep credit card detections scoring 0.8+
        EMAIL_ADDRESS: 0.6  # Only keep email detections scoring 0.6+
      pii_entities_config:
        CREDIT_CARD: "MASK"  # Will mask credit card numbers
        EMAIL_ADDRESS: "BLOCK"  # Will block email addresses
        PHONE_NUMBER: "MASK"  # Will mask phone numbers
        MEDICAL_LICENSE: "BLOCK"  # Will block medical license numbers
      default_on: true
```

用一条请求来测试这条 MCP 防护栏：

```shell title="Test MCP Guardrail" showLineNumbers
curl http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "My credit card is 4111-1111-1111-1111 and my medical license is ABC123"}
    ],
    "guardrails": ["presidio-mcp-guard"]
  }'
```

请求会按以下方式处理：
1. 信用卡号会被掩码（例如替换为 `<CREDIT_CARD>`）
2. 一旦检测到行医执照号，请求会被拦截并抛出 `BlockedPiiEntityError`

### 按请求设置 `language`

Presidio API [支持传入 `language` 参数](https://microsoft.github.io/presidio/api-docs/api-docs.html#tag/Analyzer/paths/~1analyze/post)。下面是按请求设置 `language` 的方式

<Tabs>
<TabItem label="curl" value = "curl">

```shell title="Language Parameter - curl" showLineNumbers
curl http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "is this credit card number 9283833 correct?"}
    ],
    "guardrails": ["presidio-pre-guard"],
    "guardrail_config": {"language": "es"}
  }'
```

</TabItem>


<TabItem label="OpenAI Python SDK" value = "python">

```python title="Language Parameter - Python" showLineNumbers
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="{{openai_small}}",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={ 
        "metadata": {
            "guardrails": ["presidio-pre-guard"],
            "guardrail_config": {"language": "es"}
        }
    }
)
print(response)
```

</TabItem>

</Tabs>

### 在 config.yaml 中设置默认 `language`

你可以在 YAML 配置里用 `presidio_language` 参数为 PII 分析设置默认语言。除非被按请求的语言设置覆盖，所有请求都会使用这个语言。

```yaml title="Default Language Configuration" showLineNumbers
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "presidio-german"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
      presidio_language: "de"  # Default to German for PII analysis
      pii_entities_config:
        CREDIT_CARD: "MASK"
        EMAIL_ADDRESS: "MASK"
        PERSON: "MASK"

  - guardrail_name: "presidio-spanish"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
      presidio_language: "es"  # Default to Spanish for PII analysis
      pii_entities_config:
        CREDIT_CARD: "MASK"
        PHONE_NUMBER: "MASK"
```

#### 支持的语言代码

Presidio 支持多种语言的 PII 检测，常用语言代码包括：

- `en` - 英语（默认）
- `es` - 西班牙语
- `de` - 德语  

支持语言的完整列表参见 [Presidio 文档](https://microsoft.github.io/presidio/analyzer/languages/)。

#### 语言优先级

语言设置的优先级如下：

1. **按请求语言**（通过 `guardrail_config.language`），优先级最高
2. **YAML 配置语言**（通过 `presidio_language`），优先级居中  
3. **默认语言**（`en`），优先级最低

**混合语言的示例：**

```yaml title="Mixed Language Configuration" showLineNumbers
guardrails:
  - guardrail_name: "presidio-multilingual"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
      presidio_language: "de"  # Default to German
      pii_entities_config:
        CREDIT_CARD: "MASK"
        PERSON: "MASK"
```

```shell title="Override with per-request language" showLineNumbers
curl http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "Mi tarjeta de crédito es 4111-1111-1111-1111"}
    ],
    "guardrails": ["presidio-multilingual"],
    "guardrail_config": {"language": "es"}
  }'
```

在这个例子里，尽管防护栏配置的默认语言是德语（`de`），这条请求的 PII 检测仍会使用西班牙语（`es`）。

### 输出解析


LLM 的响应有时会包含掩码 token。

对于 Presidio 的 "replace" 操作，LiteLLM 可以检查 LLM 响应，并把掩码 token 替换回用户提交的原始值。

在 `guardrails` 部分定义你的防护栏
```yaml title="Output Parsing Config" showLineNumbers
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "presidio-pre-guard"
    litellm_params:
      guardrail: presidio  # supported values: "aporia", "bedrock", "lakera", "presidio"
      mode: "pre_call"
      output_parse_pii: True
```

**预期流程：**

1. 用户输入："hello world, my name is Jane Doe. My number is: 034453334"

2. LLM 输入："hello world, my name is [PERSON]. My number is: [PHONE_NUMBER]"

3. LLM 响应："Hey [PERSON], nice to meet you!"

4. 用户收到："Hey Jane Doe, nice to meet you!"

### Ad Hoc 识别器


通过向代理传入一个 json 文件，把 Ad Hoc 识别器发给 Presidio 的 `/analyze` 接口

[**Ad Hoc 识别器**示例](https://github.com/BerriAI/litellm/blob/b69b7503db5aa039a49b7ca96ae5b34db0d25a3d/litellm/proxy/hooks/example_presidio_ad_hoc_recognizer.json)

#### 在 LiteLLM config.yaml 中定义 Ad Hoc 识别器

在 `guardrails` 部分定义你的防护栏
```yaml title="Ad Hoc Recognizers Config" showLineNumbers
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "presidio-pre-guard"
    litellm_params:
      guardrail: presidio  # supported values: "aporia", "bedrock", "lakera", "presidio"
      mode: "pre_call"
      presidio_ad_hoc_recognizers: "./hooks/example_presidio_ad_hoc_recognizer.json"
```

设置以下环境变量

```bash title="Ad Hoc Recognizers Environment Variables" showLineNumbers
export PRESIDIO_ANALYZER_API_BASE="http://localhost:5002"
export PRESIDIO_ANONYMIZER_API_BASE="http://localhost:5001"
```


启动代理后可以看到实际效果：

```bash title="Run Proxy with Debug" showLineNumbers
litellm --config /path/to/config.yaml --debug
```

发一条对话补全请求，例如：

```json title="Custom PII Request" showLineNumbers
{
  "model": "{{openai_small}}",
  "messages": [{"role": "user", "content": "John Smith AHV number is 756.3026.0705.92. Zip code: 1334023"}]
}
```

再搜索以 `Presidio PII Masking` 开头的日志，例如：
```text title="PII Masking Log" showLineNumbers
Presidio PII Masking: Redacted pii message: <PERSON> AHV number is <AHV_NUMBER>. Zip code: <US_DRIVER_LICENSE>
```

### 仅在日志中掩码（Logging Only）


只在写入 Langfuse 等日志之前应用 PII 掩码。

不作用于实际的 LLM API 请求 / 响应。

:::note
目前只对以下场景生效：
- `/chat/completion` 请求
- "success" 日志

:::

1. 在 LiteLLM config.yaml 中定义模式 `logging_only`

在 `guardrails` 部分定义你的防护栏
```yaml title="Logging Only Config" showLineNumbers
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "presidio-pre-guard"
    litellm_params:
      guardrail: presidio  # supported values: "aporia", "bedrock", "lakera", "presidio"
      mode: "logging_only"
```

设置以下环境变量

```bash title="Logging Only Environment Variables" showLineNumbers
export PRESIDIO_ANALYZER_API_BASE="http://localhost:5002"
export PRESIDIO_ANONYMIZER_API_BASE="http://localhost:5001"
```


2. 启动代理

```bash title="Start Proxy" showLineNumbers
litellm --config /path/to/config.yaml
```

3. 测试！

```bash title="Test Logging Only" showLineNumbers
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-D '{
  "model": "{{openai_small}}",
  "messages": [
    {
      "role": "user",
      "content": "Hi, my name is Jane!"
    }
  ]
  }'
```


**预期的日志响应**

```text title="Logged Response with Masked PII" showLineNumbers
Hi, my name is <PERSON>!
```
