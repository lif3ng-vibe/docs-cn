---
title: "Shell 补全"
description: "ai-memory completions <shell> 为 bash、zsh、fish、powershell 或 elvish 向 stdout 打印补全脚本。脚本由二进制自身的命令树生成，覆盖产出它的那个版本的每个子命令与标志。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/shell-completions.md"
---

# Shell 补全

`ai-memory completions <shell>` 为 `bash`、`zsh`、`fish`、`powershell` 或 `elvish` 向 stdout 打印补全脚本。脚本由二进制自身的命令树生成，所以覆盖产出它的那个版本的每个子命令与标志——包括 `user rotate-token` 与 `auth login` 这类嵌套命令。

Docker 包装器的 `upgrade` 命令是包装器自有的、不属于原生 clap 命令树，所以它是唯一不出现在生成补全里的子命令。

该命令不读配置、不需要数据目录，所以可以在 `ai-memory init` 之前或打包步骤里运行。

Docker 包装器会先缓冲完这个有界命令再写到 stdout，这样 `head` 之类的短消费者关闭管道时 Docker 不会追加 broken-pipe 诊断。辅助容器失败仍返回非零退出码且不打印残缺的补全脚本。

## 安装

### fish

```fish
mkdir -p ~/.config/fish/completions
ai-memory completions fish > ~/.config/fish/completions/ai-memory.fish
```

Fish 在首次使用时惰性加载该路径——不用重启 shell，不用改 `config.fish`。

### zsh

```zsh
mkdir -p ~/.zfunc
ai-memory completions zsh > ~/.zfunc/_ai-memory
```

`~/.zfunc` 必须在 `compinit` 运行之前就在 `$fpath` 上。若还没有，在 `~/.zshrc` 里 `compinit` 调用之上加：

```zsh
fpath=(~/.zfunc $fpath)
autoload -Uz compinit && compinit
```

Zsh 会缓存补全元数据，新生成的脚本不生效时 `rm -f ~/.zcompdump` 并开一个新 shell。

### bash

要求安装 [bash-completion](https://github.com/scop/bash-completion)。

```bash
mkdir -p ~/.local/share/bash-completion/completions
ai-memory completions bash > ~/.local/share/bash-completion/completions/ai-memory
```

开一个新 shell 生效。只想给当前 shell 加载：

```bash
source <(ai-memory completions bash)
```

### PowerShell

```powershell
ai-memory completions powershell | Out-String | Invoke-Expression
```

要持久化生成的脚本，把它放在 PowerShell profile 旁，并在 `$PROFILE` 里 dot-source 一次：

```powershell
$completionDir = Join-Path (Split-Path -Parent $PROFILE) "completions"
$completionPath = Join-Path $completionDir "ai-memory.ps1"
New-Item -ItemType Directory -Force $completionDir | Out-Null
ai-memory completions powershell | Set-Content -Encoding utf8 $completionPath
Add-Content -Path $PROFILE -Value ". '$completionPath'"
```

升级后重新生成 `$completionPath`；profile 里那行不需要再加。

### elvish

```elvish
mkdir -p ~/.config/elvish/lib
ai-memory completions elvish > ~/.config/elvish/lib/ai-memory.elv
```

然后在 `~/.config/elvish/rc.elv` 里加 `use ai-memory`。

## 升级

脚本是生成那一刻命令树的快照。升级 `ai-memory` 后重跑同一命令，让补全拿到新的子命令与标志。仓库刻意不签入任何脚本，正是为了让过期脚本不会伴随更新的二进制分发。

Docker 用户无需本地安装即可生成脚本：

```bash
docker run --rm akitaonrails/ai-memory:latest completions fish \
  > ~/.config/fish/completions/ai-memory.fish
```
