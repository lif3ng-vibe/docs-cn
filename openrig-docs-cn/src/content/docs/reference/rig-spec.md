---
title: "RigSpec 参考"
---

版本：0.2（支持工作舱）
最后对照代码验证：2026-04-11
事实来源：`packages/daemon/src/domain/rigspec-schema.ts`、`packages/daemon/src/domain/types.ts`

本文是支持工作舱（pod-aware）的 RigSpec YAML 格式的权威参考。这里记录的每一个字段、每一条校验规则和每一个默认值，都追溯自实际的解析器与校验器代码，而非沿用既有文档。

---

## 最小有效示例

```yaml
version: "0.2"
name: my-rig

pods:
  - id: dev
    label: Development
    members:
      - id: impl
        agent_ref: "local:agents/impl"
        profile: default
        runtime: claude-code
        cwd: "."
    edges: []

edges: []
```

## 完整示例（全部特性）

```yaml
version: "0.2"
name: my-product-team
summary: A full product squad with orchestration, development, and review pods.

culture_file: culture/CULTURE.md

docs:
  - path: SETUP.md
  - path: README.md

startup:
  files:
    - path: guidance/team-norms.md
      delivery_hint: guidance_merge
      required: true
  actions: []

services:
  kind: compose
  compose_file: docker-compose.yaml
  project_name: my-product
  profiles: [core]
  down_policy: down
  wait_for:
    - url: http://127.0.0.1:5432/health
    - service: redis
      condition: healthy
  surfaces:
    urls:
      - name: App
        url: http://127.0.0.1:3000
    commands:
      - name: psql
        command: "psql postgresql://app:dev@127.0.0.1:5432/app"
  checkpoints:
    - id: postgres
      export: "docker compose exec -T postgres pg_dump -U app > {{artifacts_dir}}/postgres.sql"
      import: "cat {{artifacts_dir}}/postgres.sql | docker compose exec -T postgres psql -U app"

pods:
  - id: orch
    label: Orchestration
    members:
      - id: lead
        agent_ref: "local:agents/orchestrator"
        profile: default
        runtime: claude-code
        cwd: "."
      - id: peer
        agent_ref: "local:agents/orchestrator"
        profile: default
        runtime: codex
        cwd: "."
    edges: []

  - id: dev
    label: Development
    summary: Implementation and quality assurance pair.
    continuity_policy:
      enabled: true
      sync_triggers: [pre_compaction, pre_shutdown]
      artifacts:
        session_log: true
        restore_brief: true
      restore_protocol:
        peer_driven: true
        verify_via_quiz: false
    startup:
      files:
        - path: guidance/dev-sop.md
          delivery_hint: guidance_merge
          required: true
      actions: []
    members:
      - id: impl
        agent_ref: "local:agents/impl"
        profile: default
        runtime: claude-code
        cwd: "."
        label: "Implementation Lead"
        model: claude-opus-4-6
        restore_policy: resume_if_possible
        startup:
          files:
            - path: guidance/impl-specific.md
              delivery_hint: send_text
              required: false
              applies_on: [fresh_start]
          actions:
            - type: send_text
              value: "Load the implementation-pair skill and begin."
              phase: after_ready
              idempotent: true
      - id: qa
        agent_ref: "local:agents/qa"
        profile: default
        runtime: codex
        cwd: "."
    edges:
      - kind: delegates_to
        from: impl
        to: qa

  - id: rev
    label: Review
    members:
      - id: r1
        agent_ref: "local:agents/reviewer"
        profile: default
        runtime: claude-code
        cwd: "."
      - id: r2
        agent_ref: "local:agents/reviewer"
        profile: default
        runtime: codex
        cwd: "."
    edges: []

edges:
  - kind: delegates_to
    from: orch.lead
    to: dev.impl
  - kind: delegates_to
    from: orch.peer
    to: dev.qa
  - kind: can_observe
    from: rev.r1
    to: dev.impl
  - kind: can_observe
    from: rev.r2
    to: dev.qa
```

