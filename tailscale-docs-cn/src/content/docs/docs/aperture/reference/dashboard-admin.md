---
title: "Aperture 管理仪表板参考"
description: "管理仪表板路由以 `/admin/` 开头。非管理员用户使用独立的 Chat 界面及其面向用户的页面。"
---

最后验证于 Oct 1, 2026

\[缺失片段：aperture\_open\_dashboard.mdx]

管理仪表板路由以 `/admin/` 开头。非管理员用户使用独立的 Chat 界面及其面向用户的页面。

侧边栏把管理页面归入 **Usage & Adoption**、**Security**、**Administration** 和 **Reference** 几组。选择 **Chat** 会在新的浏览器标签页中打开 Chat，选择 **Feedback** 可以提交反馈。

要搜索你可用的管理页面，请按 macOS 上的 Command+K 或其他平台上的 Ctrl+K。

功能概览和访问要求请参阅 [Aperture 管理仪表板][docs-aperture-admin-dashboard]。

## 用量与采用（Usage & Adoption）

使用这些页面审查整个组织的采用情况、token 用量、估算成本和配额余额。

### 用量总览（Usage Overview）

路由：`/admin/adoption`

**Usage Overview** 页面汇总整个组织的 token 用量、估算成本和活跃用户。内容包括：

* 活跃用户、总 token 以及输入、输出、缓存和推理 token 的汇总卡片。有成本数据时会显示估算成本。
* 一张按日图表，有成本数据时可在 token 用量和估算成本之间切换。
* 可排序、可分页的用户表格。选择用户可打开其 **User Dashboard**。
* 按 token 类型列的列选择器。
* 针对当前筛选条件的 CSV 下载。

可以按用户、模型、agent、状态码、日期范围或已索引的请求/响应 header 筛选。管理员在 **Reporting** 页面配置后，header 筛选才可用。

### 用户活动（User Activity）

路由：`/admin/adoption/user-activity`

**User Activity** 页面以图表展示活跃用户随时间的变化。使用日期筛选并选择 **Day**、**Week**、**Month** 或 **4/7 DAU**。在图表上选择一个区间即可更新日期筛选。

**4/7 DAU** 统计前 7 天中至少有 4 天活跃的用户。

### 模型活动（Model Activity）

路由：`/admin/adoption/model-activity`

**Model Activity** 页面按模型细分用量。它提供：

* 一张堆叠图，有成本数据时可在 token 和估算成本之间切换。
* 一张可排序、可分页的表格，包含输入、输出、缓存、推理和总 token 数、请求数、每百万 token 平均成本，以及（可用时的）成本。
* 按用户、模型、agent、状态码、日期范围和已配置请求/响应 header 的筛选。

### Agent 活动（Agent Activity）

路由：`/admin/adoption/agent-activity`

**Agent Activity** 页面使用与 **Model Activity** 相同的图表、表格和筛选，但按 agent 对用量分组。agent 标识提交请求的客户端或框架（harness）。

### 聊天活动（Chat Activity）

路由：`/admin/adoption/chat-activity`

**Chat Activity** 页面报告来自 Chat 界面的活动。使用其日期筛选查看：

* 助手回合随时间的变化，按模型或结果分组。
* 助手结果，包括完成、出错、取消、拒绝、截断、超出上下文和达到循环上限。
* 对话、活跃用户、消息、错误、回合、token 和成本汇总。
* 常见错误和特定模型的错误信息。
* 按用户统计的对话、消息、助手回合、错误和最近活动总数。

### 连接器活动（Connector Activity）

路由：`/admin/adoption/connector-activity`

**Connector Activity** 页面仅在网关启用连接器报告时出现。使用其日期筛选查看：

* 连接器总数以及 MCP、HTTP 和 OAuth 连接器数量。
* 已授权用户数和新增连接授权随时间的变化。
* 认证类型的分布。
* 可排序的连接器和用户表格，包括最近一次连接授权时间。

此页面报告连接器的采用和连接授权情况，不报告上游连接器的健康状况。

### 用户仪表板（User Dashboard）

路由：`/admin/dashboard` 或 `/admin/dashboard/<login-name>`

使用 **User Dashboard** 检查单个用户的用量、配额和会话：

