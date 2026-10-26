import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 为密钥和团队授予 MCP 服务器访问权限

本指南演示如何把一台 MCP 服务器授予虚拟密钥（virtual key）和团队，先在管理界面（Admin UI）中操作，再通过管理 API 完成，并展示当密钥和团队同时带有授权时，实际访问权限如何裁定。规则本身（六级交集、`no-mcp-servers`、`require_key_mcp_access_defined`、访问组、实体级工具权限）记录在 [MCP 权限管理](./mcp_control)中；本页讲的是应用这些规则的具体操作。

## 开始之前

首先要注册 MCP 服务器：可以在 `config.yaml` 的 `mcp_servers` 下配置，也可以在管理界面的 **MCP Servers** 页面添加（见 [MCP 网关](./mcp#添加你的-mcp)）。下文的每一条授权都通过 `server_id`（在界面中添加的服务器是一个 UUID）或 `server_name` 别名（即配置键，例如 `deepwiki`）来引用服务器。API 同时接受这两种形式，并解析到同一台服务器。

如果多台服务器总是需要一起授予，可以把它们放进[访问组（access group）](./mcp_control#mcp-分组访问组)，改为授予整个组。如果密钥或团队只需要看到跨服务器挑选的一小部分工具，可以创建[工具集（toolset）](./mcp_toolsets)并授予它。

## 授权字段

MCP 访问权限保存在密钥或团队的 `object_permission` 块中。同样的四个字段对两者都适用，并且与管理界面 **MCP Settings** 区域中的控件一一对应。

| 字段 | 类型 | 授予的内容 |
|-------|------|----------------|
| `mcp_servers` | `list[str]` | 实体可访问的服务器 ID 或别名。哨兵值 `no-mcp-servers` 会阻断所有 MCP 访问，见 [将密钥排除在所有 MCP 服务器之外](./mcp_control#将密钥排除在所有-mcp-服务器之外no-mcp-servers) |
| `mcp_access_groups` | `list[str]` | 访问组名称。组内每台服务器都会被授予 |
| `mcp_toolsets` | `list[str]` | 工具集 ID。授予工具集所来源的服务器，但仅限于其中列出的工具 |
| `mcp_tool_permissions` | `dict[str, list[str]]` | 按服务器划分的工具允许列表，以服务器 ID 或别名为键。省略某台服务器即允许其全部工具。出现在这里的服务器即使不在 `mcp_servers` 中，也视为已授予 |

一个这些字段都没设置的密钥或团队，自身没有 MCP 限制；运行时的实际效果取决于其他层级，见[密钥与团队授权如何生效](#密钥与团队授权如何生效)。

## 为虚拟密钥授予 MCP 服务器

### Admin UI

在左侧边栏打开 **Virtual Keys**（`http://localhost:4000/ui/api-keys`），点击 **+ Create New Key**。像往常一样填写所有者、密钥名称和模型，然后向下滚动，展开 **MCP Settings** 折叠面板。**Allowed MCP Servers** 选择器会列出所有已注册的服务器、访问组和工具集，还有一个 **No MCP Servers** 选项，用于阻断该密钥的所有 MCP 访问。

<Image
  img={require('../img/mcp_grant_key_selector.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
  alt="创建新密钥表单上的 Allowed MCP Servers 选择器，列出 No MCP Servers、一个访问组、一台 MCP 服务器和一个工具集"
/>

选择一个或多个条目。每个选中的服务器（包括从访问组解析出来的服务器）都会在下方展开工具列表，所有工具默认开启。取消勾选某个工具即可将其从密钥中移除；表头会显示还剩多少工具被允许。点击 **Create Key**，并在确认对话框中复制密钥。

<Image
  img={require('../img/mcp_grant_key_tools.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
  alt="创建新密钥表单上的 MCP Settings，选中 deepwiki 服务器，三个工具中允许两个"
/>

所选内容会保存为 `object_permission.mcp_servers`（或 `mcp_access_groups` / `mcp_toolsets`，取决于你选了什么），工具开关则保存为 `object_permission.mcp_tool_permissions`。可以用 `GET /key/info?key=<key>` 读回。

要修改已有密钥，在 **Virtual Keys** 表格中点击该密钥，打开其 **Settings** 标签页，点击 **Edit Settings**，修改 **MCP Servers / Access Groups** 和工具开关，然后点击 **Save Changes**。

### API

`POST /key/generate` 直接内联接受授权参数。下面的示例授予一台服务器，并把密钥限制在它的两个工具上：

```bash title="创建带 MCP 授权的密钥" showLineNumbers
curl -X POST "http://localhost:4000/key/generate" \
  -H "Authorization: Bearer sk-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "key_alias": "wiki-reader",
    "team_id": "<team-id>",
    "object_permission": {
      "mcp_servers": ["deepwiki"],
      "mcp_tool_permissions": {
        "deepwiki": ["read_wiki_structure", "read_wiki_contents"]
      }
    }
  }'
```

`POST /key/update` 接受同样的块，外加要修改的 `key`。发送的字段会替换该字段已保存的值，省略的字段保持不变，因此给上面的密钥加一个工具集，`mcp_servers` 和 `mcp_tool_permissions` 会原样保留：

```bash title="给已有密钥添加工具集" showLineNumbers
curl -X POST "http://localhost:4000/key/update" \
  -H "Authorization: Bearer sk-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "sk-...",
    "object_permission": {
      "mcp_toolsets": ["<toolset-id>"]
    }
  }'
```

要授予访问组中的每台服务器，发送 `"mcp_access_groups": ["research"]` 而不是 `mcp_servers`。要阻断所有 MCP 访问，发送 `"mcp_servers": ["no-mcp-servers"]`。

用密钥本身列出工具，确认密钥实际能看到什么：

```bash showLineNumbers
curl -s "http://localhost:4000/mcp-rest/tools/list" \
  -H "Authorization: Bearer sk-..." | jq '[.tools[] | .name]'
```

```json
["read_wiki_contents", "read_wiki_structure"]
```

## 为团队授予 MCP 服务器

### Admin UI

在左侧边栏打开 **Teams**（`http://localhost:4000/ui/teams`），点击 **Create Team**。填写团队名称和模型，然后展开 **MCP Settings** 折叠面板。**Allowed MCP Servers** 选择器提供的服务器、访问组和工具集与密钥表单相同。选中一个访问组后，会显示它解析出的每台服务器，并标注所属组名，你仍然可以按服务器逐个开关工具。点击 **Create Team**。

<Image
  img={require('../img/mcp_grant_team_access_group.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
  alt="创建团队表单上的 MCP Settings，选中 research 访问组，并通过它解析出 deepwiki 服务器"
/>

要修改已有团队，在 **Teams** 表格中点击该团队，打开其 **Settings** 标签页，点击 **Edit Settings**，修改 **MCP Servers / Access Groups** 和工具开关，然后点击 **Save Changes**。属于该团队的密钥会继承新的授权；密钥本身无需任何修改。

### API

`POST /team/new` 和 `POST /team/update` 接受与密钥端点相同的 `object_permission` 块，更新时用 `team_id` 指定团队：

<Tabs>
<TabItem value="new" label="/team/new">

```bash title="创建带 MCP 授权的团队" showLineNumbers
curl -X POST "http://localhost:4000/team/new" \
  -H "Authorization: Bearer sk-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "team_alias": "research-team",
    "object_permission": {
      "mcp_servers": ["deepwiki"],
      "mcp_access_groups": ["research"],
      "mcp_toolsets": ["<toolset-id>"],
      "mcp_tool_permissions": {
        "deepwiki": ["read_wiki_structure", "read_wiki_contents"]
      }
    }
  }'
```

</TabItem>
<TabItem value="update" label="/team/update">

```bash title="替换团队的服务器列表，其余保持不变" showLineNumbers
curl -X POST "http://localhost:4000/team/update" \
  -H "Authorization: Bearer sk-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "team_id": "<team-id>",
    "object_permission": {
      "mcp_servers": ["deepwiki"]
    }
  }'
```

</TabItem>
</Tabs>

`/team/update` 的合并逻辑与 `/key/update` 相同：只替换你发送的字段。用 `GET /team/info?team_id=<team-id>` 读回已保存的授权；它返回在 `team_info.object_permission` 下。

## 通过 SCIM 预配的团队授予 MCP 访问权限

当你的身份提供商（IdP）通过 [SCIM](./tutorials/scim_litellm) 预配（provision）LiteLLM 时，给 IdP 用户组授予 MCP 访问权限的受支持方式，是通过 SCIM 为该组创建的 LiteLLM 团队。SCIM 会把用户组同步成一个团队，并保持其成员列表最新；你只需在该团队上授予一次 MCP 服务器或访问组，每个成员都能通过所属团队的密钥访问它们。

```text
IdP group -> SCIM /scim/v2/Groups -> LiteLLM team (team_id, members) -> team object_permission -> team keys
```

### 1. 将用户组预配为团队

在 IdP 中把用户组分配给 LiteLLM 应用，具体见 [SCIM with LiteLLM](./tutorials/scim_litellm#3-test-scim-connection)。随后 IdP 会发送如下所示的 SCIM 用户组。LiteLLM 会创建一个团队：`team_id` 取用户组的 `id`（未发送 `id` 时取 `externalId`），`team_alias` 取用户组的 `displayName`，成员取用户组的 `members`。

```bash title="IdP 发送的 SCIM 用户组" showLineNumbers
curl -X POST "http://localhost:4000/scim/v2/Groups" \
  -H "Authorization: Bearer <scim-token>" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    "externalId": "6f1c2e1a-entra-research",
    "displayName": "Research Engineers",
    "members": [{"value": "alice@example.com"}]
  }'
```

这会创建名为 `Research Engineers`、`team_id` 为 `6f1c2e1a-entra-research` 的团队。可以在管理界面的 **Teams** 中查找，或用 `GET /team/info?team_id=6f1c2e1a-entra-research` 查询。

### 2. 为该团队授予 MCP 访问权限

用与其他团队相同的方式，把访问组（或单台服务器）授予该团队，见[为团队授予 MCP 服务器](#为团队授予-mcp-服务器)。在管理界面中，从 **Teams** 打开该团队，进入 **Settings**，点击 **Edit Settings**，在 **MCP Servers / Access Groups** 下选择访问组，然后点击 **Save Changes**。组内每台服务器都会连同其工具一起列出，并标注来源的访问组。

<Image
  img={require('../img/mcp_scim_team_settings.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
  alt="SCIM 预配团队设置中的 MCP Servers / Access Groups，选中 research 访问组，并通过它解析出 wiki 服务器"
/>

通过 API，则用 SCIM 团队的 `team_id` 调用 `/team/update`：

```bash title="把 research 访问组授予 SCIM 团队" showLineNumbers
curl -X POST "http://localhost:4000/team/update" \
  -H "Authorization: Bearer sk-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "team_id": "6f1c2e1a-entra-research",
    "object_permission": {
      "mcp_access_groups": ["research"]
    }
  }'
```

此后，团队的 **Overview** 标签页会在 **Object Permissions** 下显示这条授权，`GET /team/info` 也会在 `team_info.object_permission` 下返回它。

<Image
  img={require('../img/mcp_scim_team_overview.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
  alt="SCIM 预配的 Research Engineers 团队概览，Object Permissions 下的 MCP Servers 列出了 research 访问组"
/>

后续的 SCIM 同步会保留这条授权。来自 IdP 的用户组 `PUT` 和 `PATCH` 请求（重命名、成员增删）只更新团队别名、元数据和成员；不会改动 `object_permission`。

### 3. 给成员发放团队密钥

成员通过所属团队的密钥访问 MCP：在 **Virtual Keys** 中创建密钥时选择该团队，或者给 `/key/generate` 传入 `team_id`。自身没有 MCP 授权的团队密钥会继承团队的授权，参见[密钥与团队授权如何生效](#密钥与团队授权如何生效)。不在该团队中的个人密钥不会获得团队的授权，即使其所有者是团队成员也一样。

```bash title="检查团队密钥能访问什么" showLineNumbers
curl "http://localhost:4000/mcp-rest/tools/list" \
  -H "Authorization: Bearer <team-key>"
```

响应只列出 `research` 访问组内服务器的工具。对授权范围之外的服务器调用工具会返回 `403`，错误信息为 `The key is not allowed to access server <server>`。

当 IdP 把用户从用户组移除时，LiteLLM 会将其移出团队，并删除其在该团队下的密钥。用户被重新加回时，需要重新创建团队密钥。

如果调用方使用 JWT 而非虚拟密钥认证，令牌只有在解析到该 SCIM 团队时才能拿到团队的 MCP 授权，例如在配置为 `team_ids_jwt_field` 的声明（claim）中列出该团队的 `team_id`，参见[用团队控制模型访问](./proxy/token_auth#用团队控制模型访问)。

### 不支持将声明直接映射为访问权限

LiteLLM 不会把 IdP 声明直接映射为 MCP 访问组，这是有意为之的设计。SCIM 的 `groups[].value`、`roles` 或 `entitlements` 值，或某个 JWT 声明，即便写明了某个 MCP 访问组，本身也不会授予任何权限：SCIM 的 `groups[].value` 条目会被读取为 LiteLLM 的 `team_id`，`roles` 和 `entitlements` 仅作为元数据存储，`litellm_jwtauth` 中也没有任何配置会从令牌读取 MCP 访问组。让 IdP 负责谁属于哪个组，让 LiteLLM 团队的 `object_permission` 负责该组能访问什么，每条 MCP 授权就只有一条可审计的路径，在团队上即可查验。

## 密钥与团队授权如何生效

完整规则见 [权限层级](./mcp_control#权限层级)和[实体级工具权限](./mcp_control#per-entity-tool-level-permissions)。下面列出的是只有密钥及其团队带有授权时会遇到的情况，按 LiteLLM 应用的先后顺序排列。

自身没有 MCP 授权的密钥会继承团队的授权。团队允许的每台服务器、每个工具都对密钥可用，除此之外再无其他。若在 `general_settings` 中设置 `require_key_mcp_access_defined: true`，同一个密钥在被显式授权之前拿不到任何 MCP 服务器，参见[要求密钥自定义 MCP 访问](./mcp_control#要求密钥自行定义-mcp-访问权限)。

当密钥和团队都列出服务器时，密钥能访问的是交集。工具权限同样按服务器取交集：团队允许 `deepwiki` 上的两个工具，而密钥只允许其中一个，结果就是这一个工具。如果只有一方为某台服务器设置了 `mcp_tool_permissions`，则该方的列表原样生效。

在同一个层级内，工具集与直接的 `mcp_tool_permissions` 条目先做并集，然后再跨层级取交集。密钥若被授予工具集 `wiki_readonly`（两个读取工具），同时又设置 `mcp_tool_permissions: {"deepwiki": ["read_wiki_structure"]}`，那么它能看到两个读取工具，而不只是直接写明的那一个。

密钥上的 `no-mcp-servers` 优先于任何团队授权。即使团队允许该服务器，`tools/list` 也返回空列表，`tools/call` 会被拒绝。

团队内的密钥只能被授予团队已允许的服务器（或标记为 `allow_all_keys` 的服务器）。`/key/generate` 和 `/key/update` 在写入时强制执行这一点（管理界面也通过相同的端点保存），并返回 `403`：

```text
Key requests MCP servers not allowed by team '<team-id>': ['<server-id>']. Team allows: ['<server-id>']. Global (allow_all_keys) servers: [].
```

不在团队中的密钥，代理管理员可以授予任意服务器；非管理员调用方只能给这类密钥授予 `allow_all_keys` 服务器。密钥已持有的服务器在 `/key/update` 时按存量保留，因此缩小团队的服务器列表不会破坏已有密钥，除非你尝试添加新的服务器。

组织、内部用户、最终用户和 agent 的授权位于密钥和团队之上，只会进一步收窄结果。收窄发生在 `tools/list` 时，也会在 `tools/call` 时再次执行，因此有效集合之外的工具既不会被列出，也无法调用。

### 具体示例

团队 `research-team` 通过 `mcp_tool_permissions: {"deepwiki": ["read_wiki_structure", "read_wiki_contents"]}` 允许 `deepwiki`，并带有工具集 `wiki_readonly`（同样的两个工具）。

| 密钥授权 | `deepwiki` 上实际可用的工具 |
|-----------|-------------------------------|
| 无 | `read_wiki_structure`、`read_wiki_contents`（继承自团队） |
| `mcp_servers: ["deepwiki"]`，`mcp_tool_permissions: {"deepwiki": ["read_wiki_structure"]}` | `read_wiki_structure`（交集） |
| 上一行再加 `mcp_toolsets: ["wiki_readonly"]` | `read_wiki_structure`、`read_wiki_contents`（先在密钥层取并集，再与团队取交集） |
| `mcp_servers: ["no-mcp-servers"]` | 无，`tools/list` 为空 |
| `mcp_servers: ["deepwiki_backup"]`（团队不允许） | 写入被拒绝，返回 `403` |

## 相关文档

[MCP 权限管理](./mcp_control)介绍规则及其余层级（组织、内部用户、最终用户、agent），[MCP 工具集](./mcp_toolsets)介绍如何创建工具集，[Agent 权限管理](./a2a_agent_permissions)介绍 agent 授权，[MCP 网关](./mcp)介绍如何注册服务器。
