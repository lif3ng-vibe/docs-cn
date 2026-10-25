---
title: "内置连接器"
description: "Aperture 自带两个工具随产品内置而非来自上游 MCP 服务器的连接器：**Tailnet** 和 **Tailscale SSH**。两者都通过 Tailscale 本身对你的 tailnet 执行操作。"
---

最后验证于 Sep 29, 2026

> **注意：** 内置 Tailnet 连接器目前处于 alpha 阶段。

Aperture 自带两个工具随产品内置而非来自上游 MCP 服务器的连接器：**Tailnet** 和 **Tailscale SSH**。两者都通过 Tailscale 本身对你的 tailnet 执行操作，因此不需要外部 MCP 服务器或第三方凭证。

本主题面向设置这些连接器并向用户授权的 Aperture 管理员。

以下工作可以使用这些连接器完成：

* 把新的应用、服务或机器加入用户的 tailnet。
* 发现启用了 [Tailscale SSH][docs-tailscale-ssh] 的 tailnet 机器。
* 在其中某台机器上运行 shell 命令。

管理员必须先设置每个连接器，用户才能使用。未配置的内置连接器会出现在 Chat **Connectors** 的 **Available to add** 下。只有管理员能访问 **Configure**。引导式设置会创建连接器，并把访问权限授予执行设置的管理员。其他所有用户或组的访问权限保持默认拒绝。

Tailscale SSH 的设置大约需要一分钟。Tailnet 的设置大约需要十分钟，因为你需要先创建一个 Tailscale OAuth 应用。

## 前提条件

开始之前，你需要：

* Aperture 中的[管理员角色][docs-set-up-admin-access]，用于设置连接器和编辑授权。
* 对于 tailnet 连接器，需要有在你的 tailnet 中创建 Tailscale OAuth 应用的权限——这要求你在该 tailnet 中拥有 [Owner](/docs/reference/user-roles) 或 [Admin](/docs/reference/user-roles) 角色——以及一个 Tailscale API 访问令牌。
* 对于 Tailscale SSH 连接器，目标机器需启用 Tailscale SSH，并且你的 tailnet 策略必须允许 Aperture 节点连接它们。

## 内置连接器与其他连接器的区别

配置之前，Tailnet 和 Tailscale SSH 显示在 **Available to add** 下。配置后，被授权的用户会在 **Ready to use** 下看到它们，并可以查看其工具。这些工具由 Aperture 提供，其工具集可能随 Aperture 版本更新而变化。

这两个连接器与系统连接器（system connector）的区别：

* `system` 标签和内置连接器是两个不同的概念。两个引导式设置的标签都是 `restricted`，该标签本身不授予任何权限。出厂默认配置授予 `label:system`，它只覆盖内置的 `aperture` 连接器。Tailnet 和 Tailscale SSH 不会获得该标签，你也不能给它们打上：Aperture 会从每个 `connectors.servers` 条目中剥除保留的 `system` 标签，并报告一个阻止保存的警告。请改为按 ID 授权这些连接器。参阅[保留的 `system` 标签][docs-connectors-reference-labels]。

## 在哪里定义授权

本主题中的授权示例展示的是单个 `connectors` 能力条目。把每个条目添加到 `src` 指明需要该连接器的用户或组的授权中，位置在以下两处之一：

* 在 Aperture 网关配置中添加授权。\[Missing snippet: aperture\_admin\_nav.mdx] 可使用可视化授权编辑器，或在 **Administration** > **Configuration** 上以 JSON 编辑同一个 `grants` 数组。
* 在 tailnet 策略文件中添加授权。把它加入 Aperture 网关所属 tailnet 的 `grants` 数组。

以下示例展示一条完整的 Aperture 配置授权，把 tailnet 连接器的所有工具授予 `ai-users` 组：

```json
{
  "grants": [
    {
      "src": ["group:ai-users"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "connectors": ["Tailnet/**"] }
        ]
      }
    }
  ]
}
```

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

