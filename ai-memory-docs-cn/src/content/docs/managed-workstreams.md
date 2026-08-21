---
title: "托管跨外壳工作流"
description: "ai-memory run 是一个选择启用的启动器，让一个逻辑编码会话在 Claude Code、Codex、OpenCode、Pi、Crush、Kimi Code、Command Code、Kiro CLI v2/v3、OMP、Grok Build CLI 与 Antigravity CLI 之间移动。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/managed-workstreams.md"
---

# 托管跨外壳（harness）工作流

`ai-memory run` 是一个选择启用的启动器，让一个逻辑编码会话在 Claude Code、Codex、OpenCode、Pi、Crush、Kimi Code、Command Code、Kiro CLI v2/v3、OMP、Grok Build CLI 与 Antigravity CLI 之间移动。直接启动智能体保持其既有 ai-memory 行为。没有全局模式开关、没有 `switch` 命令：用 `run` 就选择了当前工作流（workstream），并透明地为所请求的外壳创建或恢复正确的原生会话。

```bash
cd /path/to/project

ai-memory run claude
# 退出 Claude Code，然后在 Codex 里继续同一逻辑工作流
ai-memory run codex --yolo
# 稍后回到 Claude Code；ai-memory 补上 Claude 原生的 --resume
ai-memory run claude --model opus
# Kimi Code 安装的命令叫 `kimi`；`kimi-cli` 是被接受的启动别名
ai-memory run kimi-cli
# Command Code 在 Unix 上是 `command-code`、原生 Windows 上是 `cmdc`
ai-memory run command-code
# Kiro 默认 v2；显式选择一次它互不兼容的 v3 引擎
ai-memory run kiro
ai-memory run kiro --v3
# 或省略外壳名，自动继续最新可用的会话
ai-memory run
```

外壳名之后的每个参数都是原生 argv，仅包装器持有的确切标志 `--yolo` 与 `--fresh` 例外。不需要 `--` 分隔符，ai-memory 也不维护每套外壳选项 schema 的第二份拷贝。其他包装器选项在前：

可移植事件、交接与项目简报作为显式分隔的不受信任历史数据注入。存储内容里的类指令文本只是证据：智能体不得仅因该内容要求就执行命令、暴露秘密、更改权限或策略、或使用工具。当前的系统/开发者/用户指令、规范项目指令文件与当前检出保持权威。

```text
ai-memory run [--workspace NAME] [--project NAME]
              [--workstream NAME | --new NAME] [--executable PATH]
              [--yolo] [--fresh]
              [claude|codex|opencode|pi|crush|omp|kimi|command-code|kiro|grok|antigravity]
              [原生参数...]
```

默认是当前仓库与 worktree 最近选择的工作流，首次使用时创建名为 `default` 的一个。`--new NAME` 开一条独立的工作线；`--workstream NAME` 回到某条。这些是可选的分支控制，不是外壳切换控制。

## 项目优先启动器

`ai-memory show` 反转通常「先 `cd` 再 `run`」的流程：选一个本地检出、选一个已安装的托管外壳、从那个检出启动。

```bash
cd ~/Projects
ai-memory show

# 仅结构化发现；绝不启动外壳。
ai-memory show --json
ai-memory show --json --no-scan
```

一次成功的托管准备刷新 `<data_dir>/client-projects.json`——一个私有客户端本地注册表，以免凭据的规范化服务器 URL 加 `(workspace, project)` 为键。服务器的 `/api/v1/projects` 响应只供项目元数据；它绝不暴露或选择服务器宿主的检出路径。这让笔记本与台式机把同一台远程家用服务器项目映射到不同的本地目录，而无需同步路径优先级或冲突。

默认选择器把有效的已保存链接与当前目录的有界深度 1 扫描合并。扫描识别常见项目标记、忽略符号链接与依赖/构建目录，并用与 `run` 相同的标记与仓库规则解析每个候选。`--no-scan` 只用已保存链接，`--workspace NAME` 过滤两个来源。过期、改指向或作用域不匹配的链接被跳过，之后一次成功的 `run` 修复该条目。服务器暂时不可用时，已保存链接与扫描结果仍可选，但托管 `run` 在启动智能体之前无法准备工作流时仍然失败关闭。

