---
title: "Aperture 配置参考"
description: "Aperture 配置字段、默认值和校验错误参考。"
---

最后验证于 Oct 1, 2026

> **注意：**
>
> 你可以直接在 Aperture 内购买 token。如果你在个人版 Tailscale 套餐以外的套餐上想用你自己的 API 密钥搭配 Aperture，请[联系销售][co-contact-sales]。

[Tailscale 的 Aperture][docs-aperture] 使用 JSON 配置来管理 LLM 提供商、访问控制和集成。它控制哪些模型可用、请求如何向提供商认证，以及谁可以访问它们。

管理员可以在[管理仪表板][docs-aperture-dashboard-admin]的 **Administration** > **Configuration** 中，以 HuJSON 格式在 `/admin/settings/config` 编辑完整配置。如下方示例所示，HuJSON 接受注释和尾随逗号，标准 JSON 同样有效。可视化编辑器包括位于 `/admin/settings/providers` 的 **Providers** 和位于 `/admin/settings/grants` 的 **Grants**。

本主题属于 [Aperture 参考][docs-aperture-reference]文档。

> **注意：**
>
> 大多数配置任务请使用 **Administration** 下的可视化编辑器。本参考用于查看完整配置、自动化更新，或设置可视化编辑器未暴露的选项。

## 最小配置

典型设置至少包含一个带 base URL 的提供商和至少一个模型。如果只使用 MCP 服务器或连接器，可以省略提供商。保留或添加[角色与模型授权][docs-aperture-grant-model-access]，让用户能够访问模型。下面的示例只是一个仅含提供商的片段，请把它添加到当前配置中，而不是用它替换整个配置：

```json
{
  "providers": {
    "anthropic": {
      "baseurl": "https://api.anthropic.com",
      "apikey": "<anthropic-api-key>",
      "models": [
        "claude-sonnet-5-5",
        "claude-opus-5-5",
      ],
      "authorization": "x-api-key",
      "compatibility": {
        "anthropic_messages": true,
      }
    }
  }
}
```

省略 `apikey` 时 Aperture 仍会运行。大多数提供商需要 API 密钥认证，因此除非你的提供商以其他方式处理认证，否则请添加。

> **注意：**
>
> `apikey` 字段填的是提供商开发者平台发放的 API 密钥，这是认证提供商的标准方式。[Claude Pro 或 Claude Max][xt-anthropic-plans]、[ChatGPT Plus、Pro 或 Team][xt-openai-plans]、[Gemini Advanced][xt-gemini-plans] 等消费级和商业订阅套餐发放的是 OAuth token 而非 API 密钥，因此没有可填入该字段的密钥。要使用订阅套餐，请为提供商配置 `auth_mode: "passthrough"`，让每个客户端把自己的凭证转发给上游。更多信息参阅[设置 passthrough 模式][docs-use-passthrough-mode]。

## 默认配置

新建的 Aperture 网关包含托管 Aperture 提供商以及面向 Claude 和 ChatGPT 的订阅 passthrough 提供商。默认授权会让所有能访问网关的人获得管理员权限、全部模型的访问权限，以及 Aperture 内置系统工具的访问权限，直到你收紧授权为止。

以下配置展示出厂默认值。这些模型列表只是配置快照，不构成推荐，也不保证上游可用性。配置客户端和更新这些列表时，请参阅[订阅 passthrough 指南][docs-use-passthrough-mode]。

```json
{
  "providers": {
    "aperture": {},
    "anthropic-sub": {
      "name": "Anthropic (Subscription)",
      "apikey": "",
      "auth_mode": "passthrough",
      "authorization": "x-api-key",
      "baseurl": "https://api.anthropic.com",
      "compatibility": {"anthropic_messages": true},
      "models": [
        "claude-fable-5",
        "claude-haiku-4-5-20251001",
        "claude-haiku-4-5",
        "claude-opus-4-7",
        "claude-opus-4-8",
        "claude-opus-5",
        "claude-sonnet-4-6",
        "claude-sonnet-5"
      ]
    },
    "openai-sub": {
      "name": "OpenAI (Subscription)",
      "apikey": "",
      "auth_mode": "passthrough",
      "authorization": "bearer",
      "baseurl": "https://chatgpt.com/backend-api/codex",
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true
      },
      "models": [
        "gpt-5.5",
        "gpt-5.5-pro",
        "gpt-5.6-luna",
        "gpt-5.6-sol",
        "gpt-5.6-terra"
      ]
    }
  },
  "chat_models": [{"model": "**"}],
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [{"role": "admin"}]
      }
    },
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"role": "user", "models": "**"},
          {"connectors": ["label:system"]}
        ]
      }
    }
  ]
}
```

## 配置参考

下表描述顶层配置段及其各自控制的 Aperture 行为：

| 配置段 | 必填 | 描述 |
| --- | --- | --- |
| `providers` | 否 | LLM 提供商配置的映射。Tailscale 建议至少配置一个提供商或 MCP 服务器/连接器。 |
| `model_aliases` | 否 | 模型别名，把名称映射到 `provider/model` 目标。 |
| `grants` | 否 | 面向用户、模型和配额的访问控制策略。使用 Tailscale grant 结构。 |
| `quotas` | 否 | 基于美元金额的支出限额，采用令牌桶实现。 |
| `hooks` | 否 | webhook 端点配置。 |
| `exporters` | 否 | LLM 会话日志导出配置。支持 S3 兼容存储。 |
| `database` | 否 | 数据存储设置，包括抓包保留策略。 |
| `connectors` | 否 | 带认证的出站集成（MCP 服务器和 HTTP API）。 |
| `auto_cost_basis` | 否 | 布尔值（默认 `true`）。为 `true` 且未显式设置 `cost_basis` 时，Aperture 会从提供商 `baseurl` 识别 OpenRouter 和 Vercel AI Gateway，否则回退到提供商的兼容性标志。设为 `false` 可禁用推断的 token 费率估算。提供商自带的成本数据仍然可用。 |
| `flags` | 否 | 实验性功能标志。每个键是一个标志 ID，包含 `value` 布尔值。标志状态与校验行为参阅[标志参考][ar-flags-section]。 |
| `virtual` | 否 | 已弃用的模型别名语法。请改用 `model_aliases`。 |
| `mcp` | 否 | 已弃用的 MCP 服务器代理配置。请改用 `connectors`。 |
| `temp_grants` | 否 | 已弃用的访问控制语法。请改用 `grants`。 |

### `providers`

`providers` 段指定 Aperture 将请求路由到的 LLM 提供商。每个提供商由一个唯一的字符串键标识。基本结构如下例所示：

```json
{
  "providers": {
    "openai": { ... },
    "anthropic": { ... },
    "private": { ... }
  }
}
```

每个提供商配置接受以下字段：

| 字段 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `baseurl` | string | 是 | N/A | 提供商 API 的基础 URL。 |
| `models` | array | 是 | `[]` | 该提供商可用的模型 ID 列表。没有模型的提供商无法处理请求。 |
| `apikey` | string | 否 | `""` | 用于认证的 API 密钥。 |
| `authorization` | string | 否 | `"bearer"` | 授权头类型。 |
| `auth_mode` | string | 否 | `""`（覆盖） | 上游凭证的来源。取值为 `""`/`override`（注入配置的 `apikey`）、`passthrough`（转发客户端凭证，回退到 `apikey`）或 `none`（不发送凭证）。参阅 [`auth_mode`][ar-auth-mode]。 |
| `name` | string | 否 | `""` | 界面中显示的名称。 |
| `description` | string | 否 | `""` | 界面中显示的描述。 |
| `compatibility` | object | 否 | 启用 `openai_chat`，其余禁用 | API 兼容性标志。详情参阅[兼容性标志][docs-provider-flags]。 |
| `cost_basis` | string | 否 | 自动推断 | 覆盖用于成本估算的定价服务。有效取值参阅提供商配置参考中的 [cost basis][docs-aperture-provider-compatibility-cost-basis]。 |
| `preference` | int | 否 | `0` | 同一模型可由多个提供商提供时的路由优先级，值越高越优先。 |
| `disabled` | bool | 否 | `false` | 停用该提供商但不删除其配置。停用的提供商不参与路由，也不出现在 `/v1/models` 中。 |
| `add_headers` | array | 否 | `[]` | 为该提供商的每个上游请求添加的自定义头。每项格式为 `"Header-Name: value"`。Aperture 会在存储的抓包记录和 S3 导出中隐去这些头的值。 |
| `model_cost_map` | array | 否 | `[]` | 把未知模型名映射到已知模型用于计价。参阅[模型成本映射][docs-aperture-provider-compatibility-model-cost-map]。 |

\[Missing snippet: aperture\_provider\_auth\_note.mdx]

#### `auth_mode`

`auth_mode` 字段控制 Aperture 如何获取发送给上游提供商的凭证。它不影响路由、模型选择或授权头格式；该格式用 `authorization` 配置。`auth_mode` 的有效取值为：

| 取值 | 行为 |
| --- | --- |
| `""`（默认） | 每个请求都注入配置的 `apikey`。 |
| `override` | 默认项的显式形式。注入配置的 `apikey`。要求 `apikey` 非空，否则配置保存失败。 |
| `passthrough` | 将客户端自己的 `Authorization` 或 `x-api-key` 头原样转发给上游。仅当客户端未发送任何凭证时才回退到配置的 `apikey`。 |
| `none` | 剥除所有上游凭证，适用于不需要凭证的提供商。 |

未配置 `apikey` 的 `passthrough` 提供商是纯 passthrough 型，只处理携带客户端凭证的请求。其模型仍会出现在 `/v1/models` 端点中，但 Aperture 会在内置 chat UI 中隐藏它们，因为服务端发起的 chat 请求不携带客户端凭证。如果希望这些模型出现在 chat UI 中，请配置一个回退用的 `apikey`。

包括使用订阅套餐 OAuth token 在内的完整流程，参阅[设置 passthrough 模式][docs-use-passthrough-mode]。

#### Aperture 如何构造上游 URL

Aperture 会把完整的入站请求路径追加到提供商的 `baseurl` 后面来构造上游 URL。例如，`baseurl` 为 `https://api.openai.com` 且客户端发送 `POST /v1/chat/completions` 时，上游 URL 是 `https://api.openai.com/v1/chat/completions`。

把 `baseurl` 设为提供商 API 的根地址。`/v1` 段属于请求路径，不属于 `baseurl`。Aperture 在追加路径前不会从 `baseurl` 中剥掉 `/v1`。

