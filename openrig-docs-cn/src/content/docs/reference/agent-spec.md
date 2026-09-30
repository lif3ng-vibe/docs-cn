---
title: "AgentSpec 参考"
---

版本：1.0
最后对照代码验证：2026-04-11
事实来源：`packages/daemon/src/domain/agent-manifest.ts`、`packages/daemon/src/domain/types.ts`

本文是 AgentSpec YAML 格式（`agent.yaml`）的权威参考。这里记录的每一个字段、每一条校验规则和每一个默认值，都逐一追溯自实际的解析器与校验器代码。

---

## 最小有效示例

```yaml
name: my-agent
version: "1.0"

profiles:
  default:
    uses:
      skills: []
      guidance: []
      subagents: []
      hooks: []
      runtime_resources: []

resources: {}

startup:
  files: []
  actions: []
```

## 实用示例（实现者智能体）

```yaml
name: implementer
version: "1.0"
description: Implementation agent — writes code following TDD discipline

defaults:
  runtime: claude-code

imports:
  - ref: local:../../shared

profiles:
  default:
    uses:
      skills: [openrig-user, development-team, test-driven-development, systematic-debugging]
      guidance: []
      subagents: []
      hooks: []
      runtime_resources: []

resources:
  guidance:
    - id: role
      path: guidance/role.md

startup:
  files:
    - path: guidance/role.md
      delivery_hint: send_text
      required: true
  actions: []
```

## 完整示例（全部特性）

```yaml
name: vault-specialist
version: "1.0"
description: Vault specialist agent — manages HashiCorp Vault for this managed app

defaults:
  runtime: claude-code
  model: claude-opus-4-6
  lifecycle:
    execution_mode: interactive_resident
    compaction_strategy: default-compaction
    restore_policy: resume_if_possible

imports:
  - ref: local:../../shared
  - ref: local:../common-tools
    version: "2.0"

profiles:
  default:
    summary: Standard Vault operations profile
    preferences:
      runtime: claude-code
    uses:
      skills: [openrig-user, systematic-debugging, vault-user]
      guidance: []
      subagents: []
      hooks: []
      runtime_resources: []
    startup:
      files:
        - path: guidance/profile-specific.md
          delivery_hint: send_text
      actions: []
    lifecycle:
      restore_policy: resume_if_possible

resources:
  skills:
    - id: vault-user
      path: skills/vault-user
  guidance:
    - id: role
      path: guidance/role.md
  hooks:
    - id: pre-commit
      path: hooks/pre-commit.sh
      runtimes: [claude-code]
  runtime_resources:
    - id: claude-settings
      path: runtime/claude-settings.fragment.json
      runtime: claude-code
      type: claude_settings_fragment

startup:
  files:
    - path: guidance/role.md
      delivery_hint: send_text
      required: true
    - path: startup/context.md
      delivery_hint: send_text
      required: true
    - path: guidance/optional-tips.md
      delivery_hint: guidance_merge
      required: false
      applies_on: [fresh_start]
  actions:
    - type: send_text
      value: "Load vault-user skill and verify Vault health."
      phase: after_ready
      idempotent: true
```

---

## 顶层字段

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|----------|---------|-------------|
| `name` | string | 是 | — | 智能体名称。用于规格库识别与校验消息。 |
| `version` | string | 是 | — | 规格版本。仅作信息展示——不用于兼容性控制。 |
| `description` | string | 否 | — | 人类可读的描述。展示在规格库与审阅呈现面中。 |
| `defaults` | Defaults | 否 | — | 默认的 runtime、model 与生命周期设置。在未被 rig spec 或 profile 覆盖时应用。 |
| `imports` | Import[] | 否 | `[]` | 要导入的其他 AgentSpec。被导入规格中的资源会成为 profile `uses` 引用可用的资源。 |
| `profiles` | map<string, Profile> | 否 | `{}` | 具名 profile 集合。每个 profile 选用资源，并可覆盖 startup/lifecycle。rig spec 成员的 `profile` 字段决定使用哪个 profile。 |
| `resources` | Resources | 否 | 全部为空 | 已声明的资源（skills、guidance、subagents、hooks、runtime resources）。它们是可用的资源池，profile 通过 `uses` 从中选用。 |
| `startup` | StartupBlock | 否 | `{ files: [], actions: [] }` | 智能体级的启动文件与动作。通过启动分层模型应用于所有 profile。 |

