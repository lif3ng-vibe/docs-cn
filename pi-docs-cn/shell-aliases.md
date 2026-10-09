---
title: "配置 shell 命令"
---

Pi 会为每条 Bash 命令启动一个独立的非交互 shell 进程。非交互 Bash 默认不展开别名（alias），而且通常不会像交互终端那样加载相同的启动文件。

使用 `shellPath` 选择 Bash 可执行文件，用 `shellCommandPrefix` 在每条命令前运行初始化设置。

## 了解 Pi 使用哪个 shell

| 命令来源 | shell |
|---|---|
| 模型调用内置的 `bash` 工具 | Pi 解析得到的 Bash 可执行文件 |
| 你输入 `!command` 或 `!!command` | 同一个解析得到的 Bash 可执行文件 |
| 模型调用可选的 `powershell` 工具 | PowerShell 7（`pwsh.exe`）或 Windows PowerShell |
| 扩展提供或替换了 shell 工具 | 该扩展自己实现的操作 |

Pi 通常以 `bash -c` 的方式调用 Bash。在 Unix 系统上，它依次尝试 `/bin/bash`、`PATH` 上的 `bash`，Bash 不可用时最终退回 `sh`。原生 Windows 上则先检查配置的路径，然后是 Git Bash，最后是 `PATH` 上的 `bash.exe`。

## 选择 Bash 可执行文件

如果 Pi 需要使用特定的可执行文件，请在 `~/.pi/agent/settings.json` 中设置 `shellPath`：

```json
{
  "shellPath": "~/.local/bin/bash"
}
```

在 Windows 上，请使用正斜杠或对反斜杠进行转义：

```json
{
  "shellPath": "C:\\cygwin64\\bin\\bash.exe"
}
```

更改该设置后请运行 `/reload`。原生 Windows 的默认值参见[在 Windows 上运行 Pi](windows)。

## 在每条 Bash 命令前运行初始化

设置 `shellCommandPrefix`，把 shell 初始化设置前置到内置 `bash` 工具调用以及用户输入的 `!` 或 `!!` 命令之前：

```json
{
  "shellCommandPrefix": "export CI=1"
}
```

Pi 会用换行符把前缀和所请求的命令拼接在一起。前缀会在每条命令前重复运行，因此要保持简短，避免交互式提示。

## 启用 Bash 别名

把 Pi 需要的别名存放在一个 Bash 兼容的文件里，而不是解析整个交互式 shell 配置。

创建 `~/.bash_aliases`：

```bash
alias ll='ls -la'
alias gs='git status --short'
```

然后配置 Pi 启用别名展开并加载该文件：

```json
{
  "shellCommandPrefix": "shopt -s expand_aliases\nsource ~/.bash_aliases"
}
```

运行 `/reload`，然后通过 Pi 验证该别名：

```text
!ll
```

该命令应产生与 `ls -la` 相同的列表。

别名必须使用 Bash 兼容的语法。不要把任意的 `.zshrc` source 进 Bash，因为 zsh 的选项、函数和插件在 Bash 中可能无法解析或行为不正确。

## 故障排查

### 前缀对 `!` 生效但对扩展工具不生效

`shellCommandPrefix` 只配置 Pi 内置的 Bash 执行。替换 `bash` 工具或提供自有 shell 操作的扩展会控制自己的初始化设置。请查阅该扩展的文档。

### 找不到 `shopt` 命令

Pi 已回退到 `sh`，或 `shellPath` 指向的不是 Bash。在使用 `shopt` 这类 Bash 特有的初始化设置之前，请先安装 Bash，或将 `shellPath` 指向一个 Bash 可执行文件。

### 初始化命令等待输入

请从 `shellCommandPrefix` 中移除交互式命令。前缀在每条 Bash 命令之前的非交互进程中运行。

完整的设置定义参见[Shell 设置](settings#shell)。