> **警告：**
>
> 如果 `baseurl` 包含 `/v1`，上游 URL 就会出现 `/v1/v1/...`。重复的路径可能导致上游提供商返回 HTTP 405。解决步骤参阅[排查 HTTP 405 错误][docs-aperture-troubleshoot-405]。

**例外**：Amazon Bedrock 请求在转发前会剥掉 `/bedrock` 前缀；Gemini Enterprise Agent Platform 请求路径中的自动填充占位符会被替换；其余所有提供商收到的入站路径保持原样。

每个受支持提供商的正确 `baseurl`，参阅[提供商矩阵][docs-provider-matrix]。

#### 模型名称

Aperture 把提供商 `models` 列表中的每一项注册为字面模型 ID，不会展开其中的通配符，也不会验证上游提供商是否真的提供该 ID。请使用该提供商支持的 ID 或别名，并在[授权][ar-grants]中用 glob 模式控制对已配置模型的访问。

有效的模型 ID 参阅提供商文档（例如 [Anthropic 模型][xt-anthropic-models]或 [OpenAI 模型][xt-openai-models]）以及 Aperture 的[提供商设置指南][docs-aperture-set-up-providers]。

模型别名的目标要求提供商的 `models` 数组中有显式的模型 ID，即使通配符能覆盖它们。参阅[模型别名目标要求][docs-model-alias-destination-requirements]。

#### 授权类型

不同提供商要求的授权头格式不同。`authorization` 字段支持 `bearer`（默认，OpenAI 和大多数提供商使用）、`x-api-key`（Anthropic）和 `x-goog-api-key`（Google Gemini）。完整的授权类型表和各提供商细节，参阅[授权类型][docs-provider-authorization]。

#### 提供商兼容性

`compatibility` 对象指定提供商支持哪些 API 格式，以及 Aperture 为该提供商的模型暴露哪些端点。标志包括 `openai_chat`、`openai_responses`、`anthropic_messages`、`gemini_generate_content`、`bedrock_model_invoke` 等。`openai_chat` 标志默认启用；如果你启用了其他标志但没有显式设置 `openai_chat`，Aperture 会将其清空。完整表格参阅[兼容性标志][docs-provider-flags]。各提供商的 API 格式和设置链接，参阅[提供商矩阵][docs-provider-matrix]。

#### 提供商示例

每个受支持提供商（OpenAI、Anthropic、Google Gemini、Gemini Enterprise Agent Platform、Amazon Bedrock、OpenRouter、自托管 LLM 和 [OpenAI 兼容提供商][docs-aperture-openai-compatible-provider]）的完整配置示例，参阅[提供商设置指南][docs-aperture-set-up-providers]。

### 定价与成本估算

Aperture 会估算每个 LLM 请求的美元成本，用于配额扣减、hook 元数据以及管理仪表板中的按模型定价。可以用提供商的 `cost_basis` 和 `model_cost_map` 字段覆盖推断出的定价。受支持的定价来源参阅 [cost basis][docs-aperture-provider-compatibility-cost-basis]，映射语法参阅[模型成本映射][docs-aperture-provider-compatibility-model-cost-map]。

Aperture 在多处展示成本数据：

* **Models**（`/admin/models`）：每个模型显示每百万 token 的定价（输入/输出），悬停提示中还包含缓存、推理、图片和网络搜索费率。
* **Usage Overview**（`/admin/adoption`）：CSV 按钮可导出组织范围的用量数据，包括按模型、用户和日期统计的 token 数。
* **Hooks**：在 hook 的 `send` 数组中加入 `"estimated_cost"`，即可在每次 hook 调用时收到美元成本、定价依据和 token 用量。详情参阅 [hook 发送类型][ar-hook-send-types]。

### `model_aliases`

`model_aliases` 段把稳定的客户端模型名映射到已配置的 provider/model 目标，默认选择策略是 `first`。省略或留空该段时，除非由已弃用的 `virtual` 回退提供，否则不定义任何别名。字段、默认值和示例参阅[模型别名配置 schema][docs-model-alias-schema]。

### `grants`

`grants` 段指定访问控制策略，决定哪些用户可以访问哪些模型、触发哪些 hook、应用哪些配额。授权使用 [Tailscale grant 结构][docs-tailscale-grants]，能力限定在 `"tailscale.com/cap/aperture"` 下。Aperture 默认拒绝：没有匹配授权的用户无法访问任何模型。

配置访问的分步说明参阅[授予模型访问权限][docs-aperture-grant-model-access]、[授予 MCP 工具访问权限][docs-aperture-grant-mcp-tool-access]和[设置管理员访问权限][docs-aperture-set-up-admin-access]。

> **注意：**
>
> `grants` 段以新结构取代了已弃用的 `temp_grants` 语法。`temp_grants` 语法仍然可用，但 Tailscale 不建议在新配置中使用。

在 `/admin/settings/grants` 的 **Administration** > **Grants** 或 `/admin/settings/config` 的 **Configuration** 编辑器中配置授权。

通过 API 更新授权：

1. 调用 `GET http://<aperture-hostname>/api/config` 获取完整配置及其哈希。
2. 修改返回的配置。
3. 向 `PUT http://<aperture-hostname>/api/config` 发送一个 JSON 对象：`config` 设为完整的 HuJSON 配置字符串，`hash` 设为原哈希。这会替换整个配置。

#### 基本结构

一条授权指定一个来源（`src`）和一组 app 能力：

```json
"grants": [
  {
    "src": ["*"],               // who this grant applies to
    "app": {
      "tailscale.com/cap/aperture": [
        // array of individual capabilities
        { "models": "**" },     // allow access to all models
      ],
    },
  },
]
```

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

#### 来源匹配（`src`）

`src` 字段决定授权适用于哪些用户：

* `"*"`：匹配所有人。
* `"alice@example.com"`：匹配特定的 Tailscale 登录名。
* `"group:engineering"`：匹配 Tailscale 组或 SCIM 组的成员。要求为 Aperture 网关启用[可见组][docs-aperture-visible-groups]。
* `"engineering@example.com"`：匹配 SCIM 组的成员（按邮箱）。要求为 Aperture 网关启用[可见组][docs-aperture-visible-groups]。
* `"tag:ci-runner"`：匹配带标签的设备。

#### 模型访问

每个 `models` 字段接受一个 `provider/model` 格式的 glob 模式字符串。要授予多个特定模型的访问权限，请为每个模型使用单独的能力条目。不要在 `models` 字段中使用数组。

对于[模型别名][docs-aperture-model-aliases]，Aperture 将 `models` 与目标匹配，而不是与别名匹配。以下示例展示模型访问模式：

| 模式 | 匹配范围 |
| --- | --- |
| `"**"` | 所有提供商的所有模型 |
| `"anthropic/**"` | 所有 Anthropic 模型 |
| `"openai/gpt-5.5"` | 精确匹配 `openai/gpt-5.5` |
| `"*/claude-sonnet*"` | 任一单个提供商下的任意 `claude-sonnet*` 模型 |
| `"aperture-*/**"` | 名称以 `aperture-` 开头的提供商提供的任意模型 |

`*` 匹配单个路径段内的任意字符（不跨越 `/`）。`**` 匹配零个或多个段。

没有 `models` 字段的授权是“浮动”授权，即全局生效（适用于与模型无关的 hook 和配额）。

#### 角色分配

角色决定用户的权限级别：

```json
{ "role": "admin" }   // full admin access
{ "role": "user" }    // standard user access
```

角色授权控制管理权限。`admin` 角色可以访问管理仪表板和组织范围的数据。chat 门户默认对已认证的 tailnet 用户开放，除非匹配的授权把 `enable_portal` 设为 `false`。如果多条角色授权都匹配同一用户，`admin` 角色优先。

#### 连接器访问

\[Missing snippet: aperture\_mcp\_grant\_deprecation\_note.mdx]

用 `connectors` 字段授予连接器访问权限。该字段接受 `"connectorID/category/resource"` 格式的完全限定名（FQN）glob 模式数组，以及按标签匹配连接器的 `label:<name>` 模式：

```json
{
  "connectors": ["label:system"],         // every connector labeled "system" (the shipped default)
}
```

更具体的模式：

```json
{
  "connectors": [
    "github/proxy",        // proxy access to the "github" HTTP connector
    "docs/tools/*",        // all tools from the "docs" MCP connector
    "snowflake/**",        // everything from "snowflake"
    "aperture/**",         // everything from the built-in "aperture" connector, by ID
    "label:sales",         // every connector labeled "sales", at every category
  ],
}
```

`connectors` 字段使用与 `models` 相同的 `*` / `**` glob 语法。`category` 段是 `tools`、`resources`、`templates`（MCP 连接器）或 `proxy`（HTTP 连接器）之一。类别无法识别的模式永远不会匹配，也不会授予任何访问权限。各类别的细分参阅[连接器参考][docs-aperture-connectors-reference]。

`label:<name>` 模式按精确匹配而非 glob 展开，一旦匹配即授予该连接器所有类别和资源的访问权限。标签与其他授权一样是叠加的，只会扩大访问而不会限制访问。标签语法、保留标签 `system` 和 `system_labels` 字段，参阅[连接器标签][docs-aperture-connectors-labels]和[按标签授予连接器访问权限][docs-aperture-grant-by-label]。

> **注意：**
>
> `mcp_tools`、`mcp_resources` 和 `mcp_templates` 字段已弃用。为向后兼容它们仍然可用，但新配置应改用 `connectors` 字段。

#### 更多能力字段

