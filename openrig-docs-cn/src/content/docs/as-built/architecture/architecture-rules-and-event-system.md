---
kind: as-built
title: 架构不变量、事件系统与兼容性说明
status: active
topics: [runtime-control, observability, doctrine]
domains: [engineering-advisor, operating-advisor, review]
applies-when: |
  需要了解代码库强制执行的横切架构不变量（25 条架构规则 + 启动/导入约束）、
  RigEvent 联合类型的形状及其 SSE 交付呈现面，或仍描述已发布系统的有意
  兼容性限制时。
siblings: [daemon-core.md, coordination-primitive.md]
prerequisite-reads: [../README.md, daemon-core.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


本模块收录不属于任何单一子系统的横切不变量：代码库自我约束的架构规则、
事件系统的形状，以及有意的兼容性限制。

> 已对照 HEAD `7eaf524c`（`git describe` → `v0.3.1-6-g7eaf524c`）的源码核实；
> 三个包的包版本均为 **0.3.1**（slice-00 §1.1）。HEAD 上还有 6 个未发布的
> 0.3.2 工作提交；尚不存在 `v0.3.2` 标签。

## 1. 架构规则

这些是代码库构建时要保持的不变量（`architecture.md` §7）。规则 6（启动
分层）与规则 7（恢复策略收窄）属于规格/启动契约——流转细节见
`agent-spec-and-startup.md`；此处以系统级不变量的形式重述。

1. `domain/` 与 `adapters/` 中零 Hono。
2. 路由依赖 domain；domain 绝不依赖路由。
3. 共享 DB 句柄的不变量在构造时强制执行。
4. reboot 以引擎为先：domain 服务先落地，再做公共呈现面的重新接线。
5. 在 pod 感知模型中，runtime 以成员记录为准（member-authoritative）。
6. 启动分层是叠加且有序的：agent 基础层 → profile → rig 文化文件 →
   rig 启动 → pod 启动 → 成员启动 → 操作员调试追加。
7. 恢复策略收窄是单向的：`resume_if_possible` → `relaunch_fresh` →
   `checkpoint_only`。
8. base/import 冲突给出警告；含混的 import/import 未限定引用则高声失败。
9. bundle 组装与启动文件消解使用以所属工件为根的包含性检查。
10. 恢复回放使用不带分类的投影意图，而非过时的启动期 `no_op` / 冲突分类。
11. 启动状态是显式的会话状态：`pending`、`ready`、`failed`。
12. 会话新旧取决于单调 ULID：`session-registry.ts` 使用
    `monotonicFactory()`；恢复时按最大 ULID 选取最新会话。
13. 就绪检查是带指数退避与可配置超时的重试循环，使用适配器专属探测
    （Claude TUI 指示器、Codex 就绪消息、终端立即就绪）。
14. 恢复状态是锁定的：`resumed` / `rebuilt` / `fresh`。`rebuilt` =
    由工件拼装出的新进程。
15. 恢复的诚实性：恢复失败就高声报 FAILED。没有自动全新启动回退。
    全新启动只能是显式的后续动作。
16. 在 `up`、`down`、`restore`、`snapshot create` 之后必须交接：
    发生了什么 + 当前状态 + 下一步动作。
17. 会话命名：`{pod}-{member}@{rig}`——由人编写，由系统校验。
    不自动生成，不做 slug 化。
18. 通信：tmux 是传输，不是真相。`send/capture/broadcast` 在 tmux 之上
    可靠封装，出错时如实报错。
19. 会话记录：经 pipe-pane 原始捕获，读取时剥离 ANSI。优先 `rg`，
    回退 `grep -E`。
20. 配置优先级：CLI 旗标 > 环境变量 > 配置文件
    （`~/.openrig/config.json`，旧版回退 `~/.rigged/config.json`）> 默认值。
21. 半确定性校准：构建智能体持续使用的部分。边缘情况由智能体依据报错
    信息自行处理。
22. `rig ask` 是上下文工程：只收集证据，**不**调用外部 LLM。
    智能体本身就是 LLM。
23. 规格库的真相是磁盘上的 YAML；守护进程拥有结构化的审阅/索引/缓存层。
24. 被收养会话的对等性是 tmux 元数据对等性，不是虚假的环境变量对等性。
25. 人类可读 ID 仅是 UI 呈现辅助。CLI/API/MCP/后端保留完整规范 id。

### 启动动作约束

- 不允许 shell 启动动作。
- 动作类型仅限 `slash_command` 与 `send_text`。
- 非幂等动作不得在恢复时重复施加。
- 启动失败的重试按恢复处理。

### 远程导入约束

reboot 支持 `local:...` 与 `path:/abs/...` 的 agent 引用。远程
`agent_ref` 来源仍不受支持，会在预检阶段失败（`architecture.md` §7
“Remote import constraints”；兼容性说明 1 有重述）。

## 2. 事件系统

守护进程的事件呈现面是单一的 `RigEvent` 可辨识联合。

> 漂移修正 D8 / OPEN-4（原文照录，slice-00）：`architecture.md` §8 说
> “PL-004 Phase A adds 9 coordination events”，而 §3 又说
> “Existing 32 PL-004 events” / “Existing 20 PL-004 events”——PL-004 子
> 计数自相矛盾、存有争议。**不要沿用 9 / 32 / 20 这几个数字。**
> `architecture.md` §8 的 “Currently emitted in production code” /
> “Present in the union but not yet emitted” 两份清单也早于 0.3.x，
> 已过期。下文的联合形状是在 HEAD 从源码重新推导的，不是迁移过来的。

`RigEvent` 声明于 `packages/daemon/src/domain/types.ts:94`
（`export type RigEvent =`），一直延续到 `types.ts:218`。它有
**73 个联合成员**（slice-00 §1.8，已在 HEAD 重新确认：对 L94–218 执行
`grep -cE '^\s*\| \{ type:'` = 73）。73 个已声明的 `type:` 字面量每一个
都在 `packages/daemon/src/{domain,routes}` 的某处被构造（已在 HEAD 重新
验证：domain+routes 中 `type: "<x>"` 字面量的集合与 73 个联合成员完全
相等——不存在只在联合里却从未被引用的类型）。

### 按前缀划分的事件族（已在 HEAD 以 grep 核实）

下表每个计数都是对联合主体（`types.ts:94–218`）全新执行的、以一手源码
grep 核实并明确标注的按前缀族计数——不是那个存有争议的 PL-004 子计数
（OPEN-4 裁定：标注为 grep 核实的族计数才是基准真相；`9`/`32`/`20`
这几个数字禁止使用）。

| 前缀 | 成员数 | 示例 / 角色 |
|---|---|---|
| `node.*` | 7 | `node.added`（`types.ts:97`）……`node.startup_failed`（`:139`）——生命周期/启动 |
| `workflow.*` | 6 | PL-004 Phase D 工作流运行时（详见 `workflow-runtime.md`） |
| `watchdog.*` | 5 | `watchdog.evaluation_fired`（`:187`）……`watchdog.job_stopped`（`:191`）——PL-004 Phase C |
| `rig.*` | 5 | `rig.created` / `rig.deleted` / `rig.imported` / `rig.stopped` / `rig.expanded`（`:151`） |
| `queue.*` | 5 | PL-004 Phase A 队列生命周期（`:156`–`:159`、`:169`；详见 `coordination-primitive.md`） |
| `package.*` | 5 | 旧版 package/install 引擎事件 |
| `mission_control.*` | 5 | PL-005 审计/通知（`:212`–`:218`；详见 `mission-control.md`） |
| `bootstrap.*` | 5 | 旧版 bootstrap 运行事件 |
| `session.*` | 4 | 会话发现/状态/分离/消失 |
| `classifier.*` | 4 | PL-004 Phase B 分类器租约生命周期 |
| `restore.*` | 3 | 恢复的 start/complete/reconcile（详见 `lifecycle-snapshot-restore.md`） |
| `qitem.*` | 2 | `qitem.fallback_routed`（`:160`）、`qitem.closure_overdue`（`:161`） |
| `pod.*` | 2 | `pod.created`（`:135`）、`pod.deleted`（`:136`） |
| `inbox.*` | 2 | `inbox.absorbed`（`:162`）、`inbox.denied`（`:163`） |
| `continuity.*` | 2 | `continuity.sync`（`:140`）、`continuity.degraded`（`:141`） |
| 单例 | 11 | 各一个成员：`workflow_spec.*`、`view.*`、`stream.*`（`:155`）、`snapshot.*`、`seat.*`、`project.*`、`kernel.*`、`chat.*`（`:149`）、`bundle.*`、`binding.*`、`agent.*` |

各族计数合计 73（15 个多成员族共 62 个 + 11 个单例），已在 HEAD 重新
确认。

### 发射与交付

事件由各 domain 服务（`stream-store.ts`、`workflow-runtime.ts`、
`restore-orchestrator.ts`、`node-launcher.ts` 等）与路由处理器经
`eventBus.emit({ type: ... })` 构造并发射。事件日志只追加、由 SQLite
支撑。

三个 SSE 交付呈现面（已在 HEAD 重新确认）：

- `GET /api/events`——全部事件的全局流（`server.ts:457`
  `app.route("/api/events", eventsRoute)`）。
- `GET /api/stream/watch`——新的流条目（`routes/stream.ts:117`）。
- `GET /api/queue/watch`——队列/收件箱协作事件（`routes/queue.ts:357`）。
- 聊天 SSE 流 `GET /api/rigs/:rigId/chat/watch` 为单个 rig 交付
  `chat.message`（rig 范围限定；见兼容性说明 6）。

> OPEN-4（原文照录，slice-00）：此处不断言精确的仅 PL-004 与仅 PL-005
> 子划分。`architecture.md` 的 `32`/`20`/`9` 三个数字自相矛盾，若不引入
> slice 对全部 73 个成员逐一分类就无法对账——予以标注，而非抹平。
> 上述 grep 核实的按前缀族计数是替代性的基准真相。

## 3. 其余兼容性说明

仍描述已发布系统的有意限制（`architecture.md` §11），已在 HEAD 核实为
仍然有效：

1. 远程 `agent_ref` 导入仍不受支持（见 §1 远程导入约束）。
2. 启动动作仍被有意限定（`slash_command`、`send_text`）。
3. 面向 reboot 前数据与 v1 工件的旧版兼容接缝仍然随版本发布。
4. `rig ask` 只收集上下文——不调用外部 LLM（规则 22）。
5. 会话记录搜索优先 `rg`，回退 `grep -E`；质量/性能因后端而异。
6. 聊天仅限单个 rig 范围——没有跨 rig 频道或私信。
7. `rig send` 的 `--verify` 检查 pane 内容以确认消息可见，但预先存在的
   匹配内容可能造成误报。已知限制。
8. 终端节点的就绪仅指 shell 就绪——没有服务健康探测。
9. `rig env down --volumes` 已存在于 CLI 呈现面，但守护进程侧的显式覆写
   尚未完全贯通。
10. 托管应用服务呈现面仅作描述之用——除编写好的启动/上下文文件外，
    OpenRig 不会把服务 URL/令牌自动注入智能体提示词。
11. 专家（智能体）委派是约定俗成的，不是自动的——通过会话名或常规通信
    呈现面进行寻址。

## 4. 交叉引用

`architecture.md` §12 自称架构层的真相来源，并指向 `codemap.md` 查看
逐文件结构。在模块化的架构实录（as-built）之下，这一角色被分摊：本模块
负责不变量 + 事件形状；真相来源指针则是重写后的 `../codemap.md`
导航索引。

## 另见

- `daemon-core.md`——接线、DB、迁移、启动；足迹漂移修正。
- `coordination-primitive.md`——PL-004 Phase A 的队列/流/收件箱/发件箱
  事件。
- `workflow-runtime.md`——PL-004 Phase D 的 `workflow.*` 事件。
- `mission-control.md`——PL-005 的 `mission_control.*` 事件。
- Source roots: `packages/daemon/src/domain/types.ts`（RigEvent union）,
  `packages/daemon/src/routes/{stream,queue}.ts`（SSE watch）,
  `packages/daemon/src/server.ts`（`/api/events`）.
