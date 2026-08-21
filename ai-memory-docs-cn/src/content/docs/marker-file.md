---
title: "标记文件：.ai-memory.toml"
description: "声明智能体的 cwd 属于哪个 workspace（以及可选的哪个 project），不依赖目录的 basename。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/marker-file.md"
---

# 标记文件（marker file）：`.ai-memory.toml`

声明智能体的 `cwd` 属于哪个 workspace（以及可选的哪个 project），不依赖目录的 basename。

## 为什么需要

ai-memory 用 `(workspace, project)` 给每个 wiki 页面划命名空间。默认 `workspace = "default"`、`project = basename($cwd)`。这对 `~/projects/<repo>` 里的独立开发者够用，但这个标记文件为之而生的场景就吃不开了：

- **多客户咨询**：`~/projects/<client>/<repo>`——每个客户应落进专属 workspace，而不是 "default"。
- **工作 / 个人 / 开源分离**：想按生活语境隔离的独立开发者。
- **Mono 仓库**：想让所有包共享一个项目（而不是每个包一个 basename 桶）——或者每个包各自一个项目，随你。

标记文件让你无需 fork ai-memory 或逐目录跑 CLI 命令就能声明这些映射。

## 放在哪

`.ai-memory.toml` 放在 `cwd` 的**任何允许祖先**目录。生命周期钩子从 `cwd` 向上走到 `$HOME`（未设 `$HOME` 则走到 `/`），用找到的**第一个**标记。cwd 在 `$HOME` 之外时，走到最近的检出根（`.git` 文件或目录）为止；检出之外只检查 cwd 本身。更近的标记覆盖更远的。找到标记时，钩子脚本也转发当前 `cwd`，让只有 workspace 的标记仍能为交接查找解析 `project = basename(cwd)`。

标记路径由 POSIX/PowerShell 钩子脚本与生成的 OpenCode / OMP / Pi / OpenClaw TypeScript 集成共享。所有情况下，标记声明了它们时，钩子捕获与交接查找都向服务器发送相同的 `cwd`、`workspace`、`project`、`project_strategy`、`drop_subagent`、`default_global`、`briefing`、`briefing_budget` 查询参数；无标记时交接查找也发送 `cwd`，让默认 `project = basename(cwd)` 路由一致工作。

## Schema

```toml
# 必需。
workspace = "movvia"

# 可选。存在时，强制本标记树内的每个 cwd 都 project = "pe-portais"。
# 省略它则让 basename(cwd) 决定项目名。
project = "pe-portais"

# 可选。省略时保持 project = basename(cwd)。设为 "repo-root" 时从主 git
# 仓库根派生项目，使关联 worktree 与子目录共享一个项目。`project`
# 存在时被忽略。
project_strategy = "repo-root"

# 可选。让本项目选择启用 drop_subagent_captures：设为 "true" 后服务器
# 接受但不存储本项目的子智能体会话捕获。多智能体外壳把一个目标扇出
# 到许多子智能体会话，其逐事件捕获可能淹没小实例；把选择启用限定在
# 这里，让丢弃不影响同一服务器上的其他项目。默认关闭（缺失 / "false"）。
drop_subagent_captures = "true"

# 可选。把本仓库的默认记忆召回拓宽到所有项目：本树内会话的无作用域
# `memory_query` 表现为 `global=true`，无作用域的 `memory_recent` 返回
# 所有项目最近的页面（每个命中标注 workspace + project）。面向经常
# 需要兄弟项目上下文的 meta 仓库。显式参数永远优先——传了
# `workspace`/`project`/`scopes`/`global` 就在那一调用上覆盖它。
# 默认关闭。注意：激活期间，无作用域查询返回跨项目的 `global_hits`
# 而非项目 `hits` + `global_scope_hits`（`_global` 偏好页仍出现在
# 全局结果里，带标注）。
[recall]
default_global = "true"

# 可选。在会话开始时（以及上下文清除后——Claude Code 在 /clear 时重触发
# SessionStart）注入编译好的项目简报：会话启动的交接取数同时返回本项目
# 的 pinned / `_rules/` / `_slots/` wiki 页面（含正文）加最近更新的页面
# 标题，让智能体带着架构上下文起步而不是重新探索代码库。追加在任何
# 待处理交接之后，且与交接不同、不会被消费——每次选择启用的会话启动
# 都重新组合。只有会话启动钩子会把 stdout 注入为上下文的智能体受益
# （Claude Code、Codex、OpenCode……）。默认关闭：简报在每次会话启动
# 都花 token，所以按仓库选择启用。Kimi Code 注意：kimi 丢弃
# SessionStart 钩子 stdout，所以那里的简报改在会话的第一条用户提示词
# 投递（每会话一次，与 Claude 相同）。其本地投递标记只为选择启用的
# 仓库创建且有界于最新 512 个会话；v1 不支持 /clear 后重新简报。
[briefing]
inject_on_session_start = "true"

# 可选。简报的字符预算（约 4 字符每 token）。超预算的正文带可见说明
# 截断；被挤出的核心页面按路径列出，智能体可 `memory_query` 它们。
# 服务端钳制到 [500, 20000]；默认 4000。
max_chars = 4000
```

