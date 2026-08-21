---
title: "agentmemory 调研报告"
description: "agentmemory 是面向 AI 编码智能体的持久记忆基础设施。核心卖点：智能体在编码会话期间静默捕获你做的事（工具调用、提示词、决策、错误）。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/research-agentmemory.md"
---

# agentmemory 调研报告

> 源项目：`rohitg00/agentmemory`（TypeScript，构建在 `iii-engine` 上的 MCP 服务器）。
> 本仓库在那个更早的 TypeScript 项目之上构建：保留*想法*，替换*基底*。

## 1. 目的与范围

agentmemory 是**面向 AI 编码智能体的持久记忆基础设施**。核心卖点：智能体在编码会话期间静默捕获你做的事（工具调用、提示词、决策、错误），把这些原始观察压缩成可检索的记忆，并把相关上下文重新注入*下一个*会话，让用户永不用重新解释架构、偏好或过去的 bug。README 打出的口号（「你的编码智能体记得一切。不用再重新解释。」）附带宣称的检索指标：LongMemEval-S 上 R@5 95.2%（对 BM25-only 回退的 86.2%），每会话约 1,900 token（对裸 CLAUDE.md 的约 22K）。

作者明确把它框定为 Karpathy「LLM Wiki」模式的*实现*，扩展了置信度打分、生命周期、知识图谱与混合检索——项目页宣传那篇阐述设计的爆款 gist 有 1200+ star。

关于 `DESIGN.md` 的告示：agentmemory 里那份文件是营销站受兰博基尼启发的*视觉*设计系统，不是架构。真正的架构文档在 `AGENTS.md` 与 `README.md`。

`ROADMAP.md` 证实了轨迹：2026 Q2「深度」（多模态）、Q3「广度」（更多智能体、OpenSSF）、Q4「信任」（SSO/RBAC）、2027 Q1 v1.0 冻结。2027 Q1 候选项：*「第二语言的参考实现（Rust 或 Go）」*——与本项目直接相关。

## 2. 架构

- **技术栈**：TypeScript（ESM，Node ≥ 20），打包为 `@agentmemory/agentmemory`。经 `tsdown` 构建。
- **不是独立服务器**。一切构建在 **iii-engine** 之上——一个单独安装的 Rust 二进制，跑在 `ws://localhost:49134`，提供 Worker/Function/Trigger 原语（`AGENTS.md:5`）。Node 进程注册函数；引擎路由它们。这是该项目核心的架构赌注。
- **存储**：单一**基于文件的 SQLite KV 存储**，由 iii-engine 的 StateModule 拥有，而非 Node 进程。来自 `iii-config.yaml:11-16`：
  ```yaml
  - name: iii-state
    config:
      adapter: { name: kv, config: { store_method: file_based, file_path: ./data/state_store.db } }
  ```
  Node 代码只看到一个很小的垫片（`src/state/kv.ts:6-46`），包了五个 RPC（`state::get/set/list/update/delete`）。没有直连 SQLite、没有 Postgres、没有 Qdrant、没有图数据库——*所有*记忆类型都存成命名空间化「scope」下的 JSON 值（如 `mem:memories`、`mem:semantic`、`mem:graph:nodes`）。
- **索引住在进程内**：BM25（`src/state/search-index.ts`）、带余弦相似度的内存向量索引（`src/state/vector-index.ts`）、以及经 `IndexPersistence` 写回 KV 的持久快照（`src/state/index-persistence.ts`）。混合检索用 BM25 + 向量 + 图的 RRF 式融合（`src/state/hybrid-search.ts`）。
- **面**：`:3111` 上的 REST API（124 个端点——`src/triggers/api.ts`）、stdio 上的 MCP 服务器经 `npx @agentmemory/mcp`（`src/mcp/server.ts`，约 62KB，`src/mcp/tools-registry.ts` 里 53 个工具）、`:3112` 上的实时 WebSocket 流、`:3113` 上的实时查看器 HTML。
- **KV scope 目录**：`src/state/schema.ts:3-50` 列出约 40 个 scope（sessions、逐会话 observations、memories、summaries、semantic、procedural、graph:nodes/edges、insights、lessons、crystals、sketches、sentinels、actions、leases、routines、signals、checkpoints、mesh、slots、retention、accessLog、audit、imageRefs 等）。广度惊人——但全在一个 SQLite 文件里。