交互模式以 `+ New project` 开始。启动器接受一个可移植的小写 ASCII 目录名，在隐藏的暂存目录里构建标记、指令路由与智能体技能（Agent Skills），只在全部设置成功后才改名为正式目录。`--yolo`、`--fresh` 与尾部原生参数作用于所选外壳。非终端调用者必须用 `--json`；JSON 不能与启动参数组合。

## 从任何地方继续

裸 `ai-memory run` 继续当前检出，但其工作流查找以 `(workspace, project, repo 指纹, worktree 指纹)` 为键，所以调用者必须已在项目里。`ai-memory continue` 补上缺的那步、无需 `cd`：

```bash
ai-memory continue
ai-memory continue --workspace work
```

检出完全在客户端选择，依据是每次成功托管准备写进 `client-projects.json` 的 `linked_at` 戳。绝不问服务器用哪个目录——它不暴露宿主路径，且链接只有在本宿主重新校验后才能被信任。

启动之前，最新链接被复查两次：记录的路径必须仍规范化为自身（拒绝移动过或被符号链接替换的目录），且它必须仍解析到同一 `(workspace, project)`（拒绝会把本次会话记忆归档到不同作用域的检出）。任一检查失败的链接在 stderr 点名并跳过，尝试次新的链接。损坏的 `linked_at` 时间戳同样被报告、绝不视为可启动。落空绝不静默：外壳启动前总是打印选中的项目与路径。

选中检出后，启动就是该目录里裸的 `ai-memory run`，含自动外壳选择。`continue` 因此接受 `--workspace`、`--yolo`、`--fresh`，但不接受原生外壳参数或 `--executable`——后两者的含义取决于用户没点名的外壳。

## 自动外壳选择

不带外壳名时，`ai-memory run` 检视 Claude Code、Codex、OpenCode、Pi、Crush、Kimi Code、Command Code 与两个 Kiro CLI 引擎的检出本地会话。空工作流自动恢复最新会话。已建立的工作流上服务器状态优先：ai-memory 恢复最近关联且仍有可用本地会话的外壳。它绝不因另一外壳的文件时间戳更晚就选择更新但过期的会话。Kiro 的 v2 与 v3 候选共享一个服务器智能体身份，但选中的原生引擎风味保持精确。OMP、Grok 与 Antigravity 保持显式可用但不进自动池。

裸模式接受包装器选项但不接受外壳原生参数或 `--executable`——含义取决于选中的外壳。在自动池无会话的新目录里，它退出而不创建工作流，并建议显式的 `ai-memory run <harness>` 命令。

## 首次托管启动

本来为空的工作流可以认领所请求外壳的既有原生会话之一。交互式启动时，ai-memory 检视该外壳的存储而不修改它，列出至多八个记录的工作目录匹配当前检出的近期会话。选一个恢复它、回车接受最新候选、或选 `0` 开新会话。绝不提供来自另一检出的会话。

认领只是引导操作。任何外壳关联了原生会话或贡献了可移植消息/工具/压缩历史之后，工作流即建立。例如 Claude 建立了它而 Codex 尚未加入时，`ai-memory run codex` 创建全新 Codex 会话并注入 Claude 工作流历史。它不检视也不选择更早的无关 Codex 会话。之后回到 Codex 恢复已关联到该工作流的那个 Codex 会话。

显式原生选择器永远优先。`--new NAME` 总是为新工作流创建全新原生会话。脚本/非交互调用与无终端输入的启动跳过选择器、全新开始。在产出原生会话或可移植历史之前就退出的启动不消费之后的认领机会。

添加 ai-memory 持有的恢复选择器之前，启动器在不修改原生存储的情况下检查确切关联的 id。转录被删除、清空或随沙箱 overlay 丢失时，ai-memory 全新开一个原生会话，并在观察到该会话时重指同一工作流。不可读或畸形的存储被报告、但不被误当缺失会话。用 `ai-memory run --fresh <harness>` 刻意跳过关联会话与认领选择器。`--fresh` 不能与原生 resume、continue、session 或 fork 选择器组合。

## 每次运行发生什么

