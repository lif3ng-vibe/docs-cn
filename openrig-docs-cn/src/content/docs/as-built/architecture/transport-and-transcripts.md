---
kind: as-built
title: 传输、会话记录、Chat 与 Ask
status: active
topics: [coordination, observability]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  需要了解 rig send/capture/broadcast 如何工作、pipe-pane 会话记录捕获
  与 rg/grep 搜索的行为、持久的 rig chat（SQLite + SSE）如何建模、
  rig ask 收集什么，或 MCP 工具名与 tmux 元数据键的准确命名区分。
siblings: [daemon-core.md, lifecycle-snapshot-restore.md]
prerequisite-reads: [../README.md, daemon-core.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


通信与历史层：tmux 是传输，不是真相。send/capture/broadcast 以诚实报错包装 tmux；会话记录（transcript）是原始的 pipe-pane 捕获；chat 由守护进程落 SQLite；`rig ask` 收集证据但从不调用 LLM。

> 已在 HEAD `7eaf524c` 对照源码验证（`git describe` → `v0.3.1-6-g7eaf524c`）。包版本 **0.3.1**（slice-00 §1.1）。按 slice-08 §10.1，以 `architecture.md` 标题定位源码（§5 Transport and communication、§6 Communication/Transcript/Chat flows、§11 Compat notes）——行号仅供参考。

## 1. 两条命名轴（D5——先读本节）

本模块承载 D5 漂移，它有**两条相互独立的轴**，绝不可混为一谈或一刀切替换（已入库的 `feedback_release_prep_three_layer_depersonalization`：改名是有范围的，不是全局的）。逐处对照源码验证：

**轴 1——MCP 工具名：`rig_*`（architecture.md 已过时 → 已纠正）**。slice-00 §1.4 确认全部 17 个 MCP 工具都是 `rig_*`。`architecture.md` 中的 `rigged_*` 引用是早于 v0.2.0 的某次改名留下的过时文本：

> 漂移修正 D5（MCP 工具名轴）——`architecture.md` §5 的 `node-inventory.ts` 描述说 MCP 是 `rigged_rig_nodes`；§6 chat 流程说 MCP `rigged_chatroom_send` + `rigged_chatroom_watch`。已纠正为 **`rig_*`**。已在源码重新确认：`mcp-server.ts:288` 注册 `"rig_rig_nodes"`、`:305` `"rig_send"`、`:339` `"rig_capture"`、`:364` `"rig_chatroom_send"`、`"rig_chatroom_watch"`（工具 #17）。非测试产品源码中零处 `rigged_chatroom_send` / `rigged_send` / `rigged_rig_nodes`（@HEAD grep 干净）。slice-00 §1.4；改名落地于 `b183c50c`，早于 v0.2.0。

**轴 2——tmux 元数据键：`@rigged_*`（architecture.md 正确 → 不可改动）**。claim/bind 时写入的 tmux 元数据键与 MCP 工具名是两回事，且未被改名：

> 漂移辨析 D5（tmux 元数据键轴）——`architecture.md` §6 "Whoami and adopted-session parity flow" 列出 `@rigged_node_id`、`@rigged_session_name`、`@rigged_rig_id`、`@rigged_rig_name`、`@rigged_logical_id`。这些**按原样正确**——已在源码逐字验证：`claim-service.ts:77-81` 写入的正是这五个 `@rigged_*` 键。不要一刀切 sed `rigged` → `rig`；这是逐处核对，不是全局替换。（元数据键轴详见 `agent-spec-and-startup.md` §6。）已重新确认 `claim-service.ts:77-81` @HEAD。

## 2. 传输与通信域服务

（`architecture.md` §5 "Transport and communication"）

- `session-transport.ts`——通信原语：send/capture/broadcast，带会话解析（规范名 + 遗留名）、mid-work 检测、诚实报错、pod/rig/global 定向。
- `transcript-store.ts`——pipe-pane 会话记录管理：读取时剥 ANSI、边界标记、readTail、grep。以文件系统为底，不是 SQLite。
- `history-query.ts`——会话记录 + chat 搜索。可用时优先 `rg`，回退 `grep -E`，并明示用了哪个后端。重新确认：`history-query.ts:7` `backend: "rg" | "grep" | "none"`；`:103` 执行 `rg -i --no-filename -e <pattern>`；`:108` 返回 `backend: "rg"`。
- `ask-service.ts`——上下文工程证据包：收集 rig 摘要加会话记录摘录、chat 摘录、不足状态与指引。不调用外部 LLM。
- `chat-repository.ts`——持久的 rig 范围 chat：`chat_messages` 表的 CRUD，SSE 兼容的事件发射。

路由：`routes/{transport,transcripts,ask,chat,whoami}.ts`——全部确认存在于 @HEAD。

## 3. 通信流程

（`architecture.md` §6 "Communication flow"）

`rig send <session> "message"` → CLI → `POST /api/transport/send` → `SessionTransport`：

1. 解析会话名（规范名或遗留名；按 session/rig/pod/global）。
2. 检查 mid-work 状态（除非 `--force`）——重新确认 `session-transport.ts:136-141`（`findPatternEvidence(recentLines, MID_WORK_PATTERNS)`）；遗留 mid-work 检查在 `:666`。
3. 两步式 tmux 发送：无论负载大小，先以 `paste-buffer -d -r -p` 粘贴唯一的 file/buffer → 约 200ms 延迟 → 单独的 `C-m`。括号粘贴（bracketed paste）在支持的 TUI 中保留多行输入；负载绝不进入 shell 参数。粘贴成功只证明传输已执行，不证明运行时已消费。（`session-transport.ts:717` 提交 `C-m`。）
4. 可选 `--verify`：捕获发送后的 pane，检查消息可见性（`session-transport.ts:305` `verify?`；`:694` `if (opts?.verify)`）。
5. 失败时给出带原因的诚实结果。

架构规则 18（沿用，`architecture.md` §7）：tmux 是传输，不是真相——`send/capture/broadcast` 以诚实报错可靠地包装 tmux。

### 3b. 跨主机协调动词（v0.4.6——OPR.0.4.6.MH4）

`rig send/capture/transcript/broadcast --host <id>`（以及会话定向动词上的 `agent@rig@host` 目标糖）跨越主机边界而 **daemon 侧零改动**——远程 daemon 现有的本地路由完成全部工作；唯一新增是 CLI 传输分支。

- **接缝原则（arch 裁定）**：单边性（sidedness）+ 调用方决定接缝。来自具备 bearer 能力的调用方（CLI 在本地解析 registry bearer）的单边远程操作走**直连 CLI**，经随版本发布的 `runRemoteHttpOp`——一跳，不经本地 daemon（`ps --all-hosts` 先例）。双边操作（MH-3 的队列交接要关闭本地源并创建远程后继——本地 daemon 拥有事务的一半）或不具备 bearer 能力的调用方（浏览器：MC-action、MH-2 的读取穿透）使用 **daemon 侧先转发后剥离**。MH-4 的四个动词是来自 CLI 的纯单边远程操作。
- **传输方式由主机条目决定（ssh XOR http），绝非逐次调用可选**：ssh 主机对 send/capture 保持随版本发布的 shell 外调逐字节原样；http 主机（`pair` 前门的类型）走 CLI 直连分支，调用 `POST /api/transport/send|capture|broadcast` / `GET /api/transcripts/*`，body/路径与本地 CLI 构造的完全相同（一条路由、两个调用方 = 构造上即包装对等）。transcript 与 broadcast 仅支持 http（不存在对应的 ssh 路径）；传输方式用错的动词会以结构化的 requirement 错误终止——绝不回退。
- **终端 bearer 姿态（具名限制，v0——仅 `/api/transport/*`）**：远程的 transport 路由（send/capture/broadcast）以它自己的终端 bearer 类别为闸（`OPENRIG_TERMINAL_BEARER_TOKEN`，默认 null → 直通；tailnet 就是设计上的认证边界），而 CLI 在配置了 registry bearer 时出示 `hosts.yaml` 中的 REGISTRY bearer；对仅 URL 的匿名主机则省略 `Authorization` 头。远程若强制不同的终端 bearer，会以结构化的 `permission-gate` 步骤浮现（绝不挂起，绝不静默）。补救：把远程终端 bearer 设为与配对的 registry bearer 相同，或依赖 tailnet 边界。**会话记录读取刻意在此类别之外（arch n2）**：`/api/transcripts/*` 无闸挂载（`server.ts`——随版本发布的开放路由姿态；daemon 本地信任边界，以路由级凭据脱敏为保护性原语），因此把 `send --host` 闸住的错误终端 bearer 并不闸 `transcript --host`——读取继续成功，证明矩阵不得把四个动词的认证失败当作同一类别。跨 tail/grep/full 的统一会话记录读取认证策略是具名的未来切片，见 `routes/transcripts.ts` 自身注释（orch approved-option-a）。bearer 类别统一同样是具名后续项，不在 v0（不引入未经要求的认证机制）。
- **BR-1 成立**：三段式只是 CLI 边缘糖（后缀必须匹配一个已注册的主机 id，否则原样透传 + 醒目的主机提示）；到达任何 daemon 的会话字符串保持 `member@rig`；主机信息带外传递。持久的跨主机协调仍归 MH-3 的队列——MH-4 不新增队列呈现面。

## 4. 会话记录流程

（`architecture.md` §6 "Transcript flow"）

1. `NodeLauncher` 在 tmux 会话创建后立即启动 `pipe-pane`（早于运行框架启动）。
2. 原始终端输出流入 `~/.openrig/transcripts/{rig-name}/{session-name}.log`。
3. `TranscriptStore` 掌管路径约定、读取时剥 ANSI、边界标记、`readTail`、`grep`。
4. `rig transcript <session> --tail N / --grep "pattern"` 提供面向智能体的访问。
5. 恢复时：重新启动前写入一个边界标记；pipe-pane 重连同一路文件（追加）。（恢复侧细节见 `lifecycle-snapshot-restore.md` §3。）
6. `rig ask` 收集 rig 摘要加会话记录摘录、chat 摘录、不足状态与指引。

架构规则 19（沿用）：会话记录经 pipe-pane 原始捕获，读取时剥 ANSI；优先 `rg`，回退 `grep -E`。规则 22：`rig ask` 是上下文工程——收集证据，不调用外部 LLM；智能体本身就是 LLM。

## 5. Chat 流程

（`architecture.md` §6 "Chat flow"）

1. `rig chatroom send <rig> "message"` → `POST /api/rigs/:rigId/chat/send` → `ChatRepository.addMessage()`。
2. SSE：`GET /api/rigs/:rigId/chat/watch` 实时投递消息。
3. 历史：`GET /api/rigs/:rigId/chat/history` 返回完整频道历史；`POST /api/rigs/:rigId/chat/topic` 持久化话题标记。
4. UI：rig 抽屉中的 chat-room 标签页。
5. MCP：**`rig_chatroom_send` + `rig_chatroom_watch`**（D5 轴 1 纠正——`architecture.md` §6 曾写 `rigged_*`；源码 `mcp-server.ts:364` + 工具 #17）。
6. 事实来源：daemon 落地的 SQLite（`chat_messages` 表），不是 tmux scrollback。

**ChatMessage** 类型（`architecture.md` §4）：持久的 rig 范围消息——`id`、`rigId`、`sender`、`kind`、`body`、`topic`、`createdAt`。

## 6. 兼容性说明（逐字沿用，`architecture.md` §11）

这一层的刻意限制：

- 说明 4——`rig ask` 只收集上下文；不调用外部 LLM。由智能体对收集到的证据做推理。
- 说明 5——会话记录搜索优先 `rg` 但回退 `grep -E`；搜索质量/性能因后端而异。
- 说明 6——chat 仅限 rig 范围：没有跨 rig 频道或私信。
- 说明 7——`rig send` 的 `--verify` 检查 pane 内容中消息是否可见，但可能因预先存在的匹配内容产生假阳性。已知限制。

（§11 兼容性说明完整清单在 `architecture-rules-and-event-system.md` 中。）

## OPEN / 沿用事项

- **D5（需小心的一条——逐处解决，绝非一刀切替换）**：轴 1（MCP 工具名）把 `rigged_*` 纠正为 `rig_*`（3 处：§5 node-inventory、§6 chat 流程 ×2）。轴 2（tmux `@rigged_*` 元数据键）已在 `claim-service.ts:77-81` 逐字验证正确并保持不变。本模块拆分内容不适用任何 slice-00 数字漂移。

## 另见

- `daemon-core.md`——transport/transcript/chat/ask 属于 49 个路由挂载之列；MCP 工具数（17，`rig_*`）锚定于该篇。
- `agent-spec-and-startup.md` §6——tmux `@rigged_*` 元数据键轴细节（whoami/adopt）。
- `lifecycle-snapshot-restore.md` §3——恢复侧的会话记录边界标记。
- `coordination-primitive.md` §3b——MH-3 的跨主机 QUEUE 路由（本篇 §3b 单边 CLI 直连动词的双边 daemon 转发孪生）。
- `cli-reference.md` § Cross-host execution——逐动词的传输能力表、解析规则与 http 失败分类（MH-3 + MH-4）。
- 源码根：`packages/daemon/src/domain/{session-transport,transcript-store,history-query,ask-service,chat-repository}.ts`、`packages/daemon/src/routes/{transport,transcripts,ask,chat}.ts`、`packages/cli/src/mcp-server.ts`、`packages/cli/src/{remote-host-ops,cross-host-target,cross-host-executor}.ts`（v0.4.6 MH-4）。
