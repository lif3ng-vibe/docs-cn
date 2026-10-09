# 快速入门

Pi 在你的终端中运行，并操作你机器上的文件。要使用它，你需要通过受支持的提供商（provider）访问一个模型（model）。可以是订阅、API 密钥或本地模型。

Windows 原生安装请阅读 [Windows 安装指南](windows.md)。Android 请阅读 [Termux 安装指南](termux.md)。

## 1. 安装 Pi

在 macOS 或 Linux 上，可以使用安装脚本：

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

安装脚本会锁定全部依赖，并可通过 `pi update` 更新 Pi。另一种方式是从 npm 安装 Pi，但这种方式不会锁定间接依赖。它要求 Node.js 22.19 或更高版本：

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```

在常规 npm 安装中，Pi 不需要运行依赖项的生命周期脚本。

在 macOS 或 Linux 上使用 Nix 时，可从 Pi 的 flake 安装最新发布版。Nix 会从源码构建 Pi：

```bash
nix profile add github:earendil-works/pi/stable
```

旧版 Nix 改用 `nix profile install`。更新请用 `nix profile upgrade pi`；`pi update` 无法更新 Nix 安装。要固定某个发布版，可使用诸如 `github:earendil-works/pi/v1.0.0` 的标签。

验证安装：

```bash
pi --version
```

## 2. 启动 Pi

切换到你想让 Pi 处理的目录，然后启动它：

```bash
cd /path/to/folder
pi
```

工作目录（working folder）帮助 Pi 发现相关文件、指令和配置。Pi 也用它来分组保存的会话。

<p align="center"><img src="images/interactive-mode.png" alt="在终端中运行的 Pi，包含对话、输入编辑器和状态页脚" width="750" /></p>

界面会显示你的对话、一个用于输入提示词和命令的编辑器，以及一个显示当前目录、模型和会话状态的页脚。参见[在终端中使用 Pi](usage.md)，了解如何添加文件、运行命令、推进进行中的工作并管理结果。

## 3. 选择模型

**模型**生成 Pi 的回复。**提供商**是 Pi 用来访问该模型的服务或账户。

在 Pi 中运行：

```text
/login
```

选择一个提供商，然后按提示使用订阅或保存 API 密钥。之后如果想选择另一个可用模型，可运行 `/model`。

受支持的提供商、环境变量认证、本地模型和自定义端点，参见[选择模型与提供商](models.md)。

## 4. 给 Pi 一个任务

Pi 会展示它执行的每一次文件读取、搜索、命令和编辑。它不会在每次工具调用（tool call）前都请求确认。

输入一个符合你工作的任务，例如：

```text
Summarize @meeting-notes.md and save the action items to action-items.md.
```

```text
Explain how this repository is structured and how to run its checks.
```

```text
Compare @previous.csv with @current.csv and summarize the important changes.
```

在编辑器中输入 `@` 即可搜索文件，而无需输入完整路径。Pi 完成后，检查它的回复和任何被更改的文件。重要工作请使用版本控制或备份。不受信任或无人值守的工作，请使用容器（container）或其他沙箱（sandbox）。参见[安全](security.md)。

## 稍后继续

Pi 会自动保存会话。退出 Pi 后，用以下命令恢复同一工作目录最近的会话：

```bash
pi --continue
```

使用 `/resume` 选择另一个已保存的会话。会话命名、分支、压缩（compaction）、导出和共享，参见[继续或分支会话](sessions.md)。

## 后续步骤

- [以交互模式使用 Pi](usage.md)，了解输入、命令、快捷键和排队消息。
- [添加指令](configuration.md#context-files)，让 Pi 在某个目录中工作时始终遵循。
- [选择模型与提供商](models.md)。

### 选择如何定制 Pi

从能满足需求的最简单机制开始：

| 需求 | 起步方式 |
|---|---|
| 让 Pi 为某个目录保留持久指令 | [`AGENTS.md`](configuration.md#context-files) |
| 从 `/` 菜单复用一条提示词 | [提示词模板](prompt-templates.md) |
| 添加任务专项指令和配套文件 | [技能](skills.md) |
| 添加可执行的工具、命令或事件处理器 | [扩展](extensions.md) |
| 构建自定义终端组件 | [终端 UI](tui.md) |
| 接入未受支持的模型服务 | [自定义提供商](custom-provider.md) |
| 安装或分发多种资源 | [Pi 包](packages.md) |

## 卸载 Pi

如果用 npm 安装的 Pi，运行：

```bash
npm uninstall -g @earendil-works/pi-coding-agent
```

如果用的是安装脚本，重新运行它并选择 **Uninstall Pi**（卸载 Pi）：

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

如果用 Nix 安装的 Pi，运行：

```bash
nix profile remove pi
```

以上任何方法都不会删除 `~/.pi/agent/` 中的配置、凭据、会话或已安装的 Pi 包。
