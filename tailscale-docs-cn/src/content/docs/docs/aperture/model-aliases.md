---
title: "模型别名"
description: "配置模型别名、选择目的地，并应用授权、配额和 hook。"
---

最后验证于 Oct 22, 2026

模型别名（model alias）把一个稳定的、面向客户端的模型名称映射到 Aperture 网关中的具体提供商和模型。你可以用模型别名从一个中心位置（即 Aperture 配置）控制你的客户端、框架（harness）或 agent 能访问哪些模型，而无需更改客户端设备上的配置。

常见使用场景包括：

* [不更改客户端模型名称切换提供商][ar-switch-providers-without-changing-the-client-model-name]：在上游发生故障时把请求改道到备用提供商。
* [让模型家族保持在最新已批准版本][ar-keep-a-model-family-on-the-latest-approved-version]：在不修改客户端设置的情况下更新底层模型版本。
* [为用户提供面向任务的模型名称][ar-give-users-a-task-focused-model-name]：提供 `writing-assistant` 这样易于辨认的名称，路由到已批准的模型。

## 别名如何解析

Aperture 使用网关配置中的 `model_aliases` 部分来解析模型别名。

要理解解析的工作方式，请先区分以下概念：

* **模型别名**：请求的 JSON `model` 字段中发送的稳定、精确匹配的名称。其配置是 `model_aliases.models` 中的对应条目。
* **目的地数组**：属于某个别名的有序 `dst` 数组，它不是别名本身，也不是重试链。
* **目的地**：该数组中以 `provider/model` 格式表示的一个字符串。`provider` 是在 `providers` 下配置的键，而不是它的显示名称。如果提供商使用带命名空间的 ID，模型段可以包含斜杠。
* **策略**：从数组中选出一个条目的规则。全局设置为 `model_aliases.strategy`，每个别名的设置为 `model_aliases.models.<alias>.strategy`。

请求到达时，Aperture 将 JSON `model` 值与已配置的别名进行比较。如果存在匹配，Aperture 会按照生效的策略解析该别名，并在检查授权、配额、hook 和路由之前，把请求改写为选定的目的地。

### 配置架构

`model_aliases` 部分接受以下字段：

| 字段                                    | 类型             | 是否必填           | 默认值                            | 描述                                                                                                                         |
| --------------------------------------- | ---------------- | ------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `model_aliases.strategy`                | string           | 否                  | `first`                           | 默认的目的地选择策略：`first` 或 `last`。                                                                                   |
| `model_aliases.models`                  | object           | 否                  | 空映射                            | 以客户端发送的精确别名为键的映射。已弃用的 `virtual` 回退请参阅下方的迁移说明。                                              |
| `model_aliases.models.<alias>`          | object           | 是（每个别名必填）  | 不适用                            | 别名配置。别名名称不能为空，对象不能为 null。                                                                                |
| `model_aliases.models.<alias>.dst`      | array of strings | 是                  | 不适用                            | 一个或多个 `provider/model` 目的地，按选择顺序排列。                                                                        |
| `model_aliases.models.<alias>.strategy` | string           | 否                  | 继承 `model_aliases.strategy`     | 该别名的选择策略。用 `first` 或 `last` 覆盖默认值。                                                                          |

可选的策略只有 `first` 和 `last`。全局策略省略或为空时默认为 `first`。每别名的策略省略或为空时继承全局值。

`model_aliases.models` 映射省略或为空时，该映射不定义任何别名。只有当客户端发送精确的别名名称时，别名才会为请求路由。

请使用 `model_aliases`，而不要使用已弃用的 `virtual`。只有当 `model_aliases` 既没有非空 `strategy`、`models` 中也没有任何条目时，Aperture 才会读取 `virtual`。应把旧条目迁移过来，而不是同时填充两个部分——那样会阻止保存。

### 选择策略

选择策略决定 Aperture 从 `dst` 数组中挑选哪个目的地：