1. 从用户选择器中选择一个登录名。
2. 用日期筛选选择报告周期。
3. 查看总请求数、各类 token 以及（可用时的）估算成本。
4. 查看该用户的配额卡片。使用 **Adjust balance** 进行 **Add funds** 或 **Set balance**。使用 **Pause refill** 或 **Resume refill** 控制自动补充。
5. 查看可排序的 **Metrics by Model** 表格。
6. 查看 **Recent Sessions**，并按模型、agent、状态码、已配置 header 或星标状态筛选。

### 配额用量（Quota Usage）

路由：`/admin/quotas`

使用 **Quota Usage** 页面检查配额桶如何应用于某个用户的模型：

1. 从用户选择器中选择一个登录名。
2. 查看配额警告、剩余余额、模型覆盖和透支（overdraft）关系。
3. 使用 **Adjust balance** 进行 **Add funds** 或 **Set balance**。使用 **Pause refill** 或 **Resume refill** 控制自动补充。

预算操作流程请参阅[查看并补充预算][docs-check-refill-budgets]、[设置单用户支出限额][docs-set-per-user-spending-limits]和[配置透支配额][docs-configure-overdraft-quotas]。

## 安全（Security）

使用这些页面检查捕获的请求、工具调用和管理活动。

### 日志（Logs）

路由：`/admin/logs`

**Logs** 页面把捕获的请求按会话分组。从侧边栏打开时默认选择 7 天的日期范围。选择一个会话列出其请求，再选择一个请求即可检查捕获的内容体、header 和工具使用。

可以按用户、模型、agent、状态码、日期范围、星标状态或已索引的请求/响应 header 筛选会话。header 筛选可以匹配 header 的存在、子串或精确值。设置说明请参阅[按请求或响应 header 筛选日志][docs-filter-logs-by-header]。

捕获的内容取决于网关的留存设置。在零捕获留存模式下，捕获不显示请求体、响应体和 header。Aperture 会在写入时脱敏，或在之后的本地清除中移除它们。除非留存策略清除了工具内容，否则工具详情仍然保留。请求元数据和用量指标仍然可用。详情请参阅[隐私与数据留存][docs-privacy-retention]。

### 工具使用（Tool Use）

路由：`/admin/tool-use`

**Tool Use** 页面以图表展示工具调用随时间的变化，并提供可排序、可分页的表格。从侧边栏打开时默认选择 7 天的日期范围。可按用户、模型、agent、工具名称、日期范围、星标状态或已配置的请求/响应 header 筛选。

### 审计日志（Audit Logs）

路由：`/admin/audits`

**Audit Logs** 页面记录管理和敏感数据访问事件，包括配置更改、配额操作，以及对捕获、指标、导出或会话数据的访问。

表格包含时间、操作者、操作、对象、资源和方法。可按这些字段筛选事件，或使用列选择器显示/隐藏列。展开事件可查看详情。配置更改会显示 diff。

## 管理（Administration）

此组中的配置编辑器编辑的是 [Aperture 配置][docs-aperture-configuration]。可视化表单在提交时保存，即时保存的开关在你切换时保存。带保存按钮的编辑器（如 **System prompt**）只有在你点击该按钮时才保存。**Configuration** 页面只有在你选择 **Save** 时才保存输入的 HuJSON。

如果 **Configuration** 编辑器中有有效但未保存的更改，可视化保存会包含这些更改。如果其中存在无效的 HuJSON，在你修正语法之前，Aperture 会阻止可视化保存。

### 模型（Models）

路由：`/admin/models`

**Models** 页面按提供商对可用模型分组。每个提供商分组会显示其配置的显示名称、描述，以及（非零时的）优先级。模型按 ID 排序，并显示受支持的模型详情。如果提供商支持测试，可使用模型的测试控件发送一个请求。

使用 **Providers** 更改底层提供商或模型列表。使用 **Chat** > **Models** 决定哪些已授权的模型出现在 Chat 中。

### 提供商（Providers）

路由：`/admin/settings/providers`

使用 **Providers** 页面添加、编辑和移除上游模型提供商。**Quick Setup** 从提供商预设开始。每个提供商定义一个 base URL、认证方式和可用模型。可选设置控制其显示名称、描述、偏好（preference）和兼容性。

各提供商的具体操作请参阅[设置提供商][docs-set-up-providers]和[提供商兼容性参考][docs-provider-compatibility]。

### 授权（Grants）