1. 宿主客户端解析正常的 workspace/project 作用域与稳定的仓库加 worktree 指纹。它开一个 90 秒可续期租约。一个工作流同时至多一个写入者，所以两个终端不能静默竞逐其原生会话指针或投递游标。
2. 裸模式解析正确的可用外壳。空工作流时，显式交互适配器可以提供匹配的本地会话供一次性认领。否则适配器按序透传原生参数，只在用户未提供时添加创建/恢复选择器。
3. `AI_MEMORY_RUN_ID` 把生命周期钩子标记为托管。SessionStart 关联真实的原生会话并只注入该会话未见过的可移植事件。没有 SessionStart 钩子的 Crush 经临时的 `options.global_context_paths` 条目收到同一有界数据包。Kimi Code 触发 SessionStart 但丢弃其 stdout，所以 kimi 适配器的 SessionStart 钩子只捕获事件——既不取数也不关联。UserPromptSubmit 钩子发起带原生 `session_id` 查询参数的 `/handoff` GET；服务器关联会话并原子渲染数据包，Kimi Code 把钩子 stdout 作为用户消息注入到回合之前。待处理的单次交接保持叠加性：它排在托管数据包之前，两者的投递认领只在完整交接/数据包/简报响应组装完毕后一起提交。直接启动继续用同一交接路径、不带托管数据包。
4. 子进程退出时，ai-memory 读原生转录存储而不修改它。可见的用户/助手消息、已完成的工具调用/结果、压缩摘要与非变更的 Git 检查点进只追加的工作流台账。隐藏推理与不支持/私有记录被排除并记为提取损失标注。每个投递的工作流数据包以版本化来源标记开头。若 Claude Code 持久化了该数据包且其 `Read` 工具返回它，Claude 转录归一化器排除带标记的结果，而不是把投递过的历史再喂进台账。它也识别带标记前的数据包头，以兼容既有原生会话。
5. 导入用确定性事件 id、增量源游标、不可变的净化 JSONL 片段与有界批次。重试不能重复历史。保留原生进程的退出码。

下一个外壳收到一段有界的近期增量——因为没有智能体上下文窗口能安全吸收无界转录。完整可见台账在托管智能体进程内部保持可检索：

```bash
ai-memory workstream-search "scope resolver decision"
ai-memory workstream-search --limit 50 --json "failed migration"
```

`AI_MEMORY_WORKSTREAM_ID` 在子进程内自动提供 id。从另一个 shell 用时，显式传 `--workstream-id <uuid>`。检索结果保留源外壳、角色、事件序号与内容。历史工具活动标注为已完成的证据，绝不能作为待处理调用重放。

## 原生适配器行为

| 外壳 | 全新原生会话 | 回到原生会话 | 只读源 |
|---|---|---|---|
| Claude Code | 生成 `--session-id` | `--resume <id>` | `~/.claude/projects/**/*.jsonl` |
| Codex | 原生默认创建 | `resume <id>` | `~/.codex/sessions/**/rollout-*.jsonl` |
| OpenCode | 原生默认创建 | `--session <id>` | `~/.local/share/opencode/opencode.db` 只读打开 |
| Pi | 生成 `--session-id` | `--session <id>` | `~/.pi/agent/sessions/**/*.jsonl` |
| Crush | 原生默认创建 | `--session <id>` | `<project>/.crush/crush.db` 只读打开 |
| Kimi Code | 原生默认创建 | `--session <id>` | `$KIMI_CODE_HOME/sessions/*/*/agents/main/wire.jsonl` |
| Command Code | 原生默认创建 | `--session <uuid>` | `~/.commandcode/projects/*/<uuid>.jsonl` |
| Kiro CLI v2 | 原生默认创建 | `--resume-id <uuid>` | `$KIRO_HOME/sessions/cli/<uuid>.jsonl`（加同级 `<uuid>.json` 元数据） |
| Kiro CLI v3 | 带显式 `--v3` 的原生默认创建 | `--v3 --resume-id <sess_uuid>` | `$KIRO_HOME/sessions/<checkout-bucket>/<sess_uuid>/messages.jsonl`（加同级 `session.json` 元数据） |
| OMP | 原生默认创建 | `--resume=<id>` | `~/.omp/agent/sessions/**/*.jsonl` |
| Grok Build CLI | 生成 `--session-id` | `--resume <id>` | `$GROK_HOME/sessions/*/*/chat_history.jsonl` |
| Antigravity CLI | 原生默认创建 | `--conversation <id>` | `~/.gemini/antigravity-cli/conversations/<id>.db` 元数据加生命周期钩子捕获 |