* `first` 选择索引 0，即数组中的第一个目的地。
* `last` 选择数组中的最后一个目的地。

每别名的 `strategy` 会覆盖全局默认值。如果目的地数组只有一个条目，无论策略是 `first` 还是 `last`，Aperture 都会选择该条目。如果数组包含两个以上条目，两种策略都不会选中位于首尾之间的条目。Aperture 会校验数组中的所有条目，包括未被选中的中间条目。

下面的代码片段展示了全局策略与每别名策略如何相互作用：

```json
{
  "model_aliases": {
    "strategy": "last",
    "models": {
      "claude-opus-5-5": {
        "strategy": "first",
        "dst": [
          "vercel/anthropic/claude-opus-5.5",
          "bedrock_mantle/anthropic.claude-opus-5-5",
          "anthropic/claude-opus-5-5"
        ]
      }
    }
  }
}
```

在此示例中，每别名的 `strategy: "first"` 覆盖全局设置，因此 Aperture 把 `claude-opus-5-5` 的请求路由到 `vercel/anthropic/claude-opus-5.5`。如果移除每别名的 `strategy` 字段，该别名会继承全局 `strategy: "last"`，从而选择 `anthropic/claude-opus-5-5`。由于不存在中间选择策略，要选择 `bedrock_mantle/anthropic.claude-opus-5-5`，必须把该条目移到数组的第一位或最后一位。

此示例展示了继承层级。由于全局变更会影响继承它的每个别名，最佳实践是在故障缓解和运维调整中使用每别名的 `strategy` 字段，而不是全局策略。

任何选择策略都不会发现模型版本、重试其他目的地或在条目之间均衡流量。要更改模型别名的指派或策略，Aperture 网关管理员必须手动更新配置文件。

### 目的地要求

`dst` 数组中的每个目的地都必须满足以下要求：

* 提供商部分必须标识 `providers` 映射中一个已启用、已配置的提供商。不能使用保留的提供商 ID `aperture`。
* 模型部分必须匹配该提供商 `models` 数组中显式列出的模型。提供商配置中的通配符不满足此检查。
* 目的地必须采用 `provider/model` 格式。裸模型名称或对其他别名的引用都无效。Aperture 只把别名解析一次到具体模型，而不是解析到另一个别名。
* 数组中所有不同的目的地必须共享至少一个 API 兼容性标志，例如 `anthropic_messages`。
* 被选中的目的地必须支持客户端发送的确切 API 格式。例如，客户端发送 Anthropic Messages 请求时，被选中的目的地必须设置 `anthropic_messages: true`。目的地之间的 API 兼容性与客户端请求支持是两个独立条件。

保存配置时，Aperture 会校验每个目的地。如果某个未启用的目的地配置有误，即使启用的目的地有效，保存也会被拒绝。

## 支持的请求与模型发现

模型别名适用于向以下端点发送 JSON `model` 字段的请求：

* `/v1/chat/completions`
* `/v1/messages`
* `/v1/responses`

模型别名不转换 API 格式。被选中的目的地必须支持你的客户端发送的请求格式。各提供商支持的端点请参阅[提供商兼容性参考][docs-provider-compatibility]。

模型别名不适用于 Google Gemini、Gemini Enterprise Agent Platform，以及 Amazon Bedrock InvokeModel 和 Converse 的原生 API。支持标准 Anthropic Messages 的 Bedrock Mantle 端点可与模型别名配合使用。旧版 `/completions` 和 `/responses/compact` 不受支持。

别名不会向 `/v1/models` 响应或 Aperture 聊天选择器添加条目。请使用允许你直接输入明确模型名称的客户端，而不要依赖自动发现。要自定义网页聊天界面中的模型标签和排序，请使用 [`chat_models`][docs-chat-models]。

## 前提条件

配置模型别名之前，请确保你具备：

