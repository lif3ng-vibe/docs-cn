---
title: "准入 webhook：持久化前的 HTTP 钩子"
description: "如果你的想法不符合「改页面或观察写入」，那它多半是另一个扩展点（/hook 入口、/admin/ 管理面或带外计划任务）。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/admission-webhooks.md"
---

# 准入 webhook（admission webhook）：持久化前的 HTTP 钩子

> 操作者配置的 HTTP 钩子，在引擎写入路径（`Wiki::write_page`、`delete_page`、`purge_project`、`purge_workspace`、`move_project` 与交接生命周期操作）的持久变更提交之前一刻调用。写钩子可以改页面（返回新的 frontmatter / 正文）；删除/清除/移动钩子是可以观察、镜像或拒绝的通知。来源是 `crates/ai-memory-wiki/src/admission.rs` 与 `crates/ai-memory-cli/src/commands/serve.rs` 里的接线——本文有漂移时以两者为准。

## 1. 这是什么（不是什么）

| | 能做什么 | 不能做什么 |
|---|---|---|
| 链 | 加规范 frontmatter 字段（如 `contributors`）；把写入镜像进外部系统（git、检索索引、审计日志）；拒绝违反策略的写入（如 `validate-no-secrets`）。 | 回头直接对话引擎的写入器或存储——链一次只看一页、就地改它。 |
| 引擎 | 保持封闭不可改：每个新行为作为独立 HTTP 服务发布，任何语言都行。 | 引擎不发现、不自动注册 webhook——操作者在配置里点名它们。 |

如果你的想法不符合「改页面或观察写入」，那它多半是另一个扩展点（`/hook` 入口、`/admin/*` 管理面或带外计划任务）。

## 2. 生命周期

阻塞链在 `Wiki::write_page` 内部触发，在 markdown 解析并初步净化之后、原子写入与存储 upsert **之前**。webhook 施加的变更在持久化之前再次净化。webhook 应用的变更一步原子地传播到磁盘 markdown 文件与 SQLite 行（写入器 actor / 原子写入不变量见[架构](/architecture/)）。

webhook 按配置声明的顺序**串行**运行。每个都看到前一个 webhook（可能已改过的）页面——所以加 frontmatter 的 `contributors` 钩子之后，跟着的 `git-mirror` 钩子镜像的是增强后的页面。

webhook 目前在这些 `op` 值上触发（枚举可扩展）：

- `write_page`——经 MCP `memory_write_page`、CLI `write-page`、`/admin/write-page`、lint 重写器、钩子合成的直接写入。
- `consolidate`——来自整编器的 LLM 整编写入（SessionEnd 选择启用 + PreCompact + 手动 `memory_consolidate`）与提供方失败后基于规则的 PreCompact/PostCompaction 回退。**每次整编至多触发两次**：一次是 LLM 调用之前的准入*预检*——带**空正文**与目标页面路径（多页运行时是规范的 `sessions/<id>.md` 锚点路径）——另一次是带真实内容的正常写入时检查。把阻塞调用当作**决策而非投递事件**：按 `op` / `actor` / `workspace` / `project` / 路径做门控，不要仅因正文为空而拒绝，也不要把阻塞调用计作「一次写入已发生」的副作用（那用非阻塞观察者 webhook）。预检期间返回的任何变更被丢弃。
- `delete`——单页被移除（`Wiki::delete_page`，由 `memory_delete_page` MCP 工具触发）。携带页面路径，无正文；在文件移除**之前**触发，所以镜像可以对同一路径 `git rm`。SQLite 索引由写入器 actor 直接删除；监视器不对账删除事件。
- `purge_project`——整个项目被清除（`Wiki::purge_project` → `remove_dir_all`，从 `/admin/purge-project` 路由）。`ctx` 携带项目，**无**页面路径；在目录移除之前触发，所以镜像可以先清掉项目。
- `purge_workspace`——整个 workspace 被清除（从 `/admin/delete-workspace` 路由）。`ctx.workspace` 携带 workspace、`ctx.project` 为空、**无**页面路径；在 SQL/文件销毁之前为拒绝策略准入触发，持久工作完成后再向非阻塞观察者派发一次。
- `move_project`——整个项目在 workspace 之间移动而不改 `project_id`（真移动到全新目的地）。`ctx.workspace` / `ctx.project` 携带源项目、`ctx.destination_workspace` / `ctx.destination_project` 携带目标名、无页面路径；在目录重命名 + DB 重盖戳之前触发，所以镜像可以重命名或拒绝项目移动。
- `move_session`——一个会话（其行与 `sessions/<id>.md` 页面）被移到另一项目（`/admin/move-session`）。`ctx.workspace` / `ctx.project` 携带源项目、`ctx.destination_workspace` / `ctx.destination_project` 携带目标名、无页面路径；在页面文件移动与 DB 重盖戳之前触发，所以镜像可以移动或拒绝它。
- `handoff_begin` / `handoff_accept` / `handoff_cancel`——交接被创建、消费或丢弃。携带 workspace / project 与行动操作者，无页面路径（交接在它们自己的表里，不在 wiki 树里）。由 MCP 工具**和**自动钩子路径触发：SessionEnd 接力棒（`handoff_begin`）与会话启动认领（`handoff_accept`）。

