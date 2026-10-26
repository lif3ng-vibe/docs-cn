# 添加 OpenAI 兼容提供商

对于结构简单的 OpenAI 兼容提供商（如 Hyperbolic、Nscale 等），只需编辑一个 JSON 文件即可接入。

## 快速上手

1. 编辑 `litellm/llms/openai_like/providers.json`
2. 添加你的提供商配置
3. 用以下方式测试：`litellm.completion(model="your_provider/model-name", ...)`

## 基础配置

对于与 OpenAI 完全兼容的提供商：

```json
{
  "your_provider": {
    "base_url": "https://api.yourprovider.com/v1",
    "api_key_env": "YOUR_PROVIDER_API_KEY"
  }
}
```

就这么多，提供商现在已经可以使用了。

## 配置选项

### 必填字段

- `base_url`：API 端点（例如 `https://api.provider.com/v1`）
- `api_key_env`：存放 API 密钥的环境变量名（例如 `PROVIDER_API_KEY`）

### 可选字段

- `api_base_env`：用于覆盖 `base_url` 的环境变量
- `base_class`：可选 `"openai_gpt"`（默认）或 `"openai_like"`
- `param_mappings`：把 OpenAI 参数名映射为提供商专属的参数名
- `constraints`：参数取值限制（最小值/最大值）
- `special_handling`：特殊行为，例如内容格式转换

## 示例

### 简单提供商（完全兼容）

```json
{
  "hyperbolic": {
    "base_url": "https://api.hyperbolic.xyz/v1",
    "api_key_env": "HYPERBOLIC_API_KEY"
  }
}
```

### 带参数映射的提供商

```json
{
  "publicai": {
    "base_url": "https://api.publicai.co/v1",
    "api_key_env": "PUBLICAI_API_KEY",
    "param_mappings": {
      "max_completion_tokens": "max_tokens"
    }
  }
}
```

### 带取值限制的提供商

```json
{
  "custom_provider": {
    "base_url": "https://api.custom.com/v1",
    "api_key_env": "CUSTOM_API_KEY",
    "constraints": {
      "temperature_max": 1.0,
      "temperature_min": 0.0
    }
  }
}
```

## Responses API 支持

如果你的提供商还支持 OpenAI Responses API（`/v1/responses`），请添加 `supported_endpoints`：

```json
{
  "your_provider": {
    "base_url": "https://api.yourprovider.com/v1",
    "api_key_env": "YOUR_PROVIDER_API_KEY",
    "supported_endpoints": ["/v1/chat/completions", "/v1/responses"]
  }
}
```

这样无需任何额外代码即可启用 `litellm.responses()`：

```python
import litellm

response = litellm.responses(
    model="your_provider/model-name",
    input="Hello, what can you do?",
)
print(response.output)
```

省略 `supported_endpoints` 时，默认值为 `[]`。无论该字段如何设置，JSON 提供商的对话补全（chat completions）始终处于启用状态。

提供商直接继承 OpenAI Responses API 的全部请求/响应处理逻辑，因此流式（streaming）、工具调用以及所有标准参数无需额外代码即可工作。

## 使用方法

```python
import litellm
import os

# Set your API key
os.environ["YOUR_PROVIDER_API_KEY"] = "your-key-here"

# Chat completions
response = litellm.completion(
    model="your_provider/model-name",
    messages=[{"role": "user", "content": "Hello"}],
)

# Responses API (if supported_endpoints includes "/v1/responses")
response = litellm.responses(
    model="your_provider/model-name",
    input="Hello",
)
```

## 何时改用 Python

如果需要以下能力，请改用 Python 配置类：

- 自定义认证流程（OAuth、JWT 等）
- 复杂的请求/响应转换
- 提供商专属的流式处理逻辑
- 高级的工具调用改造

对于对话补全，在 `litellm/llms/your_provider/chat/transformation.py` 中创建一个继承自 `OpenAIGPTConfig` 或 `OpenAILikeChatConfig` 的配置类。

对于 Responses API，如果只需少量覆写，继承 `OpenAIResponsesAPIConfig` 并只覆盖需要的部分即可。极简示例见 `litellm/llms/perplexity/responses/transformation.py`（约 40 行，而完整实现要 400 多行）。

## 测试

对提供商进行测试：

```bash
# Quick test
python -c "
import litellm
import os
os.environ['PROVIDER_API_KEY'] = 'your-key'
response = litellm.completion(
    model='provider/model-name',
    messages=[{'role': 'user', 'content': 'test'}]
)
print(response.choices[0].message.content)
"
```

## 参考

更多示例可查看 `litellm/llms/openai_like/providers.json` 中已有的提供商。