* 一个拥有[管理员权限][docs-admin-access]、可编辑其配置的 [Aperture 网关][docs-get-started]。
* 你所选方案（recipe）中提到的提供商，已配置好对应确切模型的凭证。提供商凭证请参阅 [Anthropic][docs-use-anthropic] 和 [Vercel][docs-use-vercel] 设置指南；如果使用版本升级或面向任务名称的方案，请参阅 [OpenAI][docs-use-openai] 指南。提供商切换方案中用到的每个提供商都需要 `anthropic_messages: true`、已启用状态、有效凭证，并在其 `models` 数组中列出确切的模型 ID。
* 一台安装了 `curl`、已连接到你的 [tailnet][docs-tailnet] 的设备，并关联一个测试用户登录。

> **注意：**
>
> 本指南中的 JSON 示例是需要合并的片段，而不是完整的替换配置。将这些示例整合进配置时，务必保留管理员授权、现有别名、提供商、凭证、配额、hook 以及无关设置。此外，应向现有授权添加能力，或在不重复顶层键的前提下追加示例授权。请将 `alice@example.com` 替换为你的测试用户登录名，并将示例中的提供商密钥替换为你已配置的密钥。[授权是可叠加的][docs-how-grants-work]，包括 tailnet 策略文件中的授权。请谨慎选择别名名称：定义一个与具体模型同名的别名，会把对该模型的请求重定向到别名目的地。避免意外的名称冲突截获本应发给其他模型的流量。

从测试用户的 tailnet 连接设备上发起请求，将 `<aperture-hostname>` 替换为你的 Aperture 网关地址。在提供商切换方案中配置好 `claude-opus-5-5` 后，发送以下请求：

```shell
curl --fail-with-body http://<aperture-hostname>/v1/messages \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-opus-5-5","max_tokens":1024,"messages":[{"role":"user","content":"Reply with hello."}]}'
```

其他方案请使用其请求示例中展示的别名名称和提示。

由于测试设备通过 Tailscale 连接，请求会以设备的 Tailscale 身份完成认证。你无需在请求中传递提供商 API 密钥。

要核对请求，请查看 HTTP 响应体，并在 Aperture 仪表板中打开 **Administration** > [**Logs**][docs-dashboard-logs]。日志会记录解析出的提供商和模型。日志详细程度取决于你的网关捕获与留存设置。响应体中的 `model` 字段反映的可能是上游提供商的规范模型 ID，而不是别名名称。模型别名会为请求路由，但并不保证响应元数据一致，也不保证在不同模型之间保留聊天会话。

## 使用场景

第一个方案配置三个目的地，并在不更改客户端请求的情况下切换提供商。其余方案相互独立，分别覆盖版本升级和面向任务的名称。

### 不更改客户端模型名称切换提供商

使用多目的地别名在上游提供商发生故障时切换提供商。此方案为 `claude-opus-5-5` 配置 Vercel、AWS Bedrock Mantle 和 Anthropic，三者提供完全相同的底层 Claude Opus 模型。

三个目的地在三个提供商处锁定同一个模型版本：

* `vercel/anthropic/claude-opus-5.5`
* `bedrock_mantle/anthropic.claude-opus-5-5`
* `anthropic/claude-opus-5-5`

Amazon Bedrock 原生的 `bedrock_model_invoke` 和 `bedrock_converse` 端点使用 AWS 专属的架构，无法与 Anthropic Messages 端点共享 API 兼容性标志。要让 Claude Messages 请求与 Anthropic 和 Vercel 并行地路由到 Bedrock，请使用标准的 [AWS Bedrock 上的 Anthropic Messages API][xt-bedrock-opus-model-card] 配置 Bedrock Mantle 提供商端点。

#### 配置 Bedrock Mantle 提供商

定义别名之前，请确保已配置 Anthropic、Vercel 和 Bedrock Mantle 提供商。获取一个在目标区域启用了模型访问的 [AWS Bedrock API 密钥][xt-bedrock-api-keys]。Bedrock Mantle 支持标准的 bearer token 认证，不需要 AWS SigV4 请求签名。

