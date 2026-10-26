---
title: "添加模型价格与上下文窗口"
---

要为某个模型添加价格或上下文窗口（context window）信息，只需向下面这个文件提交 PR：

**[model_prices_and_context_window.json](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)**

### 规格示例

下面是包含全部可用字段的完整规格：

```json
{
    "sample_spec": {
        "aliases": ["optional list of alternate names for this model, e.g. dated versions like sample_spec-20250101"],
        "code_interpreter_cost_per_session": 0.0,
        "computer_use_input_cost_per_1k_tokens": 0.0,
        "computer_use_output_cost_per_1k_tokens": 0.0,
        "deprecation_date": "date when the model becomes deprecated in the format YYYY-MM-DD",
        "file_search_cost_per_1k_calls": 0.0,
        "file_search_cost_per_gb_per_day": 0.0,
        "input_cost_per_audio_token": 0.0,
        "input_cost_per_token": 0.0,
        "litellm_provider": "one of https://docs.litellm.ai/docs/providers",
        "max_input_tokens": "max input tokens, if the provider specifies it. if not default to max_tokens",
        "max_output_tokens": "max output tokens, if the provider specifies it. if not default to max_tokens",
        "max_tokens": "LEGACY parameter. set to max_output_tokens if provider specifies it. IF not set to max_input_tokens, if provider specifies it.",
        "mode": "one of: chat, embedding, completion, image_generation, audio_transcription, audio_speech, image_generation, moderation, rerank, search",
        "output_cost_per_reasoning_token": 0.0,
        "output_cost_per_token": 0.0,
        "search_context_cost_per_query": {
            "search_context_size_high": 0.0,
            "search_context_size_low": 0.0,
            "search_context_size_medium": 0.0
        },
        "supported_regions": [
            "global",
            "us-west-2",
            "eu-west-1",
            "ap-southeast-1",
            "ap-northeast-1"
        ],
        "supports_audio_input": true,
        "supports_audio_output": true,
        "supports_function_calling": true,
        "supports_parallel_function_calling": true,
        "supports_prompt_caching": true,
        "supports_reasoning": true,
        "supports_response_schema": true,
        "supports_system_messages": true,
        "supports_vision": true,
        "supports_web_search": true,
        "vector_store_cost_per_gb_per_day": 0.0
    }
}
```

### 批处理价格键

如果条目带有 `*_batches` 键，Batch API 的请求行就按这些键计费；不带这些键的条目按标准费率的一半计费。

| 键 | 计费对象 |
| --- | --- |
| `input_cost_per_token_batches` | 提示词 Token |
| `output_cost_per_token_batches` | 补全 Token |
| `cache_read_input_token_cost_batches` | 缓存的提示词 Token |
| `cache_creation_input_token_cost_batches` | 缓存写入 Token |
| `input_cost_per_token_above_272k_tokens_batches` | 提示词 Token，提示词超过 272K |
| `output_cost_per_token_above_272k_tokens_batches` | 补全 Token，提示词超过 272K |
| `cache_read_input_token_cost_above_272k_tokens_batches` | 缓存的提示词 Token，提示词超过 272K |
| `cache_creation_input_token_cost_above_272k_tokens_batches` | 缓存写入 Token，提示词超过 272K |

`above_272k` 这组键适用于提示词超过 272K Token 的批处理行；272K 正是 OpenAI 计费时采用的长上下文阈值。条目缺少的任何分层键，都会按同类型 Token 的平价 `*_batches` 费率回退计费。

### 示例

#### Anthropic Claude

```json
{
    "claude-3-5-haiku-20241022": {
        "cache_creation_input_token_cost": 1e-06,
        "cache_creation_input_token_cost_above_1hr": 6e-06,
        "cache_read_input_token_cost": 8e-08,
        "deprecation_date": "2025-10-01",
        "input_cost_per_token": 8e-07,
        "litellm_provider": "anthropic",
        "max_input_tokens": 200000,
        "max_output_tokens": 8192,
        "max_tokens": 8192,
        "mode": "chat",
        "output_cost_per_token": 4e-06,
        "search_context_cost_per_query": {
            "search_context_size_high": 0.01,
            "search_context_size_low": 0.01,
            "search_context_size_medium": 0.01
        },
        "supports_assistant_prefill": true,
        "supports_function_calling": true,
        "supports_pdf_input": true,
        "supports_prompt_caching": true,
        "supports_vision": true
    }
}
```

#### Vertex AI Gemini

```json
{
    "vertex_ai/gemini-3-pro-preview": {
        "cache_read_input_token_cost": 2e-07,
        "cache_read_input_token_cost_above_200k_tokens": 4e-07,
        "cache_creation_input_token_cost_above_200k_tokens": 2.5e-07,
        "input_cost_per_token": 2e-06,
        "input_cost_per_token_above_200k_tokens": 4e-06,
        "input_cost_per_token_batches": 1e-06,
        "litellm_provider": "vertex_ai",
        "max_audio_length_hours": 8.4,
        "max_audio_per_prompt": 1,
        "max_images_per_prompt": 3000,
        "max_input_tokens": 1048576,
        "max_output_tokens": 65535,
        "max_pdf_size_mb": 30,
        "max_tokens": 65535,
        "max_video_length": 1,
        "max_videos_per_prompt": 10,
        "mode": "chat",
        "output_cost_per_token": 1.2e-05,
        "output_cost_per_token_above_200k_tokens": 1.8e-05,
        "output_cost_per_token_batches": 6e-06,
        "supports_function_calling": true,
        "supports_parallel_function_calling": true,
        "supports_prompt_caching": true,
        "supports_system_messages": true,
        "supports_vision": true
    }
}
```

### 使用别名

很多提供商（provider）会用多个名称发布同一个模型，例如一个 `latest` 标签，以及 `claude-sonnet-4-5-20250929` 这样带日期的版本。与其复制整份条目，不如使用 `aliases` 字段：

```json
{
    "claude-sonnet-4-5": {
        "aliases": ["claude-sonnet-4-5-20250929"],
        "input_cost_per_token": 3e-06,
        "output_cost_per_token": 1.5e-05,
        "litellm_provider": "anthropic",
        "max_input_tokens": 200000,
        "max_output_tokens": 64000,
        "mode": "chat",
        "supports_function_calling": true,
        "supports_tool_choice": true
    }
}
```

加载时，每个别名都会展开成一个与原条目共享同一份数据的顶层条目。上面的示例会让 `claude-sonnet-4-5` 和 `claude-sonnet-4-5-20250929` 都以相同的价格和能力被解析。

:::info
这与 [`model_alias_map`](../completion/model_alias.md) 不同：后者是 SDK/代理在运行时把用户侧模型名映射为 LiteLLM 模型标识符的功能。这里的 `aliases` 字段只作用于模型价格 JSON，用来避免价格与能力完全相同的模型产生重复条目。
:::
