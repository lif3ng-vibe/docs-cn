---
title: "RPC 命令"
---

本参考列出 [RPC 模式](rpc)下可在 stdin 上接受的命令。每条命令和响应都是一个 JSON 对象。各命令共享的消息取值沿用[消息类型](message-types)。

## 发送提示词

### prompt

向智能体（agent）发送用户提示词。命令响应在提示词被接受、入队或处理之后发出。接受之后，事件仍会异步持续流出。

```json
{"id": "req-1", "type": "prompt", "message": "Hello, world!"}
```

带图片：
```json
{"type": "prompt", "message": "What's in this image?", "images": [{"type": "image", "data": "base64-encoded-data", "mimeType": "image/png"}]}
```

**流式输出期间**：如果智能体已在流式输出中，必须指定 `streamingBehavior` 才能将消息入队：

```json
{"type": "prompt", "message": "New instruction", "streamingBehavior": "steer"}
```

- `"steer"`：在智能体运行期间将消息入队。它会在当前助手回合执行完其工具调用之后、下一次 LLM 调用之前送达。
- `"followUp"`：等待智能体完成。消息只在智能体停止时才送达。

如果智能体正在流式输出且未指定 `streamingBehavior`，命令会返回错误。

**扩展命令**（extension command）：如果消息是一条扩展命令（例如 `/mycommand`），即使在流式输出期间也会立即执行。扩展命令通过 `pi.sendMessage()` 自行管理其 LLM 交互。

**输入展开**：技能（skill）命令（`/skill:name`）和提示词模板（prompt template，`/template`）会在发送/入队之前先展开。

响应：
```json
{"id": "req-1", "type": "response", "command": "prompt", "success": true, "data": {"disposition": "started"}}
```

`data.disposition` 取 `"handled"` 表示扩展命令或输入处理器已消费该提示词；取 `"queued"` 表示 Pi 在一次运行期间将其入队；取 `"started"` 表示 Pi 已接受它并启动一次运行。这描述的是所提交的提示词本身，不包括扩展自行启动的独立工作，也不是对完成的保证。

`success: true` 表示提示词已被立即接受、入队或处理。`success: false` 表示提示词在接受之前被拒绝。接受之后的失败会通过正常的事件与消息流报告，而不是针对同一请求 id 再发一条 `response`。

`images` 字段可选。每张图片使用 `ImageContent` 格式：`{"type": "image", "data": "base64-encoded-data", "mimeType": "image/png"}`。

### steer

在智能体运行期间将引导（steer）消息入队。它会在当前助手回合执行完其工具调用之后、下一次 LLM 调用之前送达。技能命令和提示词模板会展开；不允许扩展命令（请改用 `prompt`）。

```json
{"type": "steer", "message": "Stop and do this instead"}
```

带图片：
```json
{"type": "steer", "message": "Look at this instead", "images": [{"type": "image", "data": "base64-encoded-data", "mimeType": "image/png"}]}
```

`images` 字段可选。每张图片使用 `ImageContent` 格式（与 `prompt` 相同）。

响应：
```json
{"type": "response", "command": "steer", "success": true, "data": {"disposition": "queued"}}
```

`data.disposition` 取 `"handled"` 表示某个输入处理器已消费这条引导消息；取 `"queued"` 表示 Pi 将其入队（包括处理器改写之后再入队的情况）。它不保证这条消息最终仍留在队列中。