在 `providers` 下添加以下 `bedrock_mantle` 提供商片段：

```json
{
  "providers": {
    "bedrock_mantle": {
      "baseurl": "https://bedrock-mantle.us-east-1.api.aws/anthropic",
      "apikey": "<your-bedrock-api-key>",
      "authorization": "bearer",
      "models": [
        "anthropic.claude-opus-5-5"
      ],
      "cost_basis": "bedrock-mantle",
      "compatibility": {
        "anthropic_messages": true
      }
    }
  }
}
```

每个提供商都必须处于启用状态、提供有效凭证，并在其 `models` 数组中显式列出各自的模型 ID：

* `anthropic`：包含 `claude-opus-5-5`，且 `anthropic_messages: true`。
* `vercel`：包含 `anthropic/claude-opus-5.5`，且 `anthropic_messages: true`。
* `bedrock_mantle`：包含 `anthropic.claude-opus-5-5`，且 `anthropic_messages: true`。

#### 配置并切换别名

定义 `claude-opus-5-5` 会重定向所有使用该裸模型名称的请求，而不仅是测试用户的请求。保存之前，请向所有受影响的用户授予对全部三个目的地的访问权限。只有 Anthropic 目的地访问权限的用户，在别名选择 Vercel 或 Bedrock Mantle 时可能会失去访问权限。

配置提供商切换的步骤：

1. \[缺失片段：aperture\_admin\_nav.mdx]

2. 确认 `anthropic`、`vercel` 和 `bedrock_mantle` 提供商已配置并启用，`anthropic_messages: true`，且各自的模型 ID 已列入 `models`。

3. 将以下片段合并进你的配置。把 `alice@example.com` 替换为你的测试用户登录名：

   ```json
   {
     "model_aliases": {
       "models": {
         "claude-opus-5-5": {
           "strategy": "first",
           "dst": [
             "vercel/anthropic/claude-opus-5.5",
             "bedrock_mantle/anthropic.claude-opus-5-5",
             "anthropic/claude-opus-5-5"
           ]
         }
       }
     },
     "grants": [
       {
         "src": ["alice@example.com"],
         "app": {
           "tailscale.com/cap/aperture": [
             { "role": "user" },
             { "models": "vercel/anthropic/claude-opus-5.5" },
             { "models": "bedrock_mantle/anthropic.claude-opus-5-5" },
             { "models": "anthropic/claude-opus-5-5" }
           ]
         }
       }
     ]
   }
   ```

4. 保存配置。

5. 使用 `claude-opus-5-5` 发送一个请求：

   ```shell
   curl --fail-with-body http://<aperture-hostname>/v1/messages \
     -H "Content-Type: application/json" \
     -H "anthropic-version: 2023-06-01" \
    -d '{"model":"claude-opus-5-5","max_tokens":1024,"messages":[{"role":"user","content":"Reply with hello."}]}'
   ```

6. 确认请求成功，且 **Logs** 中显示模型 `vercel/anthropic/claude-opus-5.5`。

7. 当主提供商发生故障时，在 **Administration** > **Configuration** 中，仅将 `model_aliases.models.claude-opus-5-5` 对象替换为以下对象，以选择 `last`：

   ```json
   {
     "strategy": "last",
     "dst": [
       "vercel/anthropic/claude-opus-5.5",
       "bedrock_mantle/anthropic.claude-opus-5-5",
       "anthropic/claude-opus-5-5"
     ]
   }
   ```

8. 保存配置。

9. 在不更改客户端负载的情况下，原样重复同一个 `curl` 请求：

   ```shell
   curl --fail-with-body http://<aperture-hostname>/v1/messages \
     -H "Content-Type: application/json" \
     -H "anthropic-version: 2023-06-01" \
    -d '{"model":"claude-opus-5-5","max_tokens":1024,"messages":[{"role":"user","content":"Reply with hello."}]}'
   ```

10. 确认请求成功，且 **Logs** 现在显示模型 `anthropic/claude-opus-5-5`。

