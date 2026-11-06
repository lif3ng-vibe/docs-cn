---
title: "无网页时的 QA"
---


浏览器与非浏览器软件使用同样的命令。在一个具备文档化原生命令和隔离本地夹具（fixture）的仓库里开始；指明目标以及你希望检查的行为。例如：

```text
/qa-only Test this repo's CLI using its documented local fixture. Check valid and invalid input, exit codes, stdout/stderr, and cancellation. Report only; do not change code or tests. For each finding, include the exact command, expected and actual results, and which checks remain untested. Keep requests inside the fixture; ask before contacting an external service.

/qa Test this repo's local webhook and worker fixture. Explore duplicate deliveries and recovery after a partial failure. Keep all effects inside the fixture; preserve reproduced bugs in native regression tests before repairing them.
```

QA 会先告诉你它将使用哪个测试面、哪些工具和写权限。CLI 或 API 不需要浏览器。浏览器目标保留真实浏览器测试；开发者体验（DX）审计只在上手流程、安装或人机工效属于检查范围时才加载。若原生工具或安全夹具不可用，报告会点名阻碍因素与未测试的契约，而不是编造一个通过结果或另装一套框架。

探索的意思是从每个结果中学习、挑选下一个有价值的挑战，而不是乱跑随机命令。在下一次发现式探测之前，QA 会保存一份简短的 `exploration-NNN.json` 证据笔记，记录上一个结果、正在验证的假设和下一条命令。最终报告会链接这些笔记；探测之间不需要额外的聊天消息。发现的 bug 必须可复现，其新增测试须在修复前因该 bug 失败、修复后通过。单元测试保护逻辑；集成测试与端到端测试保护 mock 会掩盖的真实边界。`/qa-only` 只提议这些测试而不代写。

常规的 `/review` 与 `/ship` 会对变更行为及邻近风险自动运行一个有界版本，包括没有计划或 web 服务器的小型 diff。既有的修复/测试审批规则仍然适用。缺失的依赖、被拒绝的操作和时间限制仍作为可见的覆盖缺口呈现；一次简短的冒烟通过绝不等于全面 QA。访问生产环境以及破坏性或外部影响需要专门授权。

有界探索使用可执行的截止时间护栏，而不是估算时钟：它拒绝迟到的探测，并在到限时停掉自己负责的前台工作。未完成的检查在报告中保持可见。必做的计划检查不计入 review/ship 的冒烟预算。命令、平台与清理限额见 [QA 截止时间](https://github.com/garrytan/gstack/blob/main/docs/reference-qa-deadlines.md)。

每次发布（ship）还会运行既有的文档审计，重复发布和已有 PR 的更新也不例外。明确的事实性修正并入最终受检变更；有风险的改写需要审批。审计失败时会停下来恢复，或显式接受点名的风险，而不是悄悄丢弃其结果。发布环节负责版本号、Git 与 PR 的发布；文档助手不会独立 commit 或 push。