路由：`/admin/settings/grants`

**Grants** 页面控制谁可以管理 Aperture，或使用模型、连接器能力、报表 header 和配额桶。每个授权（grant）向一个来源（用户、分组或 `*`）分配一个或多个权限。

受支持的模式和访问行为请参阅[授权的工作原理][docs-how-grants-work]、[授予模型访问权限][docs-grant-model-access]、[按标签授予连接器访问权限][docs-grant-connector-access]和[授予 MCP 工具访问权限][docs-grant-mcp-tool-access]。

### 连接器（Connectors）

路由：`/admin/settings/connectors`

管理的 **Connectors** 页面定义可通过网关使用的连接器服务器。Chat 中独立的 **Connectors** 页面让用户对其授权允许的连接器进行连接授权。

使用 **Add connector** 选择经验证的提供商或配置自定义连接器。每个连接器定义协议、URL 和认证方式。可选设置包括标签、上下文（context）、可见能力和调用者身份转发。

连接器概念和操作流程请参阅 [Aperture 连接器入门][docs-connectors-get-started]。所有受支持的字段请查阅[连接器配置参考][docs-connectors-reference]。

### Hook

路由：`/admin/settings/hooks`

**Hooks** 页面配置请求 hook。

添加 hook 时，输入其 **Hook ID** 和 **URL**。可选设置包括 **API Key**、**Authorization**、**Timeout** 和 **Disabled**。hook 事件和字段请参阅 [hook 配置参考][docs-aperture-hooks]。

### 配额配置（Quota Configuration）

路由：`/admin/settings/quotas`

**Quota Configuration** 页面定义配额桶。它的侧边栏徽标显示配额桶数量，并在没有授权引用某个桶时发出警告。

每个配额有一个标识符、金额容量、补充速率与周期，以及 **On Exceed** 行为。把配额分配给一个授权即可生效。有序回退配额桶请参阅[配置透支配额][docs-configure-overdraft-quotas]。

### 数据导出（Data Export）

路由：`/admin/settings/database`

**Data Export** 页面控制捕获的存储与留存：

* **Save raw bodies** 控制 `database.save_raws`。开启此设置后，Aperture 会把 JSON 解析之前的原始 HTTP 请求和响应字节与解析后的捕获一起保存，用于调试。要访问保留的原始内容体，请使用 S3 导出。仪表板捕获视图和 **Logs** 不会显示它们。
* **Keep encrypted blobs** 保留大型加密内容块，否则 Aperture 会把它们从存储的内容体中移除。
* 留存控制让你可以永久保留捕获、保留一段设定时长，或不保留。其他控制允许你清除工具内容。配置了 S3 导出器后，你还可以要求先导出再删除。
* **S3 Export** 显示是否配置了兼容 S3 的导出及其存储桶。导出器请在 **Configuration** 页面配置。

设置方法请参阅[将用量数据导出到 S3][docs-export-s3]和[配置零留存模式][docs-zero-retention]。隐私控制请参阅[隐私与数据留存][docs-privacy-retention]。

### 报表（Reporting）

路由：`/admin/settings/reporting`

使用 **Reporting** 页面配置用于仪表板筛选的已索引请求和响应 header：

* **Stored filterable headers** 列出 Aperture 索引的 header。添加有效的 HTTP header 名称，并移除不再需要索引的 header。
* **Header filter grants** 向一个来源分配一个或多个已索引 header 或 `*`。你可以编辑或移除现有分配。管理员同样需要显式的 header 筛选授权。
* 回填（backfill）状态显示对既有捕获数据建立索引的进度。

可视化编辑器管理 header 名称及其授权。其他 header 设置（包括值脱敏）请使用 **Configuration**。设置说明请参阅[按请求或响应 header 筛选日志][docs-filter-logs-by-header]。

### 账单（Billing）

路由：`/admin/settings/billing`

当网关可使用 Aperture 账单功能时，会出现 **Billing** 页面。它提供：

* **Current balance** 和 30 天购买上限。
* 账户符合条件时用于自动充值的支付方式。
* **Purchase credits**，包含 **Credit amount** 字段和 **Purchase** 操作。
* **Automatic reload**，包含 **Trigger at or below**、**Reload amount**、**30-day reload limit**、**Used in the past 30 days** 和 **Save automatic reload**。
* **Credit history**，记录初始赠金、购买和自动充值，包括状态和（可用时的）收据。

