---
kind: as-built
title: OpenRig CLI 参考——完整 rig 命令呈现面
status: active
topics: [runtime-control, agent-runtime]
domains: [operating-advisor, engineering-advisor, orchestrator]
applies-when: |
  需要精确的 rig CLI 呈现面——命令组、子命令、标志、JSON 输出、跨主机、
  协作原语时。
siblings: [README.md, architecture/daemon-core.md]
prerequisite-reads: [README.md]
last-verified-against-source: b13a8e4c7
last-updated: 2026-06-20
---

已于 2026-06-15（v0.3.4）对照已交付 CLI 完成核验，依据：
- `packages/cli/src/index.ts`
- `packages/cli/src/commands/*.ts`
- `packages/cli/src/mcp-server.ts`
- `node packages/cli/dist/index.js ... --help` 的实机帮助

本文档反映当前已交付的 `rig` 呈现面。当实机帮助文本窄于实现时，注记会明确指出。

## 终端仪表盘入口

TUI 的 **Connections** 小节（`connections` 或 `:connections`）展示正在运行的守护
进程与正在启动的 CLI 身份、带来源的所选实例设置、观测到的 rig 与已编写的 Spec、
Slack 配置与运行中的 wire 状态，以及已注册人类及其 primary/secondary 绑定。
`back` 恢复打开 Connections 之前的工作视图。该视图只提供受支持的 CLI 指引；
它不会启用连接器、更改设置或发送测试消息。

Connections 读取被动的 `GET /api/gateway/connections` 投影。它从 settings、
config、人类注册表与网关状态中选取安全字段；密钥值/引用与原始报错一律省略。
可用时，当前配置会与 wire 的激活摘要比对。最近一次 Slack 验证来自既有信道操作
审计尾部的至多 64 KiB，与当前配置匹配并标注其时间/操作者。它是历史范围与信道
成员资格证据，不是当前可达性、凭据身份、投递或阅读情况。缺失、失败、不完整与
已变化的观测彼此保持区分；没有该投影的旧版守护进程显示为不可用。在该实例上
使用所展示的指引；`rig slack verify --json` 会显式联系 Slack，普通导航/刷新
不会。

`rig tui` 通过与裸 `rig` 相同的前门打开一个独立 TUI。`rig tui --shared` 需要
交互式输入/输出与一个回环守护进程连接。它解析内核绑定的 `operator.human` 终端，
接入一个本地 tmux 客户端，而不启动席位或另一个 TUI。先 Ctrl-b 再按 d 即分离；
重新接入会保留导航。绑定缺失或有歧义时，会以检查指引失败，而不会创建另一个内核。

全新内核终端会自动启动 `rig tui`。较旧的终端，或 TUI 已退出的终端，保留其
shell：在其中运行一次 `rig tui` 即可。内核视图使用 TUI 实例 `kernel`；独立启动
则使用其普通实例。`rig tui commands --json` 暴露命令注册表供智能体控制。在普通
shell 中，Tab 会基于当前快照补全命令名/别名、小节跳转与参数。前缀有歧义时显示
候选；继续输入再按一次 Tab。无匹配则保留文本。Enter 执行；Escape 清除。自由
文本过滤器不参与补全。括号粘贴始终是文本，绝不是隐式命令提交。

Recent 按序展示折行后的队列变更。在事件上按 Enter 打开原始记录（包括其原始
时间戳）；Escape 返回上一个视图/滚动位置。被记录的变更仍是可归因的主张，
包括尝试与失败。

TUI 的绝对时间使用 `ui.timezone`，默认 `America/Los_Angeles`，采用原生夏令时
规则。在 TUI 中运行 `timezone` 可查看当前值与设置指引。
`rig config set ui.timezone Europe/London` 持久化一个替代值；
`rig config reset ui.timezone` 恢复默认。更改后需重新打开 TUI。
`OPENRIG_UI_TIMEZONE` 覆盖文件设置。无效设置会产生可见的回退提示。相对时长与
已存储的源时间戳不受影响。

参见[首次使用之旅](/reference/getting-started/)。

## 守护进程关闭

`rig daemon stop` 向由本地状态识别出的存活守护进程至多发送一次 SIGTERM。
显式给出的 `OPENRIG_URL` 若与该目标不一致，会在发信号前拒绝。守护进程有一个
被引用的 **10 秒**预算，覆盖异步服务关闭、连接与记录器排空；重复的
SIGINT/SIGTERM 会汇入同一次停止。CLI 给进程退出 **12 秒**时间，之后即使
`daemon.json` 已被删除也会核验原始 PID 与监听器。被拒绝的监听器、仍在响应的
监听器与探测不可用是三种不同的结局。

`$OPENRIG_HOME/daemon-shutdown.json` 记录 PID、关闭开始/完成时间、阶段、失败
情况与 `clean|failed|timed-out` 结局。只有成功的排空才会把生命周期记录标记为
clean。失败/超时的排空返回非零，即使进程已退出也是如此。对已记录的目标，缺失
或过期的回执证据视为未验证，同样返回非零。失败/未验证的停止会保留目标状态以
供重试；只有读到匹配的 clean 回执后 status 才会清除它。对已退出的目标，使用
同样的回执判断而不再发信号。没有已记录目标且监听器拒绝连接时，CLI 报告一个
独特的无目标空操作，而不是干净排空的判定。未绑定到目标的、不完整或不可读的
本地关闭证据保持非零/未验证，而不会被归因到无关的监听器。

因此，没有回执的旧版守护进程可以被证明已停止，但其优雅排空不会获得认证。
检查回执与 `daemon.log`；不要推断待处理的外部工作已完成或已回滚，也不要盲目
重试。该预算覆盖异步等待，不包括同步的事件循环卡死。

## 人工送达

`rig gateway human list --json` 发现已注册的 `<entityId>@external` 地址。
`rig gateway human show <entityId> --json` 包含主连接器就绪状态、原因与下次
检查。项目策略决定何时联系人类；`messaging-the-human` 提供传输机制。

使用 `rig queue create --destination <address> --summary "<decision>"
--body-file <file> --evidence-ref <ref> --verify --json` 创建人工请求。它在
检查送达回执之前先持久化一行。`posted` 证明连接器已接受，绝不证明已阅读；
`transport-failed`、`never-posted`、`still-pending` 与 `indeterminate` 会保留
请求并指名下次检查。不要盲目重复 create。`rig send` 面向智能体席位。

`rig slack manifest [--url|--json]`（0.6.0 中为实验性）离线打印 Slack 应用
清单——用户据此创建自己的私有 Socket Mode 应用（无需守护进程、令牌或网络）。
`--url` 是预填清单的 Slack create-app 链接；`--json` 额外给出 scope 与事件
列表以及每个 scope 的申请理由。同一对象以只读方式通过
`GET /api/gateway/slack/manifest` 提供给 TUI Connections 页面。安装步骤见：
`docs/reference/slack-app-setup.md`。

`rig slack enable [--reason <reason>]` 只在从 disabled 到 enabled 的转变时为
既有积压播种。重复 enable 不会重新播种或重启。`rig slack disable --reason
<reason>` 要求给出关闭原因。两者都返回可归因的生命周期回执；当不存在托管会话
头时，直接请求可以指名 `actor`。来自头部的身份与自我声称的身份保持区分。配置、
验证与人类绑定编辑同样会把操作者、原因、先前/结果状态与效果记录到
`$OPENRIG_HOME/state/human-channel-operations.jsonl`。每个操作各有一条开始
回执和一条完成回执且共用一个 ID；缺失完成回执即为 indeterminate。快照保留
状态/摘要，而不保留凭据或消息正文。本地 CLI 的配置/验证/绑定回执被明确标为
`claimed:v1`。

`rig host pair <url> [--human <address>]` 选择唯一已注册的目标人类；存在多个时
要求显式选择。注册表缺失或收件人有歧义时，在创建审批前即拒绝。未设置
`workspace.operator_seat_name` 时不再凭用户名虚构一个内核席位：Mission Control
要么发现唯一已注册人类，要么显示身份不确定。显式选择既有席位仍然受支持。
旧别名只有在其实体已注册时才解析；旧的失败行被保留，不会因注册而被隐式送达或
重放。

## 总览

系统健康（System Health）诊断、策略、检查点与处置记录在[智能体执行的系统健康
诊断](/reference/health-diagnosis/)。诊断的 `show`/`list --json` 是摘要；
需要此前那种完整证据载荷时使用 `--full --json`。它们的默认输出会指明省略了
哪些字段以及确切的展开命令。工作流的人类视图仍是摘要；工作流的 `--json` 继续
返回完整 API 载荷。

对原始 JSON 证据文件，CLI 读取默认值无法拦截 `cat` 或 Node 打印。选择所需字段
之前先检查大小与键；完整证据保留在磁盘上。例如：

```sh
wc -c < receipt.json
jq 'keys' receipt.json
jq '{gate, judge, cutSha, surfaceCount, overallPackageVerdict}' receipt.json
```

只选取该文件中实际存在的字段。有意获取完整 CLI 输出时，先重定向到文件再检视
所选字段；通过管道传递命令时使用 `set -o pipefail`，以免格式化器掩盖其失败的
退出码。


- 二进制：`rig`
- 顶层命令组：`64`
- 输出模式：默认人类可读；许多命令还支持 `--json`
- 依赖守护进程的命令在守护进程停止或不健康时失败；`daemon`、`config`、
  `preflight` 与 `doctor` 还承担本地职责
- 托管应用通过常规 spec/库呈现面启动；权威的已交付示例是 `rig up secrets-manager`
- 仍在交付的旧呈现面：`package`

## 顶层命令

| 命令 | 说明 |
| --- | --- |
| `daemon` | 管理 OpenRig 守护进程 |
| `start` | 恢复入口——守护进程 + 内核 + 逐 rig 恢复（交互式或无头） |
| `status` | 显示 rig 状态 |
| `snapshot` | 管理 rig 快照 |
| `restore` | 从快照恢复 rig |
| `export` | 将 rig spec 导出为 YAML |
| `import` | 从 YAML 导入 rig spec |
| `ui` | UI 命令 |
| `package` | 管理智能体包（旧版） |
| `bootstrap` | 从 spec 文件引导一个 rig |
| `requirements` | 检查 rig spec 的依赖要求 |
| `discover` | 扫描未纳管的 tmux 会话 |
| `attach` | 将当前 shell 或智能体接入 rig 节点 |
| `bind` | 将发现的会话绑定到 rig 节点 |
| `adopt` | 物化拓扑并绑定发现的存活会话 |
| `reconcile-session` | 对手工恢复的会话做不启动、无输入的 adopt |
| `bundle` | 管理 rig bundle |
| `up` | 从 spec 或 bundle 引导一个 rig |
| `down` | 拆除一个 rig |
| `archive` | 归档一个 rig（软且可逆：从默认视图隐藏，保留全部数据） |
| `unarchive` | 取消归档一个 rig（`rig archive` 的逆操作）：使其回到默认视图 |
| `add` | 向运行中 rig 的既有工作舱添加成员（`add_member` converge 操作） |
| `env` | 检查并控制 rig 环境服务 |
| `file` | 基于 ssh/rsync 的跨主机文件移动（v0.4.4；唯一显式动词：`copy`） |
| `ps` | 列出 rig 及其状态 |
| `mcp` | 面向智能体集成的 MCP 服务器 |
| `agent` | 管理智能体 spec |
| `spec` | 管理 rig spec |
| `transcript` | 读取智能体会话记录输出 |
| `send` | 向智能体终端发送消息 |
| `capture` | 捕获智能体会话的终端输出 |
| `broadcast` | 向多个智能体会话发送消息 |
| `ask` | 从会话记录/聊天历史查询 rig 证据 |
| `chatroom` | rig 通信用的聊天室 |
| `specs` | 浏览、预览并管理 spec 库 |
| `whoami` | 显示 OpenRig 拓扑中的当前托管身份 |
| `auth` | 按运行时管理智能体认证 profile（仅限 CLI 本地；绝不打印令牌） |
| `config` | 检查并更改 OpenRig 配置 |
| `preflight` | 检查系统对 OpenRig 的就绪状态 |
| `doctor` | 核验 OpenRig 安装健康度 |
| `destroy` | 销毁 OpenRig 本地状态以恢复 |
| `expand` | 向运行中的 rig 添加工作舱 |
| `unclaim` | 释放被 adopt 的会话而不杀死 tmux |
| `release` | 从 rig 释放已认领的会话 |
| `launch` | 启动或重启运行中 rig 的一个节点 |
| `remove` | 从运行中的 rig 移除一个节点 |
| `shrink` | 从运行中的 rig 移除整个工作舱 |
| `setup` | 为 OpenRig 准备机器 |
| `stream` | 协作 L1——只追加的入口流 |
| `queue` | 协作 L3——属主工作队列 + inbox/outbox |
| `project` | 协作 L2——由智能体支撑的分类器，带守护进程强制执行的租约 + 幂等 + 回收 |
| `view` | 协作 L5——守护进程支撑的协作状态视图 |
| `watchdog` | 协作看门狗——守护进程原生的调度器 |
| `workflow` | 守护进程原生工作流运行时——声明式 spec + transactional-scribe 步骤投影 |
| `restore-packet` | 生成、读取并校验跨运行时恢复包 |
| `restore-check` | 检查各运行中 rig 的恢复就绪状态 |
| `context` | 浏览、预览、组织并管理操作者编写的上下文包（绝不投递） |
| `walk` | 让一个席位按节奏走完一串上下文片段 |
| `compact-plan` | 规划 Claude 原地压缩候选而不做任何压缩 |
| `heartbeat` | 从队列文件显示工作流执行证明状态 |
| `seat` | 检查 OpenRig 席位可观测性状态 |
| `agent-image` | 浏览、快照并管理智能体镜像 |
| `workspace` | 工作区原语——带类型类别的工具（frontmatter 校验） |
| `plugin` | 检查插件（只读）——list、show、used-by、validate |
| `scope` | scope 树原语——mission、slice、子 slice |
| `policy` | 操作者上下文模式绑定（sleep/desk/mobile/away/focus/debug） |

## 核心守护进程与系统命令

### `rig daemon`

用法： `rig daemon <subcommand>`

子命令：
- `start [--port <port>] [--host <host>] [--db <path>]`
- `stop`
- `status`
- `logs [--follow]`

注记：
- `start` 在启动守护进程之前，先以叠加方式调和规范实例布局，然后接受针对
  port、host 与 DB 路径的运行时覆盖。直接首次启动守护进程使用同一个初始化器。
  既有文件被保留，类型错误的托管路径在任何写入之前即被拒绝。参见
  `docs/reference/instance-layout.md`。
- 启动在实例初始化之前使用本地 `daemon-start.lock` 预留，由 `daemon start`、
  `start` 与 `up` 共享。并发的受支持启动会直接失败，不会再孵化另一个守护进程
  或执行其绑定前的数据库初始化。成功要求：从 `/healthz` 在每个必需监听器上取得
  被孵化子进程的数字 PID，并且通过原子发布 `daemon.json` 时子进程仍然存活。
  进程身份缺失或不匹配、监听器计划无效、子进程退出、探测未决，都不能发布成功。
  请使用配套的 CLI/守护进程组合；没有 PID 证据的旧端点是不够的。该本地预留不会
  串行化旧二进制或守护进程入口点的直接执行。
- 启动在同步状态写入器之前以及之后都会检查物理存活；仅凭排队的子进程事件无法
  证明该边界。若发布未通过核验，启动会拒绝并只撤回与本次启动的 PID、启动时间、
  监听器与 DB 相匹配的状态。它绝不移除接替的属主。
- 进程检查失败是不确定性，不是子进程已退出的证明。清理会等待属主子进程的退出
  证据；一条错误事件是不够的。
- 失败的启动只向自己的子进程发信号并有界地等待其退出。若清理无法确认，预留仍然
  保留，错误信息会指名 PID。被打断的启动器同样可能留下 `daemon-start.lock`。
  检查其记录的启动器/子进程 PID、`daemon.json` 与 `daemon.log`；只有在证明两个
  进程都不存在之后，才归档该预留再重试。没有超时接管：死掉的启动器可能留下一个
  存活的、未绑定的子进程。
- `logs` 读取守护进程日志输出，并可跟随输出。
- **部署身份（v0.4.4，OPR.0.4.4.11 FR-6/7）**：打包构建（通过
  `scripts/build-package.sh` 构建）会打上 `{semver, commit, dirty, builtAt}`
  戳；守护进程的 `/healthz` 载荷以叠加方式携带这四个戳字段，`rig --version`
  渲染 `<semver> (<commit8>[, dirty])`。源码/开发运行没有构建戳（绝不伪造
  SHA）；`/healthz` 仍报告其运行时 PID，`--version` 打印纯 semver。这就是
  30 秒过期部署诊断法：长期运行的主机上 `/healthz` 无戳或 commit 偏旧，说明
  你看到的是更旧的已部署构建，而不是源码树。来源：
  `packages/{daemon,cli}/src/build-info.ts`（`stampFields`）、
  `packages/daemon/src/server.ts`（`/healthz`）、`packages/cli/src/version.ts`。

### `rig status`

用法： `rig status`

注记：
- 面向人类的摘要命令。
- 打印守护进程状态、rig 摘要与 cmux 可用性。
- 不支持 `--json`。

### `rig ui`

用法： `rig ui open`

OpenRig UI 为实验性且处于维护模式。它不在积极开发中；支持属尽力而为。CLI 是
主要受支持的界面。欢迎贡献。

子命令：
- `open`

### `rig config`

用法：
- `rig config [--json] [--with-source]`
- `rig config get <key> [--show-source]`
- `rig config set <key> <value>`
- `rig config reset [<key>]`
- `rig config init-workspace [--root <path>] [--force] [--dry-run] [--json]`

支持的键：
- `daemon.port`
- `daemon.host`
- `db.path`
- `transcripts.enabled`
- `transcripts.path`
- `workspace.root`（以及 `init-workspace` 使用的其他以 workspace 为根的路径）
- `context.root`（默认 `$OPENRIG_HOME/context`；环境变量 `OPENRIG_CONTEXT_ROOT`）
  ——唯一可写、可寻址的上下文库。已移除的 `context.packs_root`、配置字段
  `context.packsRoot` 与环境变量 `OPENRIG_CONTEXT_PACKS_ROOT` 会被拒绝并给出
  替代指引。