`tailscale.com/cap/aperture` 数组中的每个能力对象还可以包含以下字段：

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `connectors` | `[]string` | 用于连接器访问的 FQN glob 模式数组（例如 `["aperture/**"]`、`["github/proxy"]`）。使用与 `models` 相同的 `*` / `**` glob 语法。也接受 `label:<name>` 模式，按[标签][docs-aperture-connectors-labels]匹配连接器，比较方式为精确匹配而非 glob 展开。 |
| `add_headers` | array | 该授权匹配时附加到上游请求前的自定义头。每项格式为 `"Header-Name: value"`。Aperture 会在存储的抓包记录和 S3 导出中隐去这些头的值。 |
| `filterable_headers` | array | `database.headers.filterable` 中已索引的头名称，匹配用户可在支持的管理仪表板页面上将其用作筛选条件。用 `["*"]` 授予所有已配置的可筛选头。管理员也需要此授权。可在 **Administration** > **Reporting**（`/admin/settings/reporting`）的 **Header filter grants** 下编辑。 |
| `enable_portal` | bool | 控制 web 门户访问。默认开放。对某条授权设为 `false` 即可为其禁用。显式 `true` 优先于更大范围的禁用，且管理员始终保留门户访问。 |
| `enable_chat_ui` | bool | `enable_portal` 的旧名称。现有配置继续有效，但新配置应使用 `enable_portal`。 |
| `read_metrics` | bool | 授予对 `/metrics` Prometheus 端点的访问权限。 |
| `set_cors` | bool | 为该授权启用 CORS 响应头注入。要求 `cors_paths` 列表非空。 |
| `cors_paths` | array | 激活 CORS 头的 URL 路径 glob 模式（例如 `["/v1/**", "/bedrock/**"]`）。使用与 `models` 相同的 glob 语法，但作用于 URL 路径。列表为空时即使 `set_cors` 为 `true` 也会禁用 CORS。 |
| `Access-Control-Allow-Origin` | string | `Access-Control-Allow-Origin` 响应头的值。 |
| `Access-Control-Allow-Methods` | string | `Access-Control-Allow-Methods` 响应头的值。 |
| `Access-Control-Allow-Headers` | string | `Access-Control-Allow-Headers` 响应头的值。 |

#### CORS 头

CORS 头注入让基于浏览器的客户端可以直接访问 Aperture 的 LLM 端点。CORS 按授权逐条配置，因此不同用户可以有不同的 CORS 策略，也可以没有。CORS 不会授予模型访问权限；用户仍然需要 `models` 授权，可以在同一条授权里，也可以在另一条里。

只有同时配置了 `set_cors: true` 和非空的 `cors_paths` 列表时，Aperture 才会设置 CORS 头。`cors_paths` 字段使用与 `models` 相同的 glob 语法，但匹配必须以 `/` 开头的 URL 路径。当 CORS 授权匹配时，Aperture 会自动对 `OPTIONS` 预检请求返回带已配置头的 `200 OK`。

```json
{
  "src": ["browser-app@example.com"],
  "app": {
    "tailscale.com/cap/aperture": [
      {
        "set_cors": true,
        "cors_paths": ["/v1/**", "/bedrock/**"],
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    ]
  }
}
```

> **警告：**
>
> 使用 `Access-Control-Allow-Origin: *` 会让任何网站都能代表匹配用户向 Aperture 发起请求。请尽可能把 origin 限制到特定域名（例如 `"https://app.example.com"`）。

#### 自定义 app 能力

授权可以包含 `tailscale.com/cap/aperture` 之外的能力键。当你在 `send` 类型中加入 `"grants"` 时，Aperture 会把这些能力传递给 hook：

```json
{
  "src": ["admin@example.com"],
  "app": {
    "tailscale.com/cap/aperture": [
      { "role": "admin" },
      { "models": "**" },
    ],
    // Custom capability: forwarded to hooks via "grants" send type
    "mycompany.com/cap/policy": [
      { "tier": "enterprise", "department": "engineering" },
    ],
  },
},
```

hook 的 `send` 数组包含 `"grants"` 时，这些自定义能力会出现在 hook 元数据中。外部系统可以利用这些能力做授权决策。

### `quotas`

`quotas` 段指定基于美元金额的支出限额，采用令牌桶实现。每个桶有容量（最大余额）和补充速率。当请求的预估成本会把某个桶压到零以下时，Aperture 以 HTTP 429 拒绝该请求。

分步说明参阅[设置每用户支出限额][docs-aperture-set-per-user-spending-limits]和[设置团队预算][docs-aperture-set-team-budget]。检查和补充预算参阅[检查并补充预算][docs-aperture-monitor-quota-balances]。

```json
"quotas": {
  // Per-user daily budget: refills $5/day, can burst up to $10
  "daily:<user>": {
    "capacity": "$10.00",
    "rate": "$5.00/day",
    "on_exceed": "reject",
  },

  // Shared pool across all users who reference it
  "eng-team-pool": {
    "capacity": "$100.00",
    "rate": "$100.00/day",
    "on_exceed": "reject",
  },

  // Per-user limit for expensive models
  "opus:<user>": {
    "capacity": "$5.00",
    "rate": "$2.50/day",
    "on_exceed": "reject",
  },
}
```

每个配额接受以下字段：

| 字段 | 格式 | 描述 |
| --- | --- | --- |
| `capacity` | `"$<amount>"` | 桶可持有的最大余额（必须大于零），也是新桶的初始余额。 |
| `rate` | `"$<amount>/<unit>"` | 桶的补充速度。单位：`min`、`hour`、`day`、`week`、`month`（30 天）。 |
| `on_exceed` | `"reject"` | 请求会把桶压到零以下时执行的动作。支持的取值是 `"reject"`（HTTP 429）。 |

配额配置使用美元字符串（例如 `"$10.00"`）。[Hook 载荷][ar-hooks]以纳美元表示同样的值（1 美元 = 1,000,000,000 纳美元）。

#### 模板变量

配额名称可以包含在请求时展开的模板变量：

| 模板 | 展开为 | 示例 |
| --- | --- | --- |
| `<user>` | 调用者的 Tailscale 登录名或标签组合 | `daily:<user>` 展开为 `daily:alice@example.com` |
| `<node>` | 调用者的节点 ID（每个节点有独立配额，即使节点共享同一用户或标签） | `device:<node>` 展开为 `device:n8f3a2c9d1CNTRL` |

不含模板变量的配额（例如 `eng-team-pool`）创建单个共享桶。

#### 将配额挂到授权上

`quotas` 中定义的配额只有在授权引用它时才生效。当请求匹配某条授权时，Aperture 会同时对该授权列出的所有配额计费：

```json
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        {
          "models": "**",
          "quotas": [
            {"bucket": "daily:<user>"},
            {"bucket": "eng-team-pool"},
          ],
        },
      ],
    },
  },
]
```

#### 多个配额如何相互作用

当一条授权引用多个配额桶时，所有桶都必须有正余额，请求才能继续。任何一个桶耗尽，Aperture 都会拒绝该请求，即使其他桶还有余额。

响应完成后，Aperture 会同时从每个被引用的桶中扣除预估成本。

一个请求可以匹配多条授权，每条授权有自己的配额。Aperture 会把所有匹配的配额合并起来一起执行。

要让桶按顺序而非并行扣费，请使用透支（overdraft）。

#### 透支（overdraft）

透支把配额桶串成链，当主桶耗尽时请求会回退到其他桶。在授权中的配额条目上添加 `overdrafts` 列表，按顺序列出要借用的桶。透支配置在授权条目上，而不是桶定义上，因此同一个桶可以是一些用户的主配额，同时是另一些用户的溢出目标。

```json
"grants": [
  {
    "src": ["group:eng"],
    "app": {
      "tailscale.com/cap/aperture": [
        {
          "models": "**",
          "quotas": [
            {"bucket": "daily:<user>", "overdrafts": ["eng-team-pool"]},
          ],
        },
      ],
    },
  },
]
```

请求先从主桶扣，再按顺序从每个溢出桶扣。单个请求可以拆分到多个桶：如果主桶还剩 $0.50 而请求花费 $2.00，Aperture 会从主桶扣 $0.50、从下一个桶扣 $1.50。链上最后一个桶可以透支为负来覆盖请求。当整条链的合并余额达到零或以下时，Aperture 会拒绝请求，直到补充使余额恢复。只有整条链都无法覆盖请求成本时，Aperture 才会拒绝该请求。

引用了未定义桶的溢出目标会被跳过，也不会让主桶的约束变严。

当多条授权为同一个主桶提供透支时，Aperture 会把它们合并成一个确定的顺序，并保留每条授权内部的顺序。这个合并后的顺序难以预测，因此必须按特定顺序运行的透支应放在同一条授权里。如果各授权对顺序的约定相互矛盾——一条授权把某个桶排在另一个前面，另一条却相反——保存配置时 Aperture 会拒绝并返回 HTTP 400。

仅作为溢出目标被引用的桶被归类为“仅透支”，显示在配额用量视图的单独区域。分步设置与故障排查参阅[配置透支配额][docs-aperture-configure-overdrafts]。

#### 桶的生命周期

Aperture 会持久化配额桶余额。更新配额定义（例如修改容量或补充速率）时，Aperture 会调整现有余额以匹配新设置，并把每个余额封顶到新容量。从配置中删除某个配额定义后，Aperture 会移除对应的桶。

> **注意：**
>
> 如果调低某个桶的 `capacity`，Aperture 会把高于新容量的现有余额封顶到新值，超出部分无法找回。

#### 配额示例

以下示例展示常见的配额配置。

##### 每用户配额

每个用户都有自己的桶，容量和补充速率相互独立：

```json
"quotas": {
  "daily:<user>": {
    "capacity": "$10.00",
    "rate": "$5.00/day",
    "on_exceed": "reject",
  },
},
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "user" },
        { "models": "**",
          "quotas": [{"bucket": "daily:<user>"}] },
      ],
    },
  },
]
```

这会为每个用户创建一个独立的桶（例如 `daily:alice@example.com`、`daily:bob@example.com`），每个桶容量为 $10，补充速率为每天 $5。

##### 限定特定模型的配额

仅当请求针对特定模型时才应用配额：

```json
"quotas": {
  "opus:<user>": {
    "capacity": "$5.00",
    "rate": "$2.50/day",
    "on_exceed": "reject",
  },
},
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        // General access, no quota
        { "models": "**" },
        // Additional quota for Opus models only
        {
          "models": "*/claude-opus*",
          "quotas": [{"bucket": "opus:<user>"}],
        },
      ],
    },
  },
]
```

`opus:<user>` 配额只在请求针对 Opus 模型时生效。其他模型不计费。

##### 合并每用户与共享配额

让每个请求同时扣减个人预算和共享团队池：

```json
"quotas": {
  "daily:<user>": {
    "capacity": "$10.00",
    "rate": "$5.00/day",
    "on_exceed": "reject",
  },
  "team-monthly": {
    "capacity": "$500.00",
    "rate": "$500.00/month",
    "on_exceed": "reject",
  },
},
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "user" },
        {
          "models": "**",
          "quotas": [
            {"bucket": "daily:<user>"},
            {"bucket": "team-monthly"},
          ],
        },
      ],
    },
  },
]
```

在这个例子中，每个请求都会同时从用户的每日桶和共享的 team-monthly 桶扣减。任何一个桶耗尽，Aperture 都会阻止该用户。

### `hooks`

