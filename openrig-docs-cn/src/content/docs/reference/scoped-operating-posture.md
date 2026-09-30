---
title: "范围化运行姿态"
---

人主导（human-led）的工作在纯过程诊断上默认保持安静。委托（delegated）的工作在规划阶段与实施阶段都可以接受监督。这一偏好不授予执行权威，也不改变权限、工作阶段、工作流提醒、上下文/连续性健康或健康策略。

## 检视与选择

使用现有的 `rig mode` 呈现面。给出确切的 rig 或已成文的工作 scope：

```sh
rig mode effective --rig my-rig --json
rig mode effective --project my-project --mission release-1 --json
rig mode effective --qitem my-packet --json
rig mode set delegated --scope mission --qualifier my-project/release-1 --evidence "Operator delegated this outcome"
# 上面的提议不会写入，并以退出码 2 结束。应用这一经过深思的选择：
rig mode set delegated --scope mission --qualifier my-project/release-1 --evidence "Operator delegated this outcome" --confirm
rig mode set human-led --scope mission --qualifier my-project/release-1 --evidence "Return to interactive planning" --confirm
rig mode unset mission my-project/release-1
```

解除设置会显露出下一个适用的显式选择，或者可见的人主导产品默认值。一个新建且已解析、没有绑定的 rig 会报告 `human-led`、`source: product-default` 与 `binding: null`。scope 身份缺失、关联冲突、存储不可用或成文上下文格式错误，则报告带原因的 `unknown`。不带 scope 调用 `effective` 不会隐式选中某个 rig。现有的操作员 bearer 要求仍然适用。`set` 需要 `--confirm`；`unset` 是显式的删除命令，立即生效。

## 单一 scope 与阶段契约

`GET /api/rig-mode/effective` 接受 `rig`、`project`、`mission`、`workstream` 与 `qitem`。其增量式的 `operatingPosture` 对象同时附加在健康记录与诊断发现上。CLI 解释与 TUI 健康详情展示同一份数据。姿态、阶段与健康的消费方应当使用这个对象，而不是另造一个偏好存储，或从工作流是否存在、是否活跃来推断委托状态。

| 字段 | 含义 |
| --- | --- |
| `posture` | `human-led`、`delegated` 或 `unknown` |
| `source` | `product-default`、`binding` 或 `unknown` |
| `context` | 解析出的 rig/project/mission/workstream/qitem ID、来源地址、规范成文路径与阶段；scope 解析失败时为 null |
| `context.phase` | 来自显式工作流 packet 步骤的 `{value, source}`，否则取切片阶段/状态，再否则取任务（mission）发布阶段/状态；不可用时字段为 null |
| `binding` | 胜出的绑定 ID、scope、时间戳与证据引注；默认/未知时为 null |
| `reason` | 对结果的解释，或对缺失/冲突事实的说明 |
| `grantsAuthority` | 恒为 `false` |
| `members` | 对队列支撑的发现，逐一给出各成员的 qitem、姿态、来源与绑定 ID；成员姿态不一致或未知时，聚合姿态为 unknown |

现有的 SQLite 模式绑定表仍是唯一的偏好存储。匹配姿态绑定时按此顺序解析：qitem、workstream、mission、project、rig、全局宿主。限定符依次是 qitem ID、`project/mission/slice-id`、`project/mission`、项目 ID、规范 rig ID 与 null。rig 名称会解析为 ID。workstream 是一个已成文的既有切片，按其目录或 SPEC ID 查找；返回的身份使用其 SPEC ID，并带 project/mission 限定。

项目选择读取 `workspace.yaml` 中声明的 `projects: [{id, root}]` 目录清单；若不存在清单，则读取工作区自己的 `project.yaml`。存在多个项目时必须显式选择项目；仅有一个项目时可以推导得出。项目清单（manifest）负责校验身份并提供 `missions.root`（默认 `missions`）。mission 与切片身份来自那些已成文的工作节点；身份缺失、重复或冲突则保持未知。所选工作必须位于其规范项目根之内。

读取 qitem 时会联接显式的 `project:`、`mission:`、`slice:`/`workstream:` 标签、目的地 rig，以及既有的工作流 packet 绑定。工作流生命周期的 project/mission 身份必须与标签及所请求的 scope 一致。所绑定 packet 的确切步骤就是阶段来源；阶段名称不做臆测分类。未关联的 qitem 不会静默继承默认值。scope 读取是纯观察性的。

旧有的人体工学模式（`sleep`、`desk`、`mobile`、`away`、`focus`、`debug`）保留其绑定与十字段记录。它们不暗示任何一种运行姿态。只有人主导/委托绑定参与姿态优先级。旧有的 `effective` 与 `posture: known|unknown_posture` 字段为兼容而保留；其中 `unknown_posture` 表示没有旧模式绑定，且不会覆盖新的 `operatingPosture.source: product-default` 结果。在同一 scope 设置另一个模式会替换那一行；任何模式变更之后都应查看生效姿态。

## 对诊断的影响

过程类发现在人主导或未知姿态下仍然可见，但新的诊断呈现、再次呈现与人工通知要求显式的委托姿态。姿态变化时，已保留的发生记录不会被取消或改写。其当前发现会被刷新以供检查与通知；当前发现不可用时，不能沿用旧的委托姿态。通知准入在就绪 I/O 之后重新核查。

过程中断需要委托，但委托本身并不充分：已启用的诊断策略、探测器选择、来源新鲜度、保管、冷却期、复发上限与人工投递就绪状态仍然适用。其他健康类别与普通的队列/工作流提醒保持既有行为。自动仪式来源通过同一个解析器读取已声明的目录清单项目；未解析的谱系保持可见且 scope 未知，而不会获得凭空捏造的权威。

策略、证据与处置见[健康诊断](/reference/health-diagnosis/)。