三个交接生命周期 op 按一个固定顺序派发，从每个触发它们的路径都一样：能拒绝的 webhook——`blocking` 且 `failure_policy = "reject"`——在操作**之前**被等待，操作随后运行，其余每个订阅者（观察者，阻塞与否）在操作之后即发即忘派发、且只在操作确实发生时。所以没有观察者被告知一个没找到待处理交接的 `accept`、或被另一操作者所有权拒绝的 `cancel`——没有待处理项的 `accept` 也不告诉决策者，因为引擎在询问之前就知道没有可接受的东西——订阅这些 op 之一的观察者看到的事件与其来自 MCP 工具还是钩子入口无关。（`write_page` 与下面的通知 op 不变：那里 `blocking` webhook 无论 `failure_policy` 如何都预先等待——`write_page` 上是因为它还能改页面。）

`reject` 让调用方付出什么取决于**哪条路径**触发了 op，这个差别是刻意的。MCP 工具上——`memory_handoff_begin`、`memory_handoff_accept`、`memory_handoff_cancel`——拒绝中止工具调用并以 JSON-RPC 错误返回给调用方，与 `write_page` 一模一样：有一个请求操作的调用方，所以它被告知操作没有发生。自动路径上没有这样的调用方，所以拒绝降级生命周期事件而不是使其失败：

- SessionEnd 在 `end_session` 提交之前询问；拒绝跳过接力棒、记日志，会话页面 / 选择启用的整编 / 自动提交仍然运行。会话以没有交接告终，而不是完全没有摘要。
- 会话启动认领由同步钩子路径服务。最短的已发布调用方是 shell 钩子的一秒 curl 期限（原生命令允许三秒），所以服务器把准入钳制在 750 ms。拒绝、那个服务器期限、逐 webhook 超时或不可达的主机都让交接为下一会话保持**开放**；它绝不让会话启动失败、也不在调用方断开之后消费上下文。

会话启动认领的预算：决策 webhook 被**串行**等待，链在第一个拒绝处停止，所以操作者最坏情况等待的是订阅了 `handoff_accept` 的每个 `reject` 策略 webhook 的 `timeout_ms` **之和**——不是其中最大者。该和再被服务器的 750 ms 自动认领期限钳制。普通 MCP 与写入路径上 `timeout_ms` 仍默认每 webhook 2000 ms；自动会话启动接受上，750 ms 内无法批准的链按拒绝处理、接力棒保持开放。需要日志指明哪个决策者超时（而不是聚合期限先到）时，配置更小的逐 webhook 值。