Command Code v3 转录自描述且只追加。适配器要求 UUID 文件名、头 id 与规范头 `cwd` 一致才做发现或恢复。其 1.14.1 允许清单对照过完整性匹配的发布包与净化的真实夹具。它导入可见消息、压缩与分支摘要，保留 `parentId` 作分支出处，并排除隐藏思考、图像、外壳注入的消息、提供方/模型元数据、custom/Mod 记录与每个 sidecar。未知转录版本在审计前失败关闭。默认可执行文件在 Unix 上是 `command-code`、原生 Windows 上是 `cmdc`；`commandcode`、`cmdc`、`cmd` 是被接受的启动别名。用户的 `--session`、`--resume`、`--continue` 与 fork 确切选择保持权威。实验性的非沙箱 Mod API 不被使用。

显式原生选择器——如 Claude 的 `--resume`、OpenCode 的 `--session`、Codex 的 `resume`、Antigravity 的 `--conversation` / `--continue`——优先。ai-memory 关联选中的原生会话并重置无关的适配器游标，而不是假设它属于旧会话。Pi 与 OMP 的 `--session-dir` 值和 Crush 的 `--data-dir` 值原样透传并用作只读导入根。原生存储环境覆盖也被尊重：`CLAUDE_CONFIG_DIR`、`CODEX_HOME`、`XDG_DATA_HOME`、`PI_CODING_AGENT_SESSION_DIR`、`PI_CODING_AGENT_DIR`、`KIMI_CODE_HOME`、`KIRO_HOME`、`GROK_HOME`。Pi 族适配器还识别原生进程在改名前退出时留下的完整 `.jsonl.<nonce>.tmp` 原子写文件；不完整的末条 JSONL 记录绝不导入。help、version 与已知工具子命令不带会话标志透传。Claude/Pi/OMP 的 print 模式、Codex `exec`、OpenCode/Crush `run`、重定向输入及其他非交互启动绝不打开认领选择器。

`ai-memory run --yolo <harness>` 与 `ai-memory run <harness> --yolo` 都用该外壳的原生危险模式。翻译为 Claude Code `--dangerously-skip-permissions`、Codex `--dangerously-bypass-approvals-and-sandbox`、OpenCode `--auto`、Pi `--approve`、Crush `--yolo`、Kimi Code `--yolo`、Command Code `--yolo`、Kiro CLI v2 `--trust-all-tools`、Grok Build CLI `--yolo`（等价于其 `--always-approve` 选项）、Antigravity CLI `--dangerously-skip-permissions`。Kiro v3 用 `permissions.yaml` 取代了 trust-all 标志，所以 ai-memory 打一条通知、不加未验证的标志。OMP 目前无需加标志。翻译出的原生标志已存在时 ai-memory 不加重复的。

托管支持刻意窄于总体集成矩阵。Gemini CLI、Devin CLI、Cursor 及其他智能体可以有 MCP 或生命周期钩子支持而无原生托管恢复。要新增托管外壳的贡献者必须遵循[托管外壳贡献协议](/managed-harness-contributions/)，含只读提取、回合前上下文投递、迁移不变量、确定性测试与选择启用的真实外壳验收。

## 安装与恢复

托管运行需要当前的 ai-memory 生命周期钩子，SessionStart 才能收到可移植增量。升级后刷新它们：

```bash
ai-memory install-hooks --agent claude-code --apply
ai-memory install-hooks --agent codex --apply
ai-memory install-hooks --agent opencode --apply
ai-memory install-hooks --agent pi --apply
ai-memory install-hooks --agent omp --apply
ai-memory install-hooks --agent kimi-code --apply
ai-memory install-hooks --agent kiro-cli --apply
```

以原生 `ai-memory hook` 命令安装的 Kimi Code 钩子在二进制升级时自动拿到当前投递行为。脚本回退安装必须在升级后重跑 Kimi Code 的 `install-hooks` 命令刷新暂存脚本。当前钩子在 `UserPromptSubmit` 投递交接；Kimi 丢弃 `SessionStart` stdout。

