---
title: "Shell 集成"
description: "Worktrunk 的 shell 包装器如何更改父 shell 的目录、每种 shell 会得到哪些文件，以及如何调试不起作用的集成。"
sidebar:
  order: 25
---
[`wt config shell`](/config/#wt-config-shell) 涵盖安装、激活与当前 shell 诊断；本指南介绍已安装的文件、警告信息与包装器的行为。

## 为什么需要 Shell 集成

子进程无法更改其父 shell 的目录，因此 `wt` 会安装一个 shell 函数：先运行二进制文件，再在命令要求时切换目录。详情见 [shell 包装器的工作原理](#shell-包装器的工作原理)。

## 安装

自动安装见 [`wt config shell install`](/config/#wt-config-shell-install)，各受支持 shell 的手动配置见 [`wt config shell init`](/config/#wt-config-shell-init)。

请把每条初始化语句单独放在一行，以便自动检测与移除；经过自定义改写的初始化行则必须手动管理。

## 创建的文件

[`wt config shell install`](/config/#wt-config-shell-install) 会向 bash、zsh 与 PowerShell 的配置文件各追加一行，并为 fish 和 Nushell 完整写入文件：

- **Bash**：`~/.bashrc`
- **Zsh**：`~/.zshrc`（或 `$ZDOTDIR/.zshrc`）
- **Fish**：`~/.config/fish/functions/wt.fish` 和 `~/.config/fish/completions/wt.fish`（设置了 `$XDG_CONFIG_HOME` 时，位于 `$XDG_CONFIG_HOME/fish` 之下）
- **Nushell 0.113+** <span class="badge-experimental"></span>：wt.nu，位于 Nushell 的用户 vendor-autoload 目录——即 `$nu.vendor-autoload-dirs` 的最后一项、`$nu.data-dir` 之下（Linux 上通常是 `~/.local/share/nushell/vendor/autoload`，macOS 上是 `~/Library/Application Support/nushell/vendor/autoload`）
- **PowerShell**（Windows）：两个 profile 文件都会写入，不存在则创建：
  - `Documents/PowerShell/Microsoft.PowerShell_profile.ps1`（PowerShell 7+）
  - `Documents/WindowsPowerShell/Microsoft.PowerShell_profile.ps1`（Windows PowerShell 5.1）

**Windows 上的 PowerShell 检测**：从 cmd.exe 或 PowerShell 运行时，会自动创建两个 PowerShell profile 文件；从 Git Bash 或 MSYS2 运行时则跳过 PowerShell（可执行 `wt config shell install powershell` 显式创建这两个 profile）。

移除方法见 [`wt config shell uninstall`](/config/#wt-config-shell-uninstall)。

## 检查状态

运行 `wt config show`。其 SHELL INTEGRATION 一节会报告包装器在当前 shell 中是否已激活。

## 警告信息

当 Shell 集成未正常工作时，`wt switch` 会显示一条警告，解释原因。

### "shell wrapper is out of date"

**含义**：当前 shell 中加载的是来自旧版 Worktrunk 的包装器，无法跟随目录切换。

**修复**：运行 `wt config shell install`，然后重启 shell（或重新加载其配置），以激活当前版本的包装器。

### "shell integration not installed"

**含义**：当前 shell 没有已安装的 Worktrunk 初始化行或包装器文件。当前 shell 从进程树检测得出（回退到 `$SHELL`），因此这里指的是实际调用 `wt` 的那个 shell，而不一定是登录 shell。

**修复**：运行 `wt config shell install`，或参照[手动配置](/config/#wt-config-shell-init)。

### "shell integration installed but not active"

**含义**：当前 shell 已配置 Shell 集成，但该 shell 函数未在本会话中加载——通常是因为会话在安装之前就已启动。

**修复**：新开一个终端，或运行 `source ~/.bashrc`（或等效命令）。如果重启后警告仍然出现，`wt config show` 会报告检测到的 shell、`$SHELL` 以及各 shell 的集成状态。

### "ran ./path/to/wt; shell integration wraps wt"

**含义**：二进制文件是通过显式路径（如 `./target/debug/wt` 或 `/usr/local/bin/wt`）调用的，而不是直接用 `wt`。shell 包装器只拦截不带路径的 `wt` 命令。

**修复**：使用不带路径的 `wt`。要测试开发构建，可设置 `WORKTRUNK_BIN`：

```bash
export WORKTRUNK_BIN=./target/debug/wt
wt switch feature  # Now uses the dev build with shell integration
```

### "ran git wt; running through git prevents cd"

**含义**：使用了 `git wt`（git 别名）而非 `wt`。Git 会把 worktrunk 作为子进程运行，从而绕过 shell 包装器。

**修复**：需要切换目录时，请直接使用 `wt` 而不是 `git wt`。

### "Alias bypasses shell integration"

**含义**：该别名直接调用二进制文件，绕过了负责切换目录的 shell 函数。

**修复**：将别名改为指向函数名而非二进制文件：

```bash
alias gwt="wt"       # Good - uses the shell function
alias gwt="git-wt"   # Good - uses the shell function
```

`wt config show` 会检测这类有问题的别名，并显示警告及建议的修复方法。

## shell 包装器的工作原理

shell 包装器（由 `wt config shell install` 安装）定义了一个 shell 函数，它会：

1. 创建一个临时文件
2. 设置 `WORKTRUNK_DIRECTIVE_CD_FILE`
3. 运行真正的 `wt` 二进制文件
4. 用 `cd -- "$(< file)"` 读取 CD 文件（原始路径，不做 shell 解析）
5. 清理临时文件

简化示例如下（实际的包装器还会处理补全和边界情况）：

```bash
wt() {
    local cd_file exit_code=0
    cd_file="$(mktemp)"

    WORKTRUNK_DIRECTIVE_CD_FILE="$cd_file" \
        command wt "$@" || exit_code=$?

    if [[ -s "$cd_file" ]]; then
        cd -- "$(<"$cd_file")"
    fi
    rm -f "$cd_file"
    return "$exit_code"
}
```

## 调试清单

### 1. 检查包装器是否已加载

```bash
# Should show a shell function, not a binary path
type wt

# Expected output (bash/zsh):
# wt is a function
# wt () { ... }

# If it shows a path like /usr/local/bin/wt, the wrapper isn't loaded
```

### 2. 检查包装器是否已加载（PowerShell）

```powershell
# PowerShell: should show Function, not just Application
Get-Command wt -All

# Expected output when the wrapper is loaded:
# CommandType  Name  Source
# -----------  ----  ------
# Function     wt
# Application  wt    C:\Users\...\wt.exe

# If only Application appears, the wrapper isn't loaded (restart the shell)
# If Function appears but integration is still "not active", check the body:
(Get-Command wt -CommandType Function).ScriptBlock | Select-String WORKTRUNK
```

### 3. 检查 shell 配置文件

```bash
# bash
grep -n "wt config shell init" ~/.bashrc

# zsh
grep -n "wt config shell init" ~/.zshrc

# fish (manual setup)
grep -n "wt config shell init" ~/.config/fish/config.fish
```

这些命令会显示初始化行及其行号。`wt config shell install` 为 fish 和 Nushell 写入的则是包装器文件；请按[创建的文件](#创建的文件)一节所列位置检查这些文件。

### 4. 检查指令文件是否已设置

```bash
# After running any wt command, this should be unset (the temp file is deleted)
echo $WORKTRUNK_DIRECTIVE_CD_FILE

# During wt execution, this is set to a temp file path
```

### 5. 手动测试指令文件

```bash
# Create the temp file and test
export WORKTRUNK_DIRECTIVE_CD_FILE=$(mktemp)
command wt switch feature
cat $WORKTRUNK_DIRECTIVE_CD_FILE     # Should contain: /path/to/worktree (raw path)
cd -- "$(<$WORKTRUNK_DIRECTIVE_CD_FILE)"  # Should cd you there
rm -f $WORKTRUNK_DIRECTIVE_CD_FILE
```

## 常见问题

### Shell 集成在终端中正常，在 IDE 终端中不正常

IDE 终端可能使用不同的 shell 配置。请检查：

- VS Code：Settings → Terminal → Integrated → Shell Args
- IDE 终端可能加载的是不同的 profile

### 补全不工作

补全会随 Shell 集成一起安装。如果补全缺失：

```bash
# Reinstall (forces regeneration)
wt config shell install

# For zsh, you may need compinit before the wt line:
autoload -Uz compinit && compinit
eval "$(wt config shell init zsh)"
```

### Windows Git Bash 问题

如果遇到路径问题，请确保使用的是较新版本的 Git for Windows。

## 环境变量

| 变量 | 用途 |
|----------|---------|
| `WORKTRUNK_DIRECTIVE_CD_FILE` | 由 shell 包装器设置；`wt` 向其中写入一个原始路径，包装器随后 `cd` 到该路径 |
| `WORKTRUNK_BIN` | 覆盖二进制文件路径（用于测试开发构建） |
| `WORKTRUNK_COMPLETE_NAME` | 由 bash、zsh 与 PowerShell 包装器在加载补全时设置；指定注册绑定到的命令名，使 `--cmd` 集成也能获得补全 |

## 另请参阅

- [`wt config shell`](/config/#wt-config-shell)——安装与当前 shell 诊断
- [FAQ：Worktrunk 会创建哪些文件？](/faq/#worktrunk-会创建哪些文件)
