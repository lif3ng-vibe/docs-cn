Forward Client Headers to LLM API | 将客户端请求头转发给 LLM API | 将客户端请求头转发给-llm-api
Overview | 概述 | 概述
How it Works | 工作原理 | 工作原理
Header Allowlist Rules | 请求头白名单规则 | 请求头白名单规则
Additional Header Mechanisms | 其他请求头机制 | 其他请求头机制
Configuration | 配置 | 配置
Enable Globally | 全局启用 | 全局启用
Forward LLM Provider Authentication Headers | 转发 LLM 提供商认证请求头 | 转发-llm-提供商认证请求头
Configuration | 配置 | 配置
Which Headers Are Forwarded | 哪些请求头会被转发 | 哪些请求头会被转发
Use Case: Client-Side API Keys (BYOK) | 使用场景：客户端自带 API 密钥（BYOK） | 使用场景客户端自带-api-密钥byok
Example: Anthropic BYOK | 示例：Anthropic BYOK | 示例anthropic-byok
Example: Google AI Studio BYOK | 示例：Google AI Studio BYOK | 示例google-ai-studio-byok
Example: custom Anthropic-compatible `api_base` | 示例：自定义 Anthropic 兼容的 `api_base` | 示例自定义-anthropic-兼容的-api_base
Which key reaches the provider | 哪个密钥会送达提供商 | 哪个密钥会送达提供商
Security Considerations | 安全注意事项 | 安全注意事项
Backward Compatibility | 向后兼容 | 向后兼容
Enable for a Model Group | 针对模型组启用 | 针对模型组启用
Supported Model Patterns | 支持的模型匹配模式 | 支持的模型匹配模式
1. Exact Model Names | 1. 精确模型名 | 1-精确模型名
2. Wildcard Patterns | 2. 通配模式 | 2-通配模式
3. Team Model Aliases | 3. 团队模型别名 | 3-团队模型别名
Forwarded Headers | 被转发的请求头 | 被转发的请求头
Custom Headers (x- prefix) | 自定义请求头（x- 前缀） | 自定义请求头x--前缀
Provider-Specific Headers | 提供商特定请求头 | 提供商特定请求头
User Information Headers (Optional) | 用户信息头（可选） | 用户信息头可选
Security Considerations | 安全注意事项 | 安全注意事项
Example Use Cases | 使用场景示例 | 使用场景示例
1. Request Tracing | 1. 请求追踪 | 1-请求追踪
2. Custom Metadata | 2. 自定义元数据 | 2-自定义元数据
3. Anthropic Beta Features | 3. Anthropic Beta 功能 | 3-anthropic-beta-功能
Complete Configuration Example | 完整配置示例 | 完整配置示例
Testing Header Forwarding | 测试请求头转发 | 测试请求头转发
Troubleshooting | 故障排查 | 故障排查
Headers Not Being Forwarded | 请求头未被转发 | 请求头未被转发
Provider Errors | 提供商报错 | 提供商报错
Related Features | 相关功能 | 相关功能
API Reference | API 参考 | api-参考
