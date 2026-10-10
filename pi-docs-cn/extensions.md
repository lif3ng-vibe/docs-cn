---
title: "扩展"
---

扩展（extension）是为 Pi 添加可执行行为的 TypeScript 模块。当工作流需要的不仅是指令，还需要工具、命令、事件处理器、模型提供商（provider）、会话（session）状态或终端 UI 时，就使用扩展。

扩展在 Pi 进程内运行，拥有与 Pi 相同的操作系统权限。它可以检查提示词、工具调用、文件、凭据和会话历史，因此只应从你信任的来源加载扩展。

常见的扩展会添加智能体（agent）工具、保护路径、确认危险命令、响应会话事件、修改上下文、暴露命令或显示持久状态。

<a id="quick-start"></a>
<a id="writing-an-extension"></a>
<a id="create-an-extension"></a>

## 创建并加载扩展

扩展导出一个接收 `ExtensionAPI` 的默认工厂函数。工厂函数为当前扩展运行时注册各项能力。

创建 `~/.pi/agent/extensions/hello.ts`：

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("hello", {
    description: "Show a greeting",
    handler: async (name, ctx) => {
      ctx.ui.notify(`Hello, ${name || "world"}!`, "info");
    },
  });
}
```

启动 Pi 并运行 `/hello`。开发期间可以直接加载单个文件：

```bash
pi --extension ./hello.ts
```

Pi 使用 `jiti`，因此本地 TypeScript 扩展无需单独的编译步骤。要分发扩展及其依赖，请使用 [Pi 包](packages.md)。

<a id="extension-locations"></a>
<a id="available-imports"></a>
<a id="choose-where-it-loads"></a>

## 将其加入 Pi

把扩展放到你的用户级或项目级扩展目录中。Pi 会加载直接的 TypeScript 或 JavaScript 文件，以及包含 `index.ts` 或 `index.js` 入口的子目录。

小型扩展用单个文件，多文件实现用目录。npm 依赖放在附近的 `package.json` 中。约定位置见[配置](configuration.md)，附加路径见[设置](settings.md#%E8%B5%84%E6%BA%90)。

重新加载会替换扩展运行时，因此 `await ctx.reload()` 之后的代码不得复用旧运行时的状态。只有个人扩展和命令行显式指定的扩展能参与 `project_trust` 事件（它在项目扩展加载之前触发）。

<a id="understand-the-lifecycle"></a>

## 遵守运行时生命周期

工厂函数可以是同步或异步的。Pi 会等待异步工厂函数完成后再继续启动，因此它可以在启动期间获取配置或注册启动所需的提供商。

不要在工厂函数里启动进程、套接字、监听器或定时器，因为某些调用方式加载扩展时并不会启动会话。
长生命周期的资源应从 `session_start` 或需要它们的命令、工具中启动。
会话级资源应在一个幂等的 `session_shutdown` 处理器中关闭。

一次运行从输入和 `before_agent_start` 开始，经过模型、消息和工具事件，到达 `agent_end`。
之后自动重试、恢复、压缩（compaction）或排队的工作仍可能继续。
<a id="agent_start--agent_end--agent_before_settle--agent_settled"></a>

`agent_before_settle` 是最后一个可行动的边界：它可以追加条目并请求一次续跑。
`agent_settled` 则是最终的、仅通知型的事件；当集成需要知道 Pi 不会再自动继续时使用它。

<a id="extensionapi-methods"></a>

## 选择集成点

| 能力 | 主要 API |
|---|---|
| 观察或修改生命周期行为 | `pi.on()` |
| 添加模型可调用的操作 | `pi.registerTool()` |
| 添加 `/` 命令 | `pi.registerCommand()` |
| 添加快捷键或 CLI 标志 | `pi.registerShortcut()` 或 `pi.registerFlag()` |
| 发送用户消息或自定义消息 | `pi.sendUserMessage()` 或 `pi.sendMessage()` |
| 持久化非上下文会话数据 | `pi.appendEntry()` |
| 更改活动工具、模型或思考级别 | `pi` 上的会话控制方法 |
| 添加模型提供商 | `pi.registerProvider()` |
| 添加 MCP 服务器 | `pi.registerMcpServer()` |
| 将每个请求路由到模型 | [`pi.registerVirtualModel()`](virtual-models.md) |
| 添加终端渲染 | 渲染器（renderer）注册与 `ctx.ui` |
| 与其他扩展通信 | `pi.events` |

精确的事件、上下文、工具和结果类型，请查阅 [`extensions/types.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/types.ts) 中导出的声明。

