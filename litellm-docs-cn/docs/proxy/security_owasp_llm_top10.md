# OWASP LLM Top 10（2026）对照

本页将 [OWASP Top 10 for LLM Applications 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/) 的每一项映射到 LiteLLM 网关中应对它的控制措施，说明每项控制如何开启，以及各自的能力边界在哪里。它写给需要填写安全问卷的安全评审人员，也写给要决定启用哪些控制的平台团队。文中每一条结论都对照 2026 年 9 月的版本 `1.104.0`、LiteLLM `main` 分支核实过；最后一节说明如何对照你实际运行的版本重新核验。

LiteLLM 位于你的调用方与模型提供商之间，因此它的控制覆盖网关能看到的部分：请求、响应、经它中转的工具与 MCP（Model Context Protocol）服务器、由它管理的文件与向量存储，以及它自身的配置、容器镜像和依赖。提供商的模型内部做了什么、你的应用在网关返回响应之后如何处置它，都超出了网关的掌控范围。因此下文每一项都会保留一块留在应用或提供商侧的责任，各节会明确指出这块内容。

每节分三部分：内置了哪些控制、如何开启、已知的局限。绝大多数控制在配置之前都处于关闭状态，文中引用的默认值均为上述版本中的代码默认值。表格是速览版。

| 条目 | 主要网关控制 | 默认状态 |
|------|----------------------|---------------|
| [LLM01 提示注入](#llm01-提示注入) | 输入、工具与 MCP 防护栏（guardrails） | 关闭 |
| [LLM02 敏感信息泄露](#llm02-敏感信息泄露) | PII（个人身份信息）掩码、密钥检测、日志脱敏、静态加密 | 关闭，密钥哈希除外 |
| [LLM03 过度代理](#llm03-过度代理) | MCP、A2A（Agent-to-Agent）与工具权限、路由允许列表 | 默认开放，授权后收紧 |
| [LLM04 供应链](#llm04-供应链) | 镜像签名、锁文件冻结、CI 扫描、客户端 `api_base` 拦截 | 开启 |
| [LLM05 数据与模型投毒](#llm05-数据与模型投毒) | 上传限制、批处理防护栏、仅管理员可写 | 部分开启 |
| [LLM06 无限制消耗](#llm06-无限制消耗) | 预算、速率限制、准入控制、大小上限 | 关闭 |
| [LLM07 错误信息](#llm07-错误信息) | 依据校验、judge 防护栏、弃用警告 | 关闭 |
| [LLM08 隐藏上下文泄露](#llm08-隐藏上下文泄露) | 日志脱敏、服务端提示词、泄露模式检测 | 关闭 |
| [LLM09 向量与嵌入弱点](#llm09-向量与嵌入弱点) | 存储访问控制、摄入检查 | 部分开启 |
| [LLM10 输出处理不当](#llm10-输出处理不当) | 输出防护栏、流式缓冲、工具权限 | 关闭 |

## LLM01 提示注入

2026 年的条目覆盖直接注入与间接注入，包括藏在图片和音频里的恶意负载，以及借工具结果与 MCP 服务器夹带进来的指令。

**内置控制**。[防护栏框架](./guardrails/quick_start)可以在调用提供商之前（`pre_call`）、与其同步（`during_call`）或在响应上（`post_call`）运行防护栏。一份防护栏定义即可覆盖对话、文本补全、Responses API、Anthropic Messages、Google GenAI、嵌入、图像生成、语音、转写、视频、重排序、OCR、Bedrock 透传、A2A 与 MCP 等路由，因为框架会把上述每种请求形态都转换成防护栏扫描的文本。[防护栏 hooks 目录](https://github.com/BerriAI/litellm/tree/main/litellm/proxy/guardrails/guardrail_hooks)内置了五十多个防护栏集成：从 [LiteLLM Content Filter](./guardrails/litellm_content_filter) 及其[预置模式](./guardrails/litellm_content_filter#可用模式)（包括 `prompt_injection_jailbreak`、`prompt_injection_system_prompt`、`prompt_injection_data_exfiltration`、`prompt_injection_malicious_code` 和 `prompt_injection_sql`），到 Lakera、Prompt Security、Azure、Bedrock 等托管检测服务。较早期的[提示注入检测回调](./guardrails/prompt_injection)则提供启发式规则加一次 LLM 检查。除非设置[跳过标志](./guardrails/quick_start#在防护栏评估中跳过-system-消息)，系统与工具消息会和用户轮次一起被扫描。在 MCP 侧，[MCP 防护栏](../mcp_guardrail)拦截每一次工具调用，[工具过滤](../mcp_control#允许禁止-mcp-工具)限制密钥能触达哪些工具，[工具权限防护栏](./guardrails/tool_permission)与[工具策略](./tool_policies)决定模型可以发起哪些函数调用。语音方面，[Realtime 防护栏](./guardrails/realtime_guardrails)扫描 Realtime 会话的输入转写文本。图像方面，Content Filter 可以[先用视觉模型描述图片，再对描述内容做过滤](./guardrails/litellm_content_filter#图片内容过滤)。

**如何开启**。在 `config.yaml` 的 `guardrails:` 下添加防护栏并设为 `mode: pre_call`（更看重延迟而非拦截时用 `during_call`），然后要么设 `default_on: true` 让它作用于每个请求，要么把它挂到特定的密钥、团队或请求上。没有定义防护栏时什么都不会被扫描；`default_on` 默认为 false。

**已知局限**。防护栏本质上是分类器，精心构造的注入可以绕过其中任何一个。应当把它们当作一层防线，与 LLM03 的控制配合使用，让成功的注入也难有可乘之机。内置检测回调只在补全、文本补全、嵌入、图像生成、内容审核和语音转写调用上运行，`/v1/messages` 与 `/v1/responses` 流量不会经过它；这两类路由请使用 `mode: pre_call` 的防护栏。该回调遇到非 HTTP 错误时会直接放行（fail open），把被拒绝的输入以 INFO 级别写入日志，且其向量相似度选项并未实现，实际只有启发式规则和 LLM 检查两种手段。跨模态负载只有配置了关注它的防护栏才会被扫描：Content Filter 的图像描述路径需要手动开启，且每个请求多一次视觉模型调用的开销；聊天请求中的音频与文件部分、MCP 调用中的图片部分会原样发给提供商不做扫描；Azure Prompt Shield 集成发送消息时不附带文档。上游 MCP 服务器返回的工具描述不会被扫描或固定，服务器可以在你批准之后更改某个工具宣称的功能（[PR #43283](https://github.com/BerriAI/litellm/pull/43283) 正在评审）。只有 [Content Filter](./guardrails/realtime_guardrails#支持的防护栏模式) 支持 Realtime 输入转写模式。

## LLM02 敏感信息泄露

该条目关注 PII、凭据与专有数据经提示词、响应、日志和缓存外泄的问题。

**内置控制**。[基于 Presidio 的 PII 掩码](./guardrails/pii_masking_v2)对请求中的实体做掩码或拦截，另有[仅记录日志](./guardrails/pii_masking_v2#仅在日志中掩码logging-only)模式：提供商看到的仍是原文，到达你日志回调的内容则被掩码。[密钥检测](./guardrails/secret_detection)在提供商看到之前剥离请求中的 API 密钥与令牌。日志有三个脱敏开关：`turn_off_message_logging`（[对消息与响应内容脱敏](./logging#脱敏消息与响应内容)）、`redact_user_api_key_info`（[对 UserAPIKeyInfo 脱敏](./logging#脱敏-userapikeyinfo)）和 `redact_messages_in_exceptions`（[从告警中脱敏消息](./alerting#在告警中脱敏消息内容)）。除非设置 `store_prompts_in_spend_logs`，花费日志不保存任何提示词或响应文本（[配置项](./config_settings)）。虚拟密钥（virtual key）以 SHA-256 哈希存储（[虚拟密钥](./virtual_keys)），`/model/info` 会遮蔽提供商凭据（[模型管理](./model_management)），`LITELLM_SALT_KEY` 则对数据库中模型的 `litellm_params`、保存的环境变量和 MCP 凭据加密（[静态数据加密](./security_encryption_faq#静态数据加密)）。返回给客户端的错误会经过内部细节清洗，去除密钥、系统路径、内网 IP 和堆栈信息；请求校验错误（`422`）的响应中不会包含提交的请求体（[错误响应与响应头](./security_best_practices#7-避免通过错误响应和响应头泄露内部信息)）。

**如何开启**。密钥哈希、凭据遮蔽和错误清洗始终开启，其余都要手动启用：定义 PII 与密钥防护栏，在 `litellm_settings` 下设置那三个脱敏标志，保持 `store_prompts_in_spend_logs` 不设置，并在第一个模型入库前设好 `LITELLM_SALT_KEY`。

**已知局限**。密钥检测是企业版功能，且只扫描请求方向，提供商把密钥回显时响应侧不会脱敏。三个脱敏标志默认全部关闭，此时每个日志回调都会收到完整的提示词和响应。静态加密覆盖模型的 `litellm_params`、环境变量和 MCP 凭据；防护栏的 `litellm_params`（其中可能存放提供商 API 密钥）、非字符串值，以及 `router_settings`、`general_settings`、`litellm_settings` 三段配置仍以明文保存（[PR #43255](https://github.com/BerriAI/litellm/pull/43255) 正在评审以扩大覆盖范围）。精确匹配的响应缓存只以请求内容作键，两个密钥或团队发出完全相同的请求会命中同一条缓存，除非在配置里设 `cache.namespace` 或在请求上设 `metadata.redis_namespace`；只有语义缓存按租户隔离（[缓存](./caching)）。

## LLM03 过度代理

随着智能体（agent）部署普及，该条目在 2026 年上升三位：指智能体拥有超出任务所需的能力、权限或自主性。

**内置控制**。MCP 访问遵循组织、团队、密钥三层[权限层级](../mcp_control#权限层级)，`require_key_mcp_access_defined` 会拒绝没有定义 MCP 列表的密钥，另有 `no-mcp-servers` 显式退出项。在服务器层级之下，[工具允许与拒绝列表](../mcp_control#允许禁止-mcp-工具)、[按实体的工具权限](../mcp_control#per-entity-tool-level-permissions)和[工具集](../mcp_toolsets)进一步收窄密钥或团队可调用的工具；[授权](../mcp_grant_access)把服务器挂到密钥和团队上；[客户端允许列表](../mcp_client_allowlist)限制哪些 MCP 客户端应用可以连接；[零信任 MCP](../mcp_zero_trust) 用调用者身份签署 JWT，让 MCP 服务器执行自己的策略。对于模型请求你的应用执行的函数工具，[工具权限防护栏](./guardrails/tool_permission)与[工具策略](./tool_policies)按工具名与参数决定放行或拒绝。针对智能体间流量，[A2A 代理权限](../a2a_agent_permissions)、[A2A 熔断开关](../a2a_kill_switch)和 [A2A 迭代预算](../a2a_iteration_budgets)（`max_iterations` 与 `max_budget_per_session`）约束智能体能做什么、能做多久。密钥的 `models` 和 `allowed_routes`（[虚拟密钥](./virtual_keys)）从源头限定它能触达哪些模型、哪些代理路由。

**如何开启**。在密钥、团队或组织上设置 `mcp_servers` 或访问组，并设 `require_key_mcp_access_defined: true` 关掉默认放行。通过管理 API 或管理界面（Admin UI）创建工具策略。在密钥或团队上配置 `agent_permissions`，并在每次调用中带上 `metadata.session_id`，迭代预算才能统计。

**已知局限**。在某一层级定义出列表之前，MCP 与 A2A 的访问都是开放的：密钥自身、其团队、其组织都没有 MCP 列表时，它能触达所有服务器，A2A 代理同理。数据库不可达导致权限查询失败时，MCP 退回到全局列表加上密钥自己提交的服务器，A2A 则返回不受限的访问。每次工具调用没有服务端审批环节；Responses API MCP 工具上的 `require_approval` 由客户端负责执行，人在环（human-in-the-loop）的步骤必须放在你的智能体里。工具策略只看得到经过网关的工具调用，你的应用自行执行的工具对它不可见。YAML 中定义的透传端点默认无需认证，除非其条目设置 `auth: true`（[PR #43250](https://github.com/BerriAI/litellm/pull/43250) 正在评审，计划对省略该字段的条目应用策略检查）。

## LLM04 供应链

2026 年的条目在传统的依赖、镜像与插件风险之外，新增一项要求：核验模型工件与其宣称的身份相符。

**内置控制**。每个发布镜像都用 cosign 签名，基于按 digest 固定的 Chainguard Wolfi 基础镜像构建，并提供非 root 变体（见 [Docker 镜像安全](./docker_image_security)，其中给出[按 digest 固定版本](./docker_image_security#按-digest-固定)的做法）。Python 依赖从 `uv.lock` 冻结安装，解析器拒绝发布未满三天的包版本，刚被投毒的发行版进不了构建。CI 中，[Grype](https://github.com/BerriAI/litellm/blob/main/.github/workflows/image-scan.yml) 扫描每个 Dockerfile 构建出的镜像，[OSV](https://github.com/BerriAI/litellm/blob/main/.github/workflows/osv-scan.yml) 在每夜构建与拉取请求时扫描锁文件，所有第三方 GitHub Action 都固定到 commit SHA，[zizmor](https://github.com/BerriAI/litellm/blob/main/.github/workflows/zizmor.yml) 对工作流做静态检查，[OpenSSF Scorecard](https://github.com/BerriAI/litellm/blob/main/.github/workflows/scorecard.yml) 每周运行一次。运行时，携带 `api_base`、`base_url` 等类似字段的请求体会被拒绝，调用方无法把网关指向别的上游（[客户端认证](./clientside_auth#传入用户-llm-api-密钥与-api-地址)）；[模型访问组](./model_access_groups)以命名模型组授权，而不是裸模型名；团队提交的 MCP 服务器在代理管理员批准前保持停用，stdio 服务器的命令限定在允许列表内（`npx`、`uvx`、`python`、`python3`、`node`、`docker`、`deno`，外加 `LITELLM_MCP_STDIO_EXTRA_COMMANDS`）（[MCP 服务器提交](../mcp_server_submissions)）。

**如何开启**。镜像、锁文件、CI、`api_base` 拦截和 stdio 允许列表无需任何设置即已生效。签名核验按镜像安全页的步骤操作，并在你的部署中按 digest 固定版本。访问组需要在部署上配置 `model_info.access_groups`，并在密钥或团队上写明组名。

**已知局限**。镜像发布流程不在公开仓库中，你可以用公钥验证签名，但镜像不附带 SBOM 或来源证明（provenance attestation）。默认镜像以 root 运行，请改用 `-non_root` 变体。扫描跳过来自 fork 的拉取请求，改在合并时与每夜执行；CI 任务没有出口流量封锁；`CODEOWNERS` 覆盖 UI、成本映射和迁移文件，但不包括工作流、`pyproject.toml`、`uv.lock` 和 Dockerfile。模型成本映射（model cost map）在启动时通过 HTTPS 从 GitHub `main` 分支下载，没有签名；完整性检查只有最低模型数量和缩减比例两项，失败时回退到内置副本。可设 `LITELLM_LOCAL_MODEL_COST_MAP=True` 改用内置副本（[禁用拉取在线模型价格](./server_tuning#停用在线拉取模型价格)），或[自行提供成本映射](./custom_model_cost_map#方式二托管你自己的成本表)。启动时从 S3 或 GCS 加载的配置文件或自定义回调模块（[从 S3 或 GCS 加载配置](./server_tuning#从-s3-或-gcs-加载-configyaml)）写入磁盘时没有校验和，拿到存储桶写权限就等于拿到配置写权限。[自定义代码防护栏](./guardrails/custom_code_guardrail)在 RestrictedPython 中运行管理员提供的 Python，没有 CPU 或真实时长限制，其 `http_request` 原语可以访问内网地址（[PR #43280](https://github.com/BerriAI/litellm/pull/43280) 正在评审，针对这两点）。LiteLLM 从不下载或运行模型权重，只调用托管或自托管的模型 API，因此核验模型工件与宣称身份相符的责任落在实际提供模型服务的一方。

## LLM05 数据与模型投毒

2026 年的条目从训练数据扩展到 RAG 知识库、智能体记忆和微调后门。

**内置控制**。`/v1/files` 的上传支持 `max_file_size_mb`、`max_batch_file_size_mb` 和 `allowed_file_extensions`（[限制文件上传](./security_best_practices#10-限制文件上传)），且每个上传都会拒绝包含路径穿越或 NUL 字节的文件名。[批处理防护栏](./guardrails/batch_guardrails)在 `purpose=batch` 的 JSONL 文件送达提供商之前，对其每条记录运行你的 pre-call 防护栏。发往 [`/v1/rag/ingest`](../rag_ingest) 的内联上传按魔数（magic bytes）判定类型，上限 512 MiB，归档与可执行文件会被拒绝。托管提示词只能由代理管理员创建、修改或删除（[提示词管理](./prompt_management)），不带团队的模型也只能由代理管理员注册（[模型管理](./model_management)）。微调任务是企业版功能，当训练与验证文件 id 由 LiteLLM 托管时，会校验这些 id 是否归调用密钥所有（[微调](../fine_tuning)）。

**如何开启**。文件名检查、RAG 摄入检查和仅管理员可写始终开启。`/v1/files` 的限制在 `general_settings` 下设置。批处理防护栏只要密钥、团队或请求上有 pre-call 防护栏即可，无需其他配置。

**已知局限**。`/v1/files` 的大小与扩展名限制默认全部未设置。RAG 摄入的恶意软件扫描器只是占位实现，只识别 EICAR 测试串，没有接入真实引擎的配置入口；通过 `file_url` 或 `file_id` 引用的上传，以及经 `/v1/vector_stores/{id}/files` 挂到向量存储的上传，都会跳过摄入检查（[PR #43244](https://github.com/BerriAI/litellm/pull/43244) 正在评审，将提供可配置的扫描器与所有向量存储上传路由的上传控制）。微调文件不会被扫描，企业版门槛通过后任何密钥都能发起任务。企业版下，团队管理员可以注册团队范围的模型并自定义其 `api_base` 与定价。批处理防护栏只运行 pre-call 防护栏，不支持 post-call 或部署级防护栏（[限制](./guardrails/batch_guardrails#限制)）。提供商训练数据、第三方模型内部、或在网关之外自行填充的知识库里发生的投毒，网关看不到。

## LLM06 无限制消耗

该条目在 2026 年上升四位，并明确点名了“掏空钱包”（denial of wallet）这类风险。

**内置控制**。预算覆盖每一层：整个代理、组织、团队、团队成员、内部用户、虚拟密钥、终端用户、标签和模型访问组（[设置预算](./users#设置预算)、[团队预算](./team_budgets)、[标签预算](./tag_budgets)、[访问组预算](./model_access_group_budgets)）。每分钟请求数、每分钟 Token 数和并行请求限制可按密钥、团队、用户、模型和标签设置，计数器通过 Redis 在多实例间共享（[设置速率限制](./users#设置速率限制)、[多实例限流](./users#多实例速率限制)）。计数器无法确认时，`fail_closed_budget_enforcement`（[硬性预算强制](./users#硬性预算强制执行fail-closed)）与 `fail_closed_rate_limit_enforcement`（[硬性限流强制](./users#硬性速率限制强制执行fail-closed)）会直接返回 `503` 拒绝，而不是放行。[按 worker 准入控制](./server_tuning#单-worker-准入控制)用有界队列限制进行中的请求数；`max_request_size_mb` 与 `max_response_size_mb` 限制请求体大小；[密钥参数上限](./virtual_keys#keygenerate-参数上限)约束 `/key/generate` 能申请到的值；透传路由默认 600 秒超时（[请求超时](./pass_through#请求超时)）；`litellm_settings.block_requests_for_models_without_pricing: true` 会以 `403`、类型 `model_cost_map_missing` 拒绝成本映射无法计价的模型，杜绝不计量的花费。

**如何开启**。在密钥、团队或用户上设置 `max_budget` 及 `rpm_limit`、`tpm_limit`、`max_parallel_requests` 字段；在 `general_settings` 下设置两个 fail-closed 标志、`max_in_flight_requests_per_worker` 和大小上限；在 `litellm_settings` 下设置 `upperbound_key_generate_params`。

**已知局限**。上述限制默认全部未设置，透传超时是唯一默认生效的。代理管理员密钥在预算与限流检查之前就通过了认证，因此两者对它都不生效。团队范围的密钥不计入个人用户预算，除非设置 `general_settings.apply_user_budget_to_team_keys: true`。预算只在 LLM API 路由上检查，管理类和辅助类路由不在其列。全局 `max_budget` 依赖数据库，没有数据库时不会强制执行。fail-closed 标志关闭时，Redis 故障会退化为单实例计数；开启 `fail_closed_budget_enforcement` 后，标签预算仍会放行，因为其计数器只存在于 Redis；访问组预算只是普通读取，没有预留机制。请求体大小上限是企业版专属，其他版本只记日志并跳过。`max_tokens` 没有按密钥的上限，输出量靠每分钟 Token 数和预算约束，而非单请求限制。

## LLM07 错误信息

基于事故数据，该条目在 2026 年上升两位，新强调的是那些会驱动工具调用或决策的错误回答。

**内置控制**。有三个防护栏可将响应与原始材料比对：使用 `contextual_grounding_from_messages` 的 [Bedrock Guardrails 上下文依据校验](./guardrails/bedrock#上下文接地contextual-grounding)、[Qualifire 幻觉与依据校验](./guardrails/qualifire#可用检查项)，以及 [XecGuard 上下文依据校验](./guardrails/xecguard#上下文一致性校验rag)，后者从 `metadata.xecguard_grounding_documents` 读取文档。[LLM-as-a-judge 防护栏](./guardrails/llm_as_a_judge)让另一个模型按你自定的评分标准给响应打分，低于 `overall_threshold`（默认 80）即拦截。对即将退役的模型，`GET /model/deprecations` 会列出提供商弃用日期落在 `warn_within_days`（默认 30 天）内的部署，配置好告警后 Slack 的 `model_deprecation_warnings` 告警也会触发。

**如何开启**。以 `mode: post_call` 定义依据校验或 judge 防护栏，挂到需要的密钥或团队上，并按提供商要求的位置传入原始文档。弃用警告只需配好告警即可。

**已知局限**。这里的每项检查都要手动开启，会给请求增加一次提供商或模型调用，且结果都是概率性的。依据校验需要请求或元数据中带原始文档，在 LiteLLM 之外完成检索的 RAG 流程必须自行传入。没有原始文档时，任何事实性断言都无法核验；错误答案一旦变成工具调用，接受的只是工具策略（LLM03）的审查，而非真伪检验。网关无法单凭自己分辨一个答案是过度自信还是确实正确。

## LLM08 隐藏上下文泄露

2026 年由 System Prompt Leakage 更名而来，范围扩大到开发者指令、RAG 策略文本、用户画像和工具 schema，官方建议按“全部都可能被泄露”来设防。

**内置控制**。托管提示词把开发者消息保存在服务端，调用方只需发送 `prompt_id` 和变量而不用传提示词本身（[提示词管理](./litellm_prompt_management)），且只有代理管理员能写入。[Content Filter](./guardrails/litellm_content_filter) 的 `prompt_injection_system_prompt` 模式拦截索要系统提示词的请求，Bedrock 的 [`PROMPT_LEAKAGE` 检查](./guardrails/bedrock#无需创建资源的检查invokeguardrailchecks)通过 Bedrock 达到同样效果。LLM02 的那些脱敏开关让提示词不进日志、告警和花费日志，[仅记录日志的 PII 掩码](./guardrails/pii_masking_v2#仅在日志中掩码logging-only)对日志回调收到的内容做掩码。客户端请求头默认不转发给提供商，除非配置了[转发客户端请求头](./forward_client_headers)；内部的 `_hidden_params` 会从响应中剔除；错误消息同样经过 LLM02 所述的内部细节清洗。

**如何开启**。先把密钥和策略文本从提示词里挪走，本页没有任何手段能让提示词对接收它的模型不可读。然后以 `mode: pre_call` 定义 Content Filter 或 Bedrock 防护栏，并在 `litellm_settings` 下设置脱敏标志。

**已知局限**。模型可能被诱导复述其上下文，网关的检查只能按模式拦下直白的索要；Bedrock 检查只作用于请求侧。脱敏默认关闭，且 Responses API 的 `instructions` 和 `tools` 字段不在消息脱敏范围内，即使设了 `turn_off_message_logging`，它们也会原样到达回调。提示词列表与详情端点会遵守密钥元数据中的 `prompts` 允许列表，但请求时解析 `prompt_id` 没有访问检查，任何能调用模型的密钥都可以使用它已知的任意 prompt id。`x-litellm-model-api-base` 响应头总会标明上游主机（查询串已去除），客户端可见的错误信息中 `API Base:` 一行也可能出现提供商的公开主机名。任何已认证的密钥都能通过 v1 的 `/guardrails/list` 路由列出已配置防护栏的名称和掩码后的参数。

## LLM09 向量与嵌入弱点

该条目关注被投毒的分块、存储上薄弱的访问控制，以及嵌入反演（embedding inversion）。

**内置控制**。通过 `object_permission.vector_stores` 可以把密钥和团队[限制到特定向量存储](../vector_stores/managed_vector_stores#将密钥与团队限定到特定存储)，存储可以圈定给某个团队，`disable_vector_stores_for_internal_users` 则把内部用户完全挡在外面。LLM05 所述的摄入检查适用于内联上传。向量存储页面描述了[检索到的上下文经过你的 pre-call 防护栏](../vector_stores/managed_vector_stores#检索到的上下文会经过调用前防护栏)的机制，这本应是在模型看到投毒分块之前拦下它的位置。

**如何开启**。在密钥或团队上设置 `object_permission.vector_stores`，在存储上设置 `team_id`，不允许内部用户查询存储时在 `general_settings` 下设 `disable_vector_stores_for_internal_users: true`。

**已知局限**。访问控制以存储为单位，不细到文档。`vector_stores` 列表为空意味着所有存储都放行，没有 `team_id` 的存储任何能使用向量存储的密钥都能访问。在 `1.104.0` 版本上，检索到的分块是在 pre-call 防护栏已经跑完之后才加入请求的，向量存储页面描述的扫描要等 [PR #43271](https://github.com/BerriAI/litellm/pull/43271) 合入后才会发生；在此之前，`post_call` 防护栏看到的是模型对分块的使用，而不是分块本身。摄入时的恶意软件扫描器就是 LLM05 所述的占位实现。嵌入反演以及存储自身的加密与访问控制属于向量数据库的职责，网关只持有其凭据并转发查询。

## LLM10 输出处理不当

该条目在 2026 年下降了五位，但内容未变：未经校验的输出流向浏览器、数据库、shell 和 API，以及生成不安全的代码。

**内置控制**。任何 `mode: post_call` 的防护栏都会在客户端看到响应之前检查或改写它，[工具权限防护栏](./guardrails/tool_permission)则检查响应中要求的工具调用。流式场景下，`streaming_buffer_until_moderated`、`streaming_sampling_rate`、`streaming_end_of_stream_only` 和 `streaming_transform_mode` 决定流是被拦下等检查通过再放行，还是边流动边抽样检查（[流式与 post_call 防护栏](./guardrails/custom_guardrail)）；[Bedrock](./guardrails/bedrock#流式处理) 与 [Content Filter](./guardrails/litellm_content_filter#流式支持) 各自的流式行为见其文档。PII 防护栏的[输出解析](./guardrails/pii_masking_v2#输出解析)对响应中的实体做掩码。管理界面把模型输出渲染为 Markdown，不加载原始 HTML。

**如何开启**。以 `mode: post_call` 定义防护栏并挂载；如果必须在任何分块到达客户端之前完成拦截，就在其上设 `streaming_buffer_until_moderated: true`。

**已知局限**。所有输出防护栏都要手动开启。流式场景下，不做缓冲的 `post_call` 防护栏是在分块已经送达之后才检查拼装完成的响应，只能事后审计，无法拦截；默认缓冲的只有 Bedrock、Straiker 和 Rubrik，其余每五个分块抽样一次，OpenAI 内容审核防护栏也是抽样而非缓冲。PII 输出解析不覆盖 Anthropic 之外其他提供商的原始字节流，也不覆盖 `/v1/responses` 的流式事件，跳过时会记一条警告。网关不会结合你的应用将如何使用生成内容来校验代码、SQL、HTML 或 shell 命令，请在每个消费方把模型输出当作不可信输入。管理界面会自动加载模型输出中引用的远程图片（[PR #43276](https://github.com/BerriAI/litellm/pull/43276) 正在评审，拟改为点击后再加载）。

## 保持本页更新

OWASP 榜单发布在 [genai.owasp.org](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/)，本页跟踪其 2026 版。以上控制与局限均在版本 `1.104.0` 的 LiteLLM `main` 上核对；文中标注“评审中”的拉取请求一旦合入就会改变对应的局限描述，请结合你运行的版本查看其状态。如果你版本上的某个控制行为与本页描述不符，请在 [BerriAI/litellm](https://github.com/BerriAI/litellm/issues) 提 issue，附上版本号和所在小节名称。
