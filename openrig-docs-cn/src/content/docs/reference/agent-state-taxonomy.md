---
title: "智能体状态分类体系"
---

所有 OpenRig 呈现面据以渲染的形式化状态语言——TUI、`rig ps`、节点清单，以及未来的任何消费者。一个 oracle 负责计算；各呈现面负责渲染；没有任何呈现面保留私有词汇。

**本文档是已交付分类体系的权威文本**，并补充了工程层面的对齐；它绝不派生出第二套词汇。其类型化的事实来源是 `packages/daemon/src/domain/activity-taxonomy.ts`。

## 三个正交轴

| 轴 | 取值 | 回答的问题 |
|---|---|---|
| 会话（session） | `present` · `detached` · `exited` · `absent` | 进程是否存在 |
| 活动（activity） | `working` · `idle-at-prompt` · `unknown`（needs-input 以计数 + 原因附带，见下文） | 在场的智能体正在做什么 |
| 可恢复性（resumability） | `live` · `resumable` · `context-walled` | 不在场的智能体能以什么状态回归 |

各轴绝不混用。可达性判定是严格的；对复活的乐观预期则是另一个字段（omnigent 的 strict-liveness 拆分）。`unknown` 是一等公民式的诚实取值——是 oracle 在声明自己无从判断。诚实的未知胜过自信的错误答案。

### needs-input 是计数 + 原因，绝非状态取值

阻塞在输入（blocked-on-input）以 `{ count, reason }` 的形式随行——即未决提示的数量，外加一句简短短语说明为何毫无进展（"permission prompt"、"usage limit"、"classifier hold"——提供商界面元素与用量限制明确属于轴内：它们是生产环境中观察到的搁置的第二大成因）。面向人的呈现面可以经由唯一的桥接点 `deriveDisplayActivity` 来*显示* "needs-input"（人类可读的四值列表）：只要 `count > 0`，它就渲染出 needs-input；任何存储或流转都不会把它当作状态持有。注意/告警类取值同样留在各自的机制里（`attentionCount`）。herdr 与 omnigent 在这条排除上不约而同，两个代码库里都留有针对该冲突的警告注释。

## 派生诊断——读取时计算，从不存储

- **PARKED**——病症：`(activity = idle-at-prompt OR needs-input pending) × (open obligations exist)`。一根掉落的接力棒，或一次无人应答的阻塞。可在 rig 级与席位级查询；这步连接运算只存在于 parked 查询呈现面中，绝不放进 oracle（oracle 的非推断契约：它从不读取队列状态）。
- **HELD**——有意为之的对应物：一次队列级挂起（hold），带有具名负责人和已布防的唤醒（`rig view show held`）。有意停下叫 HELD；意外停下叫 PARKED。HELD 行**并非** parked。
- **DONE-UNSEEN**——已完成却无人查看的工作（herdr 将其推导为 idle ∧ unseen）。在此声明，并在读取时从认领/流转记录计算得出，处于活动 oracle 之外，从而保全其非推断边界。

## 与既有实现的对齐

| 本方案 | herdr（`src/detect/mod.rs:11`） | omnigent（`schemas.py:2767`） |
|---|---|---|
| `working` | `Working` | `running` |
| `idle-at-prompt` | `Idle` | `idle` |
| needs-input 计数 + 原因 | `Blocked` + `visible_blocker` 覆盖 | `pending_elicitations_count` + `blocked_on` 短语——**不是**状态 |
| `unknown` | `Unknown`（"普通 shell 或未识别的程序"） | — |
| 派生的 DONE-UNSEEN | 派生的 `Done` = idle ∧ unseen（`src/ui/sidebar.rs:186`） | — |
| 会话轴 | 服务器持有 PTY（在场与否直接可知） | `runner_online` × `host_online` × `host_resumable` |
| —（已否决） | — | `waiting`（回合因异步排空而搁置——与 Claude 对话框的 `waiting` 冲突；两个代码库都留有警告注释） |

## 证据阶梯（梯级清单与退役条件）

状态由唯一一个仲裁点（`SeatActivityService`）依据分级、带时限的证据计算得出。下面自顶向下列出各梯级，并给出每个梯级的退役条件：

- **r3——Claude `sessions/<pid>.json` 自报**（busy/shell/idle/waiting，自 v2.1.139 起）：现行有效，对 working/idle 的判定排在钩子之上。属未公开文档的内部机制——读不出来就沿阶梯下落，绝不报错。
- **r2——生命周期钩子**（Claude 的 Stop/StopFailure；Codex 的 UserPromptSubmit/Stop/PermissionRequest）：现行有效。恰好一次的回合边界；SubagentStop 已被过滤（它可能在回合结束后才触发，绝不能借此复活空闲席位）。钩子梯级的权威是**带时限的**：钩子梯级是唯一不给证据自标时间戳的梯级，因此持续的跨梯级矛盾会让它降级为仅身份（identity-only）信任，这一降级公开可见，并伴随一次 rung-health 事件。
- **r4——可见的 needs-input 界面元素**：现行有效；仅对 needs-input 信号而言排在自报之上（你看得见的对话框，胜过一句曾报告 working 的钩子）。
- **r1——窗口活动采样**（今天的 oracle）：兜底层。按运行框架逐个退役：只有当该运行框架的钩子梯级在生产环境中经过一段实测吻合窗口而赢得信任时才会退役——绝不仅凭夹具通过就退役（对称准入：夹具通过让梯级进入 TRIAL；生产吻合使其转正；转正之前仅身份信任）。

部分覆盖的诚实：生命周期覆盖不全的证据来源只能得到仅身份信任。这座阶梯同时也是迁移路径——新 oracle 插入在既有启发式之上，低梯级一次发布退役一个，消费者永远不会遭遇一刀切的切换日（flag day）。

以席位为键：状态挂在持久的席位 nodeId 上，绝不挂在占用者身上。交接或代际更替本身就是一个可见事件——绝不是一次活动流转——并会触发梯级清单的重新声明：继任者绝不继承前任的梯级权威（钩子写在占用者的配置里，而 pane 是按席位持久的）。

## 已否决的 oracle——带日期的凭据（2026-08-26），免得有人再付出高昂代价重新推导一遍

- **会话记录静默（transcript-quiescence）作为活动 oracle：已否决**。omnigent 的 1 秒版本会在回合中段的空档上反复震荡，并幂等地把真正的完成挡在门外；幸存的 5 秒变体被注释标明为等待钩子接替的权宜之计。有一条区分依然成立：会话记录增长作为重新聚焦（refocus）钩子的节奏触发器仍属可行——目的不同，而且是唯一获准的消费者。
- **把 pane 抓取当作首要事实：已否决**。herdr——其 TOML 屏幕清单代表了这条路径的最高水准——凡钩子能覆盖生命周期之处，都让屏幕清单从属于钩子，并把查看器屏幕标记为 `skip_state_update`，因为回滚缓冲区会撒谎。读取 pane 只停留在兜底层。