## 遵循扩展契约

<a id="events"></a>
<a id="work-with-events"></a>

### 事件与并发

处理器按扩展加载和注册顺序运行。`pi.on()` 返回一个用于取消该订阅的函数；变更不影响正在进行中的分发。
有些事件仅通知，另一些则会转换数据、替换结果或取消操作。
请依据每个事件声明的结果类型来编写返回值，不要假定任何返回值都会生效。

事件涵盖资源发现、会话、智能体与消息生命周期、提供商、工具以及原始输入。

`before_agent_start` 同时暴露当前提示词及其结构化的 `systemPromptOptions`。优先选择修改提示词分节、所选工具或准则，这样 Pi 才能向转录（transcript）追加增量。返回 `systemPrompt` 或设置 `forceSystemPrompt` 会替换该次运行的整个提示词，而转录仍继续记录结构化分节。提供商收到的强制文本会作为其前置系统提示词。

`message_end` 可以在保留角色的前提下替换一条已定稿的消息。`tool_call` 可以修改输入或阻止执行。`tool_result` 处理器可组合，每个处理器都能看到先前处理器做出的更改。

<a id="provider_stream_event"></a>

`provider_stream_event` 会在 Pi 归一化之前，针对每个已解析的提供商流事件触发。该事件标识提供商、API 和模型；`event.data` 是 Pi 能拿到的最早结构化值，未必是原始 HTTP 字节或 SSE 帧。请将其视为只读，因为修改可能影响归一化。该事件仅通知，不会被持久化。