`hooks` 段指定条件匹配时 Aperture 会调用的 webhook 端点。每个 hook 由唯一的字符串键标识，授权通过该键引用。分步设置参阅[构建自定义 webhook][docs-aperture-build-custom-webhook]。具体集成指南参阅[将 Oso 与 Aperture 集成][docs-aperture-integrate-oso]或[将 Cerbos 与 Aperture 集成][docs-aperture-integrate-cerbos]。

以下示例展示 hooks 配置：

```json
{
  "hooks": {
    "oso": {
      "url": "https://api.osohq.com/api/agents/v1/model-request",
      "apikey": "<oso-api-key>",
      "timeout": "10s"
    },
    "my-webhook": {
      "url": "https://example.com/webhook",
      "apikey": "<api-key>"
    }
  }
}
```

每个 hook 配置接受以下字段：

| 字段 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `url` | string | 是 | N/A | 用于 POST hook 数据的 HTTP 或 HTTPS 端点。 |
| `apikey` | string | 否 | `""` | Aperture 按 `authorization` 指定的方式发送给 hook 端点的 API 密钥。 |
| `authorization` | string | 否 | `"bearer"` | Aperture 发送 API 密钥的方式。支持与提供商授权相同的取值：`bearer`、`x-api-key`、`x-goog-api-key`、`hec`、`cf-aig-authorization`。 |
| `timeout` | string | 否 | `"5s"` | 等待 hook 响应的最长时间。 |
| `disabled` | boolean | 否 | `false` | Aperture 本要调用该 hook 时跳过它。适用于临时禁用 hook 而不删除其配置。 |
| `fail_policy` | string | 否 | `"fail_open"` | hook 不可达或返回错误时的行为。`fail_open` 放行请求；`fail_closed` 阻止请求。仅适用于 `pre_request` hook。 |
| `preference` | int | 否 | `0` | 多个 hook 叠加时的执行优先级，值高者先运行。优先级相同的 hook 按键名的字母顺序运行。与提供商级的 `preference` 字段无关。 |

`timeout` 字段接受 Go 时长字符串，例如 `5s`、`30s` 或 `1m`。设为 `0` 可禁用超时。

`grants` 段中的 `send_hooks` 条目触发 hook。在授权引用之前，此处指定的 hook 不会有任何动作。

### Hook 授权

要触发 hook，在 `grants` 段的某个能力中加入 `send_hooks` 条目。Hook 授权指定哪些请求触发 hook，以及发送哪些数据。

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {
            "models": "**",
            "send_hooks": [
              {
                "name": "oso",
                "events": ["tool_call_entire_request"],
                "send": ["tools", "user_message", "request_body", "response_body"],
              },
            ],
          },
        ],
      },
    },
  ]
}
```

每个 `send_hooks` 条目包含以下字段：

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `name` | string | 引用顶层 `hooks` 段中某个 hook 的键。 |
| `events` | array | 触发该 hook 的事件类型。 |
| `send` | array | 要包含在 hook 载荷中的数据类型列表。 |

#### Hook 事件

| 事件 | 描述 |
| --- | --- |
| `pre_request` | 在调用提供商之前触发。同步：Aperture 等待 hook 响应。hook 可以放行、阻止或修改请求。 |
| `entire_request` | 每个完成的请求都会触发。异步：不影响请求或响应。 |
| `tool_call_entire_request` | 响应完成后，若响应中任一消息包含工具调用则触发一次。异步：不影响请求或响应。 |

#### Hook 发送类型

`send` 数组指定发送给 hook 端点的 POST 载荷包含哪些数据：

| 字段 | 描述 |
| --- | --- |
| `tools` | 从响应中提取的工具调用数组。 |
| `request_body` | 发送给 LLM 的原始请求体。 |
| `user_message` | 请求中用户的消息。 |
| `response_body` | 重建的响应体 JSON。 |
| `raw_responses` | 原始 SSE 消息数组（流式时）或单个响应对象。 |
| `estimated_cost` | 美元成本估算、定价依据和 token 用量明细。 |
| `grants` | 用户授权中非 Aperture 的 app 能力（自定义能力）。 |
| `quotas` | 适用于该请求的所有配额桶的当前状态。 |

#### `estimated_cost`

包含美元成本估算、所用定价依据和 token 用量明细。这些字段出现在 hook 载荷的 `metadata` 对象中：

```json
{
  "models": "**",
  "send_hooks": [
    {
      "name": "audit",
      "events": ["tool_call_entire_request"],
      "send": ["tools", "estimated_cost"],
    },
  ],
}
```

hook 在 `metadata` 中收到成本数据。`cost_basis` 标识定价查询条目。下面的金额和 token 数仅用于说明载荷结构，并非实际报价：

```json
{
  "metadata": {
    "login_name": "user@example.com",
    "...": "...",
    "estimated_cost": {
      "dollars": 0.0342,
      "cost_basis": "anthropic/claude-sonnet-4-6",
      "usage": {
        "input_tokens": 1500,
        "output_tokens": 800,
        "cached_tokens": 200,
        "reasoning_tokens": 0
      }
    }
  },
  "tool_calls": [...]
}
```

#### `grants`

包含用户授权中所有非 Aperture 的 app 能力。这使外部系统（策略引擎、审计日志）能够访问附着在用户身上的自定义能力。`grants` 数据出现在 `metadata` 对象中：

```json
{
  "src": ["alice@example.com"],
  "app": {
    "tailscale.com/cap/aperture": [
      { "models": "**" },
      {
        "send_hooks": [
          {
            "name": "policy-engine",
            "events": ["entire_request"],
            "send": ["estimated_cost", "grants"],
          },
        ],
      },
    ],
    "mycompany.com/cap/policy": [
      {"tier": "enterprise", "max_context": 200000},
    ],
  },
}
```

hook 在 `metadata` 中收到自定义能力：

```json
{
  "metadata": {
    "login_name": "alice@example.com",
    "...": "...",
    "grants": {
      "mycompany.com/cap/policy": [
        {"tier": "enterprise", "max_context": 200000}
      ]
    },
    "estimated_cost": { "..." }
  }
}
```

#### `quotas`

包含适用于该请求的所有配额桶的当前状态。`quotas` 数据出现在 `metadata` 对象中：

```json
"send": ["tools", "quotas"]
```

hook 在 `metadata` 中收到桶状态：

```json
{
  "metadata": {
    "login_name": "alice@example.com",
    "...": "...",
    "quotas": {
      "daily:alice@example.com": {
        "current": 7250000000,
        "capacity": 10000000000,
        "rate": "$5.00/day"
      }
    }
  }
}
```

`current` 和 `capacity` 的值以纳美元表示（1 美元 = 1,000,000,000 纳美元）。

每次 hook 调用都会自动附带包含请求上下文的 `metadata` 对象：

```json
{
  "metadata": {
    "login_name": "user@example.com",
    "user_agent": "curl/8.0",
    "url": "/v1/chat/completions",
    "model": "gpt-5.5",
    "provider": "openai",
    "tailnet_name": "example.com",
    "stable_node_id": "n12345",
    "request_id": "abc123",
    "session_id": "oacc_1a2b3c4d5e6f7890"
  }
}
```

#### Hook 授权示例

以下示例把工具调用数据和成本估算发送给审计服务，覆盖来自特定用户的所有请求：

```json
{
  "grants": [
    {
      "src": ["developer@company.com"],
      "app": {
        "tailscale.com/cap/aperture": [
          {
            "models": "anthropic/**",
            "send_hooks": [
              {
                "name": "my-webhook",
                "events": ["tool_call_entire_request"],
                "send": ["tools", "user_message", "estimated_cost"],
              },
            ],
          },
          {
            "models": "openai/**",
            "send_hooks": [
              {
                "name": "my-webhook",
                "events": ["tool_call_entire_request"],
                "send": ["tools", "user_message", "estimated_cost"],
              },
            ],
          },
        ],
      },
    },
  ]
}
```

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

#### Hook 响应格式

对 `pre_request` hook，hook 端点必须返回一个 JSON 响应，告知 Aperture 如何处理该请求。异步 hook（`entire_request`、`tool_call_entire_request`）会忽略响应体，任何有效 JSON（包括 `{}`）即可。

响应包含以下字段：

| 字段 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `action` | string | 是 | N/A | 如何处理请求。有效取值：`allow`、`block`、`modify`。 |
| `status_code` | int | 否 | `403` | 返回给客户端的 HTTP 状态码。仅适用于 `block`。 |
| `message` | string | 否 | `"request blocked by guardrail"` | 返回给客户端的错误消息。仅适用于 `block`。 |
| `request_body` | object | `modify` 时必填 | N/A | 转发给提供商的替换请求体。 |

三种动作：

* **`allow`**：请求原样继续。Aperture 忽略其他字段。
* **`block`**：Aperture 拒绝请求，不转发给提供商。客户端收到符合相应 API 格式、带 `status_code` 和 `message` 的错误响应。
* **`modify`**：Aperture 用 hook 响应中的 `request_body` 替换转发的请求体，然后继续发给提供商。`request_body` 必须是 JSON 对象；如果 hook 返回非对象，Aperture 把响应当作 `allow` 处理。

hook 阻止请求时，客户端会收到与原始请求 API 格式匹配的错误信封：

| API 格式 | 错误信封 |
| --- | --- |
| OpenAI Chat / Responses | `{"error": {"message": "...", "type": "guardrail_blocked"}}` |
| Anthropic Messages | `{"type": "error", "error": {"type": "invalid_request_error", "message": "..."}}` |
| Gemini API / Gemini Enterprise Agent Platform | `{"error": {"code": ..., "message": "...", "status": "PERMISSION_DENIED"}}` |
| Bedrock Invoke/Converse | 头为 `x-amzn-ErrorType: AccessDeniedException`，体为 `{"message": "..."}` |

#### Hook 链

当多个 `pre_request` hook 匹配同一请求时，Aperture 按以下顺序逐个调用。

**排序**：`preference` 值较高的 hook 先运行。例如 `preference: 10` 先于默认的 `preference: 0` 运行。优先级相同的 hook 按键名字母顺序运行：`audit-a` 先于 `audit-z`。

**链式执行**：

* **`allow`** 是空操作，链继续把当前请求体交给下一个 hook。
* **`modify`** 原地改写请求体，链中下一个 hook 收到的是改写后的请求体，而不是原始请求体。
* **`block`** 立即终止链，链中后面的 hook 不会运行，客户端收到阻止响应。

如果某个 hook 修改了请求而后续某个 hook 阻止了它，Aperture 不会把修改后的请求转发给提供商。阻止的 hook 收到的是修改后的请求体。要让阻止型 hook 在其他 hook 修改请求体之前先行决策，请给它更高的 `preference`，让它先运行。

**失败处理**：`pre_request` hook 失败（不可达、超时、非 2xx 响应或响应体无法解析）时，由 hook 定义上的 `fail_policy` 决定后续行为。`fail_open` 继续链中的下一个 hook；`fail_closed` 以 HTTP 503 阻止请求，后续 hook 不再运行。异步 hook 始终 fail open：hook 出错时请求仍然继续。

### `exporters`

`exporters` 段配置把 LLM 会话日志定期导出到外部存储。Aperture 支持导出到 S3 兼容存储，例如 Amazon S3 和 Google Cloud Storage。分步设置参阅[将用量数据导出到 S3][docs-aperture-export-s3]。

以下示例展示 exporters 配置：

```json
{
  "exporters": {
    "s3": {
      "endpoint": "https://your-s3-compatible-endpoint.url",
      "bucket_name": "aperture-exports",
      "region": "us-east-1",
      "prefix": "prod",
      "access_key_id": "<aws-access-key-id>",
      "access_secret": "<aws-secret-access-key>",
      "every": 3600,
      "limit": 1000
    }
  }
}
```

把 `bucket_name` 设为非空值即启用 S3 导出器。每个 S3 导出器配置接受以下字段：

| 字段 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `endpoint` | string | 否 | `""` | S3 兼容 API 的 HTTP 端点。GCS 等非 AWS 服务必填。Amazon S3 可省略，Aperture 会根据 `region` 推断端点。 |
| `bucket_name` | string | 条件必填 | `null` | 上传导出内容的目标 S3 桶名称。设为非空值即启用 S3 导出器。 |
| `region` | string | 否 | `"us-east-1"` | 桶所在的 AWS 区域。即使是非 AWS 端点也必填，因为 AWS SDK 会校验该字段。 |
| `prefix` | string | 否 | `""` | 新建 S3 对象的路径前缀。不得以 `/` 结尾。 |
| `access_key_id` | string | 条件必填 | `null` | 用于认证的 AWS 访问密钥 ID。设置 `bucket_name` 且使用静态凭证时必填且不能为空。 |
| `access_secret` | string | 条件必填 | `null` | 与 `access_key_id` 配合认证的私有密钥。设置 `access_key_id` 时必填且不能为空。 |
| `every` | int | 否 | `3600` | 距上次导出后等待多少秒再开始下一次导出。默认为一小时。 |
| `limit` | int | 否 | `1000` | 每次导出的最大记录数。Aperture 会把该值封顶为 `10000`，超出时静默调低且不发出警告。 |

### `connectors`

`connectors` 段配置出站集成，包括带认证的 MCP 服务器和 HTTP API 代理。连接器取代了已弃用的 `mcp.servers` 语法，并新增对认证连接和多种协议的支持。

\[Missing snippet: aperture\_mcp\_grant\_deprecation\_note.mdx]

> **注意：**
>
> 连接器始终可用，先前的功能标志 `connectors` 已弃用。为向后兼容 Aperture 仍会接受它，但已不产生任何效果，可以从配置中移除。

```json
{
  "connectors": {
    "servers": {
      "tailnetMCP": {
        "protocol": "mcp",
        "url": "http://mcp-server.example.ts.net:8080/v1/mcp"
      },
      "github": {
        "protocol": "http",
        "url": "https://api.github.com",
        "description": "GitHub REST API (read-only)",
        "auth": {
          "type": "bearer_token",
          "secret": "github_pat_example"
        }
      }
    }
  }
}
```

#### `connectors` 字段

| 字段 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `servers` | map | `{}` | 连接器 ID 到服务器配置的映射。映射键是连接器 ID，会成为工具（`connectorID_toolname`）、资源（`connectorID-uri`）和资源模板（`connectorID-uriTemplate`）的名称前缀。 |

#### `servers` 字段

`servers` 映射中的每一项接受以下字段：

| 字段 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `protocol` | string | 是 | N/A | Aperture 与上游通信的方式。取值为 `"mcp"` 或 `"http"`。 |
| `url` | string | 否 | N/A | 上游服务器的端点 URL。缺少 `url` 时 Aperture 会发出警告，但仍会加载配置。 |
| `provider` | string | 否 | `"Custom"` | 提供商标识。使用注册表中的经验证连接器时自动设置（例如 `"Salesforce"`、`"Atlassian"`、`"Slack"`）。决定连接器在管理仪表板中归入“verified”还是“custom”类别。 |
| `description` | string | 否 | `""` | Aperture 界面中显示的人类可读标签。对已授权的 HTTP 连接器，`aperture_list_connectors` 也会把它返回给有权限的用户。 |
| `context` | string 或 JSON | 否 | N/A | 连接器的提示或上下文信息。接受纯字符串或任意 JSON 对象。对已授权的 HTTP 连接器，`aperture_list_connectors` 会把它返回给有权限的用户。 |
| `labels` | 字符串数组 | 否 | `[]` | 用于给连接器分组以控制访问的扁平标签。授权模式 `label:<name>` 会匹配携带该标签的每个连接器。每个标签必须匹配 `[a-zA-Z0-9][a-zA-Z0-9._-]*`。标签 `system` 为内置连接器保留，会从用户连接器上剥除。 |
| `auth` | object | 否 | N/A | 认证配置。由 `type` 字段分发。 |

`connectors` 段还接受 `system_labels` 映射，用于替换内置连接器上的默认标签（例如 `{"aperture": ["system", "public"]}`）。参阅[连接器标签][docs-aperture-connectors-labels]。

#### 连接器 ID 规则

连接器 ID 必须匹配模式 `[a-zA-Z][a-zA-Z0-9]*`（仅字母和数字，以字母开头）。连接器 ID 不能包含下划线或连字符，因为 MCP 传输格式把它们保留为分隔符：下划线分隔连接器 ID 与工具名（`snowflake_query`），连字符分隔连接器 ID 与资源 URI（`snowflake-resource://...`）。