## 3. 记忆模型

系统有许多记忆*类型*，大致组织成 `types.ts:429` 显式声明的四层整编层级：
```ts
export type ConsolidationTier = "working" | "episodic" | "semantic" | "procedural";
```

- **原始观察**（`RawObservation`，`types.ts:29-42`）：每次工具调用的钩子捕获。
- **压缩观察**（`types.ts:44-62`）：LLM（`mem::compress`）输出的结构化 XML，含 `type`、`title`、`facts`、`narrative`、`concepts`、`files`、`importance` 1–10。*关键在于*这个 LLM 压缩默认关闭（`src/index.ts:245-253`，issue #138）。默认路径用**合成**压缩（`src/functions/compress-synthetic.ts`）——零 LLM 调用——让 token 账单保持清醒。设 `AGENTMEMORY_AUTO_COMPRESS=true` 选择启用。
- **记忆**（`types.ts:81-101`）：整编后的长期条目，带 `type`（pattern/preference/architecture/bug/workflow/fact）、`strength`、`version`、`supersedes`、`isLatest`。就地版本化——旧记忆 `isLatest=false`，新条目保持 `parentId`/`supersedes` 链（`src/functions/consolidate.ts:159-191`）。
- **语义记忆**（`types.ts:435-446`）：带置信度 + 访问计数的单条*事实*。
- **程序记忆**（`types.ts:448-462`）：带步骤 + 触发条件的具名流程。
- **教训 / 洞察 / 结晶（Crystal）**：更高一层的蒸馏。结晶（`crystallize.ts`）把已完成 Action 链总结为叙事 + 关键结果 + 教训；教训喂给 Reflect，后者从概念簇产出洞察。
- **记忆槽位**（`types.ts:222-232`，`functions/slots.ts:13-83`）：置顶的可编辑文本块（persona、user_preferences、project_context、guidance、pending_items 等）——Karpathy wiki 式的可人工编辑小节。总是经 `src/functions/context.ts:43-61` 注入上下文。

**自动操作（无需手工写入）：**

- `mem::observe` 从每次工具调用的 `PostToolUse` 钩子运行——隐私剥离、去重、可选 LLM 压缩、索引、实时流（`functions/observe.ts:42-280`）。
- `src/index.ts:491-531` 的 `setInterval` 定时器：每 1h 自动遗忘、每 24h 教训衰减、每 24h 洞察衰减、每 2h 整编管线。
- `mem::auto-forget`（`functions/auto-forget.ts`）：删除 TTL 过期的记忆、软删除矛盾对（Jaccard 相似度 > 0.9）、清除 180 天且 importance ≤ 2 的观察。
- `mem::retention-score`（`functions/retention.ts:80-94`）：留存 = `salience * exp(-λ·Δt) + reinforcementBoost(accessLog, σ)`。低于「冷」阈值（0.15）的条目变为可驱逐。强化加成（`computeReinforcementBoost`）对 `1/daysSinceAccess` 求和——经典间隔重复。

## 4. 重组 / 整编（Karpathy 的部分）

这是最有趣的部分。整编管线在 `CONSOLIDATION_ENABLED=true` 时按 2h cron 运行（`src/index.ts:523-531`）。`functions/consolidation-pipeline.ts:50-269` 编排四层：

