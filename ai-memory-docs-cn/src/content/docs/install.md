---
title: "安装指南"
description: "README 快速开始覆盖快乐路径（docker + Claude Code）。本页覆盖其余一切。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/install.md"
---

# 安装指南（cookbook）

[README 快速开始](/#快速开始)覆盖快乐路径（docker + Claude Code）。本页覆盖其余一切：

- [另一台机器上的服务器](#另一台机器上的服务器)
  （家庭实验室、局域网机器、远程服务器）
- [配置 CLI URL 与认证](#配置-cli-url-与认证)
- [Arch Linux 原生包（AUR）](#arch-linux-原生包aur)
  （systemd 系统服务或用户服务）
- [配置其他智能体 CLI](#配置其他智能体-clis)
  （Codex、Command Code、Devin CLI、OpenCode、OMP、Pi、Cursor、Claude Desktop、Gemini CLI、Antigravity CLI、Grok Build CLI、Zero、Kimi Code、Kiro CLI、OpenClaw、VS Code Copilot、Zed）
- [不用 docker 安装钩子](#不用-docker-安装钩子)
  （基于 curl 的安装器）
- [不用 docker 运行 ai-memory](#不用-docker-运行-ai-memory)
  （cargo install、源码构建）
- [托管跨外壳工作流](/managed-workstreams/)
  （`ai-memory run`、透明原生恢复与参数转发）
- [LLM 提供方层级 + 自托管 Ollama](#llm-提供方层级)
- [常用子命令](#常用子命令)
- [托管路由片段与智能体技能](#托管路由片段与智能体技能)
- [无认证运行](#无认证运行)（仅本地）
- [保持 ai-memory 最新](#保持-ai-memory-最新)

> **速记。**多数片段用 `$TOKEN` 与 `homelab:49374`。逐字照做的话：
> ```bash
> export TOKEN=$(docker run --rm akitaonrails/ai-memory:latest generate-auth-token)
> ```
> 且服务器与智能体 CLI 同机时把 `homelab` 换成 `localhost`。

Docker 镜像发布 `linux/amd64` 与 `linux/arm64`；Apple Silicon Mac 与 ARM64 Linux 宿主不需要 `--platform linux/amd64`。

> **Podman。**`bin/ai-memory` 包装器可配合 rootless podman 工作——经 `podman-docker` 的 `docker` 垫片，或用 `AI_MEMORY_DOCKER=podman` 直接指向 podman。它如何探测引擎的 rootless 与 SELinux 状态见 [SELinux enforcing 宿主](#selinux-enforcing-宿主)。

---

## 另一台机器上的服务器

ai-memory 服务器跑在局域网机器（家庭实验室、无头服务器）上、而你在笔记本上用 Claude Code / Codex / 等时：

### 服务器侧（家庭实验室宿主）

```bash
docker run -d --name ai-memory \
    --restart unless-stopped \
    -p 0.0.0.0:49374:49374 \
    -v ai-memory-data:/data \
    -e AI_MEMORY_AUTH_TOKEN="$TOKEN" \
    -e AI_MEMORY_ALLOWED_HOSTS="<server-ip>,localhost,127.0.0.1" \
    -e AI_MEMORY_LLM_PROVIDER=anthropic \
    -e ANTHROPIC_API_KEY=sk-ant-... \
    akitaonrails/ai-memory:latest
```

为什么正常非环回绑定同时需要 `AI_MEMORY_AUTH_TOKEN` 与 `AI_MEMORY_ALLOWED_HOSTS`，见 README 的[安全](/#安全)。bearer 认证不加密流量：局域网或远程访问请用 [HTTPS 反向代理指南](/https-via-proxy/)里现成的 [Caddy](https://github.com/akitaonrails/ai-memory/blob/main/docker/compose.tls.caddy.yml) 或 [Cloudflare Tunnel](https://github.com/akitaonrails/ai-memory/blob/main/docker/compose.tls.cloudflared.yml) 模板。代理经 HTTPS 服务 `/web` 时，还要在服务器环境设 `AI_MEMORY_AUTH__SECURE_COOKIE=true` 并关闭或重定向到该主机名的直接 HTTP 访问。直接 HTTP 下不要设它：浏览器那时会正确地扣住会话 cookie。

### 客户端侧（笔记本）

```bash
export AI_MEMORY_SERVER_URL="http://<server-ip>:49374"
export AI_MEMORY_AUTH_TOKEN="$TOKEN"

ai-memory install-mcp   --client claude-code --apply
ai-memory install-hooks --agent  claude-code --apply
```

`--session-aware` 是可选的 Claude Code MCP 模式：

```bash
ai-memory install-mcp --client claude-code --session-aware --apply
```

它把静态 HTTP MCP 条目替换为本地 ai-memory stdio 桥——桥仍连接配置的远程服务器与 bearer token，同时转发 Claude 的生命周期会话 id。同一操作者在不同项目跑并发 Claude Code 会话时，配合 `[auto_scope] mode = "per_session"`。一次一个活跃项目时默认静态 HTTP 注册仍然合适。

设了 `CLAUDE_CONFIG_DIR` 时，claude-code 安装器匹配 Claude Code 自己的配置解析：`install-mcp` 把 MCP 注册写进 `$CLAUDE_CONFIG_DIR/.claude.json`（而非 `~/.claude.json`），`install-hooks` / `setup-agent` 定位 `$CLAUDE_CONFIG_DIR/settings.json`（而非 `~/.claude/settings.json`），`install-skills --scope global` 用 `$CLAUDE_CONFIG_DIR/skills`（而非 `~/.claude/skills`）。`uninstall` 同时扫家默认值与活跃的迁移路径。它发现不了不再设置的旧任意 `CLAUDE_CONFIG_DIR`。Docker 包装器为其既有 `$HOME` 绑定挂载之下的配置根转发该变量；迁移根在 `$HOME` 之外时用原生二进制。

CLI 命令（`bootstrap`、`status`、`search`、`lint`、`auto-improve`、`curator`、`pending-writes` 等）自动继承这两个环境变量。`install-mcp`、`install-hooks`、`setup-agent` 也是：设了 `AI_MEMORY_SERVER_URL` 时，`install-mcp` 派生 `/mcp` 端点、`install-hooks` 用裸服务器源。

升级 ai-memory 之后，刷新既有项目里的托管路由包，让 Claude Code/OpenCode/Codex/Gemini 拿到新的工具指引与主动检索规则。从智能体里说 "refresh the ai-memory routing in this project"；从终端跑 `ai-memory install-instructions`（或非 Claude 提示词文件传 `--target AGENTS.md`）。更新幂等：`<!-- ai-memory:start -->` / `<!-- ai-memory:end -->` 之间的遗留长片段被就地替换为轻量片段，托管智能体技能随之安装或更新。

---

## 配置 CLI URL 与认证

`ai-memory` 二进制是瘦 HTTP 客户端。它从不直接打开 wiki 或 SQLite；触碰状态的命令经运行中的服务器——唯一写入者。

配置是两个可选环境变量：

| 变量 | 默认 | 何时设置 |
|---|---|---|
| `AI_MEMORY_SERVER_URL` | `http://127.0.0.1:49374` | 服务器不在同一台机器上时，如 `http://192.168.0.90:49374`。 |
| `AI_MEMORY_AUTH_TOKEN` | 未设 | 服务器启用 bearer 认证时。 |

单笔记本环回服务器两者都不设。远程或家庭实验室服务器把两个都放进 shell rc 或 direnv 文件：

```bash
export AI_MEMORY_SERVER_URL="http://192.168.0.90:49374"
export AI_MEMORY_AUTH_TOKEN="<token>"
```

`install-mcp`、`install-hooks`、`setup-agent` 上的显式 `--server-url` 与 `--auth-token` 标志覆盖环境。为与你默认 CLI 目标不同的服务器生成配置时有用。

先跑了 `install-mcp --apply`、之后不带环境变量或标志跑 `install-hooks --apply` 时，钩子尽可能复用该智能体既有的 ai-memory MCP 条目。这让远程 MCP 配置与生命周期捕获指向同一服务器、而不是回退环回。

所有安装器的 `--apply` 模式保留符号链接的配置文件：原子更新写到符号链接目标（含缺失的最终目标），带时间戳的备份留在面向用户的配置路径旁。这保持 stow、chezmoi 等点文件管理安装的链接。

`init`、`serve`、`generate-auth-token` 不需要这些环境变量——它们要么创建本地文件、要么启动服务器本身。

### 默认项目解析（`--project-strategy`）

默认每个会话把记忆归档在 `basename(cwd)` 下。因为智能体外壳在工具调用之间保持工作目录，一次 `mkdir sub && cd sub` 就把会话剩余部分重新挂父到一个叫 `sub` 的幽灵项目。想让安装的每个会话都从 git 仓库根解析项目——收拢子目录与 worktree——把策略固化进钩子：

```bash
ai-memory install-hooks --apply --agent claude-code --project-strategy repo-root
```

`--project-strategy` 接受 `basename`（新安装默认；不固化任何东西）或 `repo-root`。之后的 `--apply` 省略它时保留已固化进该智能体 ai-memory 钩子的策略——包括包装器升级后的自动刷新。显式传 `basename` 移除既有的 `repo-root` 默认。这对每个智能体与投递路径都有效。逐仓库 `.ai-memory.toml` 标记自己的 `project_strategy` / `project` 仍然优先——见[标记文件参考](/marker-file/#安装级默认无标记)。

---

## Arch Linux 原生包（AUR）

想要 `/usr/bin/ai-memory` 加 systemd 单元而非 Docker 包装器时用原生包。包安装一次二进制与钩子源；每个用户仍用自己的 `install-hooks --apply` 把智能体钩子脚本暂存进自己的家目录。

### 包选择

```bash
yay -S ai-memory-bin    # 预构建 Linux x86_64/aarch64 二进制，安装最快
yay -S ai-memory        # 从源码构建，x86_64 与 aarch64 都行
```

两个包安装相同的运行时布局：

| 路径 | 用途 |
|---|---|
| `/usr/bin/ai-memory` | 原生 CLI/服务器二进制。 |
| `/usr/share/ai-memory/hooks/` | `install-hooks` 用的打包钩子源包。 |
| `/usr/lib/systemd/system/ai-memory.service` | 系统级服务单元。 |
| `/usr/lib/systemd/user/ai-memory.service` | 逐用户服务单元。 |
| `/usr/lib/sysusers.d/ai-memory.conf` | 创建 `ai-memory` 系统用户。 |
| `/usr/lib/tmpfiles.d/ai-memory.conf` | 为系统服务创建 `/var/lib/ai-memory`。 |
| `/etc/ai-memory/config.toml` | 系统服务配置文件，作为 pacman 备份文件跟踪。 |
| `/etc/ai-memory/env` | 系统服务环境/秘密文件，作为 pacman 备份文件跟踪。 |

二进制本身不在系统与用户模式间猜。单元文件显式选择：

| 模式 | 数据目录 | 配置 | 环境/秘密 | 需要 sudo？ |
|---|---|---|---|---|
| 用户服务 | `~/.local/share/ai-memory` | `~/.config/ai-memory/config.toml` | `~/.config/ai-memory/env` | 否 |
| 系统服务 | `/var/lib/ai-memory` | `/etc/ai-memory/config.toml` | `/etc/ai-memory/env` | 是 |

不要在同一绑定地址上跑两个服务。它们可在磁盘上共存，但除非改一个配置里的 `bind`，只有一个能听 `127.0.0.1:49374`。

### 用户级服务

单用户工作站上用它。包装安装后无需 sudo、全部状态留在你的家目录。

```bash
mkdir -p ~/.config/ai-memory ~/.local/share/ai-memory
ai-memory \
  --data-dir ~/.local/share/ai-memory \
  --config ~/.config/ai-memory/config.toml \
  init
```

想要 LLM 整编或 bearer 认证就编辑提供方/认证设置：

```bash
$EDITOR ~/.config/ai-memory/config.toml
$EDITOR ~/.config/ai-memory/env
```

仅环回的本地服务 bearer 认证可选。想要一个的话：

```bash
TOKEN=$(ai-memory generate-auth-token)
printf 'AI_MEMORY_AUTH_TOKEN=%s\n' "$TOKEN" >> ~/.config/ai-memory/env
```

启动并检查服务：

```bash
systemctl --user daemon-reload
systemctl --user enable --now ai-memory.service
systemctl --user status ai-memory.service
journalctl --user -u ai-memory.service -f
```

想让服务在你登出后继续跑：

```bash
loginctl enable-linger "$USER"
```

验证 HTTP 服务器：

```bash
curl http://127.0.0.1:49374/mcp
# 预期一个 JSON-RPC 错误，说明服务器可达。
```

### 系统级服务

共享工作站、局域网机器、或服务器应独立于任何登录用户运行的家庭实验室式宿主上用它。

确保包创建的用户与状态目录存在，然后以该服务用户初始化数据布局：

```bash
sudo systemd-sysusers /usr/lib/sysusers.d/ai-memory.conf
sudo systemd-tmpfiles --create /usr/lib/tmpfiles.d/ai-memory.conf
sudo -u ai-memory ai-memory \
  --data-dir /var/lib/ai-memory \
  --config /etc/ai-memory/config.toml \
  init
```

编辑系统配置与秘密：

```bash
sudoedit /etc/ai-memory/config.toml
sudoedit /etc/ai-memory/env
```

包把 `/etc/ai-memory/env` 装成仅 root 可读，因为它可能持 API key。让其他用户能读的备份或日志别碰它。

局域网暴露时，在 `/etc/ai-memory/config.toml` 设非环回绑定与允许主机，并在 `/etc/ai-memory/env` 设 bearer token：

```toml
bind = "0.0.0.0:49374"
allowed_hosts = ["homelab", "192.168.0.90", "localhost", "127.0.0.1"]
```

```bash
TOKEN=$(ai-memory generate-auth-token)
printf 'AI_MEMORY_AUTH_TOKEN=%s\n' "$TOKEN" | sudo tee -a /etc/ai-memory/env
```

启动并检查服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ai-memory.service
sudo systemctl status ai-memory.service
journalctl -u ai-memory.service -f
```

从宿主验证：

```bash
curl -sI http://127.0.0.1:49374/handoff
# 设了 AI_MEMORY_AUTH_TOKEN 时 401 Unauthorized。
```

### 原生服务的 LLM 提供方登录

API-key 提供方放进相应的 env 文件：

```bash
# 用户服务
printf 'AI_MEMORY_LLM_PROVIDER=anthropic\nANTHROPIC_API_KEY=sk-ant-...\n' >> ~/.config/ai-memory/env
systemctl --user restart ai-memory.service

# 系统服务
sudoedit /etc/ai-memory/env
sudo systemctl restart ai-memory.service
```

OAuth 式提供方把 token 写进所选数据目录。用与服务相同的 `--data-dir` 与 `--config` 对跑登录：

```bash
# 用户服务
ai-memory \
  --data-dir ~/.local/share/ai-memory \
  --config ~/.config/ai-memory/config.toml \
  auth login openai-oauth

# 系统服务
sudo -u ai-memory ai-memory \
  --data-dir /var/lib/ai-memory \
  --config /etc/ai-memory/config.toml \
  auth login openai-oauth
```

GitHub Copilot 同样用 `auth login copilot`。对 OIDC issuer 做逐开发者原生钩子认证时，改在开发者选定的数据目录跑 `auth login oidc-device`：

```bash
ai-memory auth login oidc-device \
  --issuer "https://issuer.example.com/realms/team" \
  --client-id "ai-memory-cli"
```

存储的 OIDC access token 也被瘦客户端 HTTP 命令（`status`、`search`、`read-page`、`write-page`、`backup`、`embed` 等）在未配置静态 `AI_MEMORY_AUTH_TOKEN` / `[auth].bearer_token` 时使用。静态 bearer 认证仍优先。这面向外部 OIDC 感知的网关/桥；原生 ai-memory 服务器认证仍用静态 root bearer / DB 用户 token，且除非网关把接受的 OIDC 认证翻译成 ai-memory 接受的上游认证，`/admin/*` 保持仅 root。

OIDC/Keycloak 的 `sid` 声明描述登录提供方的会话，不是 ai-memory 用于 `[auto_scope]` 隔离的编码智能体会话。网关可以传播已认证的 user/client/agent 头，但 `X-Memory-Actor-Session-Id` 应只含来自会话感知桥的真实生命周期钩子会话 id。

改提供方设置后重启服务：

```bash
systemctl --user restart ai-memory.service      # 用户模式
sudo systemctl restart ai-memory.service        # 系统模式
```

### 原生安装后接智能体 CLI

无 bearer token 的本地环回服务器：

```bash
ai-memory install-mcp   --client claude-code --apply
ai-memory install-hooks --agent  claude-code --apply
```

并发 Claude Code 会话：在服务器配置设 `[auto_scope] mode = "per_session"` 并给 `install-mcp` 命令加 `--session-aware`。本地与局域网服务器都适用；生成的 stdio 桥继续用 `AI_MEMORY_SERVER_URL` / `--server-url` 与 `AI_MEMORY_AUTH_TOKEN`。

bearer 保护的本地或局域网服务器：先导出端点。MCP URL 含 `/mcp`；钩子 URL 是裸源。

```bash
export AI_MEMORY_SERVER_URL="http://127.0.0.1:49374"
export AI_MEMORY_AUTH_TOKEN="$TOKEN"

ai-memory install-mcp   --client claude-code --apply
ai-memory install-hooks --agent  claude-code --apply
```

`install-hooks` 在 `/usr/share/ai-memory/hooks` 下找打包的钩子源，然后把可运行副本暂存到 `~/.local/share/ai-memory/hooks/<agent>/` 下，让智能体能执行你用户拥有的文件。包升级后重跑 `install-hooks --apply` 刷新那些暂存副本。

### 捕获策略能力与刷新

`[capture] ignore_paths` 只由原生 `ai-memory hook` 命令与生成的 OpenCode/OMP/Pi/OpenClaw 集成强制。本地安装器在受支持处选原生命令；遗留 `.sh`/`.ps1` 钩子与纯远程或 Docker 脚本包不强制。升级后重跑 `install-hooks --agent <agent> --apply` 或刷新/重装生成的插件；安装器能力输出反映所选集成。权威参考见[捕获排除](/marker-file/#捕获排除capture-exclusions)。

生命周期观察体的限额独立于 10 MiB 的 HTTP 请求限制。用户提示词与压缩后摘要保留至多 16 KiB；通知与工具摘录保留至多 2 KB。原生 `ai-memory hook` 命令在那些字段进入本地暂存或链路之前 UTF-8 安全地截断。服务器对每个集成（含脚本与生成的客户端）重复事件专属上限，然后在任何观察到达 SQLite 或 FTS 之前、净化之后施加 16 KiB 兜底。原生钩子命令直接调已安装的二进制，所以升级那个二进制就足以拿到客户端侧上限。

有些智能体外壳把助手最后一轮附在其 `Stop` 事件上——Claude Code 以原始 `last_assistant_message` 发送。默认该文本从不持久化：原生钩子二进制在它到达本地暂存或链路之前剥掉原始字段，服务器到达时防御性地再剥。

**选择启用捕获（#196）。**可以选择启用存储助手最后一轮的净化、2 KB 钳制摘录作为 Stop 体。这是**双重选择启用**——先开服务器、再开客户端：

1. **服务器：**在生效的 `<data_dir>/config.toml`（或服务配置的 TOML 文件）设 `capture_assistant = true`，或设 `AI_MEMORY_CAPTURE_ASSISTANT=true`，然后重启 `ai-memory serve`。
2. **客户端：**带标志重装 Claude Code 钩子：

   ```bash
   ai-memory install-hooks --agent claude-code --capture-assistant --apply
   ```

客户端在摘录碰暂存或链路之前净化（内建模式）并截断；服务器存储前用自己的 `[sanitize]` 模式重洗。任一侧关闭——或标记畸形——Stop 保持为空。不带 `--capture-assistant` 重跑 `install-hooks` 移除该标志（幂等）。`--capture-assistant` 仅限 Claude Code + 原生平台；其他智能体或脚本回退上安装器拒绝它、而不是启用一个无法生效的东西。助手文本隐私敏感——启用前读 `SECURITY.md` 里关于它能含什么、流向哪里（整编/评审者提示词、以及配置了云 LLM 提供方时发出去）的笔记。

升级二进制对原生 Claude Code 安装足够，暂存中待排的事件排放时同样剥掉原始字段。跑 `.sh`/`.ps1` 脚本回退的安装（Docker 脚本包或显式 `AI_MEMORY_HOOK_PLATFORM=posix`）无法净化助手文本，所以仍带原始字段的 `Stop` payload 被脚本整体丢弃而不是逐字 POST。Docker 包装器刻意保留脚本命令，因为其辅助容器内的二进制路径在宿主上无效；经该包装器跑 `install-hooks` 刷新脚本但不转换它们。要安全捕获助手文本，在智能体宿主装原生 ai-memory 客户端，然后用那个原生可执行文件跑 `install-hooks --agent claude-code --apply`。即便保留脚本回退，服务器收到时仍会在持久化前剥掉任何原始字段。

原生 `ai-memory hook --event ...` 命令在本地暂存事件。会话启动在取交接前做短的有界清理排放；易取消的边界事件（`stop`、`pre-compact`、`session-end`）启动分离的 `hook-drain` 辅助进程，让投递不依赖单个关机钩子活下来。每条暂存条目跨重试保持一个幂等键。处理了事件但丢了批次响应的服务器不会重复其观察或已完成的会话结束效果；观察提交后处理停止的话，重试重跑下游工作。SessionEnd 原子地提交其结束水位线与自动交接；发现该事务已完整的重试完成任何被中断的 wiki 提交、持久提供方入队与摄取键完成，而不加第二条交接。那些不完整的效果在服务器标记事件完成前保持至少一次。Unix 上，辅助进程可用时用受信 `setsid` 启动器、否则回退独立进程组；Windows 用 detached/breakaway 进程标志。暂存有上限，所以永久不排的积压最终被修剪而非无界，但旧的未投递事件可能丢失。内置时序在面向智能体的路径上保持短，但高延迟或大积压实例可在智能体环境用整分钟运行时环境变量调高；无需重跑 `install-hooks`：

| 环境变量 | 内置默认 | 最大覆盖 | 钳制什么 |
|---|---:|---:|---|
| `AI_MEMORY_HOOK_DRAIN_TIMEOUT_MINUTES` | 3 秒 | 60 分钟 | 排放期间每个事件 POST |
| `AI_MEMORY_HOOK_HANDOFF_TIMEOUT_MINUTES` | 3 秒 | 60 分钟 | 同步的 `session-start` 交接 GET |
| `AI_MEMORY_HOOK_START_BUDGET_MINUTES` | 3 秒 | 60 分钟 | `session-start` 等待排放锁与清理排放的总时长 |
| `AI_MEMORY_HOOK_BACKGROUND_DRAIN_BUDGET_MINUTES` | 5 分钟 | 60 分钟 | 分离的 `hook-drain` 辅助在后台排放边界之后可花的总时长 |
| `AI_MEMORY_HOOK_INCREMENTAL_THRESHOLD` | 32 条事件 | 正整数 | 触发一次 250 ms `post-tool-use` 追赶排放的暂存积压量 |

时序值必须是正整分钟。缺失、空、非数字或零值回退内置默认；超过 60 被钳制。增量阈值是正的事件计数；无效值回退 32。

服务器侧钩子摄取还有可选的逐来源限流器，供需要防护单个失控智能体会话的共享或远程安装。在服务器上把 `AI_MEMORY_HOOK_RATE_PER_SEC` 设为每行为者/会话来源的令牌补充率；`0` 或未设禁用限流器。设 `AI_MEMORY_HOOK_RATE_BURST` 覆盖突发大小（默认等于补充率，启用时最少一令牌）。限流器在键数与键字节数上都有界，`/hook/batch` 排放可跳过超预算来源、仍接受之后无关来源。

### 原生服务操作

```bash
# 用户服务
systemctl --user restart ai-memory.service
systemctl --user stop ai-memory.service
journalctl --user -u ai-memory.service -n 100

# 系统服务
sudo systemctl restart ai-memory.service
sudo systemctl stop ai-memory.service
journalctl -u ai-memory.service -n 100
```

备份仍用同一 CLI，只要指向服务数据目录：

```bash
# 用户服务
ai-memory --data-dir ~/.local/share/ai-memory backup --to ~/ai-memory-backup.tar.gz

# 系统服务
sudo -u ai-memory ai-memory --data-dir /var/lib/ai-memory backup --to /var/lib/ai-memory/backup.tar.gz
```

包移除不删数据。只有刻意想抹掉记忆时才停服务并移除状态：

```bash
systemctl --user disable --now ai-memory.service
sudo systemctl disable --now ai-memory.service

# 可选破坏性清理：
rm -rf ~/.local/share/ai-memory ~/.config/ai-memory
sudo rm -rf /var/lib/ai-memory /etc/ai-memory
```

### 维护者集成测试

正常 CI 跑 `scripts/check-native-packaging.sh`——一个宿主安全的回归检查，用临时备用根给 `systemd-analyze`、`systemd-sysusers`、`systemd-tmpfiles`。它验证单元语法、预期路径、sysusers 输出、tmpfiles 规则、env 文件模式与 AUR shell 语法，而不写宿主 `/usr`、`/etc`、`/var` 或碰真实服务。

仓库还有一个手工 Arch 集成框架，刻意不进日常 CI——它创建一次性 distrobox、安装包、启动真实 systemd 服务、可能要几分钟：

```bash
scripts/test-native-arch-systemd-distrobox.sh
```

它验证 AUR 元数据形状、构建当前工作树、把原生布局装进一次性 Arch 容器、用 `systemctl` 启动系统服务、在临时 systemd 监管下启动用户档命令、并检查 `/usr/share/ai-memory/hooks` 下打包的钩子源能被 `install-hooks` 暂存。

该脚本的破坏性部分检测不到容器/distrobox 环境时拒绝运行。

有用的旋钮：

```bash
AI_MEMORY_NATIVE_TEST_BOX=ai-memory-native-test scripts/test-native-arch-systemd-distrobox.sh
AI_MEMORY_NATIVE_TEST_KEEP_BOX=1 scripts/test-native-arch-systemd-distrobox.sh
AI_MEMORY_NATIVE_TEST_IMAGE=quay.io/toolbx/arch-toolbox:latest scripts/test-native-arch-systemd-distrobox.sh
```

---

## 配置其他智能体 CLI

> `install-mcp --server-url` 接受裸服务器源或完整 MCP 端点，缺失的 `/mcp` 恰好补一次。
> `install-hooks --server-url` 取裸服务器**源**（如 `http://homelab:49374`）——钩子脚本自己追加 `/hook`、`/handoff` 等。

每个智能体 CLI 需要两样东西：

1. **MCP 注册**——让智能体能调 `memory_query`、`memory_recent`、`memory_handoff_accept`。
2. **生命周期钩子**——让服务器自动捕获会话事件。
   没有它，智能体仍能查记忆，但捕获变手工。

Claude Desktop、VS Code Copilot、Zed 今天仅 MCP。[README 支持矩阵](/#支持矩阵)里带钩子能力的客户端（含 Pi 与 Zero）都有经 `install-hooks` 的生命周期捕获路径。

> **钩子安装模式。**本地受支持的配置默认宿主原生命令。Claude Code 可用其受支持的 Windows exec 形式（`command` = 真实 `ai-memory.exe`、`args` = `hook --event ...` 的 argv token）；其他智能体按各自钩子 schema 用原生单命令字符串。PowerShell/Git Bash 脚本包是兼容性回退、不强制 capture-policy v1。纯远程/Docker 脚本安装仍走两步路径：(1) `docker cp` 捆绑脚本到你的家目录，(2) `docker run --rm install-hooks` 渲染配置片段。OpenClaw、OpenCode、OMP、Pi 不同：它们用生成的 TypeScript 插件/扩展文件，所以那些客户端不需要 shell 脚本提取。

### OpenAI Codex

```bash
# MCP 片段（合并进 ~/.codex/config.toml）：
docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client codex \
    --server-url "http://homelab:49374/mcp" \
    --auth-token "$TOKEN"

# 钩子——提取脚本 + 渲染配置：
docker cp ai-memory:/usr/local/share/ai-memory/hooks ~/.ai-memory/
docker run --rm akitaonrails/ai-memory:latest \
    install-hooks --agent codex \
        --hooks-dir ~/.ai-memory/hooks \
        --server-url "http://homelab:49374" \
        --auth-token "$TOKEN"
```

Codex 仍不暴露可靠的真实会话结束钩子。其 `Stop` 钩子只被捕获为回合/停止观察；ai-memory **不**把它当 SessionEnd。需要当前项目的最终会话摘要、交接与自动改进资格时，运行：

```bash
ai-memory finalize-session
# 加 --all 关闭此 workspace/project 下每个匹配的开放 Codex 会话
# 或精确定位一个并发会话（与 --all 互斥）
ai-memory finalize-session --session-id <uuid>
```

Antigravity CLI 同样缺真会话结束事件。其 `Stop` 钩子标记一个执行循环的结束，所以 ai-memory 刻意记录它而不关闭对话。其 `PreInvocation` 钩子也在每次模型调用前跑；ai-memory 只把有文档的 `invocationNum = 0` 调用当 SessionStart。后续调用返回空钩子结果、不再捕获一次 start 或取走单次交接，所以当前对话收尾期间创建的交接仍留给下一会话。最后一轮之后，显式收尾最新的匹配 Antigravity 会话：

```bash
ai-memory finalize-session --agent antigravity-cli
# 加 --all 只为关闭此作用域下每个匹配的开放 Antigravity 会话
# 或加 --session-id <uuid> 关闭一个确切的并发会话
```

### Devin CLI

Devin 默认用 `~/.devin/config.json` 放 MCP 服务器、`~/.devin/hooks.v1.json` 放生命周期钩子。偏好单一合并 Devin 配置文件时，给 `install-hooks` 传 `--config-file ~/.devin/config.json`；ai-memory 随后把钩子条目合并进该文件的 `hooks` 键下。

```bash
ai-memory install-mcp --client devin --apply \
    --server-url "http://homelab:49374/mcp" \
    --auth-token "$TOKEN"

ai-memory install-hooks --agent devin --apply \
    --server-url "http://homelab:49374" \
    --auth-token "$TOKEN"

ai-memory install-skills --agent devin
```

Devin 的钩子词汇表接近 Claude Code，有两个重要差异：

- Devin 在压缩后发 `PostCompaction` 并带 `summary` 字段；ai-memory 记录为 `post-compaction`。
- Devin 不暴露子智能体 start/stop 钩子，所以 ai-memory 无法为 Devin 捕获嵌套子智能体边界。

`SessionStart` 钩子经 Devin 的 `hookSpecificOutput.additionalContext` 注入待处理交接。真实 Devin 的 `SessionStart` 与 `PostToolUse` payload 可能缺 `session_id` 与 `cwd`；ai-memory 现在在 payload 省略时从 `DEVIN_PROJECT_DIR` 或钩子进程工作目录推断 cwd、必要时从钩子状态铸造/复用逐宿主会话 id，所以那些事件仍被捕获。payload 提供的值永远优先。

### Kimi Code

Kimi Code 把 MCP 服务器放 `~/.kimi-code/mcp.json`、生命周期钩子放 `~/.kimi-code/config.toml`；设 `$KIMI_CODE_HOME` 时两者一起移动。CLI 也接受 `--agent kimi` 别名。`install-mcp` 写服务器 URL 时带 `?flavor=moonshot` 查询，因为 Moonshot API 拒绝工具参数 schema 里根级 `anyOf`/`oneOf`/`allOf`（「moonshot 风味 json schema」）——ai-memory 服务器以平铺 schema 应答风味请求，其他客户端保持上游形状。

```bash
ai-memory install-mcp --client kimi-code --apply \
    --server-url "http://homelab:49374/mcp" \
    --auth-token "$TOKEN"

ai-memory install-hooks --agent kimi-code --apply \
    --server-url "http://homelab:49374" \
    --auth-token "$TOKEN"
```

`install-hooks` 把 `[[hooks]]` 条目合并进 `config.toml`，保留同一文件持有的提供方/模型设置。条目覆盖 10 个事件——`SessionStart`、`SessionEnd`、`UserPromptSubmit`、`PreToolUse`、`PostToolUse`、`PostToolUseFailure`（Kimi Code 把工具失败与成功调用分开报告；它复用 post-tool-use 处理器）、`Stop`、`SubagentStart`、`SubagentStop`、`PreCompact`——且本地安装默认用原生 `ai-memory hook --event … --agent kimi-code` 命令（本地暂存加批量投递、强制 capture-policy v1）；`~/.local/share/ai-memory/hooks/kimi-code/` 下暂存的脚本包是兼容性回退（即发即忘 POST 到 `/hook`）。待处理交接经钩子 stdout 在 `UserPromptSubmit` 注入，Kimi Code 把它作为用户消息附加到回合前的模型上下文；Kimi Code 触发 `SessionStart` 但丢弃该钩子的 stdout，所以旧版本装的钩子消费了交接却没投递。既有原生钩子命令调当前 `ai-memory` 二进制、升级即拿到修正的投递行为。只为脚本回退安装重跑 `ai-memory install-hooks --agent kimi-code --apply` 刷新其暂存脚本。

Kimi Code 钩子条目只接受 `event`、`matcher`、`command`、`timeout`；多余字段让整个 `config.toml` 加载失败，所以偏好 `install-hooks --apply` 而非手编。

### Command Code

Command Code 把用户作用域 MCP 与钩子配置放在 `~/.commandcode/` 下独立 JSON 文件里。两样都装：

```bash
ai-memory install-mcp --client command-code --apply \
    --server-url "http://homelab:49374/mcp" \
    --auth-token "$TOKEN"

ai-memory install-hooks --agent command-code --apply \
    --server-url "http://homelab:49374" \
    --auth-token "$TOKEN"
```

接受别名 `commandcode`、`cmdc`、`cmd`。`install-mcp` 把原生 HTTP 条目合并进 `~/.commandcode/mcp.json`；`install-hooks` 只把 Command Code 的四个稳定事件（`SessionStart`、`PreToolUse`、`PostToolUse`、`Stop`）合并进 `~/.commandcode/settings.json`，保留其他设置与钩子处理器。钩子定义刻意省略 `matcher`：Command Code 文档把省略解释为「所有工具」，而 `SessionStart` 或 `Stop` 上任何 matcher 都会阻止该生命周期钩子触发。

本地安装用原生 `ai-memory hook` 命令，所以 Command Code 原生的 `session_id` 与 `cwd` 直接归因；识别的 `shell_command`、`read_file`、`write_file`、`edit_file` payload 与其他原生集成走同一有界捕获排除策略。待处理交接经 `hookSpecificOutput.additionalContext` 在 `SessionStart` 注入。

Command Code 稳定的 `Stop` 事件结束一个回合、不是会话。需要立即整编与交接时，最后一轮之后收尾开放会话：

```bash
ai-memory finalize-session --agent command-code
ai-memory finalize-session --agent command-code --session-id <uuid>
```

ai-memory 不安装 Command Code Mods。Mods 跑任意非沙箱代码、稳定钩子或托管会话路径不需要它们。

托管会话选择启用：

```bash
ai-memory run command-code
ai-memory run command-code --yolo --model <model-id>
```

别名 `commandcode`、`cmdc`、`cmd` 选同一适配器。默认可执行文件在 Unix 上是 `command-code`、原生 Windows 上是 `cmdc`。全新会话保留 Command Code 原生 UUID；回来的会话用精确 `--session <uuid>`。只读适配器只接受观察到的 v3 头、要求其 UUID 文件名与规范 `cwd` 匹配检出、排除 checkpoint/prompt sidecar、隐藏推理、图像与提供方元数据，并在可见事件上保留 `parentId` 作分支出处。未知的未来转录版本在 schema 审计前失败关闭。直接 `cmd`、`cmdc`、`command-code` 启动保持不变。

### Kiro CLI

Kiro CLI 有一个 MCP 面与两个互不兼容的生命周期钩子格式。ai-memory 经显式安装器目标支持两者：`kiro-cli` 保持 v2 目标、`kiro-cli-v3` 选独立 v3 注册。全局 MCP 文件是 `$KIRO_HOME/settings/mcp.json`、默认 `~/.kiro/settings/mcp.json`；项目作用域条目传 `--config-file .kiro/settings/mcp.json`。

```bash
ai-memory install-mcp --client kiro-cli --apply \
    --server-url "https://memory.example/mcp" \
    --auth-token "$TOKEN"
```

`kiro` 别名等价。安装的 URL 含 `?flavor=bedrock`，让 Kiro 的 Bedrock 后端拿到无根级 `anyOf`、`oneOf`、`allOf` 的 schema；嵌套 schema 与运行时校验保持完整。Kiro 对非环回远程服务器要求 HTTPS，所以 CLI 在改文件之前拒绝明文 HTTP 的家庭实验室 URL。按[HTTPS 反向代理](/https-via-proxy/)配置反向代理。

用 `kiro-cli` 智能体值装 v2 钩子。省略 `--server-url` 时，`install-hooks` 可从上面的托管 MCP 条目推断钩子源与 bearer token。

```bash
# 默认 v2 引擎：把钩子合并进每个既有全局智能体配置。
ai-memory install-hooks --agent kiro-cli --apply

# 项目本地的 v2 智能体覆盖同名全局智能体。显式更新所选
# 本地配置，而不是假设全局副本在跑。
ai-memory install-hooks --agent kiro-cli --apply \
    --config-file .kiro/agents/<agent-name>.json
```

v2 引擎把 camelCase 钩子存在智能体 JSON 文件里。ai-memory 只更新既有 `$KIRO_HOME/agents/*.json` 文件；它不会捏造 Kiro 从不选择的智能体。那个目录为空时先创建并选择一个智能体。Kiro 给[项目本地智能体优先于全局](https://kiro.dev/docs/cli/custom-agents/configuration-reference/)，所以活跃定义在 `.kiro/agents/` 下时用 `--config-file`。任何文件被改之前先全部解析，无关智能体字段、第三方钩子、以及每个智能体既有的 `--project-strategy` 保持完好。

安装注册 spawn、user-prompt、pre-tool、post-tool 与 stop 捕获，ai-memory 不可用时保持失败开放，并经成功的 `agentSpawn` stdout 投递待处理交接。已验证的 v2 工具 payload 强制 `[capture] ignore_paths`；未识别的 payload 形状存为有界元数据而不暴露文件内容。

用显式 `kiro-cli-v3` 目标装 v3 钩子。这个区分是刻意的：`kiro` 与 `kiro-cli` 继续指 v2，升级就不能静默把既有安装改写成不兼容格式。独立注册经交互式 Kiro CLI 2.16.2 `--v3` 会话做过验收测试。

```bash
# $KIRO_HOME/hooks（默认 ~/.kiro/hooks）下的全局 v3 注册。
ai-memory install-hooks --agent kiro-cli-v3 --apply

# 项目本地 v3 注册。
ai-memory install-hooks --agent kiro-cli-v3 --apply \
    --config-file .kiro/hooks/ai-memory.json
```

v3 安装器写有文档的独立 `version: "v1"` schema、PascalCase 触发器。它保留共享文件里的第三方条目、拒绝不支持的 schema 版本或与 ai-memory 保留钩子名冲突的第三方条目、并把仅捕获命令限定在一秒。SessionStart 得五秒，让 ai-memory 有界的交接取数能完成。两个引擎用同一净化钩子入口边界：有文档与实时的 `tool_name`/`tool_input` 文件操作遵守 `[capture] ignore_paths`，未知文件工具 payload 形状退化为仅元数据捕获。

Kiro v2 的 `stop` 事件结束一个回合、不是会话。最后一轮之后显式关闭匹配的会话；同项目开着多个 Kiro 会话时用确切 id：

```bash
ai-memory finalize-session --agent kiro-cli
ai-memory finalize-session --agent kiro-cli --session-id <uuid>
```

`ai-memory uninstall --only hooks --apply --yes` 只从全局 v2 智能体、当前项目的 `.kiro/agents` 目录、以及 ai-memory 的全局/当前项目 v3 注册中移除精确的 ai-memory 条目。纯生成的 v3 文件被删除；共享文件里的第三方条目留下。`ai-memory run kiro`（别名 `kiro-cli`）管理默认 v2 引擎并尊重 `$KIRO_HOME`；加 `--v3`、`--mode`、或 `--agent-engine v3` 做版本安全的 v3 恢复。一旦关联，之后裸的 Kiro 启动透明恢复存储的引擎，且裸 `ai-memory run` 会考虑两个互不兼容存储的检出本地会话。见[托管工作流](/managed-workstreams/#原生适配器行为)。

### OpenCode

```bash
docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client opencode \
    --server-url "http://homelab:49374/mcp" \
    --auth-token "$TOKEN"

# 插件——写到 ~/.config/opencode/plugins/ai-memory.ts。
# 装了本地包装器的话，偏好 `--apply`：
ai-memory install-hooks --agent opencode --apply \
    --server-url "http://homelab:49374" \
    --auth-token "$TOKEN"

# 仅 Docker 预览路径；只在想自己写文件时重定向：
docker run --rm akitaonrails/ai-memory:latest \
    install-hooks --agent opencode \
    --server-url "http://homelab:49374" \
    --auth-token "$TOKEN"
```

安装或更改插件后重启 OpenCode；插件在启动时加载。

### Oh My Pi / OMP

```bash
docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client omp \
    --server-url "http://homelab:49374/mcp" \
    --auth-token "$TOKEN"

# 扩展——写到 ~/.omp/agent/extensions/ai-memory-omp.ts。
# 装了本地包装器的话，偏好 `--apply`：
ai-memory install-hooks --agent omp --apply \
    --server-url "http://homelab:49374" \
    --auth-token "$TOKEN"
```

安装或更改扩展后重启 OMP；扩展在启动时加载。ai-memory CLI 接受 `--client omp`（或 `--client oh-my-pi`）配 MCP、`--agent omp`（或 `--agent oh-my-pi`）配钩子；两者都定位 OMP 原生 `.omp` 集成面。

### Pi

Pi 不读原生 `mcp.json`。ai-memory 经一个生成的 TypeScript 扩展支持 Pi——`~/.pi/agent/extensions/ai-memory-pi.ts`；同一文件捕获生命周期事件并用 `pi.registerTool` 把 ai-memory 的 HTTP MCP 工具桥接进 Pi。设了 `PI_CODING_AGENT_DIR`（它迁移 Pi 整个 `~/.pi/agent` 家）时，扩展写到 `$PI_CODING_AGENT_DIR/extensions/ai-memory-pi.ts`。

Pi 与 OMP 的扩展用不同文件名（`ai-memory-pi.ts` 与 `ai-memory-omp.ts`），装一个绝不覆盖另一个。它们不可互换——只有 Pi 的桥接 MCP 工具。

#### OMP profiles

`omp --profile <name>` 把 OMP 的智能体家迁到 `~/.omp/profiles/<name>/agent`。把安装器指向同一 profile，扩展才会落到该 profile 加载它的地方：

```bash
ai-memory install-hooks --agent omp --profile work --apply
# 或为 shell 设一次：
OMP_PROFILE=work ai-memory install-hooks --agent omp --apply
```

`--profile` 优先于 `OMP_PROFILE`，`uninstall --profile <name>` 移除同一文件。`PI_CODING_AGENT_DIR` 覆盖**两者**——设置时它直接点名智能体目录，不从它派生任何 profile 子目录。

```bash
ai-memory install-hooks --agent pi --apply \
    --server-url "http://homelab:49374" \
    --auth-token "$TOKEN"

# `install-mcp --client pi` 打印该指引而不是写 mcp.json：
ai-memory install-mcp --client pi --server-url "http://homelab:49374/mcp"
```

安装或更改扩展后重启 Pi。OMP / Oh My Pi 保持独立、继续用 `.omp` 路径。

### 绑定挂载 vs docker cp

`setup-agent` 子命令用绑定挂载一步完成提取 + 渲染：

```bash
docker run --rm -v "$HOME/.ai-memory:/host" \
    akitaonrails/ai-memory:latest \
    setup-agent --agent claude-code --to /host/hooks \
        --host-prefix "$HOME/.ai-memory/hooks" \
        --server-url "http://homelab:49374" --auth-token "$TOKEN"
```

容器用户 UID 与宿主用户 UID 一致时（如两者都是 1000 的家庭实验室）干净工作。它在 rootless Docker 与启用 `userns-remap` 的宿主上**失败**——容器写不了属于用户命名空间映射之外 UID 的宿主目录。

上面推荐的 `docker cp` 模式绕开这一切，因为 `docker cp` 由 docker 守护进程中介、产出的文件归运行命令的用户。作为默认偏好它；只在你的 docker 设置已知不重映射 UID 时用 `setup-agent`。

### 其他 MCP 客户端

逐客户端的 MCP 配置文件路径与片段见 [**MCP 安装指南**](/mcp-install/)，或经下面一次搞定：

```bash
docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client cursor          --auth-token "$TOKEN" \
    --server-url "http://homelab:49374/mcp"

docker run --rm akitaonrails/ai-memory:latest \
    install-hooks --agent cursor         --auth-token "$TOKEN" \
    --server-url "http://homelab:49374"

docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client claude-desktop  --auth-token "$TOKEN" \
    --server-url "http://homelab:49374/mcp"

docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client gemini-cli      --auth-token "$TOKEN" \
    --server-url "http://homelab:49374/mcp"

docker run --rm akitaonrails/ai-memory:latest \
    install-hooks --agent gemini-cli     --auth-token "$TOKEN" \
    --server-url "http://homelab:49374"

docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client antigravity-cli --auth-token "$TOKEN" \
    --server-url "http://homelab:49374/mcp"

docker run --rm akitaonrails/ai-memory:latest \
    install-hooks --agent antigravity-cli --auth-token "$TOKEN" \
    --server-url "http://homelab:49374"

docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client grok            --auth-token "$TOKEN" \
    --server-url "http://homelab:49374/mcp"

docker run --rm akitaonrails/ai-memory:latest \
    install-hooks --agent grok            --auth-token "$TOKEN" \
    --server-url "http://homelab:49374"

docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client openclaw        --auth-token "$TOKEN" \
    --server-url "http://homelab:49374/mcp"

docker run --rm akitaonrails/ai-memory:latest \
    install-hooks --agent openclaw       --auth-token "$TOKEN" \
    --server-url "http://homelab:49374"

docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client kiro-cli        --auth-token "$TOKEN" \
    --server-url "https://memory.example/mcp"

docker run --rm akitaonrails/ai-memory:latest \
    install-hooks --agent kiro-cli       --auth-token "$TOKEN" \
    --server-url "https://memory.example"

docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client command-code    --auth-token "$TOKEN" \
    --server-url "http://homelab:49374/mcp"

docker run --rm akitaonrails/ai-memory:latest \
    install-hooks --agent command-code   --auth-token "$TOKEN" \
    --server-url "http://homelab:49374"

docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client vscode-copilot  --auth-token "$TOKEN" \
    --server-url "http://homelab:49374/mcp"

docker run --rm akitaonrails/ai-memory:latest \
    install-mcp --client zed             --auth-token "$TOKEN" \
    --server-url "http://homelab:49374/mcp"
```

Cursor、Gemini CLI、Antigravity CLI、Grok Build CLI、Kiro CLI、Command Code、OpenClaw 同时支持 `install-mcp` 与 `install-hooks`。Grok 的 `install-mcp --client grok` 写 `$GROK_HOME/config.toml`（默认 `~/.grok/config.toml`）；其钩子住在 `$GROK_HOME/hooks`（默认 `~/.grok/hooks`）。`install-hooks --agent grok` 捕获生命周期事件。
Grok 忽略 `SessionStart` stdout，所以恢复时交接必须经 MCP 用 `memory_handoff_accept` 接受。Claude Desktop、VS Code Copilot、Zed 在这里仅 MCP，所以你得轻推模型自己调 `memory_query` / `memory_handoff_accept`。
对支持 `install-hooks` 的客户端，捕获路径在会话启动或客户端最接近的等价物处处理交接注入——除了 Grok（与 Zero）的无 stdout SessionStart 行为（Antigravity CLI 用 `PreInvocation`）。

---

## 不用 docker 安装钩子

只需要从某台机器*使用* ai-memory（即那台机器不跑服务器）时，下载并校验发布安装器。安装器随后在写任何脚本之前下载并校验发布的钩子归档：

```bash
installer_base=https://github.com/akitaonrails/ai-memory/releases/latest/download/ai-memory-install-hooks
installer_tmp="$(mktemp -d)"
trap 'rm -rf "$installer_tmp"' EXIT
curl -fsSL "$installer_base" -o "$installer_tmp/ai-memory-install-hooks"
curl -fsSL "$installer_base.sha256" -o "$installer_tmp/ai-memory-install-hooks.sha256"
expected="$(awk 'NR == 1 { print $1 }' "$installer_tmp/ai-memory-install-hooks.sha256")"
if command -v sha256sum >/dev/null 2>&1; then
    actual="$(sha256sum "$installer_tmp/ai-memory-install-hooks" | awk '{ print $1 }')"
else
    actual="$(shasum -a 256 "$installer_tmp/ai-memory-install-hooks" | awk '{ print $1 }')"
fi
[ -n "$expected" ] && [ "$actual" = "$expected" ] || { echo "installer checksum mismatch" >&2; exit 1; }
chmod +x "$installer_tmp/ai-memory-install-hooks"
"$installer_tmp/ai-memory-install-hooks" --agent claude-code
rm -rf "$installer_tmp"
trap - EXIT

# 然后渲染 JSON 配置（仍需要某处有 `ai-memory`——
# 要么 docker 一次性，要么本地安装）：
docker run --rm akitaonrails/ai-memory:latest \
    install-hooks --agent claude-code \
        --hooks-dir "$HOME/.ai-memory/hooks" \
        --server-url "http://homelab:49374" \
        --auth-token "$TOKEN"
```

curl 脚本安装器支持
`--agent claude-code|codex|cursor|gemini-cli|antigravity-cli|grok|opencode|openclaw|omp|oh-my-pi|pi`
与 `--to <dir>`；`--help` 打印完整标志表。OpenCode、OpenClaw、OMP / Oh My Pi、Pi 不需要脚本提取，因为 `install-hooks` 为它们生成 TypeScript 插件/扩展文件。Pi 的生成扩展还提供 MCP 桥。

以下情形这条路零摩擦：
- 有 curl + bash 但没有 docker
- 不需要跑本地 ai-memory 服务器（你是家庭实验室/远程 ai-memory 的客户端）

### 跨容器边界的钩子命令路径

`install-hooks --apply` 把钩子脚本暂存进数据目录并把其绝对路径写进智能体配置。CLI 跑在容器里而智能体跑在宿主上时，那些暂存路径会是宿主看不见的容器路径。把 `AI_MEMORY_HOOKS_HOST_ROOT` 设为暂存 `hooks/` 树挂载自的*宿主*目录，渲染的配置就用 `<host-root>/<agent>/…` 命令路径。捆绑的 docker 包装器（`bin/ai-memory`、`bin/ai-memory.ps1`）自动转发该变量；只有自定义容器设置才需要手工设。

---

## 不用 docker 运行 ai-memory

多数用户应坚持快速开始的 docker 包装器。macOS 上只需客户端 CLI 时，带标签的发布还提供原生 `ai-memory-macos-aarch64.tar.gz` 与 `ai-memory-macos-x86_64.tar.gz` 归档。只在魔改 ai-memory 本身或跑 docker 不支持的平台时从源码构建。

```bash
git clone https://github.com/akitaonrails/ai-memory ~/.ai-memory
cd ~/.ai-memory
cargo build --release --workspace
./target/release/ai-memory init                       # 一次性
./target/release/ai-memory serve --transport http \
    --bind 127.0.0.1:49374                            # MCP + 钩子 HTTP 服务器
```

数据目录默认 Linux `~/.local/share/ai-memory`、macOS `~/Library/Application Support/ai-memory`、Windows 平台本地数据目录（通常 `%LOCALAPPDATA%\ai-memory`）。用 `AI_MEMORY_DATA_DIR=/path` 覆盖。要求 bearer token 认证时在服务器环境设 `AI_MEMORY_AUTH_TOKEN`。

#### 可选 serve 标志

`serve` 子命令还接受：

| 标志 | 环境变量 | 作用 |
|---|---|---|
| `--enable-web` | `AI_MEMORY_ENABLE_WEB=true` | 挂载只读 Web 浏览器 + `/api/v1` JSON API。 |
| `--base-path /wiki` | `AI_MEMORY_BASE_PATH` | 把整个 HTTP 面（`/mcp`、`/hook`、`/admin/*`、`/api/v1`、`/web`）挂在可配置子路径下——适合共享主机名的反向代理后面。拒绝 `.` 与 `..` 段；不安全字符导致带警告回退根。见 [`docs/https-via-proxy.md`](/https-via-proxy/#挂在子路径下)。 |
| `--web-slug /web` | `AI_MEMORY_WEB_SLUG` | Web UI 在 base-path 内挂载的位置。默认 `/web`；设为 `/` 把 UI 挂在 base-path 根。 |
| `--web-ui-dir <path>` | `AI_MEMORY_WEB_UI_DIR` | 从 `<path>` 服务自定义 SPA 替代内置浏览器。ai-memory 注入 `<base href>` 与 `<meta name="ai-memory-base-path">`，让 SPA 能在配置前缀下构建相对 URL 与 API 调用。 |
| `--cors-allow-origin <origin>` | `AI_MEMORY_CORS_ALLOW_ORIGINS`（CSV） | 允许列出的源调用 `/api/v1`。层只作用于该路由——`/mcp`、`/hook`、`/admin`、`/web` 保持源锁定。 |
| _（仅配置）_ | `AI_MEMORY_HOOK_RATE_PER_SEC`、`AI_MEMORY_HOOK_RATE_BURST` | 可选的逐行为者/会话钩子摄取令牌桶。未设/`0` 率禁用；突发默认等于率（启用时最少一令牌）。 |

macOS 见 [macOS 支持](/macos/)；用匹配你架构的归档：Apple Silicon 用 `aarch64`、Intel 用 `x86_64`。Windows 见 [Windows 支持](/windows/)。
短版：从启动智能体的同一环境跑安装命令。WSL2 启动的智能体需要 WSL 路径与 POSIX `.sh` 钩子。原生 Windows 智能体可用带标签的 `ai-memory-windows-x86_64.zip`、Docker Desktop 包装器、或源码构建。原生 Claude Code 默认用带真实 `ai-memory.exe` 的 Claude exec 形式；Windows Docker 包装器经编码的 PowerShell `.ps1` 回退命令渲染其他原生 Windows 脚本钩子智能体。

从源码运行时，`install-hooks` 自动在仓库的 `hooks/` 里找捆绑脚本。解压的发布归档也自动发现 `ai-memory` 二进制旁的同级 `hooks/` 包：

```bash
./target/release/ai-memory install-hooks --agent claude-code --auth-token "$TOKEN"
```

（这种情况下不需要 `setup-agent`——脚本已在正确的宿主路径上。）

---

## LLM 提供方层级

ai-memory 以三档强度工作：

| 档 | 得到什么 | 环境变量 | 成本 |
|---|---|---|---|
| **零 LLM**（默认） | FTS5 + 手动声明实体 + 图检索、基于规则的会话摘要、从提示词 + 工具调用历史来的自动交接 | （无） | $0 |
| **+ LLM 整编** | LLM 把会话页重写为连贯叙事；PreCompact 检查点；LLM 驱动的矛盾 lint | `AI_MEMORY_LLM_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` | ~$0.01–0.05 / 会话 |
| **+ 订阅式 Anthropic** | 同样的 LLM 功能，用 Claude Pro/Max 订阅而非 API key | `AI_MEMORY_LLM_PROVIDER=anthropic-oauth` + `ANTHROPIC_OAUTH_TOKEN` | 用你的 Claude 订阅 |
| **+ ChatGPT/Codex OAuth** | 同样的 LLM 功能，用 ChatGPT Pro/Plus 登录而非 OpenAI Platform key | `AI_MEMORY_LLM_PROVIDER=openai-oauth` + `ai-memory auth login openai-oauth` | 用你的 ChatGPT 订阅 |
| **+ GitHub Copilot** | 同样的 LLM 功能，用 GitHub Copilot 订阅 | `AI_MEMORY_LLM_PROVIDER=copilot` + `ai-memory auth login copilot` 或 `COPILOT_GITHUB_TOKEN` | 用你的 Copilot 订阅 |
| **+ LLM 重排** | 对至多 30 个有界项目/scopes 检索候选至多一次相关度重排；无效、失败、超时或并发饱和的响应保持正常顺序 | `AI_MEMORY_RERANKER=llm` + 任意已配置 LLM 提供方 | 每个合格查询一次 LLM 调用，并发至多四 |
| **+ 混合检索** | 在 FTS5 + 实体 + 图 RRF 之外加向量余弦相似度。改述查询召回更好 | `AI_MEMORY_EMBEDDING_PROVIDER=openai` + `OPENAI_API_KEY` | 回填 ~$0.0001 / 页 |

### 推荐模型（作为默认选择）

只设提供方时，ai-memory 选一个合理默认：

| 设置 | 默认 | 为什么 |
|---|---|---|
| `AI_MEMORY_LLM_PROVIDER=anthropic` | `claude-haiku-4-5` | **推荐默认。**速度、克制与分类质量的最佳平衡。不是推理模型。稳定把持久项目规则分类为 `kind: rule`。 |
| `AI_MEMORY_LLM_PROVIDER=anthropic-oauth` | `claude-sonnet-4-6` | 经 Claude 订阅的 Anthropic。跑一次 `claude setup-token`；设 `ANTHROPIC_OAUTH_TOKEN`（或 `CLAUDE_CODE_OAUTH_TOKEN`）。不需要 `ANTHROPIC_API_KEY`。同一 `/v1/messages` 端点、Bearer token 认证。 |
| `AI_MEMORY_LLM_PROVIDER=openai` | `gpt-5.4-mini` | 更便宜 + 更快的替代。同样解析可靠性；薄会话上轻度过度分类。 |
| `AI_MEMORY_LLM_PROVIDER=openai-oauth` | `gpt-5.5` | ChatGPT/Codex 后端。跑一次 `ai-memory auth login openai-oauth`；ai-memory 把 refresh token 存进 `<data_dir>/auth.json` 并自动刷新 access token。 |
| `AI_MEMORY_LLM_PROVIDER=copilot` | `gpt-5.5` | GitHub Copilot Chat 后端。ai-memory 在 `<data_dir>/auth.json` 存 GitHub 用户令牌、换成短期 Copilot API 令牌、到期前刷新。 |
| `AI_MEMORY_LLM_PROVIDER=gemini` | `gemini-3.5-flash` | Google 托管、免费额度大方的选项。ai-memory 关掉 Gemini 3.5 Flash 默认的动态思考，让隐藏思考 token 不截断严格 JSON。设 `GEMINI_API_KEY`（或 `GOOGLE_API_KEY`）。 |
| `AI_MEMORY_LLM_PROVIDER=opencode` | `claude-sonnet-4-6` | [OpenCode Zen/Go](https://opencode.ai) 云 API——OpenAI 兼容端点 `opencode.ai/zen/go/v1`。设 `OPENCODE_API_KEY`（key 来自 `opencode.ai/auth`）。别名：`opencode-zen`。 |
| `AI_MEMORY_EMBEDDING_PROVIDER=openai` | `text-embedding-3-small`（1536 维） | 比 `-3-large` 便宜 5 倍、召回损失边际。 |
| `AI_MEMORY_EMBEDDING_PROVIDER=openai` + `AI_MEMORY_EMBEDDING_BASE_URL=https://openrouter.ai/api/v1` | 经 [OpenRouter](https://openrouter.ai) 的 `openai/text-embedding-3-small` | 复用 `LLM_API_KEY` 或 `OPENAI_API_KEY` 配 OpenAI 兼容嵌入客户端。 |
| `AI_MEMORY_EMBEDDING_PROVIDER=openai` + `AI_MEMORY_EMBEDDING_BASE_URL=https://api.orcarouter.ai/v1` | 经 [OrcaRouter](https://www.orcarouter.ai) 的 `openai/text-embedding-3-small` | 复用 `LLM_API_KEY` 配 OpenAI 兼容嵌入客户端。 |
| `AI_MEMORY_EMBEDDING_PROVIDER=voyage` | `voyage-3`（1024 维） | Voyage 当前的通用推荐。 |
| `AI_MEMORY_EMBEDDING_PROVIDER=google` / `gemini` | `gemini-embedding-001`（768 维） | 经 `embedContent` 的 Google 托管嵌入。设 `GEMINI_API_KEY`（或 `GOOGLE_API_KEY`）。 |
| `AI_MEMORY_EMBEDDING_PROVIDER=openai-compat` | 无默认——显式设模型、维度与 base URL | 自托管引擎（Ollama、LM Studio、vLLM）。默认免密钥；`LLM_API_KEY` 存在时作为 bearer token 发送（网关）。例：`AI_MEMORY_EMBEDDING_BASE_URL=http://localhost:11434/v1`、`AI_MEMORY_EMBEDDING_MODEL=nomic-embed-text`、`AI_MEMORY_EMBEDDING_DIM=768`。把既有 `openai`+base-URL 设置切到 `openai-compat` 会改存储的 `{provider, model, dim}` 三元组——跑 `ai-memory embed --force` 重嵌。 |

> **不推荐：**推理模式模型（开 extended thinking 的 Claude、GPT-o3、Gemini "thinking" 变体）——它们把 token 预算烧在内部推理上，遇到严格 JSON 的整编提示词会挂起或输出空响应。非用不可就关推理。

### 经 Claude 订阅接入 Anthropic（OAuth）

> [!WARNING]
> **非官方且违背 Anthropic 使用政策——风险自负。**
> Anthropic 不为 Claude Pro/Max 订阅提供公开 OAuth API；这里复用 `claude setup-token` 凭据对接 `/v1/messages`，这**不是受支持或认可的集成**。Anthropic 的条款把订阅（Claude Code）访问保留给交互使用，把它当自动化 API 后端可能违反条款并**可能导致账号被限流、标记或封禁**。头部配方也无文档、可能随时变化。想要受支持的路径，用带真正 Platform API key 的 `anthropic` 提供方。我们发布它纯粹是作为选择启用的便利、对其不作任何保证。

`anthropic-oauth` 面向想用既有订阅而非 Anthropic Platform API key 的 Claude Pro/Max 订阅者。它打与 `anthropic` 提供方**同一**的 `/v1/messages` 端点——只有认证头不同（Bearer token + `anthropic-beta: oauth-2025-04-20`）。

```bash
# 用 Claude Code CLI 一次性获取 token：
claude setup-token

# 然后导出（CLI 也可能自动写 CLAUDE_CODE_OAUTH_TOKEN）：
export ANTHROPIC_OAUTH_TOKEN=<paste token here>
export AI_MEMORY_LLM_PROVIDER=anthropic-oauth
ai-memory serve
```

Docker 用环境变量传 token：

```bash
docker run -d --name ai-memory \
    -p 127.0.0.1:49374:49374 \
    -v ai-memory-data:/data \
    -e AI_MEMORY_LLM_PROVIDER=anthropic-oauth \
    -e ANTHROPIC_OAUTH_TOKEN=<token> \
    akitaonrails/ai-memory:latest
```

接受 `ANTHROPIC_OAUTH_TOKEN` 与 `CLAUDE_CODE_OAUTH_TOKEN`；ai-memory 先查 `ANTHROPIC_OAUTH_TOKEN`。任一变量在宿主上导出时，POSIX 与 PowerShell Docker 包装器按名字把它转发给 `llm-test` 这类短命辅助命令；token 值由 Docker 继承而非放进包装器命令行。长驻服务器容器仍需要自己的环境里有提供方与 token 变量，如上例。

两个 Anthropic 提供方，ai-memory 对 Claude 4.7 及之后的模型与 Claude Mythos Preview 省略 `temperature`，因为那些模型拒绝非默认采样参数。`llm-test` 刻意以与 bootstrap 和整编相同的代表性 0.2 值起步，然后在发请求之前走一遍提供方的兼容归一化。

> [!TIP]
> **选小而快的模型。** ai-memory 的 LLM 工作——会话整编、lint、explore——是摘要/提取、不是硬推理，Haiku 级模型绰绰有余：更快、更便宜、对订阅限速远比 Sonnet/Opus 友好。设如 `AI_MEMORY_LLM_MODEL=claude-haiku-4-5`。把高投入思考模型留给你的编码智能体。

### OpenAI OAuth / Codex

`openai-oauth` 面向 ChatGPT Pro/Plus/Codex 账号。它**不**用 `OPENAI_API_KEY`、**不**调 `api.openai.com`；请求带可刷新 OAuth token 去往 ChatGPT/Codex Responses 后端。

Docker 快速开始包装器下，它写进服务器挂在 `/data` 的同一具名卷：

```bash
ai-memory auth login openai-oauth
docker run -d --name ai-memory \
    -p 127.0.0.1:49374:49374 \
    -v ai-memory-data:/data \
    -e AI_MEMORY_LLM_PROVIDER=openai-oauth \
    akitaonrails/ai-memory:latest
```

远程 Docker 宿主上，在该宿主上对同一容器或数据卷跑登录：

```bash
docker exec -it ai-memory ai-memory auth login openai-oauth
```

用 `ai-memory auth status` 查 token 是否存在、`ai-memory auth logout openai-oauth` 移除它。

> [!TIP]
> **选小而快的模型。**整编 / lint / explore 是摘要任务、不是硬推理——mini 级模型绰绰有余且对订阅限速友好得多。设如 `AI_MEMORY_LLM_MODEL=gpt-5-mini`（默认 `gpt-5.5` 可用但对此工作负载过重）。把高投入推理模型留给你的编码智能体。

### GitHub Copilot

`copilot` 用一个 GitHub 用户令牌，然后经 `https://api.github.com/copilot_internal/v2/token` 换短期 Copilot API 令牌。原始 GitHub 令牌绝不发给 `api.githubcopilot.com`。

Docker 快速开始包装器：

```bash
ai-memory auth login copilot
docker run -d --name ai-memory \
    -p 127.0.0.1:49374:49374 \
    -v ai-memory-data:/data \
    -e AI_MEMORY_LLM_PROVIDER=copilot \
    akitaonrails/ai-memory:latest
```

远程 Docker 宿主上，对同一数据卷跑登录：

```bash
docker exec -it ai-memory ai-memory auth login copilot
```

非交互部署可改设 `COPILOT_GITHUB_TOKEN`。原生运行时 ai-memory 还接受 `GH_TOKEN` 与 `GITHUB_TOKEN`；Docker 里偏好显式 `COPILOT_GITHUB_TOKEN`，免得意外传宽令牌。有预铸造 Copilot API 令牌的高级用户可设 `GITHUB_COPILOT_API_TOKEN` 与可选 `COPILOT_API_URL`。

`auth login copilot` 默认用 GitHub Copilot 的公共设备流 client id。运营自己的 OAuth 应用时传 `--client-id` 或设 `AI_MEMORY_COPILOT_CLIENT_ID`。

### OpenAI 兼容提供方（Ollama / vLLM / LM Studio / 托管 API）

```bash
docker run -d --name ai-memory \
    -p 49374:49374 \
    -v ai-memory-data:/data \
    -e AI_MEMORY_AUTH_TOKEN="$TOKEN" \
    -e AI_MEMORY_LLM_PROVIDER=openai-compat \
    -e AI_MEMORY_LLM_BASE_URL=http://host.docker.internal:11434/v1 \
    -e AI_MEMORY_LLM_MODEL=qwen2.5-coder:14b \
    akitaonrails/ai-memory:latest
```

`openai-compat` 没有安全的默认模型；该环境变量必需。OpenRouter（Kimi、DeepSeek 等）：

```bash
-e AI_MEMORY_LLM_PROVIDER=openai-compat
-e AI_MEMORY_LLM_BASE_URL=https://openrouter.ai/api/v1
-e AI_MEMORY_LLM_MODEL=moonshotai/kimi-k2.6
-e LLM_API_KEY=sk-or-v1-...
```

[Atlas Cloud](https://www.atlascloud.ai/models/qwen/qwen3.5-flash) 用同一提供方；不需要 Atlas 专属的 ai-memory 提供方。其 API key 经通用兼容凭据传：

```bash
-e AI_MEMORY_LLM_PROVIDER=openai-compat
-e AI_MEMORY_LLM_BASE_URL=https://api.atlascloud.ai/v1
-e AI_MEMORY_LLM_MODEL=qwen/qwen3.5-flash
-e LLM_API_KEY="$ATLASCLOUD_API_KEY"
```

需要时把模型换成其他当前 Atlas 模型 id。ai-memory 不为托管兼容端点选默认。

[OrcaRouter](https://www.orcarouter.ai) 用同一提供方；不需要 OrcaRouter 专属的 ai-memory 提供方。其 API key 经通用兼容凭据传：

```bash
-e AI_MEMORY_LLM_PROVIDER=openai-compat
-e AI_MEMORY_LLM_BASE_URL=https://api.orcarouter.ai/v1
-e AI_MEMORY_LLM_MODEL=openai/gpt-4o
-e LLM_API_KEY=sk-orca-...
```

需要时把模型换成其他当前 OrcaRouter 模型 id（与 OpenRouter 相同的 `provider/model` 格式，如 `anthropic/claude-sonnet-4.6` 或 `deepseek/deepseek-v4-flash`）。

OpenAI 兼容结构化调用默认用操作的 JSON Schema：

```bash
-e AI_MEMORY_LLM_COMPAT_STRICT=true
```

现代 Ollama、vLLM、LM Studio、llama.cpp 与网关端点尊重这个 OpenAI 式 `response_format=json_schema` 请求。端点显式拒绝结构化输出字段或返回畸形响应形状时，ai-memory 用宽容解析器重试。不兼容端点退出：

```bash
-e AI_MEMORY_LLM_COMPAT_STRICT=false
```

把长补全流过默认 300 秒逐请求上限的托管网关以 `http: error sending request` 失败；调高上限匹配网关最坏生成时间：

```bash
-e AI_MEMORY_LLM_TIMEOUT_SECS=900
```

#### 让整编预算匹配本地模型的上下文窗口

整编默认约 100k token 输入目标加 32k 输出上限，为 200k 上下文的提供方定尺。窗口较小的本地模型可能拒绝整个请求（llama.cpp 的 `exceed_context_size_error`、多数网关的 HTTP 400）。调低两个限额让它们的和塞进真实上下文窗口、并给分词器差异留余量：

```bash
# 例如以 8k 上下文窗口加载的模型
-e AI_MEMORY_CONSOLIDATION__MAX_INPUT_TOKENS=6500
-e AI_MEMORY_CONSOLIDATION__MAX_OUTPUT_TOKENS=1000
```

双下划线分隔 `[consolidation]` 节与各键。输入目标计入渲染观察、当前页正文、系统提示词、页面约定、有界槽位快照、结构化输出 schema 与提供方信封预留。分词器各异，所以这是保守估计而非精确提供方 token 计数。自动检查点提供方失败降级为规则页而不丢检查点，但尺寸合适的限额才让 LLM 整编成功。启动拒绝低于 6,000 的输入目标与低于 1,000 的输出上限——批量 schema 与有用响应在那些地板之下放不下。

---

## 常用子命令

这是操作短清单。权威完整命令树跑 `ai-memory --help`。

对 docker 部署调用子命令的两种方式：

```bash
# A) 对运行中容器（有状态：status、search、backup、
#    checkpoints、restore-page、audit-contamination、forget-sweep、lint、embed）。
docker exec ai-memory ai-memory status --json
docker exec ai-memory ai-memory search "karpathy"
docker exec ai-memory ai-memory backup --to /data/snapshot.tar.gz

# B) 一次性，纯 stdout 辅助命令无需运行中容器
#    （generate-auth-token、completions、install-mcp、install-hooks、setup-agent、
#    llm-test）。
#    auth login 有状态：用 docker exec 对运行中容器或包装器，
#    让它写进服务器同一数据卷。
docker run --rm akitaonrails/ai-memory:latest generate-auth-token
docker run --rm akitaonrails/ai-memory:latest completions zsh
docker run --rm akitaonrails/ai-memory:latest install-mcp --client cursor
docker run --rm akitaonrails/ai-memory:latest --help     # 完整子命令树
```

| 子命令 | 模式 | 作用 |
|---|---|---|
| `serve` | `docker compose up -d`（已完成） | 跑 HTTP MCP 服务器 |
| `run [harness] [args...]` | 宿主包装器或原生二进制 | 选择启用一条托管跨外壳工作流；省略外壳恢复最新可用本地会话，或显式点名 Claude Code、Codex、OpenCode、Pi、Crush、Kimi Code、Command Code、Kiro CLI v2/v3、OMP、Grok Build CLI、Antigravity CLI；确切的 `--yolo` 与 `--fresh` 归包装器所有、其余原生参数透传 |
| `show [--json]` | 宿主包装器或原生二进制 | 选一个客户端本地检出与已安装托管外壳，或不启动地返回结构化发现数据；远程服务器绝不提供检出路径 |
| `continue [--workspace NAME]` | 宿主包装器或原生二进制 | 从任意目录重新校验并恢复最新的客户端本地托管检出；接受 `--yolo` 与 `--fresh` 但不接受外壳原生参数 |
| `workstream-search [query]` | 托管子进程或瘦 HTTP 客户端 | 检索完整可见的托管工作流台账；托管子进程自动收到其工作流 id |
| `status` | `docker exec` | 计数、路径、派生索引诊断与被动 LLM/嵌入提供方健康 |
| `search "<query>"` | `docker exec` | wiki FTS5 检索 + 有界来源权威度；实体/图/向量 RRF 用 MCP `memory_query` |
| `write-page` | `docker exec` | 手工页面写入（原子 + 索引） |
| `backup --to` / `restore --from` | `docker exec` | 快照或恢复数据目录 |
| `checkpoints` / `restore-page` | `docker exec` | 列 wiki git 检查点或恢复一页 markdown 并重建索引 |
| `audit-contamination` | `docker exec` | 只读结构审计，找可能的跨项目污染 |
| `forget-sweep` / `lint` / `embed` | `docker exec` | 手工维护；清扫 + lint 默认也在服务器计划上跑 |
| `commit -m "…"` | `docker exec` | 暂存 + 提交 wiki 树 |
| `reset --confirm` | `docker exec` | 擦数据（兄弟进程活着时拒绝） |
| `generate-auth-token` | `docker run --rm` | 打印随机十六进制 bearer token |
| `auth login openai-oauth` | 与服务器同一数据卷 | 为可选 `openai-oauth` LLM 提供方存 ChatGPT/Codex OAuth refresh token |
| `auth login copilot` | 与服务器同一数据卷 | 为可选 `copilot` LLM 提供方存 GitHub 令牌 |
| `auth login oidc-device` | 与原生钩子及瘦客户端 CLI 同一开发者数据目录 | 为原生钩子认证与 HTTP CLI 回退认证存逐开发者 OIDC 设备令牌 |
| `install-mcp --client` | `docker run --rm` | 逐客户端 MCP 配置片段 |
| `install-hooks --agent` | `docker run --rm` | 面向既有钩子目录的钩子配置片段 |
| `setup-agent --agent --to --host-prefix` | `docker run --rm -v` | 提取捆绑脚本 + 打印配置（一次性） |
| `install-instructions [--target] [--print] [--no-skills]` | 智能体提示词文件所在的宿主环境 | 安装或更新轻量 CLAUDE.md / AGENTS.md 路由块，默认连带托管 ai-memory 智能体技能 |
| `install-skills [--scope] [--agent]` | 智能体技能目录所在的宿主环境 | 只安装或更新托管 ai-memory 智能体技能 |
| `uninstall --apply` | 与安装相同的宿主环境 | 内容/标记校验后只移除 ai-memory 拥有的钩子、MCP 条目、指令块、托管技能文件与生成的插件文件。自定义 MCP 端点用 `--mcp-url`；只需收窄移除时用 `--mcp-name`。 |
| `llm-test --provider …` | `docker run --rm -e …` | 冒烟测试 LLM 提供方 |
| `completions <shell>` | `docker run --rm` 或原生二进制 | 打印 bash/zsh/fish/PowerShell/elvish 补全脚本；见 [Shell 补全](/shell-completions/) |

### 托管路由片段与智能体技能

ai-memory 的路由安装是面向智能体的提示词包装。它不加运行时技能路由器，`SKILL.md` 文件不是持久记忆页。wiki 保持为持久事实源。

`ai-memory install-instructions` 现在默认写两个托管提示词工件：

1. `CLAUDE.md`、`AGENTS.md`、或 `--target` 传入文件里的轻量指令块。块由独占一行的 `<!-- ai-memory:start -->` 与 `<!-- ai-memory:end -->` 分隔符界定。
2. 含详细工具路由指引的托管 ai-memory 智能体技能。

重跑安全。项目仍有行锚定标记之间的旧长 ai-memory 块时，刷新就地替换该块为轻量片段、前后无关指令不动、并在改既有文件前写带时间戳的 `.bak-*` 备份。托管技能文件含 ai-memory 所有权标记；无标记的同名用户技能保留——除非你显式强制替换。`install-instructions --print` 只预览指令片段；想预览托管技能 payload 跑 `install-skills --print`。

`install-instructions` 的技能标志：

| 标志 | 含义 |
|---|---|
| `--no-skills` | 只刷新带标记的指令块。 |
| `--skills-scope <scope>` | 选项目本地或用户全局技能根。值：`project`、`global`。默认 `project`。 |
| `--skills-agent <agent>` | 选 `.claude/skills`、`.agents/skills`、`.devin/skills`、`.grok/skills`、或 Claude/Agents 双根。值：`claude-code`、`agents`、`devin`、`grok`、`both`。默认：`CLAUDE.md` 目标隐含 `claude-code`、`AGENTS.md` 目标隐含 `agents`、两个指令文件都在时隐含 `both`。 |
| `--skills-target-dir <dir>` | 把托管技能目录写在显式根之下，而非从作用域与智能体推断。 |
| `--skills-force` | `install-instructions` 期间替换未托管同名技能；不带它时那些不动、命令以可操作的错误退出。 |

指令块已正确、只需刷新智能体技能文件时用 `install-skills`：

```bash
ai-memory install-skills
ai-memory install-skills --scope global --agent agents
ai-memory install-skills --scope global --agent devin
ai-memory install-skills --scope global --agent grok
ai-memory install-skills --agent both --print
ai-memory install-skills --target-dir .custom/skills --force
```

`install-skills` 标志：

| 标志 | 含义 |
|---|---|
| `--scope <scope>` | 装进此项目或当前用户的全局技能根。值：`project`、`global`。默认 `project`。 |
| `--agent <agent>` | 装进 Claude Code、跨智能体、Devin、Grok 的技能根或 Claude/Agents 双根。值：`claude-code`、`agents`、`devin`、`grok`、`both`。默认 `claude-code`。 |
| `--target-dir <dir>` | 把托管技能目录写在显式根之下；忽略 `--scope` 与 `--agent`。 |
| `--print` | 打印目标路径与 `SKILL.md` 内容而不写文件。 |
| `--force` | 替换未托管同名技能；不带它时保留用户自写同名技能。 |

默认技能目标根：

| 作用域 | `--agent claude-code` | `--agent agents` | `--agent devin` | `--agent grok` |
|---|---|---|---|---|
| `project` | `.claude/skills` | `.agents/skills` | `.devin/skills` | `.grok/skills` |
| `global` | `~/.claude/skills` | `~/.agents/skills` | Windows：`%APPDATA%\devin\skills`；非 Windows：`~/.devin/skills` | `$GROK_HOME/skills`（默认 `~/.grok/skills`） |

每个托管技能写成 `<root>/<skill-name>/SKILL.md`。

`ai-memory uninstall --only skills --apply` 在校验 ai-memory 所有权标记后，只从上面默认项目/全局根移除托管技能文件。用 `--target-dir` 或 `--skills-target-dir` 安装的自定义根手工清理。

容器内数据目录是 `/data`（经 compose 卷挂载）。docker 外用 `AI_MEMORY_DATA_DIR=/path` 覆盖。

计划性维护在 `config.toml` 的 `[maintenance]` 配置。默认基于规则的 lint 与遗忘清扫每日在钩子延迟之外跨每个既有 workspace/项目运行。嵌入回填受支持但默认关闭，因为它可能调用付费提供方；配置嵌入器后启用 `embedding_backfill_interval_secs` 的话，每个计划节拍回填每个既有 workspace/项目、提供方用量相应增加。

遗忘清扫与基于规则的 lint 持久化其最后成功完成。重启时，未到期的任务只等剩余间隔；从未跑或过期的任务在有界启动延迟后跑一次。失败运行不记为成功、在有界延迟后重试。嵌入回填保持选择启用、保持仅间隔行为（无启动补跑）。

---

## 项目中途 bootstrap

把 ai-memory 采用进一个已有历史的项目时，wiki 从空开始。`ai-memory bootstrap` 摄取项目既有历史成种子页，让第一个会话有温热上下文。

```bash
cd /path/to/project
ai-memory bootstrap
```

装了快速开始的 Docker 包装器且服务器在 `127.0.0.1:49374` 上时，包装器自动从其短命辅助容器够到宿主环回服务器。只在服务器远程或用自定义主机/端口时设 `AI_MEMORY_SERVER_URL=http://<server>:49374`。

**默认摄取什么：**

| 来源 | 优先级（超预算时先丢） |
|---|---|
| `CLAUDE.md` / `AGENTS.md`（项目规则） | 永不丢 |
| 仓库根的 `README.md` | 非常晚 |
| `docs/**/*.md` | 晚 |
| 有实质内容的 git 提交（正文 >120 字符或有约定式提交前缀） | 中 |
| `**/*.rs` 里的模块级 `//!` 文档注释 | 最先丢 |

**标志：**

```
--repo-path <PATH>         （默认：git rev-parse --show-toplevel）
--workspace <NAME>         （默认：最近的 .ai-memory.toml 标记的
                            workspace，否则 "default"）
--project <NAME>           （默认：标记钉住时的 project，否则从 cwd 派生——
                            经 git rev-parse --show-toplevel 取主仓库根的
                            basename，无仓库时 basename(cwd)。
                            "scratch" 只是钩子事件无可用 cwd 时的
                            防御性回退。）
--max-input-tokens N       （默认：150000；修剪后的总源预算）
--chunk-input-tokens N     （默认：24000；每次 LLM 调用；0 = 单次调用）
--since "30 days ago"      （git log 过滤；支持 "N days/months/years ago" + YYYY-MM-DD）
--exclude-git              （跳过提交历史）
--exclude-readme           （跳过 README）
--exclude-docs             （跳过 docs/**/*.md）
--exclude-code             （跳过 Rust 模块头）
--dry-run                  （收集 + 估计但不调 LLM 不写）
--force                    （重新 bootstrap，覆盖先前 manifest）
```

**成本。**经 OpenRouter 用 Kimi 2.6（$0.73/$3.49 每百万）：
- 5 万输入 token 上限 → 输入最坏约 $0.04
- 1-2k 生成 token → 输出约 $0.007
- 合计：每次远低于 $0.20。

**幂等性。**首次运行产出逐项目的 `bootstrap.md` manifest（在 `<wiki>/<workspace>/<project>/bootstrap.md`），列出每个生成的页面 + 一段理由。不带 `--force` 重跑报错。想要干净的重新 bootstrap 就删 manifest（及生成的页面）。

**先 dry-run。**真实调用之前总值得做——看哪些源真的会发 + 代表多少 token。输出为 stdout 的 JSON。

```bash
ai-memory bootstrap --dry-run
{
  "sources_collected": 117,
  "sources_sent": 22,
  "sources_dropped": 95,
  "estimated_input_tokens": 48760,
  "pages_written": [],
  "rationale": "(dry-run; LLM not invoked)",
  "dry_run": true,
  "llm_chunks": 1
}
```

大仓库（如数年 git 历史）在 POST 之前客户端修剪，然后按顺序 LLM 分块处理，不超提供方上下文限制。CLI 在 dry-run 与最终结果里记录 `llm_chunks`。

**告诫：LLM 编造细节。**bootstrap 运行可能产出貌似合理却错误的页面（LLM 不了解你的项目，它在从 git 历史推断）。wiki 正是为此做了 git 版本化、可恢复：审阅落了什么，`docker exec ai-memory git -C /data/wiki diff HEAD~1`，不对就回退。

## 日志与只读沙箱

CLI 与服务器把按日滚动的日志写进 `<data_dir>/logs/`（默认 `~/.local/share/ai-memory/logs/`）。该位置不可写时——像 [ai-jail](https://github.com/akitaonrails/ai-jail) 这类沙箱把 `$HOME` 挂只读或当一次性 tmpfs——ai-memory 降级而非失败：先回退 OS 临时目录、再回退仅 stderr 日志，每步打印失败的确切路径。命令无论如何继续工作。想在沙箱里保留持久文件日志（与持久钩子暂存），把数据目录读写映射进来，如 `ai-jail --rw-map ~/.local/share/ai-memory …`。

## 无认证运行

仅本地/单机部署可以跳过 bearer token：

```bash
docker run -d --name ai-memory \
    -p 127.0.0.1:49374:49374 \
    -v ai-memory-data:/data \
    akitaonrails/ai-memory:latest
```

注意绑定：`127.0.0.1:49374`、不是 `0.0.0.0:49374`。这是关键的配对——**无 bearer token 且仅环回**是唯一安全的组合。服务器在接受请求之前拒绝无认证的局域网绑定。`--allow-insecure-no-auth` 只为刻意的危险明文 HTTP 部署覆盖那个拒绝；偏好 `AI_MEMORY_AUTH_TOKEN` 或环回。

在*容器*里那个拒绝变成警告，因为容器为了 `-p` 生效必须在内部绑 `0.0.0.0`、也看不见你发布到了宿主的哪个地址。上面的 `-p` 因此在做真正的工作：它保持该容器仅环回。改成发布到局域网地址的话，同时设 `AI_MEMORY_AUTH_TOKEN`。

然后接智能体 CLI。两条命令默认无认证、`http://127.0.0.1:49374`——本地场景无需额外标志：

```bash
ai-memory install-mcp   --client claude-code --apply
ai-memory install-hooks --agent  claude-code --apply
```

安装的 Docker 包装器在短命辅助容器里跑 CLI 命令。本地环回服务器下，它自动把那个辅助容器桥接回宿主的 `127.0.0.1:49374`，所以 `ai-memory status`、`ai-memory search`、`ai-memory bootstrap` 用与生成的智能体配置相同的默认 URL 工作。

#### SELinux enforcing 宿主

Fedora、RHEL、openSUSE 这类 SELinux enforcing 的 Linux 系统上，正常的家目录标签可能在 UID 与 GID 都匹配宿主用户时仍阻止辅助容器够到智能体配置。包装器同时检查宿主 enforcing 模式与引擎宣传的安全选项。对触碰宿主文件的短命辅助命令（`install-*`、`setup-agent`、`uninstall`、`backup`、`restore`、`bootstrap`），它加 `--security-opt label=disable`；用具名数据卷与隐式配置的瘦客户端命令保持受限。显式 `--config` 路径或有效的宿主背书 `AI_MEMORY_DATA_DIR` 也激活宿主文件待遇。这只为那次受信辅助调用放宽 SELinux 标签限制。它不改用引擎管理的具名卷的长驻 ai-memory 服务器。

`bootstrap` 在那个清单里，即便它只*读*宿主文件：未映射的 UID 与受限标签同样堵死读，而且失败有误导性——它静默降级到 `no .git found at /work; bootstrapping from README/docs/rules only` 再以 `Permission denied (os error 13)` 死掉。

两个引擎在不同键下报告这些事实。Docker 答 `docker info --format '{{.SecurityOptions}}'`；podman 没有该字段、模板失败，所以 Docker 探测为空时包装器回退 podman 的 `{{.Host.Security.Rootless}}` 与 `{{.Host.Security.SELinuxEnabled}}`。Rootless 引擎额外需要 `-u 0:0`，因为只有容器 UID 0 映射回调用的宿主用户——rootless podman 加 SELinux enforcing 下两个调整都需要、单独任何一个都不够写落。

不要给包装器的整个 `$HOME` 绑定加 `:z` 或 `:Z`。Docker 的[绑定挂载文档](https://docs.docker.com/engine/storage/bind-mounts/#configure-the-selinux-label)警告重打 `/home` 这类系统目录的标签可能让宿主不可用。Docker 在 [`docker run` 安全选项](https://docs.docker.com/reference/cli/docker/container/run/#security-opt)里文档化了 `label=disable`。

`ai-memory run`、`ai-memory show`、`ai-memory continue` 是例外：当前包装器拦截它们并在宿主上启动缓存的校验和验证过的原生客户端——本地检出、外壳可执行文件与会话存储都在那里。它保留显式远程 `AI_MEMORY_SERVER_URL`。这些命令中若日志出现 `data_dir=/data`、找不到检出、或找不到 `codex`、`claude` 等宿主可执行文件，就在那台客户机上跑 `ai-memory upgrade` 刷新过期包装器。

### Docker compose 替代

偏好 compose 的话，克隆仓库并跑：

```bash
docker compose -f docker/docker-compose.yml up -d
```

捆绑的 compose 文件已有 `restart: unless-stopped`、健康检查与接好的具名卷。智能体设置与常规 Docker 路径相同。

---

## 保持 ai-memory 最新

包装器至多每 24 小时查一次 Docker Hub、有更新镜像时打一行警告。升级用：

```bash
ai-memory upgrade
```

该命令从最新 GitHub Release 下载包装器及其 SHA-256 校验和、拒绝未验证的更新、拉最新 Docker 镜像、为已配置智能体重暂存 `~/.local/share/ai-memory/hooks/<agent>/` 下的钩子脚本、并打印如何重启服务器容器以使用新二进制。重跑 `install-hooks --apply` 保持幂等：ai-memory 只替换它拥有的钩子条目、不动无关钩子。

设 `AI_MEMORY_NO_VERSION_CHECK=1` 静音每日检查。想把包装器自升级钉到 fork 或带标签发布，设 `AI_MEMORY_WRAPPER_URL=<url>`；除非同时设了 `AI_MEMORY_WRAPPER_SHA256_URL=<checksum-url>`，包装器要求 `<url>.sha256`。

升级后的服务器启动时自动应用 SQLite schema 迁移与待处理的 wiki 结构迁移。正常升级无需手工数据库重置或 wiki 重写。

服务器跑在另一台宿主上时，`ai-memory upgrade` 只刷新本地包装器、本地镜像与本地钩子脚本。在那台部署目录用 `bin/deploy` 或 `docker compose pull && docker compose up -d` 单独重新部署远程服务器。

在 ai-jail 或其他 bwrap 沙箱内，包装器可从沙箱使用，但 `install-*` 命令在沙箱外跑——它们写 `~/.local/share/ai-memory/hooks/`。

---

## 另见

- [部署到家庭实验室](/deploy/)——家庭实验室部署走查
  （`bin/deploy`、cloudflared TLS、env 文件管理）
- [日常使用](/usage/)——交接、主动查询、Web UI、轻量路由片段 + 托管智能体技能、从其他记忆工具迁移、裸 wiki 检视
- [MCP 安装](/mcp-install/)——[README 支持矩阵](/#支持矩阵)里每个客户端的逐客户端 MCP 配置参考
- [架构](/architecture/)——ai-memory 里面实际在跑什么