有效 ID：`github`、`snowflake`、`analyticsV2`。无效 ID：`my-mcp`（连字符）、`github_api`（下划线）、`2fast`（以数字开头）。

`tailscale`、`internal` 和 `aperture` 是保留 ID，不能用作连接器 ID。`aperture` ID 由内置系统连接器使用。

对连字符的限制可能在将来版本中放宽。请把“仅字母和数字”规则视为当前行为而非永久保证。完整的 ID 规则参阅[连接器参考][docs-aperture-connectors-reference]。

#### 认证类型

`auth` 对象的 `type` 字段选择认证方案。下表描述可用的认证类型：

| 类型 | 必填字段 | 描述 |
| --- | --- | --- |
| `bearer_token` | `secret` | 静态 `Authorization: Bearer <secret>` 头。 |
| `api_key` | `secret`、`name`、`in` | 以命名头或查询参数注入的凭证。`in` 必须是 `"header"` 或 `"query"`。 |
| `basic` | `username`、`password` | HTTP Basic 认证。 |
| `oauth2_client_credentials` | `client_id`、`client_secret`、`token_url` | 机器对机器的 OAuth 2.0 token。自动刷新。可选 `scopes` 数组。 |
| `oauth2_authorization_code` | `client_id`、`auth_url`、`token_url` | 按用户的 OAuth 2.0 授权同意流程。可选 `client_secret`（仅用 PKCE 时不需要）、`scopes` 和 `auth_params`。 |
| `oauth2_dcr` | `url` | 使用动态客户端注册的按用户 OAuth 2.0 授权同意流程。Aperture 会在运行时发现授权服务器并注册客户端，因此不需要 `client_id`、`auth_url` 或 `token_url`。可选 `scopes` 和 `auth_params`。 |

以下示例展示使用 OAuth 2.0 client credentials 认证的连接器：

```json
{
  "connectors": {
    "servers": {
      "analytics": {
        "protocol": "mcp",
        "url": "https://analytics.example.com/v1/mcp",
        "auth": {
          "type": "oauth2_client_credentials",
          "client_id": "aperture-analytics",
          "client_secret": "secret-example",
          "token_url": "https://auth.example.com/oauth2/token",
          "scopes": ["read:data"]
        }
      }
    }
  }
}
```

#### HTTP 连接器

当 `protocol` 为 `"http"` 时，Aperture 充当带认证的反向代理。Aperture 把发往 `/v1/connectors/<id>/<path>` 的请求转发到连接器的上游 URL，并自动注入凭证。配置了至少一个 HTTP 连接器后，Aperture 会注册 `aperture_list_connectors` MCP 工具，让 AI 模型能够发现可用的 HTTP 连接器。

> **警告：**
>
> HTTP 连接器上配置的认证凭证由所有拥有匹配 `connectors` 授权的用户共享。用户必须拥有匹配 `"connectorID/proxy"` 或更宽泛模式（如 `"connectorID/**"`）的授权才能访问代理端点。请使用尽可能窄的凭证范围，最好是只读。不要把敏感信息放进 `description` 或 `context`，`aperture_list_connectors` 工具会把这两个字段返回给能调用它的用户。

#### 从 `mcp.servers` 迁移

`connectors` 段取代了已弃用的 `mcp.servers` 语法。加载时，Aperture 会自动把旧的 `mcp.servers` 条目并入 `connectors.servers`，设为 `protocol: "mcp"` 且不带认证。迁移期间两段可以共存，但连接器 ID 必须在两段之间保持唯一。加载时 Aperture 会拒绝重复 ID。

考虑以下 `mcp.servers` 条目：

```json
"mcp": { "servers": { "docs": { "url": "http://mcp-server.example.ts.net:8185/v1/mcp" } } }
```

等价的 `connectors` 条目是：

```json
"connectors": { "servers": { "docs": { "protocol": "mcp", "url": "http://mcp-server.example.ts.net:8185/v1/mcp" } } }
```

完整的连接器 schema 和各类别授权参考，参阅[连接器参考][docs-aperture-connectors-reference]。

### `mcp`

> **注意：**
>
> `mcp.servers` 语法已弃用。请改用 [`connectors`][ar-connectors-section] 段，它支持相同功能，还支持认证连接和 `http` 协议。Aperture 保留 `mcp` 段是为了向后兼容以及 `accept_registrations` 字段——该字段在 `connectors` 中没有对应物。

`mcp` 段配置 MCP（Model Context Protocol）服务器代理。Aperture 连接远程 MCP 服务器，聚合其工具、资源和资源模板，并通过单一的 `/v1/mcp` 端点暴露它们。设置说明与故障排查参阅 [MCP 服务器代理][docs-aperture-set-up-mcp-servers]。