`workspace` 与 `project` 的**命名规则**，服务端校验：

- 小写 ASCII、数字、点、连字符、下划线
- 正则：`^[a-z0-9][a-z0-9._-]*$`

其他取值在 `get_or_create_workspace` / `_project` 时被拒绝，以钩子警告浮出。shell 辅助脚本做防御性 URL 编码，但服务器的正则才是事实源。

`project_strategy` 只接受 `repo-root`（或 `repo_root`）。未知取值被忽略，行为同默认 `basename(cwd)` 策略。

`default_global` 与 `inject_on_session_start` 接受真值（`true` / `1` / `yes` / `on`，带引号或裸写——节式键宽松解析）；其他取值视为缺失。`max_chars` 是普通整数。

`drop_subagent_captures` 接受真值字符串（`"true"` / `"1"` / `"yes"` / `"on"`）；其他取值或缺失时，本项目的子智能体捕获照常存储。顶层（非子智能体）会话无论如何总是存储。这是刻意按项目设的：没有服务器级全局开关，所以在共享实例上让一个吵闹的项目选择启用，绝不会甩掉其他项目的子智能体捕获。

## 捕获排除（Capture exclusions）

用下面这个确切的按仓库形状 `[capture]` 加 `ignore_paths = [...]`，让匹配路径下的已识别文件工具活动不进捕获：

```toml
[capture]
ignore_paths = ["private/**", "~/personal-notes/**"]
```

**最近的** `.ai-memory.toml` 是权威；标记的节不合并。缺 `[capture]` 节或 `ignore_paths = []` 视为未激活、保持现有行为。`[capture]` 只接受 `ignore_paths`：未知键、无效的类型/glob/根、不可读的标记、或超过 64 KiB 的标记，都会让整个捕获策略失效而不是部分应用。

模式匹配整个词法归一化的路径，不是子串。只用 `*`、`?`、`**`；相对模式以标记目录为根，相对的文件工具路径从事件实际 `cwd` 解析，`~/` 展开到家目录。所有平台都用正斜杠。POSIX 匹配区分大小写；Windows 驱动器/UNC 匹配 ASCII 不区分大小写。上限：128 个模式、每模式 1,024 字符、32 个直接候选与每候选 4,096 字符、100 万次有界模式/候选比较。

对夹具验证过的直接文件工具，ai-memory 只读取显式路径字段与有文档记载的多文件调用直接数组。任一候选匹配时，整个事件在到达暂存、队列、网络、传输日志或服务器存储之前被**本地丢弃**。策略激活时，已识别的搜索/列表工具被保守丢弃；缺失或畸形的已识别文件候选、不支持的已识别 schema、或无效策略变成**仅元数据**形式。该形式只含有界的路由/工具/决策元数据，绝不含路径、模式、参数、输出、错误、标题或嵌套 payload。已知的非文件工具与未知工具保持现有行为。在传输之前排除内容之所以要紧，是因为排除后就无法再到达观察/FTS、会话页、交接、评审请求、提案或日志。

这是词法捕获边界，**不是完整的 DLP**。它不解析符号链接、junction、bind mount 或 Windows 8.3 别名。shell 命令与自由格式补丁不被解析；提示词、助手文本、通知与引用内容不可按路径归因。显式加上每个相关的可见别名，不要指望这个功能检测到私有内容的每一种被提及方式。

### 受支持的集成与刷新

