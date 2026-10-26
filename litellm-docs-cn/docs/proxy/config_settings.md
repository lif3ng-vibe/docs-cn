
```yaml
environment_variables: {}

model_list:
  - model_name: string
    litellm_params: {}
    model_info:
      id: string
      mode: embedding
      input_cost_per_token: 0
      output_cost_per_token: 0
      max_tokens: 2048
      base_model: {{openai_large}}
      additionalProp1: {}

litellm_settings:
  # Logging/Callback settings
  success_callback: ["langfuse"]  # list of success callbacks
  failure_callback: ["sentry"]  # list of failure callbacks
  callbacks: ["otel"]  # list of callbacks - runs on success and failure
  service_callback: ["datadog", "prometheus"]  # logs redis, postgres failures on datadog, prometheus
  turn_off_message_logging: boolean  # prevent the messages and responses from being logged to on your callbacks, but request metadata will still be logged. Useful for privacy/compliance when handling sensitive data.
  redact_user_api_key_info: boolean  # Redact information about the user api key (hashed token, user_id, team id, etc.), from logs. Currently supported for Langfuse, OpenTelemetry, Logfire, ArizeAI logging.
  langfuse_default_tags: ["cache_hit", "cache_key", "proxy_base_url", "user_api_key_alias", "user_api_key_user_id", "user_api_key_user_email", "user_api_key_team_alias", "semantic-similarity", "proxy_base_url"] # default tags for Langfuse Logging
  langfuse_enable_update_trace_keys: boolean  # allow callers to copy named request metadata onto an existing Langfuse trace.
  # Networking settings
  request_timeout: 10 # (int) llm requesttimeout in seconds. Raise Timeout error if call takes longer than 10s. Sets litellm.request_timeout
  force_ipv4: boolean # If true, litellm will force ipv4 for all LLM requests. Some users have seen httpx ConnectionError when using ipv6 + Anthropic API. HTTP(S)_PROXY / NO_PROXY are still honored

  # Cost tracking settings
  cost_discount_config:
    vertex_ai: 0.05 # Apply a 5% discount to Vertex AI costs
    gemini: 0.05 # Apply a 5% discount to Gemini costs
  cost_margin_config:
    global: 0.05 # Apply a 5% margin to all providers
    openai: 0.10 # Apply a 10% margin to OpenAI costs
  
  # Debugging - see debugging docs for more options
  # Use `--debug` or `--detailed_debug` CLI flags, or set LITELLM_LOG env var to "INFO", "DEBUG", or "ERROR"
  json_logs: boolean # if true, logs will be in json format
  request_correlation_in_logs: boolean # if true, stamps every log line with the request's trace_id and session_id

  # Fallbacks, reliability
  default_fallbacks: ["claude-opus"] # set default_fallbacks, in case a specific model group is misconfigured / bad.
  content_policy_fallbacks: [{ "gpt-3.5-turbo-small": ["claude-opus"] }] # fallbacks for ContentPolicyErrors
  context_window_fallbacks: [{ "gpt-3.5-turbo-small": ["gpt-3.5-turbo-large", "claude-opus"] }] # fallbacks for ContextWindowExceededErrors

  # MCP Aliases - Map aliases to MCP server names for easier tool access
  mcp_aliases: {
      "github": "github_mcp_server",
      "zapier": "zapier_mcp_server",
      "deepwiki": "deepwiki_mcp_server",
    } # Maps friendly aliases to MCP server names. Only the first alias for each server is used

  # Caching settings
  cache: true
  cache_params: # set cache params for redis
    type: redis # type of cache to initialize (options: "local", "redis", "s3", "gcs")

    # Optional - Redis Settings
    host: "localhost" # The host address for the Redis cache. Required if type is "redis".
    port: 6379 # The port number for the Redis cache. Required if type is "redis".
    password: "your_password" # The password for the Redis cache. Required if type is "redis".
    namespace: "litellm.caching.caching" # namespace for redis cache
    max_connections: 100  # [OPTIONAL] Set Maximum number of Redis connections. Passed directly to redis-py. 
    # Optional - Redis Cluster Settings
    redis_startup_nodes: [{ "host": "127.0.0.1", "port": "7001" }]

    # Optional - Redis Sentinel Settings
    service_name: "mymaster"
    sentinel_nodes: [["localhost", 26379]]

    # Optional - GCP IAM Authentication for Redis
    gcp_service_account: "projects/-/serviceAccounts/your-sa@project.iam.gserviceaccount.com" # GCP service account for IAM authentication
    gcp_ssl_ca_certs: "./server-ca.pem" # Path to SSL CA certificate file for GCP Memorystore Redis
    ssl: true # Enable SSL for secure connections
    ssl_cert_reqs: null # Set to null for self-signed certificates
    ssl_check_hostname: false # Set to false for self-signed certificates

    # Optional - Qdrant Semantic Cache Settings
    qdrant_semantic_cache_embedding_model: openai-embedding # the model should be defined on the model_list
    qdrant_collection_name: test_collection
    qdrant_quantization_config: binary
    qdrant_semantic_cache_vector_size: 1536 # vector size must match embedding model dimensionality
    similarity_threshold: 0.8 # similarity threshold for semantic cache

    # Optional - S3 Cache Settings
    s3_bucket_name: cache-bucket-litellm # AWS Bucket Name for S3
    s3_region_name: us-west-2 # AWS Region Name for S3
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID # us os.environ/<variable name> to pass environment variables. This is AWS Access Key ID for S3
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY # AWS Secret Access Key for S3
    s3_endpoint_url: https://s3.amazonaws.com # [OPTIONAL] S3 endpoint URL, if you want to use Backblaze/cloudflare s3 bucket

    # Optional - GCS Cache Settings
    gcs_bucket_name: cache-bucket-litellm # GCS Bucket Name for caching
    gcs_path_service_account: os.environ/GCS_PATH_SERVICE_ACCOUNT # Path to GCS service account JSON file
    gcs_path: cache/ # [OPTIONAL] GCS path prefix for cache objects

    # Common Cache settings
    # Optional - Supported call types for caching
    supported_call_types:
      ["acompletion", "atext_completion", "aembedding", "atranscription"]
      # /chat/completions, /completions, /embeddings, /audio/transcriptions
    mode: default_off # if default_off, you need to opt in to caching on a per call basis
    ttl: 600 # ttl for caching
    disable_copilot_system_to_assistant: False # DEPRECATED - GitHub Copilot API supports system prompts.

  # Virtual key auth cache — shares API key / virtual-key auth across workers via Redis.
  # Reduces DB round trips when caches are cold on new workers or pods.
  # Requires litellm_settings.cache: true AND cache_params.type: redis above.
  enable_redis_auth_cache: false

callback_settings:
  otel:
    message_logging: boolean # OTEL logging callback specific settings

general_settings:
  completion_model: string
  store_prompts_in_spend_logs: boolean
  spend_logs_metadata_fields: object  # {include: [string]} or {exclude: [string]}, which LiteLLM_SpendLogs.metadata keys are written to the db
  forward_client_headers_to_llm_api: boolean
  disable_spend_logs: boolean  # turn off writing each transaction to the db
  disable_master_key_return: boolean  # turn off returning master key on UI (checked on '/user/info' endpoint)
  disable_retry_on_max_parallel_request_limit_error: boolean  # turn off retries when max parallel request limit is reached
  disable_reset_budget: boolean  # turn off reset budget scheduled task
  disable_adding_master_key_hash_to_db: boolean  # turn off storing master key hash in db, for spend tracking
  disable_responses_id_security: boolean  # turn off response ID security checks that prevent users from accessing other users' responses
  responses_websocket_session_limit_seconds: 3600  # max lifetime of a /v1/responses WebSocket session, from connect. 60-7200, default 3600
  allow_unmanaged_response_ids: boolean  # let keys address response IDs this proxy never issued, e.g. raw provider IDs
  vector_store_deny_by_default: boolean  # if true, a vector store must be granted in object_permission.vector_stores of the key and its team (or the user when there is neither); empty lists grant nothing
  disable_auto_add_proxy_admin_to_teams: boolean  # if true, a proxy admin calling /team/new is no longer auto-added to the new team as team admin
  search_tool_deny_by_default: boolean  # if true, a search tool must be granted in object_permission.search_tools of the key and its team (or the user when there is neither); empty lists grant nothing
  disable_fallbacks_on_per_model_rate_limits: boolean  # if true, a key/team/org/project per-model rate limit (model_rpm_limit / model_tpm_limit) returns 429 instead of retrying on router_settings fallbacks
  enforce_fallback_model_access: boolean  # if true, router_settings fallbacks only run when the calling key, team and project may call the fallback model
  enforce_fallback_budget: boolean  # default true; set false to let router_settings fallbacks run even when the calling key or user is out of budget
  enable_jwt_auth: boolean  # allow proxy admin to auth in via jwt tokens with 'litellm_proxy_admin' in claims
  enforce_user_param: boolean  # requires all openai endpoint requests to have a 'user' param
  reject_clientside_metadata_tags: boolean  # if true, rejects requests with client-side 'metadata.tags' to prevent users from influencing budgets
  missing_session_id: generate  # or "reject". What to do with LLM API requests that carry no session id; unset keeps the legacy behavior
  disable_batch_input_file_rate_limiting: boolean  # skip TPM/RPM accounting for batch input files
  skip_batch_input_file_rate_limiting_for_providers: ["hosted_vllm"]  # apply the batch accounting skip only to these providers
  disable_budget_reservation: boolean  # disable pre-request budget reservation; may allow overspend under concurrency
  allowed_routes: ["route1", "route2"]  # list of allowed proxy API routes - a user can access. (currently JWT-Auth only)
  key_management_system: google_kms  # either google_kms or azure_kms
  master_key: string  # falls back to LITELLM_MASTER_KEY; the proxy will not start when the master key is unset, empty, or has a known unsafe value
  dangerously_permit_weak_or_unset_master_key: boolean  # local development only; lets the proxy start with no master key or a known unsafe value
  maximum_spend_logs_retention_period: 30d # The maximum time to retain spend logs before deletion.
  maximum_spend_logs_retention_interval: 1d # interval in which the spend log cleanup task should run in.
  maximum_daily_tag_spend_retention_period: 90d # Optional. Prune LiteLLM_DailyTagSpend rows for days older than this.
  user_mcp_management_mode: restricted  # or "view_all"

  # Database Settings
  database_url: string
  database_connection_pool_limit: 0  # default 10
  database_connection_timeout: 0  # default 60s
  database_connect_timeout: 0  # Prisma `connect_timeout` URL param (seconds). Unset => Prisma default.
  database_socket_timeout: 0  # Prisma `socket_timeout` URL param (seconds). Idle/slow connections beyond this are closed.
  database_statement_timeout: 0  # Postgres statement_timeout (seconds). Caps how long any one statement may run, and therefore how long it can hold locks. Unset => no bound.
  database_lock_timeout: 0  # Postgres lock_timeout (seconds). Caps how long a statement waits for a lock another transaction holds. Unset => no bound.
  database_extra_connection_params: {}  # Extra key/value pairs appended to the Prisma DATABASE_URL / DIRECT_URL query string (e.g. sslmode, pgbouncer, statement_cache_size). Overrides LiteLLM defaults.
  database_disable_prepared_statements: boolean  # if true, appends pgbouncer=true to the Prisma connection URL, disabling server-side prepared statements. For PgBouncer transaction pooling and avoiding "cached plan must not change result type" errors during rolling migrations.
  allow_requests_on_db_unavailable: boolean  # if true, will allow requests that can not connect to the DB to verify Virtual Key to still work 
  fail_closed_budget_enforcement: boolean  # if true, validates spend against the DB for every budgeted request and rejects with 503 when spend cannot be verified against Redis or the DB
  fail_closed_rate_limit_enforcement: boolean  # if true, rejects requests with 503 while the tpm/rpm/max_parallel_requests counters in Redis are unreachable, instead of enforcing the limits per instance from memory

  custom_auth: string
  max_parallel_requests: 0 # the max parallel requests allowed per deployment
  global_max_parallel_requests: 0 # the max parallel requests allowed on the proxy all up
  infer_model_from_keys: true
  background_health_checks: true
  health_check_interval: 300
  alerting: ["slack", "email"]
  alerting_threshold: 0
  use_client_credentials_pass_through_routes: boolean  # use client credentials for all pass through routes like "/vertex-ai", /bedrock/. When this is True Virtual Key auth will not be applied on these endpoints

worker_registry:                    # top-level key, not nested under general_settings
  - worker_id: string               # unique id for the worker
    name: string                    # display name shown in the UI
    url: string                     # full URL of the worker, must start with http:// or https://

router_settings:
  routing_strategy: simple-shuffle # Literal["simple-shuffle", "least-busy", "usage-based-routing","latency-based-routing"], default="simple-shuffle" - RECOMMENDED for best performance
  redis_host: <your-redis-host>           # string
  redis_password: <your-redis-password>   # string
  redis_port: <your-redis-port>           # string
  enable_pre_call_checks: true            # bool - Before call is made check if a call is within model context window 
  allowed_fails: 3 # cooldown model if it fails > 1 call in a minute. 
  cooldown_time: 30 # (in seconds) how long to cooldown model if fails/min > allowed_fails
  disable_cooldowns: True                  # bool - Disable cooldowns for all models 
  enable_tag_filtering: True                # bool - Use tag based routing for requests
  tag_filtering_match_any: True             # bool - Tag matching behavior (only when enable_tag_filtering=true). `true`: match if deployment has ANY requested tag; `false`: match only if deployment has ALL requested tags
  tag_routing_prefix: "route:"              # string - Opt-in marker prefix (default ""). A request tag starting with this exact string is stripped and matched as an explicit routing directive, skipping the known-tag-vocabulary heuristic. Unprefixed tags keep matching as today.
  retry_policy: {                          # Dict[str, int]: retry policy for different types of exceptions
    "AuthenticationErrorRetries": 3,
    "TimeoutErrorRetries": 3,
    "RateLimitErrorRetries": 3,
    "ContentPolicyViolationErrorRetries": 4,
    "InternalServerErrorRetries": 4,
    "ServiceUnavailableErrorRetries": 4,
    "NotFoundErrorRetries": 0,             # never retry a 404
    "DefaultRetries": 2                    # retries for every error with no field of its own
  }
  allowed_fails_policy: {
    "BadRequestErrorAllowedFails": 1000, # Allow 1000 BadRequestErrors before cooling down a deployment
    "AuthenticationErrorAllowedFails": 10, # int 
    "TimeoutErrorAllowedFails": 12, # int 
    "RateLimitErrorAllowedFails": 10000, # int 
    "ContentPolicyViolationErrorAllowedFails": 15, # int 
    "InternalServerErrorAllowedFails": 20, # int 
  }
  content_policy_fallbacks: [{"{{anthropic}}": ["my-fallback-model"]}] # List[Dict[str, List[str]]]: Fallback model for content policy violations
  fallbacks: [{"{{anthropic}}": ["my-fallback-model"]}] # List[Dict[str, List[str]]]: Fallback model for all errors

```

### litellm_settings 参考

**默认值**列是 `config.yaml` 中省略该配置项时 LiteLLM 使用的值。`null` 表示该配置项未设置，说明列会解释此时 LiteLLM 的行为。未设置时会从环境变量读取的配置项，会在说明中列出对应的环境变量。

