Config.yaml | Config.yaml | configyaml
Quick Start | 快速上手 | 快速上手
Step 2: Start Proxy with config | 第 2 步：用配置启动代理 | 第-2-步用配置启动代理
Step 3: Test it | 第 3 步：测试 | 第-3-步测试
config.yaml vs database settings | config.yaml 与数据库设置 | configyaml-与数据库设置
LLM configs `model_list` | LLM 配置 `model_list` | llm-配置-model_list
Model-specific params (API Base, Keys, Temperature, Max Tokens, Organization, Headers etc.) | 模型专属参数（API Base、密钥、Temperature、Max Tokens、Organization、Headers 等） | 模型专属参数api-base密钥temperaturemax-tokensorganizationheaders-等
Embedding Models - Use Sagemaker, Bedrock, Azure, OpenAI, XInference | 嵌入模型 - 支持 Sagemaker、Bedrock、Azure、OpenAI、XInference | 嵌入模型---支持sagemakerbedrockazureopenaixinference
Start Proxy | 启动代理 | 启动代理
Make Request | 发起请求 | 发起请求
Multiple OpenAI Organizations | 多个 OpenAI 组织 | 多个-openai-组织
Load Balancing | 负载均衡 | 负载均衡
Load API Keys / config values from Environment | 从环境变量加载 API 密钥 / 配置值 | 从环境变量加载-api-密钥--配置值
Centralized Credential Management | 集中管理凭据 | 集中管理凭据
Key Parameters | 关键参数 | 关键参数
Credential names are permanent | 凭据名称不可更改 | 凭据名称不可更改
Load API Keys from Secret Managers (Azure Vault, etc) | 从密钥管理器加载 API 密钥（Azure Vault 等） | 从密钥管理器加载-api-密钥azure-vault-等
Set Supported Environments for a model - `production`, `staging`, `development` | 为模型设置支持的运行环境 - `production`、`staging`、`development` | 为模型设置支持的运行环境---productionstagingdevelopment
Set Custom Prompt Templates | 设置自定义提示词模板 | 设置自定义提示词模板
Set custom tokenizer | 设置自定义分词器 | 设置自定义分词器
General Settings `general_settings` (DB Connection, etc) | 通用设置 `general_settings`（数据库连接等） | 通用设置-general_settings数据库连接等
Configure DB Pool Limits + Connection Timeouts | 配置数据库连接池上限与连接超时 | 配置数据库连接池上限与连接超时
Cap Idle DB Connections + Pass Extra Prisma URL Params | 限制空闲数据库连接并传递额外的 Prisma URL 参数 | 限制空闲数据库连接并传递额外的-prisma-url-参数
Bounding Statement and Lock Time | 限制语句执行与锁等待时间 | 限制语句执行与锁等待时间
Disable Server-Side Prepared Statements | 禁用服务端预编译语句 | 禁用服务端预编译语句
LiteLLM License Key (Enterprise) | LiteLLM 许可证密钥（企业版） | litellm-许可证密钥企业版
Extras | 其他配置 | 其他配置
Disable Swagger UI | 禁用 Swagger UI | 禁用-swagger-ui
Disable Redoc | 禁用 Redoc | 禁用-redoc
Disable OpenAPI schema | 禁用 OpenAPI schema | 禁用-openapi-schema
Restrict all API documentation for production/air-gapped deployments | 生产/隔离网络部署下禁用全部 API 文档 | 生产隔离网络部署下禁用全部-api-文档
Use CONFIG_FILE_PATH for proxy (Easier Azure container deployment) | 为代理使用 CONFIG_FILE_PATH（简化 Azure 容器部署） | 为代理使用-config_file_path简化-azure-容器部署
Providing LiteLLM config.yaml file as a s3, GCS Bucket Object/url | 以 S3、GCS 存储桶对象/URL 的形式提供 LiteLLM config.yaml | 以-s3gcs-存储桶对象url-的形式提供-litellm-configyaml