11. 主提供商恢复后，把 `strategy` 改回 `first` 并保存。

由于 Aperture 只支持 `first` 和 `last` 两种策略，任何策略都不会选中 `bedrock_mantle/anthropic.claude-opus-5-5` 这样的中间条目。要在主、备提供商同时故障期间把流量路由到 Bedrock Mantle，请把 `bedrock_mantle/anthropic.claude-opus-5-5` 移到 `dst` 数组的第一位或最后一位。

提供商切换是手动的。如果被选中的目的地失败，Aperture 不会尝试其他条目。在依赖该切换之前，请审查三个目的地的权限、配额与 hook 覆盖、凭证、API 支持和定价。

### 让模型家族保持在最新已批准版本

使用模型别名提供一个稳定名称（如 `gpt-latest`），让它始终路由到贵组织已批准的旗舰模型。批准新版本后，更新网关配置中的别名目的地即可。客户端应用继续请求 `gpt-latest`，本地无需更改。

在 Aperture 中，"latest" 代表由管理员维护的配置选择。Aperture 不会自动检测上游发布、查询提供商版本 API，也不保证上游可用性。

配置和更新版本化别名的步骤：

1. \[缺失片段：aperture\_admin\_nav.mdx]

2. 确认你的 `openai` 提供商已启用、设置了 `openai_chat: true`，并在其 `models` 数组中显式包含 `gpt-5.5` 和 `gpt-6-sol`。

3. 将以下片段合并进你的配置。把 `alice@example.com` 替换为你的测试用户登录名：

   ```json
   {
     "model_aliases": {
       "models": {
         "gpt-latest": {
           "dst": ["openai/gpt-5.5"]
         }
       }
     },
     "grants": [
       {
         "src": ["alice@example.com"],
         "app": {
           "tailscale.com/cap/aperture": [
             { "role": "user" },
             { "models": "openai/gpt-5.5" },
             { "models": "openai/gpt-6-sol" }
          ]
         }
       }
     ]
   }
   ```

4. 保存配置。

5. 从测试设备使用该别名发送一个请求：

   ```shell
   curl --fail-with-body http://<aperture-hostname>/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-latest","messages":[{"role":"user","content":"Reply with hello."}]}'
   ```

6. 确认请求成功，且仪表板 **Logs** 显示目的地 `openai/gpt-5.5`。

7. 在 **Administration** > **Configuration** 中，仅将 `model_aliases.models.gpt-latest` 对象替换为以下对象：

   ```json
   {
     "dst": ["openai/gpt-6-sol"]
   }
   ```

8. 保存配置。

9. 原样重复同一个 `curl` 请求。确认请求成功，且 **Logs** 现在显示目的地 `openai/gpt-6-sol`。

在批准未来的升级之前，请审查新目的地的能力、成本差异、用户授权、配额和 hook。

### 为用户提供面向任务的模型名称

先评估某个模型在写作任务上的表现，然后给用户一个易于辨认的名称，例如 `writing-assistant`。用户无需知道其提供商专属的模型 ID。别名不会自动出现在模型选择器中。

别名只提供路由上的便利。它不会修改系统提示、强制语气，也不会为底层模型添加专门能力。

配置面向任务的别名的步骤：

1. \[缺失片段：aperture\_admin\_nav.mdx]

2. 确认你的 `openai` 提供商已启用，并在 `models` 中列出了 `gpt-5.4-mini`，同时设置 `openai_chat: true`。

3. 将以下片段合并进你的配置：

   ```json
   {
     "model_aliases": {
       "models": {
         "writing-assistant": {
           "dst": ["openai/gpt-5.4-mini"]
         }
       }
     },
     "grants": [
       {
         "src": ["alice@example.com"],
         "app": {
           "tailscale.com/cap/aperture": [
             { "role": "user" },
             { "models": "openai/gpt-5.4-mini" }
           ]
         }
       }
     ]
   }
   ```

4. 保存配置。

