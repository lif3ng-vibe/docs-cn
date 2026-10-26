import Image from '@theme/IdealImage';

# 团队自带防护栏（Team Bring-Your-Own Guardrails）

基于团队的防护栏（team-based guardrails）允许**开发者**通过 API 为自己的团队注册防护栏，再由**管理员**在 LiteLLM UI 中审核并批准或拒绝。只有 [Generic Guardrail API](/docs/adding_provider/generic_guardrail_api) 类型的防护栏才能通过这种方式注册。

## 概览

- **开发者流程**：使用**团队级 API 密钥**（team-scoped API key）携带防护栏配置调用 `POST /guardrails/register`，提交内容会以 `pending_review` 状态保存。
- **管理员流程**：在代理 UI 中打开 **Guardrails → Team Guardrails**，审核待处理的提交，然后点击 **Approve** 或 **Reject**。获得批准的防护栏随即生效，并在内存中完成初始化。

---

## 开发者流程：注册防护栏

### 前提条件

- 一个**团队级** API 密钥（密钥必须关联到某个团队）。没有团队的密钥无法注册防护栏。
- 你的防护栏必须遵循 [Generic Guardrail API](/docs/adding_provider/generic_guardrail_api) 的契约与配置。

### 请求

**端点**：`POST /guardrails/register`

**请求头**：`Authorization: Bearer <team_scoped_api_key>`

**请求体**：符合 Generic Guardrail API 配置的 JSON。

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `guardrail_name` | string | 是 | 防护栏的唯一名称。 |
| `litellm_params` | object | 是 | 必须包含 `guardrail: "generic_guardrail_api"`、`mode`（如 `pre_call`、`post_call`）以及 `api_base`。详见 [Generic Guardrail API](/docs/adding_provider/generic_guardrail_api#litellm-配置)。 |
| `guardrail_info` | object | 否 | 可选元数据（如 `description`）。 |

### `litellm_params` 的要求

- `guardrail` 必须严格为 `"generic_guardrail_api"`。
- `api_base` 为必填项，即防护栏 API 的基础 URL。
- `mode` 为必填项（如 `pre_call`、`post_call`、`during_call`）。

### 示例

```bash
curl -X POST "http://localhost:4000/guardrails/register" \
  -H "Authorization: Bearer <your_team_scoped_api_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "guardrail_name": "my-team-guard",
    "litellm_params": {
      "guardrail": "generic_guardrail_api",
      "mode": "pre_call",
      "api_base": "https://your-guardrail-api.com",
      "api_key": "optional-api-key",
      "unreachable_fallback": "fail_closed",
      "forward_api_key": true
    },
    "guardrail_info": {
      "description": "Team content moderation guardrail"
    }
  }'
```

### 响应示例

```json
{
  "guardrail_id": "123e4567-e89b-12d3-a456-426614174000",
  "guardrail_name": "my-team-guard",
  "status": "pending_review",
  "submitted_at": "2025-02-28T12:00:00.000Z"
}
```

### 错误

- **400**：请求体缺失或无效（如 `guardrail` 不是 `generic_guardrail_api`、缺少 `api_base` 或 `mode`），或者已存在相同 `guardrail_name` 的防护栏。
- **400**：返回 "Registration requires an API key associated with a team. Use a team-scoped key." 时，请改用已关联团队的 API 密钥。
- **500**：服务器或数据库错误。

注册成功后，防护栏会保持 `pending_review` 状态，直到管理员批准或拒绝。

---

## 管理员流程：在 UI 中批准或拒绝

管理员在 LiteLLM 代理 UI 中审核团队防护栏提交，并予以批准或拒绝。

### 1. 打开 Guardrails 页面

在代理仪表板中，进入 **Guardrails**（侧边栏或导航栏）。

### 2. 打开 Team Guardrails 标签页

切换到 **Team Guardrails** 标签页。该标签页列出所有由团队提交的防护栏及其状态。

<Image img={require('../../../img/admin_team_guardrails.png')} alt="Team Guardrails 管理视图：状态汇总（Total、Pending Review、Active、Rejected）、带 Pending Review 标签的防护栏列表，以及含 Approve/Reject 按钮和配置选项的详情面板" style={{ width: '100%', maxWidth: '900px', height: 'auto' }} />

### 3. 审核提交

表格中展示：

- **Name**（名称）、**Team**（团队）、**Endpoint**（api_base）、**Status**（Pending Review / Active / Rejected）、**Submitted**（提交日期）、**Submitted by**（提交人：用户/邮箱）以及其他配置详情。

汇总卡片显示 **Total**、**Pending Review**、**Active** 和 **Rejected** 各自的数量。

{/* Optional: screenshot of the Team Guardrails table and summary */}

### 4. 批准或拒绝

- **Pending Review**：使用 **Approve** 激活防护栏。代理会将其状态设为 `active`，并在内存中初始化，使其可用于处理请求。
- 使用 **Reject** 拒绝该提交（状态变为 `rejected`）。

批准会触发与通过配置或管理员防护栏 API 添加防护栏相同的初始化流程；拒绝则只更新状态，不会加载该防护栏。

{/* Optional: screenshot of Approve/Reject actions or confirmation dialog */}

### 等效 API（仅管理员）

管理员也可以使用 REST API：

- **列出提交**：`GET /guardrails/submissions`（可选查询参数：`status`、`team_id`、`search`）
- **查询单条**：`GET /guardrails/submissions/{guardrail_id}`
- **批准**：`POST /guardrails/submissions/{guardrail_id}/approve`
- **拒绝**：`POST /guardrails/submissions/{guardrail_id}/reject`

这些端点需要**管理员**身份验证（如 `PROXY_ADMIN`）。

---

## 总结

| 角色 | 操作 |
|------|--------|
| **开发者** | 使用团队级密钥和 `generic_guardrail_api` 配置调用 `POST /guardrails/register`，提交进入 `pending_review` 状态。 |
| **管理员** | 在 UI 中打开 **Guardrails → Team Guardrails**（或使用 submissions API），再对每条提交执行 **Approve** 或 **Reject**。获得批准的防护栏即会生效。 |

只有 `litellm_params.guardrail: "generic_guardrail_api"` 的防护栏才会被接受注册。完整的契约与配置选项请参见 [Generic Guardrail API](/docs/adding_provider/generic_guardrail_api)。
