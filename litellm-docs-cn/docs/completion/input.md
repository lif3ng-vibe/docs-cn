import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 输入参数

## 通用参数
LiteLLM 在所有提供商处接受并转换 [OpenAI Chat Completion 参数](https://platform.openai.com/docs/api-reference/chat/create)。

### 用法
```python
import litellm

# set env variables
os.environ["OPENAI_API_KEY"] = "your-openai-key"

## SET MAX TOKENS - via completion() 
response = litellm.completion(
            model="{{openai_small}}",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            max_tokens=10
        )

print(response)
```

### 已转换的 OpenAI 参数

用这个函数可以查询任意模型与提供商组合当前支持的 OpenAI 参数列表。

```python
from litellm import get_supported_openai_params

response = get_supported_openai_params(model="anthropic.{{anthropic}}", custom_llm_provider="bedrock")

print(response) # ["max_tokens", "tools", "tool_choice", "stream"]
```

下表是 `litellm.get_supported_openai_params()` 对每行所示模型的输出结果。同一提供商内部不同模型的支持情况也有差异（例如 Bedrock 的 Llama 模型就不支持 `tools` 和 `tool_choice`），所以请对你实际使用的模型调用该函数确认。

`stream_options`、`extra_headers` 和 `max_retries` 不在此列表的检查范围内，所有提供商都会接受；且对所有提供商而言，`stream_options={"include_usage": True}` 都会在最后一个分块返回用量信息。

| 提供商 | 已检查的模型 | temperature | max_completion_tokens | max_tokens | top_p | stream | stop | n | presence_penalty | frequency_penalty | functions | function_call | logit_bias | user | response_format | seed | tools | tool_choice | logprobs | top_logprobs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Anthropic | `claude-sonnet-4-5-20250929` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |  |  |  |  |  | ✅ | ✅ |  | ✅ | ✅ |  |  |
| OpenAI | `gpt-4o` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Azure OpenAI | `gpt-4o` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| xAI | `grok-3` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |  | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Replicate | `meta/llama-2-70b-chat` | ✅ |  | ✅ | ✅ | ✅ | ✅ |  |  |  | ✅ | ✅ |  |  |  | ✅ | ✅ | ✅ |  |  |
| Anyscale | `meta-llama/Llama-2-70b-chat-hf` | ✅ |  | ✅ | ✅ | ✅ | ✅ |  | ✅ | ✅ |  |  |  |  |  |  |  |  |  |  |
| Cohere | `command-r` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |  |  |  |  | ✅ | ✅ | ✅ |  |  |
| Huggingface | `meta-llama/Llama-3.1-8B-Instruct` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Openrouter | `openai/gpt-4o` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI21 | `jamba-1.5-large` | ✅ | ✅ | ✅ |  | ✅ | ✅ | ✅ |  |  |  |  |  |  | ✅ | ✅ | ✅ | ✅ |  |  |
| VertexAI | `gemini-2.5-flash` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |  |  | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bedrock | `anthropic.claude-3-5-sonnet-20240620-v1:0` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |  |  |  |  |  |  | ✅ |  | ✅ | ✅ |  |  |
| Sagemaker | `jumpstart-dft-meta-textgeneration-llama-2-7b` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |  |  |  |  |  |  |  |  |  |  |  |
| TogetherAI | `meta-llama/Llama-3-70b-chat-hf` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sambanova | `Meta-Llama-3.1-8B-Instruct` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |  |  |  |  |  |  | ✅ |  |  |  |  |  |
| AlephAlpha | `luminous-base` | ✅ |  | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |  |  |  |  |  |  |  |  |  |
| NLP Cloud | `dolphin` | ✅ |  | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |  |  |  |  |  |  |  |  |  |
| Petals | `petals-team/StableBeluga2` | ✅ |  | ✅ | ✅ | ✅ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Ollama | `llama3` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |  | ✅ |  |  |  |  | ✅ | ✅ |  |  |  |  |
| Databricks | `databricks-dbrx-instruct` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |  |  |  |  |  | ✅ |  | ✅ | ✅ |  |  |
| ClarifAI | `openai.chat-completion.gpt-4o` | ✅ | ✅ | ✅ | ✅ | ✅ |  |  | ✅ | ✅ |  |  |  |  | ✅ |  | ✅ | ✅ |  |  |
| Github | `gpt-4o` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Novita AI | `meta-llama/llama-3-8b-instruct` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bytez | `google/gemma-3-1b-it` | ✅ | ✅ | ✅ | ✅ | ✅ |  | ✅ |  |  |  |  |  |  |  |  |  |  |  |  |
| OVHCloud AI Endpoints | `Meta-Llama-3_3-70B-Instruct` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

:::note

默认情况下，如果传入的 OpenAI 参数不受支持，LiteLLM 会抛出异常。

如果想改为丢弃该参数，可以设置 `litellm.drop_params = True` 或 `completion(..drop_params=True)`。

此举**只会丢弃不受支持的 OpenAI 参数**。

LiteLLM 会把任何非 OpenAI 参数视为提供商特有参数，并作为关键字参数（kwarg）直接放进请求体。

:::

## 输入参数

```python
def completion(
    model: str,
    messages: list = [],
    timeout: float | str | httpx.Timeout | None = None,
    temperature: float | None = None,
    top_p: float | None = None,
    n: int | None = None,
    stream: bool | None = None,
    stream_options: dict | None = None,
    stop=None,
    max_completion_tokens: int | None = None,
    max_tokens: int | None = None,
    modalities: list[ChatCompletionModality] | None = None,
    prediction: ChatCompletionPredictionContentParam | None = None,
    audio: ChatCompletionAudioParam | None = None,
    presence_penalty: float | None = None,
    frequency_penalty: float | None = None,
    logit_bias: dict | None = None,
    user: str | None = None,
    # openai v1.0+ new params
    reasoning_effort: Literal["none", "minimal", "low", "medium", "high", "xhigh", "max", "default"] | None = None,
    verbosity: Literal["low", "medium", "high"] | None = None,
    response_format: dict | type[BaseModel] | None = None,
    seed: int | None = None,
    tools: list | None = None,
    tool_choice: str | dict | None = None,
    logprobs: bool | None = None,
    top_logprobs: int | None = None,
    parallel_tool_calls: bool | None = None,
    web_search_options: OpenAIWebSearchOptions | None = None,
    include_server_side_tool_invocations: bool | None = None,
    deployment_id=None,
    extra_headers: dict | None = None,
    safety_identifier: str | None = None,
    service_tier: str | None = None,
    store: bool | None = None,
    prompt_cache_key: str | None = None,
    # soon to be deprecated params by OpenAI
    functions: list | None = None,
    function_call: str | None = None,
    # set api_base, api_version, api_key
    base_url: str | None = None,
    api_version: str | None = None,
    api_key: str | None = None,
    model_list: list | None = None,  # pass in a list of api_base,keys, etc.
    # Optional liteLLM function params
    thinking: AnthropicThinkingParam | None = None,
    # Session management
    shared_session: Optional["ClientSession"] = None,
    # Per-request JSON schema validation (overrides litellm.enable_json_schema_validation)
    enable_json_schema_validation: bool | None = None,
    **kwargs,
) -> ModelResponse | CustomStreamWrapper:
    ...
```
### 必填字段

- `model`: *string* - 要使用的模型 ID。哪些模型适用于 Chat API，请参考模型端点兼容性表。

- `messages`: *array* - 构成目前对话的消息列表。

#### `messages` 的属性
*注意* - 数组中的每条消息包含以下属性：

- `role`: *string* - 消息作者的角色，可以是 system、user、assistant、function 或 tool。

- `content`: *string or list[dict] or null* - 消息内容。所有消息都必须有该字段，但带函数调用的 assistant 消息可以为 null。

- `name`: *string (optional)* - 消息作者的名称。角色为 “function” 时必填。该名称应与 content 中表示的函数名一致，只能包含字母（a-z、A-Z）、数字（0-9）和下划线，最长 64 个字符。

- `function_call`: *object (optional)* - 由模型生成的、应当调用的函数名及其参数。

- `tool_call_id`: *str (optional)* - 本消息所响应的工具调用。


[**查看全部消息取值**](https://github.com/BerriAI/litellm/blob/main/litellm/types/llms/openai.py#L664)

#### 内容类型

`content` 可以是字符串（纯文本），也可以是内容块列表（多模态）：

| 类型 | 说明 | 文档 |
|------|-------------|------|
| `text` | 文本内容 | [类型定义](https://github.com/BerriAI/litellm/blob/main/litellm/types/llms/openai.py#L598) |
| `image_url` | 图像 | [视觉](./vision.md) |
| `input_audio` | 音频输入 | [音频](./audio.md) |
| `video_url` | 视频输入 | [类型定义](https://github.com/BerriAI/litellm/blob/main/litellm/types/llms/openai.py#L625) |
| `file` | 文件 | [文档理解](./document_understanding.md) |
| `document` | 文档/PDF | [文档理解](./document_understanding.md) |

**示例**
```python
# Text
messages=[{"role": "user", "content": [{"type": "text", "text": "Hello!"}]}]

# Image
messages=[{"role": "user", "content": [{"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}]}]

# Audio
messages=[{"role": "user", "content": [{"type": "input_audio", "input_audio": {"data": "<base64>", "format": "wav"}}]}]

# Video
messages=[{"role": "user", "content": [{"type": "video_url", "video_url": {"url": "https://example.com/video.mp4"}}]}]

# File
messages=[{"role": "user", "content": [{"type": "file", "file": {"file_id": "https://example.com/doc.pdf"}}]}]

# Document
messages=[{"role": "user", "content": [{"type": "document", "source": {"type": "text", "media_type": "application/pdf", "data": "<base64>"}}]}]

# Combining multiple types (multimodal)
messages=[{"role": "user", "content": [
    {"type": "text", "text": "Generate a product description based on this image"},
    {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
]}]
```

## 可选字段

- `temperature`: *number or null (optional)* - 采样温度，取值 0 到 2。较高的值（如 0.8）让输出更随机，较低的值（如 0.2）让输出更集中、更确定。

- `top_p`: *number or null (optional)* - 温度采样的替代方案，让模型只考虑概率质量排名靠前（占比 top_p）的 token。例如 0.1 表示只考虑累计概率占前 10% 的 token。

- `n`: *integer or null (optional)* - 为每条输入消息生成的对话补全选项数量。

- `stream`: *boolean or null (optional)* - 设为 true 时以增量方式发送消息。token 一经生成便会发出，最后以 [DONE] 消息结束流。

- `stream_options`: *dict or null (optional)* - 流式响应的选项。仅在 `stream: true` 时设置。

    - `include_usage` *boolean (optional)* - 设置后，会在 data: [DONE] 消息之前额外流式发送一个分块。该分块的 usage 字段显示整个请求的 token 用量统计，choices 字段始终为空数组；其余分块也会包含 usage 字段，但值为 null。

- `stop`: *string/ array/ null (optional)* - 最多 4 个停止序列，API 生成到这些序列时就会停止产出后续 token。

  **注意**：OpenAI 最多支持 4 个停止序列。如果传入超过 4 个，LiteLLM 会自动截断，只保留前 4 个元素。要禁用这一自动截断，请设置 `litellm.disable_stop_sequence_limit = True`。

- `max_completion_tokens`: *integer (optional)* - 一次补全可生成的 token 数上限，包括可见输出 token 和推理 token。

- `max_tokens`: *integer (optional)* - 对话补全中生成的最大 token 数。

- `presence_penalty`: *number or null (optional)* - 根据新 token 是否已在文本中出现来施加惩罚。

- `response_format`: *dict or Pydantic model class (optional)* - 指定响应格式。传入 Pydantic 模型类即可要求按 schema 输出；参见 [JSON 模式与结构化输出](./json_mode.md)。

    - 设为 `{ "type": "json_object" }` 可启用 JSON 模式，保证模型生成的消息是合法 JSON。

    - 重要：使用 JSON 模式时，还必须通过 system 或 user 消息自行指示模型生成 JSON。否则模型可能不停输出空白字符，直到生成触及 token 上限，导致请求长时间运行、看似“卡住”。另请注意，当 finish_reason="length" 时消息内容可能被部分截断——这表示生成超出了 max_tokens，或对话超出了最大上下文长度。

- `seed`: *integer or null (optional)* - 该功能处于 Beta 阶段。指定后系统会尽力做确定性采样，使相同 seed 和参数的重复请求返回相同结果。确定性并无保证，可通过响应中的 `system_fingerprint` 参数监控后端变化。

- `tools`: *array (optional)* - 模型可以调用的工具列表。用它提供一组函数，模型可为这些函数生成 JSON 输入。

    - `type`: *string* - 工具类型。可设为 "function" 或 "mcp"（与 `/responses` schema 一致），从而在 `/chat/completions` 中直接调用 LiteLLM 注册的 MCP（Model Context Protocol）服务器。

    - `function`: *object* - 函数类型工具必填。

- `tool_choice`: *string or dict (optional)* - 控制模型是否调用工具、调用哪个工具。可取 `none` 或 `auto`，也可传入一个字典指定具体工具。

    - 没有提供函数时默认为 `none`，有函数时默认为 `auto`。

- `parallel_tool_calls`: *boolean (optional)* - 工具使用期间是否启用并行函数调用。OpenAI 默认为 true。

- `frequency_penalty`: *number or null (optional)* - 根据新 token 在已有文本中出现的频率施加惩罚。

- `logit_bias`: *map (optional)* - 用于调整特定 token 出现在补全结果中的概率。

- `user`: *string (optional)* - 代表终端用户的唯一标识符，有助于 OpenAI 监控和检测滥用行为。

- `timeout`: *float, string, `httpx.Timeout` or null (optional)* - 请求超时时间，单位为秒。字符串形式可只写超时数值；用 `httpx.Timeout` 可分别配置各阶段的超时。

- `logprobs`: *bool (optional)* - 是否返回输出 token 的对数概率。为 true 时，消息内容中的每个输出 token 都会附带其对数概率。

- `top_logprobs`: *int (optional)* - 0 到 5 之间的整数，指定在每个 token 位置返回最可能的 token 数量，每个都附带相应的对数概率。使用该参数时必须把 `logprobs` 设为 true。

- `safety_identifier`: *string (optional)* - 用于追踪和管理安全相关请求的唯一标识符，有助于安全监控与合规追踪。

- `headers`: *dict (optional)* - 随请求一起发送的请求头字典。

- `extra_headers`: *dict (optional)* - `headers` 的替代写法，用于在 LLM API 请求中发送额外的请求头。

- `reasoning_effort`: *string or null (optional)* - 为受支持的模型设置推理力度，取值为 `none`、`minimal`、`low`、`medium`、`high`、`xhigh`、`max` 和 `default`。参见 [推理内容](../reasoning_content.md)。

- `verbosity`: *string or null (optional)* - 为受支持的 OpenAI GPT-5 系列模型设置输出详略程度，取值 `low`、`medium` 或 `high`。

- `thinking`: *object or null (optional)* - Anthropic 风格的思考配置。参见 [推理内容](../reasoning_content.md)。

- `modalities`: *array or null (optional)* - 请求的输出模态，例如文本和音频。参见 [音频](./audio.md)。

- `audio`: *object or null (optional)* - 音频输出设置，例如音色和格式。参见 [音频](./audio.md)。

- `prediction`: *object or null (optional)* - 预期输出内容。当响应的大部分可以预先知晓时能降低延迟。参见 [预测输出](./predict_outputs.md)。

- `web_search_options`: *object or null (optional)* - 受支持的内置联网搜索模型与端点的选项，例如搜索上下文大小。参见 [联网搜索](./web_search.md)。

- `include_server_side_tool_invocations`: *boolean or null (optional)* - 在受支持的 Gemini/Vertex 请求上设置 `toolConfig.includeServerSideToolInvocations`。

- `service_tier`: *string or null (optional)* - 在模型支持时请求相应的处理服务层级。

- `store`: *boolean or null (optional)* - 在提供商支持时，控制其是否保存响应。

- `prompt_cache_key`: *string or null (optional)* - OpenAI 提示词缓存的路由提示，适用于带有共享前缀的请求。参见 [提示词缓存](./prompt_caching.md)。

- `shared_session`: *aiohttp `ClientSession` or null (optional)* - 在多个异步 API 调用之间复用同一个会话。参见 [共享会话](./shared_session.md)。

- `enable_json_schema_validation`: *boolean or null (optional)* - 按请求开启或关闭“生成 JSON 是否符合所请求 schema”的校验，覆盖全局设置。参见 [JSON 模式与结构化输出](./json_mode.md)。

- `api_key`: *string or null (optional)* - 本次请求使用的提供商 API 密钥。

- `base_url`: *string or null (optional)* - 提供商 API 的基础 URL，是 `api_base` 的别名。

- `model_list`: *list or null (optional)* - 模型部署配置列表，用于筛选并调用与 `model` 匹配的部署。

#### 已弃用参数
- `functions`: *array* - 模型可用来生成 JSON 输入的函数列表。每个函数应包含以下属性：

    - `name`: *string* - 要调用的函数名。只能包含 a-z、A-Z、0-9、下划线和连字符，最长 64 个字符。

    - `description`: *string (optional)* - 说明该函数用途的描述，帮助模型决定何时以及如何调用该函数。

    - `parameters`: *object* - 函数接受的参数，以 JSON Schema 对象描述。

- `function_call`: *string or object (optional)* - 控制模型如何响应函数调用。


#### litellm 专属参数

- `api_base`: *string (optional)* - 调用模型时使用的 API 端点

- `api_version`: *string (optional)* - （Azure 专属）本次调用使用的 API 版本

- `num_retries`: *int (optional)* - 出现 APIError、TimeoutError 或 ServiceUnavailableError 时重试 API 调用的次数

- `context_window_fallback_dict`: *dict (optional)* - 因上下文窗口（context window）报错导致调用失败时改用的模型映射

- `fallbacks`: *list (optional)* - 初始调用失败时启用的备选模型名及参数（回退机制）

- `metadata`: *dict (optional)* - 调用时希望一并记录的附加数据（会发送给日志集成，如 PromptLayer，也可通过自定义回调函数访问）

- `custom_llm_provider`: *string (optional)* - 解析模型及其 API 配置时使用的提供商标识

- `drop_params`: *boolean (optional)* - 丢弃不受支持的 OpenAI 参数而不抛错。参见 [丢弃不支持的参数](./drop_params.md)。

- `additional_drop_params`: *list of strings (optional)* - 需要从请求中丢弃的 OpenAI 参数。参见 [丢弃不支持的参数](./drop_params.md)。

- `allowed_openai_params`: *list of strings (optional)* - 本次请求放行的 OpenAI 参数。参见 [丢弃不支持的参数](./drop_params.md)。

- `mock_response`: *string or response object (optional)* - 不调用模型，直接返回模拟的补全响应。参见 [模拟请求](./mock_requests.md)。

- `max_retries`: *integer (optional)* - API 调用的最大重试次数

- `ssl_verify`: *boolean or string (optional)* - 开启或关闭 SSL 校验，或指定自定义 CA 证书包路径。参见 [SSL 安全设置](../guides/security_settings.md)。

- `merge_reasoning_content_in_choices`: *boolean (optional)* - 针对流式响应，把 `reasoning_content` 包在 `<think>` 标签里并入 `content`，供期望在 content 中看到推理内容的客户端使用

- `prompt_id`: *string (optional)* - 传给提示词管理钩子的受管提示词 ID。参见 [提示词管理](../prompt_management.md)。

- `prompt_variables`: *dict (optional)* - 配置了提示词管理钩子时，用于填充受管提示词变量的取值。参见 [提示词管理](../prompt_management.md)。

- `litellm_system_prompt`: *string (optional)* - 把该提示词前置到第一条 system 消息；若不存在 system 消息，则在开头新增一条

- `base_model`: *string (optional)* - 底层模型名称，用于提供商侧的模型与参数配置。参见 [微调模型](../guides/finetuned_models.md)。

- `supports_system_message`: *boolean (optional)* - 模型不接受 system 角色消息时设为 false，LiteLLM 随后会改写这些消息

- `ensure_alternating_roles`: *boolean (optional)* - 必要时插入 user 或 assistant 续接消息，保证对话角色交替。参见 [消息清洗](./message_sanitization.md)。

- `user_continue_message`: *message object (optional)* - 角色交替需要 user 轮次时插入的自定义 user 消息。参见 [消息清洗](./message_sanitization.md)。

- `assistant_continue_message`: *message object (optional)* - 角色交替需要 assistant 轮次时插入的自定义 assistant 消息。参见 [消息清洗](./message_sanitization.md)。

- `cooldown_time`: *float (optional)* - 路由到的部署失败后，重试前的冷却时长（秒）

**自定义模型成本**
- `input_cost_per_token`: *float (optional)* - 补全调用中每个输入 token 的成本

- `output_cost_per_token`: *float (optional)* - 补全调用中每个输出 token 的成本

- `cost_per_second`: *float (optional)* - 按时长计费模型计算成本所用的每秒费率

- `input_cost_per_second`: *float (optional)* - 按时长计费模型计算成本所用的每秒输入费率

- `output_cost_per_second`: *float (optional)* - 按时长计费模型计算成本所用的每秒输出费率

**自定义提示词模板**（详见 [提示词格式化](./prompt_formatting.md#自行格式化提示词)）
- `initial_prompt_value`: *string (optional)* - 拼接在输入消息开头的初始字符串

- `roles`: *dict (optional)* - 指定如何根据 `messages` 传入的角色 + 消息来格式化提示词的字典。

- `final_prompt_value`: *string (optional)* - 拼接在输入消息末尾的收尾字符串

- `bos_token`: *string (optional)* - 序列开头的起始字符串

- `eos_token`: *string (optional)* - 序列末尾的结束字符串

- `hf_model_name`: *string (optional)* - [仅限 Sagemaker] 模型对应的 Hugging Face 名称，用于为模型拉取正确的对话模板。
