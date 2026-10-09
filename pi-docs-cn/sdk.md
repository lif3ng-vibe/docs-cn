---
title: "SDK"
---

`@earendil-works/pi-coding-agent` 把 Pi 嵌入 Node.js 或 Bun 进程。它提供对命令行应用所用的智能体（agent）、会话（session）、工具、模型和资源的直接 TypeScript 访问。

进程内 TypeScript 集成请使用 SDK。需要语言无关或隔离的子进程时，见 [CLI 集成](cli-integration)。

```typescript
import { createAgentSession } from "@earendil-works/pi-coding-agent";

const { session } = await createAgentSession();

try {
  await session.prompt("What files are in the current directory?");
  console.log(session.getLastAssistantText());
} finally {
  session.dispose();
}
```

它使用工作目录、发现的资源、存储的设置和已配置的凭据。`prompt()` 在运行结束时 resolve。

[完整的最小示例](../examples/sdk/01-minimal.ts)还会流式输出文本事件。所有 [SDK 示例](../examples/sdk/)都随仓库一起做类型检查。

<a id="session-management"></a>

## 会话生命周期

`createAgentSession()` 创建一个 `AgentSession`。会话拥有一段对话及其模型和工具、排队消息、压缩（compaction）状态和扩展运行时。

通过 `session.messages`、`session.model`、`session.thinkingLevel`、`session.systemPrompt` 和 `session.getActiveToolNames()` 读取当前状态。

`session.systemPrompt` 是只读的，返回当前生效的系统提示词，包括尚未发送给模型的变更。工具变更会在下一次请求之前向模型声明。

<a id="sessionmanager-api"></a>

### 会话存储

会话默认持久化。`SessionManager` 拥有持久化或内存中的条目树，并跟踪其活动叶子。分支操作改变该叶子但不删除被弃置的分支。Pi 重建模型上下文时，管理器会选中活动分支并应用压缩。

`SessionManager` 对已定稿的模型上下文具有权威性。要恢复外部历史，请在构造会话时传入包含那些条目的管理器。给 `session.agent.state.messages` 赋值不会替换持久化上下文。

宿主不想要会话文件时使用内存管理器：

```typescript
import { createAgentSession, SessionManager } from "@earendil-works/pi-coding-agent";

const { session } = await createAgentSession({
  sessionManager: SessionManager.inMemory(),
});
```

创建、打开、继续、列出和分叉（fork）会话见已提交的[会话示例](../examples/sdk/11-sessions.ts)。[会话文件格式](session-format)定义了持久化的 JSONL 契约，[消息类型](message-types)定义了转录值。精确的方法和签名请使用导出的 TypeScript 声明或 [`session-manager.ts`](../src/core/session-manager.ts)。

`cwd` 选择用于项目资源发现、上下文文件、会话分组和内置工具路径的工作区。目标与 `process.cwd()` 不同时要显式传入。

`session.dispose()` 中止活动工作、使扩展上下文失效、断开与智能体的连接并移除事件监听器。会话不再需要时调用它。

`AgentSessionRuntime` 额外提供 `newSession()`、`switchSession()`、`fork()` 和 `importFromJsonl()`。每个操作都会替换活动的 `AgentSession`，并为目标工作目录重建各服务。

运行时被替换后，订阅仍属于旧的 `AgentSession`，必须重新绑定。见[会话运行时示例](../examples/sdk/13-session-runtime.ts)。

## 发送提示词

`prompt()` 在普通用户消息进入智能体之前处理扩展命令并展开基于文件的提示词模板（prompt template）。对于已被接受的智能体运行，它在该运行结束后 resolve，包括自动重试。

会话已在流式运行时发送的提示词必须指明是引导（steer）当前运行还是跟进。不作选择直接调用 `prompt()` 会被拒绝，而不是猜测。

引导消息在当前助手轮次及其工具调用之后进入。追问消息在当前运行完成待办工作后进入。`steer()` 和 `followUp()` 直接暴露这两种行为：输入被排队（包括被扩展转换之后）时返回 `"queued"`，被扩展消费时返回 `"handled"`。

`abort()` 停止活动操作并等待会话空闲。`waitForIdle()` 只等待、不中止。

## 订阅事件

宿主需要流式输出时，先订阅再发提示词：

```typescript
const unsubscribe = session.subscribe((event) => {
  if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
    process.stdout.write(event.assistantMessageEvent.delta);
  }
});

try {
  await session.prompt("Explain this repository");
} finally {
  unsubscribe();
}
```

会话事件报告消息更新、工具执行、队列、压缩、重试和运行生命周期变更。

`message_end` 包含权威的已完成消息。`agent_end` 标志一次底层智能体运行的结束，但之后仍可能有自动恢复或排队工作。

宿主需要知道 Pi 不会再自动继续时，使用 `agent_settled`。

## 配置会话

不作覆盖时，工厂创建 `ModelRuntime`、基于文件的 `SettingsManager`、持久化 `SessionManager`、`DefaultResourceLoader` 以及配置好的默认工具。

