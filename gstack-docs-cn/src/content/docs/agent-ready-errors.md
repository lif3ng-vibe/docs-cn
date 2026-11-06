---
title: "面向 agent 的错误消息"
---


gstack 的 DX 评审（`/plan-devex-review` 第 3 轮、`/autoplan` 的 DX 阶段、`/devex-review` 第 3 步）会按最常先读到错误消息的那位读者——无人值守运行的 AI agent——给每条错误消息打分。它逐字读消息，无法追问含义，会照消息所说的去重试或放弃。本页就是这些评审所引用的契约（rubric `agent-ready-v1`）。以下文字由 `lib/dx-error-contract.ts` 生成；要改就去那里改。

| 条目 | 错误向读者给出什么 |
|------|----------------------------|
| **何事（what）** | 失败的操作，以及导致它的实际取值（输入、路径、id）。 |
| **修法（fix）** | 放在第一行或最后一行，绝不夹在链条中间：一条精确的命令、旗标或改动；当不存在安全的 agent 修复手段时，则写明必须由人来提供的确切内容（凭据、审批、决策）。精确的上报即是完整的修法。修法只有在安全且经授权时才算数：不绕过任何授权、安全或沙箱边界，不让 agent 运行从不可信输出复制来的文本，并正确引用参数。 |
| **恢复（recovery）** | 原样重试、修正后重试、先做某事再重试，或求助人工；副作用（无/部分/全部/未知）；结果未知时，重试前如何对账（状态命令、幂等键）；设重试上限，超限即上报。 |
| **错误码（code）** | 一个稳定的错误码，外加文档锚点或 `--explain` 目标。措辞可以变；错误码不行。 |
| **上下文（context）** | 版本、生效中的配置、相关的环境变量名（绝不给值）、底层的依赖报错，不得吞掉。远程服务只给对调用方安全的事实（参数、API 版本、请求 id）。 |
| **追踪（trace）** | 仅限意外失败。本地 CLI、SDK 或技能打印一段紧凑 trace，或给出存放完整 trace 的文件路径（完整版在 `--verbose`/`DEBUG` 之下）；远程服务返回 correlation id，内部细节留在自己的日志里。 |
| **脱敏（redaction）** | 任何地方都不得出现秘密值、token 或带凭据的 URL，trace 和嵌套原因也不例外。 |
| **通道（channel）** | 该界面的原生机器信号携带相同字段，且失败必须以失败的样子发出信号（绝不能 exit 0、HTTP 200 或 `isError: false`）。 |

**失败类别**。在任何工作开始之前就被拒绝的用法或校验错误，需要何事、修法、错误码、脱敏和通道；其恢复方式不言自明（修正后重试，无副作用），而上下文、对账与重试上限不适用。环境、依赖、部分完成与意外失败需要每一个适用条目。追踪仅适用于意外失败。

**界面形态**。按适用性门禁（Applicability Gate）中的产品类型区分：
- **CLI 工具**：通道是 stderr 加一个明确的非零退出码；工具提供结构化输出时还要有 `--json` 形式。
- **API/服务**：通道是 HTTP 状态码加 RFC 9457 problem-details 响应体；上下文对调用方安全；追踪是 correlation id。
- **库/SDK**：通道是一个携带错误码与字段的类型化错误类；没有退出码。
- **平台**：错误到达哪个界面，就按对应的 CLI 或 API 规则。
- **文档**：仅需何事、修法、错误码和脱敏。
- **Claude Code 技能**：通道是技能打印的结果行与错误码。MCP 工具（一个子情形）返回 `isError: true`，字段放在文本或结构化内容里。

**证据**。每条路径上的每个条目判定为通过、不通过、不适用（附原因）或未知。在计划评审中，计划为自己引入的路径从未规定的适用条目即为缺口（不通过）；未知只留给你无法检查的既有行为。在实测审计中，从未触发过的错误类别记为未知，而非外推。

**扣分项**。每个扣分项都要点名背后的路径与条目，并给出修正后的错误行。
- **4/10（严重发现，标题 `CAP4:<path>:<item> <what fails>`）**：某条路径泄漏秘密、把失败报成成功、给出不安全的修法，或者阻塞着等终端（挂起，或因缺少终端而失败，却不给出 `--yes` 之类的非交互替代）。
- **6/10（高优先级发现，标题 `CAP6:<path>:<item> <what fails>`）**：某条路径缺少适用的修法、恢复、上下文或追踪条目。

每种模式，包括 DX TRIAGE，都会上报每一条 CAP4 发现。

## 示例

校准示例（Elm、Rust、Stripe、一条带 RFC 9457 `--json` 形式的完整 CLI 错误，以及 gstack 自己的不完整示例）见 [plan-devex-review/dx-hall-of-fame.md](https://github.com/garrytan/gstack/blob/main/plan-devex-review/dx-hall-of-fame.md) 的 "## Pass 3" 一节。

## 来源

- Anthropic，"Writing effective tools for AI agents"：把错误响应提示工程成具体、可执行的纠正。
- clig.dev，"Errors"：把可操作的行放在读者目光落点；为意外错误给出调试与回溯信息。
- CLI Agent Spec（cli-agent-spec.github.io）：逐退出码的 `retryable` 与 `side_effects`。
- RFC 9457，Problem Details for HTTP APIs：`type`、`title`、`detail`、`instance` 与扩展成员。
- MCP 规范，Tools：工具执行错误以模型可读的 `isError: true` 结果返回。
- Nx，"Agentic Experience Is the New Developer Experience"；agentsurface.dev，"Designing Errors for Agent Recovery"。

## 实测审计：gstack-error-capture

`/devex-review` 通过 `bin/gstack-error-capture` 触发 CLI 错误：后者在无终端、stdin 关闭、临时 cwd 与 HOME、清洗过的环境和截止时限之下运行目标，并打印一条输出流已脱敏的 JSON 记录。`gstack-error-capture --help` 列出其旗标、记录字段与错误码。