---

## 默认值（Defaults）

```yaml
defaults:
  runtime: claude-code
  model: claude-opus-4-6
  lifecycle:
    execution_mode: interactive_resident
    compaction_strategy: default-compaction
    restore_policy: resume_if_possible
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|----------|---------|-------------|
| `runtime` | string | 否 | — | 此智能体的默认运行时。可被 rig spec 成员的 `runtime` 字段覆盖。 |
| `model` | string | 否 | — | 默认模型。可被 rig spec 成员的 `model` 字段覆盖。 |
| `lifecycle` | Lifecycle | 否 | 见下文 | 生命周期行为的默认值。 |

### 生命周期默认值

| 字段 | 类型 | 默认值 | 允许的取值 |
|-------|------|---------|----------------|
| `execution_mode` | string | `interactive_resident` | `interactive_resident`（v1 中唯一的取值；`wake_on_demand` 会被显式拒绝） |
| `compaction_strategy` | string | `default-compaction` | `default-compaction`、`managed-compaction`、`handover`、`apprentice-handover`；已弃用的别名仍被接受，但会附带一条校验提示：`harness_native` → `default-compaction`，`pod_continuity` → `handover`（`custom_prompt` 在 v1 中被显式拒绝） |
| `restore_policy` | string | `resume_if_possible` | `resume_if_possible`、`relaunch_fresh`、`checkpoint_only` |

---

## 导入（Imports）

```yaml
imports:
  - ref: local:../../shared
  - ref: local:../common-tools
    version: "2.0"
```

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `ref` | string | 是 | 指向另一个 AgentSpec 目录的引用。必须以 `local:`（相对路径）或 `path:`（绝对路径）开头。被引用的目录中必须含有 `agent.yaml`。 |
| `version` | string | 否 | 可选的版本约束。必须是精确版本——不允许范围（`~`、`^`、`>=` 等）。 |

### 导入解析

- `local:` 路径相对于导入方规格所在目录解析
- `path:` 路径是绝对文件系统路径
- 被导入的资源可用于 profile 的 `uses` 引用
- 在 `uses` 中引用被导入的资源时，要使用带限定名的 `namespace:id` 格式（例如 `shared:openrig-user`）
- 不带限定名的引用（仅 `id`）会先在该规格自己的本地资源中解析

### 共享导入模式

大多数内置智能体都会导入共享的内置规格：

```yaml
imports:
  - ref: local:../../shared
```

这样就能使用完整的共享技能池（openrig-user、systematic-debugging、development-team 等），各智能体再通过 profile 的 `uses` 挑选自己需要的部分。

---

## Profiles（配置档案）

```yaml
profiles:
  default:
    summary: Standard operations profile
    preferences:
      runtime: claude-code
      model: claude-opus-4-6
    uses:
      skills: [openrig-user, systematic-debugging, vault-user]
      guidance: [role]
      subagents: []
      hooks: []
      runtime_resources: []
    startup:
      files: []
      actions: []
    lifecycle:
      restore_policy: resume_if_possible
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|----------|---------|-------------|
| `summary` | string | 否 | — | Profile 的描述。 |
| `preferences` | object | 否 | — | 此 profile 的 runtime/model 偏好。 |
| `preferences.runtime` | string | 否 | — | 首选运行时。 |
| `preferences.model` | string | 否 | — | 首选模型。 |
| `uses` | Uses | 否 | 全部为空 | 选择哪些已声明资源在此 profile 下处于激活状态。 |
| `startup` | StartupBlock | 否 | — | Profile 级的启动文件与动作。通过分层与智能体级启动合并。 |
| `lifecycle` | Lifecycle | 否 | — | Profile 级的生命周期覆盖项。 |

### Uses（资源选择）

`uses` 块从 `resources` 池（包括被导入的资源）中选择哪些资源在此 profile 下处于激活状态。

```yaml
uses:
  skills: [openrig-user, systematic-debugging, vault-user]
  guidance: [role]
  subagents: []
  hooks: [pre-commit]
  runtime_resources: [claude-settings]
```

每个数组都包含资源 ID。它们可以是：
- **不带限定名**（`vault-user`）——先在该规格自身的 `resources` 中解析，再在被导入的规格中解析
- **带限定名**（`shared:openrig-user`）——针对某个特定被导入规格的资源解析