每个边界都可以显式提供：

- `modelRuntime`、`model`、`thinkingLevel` 和 `scopedModels` 控制模型访问与选择。
- `settingsManager` 提供合并后的设置或内存配置。
- `sessionManager` 提供持久化或内存中的对话历史。
- `resourceLoader` 提供扩展、技能、提示词模板、主题和上下文文件。
- `tools`、`noTools`、`excludeTools` 和 `customTools` 控制活动工具集。

想要标准发现加少量指定覆盖时使用 `DefaultResourceLoader`。资源存储与发现完全由宿主管辖时，提供自定义 `ResourceLoader`。

<a id="inlineextension"></a>

内联扩展工厂可以通过 `DefaultResourceLoader` 提供。只有当它需要在诊断和启动输出中有稳定名称时，才给它起 `InlineExtension` 名称。带 `replaceable: true` 的具名内联扩展，在其他扩展于加载期间注册了同名工具、命令或标志时会被略去，而不是两者带着冲突一起加载。CLI 内置的 codemode、tool search 和 MCP 扩展都是可替换的。带 `builtin: true` 的具名条目不是内联扩展：它提供 `builtin:<name>` 扩展的代码，其加载方式与配置的扩展文件一样。它默认加载、列在 `pi config` 中，可通过 `extensions` 设置中的 `-builtin:<name>` 或 `noExtensions` 禁用；`additionalExtensionPaths: ["builtin:<name>"]` 可显式加载它。它在项目信任解析之后加载，因此不能处理 `project_trust`。CLI 的内置扩展用的就是它。

<a id="codemode-mcp"></a>

CLI 把 `codemode`、`tool_search` 和 MCP 作为内置扩展加载。SDK 会话不会；请把 `createCodemodeExtension()`、`createToolSearchExtension()` 和 `createMcpExtension()` 加入 `DefaultResourceLoader` 的 `extensionFactories`。`codemode` 和 `tool_search` 注册后处于未激活状态：可以通过 `defaultTools` 设置启用（`["+codemode", "+tool_search"]` 保留其余默认工具），或让 MCP 扩展来激活它们：`codemode` exposure 的服务器启用 `codemode`，`deferred` exposure 的服务器启用 `tool_search`。MCP 扩展在 `session_start` 时连接其服务器，因此要调用 `session.bindExtensions()`。见 [Codemode 与 MCP](../examples/sdk/14-codemode-mcp.ts)。

聚焦示例见[模型](../examples/sdk/02-custom-model.ts)、[工具](../examples/sdk/05-tools.ts)、[扩展](../examples/sdk/06-extensions.ts)和[完全控制](../examples/sdk/12-full-control.ts)。

## 示例

| 示例 | 用途 |
|---|---|
| [最小示例](../examples/sdk/01-minimal.ts) | 创建、提示、观察并销毁会话 |
| [自定义模型](../examples/sdk/02-custom-model.ts) | 选择模型和思考级别 |
| [系统提示词](../examples/sdk/03-custom-prompt.ts) | 替换或追加系统提示词 |
| [技能](../examples/sdk/04-skills.ts) | 发现、过滤并添加技能 |
| [工具](../examples/sdk/05-tools.ts) | 选择内置工具及其工作目录 |
| [扩展](../examples/sdk/06-extensions.ts) | 加载基于文件的和内联的扩展 |
| [上下文文件](../examples/sdk/07-context-files.ts) | 添加或替换项目指令 |
| [提示词模板](../examples/sdk/08-prompt-templates.ts) | 添加文件式提示词模板 |
| [凭据](../examples/sdk/09-api-keys-and-oauth.ts) | 配置凭据与模型存储 |
| [设置](../examples/sdk/10-settings.ts) | 提供基于文件或内存的设置 |
| [会话](../examples/sdk/11-sessions.ts) | 控制会话持久化与恢复 |
| [完全控制](../examples/sdk/12-full-control.ts) | 替换默认的发现与状态服务 |
| [会话运行时](../examples/sdk/13-session-runtime.ts) | 安全替换活动会话 |
| [Codemode 与 MCP](../examples/sdk/14-codemode-mcp.ts) | 添加 `codemode`、`tool_search` 和 MCP 扩展 |

<a id="exports"></a>

## 资源

- [选择模型](models)介绍模型选择与兼容端点；[提供商](providers)介绍凭据与提供商专属配置。
- [配置](configuration)解释常规发现与设置；[设置](settings)列出每一项设置。
- [会话与上下文](sessions)解释会话行为；[会话格式](session-format)定义持久化条目；[消息类型](message-types)定义共享的转录值。
- [扩展](extensions)、[技能](skills)和[提示词模板](prompt-templates)记录通过 `ResourceLoader` 提供的资源。
- [CLI 集成](cli-integration)介绍进程内 SDK 集成之外的打印、JSON 和 RPC 方案。