捕获策略 v1 由原生 `ai-memory hook` 命令（含原生 POSIX/Windows 钩子命令）与生成的 OpenCode、OMP、Pi、OpenClaw 集成强制执行。该路径受支持时，本地安装器默认用原生命令。遗留的 `.sh`/`.ps1` 钩子与纯远程/Docker 脚本包**不**强制执行。升级后重装钩子或刷新/重装生成的插件；既有钩子/插件保持其原行为。安装器的能力输出描述所选集成。

新客户端对旧服务器保持安全，因为剥离与丢弃发生在客户端。旧客户端对新服务器保持旧行为，无法强制执行仅宿主的标记策略；服务器无法警告它从未见过的策略。该策略不增加 MCP 工具、不增加数据库迁移。

### 本地检查一个决策

`ai-memory hook --event ... --agent ... --check-capture` 从 stdin 读一个 JSON payload，不做任何暂存、队列、排放、网络或交接工作。它只打印有界的决策元数据（协议版本、策略状态、工具族、路径数、处置、提取状态），绝不含路径、模式或 payload 内容：

```bash
printf '%s\n' '{"session_id":"demo","cwd":"/example/workspace","tool_name":"Edit","tool_input":{"path":"docs/example.md"}}' \
  | ai-memory hook --event post-tool-use --agent claude-code \
      --server-url http://127.0.0.1:49374 --check-capture
```

正常捕获契约刻意收窄：受支持的 Claude Code、OpenCode、Pi 与 Antigravity 工具事件只保留规范工具族、其有文档 schema 证明存在时的智能体提供已验证调用 ID、以及 PostToolUse 结果类别。`PreToolUse` 绝不保留命令、参数、路径、输入体或任意工具名。`PostToolUse` 追加其既有的工具响应/错误摘录，并把完整渲染体钳制在 2,000 个 UTF-8 安全字节。Antigravity 的成功文件编辑事件回退到 `toolCall.args` 里有界的替换或写入内容字段，因为其钩子 payload 不含输出字段；失败的编辑保留错误。该回退仅限 Antigravity，且随任何被捕获排除拒绝的事件一起丢弃。不支持的工具信封不获得 PreToolUse 体，关联只靠匹配智能体提供的调用 ID。用户提示词存储其提示词文本，通知存储其消息/文本，压缩后存储其摘要；其他事件体除非显式支持目前为空。Stop/助手消息捕获默认关闭且从不持久化；只有安装指南描述的显式双重选择启用（客户端 `install-hooks --capture-assistant` 加服务器 `capture_assistant`）才可用，摘录双侧净化并有界。它不受本标记文件门控——助手文本不可按路径归因，`.ai-memory.toml` 无法收窄它。元数据头是封闭的；PostToolUse 的响应/错误摘录保持既有的有界内容捕获。捕获排除只在路径有已证明 schema 的地方评估，所以不声称过滤那些其他体。

## 四个典型示例

### 多客户

```
~/projects/movvia/.ai-memory.toml     → workspace = "movvia"
~/projects/cliente-x/.ai-memory.toml  → workspace = "cliente-x"
~/personal/.ai-memory.toml            → workspace = "personal"
```

结果：

- `~/projects/movvia/pe-api-core` → workspace = `movvia`，project = `pe-api-core`
- `~/projects/cliente-x/api`      → workspace = `cliente-x`，project = `api`
- `~/personal/blog`               → workspace = `personal`，project = `blog`

### 分组包的 mono 仓库

```
~/projects/movvia/.ai-memory.toml              → workspace = "movvia"
~/projects/movvia/pe-portais/.ai-memory.toml   → workspace = "movvia"
                                                  project   = "pe-portais"
```

结果：

- `~/projects/movvia/pe/pe-api-core`        → workspace = `movvia`，project = `pe-api-core`
- `~/projects/movvia/pe-portais/apps/web`   → workspace = `movvia`，project = `pe-portais`
  （更近的标记胜出）

### Git worktree / 仓库根身份

```
~/projects/.ai-memory.toml → workspace        = "oss"
                            → project_strategy = "repo-root"
```

结果：

- `~/projects/ai-memory`                → workspace = `oss`，project = `ai-memory`
- `~/projects/ai-memory/crates/cli`     → workspace = `oss`，project = `ai-memory`
- `~/projects/ai-memory-feature-branch` → workspace = `oss`，project = `ai-memory`

