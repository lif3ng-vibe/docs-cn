
# StandardLoggingPayload 规范

当 LiteLLM 完成标准负载（standard payload）的构建后，终态的成功与失败回调事件都会携带 `kwargs["standard_logging_object"]`。自定义日志回调应从 `kwargs["standard_logging_object"]["metadata"]` 读取请求身份信息，而不是直接读原始的 `litellm_params` 元数据。可选的身份字段在不可用时为 `null`。中间流式事件以及负载构建失败的回调可能省略 `standard_logging_object`。

## StandardLoggingPayload

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `id` | `str` | 唯一标识符 |
| `trace_id` | `str` | 追踪属于同一整体请求的多次 LLM 调用 |
| `session_id` | `str` | 终端用户/会话 ID，取自 `litellm_session_id`。与 `trace_id` 相互独立；仅在启用 `litellm_settings.request_correlation_in_logs` 时才会填充。[更多文档](./debugging#请求关联-id) |
| `call_type` | `str` | 调用类型 |
| `response_cost` | `float` | 响应成本，单位为美元（$） |
| `cost_breakdown` | `Optional[CostBreakdown]` | 详细的成本明细对象 |
| `response_cost_failure_debug_info` | `StandardLoggingModelCostFailureDebugInformation` | 成本追踪失败时的调试信息 |
| `zero_cost_diagnostic` | `Optional[StandardLoggingZeroCostDiagnostic]` | 计费请求为何定价为 $0。当成本非零、模型免费或未映射定价、或请求没有任何用量时为 `None`。[更多文档](./cost_tracking#计价为-0-的请求) |
| `status` | `StandardLoggingPayloadStatus` | 负载状态 |
| `status_fields` | `StandardLoggingPayloadStatusFields` | 带类型的 status 字段，便于筛选与分析 |
| `total_tokens` | `int` | Token 总数 |
| `prompt_tokens` | `int` | 提示词 Token 数 |
| `completion_tokens` | `int` | 补全 Token 数 |
| `startTime` | `float` | 调用开始时间 |
| `endTime` | `float` | 调用结束时间 |
| `completionStartTime` | `float` | 流式请求的首 Token 时间 |
| `response_time` | `float` | 总响应时间。流式请求下为首 Token 时间 |
| `model_map_information` | `StandardLoggingModelInformation` | 模型映射信息 |
| `model` | `str` | 请求中发送的模型名称 |
| `model_id` | `Optional[str]` | 所用部署的模型 ID |
| `model_group` | `Optional[str]` | 该请求使用的模型组（`model_group`） |
| `api_base` | `str` | LLM API 的基础 URL |
| `metadata` | `StandardLoggingMetadata` | 元数据信息 |
| `cache_hit` | `Optional[bool]` | 是否命中缓存 |
| `cache_key` | `Optional[str]` | 可选的缓存键 |
| `saved_cache_cost` | `float` | 缓存节省的成本 |
| `request_tags` | `list` | 请求标签列表 |
| `end_user` | `Optional[str]` | 可选的终端用户标识 |
| `requester_ip_address` | `Optional[str]` | 可选的请求方 IP 地址 |
| `messages` | `Optional[Union[str, list, dict]]` | 请求中发送的消息 |
| `response` | `Optional[Union[str, list, dict]]` | LLM 响应 |
| `error_str` | `Optional[str]` | 可选的错误字符串 |
| `error_information` | `Optional[StandardLoggingPayloadErrorInformation]` | 可选的错误信息 |
| `model_parameters` | `dict` | 模型参数 |
| `hidden_params` | `StandardLoggingHiddenParams` | 隐藏参数 |
| `guardrail_information` | `Optional[list[StandardLoggingGuardrailInformation]]` | 请求上运行的每个防护栏（guardrail）各对应一条记录 |

## 成本明细

`cost_breakdown` 字段以 `CostBreakdown` 对象的形式提供对话补全请求的详细成本明细，包含：

- **`input_cost`**：输入/提示词 Token 的成本，含缓存创建 Token
- **`output_cost`**：输出/补全 Token 的成本（如适用，含推理 Token）
- **`tool_usage_cost`**：内置工具的使用成本（如网页搜索、代码解释器）
- **`total_cost`**：输入 + 输出 + 工具使用的总成本
- **`reasoning_cost`**：推理 Token 的成本，作为 `output_cost` 的子集报告（当模型返回推理 Token 时填充，例如 `{{gemini_flash}}`、`o3`）
- **`cache_read_cost`**：缓存读取 Token 的成本，作为 `input_cost` 的子集报告（当响应中存在缓存 Token 时填充）
- **`cache_creation_cost`**：缓存创建 Token 的成本，作为 `input_cost` 的子集报告（在使用提示词缓存时填充，例如 Anthropic 模型）

**注意**：该字段对所有调用类型都会填充。对于非补全类调用，`input_cost` 和 `output_cost` 可能为 0。

总成本的关系为：`response_cost = cost_breakdown.total_cost`

### CostBreakdown 类型

```python
class CostBreakdown(TypedDict, total=False):
    input_cost: float           # Cost of input/prompt tokens in USD
    output_cost: float          # Cost of output/completion tokens in USD (includes reasoning)
    tool_usage_cost: float      # Cost of built-in tools usage in USD
    total_cost: float           # Total cost in USD
    reasoning_cost: float       # Cost of reasoning tokens in USD; subset of output_cost
    cache_read_cost: float      # Cost of cache-read tokens in USD; subset of input_cost
    cache_creation_cost: float  # Cost of cache-creation tokens in USD; subset of input_cost
```

## StandardLoggingUserAPIKeyMetadata

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `user_api_key_hash` | `Optional[str]` | LiteLLM 虚拟密钥（virtual key）的哈希值 |
| `user_api_key_alias` | `Optional[str]` | API 密钥的别名 |
| `user_api_key_org_id` | `Optional[str]` | 与该密钥关联的组织 ID |
| `user_api_key_team_id` | `Optional[str]` | 与该密钥关联的团队 ID |
| `user_api_key_user_id` | `Optional[str]` | 与该密钥关联的用户 ID |
| `user_api_key_end_user_id` | `Optional[str]` | 与该密钥关联的终端用户 ID |
| `user_api_key_team_alias` | `Optional[str]` | 与该密钥关联的团队别名 |

## StandardLoggingMetadata

继承自 `StandardLoggingUserAPIKeyMetadata`，并新增：

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `spend_logs_metadata` | `Optional[dict]` | 花费追踪日志的键值对 |
| `requester_ip_address` | `Optional[str]` | 请求方的 IP 地址 |
| `requester_metadata` | `Optional[dict]` | 请求方的附加元数据 |
| `vector_store_request_metadata` | `Optional[List[StandardLoggingVectorStoreRequest]]` | 向量存储（vector store）请求的元数据 |
| `requester_custom_headers` | Dict[str, str] | 客户端发送给代理的自定义（`x-`）请求头 |
| `prompt_management_metadata` | `Optional[StandardLoggingPromptManagementMetadata]` | 提示词管理与版本控制元数据 |
| `mcp_tool_call_metadata` | `Optional[StandardLoggingMCPToolCall]` | MCP（Model Context Protocol）工具调用信息与成本追踪 |
| `applied_guardrails` | `Optional[List[str]]` | 已应用的防护栏名称列表 |
| `usage_object` | `Optional[dict]` | 提供商返回的原始用量对象 |
| `cold_storage_object_key` | `Optional[str]` | 用于冷存储读取的 S3/GCS 对象键 |


## StandardLoggingVectorStoreRequest

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| vector_store_id | Optional[str] | 向量存储的 ID |
| custom_llm_provider | Optional[str] | 该向量存储关联的自定义 LLM 提供商（如 bedrock、openai、anthropic） |
| query | Optional[str] | 发送给向量存储的查询 |
| vector_store_search_response | Optional[VectorStoreSearchResponse] | OpenAI 格式的向量存储搜索响应 |
| start_time | Optional[float] | 向量存储请求的开始时间 |
| end_time | Optional[float] | 向量存储请求的结束时间 |


## StandardLoggingAdditionalHeaders

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `x_ratelimit_limit_requests` | `int` | 请求数的速率限制 |
| `x_ratelimit_limit_tokens` | `int` | Token 数的速率限制 |
| `x_ratelimit_remaining_requests` | `int` | 速率限制内剩余的请求数 |
| `x_ratelimit_remaining_tokens` | `int` | 速率限制内剩余的 Token 数 |

## StandardLoggingHiddenParams

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `model_id` | `Optional[str]` | 可选的模型 ID |
| `cache_key` | `Optional[str]` | 可选的缓存键 |
| `api_base` | `Optional[str]` | 可选的 API 基础 URL |
| `response_cost` | `Optional[str]` | 可选的响应成本 |
| `additional_headers` | `Optional[StandardLoggingAdditionalHeaders]` | 附加请求头 |
| `batch_models` | `Optional[List[str]]` | 仅 Batches API 会设置。列出用于成本计算的模型 |
| `litellm_model_name` | `Optional[str]` | 请求中发送的模型名称 |

## StandardLoggingModelInformation

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `model_map_key` | `str` | 模型映射的键 |
| `model_map_value` | `Optional[ModelInfo]` | 可选的模型信息 |

## StandardLoggingModelCostFailureDebugInformation

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `error_str` | `str` | 错误字符串 |
| `traceback_str` | `str` | 堆栈跟踪字符串 |
| `model` | `str` | 模型名称 |
| `cache_hit` | `Optional[bool]` | 是否命中缓存 |
| `custom_llm_provider` | `Optional[str]` | 可选的自定义 LLM 提供商 |
| `base_model` | `Optional[str]` | 可选的基础模型 |
| `call_type` | `str` | 调用类型 |
| `custom_pricing` | `Optional[bool]` | 是否使用了自定义定价 |

## StandardLoggingZeroCostDiagnostic

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `reason` | `Literal["missing_pricing_key", "pricing_not_applied", "cost_calculation_error"]` | 请求定价为 $0 的原因，取值与 `litellm_zero_cost_requests_total` 上的 `reason` 标签相同 |
| `pricing_model` | `str` | 该请求定价所依据的定价条目，为部署 ID 或模型成本表（model cost map）的键 |
| `missing_pricing_keys` | `Tuple[str, ...]` | 用量所需但定价条目未声明的费率键；除非 `reason` 为 `missing_pricing_key`，否则为空 |

## StandardLoggingPayloadErrorInformation

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `error_code` | `Optional[str]` | 可选的错误代码（如 "429"） |
| `error_class` | `Optional[str]` | 可选的错误类（如 "RateLimitError"） |
| `llm_provider` | `Optional[str]` | 返回错误的 LLM 提供商（如 "openai"） |

## StandardLoggingPayloadStatus

字面量类型，有两个可能的取值：
- `"success"`
- `"failure"`

## StandardLoggingGuardrailInformation

| 字段 | 类型 | 说明 |
|-----------------------|------|-------------|
| `guardrail_name` | `Optional[str]` | 防护栏名称 |
| `guardrail_provider` | `Optional[str]` | 防护栏提供商 |
| `guardrail_mode` | `Optional[Union[GuardrailEventHooks, List[GuardrailEventHooks]]]` | 防护栏模式 |
| `guardrail_request` | `Optional[dict]` | 防护栏请求 |
| `guardrail_response` | `Optional[Union[dict, str, List[dict]]]` | 防护栏响应 |
| `guardrail_status` | `GuardrailStatus` | 防护栏执行状态，取值为 [GuardrailStatus](#guardrailstatus) 中的值之一 |
| `start_time` | `Optional[float]` | 防护栏的开始时间 |
| `end_time` | `Optional[float]` | 防护栏的结束时间 |
| `duration` | `Optional[float]` | 防护栏的执行时长（秒） |
| `masked_entity_count` | `Optional[Dict[str, int]]` | 被遮蔽的实体数量 |

## StandardLoggingPayloadStatusFields

带类型的 status 字段，便于筛选与分析。

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `llm_api_status` | `StandardLoggingPayloadStatus` | LLM API 调用的状态：成功完成为 `"success"`，出错为 `"failure"` |
| `guardrail_status` | `GuardrailStatus` | 防护栏执行状态（见下文） |

### StandardLoggingPayloadStatus

字面量类型，有两个可能的取值：
- `"success"`：LLM API 请求成功完成
- `"failure"`：LLM API 请求失败

### GuardrailStatus

字面量类型，有五个可能的取值：
- `"success"`：防护栏已运行并放行内容（未检测到违规）
- `"guardrail_flagged"`：防护栏放行了内容，但记录了一次非阻断性违规
- `"guardrail_intervened"`：防护栏因策略违规而阻断或修改了内容
- `"guardrail_failed_to_respond"`：防护栏出现技术故障或 API 错误
- `"not_run"`：该请求没有执行任何防护栏

### 使用示例

筛选防护栏介入过的请求日志：
```json
{
  "status_fields": {
    "guardrail_status": "guardrail_intervened"
  }
}
```

查找防护栏技术故障：
```json
{
  "status_fields": {
    "guardrail_status": "guardrail_failed_to_respond"
  }
}
```

获取成功的 LLM 请求：
```json
{
  "status_fields": {
    "llm_api_status": "success"
  }
}
```

查找防护栏成功运行且未介入的请求：
```json
{
  "status_fields": {
    "guardrail_status": "success",
    "llm_api_status": "success"
  }
}
```

查找未运行任何防护栏的请求：
```json
{
  "status_fields": {
    "guardrail_status": "not_run"
  }
}
```

## StandardLoggingPromptManagementMetadata

用于追踪提示词的版本控制与管理信息。

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `prompt_id` | `str` | **必填**。提示词模板或版本的唯一标识符 |
| `prompt_variables` | `Optional[dict]` | 提示词模板中使用的变量/参数（例如 `{"user_name": "John", "context": "support"}`） |
| `prompt_integration` | `str` | **必填**。管理该提示词的集成或系统（例如 `"langfuse"`、`"promptlayer"`、`"custom"`） |

## StandardLoggingMCPToolCall

用于追踪 LiteLLM 请求中的 Model Context Protocol（MCP）工具调用，为外部工具集成提供详细的日志。

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `name` | `str` | **必填**。被调用工具的名称（例如 `"get_weather"`、`"search_database"`） |
| `arguments` | `dict` | **必填**。以键值对形式传给工具的参数 |
| `result` | `Optional[dict]` | 工具执行返回的响应/结果（由自定义日志钩子填充） |
| `mcp_server_name` | `Optional[str]` | 处理该工具调用的 MCP 服务器名称（例如 `"weather-service"`、`"database-connector"`） |
| `mcp_server_logo_url` | `Optional[str]` | MCP 服务器图标的 URL（用于 LiteLLM 仪表板的 UI 展示） |
| `namespaced_tool_name` | `Optional[str]` | 带服务器前缀的完整限定工具名（例如 `"deepwiki-mcp/get_page_content"`、`"github-mcp/create_issue"`） |
| `mcp_server_cost_info` | `Optional[MCPServerCostInfo]` | 该工具调用的成本追踪信息 |

### MCPServerCostInfo

MCP 服务器工具调用的成本追踪结构：

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `default_cost_per_query` | `Optional[float]` | 对该 MCP 服务器的任何工具调用的默认成本（美元） |
| `tool_name_to_cost_per_query` | `Optional[Dict[str, float]]` | 按工具细分的成本映射，用于更精细的定价（例如 `{"search": 0.01, "create": 0.05}`） |

### 用法

```python
# Basic MCP tool call metadata
mcp_tool_call = {
    "name": "search_documents",
    "arguments": {
        "query": "machine learning tutorials",
        "limit": 10,
        "filter": "type:pdf"
    },
    "mcp_server_name": "document-search-service",
    "namespaced_tool_name": "docs-mcp/search_documents",
    "mcp_server_cost_info": {
        "default_cost_per_query": 0.02,
        "tool_name_to_cost_per_query": {
            "search_documents": 0.02,
            "get_document": 0.01
        }
    }
}

# optional result field (via custom logging hooks)
mcp_tool_call_with_result = {
    "name": "search_documents",
    "arguments": {
        "query": "machine learning tutorials",
        "limit": 10,
        "filter": "type:pdf"
    },
    "result": {
        "documents": [...],
        "total_found": 42,
        "search_time_ms": 150
    },
    "mcp_server_name": "document-search-service",
    "namespaced_tool_name": "docs-mcp/search_documents",
    "mcp_server_cost_info": {
        "default_cost_per_query": 0.02,
        "tool_name_to_cost_per_query": {
            "search_documents": 0.02,
            "get_document": 0.01
        }
    }
}
```