- `context.system_world`（默认 `default`；环境变量
  `OPENRIG_CONTEXT_SYSTEM_WORLD`）——选择
  `$OPENRIG_HOME/context/system/system-world.yaml`、一个显式的替代清单路径，
  或显式的 `disabled` 状态。`rig context work-install` 会报告解析出的状态与
  来源。
- `skills.root`（默认 `$OPENRIG_HOME/skills`；环境变量 `OPENRIG_SKILLS_ROOT`）
  ——唯一权威的、由 Git 管理版本的托管技能目录。覆盖即替换默认值；不会叠加
  一个覆盖根。
- `snapshots.periodic.enabled`（默认 `true`）——守护进程侧周期快照调度器开关
  （v0.3.4）
- `snapshots.periodic.interval_seconds`（默认 `300`）——周期快照之间的间隔
- `snapshots.periodic.retention_keep`（默认 `10`）——每个 rig 保留的周期快照
  数量
- `feed.subscriptions.{action_required|approvals|shipped|progress|audit_log}`
  （布尔值）——For-You 信息流的五个扁平镜头开关（`OPENRIG_FEED_SUBSCRIPTIONS_*`
  环境变量映射）
- `feed.subscriptions.<hostId>.enabled`（布尔值；**v0.4.4，OPR.0.4.4.15**）
  ——唯一一类注册的动态键 CLASS（不是通用动态键机制）：聚合多主机 For-You
  信息流的每主机订阅开关。`hostId` 段字符集为 `[A-Za-z0-9_-]+`（带点的 host id
  无法在点分键中表达，会被当作未知拒绝）；扁平开关尾部 + `enabled` 在两种拼写
  中都是保留段，因此 host id 永远不会遮蔽扁平键。v1 中该动态类没有环境变量
  映射——仅限文件/API。CLI 配置存储携带同一类（与守护进程存储对等锚定）。

优先级：
- CLI 标志
- 环境变量
- 配置文件
- 默认值

注记：
- `--with-source`（顶层）与 `--show-source`（`get`）报告每个键的来源/默认值，
  以实现诚实的来源追溯。
- `init-workspace` 以叠加方式在 `~/.openrig/workspace/`（或 `--root` 覆盖处）
  脚手架生成 `missions/`、`exhaust/`、`SPEC.md`、`project.yaml`、
  `workspace.yaml` 与 `.gitignore`。`--dry-run` 只预览不写入。`--force` 是
  已弃用的兼容开关，会保留既有文件。v0.3.0 新增。
- `snapshots.periodic.*`（v0.3.4）：守护进程侧调度器按 `interval_seconds` 为
  每个 rig 周期性快照，并保留最新的 `retention_keep` 个。恢复时，`auto-periodic`
  与 `auto-pre-down` 快照之间最新者胜出。

旧环境变量兼容：原有的 runtime 键仍接受已弃用的 `RIGGED_*` 别名。新的带类型
配置键只用 `OPENRIG_*`。

### `rig auth`

管理智能体认证 profile。该命令是 **CLI 本地的**——它绝不触碰守护进程，因此
令牌值绝不会进入守护进程的队列、流、数据库或日志。运行时是通过 `--runtime`
的正交轴（MVP：`codex`，也是默认值），仿照 `gh auth switch/status` 与
`aws --profile` / `kubectl config use-context`。它有意**不是** `rig codex-auth`，
也不是 `rig codex` 这种以厂商名为名词的命令族——运行框架是一个标志，不是命令
名词（见 `conventions/cli-read-command-grammar`）。

用法：
- `rig auth status [--runtime codex]`——认证文件是否存在、文件模式、已保存
  profile 数与登录状态。**不含机密**：登录状态只从运行时 CLI 的退出码推导，
  绝不看其输出。
- `rig auth list [--runtime codex]`——已保存的 profile 名称。
- `rig auth save <profile> [--runtime codex]`——把活跃认证文件快照进一个具名
  profile（带模式守护的字节级复制；内容绝不会被命令读入或回显）。
- `rig auth switch <profile> [--runtime codex]`——激活一个已保存 profile
  （以 `0600` 复制到活跃认证文件上）。
- `rig auth validate <profile> [--runtime codex]`——检查 profile 的文件模式 +
  JSON 可解析性。这**不是**活体认证检查；解析失败只报告固定原因，绝不报告
  文件内容。
- `rig auth seats list|show <seat>|set …|report [--runtime codex]`——每个
  操作者的席位 → profile **元数据**注册表。

Profile 存储：
- `CODEX_HOME`（默认 `$HOME/.codex`，可用环境变量覆盖）保存活跃的 `auth.json`、
  `auth-profiles/` 目录（profile `0600`、目录 `0700`）与
  `auth-seat-registry.tsv`。
- 交付时为**空**：没有示例或捆绑的 profile/注册表。profile 名称使用严格的
  允许列表（以字母数字开头，字符集 `[A-Za-z0-9._-]`，≤64 字符）；符号链接或
  树外的 profile 路径会被拒绝。

机密 + 诚实不变量：
- **任何令牌值都绝不被打印、记录、排队、流式输出或提交**。`status`/`validate`
  只报告存在性/模式/可解析性/登录状态。
- **席位注册表标签是元数据，不是活体账户的证明**。标有 profile "X" 的席位
  并不能证明正在运行的会话真的在使用该账户；命令输出会说明这一点。注册表不
  存储任何令牌/恢复机密——其列为
  `seat / rig / runtime / cwd / auth_profile / updated_ts`。

注意：存活的运行时会话不会就地切换账户——重启受影响的席位以拾取新切换的
profile。

### `rig preflight`

用法： `rig preflight [--json]`

注记：
- 基于本地配置运行系统就绪检查。
- 失败时，打印失败项、其影响与修复方法。

### `rig doctor`

用法： `rig doctor [--json]`

注记：
- 核验打包/本地 CLI 使用的安装健康度。
- 检查守护进程 dist、UI dist、Node 版本、`tmux`、可选的 `cmux` 控制健康度、
  可写状态路径与守护进程端口可用性。
- 在 macOS 上，当 tmux 鼠标模式看似被禁用时还会警告，给出当前服务器的修复
  （`tmux set -g mouse on`），并指向 `~/.tmux.conf` 中的持久修复。
- `cmux` 问题只是警告，不是硬失败。没有 `cmux` OpenRig 仍可工作；只有
  `Open CMUX` 工作流不可用。
- `--json` 适合智能体使用，只在真实失败时以非零退出，警告不算。

### `rig destroy`

用法：
- `rig destroy --state [--backup] --yes --confirm destroy-openrig-state`
- `rig destroy --all [--backup] --yes --confirm destroy-openrig-state`

注记：
- 这是针对被污染的本地 OpenRig 状态的破坏性恢复呈现面。
- `--state` 停止守护进程，必要时清除配置端口上的活跃 OpenRig 监听器，轮换或
  删除生效的状态根，并重建一个空的状态根。
- `--all` 包含 `--state`，外加对可从当前 OpenRig 数据库发现的会话做托管 tmux
  会话清理。
- `--backup` 把状态根挪到无冲突、带时间戳的路径，如
  `~/.openrig.backup-YYYYMMDD-HHMMSS`。
- 托管 tmux 清理刻意保守。只移除当前 DB 状态中存在的会话；无关的 tmux 会话
  原样保留。
- 人类输出先打印紧凑的销毁计划，再打印销毁结果。

### `rig start`

用法：
- `rig start`（交互式：守护进程 + 内核 + 挑选并恢复）
- `rig start --last [--json]`（无头：恢复上次在运行的 rig）
- `rig start --all [--json]`（无头：恢复所有拥有可用快照的 rig）
- `rig start --rigs <name> [<name>...] [--json]`（无头：只恢复指名的 rig）

注记：
- v0.3.4（slice 01）引入的恢复入口。只做编排：组合守护进程启动 + 内核自动引导
  等待 + 逐 rig 恢复原语；不重写任何逻辑。
- 不是上手引导的主角——那仍是 `rig up <starter>`。`rig start` 用于重启/崩溃后
  的恢复。
- TTY 交互流程列出上次运行的候选及就绪摘要（`[ready to resume]`、
  `[will ask before fresh]`、`[fresh start]`、`[mixed]`），然后提供全部恢复或
  空格多选挑选器。
- 无头模式（`--last`、`--all`、`--rigs`）零提示；若节点返回 `awaiting-decision`，
  CLI 会如实报告并打印 `rig up --existing <rig> --fresh <logicalId>` 命令供
  采取行动。
- 呈现面已对照 `packages/cli/src/commands/start.ts` 于 `03a5f915`（v0.3.4）
  完成源码核验。

### `rig mcp`

用法： `rig mcp serve [--port <port>]`

子命令：
- `serve`

已交付的 MCP 工具：
- `rig_up`
- `rig_down`
- `rig_ps`
- `rig_status`
- `rig_snapshot_create`
- `rig_snapshot_list`
- `rig_restore`
- `rig_discover`
- `rig_bind`
- `rig_bundle_inspect`
- `rig_agent_validate`
- `rig_rig_validate`
- `rig_rig_nodes`
- `rig_send`
- `rig_capture`
- `rig_chatroom_send`
- `rig_chatroom_watch`

## rig 生命周期与 spec

### `rig bootstrap`

用法：`rig bootstrap <spec> [--plan] [--yes] [--json]`

参数：
- `spec`：rig spec YAML 文件的路径，或一个库名称

注记：
- 裸名称先经 spec 库解析，再回退到原始 source 值。

### `rig requirements`

用法：`rig requirements <spec> [--json]`

参数：
- `spec`：rig spec YAML 文件的路径

注记：
- `rig requirements` 是 spec/应用专属的依赖呈现面。
- 主机级安装健康用 `rig doctor`，rig 专属依赖要求用 `rig requirements <spec>`。

### `rig up`

用法：`rig up <source> [--plan] [--yes] [--cwd <path>] [--target <root>] [--existing] [--fresh <seats...>] [--json]`

参数：
- `source`：`.yaml` 或 `.rigbundle` 的路径，或一个裸名称

实际的 source 解析：
- 绝对/相对 YAML 路径：从该 spec 引导
- `.rigbundle` 路径：从该 bundle 安装/引导
- 不带斜杠/扩展名的裸名称：
  - 先查 spec 库
  - 若库中无匹配，则将其视为既有 rig 的恢复/上电目标
  - 若库 spec 与既有 rig 同名，则以歧义错误退出

当前行为注记：
- `--cwd <path>` 仅为本次运行覆盖全体成员的启动工作目录。对路径形式的
  `rig up <install-internal-spec>` 调用，CLI 默认把 `cwd` 设为调用者目录
  （slice-22 Bug 3），使库 spec 与路径形式行为一致。
- `--target <root>` 只用于 bundle/包安装。它不覆盖智能体工作目录。
- `--existing` 跳过库 spec 名称解析，直接把 `<source>` 当作既有 rig 名称
  （当库 spec 与已停止 rig 同名时用于消歧）。
- `--plan` 只预览不执行恢复（只读）。预览遵循诚实的异步超时，并报告每个节点
  打算采取的动作。
- `--fresh <seats...>` 有意对指名席位（逻辑 id）做全新引导而非恢复其原会话
  （操作 B）；在每节点状态词表中报告为 `fresh-primed`。可重复：
  `--fresh seat-a --fresh seat-b` 或 `--fresh seat-a seat-b`。
- `local:` 形式的 `agent_ref` 值相对 rig spec 目录解析，而不是调用者 shell 的
  cwd。
- 若把内置 spec 复制到新目录，请把它的 `agents/` 树一并放在旁边，或把这些引用
  改写为 `path:/absolute/path`。
- 托管应用是一等 `up` 目标。`rig up secrets-manager` 从库启动已交付的 Vault
  示例。
- **`rig up factory-rsi`（OPR.0.4.6.FAC2）**：启动单 rig 递归自我改进工厂 MVP
  预置模板——七个席位（`plan`/`build`/`check`/`review`/`dogfood`/`release`/`orch`）
  运行 `factory-rsi` 内置工作流（内环 plan→build→check→review→release）；
  dogfood 席位带外针对已交付产品运行，并把发现反馈进下一轮 plan。与工作区无关：
  `rig up factory-rsi --cwd <repo>` 把循环指向要改进的仓库。
- v0.3.2 细节痛点修复轮（slice-22）：启动前失败现在返回结构化 HTTP 4xx
  （`cycle_error` / `preflight_failed` / `validation_failed` /
  `service_boot_failed`）而不是裸 500；失败的引导不再在磁盘上留下孤儿 rig 记录。
- **v0.4.4（OPR.0.4.4.11）——整拓扑 source**：一份 `.rigtopology` 清单（或正文
  声明为拓扑形式的 YAML 文件）可在一次分阶段拉起中启动多个 rig。v0 清单条目
  **只允许 spec 路径**（封闭键清单：`.rigbundle` 与裸库名条目在解析时即被拒绝，
  并逐条目给出 what/why/fix 说明 v0 边界）。逐条目的 `host: <id>` 是拓扑条目
  唯一的放置机制——`rig up --host <id> <topology>` 在分发前即被拒绝（两种放置
  机制不得并存）。启动器在路由侧获取逐 rig 启动锁，并报告封闭的逐条目聚合
  `{ok | failed | skipped}`（skipped 是显式的——锁冲突或上游失败绝不会读作
  静默成功）。来源：`packages/cli/src/commands/up.ts`（`.rigtopology` 嗅探 +
  `--host` 拒绝）、`packages/daemon/src/domain/topology/{topology-manifest,multi-rig-launcher,remote-up-leaf}.ts`、
  `packages/daemon/src/routes/up.ts`。
- v0.3.4：对既有 rig，`rig up` 默认恢复原会话。逐席位显式选择审慎全新引导需经
  `--fresh <seats...>`。每节点暴露的五词恢复状态词表是 `resumed` /
  `fresh-primed` / `awaiting-decision` / `attention_required` / `failed`。在
  TTY 上，`awaiting-decision` 节点触发交互式 [y/N] 询问；无头模式下如实报告，
  并给出确切的 `rig up --existing <rig> --fresh <logicalId>` 后续命令。

成功模式：
- 全新引导
- 恢复既有 rig
- 部分引导（非零退出）

### `rig down`

用法：`rig down <rig> [--delete] [--force] [--snapshot] [--json]`

`<rig>` 接受 rig 的**名称或 id**，与 `rig up` 对称。拆除前，名称会经活跃
（未归档）rig 摘要解析为 id。

标志：
- `--delete`：拆除后删除 rig 记录
- `--force`：立即杀死会话
- `--snapshot`：拆除前先快照

注记：
- `--snapshot` 成功时，人类输出包含恢复命令。
- 若 rig 名称唯一可复用，交接优先给出 `rig up <rigName>`。
- 破坏性操作安全：若名称匹配多个 rig，`rig down` 拒绝拆除其中任何一个，并列出
  匹配的 id——请用 `rig down <id>` 重跑。id 总是直接解析（id 绝无歧义）。

### `rig archive`

用法：`rig archive <rigId> [--force] [--json]`

标志：
- `--force`：即使 rig 正在运行或已降级也归档
- `--json`：面向智能体的 JSON 输出

注记：
- 软性、可逆的归档：从默认资源管理器与 `rig ps` 中隐藏该 rig，同时保留 rig
  记录、拓扑与快照。
- 不同于 `rig down --delete`（delete 是破坏性的；archive 可恢复）。
- 已归档 rig 从默认 `rig ps` 中隐藏；用 `rig ps --include-archived` 查看。
- 归档运行中或降级的 rig 需要 `--force`；否则调用返回 HTTP `409` 与三段式诚实
  错误，退出码 `2`。
- 用 `rig unarchive <rigId>` 反向操作。
- 发出 `rig.archived` SSE 事件。
- 呈现面已对照 `packages/cli/src/commands/archive.ts` 于 `53794fbe`（v0.3.3）
  完成源码核验。

### `rig unarchive`

用法：`rig unarchive <rigId> [--json]`

注记：
- `rig archive` 的逆操作：清除 `archived_at` 标志，使 rig 回到默认资源管理器
  与 `rig ps` 视图。
- 始终非破坏（归档期间行与快照都被保留）；没有 `--force` 也没有运行中 rig
  守卫。
- 发出 `rig.unarchived` SSE 事件。
- 呈现面已对照 `packages/cli/src/commands/unarchive.ts` 于 `53794fbe`（v0.3.3）
  完成源码核验。

### `rig env`

用法：
- `rig env status <rig> [--json]`
- `rig env logs <rig> [service] [--tail <n>]`
- `rig env down <rig> [--volumes]`

注记：
- 该呈现面只对带服务支撑的 rig 与托管应用有意义。
- `status` 解析 rig 名称或 ID，并带着一次诚实的新鲜度探测返回 env 回执。响应
  包含 `probeStatus`（fresh/stale/no_orchestrator），操作者可据此区分当前实况
  与缓存状态。
- `logs` 代理 compose 支撑的服务日志；`[service]` 可选。
- `down` 拆除 rig 环境。`--volumes` 覆盖已存储的拆除策略，强制经
  `docker compose down --volumes` 移除卷。
- 注意：`rig ps` 尚未呈现 env 健康度。运行时 env 实况可通过 `rig env status`
  与 rig 抽屉的 `Env` 标签页获取。

### `rig ps`

用法：
- `rig ps [--json] [--full] [--rig <name>] [-A | --all-rigs] [--session <sess>] [--limit <n>] [--fields <list>] [--summary] [--filter <key=value>] [--host <id>]`
- `rig ps --nodes [--json] [--full] [--rig <name>] [-A | --all-rigs] [--session <sess>] [--limit <n>] [--fields <list>] [--summary] [--filter <key=value>] [--active] [--host <id>]`

