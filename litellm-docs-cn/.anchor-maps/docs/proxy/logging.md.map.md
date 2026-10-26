Logging | 日志 | 日志
Getting the LiteLLM Call ID | 获取 LiteLLM 调用 ID | 获取-litellm-调用-id
Logging Features | 日志功能 | 日志功能
Redact Messages, Response Content | 脱敏消息与响应内容 | 脱敏消息与响应内容
Redacting UserAPIKeyInfo | 脱敏 UserAPIKeyInfo | 脱敏-userapikeyinfo
Disable Message Redaction | 关闭消息脱敏 | 关闭消息脱敏
Turn off all tracking/logging | 关闭所有追踪与日志 | 关闭所有追踪与日志
✨ Dynamically Disable specific callbacks | ✨ 动态禁用指定回调 | -动态禁用指定回调
✨ Conditional Logging by Virtual Keys, Teams | ✨ 按虚拟密钥与团队条件启用日志 | -按虚拟密钥与团队条件启用日志
What gets logged? | 会记录哪些内容？ | 会记录哪些内容
Langfuse | Langfuse | langfuse
Logging Metadata to Langfuse | 将元数据记录到 Langfuse | 将元数据记录到-langfuse
Custom Tags | 自定义标签 | 自定义标签
LiteLLM Tags - `cache_hit`, `cache_key` | LiteLLM 标签 - `cache_hit` 与 `cache_key` | litellm-标签---cache_hit-与-cache_key
View POST sent from LiteLLM to provider | 查看 LiteLLM 发送给提供商的 POST 请求 | 查看-litellm-发送给提供商的-post-请求
OpenTelemetry | OpenTelemetry | opentelemetry
Quick Start - Log to Honeycomb | 快速上手 - 记录到 Honeycomb | 快速上手---记录到-honeycomb
Quick Start - Log to Traceloop | 快速上手 - 记录到 Traceloop | 快速上手---记录到-traceloop
Quick Start - Log to OTEL Collector | 快速上手 - 记录到 OTEL Collector | 快速上手---记录到-otel-collector
Quick Start - Log to OTEL GRPC Collector | 快速上手 - 记录到 OTEL GRPC Collector | 快速上手---记录到-otel-grpc-collector
Redacting Messages, Response Content | 脱敏消息与响应内容 | 脱敏消息与响应内容
Traceparent Header | Traceparent 头 | traceparent-头
Forwarding `Traceparent HTTP Header` to LLM APIs | 向 LLM API 转发 `Traceparent HTTP Header` | 向-llm-api-转发-traceparent-http-header
Google Cloud Storage Buckets | Google Cloud Storage 存储桶 | google-cloud-storage-存储桶
Usage | 用法 | 用法
Expected Logs on GCS Buckets | GCS 存储桶上的预期日志 | gcs-存储桶上的预期日志
Fields Logged on GCS Buckets | GCS 存储桶上记录的字段 | gcs-存储桶上记录的字段
Getting `service_account.json` from Google Cloud Console | 从 Google Cloud Console 获取 `service_account.json` | 从-google-cloud-console-获取-service_accountjson
Google Cloud Storage - PubSub Topic | Google Cloud Storage - PubSub 主题 | google-cloud-storage---pubsub-主题
Usage | 用法 | 用法
Deepeval | Deepeval | deepeval
Usage: | 用法 | 用法
s3 Buckets | s3 存储桶 | s3-存储桶
Hourly Folders | 按小时分文件夹 | 按小时分文件夹
Team Alias Prefix in Object Key | 对象键中的团队别名前缀 | 对象键中的团队别名前缀
Key Alias Prefix in Object Key | 对象键中的密钥别名前缀 | 对象键中的密钥别名前缀
AWS SQS | AWS SQS | aws-sqs
Azure Blob Storage | Azure Blob Storage | azure-blob-storage
Usage | 用法 | 用法
Expected Logs on Azure Data Lake Storage | Azure Data Lake Storage 上的预期日志 | azure-data-lake-storage-上的预期日志
Fields Logged on Azure Data Lake Storage | Azure Data Lake Storage 上记录的字段 | azure-data-lake-storage-上记录的字段
[Datadog](../observability/datadog) | [Datadog](../observability/datadog) | datadog
[Azure Sentinel](../observability/azure_sentinel) | [Azure Sentinel](../observability/azure_sentinel) | azure-sentinel
Lunary | Lunary | lunary
Step1: Install dependencies and set your environment variables | 第 1 步：安装依赖并设置环境变量 | 第-1-步安装依赖并设置环境变量
Step 2: Create a `config.yaml` and set `lunary` callbacks | 第 2 步：创建 `config.yaml` 并设置 `lunary` 回调 | 第-2-步创建-configyaml-并设置-lunary-回调
Step 3: Start the LiteLLM proxy | 第 3 步：启动 LiteLLM 代理 | 第-3-步启动-litellm-代理
Step 4: Make a request | 第 4 步：发起请求 | 第-4-步发起请求
MLflow | MLflow | mlflow
Custom Callback Class [Async] | 自定义回调类 [Async] | 自定义回调类-async
Step 1 - Create your custom `litellm` callback class | 第 1 步 - 创建你的自定义 `litellm` 回调类 | 第-1-步---创建你的自定义-litellm-回调类
Step 2 - Pass your custom callback class in `config.yaml` | 第 2 步 - 在 `config.yaml` 中传入你的自定义回调类 | 第-2-步---在-configyaml-中传入你的自定义回调类
Step 2b - Loading Custom Callbacks from S3/GCS (Alternative) | 第 2b 步 - 从 S3/GCS 加载自定义回调（替代方案） | 第-2b-步---从-s3gcs-加载自定义回调替代方案
Step 2c - Mounting Custom Callbacks in Helm/Kubernetes (Alternative) | 第 2c 步 - 在 Helm/Kubernetes 中挂载自定义回调（替代方案） | 第-2c-步---在-helmkubernetes-中挂载自定义回调替代方案
Step 3 - Start proxy + test request | 第 3 步 - 启动代理并发起测试请求 | 第-3-步---启动代理并发起测试请求
Resulting Log on Proxy | 代理上的日志结果 | 代理上的日志结果
Logging Proxy Request Object, Header, Url | 记录代理请求对象、请求头与 URL | 记录代理请求对象请求头与-url
Logging `model_info` set in config.yaml | 记录 config.yaml 中设置的 `model_info` | 记录-configyaml-中设置的-model_info
Logging responses from proxy | 记录代理返回的响应 | 记录代理返回的响应
Custom Callback APIs [Async] | 自定义回调 API [异步] | 自定义回调-api-异步
Usage | 用法 | 用法
Langsmith | Langsmith | langsmith
Arize AI | Arize AI | arize-ai
Langtrace | Langtrace | langtrace
Galileo | Galileo | galileo
Quick Start | 快速上手 | 快速上手
OpenMeter | OpenMeter | openmeter
Quick Start | 快速上手 | 快速上手
DynamoDB | DynamoDB | dynamodb
Data Logged to DynamoDB /chat/completions | 记录到 DynamoDB 的 /chat/completions 数据 | 记录到-dynamodb-的-chatcompletions-数据
Data logged to DynamoDB /embeddings | 记录到 DynamoDB 的 /embeddings 数据 | 记录到-dynamodb-的-embeddings-数据
Sentry | Sentry | sentry
Athina | Athina | athina