引导式设置会为执行设置的管理员添加 `<connector-id>/**` 授权。其他所有用户或组的授权需手动添加。Chat 会省略被授权拒绝的已配置连接器。

`connectors` 模式的第一段是连接器 ID，即 `connectors.servers` 下的键，而不是 `provider` 值。引导式设置使用 `Tailnet` 和 `TailnetSSH` 作为 ID。如果你选择了其他 ID，授权中也要使用它。ID 必须以字母开头，且只能包含字母和数字。

`provider` 值是固定的且区分大小写：必须是 `Tailnet` 或 `TailnetSSH`。Aperture 会把其他值当作未知提供商拒绝。

## Tailnet 连接器

tailnet 连接器返回一个单次使用的认证密钥（auth key），智能体可以用它代表用户把一个新节点加入其 tailnet。

该连接器提供一个工具：

| 工具 | 客户端可见名称 | 功能 |
| --- | --- | --- |
| `provision_node` | `Tailnet_provision_node` | 启动一次性的浏览器授权，用户批准后返回单次使用的 Tailscale 认证密钥。 |

当智能体需要把新的应用或服务带入 tailnet 时，使用该连接器。智能体不持有任何长期共享凭证；它会出示一个授权链接由人来批准，只有批准之后 Aperture 才返回单次使用的认证密钥。

### 第 1 步：设置连接器

使用引导式设置创建具备 `provision_node` 所需作用域和节点属性的 Tailscale OAuth 应用，然后保存连接器配置。

设置连接器：

1. 打开 Chat **Connectors**。
2. 展开 **Available to add**。

1) 选择 **Tailnet** 旁边的 **Configure**。连接器详情页会打开 **Configure Tailnet** 区域。

1. 在 [Tailscale 管理控制台][docs-api-access-tokens]的 **Keys** 页面生成一个带 admin 作用域的 Tailscale API 访问令牌。
2. 在终端中把该令牌导出为 `TS_API_TOKEN`。
3. 复制面板 **Terminal** 区块中的命令，并在同一终端会话中运行，以创建 OAuth 应用。
4. 把响应中的 `clientSecret` 粘贴到 **Client secret**。
5. 选择 **Configure**。

例如，在 Bash 或 Zsh 中，以下命令会提示输入 API 访问令牌（不回显）并将其导出，供你从面板复制的命令使用：

```shell
printf "Paste your Tailscale API access token: " \
  && read -rs TS_API_TOKEN \
  && export TS_API_TOKEN \
  && echo
```

面板命令中包含你的 Aperture 网关的回调 URL。请直接使用该命令，不要替换成其他主机名或连接器 ID。

默认情况下，被预配的设备带有 `custom:createdByAperture` 和 `custom:createdByAI` 节点属性，用于标识它们由 Aperture 创建且由 AI 创建。可以在[设备态势][docs-device-posture]条件和[授权][docs-node-attributes]中引用这些属性，按设备的加入方式控制访问。OAuth 应用完整参考参阅[使用 OAuth 应用预配设备][docs-device-provisioning]。

> **注意：**
>
> 客户端密钥是必需的。Aperture 会从中读出客户端 ID，因此任何不是 `tskey-app-<id>-<secret>` 形式的密钥都会被 Aperture 拒绝。

### 第 2 步：授予访问权限

引导式设置会把访问权限授予执行设置的管理员。为其他需要该工具的用户添加 `connectors` 授权，位置见[在哪里定义授权][ar-where-to-define-grants]。只授予预配工具本身：

```json
{ "connectors": ["Tailnet/tools/provision_node"] }
```

授予连接器的所有工具：

```json
{ "connectors": ["Tailnet/**"] }
```

完整的模式语法参阅[授予 MCP 工具访问权限][docs-grant-mcp-tool-access]。

### 授权流程

该连接器不使用 **Connect** 按钮。授权从工具发起，每个被预配的节点运行一次：