已知的 Kimi Code 适配器限制：子智能体转录（`main` 以外的 `agents/<id>/wire.jsonl`）v1 不导入、记为提取损失标注；会话桶目录名是工作目录的单向哈希，所以发现总是读 `state.json` 的当前 `cwd` 字段或遗留 `workDir` 别名、绝不解析桶名。冲突的别名或与会话目录不一致的持久化 id 被拒绝。事件 id 派生自原始 wire.jsonl 行的 SHA-256，所以两条字节相同的行——只在同一毫秒内内容相同时可能，因为 Kimi Code 给每条记录盖 `time`——塌缩为一个台账事件。增量游标存完整记录字节偏移加已导入前缀的 SHA-256。正常追加在保存的偏移处续；Kimi 原地重写 `wire.jsonl` 时，ai-memory 重置到开头重放文件，稳定的事件 id 给已在工作流里的记录去重。直接把 `wire.jsonl` 放在会话目录里的遗留会话（kimi 会话存储仍经其 stat 回退读取的前 `agents/` 布局）v1 既不发现也不导入。原生契约对照 Kimi Code v0.34.0 重新验证过。托管启动器接受 `kimi`、`kimi-code`、`kimi-cli`；三者都解析到已安装的 `kimi` 可执行文件。

Kiro 的版本感知适配器在两个引擎下用经过认证的 Kiro CLI 2.16.2 实测过。V2 用 UUID 会话 ID 加扁平的 `$KIRO_HOME/sessions/cli/<uuid>.json` 与 `<uuid>.jsonl` 存储，事件为 v1 `Prompt`、`AssistantMessage`、`ToolResults`。V3 用互不兼容的 `sess_<uuid>` ID 加嵌套的 `$KIRO_HOME/sessions/<checkout-bucket>/<sess_uuid>/session.json` 与 `messages.jsonl`；接受的元数据限于 `schemaVersion = 1.0.0`、`dataModelVersion = 1`、精确的目录/id 匹配、以及解析到当前检出的 `workspacePaths` 条目。v3 可见事件允许清单是用户文本、助手 `Say` 输出、工具调用与工具结果。会话簿记、钩子记录、用量摘要、回合边界、私有助手操作、畸形记录与未知 schema 版本不导入。

