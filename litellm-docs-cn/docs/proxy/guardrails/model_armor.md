import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Google Cloud Model Armor

LiteLLM 通过 [Model Armor API](https://cloud.google.com/security-command-center/docs/model-armor-overview) 支持 Google Cloud Model Armor 防护栏（guardrails）。


## 支持的防护栏

- [Model Armor Templates](https://cloud.google.com/security-command-center/docs/manage-model-armor-templates) - 基于已配置的模板进行内容净化与拦截

## 快速上手
### 1. 在 LiteLLM config.yaml 中定义防护栏

在 `guardrails` 部分下定义你的防护栏

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: model-armor-shield
    litellm_params:
      guardrail: model_armor
      mode: [pre_call, during_call, post_call]  # Run on input, parallel, and output
      template_id: "your-template-id"  # Required: Your Model Armor template ID
      project_id: "your-project-id"    # Your GCP project ID
      location: "us-central1"          # GCP location (default: us-central1)
      credentials: "path/to/credentials.json"  # Path to service account key
      mask_request_content: true       # Enable request content masking
      mask_response_content: true      # Enable response content masking
      fail_on_error: true             # Fail request if Model Armor errors (default: true)
      sanitize_error_detail: true     # Keep raw Model Armor responses out of errors and logs (default: true)
      default_on: true                # Run by default for all requests
```

#### `mode` 支持的取值

- `pre_call` 在 LLM 调用**之前**对**输入**运行
- `during_call` 与 LLM 调用**并行**对**输入**运行
- `post_call` 在 LLM 调用**之后**对**输出**运行
- `pre_mcp_call` 在 MCP 工具调用**之前**对**输入**运行
- `during_mcp_call` 与 MCP 工具调用**并行**对**输入**运行
- `logging_only` 扫描已记录的请求与完整响应，既不拦截也不修改返回给客户端的响应

#### 只观测不拦截

在正式启用前，可先用 `logging_only` 评估某个 Model Armor 模板：

```yaml
guardrails:
  - guardrail_name: model-armor-observe
    litellm_params:
      guardrail: model_armor
      mode: logging_only
      template_id: "your-template-id"
      project_id: "your-project-id"
      location: "us-central1"
      credentials: "path/to/credentials.json"
      default_on: true
```

对于通过代理发起且成功的 Chat Completions、Responses 与 Messages 调用，该模式会扫描已记录的请求与响应文本，并在 `guardrail_information` 中记录 `success`、`guardrail_flagged` 或 `guardrail_failed_to_respond`。判定结果可在 Request Logs 或 Guardrails Monitor Logs 标签页中查看。命中结果与 Model Armor 错误都不会拦截请求，也不会改变返回给客户端的响应。对流式请求，LiteLLM 会照常转发分块，不会等待完整响应扫描完成。

该模式不提供只扫描输入或只扫描输出的选项，也不会扫描工具调用参数与内联文档。需要[文档与文件扫描](#文档与文件扫描)时，请改用 `pre_call` 或 `during_call`。

### 2. 启动 LiteLLM 网关


```shell
litellm --config config.yaml --detailed_debug
```

### 3. 测试请求

**[Langchain、OpenAI SDK 用法示例](/docs/proxy/user_keys#请求格式)**

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "Hi, my email is test@example.com"}
    ],
    "guardrails": ["model-armor-shield"]
  }'
```

## 文档与文件扫描

从 v1.92.0 起，Model Armor 在消息文本之外还会扫描内联的文档附件。在 `pre_call` 与 `during_call` 模式下，LiteLLM 会把请求消息中的每个附件解析为字节，并在请求到达 LLM 之前提交给 Model Armor 的 [byte API](https://cloud.google.com/security-command-center/docs/sanitize-prompts-responses)。

LiteLLM 能识别携带内联 `file_data`（base64 data URI 或原始 base64）的 OpenAI `type: file` 内容块，以及携带内联 base64 `source` 的 Anthropic `type: document` 内容块。附件的 MIME 类型、声明的 `format` 或文件名扩展名会被映射为 Model Armor 的 `byteDataType`；PDF、Word、Excel、PowerPoint、CSV 与纯文本文档均在扫描之列。byte API 不支持的类型（如图片）不会被扫描，原样放行。

```json
{
  "role": "user",
  "content": [
    {"type": "text", "text": "Summarize this document"},
    {"type": "file", "file": {"file_data": "data:application/pdf;base64,JVBERi0x...", "filename": "report.pdf"}}
  ]
}
```

只要文档命中 Model Armor 检测项，请求就会一律以 HTTP 400 拦截：

```json
{"error": "Content blocked by Model Armor", "model_armor_response": {"sanitizationResult": {"filterMatchState": "MATCH_FOUND"}}}
```

脱敏（masking）从不作用于文档。Model Armor 对文档只返回命中结果，不会返回净化后的副本，因此即使启用了 `mask_request_content`，命中同样会导致拦截。

### 无法扫描的附件

被 LiteLLM 识别为文档、却无法提交扫描的附件按失败关闭（fail closed）处理：除非设置 `fail_on_error: false`，否则请求会以 HTTP 400 拦截。

| 情形 | 默认（`fail_on_error: true`） | 设置 `fail_on_error: false` 后 |
|------|--------------------------------|------------------------------|
| 携带 `file_id` 或远程 URL 引用（`http://`、`https://`、`gs://`）而无内联字节 | 拦截 | 不扫描直接放行 |
| 文档超过 Model Armor 的 4 MB 上限 | 拦截 | 不扫描直接放行 |
| 内联 base64 解码失败 | 拦截 | 不扫描直接放行 |
| 扫描附件时发生 Model Armor API 错误 | 拦截 | 跳过该附件，其余附件继续扫描 |

被拦截的请求会返回原因：

```json
{"error": "Model Armor could not scan an attachment and blocked the request: attachment of 5242880 bytes exceeds Model Armor's 4194304 byte scan limit"}
```

如果你使用 `file_id`、`gs://` 或 `http(s)://` 这类附件引用（Vertex AI 推荐的写法），字节内容根本不会到达 LiteLLM，Model Armor 无从扫描，请求默认会被拦截。设置 `skip_unscannable_attachments: true` 可让不含内联字节的附件不扫描直接放行，而携带内联字节的附件仍照常扫描。与 `fail_on_error: false` 不同，该选项不会影响真正的 Model Armor API 错误（网络、配额、模板无效）下的失败关闭行为；它只作用于那些本就没有字节可发的附件。

超过 Model Armor 4 MB 字节上限的文档确实携带字节，只是超出了 byte API 能接受的范围，因此在 `fail_on_error` 下仍会失败关闭；`skip_unscannable_attachments` 不覆盖这种情况，因为它是真实文档，被拦截往往正是你想要的结果，而不是不扫描就转发出去。

## 支持的参数

### 通用参数

- `api_key` - str - Google Cloud 服务账号凭据（使用 ADC 时可不填）
- `api_base` - str - 自定义 Model Armor API 端点（可选）
- `default_on` - bool - 是否默认运行该防护栏。默认为 `false`。
- `mode` - Union[str, list[str]] - 运行防护栏所需的模式。支持 `pre_call`、`during_call`、`post_call`、`pre_mcp_call`、`during_mcp_call` 和 `logging_only`。

### Model Armor 专属参数

- `template_id` - str - 你的 Model Armor 模板 ID（必填）
- `project_id` - str - Google Cloud 项目 ID（默认取凭据所属项目）
- `location` - str - Google Cloud 位置/区域。默认为 `us-central1`
- `credentials` - Union[str, dict] - 服务账号 JSON 文件路径或凭据字典
- `api_endpoint` - str - Model Armor 的自定义 API 端点（可选）
- `fail_on_error` - bool - Model Armor 出错时是否让请求失败，包括无法扫描的附件（参见[文档与文件扫描](#文档与文件扫描)）。默认为 `true`
- `skip_unscannable_attachments` - bool - 让不含内联字节的附件引用（`file_id`、`gs://`、`http(s)://`）不扫描直接放行而不是拦截，但真正的 Model Armor API 错误仍按失败关闭处理（参见[无法扫描的附件](#无法扫描的附件)）。默认为 `false`
- `sanitize_error_detail` - bool - 不把 Model Armor 的原始 API 响应放进返回给调用方的错误详情、调试日志和防护栏追踪负载中。默认为 `true`；调试时可设为 `false` 以恢复详细输出
- `mask_request_content` - bool - 对请求中的敏感内容启用脱敏。默认为 `false`
- `mask_response_content` - bool - 对响应中的敏感内容启用脱敏。默认为 `false`


## 延伸阅读

- [按 API 密钥控制防护栏](./quick_start#-按-api-密钥控制防护栏)
