---
title: "RPC 模式"
---

RPC 模式把 Pi 作为一个长驻子进程运行，通过 stdin 与 stdout 上的 JSON 记录进行控制。适用于与语言无关的集成、进程隔离、IDE 以及自定义用户界面。

进程内的 Node.js 或 Bun 集成请优先使用 [SDK](sdk.md)。基于子进程的 TypeScript 集成请优先使用导出的 `RpcClient`，它会启动 Pi、关联响应、提供带类型的命令方法，并把事件分发给监听器。

| 接口 | 进程边界 | 控制模型 | 最适合 |
|---|---|---|---|
| [SDK](sdk.md) | 进程内 | 直接的 TypeScript 方法与事件 | 需要完整 API 访问的 Node.js 或 Bun 宿主 |
| RPC | 子进程 | JSONL 命令、响应与事件 | 其他语言、隔离进程、IDE 或自定义客户端 |

## 启动 RPC 模式

```bash
pi --mode rpc --no-session
```

常规 CLI 选项仍然用于选择工作目录、模型、工具、资源和会话行为。常见选择包括 `--provider`、`--model`、`--name`、`--no-session` 和 `--session-dir`。完整且与版本相关的接口参见[命令行](cli.md)；对已安装的版本，`pi --help` 是权威来源。