1. **语义层**：取最近 20 条 `SessionSummary`，让 LLM 提取 `<fact confidence="x">…</fact>` 条目。既有事实（不区分大小写匹配）`accessCount++` 且 `confidence = max(old, new)`；新的成为 `SemanticMemory` 行（`consolidation-pipeline.ts:91-122`）。
2. **反思层**：`mem::reflect`（`functions/reflect.ts`）走知识图、按度数 BFS 建概念簇（`buildGraphClusters`，无图时第 106 行回退 Jaccard 聚类）、把每簇的事实 + 教训 + 结晶连同 `REFLECT_SYSTEM` 提示词喂给 LLM，期望返回 `<insight>` XML。既有洞察（按内容指纹）`reinforcements++` 且 `confidence += 0.1*(1-confidence)`（reflect.ts:26-35）；新洞察带 `decayRate=0.05/week` 存储。
3. **程序层**：找 `frequency >= 2` 的 `pattern` 型 Memory 行，提取带步骤的具名 `<procedure>` 块。
4. **衰减层**：在可配置的不活跃窗口后应用几何衰减 `strength *= 0.9^decayPeriods`（`applyDecay`，consolidation-pipeline.ts:21-43）。

另外，`mem::consolidate`（`functions/consolidate.ts:65-225`）按概念分组观察、每概念选最重要的前 N、并对每簇要么*创建*一条 Memory 要么*演化*既有一条。演化 = 旧的标 `isLatest=false`、写一条新行经 `supersedes` 与 `parentId` 指向它（161-189 行）。旧记忆不删——保持有版本但被遮蔽，读取时按 `isLatest` 过滤。

`mem::insight-decay-sweep`（`functions/reflect.ts:425-476`）每周运行：`newConfidence = confidence - decayRate * weeksSince`。低于 0.1 且零强化则软删除。

这真是 Karpathy wiki 形状的：**记忆不是只追加——它们经版本化取代被就地重写，未用的条目悄悄淡出。**

## 5. 智能体集成

三个面，取决于宿主支持什么：

- **钩子（Claude Code、Codex）**：`src/hooks/` 里 12 个钩子脚本——独立 Node 脚本，从 stdin 读 JSON 并以 3s 超时 POST 到 `/agentmemory/observe`。`plugin/hooks/hooks.json` 注册全部 12 个（SessionStart、UserPromptSubmit、PreToolUse、PostToolUse、PostToolUseFailure、PreCompact、SubagentStart/Stop、Notification、TaskCompleted、Stop、SessionEnd）。Codex 得到 6 钩子的子集（`README.md:419`）。
- **MCP 工具**：`src/mcp/tools-registry.ts` 里 53 个——`memory_recall`、`memory_smart_search`、`memory_save`、`memory_sessions`、`memory_consolidate`、`memory_action_create`、`memory_lease`、`memory_signal_send`、`memory_crystallize` 等。默认只 8 个可见（`AGENTMEMORY_TOOLS=all` 暴露其余，AGENTS.md:114）。
- **技能**（斜杠命令）：`plugin/skills/{recall,remember,handoff,recap,forget,session-history,commit-context,commit-history}/SKILL.md`——每个是宿主解析 frontmatter 的 markdown 文件。
- **系统提示词注入**：pre-tool-use 与 session-start 钩子可向 stdout 写至多 4000 字符的记忆上下文，Claude Code 把它前置到下一回合。**默认关闭**（`AGENTMEMORY_INJECT_CONTEXT=false`），因为 token 燃烧抱怨（#143，见 `src/hooks/pre-tool-use.ts:9-22`）。

## 6. 跨智能体交接

两个机制：

- **`/handoff` 技能**（`plugin/skills/handoff/SKILL.md`）：找 `cwd` 匹配你当前目录（带正确的路径边界检查）的最近会话，先浮出未回答的问题，再取回热门概念的召回。这之所以*可行，是因为所有智能体写同一个 `:3111` 服务器*——同项目里的 Claude Code 会话与 Codex 会话共享 KV。跨智能体召回是隐式的。
- **信号**（`functions/signals.ts`）：类型化的智能体间消息总线，带 `from`/`to`/`threadId`/`type: handoff|request|response|alert|info` 与 TTL。`mem::signal-send` + `mem::signal-read` MCP 工具。
- **Mesh 同步**（`functions/mesh.ts`）在不同机器的 agentmemory *服务器*之间做 LWW 合并复制，但单机跨智能体就是共享 SQLite。