1. 智能体不带参数调用 `Tailnet_provision_node`。
2. Aperture 返回一个授权链接。智能体在 chat 中把它呈现为可点击链接，标注为“Authorize deploying the application to my tailnet”，而不会粘贴原始 URL。
3. 用户打开链接并批准请求。
4. 智能体再次调用该工具。
5. Aperture 返回单次使用的认证密钥。

链接会打开 Tailscale 的 OAuth 同意页面。批准即表示用户允许智能体收集一个单次使用、短期的认证密钥，并用它代表用户把一台设备连接到 tailnet。批准后用户会看到确认页面，可以关闭标签页。

Tailscale 会把认证密钥绑定到批准创建它的用户身份。智能体用该密钥以用户的身份连接设备，而不是创建新的 Tailscale 身份。

被预配的设备不会出现在 Aperture 管理仪表板中。它会加入 tailnet，并显示在 Tailscale 管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面上。默认情况下，它带有 `custom:createdByAperture` 和 `custom:createdByAI` 节点属性。

用户必须在 15 分钟内批准授权链接，智能体必须在批准后 10 分钟内收取密钥。超过这些时限后，Aperture 会丢弃未完成的流程或未被收取的密钥，智能体需要重新调用。如果授权失败或超时，参阅 [OAuth 2.0 授权失败][docs-troubleshooting-oauth]。

Aperture 按调用而非按用户授权，因此连接器一旦配置并授权，就会在 Chat **Connectors** 中显示 **Ready**。**Ready** 表示连接器可用，不代表任何节点已获授权：每个被预配的节点仍需单独批准。Aperture 不存储任何用于连接或断开的凭证。

### Tailnet 配置参考

引导式设置会把以下配置写入 `connectors.servers`，你可以在 **Administration** > **Configuration** 中查看，用于审计已有条目。`Tailnet` 键是你的授权必须引用的连接器 ID。

```json
{
  "connectors": {
    "servers": {
      "Tailnet": {
        "provider": "Tailnet",
        "protocol": "mcp",
        "url": "https://api.tailscale.com",
        "labels": ["restricted"],
        "auth": {
          "type": "oauth2_authorization_code",
          "client_id": "<oauth-client-id>",
          "client_secret": "<oauth-client-secret>",
          "auth_url": "https://login.tailscale.com/a/oauth_authorize",
          "token_url": "https://api.tailscale.com/api/v2/oauth/token",
          "scopes": ["auth_keys:create:once"],
          "auth_params": {
            "node_attributes": "{\"custom:createdByAperture\":true,\"custom:createdByAI\":true}"
          }
        }
      }
    }
  }
}
```

`auth.type` 必须是 `oauth2_authorization_code`。其他认证类型会产生加载时错误 `connectors.servers.<id>: built-in provider "Tailnet" requires auth type "oauth2_authorization_code"`。

`custom:createdByAperture` 和 `custom:createdByAI` 节点属性是默认值，不是硬性要求。要使用其他自定义属性，请编辑连接器 HuJSON 配置中的 `auth.auth_params.node_attributes`，并更新 OAuth 应用的 `allowedNodeAttributes` 允许列表以放行你所配置的属性。

`node_attributes` 的值必须落在 OAuth 应用的 `allowedNodeAttributes` 允许列表内。Aperture 会在 token 交换时发送它，因此应用不允许的属性会让交换失败（而不是保存失败）。

引导式设置给两个连接器都打上 `restricted` 标签。该标签只记录意图，[本身不强制任何限制][docs-connectors-labels]。真正的限制来自狭窄的授权。

## Tailscale SSH 连接器

Tailscale SSH 连接器发现 tailnet 中启用了 SSH 的机器，并在选定的机器上运行一条 shell 命令。

该连接器提供两个工具：