`delete` / `purge_project` / `purge_workspace` / `move_project` / `move_session` 是通知——没有可改的正文；`Reject` 策略 webhook 仍然中止操作（准入在 `/admin/purge-project` 与 `/admin/delete-workspace` 两条路径都在 SQL 销毁**之前**触发，在 `/admin/move-project` 的复制-清除路径在源拆除之前触发，所以拒绝让源保持完好）。每个 webhook 经 `events` 选择它关心的 op；链在派发前对照 `WebhookConfig::events` 检查 op。

遗忘清扫的衰减驱逐在移除 Markdown 文件并写墓碑之前用同一个条件性 `delete` 通知。老化清理绝不移除文件：若 Markdown 已在该路径重现，先保留并重建索引，再只移除旧的 SQLite 版本链。那次仅 DB 的历史清除没有文件镜像事件。

复制-清除式 `/admin/move-project` 从一个请求触发**两**个 webhook 事件：页面复制进目标时一条或多条 `write_page` 通知，然后源被拆除时一条终态 `purge_project` 通知。SQL 清除已提交而磁盘目录移除随后失败时，`purge_project` 事件携带 `partial_failure: true`。

`/admin/delete-workspace` 发出 `purge_workspace`。SQL workspace 级联已提交而 `<wiki_root>/<workspace_id>` 无法移除时，其最终异步观察者通知携带 `partial_failure: true`。

复制阶段，引擎只跳过名字恰好是 `contributors` 的 webhook。移动复制逐字保留页面 frontmatter（含既有的 `contributors` 列表），所以为每页重跑那个增强钩子只增加批量移动延迟而不改变复制的页面。其他 `write_page` webhook（如 `git-mirror`）对每个复制的页面照常运行；终态 `purge_project` 通知不变。

### 什么不触发链（设计如此）

- **`log.md` / `log-YYYY-MM.md` 追加**——每个钩子事件（逐提示词/工具调用）都写。把每一次都路由进链意味着每条观察一个 HTTP POST，违反即发即忘的钩子预算。逐事件日志是本地审计工件；带外备份它（批量 rsync），不要逐行。
- **交接背后的页面正文**——上面的 `handoff_*` op 只携带作用域与行动操作者。交接是 SQLite 行，所以文件镜像没有可对账的文件变更；它得到的是生命周期事件，不是页面。
- **老化的衰减历史清理**——只有旧的 SQLite 版本链变化；该路径上的任何 Markdown 文件保持权威，必要时先重建索引。初始衰减驱逐与 frontmatter TTL 过期用条件性 `delete` 准入路径。
- **`rename-project`**——一次 `projects.name` 列更新；磁盘路径是稳定 UUID，所以没有文件移动、没有可传播的东西。
- **`rename-workspace`**——一次 `workspaces.name` 列更新加刷新的 `_meta.md` manifest；workspace 路径是稳定 UUID，所以不需要文件移动通知。
- **磁盘上的外部/手工编辑**——由监视器对账，不经过准入链（链是引擎自己的写入路径用的）。

## 3. 线上契约

### 请求（引擎 → webhook）

```http
POST <webhook.url>
Content-Type: application/json
X-Memory-Op: write_page | consolidate | delete | purge_project | purge_workspace | move_project
             | move_session | handoff_begin | handoff_accept | handoff_cancel
```

（头是这十个值之一；第二行是列表的续行，不是第二个头。）