若标记在主检出内（例如 `~/projects/ai-memory/.ai-memory.toml`），把它拷贝或提交进每个树外 worktree，或如上在 worktree 父目录之上放一个共享标记。

没有 `project_strategy = "repo-root"` 时，这些路径保持默认行为，按当前目录 basename 解析。

解析发生在宿主侧：生命周期钩子与生成的 TypeScript 插件沿 worktree 的 commondir 指针（`git rev-parse --git-common-dir`，原生钩子则用同样的 Rust/libgit2 辅助）走到主仓库，把解析出的名字作为显式 `project` 发送。这意味着即使 worktree 目录在主仓库树**之外**（有些工具把 worktree 放在单独目录，worktree 自己没有 `.ai-memory.toml` 祖先）、即使服务器跑在看不到宿主检出的容器里，它也能工作。把标记放在 worktree 向上路径的任何位置——通常一个 `~/.ai-memory.toml` 即可——来选择该策略。

### 单一 workspace，无逐仓库覆盖

```
~/.ai-memory.toml → workspace = "home"
```

`$HOME` 下的每个 cwd 都落进 workspace `home`、`project = basename(cwd)`。想彻底脱离 `default` 桶时有用。

## 迁移既有项目

已在 workspace `default` 下创建的项目留在原地。用 CLI 把它挪到别的 workspace：

```sh
ai-memory move-project \
    --from-workspace default --project foo \
    --to-workspace movvia --confirm
```

## 安装级默认（无标记）

`project_strategy = "repo-root"` 通常放在标记里，意味着每个仓库（或其上）都要放一个 `.ai-memory.toml`。想让整个安装**不**用逐仓库标记也获得同样的仓库根解析，就在安装时把它固化进生成的钩子：

```sh
ai-memory install-hooks --apply --agent claude-code --project-strategy repo-root
```

该安装的每个会话随后都从主 git 仓库根解析项目——跑了 `mkdir sub && cd sub` 并待在那里的智能体，不再把会话的剩余部分分叉进一个叫 `sub` 的幽灵项目。

这是**安装时配置**，写进智能体的钩子命令（以及生成的 OpenCode / OMP / Pi / OpenClaw 插件）——与它旁边的 `AI_MEMORY_AUTH_TOKEN` / `AI_MEMORY_HOOK_URL` 同等地位，*不是*用户设置的运行时覆盖（后者在 #16 被刻意否决）。该标志接受 `basename`（新安装默认——不固化任何东西）或 `repo-root`。之后不带该标志的 `install-hooks --apply` 保留已固化进 ai-memory 钩子的值；显式传 `--project-strategy basename` 可移除。

优先级不变：标记里显式的 `project_strategy` 或 `project` 仍然胜过安装默认。

## 会话中途导航：`[routing] mid_session`

上面的一切决定会话从哪*开始*。长会话也会移动：智能体 `cd` 进临时目录，或进兄弟检出 grep 参考资料。`config.toml` 里的 `[routing] mid_session` 决定这些会话中途事件如何归因。它是服务器端运行时配置，不是标记键。

```toml
[routing]
mid_session = "follow-cwd"   # 默认
# mid_session = "sticky"
```

- **`follow-cwd`**（默认，历史行为）按每个会话中途事件自己的 cwd 重新解析。`cd` 进兄弟检出后，那些观察记录进那个检出的项目，所以一个会话的原始记录拆到两个项目，而其会话行与编译页留在第一个。
- **`sticky`** 让会话的项目粘住，不管智能体逛到哪。这与系统其余部分已在用的模型一致：`sessions.project_id` 只存一个值，整编按 `session_id` 读并在会话的项目里写一页。当一个智能体会话意味着一个项目时选它。

两种模式下都成立的两条保证：

- **标记仍然胜出。** 命名了项目的 `.ai-memory.toml` 是刻意的重定作用域而非漂移，所以永不被推翻。钩子告诉服务器它发的是哪种覆盖（`project_src=marker` 还是 `project_src=repo-root`），这正是 `sticky` 能推翻派生名同时尊重声明名的原因。早于 v1.27 的客户端不发来源信息，其覆盖保持权威。
- **宽锚点绝不粘住。** 根在 `/` 或 `$HOME` 的会话不是有意义的锚点，所以绝不捕获其下的事件——否则一个在 `$HOME` 里随手开的杂散会话会把所有项目折进一个桶。