路线图明确把「跨智能体共享记忆命名空间」列为 2026 Q3 候选、「智能体间记忆交接协议」列为 2026 Q4——所以当前支持是非正式的。

## 7. 自愈 / 运维

- **备份**：`mem::snapshot-create`（`functions/snapshot.ts:44-150`）把 sessions + memories + graphNodes + observations + accessLogs 倒进一个 `state.json` 并 `git commit` 进可配置目录。可配置间隔 cron。每个快照带含 commitHash 的 SnapshotMeta。还有 `mem::snapshot-diff`。git 当备份很聪明。
- **迁移**：`mem::migrate`（`functions/migrate.ts`）读遗留 `better-sqlite3` DB 并经 KV 层重放，带路径允许列表守卫（只允许 `~/.agentmemory/` 之下）。
- **schema 版本化**：显式的 `ExportData.version` 联合类型有 50+ 字符串字面量（`types.ts:296`）加 `export-import.ts` 的 `supportedVersions`。更新它要改 6 个文件（AGENTS.md:28-34）。
- **向量索引损坏守卫**：启动时 `src/index.ts:367-410` 在持久化向量维度混杂时*拒绝启动*，带结构化的修复指引。漂亮的防御性代码。
- **诊断**：`mem::diagnose`（`functions/diagnostics.ts`）跑 8 类检查（孤儿租约、依赖全完成的阻塞 action、死 sentinel……），`mem::heal` 自动修可修的。
- **审计**：每个改状态的操作记录进 `KV.audit`，带类型化操作联合（`types.ts:493-539`，约 45 个 op 类型）。`AGENTS.md:39-41` 把新增设为强制。
- **韧性**：顶层 `unhandledRejection` 吞掉并限流记日志（`src/index.ts:118-128`），以挺过 iii-engine 超时尖峰（#204）。断路器 + 回退链提供方（`src/providers/`）。

## 8. 好的与缺失的——诚实评价

**聪明且值得复用的：**

- **两层压缩（默认合成、LLM 选择启用）**：#138 的修复是对的。默认零 LLM 让 token 账单清醒同时保留 BM25/向量检索。关键教训——别把 LLM 调用做成强制。
- **版本化的就地记忆演化**（`isLatest` + `supersedes` 链）：正是 Karpathy wiki 重写模式。比维护单独的「坟场」便宜，`parentId` 让历史可查。
- **留存即公式**而非规则：`salience * exp(-λΔt) + Σ(σ/daysSinceAccess)`。可调、有原则、可批处理。值得整体照搬。
- **三流 RRF 检索**（BM25 + 向量 + 图）：图走查作第三信号不常见，基准数字（95.2% R@5）表明它有回报。
- **git 当快照备份**：倒 state.json、`git commit`。可 diff、可恢复、无需 DB 专属工具。
- **槽位**：置顶、可人工编辑、总是注入的 wiki 式小节。用户可以手编 `project_context` 且它永远存活——纯涌现记忆之外的干净逃生口。
- **钩子脚本是独立 Node 文件**（无 SDK 导入，只有 HTTP）：启动快、容错。800ms-1500ms 的硬超时（`src/hooks/session-start.ts:27-28`）是显式的——#221 有个无界钩子扇出把 iii-engine OOM 杀掉的事故。
- **观察边界的隐私过滤器**（任何持久化之前 `stripPrivateData`）：纵深防御。

**感觉过度设计的：**