注记：
- **v0.4.4——整合的全体 rig 默认 + 揭示阶梯（OPR.0.4.4.21）**：默认是**每个
  ACTIVE rig 各一行紧凑行**——O(rigs)，绝不做全舰队节点扇出——外加三个承重
  显示元素：主机汇总行（"N rigs · M seats · K need attention"）、归档/停止
  计数行（历史折叠为一行）以及教授下钻阶梯的引导页脚。v0.4.0 的当前 rig 默认
  已退役（它把运行中的 rig 藏出了操作者视野）；会话 rig 默认现在只适用于
  `--nodes`，且只在本地适用——**隐式范围默认值不跨越主机边界**（远程
  `--nodes` 需要显式 `--rig` 或 `-A`）。`-A`/`--all-rigs` 只保留唯一含义：
  `--nodes` 的舰队扩宽器；裸 `-A` 返回一个结构化教学错误，指名历史用
  `--include-archived`。明示契约：默认 `--json` 是包含全部未归档 rig（含已
  停止）的裸数组（既有键保留；叠加 `attentionCount`）；只有人类表格折叠已
  停止的 rig。扇出（`--all-hosts`/`--hosts`）发出 P4 内共享的
  `AggregatedPayload`（带 hostId 戳的 `items` + 封闭枚举的每主机 `hosts[]`
  状态），默认只做汇总；完整显式阶梯（`--all-hosts --nodes -A`，`--full` 取
  完整记录）按节点扇出带 hostId 戳的投影行。从旧消防水管迁移：
  `rig ps --nodes -A --full`。默认 `--json` 输出是每节点的紧凑 TL;DR 投影：
  `session`、`rig`（在 `-A` 下消歧）、`activity`（状态 + 原因）、`assigned` /
  `pending` 计数、以 `resumeType` + `resumeTokenPresent` 表示的恢复摘要
  （布尔值——不是令牌值，遵循 slice-34 安全修正）。`--full` 返回完整每节点
  记录（原始字节等值透传——保留先前形状，包括 `tmuxAttachCommand`、
  `resumeCommand`、`contextUsage`、完整 `agentActivity`、`restoreOutcome` 等；
  需要时 `resumeToken` 值仍是 `--full` 的一部分）。全状态仍是默认（遵循基于
  orch-lead 的裁定：ps 呈现拓扑/就绪，停止/可恢复/需关注正是可行动信号——
  不同于默认只列活跃条目的队列列表）。`--active` / `--running` 是可选加入的
  活跃过滤器（原本已有）。根治了约 77,000 token 的状态瞥视事故 + 舰队规模的
  无限默认输出炸弹。
- **守护进程节点列表载荷在源头瘦身（slice 26）**：`recoveryGuidance` 不再在
  每个节点上序列化为近乎相同的模板化散文——改移到顶层的一个按引用指引映射，
  4 个现有消费者仍能解析它。`contextUsage` 在列表载荷中是紧凑摘要（完整遥测
  仍可经 `rig whoami` / 明细查询逐节点获取）。连 `--full` 与 UI 消费者也不再
  为冗余的每节点大块买单。
- `rig ps` 列出 rig 摘要。默认人类列（v0.4.4）：`RIG`、`NODES`、`RUNNING`、
  `ACTIVE`、`WORK`、`ATTN`、`STATUS`、`LIFECYCLE`、`UPTIME`、`SNAPSHOT`。
  `LIFECYCLE` 列显示逐节点生命周期状态的 rig 级折叠，代码为
  `run`/`rec`/`stp`/`deg`/`att`；`ATTN` 是叠加的需关注计数。
- `rig ps --nodes` 展开为当前（或 `--rig` 指名的）rig 的节点清单——
  `--nodes -A` 取跨 rig 清单（v0.4.4 范围界定）。默认人类列包括 `STATUS`、
  `STARTUP`、`LIFECYCLE`、`ACTIVITY`、`RESTORE`、`ERROR`，启动期与存活运行时
  状态可并排比较，无需另拼诊断命令。
- rig 与节点两层的 JSON 输出都包含 `rigName` 别名（等于 `name`）以向前兼容；
  智能体代码应优先用 `rigName`。默认 `--json` 是裸数组（向后兼容）；信封形状
  `{entries, totalRigs|totalNodes, truncated, hint?}` 只在设置了 `--limit`、
  `--fields`、`--summary` 或 `--filter` 时使用。
- 为上下文窗口安全，默认人类输出有界：rig 在 50 处截断，页脚给出总数 +
  `--full` 退出途径；节点在 100 处截断，形状相同。`--full` 关闭截断。
  `--limit <n>` 设置显式界限。
- `--summary` 只发出聚合计数（rig 用 `byStatus`、`byLifecycle`；节点用
  `bySessionStatus`、`byLifecycle`）；适合无需逐条详情的快速舰队检查。跨切面
  不一致（如 `running` 的 rig 带有 `attention_required` 节点）在 summary 模式
  下不可直接见——请改用 `--filter lifecycleState=attention_required` 收窄。
- `--fields <list>` 把 JSON 输出投影到逗号分隔的顶层字段允许列表。未知键在
  任何 HTTP 调用之前即被拒绝，错误指明未知键与排序后的支持列表。拒绝时退出码
  为 `1`。rig 级接受：`rigId`、`name`、`rigName`、`nodeCount`、`runningCount`、
  `activeCount`、`hasWorkCount`、`attentionCount`、`status`、`lifecycleState`、
  `uptime`、`latestSnapshot`。节点级（配合 `--nodes`）接受：`rigId`、`rigName`、
  `logicalId`、`podId`、`podNamespace`、`canonicalSessionName`、`nodeKind`、
  `runtime`、`sessionStatus`、`startupStatus`、`restoreOutcome`、`oriented`、
  `lifecycleState`、`tmuxAttachCommand`、`resumeCommand`、`latestError`、
  `terminalActive`、`hasAssignedWork`、`pendingWorkCount`、`agentActivity`、
  `contextUsage`、`heldReason`。`name` 仅限 rig 级；节点条目请用 `rigName`
  （拒绝错误含提示）。嵌套字段（如 `agentActivity.state`）不做下钻；传整个
  对象名（如 `agentActivity`），下游再读嵌套值。
- `--filter <key=value>` 接受 `status`、`lifecycleState`、`name-prefix`、`name`
  与 `agentActivity.state`（PL-019；节点级——配合 `--nodes` 使用）。未知键在
  任何 HTTP 调用之前即被拒绝，错误清晰指明支持列表。对 `agentActivity.state`，
  允许值为 `running`、`needs_input`、`idle`、`unknown`；无效值快速失败，错误
  分三段（失败了什么 / 允许什么 / 该做什么）。
- `--active`（PL-019；节点级）是 `--filter agentActivity.state=running` 的
  语法糖。`--active` 与 `--filter` 组合会被拒绝——请选一种显式形式。同一测试
  样本上输出与显式过滤形式完全一致。
- `--host <id>` 经单跳 ssh 把同一命令路由到 `~/.openrig/hosts.yaml` 中声明的
  远程主机（CLI 侧 shell 调用；守护进程不参与）。所有塑形标志（`--nodes`、
  `--full`、`--limit`、`--fields`、`--summary`、`--filter`、`--json`）都会转发
  给远程 `rig ps`。成功时远程 rig 输出逐字透传；失败按封闭的跨主机执行契约
  区分为 `ssh-unreachable` / `permission-gate` / `remote-daemon-unreachable` /
  `remote-command-failed`。
- 退出码：
  - `0` 成功
  - `1` 守护进程未运行，或 `--filter` / `--limit` / `--fields` 无效
  - `2` 守护进程取数失败

### `rig snapshot`

用法：
- `rig snapshot <rigId> [--intended-seats <ids>]`
- `rig snapshot list <rigId>`

子命令：
- `list <rigId>`

### `rig restore`

用法：
- `rig restore <snapshotId> --rig <rigId>`
- `rig restore status <attemptId> --rig <rigId> [--json]`

重要：
- `--rig <rigId>` 在源码中是必需的，即使帮助文本没有醒目标记这一点。

注记：
- 人类输出打印每个已恢复节点与任何失败节点的错误。
- 任一被恢复节点失败则非零退出。
- 已启动的异步恢复会打印其 attempt id。`status` 从该持久 attempt 推导原始与
  当前的预期席位集判定、快照选择、历史排除项以及未决的预期席位。

### `rig restore-check`

用法：`rig restore-check [--rig <name>] [--as <session>] [--full] [--no-queue] [--no-hooks] [--json]`

注记：
- 检查各运行中 rig（或用 `--rig` 指定一个 rig / `--as` 指定一个席位）的恢复
  就绪状态。
- **v0.4.0——摘要 + 未就绪默认（slice 29）**：默认输出是一个摘要块（总席位 /
  就绪 / 未就绪 / 出错降级计数）加上只紧凑列出**未就绪**席位（席位 + 就绪
  原因）。`--full`（或 `--json --full`）返回当今完整的全舰队逐席位就绪状态。
  紧凑模式下，守护进程跳过就绪席位的逐席位细节组装（计算判定，省略细节）。
  根治了读命令呈现面上实测最大的 token 炸弹（约 79,000 token → 低数千）。
- 摘要默认正确识别每一个未就绪席位（无误报就绪遗漏）——即使就绪席位的细节被
  丢弃，可行动信号也无损。
- `--no-queue` 跳过队列文件检查；`--no-hooks` 跳过钩子检查。
- 退出码：`0` 可恢复（或带注意事项可恢复），`1` 不可恢复（发现红色阻塞项），
  `2` 未知 / 探测错误。

### `rig restore-packet`

用法：`rig restore-packet <subcommand>`

子命令：
- `write [options]`——从源会话或 JSONL 文件生成恢复包。
- `read <packet-dir> [--json]`——渲染恢复包内容（人类可读或 JSON）。
- `validate <packet-dir> [--json]`——按 v0 模式校验恢复包。

注记：
- 包形状是跨运行时的 v0 标准（经运行时解析器 + 脱敏同时支持 Claude Code 与
  Codex 会话记录）。
- `write` 产出一个包目录，含规范模式文件与 `omitted-records` 记账。
- `read` 与 `validate` 作用于既有包目录，不对其做变更。

### `rig export`

用法：`rig export <rigId> [-o|--output <path>]`

默认输出路径：
- `rig.yaml`

### `rig import`

用法：
- `rig import <path> [--instantiate] [--materialize-only] [--preflight] [--target-rig <rigId>] [--rig-root <root>]`

注记：
- 接受 YAML rig spec。
- `--target-rig` 是向既有 rig 的叠加物化。
- `--rig-root` 用于工作舱感知的解析。

### `rig bundle`

用法：`rig bundle <subcommand>`

子命令：
- `create <spec> -o <path> [--name <name>] [--bundle-version <ver>] [--include-packages <refs...>] [--rig-root <root>] [--notes <text>] [--min-daemon-version <ver>] [--min-cli-version <ver>] [--json]`——把 rig spec 及其声明内容打包为
  `.rigbundle`。v0.3.2 slice-05 交付一等跨原语打包：skills + plugins
  （hybrid）+ workflow_specs + context_packs + agent_images 端到端内置携带，
  双侧路径围栏、符号链接逃逸防护与完整性哈希。
- `inspect <path> [--json]`——检视 `.rigbundle` 清单。v0.3.2 将跨原语内容字段
  升为一等。
- `install <path> [--plan] [--yes] [--target <root>] [--skip-version-check] [--force] [--json]`——安装 `.rigbundle`。把每种声明的内容类别路由到
  `$OPENRIG_HOME` 下的规范库。`--skip-version-check` 是操作者显式覆盖安装期
  守护进程/CLI 兼容门（不推荐）。`--force` 是操作者显式覆盖安装期冲突检查
  （不推荐；冲突可能产生部分安装状态）。
- `history [--rig <name>] [--since <iso>] [--json]`——列出
  `~/.openrig/bundle-audit.jsonl` 中的 bundle 安装审计记录。按目标 rig 名称与
  最早的 `installedAt` 过滤。

重要：
- 按源码定义，`bundle create` 必须有 `-o, --output <path>`。
- v0.3.2 上调了安装超时（原为 5 秒——对 tmux 会话引导式安装太短）。
- 推迟到 0.3.3（按发布包）：agent/端口/托管应用冲突检测（Item 4.3）、更广的
  安装进既有 rig 通路验收（Item 4.4）与 `--target-name` CLI 标志（slice-05
  Item-3 子范围；设计上取决于 CLI 呈现面决定）。

### `rig package`（旧版）

用法：`rig package <subcommand>`

子命令：
- `validate <path>`
- `plan <path> [--target <dir>] [--runtime <runtime>] [--role <name>]`
- `install <path> [--target <dir>] [--runtime <runtime>] [--role <name>] [--allow-merge]`
- `rollback <installId>`
- `list`

注记：
- 在已交付 CLI 中，package 呈现面被明确标记为 legacy。

### `rig spec`

用法：`rig spec <subcommand>`

子命令：
- `validate <path> [--json]`
- `preflight <path> [--rig-root <root>] [--json]`

### `rig agent`

用法：`rig agent validate <path> [--json]`

子命令：
- `validate <path>`

### `rig specs`

用法：`rig specs <subcommand>`

子命令：
- `ls [--kind <kind>] [--json]`
- `show <name-or-id> [--json]`
- `preview <name-or-id> [--json]`
- `add <path> [--json]`
- `sync [--json]`
- `remove <name-or-id> [--json]`
- `rename <name-or-id> <new-name> [--json]`

注记：
- `specs` 是 rig、智能体与托管应用的库呈现面。
- `preview` 从守护进程返回结构化评审数据。
- `add` 接受 YAML spec 文件，或包含 `rig.yaml` / `agent.yaml` 的完整 spec
  目录。
- 目录式添加会把整棵树复制进用户库，使相邻的智能体、指引、技能与文档保持
  可用。
- `preview secrets-manager` 是权威的托管应用评审示例。

## 发现与拓扑变更

### `rig discover`

用法：`rig discover [--json] [--draft]`

注记：
- 扫描未纳管的 tmux 会话。
- `--draft` 从发现集生成候选 rig spec。

### `rig attach`

用法：
- `rig attach --self --rig <rigId> --node <logicalId> [--cwd <path>] [--display-name <name>] [--print-env] [--json]`
- `rig attach --self --rig <rigId> --pod <namespace> --member <name> --runtime <runtime> [--cwd <path>] [--display-name <name>] [--print-env] [--json]`

注记：
- 目前 `--self` 为必需。
- 节点接入与工作舱创建接入是互斥模式。
- 在 tmux 支撑的 shell 中，命令记录 tmux 接入元数据；否则记录
  `external_cli` 接入。
- `--print-env` 打印 `OPENRIG_NODE_ID` 与 `OPENRIG_SESSION_NAME` 的 shell 导出
  语句。

### `rig bind`

用法：`rig bind <discoveredId> --rig <rigId> (--node <logicalId> | --pod <namespace> --member <name>)`

重要：
- `--rig <rigId>` 必需。
- 绑定模式互斥：
  - 既有节点：`--node <logicalId>`
  - 创建新节点：`--pod <namespace> --member <name>`

### `rig adopt`

用法：
- `rig adopt <path> --bind <logicalId=tmuxSessionOrDiscoveryId> [--bind ...] [--target-rig <rigId>] [--rig-root <root>] [--json]`

重要：
- `--bind` 必需且可重复。
- 输入文件必须是带 `pods` 的工作舱感知 RigSpec。

注记：
- 先物化拓扑，然后解析/绑定发现的会话。
- JSON 模式下，发出物化后的节点加绑定结果。

### `rig reconcile-session`

用法：
- `rig reconcile-session <session> [--rig <rigId>] [--node <logicalId>] [--no-launch] [--json]`

参数：
- `session`：要 adopt 的存活会话的规范会话名（如 `dev-impl@my-rig`）。

标志：
- 当会话解析有歧义时，`--rig` 与 `--node` 是成对的消歧器（必须同时给出）。
- `--no-launch` 是本命令唯一的模式；接受它只为显式性。

注记：
- 对手工恢复的规范会话做不启动、无输入的 adopt（slice 03 / v0.3.4）。操作者
  已在外部（如 `claude --resume`、`codex resume`）于其规范 tmux 会话内恢复了
  该会话；守护进程仍显示席位下线。
- 把存活进程绑定到它自己的持久化节点（同一节点 id，不重设键），并更新投影，
  使 `rig ps` / 拓扑 / send / capture / 队列路由重新可用。
- 绝不启动、重启、杀死、重放启动流程、按恢复菜单、压缩，或向窗格键入。
- 任何无法证明的都报告为投影漂移；绝不声称会话连续性。
- 呈现面已对照 `packages/cli/src/commands/reconcile-session.ts` 于 `03a5f915`
  （v0.3.4）完成源码核验。

### `rig expand`

用法：`rig expand <rig-id> <pod-fragment-path> [--json] [--rig-root <path>]`

注记：
- 向运行中的 rig 添加工作舱片段。
- `--rig-root` 控制智能体解析。
- 成员 YAML 可携带 `session_source`（见下文"会话来源声明"），让新席位从既有
  的原生会话（`mode: fork`）或操作者声明的工件（`mode: rebuild`）起步。

### `rig add`

用法：`rig add <rig-id> <pod-namespace> <member-fragment-path> [--json] [--rig-root <path>]`

参数：
- `<rig-id>`：目标 rig 的 id
- `<pod-namespace>`：要添加成员的既有工作舱的命名空间
- `<member-fragment-path>`：YAML/JSON 成员片段文件的路径（spec 的 snake_case
  字段）

注记：
- `add_member` converge 操作动词：从 YAML/JSON 成员片段文件向运行中 rig 的
  既有工作舱添加成员。
- 成员片段同时接受裸形式（顶层成员字段）与包装形式
  （`{ member: {...}, edges?: [...] }`）。裸形式下的顶层 `edges:` 字段会被
  提升为工作舱本地边，绝不会被静默丢弃。
- **OPR.0.4.6.FAC1**：片段接受可选的 `role: <name>`（字符集 `A-Za-z0-9_.-`；
  `runtime: terminal` 上被拒绝）。声明了角色的席位即有资格参与本 rig 的
  工作流角色→席位能力解析——扩容 = 在该角色下添加成员（本动词就是增长路径）。
  角色逐席位自愿加入：无角色成员仍只能经显式 `preferred_targets` 到达；已
  提供的角色会被校验，绝不静默丢弃。