---

## 顶层字段

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|----------|---------|-------------|
| `version` | string | 是 | — | 支持工作舱的规格必须为 `"0.2"`。 |
| `name` | string | 是 | — | rig 名称。用于会话命名（`{pod}-{member}@{name}`）、快照识别与规格库查找。 |
| `summary` | string | 否 | — | 人类可读的描述。展示在规格库、审阅呈现面与 `rig specs show` 中。 |
| `culture_file` | string | 否 | — | rig 级文化/章程文件的相对路径。必须是安全相对路径（不允许 `..`，不允许绝对路径）。 |
| `permission_policy` | string | 否 | — | 挂接到 rig 的权限策略。可以是内置策略（`builtin:locked`、`builtin:standard`、`builtin:open`、`builtin:yolo`），也可以是自定义策略文件的安全相对路径（相对于本规格所在目录解析；不允许 `..`，不允许绝对路径）。缺省时保留默认下限。成员可以设置自己的 `permission_policy`，其优先级高于 rig 级设置。见下文"挂接权限策略"。 |
| `managed_blocks` | map | 否 | `CLAUDE.md` | 接收 OpenRig 为 Claude Code 成员写入的托管指令块的文件。只接受 `claude-code` 这个键，取值为 `CLAUDE.md` 或 `CLAUDE.local.md`。Codex 成员始终使用 `AGENTS.md`。见下文"选择 Claude 指令文件"。 |
| `docs` | Doc[] | 否 | — | 应随 rig 一起携带的文档文件。会包含进 rig bundle。每个条目有一个 `path` 字段（安全相对路径）。引擎不会消费这些文件——它们是给人和智能体在启动前搭建环境用的。 |
| `startup` | StartupBlock | 否 | — | rig 级启动文件与动作。通过启动分层模型应用于所有成员。 |
| `services` | ServicesBlock | 否 | — | 可选的托管服务（Docker Compose）。存在时，服务会在任何智能体启动之前先行启动。 |
| `pods` | Pod[] | 是 | — | 至少需要一个工作舱（pod）。每个工作舱是一个有界上下文，包含成员与工作舱内边。 |
| `edges` | CrossPodEdge[] | 否 | `[]` | 连接不同工作舱成员的跨工作舱边。必须使用全限定的 `pod.member` ID。 |

### 挂接权限策略

用 `permission_policy` 把策略挂接到 rig 上，可以放在 rig 级，也可以放在某个成员上：

```yaml
# a built-in, by name:
permission_policy: builtin:standard

# or a custom policy file, by relative path (resolved from this spec's directory):
permission_policy: policies/my-cautious-dev.policy.md
```

内置策略（`locked` / `standard` / `open` / `yolo`）是只读的，以 `builtin:<name>` 形式引用。自定义策略放在你自己的项目里，以安全相对路径引用（不允许 `..`，不允许绝对路径）。仓库附带了一个自定义形态的示例 `packages/daemon/policies/examples/my-cautious-dev.policy.md`——把它复制进你的项目，随意修改。