| 工具 | 客户端可见名称 | 功能 |
| --- | --- | --- |
| `list_machines` | `TailnetSSH_list_machines` | 列出启用了 Tailscale SSH 的 tailnet 机器，包括状态、操作系统和标签。 |
| `run_command` | `TailnetSSH_run_command` | 通过 Tailscale SSH 在列出的某台机器上运行一条 shell 命令。 |

该连接器不持有任何自有凭证。它以 Aperture 节点的身份连接，因此你的 tailnet 的 Tailscale SSH 策略决定它能访问什么。

### 第 1 步：设置连接器

设置连接器：

1. 打开 Chat **Connectors**。
2. 展开 **Available to add**。
3. 为 **Tailscale SSH** 选择 **Configure**。

该连接器没有配置字段。设置会写入连接器配置，然后为执行设置的管理员添加一条 `TailnetSSH/**` 授权。Aperture 会把该授权追加到唯一 `src` 条目为该管理员登录名的配置授权策略中；如果不存在这样的策略，则为其新增一条。

### 第 2 步：授予访问权限

设置只把连接器授予运行设置的管理员。为其他需要这些工具的用户添加 `connectors` 授权，位置见[在哪里定义授权][ar-where-to-define-grants]。可使用以下模式之一：

| 模式 | 授予内容 |
| --- | --- |
| `"TailnetSSH/tools/list_machines"` | 仅机器发现 |
| `"TailnetSSH/tools/run_command"` | 仅命令执行 |
| `"TailnetSSH/**"` | 整个连接器 |

例如：

```json
{ "connectors": ["TailnetSSH/tools/list_machines"] }
```

该连接器会在可达的 tailnet 机器上运行命令，因此请从窄授权。拥有宽泛 `"**"` 授权的用户无论如何都能访问它，与连接器的标签无关。

### 调用连接器工具

设置完成后，按以下顺序调用工具来测试连接器：

1. 调用 `TailnetSSH_list_machines` 发现合格目标。
2. 从结果的 **Machine** 列中取一个机器名。
3. 带 `machine` 和 `command` 调用 `TailnetSSH_run_command`。

`run_command` 还接受两个可选字段：

| 字段 | 默认值 | 描述 |
| --- | --- | --- |
| `user` | `root` | 连接时使用的远程用户。该用户是否有权限由你的 Tailscale SSH 策略决定。 |
| `timeout` | `300` | 命令超时时间（秒）。最大 600。更长的值会被 Aperture 收敛。超时时，Aperture 会停止命令并返回已产生的输出。 |

Aperture 会对照网络映射解析 `machine` 值。完整的 MagicDNS 名称或精确主机名优先于短名称。如果短名称匹配多台机器，工具会改为要求提供全名。匹配不区分大小写。

列表中的机器启用了 Tailscale SSH，但这不代表 Aperture 节点能在其上运行命令。`run_command` 连接时的访问由你的 tailnet 的 Tailscale SSH 策略决定，因此列表中的机器仍可能拒绝。

### 行为与限制

以下行为适用于每次 `run_command` 调用：

* 每次调用都会建立全新的 SSH 会话。工作目录、环境变量和 shell 状态不会延续，因此请把多个步骤合并成一条命令，例如 `cd /srv && ./deploy.sh`。
* 后台运行的作业会在调用返回时结束，除非命令将其脱离会话，例如 `nohup cmd >/tmp/out 2>&1 &`。
* Aperture 给连接建立留出 30 秒，独立于命令超时。
* Aperture 把 `stdout` 和 `stderr` 连同退出码一起返回。
* 工具结果会报告非零退出码，而不是让调用失败。
* Aperture 在约 1 MiB 处截断输出。请在远程机器上过滤大输出。
* Aperture 每次调用都会对照 tailnet 网络映射校验机器的 SSH 主机密钥，因此不存在“首次使用即信任”窗口，也没有主机密钥批准提示。
* 机器列表反映调用时刻的 tailnet 状态，Aperture 不缓存它。
* 机器名称、操作系统值和标签来自其他 tailnet 成员。Aperture 把它们交给模型时会标记为数据而非指令。
* 每次调用写一条审计日志，包含连接器 ID、调用用户、机器、远程用户、完整命令和退出码。Aperture 不记录命令输出。