处理器按流顺序依次 await，因此慢处理器会延迟流的消费。处理器报错会上报，但不会改变提供商响应。参见 [`debug-provider.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/debug-provider.ts)，它提供一个可选查看器，按助手消息分组展示原始事件。

<a id="context_with_system"></a>

`context` 在不含提示词和工具系统消息的情况下转换会话消息，之后 Pi 会恢复该状态。仅当请求级转换必须掌握完整转录时才使用 `context_with_system`，并保持索引 0 处为系统消息。

`turn_end` 和 `agent_before_settle` 是可行动边界。它们的处理器可以串联提议的 `custom`、`custom_message`、`context_edit` 或 `compaction` 条目，并返回 `continue: true` 来触发下一次模型请求。务必给续跑条件加防护，因为无条件的续跑可能造成循环。完整的校验与排序契约见导出的事件声明。

<a id="cache_warming_decision"></a>

`cache_warming_decision` 可以用 `{ action: "warm" }` 或 `{ action: "stop" }` 覆盖空闲时的提示词缓存刷新。最后一个返回动作的处理器生效。

同一条助手消息的工具调用可以并行执行。
当另一个工具事件运行时，不要假定兄弟调用或结果一定存在。
属于活动轮次的嵌套工作请使用 `ctx.signal`；命令和空闲会话事件通常没有操作信号。

返回 `undefined` 的 `user_bash` 处理器会把命令传给下一个处理器；若没有任何处理器处理，则交给本地执行。返回 `operations` 或 `result` 会停止传播。处理器失败会拦截该命令，而不会落到本地执行。

<a id="custom-tools"></a>
<a id="register-tools"></a>

### 工具

自定义工具定义一个名称、面向模型的描述、TypeBox 参数模式和 `execute()` 函数。
其结果必须包含面向模型的 `content`，以及用于渲染或状态重建的 `details` 字段。
没有结构化细节时使用 `details: undefined`。如果工具发起了嵌套模型调用，请把它们的 `usage` 计入结果，以保持会话总量准确。

从 `execute()` 抛出异常即可产生失败的工具结果。
返回一个对象并不会将其标记为错误。
只有当该批次中每个已完成工具都同意终止、且智能体应跳过其自动追问时，才返回 `terminate: true`。

当多个工具共享可变的内存状态时，请使用顺序执行。
会修改文件的工具应使用 `withFileMutationQueue()` 包裹完整的读取—修改—写入操作。
面向模型的大结果应截断，并告诉模型去哪里读取完整输出。

当结果是数据时，声明 `outputSchema` 并返回匹配的 `structuredContent`。模型仍收到 `content`；codemode 脚本等程序化调用者收到的是 `structuredContent` 而非文本。没有 `outputSchema` 的工具传给脚本的是其文本内容。要上报仍携带数据的失败，请返回带 `isError: true` 的结果而不是抛异常：模型看到错误，脚本仍收到 `structuredContent`。

工具可以通过 `ctx.executeTool(name, args, { signal, onUpdate })` 运行其他工具。嵌套调用与模型发起的调用一样，经过参数校验和 `tool_call`、`tool_result` 处理器，并发出 `tool_execution_start`、`tool_execution_update` 和 `tool_execution_end` 事件；这些事件都带有 `parentToolCallId`，其 `toolCallId` 由 pi 分配为 `<parent id>/<n>`。这些 id 不会作为工具调用或工具结果出现在转录中。嵌套调用不添加转录条目：其结果只送达调用方工具，由它自行汇报（例如通过 `onUpdate` 和 `details`）。会话会保留一份有界记录（名称、参数、状态、耗时、错误；绝不包含结果），作为调用方工具结果消息上的 `nestedCalls`。它用于压缩文件清单，并在 HTML 导出中展示。每次调用参数超过 8 KiB 或单个工具结果超过 32 KiB 的会被省略，最多保留 256 次调用，`complete: false` 标记丢失了内容的记录。任意深度下，嵌套结果的 `usage` 都会累加进调用方工具结果的 `usage`，因此工具只需上报自身用量，不必上报它调用的工具的用量。`ctx.tools` 列出 `ctx.executeTool()` 可以调用的工具。对 `content` 做脱敏的 `tool_result` 处理器也应替换 `structuredContent`；只替换 `content` 会把它丢弃。

参见 [`hello.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/hello.ts)、[`todo.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/todo.ts)、[`dynamic-tools.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/dynamic-tools.ts) 和 [`truncated-tool.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/truncated-tool.ts)。

### 工具暴露

`exposure` 控制模型如何触达一个工具。"可调用"指其他工具能通过 `ctx.executeTool()`（`ctx.tools`）调用它，就像 `codemode` 工具的脚本那样：

- `direct`（默认）：激活时向模型声明，激活期间可调用。
- `model-only`：激活时向模型声明，但永远不可调用。适用于编排其他工具或向用户提问的工具。
- `codemode`：只要注册就始终可调用，并由 `codemode` 工具列出。除非显式激活，否则不向模型声明。
- `deferred`：与 `codemode` 类似，但 codemode 工具不列出它；`tool_search` 可以找到并激活它。
- `hidden`：已注册但不可触达。由于工具无法注销，重新以 `exposure: "hidden"` 注册该工具即可将其撤下。

`namespace: { name, description, instructions }` 用于为相关工具分组，就像 MCP 服务器那样。codemode 工具把一个命名空间列在同一个标题下并附上其 `description`。`instructions` 存放更长的使用指引；它不会被列出，codemode 脚本用 `describeNamespace(name)` 读取它。

注册 `direct` 或 `model-only` 工具即激活它；其他 exposure 在注册时不会激活。活动集（`pi.getActiveTools()`、`pi.setActiveTools()`）就是向模型声明的工具集合。`pi.getAllTools()` 会报告每个工具的 `exposure`、`namespace` 和 `annotations`。

`annotations` 是关于工具行为的提示，含义与 MCP 工具注解一致：`readOnlyHint`、`destructiveHint`、`idempotentHint` 和 `openWorldHint`。MCP 工具携带其服务器声明的提示。缺失的提示按 MCP 默认值处理：工具不是只读的，可能具有破坏性，且可能触达开放世界。这些提示不会被验证，但权限扩展可以用它们决定哪些调用需要确认。下面这段代码确认的调用与 Codex 请求批准的一致：

```typescript
pi.on("tool_call", async (event, ctx) => {
  const hints = pi.getAllTools().find((tool) => tool.name === event.toolName)?.annotations;
  const needsApproval =
    hints?.destructiveHint === true ||
    (!hints?.readOnlyHint && ((hints?.destructiveHint ?? true) || (hints?.openWorldHint ?? true)));
  if (needsApproval && !(await ctx.ui.confirm("Allow tool call?", event.toolName))) {
    return { block: true, reason: `${event.toolName} was not approved` };
  }
});
```

编排其他工具的工具可以在自身激活期间，用 `prepareLoadout(loadout)` 调整模型看到的内容。只要活动工具集变化它就会运行，并收到已声明的工具、可调用的工具，以及每个已注册工具及其 exposure、命名空间和提示词准则。它返回替换后的已声明工具 `descriptions`（包括它自己）以及 `hiddenDeclarations`：请求会略去这些活动工具的声明，但它们保持激活且可调用。默认系统提示词的工具列表和规则会略去隐藏工具；当文件读取器被隐藏时，技能提示中也不会点名任何工具，因此编排工具应自行呈现它们的准则。`codemode` 只用了这个钩子、`exposure` 和 `ctx.executeTool()`，所以其他工具也能以不同的名称实现同样的行为。

### 动态激活工具

先注册所有工具，让可选工具保持未激活，再由一个加载器工具调用 `pi.setActiveTools()` 来选出需要的活动工具。名称必须已注册；未知名会被忽略。

Pi 把初始提示词和工具集记录在转录的首条系统消息中，然后在下一次模型请求前追加工具和提示词变更。无法表达这种过渡的提供商会收到一份完整的转录检查点（checkpoint），这可能使缓存前缀失效。

### 工具渲染

工具的 `renderCall` 和 `renderResult` 负责在交互转录和 HTML 导出中绘制其调用。`pi.registerToolRenderer((toolName, next) => renderers)` 为任意工具的调用选择渲染器，包括尚未注册的工具，例如恢复的会话中其服务器尚未连接的 MCP 工具。`next()` 返回其余解析器（按扩展加载顺序）以及已注册工具本会采用的渲染器，因此 `next() ?? mine` 只做兜底补位。

### MCP 服务器

`pi.registerMcpServer(name, config)` 为当前会话添加一个 MCP 服务器。`config` 的形状与 [`mcp.json`](mcp.md) 中 `mcpServers` 条目一致：stdio 服务器用 `command`、`args`、`env` 和 `cwd`，HTTP 服务器用 `url`、`headers` 和 `oauth`，另有 `exposure`、`toolExposure`、`description`、`enabled` 和 `timeout`。

```typescript
pi.registerMcpServer("jira", { url: "https://mcp.example.com/jira", exposure: "codemode" });
pi.unregisterMcpServer("jira");
```

扩展加载期间注册的服务器会在会话启动时随 `mcp.json` 服务器一起连接；之后注册的服务器立即连接，`pi.unregisterMcpServer()` 会关闭连接并使该服务器的工具不可触达。注册不会被保存：每次加载都要重新注册，例如根据扩展自身的设置来决定。`mcp.json` 中同名服务器优先，且 `/mcp` 会显示这一覆盖。再次注册同名会替换本扩展先前的注册；注册其他扩展已占用的名称、无效名称或无效配置都会抛错。

内置的 MCP 支持负责连接已注册的服务器。若没有任何组件去连接——因为内置支持被另一个扩展替换了（见 [MCP](mcp.md#替换内置的-mcp-支持)）——每次注册都会作为扩展错误上报。其他 MCP 扩展也可以连接已注册的服务器：在 `session_start` 时用 `pi.getMcpServers()` 读取它们，并处理 `mcp_servers_change` 事件以响应后续变更。

<a id="extensioncontext"></a>
<a id="extensioncommandcontext"></a>
<a id="use-extension-context"></a>

### 上下文与会话变更

`ExtensionContext` 提供工作目录、模式、UI、会话管理器、模型运行时、中止信号、上下文用量，以及压缩和关闭的控制。
提供商中立的嵌套模型调用请使用 `ctx.modelRegistry.streamSimple()`。

命令处理器收到的是 `ExtensionCommandContext`，它额外提供等待空闲、重新加载、树导航和会话替换的操作。
这些操作仅限命令使用，因为从生命周期处理器中调用它们可能造成运行时死锁。

会话替换会使旧上下文失效。切换前只捕获纯数据，会话相关的工作改用 `withSession` 提供的新上下文。

<a id="state-management"></a>
<a id="persist-state"></a>

### 状态

根据状态参与会话的方式选择存储位置：

| 状态 | 存储 |
|---|---|
| 跟随活动分支的工具状态 | 工具结果的 `details` |
| 不进入模型上下文的持久数据 | `pi.appendEntry()` |
| 既存储又发送给模型的自定义内容 | `pi.sendMessage()` |
| 单个会话之外的数据 | 外部存储 |

在 `session_start` 时从 `ctx.sessionManager.getBranch()` 重建分支敏感状态。
不要从每个文件条目重建它，因为被弃置的分支代表另一段历史。
当自定义存储内容需要出现在转录中时，注册条目或消息渲染器。

<a id="custom-ui"></a>
<a id="mode-behavior"></a>
<a id="interact-with-the-user"></a>
<a id="account-for-each-mode"></a>

### UI 与模式

`ctx.ui` 提供对话框、通知、状态文本、部件（widget）、标题、编辑器（editor）访问和自定义组件。
只有当交互需要自己的渲染和输入时才使用 `ctx.ui.custom()`。
组件、焦点、浮层（overlay）、主题和性能方面的指引见[终端 UI](tui.md)。

扩展在交互、RPC、JSON 和打印模式下都会加载。
交互模式提供完整的终端 UI。
RPC 模式可以通过 [RPC 扩展 UI 协议](rpc-extension-ui.md)转发受支持的对话框和通知，但不能转发自定义终端组件；JSON 和打印模式没有 UI。
终端专属行为用 `ctx.mode === "tui"` 保护，交互和 RPC 客户端都支持的交互用 `ctx.hasUI` 判断。

保持工具与事件行为独立于渲染，非交互模式才能正常工作。

<a id="error-handling"></a>
<a id="handle-errors-and-shutdown"></a>

### 错误与清理

Pi 会上报处理器错误并尽可能继续运行。`tool_call` 处理器失败会作为故障保护拦下该工具；工具执行失败则变成给模型的错误结果。

即使正常操作已尝试清理，也要在 `session_shutdown` 中释放资源。
清理要保持幂等，因为取消、重新加载、会话替换和进程退出可能汇聚到同一路径。
需要有序地关闭进程时使用 `ctx.shutdown()`。

<a id="examples-reference"></a>
<a id="use-examples-as-the-implementation-reference"></a>

## 示例与参考

已提交的[扩展示例](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/)覆盖工具、生命周期事件、命令、标志、快捷键、状态、渲染、提供商、OAuth、远程执行和终端组件。
从与你的集成点对应的最小示例入手。

模型服务集成用[自定义提供商](custom-provider.md)，自定义组件用[终端 UI](tui.md)，随其他资源一起安装或分发扩展用 [Pi 包](packages.md)。