这里记录的只是选择，不是即时的权限变更。标志面（flag-surface）策略选择启动标志；配置面（config-surface）策略仍需要应用原生配置并加以检查。特别是，`builtin:yolo` 会选择 Codex 的 `danger-full-access` 沙箱与 `never` 审批策略，并替换任何 `codex_config_profile` 参数。见[实用权限选择](/reference/getting-started/#选择性加入的宽松运行)。

显式的 `rig seat set-permissions` 选择会覆盖成员/rig 策略，作用于该稳定席位的后续托管启动；它不会改写本规格，也不会改写其继承的策略来源。`inherit` 会移除该覆盖。见[按席位权限模式](/reference/getting-started/#逐席位权限模式)。

### 选择 Claude 指令文件

OpenRig 把它给 Claude Code 成员的指令写入成员工作目录中的托管块。默认文件是 `CLAUDE.md`。如果你的仓库跟踪了 `CLAUDE.md`，就改为把块写入 `CLAUDE.local.md`：

```yaml
managed_blocks:
  claude-code: CLAUDE.local.md
```

Claude Code 也会从工作目录加载 `CLAUDE.local.md`。按照惯例，这个文件不进 git，例如加一条 `.gitignore` 条目。

- 可接受的取值是 `CLAUDE.md` 与 `CLAUDE.local.md`。任何其他取值或运行时键都会在成员启动之前被拒绝。
- 该设置作用于启动、恢复、重新启动、交接、添加成员与导出。`rig down` 只从所选文件中移除 OpenRig 的块。
- OpenRig 绝不会编辑、移动或删除另一个文件中的块。

已经把块写入 `CLAUDE.md` 的 rig，在你切换之后块仍留在原处。在你移除它们之前，`CLAUDE.md` 会保持被修改状态，而 Claude Code 会加载两份内容。请手动删除每一处 `<!-- BEGIN OpenRig MANAGED BLOCK: … -->` … `<!-- END OpenRig MANAGED BLOCK: … -->` 段落，保留文件的其余部分。如果 `CLAUDE.md` 没有其他你需要保留的未提交修改，也可以改为运行 `git restore CLAUDE.md`；该命令会丢弃文件中所有未暂存的修改，而不只是 OpenRig 的块。对一个仍在使用默认值的 rig 运行 `rig down` 不能替代上述操作：它会把该目录 `CLAUDE.md` 中的每一个 OpenRig 块都剥除，包括其他 rig 写入的块。

---

## Pod（工作舱）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|----------|---------|-------------|
| `id` | string | 是 | — | 工作舱标识符。不得包含点号。必须在 rig 内唯一。用作会话名与逻辑 ID 的第一段。 |
| `label` | string | 是 | — | 人类可读的工作舱名称。展示在 UI 浏览器、图分组与详情呈现面中。 |
| `summary` | string | 否 | — | 工作舱描述。 |
| `continuity_policy` | ContinuityPolicy | 否 | — | 工作舱级的连续性/恢复策略。控制压缩恢复、工件管理与由队友驱动的恢复。 |
| `startup` | StartupBlock | 否 | — | 工作舱级的启动文件与动作。通过启动分层模型应用于本工作舱的所有成员。 |
| `members` | Member[] | 是 | — | 至少需要一个成员（由"工作舱必须有内容"这一规则强制）。 |
| `edges` | PodLocalEdge[] | 否 | `[]` | 本工作舱内成员之间的边。必须使用不带限定的成员 ID（而不是 `pod.member`）。 |

### Pod ID 规则

- 不得包含点号（`.`）
- 在 rig 的所有工作舱之间必须唯一
- 成为带限定逻辑 ID 的第一段：`{podId}.{memberId}`
- 成为规范会话名的第一段：`{podId}-{memberId}@{rigName}`

---

## Member（成员）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|----------|---------|-------------|
| `id` | string | 是 | — | 成员标识符。不得包含点号。必须在工作舱内唯一。 |
| `agent_ref` | string | 是 | — | 对某个 AgentSpec 的引用。必须以 `local:`（相对路径）或 `path:`（绝对路径）开头。例外：基础设施节点使用 `builtin:terminal`。 |
| `profile` | string | 是 | — | 被引用 AgentSpec 中的 profile 名称。默认 profile 使用 `default`。例外：终端节点使用 `none`。 |
| `codex_config_profile` | string | 否 | — | 仅限 Codex 的原生 profile，以 `-p <name>` 传递；可用字符为字母、数字、`_`、`.`、`-`。与 AgentSpec 的 `profile` 相互独立。在正常启动模式下，它会取代 OpenRig 显式的 workspace-write 沙箱标志；完全旁路策略则会改为发出 danger-full-access 并省略该 profile 参数。 |
| `runtime` | string | 是 | — | 智能体运行时。当前支持的取值：`claude-code`、`codex`、`terminal`。 |
| `cwd` | string | 是 | — | 智能体的工作目录。相对于 rig 根目录（即 rig spec 所在目录）解析。rig 根目录本身用 `"."` 表示。启动时可用 `rig up --cwd` 覆盖。 |
| `label` | string | 否 | — | 人类可读的成员名称。存在时展示在 UI 中。 |
| `model` | string | 否 | — | 模型覆盖。随运行时而异（例如 Claude Code 用 `claude-opus-4-6`）。 |
| `restore_policy` | string | 否 | `resume_if_possible` | 恢复行为。取值为 `resume_if_possible`、`relaunch_fresh`、`checkpoint_only` 之一。 |
| `startup` | StartupBlock | 否 | — | 成员级的启动文件与动作。仅应用于该成员。 |

### 终端节点（Terminal Nodes）

终端节点不是智能体运行时，而是基础设施进程（服务器、日志跟踪、构建监视器）。它们要求一个精确的三元组：

```yaml
runtime: terminal
agent_ref: "builtin:terminal"
profile: none
```

三者必须同时出现。任何部分组合都是校验错误。

### `agent_ref` 规则

- 必须以 `local:` 或 `path:` 开头
- `local:` 路径相对于 rig spec 文件所在目录（rig 根目录）
- `path:` 路径是绝对文件系统路径
- 被引用的路径中必须含有 `agent.yaml` 文件
- 例外：终端节点使用 `builtin:terminal`

### 会话命名

规范会话名由工作舱 ID、成员 ID 与 rig 名称派生：

```
{podId}-{memberId}@{rigName}
```

示例：工作舱 `dev`、成员 `impl`、rig `my-team` → 会话 `dev-impl@my-team`

它由人命名（工作舱/成员 ID 由你选择），由系统校验（系统强制该格式）。

---

## 边（Edges）

### 边类型（Edge Kinds）

| 类型 | 含义 | 适用场景 |
|------|---------|----------|
| `delegates_to` | 源把工作委派给目标。约束启动顺序。 | 编排者 → 实现者，主导 → 执行者 |
| `spawned_by` | 目标由源派生。约束启动顺序。 | 层级拓扑中的父 → 子 |
| `can_observe` | 源可以观察目标的输出。不约束启动顺序。 | 审阅者 → 实现者，监视者 → 执行者 |
| `collaborates_with` | 对等协作关系。不约束启动顺序。 | 平等协作的队友之间 |
| `escalates_to` | 源就决策向目标上报。不约束启动顺序。 | 执行者 → 主导，用于上报 |

### Pod 内边

工作舱内的边使用**不带限定的成员 ID**（只有成员 `id`，而不是 `pod.member`）：

```yaml
pods:
  - id: dev
    members:
      - id: impl
        # ...
      - id: qa
        # ...
    edges:
      - kind: delegates_to
        from: impl      # NOT dev.impl
        to: qa          # NOT dev.qa
```

`from` 与 `to` 必须引用同一工作舱内存在的成员。

### 跨 Pod 边

工作舱之间的边使用**全限定的 `pod.member` ID**：

```yaml
edges:
  - kind: delegates_to
    from: orch.lead     # pod.member format
    to: dev.impl        # pod.member format
```

跨工作舱边必须引用不同的工作舱。`from` 与 `to` 同属一个工作舱的边是校验错误——请改用工作舱内边。

---

## 启动块（Startup Block）

启动块可以出现在三个层级：rig、工作舱与成员。它们通过启动分层模型做累加式合并（见 `docs/reference/startup-layering.md`）。

### 文件

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|----------|---------|-------------|
| `path` | string | 是 | — | 文件的相对路径。必须是安全相对路径。 |
| `delivery_hint` | string | 否 | `auto` | 文件的交付方式。取值为 `auto`、`guidance_merge`、`skill_install`、`send_text` 之一。 |
| `required` | boolean | 否 | `true` | 若此文件无法交付，启动是否失败。 |
| `applies_on` | string[] | 否 | `[fresh_start, restore]` | 此文件何时交付。取值为 `fresh_start`、`restore` 的子集。 |

#### 交付提示（Delivery Hints）

| 提示值 | 行为 |
|------|----------|
| `auto` | 系统根据文件类型与上下文自行选择。 |
| `guidance_merge` | 作为托管块合并进该运行时的指引文件（`CLAUDE.md` 或 `AGENTS.md`）。在运行框架启动前交付。 |
| `skill_install` | 作为技能安装到该运行时的技能目录。在运行框架启动前交付。 |
| `send_text` | 在运行框架就绪后以文本形式发送到智能体终端。要求智能体 TUI 处于活动状态。 |

### 动作（Actions）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|----------|---------|-------------|
| `type` | string | 是 | — | 动作类型。取值为 `slash_command`、`send_text`、`startup_proof` 之一。注意：v1 明确**不**支持 `shell`。 |
| `value` | string | 是 | — | 要发送的命令/文本；对 `startup_proof` 则为 `authenticated` / `none`。 |
| `phase` | string | 否 | `after_files` | 何时执行文本/命令。取值为 `after_files`（启动文件交付之后）、`after_ready`（运行框架就绪检查通过之后）之一。无论 phase 如何，证明选择都会在投影之前解析。 |
| `idempotent` | boolean | 是 | — | 该动作在恢复时是否可以安全重放。**必填字段**。非幂等动作的 `applies_on` 中不得包含 `restore`。 |
| `applies_on` | string[] | 否 | `[fresh_start, restore]` | 该动作何时运行。取值为 `fresh_start`、`restore` 的子集。 |

### 启动证明选择

默认情况下，启动不添加任何定向考验。要选择认证型启动挑战，请在智能体、profile、rig、工作舱、成员或操作员（operator）的启动块中声明一个动作：

```yaml
startup:
  actions:
    - type: startup_proof
      value: authenticated
      idempotent: true
```

在更后的层用 `value: none` 可以显式选择精简启动。最后一个适用的声明生效，顺序为 agent → profile → rig → pod → member → operator。文化文件只贡献文件，不贡献证明选择。若没有任何适用的声明，结果就是 `none`；启动文件的数量永远不会选择证明。非法取值与非幂等的证明声明都无法通过校验，包括后来被覆盖的声明。这些动作只声明策略，永远不会被敲进终端。

认证型选择只对全新开始或全新回退（fresh-fallback）的托管智能体启动发起挑战。恢复、分叉、重建与收养的会话不会收到新的挑战；终端节点永远不会收到。`applies_on` 跟随请求的启动上下文，因此恢复过程中的全新回退会使用 `restore` 的选择。保留默认的 `[fresh_start, restore]` 即可覆盖两条全新启动路径。

身份交付、投影、就绪检查与普通启动动作仍会运行。`startup_status: ready` 表示启动已完成，而 `oriented: missing` 表示已选择的证明正在等待认证提交。省略/`none` 会在新的全新启动上产生 `oriented: n-a`，并退役旧的挑战而不删除其审计历史。退役发生在运行框架成功启动之后、就绪检查之前，因此无论是待注意、超时还是就绪异常，都不能留住先前的证明。替换选择若启动失败，则不会退役当前证明；恢复/收养同样会保留既有的证明历史。最终生效的选择会记录在 `node.startup_pending` 上；动作会持久化在启动上下文中，供恢复与全新重启使用。

---

## 服务块（Services Block）

服务块是可选的。存在时，服务会在任何智能体节点启动之前先行启动。若服务健康检查失败，智能体启动会被阻塞。

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|----------|---------|-------------|
| `kind` | string | 是 | — | 服务后端。v1 仅支持 `compose`。 |
| `compose_file` | string | 是 | — | Docker Compose 文件的相对路径。必须是安全相对路径。相对于 rig 根目录解析。 |
| `project_name` | string | 否 | 由 rig 名称派生 | Docker Compose 项目名。必须匹配 `[a-z0-9][a-z0-9_-]*`。缺省时由 rig 名称净化后派生。 |
| `profiles` | string[] | 否 | — | 要激活的 Compose profile。 |
| `down_policy` | string | 否 | `down` | `rig down` 时的处置方式。取值为 `leave_running`、`down`、`down_and_volumes` 之一。 |
| `wait_for` | WaitTarget[] | 否 | — | 必须在智能体启动前通过的健康目标。 |
| `surfaces` | Surfaces | 否 | — | 关于可访问 URL 与命令的元数据。不会执行——仅作信息展示。 |
| `checkpoints` | CheckpointHook[] | 否 | — | 快照/恢复期间用于检查点导出/导入的 shell 命令。 |

### 等待目标（Wait Targets）

每个目标必须且只能定义 `service`、`url`、`tcp` 之一：

```yaml
wait_for:
  # HTTP probe — hits the URL, expects 2xx
  - url: http://127.0.0.1:8200/v1/sys/health

  # TCP probe — connects to host:port
  - tcp: "127.0.0.1:5432"

  # Compose health check — requires Docker health to report "healthy"
  - service: postgres
    condition: healthy
```

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `url` | string | 三选一 | 要探测的 HTTP URL。 |
| `tcp` | string | 三选一 | TCP 探测的 `host:port`。 |
| `service` | string | 三选一 | Compose 服务名。要求 `condition: healthy`。 |
| `condition` | string | 仅与 `service` 同用 | 必须为 `healthy`。仅对 `service` 目标有效。 |

### 呈现面（Surfaces）

```yaml
surfaces:
  urls:
    - name: Vault UI
      url: http://127.0.0.1:8200/ui
  commands:
    - name: Vault status
      command: "vault status -address=http://127.0.0.1:8200"
```

呈现面只是元数据。它们展示在 UI 与 `rig env status` 输出中，但 OpenRig **不会**执行它们。

### 检查点钩子（Checkpoint Hooks）

```yaml
checkpoints:
  - id: postgres
    export: "docker compose exec -T postgres pg_dump -U app > {{artifacts_dir}}/postgres.sql"
    import: "cat {{artifacts_dir}}/postgres.sql | docker compose exec -T postgres psql -U app"
```

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `id` | string | 是 | 此检查点的唯一标识符。 |
| `export` | string | 是 | 导出状态的 shell 命令。`{{artifacts_dir}}` 会被替换为守护进程管理的路径。 |
| `import` | string | 否 | 恢复时导入状态的 shell 命令。 |

检查点钩子是由守护进程运行的 shell 命令。它们是尽力而为的——导出失败不会阻塞快照，但连续性会被归类为 `receipt_only` 而不是 `checkpointed`。

---

## 连续性策略（Continuity Policy）

可选的工作舱级配置，控制压缩恢复行为。

```yaml
continuity_policy:
  enabled: true
  sync_triggers: [pre_compaction, pre_shutdown, manual, milestone]
  artifacts:
    session_log: true
    restore_brief: true
    quiz: false
  restore_protocol:
    peer_driven: true
    verify_via_quiz: false
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|----------|---------|-------------|
| `enabled` | boolean | 是 | — | 此工作舱是否启用连续性。 |
| `sync_triggers` | string[] | 否 | — | 何时同步。取值：`pre_compaction`、`pre_shutdown`、`manual`、`milestone`。 |
| `artifacts.session_log` | boolean | 否 | — | 是否维护会话记录。 |
| `artifacts.restore_brief` | boolean | 否 | — | 是否维护恢复简报。 |
| `artifacts.quiz` | boolean | 否 | — | 是否使用问答式验证。 |
| `restore_protocol.peer_driven` | boolean | 否 | — | 恢复过程是否由队友驱动。 |
| `restore_protocol.verify_via_quiz` | boolean | 否 | — | 是否通过问答验证恢复效果。 |

---

## 校验规则小结

这些规则由校验器强制执行。违反其中任何一条的规格都会被 `rig spec validate` 与 `rig up` 拒绝。

1. `version` 与 `name` 是必填的非空字符串。
2. `pods` 必须是非空数组。
3. 工作舱 ID 不得包含点号，且必须唯一。
4. 工作舱 label 为必填。
5. 成员 ID 不得包含点号，且必须在其工作舱内唯一。
6. 每个成员都必须有 `agent_ref`、`profile`、`runtime` 与 `cwd`。
7. 终端节点要求精确三元组：`runtime: terminal`、`agent_ref: builtin:terminal`、`profile: none`。
8. `agent_ref` 必须以 `local:`（相对路径）或 `path:`（绝对路径）开头，`builtin:terminal` 除外。
9. `local:` 引用必须是相对路径。`path:` 引用必须是绝对路径。
10. `restore_policy` 必须是 `resume_if_possible`、`relaunch_fresh`、`checkpoint_only` 之一。
11. 工作舱内边使用不带限定的成员 ID。跨工作舱边使用 `pod.member` 格式。
12. 跨工作舱边必须引用不同的工作舱。
13. 边类型必须是 `delegates_to`、`spawned_by`、`can_observe`、`collaborates_with`、`escalates_to` 之一。
14. 所有文件路径（`culture_file`、启动文件路径、`compose_file`）都必须是安全相对路径。
15. `services.kind` 必须是 `compose`。
16. 存在 services 时，`services.compose_file` 为必填。
17. `services.project_name` 必须匹配 `[a-z0-9][a-z0-9_-]*`。
18. `services.down_policy` 必须是 `leave_running`、`down`、`down_and_volumes` 之一。
19. 每个等待目标必须且只能定义 `service`、`url`、`tcp` 之一。
20. `condition` 仅对 `service` 目标有效，且必须为 `healthy`。
21. 启动文件的 `delivery_hint` 必须是 `auto`、`guidance_merge`、`skill_install`、`send_text` 之一。
22. 启动动作的 `type` 必须是 `slash_command`、`send_text`、`startup_proof` 之一。（`shell` 被显式拒绝。）证明选择要求 `value: authenticated` 或 `none`，且 `idempotent: true`。
23. 启动动作的 `phase` 必须是 `after_files`、`after_ready` 之一。
24. 启动动作的 `idempotent` 是必填的布尔值。
25. 非幂等动作的 `applies_on` 中不得包含 `restore`。
26. `applies_on` 的取值只能是 `fresh_start`、`restore`。

---

## 随附示例

这些是 OpenRig 随附的内置规格。可以把它们当作完整示例来阅读。

| 规格 | 位置 | 工作舱 | 成员 | 服务 |
|------|----------|------|---------|----------|
| `product-team` | `packages/daemon/specs/rigs/preview/product-team/rig.yaml` | orch1, dev1, rev1 | 7（lead、peer、impl、qa、design、r1、r2） | 无 |
| `implementation-pair` | `packages/daemon/specs/rigs/launch/implementation-pair/rig.yaml` | dev | 2（impl、qa） | 无 |
| `adversarial-review` | `packages/daemon/specs/rigs/focused/adversarial-review/rig.yaml` | orch, review | 3（lead、r1、r2） | 无 |
| `research-team` | `packages/daemon/specs/rigs/focused/research-team/rig.yaml` | orch, research | 3（lead、analyst、synthesizer） | 无 |
| `secrets-manager` | `packages/daemon/specs/rigs/launch/secrets-manager/rig.yaml` | vault | 1（specialist） | 有（Vault） |
