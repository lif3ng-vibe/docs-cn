---
title: "MCP 服务器"
---

Pi 通过 stdio 或 streamable HTTP 连接到 [Model Context Protocol](https://modelcontextprotocol.io) 服务器，并把它们的工具和资源提供给模型。

## 快速上手

添加一个本地 stdio 服务器，检查连接，然后启动 Pi：

```bash
pi mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem .
pi mcp list
pi
```

远程服务器：

```bash
pi mcp add docs --url https://example.com/mcp --bearer-token-env-var DOCS_TOKEN
pi mcp list
```

这些命令默认添加用户级服务器。加上 `--local` 或 `-l` 则改为写入项目配置：

```bash
pi mcp add -l tools --env API_KEY='${TOOLS_KEY}' -- uvx tools-mcp
```

在交互会话中使用 `/mcp` 查看连接、登录、重连、更改暴露方式（exposure），或启用/停用服务器。在会话之外添加、移除或修改服务器后，请运行 `/reload`。

## 配置服务器

Pi 从 `~/.pi/agent/mcp.json` 读取用户级服务器，从 `.pi/mcp.json` 读取项目级服务器。项目配置只在授予[项目信任](security#%E4%BA%86%E8%A7%A3%E9%A1%B9%E7%9B%AE%E4%BF%A1%E4%BB%BB)后才会读取。同名时，项目条目会替换用户级条目。

不含 `command`、`url` 或 `type` 的项目条目只覆盖同名用户级服务器的 `enabled`、`exposure` 和 `toolExposure`，其余字段（包括 `env`、`headers` 和 `auth`）保持不变。例如，下面这条配置可在某个项目中关闭一个用户级服务器：

```json
{
  "mcpServers": {
    "internal-tools": { "enabled": false }
  }
}
```

其格式与其他 MCP 客户端一致：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "docs": {
      "url": "https://example.com/mcp",
      "headers": { "Authorization": "Bearer ${DOCS_TOKEN}" },
      "description": "搜索并阅读产品文档"
    }
  }
}
```

stdio 服务器使用 `command`、`args`、`env` 和 `cwd`。相对的 `cwd` 值以会话目录为基准解析。`command`、参数或 `cwd` 中以 `~/` 开头时表示主目录。

HTTP 服务器使用 `url`、`headers` 和 `oauth`（参见[使用 OAuth 认证](#%E4%BD%BF%E7%94%A8-oauth-%E8%AE%A4%E8%AF%81)）。不支持旧式的 SSE 传输。

两类服务器都支持：

- `timeout`：每请求超时（秒），默认 60。进度通知会重置它。
- `enabled: false`：保留该条目但不连接。
- `exposure` 与 `toolExposure`：控制工具以何种方式到达模型（参见[控制工具暴露方式](#%E6%8E%A7%E5%88%B6%E5%B7%A5%E5%85%B7%E6%9A%B4%E9%9C%B2%E6%96%B9%E5%BC%8F)）。
- `description`：一句话说明服务器提供什么。它会让该服务器出现在系统提示词（system prompt）中（参见[控制工具暴露方式](#%E6%8E%A7%E5%88%B6%E5%B7%A5%E5%85%B7%E6%9A%B4%E9%9C%B2%E6%96%B9%E5%BC%8F)），工具搜索会依据它为服务器的工具排序，codemode 的 `describeNamespace()` 也会返回它。若省略，服务器连接后会使用服务器指令的第一行。

个人服务器和带凭据的服务器请放在用户级文件中。项目文件只用于项目所需的服务器，且只应在受信任的项目中使用。

### 配置规则

- 服务器名称只能包含字母、数字、`_` 和 `-`。工具命名为 `mcp__<server>__<tool>`，其中字母、数字、`_` 以外的字符都会替换为 `_`；替换后名称冲突的工具会全部加上哈希后缀。仅在 `-` 与 `_` 上有差异的服务器名视为同一服务器：第二个会被拒绝，且 `mcp.json` 中的服务器会覆盖已注册的那个。
- `type` 是可选的。有 `command` 时选择 stdio，有 `url` 时选择 streamable HTTP。如果提供，`type` 必须是 `stdio`、`http` 或 `streamable-http`。
- `sse` 会被拒绝。文档给出 SSE 端点的服务器通常也提供 streamable HTTP，一般在 `/mcp` 而不是 `/sse`。
- `command` 是单个可执行文件，`args` 包含其参数。它不是 shell 命令字符串。
- `env` 和 `headers` 的值可以使用 `${GITHUB_TOKEN}` 这类环境变量。也可以用 `!command` 运行一条命令，但该命令必须构成整个值，例如 `"Authorization": "!echo Bearer $(gh auth token)"`。
- 无效条目会被报告并跳过，不会妨碍其他服务器连接。

`pi mcp add` 和 `pi mcp remove` 覆盖了 shell 中的常见修改。其选项参见 [MCP 命令](cli#mcp-%E5%91%BD%E4%BB%A4)。

### 查看或修改服务器

`/mcp` 会列出已配置服务器的状态、工具数量、暴露方式和配置来源。需要关注的服务器排在最前。选中某个服务器可以查看其工具和连接详情、重连、登录或登出、更改暴露方式，或启用/停用它。

暴露方式和启用状态的更改会保存到定义该服务器的文件中，且不会替换无关内容。在受信任的项目中，"Enable in this project" 与 "Disable in this project" 会为用户级服务器添加一个项目级覆盖；此后对该服务器的更改都会保存到这个覆盖中。已停用的服务器仍会列出。在交互 TUI 之外，`/mcp` 打印服务器状态；`/mcp login <server>`、`/mcp logout <server>` 和 `/mcp reconnect <server>` 直接执行相应操作。

shell 命令无需会话即可使用：`pi mcp add`、`pi mcp remove`、`pi mcp list`、`pi mcp login` 和 `pi mcp logout`。shell 命令不加载扩展。

### 诊断连接问题

运行 `pi mcp list` 会连接每个已启用的服务器并打印其状态、工具和错误。当某个条目无效或某个已启用的服务器未连接时，退出状态为 1。`/mcp` 会显示完整的连接错误以及连接失败的 stdio 服务器的 stderr 末尾内容。

Pi 会在启动后一次性报告配置错误、连接失败和需要登录的情况。服务器的日志通知会以 `<time> [<server>] <level> <logger>: <message>` 的格式追加到 `~/.pi/agent/mcp.log`。文件超过 5 MB 后会转移到 `mcp.log.1`。

会话启动时，Pi 会在后台连接每个已启用的服务器。服务器一旦连接，其工具即会出现；`codemode` 描述不列出工具，因此不会随服务器连接而变化。首个提示词最多等待 10 秒，且只等待带 `direct` 工具的服务器，因为这些工具必须在其请求中声明。其他服务器在需要时才等待：codemode 脚本会等待它点名的服务器（`mcp__<server>`）；当它调用 `searchTools()` 或读取 `ALL_TOOLS` 时，则等待所有服务器；`tool_search` 和资源工具同样会等待所有服务器。HTTP 网络错误和瞬态状态码（408、429 和 5xx）会重试两次。掉线的连接会显示为已断开，并在下次调用时重连。当服务器宣告工具列表发生变化时，新工具会被加入，被撤下的工具将不可达。

停止 stdio 服务器时会关闭其 stdin，先发送 SIGTERM，再向其进程组发送 SIGKILL。这也会停止通过 `npx` 或 `uvx` 等包装器启动的服务器。

## 从其他客户端迁移配置

把转换后的条目放到 `mcp.json` 的 `mcpServers` 下，然后运行 `pi mcp list` 验证。

| 客户端 | 转换方式 |
|---|---|
| Claude Desktop、Claude Code 或 Cursor | 复制现有的 `mcpServers` 条目。 |
| VS Code | 把条目从顶层 `servers` 对象中移出，并将 `${input:...}` 提示替换为 `${NAME}` 环境变量。 |
| Codex | 把 `[mcp_servers.<name>]` 的 TOML 字段（如 `command`、`args`、`env` 和 `url`）转换为 JSON。 |
| OpenCode | 把 `"type": "local"` 转换为 stdio 条目，把其 `command` 数组拆分为 `command` 和 `args`，把 `environment` 改名为 `env`，并把 `{env:NAME}` 替换为 `${NAME}`。把 `"type": "remote"` 转换为 URL 条目。 |

## 使用 OAuth 认证

使用 OAuth 的远程服务器（例如 Sentry）不需要在 `mcp.json` 中放凭据：

```json
{
  "mcpServers": {
    "sentry": { "url": "https://mcp.sentry.dev/mcp" }
  }
}
```

当服务器拒绝未认证的连接时，`/mcp` 会显示需要登录。选择 "Sign in"、运行 `/mcp login sentry`，或运行 `pi mcp login sentry`。Pi 会打开授权页面并等待批准。如果浏览器运行在另一台机器上（例如通过 SSH），请把重定向 URL 粘贴到登录界面。正在运行的会话会在下一轮使用新凭据。

Pi 会向授权服务器注册自身，把令牌存储在 `~/.pi/agent/mcp-auth.json`，并在访问令牌过期或被服务器拒绝时刷新。如果服务器之后请求额外的 scope，Pi 会再次要求登录。登出会删除存储的凭据。

凭据与服务器名称和 URL 绑定。URL 相同但名称不同的服务器（例如每个账号一个）需要分别登录；名称和 URL 都相同、但位于不同 `mcp.json` 文件中的服务器共享一次登录。

OAuth 适用于没有 `Authorization` 头的 HTTP 服务器。对于不支持动态客户端注册的服务器，请配置一个已注册的客户端：

```json
{
  "mcpServers": {
    "example": {
      "url": "https://mcp.example.com/mcp",
      "oauth": { "clientId": "my-client", "clientSecret": "${EXAMPLE_SECRET}", "callbackPort": 8765 }
    }
  }
}
```

重定向 URI 必须与注册的 URI 一致。`callbackPort` 使用 `http://127.0.0.1:<port>/callback`。若要使用其他 URI，请设置 `callbackUrl`；它必须是在 `localhost`、`127.0.0.1` 或 `[::1]` 上使用 HTTP 的地址。Pi 会完全按原样发送它。当 `callbackUrl` 省略端口时，Pi 会使用 `callbackPort` 或一个空闲端口并把它加进 URI，这是 RFC 8252 对环回重定向所允许的。`clientSecret` 是可选的，可以使用环境变量或命令。