### Tailscale SSH 配置参考

设置会写入以下配置。该连接器没有 `auth` 块，因为它以 Aperture 节点的身份连接。

```json
{
  "connectors": {
    "servers": {
      "TailnetSSH": {
        "provider": "TailnetSSH",
        "protocol": "mcp",
        "url": "https://api.tailscale.com",
        "labels": ["restricted"]
      }
    }
  }
}
```

对这个内置连接器而言，`url` 值只是占位符，不是上游 MCP 端点。

## 验证内置连接器

确认内置连接器正常工作：

1. 打开 Chat **Connectors**。
2. 在 **Ready to use** 下确认连接器显示 **Ready**。
3. 选择连接器查看详细工具列表。
4. 确认需要它的用户拥有匹配的 `connectors` 授权。
5. 从客户端通过 Aperture 的 [MCP 端点][docs-aperture-mcp-server]调用一个工具，然后与以下结果对照。

**Ready** 描述的是访问与授权状态。它不证明某个节点已获授权，也不证明上游服务健康。

成功的 `TailnetSSH_list_machines` 调用会返回数量摘要、关于授权和数据处理的说明，以及一张表：

```text
Tailnet machines with Tailscale SSH enabled: 2 total, 1 online, 1 offline.

| Machine | Status | OS | Tags |
| --- | --- | --- | --- |
| build-1.tail0abc.ts.net | offline (last seen 2026-08-12) | linux | tag:ci |
| web-1.tail0abc.ts.net | online | linux | - |
```

没有启用 SSH 机器的 tailnet 会返回 `No tailnet machines have Tailscale SSH enabled.`。

成功的 `TailnetSSH_run_command` 调用会返回一行头信息加合并输出；命令没有输出时返回 `(no output)`：

```text
Ran on web-1.tail0abc.ts.net (user root), exit code 0:

Linux web-1 6.8.0-40-generic x86_64
```

## 相关内容

* [连接器入门][docs-connectors-get-started] —— 添加并授权你的第一个连接器。
* [连接器的工作原理][docs-connectors-how-it-works] —— 连接器模型、授权和能力行为。
* [Aperture 连接器参考][docs-connectors-reference] —— 连接器字段定义和 API 行为。
* [授予 MCP 工具访问权限][docs-grant-mcp-tool-access] —— 连接器授权模式。
* [Aperture 授权与 tailnet 策略文件授权对比][docs-aperture-vs-tailnet-grants] —— 选择授权定义位置，并在两种形式之间转换。
* [Tailscale SSH][docs-tailscale-ssh] —— 启用 Tailscale SSH 并为它编写访问规则。
* [使用 OAuth 应用预配设备][docs-device-provisioning] —— tailnet 连接器使用的 OAuth 应用与授权码流程。
* [Aperture Chat 参考][docs-aperture-chat-connectors] —— 在 Aperture 中哪里找连接器，以及在 Tailscale 管理控制台中哪里找被预配的设备。

[ar-where-to-define-grants]: #在哪里定义授权

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors

[docs-aperture-mcp-server]: /docs/aperture/mcp-server

[docs-aperture-vs-tailnet-grants]: /docs/aperture/reference/aperture-vs-tailnet-grants

[docs-api-access-tokens]: /docs/reference/tailscale-api

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-connectors-how-it-works]: /docs/aperture/connectors/how-connectors-work

[docs-connectors-labels]: /docs/aperture/connectors/reference#connector-labels

[docs-connectors-reference-labels]: /docs/aperture/connectors/reference#the-reserved-system-label

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-device-posture]: /docs/features/device-posture

[docs-device-provisioning]: /docs/features/oauth-apps/device-provisioning

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-troubleshooting-oauth]: /docs/aperture/troubleshooting#oauth-20-authorization-fails