```json
{
  "mcp": {
    "accept_registrations": true,
    "servers": {
      "docs": {
        "url": "http://mcp-server.example.ts.net:8185/v1/mcp"
      }
    }
  }
}
```

#### `mcp` 字段

| 字段 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `accept_registrations` | boolean | `false` | 允许后端通过 `POST /v1/mcp/register` 动态注册。后端 POST `{"url": "http://..."}` 并保持连接打开。连接关闭时工具即注销。该字段在 `connectors` 中没有对应物。 |
| `servers` | map | `{}` | 服务器 ID 到服务器配置的映射。已弃用：请改用 `connectors.servers`。映射键是服务器 ID，会成为该后端工具（`serverID_toolname`）、资源（`serverID-uri`）和资源模板（`serverID-uriTemplate`）的名称前缀。 |

#### `servers` 字段

`servers` 映射中的每一项接受以下字段：

| 字段 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `url` | string | 是 | MCP 服务器的端点 URL（例如 `http://mcp-server.example.ts.net:8185/v1/mcp`）。 |

### `database`

`database` 段配置数据存储行为，包括所捕获请求与响应数据的保留策略和头筛选。

```json
{
  "database": {
    "save_raws": false,
    "keep_encrypted_blobs": false,
    "retention": {
      "duration": "30d",
      "require_export": false,
      "purge": ["captures"]
    }
  }
}
```

#### `database` 字段

| 字段 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `save_raws` | boolean | `false` | 在解析后的 JSON 抓包记录之外，保存 JSON 解析前的原始 HTTP 请求与响应字节。为 `false` 时，Aperture 会丢弃有效 JSON 响应的原始体；对 JSON 解析失败的响应仍保留原始字节，除非配置了零保留（`duration: "0"`、`require_export: false`）。关闭它不会删除 Aperture 已保存的原始体，由保留策略负责删除。 |
| `keep_encrypted_blobs` | boolean | `false` | Aperture 通常会在解析后的抓包记录中，把提供商加密的思维块签名、网页搜索加密内容、引用索引和加密响应项替换为占位符。设为 `true` 可为调试或回放保留这些字段，直到保留策略删除其抓包内容。该设置不会隐去原始 HTTP 体——当启用 `save_raws` 或响应 JSON 解析失败时，原始体中可能包含原始加密值。零保留（`duration: "0"`、`require_export: false`）不会存储抓包体。 |
| `retention` | object | `{}` | 抓包数据保留策略。参阅下方的保留字段。 |
| `headers` | object | `{}` | 头筛选策略。控制哪些请求与响应头以可查询形式存储，并可在支持的 Aperture 管理仪表板页面上用作筛选条件。为空（默认）时禁用该功能。参阅下方的头字段。 |

#### `database.retention` 字段

| 字段 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `duration` | string | `""` | 抓包内容删除前的保留时长，例如 `"30d"` 或 `"720h"`。空字符串使用网关的默认保留期——除非 Tailscale 配置了其他默认值，否则为一年。默认值同时也是 Aperture 应用到的最长期间；如果设置了更长的非零时长，Aperture 会改用默认值。非零取值必须在 1 小时到 3650 天之间。设为 `"0"` 表示不带导出门控的零保留。默认值只限制更长的时长，因此 `"0"` 始终生效。 |
| `require_export` | boolean | `false` | 为 `true` 时，只有成功把抓包导出到 Amazon S3 兼容端点后，Aperture 才会删除本地抓包内容。无论 `duration` 如何，尚未导出的抓包都会保留。导出成功也不保证立即删除。 |
| `purge` | array | `["captures"]` | 要移除的内容类别。省略或留空时默认为 `["captures"]`。非空列表必须包含 `"captures"` 且不能有重复。`["captures"]` 移除请求与响应体、头和原始体，但保留工具使用数据；`["captures", "tools"]` 还会移除工具使用数据。 |

当 `duration: "0"` 且 `require_export: false` 时，Aperture 不存储捕获的请求与响应体、头或原始 HTTP 字节。即使启用了 `save_raws` 或 `keep_encrypted_blobs`，或响应 JSON 解析失败，也照样适用。这不依赖 `purge` 列表。要同时省略捕获的工具数据，请在 `purge` 中加入 `"tools"`。

保存时，Aperture 会拒绝格式错误或为负的时长，以及超出 1 小时到 3650 天范围的非零时长。超过网关默认保留期的有效时长仍能保存，但 Aperture 会改用默认值。例如默认保留期为一年时，`"730d"` 的实际保留期仍是一年。

Aperture 删除抓包内容的同时，会保留抓包元数据、会话记录、用量指标（token 数、模型、成本估算、时长和状态码）以及单独索引的头值。抓包内容删除后，用量分析和头筛选仍然可用。抓包保留不会删除 Aperture Chat 的对话历史。抓包保留之外的数据可能受其他生命周期规则或用户操作影响。

> **警告：**
>
> 省略或留空 `duration` 使用的是默认保留期，而非无限保留。除非 Tailscale 为你的网关配置了其他默认值，否则默认期为一年。它同时也是上限：超过默认期的时长会被 Aperture 缩短到默认期。如果 `require_export` 为 `true`，即使过了保留期，Aperture 也会保留本地抓包内容直到导出成功。请联系你的 Tailscale 客户经理确认网关的默认保留期。

> **注意：**
>
> 抓包内容零保留的分步指引参阅[配置零保留模式][docs-aperture-zero-retention]。保留、隐去以及 Chat 与 hook 数据独立处理的概览参阅[隐私与数据保留][docs-aperture-privacy]。

#### `database.headers` 字段

Aperture 以压缩形式存储捕获的请求与响应头。`headers` 段指定 Aperture 为哪些头建立按存在性或值筛选的索引。这些筛选器可用于：

* **User Dashboard**（`/admin/dashboard`）
* **Usage Overview**（`/admin/adoption`）
* **Model Activity**（`/admin/adoption/model-activity`）
* **Agent Activity**（`/admin/adoption/agent-activity`）
* **Logs**（`/admin/logs`）
* **Tool Use**（`/admin/tool-use`）

抓包保留期结束后，Aperture 仍保留已索引的头值。启用写入时零保留后，Aperture 不再写入新的头索引值，包括已配置的可筛选头。

| 字段 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `filterable` | array | `[]` | 描述要按名称和值建立索引的请求与响应头的对象。数组为空时不建立任何头索引。可在 **Administration** > **Reporting**（`/admin/settings/reporting`）的 **Stored filterable headers** 下编辑此列表。 |

每个 `filterable` 条目包含以下字段：

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `name` | string | 必填。要建立索引的头名称。大小写不敏感，同时作用于请求与响应两个方向。 |
| `redact_values` | boolean | 可选，默认 `false`。为 `true` 时，Aperture 只存储该头的存在性，从不存储其值。该头支持 **Present** 匹配，但不支持 **Contains** 或 **Is exactly**。适用于其值不能持久存储的头。在 **Administration** > **Configuration** 上设置此字段；**Reporting** 页面会遵循它但不能编辑它。 |

在列出至少一个头之前，Aperture 不会建立任何头索引。只有你列出的头会被索引，其余头仅保留在留存抓包中。

为头建立索引并不意味着有权用它筛选。包括管理员在内的用户都需要通过 [`filterable_headers`][ar-grant-capability-fields] 分配该头的授权，之后才能在任何支持筛选的仪表板页面上把它用作筛选条件。

Aperture 会立即为新请求索引该头，并从仍在保留窗口内的抓包回填较早的请求。抓包已被清除的请求无法回填。

> **注意：**
>
> 回填器会处理完所有历史数据，但可能不会立即重新索引当前日历日；次日伊始会补齐当天的缺失条目。

Aperture 会隐去存储头值中检测到的凭证。内置检查覆盖常见格式，包括 bearer token、JWT，以及带 `sk-`、`AKIA`、`ghp_`、`xoxb-` 等前缀的 API 密钥，还有高熵值。匹配的值存储为 `(redacted)`。这些检查是固定的，无法检测所有秘密。要确保 Aperture 从不存储某个头的值，请为该头设置 `redact_values`。

```json
"headers": {
  "filterable": [
    { "name": "x-request-id" },
    { "name": "user-agent" },
    { "name": "authorization", "redact_values": true },
  ],
},
```

> **注意：**
>
> 分步指引参阅[按头筛选日志][docs-aperture-filter-logs-by-header]。

### `chat_models`

`chat_models` 段控制哪些模型出现在 Aperture chat UI 选择器中、它们的显示名称和顺序，以及它们在标题生成和摘要方面的功能角色。

该段不授予访问权限。`chat_models` 有条目时，模型必须同时匹配一条授权和一个 `chat_models` 条目才会出现在选择器中。该段省略或为空时，选择器显示所有已授权且提供商声明了 chat 兼容 API 的模型，并以原始模型 ID 作为标签。

`chat_models` 中使用 `provider/model` ID 或模式，而不是[模型别名][docs-aperture-model-aliases]名称。`display_name` 字段只改变选择器标签，不会为 API 请求创建别名。

> **注意：**
>
> web 门户默认开放。在[授权][ar-grant-capability-fields]中把 `enable_portal` 设为 `false` 即可为其匹配的非管理员用户禁用。显式 `true` 优先于更大范围的禁用，且管理员始终保留访问权限。旧字段 `enable_chat_ui` 对现有配置有同样效果。`chat_models` 段控制 chat 模型选择器显示什么，而不控制谁能访问门户。

```json
{
  "chat_models": [
    {"model": "anthropic/claude-opus-5-5", "display_name": "Claude Opus", "priority": 100},
    {"model": "anthropic/claude-sonnet-5-5", "display_name": "Claude Sonnet", "priority": 90},
    {"model": "anthropic/claude-haiku-4-5-20251001", "display_name": "Claude Haiku", "priority": 70,
     "title_gen": true, "summarize": true},
    {"model": "openai/gpt-5*", "priority": 50}
  ]
}
```

#### `chat_models` 字段

`chat_models` 数组中的每个条目接受以下字段：