RPC 模式拒绝 `@file` 提示词参数。请改用 [`prompt`](rpc-commands.md#prompt) 命令发送提示词。

## 协议记录

协议有四个记录族：

| 方向 | 记录 | 用途 |
|---|---|---|
| stdin | Command | 让 Pi 执行提示、检查状态、更改配置或管理会话 |
| stdout | `response` | 报告一条命令是否成功并返回命令数据 |
| stdout | Session event | 流式传输运行、消息、工具、队列、压缩和重试活动 |
| Both | Extension UI record | 在 Pi 与客户端之间转发受支持的扩展交互 |

权威的记录定义参见 [RPC 命令](rpc-commands.md)、[JSON 事件流](json.md)和 [RPC 扩展 UI](rpc-extension-ui.md)。

### 关联命令与响应

每条命令都接受一个可选的字符串 `id`。匹配的响应会重复它：

```json
{"id":"req-1","type":"get_state"}
{"id":"req-1","type":"response","command":"get_state","success":true,"data":{"...":"..."}}
```

只要可能有多条命令同时在途，就应使用唯一 ID。命令处理是异步的，因此客户端应按 ID 关联，而不是按响应顺序。

会话事件通常没有命令 ID，因为它们描述的是会话活动。`bash_execution_update` 是例外：当发起的 [`bash`](rpc-commands.md#bash) 命令带有 ID 时，其输出事件会重复该 ID。

`extension_ui_response` 使用其 `extension_ui_request` 提供的 ID。它不会产生常规的命令响应。

## 分帧

RPC 使用严格的 JSONL 分帧。每条记录写入一个完整的 JSON 对象，并以 LF（`\n`）结尾。把 stdout 作为字节流或 UTF-8 流读取，只在 LF 处拆分记录。去除可选的前置回车符即可接受 CRLF 输入。

不要使用把 Unicode 行分隔符或段落分隔符当作记录边界的通用行读取器。特别是 Node.js 的 `readline` 也会在 `U+2028` 和 `U+2029` 处拆分，而它们在 JSON 字符串内是合法字符。

要持续读取 stdout。Pi 会遵循 stdout 背压，但停止读取的客户端可能使进程停滞。写入命令时要遵循 stdin 背压。stdout 专用于协议记录；诊断信息和应用日志输出到 stderr。

## 运行生命周期

`prompt` 响应成功意味着提示词被接受、排队或已处理。并不代表模型工作已完成：

```json
{"id":"req-2","type":"prompt","message":"Review this repository"}
{"id":"req-2","type":"response","command":"prompt","success":true,"data":{"disposition":"started"}}
```

`data.disposition` 报告提示词的处理结果。如果它是 `"handled"`，则该提示词没有启动任何运行，因此不要等待 `agent_settled`。所有取值参见 [RPC 命令](rpc-commands.md#prompt)。

在该响应之后要继续消费[事件](json.md)。`agent_end` 标志一次底层智能体运行的结束，但随后仍可能出现重试、溢出恢复、压缩、引导或追问工作。当客户端需要知道 Pi 不会自动继续时，等待 `agent_settled`。

在发送提示词之前先订阅，以免错过快速完成的情况。`RpcClient.promptAndWait()` 内部就是这样做的。如果使用独立的 `RpcClient` 调用，请在 `prompt()` 之前安装事件监听器，并且只在运行活跃期间调用 `waitForIdle()`。

## 错误

失败的命令会返回一条带有 `success: false` 的响应：

```json
{"id":"req-3","type":"response","command":"set_model","success":false,"error":"Model not found: invalid/model"}
```

格式错误的 JSON 会产生一条没有请求 ID 的解析响应：

```json
{"type":"response","command":"parse","success":false,"error":"Failed to parse command: Unexpected token..."}
```

成功响应只覆盖命令处理。提示词被接受之后发生的提供商失败与中止会出现在消息和事件流中。

客户端还必须处理子进程启动失败、意外退出、stderr 诊断、取消以及自身的截止时限。不要把 stderr 当作协议数据来解析。

## 关闭

关闭子进程的 stdin 即可请求有序关闭。Pi 会在退出前清理活动运行时。客户端仍应处理进程信号和意外退出。

扩展也可以通过其扩展上下文请求关闭。Pi 会在当前命令完成后、或活动运行发出 `agent_settled` 之后完成关闭。

## 最小客户端

下面的 Python 示例使用二进制管道读取器，它按 LF 拆分，不会把 Unicode 分隔符当作协议边界：

```python
import json
import subprocess

process = subprocess.Popen(
    ["pi", "--mode", "rpc", "--no-session"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
)

assert process.stdin is not None
assert process.stdout is not None

command = {"id": "prompt-1", "type": "prompt", "message": "Hello"}
process.stdin.write(json.dumps(command).encode("utf-8") + b"\n")
process.stdin.flush()

while line := process.stdout.readline():
    record = json.loads(line)
    if record.get("type") == "message_update":
        update = record["assistantMessageEvent"]
        if update["type"] == "text_delta":
            print(update["delta"], end="", flush=True)
    elif record.get("type") == "agent_settled":
        print()
        break

process.stdin.close()
process.wait()
```

对于维护良好的 TypeScript 客户端，请使用经过验证的 [RPC 客户端示例](../examples/rpc-client.ts)。它需要已构建的 Pi CLI，因为仓库示例指向 `dist/cli.js`。

## 参考

- [RPC 命令](rpc-commands.md)：所有 stdin 命令与响应
- [JSON 事件流](json.md)：共享的 stdout 会话事件与流式重建
- [RPC 扩展 UI](rpc-extension-ui.md)：对话框、通知、响应与限制
- [消息类型](message-types.md)：响应与事件使用的消息和内容块
- [会话文件格式](session-format.md)：会话命令返回的条目
- [`rpc-types.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/modes/rpc/rpc-types.ts)：导出的 TypeScript 协议定义
- [`RpcClient`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/modes/rpc/rpc-client.ts)：子进程客户端实现

## 迁移的参考锚点

本页面原有的详细参考现在已有独立页面。这些锚点用于保持既有链接有效。

<a id="prompt"></a>
<a id="steer"></a>
<a id="follow_up"></a>
<a id="abort"></a>
<a id="clear_queue"></a>
<a id="new_session"></a>
<a id="get_state"></a>
<a id="get_messages"></a>
<a id="set_model"></a>
<a id="cycle_model"></a>
<a id="get_available_models"></a>
<a id="set_thinking_level"></a>
<a id="cycle_thinking_level"></a>
<a id="get_available_thinking_levels"></a>
<a id="set_steering_mode"></a>
<a id="set_follow_up_mode"></a>
<a id="compact"></a>
<a id="set_auto_compaction"></a>
<a id="set_auto_retry"></a>
<a id="abort_retry"></a>
<a id="bash"></a>
<a id="abort_bash"></a>
<a id="get_session_stats"></a>
<a id="export_html"></a>
<a id="switch_session"></a>
<a id="fork"></a>
<a id="clone"></a>
<a id="get_fork_messages"></a>
<a id="get_entries"></a>
<a id="get_tree"></a>
<a id="get_last_assistant_text"></a>
<a id="set_session_name"></a>
<a id="get_commands"></a>

命令详情已移至 [RPC 命令](rpc-commands.md)。

<a id="message_update-streaming"></a>
<a id="bash_execution_update"></a>
<a id="compaction_start--compaction_end"></a>
<a id="summarization_retry_scheduled--summarization_retry_attempt_start--summarization_retry_finished"></a>

事件详情已移至 [JSON 事件流](json.md)。

<a id="extension-ui-protocol"></a>

扩展交互详情已移至 [RPC 扩展 UI](rpc-extension-ui.md)。