- 存在但非数组的 `edges` 字段会被以诚实错误拒绝（不静默丢弃）。
- `--rig-root <path>` 控制智能体解析。
- HTTP 结局：成功为 `201`（含新节点 + 持久化边 + 可选警告）；
  `409 member_conflict`；`400 validation_failed` / `preflight_failed`；
  `404 pod_not_found`（列出既有工作舱）。
- HTTP 调用失败或新节点未完全启动（`status !== "launched"`）时退出码非零。
- 呈现面已对照 `packages/cli/src/commands/add.ts` 于 `53794fbe`（v0.3.3）
  完成源码核验。

### 会话来源声明（`session_source`）

rig spec 或 `rig expand` 载荷中的成员 YAML 可声明启动期 `session_source`，
控制新的托管席位如何推导其起始上下文。v1 支持两种模式：

```yaml
# Fork from a prior native runtime conversation. Captures and persists a NEW
# post-fork token; the parent token is NEVER persisted onto the new seat.
members:
  - id: reviewer-2
    runtime: claude-code        # or "codex"; not valid on terminal
    session_source:
      mode: fork
      ref:
        kind: native_id         # v1 fork mode supports "native_id" only
        value: "0b0165d7-cb4d-4650-90de-15c0a1ede9e6"
```

```yaml
# Rebuild from operator-declared artifacts (CULTURE, role doc, handover packet,
# queue files, session logs). Fresh-launches the harness and seeds the running
# TUI with the artifacts in the operator-declared trust-precedence order.
# The seat's continuityOutcome is `rebuilt` (NEVER `fresh`/`resumed`/`forked`)
# and NO `resumeToken` is persisted.
members:
  - id: writer-2
    runtime: claude-code        # or "codex"; not valid on terminal
    session_source:
      mode: rebuild
      ref:
        kind: artifact_set      # v1 rebuild mode supports "artifact_set" only
        value:                  # ordered list, highest-trust first
          - <substrate-shared-docs>/rigs/<rig>/CULTURE.md
          - <substrate-shared-docs>/specs/agents/<role>.md
          - /path/to/handover-packet.md
          - /path/to/state/<pod>/<member>.queue.md
          - /path/to/state/<pod>/shared.session.log
          - /path/to/state/<pod>/<member>.session.log
```

注记：
- `terminal` 运行时拒绝 `session_source`（没有原生分叉原语；没有可重建的
  智能体上下文）。
- `mode: fork` 要求 `ref.kind: native_id` 与非空 `ref.value` 字符串。其他
  ref 类别（`artifact_path`、`name`、`last`）是留给后续切片的保留形状，在
  v1 fork 模式中被拒绝。
- `mode: rebuild` 要求 `ref.kind: artifact_set` 与非空的 `ref.value` 路径
  数组。缺失路径记为缺口，启动以解析成功的部分继续；若声明的路径全部无法
  解析，启动以明确错误失败。
- 两种模式在同一成员上互斥；混用是模式错误。

### `rig unclaim`

用法：`rig unclaim <sessionRef> [--json]`

注记：
- 释放被 adopt 的会话而不杀死其 tmux 会话。

### `rig release`

用法：`rig release <rigId> [--delete] [--json]`

注记：
- 从 rig 释放全部已认领/被 adopt 的会话而不杀死其 tmux 会话。
- `--delete` 在干净释放后移除 rig 记录。
- OpenRig 启动的节点仍需 `rig down`。

### `rig launch`

用法：`rig launch <rigId> [nodeRef] [--seats <ids>] [--hold-reason <reason>] [--snapshot-id <id>] [--plan] [--json]`

注记：
- 启动或重启运行中 rig 的一个节点。
- 单目标形式下，`nodeRef`（可选）可以是逻辑 ID 或节点 ID。
- `--seats <ids>`（v0.3.4，slice 11）接受逗号分隔的逻辑 ID 列表，实现节点
  粒度的托管部分恢复——启动指名的席位子集并持有其余席位。退役了原先的
  `pod_aware_launch_unsupported` 死路。
- `--hold-reason <reason>` 记录非目标席位被持有的原因；经可观测性呈现，使
  持有状态可审计。
- `--snapshot-id <id>` 选择确切的一个可用恢复快照，而不是应用自动选择。
  `--plan` 无变更地预览多席位子集及其非目标影响。
- `rig launch <rigId> <nodeRef> --retry-startup-from <member-file> --rig-root <absolute-source-root>`
  显式重试一个已添加、但首次启动在资源投影期间失败的智能体——在原生会话开始
  之前、启动上下文保存之前。先修正投影失败，正常退出失败的 shell，待其停止后
  使用 `rig seat clean <seat> --reason <reason>`。提供原始的裸形式或
  `{member: ...}` YAML/JSON 片段，不带边或成员启动/连续性覆盖。智能体 source
  哈希与保留的身份、模型、cwd 与策略必须一致。重试在同一节点上使用常规校验、
  投影与必需的启动投递；保留其他席位与先前失败。它拒绝已绑定、存活、不确定
  或曾为原生的会话。这不是快照恢复，也不是审慎全新启动的替代，且不能与快照、
  子集或 plan 选项组合。操作者负责提供完整的原始片段：保留状态无法重建缺失的
  成员、工作舱或 rig 指令。绝不为让重试通过而剥掉不受支持的覆盖项。

### `rig remove`

用法：`rig remove <rigId> <nodeRef> [--json]`

注记：
- 从运行中的 rig 移除单个节点。

### `rig shrink`

用法：`rig shrink <rigId> <podRef> [--json]`

注记：
- 从运行中的 rig 移除整个工作舱。
- `podRef` 可以是工作舱命名空间或工作舱 ID。

## 身份、通信与上下文

### `rig startup-proof submit`

用法：`rig startup-proof submit --challenge-id <id> --answer <answer> [--json]`

经认证的活动钩子提交所选的启动练习，使用当前席位的身份与其启动提示中给出的
挑战。对当前挑战给出正确答案返回 `oriented: verified`；单纯确认、错误答案或
过期挑战都会失败。仅有启动就绪并不验证定向。