两种模式下会话创建事件都不受影响：在普通非 git 目录开 会话仍以该目录命名项目。

独立于此设置，`project_strategy = "repo-root"` 下，cwd 在任何 git 仓库*和*任何标记之外的会话中途事件（智能体临时目录、`/tmp`、数据目录）已经继承会话的项目，而不是造出叫 `scratchpad` 或 `data` 的幽灵项目。宿主钩子自己解析仓库根，所以缺失的覆盖已经证明该 cwd 什么也没解析到。

## 谁读标记

两个入口都读，自 v1.20 起：

- **生命周期钩子**在每次事件上把标记的字段转发给服务器，让会话捕获落进声明的作用域。
- **客户端 CLI 命令**在调用服务器之前本地解析 `(workspace, project)`——`run`、`bootstrap`、`search`、`read-page`、`write-page`、`lint`、`curator`、`embed`、`pending-writes`、`forget-sweep`、`auto-improve`、`purge-project`、`rename-project`、`move-project` 与 `move-session --from-project`（源侧）等。

v1.20 之前只有钩子读它。于是声明了 `workspace = "acme"` 的检出，捕获落进 `acme`，而每个 CLI 命令解析进 `default`——同一个仓库拆在两个作用域，`ai-memory run` 的托管工作流还站在了错的那一边。

每个字段独立解析：

1. 显式标志（`--workspace` / `--project`）。
2. 最近的标记：`workspace`，以及 `project`——或只设了 `project_strategy = "repo-root"` 时主仓库根的 basename。
3. 既有回退：`default`，以及从 cwd 派生的项目名。

第 2 档决定字段时，命令向 stderr 打一行，给出解析出的作用域、标记决定了哪一半（或两半）、以及做决定的标记：

```console
$ ai-memory search "scope resolver"
ai-memory: scope acme/api (workspace + project from /Users/dev/projects/acme/.ai-memory.toml)
```

`AI_MEMORY_IGNORE_MARKER=1` 让一次调用跳过第 2 档，不改不删标记就恢复 v1.20 之前的解析。它只作用于**客户端命令**——生命周期钩子仍在每次事件上转发标记的字段，所以带着它跑的调用会解析进与周围会话捕获不同的作用域。把它用于一次性读取，不要当作给仓库记忆搬家的办法。

`ai-memory serve` 被刻意排除：服务器没有调用方 cwd 可向上走，其 `--workspace` / `--project` 是钩子事件不带可用值时固化的回退。

## 标记文件不做的事

- ❌ 不支持 glob 模式。只按字面祖先向上走。
- ❌ 不合并祖先标记。最近的胜出。
- ❌ 不自动迁移 `default` workspace 的项目。
- ❌ 不自动做仓库根折叠。worktree 与子目录只在显式设置 `project_strategy = "repo-root"` 时共享项目（按标记，或安装级固化——见上）。
- ❌ 不做用户设置的环境/认证/钩子 URL 覆盖。那些用既有环境变量（`AI_MEMORY_AUTH_TOKEN`、`AI_MEMORY_HOOK_URL`）。（仓库根*默认*仍可不带标记经 `install-hooks --project-strategy repo-root` 固化进安装，但那是安装时配置，不是用户在 shell 里设置的运行时覆盖。）
- ❌ 不越出信任边界。向上走停在 `$HOME`；之外的检出停在其检出根、需要标记在检出内。`$HOME` 之外的非 git 目录需要标记在其确切 cwd。

## 故障排查

**我的标记没被读到。** 依次检查：

1. 文件名确切是 `.ai-memory.toml`（注意前导点）。
2. 文件在 cwd 的**祖先**目录——不是兄弟、不是后代。
3. 没有更近的标记盖过它。跑 `find ~/projects -maxdepth 5 -name '.ai-memory.toml'` 看树里所有标记。
4. workspace / project 取值符合上面的正则（小写字母数字、点、连字符、下划线）。
5. 用了 `project_strategy` 的话，它确切是 `repo-root`。

钩子脚本设计上即发即忘，所以成功时不记日志。想看实际发送了什么，手工跑一次钩子脚本：

```sh
printf '{"cwd":"%s"}' "$PWD" \
  | sh ~/.local/share/ai-memory/hooks/claude-code/post-tool-use.sh
```

标记被读到时，curl 行（`set -x` 或服务器日志里可见）的 URL 会包含 `&workspace=...`。
