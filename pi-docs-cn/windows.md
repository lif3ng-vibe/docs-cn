# 在 Windows 上运行 Pi

Pi 可以作为原生 Windows 进程运行，也可以在适用于 Linux 的 Windows 子系统（WSL）中运行。原生 Windows 默认用 Git Bash 执行 Bash 命令，还可以选择向模型暴露 PowerShell。WSL 中的 Pi 则使用 Linux 环境及其 Bash 安装。

按照[快速开始](quickstart.md)安装并认证 Pi。使用本页来选择和配置它的命令环境。

## 选择原生 Windows 还是 WSL

| 环境 | 命令环境 | 适用场景 |
|---|---|---|
| 原生 Windows + Git Bash | 内置 `bash` 工具和 `!` 命令使用 Git Bash | 你的文件和开发工具主要在 Windows 上 |
| 原生 Windows + `powershell` 工具 | 模型工具调用使用 PowerShell；`!` 命令仍可使用 Bash | 任务依赖 PowerShell 模块或 Windows 原生命令 |
| WSL | 所选 WSL 发行版内的 Linux Bash 和工具 | 你的文件和工具链已经在 Linux 或 WSL 中 |

## 在原生 Windows 上使用 Git Bash

对大多数原生 Windows 用户来说，安装 [Git for Windows](https://git-scm.com/download/win) 就足够了。

Pi 按以下顺序查找 Bash：

1. `~/.pi/agent/settings.json` 中的 `shellPath`
2. `Program Files` 或 `Program Files (x86)` 下的 Git Bash
3. `PATH` 上的 `bash.exe`，包括 Cygwin、MSYS2 或旧版 WSL Bash

启动 Pi 并输入以下命令验证 shell：

```text
!printf 'Bash is working\n'
```

如果 Pi 找不到 Bash，它会报告已检查过的位置。请安装 Git for Windows、把其他 Bash 可执行文件加入 `PATH`，或配置 `shellPath`。

## 让模型使用 PowerShell

可选的 `powershell` 工具在有 `pwsh.exe` 时通过它运行命令，否则回退到 Windows PowerShell。它以 `-NoProfile -NonInteractive -ExecutionPolicy Bypass` 参数启动 PowerShell。管理员强制执行的执行策略仍可能优先生效。

要把面向模型的 `bash` 工具替换为 `powershell`，请在 `~/.pi/agent/settings.json` 中加入以下配置：

```json
{
  "defaultTools": ["read", "powershell", "edit", "write"]
}
```

`["-bash", "+powershell"]` 效果相同，同时保留你配置的其他默认工具。

重启 Pi，然后让它运行一条无害的 PowerShell 命令。`!` 和 `!!` 编辑器命令继续使用 Bash。`powershell` 工具仅在 Pi 作为原生 Windows 进程运行时可用。

其他工具组合参见[设置](settings.md#tools)。

## 使用自定义 Bash 可执行文件

如果 Bash 安装在 Pi 无法自动发现的位置，请设置 `shellPath`：

```json
{
  "shellPath": "C:\\cygwin64\\bin\\bash.exe"
}
```

JSON 用反斜杠表示转义序列。写带反斜杠的 Windows 路径时，请像上面这样把每个反斜杠写两遍。

命令前缀、别名以及完整的 shell 查找行为参见[配置 shell 命令](shell-aliases.md)。

## 配置 Windows Terminal

Windows Terminal 会保留或改写部分修饰键组合。要配置 `Shift+Enter` 和 `Alt+Enter`，参见 [Windows Terminal](terminal-setup.md#windows-terminal)；Pi 在 Windows 和 WSL 上的默认快捷键参见[按键绑定](keybindings.md)。