对于不宣告所需 scope 的服务器，请把 `scope` 设为以空格分隔的列表。否则 Pi 会请求其宣告的 scope。之后的 scope 请求会追加到已配置的值上。

Pi 以 `pi` 注册。有些服务器只接受来自已知客户端的注册。设置 `clientName` 可以发送其他名称：

```json
{
  "mcpServers": {
    "figma": { "url": "https://mcp.figma.com/mcp", "oauth": { "clientName": "Claude Code" } }
  }
}
```

该名称只在 Pi 注册客户端时发送。若要以新名称重新注册，请先登出。

有些授权服务器通过客户端的 Client ID Metadata Document URL 来认可客户端，而不是要求注册。把 `clientRegistration` 设为 `cimd` 可以用 Pi 在 pi.dev 上的文档标识自身，而不是注册：

```json
{
  "mcpServers": {
    "example": { "url": "https://mcp.example.com/mcp", "oauth": { "clientRegistration": "cimd" } }
  }
}
```

客户端 ID 为 `https://pi.dev/oauth/client.json`，重定向 URI 为 `http://127.0.0.1:<port>/callback`。如果授权服务器没有在授权响应中发送 `iss` 参数（RFC 9207），Pi 会改用针对该 MCP 服务器专门的文档和重定向路径：`https://pi.dev/oauth/<id>/client.json` 与 `http://127.0.0.1:<port>/callback/<id>`。授权服务器必须宣告支持 Client ID Metadata Document 和公共客户端，否则登录会失败。`cimd` 不能与 `clientId` 或 `clientName` 同时使用，且 `callbackUrl` 必须使用 `localhost` 或 `127.0.0.1` 并带 `/callback` 路径。

