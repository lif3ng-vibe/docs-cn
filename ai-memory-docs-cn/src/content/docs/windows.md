---
title: "Windows 支持"
description: "Windows 支持有两种模式。选与你智能体 CLI 实际运行位置匹配的那种。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/windows.md"
---

# Windows 支持

Windows 支持有两种模式。选与你智能体 CLI 实际运行位置匹配的那种。

## 经验法则

从启动 Claude Code、Codex、Command Code、Devin CLI、Cursor、Gemini CLI、Kimi Code、Kiro CLI、Antigravity CLI 或其他智能体的同一环境运行 `install-mcp` 与 `install-hooks`。

- 智能体跑在 WSL2 里时，把 ai-memory 装进 WSL2。
- 智能体作为原生 Windows 进程运行时，从 Windows 上的 PowerShell 安装 ai-memory。
- 除非刻意覆盖每个配置与钩子路径，不要把 Windows 包装器与 WSL2 启动的智能体混用。

差别之所以要紧，是因为钩子配置里含可执行文件路径。WSL2 智能体需要 Linux 路径与 POSIX `.sh` 钩子。原生 Windows 智能体需要 Windows 路径，但钩子运行器按智能体而异：本地受支持的配置默认宿主原生命令。Claude Code 可用其受支持的直接 exec 形式（`command: "…ai-memory.exe"`、`args: ["hook", "--event", …]`）无 shell 运行——见[原生命令钩子（Windows 上的 Claude Code）](#原生命令钩子windows-上的-claude-code)。其他智能体用符合各自钩子 schema 的原生单命令字符串。PowerShell/Git Bash 脚本包是兼容性回退，不强制执行 capture-policy v1。

## 场景 A：全部在 WSL2 里

这是最像 Linux 的 Windows 设置。智能体 CLI 安装并启动在 WSL2 发行版里时用它。

```bash
# 在 WSL2 内。
mkdir -p ~/.local/bin
wrapper_base=https://github.com/akitaonrails/ai-memory/releases/latest/download/ai-memory-wrapper
wrapper_tmp="$(mktemp -d)"
trap 'rm -rf "$wrapper_tmp"' EXIT
curl -fsSL "$wrapper_base" -o "$wrapper_tmp/ai-memory-wrapper"
curl -fsSL "$wrapper_base.sha256" -o "$wrapper_tmp/ai-memory-wrapper.sha256"
(cd "$wrapper_tmp" && sha256sum -c ai-memory-wrapper.sha256)
install -m 0755 "$wrapper_tmp/ai-memory-wrapper" ~/.local/bin/ai-memory
rm -rf "$wrapper_tmp"
trap - EXIT
export PATH="$HOME/.local/bin:$PATH"

docker run -d --name ai-memory \
    --restart unless-stopped \
    -p 127.0.0.1:49374:49374 \
    -v ai-memory-data:/data \
    akitaonrails/ai-memory:latest

ai-memory install-mcp --client claude-code --apply
ai-memory install-hooks --agent claude-code --apply
```

此模式下 ai-memory 的行为与 Linux 一致：

- 配置文件写在你的 WSL2 家目录下。
- 钩子脚本暂存在 `~/.local/share/ai-memory/hooks/` 下。
- 钩子命令指向 `.sh` 脚本。
- 智能体也应从 WSL2 启动，这样它才能执行那些 WSL 路径。

若 Docker Desktop 向 WSL2 提供 Docker 引擎，先为该发行版启用 WSL 集成。若你在 WSL2 里跑原生 Docker 引擎，则不涉及 Windows 包装器。

## 场景 B：带 Docker Desktop 的原生 Windows

智能体 CLI 作为原生 Windows 进程运行、且你想让 ai-memory 服务器跑在 Docker 镜像里时用它。

```powershell
# 安装 Windows Docker 包装器。
$UserBin = "$HOME\bin"
New-Item -ItemType Directory -Force $UserBin | Out-Null
$ReleaseBase = "https://github.com/akitaonrails/ai-memory/releases/latest/download"
$WrapperAssets = @{
    "ai-memory.ps1" = "ai-memory-wrapper.ps1"
    "ai-memory.cmd" = "ai-memory-wrapper.cmd"
}
foreach ($Entry in $WrapperAssets.GetEnumerator()) {
    $File = $Entry.Key
    $Asset = $Entry.Value
    Invoke-WebRequest `
        -Uri "$ReleaseBase/$Asset" `
        -OutFile "$UserBin\$File"
    Invoke-WebRequest `
        -Uri "$ReleaseBase/$Asset.sha256" `
        -OutFile "$UserBin\$File.sha256"
    $Expected = ((Get-Content "$UserBin\$File.sha256" -Raw) -split '\s+')[0]
    $Actual = (Get-FileHash "$UserBin\$File" -Algorithm SHA256).Hash.ToLower()
    if ($Actual -ne $Expected.ToLower()) {
        throw "Checksum mismatch for $Asset"
    }
    Remove-Item "$UserBin\$File.sha256"
}
Get-ChildItem "$UserBin\ai-memory.*" | Unblock-File

# 把包装器目录放进你的用户 PATH，供以后的终端使用。
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (($UserPath -split ';') -notcontains $UserBin) {
    $NewUserPath = (($UserPath, $UserBin) | Where-Object { $_ }) -join ";"
    [Environment]::SetEnvironmentVariable("Path", $NewUserPath, "User")
    $env:Path = "$env:Path;$UserBin"
}

# 用 Docker Desktop 起服务器。
docker run -d --name ai-memory `
    --restart unless-stopped `
    -p 127.0.0.1:49374:49374 `
    -v ai-memory-data:/data `
    akitaonrails/ai-memory:latest

# 不要再跑 `ai-memory serve`；上面的长驻容器就是服务器。

# 验证包装器连得上服务器。
ai-memory status

# 为原生 Windows 智能体接好 MCP 与生命周期钩子。
ai-memory install-mcp --client claude-code --apply
ai-memory install-hooks --agent claude-code --apply
```

此模式下，PowerShell 包装器运行 Linux 容器，但告诉 CLI 为原生 Windows 智能体渲染钩子命令：

- 配置文件经挂载的 Windows 家目录写入。
- 钩子脚本暂存在 `$HOME\.local\share\ai-memory\hooks\` 下。
- 本地受支持的配置默认宿主原生命令。Claude Code 可用其 exec 形式（`command` 可执行文件 + `args` argv 数组），其他智能体用符合各自钩子 schema 的原生单命令字符串。包装器用 PowerShell `-EncodedCommand` 渲染那些 `.ps1` 回退命令，让钩子运行器无法在内层 PowerShell 进程收到之前展开其中的 `$env:` 设置。那些命令强制文本输出并抑制进度记录，让嵌套 PowerShell 运行器不向钩子 stderr 吐 `CLIXML`。PowerShell/Git Bash 脚本包是兼容性回退，不强制执行 capture-policy v1。

升级包装器/镜像后，为每个原生 Windows 智能体重跑 `install-hooks --agent <agent> --apply`，让既有钩子条目拿到当前命令形式。

其他客户端用匹配的 `--client` / `--agent` 值，例如 `codex`、`command-code`、`devin`、`kimi-code`、`kiro-cli`、`cursor`、`gemini-cli`。

Devin：`install-mcp --client devin --apply` 把 MCP 配置写进 `%USERPROFILE%\.devin\config.json`。`install-hooks --agent devin --apply` 默认把生命周期钩子写进 `%USERPROFILE%\.devin\hooks.v1.json`；想让钩子在 Devin 主配置文件的 `hooks` 键下时传 `--config-file "%USERPROFILE%\.devin\config.json"`。

Kiro CLI：`install-mcp --client kiro-cli --apply` 写 `%USERPROFILE%\.kiro\settings\mcp.json`，除非 `$env:KIRO_HOME` 覆盖根。`install-hooks --agent kiro-cli --apply` 更新 `.kiro\agents` 下既有的 v2 智能体文件；项目本地智能体用 `--config-file`。Kiro v3 钩子捕获仍不支持，等待为其文档化的独立 schema 提供净化后的真实生命周期与内置工具 payload 夹具。从启动 Kiro 的同一原生 Windows 环境运行这些命令，让生成的可执行路径保持有效。

## 场景 C：预构建发布二进制（无需工具链）

智能体 CLI 作为原生 Windows 进程运行、且你想要**不**装 Rust 工具链或 Docker 的快速原生钩子路径时用它。每个带标签的发布提供 `ai-memory-windows-x86_64.zip`（见仓库 Releases 页）。

```powershell
# 下载 + 解压进你的用户数据目录（任何稳定路径都行；原生钩子 exec
# 形式命令从 ai-memory.exe 所在处渲染）。
$Dest = "$env:LOCALAPPDATA\ai-memory"
New-Item -ItemType Directory -Force $Dest | Out-Null
Invoke-WebRequest `
    -Uri "https://github.com/akitaonrails/ai-memory/releases/latest/download/ai-memory-windows-x86_64.zip" `
    -OutFile "$env:TEMP\ai-memory.zip"
Expand-Archive "$env:TEMP\ai-memory.zip" -DestinationPath $Dest -Force
Get-ChildItem "$Dest\ai-memory.exe" | Unblock-File

# 放进 PATH 供以后的终端用（可选但方便）。
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (($UserPath -split ';') -notcontains $Dest) {
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$Dest", "User")
    $env:Path = "$env:Path;$Dest"
}

# 对着你的服务器接好 MCP + 生命周期钩子。
& "$Dest\ai-memory.exe" install-mcp --client claude-code --apply
& "$Dest\ai-memory.exe" install-hooks --agent claude-code --apply `
    --server-url "https://memory.example.com" --auth-token "<token>"
```

zip 镜像 Linux 发布压缩包、减去仅 Linux 的服务资产：含 `ai-memory.exe`、完整 `hooks/` 包（`.ps1` + `.sh`）、`crates/ai-memory-cli/templates/config.default.toml`、`README.md`、`LICENSE` 与 `docs/{install,windows}.md`。因为 `install-hooks` 从运行中的二进制读 `ai-memory.exe` 路径，把解压出的 `.exe` 放稳定位置（移动后重跑 `install-hooks`）。

## 场景 D：原生 Windows 源码构建

在 Windows 上开发 ai-memory 本身、或 CLI 命令不想用 Docker 包装器时用它。

```powershell
git clone https://github.com/akitaonrails/ai-memory .\ai-memory
Set-Location .\ai-memory
cargo build --workspace
cargo test --workspace

target\debug\ai-memory.exe init
target\debug\ai-memory.exe serve --transport http --bind 127.0.0.1:49374
```

在原生 Windows 上从 Git Bash 做发布验证时，用同一检出并激活 Rust MSVC 工具链：

```bash
cargo test --workspace
cargo build --locked --release -p ai-memory-cli
./target/release/ai-memory.exe --version
```

版本输出应与该检出的包版本一致。

Tailwind 构建步骤支持钉住的 `tailwindcss-windows-x64.exe` 二进制，并在 `curl`/`wget` 不可用时回退到 PowerShell `Invoke-WebRequest`。正常 Windows 构建不需要 `TAILWIND_SKIP=1`。

原生构建与钩子运行要保持 Git for Windows 的 `git.exe` 在 `PATH` 上。libgit2 打开新初始化的 wiki 仓库时若撞上 Windows 路径解析错误，ai-memory 回退到 Git CLI，而不把那个特定条件当致命。

从仓库的另一个 PowerShell 窗口：

```powershell
target\debug\ai-memory.exe install-mcp --client claude-code --apply
target\debug\ai-memory.exe install-hooks --agent claude-code --apply
```

原生 Windows 构建渲染智能体专属的宿主原生生命周期命令。Claude Code 可用其受支持的二进制 exec 形式（见下）；其他智能体用符合各自钩子 schema 的原生单命令字符串。捆绑的 `.sh` 与 `.ps1` 事件脚本是兼容性回退，不强制执行 capture-policy v1；测试强制它们之间事件/智能体一一对应。

### 捕获策略支持

原生 `ai-memory.exe hook` 命令在暂存或网络投递之前强制执行就近标记的 `[capture] ignore_paths` 策略。遗留的 `.ps1` 与 `.sh` 路径不执行。升级后重跑 `install-hooks --agent <agent> --apply` 刷新原生钩子条目；所选安装的能力输出会说明强制是否激活。见[捕获排除](/marker-file/#捕获排除capture-exclusions)。

## 原生命令钩子（Windows 上的 Claude Code）

原生 Windows 上默认用 Claude 的 exec 形式渲染 Claude Code 钩子：`command` 是真实的 `ai-memory.exe` 路径、`args` 是 argv 数组。这直接孵化二进制，而不是给 shell 发一条带引号的字符串、或用 `bash -c` 包着 `.sh` 脚本：

```json
{
  "type": "command",
  "command": "C:\\Users\\you\\.cargo\\bin\\ai-memory.exe",
  "args": ["hook", "--event", "pre-tool-use", "--agent", "claude-code", "--server-url", "http://host:49374", "--auth-token", "..."]
}
```

这避免了每次工具调用孵化 Git Bash 加 `cat`/`sed`/`curl` 子进程。进程孵化在 Windows 上昂贵，所以原生路径每次钩子约快 3-5 倍（在 i7-6700HQ 上实测约 735 ms shell → 约 150-205 ms 原生）。注意：

- 二进制路径来自运行 `install-hooks` 的那个 `ai-memory`，所以 `cargo install --locked --path crates/ai-memory-cli` 会把它放到稳定的 `~/.cargo/bin` 路径。
- exec 形式要求真实可执行路径（`.exe`）。它不经 shell 跑 `.cmd` 或 `.bat` 垫片。`install-hooks` 用运行中 `ai-memory.exe` 的路径，所以发布二进制与 Cargo 构建二进制直接可用。
- `.sh`/`.ps1` 脚本保留为回退——Docker / `setup-agent` 流程（无本地二进制）继续发 shell 命令。
- `AI_MEMORY_HOOK_PLATFORM` 接受五个值：
  - `windows-native`——Claude exec 形式直接调二进制（原生 Windows 默认）。
  - `windows`——PowerShell `-EncodedCommand` + 暂存的 `.ps1` 脚本。原生 Windows Docker 包装器的默认，因为辅助容器无法把它的 Linux 二进制装进宿主钩子条目。
  - `windows-bash`——经 Git Bash 的 `bash -c` + `.sh`（以前的默认；设它选回，或作为不支持 exec 形式的旧 Claude Code 构建的回退）。
  - `posix`——POSIX `.sh`。Linux/macOS Docker 包装器的默认（宿主无本地二进制）；显式设它让原生安装退回脚本。
  - `posix-native`——macOS / Linux 上的直接二进制调用（`<exe> hook --event …`）而非 `.sh` 脚本，让钩子用本地事件暂存 + OIDC 令牌回退。**原生 macOS / Linux Claude Code 安装的默认**（cargo / 发布二进制），对应 `windows-native`。Linux/macOS Docker 包装器强制 `posix`，所以它渲染的宿主配置保持 `.sh` 脚本。

  运行 `install-hooks` 之前设该环境变量，让所选平台固化进渲染的钩子命令。

项目 auto-scope 比较钩子 `cwd`、已存 `repo_path` 与家目录兜底守卫时，把 Windows 反斜杠与 POSIX 斜杠当同一路径分隔符。需要宿主 home 不同于进程 `HOME` 的包装器或测试可设 `AI_MEMORY_HOME`；它经同一路径边界归一化后再做启动治愈或 cwd 前缀匹配。

### 调整暂存时序（高延迟实例）

原生钩子在本地暂存事件。会话启动在取交接前做短的有界清理排放；会话结束启动分离的 `hook-drain` 辅助进程，让 Claude Code 与其他智能体不被大积压拖住不退。内置时序在面向智能体的路径上保持短，但高延迟或大积压实例可用整分钟覆盖调高。与 `AI_MEMORY_HOOK_PLATFORM` 不同，这些由钩子**在运行时**读取，所以作用于智能体的环境（无需重跑 `install-hooks`）：

原生钩子接受带或不带一个前导 UTF-8 BOM 的良构 JSON——有些 PowerShell 管道写原生进程时会加那个标记。其他畸形 stdin 不暂存也不发送；钩子向 stderr 打固定警告、stdout 返回 `{}`、并成功退出，这样它不会搞坏宿主智能体。警告绝不包含 payload 内容。

| 环境变量 | 内置默认 | 最大覆盖 | 钳制什么 |
|---|---:|---:|---|
| `AI_MEMORY_HOOK_DRAIN_TIMEOUT_MINUTES` | 3 秒 | 60 分钟 | 排放期间每个事件 POST |
| `AI_MEMORY_HOOK_HANDOFF_TIMEOUT_MINUTES` | 3 秒 | 60 分钟 | 同步的 `session-start` 交接 GET |
| `AI_MEMORY_HOOK_START_BUDGET_MINUTES` | 3 秒 | 60 分钟 | `session-start` 等待排放锁与清理排放的总时长 |
| `AI_MEMORY_HOOK_BACKGROUND_DRAIN_BUDGET_MINUTES` | 5 分钟 | 60 分钟 | 分离的 `hook-drain` 辅助在 `session-end` 之后可花的总时长 |
| `AI_MEMORY_HOOK_INCREMENTAL_THRESHOLD` | 32 条事件 | 正整数 | 触发一次 250 ms `post-tool-use` 追赶排放的暂存积压量 |

时序值必须是正整分钟。缺失、空、非数字或零值回退内置默认；超过 60 被钳制。增量阈值是正的事件计数；无效值回退 32。会话启动预算钳制钩子在交接取数前可阻塞多久；后台预算钳制 session-end 之后的分离清理、不让智能体等待。

Windows 上，竞争中的排放锁可能报成原生 `ERROR_LOCK_VIOLATION` 码而非 Rust 的 `WouldBlock` 错误类。ai-memory 把两者都当正常的锁忙状态，所以并发排放按同一套暂存时序规则等待、跳过或过期，而不是让钩子失败。

## 当前的外壳注意事项

Windows 钩子支持较新，需要在真实 Windows 智能体构建上做实测。

- Claude Code 可以原生跑在 Windows 上、也可以在 WSL2 里。原生 Claude Code 默认把钩子作为直接二进制调用（无 shell）唤起；`AI_MEMORY_HOOK_PLATFORM=windows-bash` 恢复 Git Bash 的 `bash -c` 路径。WSL2 Claude Code 用正常 WSL 的 `.sh` 路径。
- Codex、Command Code、Devin CLI、OpenCode、Cursor、Gemini CLI、Antigravity CLI、Grok Build CLI、Zero、Kimi Code 与 OpenClaw 各自可能选择不同的 Windows 配置位置或 shell 执行行为。ai-memory 用当前最知名的默认，但需要在真实安装上验证。
- HTTP 上的 MCP 应当对路径不如钩子敏感，但 `install-mcp --apply` 仍写进客户端专属的配置文件；确认智能体真的加载它。
- OpenClaw、OpenCode、OMP / Oh My Pi 与 Pi 用生成的 TypeScript 集成而非 shell 钩子包，所以它们的 Windows 行为取决于宿主运行时正确加载那些文件。Pi 的生成扩展还桥接 MCP 工具，因为 Pi 没有原生 `mcp.json` 安装面。

## 建议的测试清单

WSL2：

1. 全部安装命令在 WSL2 里跑。
2. 确认生成的钩子命令引用 WSL 路径下的 `.sh` 文件。
3. 从 WSL2 启动智能体。
4. 从智能体调 `memory_status`。
5. 记录 `ai-memory status`，发一条提示词，然后确认其 `sessions` 或 `observations` 计数增加。

原生 Windows：

1. 全部安装命令从 PowerShell 或 `cmd.exe` 用 `ai-memory` / `ai-memory.ps1` 跑。
2. 确认生成的钩子命令与智能体匹配：Claude Code 应该用原生 `"…ai-memory.exe" hook --event …` 命令（或 `AI_MEMORY_HOOK_PLATFORM=windows-bash` 时的 `bash -c` + `.sh`）；其他脚本钩子智能体应该用 `powershell.exe ... -EncodedCommand <payload>` 条目跑你 Windows 家目录下生成的 `.ps1` 钩子。
3. 启动原生 Windows 智能体。
4. 从智能体调 `memory_status`。
5. 记录 `ai-memory status`，发一条提示词，然后确认其 `sessions` 或 `observations` 计数增加。

反馈时说明你测的模式、用的智能体与版本、以及钩子命令是执行成功还是以路径/shell 错误失败。内置 `/web` 浏览器列出编译 wiki 页面；那里零页面不意味着裸钩子观察被漏掉。
