---
title: "会话文件格式"
---

会话以 JSONL（JSON Lines）文件的形式存储。每一行都是一个带有 `type` 字段的 JSON 对象。会话条目通过 `id`/`parentId` 字段构成树形结构，无需创建新文件即可原地分支。

如需以编程方式创建、持久化和遍历树结构，请参阅 [`SessionManager` API](sdk#sessionmanager-api)。


## 文件位置

```
~/.pi/agent/sessions/--<path>--/<timestamp>_<session-id>.jsonl
```

默认情况下，`<session-id>` 是一个 UUID。调用方可以通过 SDK 或 `--session-id` 提供自定义 ID。对于 `<path>`，Pi 会移除开头的路径分隔符，并将 `/`、`\\` 和 `:` 替换为 `-`。

## 删除会话

删除 `~/.pi/agent/sessions/` 目录下对应的 `.jsonl` 文件即可移除会话。

Pi 也支持在 `/resume` 中以交互方式删除会话（选中一个会话并按 `Ctrl+D`，然后确认）。在可用时，pi 会使用 `trash` CLI 来避免永久删除。

## 会话版本

会话在头部有一个版本字段：

- **版本 1**：线性条目序列（旧版，加载时自动迁移）
- **版本 2**：通过 `id`/`parentId` 链接的树形结构
- **版本 3**：将 `hookMessage` 角色更名为 `custom`（扩展统一化）

现有会话在加载时会自动迁移到当前版本（v3）。

## 源码文件

GitHub 上的源码（[pi](https://github.com/earendil-works/pi)）：
- [`packages/coding-agent/src/core/session-manager.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/session-manager.ts) - 会话条目类型与 SessionManager
- [消息类型](message-types) - 共享的消息与内容块参考
- [`packages/coding-agent/src/core/messages.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/messages.ts) - 扩展消息类型
- [`packages/ai/src/types.ts`](https://github.com/earendil-works/pi/blob/main/packages/ai/src/types.ts) - 基础消息与内容块类型
- [`packages/agent/src/types.ts`](https://github.com/earendil-works/pi/blob/main/packages/agent/src/types.ts) - 可扩展的 `AgentMessage` 联合类型

如需项目中的 TypeScript 定义，请查看 `node_modules/@earendil-works/pi-coding-agent/dist/` 和 `node_modules/@earendil-works/pi-ai/dist/`。

## 消息

`message` 条目存储一个 [`AgentMessage`](message-types)。消息内容块、角色、用量和消息时间戳定义在[消息类型](message-types)中。

会话条目的时间戳是 ISO 8601 字符串。嵌套消息的时间戳是以毫秒为单位的 Unix 时间戳。

## 条目基类

除 `SessionHeader` 外，所有条目都继承自 `SessionEntryBase`：

```typescript
interface SessionEntryBase {
  type: string;
  id: string;           // Usually an 8-char hex ID; may fall back to a full UUID
  parentId: string | null;  // Parent entry ID (null for a root entry)
  timestamp: string;    // ISO timestamp
}
```

## 条目类型

### SessionHeader

文件的第一行。仅包含元数据，不属于树的一部分（没有 `id`/`parentId`）。

```json
{"type":"session","version":3,"id":"uuid","timestamp":"2024-12-03T14:00:00.000Z","cwd":"/path/to/project"}
```

对于有父会话的会话（通过 `/fork`、`/clone` 或 `newSession({ parentSession })` 创建）：

```json
{"type":"session","version":3,"id":"uuid","timestamp":"2024-12-03T14:00:00.000Z","cwd":"/path/to/project","parentSession":"/path/to/original/session.jsonl"}
```

### SessionMessageEntry

对话中的一条消息。`message` 字段包含一个 `AgentMessage`。系统消息承载提示词与工具装载（tool loadout）：会话的第一次请求会持久化一条包含所有提示词分区和工具声明的系统消息，之后的变更则以系统消息的形式持久化——这些消息按名称修补 `sections`（`null` 表示移除某个分区），并列出 `toolsAdded`/`toolsRemoved`。按顺序重放它们即可得到当前的提示词与工具；没有单独的提示词状态条目。

```json
{"type":"message","id":"a0b1c2d3","parentId":null,"timestamp":"2024-12-03T14:00:00.000Z","message":{"role":"system","content":"","sections":{"preamble":"You are an expert coding assistant...","tools":"<tools>\n- read: ...\n</tools>","cwd":"/project"},"toolsAdded":[{"name":"read","description":"...","parameters":{}}],"timestamp":1733234400000}}
{"type":"message","id":"d4e5f6g7","parentId":"c3d4e5f6","timestamp":"2024-12-03T14:04:00.000Z","message":{"role":"system","content":"","sections":{"skills":"<skills>...</skills>"},"toolsRemoved":[{"name":"write"}],"timestamp":1733234640000}}
```

在系统消息机制出现之前创建的会话没有前置的系统消息；第一次请求会把当前提示词作为后续的系统消息声明出来，其重放方式相同。

```json
{"type":"message","id":"a1b2c3d4","parentId":"prev1234","timestamp":"2024-12-03T14:00:01.000Z","message":{"role":"user","content":"Hello","timestamp":1733234401000}}
{"type":"message","id":"b2c3d4e5","parentId":"a1b2c3d4","timestamp":"2024-12-03T14:00:02.000Z","message":{"role":"assistant","content":[{"type":"text","text":"Hi!"}],"api":"anthropic-messages","provider":"anthropic","model":"claude-sonnet-4-5","usage":{...},"stopReason":"stop","timestamp":1733234402000}}
{"type":"message","id":"c3d4e5f6","parentId":"b2c3d4e5","timestamp":"2024-12-03T14:00:03.000Z","message":{"role":"toolResult","toolCallId":"call_123","toolName":"bash","content":[{"type":"text","text":"output"}],"isError":false,"timestamp":1733234403000}}
```

助手消息会记录生成它们的模型。较新的消息还会记录 `thinkingLevel`，即该次响应所请求的 Pi 思考级别。

### ModelChangeEntry

在会话中途用户切换模型时产生。最新的一条条目即当前选中的模型，它可能是一个[虚拟模型](virtual-models)；此时助手消息会记录实际应答的物理模型。

```json
{"type":"model_change","id":"d4e5f6g7","parentId":"c3d4e5f6","timestamp":"2024-12-03T14:05:00.000Z","provider":"openai","modelId":"gpt-4o"}
```

### ThinkingLevelChangeEntry

在用户更改思考/推理级别时产生。

```json
{"type":"thinking_level_change","id":"e5f6g7h8","parentId":"d4e5f6g7","timestamp":"2024-12-03T14:06:00.000Z","thinkingLevel":"high"}
```

### UsageEntry

记录不对应助手消息、也不参与 LLM 上下文的按模型归类的用量。`kind` 是标识该操作的任意字符串；例如，缓存预热使用 `"cache_warm"`。

```json
{"type":"usage","id":"f6g7h8i9","parentId":"e5f6g7h8","timestamp":"2024-12-03T14:08:00.000Z","kind":"cache_warm","provider":"anthropic","model":"claude-sonnet-4-5","usage":{"input":0,"output":0,"cacheRead":50000,"cacheWrite":0,"totalTokens":50000,"cost":{"input":0,"output":0,"cacheRead":0.015,"cacheWrite":0,"total":0.015}}}
```

用量条目会计入会话的 token 与费用总计。Pi 会把它们从对话树中隐藏。消费方应把未知的 `kind` 值当作正常用量处理，而不是拒绝它们。

### CompactionEntry

在上下文被压缩时创建。存储较早消息的摘要，以及一份完整的系统提示词/工具检查点。

```json
{"type":"compaction","id":"f6g7h8i9","parentId":"e5f6g7h8","timestamp":"2024-12-03T14:10:00.000Z","summary":"User discussed X, Y, Z...","firstKeptEntryId":"c3d4e5f6","tokensBefore":50000,"systemMessage":{"role":"system","content":"You are a coding assistant.","toolsAdded":[],"timestamp":1733235000000}}
```

`firstKeptEntryId` 为必填。它标识压缩条目之前被保留的第一个条目。重建上下文时，Pi 会用压缩摘要替换更早的已摘要条目，并保留从该条目开始的范围。不保留任何内容的压缩（retain-none）会在该字段中存储它自己的 ID，因此不会保留任何之前的条目。

可选字段：
- `systemMessage`：压缩边界处可重放的提示词分区与工具声明；它会成为压缩后上下文的前置系统消息，保留条目中的系统消息会被弃用以优先使用它。较旧的会话条目中没有该字段。
- `usage`：生成摘要所消耗的 LLM 用量；计入会话 token 与费用总计
- `details`：实现相关的数据（例如默认实现的 `{ readFiles: string[], modifiedFiles: string[] }`，或扩展的自定义数据）
- `fromHook`：由扩展生成时为 `true`，由 pi 生成时为 `false`/`undefined`（旧字段名）

### ContextEditEntry

对某个较早的、会产生上下文的条目的追加式编辑。它只改变未来的模型上下文；目标条目及其元数据在原始历史、UI、导出和会话统计中保持不变。

```json
{"type":"context_edit","id":"g6h7i8j9","parentId":"f6g7h8i9","timestamp":"2024-12-03T14:11:00.000Z","targetId":"c3d4e5f6","replacement":null}
```

目标可以是用户、助手、工具结果或自定义消息条目。`replacement: null` 表示把目标从模型上下文中省略。非空的 `replacement` 只替换目标消息的内容。对助手和工具结果条目的字符串替换会被规范化为单个文本块，因为这些角色要求内容为数组。如果多条编辑指向同一条目，则以活动分支上最新的编辑为准。编辑是相对于分支的：导航到该编辑之前的节点时，目标条目原本的贡献会重新显现。

### BranchSummaryEntry

在通过 `/tree` 切换分支时创建，包含由 LLM 生成的、对被离开分支直到共同祖先为止的摘要。捕获被放弃路径上的上下文。

```json
{"type":"branch_summary","id":"g7h8i9j0","parentId":"a1b2c3d4","timestamp":"2024-12-03T14:15:00.000Z","fromId":"f6g7h8i9","summary":"Branch explored approach A..."}
```

`parentId` 是新分支继续的起点条目。`fromId` 是前一个叶子条目，其被放弃的路径已被摘要。

可选字段：
- `usage`：生成摘要所消耗的 LLM 用量；计入会话 token 与费用总计
- `details`：文件追踪数据（`{ readFiles: string[], modifiedFiles: string[] }`）为默认实现，或扩展的自定义数据
- `fromHook`：由扩展生成时为 `true`，由 pi 生成时为 `false`/`undefined`（旧字段名）

### CustomEntry

扩展状态持久化。不参与 LLM 上下文。

```json
{"type":"custom","id":"h8i9j0k1","parentId":"g7h8i9j0","timestamp":"2024-12-03T14:20:00.000Z","customType":"my-extension","data":{"count":42}}
```

使用 `customType` 在重新加载时识别你的扩展的条目。交互模式可以通过 `pi.registerEntryRenderer(customType, renderer)` 渲染自定义条目，但它们依然不参与 LLM 上下文。

Pi 将[虚拟模型](virtual-models)的路由状态存储为自定义条目，其 `customType` 为 `pi.virtual-model-state`，`data` 为 `{ provider, modelId, state }`。

### CustomMessageEntry

由扩展注入、且参与 LLM 上下文的消息。

```json
{"type":"custom_message","id":"i9j0k1l2","parentId":"h8i9j0k1","timestamp":"2024-12-03T14:25:00.000Z","customType":"my-extension","content":"Injected context...","display":true}
```

字段：
- `content`：字符串或 `(TextContent | ImageContent)[]`（与 UserMessage 相同）
- `display`：`true` = 以独特样式显示在 TUI 中，`false` = 隐藏
- `details`：可选的扩展专属元数据（不会发送给 LLM）

### LabelEntry

用户在某个条目上定义的书签/标记。

```json
{"type":"label","id":"j0k1l2m3","parentId":"i9j0k1l2","timestamp":"2024-12-03T14:30:00.000Z","targetId":"a1b2c3d4","label":"checkpoint-1"}
```

将 `label` 设为 `undefined` 即可清除标签。

### SessionInfoEntry

会话元数据（例如用户定义的显示名称）。可通过 `/name`、`--name` / `-n` 或扩展中的 `pi.setSessionName()` 设置。

```json
{"type":"session_info","id":"k1l2m3n4","parentId":"j0k1l2m3","timestamp":"2024-12-03T14:35:00.000Z","name":"Refactor auth module"}
```

设置后，会话选择器（`/resume`）中会显示会话名称而不是第一条消息。

## 树形结构

条目通常构成一棵树，但导航 API 可以创建多个根：
- 根条目的 `parentId: null`；最初第一个条目就是根
- 每个非根条目通过 `parentId` 指向其父条目
- 分支会从较早的条目创建新的子条目
- 树中的当前位置称为"叶子"（leaf）
- 调用 `resetLeaf()` 或 `branchWithSummary(null, ...)` 可以让后来的条目成为另一个根

```
[user msg] ─── [assistant] ─── [user msg] ─── [assistant] ─┬─ [user msg] ← current leaf
                                                            │
                                                            └─ [branch_summary] ─── [user msg] ← alternate branch
```

## 上下文构建

`buildContextEntries()` 从当前叶子向根回溯，生成活动条目列表，并遵循压缩：

1. 收集路径上的所有条目
2. 如果路径上存在一个或多个 `CompactionEntry`，则使用最新的一条：
   - 首先包含压缩条目
   - 包含从 `firstKeptEntryId` 到压缩条目之前（不含压缩条目）的非系统条目
   - 包含压缩条目之后的条目
3. 保留所选范围内的非消息条目，以便交互模式能够渲染它们

随后 `buildSessionProjection()` 会为每个选中的目标应用最新的 `context_edit`。它返回模型可见的消息及其来源条目。被省略的目标不会产生消息；替换会保留来源条目的角色和元数据，只改变内容。原始的选中条目不会被修改。

`buildSessionContext()` 在该投影的基础上构建 LLM 的消息列表：

1. 从完整路径中提取当前的模型与思考级别设置
2. 将选中的条目转换为消息：
   - `message` -> 所存储的 `AgentMessage`
   - `compaction` -> 完整的系统检查点，后接 `compactionSummary`
   - `branch_summary` -> `branchSummary`
   - `custom_message` -> `CustomMessage`
   - `context_edit` -> 本身不产生上下文消息
   - `usage` 与 `custom` -> 不产生上下文消息

压缩摘要会替换 `firstKeptEntryId` 之前的条目。压缩前的系统消息会被折叠进完整检查点，而不是从保留范围中重放。保留的非系统条目以及压缩之后的所有条目对 LLM 依然可见。

## 解析示例

```typescript
import { readFileSync } from "fs";

const lines = readFileSync("session.jsonl", "utf8").trim().split("\n");

for (const line of lines) {
  const entry = JSON.parse(line);

  switch (entry.type) {
    case "session":
      console.log(`Session v${entry.version ?? 1}: ${entry.id}`);
      break;
    case "message":
      console.log(`[${entry.id}] ${entry.message.role}: ${JSON.stringify(entry.message.content)}`);
      break;
    case "compaction":
      console.log(`[${entry.id}] Compaction: ${entry.tokensBefore} tokens summarized`);
      break;
    case "branch_summary":
      console.log(`[${entry.id}] Branch from ${entry.fromId}`);
      break;
    case "usage":
      console.log(`[${entry.id}] Usage (${entry.kind}): ${entry.usage.totalTokens} tokens`);
      break;
    case "custom":
      console.log(`[${entry.id}] Custom (${entry.customType}): ${JSON.stringify(entry.data)}`);
      break;
    case "custom_message":
      console.log(`[${entry.id}] Extension message (${entry.customType}): ${entry.content}`);
      break;
    case "label":
      console.log(`[${entry.id}] Label "${entry.label}" on ${entry.targetId}`);
      break;
    case "model_change":
      console.log(`[${entry.id}] Model: ${entry.provider}/${entry.modelId}`);
      break;
    case "thinking_level_change":
      console.log(`[${entry.id}] Thinking: ${entry.thinkingLevel}`);
      break;
  }
}
```
