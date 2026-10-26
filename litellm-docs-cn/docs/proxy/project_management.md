# ✨ [Beta] 项目管理

<EnterpriseFeature />

在 LiteLLM 的组织层级中，项目（project）位于团队与密钥之间，可为特定用例或应用实现细粒度的访问控制与预算管理。

```mermaid
graph TD
    A[Organization] --> B[Team 1]
    A --> C[Team 2]
    B --> D[Project A]
    B --> E[Project B]
    C --> F[Project C]
    D --> G[API Key 1]
    D --> H[API Key 2]
    E --> I[API Key 3]
    F --> J[API Key 4]
    
    style A fill:#e1f5ff
    style B fill:#fff4e6
    style C fill:#fff4e6
    style D fill:#f3e5f5
    style E fill:#f3e5f5
    style F fill:#f3e5f5
    style G fill:#e8f5e9
    style H fill:#e8f5e9
    style I fill:#e8f5e9
    style J fill:#e8f5e9
```

**层级结构**：`Organizations > Teams > Projects > Keys`

## 快速上手

本演练演示如何创建项目、生成 API 密钥、发起请求，以及在 UI 中查看项目级的花费追踪（spend tracking）。

### 步骤 1：创建项目

```bash showLineNumbers
curl --location 'http://0.0.0.0:4000/project/new' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "project_alias": "flight-search-assistant",
    "team_id": "ad898803-c8a3-4f4a-976a-a3c372cffa45",
    "models": ["{{openai_large}}", "{{openai_small}}"],
    "max_budget": 100,
    "metadata": {
        "use_case_id": "SNOW-12345",
        "responsible_ai_id": "RAI-67890"
    }
}' | jq
```

**响应**：
```json
{
  "project_id": "e402a141-725a-4437-bff5-d47459189716",
  "project_alias": "flight-search-assistant",
  "team_id": "ad898803-c8a3-4f4a-976a-a3c372cffa45",
  "models": ["{{openai_large}}", "{{openai_small}}"],
  "max_budget": 100,
  ...
}
```

### 步骤 2：为项目生成 API 密钥

```bash showLineNumbers
curl 'http://0.0.0.0:4000/key/generate' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data-raw '{
    "models": ["{{openai_small}}", "{{openai_large}}"],
    "metadata": {"user": "ishaan@berri.ai"},
    "project_id": "e402a141-725a-4437-bff5-d47459189716"
}' | jq
```

**响应**：
```json
{
  "key": "sk-W8VbscpfuyvHm5TkxRYiXA",
  "key_name": "sk-...YiXA",
  "project_id": "e402a141-725a-4437-bff5-d47459189716",
  ...
}
```

### 步骤 3：在对话补全中使用 API 密钥

```bash showLineNumbers
curl http://localhost:4000/v1/chat/completions \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-W8VbscpfuyvHm5TkxRYiXA' \
--data '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "What is litellm?"}]
}' | jq
```

### 步骤 4：在 UI 中查看项目花费

前往 LiteLLM 管理界面（Admin UI）中的 **Logs** 页面，你会在请求元数据（metadata）里看到被追踪的 `user_api_key_project_id`：

![项目花费追踪](/img/project_spend.png)

如上图所示，花费日志的元数据包含：
- `"user_api_key_project_id": "e402a141-725a-4437-bff5-d47459189716"`：将请求关联到你的项目
- 所有成本与 Token 用量都会自动归属到该项目
- 你可以按项目 ID 查询、筛选日志，生成详细报告

## API 端点

### POST /project/new

创建新项目。

**调用权限**：管理员或团队管理员

**参数**：
- `project_alias`（string，可选）：易于辨识的项目名称
- `team_id`（string，必填）：项目所属的团队
- `models`（array，可选）：项目可访问的模型列表
- `max_budget`（float，可选）：项目的最大花费预算
- `tpm_limit`（int，可选）：每分钟 Token 数（TPM）上限
- `rpm_limit`（int，可选）：每分钟请求数（RPM）上限
- `budget_duration`（string，可选）：预算重置周期（如 "30d"、"1mo"）
- `metadata`（object，可选）：项目的自定义元数据
- `blocked`（boolean，可选）：是否阻止该项目的所有 API 调用