两个引擎绝不交叉恢复：注入关联的 `--resume-id` 之前检查确切的存储元数据，互不兼容的引擎风味也存进不透明的增量游标。显式 `--v3`、仅 v3 的 `--mode` 或 `--agent-engine v3` 选 v3；显式 `--agent-engine v2` 选 v2；未知引擎值保持透传而不是瞎猜。v3 会话一旦关联，之后裸的 `ai-memory run kiro` 透明恢复那个引擎。Kiro CLI 2.16.2 即使 `KIRO_HOME` 重定向了其他状态也把 v3 会话写在默认 `~/.kiro/sessions` 之下，所以 ai-memory 先查配置的 v3 根、再查那个默认根作兼容回退。关联会话只存在于回退处时，ai-memory 为那一次恢复移除 `KIRO_HOME`，让 Kiro 找到会话；Kiro 因此为该进程用其默认家的 v3 设置/钩子。全新启动与把会话存在配置根之下的版本保持 `KIRO_HOME` 不变。每个候选仍要求精确的 id、schema 与检出元数据。v2 的 `--yolo` 翻译是 `--trust-all-tools`；显式的更窄 `--trust-tools` 选择绝不放宽。V3 无等价 CLI 标志。见 Kiro 当前的[会话管理](https://kiro.dev/docs/cli/chat/session-management/)与[v3 兼容性](https://kiro.dev/docs/cli/v3/)参考。

Grok 的托管投递也不需要安装 ai-memory 钩子。Grok 忽略 `SessionStart` stdout 且其 `UserPromptSubmit` 钩子是被动的，所以启动器从服务器取有界上下文数据包并经 Grok 原生 `--rules` 标志传递，把文本追加到该会话的系统提示词。只在子进程孵化之后确认投递。因为 `--rules` 在 Grok 的参数解析器里是单次使用的，原生提供的 `--rules`/`--append-system-prompt` 优先，数据包保持未投递直到之后的托管运行能接受它。Grok 会在回退时原地重写 `chat_history.jsonl`，所以导入游标存前缀哈希、不匹配时从头重放，内容哈希事件 id 给已在工作流里的记录去重。同级会话文件（`events.jsonl`、`updates.jsonl`、`rewind_points.jsonl`）载外壳内部数据、绝不作为转录读取；发现读 `summary.json` 的 `info.cwd`、绝不解析 URL 编码的桶名。托管启动器接受 `grok` 与 `grok-build`。原生契约对照 Grok Build CLI v0.2.111 验证过。

Antigravity 在 `~/.gemini/antigravity-cli/conversations/<conversation-id>.db` 每个会话一个 SQLite 数据库，所以 id 就是文件名、定位无需扫描。会话打开时的工作区来自 `trajectory_metadata_blob`——一个 protobuf 消息，其首字段持有一个嵌套消息、后者首字段是工作区 `file://` URI；只读那两个字段。不带它们的数据库——更老或更新的 `agy`——被跳过而不是让列表失败。注意记录的工作区是 `agy` 启动时的目录、不是检出根，所以在上一级开始的会话不会出现在子目录里。

`agy` 不接受调用方为新建会话选 id，所以全新启动不注入选择器、id 由钩子关联或退出后发现；关联恢复传 `--conversation <id>`。`--continue` / `-c` 视为显式用户选择、绝不被覆盖。`--yolo` 映射到 `--dangerously-skip-permissions`。步骤 payload 是无文档、无版本的 protobuf 块，所以 ai-memory 不解码对话文本：此外壳的可见事件台账来自生命周期钩子捕获，转录导出带说明失败。托管启动器接受 `antigravity`、`antigravity-cli`、`agy`。原生契约对照 Antigravity CLI v1.1.7 验证过。Antigravity 不在无参数自动检测集里；显式点名它。

Crush 的托管模式不需要安装 ai-memory 钩子。启动器从服务器读一次性上下文，把既有全局 Crush JSON 拷进私有临时目录、追加一个短命上下文路径，并用 `CRUSH_GLOBAL_CONFIG` 把子进程指向那个目录。只在子进程启动后确认投递，孵化失败丢不了数据包。原始配置不被修改。ai-memory 只读打开项目数据库；启动的 Crush 进程继续其正常原生会话写入。

Linux/macOS 的 Docker shell 包装器无法检视宿主项目、也无法从辅助容器内执行宿主智能体。对 `run`、`show`、`continue`，它下载匹配的原生发布到 `~/.cache/ai-memory/native-runner`、校验发布的 SHA-256 校验和、并执行那个宿主客户端。设 `AI_MEMORY_NATIVE_BIN=/path/to/ai-memory` 用特定的原生构建。原生包、发布与源码安装无需垫片。原生 Windows 用发布的 `ai-memory.exe` 或源码构建。

包装器在 Docker 之前拦截全部三条命令并保留宿主 `PATH`、`AI_MEMORY_SERVER_URL` 与认证环境。原生客户端的启动日志显示 `server_url` 及其本地配置路径；`data_dir` 与 `bind` 描述本地默认、不覆盖已配置的远程服务器。日志若显示 `data_dir=/data` 后跟 `starting managed ... No such file or directory`，说明安装的包装器过期、把命令发进了辅助容器。在客户机上跑 `ai-memory upgrade`。远程/家庭实验室服务器须单独升级。

正常退出时，ai-memory 导入转录并在返回前关闭租约。已处理的设置、启动或导入失败立即取消租约。新启动短暂重试活跃工作流冲突，让上一个启动器能收尾；若另一外壳确实还在跑，冲突保留、并发写入者仍被拒绝。终端中断持续到达子进程，同时父进程保持存活以完成或取消该运行。

外壳或原生会话选择器打开期间，临时服务器中断产生一条短通知而不是打印每次失败的心跳。启动器每 30 秒探测一次、请求超时 10 秒，让 90 秒租约在普通服务器重启间保持安全。反复失败保持安静；服务器再次响应时一条恢复通知确认心跳恢复。中断期间原生外壳保持可用。中断超过一个租约窗口时，原启动器只在无更新启动器认领过该工作流时才可续期。替代的 prepare、cancel、finish 或破坏性操作对旧运行仍是终态。

客户端被无清理地终止（如 `kill -9`）时，其租约 90 秒内过期。之后的托管运行从最后提交的适配器游标开始，所以已关联的原生会话可以导入缺失的尾部而不重复更早的事件。进程启动之前的服务器或认证失败是致命的；ai-memory 不静默启动一个非托管智能体。

## 隐私与存储边界

ai-memory 的托管适配器不写 Claude、Codex、OpenCode、Pi、Crush、Kimi Code、Command Code、Kiro、OMP、Grok 或 Antigravity 的私有存储。启动的外壳保持对自己会话写入的正常所有权。适配器只读有文档或观察到的本地会话格式。提供方凭据、加密内容、系统/开发者提示词记录与隐藏推理不被拷贝。服务器净化器在 SQLite FTS 台账与 `<data_dir>/raw/workstreams/<workstream-id>/segments/` 下的不可变文件写入之前运行。

台账是运营连续性基底，不是 markdown wiki 的替代。持久决策、规则、流程与项目事实仍属于 wiki 页面——经整编或显式持久写入。

## 项目与目录重命名

`ai-memory rename-project --from OLD --to NEW` 只改服务器侧项目名。wiki 路径以 UUID 为键，所以它不移动服务器目录、源检出或原生外壳会话。源检出路径本身被重命名时，Claude Code、Codex、OpenCode、Pi、Kimi Code（`state.json` 的 `cwd` 或遗留 `workDir`）、Command Code（v3 头 `cwd`）、Kiro v2（`<uuid>.json` 的 `cwd`）、Kiro v3（`session.json` 的 `workspacePaths`）、OMP 与 Antigravity 用的绝对路径会话定位器可能仍引用旧路径；Crush 的项目本地 `.crush` 数据库随检出移动。

没有可移植、受支持的 API 能改写每个外壳的私有项目定位器。因此 ai-memory 不改那些存储、也不静默把重命名的检出等同于同一远端的另一个克隆。显式原生选择器仍然优先，且当该外壳支持跨目录恢复时能救回会话；OpenCode 还提供自己的导出/导入流。对重命名的检出，用显式外壳及其有文档的会话选择器播种新的托管工作流。恢复验证前保持旧检出路径可用。自动发现刻意要求记录的检出精确匹配。

## 手工验收

选择启用的验收运行器演练启动器边角情形，然后用本地安装的 Claude、Codex、OpenCode、Pi、Crush、OMP、Kimi、Command Code、Grok 与 Antigravity CLI 编排一条真实工作流：

```bash
scripts/managed-workstream-acceptance.sh
```

它刻意与 CI 分开，因为用本地外壳凭据与模型调用。钩子配置、原生存储、ai-memory 服务器与 Git 夹具隔离在临时目录下。Claude、Codex、OpenCode 只收到拷贝的认证材料；OMP 收到带读一致凭据/模型数据库备份与拷贝设置的临时智能体目录。Crush 用其既有全局提供方配置与隔离的项目数据库。Kimi Code 用隔离的、播种了操作者提供方配置的 `$KIMI_CODE_HOME` 运行。Command Code 用只播种 `auth.json` 与 `config.json` 的隔离 `HOME` 运行。Antigravity 用只播种操作者 OAuth 与设置文件的隔离 `HOME` 运行。确定性阶段还覆盖首跑认领、裸模式选择与空目录失败、包装器 `--yolo`、租约排他、Crush 上下文清理、假模式 Kimi 与 Command Code 的存储/恢复/导入往返、Antigravity 钩子/关联/恢复往返、假模式 Kiro v2 存储/恢复/导入往返、等价的 Kiro v3 嵌套存储往返（含透明引擎恢复）、私有轨迹排除、以及既有工作流对过期会话的防护。假的 Kimi 往返还删除关联的原生会话并验证自动全新会话恢复与重指。原生会话创建、只读提取、跨外壳注入与返回恢复路径全部演练。Docker 包装器宿主执行与远程 URL 保留由 `ai-memory-cli` 打包测试单独覆盖。

Kiro 被刻意跳出于脚本化真实模型循环。其 `--no-interactive` 模式写不同的 v1 SQLite 存储，而两个托管适配器读交互式 v2/v3 日志。登录态的 Kiro 验收因此保持交互式。v2：跑 `ai-memory run --new kiro-v2-accept kiro`、输入一条唯一提示词、正常退出，然后跑 `ai-memory run --workstream kiro-v2-accept kiro-cli` 并验证同一 UUID 恢复。v3：用全新工作流加 `kiro --v3` 重复；第二次裸 `kiro` 启动必须透明添加 `--v3 --resume-id <sess_uuid>`。在两个工作流台账里检索唯一的可见助手回复。记录 Kiro 版本，并在改任一夹具 schema 前净化元数据/事件文件。

真实外壳阶段把模型当作传输中的系统而非测试预言机。每一段它记录之前的台账序列，然后对有可读原生转录的外壳要求一条新导入的助手事件。对 Antigravity 则要求精确的原生会话关联加一条新的相关启动钩子观察，因为其私有轨迹 protobuf 被刻意不解码。预期上下文增量时，它先验证前一台账端点晚于该外壳的投递游标，然后要求最新托管运行把那个确切端点报告为 `sync_through` 且 `context_delivered = 1`。它不要求模型复述之前的哨兵：Claude Code 可能把大块钩子结果外置到文件，模型是否选择读那个文件不是确定性的连续性信号。确定性的假 Grok 与 Antigravity 跨外壳夹具在无凭据无模型调用的情况下演练同一断言辅助。

设 `AI_MEMORY_ACCEPTANCE_HARNESSES="command-code codex"` 选 Command-Code→Codex→Command-Code 往返，或 `AI_MEMORY_ACCEPTANCE_HARNESSES="antigravity codex"` 选 Antigravity→Codex→Antigravity 往返（`agy` 与 `antigravity-cli` 是被接受的别名）、`AI_MEMORY_ACCEPTANCE_DETERMINISTIC_ONLY=1` 跳过模型调用、或 `AI_MEMORY_ACCEPTANCE_KEEP=1` 保留全部临时日志与数据。

## 在 Herdr 里运行

[Herdr](https://herdr.dev/) 是一个终端工作区管理器，跟踪哪个智能体跑在哪个 pane 里。它从 pane 的前台进程识别智能体，回退到把智能体自己的屏幕输出与逐智能体 manifest 匹配。

`ai-memory run` 坐在两者之间很尴尬。前台进程是包装器、智能体是它的子进程——一个进程组、组长是 `ai-memory`——所以进程检测找不到智能体。pane 只在外壳画出 Herdr 认识的标题后才解析，那可能在启动很久之后，且输出不匹配任何 manifest 的外壳可能永远不解析。在那之前 Herdr 的智能体 pane 对该 pane 什么都不显示。

ai-memory 刻意不从内部修这个。Herdr 给包装命令的提示 `HERDR_AGENT` 作用域是 pane 的前台进程，而进程无法在 exec 之后修改自己的环境——所以包装器一旦已在运行就没有办法向 Herdr 描述自己。在它孵化的智能体上设该变量会把它放进 Herdr 不看的地方。

两件事今天可行。

**在命令上点名智能体**——Herdr 看的就是那里：

```bash
HERDR_AGENT=codex ai-memory run codex
```

**或者安装 Herdr 自己的智能体集成**——那是更好的答案：

```bash
herdr integration install codex
herdr integration install claude
```

安装的集成经 Herdr 的 socket 报告智能体身份与生命周期状态，且无论进程检测如何都是权威的——于是包装器完全不再要紧。它还升级 Herdr 能显示的：真实的 `idle` / `working` / `blocked` 信号，而不是从屏幕推断——屏幕根本无法可靠看到 `blocked`。

这些是写各自文件的独立机制：Herdr 的集成安装自己的钩子脚本（Claude Code 是 `~/.claude/hooks/herdr-agent-state.sh`、Codex 是 `~/.codex/herdr-agent-state.sh`），而 ai-memory 的生命周期钩子住在智能体自己的配置里。ai-memory 的安装器保留外来条目而非替换，所以重跑 `ai-memory install-hooks` 不会移除 Herdr 的。想确认另一方幸存，装完任一后备份智能体配置并 diff。
