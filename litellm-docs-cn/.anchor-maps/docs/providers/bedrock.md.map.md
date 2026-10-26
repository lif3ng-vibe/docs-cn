AWS Bedrock | AWS Bedrock | aws-bedrock
Authentication | 认证 | 认证
Usage | 用法 | 用法
LiteLLM Proxy Usage | LiteLLM 代理用法 | litellm-代理用法
1. Setup config.yaml | 1. 设置 config.yaml | 1-设置-configyaml
2. Start the proxy | 2. 启动代理 | 2-启动代理
3. Test it | 3. 测试 | 3-测试
Set temperature, top p, etc. | 设置 temperature、top p 等参数 | 设置-temperaturetop-p-等参数
Pass provider-specific params | 传递提供商特有参数 | 传递提供商特有参数
Usage - Request Metadata | 用法 - 请求元数据 | 用法---请求元数据
Usage - Function Calling / Tool calling | 用法 - 函数调用 / 工具调用 | 用法---函数调用--工具调用
Usage - Vision | 用法 - 视觉 | 用法---视觉
Usage - 'thinking' / 'reasoning content' | 用法 - “thinking” / 推理内容 | 用法---thinking--推理内容
Pass `thinking` to Anthropic models | 向 Anthropic 模型传递 `thinking` | 向-anthropic-模型传递-thinking
Usage - Bedrock search citations in `/chat/completions` | 用法 - `/chat/completions` 中的 Bedrock 搜索引用 | 用法---chatcompletions-中的-bedrock-搜索引用
Request shape | 请求结构 | 请求结构
What you get back | 返回结果 | 返回结果
Usage - Anthropic Beta Features | 用法 - Anthropic Beta 功能 | 用法---anthropic-beta-功能
Supported Beta Features | 支持的 Beta 功能 | 支持的-beta-功能
Eager Input Streaming for Tool Calls | 工具调用的即时输入流式 | 工具调用的即时输入流式
Usage - Structured Output / JSON mode | 用法 - 结构化输出 / JSON 模式 | 用法---结构化输出--json-模式
Usage - Latency Optimized Inference | 用法 - 延迟优化推理 | 用法---延迟优化推理
Usage - Service Tier | 用法 - 服务层级 | 用法---服务层级
OpenAI-compatible `service_tier` parameter | 兼容 OpenAI 的 `service_tier` 参数 | 兼容-openai-的-service_tier-参数
Native Bedrock `serviceTier` parameter | Bedrock 原生 `serviceTier` 参数 | bedrock-原生-servicetier-参数
Usage - Bedrock Guardrails | 用法 - Bedrock 防护栏 | 用法---bedrock-防护栏
Selective Content Moderation with `guarded_text` | 使用 `guarded_text` 进行选择性内容审核 | 使用-guarded_text-进行选择性内容审核
Usage - "Assistant Pre-fill" | 用法 - "助手预填" | 用法---助手预填
Example prompt sent to Claude | 发送给 Claude 的提示词示例 | 发送给-claude-的提示词示例
Usage - "System" messages | 用法 - "System" 消息 | 用法---system-消息
Example prompt sent to Claude | 发送给 Claude 的提示词示例 | 发送给-claude-的提示词示例
Usage - Streaming | 用法 - 流式 | 用法---流式
Example Streaming Output Chunk | 流式输出块示例 | 流式输出块示例
Cross-region inferencing | 跨区域推理 | 跨区域推理
1. Setup config.yaml | 1. 设置 config.yaml | 1-设置-configyaml
2. Start the proxy | 2. 启动代理 | 2-启动代理
3. Test it | 3. 测试 | 3-测试
Set 'converse' / 'invoke' route | 设置 `converse` / `invoke` 路由 | 设置-converse--invoke-路由
Native Chat Completions route | 原生 Chat Completions 路由 | 原生-chat-completions-路由
Alternate user/assistant messages | user/assistant 交替消息 | userassistant-交替消息
Usage - PDF / Document Understanding | 用法 - PDF / 文档理解 | 用法---pdf--文档理解
url | url | url
base64 | base64 | base64
OpenAI GPT OSS | OpenAI GPT OSS | openai-gpt-oss
OpenAI models on the native Responses API | 原生 Responses API 上的 OpenAI 模型 | 原生-responses-api-上的-openai-模型
TwelveLabs Pegasus - Video Understanding | TwelveLabs Pegasus - 视频理解 | twelvelabs-pegasus---视频理解
Supported Features | 支持的功能 | 支持的功能
Usage with S3 Video | S3 视频用法 | s3-视频用法
Usage with Base64 Video | 使用 Base64 视频 | 使用-base64-视频
Important Notes | 重要说明 | 重要说明
Provisioned throughput models | 预置吞吐量模型 | 预置吞吐量模型
Supported AWS Bedrock Models | 支持的 AWS Bedrock 模型 | 支持的-aws-bedrock-模型
Bedrock Embedding | Bedrock 嵌入 | bedrock-嵌入
API keys | API 密钥 | api-密钥
Usage | 用法 | 用法
Titan V2 - encoding_format support | Titan V2 的 encoding_format 支持 | titan-v2-的-encoding_format-支持
Supported AWS Bedrock Embedding Models | 支持的 AWS Bedrock 嵌入模型 | 支持的-aws-bedrock-嵌入模型
Advanced - Drop Unsupported Params | 进阶 - 丢弃不支持的参数 | 进阶---丢弃不支持的参数
Advanced - Pass model/provider-specific Params | 进阶 - 传入模型/提供商专属参数 | 进阶---传入模型提供商专属参数
Image Generation | 图像生成 | 图像生成
Rerank API | Rerank API | rerank-api
Bedrock Application Inference Profile | Bedrock 应用推理配置文件 | bedrock-应用推理配置文件
Set via `model_id` | 通过 `model_id` 设置 | 通过-model_id-设置
Boto3 - Authentication | Boto3 认证 | boto3-认证
Passing credentials as parameters - Completion() | 以参数形式传入凭证 - Completion() | 以参数形式传入凭证---completion
Passing extra headers + Custom API Endpoints | 传入额外请求头与自定义 API 端点 | 传入额外请求头与自定义-api-端点
SSO Login (AWS Profile) | 使用 AWS Profile 的 SSO 登录 | 使用-aws-profile-的-sso-登录
STS (Role-based Auth) | STS 基于角色的认证 | sts-基于角色的认证
Session tags | 会话标签 | 会话标签
IAM Roles Anywhere (On-Premise / External Workloads) | 适用于本地与外部工作负载的 IAM Roles Anywhere | 适用于本地与外部工作负载的-iam-roles-anywhere
Required AWS IAM Policy for AssumeRole | AssumeRole 所需的 AWS IAM 策略 | assumerole-所需的-aws-iam-策略
Example IAM Policy | IAM 策略示例 | iam-策略示例
Trust policy for session tags | 会话标签的信任策略 | 会话标签的信任策略
Passing an external BedrockRuntime.Client as a parameter - Completion() | 以参数形式传入外部 BedrockRuntime.Client - Completion() | 以参数形式传入外部-bedrockruntimeclient---completion
Calling via Internal Proxy (not bedrock url compatible) | 通过内部代理调用（不兼容 bedrock URL） | 通过内部代理调用不兼容-bedrock-url
