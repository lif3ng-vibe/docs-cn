---
title: "CLI 集成"
---

默认情况下，运行 `pi` 会打开交互式终端界面。当输入或输出被管道或重定向时，Pi 改用打印模式。脚本和应用程序也可以显式选择打印、JSON 或 RPC 模式。

四种模式使用相同的智能体、会话、资源和工具。模式决定了输入如何进入 Pi、输出如何暴露，以及进程是否继续保持可用以接收更多命令。

SDK 不是一种 CLI 模式。它把智能体直接嵌入 Node.js 或 Bun 进程。当直接访问 TypeScript 比跨越进程边界更合适时，见 [SDK](sdk.md)。

## 选择模式

| 模式 | 界面 | 存续期 | 适用场景 |
|---|---|---|---|
| 交互 | 终端 UI | 直到用户退出 | 有人直接与 Pi 交互 |
| 打印 | stdout 上的最终文本 | 单次调用 | 脚本只需要最终的助手响应 |
| JSON | stdout 上的 JSONL 事件 | 单次调用 | 进程需要一次运行的结构化进度 |
| RPC | JSONL 命令、响应和事件 | 长期运行 | 进程需要双向控制 |

与模式无关，CLI 选项仍可指定工作目录、模型、工具、资源和会话持久化。完整的启动选项见[命令行](cli.md)。

## 打印到 stdout

打印模式（print mode）运行给定的提示词，把最终的助手文本写入 stdout，然后退出：

```bash
pi --print "Summarize the changes in this repository"
```

只需要最终文本时使用打印模式，包括命令替换、管道和一次性任务。中间事件不会暴露。

打印模式把错误写入 stderr。最终助手响应的停止原因为 `error` 或 `aborted` 时，会产生非零退出状态。

未显式选择模式时，非 TTY 的 stdin 或 stdout 也会选中打印模式。这样即使不加 `--print`，管道输入输出也能工作。

## 流式输出 JSON 事件

JSON 模式先写入一条会话头，随后以换行分隔的 JSON 写出智能体与会话事件：

```bash
pi --mode json "Review this repository" > events.jsonl
```

这是结构化的事件输出，不是单个 JSON 结果，也不约束模型响应的格式。

所有提示词都在进程启动时给定。进程为该次运行流出事件然后退出；不接受后续命令。

失败或中止的助手响应会出现在事件流（event stream）中，但其本身不产生非零退出状态。关心成败时要检查事件。调用本身抛出错误时 Pi 仍以非零值退出。

流式的 `message_update` 记录包含增量（delta），而不是不断增长的完整消息快照。用增量事件拼出实时输出，再用 `message_end` 中的权威消息替换。

`agent_end` 之后仍可能有自动恢复或排队工作。`agent_settled` 标志当前运行自动工作的结束。

stdout 专用于 JSONL。诊断和应用日志写入 stderr。帧结构、事件形态和重建规则见 [JSON 事件流](json.md)。

## 用 RPC 控制 Pi

RPC 模式让 Pi 保持运行，另一个进程发送命令并接收响应和事件：

```bash
pi --mode rpc --no-session
```

命令是写入 stdin 的 JSON 对象。响应和事件是写入 stdout 的 JSON 对象。每条记录占一行。

需要关联的命令要加上 `id`。匹配的响应会重复该 ID。事件通常没有命令 ID，因为它们描述的是会话活动而非单个请求。

`prompt` 响应成功意味着提示词被接受、排队或处理，不代表运行已完成。关心完成情况时，要继续消费事件直到 `agent_settled`。

RPC 命令可以更改模型、检查状态、管理会话、运行 shell 命令，以及应答扩展 UI 请求。

扩展对话框构成一个请求—响应子协议。其他扩展 UI 更新是通知，客户端可以显示也可以忽略。仅在 TUI 下可用的扩展能力在交互模式之外不可用或降级。

Node.js 或 TypeScript 集成优先使用 `@earendil-works/pi-coding-agent` 的 `RpcClient`。它会启动 Pi RPC 子进程、关联请求、暴露带类型的命令方法，并把会话事件投递给监听器。

[RPC 客户端示例](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/rpc-client.ts)发送一个提示词、流式展示文本和工具活动、等待 `agent_settled`，然后关闭子进程。它包含在仓库的 TypeScript 检查中。

`RpcClient.promptAndWait()` 会在发送提示词之前安装事件监听器，避免与快速完成产生竞态。分开操作时，在调用 `prompt()` 之前订阅，且只在运行进行中调用 `waitForIdle()`。

该客户端需要一个可运行的 Pi CLI 路径。仓库示例指向 `dist/cli.js`，因此在检出目录中运行该示例前必须先构建包。

不用 `RpcClient` 构建客户端时，先读 [RPC 协议](rpc.md)，再用 [RPC 命令](rpc-commands.md)和 [JSON 事件流](json.md)作为线上格式参考。

## 分叉并重塑 Pi 品牌

源码分叉可以通过 `package.json` 更改 CLI 名称和配置目录：

```json
{
  "piConfig": {
    "name": "my-agent",
    "configDir": ".my-agent"
  }
}
```

修改顶层 `bin` 字段设置可执行文件名。这些设置影响 CLI 横幅、配置路径和派生的环境变量名。

## 示例与参考

- [RPC 客户端](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/rpc-client.ts)：带类型的 Node.js 集成
- [RPC 扩展 UI](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/rpc-extension-ui.ts)：带扩展对话框的自定义终端客户端
- [命令行](cli.md)：启动选项与模式选择
- [JSON 事件流](json.md)：JSON 事件参考
- [RPC 协议](rpc.md)：RPC 生命周期、帧结构、错误与关闭
- [RPC 命令](rpc-commands.md)：命令与响应参考
- [RPC 扩展 UI](rpc-extension-ui.md)：扩展交互子协议
- [SDK 示例](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/sdk/)：进程内 TypeScript 集成