| 名称 | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| success_callback | array of strings | `[]` | 成功回调列表。[文档：代理日志回调](logging)，[文档：指标](prometheus) |
| failure_callback | array of strings | `[]` | 失败回调列表。[文档：代理日志回调](logging)，[文档：指标](prometheus) |
| callbacks | array of strings | `[]` | 回调列表，成功与失败时都会触发。[文档：代理日志回调](logging)，[文档：指标](prometheus) |
| service_callback | array of strings | `[]` | 系统健康监控，把 Redis、Postgres 故障记录到指定服务（如 datadog、prometheus）。[文档：指标](prometheus) |
| turn_off_message_logging | boolean | `false` | 若为 true，阻止消息与响应被记录到回调，但请求元数据仍会被记录。处理敏感数据时可用于隐私/合规场景。[代理日志](logging) |
| modify_params | boolean | `false` | 若为 true，允许在请求发送给 LLM 提供商之前修改请求参数 |
| enable_preview_features | boolean | `false` | 若为 true，启用预览功能，例如支持流式的 Azure O1 模型。|
| disable_stop_sequence_limit | boolean | `false` | 若为 true，不再把 `stop` 参数截断为 OpenAI 规范允许的 4 个序列。 |
| redact_user_api_key_info | boolean | `false` | 若为 true，从日志中脱敏用户 API 密钥相关信息。[代理日志](logging#脱敏-userapikeyinfo) |
| mcp_aliases | object | `{}` | 把易记的别名映射到 MCP 服务器名，方便工具访问。每个服务器只使用第一个别名。[MCP 别名](../mcp#mcp-别名) |
| langfuse_default_tags | array of strings | `[]` | Langfuse 日志的默认标签。若你想控制 LiteLLM 代理把哪些 LiteLLM 专属字段作为标签记录，可使用此配置。默认情况下 LiteLLM 代理不记录任何 LiteLLM 专属字段标签。[更多文档](/docs/proxy/logging#litellm-标签---cache_hit-与-cache_key) |
| set_verbose | boolean | `false` | [已废弃，参见调试文档](./debugging) 请改用 `--debug` 或 `--detailed_debug` CLI 标志，或将环境变量 `LITELLM_LOG` 设置为 "INFO"、"DEBUG" 或 "ERROR"。 |
| json_logs | boolean | `false` | 若为 true，日志将采用 JSON 格式。若需要以 JSON 存储日志，只需设置 `litellm.json_logs = True`。目前只是把 LiteLLM 收到的原始 POST 请求以 JSON 记录。[更多文档](./debugging) |
| request_correlation_in_logs | boolean | `false` | 若为 true，每行日志（纯文本或 JSON）都会带上请求的 `trace_id` 与 `session_id`，并向 `StandardLoggingPayload` 添加 `session_id` 字段。[更多文档](./debugging#请求关联-id) |
| default_fallbacks | array of strings | `[]` | 当某个模型组配置错误或不可用时使用的回退模型列表。[更多文档](./reliability#默认回退) |
| request_timeout | integer | `6000` (seconds) | 请求超时时间（秒）。未设置时默认为 `6000 seconds`。[参考：OpenAI Python SDK 默认为 `600 seconds`。](https://github.com/openai/openai-python/blob/main/src/openai/_constants.py) 设置后同样适用于原生的提供商透传路由（`/v1/responses`、`/v1/messages`、Bedrock `/converse`），其优先级高于 `general_settings.pass_through_request_timeout`，低于任何部署或路由器超时设置。[文档](./pass_through#请求超时) |
| force_ipv4 | boolean | `false` | 若为 true，LiteLLM 将对所有 LLM 请求强制使用 IPv4。有用户在 IPv6 + Anthropic API 场景下遇到过 httpx ConnectionError。aiohttp 与 httpx 传输层都会继续遵循 `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY`；在 httpx 传输层上只有直连会被固定为 IPv4，到代理服务器的那一跳不会 |
| disable_aiohttp_transport | boolean | `false` | 若为 true，LLM 请求改用普通 httpx 而非默认的 aiohttp 传输层。若在 `/v1/responses`、`/v1/chat/completions` 或 `/v1/messages` 上看到 aiohttp 连接器错误（例如 `CancelledError` 表现为 `No response returned`），可设置此项（或环境变量 `DISABLE_AIOHTTP_TRANSPORT`）。**默认为 False** |
| http2 | boolean | `false` | 若为 true，LiteLLM 通过 TLS 与 LLM 提供商协商 HTTP/2（提供商不支持时回退到 HTTP/1.1）。流量改经 httpx 而非默认的 aiohttp 传输层。也可通过环境变量 `LITELLM_HTTP2` 设置。自 v1.103.0 起可用。[更多文档](./server_tuning#到提供商的出站-http2)。**默认为 False** |
| content_policy_fallbacks | array of objects | `[]` | 遇到 ContentPolicyViolationError 时使用的回退机制。[更多文档](./reliability#内容策略回退) |
| context_window_fallbacks | array of objects | `[]` | 遇到 ContextWindowExceededError 时使用的回退机制。[更多文档](./reliability#context-window-fallbacks) |
| cache | boolean | `false` | 若为 true，启用缓存。[更多文档](./caching) |
| cache_params | object | `{}` (`type` 默认为 `redis`) | 缓存参数。[更多文档](./caching_settings#proxy-configyaml-中支持的-cache_params) |
| enable_redis_auth_cache | boolean | `false` | 为 `true` 时，把虚拟密钥（virtual key）鉴权负载存入 Redis（与响应缓存共用同一客户端），让每个 worker/pod 共享缓存的鉴权查询，减少缓存未命中时的重复数据库读取。**要求 `cache: true` 且 `cache_params.type: redis`**（Redis 或 Redis Cluster）。可选：设置 `general_settings.user_api_key_cache_ttl`，让 TTL 对内存与 Redis 一致生效。[更多文档](./caching_redis#虚拟密钥认证缓存redis) |
| force_redis_hash_tag_grouping | boolean | `false` | 为 `true` 时，即使缓存是普通 Redis 连接而非 Redis Cluster，限流器也按哈希槽对 Redis Lua 脚本中的键分组。适用于仍会拒绝跨槽命令的单端点 Redis 服务，例如启用 Enterprise 集群策略的 Azure Managed Redis；不设置时这些服务的批量 `EVALSHA` 调用会因 `CROSSSLOT Keys in request don't hash to the same slot` 失败，速率限制退回按 pod 内存执行。 |
| disable_end_user_cost_tracking | boolean | `false` | 若为 true，关闭 Prometheus 指标与代理花费日志表中的终端用户成本追踪。 |
| enable_end_user_cost_tracking_prometheus_only | boolean | `false` | 若为 true，在 Prometheus 指标中包含 `end_user` 标签。默认关闭，以控制 Prometheus 基数。[更多文档](./prometheus#在-prometheus-上追踪-end_user) |
| cost_discount_config | object | `{}` | 按提供商对成本计算应用百分比折扣。在 `litellm_settings` 下配置。[更多文档](./provider_discounts) |
| cost_margin_config | object | `{}` | 按提供商或全局对成本计算应用百分比/固定加成。在 `litellm_settings` 下配置。[更多文档](./provider_margins) |
| key_generation_settings | object | `null`（无限制） | 限制哪些主体可以生成密钥。[更多文档](./virtual_keys.md#限制密钥生成) |
| disable_add_transform_inline_image_block | boolean | `false` | 针对 Fireworks AI 模型：若为 true，当模型不是视觉模型时，不再自动在 image_url 的 URL 后追加 `#transform=inline`。 |
| use_chat_completions_url_for_anthropic_messages | boolean | `false` | 若为 true，将 OpenAI `/v1/messages` 请求改经 chat/completions 路由，而非 Responses API。也可通过环境变量 `LITELLM_USE_CHAT_COMPLETIONS_URL_FOR_ANTHROPIC_MESSAGES=true` 设置。 |
| route_all_chat_openai_to_responses | boolean | `false` | 若为 true，将所有 OpenAI `/chat/completions` 请求经 Responses API 桥接路由。推荐用于 OpenAI 模型。也可通过环境变量 `LITELLM_ROUTE_ALL_CHAT_OPENAI_TO_RESPONSES=true` 设置。 |
| skip_system_message_in_guardrail | boolean | `false` | 若为 true，统一防护栏（guardrails）在扫描输入时仅在**对话补全**与 **Anthropic `/v1/messages`** 上省略 `role: system`；Lakera v2 在对话补全上同样遵循。LLM 仍收到完整消息。每个防护栏可用 `litellm_params.skip_system_message_in_guardrail` 单独覆盖。[防护栏快速上手](./guardrails/quick_start#在防护栏评估中跳过-system-消息) |
| skip_tool_message_in_guardrail | boolean | `false` | 若为 true，统一防护栏在扫描输入时仅在**对话补全**与 **Anthropic `/v1/messages`** 上省略 `role: tool`；Lakera v2 在对话补全上同样遵循。LLM 仍收到完整消息。每个防护栏可用 `litellm_params.skip_tool_message_in_guardrail` 单独覆盖。[防护栏快速上手](./guardrails/quick_start#在防护栏评估中跳过-tool-消息) |
| disable_hf_tokenizer_download | boolean | `false` | 若为 true，所有模型（包括 Hugging Face 模型）默认改用 OpenAI tokenizer。 |
| enable_json_schema_validation | boolean | `false` | 若为 true，为所有请求启用 JSON Schema 校验。 |
| enable_key_alias_format_validation | boolean | `false` | 若为 true，在 `/key/generate` 与 `/key/update` 上校验 `key_alias` 格式。长度须为 2-255 个字符，以字母数字开头和结尾，仅允许 `a-zA-Z0-9_-/.@`。 |
| key_alias_pattern | string | `None` | 正则表达式，`key_alias` 必须在 `/key/generate`、`/key/update` 和 `/key/{key}/regenerate` 上完整匹配。取代 `enable_key_alias_format_validation` 启用的内置规则。别名最长 255 个字符。不匹配的别名会被拒绝并返回指明该模式的 `400`。[更多文档](./virtual_keys#强制-key_alias-命名模式) |
| require_managed_files | boolean | `false` | 为 `true` 时，`POST /v1/files` 要求提供 `target_model_names`，并对经典提供商文件上传返回 `400`。用于强制使用 LiteLLM 托管文件以实现文件所有权与访问控制。[更多文档](./litellm_managed_files#可选上传时强制使用托管文件) |
| user_url_validation | boolean | `true` | 为 `true` 时，代理在抓取用户可控的 URL（例如作为 `http(s)` URL 的 OpenAPI `spec_path`、图片 URL 等）前先做校验：解析 DNS，并阻止连接到非全局可路由地址（RFC1918、环回、链路本地等），除非该 URL 中的**主机名**列在 `user_url_allowed_hosts` 中。设为 `false` 可跳过校验（仅在你信任 URL 提供方时使用）。必须配置在 `litellm_settings` 下，而非 `general_settings`。 |
| user_url_allowed_hosts | array of strings | `[]` | 当 `user_url_validation` 为 `true` 时，允许解析到私有/内网 IP 的主机名。匹配的是 **URL 中出现的主机名**（例如 `api.corp.internal`、`127.0.0.1`、`127.0.0.1:8080`、`[::1]:443`）。对于分离式 DNS（split-horizon），应放行公网主机名而非解析出的 `10.x` 地址。必须配置在 `litellm_settings` 下，而非 `general_settings`。参见[基于 OpenAPI 的 MCP](../mcp_openapi#内网-spec-url-与-ssrf-防护) 与[自定义代码防护栏](guardrails/custom_code_guardrail#屏蔽目标地址)。 |
| disable_copilot_system_to_assistant | boolean | `false` | **已废弃**。GitHub Copilot API 支持系统提示词。 |
| default_team_params | object | `null` | 通过 `/team/new` 创建的每个新团队（包括 SSO 自动创建的团队）应用的默认参数。填充请求中省略或为 `null` 的字段，`budget_duration` 除外：显式 `"budget_duration": null` 会跳过默认值并创建永不重置的预算。子字段：`max_budget`（浮点数）、`budget_duration`（字符串，例如 `"30d"`）、`tpm_limit`（整数）、`rpm_limit`（整数）、`team_member_permissions`（字符串数组，例如 `["/team/daily/activity", "/key/generate"]`）、`models`（字符串数组，仅对 SSO 自动创建的团队生效）。 |
| budget_reset_time | string | `null`（午夜） | 下一个版本（`v1.94.0` 之后）可用。天/周/月预算重置的当日时刻（按配置的 `timezone`），为带引号的 24 小时制 `"HH:MM"` 或 `"HH:MM:SS"` 字符串，例如 `"09:00"`。未设置时默认为午夜；不足一天的时长会忽略它。格式错误的值会让配置在启动时加载失败。[更多文档](./budget_reset_and_tz#配置重置时刻) |
| overwrite_user_with_key_hash | boolean | `false` | `v1.95.0` 及之后可用。为 `true` 时，强制把 chat/completions 的出站 `user` 设为调用密钥的身份，覆盖客户端提供的值，缺失时也会设置：虚拟密钥用其 sha256 哈希（与花费日志中的 `user_api_key_hash` 相同），主密钥请求用 `litellm_proxy_master_key` 别名。提供稳定、防篡改的终端用户 ID，让依赖 `user` 的提供商侧滥用监控等处理能映射回单一密钥。仅影响经代理校验的密钥；自定义认证与 JWT 请求不受影响。[更多文档](./virtual_keys) |
| drop_params | boolean | `false` | 若为 true，目标提供商不支持的请求参数被静默丢弃而非报错。也可通过环境变量 `LITELLM_DROP_PARAMS=true` 设置。[更多文档](../completion/drop_params) |
| add_function_to_prompt | boolean | `false` | 若为 true，当提供商不支持函数/工具调用时，把函数定义追加到提示词中而非报错。 |
| ssl_verify | boolean or string | `true` | 控制出站 LLM 请求的 TLS 证书校验。设为 `false` 关闭校验，或设为 CA 证书包的字符串路径。 |
| return_response_headers | boolean | `false` | 若为 true，在响应上透出提供商的速率限制响应头（例如 `x-ratelimit-remaining-requests`）。 |
| max_budget | float | `0`（无上限） | 本实例跨所有提供商的全局花费上限（美元）。`0` 表示不设上限。 |
| max_internal_user_budget | float | `null` | 应用于每个内部用户的默认预算上限（美元）。`null` 表示不设按用户上限。[更多文档](./self_serve#为内部用户设置默认预算上限) |
| default_max_internal_user_budget | float | `null` | `max_internal_user_budget` 未设置时内部用户使用的回退预算上限（美元）。`null` 表示不设上限。 |
| max_ui_session_budget | float | `1.0` | 每个管理界面（Admin UI）登录会话（playground、测试连接）的最大花费（美元）。`null` 表示不设上限。 |
| store_audit_logs | boolean | `null` | 若为 true，为密钥、团队和用户的创建/更新/删除操作写入审计日志。未设置时读取环境变量 `LITELLM_STORE_AUDIT_LOGS`；若也未设置，企业版部署默认开启审计日志，其他部署默认关闭。 |
| default_key_generate_params | object | `null` | 调用方未提供时应用于 `/key/generate` 请求的默认参数。[更多文档](./virtual_keys#keygenerate-默认参数) |
| upperbound_key_generate_params | object | `null` | 对 `/key/generate` 参数强制执行的上限（例如 `max_budget`、`duration` 的最大值），超出即拒绝请求。[更多文档](./virtual_keys#keygenerate-参数上限) |
| default_internal_user_params | object | `null` | 首次 SSO 登录自动创建内部用户时应用的默认参数（角色、模型、预算）。[更多文档](./self_serve) |
| default_team_settings | array of objects | `null` | 按团队配置的默认日志设置，每项以 `team_id` 为键（例如团队专属的 Langfuse 凭据）。启动时按 `TeamDefaultSettings` 校验。 |

### general_settings 参考

| 名称 | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| completion_model | string | `null` | 用于所有补全请求的模型，覆盖请求中指定的任何 `model` |
| enable_drain_endpoint | boolean | `false` | 若为 true，暴露无需鉴权的 `GET /health/drain` 端点，供 Kubernetes `preStop` 钩子在关停前排空在途请求。默认关闭；仅当健康检查端口只能从集群内部访问时才启用，因为任何能访问它的调用方都能把 pod 摘出轮换。参见 `GRACEFUL_SHUTDOWN_TIMEOUT`。 |
| drain_endpoint_token | string | `null` | `/health/drain` 端点的共享密钥。设置后，排空调用必须携带匹配的 `X-Drain-Token` 请求头（以 `secrets.compare_digest` 比较），否则返回 401；kubelet 经 preStop 的 `httpGet.httpHeaders` 提供该头。也可通过环境变量 `DRAIN_ENDPOINT_TOKEN` 设置。 |
| disable_spend_logs | boolean | `false` | 若为 true，关闭把每笔交易写入数据库 |
| disable_spend_updates | boolean | `false` | 若为 true，关闭所有花费更新写库，包括密钥/用户/团队的花费更新。 |
| disable_master_key_return | boolean | `false` | 若为 true，管理界面不再返回主密钥。（在 '/user/info' 端点上检查） |
| disable_env_credential_login | boolean | `false` | 默认 `false`。若为 true，管理界面不再接受环境变量凭据（`UI_USERNAME`/`UI_PASSWORD`，未设 `UI_PASSWORD` 时为主密钥）登录，只允许数据库用户与 SSO 登录。请先创建带密码的 `proxy_admin` 用户；若启用过早，移除该配置并重启即可恢复环境变量登录。[禁用环境变量凭据登录](./ui#5-创建自己的管理员账号并停用环境变量凭据登录) |
| disable_retry_on_max_parallel_request_limit_error | boolean | `false` | 若为 true，达到最大并行请求数限制时不再重试 |
| disable_reset_budget | boolean | `false` | 若为 true，关闭预算重置定时任务 |
| disable_adding_master_key_hash_to_db | boolean | n/a | **代理不再读取此配置**；把主密钥哈希写入数据库的代码已在 [litellm#8268](https://github.com/BerriAI/litellm/pull/8268) 移除。若为 true，关闭把主密钥哈希存入数据库 |
| disable_responses_id_security | boolean | `false` | 若为 true，关闭响应 ID 安全检查（该检查防止用户访问其他用户的响应 ID）。为 false（默认）时，响应 ID 结合用户信息加密，确保用户只能访问自己的响应。适用于 /v1/responses 端点 |
| responses_websocket_session_limit_seconds | float | `3600` | Responses API WebSocket 会话（`/v1/responses` 与 `/responses`）的最大存活时长（秒），自连接被接受起算。空闲连接在收到首个 `response.create` 帧之前保持打开，最长到该上限。达到上限时代理以代码 `1000`、原因 `Session duration limit reached` 关闭连接。取值须在 60 到 7200 之间；其他值会记录警告并回退到 3600。[文档](../response_api#会话时长上限) |
| allow_unmanaged_response_ids | boolean | `false` | 若为 true，允许密钥引用本代理从未签发的响应 ID，例如原始提供商 ID 或响应 ID 加密启用前发出的 ID。为 false（默认）时，这类 ID 被 403 拒绝，因为代理无法判定其归属。代理自己签发的 ID 无论取值如何都仍会做归属校验。适用于 /v1/responses 端点 |
| disable_auto_add_proxy_admin_to_teams | boolean | `false` | 用户调用 `/team/new` 时，LiteLLM 会自动把调用者加为新团队的管理员。将此项设为 `true` 后，代理管理员不再被自动加入；你在 `members_with_roles` 中显式列出的成员仍会被加入，非管理员调用者（如内部用户）仍会被自动加入。也可在管理界面 **Settings > Router Settings > General Settings** 下切换。 |
| search_tool_deny_by_default | boolean | `false` | 若为 true，请求只能使用其密钥与团队（对无密钥的团队成员为其团队；两者皆无时为用户）的 `object_permission.search_tools` 中列出的搜索工具。缺失或空列表不授予任何工具，网页搜索拦截也不再回退到默认提供商。主密钥与仪表板会话不受限。[更多信息](../search/index.md#restrict-search-tool-access) |
| disable_fallbacks_on_per_model_rate_limits | boolean | `false` | 默认 `false`。为 `true` 时，被密钥、团队、组织或项目的按模型速率限制（`model_rpm_limit` / `model_tpm_limit`）拒绝的请求直接返回 429，不再按 `router_settings` 回退机制重试。其他本地速率限制仍照旧回退。[更多信息](users#按模型速率限制与回退) |
| enforce_fallback_model_access | boolean | `false` | 默认 `false`。为 `true` 时，`router_settings` 中配置的回退（`fallbacks`、`context_window_fallbacks`、`content_policy_fallbacks`、`default_fallbacks`）只有在调用密钥、其团队和其项目有权调用回退模型时才执行；无权的目标被跳过，全部跳过后返回主模型的错误。[更多信息](reliability#回退时强制执行密钥的模型访问权限) |
| enforce_fallback_budget | boolean | `true` | 默认 `true`。`router_settings` 中配置的回退只有在调用密钥与用户仍在预算内时才执行；超预算的目标被跳过，全部跳过后返回主模型的错误。零成本回退目标始终允许，主模型首次尝试也从不因此受阻。设为 `false` 可让回退不考虑预算照常执行。[更多信息](reliability#回退时强制执行预算) |
| enable_jwt_auth | boolean | `false` | 允许代理管理员通过 claims 中带有 'litellm_proxy_admin' 的 JWT 令牌鉴权。[JWT 令牌文档](token_auth) |
| enforce_user_param | boolean | `false` | 若为 true，要求所有 OpenAI 端点请求都带有 'user' 参数。[调用钩子文档](call_hooks)|
| reject_clientside_metadata_tags | boolean | `false` | 若为 true，拒绝包含客户端 'metadata.tags' 的请求，防止用户通过发送不同标签影响预算。标签只能从 API 密钥元数据继承。 |
| missing_session_id | string | `null`（旧行为） | 对不携带会话 ID（`x-litellm-session-id` 请求头、`metadata.session_id`、W3C `baggage` 的 `session.id` 等）的 LLM API 请求如何处理。`generate` 为每个请求生成一个 ID 并写入 `litellm_session_id`、`litellm_trace_id` 与 `metadata.session_id`，使 SpendLogs 的 `session_id` 列与发送给 Langfuse 等日志回调的会话 ID 一致。`reject` 对这类请求返回 `400`。未设置时保持旧行为：SpendLogs 回退用追踪 ID，而回调收不到会话 ID。MCP 路由不受影响。 |
| disable_batch_input_file_rate_limiting | boolean | `false` | 默认 `false`。设为 `true` 可在提交时跳过批处理输入文件的 TPM/RPM 统计。当 API 密钥配置了模型白名单时文件仍会被读取。参见[批处理速率限制](../batches#batches-api-限流的工作方式)。 |
| skip_batch_input_file_rate_limiting_for_providers | array of strings | `[]` | 对列出的提供商跳过批处理输入文件的 TPM/RPM 统计，例如 `["hosted_vllm"]`。LiteLLM 根据所选路由判定提供商。当 API 密钥配置了模型白名单时文件仍会被读取。 |
| skip_batch_input_file_rate_limiting_for_models | array of strings | `[]` | 已废弃。此配置无任何效果，并在启动时产生警告。请改用 `skip_batch_input_file_rate_limiting_for_providers` 或 `disable_batch_input_file_rate_limiting`。 |
| disable_budget_reservation | boolean | `false` | 默认 `false`。设为 `true` 可关闭请求前的成本预留。这可能让并发请求超出配置的预算；预算已耗尽时请求仍会被拒绝。该选项启用期间 LiteLLM 会记录警告。参见[预算预留](./users#预算预留)。 |
| allowed_routes | array of strings | `null`（全部路由） | 用户可访问的代理 API 路由白名单 [控制允许路由的文档](/docs/proxy/public_routes#同时定义公开仅管理员与允许路由)|
| key_management_system | string | `null` | 指定密钥管理系统。[密钥管理器文档](../secret) |
| master_key | string | `null`（回退到 `LITELLM_MASTER_KEY`） | 代理的主密钥。未设置、为空或为已知不安全值时，代理将拒绝启动。[设置虚拟密钥](virtual_keys)，[代理因已知不安全主密钥拒绝启动](./master_key_rotations.md#proxy-refuses-to-start) |
| dangerously_permit_weak_or_unset_master_key | boolean | `false` | 仅用于本地开发：若为 true，即使主密钥未设置、为空或为已知不安全值，代理也会启动，并在每次启动时记录警告。也可通过环境变量 `LITELLM_DANGEROUSLY_PERMIT_WEAK_OR_UNSET_MASTER_KEY` 设置。[代理因已知不安全主密钥拒绝启动](./master_key_rotations.md#proxy-refuses-to-start) |
| database_url | string | `null`（回退到 `DATABASE_URL`） | 数据库连接 URL [设置虚拟密钥](virtual_keys) |
| database_connection_pool_limit | integer | `10` | 数据库连接池上限 [设置数据库连接池上限](./configs.md#配置数据库连接池上限与连接超时) |
| database_connection_timeout | integer | `60` (seconds) | 数据库连接超时（秒）[设置数据库连接池上限与超时](./configs.md#配置数据库连接池上限与连接超时) |
| database_connect_timeout | float | `null` | 映射到 Prisma [`connect_timeout`](https://www.prisma.io/docs/orm/overview/databases/postgresql) URL 参数（秒）。限制引擎建立新连接的等待时长，超时即失败。未设置时使用 Prisma 内置默认值。 |
| database_socket_timeout | float | `null` | 映射到 Prisma [`socket_timeout`](https://www.prisma.io/docs/orm/overview/databases/postgresql) URL 参数（秒）。设置后，在该时间窗口内未产出数据的空闲或缓慢连接会被关闭。**用它来限制 LiteLLM 的空闲 Prisma 连接**。 |
| database_statement_timeout | float | `null` | Postgres [`statement_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html)（秒），经 `DATABASE_URL` 以 `options=-c statement_timeout=<ms>` 下发。限制单条语句的最长运行时间，也就限制了它持有行锁的时间。没有它，超出 Prisma 客户端 HTTP 读取超时的批量写入会在客户端放弃后仍在服务端继续运行，后续写入在这些锁后排队。不作用于 `DIRECT_URL`，因此迁移永远不会被取消。未设置表示无上限。[限制语句与锁时长](configs#限制语句执行与锁等待时间) |
| database_lock_timeout | float | `null` | Postgres [`lock_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html)（秒），经 `DATABASE_URL` 以 `options=-c lock_timeout=<ms>` 下发。限制语句等待其他事务已持有锁的时长，让被阻塞的写入快速失败，而不是耗尽整条语句的预算。建议远小于 `database_statement_timeout`。未设置表示无上限。[限制语句与锁时长](configs#限制语句执行与锁等待时间) |
| database_extra_connection_params | object | `{}` | 逃生通道：原样追加到 Prisma `DATABASE_URL` / `DIRECT_URL` 查询串的额外键值对（例如 `sslmode`、`pgbouncer`、`statement_cache_size`）。这里的键会覆盖 LiteLLM 设置的任何默认值。 |
| database_disable_prepared_statements | boolean | `false` | 在 Prisma 连接 URL 后追加 `pgbouncer=true`，禁用服务端预编译语句的复用。用于 PgBouncer 事务池化场景，或避免滚动 schema 迁移期间的 `cached plan must not change result type` 错误。`database_extra_connection_params` 中显式的 `pgbouncer` 键优先。[禁用服务端预编译语句](configs#禁用服务端预编译语句) |
| allow_requests_on_db_unavailable | boolean | `false` | 若为 true，即使数据库不可达，请求也能成功。**仅在你自己的 VPC 内运行 LiteLLM 时使用**。这样即使 LiteLLM 无法连库校验虚拟密钥，请求也能正常工作 [优雅处理数据库不可用文档](prod#优雅应对数据库不可用) |
| fail_closed_budget_enforcement | boolean | `false` | 为 `true` 时，预算检查对每个带预算的请求（密钥、团队、用户、组织、终端用户、标签及各时间窗预算）都对照权威数据库校验花费，而非只信任跨 pod 的 Redis 计数器；当 Redis 与数据库都无法核对当前花费时，请求返回 `503` 拒绝。适用于配置的预算在 Redis 降级或重启期间也必须是硬上限的场景；保持关闭可让健康的预算内流量不触碰数据库。[预算强制执行文档](./users#硬性预算强制执行fail-closed) |
| fail_closed_rate_limit_enforcement | boolean | `false` | 为 `true` 时，无法对照 Redis 核验 tpm、rpm 或 max_parallel_requests 计数器的请求返回 `503` 拒绝，而不是按每实例内存计数放行（后者在 N 个实例上会放行 N 倍限额）。适用于配置的速率限制在 Redis 宕机期间也必须是硬上限的场景；保持关闭可在 Redis 故障期间继续服务。未配置 Redis 时无效果。[速率限制强制执行文档](./users#硬性速率限制强制执行fail-closed) |
| custom_auth | string | `null` | 编写你自己的自定义鉴权逻辑 [自定义认证文档](./custom_auth) |
| max_parallel_requests | integer | `null`（无限制） | 每个部署允许的最大并行请求数 |
| global_max_parallel_requests | integer | `null`（无限制） | 整个代理允许的最大并行请求数 |
| max_in_flight_requests_per_worker | integer | `null`（准入控制关闭） | 每个 worker 进程可同时接纳的请求数上限。超出部分在有限队列中等待，排不下时返回 `503` 并带 `retry-after: 1`。未设置即关闭。参见[按 worker 准入控制](./server_tuning#单-worker-准入控制) |
| max_queued_requests_per_worker | integer | `null`（同 `max_in_flight_requests_per_worker`） | 每个 worker 上新请求在被拒绝前可等待槽位的数量。默认为 `max_in_flight_requests_per_worker` |
| admission_queue_timeout_seconds | float | `1.0` | 默认 `1.0`。排队请求在该时间内未获得槽位即被拒绝并返回 `503` |
| cancel_on_disconnect | boolean | `false` | 若为 true，客户端断开时取消仍在进行中的上游 LLM 请求（非流式），释放后端容量（如 vLLM GPU 槽位）。被取消的请求按 499 失败记录。默认 `false` |
| infer_model_from_keys | boolean | `false` | 若为 true，根据提供的密钥推断模型 |
| background_health_checks | boolean | `false` | 若为 true，启用后台健康检查。[健康检查文档](health) |
| health_check_interval | integer | `300` (seconds) | 健康检查间隔（秒）[健康检查文档](health) |
| alerting | array of strings | `null` | 告警方式列表 [Slack 告警文档](alerting) |
| alerting_threshold | integer | `600` (seconds) | 触发告警的阈值 [Slack 告警文档](alerting) |
| use_client_credentials_pass_through_routes | boolean | n/a | **代理不再读取此配置**；透传鉴权检查已在 [litellm#12847](https://github.com/BerriAI/litellm/pull/12847) 重做。若为 true，所有透传路由都使用客户端凭据。[透传路由文档](pass_through) |
| health_check_details | boolean | `true` | 若为 false，隐藏健康检查详情（例如剩余速率限制）。[健康检查文档](health) |
| public_routes | List[str] | `[]` | （企业版功能）公共路由控制列表 |
| alert_types | List[str] | `null`（所有告警类型） | 发送到 Slack 的告警类型控制列表 (告警类型文档)[./alerting.md] |
| enforced_params | List[str] | `null` | （企业版功能）所有发往代理的请求必须包含的参数列表 |
| enable_oauth2_auth | boolean | `false` | （企业版功能）若为 true，在 LLM 与 info 路由上启用 OAuth 2.0 认证 |
| use_x_forwarded_for | str | `false` | 若为 true，使用 `X-Forwarded-For` 请求头推导客户端 IP，并从 `X-Forwarded-Proto` / `X-Forwarded-Host` / `X-Forwarded-Port` 推导代理的公网来源（用于 MCP OAuth，以及决定会话/SSO/SAML cookie 在 TLS 终结的反向代理之后是否标记 `Secure`）。只有当 `mcp_trusted_proxy_ranges` 也已设置且请求对端 IP 落在其中某个 CIDR 内时，这些请求头才会生效。对于带 ingress 的部署，优先使用 [`PROXY_BASE_URL`](#环境变量参考)。参见[安全最佳实践——反向代理后的安全 cookie](./security_best_practices#8-在-tls-终止的反向代理后面配置-secure-cookie) 与 [MCP OAuth——反向代理与 ingress 配置](../mcp_oauth#reverse-proxy-and-ingress-configuration)。 |
| service_account_settings | List[Dict[str, Any]] | `null` | 若希望创建仅作用于服务账号密钥的配置，请设置 `service_account_settings` (服务账号文档)[./service_accounts.md] |
| image_generation_model | str | `null` | 图像生成使用的默认模型，忽略请求中指定的模型 |
| store_model_in_db | boolean | `false` | 若为 true，启用把模型与凭据信息存入数据库。 |
| supported_db_objects | List[str] | `null` | 在 `store_model_in_db` 为 True 时，精细控制从数据库加载哪些对象类型。可用类型：`"models"`、`"mcp"`、`"guardrails"`、`"vector_stores"`、`"pass_through_endpoints"`、`"prompts"`、`"model_cost_map"`。未设置时加载全部对象类型（默认行为）。示例：`supported_db_objects: ["mcp"]` 只从数据库加载 MCP 服务器。 |
| vector_store_deny_by_default | boolean | `false` | 若为 true，请求只能使用其密钥与团队（对无密钥的团队成员为其团队；两者皆无时为用户）的 `object_permission.vector_stores` 中列出的向量存储。缺失或空列表不授予任何向量存储。主密钥与仪表板会话不受限。[默认拒绝向量存储文档](../vector_stores/managed_vector_stores#默认拒绝向量存储) |
| user_mcp_management_mode | string | `null` | 控制非管理员在 MCP 仪表板上能看到什么。`restricted`（默认）只列出用户所属团队被明确授权访问的 MCP 服务器。`view_all` 让所有用户看到完整的 MCP 服务器列表。工具的 list/call 始终遵循按密钥的权限，因此用户在无权限时仍无法执行 MCP 调用。 |
| store_prompts_in_spend_logs | boolean | `false` | 若为 true，允许把提示词与响应存入花费日志表。 |
| spend_logs_metadata_fields | object | `null`（所有键都写入） | 控制 `LiteLLM_SpendLogs.metadata` 的哪些顶层键写入数据库。`include`（只写这些键）与 `exclude`（丢弃这些键）必须恰好设置一个；两个都设、都不设或含未知键都会让代理启动失败。`status` 与 `cold_storage_object_key` 始终写入。每日花费表、预算与日志回调仍能看到全部键。参见[选择存储哪些元数据字段](./ui_logs.md#选择存储哪些元数据字段) |
| scope_spend_list_endpoints_to_caller | boolean | n/a | **代理不再读取此配置**；`/spend/keys` 与 `/spend/users` 始终把非管理员调用者限定在其自己的数据行内。为 `true`（默认）时，`/spend/keys` 与 `/spend/users` 对非管理员 API 密钥只返回调用者自己的行。设为 `false` 可关闭该限定。参见[花费列表端点](./cost_tracking.md#花费列表端点spendkeys-与-spendusers)。 |
| legacy_unscoped_spend_list_endpoints | boolean | n/a | **代理不再读取此配置**；`/spend/keys` 与 `/spend/users` 始终把非管理员调用者限定在其自己的数据行内。为 `true` 时恢复限定前的行为（非管理员密钥可列出所有行）。优先级高于 `scope_spend_list_endpoints_to_caller`。环境变量：`LITELLM_LEGACY_UNSCOPED_SPEND_LIST_ENDPOINTS`。 |
| max_request_size_mb | int | `null`（无限制） | 请求的最大大小（MB）。超过该大小的请求会被拒绝。 |
| max_response_size_mb | int | `null`（无限制） | 响应的最大大小（MB）。超过该大小的 LLM 响应不会被发送。 |
| max_batch_file_size_mb | int | `null`（无上限） | 上传到 `/v1/files`、`purpose="batch"` 的批处理输入文件的最大大小（MB）。更大的上传在到达提供商前被 `413` 拒绝。未设置表示无上限。参见[批处理输入文件校验](../batches#批处理输入文件校验) |
| max_batch_file_records | int | `null`（无上限） | 上传到 `/v1/files`、`purpose="batch"` 的批处理输入文件中请求行的最大数量。空行不计入。超过记录数的文件在到达提供商前被 `413` 拒绝。按密钥生效；代理管理员可在密钥元数据中覆盖，并在团队元数据中添加团队上限，取密钥与团队两者中较小值。必须是正整数。参见[批处理输入文件校验](../batches#限制批处理文件中的记录数) |
| max_batch_file_uploads_per_day | int | `null`（无上限） | 每个密钥（JWT 调用者无密钥时按用户）在一个 UTC 日内可上传到 `/v1/files` 的批处理输入文件数量。超限后上传返回 `429`，并带倒计时到 UTC 00:00 的 `Retry-After` 头。代理管理员可在密钥元数据中覆盖，并在团队元数据中添加全团队限制。必须是正整数。参见[批处理上传与下载限制](../batches#批处理上传与下载限制) |
| max_file_downloads_per_minute | int | `null`（无上限） | 每个密钥（JWT 调用者无密钥时按用户）每分钟通过 `/v1/files/{file_id}/content` 下载同一文件内容的次数。超限后该文件的下载返回 `429` 与 `Retry-After` 头；其他文件不受影响。代理管理员可在密钥元数据中覆盖，并在团队元数据中添加全团队限制。必须是正整数。参见[批处理上传与下载限制](../batches#批处理上传与下载限制) |
| max_file_size_mb | int | `null`（无上限） | 上传到 `/v1/files` 的文件的最大大小（MB），适用于任何 `purpose`。更大的上传在到达提供商前被 `413` 拒绝。未设置表示无上限。 |
| allowed_file_extensions | List[str] | `null`（任意扩展名） | 上传到 `/v1/files` 时（适用于任何 `purpose`）唯一接受的文件扩展名（例如 `[".jsonl", ".pdf", ".txt"]`）。与上传文件名不区分大小写匹配。其他扩展名或无扩展名的文件在到达提供商前被 `400` 拒绝。空列表拒绝所有上传。未设置表示不应用白名单。参见[限制文件上传](./security_best_practices#10-限制文件上传) |
| blocked_file_extensions | List[str] | `null`（不阻止任何扩展名） | 已废弃，建议使用 `allowed_file_extensions`。上传到 `/v1/files` 时（适用于任何 `purpose`）被拒绝的文件扩展名（例如 `[".exe", ".sh"]`）。与上传文件名不区分大小写匹配。两者同时设置时，白名单之后仍会执行。未设置表示不阻止任何扩展名。 |
| proxy_budget_rescheduler_min_time | int | `597` (seconds) | 检查数据库预算重置前的最小等待时间（秒）。**默认为 597 秒** |
| proxy_budget_rescheduler_max_time | int | `605` (seconds) | 检查数据库预算重置前的最大等待时间（秒）。**默认为 605 秒** |
| proxy_batch_write_at | int | `10` (seconds) | 批量写入花费日志到数据库前的等待时间（秒）。**默认为 10 秒** |
| proxy_batch_polling_interval | int | `3600` (seconds) | 轮询批处理是否完成的间隔（秒）。轮询器会在其上附加最多 30 秒抖动。**默认为 3600 秒**（1 小时） |
| proxy_config_reload_interval_seconds | int | `30` | 启用 `store_model_in_db` 时，每个 pod 从数据库重新加载库内配置对象（模型、凭据、防护栏等）的频率。取值越小跨 pod 收敛越快，但数据库负载越高；在代理启动时生效。环境变量：`PROXY_CONFIG_RELOAD_INTERVAL_SECONDS`。**默认为 30 秒** |
| scheduled_job_stagger | dict | `null`（错开开启，300 秒窗口） | 把代理的定时后台任务在一个时间窗口内错开，而不是在每个副本上同时触发。键：`enabled`（布尔值，默认 `true`）、`window_seconds`（整数，默认 `300`）、`identity`（字符串，替换偏移哈希中源自 `POD_NAME`/`HOSTNAME` 的成分）、`offsets`（调度任务 ID 到秒数的字典，`0` 表示任务固定在未偏移的原时刻）。参见[错开定时后台任务](./prod.md#错峰调度后台任务) |
| alerting_args | dict | `null` | Slack 告警参数 [Slack 告警文档](./alerting.md) |
| custom_key_generate | str | `null` | 密钥生成的自定义函数 [自定义密钥生成文档](./virtual_keys.md#自定义-keygenerate) |
| custom_key_update | str | `null` | 密钥更新的自定义函数。若希望 `custom_key_generate` 策略同样作用于密钥编辑则必填 [自定义密钥更新文档](./virtual_keys.md#自定义-keyupdate) |
| custom_key_policy | str | `null` | 在每个密钥操作（生成、更新、重新生成）上运行的自定义函数，入参为操作与生效的密钥状态 [自定义密钥策略文档](./virtual_keys.md#自定义密钥策略一个钩子覆盖所有密钥操作) |
| allowed_ips | List[str] | `null`（所有 IP） | 允许访问代理的 IP 列表。未设置时允许所有 IP。 |
| embedding_model | str | n/a | **代理不再读取此配置**；`/embeddings` 路由不会读取它，请在请求上设置默认模型或使用 `model_list` 别名。（原功能：嵌入使用的默认模型，忽略请求中指定的模型） |
| alert_to_webhook_url | Dict[str] | `null` | [为每种告警类型指定 webhook URL。](./alerting.md#将-slack-频道映射到告警类型) |
| key_management_settings | List[Dict[str, Any]] | `null` | 密钥管理系统设置（例如 AWS KMS、Azure Key Vault）[密钥管理文档](../secret.md) |
| allow_user_auth | boolean | `false` | （已废弃）旧的用户认证方式。 |
| user_api_key_cache_ttl | int | `null` | 用户 API 密钥在内存中缓存的时长（秒）。 |
| user_api_key_cache_max_size | int | `200` | 每个 worker 的内存鉴权缓存保留的最大条目数（虚拟密钥、团队、用户、终端用户、成员关系等）。默认 200。活跃密钥数超过该值时应调高，否则条目会在请求之间被逐出，每次鉴权查询都要打数据库。可在运行时从管理界面 Settings > Router Settings > General 修改。 |
| disable_prisma_schema_update | boolean | `false` | 若为 true，关闭数据库 schema 自动更新 |
| litellm_key_header_name | str | `null`（读取 `Authorization`） | 设置后允许以自定义请求头传递 LiteLLM 密钥。[自定义请求头文档](./virtual_keys.md#在自定义请求头中传递-litellm-密钥) |
| moderation_model | str | `null` | 内容审核使用的默认模型。 |
| custom_sso | str | `null` | 实现自定义 SSO 逻辑的 Python 文件路径。[自定义 SSO 文档](./custom_sso.md) |
| allow_cli_sso_verification_uri_complete | boolean | `false` | 默认 `false`。为 `true` 时，`POST /sso/cli/start` 还会返回 `verification_uri_complete`，`lite login` 打开浏览器验证页时已填入代码，用户只需确认。默认关闭，让代码必须手工输入。[CLI SSO 文档](./cli_sso.md#预填验证码) |
| include_call_id_in_error_body | boolean | `false` | 默认 `false`。为 `true` 时，JSON 错误体还携带 `x-litellm-call-id` 响应头的值：在 OpenAI 形态路由与 `/v1/messages` 上作为 `error.litellm_call_id`，在透传路由上作为顶层 `litellm_call_id`，让只打印错误体的客户端也能点名要查询的请求。[问题反馈文档](./error_reference.md#报告问题) |
| allow_client_side_credentials | boolean | `false` | 若为 true，允许向代理传递客户端凭据。（测试微调模型时有用）[客户端凭据文档](./virtual_keys.md) |
| admin_only_routes | List[str] | `null` | （企业版功能）仅管理员用户可访问的路由列表。[仅管理员路由文档](/docs/proxy/public_routes#同时定义公开仅管理员与允许路由) |
| use_azure_key_vault | boolean | `false` | 若为 true，从 Azure Key Vault 加载密钥 |
| use_google_kms | boolean | `false` | 若为 true，从 Google KMS 加载密钥 |
| spend_report_frequency | str | `7d` | 指定花费报告的发送频率（例如 "1d"、"2d"、"30d"）[更多信息](./alerting.md) |
| spend_capture_rate_check | object | `null`（关闭） | 每日核对 LiteLLM 记录的花费与提供商账单，比率低于 `threshold`（默认 0.9）时告警。键：`providers`、`threshold`、`lookback_days`、`openai_project_ids`。需要 `OPENAI_ADMIN_KEY`。[花费捕获率文档](./spend_capture_rate.md) |
| ui_access_mode | Literal["admin_only"] | `all` | 设置后仅管理员用户可访问管理界面。[文档](./ui.md#停用-admin-ui) |
| max_failed_login_attempts_per_source | integer | `10` | 同一来源地址在 `failed_login_window_seconds` 窗口内、跨所有用户名的管理界面登录失败次数上限，超限后封禁该地址 `failed_login_block_seconds`。该值的一半（向下取整，至少 1）是单个用户名在该地址上的配额，只封禁该地址与用户名组合。按地址的限制仅在设置了 `trusted_proxy_ranges` 时生效（客户端直连时为 `[]`）；未设置时只有按用户名的一半生效。IPv6 地址按 /64 分组。[文档](./ui#限制登录失败尝试) |
| max_failed_login_attempts_per_source_overrides | dict | `null` | 对 `max_failed_login_attempts_per_source` 的按地址覆盖，以 IP 地址或 CIDR 段为键，例如 `{"203.0.113.7": 50, "10.0.0.0/8": 100}`。最具体的匹配优先，按用户名配额随之取覆盖值的一半，`0` 表示该地址同时豁免两项限制 |
| failed_login_window_seconds | integer | `60` | 统计管理界面登录失败次数的固定窗口（秒），从首次失败起算 |
| failed_login_block_seconds | integer | `300` | 被封锁的地址（或地址与用户名组合）保持封锁的时长。封锁期间该键的每次尝试都会在密码校验前被 429 拒绝，且被拒尝试不会延长封锁 |
| litellm_jwtauth | Dict[str, Any] | `null` | JWT 认证设置。[文档](./token_auth.md) |
| litellm_license | str | `null` | 代理的许可证密钥。[文档](../enterprise/activate.md) |
| oauth2_config_mappings | Dict[str, str] | `{}` | 定义 OAuth2 配置映射 |
| pass_through_endpoints | List[Dict[str, Any]] | `null` | 定义透传端点。[文档](./pass_through) |
| pass_through_request_timeout | float | `null` | 透传路由（自定义端点与原生提供商透传）的上游请求超时（秒）。默认：`600`。在自定义端点上，每个端点的 `timeout` 会覆盖它。在原生提供商透传路由上，部署或路由器超时以及显式设置的 `litellm_settings.request_timeout` 会覆盖它。[文档](./pass_through#请求超时) |
| enable_oauth2_proxy_auth | boolean | `false` | （企业版功能）若为 true，启用 OAuth 2.0 认证 |
| forward_openai_org_id | boolean | `false` | 若为 true，把 OpenAI Organization ID 转发给后端 LLM 调用（当后端为 OpenAI 时）。 |
| forward_client_headers_to_llm_api | boolean | `false` | 若为 true，把客户端请求头（任意 `x-` 头与 `anthropic-beta` 头）转发给后端 LLM 调用 |
| maximum_spend_logs_retention_period | str | `null`（清理关闭） | 设置花费日志在数据库中的最长保留时间，到期后自动清除 |
| maximum_daily_tag_spend_retention_period | str | `null`（表永不清理） | 在同一个清理任务中删除日期严格早于保留期的 `LiteLLM_DailyTagSpend` 行。参见[花费日志删除](./spend_logs_deletion) |
| maximum_spend_logs_retention_interval | str | `1d` | 设置花费日志清理任务的运行间隔。 |
| alert_type_config | dict | `null` | 告警类型到其处理配置的映射 |
| always_include_stream_usage | boolean | `false` | 若为 true，在每个流式响应分块中包含用量指标 |
| sse_keepalive_ping_interval_seconds | Optional[float] | `null`（关闭） | 全代理默认的流式保活配置，详见[超时](./timeout#为空闲流式连接发送保活心跳)。适用于所有未自行设置 `keepalive_seconds` 的部署，也适用于没有自身部署的透传路由。同时覆盖上游尚未应答的窗口期，这是按部署的 `keepalive_seconds` 覆盖不到的。默认 None（关闭）。 |
| auto_redirect_ui_login_to_sso | boolean | `false` | 若为 true，自动把管理界面登录页重定向到 SSO 提供商 |
| control_plane_url | string | `null` | 管理本实例的全局控制平面（Global Control Plane）的 URL。启用 `/v3/login` 与 `/v3/login/exchange` 端点，让控制平面界面能跨源向本实例认证。不与控制平面共享任何状态。[文档](./global_control_plane.md) |
| custom_auth_run_common_checks | boolean | `false` | 若为 true，在自定义认证之外同时执行 LiteLLM 标准鉴权校验（密钥/团队/用户/项目模型白名单、预算、速率限制）。默认为 `false`，参见[自定义认证——强制预算与模型访问](/docs/proxy/custom_auth#强制执行预算与模型访问控制) |
| custom_ui_sso_sign_in_handler | string | `null` | 管理界面 SSO 登录逻辑的自定义处理器 |
| database_connection_pool_timeout | integer | `60` (seconds) | 数据库连接池超时（秒） |
| disable_error_logs | boolean | `false` | 若为 true，抑制错误的追踪与入库存储 |
| enable_health_check_routing | boolean | `false` | 若为 true，启用基于健康检查的请求路由，避开不健康的部署 |
| background_health_check_model_groups | Optional[List[str]] | `null`（所有组） | 后台健康检查的模型组白名单（可选）。设置后只探测列出的组，健康检查路由也只作用于这些组；未列出的组保持原有路由行为。默认 None（所有组） |
| health_check_ignore_transient_errors | boolean | `false` | 若为 true，健康检查中的 429（速率限制）与 408（超时）失败将被忽略，不影响路由与冷却 |
| enable_mcp_registry | boolean | `false` | 若为 true，启用对集中式 MCP 服务器注册表的访问 |
| enforce_rbac | boolean | `false` | 若为 true，为所有代理操作启用基于角色的访问控制（RBAC） |
| forward_llm_provider_auth_headers | boolean | `false` | 若为 true，把提供商专属的认证头转发给 LLM API 调用 |
| health_check_concurrency | integer | `null`（无上限） | 并发健康检查操作的最大数量 |
| health_check_skip_disabled_background_models | boolean | `false` | 若为 true，对 `model_info.disable_background_health_check: true` 的部署，在按需 `GET /health` 及相关健康检查运行（不仅是后台循环）中跳过健康探测。[健康检查文档](health) |
| health_check_staleness_threshold | integer | `600` (seconds) | 健康检查结果的最长有效期（秒），超过即把部署标记为过期 |
| maximum_spend_logs_cleanup_batch_size | integer | `1000` | 花费日志清理期间每条 `DELETE` 语句删除的行数。默认 1000。两项同时设置时覆盖 `SPEND_LOG_CLEANUP_BATCH_SIZE` 环境变量默认值。参见[花费日志删除](spend_logs_deletion) |
| maximum_spend_logs_cleanup_max_batches | integer | `500` | 每轮花费日志清理对每张表发出的 `DELETE` 语句数，精确等于该值，不多不少。默认 500，即按默认批量每轮每表最多删除 500,000 行。两项同时设置时覆盖 `SPEND_LOG_RUN_LOOPS` 环境变量默认值。参见[花费日志删除](spend_logs_deletion) |
| maximum_spend_logs_cleanup_run_budget | string | `5m` | 整轮花费日志清理的挂钟预算，由其清理的所有表共享，形如 `5m` 的时长字符串。默认 `5m`。预算耗尽时本轮停止，下个周期从同一断点继续；由于预算在语句之间检查，最多可能超出一个批处理时长。两项同时设置时覆盖 `SPEND_LOG_CLEANUP_RUN_BUDGET_SECONDS` 环境变量默认值。参见[花费日志删除](spend_logs_deletion) |
| maximum_spend_logs_cleanup_batch_timeout | string | `30s` | 花费日志清理所发每条语句应用的 Postgres `statement_timeout` 与 `lock_timeout`，形如 `30s` 的时长字符串。默认 `30s`，避免单条语句长期持锁使用户流量排队。被取消的语句按批处理失败计，因此不要把它设得低于一个批处理合理所需的时间。两项同时设置时覆盖 `SPEND_LOG_CLEANUP_BATCH_TIMEOUT_SECONDS` 环境变量默认值。参见[花费日志删除](spend_logs_deletion) |
| maximum_spend_logs_cleanup_cron | string | `null` | 调度自动花费日志清理任务的 cron 表达式。星期字段请用日名（`sun`、`mon` 等）而非数字：调度器把星期编号为 0=周一到 6=周日，与标准 cron 不同。参见[花费日志删除](spend_logs_deletion) |
| mcp_client_side_auth_header_name | string | `null` | 承载客户端 MCP 服务器凭据的 HTTP 请求头名称 |
| mcp_internal_ip_ranges | list | `null`（RFC1918 + 环回） | 视为内网的 CIDR 段，用于非公开 MCP 服务器的访问控制 |
| mcp_required_fields | list | `null` | MCP 服务器提交时必填的字段名列表 |
| mcp_trusted_proxy_ranges | list | `null` | 受信转发 `X-Forwarded-*` 请求头的代理 CIDR 段。MCP OAuth `authorize` 端点要从这些头推导公网来源、会话/SSO/SAML cookie 要在 TLS 终结的反向代理后依据 `X-Forwarded-Proto` 标记 `Secure`，都必须设置此项（同时需要 `use_x_forwarded_for: true`）。不设置时这些头被忽略，代理回退使用请求的字面 scheme/base URL。对于带 ingress 的部署，优先使用 [`PROXY_BASE_URL`](#环境变量参考)。尽管带 `mcp_` 前缀，这是 LiteLLM 处理 `X-Forwarded-*` 头的通用请求信任边界，并非 MCP 专属设置。参见[安全最佳实践——反向代理后的安全 cookie](./security_best_practices#8-在-tls-终止的反向代理后面配置-secure-cookie) 与 [MCP OAuth——反向代理与 ingress 配置](../mcp_oauth#reverse-proxy-and-ingress-configuration)。 |
| trusted_proxy_ranges | list | `null` | 受信反向代理的 CIDR 段：为基于请求头的认证（`enable_oauth2_proxy_auth`、`custom_ui_sso_sign_in_handler`）提供身份头，其 `X-Forwarded-For` 作为管理界面登录限制的来源地址。客户端直连时设为 `[]`，改用对端地址。未设置时忽略 `X-Forwarded-For`，只应用按用户名的登录限制。[文档](./ui#限制登录失败尝试) |
| require_end_user_mcp_access_defined | boolean | `false` | 若为 true，要求终端用户显式定义 MCP 访问权限 |
| require_key_mcp_access_defined | boolean | `false` | 若为 true，MCP 服务器列表为空的密钥不再继承其团队的服务器；团队成为上限，密钥必须显式授予 MCP 服务器（直接授予或经访问组）。参见 [MCP 权限管理](../mcp_control#要求密钥自行定义-mcp-访问权限) |
| role_permissions | list | `null` | 基于角色的权限配置列表 |
| search_tools | list | `null` | 用于启用网页搜索能力的搜索工具配置列表 |
| token_rate_limit_type | string | `total` | 速率限制计数方式："total"、"output" 或 "input" Token |
| use_redis_transaction_buffer | boolean | `false` | 若为 true，数据库事务先在 Redis 中缓冲再写入 |
| use_shared_health_check | boolean | `false` | 若为 true，在多个代理实例间使用基于 Redis 的共享健康检查状态 |
| user_header_mappings | dict | `null` | 通过查找规则把自定义请求头映射到用户 ID |
| user_header_name | string | `null` | 用于从请求中提取用户身份的 HTTP 请求头名称 |

### worker_registry 参考

顶层键。在[全局控制平面](./global_control_plane.md)上设置它，列出其界面所管理的各独立代理。

| 名称 | 类型 | 说明 |
|------|------|-------------|
| worker_id | string | worker 的唯一标识符。必填 |
| name | string | worker 选择器中显示的名称。必填 |
| url | string | worker 实例的完整 URL，必须以 `http://` 或 `https://` 开头。必填 |

### router_settings 参考

:::info

大多数取值也可以通过 `litellm_settings` 设置。若两处存在重叠的值，`router_settings` 上的设置会覆盖 `litellm_settings` 上的。

:::

```yaml
router_settings:
  routing_strategy: simple-shuffle # Literal["simple-shuffle", "least-busy", "usage-based-routing","latency-based-routing"], default="simple-shuffle" - RECOMMENDED for best performance
  redis_host: <your-redis-host>           # string
  redis_password: <your-redis-password>   # string
  redis_port: <your-redis-port>           # string
  enable_pre_call_checks: true            # bool - Before call is made check if a call is within model context window
  allowed_fails: 3 # cooldown model if it fails > 1 call in a minute.
  cooldown_time: 30 # (in seconds) how long to cooldown model if fails/min > allowed_fails
  disable_cooldowns: True                  # bool - Disable cooldowns for all models
  enable_tag_filtering: True                # bool - Use tag based routing for requests
  tag_filtering_match_any: True             # bool - Tag matching behavior (only when enable_tag_filtering=true). `true`: match if deployment has ANY requested tag; `false`: match only if deployment has ALL requested tags
  tag_routing_prefix: "route:"              # string - Opt-in marker prefix (default ""). A request tag starting with this exact string is stripped and matched as an explicit routing directive, skipping the known-tag-vocabulary heuristic. Unprefixed tags keep matching as today.
  retry_policy: {                          # Dict[str, int]: retry policy for different types of exceptions
    "AuthenticationErrorRetries": 3,
    "TimeoutErrorRetries": 3,
    "RateLimitErrorRetries": 3,
    "ContentPolicyViolationErrorRetries": 4,
    "InternalServerErrorRetries": 4,
    "ServiceUnavailableErrorRetries": 4,
    "NotFoundErrorRetries": 0,             # never retry a 404
    "DefaultRetries": 2                    # retries for every error with no field of its own
  }
  allowed_fails_policy: {
    "BadRequestErrorAllowedFails": 1000, # Allow 1000 BadRequestErrors before cooling down a deployment
    "AuthenticationErrorAllowedFails": 10, # int
    "TimeoutErrorAllowedFails": 12, # int
    "RateLimitErrorAllowedFails": 10000, # int
    "ContentPolicyViolationErrorAllowedFails": 15, # int
    "InternalServerErrorAllowedFails": 20, # int
  }
  content_policy_fallbacks: [{"{{anthropic}}": ["my-fallback-model"]}] # List[Dict[str, List[str]]]: Fallback model for content policy violations
  fallbacks: [{"{{anthropic}}": ["my-fallback-model"]}] # List[Dict[str, List[str]]]: Fallback model for all errors
```

| 名称 | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| routing_strategy | string | `simple-shuffle` | 请求路由使用的策略。可选值："simple-shuffle"、"least-busy"、"usage-based-routing"、"latency-based-routing"。默认为 "simple-shuffle"。[更多信息](../routing) |
| redis_host | string | `null` | Redis 服务器主机地址。**只有当你运行多个 LiteLLM 代理实例并希望它们共享当前 tpm/rpm 统计时才设置** |
| redis_password | string | `null` | Redis 服务器密码。**只有当你运行多个 LiteLLM 代理实例并希望它们共享当前 tpm/rpm 统计时才设置** |
| redis_port | string | `null` | Redis 服务器端口号。**只有当你运行多个 LiteLLM 代理实例并希望它们共享当前 tpm/rpm 统计时才设置**|
| redis_db | int | `null` | Redis 服务器数据库编号。**只有当你运行多个 LiteLLM 代理实例并希望它们共享当前 tpm/rpm 统计时才设置**|
| content_policy_fallbacks | array of objects | `[]` | 指定内容策略违规时使用的回退模型。[更多信息](reliability) |
| fallbacks | array of objects | `[]` | 指定所有类型错误使用的回退模型。[更多信息](reliability) |
| enable_tag_filtering | boolean | `false` | 若为 true，对请求使用基于标签的路由 [基于标签的路由](tag_routing) |
| enable_weighted_failover | boolean | `false` | 若为 true 且 `routing_strategy` 为 `simple-shuffle`，某个部署出现可重试失败时，会先在同模型组的其他部署间（按权重）重新挑选，然后才进行跨组回退。默认：false。 |
| fallback_access_check | Optional[FallbackAccessCheck] | `null` | 仅限 SDK。一个异步判定函数 `(model, request_kwargs, llm_router) -> bool`，路由器在每次跨模型回退尝试前查询它；被其拒绝的目标会被跳过。代理注入自己的检查，并通过 `general_settings.enforce_fallback_model_access` 暴露。[更多信息](reliability#回退时强制执行密钥的模型访问权限) |
| fallback_budget_check | Optional[FallbackBudgetCheck] | `null` | 仅限 SDK。一个异步判定函数 `(model, request_kwargs, llm_router) -> bool`，路由器在每次跨模型回退尝试前查询它；被其判定超预算的目标会被跳过。代理注入自己的检查，并通过 `general_settings.enforce_fallback_budget` 暴露。[更多信息](reliability#回退时强制执行预算) |
| tag_filtering_match_any | boolean | `true` | 标签匹配行为（仅在 enable_tag_filtering=true 时生效）。`true`：部署含有任一请求标签即匹配；`false`：部署必须含有全部请求标签才匹配 |
| tag_routing_prefix | string | `""`（关闭） | 默认 `""`（不生效）。以该精确字符串开头的请求标签会被剥离，并作为显式、受信的路由指令匹配，豁免从部署标签词表推断路由意图的启发式规则。不带前缀的标签仍按现状匹配。[基于标签的路由](tag_routing) |
| cooldown_time | integer | `5` (seconds) | 模型超出允许失败次数后的冷却时长（秒）。 |
| disable_cooldowns | boolean | `false` | 若为 true，禁用所有模型的冷却。[更多信息](reliability) |
| retry_policy | object | `null` | 为不同类型的异常指定重试次数。[更多信息](reliability) |
| allowed_fails | integer | `3` | 模型进入冷却前允许的失败次数。[更多信息](reliability) |
| allowed_fails_policy | object | `null` | 为不同错误类型指定部署进入冷却前允许的失败次数。[更多信息](reliability) |
| default_max_parallel_requests | Optional[int] | `null`（无限制） | 单个部署的默认最大并行请求数。 |
| default_priority | (Optional[int]) | `null` | 请求的默认优先级。仅用于 '.scheduler_acompletion()'。默认为 None。 |
| polling_interval | (Optional[float]) | `0.03` (seconds) | 轮询队列的频率。仅用于 '.scheduler_acompletion()'。默认为 3 毫秒。 |
| max_fallbacks | Optional[int] | `5` | 退出调用前最多尝试的回退次数。 |
| default_litellm_params | Optional[dict] | `null` | 添加到所有请求的默认 litellm 参数（例如 `temperature`、`max_tokens`）。 |
| timeout | Optional[float] | `null`（使用 `litellm_settings.request_timeout`） | 请求的默认超时。默认为 10 分钟。 |
| stream_timeout | Optional[float] | `null`（使用 `timeout`） | 流式请求的默认超时。未设置时使用 'timeout' 的值。 |
| keepalive_seconds | Optional[float] | `null`（关闭） | 当上游模型静默超过该秒数时，在流式响应上发送 SSE `: ping` 注释，之后每隔 `keepalive_seconds` 重复一次，直到恢复真实内容。用于防止负载均衡器或反向代理关闭长时间静默、看似空闲的 SSE 连接（例如首个可见 token 之前的深度思考）。默认仅操作员可设：请求体中的请求级 `keepalive_seconds` 会被忽略，除非部署同时设置 `allow_client_keepalive_override: true`，此时请求可以缩小或更改部署值，包括用显式 `0` 禁用。部署级的 `0` 始终是请求无法覆盖的硬禁用，与是否允许覆盖无关。生效值被限制在 1-300 秒范围内。默认 None（关闭）。 |
| allow_client_keepalive_override | Optional[bool] | `false` | 请求中的 `keepalive_seconds` 是否允许覆盖该部署的 `keepalive_seconds`。默认 `false`，即对该部署而言 `keepalive_seconds` 仅操作员可设，请求级的值一律被静默忽略。 |
| debug_level | Literal["DEBUG", "INFO"] | `INFO` | 路由器日志库的调试级别。 |
| client_ttl | int | `3600` (seconds) | 缓存客户端的存活时间（秒）。 |
| cache_kwargs | dict | `{}` | 缓存初始化的额外关键字参数。用于那些经 `REDIS_*` 环境变量设置可能失败的非字符串 Redis 参数。 |
| routing_strategy_args | dict | `{}` | 路由策略的额外关键字参数，例如最低延迟路由的默认 ttl |
| model_group_alias | dict | `{}` | 模型组别名映射。例如 `{"claude-3-haiku": "claude-3-haiku-20240229"}` |
| num_retries | int | `2` | 请求的重试次数。 |
| default_fallbacks | Optional[List[str]] | `null` | 未定义模型组专属回退时尝试的回退。 |
| caching_groups | Optional[List[tuple]] | `null` | 用于跨模型组缓存的模型组列表。例如 caching_groups=[("openai-gpt-3.5-turbo", "azure-gpt-3.5-turbo")]|
| alerting_config | AlertingConfig | `null` | [仅限 SDK 的参数] Slack 告警配置。[更多文档](../routing.md#告警-) |
| assistants_config | AssistantsConfig | `null` | 通过 `assistant_settings` 在代理上设置。[更多文档](../assistants.md) |
| set_verbose | boolean | `false` | [已废弃参数，参见调试文档](./debugging) 若为 true，将日志级别设为 verbose。 |
| retry_after | int | `0` (seconds) | 重试请求前的等待时间（秒）。若收到来自 LLM API 的 `x-retry-after`，该值会被覆盖。 |
| provider_budget_config | ProviderBudgetConfig | `null` | 提供商预算配置。用于设置各 llm_provider 的预算上限，例如 OpenAI 每天 100 美元、Azure 每天 100 美元等。[更多文档](./provider_budget_routing.md) |
| enable_pre_call_checks | boolean | `false` | 若为 true，在发起调用前检查调用是否在模型上下文窗口内。`model_info.max_input_tokens` 的强制执行**必需**此项。[更多信息](reliability) |
| model_group_retry_policy | Dict[str, RetryPolicy] | `{}` | [仅限 SDK 的参数] 为模型组设置重试策略。 |
| context_window_fallbacks | List[Dict[str, List[str]]] | `[]` | 上下文窗口超限时的回退模型。 |
| redis_url | str | `null` | Redis 服务器 URL。**Redis URL 存在已知性能问题**。 |
| cache_responses | boolean | `false` | 启用 LLM 响应缓存的开关，作用于在 `router_settings` 下设置的缓存。若为 true，缓存响应。 |
| router_general_settings | RouterGeneralSettings | 代理上为 `{async_only_mode: true, pass_through_all_models: false}`（SDK 中 `async_only_mode: false`） | [仅限 SDK] Router 通用设置，包含 'async_only_mode' 等优化。[文档](../routing.md#router-通用设置) |
| optional_pre_call_checks | List[str] | `null` | 添加到路由器的调用前检查列表。支持：`router_budget_limiting`、`prompt_caching`、`responses_api_deployment_check`、`encrypted_content_affinity`（要求 LiteLLM >= 1.82.3）、`deployment_affinity`、`session_affinity`、`forward_client_headers_by_model_group` |
| deployment_affinity_ttl_seconds | int | `3600` (seconds) | 启用 `deployment_affinity` 时，用户密钥到部署亲和映射的 TTL（秒）（在 Router 初始化/代理启动时配置）。 |
| model_group_affinity_config | Dict[str, List[str]] | `null` | 按模型组的亲和开关。键为模型组名；值为要启用的检查列表（`deployment_affinity`、`responses_api_deployment_check`、`session_affinity`）。未列出的组回退到全局 `optional_pre_call_checks`。[文档](../response_api.md#按模型组的亲和性配置) |
| ignore_invalid_deployments | boolean | 代理上为 `true`（SDK 中 `false`） | 若为 true，忽略无效部署。代理总是设置此项，让无效模型不阻塞 `model_list` 其余部分的加载。 |
| auto_router_capability_limit | Optional[AutoRouterCapabilityLimit] | `null` | 仅限 SDK。一个可调用对象 `() -> Optional[int]`，路由器在每次注册与模型写入时查询它，以确定每个已授权的自动路由器能力（`classifier_type: heuristic_v2` 以及操作员定义的 `tier_definitions`）可被多少个复杂度路由器申领；None 表示不限制。每个能力独立计数。代理注入由许可证支撑的自己的解析器（除非许可证 `allowed_features` 包含 `auto_router`，否则每个能力一个路由器），并忽略 `router_settings` 中的该键。 |
| heuristic_v2_router_limit | Optional[HeuristicV2RouterLimit] | `null` | 仅限 SDK。`auto_router_capability_limit` 在 [BerriAI/litellm#39674](https://github.com/BerriAI/litellm/pull/39674) 重命名 Router 关键字前的现用名；对 `classifier_type: heuristic_v2` 路由器同样是 `() -> Optional[int]` 可调用上限。 |
| search_tools | List[SearchToolTypedDict] | `null` | 用于 Search API 集成的搜索工具配置列表。每个工具指定 search_tool_name 和含 search_provider、api_key、api_base 等的 litellm_params。[更多文档](../search/index.md) |
| guardrail_list | List[GuardrailTypedDict] | `null` | 用于防护栏负载均衡的防护栏配置列表。可在同名 guardrail_name 的多个防护栏部署间负载均衡。[更多文档](./guardrails/guardrail_load_balancing.md) |
| enable_health_check_routing | boolean | `false` | 若为 true，启用基于健康检查的部署过滤，避免把请求路由到不健康的部署 |
| background_health_check_model_groups | Optional[List[str]] | `null`（所有组） | 后台健康检查与健康检查路由的作用范围（模型组）。在代理上通常经 `general_settings.background_health_check_model_groups` 设置。默认 None（所有组） |
| health_check_staleness_threshold | integer | `600` (seconds) | 缓存健康检查结果的最长有效期（秒），超过即把部署标记为过期 |
| health_check_ignore_transient_errors | boolean | `false` | 若为 true，健康检查中的 429（速率限制）与 408（超时）失败将被忽略，不影响路由与冷却 |
| routing_groups | Optional[List[RoutingGroup]] | `null` | 各自对一部分模型应用自己路由策略的模型组列表。每个组有 `group_name`、`models`（与请求模型匹配的模型名列表）、`routing_strategy` 和可选的 `routing_strategy_args`。 |
| plugins | Optional[List[RoutingPlugin]] | `null` | [仅限 SDK 的参数] 在路由决策前运行的路由插件流水线。每个插件实现 `async def run(context: RoutingContext) -> RoutingContext`，读取/收窄 `candidate_models` 并为下一个插件（或最终路由决策）附加 `signals`。把候选收窄到零的插件会直接报错，而不是回退到未过滤的池。 |


### 环境变量参考

| 名称 | 说明 |
|------|-------------|
| LITELLM_DISABLE_LOGIN_RATE_LIMIT | 设为 `true` 关闭管理界面登录失败限制。启动时读取一次。[文档](./ui#限制登录失败尝试) |
| A2A_API_BASE | A2A 智能体请求的基础 URL |
| ACTIONS_ID_TOKEN_REQUEST_TOKEN | 在 GitHub Actions 中请求 ID 令牌所用的令牌 |
| ACTIONS_ID_TOKEN_REQUEST_URL | 在 GitHub Actions 中请求 ID 令牌所用的 URL |
| AGENT365_CLIENT_ID | `agent_365` 防护栏执行 On-Behalf-Of 交换所用网关 Entra 应用注册的客户端 ID |
| AGENT365_CLIENT_SECRET | `agent_365` 防护栏所用网关 Entra 应用注册的客户端密钥 |
| AGENT365_TENANT_ID | `agent_365` 防护栏执行 On-Behalf-Of 令牌交换所用的 Entra 租户 ID |
| AGENTOPS_ENVIRONMENT | AgentOps 日志集成的环境 |
| AGENTOPS_API_KEY | AgentOps 日志集成的 API 密钥 |
| AGENTOPS_SERVICE_NAME | AgentOps 日志集成的服务名称 |
| AI21_API_BASE | AI21 的基础 URL。默认为 https://api.ai21.com/studio/v1 |
| AIMLAPI_KEY | AI/ML API 图像生成中 `AIML_API_KEY` 的替代拼写，仅在 `AIML_API_KEY` 未设置时读取 |
| AIOHTTP_CONNECTOR_LIMIT | aiohttp 连接器的连接上限。设为 0 时不限制。**默认为 0** |
| AIOHTTP_CONNECTOR_LIMIT_PER_HOST | aiohttp 连接器的每主机连接上限。设为 0 时不限制。**默认为 0** |
| AIOHTTP_KEEPALIVE_TIMEOUT | aiohttp 连接的 keep-alive 超时（秒）。**默认为 120** |
| AIOHTTP_SO_KEEPALIVE | 在 aiohttp 套接字上启用 TCP `SO_KEEPALIVE`，让空闲的提供商连接在 NAT/负载均衡器静默丢弃之前被检测并回收。**默认为 False** |
| AIOHTTP_TCP_KEEPCNT | 连接判定为死亡前未应答的 TCP keepalive 探测次数（在 `AIOHTTP_SO_KEEPALIVE=True` 时生效）。**默认为 5** |
| AIOHTTP_TCP_KEEPIDLE | aiohttp TCP 连接发送 keepalive 探测前需空闲的秒数（在 `AIOHTTP_SO_KEEPALIVE=True` 时生效）。**默认为 60** |
| AIOHTTP_TCP_KEEPINTVL | 相邻两次 aiohttp TCP keepalive 探测之间的秒数（在 `AIOHTTP_SO_KEEPALIVE=True` 时生效）。**默认为 30** |
| AIOHTTP_TRUST_ENV | 向底层 aiohttp `ClientSession` 传递 `trust_env=True`，让 aiohttp 自身也读取 `~/.netrc` 与 `SSL_CERT_FILE` / `SSL_CERT_DIR` 环境变量。代理场景不需要：除非设置了 `DISABLE_AIOHTTP_TRUST_ENV`，LiteLLM 已为每个请求解析 `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY`。**默认为 False** |
| AIOHTTP_TTL_DNS_CACHE | aiohttp 的 DNS 缓存存活时间（秒）。**默认为 300** |
| AKTO_GUARDRAIL_API_BASE | Akto 防护栏 API 的基础 URL（例如 `http://localhost:9090`）。由 Akto 防护栏集成使用。 |
| AKTO_API_KEY | 与 Akto 防护栏服务认证用的 API 密钥。 |
| ALEPH_ALPHA_API_BASE | Aleph Alpha 的基础 URL。默认为 https://api.aleph-alpha.com/complete |
| ALEPH_ALPHA_API_KEY | Aleph Alpha 的 API 密钥 |
| ALERTING_WEBHOOK_URL | `SLACK_WEBHOOK_URL` 的提供商中立回退；`SLACK_WEBHOOK_URL` 未设置时用于 Slack 格式告警（例如 Rocket.Chat 或 Mattermost 的 incoming webhook） |
| ALLOWED_EMAIL_DOMAINS | 允许访问的邮箱域名列表 |
| AMAZON_NOVA_API_BASE | Amazon Nova 的基础 URL。默认为 https://api.nova.amazon.com/v1 |
| ANTHROPIC_AWS_API_BASE | AWS 上 Claude 的基础 URL，在 `ANTHROPIC_AWS_BASE_URL` 之后读取 |
| ANTHROPIC_AWS_API_KEY | AWS 上 Claude 的 API 密钥。设置后请求改带该密钥，而不再用 AWS SigV4 签名 |
| ANTHROPIC_AWS_BASE_URL | AWS 上 Claude 的基础 URL，在 `ANTHROPIC_AWS_API_BASE` 之前读取。两者都未设置时，端点从解析出的 AWS 区域推导 |
| ANTHROPIC_AWS_WORKSPACE_ID | 随 AWS 上 Claude 请求发送的 Anthropic 工作区 ID，除非请求逐次传入工作区 ID。接受 `ANTHROPIC_WORKSPACE_ID` 作为回退 |
| ANTHROPIC_WORKSPACE_ID | `ANTHROPIC_AWS_WORKSPACE_ID` 的回退 |
| ANYSCALE_API_BASE | Anyscale 的基础 URL。默认为 https://api.endpoints.anyscale.com/v1 |
| APISERPENT_API_BASE | APISerpent 搜索提供商的基础 URL |
| APSCHEDULER_COALESCE | 是否把同一任务的多个待执行合并为一次。**默认为 False** |
| APSCHEDULER_MAX_INSTANCES | 每个任务允许的最大并发实例数。**默认为 1** |
| APSCHEDULER_MISFIRE_GRACE_TIME | 错失任务的宽限秒数。**默认为 1** |
| APSCHEDULER_REPLACE_EXISTING | 是否替换同 ID 的既有任务。**默认为 False** |
| ARIZE_API_KEY | Arize 平台集成的 API 密钥 |
| ARIZE_SPACE_KEY | Arize 平台的 Space 密钥 |
| ARGILLA_BATCH_SIZE | Argilla 日志的批大小 |
| ARGILLA_API_KEY | Argilla 平台的 API 密钥 |
| ARGILLA_SAMPLING_RATE | Argilla 日志的采样率 |
| ARGILLA_DATASET_NAME | Argilla 日志的数据集名称 |
| ARGILLA_BASE_URL | Argilla 服务的基础 URL |
| ARK_API_BASE | 火山引擎 Ark responses 的基础 URL，在 `VOLCENGINE_API_BASE` 之后读取 |
| ATHINA_API_KEY | Athina 服务的 API 密钥 |
| ATHINA_BASE_URL | Athina 服务的基础 URL（默认 `https://log.athina.ai`） |
| AUTO_REDIRECT_UI_LOGIN_TO_SSO | 配置 SSO 后自动把管理界面登录页重定向到 SSO 的开关。默认为 **false** |
| AUDIO_SPEECH_CHUNK_SIZE | 语音处理分块的大小。默认为 1024 |
| ANTHROPIC_API_KEY | Anthropic 服务的 API 密钥。使用 `x-api-key` 请求头认证。 |
| ANTHROPIC_AUTH_TOKEN | Anthropic 服务的替代认证令牌。使用 `Authorization: Bearer` 请求头而非 `x-api-key`。在 `ANTHROPIC_API_KEY` 未设置时作为回退。 |
| ANTHROPIC_API_BASE | Anthropic API 的基础 URL。默认为 https://api.anthropic.com |
| ANTHROPIC_BASE_URL | `ANTHROPIC_API_BASE` 的替代项，用于设置 Anthropic API 基础 URL。在 `ANTHROPIC_API_BASE` 未设置时作为回退。 |
| ANTHROPIC_TOKEN_COUNTING_BETA_VERSION | Anthropic Token 计数 API 的 beta 版本头。默认为 `token-counting-2024-11-01` |
| AWS_ACCESS_KEY_ID | AWS 服务的访问密钥 ID |
| AWS_BATCH_ROLE_ARN | 批处理操作所用 AWS IAM 角色的 ARN |
| AWS_BEDROCK_RUNTIME_ENDPOINT | Bedrock 运行时的端点 URL，在逐请求未传 `api_base` 与 `aws_bedrock_runtime_endpoint` 时使用。覆盖 LiteLLM 本应从 AWS 区域推导的端点 |
| AWS_DEFAULT_REGION | `AWS_REGION` 未设置时服务交互使用的默认 AWS 区域 |
| AWS_PROFILE_NAME | 要使用的 AWS CLI 配置档名称 |
| AWS_RDS_READ_REPLICA_REGION | `IAM_TOKEN_DB_AUTH=True` 时读副本 RDS IAM 令牌的签名区域覆盖。默认取副本 RDS 主机名中的区域，再取进程的 AWS 区域。绝不继承 `AWS_RDS_REGION`；空值或纯空白视为未设置 |
| AWS_RDS_REGION | `IAM_TOKEN_DB_AUTH=True` 时写节点 RDS IAM 令牌的签名区域覆盖。默认取写节点 RDS 主机名中的区域，再取进程的 AWS 区域。空值或纯空白视为未设置 |
| AWS_REGION | 服务交互使用的 AWS 区域（优先于 AWS_DEFAULT_REGION） |
| AWS_REGION_NAME | 服务交互使用的默认 AWS 区域 |
| AWS_ROLE_ARN | 认证时要担任的 AWS IAM 角色 ARN |
| AWS_ROLE_NAME | AWS IAM 使用的角色名称 |
| AWS_S3_BUCKET_NAME | 文件操作所用 AWS S3 存储桶名称 |
| AWS_S3_OUTPUT_BUCKET_NAME | 批处理操作所用 AWS S3 输出存储桶名称 |
| AWS_SECRET_ACCESS_KEY | AWS 服务的秘密访问密钥 |
| AWS_SESSION_NAME | AWS 会话名称 |
| AWS_WEB_IDENTITY_TOKEN | AWS 的 Web 身份令牌 |
| AWS_WEB_IDENTITY_TOKEN_FILE | 包含 AWS Web 身份令牌的文件路径 |
| AZURE_API_VERSION | 所使用的 Azure API 版本 |
| AZURE_AI_API_BASE | Azure AI 服务（例如 Azure AI Anthropic）的基础 URL |
| AZURE_AI_API_KEY | Azure AI 服务（例如 Azure AI Anthropic）的 API 密钥 |
| AZURE_AUTHORITY_HOST | Azure 颁发机构主机 URL |
| AZURE_CERTIFICATE_PASSWORD | Azure OpenAI 证书的密码 |
| AZURE_CLIENT_ID | Azure 服务的客户端 ID |
| AZURE_CLIENT_SECRET | Azure 服务的客户端密钥 |
| AZURE_COMPUTER_USE_INPUT_COST_PER_1K_TOKENS | Azure Computer Use 服务的每 1K Token 输入成本 |
| AZURE_COMPUTER_USE_OUTPUT_COST_PER_1K_TOKENS | Azure Computer Use 服务的每 1K Token 输出成本 |
| AZURE_DEFAULT_RESPONSES_API_VERSION | 所使用的 Azure Default Responses API 版本。默认为 "preview" |
| AZURE_DOCUMENT_INTELLIGENCE_API_VERSION | Azure Document Intelligence 服务的 API 版本 |
| AZURE_DOCUMENT_INTELLIGENCE_DEFAULT_DPI | Azure Document Intelligence 服务的默认 DPI（每英寸点数）设置 |
| AZURE_SPEECH_API_BASE | Azure Speech 语音转写的基础 URL |
| AZURE_SPEECH_API_KEY | Azure Speech 语音转写的 API 密钥 |
| AZURE_TENANT_ID | Azure Active Directory 的租户 ID |
| AZURE_USERNAME | Azure 服务用户名，与 AZURE_PASSWORD 配合用于基本用户名/密码工作流的 Azure AD 令牌 |
| AZURE_PASSWORD | Azure 服务密码，与 AZURE_USERNAME 配合用于基本用户名/密码工作流的 Azure AD 令牌 |
| AZURE_FEDERATED_TOKEN_FILE | Azure 联合身份令牌的文件路径 |
| AZURE_FILE_SEARCH_COST_PER_GB_PER_DAY | Azure File Search 服务每 GB 每天的成本 |
| AZURE_POSTGRESQL_AUTH | 设为 `True` 时，使用短期 Microsoft Entra ID 访问令牌认证 Azure Database for PostgreSQL Flexible Server。LiteLLM 通过 Azure Identity 库为 `https://ossrdbms-aad.database.windows.net/.default` 范围请求令牌，并在过期前刷新。不能与 `IAM_TOKEN_DB_AUTH` 同时使用。需要 `DATABASE_HOST`、`DATABASE_USER` 和 `DATABASE_NAME`。身份选项与 AKS 工作负载身份设置参见 [`--azure_postgresql_auth`](./cli#--azure_postgresql_auth)。 |
| AZURE_SCOPE | EntraID 认证下 Azure 服务的作用域，默认为 "https://cognitiveservices.azure.com/.default" |
| AZURE_SENTINEL_DCR_IMMUTABLE_ID | Azure Sentinel 日志的数据收集规则不可变 ID |
| AZURE_SENTINEL_STREAM_NAME | Azure Sentinel 日志的流名称 |
| AZURE_SENTINEL_AUDIT_STREAM_NAME | Azure Sentinel 审计日志的流名称；未设置时回退到 AZURE_SENTINEL_STREAM_NAME |
| AZURE_SENTINEL_CLIENT_SECRET | Azure Sentinel 认证的客户端密钥 |
| AZURE_SENTINEL_ENDPOINT | Azure Sentinel 日志的端点 |
| AZURE_SENTINEL_TENANT_ID | Azure Sentinel 认证的租户 ID |
| AZURE_SENTINEL_CLIENT_ID | Azure Sentinel 认证的客户端 ID |
| AZURE_SENTINEL_AUTHORITY_HOST | Azure Sentinel 日志的 Microsoft Entra 颁发机构主机，Azure Government 例如 "https://login.microsoftonline.us"；回退到 AZURE_AUTHORITY_HOST，再回退到 Azure 公有云颁发机构 |
| AZURE_KEY_VAULT_URI | Azure Key Vault 的 URI |
| AZURE_OPERATION_POLLING_TIMEOUT | Azure 操作轮询的超时（秒） |
| AZURE_STORAGE_ACCOUNT_KEY | 认证 Azure Blob Storage 日志所用的 Azure 存储账户密钥 |
| AZURE_STORAGE_ACCOUNT_NAME | 写入 Azure Blob Storage 日志所用的 Azure 存储账户名称 |
| AZURE_STORAGE_FILE_SYSTEM | 写入 Azure Blob Storage 日志所用的 Azure 存储文件系统名称。（通常是容器名） |
| AZURE_STORAGE_TENANT_ID | 认证 Azure Blob Storage 日志所用的应用程序租户 ID |
| AZURE_STORAGE_CLIENT_ID | 认证 Azure Blob Storage 日志所用的应用程序客户端 ID |
| AZURE_STORAGE_CLIENT_SECRET | 认证 Azure Blob Storage 日志所用的应用程序客户端密钥 |
| AZURE_STORAGE_ENDPOINT_SUFFIX | Azure Blob Storage 日志所用的存储端点后缀，Azure Government 例如 core.usgovcloudapi.net。默认为 core.windows.net |
| AZURE_VECTOR_STORE_COST_PER_GB_PER_DAY | Azure Vector Store 服务每 GB 每天的成本 |
| BACKGROUND_HEALTH_CHECK_MAX_TOKENS | 代理后台健康检查中，模型没有 `health_check_max_tokens` 时 `max_tokens` 的可选全局默认值。未设置时非通配模型默认为 5。设置后同样适用于通配路由。默认未设置 |
| BACKGROUND_HEALTH_CHECK_MAX_TOKENS_REASONING | 对**非通配**推理模型（`supports_reasoning(model)=true`），设置时优先于 `BACKGROUND_HEALTH_CHECK_MAX_TOKENS`。未设置时推理模型回退到 `BACKGROUND_HEALTH_CHECK_MAX_TOKENS`（若设置）或默认行为。通配路由忽略此项。默认未设置 |
| BACKGROUND_INTERACTION_COST_POLLING_ENABLED | 设为 `false` 可停止代理轮询 `background=true` 的 Interactions API 请求以获取最终用量。这些请求的成本将不再被追踪。默认为 `true` |
| BACKGROUND_INTERACTION_COST_POLL_INITIAL_INTERVAL_SECONDS | 首次轮询后台交互前的延迟秒数。每次重试间隔翻倍。默认为 5 |
| BACKGROUND_INTERACTION_COST_POLL_MAX_INTERVAL_SECONDS | 后台交互轮询间隔退避的上限秒数。默认为 60 |
| BACKGROUND_INTERACTION_COST_POLL_TIMEOUT_SECONDS | 持续轮询后台交互多少秒后放弃并释放其预算预留。默认为 3600（1 小时） |
| BASETEN_API_BASE | Baseten 的基础 URL。默认为 https://inference.baseten.co/v1 |
| BATCH_STATUS_POLL_INTERVAL_SECONDS | 轮询批处理状态的间隔秒数。默认为 3600（1 小时） |
| BATCH_STATUS_POLL_MAX_ATTEMPTS | 轮询批处理状态的最大尝试次数。默认为 24（对应 24 小时） |
| BEDROCK_API_BASE | Bedrock 重排序请求的基础 URL |
| BEDROCK_MANTLE_API_BASE | Bedrock Mantle 的基础 URL |
| BEDROCK_MAX_POLICY_SIZE | Bedrock 策略的最大大小。默认为 75 |
| BEDROCK_MIN_THINKING_BUDGET_TOKENS | Bedrock 推理模型的最小思考预算（Token）。budget_tokens 低于该值时 Bedrock 返回 400 错误。更低的取值会被钳制到该最小值。默认为 1024 |
| BFL_API_BASE | Black Forest Labs 图像生成与编辑的基础 URL |
| BLACK_FOREST_LABS_API_KEY | Black Forest Labs 的 API 密钥，在 `BFL_API_KEY` 之后读取 |
| BRAINTRUST_API_KEY | Braintrust 集成的 API 密钥 |
| BRAINTRUST_API_BASE | Braintrust API 的基础 URL。默认为 https://api.braintrustdata.com/v1 |
| BRAINTRUST_MOCK | 为 Braintrust 集成测试启用模拟模式。设为 true 时拦截 Braintrust API 调用并返回模拟响应，不做真实网络调用。默认为 false |
| BRAINTRUST_MOCK_LATENCY_MS | 模拟模式启用时 Braintrust API 调用的模拟延迟（毫秒），模拟网络往返耗时。默认为 100ms |
| BRAVE_API_BASE | Brave 搜索提供商的基础 URL |
| CACHED_STREAMING_CHUNK_DELAY | 缓存流式分块的延迟秒数。默认为 0.02 |
| CEREBRAS_API_BASE | Cerebras 的基础 URL。默认为 https://api.cerebras.ai/v1 |
| CHATGPT_API_BASE | ChatGPT API 的基础 URL。默认为 https://chatgpt.com/backend-api/codex |
| CHATGPT_AUTH_FILE | ChatGPT 认证数据的文件名。默认为 "auth.json" |
| CHATGPT_DEFAULT_INSTRUCTIONS | ChatGPT 提供商的默认系统指令 |
| CHATGPT_ORIGINATOR | ChatGPT API 请求的发起方标识。默认为 "codex_cli_rs" |
| CHATGPT_TOKEN_DIR | 存放 ChatGPT 认证令牌的目录。默认为 "~/.config/litellm/chatgpt" |
| CHATGPT_USER_AGENT | ChatGPT API 请求的自定义 User Agent 字符串 |
| CHATGPT_USER_AGENT_SUFFIX | 追加到 ChatGPT User Agent 字符串之后的后缀 |
| CIRCLE_OIDC_TOKEN | CircleCI 的 OpenID Connect 令牌 |
| CIRCLE_OIDC_TOKEN_V2 | CircleCI OpenID Connect 令牌的第 2 版 |
| CLI_JWT_EXPIRATION_HOURS | CLI 生成 JWT 令牌的过期时间（小时）。默认为 24 小时。也可通过 LITELLM_CLI_JWT_EXPIRATION_HOURS 设置 |
| CLI_SSO_CLAIM_MAP | 以逗号分隔的白名单，把 OIDC claim 路径映射到 CLI SSO 的 LiteLLM 用户 `metadata` 键（例如 `employment_type->acme_employment_type,org_info.department->department`）。标量值也会在 `/sso/cli/poll` 中作为 `attribution_metadata` 返回。别名：`LITELLM_CLI_SSO_CLAIM_MAP` |
| CLICKHOUSE_DATABASE | 追踪使用 ClickHouse 存储时，LiteLLM 写入花费日志与追踪记录的 ClickHouse 数据库。默认 `litellm` |
| CLICKHOUSE_FLUSH_INTERVAL_SECONDS | LiteLLM 缓冲的 ClickHouse 行（如开启追踪时的花费日志）两次刷写之间的秒数。整批会提前刷写。默认 `1.0` |
| CLICKHOUSE_URL | 追踪使用 ClickHouse 存储时，LiteLLM 写入花费日志与追踪记录的 ClickHouse HTTP 端点，例如 `http://default:<password>@clickhouse:8123`。ClickHouse 追踪必需。参见 [Lens](lens) |
| CLOUDFLARE_API_BASE | Cloudflare Workers AI 的基础 URL |
| CLOUDZERO_API_KEY | 用于认证的 CloudZero API 密钥 |
| CLOUDZERO_CONNECTION_ID | 用于数据提交的 CloudZero 连接 ID |
| CLOUDZERO_EXPORT_INTERVAL_MINUTES | CloudZero 数据导出操作的间隔（分钟） |
| CLOUDZERO_MAX_FETCHED_DATA_RECORDS | 从 CloudZero 获取的最大数据记录数 |
| CLOUDZERO_TIMEZONE | 日期处理所用时区（默认：UTC） |
| CODESTRAL_API_BASE | Codestral 的基础 URL。默认为 https://codestral.mistral.ai/v1 |
| COGNITION_API_BASE | Cognition 的基础 URL。默认为 https://api.cognition.ai/v1 |
| COGNITION_API_KEY | Cognition 的 API 密钥 |
| COMETAPI_API_BASE | CometAPI 的基础 URL，在 `COMETAPI_BASE_URL` 之后读取。默认为 https://api.cometapi.com/v1 |
| COMETAPI_API_KEY | CometAPI 的 API 密钥，在 `COMETAPI_KEY` 之后读取 |
| COMETAPI_BASE_URL | CometAPI 图像生成的基础 URL，在 `COMETAPI_API_BASE` 之前读取 |
| CONFIG_FILE_PATH | 配置文件的路径 |
| CRW_API_BASE | FastCRW 搜索提供商的基础 URL |
| CYBERARK_ACCOUNT | 密钥管理用的 CyberArk 账户名 |
| CYBERARK_API_BASE | CyberArk API 的基础 URL |
| CYBERARK_API_KEY | CyberArk 密钥管理服务的 API 密钥 |
| CYBERARK_CLIENT_CERT | CyberArk 认证所用客户端证书的路径 |
| CYBERARK_CLIENT_KEY | CyberArk 认证所用客户端密钥的路径 |
| CYBERARK_USERNAME | CyberArk 认证的用户名 |
| CYBERARK_SSL_VERIFY | 启用或禁用 CyberArk SSL 证书校验的开关。默认为 True |
| CONFIDENT_API_KEY | DeepEval 集成的 API 密钥 |
| CUSTOM_TIKTOKEN_CACHE_DIR | Tiktoken 缓存的自定义目录 |
| CONFIDENT_API_KEY | Confident AI（Deepeval）日志服务的 API 密钥 |
| COHERE_API_BASE | Cohere API 的基础 URL。默认为 https://api.cohere.com |
| COMPETITOR_LLM_TEMPERATURE | 竞争者发现所用 LLM 的温度设置。默认为 0.3 |
| CURSOR_API_BASE | Cursor AI 提供商集成的 API 基础 URL。默认为 https://api.cursor.com |
| DASHSCOPE_API_BASE_IMAGE | DashScope 图像生成的基础 URL。默认为 https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation |
| DASHSCOPE_API_BASE_RERANK | DashScope 重排序的基础 URL。默认为 https://dashscope.aliyuncs.com/compatible-api/v1/reranks |
| DASHSCOPE_API_BASE_VIDEO | DashScope 视频生成的基础 URL。默认为 https://dashscope.aliyuncs.com |
| DATABASE_HOST | 数据库服务器主机名 |
| DATABASE_HOST_READ_REPLICA | 读副本数据库服务器主机名。仅在组件化部署中、`IAM_TOKEN_DB_AUTH=True` 或 `AZURE_POSTGRESQL_AUTH=True` 时，用于由离散数据库环境变量组装 `DATABASE_URL_READ_REPLICA` |
| DATABASE_NAME | 数据库名称 |
| DATABASE_NAME_READ_REPLICA | 读副本的数据库名称（默认 `DATABASE_NAME`）。仅在组件化部署且 `IAM_TOKEN_DB_AUTH=True` 或 `AZURE_POSTGRESQL_AUTH=True` 时使用 |
| DATABASE_PASSWORD | 数据库用户的密码 |
| DATABASE_PORT | 数据库连接的端口号 |
| DATABASE_PORT_READ_REPLICA | 读副本的端口（默认 5432）。仅在组件化部署且 `IAM_TOKEN_DB_AUTH=True` 或 `AZURE_POSTGRESQL_AUTH=True` 时使用 |
| DATABASE_SCHEMA | 数据库中使用的 schema 名称 |
| DATABASE_SCHEMA_READ_REPLICA | 读副本的 schema 名称（默认 `DATABASE_SCHEMA`）。仅在组件化部署且 `IAM_TOKEN_DB_AUTH=True` 或 `AZURE_POSTGRESQL_AUTH=True` 时使用 |
| DATABASE_URL | 数据库连接 URL |
| DATABASE_URL_READ_REPLICA | 可选的读副本连接 URL。设置后，代理把只读查询（find_*、count、group_by、query_raw/_first）路由到该端点，写入仍使用 `DATABASE_URL`。未设置时回退为仅写节点行为。`IAM_TOKEN_DB_AUTH=True` 或 `AZURE_POSTGRESQL_AUTH=True` 时，读令牌与写令牌一同自动刷新 |
| DATABASE_USER | 数据库连接用户名 |
| DATABASE_USER_READ_REPLICA | 读副本的数据库用户（默认 `DATABASE_USER`）。仅在组件化部署且 `IAM_TOKEN_DB_AUTH=True` 或 `AZURE_POSTGRESQL_AUTH=True` 时使用 |
| DATABASE_USERNAME | 数据库用户别名 |
| DATABRICKS_API_BASE | Databricks API 的基础 URL |
| DATABRICKS_API_KEY | Databricks API 认证用的 API 密钥（个人访问令牌） |
| DATABRICKS_CLIENT_ID | Databricks OAuth M2M 认证的客户端 ID（服务主体应用 ID） |
| DATABRICKS_CLIENT_SECRET | Databricks OAuth M2M 认证的客户端密钥 |
| DATABRICKS_USER_AGENT | Databricks API 请求的自定义 User Agent 字符串。用于合作伙伴遥测归因 |
| DATAFORSEO_API_BASE | DataForSEO 搜索提供商的基础 URL |
| DAYS_IN_A_MONTH | 计算用的一月天数。默认为 28 |
| DAYS_IN_A_WEEK | 计算用的一周天数。默认为 7 |
| DAYS_IN_A_YEAR | 计算用的一年天数。默认为 365 |
| DEEPGRAM_API_BASE | Deepgram 语音转写的基础 URL。默认为 https://api.deepgram.com/v1 |
| DEEPINFRA_API_BASE | DeepInfra 的基础 URL。默认为 https://api.deepinfra.com/v1/openai |
| DEEPSEEK_ANTHROPIC_API_BASE | DeepSeek 的 Anthropic 兼容 `/messages` 端点基础 URL，在 `DEEPSEEK_API_BASE` 之前读取 |
| DEEPSEEK_API_BASE | DeepSeek 的基础 URL。默认为 https://api.deepseek.com/beta |
| DISABLE_KEY_NAME | 停止在生成的密钥上存储缩写密钥名的开关。界面靠该缩写识别哪个密钥花了多少钱，设置后花费更难归因到具体密钥。**默认为 False** |
| DRAIN_ENDPOINT_TOKEN | 调用 `/health/drain` 端点时 `X-Drain-Token` 请求头所需的共享密钥。设置后（此处或经 `general_settings.drain_endpoint_token`），不带匹配令牌的排空调用返回 401；未设置时端点保持仅可选启用的行为。让 kubelet 从 preStop 的 `httpGet.httpHeaders` 发送。 |
| DYNAMOAI_API_KEY | DynamoAI 防护栏服务的 API 密钥 |
| DYNAMOAI_API_BASE | DynamoAI API 的基础 URL。默认为 https://api.dynamo.ai |
| DYNAMOAI_MODEL_ID | 用于 DynamoAI 追踪/日志的模型 ID |
| DYNAMOAI_POLICY_IDS | 要应用的 DynamoAI 策略 ID（逗号分隔） |
| DD_BASE_URL | Datadog 集成的基础 URL |
| EDENAI_API_BASE | Eden AI 的基础 URL。默认为 https://api.edenai.run/v3；欧盟端点设为 https://api.eu.edenai.run/v3 |
| EDENAI_API_KEY | Eden AI 的 API 密钥 |
| ELEVENLABS_API_BASE | ElevenLabs 的基础 URL。默认为 https://api.elevenlabs.io |
| EMPOWER_API_BASE | Empower 的基础 URL。默认为 https://app.empower.dev/api/v1 |
| EXA_API_BASE | Exa AI 搜索提供商的基础 URL |
| FAL_AI_API_BASE | fal.ai 图像生成的基础 URL |
| FAL_AI_QUEUE_API_BASE | 经 `/fal_ai` 透传路由转发的 fal.ai 队列请求的基础 URL。默认为 https://queue.fal.run |
| FEATHERLESS_AI_API_BASE | Featherless AI 的基础 URL，在 `FEATHERLESS_API_BASE` 之前读取 |
| FEATHERLESS_API_BASE | `FEATHERLESS_AI_API_BASE` 的别名 |
| FEATHERLESS_API_KEY | `FEATHERLESS_AI_API_KEY` 的别名 |
| FIRECRAWL_API_BASE | Firecrawl 搜索提供商的基础 URL |
| FIREWORKSAI_API_KEY | Fireworks AI API 密钥的别名，在 `FIREWORKS_API_KEY` 与 `FIREWORKS_AI_API_KEY` 之后读取 |
| FIREWORKS_ACCOUNT_ID | Fireworks AI 账户 ID，从 Fireworks AI 的 `/models` 端点列出模型时必需。未设置时该请求会以明确的错误失败 |
| FIREWORKS_AI_TOKEN | Fireworks AI API 密钥四个可接受名称中的最后一个，在 `FIREWORKS_API_KEY`、`FIREWORKS_AI_API_KEY` 和 `FIREWORKSAI_API_KEY` 之后 |
| FIREWORKS_API_BASE | Fireworks AI 的基础 URL。默认为 https://api.fireworks.ai/inference/v1 |
| FRIENDLIAI_API_KEY | FriendliAI 的 API 密钥，接受 `FRIENDLI_TOKEN` 作为回退 |
| FRIENDLI_API_BASE | FriendliAI 的基础 URL。默认为 https://api.friendli.ai/serverless/v1 |
| GALADRIEL_API_BASE | Galadriel 的基础 URL。默认为 https://api.galadriel.com/v1 |
| GDC_API_BASE | GDC 的基础 URL |
| GDC_API_KEY | GDC 的 API 密钥 |
| GIGACHAT_ACCESS_TOKEN | GigaChat 的预签发访问令牌，直接使用，不再在 `GIGACHAT_AUTH_URL` 交换凭据 |
| GIGACHAT_API_BASE | GigaChat 的基础 URL |
| GIGACHAT_API_KEY | GigaChat 的凭据，在 `GIGACHAT_CREDENTIALS` 之后读取，并在 `GIGACHAT_AUTH_URL` 交换为访问令牌 |
| GIGACHAT_AUTH_URL | 用于将 GigaChat 凭据换取访问令牌的 OAuth 令牌端点。默认为 GigaChat 生产环境认证 URL
| GITHUB_API_BASE | GitHub Models 的基础 URL。默认为 https://models.inference.ai.azure.com
| GOOGLE_PSE_API_BASE | Google Programmable Search Engine 搜索提供商的基础 URL
| GROQ_API_BASE | Groq 的基础 URL。默认为 https://api.groq.com/openai/v1
| HYPERBOLIC_API_BASE | Hyperbolic 的基础 URL
| INCEPTION_API_BASE | Inception 的基础 URL。默认为 https://api.inceptionlabs.ai/v1
| JINA_AI_API_BASE | Jina AI 嵌入的基础 URL。默认为 https://api.jina.ai/v1
| JINA_AI_API_KEY | Jina AI 的 API 密钥
| JINA_AI_TOKEN | `JINA_AI_API_KEY` 的回退值
| JINA_API_KEY | `JINA_AI_API_KEY` 的回退值
| LANGFLOW_API_BASE | Langflow 的基础 URL。默认为 http://localhost:7860
| LANGFLOW_API_KEY | Langflow 的 API 密钥
| BESPOKE_API_BASE | Bespoke Nimble System One 服务器的 HTTP(S) 基础 URL（不含 `/v1/systemone`），用于 `/bespoke/v1/systemone` 及 `provider: bespoke` 的 [OSS 分类器](/docs/auto_router/decision_classifiers)。未提供分类器端点时必填 |
| BESPOKE_API_KEY | 与 `BESPOKE_API_BASE` 搭配的可选 Bearer 密钥。显式设置分类器 `api_base` 时只使用其显式 `api_key`，绝不继承环境变量中的密钥 |
| LAYA_API_BASE | 自托管 Laya 服务器的 HTTP(S) 基础 URL（不含 `/v1/systemone`），用于原生网关决策，以及 `opensource_classifier_config.provider: laya` 且未填 `api_base` 的 [OSS 分类器](/docs/auto_router/decision_classifiers)。未提供分类器端点时必填。需要包含 [LiteLLM #43626](https://github.com/BerriAI/litellm/pull/43626) 的构建版本 |
| LAYA_API_KEY | 与 `LAYA_API_BASE` 搭配的可选 Bearer 密钥。显式设置 `opensource_classifier_config.api_base` 的 Laya 分类器只使用其显式 `api_key`；省略该密钥则以无认证方式连接 |
| LEMONADE_API_KEY | Lemonade 的 API 密钥
| LINKUP_API_BASE | Linkup 搜索提供商的基础 URL
| LLAMAFILE_API_KEY | llamafile 的 API 密钥。llamafile 本身不要求密钥，未设置时会使用占位值
| LLAMA_API_BASE | Llama API 的基础 URL。默认为 https://api.llama.com/compat/v1
| MANUS_API_BASE | Manus 的基础 URL。默认为 https://api.manus.im
| MARITALK_API_BASE | MariTalk 的基础 URL。默认为 https://chat.maritaca.ai/api
| MARITALK_API_KEY | MariTalk 的 API 密钥
| MISTRAL_AZURE_API_BASE | 通过 Azure AI 提供的 Mistral 模型的基础 URL
| MISTRAL_AZURE_API_KEY | 通过 Azure AI 提供的 Mistral 模型的 API 密钥
| MODELSCOPE_API_BASE | ModelScope 的基础 URL
| MODELSCOPE_API_KEY | ModelScope 的 API 密钥
| MORPH_API_BASE | Morph 的基础 URL。默认为 https://api.morphllm.com/v1
| NEBIUS_API_BASE | Nebius 的基础 URL。默认为 https://api.studio.nebius.ai/v1
| NIMBLE_API_BASE | Nimble 搜索提供商的基础 URL。默认为 https://sdk.nimbleway.com/v2
| NLP_CLOUD_API_BASE | NLP Cloud 的基础 URL。默认为 https://api.nlpcloud.io/v1/gpu/
| NOVITA_API_BASE | Novita 的基础 URL。默认为 https://api.novita.ai/v3/openai
| NSCALE_API_BASE | Nscale 的基础 URL
| OLLAMA_API_BASE | Ollama 的基础 URL。默认为 http://localhost:11434
| OLLAMA_API_KEY | Ollama 的 API 密钥，供位于需要认证的代理之后的部署使用
| OPENAI_LIKE_API_BASE | `openai_like` 提供商的基础 URL，用于访问任意 OpenAI 兼容端点
| OPENAI_LIKE_API_KEY | `openai_like` 提供商的 API 密钥。未设置时留空，因为部分 OpenAI 兼容服务器不需要密钥
| OPENAI_PROJECT | OpenAI 请求携带的 OpenAI 项目 ID，等同于传入 `project`
| OR_API_KEY | OpenRouter 的 API 密钥，读取顺序在 `OPENROUTER_API_KEY` 之后
| OVHCLOUD_API_BASE | OVHcloud AI Endpoints 的基础 URL
| PARALLEL_AI_API_BASE | Parallel AI 搜索提供商的基础 URL
| PERPLEXITY_API_BASE | Perplexity 的基础 URL。默认为 https://api.perplexity.ai
| PG_VECTOR_API_BASE | pgvector 向量存储的基础 URL
| PG_VECTOR_API_KEY | pgvector 向量存储的 API 密钥
| PINSTRIPES_API_KEY | Pinstripes 的 API 密钥
| PROMETHEUS_SELECTED_INSTANCE | 代理查询 `PROMETHEUS_URL` 获取回退指标时限定使用的 Prometheus `instance` 标签。携带其他 instance 的序列会被跳过；未设置时统计所有 instance
| QWEN_AI_PLATFORM_API_BASE | 千问 AI 平台（中国大陆）的基础 URL。默认为 https://dashscope.aliyuncs.com/compatible-mode/v1
| QWEN_AI_PLATFORM_API_BASE_IMAGE | 千问 AI 平台图像生成的基础 URL。默认为 https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
| QWEN_AI_PLATFORM_API_BASE_RERANK | 千问 AI 平台重排序的基础 URL。默认为 https://dashscope.aliyuncs.com/compatible-api/v1/reranks
| QWEN_AI_PLATFORM_API_BASE_VIDEO | 千问 AI 平台视频生成的基础 URL。默认为 https://dashscope.aliyuncs.com
| QWEN_AI_PLATFORM_API_KEY | 千问 AI 平台的 API 密钥，读取顺序在 `DASHSCOPE_API_KEY` 回退之前
| QWENCLOUD_API_BASE | QwenCloud 的基础 URL。默认为 https://dashscope-intl.aliyuncs.com/compatible-mode/v1
| QWENCLOUD_API_BASE_IMAGE | QwenCloud 图像生成的基础 URL。默认为 https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
| QWENCLOUD_API_BASE_RERANK | QwenCloud 重排序的基础 URL。默认为 https://dashscope-intl.aliyuncs.com/compatible-api/v1/reranks
| QWENCLOUD_API_BASE_VIDEO | QwenCloud 视频生成的基础 URL。默认为 https://dashscope-intl.aliyuncs.com
| QWENCLOUD_API_KEY | QwenCloud 的 API 密钥，读取顺序在 `DASHSCOPE_API_KEY` 回退之前
| REDIS_AZURE_AD_TOKEN | 启用 Redis Azure AD 认证的标志。将其设为 `true`（不是设成令牌值）。若同时配置了 GCP IAM 服务账号，则忽略该设置并给出警告。**默认值为 False**
| REDUCTO_API_KEY | Reducto OCR 的 API 密钥
| REPLICATE_API_BASE | Replicate 的基础 URL。默认为 https://api.replicate.com/v1
| RUNWAYML_API_BASE | RunwayML 的基础 URL
| RUNWAYML_API_SECRET | RunwayML 的 API 密钥，读取顺序在 `RUNWAYML_API_KEY` 之前
| SAMBANOVA_API_BASE | SambaNova 的基础 URL。默认为 https://api.sambanova.ai/v1
| SCHEDULED_JOB_SHUTDOWN_CANCEL_TIMEOUT_SECONDS | 代理关闭时等待已取消的定时任务记录其执行结果的秒数，超时后放弃。默认 5
| SCHEDULED_JOB_SHUTDOWN_FINISH_TIMEOUT_SECONDS | 代理关闭时等待进行中的定时任务（花费日志清理、花费写入）完成的秒数，超时后取消。默认 5
| SCX_API_BASE | SCX.ai 的基础 URL。默认为 https://api.scx.ai/v1
| SCX_API_KEY | SCX.ai 的 API 密钥
| SEARCHAPI_API_BASE | SearchApi 搜索提供商的基础 URL
| SERPER_API_BASE | Serper 搜索提供商的基础 URL
| SONIOX_API_BASE | Soniox 的基础 URL。默认为 https://api.soniox.com
| SONIOX_API_KEY | Soniox 的 API 密钥
| SPACE_ID | watsonx 部署空间 ID 的第四个可用名称，读取顺序在 `WATSONX_DEPLOYMENT_SPACE_ID`、`WATSONX_SPACE_ID` 和 `WX_SPACE_ID` 之后
| STABILITY_API_BASE | Stability AI 图像生成与编辑的基础 URL
| TAVILY_API_BASE | Tavily 搜索提供商的基础 URL
| TINYFISH_AGENT_API_BASE | TinyFish Agent 透传的基础 URL。默认为 https://agent.tinyfish.ai
| TINYFISH_ALLOW_AUTHENTICATED_RUNS | 设为 `true` 后，TinyFish Agent 透传请求可以使用 vault 和浏览器配置文件字段
| TINYFISH_API_BASE | TinyFish 搜索提供商的基础 URL
| TINYFISH_COST_PER_STEP | TinyFish Agent 透传花费追踪的每步美元费率。默认为 0.016
| TOGETHER_AI_API_BASE | Together AI 的基础 URL。默认为 https://api.together.xyz/v1
| TOGETHER_AI_API_KEY | Together AI API 密钥的别名，读取顺序在 `TOGETHER_API_KEY` 之后、`TOGETHERAI_API_KEY` 之前
| TOGETHER_AI_TOKEN | Together AI API 密钥的第四个可用名称，读取顺序在 `TOGETHER_API_KEY`、`TOGETHER_AI_API_KEY` 和 `TOGETHERAI_API_KEY` 之后
| TOGETHER_API_KEY | Together AI API 密钥的第一个可用名称，优先于 `TOGETHER_AI_API_KEY`、`TOGETHERAI_API_KEY` 和 `TOGETHER_AI_TOKEN`
| TOPAZ_API_BASE | Topaz Labs 的基础 URL。默认为 https://api.topazlabs.com
| V0_API_BASE | v0 的基础 URL。默认为 https://api.v0.dev/v1
| VERCEL_AI_GATEWAY_API_BASE | Vercel AI Gateway 的基础 URL。默认为 https://ai-gateway.vercel.sh/v1
| VERTEXAI_API_BASE | Vertex AI 的基础 URL，读取顺序在 `VERTEX_API_BASE` 之前
| VERTEX_API_BASE | `VERTEXAI_API_BASE` 的别名
| VERTEX_CREDENTIALS | `VERTEXAI_CREDENTIALS` 的回退值：可以是 Vertex AI 服务账号 JSON 文件的路径，也可以是 JSON 本身
| VLLM_API_BASE | 自托管 vLLM 服务器的基础 URL
| VOLCENGINE_API_BASE | 火山引擎（Volcengine）的基础 URL。默认为 https://ark.cn-beijing.volces.com/api/v3
| VOYAGE_AI_API_KEY | VoyageAI by MongoDB API 密钥的别名，读取顺序在 `VOYAGE_API_KEY` 之后
| VOYAGE_AI_TOKEN | VoyageAI by MongoDB API 密钥的第三个可用名称，读取顺序在 `VOYAGE_API_KEY` 和 `VOYAGE_AI_API_KEY` 之后
| VOYAGE_API_BASE | VoyageAI by MongoDB 重排序请求的基础 URL；未设置时，MongoDB 签发的密钥（`al-` 开头）指向 ai.mongodb.com，其他密钥指向 api.voyageai.com
| WANDB_API_BASE | Weights & Biases Inference 的基础 URL。默认为 https://api.inference.wandb.ai/v1
| WATSONX_IAM_URL | 用于将 watsonx API 密钥换取 Bearer 令牌的 IBM Cloud IAM 令牌端点。默认为 https://iam.cloud.ibm.com/identity/token
| WATSONX_REGION | watsonx.ai 的区域，`WX_REGION` 和 `REGION` 可依次作为回退
| WATSONX_SPACE_ID | watsonx.ai 的部署空间 ID，读取顺序在 `WATSONX_DEPLOYMENT_SPACE_ID` 之后
| WML_URL | watsonx 基础 URL 的第四个可用名称，读取顺序在 `WATSONX_API_BASE`、`WATSONX_URL` 和 `WX_URL` 之后
| WORKER_CONFIG | `litellm` CLI 启动工作进程时传给它们的序列化代理配置。由 CLI 自行设置；如需让代理使用你自己的配置文件，请使用 `CONFIG_FILE_PATH`
| WX_API_KEY | watsonx API 密钥的别名：生成 IAM 令牌时最先读取；认证请求时在 `WATSONX_APIKEY` 和 `WATSONX_API_KEY` 之后读取
| WX_PROJECT_ID | `WATSONX_PROJECT_ID` 的别名，`PROJECT_ID` 可作为进一步回退
| WX_REGION | `WATSONX_REGION` 的别名
| WX_SPACE_ID | `WATSONX_SPACE_ID` 的别名
| WX_URL | watsonx 基础 URL 的别名，读取顺序在 `WATSONX_API_BASE` 和 `WATSONX_URL` 之后
| XAI_API_BASE | xAI 的基础 URL。默认为 https://api.x.ai
| XAI_OAUTH_API_BASE | xAI OAuth 流程的基础 URL，读取顺序在 `XAI_API_BASE` 之前
| XAI_OAUTH_AUTH_FILE | `XAI_OAUTH_TOKEN_DIR` 内存放 `litellm xai-oauth login` 写入的 xAI OAuth 令牌的文件名。默认为 auth.json
| XAI_OAUTH_TOKEN_DIR | 存放 xAI OAuth 令牌文件的目录。默认为 ~/.config/litellm/xai_oauth
| YOUCOM_API_BASE | You.com 搜索提供商的基础 URL
| ZAI_API_BASE | Z.ai 的基础 URL
| DD_AGENT_HOST | DataDog agent 的主机名或 IP（如 "localhost"）。设置后日志发送到 agent 而非直接调用 API
| DD_AGENT_PORT | 用于日志接收的 DataDog agent 端口。默认 10518
| DD_API_KEY | Datadog 集成的 API 密钥
| DD_APP_KEY | Datadog Cost Management 集成的应用密钥。成本指标需要与 DD_API_KEY 搭配使用
| DD_BATCH_SIZE | 刷新到 Datadog 前缓冲的日志事件数量。限定在 1 到 1000 之间；默认 1000。若批次超过 Datadog 的 5MB 请求上限，请调低（如 50）
| DD_SITE | Datadog 的站点 URL（如 datadoghq.com）
| DD_SOURCE | Datadog 日志的来源标识
| DD_TRACER_STREAMING_CHUNK_YIELD_RESOURCE | 流式分块产出在 Datadog 追踪中的资源名。默认为 "streaming.chunk.yield"
| DD_ENV | Datadog 日志的环境标识。仅 `datadog_llm_observability` 回调支持
| DD_SERVICE | Datadog 日志的服务标识。默认为 "litellm-server"
| DD_VERSION | Datadog 日志的版本标识。默认为 "unknown"
| DATADOG_MOCK | 为 Datadog 集成测试启用模拟模式。设为 true 时拦截 Datadog API 调用并返回模拟响应，不发起真实网络请求。默认 false
| DATADOG_MOCK_LATENCY_MS | 模拟模式启用时 Datadog API 调用的模拟延迟（毫秒），模拟网络往返耗时。默认 100ms
| DEBUG_OTEL | 启用 OpenTelemetry 的调试模式
| DEFAULT_ALLOWED_FAILS | 模型进入冷却前允许的最大失败次数。默认 3
| DEFAULT_A2A_AGENT_TIMEOUT | A2A（Agent-to-Agent）协议请求的默认超时（秒）。默认 6000
| DEFAULT_ACCESS_GROUP_CACHE_TTL | 缓存的访问组信息的存活时间（秒）。默认 600（10 分钟）
| DEFAULT_ANTHROPIC_CHAT_MAX_TOKENS | Anthropic 对话补全的默认最大 Token 数。默认 4096
| DEFAULT_BATCH_SIZE | 操作的默认批处理大小。默认 512
| DEFAULT_CHUNK_OVERLAP | RAG 文本切分器的默认分块重叠。默认 200
| DEFAULT_CHUNK_SIZE | RAG 文本切分器的默认分块大小。默认 1000
| DEFAULT_CLIENT_DISCONNECT_CHECK_TIMEOUT_SECONDS | 检查客户端断开连接的超时（秒）。默认 1
| DEFAULT_COOLDOWN_REDIS_READ_INTERVAL_SECONDS | 每个工作进程从 Redis 重新读取部署冷却状态的间隔（秒）。调低可让某个副本设置的冷却更快同步到其他副本，代价是更多的 Redis 读取。默认 1
| DEFAULT_COOLDOWN_TIME_SECONDS | 模型失败后冷却的时长（秒）。默认 5
| DEFAULT_CRON_JOB_LOCK_TTL_SECONDS | cron 任务锁的存活时间（秒）。默认 60（1 分钟）
| DEFAULT_DATAFORSEO_LOCATION_CODE | DataForSEO 搜索 API 的默认位置代码。默认 2250（法国）
| DEFAULT_FAILURE_THRESHOLD_PERCENT | 触发部署冷却的失败比例阈值。默认 0.5（50%）
| DEFAULT_FAILURE_THRESHOLD_MINIMUM_REQUESTS | 应用错误率冷却前所需的最少请求数，防止首次失败就触发冷却。默认 5
| DEFAULT_FLUSH_INTERVAL_SECONDS | 刷新操作的默认间隔（秒）。默认 5
| DEFAULT_HEALTH_CHECK_INTERVAL | 健康检查的默认间隔（秒）。默认 300（5 分钟）
| DEFAULT_HEALTH_CHECK_PROMPT | 非图像模型健康检查使用的默认提示词。默认为 "test from litellm"
| DEFAULT_IMAGE_HEIGHT | 图像的默认高度。默认 300
| DEFAULT_IMAGE_TOKEN_COUNT | 图像的默认 Token 数。默认 250
| DEFAULT_IMAGE_WIDTH | 图像的默认宽度。默认 300
| DEFAULT_IN_MEMORY_TTL | 内存缓存的默认存活时间（秒）。默认 5
| DEFAULT_MANAGEMENT_OBJECT_IN_MEMORY_CACHE_TTL | 管理对象（用户、团队、密钥、组织）在内存缓存中的默认存活时间（秒）。默认 60 秒。
| DEFAULT_MAX_LRU_CACHE_SIZE | LRU 缓存的默认最大容量。默认 64
| DEFAULT_MAX_RECURSE_DEPTH | 默认最大递归深度。默认 100
| DEFAULT_MAX_RECURSE_DEPTH_SENSITIVE_DATA_MASKER | 敏感数据遮蔽器的默认最大递归深度。默认 10
| DEFAULT_MAX_RETRIES | 默认最大重试次数。默认 2
| DEFAULT_MAX_TOKENS | LLM 调用的默认最大 Token 数。默认 4096
| DEFAULT_MAX_TOKENS_FOR_TRITON | Triton 模型的默认最大 Token 数。默认 2000
| DEFAULT_MAX_REDIS_BATCH_CACHE_SIZE | Redis 批处理缓存的默认最大容量。默认 1000
| DEFAULT_MCP_SEMANTIC_FILTER_EMBEDDING_MODEL | MCP 语义工具过滤的默认嵌入模型。默认为 "text-embedding-3-small"
| DEFAULT_MCP_SEMANTIC_FILTER_SIMILARITY_THRESHOLD | MCP 语义工具过滤的默认相似度阈值。默认 0.3
| DEFAULT_MCP_SEMANTIC_FILTER_TOP_K | MCP 语义工具过滤默认返回的前 K 个结果数。默认 10
| MCP_NPM_CACHE_DIR | STDIO MCP 服务器使用的 npm 缓存目录。容器中默认路径（~/.npm）可能不存在或只读。默认为 `/tmp/.npm_mcp_cache`
| LITELLM_MCP_CLIENT_TIMEOUT | MCP 客户端连接超时（秒），适用于 stdio 与 HTTP/SSE 传输。默认 60
| LITELLM_MCP_TOOL_LISTING_TIMEOUT | 从 MCP 服务器列出工具的超时（秒）。默认 30
| LITELLM_MCP_METADATA_TIMEOUT | 获取 OAuth 元数据的 HTTP 客户端超时（秒）。默认 10
| LITELLM_MCP_OAUTH_DISCOVERY_ON_STARTUP | 设为 `1`、`true`、`yes` 或 `on` 后，服务器在启动注册时会主动拉取远程 MCP OAuth 元数据，这让不可达的 OAuth 服务器可能拖慢代理就绪。默认未设置：元数据在后台任务中拉取，首个需要它的请求会加入等待，失败的拉取会在冷却后重试
| LITELLM_MCP_HEALTH_CHECK_TIMEOUT | MCP 服务器的健康检查超时（秒）。默认 10
| LITELLM_ENABLE_ADMIN_MCP | 选择启用统一代理或后端组件上 `/admin/mcp` 的嵌入式 LiteAdmin MCP。默认 `false`。需要有效的 `LITELLM_LICENSE`；无许可证时启用会导致启动失败。参见[企业部署与镜像可用性](./liteadmin_mcp_enterprise.md) |
| LITELLM_ADMIN_READ_ONLY | 设为 `true` 后，LiteAdmin MCP 只暴露经过审核的只读操作。默认 `false`；调用者仍需具备 `proxy_admin` 角色。[文档](./liteadmin_mcp.md#限制可用工具) |
| LITELLM_ADMIN_TOOLS | 允许通过 LiteAdmin MCP 调用的规范工具名列表（逗号分隔）。未设置时允许该部署上所有经过审核的操作。可与只读限制叠加使用。[文档](./liteadmin_mcp.md#限制可用工具) |
| LITELLM_ADMIN_RESPONSE_VIEW | LiteAdmin MCP 的响应模式：`full` 或 `compact`。嵌入式托管默认 `full`，独立连接器默认 `compact`。compact 模式读取已保存结果需要同一个工作进程。[文档](./liteadmin_mcp_enterprise.md#工具与响应设置) |
| LITELLM_ADMIN_SCHEMA_MODE | LiteAdmin MCP 的输入模式：`full`（默认）或 `discovery`。discovery 模式把参数细节推迟到 `describe_admin_tool` 才展示；执行时仍会校验完整模式。[文档](./liteadmin_mcp_enterprise.md#工具与响应设置) |
| LITELLM_MCP_PUBLIC_URL | LiteAdmin MCP 用于校验 Host 和 Origin 头的公共 HTTPS 源。未设置时嵌入式托管回退到 `PROXY_BASE_URL`。[文档](./liteadmin_mcp_enterprise.md#enable-the-endpoint) |
| LITELLM_ENABLE_MCP_STDIO | 设为 `true` 后允许在代理上使用 stdio MCP 服务器。**默认值为 false**：无法创建或更新 stdio 服务器，已有的也不会启动。只从代理进程的环境变量读取，不读取 config.yaml 中的 `environment_variables` 或数据库。参见[添加 STDIO MCP 服务器](../mcp#添加-stdio-mcp-服务器)
| LITELLM_MCP_STDIO_EXTRA_COMMANDS | 在内置白名单之外额外允许用于 MCP stdio 传输的命令基名列表（逗号分隔）。示例：`my-mcp-bin`。默认为空
| MCP_OAUTH2_TOKEN_CACHE_DEFAULT_TTL | MCP OAuth2 令牌缓存的默认 TTL（秒）。默认 3600
| MCP_OAUTH2_TOKEN_CACHE_MAX_SIZE | MCP OAuth2 令牌缓存的最大条目数。默认 200
| MCP_OAUTH2_TOKEN_CACHE_MIN_TTL | MCP OAuth2 令牌缓存的最小 TTL（秒）。默认 10
| MCP_OAUTH2_TOKEN_EXPIRY_BUFFER_SECONDS | 计算缓存 TTL 时从令牌过期时间中减去的秒数。默认 60
| MCP_SSO_ASSERTION_CACHE_TTL_SECONDS | MCP `oauth2_id_jag` 路径读取的 SSO 身份断言的每进程缓存 TTL（秒）。其他 pod 上的登录在一个 TTL 内即可见。默认 60
| MCP_PER_USER_TOKEN_DEFAULT_TTL | Redis 中存储的每用户 MCP OAuth 令牌的默认 TTL（秒）。默认 43200（12 小时）
| MCP_PER_USER_TOKEN_EXPIRY_BUFFER_SECONDS | 计算 Redis TTL 时从每用户 MCP OAuth 令牌过期时间中减去的秒数。默认 60
| MCP_TOKEN_EXCHANGE_CACHE_MAX_SIZE | MCP OAuth2 令牌交换缓存的最大条目数。默认 500
| MCP_TRUSTED_REDIRECT_ORIGINS | MCP OAuth `authorize` 端点在同等源和回环地址之外额外接受的 `redirect_uri` 源白名单（逗号分隔）。每项为 `host` 或 `host:port`；`*.suffix` 前缀匹配任意更深的子域名。仅限 HTTPS。用于同系域名上的第一方 OAuth 客户端（如 `app.example.com`）。入口部署中代理自身源不正确时，请改设 [`PROXY_BASE_URL`](#环境变量参考)。参见 [MCP OAuth：反向代理与入口配置](../mcp_oauth#reverse-proxy-and-ingress-configuration)。
| MCP_TRUSTED_NATIVE_REDIRECT_URIS | 受信任的原生 MCP 客户端回调 URI 列表（逗号分隔），如 `myclient://auth/callback`。在内置受信任回调 `cursor://anysphere.cursor-mcp/oauth/callback` 的基础上扩展。每项都要包含回调路径。参见 [MCP OAuth：静态 OAuth 客户端的重定向 URL](../mcp_oauth#static-client-redirect-urls)。 |
| DEFAULT_MOCK_RESPONSE_COMPLETION_TOKEN_COUNT | 模拟响应补全的默认 Token 数。默认 20
| DEFAULT_MOCK_RESPONSE_PROMPT_TOKEN_COUNT | 模拟响应提示词的默认 Token 数。默认 10
| DEFAULT_MODEL_CREATED_AT_TIME | 模型的默认创建时间戳。默认 1677610602
| DEFAULT_NUM_WORKERS_LITELLM_PROXY | 未设置 `NUM_WORKERS` 时 LiteLLM 代理的默认工作进程数。默认 1。**在单个容器、虚拟机或物理主机上，请把 NUM_WORKERS 设为可用的 vCPU 数量**（如 `NUM_WORKERS=8` 或 `--num_workers 8`）；CPU、内存和数据库连接池都按工作进程分配，请据此规划主机规格和 `database_connection_pool_limit`。在 Kubernetes 上每个 pod 运行一个工作进程，用副本数扩展，参见[生产环境最佳实践](./prod.md#worker-与扩缩策略)。
| DEFAULT_PROMPT_INJECTION_SIMILARITY_THRESHOLD | 提示注入相似度的默认阈值。默认 0.7
| DEFAULT_POLLING_INTERVAL | 调度器的默认轮询间隔（秒）。默认 0.03
| DEFAULT_REASONING_EFFORT_DISABLE_THINKING_BUDGET | 推理力度为 disable 时的默认思考预算。默认 0
| DEFAULT_REASONING_EFFORT_HIGH_THINKING_BUDGET | 推理力度为 high 时的默认思考预算。默认 4096
| DEFAULT_REASONING_EFFORT_LOW_THINKING_BUDGET | 推理力度为 low 时的默认思考预算。默认 1024
| DEFAULT_REASONING_EFFORT_MAX_THINKING_BUDGET | 使用 `thinking.budget_tokens` 的旧版 Anthropic 模型（Claude 4.5 系列 + Haiku）在 `max` 推理力度下的默认思考预算。在 Claude 4.6/4.7 上，`max` 档改经自适应 `output_config.effort=max` 路由，忽略此常量。默认 16384
| DEFAULT_REASONING_EFFORT_MEDIUM_THINKING_BUDGET | 推理力度为 medium 时的默认思考预算。默认 2048
| DEFAULT_REASONING_EFFORT_MINIMAL_THINKING_BUDGET | 推理力度为 minimal 时的默认思考预算。默认 512
| DEFAULT_REASONING_EFFORT_MINIMAL_THINKING_BUDGET_GEMINI_2_5_FLASH | Gemini 2.5 Flash 在 minimal 推理力度下的默认思考预算。默认 512
| DEFAULT_REASONING_EFFORT_MINIMAL_THINKING_BUDGET_GEMINI_2_5_FLASH_LITE | Gemini 2.5 Flash Lite 在 minimal 推理力度下的默认思考预算。默认 512
| DEFAULT_REASONING_EFFORT_MINIMAL_THINKING_BUDGET_GEMINI_2_5_PRO | Gemini 2.5 Pro 在 minimal 推理力度下的默认思考预算。默认 512
| DEFAULT_REASONING_EFFORT_XHIGH_THINKING_BUDGET | 使用 `thinking.budget_tokens` 的旧版 Anthropic 模型在 `xhigh` 推理力度下的默认思考预算，延续 low/medium/high 的 2&times; 递进 1024 &rarr; 2048 &rarr; 4096 &rarr; 8192。在 Claude 4.6/4.7 上，`xhigh` 档改经自适应 `output_config.effort=xhigh` 路由，忽略此常量。默认 8192
| DEFAULT_REDIS_MAJOR_VERSION | 无法确定版本时假定的 Redis 大版本。默认 7
| DEFAULT_REDIS_SYNC_INTERVAL | 默认的 Redis 同步间隔（秒）。默认 1
| DEFAULT_SEMANTIC_GUARD_EMBEDDING_MODEL | Semantic Guard（路由匹配防护栏）的默认嵌入模型。默认为 "text-embedding-3-small"
| DEFAULT_SEMANTIC_GUARD_SIMILARITY_THRESHOLD | Semantic Guard 路由匹配的默认相似度阈值。默认 0.75
| DEFAULT_REPLICATE_GPU_PRICE_PER_SECOND | Replicate GPU 的默认每秒价格。默认 0.001400
| DEFAULT_REPLICATE_POLLING_DELAY_SECONDS | Replicate 轮询的默认延迟（秒）。默认 1
| DEFAULT_REPLICATE_POLLING_RETRIES | Replicate 轮询的默认重试次数。默认 5
| DEFAULT_SQS_BATCH_SIZE | SQS 日志的默认批处理大小。默认 512
| DEFAULT_SQS_FLUSH_INTERVAL_SECONDS | SQS 日志的默认刷新间隔。默认 10
| DEFAULT_S3_BATCH_SIZE | S3 日志的默认批处理大小。默认 512
| DEFAULT_S3_FLUSH_INTERVAL_SECONDS | S3 日志的默认刷新间隔。默认 10
| DEFAULT_S3_MAX_CONCURRENT_UPLOADS | s3_v2 日志每次刷新同时进行的 S3 PUT 上传上限。默认 16
| DEFAULT_SLACK_ALERTING_THRESHOLD | Slack 告警的默认阈值。默认 300
| DEFAULT_SOFT_BUDGET | LiteLLM 代理密钥的默认软预算。默认 50.0
| DEFAULT_TRIM_RATIO | 从提示词末尾裁剪的 Token 比例默认值。默认 0.75
| DEFAULT_GOOGLE_VIDEO_DURATION_SECONDS | Google 视频生成的默认时长（秒）。默认 8
| DEFER_PYDANTIC_BUILD | 推迟构建 LiteLLM 的 pydantic 模型模式，直到每个模型首次使用，以加快代理启动并降低内存占用。`true`、`1` 或 `on` 启用；其他任何值都会在导入时构建全部模式。OpenAI 和 Anthropic SDK 也读取同一个变量。默认 true
| DIRECT_URL | 服务端点的直连 URL
| DISABLE_ADMIN_UI | 关闭管理界面的开关
| LITELLM_HIDE_DEFAULT_CREDENTIALS_HINT | 隐藏管理界面登录页（`/ui/login` 和 `/fallback/login`）上"默认凭据"信息卡的标志。UI 凭据由 `UI_USERNAME` / `UI_PASSWORD` 或 SSO 管理时，写死的 `admin` + `MASTER_KEY` 提示会变得有误导性或被安全扫描器标记，此时很有用。**默认值为 false**
| LITELLM_ENABLE_HSTS | 在代理和 UI 响应中发送 `Strict-Transport-Security` 响应头的标志。仅对通过 HTTPS 提供服务的部署生效。**默认值为 false**
| DISABLE_AIOHTTP_TRANSPORT | 禁用 aiohttp 传输的标志。设为 True 时，litellm 改用 httpx 而非 aiohttp。**默认值为 False**
| DISABLE_AIOHTTP_TRUST_ENV | 阻止 LiteLLM 在 aiohttp 传输上为请求解析 `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` 的标志。默认情况下无需任何额外设置即遵循这些环境变量。对 httpx 传输（`DISABLE_AIOHTTP_TRANSPORT=True`）无影响，后者始终遵循。**默认值为 False**
| DISABLE_PRISMA_HEALTH_CHECK_ON_STARTUP | 跳过代理在 Prisma 连接并应用迁移后对数据库执行的 `SELECT 1` 验证查询的标志。Prisma 连接本身不受影响，只是跳过这次额外的可达性探测，因此"接受连接但无法执行查询"的数据库会在首个请求时才被发现，而非启动时。**默认值为 False**
| DISABLE_SCHEMA_UPDATE | 禁用模式更新的开关
| DYNAMIC_RATE_LIMIT_ERROR_THRESHOLD_PER_MINUTE | 并行请求限制器在实施限流前允许的每分钟部署失败次数阈值。默认 1
| DOCS_DESCRIPTION | 文档页面的描述文本
| DOCS_FILTERED | 表示文档已被过滤的标志
| DOCS_TITLE | 文档页面的标题
| DOCS_URL | Swagger API 文档的路径。**默认值为 "/"**
| EMAIL_LOGO_URL | 邮件中使用的徽标 URL
| EMAIL_BUDGET_ALERT_TTL | 邮件预算告警的存活时间（秒）
| EMAIL_BUDGET_ALERT_MAX_SPEND_ALERT_PERCENTAGE | 触发邮件预算告警的最大花费百分比
| EMAIL_SUPPORT_CONTACT | 支持联系的邮箱地址
| EMAIL_SIGNATURE | 所有邮件的自定义 HTML 页脚/签名。可包含用于排版和链接的 HTML 标签。
| EMAIL_SUBJECT_INVITATION | 邀请邮件的自定义主题模板。 
| EMAIL_SUBJECT_KEY_CREATED | 密钥创建邮件的自定义主题模板。 
| EMAIL_BUDGET_ALERT_MAX_SPEND_ALERT_PERCENTAGE | 触发告警的最大预算百分比（小数表示：0.8 = 80%）。默认 0.8
| EMAIL_BUDGET_ALERT_TTL | 预算告警去重的存活时间（秒）。默认 86400（24 小时）
| ENABLE_SSO_DEBUG | 启用 [SSO 调试路由](./admin_ui_sso.md#调试-sso-jwt-字段)（`/sso/debug/login` 和 `/sso/debug/callback`）的标志。未设置时这些路由返回 404。调试 SSO 配置时开启，之后记得取消。**默认值为 false**
| ENFORCE_PRISMA_MIGRATION_CHECK | 已废弃且被忽略。数据库设置在启动时失败（数据库不可达、连接重试耗尽或 `prisma migrate deploy` 失败）时，代理总是以非零码退出；独立迁移入口（`litellm/proxy/prisma_migration.py`，供 Helm 迁移 Job 和 Docker 入口使用）同样如此失败，因此部署不会在过期模式上继续。设置该变量或传入 `--enforce_prisma_migration_check` 不会改变任何行为，请从部署中移除
| ENKRYPTAI_API_BASE | EnkryptAI 防护栏 API 的基础 URL。**默认值为 https://api.enkryptai.com**
| ENKRYPTAI_API_KEY | EnkryptAI 防护栏服务的 API 密钥
| EXPERIMENTAL_OPENAI_BASE_LLM_HTTP_HANDLER | 让 `openai` 对话补全请求走 LiteLLM 共享 HTTP 处理器而非 OpenAI Python SDK 客户端的标志。**默认值为 False**
| EXPERIMENTAL_UI_LOGIN | 控制自签名的管理界面会话令牌。为 true 时，UI 登录成功后返回一个加密令牌，携带用户角色和模型访问权限，固定 10 分钟过期，而不是签发基于数据库的虚拟密钥。除此之外，只要没有显式设为 false，代理会尝试把任何不以 `sk-` 开头的传入令牌按这类会话令牌解密。**默认未设置**
| FAROS_API_KEY | 用于向 Faros AI 发送 LLM 用量数据的 API 密钥
| FAROS_API_URL | Faros AI API 的基础 URL。默认为 https://prod.api.faros.ai
| FAROS_GRAPH | LiteLLM 用量数据写入的 Faros 图。默认为 "default"
| FAROS_ORIGIN | LiteLLM 写入 Faros 的行上记录的来源。默认为 "litellm"
| FAROS_TOOL_CATEGORY | Faros vcs_UserTool 行上记录的工具类别。默认为 "LiteLLM"
| FAROS_USER_SOURCE | LiteLLM 用户的 Faros vcs_User 行上记录的来源。默认为 "LiteLLM"
| FIREWORKS_AI_4_B | Fireworks AI 4B 模型的尺寸参数。默认 4
| FIREWORKS_AI_16_B | Fireworks AI 16B 模型的尺寸参数。默认 16
| FIREWORKS_AI_56_B_MOE | Fireworks AI 56B MOE 模型的尺寸参数。默认 56
| FIREWORKS_AI_80_B | Fireworks AI 80B 模型的尺寸参数。默认 80
| FIREWORKS_AI_176_B_MOE | Fireworks AI 176B MOE 模型的尺寸参数。默认 176
| FOCUS_PROVIDER | Focus 导出的目标提供商（如 `s3`）。默认为 `s3`。
| FOCUS_FORMAT | Focus 导出的输出格式。默认为 `parquet`。
| FOCUS_FREQUENCY | 定时 Focus 导出的频率（`hourly`、`daily` 或 `interval`）。默认为 `hourly`。
| FOCUS_CRON_OFFSET | 调度每小时/每日 Focus 导出时使用的分钟偏移。默认为 `5` 分钟。
| FOCUS_INTERVAL_SECONDS | `frequency` 为 `interval` 时 Focus 导出的间隔（秒）。
| FOCUS_PREFIX | 上传 Focus 导出文件时使用的对象键前缀（或文件夹）。默认为 `focus_exports`。
| FOCUS_S3_BUCKET_NAME | 使用 S3 目标时上传 Focus 导出文件的 S3 存储桶。
| FOCUS_S3_REGION_NAME | Focus 导出 S3 存储桶的 AWS 区域。
| FOCUS_S3_ENDPOINT_URL | Focus 导出 S3 客户端的自定义端点（可选；适用于 S3 兼容存储）。
| FOCUS_S3_ACCESS_KEY | Focus 导出 S3 客户端使用的 AWS 访问密钥 ID。
| FOCUS_S3_SECRET_KEY | Focus 导出 S3 客户端使用的 AWS 私有访问密钥。
| FOCUS_S3_SESSION_TOKEN | Focus 导出 S3 客户端使用的 AWS 会话令牌（可选）。
| MAVVRIK_API_KEY | Mavvrik FOCUS 导出集成的 API 密钥。
| MAVVRIK_API_ENDPOINT | Mavvrik FOCUS 导出的租户 API 端点，如 `https://api.mavvrik.ai/<tenant_id>`。
| MAVVRIK_CONNECTION_ID | Mavvrik FOCUS 导出的 AI 成本连接 ID。
| MAVVRIK_FOCUS_MAX_ROWS | Mavvrik FOCUS 目标每个导出窗口的最大行数。默认 500000。
| FOCUS_GCS_BUCKET_NAME | 使用 GCS 目标时上传 Focus 导出文件的 GCS 存储桶。
| FOCUS_GCS_PATH_SERVICE_ACCOUNT | Focus 导出 GCS 客户端的服务账号 JSON 密钥文件路径。未设置时回退到应用默认凭据。
| FUNCTION_DEFINITION_TOKEN_COUNT | 函数定义的 Token 数。默认 9
| GALILEO_API_KEY | Galileo Cloud（托管版）的 API 密钥。`success_callback` 包含 `galileo` 时配合 v2 span API 使用。
| GALILEO_BASE_URL | Galileo 平台的基础 URL。Galileo Cloud 使用 `https://api.galileo.ai`；企业版/自托管请把控制台 URL 中的 `console` 替换为 `api`。
| GALILEO_LOG_STREAM_ID | Galileo Cloud v2 span 日志的日志流 ID（可选）。
| GALILEO_PASSWORD | Galileo 企业 Observe 认证的密码
| GALILEO_PROJECT_ID | Galileo 用量的项目 ID
| GALILEO_USERNAME | Galileo 企业 Observe 认证的用户名
| GOOGLE_SECRET_MANAGER_PROJECT_ID | Google Secret Manager 的项目 ID
| GRACEFUL_SHUTDOWN_TIMEOUT | 代理在关闭时（SIGTERM 或 `/health/drain` preStop 钩子）等待进行中请求排空后再继续拆除的秒数。**默认值为 30**
| GCS_BATCH_BUCKET_NAME | Vertex AI 文件和批处理使用的 GCS 存储桶。优先于 GCS_BUCKET_NAME，便于批处理数据与日志存储桶分开存放
| GCS_BUCKET_NAME | Google Cloud Storage 存储桶的名称
| GCS_MOCK | 为 GCS 集成测试启用模拟模式。设为 true 时拦截 GCS API 调用并返回模拟响应，不发起真实网络请求。默认 false
| GCS_MOCK_LATENCY_MS | 模拟模式启用时 GCS API 调用的模拟延迟（毫秒），模拟网络往返耗时。默认 150ms
| GCS_PATH_SERVICE_ACCOUNT | Google Cloud 服务账号 JSON 文件的路径
| GCS_FLUSH_INTERVAL | GCS 日志的刷新间隔（秒）。指定多久向 GCS 发送一次日志。**默认值为 20 秒**
| GCS_BATCH_SIZE | GCS 日志的批处理大小。指定累计多少条日志后刷新到 GCS。`BATCH_SIZE` 设为 10 时，每 10 条日志刷新一次。**默认值为 2048**
| GCS_USE_BATCHED_LOGGING | 启用 GCS 批量日志。启用时（默认）多条日志负载合并为单次 GCS 对象上传（NDJSON 格式），大幅减少 API 调用。禁用时每条日志单独作为 GCS 对象发送（旧行为）。**默认值为 true**
| GCS_PUBSUB_TOPIC_ID | 接收 LiteLLM SpendLogs 的 PubSub 主题 ID。
| GCS_PUBSUB_PROJECT_ID | 接收 LiteLLM SpendLogs 的 PubSub 项目 ID。
| GENERIC_AUTHORIZATION_ENDPOINT | 通用 OAuth 提供商的授权端点
| GENERIC_CLIENT_ID | 通用 OAuth 提供商的客户端 ID
| GENERIC_CLIENT_SECRET | 通用 OAuth 提供商的客户端密钥
| GENERIC_CLIENT_STATE | 通用客户端认证的 state 参数
| GENERIC_CLIENT_USE_PKCE | 为通用 OAuth 提供商启用 PKCE（Proof Key for Code Exchange）。OAuth 提供商要求 PKCE 时设为 "true"。**默认值为 false**
| GENERIC_SSO_HEADERS | 追加到请求的额外请求头列表（逗号分隔），例如 Authorization=Bearer `<token>`、Content-Type=application/json 等。
| GENERIC_INCLUDE_CLIENT_ID | OAuth 请求中包含客户端 ID
| GENERIC_INCLUDE_TOKEN_CLAIMS | 为 true 时，若 UserInfo 不完整，还会从 ID 令牌和访问令牌获取通用 OIDC SSO 用户声明。UserInfo 声明优先
| GENERIC_SCOPE | 通用 OAuth 提供商的 scope 设置
| GENERIC_TOKEN_ENDPOINT | 通用 OAuth 提供商的令牌端点
| GENERIC_USER_DISPLAY_NAME_ATTRIBUTE | 通用认证中用户显示名的属性
| GENERIC_USER_EMAIL_ATTRIBUTE | 通用认证中用户邮箱的属性
| GENERIC_USER_EXTRA_ATTRIBUTES | 从通用 SSO 提供商响应中额外提取的字段列表（逗号分隔）（如 "department,employee_id,groups"）。可在自定义 SSO 处理器中通过 `CustomOpenID.extra_fields` 访问。支持点号表示嵌套字段
| GENERIC_USER_FIRST_NAME_ATTRIBUTE | 通用认证中用户名字的属性
| GENERIC_USER_ID_ATTRIBUTE | 通用认证中用户 ID 的属性。使用每个账号唯一且不可变的声明（如 `sub`）；默认为 `preferred_username`
| GENERIC_USER_LAST_NAME_ATTRIBUTE | 通用认证中用户姓氏的属性
| GENERIC_USER_PROVIDER_ATTRIBUTE | 指定用户提供商的属性
| GENERIC_USER_ROLE_ATTRIBUTE | 指定用户角色的属性
| GENERIC_USERINFO_ENDPOINT | 通用 OAuth 中获取用户信息的端点
| GENERIC_LOGGER_ENDPOINT | Generic Logger 回调发送日志的目标端点 URL
| GENERIC_LOGGER_HEADERS | Generic Logger 回调请求中包含的请求头 JSON 字符串
| GENERIC_ROLE_MAPPINGS_DEFAULT_ROLE | 通用 SSO 中没有角色映射匹配时分配的默认 LiteLLM 角色。与 GENERIC_ROLE_MAPPINGS_ROLES 配合使用
| GENERIC_ROLE_MAPPINGS_GROUP_CLAIM | SSO 令牌中包含用户分组的声明/属性名。用于角色映射
| GENERIC_ROLE_MAPPINGS_ROLES | LiteLLM 角色到 SSO 分组名的 Python 字典字符串映射。示例：`{"proxy_admin": ["admin-group"], "internal_user": ["users"]}`
| GEMINI_API_BASE | Gemini API 的基础 URL。默认为 https://generativelanguage.googleapis.com
| GALILEO_API_KEY | Galileo Cloud（托管版）的 API 密钥。`success_callback` 包含 `galileo` 时配合 v2 span API 使用。
| GALILEO_BASE_URL | Galileo 平台的基础 URL。Galileo Cloud 使用 `https://api.galileo.ai`；企业版/自托管请把控制台 URL 中的 `console` 替换为 `api`。
| GALILEO_LOG_STREAM_ID | Galileo Cloud v2 span 日志的日志流 ID（可选）。
| GALILEO_PASSWORD | Galileo 企业 Observe 认证的密码
| GALILEO_PROJECT_ID | Galileo 用量的项目 ID
| GALILEO_USERNAME | Galileo 企业 Observe 认证的用户名
| GITHUB_COPILOT_TOKEN_DIR | 存储 `github_copilot` LLM 提供商 GitHub Copilot 令牌的目录
| GITHUB_COPILOT_API_KEY_FILE | 存储 `github_copilot` LLM 提供商 GitHub Copilot API 密钥的文件
| GITHUB_COPILOT_ACCESS_TOKEN_FILE | 存储 `github_copilot` LLM 提供商 GitHub Copilot 访问令牌的文件
| GITHUB_COPILOT_API_BASE | GitHub Copilot API 的基础 URL。带自定义主机的 GitHub Enterprise 订阅类似 https://copilot-api.my-company.ghe.com。默认为 https://api.githubcopilot.com
| GITHUB_COPILOT_DEVICE_CODE_URL | GitHub Copilot 设备码认证的 URL。带自定义主机的 GitHub Enterprise 订阅类似 https://my-company.ghe.com/login/device/code。默认为 https://github.com/login/device/code
| GITHUB_COPILOT_ACCESS_TOKEN_URL | 获取 GitHub Copilot 访问令牌的 URL。带自定义主机的 GitHub Enterprise 订阅类似 https://my-company.ghe.com/login/oauth/access_token。默认为 https://github.com/login/oauth/access_token
| GITHUB_COPILOT_API_KEY_URL | 获取 GitHub Copilot API 密钥的 URL。带自定义主机的 GitHub Enterprise 订阅类似 https://my-company.ghe.com/api/v3/copilot_internal/v2/token。默认为 https://api.github.com/copilot_internal/v2/token
| GITHUB_COPILOT_CLIENT_ID | GitHub Copilot 设备流认证的客户端 ID。`github_copilot` 提供商用它做设备码认证。默认为 "Iv1.b507a08c87ecfe98"
| GREENSCALE_API_KEY | Greenscale 服务的 API 密钥
| GREENSCALE_ENDPOINT | Greenscale 服务的端点 URL
| GRAYSWAN_API_BASE | GraySwan API 的基础 URL。默认为 https://api.grayswan.ai
| GRAYSWAN_API_KEY | GraySwan Cygnal 服务的 API 密钥
| GRAYSWAN_REASONING_MODE | GraySwan 防护栏的推理模式
| GRAYSWAN_VIOLATION_THRESHOLD | GraySwan 防护栏的违规阈值
| GOOGLE_APPLICATION_CREDENTIALS | Google Cloud 凭据 JSON 文件的路径
| GOOGLE_CLIENT_ID | Google OAuth 的客户端 ID
| GOOGLE_CLIENT_SECRET | Google OAuth 的客户端密钥
| GOOGLE_KMS_RESOURCE_NAME | Google KMS 中资源的名称
| GUARDRAILS_AI_API_BASE | Guardrails AI API 的基础 URL
| GUARDRAIL_SCANNED_MESSAGES_CACHE_TTL_SECONDS | 启用 `only_scan_new_messages` 时，记录防护栏已扫描过哪些消息分段的每会话缓存的 TTL（秒）。默认 86400（24 小时）
| HEALTH_CHECK_TIMEOUT_SECONDS | 健康检查的超时（秒）。默认 60
| HEROKU_API_BASE | Heroku API 的基础 URL
| HEROKU_API_KEY | Heroku 服务的 API 密钥
| HF_API_BASE | Hugging Face API 的基础 URL
| HCP_VAULT_ADDR | [Hashicorp Vault 密钥管理器](../secret_managers/hashicorp_vault.md)的地址
| HCP_VAULT_APPROLE_MOUNT_PATH | [Hashicorp Vault 密钥管理器](../secret_managers/hashicorp_vault.md)中 AppRole 认证的挂载路径。默认为 "approle"
| HCP_VAULT_APPROLE_ROLE_ID | [Hashicorp Vault 密钥管理器](../secret_managers/hashicorp_vault.md)中 AppRole 认证的角色 ID
| HCP_VAULT_APPROLE_SECRET_ID | [Hashicorp Vault 密钥管理器](../secret_managers/hashicorp_vault.md)中 AppRole 认证的密钥 ID
| HCP_VAULT_CLIENT_CERT | [Hashicorp Vault 密钥管理器](../secret_managers/hashicorp_vault.md)的客户端证书路径
| HCP_VAULT_CLIENT_KEY | [Hashicorp Vault 密钥管理器](../secret_managers/hashicorp_vault.md)的客户端密钥路径
| HCP_VAULT_LOGIN_NAMESPACE | [Hashicorp Vault 密钥管理器](../secret_managers/hashicorp_vault.md)中 AppRole 与 TLS 证书登录时以 `X-Vault-Namespace` 头发送的命名空间。回退到 HCP_VAULT_NAMESPACE
| HCP_VAULT_MOUNT_NAME | [Hashicorp Vault 密钥管理器](../secret_managers/hashicorp_vault.md)的挂载名
| HCP_VAULT_NAMESPACE | [Hashicorp Vault 密钥管理器](../secret_managers/hashicorp_vault.md)的命名空间
| HCP_VAULT_PATH_PREFIX | [Hashicorp Vault 密钥管理器](../secret_managers/hashicorp_vault.md)的路径前缀
| HCP_VAULT_SECRET_NAMESPACE | [Hashicorp Vault 密钥管理器](../secret_managers/hashicorp_vault.md)中读写密钥时 URL 路径中使用的命名空间。回退到 HCP_VAULT_NAMESPACE
| HCP_VAULT_TOKEN | [Hashicorp Vault 密钥管理器](../secret_managers/hashicorp_vault.md)的令牌
| HCP_VAULT_CERT_ROLE | [Hashicorp Vault 密钥认证](../secret_managers/hashicorp_vault.md)的角色
| HELICONE_API_KEY | Helicone 服务的 API 密钥
| HELICONE_API_BASE | Helicone 服务的基础 URL，默认为 `https://api.helicone.ai`
| HELICONE_MOCK | 为 Helicone 集成测试启用模拟模式。设为 true 时拦截 Helicone API 调用并返回模拟响应，不发起真实网络请求。默认 false
| HELICONE_MOCK_LATENCY_MS | 模拟模式启用时 Helicone API 调用的模拟延迟（毫秒），模拟网络往返耗时。默认 100ms
| HOSTNAME | 服务器的主机名，会[输出到 `datadog` 日志](https://docs.litellm.ai/docs/proxy/logging#datadog)
| HOURS_IN_A_DAY | 每天小时数（用于计算）。默认 24
| HIDDENLAYER_API_BASE | HiddenLayer API 的基础 URL。默认为 `https://api.hiddenlayer.ai`
| HIDDENLAYER_AUTH_URL | HiddenLayer 的认证 URL。默认为 `https://auth.hiddenlayer.ai`
| HIDDENLAYER_CLIENT_ID | HiddenLayer SaaS 认证的客户端 ID
| HIDDENLAYER_CLIENT_SECRET | HiddenLayer SaaS 认证的客户端密钥
| HUGGINGFACE_API_BASE | Hugging Face API 的基础 URL
| HUGGINGFACE_API_KEY | Hugging Face API 的 API 密钥
| HUMANLOOP_PROMPT_CACHE_TTL_SECONDS | Humanloop 中缓存提示词的存活时间（秒）。默认 60
| IAM_TOKEN_DB_AUTH | 设为 `True` 后，用短期 IAM 令牌认证 Amazon RDS 或 Amazon Aurora 上的 PostgreSQL。LiteLLM 用 boto3 生成并刷新令牌。此选项不支持 Google Cloud SQL，请改用带 `--auto-iam-authn` 的 Cloud SQL Auth Proxy。不能与 `AZURE_POSTGRESQL_AUTH` 同时使用。需要 `DATABASE_HOST`、`DATABASE_PORT`、`DATABASE_USER` 和 `DATABASE_NAME`。ECS 任务角色配置与重启行为参见 [`--iam_token_db_auth`](./cli#--iam_token_db_auth)。 |
| IBM_GUARDRAILS_API_BASE | IBM Guardrails API 的基础 URL
| IBM_GUARDRAILS_AUTH_TOKEN | IBM Guardrails API 的 Bearer 授权令牌
| INITIAL_RETRY_DELAY | 重试请求的初始延迟（秒）。默认 0.5
| JITTER | 重试延迟计算的抖动系数。默认 0.75
| JSON_LOGS | 启用 JSON 格式日志
| JWT_AUDIENCE | JWT 令牌的预期受众
| JWT_ISSUER | JWT 令牌的预期签发者（`iss` 声明）。设置后 PyJWT 会校验 `iss` 声明并拒绝来自其他签发者的令牌
| JWT_PUBLIC_KEY_URL | 获取 JWT 校验公钥的 URL
| LAGO_API_BASE | Lago API 的基础 URL
| LAGO_API_CHARGE_BY | 确定 Lago 计费依据的参数
| LAGO_API_EVENT_CODE | Lago API 事件的事件代码
| LAGO_API_KEY | 访问 Lago 服务的 API 密钥
| LANGFUSE_BASE_URL | Langfuse 服务的基础 URL。`LANGFUSE_HOST` 未设置时作为回退读取；按密钥/团队配置的 `langfuse_host` 始终优先于两者 |
| LANGFUSE_DEBUG | 切换 Langfuse 调试模式。仅 `true` 或 `1` 启用，其他任何值均关闭
| LANGFUSE_FLUSH_AT | Langfuse 回调每次 OTLP 导出请求批量发送的 span 数；默认为 `512`。不是 `1` 到 `100000` 之间整数的值会记录警告并使用默认值
| LANGFUSE_FLUSH_INTERVAL | Langfuse 回调两次 OTLP 导出批次之间等待的秒数；默认为 `1`。大于 `0` 且不是整数的值会记录警告并使用默认值
| LANGFUSE_PROMPT_CACHE_DEFAULT_TTL_SECONDS | Langfuse 回调缓存已获取提示词、并在下次请求时刷新的时长；默认为 `60`。刷新失败时继续使用缓存的提示词。必须是整数秒：Langfuse SDK 在导入时按整数读取该值，其他值（如 `abc` 或 `2.5`）会让回调报错并点名该变量；负值记录警告并使用默认值
| LANGFUSE_TRACING_ENVIRONMENT | Langfuse 追踪的环境
| LANGFUSE_HOST | Langfuse 服务的主机 URL。优先于 `LANGFUSE_BASE_URL` |
| LANGFUSE_MOCK | 为 Langfuse 集成测试启用模拟模式。设为 true 时拦截 Langfuse API 调用并返回模拟响应，不发起真实网络请求。默认 false
| LANGFUSE_MOCK_LATENCY_MS | 模拟模式启用时 Langfuse API 调用的模拟延迟（毫秒），模拟网络往返耗时。默认 100ms
| LANGFUSE_PUBLIC_KEY | Langfuse 认证的公钥
| LANGFUSE_MAX_RETRIES | Langfuse 回调在丢弃批次前，对超时、连接失败或返回可重试状态的 OTLP 导出请求的重试次数；默认为 `3`，各次尝试之间等待 1、2、4 秒，并持续翻倍至最多 64 秒。不是整数的值记录警告并使用默认值；超过 `1000` 的值记录警告并使用 `1000`
| LANGFUSE_RELEASE | 记录在每个 Langfuse 追踪上的发布版本。未设置时，回调按 `RENDER_GIT_COMMIT`、`CI_COMMIT_SHA`、`CIRCLE_SHA1`、`SOURCE_VERSION`、`TRAVIS_COMMIT`、`GIT_COMMIT`、`GITHUB_SHA`、`BITBUCKET_COMMIT`、`BUILD_SOURCEVERSION`、`DRONE_COMMIT_SHA` 的顺序取第一个已设置的值，与 Langfuse SDK 读取的列表相同
| LANGFUSE_SECRET_KEY | Langfuse 认证的密钥
| LANGFUSE_TIMEOUT | Langfuse 回调发送的每个 OTLP 导出请求和每个 REST 请求（提示词、凭据检查、项目查询）的超时（秒）；默认为 `20`，接受 `2.5` 这类小数。超时或连接失败的导出请求会重试 `LANGFUSE_MAX_RETRIES` 次，之后丢弃批次
| LANGFUSE_OTEL_TRACES_EXPORT_PATH | Langfuse 追踪导出的可选 OTLP HTTP 路径；默认为 `/api/public/otel/v1/traces`
| LANGFUSE_SAMPLE_RATE | 通过 Langfuse 回调导出的追踪比例，范围 `0.0` 到 `1.0`；默认为 `1.0`。超出范围或非数值会记录警告并导出全部追踪
| LANGSMITH_API_KEY | Langsmith 平台的 API 密钥
| LANGSMITH_BASE_URL | Langsmith 服务的基础 URL
| LANGSMITH_BATCH_SIZE | Langsmith 操作的批处理大小
| LANGSMITH_DEFAULT_RUN_NAME | Langsmith run 的默认名称
| LANGSMITH_PROJECT | Langsmith 集成的项目名
| LANGSMITH_SAMPLING_RATE | Langsmith 日志的采样率
| LANGSMITH_TENANT_ID | Langsmith 多租户部署的租户 ID
| LANGSMITH_MOCK | 为 Langsmith 集成测试启用模拟模式。设为 true 时拦截 Langsmith API 调用并返回模拟响应，不发起真实网络请求。默认 false
| LANGSMITH_MOCK_LATENCY_MS | 模拟模式启用时 Langsmith API 调用的模拟延迟（毫秒），模拟网络往返耗时。默认 100ms
| LANGTRACE_API_HOST | `langtrace` 回调使用的自托管 Langtrace 服务器基础 URL，如 `https://langtrace.example.com`；回调会向 `<host>/api/trace` 发送数据。默认为 `https://app.langtrace.ai`
| LANGTRACE_API_KEY | Langtrace 服务的 API 密钥，由 `langtrace` 回调以 `x-api-key` 头发送
| LASSO_API_BASE | Lasso API 的基础 URL
| LASSO_API_KEY | Lasso 服务的 API 密钥
| LASSO_USER_ID | Lasso 服务的用户 ID
| LASSO_CONVERSATION_ID | Lasso 服务的会话 ID
| LENGTH_OF_LITELLM_GENERATED_KEY | LiteLLM 生成密钥的长度。默认 16
| LEGACY_MULTI_INSTANCE_RATE_LIMITING | 启用旧版多实例限流的标志。**默认值为 False**
| LITERAL_API_KEY | Literal 集成的 API 密钥
| LITERAL_API_URL | Literal 服务的 API URL
| LITERAL_BATCH_SIZE | Literal 操作的批处理大小
| LITELLM_ANTHROPIC_BETA_HEADERS_URL | 获取 Anthropic beta 头配置的自定义 URL。默认为 GitHub main 分支 URL
| LITELLM_ANTHROPIC_DISABLE_URL_SUFFIX | 禁用为 Anthropic API 基础 URL 自动追加 URL 后缀。设为 `true` 时，阻止 LiteLLM 向自定义 Anthropic API 端点自动添加 `/v1/messages` 或 `/v1/complete`
| LITELLM_ANTHROPIC_PROMPT_CACHING_TTL | `LITELLM_ENABLE_ANTHROPIC_PROMPT_CACHING` 注入断点的缓存期限，可选 `5m` 或 `1h`。默认为 Anthropic 的 5 分钟临时缓存。`1h` 适合长程智能体会话，但会使缓存写入溢价翻倍。其他值回退到默认值。也可通过 `litellm_settings.anthropic_prompt_caching_ttl` 设置
| LITELLM_ENABLE_ANTHROPIC_PROMPT_CACHING | 设为 `true` 时，自动在 Anthropic 与 Bedrock Claude 模型的系统提示词和最后一个回合上注入 Anthropic `cache_control` 断点，让 Claude Code 这类从不自行设置 `cache_control` 的客户端也能用上提示词缓存。默认 `false`。已自带 `cache_control` 的请求保持原样。注意提供商是针对发送该前缀的上游凭据（而非每个最终用户）缓存前缀的，因此启用后共享同一套凭据的所有调用方的提示词都变为可缓存；若共享凭据的调用方不应得知其他调用方最近是否发送过某条提示词，请保持关闭。也可通过 `litellm_settings.enable_anthropic_prompt_caching` 设置
| LITELLM_ASSETS_PATH | UI 资产和徽标所在目录的路径。以只读文件系统运行时使用（如 Kubernetes）。Docker 中默认为 `/var/lib/litellm/assets`。
| LITELLM_AUTOROUTER_PRESETS_URL | 获取自动路由器预设目录的自定义 URL。默认为 GitHub main 分支 URL
| LITELLM_BILLING_METRICS_ENDPOINT | [企业版计费请求计量](billing_metrics)的采集器 URL。需要企业许可证；未设置时禁用计量
| LITELLM_BILLING_METRICS_CLIENT_CERT | 计费请求计量的 mTLS 客户端证书。接受文件路径或内联 PEM 内容
| LITELLM_BILLING_METRICS_CLIENT_KEY | 与 `LITELLM_BILLING_METRICS_CLIENT_CERT` 匹配的私钥。接受文件路径或内联 PEM 内容
| LITELLM_BILLING_METRICS_CA_CERT | 校验计量采集器用的 CA 证书包。仅用于私有或测试采集器；未设置时使用系统信任库
| LITELLM_BILLING_METRICS_EXPORT_INTERVAL_MS | 计费请求计量的推送节奏（毫秒）。默认 60000
| LITELLM_BLOG_POSTS_URL | 获取 LiteLLM 博客文章 JSON 的自定义 URL。默认为 GitHub main 分支 URL
| LITELLM_CLI_DISABLE_KEYRING | 在运行 `lite` CLI 的机器上设为 `1`、`true`、`yes` 或 `on`，让 CLI 不碰操作系统钥匙串，`lite login` 的凭据改存于 `~/.litellm/token.json`（`0600`）。默认未设置，即可访问钥匙串时凭据存入钥匙串
| LITELLM_CLI_JWT_EXPIRATION_HOURS | CLI 生成的 JWT 令牌的过期时间（小时）。默认 24 小时
| LITELLM_PROXY_API_OAUTH_REDIRECT_URIS | 受信任的托管 `proxy:read` 授权精确 HTTPS 回调列表（逗号分隔），`proxy:read` 允许模型列表和聚合用量报表。默认为空。不允许管理操作或模型调用。参见[托管应用登录](./cli_sso.md#托管应用登录)
| LITELLM_PROXY_API_OAUTH_ADMIN_REDIRECT_URIS | 受信任的请求托管 `proxy:admin` 授权的精确 HTTPS 回调列表（逗号分隔）。需要现任 `proxy_admin` 明确同意；网关会在使用时重新校验角色和既有策略。默认为空。列入名单的应用也可请求 `proxy:read`。参见[托管应用登录](./cli_sso.md#托管应用登录)
| LITELLM_CLI_SSO_CLAIM_MAP | `CLI_SSO_CLAIM_MAP` 的别名：用于 CLI SSO 归属元数据的白名单 OIDC 声明
| LITELLM_CORS_ALLOW_CREDENTIALS | 设为 `true` 以在 CORS 响应中显式允许凭据。未设置时，若 `LITELLM_CORS_ORIGINS` 为 `*`（通配）则自动禁用凭据，避免"以凭据反射任意源"这一浏览器安全配置错误
| LITELLM_CORS_ORIGINS | 允许的 CORS 源列表（逗号分隔）（如 `https://app.example.com,https://admin.example.com`）。未设置时默认 `*`（所有源）
| LITELLM_DANGEROUSLY_PERMIT_WEAK_OR_UNSET_MASTER_KEY | 仅供本地开发：设为 `true` 以允许代理在主密钥未设置、为空或为已知不安全值时启动。等同于 `general_settings.dangerously_permit_weak_or_unset_master_key`。**默认值为 false**。[代理拒绝以已知不安全主密钥启动](./master_key_rotations.md#proxy-refuses-to-start)
| LITELLM_DD_AGENT_HOST | LiteLLM 专属日志使用的 DataDog agent 主机名或 IP。设置后日志发送到 agent 而非直接调用 API
| LITELLM_DEPLOYMENT_ENVIRONMENT | 部署的环境名（如 "production"、"staging"）。`OTEL_ENVIRONMENT_NAME` 未设置时作为回退。会在遥测数据中设置 `environment` 标签
| LITELLM_DETAILED_TIMING | 为 true 时，在响应中添加详细的分阶段计时头（`x-litellm-timing-{pre-processing,llm-api,post-processing,message-copy}-ms`）。默认 false。参见[延迟开销文档](../troubleshoot/latency_overhead.md)
| LITELLM_DD_AGENT_PORT | LiteLLM 专属日志接收使用的 DataDog agent 端口。默认 10518
| LITELLM_DD_LLM_OBS_PORT | Datadog LLM 可观测性 agent 的端口。默认 8126
| LITELLM_DEFAULT_EMBEDDING_ENCODING_FORMAT | OpenAI 兼容嵌入调用在请求或模型 `litellm_params` 中未设置时使用的默认 `encoding_format`（如 `float`、`base64`）。回退值为 `float`。参见[嵌入](./embedding.md#embedding-encoding-format)。
| LITELLM_DEV_ENV_HOT_RELOAD | 代理以 `--reload` 启动时给自己设置的内部标志，通知重载的工作进程以 `override=True` 重读 `.env`，让对既有密钥的修改在重载后生效。不供用户设置
| LITELLM_DONT_SHOW_FEEDBACK_BOX | 隐藏 LiteLLM UI 中反馈框的标志
| LITELLM_DROP_PARAMS | LiteLLM 请求中要丢弃的参数
| LITELLM_MODIFY_PARAMS | LiteLLM 请求中要修改的参数
| LITELLM_EMAIL | 与 LiteLLM 账号关联的邮箱
| LITELLM_FAVICON_URL | LiteLLM UI 网站图标的自定义 URL。设置后覆盖默认图标
| LITELLM_GLOBAL_MAX_PARALLEL_REQUEST_RETRIES | LiteLLM 并行请求的最大重试次数
| LITELLM_GLOBAL_MAX_PARALLEL_REQUEST_RETRY_TIMEOUT | LiteLLM 并行请求重试的超时
| LITELLM_DISABLE_ACCESS_LOG_PATHS | 从 uvicorn 访问日志中排除的 URL 路径列表（逗号分隔）（如 `/health,/metrics`）。适合压制嘈杂的健康检查日志条目。 |
| LITELLM_DISABLE_LAZY_LOADING | 设为 "1"、"true"、"yes" 或 "on" 时，禁用属性的惰性加载（当前只影响 encoding/tiktoken）。这确保 VCR 开始录制 HTTP 请求前 encoding 已初始化，修复 VCR cassette 创建问题。参见 [issue #18659](https://github.com/BerriAI/litellm/issues/18659)
| LITELLM_DISABLE_LAZY_ROUTES | 设为 "1"、"true"、"yes" 或 "on" 时，在 `LITELLM_WORKER_STARTUP_HOOKS` 运行之前、首个请求之前的工作进程启动阶段就注册所有可选功能路由（MCP、防护栏、智能体、向量存储、透传等），而不是等首个请求命中其路径时再加载。需要在启动时就拿到完整路由表时使用，例如从启动钩子过滤 `app.routes`，或在服务流量前审计 `GET /routes`。默认：未设置，可选路由惰性加载。 |
| LITELLM_DISABLE_NO_REDIS_WARNING | 设为 "true" 时，隐藏未配置 Redis 时显示的管理界面横幅。仅在单工作进程部署上设置；参见[哪些功能需要 Redis](./redis_requirements.md)。
| LITELLM_DISABLE_REDACT_SECRETS | 设为 "true" 时，禁用对代理日志输出中机密（API 密钥、令牌、凭据）的自动遮蔽。机密遮蔽默认开启。
| LITELLM_DISABLE_ACCESS_LOG_PATHS | 需要丢弃 uvicorn 访问日志行的精确请求路径列表（逗号分隔）（如健康检查、根探测、刷屏的指标抓取）。路径与查询串之前的部分参与匹配。为空或未设置时禁用过滤。
| LITELLM_MIGRATION_DIR | prisma 迁移的自定义迁移目录，用于在只读文件系统中为数据库建立基线。
| LITELLM_LITEASK_MODEL | 包含 LiteAsk 的网关版本上，原生 LiteAsk 管理聊天使用的模型别名。默认未设置，此时隐藏该小部件。请在网关或管理后端上配置一个支持工具调用的模型。只有现任代理管理员能在自己的凭据下使用。读取无需 Redis；已批准的变更需要共享 Redis 做单次使用审批。
| LITELLM_UI_API_DOC_BASE_URL | 管理界面与代理不同主机时，API 参考基础 URL（用于示例代码/文档）的可选覆盖值。未设置时默认为 `PROXY_BASE_URL`。
| LITELLM_UI_PATH | 管理界面文件所在目录的路径。以只读文件系统运行时使用（如 Kubernetes）。Docker 中默认为 `/var/lib/litellm/ui`。
| LITELLM_UI_SESSION_DURATION | UI 登录会话的时长（用户名/密码、SSO、邀请链接）。格式："30s"、"30m"、"24h"、"7d"。不适用于 EXPERIMENTAL_UI_LOGIN 流程，后者出于安全考虑固定 10 分钟过期。默认 "24h"
| LITELLM_EXECUTED_BATCH_CONCURRENCY | LiteLLM 自行执行批处理时，同一批中并行运行的行数；仅对服务器没有 Files API 的 `hosted_vllm` 部署才会自行执行。默认 4。参见 [vLLM 批处理](../providers/vllm_batches)
| LITELLM_EXPIRED_UI_SESSION_KEY_CLEANUP_BATCH_SIZE | 每次清理运行最多删除多少个过期的 LiteLLM 仪表板会话密钥。默认 1000。
| LITELLM_EXPIRED_UI_SESSION_KEY_CLEANUP_ENABLED | 设为 `true` 以启用针对过期 LiteLLM 仪表板会话密钥的后台清理任务。默认 `false`。
| LITELLM_EXPIRED_UI_SESSION_KEY_CLEANUP_INTERVAL_SECONDS | 过期 LiteLLM 仪表板会话密钥清理任务的运行间隔（秒）。默认 86400（24 小时）。
| LITELM_ENVIRONMENT | LiteLLM 实例的环境，供日志服务使用。目前只有 DeepEval 在用。
| LITELLM_KEY_ROTATION_ENABLED | 为 LiteLLM 启用自动密钥轮换（布尔值）。默认 false。
| LITELLM_KEY_ROTATION_CHECK_INTERVAL_SECONDS | 自动轮换密钥任务的运行间隔（秒）。默认 86400（24 小时）。
| LITELLM_KEY_ROTATION_GRACE_PERIOD | 轮换后旧密钥保持有效的时长（如 "24h"、"2d"）。默认为空（立即吊销）。用于定时轮换，以及重新生成请求未指定时的回退。
| LITELLM_KEY_ROTATION_LOCK_TTL_SECONDS | 密钥轮换任务所用分布式锁的 TTL（秒）。默认 600（10 分钟）。
| LITELLM_JOB_ROLE | 本进程注册哪些定时后台任务。`all`（未设置时的默认值）和 `worker` 注册所有任务；`serving` 不注册任何单所有者任务，因此服务型部署可以把预算重置、花费日志清理、密钥轮换、用量导出等共享任务交给专用的 worker 部署。不区分大小写；无法识别的值会记录警告并按 `all` 处理。参见[在专用 worker 上运行后台任务](./prod.md#用专用-worker-运行后台任务)。
| LITELLM_LICENSE | LiteLLM 使用的许可证密钥
| LITELLM_LOCAL_ANTHROPIC_BETA_HEADERS | 设为 `True` 时只使用本地内置的 Anthropic beta 头配置，禁用远程拉取。默认 `False`
| LITELLM_LOCAL_AUTOROUTER_PRESETS | 设为 `True` 时只提供随包内置的自动路由器预设目录，禁用远程拉取。默认 `False`
| LITELLM_OIDC_ALLOWED_CREDENTIAL_DIRS | `oidc/file/` 提供商允许读取令牌文件的绝对目录列表（逗号分隔）。默认为 `/var/run/secrets,/run/secrets`。
| LITELLM_LOCAL_BLOG_POSTS | 设为 `True` 时只使用本地内置的博客文章，禁用从 GitHub 远程拉取。默认 `False`
| LITELLM_LOCAL_MODEL_COST_MAP | 设为 `True` 时只使用随包内置的模型成本表（`litellm/model_prices_and_context_window_backup.json`），禁用启动时和 `/reload/model_cost_map` 时从 GitHub 远程拉取。默认 `False`：启动时拉取远程文件，拉取失败才用内置副本兜底
| LITELLM_LOCAL_POLICY_TEMPLATES | 设为 "true" 时使用本地备份策略模板，而非从 GitHub 拉取。策略模板默认从 https://raw.githubusercontent.com/BerriAI/litellm/main/policy_templates.json 拉取，失败时自动回退到本地备份
| LITELLM_LOG | 为 LiteLLM 启用详细日志
| LITELLM_MODEL_COST_MAP_URL | 拉取模型成本表数据的 URL。默认为 https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
| LITELLM_LOGGER_NAME | OTEL logger 的名称 
| LITELLM_METER_NAME | OTEL Meter 的名称 
| LITELLM_OTEL_INTEGRATION_ENABLE_EVENTS | 为 OTEL 可选启用语义日志（semconv 模式下为 `gen_ai.content.prompt`/`gen_ai.content.completion` 或 `gen_ai.client.inference.operation.details`）。默认 `false`。参见 [OpenTelemetry](/docs/observability/opentelemetry_integration#configuration-reference)
| LITELLM_OTEL_INTEGRATION_ENABLE_METRICS | 为 OTEL 可选启用语义指标（TTFT、TPOT、响应时长、成本、Token 用量）。默认 `false`。参见 [OpenTelemetry](/docs/observability/opentelemetry_integration#metrics-reference)
| LITELLM_OTEL_BAGGAGE_TEAM_METADATA_KEYS | 允许提升到 OTEL span 中 `litellm.team.metadata` 下的团队元数据子键白名单（逗号分隔）。默认为空，即在每个子键被显式列入白名单前，不向追踪后端发送任何团队自由格式元数据。也可在 config.yaml 的 `callback_settings.otel` 下以 `baggage_team_metadata_keys` 设置。参见 [OpenTelemetry](/docs/observability/opentelemetry_integration)。
| LITELLM_ENABLE_PYROSCOPE | 为 true 时启用 Pyroscope CPU 剖析。剖析数据发送到 PYROSCOPE_SERVER_ADDRESS。默认关闭。参见 [Pyroscope 剖析](/docs/proxy/pyroscope_profiling)。
| LITELLM_ENABLE_TEAM_STALE_ALIAS_BYPASS | 设为 `true` 时，若某团队的旧版 `model_aliases` 条目把公共模型名映射到内部 `model_name_<team_id>_<uuid>` 部署，且该公共名存在团队范围内的兄弟部署，则调用前处理可跳过这次改写，让负载均衡 / `order` 在兄弟部署间生效。为向后兼容默认 `false`。参见[团队范围的模型与旧版 model_aliases](./load_balancing#team-scoped-models-and-legacy-model_aliases)。检测到过期别名且此标志关闭时，代理可能记录一次性警告。
| PYROSCOPE_APP_NAME | 上报给 Pyroscope 的应用名称。LITELLM_ENABLE_PYROSCOPE 为 true 时必填。无默认值。
| PYROSCOPE_SERVER_ADDRESS | Pyroscope 接收剖析数据的服务器 URL。LITELLM_ENABLE_PYROSCOPE 为 true 时必填。无默认值。
| PYROSCOPE_SAMPLE_RATE | 可选。Pyroscope 剖析的采样率（整数）。无默认值；未设置时使用 pyroscope-io 库的默认值。
| PYROSCOPE_GRAFANA_USER | 可选。用于基本认证的 Grafana Cloud Pyroscope 用户/租户 ID。设置 PYROSCOPE_GRAFANA_API_TOKEN 时必填。
| PYROSCOPE_GRAFANA_API_TOKEN | 可选。Pyroscope 基本认证用的 Grafana Cloud API/访问策略令牌。设置 PYROSCOPE_GRAFANA_USER 时必填。
| LITELLM_MASTER_KEY | 代理认证的主密钥。未设置、为空或为已知不安全值时代理不会启动。[代理拒绝以已知不安全主密钥启动](./master_key_rotations.md#proxy-refuses-to-start)
| LITELLM_MIGRATE_FROM_MASTER_KEY | 旧主密钥。与新设的安全 `LITELLM_MASTER_KEY` 一起设置且未设 `LITELLM_SALT_KEY` 时，代理会在启动时、服务流量前，把所有能以旧密钥解密的存量值重新加密，并记录该变量何时可以删除。之后继续保留它没有任何作用。[代理拒绝以已知不安全主密钥启动](./master_key_rotations.md#proxy-refuses-to-start)
| LITELLM_MAX_BUDGET_PER_SESSION_TTL | 每会话最大预算限制器所会话预算计数器的 TTL（秒）。默认 3600（1 小时）
| LITELLM_MAX_ITERATIONS_TTL | 最大迭代次数限制器所会话迭代计数器的 TTL（秒）。默认 3600（1 小时）
| LITELLM_MAX_STREAMING_DURATION_SECONDS | 流式响应允许的最大时长（秒）。超过该时长的流会以 Timeout 错误终止。默认 None（无限制）
| LITELLM_STORE_AUDIT_LOGS | 为密钥、团队、用户等管理对象上的每次创建、更新和删除记录审计日志的标志。是 `litellm_settings.store_audit_logs` 的环境变量等价物，仅在该配置项未设置时读取；写入条目需要企业许可证。**企业许可证下默认 True，否则为 False**
| LITELLM_MODE | LiteLLM 的运行模式（如 production、development）
| LITELLM_NON_ROOT | 在 Docker 容器中以非 root 模式运行 LiteLLM 以增强安全性的标志
| LITELLM_RATE_LIMIT_WINDOW_SIZE | LiteLLM 的限流窗口大小。默认 60
| LITELLM_REASONING_AUTO_SUMMARY | 设为 "true" 时，在所有转换路径（Anthropic 适配器、Responses API 等）上为推理模型自动启用详细推理摘要（`summary: "detailed"`）。默认 "false"
| LITELLM_SALT_KEY | LiteLLM 加密用的盐密钥
| LITELLM_SET_REPLICA_IDENTITY_FULL | 设为 `true` 时，在每次迁移运行结束时对每张 LiteLLM 表执行 `ALTER TABLE ... REPLICA IDENTITY FULL`。Neon 或湖仓同步这类逻辑复制消费者需要 FULL 副本标识才能读取 UPDATE 或 DELETE 的旧行；Prisma 保留新表为 Postgres 默认值。要求迁移用户拥有这些表。默认 `false`
| LITELLM_SENSITIVE_ROUTING_TTL | 粘性敏感数据路由决策的 TTL（秒）；控制会话保持固定在路由防护栏所选本地模型上的时长。默认 3600
| LITELLM_SSL_CIPHERS | 用于更快握手的 SSL/TLS 密码套件配置。控制 OpenSSL 连接的密码套件偏好。
| LITELLM_SECRET_AWS_KMS_LITELLM_LICENSE | AWS KMS 加密的 LiteLLM 许可证
| LITELLM_TPM_TOKEN_RESERVATION_ENABLED | 默认 `true`。设为 `false` 可禁用 v3 限流器中请求前的 TPM 预留，改为在每个实时请求完成后按实际用量记账。这会减少每请求一次的 Redis 操作，但并发请求可能暂时超出 TPM 限制。此设置不适用于 `POST /v1/batches`，后者使用[独立的输入文件限制器](../batches#batches-api-限流的工作方式)。参见[预估输出 Token](./users#预估输出-token未带-max_tokens-的请求)。 |
| LITELLM_USE_CHAT_COMPLETIONS_URL_FOR_ANTHROPIC_MESSAGES | 设为 "true" 时，对 Anthropic 模型让 OpenAI /v1/messages 请求走 chat/completions 而非 Responses API。也可通过 `litellm_settings.use_chat_completions_url_for_anthropic_messages` 设置
| LITELLM_ROUTE_ALL_CHAT_OPENAI_TO_RESPONSES | 设为 "true" 时，让所有 OpenAI /chat/completions 请求走 Responses API 桥接。推荐用于 OpenAI 模型。也可通过 `litellm_settings.route_all_chat_openai_to_responses` 设置
| LITELLM_GEMINI_LIVE_DEFER_SETUP | 设为 "true" 时，把 Gemini/Vertex Live 的建立推迟到客户端发送 `session.update`（运行时工具注入需要）。为向后兼容默认 "false"，即在连接时自动发送 setup。也可通过 `litellm.gemini_live_defer_setup` 设置
| LITELLM_USER_AGENT | LiteLLM API 请求的自定义 user agent 字符串。用于合作伙伴遥测归因
| LITELLM_WORKER_STARTUP_HOOKS | 要在每个工作进程启动期间运行的 `module.path:function_name` 可调用对象列表（逗号分隔）。在工作进程生命周期早期运行（配置/数据库加载之前）。适合重新初始化 [gflags](https://github.com/google/python-gflags) 这类每进程状态。详情参见[工作进程启动钩子](/docs/proxy/worker_startup_hooks)
| LITELLM_PRINT_STANDARD_LOGGING_PAYLOAD | 为 true 时，把标准日志负载打印到控制台，便于调试
| LITELLM_PRISMA_BOOTSTRAP_TIMEOUT | 为 Prisma CLI 运行所需的 Node 工具链一次性安装预留的秒数，每个容器在任何迁移之前执行一次。安装超过十分钟的慢速或带宽受限节点上调高。非正数或非数值会被忽略并记录警告，应用默认值。**默认值为 600**
| LITELLM_PRISMA_COMMAND_TIMEOUT | 除 `prisma migrate deploy` 外的单条 Prisma 命令被终止并重试前可运行的秒数。对大型或高负载库执行迁移状态、resolve 或 db push 步骤确实可能超过一分钟，此时调高。非正数的值会被忽略并记录警告，应用默认值，因此打错字也不会意外关闭超时。**默认值为 60**
| LITELLM_PRISMA_MIGRATE_DEPLOY_TIMEOUT | 单次 `prisma migrate deploy` 被终止并重试前可运行的秒数。该命令一次性应用所有待处理迁移，因此全新或长期闲置的数据库所需时间远超任何其他 Prisma 命令。应用积压超过十分钟时调高；对始终无响应的数据库调低以更快失败。非正数的值会被忽略并记录警告，应用默认值。未设置时预算为 600 与 `LITELLM_PRISMA_COMMAND_TIMEOUT` 中较大者，因此已为慢速部署调高单命令超时的部署会保留更大的预算。**默认值为 600**
| LITELM_ENVIRONMENT | LiteLLM 实例的环境。目前只记录到 DeepEval，用于确定 DeepEval 集成的环境。
| LITELLM_ASYNCIO_QUEUE_MAXSIZE | asyncio 队列的最大容量（如日志队列、花费更新队列，以及 `nova_sonic_realtime.py` 中实时音频等 cookbook 示例）。限制内存增长以防止 OOM。默认 1000。
| LOGFIRE_TOKEN | Logfire 日志服务的令牌
| LOGFIRE_BASE_URL | Logfire 日志服务的基础 URL（自托管部署时有用）
| LOGGING_WORKER_CONCURRENCY | asyncio 事件循环上日志工作进程的最大并发协程槽位数。默认 100。设置过高会让日志任务淹没事件循环，拉高请求整体延迟。
| LOGGING_WORKER_MAX_QUEUE_SIZE | 日志工作进程队列的最大容量。队列满时，工作进程会激进清理任务腾出空间，而不是丢弃日志。默认 50,000
| LOGGING_WORKER_MAX_TIME_PER_COROUTINE | 日志工作进程中每个协程超时前允许的最大时长（秒）。默认 20.0
| LOGGING_WORKER_CLEAR_PERCENTAGE | 清理时提取的队列百分比。默认 50% 
| MAX_BASE64_LENGTH_FOR_LOGGING | 日志负载中保留的 base64 字符数上限。超过此限制的 data URI 会被替换为大小占位符。设为 0 禁用截断。默认 64
| MAX_BASE64_LENGTH_STDOUT_LOG | 写入 stdout 的日志行（含 DEBUG 在内的所有级别）中原样保留的 base64 串的最大长度（字符数）。更长的串会在消息和任何 traceback 中被替换为 `[base64_data truncated: 2.86MB]` 这类大小占位符，周围文本保持不变。十六进制和十进制串（摘要、数字 ID）不受影响。日志回调（OTEL、Datadog 等）仍接收完整记录。设为 0 禁用。默认 4096
| MAX_COMPETITOR_NAMES | 策略模板增强中允许的竞品名称数量上限。默认 100
| MAX_EXCEPTION_MESSAGE_LENGTH | 异常消息的最大长度。默认 2000
| MAX_ITERATIONS_TO_CLEAR_QUEUE | 关闭时清理日志工作进程队列的最大尝试迭代次数。默认 200
| MAX_TIME_TO_CLEAR_QUEUE | 关闭时清理日志工作进程队列的最大耗时（秒）。默认 5.0
| LOGGING_WORKER_AGGRESSIVE_CLEAR_COOLDOWN_SECONDS | 队列满时允许再次执行激进清理操作的冷却时间（秒）。默认 0.5 
| MAX_STRING_LENGTH_PROMPT_IN_DB | 清理请求体时花费日志中字符串的最大长度。超过此长度的字符串会被截断。默认 1000
| MAX_STRING_LENGTH_STDOUT_LOG | INFO 及以上级别的日志行（消息或 traceback）写入 stdout 的最大字符数。更长的行会保留头部和尾部，中间以 `litellm_truncated skipped N chars` 标记代替（计入上限）。DEBUG 行从不裁剪，因此 `--detailed_debug` 仍打印完整负载；日志回调（OTEL、Datadog 等）仍接收完整记录。设为 0 禁用。默认 4096
| MAX_IN_MEMORY_QUEUE_FLUSH_COUNT | 内存队列刷新操作的最大次数。默认 1000
| MAX_IMAGE_URL_DOWNLOAD_SIZE_MB | 从 URL 下载图像的最大大小（MB）。防止下载超大图像造成内存问题。超过此限制的图像会在下载前被拒绝。设为 0 完全禁用图像 URL 处理（所有 image_url 请求都会被阻止）。默认 50MB（与 [OpenAI 的限制](https://platform.openai.com/docs/guides/images-vision?api-mode=chat#image-input-requirements)一致）
| MAX_LONG_SIDE_FOR_IMAGE_HIGH_RES | 高分辨率图像长边的最大长度。默认 2000
| MAX_REDIS_BUFFER_DEQUEUE_COUNT | Redis 缓冲区出队操作的最大次数。默认 100
| MAX_REQUEST_BODY_SIZE_TO_REPAIR_MB | 请求体无法按 JSON 解析时 LiteLLM 尝试修复的最大请求体大小（MB）。修复回退会对整个请求体执行两轮正则处理来修复无效的代理对转义，这会在大型畸形负载上阻塞事件循环。超过此大小的请求体跳过修复并立即返回 400；不超过的仍会修复。设为 0 取消上限并始终尝试修复。默认 1（MB）
| MAX_SHORT_SIDE_FOR_IMAGE_HIGH_RES | 高分辨率图像短边的最大长度。默认 768
| MAX_SIZE_IN_MEMORY_QUEUE | 内存队列的最大容量。默认 10000
| MAX_SIZE_PER_ITEM_IN_MEMORY_CACHE_IN_KB | 内存缓存中每个条目的最大大小（KB）。默认 512 或 1024
| MAX_SPENDLOG_ROWS_TO_QUERY | 花费日志查询的最大行数。默认 1,000,000
| MAX_TEAM_LIST_LIMIT | 可列出的团队数量上限。默认 20
| MAX_TILE_HEIGHT | 图像瓦片的最大高度。默认 512
| MAX_TILE_WIDTH | 图像瓦片的最大宽度。默认 512
| MAX_TOKEN_TRIMMING_ATTEMPTS | 裁剪 Token 消息的最大尝试次数。默认 10
| MAXIMUM_TRACEBACK_LINES_TO_LOG | LiteLLM 日志界面中 traceback 记录的最大行数。默认 100
| MAX_RETRY_DELAY | 重试请求的最大延迟（秒）。默认 8.0
| MAX_LANGFUSE_INITIALIZED_CLIENTS | 代理上初始化的 Langfuse 客户端数量上限。默认 50。之所以设置，是因为 Langfuse 每初始化一个客户端都会启动 1 个线程。我们曾因 Langfuse 被多次初始化而达到 100% CPU 占用。
| MAX_MCP_SEMANTIC_FILTER_TOOLS_HEADER_LENGTH | MCP 语义过滤工具的最大请求头长度。默认 150
| MAX_POLICY_ESTIMATE_IMPACT_ROWS | 评估策略影响时返回的最大行数。默认 1000
| MAX_PAYLOAD_SIZE_FOR_DEBUG_LOG | 完整 DEBUG 序列化的最大负载大小（字节）。超过此值的负载会在日志中被截断。默认 102400（100 KB）
| MIN_NON_ZERO_TEMPERATURE | 最小非零温度值。默认 0.0001
| MINIMUM_CUSTOM_KEY_LENGTH | /key/generate 和 /key/regenerate 上用户自供密钥值的最小长度。默认 16
| MINIMUM_PROMPT_CACHE_TOKEN_COUNT | 缓存提示词的最小 Token 数。默认 1024
| MISTRAL_API_BASE | Mistral API 的基础 URL。默认为 https://api.mistral.ai
| MISTRAL_API_KEY | Mistral API 的 API 密钥
| MICROSOFT_AUTHORIZATION_ENDPOINT | Microsoft SSO 的自定义授权端点 URL（覆盖默认的 Microsoft OAuth 授权端点）
| MICROSOFT_CLIENT_ID | Microsoft 服务的客户端 ID
| MICROSOFT_CLIENT_SECRET | Microsoft 服务的客户端密钥
| MICROSOFT_GRAPH_ENDPOINT | SSO 期间同步 Entra ID 分组成员资格时使用的 Microsoft Graph API 基础 URL。默认为 `https://graph.microsoft.com/v1.0`。Azure 政府云（GCC High）设为 `https://graph.microsoft.us/v1.0`
| MICROSOFT_SERVICE_PRINCIPAL_ID | Microsoft 企业应用的服务主体 ID。（这是一项高级功能，只有想让 litellm 根据成员的 Microsoft Entra ID 分组自动把他们分配到 Litellm 团队时才需要）
| MICROSOFT_TENANT | Microsoft Azure 的租户 ID
| MICROSOFT_TOKEN_ENDPOINT | Microsoft SSO 的自定义令牌端点 URL（覆盖默认的 Microsoft OAuth 令牌端点）
| MICROSOFT_USER_DISPLAY_NAME_ATTRIBUTE | Microsoft SSO 响应中用户显示名的字段名。默认为 `displayName`
| MICROSOFT_USER_EMAIL_ATTRIBUTE | Microsoft SSO 响应中用户邮箱的字段名。默认为 `userPrincipalName`
| MICROSOFT_USER_FIRST_NAME_ATTRIBUTE | Microsoft SSO 响应中用户名字的字段名。默认为 `givenName`
| MICROSOFT_USER_ID_ATTRIBUTE | Microsoft SSO 响应中用户 ID 的字段名。默认为 `id`
| MICROSOFT_USER_LAST_NAME_ATTRIBUTE | Microsoft SSO 响应中用户姓氏的字段名。默认为 `surname`
| MICROSOFT_USERINFO_ENDPOINT | Microsoft SSO 的自定义 userinfo 端点 URL（覆盖默认的 Microsoft Graph userinfo 端点）
| MODEL_COST_MAP_MAX_SHRINK_RATIO | 将拉取到的模型成本表与本地备份校验时允许的最大缩减比例。拉取到的成本表小于备份的这一比例时予以拒绝。默认 0.5
| MODEL_COST_MAP_MIN_MODEL_COUNT | 拉取到的成本表被视为有效所需的最少模型数。默认 50
| MS_TEAMS_WEBHOOK_URL | Microsoft Teams 告警的传入 webhook URL，`general_settings.alerting` 包含 `ms_teams` 时使用。参见 [MS Teams 告警](./alerting#ms-teams-webhook)
| NEW_RELIC_APP_NAME | New Relic AI 监控集成的应用名称 |
| NEW_RELIC_LICENSE_KEY | New Relic 认证的许可证密钥 |
| NO_DOCS | 禁用 Swagger UI 文档的标志
| NO_OPENAPI | 禁用 /openapi.json 端点的标志
| NO_REDOC | 禁用 Redoc 文档的标志
| NO_PROXY | 绕过代理的地址列表
| NON_LLM_CONNECTION_TIMEOUT | 非 LLM 服务连接的超时（秒）。默认 15
| OAUTH_TOKEN_INFO_ENDPOINT | 获取 OAuth 令牌信息的端点
| OPENAI_BASE_URL | OpenAI API 的基础 URL
| OPENAI_API_BASE | OpenAI API 的基础 URL。默认为 https://api.openai.com/
| OPENAI_API_KEY | OpenAI 服务的 API 密钥
| OPENAI_CHATGPT_API_BASE | CHATGPT_API_BASE 的替代项。ChatGPT API 的基础 URL
| OPENAI_FILE_SEARCH_COST_PER_1K_CALLS | OpenAI 文件搜索每 1000 次调用的费用。默认 0.0025
| OPENAI_IDENTITY_PROVIDER_ID | OpenAI 工作负载身份联合的身份提供商 ID（`idp_...`）。当它、`OPENAI_SERVICE_ACCOUNT_ID` 和 `OPENAI_IDENTITY_TOKEN_FILE` 都已设置且未配置 OpenAI API 密钥时，代理通过 OIDC 令牌换取短期 Bearer（RFC 8693）来认证 `openai/` 模型。这些环境变量是代理级默认值；同样三个值也可以按部署或按凭据设置为 `openai_identity_provider_id`、`openai_service_account_id` 和 `openai_identity_token_file`，后者优先。参见 [OpenAI 工作负载身份联合](../providers/openai#工作负载身份联合无-api-密钥)。要求 `openai>=2.32.0`
| OPENAI_IDENTITY_TOKEN_FILE | OpenAI 工作负载身份联合使用的 OIDC 主体令牌文件路径，如 Kubernetes 投影服务账号令牌路径
| OPENAI_ORGANIZATION | OpenAI 的组织标识
| OPENAI_SERVICE_ACCOUNT_ID | 工作负载身份联合认证所用 OpenAI 平台服务账号 ID（`user-...`）。与 LiteLLM 虚拟密钥服务账号无关
| OPENAPI_URL | OpenAPI JSON 端点的路径。**默认值为 "/openapi.json"**
| OPENID_BASE_URL | OpenID Connect 服务的基础 URL
| OPENID_CLIENT_ID | OpenID Connect 认证的客户端 ID
| OPENID_CLIENT_SECRET | OpenID Connect 认证的客户端密钥
| OPENMETER_API_ENDPOINT | OpenMeter 集成的 API 端点
| OPENMETER_API_KEY | OpenMeter 服务的 API 密钥
| OPENMETER_EVENT_TYPE | 发送到 OpenMeter 的事件类型
| OPENMETER_TRUST_REQUEST_USER | 为 false 时忽略请求体中的 `user`，改从已认证密钥的 user_id 解析 OpenMeter 主体。默认 true
| ONYX_API_BASE | Onyx Security AI Guard 服务的基础 URL（默认为 https://ai-guard.onyx.security）
| ONYX_API_KEY | Onyx Security AI Guard 服务的 API 密钥
| ONYX_TIMEOUT | Onyx Guard 服务器请求的超时（秒）。默认 10
| OTEL_ENDPOINT | 用于追踪的 OpenTelemetry 端点
| OTEL_EXPORTER_OTLP_CERTIFICATE | OTLP HTTP 导出器信任的 CA 证书包路径。由 OpenTelemetry SDK 设置；设置后对 OTLP 导出优先于 `SSL_CERT_FILE` 和 `ssl_verify`
| OTEL_EXPORTER_OTLP_ENDPOINT | 用于追踪的 OpenTelemetry 端点
| OTEL_ENVIRONMENT_NAME | OpenTelemetry 的环境名
| OTEL_EXPORTER | OpenTelemetry 的导出器类型
| OTEL_EXPORTER_OTLP_PROTOCOL | OpenTelemetry 的导出器类型
| OTEL_HEADERS | OpenTelemetry 请求的头
| OTEL_MODEL_ID | OpenTelemetry 追踪的模型 ID
| OTEL_EXPORTER_OTLP_HEADERS | OpenTelemetry 请求的头
| OTEL_SERVICE_NAME | OpenTelemetry 的服务名标识
| OTEL_TRACER_NAME | OpenTelemetry 追踪的 tracer 名称
| OTEL_LOGS_EXPORTER | OpenTelemetry 日志的导出器类型（如 console）
| OTEL_IGNORE_CONTEXT_PROPAGATION | 为 true 时忽略父 span 上下文传播（入站 `traceparent` 头和任何活动 span），让每条 LiteLLM 追踪都自成根。默认 `false`
| OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT | 控制是否在 OpenTelemetry 追踪中捕获提示词和补全。接受 `NO_CONTENT`（按规范默认）、`SPAN_ONLY`、`EVENT_ONLY`、`SPAN_AND_EVENT` 或布尔形式（`true` 映射为 `EVENT_ONLY`，`false` 为 `NO_CONTENT`）
| OTEL_SEMCONV_STABILITY_OPT_IN | 设为 `gen_ai_latest_experimental` 后，按最新的 [OpenTelemetry GenAI 语义约定](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/)发出 span。将 LLM 调用 span 重命名为 `{operation} {model}`，抑制 `raw_gen_ai_request`，添加 `gen_ai.provider.name`，并合并事件。可按 OTEL 规范以逗号合并多项
| USE_OTEL_LITELLM_REQUEST_SPAN | 设为 `true` 时，代理为每次 LLM 调用发出独立的 `litellm_request` span，作为 `Received Proxy Server Request` span 的子级。默认 `false`（自 v1.81.0 起）；LLM 调用属性直接设置在代理根 span 上。参见[为什么看不到 `litellm_request` span？](/docs/observability/opentelemetry_integration#why-dont-i-see-a-litellm_request-span)
| OTEL_DEBUG | 设为 `true` 时，把导出器和 span 创建的诊断信息打印到 stderr。追踪未到达后端时有用。默认 `false`
| DEBUG_OTEL | `OTEL_DEBUG` 的别名
| PAGERDUTY_API_KEY | PagerDuty 告警的 API 密钥
| PANW_PRISMA_AIRS_API_KEY | PANW Prisma AIRS 服务的 API 密钥
| PANW_PRISMA_AIRS_API_BASE | PANW Prisma AIRS 服务的基础 URL
| PHOENIX_API_KEY | Arize Phoenix 的 API 密钥
| PHOENIX_COLLECTOR_ENDPOINT | Arize Phoenix 的 API 端点
| PHOENIX_COLLECTOR_HTTP_ENDPOINT | Arize Phoenix 的 API HTTP 端点
| PILLAR_API_BASE | Pillar API 防护栏的基础 URL
| PILLAR_API_KEY | Pillar API 防护栏的 API 密钥
| PILLAR_ON_FLAGGED_ACTION | 内容被标记时采取的动作（'block' 或 'monitor'）
| PKCE_STRICT_CACHE_MISS | 设为 `true` 时，若缓存中找不到 PKCE code_verifier（例如跨 pod 缓存未命中），SSO 回调会返回 401 错误。为 `false`（默认）时记录警告并在没有 code_verifier 的情况下继续。
| POD_NAME | 服务器的 pod 名称，会以 `POD_NAME` [输出到 `datadog` 日志](https://docs.litellm.ai/docs/proxy/logging#datadog) 
| POINTFIVE_API_KEY | PointFive 日志集成的 API 密钥。用于为每批日志请求预签名的上传 URL
| POINTFIVE_API_URL | 该集成调用的 PointFive 摄取 API 基础 URL。默认为 https://api.pointfive.co/api/v1/ingestion
| POSTHOG_API_KEY | PostHog 分析集成的 API 密钥
| POSTHOG_API_URL | PostHog API 的基础 URL（默认为 https://us.i.posthog.com）
| POSTHOG_MOCK | 为 PostHog 集成测试启用模拟模式。设为 true 时拦截 PostHog API 调用并返回模拟响应，不发起真实网络请求。默认 false
| POSTHOG_MOCK_LATENCY_MS | 模拟模式启用时 PostHog API 调用的模拟延迟（毫秒），模拟网络往返耗时。默认 100ms
| PRISMA_AUTH_RECONNECT_LOCK_TIMEOUT_SECONDS | Prisma 认证重连的锁超时（秒）。默认 0.1
| PRISMA_AUTH_RECONNECT_TIMEOUT_SECONDS | Prisma 认证重连尝试的超时（秒）。默认 2.0
| PRISMA_HEALTH_WATCHDOG_ENABLED | 启用 Prisma 数据库健康看门狗，在连接丢失时监控并重连。默认 true
| PRISMA_HEALTH_WATCHDOG_INTERVAL_SECONDS | Prisma 健康看门狗探测的间隔（秒）。默认 30
| PRISMA_HEALTH_WATCHDOG_PROBE_TIMEOUT_SECONDS | 每次 Prisma 健康探测的超时（秒）。默认 5.0
| PRISMA_RECONNECT_COOLDOWN_SECONDS | Prisma 重连尝试之间的冷却时间（秒）。默认 15
| PRISMA_RECONNECT_ESCALATION_THRESHOLD | 升级重连策略前允许的连续重连失败次数。默认 3
| PRISMA_WATCHDOG_RECONNECT_TIMEOUT_SECONDS | Prisma 看门狗发起的重连的超时（秒）。默认 30.0
| PREDIBASE_API_BASE | Predibase API 的基础 URL
| PRESIDIO_ANALYZER_API_BASE | Presidio Analyzer 服务的基础 URL
| PRESIDIO_ANONYMIZER_API_BASE | Presidio Anonymizer 服务的基础 URL
| PROMETHEUS_BUDGET_METRICS_PER_REQUEST_TIMEOUT | 发出每请求 Prometheus 预算指标的最大耗时（秒），超过即跳过；超时只单独丢弃这次指标发出，这样缓慢的 Redis/数据库查找就无法取消整个成功日志事件。默认 5.0
| PROMETHEUS_BUDGET_METRICS_REFRESH_INTERVAL_MINUTES | Prometheus 预算指标的刷新间隔（分钟）。默认 5
| PROMETHEUS_FALLBACK_STATS_SEND_TIME_HOURS | 向 Prometheus 发送统计数据的回退时间（小时）。默认 9
| PROMETHEUS_URL | Prometheus 服务的 URL
| PROMPTLAYER_API_KEY | PromptLayer 集成的 API 密钥
| PROXY_ADMIN_ID | 代理服务器的管理员标识
| PROXY_BASE_URL | 代理服务的基础 URL。MCP OAuth `authorize` 端点校验浏览器提供的 `redirect_uri` 时，也用它作为代理的公共源，并据此决定会话/SSO/SAML cookie 是否标记 `Secure`。LiteLLM 位于 TLS 终止入口之后时，请将其设为用户在地址栏看到的精确源（如 `https://llm.example.com`）。只接受完整源：协议 + 主机（非默认端口需含端口），不带尾部斜杠、不带路径。设置后优先于 `X-Forwarded-*` 头，后者仅在 [`use_x_forwarded_for`](#general_settings-参考) 为 `true` 且请求对端位于 [`mcp_trusted_proxy_ranges`](#general_settings-参考) 内时生效。参见[安全最佳实践：反向代理后的 Secure cookie](./security_best_practices#8-在-tls-终止的反向代理后面配置-secure-cookie) 与 [MCP OAuth：反向代理与入口配置](../mcp_oauth#reverse-proxy-and-ingress-configuration)。
| PROXY_BATCH_WRITE_AT | 批量写入花费日志到数据库前等待的时间（秒）。默认 10
| PROXY_BATCH_POLLING_INTERVAL | 轮询批处理、检查其是否完成前等待的时间（秒）。默认 3600s（1 小时）
| PROXY_BATCH_POLLING_ENABLED | 设为 `false` 可完全禁用 `CheckBatchCost` 和 `CheckResponsesCost` 后台轮询任务。在存在大量过期管理对象的安装上做应急缓解时有用。默认 `true`
| PROXY_CONFIG_RELOAD_INTERVAL_SECONDS | `store_model_in_db` 启用时，每个 pod 从数据库重新加载库内配置对象（模型、凭据、防护栏等）的频率。调低可加快跨 pod 收敛，代价是更高的数据库负载；在代理启动时应用。默认 30
| PROXY_DB_LOOKUP_DEADLINE_SECONDS | 请求前数据库查找允许的秒数（含等待 `PROXY_DB_LOOKUP_MAX_CONCURRENCY` 门控槽位的时间），超时后请求直接以 503 失败而不是滞留在查找上。默认 10，最小 0.1
| PROXY_DB_LOOKUP_MAX_CONCURRENCY | 代理同时发往 Prisma 查询引擎的密钥对象数据库回退查找和花费计数器重播种查找的最大数量。多余的查找在代理内等待，而不是在引擎的 HTTP 客户端内排队；后者的簿记开销随排队请求数增长，会在缓存未命中爆发时饿死事件循环。默认 25
| PROXY_DB_LOOKUP_STALL_WINDOW_SECONDS | 查找超过 `PROXY_DB_LOOKUP_DEADLINE_SECONDS` 多久后，`/health/readiness` 端点报告 `"db":"stalled"`。设为 0 禁用。默认 30
| MAX_OBJECTS_PER_POLL_CYCLE | 每个轮询周期获取的管理对象（批处理 / 响应）数量上限。防止存在大量过期行的安装发生 OOM。默认为 `50`
| MANAGED_OBJECT_STALENESS_CUTOFF_DAYS | 非终态的管理对象超过这么多天后，会在每个轮询周期开始时标记为 `stale_expired` 并跳过。默认为 `7`
| PROXY_BUDGET_RESCHEDULER_MAX_TIME | 检查数据库预算重置前等待的最大时间（秒）。默认 605
| PROXY_BUDGET_RESCHEDULER_MIN_TIME | 检查数据库预算重置前等待的最小时间（秒）。默认 597
| PYTHON_GC_THRESHOLD | GC 阈值（'gen0,gen1,gen2'，如 '1000,50,50'）；默认取 Python 自带值。
| PROXY_LOGOUT_URL | 退出代理服务的 URL
| QDRANT_API_BASE | Qdrant API 的基础 URL
| QDRANT_API_KEY | Qdrant 服务的 API 密钥
| QDRANT_SCALAR_QUANTILE | Qdrant 操作的标量分位数。默认 0.99
| QDRANT_URL | Qdrant 数据库的连接 URL
| QDRANT_VECTOR_SIZE | Qdrant 操作的向量维度。默认 1536
| REDIS_CONNECTION_POOL_TIMEOUT | Redis 连接池的超时（秒）。默认 5
| REDIS_CIRCUIT_BREAKER_ENABLED | 为 false 时禁用 Redis 熔断器，永不打开。默认 true
| REDIS_CIRCUIT_BREAKER_FAILURE_THRESHOLD | Redis 熔断器打开前允许的连续失败次数。默认 5
| REDIS_CIRCUIT_BREAKER_RECOVERY_TIMEOUT | Redis 熔断器打开后尝试恢复前等待的时间（秒）。默认 60
| REDIS_CIRCUIT_BREAKER_TIMEOUT_MIN_DURATION | 连续只有超时这一种失败时，需持续的最短时长（秒），达到后 Redis 熔断器才打开；硬连接失败仍会在失败阈值处将其打开。默认 5.0
| REDIS_CLUSTER_NODES | Redis Cluster 模式的 Redis 集群启动节点列表（JSON 格式）。示例：`[{"host": "node1", "port": 6379}]`
| REDIS_HOST | Redis 服务器的主机名
| REDIS_PASSWORD | Redis 服务的密码
| REDIS_PORT | Redis 服务器的端口号
| REDIS_SOCKET_TIMEOUT | LiteLLM 在未显式指定 `socket_timeout` 时构建的 Redis 客户端的套接字超时（秒），目前指 Sentinel 连接路径。**代理缓存客户端不读取它**：它始终传入自己的 `socket_timeout`（默认 5.0 秒），请改用 `cache_params.socket_timeout` 调整。参见 [Redis socket_timeout](./caching_redis#redis-socket_timeout)。默认 0.1
| REDIS_TIMEOUT_LOG_INTERVAL | Redis 超时日志行之间的间隔秒数。一波超时中的第一条按正常级别记录，后续按 DEBUG 记录，间隔过后会用一行报告抑制了多少条。非超时的 Redis 错误不受节流。默认 5.0
| REDIS_GCP_SERVICE_ACCOUNT | 用于 Redis IAM 认证的 GCP 服务账号。格式："projects/-/serviceAccounts/name@project.iam.gserviceaccount.com"
| REDIS_GCP_SSL_CA_CERTS | 用于 GCP Memorystore Redis 安全连接的 SSL CA 证书文件路径
| REDOC_URL | Redoc Fast API 文档的路径。**默认值为 "/redoc"**
| REPEATED_STREAMING_CHUNK_LIMIT | 检测循环的重复流式分块数量上限。默认 100
| REALTIME_CREDENTIAL_RESOLUTION_TIMEOUT_SECONDS | 实时会话开始前获取 Vertex AI 访问令牌的超时（秒）。默认 20.0
| REALTIME_WEBSOCKET_MAX_MESSAGE_SIZE_BYTES | 实时连接中 WebSocket 消息的最大大小（字节）。默认 None。
| REPLICATE_MODEL_NAME_WITH_ID_LENGTH | 带 ID 的 Replicate 模型名的长度。默认 64
| REPLICATE_POLLING_DELAY_SECONDS | Replicate 轮询操作的延迟（秒）。默认 0.5
| REQUEST_TIMEOUT | 请求的超时（秒）。默认 6000
| RESET_BUDGET_JOB_BATCH_SIZE | 预算重置任务每个事务读取并提交的最大行数。默认 500
| RESET_BUDGET_JOB_MAX_CHUNKS_PER_RUN | 每个预算重置阶段每次运行处理的最大批次数；剩余的留待下次运行。默认 100
| RESPONSES_SESSION_LOOKUP_MAX_ATTEMPTS | `/v1/responses` 在放弃前对 `previous_response_id` 背后会话的查找次数，确保紧接上一轮发出的后续请求不会抢先于该轮的花费日志落库。默认 3
| RESPONSES_SESSION_LOOKUP_RETRY_INTERVAL | 这些会话查找尝试之间的等待秒数。默认 0.2
| ROOT_REDIRECT_URL | `DOCS_URL` 设为 "/" 以外的值时（默认为 "/"），根路径（/）重定向到的 URL
| ROUTER_MAX_FALLBACKS | 路由器的最大回退次数。默认 5
| RUBRIK_API_KEY | 与 Rubrik webhook 服务认证用的 Bearer 令牌
| RUBRIK_BATCH_SIZE | 刷新到 Rubrik 前缓冲的日志条目数。默认 512
| RUBRIK_SAMPLING_RATE | 记录到 Rubrik 的请求比例（0.0 到 1.0）。默认 1.0
| RUBRIK_WEBHOOK_URL | 用于工具阻断和批量日志的 Rubrik webhook 服务基础 URL
| RUNWAYML_DEFAULT_API_VERSION | RunwayML 服务的默认 API 版本。默认为 "2024-11-06"
| RUNWAYML_POLLING_TIMEOUT | RunwayML 图像生成轮询的超时（秒）。默认 600（10 分钟）
| S3_VECTORS_DEFAULT_DIMENSION | S3 Vectors RAG 摄取的默认向量维度。默认 1024
| S3_VECTORS_DEFAULT_DISTANCE_METRIC | S3 Vectors RAG 摄取的默认距离度量。可选值："cosine"、"euclidean"。默认为 "cosine"
| SECRET_MANAGER_REFRESH_INTERVAL | 密钥管理器的刷新间隔（秒）。默认 86400（24 小时）
| SEMANTIC_CACHE_EMBEDDING_TIMEOUT_SECONDS | 每次请求前语义缓存发起嵌入调用的期限（秒）。超时会跳过缓存而不是挂住请求。默认 5.0
| SERVER_ROOT_PATH | 服务器应用的根路径
| SEND_USER_API_KEY_ALIAS | 向 Zscaler AI Guard 发送用户 API 密钥别名的标志。默认 False
| SEND_USER_API_KEY_TEAM_ID | 向 Zscaler AI Guard 发送用户 API 密钥团队 ID 的标志。默认 False
| SEND_USER_API_KEY_USER_ID | 向 Zscaler AI Guard 发送用户 API 密钥用户 ID 的标志。默认 False
| SET_VERBOSE | [已废弃] 改用 `LITELLM_LOG`，取值 "INFO"、"DEBUG" 或 "ERROR"。参见[调试文档](./debugging)
| SINGLE_DEPLOYMENT_TRAFFIC_FAILURE_THRESHOLD | 单部署冷却逻辑认定"流量合理"所需的最少请求数。默认 1000
| SLACK_DAILY_REPORT_FREQUENCY | Slack 日报的频率（如 daily、weekly）
| SLACK_WEBHOOK_URL | Slack 集成的 webhook URL
| SMTP_HOST | SMTP 服务器的主机名
| SMTP_PASSWORD | SMTP 认证的密码（SMTP 不要求认证时不要设置）
| SMTP_PORT | SMTP 服务器的端口号
| SMTP_SENDER_EMAIL | SMTP 事务中用作发件人的邮箱地址
| SMTP_SENDER_LOGO | 通过 SMTP 发送的邮件中使用的徽标
| SMTP_TIMEOUT | SMTP 连接和操作的超时（秒）（默认：30）
| SMTP_TLS | 启用或禁用 SMTP 连接 TLS 的标志
| SMTP_USE_SSL | 设为 "True" 可在任意端口上强制隐式 SSL（SMTP_SSL）。465 端口无需设置（自动使用隐式 SSL）；其他端口默认使用 STARTTLS（见 SMTP_TLS）
| SMTP_USERNAME | SMTP 认证的用户名（SMTP 不要求认证时不要设置）
| SENDGRID_API_KEY | SendGrid 邮件服务的 API 密钥
| RESEND_API_KEY | Resend 邮件服务的 API 密钥
| SENDGRID_SENDER_EMAIL | SendGrid 邮件事务中用作发件人的邮箱地址 
| SPEND_LOGS_URL | 检索花费日志的 URL
| SPEND_LOG_CLEANUP_BATCH_SIZE | 清理期间每批删除的日志数。默认 1000
| STALE_OBJECT_CLEANUP_BATCH_SIZE | 每个清理周期最多更新的过期管理对象数。默认 1000
| SSL_CERTIFICATE | SSL 证书文件的路径
| SSL_ECDH_CURVE | 用于 SSL/TLS 密钥交换的 ECDH 曲线（如 'X25519' 可禁用 PQC）。
| SSL_SECURITY_LEVEL | [BETA] SSL/TLS 连接的安全级别。如 `DEFAULT@SECLEVEL=1`
| SSL_VERIFY | 启用或禁用 SSL 证书校验的标志
| SSL_CERT_FILE | 自定义 CA 证书包的 SSL 证书文件路径
| SUPABASE_KEY | Supabase 服务的 API 密钥
| SUPABASE_URL | Supabase 实例的基础 URL
| STORE_MODEL_IN_DB | 为 true 时，启用在数据库中存储模型与凭据信息。 
| STORE_PROMPTS_IN_SPEND_LOGS | 将每次调用的请求和响应负载持久化到其 SpendLogs 行的标志，使提示词和补全在日志界面可见。是 `general_settings.store_prompts_in_spend_logs` 的环境变量等价物；任一来源启用即可。**默认值为 False**
| SYSTEM_MESSAGE_TOKEN_COUNT | 系统消息的 Token 数。默认 4
| TEST_EMAIL_ADDRESS | 用于测试的邮箱地址
| TOGETHER_AI_4_B | Together AI 4B 模型的尺寸参数。默认 4
| TOGETHER_AI_8_B | Together AI 8B 模型的尺寸参数。默认 8
| TOGETHER_AI_21_B | Together AI 21B 模型的尺寸参数。默认 21
| TOGETHER_AI_41_B | Together AI 41B 模型的尺寸参数。默认 41
| TOGETHER_AI_80_B | Together AI 80B 模型的尺寸参数。默认 80
| TOGETHER_AI_110_B | Together AI 110B 模型的尺寸参数。默认 110
| TOGETHER_AI_EMBEDDING_150_M | Together AI 150M 嵌入模型的尺寸参数。默认 150
| TOGETHER_AI_EMBEDDING_350_M | Together AI 350M 嵌入模型的尺寸参数。默认 350
| TOKEN_COUNTER_MAX_CONCURRENT_COUNTS | 每个工作进程同时运行的本地 Token 计数上限，超出后其余排队。默认 4
| TOKEN_COUNTER_MAX_EXACT_CHARS | 每个字符串超过该字符数时，本地 Token 计数器会对 16 个均匀分布的样本（合计等于该字符数）分词，并按字符串长度缩放计数结果。默认 4000000
| TOOL_CHOICE_OBJECT_TOKEN_COUNT | 工具选择对象的 Token 数。默认 4
| TOOL_POLICY_CACHE_TTL_SECONDS | 缓存工具策略防护栏结果的 TTL（秒）。默认 60
| UI_LOGO_PATH | UI 中使用的徽标图像路径
| UI_LOGO_PATH_DARK | 深色模式下 UI 使用的徽标图像路径。未设置时回退到 UI_LOGO_PATH
| UI_PASSWORD | 内置管理界面登录的密码。未设置时接受主密钥作为密码。这是仅供引导使用的共享明文管理员凭据；请创建按用户的管理员账号，并设置 `general_settings.disable_env_credential_login: true` 关闭该登录路径。[禁用环境凭据登录](./ui#5-创建自己的管理员账号并停用环境变量凭据登录)
| UI_USERNAME | 内置管理界面登录的用户名。默认 `admin`。启用 `disable_env_credential_login` 时被忽略
| UPSTREAM_LANGFUSE_DEBUG | 已废弃且被忽略：`langfuse` 回调迁移到 Langfuse SDK v4 时已移除上游 Langfuse 转发。设置 `UPSTREAM_LANGFUSE_SECRET_KEY` 会记录启动警告
| UPSTREAM_LANGFUSE_HOST | 已废弃且被忽略：`langfuse` 回调迁移到 Langfuse SDK v4 时已移除上游 Langfuse 转发。设置 `UPSTREAM_LANGFUSE_SECRET_KEY` 会记录启动警告
| UPSTREAM_LANGFUSE_PUBLIC_KEY | 已废弃且被忽略：`langfuse` 回调迁移到 Langfuse SDK v4 时已移除上游 Langfuse 转发。设置 `UPSTREAM_LANGFUSE_SECRET_KEY` 会记录启动警告
| UPSTREAM_LANGFUSE_RELEASE | 已废弃且被忽略：`langfuse` 回调迁移到 Langfuse SDK v4 时已移除上游 Langfuse 转发。设置 `UPSTREAM_LANGFUSE_SECRET_KEY` 会记录启动警告
| UPSTREAM_LANGFUSE_SECRET_KEY | 已废弃且被忽略：`langfuse` 回调迁移到 Langfuse SDK v4 时已移除上游 Langfuse 转发。设置 `UPSTREAM_LANGFUSE_SECRET_KEY` 会记录启动警告
| USAGE_TOP_API_KEYS_LIMIT | 管理用量聚合活动响应中列出的 API 密钥（按花费排名）数量上限。总量与模型、提供商、MCP 和端点的分项始终覆盖所有密钥。**默认值为 100**
| USE_AWS_KMS | 启用 AWS Key Management Service 加密的标志
| USE_DDPROFILER | 代理启动时启动 Datadog 持续剖析器的标志。与 `USE_DDTRACE` 相互独立。**默认值为 False**
| USE_DDTRACE | 启用 Datadog 追踪的标志。在代理启动时运行 `ddtrace.patch_all()`，并把 LiteLLM 内部的空操作 tracer 换成真正的 ddtrace tracer，因此 LiteLLM 自己的 span 也会发出。**默认值为 False**
| USE_LITELLM_PROXY | 默认让每次 `litellm` SDK 补全调用都经 LiteLLM 代理路由的标志，使模型名可以保持原有提供商格式（如 `gemini/gemini-3.5-flash`）。是 `litellm.use_litellm_proxy = True` 的环境变量等价物。**默认值为 False**
| USE_V2_MIGRATION_RESOLVER | 选择启动时由哪个解析器应用数据库迁移的标志。v2 解析器跳过了在滚动部署中两个 LiteLLM 版本对同一数据库跑迁移时引发模式反复抖动的 diff-and-force 恢复。设为 `false` 回退到旧版 v1 解析器。**默认值为 True**
| USE_PRISMA_MIGRATE | 已在 [PR #13555](https://github.com/BerriAI/litellm/pull/13555) 中移除；`prisma migrate deploy` 现为默认。设置无效，可安全删除。
| VANTAGE_API_KEY | Vantage 成本导入集成的 API 密钥
| VANTAGE_BASE_URL | Vantage API 的基础 URL。默认为 `https://api.vantage.sh`
| VANTAGE_EXPORT_FREQUENCY | Vantage 的导出频率：`hourly`（默认）、`daily` 或 `interval`
| VANTAGE_EXPORT_INTERVAL_SECONDS | `VANTAGE_EXPORT_FREQUENCY` 为 `interval` 时的间隔秒数
| VANTAGE_INTEGRATION_TOKEN | 成本导入端点使用的 Vantage 集成令牌
| WANDB_API_KEY | Weights & Biases (W&B) 日志集成的 API 密钥
| WANDB_HOST | Weights & Biases (W&B) 服务的主机 URL
| WANDB_PROJECT_ID | Weights & Biases (W&B) 日志集成的项目 ID
| WEBHOOK_URL | 接收外部服务 webhook 的 URL
| SPEND_LOG_RUN_LOOPS | 设定 spend_log_cleanup 任务应运行多少轮 1000 条批量删除的常量
| SPEND_LOG_CLEANUP_BATCH_SIZE | 清理期间每批删除的日志数。默认 1000
| SPEND_LOG_PARTITION_INTERVAL | 表分区时 LiteLLM_SpendLogs 分区的粒度：day、week 或 month。默认 day
| SPEND_LOG_PARTITION_PRECREATE_AHEAD | 每次清理运行预创建的未来花费日志分区数。默认 7
| SPEND_LOG_QUEUE_POLL_INTERVAL | 花费日志队列的轮询间隔（秒）。默认 2.0
| SPEND_LOG_QUEUE_SIZE_THRESHOLD | 花费日志队列开始处理前的大小阈值。默认 100
| SPEND_LOG_WRITE_BATCH_MAX_BYTES | 发往数据库的单条花费日志写入语句的最大序列化负载（字节）。同样限定每条 `LiteLLM_SpendLogToolIndex` 和 `LiteLLM_SpendLogGuardrailIndex` 写入语句，它们会为每个请求的每个工具或防护栏展开成一行。限定 Prisma 查询引擎的常驻内存，而后者的高水位由其执行的最大语句决定。pod 存储提示词和响应且需要更紧的内存下限时调低。默认 2000000
| SPEND_LOG_WRITE_BATCH_MAX_ROWS | 单条花费日志、工具索引或防护栏索引写入语句的最大行数，与 `SPEND_LOG_WRITE_BATCH_MAX_BYTES` 一并生效，哪个预算先到就由哪个拆分语句。查询引擎按行也按字节消耗内存，因此在 `store_prompts_in_spend_logs` 关闭、行较小时起作用的是这项预算。调高以用内存换更少的往返。默认 100
| SPEND_ROLLUP_LOCK_TIMEOUT_MS | 每日花费汇总事务（`LiteLLM_DailyUserSpend`、`LiteLLM_DailyToolSpend`、`LiteLLM_DailyModelUsage`、按实体的花费增量）等待另一 pod 正在更新的行的最长时间（毫秒），超过后 Postgres 取消该语句（`lock_timeout`，SQLSTATE 55P03）。被取消的语句从未生效，因此写入方会把其行重新排队到下次刷新，并释放池化连接而不是一直被持有者占住。多个实例共享少数热点汇总行且 pod 报告 `too many clients already` 时调低；刷新日志显示健康数据库上出现锁超时时调高。默认 5000
| SPEND_LOG_QUEUE_MAX_BYTES | 等待写入内存中的花费日志的内存预算（字节）。数据库不可达时，失败的批次会重新入队而不是丢弃，因此中断持续多久队列就增长多久；超过该预算后丢弃最旧的日志并记录错误。要在更长中断中保留更多花费就调高；内存受限的 pod（尤其在花费日志中存储提示词和响应时）调低。默认 64000000
| SPEND_LOG_CLEANUP_MAX_CONSECUTIVE_BATCH_FAILURES | 花费日志清理运行在中止前容忍的连续批次失败次数。默认 3
| SPEND_LOG_CLEANUP_BATCH_FAILURE_BACKOFF_SECONDS | 失败的花费日志清理批次之间的退避秒数。默认 0.5
| SPEND_LOG_CLEANUP_RUN_BUDGET_SECONDS | 整个花费日志清理运行的墙钟时间预算（秒），由其清理的所有表共享。预算用尽时运行停止，并在下一个周期从同一截断点继续。它为 `general_settings.maximum_spend_logs_cleanup_run_budget` 设定默认值，后者设置时覆盖它。默认 300
| SPEND_LOG_CLEANUP_BATCH_TIMEOUT_SECONDS | 花费日志清理运行发出的每条语句适用的 Postgres `statement_timeout` 和 `lock_timeout`（秒），确保没有任何单条语句在用户流量排队时占着锁。它为 `general_settings.maximum_spend_logs_cleanup_batch_timeout` 设定默认值，后者设置时覆盖它。默认 30
| SPEND_LOG_CLEANUP_REMAINING_COUNT_CAP | 统计仍有多少过期行在等待的探测的行数上限，确保报告积压本身不会变成对大表的全表扫描。计数在该值处饱和。默认 100000
| SPEND_COUNTER_RESEED_LOCKS_MAX_SIZE | 执行路径上用于合并并发花费计数器数据库重播种的每计数器 LRU 锁字典的最大容量。默认 10000。
| COROUTINE_CHECKER_MAX_SIZE_IN_MEMORY | CoroutineChecker 内存缓存的最大容量。默认 1000
| DEFAULT_SHARED_HEALTH_CHECK_TTL | 共享健康检查模式下缓存健康检查结果的存活时间（秒）。默认 300（5 分钟）
| DEFAULT_SHARED_HEALTH_CHECK_LOCK_TTL | 共享健康检查模式下健康检查锁的存活时间（秒）。默认 60（1 分钟）
| ZSCALER_AI_GUARD_API_KEY | Zscaler AI Guard 服务的 API 密钥
| ZSCALER_AI_GUARD_POLICY_ID | Zscaler AI Guard 防护栏的策略 ID
| ZSCALER_AI_GUARD_URL | Zscaler AI Guard API 的基础 URL。默认为 https://api.us1.zseclipse.net/v1/detection/execute-policy