**示例**：

```bash
curl --location 'http://0.0.0.0:4000/project/new' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "project_alias": "hotel-recommendations",
    "team_id": "team-123",
    "models": ["{{anthropic}}"],
    "max_budget": 200,
    "tpm_limit": 100000,
    "metadata": {
        "use_case_id": "SNOW-12346",
        "cost_center": "travel-products"
    }
}'
```

**响应**：

```json
{
    "project_id": "project-def",
    "project_alias": "hotel-recommendations",
    "team_id": "team-123",
    "models": ["{{anthropic}}"],
    "spend": 0.0,
    "budget_id": "budget-xyz",
    "metadata": {
        "use_case_id": "SNOW-12346",
        "cost_center": "travel-products"
    },
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
}
```

### POST /project/update

更新已有项目。

**调用权限**：管理员或团队管理员

**参数**：
- `project_id`（string，必填）：要更新的项目
- `project_alias`（string，可选）：更新后的项目名称
- `team_id`（string，可选）：将项目移动到其他团队
- `models`（array，可选）：更新后的允许模型列表
- `max_budget`（float，可选）：更新后的预算
- `tpm_limit`（int，可选）：更新后的 TPM 上限
- `rpm_limit`（int，可选）：更新后的 RPM 上限
- `metadata`（object，可选）：更新后的元数据
- `blocked`（boolean，可选）：更新后的封禁状态

**示例**：

```bash
curl --location 'http://0.0.0.0:4000/project/update' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "project_id": "project-abc",
    "max_budget": 200,
    "tpm_limit": 200000,
    "metadata": {
        "status": "production"
    }
}'
```

### GET /project/info

获取指定项目的信息。

**参数**：
- `project_id`（string，必填）：查询参数

**示例**：

```bash
curl --location 'http://0.0.0.0:4000/project/info?project_id=project-abc' \
--header "Authorization: Bearer $LITELLM_API_KEY"
```

**响应**：

```json
{
    "project_id": "project-abc",
    "project_alias": "flight-search-assistant",
    "team_id": "team-123",
    "models": ["{{openai_large}}", "{{openai_small}}"],
    "spend": 45.67,
    "model_spend": {
        "{{openai_large}}": 42.30,
        "{{openai_small}}": 3.37
    },
    "litellm_budget_table": {
        "budget_id": "budget-xyz",
        "max_budget": 100.0,
        "tpm_limit": 100000,
        "rpm_limit": 100
    },
    "metadata": {
        "use_case_id": "SNOW-12345"
    }
}
```

### GET /project/list

列出用户有权访问的所有项目。

**示例**：

```bash
curl --location 'http://0.0.0.0:4000/project/list' \
--header "Authorization: Bearer $LITELLM_API_KEY"
```

**响应**：

```json
[
    {
        "project_id": "project-abc",
        "project_alias": "flight-search-assistant",
        "team_id": "team-123",
        "spend": 45.67
    },
    {
        "project_id": "project-def",
        "project_alias": "hotel-recommendations",
        "team_id": "team-123",
        "spend": 23.45
    }
]
```

### DELETE /project/delete

删除一个或多个项目。

**调用权限**：仅管理员

**参数**：
- `project_ids`（array，必填）：要删除的项目 ID 列表

**示例**：

```bash
curl --location --request DELETE 'http://0.0.0.0:4000/project/delete' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "project_ids": ["project-abc", "project-def"]
}'
```

**注意**：已关联 API 密钥的项目无法删除，请先删除或重新分配这些密钥。

## 模型专属配额

你可以在项目内为不同模型设置不同的配额（quota）：

```bash
curl --location 'http://0.0.0.0:4000/project/new' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{
    "project_alias": "multi-model-project",
    "team_id": "team-123",
    "models": ["{{openai_large}}", "{{openai_small}}", "{{anthropic}}"],
    "max_budget": 500,
    "metadata": {
        "model_tpm_limit": {
            "{{openai_large}}": 50000,
            "{{openai_small}}": 200000,
            "{{anthropic}}": 100000
        },
        "model_rpm_limit": {
            "{{openai_large}}": 50,
            "{{openai_small}}": 500,
            "{{anthropic}}": 100
        }
    }
}'
```