| 字段 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `model` | string | 必填 | 完全限定的 `provider/model` glob 模式，使用与 `grants.models` 相同的语法（`*` 匹配单个路径段内的任意字符，`**` 匹配零个或多个段）。 |
| `display_name` | string | `""` | chat 选择器中显示的标签。为空时回退到模型的短 ID（提供商前缀之后的部分）。 |
| `priority` | integer | `0` | 选择器排序优先级，值高者在前。并列时按模型 ID 字母顺序排列。也用作功能模型选择的平局裁决。 |
| `title_gen` | boolean | `false` | 标记该条目可用于生成对话标题。chat 服务会选择用户有权使用的优先级最高的 `title_gen` 条目；没有符合条件的条目时回退到对话所用的模型。 |
| `summarize` | boolean | `false` | 标记该条目可用于摘要 chat 响应中的扩展推理块。选择规则与 `title_gen` 相同。`title_gen` 与 `summarize` 角色相互独立。 |
| `hidden` | boolean | `false` | 把匹配的模型从 chat 选择器中排除，同时保留其 `title_gen` 和 `summarize` 角色资格。用于把某个模型保留给后台任务而不作为回复候选。 |
| `context_window_tokens` | integer | 模型目录值 | 覆盖 Aperture 假定的 chat 上下文窗口。必须是正整数。 |
| `max_output_tokens` | integer | 模型目录值 | chat 响应的最大输出 token 数。即使某些 API 中该限制可选，Aperture 也会把该值发送给上游提供商，并在对话在上下文窗口中剩余空间不足时调低它。必须是正整数。 |
| `native_tool_loading` | boolean | `false` | 使用提供商自己的工具搜索而非 Aperture 的。仅适用于 Anthropic Messages 和 OpenAI Responses 模型，且仅当 `model` 是精确模型 ID 而非模式时。 |

多个条目匹配同一模型时，最具体的 glob 优先。例如 `"anthropic/claude-opus-5-5"` 优先于 `"anthropic/**"`，后者又优先于 `"**"`。模式同样具体时，配置中靠前的条目优先。

> **注意：**
>
> chat 选择器只包含提供商声明了 chat 兼容 API 的模型：`anthropic_messages`、`openai_chat`、`openai_responses`、`gemini_generate_content` 或 `google_generate_content`（针对 Gemini 模型）。仅通过其他格式（如 Amazon Bedrock）提供的模型无论 `chat_models` 如何设置都不会出现。

### `flags`

`flags` 段启用尚未正式发布的实验性功能。每个标志由字符串键标识，包含一个 `value` 布尔值。所有标志默认禁用（`false`）。把标志加入配置即启用。

```json
{
  "flags": {
    "direct_access_api": {
      "value": true
    }
  }
}
```

每个键是一个标志 ID。要启用标志，值对象必须包含设为 `true` 的 `value` 字段。把 `value` 设为 `false` 或完全不写该标志都会保持功能禁用。上面的示例启用了直接提供商访问 API。该标志开启的功能参阅[直接提供商访问][docs-aperture-direct-access]。

#### 标志参考

本参考中的标志有两种状态之一：

* **Private（私有）。** Tailscale 在你的 Aperture 配置之外管理这些标志。你无法启用它们，Aperture 会拒绝配置中出现它们。
* **Deprecated（已弃用）。** 这些标志已不产生任何效果，它们所门控的功能始终开启。

Tailscale 在你的 Aperture 配置之外管理以下标志。不要把它们加入配置：Aperture 会针对每个标志报 `unknown flag "{key}" in flags config`，并阻止保存。

| 标志 ID | 名称 | 状态 |
| --- | --- | --- |
| `mcp_apps` | MCP Apps | Private |
| `disable_liveness_check` | Disable Liveness Check | Private |
| `disable_hook_request_compression` | Disable Hook Request Compression | Private |
| `portal_root` | Portal Root | Private |
| `connector_identity_headers` | Connector Identity Headers | Private |

以下标志已弃用。它们门控的功能始终可用，可以从配置中移除。

| 标志 ID | 名称 | 状态 |
| --- | --- | --- |
| `chat_ui` | Chat UI | Deprecated |
| `connectors` | Connectors | Deprecated |
| `web_tools` | Web Tools | Deprecated |
| `connector_labels` | Connector Labels | Deprecated |
| `capture_retention` | Capture Retention | Deprecated |

网页搜索与抓取不再需要 `web_tools` 标志。可用性取决于你的网关配置。

向已保存配置添加已弃用标志时，配置 API 会拒绝。为兼容起见，Aperture 会保留既有的已弃用标志。这些标志没有效果，可以移除。

> **注意：**
>
> `/admin/settings/feature-flags` 的 **Administration** > **Feature Flags** 页面从不列出 Private 或 Deprecated 标志。

#### 校验行为

未知的标志 ID 会产生校验警告：`unknown flag "{key}" in flags config`。在通过 API 或管理仪表板保存时警告被视为错误，因此会阻止保存。

#### Connectors 标志

`connectors` 标志已弃用。连接器——包括 [`connectors`][ar-connectors-section] 配置段、`/admin/settings/connectors` 的 **Connectors** 页面以及 `/v1/connectors/` REST API 端点——始终可用，不再需要标志。如果配置中仍设置了 `connectors`，可以移除。

`connector_labels` 标志同样已弃用。连接器标签——包括连接器上的 `labels` 字段、`label:<name>` 授权匹配以及 `/admin/settings/connectors` 的标签字段——始终可用。移除门控不会收窄任何人的访问，因为标签授权只会增加访问。如果配置中仍设置了 `connector_labels`，可以移除。

完整的连接器配置 schema 参阅本页的 [`connectors`][ar-connectors-section] 段和[连接器功能指南][docs-aperture-connectors]。

## 配额执行

Aperture 在请求时执行配额：转发请求给提供商之前检查所有被引用的桶。

### 请求超出配额时会发生什么

当请求将超出其任一配额桶时，Aperture 会：

1. 以 HTTP 状态 **429（Too Many Requests）** 拒绝请求。
2. 设置 `Retry-After` 头，给出预算补充充足所需的预计秒数。
3. 把错误格式化为该提供商的原生错误格式。
4. 记录包含桶详情、登录名和模型的警告日志。

下表描述各提供商特定的错误格式：

| 提供商 | 错误格式 |
| --- | --- |
| Anthropic | `{"type":"error","error":{"type":"rate_limit_error","message":"..."}}` |
| OpenAI | `{"error":{"message":"...","type":"insufficient_quota","code":"insufficient_quota"}}` |
| Bedrock | `{"message":"..."}`，头为 `x-amzn-ErrorType: ThrottlingException` |
| Gemini API / Gemini Enterprise Agent Platform | `{"error":{"code":429,"message":"...","status":"RESOURCE_EXHAUSTED"}}` |

### 客户端如何感知执行

Aperture 因超出配额阻止请求时，客户端收到 HTTP 429 响应。被阻止的请求也会以 429 状态出现在 `/admin/logs` 的 **Logs** 页面上。

## 校验

Aperture 在通过 API 或管理仪表板保存配置之前进行校验。错误和警告都会阻止保存。请修正报告的问题后重新保存。

保存前可用 `POST /aperture/config:validate` 检查配置。警告会把 `Valid` 设为 `false`，与保存行为一致。管理员锁定检查仅在保存时进行，防止你移除自己的管理员权限。

下表列出校验错误和警告。

| 条件 | 消息 | 严重级别 |
| --- | --- | --- |
| 未配置提供商或 MCP 服务器 | `no providers or mcp servers defined; users will not be able to access any models` | 警告 |
| 提供商缺少 `baseurl` | `provider {id} has no baseurl configured` | 警告 |
| `authorization` 类型无效 | `provider {id} has invalid authorization type: {type}` | 警告 |
| 未解析的环境变量 | `unsubstituted macros: [var_name]` | 错误 |
| JSON 或 HUJSON 语法无效 | 解析错误详情 | 错误 |
| 配额定义无效 | `quota {name}: {details}` | 错误 |
| **结构/语法** | | |
| 配置中存在重复键 | `duplicate config key "hostname"` | 警告 |
| 未知的配置键 | `unknown config key "basurl"` | 警告 |
| 字段值类型不匹配 | 字段名和 `json.UnmarshalTypeError` 详情 | 警告 |
| **提供商** | | |
| `add_headers` 格式无效 | `provider {id}: add_headers entry "Bad-Entry" must be in "Header-Name: value" format` | 警告 |
| **配额** | | |
| 配额名称模板无效 | `quota "{name}": quota name "{name}" has unsupported template "{template}" after colon` | 警告 |
| **授权** | | |
| 授权中存在未知字段 | 无法识别字段的严格 JSON 解析错误 | 警告 |
| 授权 `models` 引用未定义的提供商 | `models pattern "{pattern}" references provider "{name}" which does not match any declared provider` | 警告 |
| 授权 `mcp_tools`、`mcp_resources` 或 `mcp_templates` 引用未定义的 MCP 服务器 | `mcp_tools pattern "{pattern}" references server "{name}" which does not match any declared MCP server` | 警告 |
| 授权 `send_hooks` 引用未定义的 hook | `send_hooks references undefined hook "{name}"` | 警告 |
| 授权 `quotas` 引用未定义的配额 | `quotas references undefined quota "{name}"` | 警告 |
| 授权中的配额桶引用模板无效 | `grants[{n}] grant {n} quotas[{n}]: bucket ref "{ref}" has unsupported template...` | 警告 |
| 授权级 `add_headers` 格式无效 | `add_headers entry "{entry}" must be in "Header-Name: value" format` | 警告 |
| **连接器** | | |
| 连接器缺少 `protocol` | `connectors.servers.{id}: protocol is required (e.g. "mcp" or "http")` | 错误 |
| 连接器协议不受支持 | `connectors.servers.{id}: unsupported protocol "{value}" (supported: "mcp", "http")` | 错误 |
| 连接器 ID 无效 | `connectors.servers.{id}: invalid ID "{id}"; connector IDs must match [a-zA-Z][a-zA-Z0-9]* (letters and digits only, starting with a letter; no hyphens or underscores)` | 错误 |
| 连接器缺少 URL | `connectors.servers.{id}: URL is required` | 警告 |
| 连接器认证校验失败 | `connectors.servers.{id}.auth: {details}` | 错误 |
| 连接器标签无效 | `connectors.servers.{id}.labels: invalid label "{label}"; labels must match [a-zA-Z0-9][a-zA-Z0-9._-]* (no slashes)` | 错误 |
| 用户连接器上使用了保留标签 | `connectors.servers.{id}.labels: removed reserved label "system"` | 警告 |
| `system_labels` 中出现未知的系统连接器 | `connectors.system_labels.{id}: unknown system connector ID` | 错误 |
| `mcp` 与 `connectors` 中连接器 ID 重复 | `config: server ID "{id}" is defined in both 'mcp.servers' and 'connectors.servers'; IDs must be unique across both sections` | 错误 |
| **Hook** | | |
| Hook 缺少 URL | `hook {name} has no url configured` | 警告 |
| Hook URL 协议无效 | `hook {name} has invalid URL scheme (must be http:// or https://): {url}` | 警告 |
| Hook 授权类型无效 | `hook {name} has invalid authorization type: {type}` | 警告 |
| **导出器** | | |
| S3 前缀以 `/` 结尾 | `exporters.s3.prefix must not end with a slash` | 警告 |
| **结构警告** | | |
| 没有授权分配 admin 角色 | `no grant in grants or temp_grants assigns role:admin; nobody will be able to manage this instance` | 警告 |
| 配置了提供商但未定义授权 | `providers are configured but no grants or temp_grants defined; all access will be denied` | 警告 |
| **仅保存时** | | |
| 配置为空 | `config must not be empty` | 错误 |
| 防管理员锁定 | 拒绝会移除保存者管理员权限的保存 | 错误 |
| **导出器静默上限** | | |
| S3 导出器 `limit` 超过 10000 | Aperture 会静默把 `limit` 降到 `10000` | 静默 |

