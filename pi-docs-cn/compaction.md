# 压缩参考

本参考描述自动压缩、分支摘要、持久化条目和扩展钩子。用户工作流请参阅[会话与上下文](sessions.md#%E7%AE%A1%E7%90%86%E5%AF%B9%E8%AF%9D%E4%B8%8A%E4%B8%8B%E6%96%87)。

**源码文件**（[pi](https://github.com/earendil-works/pi)）：
- [`packages/coding-agent/src/core/compaction/compaction.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/compaction.ts) - 自动压缩逻辑
- [`packages/coding-agent/src/core/compaction/branch-summarization.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/branch-summarization.ts) - 分支摘要
- [`packages/coding-agent/src/core/compaction/utils.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/utils.ts) - 共享工具（文件追踪、序列化）
- [`packages/coding-agent/src/core/session-manager.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/session-manager.ts) - 条目类型（`CompactionEntry`、`BranchSummaryEntry`）
- [`packages/coding-agent/src/core/extensions/types.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/types.ts) - 扩展事件类型

如需项目中的 TypeScript 定义，请查看 `node_modules/@earendil-works/pi-coding-agent/dist/`。

## 概览

Pi 有两种摘要机制：

| 机制 | 触发条件 | 用途 |
|-----------|---------|---------|
| 压缩 | 上下文超过阈值，或 `/compact` | 摘要旧消息以释放上下文 |
| 分支摘要 | `/tree` 导航 | 切换分支时保留上下文 |

两者使用密切相关的结构化格式，并以累积方式追踪文件操作。摘要请求会禁用提示词缓存写入，因为这些一次性提示词不太可能被复用。

## 压缩

### 触发时机

自动压缩在以下条件满足时触发：

```
contextTokens > contextWindow - reserveTokens
```

默认情况下，`reserveTokens` 为 16384 token（可在 `~/.pi/agent/settings.json` 或 `<project-dir>/.pi/settings.json` 中配置）。这是为 LLM 的响应预留的空间。

在多轮智能体运行期间，Pi 会在工具执行完毕、其结果被追加之后、开始下一条助手响应之前，检查规范的投影上下文。如果越过阈值，Pi 会在 `prepareNextTurn` 期间执行压缩，然后在 `turn_start` 之前执行既有的追赶式引导轮询。当已完成的工具批次终止了运行、且没有排队消息需要再次响应时，会跳过这一轮间检查。Pi 还会在新的用户提示词之前进行检查，并在底层运行结束后执行最后的溢出恢复尝试。

提供商的上下文溢出错误，或过早出现最终的 `stopReason: "length"`，可以选择进行一次"压缩并重试"的恢复尝试。带工具调用的长度终止响应会保留其合成的失败工具结果，并遵循常规的工具/队列调度，而不是强制结束运行。

你也可以用 `/compact [instructions]` 手动触发，可选的指令用于聚焦摘要内容。

### 工作方式

1. **寻找切点**：在已定稿的会话投影中向前回溯，累计 token 估算值，直到达到 `keepRecentTokens`（默认 20k，可在 `~/.pi/agent/settings.json` 或 `<project-dir>/.pi/settings.json` 中配置）
2. **提取消息**：收集从上一个保留边界（或会话开始）到切点之间的投影消息
3. **生成摘要**：调用 LLM 以结构化格式进行摘要；若存在上一个摘要，则将其作为迭代上下文传入
4. **追加条目**：保存带有摘要和 `firstKeptEntryId` 的 `CompactionEntry`
5. **重建上下文**：会话为下一次请求重建上下文，使用摘要加上从 `firstKeptEntryId` 开始的消息

```
Before compaction:

  entry:  0     1     2     3      4     5     6      7      8     9
        ┌─────┬─────┬─────┬──────┬─────┬─────┬──────┬──────┬─────┬─────┐
        │ hdr │ usr │ ass │ tool │ usr │ ass │ tool │ tool │ ass │ tool│
        └─────┴─────┴─────┴──────┴─────┴─────┴──────┴──────┴─────┴─────┘
                └────────┬───────┘ └──────────────┬──────────────┘
               messagesToSummarize            kept messages
                                   ↑
                          firstKeptEntryId (entry 4)

After compaction (new entry appended):

  entry:  0     1     2     3      4     5     6      7      8     9     10
        ┌─────┬─────┬─────┬──────┬─────┬─────┬──────┬──────┬─────┬─────┬─────┐
        │ hdr │ usr │ ass │ tool │ usr │ ass │ tool │ tool │ ass │ tool│ cmp │
        └─────┴─────┴─────┴──────┴─────┴─────┴──────┴──────┴─────┴─────┴─────┘
               └──────────┬──────┘ └──────────────────────┬───────────────────┘
                 not sent to LLM                    sent to LLM
                                                         ↑
                                              starts from firstKeptEntryId

What the LLM sees:

  ┌────────┬─────────┬─────┬─────┬──────┬──────┬─────┬──────┐
  │ system │ summary │ usr │ ass │ tool │ tool │ ass │ tool │
  └────────┴─────────┴─────┴─────┴──────┴──────┴─────┴──────┘
       ↑         ↑      └─────────────────┬────────────────┘
    prompt   from cmp          messages from firstKeptEntryId
```

在反复压缩时，被摘要的范围从上一次压缩的保留边界（`firstKeptEntryId`）开始，而不是从压缩条目本身开始；如果在路径中找不到该保留条目，则回退到上一次压缩条目之后的条目。不保留任何内容的压缩（retain-none）会把自身的 ID 记录为 `firstKeptEntryId`；再次压缩从该条目之后开始。这样，在前一次压缩中幸存的消息也会被纳入下一次摘要，从而得以保留。Pi 还会在写入新的 `CompactionEntry` 之前，从重建后的、经过上下文编辑的会话投影中重新计算 `tokensBefore`，因此该 token 数反映的是被替换的实际压缩前上下文。被省略的原始条目仍会存储，但不影响切点选择、摘要、检查点或 token 估算。

### 溢出与长度恢复的顺序

恢复过程保持既有的生命周期与队列顺序。已完成的尝试对 `turn_end` 和 `agent_end` 仍然可见；运行后的恢复随后修复已持久化的模型上下文，然后才开始全新的重试：

```text
persist final assistant response
→ extension/public turn_end
→ extension/public agent_end
→ append context_edit omissions for the selected attempt
→ for overflow/length: run session_before_compact and append compaction on success
→ start the retry as a fresh run
```

如果恢复压缩失败或被取消，Pi 会保留省略编辑，不追加压缩条目，也不安排内部重试。既有排队工作仍受常规引导与追问规则约束。`agent_before_settle` 看到的是恢复处理之后修复过的投影。原始会话历史、导出、计费总额以及历史搜索扩展仍可检查被省略的尝试。

### 拆分的用户消息区间

一个用户消息区间（user-message span）从一条用户消息开始，包含直到下一条用户消息之前的所有轮次。通常情况下，压缩在用户消息边界处切分。

当某个用户消息区间超过 `keepRecentTokens` 时，切点会落在该区间内部的一条助手消息上。这就是拆分的用户消息区间：

```
Split user-message span (one span exceeds budget):

  entry:  0     1     2      3     4      5      6     7      8
        ┌─────┬─────┬─────┬──────┬─────┬──────┬──────┬─────┬──────┐
        │ hdr │ usr │ ass │ tool │ ass │ tool │ tool │ ass │ tool │
        └─────┴─────┴─────┴──────┴─────┴──────┴──────┴─────┴──────┘
                ↑                                     ↑
         turnStartIndex = 1                  firstKeptEntryId = 7
                │                                     │
                └──── turnPrefixMessages (1-6) ───────┘
                                                      └── kept (7-8)

  isSplitTurn = true
  messagesToSummarize = []  (no earlier user-message spans)
  turnPrefixMessages = [usr, ass, tool, ass, tool, tool]
```

对于拆分的用户消息区间，Pi 会生成两个摘要并合并：
1. **历史摘要**：之前的上下文（如有）
2. **用户消息区间前缀摘要**：拆分的用户消息区间的早期部分

### 切点规则

有效的切点包括：
- 用户消息
- 助手消息
- BashExecution 消息
- 自定义消息（custom_message、branch_summary）

绝不在工具结果处切分（它们必须与其工具调用留在一起）。

只有当后缀中包含一条被省略的助手尝试、且不含任何未被省略的产生上下文的条目时，准备阶段才会把保留边界推进到上下文不可见的后缀中。恢复阶段的 `context_edit` 省略满足这一规则；本质上上下文不可见的元数据可以与它们共存。仅有元数据、或新追加的自定义消息都不会移动切点。若某条替换编辑影响了候选输入或被摘要的前缀，也会阻止边界推进，因为被省略的助手回答的是编辑前的输入；而对最终被省略的后缀条目做替换则仍然安全。这样，超出预算的恢复输入可以被摘要，同时保留那些让被放弃尝试维持省略状态的编辑，而且簿记操作不会改变新模型输入是否原样保留这一事实。

### CompactionEntry 结构

定义于 [`session-manager.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/session-manager.ts)：

```typescript
interface CompactionEntry<T = unknown> {
  type: "compaction";
  id: string;
  parentId: string | null;
  timestamp: string;
  summary: string;
  firstKeptEntryId: string;
  tokensBefore: number;
  usage?: Usage;       // LLM usage that generated the summary
  fromHook?: boolean;  // true if provided by extension (legacy field name)
  details?: T;         // implementation-specific data
}

// Default compaction uses this for details (from compaction.ts):
interface CompactionDetails {
  readFiles: string[];
  modifiedFiles: string[];
}
```

扩展可以在 `details` 中存储任何可 JSON 序列化的数据。默认压缩追踪文件操作，而自定义的扩展实现可以使用自己的结构。生成的及扩展提供的摘要在可用时会存储其 LLM `usage`，因此会话总计会包含摘要工作的开销。

实现请参阅 [`prepareCompaction()`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/compaction.ts) 和 [`compact()`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/compaction.ts)。如需直接以编程方式进行摘要，`generateSummary()` 返回摘要文本，`generateSummaryWithUsage()` 返回 `{ text, usage }`。

## 分支摘要

### 触发时机

当你使用 `/tree` 导航到另一个分支时，Pi 会主动询问是否摘要你正在离开的工作。这会把来自被离开分支的上下文注入新分支。

### 工作方式

1. **寻找共同祖先**：新旧位置共享的最深节点
2. **收集条目**：从旧叶子回溯到共同祖先
3. **按预算准备**：在 token 预算内纳入消息（从最新开始）
4. **生成摘要**：以结构化格式调用 LLM
5. **追加条目**：在导航点保存 `BranchSummaryEntry`

```
Tree before navigation:

         ┌─ B ─ C ─ D (old leaf, being abandoned)
    A ───┤
         └─ E ─ F (target)

Common ancestor: A
Entries to summarize: B, C, D

After navigation with summary:

         ┌─ B ─ C ─ D
    A ───┤
         └─ E ─ F ─ [summary of B,C,D] (new leaf)
```

### 累积式文件追踪

默认压缩和分支摘要以累积方式追踪文件。两者都会从被摘要消息中的工具调用里提取文件操作。压缩还会携带上一次 Pi 生成的压缩中的文件列表。分支摘要则会在其摘要的条目中携带 Pi 生成的分支摘要里的文件列表。

因此，文件追踪会在多次默认压缩和嵌套的默认分支摘要之间累积。对于 `fromHook` 字段为 `true` 的扩展生成摘要，Pi 不会自动携带其文件列表；扩展自行管理自己的 `details` 格式。

### BranchSummaryEntry 结构

定义于 [`session-manager.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/session-manager.ts)：

```typescript
interface BranchSummaryEntry<T = unknown> {
  type: "branch_summary";
  id: string;
  parentId: string | null;
  timestamp: string;
  summary: string;
  fromId: string;      // Entry we navigated from
  usage?: Usage;       // LLM usage that generated the summary
  fromHook?: boolean;  // true if provided by extension (legacy field name)
  details?: T;         // implementation-specific data
}

// Default branch summarization uses this for details (from branch-summarization.ts):
interface BranchSummaryDetails {
  readFiles: string[];
  modifiedFiles: string[];
}
```

与压缩一样，扩展可以在 `details` 中存储自定义数据。

实现请参阅 [`collectEntriesForBranchSummary()`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/branch-summarization.ts)、[`prepareBranchEntries()`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/branch-summarization.ts) 和 [`generateBranchSummary()`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/branch-summarization.ts)。

## 摘要格式

两种格式都包含目标（Goal）、约束与偏好（Constraints & Preferences）、进度（Progress）、关键决策（Key Decisions）和后续步骤（Next Steps）。压缩摘要还包含关键上下文（Critical Context）。分支摘要到后续步骤为止。Pi 会在相关时向任一格式追加文件列表。

压缩摘要使用以下格式：

```markdown
## Goal
[What the user is trying to accomplish]

## Constraints & Preferences
- [Requirements mentioned by user]

## Progress
### Done
- [x] [Completed tasks]

### In Progress
- [ ] [Current work]

### Blocked
- [Issues, if any]

## Key Decisions
- **[Decision]**: [Rationale]

## Next Steps
1. [What should happen next]

## Critical Context
- [Data needed to continue]

<read-files>
path/to/file1.ts
path/to/file2.ts
</read-files>

<modified-files>
path/to/changed.ts
</modified-files>
```

### 消息序列化

摘要之前，消息会通过 [`serializeConversation()`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/utils.ts) 序列化为文本：

```
[User]: What they said
[Assistant thinking]: Internal reasoning
[Assistant]: Response text
[Assistant tool calls]: read(path="foo.ts"); edit(path="bar.ts", ...)
[Tool result]: Output from tool
```

这可以防止模型把它当作一段要继续的对话。

序列化时，工具结果会被截断到 2000 字符。超出该限制的内容会被替换为一个标记，指明被截断的字符数。这样可以把摘要请求控制在合理的 token 预算内，因为工具结果（尤其是来自 `read` 和 `bash` 的结果）通常是上下文体积的最大贡献者。

## 通过扩展自定义摘要

扩展可以拦截并自定义压缩和分支摘要。事件类型定义见 [`extensions/types.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/types.ts)。

### session_before_compact

在自动压缩或 `/compact` 之前触发。可以取消或提供自定义摘要。参见类型文件中的 `SessionBeforeCompactEvent` 和 `CompactionPreparation`。

```typescript
pi.on("session_before_compact", async (event, ctx) => {
  const { preparation, branchEntries, customInstructions, reason, willRetry, signal } = event;

  // preparation.messagesToSummarize - messages to summarize
  // preparation.turnPrefixMessages - user-message-span prefix (if isSplitTurn)
  // preparation.previousSummary - previous compaction summary
  // preparation.fileOps - extracted file operations
  // preparation.tokensBefore - context tokens before compaction
  // preparation.firstKeptEntryId - where kept messages start
  // preparation.settings - effective settings after applying model overrides

  // branchEntries - all entries on current branch (for custom state)
  // reason - "manual" (/compact), "threshold", or "overflow"
  // willRetry - whether the aborted turn is retried after compaction (overflow recovery)
  // signal - AbortSignal (pass to LLM calls)

  // Cancel:
  return { cancel: true };

  // Custom summary:
  return {
    compaction: {
      summary: "Your summary...",
      firstKeptEntryId: preparation.firstKeptEntryId,
      tokensBefore: preparation.tokensBefore,
      // usage: summaryResponse.usage, // Optional; included in session totals
      details: { /* custom data */ },
    }
  };
});
```

#### 将消息转换为文本

若要用你自己的模型生成摘要，可使用 `serializeConversation` 将消息转换为文本：

```typescript
import { convertToLlm, serializeConversation } from "@earendil-works/pi-coding-agent";

pi.on("session_before_compact", async (event, ctx) => {
  const { preparation } = event;
  
  // Convert AgentMessage[] to Message[], then serialize to text
  const conversationText = serializeConversation(
    convertToLlm(preparation.messagesToSummarize)
  );
  // Returns:
  // [User]: message text
  // [Assistant thinking]: thinking content
  // [Assistant]: response text
  // [Assistant tool calls]: read(path="..."); bash(command="...")
  // [Tool result]: output text

  // Now send to your model for summarization
  const { summary, usage } = await myModel.summarize(conversationText);
  
  return {
    compaction: {
      summary,
      firstKeptEntryId: preparation.firstKeptEntryId,
      tokensBefore: preparation.tokensBefore,
      usage,
    }
  };
});
```

使用不同模型的完整示例见 [custom-compaction.ts](../examples/extensions/custom-compaction.ts)。

### session_compact_failed

在手动或自动压缩失败或中止时触发。对于需要把 `session_before_compact` 尝试与最终结果配对的遥测扩展很有用。

```typescript
pi.on("session_compact_failed", async (event, ctx) => {
  const { reason, errorMessage, aborted, willRetry, fromExtension } = event;
  // reason - "manual" (/compact), "threshold", or "overflow"
  // errorMessage - present for non-abort failures
  // aborted - true for canceled/aborted compactions
  // willRetry - whether the aborted turn would have retried after compaction
  // fromExtension - whether extension-provided compaction content was being used
});
```

### session_before_tree

在 `/tree` 导航之前触发。无论用户是否选择摘要都会触发。可以取消导航或提供自定义摘要。

```typescript
pi.on("session_before_tree", async (event, ctx) => {
  const { preparation, signal } = event;

  // preparation.targetId - where we're navigating to
  // preparation.oldLeafId - current position (being abandoned)
  // preparation.commonAncestorId - shared ancestor
  // preparation.entriesToSummarize - entries that would be summarized
  // preparation.userWantsSummary - whether user chose to summarize

  // Cancel navigation entirely:
  return { cancel: true };

  // Provide custom summary (only used if userWantsSummary is true):
  if (preparation.userWantsSummary) {
    return {
      summary: {
        summary: "Your summary...",
        // usage: summaryResponse.usage, // Optional; included in session totals
        details: { /* custom data */ },
      }
    };
  }
});
```

参见类型文件中的 `SessionBeforeTreeEvent` 和 `TreePreparation`。

## 设置

在 `~/.pi/agent/settings.json` 或 `<project-dir>/.pi/settings.json` 中配置压缩：

```json
{
  "compaction": {
    "enabled": true,
    "reserveTokens": 16384,
    "keepRecentTokens": 20000
  }
}
```

| 设置项 | 默认值 | 说明 |
|---------|---------|-------------|
| `enabled` | `true` | 启用自动压缩 |
| `reserveTokens` | `16384` | 为 LLM 响应预留的 token 数 |
| `keepRecentTokens` | `20000` | 保留（不摘要）的近期 token 数 |

设置 `"enabled": false` 即可禁用自动压缩。你仍然可以用 `/compact` 手动压缩。

### 按模型覆盖

使用 `compaction.modelOverrides` 为不同模型调整 token 预算：

```json
{
  "compaction": {
    "reserveTokens": 16384,
    "keepRecentTokens": 20000,
    "modelOverrides": {
      "some-provider/big-model": {
        "reserveTokens": 400000
      }
    }
  }
}
```

对于具有 1M 上下文窗口的模型，这一覆盖会在超过 600K token 时触发压缩，并保留常规的 20000 近期 token。其他模型仍使用常规的 16384 token 预留。`reserveTokens` 还会影响摘要输出上限（以模型的最大输出 token 为上限）；它不仅仅是触发阈值。

键是精确且区分大小写的 `provider/modelId` 值，包括模型 ID 中的任何斜杠。`reserveTokens` 和 `keepRecentTokens` 各自独立回退：从模型覆盖到常规设置，再到内置默认值。取值必须是非负安全整数。匹配的模型覆盖中若存在无效值，读取时会报错；只有被省略的字段才回退到常规设置。模型覆盖条目必须是对象。常规 token 设置无效时，读取即报错，即使活动模型有有效的覆盖也一样。只有被省略的常规值才使用内置默认值。`enabled` 始终是全局的，不区分模型。

这些解析后的值用于手动压缩、所有自动阈值检查、溢出恢复以及扩展可见的 `preparation.settings`。切换模型会影响后续的检查和压缩，但不改变常规设置。已在进行中的压缩使用该操作开始时捕获的模型与设置。分支摘要设置不受影响。

覆盖在全局设置和项目设置中都生效。文件在查找前会递归合并，因此全局的模型专属值优先于项目级的回退值；项目必须覆盖那个模型条目才能改变它。详情见[设置](settings.md#per-model-compaction-overrides)。