- **约 40 个 KV scope、53 个 MCP 工具、124 个 REST 端点、50+ 个 iii 函数**，对 v0.9 来说面*太大*了。许多显得投机（sentinels、sketches、frontier、leases、routines、checkpoints、facets、crystals、mesh、branch-aware、flow-compress、vision-search）。AGENTS.md 那些「必须更新以下所有」的 7 步清单是个坏味道——系统太宽，普通变更波及甚远。
- **iii-engine 依赖**：每次安装都要求一个单独的 Rust 二进制、钉住特定版本（0.11.2；0.11.6 搞坏过他们）、没有规范的 Windows 安装器（`README.md:549`）。对 Rust 重写这是*自包含的强论据*：直接内嵌 SQLite、丢掉引擎。
- **全 JSON 存进一个大 SQLite 文件**：每个「memories」或「graph nodes」列表操作都是 `state::list` → 返回*全部* JSON、Node 里解析、内存里过滤。`auto-forget.ts:67` 字面上把上限设为最近 1000 条记忆，因为 O(N²) 的 Jaccard 循环。没有合适索引过不了约 1 万条记忆。
- **LLM 输出里到处是 XML**：`<memory>...</memory>`、`<temporal_graph>`、`<insight>`。脆弱的正则解析（`parseCompressionXml`、`parseTemporalGraphXml`）。schema 校验的 JSON / 结构化输出路径会更稳。
- **DESIGN.md 是给网站的**，不是架构。架构散在 AGENTS.md、README.md 与行内注释里。没有真正的 `ARCHITECTURE.md`。

**Rust 竞争者应当改进的缺失项：**

1. **一等公民的内嵌存储。** 用 `rusqlite`（或 `sqlx` + SQLite/Postgres）配*真正的索引与 FTS5*，而不是 KV 里的 JSON blob。留存/自动遗忘逻辑配得上真正的 WHERE 子句，不是内存过滤。向量看看 `sqlite-vec` 或 `lancedb`，别自己维护 Map<String, Vec<f32>>。
2. **自包含二进制。** 不要单独的引擎。一个*就是* MCP 服务器、REST 服务器与存储的 `agentmemory` 二进制。iii-engine 间接层花掉可运维性，换来用户看不见的约等于零。
3. **原生 MCP 传输。** 用正经的 Rust MCP SDK；钩子和存储之间不需要 HTTP 垫片——钩子可以讲 MCP-over-stdio 或 Unix socket。砍掉 3s HTTP 超时和 bearer 认证舞蹈。
4. **一等公民的结构化输出。** 别解析 `<memory><type>...</type></memory>` 正则字符串。用 JSON-schema 约束生成；`serde_json` 反序列化加严格校验。
5. **更小更锋利的工具面。** 挑 8–12 个可证明要紧的工具（recall、save、sessions、smart_search、handoff、consolidate、forget、governance_delete）并做好它们。53 个工具的面招人困惑；README 承认默认只显示 8 个是有原因的。
6. **时间边的真图存储。** 时间图设计（`tvalid`、`tvalidEnd`、`supersededBy`、边历史）*很好*——但实现在 KV 的 JSON blob 上意味着每个「Alice 截至 2024-06-15 偏好什么」查询都是全表扫描。考虑内存 `petgraph` 背后是真 SQL 图表，要做大就上正经图数据库。
7. **跨智能体交接作为设计好的协议**、共享 SQLite。2026 Q4 路线图候选项正是这个——第一天就做到。定义带 from-agent、to-agent、context、open-questions、files-touched、model-used 的 `Handoff` 类型；暴露 `mcp::handoff/begin` 与 `mcp::handoff/accept`。
8. **可复现的评测框架。** 他们跑了 LongMemEval-S 拿到 95.2% R@5——把框架从第一天就烤进 CI，让回归被抓住。
9. **schema 单一事实源。** AGENTS.md 的「更新全部 7 个文件」清单表明 schema 重复散布在 types、tools-registry、REST、MCP、测试、README、plugin 里。Rust 里一份 proto 或派生驱动的定义可以生成全部。
10. **一份清晰的 `ARCHITECTURE.md`。** 别重蹈他们把架构散在 AGENTS、README、行内注释里的覆辙。

最大的结论：**agentmemory 的*概念*异常用心**——版本化取代、留存公式、槽位置顶、混合检索、选择启用的 LLM 压缩、按会话 cwd 的交接。*实现*受制于 iii-engine 赌注与全 JSON 进 KV 的存储选择。Rust 重写有真正的机会：留下想法、换掉基底。
