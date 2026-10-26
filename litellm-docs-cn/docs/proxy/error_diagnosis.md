# 错误诊断：提供商还是网关

搞不清一个错误究竟来自 **LLM 提供商**（OpenAI、Anthropic 等），还是来自 **LiteLLM AI 网关**本身？下面教你如何区分。

完整的错误负载结构、状态码与错误类型参考，以及回退（fallback）耗尽时的行为，参见[错误参考](/docs/proxy/error_reference)。

## 快速判断

**只要错误信息中包含 `<Provider>Exception`，它就来自提供商**。

| 错误信息包含 | 错误来源 |
|----------------|--------------|
| `AnthropicException` | Anthropic |
| `OpenAIException` | OpenAI |
| `AzureException` | Azure |
| `BedrockException` | AWS Bedrock |
| `VertexAIException` | Google Vertex AI |
| 不含提供商名称 | LiteLLM AI 网关 |

## 示例

### 提供商错误（来自 AWS Bedrock）

```
{
  "error": {
    "message": "litellm.BadRequestError: BedrockException - {\"message\":\"The model returned the following errors: messages.1.content.0.type: Expected `thinking` or `redacted_thinking`, but found `text`.\"}",
    "type": "invalid_request_error",
    "param": null,
    "code": "400"
  }
}
```

这个错误来自 **AWS Bedrock**（注意 `BedrockException`）。Bedrock API 因消息格式非法而拒绝了请求，这不是 LiteLLM 的问题。

### 提供商错误（来自 OpenAI）

```
{
  "error": {
    "message": "litellm.AuthenticationError: OpenAIException - Incorrect API key provided: <my-key>. You can find your API key at https://platform.openai.com/account/api-keys.",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

这个错误来自 **OpenAI**（注意 `OpenAIException`）。LiteLLM 中配置的 OpenAI API 密钥无效。

### 提供商错误（来自 Anthropic）

```
{
  "error": {
    "message": "litellm.InternalServerError: AnthropicException - Overloaded. Handle with `litellm.InternalServerError`.",
    "type": "internal_server_error",
    "param": null,
    "code": "500"
  }
}
```

这个错误来自 **Anthropic**（注意 `AnthropicException`）。Anthropic API 过载了，这不是 LiteLLM 的问题。

### 网关错误（来自 LiteLLM）

```
{
  "error": {
    "message": "Invalid API Key. Please check your LiteLLM API key.",
    "type": "auth_error",
    "param": null,
    "code": "401"
  }
}
```

这个错误来自 **LiteLLM AI 网关**（不含提供商名称）。你的 LiteLLM 虚拟密钥（virtual key）无效。

## 该怎么办

| 错误来源 | 处理方式 |
|--------------|--------|
| 提供商错误 | 查看提供商的状态页、调整限流设置，或稍后重试 |
| 网关错误 | 检查你的 LiteLLM 配置与 API 密钥，或[提交 issue](https://github.com/BerriAI/litellm/issues) |

## 另请参阅

- [调试](/docs/proxy/debugging)：开启调试日志，查看详细的请求与响应信息
- [异常映射](/docs/exception_mapping)：LiteLLM 异常类型的完整列表
