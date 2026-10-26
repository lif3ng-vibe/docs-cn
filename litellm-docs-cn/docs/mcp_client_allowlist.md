import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# MCP 客户端应用白名单

通过白名单，可以把 MCP（Model Context Protocol）网关的访问范围限制在已批准的客户端应用内，例如 Claude Code、Cursor 或内部 CLI。LiteLLM 会在认证完成后校验客户端身份，不在允许列表中则返回 HTTP 403。

白名单在整个网关范围内生效。已有的 [MCP 服务器权限](./mcp_control.md)对被允许的客户端依然适用。

## 配置客户端身份

配置好 [JWT 认证](./proxy/token_auth.md)后，将 `mcp_client_id_jwt_field` 设置为能在访问令牌（access token）中标识客户端应用的声明（claim）：

| 身份提供方或令牌格式 | 客户端 ID 声明 |
| --- | --- |
| [Okta](https://developer.okta.com/docs/api/openapi/okta-oauth/guides/overview/) | `cid` |
| [Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/access-token-claims-reference)，v2 令牌 | `azp` |
| Microsoft Entra ID，v1 令牌 | `appid` |
| [RFC 9068](https://www.rfc-editor.org/rfc/rfc9068.html) 访问令牌 | `client_id` |

例如，将这条声明配置加入你的 JWT 配置中，然后重启代理：

```yaml title="config.yaml"
general_settings:
  enable_jwt_auth: true
  litellm_jwtauth:
    mcp_client_id_jwt_field: azp
```

嵌套声明支持点号写法。启用该设置后，JWT 调用方必须携带匹配的声明，请求头无法替代缺失或未列出的声明。

## 添加允许的客户端

每个条目有两个字段：

| 字段 | 用途 |
| --- | --- |
| `alias` | 在管理界面（Admin UI）和网关日志中显示的名称。 |
| `value` | 令牌中的客户端 ID。匹配完全一致且区分大小写。 |

下例以 `antigravity-cli` 和 `claude-code` 作为示例客户端 ID，请改用身份提供方为你签发的实际值。

<Tabs>
<TabItem value="ui" label="Admin UI" default>

打开 **MCP 服务器 → 网络设置 → 允许的客户端**。

<Image
  img={require('../img/mcp_client_allowlist_ui_empty.png')}
  alt="MCP 网络设置中的允许客户端区块"
  style={{width: '100%', display: 'block', margin: '0'}}
/>

点击 **添加客户端**，填写 **别名**和**值**，再点击 **添加**。对每个已批准的应用重复此操作，最后点击 **保存**。只使用 JWT 访问时，**客户端身份请求头**留空即可。

<details>
<summary>编辑或移除客户端</summary>

点击某个客户端卡片，编辑其字段后点击 **完成**，再点击 **保存**。要移除客户端，选择 **移除客户端**，然后点击 **保存**。

<Image
  img={require('../img/mcp_client_allowlist_ui_edit_dialog.png')}
  alt="客户端对话框，含别名、值和移除客户端按钮"
  style={{width: '420px', maxWidth: '100%', display: 'block', margin: '0'}}
/>

</details>

</TabItem>
<TabItem value="config" label="config.yaml">

在 `general_settings` 下添加 `mcp_allowed_clients`，然后重启代理：

```yaml title="config.yaml"
general_settings:
  mcp_allowed_clients:
    - alias: Antigravity CLI
      value: antigravity-cli
    - alias: Claude Code
      value: claude-code
```

</TabItem>
<TabItem value="api" label="API">

```bash
curl "$LITELLM_PROXY_URL/config/field/update" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "field_name": "mcp_allowed_clients",
    "field_value": [
      {"alias": "Antigravity CLI", "value": "antigravity-cli"},
      {"alias": "Claude Code", "value": "claude-code"}
    ],
    "config_type": "general_settings"
  }'
```

</TabItem>
</Tabs>

`config.yaml` 中定义的设置具有更高优先级，无法通过管理界面或 API 更改。UI 和 API 的更新会写入数据库。使用管理界面或 API 时请启用 `store_model_in_db: true`，让所有 worker 都能加载并刷新数据库中的设置。

## 验证访问

用被允许客户端的有效访问令牌调用 [MCP REST API](./mcp_rest_api.md)：

```bash
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' \
  "$LITELLM_PROXY_URL/mcp-rest/tools/list" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

再用未列入白名单的客户端的有效令牌，以及令牌中缺少所配置声明的客户端，各验证一次。

| 令牌 | 预期结果 |
| --- | --- |
| 客户端声明匹配某个允许的 `value` | HTTP 200 |
| 客户端声明未列出或缺失 | HTTP 403 |

被拒绝的请求会以 `Rejected MCP request from a disallowed client application: ...` 记入日志。通过客户端检查并不会因此获得对更多 MCP 服务器或工具的访问权限。

## 可选的请求头身份

对于不使用 JWT 认证的调用方，可在管理界面中设置 **客户端身份请求头**并点击**保存**，或将其加入配置文件后重启代理：

```yaml title="config.yaml"
general_settings:
  mcp_client_id_header: x-mcp-client
```

<Image
  img={require('../img/mcp_client_allowlist_ui_saved.png')}
  alt="已保存的客户端条目与可选的 x-mcp-client 身份请求头"
  style={{width: '100%', display: 'block', margin: '0'}}
/>

请求中的 `x-mcp-client` 值必须与某个被允许客户端的 `value` 一致。未配置 `mcp_client_id_jwt_field` 时，同样会使用请求头身份；配置了该 JWT 设置后，JWT 调用方不能回退到请求头。

:::warning[客户端自行提供的身份]

请求头可被客户端随意篡改。要获得可信的应用身份，请使用 JWT 客户端声明。

:::

## 作用范围与默认行为

该检查覆盖 `/mcp`、`/mcp/sse`、`/mcp-rest/tools/list` 和 `/mcp-rest/tools/call`。

| `mcp_allowed_clients` | 行为 |
| --- | --- |
| 未设置或为 `null` | 客户端过滤处于关闭状态。 |
| 有效且非空的列表 | 仅匹配的客户端身份可以通过。 |
| `[]` 或无效列表 | 受白名单约束的请求会被拒绝。条目必须包含非空的 `alias` 和 `value` 字符串。 |

仪表板会话令牌不受此检查约束，即使在仪表板之外使用也是如此。其有效期由 `LITELLM_UI_SESSION_DURATION` 控制（默认 24 小时）。管理界面的连接测试路由同样豁免。

## 移除或修复白名单

要在管理界面中关闭客户端过滤，删除所有客户端卡片后点击 **保存** 即可，该设置会随之删除。而通过 API 或配置保存 `[]` 则会拒绝受白名单约束的客户端。

通过 API 删除存放在数据库中的白名单：

```bash
curl "$LITELLM_PROXY_URL/config/field/delete" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"field_name": "mcp_allowed_clients", "config_type": "general_settings"}'
```

存储的列表为空或无效时会显示警告。添加有效的客户端条目并保存，即可恢复受限访问；也可以不添加任何条目直接保存，以关闭过滤。

<Image
  img={require('../img/mcp_client_allowlist_ui_deny_all.png')}
  alt="警告提示：存储的白名单会拒绝客户端访问"
  style={{width: '100%', display: 'block', margin: '0'}}
/>
