VertexAI [Gemini] | VertexAI [Gemini] | vertexai-gemini
Overview | 概览 | 概览
`vertex_ai/` route | `vertex_ai/` 路由 | vertex_ai-路由
**System Message** | **系统消息** | 系统消息
**Function Calling** | **函数调用** | 函数调用
**JSON Schema** | **JSON Schema** | json-schema
**Google Hosted Tools (Web Search, Code Execution, etc.)** | **Google 托管工具（网页搜索、代码执行等）** | google-托管工具网页搜索代码执行等
**Web Search** | **网页搜索** | 网页搜索
**Url Context** | **URL 上下文** | url-上下文
**Enterprise Web Search** | **企业版网页搜索** | 企业版网页搜索
**Code Execution** | **代码执行** | 代码执行
**Google Maps** | **Google Maps** | google-maps
**Moving from Vertex AI SDK to LiteLLM (GROUNDING)** | **从 Vertex AI SDK 迁移到 LiteLLM（GROUNDING）** | 从-vertex-ai-sdk-迁移到-litellmgrounding
**Thinking / `reasoning_content`** | **思考 / `reasoning_content`** | 思考--reasoning_content
Pass `thinking` to Gemini models | 向 Gemini 模型传递 `thinking` 参数 | 向-gemini-模型传递-thinking-参数
**Context Caching** | **上下文缓存** | 上下文缓存
Unified Endpoint | 统一端点 | 统一端点
Example usage | 用法示例 | 用法示例
Calling provider api directly | 直接调用提供商 API | 直接调用提供商-api
1. Create the Cache | 1. 创建缓存 | 1-创建缓存
2. Get the Cache Name from the Response | 2. 从响应中获取缓存名称 | 2-从响应中获取缓存名称
3. Use the Cached Content | 3. 使用缓存内容 | 3-使用缓存内容
Pre-requisites | 前置条件 | 前置条件
Sample Usage | 使用示例 | 使用示例
Usage with LiteLLM Proxy Server | 在 LiteLLM 代理服务器中使用 | 在-litellm-代理服务器中使用
Authentication - vertex_project, vertex_location, etc. | 认证：vertex_project、vertex_location 等 | 认证vertex_projectvertex_location-等
**Dynamic Params** | **动态参数** | 动态参数
**Workload Identity Federation** | **工作负载身份联合（Workload Identity Federation）** | 工作负载身份联合workload-identity-federation
Explicit AWS Credentials for WIF | 为 WIF 显式指定 AWS 凭证 | 为-wif-显式指定-aws-凭证
**Environment Variables** | **环境变量** | 环境变量
Specifying Safety Settings | 指定安全设置 | 指定安全设置
Set per model/request | 按模型或请求设置 | 按模型或请求设置
Set Globally | 全局设置 | 全局设置
Set Vertex Project & Vertex Location | 设置 Vertex Project 与 Vertex Location | 设置-vertex-project-与-vertex-location
Gemini Pro | Gemini Pro | gemini-pro
PayGo / Priority Cost Tracking | PayGo / 优先级成本追踪 | paygo--优先级成本追踪
Private Service Connect (PSC) Endpoints | Private Service Connect（PSC）端点 | private-service-connectpsc端点
Usage | 用法 | 用法
Configuration | 配置 | 配置
Fine-tuned Models | 微调模型 | 微调模型
Gemini Pro Vision | Gemini Pro Vision | gemini-pro-vision
Using Gemini Pro Vision | 使用 Gemini Pro Vision | 使用-gemini-pro-vision
Usage - Function Calling | 用法 - 函数调用 | 用法---函数调用
Media Resolution Control (Images & Videos) | 媒体分辨率控制（图片与视频） | 媒体分辨率控制图片与视频
Video Metadata Control | 视频元数据控制 | 视频元数据控制
Usage - PDF / Videos / Audio etc. Files | 用法 - PDF / 视频 / 音频等文件 | 用法---pdf--视频--音频等文件
Using `gs://` or any URL | 使用 `gs://` 或任意 URL | 使用-gs-或任意-url
using base64 | 使用 base64 | 使用-base64
Legacy PaLM 2 and Gemini 1.x Models | 旧版 PaLM 2 与 Gemini 1.x 模型 | 旧版-palm-2-与-gemini-1x-模型
Embedding Models | 嵌入模型 | 嵌入模型
Usage - Embedding | 嵌入用法 | 嵌入用法
Supported Embedding Models | 支持的嵌入模型 | 支持的嵌入模型
Supported OpenAI (Unified) Params | 支持的 OpenAI（统一）参数 | 支持的-openai统一参数
Usage with OpenAI (Unified) Params | 结合 OpenAI（统一）参数使用 | 结合-openai统一参数使用
Supported Vertex Specific Params | 支持的 Vertex 专属参数 | 支持的-vertex-专属参数
Usage with Vertex Specific Params  (Use `task_type` and `title`) | 使用 Vertex 专属参数（指定 `task_type` 和 `title`） | 使用-vertex-专属参数指定-task_type-和-title
Multi-Modal Embeddings | 多模态嵌入 | 多模态嵌入
Usage | 用法 | 用法
Text + Image + Video Embeddings | 文本 + 图片 + 视频嵌入 | 文本--图片--视频嵌入
Fine Tuning APIs | 微调 API | 微调-api
Usage | 用法 | 用法
1. Add `finetune_settings` to your config.yaml | 1. 在 config.yaml 中添加 `finetune_settings` | 1-在-configyaml-中添加-finetune_settings
2. Create a Fine Tuning Job | 2. 创建微调任务 | 2-创建微调任务
Labels | 标签 | 标签
Usage | 用法 | 用法
Extra | 补充 | 补充
Using `GOOGLE_APPLICATION_CREDENTIALS` | 使用 `GOOGLE_APPLICATION_CREDENTIALS` | 使用-google_application_credentials
Using GCP Service Account | 使用 GCP 服务账号 | 使用-gcp-服务账号
Rerank API | Rerank API | rerank-api
Setup | 设置 | 设置
Usage | 用法 | 用法
Parameters | 参数 | 参数
Supported Models | 支持的模型 | 支持的模型
Proxy Usage | 代理用法 | 代理用法