`uses` 的类别有：`skills`、`guidance`、`subagents`、`hooks`、`runtime_resources`。

---

## Resources（资源）

```yaml
resources:
  skills:
    - id: vault-user
      path: skills/vault-user
  guidance:
    - id: role
      path: guidance/role.md
  subagents:
    - id: helper
      path: subagents/helper
  hooks:
    - id: pre-commit
      path: hooks/pre-commit.sh
      runtimes: [claude-code]
  runtime_resources:
    - id: claude-settings
      path: runtime/claude-settings.fragment.json
      runtime: claude-code
      type: claude_settings_fragment
```

资源只是可用池。它们**不会**自动交付给智能体——由 profile 通过 `uses` 选用。真正交付的，只有当前激活 profile 的 `uses` 块所引用的那些资源。

### 资源类别

| 类别 | 字段 | 说明 |
|----------|--------|-------------|
| `skills` | `id`, `path` | 包含 SKILL.md 的技能目录。通过 `skill_install` 交付。 |
| `guidance` | `id`, `path`, `target`*, `merge`* | 指引文件。通过 `guidance_merge` 交付，合并进 CLAUDE.md/AGENTS.md。 |
| `subagents` | `id`, `path` | 子智能体定义。 |
| `hooks` | `id`, `path`, `runtimes`* | 钩子脚本。可选的 `runtimes` 数组将其限定到特定运行时。 |
| `runtime_resources` | `id`, `path`, `runtime`, `type` | 运行时专属资源。`runtime` 与 `type` 为必填。 |

带 `*` 的字段为可选。

可识别的运行时资源类型：
- `claude_settings_fragment`——把一个 JSON 对象合并进 `<cwd>/.claude/settings.local.json`。
- `claude_mcp_fragment`——把一个 JSON 对象合并进 `<cwd>/.mcp.json`。
- `codex_config_fragment`——把一个 TOML 片段 upsert 进 `~/.codex/config.toml` 中由 OpenRig 托管的块内。

未知的运行时资源类型仍会复制到运行时扩展目录，作为对智能体可见的上下文。

#### 编写 `codex_config_fragment`

**片段必须以表头开头**。片段本身必须是一份有效的 TOML 文档，且它设置的每个键都必须位于它所声明的某个表之下。把键放在第一个表头之前的片段，会在投影（projection）时被拒绝，任何内容都不会写入。

原因在于 TOML 的语法，而非某项策略选择。托管块会追加到用户 `config.toml` 的末尾，而 TOML 在打开某个表之后，并没有回到文档根层的语法。因此，如果用户的文件结束于某个表内，追加的根层键并不会落在根层——它会悄无声息地变成*他们*那个表的成员。拒绝行为是确定性的，且绝不检查用户的文件：片段作者看不到用户状态，而一条成败取决于用户状态的规则将无法复现。

```toml
# refused — `model` would bind into whatever table the user's file ends inside
model = "gpt-5"

[mcp_servers.exa]
url = "https://mcp.exa.ai/mcp"
```

```toml
# accepted — every key sits under a table this fragment declares
[mcp_servers.exa]
url = "https://mcp.exa.ai/mcp"
```

当片段中的表是用户已经声明的表时，以用户的表为准：托管表会被丢弃，用户的值绝不会被合并、改写或覆盖，而片段的其余部分仍然生效。

### 资源路径规则

- 所有资源路径都必须是安全的相对路径（不允许 `..` 目录穿越，不允许绝对路径）
- 路径相对于智能体规格所在目录解析
- 资源 ID 在其所属类别内必须唯一
- 资源 ID 是 `uses` 引用中使用的标识符

### 指引（guidance）资源

