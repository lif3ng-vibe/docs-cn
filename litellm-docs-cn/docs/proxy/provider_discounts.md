# 提供商折扣

可以针对特定提供商按百分比打折，适用于与提供商谈定企业协议价的场景。

## 在 LiteLLM 代理服务器中使用

**第 1 步：在 config.yaml 中添加折扣配置**

```yaml
# Apply 5% discount to all Vertex AI and Gemini costs
litellm_settings:
  cost_discount_config:
    vertex_ai: 0.05  # 5% discount
    gemini: 0.05     # 5% discount
    openrouter: 0.05 # 5% discount
    # openai: 0.10   # 10% discount (example)
```

**第 2 步：启动代理**

```bash
litellm /path/to/config.yaml
```

折扣会自动应用到已配置提供商的所有成本计算中。


## 折扣的计算方式

- 折扣在其他所有成本计算（token、缓存、工具等）**之后**才应用
- 折扣按百分比表示（0.05 = 5%，0.10 = 10%，以此类推）
- 折扣只对已配置的提供商生效
- 原始成本、折扣金额和最终成本都会记录在成本明细日志中
- 折扣信息会通过响应头返回：
  - `x-litellm-response-cost` - 折扣后的最终成本
  - `x-litellm-response-cost-original` - 折扣前的成本
  - `x-litellm-response-cost-discount-amount` - 折扣金额（美元）

## 支持的提供商

所有 LiteLLM 支持的提供商都可以设置折扣。常见示例：

- `vertex_ai` - Google Vertex AI
- `gemini` - Google Gemini
- `openai` - OpenAI
- `anthropic` - Anthropic
- `azure` - Azure OpenAI
- `bedrock` - AWS Bedrock
- `cohere` - Cohere
- `openrouter` - OpenRouter

完整提供商列表参见 [LlmProviders](https://github.com/BerriAI/litellm/blob/main/litellm/types/utils.py) 枚举。