要禁用自动充值，请把 **30-day reload limit** 设为零，或移除支付方式。

### Chat

路由：`/admin/settings/chat`

**Chat** 页面配置 Chat 界面使用的模型和系统提示。

#### 模型（Models）

**Models** 标签页控制哪些模型出现在 Chat 的模型选择器中。它不授予访问权限。每个用户只能看到此列表中其授权允许的模型。

每个条目选择一个模型或模式，还可以指定显示名称、上下文窗口、最大输出，以及角色：**Responses**、**Title generation** 或 **Summarization**。拖动条目可设置顺序。从此列表中移除模型不会更改 Chat 之外的授权或访问权限。

#### 系统提示（System prompt）

路由：`/admin/settings/chat/prompt`

使用 **System prompt** 标签页选择随每次 Chat 对话发送的提示：

* **Default** 包含身份、用户上下文和简短的行为指引。
* **Minimal** 包含身份、用户上下文和工具环境事实，不含行为指引。
* **Custom** 允许你编辑并校验一个从默认模板出发的提示模板。

选择 **Save changes** 应用所选模式或自定义模板。**Reset to default** 会更改编辑器中的文本但不保存。当相应工具可用时，由 Aperture 管理的工具指令仍会包含在内。

Chat 的初始设置请参阅[设置 Chat 界面][docs-set-up-chat]。

### 特性开关（Feature Flags）

路由：`/admin/settings/feature-flags`

使用 **Feature Flags** 启用或禁用可用特性。切换一个可见的开关会立即保存配置。

### 配置（Configuration）

路由：`/admin/settings/config`

**Configuration** 页面是完整 [Aperture 配置][docs-aperture-configuration]的 HuJSON 编辑器。HuJSON 支持注释和尾随逗号。

在你选择 **Save** 之前，编辑内容只保留在浏览器中。Aperture 会在你输入时检查 HuJSON 语法并显示错误。保存时会把完整配置发送给服务器校验。

如果其他管理员保存了更新的版本，请选择 **Refresh** 加载它，然后重新应用你的更改。

配置更改不能移除你自己的管理员权限。要移交管理权，请在保留你自己权限的同时授予另一个用户管理员权限，然后让那位管理员移除你的角色。

## 参考（Reference）

此组提供集成信息和交互式 API 参考。可用页面取决于你的账户。

### 集成（Integrations）

路由：`/admin/settings/integrations`

当账户可用集成目录时，会出现 **Integrations** 页面。浏览集成并打开其设置信息。受支持的集成指南请参阅[与外部工具集成][docs-integrate]。

### API 文档（API Docs）

路由：`/admin/settings/api`

**API Docs** 页面是 Aperture API 的交互式 OpenAPI 参考。可浏览各操作、认证要求、请求字段、响应字段和错误。选择 **Test Request** 打开请求客户端，再选择 **Send Request** 即可从浏览器发送请求。

## 相关内容

访问要求、配置细节和操作流程请参阅以下主题：

* [Aperture 管理仪表板][docs-aperture-admin-dashboard]
* [Aperture 配置参考][docs-aperture-configuration]
* [Aperture 操作指南][docs-aperture-how-to]
* [Aperture Chat 参考][docs-aperture-chat-reference]

[docs-aperture-admin-dashboard]: /docs/aperture/admin-dashboard

[docs-aperture-chat-reference]: /docs/aperture/reference/chat

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-hooks]: /docs/aperture/configuration#hooks

[docs-aperture-how-to]: /docs/aperture/how-to

[docs-check-refill-budgets]: /docs/aperture/how-to/check-and-refill-budgets

[docs-configure-overdraft-quotas]: /docs/aperture/how-to/configure-overdraft-quotas

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-export-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-filter-logs-by-header]: /docs/aperture/how-to/filter-logs-by-header

[docs-grant-connector-access]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-how-grants-work]: /docs/aperture/how-grants-work

[docs-integrate]: /docs/aperture/integrate

[docs-privacy-retention]: /docs/aperture/privacy-and-data-retention

[docs-provider-compatibility]: /docs/aperture/provider-compatibility

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-set-up-chat]: /docs/aperture/how-to/set-up-chat-ui

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-zero-retention]: /docs/aperture/how-to/configure-zero-retention