```jsonc
{
  "page": {
    "path": "gotchas/example.md",            // 相对 wiki 路径（PagePath）
    "frontmatter": { "title": "...", ... },  // 任意 JSON，可为 null
    "body": "..."                            // markdown 正文，无 frontmatter 块
  },
  "ctx": {
    "workspace": "default",                  // 解析出的名字（见 §5）
    "project": "ai-memory-ops",              // 解析出的名字
    "destination_workspace": "archive",       // 仅 move_project / move_session；否则省略
    "destination_project": "ai-memory-ops",   // 仅 move_project / move_session；否则省略
    "actor": {                               // 请求层身份
      "agent": "claude-code",                // claude-code | codex | opencode | hook | cli | …
      "user": "djalmajr",                    // 未认证时为 null
      "sub": "8f3a-...",                     // JWT sub
      "client": "72836f52-...",              // DCR client UUID
      "session_id": "019e6d-..."
    },
    "op": "write_page",                      // write_page | consolidate | delete | purge_project | purge_workspace | move_project | move_session
    "partial_failure": true                  // 仅 purge_project/purge_workspace，且只在置位时
                                             //   （false 时线上省略）。
                                             //   true → DB 行已清除但
                                             //   `remove_project_dir` 之后失败；
                                             //   跟踪文件系统的镜像（git push）
                                             //   应拒绝丢弃自己的副本。
  }
}
```

`crates/ai-memory-wiki/src/admission.rs` 里的 `WebhookRequestBody` / `WebhookPagePayload` / `ActorContext` / `AdmissionContext` 类型是权威序列化来源。

### 响应（webhook → 引擎）

| 状态 | 体 | 行为 |
|---|---|---|
| `200 OK` | `{ "page": { "frontmatter": ..., "body": ... } }`——两个内层字段可选。缺失即「该字段保持不变」。 | 引擎在下一个 webhook（或最终原子写入）之前换入返回的值。 |
| `204 No Content` | （空） | 引擎把该 webhook 当纯观察者/副作用——不改、不解析。 |
| `4xx` / `5xx` | （可选文本体，记日志） | 见 **§4 失败策略**。 |

引擎把响应读取钳制在 `MAX_RESPONSE_BYTES`（1 MiB）。超出按无操作加 `warn` 日志处理——webhook 没有正当理由返回多于页面信封的东西。

## 4. 失败策略

引擎够不到 webhook 或它返回非 2xx 时，每个 webhook 自选其一：

- **`ignore`（默认，推荐）**——引擎记 `warn` 并以未改动的页面继续。页面写入仍成功。除安全攸关的强制器外，这是对一切的正确选择。
- **`reject`**——引擎中止写入，把错误上抛给调用方。**只在** webhook 是持久化的硬前提时用（如未来的 `validate-no-secrets` 强制器）。

订阅多个 op 的 webhook 在所有 op 上用同一策略——包括上面的交接生命周期 op，那里「中止」指「谢绝这次交接」，不是「让事件失败」。

## 5. workspace / project 名

引擎把 `workspace_id` 与 `project_id` 解析成 UI 与磁盘 wiki 用的同样人类可读名字，所以 webhook 可以按名字寻址页面而无需重新实现 UUID 查找。解析发生在链触发之前；wiki 未经 [`Wiki::with_store_reader`] 构建时（如遗留嵌入器、不带读器接链的测试）两个字段为空。

外部 webhook 应把这些名字当不透明字符串（workspace / project 取值用与 `--workspace` / `--project` CLI 标志相同的校验）。它们在 workspace / project 的生命周期内稳定——引擎不会悄悄改名。`rename-project` 是操作者手工跑的 op，接了一个的话最终会触发新一轮 webhook 扇出。

## 6. 防循环

一个回头发给引擎写的 webhook（如经 `/admin/write-page`、`memory_write_page` 或钩子入口）必须在其重入调用上带头

```
X-Memory-Skip-Admission-Chain: <name>[,<name>...]
```

引擎把 CSV 对照 `WebhookConfig::name`，为那次写入短路那些钩子——但只对受信任的重入（root/禁用认证的请求）。普通 DB 用户写入不能设这个头来绕过 reject 策略 webhook。受信任重入不带跳过头就会无限递归（引擎 → webhook → 引擎 → webhook → ……）。该头只对单次重入写入传播；下一次外部写入正常把链接回来。