5. 发送一个写作提示的请求：

   ```shell
   curl --fail-with-body http://<aperture-hostname>/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model":"writing-assistant","messages":[{"role":"user","content":"Draft a short meeting follow-up."}]}'
   ```

6. 确认响应返回了生成的文本，且 **Logs** 记录了目的地 `openai/gpt-5.4-mini`。

7. 与你的团队共享确切的别名 `writing-assistant` 以及所支持的 API 要求。告知用户在支持显式模型配置的客户端中直接输入该名称。

## 访问与用量

授权、配额、hook 和用量跟踪都以解析后的目的地为准。捕获的请求体中也包含改写后的目的地模型，而不是别名。

### 授权

Aperture 授权的是对解析后的目的地模型的访问，而不是模型别名名称。要使用某个别名，用户必须拥有：

* 一个 Aperture 角色授权，例如 `{ "role": "user" }`。
* 一个授予目的地模型访问权限的模型能力，例如 `{ "models": "openai/gpt-5.4-mini" }`。设置方法请参阅[授予模型访问权限][docs-grant-model-access]。

如果你为提供商切换配置了多目的地别名，请在发起切换之前向数组中所有目的地授予访问权限。对某个目的地模型的访问也允许用户直接请求该具体模型。模型别名不会阻止直接请求，也不会限制对目的地模型的访问。

要验证访问控制，请用一个独立的用户账户测试反向权限：

1. 找一个具有 `user` 角色的独立测试用户账户。
2. 确认 Aperture 配置或 tailnet 策略文件中没有任何授权向该用户授予对别名目的地模型的访问。保持你的管理员授权不变。
3. 以该测试用户身份发送一个指定别名的请求。
4. 确认 Aperture 返回 HTTP 404，并附带类似 `does not have permission to use model` 的消息，消息中给出的是目的地而非别名。

### 配额

按模型划分的配额评估的是解析后的目的地模型，而不是别名名称。Aperture 评估请求时，会把配额能力与目的地的 FQN 进行匹配。

请注意以下行为：

* **目的地之间共享配额桶**：如果各目的地的授权引用同一个配额桶（例如 `daily:<user>`），无论哪个目的地服务请求，用量都会累积到该桶。更改目的地不会创建别名专属的桶。
* **目的地定价**：Aperture 使用目的地的已配置或推断定价计算成本。切换到定价不同的目的地会改变请求消耗配额的速度。
* **跨模型配额**：不带 `models` 限制的配额能力适用于所有可访问的模型，包括通过别名解析出的任何模型。

完整的配额配置选项和配额桶规则请参阅[配额][docs-quotas-config]。

### Hook

按模型划分的 webhook 评估的是解析后的目的地模型，而不是别名名称。Aperture 匹配 hook 时使用目的地的 FQN。

请注意以下行为：

* **Hook 作用域**：`send_hooks` 限定为某个模型模式的授权，只在解析出的目的地匹配该模式时生效。不带 `models` 限制的 hook 匹配用户可访问的每个模型。
* **Hook 负载元数据**：hook 元数据和 `model` 字段反映的是改写后的目的地模型，而不是别名名称。如果你的 hook 检查模型名称，请将其配置为期待目的地 FQN。
* **请求体捕获**：如果 hook 的 `send` 列表包含 `request_body`，hook 会收到包含目的地模型的改写后 JSON 请求。
* **Hook 定义**：在顶层 `hooks` 映射中定义 hook 并不会把它附加到请求上。必须通过授权的 `send_hooks` 数组来附加 hook。

hook 是策略和监控工具。它们不能改变路由，也不能把别名重定向到其他目的地。hook 设置请参阅 [Hook][docs-hooks-config]。

### 策略集成示例

以下配置片段展示了 `claude-opus-5-5` 多目的地别名场景下授权、配额和 hook 的协同方式。

