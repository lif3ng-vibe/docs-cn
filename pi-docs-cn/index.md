# Pi

Pi 是一个可扩展的 AI 智能体（agent），运行在你的终端中。给它一个目标和一个工作目录（working folder），它就能检查文件、运行命令、编辑内容，并完成多步任务。

你可以用 Pi 做软件开发、研究笔记、写作项目、数据文件或业余爱好。你可以按原样使用 Pi，通过提示词让它适应你的工作流，或者使用 SDK 构建由 Pi 驱动的其他应用。

## 开始使用 Pi

刚接触 Pi？按照[快速入门](quickstart.md)安装 Pi、连接模型，并完成你的第一个任务。

如果已经安装了 Pi，可以选择你想做的事：

- [以交互模式使用 Pi](usage.md)，添加文件、运行命令、推进进行中的工作并导出结果。
- [选择模型](models.md)，或连接订阅（subscription）、API 密钥、本地模型（local model）或兼容端点。
- [继续或分支会话](sessions.md)，恢复工作或尝试另一种思路而不丢失历史。
- [配置 Pi](configuration.md)，设置你的偏好、工作目录、指令（instruction）和可复用资源。
- [了解 Pi 的工作原理](how-pi-works.md)，包括工具、上下文（context）、会话与智能体循环（agent loop）。

## 定制 Pi

Pi 可以复用提示词、加载专项指令、添加可执行的集成、更换终端界面、连接模型服务，并将这些资源作为包（package）分发。
使用[快速入门的定制方式选择器](quickstart.md#choose-how-to-customize-pi)选出能满足需求的最小机制。

## 自动化或嵌入 Pi

- 使用[打印模式](cli.md#invocation-and-output)处理一次性任务和脚本化任务。
- 使用 [JSON 事件流模式](json.md)消费单次运行产生的结构化事件。
- 使用 [RPC 模式](rpc.md)控制一个独立的 Pi 进程。
- 使用 [TypeScript SDK](sdk.md) 在应用内运行 Pi。

## 查找参考与设置信息

使用参考页查阅 [CLI 选项](cli.md)、[设置](settings.md)、[提供商](providers.md)、[按键绑定](keybindings.md)和[环境变量](environment-variables.md)。

如需平台专属帮助，参见[终端设置](terminal-setup.md)、[Windows](windows.md)、[tmux](tmux.md)、[Android 上的 Termux](termux.md)或[容器化](containerization.md)。

## 安全使用

Pi 的工具和扩展（extension）以 Pi 进程的权限运行。项目信任机制控制 Pi 加载哪些项目资源，但不会对工具调用（tool call）做沙箱隔离。在使用不受信任的文件、仓库、扩展或无人值守的自动化之前，请先阅读[安全](security.md)。