## 7. 限额

常量从 `ai-memory-wiki` crate 根导出：

| 常量 | 值 | 钳制什么 |
|---|---|---|
| `MAX_ADMISSION_WEBHOOKS` | `16` | 链长。`AdmissionChain::new` 超过即报错——配错的模板（helm 循环、重复块）不能把 N 个钩子塞进写入路径。 |
| `MAX_RESPONSE_BYTES` | `1 MiB` | webhook 响应体。超出即丢弃响应（按无操作 + `warn`）。 |
| 逐 webhook `timeout_ms` | 操作者设定（默认 `2000`） | 单个请求。链是串行的，所以总最坏 ≈ `Σ timeout_ms`；自动会话启动的交接接受另外把整条决策链钳制在 750 ms。 |

## 8. 配置

`config.toml`：

```toml
[[admission_webhooks]]
name = "contributors"                                    # 稳定标识符（跳过列表 + 日志用）
url  = "http://contributors.memory.svc.cluster.local:8080/enrich"
timeout_ms = 2000                                        # 每请求
failure_policy = "ignore"                                # ignore | reject
events = ["write_page", "consolidate"]
blocking = true                                          # 同步运行；可改/可拒

[[admission_webhooks]]
name = "git-mirror"
url  = "http://git-mirror.memory.svc.cluster.local:8080/sync"
timeout_ms = 2000
failure_policy = "ignore"
events = ["write_page", "consolidate", "delete", "purge_project", "move_project"]
blocking = false                                         # 写入后即发即忘；绝不阻塞写入
```

### `blocking`（默认 `true`）

webhook 非**阻塞**即**非阻塞**：

- **`blocking = true`（默认）**——在写入路径内*同步*运行。它可以改页面（`write_page`/`consolidate`），`reject` 失败中止写入。写入等它（至多 `timeout_ms`）。用于增强器/校验器（如 `contributors`、`validate-no-secrets`）。
- **`blocking = false`**——在持久操作**完成之后**即发即忘派发。对写入意味着最终页面已在磁盘并在 SQLite 建了索引；对删除意味着文件与索引行已消失；对项目清除意味着 DB 清除已完成且文件系统移除已尝试；对项目移动意味着目录与 DB 行现在指向目标 workspace。引擎不等它、忽略其响应，所以它**不能改也不能拒**——只观察/镜像最终状态。用于纯备份/镜像（如 `git-mirror`），让慢的或宕掉的汇永不给写入加延迟。仍然尊重 `events` 与跳过列表。

阻塞链是串行的，所以总最坏写入延迟是**阻塞** webhook 上的 `Σ timeout_ms`；非阻塞的不加。

即发即忘派发有界：每进程至多 **256** 个在途请求，超出即丢弃并记日志而不是排队（持久操作已完成，调用方不会被拖住）。交接生命周期 op 上——`handoff_begin`、`handoff_accept`、`handoff_cancel`——只有 `reject` 策略 webhook 被等待，所以 `blocking = true` 加 `failure_policy = "ignore"` 的钩子在那里也即发即忘派发、共享那个预算：持续负载下它同样可能被丢弃。这样的丢弃按 ERROR 记日志（非阻塞的按 WARN）。那些 op 上绝不能被丢的钩子需要 `failure_policy = "reject"`——那使它成为决策者：操作之前被等待、能够拒绝。

环境变量覆盖：

```bash
AI_MEMORY_ADMISSION_WEBHOOKS_JSON='[{"name":"contributors","url":"http://contributors.memory.svc.cluster.local:8080/enrich","timeout_ms":2000,"failure_policy":"ignore","events":["write_page","consolidate"],"blocking":true}]'
```

JSON 环境变量是 webhook 列表的规范形式，因为 figment 环境层不能可靠地从索引式嵌套变量重建 `Vec<Struct>`。

