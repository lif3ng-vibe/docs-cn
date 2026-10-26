# LiteLLM 文档汉化术语表

> 翻译与终检的唯一术语依据。子代理必须全文遵守；「不译」名单中的词保持原样。
> 排版：中文全角标点（，。：；？！、（）""——）；中英文/数字之间一个半角空格；引号用 ""，不用「」；破折号——不带空格。
> 粗体闭合（CommonMark 坑）：句读移出粗体（`**……。**后文` ✗ → `**……**。后文` ✓）；括注移出粗体（`**词（gloss）**后文` ✗ → `**词**（gloss）后文` ✓）。

## 核心术语

| 英文 | 中文 |
|---|---|
| LLM gateway / AI gateway | LLM 网关 / AI 网关 |
| proxy / Proxy Server | 代理 / LiteLLM 代理服务器（组件名 Proxy 可保留） |
| router / Router | 路由器（组件名 Router 可保留） |
| SDK | SDK |
| completion | 补全（chat completion → 对话补全；API 名 `completion()` 不译） |
| embedding | 嵌入 |
| provider | 提供商 |
| deployment | 部署（Router 语境：一份模型部署配置） |
| model group | 模型组 |
| model alias | 模型别名 |
| wildcard routing | 通配路由 |
| fallback / fallbacks | 回退 / 回退机制 |
| retry / retries | 重试 |
| timeout | 超时 |
| cooldown | 冷却 |
| allowed fails | 允许失败次数 |
| load balancing | 负载均衡 |
| latency-based routing | 基于延迟的路由 |
| least-busy routing | 最少占用路由 |
| usage-based routing | 基于用量的路由 |
| virtual key | 虚拟密钥 |
| master key | 主密钥 |
| API key | API 密钥 |
| budget | 预算 |
| spend tracking | 花费追踪 |
| cost tracking | 成本追踪 |
| usage tracking | 用量统计 |
| quota | 配额 |
| rate limit / rate limiting | 速率限制 / 限流 |
| RPM / TPM | RPM / TPM（首现可注：每分钟请求数 / 每分钟 Token 数） |
| guardrails | 防护栏 |
| prompt injection | 提示注入 |
| PII | PII（首现可注：个人身份信息） |
| secret managers | 密钥管理器 |
| observability | 可观测性 |
| tracing / trace | 追踪 / 追踪记录 |
| logging / callback | 日志 / 回调 |
| caching | 缓存 |
| semantic caching | 语义缓存 |
| response caching | 响应缓存 |
| streaming | 流式 |
| function calling | 函数调用 |
| tool use / tool calling | 工具调用 |
| structured output | 结构化输出 |
| JSON mode | JSON 模式 |
| prompt / system prompt | 提示词 / 系统提示词 |
| prompt template | 提示词模板 |
| context window | 上下文窗口 |
| inference | 推理 |
| fine-tuning | 微调 |
| batch / Batch API | 批处理 / Batch API |
| moderation | 内容审核 |
| rerank | 重排序（API 名 `rerank` 不译） |
| audio transcription | 语音转写 |
| text-to-speech (TTS) | 文本转语音（TTS） |
| realtime | 实时 |
| passthrough / pass-through | 透传 |
| MCP (Model Context Protocol) | MCP（首现注：Model Context Protocol） |
| A2A (Agent-to-Agent) | A2A（首现注：Agent-to-Agent） |
| admin UI / Admin UI | 管理界面（Admin UI） |
| dashboard | 仪表板 |
| endpoint | 端点 |
| environment variable | 环境变量 |
| metadata | 元数据 |
| payload | 负载 |
| request tagging | 请求标记 |
| connection pool | 连接池 |
| team / organization | 团队 / 组织 |
| SSO | SSO（单点登录） |
| self-hosted | 自托管 |
| enterprise | 企业版 |
| open source | 开源 |
| quickstart | 快速上手 |
| getting started | 入门 |
| tutorial | 教程 |
| troubleshooting | 故障排查 |

## 不译名单（产品/工具/协议/专有名）

LiteLLM、OpenAI、Anthropic、Claude、Gemini、Vertex AI、Bedrock、Azure、Azure OpenAI、SageMaker、Groq、Mistral、Cohere、Ollama、vLLM、Together AI、Fireworks AI、DeepSeek、Qwen、xAI、Grok、Hugging Face、Llama、NVIDIA、Triton、Langfuse、LangSmith、Langtrace、Helicone、Arize、Phoenix、Braintrust、OpenTelemetry、OTEL、Prometheus、Grafana、Datadog、New Relic、Sentry、Supabase、Lunary、Langfuse、PromptLayer、W&B、Weights & Biases、Pinecone、Qdrant、Weaviate、Milvus、pgvector、MongoDB、Redis、PostgreSQL、SQLite、Prisma、Docker、Kubernetes、K8s、Helm、Terraform、GitHub、GitHub Actions、FastAPI、Uvicorn、Pydantic、Python、Node.js、npm、pip、uv、poetry、OpenAPI、Swagger、JSON、YAML、TOML、JWT、OIDC、SAML、OAuth 2.0、SSO、AWS、GCP、S3、Secret Manager、GCS、Cloudflare、Vercel、Railway、Render、LangChain、LlamaIndex、Cursor、Claude Code、Codex、Aider、Cline、Roo Code、Crisp、PostHog、Vega、Mermaid、Router、Proxy、Admin UI、UI、CLI、API、SDK、Docker Compose

## 首现附英文原则

核心术语在每页**首次出现**时附英文原词，如「虚拟密钥（virtual key）」「防护栏（guardrails）」；同页后文直接用中文。产品名、代码、参数永不附译。

## 翻译纪律（子代理红线）

1. **不动**：代码块与行内代码、`{{role}}` 占位符、import 语句、JSX 标签与组件属性名、admonition 标记（`:::tip` 等）、链接路径、frontmatter 的 `id`/`slug`、显式 `{#锚点}`。
2. **要译**：frontmatter `title`/`description`/`sidebar_label`、正文散文、表格表头与说明列、admonition 内容与 `[自定义标题]`、链接文字、组件 props 中的**可见字符串**（如 `label="..."`、`title="..."`）、`#` 引导的 CLI 清单注释。
3. **不译**：代码注释（`#` 外语境）、表格中的 Method/命令/取值/默认值列、报错原文、工具输出。
4. 链接只译文字不译路径；跨页锚点链接（`xxx.md#anchor`）路径与锚点**原样保留**，由锚点回修阶段统一处理。
5. 一个文件一次回复译完；译文风格：意译、无翻译腔、句子通顺优先于逐词对应。
