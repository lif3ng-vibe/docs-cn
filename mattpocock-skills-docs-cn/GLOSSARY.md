# Matt Pocock Skills 中文文档术语表（翻译统一口径）

## 不译名单（保留英文原词）

| 英文 | 处理 |
|---|---|
| skill / 技能名（tdd、grill-me、to-spec…） | 技能名不译；「技能（skill）」首现注英文 |
| Claude Code、Codex、Cursor CLI、GitHub、Linear、GitLab | 产品名不译 |
| ADR | 不译，首现注「架构决策记录（ADR）」 |
| CONTEXT.md、CLAUDE.md、AGENTS.md | 文件名不译 |
| red-green（红-绿） | 译作「红-绿」，保留 red-green 注释一次 |
| tracer bullet | 译作「曳光弹（tracer bullet）」 |
| AFK | 不译（away from keyboard 缩写已是行话） |
| vibe coding | 译作「氛围编程（vibe coding）」 |
| CRUD、MCP、TDD、PR | 不译 |
| token | 不译 |
| worktree | 不译（git 术语），可注「工作树」 |

## 译名（英文 → 中文）

| 英文 | 中文 |
|---|---|
| agent | 智能体 |
| session | 会话 |
| sub-agent / subagent | 子智能体 |
| issue tracker | 工单追踪器（issue tracker） |
| issue | 工单（issue）；**不用**「ticket」泛称（见下） |
| ticket | 工单；仅引用外部系统原话或「决策工单（Decision ticket）」时用原词 |
| spec | 规格（spec） |
| seam | 接缝（seam） |
| grilling / grill | 追问（grilling）；「追问会话」= grilling session |
| grill-me 等技能的 interview | 访谈 / 面试式提问，按语境 |
| domain model | 领域模型 |
| domain modeling | 领域建模 |
| ubiquitous language | 统一语言 |
| shared language | 共享语言 |
| deep module | 深模块 |
| deepening | 加深（deepening） |
| ball of mud | 泥球 |
| code review | 代码评审 |
| Standards axis / Spec axis | 「标准轴（Standards）」/「规格轴（Spec）」 |
| feedback loop | 反馈回路 |
| diagnosis / diagnosing | 诊断 |
| triage | 分诊 |
| label | 标签 |
| decision ticket | 决策工单（Decision ticket） |
| wayfinder map | wayfinder 地图 |
| prototype | 原型 |
| research | 调研 |
| survey | 勘察 |
| handoff | 交接 |
| questionnaire | 问卷 |
| wizard | 向导 |
| context window | 上下文窗口（context window） |
| context | 上下文 |
| compaction | 压缩（compaction） |
| clearing | 清空（clearing，指清会话上下文） |
| effort | 用力度（effort） |
| smart zone | 聪明区（smart zone） |
| harness | 框架/脚手架（harness），按语境 |
| primary source | 一手来源 |
| secondary source | 二手来源 |
| progressive disclosure | 渐进披露 |
| stateful / stateless | 有状态 / 无状态 |
| human-in-the-loop / HITL | 人在回路 |
| user-invoked / model-invoked | 用户调用 / 模型调用 |
| mock | mock（不译，测试术语） |
| vertical slice | 垂直切片 |
| horizontal slicing | 水平切分 |
| implementation-coupled | 实现耦合 |
| tautological | 同义反复 |
| anti-pattern | 反模式 |
| materialization cascade | 物化级联 |
| issue tracker | 工单追踪器 |
| backlog | 已弃用词，不译入正文（上游已弃用） |
| orchestrat(e|ion) | 编排 |
| verbosity | 啰嗦 |
| misalignment | 错位 |
| alignment | 对齐 |
| skeleton | 骨架 |
| blocking edges | 阻塞边 |
| landing | 落地 |

## 排版约定

- 中文全角标点，中英文/数字之间一个半角空格
- 引号用 ""（不用「」）；破折号——不带空格
- 代码、命令、路径、环境变量、配置键、API 名不译
- `#` 开头的 cli 命令清单注释要译；代码块内工具输出保留原样
