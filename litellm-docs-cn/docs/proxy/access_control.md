import { TenancyDiagram } from '@site/src/components/CloudArchitecture';

# 基于角色的访问控制（RBAC）

基于角色的访问控制（RBAC）建立在组织、团队和内部用户角色之上。

### 视频演示

<iframe width="100%" height="415" src="https://www.loom.com/embed/a980e25027ad4ecc9e8db1af2777b2a2" frameBorder="0" allowFullScreen></iframe>

<TenancyDiagram />


- `Organizations`（组织）是包含团队（Team）的顶层实体。
- `Team`（团队）：由多个 `Internal Users` 组成。
- `Internal Users`（内部用户）：可以创建密钥、发起 LLM API 调用、查看 LiteLLM 用量的用户。一个用户可以加入多个团队。
- `Virtual Keys`（虚拟密钥）：密钥用于对 LiteLLM API 做身份验证。每个密钥可以选择关联 `user_id`、`team_id`，或两者同时关联：
  - **仅用户密钥**：有 `user_id` 而无 `team_id`。用量单独追踪，用户被删除时密钥随之删除。
  - **团队密钥**（服务账号）：有 `team_id` 而无 `user_id`。由团队共用，移除成员后密钥不会被删除。[了解服务账号密钥的更多细节](https://docs.litellm.ai/docs/proxy/virtual_keys#service-account-keys)。
  - **用户 + 团队密钥**：同时有 `user_id` 和 `team_id`。属于团队上下文中的特定用户。

### 何时使用哪种密钥类型

| 密钥类型 | 适用场景 | 花费追踪 | 生命周期 |
|----------|----------|----------------|-----------|
| **仅用户** | 开发者个人的 API 密钥 | 追踪到用户个人 | 用户被删除时随之删除 |
| **团队**（服务账号） | 生产应用、CI/CD 流水线、共享服务 | 只追踪到团队 | 团队成员离开后依然保留 |
| **用户 + 团队** | 用户在团队上下文中工作 | 同时追踪到用户和团队 | 用户被删除时随之删除 |

**示例场景**：
- 本地测试的开发者使用**仅用户密钥**
- 生产应用使用**团队服务账号密钥**，员工离职也不会导致应用故障
- 需要在团队预算内做到个人责任可追溯时，使用**用户 + 团队密钥**

---

## 用户角色

LiteLLM 有两类角色：

1. **全局代理角色**：作用于整个平台、覆盖所有组织和团队的角色
2. **组织/团队专属角色**：限定在特定组织或团队内的角色（**企业版功能**）

### 全局代理角色

| 角色名 | 权限 |
|-----------|-------------|
| `proxy_admin` | 整个平台的管理员，对所有组织、团队和用户拥有完全控制权 |
| `proxy_admin_viewer` | 可以登录，查看所有密钥、查看全平台的花费。**不能**创建密钥/删除密钥/添加新用户 |
| `internal_user` | 可以登录，查看/创建（在团队级权限允许时）/删除自己的密钥，查看自己的花费。**不能**添加新用户 |
| `internal_user_viewer` | ⚠️ **已弃用**：请改用组织/团队专属角色。可以登录，查看自己的密钥、查看自己的花费。**不能**创建/删除密钥、添加新用户 |

### 组织/团队专属角色

| 角色名 | 权限 |
|-----------|-------------|
| `org_admin` | 特定组织的管理员，可以在自己组织内创建团队和用户 ✨ **企业版功能** |
| `team_admin` | 特定团队的管理员，可以管理团队成员、更新成员权限，并为自己的团队创建密钥。✨ **企业版功能** |

## 用量仪表板的可见性

用量（Usage）页面展示的数据取决于所选视图和登录用户的角色：

| 视图 | 展示内容 |
| --- | --- |
| 个人用量 | 登录用户的用量汇总。如果用户属于多个团队，此视图不会按团队拆分其个人用量。 |
| 团队用量 | 所选团队的完整用量，而不只是登录用户在该团队中的部分。 |
| 组织用量 | 组织的用量汇总，需要用户的组织角色有权访问。 |
| 全局用量 | 面向代理管理员和代理管理员查看者的全平台用量。 |

LiteLLM 管理界面（Admin UI）不托管自定义仪表板。如果需要自定义视图（例如每个团队内各用户的用量），请通过管理 API 查询花费数据，或把遥测数据导出到外部系统。Grafana 兼容的导出方式参见 [Prometheus 指标](./prometheus.md)与 [OpenTelemetry](../observability/opentelemetry_v2.md)。

## 每种角色能做什么？

下面列出每种角色实际能做的事，可以把它理解为不同级别的访问权限。

---

## 全局代理角色

这些角色作用于整个 LiteLLM 平台，不受组织或团队边界的限制。

### 代理管理员（Proxy Admin）：完全访问

代理管理员掌控一切，相当于整个平台的所有者。

**可以做的事情**：
- 创建并管理所有组织
- 创建并管理所有团队（跨所有组织）
- 创建并管理所有用户
- 查看全平台的花费和用量
- 为任何人创建和删除密钥
- 更新团队预算、速率限制和模型
- 管理团队成员并分配角色

**谁适合担任代理管理员**：只有负责运维 LiteLLM 实例的人。

---

### 代理管理员查看者（Proxy Admin Viewer）：平台级只读访问

代理管理员查看者可以看到全平台的一切，但不能做任何修改。

**可以做的事情**：
- 查看所有组织、团队和用户
- 查看全平台的花费和用量
- 查看所有 API 密钥
- 登录管理仪表板

**不能做的事情**：
- 创建或删除密钥
- 添加或移除用户
- 修改预算、速率限制或设置
- 对平台做任何更改

**谁适合担任代理管理员查看者**：需要全平台可见性但无需修改权限的财务团队、审计人员或其他利益相关方。

---

### 内部用户（Internal User）

内部用户可以创建 API 密钥（前提是团队级权限允许）并发起调用，只能看到自己的内容。如果被授予相应角色，他们可以成为团队管理员或组织管理员。

**可以做的事情**：
- 为自己创建 API 密钥
- 删除自己的 API 密钥
- 查看自己的花费和用量
- 用自己的密钥发起 API 调用


**谁适合担任内部用户**：需要通过 UI 执行团队/组织相关操作的任何人，**或者**你打算发放多个密钥的开发者。

---

### 内部用户查看者（Internal User Viewer）：只读访问

:::warning[已弃用]
此角色已弃用，请改用组织/团队专属角色。要更细粒度地控制组织和团队内的用户权限，请使用 `org_admin` 或 `team_admin` 角色。
:::

内部用户查看者可以查看自己的信息，但不能创建或删除密钥。

**可以做的事情**：
- 查看自己的 API 密钥
- 查看自己的花费和用量
- 登录查看自己的仪表板

**不能做的事情**：
- 创建或删除 API 密钥
- 修改任何设置
- 创建团队或添加用户
- 查看其他人的信息

**谁适合担任内部用户查看者**（已弃用）：建议改用组织/团队专属角色，以获得更好的访问控制。

---

## 组织/团队专属角色

<EnterpriseFeature />

这些角色限定在特定组织或团队内。拥有这些角色的用户只能管理自己所属组织或团队内的资源。

### 组织管理员（Org Admin）：组织级访问

组织管理员管理一个或多个组织，可以在自己的组织内创建团队，但碰不到其他组织。

**可以做的事情**：
- 在自己的组织内创建团队
- 把用户加入自己组织内的团队
- 查看自己组织的花费
- 为自己组织内的用户创建密钥

**不能做的事情**：
- 创建或管理其他组织
- 修改组织预算 / 速率限制
- 修改组织的可用模型（例如把代理级模型加进组织）

**谁适合担任组织管理员**：需要管理多个团队的部门负责人或管理者。

---

### 团队管理员（Team Admin）：团队级访问

✨ **这是企业版功能**

团队管理员管理一个特定的团队，相当于团队负责人，可以添加成员、更新设置，但仅限于自己的团队。

**可以做的事情**：
- 从自己的团队添加或移除成员
- 更新团队内成员的预算和速率限制
- 修改团队速率限制（TPM/RPM）和团队的 `max_budget`，可用范围以代理管理员在[团队管理员可编辑字段](#选择团队管理员可编辑的字段)中启用的字段为准
- 为团队成员创建和删除密钥
- 把[团队 BYOK](./team_model_add) 模型接入 LiteLLM（例如接入某个团队微调的模型）
- 配置[团队成员权限](#团队成员权限)，控制普通团队成员能做什么

**不能做的事情**：
- 创建新团队
- 提高团队的 `max_budget`（除非代理管理员启用了 `raise_max_budget`），或移除预算上限（`max_budget: null`），后者只有代理管理员能做
- 给自己的团队添加/移除全局代理模型

:::info[团队预算上调]
在 `/team/update` 上，团队管理员只能修改代理管理员在[团队管理员可编辑字段](#选择团队管理员可编辑的字段)中启用的字段。启用 `max_budget` 后，他们可以保持或调低预算；上调还需要 `raise_max_budget` 条目，且在挂靠组织的团队上，以组织的 `max_budget` 为上限。移除预算上限的权限始终保留在代理管理员手中。
:::

**谁适合担任团队管理员**：需要自行管理团队 API 访问、不想事事麻烦 IT 的团队负责人。

:::info[如何创建团队管理员]

分配团队管理员需要 LiteLLM 企业版。[点击这里获取 30 天试用](https://www.litellm.ai/#trial)。

```shell
curl -X POST 'http://0.0.0.0:4000/team/member_add' \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"team_id": "team-123", "member": {"role": "admin", "user_id": "user@company.com"}}'
```

:::

#### 选择团队管理员可编辑的字段

默认情况下，团队管理员完全不能修改团队设置：团队管理员调用 `/team/update` 会返回 403，并指出需要代理管理员启用哪个设置。代理管理员可以在管理界面的 Settings > UI > “Team admin editable fields”（团队管理员可编辑字段）中勾选字段，也可以通过 API 设置 `team_admin_editable_team_fields`。同一个键也可以写在代理配置 yaml 的 `general_settings` 下；通过 UI 或 API 保存的值优先于 yaml。这份列表对该代理上的每个团队管理员都生效，且只作用于他们所管理的团队，代理管理员和组织管理员不受影响。

```shell
curl -X PATCH 'http://localhost:4000/update/ui_settings' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"team_admin_editable_team_fields": ["tpm_limit", "rpm_limit", "max_budget", "raise_max_budget"]}'
```

可通过 `GET /get/ui_settings` 读回当前值。

| 条目 | 团队管理员在其管理的团队上可以做什么 |
|-------|-------------------------------------------------------|
| `tpm_limit` | 在 `/team/update` 上修改团队的每分钟 Token 数（TPM）限制 |
| `rpm_limit` | 在 `/team/update` 上修改团队的每分钟请求数（RPM）限制 |
| `max_budget` | 在 `/team/update` 上保持或调低团队的 `max_budget`。上调或移除仍会返回 403 |
| `raise_max_budget` | 额外允许上调 `max_budget`。必须与 `max_budget` 搭配使用：单独启用会返回 400；UI 中的复选框位于 Max Budget 下方，未勾选 Max Budget 前保持禁用。移除预算（`max_budget: null`）的权限始终归代理管理员 |
| `projects` | 为这些团队创建和更新项目（`/project/new`、`/project/update`） |
| `member_key_budgets` | 更新这些团队其他成员所持密钥上的预算字段（`/key/update`） |

如果团队挂靠的组织设有 `max_budget`，上调就会以组织的 `max_budget` 为上限：超过上限会返回 400，报错 `Team max_budget (...) exceeds organization's max_budget (...)`。不属于任何组织的团队，或所在组织没有预算的团队，则没有这道上限。无论由谁编辑，挂靠组织的团队都必须保持在组织的预算和 TPM/RPM 限制之内。

团队管理员可以在 `/team/info` 上查看自己能编辑什么：已启用字段时 `team_info.caller_edit_access` 为 `{"kind": "team_admin", "editable_fields": ["max_budget", "rpm_limit"], "may_raise_max_budget": true}`，什么都没启用时为 `{"kind": "team_admin_disabled"}`，代理管理员和组织管理员为 `{"kind": "unrestricted"}`，其他所有人则为 `{"kind": "none"}`。

---

## 团队成员权限

✨ **这是企业版功能**

团队成员权限让你可以控制普通团队成员（role=`user`）能对团队内的 API 密钥做什么。默认情况下，团队成员只能查看密钥信息，但你可以授予他们创建、更新或删除密钥的额外权限。

### 工作原理

- **适用对象**：role=`user` 的团队成员（不包括团队管理员和组织管理员）
- **作用范围**：权限只作用于其团队拥有的密钥
- **配置方式**：在团队层级通过 `team_member_permissions` 设置
- **例外**：无论这些设置如何，团队管理员和组织管理员始终拥有全部权限

### 可用权限

| 权限 | Method | 说明 |
|-----------|--------|-------------|
| `/key/info` | GET | 查看团队内虚拟密钥的信息 |
| `/key/health` | GET | 检查团队内虚拟密钥的健康状态 |
| `/key/list` | GET | 列出团队拥有的所有虚拟密钥 |
| `/key/generate` | POST | 为团队创建新的虚拟密钥 |
| `/key/service-account/generate` | POST | 为团队创建服务账号密钥（不绑定特定用户） |
| `/key/update` | POST | 修改团队内已有的虚拟密钥 |
| `/key/delete` | POST | 删除团队拥有的虚拟密钥 |
| `/key/regenerate` | POST | 重新生成团队内的虚拟密钥 |
| `/key/block` | POST | 封禁团队内的虚拟密钥 |
| `/key/unblock` | POST | 解封团队内的虚拟密钥 |
| `/team/daily/activity` | GET | 查看整个团队的用量，而不只是成员自己的 |
| `/spend/logs` | GET | 查看整个团队的花费日志，以及其在 [Lens](./lens/api.md#trace-access) 中的智能体追踪记录 |

### 默认权限

默认情况下，团队成员只能：
- `/key/info` - 查看密钥信息
- `/key/health` - 检查密钥健康状态

### 常见权限场景

**只读访问**（默认）：
```json
["/key/info", "/key/health"]
```

**允许创建密钥但不允许删除**：
```json
["/key/info", "/key/health", "/key/generate", "/key/update"]
```

**完整的密钥管理**：
```json
["/key/info", "/key/health", "/key/generate", "/key/update", "/key/delete", "/key/regenerate", "/key/block", "/key/unblock", "/key/list"]
```

### 如何配置团队成员权限

#### 查看当前权限

```shell
curl --location 'http://0.0.0.0:4000/team/permissions_list?team_id=team-123' \
    --header "Authorization: Bearer $LITELLM_API_KEY"
```

预期响应：
```json
{
  "team_id": "team-123",
  "team_member_permissions": ["/key/info", "/key/health"],
  "all_available_permissions": ["/key/generate", "/key/update", "/key/delete", ...]
}
```

#### 更新团队成员权限

```shell
curl --location 'http://0.0.0.0:4000/team/update' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
        "team_id": "team-123",
        "team_member_permissions": ["/key/info", "/key/health", "/key/generate", "/key/update"]
    }'
```

这样团队成员就可以：
- 查看密钥信息
- 创建新密钥
- 更新已有密钥
- 但不能删除密钥

### 谁可以配置这些权限？

- **代理管理员**：可以为任意团队配置权限
- **组织管理员**：可以为其组织内的团队配置权限
- **团队管理员**：可以为自己的团队配置权限

---

## 快速对照

快速版对照如下：

### 全局代理角色

| 动作 | 代理管理员 | 代理管理员查看者 | 内部用户 | 内部用户查看者 ⚠️（已弃用） |
|--------|-------------|-------------------|---------------|-------------------------------------|
| 创建组织 | ✅ | ❌ | ❌ | ❌ |
| 创建团队 | ✅ | ❌ | ❌ | ❌ |
| 管理所有团队 | ✅ | ❌ | ❌ | ❌ |
| 创建/删除任意密钥 | ✅ | ❌ | ❌ | ❌ |
| 创建/删除自己的密钥 | ✅ | ❌ | ✅ | ❌ |
| 查看全平台花费 | ✅ | ✅ | ❌ | ❌ |
| 查看自己的花费 | ✅ | ✅ | ✅ | ✅ |
| 查看所有密钥 | ✅ | ✅ | ❌ | ❌ |
| 查看自己的密钥 | ✅ | ✅ | ✅ | ✅ |
| 添加/移除用户 | ✅ | ❌ | ❌ | ❌ |

> **注意**：`internal_user_viewer` 角色已弃用。请改用组织/团队专属角色，以获得更细粒度的访问控制。

### 组织/团队专属角色

| 动作 | 组织管理员 | 团队管理员 |
|--------|-----------|------------|
| 创建团队（在自己组织内） | ✅ | ❌ |
| 管理自己组织内的团队 | ✅ | ❌ |
| 管理自己特定的团队 | ✅ | ✅ |
| 添加/移除团队成员 | ✅（在自己组织内） | ✅（仅自己的团队） |
| 保持/调低团队 `max_budget` | ✅（在自己组织内） | ✅（仅自己的团队，前提是 `max_budget` 已[启用](#选择团队管理员可编辑的字段)） |
| 上调团队 `max_budget` | ✅（挂靠组织的团队以组织限制为上限）；独立团队需代理管理员 | ✅（仅自己的团队，前提是启用了 `raise_max_budget`；以组织预算为上限） |
| 更新团队速率限制 | ✅（在自己组织内） | ✅（仅自己的团队，前提是启用了 `tpm_limit` / `rpm_limit`） |
| 为团队成员创建密钥 | ✅（在自己组织内） | ✅（仅自己的团队） |
| 查看组织花费 | ✅（自己的组织） | ❌ |
| 查看团队花费 | ✅（在自己组织内） | ✅（自己的团队） |
| 创建组织 | ❌ | ❌ |
| 查看全平台花费 | ❌ | ❌ |

## 组织入驻

✨ **这是企业版功能**

### 1. 新建组织

任何 role=`proxy_admin` 的用户都可以创建新组织。

**用法**

[**/organization/new 的 API 参考**](https://docs.litellm.ai/api-reference/#/organization%20management/new_organization_organization_new_post)

```shell
curl --location 'http://0.0.0.0:4000/organization/new' \
    --header "Authorization: Bearer $LITELLM_API_KEY" \
    --header 'Content-Type: application/json' \
    --data '{
        "organization_alias": "marketing_department",
        "models": ["{{openai_large}}"],
        "max_budget": 20
    }'
```

预期响应：

```json
{
  "organization_id": "ad15e8ca-12ae-46f4-8659-d02debef1b23",
  "organization_alias": "marketing_department",
  "budget_id": "98754244-3a9c-4b31-b2e9-c63edc8fd7eb",
  "metadata": {},
  "models": [
    "{{openai_large}}"
  ],
  "created_by": "109010464461339474872",
  "updated_by": "109010464461339474872",
  "created_at": "2024-10-08T18:30:24.637000Z",
  "updated_at": "2024-10-08T18:30:24.637000Z"
}
```


### 2. 将 `org_admin` 添加到组织

创建一个用户（ishaan@berri.ai），将其设为 `marketing_department` 组织的 `org_admin`（来自[第 1 步](#1-新建组织)）

拥有以下角色的用户可以调用 `/organization/member_add`：
- `proxy_admin`
- `org_admin`（仅限自己组织内）

```shell
curl -X POST 'http://0.0.0.0:4000/organization/member_add' \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"organization_id": "ad15e8ca-12ae-46f4-8659-d02debef1b23", "member": {"role": "org_admin", "user_id": "ishaan@berri.ai"}}'
```

此时，`marketing_department` 组织中已创建了一个 user_id = `ishaan@berri.ai`、role = `org_admin` 的用户。

为 user_id = `ishaan@berri.ai` 创建一个虚拟密钥。之后该用户就可以用这个虚拟密钥执行组织管理员操作。

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
        --header "Authorization: Bearer $LITELLM_API_KEY" \
        --header 'Content-Type: application/json' \
        --data '{
            "user_id": "ishaan@berri.ai"
    }'
```

预期响应：

```json
{
  "models": [],
  "user_id": "ishaan@berri.ai",
  "key": "sk-7shH8TGMAofR4zQpAAo6kQ",
  "key_name": "sk-...o6kQ"
}
```

### 3. `Organization Admin`：创建团队

组织管理员将使用[第 2 步](#2-将-org_admin-添加到组织)中创建的虚拟密钥，在 `marketing_department` 组织内创建一个 `Team`。

```shell
curl --location 'http://0.0.0.0:4000/team/new' \
    --header 'Authorization: Bearer sk-7shH8TGMAofR4zQpAAo6kQ' \
    --header 'Content-Type: application/json' \
    --data '{
        "team_alias": "engineering_team",
        "organization_id": "ad15e8ca-12ae-46f4-8659-d02debef1b23"
    }'
```

这会在 `marketing_department` 组织内创建团队 `engineering_team`。

预期响应：

```json
{
  "team_alias": "engineering_team",
  "team_id": "01044ee8-441b-45f4-be7d-c70e002722d8",
  "organization_id": "ad15e8ca-12ae-46f4-8659-d02debef1b23"
}
```


### 4. `Organization Admin`：添加团队管理员

✨ **这是企业版功能**

现在，组织管理员可以添加一个团队管理员来管理 `engineering_team`。

- 指定 role=`admin`，让该用户成为这个特定团队的团队管理员
- `team_id` 来自[第 3 步](#3-organization-admin创建团队)

```shell
curl -X POST 'http://0.0.0.0:4000/team/member_add' \
    -H 'Authorization: Bearer sk-7shH8TGMAofR4zQpAAo6kQ' \
    -H 'Content-Type: application/json' \
    -d '{"team_id": "01044ee8-441b-45f4-be7d-c70e002722d8", "member": {"role": "admin", "user_id": "john@company.com"}}'
```

现在 `john@company.com` 已成为团队管理员，可以管理 `engineering_team`（添加成员、创建密钥，以及修改代理管理员在[团队管理员可编辑字段](#选择团队管理员可编辑的字段)中启用的团队设置），但碰不到其他团队。

为该团队管理员创建一个虚拟密钥：

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
    --header 'Authorization: Bearer sk-7shH8TGMAofR4zQpAAo6kQ' \
    --header 'Content-Type: application/json' \
    --data '{"user_id": "john@company.com"}'
```

预期响应：

```json
{
  "models": [],
  "user_id": "john@company.com",
  "key": "sk-TeamAdminKey123",
  "key_name": "sk-...Key123"
}
```

### 5. `Team Admin`：添加团队成员

现在团队管理员可以用自己的密钥添加团队成员，不用再去麻烦组织管理员。

```shell
curl -X POST 'http://0.0.0.0:4000/team/member_add' \
    -H 'Authorization: Bearer sk-TeamAdminKey123' \
    -H 'Content-Type: application/json' \
    -d '{"team_id": "01044ee8-441b-45f4-be7d-c70e002722d8", "member": {"role": "user", "user_id": "krrish@berri.ai"}}'
```

团队管理员还可以为自己的团队成员创建密钥：

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
    --header 'Authorization: Bearer sk-TeamAdminKey123' \
    --header 'Content-Type: application/json' \
    --data '{
        "user_id": "krrish@berri.ai",
        "team_id": "01044ee8-441b-45f4-be7d-c70e002722d8"
    }'
```

### 6. `Team Admin`：更新团队设置

这一步需要代理管理员事先在[团队管理员可编辑字段](#选择团队管理员可编辑的字段)中启用 `rpm_limit` 和 `max_budget`。有了这两个条目，团队管理员就能修改 RPM 限制、保持或调低团队预算；上调 `max_budget` 还需要 `raise_max_budget` 条目。

```shell
curl --location 'http://0.0.0.0:4000/team/update' \
    --header 'Authorization: Bearer sk-TeamAdminKey123' \
    --header 'Content-Type: application/json' \
    --data '{
        "team_id": "01044ee8-441b-45f4-be7d-c70e002722d8",
        "max_budget": 100,
        "rpm_limit": 1000
    }'
```

在这个例子中，当团队当前预算已经不低于 `100` 时，`max_budget: 100` 会成功。要超过当前预算，还需要 `raise_max_budget`，且在挂靠组织的团队上，新值必须保持在组织的 `max_budget` 之内。如果没有任何字段被启用，这次调用会返回 403，并告诉团队管理员该向代理管理员申请启用哪个设置。
