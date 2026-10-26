import Image from '@theme/IdealImage';

# 自定义 LLM 定价

## 概述

LiteLLM 为所有 LLM 提供商提供灵活的成本追踪（cost tracking）与定价自定义能力：

- **自定义定价**：覆盖默认模型成本，或为自定义模型设置价格
- **按 Token 计费**：基于输入/输出 Token 追踪成本（最常用）
- **按秒计费**：基于运行时长追踪成本（例如 Sagemaker）
- **零成本模型**：将成本设为 0，让免费/自托管（on-premises）模型跳过预算检查
- **[提供商折扣](./provider_discounts.md)**：为特定提供商按百分比打折
- **[提供商加价](./provider_margins.md)**：在 LLM 成本上附加费用/加价，用于内部计费
- **基础模型映射**：确保 Azure 部署的成本追踪准确无误

默认情况下，请求成功后（同步与异步皆可），可以在日志对象中通过 `kwargs["response_cost"]` 拿到响应成本。[**了解更多**](../observability/custom_callback.md)

:::info

LiteLLM 的[模型成本表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)已收录 100 多个模型的价格。

:::

## 按秒计费（例如 Sagemaker）

对于对话补全、补全、嵌入与 responses 模型，设置 `cost_per_second`。LiteLLM 会将其乘以整个请求的持续时长（流式请求一直算到最后一个分片），并且在已配置按 Token 计价时忽略该值。

对于对话补全、补全、嵌入与 responses 接口，`input_cost_per_second` 和 `output_cost_per_second` 仍作为旧版别名被接受。优先级依次为 `cost_per_second`、`input_cost_per_second`、`output_cost_per_second`，最终解析出的费率只计收一次，不会叠加。语音转写、语音与视频则继续使用 `input_cost_per_second` 和 `output_cost_per_second`。

`cost_per_second` 需要 v1.105.0 及以上版本。更早的版本请使用 `input_cost_per_second`。

#### 在 LiteLLM 代理服务器中使用

**第 1 步：在 config.yaml 中添加定价**
```yaml
model_list:
  - model_name: sagemaker-completion-model
    litellm_params:
      model: sagemaker/berri-benchmarking-Llama-2-70b-chat-hf-4
    model_info:
      cost_per_second: 0.000420
  - model_name: sagemaker-embedding-model
    litellm_params:
      model: sagemaker/berri-benchmarking-gpt-j-6b-fp16
    model_info:
      cost_per_second: 0.000420
```

**第 2 步：启动代理**

```bash
litellm --config /path/to/config.yaml
```

**第 3 步：查看花费日志**

<Image img={require('../../img/spend_logs_table.png')} />

## 按 Token 计费（例如 Azure）

#### 在 LiteLLM 代理服务器中使用

```yaml
model_list:
  - model_name: azure-model
    litellm_params:
      model: azure/<your_deployment_name>
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
      api_version: os.environ/AZURE_API_VERSION
    model_info:
      input_cost_per_token: 0.000421 # 👈 ONLY to track cost per token
      output_cost_per_token: 0.000520 # 👈 ONLY to track cost per token
```

## 覆盖模型成本表

对于已映射的模型，你可以用自定义价格覆盖[我们的模型成本表](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)。

只需在配置中为你的模型添加 `model_info` 键，并覆盖需要的字段即可。

示例：为 `prod/{{anthropic}}` 模型覆盖 Anthropic 的模型成本表。

```yaml
model_list:
  - model_name: "prod/{{anthropic}}"
    litellm_params:
      model: "anthropic/{{anthropic}}"
      api_key: os.environ/ANTHROPIC_PROD_API_KEY
    model_info:
      input_cost_per_token: 0.000006
      output_cost_per_token: 0.00003
      cache_creation_input_token_cost: 0.0000075
      cache_read_input_token_cost: 0.0000006
```

### 其他成本键

还有一些其他键，可用于为不同场景与模态指定成本：