使用此示例之前，请先在顶层 `quotas` 下定义 `daily:<user>`，并在顶层 `hooks` 下定义名为 `audit` 的 hook。设置方法请参阅[配额][docs-quotas-config]和 [Hook][docs-hooks-config]。请替换为你现有的配额桶和 hook 名称。在提供商切换方案的授权中，把下文所示的 `quotas` 和 `send_hooks` 字段添加到它的三个模型能力上。保留现有的 `src` 和角色。不要添加第二个 `grants` 键。

```json
{
  "grants": [
    {
      "src": ["alice@example.com"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          {
            "models": "vercel/anthropic/claude-opus-5.5",
            "quotas": [{ "bucket": "daily:<user>" }],
            "send_hooks": [
              {
                "name": "audit",
                "events": ["entire_request"],
                "send": ["estimated_cost"]
              }
            ]
          },
          {
            "models": "bedrock_mantle/anthropic.claude-opus-5-5",
            "quotas": [{ "bucket": "daily:<user>" }],
            "send_hooks": [
              {
                "name": "audit",
                "events": ["entire_request"],
                "send": ["estimated_cost"]
              }
            ]
          },
          {
            "models": "anthropic/claude-opus-5-5",
            "quotas": [{ "bucket": "daily:<user>" }],
            "send_hooks": [
              {
                "name": "audit",
                "events": ["entire_request"],
                "send": ["estimated_cost"]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

在此示例中：

* 三个目的地都挂到同一个 `daily:<user>` 配额桶上，在提供商切换之间保持配额跟踪连续。
* 三个目的地都在完成时触发 `audit` hook，发送成本指标而不暴露提示内容。
* 如果你在 `send_hooks` 中选择加入 `request_body`，webhook 会收到包含具体目的地模型的改写后请求。

## 限制

设计别名配置时请注意以下限制：

* **无自动故障转移或负载均衡**：如果被选中的目的地返回错误或不可达，Aperture 不会故障转移到数组中的其他目的地。目的地数组不是自动回退列表。切换需要管理员更新配置。
* **仅限已配置的具体模型**：目的地必须是已启用提供商下配置的具体模型。别名不能指向另一个别名。裸模型名称无法通过目的地校验。提供商 ID `aperture` 为保留 ID。
* **名称冲突**：别名名称会覆盖任何同名的具体模型，包括 Aperture 聊天界面使用的模型。在本页示例中，定义别名 `claude-opus-5-5` 是有意与具体模型名匹配，把对该模型的请求重定向到别名目的地。请避免意外的名称冲突截获本应发给其他模型的流量。
* **仅支持受支持的 API 和显式模型名称**：请使用受支持的请求格式和接受显式模型名称的客户端。别名不会向模型列表或选择器添加条目。请参阅[支持的请求与模型发现][ar-supported-requests-and-model-discovery]。

## 故障排除

在仪表板或通过 API 保存配置时，Aperture 会校验别名结构和目的地要求。错误（error）和警告（warning）都会导致保存被拒。

### 配置错误

对于使用已弃用 `virtual` 的配置，校验消息会使用 `virtual.` 前缀而不是 `model_aliases.`。

以下结构性校验错误会阻止保存配置：

| 条件                                              | 错误或警告消息                                                                                 | 类型    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------- |
| 顶层策略无效                                      | `model_aliases.strategy: invalid value "{value}" (valid: "first", "last")`                     | 错误    |
| 别名名称为空                                      | `model_aliases.models: model id must not be empty`                                             | 错误    |
| 别名对象为 null                                   | `model_aliases.models.{alias}: model config must not be null`                                  | 错误    |
| 每别名策略无效                                    | `model_aliases.models.{alias}.strategy: invalid value "{value}" (valid: "first", "last")`      | 错误    |
| 目的地列表缺失或为空                              | `model_aliases.models.{alias}.dst: must contain at least one destination`                      | 错误    |
| 目的地字符串为空                                  | `model_aliases.models.{alias}.dst[{index}]: destination must not be empty`                     | 错误    |
| 目的地字符串格式错误                              | `model_aliases.models.{alias}.dst[{index}]: "{destination}" is not a valid provider/model FQN` | 错误    |
| `model_aliases` 与 `virtual` 同时包含值           | `model_aliases and virtual must not both be nonempty; use model_aliases instead of virtual`    | 警告    |

以下目的地校验错误会阻止保存配置：

| 条件                                                     | 错误消息                                                                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 提供商未配置，或使用了保留 ID `aperture`                 | `model_aliases.models.{alias}.dst[{index}]: provider "{provider}" is not configured`                     |
| 提供商已禁用                                             | `model_aliases.models.{alias}.dst[{index}]: provider "{provider}" is disabled`                           |
| 模型未显式列入提供商的 `models` 数组                     | `model_aliases.models.{alias}.dst[{index}]: model "{model}" is not configured for provider "{provider}"` |
| 各目的地没有共享任何 API 兼容性标志                      | `model_aliases.models.{alias}.dst: destinations do not share any API compatibility: {details}`           |

`dst` 数组中的每个目的地在保存时都会被校验。如果某个未启用的目的地违反任何条件，Aperture 会拒绝整个配置更新。

### 请求失败

如果使用模型别名的请求在运行时失败，请检查以下原因：

| 现象                               | 诊断检查                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP 403 禁止访问                  | 确认用户拥有 Aperture 角色授权（`{ "role": "user" }` 或 `{ "role": "admin" }`）。                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| HTTP 404 未找到                    | 检查请求中的别名是否与配置键完全一致。如果别名已解析，检查用户是否拥有对解析出的目的地模型的授权，以及目的地是否支持所请求的 API 格式。Aperture 会返回 `no providers match model`、`no route found for model`、`does not have permission to use model` 或 `model "..." is available via ..., not ...` 等消息。别名匹配时，错误消息给出的是解析后的目的地而不是别名。                                                                                                                                                  |
| HTTP 429 请求过多                  | 在响应和 **Logs** 中检查是否有配额拒绝或上游限流。Aperture 配额错误在 OpenAI 请求中使用 `insufficient_quota`，在 Anthropic 请求中使用 `rate_limit_error`。诊断方法请参阅 [Aperture 故障排除][docs-troubleshooting]。                                                                                                                                                                                                                                                                                                        |
| 客户端找不到或无法选择别名         | 模型别名不会出现在 `/v1/models` 响应或 Aperture 聊天选择器中。请使用支持输入显式模型名称的客户端。                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 上游提供商错误                     | 确认上游提供商凭证有效且有权限调用解析出的模型，并且提供商端点运行正常。                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

网关路由、身份验证和日志的一般问题请参阅 [Aperture 故障排除][docs-troubleshooting]。

[ar-give-users-a-task-focused-model-name]: #为用户提供面向任务的模型名称

[ar-keep-a-model-family-on-the-latest-approved-version]: #让模型家族保持在最新已批准版本

[ar-supported-requests-and-model-discovery]: #支持的请求与模型发现

[ar-switch-providers-without-changing-the-client-model-name]: #不更改客户端模型名称切换提供商

[docs-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-chat-models]: /docs/aperture/configuration#chat_models

[docs-dashboard-logs]: /docs/aperture/reference/dashboard-admin#logs

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-hooks-config]: /docs/aperture/configuration#hooks

[docs-how-grants-work]: /docs/aperture/how-grants-work

[docs-provider-compatibility]: /docs/aperture/provider-compatibility

[docs-quotas-config]: /docs/aperture/configuration#quotas

[docs-tailnet]: /docs/reference/glossary#tailnet

[docs-troubleshooting]: /docs/aperture/troubleshooting

[docs-use-anthropic]: /docs/aperture/how-to/use-anthropic

[docs-use-openai]: /docs/aperture/how-to/use-openai

[docs-use-vercel]: /docs/aperture/how-to/use-vercel

[xt-bedrock-api-keys]: https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html

[xt-bedrock-opus-model-card]: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-5-5.html
