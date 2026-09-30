---
kind: as-built
title: Living Notes 审阅呈现面——intent→plan→delivered 投影
status: active
topics: [knowledge-and-context, observability, sdlc]
domains: [engineering-advisor, operating-advisor, product-advisor]
applies-when: |
  处理或消费组合后的切片/任务审阅呈现面——/api/review/* 路由、
  ComposedSliceReview 契约、其所投影的磁盘 SDLC 约定、分阶段审批锁、
  证明工件与 C1 头部、冻结导出、审阅证据的媒体服务，或跨主机 FLEET
  聚合（/api/review/fleet、fleet composer 的 union/one-count 接缝、
  v0.4.6 MH-5）。
siblings: [content-surfaces.md, workspace-primitive.md, mission-control.md]
prerequisite-reads: [workspace-primitive.md]
last-verified-against-source: c8341f72
last-updated: 2026-07-08
---


审阅呈现面是**磁盘 markdown 到每切片一个可审阅结构的纯投影**：INTENT → PLAN → DELIVERED。智能体修改文件，守护进程重新投影；此处除两次刻意的审批盖章与冻结导出外，不写任何产品状态。随 0.4.4 living-notes 切片（19 signal layer、20 composer/surfaces、22 rig agents altitude、23 SDLC operationalization）以及将该呈现面收敛为本文所述单一结构的**纠正性重建**（2026-07-05/06）一并交付。以下全部内容已在 `bb5ad219` 验证。

## 1. 唯一契约——`ComposedSliceReview`

`packages/daemon/src/domain/review/types.ts` 定义了所有消费者共享的读取契约（切片 Review 标签页、任务 U5 行展开、For-You 展开——绝不为每个消费者另设第二个端点）：

- **identity + phase**：`slice`、`sliceId`、`title`、`missionId`、`phase`（五值，读取时派生：`locked > review > building > spec > intent`，`compose.ts` 中的 `derivePhase`）、`laneLabel`（SS14 词汇 INTENT / PLAN / BUILD / REVIEW / LOCKED）。
- **`intent`**：`{text, media[], ssotPath, degrade}`——切片 README 的 `## Intent` 小节逐字原文（`extractSection`），外加其中内嵌的媒体。
- **`plan`**：`{concise: {text, media[]}, lockedArtifacts[], lock, ssotPath}`——PRD 固定的 `## Mini-requirements` 层级 + 规划中的 mockup；固定工件集是**对 frontmatter 的一次读取**（切片 README 上的 `locked-artifacts:` 列表——不新增任何写入机制）；`lock` 是 spec 范围的分阶段审批盖章（§3）。
- **`delivered`**：`{items[], extraProof[], lock, proofDirPath}`——重新设计的联结（§4）：每个 `## Proof contract` 交付项与其精选证明媒体及 QA 记录的比对信号配对。`lock` 是 delivery 范围的盖章；`proofDirPath` 是深入完整 fix-loop 历史的入口。
- **保留的正交区块**：`needsYou`（两个来源、一个队列：智能体路由条目 ∪ 带内联证据的派生 ▲ 异常）、`agents`（按 scope 参数化的 `slice:<id> | mission:<id> | rig`——一个契约覆盖所有 scope）、`lineage`（`VerifyLineage`：candidate/merge/tip 事实 + 四道闸口的 `VerdictCell`，逐字渲染已记录的 token）、`defects`（切片外的媒体引用会显式浮现，绝不静默丢弃）、`composedAt`。

**纠正性重建删除的内容**（2026-07-05，创始人叫停的原始方案）：四个并行的可渲染结构（`sections`、`acceptance`、`compare`、`join`）与平级的 `green` 字段。它们不存在于类型、composer 输出、UI hook 或 fixture 中；daemon 路由测试断言这些键在线上缺席（`test/review-composer.test.ts`、`test/review-routes.test.ts`）。已记录裁决的 green 只在两处存活：每交付项的 `verified` 信号（§4）与任务台账的完成事实（§6）——绝不作为切片审阅结构。

## 2. Composer 与 gatherer 的拆分

- `compose.ts` 是**纯函数**：`(gathered inputs) → composed doc`；相同输入（包括调用方提供的 `nowIso`/git 事实）产生逐字节相同的输出——幂等性由构造保证，并由测试固定。
- `gather.ts`（`ReviewGatherer`）是非纯外壳：从磁盘读取切片文档与 `proof/*.md` 工件，从 SQLite 读取 attention/agent 行，从 frontmatter 读取审批盖章（与审计日志交叉核对，§3），从工作区默认仓库读取 git lineage 事实。每个不可读的来源都诚实降级（null / "unknown"）——composer 渲染的是具名降级，绝非编造内容。

## 3. 两把锁 = 已交付的分阶段审批盖章

`plan.lock` 与 `delivered.lock` 是**分阶段审批动词**的投影（`rig scope slice|mission approve --scope spec|delivery`——见 cli-reference 的 "SDLC control plane verbs"）：frontmatter 盖章（`approved-spec-by/-at`、`approved-by/-at`）由 daemon 侧写入，同时追加一条 append-only 的 `mission_control_actions` 审计行（不存在半盖章）。gatherer 将每个盖章与固定的 scope 审批 `audit_notes_json` 形状（`approval_scope` + scope 身份）交叉核对；没有匹配行的盖章投影为 `auditVerified: false`，并渲染为 UNVERIFIED 盖章——可见，但绝不阻断。审批是冻结/签核，**绝非**已证明的 green（BR-6）。

## 4. DELIVERED——承诺 ↔ 精选证明 ↔ 已验证

`composeDelivered` 将 PRD 的 `## Proof contract` 复选框条目（`extractProofContract`；复选框行上可选的 markdown 图片成为该交付项的 `plannedRef` mockup）联结到 `<slice>/proof/` 中以 C1 为头部的证明工件：

- 当工件的 C1 `evidences:` 列表点名了某条目（精确文本或 1 起始索引）时，该工件**覆盖**该交付项。
- `verified` 绑定到已交付的 C1 字段，绝非仅凭存在性：**verified** = 覆盖它的 `qa|adjudication` 工件记录了比对（`self_check`）且其记录的裁决为通过；**unverified** = 存在覆盖工件，但没有通过的已记录 QA 比对（QA 退回原因的 `note` 仍会浮现）；**missing** = 已承诺而未交付任何内容。三者都是渲染状态——构造上即 fail-open。
- 精选证明集是覆盖工件的正文媒体引用（`ProofArtifact.mediaRefs`，由 `rig proof add --media` 或工件正文中的 markdown 引用填充），规范化为切片相对路径；逃逸出切片目录的引用成为 `defects` 发现项，绝不被服务或内联。未映射工件的媒体以有界的 `extraProof` 渲染。
- ▲ 证明不足的 NEEDS-YOU 异常由 delivered 的 MISSING 计数触发（`deriveExceptions`）。

## 5. 路由、冻结与媒体服务

- `packages/daemon/src/routes/review.ts`，挂载于 `/api/review`（`server.ts` 路由挂载）：`GET /slice/:name`、`GET /mission/:name`、`GET /rig`（OPR.0.4.4.22 rig-agents altitude 根端点）、`GET /agents?scope=slice:<id>|mission:<id>|rig`、`POST /freeze`。
- **Freeze**（`freeze.ts`）：唯一的同步"组合并冻结"路径，在交付盖章 + 审计行提交之后调用。将组合后的审阅渲染为单个自包含的 HTML 文件（切片目录中的 `REVIEW-<id>-<date>.html`）：CSS 内联；图片在切片目录约束内以 data-URI 内联（resolve-prefix + realpath——traversal/symlink 引用会渲染为静默处理的切片外分支，绝不内联）；视频以链接 + poster 呈现。经允许列表管控的原子写入服务独占创建；重复调用是幂等 no-op；渲染失败绝不撤销审批。携带 `MISSION_BRIEF.md` 的遗留任务仍可能获得按小节划分的 brief-spine 折叠；新脚手架不会创建那个已退役的 web-UI 时代文件。
- 审阅证据的**媒体服务**在两类资产路由族上都支持 range（iOS Safari 一类的播放器要求 `206`）：`GET /api/files/asset`（`routes/files.ts`——单 range 解析、`206`/`416`、`Accept-Ranges: bytes`；`.html` 仅在显式 `?render=1` 选择加入时才以 text/html 渲染）与 `GET /api/slices/:name/proof-asset/*`（`routes/slices.ts`——经 `fileAssetResponse` 提供相同的 range 语义，由纠正性 QA fixback 加入；保留不可变缓存姿态）。

## 6. 任务与 rig 层级

`composeMissionReview` 逐切片消费 `{review, green}` 条目：看板（按阶段绑定的单元格重新绑定到收敛后的契约——spec 盖章状态、delivered n/m、GREEN·merge 对、盖章）、完成**台账**（对切片集的查询，绝非人工编写的列表；此处的 `green` 是来自 `computeRecordedGreen` 的已记录裁决事实——regime 1 = 四道闸口裁决全部通过，regime 2 = 裁定通过）、`cutComplete`（仅当 cut 内每个切片都 green、已合并且开放 needs-human 条目为零时才为 TRUE），以及并集 NEEDS-YOU（按身份去重——同一条目从 N 个层级看到仍是一条）。`composeRigAgents` 提供独立的 rig 层级（roster ∪ recently-holding，park/health/settled 取自队列流转记录日志）。

## 7. FLEET 层级——跨主机聚合的 SIBLING（v0.4.6，OPR.0.4.6.MH5）

`GET /api/review/fleet` 把每个已注册主机组合后的 ▲/● 集聚合为一次按异常管理的一览。它是一个 **sibling 聚合端点**，绝不是第四个 `AgentsScope` 值（arch Q2）：scope 语法严格保持 `slice:* | mission:* | rig`，本地 composer 保持为本地状态上的纯函数。`domain/review/fleet-compose.ts` 是唯一允许导入 hosts transport/registry 的 review 域模块——这一边界由 `review-import-audit` 静态测试机械化强制（零 I/O 的 `fanout-contract` 类型模块是其他位置唯一被允许列表放行的 hosts 导入）。

**扇出已组合的集合**（arch Q1）：▲ 各类别是在各自主机的时钟上按时间派生的，因此 fleet 根对每个主机已组合完成的 rig 根做扇出（经 `remoteJsonRequest` 调用 `GET /api/review/rig`，在具名 read-class 截止时间内并发；本地主机经同一 gatherer 在进程内加入——零自传输），之后只做**并集 + 主机维度 + 计数**。它从不重新计算异常真相（composer 经测试固定为与时钟无关），因此跨主机时钟偏移永远无法扭曲某个 ▲。单主机失败降级为封闭的 `PerHostStatus` 诚实契约；失败主机的计数在其 `FleetHostRollup` 中缺席——在类型上就是缺席而非零。

**跨主机的 one-count**（arch Q4）：去重 `Set` 只存在于 fleet composer 这一处，以 `hostId|identity` 为键（在展开的抽屉上逐字渲染）；主机内的多层级可见性收敛为一行并带 `seenFrom` 来源；MH-3 转发的 qitem 只存在于其来源主机的 DB 中，因此构造上不会重复计数。

**组合钉死接缝**（arch Q3，经验法则）：单边性（sidedness）与调用方决定 TRANSPORT 接缝（MH-4 的 CLI 直连动词）；当存在组合时——fleet 的 union/one-count 是一条正确性规则——接缝固定在 daemon 侧：唯一 composer、一个端点，每个消费者（今天的 `/fleet` 路由页面与 FLEET 区块经共享的 `useFleet` hook；TUI/CLI 的 fleet 消费者为具名后续项）读取同一个。UI 节奏采用有界的具名 `FLEET_POLL_INTERVAL_MS`，带 feed-cadence 级别的下限；ambient 区块以 fleet 是否存在来闸控其 FETCH（FS-1 放大器纪律；规模化启用仍由 FS-1 发布验证闸口把关）。只读 + 呈现：要对远程主机的条目采取行动，走 MH-3/MH-4。

## 8. 它所投影的磁盘约定（SDLC 控制平面）

该呈现面所投影的，是 OPR.0.4.4.23 运营化的 markdown 控制平面形状——约定 SSOT 为 `docs/reference/sdlc-conventions.md`：`## Intent`（README）/ `## Mini-requirements` + `## Proof contract`（PRD）/ `proof/` 的 C1 头工件 + `PROOF.md`，由 `rig scope slice create` 为每种模板类型搭好脚手架，由 `rig scope audit` 做仅建议性检查（外加 `rig doctor` 的 SDLC 行）。该呈现面的 UI 一半（切片 Review 标签页、任务看板、For-You 审批 + 聊天）记录在 [`../ui/project-and-for-you.md`](/as-built/ui/project-and-for-you/)。