- `input_cost_per_token_above_200k_tokens` - 上下文超过 200k Token 时的输入 Token 成本
- `output_cost_per_token_above_200k_tokens` - 上下文超过 200k Token 时的输出 Token 成本  
- `cache_creation_input_token_cost_above_200k_tokens` - 大上下文场景的缓存写入成本
- `cache_read_input_token_cost_above_200k_tokens` - 大上下文场景的缓存读取成本
- `input_cost_per_image` - 多模态请求中每张图片的成本
- `output_cost_per_reasoning_token` - 推理 Token 的成本（例如 OpenAI o1 模型）
- `input_cost_per_audio_token` - 音频输入 Token 的成本
- `output_cost_per_audio_token` - 音频输出 Token 的成本
- `input_cost_per_video_per_second` - 视频输入每秒的成本
- `input_cost_per_video_per_second_above_128k_tokens` - 大上下文场景的视频成本
- `input_cost_per_character` - 部分提供商采用的按字符计价
- `input_cost_per_token_priority` / `output_cost_per_token_priority` - 优先级/PayGo 定价（Vertex AI Gemini、Bedrock）
- `input_cost_per_token_flex` / `output_cost_per_token_flex` - 批处理/弹性（flex）定价
- `ocr_cost_per_page` / `annotation_cost_per_page` - `/v1/ocr` 调用的按页定价（Mistral OCR）
- `ocr_cost_per_page_batches` / `annotation_cost_per_page_batches` - 经 `/v1/batches` 处理的 OCR 页面的按页定价；未设置时回退到同步按页键。参见 [批量 OCR 成本追踪](../providers/mistral_batches#batch-ocr-成本追踪)

这些键会随着新模型处理多模态的方式不断演进，最新版本见 [https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)。

### 服务层级与 PayGo 定价（Vertex AI 与 Bedrock）

对于支持多种定价层级的提供商（例如 Vertex AI PayGo、Bedrock 服务层级），LiteLLM 会根据响应自动套用正确的成本：

- **Vertex AI Gemini**：读取 `usageMetadata.trafficType`（`ON_DEMAND_PRIORITY` 对应 priority，`FLEX`/`BATCH` 对应 flex）。参见 [Vertex AI PayGo / 优先级成本追踪](../providers/vertex.md#paygo--优先级成本追踪)。
- **Bedrock**：读取响应中的 `serviceTier`。参见 [Bedrock 用量与服务层级](../providers/bedrock.md#用法---服务层级)。

## 零成本模型（跳过预算检查）

**适用场景**：你有一些自托管或免费模型，即使用户超出预算上限也应继续可用。

**解决方案** ✅：将 `input_cost_per_token` 和 `output_cost_per_token` 都显式设为 `0`，即可让该模型跳过所有预算检查。

:::info

模型配置为零成本后，LiteLLM 会自动跳过针对该模型请求的所有预算检查（用户、团队、团队成员、终端用户、组织以及全局代理预算）。

**重要**：两项成本都必须**显式设为 0**。如果成本是 `null` 或未定义，模型将被视为有成本，预算检查照常生效。

:::

### 配置示例

```yaml
model_list:
  # On-premises model - free to use
  - model_name: on-prem-llama
    litellm_params:
      model: ollama/llama3
      api_base: http://localhost:11434
    model_info:
      input_cost_per_token: 0   # 👈 Explicitly set to 0
      output_cost_per_token: 0  # 👈 Explicitly set to 0
  
  # Paid cloud model - budget checks apply
  - model_name: {{openai_large}}
    litellm_params:
      model: {{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
    # No model_info - uses default pricing from cost map
```

### 行为

在上述配置下：

- **用户超预算** → 仍可使用 `on-prem-llama` ✅，但无法使用 `{{openai_large}}` ❌
- **团队超预算** → 仍可使用 `on-prem-llama` ✅，但无法使用 `{{openai_large}}` ❌
- **终端用户超预算** → 仍可使用 `on-prem-llama` ✅，但无法使用 `{{openai_large}}` ❌

这样，免费/自托管模型不受预算约束影响、始终可用，而付费模型仍受到正常管控。

## 设置 base_model 以追踪成本（例如 Azure 部署）

**问题**：使用 `azure/gpt-4-1106-preview` 时，Azure 在响应中返回的却是 `gpt-4`，导致成本追踪不准确。

**解决方案** ✅：在配置中设置 `base_model`，让 LiteLLM 用正确的模型来计算 Azure 成本。

基础模型名称可从[这里](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)获取。

包含 `base_model` 的配置示例
```yaml
model_list:
  - model_name: azure-gpt-3.5
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
    model_info:
      base_model: azure/{{openai_large}}
```

### 带日期版本的 OpenAI 模型

当 OpenAI 在响应中返回带日期的模型名、与你配置的模型名不一致时，`base_model` 同样能派上用场。

**示例**：你为 `gpt-4o-mini-audio-preview` 配置了自定义定价，但 OpenAI 在响应中返回的是 `gpt-4o-mini-audio-preview-2024-12-17`。由于 LiteLLM 按响应中的模型名查找价格，你的自定义定价不会生效。

**解决方案** ✅：将 `base_model` 设为你希望 LiteLLM 查价时使用的键。

```yaml
model_list:
  - model_name: my-audio-model
    litellm_params:
      model: openai/gpt-4o-mini-audio-preview
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      base_model: gpt-4o-mini-audio-preview  # 👈 Used for pricing lookup
      input_cost_per_token: 0.0000006
      output_cost_per_token: 0.0000024
      input_cost_per_audio_token: 0.00001
      output_cost_per_audio_token: 0.00002
```


## 调试

如果自定义定价没有生效，或者你遇到了报错，请按以下几点排查：

1. 以 `LITELLM_LOG="DEBUG"` 或 `--detailed_debug` 命令行参数启动代理

```bash
litellm --config /path/to/config.yaml --detailed_debug
```

2. 检查日志中是否有这一行：

```
LiteLLM:DEBUG: utils.py:263 - litellm.acompletion
```

3. 检查 'input_cost_per_token' 与 'output_cost_per_token' 是否为 acompletion 函数的顶层键。

```bash
acompletion(
  ...,
  input_cost_per_token: my-custom-price, 
  output_cost_per_token: my-custom-price,
)
```

如果这些键不存在，LiteLLM 就不会使用你的自定义定价。

如果问题仍未解决，请到 [GitHub](https://github.com/BerriAI/litellm/issues) 提交 issue。