额外练习通过 `startup_proof` 启动动作以 `value: authenticated` 与
`idempotent: true` 选择加入。省略则不加练习，稍后适用的 `value: none` 选择
精简启动。完整的编写与恢复规则见[启动证明选择](/reference/rig-spec/#启动证明选择)。终端节点不会收到挑战。

### `rig whoami`

用法：`rig whoami [--node-id <id>] [--session <name>] [--host <id>] [--full | --verbose] [--json]`

身份解析顺序：
1. `--node-id`
2. `--session`
3. `OPENRIG_NODE_ID` / `RIGGED_NODE_ID`
4. `OPENRIG_SESSION_NAME` / `RIGGED_SESSION_NAME`
5. tmux 窗格元数据 `@rigged_node_id`
6. tmux 窗格元数据 `@rigged_session_name`
7. 原始 tmux 会话名

注记：
- **v0.4.0——默认紧凑（slice 27）**：`rig whoami` 与 `rig whoami --json` 默认
  只给身份恢复必需项——`identity`（rig / pod / member / sessionName / runtime /
  cwd / logicalId / ids）、`peers`（只含名称：每个 peer 的 logicalId +
  sessionName）、`edges`（方向性 `kind` + `to.sessionName`）、`transcriptPath`。
  请求紧凑时，守护进程跳过 `contextUsageStore` 查找与 `runtimeContext` 构建
  （也省了守护进程的工作）。每个智能体开机首条命令 + 每次压缩恢复现在约
  192 token，而非约 909。
- **`--full`（别名 `--verbose`）**：返回当今完整载荷，包括 `contextUsage`、
  `commands`、`peersNote`、`runtimeContext`——与 v0.3.4 默认字节/形状对等
  （为读取这些字段的消费者保持向后兼容）。
- 紧凑默认是允许列表投影（不是拒绝列表）——未来新增的载荷字段默认走
  `--full`，无法悄悄重新吹胀每次开机的路径。
- 守护进程不可达但仍能解析出身份来源时，`--json` 返回部分结果而不是崩溃。
- 人类可读输出（紧凑默认）显示 identity + peers + edges + transcript 路径。
  `--full` 额外给出上下文用量块、命令列表、peersNote 散文与 runtimeContext。
- `peers[]` 是本 rig 除自身外的名册（无边过滤）；方向性关系用 `edges{}`，
  含自身与存活状态的节点清单用 `rig ps --nodes`。
- 在 Claude Code 项目中，开机无人值守的 `rig whoami` 可能要求本地权限允许
  列表包含 `Bash(rig:*)`。
- `--host <id>` 经单跳 ssh 把同一命令路由到 `~/.openrig/hosts.yaml` 中声明的
  远程主机（CLI 侧 shell 调用；守护进程不参与）。身份解析发生在远程 rig 上
  （每台主机有自己的守护进程 + tmux + 身份上下文）；本地
  `--node-id`/`--session`/`--full` 标志转发给远程 `rig whoami` 调用。成功时
  远程 rig 输出逐字透传；失败区分为与 `rig ps --host`、`rig send --host`
  相同的 `ssh-unreachable` / `permission-gate` / `remote-daemon-unreachable` /
  `remote-command-failed` 枚举。

### `rig transcript`

用法：`rig transcript <session> [--tail <lines>] [--grep <pattern>] [--host <id>] [--json]`

默认值：
- `--tail 50`

注记：
- 读取会话记录文件，而不是窗格回滚缓冲。
- `--grep` 把模式当作正则。
- **v0.4.6（OPR.0.4.6.MH4）**——`--host <id>` / `agent@rig@host` 会话形式从
  远程主机读取会话记录，CLI 直连该守护进程已交付的
  `GET /api/transcripts/:session/tail|grep` 路由（仅限 http 注册主机——ssh
  声明的主机是结构化传输要求错误；该动词没有 ssh 通路）。输出形状与源端一致、
  逐字呈现，带 `[via host=…]` 横幅。优先级：显式 `--host` > 目标语法糖 >
  持久化的主机选择。见"跨主机执行"。

### `rig send`

用法：`rig send <session> [<text>] [--context <ref>] [--verify] [--force] [--raw] [--dangerously-interact --reason <text>] [--wait-for-idle <s>] [--from <session>] [--host <id>] [--json]`

注记：
- 自动使用两步发送模式：粘贴文本、等待、提交 Enter。
- `--verify` 请求送达验证。
- 默认路径只在有确凿证据表明目标正处于交互式提示 / 权限块时才拒绝发送。这
  堵住了同伴消息盲目提交另一智能体未决提示的坑。当目标活动无法判定（遥测
  未知、缺失或过期）时，发送会带着提示性注记继续进行——遥测只是建议，无权
  决定智能体能否通信。用 `--wait-for-idle` 只在明确的空闲证据之后才发送。
- 任务中/忙碌的目标默认带提示发送（忙碌不是阻塞）。`--force` 是向后兼容的
  空操作，绝不绕过交互式提示/权限守卫。
- `--raw` 不带 From/To 消息信封发送精确文本/按键；仍受交互式提示守卫保护。
- `--context <ref>` 解析一个路径式上下文引用，并在本地单席位发送时投递其全部
  内容。成员缺失在投递前中止；内容超大会发出 `rig walk` 提示。`--host`、
  跨主机目标语法糖或扇出定向不支持它。
- `--dangerously-interact` 是提示/权限守卫唯一的覆盖项——它有意驱动一个
  交互式提示/权限块（例如选择一个选项）。它蕴含 `--raw`，要求
  `--reason <text>`，并记录进审计日志。不能与 `--wait-for-idle` 组合。
- `--reason <text>` 记录驱动提示的原因（`--dangerously-interact` 时必需）。
- `--host <id>` 在 `~/.openrig/hosts.yaml` 声明的远程主机上发送；见下文
  "跨主机执行"。**v0.4.6（OPR.0.4.6.MH4）**——主机条目的传输决定路径：ssh
  主机保持单跳 ssh shell 调用、逐字节原样（SSH 成功不等于验证成功——算数的
  是远程 rig 的 `Verified: yes/no`，且逐字呈现）；http 主机（如 pair 注册的）
  CLI 直连远程守护进程的 `POST /api/transport/send`，正文与本地发送所发相同
  （构造上即信封对等）——`--verify` 逐字打印远程路由的 `verified`/`outcome`，
  绝不本地合成判定。`agent@rig@host` 目标形式在后缀是已注册 host id 时是
  `--host` 的语法糖（显式 `--host` > 语法糖 > 持久化选择；`--host` 与语法糖
  冲突是结构化错误）。

### `rig capture`

用法：
- `rig capture <session> [--lines <n>] [--host <id>] [--json]`
- `rig capture --rig <name> [--lines <n>] [--host <id>] [--json]`
- `rig capture --pod <name> --rig <name> [--lines <n>] [--host <id>] [--json]`

默认值：
- `--lines 20`

注记：
- `--host <id>` 在 `~/.openrig/hosts.yaml` 声明的远程主机上捕获；见下文
  "跨主机执行"。**v0.4.6（OPR.0.4.6.MH4）**——ssh 主机保持 shell 调用逐字
  原样；http 主机 CLI 直连远程守护进程的 `POST /api/transport/capture`，正文
  用本地形状（lines/rig/pod/session），在 `[via host=…]` 横幅下按本地捕获的
  样子渲染单/多结果。`agent@rig@host` 会话形式在后缀是已注册 host id 时是
  `--host` 的语法糖（`--rig`/`--pod` 值是名称，绝不做语法糖解析）。

### `rig walk`

用法：`rig walk <seat> --through <ref | files...> [--pace <duration>] [--json]`

注记：
- `--through` 接受一个路径式上下文引用，或一列有序的既有本地文件；两种形式
  混用会被拒绝。
- 经常规传输一次发送一片，片间等待 `--pace`（默认 `10s`；时长覆盖必须带显式
  `ms` 或 `s` 后缀）。`--consume-timeout`、`--consume-poll` 与
  `--turn-timeout` 同样适用这套显式单位语法；裸数字被拒绝。结尾没有额外
  延迟。
- 本地文件缺失或引用成员缺失/不可读时，在首次发送前中止，因此 walk 要么
  投递全部片段，要么一片都不投。
- 能解析出生成记录时，每个片段必须以完整用户消息出现在新追加的记录中，且其
  对应的原生回合必须先闭合，才发下一片。只归一化 CRLF 行尾与首尾空白；内部
  空白、缺失中段、共享前缀与尾部都不算数。
- Claude 的闭合沿消息的 UUID 祖先链追溯到一条助手响应中的 `turn_duration`。
  Codex 使用命名 `task_started`/`task_complete` 回合内的 `response_item` 用户
  消息；排队输入或另一回合的完成都不足为凭。这些回执证明投递与回合完成，
  不证明语义理解。
- Codex 生成记录查找把绑定进程启动后的日志线程 ID 联接到保留的原生 CLI 会话。
  辅助标题线程无法顶替该身份；零个或多个匹配会话保持未验证，而不会按新近度
  挑选。
- Codex 记录经核验的当前窗格/进程与原生线程表解析，包括在 token 遥测出现
  之前。rollout 头必须能识别该线程。身份缺失或有歧义报告为未验证。已验证
  walk 期间发生生成记录/文件替换或记录不可读会中止它；绝不会悄悄续跑到替换
  后的占用者身上。
- `--json` 报告 `consumptionVerified`。若初始生成记录探测不可用，仍可在显式
  的未验证提示下按旧方式投递，`consumptionVerified: false`。

### 跨主机执行（`--host <id>`）

跨主机命令按 id 路由到远程主机。SSH 传输的命令使用单跳 SSH、CLI 侧 shell
调用；HTTP 传输的命令与远程守护进程 API 对话。SSH 路由不涉及本地守护进程。
远程主机应自带受管理的 `rig` 且在 `$PATH` 上可用。

HTTP 发送方归属使用发起实例持久化的自身主机身份，读取时不创建也不更改其
数据库。显式 DB 配置优先；否则保留上次守护进程启动时的 DB 选择。这在本地
守护进程停止时也可用。目的端的身份与配置的显示名绝不会被当作来源。

普通本地请求保留裸席位名。对显式 `OPENRIG_URL`（或旧 `RIGGED_URL`），有界的
健康探测只在目标自身主机身份与本地匹配时才保留裸地址。不同、不可用或有歧义
的目标——包括回环转发端点——会加上已知来源后缀。已带限定的发送方保持不变。
本地来源无法读取时，投递以 `origin-unknown:v1` 来源继续，并在成功响应后给出
诊断；队列转发保留这种不确定性，而不会把发送方归到中继头上。

主机由操作者在 `~/.openrig/hosts.yaml` 中声明：

```yaml
hosts:
  - id: vm-claude-test
    transport: ssh
    target: vm-claude-test.local
    user: your-username  # optional
    notes: "test VM"     # optional
  - id: factory-http
    transport: http
    url: http://100.64.1.2:7433
    bearer_env: FACTORY_HTTP_TOKEN
```

校验规则：

- `hosts` 必需，且必须是非空数组。
- 每个条目：`id` 必需（非空、唯一），`transport` 必需（`ssh` 或 `http`）。
- SSH 条目要求 `target`（非空——DNS 名、SSH 配置别名或 IP）；`user` 与
  `notes` 可选。
- HTTP 条目要求 `url`；bearer 指针（`bearer_env` 或 `bearer_file`）是可选的
  ——两者都省略即为匿名/无令牌守护进程（不发送 `Authorization` 头；
  主机+VM 同属一个创始人信任域，网格即认证边界）。bearer 指针至多设置一个，
  绝不两者都设。指针是配置名/路径，绝不是已解析的令牌值；已配置但无法解析的
  指针在任何请求之前就是权限失败。
- `rig host add/list/doctor` 覆盖标准路径；手工编辑仍是为奇异物件准备的路径。
- 文件缺失或无效会返回清晰错误并指向规范路径。

CLI 区分四种结构化失败模式（每种模式给操作者可行动的错误；JSON 输出保留
`failedStep` 枚举）：

- `ssh-unreachable`——SSH 本身失败（连接被拒、主机键不匹配等）。请核实 SSH
  访问与注册表条目。
- `permission-gate`——SSH 撞上认证/权限门（Permission denied、钥匙串）。错误
  包含指向 keychain-over-SSH 字段说明的提示。
- `remote-daemon-unreachable`——SSH 成功但远程 `rig` 报告远程守护进程不可达。
  用 `ssh <target> rig daemon start` 启动它。
- `remote-command-failed`——SSH 成功但远程 `rig` 因其他原因非零退出；远程
  stderr 会呈现出来。

**传输姿态（OPR.0.4.4.13 FR-4——已决，pm 裁定：只记录，不做对等）**。分区是
既定姿态，不是历史的偶然：**ssh 承担交互式窗格操作，http 承担守护进程 REST
操作，`ps`/`whoami` 跟随主机声明的传输**。没有跨传输回退，0.4.4 也不为
`send`/`capture` 提供 http 对等（对等会是新的攻击面，且无范围锁定的需求）。
**v0.4.6 更新（OPR.0.4.6.MH4，pm 裁定纳入，认定为兑现既定意图）**：
`send`/`capture` 获得 http 分支——创始人的 `pair` 前门注册的是 HTTP 主机，
没有该分支，pair 注册的演示主机根本无法接收 send/capture。机制是经已交付的
`runRemoteHttpOp` CLI 直连远程守护进程既有的传输路由（守护进程侧零改动；
ssh 主机保持 ssh 通路逐字节原样——是补覆盖，不是重写，且仍无跨传输回退：
主机条目声明的传输决定路径）。`transcript` 与 `broadcast` 以同样方式获得其
首个跨主机入口（仅 http——它们没有 ssh 通路）。逐命令：

| 命令 | ssh 传输 | http 传输 | 扇出（`--all-hosts`/`--hosts`） |
| --- | --- | --- | --- |
| `rig send` | ✓（shell 调用，逐字节原样） | ✓（v0.4.6 MH-4——CLI 直连 `POST /api/transport/send`） | ✗ |
| `rig capture` | ✓（shell 调用，逐字节原样） | ✓（v0.4.6 MH-4——CLI 直连 `POST /api/transport/capture`） | ✗ |
| `rig transcript --host`（v0.4.6，OPR.0.4.6.MH4） | ✗（结构化传输错误） | ✓（CLI 直连 `GET /api/transcripts/:session/tail\|grep`） | ✗ |
| `rig broadcast --host`（v0.4.6，OPR.0.4.6.MH4） | ✗（结构化传输错误） | ✓（CLI 直连 `POST /api/transport/broadcast`；远程扇出，逐目标透传） | ✗ |
| `rig up` / `rig down` / `rig launch` | ✗ | ✓（仅 http） | ✗ |
| `rig file copy`（v0.4.4） | ✓（仅 ssh，rsync-over-ssh） | ✗ | ✗ |
| `rig ps --host` | ✓（声明式） | ✓（声明式） | 仅 http；非 http 主机在 `hosts[]` 中显示为结构化 `unsupported-transport` 状态 |
| `rig whoami --host` | ✓（声明式） | ✓（声明式） | 仅 http；非 http 主机目前被从扇出中静默过滤（已交付的缺口，已排入 0.4.5 分诊——不同于 ps 的结构化状态） |
| `rig host doctor` | ✓ | ✓ | n/a（单主机） |
| `rig queue create/handoff/handoff-and-complete --host`（v0.4.6，OPR.0.4.6.MH3） | ✗ | ✓（仅 http，守护进程→守护进程转发——ssh 声明的主机是结构化 `unsupported-transport` 错误） | ✗ |

0.4.4 范围外：跨传输回退；`send`/`capture` 的 http 对等 *（已于 0.4.6 交付
——OPR.0.4.6.MH4，pm 裁定为兑现既定意图；见上文 v0.4.6 更新）*；连接池；
多跳 SSH；跨主机队列路由 *（已于 0.4.6 交付——OPR.0.4.6.MH3；见 `rig queue`
§ 跨主机队列路由）*；跨主机席位交接。

**http 分支的失败分类法（v0.4.6——OPR.0.4.6.MH4）**。http 分支为自己的步骤
命名（绝不用 ssh 枚举，绝不用笼统的 "failed"）：registry-load-failed /
unknown-host（四个动词同类）/ `permission-gate`（bearer 本地解析失败，或远程
返回 401/403——含下文的终端 bearer 姿态）/ `remote-daemon-unreachable`（网络/
超时）/ `remote-command-failed`（远程 4xx/5xx，步骤旁呈现远程路由自己的错误
文本）。**终端 bearer 姿态（已命名，v0——只适用于 `/api/transport/*`，即
send/capture/broadcast）**：远程的传输路由以它自己的终端 bearer 类别设门，而
CLI 在已配置时呈现的是主机的注册表 bearer；仅 URL 的匿名主机则省略
`Authorization` 头。默认（无终端 bearer）+ tailnet 绑定 = 按设计直通（网格即
认证边界）；远程强制执行不同终端 bearer 时，表现为结构化的 `permission-gate`
步骤——补救：把远程的终端 bearer 设为与配对注册表 bearer 相同，或依赖
tailnet 边界。**`rig transcript --host` 不属于此类（arch n2）**：远程的
`/api/transcripts/*` 路由是已交付的无门会话记录读取姿态（开放路由、守护进程
本地信任边界、路由级凭据脱敏作为保护性原语）——一个会让跨主机 send 撞权限门
的错误终端 bearer 不会拦住跨主机 transcript 读取；transcript 继续成功。跨
tail/grep/full 的连贯 transcript 读取认证策略按该路由自己的注释
（`routes/transcripts.ts`，orch 决定 approved-option-a）是已点名的未来切片，
此处不展开。本切片不附带新的认证机制。

**目的端解析规则——两族契约（OPR.0.4.6.MH3，arch 裁定）**。`agent@rig@host`
三段形式是 CLI 边缘的输入语法糖，从来不是文法：会话字符串在任何地方都保持
`member@rig`（BR-1），主机永远带外传递。按动词族故意交付两套解析规则——单一
规范规则要么破坏被 adopt 的目标，要么降低队列错误的诚实度：

| 动词族 | 三段形式的尾段 | 原因 |
| --- | --- | --- |
| 队列协作写入（`rig queue create/handoff/handoff-and-complete`） | **总是剥离**，进带外的 `hostId` 信封（在人类席位分类器之后） | 队列目的地在构造上只接受规范形式（守护进程的 `validateRig` 拒绝任何非规范解析），因此无条件剥离毫无损失——而敲错的主机会以 unknown-HOST 错误响亮死去，而不是误导性的 rig 形状 `unknown_destination_rig`。 |
| 面向会话的交互/观察动词（`rig send/capture/transcript`） | **只有该段匹配已注册 host id 时才剥离** | 交互动词合法地以可能含 `@` 的原始/被 adopt tmux 会话名为目标；仅在注册时剥离保留了它们，未注册后缀的主机提示让敲错依旧响亮。 |
| `rig broadcast` | **无语法糖**——位置参数是消息正文，绝不会被解析为目标 | 对消息正文做语法糖解析会损坏含 `@` 的文本；跨主机 broadcast 只按 `--host` 或持久化选择路由（v0.4.6——OPR.0.4.6.MH4）。 |

两族汇聚到同一结局：敲错的主机响亮死去，并指名该主机。`RESERVED_HOST_IDS`
集合（`kernel`、`host`、`local`——在 `rig host add` 处被拒绝）保证任何已注册
主机都无法遮蔽人类席位 `@kernel`/`@host` 分类族。

### `rig file`（v0.4.4——OPR.0.4.4.18）

用法：`rig file copy <src> <dst> [--dry-run] [--json]`

基于 ssh/rsync 的跨主机文件移动——v0 只交付一个显式动词 `copy`，针对单个
文件。

操作数文法（解析得出，绝不靠猜）：
- `<hostId>:<absolute-path>` = 远程（`<hostId>` 必须能在 ssh 主机注册表中
  解析；远程路径必须为绝对路径）。
- 裸路径 = 本地。名字含冒号的本地文件需要 `./` 前缀（`./weird:name.txt`）
  ——文法以结构化错误拒绝歧义形式，而不靠猜。
- 有效形状：local→remote、remote→local、local→local。remote→remote 不是
  v0 形状。

语义 + 安全墙（来源：`packages/cli/src/lib/file-transfer.ts`）：
- 已存在的目标会被**覆盖**（v0 copy 语义，明示）——用 `--dry-run` 预览，它
  会打印确切计划的传输（src、dst、host、文件/字节）且不移动任何东西。
- **对存活智能体/凭据状态的默认拒绝墙**：解析进封闭拒绝集 `~/.openrig`、
  `~/.ssh`、`~/.codex`、`~/.claude` 的路径——外加 ACTIVE 的 `OPENRIG_HOME`
  与活跃主机注册表文件——会以指名 what/why 的错误拒绝（扩大拒绝集需要裁定，
  绝不静默放宽）。
- 路径穿越在原始操作数上拒绝：`..` 路径段在任何归一化之前即拒绝（归一化会
  折叠 `..`，归一化后的检查是死代码）；远程路径另被限制为 shell 惰性字符集
  （`A-Za-z0-9._/-`——用限制代替转义，因为舰队里两套 rsync 实现对引号标志的
  处理不同）；每次 rsync 调用都把操作数钉在 `--` 之后，并以 argv 风格、不经
  shell 地孵化。
- 传输仅限 ssh（见上方传输姿态表）；远程侧使用与 `rig send`/`capture` 相同的
  ssh 注册表条目。

### `rig host`

用法：`rig host <add|list|doctor>`——多主机注册表动词（OPR.0.4.4.13；恰好
封顶这三个——没有 edit/remove/tunnel/bootstrap 动词；手工编辑 `hosts.yaml`
仍是为奇异物件准备的路径，工厂引导以
`scripts/bootstrap-product-factory-vps.sh` 交付）。

- `add --id <id> --transport <ssh|http> [--target <t> --user <u> | --url <u> [--bearer-env <n>|--bearer-file <p>]] [--notes <text>] [--json]`——写入经注册表加载器自有规则校验的条目（添加期错误就是加载期错误，逐字一致；拒绝重复 id；http bearer 指针可选——无令牌守护进程两者都省略，绝不两者都设）。规范化重写 `hosts.yaml`（手工写的注释不保留）。
- `list [--json]`——id/transport/target 加上作为配置指针的 AUTH（`env:NAME` / `file:PATH` / `ssh-key`）；绝不是已解析的机密值。
- `doctor <id> [--posture product-factory-vps] [--public-addr <ip>] [--json]`——分步、诚实的核验：传输可达性 → 远程 `rig` 二进制（+版本）→ 远程守护进程健康 → 远程身份；每个失败步骤都是独立可行动的错误，未知 host id 以注册表错误类呈现。`--posture` 运行唯一内置基线（`product-factory-vps`）：每一项单独报告 pass/fail/**unknown**，每个非 pass 附带修复——UNKNOWN 绝不是 pass；公网 `:7433`/`:22` 探测需要 `--public-addr`（视角之外），公网守护进程端口可达则响亮失败。任一 fail 退出 `1`。

### `rig broadcast`

用法：`rig broadcast [<text>] [--context <ref>] [--rig <name>] [--pod <name>] [--force] [--host <id>] [--json]`

注记：
- 不带 `--rig` 或 `--pod` 时，向所有 rig 的所有运行中会话广播。
- `--context <ref>` 解析一个路径式上下文引用并扇出其全部内容。成员缺失在
  扇出前中止；内容超大会发出 `rig walk` 提示。`--host` 下不支持。
- **v0.4.6（OPR.0.4.6.MH4）**——`--host <id>` 在远程主机上广播，CLI 直连该
  守护进程已交付的 `POST /api/transport/broadcast`（仅限 http 注册主机；ssh
  声明的主机是结构化传输要求错误）。远程守护进程在它自己的拓扑上解析
  `--rig`/`--pod`；其逐目标结果逐字打印，部分扇出与本地完全一样非零退出。
  远程调用自带指名的扇出期限（`BROADCAST_REMOTE_TIMEOUT_MS`，30 秒——完整
  逐目标循环会超过 5 秒的读默认值）。`<text>` 位置参数是消息正文，绝不会
  被解析为目标，因此 broadcast 只接受 `--host` 或持久化主机选择——不接受
  `agent@rig@host` 语法糖。

### `rig ask`

用法：`rig ask <rig> <question> [--json]`

当前实现：
- 查询 `/api/ask`
- 返回：
  - 原始问题
  - rig 摘要（`name`、`status`、`nodeCount`、`runningCount`、`uptime`）
  - 来自会话记录的证据摘录
  - 可选的聊天摘录
  - `insufficient` 标志
  - 可选的指引文本

重要：
- 实机帮助描述说 "Search rig transcript history with a natural language
  question"，但已交付行为比单纯 transcript grep 更宽，比拓扑/生命周期综合层
  更窄。
- 该命令是守护进程支撑的证据查询，不是第二次 LLM 调用。

### `rig chatroom`

用法：`rig chatroom <subcommand>`

子命令：
- `send <rig> <message> [--sender <name>]`
- `history <rig> [--topic <name>] [--after <id>] [--since <ts>] [--sender <name>] [--limit <n>] [--json]`
- `wait <rig> [--after <id>] [--topic <name>] [--sender <name>] [--timeout <seconds>] [--json]`
- `clear <rig>`
- `topic <rig> <topic-name> [--body <text>] [--sender <name>]`
- `watch <rig> [--tmux]`

注记：
- 所有 chatroom 子命令都以 rig 名称为位置参数。
- `history` 过滤器可组合：`--sender`、`--since`、`--after`、`--topic` 可以
  叠加。
- `wait` 阻塞到有新的匹配消息到达或超时（退出码 1）。过滤语义与 `history`
  相同。
- `clear` 是破坏性的且以 rig 为范围。移除该 rig 的全部消息。
- `watch --tmux` 启动一个专用的 tmux 观察者会话。

## 协作原语（PL-004 Phase A）

两个顶层命令支撑以 SQLite 为规范的协作层。它们只与守护进程 HTTP API 对话；
不触碰 POC 的 `rigx-stream-proto` / `rigx-queue-proto` 文件系统状态。POC 与
守护进程只在操作者层面共存。

### `rig stream`

用法：`rig stream <subcommand>`——L1 只追加入口流。

子命令：
- `emit --source <session> --body <text> [--format <fmt>] [--hint-destination <session>] [--hint-type <type>] [--hint-urgency <urgency>] [--hint-tags <csv>] [--interrupt] [--id <streamItemId>] [--json]`
- `list [--source <session>] [--hint-destination <session>] [--tag <tag>] [--since <iso>] [--until <iso>] [--limit <n>] [--after <sortKey>] [--include-archived] [--json]`
- `watch [--json]`
- `show <streamItemId> [--json]`
- `archive <streamItemId> [--json]`

注记：
- `--id` 用于幂等；相同 id 返回同一行，后续调用的正文被忽略。
- `--tag` 是 `hint_tags` 的精确成员资格，不是子串匹配。`--since` 与 `--until`
  是闭区间 ISO 时间戳界限，由守护进程归一到 UTC；列表顺序与游标语义保持
  时间序。
- `watch` 消费既有的 `/api/stream/sse` 契约：守护进程的初始重放加后续实时
  条目。人类输出显示时间戳、来源与正文；`--json` 每行发出一个 `StreamItem`
  对象。它只建一条连接，不自动重连。
- `archive` 是软性的——行保留供审计，并从 `list` 中排除，除非传入
  `--include-archived`。

### `rig queue`

用法：`rig queue <subcommand>`——L3 属主工作队列加 inbox/outbox。

子命令：
- `create --source <session> --destination <session> (--body <text> | --body-file <path> | --body-context <ref>) [--mission <id>] [--slice <id>] [--priority <p>] [--tier <t>] [--tags <csv>] [--target-repo <name>] [--host <id>] [--no-nudge] [--expires-at <iso>] [--id <qitemId>] [--json]`——`--body-context <ref>` 解析完整的上下文包，把该内容快照进
  qitem 正文，并加一个 `body-context:<ref>` 来源标签；它与 `--body` /
  `--body-file` 互斥，成员缺失时在 qitem 创建前中止。v0.3.2 slice-21 FR-4
  新增 `--body-file <path>`（stdin 用 `-`），消灭了多行正文里的反引号 shell
  损坏类；并新增一等的 `--mission <id>` / `--slice <id>` 标志，翻译为
  `mission:<id>` / `slice:<id>` 标签（可与 `--tags` 组合）。v0.4.6
  （OPR.0.4.6.MH3）新增 `--host <id>` / `agent@rig@host` 目的地形式——见下文
  § 跨主机队列路由。
- `claim <qitemId> --destination <session> [--json]`——pending → in-progress；按 tier 计算 closure_required_at
- `unclaim <qitemId> --destination <session> [--reason <text>] [--json]`——in-progress → pending
- `update <qitemId> --actor <session> --state <state> [--closure-reason <r>] [--closure-target <t>] [--note <text>] [--json]`
- `handoff <qitemId> --from <session> --to <session> [--body <text> | --body-file <path>] [--note <text>] [--priority <p>] [--tier <t>] [--tags <csv>] [--host <id>] [--json]`——事务化地以 handed-off 关闭 + 创建新条目；v0.4.6（OPR.0.4.6.MH3）新增 `--host <id>` / `agent@rig@host` 形式的 `--to`（§ 跨主机队列路由）
- `handoff-and-complete <qitemId> --from <session> --to <session> [--body <text> | --body-file <path>] [--note <text>] [--priority <p>] [--tier <t>] [--tags <csv>] [--host <id>] [--json]`——`handoff` 的变体，把源关闭为 `done`（终态）而非 `handed-off`；同样的原子关闭+创建、chain_of_record、默认 nudge 与跨主机契约
- `fallback <qitemId> --destination <session> [--reason <text>] [--json]`——改路由到后备席位
- `show <qitemId> [--json]`
- `transitions <qitemId> [--json]`——只追加的流转记录
- `list [--destination <session>] [--source <session>] [--owned] [--mine] [--state <csv>] [-a | --all] [-A | --all-rigs] [--full] [-o <json|wide>] [--limit <n>] [--json]`——**v0.4.0 文法（slice 28 + 32，对齐 docker / kubectl）**：
  - **`rig queue list`**（无标志）→ 只列活跃状态（`pending` / `in-progress` / `claimed` / `blocked` / `handed-off`；不含 `done` / `canceled`），**当前 rig** 广度，紧凑行：`qitemId`、`state`、`source→destination`（或 `current-owner`）、`closure_reason` / `closure_target`（handed-off / blocked 时）、`mission`、`slice`、`tier` / `priority`、`age` / `updated_at`、短标题、封顶标签。不含：完整正文、chain_of_record、流转历史、证明 / 工件大块。
  - **`-a` / `--all`** → 在当前广度内纳入已关闭 / 已完成历史（docker `-a` 轴：历史）。
  - **`-A` / `--all-rigs`** → 跨 rig 广度（kubectl `-A` 轴：广度）。可与 `-a`、`--owned`、`--mine`、`--full` 组合。
  - **`--full`** → 给所选范围追加正文 + 记录链 + 完整标签 + 流转历史（字段广度轴）。
  - **`-o json|wide`** → 编码，默认紧凑。`-o json` 不蕴含完整正文（紧凑 JSON 对 token 安全且机器可解析）；`--full -o json` 返回完整 JSON。
  - **`--owned`** → 指派给调用者的待办义务（仅 `destination_session`）。
  - **`--mine`** → 调用者作为 source 或 destination 的并集，包括调用者编写但并不拥有的行。
  - 管道使用必须开启 `set -o pipefail`；否则 shell 只报告下游格式化器的状态，可能掩盖 `rig` 读取的非零退出（如超时）。
  - `--destination <s>` / `--source <s>` / `--state <csv>` 继续有效，并可与新标志组合。
  - 四个轴（范围 × 历史 × 字段广度 × 编码）正交且可组合。聚合跨 rig + 全历史的裸无范围消防水管（实机上约 64,000 token）已退役出默认——经 `-A -a --full` 选择加入。
  - 正文预览用 `rig queue show <qitemId>`；`rig queue show <qitemId> --full --json` 返回原始完整记录。预览 JSON 追加 `readView`，含完整性、省略内容、完整 JSON 字节数与确切的展开命令。
- `overdue [--json]`——已过 closure_required_at 的 in-progress 队列条目
- `inbox-drop <destinationSession> --sender <session> (--body <text> | --body-file <path>) [--tags <csv>] [--urgency <u>] [--audit <pointer>] [--id <inboxId>] [--json]`
- `inbox-absorb <inboxId> --receiver <session> [--json]`——把 pending 的 inbox 条目提升为 queue_item
- `inbox-deny <inboxId> --receiver <session> --reason <text> [--json]`
- `inbox-pending <destinationSession> [--json]`
- `outbox-record --sender <session> --destination <session> (--body <text> | --body-file <path>) [--tags <csv>] [--urgency <u>] [--audit <pointer>] [--id <outboxId>] [--json]`
- `outbox-list <senderSession> [--limit <n>] [--json]`

烫手山芋严格拒绝（承重 API 契约）：
- `update --state done` 必须带 `--closure-reason`，取值之一：`handed_off_to`、
  `blocked_on`、`denied`、`canceled`、`no-follow-on`、`escalation`。原因缺失
  或无效 → 退出码 1，结构化错误指名 6 个有效值。
- `closure-reason` 为 `handed_off_to`、`blocked_on` 或 `escalation` 时另需
  `--closure-target`。
- 全部烫手山芋强制都发生在守护进程领域层；每个呈现面（CLI、未来的 MCP、
  未来的 UI）继承同一保证。

closure-reason 语义：
- `handed_off_to`——工作转到另一席位继续（target = 新属主）。`handoff` 子命令
  是首选路径；`update` 在非交接的终态关闭中接受它。
- `blocked_on`——搁置等待另一 qitem（target = 阻塞它的 qitem_id）。
- `denied`——接收方拒绝了该工作。
- `canceled`——发送方或接收方撤回。
- `no-follow-on`——终态完成，无后续需要。
- `escalation`——上抛到更高 tier（target = 上抛目标）。

### 跨主机队列路由（v0.4.6——OPR.0.4.6.MH3）

`rig queue create`、`handoff` 与 `handoff-and-complete` 可以把目的地指向另一台
已注册主机：`--host <id>` 或带主机限定的目的地形式 `member@rig@<host>`（两者
解析为同一个带外 `hostId` 请求信封；以不同主机同时指名两者是结构化歧义错误）。
该机制把已交付的 mission-control 先转发后剥离 WRITE 加以推广：本地守护进程在
服务端解析主机注册表（bearer 绝不到达调用者），在边缘剥离主机，并把整个正文
经 HTTP 转发给目标守护进程——完整模型见
`docs/as-built/architecture/coordination-primitive.md` § 跨主机队列路由。
承重契约点：

- **仅显式（不跟随选择）**。队列动词只按 `--host` / 三段形式做跨主机路由
  ——绝不查询持久化的 `rig host select` 选择（持久写入与烫手山芋关闭不得因
  昨天的粘性选择而悄悄改换归属）。这与确实跟随选择的观察/交互动词形成有意
  的不对称。
- **来源持有记录**。qitem 存在于目标主机的 DB 中；那一行就是记录。本地从不
  写幽灵行，目标守护进程自己的 nudge 在它自己的本地 tmux 上触发（整个正文
  ——包括 `nudge` 标志——都被转发）。
- **至少一次 + 幂等，绝非恰好一次**。转发守护进程在首次转发前铸造 qitem id
  （重试按构造携带同一 id）；跨主机 handoff 的后继 id 从（源 qitem，目的地，
  主机）确定性推导——命名空间 `qitem-xh-…`，重驱动的转发在目标主键上吸收。
  重试安全；同 id 但身份字段不同的 create 是结构化 `qitem_id_reuse` 错误。
- **绝不丢弃的顺序**。跨主机 handoff 先在目标主机上创建后继，后关闭本地源。
  两步之间崩溃会留下一个存活副本，幂等重驱动会向其收敛——绝不会出现源已
  关闭而后继不存在。重驱动：已关闭的源带匹配的 `closure_target` 时吸收为
  成功；不匹配是结构化 `cross_host_close_conflict`（409）——呈现出来，绝不
  覆盖。*（已命名的残余，至少一次/无 2PC 所固有：以不同目的地重驱动是新的
  handoff 决定，可能让较早的后继在目标主机上保持存活——经链 + 来源标签可见，
  不是去重 bug。）*
- **关闭字段**。跨主机源关闭记录 `closure_reason=handed_off_to` 与
  `closure_target=member@rig@<host>`——`closure_target` 是不透明的审计/显示
  元数据，只做存在性检查，绝不为路由而解析（任何把它当会话字符串解析的 PR
  都是违反规范）。会话字符串载体（`destination_session`、`source_session`、
  `blocked_on`、`handed_off_to`）保持两段 `member@rig`（BR-1）。转发的后继
  携带延续的 `chain_of_record`；那些 A 侧 id 在目标主机上是不透明的世系标识
  （在目标 DB 中不可解引用）。来源：转发的条目带 `cross-host` +
  `from-host:<sender's self-declared name>` 标签（诚实尽力而为，不是经认证的
  身份）。
- **失败诚实**。未知主机 / ssh 声明主机 / 不可达 / 认证失败各自呈现为指名
  主机的独立结构化 `remote_queue_write_failed` 错误——两侧都不写入任何东西。
  传输仅限 http（守护进程→守护进程通路才会触发远程 nudge；`rig send --host`
  的 ssh shell 调用是另一机制，不受影响）。
- **本地零回归**。不带 `--host`（或 `local`）= 现在的本地路径，字节一致。
  claim / update / inbox 动词按原则保持本地：跨主机 handoff 之后，后继生活
  在目标主机上，与其工作者同在。对已转发条目的发送方侧操作（从发送主机
  cancel/update）是已点名的后续，不在 v1。

## 协作 Project/分类器与视图（PL-004 Phase B）

两个顶层命令为协作层扩展 L2（project/分类器）与 L5（视图）。

### `rig project`

用法：`rig project <subcommand>`——L2 智能体支撑的分类器，带守护进程强制执行
的租约 + 幂等 + 回收。

子命令：
- `lease-acquire [options]`——为调用者获取活跃分类器租约。
- `lease-heartbeat [options]`——为活跃分类器租约发送心跳（延长 TTL）。租约
  已过 TTL 时以 `lease_expired` 拒绝；应重新 acquire。
- `lease-show [options]`——显示当前活跃的分类器租约。
- `reclaim-classifier [options]`——操作者动词，回收活跃分类器租约。用
  `--if-dead` 在持有者仍存活时拒绝。
- `classify <streamItemId> [options]`——以分类字段投影一个流条目。对
  `stream_item_id` 幂等（首写胜出）。要求 `--lease-id`：除非该确切租约在
  写入时活跃、未过期且由 `--session` 持有，否则结果被拒绝（`lease_mismatch`、
  `lease_expired`、`lease_held`）。可选 `--area`、`--scope-ref`（配合
  `--candidate-set-version`）、`--duplicate-of`、`--needs-human true|false`
  （未知则省略）、`--classifier-version`、`--taxonomy-version`、`--attempt-id`
  配合 `--execution-id`。不带 `--attempt-id` 时结果为人工分类，不绑定
  attempt 台账。每个提供的字段必须是字符串（ID 与版本非空）；
  `--needs-human` 省略即未知。
- `list [options]`——按过滤器列出项目分类（`--session`、`--destination`、
  `--area`、`--scope-ref`、`--needs-human true|false|unknown`）。
- `show <projectId> [options]`——显示一个项目分类。

注记：
- 租约语义：任一时刻只有一个分类器持有活跃租约。心跳只在租约未过期时延长
  TTL。重新获取自己已过期的租约会签发新租约 id，绑定旧 id 的结果被拒绝；
  另一会话必须使用 `--evaluate-deadness-first` 或 reclaim 动词。
- Attempt 台账（守护进程 HTTP，由分类器占用者使用）：
  `POST /api/projects/attempts/begin`、`/attempts/:id/abstain`、
  `/attempts/:id/fail`、`GET /api/projects/eligible`。弃权与错误记录在那里，
  绝不记录进分类行；错误以有界退避重试，然后以 `exhausted` 结束。每次
  `begin`（包括超时或错误重试）返回新的 `executionId`；只有当前者可以弃权、
  失败或绑定结果（否则 `attempt_superseded`），因为可续租的租约证明不了更早
  的执行已停止。
- `classify` 强制 L1→L2 外键存在性：被引用的 `stream_items` 行必须存在，
  否则调用在任何状态变更前被拒绝。
- `reclaim-classifier` 是操作者侧从卡死分类器恢复的动词；`--if-dead` 加了
  存活守卫，仍在心跳的分类器不会被抢走。

### `rig view`

用法：`rig view <subcommand>`——L5 守护进程支撑的协作状态视图。

子命令：
- `list [options]`——列出内置与自定义视图。
- `show <viewName> [options]`——运行一个视图（内置或自定义）。
- `register [options]`——注册或更新自定义视图。

内置视图：
- `recently-active`, `founder`, `pod-load`, `escalations`, `held`, `activity`。

注记：
- 影响视图的每次状态变更都会发出 `view.changed` SSE 事件。队列更新变更桥接
  到 `queue.updated`，再为全部六个内置视图桥接到 `view.changed`（Phase B R2）。
- 自定义视图注册写入 `views_custom` 表；守护进程在注册时热加载。

## 协作看门狗（PL-004 Phase C）

`rig watchdog` 注册、列出、检视并停止守护进程原生调度器作业。调度器运行在
守护进程监督树内，状态持久化在 SQLite（`watchdog_jobs`/`watchdog_history`）；
作业在守护进程重启后存活。v1 提供三种策略：`periodic-reminder`、
`artifact-pool-ready` 与 `edge-artifact-required`。第四种 POC 策略
`workflow-keepalive` 以 `policy_deferred_to_phase_d` 被拒绝，在 Phase D 交付。

### `rig watchdog`

- `register --spec <path> --policy <name> --target-session <s> --interval-seconds <n> --registered-by <s>`——从 YAML spec 注册作业；`--active-wake-interval-seconds` 与 `--scan-interval-seconds` 是 pool-ready 专属的选择加入。
- `list`——列出全部作业（active + stopped + terminal）。
- `show <job_id>`——显示一个作业。
- `status <job_id>`——显示作业 + 最近评估历史（最后 20 条）。
- `stop <job_id> [--reason <text>]`——操作者停止；此后调度器跳过该作业。

历史只记录响亮的评估：`sent`（已执行投递）或 `terminal`（策略宣布作业完成）。
安静的跳过原因（`not_due`、`no_actionable_artifacts`、
`no_missing_edge_artifacts`、`active_wake_not_due`）不记录——与 POC 对齐，
使智能体不会因调度器轮询被唤醒。响亮的 `skipped` 行只在策略返回非安静原因时
记录。

Phase D 以 `workflow-keepalive`（从 Phase C 推迟的策略）扩展策略枚举。它经
SQLite 直接读取 `workflow_instances`，要求 `status: active|waiting`，并从
`queue_items` 解析前沿 qitem 属主。

## 工作流运行时（PL-004 Phase D）

`rig workflow` 操作守护进程原生工作流运行时：声明式 spec 校验、实例创建、
步骤投影（transactional-scribe）、追踪与幂等 continue。工作流 spec 是磁盘上
的 markdown/YAML 文件（工作区呈现面）；守护进程把它们缓存进 SQLite 以便快速
查找。

### `rig workflow`

- `validate <specPath>`——校验工作流 spec 文件；返回结构化 ok/error 报告
  （角色解析、步骤唯一性、allowed-exits 一致性、可选席位存活）。仅限 spec：
  不取 rig 上下文（OPR.0.4.6.FAC1 arch 裁定——rig 覆盖检查发生在 instantiate
  时）。
- `compile <missionPath> [--operation-key <key>]`——把 `project.yaml` →
  `mission.yaml` → `slice.yaml` 读成可检视的生命周期图，不创建缓存 spec、
  工作流实例或 qitem。
- `instantiate-lifecycle <missionPath> --operation-key <key> --root-objective <text> --created-by <session>`——编译并启动合格的生命周期；
  `--entry-owner` 与 `--rig` 保持其常规工作流含义。不透明的 operation key 使
  精确重放幂等，冲突复用被拒绝。
- `instantiate <specPath> --root-objective <text> --created-by <session>`——在同一守护进程事务中创建新实例 + 入口步骤 qitem；
  `--entry-owner <session>` 覆盖默认入口属主。**OPR.0.4.6.FAC1**：`--rig <name>`
  把实例绑定到一个 rig（覆盖 spec 的 `target.rig` 默认值；持久化为实例上的
  `boundRig`，由 `show`/`trace` 渲染并随 `--json` 携带）。在已绑定实例上，
  **没有 `preferred_targets`** 的角色按纯能力策略解析为该 rig 上的存活有能
  席位（声明该角色的运行中智能体、仅限托管席位、要求的运行时、待处理积压
  最少、确定性坐标平局裁决）。未知 rig = 结构化 `bound_rig_unknown`；已绑定
  rig 的角色无任何席位在结构上声明 = `bound_rig_role_uncovered`（任一生命
  周期状态下的存在性即满足——存活在步骤投影时检查）。不带 `--rig` 且 spec
  无默认 = 未绑定，与 FAC-1 之前行为字节一致。
- `run <specPath> …`——接受同样的 `--rig <name>` 绑定（run 也会实例化）。
- `project --instance <id> --current-packet <qitem-id> --exit <handoff|waiting|done|failed> --actor-session <session>`——在同一守护进程事务中关闭当前包
  并投影下一步包（transactional-scribe；设计上不可能丢失交接）。
  `--result-note <text>`、`--blocked-on <ref>`、`--next-owner <session>`
  修改行为。
- `list [--status <s>]`——列出实例；可按状态过滤
  （`active`/`waiting`/`completed`/`failed`）。
- `show <instanceId>`——显示一个实例。
- `revise <instanceId>`——不写入地检视已编写与已绑定的生命周期输入。结果
  指名变更的来源/步骤、组合、兼容性，以及一条包含所检视版本、摘要与
  operation key 的 apply 命令。使用 `--apply` 前先填入 actor 与决定。
- `operation <key>`——在响应丢失或稍后源码编辑之后，取回原始生命周期创建/
  修订回执与当前实例。
- `trace <instanceId>`——显示实例 + 其只追加步骤轨迹（仅审计）。
- `continue <instanceId>`——幂等检查器；v1 中返回当前状态。

属主即作者 + 工作流即事务书记（transactional-scribe）的契约由守护进程强制
执行。包的属主决定它何时关闭；工作流运行时在单一守护进程事务中原子地记录
关闭并按工作流 spec 创建/投影下一个 qitem。

### 项目属主的发布 profile

`project.lifecycle.profile` 选择 `project.lifecycle.profiles` 中的一个键。
每个被选条目包含 `required_steps`（非空的稳定义务 ID 列表）与 `workflow`
（普通工作流语言）。[`project-release-profile.yaml`](../reference/project-release-profile.yaml)
中的可复用示例命名了九个发布仪式阶段，后接一个 `release-boundary` 判定。
该最终判定在一条由智能体撰写的记录中覆盖权威
[`release-boundary.md`](/reference/release-boundary/) 检查单的七个领域。
它不创建七道自动闸门。

把 profile 一次性放进 `project.yaml`；发布 mission 只需其普通组合。按项目
定制示例的项目 ID、角色与策略。每个 profile 步骤都声明 `depends_on`（根上
为 `[]` 也要声明）；带条件的 `next_hop.on` 跳转被拒绝，使必需阶段无法被
绕过。缺失必需 ID 以 `lifecycle_required_step_missing` 拒绝。前置循环使编译
不合格，报 `dependency_cycle`，即使设置了 `loop_guards.max_hops`。该守卫
限制路由循环；它无法让互相依赖的步骤变得就绪。

优先级是显式的：

- 选择了项目图而 mission 无工作流时，mission 继承它。
- `mission.lifecycle: {profile: <same-profile>, mode: extend, workflow: ...}`
  新增步骤、按名合并角色、追加上下文引用。扩展不能替换步骤 ID；其工作流只
  接受 `steps`、`roles` 与 `context_refs`。
- `mode: override` 提供替换工作流。全部必需项目步骤 ID 及其间的先行关系必须
  保留。允许额外的中间阶段。存在竞争工作流而模式省略或未知时，以
  `lifecycle_override_ambiguous` 拒绝。
- 没有 `project.lifecycle.profiles` 时，既有的 mission 级手写工作流优先于
  slice 执行声明。该遗留路径仍受支持，并报告一条"未选择项目图"的提示。向
  既有复制的 mission 工作流添加项目图需要显式选择模式或移除副本。惰性的
  `workflow` 或 `workflow_ref` 之类的项目生命周期字段会被拒绝，而不是静默
  忽略。

一个已编写、已就绪的后继可以是依赖 `release-boundary` 的 mission 扩展步骤。
没有该扩展时，`release-boundary` 以 `done` 退出并结束当前生命周期。运行时
创建延续包；智能体判断就绪并执行任何经授权的激活。它不会从文件夹推断就绪，
也不会自动激活未来范围。

编译暴露 `graphSource`（选择模式、项目/mission 地址、必需 ID）、完整
`workflowSpec`、依赖与来源摘要。它们被绑进编译输入摘要并在实例化时持久化。
在既有 operation key 下变更源码字节会被拒绝。传给 CLI `compile` 与
`instantiate-lifecycle` 的相对路径都在 **HTTP 之前按调用者 cwd** 解析，守护
进程 cwd 无法改变其含义。

`workflow guidance <instance> [--packet <qitem>] [--component <id>] [--full]`
读取当前选定的 SDLC 教学与原始 SPEC 意图。`workflow show` 与
`workflow continue` 暴露同样的指引。入口、交接、路由与恢复包携带紧凑预览；
既有的已接纳等待通知在发送时刷新它。健康的等待不会每个 tick 都读取或注入
目录。

选择顺序为 project → mission → 显式活跃 slice（或遗留 slice 的确切可执行
身份）。更窄的组件列表替换祖先组件与边；省略目录则继承。仅绑定成员列表不会
选出活跃 slice。目录地址使用共享的 H2/H3 解析器：绝对或 `$OPENRIG_HOME`
路径、相对声明清单的路径、来自该清单 Git 树的 `root: repository`，或已安装
上下文库声明的文件。缺失/歧义组件与不可用来源是指名的未知项；散文逐字保留，
没有必需的语义字段本体。

紧凑指引预览一个组件，尽可能用精确属主匹配；否则标注为菜单预览。位置保持
未知：数组顺序、时钟与交接都推断不出方法进度。`--full` 展开与当前包保管
相关的组件（无匹配时为全部选定组件）；`--component` 显式选择一个。整体超大
的散文块被整体省略并附展开提示，被裁剪的注意事项绝不会伪装成完整教学。

指引对照生命周期绑定与当前目录哈希报告清单哈希。被引用的散文是当前的手写
建议，不是缓存的可执行快照。YAML 选择编辑走既有的修订路径；仅目录的散文
变更在读取时刷新，不创建工作或新的修订存储。阅读建议、收到通知与独立接受
保持彼此区分。

`workflow show`、只读的 `workflow revise` 与 TUI 区分当前、仅来源、兼容、
不兼容与不可用的手写比较。目录或成员资格字节可以变化而不改变可执行步骤；
文件编辑不会静默采纳任何一种变化。受支持的 `revise --apply` 在同一实例上
采纳未来步骤变更的同时，保留已完成/存活步骤、必需义务、队列保管与先前回执。
它要求所检视的版本/摘要、稳定的 operation key、actor 与原因。变更的已完成/
存活步骤、移除的义务与不受支持的迁移以具体解释拒绝；请恢复受保护的契约，
并修订未开始的后继。响应有歧义后，检视 `workflow operation <key>` 或重试
完全相同的 apply 命令，以取回其唯一一次已提交的效果。

绑定 mission 的延续与等待指引携带手写规划、波次准入/评审与整合规则的快照，
并附一个在决定前检视当前来源的指引。波次引导智能体；可执行依赖调度步骤。
绑定的 slice 来源不会自动创建子工作流。执行视图还把当前编排指引以精确来源
字段读入 `planning_guidance`。普通的 mission/wave/slice 检视把准入、评审与
已接受核心/完整契约指引同可执行边、可归因证明与当前保管保持区分；散文不
创造那些事实。

`workflow show`/JSON 与 TUI 执行视图显示每个具名义务及其状态与回执状态。
必需步骤在成功的 `done`/`handoff` 退出时需要 `project --evidence-ref <ref>`；
缺失引用在任何变更前以 `lifecycle_receipt_required` 拒绝。waiting 与 failed
退出仍然可用。投影记录谁在何时提供了引用。`recorded` 意味着存在一条可归因
的工作流回执，不表示守护进程核验过其实质。普通的终态队列行绝不提供该回执。
智能体检视实际证据，包括经过论证的不适用或推迟的边界领域。既有的带类型
`acceptance` 契约保持独立并保留其检查。

### 手写 mission 边界（legacy）

没有项目属主图时，若 mission 声明 `lifecycle.workflow`，`compile` 使用该
显式工作流，而不是从活跃 slice 推导步骤。slice 成员资格与反向链接仍被校验
并纳入来源；slice 的 SDLC 选择不添加工作流步骤或闸门。`lifecycle.profile`
必须与 `project.yaml` 中选定的 profile 匹配：

```yaml
# Add to mission.yaml; project.yaml already selects release-boundary-v0.
lifecycle:
  profile: release-boundary-v0
  workflow:
    context_refs: [SPEC.md, PROGRESS.md, NOTES.md]
    entry: {role: orchestrator}
    roles:
      orchestrator: {preferred_targets: [orch@my-rig]}
    steps:
      - id: mission-boundary
        actor_role: orchestrator
        objective: Inspect current evidence and decide the next authored exit.
        allowed_exits: [waiting, done, failed]
        re_present_after_seconds: 300
        re_present_max_seconds: 3600
```

嵌套的 `workflow` 使用普通工作流语言；其 ID 默认为
`lifecycle-<project>-<mission>`，编译版本从来源摘要推导。显式允许 `waiting`
的边界步骤默认五分钟初始提醒与一小时上限；示例中的两个字段覆盖这些默认。
缺失操作身份使编译不合格。用一个不透明 `--operation-key` 实例化会持久化
编译输入摘要与生命周期绑定；精确重放返回同一实例/入口包，该 key 下输入变更
则拒绝。仅有编写永远不会启动实例。

`context_refs` 在入口、后继、路由/恢复与提醒包中携带地址。生命周期编译器
还包括项目/mission 清单与 `project.install.context`。相对项目引用从项目根
解析；profile 工作流引用从项目根解析，mission 工作流引用从 mission 目录
解析。引用不是证据裁决：接收智能体打开当前上下文，可以检视其之外的内容，
并自行选择出口。守护进程既不解释回执也不激活 mission。`rigx project` 仍是
独立的手动影子。

在 mission 边界编译之外，仅带 `re_present_after_seconds` 的未映射 `waiting`
退出仍是一次性。加上 `re_present_max_seconds` 即选择加入既有的队列/看门狗
定时器，以指数退避重复：示例在提醒之间等待 5、10、20、40、60 分钟。上限
必须是不小于初始延迟的整数。不会创建新包。重复的 waiting 确认保留时间表；
结构化 `closureEvidence` 变化或新阻塞项则重置。
`rig workflow project --evidence-ref <ref>` 把可归因的引用记录为关闭证据，
不解释它，也不替代带类型的验收。省略证据保留先前证据，对象键顺序无关紧要。

在确切的 qitem 阻塞项上的流转会让提醒在下一个调度器 tick 到期（通常在一秒
内），并重置初始延迟。唤醒送达回执不算进度。工作流自己的 waiting 确认在其
前沿包上，而不在其上游阻塞项上；重复的等待不能指名自己为自己的阻塞项。
阻塞项完成保留原生队列的解除搁置/唤醒行为。终态或改路由的包退役其定时器。
重启调和阻塞项流转身份并恢复持久化延迟；重放同一流转不会创造另一次唤醒。
存活的重复定时器可能带着一次未消费的唤醒：这是搁置状态中的两个独立事实。
硬性人类闸门用既有的 `gate` 字段编写；提醒不会制造闸门，也不会满足闸门。

## 运维检视

面向压缩规划、工作流心跳与席位交接可观测性的只读检视命令。本节默认模式为
只读。

### `rig compact-plan`

用法：`rig compact-plan [--rig <name>] [--refresh] [--threshold-tokens <n>] [--threshold-percent <0-100>] [--json]`

注记：
- 规划 Claude 原地压缩候选，不做任何压缩（只读分诊）。
- `--threshold-tokens <n>` 是估计的已用 token 阈值；
  `--threshold-percent <0-100>` 是上下文窗口大小缺失时的已用百分比阈值。
- 输出按当前启发式识别可作为压缩候选的席位；压缩什么（如果有的话）由
  操作者决定。

### `rig heartbeat`

用法：`rig heartbeat [--rig <name>] [--nudge] [--include-done] [--json]`

注记：
- 从队列文件显示工作流执行证明状态。
- 默认模式只读。`--nudge` 向停滞或未证明的属主发送信息性证明指引；它不
  修改队列文件，也不改路由工作。
- `--include-done` 把 done/handed-off 队列条目纳入输出（默认排除）。

### `rig seat`

用法：`rig seat <subcommand>`

子命令：
- `status <seat> [options]`——显示只读的席位交接可观测性状态。
- `handover <seat> [options]`——规划一次安全的两阶段席位交接。
- `launch <seat> --fresh --reason <text> [--stop] [--operator <address>] [--json]`
  ——为恰好一个既有席位创建审慎的空白占用者。不使用任何连续性来源；存活的
  托管占用者要求 `--stop`，被 adopt 或未纳管的歧义则拒绝。
- `clear-attention <session> [--reason <text>] [--json]`——对卡在
  `attention_required` 的席位做有证据门控、操作者担保、经审计的调和。

注记：
- `status` 读取席位交接可观测性表（迁移 `021`）；不做任何变更。
- `handover` 规划两阶段序列；实际执行经既有的席位启动呈现面、在操作者门控
  下进行。
- `clear-attention`（v0.3.4）用捕获的证据清除卡住的 `attention_required`
  启动状态；`--reason <text>` 是跳过证据门的操作者担保覆盖（经审计）。取代
  手工编辑 SQLite 的变通做法。

## Mission Control/队列可观测性（PL-005 Phase A）

Mission Control 是既有 shell 内的集成产品 UI，不是新的 `rig` 命令。PL-005
最初把只读节点呈现面命名为 `rig ps --nodes --json`；在 v0.4.4 揭示阶梯下，
全舰队投影节点来源是 `rig ps --nodes -A --json`。

Mission Control 经产品 UI 的 `/mission-control` 路由到达。HTTP API 呈现面
（`/api/mission-control/*`）记录在
`docs/as-built/architecture/mission-control.md`。7 个动词（`approve`、`deny`、
`route`、`annotate`、`hold`、`drop`、`handoff`）经
`POST /api/mission-control/action` 执行；7 个视图经
`GET /api/mission-control/views/:view-name` 读取。

Mission Control 消费 `rig ps --nodes -A --json` 做舰队汇总，以规范 CLI 来源
优先。跨 CLI 版本漂移按 PRD § Runtime/Source Drift Acceptance 的 4 个子条款
处理：缺失字段以诚实的"该 rig 守护进程版本不提供此字段"占位符呈现；每会话
每 rig 一次的日志避免刷屏；舰队视图显示顶层的"rigs 运行旧版 CLI"指示器。

## 智能体镜像、上下文包与工作区（v0.3.0）

v0.3.0 交付了三个顶层命令，面向操作者编写的库内容（智能体镜像与上下文包）
与工作区原语。

### `rig agent-image`

用法：`rig agent-image <subcommand>`——浏览、快照并管理智能体镜像（PL-016）。

子命令：
- `list [options]`——列出库中的全部智能体镜像。
- `show <name-or-id> [options]`——显示镜像清单 + 统计。
- `preview <name-or-id> [options]`——显示清单 + 带大小的补充文件元数据 +
  starter 片段。
- `create <source-session> [options]`——把高产席位的可恢复状态捕获为新的
  智能体镜像。
- `delete <name-or-id> [options]`——删除智能体镜像（受证据保留守卫约束）。
- `pin <name-or-id> [options]`——固定镜像，使 prune 无法删除它。
- `unpin <name-or-id> [options]`——取消固定镜像。
- `prune [options]`——删除可逐出的镜像（受证据保留守卫保护）。
- `sync [options]`——重走发现根并刷新库索引。

注记：
- 镜像是操作者编写的库形态；删除受证据保留守卫门控，使高产席位的快照不会
  被意外丢失。
- `pin` / `unpin` 是操作者做显式保留的杠杆；`prune` 遵循它们。

### `rig context`

用法：`rig context <subcommand>`——浏览、预览、组织并管理操作者编写的上下文
包。该名词绝不投递；投递属于 `send`、`broadcast`、`walk` 与 `queue create`。

子命令：
- `work-install [--project <id>] [--mission <id>] [--slice <id>] [--deliver] [--runtime <claude-code|claude|codex>] [--cwd <agent-working-directory>] [--topology <ids>] [--apply-skills] [--json]`——在一个计划中解析
  project/mission/slice Markdown 加 `project.yaml install.skills`。带
  `--runtime` 时，组合系统、拓扑与项目选择器并报告逐技能来源/状态；
  `--apply-skills` 安全地把属主的运行框架投影调和进 `--cwd`（默认：调用者
  当前工作目录），而不是工作区元数据目录。省略 `--runtime` 则无论
  `OPENRIG_RUNTIME` 如何都跳过技能检视；应用技能需要显式运行时。
- `profile <name-or-ref> --situation <fresh|handover|post-compaction> [--runtime <claude-code|claude|codex>] [--profile <id>] [--budget <tokens>] [--rig <rig> --seat <seat>] [--mission <mission>] [--slice <slice>] [--json]`——组合选定的
  原子图与显式授予的上下文。运行时默认取 `OPENRIG_RUNTIME`，否则 Claude；
  未知的非空环境值警告并回退到 Claude。显式标志覆盖环境。
- `list [options]`——列出库中的全部上下文包。
- `show <name-or-ref> [options]`——显示包清单 + 逐文件元数据。
- `preview <name-or-ref> [options]`——显示组装好的 bundle 而不投递它。
- `compose --out <ref> --from <files...>`——把有序文件组织成持久上下文引用
  而不投递。
- `sync [options]`——重走发现根并刷新库索引。
- `add <source> [--git] [--checkout] [--pack <relative-path>] [--name <ref>] [--json]`——安装目录/清单 URL，或用 `--git` 克隆 Git 仓库。Git 发现
  检查仓库根清单与 `.openrig/context-packs`；多包需要显式 `--pack`。
  `--checkout` 选择一个既有的本地检出，其分支可能被 update 合并。
- `source inspect <ref> [--json]`——区分选定的修订/摘要、当前被服务的编辑、
  检出的分支/修订/状态/冲突，以及本地已知的上游分歧。它不抓取，也不证明
  消费。
- `source update <ref> [--json]`——显式抓取并合并所选检出分支的上游，然后
  发布其干净的已声明包输入。脏检出或被编辑的被服务选择在 update 前停止。
  冲突/上游不可用保留旧的被服务选择与两侧 Git 状态。
- `rm <ref> [options]`——按路径式引用移除上下文包。

注记：
- 上下文包是操作者编写的上下文捆绑（清单 + 文件），意在用连贯的起始上下文
  为托管席位做预处理。
- `profile` 与 `work-install` 都接受 `claude-code`、其别名 `claude` 与
  `codex`。无效的显式值在 CLI 参数解析期、上下文查找或投影之前失败。JSON
  元数据保留消费者既有键：`profile.runtime` 是 `claude` 或 `codex`；
  `skillProjection.runtime` 是 `claude-code` 或 `codex`。两种 Claude 拼写在
  每个命令内产生相同的选择与元数据；清单 runtime 键保持不变。
- 例如，`rig context profile world-public --situation fresh --runtime
  claude-code` 与 `rig context work-install --runtime claude-code` 使用相同
  的运行时拼写。读取席位上下文的 profile 原子仍同时要求 `--rig` 与 `--seat`。
- `preview` 是检视组装内容的标准只读方式。
- 该命令族与投递无关；上下文窗口检视不属于该名词。

Git 来源示例（使用目标实例与既有 Git 凭据）：

```bash
rig context add <repository-path-or-URL> --git --name team-world
rig context source inspect team-world --json
# 在报告的检出中用普通 Git 编辑/提交。
rig context source update team-world --json
rig context get team-world
```

Git 选择只把 `manifest.yaml` 及其声明的文件复制进既有上下文库；
`.openrig-git-source.json` 记录保留的检出、包、修订、选择时间与摘要。检出
与先前选择存放在配置库旁边的 `<context.root>-git-checkouts` 与
`<context.root>-git-history` 下。移除所选包时它们被保留。仅本地检视与缓存的
上游引用比对；只有显式 update 才联络远程。Git 使用既有凭据，终端提示被
禁用，命令超时 60 秒；失败保留检出以供原生 Git 诊断。

更新前先在检出中提交本地改进。若有人直接编辑了被服务的副本，把这些编辑
保留进检出并提交；重试前显式把被服务副本恢复到其记录的选择。不运行任何
自动 stash、reset、rebase、push 或冲突策略。合并冲突留在检出中，由属主作者
用 Git 解决/提交或中止。之后才重试 update。选定的字节、成功的
`context get`、以及有消费者确实在用它们，是彼此独立的事实。该命令不会自动
在其他实例中采纳上下文，也不证明智能体消费了它。

### `rig workspace`

用法：`rig workspace <subcommand>`——工作区原语（PL-007），v0 带类型类别
工具。

子命令：
- `validate [root] [--kind <kind>] [--no-recursive] [--require-frontmatter] [--max-files <n>] [--json]`——遍历工作区根，解析每个 `.md` 文件的
  YAML frontmatter，并发出结构化缺口报告。仅建议性——从不修改文件。默认
  根：`cwd`。`--kind` 按特定工作区类别校验
  （`user | project | knowledge | lab | delivery`）。`--max-files`（默认
  `10000`）硬性封顶遍历；v0.3.2 slice-01 GA 对该标志强制严格整数正则。
- `doctor [--workspace <path>] [--strict] [--json]`——对守护进程解析出的
  工作区运行 8 项检查的工作区就绪诊断（工作区根、missions 文件夹、文件
  允许列表、守护进程对齐、守护进程重载、可选 slice 文档、当前 `NOTES.md`
  或可读的遗留笔记，以及 SDLC 约定小节）。只读。默认退出码：仅 `fail` 时
  非零；`--strict` 使 warn 或 fail 均为非零。

注记：
- v0 呈现面刻意狭窄（只有 `validate`）；v0.3.2 增加 `doctor` 作为面向操作者
  的就绪诊断。
- 未来版本将在同一根遍历器上增加带类型类别的编写/重构工具。
- 全新默认工作区的脚手架见 `rig config init-workspace`。

## 插件检视（v0.3.1）

v0.3.1 增加一个只读顶层命令，检视从 `$OPENRIG_HOME/plugins/`（默认
`~/.openrig/plugins/`）发现的插件。v0 没有 `install` 动词——安装是操作者按
各插件的 `OPENRIG-INSTALL.md` 显式复制或符号链接。

### `rig plugin`

用法：`rig plugin <subcommand>`——只读插件检视。

子命令：
- `list [options]`——列出可发现的插件（聚合 vendored + 运行时缓存）。
- `show <id> [options]`——显示插件清单 + skills + hooks + mcp servers。
- `used-by <id> [options]`——列出在其 `profile.uses.plugins[]` 中引用该插件
  的智能体。
- `validate <path> [options]`——按 agentskills.io 规范校验插件清单 + 技能
  frontmatter。

注记：
- 插件发现把 `$OPENRIG_HOME/plugins/`（操作者在运行时内置携带）与守护进程
  捆绑的插件缓存聚合在一起。
- `openrig-core` 随守护进程捆绑交付（11 个技能）。其他插件（`gstack`——
  45 个技能；`obra-superpowers`——14 个技能）作为基底参考交付，供插件作者
  按各插件源码树内的 `OPENRIG-INSTALL.md` 流程复制安装。
- 一等的 `rig plugin install <substrate-path>` 动词推迟到 0.3.2。

## scope 树原语（v0.3.2）

一个顶层命令，首发于 v0.3.2（`scopeCommand`，
`packages/cli/src/index.ts:20,187`；定义于
`packages/cli/src/commands/scope.ts`；release-0.3.2 slice 12）。按
`conventions/scope-and-versioning` 操作 scope 树（mission、slice、子 slice）。

### `rig scope`

用法：`rig scope <subcommand>`——scope 树原语：mission、slice、子 slice。

顶层选项：
- `--workspace <path>`——覆盖工作区根（否则使用带类型的
  `workspace.slices_root` 设置；`$OPENRIG_WORK_ROOT` 仍是遗留覆盖）。

两个子命令组：`slice` 与 `mission`。

`rig scope slice <subcommand>`——slice 层命令：
- `ls [--mission <name>] [--state <state>] [--json]`——列出一个 mission
  （或全部 mission）中的 slice。`--state` 过滤：
  `active | closed | shipped | all`（默认 `active`）。
- `show <slice-path> [--mission <name>] [--json]`——检视单个 slice
  （frontmatter + README + 子项）。`slice-path` 可为绝对路径、相对
  substrate 路径或 `NN-slug`；路径只是 `NN-slug` 时 `--mission` 提示所属
  mission。
- `create <mission> <slug> [--template <kind>] [--title <text>] [--intent <text>] [--depends-on <dot-id...>] [--json]`——创建模式中立的 slice
  脚手架：一份带意图的 `SPEC.md`（含三个约定小节）、`PROGRESS.md`、
  `PROOF.md` 与 `proof/`。`depends_on` 接受同 mission 兄弟 slice 的点 ID，
  是建议性的构建顺序数据。每种模板类别发出同一文件集；模式丰富度经模板
  接缝组合。
- `progress <slice-path> [--mission <name>] [--status <state>] [--milestone <text>] [--owner <session>] [--note <text>] [--json]`——**新动词（v0.4.0，slice 33）**：确定性地追加 / 设置 / 更新进度条目。写入
  OpenRig PROGRESS UI 页面读取的规范结构。取代以 markdown 手工编辑
  `PROGRESS.md`。
- `stage <slice-path> <new-stage> [--mission <name>] [--successor <id>] [--json]`——**新动词（v0.4.0，slice 35）**：确定性地设置
  slice 的 `stage` frontmatter（wip / provisional / established / canonical /
  superseded / retired）。`superseded` 必须带 `--successor <id>`（否则拒绝 +
  记录后继）；`retired` 警告"不要使用"；无效阶段被拒绝并指名有效集合。
- `verified <slice-path> --against "<source>" [--mission <name>] [--json]`——**新动词（v0.4.0，slice 35）**：把 slice 的 `verified` 行盖上
  `verified: <today> against <source>`。`--against` 为必需（拒绝裸时间戳
  ——按 `conventions/scope-and-versioning` §2 的防陈旧拱心石）。覆盖先前
  的 verified 行。
- `reconcile <slice-path> [--mission <name>] [--json]`——**新动词（v0.4.0，slice 35）**：幂等修复。回填缺失的 `PROGRESS.md`，使必需
  frontmatter（`id` / `stage` / `verified`）合规，并修复 id 注册幽灵
  （`id:null` / 重复前缀）。可安全重跑。
- `ship <slice-path> <release-mission> [--mission <name>] [--json]`——把
  slice 交付到发布 mission（保留 git 历史）。
- `close <slice-path> [--note <text>] [--mission <name>] [--json]`——关闭
  一个 slice（移入 `<mission>/closed/`，更新状态）。`--note` 是可选的关闭
  注记。
- `move <slice-path> <dest-mission> [--mission <name>] [--json]`——在
  mission 之间移动 slice（在目的地重新编号）。

`rig scope mission <subcommand>`——mission 层命令：
- `ls [--json]`——列出 mission（带 `README.md` 的顶层文件夹）。
- `show <mission> [--json]`——检视单个 mission。
- `create <name> [--template <kind>] [--id <dot-id>] [--title <text>] [--intent <text>] [--depends-on <dot-id...>] [--no-notes] [--json]`——创建
  mission，含带意图的 `SPEC.md`、`NOTES.md`、`PROGRESS.md` 与 `slices/`。
  `depends_on` 接受同项目兄弟 mission 的点 ID，是建议性的构建顺序数据。
  `--no-mission-notes` 仍是 `--no-notes` 的已弃用别名；旧的笔记模板环境
  变量仍可读并附提示。
- `graph <mission> [--json]`——显示 slice 依赖节点、当前 ready/waiting
  集合，以及针对畸形、跨父或缺失依赖的提示。陈旧边绝不阻塞或使读取器
  崩溃。
- `progress <mission> [--status <state>] [--milestone <text>] [--owner <session>] [--note <text>] [--json]`——**新动词（v0.4.0，slice 33）**：确定性地在 mission 的 `PROGRESS.md` 上追加 /
  设置 / 更新进度条目。构造上即 UI 合法。
- `stage <mission> <new-stage> [--successor <id>] [--json]`——**新动词（v0.4.0，slice 35）**：确定性地设置 mission 的 `stage`
  frontmatter。枚举与 superseded 必带 `--successor` 的规则与 slice 变体
  相同。
- `verified <mission> --against "<source>" [--json]`——**新动词（v0.4.0，slice 35）**：给 mission 的 `verified` 行盖章。`--against` 必需。
- `reconcile <mission> [--json]`——**新动词（v0.4.0，slice 35）**：幂等的
  mission 层修复（回填 `PROGRESS.md`、使 frontmatter 合规、修复幽灵）。

约定合规性：`rig scope` 连同 slice 33（`PROGRESS.md` + 脚手架）与 slice 35
（`stage` / `verified` / `reconcile`）使 `rig scope` 成为
`conventions/scope-and-versioning`（§1 点 ID、§2 成熟度词表）的**确定性
强制者**。智能体经命令更新约定，而不是手工编辑 markdown。

### SDLC 控制平面动词（v0.4.4）

这些动词所操作的约定住在唯一一份已交付文档：
`docs/reference/sdlc-conventions.md`（复制进组装后的 CLI 包）；操作规程是
打包的 `mission-slice-sop` 技能。

- `rig scope slice|mission approve <target> [--scope spec|delivery] [--actor <session>] [--on-behalf-of <human>] [--json]`——两道分阶段审批锁，
  一条守护进程侧写入路径。`--scope spec` 对节点的 `SPEC.md` 做计划锁定；
  `--scope delivery`（默认）是终态签收。审批是冻结/签收，绝不是已证明
  变绿。
- `rig proof add <slice-path> --artifact-type <guard|qa|rev1-r1|rev1-r2|adjudication> --verdict <CLEAR|BLOCKING|CONCERNING|PASS|NOT-CLEAR> --candidate-sha <sha> --money-evidence "<line>" [--file <path>|--body <text>] [--evidences <refs>] [--media <refs>] [--self-check <text>] [--json]`——**v0.4.4（slice 19 FR-8；`--media` 经修正案
  §3.4）**：把一个证明工件放入 `<slice>/proof/`，带机器可读的 C1 头，投放
  时校验（上方封闭集合）。`--evidences`（条目文本或 1 起始索引）把投放
  联接到 slice 的 `## Proof contract` 条目——即 Living Notes DELIVERED
  小节渲染的配对；`--media`（proof/ 相对引用，含围栏检查，绝不绝对路径）
  指名该投放所支撑的策展媒体，投影进 DELIVERED 条目的证明集。契约/自检
  输出仅是建议（退出码 0），绝不是闸门。
- `rig scope audit <mission> [--json]`——检查 C1 头与单一 SPEC 约定
  （frontmatter `intent:` 或可读的遗留 Intent 小节、Mini-requirements、
  Proof contract、当前 NOTES）。它绝不要求第二份 PRD。全部约定发现均为
  建议性/失败开放。

注记：
- 呈现面已对照 `packages/cli/src/commands/scope.ts` 于 `51554eee`（v0.4.0
  slice-35 后）完成源码核验；SDLC 控制平面动词已在 OPR.0.4.4.23 中对照
  `scope.ts` / `proof.ts` / `scope-audit.ts` 完成源码核验。

## 技能级联审计（v0.4.0）

一个顶层命令，首发于 v0.4.0（slice 10——技能/知识生命周期策展，受 Hermes
启发）。定义于 `packages/cli/src/commands/skill.ts`。与守护进程侧审计呈现面
`packages/daemon/src/routes/skills/audit.ts` + `mirror-drift` 检测配对。

### `rig skill`

用法：`rig skill <subcommand>`

子命令：
- `loadout --runtime <claude-code|codex> [--cwd <path>] [--project-root <path>] [--topology <ids>] [--apply] [--json]`——检视由 `catalog.yaml`
  系统选择器、拓扑/profile 选择器与 `project.yaml install.skills` 选出的
  确定性托管负载。报告选择器理由、目录 Git 修订/内容摘要、目标，以及
  current/missing/shadowed/conflicting 状态。`--apply` 写入精确字节加属主
  清单，幂等，并拒绝覆盖或移除本地已修改/非属主内容。
- `audit [--json] [--include-cache] [--severity <level>] [--rig <name>]`——技能级联的只读审计。检测 canonical → 产品镜像 → hub cwd → 已安装
  插件链上的来源 + 新鲜度问题。

呈现的审计类别：
- **`missing`**——级联中某技能位置缺少 SKILL.md 文件而兄弟位置有（声明
  级联相对缺口）。
- **`stale`**——SKILL.md 文件存在但比规范的旧，或内容哈希不匹配。
- **`self-referential`**——SKILL.md 来源指针引用自己的位置而不是上游来源。
- **`invalid-date`**——frontmatter `last-verified` / `last-updated` 畸形
  或在未来。
- **`mirror-drift`**——下游镜像副本偏离规范而无已记录的有意分叉。

注记：
- **只读**：审计不变更任何技能文件。发现被路由回生命周期（curation-steward）
  以进行成形传播运行。
- **防假绿**：当 mirror-drift 证据因任何原因不可用（守护进程离线、文件系统
  不可访问）时，CLI 发出清晰的 `unable-to-audit` 结局、退出码 `2`，而不是
  报告 `clean`。这堵住了 v0.3.4 wrap-gate AC-3 差点交付的失败模式（"Mirror
  sync verified via `npm run mirror-skills` clean"——那次同步未触碰基底规范
  或 hub cwd）。
- `--include-cache` 把打包安装器缓存副本纳入审计（默认跳过，因为它们交付后
  不可变）。
- `--severity <level>` 过滤输出：`info`（默认；全部）、`warn`（仅 stale +
  mirror-drift）、`error`（仅 invalid-date + self-referential）。
- `--rig <name>` 把审计收窄到单个 rig 内嵌的技能副本。
- `--json` 发出结构化发现：
  `{cascade: [...locations...], findings: [{category, path, evidence, suggested-action}]}`。
- 退出码：`0` 干净，`1` 有发现，`2` 无法审计。

与既有的 `scripts/mirror-skills.mjs` 守护栏组合——审计检测
`mirror-skills` 也会抓到的东西，外加该脚本不触碰的 canonical / hub cwd 层。

## 操作者上下文模式绑定（v0.3.2）

一个顶层命令，首发于 v0.3.2，名为 `rig policy`（release-0.3.2 slice 09），
0.5.2 中按 PM 裁定 RULING-rig-mode-rig-policy-naming 更名为 `rig mode`
（干净更名，无别名——确认零采用；`rig policy` 正作为权限策略动词被重新
引入）。定义于 `rigModeCommand`（`packages/cli/src/commands/rig-mode.ts`）。
与守护进程在 `packages/daemon/src/db/migrations/041_rig_policy.ts` 的带类型
原语存储配对（DB 工件名称保持交付形态）。操作模式感知智能体姿态所用的
操作者上下文模式绑定呈现面（sleep / desk / mobile / away / focus / debug）。

### `rig mode`

用法：`rig mode <subcommand>`

子命令：
- `set <mode> [--scope <scope>] [--qualifier <id>] [--<field> ...] [--evidence <citation>] [--confirm] [--bearer <token>] [--json]`——提议一个
  绑定。不带 `--confirm` 时，CLI 回显提议的绑定并以退出码 2 退出，使脚本
  无法意外应用；`--confirm` 是显式的操作者动作。`<scope>` 是
  `global_host | rig | workstream | qitem` 之一（默认按模式的建议值）。
  `rig | workstream | qitem` 范围要求 `--qualifier <id>`，`global_host` 则
  拒绝。逐字段调优标志：`--autonomy-scope`、`--heartbeat-cadence`、
  `--inspection-depth`、`--update-detail`、`--escalation-threshold`、
  `--concurrency-limit`、`--permission-prompt-posture`
  （`normal | batch_for_human | do_not_prompt_unless_blocked` 之一；
  `auto_accept` 按约定被禁止）、`--expiry-or-stale-rule`。`--evidence`
  携带自由文本的操作者引证（消息 id、文件指针、聊天室话题等）。
- `show [--json]`——列出全部操作者上下文模式绑定。
- `effective [--rig <id>] [--workstream <id>] [--qitem <id>] [--json]`——为（rig, workstream, qitem）读取上下文解析生效模式。无绑定匹配时
  呈现 `unknown_posture`。
- `cite [--rig <id>] [--workstream <id>] [--qitem <id>]`——为读取上下文处
  的生效模式发出短散文引用行（按约定 §Citation Rules）。
- `unset <scope> [qualifier] [--bearer <token>] [--json]`——删除一个绑定
  （仅操作者）。
- `defaults [--json]`——打印推荐的逐模式 6×7 字段默认值 + 默认范围映射 +
  过时规则。

注记：
- 6 种模式是 `sleep | desk | mobile | away | focus | debug`。接受裸词调用
  （`set desk`）；`mode:<word>` 是消歧的前缀形式。
- 复述后确认姿态（HG-4）：在传入 `--confirm` 之前，`set` 只做复述。这防止
  脚本意外应用。
- `global_host` 严格拒绝 `--qualifier`（HG-7 守护发现）：输入
  `--scope global_host --qualifier <id>` 的操作者得到错误且守护进程绝不会
  被联络。CLI 绝不静默丢弃 qualifier。
- 操作者编辑类变更（`set --confirm`、`unset`）要求操作者 bearer 令牌
  （`--bearer` 或 `OPENRIG_AUTH_BEARER_TOKEN` 环境变量）。
- 呈现面已对照 `packages/cli/src/commands/rig-mode.ts` 于 `b13a8e4c7`
  （0.5.2 更名）完成源码核验。

### `rig policy`

用法：`rig policy <subcommand>`——顶层权限策略动词，0.5.2 在上下文模式动词
迁往 `rig mode` 后引入（RULING-rig-mode-rig-policy-naming）。OpenRig 不内置
任何 allow/ask/deny 权限策略——运行框架原生的权限才是控制面。该动词只做
教授并把选择记录进 RigSpec（`permission_policy: builtin:<name> | none`）；
它从不在运行时强制。

子命令：
- `list [--json]`——内置模板（`locked | standard | open | yolo`）加保留的
  审慎 `none` 选择，各附其 ref 形式。
- `show <name> [--json]`——单个选择：其 ref 形式与记录它意味着什么。
- `current --spec <path> [--json]`——rig spec 中记录的 `permission_policy`
  值及其分类（缺席 = 底线；`none` = 审慎；`builtin:<name>`；自定义相对
  路径）。
- `apply <name> --spec <path> [--json]`——经与 `rig setup --policy` 相同的
  保留注释流程把选择记录进既有 spec（`rig setup --policy` 保持为安装步骤
  的组合，不是别名）。全新安装没有 spec；什么都不写，底线因缺席而成立。

## 不存在的命令

这些不是当前的顶层 `rig` 命令：
- `rig claim`
- `rig blame`
- `rig replay`

若旧文档或习惯提到它们，把这些引用当作过时处理。
