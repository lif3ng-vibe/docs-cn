# 数据库里存了什么

LiteLLM 代理（Proxy）使用 PostgreSQL 数据库存储各类信息。数据库主要承担以下功能：
- 虚拟密钥（virtual key）、组织、团队、用户、预算等数据的管理。
- 按请求粒度的用量统计（usage tracking）。

## DB Schema 链接

完整的 DB Schema 可在[这里](https://github.com/BerriAI/litellm/blob/main/schema.prisma)查看。

## 数据库表

### 组织、团队、用户与终端用户

| 表名 | 说明 | 行写入频率 |
|------------|-------------|---------------------|
| LiteLLM_OrganizationTable | 管理组织级配置。追踪组织花费、模型访问权限与元数据，并关联预算配置和团队。 | 低 |
| LiteLLM_TeamTable | 处理组织内的团队级设置。管理团队成员、管理员及其角色，控制团队专属的预算、速率限制（rate limit）与模型访问权限。 | 低 |
| LiteLLM_UserTable | 存储用户信息及其设置。追踪单个用户的花费、模型访问权限与速率限制，管理用户角色和团队成员身份。 | 低 |
| LiteLLM_EndUserTable | 管理终端用户（end user）配置。控制模型访问与地区合规要求，追踪终端用户花费。 | 低 |
| LiteLLM_TeamMembership | 追踪用户在团队中的参与情况，管理团队维度的用户预算与花费。 | 低 |
| LiteLLM_OrganizationMembership | 管理用户在组织内的角色，追踪组织维度的用户权限与花费。 | 低 |
| LiteLLM_InvitationLink | 处理用户邀请。管理邀请状态与过期时间，记录邀请由谁创建、由谁接受。 | 低 |
| LiteLLM_UserNotifications | 处理模型访问申请。追踪用户提交的模型访问请求，管理审批状态。 | 低 |

### 身份验证

| 表名 | 说明 | 行写入频率 |
|------------|-------------|---------------------|
| LiteLLM_VerificationToken | 管理虚拟密钥及其权限。控制密钥维度的预算、速率限制与模型访问权限，追踪各密钥的花费与元数据。 | **中** - 存储所有虚拟密钥 |

### 模型（LLM）管理

| 表名 | 说明 | 行写入频率 |
|------------|-------------|---------------------|
| LiteLLM_ProxyModelTable | 存储模型配置。定义可用模型及其参数，包含模型专属的信息与设置。 | 低 - 仅配置数据 |

### 预算管理

| 表名 | 说明 | 行写入频率 |
|------------|-------------|---------------------|
| LiteLLM_BudgetTable | 存储组织、密钥与终端用户的预算和限流配置。记录最大预算、软预算、TPM/RPM 上限及模型专属预算，处理预算周期与重置时间。 | 低 - 仅配置数据 |


### 追踪与日志

| 表名 | 说明 | 行写入频率 |
|------------|-------------|---------------------|
| LiteLLM_SpendLogs | 记录所有 API 请求的详细日志。存储 Token 用量、花费与耗时信息，追踪使用了哪些模型和密钥。 | **中 - 由定时批处理任务写入** |
| LiteLLM_DailyUserSpend 及同系列表（DailyTeamSpend、DailyOrgSpend、DailyTagSpend、DailyEndUserSpend、DailyAgentSpend） | 按用户、团队、组织、标签、终端用户与智能体预先聚合的每日花费汇总；Admin UI 的用量视图直接读取这些聚合数据，而不再扫描 SpendLogs。 | 低 - 每个实体每天一行，批量更新 |
| LiteLLM_DailyGatewayRequests | 由请求指标中间件在 ASGI 边缘记录的成功与失败请求计数，以日期、类别和路由为键。支撑用量页上的"成功请求"与"失败请求"卡片，以及"按端点分组的网关请求"图表；参见[网关请求计数](./endpoint_activity.md#网关请求计数)。 | 低 - 每条路由每天一行，批量更新 |
| LiteLLM_AuditLog | 追踪系统配置的变更。记录变更者与修改内容，保留团队、用户与模型的更新历史。 | **默认关闭**，**高 - 实体每次变更都会写入** |

## 禁用 `LiteLLM_SpendLogs`

在 `general_settings` 下设置 `disable_spend_logs: True` 或 `disable_error_logs: True`，即可停止写入对应的表。关闭花费日志后，UI 中不再有逐请求的日志明细，但日志集成（s3、Prometheus、Langfuse）中的成本指标仍在；关闭错误日志后，UI 中的 Errors 视图会消失，但错误仍保留在应用日志和其他日志集成中。参见生产环境检查清单中的[将错误日志挡在数据库之外](./prod.md#不要把错误日志写进数据库)。


## 迁移数据库

如果需要迁移数据库，应复制下列表，以确保服务持续运行、不中断。


| 表名 | 说明 |
|------------|-------------|
| LiteLLM_VerificationToken | **必需** - 确保现有虚拟密钥继续可用 |
| LiteLLM_UserTable | **必需** - 确保现有虚拟密钥继续可用 |
| LiteLLM_TeamTable | **必需** - 确保团队完成迁移 |
| LiteLLM_TeamMembership | **必需** - 确保团队成员预算完成迁移 |
| LiteLLM_BudgetTable | **必需** - 迁移现有预算设置 |
| LiteLLM_OrganizationTable | **可选** - 仅在使用数据库中的组织功能时迁移 |
| LiteLLM_OrganizationMembership | **可选** - 仅在使用数据库中的组织功能时迁移 |
| LiteLLM_ProxyModelTable | **可选** - 仅在将模型存入数据库时迁移（即设置了 `STORE_MODEL_IN_DB=True`） |
| LiteLLM_SpendLogs | **可选** - 仅在需要 LiteLLM UI 中的历史数据时迁移 |
| LiteLLM_ErrorLogs | **可选** - 仅在需要 LiteLLM UI 中的历史数据时迁移 |



## 利用逻辑复制创建数据库副本

Postgres 的逻辑复制（logical replication）在行被更新或删除时，只会携带副本标识（replica identity）对应的列。Prisma 创建的每张 LiteLLM 表都沿用 Postgres 默认值，也就是主键，因此下游消费者只能看到新行，看不到旧行。Neon 的 lakehouse 同步这类接收端要求 `REPLICA IDENTITY FULL`，并会拒绝未设置该选项的表。

设置 `LITELLM_SET_REPLICA_IDENTITY_FULL=True` 后，LiteLLM 会在每次迁移运行结束时对每张 LiteLLM 表执行

```sql
ALTER TABLE "LiteLLM_..." REPLICA IDENTITY FULL;
```

包括未来升级新增的表，因此该设置能随升级保留，无需每次手动重做。已经是 `FULL` 的表会被跳过，同一 schema 中不属于 LiteLLM 的表也不会被改动。

```bash
export LITELLM_SET_REPLICA_IDENTITY_FULL=True
litellm --config /path/to/config.yaml
```

执行迁移的数据库用户必须拥有这些表。否则 `ALTER` 会被拒绝，LiteLLM 会记录 Postgres 报错并照常启动，因为服务请求并不依赖复制元数据。

`REPLICA IDENTITY FULL` 会让 Postgres 在每次 `UPDATE` 和 `DELETE` 时把整行旧数据写入 WAL，因此除非复制消费者需要，否则应保持关闭。