引导消息的处理方式可通过 [set_steering_mode](#set_steering_mode) 控制。

### follow_up

将追问（follow-up）消息入队，待智能体完成后处理。只在智能体不再有工具调用或引导消息时才送达。技能命令和提示词模板会展开；不允许扩展命令（请改用 `prompt`）。

```json
{"type": "follow_up", "message": "After you're done, also do this"}
```

带图片：
```json
{"type": "follow_up", "message": "Also check this image", "images": [{"type": "image", "data": "base64-encoded-data", "mimeType": "image/png"}]}
```

`images` 字段可选。每张图片使用 `ImageContent` 格式（与 `prompt` 相同）。

响应：
```json
{"type": "response", "command": "follow_up", "success": true, "data": {"disposition": "queued"}}
```

`data.disposition` 的 `"handled"` 或 `"queued"` 含义与 `steer` 相同，只是作用于这条追问消息。

追问消息的处理方式可通过 [set_follow_up_mode](#set_follow_up_mode) 控制。

### abort

中止当前操作，并等待会话（session）变为空闲后再响应。

```json
{"type": "abort"}
```

响应：
```json
{"type": "response", "command": "abort", "success": true}
```

### clear_queue

移除已入队的引导消息和追问消息，并返回它们的文本。

```json
{"type": "clear_queue"}
```

响应：
```json
{
  "type": "response",
  "command": "clear_queue",
  "success": true,
  "data": {
    "steering": ["Change direction"],
    "followUp": ["Summarize when finished"]
  }
}
```

要实现交互式的 Esc 行为，先发送 `clear_queue` 再发送 `abort`，然后把返回的文本恢复到客户端编辑器中。只要这些消息仍留在会话中，`abort` 之后它们会继续得到执行。

### new_session

开始一个全新会话。可被 `session_before_switch` 扩展事件处理器取消。

```json
{"type": "new_session"}
```

可附带可选的父会话追踪：
```json
{"type": "new_session", "parentSession": "/path/to/parent-session.jsonl"}
```

响应：
```json
{"type": "response", "command": "new_session", "success": true, "data": {"cancelled": false}}
```

如果被扩展取消：
```json
{"type": "response", "command": "new_session", "success": true, "data": {"cancelled": true}}
```

## 状态

### get_state

获取当前会话状态。

```json
{"type": "get_state"}
```

响应：
```json
{
  "type": "response",
  "command": "get_state",
  "success": true,
  "data": {
    "model": {...},
    "thinkingLevel": "medium",
    "isStreaming": false,
    "isCompacting": false,
    "steeringMode": "all",
    "followUpMode": "one-at-a-time",
    "sessionFile": "/path/to/session.jsonl",
    "sessionId": "abc123",
    "sessionName": "my-feature-work",
    "autoCompactionEnabled": true,
    "messageCount": 5,
    "pendingMessageCount": 0
  }
}
```

`model` 字段是完整的 [Model](#%E6%A8%A1%E5%9E%8B%E5%AF%B9%E8%B1%A1) 对象；未选择模型时省略。`sessionName` 字段是通过 `set_session_name` 设置的显示名称；未设置时省略。

### get_messages

获取对话中的所有消息。

```json
{"type": "get_messages"}
```

响应：
```json
{
  "type": "response",
  "command": "get_messages",
  "success": true,
  "data": {"messages": [...]}
}
```

消息是 `AgentMessage` 对象（参见[消息类型](message-types)）。

## 模型

### set_model

切换到指定模型。

```json
{"type": "set_model", "provider": "anthropic", "modelId": "claude-sonnet-4-20250514"}
```

响应包含完整的 [Model](#%E6%A8%A1%E5%9E%8B%E5%AF%B9%E8%B1%A1) 对象：
```json
{
  "type": "response",
  "command": "set_model",
  "success": true,
  "data": {...}
}
```

### cycle_model

循环切换到下一个可用模型。只有一个可用模型时返回 `null` 数据。

```json
{"type": "cycle_model"}
```

响应：
```json
{
  "type": "response",
  "command": "cycle_model",
  "success": true,
  "data": {
    "model": {...},
    "thinkingLevel": "medium",
    "isScoped": false
  }
}
```

`model` 字段是完整的 [Model](#%E6%A8%A1%E5%9E%8B%E5%AF%B9%E8%B1%A1) 对象。

### get_available_models

列出所有已配置的模型。

```json
{"type": "get_available_models"}
```

响应包含完整的 [Model](#%E6%A8%A1%E5%9E%8B%E5%AF%B9%E8%B1%A1) 对象数组：
```json
{
  "type": "response",
  "command": "get_available_models",
  "success": true,
  "data": {
    "models": [...]
  }
}
```

## 思考

### set_thinking_level

为支持该功能的模型设置推理/思考级别（thinking level）。

```json
{"type": "set_thinking_level", "level": "high"}
```

级别：`"off"`、`"minimal"`、`"low"`、`"medium"`、`"high"`、`"xhigh"`、`"max"`

`"xhigh"` 和 `"max"` 仅在所选模型支持时才会提供。部分模型（包括 GPT-5.6）会同时提供两者。

响应：
```json
{"type": "response", "command": "set_thinking_level", "success": true}
```

### cycle_thinking_level

在可用的思考级别之间循环切换。模型不支持思考时返回 `null` 数据。

```json
{"type": "cycle_thinking_level"}
```

响应：
```json
{
  "type": "response",
  "command": "cycle_thinking_level",
  "success": true,
  "data": {"level": "high"}
}
```

### get_available_thinking_levels

列出当前模型支持的思考级别。不支持推理的模型返回 `["off"]`。

```json
{"type": "get_available_thinking_levels"}
```

响应：
```json
{
  "type": "response",
  "command": "get_available_thinking_levels",
  "success": true,
  "data": {
    "levels": ["off", "minimal", "low", "medium", "high"]
  }
}
```

## 队列模式

### set_steering_mode

控制引导消息（来自 `steer`）的送达方式。

```json
{"type": "set_steering_mode", "mode": "one-at-a-time"}
```

模式：
- `"all"`：在当前助手回合执行完其工具调用后，送达所有引导消息
- `"one-at-a-time"`：每完成一个助手回合送达一条引导消息（默认）

响应：
```json
{"type": "response", "command": "set_steering_mode", "success": true}
```

### set_follow_up_mode

控制追问消息（来自 `follow_up`）的送达方式。

```json
{"type": "set_follow_up_mode", "mode": "one-at-a-time"}
```

模式：
- `"all"`：智能体完成后送达所有追问消息
- `"one-at-a-time"`：智能体每完成一次送达一条追问消息（默认）

响应：
```json
{"type": "response", "command": "set_follow_up_mode", "success": true}
```

## 压缩

### compact

手动压缩（compact）对话上下文，以减少 token 用量。

```json
{"type": "compact"}
```

可附带自定义指令：
```json
{"type": "compact", "customInstructions": "Focus on code changes"}
```

响应：
```json
{
  "type": "response",
  "command": "compact",
  "success": true,
  "data": {
    "summary": "Summary of conversation...",
    "firstKeptEntryId": "abc123",
    "tokensBefore": 150000,
    "estimatedTokensAfter": 32000,
    "usage": {
      "input": 32000,
      "output": 1200,
      "cacheRead": 0,
      "cacheWrite": 0,
      "totalTokens": 33200,
      "cost": {"input": 0.01, "output": 0.02, "cacheRead": 0, "cacheWrite": 0, "total": 0.03}
    },
    "details": {}
  }
}
```

`estimatedTokensAfter` 是压缩完成后立即对重建后的消息上下文做出的启发式估算，并非提供商的精确 token 计数。`usage` 报告生成摘要的那一次或多次 LLM 调用，自定义压缩处理器可以将其省略。

### set_auto_compaction

启用或禁用上下文接近占满时的自动压缩（auto-compaction）。

```json
{"type": "set_auto_compaction", "enabled": true}
```

响应：
```json
{"type": "response", "command": "set_auto_compaction", "success": true}
```

## 重试

### set_auto_retry

启用或禁用对瞬时错误（过载、速率限制、5xx）的自动重试（retry）。

```json
{"type": "set_auto_retry", "enabled": true}
```

响应：
```json
{"type": "response", "command": "set_auto_retry", "success": true}
```

### abort_retry

中止进行中的重试（取消延迟并停止重试）。

```json
{"type": "abort_retry"}
```

响应：
```json
{"type": "response", "command": "abort_retry", "success": true}
```

## Bash

### bash

执行一条 shell 命令，并把输出加入对话上下文。命令运行期间，输出以 `bash_execution_update` 事件流式送达；响应包含最终结果。

```json
{"id": "req-1", "type": "bash", "command": "ls -la"}
```

当命令输出应存入会话、但在下一次提示词时从模型上下文中省略时，把 `excludeFromContext` 设为 `true`。

附带一个 `id`，即可把流式送达的 `bash_execution_update` 事件与这条命令关联起来。

响应：
```json
{
  "id": "req-1",
  "type": "response",
  "command": "bash",
  "success": true,
  "data": {
    "output": "total 48\ndrwxr-xr-x ...",
    "exitCode": 0,
    "cancelled": false,
    "truncated": false
  }
}
```

如果输出被截断，则包含 `fullOutputPath`：
```json
{
  "type": "response",
  "command": "bash",
  "success": true,
  "data": {
    "output": "truncated output...",
    "exitCode": 0,
    "cancelled": false,
    "truncated": true,
    "fullOutputPath": "/tmp/pi-bash-abc123.log"
  }
}
```

**bash 结果如何到达 LLM**：

`bash` 命令立即执行并返回一个 `BashResult`。在内部，会创建一个 `BashExecutionMessage` 并存入智能体的消息状态。

当下一条 `prompt` 命令发出时，Pi 会先转换上下文消息再发给模型。除非 `excludeFromContext` 为 true，否则 `BashExecutionMessage` 会变成如下格式的 `UserMessage`：

````
Ran `ls -la`
```
total 48
drwxr-xr-x ...
```
````

这意味着：
1. 已包含的 bash 输出要在**下一次提示词**时才到达模型，而不是立即。
2. 一次提示词之前可以运行多条 bash 命令；Pi 会纳入每一份未设置 `excludeFromContext` 的输出。

### abort_bash

中止正在运行的 bash 命令。

```json
{"type": "abort_bash"}
```

响应：
```json
{"type": "response", "command": "abort_bash", "success": true}
```

## 会话

### get_session_stats

获取 token 用量、费用统计以及当前上下文窗口（context window）的使用情况。

```json
{"type": "get_session_stats"}
```

响应：
```json
{
  "type": "response",
  "command": "get_session_stats",
  "success": true,
  "data": {
    "sessionFile": "/path/to/session.jsonl",
    "sessionId": "abc123",
    "userMessages": 5,
    "assistantMessages": 5,
    "toolCalls": 12,
    "toolResults": 12,
    "totalMessages": 22,
    "tokens": {
      "input": 50000,
      "output": 10000,
      "cacheRead": 40000,
      "cacheWrite": 5000,
      "total": 105000
    },
    "cost": 0.45,
    "contextUsage": {
      "tokens": 60000,
      "contextWindow": 200000,
      "percent": 30
    }
  }
}
```

`tokens` 和 `cost` 涵盖整个会话内的助手消息、工具上报的用量，以及压缩/分支摘要（branch summary）的生成。`contextUsage` 包含用于压缩和页脚显示的当前上下文窗口实际估算值。

没有可用模型或上下文窗口时省略 `contextUsage`。压缩完成后，`contextUsage.tokens` 和 `contextUsage.percent` 会立即变为 `null`，直到压缩后的新一次助手响应提供有效的用量数据。

### export_html

把会话导出为 HTML 文件。

```json
{"type": "export_html"}
```

可指定自定义路径：
```json
{"type": "export_html", "outputPath": "/tmp/session.html"}
```

响应：
```json
{
  "type": "response",
  "command": "export_html",
  "success": true,
  "data": {"path": "/tmp/session.html"}
}
```

### switch_session

加载另一个会话文件。可被 `session_before_switch` 扩展事件处理器取消。

```json
{"type": "switch_session", "sessionPath": "/path/to/session.jsonl"}
```

响应：
```json
{"type": "response", "command": "switch_session", "success": true, "data": {"cancelled": false}}
```

如果扩展取消了切换：
```json
{"type": "response", "command": "switch_session", "success": true, "data": {"cancelled": true}}
```

### fork

从当前分支上较早的一条用户消息创建新分叉（fork）。可被 `session_before_fork` 扩展事件处理器取消。返回作为分叉起点的消息文本。

```json
{"type": "fork", "entryId": "abc123"}
```

响应：
```json
{
  "type": "response",
  "command": "fork",
  "success": true,
  "data": {"text": "The original prompt text...", "cancelled": false}
}
```

如果扩展取消了分叉：
```json
{
  "type": "response",
  "command": "fork",
  "success": true,
  "data": {"cancelled": true}
}
```

### clone

把当前活动分支从当前位置复制为一个新会话。可被 `session_before_fork` 扩展事件处理器取消。

```json
{"type": "clone"}
```

响应：
```json
{
  "type": "response",
  "command": "clone",
  "success": true,
  "data": {"cancelled": false}
}
```

如果扩展取消了克隆：
```json
{
  "type": "response",
  "command": "clone",
  "success": true,
  "data": {"cancelled": true}
}
```

### get_fork_messages

获取可用于分叉的用户消息。

```json
{"type": "get_fork_messages"}
```

响应：
```json
{
  "type": "response",
  "command": "get_fork_messages",
  "success": true,
  "data": {
    "messages": [
      {"entryId": "abc123", "text": "First prompt..."},
      {"entryId": "def456", "text": "Second prompt..."}
    ]
  }
}
```

### get_entries

按追加顺序获取所有会话条目（不包括会话头）。会话是一棵只追加、条目 id 稳定的条目树，因此条目 id 可以当作持久游标使用：把上次见到的最后一个条目 id 作为 `since` 传入，即可只获取严格晚于它的条目，即使客户端重启后依然有效。与 `get_messages` 不同，这里还包括压缩前的历史和被废弃的分支。

```json
{"type": "get_entries"}
```

使用游标时：
```json
{"type": "get_entries", "since": "abc123"}
```

响应：
```json
{
  "type": "response",
  "command": "get_entries",
  "success": true,
  "data": {
    "entries": [
      {"type": "message", "id": "def456", "parentId": "abc123", "timestamp": "...", "message": {"role": "user", "...": "..."}}
    ],
    "leafId": "def456"
  }
}
```

`leafId` 是当前叶子条目的 id（空会话为 `null`），客户端据此可在一次往返中判断活动分支是否移动过。如果 `since` 与任何条目 id 都不匹配，响应为 `success: false`。

### get_tree

以条目树的形式获取会话。每个节点为 `{entry, children, label?, labelTimestamp?}`。结果是一个数组，因为导航 API 可能创建多个根；父链断裂的孤儿条目也会作为根出现。

```json
{"type": "get_tree"}
```

响应：
```json
{
  "type": "response",
  "command": "get_tree",
  "success": true,
  "data": {
    "tree": [
      {
        "entry": {"type": "message", "id": "abc123", "parentId": null, "...": "..."},
        "children": [
          {"entry": {"type": "message", "id": "def456", "parentId": "abc123", "...": "..."}, "children": []}
        ]
      }
    ],
    "leafId": "def456"
  }
}
```

### get_last_assistant_text

获取最后一条助手消息的文本内容。

```json
{"type": "get_last_assistant_text"}
```

响应：
```json
{
  "type": "response",
  "command": "get_last_assistant_text",
  "success": true,
  "data": {"text": "The assistant's response..."}
}
```

不存在助手文本时，`text` 为 `null`。

### set_session_name

为当前会话设置显示名称。该名称会出现在会话列表中，便于识别各个会话。

```json
{"type": "set_session_name", "name": "my-feature-work"}
```

响应：
```json
{
  "type": "response",
  "command": "set_session_name",
  "success": true
}
```

当前会话名称可通过 `get_state` 的 `sessionName` 字段获取。要在启动 RPC 模式时设置初始名称，给 `pi --mode rpc` 进程传入 `--name <name>` 或 `-n <name>`。

## 可发现的命令

### get_commands

获取可用命令（扩展命令、提示词模板和技能）。要通过 `prompt` 命令运行其中之一，在其名称前加 `/` 前缀即可。

```json
{"type": "get_commands"}
```

响应：
```json
{
  "type": "response",
  "command": "get_commands",
  "success": true,
  "data": {
    "commands": [
      {
        "name": "fix-tests",
        "description": "Fix failing tests",
        "source": "prompt",
        "sourceInfo": {
          "path": "/home/user/myproject/.pi/agent/prompts/fix-tests.md",
          "source": "local",
          "scope": "project",
          "origin": "top-level"
        }
      }
    ]
  }
}
```

每条命令包含：
- `name`：命令名（使用 `/name`）
- `description`：人类可读的描述（扩展命令可选）
- `source`：命令的种类：
  - `"extension"`：在扩展中通过 `pi.registerCommand()` 注册
  - `"prompt"`：从提示词模板 `.md` 文件加载
  - `"skill"`：从技能目录加载（名称带 `skill:` 前缀）
- `sourceInfo`：注册该命令的资源的元数据：
  - `path`：资源的绝对路径
  - `source`：Pi 发现它的方式，如 `"local"`、`"auto"` 或 `"cli"`
  - `scope`：`"user"`、`"project"` 或 `"temporary"`
  - `origin`：直接加载的资源为 `"top-level"`，包资源为 `"package"`
  - `baseDir`：包的基础目录（如适用）

**注意**：内置 TUI 命令（`/settings`、`/hotkeys` 等）不在其中。它们只在交互模式下处理，通过 `prompt` 发送并不会执行。

## 模型对象

模型命令返回完整的已配置模型定义。费用以美元计，按每百万 token 计价。

```json
{
  "id": "claude-sonnet-4-20250514",
  "name": "Claude Sonnet 4",
  "api": "anthropic-messages",
  "provider": "anthropic",
  "baseUrl": "https://api.anthropic.com",
  "reasoning": true,
  "input": ["text", "image"],
  "contextWindow": 200000,
  "maxTokens": 16384,
  "cost": {
    "input": 3.0,
    "output": 15.0,
    "cacheRead": 0.3,
    "cacheWrite": 3.75
  }
}
```

模型配置参见[配置兼容端点](models#%E9%85%8D%E7%BD%AE%E5%85%BC%E5%AE%B9%E7%AB%AF%E7%82%B9)。TypeScript 方面，请使用 `@earendil-works/pi-ai` 导出的 `Model` 类型。