Pi 通过服务器的受保护资源元数据（RFC 9728）找到授权服务器，并检查授权服务器的元数据是否指明了预期的签发者（RFC 8414）。有些服务器宣告的授权服务器有误或没有宣告，导致登录打开一个不存在的页面。把 `authServerMetadataUrl` 设为正确授权服务器的元数据文档：

```json
{
  "mcpServers": {
    "example": {
      "url": "https://mcp.example.com/mcp",
      "oauth": { "authServerMetadataUrl": "https://example.okta.com/.well-known/openid-configuration" }
    }
  }
}
```

Pi 会使用该文档代替自动发现，并按配置信任它，所以只应把它指向你信任的文档。该 URL 必须使用 HTTPS，`localhost`、`127.0.0.1` 或 `[::1]` 除外。

## 控制工具暴露方式

每个服务器工具都注册为 `mcp__<server>__<tool>`。服务器的 `exposure` 决定模型以何种方式访问它：

| 暴露方式 | 行为 | 典型用途 |
|---|---|---|
| `codemode`（默认） | 可从 [`codemode`](cli#%E5%B7%A5%E5%85%B7) 脚本中调用，但既不向模型声明，也不列入 codemode 描述。脚本通过 `searchTools()`、`describeTool()` 或 `ALL_TOOLS` 查找工具。 | 通用 MCP 服务器，尤其适合需要脚本组合或筛选调用的场景。 |
| `deferred` | 在 [`tool_search`](cli#%E5%B7%A5%E5%85%B7) 为下一次模型调用加载到匹配项之前不声明。 | 大型服务器，其工具应在发现后直接调用。 |
| `direct` | 像内置工具一样向模型声明，也可从 codemode 调用。 | 小型、常用的工具集。 |
| `hidden` | 已注册但不可达。 | 应保持不可用的服务器或工具。 |

`codemode-deferred` 可作为 `codemode` 的别名。

带 `codemode` 或 `deferred` 工具的服务器会列在系统提示词的 `mcp_servers` 区块中，包含其工具的访问方式，以及配置的 `description` 中的一行文字（连接后则取自服务器指令）。Pi 会在提示词开始时更新该区块，且是在等待带 `direct` 工具的服务器之后。当区块发生变化时（例如某服务器连上后其摘要变为可用），Pi 会把新区块追加到对话中，而不是更改工具声明，从而让早前消息保持缓存。`describeNamespace()` 和 `searchTools()` 的 `namespace` 选项接受 `mcp__dev-radius`、`mcp__dev_radius`、`dev-radius` 或 `dev_radius`。

当 `codemode` 暴露方式的服务器连接时，Pi 会激活 `codemode`。对 `deferred` 暴露方式的服务器，它会激活 `tool_search`。要让模型不经搜索就看到某个工具，可用 `toolExposure` 给它 `direct` 暴露方式。

`toolExposure` 可针对单个工具覆盖服务器的暴露方式。键为精确的服务器工具名或模式，模式中 `*` 匹配任意字符。精确名优先于模式；模式之间先匹配者胜。`hidden` 暴露方式的服务器可以只暴露选定的工具：

```json
{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "exposure": "deferred",
      "toolExposure": {
        "search_code": "direct",
        "get_*": "codemode",
        "delete_*": "hidden"
      }
    }
  }
}
```

`pi mcp list` 会标出暴露方式与服务器不同的工具。`/mcp` 的 Tools 视图也会显示生效的暴露方式。

`codemode` 或 `deferred` 暴露方式的工具可以通过两种间接机制之一访问：codemode 脚本可以调用它们，`tool_search` 也可以加载它们。Codemode 调用不依赖当前激活的工具集，因此在 `/tree`、恢复会话和分叉之后仍然可用。由 `tool_search` 加载的工具会记录在会话记录（transcript）中，并在该分支上保持声明。

`--tools` 不会移除 MCP 工具，除非其条目中有以 `mcp__` 开头的；`pi --tools read,codemode,'mcp__radius__*'` 只保留 `radius` 的工具。`--exclude-tools` 接受相同的模式，`--no-mcp` 会在单次运行中禁用 MCP（参见[工具](cli#mcp-tools)）。

要在没有 MCP 服务器的情况下保持 `codemode` 激活，请在[设置](settings#%E5%B7%A5%E5%85%B7)中添加 `"defaultTools": ["+codemode"]`。要阻止 codemode 自动激活，请在 `mcpServers` 旁设置 `"autoEnableCodemode": false`。项目级值会覆盖用户级值。当 `codemode` 与 `tool_search` 都未激活、非 direct 工具无法调用时，Pi 会警告一次。

超过 20 KB 的文本结果送达模型时会移除中段，代之以 `…N chars truncated…` 标记。完整文本会保存到结果中注明的临时文件。Codemode 脚本收到的是完整结果，可以在把输出返回给模型之前先行缩减。

Codemode 脚本收到的是完整的 MCP `CallToolResult`，包括 `content`、`structuredContent` 和 `isError`。带 `isError` 的结果在脚本内部正常解析，但对直接调用则作为错误报告。`image(result.content[0])` 可以转发图像块。服务器指令不属于任何工具描述；脚本用 `describeNamespace("mcp__<server>")` 读取它们，该调用同时返回服务器的工具名列表。

## 使用资源

当已连接的服务器提供[资源](https://modelcontextprotocol.io/specification/2025-11-25/server/resources)时，Pi 会添加 Codex 和 OpenCode 所使用的资源工具：

- `list_mcp_resources` 以 JSON 形式列出资源：`{ server?, resources: [{ server, uri, name, ... }], nextCursor? }`。传入 `server` 时列出一页；`cursor` 用于继续下一页。不传 `server` 时，列出每个服务器的所有资源。
- `list_mcp_resource_templates` 列出服务器未直接列出的资源的 URI 模板。
- `read_mcp_resource` 按 `server` 和 `uri` 读取资源。文本以文本形式、图像以图像形式送达模型。其他二进制资源会保存为临时文件，模型收到路径。脚本收到 `{ server, uri, contents }`。

这些工具覆盖每个已启用、非 hidden 且带资源的服务器。它们的暴露方式取这些服务器中最宽的一种：`direct` 优先，其次 `codemode` 或 `deferred`。工具结果中的资源链接会标明 `read_mcp_resource` 与对应服务器。

MCP Apps 的资源（以 `ui://` URI 或 `text/html;profile=mcp-app` 标识）会被忽略，因为 Pi 不渲染它们。资源图标同样被忽略。

读取和列出资源在遇到瞬态 HTTP 错误（408、429 或 5xx）后会重试一次。工具调用不会重试，因为服务器可能已经执行过。

## 权限

每个 MCP 调用都会经过 Pi 的工具管线。因此扩展的 `tool_call` 与 `tool_result` 处理器（包括权限门控）同样适用于 MCP 工具。从 codemode 脚本发起的调用会携带 codemode 调用 ID 作为 `parentToolCallId`。

`pi.getAllTools()` 会报告每个服务器声明的注解：`readOnlyHint`、`destructiveHint`、`idempotentHint` 和 `openWorldHint`。权限扩展可以利用这些提示决定哪些调用需要确认（参见[工具暴露](extensions#%E5%B7%A5%E5%85%B7%E6%9A%B4%E9%9C%B2)）。资源工具被标记为只读（read-only）。

## 扩展与 SDK

### 从扩展添加服务器

扩展可以用 `pi.registerMcpServer(name, config)` 为当前会话添加服务器，其结构与 `mcpServers` 条目相同（参见[扩展中的 MCP 服务器](extensions#mcp-%E6%9C%8D%E5%8A%A1%E5%99%A8)）。已注册的服务器与配置文件中的服务器一样连接，并出现在 `/mcp` 中，来源显示为对应扩展。

对启用状态或暴露方式的更改只作用于当前会话。同名文件配置的服务器优先，`/mcp` 列出的是被覆盖后的注册项。`pi mcp` shell 命令不加载扩展，只能看到文件配置的服务器。

### 替换内置的 MCP 支持

已安装的扩展若注册了 `/mcp`（例如 `pi-mcp-adapter`），会在会话中取代内置的 MCP 支持。此后 Pi 在会话中不再读取 `mcp.json` 或连接其中的服务器，`/mcp` 也归该扩展所有。移除该扩展即可恢复内置行为。若想在没有替代品的情况下禁用内置 MCP 支持，可在 `pi config` 的 Built-in 下禁用 `mcp`，或在[设置](settings#%E8%B5%84%E6%BA%90)中设置 `"extensions": ["-builtin:mcp"]`。`--no-mcp` 会在单次运行中禁用它。

注册 `codemode` 或 `tool_search` 的扩展同样会以同名取代内置工具。shell 层面的 `pi mcp` 命令始终使用内置实现。

### 在 SDK 中使用 MCP

SDK 会话不加载内置扩展。请把 MCP 扩展、用于 `codemode` 服务器的 codemode 扩展，以及用于 `deferred` 服务器的工具搜索扩展加入资源加载器。参见 [Codemode 与 MCP](sdk#codemode-mcp)。
