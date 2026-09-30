---
title: "Edge Types 参考"
---

版本：0.2.0
最后对照代码验证：2026-04-11
事实来源：`packages/daemon/src/domain/rigspec-schema.ts`、`packages/daemon/src/domain/rigspec-instantiator.ts`

---

## 概览

边（edge）定义 rig 拓扑中成员之间的关系。它们出现在两个位置：

- **工作舱内边**——同一工作舱内成员之间的边（使用不带限定的成员 ID）
- **跨工作舱边**——不同工作舱成员之间的边（使用 `pod.member` 格式）

YAML 语法见 `docs/reference/rig-spec.md`。

## 边类型（Edge Kinds）

校验器接受五种边类型：

| 类型 | 是否接受 | 有运行时行为 | 说明 |
|------|----------|---------------------|-------------|
| `delegates_to` | 是 | **是——影响启动顺序** | 源把工作委派给目标 |
| `spawned_by` | 是 | **是——影响启动顺序** | 目标由源派生 |
| `can_observe` | 是 | 否 | 源可以观察目标的输出 |
| `collaborates_with` | 是 | 否 | 对等协作 |
| `escalates_to` | 是 | 否 | 源向目标上报 |

## 边在今天实际做的事（OpenRig 0.1.x）

### 启动顺序

只有 `delegates_to` 与 `spawned_by` 影响运行时行为。它们约束节点的启动顺序：

- **`delegates_to`**：源在目标**之前**启动。委派者必须先于被委派者就绪。
- **`spawned_by`**：目标（父）在源（子）**之前**启动。父节点必须先于它派生的子节点就绪。

该顺序在 `PodRigInstantiator`（初始启动）与 `RestoreOrchestrator`（从快照恢复）中都得到强制。代码对依赖图做拓扑排序——如果存在环，实例化会失败。

其余边类型（`can_observe`、`collaborates_with`、`escalates_to`）**不**约束启动顺序。

### 图可视化

所有边都会渲染在 UI 拓扑图中。它们在节点之间建立视觉连接，帮助操作者理解团队结构。工作舱内边显示在工作舱分组内部；跨工作舱边跨组连接。

### 身份投影

所有边都会出现在 `rig whoami --json` 输出的 `edges.outgoing` 与 `edges.incoming` 之下，带有边的类型和所连对端的身份。这让智能体知道自己与其他成员的关系——但这些信息由智能体自行解读，运行时并不强制。

### 接入提示启发式

命令后的交接（`rig up` 与 `rig restore` 之后出现的"Attach:"一行）会利用边来优先选择编排者作为默认接入目标。该启发式规则会寻找第一个带 `delegates_to` 出边的节点。

## 边在今天不做的事

边目前**不**做以下事情：

- **路由消息**——`rig send` 可以定位任何会话，与边无关
- **强制委派**——智能体可以与任何对端通信，而不仅是它的边目标
- **控制权限**——不存在基于边的访问控制
- **影响传输**——`rig capture`、`rig broadcast` 等基于会话身份工作，与边拓扑无关

这些都是愿景中的能力。边词汇表刻意比当前运行时行为更丰富，这样拓扑就能在运行时强制执行之前，先把设计意图记录下来。

## 设计意图（为什么有五种类型）

这五种类型是对工作团队中智能体相互关系的一种分类：

**`delegates_to`**——最常见的边。编排者把工作委派给实现者，主导智能体把工作委派给执行者。这是主要的工作流方向。编排者派发任务时，会用 `rig send` 发给它 `delegates_to` 的那个会话。

**`spawned_by`**——用于层级化的启动关系。子智能体由父进程派生。在当前拓扑中较少见。

**`can_observe`**——审阅/监督关系。审阅者观察实现者的工作。审阅者可以对实现会话执行 `rig capture` 与 `rig transcript`。这条边传达的是意图："我在看着你的输出。"

**`collaborates_with`**——对等关系。两个智能体在同一层级并肩工作，互不委派。

**`escalates_to`**——委派的反向。执行者遇到自己做不了的决定时，向主导智能体上报。这在当前拓扑中较少见，但代表一种真实的协调模式。

## 选择边类型

### 常见模式

**编排者 → 执行者们**：

```yaml
edges:
  - kind: delegates_to
    from: orch.lead
    to: dev.impl
```

**审阅者 → 实现者**：

```yaml
edges:
  - kind: can_observe
    from: rev.r1
    to: dev.impl
```

**实现搭档**：

```yaml
edges:
  - kind: delegates_to
    from: impl
    to: qa
```

### 拿不准的时候

如果拿不准该用哪种边类型：

1. 一个智能体把工作交给另一个？→ `delegates_to`
2. 一个智能体观察另一个的输出？→ `can_observe`
3. 它们是平等协作的？→ `collaborates_with`
4. 一个向上汇报问题？→ `escalates_to`
5. 一个创建了另一个？→ `spawned_by`

如果都不合适，`can_observe` 是最安全的默认选择——它记录了这层关系，既不隐含工作流方向，也不影响启动顺序。

## 校验规则

1. 边类型必须是 `delegates_to`、`spawned_by`、`can_observe`、`collaborates_with`、`escalates_to` 之一
2. 工作舱内边使用不带限定的成员 ID——`from` 与 `to` 必须存在于同一工作舱
3. 跨工作舱边使用 `pod.member` 格式——两个端点都必须能解析到实际成员
4. 跨工作舱边必须引用不同的工作舱（同一工作舱内的边应使用工作舱内语法）
5. 自环边在 schema 层面不做校验，但也没有意义