```yaml
guidance:
  - id: role
    path: guidance/role.md
    target: CLAUDE.md      # optional — where to merge
    merge: managed_block   # optional — how to merge (default: managed_block)
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|----------|---------|-------------|
| `id` | string | 是 | — | 资源标识符。 |
| `path` | string | 是 | — | 指引文件的相对路径。 |
| `target` | string | 否 | — | 合并的目标文件（例如 `CLAUDE.md`）。 |
| `merge` | string | 否 | `managed_block` | 合并策略。取值为 `managed_block`、`append` 之一。 |

---

## 启动块（Startup Block）

启动块遵循与 RigSpec 中相同的格式（文件与动作的完整细节见 `docs/reference/rig-spec.md`）。

智能体级启动配置应用于所有 profile。profile 级启动配置仅在该 profile 激活时应用。两者通过启动分层模型做累加式合并。

额外的定向（orientation）挑战要求一个显式的 `startup_proof` 动作，并带有 `value: authenticated` 与 `idempotent: true`。省略则不添加任何考验；之后适用的 `value: none` 会覆盖更早的选择。优先级、恢复行为，以及就绪（readiness）与已验证证明之间的区别，见 [启动证明选择](/reference/rig-spec/#启动证明选择)。

### 交付提示（Delivery Hint）速查

| 提示值 | 交付时机 | 机制 |
|------|---------------|-----------|
| `auto` | 运行框架启动前 | 系统根据文件类型自行选择 |
| `guidance_merge` | 运行框架启动前 | 作为托管块合并进 CLAUDE.md/AGENTS.md |
| `skill_install` | 运行框架启动前 | 安装到运行时技能目录 |
| `send_text` | 运行框架就绪后 | 通过 tmux 以文本形式发送到智能体终端 |

---

## 校验规则小结

1. `name` 与 `version` 是必填的非空字符串。
2. `imports` 必须是带有 `ref` 字段的对象数组。
3. 导入的 `ref` 必须以 `local:`（相对路径）或 `path:`（绝对路径）开头。
4. 导入的 `version` 必须是精确版本（不允许范围）。
5. `profiles` 必须是映射（对象），而不是数组。
6. profile 的 `uses` 引用必须能解析到已声明的资源（本地或被导入的）。
7. 无法解析到本地资源的不带限定名 `uses` 引用，要求存在导入。
8. 带限定名的 `uses` 引用必须是 `namespace:id` 格式。
9. 所有资源路径都必须是安全的相对路径。
10. 资源 ID 在其所属类别内必须唯一。
11. `runtime_resources` 条目必须带有 `runtime` 字段。
12. 生命周期的 `execution_mode` 必须是 `interactive_resident`。
13. 生命周期的 `compaction_strategy` 必须是 `default-compaction`、`managed-compaction`、`handover`、`apprentice-handover` 之一——或是一个已弃用的别名（`harness_native`、`pod_continuity`），后者可通过校验，但会附带一条弃用提示，并规范化为其规范取值（OPR.0.5.6.20）。
14. 生命周期的 `restore_policy` 必须是 `resume_if_possible`、`relaunch_fresh` 或 `checkpoint_only`。
15. 启动文件与动作遵循与 RigSpec 中相同的校验规则。

---

## 文件系统布局

智能体规格目录遵循以下惯用布局：

```
my-agent/
  agent.yaml              # required — the AgentSpec
  guidance/
    role.md               # role definition
  startup/
    context.md            # boot-time grounding
  skills/
    my-skill/
      SKILL.md            # skill content
  hooks/
    pre-commit.sh         # hook script
  runtime/
    claude-settings.fragment.json  # runtime-specific resource
```

唯一必需的文件是 `agent.yaml`。其余内容都由规格中的路径引用，必须存在于那些相对路径上。

---

## 随附示例

| 智能体 | 位置 | 导入 | Profile 技能 | 用途 |
|-------|----------|---------|---------------|---------|
| `shared` | `specs/agents/shared/` | 无 | —（仅作为资源池） | 所有内置智能体共用的技能池 |
| `implementer` | `specs/agents/development/implementer/` | `shared` | openrig-user、development-team、test-driven-development、systematic-debugging 等 | TDD 实现者智能体 |
| `qa` | `specs/agents/development/qa/` | `shared` | openrig-user、development-team 等 | 质量保障智能体 |
| `orchestrator` | `specs/agents/orchestration/orchestrator/` | `shared` | openrig-user、orchestration-team 等 | rig 编排主导智能体 |
| `independent-reviewer` | `specs/agents/review/independent-reviewer/` | `shared` | review-team、systematic-debugging、verification-before-completion | 独立代码审阅者 |
| `vault-specialist` | `specs/agents/apps/vault-specialist/` | `shared` | openrig-user、systematic-debugging、vault-user | Vault 领域专家 |
| `design` | `specs/agents/design/` | 无 | — | 产品设计师 |
