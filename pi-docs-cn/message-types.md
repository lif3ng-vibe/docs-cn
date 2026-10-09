---
title: "消息类型"
---

Pi 在 SDK 状态、生命周期事件、RPC 响应和持久化的会话消息条目中使用 `AgentMessage` 值。本页定义这些共享消息及其内容块。

消息时间戳是以毫秒为单位的 Unix 时间戳。它们与[会话条目](session-format.md#%E6%9D%A1%E7%9B%AE%E5%9F%BA%E7%B1%BB)上的 ISO 8601 时间戳不同。

源码定义：

- [`packages/ai/src/types.ts`](https://github.com/earendil-works/pi/blob/main/packages/ai/src/types.ts) 定义面向提供商的消息和内容块。
- [`packages/agent/src/types.ts`](https://github.com/earendil-works/pi/blob/main/packages/agent/src/types.ts) 定义可扩展的 `AgentMessage` 联合类型。
- [`packages/coding-agent/src/core/messages.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/messages.ts) 添加 coding-agent 的消息角色。

## 内容块

### TextContent

```typescript
interface TextContent {
  type: "text";
  text: string;
  textSignature?: string;
}
```

`textSignature` 包含提供商专属的消息元数据。请把它当作不透明值。

### ImageContent

```typescript
interface ImageContent {
  type: "image";
  data: string;
  mimeType: string;
}
```

`data` 是 base64 编码的图像数据。`mimeType` 标识其媒体类型，例如 `image/png` 或 `image/jpeg`。

### ThinkingContent

```typescript
interface ThinkingContent {
  type: "thinking";
  thinking: string;
  thinkingSignature?: string;
  redacted?: boolean;
}
```

思考签名包含提供商专属的重放数据。请把它们当作不透明值。被遮蔽（redacted）的块可以没有可见的思考文本，同时在 `thinkingSignature` 中保留加密载荷。

### ToolCall

```typescript
interface ToolCall {
  type: "toolCall";
  id: string;
  name: string;
  arguments: Record<string, any>;
  thoughtSignature?: string;
  namespace?: string;
}
```

`thoughtSignature` 是提供商专属的。`namespace` 标识一个 OpenAI Responses 命名空间，用于动态加载或带命名空间的工具。

## 用量

助手消息总是包含用量。当工具执行了嵌套的模型工作时，工具结果也可以包含用量。

```typescript
interface Usage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  cacheWrite1h?: number;
  reasoning?: number;
  totalTokens: number;
  cost: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    total: number;
  };
}
```

如果存在，`reasoning` 已包含在 `output` 中；不要重复相加。`cacheWrite1h` 是 `cacheWrite` 中以一小时保留期写入的子集。

## 基础消息

### SystemMessage

```typescript
interface SystemMessage {
  role: "system";
  content: string | TextContent[];
  sections?: Record<string, string | null>;
  toolsAdded?: Tool[];
  toolsRemoved?: ToolReference[];
  timestamp: number;
}
```

前置的系统消息声明初始的提示词与工具。后续的系统消息可以追加指令、替换或移除具名的提示词分区、以及添加或移除工具。按顺序重放它们即可得到当前状态。

### UserMessage

```typescript
interface UserMessage {
  role: "user";
  content: string | (TextContent | ImageContent)[];
  timestamp: number;
}
```

### AssistantMessage

```typescript
interface AssistantMessage {
  role: "assistant";
  content: (TextContent | ThinkingContent | ToolCall)[];
  api: string;
  provider: string;
  model: string;
  responseModel?: string;
  responseId?: string;
  providerThinkingLevel?: string;
  thinkingLevel?: ModelThinkingLevel;
  diagnostics?: AssistantMessageDiagnostic[];
  usage: Usage;
  stopReason: "pending" | "stop" | "length" | "toolUse" | "error" | "aborted" | "deferred";
  deferred?: DeferredHandle;
  errorMessage?: string;
  rawStopReason?: string;
  endTurn?: boolean;
  timestamp: number;
}
```

`responseModel` 在具体响应模型与所请求的模型不同时记录该提供商响应模型。`responseId`、`providerThinkingLevel`、`thinkingLevel`、`diagnostics` 和 `rawStopReason` 保留提供商或运行时细节。

`"pending"` 用于流式传输中的部分助手消息。`message_end` 中已完成的消息带有终止性的停止原因，且 Pi 不会把 `"pending"` 的助手消息持久化到会话 JSONL 中。

`"deferred"` 响应带有一个 `DeferredHandle`，包含取回该响应所需的提供商数据：

```typescript
interface DeferredHandle {
  provider: string;
  modelId: string;
  api: string;
  id: string;
  expiresAt?: number;
  pollAfterMs?: number;
  data?: JsonValue;
}
```

### ToolResultMessage

```typescript
interface ToolResultMessage<TDetails = any> {
  role: "toolResult";
  toolCallId: string;
  toolName: string;
  content: (TextContent | ImageContent)[];
  details?: TDetails;
  usage?: Usage;
  nestedCalls?: NestedToolCalls;
  isError: boolean;
  timestamp: number;
}
```

`details` 是工具专属的。可选的 `usage` 报告该工具执行的嵌套模型工作，并计入全会话统计，但它不属于主模型调用的用量。`nestedCalls` 记录该工具对其他工具发起调用的有界元数据：

```typescript
interface NestedToolCalls {
  calls: NestedToolCallRecord[];
  complete: boolean;
}

interface NestedToolCallRecord {
  id: string;
  name: string;
  arguments?: JsonObject;
  argumentsBytes?: number;
  status: "ok" | "error" | "unfinished";
  durationMs?: number;
  error?: string;
}
```

## coding-agent 消息

coding-agent 包为 `AgentMessage` 扩展了四个角色。

### BashExecutionMessage

由直接执行的 shell 命令创建，包括 RPC 的 [`bash`](rpc-commands.md#bash) 命令。它不是 LLM 工具结果。

```typescript
interface BashExecutionMessage {
  role: "bashExecution";
  command: string;
  output: string;
  exitCode: number | undefined;
  cancelled: boolean;
  truncated: boolean;
  fullOutputPath?: string;
  excludeFromContext?: boolean;
  timestamp: number;
}
```

除非 `excludeFromContext` 为 true，否则 Pi 会在下一次模型请求之前把该消息转换为 user 角色的文本。

### CustomMessage

在扩展发送上下文消息时创建。

```typescript
interface CustomMessage<T = unknown> {
  role: "custom";
  customType: string;
  content: string | (TextContent | ImageContent)[];
  display: boolean;
  details?: T;
  timestamp: number;
}
```

Pi 会把其内容转换为用户消息用于模型请求。`display` 控制终端渲染；`details` 不会发送给模型。

### BranchSummaryMessage

```typescript
interface BranchSummaryMessage {
  role: "branchSummary";
  summary: string;
  fromId: string | null;
  timestamp: number;
}
```

Pi 从持久化的 `branch_summary` 条目创建此上下文消息。

### CompactionSummaryMessage

```typescript
interface CompactionSummaryMessage {
  role: "compactionSummary";
  summary: string;
  tokensBefore: number;
  timestamp: number;
}
```

Pi 从持久化的 `compaction` 条目创建此上下文消息。

## AgentMessage 联合类型

在 coding agent 中，该联合类型等价于：

```typescript
type AgentMessage =
  | SystemMessage
  | UserMessage
  | AssistantMessage
  | ToolResultMessage
  | BashExecutionMessage
  | CustomMessage
  | BranchSummaryMessage
  | CompactionSummaryMessage;
```

在更底层的 agent 包中，`AgentMessage` 是 `Message | CustomAgentMessages[keyof CustomAgentMessages]`。应用可以通过 TypeScript 声明合并添加角色，因此消费者在接收来自被增强宿主的消息时，应容忍未知的自定义角色。