空配置 = 不接链 → 每次写入零开销（不建客户端、无逐写入分支）。

## 9. 示例

### 变更型：把写入者追加进 `frontmatter.contributors`

```jsonc
// POST /enrich
{
  "page": { "path": "gotchas/x.md", "frontmatter": { "title": "X" }, "body": "..." },
  "ctx":  { "workspace": "default", "project": "ai-memory-ops",
            "actor": { "agent": "claude-code", "user": "djalmajr", "client": "72836f52-..." }, ... }
}

// → 200 OK
{
  "page": {
    "frontmatter": {
      "title": "X",
      "contributors": [
        { "agent": "claude-code", "user": "djalmajr", "client": "72836f52-...",
          "first_seen": "...", "last_seen": "...", "writes": 1 }
      ]
    }
  }
}
```

引擎在持久化之前用返回的对象替换 `frontmatter`。`body` 不动（响应里没有）。

### 副作用型：把写入镜像进外部 git 仓库

```jsonc
// POST /sync（同一请求体）
// → 204 No Content
```

webhook 把页面物化进外部仓库的本地克隆、批量提交、异步推送。引擎不等推送——只有本地入队在写入路径内于该 webhook 的 `timeout_ms` 之下运行。

## 10. 测试

`crates/ai-memory-wiki/tests/admission.rs` 对着 axum 环回服务器端到端覆盖线上契约。类别：

- 改 frontmatter 与正文正确传播。
- `204` 是无操作（frontmatter / 正文不变）。
- `failure_policy=ignore` 吞掉错误；`failure_policy=reject` 中止。
- 多 webhook 链按声明顺序运行；每个看到前一个的变更。
- `X-Memory-Skip-Admission-Chain` 短路具名钩子。
- `X-Memory-Op` 头按 op 正确设置。
- `op` 过滤：webhook 只在订阅的事件上触发。
- 构造时拒绝超过 `MAX_ADMISSION_WEBHOOKS`。
- `MAX_RESPONSE_BYTES` 钳制丢弃超限响应。
- `workspace` / `project` 解析传播进 payload。

`crates/ai-memory-wiki/src/wiki.rs::tests::write_page_resolves_workspace_and_project_names_for_chain` 覆盖集成路径（`Wiki::write_page` → 存储读器解析 → 链 → 记录的 payload）。

## 11. 源码里看哪里（规范规格）

| 概念 | 文件:行 |
|---|---|
| `AdmissionContext` / `ActorContext` / 线上结构 | `crates/ai-memory-wiki/src/admission.rs` |
| `AdmissionChain::run`（热循环） | `crates/ai-memory-wiki/src/admission.rs` |
| `write_page` 内的调用（解析 + 链调用） | `crates/ai-memory-wiki/src/wiki.rs::Wiki::write_page` |
| 配置 schema（`[[admission_webhooks]]`） | `crates/ai-memory-cli/src/config.rs::Config::admission_webhooks` |
| 服务器接线（`with_admission_chain` + `with_store_reader`） | `crates/ai-memory-cli/src/commands/serve.rs` |
| 头 → `ActorContext` 映射（mcp-auth → 引擎） | `crates/ai-memory-mcp/src/actor.rs` |

## 12. 非目标（计划中的迭代，不是阻塞项）

- **并行扇出。** 链今天刻意串行——那样变更组合才是良定义的。未来给纯副作用 webhook（不期望改正文）加 `parallel = true` 可能，但不在范围内。
- **webhook 发现/动态注册。** 钩子由操作者在配置里点名。未来 `/admin/admission-webhooks` POST 面可以想象，但这里明确出圈——单租户配置更简单，且与引擎对待其他每个扩展点（`[[etl_sources]]` 等）的方式一致。
- **逐 webhook 指标面。** 链今天经 `tracing` 记日志。经 `/admin/status` 暴露逐 webhook 计数器是自然的后续，但在这份契约之外。