模型别名校验错误和警告参阅[模型别名配置错误][docs-model-alias-errors]。其他常见校验问题及解决方法参阅[故障排查][docs-aperture-troubleshooting]。

### 模型别名目标校验

适用于所有目标（包括未启用目标）的要求参阅[模型别名目标要求][docs-model-alias-destination-requirements]。阻止保存的消息参阅[模型别名配置错误][docs-model-alias-errors]。

## 完整示例

以下示例把授权、配额、导出器、提供商、hook、连接器、MCP 注册和数据库保留整合到一个配置中。保存前请替换示例凭证和端点 URL，并把 `admin@company.com` 改成你自己的管理员登录名。会移除你管理员权限的保存会被 Aperture 拒绝。

```json
{
  // Access control: who can use which models
  "grants": [
    // All users: access all models with per-user and org-wide quotas
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          {
            "models": "**",
            "quotas": [
              {"bucket": "daily:<user>"},
              {"bucket": "org-monthly"},
            ],
          },
        ],
      },
    },
    // Admin access for specific user with audit hook
    {
      "src": ["admin@company.com"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "admin" },
          {
            "models": "**",
            "send_hooks": [
              {
                "name": "oso",
                "events": ["tool_call_entire_request"],
                "send": ["tools", "estimated_cost"],
              },
            ],
          },
        ],
      },
    },
    // CORS headers for browser-based clients
    {
      "src": ["browser-app@example.com"],
      "app": {
        "tailscale.com/cap/aperture": [
          {
            "set_cors": true,
            "cors_paths": ["/v1/**", "/bedrock/**"],
            "Access-Control-Allow-Origin": "https://app.example.com",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        ],
      },
    },
  ],

  // Dollar-based spending limits
  "quotas": {
    "daily:<user>": {
      "capacity": "$10.00",
      "rate": "$5.00/day",
      "on_exceed": "reject",
    },
    "org-monthly": {
      "capacity": "$2000.00",
      "rate": "$2000.00/month",
      "on_exceed": "reject",
    },
  },

  // LLM session log export configuration
  "exporters": {
    "s3": {
      // Required for S3-compatible services such as GCS
      "endpoint": "https://your-s3-compatible-endpoint.url",
      "bucket_name": "aperture-exports",
      "region": "us-west-2",
      "prefix": "prod",
      "access_key_id": "<aws-access-key-id>",
      "access_secret": "<aws-secret-access-key>",
      "every": 3600,
      "limit": 1000
    }
  },

  // LLM providers
  "providers": {
    "openai": {
      "baseurl": "https://api.openai.com",
      "apikey": "<openai-api-key>",
      "models": ["gpt-5.5", "gpt-5.4-mini", "gpt-5.3-codex"],
      "name": "OpenAI",
      "description": "OpenAI models for coding and chat",
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true
      }
    },
    "anthropic": {
      "baseurl": "https://api.anthropic.com",
      "apikey": "<proxy-anthropic-api-key>",
      "authorization": "x-api-key",
      "models": ["claude-sonnet-5-5", "claude-haiku-4-5-20251001", "claude-opus-5-5"],
      "name": "Anthropic",
      "compatibility": {
        "openai_chat": false,
        "anthropic_messages": true
      }
    },
    "gemini": {
      "baseurl": "https://generativelanguage.googleapis.com",
      "apikey": "<proxy-gemini-api-key>",
      "authorization": "x-goog-api-key",
      "models": ["gemini-3.8-flash", "gemini-2.5-pro"],
      "name": "Google Gemini",
      "compatibility": {
        "openai_chat": false,
        "gemini_generate_content": true
      }
    },
    "private": {
      "baseurl": "<private-llm-url>",
      // Use an ID already served by your endpoint. This example uses an Ollama tag.
      "models": ["qwen3-coder:30b"]
    }
  },

  // Stable model name for clients
  "model_aliases": {
    "models": {
      "team-chat": {
        "dst": ["openai/gpt-5.4-mini"]
      }
    }
  },

  // Hooks for external integrations
  "hooks": {
    "oso": {
      "url": "https://api.osohq.com/api/agents/v1/model-request",
      "apikey": "<oso-api-key>",
    },
  },

  // Outbound integrations (MCP servers and HTTP APIs)
  "connectors": {
    "servers": {
      // Unauthenticated MCP server in your tailnet
      "tailnetMCP": {
        "protocol": "mcp",
        "url": "http://mcp-server.example.ts.net:8080/v1/mcp",
      },
      // MCP server with bearer token auth, grouped by label
      "snowflake": {
        "protocol": "mcp",
        "url": "https://mcp.example.com/v1/mcp",
        "labels": ["analytics", "restricted"],
        "auth": {
          "type": "bearer_token",
          "secret": "sk-example-token",
        },
      },
    },
  },

  // Dynamic MCP registration (accept_registrations has no connectors equivalent)
  "mcp": {
    "accept_registrations": true,
  },

  // Data storage settings
  "database": {
    "retention": {
      "duration": "30d",
      "require_export": false,
      "purge": ["captures"],
    },
  },
}
```

## 相关内容

以下主题提供有关配置和管理 Aperture 的更多信息：

* 提供商与客户端的 API 格式和要求参阅[受支持的提供商与客户端][docs-supported-providers-clients]。
* 兼容性标志、授权类型和 cost basis 取值参阅[提供商配置][docs-aperture-provider-compatibility]。
* 提供商分步设置参阅[设置 LLM 提供商][docs-aperture-set-up-providers]指南。
* 稳定的模型名、配置和提供商切换参阅[模型别名][docs-aperture-model-aliases]。
* 控制模型访问的说明参阅[授予模型访问权限][docs-aperture-grant-model-access]。
* 常见配置问题参阅[故障排查][docs-aperture-troubleshooting]。
* Aperture 管理仪表板参阅[管理仪表板参考][docs-aperture-dashboard-admin]。

[ar-auth-mode]: #auth_mode

[ar-connectors-section]: #connectors

[ar-flags-section]: #flags

[ar-grant-capability-fields]: #更多能力字段

[ar-grants]: #grants

[ar-hook-send-types]: #hook-发送类型

[ar-hooks]: #hooks

[co-contact-sales]: https://tailscale.com/contact/sales

[docs-aperture-build-custom-webhook]: /docs/aperture/how-to/build-custom-webhook

[docs-aperture-configure-overdrafts]: /docs/aperture/how-to/configure-overdraft-quotas

[docs-aperture-connectors-labels]: /docs/aperture/connectors/reference#连接器标签

[docs-aperture-connectors-reference]: /docs/aperture/connectors/reference

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-dashboard-admin]: /docs/aperture/reference/dashboard-admin

[docs-aperture-direct-access]: /docs/aperture/direct-access

[docs-aperture-export-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-aperture-filter-logs-by-header]: /docs/aperture/how-to/filter-logs-by-header

[docs-aperture-grant-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-aperture-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-aperture-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-aperture-integrate-cerbos]: /docs/aperture/integrate/cerbos

[docs-aperture-integrate-oso]: /docs/aperture/integrate/oso

[docs-aperture-model-aliases]: /docs/aperture/model-aliases

[docs-aperture-monitor-quota-balances]: /docs/aperture/how-to/check-and-refill-budgets

[docs-aperture-openai-compatible-provider]: /docs/aperture/how-to/use-openai-compatible-provider

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-aperture-provider-compatibility-cost-basis]: /docs/aperture/provider-compatibility#成本基准

[docs-aperture-provider-compatibility-model-cost-map]: /docs/aperture/provider-compatibility#模型成本映射

[docs-aperture-provider-compatibility]: /docs/aperture/provider-compatibility

[docs-aperture-reference]: /docs/aperture/reference

[docs-aperture-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-aperture-set-team-budget]: /docs/aperture/how-to/set-team-budget

[docs-aperture-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-aperture-set-up-mcp-servers]: /docs/aperture/mcp-server

[docs-aperture-set-up-providers]: /docs/aperture/set-up-providers

[docs-aperture-troubleshoot-405]: /docs/aperture/troubleshooting#来自上游提供商的-http-405-错误

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-aperture-visible-groups]: /docs/aperture/visible-groups

[docs-aperture-zero-retention]: /docs/aperture/how-to/configure-zero-retention

[docs-aperture]: /docs/aperture

[docs-model-alias-destination-requirements]: /docs/aperture/model-aliases#目的地要求

[docs-model-alias-errors]: /docs/aperture/model-aliases#配置错误

[docs-model-alias-schema]: /docs/aperture/model-aliases#配置架构

[docs-provider-authorization]: /docs/aperture/provider-compatibility#认证类型

[docs-provider-flags]: /docs/aperture/provider-compatibility#兼容性标志

[docs-provider-matrix]: /docs/aperture/reference/supported-providers-clients#提供商矩阵

[docs-supported-providers-clients]: /docs/aperture/reference/supported-providers-clients

[docs-tailscale-grants]: /docs/features/access-control/grants/grants-app-capabilities

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[xt-anthropic-models]: https://platform.claude.com/docs/en/about-claude/models/overview

[xt-anthropic-plans]: https://www.anthropic.com/pricing

[xt-gemini-plans]: https://gemini.google.com

[xt-openai-models]: https://platform.openai.com/docs/models

[xt-openai-plans]: https://openai.com/chatgpt/pricing
